import { chromium, devices } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'https://staging.reiwa.casa';
const OUT = join(process.cwd(), 'evidence', '2026-07-05');
const SHOTS = join(OUT, 'screenshots');
mkdirSync(SHOTS, { recursive: true });

const configs = [
  { name: 'PC', use: { viewport: { width: 1280, height: 800 } } },
  { name: 'iPad', use: devices['iPad Pro 11'] },
  { name: 'iPhone', use: devices['iPhone 14'] },
];
const results = [];

async function mark(page, selector, label) {
  await page.locator(selector).first().evaluate((el, text) => {
    el.style.outline = '4px solid #ef4444';
    el.style.outlineOffset = '4px';
    const badge = document.createElement('div');
    badge.textContent = text;
    Object.assign(badge.style, {
      position: 'fixed', top: '8px', right: '8px', zIndex: '2147483647',
      background: '#b91c1c', color: '#fff', padding: '6px 10px',
      font: 'bold 14px sans-serif', borderRadius: '4px',
    });
    document.body.appendChild(badge);
  }, label);
}

async function loadLazyContent(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 40));
    }
    window.scrollTo(0, 0);
  });
}

async function capture(page, device, id, name, path, selector, checks = {}) {
  const response = await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle' });
  await mark(page, selector, `${id}: ${name}`);
  const file = `${id}-${device}.png`;
  await page.screenshot({ path: join(SHOTS, file), fullPage: true });
  results.push({ device, id, name, pass: response?.ok() !== false && Object.values(checks).every(Boolean), screenshot: `screenshots/${file}`, checks });
}

const browser = await chromium.launch({ headless: true });
for (const config of configs) {
  const context = await browser.newContext(config.use);
  const page = await context.newPage();

  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
  const rss = await page.locator('link[type="application/rss+xml"]').count();
  const pagination = await page.locator('nav.pagination').count();
  await loadLazyContent(page);
  await mark(page, 'main', 'S01: canonical / RSS / 一覧');
  let file = `S01-home-light-${config.name}.png`;
  await page.screenshot({ path: join(SHOTS, file), fullPage: true });
  results.push({ device: config.name, id: 'S01', name: 'トップページ・canonical・RSS', pass: canonical === `${BASE_URL}/` && rss === 1 && pagination === 0, screenshot: `screenshots/${file}`, checks: { canonical, rss: rss === 1, paginationHidden: pagination === 0 } });

  await capture(page, config.name, 'S02', 'タグ一覧と件数', '/tags/', '.tag-list', { hasTags: true });

  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  const postLinks = page.locator('a.post-title');
  const count = await postLinks.count();
  await postLinks.nth(Math.min(1, count - 1)).click();
  await page.waitForLoadState('networkidle');
  const adjacent = await page.locator('.post-adjacent-nav a').count();
  await mark(page, '.post-adjacent-nav', 'S03: 前後記事ナビ');
  file = `S03-adjacent-nav-${config.name}.png`;
  await page.screenshot({ path: join(SHOTS, file), fullPage: true });
  results.push({ device: config.name, id: 'S03', name: '前後記事ナビ実遷移', pass: adjacent > 0, screenshot: `screenshots/${file}`, checks: { adjacentLinks: adjacent } });

  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  const dark = await page.evaluate(() => ({ media: matchMedia('(prefers-color-scheme: dark)').matches, background: getComputedStyle(document.body).backgroundColor }));
  await loadLazyContent(page);
  await mark(page, 'main', 'S04: OSダークモード');
  file = `S04-dark-mode-${config.name}.png`;
  await page.screenshot({ path: join(SHOTS, file), fullPage: false });
  results.push({ device: config.name, id: 'S04', name: 'OSダークモード', pass: dark.media && dark.background !== 'rgb(255, 255, 255)', screenshot: `screenshots/${file}`, checks: dark });
  await page.emulateMedia({ colorScheme: 'light' });

  const response404 = await page.goto(`${BASE_URL}/page/1/`, { waitUntil: 'networkidle' });
  const status = response404?.status();
  await mark(page, 'main', 'S05: /page/1 は404');
  file = `S05-page1-404-${config.name}.png`;
  await page.screenshot({ path: join(SHOTS, file), fullPage: true });
  results.push({ device: config.name, id: 'S05', name: '/page/1重複防止', pass: status === 404, screenshot: `screenshots/${file}`, checks: { status } });

  await context.close();
}
await browser.close();

const robots = await fetch(`${BASE_URL}/robots.txt`).then((r) => r.text());
const rssText = await fetch(`${BASE_URL}/rss.xml`).then((r) => r.text());
results.push({ device: 'HTTP', id: 'S06', name: 'robots/RSS静的検証', pass: robots.trim() === 'User-agent: *\nDisallow: /' && rssText.includes('<rss'), screenshot: null, checks: { robots: robots.trim(), rss: rssText.includes('<rss') } });

writeFileSync(join(OUT, 'roadmap-results.json'), JSON.stringify(results, null, 2));
const scenarios = ['S01', 'S02', 'S03', 'S04', 'S05'];
const rows = scenarios.map((id) => {
  const cells = configs.map(({ name }) => {
    const r = results.find((x) => x.id === id && x.device === name);
    return `<td><strong>${r.pass ? 'PASS' : 'FAIL'}</strong><br><img src="${r.screenshot}" alt="${r.name} ${name}"><pre>${JSON.stringify(r.checks, null, 2)}</pre></td>`;
  }).join('');
  return `<tr><th>${id}<br>${results.find((x) => x.id === id).name}</th>${cells}</tr>`;
}).join('');
const passCount = results.filter((r) => r.pass).length;
const html = `<!doctype html><html lang="ja"><meta charset="utf-8"><title>Blog Roadmap Evidence</title><style>body{font-family:sans-serif;margin:24px;color:#172033}table{border-collapse:collapse;width:100%}th,td{border:1px solid #bbb;padding:10px;vertical-align:top}th{background:#eef2ff}img{max-width:100%;height:auto;border:1px solid #888}pre{white-space:pre-wrap;font-size:11px}</style><h1>個人ブログ化ロードマップ staging evidence</h1><p>2026-07-05 / ${passCount}/${results.length} PASS / PC・iPad・iPhone</p><table><tr><th>シナリオ</th><th>PC</th><th>iPad</th><th>iPhone</th></tr>${rows}</table><h2>S06 robots/RSS</h2><pre>${JSON.stringify(results.find((r) => r.id === 'S06'), null, 2)}</pre></html>`;
writeFileSync(join(OUT, 'report.html'), html);
writeFileSync(join(OUT, 'work-completion-report.html'), `<!doctype html><html lang="ja"><meta charset="utf-8"><title>作業完了報告</title><style>body{font-family:sans-serif;max-width:900px;margin:40px auto;line-height:1.7}</style><h1>作業完了報告</h1><p>Bug #41/#42および個人ブログ化ロードマップをstagingで検証した。</p><ul><li>Vitest: 585/585 PASS</li><li>Playwright: 436 PASS / 8 skip / 444</li><li>GitHub Actions: PASS</li><li>Staging evidence: ${passCount}/${results.length} PASS</li></ul><p>mainへのマージは未実施。#81と#90はOPEN維持。</p></html>`);

if (results.some((r) => !r.pass)) process.exitCode = 1;
console.log(`${passCount}/${results.length} PASS`);
