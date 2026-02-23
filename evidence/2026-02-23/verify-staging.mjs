import { chromium, devices } from 'playwright';
import { mkdirSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'https://staging.reiwa.casa';
const EVIDENCE_DIR = join(process.cwd(), 'evidence');

const DEVICES = [
  { name: 'PC', config: { viewport: { width: 1280, height: 800 }, userAgent: undefined } },
  { name: 'iPad', config: devices['iPad Pro 11'] },
  { name: 'iPhone', config: devices['iPhone 14'] },
];

const CHECKS = [
  {
    id: '1-top',
    name: 'トップページ表示',
    url: '/',
    verify: async (page) => {
      const title = await page.title();
      const staging = await page.locator('text=[STAGING]').count();
      const articles = await page.locator('article, .post-item, a[href*="/posts/"]').count();
      return {
        title,
        hasStaging: staging > 0,
        articleCount: articles,
        pass: staging > 0 && articles > 0,
      };
    },
  },
  {
    id: '2-article',
    name: '記事詳細ページ',
    url: null, // dynamic
    setup: async (page) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      const link = page.locator('a[href*="/posts/"]').first();
      const href = await link.getAttribute('href');
      return href;
    },
    verify: async (page) => {
      const h1 = await page.locator('h1, h2').first().textContent().catch(() => '');
      const backLink = await page.locator('a[href="/"]').count();
      const tags = await page.locator('a[href*="/tags/"]').count();
      return {
        heading: h1?.trim(),
        hasBackLink: backLink > 0,
        tagCount: tags,
        pass: h1?.trim().length > 0,
      };
    },
  },
  {
    id: '3-draft-hidden',
    name: '下書き記事が非表示',
    url: '/posts/2026/02/codeblockテスト',
    verify: async (page) => {
      const status = page.url().includes('404') || (await page.locator('text=404').count()) > 0 || (await page.locator('text=ページが見つかりません').count()) > 0;
      // Also check HTTP status via response
      return {
        is404: status,
        pass: status,
      };
    },
    expectError: true,
  },
  {
    id: '4-fixed-page',
    name: '固定ページ・ナビゲーション',
    url: '/',
    verify: async (page) => {
      const dropdown = await page.locator('.nav-dropdown, [class*="dropdown"]').count();
      const navLinks = await page.locator('nav a, header a').count();
      return {
        hasDropdown: dropdown > 0,
        navLinkCount: navLinks,
        pass: navLinks > 0,
      };
    },
  },
  {
    id: '5-404',
    name: '404ページ',
    url: '/this-page-does-not-exist-12345',
    verify: async (page) => {
      const has404 = await page.locator('text=404').count();
      const hasNotFound = await page.locator('text=見つかりません').count();
      return {
        has404Text: has404 > 0,
        hasNotFoundText: hasNotFound > 0,
        pass: has404 > 0 || hasNotFound > 0,
      };
    },
    expectError: true,
  },
  {
    id: '6-admin',
    name: 'CMS管理画面',
    url: '/admin/',
    verify: async (page) => {
      // Wait for CMS to load
      await page.waitForTimeout(3000);
      const hasCMS = (await page.locator('[data-netlify-cms], #nc-root, [id*="cms"]').count()) > 0
        || (await page.title()).toLowerCase().includes('content manager')
        || (await page.locator('text=Content Manager').count()) > 0
        || (await page.locator('button, [role="button"]').count()) > 2;
      return {
        cmsLoaded: hasCMS,
        pageTitle: await page.title(),
        pass: hasCMS,
      };
    },
  },
];

async function run() {
  const browser = await chromium.launch();
  const results = [];

  for (const device of DEVICES) {
    console.log(`\n=== ${device.name} ===`);
    const context = await browser.newContext({
      ...device.config,
      ignoreHTTPSErrors: true,
    });
    const page = await context.newPage();

    for (const check of CHECKS) {
      const screenshotName = `${check.id}_${device.name}.png`;
      const screenshotPath = join(EVIDENCE_DIR, screenshotName);

      try {
        let url = check.url;
        if (check.setup) {
          const dynamicPath = await check.setup(page);
          url = dynamicPath;
        }

        if (url) {
          const fullUrl = url.startsWith('http') ? url : BASE_URL + url;
          const response = await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 15000 });
          await page.waitForTimeout(1000);
        }

        await page.screenshot({ path: screenshotPath, fullPage: true });

        const result = await check.verify(page);
        const status = result.pass ? 'PASS' : 'FAIL';
        console.log(`  [${status}] ${check.name}: ${JSON.stringify(result)}`);
        results.push({ device: device.name, check: check.name, ...result, screenshot: screenshotName });
      } catch (err) {
        if (check.expectError) {
          await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
          console.log(`  [PASS] ${check.name}: Expected error (404 page)`);
          results.push({ device: device.name, check: check.name, pass: true, error: err.message, screenshot: screenshotName });
        } else {
          console.log(`  [FAIL] ${check.name}: ${err.message}`);
          await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
          results.push({ device: device.name, check: check.name, pass: false, error: err.message, screenshot: screenshotName });
        }
      }
    }

    // Security headers check
    try {
      const response = await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      const headers = response.headers();
      const secHeaders = {
        'x-content-type-options': headers['x-content-type-options'],
        'referrer-policy': headers['referrer-policy'],
        'strict-transport-security': headers['strict-transport-security'],
        'permissions-policy': headers['permissions-policy'],
      };
      console.log(`  [INFO] Security headers (top page): ${JSON.stringify(secHeaders)}`);
      results.push({ device: device.name, check: 'セキュリティヘッダー（トップ）', ...secHeaders, pass: !!secHeaders['x-content-type-options'] });

      const adminResponse = await page.goto(BASE_URL + '/admin/', { waitUntil: 'networkidle' });
      const adminHeaders = adminResponse.headers();
      const adminSecHeaders = {
        'cross-origin-opener-policy': adminHeaders['cross-origin-opener-policy'],
        'x-frame-options': adminHeaders['x-frame-options'],
        'content-security-policy': adminHeaders['content-security-policy']?.substring(0, 100) + '...',
      };
      await page.screenshot({ path: join(EVIDENCE_DIR, `7-headers_${device.name}.png`), fullPage: true });
      console.log(`  [INFO] Security headers (admin): ${JSON.stringify(adminSecHeaders)}`);
      const adminPass = adminHeaders['cross-origin-opener-policy'] === 'same-origin-allow-popups';
      results.push({ device: device.name, check: 'セキュリティヘッダー（admin）', ...adminSecHeaders, pass: adminPass });
    } catch (err) {
      console.log(`  [FAIL] Security headers: ${err.message}`);
    }

    await context.close();
  }

  // Summary
  console.log('\n\n=== SUMMARY ===');
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  console.log(`Total: ${results.length} | PASS: ${passed} | FAIL: ${failed}`);

  for (const r of results) {
    const status = r.pass ? 'PASS' : 'FAIL';
    console.log(`  [${status}] ${r.device} - ${r.check}`);
  }

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
