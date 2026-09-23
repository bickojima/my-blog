/**
 * Issue #127（環境値の自動導出）CMS 書き込み先ブランチの実ブラウザ E2E エビデンス（2026-09-23）
 *
 * config.yml から backend.branch / base_url を削除し、admin/index.html が CMS_MANUAL_INIT +
 * CMS.init({ config: { backend: resolveCmsBackend(location) } }) で渡すようにした変更を、
 * Decap CMS 3.16.2（CDN 実物）で実操作して確かめる。
 *
 * - 管理画面は dist/ を各ホスト名（localhost / reiwa.casa / staging.reiwa.casa / *.pages.dev）として配信する。
 *   localhost は実 HTTP サーバー、それ以外は context.route() で横取りしてローカル dist を返す（実サーバーへは一切通信しない）。
 *   public/_headers の /* と /admin/* ヘッダー（CSP 含む）も付与し、/admin/cms-env.js が CSP で止まらないことも見る。
 * - OAuth は context.route() による3ステップハンドシェイク（CLAUDE.md 規定のスタンドアロン方式）。
 *   ポップアップは Decap が base_url + /auth で開くので、ポップアップ URL で base_url の導出も実測する。
 *   以前の手順で必要だった「config.yml の base_url を localhost に一時変更」は行わない（不要になったことの実証）。
 * - GitHub API は全面モック。保存時の PATCH git/refs/heads/<branch> と、読み取り時に参照したブランチを記録する。
 *
 * シナリオ（PC / iPad Pro 11 / iPhone 14 × 4ホスト）:
 *   B01 ログイン後の記事一覧（認証後画面）とポップアップ URL（= origin + /auth）
 *   B02 記事を開く → タイトルを fill → 「公開」→「公開する」を実操作 → 書き込み先 ref を実測
 *
 * 使用方法:
 *   1. npm run build:raw
 *   2. node evidence/2026-09-23/issue127/verify-issue127-cms-branch.mjs
 */
import { chromium, devices } from 'playwright';
import { mkdirSync, writeFileSync, readFileSync, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { join, extname } from 'node:path';

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, 'evidence/2026-09-23/issue127');
const SHOT_DIR = join(OUT_DIR, 'screenshots');
mkdirSync(SHOT_DIR, { recursive: true });
const DIST = join(ROOT, 'dist');
const LOCAL_PORT = 4276;

const DEVICES = [
  { name: 'PC', config: { viewport: { width: 1280, height: 800 } } },
  { name: 'iPad', config: devices['iPad Pro 11'] },
  { name: 'iPhone', config: devices['iPhone 14'] },
];

const HOSTS = [
  { id: 'localhost', origin: `http://localhost:${LOCAL_PORT}`, expected: 'staging' },
  { id: 'production', origin: 'https://reiwa.casa', expected: 'main' },
  { id: 'staging', origin: 'https://staging.reiwa.casa', expected: 'staging' },
  { id: 'pages-preview', origin: 'https://abc123.my-blog-3cg.pages.dev', expected: 'staging' },
];

const ARTICLE = { rel: '2026/01/env-branch-mock.md', sha: 'envmock1', title: 'ブランチ導出モック記事' };
const CONTENT = `---\ntitle: ${ARTICLE.title}\ndate: 2026-01-10\ndraft: false\ntags:\n  - テスト\n---\nモック本文です。`;

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css',
  '.yml': 'text/yaml', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
};

// ---- public/_headers をパース（/* と /admin/* のみ） ----
function parseHeaders() {
  const src = readFileSync(join(ROOT, 'public/_headers'), 'utf-8');
  const sections = {};
  let cur = null;
  for (const line of src.split('\n')) {
    if (/^\S/.test(line) && !line.startsWith('#')) { cur = line.trim(); sections[cur] = {}; continue; }
    const m = line.match(/^\s+([\w-]+):\s*(.+)$/);
    if (cur && m) sections[cur][m[1]] = m[2];
  }
  return sections;
}
const HEADERS = parseHeaders();

function resolveDistFile(pathname) {
  let p = decodeURIComponent(pathname);
  if (p.endsWith('/')) p += 'index.html';
  let f = join(DIST, p);
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
  return existsSync(f) ? f : null;
}
function headersFor(pathname, file) {
  const h = { ...(HEADERS['/*'] || {}) };
  if (pathname.startsWith('/admin/')) Object.assign(h, HEADERS['/admin/*'] || {});
  h['Content-Type'] = MIME[extname(file)] || 'application/octet-stream';
  delete h['Strict-Transport-Security'];
  return h;
}

// 3ステップ OAuth ハンドシェイク（Bug #36 の知見どおり）
const AUTH_HTML = `<!DOCTYPE html><html><body><p id="s">auth stub</p><script>
(function(){
  if(!window.opener)return;
  var o=window.opener.location.origin;
  window.opener.postMessage('authorizing:github',o);
  window.addEventListener('message',function(){
    window.opener.postMessage('authorization:github:success:'+JSON.stringify({token:'mock-token',provider:'github'}),o);
    document.getElementById('s').textContent='token sent';
    setTimeout(function(){window.close();},500);
  },{once:true});
})();
</script></body></html>`;

function startLocalServer() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const url = new URL(req.url, `http://localhost:${LOCAL_PORT}`);
      const file = resolveDistFile(url.pathname);
      if (!file) { res.writeHead(404); res.end('Not Found'); return; }
      res.writeHead(200, headersFor(url.pathname, file));
      res.end(readFileSync(file));
    });
    server.listen(LOCAL_PORT, () => resolve(server));
  });
}

async function setupRoutes(context, host, apiCalls) {
  const record = (route) => {
    const r = route.request();
    apiCalls.push({ method: r.method(), url: r.url() });
  };
  const json = (route, status, body) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

  // 本番・staging・プレビューのホスト名はローカル dist から返す（ネットワークに出さない）
  if (host.id !== 'localhost') {
    const hostname = new URL(host.origin).hostname;
    await context.route((u) => u.hostname === hostname && u.pathname !== '/auth', (route) => {
      const u = new URL(route.request().url());
      const file = resolveDistFile(u.pathname);
      if (!file) return route.fulfill({ status: 404, body: 'Not Found (local dist)' });
      return route.fulfill({ status: 200, headers: headersFor(u.pathname, file), body: readFileSync(file) });
    });
  }
  await context.route((u) => u.pathname === '/auth', (route) =>
    route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: AUTH_HTML }));

  // GitHub（catch-all を最初に登録 = 最後に評価）
  await context.route((u) => u.hostname === 'api.github.com' || u.hostname === 'github.com', (route) => { record(route); json(route, 200, {}); });
  await context.route((u) => u.hostname === 'api.github.com' && u.pathname === '/user', (route) => {
    record(route); json(route, 200, { login: 'testuser', id: 1, name: 'Test User', avatar_url: '' });
  });
  await context.route((u) => u.hostname === 'api.github.com' && u.pathname === '/repos/bickojima/my-blog', (route) => {
    record(route);
    json(route, 200, { id: 1, name: 'my-blog', full_name: 'bickojima/my-blog', private: false,
      owner: { login: 'bickojima', id: 1 }, default_branch: 'main', permissions: { admin: true, push: true, pull: true } });
  });
  await context.route((u) => u.hostname === 'api.github.com' && u.pathname.startsWith('/repos/bickojima/my-blog/branches/'), (route) => {
    record(route);
    const name = decodeURIComponent(new URL(route.request().url()).pathname.split('/branches/')[1]);
    json(route, 200, { name, commit: { sha: 'basecommit1', commit: { tree: { sha: 'basetree1' } } } });
  });
  await context.route((u) => u.hostname === 'api.github.com' && u.pathname.startsWith('/repos/bickojima/my-blog/commits'), (route) => {
    record(route);
    json(route, 200, [{ sha: 'basecommit1', commit: { message: 'mock', author: { name: 'x', date: '2026-01-10T00:00:00Z' } } }]);
  });
  await context.route((u) => u.hostname === 'api.github.com' && u.pathname.startsWith('/repos/bickojima/my-blog/git/'), (route) => {
    record(route);
    const req = route.request();
    const url = decodeURIComponent(req.url());
    const m = req.method();
    if (url.includes('/trees') && m === 'GET') {
      const tree = url.includes('content/posts/2026/01')
        ? [{ path: 'env-branch-mock.md', mode: '100644', type: 'blob', sha: ARTICLE.sha }]
        : url.includes('content/posts') ? [{ path: ARTICLE.rel, mode: '100644', type: 'blob', sha: ARTICLE.sha }] : [];
      return json(route, 200, { sha: 'tree1', truncated: false, tree });
    }
    if (url.includes('/blobs') && m === 'GET') {
      return json(route, 200, { sha: ARTICLE.sha, content: Buffer.from(CONTENT).toString('base64'), encoding: 'base64' });
    }
    if (url.includes('/refs')) {
      const ref = new URL(req.url()).pathname.split('/git/')[1];
      return json(route, 200, { ref, object: { sha: m === 'PATCH' ? 'newcommit1' : 'basecommit1', type: 'commit' } });
    }
    if (m === 'POST') return json(route, 201, { sha: 'new-' + Date.now() });
    return json(route, 200, {});
  });
  await context.route((u) => u.hostname === 'api.github.com' && u.pathname.startsWith('/repos/bickojima/my-blog/contents/'), (route) => {
    record(route);
    json(route, 200, { name: 'env-branch-mock.md', sha: ARTICLE.sha, content: Buffer.from(CONTENT).toString('base64'), encoding: 'base64' });
  });
  await context.route((u) => u.hostname === 'api.github.com' && u.pathname.startsWith('/repos/bickojima/my-blog/pulls'), (route) => { record(route); json(route, 200, []); });
}

async function annotate(page, selector, label) {
  await page.evaluate(({ s, l }) => {
    const el = document.querySelector(s);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const d = document.createElement('div');
    d.className = '_rbOverlay';
    d.style.cssText = `position:fixed;top:${r.top - 3}px;left:${Math.max(r.left - 3, 0)}px;width:${r.width + 6}px;height:${r.height + 6}px;border:3px solid red;border-radius:4px;z-index:99999;pointer-events:none;`;
    const lbl = document.createElement('div');
    lbl.style.cssText = 'position:absolute;top:100%;left:0;margin-top:4px;background:red;color:#fff;font-size:12px;padding:2px 6px;white-space:nowrap;';
    lbl.textContent = l;
    d.appendChild(lbl);
    document.body.appendChild(d);
  }, { s: selector, l: label });
}
async function clearOverlays(page) {
  await page.evaluate(() => document.querySelectorAll('._rbOverlay').forEach((e) => e.remove()));
}

/** API 呼び出し URL から参照・更新したブランチ名を抽出する */
function branchesTouched(apiCalls) {
  const set = new Set();
  for (const c of apiCalls) {
    const u = new URL(c.url);
    const p = decodeURIComponent(u.pathname);
    let m;
    if ((m = p.match(/\/git\/trees\/([^:/]+):/))) set.add(m[1]);
    if ((m = p.match(/\/git\/refs\/heads\/([^/]+)$/))) set.add(m[1]);
    if ((m = p.match(/\/branches\/([^/]+)$/))) set.add(m[1]);
    if (u.searchParams.get('sha')) set.add(u.searchParams.get('sha'));
    if (u.searchParams.get('ref')) set.add(u.searchParams.get('ref'));
  }
  return [...set].filter((b) => b === 'main' || b === 'staging');
}

const results = [];

async function runCase(browser, device, host) {
  const context = await browser.newContext({ ...device.config });
  const apiCalls = [];
  const consoleErrors = [];
  await setupRoutes(context, host, apiCalls);
  const page = await context.newPage();
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => consoleErrors.push(String(e)));

  const base = { device: device.name, host: host.id, origin: host.origin, expected: host.expected };
  try {
    await page.goto(host.origin + '/admin/');
    const login = page.getByRole('button', { name: 'GitHub でログインする' });
    await login.waitFor({ state: 'visible', timeout: 30000 });
    const popupPromise = page.waitForEvent('popup', { timeout: 15000 });
    await login.click();
    const popup = await popupPromise;
    const popupUrl = popup.url();
    await popup.waitForEvent('close', { timeout: 15000 }).catch(() => {});

    const entry = page.locator('a[href*="entries/2026/01/env-branch-mock"]').first();
    await entry.waitFor({ state: 'visible', timeout: 30000 });
    await page.waitForTimeout(3000);
    await entry.scrollIntoViewIfNeeded();
    const shotList = `b01-list-${host.id}-${device.name}.png`;
    await annotate(page, 'a[href*="entries/2026/01/env-branch-mock"]', `認証後の一覧（${host.origin}）`);
    await page.screenshot({ path: join(SHOT_DIR, shotList) });
    await clearOverlays(page);
    const popupOk = popupUrl.startsWith(host.origin + '/auth');
    results.push({ ...base, id: 'B01', name: 'ログイン後の記事一覧・ポップアップ URL = origin + /auth', pass: popupOk,
      screenshot: `screenshots/${shotList}`, popupUrl });

    // B02: 実操作で保存
    await entry.click();
    const title = page.locator('input[id^="title-field"]').first();
    await title.waitFor({ state: 'visible', timeout: 20000 });
    await title.fill(`${ARTICLE.title}（${host.id}で更新）`);
    await page.getByRole('button', { name: /^公開$/ }).first().click();
    const publishNow = page.getByRole('menuitem', { name: '公開する', exact: true });
    await publishNow.waitFor({ state: 'visible', timeout: 10000 });
    const clickable = await publishNow.click({ trial: true, timeout: 3000 }).then(() => true, () => false);
    let publishOp = 'click';
    if (clickable) await publishNow.click();
    else { publishOp = 'keyboard Enter（iPhone でメニューが表示領域外。既存事象）'; await publishNow.press('Enter'); }

    const t0 = Date.now();
    while (Date.now() - t0 < 30000 && !apiCalls.some((c) => c.method === 'PATCH' && c.url.includes('/git/refs/'))) {
      await page.waitForTimeout(300);
    }
    await page.waitForTimeout(1500);
    const patches = apiCalls.filter((c) => c.method === 'PATCH' && c.url.includes('/git/refs/')).map((c) => new URL(c.url).pathname);
    const writes = apiCalls.filter((c) => c.method !== 'GET').map((c) => `${c.method} ${new URL(c.url).pathname}`);
    const touched = branchesTouched(apiCalls);
    const pass = patches.length > 0
      && patches.every((p) => p === `/repos/bickojima/my-blog/git/refs/heads/${host.expected}`)
      && touched.length === 1 && touched[0] === host.expected;
    const shotSave = `b02-saved-${host.id}-${device.name}.png`;
    await annotate(page, 'input[id^="title-field"]', `保存 → ${patches[0] || '(書き込みなし)'}（期待: heads/${host.expected}）`);
    await page.screenshot({ path: join(SHOT_DIR, shotSave) });
    results.push({ ...base, id: 'B02', name: '記事を実操作で保存 → 書き込み先 ref', pass, screenshot: `screenshots/${shotSave}`,
      publishOp, measuredRefPatches: patches, writes, branchesTouched: touched,
      consoleErrors: consoleErrors.filter((e) => !/favicon/.test(e)).slice(0, 5) });
  } catch (e) {
    const shot = `error-${host.id}-${device.name}.png`;
    await page.screenshot({ path: join(SHOT_DIR, shot) }).catch(() => {});
    results.push({ ...base, id: 'ERR', name: '例外', pass: false, screenshot: `screenshots/${shot}`, error: String(e).slice(0, 400) });
  }
  await context.close();
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function writeReport() {
  const passed = results.filter((r) => r.pass).length;
  const rows = [];
  for (const host of HOSTS) {
    for (const id of ['B01', 'B02']) {
      const cells = DEVICES.map((d) => {
        const r = results.find((x) => x.host === host.id && x.device === d.name && (x.id === id || x.id === 'ERR'));
        if (!r) return '<td>-</td>';
        const detail = r.id === 'B01' ? { popupUrl: r.popupUrl }
          : r.id === 'B02' ? { measuredRefPatches: r.measuredRefPatches, branchesTouched: r.branchesTouched, publishOp: r.publishOp, writes: r.writes }
            : { error: r.error };
        return `<td><div class="${r.pass ? 'ok' : 'ng'}">${r.pass ? 'PASS' : 'FAIL'}</div><a href="${esc(r.screenshot)}"><img src="${esc(r.screenshot)}" loading="lazy"></a><pre>${esc(JSON.stringify(detail, null, 1))}</pre></td>`;
      }).join('');
      const name = id === 'B01' ? 'ログイン後一覧・ポップアップ URL' : '実操作保存 → 書き込み先 ref';
      rows.push(`<tr><th>${id} ${esc(host.id)}<br><small>${esc(host.origin)}<br>期待: ${esc(host.expected)}<br>${name}</small></th>${cells}</tr>`);
    }
  }
  const html = `<!DOCTYPE html><html lang="ja"><head><meta charset="utf-8"><title>Issue #127 CMS 書き込み先ブランチ E2E</title>
<style>body{font-family:sans-serif;margin:16px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:6px;vertical-align:top}th{width:16%;text-align:left}td img{max-width:100%;border:1px solid #ddd}.ok{color:#fff;background:#1a7f37;display:inline-block;padding:2px 6px}.ng{color:#fff;background:#cf222e;display:inline-block;padding:2px 6px}pre{white-space:pre-wrap;font-size:11px;max-height:200px;overflow:auto}</style></head>
<body><h1>Issue #127: CMS 書き込み先ブランチ・base_url の実行時導出 E2E（2026-09-23）</h1>
<p>Decap CMS 3.16.2（CDN 実物）＋ dist の admin/index.html・cms-env.js・config.yml（branch/base_url なし）。_headers の CSP を付与。OAuth は3ステップハンドシェイクのスタブ、GitHub API は全面モック。本番・staging・プレビューのホスト名はローカル dist で応答（実サーバー通信なし）。config.yml の base_url 一時書き換えは行っていない。結果: <b>${passed}/${results.length} PASS</b></p>
<table><tr><th>シナリオ</th>${DEVICES.map((d) => `<th>${d.name}</th>`).join('')}</tr>${rows.join('')}</table></body></html>`;
  writeFileSync(join(OUT_DIR, 'report.html'), html);
}

async function main() {
  if (!existsSync(join(DIST, 'admin/cms-env.js'))) throw new Error('dist/admin/cms-env.js がありません。npm run build:raw を先に実行してください');
  const cfg = readFileSync(join(DIST, 'admin/config.yml'), 'utf-8');
  if (/^\s*(branch|base_url):/m.test(cfg)) throw new Error('dist/admin/config.yml に branch/base_url が残っています');
  const server = await startLocalServer();
  const browser = await chromium.launch();
  try {
    for (const device of DEVICES) {
      for (const host of HOSTS) {
        console.log(`[${device.name}] ${host.id}`);
        await runCase(browser, device, host);
      }
    }
  } finally {
    await browser.close();
    server.close();
  }
  writeFileSync(join(OUT_DIR, 'cms-branch-results.json'), JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2));
  writeReport();
  const failed = results.filter((r) => !r.pass);
  console.log(`${results.length - failed.length}/${results.length} PASS`);
  for (const f of failed) console.log('FAIL', JSON.stringify(f).slice(0, 400));
  process.exitCode = failed.length ? 1 : 0;
}

main();
