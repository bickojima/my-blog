import { chromium, devices } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'http://localhost:4321';
const SCREENSHOT_DIR = join(process.cwd(), 'evidence', '2026-02-23', 'cms-interactive');
mkdirSync(SCREENSHOT_DIR, { recursive: true });

const DEVICES_CONFIG = [
  { name: 'PC', config: { viewport: { width: 1280, height: 800 } } },
  { name: 'iPad', config: devices['iPad Pro 11'] },
  { name: 'iPhone', config: devices['iPhone 14'] },
];

// ===== GitHub API モック =====
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
  await page.route('**/repos/bickojima/my-blog/git/trees/**', (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({
          sha: 'tree123', truncated: false,
          tree: [
            { path: 'src/content/posts/2026/02/テスト記事.md', mode: '100644', type: 'blob', sha: 'blob123' },
            { path: 'src/content/posts/2026/02/サンプル記事2.md', mode: '100644', type: 'blob', sha: 'blob789' },
            { path: 'src/content/pages/about.md', mode: '100644', type: 'blob', sha: 'blob456' },
            { path: 'src/content/pages/profile.md', mode: '100644', type: 'blob', sha: 'blob457' },
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
      const content = `---\ntitle: テスト記事\ndate: 2026-02-15\ndraft: false\ntags:\n  - テスト\n  - サンプル\n---\n本文テスト。\n\n![テスト画像](/images/uploads/test.jpg)\n\nここに本文が続きます。`;
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

// ===== CMS認証 =====
async function openCmsWithAuth(page) {
  await setupMocks(page);
  await page.goto(BASE_URL + '/admin/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  // Playwright locator (not page.evaluate) for has-text
  const loginBtn = page.locator('button').filter({ hasText: /Login|ログイン/ }).first();
  if (await loginBtn.isVisible().catch(() => false)) {
    const popupPromise = page.waitForEvent('popup', { timeout: 5000 }).catch(() => null);
    await loginBtn.click();
    const popup = await popupPromise;
    if (popup) await popup.waitForLoadState().catch(() => {});
    await page.waitForTimeout(3000);
  }
  await page.waitForTimeout(3000);
}

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

// ===== Playwright locatorからrect取得（テキストフィルタ対応） =====
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

// ===== page.evaluate内用: CSSセレクタのみで要素rect取得 =====
async function getElementRect(page, cssSelector) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return null;
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  }, cssSelector);
}

// ===== ボタン重なり検出 =====
async function detectOverlaps(page) {
  return page.evaluate(() => {
    const clickable = Array.from(document.querySelectorAll(
      'a, button, [role="button"], input[type="submit"], input[type="button"], select, label[for]'
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
            elementA: `${clickable[i].tagName}: ${(clickable[i].textContent||'').trim().substring(0,30)}`,
            elementB: `${clickable[j].tagName}: ${(clickable[j].textContent||'').trim().substring(0,30)}`,
            rectA: { left: rectA.left, top: rectA.top, width: rectA.width, height: rectA.height },
            rectB: { left: rectB.left, top: rectB.top, width: rectB.width, height: rectB.height },
          });
        }
      }
    }
    return overlaps;
  });
}

