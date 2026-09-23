/**
 * Issue #130 検証スクリプト: 管理画面（/admin/*）CSP 下での CMS 実操作と CSP 違反収集（SEC-41）
 *
 * 目的:
 *   /admin/* の CSP は Cloudflare Web Analytics（static.cloudflareinsights.com）を意図的に許可していない。
 *   CSP を緩めないまま、CMS の実操作（記事を開く→本文入力→プレビュー→保存）に
 *   cloudflareinsights 以外の CSP 違反や機能エラーが出ないことを確認する。
 *
 * 検証モード:
 *   [L] ローカル（wrangler pages dev で dist/_headers の CSP をレスポンスヘッダとして付与）
 *       L-A: そのまま（ローカルではビーコンが注入されないため CSP 違反ゼロが合格条件）
 *       L-B: 本番相当の再現として、Cloudflare が注入するビーコン <script> を admin HTML に差し込む
 *            （CSP 違反が cloudflareinsights 由来のみであることが合格条件）
 *   [R] 本番 https://reiwa.casa/admin/ と staging https://staging.reiwa.casa/admin/ の実配信物を使用
 *       ログインボタンを実クリックするが、OAuth callback と GitHub API は全てモックする。
 *       GitHub API の全書き込みは Playwright route 内で成功応答し、モック外の書き込みは遮断する。
 *       保存要求先 ref が本番 main / staging staging であることも検証する。
 *
 * 認証方式（L のみ）: context.route() + 3ステップOAuthハンドシェイク（雛形: evidence/2026-05-24/verify-comprehensive.mjs）
 *   config.yml の base_url は変更しない。popup の /auth を context.route() で横取りし、
 *   モックページは base_url と同じオリジンで応答する（Decap の origin 検証をそのまま通す）。
 *   モックページから opener の origin は読めないため、postMessage の targetOrigin は '*'（テスト用モックのみ）。
 * GitHub API: context.route() で全面モック（保存は成功レスポンスを返す）
 *
 * デバイス: PC (1280x800) / iPad Pro 11 (834x1194) / iPhone 14 (390x844)
 *
 * 使用方法:
 *   1. npm run build:raw
 *   2. node evidence/2026-09-23/issue130/verify-issue130-admin-csp.mjs
 *      （wrangler pages dev は未起動なら本スクリプトが起動・終了する）
 *   環境変数 SKIP_REMOTE=1 で本番/staging 実配信物のE2Eを省略
 */

import { chromium, devices } from 'playwright';
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { spawn } from 'child_process';

const PORT = 8799;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const TODAY = '2026-09-23';
const EVIDENCE_DIR = join(process.cwd(), 'evidence', TODAY, 'issue130-review');
const SCREENSHOT_DIR = join(EVIDENCE_DIR, 'screenshots');
mkdirSync(SCREENSHOT_DIR, { recursive: true });

const REMOTE_TARGETS = [
  { env: 'production', url: 'https://reiwa.casa/admin/' },
  { env: 'staging', url: 'https://staging.reiwa.casa/admin/' },
];

const DEVICES_CONFIG = [
  { name: 'PC',     config: { viewport: { width: 1280, height: 800 } } },
  { name: 'iPad',   config: devices['iPad Pro 11'] },
  { name: 'iPhone', config: devices['iPhone 14'] },
];

// Cloudflare が本番で自動挿入するビーコンと同形式のタグ（L-B で差し込む。実際の送信は CSP とルートで遮断される）
const BEACON_TAG = `<script defer src="https://static.cloudflareinsights.com/beacon.min.js/v8c78df7c7c0f484497ecbca7046644da1771523124516" data-cf-beacon='{"token":"issue130-dummy-token"}' crossorigin="anonymous"></script>`;

// モック記事（パスはfolder相対）
const ARTICLES = [
  { path: '2026/09/issue130-a.md', sha: 'a1', title: 'CSP検証用記事A', date: '2026-09-20', draft: false, tags: ['検証'] },
  { path: '2026/08/issue130-b.md', sha: 'a2', title: 'CSP検証用記事B', date: '2026-08-10', draft: false, tags: ['検証'] },
];
const PAGES = [
  { path: 'about.md', sha: 'p1', title: '検証用固定ページ', slug: 'about', order: 1, draft: false },
];
const BODY_TEXT = 'Issue130 CSP検証の本文入力';

function makeArticleContent(a) {
  return `---\ntitle: ${a.title}\ndate: ${a.date}\ndraft: ${a.draft}\ntags: [${a.tags.map(t => `"${t}"`).join(', ')}]\n---\n${a.title}の本文テキスト。`;
}
function makePageContent(p) {
  return `---\ntitle: ${p.title}\nslug: ${p.slug}\norder: ${p.order}\ndraft: ${p.draft}\n---\n${p.title}の本文テキスト。`;
}

const results = [];
const runs = [];

