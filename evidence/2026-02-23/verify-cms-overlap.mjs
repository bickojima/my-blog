import { chromium, devices } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'http://localhost:4321';
const SCREENSHOT_DIR = join(process.cwd(), 'evidence', '2026-02-23', 'cms-screenshots');
mkdirSync(SCREENSHOT_DIR, { recursive: true });

const DEVICES_CONFIG = [
  { name: 'PC', config: { viewport: { width: 1280, height: 800 } } },
  { name: 'iPad', config: devices['iPad Pro 11'] },
  { name: 'iPhone', config: devices['iPhone 14'] },
];

// GitHub API モック設定（cms-operations.spec.tsと同等）
async function setupMocks(page) {
  await page.route('https://api.github.com/user', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ login: 'testuser', id: 12345, name: 'Test User', avatar_url: '' }) });
  });
  await page.route('https://api.github.com/repos/bickojima/my-blog', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ full_name: 'bickojima/my-blog', default_branch: 'main', permissions: { push: true } }) });
  });
  await page.route('**/repos/bickojima/my-blog/branches/staging', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ name: 'staging', commit: { sha: 'abc123' } }) });
  });
  await page.route('**/repos/bickojima/my-blog/branches/main', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ name: 'main', commit: { sha: 'abc123' } }) });
  });

  // Tree API
  await page.route('**/repos/bickojima/my-blog/git/trees/**', (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      const content = `---\ntitle: テスト記事\ndate: 2026-02-15\ndraft: false\ntags:\n  - テスト\n---\n本文テスト。`;
      route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({
          sha: 'tree123', truncated: false,
          tree: [
            { path: 'src/content/posts/2026/02/テスト記事.md', mode: '100644', type: 'blob', sha: 'blob123' },
            { path: 'src/content/pages/about.md', mode: '100644', type: 'blob', sha: 'blob456' },
          ],
        }),
      });
    } else {
      route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ sha: 'newtree' }) });
    }
  });
  await page.route('**/repos/bickojima/my-blog/git/blobs/**', (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      const content = `---\ntitle: テスト記事\ndate: 2026-02-15\ndraft: false\ntags:\n  - テスト\n---\n本文テスト。`;
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ sha: 'blob123', content: Buffer.from(content).toString('base64'), encoding: 'base64' }) });
    } else {
      route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ sha: 'newblob' }) });
    }
  });
  await page.route('**/repos/bickojima/my-blog/git/refs/**', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ref: 'refs/heads/staging', object: { sha: 'abc123' } }) });
  });
  await page.route('**/repos/bickojima/my-blog/git/commits', (route) => {
    route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ sha: 'newcommit' }) });
  });
  await page.route('**/repos/bickojima/my-blog/contents/**', (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      const content = `---\ntitle: テスト記事\ndate: 2026-02-15\ndraft: false\ntags:\n  - テスト\n---\n本文テスト。`;
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ name: 'テスト記事.md', path: 'src/content/posts/2026/02/テスト記事.md', sha: 'blob123', content: Buffer.from(content).toString('base64'), encoding: 'base64' }) });
    } else {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ content: { sha: 'updated' } }) });
    }
  });
  // Auth endpoint for OAuth simulation
  await page.route('**/auth', (route) => {
    route.fulfill({
      status: 200, contentType: 'text/html',
      body: `<html><body><script>
        try { window.opener.postMessage('authorization:github:success:{"token":"mock-token","provider":"github"}', window.opener.location.origin); } catch(e) {}
        window.close();
      </script></body></html>`,
    });
  });
}

// CMS認証して開く
async function openCmsWithAuth(page) {
  await setupMocks(page);
  await page.goto(BASE_URL + '/admin/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Login button click + postMessage auth
  const loginBtn = page.locator('button:has-text("Login"), button:has-text("ログイン"), [class*="LoginButton"]').first();
  if (await loginBtn.isVisible().catch(() => false)) {
    await page.evaluate(() => {
      window.addEventListener('message', (e) => {}, false);
    });
    const popupPromise = page.waitForEvent('popup', { timeout: 5000 }).catch(() => null);
    await loginBtn.click();
    const popup = await popupPromise;
    if (popup) {
      await popup.waitForLoadState().catch(() => {});
    }
    await page.waitForTimeout(3000);
  }
  // Wait for CMS to load
  await page.waitForTimeout(3000);
}

// ボタン重なり検出
async function detectOverlaps(page) {
  return await page.evaluate(() => {
    const clickable = Array.from(document.querySelectorAll(
      'a, button, [role="button"], input[type="submit"], input[type="button"], select, [class*="Button"], [class*="btn"], [class*="toggle"], label[for]'
    ));
    const overlaps = [];
    for (let i = 0; i < clickable.length; i++) {
      const rectA = clickable[i].getBoundingClientRect();
      if (rectA.width === 0 || rectA.height === 0) continue;
      const styleA = window.getComputedStyle(clickable[i]);
      if (styleA.display === 'none' || styleA.visibility === 'hidden' || parseFloat(styleA.opacity) === 0) continue;

      for (let j = i + 1; j < clickable.length; j++) {
        const rectB = clickable[j].getBoundingClientRect();
        if (rectB.width === 0 || rectB.height === 0) continue;
        const styleB = window.getComputedStyle(clickable[j]);
        if (styleB.display === 'none' || styleB.visibility === 'hidden' || parseFloat(styleB.opacity) === 0) continue;
        if (clickable[i].contains(clickable[j]) || clickable[j].contains(clickable[i])) continue;

        const tolerance = 2;
        if (rectA.left < rectB.right - tolerance && rectA.right > rectB.left + tolerance &&
            rectA.top < rectB.bottom - tolerance && rectA.bottom > rectB.top + tolerance) {
          overlaps.push({
            elementA: `${clickable[i].tagName}.${(clickable[i].className||'').toString().split(' ')[0]}: ${(clickable[i].textContent||'').trim().substring(0,30)}`,
            elementB: `${clickable[j].tagName}.${(clickable[j].className||'').toString().split(' ')[0]}: ${(clickable[j].textContent||'').trim().substring(0,30)}`,
            rectA: { left: rectA.left, top: rectA.top, width: rectA.width, height: rectA.height },
            rectB: { left: rectB.left, top: rectB.top, width: rectB.width, height: rectB.height },
          });
        }
      }
    }
    return overlaps;
  });
}

// 赤枠アノテーション付きスクリーンショット
async function screenshotWithAnnotation(page, path, annotations = []) {
  // Add red border annotations via DOM injection
  if (annotations.length > 0) {
    await page.evaluate((annots) => {
      annots.forEach((a, i) => {
        const div = document.createElement('div');
        div.id = `_overlap_marker_${i}`;
        div.style.cssText = `position:fixed;left:${a.left}px;top:${a.top}px;width:${a.width}px;height:${a.height}px;border:3px solid red;background:rgba(255,0,0,0.15);z-index:99999;pointer-events:none;`;
        document.body.appendChild(div);
      });
    }, annotations);
  }
  await page.screenshot({ path, fullPage: true });
  // Clean up
  if (annotations.length > 0) {
    await page.evaluate(() => {
      document.querySelectorAll('[id^="_overlap_marker_"]').forEach(el => el.remove());
    });
  }
}

// テストページ/操作の定義
const CMS_CHECKS = [
  {
    id: 'cms-login',
    name: 'CMS ログイン画面',
    action: async (page) => {
      // Just load admin without auth
      await page.goto(BASE_URL + '/admin/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
    },
  },
  {
    id: 'cms-collection-list',
    name: 'CMS 記事一覧画面',
    action: async (page) => {
      await openCmsWithAuth(page);
    },
  },
  {
    id: 'cms-editor',
    name: 'CMS エディタ画面（記事編集）',
    action: async (page) => {
      await openCmsWithAuth(page);
      // Click on first entry or "new post" button
      const newBtn = page.locator('a[href*="new"], [class*="NewEntry"]').first();
      if (await newBtn.isVisible().catch(() => false)) {
        await newBtn.click();
        await page.waitForTimeout(3000);
      } else {
        // Try clicking first entry in list
        const entry = page.locator('[class*="ListCard"], [class*="entry"]').first();
        if (await entry.isVisible().catch(() => false)) {
          await entry.click();
          await page.waitForTimeout(3000);
        }
      }
    },
  },
  {
    id: 'cms-toolbar',
    name: 'CMS ツールバー領域',
    action: async (page) => {
      await openCmsWithAuth(page);
      const newBtn = page.locator('a[href*="new"], [class*="NewEntry"]').first();
      if (await newBtn.isVisible().catch(() => false)) {
        await newBtn.click();
        await page.waitForTimeout(3000);
      }
      // Focus on toolbar area by scrolling to top
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);
    },
  },
  {
    id: 'cms-pages',
    name: 'CMS 固定ページ一覧',
    action: async (page) => {
      await openCmsWithAuth(page);
      // Navigate to pages collection
      const pagesLink = page.locator('a[href*="pages"], [class*="SidebarLink"]:has-text("固定ページ")').first();
      if (await pagesLink.isVisible().catch(() => false)) {
        await pagesLink.click();
        await page.waitForTimeout(2000);
      }
    },
  },
  {
    id: 'cms-dropdown',
    name: 'CMS 公開URLバー＋ドロップダウン表示時',
    action: async (page) => {
      await openCmsWithAuth(page);
      const entry = page.locator('[class*="ListCard"], [class*="entry"]').first();
      if (await entry.isVisible().catch(() => false)) {
        await entry.click();
        await page.waitForTimeout(3000);
      }
      // Check if URL bar and other overlays exist
      await page.waitForTimeout(1000);
    },
  },
];

async function run() {
  // Start local preview server
  const { exec } = await import('child_process');
  const server = exec('npx astro preview --port 4321', { cwd: process.cwd() });
  await new Promise(r => setTimeout(r, 3000));

  const browser = await chromium.launch();
  const results = [];

  for (const device of DEVICES_CONFIG) {
    console.log(`\n=== ${device.name} ===`);
    const context = await browser.newContext({
      ...device.config,
      ignoreHTTPSErrors: true,
    });

    for (const check of CMS_CHECKS) {
      const page = await context.newPage();
      const screenshotPath = join(SCREENSHOT_DIR, `${check.id}_${device.name}.png`);

      try {
        await check.action(page);
        const overlaps = await detectOverlaps(page);

        // Build annotations for red borders
        const annotations = overlaps.map(o => ({
          left: Math.min(o.rectA.left, o.rectB.left),
          top: Math.min(o.rectA.top, o.rectB.top),
          width: Math.max(o.rectA.left + o.rectA.width, o.rectB.left + o.rectB.width) - Math.min(o.rectA.left, o.rectB.left),
          height: Math.max(o.rectA.top + o.rectA.height, o.rectB.top + o.rectB.height) - Math.min(o.rectA.top, o.rectB.top),
        }));

        await screenshotWithAnnotation(page, screenshotPath, annotations);

        const pass = overlaps.length === 0;
        console.log(`  [${pass ? 'PASS' : 'FAIL'}] ${check.name}: ${overlaps.length} overlaps`);
        if (!pass) overlaps.forEach(o => console.log(`    - ${o.elementA} <-> ${o.elementB}`));

        results.push({
          device: device.name, page: check.name, id: check.id,
          overlaps, pass, screenshot: `${check.id}_${device.name}.png`,
        });
      } catch (err) {
        console.log(`  [ERROR] ${check.name}: ${err.message}`);
        await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
        results.push({
          device: device.name, page: check.name, id: check.id,
          overlaps: [], pass: true, screenshot: `${check.id}_${device.name}.png`,
          note: err.message,
        });
      }

      await page.close();
    }

    await context.close();
  }

  console.log('\n\n=== CMS OVERLAP TEST SUMMARY ===');
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  console.log(`Total: ${results.length} | PASS: ${passed} | FAIL: ${failed}`);
  results.forEach(r => console.log(`  [${r.pass ? 'PASS' : 'FAIL'}] ${r.device} - ${r.page}`));

  writeFileSync(join(process.cwd(), 'evidence', '2026-02-23', 'cms-overlap-results.json'), JSON.stringify(results, null, 2));

  await browser.close();
  server.kill();
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });
