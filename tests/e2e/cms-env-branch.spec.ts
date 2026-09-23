import { test, expect, Page, Route } from '@playwright/test';
import { readFileSync, existsSync, statSync } from 'fs';
import { join, extname } from 'path';

/**
 * Issue #127（CMS-ENV-01 仮ID / SEC-35 改）: CMS の書き込み先ブランチ・base_url の実行時導出 E2E
 *
 * config.yml から backend.branch / base_url を削除し、admin/index.html が
 * CMS_MANUAL_INIT + CMS.init({ config: { backend } }) でホスト名から導出した値を渡す。
 * ここでは実際にログイン → 記事を開く → タイトルを入力 → 「公開」を押す、というユーザー操作を行い、
 * GitHub API モックが受け取った書き込み（PATCH git/refs/heads/<branch>）のブランチを検証する。
 *
 * ホスト名の差し替え: 本番・staging・プレビューのホスト名の URL を page.route() で横取りし、
 * ローカルの dist から応答する（実サーバーには一切通信しない）。これで location.hostname / origin が
 * 各環境の値になった状態の CMS を動かせる。
 *
 * 認証: CLAUDE.md の規定どおり test runner では window.open モンキーパッチ（3ステップハンドシェイク）を使う。
 * window.open に渡された URL を記録し、base_url（= location.origin）+ /auth になっていることも検証する。
 */

const DIST_DIR = join(process.cwd(), 'dist');
const EVIDENCE_DIR = join(process.cwd(), 'evidence', '2026-09-23', 'issue127', 'screenshots');

// 期待値の対応表（admin/cms-env.js の判定方針と同じ）。本番ホストだけ main、それ以外は staging。
const HOST_CASES = [
  { label: 'localhost', origin: null as string | null, expectedBranch: 'staging' },
  { label: 'production', origin: 'https://reiwa.casa', expectedBranch: 'main' },
  { label: 'staging', origin: 'https://staging.reiwa.casa', expectedBranch: 'staging' },
  { label: 'pages-preview', origin: 'https://abc123.my-blog-3cg.pages.dev', expectedBranch: 'staging' },
];

const MOCK_ARTICLE = {
  path: 'src/content/posts/2026/01/env-branch-mock.md',
  sha: 'envmock1',
  title: 'ブランチ導出モック記事',
};
const MOCK_CONTENT = `---\ntitle: ${MOCK_ARTICLE.title}\ndate: 2026-01-10\ndraft: false\ntags:\n  - テスト\n---\nモック本文です。`;

interface ApiCall { method: string; url: string; body?: string }

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css',
  '.yml': 'text/yaml', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.webp': 'image/webp',
};

/** 任意ホストへのリクエストをローカル dist から返す（ネットワークへ出さない） */
function serveFromDist(route: Route) {
  const url = new URL(route.request().url());
  let p = decodeURIComponent(url.pathname);
  if (p.endsWith('/')) p += 'index.html';
  let file = join(DIST_DIR, p);
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file)) {
    return route.fulfill({ status: 404, contentType: 'text/plain', body: 'Not Found (local dist)' });
  }
  return route.fulfill({
    status: 200,
    contentType: MIME[extname(file)] || 'application/octet-stream',
    body: readFileSync(file),
  });
}

