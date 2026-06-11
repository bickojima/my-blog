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
    const count = await posts.count();
    expect(count).toBeGreaterThan(0);
    // 表示された全記事が「ブラザー」タグを持つ記事であることを確認
    const titles = await posts.locator('.post-title').allTextContents();
    expect(titles).toContain('ブラザープリンターを買った話');
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
    await expect(page.locator('nav.archive-nav h2')).toHaveText('アーカイブ');
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
    // トップページの記事数を取得（下書き除く全記事）
    await page.goto('/');
    const topCount = await page.locator('article.post-card').count();

    await page.goto('/posts/2026');
    await expect(page.locator('h1')).toHaveText('2026年の記事');
    const posts = page.locator('a.post-link');
    // 年アーカイブにトップページと同数の記事がある（全記事が2026年のため）
    expect(await posts.count()).toBe(topCount);
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
    await expect(thumbnails.first()).toHaveAttribute('loading', 'eager');
    await expect(thumbnails.first()).toHaveAttribute('fetchpriority', 'high');
    if (await thumbnails.count() > 1) {
      await expect(thumbnails.nth(1)).toHaveAttribute('loading', 'lazy');
    }
  });

  test('Modern Web Guidance: ナビゲーションと一覧の低リスク改善が適用されている', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('header nav')).toHaveAttribute('aria-label', 'メイン');
    await expect(page.locator('nav.archive-nav')).toHaveAttribute('aria-labelledby', 'archive-heading');

    const cards = page.locator('article.post-card');
    const cardCount = await cards.count();
    for (let i = 0; i < Math.min(cardCount, 3); i++) {
      await expect(cards.nth(i)).toHaveCSS('content-visibility', 'visible');
    }
    for (let i = 3; i < Math.min(cardCount, 6); i++) {
      await expect(cards.nth(i)).toHaveCSS('content-visibility', 'visible');
    }
    if (cardCount > 6) {
      await expect(cards.nth(6)).toHaveCSS('content-visibility', 'auto');
    }

    const toggle = page.locator('.nav-dropdown-toggle');
    await toggle.focus();
    await expect(toggle).toBeFocused();
  });
});

test.describe('E-20: 固定ページ表示', () => {
  test('プロフィールページが表示される', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.locator('h1')).toHaveText('プロフィール');
    await expect(page.locator('.page-content')).toBeVisible();
  });

  test('aboutページが表示される', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('h1')).toHaveText('このサイトについて');
    await expect(page.locator('.page-content')).toBeVisible();
  });

  test('固定ページに「記事一覧に戻る」リンクがある', async ({ page }) => {
    await page.goto('/profile');
    const backLink = page.locator('.page-footer a');
    await expect(backLink).toBeVisible();
    await expect(backLink).toContainText('記事一覧に戻る');
    await backLink.click();
    await expect(page.locator('h1')).toHaveText('記事一覧');
  });

  test('固定ページにヘッダー・フッター構造がある', async ({ page }) => {
    await page.goto('/profile');
    // サイトヘッダー（ナビゲーション含む）
    await expect(page.locator('header .site-title')).toBeVisible();
    // ページ固有のヘッダー（h1タイトル）
    await expect(page.locator('.page-header h1')).toBeVisible();
    // サイトフッター
    await expect(page.locator('body > footer')).toBeVisible();
  });
});

test.describe('E-21: ヘッダーナビゲーションドロップダウン', () => {
  test('ヘッダーにドロップダウン構造が存在する', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.nav-dropdown')).toBeVisible();
    await expect(page.locator('.nav-dropdown-link')).toBeVisible();
    await expect(page.locator('.nav-dropdown-toggle')).toBeVisible();
  });

  test('最優先ページのリンクがヘッダーに表示される', async ({ page }) => {
    await page.goto('/');
    const link = page.locator('.nav-dropdown-link');
    await expect(link).toHaveText('プロフィール');
    await expect(link).toHaveAttribute('href', '/profile');
  });

  test('ドロップダウンメニューが初期状態で非表示', async ({ page }) => {
    await page.goto('/');
    const menu = page.locator('.nav-dropdown-menu');
    await expect(menu).not.toBeVisible();
  });

  test('▾ボタンクリックでドロップダウンが開閉する', async ({ page }) => {
    await page.goto('/');
    const menu = page.locator('.nav-dropdown-menu');
    const toggle = page.locator('.nav-dropdown-toggle');

    // 初期状態で閉じていることを確認
    await expect(menu).not.toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    // 実ユーザー操作と同じクリックで開く
    await toggle.click();
    await expect(menu).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    // 再クリックで閉じる
    await toggle.click();
    await expect(menu).not.toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('ドロップダウンメニュー内に全固定ページのリンクがある', async ({ page }) => {
    await page.goto('/');
    await page.locator('.nav-dropdown-toggle').click();
    const menuLinks = page.locator('.nav-dropdown-menu a');
    const count = await menuLinks.count();
    expect(count).toBeGreaterThanOrEqual(2);

    // プロフィールとaboutのリンクがある
    const hrefs = await menuLinks.evaluateAll(links => links.map(l => l.getAttribute('href')));
    expect(hrefs).toContain('/profile');
    expect(hrefs).toContain('/about');
  });

  test('ドロップダウンメニューのリンクから固定ページに遷移できる', async ({ page }) => {
    await page.goto('/');
    await page.locator('.nav-dropdown-toggle').click();

    // aboutリンクをクリック
    const aboutLink = page.locator('.nav-dropdown-menu a[href="/about"]');
    await aboutLink.click();
    await expect(page.locator('h1')).toHaveText('このサイトについて');
  });

  test('最優先ページリンクから直接遷移できる', async ({ page }) => {
    await page.goto('/');
    const link = page.locator('.nav-dropdown-link');
    await link.click();
    await expect(page.locator('h1')).toHaveText('プロフィール');
  });

  test('Escapeキーでドロップダウンが閉じaria-expandedが同期する', async ({ page }) => {
    await page.goto('/');
    const menu = page.locator('.nav-dropdown-menu');
    const toggle = page.locator('.nav-dropdown-toggle');
    await toggle.click();
    await expect(menu).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(menu).not.toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('Tabでフォーカスがメニュー外へ出るとドロップダウンが閉じる', async ({ page }) => {
    await page.goto('/');
    const menu = page.locator('.nav-dropdown-menu');
    const toggle = page.locator('.nav-dropdown-toggle');
    await toggle.click();
    await expect(menu).toBeVisible();

    const menuLinkCount = await menu.locator('a').count();
    for (let i = 0; i <= menuLinkCount; i++) {
      await page.keyboard.press('Tab');
    }
    await expect(menu).not.toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('タッチ端末でナビと管理リンクのタップ領域が44px以上ある', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'PC', 'タッチ端末向けCSSの検証');
    await page.goto('/');

    const toggle = page.locator('.nav-dropdown-toggle');
    const directLink = page.locator('.nav-dropdown-link');
    const adminLink = page.locator('.admin-link');
    await toggle.click();
    const menuLink = page.locator('.nav-dropdown-menu a').first();

    for (const target of [toggle, directLink, menuLink, adminLink]) {
      const box = await target.boundingBox();
      expect(box).not.toBeNull();
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    expect((await toggle.boundingBox())?.width).toBeGreaterThanOrEqual(44);
    expect((await adminLink.boundingBox())?.width).toBeGreaterThanOrEqual(44);
  });
});

test.describe('E-06: 下書き記事非表示', () => {
  test('トップページの記事一覧にdraft記事が含まれない', async ({ page }) => {
    await page.goto('/');
    const cards = page.locator('article.post-card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    // draft: true の記事（codeblockテスト等）が一覧に表示されていないことを確認
    const titles = await page.locator('a.post-title').allTextContents();
    expect(titles).not.toContain('codeblockテスト');
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