// ===== wrangler pages dev（_headers を実レスポンスヘッダとして適用） =====
async function isUp() {
  try { const r = await fetch(`${BASE_URL}/admin/`); return r.ok; } catch { return false; }
}
async function startWrangler() {
  if (await isUp()) return null;
  const child = spawn('npx', ['--yes', 'wrangler@4.136.3', 'pages', 'dev', 'dist', '--port', String(PORT), '--ip', '127.0.0.1'],
    { cwd: process.cwd(), stdio: 'ignore' });
  for (let i = 0; i < 90; i++) {
    if (await isUp()) return child;
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error('wrangler pages dev が起動しない');
}

// ===== CSP 違反・コンソールエラー収集 =====
function isInsights(text) { return /cloudflareinsights/i.test(text || ''); }

async function attachCollectors(context, sink) {
  // securitypolicyviolation はすべてのフレーム（プレビュー iframe を含む）で拾う
  await context.exposeBinding('__issue130ReportCsp', (source, v) => {
    sink.violations.push({ ...v, frameUrl: source.frame?.url?.() || '' });
  });
  await context.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (e) => {
      try {
        window.__issue130ReportCsp({
          blockedURI: e.blockedURI, violatedDirective: e.violatedDirective,
          effectiveDirective: e.effectiveDirective, sourceFile: e.sourceFile,
          disposition: e.disposition, documentURI: e.documentURI,
        });
      } catch {}
    }, true);
  });
}
function attachPageCollectors(page, sink) {
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    sink.consoleErrors.push({ text: text.substring(0, 500), url: msg.location()?.url || '', isCsp: /Content Security Policy/i.test(text) });
  });
  page.on('pageerror', (err) => sink.pageErrors.push(String(err?.message || err).substring(0, 500)));
  page.on('requestfailed', (req) => {
    sink.failedRequests.push({ url: req.url().substring(0, 200), error: req.failure()?.errorText || '' });
  });
}
function summarizeSink(sink) {
  const cspViolations = sink.violations.map(v => ({ blockedURI: v.blockedURI, directive: v.effectiveDirective || v.violatedDirective, sourceFile: v.sourceFile, frameUrl: v.frameUrl }));
  const nonInsightsViolations = cspViolations.filter(v => !isInsights(v.blockedURI) && !isInsights(v.sourceFile));
  const cspConsole = sink.consoleErrors.filter(e => e.isCsp);
  const nonInsightsCspConsole = cspConsole.filter(e => !isInsights(e.text));
  // CSP 以外のコンソールエラー（機能エラー候補）。ビーコン自体のブロック（net::ERR_BLOCKED_BY_CLIENT 等）は除外
  const functionalConsole = sink.consoleErrors.filter(e => !e.isCsp && !isInsights(e.text) && !isInsights(e.url));
  const failedNonInsights = sink.failedRequests.filter(r => !isInsights(r.url));
  return { cspViolations, nonInsightsViolations, cspConsole, nonInsightsCspConsole, functionalConsole, pageErrors: sink.pageErrors, failedRequests: sink.failedRequests, failedNonInsights };
}

// ===== GitHub API + OAuth モック =====
async function setupMocks(context, apiLog) {
  // OAuth 3ステップハンドシェイク（/auth は base_url 側の URL で開かれ、ここで横取りする）
  await context.route(url => url.pathname === '/auth', (route) => {
    route.fulfill({
      status: 200, contentType: 'text/html',
      body: `<!DOCTYPE html><html><body><script>
(function(){
  if(!window.opener)return;
  window.opener.postMessage('authorizing:github','*');
  window.addEventListener('message',function(){
    window.opener.postMessage('authorization:github:success:'+JSON.stringify({token:'mock-token',provider:'github'}),'*');
    setTimeout(function(){window.close();},500);
  },{once:true});
})();
</script></body></html>`,
    });
  });

  // ビーコンの実送信は行わない（CSP で先に遮断される想定だが、ネットワークにも出さない）
  await context.route(url => url.hostname.endsWith('cloudflareinsights.com'), (route) => route.abort('blockedbyclient'));

  await context.route(url => url.hostname === 'api.github.com', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });
  await context.route(url => url.hostname === 'api.github.com' && url.pathname === '/user', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ login: 'testuser', id: 1, name: 'Test User', avatar_url: '' }) });
  });
  await context.route(url => url.hostname === 'api.github.com' && url.pathname === '/repos/bickojima/my-blog', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ id: 1, name: 'my-blog', full_name: 'bickojima/my-blog', private: false,
        owner: { login: 'bickojima', id: 1 }, default_branch: 'staging',
        permissions: { admin: true, push: true, pull: true } }) });
  });
  await context.route('**/repos/bickojima/my-blog/branches/**', (route) => {
    const name = route.request().url().split('/').pop();
    route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ name, commit: { sha: 'abc123', commit: { tree: { sha: 'tree1' } } } }) });
  });
  await context.route('**/repos/bickojima/my-blog/commits**', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify([{ sha: 'c1', commit: { message: 'test', author: { name: 'testuser', date: '2026-09-20T00:00:00Z' } } }]) });
  });
  await context.route('**/repos/bickojima/my-blog/git/**', (route) => {
    const url = route.request().url();
    const method = route.request().method();
    const all = [...ARTICLES, ...PAGES];
    if (url.includes('/trees') && method === 'GET') {
      // /git/trees/{branch}:{dir} の dir を解釈し、そのディレクトリからの相対パスで返す
      // （一覧は posts/pages 直下を recursive で、編集画面は記事の親ディレクトリを要求して sha を引く）
      const ref = decodeURIComponent(new URL(url).pathname.split('/git/trees/')[1] || '');
      const dir = ref.includes(':') ? ref.split(':').slice(1).join(':').replace(/\/$/, '') : '';
      let base = all;
      let rel = '';
      if (dir.startsWith('src/content/posts')) { base = ARTICLES; rel = dir.slice('src/content/posts'.length).replace(/^\//, ''); }
      else if (dir.startsWith('src/content/pages')) { base = PAGES; rel = dir.slice('src/content/pages'.length).replace(/^\//, ''); }
      const prefix = rel ? rel + '/' : '';
      const entries = base.filter(f => f.path.startsWith(prefix)).map(f => ({ ...f, path: f.path.slice(prefix.length) }));
      route.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ sha: 'tree1', truncated: false, tree: entries.map(f => ({ path: f.path, mode: '100644', type: 'blob', sha: f.sha })) }) });
    } else if (url.includes('/blobs') && method === 'GET') {
      const match = all.find(f => new URL(url).pathname.endsWith('/' + f.sha));
      const content = match ? (match.slug !== undefined ? makePageContent(match) : makeArticleContent(match)) : makeArticleContent(ARTICLES[0]);
      if (/raw/.test(route.request().headers()['accept'] || '')) {
        route.fulfill({ status: 200, contentType: 'text/plain; charset=utf-8', body: content });
      } else {
        route.fulfill({ status: 200, contentType: 'application/json',
          body: JSON.stringify({ sha: match?.sha || 'x', content: Buffer.from(content).toString('base64'), encoding: 'base64' }) });
      }
    } else if (url.includes('/refs')) {
      route.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ ref: 'refs/heads/staging', object: { sha: 'newcommit1', type: 'commit' } }) });
    } else if (url.includes('/commits') && method === 'GET') {
      route.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ sha: 'abc123', tree: { sha: 'tree1' }, parents: [] }) });
    } else if (method === 'POST') {
      route.fulfill({ status: 201, contentType: 'application/json',
        body: JSON.stringify({ sha: 'new' + Date.now(), url: '', tree: { sha: 'tree2' } }) });
    } else {
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    }
  });
  await context.route('**/repos/bickojima/my-blog/contents/**', (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      const url = decodeURIComponent(route.request().url());
      const all = [...ARTICLES, ...PAGES];
      const match = all.find(f => url.includes(f.path));
      const content = match ? (match.slug !== undefined ? makePageContent(match) : makeArticleContent(match)) : makeArticleContent(ARTICLES[0]);
      route.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ name: 'file.md', sha: match?.sha || 'x', content: Buffer.from(content).toString('base64'), encoding: 'base64' }) });
    } else {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ content: { sha: 'new456' }, commit: { sha: 'c2' } }) });
    }
  });
  await context.route('**/repos/bickojima/my-blog/pulls**', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });
  // 最後に登録したハンドラが最初に評価されるため、ログ記録は末尾で登録して fallback する
  await context.route(url => url.hostname === 'api.github.com', (route) => {
    const req = route.request();
    apiLog.push({ method: req.method(), path: new URL(req.url()).pathname });
    route.fallback();
  });
}

// L-B: admin HTML にビーコンタグを差し込む（レスポンスヘッダ＝wrangler が付けた CSP はそのまま維持）
async function injectBeacon(context) {
  await context.route(url => url.origin === BASE_URL && (url.pathname === '/admin/' || url.pathname === '/admin/index.html'), async (route) => {
    const response = await route.fetch();
    const html = await response.text();
    route.fulfill({ response, body: html.replace('</body>', `${BEACON_TAG}</body>`) });
  });
}

// ===== アノテーション =====
async function addRedBox(page, locatorOrSelector, label) {
  const loc = typeof locatorOrSelector === 'string' ? page.locator(locatorOrSelector).first() : locatorOrSelector;
  // アノテーション専用: 撮影範囲に対象が入るよう Playwright でスクロールし、
  // ドキュメント座標（absolute）で赤枠を置く。狭い画面では layout viewport と visual viewport が
  // ずれるため fixed 座標は使わない。合否判定には使わない
  await loc.scrollIntoViewIfNeeded().catch(() => {});
  return loc.evaluate((el, l) => {
    const r = el.getBoundingClientRect();
    if (!r.width && !r.height) return false;
    const vvTop = window.visualViewport ? window.visualViewport.pageTop : window.scrollY;
    const d = document.createElement('div');
    d.className = '_rbOverlay';
    d.style.cssText = `position:absolute;top:${r.top + window.scrollY - 3}px;left:${r.left + window.scrollX - 3}px;width:${r.width + 6}px;height:${r.height + 6}px;border:3px solid red;border-radius:4px;z-index:2147483646;pointer-events:none;box-sizing:border-box;`;
    const lbl = document.createElement('div');
    lbl.style.cssText = `position:absolute;${r.top + window.scrollY - vvTop < 26 ? 'bottom:-22px' : 'top:-22px'};left:0;background:red;color:#fff;font-size:12px;padding:2px 6px;border-radius:2px;white-space:nowrap;font-family:sans-serif;`;
    lbl.textContent = l;
    d.appendChild(lbl);
    document.body.appendChild(d);
    return true;
  }, label).catch(() => false);
}
async function addBanner(page, text, ok) {
  await page.evaluate(({ t, ok }) => {
    const d = document.createElement('div');
    d.className = '_rbOverlay';
    // 狭い画面では layout viewport が visual viewport より広くなるため、fixed ではなく
    // visual viewport 基準の absolute で、画面に写る範囲の上端に置く
    const vv = window.visualViewport;
    const left = (vv ? vv.pageLeft : window.scrollX) + 8;
    const top = (vv ? vv.pageTop : window.scrollY) + 8;
    const width = (vv ? vv.width : window.innerWidth) - 16;
    d.style.cssText = `position:absolute;left:${left}px;top:${top}px;width:${width}px;box-sizing:border-box;z-index:2147483647;background:${ok ? '#1b5e20' : '#b71c1c'};color:#fff;font:12px/1.5 sans-serif;padding:6px 10px;border:3px solid red;border-radius:4px;white-space:pre-wrap;pointer-events:none;`;
    d.textContent = t;
    document.body.appendChild(d);
  }, { t: text, ok });
}
async function clearOverlays(page) {
  await page.evaluate(() => document.querySelectorAll('._rbOverlay').forEach(e => e.remove())).catch(() => {});
}
async function shot(page, file) {
  await page.screenshot({ path: join(SCREENSHOT_DIR, file) });
  await clearOverlays(page);
  return `screenshots/${file}`;
}

function record(r) {
  console.log(`    [${r.pass ? 'PASS' : 'FAIL'}] ${r.id} ${r.device}: ${r.name}${r.pass ? '' : ' ' + JSON.stringify(r.detail || {}).substring(0, 300)}`);
  results.push(r);
}

// ===== CMS 認証（実クリック） =====
async function openCmsWithAuth(page, baseUrl = BASE_URL) {
  await page.goto(baseUrl + '/admin/');
  const loginButton = page.getByRole('button', { name: /GitHub でログインする/ });
  await loginButton.waitFor({ state: 'visible', timeout: 30000 });
  const popupPromise = page.waitForEvent('popup', { timeout: 15000 }).catch(() => null);
  await loginButton.click();
  const popup = await popupPromise;
  if (popup) await popup.waitForEvent('close', { timeout: 15000 }).catch(() => popup.close().catch(() => {}));
  const card = page.locator('[class*="ListCardLink"], [class*="ListCard"] a').first();
  await card.waitFor({ state: 'visible', timeout: 30000 });
  await page.waitForTimeout(2500); // 独自カスタマイズ（グルーピング等）の適用待ち
  await page.locator('[class*="DropdownList"]:visible').first().waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});
}