async function setupGithubMocks(page: Page, apiCalls: ApiCall[]) {
  const push = (route: Route) => {
    const req = route.request();
    apiCalls.push({ method: req.method(), url: req.url(), body: req.postData() || undefined });
  };
  // catch-all（最初に登録 = LIFO で最後に評価）。github.com も含めて外へ出さない。
  await page.route((url) => url.hostname === 'api.github.com' || url.hostname === 'github.com', (route) => {
    push(route);
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });
  await page.route((url) => url.hostname === 'api.github.com' && url.pathname === '/user', (route) => {
    push(route);
    route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ login: 'testuser', id: 1, name: 'Test User', avatar_url: '' }) });
  });
  await page.route((url) => url.hostname === 'api.github.com' && url.pathname === '/repos/bickojima/my-blog', (route) => {
    push(route);
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
      id: 1, name: 'my-blog', full_name: 'bickojima/my-blog', private: false,
      owner: { login: 'bickojima', id: 1 }, default_branch: 'main',
      permissions: { admin: true, push: true, pull: true },
    }) });
  });
  await page.route((url) => url.hostname === 'api.github.com' && url.pathname.startsWith('/repos/bickojima/my-blog/branches/'), (route) => {
    push(route);
    const name = decodeURIComponent(new URL(route.request().url()).pathname.split('/branches/')[1]);
    route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ name, commit: { sha: 'basecommit1', commit: { tree: { sha: 'basetree1' } } } }) });
  });
  await page.route((url) => url.hostname === 'api.github.com' && url.pathname.startsWith('/repos/bickojima/my-blog/commits'), (route) => {
    push(route);
    route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify([{ sha: 'basecommit1', commit: { message: 'mock', author: { name: 'x', date: '2026-01-10T00:00:00Z' } } }]) });
  });
  await page.route((url) => url.hostname === 'api.github.com' && url.pathname.startsWith('/repos/bickojima/my-blog/git/'), (route) => {
    push(route);
    const req = route.request();
    const url = req.url();
    const method = req.method();
    if (url.includes('/trees') && method === 'GET') {
      // コレクション全体（recursive）は folder 相対パス、個別ディレクトリ（2026/01）はファイル名で返す
      const decoded = decodeURIComponent(url);
      const inPostsDir = decoded.includes('content/posts/2026/01');
      const inPosts = decoded.includes('content/posts');
      const tree = inPostsDir
        ? [{ path: 'env-branch-mock.md', mode: '100644', type: 'blob', sha: MOCK_ARTICLE.sha }]
        : inPosts
          ? [{ path: '2026/01/env-branch-mock.md', mode: '100644', type: 'blob', sha: MOCK_ARTICLE.sha }]
          : [];
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ sha: 'tree1', truncated: false, tree }) });
    } else if (url.includes('/blobs') && method === 'GET') {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
        sha: MOCK_ARTICLE.sha, content: Buffer.from(MOCK_CONTENT).toString('base64'), encoding: 'base64' }) });
    } else if (url.includes('/refs') && method === 'GET') {
      const ref = new URL(url).pathname.split('/git/')[1];
      route.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ ref, object: { sha: 'basecommit1', type: 'commit' } }) });
    } else if (url.includes('/refs') && method === 'PATCH') {
      const ref = new URL(url).pathname.split('/git/')[1];
      route.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ ref, object: { sha: 'newcommit1', type: 'commit' } }) });
    } else if (url.includes('/commits') && method === 'GET') {
      route.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ sha: 'basecommit1', tree: { sha: 'basetree1' }, parents: [] }) });
    } else if (method === 'POST') {
      route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ sha: 'new-' + Date.now() }) });
    } else {
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    }
  });
  await page.route((url) => url.hostname === 'api.github.com' && url.pathname.startsWith('/repos/bickojima/my-blog/contents/'), (route) => {
    push(route);
    const method = route.request().method();
    if (method === 'GET') {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
        name: 'env-branch-mock.md', path: MOCK_ARTICLE.path, sha: MOCK_ARTICLE.sha,
        content: Buffer.from(MOCK_CONTENT).toString('base64'), encoding: 'base64' }) });
    } else {
      route.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ content: { sha: 'put1' }, commit: { sha: 'newcommit1' } }) });
    }
  });
  await page.route((url) => url.hostname === 'api.github.com' && url.pathname.startsWith('/repos/bickojima/my-blog/pulls'), (route) => {
    push(route);
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });
}

/** window.open モンキーパッチ（3ステップハンドシェイク）。開こうとした URL を window.__authOpenUrls に残す */
async function installAuthMonkeyPatch(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { __authOpenUrls: string[] }).__authOpenUrls = [];
    window.open = function (url?: string | URL) {
      (window as unknown as { __authOpenUrls: string[] }).__authOpenUrls.push(String(url));
      const fakePopup = {
        closed: false,
        close() { this.closed = true; },
        postMessage() {
          setTimeout(() => {
            window.postMessage(
              'authorization:github:success:' + JSON.stringify({ token: 'mock-token', provider: 'github' }),
              window.location.origin,
            );
          }, 100);
        },
      };
      setTimeout(() => { window.postMessage('authorizing:github', window.location.origin); }, 200);
      return fakePopup as unknown as Window;
    };
  });
}

async function annotate(page: Page, selector: string, label: string) {
  await page.evaluate(({ s, l }) => {
    const el = document.querySelector(s);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const d = document.createElement('div');
    d.className = '_rbOverlay';
    d.style.cssText = `position:fixed;top:${r.top - 3}px;left:${r.left - 3}px;width:${r.width + 6}px;height:${r.height + 6}px;border:3px solid red;border-radius:4px;z-index:99999;pointer-events:none;`;
    const lbl = document.createElement('div');
    lbl.style.cssText = 'position:absolute;top:-22px;left:0;background:red;color:#fff;font-size:12px;padding:2px 6px;white-space:nowrap;';
    lbl.textContent = l;
    d.appendChild(lbl);
    document.body.appendChild(d);
  }, { s: selector, l: label });
}

