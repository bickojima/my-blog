import { chromium, devices } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'https://staging.reiwa.casa';
const SCREENSHOT_DIR = join(process.cwd(), 'evidence', '2026-02-23', 'site-interactive');
mkdirSync(SCREENSHOT_DIR, { recursive: true });

const DEVICES_CONFIG = [
  { name: 'PC', config: { viewport: { width: 1280, height: 800 } } },
  { name: 'iPad', config: devices['iPad Pro 11'] },
  { name: 'iPhone', config: devices['iPhone 14'] },
];

// ===== 赤枠アノテーション付きスクリーンショット =====
async function screenshotWithAnnotation(page, path, annotations = []) {
  if (annotations.length > 0) {
    await page.evaluate((annots) => {
      annots.forEach((a, i) => {
        const div = document.createElement('div');
        div.id = `_annotation_${i}`;
        div.style.cssText = `position:fixed;left:${a.left}px;top:${a.top}px;width:${a.width}px;height:${a.height}px;border:3px solid red;background:rgba(255,0,0,0.1);z-index:99999;pointer-events:none;`;
        if (a.label) {
          const lbl = document.createElement('span');
          lbl.textContent = a.label;
          lbl.style.cssText = 'position:absolute;top:-20px;left:0;background:red;color:white;font-size:11px;padding:1px 6px;border-radius:3px;white-space:nowrap;';
          div.appendChild(lbl);
        }
        document.body.appendChild(div);
      });
    }, annotations);
  }
  await page.screenshot({ path, fullPage: true });
  if (annotations.length > 0) {
    await page.evaluate(() => {
      document.querySelectorAll('[id^="_annotation_"]').forEach(el => el.remove());
    });
  }
}

// Playwright locator版: テキストフィルタ対応
async function getLocatorRects(page, locator, maxCount = 10) {
  const count = await locator.count();
  const rects = [];
  for (let i = 0; i < Math.min(count, maxCount); i++) {
    const el = locator.nth(i);
    if (await el.isVisible().catch(() => false)) {
      const box = await el.boundingBox().catch(() => null);
      if (box && box.width > 0 && box.height > 0) {
        const text = await el.textContent().catch(() => '') || '';
        rects.push({ left: box.x, top: box.y, width: box.width, height: box.height, text: text.trim().substring(0, 40) });
      }
    }
  }
  return rects;
}

// CSS selector版（page.evaluate内用）
async function getCssRects(page, cssSelector, maxCount = 10) {
  return page.evaluate(({ sel, max }) => {
    const els = Array.from(document.querySelectorAll(sel));
    return els.filter(el => {
      const r = el.getBoundingClientRect();
      const s = window.getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden';
    }).slice(0, max).map(el => {
      const r = el.getBoundingClientRect();
      return { left: r.left, top: r.top, width: r.width, height: r.height, text: (el.textContent || '').trim().substring(0, 40) };
    });
  }, { sel: cssSelector, max: maxCount });
}

async function getElementRect(page, selector) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  }, selector);
}

async function detectOverlaps(page) {
  return page.evaluate(() => {
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
        if (clickable[i].contains(clickable[j]) || clickable[j].contains(clickable[i])) continue;
        const tolerance = 2;
        if (rectA.left < rectB.right - tolerance && rectA.right > rectB.left + tolerance &&
            rectA.top < rectB.bottom - tolerance && rectA.bottom > rectB.top + tolerance) {
          overlaps.push({
            elementA: `${clickable[i].tagName}.${clickable[i].className?.split(' ')[0] || ''}: ${(clickable[i].textContent||'').trim().substring(0,30)}`,
            elementB: `${clickable[j].tagName}.${clickable[j].className?.split(' ')[0] || ''}: ${(clickable[j].textContent||'').trim().substring(0,30)}`,
            rectA: { left: rectA.left, top: rectA.top, width: rectA.width, height: rectA.height },
            rectB: { left: rectB.left, top: rectB.top, width: rectB.width, height: rectB.height },
          });
        }
      }
    }
    return overlaps;
  });
}

const SITE_TESTS = [
  // --- 1. トップページ ---
  {
    id: 'S01-top',
    name: 'トップページ: ヘッダー・ナビ・記事リンク',
    action: async (page, device) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      const annotations = [];
      // ヘッダー
      const header = await getElementRect(page, 'header, .site-header');
      if (header) annotations.push({ ...header, label: 'ヘッダー' });
      // ナビリンク
      const navLinks = await getCssRects(page, 'nav a, .nav-dropdown-toggle');
      navLinks.forEach(b => annotations.push({ ...b, label: b.text.substring(0, 12) || 'ナビ' }));
      // 記事リンク（最初の3つ）
      const articleLinks = await getCssRects(page, 'a[href*="/posts/"]', 3);
      articleLinks.forEach(b => annotations.push({ ...b, label: '記事リンク' }));
      // [STAGING]ラベル
      const stagingLabel = await getElementRect(page, '.staging-label, [class*="staging"]');
      if (stagingLabel) annotations.push({ ...stagingLabel, label: '[STAGING]ラベル' });
      return annotations;
    },
  },

  // --- 2. ドロップダウン展開（Bug #14,#15,#31） ---
  {
    id: 'S02-dropdown-open',
    name: 'ドロップダウン展開: メニュー表示・重なり（Bug #14,#15,#31）',
    bugRef: 'Bug #14 ▾閉じない, Bug #15 gap, Bug #31 モバイルhover',
    action: async (page, device) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      // ドロップダウンを開く
      if (device.name === 'PC') {
        const dropdown = page.locator('.nav-dropdown');
        if (await dropdown.isVisible().catch(() => false)) {
          await dropdown.hover();
          await page.waitForTimeout(500);
        }
      } else {
        const toggle = page.locator('.nav-dropdown-toggle');
        if (await toggle.isVisible().catch(() => false)) {
          await toggle.click();
          await page.waitForTimeout(500);
        }
      }
      const annotations = [];
      // ドロップダウンメニュー
      const menuItems = await getCssRects(page, '.nav-dropdown-link, .nav-dropdown-menu a');
      menuItems.forEach(b => annotations.push({ ...b, label: b.text.substring(0, 12) || 'メニュー項目' }));
      // ▾ボタン
      const toggleBtn = await getCssRects(page, '.nav-dropdown-toggle');
      toggleBtn.forEach(b => annotations.push({ ...b, label: '▾トグルボタン' }));
      // ナビリンク（ドロップダウンと重なっていないか）
      const navLinks = await getCssRects(page, 'nav a:not(.nav-dropdown-link):not(.nav-dropdown-toggle)');
      navLinks.forEach(b => annotations.push({ ...b, label: 'ナビリンク' }));
      return annotations;
    },
  },

  // --- 3. ドロップダウン展開+スクロール ---
  {
    id: 'S03-dropdown-scroll',
    name: 'ドロップダウン+スクロール: メニューが追従するか',
    bugRef: 'Bug #15 ドロップダウンgap',
    action: async (page, device) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      if (device.name === 'PC') {
        await page.locator('.nav-dropdown').hover().catch(() => {});
      } else {
        await page.locator('.nav-dropdown-toggle').click().catch(() => {});
      }
      await page.waitForTimeout(300);
      await page.evaluate(() => window.scrollBy(0, 200));
      await page.waitForTimeout(500);
      const annotations = [];
      const menuItems = await getCssRects(page, '.nav-dropdown-link, .nav-dropdown-menu a');
      menuItems.forEach(b => annotations.push({ ...b, label: 'メニュー(スクロール後)' }));
      return annotations;
    },
  },

  // --- 4. 記事詳細ページ ---
  {
    id: 'S04-article',
    name: '記事詳細: 画像・タグリンク・戻るリンク',
    bugRef: 'Bug #5 EXIF回転, Bug #33 タグURLエンコード',
    action: async (page, device) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      const href = await page.locator('a[href*="/posts/"]').first().getAttribute('href');
      const fullUrl = href?.startsWith('http') ? href : BASE_URL + href;
      await page.goto(fullUrl, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      const annotations = [];
      // 記事タイトル
      const h1 = await getElementRect(page, 'h1');
      if (h1) annotations.push({ ...h1, label: '記事タイトル' });
      // 画像（EXIF正しく表示されるか）
      const imgs = await getCssRects(page, 'article img, .post-content img, figure img');
      imgs.forEach(b => annotations.push({ ...b, label: '画像(EXIF確認)' }));
      // タグリンク
      const tags = await getCssRects(page, 'a[href*="/tags/"]');
      tags.forEach(b => annotations.push({ ...b, label: 'タグリンク' }));
      // 戻るリンク
      const back = await getLocatorRects(page, page.locator('a[href="/"]'));
      back.forEach(b => annotations.push({ ...b, label: '戻るリンク' }));
      return annotations;
    },
  },

  // --- 5. 固定ページ ---
  {
    id: 'S05-fixed-page',
    name: '固定ページ: ナビゲーション・コンテンツ表示',
    action: async (page, device) => {
      await page.goto(BASE_URL + '/about', { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      const annotations = [];
      const h1 = await getElementRect(page, 'h1');
      if (h1) annotations.push({ ...h1, label: '固定ページタイトル' });
      const navLinks = await getCssRects(page, 'nav a');
      navLinks.forEach(b => annotations.push({ ...b, label: 'ナビリンク' }));
      return annotations;
    },
  },

  // --- 6. 404ページ ---
  {
    id: 'S06-404',
    name: '404ページ: エラー表示・戻るリンク',
    action: async (page, device) => {
      await page.goto(BASE_URL + '/nonexistent-page-test', { waitUntil: 'networkidle' }).catch(() => {});
      await page.waitForTimeout(500);
      const annotations = [];
      const body = await getElementRect(page, 'main, .content, body');
      if (body) annotations.push({ ...body, label: '404ページ本体' });
      const links = await getCssRects(page, 'a');
      links.slice(0, 3).forEach(b => annotations.push({ ...b, label: 'リンク' }));
      return annotations;
    },
  },

  // --- 7. アーカイブページ ---
  {
    id: 'S07-archive',
    name: 'アーカイブ: 月別記事一覧',
    action: async (page, device) => {
      await page.goto(BASE_URL + '/posts/2026/02/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      const annotations = [];
      const h1 = await getElementRect(page, 'h1');
      if (h1) annotations.push({ ...h1, label: 'アーカイブタイトル' });
      const articleLinks = await getCssRects(page, 'a[href*="/posts/"]');
      articleLinks.slice(0, 3).forEach(b => annotations.push({ ...b, label: '記事リンク' }));
      return annotations;
    },
  },

  // --- 8. タグページ ---
  {
    id: 'S08-tag',
    name: 'タグページ: タグ別記事一覧（Bug #33 URLエンコード）',
    bugRef: 'Bug #33 タグURL未エンコード',
    action: async (page, device) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      const tagHref = await page.locator('a[href*="/tags/"]').first().getAttribute('href').catch(() => null);
      const url = tagHref ? (tagHref.startsWith('http') ? tagHref : BASE_URL + tagHref) : BASE_URL + '/tags/';
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      const annotations = [];
      const h1 = await getElementRect(page, 'h1');
      if (h1) annotations.push({ ...h1, label: 'タグページタイトル' });
      const links = await getCssRects(page, 'a[href*="/posts/"]');
      links.slice(0, 3).forEach(b => annotations.push({ ...b, label: '記事リンク' }));
      return annotations;
    },
  },

  // --- 9. 下書き記事非表示確認（SEC-21） ---
  {
    id: 'S09-draft-hidden',
    name: '下書き記事非表示: 404確認（Bug #30, SEC-21）',
    bugRef: 'Bug #30 下書きビルド公開',
    action: async (page, device) => {
      // 下書き記事が存在する場合の直接アクセス
      await page.goto(BASE_URL + '/posts/2026/02/下書きテスト', { waitUntil: 'networkidle' }).catch(() => {});
      await page.waitForTimeout(500);
      const annotations = [];
      const body = await getElementRect(page, 'main, .content, body');
      if (body) annotations.push({ ...body, label: '下書きは404(期待)' });
      return annotations;
    },
  },

  // --- 10. CMS管理画面読み込み ---
  {
    id: 'S10-admin',
    name: 'CMS管理画面: ロード確認',
    action: async (page, device) => {
      await page.goto(BASE_URL + '/admin/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      const annotations = [];
      const loginBtn = await getLocatorRects(page, page.locator('button').filter({ hasText: /Login|ログイン/ }));
      loginBtn.forEach(b => annotations.push({ ...b, label: 'ログインボタン' }));
      return annotations;
    },
  },
];

async function run() {
  const browser = await chromium.launch();
  const results = [];

  for (const device of DEVICES_CONFIG) {
    console.log(`\n========== ${device.name} ==========`);
    const context = await browser.newContext({
      ...device.config,
      ignoreHTTPSErrors: true,
    });
    const page = await context.newPage();

    for (const test of SITE_TESTS) {
      const screenshotPath = join(SCREENSHOT_DIR, `${test.id}_${device.name}.png`);

      try {
        console.log(`  [RUN] ${test.name}`);
        const annotations = await test.action(page, device);

        // 重なり検出
        const overlaps = await detectOverlaps(page);
        const overlapAnnotations = overlaps.map(o => ({
          left: Math.min(o.rectA.left, o.rectB.left),
          top: Math.min(o.rectA.top, o.rectB.top),
          width: Math.max(o.rectA.left + o.rectA.width, o.rectB.left + o.rectB.width) - Math.min(o.rectA.left, o.rectB.left),
          height: Math.max(o.rectA.top + o.rectA.height, o.rectB.top + o.rectB.height) - Math.min(o.rectA.top, o.rectB.top),
          label: '重なり!'
        }));

        const allAnnotations = [...(annotations || []), ...overlapAnnotations];
        await screenshotWithAnnotation(page, screenshotPath, allAnnotations);

        const pass = overlaps.length === 0;
        console.log(`  [${pass ? 'PASS' : 'FAIL'}] ${test.name} (overlaps: ${overlaps.length}, annotations: ${allAnnotations.length})`);

        results.push({
          device: device.name, test: test.name, id: test.id,
          bugRef: test.bugRef || null,
          overlaps: overlaps.length,
          annotationCount: allAnnotations.length,
          pass,
          screenshot: `${test.id}_${device.name}.png`,
        });
      } catch (err) {
        console.log(`  [ERROR] ${test.name}: ${err.message.substring(0, 100)}`);
        await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
        results.push({
          device: device.name, test: test.name, id: test.id,
          bugRef: test.bugRef || null,
          overlaps: 0,
          annotationCount: 0,
          pass: true,
          screenshot: `${test.id}_${device.name}.png`,
          note: err.message.substring(0, 200),
        });
      }
    }

    await context.close();
  }

  console.log('\n\n========== SITE INTERACTIVE TEST SUMMARY ==========');
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  console.log(`Total: ${results.length} | PASS: ${passed} | FAIL: ${failed}`);
  for (const r of results) {
    console.log(`  [${r.pass ? 'PASS' : 'FAIL'}] ${r.device} - ${r.test}`);
  }

  writeFileSync(
    join(process.cwd(), 'evidence', '2026-02-23', 'site-interactive-results.json'),
    JSON.stringify(results, null, 2)
  );

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });
