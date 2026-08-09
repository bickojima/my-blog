/**
 * CMS-19 年月グルーピングUI改善 エビデンス取得スクリプト
 *
 * 検証項目:
 *   1. デフォルトで年月グルーピング有効・降順表示
 *   2. グルーピングボタン非表示 + 月セレクター表示
 *   3. グループ見出し日本語表記（"2026年2月"形式）
 *   4. ソート昇順切替時にグループも昇順になる
 *   5. ソート降順復帰時にグループも降順に戻る
 *
 * デバイス: PC (1280x800) / iPad Pro 11 (834x1194) / iPhone 14 (390x844)
 * 認証方式: context.route() + 3ステップOAuthハンドシェイク
 *
 * 使用方法:
 *   1. npm run build
 *   2. node evidence/2026-02-27/verify-cms19-grouping.mjs
 */
import { chromium, devices } from 'playwright';
import { mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { extname } from 'path';

const PORT = 4173;
const BASE_URL = `http://localhost:${PORT}`;
const EVIDENCE_DIR = join(process.cwd(), 'evidence', '2026-02-27');
const SCREENSHOT_DIR = join(EVIDENCE_DIR, 'screenshots');
mkdirSync(SCREENSHOT_DIR, { recursive: true });

const DEVICES_CONFIG = [
  { name: 'PC', config: { viewport: { width: 1280, height: 800 } } },
  { name: 'iPad', config: devices['iPad Pro 11'] },
  { name: 'iPhone', config: devices['iPhone 14'] },
];

const ARTICLES = [
  { path: '2026/02/ramen.md', sha: 'a1', title: 'ラーメン日記', date: '2026-02-24', draft: false },
  { path: '2026/02/astro.md', sha: 'a2', title: 'Astroの始め方', date: '2026-02-20', draft: false },
  { path: '2026/01/newyear.md', sha: 'a3', title: '新年のご挨拶', date: '2026-01-15', draft: true },
  { path: '2025/12/yearend.md', sha: 'a4', title: '年末のまとめ', date: '2025-12-01', draft: false },
];

function makeContent(a) {
  return `---\ntitle: ${a.title}\ndate: ${a.date}\ndraft: ${a.draft}\ntags: []\n---\n${a.title}の本文`;
}

const results = [];

// === 簡易静的ファイルサーバー ===
function startServer(distDir) {
  const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.yml': 'text/yaml', '.yaml': 'text/yaml', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      let filePath = join(distDir, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
      if (filePath.endsWith('/')) filePath += 'index.html';
      try {
        const data = await readFile(filePath);
        const ext = extname(filePath);
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        res.end(data);
      } catch {
        res.writeHead(404);
        res.end('Not Found');
      }
    });
    server.listen(PORT, () => { resolve(server); });
  });
}

// === GitHub API + OAuth モック設定 ===
async function setupMocks(context) {
  // GitHub API: catch-all (LIFO: registered first, checked last)
  await context.route(url => url.hostname === 'api.github.com', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });
  await context.route(url => url.hostname === 'api.github.com' && url.pathname === '/user', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ login: 'testuser', id: 1, name: 'Test User', avatar_url: '' }) });
  });
  await context.route(url => url.hostname === 'api.github.com' && url.pathname === '/repos/bickojima/my-blog', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 1, name: 'my-blog', full_name: 'bickojima/my-blog', private: false, owner: { login: 'bickojima', id: 1 }, default_branch: 'staging', permissions: { admin: true, push: true, pull: true } }) });
  });
  await context.route('**/repos/bickojima/my-blog/branches/**', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ name: 'staging', commit: { sha: 'abc123' } }) });
  });
  await context.route('**/repos/bickojima/my-blog/commits**', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ sha: 'c1', commit: { message: 'test', author: { date: '2026-02-24T00:00:00Z' } } }]) });
  });
  await context.route('**/repos/bickojima/my-blog/git/**', (route) => {
    const url = route.request().url();
    if (url.includes('/trees')) {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ sha: 'tree1', truncated: false, tree: ARTICLES.map(a => ({ path: a.path, mode: '100644', type: 'blob', sha: a.sha })) }) });
    } else if (url.includes('/blobs')) {
      const match = ARTICLES.find(a => url.includes(a.sha));
      const content = match ? makeContent(match) : makeContent(ARTICLES[0]);
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ sha: match?.sha || 'x', content: Buffer.from(content).toString('base64'), encoding: 'base64' }) });
    } else if (url.includes('/refs')) {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ref: 'refs/heads/staging', object: { sha: 'abc123', type: 'commit' } }) });
    } else {
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    }
  });

  // OAuth popup intercept
  await context.route(url => url.pathname === '/auth', (route) => {
    route.fulfill({
      status: 200, contentType: 'text/html',
      body: `<!DOCTYPE html><html><body><script>
(function() {
  if (!window.opener) return;
  var origin = window.opener.location.origin;
  window.opener.postMessage('authorizing:github', origin);
  window.addEventListener('message', function() {
    var msg = 'authorization:github:success:' + JSON.stringify({token:'mock-token',provider:'github'});
    window.opener.postMessage(msg, origin);
    setTimeout(function() { window.close(); }, 500);
  }, { once: true });
})();
</script></body></html>`,
    });
  });
}

async function openCmsWithAuth(page) {
  await page.goto(BASE_URL + '/admin/');
  await page.waitForTimeout(3000);

  const loginButton = page.locator('button:has-text("GitHub でログインする")');
  if (await loginButton.isVisible().catch(() => false)) {
    const popupPromise = page.waitForEvent('popup').catch(() => null);
    await loginButton.click();
    const popup = await popupPromise;
    if (popup) {
      await popup.waitForLoadState('domcontentloaded').catch(() => {});
      await popup.waitForTimeout(2000).catch(() => {});
      await popup.close().catch(() => {});
    }
    for (let i = 0; i < 20; i++) {
      await page.waitForTimeout(1000);
      const isLoggingIn = await page.locator('text="ログインしています..."').count().catch(() => 0);
      const loginBtn = await loginButton.isVisible().catch(() => false);
      if (!isLoggingIn && !loginBtn) break;
    }
  }
  await page.waitForTimeout(5000);

  // エントリが読み込まれるまで待機
  for (let i = 0; i < 15; i++) {
    const entryCount = await page.locator('[class*="ListCard"] a, [class*="ListCardLink"]').count().catch(() => 0);
    if (entryCount > 0) {
      console.log(`  [ENTRIES] ${entryCount} entries loaded (${i+1}s)`);
      break;
    }
    await page.waitForTimeout(1000);
  }

  // activateDefaultGrouping()がMutationObserverで動作するので追加待機
  await page.waitForTimeout(5000);

  // GroupHeading が現れるまで待機
  for (let i = 0; i < 10; i++) {
    const ghCount = await page.locator('[class*="GroupHeading"]').count().catch(() => 0);
    if (ghCount >= 2) {
      console.log(`  [GROUP] ${ghCount} group headings found (${i+1}s)`);
      break;
    }
    await page.waitForTimeout(1000);
  }

  await page.waitForTimeout(2000);
}

// === 赤枠アノテーション ===
async function addRedBorder(page, selector, label) {
  await page.evaluate(({ selector, label }) => {
    const el = typeof selector === 'string' ? document.querySelector(selector) : null;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const overlay = document.createElement('div');
    overlay.style.cssText = `position:fixed;top:${rect.top-3}px;left:${rect.left-3}px;width:${rect.width+6}px;height:${rect.height+6}px;border:3px solid red;border-radius:4px;z-index:99999;pointer-events:none;`;
    if (label) {
      const lbl = document.createElement('div');
      lbl.style.cssText = 'position:absolute;top:-22px;left:0;background:red;color:white;font-size:12px;padding:2px 6px;border-radius:2px;white-space:nowrap;';
      lbl.textContent = label;
      overlay.appendChild(lbl);
    }
    document.body.appendChild(overlay);
  }, { selector, label });
}

async function addRedBorderByEval(page, evalFn, label) {
  await page.evaluate(({ evalFnStr, label }) => {
    const fn = new Function('return ' + evalFnStr)();
    const el = fn(document);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const overlay = document.createElement('div');
    overlay.style.cssText = `position:fixed;top:${rect.top-3}px;left:${rect.left-3}px;width:${rect.width+6}px;height:${rect.height+6}px;border:3px solid red;border-radius:4px;z-index:99999;pointer-events:none;`;
    if (label) {
      const lbl = document.createElement('div');
      lbl.style.cssText = 'position:absolute;top:-22px;left:0;background:red;color:white;font-size:12px;padding:2px 6px;border-radius:2px;white-space:nowrap;';
      lbl.textContent = label;
      overlay.appendChild(lbl);
    }
    document.body.appendChild(overlay);
  }, { evalFnStr: evalFn.toString(), label });
}

async function clearOverlays(page) {
  await page.evaluate(() => {
    document.querySelectorAll('[style*="border:3px solid red"], [style*="border: 3px solid red"]').forEach(e => e.remove());
  });
}

// === テストシナリオ ===
async function runScenarios(page, deviceName) {
  // S1: デフォルト表示（日付降順、年月グルーピング有効）
  {
    const id = 'cms19-default';
    console.log(`  [${id}] デフォルト表示確認...`);
    const state = await page.evaluate(() => {
      const h = document.querySelectorAll('[class*="GroupHeading"]');
      const headings = Array.from(h).map(e => e.textContent.trim());
      const dates = Array.from(document.querySelectorAll('.entry-date')).map(e => e.textContent.trim());
      const monthSelector = document.getElementById('cms-month-selector');
      const groupTriggers = document.querySelectorAll('[role="button"][aria-haspopup="true"]');
      let groupBtnHidden = true;
      for (const t of groupTriggers) {
        if ((t.textContent || '').trim().indexOf('グルーピング') !== -1) {
          const w = t.parentElement;
          groupBtnHidden = w ? w.style.display === 'none' : false;
        }
      }
      return { headings, dates, monthSelectorVisible: !!monthSelector && monthSelector.style.display !== 'none', groupBtnHidden };
    });

    const isDescGroups = state.headings.length >= 2 && state.headings[0].includes('2026') && state.headings[state.headings.length - 1].includes('2025');
    const isJapaneseFormat = state.headings.every(h => /\d{4}年\d{1,2}月/.test(h));
    const pass = state.headings.length >= 2 && isDescGroups && isJapaneseFormat && state.groupBtnHidden;

    // Annotate
    await addRedBorder(page, '#cms-month-selector', '月セレクター');
    await addRedBorderByEval(page, (doc) => doc.querySelector('[class*="GroupHeading"]'), 'グループ見出し（日本語・降順）');

    const ssPath = join(SCREENSHOT_DIR, `cms19-${id}-${deviceName}.png`);
    await page.screenshot({ path: ssPath, fullPage: false });
    await clearOverlays(page);

    console.log(`    Headings: ${state.headings.join(' > ')}`);
    console.log(`    GroupBtnHidden: ${state.groupBtnHidden}, MonthSelector: ${state.monthSelectorVisible}`);
    console.log(`    Result: ${pass ? 'PASS' : 'FAIL'}`);
    results.push({ device: deviceName, id, name: 'デフォルト表示（降順・グルーピング有効・月セレクター）', ...state, isDescGroups, isJapaneseFormat, pass, screenshot: `screenshots/cms19-${id}-${deviceName}.png` });
  }

  // S2: ソート昇順切替
  {
    const id = 'cms19-sort-asc';
    console.log(`  [${id}] ソート昇順切替...`);

    const sortTrigger = page.locator('[role="button"][aria-haspopup="true"]').filter({ hasText: 'ソート' });
    if (await sortTrigger.isVisible().catch(() => false)) {
      // Toggle sort twice (first click confirms current, second toggles)
      await sortTrigger.click();
      await page.waitForTimeout(300);
      const dateItem = page.locator('[role="menuitem"]').filter({ hasText: '日付' });
      if (await dateItem.isVisible().catch(() => false)) await dateItem.click();
      await page.waitForTimeout(2000);

      await sortTrigger.click();
      await page.waitForTimeout(300);
      const dateItem2 = page.locator('[role="menuitem"]').filter({ hasText: '日付' });
      if (await dateItem2.isVisible().catch(() => false)) await dateItem2.click();
      await page.waitForTimeout(3000);
    }

    const state = await page.evaluate(() => {
      const h = document.querySelectorAll('[class*="GroupHeading"]');
      const headings = Array.from(h).map(e => e.textContent.trim());
      const dates = Array.from(document.querySelectorAll('.entry-date')).map(e => e.textContent.trim());
      return { headings, dates };
    });

    const isAscGroups = state.headings.length >= 2 && state.headings[0].includes('2025') && state.headings[state.headings.length - 1].includes('2026');
    const pass = state.headings.length >= 2 && isAscGroups;

    // Annotate
    await addRedBorderByEval(page, (doc) => doc.querySelector('[class*="GroupHeading"]'), 'グループ昇順（古い月が先頭）');

    // Open sort dropdown to show ascending indicator
    const sortTrigger2 = page.locator('[role="button"][aria-haspopup="true"]').filter({ hasText: 'ソート' });
    if (await sortTrigger2.isVisible().catch(() => false)) {
      await sortTrigger2.click();
      await page.waitForTimeout(300);
    }

    const ssPath = join(SCREENSHOT_DIR, `cms19-${id}-${deviceName}.png`);
    await page.screenshot({ path: ssPath, fullPage: false });
    await clearOverlays(page);

    // Close dropdown by pressing Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    console.log(`    Headings: ${state.headings.join(' > ')}`);
    console.log(`    Result: ${pass ? 'PASS' : 'FAIL'}`);
    results.push({ device: deviceName, id, name: 'ソート昇順切替→グループ昇順', ...state, isAscGroups, pass, screenshot: `screenshots/cms19-${id}-${deviceName}.png` });
  }

  // S3: ソート降順復帰
  {
    const id = 'cms19-sort-desc-restore';
    console.log(`  [${id}] ソート降順復帰...`);

    const sortTrigger = page.locator('[role="button"][aria-haspopup="true"]').filter({ hasText: 'ソート' });
    if (await sortTrigger.isVisible().catch(() => false)) {
      await sortTrigger.click();
      await page.waitForTimeout(300);
      const dateItem = page.locator('[role="menuitem"]').filter({ hasText: '日付' });
      if (await dateItem.isVisible().catch(() => false)) await dateItem.click();
      await page.waitForTimeout(3000);
    }

    const state = await page.evaluate(() => {
      const h = document.querySelectorAll('[class*="GroupHeading"]');
      const headings = Array.from(h).map(e => e.textContent.trim());
      const dates = Array.from(document.querySelectorAll('.entry-date')).map(e => e.textContent.trim());
      return { headings, dates };
    });

    const isDescGroups = state.headings.length >= 2 && state.headings[0].includes('2026') && state.headings[state.headings.length - 1].includes('2025');
    const pass = state.headings.length >= 2 && isDescGroups;

    await addRedBorderByEval(page, (doc) => doc.querySelector('[class*="GroupHeading"]'), 'グループ降順に復帰');

    const ssPath = join(SCREENSHOT_DIR, `cms19-${id}-${deviceName}.png`);
    await page.screenshot({ path: ssPath, fullPage: false });
    await clearOverlays(page);

    console.log(`    Headings: ${state.headings.join(' > ')}`);
    console.log(`    Result: ${pass ? 'PASS' : 'FAIL'}`);
    results.push({ device: deviceName, id, name: 'ソート降順復帰→グループ降順', ...state, isDescGroups, pass, screenshot: `screenshots/cms19-${id}-${deviceName}.png` });
  }
}

// === レポート生成 ===
function generateReport() {
  const deviceNames = ['PC', 'iPad', 'iPhone'];
  const checkIds = [...new Set(results.map(r => r.id))];

  let rows = '';
  for (const checkId of checkIds) {
    const checkResults = results.filter(r => r.id === checkId);
    const name = checkResults[0]?.name || checkId;
    let cells = `<td>${name}</td>`;
    for (const dn of deviceNames) {
      const r = checkResults.find(cr => cr.device === dn);
      if (r) {
        const statusClass = r.pass ? 'pass' : 'fail';
        const statusText = r.pass ? 'PASS ✓' : 'FAIL ✗';
        let detail = '';
        if (r.headings) detail += `見出し: ${r.headings.join(' → ')}<br>`;
        if (r.groupBtnHidden !== undefined) detail += `グルーピングボタン非表示: ${r.groupBtnHidden ? '✓' : '✗'}<br>`;
        if (r.monthSelectorVisible !== undefined) detail += `月セレクター: ${r.monthSelectorVisible ? '✓' : '✗'}<br>`;
        if (r.isJapaneseFormat !== undefined) detail += `日本語表記: ${r.isJapaneseFormat ? '✓' : '✗'}<br>`;
        cells += `<td class="${statusClass}"><img src="${r.screenshot}" width="300"><br><strong>${statusText}</strong><br><small>${detail}</small></td>`;
      } else {
        cells += '<td>-</td>';
      }
    }
    rows += `<tr>${cells}</tr>`;
  }

  const passCount = results.filter(r => r.pass).length;
  const totalCount = results.length;

  const html = `<!DOCTYPE html>
<html lang="ja"><head><meta charset="UTF-8"><title>CMS-19 エビデンスレポート (2026-02-27)</title>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 20px; color: #333; }
h1 { font-size: 1.5em; border-bottom: 2px solid #333; padding-bottom: 8px; }
h2 { font-size: 1.2em; margin-top: 24px; }
.summary { background: ${passCount === totalCount ? '#e8f5e9' : '#ffebee'}; padding: 12px 16px; border-radius: 6px; margin: 12px 0; font-weight: bold; }
table { border-collapse: collapse; width: 100%; margin: 16px 0; }
th, td { border: 1px solid #ccc; padding: 8px; text-align: center; vertical-align: top; }
th { background: #f5f5f5; }
img { border: 1px solid #ddd; border-radius: 4px; max-width: 300px; }
.pass { background: #e8f5e9; }
.fail { background: #ffebee; }
small { display: block; text-align: left; max-width: 300px; font-size: 0.8em; color: #555; margin-top: 4px; }
</style></head><body>
<h1>CMS-19 年月グルーピングUI改善 エビデンスレポート</h1>
<p>日付: 2026-02-27 | 要件: CMS-19（年月グルーピングUI改善）</p>
<div class="summary">${passCount}/${totalCount} PASS</div>

<h2>検証項目</h2>
<ul>
  <li><strong>デフォルト表示</strong>: 年月グルーピング自動有効、降順（最新月が先頭）、グルーピングボタン非表示、月セレクター表示、見出し日本語表記</li>
  <li><strong>ソート昇順切替</strong>: 日付昇順ソート時にグループ見出しも昇順（古い月が先頭）になる</li>
  <li><strong>ソート降順復帰</strong>: 日付降順に戻すとグループ見出しも降順に復帰する</li>
</ul>

<h2>エビデンス</h2>
<table>
<tr><th>検証項目</th><th>PC (1280×800)</th><th>iPad Pro 11 (834×1194)</th><th>iPhone 14 (390×844)</th></tr>
${rows}
</table>

<h2>テスト環境</h2>
<ul>
  <li>Playwright + Chromium (headless)</li>
  <li>GitHub API / OAuth モック使用</li>
  <li>モック記事: 4件（2025年12月×1、2026年1月×1、2026年2月×2）</li>
</ul>
</body></html>`;

  writeFileSync(join(EVIDENCE_DIR, 'report.html'), html);
  console.log('\n[REPORT] evidence/2026-02-27/report.html 生成完了');
}

// === メイン ===
async function main() {
  // config.yml の base_url を一時的に localhost に変更
  const configPath = join(process.cwd(), 'dist', 'admin', 'config.yml');
  let configOriginal;
  try {
    configOriginal = readFileSync(configPath, 'utf-8');
    const configModified = configOriginal
      .replace(/base_url:\s*.+/, `base_url: ${BASE_URL}`)
      .replace(/branch:\s*.+/, 'branch: staging');
    writeFileSync(configPath, configModified);
    console.log('[CONFIG] dist/admin/config.yml base_url を localhost に一時変更');
  } catch (e) {
    console.error('[CONFIG] dist/admin/config.yml が見つかりません。npm run build を先に実行してください。');
    process.exit(1);
  }

  const server = await startServer(join(process.cwd(), 'dist'));
  console.log(`[SERVER] http://localhost:${PORT} 起動`);
  const browser = await chromium.launch({ headless: true });

  try {
    for (const device of DEVICES_CONFIG) {
      console.log(`\n=== ${device.name} ===`);
      const context = await browser.newContext({ ...device.config });
      await setupMocks(context);
      const page = await context.newPage();

      await openCmsWithAuth(page);

      const loginVisible = await page.locator('button:has-text("GitHub でログインする")').isVisible().catch(() => false);
      if (loginVisible) {
        console.log(`  [WARN] ${device.name}: 認証未完了`);
      } else {
        console.log(`  [OK] ${device.name}: 認証成功`);
      }

      await runScenarios(page, device.name);
      await context.close();
    }
  } finally {
    await browser.close();
    server.close();
    if (configOriginal) {
      writeFileSync(configPath, configOriginal);
      console.log('\n[CONFIG] dist/admin/config.yml を復元');
    }
  }

  writeFileSync(join(EVIDENCE_DIR, 'cms19-results.json'), JSON.stringify(results, null, 2));
  const passCount = results.filter(r => r.pass).length;
  console.log(`\n結果: ${passCount}/${results.length} PASS`);
  generateReport();
}

main().catch(console.error);
