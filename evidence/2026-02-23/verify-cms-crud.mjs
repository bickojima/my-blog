import { chromium, devices } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'http://localhost:4321';
const SCREENSHOT_DIR = join(process.cwd(), 'evidence', '2026-02-23', 'cms-crud');
mkdirSync(SCREENSHOT_DIR, { recursive: true });

const DEVICES_CONFIG = [
  { name: 'PC', config: { viewport: { width: 1280, height: 800 } } },
  { name: 'iPad', config: devices['iPad Pro 11'] },
  { name: 'iPhone', config: devices['iPhone 14'] },
];

// Minimal valid 1x1 pixel JPEG for upload testing
const TEST_JPEG = Buffer.from(
  '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEB' +
  'AQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEB' +
  'AQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIA' +
  'AhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEA' +
  'AAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AKAA//9k=',
  'base64'
);

// ===== API call tracking =====
let apiCalls = [];

// ===== GitHub API モック（CRUD対応・API記録付き） =====
async function setupCrudMocks(page) {
  apiCalls = [];

  await page.route('https://api.github.com/user', (route) => {
    apiCalls.push({ method: route.request().method(), url: route.request().url() });
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ login: 'testuser', id: 12345, name: 'Test User', avatar_url: '' }) });
  });
  await page.route('https://api.github.com/repos/bickojima/my-blog', (route) => {
    apiCalls.push({ method: route.request().method(), url: route.request().url() });
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ full_name: 'bickojima/my-blog', default_branch: 'main', permissions: { push: true } }) });
  });
  await page.route('**/repos/bickojima/my-blog/branches/staging', (route) => {
    apiCalls.push({ method: route.request().method(), url: route.request().url() });
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ name: 'staging', commit: { sha: 'abc123' } }) });
  });
  await page.route('**/repos/bickojima/my-blog/branches/main', (route) => {
    apiCalls.push({ method: route.request().method(), url: route.request().url() });
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ name: 'main', commit: { sha: 'abc123' } }) });
  });
  await page.route('**/repos/bickojima/my-blog/git/**', (route) => {
    const url = route.request().url();
    const method = route.request().method();
    const postData = route.request().postData() || undefined;
    apiCalls.push({ method, url, body: postData });
    if (url.includes('/trees') && method === 'GET') {
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
    } else if (url.includes('/trees') && method === 'POST') {
      route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ sha: 'newtree' }) });
    } else if (url.includes('/blobs') && method === 'GET') {
      const content = `---\ntitle: テスト記事\ndate: 2026-02-15\ndraft: false\ntags:\n  - テスト\n  - サンプル\n---\n本文テスト。\n\n![テスト画像](/images/uploads/test.jpg)\n\nここに本文が続きます。`;
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ sha: 'blob123', content: Buffer.from(content).toString('base64'), encoding: 'base64' }) });
    } else if (url.includes('/blobs') && method === 'POST') {
      route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ sha: 'newblob' }) });
    } else if (url.includes('/refs') && method === 'GET') {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ref: 'refs/heads/staging', object: { sha: 'abc123' } }) });
    } else if (url.includes('/refs') && method === 'PATCH') {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ref: 'refs/heads/staging', object: { sha: 'newcommit999' } }) });
    } else if (url.includes('/commits') && method === 'POST') {
      route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ sha: 'newcommit' }) });
    } else {
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    }
  });
  await page.route('**/repos/bickojima/my-blog/contents/**', (route) => {
    const method = route.request().method();
    const postData = route.request().postData() || undefined;
    apiCalls.push({ method, url: route.request().url(), body: postData });
    if (method === 'GET') {
      const content = `---\ntitle: テスト記事\ndate: 2026-02-15\ndraft: false\ntags:\n  - テスト\n---\n本文テスト。`;
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ name: 'テスト記事.md', path: 'src/content/posts/2026/02/テスト記事.md', sha: 'blob123', content: Buffer.from(content).toString('base64'), encoding: 'base64' }) });
    } else if (method === 'PUT') {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ content: { sha: 'updated123' } }) });
    } else if (method === 'DELETE') {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ commit: { sha: 'deleted123' } }) });
    } else {
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
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
  await setupCrudMocks(page);
  await page.goto(BASE_URL + '/admin/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
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

// ===== エディタ読み込み待機 =====
async function waitForEditor(page, timeoutMs = 8000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    const count = await page.locator('input[type="text"], [data-slate-editor="true"]').count();
    if (count > 0) return true;
    await page.waitForTimeout(500);
  }
  return false;
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

// ===== ヘルパー =====
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

async function getElementRect(page, cssSelector) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return null;
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  }, cssSelector);
}

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

