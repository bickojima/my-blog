/**
 * scripts/check-dependency-freshness.mjs
 *
 * npm 管理外依存の鮮度・EOL・完全性を判定する（SEC-40, Issue #132）。
 * `npm audit` / Dependabot が見ない依存（CDN の <script>、GitHub Actions、Node.js の
 * バージョン宣言、Cloudflare Pages のビルド環境）を棚卸しし、機械可読な結果 JSON を出す。
 *
 * 構成（CI の決定性とネットワーク取得を分離する）:
 *   1. collectInventory()   … リポジトリ内のファイルだけを読む（ネットワーク不要）
 *   2. fetchRemoteData()    … npm registry / endoflife.date / GitHub API / CDN 実体を取得
 *   3. evaluateInventory()  … 1 と 2 から ok / warning / alert を判定する純関数
 *   Vitest（tests/dependency-freshness.test.mjs）は 1 と 3 をフィクスチャで検証し、
 *   2 は呼ばない。`npm test` をネットワーク依存にしないため。
 *
 * 使い方:
 *   node scripts/check-dependency-freshness.mjs [--out-dir DIR] [--remote-fixture FILE]
 *        [--now ISO8601] [--fail-on alert|warning|never] [--root DIR]
 *   --remote-fixture を渡すとネットワークに出ず、その JSON をリモート応答として判定する
 *   （alert 経路の dry-run 検証用）。
 *
 * 終了コード: 0 = ok / warning、2 = alert（--fail-on で変更可）、1 = 判定不能（error）。
 * 依存パッケージは使わない（Node 組み込みのみ）。週次ワークフローで npm ci を不要にするため。
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const TASK_NAME = 'dependency-freshness';
export const SCHEMA_VERSION = 1;

const REPO_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONFIG_PATH = path.join(REPO_ROOT, 'scripts', 'dependency-freshness.config.json');
const USER_AGENT = 'my-blog/dependency-freshness (+https://github.com/bickojima/my-blog)';
const FETCH_TIMEOUT_MS = 20_000;
const MAX_CDN_BYTES = 30 * 1024 * 1024;

export const STATUS_RANK = Object.freeze({ ok: 0, manual: 0, warning: 1, unknown: 1, alert: 2, error: 3 });

// ---------------------------------------------------------------------------
// 純関数: バージョン比較・分類
// ---------------------------------------------------------------------------

/** "3.16.2" / "v4.2.1" -> {major, minor, patch}。正確な x.y.z 以外（範囲指定・タグ）は null。 */
export function parseExactSemver(value) {
  const match = String(value ?? '').trim().match(/^v?(\d+)\.(\d+)\.(\d+)$/);
  if (!match) return null;
  return { major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]) };
}

/** "v4" / "v4.2" / "4.2.1" / ">=22.12.0" -> 先頭のメジャー番号（数値）。取れなければ null。 */
export function parseMajor(value) {
  const match = String(value ?? '').match(/(\d+)/);
  return match ? Number(match[1]) : null;
}

/**
 * 固定バージョンと最新版の差を分類する。
 * @returns {'same'|'patch'|'minor'|'major'|'ahead'|'unknown'} と minor の差分
 */
export function compareVersions(current, latest) {
  const a = parseExactSemver(current);
  const b = parseExactSemver(latest);
  if (!a || !b) return { diff: 'unknown', minorsBehind: null };
  if (a.major !== b.major) return { diff: a.major < b.major ? 'major' : 'ahead', minorsBehind: null };
  if (a.minor !== b.minor) return { diff: a.minor < b.minor ? 'minor' : 'ahead', minorsBehind: b.minor - a.minor };
  if (a.patch !== b.patch) return { diff: a.patch < b.patch ? 'patch' : 'ahead', minorsBehind: 0 };
  return { diff: 'same', minorsBehind: 0 };
}

export function worstStatus(statuses) {
  return statuses.reduce((acc, s) => ((STATUS_RANK[s] ?? 1) > (STATUS_RANK[acc] ?? 0) ? s : acc), 'ok');
}

/** endoflife.date の releases から該当サイクルを判定する（playwright-home の閾値モデルを踏襲）。 */
export function evaluateEol(release, { now, warnDays, alertDays }) {
  if (!release) return { status: 'unknown', eolFrom: null, daysRemaining: null, message: 'endoflife.date に該当サイクルが無い' };
  const eolFrom = release.eolFrom || null;
  if (!eolFrom) {
    return release.isEol
      ? { status: 'alert', eolFrom: null, daysRemaining: null, message: 'EOL 済み（日付なし）' }
      : { status: 'ok', eolFrom: null, daysRemaining: null, message: 'EOL 日は未定（サポート中）' };
  }
  const daysRemaining = Math.ceil((new Date(`${eolFrom}T00:00:00Z`).getTime() - now.getTime()) / 86_400_000);
  if (release.isEol || daysRemaining < 0) return { status: 'alert', eolFrom, daysRemaining, message: `EOL（${eolFrom}）を経過済み` };
  if (daysRemaining <= alertDays) return { status: 'alert', eolFrom, daysRemaining, message: `EOL まで ${daysRemaining} 日（${eolFrom}）` };
  if (daysRemaining <= warnDays) return { status: 'warning', eolFrom, daysRemaining, message: `EOL まで ${daysRemaining} 日（${eolFrom}）` };
  return { status: 'ok', eolFrom, daysRemaining, message: `EOL まで ${daysRemaining} 日（${eolFrom}）` };
}

/** integrity 属性（"sha384-xxx sha512-yyy"）を分解する。 */
export function parseIntegrity(value) {
  if (!value) return [];
  return String(value).trim().split(/\s+/)
    .map((token) => token.match(/^(sha256|sha384|sha512)-([A-Za-z0-9+/=]+)(?:\?.*)?$/))
    .filter(Boolean)
    .map((m) => ({ algorithm: m[1], digest: m[2] }));
}

/** ブラウザと同じく最も強いアルゴリズムの値で照合する（SRI 仕様）。 */
export function strongestIntegrity(entries) {
  const order = { sha256: 1, sha384: 2, sha512: 3 };
  return [...entries].sort((a, b) => order[b.algorithm] - order[a.algorithm])[0] || null;
}

export function computeSri(buffer, algorithm = 'sha384') {
  return createHash(algorithm).update(buffer).digest('base64');
}

// ---------------------------------------------------------------------------
// 純関数: ファイル内容の解析
// ---------------------------------------------------------------------------

/** CDN URL から npm パッケージ名とバージョンを取り出す（unpkg / jsDelivr npm）。 */
export function parseCdnUrl(url) {
  let parsed;
  try { parsed = new URL(url); } catch { return null; }
  let rest;
  if (parsed.hostname === 'unpkg.com') rest = parsed.pathname.slice(1);
  else if (parsed.hostname === 'cdn.jsdelivr.net' && parsed.pathname.startsWith('/npm/')) rest = parsed.pathname.slice(5);
  else return { host: parsed.hostname, pkg: null, version: null };
  const match = rest.match(/^((?:@[^/@]+\/)?[^/@]+)(?:@([^/]+))?/);
  if (!match) return { host: parsed.hostname, pkg: null, version: null };
  return { host: parsed.hostname, pkg: match[1], version: match[2] ? decodeURIComponent(match[2]) : null };
}

/** HTML / Astro から外部 <script src> と <link rel=stylesheet href> を抽出する。 */
export function extractExternalResources(text, file) {
  const results = [];
  const tagPattern = /<(script|link)\b([^>]*)>/gi;
  let match;
  while ((match = tagPattern.exec(text)) !== null) {
    const tag = match[1].toLowerCase();
    const attrs = match[2];
    const attr = (name) => {
      const m = attrs.match(new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i'));
      return m ? (m[2] ?? m[3]) : null;
    };
    const url = tag === 'script' ? attr('src') : attr('href');
    if (!url || !/^https?:\/\//i.test(url)) continue;
    if (tag === 'link' && !/stylesheet|modulepreload/i.test(attr('rel') || '')) continue;
    const line = text.slice(0, match.index).split('\n').length;
    results.push({ file, line, tag, url, integrity: attr('integrity'), crossorigin: attr('crossorigin') });
  }
  return results;
}

/** ワークフロー YAML から `uses:` を抽出する（依存を増やさないため行単位で解析）。 */
export function extractWorkflowUses(text, file) {
  const results = [];
  text.split('\n').forEach((raw, index) => {
    const m = raw.match(/^\s*(?:-\s*)?uses:\s*['"]?([^\s'"#]+)['"]?\s*(?:#\s*(\S+))?/);
    if (!m) return;
    const spec = m[1];
    if (spec.startsWith('./') || spec.startsWith('docker://')) return;
    const at = spec.lastIndexOf('@');
    if (at < 0) {
      results.push({ file, line: index + 1, action: spec, repo: spec.split('/').slice(0, 2).join('/'), ref: null, isSha: false, versionComment: null });
      return;
    }
    const action = spec.slice(0, at);
    const ref = spec.slice(at + 1);
    results.push({
      file, line: index + 1, action,
      repo: action.split('/').slice(0, 2).join('/'),
      ref, isSha: /^[0-9a-f]{40}$/.test(ref),
      versionComment: m[2] || null,
    });
  });
  return results;
}

/** ワークフロー YAML から node-version / node-version-file を抽出する。 */
export function extractWorkflowNodeVersions(text, file) {
  const results = [];
  text.split('\n').forEach((raw, index) => {
    const v = raw.match(/^\s*node-version:\s*['"]?([^'"\s#]+)/);
    if (v) results.push({ source: `${file}:${index + 1}`, kind: 'node-version', value: v[1], major: parseMajor(v[1]) });
    const f = raw.match(/^\s*node-version-file:\s*['"]?([^'"\s#]+)/);
    if (f) results.push({ source: `${file}:${index + 1}`, kind: 'node-version-file', value: f[1], major: null });
  });
  return results;
}

// ---------------------------------------------------------------------------
// ローカル棚卸し（ファイル読み取りのみ）
// ---------------------------------------------------------------------------

function walk(dir, extensions, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const full = path.join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, extensions, out);
    else if (extensions.includes(path.extname(name))) out.push(full);
  }
  return out;
}

export function loadConfig(configPath = CONFIG_PATH) {
  return JSON.parse(readFileSync(configPath, 'utf8'));
}

export function collectInventory({ root = REPO_ROOT, config = loadConfig() } = {}) {
  const rel = (p) => path.relative(root, p).split(path.sep).join('/');

  const cdn = [];
  for (const dir of config.scan.cdnRoots) {
    for (const file of walk(path.join(root, dir), config.scan.cdnExtensions)) {
      for (const res of extractExternalResources(readFileSync(file, 'utf8'), rel(file))) {
        cdn.push({ ...res, ...parseCdnUrl(res.url) });
      }
    }
  }

  const actions = [];
  const workflowNode = [];
  const wfDir = path.join(root, config.scan.workflowDir);
  if (existsSync(wfDir)) {
    for (const name of readdirSync(wfDir).filter((n) => /\.ya?ml$/.test(n)).sort()) {
      const text = readFileSync(path.join(wfDir, name), 'utf8');
      const file = `${config.scan.workflowDir}/${name}`;
      actions.push(...extractWorkflowUses(text, file));
      workflowNode.push(...extractWorkflowNodeVersions(text, file));
    }
  }

  const nodeSources = [];
  for (const name of config.scan.nodeVersionFiles) {
    const p = path.join(root, name);
    if (!existsSync(p)) continue;
    const value = readFileSync(p, 'utf8').trim();
    nodeSources.push({ source: name, kind: 'version-file', value, major: parseMajor(value) });
  }
  const pkgPath = path.join(root, 'package.json');
  if (existsSync(pkgPath)) {
    const engines = JSON.parse(readFileSync(pkgPath, 'utf8')).engines?.node;
    if (engines) nodeSources.push({ source: 'package.json#engines.node', kind: 'engines', value: engines, major: parseMajor(engines) });
  }
  nodeSources.push(...workflowNode);

  return { cdn, actions, nodeSources, manualChecks: config.manualChecks || [] };
}

// ---------------------------------------------------------------------------
// リモート取得（Vitest では呼ばない）
// ---------------------------------------------------------------------------

async function fetchWithTimeout(url, init = {}, fetchImpl = fetch) {
  return fetchImpl(url, { ...init, redirect: 'follow', signal: AbortSignal.timeout(FETCH_TIMEOUT_MS), headers: { 'user-agent': USER_AGENT, ...(init.headers || {}) } });
}

async function fetchJson(url, init, fetchImpl) {
  const res = await fetchWithTimeout(url, init, fetchImpl);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.json();
}

export async function fetchRemoteData(inventory, { fetchImpl = fetch, githubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN } = {}) {
  const remote = { fetchedAt: new Date().toISOString(), npm: {}, advisories: {}, sri: {}, githubReleases: {}, endoflife: {} };

  for (const item of inventory.cdn) {
    if (item.pkg && !remote.npm[item.pkg]) {
      try {
        const doc = await fetchJson(`https://registry.npmjs.org/${item.pkg.replace('/', '%2F')}`, {}, fetchImpl);
        const latest = doc['dist-tags']?.latest ?? null;
        remote.npm[item.pkg] = {
          latest,
          latestPublished: latest ? doc.time?.[latest] ?? null : null,
          deprecated: Object.fromEntries(Object.entries(doc.versions || {}).filter(([, v]) => v.deprecated).map(([k, v]) => [k, v.deprecated])),
        };
      } catch (error) { remote.npm[item.pkg] = { error: error.message }; }
    }
    if (item.pkg && item.version && !remote.advisories[`${item.pkg}@${item.version}`]) {
      try {
        const body = await fetchJson('https://registry.npmjs.org/-/npm/v1/security/advisories/bulk', {
          method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ [item.pkg]: [item.version] }),
        }, fetchImpl);
        remote.advisories[`${item.pkg}@${item.version}`] = (body[item.pkg] || []).map((a) => ({ id: a.id, severity: a.severity, title: a.title, url: a.url, vulnerable_versions: a.vulnerable_versions }));
      } catch (error) { remote.advisories[`${item.pkg}@${item.version}`] = { error: error.message }; }
    }
    const integrity = strongestIntegrity(parseIntegrity(item.integrity));
    if (integrity && !remote.sri[item.url]) {
      try {
        const res = await fetchWithTimeout(item.url, {}, fetchImpl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length > MAX_CDN_BYTES) throw new Error(`応答が上限 ${MAX_CDN_BYTES} bytes を超過`);
        remote.sri[item.url] = { algorithm: integrity.algorithm, digest: computeSri(buf, integrity.algorithm), bytes: buf.length };
      } catch (error) { remote.sri[item.url] = { error: error.message }; }
    }
  }

  const ghHeaders = { accept: 'application/vnd.github+json', ...(githubToken ? { authorization: `Bearer ${githubToken}` } : {}) };
  for (const repo of [...new Set(inventory.actions.map((a) => a.repo))]) {
    try {
      const rel = await fetchJson(`https://api.github.com/repos/${repo}/releases/latest`, { headers: ghHeaders }, fetchImpl);
      remote.githubReleases[repo] = { latestTag: rel.tag_name, publishedAt: rel.published_at };
    } catch (error) { remote.githubReleases[repo] = { error: error.message }; }
  }

  if (inventory.nodeSources.length > 0) {
    try {
      const doc = await fetchJson('https://endoflife.date/api/v1/products/nodejs', { headers: { accept: 'application/json' } }, fetchImpl);
      remote.endoflife.nodejs = { releases: (doc?.result?.releases || []).map((r) => ({ name: r.name, isLts: r.isLts, isEol: r.isEol, eolFrom: r.eolFrom, latest: r.latest?.name ?? null })) };
    } catch (error) { remote.endoflife.nodejs = { error: error.message }; }
  }
  return remote;
}

// ---------------------------------------------------------------------------
// 判定（純関数）
// ---------------------------------------------------------------------------

function finding(status, code, message) { return { status, code, message }; }

function evaluateCdn(item, remote, t, now) {
  const findings = [];
  const id = item.pkg ? `cdn:${item.pkg}` : `cdn:${item.host}`;
  if (!item.pkg) {
    findings.push(finding('warning', 'CDN_UNSUPPORTED', `未対応 CDN（${item.host}）。手動で最新版・SRI を確認する`));
  } else if (!parseExactSemver(item.version)) {
    findings.push(finding('alert', 'CDN_VERSION_NOT_EXACT', `バージョンが正確に固定されていない（${item.version ?? '未指定'}）。SEC-03 違反`));
  }
  const integrity = strongestIntegrity(parseIntegrity(item.integrity));
  if (!integrity) {
    findings.push(finding('alert', 'SRI_MISSING', 'integrity 属性が無い。SEC-12 違反'));
  } else {
    const sri = remote.sri?.[item.url];
    if (!sri) findings.push(finding('unknown', 'SRI_NOT_CHECKED', 'CDN 実体を取得していない'));
    else if (sri.error) findings.push(finding('unknown', 'SRI_FETCH_FAILED', `CDN 実体の取得に失敗: ${sri.error}`));
    else if (sri.digest !== integrity.digest) findings.push(finding('alert', 'SRI_MISMATCH', `CDN 実体の ${integrity.algorithm} が integrity 属性と不一致（実体 ${sri.digest}）。管理画面が起動しない／改ざんの可能性`));
    else findings.push(finding('ok', 'SRI_MATCH', `${integrity.algorithm} 一致`));
  }

  let latest = null;
  if (item.pkg) {
    const npm = remote.npm?.[item.pkg];
    if (!npm || npm.error) {
      findings.push(finding('unknown', 'NPM_FETCH_FAILED', `npm registry 取得失敗: ${npm?.error ?? '未取得'}`));
    } else {
      latest = npm.latest;
      if (npm.deprecated?.[item.version]) findings.push(finding('alert', 'CDN_DEPRECATED', `固定版 ${item.version} は npm で deprecated: ${npm.deprecated[item.version]}`));
      const { diff, minorsBehind } = compareVersions(item.version, latest);
      if (diff === 'major') findings.push(finding('alert', 'CDN_MAJOR_BEHIND', `メジャー更新あり（${item.version} → ${latest}）`));
      else if (diff === 'minor' && minorsBehind >= t.cdnMinorAlert) findings.push(finding('alert', 'CDN_MINOR_DRIFT', `${minorsBehind} マイナー遅れ（${item.version} → ${latest}、閾値 ${t.cdnMinorAlert}）`));
      else if (diff === 'minor' || diff === 'patch') findings.push(finding('warning', 'CDN_UPDATE_AVAILABLE', `更新あり（${item.version} → ${latest}）`));
      else if (diff === 'same') findings.push(finding('ok', 'CDN_LATEST', `最新（${latest}）`));
      if (npm.latestPublished) {
        const days = Math.floor((now.getTime() - new Date(npm.latestPublished).getTime()) / 86_400_000);
        if (days > t.upstreamStaleDays) findings.push(finding('warning', 'UPSTREAM_STALE', `上流の最終リリースから ${days} 日（EOL ポリシー非公開のため停滞を代替指標にする）`));
      }
    }
    const adv = remote.advisories?.[`${item.pkg}@${item.version}`];
    if (adv && !Array.isArray(adv)) findings.push(finding('unknown', 'ADVISORY_FETCH_FAILED', `脆弱性情報の取得失敗: ${adv.error}`));
    else if (Array.isArray(adv) && adv.length > 0) {
      for (const a of adv) {
        const sev = String(a.severity || '').toLowerCase();
        findings.push(finding(sev === 'high' || sev === 'critical' ? 'alert' : 'warning', 'CDN_ADVISORY', `${sev || 'unknown'}: ${a.title}（${a.url}）`));
      }
    } else if (Array.isArray(adv)) findings.push(finding('ok', 'CDN_NO_ADVISORY', '既知の脆弱性なし（npm advisory）'));
  }
  return {
    id, category: 'cdn', name: item.pkg || item.host, current: item.version, latest,
    pinning: integrity ? `version + SRI(${integrity.algorithm})` : 'version only',
    source: `${item.file}:${item.line}`, status: worstStatus(findings.map((f) => f.status)), findings,
  };
}

function evaluateAction(item, remote) {
  const findings = [];
  const rel = remote.githubReleases?.[item.repo];
  const usedVersion = item.isSha ? item.versionComment : item.ref;
  if (!item.ref) findings.push(finding('alert', 'ACTION_UNPINNED', 'ref 指定なし'));
  else if (item.isSha && !item.versionComment) findings.push(finding('warning', 'ACTION_SHA_NO_COMMENT', 'SHA 固定だがバージョンコメントが無く鮮度を判定できない'));
  else if (!item.isSha) findings.push(finding('warning', 'ACTION_TAG_PINNED', `タグ固定（${item.ref}）。commit SHA 固定が推奨（Issue #117 項目3）`));
  else findings.push(finding('ok', 'ACTION_SHA_PINNED', `SHA 固定（${item.versionComment}）`));
  if (!rel || rel.error) findings.push(finding('unknown', 'ACTION_FETCH_FAILED', `最新リリース取得失敗: ${rel?.error ?? '未取得'}`));
  else if (usedVersion) {
    const cur = parseMajor(usedVersion);
    const lat = parseMajor(rel.latestTag);
    if (cur !== null && lat !== null && cur < lat) findings.push(finding('warning', 'ACTION_MAJOR_BEHIND', `メジャー更新あり（${usedVersion} → ${rel.latestTag}）。Dependabot PR で追従する`));
    else if (cur !== null && lat !== null) findings.push(finding('ok', 'ACTION_MAJOR_LATEST', `最新メジャー（最新 ${rel.latestTag}）`));
  }
  return {
    id: `action:${item.action}@${item.file}:${item.line}`, category: 'github-actions', name: item.action,
    current: usedVersion ?? item.ref, latest: rel?.latestTag ?? null,
    pinning: item.isSha ? 'commit SHA' : 'tag', source: `${item.file}:${item.line}`,
    status: worstStatus(findings.map((f) => f.status)), findings,
  };
}

function evaluateNode(nodeSources, remote, t, now) {
  const findings = [];
  const majors = [...new Set(nodeSources.map((s) => s.major).filter((m) => m !== null))];
  if (majors.length === 0) findings.push(finding('warning', 'NODE_NOT_DECLARED', 'Node.js のバージョン宣言が見つからない'));
  if (majors.length > 1) findings.push(finding('warning', 'NODE_MAJOR_MISMATCH', `宣言箇所でメジャーが不一致（${majors.join(', ')}）。.nvmrc / engines / CI / Pages を揃える`));
  const eol = remote.endoflife?.nodejs;
  let latest = null;
  if (!eol || eol.error) {
    findings.push(finding('unknown', 'NODE_EOL_FETCH_FAILED', `endoflife.date 取得失敗: ${eol?.error ?? '未取得'}`));
  } else {
    for (const major of majors) {
      const release = eol.releases.find((r) => String(r.name) === String(major));
      const res = evaluateEol(release, { now, warnDays: t.eolWarnDays, alertDays: t.eolAlertDays });
      findings.push(finding(res.status, `NODE_EOL_${res.status.toUpperCase()}`, `Node.js ${major}: ${res.message}`));
      if (release?.latest) latest = release.latest;
      for (const src of nodeSources.filter((s) => s.major === major && parseExactSemver(s.value))) {
        const { diff } = compareVersions(src.value, release?.latest);
        if (diff === 'minor' || diff === 'patch') {
          findings.push(finding('warning', 'NODE_PATCH_BEHIND', `${src.source} の固定版 ${src.value} は ${major} 系最新 ${release.latest} より古い（セキュリティリリース未適用の可能性。Cloudflare Pages は .nvmrc を使う）`));
        }
      }
    }
  }
  return {
    id: 'runtime:nodejs', category: 'runtime', name: 'Node.js',
    current: nodeSources.map((s) => `${s.source}=${s.value}`).join(', '), latest,
    pinning: '.nvmrc（Pages/ローカル）・engines・CI node-version', source: nodeSources.map((s) => s.source).join(', '),
    status: worstStatus(findings.map((f) => f.status)), findings,
  };
}

function evaluateManual(check, t, now) {
  let status = 'manual';
  let message;
  if (!check.lastReviewed) {
    status = 'warning';
    message = `手動確認の記録なし。${check.how}`;
  } else {
    const days = Math.floor((now.getTime() - new Date(`${check.lastReviewed}T00:00:00Z`).getTime()) / 86_400_000);
    if (days > t.manualReviewIntervalDays) { status = 'warning'; message = `前回確認（${check.lastReviewed}）から ${days} 日。四半期確認の期限超過`; }
    else message = `前回確認 ${check.lastReviewed}（${days} 日前）`;
  }
  const findings = [finding(status, status === 'manual' ? 'MANUAL_REVIEWED' : 'MANUAL_REVIEW_DUE', message)];
  // 確認できなかった項目が残っていれば、期限内でも「確認済み」とは扱わない
  const unverified = Array.isArray(check.unverified) ? check.unverified.filter(Boolean) : [];
  if (unverified.length > 0) {
    findings.push(finding('warning', 'MANUAL_PARTIAL', `未確認の項目が残っている: ${unverified.join('、')}`));
  }
  return {
    id: `manual:${check.id}`, category: 'manual', name: check.name, current: check.current, latest: null,
    pinning: 'ダッシュボード設定（API 未連携）', source: 'scripts/dependency-freshness.config.json',
    status: findings.every((f) => f.status === 'manual') ? 'manual' : worstStatus(findings.map((f) => f.status)), findings,
  };
}

export function evaluateInventory(inventory, remote, { now = new Date(), config = loadConfig() } = {}) {
  const t = config.thresholds;
  const items = [
    ...inventory.cdn.map((item) => evaluateCdn(item, remote, t, now)),
    ...inventory.actions.map((item) => evaluateAction(item, remote)),
    evaluateNode(inventory.nodeSources, remote, t, now),
    ...inventory.manualChecks.map((c) => evaluateManual(c, t, now)),
  ];

  const allFindings = items.flatMap((i) => i.findings);
  const remoteFindings = allFindings.filter((f) => /FETCH_FAILED|NOT_CHECKED|^ACTION_(MAJOR|FETCH)|^CDN_(LATEST|UPDATE|MAJOR|MINOR|NO_ADV|ADV)|^SRI_(MATCH|MISMATCH)|^NODE_EOL/.test(f.code));
  const remoteFailed = remoteFindings.filter((f) => f.status === 'unknown').length;
  let status = worstStatus(items.map((i) => i.status));
  // リモート照会が 1 件も成功しなければ「問題なし」とは言えないので error にする
  if (remoteFindings.length > 0 && remoteFailed === remoteFindings.length) status = 'error';

  const counts = { ok: 0, manual: 0, warning: 0, unknown: 0, alert: 0 };
  for (const i of items) counts[i.status] = (counts[i.status] || 0) + 1;
  const problems = items.flatMap((i) => i.findings
    .filter((f) => ['warning', 'unknown', 'alert'].includes(f.status))
    .map((f) => `[${f.status}] ${i.name}（${i.source}）: ${f.message}`));

  return {
    schemaVersion: SCHEMA_VERSION,
    task: TASK_NAME,
    generatedAt: now.toISOString(),
    remoteFetchedAt: remote.fetchedAt ?? null,
    remoteSource: remote.fixture ? 'fixture' : 'network',
    status,
    success: status !== 'error',
    thresholds: t,
    counts,
    items,
    problems,
  };
}

export function exitCodeFor(status, failOn = 'alert') {
  if (status === 'error') return 1;
  if (failOn === 'never') return 0;
  if (status === 'alert') return 2;
  if (failOn === 'warning' && (status === 'warning' || status === 'unknown')) return 2;
  return 0;
}

const LABEL = { ok: 'OK', manual: 'OK(手動)', warning: 'WARNING', unknown: 'UNKNOWN', alert: 'ALERT', error: 'ERROR' };

function mdCell(value) {
  return String(value ?? '-').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

export function renderMarkdown(report) {
  const lines = [
    '# npm管理外依存 鮮度・EOL チェック結果',
    '',
    `- 判定時刻: ${report.generatedAt}（リモート: ${report.remoteSource}）`,
    `- 総合: **${LABEL[report.status] || report.status}**`,
    `- 閾値: EOL warning ${report.thresholds.eolWarnDays}日前 / alert ${report.thresholds.eolAlertDays}日前、CDN ${report.thresholds.cdnMinorAlert}マイナー遅れで alert、手動確認 ${report.thresholds.manualReviewIntervalDays}日ごと`,
    '',
    '| 状態 | 分類 | 名称 | 現在 | 最新 | 固定方法 | 箇所 |',
    '| :--- | :--- | :--- | :--- | :--- | :--- | :--- |',
    ...report.items.map((i) => `| ${LABEL[i.status] || i.status} | ${i.category} | ${mdCell(i.name)} | ${mdCell(i.current)} | ${mdCell(i.latest)} | ${mdCell(i.pinning)} | ${mdCell(i.source)} |`),
  ];
  if (report.problems.length > 0) lines.push('', '## 要確認', ...report.problems.map((p) => `- ${p}`));
  lines.push('', '対応手順: docs/DOCUMENTATION.md 4.11章');
  return `${lines.join('\n')}\n`;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

export function parseArgs(argv) {
  const opts = { outDir: path.join(REPO_ROOT, 'reports', TASK_NAME), remoteFixture: null, now: null, failOn: 'alert', root: REPO_ROOT };
  for (let i = 0; i < argv.length; i += 1) {
    const [key, inline] = argv[i].split('=');
    const next = () => (inline !== undefined ? inline : argv[++i]);
    if (key === '--out-dir') opts.outDir = path.resolve(next());
    else if (key === '--remote-fixture') opts.remoteFixture = path.resolve(next());
    else if (key === '--now') opts.now = next();
    else if (key === '--fail-on') opts.failOn = next();
    else if (key === '--root') opts.root = path.resolve(next());
    else throw new Error(`不明な引数: ${argv[i]}`);
  }
  if (!['alert', 'warning', 'never'].includes(opts.failOn)) throw new Error(`--fail-on は alert|warning|never: ${opts.failOn}`);
  return opts;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const config = loadConfig();
  const inventory = collectInventory({ root: opts.root, config });
  const remote = opts.remoteFixture
    ? { ...JSON.parse(readFileSync(opts.remoteFixture, 'utf8')), fixture: true }
    : await fetchRemoteData(inventory);
  const now = opts.now ? new Date(opts.now) : new Date();
  const report = evaluateInventory(inventory, remote, { now, config });
  const exitCode = exitCodeFor(report.status, opts.failOn);
  mkdirSync(opts.outDir, { recursive: true });
  writeFileSync(path.join(opts.outDir, 'latest.json'), `${JSON.stringify({ ...report, exitCode }, null, 2)}\n`);
  writeFileSync(path.join(opts.outDir, 'latest.md'), renderMarkdown(report));
  process.stdout.write(renderMarkdown(report));
  process.stdout.write(`\nRESULT: ${report.status.toUpperCase()} (exit ${exitCode}) -> ${path.relative(process.cwd(), path.join(opts.outDir, 'latest.json'))}\n`);
  process.exitCode = exitCode;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`RESULT: ERROR ${error.stack || error.message}\n`);
    process.exitCode = 1;
  });
}
