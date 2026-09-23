/**
 * Issue #117 hardening（SEC-37 / SEC-38 / SEC-39）の実ブラウザ E2E エビデンス（2026-09-23）
 *
 * 既存の verify-comprehensive.mjs は /auth をスタブ HTML に差し替えるため、OAuth Functions の実コードを通らない。
 * 本スクリプトは /auth・/auth/callback への要求を **functions/auth/*.js の実コード**（onRequestGet）で処理し、
 * その応答（ヘッダー・CSP・HTML）をそのまま Playwright に返す。GitHub のトークン交換（Functions 内 fetch）と
 * GitHub API だけをモックする。管理画面は dist/ を https://staging.reiwa.casa として配信し、
 * public/_headers の /* と /admin/* ヘッダーも付与する（CSP 込みで実運用に近づける）。
 *
 * シナリオ（PC / iPad / iPhone）:
 *   H01 実操作ログイン: 「GitHub でログインする」をクリック → 実 Functions 経由の3ステップハンドシェイク → CMS 画面表示
 *   H02 コールバック応答ヘッダー: 実ブラウザが受けた Content-Type / CSP を記録（SEC-38）
 *   H03 敵対的トークン: </script>・引用符・バッククオート・${} を含むトークンでログイン → CMS が受け取るトークンが完全一致・注入スクリプト非実行（SEC-39）
 *   H04 フレーム埋め込み拒否: 同一オリジンのページから iframe で /auth/callback を読み込むと表示されない（SEC-38 frame-ancestors）
 *   H05 opener なし直接表示: インラインスクリプトが新 CSP 下で動作し、エラーメッセージを表示する（SEC-38 の過剰遮断なし）
 *
 * 使用方法:
 *   1. npm run build:raw
 *   2. node evidence/2026-09-23/issue117/verify-oauth-hardening.mjs
 */
import { chromium, devices } from 'playwright';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { onRequestGet as authIndex } from '../../../functions/auth/index.js';
import { onRequestGet as authCallback } from '../../../functions/auth/callback.js';

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, 'evidence/2026-09-23/issue117');
const SHOT_DIR = join(OUT_DIR, 'screenshots');
mkdirSync(SHOT_DIR, { recursive: true });
const DIST = join(ROOT, 'dist');
const ORIGIN = 'https://staging.reiwa.casa';

const DEVICES = [
  { name: 'PC', config: { viewport: { width: 1280, height: 800 } } },
  { name: 'iPad', config: devices['iPad Pro 11'] },
  { name: 'iPhone', config: devices['iPhone 14'] },
];

const NORMAL_TOKEN = 'gho_issue117_normal_token';
const HOSTILE_TOKEN = 'gho_x</script><script>window.__pwn=1</script>"\'`${window.__pwn=2}`\\';

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

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css',
  '.yml': 'text/yaml', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.xml': 'application/xml',
};

async function serveDist(route, url) {
  let p = decodeURIComponent(url.pathname);
  const candidates = p.endsWith('/') ? [p + 'index.html'] : [p, p + '.html', p + '/index.html'];
  for (const c of candidates) {
    try {
      const body = await readFile(join(DIST, c));
      const headers = { ...HEADERS['/*'], 'content-type': MIME[extname(c)] || 'application/octet-stream' };
      if (p.startsWith('/admin/')) Object.assign(headers, HEADERS['/admin/*']);
      return route.fulfill({ status: 200, headers, body });
    } catch {}
  }
  return route.fulfill({ status: 404, body: 'Not Found' });
}

// 実ブラウザが受け取ったコールバック応答の記録
const callbackResponses = [];
let currentToken = NORMAL_TOKEN;
let authHeaderSeen = null;

