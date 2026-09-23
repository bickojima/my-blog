/**
 * npm管理外依存の鮮度・EOL監視（SEC-40, Issue #132）
 *
 * ネットワークには一切出ない。判定ロジックは tests/fixtures/dependency-freshness/ の
 * リモート応答フィクスチャで検証し、globalThis.fetch は呼ばれたら失敗するスタブに置き換える。
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  collectInventory, compareVersions, computeSri, evaluateEol, evaluateInventory, exitCodeFor,
  extractExternalResources, extractWorkflowUses, extractWorkflowNodeVersions, loadConfig, parseArgs,
  parseCdnUrl, parseExactSemver, parseIntegrity, renderMarkdown, strongestIntegrity,
} from '../scripts/check-dependency-freshness.mjs';

const ROOT = process.cwd();
const FIXTURES = join(ROOT, 'tests/fixtures/dependency-freshness');
const fixture = (name) => JSON.parse(readFileSync(join(FIXTURES, name), 'utf8'));
const config = loadConfig();
const DECAP_URL = 'https://unpkg.com/decap-cms@3.16.2/dist/decap-cms.js';
const DECAP_SRI = 'sha384-tbnFsiSBvMm2vOLu70Mx7HlnMj6kXxR0Tdo0USlY9564mb1AyMnIdCjOZ738PWPr';
const SHA = 'a'.repeat(40);

/** フィクスチャ判定用の合成インベントリ（実ファイルの内容に依存しない） */
function syntheticInventory(overrides = {}) {
  return {
    cdn: [{ file: 'public/admin/index.html', line: 1, tag: 'script', url: DECAP_URL, integrity: DECAP_SRI, crossorigin: 'anonymous', ...parseCdnUrl(DECAP_URL) }],
    actions: [
      { file: '.github/workflows/x.yml', line: 1, action: 'actions/checkout', repo: 'actions/checkout', ref: SHA, isSha: true, versionComment: 'v7.0.1' },
    ],
    nodeSources: [
      { source: '.nvmrc', kind: 'version-file', value: '22.12.0', major: 22 },
      { source: 'package.json#engines.node', kind: 'engines', value: '>=22.12.0', major: 22 },
    ],
    manualChecks: [{ id: 'pages', name: 'Pages', current: 'v3', lastReviewed: '2026-09-01', how: 'dashboard' }],
    ...overrides,
  };
}
const codes = (report) => report.items.flatMap((i) => i.findings.map((f) => `${f.status}:${f.code}`));

let fetchSpy;
beforeAll(() => {
  fetchSpy = vi.fn(() => { throw new Error('npm test からネットワークに出てはならない（SEC-40）'); });
  vi.stubGlobal('fetch', fetchSpy);
});
afterAll(() => {
  expect(fetchSpy).not.toHaveBeenCalled();
  vi.unstubAllGlobals();
});

describe('npm管理外依存 鮮度・EOL監視（SEC-40, Issue #132）', () => {
  describe('バージョン・SRI の基本関数', () => {
    it('正確な x.y.z だけを固定バージョンとして解釈する', () => {
      expect(parseExactSemver('3.16.2')).toEqual({ major: 3, minor: 16, patch: 2 });
      expect(parseExactSemver('v4.2.1')).toEqual({ major: 4, minor: 2, patch: 1 });
      expect(parseExactSemver('^3.16.2')).toBeNull();
      expect(parseExactSemver('3.16')).toBeNull();
      expect(parseExactSemver(undefined)).toBeNull();
    });

    it('固定版と最新版の差を major / minor / patch / same に分類する', () => {
      expect(compareVersions('3.16.2', '3.16.2').diff).toBe('same');
      expect(compareVersions('3.16.2', '3.16.3').diff).toBe('patch');
      expect(compareVersions('3.10.0', '3.16.2')).toEqual({ diff: 'minor', minorsBehind: 6 });
      expect(compareVersions('3.16.2', '4.0.0').diff).toBe('major');
      expect(compareVersions('3.16.2', '3.15.0').diff).toBe('ahead');
      expect(compareVersions('latest', '3.16.2').diff).toBe('unknown');
    });

    it('integrity 属性を分解し最も強いアルゴリズムで照合する', () => {
      const entries = parseIntegrity('sha256-AAA= sha512-BBB= sha384-CCC=');
      expect(entries).toHaveLength(3);
      expect(strongestIntegrity(entries)).toEqual({ algorithm: 'sha512', digest: 'BBB=' });
      expect(parseIntegrity(null)).toEqual([]);
    });

    it('computeSri は openssl dgst -sha384 -binary | base64 と同じ値を返す', () => {
      expect(computeSri(Buffer.from('abc'), 'sha384')).toBe('ywB1P0WjXou1oD1pmsZQBycsMqsO3tFjGotgWkP/W+2AhgcroefMI1i67KE0yCWn');
    });

    it('EOL は 90日前 warning / 30日前 alert / 経過で alert', () => {
      const release = { name: '22', isEol: false, eolFrom: '2027-04-30' };
      const opts = { warnDays: 90, alertDays: 30 };
      expect(evaluateEol(release, { ...opts, now: new Date('2026-09-23T00:00:00Z') }).status).toBe('ok');
      expect(evaluateEol(release, { ...opts, now: new Date('2027-02-15T00:00:00Z') }).status).toBe('warning');
      expect(evaluateEol(release, { ...opts, now: new Date('2027-04-10T00:00:00Z') }).status).toBe('alert');
      expect(evaluateEol(release, { ...opts, now: new Date('2027-05-01T00:00:00Z') }).status).toBe('alert');
      expect(evaluateEol({ name: '26', isEol: false, eolFrom: null }, { ...opts, now: new Date() }).status).toBe('ok');
      expect(evaluateEol(null, { ...opts, now: new Date() }).status).toBe('unknown');
    });
  });

  describe('ファイル内容の解析', () => {
    it('CDN URL から npm パッケージ名とバージョンを取り出す', () => {
      expect(parseCdnUrl(DECAP_URL)).toMatchObject({ host: 'unpkg.com', pkg: 'decap-cms', version: '3.16.2' });
      expect(parseCdnUrl('https://cdn.jsdelivr.net/npm/@scope/pkg@1.2.3/dist/x.js')).toMatchObject({ pkg: '@scope/pkg', version: '1.2.3' });
      expect(parseCdnUrl('https://unpkg.com/decap-cms/dist/decap-cms.js')).toMatchObject({ pkg: 'decap-cms', version: null });
      expect(parseCdnUrl('https://example.com/lib.js')).toMatchObject({ host: 'example.com', pkg: null });
    });

    it('外部 script / stylesheet だけを抽出し、相対パスや preconnect は除外する', () => {
      const html = [
        '<script src="/local.js"></script>',
        `<script src="${DECAP_URL}" integrity="${DECAP_SRI}" crossorigin="anonymous"></script>`,
        '<link rel="preconnect" href="https://fonts.example">',
        "<link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/x@1.0.0/x.css'>",
      ].join('\n');
      const res = extractExternalResources(html, 'a.html');
      expect(res.map((r) => r.url)).toEqual([DECAP_URL, 'https://cdn.jsdelivr.net/npm/x@1.0.0/x.css']);
      expect(res[0]).toMatchObject({ line: 2, integrity: DECAP_SRI, crossorigin: 'anonymous' });
    });

    it('workflow の uses: を SHA 固定・タグ固定・ローカル action に分類する', () => {
      const yml = [
        `      - uses: actions/checkout@${SHA} # v7.0.1`,
        '        uses: actions/setup-node@v4',
        '      - uses: ./.github/actions/local',
        '        uses: "owner/repo/sub@v2"',
      ].join('\n');
      const uses = extractWorkflowUses(yml, 'w.yml');
      expect(uses).toHaveLength(3);
      expect(uses[0]).toMatchObject({ action: 'actions/checkout', isSha: true, versionComment: 'v7.0.1', line: 1 });
      expect(uses[1]).toMatchObject({ action: 'actions/setup-node', ref: 'v4', isSha: false });
      expect(uses[2]).toMatchObject({ action: 'owner/repo/sub', repo: 'owner/repo', ref: 'v2' });
      expect(extractWorkflowNodeVersions("  node-version: '22'\n  node-version-file: .nvmrc", 'w.yml'))
        .toEqual([
          { source: 'w.yml:1', kind: 'node-version', value: '22', major: 22 },
          { source: 'w.yml:2', kind: 'node-version-file', value: '.nvmrc', major: null },
        ]);
    });
  });

  describe('判定（フィクスチャ）', () => {
    const now = new Date('2026-09-23T00:00:00Z');

    it('全項目が最新・SHA 固定・SRI 一致・確認済みなら ok（exit 0）', () => {
      const report = evaluateInventory(syntheticInventory(), fixture('remote-ok.json'), { now, config });
      expect(report.status).toBe('ok');
      expect(report.success).toBe(true);
      expect(codes(report)).toContain('ok:SRI_MATCH');
      expect(exitCodeFor(report.status)).toBe(0);
    });

    it('SRI 不一致・メジャー遅れ・deprecated・high 脆弱性・EOL 30日以内は alert（exit 2）', () => {
      const report = evaluateInventory(syntheticInventory(), fixture('remote-alert.json'), { now: new Date('2027-04-10T00:00:00Z'), config });
      expect(report.status).toBe('alert');
      expect(codes(report)).toEqual(expect.arrayContaining([
        'alert:SRI_MISMATCH', 'alert:CDN_MAJOR_BEHIND', 'alert:CDN_DEPRECATED', 'alert:CDN_ADVISORY', 'alert:NODE_EOL_ALERT', 'warning:NODE_PATCH_BEHIND',
      ]));
      expect(exitCodeFor(report.status)).toBe(2);
      expect(exitCodeFor(report.status, 'never')).toBe(0);
    });

    it('Issue #132 の実例（3.10.0 で 6 マイナー遅れ）は alert、2 マイナー遅れは warning', () => {
      const remote = fixture('remote-ok.json');
      const mk = (version) => {
        const url = `https://unpkg.com/decap-cms@${version}/dist/decap-cms.js`;
        const inv = syntheticInventory({ cdn: [{ file: 'a', line: 1, url, integrity: DECAP_SRI, ...parseCdnUrl(url) }] });
        return evaluateInventory(inv, { ...remote, sri: { [url]: { algorithm: 'sha384', digest: DECAP_SRI.slice(7) } }, advisories: { [`decap-cms@${version}`]: [] } }, { now, config });
      };
      expect(codes(mk('3.10.0'))).toContain('alert:CDN_MINOR_DRIFT');
      expect(codes(mk('3.14.0'))).toContain('warning:CDN_UPDATE_AVAILABLE');
      expect(mk('3.14.0').status).toBe('warning');
    });

    it('integrity 欠落・範囲指定バージョンは alert（SEC-03 / SEC-12 の退行検知）', () => {
      const url = 'https://unpkg.com/decap-cms@^3.16.2/dist/decap-cms.js';
      const inv = syntheticInventory({ cdn: [{ file: 'a', line: 1, url, integrity: null, ...parseCdnUrl(url) }] });
      const report = evaluateInventory(inv, fixture('remote-ok.json'), { now, config });
      expect(codes(report)).toEqual(expect.arrayContaining(['alert:CDN_VERSION_NOT_EXACT', 'alert:SRI_MISSING']));
    });

    it('タグ固定の action・未記録／期限超過の手動確認・Node メジャー不一致は warning', () => {
      const inv = syntheticInventory({
        actions: [{ file: 'ci.yml', line: 1, action: 'actions/setup-node', repo: 'actions/setup-node', ref: 'v4', isSha: false, versionComment: null }],
        nodeSources: [
          { source: '.nvmrc', kind: 'version-file', value: '22.12.0', major: 22 },
          { source: 'ci.yml:3', kind: 'node-version', value: '24', major: 24 },
        ],
        manualChecks: [
          { id: 'a', name: 'never', current: '-', lastReviewed: null, how: 'x' },
          { id: 'b', name: 'old', current: '-', lastReviewed: '2026-01-01', how: 'x' },
        ],
      });
      const report = evaluateInventory(inv, fixture('remote-ok.json'), { now, config });
      expect(report.status).toBe('warning');
      expect(codes(report)).toEqual(expect.arrayContaining([
        'warning:ACTION_TAG_PINNED', 'warning:ACTION_MAJOR_BEHIND', 'warning:NODE_MAJOR_MISMATCH', 'warning:MANUAL_REVIEW_DUE',
      ]));
      expect(report.items.filter((i) => i.category === 'manual').every((i) => i.status === 'warning')).toBe(true);
    });

    it('手動確認が期限内でも未確認項目が残れば warning、全て確認済みなら manual', () => {
      const base = { id: 'p', name: 'Pages', current: '-', lastReviewed: '2026-09-23', how: 'x' };
      const partial = evaluateInventory(syntheticInventory({ manualChecks: [{ ...base, unverified: ['NODE_VERSION'] }] }), fixture('remote-ok.json'), { now, config });
      const manual = partial.items.find((i) => i.category === 'manual');
      expect(manual.status).toBe('warning');
      expect(codes(partial)).toEqual(expect.arrayContaining(['manual:MANUAL_REVIEWED', 'warning:MANUAL_PARTIAL']));
      const full = evaluateInventory(syntheticInventory({ manualChecks: [{ ...base, unverified: [] }] }), fixture('remote-ok.json'), { now, config });
      expect(full.items.find((i) => i.category === 'manual').status).toBe('manual');
    });

    it('リモート照会が全て失敗したら ok ではなく error（exit 1）', () => {
      const report = evaluateInventory(syntheticInventory(), fixture('remote-unreachable.json'), { now, config });
      expect(report.status).toBe('error');
      expect(report.success).toBe(false);
      expect(exitCodeFor(report.status, 'never')).toBe(1);
    });

    it('結果 JSON は schemaVersion・status・counts・items・problems を持ち、Markdown はセル内の | をエスケープする', () => {
      const report = evaluateInventory(syntheticInventory(), fixture('remote-alert.json'), { now, config });
      expect(report).toMatchObject({ schemaVersion: 1, task: 'dependency-freshness', remoteSource: 'network' });
      expect(Object.keys(report.counts)).toEqual(expect.arrayContaining(['ok', 'warning', 'alert']));
      expect(report.problems.length).toBeGreaterThan(0);
      report.items[0].name = 'a|b';
      const md = renderMarkdown(report);
      expect(md).toContain('**ALERT**');
      expect(md).toContain('a\\|b');
    });

    it('CLI 引数を検証する', () => {
      expect(parseArgs(['--fail-on', 'never']).failOn).toBe('never');
      expect(parseArgs(['--now=2026-01-01']).now).toBe('2026-01-01');
      expect(() => parseArgs(['--fail-on', 'sometimes'])).toThrow();
      expect(() => parseArgs(['--unknown'])).toThrow();
    });
  });

  describe('実リポジトリの棚卸し（ローカルファイルのみ）', () => {
    const inventory = collectInventory({ root: ROOT, config });

    it('public/ と src/ の外部 CDN スクリプトを全て検出し、正確なバージョンと integrity を持つ', () => {
      const adminHtml = readFileSync(join(ROOT, 'public/admin/index.html'), 'utf8');
      const expected = extractExternalResources(adminHtml, 'public/admin/index.html').map((r) => r.url);
      expect(expected.length).toBeGreaterThan(0);
      for (const url of expected) {
        const item = inventory.cdn.find((c) => c.url === url);
        expect(item, url).toBeDefined();
        expect(parseExactSemver(item.version), url).not.toBeNull();
        expect(strongestIntegrity(parseIntegrity(item.integrity)), url).not.toBeNull();
      }
    });

    it('Node.js のバージョン宣言（.nvmrc・engines・CI）を収集し、メジャーが一致している', () => {
      const sources = inventory.nodeSources.map((s) => s.source);
      expect(sources).toContain('.nvmrc');
      expect(sources).toContain('package.json#engines.node');
      const majors = new Set(inventory.nodeSources.map((s) => s.major).filter((m) => m !== null));
      expect(majors.size).toBe(1);
    });

    it('手動確認項目に Cloudflare Pages ビルド環境が登録されている', () => {
      expect(inventory.manualChecks.map((c) => c.id)).toContain('cloudflare-pages-build-image');
    });

    it('CLI はフィクスチャ指定時にネットワークへ出ず、結果 JSON と Markdown を書き出す', () => {
      const out = mkdtempSync(join(tmpdir(), 'dep-fresh-'));
      try {
        let status = 0;
        try {
          execFileSync(process.execPath, ['scripts/check-dependency-freshness.mjs', '--remote-fixture', join(FIXTURES, 'remote-unreachable.json'), '--out-dir', out], { cwd: ROOT, stdio: 'pipe' });
        } catch (error) { status = error.status; }
        const json = JSON.parse(readFileSync(join(out, 'latest.json'), 'utf8'));
        expect(json.remoteSource).toBe('fixture');
        expect(json.status).toBe('error');
        expect(json.exitCode).toBe(1);
        expect(status).toBe(1);
        expect(readFileSync(join(out, 'latest.md'), 'utf8')).toContain('**ERROR**');
      } finally {
        rmSync(out, { recursive: true, force: true });
      }
    });
  });

  describe('週次ワークフローと Dependabot の設定', () => {
    const wf = readFileSync(join(ROOT, '.github/workflows/dependency-freshness.yml'), 'utf8');

    it('週次スケジュールと手動実行を持つ', () => {
      expect(wf).toMatch(/schedule:\s*\n\s*-\s*cron:\s*'[^']+\s\*\s\*\s\d'/);
      expect(wf).toContain('workflow_dispatch:');
      expect(wf).not.toMatch(/pull_request_target/);
    });

    it('全ての action を commit SHA とバージョンコメントで固定する', () => {
      const uses = extractWorkflowUses(wf, 'dependency-freshness.yml');
      expect(uses.length).toBeGreaterThan(0);
      for (const u of uses) {
        expect(u.isSha, `${u.action}@${u.ref}`).toBe(true);
        expect(u.versionComment, u.action).toMatch(/^v\d+/);
      }
    });

    it('権限は既定なし、判定ジョブ contents: read、通知ジョブ issues: write のみ', () => {
      expect(wf).toMatch(/^permissions:\s*\{\}\s*$/m);
      const grants = [...wf.matchAll(/^\s+(contents|issues|pull-requests|actions|packages|id-token|security-events|statuses|checks|deployments):\s*(\w+)/gm)].map((m) => `${m[1]}:${m[2]}`);
      expect(grants.sort()).toEqual(['contents:read', 'issues:write']);
    });

    it('run スクリプトに ${{ }} 式を直接埋め込まない（スクリプトインジェクション防止）', () => {
      const runBlocks = [...wf.matchAll(/run:\s*\|\n((?:\s{10,}.*\n?)+)/g)].map((m) => m[1]);
      expect(runBlocks.length).toBeGreaterThan(0);
      for (const block of runBlocks) expect(block).not.toContain('${{');
    });

    it('alert で Issue 起票（既存はコメント）とジョブ失敗、error でジョブ失敗する', () => {
      expect(wf).toContain("needs.check.outputs.status == 'alert'");
      expect(wf).toContain('gh issue create');
      expect(wf).toContain('gh issue comment');
      expect(wf).toContain("steps.check.outputs.status == 'error'");
      expect(wf).toContain('--fail-on never');
      expect(wf).toContain('actions/upload-artifact@');
    });

    it('Dependabot は github-actions を staging 向けに週次更新する', () => {
      const dep = readFileSync(join(ROOT, '.github/dependabot.yml'), 'utf8');
      expect(dep).toMatch(/package-ecosystem:\s*github-actions/);
      expect(dep).toMatch(/target-branch:\s*staging/);
      expect(dep).toMatch(/interval:\s*weekly/);
    });
  });
});
