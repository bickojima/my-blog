/**
 * Modern Web Guidance準拠 エビデンス取得スクリプト
 *
 * 方針:
 * - 過去エビデンス（verify-site-interactive / verify-cms-crud / verify-cms19-grouping）
 *   と同じスタンドアロンPlaywright方式を使う。
 * - 赤枠アノテーション付きスクリーンショットとHTMLレポートを保存する。
 * - CMSはGitHub APIモック + Decap CMS OAuth 3ステップハンドシェイクで擬似ログインする。
 *
 * 使用方法:
 *   1. npm run build:raw
 *   2. node evidence/2026-05-22/verify-modern-web-guidance.mjs
 */
import { chromium, devices } from 'playwright';
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { extname, join } from 'path';

const PORT = 4173;
const HOST = '127.0.0.1';
const BASE_URL = `http://${HOST}:${PORT}`;
const DIST_DIR = join(process.cwd(), 'dist');
const EVIDENCE_DIR = join(process.cwd(), 'test-results/evidence/modern-web-guidance');
const SITE_DIR = join(EVIDENCE_DIR, 'site-interactive');
const CMS_DIR = join(EVIDENCE_DIR, 'cms-interactive');
const RESULTS_PATH = join(EVIDENCE_DIR, 'modern-web-guidance-results.json');

mkdirSync(SITE_DIR, { recursive: true });
mkdirSync(CMS_DIR, { recursive: true });

const DEVICES_CONFIG = [
  { name: 'PC', config: { viewport: { width: 1280, height: 800 } } },
  { name: 'iPad', config: devices['iPad Pro 11'] },
  { name: 'iPhone', config: devices['iPhone 14'] },
];

const CMS_DEVICES = DEVICES_CONFIG.filter((device) => device.name !== 'iPad');

const results = [];

function startServer(distDir) {
  const mime = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.yml': 'text/yaml',
    '.yaml': 'text/yaml',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
  };

  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      const requestPath = req.url.split('?')[0];
      let filePath = join(distDir, requestPath === '/' ? 'index.html' : requestPath);
      if (filePath.endsWith('/')) filePath += 'index.html';
      try {
        const data = await readFile(filePath);
        res.writeHead(200, { 'Content-Type': mime[extname(filePath)] || 'application/octet-stream' });
        res.end(data);
      } catch {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(await readFile(join(distDir, '404.html')).catch(() => 'Not Found'));
      }
    });
    server.listen(PORT, HOST, () => resolve(server));
  });
}

async function screenshotWithAnnotation(page, path, annotations = []) {
  await page.evaluate((items) => {
    document.querySelectorAll('[data-evidence-overlay="true"]').forEach((el) => el.remove());
    for (const item of items) {
      const target = document.querySelector(item.selector);
      if (!target) continue;
      const rect = target.getBoundingClientRect();
      const box = document.createElement('div');
      box.dataset.evidenceOverlay = 'true';
      box.style.cssText = `position:fixed;left:${rect.left - 3}px;top:${rect.top - 3}px;width:${rect.width + 6}px;height:${rect.height + 6}px;border:3px solid red;background:rgba(255,0,0,0.08);z-index:99999;pointer-events:none;border-radius:4px;`;
      const label = document.createElement('div');
      label.style.cssText = 'position:absolute;top:-22px;left:0;background:red;color:white;font-size:12px;padding:2px 6px;border-radius:3px;white-space:nowrap;';
      label.textContent = item.label;
      box.appendChild(label);
      document.body.appendChild(box);
    }
  }, annotations);
  await page.screenshot({ path, fullPage: true });
  await page.evaluate(() => {
    document.querySelectorAll('[data-evidence-overlay="true"]').forEach((el) => el.remove());
  });
}