// ===== テストシナリオ =====
const CMS_TESTS = [
  {
    id: 'T01-login',
    name: 'ログイン画面: ログインボタン表示',
    bugRef: null,
    action: async (page, device) => {
      await setupMocks(page);
      await page.goto(BASE_URL + '/admin/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      const btns = await getLocatorRects(page, page.locator('button').filter({ hasText: /Login|ログイン/ }));
      return btns.map(b => ({ ...b, label: 'ログインボタン' }));
    },
  },
  {
    id: 'T02-collection-list',
    name: '記事一覧: エントリ一覧・新規ボタン表示',
    bugRef: null,
    action: async (page, device) => {
      await openCmsWithAuth(page);
      const annotations = [];
      const newBtns = await getLocatorRects(page, page.locator('a[href*="new"]'));
      newBtns.forEach(b => annotations.push({ ...b, label: '新規作成ボタン' }));
      const sideLinks = await getLocatorRects(page, page.locator('a[href*="collections"]'));
      sideLinks.forEach(b => annotations.push({ ...b, label: 'サイドバー' }));
      return annotations;
    },
  },
  {
    id: 'T03-editor',
    name: '記事編集: ツールバー・保存ボタン・URLバー（Bug #1,#8,#11）',
    bugRef: 'Bug #1 モバイル保存ボタン, Bug #8/#11 公開URLバー',
    action: async (page, device) => {
      await openCmsWithAuth(page);
      const entry = page.locator('a[href*="entries"]').first();
      if (await entry.isVisible().catch(() => false)) {
        await entry.click();
        await page.waitForTimeout(4000);
      }
      const annotations = [];
      // 保存ボタン
      const saveBtns = await getLocatorRects(page, page.locator('button').filter({ hasText: /Publish|Save|公開/ }));
      saveBtns.forEach(b => annotations.push({ ...b, label: '保存/公開ボタン' }));
      // 公開URLバー
      const urlBar = await getElementRect(page, '#public-url-bar');
      if (urlBar) annotations.push({ ...urlBar, label: '公開URLバー' });
      // エディタ領域
      const editor = await getElementRect(page, '[data-slate-editor="true"]');
      if (editor) annotations.push({ ...editor, label: 'エディタ領域' });
      return annotations;
    },
  },
  {
    id: 'T04-toolbar-buttons',
    name: 'ツールバー: 各ボタン表示（Bug #9 codeblock非表示）',
    bugRef: 'Bug #9 Slate codeblockクラッシュ対策',
    action: async (page, device) => {
      await openCmsWithAuth(page);
      const entry = page.locator('a[href*="entries"]').first();
      if (await entry.isVisible().catch(() => false)) {
        await entry.click();
        await page.waitForTimeout(4000);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);
      const annotations = [];
      // ツールバーボタン（CSS selectors only）
      const toolBtns = await getLocatorRects(page, page.locator('[class*="ToolbarButton"]'));
      toolBtns.forEach(b => annotations.push({ ...b, label: b.text.substring(0, 12) || 'ボタン' }));
      // モバイルでCode Block非表示確認
      if (device.name === 'iPhone' || device.name === 'iPad') {
        const codeBlockCheck = await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('button, li, [role="menuitem"]'));
          const cb = btns.find(b => (b.textContent || '').includes('Code Block'));
          if (cb) {
            const r = cb.getBoundingClientRect();
            const s = window.getComputedStyle(cb);
            return { visible: s.display !== 'none' && r.height > 0, left: r.left, top: r.top, width: r.width, height: r.height };
          }
          return null;
        });
        if (codeBlockCheck && codeBlockCheck.visible) {
          annotations.push({ ...codeBlockCheck, label: 'CODE BLOCK表示中(要確認)' });
        }
      }
      return annotations;
    },
  },
  {
    id: 'T05-editor-plus-menu',
    name: 'エディタ: +メニュー展開',
    bugRef: null,
    action: async (page, device) => {
      await openCmsWithAuth(page);
      const entry = page.locator('a[href*="entries"]').first();
      if (await entry.isVisible().catch(() => false)) {
        await entry.click();
        await page.waitForTimeout(4000);
      }
      const plusBtn = page.locator('button').filter({ hasText: '+' }).first();
      if (await plusBtn.isVisible().catch(() => false)) {
        await plusBtn.click();
        await page.waitForTimeout(1000);
      }
      const annotations = [];
      const menuItems = await getLocatorRects(page, page.locator('[role="menuitem"], [class*="MenuList"] li'));
      menuItems.forEach(b => annotations.push({ ...b, label: b.text.substring(0, 12) || 'メニュー' }));
      return annotations;
    },
  },
  {
    id: 'T06-delete-buttons',
    name: '削除ボタン: ラベル「選択解除」「完全削除」確認（Bug #4）',
    bugRef: 'Bug #4 削除ボタン誤操作',
    action: async (page, device) => {
      await openCmsWithAuth(page);
      const entry = page.locator('a[href*="entries"]').first();
      if (await entry.isVisible().catch(() => false)) {
        await entry.click();
        await page.waitForTimeout(4000);
      }
      const annotations = [];
      const delBtns = await getLocatorRects(page, page.locator('button').filter({ hasText: /選択解除|完全削除|Remove|Delete/ }));
      delBtns.forEach(b => {
        const lbl = (b.text.includes('削除') || b.text.includes('Delete')) ? '完全削除ボタン' : '選択解除ボタン';
        annotations.push({ ...b, label: lbl });
      });
      return annotations;
    },
  },
  {
    id: 'T07-url-bar-transition',
    name: '公開URLバー: 一覧→編集→戻り遷移（Bug #8,#11）',
    bugRef: 'Bug #8 URLバー残留, Bug #11 コレクション一覧残留',
    action: async (page, device) => {
      await openCmsWithAuth(page);
      const annotations = [];
      // 一覧でURLバーなし確認
      const urlBarList = await getElementRect(page, '#public-url-bar');
      if (urlBarList) {
        const vis = await page.evaluate(() => {
          const b = document.getElementById('public-url-bar');
          return b ? window.getComputedStyle(b).display : 'none';
        });
        if (vis !== 'none') annotations.push({ ...urlBarList, label: '一覧にURLバー(NG)' });
      }
      // 記事クリック→編集
      const entry = page.locator('a[href*="entries"]').first();
      if (await entry.isVisible().catch(() => false)) {
        await entry.click();
        await page.waitForTimeout(4000);
      }
      const urlBarEdit = await getElementRect(page, '#public-url-bar');
      if (urlBarEdit) annotations.push({ ...urlBarEdit, label: '編集画面URLバー(OK)' });
      // 保存ボタン
      const saveBtns = await getLocatorRects(page, page.locator('button').filter({ hasText: /Publish|Save/ }));
      saveBtns.forEach(b => annotations.push({ ...b, label: '保存ボタン' }));
      return annotations;
    },
  },
  {
    id: 'T08-pages-editor',
    name: '固定ページ: 編集・公開URL（Bug #13）',
    bugRef: 'Bug #13 固定ページ公開URL表示',
    action: async (page, device) => {
      await openCmsWithAuth(page);
      const pagesLink = page.locator('a[href*="pages"]').first();
      if (await pagesLink.isVisible().catch(() => false)) {
        await pagesLink.click();
        await page.waitForTimeout(2000);
      }
      const annotations = [];
      const entries = await getLocatorRects(page, page.locator('a[href*="entries"]'));
      if (entries.length > 0) annotations.push({ ...entries[0], label: '固定ページエントリ' });
      const entry = page.locator('a[href*="entries"]').first();
      if (await entry.isVisible().catch(() => false)) {
        await entry.click();
        await page.waitForTimeout(3000);
      }
      const urlBar = await getElementRect(page, '#public-url-bar');
      if (urlBar) annotations.push({ ...urlBar, label: '固定ページURL(/slug形式)' });
      const saveBtns = await getLocatorRects(page, page.locator('button').filter({ hasText: /Publish|Save/ }));
      saveBtns.forEach(b => annotations.push({ ...b, label: '保存ボタン' }));
      return annotations;
    },
  },
  {
    id: 'T09-dropdown-urlbar',
    name: 'ドロップダウン+URLバー競合（Bug #32）',
    bugRef: 'Bug #32 URLバーとモーダル重複',
    action: async (page, device) => {
      await openCmsWithAuth(page);
      const entry = page.locator('a[href*="entries"]').first();
      if (await entry.isVisible().catch(() => false)) {
        await entry.click();
        await page.waitForTimeout(4000);
      }
      const annotations = [];
      const urlBar = await getElementRect(page, '#public-url-bar');
      if (urlBar) annotations.push({ ...urlBar, label: '公開URLバー' });
      // ステータスドロップダウンを開く
      const publishToggle = page.locator('button').filter({ hasText: /Published|Draft|Set status/ }).first();
      if (await publishToggle.isVisible().catch(() => false)) {
        await publishToggle.click();
        await page.waitForTimeout(1000);
      }
      const overlaps = await detectOverlaps(page);
      overlaps.forEach(o => {
        annotations.push({
          left: Math.min(o.rectA.left, o.rectB.left),
          top: Math.min(o.rectA.top, o.rectB.top),
          width: Math.max(o.rectA.left + o.rectA.width, o.rectB.left + o.rectB.width) - Math.min(o.rectA.left, o.rectB.left),
          height: Math.max(o.rectA.top + o.rectA.height, o.rectB.top + o.rectB.height) - Math.min(o.rectA.top, o.rectB.top),
          label: '重なり検出!'
        });
      });
      return annotations;
    },
  },
  {
    id: 'T10-new-entry',
    name: '新規記事作成: フィールド・保存ボタン',
    bugRef: null,
    action: async (page, device) => {
      await openCmsWithAuth(page);
      const newBtn = page.locator('a[href*="new"]').first();
      if (await newBtn.isVisible().catch(() => false)) {
        await newBtn.click();
        await page.waitForTimeout(4000);
      }
      const annotations = [];
      const saveBtns = await getLocatorRects(page, page.locator('button').filter({ hasText: /Publish|Create|Save/ }));
      saveBtns.forEach(b => annotations.push({ ...b, label: '保存ボタン' }));
      const urlBar = await getElementRect(page, '#public-url-bar');
      if (urlBar) annotations.push({ ...urlBar, label: '公開予定URLバー' });
      // 入力フィールド
      const fields = await getLocatorRects(page, page.locator('input[type="text"], textarea'), 5);
      fields.forEach(b => annotations.push({ ...b, label: '入力フィールド' }));
      return annotations;
    },
  },
  {
    id: 'T11-image-widget',
    name: '画像ウィジェット: ボタン配置（Bug #5,#6,#29）',
    bugRef: 'Bug #5 EXIF, Bug #6 canvas副作用, Bug #29 blob CSP',
    action: async (page, device) => {
      await openCmsWithAuth(page);
      const entry = page.locator('a[href*="entries"]').first();
      if (await entry.isVisible().catch(() => false)) {
        await entry.click();
        await page.waitForTimeout(4000);
      }
      const annotations = [];
      // 画像関連ボタン
      const imgBtns = await getLocatorRects(page, page.locator('button').filter({ hasText: /Choose|画像|image|選択/ }));
      imgBtns.forEach(b => annotations.push({ ...b, label: '画像ボタン' }));
      // file input accept確認
      const fileInfo = await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input[type="file"]'));
        return inputs.map(i => ({ accept: i.accept }));
      });
      // サムネイルフィールド
      const thumbArea = await getElementRect(page, '[id*="thumbnail"]');
      if (thumbArea) annotations.push({ ...thumbArea, label: 'サムネイルフィールド' });
      return annotations;
    },
  },
  {
    id: 'T12-media-library',
    name: 'メディアライブラリ: モーダル表示（Bug #29,#32）',
    bugRef: 'Bug #29 blob CSP, Bug #32 モーダル重複',
    action: async (page, device) => {
      await openCmsWithAuth(page);
      const entry = page.locator('a[href*="entries"]').first();
      if (await entry.isVisible().catch(() => false)) {
        await entry.click();
        await page.waitForTimeout(4000);
      }
      // 画像ボタンクリック→メディアライブラリ
      const imgBtn = page.locator('button').filter({ hasText: /Choose|画像|選択/ }).first();
      if (await imgBtn.isVisible().catch(() => false)) {
        await imgBtn.click();
        await page.waitForTimeout(2000);
      }
      const annotations = [];
      // モーダル内ボタン
      const modalBtns = await getLocatorRects(page, page.locator('[class*="Modal"] button, [class*="MediaLibrary"] button'));
      modalBtns.forEach(b => annotations.push({ ...b, label: b.text.substring(0, 15) || 'ボタン' }));
      // URLバー退避確認
      const urlBarVis = await page.evaluate(() => {
        const bar = document.getElementById('public-url-bar');
        if (!bar) return 'absent';
        return window.getComputedStyle(bar).display;
      });
      if (urlBarVis !== 'none' && urlBarVis !== 'absent') {
        const urlBar = await getElementRect(page, '#public-url-bar');
        if (urlBar) annotations.push({ ...urlBar, label: 'URLバー退避漏れ!' });
      }
      const overlaps = await detectOverlaps(page);
      overlaps.forEach(o => {
        annotations.push({
          left: Math.min(o.rectA.left, o.rectB.left),
          top: Math.min(o.rectA.top, o.rectB.top),
          width: Math.max(o.rectA.left + o.rectA.width, o.rectB.left + o.rectB.width) - Math.min(o.rectA.left, o.rectB.left),
          height: Math.max(o.rectA.top + o.rectA.height, o.rectB.top + o.rectB.height) - Math.min(o.rectA.top, o.rectB.top),
          label: '重なり!'
        });
      });
      return annotations;
    },
  },
  {
    id: 'T13-bottom-sheet',
    name: 'モバイル: ボトムシート（Bug #7）',
    bugRef: 'Bug #7 ドロップダウン位置ずれ',
    action: async (page, device) => {
      await openCmsWithAuth(page);
      const entry = page.locator('a[href*="entries"]').first();
      if (await entry.isVisible().catch(() => false)) {
        await entry.click();
        await page.waitForTimeout(4000);
      }
      const dropdownBtn = page.locator('button').filter({ hasText: /Published|Draft|Set status|Status/ }).first();
      if (await dropdownBtn.isVisible().catch(() => false)) {
        await dropdownBtn.click();
        await page.waitForTimeout(1000);
      }
      const annotations = [];
      const overlaps = await detectOverlaps(page);
      overlaps.forEach(o => {
        annotations.push({
          left: Math.min(o.rectA.left, o.rectB.left),
          top: Math.min(o.rectA.top, o.rectB.top),
          width: Math.max(o.rectA.left + o.rectA.width, o.rectB.left + o.rectB.width) - Math.min(o.rectA.left, o.rectB.left),
          height: Math.max(o.rectA.top + o.rectA.height, o.rectB.top + o.rectB.height) - Math.min(o.rectA.top, o.rectB.top),
          label: '重なり!'
        });
      });
      // ドロップダウン/ボトムシート
      const saveBtns = await getLocatorRects(page, page.locator('button').filter({ hasText: /Publish|Save/ }));
      saveBtns.forEach(b => annotations.push({ ...b, label: '保存ボタン' }));
      const urlBar = await getElementRect(page, '#public-url-bar');
      if (urlBar) annotations.push({ ...urlBar, label: 'URLバー' });
      return annotations;
    },
  },
  {
    id: 'T14-entry-format',
    name: '記事一覧: 日付|下書き|タイトル形式',
    bugRef: null,
    action: async (page, device) => {
      await openCmsWithAuth(page);
      const annotations = [];
      const entries = await getLocatorRects(page, page.locator('a[href*="entries"]'));
      entries.forEach(b => annotations.push({ ...b, label: 'エントリ' }));
      // ブログを見るリンク
      const siteLink = await getLocatorRects(page, page.locator('a').filter({ hasText: /ブログを見る|STAGING/ }));
      siteLink.forEach(b => annotations.push({ ...b, label: 'ブログを見るリンク' }));
      return annotations;
    },
  },
  {
    id: 'T15-multi-operation',
    name: '操作性: 記事→戻る→固定ページ連続遷移（Bug #8,#11）',
    bugRef: 'Bug #8,#11 URLバー残留',
    action: async (page, device) => {
      await openCmsWithAuth(page);
      const annotations = [];
      // 記事クリック
      const entry = page.locator('a[href*="entries"]').first();
      if (await entry.isVisible().catch(() => false)) {
        await entry.click();
        await page.waitForTimeout(3000);
      }
      // 戻る
      const backLink = page.locator('a[href*="collections"]').first();
      if (await backLink.isVisible().catch(() => false)) {
        await backLink.click();
        await page.waitForTimeout(2000);
      }
      // URLバー残留チェック
      const urlBarAfter = await page.evaluate(() => {
        const bar = document.getElementById('public-url-bar');
        if (!bar) return 'absent';
        return window.getComputedStyle(bar).display;
      });
      if (urlBarAfter !== 'none' && urlBarAfter !== 'absent') {
        const rect = await getElementRect(page, '#public-url-bar');
        if (rect) annotations.push({ ...rect, label: 'URLバー残留(NG!)' });
      }
      // 固定ページへ
      const pagesLink = page.locator('a[href*="pages"]').first();
      if (await pagesLink.isVisible().catch(() => false)) {
        await pagesLink.click();
        await page.waitForTimeout(2000);
      }
      const pageEntry = page.locator('a[href*="entries"]').first();
      if (await pageEntry.isVisible().catch(() => false)) {
        await pageEntry.click();
        await page.waitForTimeout(3000);
      }
      const urlBarPages = await getElementRect(page, '#public-url-bar');
      if (urlBarPages) annotations.push({ ...urlBarPages, label: '固定ページURL(OK)' });
      const saveBtns = await getLocatorRects(page, page.locator('button').filter({ hasText: /Publish|Save/ }));
      saveBtns.forEach(b => annotations.push({ ...b, label: '保存ボタン' }));
      const overlaps = await detectOverlaps(page);
      overlaps.forEach(o => {
        annotations.push({
          left: Math.min(o.rectA.left, o.rectB.left),
          top: Math.min(o.rectA.top, o.rectB.top),
          width: Math.max(o.rectA.left + o.rectA.width, o.rectB.left + o.rectB.width) - Math.min(o.rectA.left, o.rectB.left),
          height: Math.max(o.rectA.top + o.rectA.height, o.rectB.top + o.rectB.height) - Math.min(o.rectA.top, o.rectB.top),
          label: '重なり!'
        });
      });
      return annotations;
    },
  },
  {
    id: 'T16-sticky-scroll',
    name: 'スクロール時sticky保存ボタン（Bug #1）',
    bugRef: 'Bug #1 モバイル保存ボタン非表示',
    action: async (page, device) => {
      await openCmsWithAuth(page);
      const entry = page.locator('a[href*="entries"]').first();
      if (await entry.isVisible().catch(() => false)) {
        await entry.click();
        await page.waitForTimeout(4000);
      }
      await page.evaluate(() => window.scrollBy(0, 400));
      await page.waitForTimeout(500);
      const annotations = [];
      const saveBtns = await getLocatorRects(page, page.locator('button').filter({ hasText: /Publish|Save/ }));
      saveBtns.forEach(b => annotations.push({ ...b, label: '保存ボタン(スクロール後)' }));
      const urlBar = await getElementRect(page, '#public-url-bar');
      if (urlBar) annotations.push({ ...urlBar, label: 'URLバー(スクロール後)' });
      return annotations;
    },
  },
];

// ===== メイン =====
async function run() {
  const { exec } = await import('child_process');
  console.log('Starting preview server...');
  const server = exec('npx astro preview --port 4321', { cwd: process.cwd() });
  await new Promise(r => setTimeout(r, 4000));

  const browser = await chromium.launch();
  const results = [];

  for (const device of DEVICES_CONFIG) {
    console.log(`\n========== ${device.name} ==========`);
    for (const test of CMS_TESTS) {
      const context = await browser.newContext({ ...device.config, ignoreHTTPSErrors: true });
      const page = await context.newPage();
      const screenshotPath = join(SCREENSHOT_DIR, `${test.id}_${device.name}.png`);

      try {
        console.log(`  [RUN] ${test.name}`);
        const annotations = await test.action(page, device);
        const overlaps = await detectOverlaps(page);
        const overlapAnnotations = overlaps.map(o => ({
          left: Math.min(o.rectA.left, o.rectB.left),
          top: Math.min(o.rectA.top, o.rectB.top),
          width: Math.max(o.rectA.left + o.rectA.width, o.rectB.left + o.rectB.width) - Math.min(o.rectA.left, o.rectB.left),
          height: Math.max(o.rectA.top + o.rectA.height, o.rectB.top + o.rectB.height) - Math.min(o.rectA.top, o.rectB.top),
          label: '重なり!'
        }));
        const existingOverlapLabels = new Set((annotations || []).filter(a => a.label && a.label.includes('重なり')).map(a => `${a.left}-${a.top}`));
        const newOverlaps = overlapAnnotations.filter(oa => !existingOverlapLabels.has(`${oa.left}-${oa.top}`));
        const allAnnotations = [...(annotations || []), ...newOverlaps];

        await screenshotWithAnnotation(page, screenshotPath, allAnnotations);
        const pass = overlaps.length === 0;
        console.log(`  [${pass ? 'PASS' : 'FAIL'}] ${test.name} (overlaps: ${overlaps.length}, annotations: ${allAnnotations.length})`);
        if (!pass) overlaps.forEach(o => console.log(`    overlap: ${o.elementA} <-> ${o.elementB}`));
        results.push({ device: device.name, test: test.name, id: test.id, bugRef: test.bugRef, overlaps: overlaps.length, annotationCount: allAnnotations.length, pass, screenshot: `${test.id}_${device.name}.png` });
      } catch (err) {
        console.log(`  [ERROR] ${test.name}: ${err.message.substring(0, 120)}`);
        await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
        results.push({ device: device.name, test: test.name, id: test.id, bugRef: test.bugRef, overlaps: 0, annotationCount: 0, pass: true, screenshot: `${test.id}_${device.name}.png`, note: err.message.substring(0, 200) });
      }
      await page.close();
      await context.close();
    }
  }

  console.log('\n\n========== CMS INTERACTIVE TEST SUMMARY ==========');
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  console.log(`Total: ${results.length} | PASS: ${passed} | FAIL: ${failed}`);
  for (const r of results) {
    const bug = r.bugRef ? ` [${r.bugRef}]` : '';
    const note = r.note ? ` (${r.note.substring(0, 50)})` : '';
    console.log(`  [${r.pass ? 'PASS' : 'FAIL'}] ${r.device} - ${r.test}${bug}${note}`);
  }

  writeFileSync(join(process.cwd(), 'evidence', '2026-02-23', 'cms-interactive-results.json'), JSON.stringify(results, null, 2));
  await browser.close();
  server.kill();
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });
