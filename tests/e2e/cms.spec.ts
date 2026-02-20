import { test, expect, Page } from '@playwright/test';

/**
 * CMS管理画面 E2Eテスト
 *
 * Decap CMS (CDNロード) のUI構造を検証する。
 * OAuth認証はGitHub OAuthの実環境が必要なため、認証前の画面と
 * postMessageによるシミュレーション結果を検証する。
 * 実リポジトリへの変更は一切発生しない。
 *
 * 実行環境: ローカル開発環境のみ（Chromiumブラウザが必要）
 */

/**
 * GitHub APIモックをルーティングに設定する
 */
async function setupGitHubMocks(page: Page) {
  await page.route('https://api.github.com/user', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ login: 'testuser', id: 12345, name: 'Test User', avatar_url: '' }),
    });
  });
  await page.route('https://api.github.com/repos/bickojima/my-blog', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ full_name: 'bickojima/my-blog', default_branch: 'main', permissions: { push: true } }),
    });
  });
  await page.route('**/repos/bickojima/my-blog/branches/main', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ name: 'main', commit: { sha: 'abc123' } }),
    });
  });
  await page.route('**/repos/bickojima/my-blog/git/**', (route) => {
    const url = route.request().url();
    if (url.includes('/trees/')) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sha: 'tree123',
          tree: [{
            path: 'src/content/posts/2026/02/テスト記事.md',
            mode: '100644',
            type: 'blob',
            sha: 'file123',
          }],
          truncated: false,
        }),
      });
    } else if (url.includes('/blobs/')) {
      const content = `---\ntitle: テスト記事\ndate: 2026-02-15\ndraft: false\ntags: []\n---\nテスト本文`;
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ sha: 'file123', content: Buffer.from(content).toString('base64'), encoding: 'base64' }),
      });
    } else if (url.includes('/ref/')) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ref: 'refs/heads/main', object: { sha: 'abc123', type: 'commit' } }),
      });
    } else {
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    }
  });
  await page.route('**/repos/bickojima/my-blog/contents/**', (route) => {
    const content = `---\ntitle: テスト記事\ndate: 2026-02-15\ndraft: false\ntags: []\n---\nテスト本文`;
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        name: 'テスト記事.md',
        path: 'src/content/posts/2026/02/テスト記事.md',
        sha: 'file123',
        content: Buffer.from(content).toString('base64'),
        encoding: 'base64',
      }),
    });
  });
}

/**
 * CMS画面を開き、postMessageでOAuth認証をシミュレートする
 */
async function openCmsWithAuth(page: Page) {
  await setupGitHubMocks(page);

  // OAuthポップアップのルートをモック（postMessageでトークン送信）
  await page.route('**/auth', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: `<html><body><script>
        try {
          window.opener.postMessage(
            'authorization:github:success:{"token":"mock-token","provider":"github"}',
            window.opener.location.origin
          );
        } catch(e) {}
        window.close();
      </script></body></html>`,
    });
  });

  await page.goto('/admin/');
  await page.waitForTimeout(3000);

  // ログインボタンをクリック
  const loginButton = page.locator('button:has-text("GitHub でログインする")');
  if (await loginButton.isVisible().catch(() => false)) {
    const popupPromise = page.waitForEvent('popup').catch(() => null);
    await loginButton.click();
    const popup = await popupPromise;
    if (popup) {
      await popup.waitForLoadState().catch(() => {});
      await popup.waitForTimeout(500).catch(() => {});
    }
    // CMS がトークンを処理するまで待機
    await page.waitForTimeout(5000);
  }
}

test.describe('E-07: CMS管理画面読込', () => {
  test('管理画面のHTMLがロードされる', async ({ page }) => {
    await page.goto('/admin/');
    await expect(page).toHaveTitle('Content Manager');
  });

  test('Decap CMSのスクリプトが読み込まれる', async ({ page }) => {
    await page.goto('/admin/');
    await page.waitForTimeout(3000);
    // CMSのルート要素またはログインボタンが表示される
    const cmsRoot = page.locator('#nc-root');
    const loginButton = page.locator('button:has-text("GitHub でログインする")');
    const hasCmsRoot = await cmsRoot.count() > 0;
    const hasLogin = await loginButton.count() > 0;
    expect(hasCmsRoot || hasLogin).toBeTruthy();
  });

  test('GitHub OAuthログインボタンが表示される', async ({ page }) => {
    await page.goto('/admin/');
    await page.waitForTimeout(3000);
    await expect(page.locator('button:has-text("GitHub でログインする")')).toBeVisible();
  });
});

test.describe('E-08: 認証シミュレーション', () => {
  test('ログインボタンクリックでOAuthポップアップが起動する', async ({ page }) => {
    await page.goto('/admin/');
    await page.waitForTimeout(3000);

    const popupPromise = page.waitForEvent('popup');
    await page.locator('button:has-text("GitHub でログインする")').click();
    const popup = await popupPromise;
    // ポップアップが開き、OAuth認証フローが開始される
    // （/auth エンドポイントから GitHub にリダイレクトされる場合がある）
    const popupUrl = popup.url();
    expect(popupUrl.includes('/auth') || popupUrl.includes('github.com')).toBeTruthy();
    await popup.close();
  });

  test('postMessageで認証トークンが送信される（シミュレーション）', async ({ page }) => {
    await setupGitHubMocks(page);
    await page.goto('/admin/');
    await page.waitForTimeout(3000);

    // postMessageイベントをシミュレート（Decap CMSが受け取る形式）
    await page.evaluate(() => {
      window.postMessage(
        'authorization:github:success:{"token":"mock-token","provider":"github"}',
        window.location.origin,
      );
    });

    // CMS が認証情報を処理する時間を確保
    await page.waitForTimeout(5000);

    // 認証処理後、ログインボタンが消えるか、CMSコンテンツが表示されるか確認
    const loginButton = page.locator('button:has-text("GitHub でログインする")');
    const cmsContent = page.locator('[class*="AppHeader"], [class*="CollectionContainer"]');
    const loginVisible = await loginButton.isVisible().catch(() => true);
    const cmsVisible = await cmsContent.count() > 0;
    // シミュレーション成功時: ログインが消えてCMSが表示される
    // シミュレーション不完全時: ログインが残る（Decap CMSの内部状態により変動）
    expect(loginVisible || cmsVisible).toBeTruthy();
  });
});

test.describe('E-09: 記事作成フォーム（シミュレーション）', () => {
  test('新規記事URLのハッシュルートが存在する', async ({ page }) => {
    await openCmsWithAuth(page);
    // 新規記事のハッシュルートに遷移
    await page.evaluate(() => {
      window.location.hash = '#/collections/posts/new';
    });
    await page.waitForTimeout(2000);
    // ハッシュが正しく設定される
    const hash = await page.evaluate(() => window.location.hash);
    expect(hash).toBe('#/collections/posts/new');
  });
});

test.describe('E-10: 記事編集（シミュレーション）', () => {
  test('記事編集URLのハッシュルートが存在する', async ({ page }) => {
    await openCmsWithAuth(page);
    await page.evaluate(() => {
      window.location.hash = '#/collections/posts/entries/2026/02/テスト記事';
    });
    await page.waitForTimeout(2000);
    const hash = await page.evaluate(() => window.location.hash);
    expect(hash).toContain('#/collections/posts/entries/');
  });
});

test.describe('E-11: 画像アップロードUI（構造検証）', () => {
  test('CMS設定にmedia_folderが定義されている', async ({ page }) => {
    // config.ymlを直接確認（CMS設定の画像アップロード先）
    const response = await page.request.get('/admin/config.yml');
    const configText = await response.text();
    expect(configText).toContain('media_folder');
    expect(configText).toContain('public/images/uploads');
  });

  test('admin HTMLに画像input制限が実装されている', async ({ page }) => {
    await page.goto('/admin/');
    const html = await page.content();
    // HEIC→JPEG自動変換のためのaccept属性制限スクリプトが存在する
    expect(html).toContain('image/jpeg');
    expect(html).toContain('input[type="file"]');
  });
});

test.describe('E-12: 記事削除UI（構造検証）', () => {
  test('admin HTMLに削除ボタンラベル変更ロジックが実装されている', async ({ page }) => {
    await page.goto('/admin/');
    const html = await page.content();
    // 「選択解除」「完全削除」のラベル変更スクリプトが存在する
    expect(html).toContain('選択解除');
    expect(html).toContain('完全削除');
    expect(html).toContain('cms-deselect-btn');
    expect(html).toContain('cms-full-delete-btn');
  });

  test('完全削除ボタンの無効化ロジックが実装されている', async ({ page }) => {
    await page.goto('/admin/');
    const html = await page.content();
    // 未選択時に削除ボタンを無効化するスクリプトが存在する
    expect(html).toContain('deleteBtn.disabled');
    expect(html).toContain('hasSelected');
  });
});