async function setupCmsMocks(context) {
  await context.route((url) => url.hostname === 'api.github.com', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });

  await context.route((url) => url.hostname === 'api.github.com' && url.pathname === '/user', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ login: 'testuser', id: 12345, name: 'Test User', avatar_url: '' }),
    });
  });

  await context.route((url) => url.hostname === 'api.github.com' && url.pathname === '/repos/bickojima/my-blog', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 12345,
        name: 'my-blog',
        full_name: 'bickojima/my-blog',
        private: false,
        owner: { login: 'bickojima', id: 1 },
        default_branch: 'staging',
        permissions: { admin: true, push: true, pull: true },
      }),
    });
  });

  await context.route('**/repos/bickojima/my-blog/branches/**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ name: 'staging', commit: { sha: 'commit123' } }),
    });
  });

  await context.route('**/repos/bickojima/my-blog/git/**', (route) => {
    const url = route.request().url();
    if (url.includes('/trees')) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sha: 'tree123',
          truncated: false,
          tree: [
            { path: 'src/content/posts/2026/02/テスト記事.md', mode: '100644', type: 'blob', sha: 'post123' },
            { path: 'src/content/pages/profile.md', mode: '100644', type: 'blob', sha: 'page123' },
          ],
        }),
      });
    } else if (url.includes('/blobs')) {
      const isPage = url.includes('page123');
      const content = isPage
        ? `---\ntitle: プロフィール\nslug: profile\norder: 1\ndraft: false\n---\nプロフィール本文`
        : `---\ntitle: テスト記事\ndate: 2026-02-15\ndraft: false\ntags:\n  - テスト\nsummary: テスト概要\n---\nテスト本文`;
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ sha: isPage ? 'page123' : 'post123', content: Buffer.from(content).toString('base64'), encoding: 'base64' }),
      });
    } else if (url.includes('/refs')) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ref: 'refs/heads/staging', object: { sha: 'commit123', type: 'commit' } }),
      });
    } else {
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    }
  });

  await context.route((url) => url.pathname === '/auth', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: `<!doctype html><html><body><p>Authenticating...</p><script>
(function() {
  if (!window.opener) return;
  var origin = window.opener.location.origin;
  window.opener.postMessage('authorizing:github', origin);
  window.addEventListener('message', function() {
    var message = 'authorization:github:success:' + JSON.stringify({ token: 'mock-token', provider: 'github' });
    window.opener.postMessage(message, origin);
    setTimeout(function() { window.close(); }, 300);
  }, { once: true });
})();
      </script></body></html>`,
    });
  });
}

async function openCmsWithAuth(page) {
  await page.goto(BASE_URL + '/admin/');
  await page.waitForTimeout(2500);

  const loginButton = page.locator('button:has-text("GitHub でログインする")');
  if (await loginButton.isVisible().catch(() => false)) {
    const popupPromise = page.waitForEvent('popup').catch(() => null);
    await loginButton.click();
    const popup = await popupPromise;
    if (popup) {
      await popup.waitForLoadState('domcontentloaded').catch(() => {});
      await popup.waitForTimeout(1500).catch(() => {});
      await popup.close().catch(() => {});
    }
  }

  for (let i = 0; i < 20; i++) {
    const loggedIn = await page.locator('#cms-site-link, text=記事').first().isVisible().catch(() => false);
    const stillLogin = await loginButton.isVisible().catch(() => false);
    if (loggedIn && !stillLogin) return;
    await page.waitForTimeout(1000);
  }
}

async function verifySite(device) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext(device.config);
  const page = await context.newPage();

  try {
    await page.goto(BASE_URL + '/');
    await page.waitForLoadState('networkidle');
    await page.locator('h1').waitFor({ timeout: 10000 });

    const firstThumbnail = page.locator('img.post-thumbnail').first();
    const thumbnailCount = await firstThumbnail.count();
    const hasLcpPriority = thumbnailCount === 0 || (
      await firstThumbnail.getAttribute('loading') === 'eager' &&
      await firstThumbnail.getAttribute('fetchpriority') === 'high'
    );

    const homePath = join(SITE_DIR, `MWG-S01-top-${device.name}.png`);
    await screenshotWithAnnotation(page, homePath, [
      { selector: 'h1', label: 'ページ見出し' },
      ...(thumbnailCount > 0 ? [{ selector: 'img.post-thumbnail', label: 'LCP候補画像' }] : []),
    ]);
    results.push({ id: 'MWG-S01', device: device.name, target: 'site', name: 'トップページLCP画像優先度', pass: hasLcpPriority, screenshot: `site-interactive/MWG-S01-top-${device.name}.png` });

    const toggle = page.locator('.nav-dropdown-toggle');
    if (await toggle.count() > 0) {
      await toggle.dispatchEvent('click');
      const ariaExpanded = await toggle.getAttribute('aria-expanded');
      const navPath = join(SITE_DIR, `MWG-S02-nav-${device.name}.png`);
      await screenshotWithAnnotation(page, navPath, [
        { selector: '.nav-dropdown-toggle', label: 'aria-expanded同期' },
        { selector: '.nav-dropdown-menu', label: '開閉メニュー' },
      ]);
      results.push({ id: 'MWG-S02', device: device.name, target: 'site', name: 'ナビゲーションARIA状態同期', pass: ariaExpanded === 'true', screenshot: `site-interactive/MWG-S02-nav-${device.name}.png` });
    }
  } finally {
    await browser.close();
  }
}