// ===== ローカル/実ホスト: CMS 実操作シナリオ =====
async function runCms(browser, dev, mode, options = {}) {
  const baseUrl = options.baseUrl || BASE_URL;
  const kind = options.kind || 'local';
  const expectedBranch = options.expectedBranch || 'staging';
  const prefix = options.prefix || `L${mode}`;
  const tag = options.tag || (mode === 'A' ? 'ローカル' : 'ローカル+ビーコン注入');
  const sink = { violations: [], consoleErrors: [], pageErrors: [], failedRequests: [] };
  const apiLog = [];
  const blockedWrites = [];
  const context = await browser.newContext({ ...dev.config, locale: 'ja-JP' });
  await attachCollectors(context, sink);
  if (kind === 'remote') {
    // 実ホストのOAuthと配信物を使い、GitHub APIは全面モックする。
    // モックに一致しない非GETリクエストはネットワークへ出さず失敗として記録する。
    await context.route('**/*', (route) => {
      const req = route.request();
      const url = new URL(req.url());
      if (url.hostname === 'api.github.com') {
        blockedWrites.push(`UNMOCKED ${req.method()} ${req.url().substring(0, 150)}`);
        return route.abort('blockedbyclient');
      }
      if (['GET', 'HEAD', 'OPTIONS'].includes(req.method())) return route.continue();
      blockedWrites.push(`${req.method()} ${req.url().substring(0, 150)}`);
      return route.abort('blockedbyclient');
    });
  }
  await setupMocks(context, apiLog);
  if (mode === 'B' && kind === 'local') await injectBeacon(context);
  const page = await context.newPage();
  attachPageCollectors(page, sink);
  let cspHeader = '';
  page.on('response', (res) => {
    if (res.url().startsWith(baseUrl + '/admin/') && res.request().resourceType() === 'document') {
      cspHeader = res.headers()['content-security-policy'] || cspHeader;
    }
  });

  console.log(`\n  --- [${tag}] ${dev.name} ---`);
  try {
    // 01: 認証後の記事一覧
    await openCmsWithAuth(page, baseUrl);
    const card = page.locator('[class*="ListCardLink"], [class*="ListCard"] a').first();
    // 年月グルーピング（CMS-19）の自動有効化で開いたドロップダウンが残っているかを記録する（CSPとは別観点の観察）
    const groupingMenuOpen = await page.locator('[class*="DropdownList"]').first().isVisible().catch(() => false);
    await card.scrollIntoViewIfNeeded().catch(() => {});
    const narrow = (dev.config.viewport?.width || 0) <= 799;
    await addRedBox(page, card, groupingMenuOpen && narrow
      ? '認証後の記事カード（年月メニューが重なって表示。ここをクリック）'
      : '認証後の記事一覧（ここをクリック）');
    const s1 = await shot(page, `${prefix}-01-collection-${dev.name}.png`);
    record({ device: dev.name, mode, id: `${prefix}-01`, name: `${tag}: 認証後に記事一覧が表示される`, pass: true, screenshot: s1, detail: { groupingMenuOpen } });

    // 02: 記事をクリックして編集画面を開く
    await card.click();
    const editor = page.locator('[data-slate-editor="true"]').first();
    await editor.waitFor({ state: 'visible', timeout: 30000 });
    await page.locator('[class*="EditorControlPane"] input').first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    await editor.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    await addRedBox(page, editor, '記事編集画面の本文エディタ');
    const s2 = await shot(page, `${prefix}-02-editor-${dev.name}.png`);
    record({ device: dev.name, mode, id: `${prefix}-02`, name: `${tag}: 記事をクリックで開き編集画面が表示される`, pass: true, screenshot: s2 });

    // 03: 本文を入力（クリック→末尾へ移動→キーボード入力）
    await editor.click();
    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+ArrowDown' : 'Control+End');
    await page.keyboard.press('End');
    await page.keyboard.type(' ' + BODY_TEXT, { delay: 10 });
    await page.waitForTimeout(800);
    const bodyText = await editor.textContent();
    const typedOk = (bodyText || '').includes(BODY_TEXT);
    await editor.scrollIntoViewIfNeeded().catch(() => {});
    await addRedBox(page, editor, '本文を入力');
    const s3 = await shot(page, `${prefix}-03-typed-${dev.name}.png`);
    record({ device: dev.name, mode, id: `${prefix}-03`, name: `${tag}: 本文をキーボード入力できる`, pass: typedOk, screenshot: s3, detail: { bodyTail: (bodyText || '').slice(-60) } });

    // 04: プレビュー表示（非表示なら「プレビュー」トグルを押す）
    const previewFrame = page.locator('[class*="PreviewPane"] iframe, iframe[class*="PreviewPaneFrame"], iframe').first();
    let previewShown = await previewFrame.isVisible().catch(() => false);
    let toggled = false;
    if (!previewShown) {
      const toggle = page.locator('button[title*="プレビュー"], button[title*="preview" i]').first();
      if (await toggle.isVisible().catch(() => false)) {
        await toggle.click();
        toggled = true;
        await previewFrame.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
        previewShown = await previewFrame.isVisible().catch(() => false);
      }
    }
    let previewHasText = false;
    if (previewShown) {
      const frame = await (await previewFrame.elementHandle())?.contentFrame();
      for (let i = 0; i < 10 && frame && !previewHasText; i++) {
        previewHasText = ((await frame.locator('body').textContent().catch(() => '')) || '').includes(BODY_TEXT);
        if (!previewHasText) await page.waitForTimeout(500);
      }
      await previewFrame.scrollIntoViewIfNeeded().catch(() => {});
      await addRedBox(page, previewFrame, `プレビュー表示（入力本文を反映${previewHasText ? '済' : '未確認'}）`);
    }
    const s4 = await shot(page, `${prefix}-04-preview-${dev.name}.png`);
    record({ device: dev.name, mode, id: `${prefix}-04`, name: `${tag}: プレビューに入力本文が表示される`, pass: previewShown && previewHasText, screenshot: s4, detail: { previewShown, previewHasText, toggled } });
    // iPhone 幅では Decap のエディタが幅800pxで描画され window.innerWidth が 800 になる（実測）。
    // このとき「公開」ボトムシートの項目は、プレビューを閉じても Playwright の実クリックが別要素
    // （Editor の div）に遮られる。Issue #130（CSP）とは別系統の既存挙動のため、結果JSONの
    // publishMethod / clickBlockedBy / layoutBefore に記録し、work-completion-report.html に懸念として残す。
    // 狭い画面では利用者と同じくプレビュー表示を閉じてから保存する。
    const layoutBefore = await page.evaluate(() => ({ innerWidth: window.innerWidth, urlBarDisplay: document.getElementById('cms-public-url')?.style.display ?? null }));
    let previewClosedForSave = false;
    if (toggled || (dev.config.viewport?.width || 0) <= 799) {
      const toggle = page.locator('button[title*="プレビュー"], button[title*="preview" i]').first();
      if (await toggle.isVisible().catch(() => false)) {
        await toggle.click();
        previewClosedForSave = true;
        await page.waitForTimeout(800);
      }
    }
    const layoutAfter = await page.evaluate(() => ({ innerWidth: window.innerWidth }));

    // 05: 保存（公開→今すぐ公開）。GitHub API モックで成功させる
    const writesBefore = apiLog.filter(a => a.method !== 'GET').length;
    const publishBtn = page.locator('button, [role="button"]').filter({ hasText: /^公開$|^Publish$/ }).first();
    await publishBtn.waitFor({ state: 'visible', timeout: 10000 });
    await publishBtn.click();
    const publishNow = page.getByText(/^\s*(公開する|今すぐ公開|Publish now)\s*$/).first();
    await publishNow.waitFor({ state: 'visible', timeout: 10000 });
    await publishNow.scrollIntoViewIfNeeded().catch(() => {});
    await addRedBox(page, publishNow, '今すぐ公開（保存）をクリック');
    const s5a = await shot(page, `${prefix}-05-publish-menu-${dev.name}.png`);
    // まずクリック（タップ相当）。別要素に遮られてクリックできない場合（上記の既存挙動）は
    // キーボード操作（ArrowDown→Enter。react-aria-menubutton のメニュー操作）で同じ項目を選ぶ
    let publishMethod = 'click';
    let clickBlockedBy = '';
    try {
      await publishNow.click({ timeout: 5000 });
    } catch (e) {
      clickBlockedBy = (String(e.message).match(/<[a-z]+ class="[^"]*"[^>]*>/g) || []).pop() || String(e.message).substring(0, 120);
      publishMethod = 'keyboard(ArrowDown+Enter)';
      await page.keyboard.press('ArrowDown');
      const focused = await page.evaluate(() => document.activeElement?.textContent?.trim() || '');
      if (!/公開する|今すぐ公開|Publish now/.test(focused)) throw new Error(`キーボードで公開メニュー項目にフォーカスできない（focused=${focused}）`);
      await page.keyboard.press('Enter');
    }
    let saved = false;
    let notice = '';
    for (let i = 0; i < 30 && !saved; i++) {
      await page.waitForTimeout(500);
      notice = (await page.locator('[class*="Toast"], [class*="notif"], [role="alert"]').allTextContents().catch(() => [])).join(' | ');
      saved = /保存|公開しました|saved|published/i.test(notice) && !/失敗|fail|error/i.test(notice);
    }
    const writes = apiLog.filter(a => a.method !== 'GET').slice(writesBefore);
    const toast = page.getByText(/保存しました|公開しました/).first();
    await toast.scrollIntoViewIfNeeded().catch(() => {});
    await addRedBox(page, toast, '保存成功通知');
    const s5 = await shot(page, `${prefix}-05-saved-${dev.name}.png`);
    const branchUpdate = writes.find(w => w.method === 'PATCH' && w.path.endsWith(`/refs/heads/${expectedBranch}`));
    record({ device: dev.name, mode, id: `${prefix}-05`, name: `${tag}: 保存（今すぐ公開）が成功し${expectedBranch}を要求する`, pass: saved && Boolean(branchUpdate) && blockedWrites.length === 0, screenshot: s5, extraScreenshot: s5a, detail: { notice: notice.substring(0, 200), writes: writes.map(w => `${w.method} ${w.path}`), expectedBranch, branchUpdate: branchUpdate?.path || null, blockedWrites, previewClosedForSave, layoutBefore, layoutAfter, publishMethod, clickBlockedBy } });

    await page.waitForTimeout(2000);
  } catch (e) {
    const sErr = await shot(page, `${prefix}-99-error-${dev.name}.png`).catch(() => '');
    record({ device: dev.name, mode, id: `${prefix}-ERR`, name: `${tag}: 実行エラー`, pass: false, screenshot: sErr, detail: { error: String(e.message || e).substring(0, 400) } });
  }

  // 06: CSP 違反の判定
  const sum = summarizeSink(sink);
  const insightsCount = sum.cspViolations.filter(v => isInsights(v.blockedURI) || isInsights(v.sourceFile)).length;
  const cspPass = mode === 'A'
    ? sum.cspViolations.length === 0 && sum.cspConsole.length === 0
    : sum.nonInsightsViolations.length === 0 && sum.nonInsightsCspConsole.length === 0 && insightsCount > 0;
  const funcPass = sum.functionalConsole.length === 0 && sum.pageErrors.length === 0;
  const summaryText = [
    `[${tag} / ${dev.name}] CSP違反 ${sum.cspViolations.length}件（cloudflareinsights ${insightsCount}件 / それ以外 ${sum.nonInsightsViolations.length}件）`,
    `CSP関連コンソールエラー ${sum.cspConsole.length}件（cloudflareinsights以外 ${sum.nonInsightsCspConsole.length}件）/ 機能エラー ${sum.functionalConsole.length + sum.pageErrors.length}件`,
    `レスポンスCSPに cloudflareinsights: ${/cloudflareinsights/i.test(cspHeader) ? 'あり' : 'なし'}`,
  ].join('\n');
  await addBanner(page, summaryText, cspPass && funcPass).catch(() => {});
  const s6 = await shot(page, `${prefix}-06-csp-summary-${dev.name}.png`).catch(() => '');
  record({ device: dev.name, mode, id: `${prefix}-06`, name: `${tag}: ${mode === 'A' ? 'CSP違反ゼロ' : 'CSP違反はcloudflareinsights由来のみ'}・機能エラーなし`, pass: cspPass && funcPass, screenshot: s6, detail: { cspPass, funcPass } });

  runs.push({ kind, env: options.env || 'local', url: baseUrl, expectedBranch, mode, device: dev.name, cspHeader, apiWrites: apiLog.filter(a => a.method !== 'GET'), blockedWrites, ...sum });
  await context.close();
}

// ===== 本番/staging: ログイン前の読み取り専用確認 =====
async function runRemote(browser, dev, target) {
  const sink = { violations: [], consoleErrors: [], pageErrors: [], failedRequests: [] };
  const context = await browser.newContext({ ...dev.config, locale: 'ja-JP' });
  await attachCollectors(context, sink);
  // 読み取り専用の保証: GET/HEAD 以外のリクエストはブラウザから外に出さない
  const blockedWrites = [];
  await context.route('**/*', (route) => {
    const m = route.request().method();
    if (m === 'GET' || m === 'HEAD' || m === 'OPTIONS') return route.continue();
    blockedWrites.push(`${m} ${route.request().url().substring(0, 150)}`);
    return route.abort('blockedbyclient');
  });
  const page = await context.newPage();
  attachPageCollectors(page, sink);
  const tag = target.env === 'production' ? '本番' : 'staging';
  const id = target.env === 'production' ? 'R-PROD' : 'R-STG';
  console.log(`\n  --- [${tag} 読み取り] ${dev.name} ---`);
  let cspHeader = '';
  let status = 0;
  let loginVisible = false;
  try {
    const res = await page.goto(target.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    status = res?.status() || 0;
    cspHeader = res?.headers()['content-security-policy'] || '';
    const loginButton = page.getByRole('button', { name: /GitHub でログインする/ });
    loginVisible = await loginButton.waitFor({ state: 'visible', timeout: 30000 }).then(() => true).catch(() => false);
    await page.waitForTimeout(6000); // ビーコン読込・遅延スクリプトの違反を拾う
    if (loginVisible) await addRedBox(page, loginButton, 'ログイン画面（ボタンは押さない）');
  } catch (e) {
    sink.pageErrors.push('navigation: ' + String(e.message || e).substring(0, 300));
  }
  const sum = summarizeSink(sink);
  const insightsCount = sum.cspViolations.filter(v => isInsights(v.blockedURI) || isInsights(v.sourceFile)).length;
  const pass = status === 200 && loginVisible && sum.nonInsightsViolations.length === 0 && sum.nonInsightsCspConsole.length === 0 && blockedWrites.length === 0;
  await addBanner(page, `[${tag} 読み取りのみ / ${dev.name}] HTTP ${status} / CSP違反 ${sum.cspViolations.length}件（cloudflareinsights ${insightsCount}件 / それ以外 ${sum.nonInsightsViolations.length}件）\nCSPに cloudflareinsights: ${/cloudflareinsights/i.test(cspHeader) ? 'あり' : 'なし'} / 書き込み系リクエスト ${blockedWrites.length}件`, pass).catch(() => {});
  const s = await shot(page, `${id}-login-${dev.name}.png`).catch(() => '');
  record({ device: dev.name, mode: target.env, id, name: `${tag} /admin/（読み取りのみ）: CSP違反はcloudflareinsights由来のみ`, pass, screenshot: s, detail: { status, loginVisible, insightsCount, nonInsights: sum.nonInsightsViolations.length, blockedWrites } });
  runs.push({ kind: 'remote', env: target.env, url: target.url, device: dev.name, status, loginVisible, cspHeader, blockedWrites, ...sum });
  await context.close();
}

// ===== レポート =====
function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function generateReport() {
  const deviceNames = ['PC', 'iPad', 'iPhone'];
  const ids = [...new Set(results.map(r => r.id))];
  const pass = results.filter(r => r.pass).length;
  const fail = results.length - pass;
  let rows = '';
  for (const id of ids) {
    const rs = results.filter(r => r.id === id);
    let cells = `<td class="name">[${esc(id)}] ${esc(rs[0].name)}</td>`;
    for (const dn of deviceNames) {
      const r = rs.find(x => x.device === dn);
      if (!r) { cells += '<td class="na">-</td>'; continue; }
      const imgs = [r.extraScreenshot, r.screenshot].filter(Boolean).map(s => `<a href="${esc(s)}"><img src="${esc(s)}" alt="${esc(id)} ${dn}"></a>`).join('');
      cells += `<td class="${r.pass ? 'pass' : 'fail'}">${imgs}<strong>${r.pass ? 'PASS' : 'FAIL'}</strong>${r.pass ? '' : `<pre>${esc(JSON.stringify(r.detail || {}, null, 1)).substring(0, 500)}</pre>`}</td>`;
    }
    rows += `<tr>${cells}</tr>`;
  }
  let vrows = '';
  for (const run of runs) {
    const label = run.kind === 'local' ? `ローカル${run.mode === 'A' ? '' : '+ビーコン注入'}` : (run.env === 'production' ? '本番' : 'staging');
    const list = run.cspViolations.length
      ? run.cspViolations.map(v => `${esc(v.directive)} ← ${esc(v.blockedURI)}`).join('<br>')
      : '（なし）';
    const func = [...run.functionalConsole.map(e => e.text), ...run.pageErrors].map(esc).join('<br>') || '（なし）';
    vrows += `<tr><td>${esc(label)}</td><td>${esc(run.device)}</td><td>${run.cspViolations.length}</td><td>${run.nonInsightsViolations.length}</td><td class="l">${list}</td><td class="l">${func}</td></tr>`;
  }
  const html = `<!DOCTYPE html>
<html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Issue #130 管理画面CSP検証</title>
<style>
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:20px;background:#f5f5f5;color:#222}
h1{border-bottom:3px solid #333;padding-bottom:8px}h2{border-left:4px solid #1565c0;padding-left:10px;margin-top:28px}
.summary{background:${fail === 0 ? '#e8f5e9' : '#fff3e0'};border-left:4px solid ${fail === 0 ? '#2e7d32' : '#ef6c00'};padding:12px 16px;border-radius:6px}
table{border-collapse:collapse;width:100%;background:#fff;margin:10px 0}th{background:#37474f;color:#fff;padding:8px}
td{border:1px solid #ddd;padding:5px;text-align:center;vertical-align:top;font-size:.85em}td.name,td.l{text-align:left}
.pass{background:#f1f8e9}.fail{background:#fce4ec}.na{color:#aaa}img{max-width:260px;display:block;margin:4px auto;border:1px solid #ccc}
pre{white-space:pre-wrap;text-align:left;font-size:.75em;background:#fafafa}
</style></head><body>
<h1>Issue #130 管理画面CSP検証レポート（SEC-41）</h1>
<p>日付: ${TODAY} / デバイス: PC (1280×800) / iPad Pro 11 (834×1194) / iPhone 14 (390×844)</p>
<p>ローカル: <code>npm run build:raw</code> の dist を <code>wrangler pages dev</code> で配信し、<code>_headers</code> の CSP をレスポンスヘッダとして付与。OAuth 3ステップモック＋GitHub APIモックで認証後の実操作（記事クリック→本文入力→プレビュー→保存）を実行。<br>
本番/staging: 実配信中の <code>/admin/</code> でログイン・編集・プレビュー・保存を実操作。OAuth と GitHub API は Playwright でモックし、実APIへ書き込まない。未モックの GitHub API 呼出しとその他の非GETリクエストは遮断し、記録する。APIログで本番は <code>main</code>、staging は <code>staging</code> ref を要求したことも検証。追加でログイン前の読み取り専用確認も実施。</p>
<div class="summary">総チェック ${results.length} / PASS ${pass} / FAIL ${fail}</div>
<h2>CSP違反・機能エラー一覧</h2>
<table><tr><th>対象</th><th>デバイス</th><th>CSP違反</th><th>うちcloudflareinsights以外</th><th>違反内容（directive ← blockedURI）</th><th>機能エラー（CSP以外のconsole error / pageerror）</th></tr>${vrows}</table>
<h2>シナリオ別スクリーンショット（3デバイス横並び）</h2>
<table><tr><th style="width:230px">シナリオ</th><th>PC</th><th>iPad</th><th>iPhone</th></tr>${rows}</table>
</body></html>`;
  writeFileSync(join(EVIDENCE_DIR, 'report.html'), html);
  writeFileSync(join(EVIDENCE_DIR, 'issue130-results.json'), JSON.stringify({ date: TODAY, summary: { total: results.length, pass, fail }, results, runs }, null, 2));
  console.log(`\nレポート: ${join(EVIDENCE_DIR, 'report.html')}`);
}

async function main() {
  if (!existsSync(join(process.cwd(), 'dist', '_headers'))) throw new Error('dist/_headers がない。先に npm run build:raw を実行する');
  const wrangler = await startWrangler();
  const browser = await chromium.launch();
  try {
    for (const dev of DEVICES_CONFIG.filter(d => !process.env.ONLY_DEVICE || d.name === process.env.ONLY_DEVICE)) {
      await runCms(browser, dev, 'A');
      await runCms(browser, dev, 'B');
    }
    if (!process.env.SKIP_REMOTE) {
      for (const target of REMOTE_TARGETS) {
        for (const dev of DEVICES_CONFIG) {
          const production = target.env === 'production';
          await runCms(browser, dev, 'B', {
            baseUrl: target.url.replace(/\/admin\/$/, ''),
            kind: 'remote',
            env: target.env,
            expectedBranch: production ? 'main' : 'staging',
            prefix: production ? 'RP' : 'RS',
            tag: `${production ? '本番' : 'staging'}（実ホスト・OAuth/API mock）`,
          });
        }
        // CMS認証を使わない読み取り専用の管理画面確認も保持する。
        for (const dev of DEVICES_CONFIG) await runRemote(browser, dev, target);
      }
    }
  } finally {
    await browser.close();
    if (wrangler) wrangler.kill('SIGINT');
  }
  generateReport();
  const fail = results.filter(r => !r.pass).length;
  console.log(`\n結果: ${results.length - fail}/${results.length} PASS`);
  process.exitCode = fail === 0 ? 0 : 1;
}

main().catch((e) => { console.error(e); process.exit(1); });