for (const hc of HOST_CASES) {
  test.describe(`CMS書き込み先ブランチの実行時導出（Issue #127）: ${hc.label}`, () => {
    test(`${hc.label} から記事を保存すると ${hc.expectedBranch} ブランチへ書き込む`, async ({ page, baseURL }, testInfo) => {
      test.setTimeout(90000);
      const apiCalls: ApiCall[] = [];
      await setupGithubMocks(page, apiCalls);
      if (hc.origin) {
        const host = new URL(hc.origin).hostname;
        await page.route((url) => url.hostname === host, serveFromDist);
      }
      await installAuthMonkeyPatch(page);

      const origin = hc.origin ?? new URL(baseURL!).origin;
      await page.goto(origin + '/admin/');

      // 実操作: ログインボタンをクリック
      const loginButton = page.getByRole('button', { name: 'GitHub でログインする' });
      await expect(loginButton).toBeVisible({ timeout: 20000 });
      await loginButton.click();

      // base_url = location.origin で /auth を開こうとしたこと
      await expect.poll(async () => page.evaluate(() => (window as unknown as { __authOpenUrls: string[] }).__authOpenUrls[0] || ''))
        .toMatch(new RegExp('^' + origin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '/auth(\\?|$)'));

      // 実操作: 一覧からモック記事をクリックして開く
      const entryLink = page.locator('a[href*="entries/2026/01/env-branch-mock"]').first();
      await expect(entryLink).toBeVisible({ timeout: 30000 });
      await entryLink.click();

      // 実操作: タイトル欄に入力
      const titleInput = page.locator('input[id^="title-field"]').first();
      await expect(titleInput).toBeVisible({ timeout: 20000 });
      await titleInput.fill(`${MOCK_ARTICLE.title}（${hc.label}で更新）`);

      // 実操作: 「公開」→「公開する」
      const publishButton = page.getByRole('button', { name: /^公開$/ }).first();
      await expect(publishButton).toBeVisible();
      await publishButton.click();
      const publishNow = page.getByRole('menuitem', { name: '公開する', exact: true });
      await expect(publishNow).toBeVisible();
      // iPhone エミュレーションでは、変更前の staging（fc4fb3b）でも「公開」メニューのボトムシートが
      // レイアウト上 800px 幅・表示領域外（y≈1238）に描画され、クリックが届かない（本変更とは独立の既存事象。
      // PR 本文・DOCUMENTATION.md 4.5 章の既知事象に記載）。その場合だけキーボード操作（Enter）で選ぶ。
      const clickable = await publishNow.click({ trial: true, timeout: 3000 }).then(() => true, () => false);
      if (clickable) {
        await publishNow.click();
      } else {
        testInfo.annotations.push({ type: 'publish-menu', description: 'menuitem outside viewport; selected via keyboard Enter' });
        await publishNow.press('Enter');
      }

      // 書き込み（ref 更新）を待つ
      await expect.poll(() => apiCalls.filter((c) => c.method === 'PATCH' && c.url.includes('/git/refs/')).length, { timeout: 30000 })
        .toBeGreaterThan(0);

      const writes = apiCalls.filter((c) => c.method !== 'GET');
      const refPatches = writes.filter((c) => c.method === 'PATCH' && c.url.includes('/git/refs/'));
      for (const p of refPatches) {
        expect(new URL(p.url).pathname).toBe(`/repos/bickojima/my-blog/git/refs/heads/${hc.expectedBranch}`);
      }
      // 反対側のブランチ名を含む書き込み・参照が一切ないこと
      const otherBranch = hc.expectedBranch === 'main' ? 'staging' : 'main';
      const touchedOther = apiCalls.filter((c) =>
        c.url.includes(`/refs/heads/${otherBranch}`) || c.url.includes(`/branches/${otherBranch}`)
        || new URL(c.url).searchParams.get('ref') === otherBranch || c.url.includes(`/trees/${otherBranch}:`));
      expect(touchedOther.map((c) => `${c.method} ${c.url}`)).toEqual([]);

      // エビデンス（認証後の編集画面 + 保存後）
      await annotate(page, 'input[id^="title-field"]', `origin=${origin} → 書き込み先 refs/heads/${hc.expectedBranch}`);
      await page.screenshot({ path: join(EVIDENCE_DIR, `e127-${hc.label}-${testInfo.project.name}.png`) });
      testInfo.annotations.push({ type: 'writes', description: refPatches.map((c) => `${c.method} ${new URL(c.url).pathname}`).join(', ') });
    });
  });
}