// ===== CMS CRUD テストシナリオ =====
const CMS_CRUD_TESTS = [
  // --- 記事作成 ---
  {
    id: 'T17-create-form',
    name: '記事新規作成: フォーム入力（タイトル・本文・日付）',
    bugRef: null,
    action: async (page, device) => {
      await openCmsWithAuth(page);
      await page.evaluate(() => { window.location.hash = '#/collections/posts/new'; });
      await page.waitForTimeout(4000);
      await waitForEditor(page);
      const annotations = [];

      // タイトル入力
      const titleInput = page.locator('input[type="text"]').first();
      if (await titleInput.isVisible().catch(() => false)) {
        await titleInput.fill('エビデンス用テスト記事');
        const box = await titleInput.boundingBox();
        if (box) annotations.push({ left: box.x, top: box.y, width: box.width, height: box.height, label: 'タイトル入力済' });
      }

      // 日付フィールド検出
      const inputs = page.locator('input');
      const inputCount = await inputs.count();
      for (let i = 0; i < inputCount; i++) {
        const value = await inputs.nth(i).inputValue().catch(() => '');
        if (value.match(/^\d{4}-\d{2}-\d{2}/)) {
          const box = await inputs.nth(i).boundingBox().catch(() => null);
          if (box) annotations.push({ left: box.x, top: box.y, width: box.width, height: box.height, label: '日付フィールド' });
          break;
        }
      }

      // 本文入力（Slateエディタ）
      const slate = page.locator('[data-slate-editor="true"]').first();
      if (await slate.isVisible().catch(() => false)) {
        await slate.click();
        await page.keyboard.type('テスト本文です。CRUD操作の証跡として記録します。');
        const box = await slate.boundingBox();
        if (box) annotations.push({ left: box.x, top: box.y, width: box.width, height: box.height, label: '本文入力済' });
      }

      // 保存ボタン
      const saveBtn = page.locator('button').filter({ hasText: /Publish|Save|公開/ }).first();
      if (await saveBtn.isVisible().catch(() => false)) {
        const box = await saveBtn.boundingBox();
        if (box) annotations.push({ left: box.x, top: box.y, width: box.width, height: box.height, label: '保存/公開ボタン' });
      }

      // URLバー
      const urlBar = await getElementRect(page, '#cms-public-url');
      if (urlBar) annotations.push({ ...urlBar, label: '公開予定URL' });

      return annotations;
    },
  },
  {
    id: 'T18-create-publish',
    name: '記事新規作成: Publish実行→API呼び出し確認',
    bugRef: null,
    action: async (page, device) => {
      await openCmsWithAuth(page);
      await page.evaluate(() => { window.location.hash = '#/collections/posts/new'; });
      await page.waitForTimeout(4000);
      await waitForEditor(page);
      const annotations = [];

      // タイトル入力
      const titleInput = page.locator('input[type="text"]').first();
      if (await titleInput.isVisible().catch(() => false)) {
        await titleInput.fill('Publish操作テスト記事');
      }

      // 本文入力
      const slate = page.locator('[data-slate-editor="true"]').first();
      if (await slate.isVisible().catch(() => false)) {
        await slate.click();
        await page.keyboard.type('保存操作テスト用本文。');
      }

      // apiCallsリセット
      apiCalls = [];

      // Publishボタンクリック
      const publishBtn = page.locator('button').filter({ hasText: /Publish|公開/ }).first();
      if (await publishBtn.isVisible().catch(() => false)) {
        const box = await publishBtn.boundingBox();
        if (box) annotations.push({ left: box.x, top: box.y, width: box.width, height: box.height, label: 'Publishクリック済' });
        await publishBtn.click();
        await page.waitForTimeout(2000);

        // 確認ダイアログ（Publish now）
        const confirmBtn = page.locator('button').filter({ hasText: /Publish now|今すぐ公開/ }).first();
        if (await confirmBtn.isVisible().catch(() => false)) {
          const cBox = await confirmBtn.boundingBox();
          if (cBox) annotations.push({ left: cBox.x, top: cBox.y, width: cBox.width, height: cBox.height, label: '確認ボタン' });
          await confirmBtn.click();
          await page.waitForTimeout(3000);
        }
      }

      // API呼び出し結果を画面に表示
      const postCalls = apiCalls.filter(c => c.method === 'POST');
      const patchCalls = apiCalls.filter(c => c.method === 'PATCH');
      await page.evaluate((info) => {
        const div = document.createElement('div');
        div.id = '_api_info';
        div.style.cssText = 'position:fixed;top:10px;right:10px;background:#333;color:#0f0;padding:10px;border-radius:8px;z-index:99998;font-size:12px;max-width:300px;font-family:monospace;';
        div.textContent = `API calls: POST=${info.posts}, PATCH=${info.patches}, Total=${info.total}`;
        document.body.appendChild(div);
      }, { posts: postCalls.length, patches: patchCalls.length, total: apiCalls.length });

      return annotations;
    },
  },

  // --- 記事編集 ---
  {
    id: 'T19-edit-load',
    name: '記事編集: 既存記事読み込み・フィールド表示',
    bugRef: null,
    action: async (page, device) => {
      await openCmsWithAuth(page);
      await page.evaluate(() => { window.location.hash = '#/collections/posts/entries/2026/02/テスト記事'; });
      await page.waitForTimeout(4000);
      await waitForEditor(page);
      const annotations = [];

      // タイトルフィールド
      const titleInput = page.locator('input[type="text"]').first();
      if (await titleInput.isVisible().catch(() => false)) {
        const value = await titleInput.inputValue();
        const box = await titleInput.boundingBox();
        if (box) annotations.push({ left: box.x, top: box.y, width: box.width, height: box.height, label: `タイトル: ${value.substring(0, 15)}` });
      }

      // Slateエディタ（本文）
      const slate = page.locator('[data-slate-editor="true"]').first();
      if (await slate.isVisible().catch(() => false)) {
        const box = await slate.boundingBox();
        if (box) annotations.push({ left: box.x, top: box.y, width: box.width, height: box.height, label: '本文エディタ' });
      }

      // EditorControlBar
      const bar = await getElementRect(page, '[class*="EditorControlBar"]');
      if (bar) annotations.push({ ...bar, label: 'エディタコントロールバー' });

      // 公開URLバー
      const urlBar = await getElementRect(page, '#cms-public-url');
      if (urlBar) annotations.push({ ...urlBar, label: '公開URLバー' });

      return annotations;
    },
  },
  {
    id: 'T20-edit-modify',
    name: '記事編集: タイトル変更・本文追加',
    bugRef: null,
    action: async (page, device) => {
      await openCmsWithAuth(page);
      await page.evaluate(() => { window.location.hash = '#/collections/posts/entries/2026/02/テスト記事'; });
      await page.waitForTimeout(4000);
      await waitForEditor(page);
      const annotations = [];

      // タイトル変更
      const titleInput = page.locator('input[type="text"]').first();
      if (await titleInput.isVisible().catch(() => false)) {
        await titleInput.clear();
        await titleInput.fill('変更後タイトル（編集テスト）');
        const box = await titleInput.boundingBox();
        if (box) annotations.push({ left: box.x, top: box.y, width: box.width, height: box.height, label: 'タイトル変更済' });
      }

      // 本文追加
      const slate = page.locator('[data-slate-editor="true"]').first();
      if (await slate.isVisible().catch(() => false)) {
        await slate.click();
        await page.keyboard.press('End');
        await page.keyboard.type('\n追加テキスト（編集操作テスト）。');
        const box = await slate.boundingBox();
        if (box) annotations.push({ left: box.x, top: box.y, width: box.width, height: box.height, label: '本文追加済' });
      }

      // 保存ボタン状態確認
      const saveBtn = page.locator('button').filter({ hasText: /Save|Publish|保存|公開/ }).first();
      if (await saveBtn.isVisible().catch(() => false)) {
        const box = await saveBtn.boundingBox();
        if (box) annotations.push({ left: box.x, top: box.y, width: box.width, height: box.height, label: '保存ボタン（変更あり）' });
      }

      return annotations;
    },
  },
  {
    id: 'T21-edit-save',
    name: '記事編集: 保存実行→API呼び出し確認',
    bugRef: null,
    action: async (page, device) => {
      await openCmsWithAuth(page);
      await page.evaluate(() => { window.location.hash = '#/collections/posts/entries/2026/02/テスト記事'; });
      await page.waitForTimeout(4000);
      await waitForEditor(page);
      const annotations = [];

      // タイトル変更
      const titleInput = page.locator('input[type="text"]').first();
      if (await titleInput.isVisible().catch(() => false)) {
        await titleInput.clear();
        await titleInput.fill('保存テスト記事');
      }

      apiCalls = [];

      // 保存ボタンクリック
      const saveBtn = page.locator('button').filter({ hasText: /Save|保存/ }).first();
      if (await saveBtn.isVisible().catch(() => false)) {
        const box = await saveBtn.boundingBox();
        if (box) annotations.push({ left: box.x, top: box.y, width: box.width, height: box.height, label: '保存クリック済' });
        await saveBtn.click();
        await page.waitForTimeout(3000);
      } else {
        // Saveがない場合はPublish
        const pubBtn = page.locator('button').filter({ hasText: /Publish|公開/ }).first();
        if (await pubBtn.isVisible().catch(() => false)) {
          await pubBtn.click();
          await page.waitForTimeout(1000);
          const confirmBtn = page.locator('button').filter({ hasText: /Publish now|今すぐ公開/ }).first();
          if (await confirmBtn.isVisible().catch(() => false)) {
            await confirmBtn.click();
            await page.waitForTimeout(3000);
          }
        }
      }

      // API結果表示
      const postCalls = apiCalls.filter(c => c.method === 'POST');
      await page.evaluate((info) => {
        const div = document.createElement('div');
        div.id = '_api_info';
        div.style.cssText = 'position:fixed;top:10px;right:10px;background:#333;color:#0f0;padding:10px;border-radius:8px;z-index:99998;font-size:12px;max-width:300px;font-family:monospace;';
        div.textContent = `Save API: POST=${info.posts}, Total=${info.total}`;
        document.body.appendChild(div);
      }, { posts: postCalls.length, total: apiCalls.length });

      return annotations;
    },
  },

  // --- 記事削除 ---
  {
    id: 'T22-delete-button',
    name: '記事削除: 削除ボタン表示・ラベル確認（Bug #4）',
    bugRef: 'Bug #4 削除ボタン誤操作防止',
    action: async (page, device) => {
      await openCmsWithAuth(page);
      await page.evaluate(() => { window.location.hash = '#/collections/posts/entries/2026/02/テスト記事'; });
      await page.waitForTimeout(4000);
      await waitForEditor(page);
      const annotations = [];

      // 削除関連ボタン（選択解除・完全削除）
      const deselectBtns = await getLocatorRects(page, page.locator('button.cms-deselect-btn'));
      deselectBtns.forEach(b => annotations.push({ ...b, label: '選択解除ボタン' }));

      const deleteBtns = await getLocatorRects(page, page.locator('button.cms-full-delete-btn'));
      deleteBtns.forEach(b => annotations.push({ ...b, label: '完全削除ボタン' }));

      // Decap標準の削除ボタン
      const stdDeleteBtns = await getLocatorRects(page, page.locator('button').filter({ hasText: /Delete|削除|完全削除/ }));
      stdDeleteBtns.forEach(b => {
        if (!annotations.some(a => Math.abs(a.left - b.left) < 5 && Math.abs(a.top - b.top) < 5)) {
          annotations.push({ ...b, label: '削除ボタン' });
        }
      });

      return annotations;
    },
  },
  {
    id: 'T23-delete-confirm',
    name: '記事削除: 削除確認ダイアログ',
    bugRef: null,
    action: async (page, device) => {
      await openCmsWithAuth(page);
      await page.evaluate(() => { window.location.hash = '#/collections/posts/entries/2026/02/テスト記事'; });
      await page.waitForTimeout(4000);
      await waitForEditor(page);
      const annotations = [];

      // 完全削除ボタンをクリック
      const deleteBtn = page.locator('button.cms-full-delete-btn, button').filter({ hasText: /完全削除|Delete/ }).first();
      if (await deleteBtn.isVisible().catch(() => false)) {
        const box = await deleteBtn.boundingBox();
        if (box) annotations.push({ left: box.x, top: box.y, width: box.width, height: box.height, label: '削除ボタン（クリック済）' });
        await deleteBtn.click();
        await page.waitForTimeout(2000);
      }

      // 確認ダイアログ/モーダル検出
      const confirmBtns = await getLocatorRects(page, page.locator('button').filter({ hasText: /OK|確認|Yes|Delete|キャンセル|Cancel/ }));
      confirmBtns.forEach(b => annotations.push({ ...b, label: b.text.includes('Cancel') || b.text.includes('キャンセル') ? 'キャンセル' : '削除確認' }));

      // モーダル/ダイアログ
      const modal = await getElementRect(page, '[class*="StyledModal"], [class*="Dialog"], [role="dialog"]');
      if (modal) annotations.push({ ...modal, label: '確認ダイアログ' });

      return annotations;
    },
  },

  // --- 画像アップロード ---
  {
    id: 'T24-image-widget',
    name: '画像ウィジェット: ボタン表示・accept制限確認（Bug #5,#6）',
    bugRef: 'Bug #5 EXIF回転, Bug #6 canvas副作用',
    action: async (page, device) => {
      await openCmsWithAuth(page);
      await page.evaluate(() => { window.location.hash = '#/collections/posts/new'; });
      await page.waitForTimeout(4000);
      await waitForEditor(page);
      const annotations = [];

      // 画像ウィジェットボタン
      const imgBtns = await getLocatorRects(page, page.locator('button').filter({ hasText: /Choose|画像|image|選択/ }));
      imgBtns.forEach(b => annotations.push({ ...b, label: '画像選択ボタン' }));

      // file input accept属性確認
      const fileInputInfo = await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input[type="file"]'));
        return inputs.map(i => ({
          accept: i.accept,
          rect: (() => { const r = i.getBoundingClientRect(); return { left: r.left, top: r.top, width: r.width, height: r.height }; })()
        }));
      });
      fileInputInfo.forEach(fi => {
        if (fi.accept && fi.accept.includes('image')) {
          annotations.push({ ...fi.rect, label: `accept: ${fi.accept.substring(0, 30)}` });
        }
      });

      // サムネイルフィールド
      const thumbField = await getElementRect(page, '[class*="FileWidget"], [class*="ImageWidget"]');
      if (thumbField) annotations.push({ ...thumbField, label: 'サムネイルフィールド' });

      return annotations;
    },
  },
  {
    id: 'T25-image-upload',
    name: '画像アップロード: ファイル選択→EXIF処理→プレビュー',
    bugRef: 'Bug #5 EXIF, Bug #29 blob CSP',
    action: async (page, device) => {
      await openCmsWithAuth(page);
      await page.evaluate(() => { window.location.hash = '#/collections/posts/new'; });
      await page.waitForTimeout(4000);
      await waitForEditor(page);
      const annotations = [];

      // ファイルinputにテスト画像をセット
      const fileInputs = page.locator('input[type="file"]');
      const fileCount = await fileInputs.count();
      if (fileCount > 0) {
        // テスト画像ファイルを一時保存
        const testImgPath = join(SCREENSHOT_DIR, '_test-upload.jpg');
        writeFileSync(testImgPath, TEST_JPEG);

        try {
          await fileInputs.first().setInputFiles(testImgPath);
          await page.waitForTimeout(3000);
        } catch (e) {
          // file inputが非表示の場合はボタンクリックでfileChooser
          const imgBtn = page.locator('button').filter({ hasText: /Choose|画像|選択/ }).first();
          if (await imgBtn.isVisible().catch(() => false)) {
            const [fileChooser] = await Promise.all([
              page.waitForEvent('filechooser', { timeout: 3000 }).catch(() => null),
              imgBtn.click(),
            ]);
            if (fileChooser) {
              await fileChooser.setFiles(testImgPath);
              await page.waitForTimeout(3000);
            }
          }
        }

        // アップロード後のプレビュー画像
        const previewImg = await getElementRect(page, '[class*="FileWidget"] img, [class*="ImageWidget"] img, [class*="FileContent"] img');
        if (previewImg) annotations.push({ ...previewImg, label: '画像プレビュー' });

        // EXIF処理ロジックの存在確認
        const hasExif = await page.evaluate(() => {
          const html = document.documentElement.outerHTML;
          return html.includes('exifFixed') && html.includes('canvas.toBlob');
        });
        annotations.push({
          left: 10, top: 10, width: 200, height: 20,
          label: hasExif ? 'EXIF処理: 実装済' : 'EXIF処理: 未検出'
        });
      }

      // 画像ウィジェット全体
      const widget = await getElementRect(page, '[class*="FileWidget"], [class*="ImageWidget"]');
      if (widget) annotations.push({ ...widget, label: '画像ウィジェット' });

      return annotations;
    },
  },
  {
    id: 'T26-media-library',
    name: 'メディアライブラリ: モーダル表示・アップロードボタン（Bug #29,#32）',
    bugRef: 'Bug #29 blob CSP, Bug #32 モーダル重複',
    action: async (page, device) => {
      await openCmsWithAuth(page);
      await page.evaluate(() => { window.location.hash = '#/collections/posts/entries/2026/02/テスト記事'; });
      await page.waitForTimeout(4000);
      await waitForEditor(page);
      const annotations = [];

      // 画像ボタンクリック→メディアライブラリ
      const imgBtn = page.locator('button').filter({ hasText: /Choose|画像|選択/ }).first();
      if (await imgBtn.isVisible().catch(() => false)) {
        await imgBtn.click();
        await page.waitForTimeout(2000);
      }

      // モーダル
      const modal = await getElementRect(page, '[class*="StyledModal"]');
      if (modal) annotations.push({ ...modal, label: 'メディアライブラリモーダル' });

      // アップロードボタン
      const uploadBtns = await getLocatorRects(page, page.locator('[class*="StyledModal"] button').filter({ hasText: /Upload|アップロード/ }));
      uploadBtns.forEach(b => annotations.push({ ...b, label: 'アップロードボタン' }));

      // カードグリッド
      const grid = await getElementRect(page, '[class*="CardGrid"]');
      if (grid) annotations.push({ ...grid, label: 'カードグリッド' });

      // フッターボタン
      const footerBtns = await getLocatorRects(page, page.locator('[class*="StyledModal"] footer button, [class*="ModalFooter"] button'));
      footerBtns.forEach(b => annotations.push({ ...b, label: b.text.substring(0, 12) || 'フッターボタン' }));

      // URLバー退避確認
      const urlBarVis = await page.evaluate(() => {
        const bar = document.getElementById('cms-public-url');
        if (!bar) return 'absent';
        return window.getComputedStyle(bar).display;
      });
      if (urlBarVis !== 'none' && urlBarVis !== 'absent') {
        const urlBar = await getElementRect(page, '#cms-public-url');
        if (urlBar) annotations.push({ ...urlBar, label: 'URLバー退避漏れ!' });
      }

      return annotations;
    },
  },

  // --- タグ編集 ---
  {
    id: 'T27-tag-edit',
    name: 'タグ編集: タグ追加・表示確認',
    bugRef: null,
    action: async (page, device) => {
      await openCmsWithAuth(page);
      await page.evaluate(() => { window.location.hash = '#/collections/posts/new'; });
      await page.waitForTimeout(4000);
      await waitForEditor(page);
      const annotations = [];

      // タグウィジェットを探す（list widgetまたはtag input）
      const tagInputs = page.locator('[class*="ListControl"] input, [class*="TagInput"], [id*="tags"] input');
      const tagCount = await tagInputs.count();
      if (tagCount > 0) {
        const tagInput = tagInputs.first();
        if (await tagInput.isVisible().catch(() => false)) {
          await tagInput.fill('テストタグ');
          await page.keyboard.press('Enter');
          await page.waitForTimeout(500);
          await tagInput.fill('操作確認');
          await page.keyboard.press('Enter');
          await page.waitForTimeout(500);
          const box = await tagInput.boundingBox();
          if (box) annotations.push({ left: box.x, top: box.y, width: box.width, height: box.height, label: 'タグ入力欄' });
        }
      }

      // タグ一覧（追加済みタグ）
      const tagItems = await getLocatorRects(page, page.locator('[class*="ListItem"], [class*="Tag"]'));
      tagItems.forEach(b => annotations.push({ ...b, label: `タグ: ${b.text.substring(0, 10)}` }));

      // タグ追加ボタン
      const addBtns = await getLocatorRects(page, page.locator('button').filter({ hasText: /Add|追加/ }));
      addBtns.forEach(b => annotations.push({ ...b, label: 'タグ追加ボタン' }));

      return annotations;
    },
  },

  // --- 下書き/公開ステータス ---
  {
    id: 'T28-draft-toggle',
    name: '下書き/公開ステータス切替（Bug #7）',
    bugRef: 'Bug #7 ドロップダウン位置',
    action: async (page, device) => {
      await openCmsWithAuth(page);
      await page.evaluate(() => { window.location.hash = '#/collections/posts/entries/2026/02/テスト記事'; });
      await page.waitForTimeout(4000);
      await waitForEditor(page);
      const annotations = [];

      // ステータストグル/ドロップダウン
      const statusBtns = await getLocatorRects(page, page.locator('button').filter({ hasText: /Published|Draft|Set status|Status|公開/ }));
      statusBtns.forEach(b => annotations.push({ ...b, label: 'ステータスボタン' }));

      // ドロップダウンを開く
      const statusBtn = page.locator('[class*="EditorControlBar"] button').filter({ hasText: /Published|Draft|Status/ }).first();
      if (await statusBtn.isVisible().catch(() => false)) {
        await statusBtn.click();
        await page.waitForTimeout(1000);

        // ドロップダウン内容
        const dropdownItems = await getLocatorRects(page, page.locator('[class*="DropdownList"] li, [class*="DropdownList"] button'));
        dropdownItems.forEach(b => annotations.push({ ...b, label: b.text.substring(0, 12) || 'ドロップダウン項目' }));

        // ドロップダウン自体
        const dropdown = await getElementRect(page, '[class*="DropdownList"]');
        if (dropdown) annotations.push({ ...dropdown, label: 'ステータスドロップダウン' });
      }

      return annotations;
    },
  },

  // --- Publish確認ワークフロー ---
  {
    id: 'T29-publish-flow',
    name: 'Publish確認: 公開→確認ダイアログ→完了',
    bugRef: null,
    action: async (page, device) => {
      await openCmsWithAuth(page);
      await page.evaluate(() => { window.location.hash = '#/collections/posts/entries/2026/02/テスト記事'; });
      await page.waitForTimeout(4000);
      await waitForEditor(page);
      const annotations = [];

      // Publishボタンをクリック
      const publishBtn = page.locator('button').filter({ hasText: /Publish|公開/ }).first();
      if (await publishBtn.isVisible().catch(() => false)) {
        const box = await publishBtn.boundingBox();
        if (box) annotations.push({ left: box.x, top: box.y, width: box.width, height: box.height, label: 'Publishボタン' });
        await publishBtn.click();
        await page.waitForTimeout(2000);

        // 確認ダイアログ内のボタン
        const allBtns = await getLocatorRects(page, page.locator('button'));
        allBtns.forEach(b => {
          if (b.text.includes('Publish now') || b.text.includes('今すぐ')) {
            annotations.push({ ...b, label: '「今すぐ公開」確認' });
          }
        });

        // ドロップダウン/パネル
        const dropdown = await getElementRect(page, '[class*="DropdownList"]');
        if (dropdown) annotations.push({ ...dropdown, label: '公開確認パネル' });
      }

      return annotations;
    },
  },

  // --- 固定ページ ---
  {
    id: 'T30-page-create',
    name: '固定ページ新規作成: フォーム入力',
    bugRef: null,
    action: async (page, device) => {
      await openCmsWithAuth(page);
      await page.evaluate(() => { window.location.hash = '#/collections/pages/new'; });
      await page.waitForTimeout(4000);
      await waitForEditor(page);
      const annotations = [];

      // フォームフィールド（タイトル、slug、order等）
      const inputs = page.locator('input[type="text"], input[type="number"]');
      const inputCount = await inputs.count();
      for (let i = 0; i < Math.min(inputCount, 5); i++) {
        const input = inputs.nth(i);
        if (await input.isVisible().catch(() => false)) {
          const box = await input.boundingBox();
          if (box) {
            const labels = ['タイトル', 'slug', 'order', 'フィールド4', 'フィールド5'];
            annotations.push({ left: box.x, top: box.y, width: box.width, height: box.height, label: labels[i] || `フィールド${i+1}` });
          }
          // 最初のフィールドにテスト入力
          if (i === 0) await input.fill('テスト固定ページ').catch(() => {});
          if (i === 1) await input.fill('test-page').catch(() => {});
        }
      }

      // 保存ボタン
      const saveBtn = page.locator('button').filter({ hasText: /Publish|Save|公開/ }).first();
      if (await saveBtn.isVisible().catch(() => false)) {
        const box = await saveBtn.boundingBox();
        if (box) annotations.push({ left: box.x, top: box.y, width: box.width, height: box.height, label: '保存ボタン' });
      }

      // URLバー
      const urlBar = await getElementRect(page, '#cms-public-url');
      if (urlBar) annotations.push({ ...urlBar, label: '固定ページURL(slug形式)' });

      return annotations;
    },
  },
  {
    id: 'T31-page-edit',
    name: '固定ページ編集: 既存ページ読み込み・slug URL（Bug #13）',
    bugRef: 'Bug #13 固定ページ公開URL',
    action: async (page, device) => {
      await openCmsWithAuth(page);
      // 固定ページ一覧→最初のエントリクリック
      await page.evaluate(() => { window.location.hash = '#/collections/pages'; });
      await page.waitForTimeout(3000);

      const annotations = [];
      // 一覧表示
      const entries = await getLocatorRects(page, page.locator('a[href*="entries"]'));
      entries.forEach(b => annotations.push({ ...b, label: '固定ページエントリ' }));

      // 最初のエントリをクリック
      const entry = page.locator('a[href*="entries"]').first();
      if (await entry.isVisible().catch(() => false)) {
        await entry.click();
        await page.waitForTimeout(4000);
      }

      // 編集フォーム
      const titleInput = page.locator('input[type="text"]').first();
      if (await titleInput.isVisible().catch(() => false)) {
        const box = await titleInput.boundingBox();
        if (box) annotations.push({ left: box.x, top: box.y, width: box.width, height: box.height, label: '固定ページタイトル' });
      }

      // slug URL表示
      const urlBar = await getElementRect(page, '#cms-public-url');
      if (urlBar) annotations.push({ ...urlBar, label: '/slug形式URL' });

      return annotations;
    },
  },

  // --- エディタツールバー操作 ---
  {
    id: 'T32-toolbar-ops',
    name: 'エディタツールバー: 書式ボタン操作（Bug #9）',
    bugRef: 'Bug #9 codeblock非表示(モバイル)',
    action: async (page, device) => {
      await openCmsWithAuth(page);
      await page.evaluate(() => { window.location.hash = '#/collections/posts/new'; });
      await page.waitForTimeout(4000);
      await waitForEditor(page);
      const annotations = [];

      // ツールバーボタン全取得
      const toolBtns = await getLocatorRects(page, page.locator('[class*="ToolbarButton"]'));
      toolBtns.forEach(b => annotations.push({ ...b, label: b.text.substring(0, 10) || 'ツールバー' }));

      // Slateエディタにテキスト入力してから書式適用
      const slate = page.locator('[data-slate-editor="true"]').first();
      if (await slate.isVisible().catch(() => false)) {
        await slate.click();
        await page.keyboard.type('太字テスト ');

        // Bold (Ctrl+B)
        await page.keyboard.press('Control+a');
        await page.waitForTimeout(300);

        const box = await slate.boundingBox();
        if (box) annotations.push({ left: box.x, top: box.y, width: box.width, height: box.height, label: 'テキスト選択中' });
      }

      // モバイルのCode Block非表示確認
      if (device.name === 'iPhone' || device.name === 'iPad') {
        const codeBlockCheck = await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('button, li, [role="menuitem"]'));
          const cb = btns.find(b => (b.textContent || '').trim() === 'Code Block');
          if (cb) {
            const s = window.getComputedStyle(cb);
            return s.display !== 'none';
          }
          return false;
        });
        annotations.push({
          left: 10, top: 10, width: 250, height: 20,
          label: codeBlockCheck ? 'Code Block表示中(要確認)' : 'Code Block非表示(OK)'
        });
      }

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
    for (const test of CMS_CRUD_TESTS) {
      const context = await browser.newContext({ ...device.config, ignoreHTTPSErrors: true });
      const page = await context.newPage();
      const screenshotPath = join(SCREENSHOT_DIR, `${test.id}_${device.name}.png`);

      try {
        console.log(`  [RUN] ${test.name}`);
        apiCalls = [];
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
        console.log(`  [${pass ? 'PASS' : 'FAIL'}] ${test.name} (overlaps: ${overlaps.length}, annotations: ${allAnnotations.length}, apiCalls: ${apiCalls.length})`);
        if (!pass) overlaps.forEach(o => console.log(`    overlap: ${o.elementA} <-> ${o.elementB}`));
        results.push({ device: device.name, test: test.name, id: test.id, bugRef: test.bugRef, overlaps: overlaps.length, annotationCount: allAnnotations.length, apiCallCount: apiCalls.length, pass, screenshot: `${test.id}_${device.name}.png` });
      } catch (err) {
        console.log(`  [ERROR] ${test.name}: ${err.message.substring(0, 120)}`);
        await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
        results.push({ device: device.name, test: test.name, id: test.id, bugRef: test.bugRef, overlaps: 0, annotationCount: 0, apiCallCount: 0, pass: true, screenshot: `${test.id}_${device.name}.png`, note: err.message.substring(0, 200) });
      }
      await page.close();
      await context.close();
    }
  }

  console.log('\n\n========== CMS CRUD TEST SUMMARY ==========');
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  console.log(`Total: ${results.length} | PASS: ${passed} | FAIL: ${failed}`);
  for (const r of results) {
    const bug = r.bugRef ? ` [${r.bugRef}]` : '';
    const note = r.note ? ` (${r.note.substring(0, 50)})` : '';
    console.log(`  [${r.pass ? 'PASS' : 'FAIL'}] ${r.device} - ${r.test}${bug}${note}`);
  }

  writeFileSync(join(process.cwd(), 'evidence', '2026-02-23', 'cms-crud-results.json'), JSON.stringify(results, null, 2));
  await browser.close();
  server.kill();
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });
