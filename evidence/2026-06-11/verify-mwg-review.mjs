/**
 * Modern Web Guidance 遵守確認 + ユーザ目線操作性レビュー（2026-06-11）
 * レビュー専用: ソース変更なし。dist/admin/config.yml の base_url のみローカルに書換済み。
 */
import { chromium, devices } from 'playwright';
import { mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { extname } from 'path';

const PORT = 4180;
const BASE_URL = `http://localhost:${PORT}`;
const OUT = '/tmp/mwg-review';
const SS = join(OUT, 'screenshots');
mkdirSync(SS, { recursive: true });
const EXEC = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const AXE_SOURCE = readFileSync(join(process.cwd(), 'node_modules/axe-core/axe.min.js'), 'utf-8');

const DEVICES_CONFIG = [
  { name: 'PC',     config: { viewport: { width: 1280, height: 800 } } },
  { name: 'iPad',   config: devices['iPad Pro 11'] },
  { name: 'iPhone', config: devices['iPhone 14'] },
];

const ARTICLES = [
  { path: '2026/02/ramen.md',   sha: 'a1', title: 'ラーメン日記',    date: '2026-02-24', draft: false, tags: ['グルメ'] },
  { path: '2026/02/astro.md',   sha: 'a2', title: 'Astroの始め方', date: '2026-02-20', draft: true,  tags: ['技術'] },
  { path: '2026/01/newyear.md', sha: 'a3', title: '新年のご挨拶',   date: '2026-01-15', draft: false, tags: ['雑記'] },
  { path: '2025/12/yearend.md', sha: 'a4', title: '年末のまとめ',   date: '2025-12-31', draft: false, tags: ['雑記'] },
];
const PAGES = [
  { path: 'about.md',   sha: 'p1', title: 'このサイトについて', slug: 'about',   order: 1, draft: false },
  { path: 'profile.md', sha: 'p2', title: 'プロフィール',       slug: 'profile', order: 2, draft: false },
];
const makeArticleContent = a => `---\ntitle: ${a.title}\ndate: ${a.date}\ndraft: ${a.draft}\ntags: [${a.tags.map(t => `"${t}"`).join(', ')}]\n---\n${a.title}の本文テキスト。`;
const makePageContent = p => `---\ntitle: ${p.title}\nslug: ${p.slug}\norder: ${p.order}\ndraft: ${p.draft}\n---\n${p.title}の本文テキスト。`;

const results = [];
function record(device, id, name, pass, detail = {}) {
  console.log(`  [${pass === true ? 'PASS' : pass === false ? 'FAIL' : 'INFO'}] ${device} ${id}: ${name} ${JSON.stringify(detail).substring(0, 300)}`);
  results.push({ device, id, name, pass, detail });
}

function startServer(distDir) {
  const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.yml': 'text/yaml', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
  return new Promise(resolve => {
    const server = createServer(async (req, res) => {
      let urlPath = decodeURIComponent(req.url.split('?')[0]);
      if (urlPath === '/admin' || urlPath === '/admin/') urlPath = '/admin/index.html';
      let filePath = join(distDir, urlPath === '/' ? 'index.html' : urlPath);
      if (filePath.endsWith('/')) filePath += 'index.html';
      for (const tryPath of [filePath, filePath + '.html', join(filePath, 'index.html')]) {
        try {
          const data = await readFile(tryPath);
          res.writeHead(200, { 'Content-Type': MIME[extname(tryPath)] || 'application/octet-stream' });
          res.end(data);
          return;
        } catch {}
      }
      res.writeHead(404); res.end('Not Found');
    });
    server.listen(PORT, () => resolve(server));
  });
}

const DECAP_JS = readFileSync(join(process.cwd(), 'node_modules/decap-cms/dist/decap-cms.js'), 'utf-8');

async function setupMocks(context) {
  // サンドボックスではunpkgに到達できないため、同一バイトのローカルバンドルを供給（integrity一致）
  await context.route('https://unpkg.com/decap-cms@3.10.0/dist/decap-cms.js', route => {
    route.fulfill({ status: 200, contentType: 'application/javascript', body: DECAP_JS });
  });
  await context.route(url => url.pathname === '/auth', route => {
    route.fulfill({ status: 200, contentType: 'text/html', body: `<!DOCTYPE html><html><body><script>
(function(){ if(!window.opener)return; var o=window.opener.location.origin;
window.opener.postMessage('authorizing:github',o);
window.addEventListener('message',function(){
window.opener.postMessage('authorization:github:success:'+JSON.stringify({token:'mock-token',provider:'github'}),o);
setTimeout(function(){window.close();},500);},{once:true});})();
</script></body></html>` });
  });
  // catch-all は最初に登録（Playwrightは後登録のルートが優先されるため）
  await context.route(url => url.hostname === 'api.github.com', route => {
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });
  await context.route(url => url.hostname === 'api.github.com' && url.pathname === '/user', route => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ login: 'testuser', id: 1, name: 'Test User', avatar_url: '' }) });
  });
  await context.route(url => url.hostname === 'api.github.com' && url.pathname === '/repos/bickojima/my-blog', route => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 1, name: 'my-blog', full_name: 'bickojima/my-blog', private: false, owner: { login: 'bickojima', id: 1 }, default_branch: 'staging', permissions: { admin: true, push: true, pull: true } }) });
  });
  await context.route('**/repos/bickojima/my-blog/branches/**', route => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ name: 'staging', commit: { sha: 'abc123' } }) });
  });
  await context.route('**/repos/bickojima/my-blog/commits**', route => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ sha: 'c1', commit: { message: 'test', author: { date: '2026-02-24T00:00:00Z' } } }]) });
  });
  await context.route('**/repos/bickojima/my-blog/git/**', route => {
    const url = route.request().url();
    const method = route.request().method();
    const all = [...ARTICLES, ...PAGES];
    if (url.includes('/trees')) {
      let treeEntries;
      if (url.includes('content/posts')) treeEntries = ARTICLES.map(f => ({ path: f.path, mode: '100644', type: 'blob', sha: f.sha }));
      else if (url.includes('content/pages')) treeEntries = PAGES.map(f => ({ path: f.path, mode: '100644', type: 'blob', sha: f.sha }));
      else treeEntries = all.map(f => ({ path: f.path, mode: '100644', type: 'blob', sha: f.sha }));
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ sha: 'tree1', truncated: false, tree: treeEntries }) });
    } else if (url.includes('/blobs') && method === 'GET') {
      const match = all.find(f => url.includes(f.sha));
      const content = match ? (match.slug !== undefined ? makePageContent(match) : makeArticleContent(match)) : makeArticleContent(ARTICLES[0]);
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ sha: match?.sha || 'x', content: Buffer.from(content).toString('base64'), encoding: 'base64' }) });
    } else if (url.includes('/refs')) {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ref: 'refs/heads/staging', object: { sha: 'abc123', type: 'commit' } }) });
    } else if (method === 'POST') {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ sha: 'new123' }) });
    } else {
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    }
  });
  await context.route('**/repos/bickojima/my-blog/contents/**', route => {
    const method = route.request().method();
    if (method === 'GET') {
      const url = route.request().url();
      const all = [...ARTICLES, ...PAGES];
      const match = all.find(f => url.includes(encodeURIComponent(f.path)) || url.includes(f.path));
      const content = match ? (match.slug !== undefined ? makePageContent(match) : makeArticleContent(match)) : makeArticleContent(ARTICLES[0]);
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ name: 'file.md', sha: match?.sha || 'x', content: Buffer.from(content).toString('base64'), encoding: 'base64' }) });
    } else {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ content: { sha: 'new456' } }) });
    }
  });
  await context.route('**/repos/bickojima/my-blog/pulls**', route => {
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });
}

async function runAxe(page, scope) {
  await page.evaluate(AXE_SOURCE);
  return page.evaluate(async (sel) => {
    const opts = { resultTypes: ['violations'] };
    const res = sel ? await axe.run(document.querySelector(sel) || document, opts) : await axe.run(opts);
    return res.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.slice(0, 5).map(n => n.target.join(' ')) }));
  }, scope || null);
}

// ============ サイトレビュー ============
async function runSite(browser, dev) {
  const context = await browser.newContext(dev.config);
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('pageerror', e => consoleErrors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });

  // S01: トップページ表示 + Modern Web Guidance適用状況
  await page.goto(BASE_URL + '/');
  await page.waitForTimeout(800);
  const s01 = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll('img.post-thumbnail')];
    const first = imgs[0];
    const cards = [...document.querySelectorAll('article.post-card')];
    const vh = window.innerHeight;
    const cardInfo = cards.map((c, i) => {
      const r = c.getBoundingClientRect();
      return { i, top: Math.round(r.top), cv: getComputedStyle(c).contentVisibility || 'n/a', aboveFold: r.top < vh };
    });
    const layout = cards.length ? getComputedStyle(cards.find(c => c.querySelector('.post-thumbnail')) || cards[0]).display : '';
    return {
      firstImg: first ? { loading: first.loading, fetchpriority: first.getAttribute('fetchpriority'), hasWH: !!(first.getAttribute('width') && first.getAttribute('height')) } : null,
      secondImgLoading: imgs[1] ? imgs[1].loading : null,
      cardInfo, layout, vh,
      containerType: getComputedStyle(document.querySelector('.post-list')).containerType || 'n/a',
    };
  });
  await page.screenshot({ path: join(SS, `S01-top-${dev.name}.png`) });
  record(dev.name, 'S01', 'トップページ: LCP画像属性・content-visibility・コンテナクエリ', true, s01);

  // S01b: content-visibility がファーストビュー内カードに当たっていないか（ガイダンスのMANDATORY確認）
  const violCards = s01.cardInfo.filter(c => c.i > 0 && c.aboveFold && c.cv === 'auto');
  record(dev.name, 'S01b', 'content-visibility:auto はファーストビュー外のみか（ガイド要件）', violCards.length === 0, { violatingCards: violCards });

  // S02: キーボード操作（Tab巡回・focus-visible・content-visibility領域への到達）
  await page.keyboard.press('Tab');
  const focusSeq = [];
  for (let i = 0; i < 35; i++) {
    const f = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const st = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { tag: el.tagName, cls: el.className?.toString().substring(0, 40), text: (el.textContent || '').trim().substring(0, 25), outline: st.outlineStyle !== 'none' ? `${st.outlineWidth} ${st.outlineColor}` : 'none', docTop: Math.round(r.top + window.scrollY) };
    });
    if (f) focusSeq.push(f);
    await page.keyboard.press('Tab');
  }
  const reachedBelowFold = focusSeq.some(f => f.docTop > s01.vh);
  const focusVisibleStyled = focusSeq.filter(f => f.outline !== 'none').length;
  record(dev.name, 'S02', 'キーボードTab巡回・focus-visible・折返し下到達', reachedBelowFold, { steps: focusSeq.length, reachedBelowFold, focusVisibleStyled, sample: focusSeq.slice(0, 8) });

  // S03: ナビドロップダウン（マウス/キーボード/Escape）
  await page.goto(BASE_URL + '/');
  const toggle = page.locator('.nav-dropdown-toggle');
  if (await toggle.count() > 0) {
    await toggle.click();
    await page.waitForTimeout(300);
    const opened = await page.locator('.nav-dropdown-menu').isVisible();
    const ariaExpanded = await toggle.getAttribute('aria-expanded');
    await page.screenshot({ path: join(SS, `S03-dropdown-open-${dev.name}.png`) });
    // Escapeで閉じるか（ガイダンス: メニューはEsc/フォーカス移動で閉じられるべき）
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const closedByEsc = !(await page.locator('.nav-dropdown-menu').isVisible());
    record(dev.name, 'S03', 'ドロップダウン開閉とaria-expanded同期', opened && ariaExpanded === 'true', { opened, ariaExpanded });
    record(dev.name, 'S03b', 'Escapeキーでドロップダウンが閉じる', closedByEsc, { closedByEsc });
    // フォーカスがメニュー外へ出たとき閉じるか
    if (!closedByEsc) { await page.locator('body').click({ position: { x: 5, y: 400 } }); await page.waitForTimeout(200); }
    await toggle.click();
    await page.waitForTimeout(200);
    for (let i = 0; i < 8; i++) await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    const staysOpenAfterTabAway = await page.locator('.nav-dropdown-menu').isVisible();
    record(dev.name, 'S03c', 'フォーカスがメニューを離れた後も開いたままか（開いたまま=操作性課題）', !staysOpenAfterTabAway, { staysOpenAfterTabAway });
    await page.keyboard.press('Escape');
    await page.locator('body').click({ position: { x: 5, y: 400 } }).catch(() => {});
  }

  // S04: 記事詳細ページ（本文リンクの判別可能性・preのキーボード到達性・テキスト折返し）
  await page.goto(BASE_URL + '/');
  const firstPost = page.locator('a.post-title').first();
  await firstPost.click();
  await page.waitForTimeout(600);
  const s04 = await page.evaluate(() => {
    const content = document.querySelector('.post-content');
    const a = content?.querySelector('a');
    const p = content?.querySelector('p');
    const pre = content?.querySelector('pre');
    const aStyle = a ? getComputedStyle(a) : null;
    const pStyle = p ? getComputedStyle(p) : null;
    return {
      url: location.pathname,
      h1Wrap: getComputedStyle(document.querySelector('h1')).textWrap || getComputedStyle(document.querySelector('h1')).textWrapStyle,
      bodyLink: a ? { color: aStyle.color, deco: aStyle.textDecorationLine, pColor: pStyle?.color } : 'no-link-in-content',
      pre: pre ? { tabindex: pre.getAttribute('tabindex'), scrollable: pre.scrollWidth > pre.clientWidth } : 'no-pre',
    };
  });
  await page.screenshot({ path: join(SS, `S04-post-${dev.name}.png`) });
  const linkIndistinct = s04.bodyLink !== 'no-link-in-content' && s04.bodyLink.deco === 'none' && s04.bodyLink.color === s04.bodyLink.pColor;
  record(dev.name, 'S04', '記事詳細: 本文リンクが視覚的に判別可能か', !linkIndistinct, s04);

  // S05: axe-core スキャン（トップ + 記事）
  const axePost = await runAxe(page);
  await page.goto(BASE_URL + '/');
  await page.waitForTimeout(500);
  const axeTop = await runAxe(page);
  record(dev.name, 'S05', 'axe-core違反（トップ/記事）', axeTop.length === 0 && axePost.length === 0, { top: axeTop, post: axePost });

  // S06: タップターゲットサイズ（モバイルのみ）: タグ・ナビ・管理リンク
  if (dev.name !== 'PC') {
    const s06 = await page.evaluate(() => {
      const targets = [];
      document.querySelectorAll('.tag, .nav-dropdown-toggle, .nav-links a, .admin-link').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.width > 0) targets.push({ sel: el.className.toString().substring(0, 25), w: Math.round(r.width), h: Math.round(r.height) });
      });
      return targets;
    });
    const small = s06.filter(t => t.h < 24);
    record(dev.name, 'S06', 'タップターゲット最小サイズ（24px=WCAG2.2 AA / 44px=AAA）', small.length === 0, { small, all: s06 });
  }

  record(dev.name, 'S99', 'コンソールエラー（サイト）', consoleErrors.length === 0, { consoleErrors: consoleErrors.slice(0, 5) });
  await context.close();
}

// ============ CMSレビュー ============
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
      const loggingIn = await page.locator('text="ログインしています..."').count().catch(() => 0);
      const loginVisible = await loginButton.isVisible().catch(() => false);
      if (!loggingIn && !loginVisible) break;
    }
  }
  await page.waitForTimeout(5000);
  for (let i = 0; i < 15; i++) {
    if (await page.locator('[class*="ListCard"] a, [class*="ListCardLink"]').count() > 0) break;
    await page.waitForTimeout(1000);
  }
  await page.waitForTimeout(5000);
  for (let i = 0; i < 10; i++) {
    if (await page.locator('[class*="GroupHeading"]').count() >= 2) break;
    await page.waitForTimeout(1000);
  }
  await page.waitForTimeout(2000);
}

async function runCms(browser, dev) {
  const context = await browser.newContext(dev.config);
  await setupMocks(context);
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('pageerror', e => consoleErrors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });

  await openCmsWithAuth(page);
  await page.screenshot({ path: join(SS, `C01-list-${dev.name}.png`) });

  // C01: 記事一覧（グルーピング自動有効化・見出し日本語化・月セレクター）
  const c01 = await page.evaluate(() => {
    const headings = [...document.querySelectorAll('[class*="GroupHeading"]')].map(h => h.textContent.trim());
    const sel = document.getElementById('cms-month-selector');
    let selInfo = null;
    if (sel) {
      const r = sel.getBoundingClientRect();
      selInfo = {
        options: [...sel.options].map(o => o.textContent),
        h: Math.round(r.height), w: Math.round(r.width),
        hasLabel: !!(sel.labels && sel.labels.length) || !!sel.getAttribute('aria-label') || !!sel.getAttribute('aria-labelledby') || !!sel.title,
      };
    }
    return { headings, selInfo, entries: document.querySelectorAll('[class*="ListCard"]').length };
  });
  record(dev.name, 'C01', 'CMS一覧: 年月グルーピング自動有効化・日本語見出し', c01.headings.length >= 2 && /年\d{1,2}月/.test(c01.headings[0] || ''), c01);
  record(dev.name, 'C01b', '月セレクターにアクセシブルネーム（label/aria-label）があるか', !!c01.selInfo?.hasLabel, { selInfo: c01.selInfo });
  if (c01.headings.length >= 2) {
    const keys = c01.headings.map(t => { const m = t.match(/(\d{4})年(\d{1,2})月/); return m ? m[1] + m[2].padStart(2, '0') : t; });
    record(dev.name, 'C01c', 'グループ順が新しい年月から（日付降順ソートと一致）', keys[0] >= keys[1], { keys });
  }

  // C02: 月セレクター操作（実ユーザー操作）
  const sel = page.locator('#cms-month-selector');
  if (await sel.count() > 0 && await sel.isVisible()) {
    const options = await sel.locator('option').allTextContents();
    const target = options.find(o => o !== 'すべての年月');
    if (target) {
      await sel.selectOption({ label: target });
      await page.waitForTimeout(800);
      const visibleHeadings = await page.evaluate(() => [...document.querySelectorAll('[class*="GroupHeading"]')].filter(h => h.parentElement && h.parentElement.style.display !== 'none').map(h => h.textContent.trim()));
      await page.screenshot({ path: join(SS, `C02-filtered-${dev.name}.png`) });
      record(dev.name, 'C02', `月セレクター絞り込み（${target}選択）`, visibleHeadings.length === 1 && visibleHeadings[0] === target, { visibleHeadings, target });
      await sel.selectOption({ index: 0 });
      await page.waitForTimeout(500);
    }
  } else {
    record(dev.name, 'C02', '月セレクターが表示されている', false, { found: await sel.count() });
  }

  // C03: タップターゲット44px（モバイル/タブレットのみ、WCAG 2.5.5対応確認）
  if (dev.name !== 'PC') {
    const c03 = await page.evaluate(() => {
      const out = [];
      const sels = ['[class*="CollectionTopNewButton"]', '[role="button"][aria-haspopup]', '#cms-month-selector', '[class*="AppHeader"] button, [class*="AppHeader"] a'];
      for (const s of sels) {
        document.querySelectorAll(s).forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && r.height > 0) out.push({ sel: s.substring(0, 40), text: (el.textContent || '').trim().substring(0, 15), w: Math.round(r.width), h: Math.round(r.height) });
        });
      }
      return out;
    });
    const small = c03.filter(t => t.h < 44 || t.w < 44);
    record(dev.name, 'C03', 'CMS一覧画面の操作要素44px確保（WCAG 2.5.5）', small.length === 0, { small, all: c03 });
  }

  // C04: エディタ画面（記事を開く）
  const entry = page.locator('[class*="ListCard"] a, [class*="ListCardLink"]').first();
  if (await entry.count() > 0) {
    await entry.click();
    await page.waitForTimeout(4000);
    await page.screenshot({ path: join(SS, `C04-editor-${dev.name}.png`) });
    const c04 = await page.evaluate(() => {
      const urlBar = document.getElementById('cms-public-url');
      const toolbar = [...document.querySelectorAll('[class*="ToolbarButton"]')].slice(0, 12).map(b => { const r = b.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; });
      return { hash: location.hash, hasTitleInput: !!document.querySelector('input'), urlBar: urlBar ? urlBar.textContent.substring(0, 60) : null, toolbar };
    });
    const smallToolbar = dev.name !== 'PC' ? c04.toolbar.filter(t => t.h < 44 || t.w < 44) : [];
    record(dev.name, 'C04', 'エディタ画面表示・公開URLバー', !!c04.hasTitleInput, c04);
    if (dev.name !== 'PC') record(dev.name, 'C04b', 'エディタツールバー44px確保', smallToolbar.length === 0, { smallToolbar });
  }

  // C05: axe-core スキャン（CMS一覧の独自UI周辺のみ）
  await page.goto(BASE_URL + '/admin/#/collections/posts');
  await page.waitForTimeout(4000);
  const axeCms = await runAxe(page).catch(e => [{ id: 'axe-error', help: String(e) }]);
  record(dev.name, 'C05', 'axe-core違反（CMS一覧画面・参考値）', null, { count: axeCms.length, violations: axeCms.slice(0, 10) });

  record(dev.name, 'C99', 'コンソールエラー（CMS）', consoleErrors.filter(e => !e.includes('favicon')).length === 0, { consoleErrors: consoleErrors.slice(0, 8) });
  await context.close();
}

// ============ main ============
const server = await startServer(join(process.cwd(), 'dist'));
const browser = await chromium.launch({ executablePath: EXEC, headless: true });

for (const dev of DEVICES_CONFIG) {
  console.log(`\n===== SITE: ${dev.name} =====`);
  await runSite(browser, dev);
}
for (const dev of DEVICES_CONFIG.filter(d => d.name !== 'iPad')) {
  console.log(`\n===== CMS: ${dev.name} =====`);
  await runCms(browser, dev);
}

writeFileSync(join(OUT, 'results.json'), JSON.stringify(results, null, 2));
const fails = results.filter(r => r.pass === false);
console.log(`\n===== DONE: ${results.length} checks, ${fails.length} findings =====`);
fails.forEach(f => console.log(`  ✗ ${f.device} ${f.id}: ${f.name}`));

await browser.close();
server.close();
process.exit(0);