async function setupRoutes(context) {
  // Functions 内のトークン交換（https://github.com/login/oauth/access_token）だけをモック
  globalThis.fetch = async () => ({ json: async () => ({ access_token: currentToken, token_type: 'bearer' }) });

  // 観測用: コールバックページの window.close() を記録のみに差し替え、ポップアップを検査・撮影できるようにする
  // （ハンドシェイク・CSP・トークン受け渡しには影響しない。閉じる処理が呼ばれたことは __closeCalled で確認する）
  await context.addInitScript(() => {
    if (location.pathname === '/auth/callback') {
      window.close = () => { window.__closeCalled = true; };
    }
  });

  await context.route(url => url.origin === ORIGIN, async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    if (url.pathname === '/auth' || url.pathname === '/auth/callback') {
      const headers = await req.allHeaders();
      const request = new Request(req.url(), { headers: headers.cookie ? { Cookie: headers.cookie } : {} });
      const handler = url.pathname === '/auth' ? authIndex : authCallback;
      const res = await handler({ request, env: { OAUTH_CLIENT_ID: 'mock-client', OAUTH_CLIENT_SECRET: 'mock-secret' } });
      const outHeaders = {};
      res.headers.forEach((v, k) => { outHeaders[k] = v; });
      if (url.pathname === '/auth/callback') callbackResponses.push({ status: res.status, headers: outHeaders });
      // Playwright はフルフィルした 302 の転送先リクエストをルーティングしない（実 GitHub に出てしまう）。
      // そのため実コードが返した 302（Location・Set-Cookie は実値のまま）を、同じ Location への
      // meta refresh に置き換えて転送先もインターセプト可能にする（ハーネス側の変換のみ）。
      if (res.status === 302) {
        const loc = res.headers.get('location');
        const esc = loc.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
        delete outHeaders.location;
        return route.fulfill({ status: 200, headers: { ...outHeaders, 'content-type': 'text/html; charset=utf-8' },
          body: `<!DOCTYPE html><meta http-equiv="refresh" content="0;url=${esc}">` });
      }
      return route.fulfill({ status: res.status, headers: outHeaders, body: await res.text() });
    }
    return serveDist(route, url);
  });

  // GitHub の認可画面: 同意済みとして redirect_uri へ code と state を返す
  await context.route(url => url.hostname === 'github.com' && url.pathname === '/login/oauth/authorize', (route) => {
    const u = new URL(route.request().url());
    const cb = new URL(u.searchParams.get('redirect_uri'));
    cb.searchParams.set('code', 'mock-code');
    cb.searchParams.set('state', u.searchParams.get('state'));
    const esc = cb.toString().replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    route.fulfill({ status: 200, contentType: 'text/html', body: `<!DOCTYPE html><meta http-equiv="refresh" content="0;url=${esc}">` });
  });

  // GitHub API モック（verify-comprehensive.mjs 準拠の最小構成）
  const ARTICLE = { path: '2026/09/hello.md', sha: 'a1', body: '---\ntitle: 動作確認記事\ndate: 2026-09-23\ndraft: false\ntags: []\n---\n本文' };
  await context.route(url => url.hostname === 'api.github.com', async (route) => {
    const req = route.request();
    const u = new URL(req.url());
    const json = (b) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(b) });
    if (u.pathname === '/user') {
      authHeaderSeen = (await req.allHeaders()).authorization || null;
      return json({ login: 'testuser', id: 1, name: 'Test User', avatar_url: '' });
    }
    if (u.pathname === '/repos/bickojima/my-blog') {
      return json({ id: 1, name: 'my-blog', full_name: 'bickojima/my-blog', private: false, owner: { login: 'bickojima', id: 1 },
        default_branch: 'staging', permissions: { admin: true, push: true, pull: true } });
    }
    if (u.pathname.includes('/branches/')) return json({ name: 'staging', commit: { sha: 'abc123' } });
    if (u.pathname.includes('/commits')) return json([{ sha: 'c1', commit: { message: 't', author: { date: '2026-09-23T00:00:00Z' } } }]);
    if (u.pathname.includes('/git/trees')) {
      const tree = u.pathname.includes('content/posts') || req.url().includes('content%2Fposts') || req.url().includes('content/posts')
        ? [{ path: ARTICLE.path, mode: '100644', type: 'blob', sha: ARTICLE.sha }] : [];
      return json({ sha: 'tree1', truncated: false, tree });
    }
    if (u.pathname.includes('/git/blobs')) return json({ sha: ARTICLE.sha, content: Buffer.from(ARTICLE.body).toString('base64'), encoding: 'base64' });
    if (u.pathname.includes('/contents/')) return json({ name: 'hello.md', sha: ARTICLE.sha, content: Buffer.from(ARTICLE.body).toString('base64'), encoding: 'base64' });
    if (u.pathname.includes('/pulls')) return json([]);
    return json({});
  });
}