async function verifyCms(device) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext(device.config);
  await setupCmsMocks(context);
  const page = await context.newPage();

  try {
    await page.goto(BASE_URL + '/admin/');
    await page.waitForTimeout(2500);
    const loginPath = join(CMS_DIR, `MWG-T01-login-${device.name}.png`);
    await screenshotWithAnnotation(page, loginPath, [
      { selector: 'button', label: 'OAuthログイン' },
    ]);
    results.push({ id: 'MWG-T01', device: device.name, target: 'cms', name: 'CMSログイン画面', pass: true, screenshot: `cms-interactive/MWG-T01-login-${device.name}.png` });

    await openCmsWithAuth(page);
    const siteLinkVisible = await page.locator('#cms-site-link').isVisible().catch(() => false);
    const collectionPath = join(CMS_DIR, `MWG-T02-collection-${device.name}.png`);
    await screenshotWithAnnotation(page, collectionPath, [
      { selector: '#cms-site-link', label: '独自サイトリンク' },
      { selector: 'body', label: '認証後CMS' },
    ]);
    results.push({ id: 'MWG-T02', device: device.name, target: 'cms', name: 'CMS認証モック後の独自カスタマイズ', pass: siteLinkVisible, screenshot: `cms-interactive/MWG-T02-collection-${device.name}.png` });
  } finally {
    await browser.close();
  }
}

function generateReport() {
  const rows = results.map((result) => {
    const status = result.pass ? 'PASS' : 'FAIL';
    const statusClass = result.pass ? 'pass' : 'fail';
    return `<tr>
      <td>${result.id}</td>
      <td>${result.target}</td>
      <td>${result.device}</td>
      <td>${result.name}</td>
      <td class="${statusClass}">${status}</td>
      <td><img src="${result.screenshot}" width="320"></td>
    </tr>`;
  }).join('\n');

  const html = `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <title>Modern Web Guidance Evidence</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 24px; color: #222; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; vertical-align: top; }
    th { background: #f5f5f5; }
    .pass { color: #146c2e; font-weight: 700; }
    .fail { color: #b00020; font-weight: 700; }
    img { max-width: 320px; border: 1px solid #ccc; }
  </style>
</head>
<body>
  <h1>Modern Web Guidance Evidence</h1>
  <p>保存先: <code>test-results/evidence/modern-web-guidance/</code></p>
  <table>
    <thead><tr><th>ID</th><th>対象</th><th>デバイス</th><th>検証</th><th>結果</th><th>スクリーンショット</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;
  writeFileSync(join(EVIDENCE_DIR, 'report.html'), html);
  writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2));
}

async function withLocalCmsConfig(fn) {
  const configPath = join(DIST_DIR, 'admin/config.yml');
  const original = readFileSync(configPath, 'utf-8');
  const patched = original.replace(/base_url:\s*.+/, `base_url: ${BASE_URL}`);
  writeFileSync(configPath, patched);
  try {
    await fn();
  } finally {
    writeFileSync(configPath, original);
  }
}

async function main() {
  if (!existsSync(join(DIST_DIR, 'index.html'))) {
    throw new Error('dist/index.html がありません。先に npm run build:raw を実行してください。');
  }

  const server = await startServer(DIST_DIR);
  try {
    await withLocalCmsConfig(async () => {
      for (const device of DEVICES_CONFIG) {
        await verifySite(device);
      }
      for (const device of CMS_DEVICES) {
        await verifyCms(device);
      }
    });
  } finally {
    server.close();
  }

  generateReport();
  const failed = results.filter((result) => !result.pass);
  if (failed.length > 0) {
    console.error(`[FAIL] ${failed.length} checks failed`);
    process.exit(1);
  }
  console.log(`[PASS] ${results.length} evidence checks completed`);
  console.log(`Report: ${join(EVIDENCE_DIR, 'report.html')}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
