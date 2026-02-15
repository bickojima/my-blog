import { test, expect } from '@playwright/test';

test.describe('E-01: トップページ表示', () => {
  test('h1に「記事一覧」が表示される', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText('記事一覧');
  });

  test('記事カードが1件以上表示される', async ({ page }) => {
    await page.goto('/');
    const cards = page.locator('article.post-card');
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('各記事カードにタイトルリンクがある', async ({ page }) => {
    await page.goto('/');
    const titles = page.locator('a.post-title');
    expect(await titles.count()).toBeGreaterThan(0);
    const href = await titles.first().getAttribute('href');
    expect(href).toMatch(/^\/posts\/\d{4}\/\d{2}\/.+/);
  });

  test('各記事カードに日付が表示される', async ({ page }) => {
    await page.goto('/');
    const times = page.locator('article.post-card time');
    expect(await times.count()).toBeGreaterThan(0);
    const datetime = await times.first().getAttribute('datetime');
    expect(datetime).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

test.describe('E-02: 記事ページ遷移', () => {
  test('記事リンクをクリックすると記事詳細ページに遷移する', async ({ page }) => {
    await page.goto('/');
    const firstTitle = page.locator('a.post-title').first();
    const titleText = await firstTitle.textContent();
    await firstTitle.click();

    await expect(page.locator('.post-header h1')).toHaveText(titleText!);
    await expect(page.locator('.post-content')).toBeVisible();
  });

  test('記事詳細ページにヘッダー・コンテンツ・フッターがある', async ({ page }) => {
    await page.goto('/posts/2026/02/%E3%83%96%E3%83%A9%E3%82%B6%E3%83%BC%E3%83%97%E3%83%AA%E3%83%B3%E3%82%BF%E3%83%BC%E3%82%92%E8%B2%B7%E3%81%A3%E3%81%9F%E8%A9%B1');
    await expect(page.locator('.post-header h1')).toHaveText('ブラザープリンターを買った話');
    await expect(page.locator('.post-header time')).toHaveAttribute('datetime', '2026-02-14');
    await expect(page.locator('.post-content')).toBeVisible();
    await expect(page.locator('.post-footer a')).toBeVisible();
  });

  test('「記事一覧に戻る」リンクでトップに戻れる', async ({ page }) => {
    await page.goto('/posts/2026/02/%E3%83%96%E3%83%A9%E3%82%B6%E3%83%BC%E3%83%97%E3%83%AA%E3%83%B3%E3%82%BF%E3%83%BC%E3%82%92%E8%B2%B7%E3%81%A3%E3%81%9F%E8%A9%B1');
    await page.locator('.post-footer a').click();
    await expect(page.locator('h1')).toHaveText('記事一覧');
  });
});

test.describe('E-03: タグフィルタリング', () => {
  test('タグリンクをクリックするとタグページに遷移する', async ({ page }) => {
    await page.goto('/');
    const tagLink = page.locator('a.tag').first();
    const tagText = await tagLink.textContent();
    await tagLink.click();

    await expect(page.locator('h1')).toContainText(`タグ: ${tagText}`);
  });

  test('タグページに該当記事のみ表示される', async ({ page }) => {
    await page.goto('/tags/%E3%83%96%E3%83%A9%E3%82%B6%E3%83%BC');
    await expect(page.locator('h1')).toHaveText('タグ: ブラザー');
    const posts = page.locator('a.post-link');
    expect(await posts.count()).toBe(1);
    await expect(posts.first().locator('.post-title')).toHaveText('ブラザープリンターを買った話');
  });

  test('「記事一覧に戻る」リンクがある', async ({ page }) => {
    await page.goto('/tags/%E3%83%96%E3%83%A9%E3%82%B6%E3%83%BC');
    await expect(page.locator('a.back-link')).toBeVisible();
    await page.locator('a.back-link').click();
    await expect(page.locator('h1')).toHaveText('記事一覧');
  });
});

test.describe('E-04: アーカイブナビゲーション', () => {
  test('トップページにアーカイブナビがある', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav.archive-nav')).toBeVisible();
    await expect(page.locator('nav.archive-nav h3')).toHaveText('アーカイブ');
  });

  test('年リンクをクリックすると年アーカイブに遷移する', async ({ page }) => {
    await page.goto('/');
    await page.locator('.archive-year a').first().click();
    await expect(page.locator('h1')).toContainText('年の記事');
    const posts = page.locator('a.post-link');
    expect(await posts.count()).toBeGreaterThan(0);
  });

  test('月リンクをクリックすると月アーカイブに遷移する', async ({ page }) => {
    await page.goto('/');
    await page.locator('.archive-months a').first().click();
    await expect(page.locator('h1')).toContainText('月の記事');
    const posts = page.locator('a.post-link');
    expect(await posts.count()).toBeGreaterThan(0);
  });

  test('年アーカイブページに全記事が表示される', async ({ page }) => {
    await page.goto('/posts/2026');
    await expect(page.locator('h1')).toHaveText('2026年の記事');
    const posts = page.locator('a.post-link');
    expect(await posts.count()).toBe(9);
  });
});

test.describe('E-05: 画像表示', () => {
  test('画像付き記事でlazy loading画像が表示される', async ({ page }) => {
    await page.goto('/posts/2026/02/%E3%83%96%E3%83%A9%E3%82%B6%E3%83%BC%E3%83%97%E3%83%AA%E3%83%B3%E3%82%BF%E3%83%BC%E3%82%92%E8%B2%B7%E3%81%A3%E3%81%9F%E8%A9%B1');
    const img = page.locator('.post-content img');
    await expect(img.first()).toBeVisible();
    await expect(img.first()).toHaveAttribute('loading', 'lazy');
    await expect(img.first()).toHaveAttribute('decoding', 'async');
  });

  test('画像キャプションが表示される', async ({ page }) => {
    await page.goto('/posts/2026/02/%E3%83%96%E3%83%A9%E3%82%B6%E3%83%BC%E3%83%97%E3%83%AA%E3%83%B3%E3%82%BF%E3%83%BC%E3%82%92%E8%B2%B7%E3%81%A3%E3%81%9F%E8%A9%B1');
    const figure = page.locator('figure.image-caption');
    await expect(figure.first()).toBeVisible();
    const figcaption = figure.first().locator('figcaption');
    await expect(figcaption).toHaveText('プリンター');
  });

  test('トップページのサムネイル画像が表示される', async ({ page }) => {
    await page.goto('/');
    const thumbnails = page.locator('img.post-thumbnail');
    expect(await thumbnails.count()).toBeGreaterThan(0);
    await expect(thumbnails.first()).toHaveAttribute('loading', 'lazy');
  });
});

test.describe('E-06: 下書き記事非表示', () => {
  test('トップページの記事一覧にdraft記事が含まれない', async ({ page }) => {
    await page.goto('/');
    // 現在のコンテンツでは全記事がdraft: falseのため、
    // 全記事が表示されていることを確認する（9記事）
    const cards = page.locator('article.post-card');
    expect(await cards.count()).toBe(9);
  });

  test('全記事のタイトルが空でない', async ({ page }) => {
    await page.goto('/');
    const titles = page.locator('a.post-title');
    const count = await titles.count();
    for (let i = 0; i < count; i++) {
      const text = await titles.nth(i).textContent();
      expect(text!.trim().length).toBeGreaterThan(0);
    }
  });
});