async function redBox(page, selector, label) {
  await page.evaluate(({ s, l }) => {
    const el = document.querySelector(s);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const d = document.createElement('div');
    d.className = '_rb';
    d.style.cssText = `position:fixed;top:${r.top - 3}px;left:${r.left - 3}px;width:${r.width + 6}px;height:${r.height + 6}px;border:3px solid red;border-radius:4px;z-index:99999;pointer-events:none;`;
    const lb = document.createElement('div');
    lb.style.cssText = (r.top < 26 ? 'position:absolute;bottom:-22px;' : 'position:absolute;top:-22px;') + 'left:0;background:red;color:#fff;font:12px sans-serif;padding:2px 6px;white-space:nowrap;';
    lb.textContent = l;
    d.appendChild(lb);
    document.body.appendChild(d);
  }, { s: selector, l: label }).catch(() => {});
}

const results = [];
function record(device, id, name, pass, screenshot, detail = {}) {
  console.log(`  [${pass ? 'PASS' : 'FAIL'}] ${device} ${id}: ${name}${pass ? '' : ' ' + JSON.stringify(detail)}`);
  results.push({ device, id, name, pass, screenshot, detail });
}

// ログイン実操作（ボタンをクリックしてポップアップ経由で認証）
async function loginViaRealFunctions(page, device, id, token) {
  currentToken = token;
  authHeaderSeen = null;
  callbackResponses.length = 0;
  await page.goto(`${ORIGIN}/admin/`);
  const button = page.getByRole('button', { name: /GitHub/ });
  await button.waitFor({ state: 'visible', timeout: 30000 });
  const popupPromise = page.waitForEvent('popup');
  await button.click();
  const popup = await popupPromise;
  if (process.env.DEBUG) {
    popup.on('framenavigated', f => console.log('   popup nav:', f.url()));
    popup.on('console', m => console.log('   popup console:', m.text()));
    page.on('console', m => console.log('   page console:', m.type(), m.text().slice(0, 200)));
  }
  let popupScripts = null;
  let popupPwn = null;
  let popupStatus = null;
  try {
    // ハンドシェイク完了の1秒後にポップアップは自動で閉じるため、commit 直後から状態を読む
    await popup.waitForURL(/\/auth\/callback/, { timeout: 15000, waitUntil: 'commit' });
    await popup.waitForFunction(() => window.__closeCalled === true, null, { timeout: 10000 });
    [popupScripts, popupPwn, popupStatus] = await popup.evaluate(() =>
      [document.scripts.length, window.__pwn ?? null, document.getElementById('status').textContent]);
    await redBox(popup, '#status', `${id.toUpperCase()}: 実 /auth/callback 応答（ハンドシェイク完了）`);
    await popup.screenshot({ path: join(SHOT_DIR, `${id}-callback-popup-${device}.png`) }).catch(() => {});
    await popup.close();
  } catch (e) {
    if (process.env.DEBUG) console.log('   popup read failed:', e.message.split('\n')[0]);
  }
  // CMS 画面（コレクション一覧）への遷移を待つ
  const collection = page.locator('a[href*="#/collections/posts"], [class*="SidebarNavLink"]').first();
  const loggedIn = await collection.waitFor({ state: 'visible', timeout: 30000 }).then(() => true).catch(() => false);
  await page.waitForTimeout(1500);
  return { loggedIn, popupScripts, popupPwn, popupStatus };
}

async function runDevice(browser, dev) {
  const context = await browser.newContext({ ...dev.config, locale: 'ja-JP' });
  await setupRoutes(context);
  const page = await context.newPage();
  const d = dev.name;

  // H01 実操作ログイン
  {
    const r = await loginViaRealFunctions(page, d, 'h01', NORMAL_TOKEN);
    const shot = `h01-login-${d}.png`;
    await redBox(page, '[class*="SidebarNavLink"], a[href*="#/collections/posts"]', 'H01: 実Functions経由でログイン後のCMS画面');
    await page.screenshot({ path: join(SHOT_DIR, shot) });
    await page.evaluate(() => document.querySelectorAll('._rb').forEach(e => e.remove())).catch(() => {});
    const tokenOk = authHeaderSeen === `token ${NORMAL_TOKEN}`;
    record(d, 'H01', '実操作ログイン（実 /auth・/auth/callback コード経由）でCMS画面が表示され、正しいトークンでAPIを呼ぶ',
      r.loggedIn && tokenOk, shot, { loggedIn: r.loggedIn, authHeaderSeen, popupStatus: r.popupStatus });

    // H02 コールバック応答ヘッダー（実ブラウザが受け取ったもの）
    const cb = callbackResponses.find(x => x.status === 200);
    const csp = cb?.headers['content-security-policy'] || '';
    const ok = !!cb && cb.headers['content-type'] === 'text/html; charset=utf-8'
      && /frame-ancestors 'none'/.test(csp) && /form-action 'none'/.test(csp) && /base-uri 'none'/.test(csp) && /default-src 'none'/.test(csp);
    record(d, 'H02', 'コールバック応答が charset 付き Content-Type と自己完結 CSP（frame-ancestors/form-action/base-uri）を返す',
      ok, `h01-callback-popup-${d}.png`, { contentType: cb?.headers['content-type'], csp });
  }

  // H03 敵対的トークン（ログアウト相当: 新しいページ・localStorage 消去）
  {
    await page.evaluate(() => localStorage.clear()).catch(() => {});
    const r = await loginViaRealFunctions(page, d, 'h03', HOSTILE_TOKEN);
    const shot = `h03-hostile-token-${d}.png`;
    await redBox(page, '[class*="SidebarNavLink"], a[href*="#/collections/posts"]', 'H03: 敵対的トークンでも脱出せず完全一致で受け渡し');
    await page.screenshot({ path: join(SHOT_DIR, shot) });
    await page.evaluate(() => document.querySelectorAll('._rb').forEach(e => e.remove())).catch(() => {});
    const exact = authHeaderSeen === `token ${HOSTILE_TOKEN}`;
    record(d, 'H03', '</script>・引用符・バッククオート・${} を含むトークンが完全一致で CMS に渡り、注入スクリプトは実行されない',
      r.loggedIn && exact && r.popupScripts === 1 && r.popupPwn === null, shot,
      { loggedIn: r.loggedIn, exact, popupScripts: r.popupScripts, popupPwn: r.popupPwn, authHeaderSeen });
  }

  // H04 iframe 埋め込みの拒否
  {
    await page.goto(`${ORIGIN}/`);
    const cspErrors = [];
    const onConsole = (m) => { if (/frame-ancestors 'none'/.test(m.text())) cspErrors.push(m.text().split('\n')[0]); };
    page.on('console', onConsole);
    const cookieRes = await authIndex({ request: new Request(`${ORIGIN}/auth`), env: { OAUTH_CLIENT_ID: 'x' } });
    const state = new URL(cookieRes.headers.get('location')).searchParams.get('state');
    await context.addCookies([{ name: 'oauth_state', value: state, url: `${ORIGIN}/auth` }]);
    currentToken = NORMAL_TOKEN;
    // 同一オリジンのページに iframe を1つ差し込む（観測用。判定はブラウザのフレーム遮断結果で行う）
    await page.evaluate((src) => {
      const f = document.createElement('iframe');
      f.id = 'cbframe';
      f.src = src;
      f.style.cssText = 'width:90%;height:200px;border:2px dashed #999;background:#fff';
      document.querySelector('main, body').prepend(f);
    }, `${ORIGIN}/auth/callback?code=mock-code&state=${state}`);
    await page.waitForTimeout(2500);
    const frame = page.frames().find(f => f !== page.mainFrame());
    let rendered = false;
    try { rendered = /Authorization Status/.test(await frame.evaluate(() => document.body?.innerText || '')); } catch { rendered = false; }
    const shot = `h04-iframe-blocked-${d}.png`;
    await page.locator('#cbframe').scrollIntoViewIfNeeded();
    await redBox(page, '#cbframe', 'H04: /auth/callback の iframe 表示は拒否される');
    await page.screenshot({ path: join(SHOT_DIR, shot) });
    page.off('console', onConsole);
    record(d, 'H04', '/auth/callback を iframe に埋め込むと描画されず、ブラウザが frame-ancestors none 違反として遮断する',
      !!frame && !rendered && cspErrors.length > 0, shot, { frameUrl: frame?.url(), rendered, cspErrors });
  }

  // H05 opener なしで直接表示 → 新 CSP 下でもインラインスクリプトが動く
  {
    const res = await authIndex({ request: new Request(`${ORIGIN}/auth`), env: { OAUTH_CLIENT_ID: 'x' } });
    const state = new URL(res.headers.get('location')).searchParams.get('state');
    await context.addCookies([{ name: 'oauth_state', value: state, url: `${ORIGIN}/auth` }]);
    const p2 = await context.newPage();
    await p2.goto(`${ORIGIN}/auth/callback?code=mock-code&state=${state}`);
    const status = await p2.locator('#status').textContent();
    const shot = `h05-no-opener-${d}.png`;
    await redBox(p2, '#status', 'H05: CSP下でインラインスクリプトが動作');
    await p2.screenshot({ path: join(SHOT_DIR, shot) });
    record(d, 'H05', 'opener なしで開くとインラインスクリプトが実行され「No parent window」エラーを表示する', status === 'Error: No parent window found', shot, { status });
    await p2.close();
  }

  await context.close();
}

function report() {
  const ids = [...new Set(results.map(r => r.id))];
  const cell = (r) => r ? `<td><div class="${r.pass ? 'ok' : 'ng'}">${r.pass ? 'PASS' : 'FAIL'}</div>${r.screenshot ? `<a href="screenshots/${r.screenshot}"><img src="screenshots/${r.screenshot}" loading="lazy"></a>` : ''}<pre>${JSON.stringify(r.detail, null, 1).replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[c])}</pre></td>` : '<td>-</td>';
  const rows = ids.map(id => {
    const rs = results.filter(r => r.id === id);
    return `<tr><th>${id}<br><small>${rs[0].name.replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[c])}</small></th>${DEVICES.map(dv => cell(rs.find(r => r.device === dv.name))).join('')}</tr>`;
  }).join('\n');
  const pass = results.filter(r => r.pass).length;
  const html = `<!DOCTYPE html><html lang="ja"><head><meta charset="utf-8"><title>Issue #117 OAuth hardening E2E</title>
<style>body{font-family:sans-serif;margin:16px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:6px;vertical-align:top}th{width:18%;text-align:left}td img{max-width:100%;border:1px solid #ddd}.ok{color:#fff;background:#1a7f37;display:inline-block;padding:2px 6px}.ng{color:#fff;background:#cf222e;display:inline-block;padding:2px 6px}pre{white-space:pre-wrap;font-size:11px;max-height:160px;overflow:auto}</style></head>
<body><h1>Issue #117 hardening: OAuth Functions 実コード経由 E2E（2026-09-23）</h1>
<p>対象: SEC-37（許可リスト単一化）/ SEC-38（コールバック CSP・charset）/ SEC-39（JSON.stringify リテラル）。/auth・/auth/callback は functions/auth/*.js の実コードで応答し、GitHub のトークン交換と API のみモック。結果: <b>${pass}/${results.length} PASS</b></p>
<table><tr><th>シナリオ</th>${DEVICES.map(d => `<th>${d.name}</th>`).join('')}</tr>${rows}</table></body></html>`;
  writeFileSync(join(OUT_DIR, 'report.html'), html);
  writeFileSync(join(OUT_DIR, 'oauth-hardening-results.json'), JSON.stringify({ date: '2026-09-23', pass, total: results.length, results }, null, 2));
}

const browser = await chromium.launch();
try {
  for (const dev of DEVICES) {
    console.log(`== ${dev.name}`);
    await runDevice(browser, dev);
  }
} finally {
  await browser.close();
}
report();
const failed = results.filter(r => !r.pass).length;
console.log(`RESULT: ${results.length - failed}/${results.length} PASS`);
process.exit(failed ? 1 : 0);
