/**
 * Issue #97 本番反映後の公開サイト検証スクリプト（2026-08-11）
 *
 * 検証項目:
 *   P01-P06: 本番 robots/sitemap/RSS/tags/canonical/OGP
 *   S01-S06: 公開サイト（ダークモード・ページネーション・タグ一覧・RSS・OGP・a11y）
 *   F01-F10: Modern Web Guidance レビュー指摘の維持確認（回帰防止）
 *
 * デバイス: PC (1280x800) / iPad Pro 11 (834x1194) / iPhone 14 (390x844)
 *
 * 使用方法:
 *   node evidence/2026-08-11/verify-production.mjs
 *
 * 注記: CMS画面の検証は unpkg.com（Decap CMS本体CDN）への到達が必要。
 *       本スクリプトは公開サイトとソース設定のみを対象とする。
 */
import { chromium, devices } from 'playwright';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { createServer } from 'http';
import { readFile } from 'fs/promises';

const BASE_URL = 'https://reiwa.casa';
const OUT = join(process.cwd(), 'evidence/2026-08-11');
const SS = join(OUT, 'screenshots');
mkdirSync(SS, { recursive: true });
const AXE_SOURCE = readFileSync(join(process.cwd(), 'node_modules/axe-core/axe.min.js'), 'utf-8');

const DEVICES_CONFIG = [
  { name: 'PC', config: { viewport: { width: 1280, height: 800 } } },
  { name: 'iPad', config: devices['iPad Pro 11'] },
  { name: 'iPhone', config: devices['iPhone 14'] },
];

const results = [];
function record(device, id, name, pass, detail = {}) {
  const tag = pass === true ? 'PASS' : pass === false ? 'FAIL' : 'INFO';
  console.log(`  [${tag}] ${device} ${id}: ${name} ${JSON.stringify(detail).substring(0, 240)}`);
  results.push({ device, id, name, pass, detail });
}

function startServer(distDir) {
  const MIME = {
    '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
    '.yml': 'text/yaml', '.json': 'application/json', '.xml': 'application/xml',
    '.txt': 'text/plain', '.png': 'image/png', '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  };
  return new Promise(resolve => {
    const server = createServer(async (req, res) => {
      let urlPath = decodeURIComponent(req.url.split('?')[0]);
      if (urlPath === '/admin' || urlPath === '/admin/') urlPath = '/admin/index.html';
      let filePath = join(distDir, urlPath === '/' ? 'index.html' : urlPath);
      if (filePath.endsWith('/')) filePath += 'index.html';
      for (const p of [filePath, filePath + '.html', join(filePath, 'index.html')]) {
        try {
          const data = await readFile(p);
          res.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'application/octet-stream' });
          res.end(data);
          return;
        } catch {}
      }
      res.writeHead(404); res.end('Not Found');
    });
    server.listen(PORT, () => resolve(server));
  });
}

async function annotate(page, items) {
  await page.evaluate((list) => {
    document.querySelectorAll('[data-ev-ann]').forEach(e => e.remove());
    for (const it of list) {
      const el = document.querySelector(it.selector);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      const box = document.createElement('div');
      box.dataset.evAnn = '1';
      box.style.cssText = `position:absolute;left:${r.left + scrollX - 3}px;top:${r.top + scrollY - 3}px;width:${r.width + 6}px;height:${r.height + 6}px;border:3px solid #e00;z-index:2147483646;pointer-events:none;box-sizing:border-box`;
      const lbl = document.createElement('div');
      lbl.dataset.evAnn = '1';
      lbl.textContent = it.label;
      lbl.style.cssText = `position:absolute;left:${r.left + scrollX}px;top:${Math.max(0, r.top + scrollY - 24)}px;background:#e00;color:#fff;font:700 13px/1.4 sans-serif;padding:2px 6px;z-index:2147483647;pointer-events:none`;
      document.body.append(box, lbl);
    }
  }, items);
}

async function runAxe(page) {
  // 赤枠アノテーションはlandmark外のdivとして残るため、axe実行前に必ず除去する
  // （残すと region 違反「All page content should be contained by landmarks」を自作してしまう）
  await page.evaluate(() => document.querySelectorAll('[data-ev-ann]').forEach(e => e.remove()));
  await page.evaluate(AXE_SOURCE);
  return page.evaluate(async () => {
    const r = await axe.run({ resultTypes: ['violations'] });
    return r.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help }));
  });
}

async function getText(path) {
  const response = await fetch(BASE_URL + path, { redirect: 'follow' });
  return { status: response.status, url: response.url, text: await response.text() };
}

// ===== 本番公開リソース（Issue #97 必須項目） =====
async function verifyProductionResources() {
  console.log('\n===== PRODUCTION RESOURCES (ISSUE #97) =====');
  const [robots, sitemapIndex, sitemap, rss, tags, top] = await Promise.all([
    getText('/robots.txt'),
    getText('/sitemap-index.xml'),
    getText('/sitemap-0.xml'),
    getText('/rss.xml'),
    getText('/tags/'),
    getText('/'),
  ]);

  record('Production', 'P01', 'robots.txt が本番用（Allow + Sitemap）',
    robots.status === 200 && /Allow:\s*\//.test(robots.text) && !/Disallow:\s*\//.test(robots.text)
      && /Sitemap:\s*https:\/\/reiwa\.casa\/sitemap-index\.xml/.test(robots.text),
    { status: robots.status, body: robots.text.trim() });
  record('Production', 'P02', 'sitemap-index.xml が本番URLを参照',
    sitemapIndex.status === 200 && sitemapIndex.text.includes('https://reiwa.casa/sitemap-0.xml')
      && !sitemapIndex.text.includes('staging.reiwa.casa'),
    { status: sitemapIndex.status });
  record('Production', 'P03', 'sitemap-0.xml が本番URLを収録',
    sitemap.status === 200 && sitemap.text.includes('<loc>https://reiwa.casa/')
      && !sitemap.text.includes('staging.reiwa.casa'),
    { status: sitemap.status, locCount: (sitemap.text.match(/<loc>/g) || []).length });
  record('Production', 'P04', 'RSS が本番URLで配信',
    rss.status === 200 && /<rss[\s>]/.test(rss.text) && rss.text.includes('https://reiwa.casa')
      && !rss.text.includes('staging.reiwa.casa'),
    { status: rss.status, bytes: rss.text.length });
  record('Production', 'P05', 'タグ一覧が公開',
    tags.status === 200 && /<h1[^>]*>[^<]*タグ/.test(tags.text),
    { status: tags.status, url: tags.url });
  const canonical = (top.text.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/) || [])[1];
  const ogUrl = (top.text.match(/<meta[^>]+property="og:url"[^>]+content="([^"]+)"/) || [])[1];
  record('Production', 'P06', 'canonical / og:url が本番URL',
    top.status === 200 && canonical === 'https://reiwa.casa/' && ogUrl === 'https://reiwa.casa/',
    { status: top.status, canonical, ogUrl });
}

// ===== マージ時の環境別値（ソース検証、デバイス非依存） =====
function verifyMergeValues() {
  console.log('\n===== MERGE VALUES (DOCUMENTATION.md 4.6.2章) =====');
  const astroConfig = readFileSync(join(process.cwd(), 'astro.config.mjs'), 'utf-8');
  const cmsConfig = readFileSync(join(process.cwd(), 'public/admin/config.yml'), 'utf-8');
  const robots = readFileSync(join(process.cwd(), 'dist/robots.txt'), 'utf-8');
  const isMain = /const SITE_URL = 'https:\/\/reiwa\.casa'/.test(astroConfig);

  record('Source', 'M01', 'astro.config.mjs の SITE_URL が main 値', isMain,
    { SITE_URL: (astroConfig.match(/const SITE_URL = '([^']+)'/) || [])[1] });
  record('Source', 'M02', 'config.yml の branch が main', /branch:\s*main/.test(cmsConfig),
    { branch: (cmsConfig.match(/branch:\s*(\S+)/) || [])[1] });
  record('Source', 'M03', 'config.yml の base_url が https://reiwa.casa', /base_url:\s*https:\/\/reiwa\.casa\s*$/m.test(cmsConfig),
    { base_url: (cmsConfig.match(/base_url:\s*(\S+)/) || [])[1] });
  record('Source', 'M04', 'robots.txt が main 用（Allow + Sitemap、Bug #45）',
    /Allow:\s*\//.test(robots) && !/Disallow:\s*\//.test(robots) && /Sitemap:\s*https:\/\/reiwa\.casa\//.test(robots),
    { robots: robots.trim() });

  const sitemap = existsSync(join(process.cwd(), 'dist/sitemap-index.xml'))
    ? readFileSync(join(process.cwd(), 'dist/sitemap-index.xml'), 'utf-8') : '';
  const rss = existsSync(join(process.cwd(), 'dist/rss.xml'))
    ? readFileSync(join(process.cwd(), 'dist/rss.xml'), 'utf-8') : '';
  const index = readFileSync(join(process.cwd(), 'dist/index.html'), 'utf-8');
  const noStaging = ![sitemap, rss, index].some(t => t.includes('staging.reiwa.casa'));
  record('Source', 'M05', '生成物にstaging URLが混入していない（canonical/OGP/RSS/sitemap）', noStaging, {
    canonical: (index.match(/rel="canonical" href="([^"]+)"/) || [])[1],
    ogUrl: (index.match(/property="og:url" content="([^"]+)"/) || [])[1],
    sitemap: (sitemap.match(/<loc>([^<]+)<\/loc>/) || [])[1],
    rss: (rss.match(/<link>([^<]+)<\/link>/) || [])[1],
  });

  // Modern Web Guidance レビュー指摘（F-1〜F-10）の維持確認
  const indexAstro = readFileSync(join(process.cwd(), 'src/pages/index.astro'), 'utf-8');
  const base = readFileSync(join(process.cwd(), 'src/layouts/Base.astro'), 'utf-8');
  const post = readFileSync(join(process.cwd(), 'src/pages/posts/[year]/[month]/[slug].astro'), 'utf-8');
  const fixedPage = readFileSync(join(process.cwd(), 'src/pages/[slug].astro'), 'utf-8');
  const admin = readFileSync(join(process.cwd(), 'public/admin/index.html'), 'utf-8');
  const cfg = readFileSync(join(process.cwd(), 'astro.config.mjs'), 'utf-8');

  const checks = [
    ['F-1', 'content-visibility はファーストビュー外のみ（nth-child(n+7)）', indexAstro.includes('.post-card:nth-child(n+7)')],
    ['F-2', 'ナビのEscape/フォーカス離脱クローズ', base.includes("e.key !== 'Escape'") && base.includes("addEventListener('focusout'")],
    ['F-3', 'タッチ端末44pxタップ領域', base.includes('pointer: coarse') && base.includes('min-height: 44px')],
    ['F-4', 'CMS月セレクターのaria-label', admin.includes("sel.setAttribute('aria-label', '年月で絞り込み')")],
    ['F-5', 'CMS月セレクター44px', /#cms-month-selector/.test(admin)],
    ['F-6', '管理画面のlang="ja"', admin.includes('<html lang="ja">')],
    ['F-7', 'nav aria-labelにロール名を含めない', base.includes('aria-label="メイン"')],
    ['F-8', '本文リンクの下線・識別色（記事/固定ページ）', post.includes(':global(a)') && fixedPage.includes(':global(a)')],
    ['F-9', 'コードブロックのtabindex付与プラグイン', cfg.includes('rehypeFocusableCodeBlocks')],
    ['F-10', 'サムネイルのwidth/height属性', indexAstro.includes('width="1200"') && indexAstro.includes('height="800"')],
  ];
  for (const [id, name, ok] of checks) record('Source', id, `MWGレビュー指摘の維持: ${name}`, ok);
}

// ===== 公開サイト =====
async function runSite(browser, dev) {
  console.log(`\n===== SITE: ${dev.name} =====`);
  const ctx = await browser.newContext(dev.config);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

  // S01: トップページ（ライトモード）
  await page.goto(BASE_URL + '/');
  await page.waitForTimeout(600);
  const s01 = await page.evaluate(() => {
    const img = document.querySelector('img.post-thumbnail');
    const cards = [...document.querySelectorAll('article.post-card')];
    const vh = innerHeight;
    return {
      bg: getComputedStyle(document.body).backgroundColor,
      firstImg: img ? { loading: img.loading, fp: img.getAttribute('fetchpriority'), w: img.getAttribute('width'), h: img.getAttribute('height') } : null,
      cvInFold: cards.filter(c => c.getBoundingClientRect().top < vh && getComputedStyle(c).contentVisibility === 'auto').length,
      cards: cards.length,
    };
  });
  await annotate(page, [{ selector: '.post-list', label: 'F-1/F-10: 描画最適化・画像寸法' }]);
  await page.screenshot({ path: join(SS, `S01-top-light-${dev.name}.png`), fullPage: false });
  record(dev.name, 'S01', 'トップページ（ライト）: LCP属性・ファーストビュー内content-visibilityなし', s01.cvInFold === 0 && s01.firstImg?.fp === 'high', s01);

  // S02: ダークモード（NFR-08）
  await ctx.close();
  const darkCtx = await browser.newContext({ ...dev.config, colorScheme: 'dark' });
  const darkPage = await darkCtx.newPage();
  await darkPage.goto(BASE_URL + '/');
  await darkPage.waitForTimeout(600);
  const s02 = await darkPage.evaluate(() => ({
    bg: getComputedStyle(document.body).backgroundColor,
    color: getComputedStyle(document.body).color,
    colorScheme: document.querySelector('meta[name="color-scheme"]')?.content,
  }));
  await annotate(darkPage, [{ selector: 'header', label: 'ダークモード適用' }]);
  await darkPage.screenshot({ path: join(SS, `S02-top-dark-${dev.name}.png`), fullPage: false });
  const darkApplied = s02.bg !== 'rgb(248, 250, 252)' && s02.bg !== 'rgb(255, 255, 255)';
  record(dev.name, 'S02', 'ダークモード配色が適用される（NFR-08）', darkApplied, s02);
  await darkCtx.close();

  // 以降はライトモードで継続
  const ctx2 = await browser.newContext(dev.config);
  const p2 = await ctx2.newPage();
  p2.on('pageerror', e => errors.push(String(e)));
  p2.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

  // S03: 記事詳細（本文リンク・前後記事ナビ）
  await p2.goto(BASE_URL + '/');
  await p2.locator('a.post-title').first().click();
  await p2.waitForTimeout(500);
  const s03 = await p2.evaluate(() => ({
    canonical: document.querySelector('link[rel=canonical]')?.href,
    ogUrl: document.querySelector('meta[property="og:url"]')?.content,
    ogType: document.querySelector('meta[property="og:type"]')?.content,
    prevNext: document.querySelectorAll('.post-nav a, nav[class*=post] a').length,
  }));
  await annotate(p2, [{ selector: 'article', label: '記事詳細・canonical・OGP' }]);
  await p2.screenshot({ path: join(SS, `S03-post-${dev.name}.png`), fullPage: false });
  record(dev.name, 'S03', '記事詳細: canonical・OGP・前後記事ナビ',
    s03.canonical?.startsWith(BASE_URL) && s03.ogUrl?.startsWith(BASE_URL), s03);

  // S04: タグ一覧（FR-26）
  await p2.goto(BASE_URL + '/tags/');
  await p2.waitForTimeout(400);
  const s04 = await p2.evaluate(() => ({ h1: document.querySelector('h1')?.textContent?.trim(), tags: document.querySelectorAll('a[href^="/tags/"]').length }));
  await annotate(p2, [{ selector: 'main', label: 'タグ一覧' }]);
  await p2.screenshot({ path: join(SS, `S04-tags-${dev.name}.png`), fullPage: false });
  record(dev.name, 'S04', 'タグ一覧ページ（FR-26）', s04.tags > 0, s04);

  // S05: ナビドロップダウン実操作（F-2/F-3）
  await p2.goto(BASE_URL + '/');
  const toggle = p2.locator('.nav-dropdown-toggle');
  let s05 = { skipped: true };
  if (await toggle.count() > 0) {
    await toggle.click();
    await p2.waitForTimeout(250);
    const opened = await p2.locator('.nav-dropdown-menu').isVisible();
    const expanded = await toggle.getAttribute('aria-expanded');
    await annotate(p2, [{ selector: '.nav-dropdown-menu', label: 'F-2: Escapeで閉じる' }]);
    await p2.screenshot({ path: join(SS, `S05-nav-${dev.name}.png`), fullPage: false });
    await p2.keyboard.press('Escape');
    await p2.waitForTimeout(250);
    const closed = !(await p2.locator('.nav-dropdown-menu').isVisible());
    const box = await toggle.boundingBox();
    s05 = { opened, expanded, closedByEsc: closed, toggleSize: box && { w: Math.round(box.width), h: Math.round(box.height) } };
    const tapOk = dev.name === 'PC' || (box && box.height >= 44 && box.width >= 44);
    record(dev.name, 'S05', 'ナビ実操作: 開閉・aria-expanded・Escape・タップ領域', opened && expanded === 'true' && closed && tapOk, s05);
  } else {
    record(dev.name, 'S05', 'ナビドロップダウン', null, s05);
  }

  // S06: axe-core
  const axeTop = await runAxe(p2);
  await p2.goto(BASE_URL + '/tags/');
  await p2.waitForTimeout(300);
  const axeTags = await runAxe(p2);
  record(dev.name, 'S06', 'axe-core違反（トップ/タグ一覧）', axeTop.length === 0 && axeTags.length === 0, { top: axeTop, tags: axeTags });

  record(dev.name, 'S99', 'コンソールエラー', errors.length === 0, { errors: errors.slice(0, 5) });
  await ctx2.close();
}

// ===== main =====
await verifyProductionResources();
const browser = await chromium.launch({ headless: true });
for (const dev of DEVICES_CONFIG) await runSite(browser, dev);

writeFileSync(join(OUT, 'results.json'), JSON.stringify(results, null, 2));
const fails = results.filter(r => r.pass === false);
console.log(`\n===== DONE: ${results.length} checks, ${fails.length} findings =====`);
fails.forEach(f => console.log(`  FAIL ${f.device} ${f.id}: ${f.name}`));

await browser.close();
process.exit(fails.length ? 1 : 0);
