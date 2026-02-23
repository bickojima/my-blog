import { chromium, devices } from 'playwright';
import { mkdirSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'https://staging.reiwa.casa';
const SCREENSHOT_DIR = join(process.cwd(), 'evidence', '2026-02-23', 'overlap-screenshots');
mkdirSync(SCREENSHOT_DIR, { recursive: true });

const DEVICES_CONFIG = [
  { name: 'PC', config: { viewport: { width: 1280, height: 800 } } },
  { name: 'iPad', config: devices['iPad Pro 11'] },
  { name: 'iPhone', config: devices['iPhone 14'] },
];

// ボタン/クリック可能要素の重なりを検出する関数
async function detectOverlaps(page) {
  return await page.evaluate(() => {
    const clickable = Array.from(document.querySelectorAll(
      'a, button, [role="button"], input[type="submit"], input[type="button"], .nav-dropdown-toggle, .nav-dropdown-link, select, [onclick]'
    ));
    const overlaps = [];

    for (let i = 0; i < clickable.length; i++) {
      const rectA = clickable[i].getBoundingClientRect();
      if (rectA.width === 0 || rectA.height === 0) continue;
      const styleA = window.getComputedStyle(clickable[i]);
      if (styleA.display === 'none' || styleA.visibility === 'hidden' || styleA.opacity === '0') continue;

      for (let j = i + 1; j < clickable.length; j++) {
        const rectB = clickable[j].getBoundingClientRect();
        if (rectB.width === 0 || rectB.height === 0) continue;
        const styleB = window.getComputedStyle(clickable[j]);
        if (styleB.display === 'none' || styleB.visibility === 'hidden' || styleB.opacity === '0') continue;

        // Check overlap (with 2px tolerance)
        const tolerance = 2;
        if (
          rectA.left < rectB.right - tolerance &&
          rectA.right > rectB.left + tolerance &&
          rectA.top < rectB.bottom - tolerance &&
          rectA.bottom > rectB.top + tolerance
        ) {
          // Skip parent-child relationships (nested links/buttons are normal)
          if (clickable[i].contains(clickable[j]) || clickable[j].contains(clickable[i])) continue;

          overlaps.push({
            elementA: clickable[i].tagName + (clickable[i].className ? '.' + clickable[i].className.split(' ')[0] : '') + ': ' + (clickable[i].textContent || '').trim().substring(0, 30),
            elementB: clickable[j].tagName + (clickable[j].className ? '.' + clickable[j].className.split(' ')[0] : '') + ': ' + (clickable[j].textContent || '').trim().substring(0, 30),
            overlapArea: {
              left: Math.max(rectA.left, rectB.left),
              top: Math.max(rectA.top, rectB.top),
              right: Math.min(rectA.right, rectB.right),
              bottom: Math.min(rectA.bottom, rectB.bottom),
            },
          });
        }
      }
    }
    return overlaps;
  });
}

const PAGES = [
  { id: 'top', name: 'トップページ', url: '/' },
  { id: 'article', name: '記事詳細ページ', url: null, findUrl: true },
  { id: 'fixed-page', name: '固定ページ', url: '/about' },
  { id: '404', name: '404ページ', url: '/nonexistent-page' },
  { id: 'tag', name: 'タグページ', url: null, findTagUrl: true },
  { id: 'archive', name: 'アーカイブページ', url: '/posts/2026/02/' },
];

const INTERACTIONS = [
  {
    id: 'dropdown-open',
    name: 'ドロップダウン展開時',
    url: '/',
    action: async (page, deviceName) => {
      if (deviceName === 'PC') {
        await page.locator('.nav-dropdown').hover();
      } else {
        await page.locator('.nav-dropdown-toggle').click().catch(() => {});
      }
      await page.waitForTimeout(500);
    },
  },
  {
    id: 'dropdown-and-scroll',
    name: 'ドロップダウン展開+スクロール',
    url: '/',
    action: async (page, deviceName) => {
      if (deviceName === 'PC') {
        await page.locator('.nav-dropdown').hover();
      } else {
        await page.locator('.nav-dropdown-toggle').click().catch(() => {});
      }
      await page.waitForTimeout(300);
      await page.evaluate(() => window.scrollBy(0, 200));
      await page.waitForTimeout(500);
    },
  },
];

async function run() {
  const browser = await chromium.launch();
  const results = [];

  for (const device of DEVICES_CONFIG) {
    console.log(`\n=== ${device.name} ===`);
    const context = await browser.newContext({
      ...device.config,
      ignoreHTTPSErrors: true,
    });
    const page = await context.newPage();

    // 1. 各ページの静的チェック
    for (const pageInfo of PAGES) {
      let url = pageInfo.url;

      if (pageInfo.findUrl) {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });
        const href = await page.locator('a[href*="/posts/"]').first().getAttribute('href');
        url = href;
      }
      if (pageInfo.findTagUrl) {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });
        const href = await page.locator('a[href*="/tags/"]').first().getAttribute('href').catch(() => '/tags/');
        url = href;
      }

      const fullUrl = url?.startsWith('http') ? url : BASE_URL + url;
      try {
        await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 10000 });
        await page.waitForTimeout(500);
      } catch (e) {
        // 404 pages may throw
      }

      const screenshotPath = join(SCREENSHOT_DIR, `${pageInfo.id}_${device.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });

      const overlaps = await detectOverlaps(page);
      const pass = overlaps.length === 0;
      console.log(`  [${pass ? 'PASS' : 'FAIL'}] ${pageInfo.name}: ${overlaps.length} overlaps`);
      if (overlaps.length > 0) {
        overlaps.forEach(o => console.log(`    - ${o.elementA} <-> ${o.elementB}`));
      }
      results.push({
        device: device.name,
        page: pageInfo.name,
        id: pageInfo.id,
        overlaps,
        pass,
        screenshot: `${pageInfo.id}_${device.name}.png`,
      });
    }

    // 2. インタラクション後のチェック
    for (const interaction of INTERACTIONS) {
      const fullUrl = BASE_URL + interaction.url;
      await page.goto(fullUrl, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);

      await interaction.action(page, device.name);

      const screenshotPath = join(SCREENSHOT_DIR, `${interaction.id}_${device.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });

      const overlaps = await detectOverlaps(page);
      const pass = overlaps.length === 0;
      console.log(`  [${pass ? 'PASS' : 'FAIL'}] ${interaction.name}: ${overlaps.length} overlaps`);
      if (overlaps.length > 0) {
        overlaps.forEach(o => console.log(`    - ${o.elementA} <-> ${o.elementB}`));
      }
      results.push({
        device: device.name,
        page: interaction.name,
        id: interaction.id,
        overlaps,
        pass,
        screenshot: `${interaction.id}_${device.name}.png`,
      });
    }

    await context.close();
  }

  // Summary
  console.log('\n\n=== OVERLAP TEST SUMMARY ===');
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  console.log(`Total: ${results.length} | PASS: ${passed} | FAIL: ${failed}`);
  for (const r of results) {
    console.log(`  [${r.pass ? 'PASS' : 'FAIL'}] ${r.device} - ${r.page}${r.overlaps.length > 0 ? ' (' + r.overlaps.length + ' overlaps)' : ''}`);
  }

  // Output JSON for report generation
  const { writeFileSync } = await import('fs');
  writeFileSync(
    join(process.cwd(), 'evidence', '2026-02-23', 'overlap-results.json'),
    JSON.stringify(results, null, 2)
  );

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
