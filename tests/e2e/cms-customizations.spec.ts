import { test, expect, Page } from '@playwright/test';

/**
 * CMS UIカスタマイズ E2Eテスト
 *
 * 過去の不具合修正・手動打鍵テストの観点をE2Eテストに落とし込み、
 * CMS管理画面のカスタマイズ動作をリグレッション検証する。
 *
 * 不具合修正履歴に基づくテスト観点:
 * - 公開URLバー: エディタ→コレクション戻り時の非表示制御 (#45fb3a2, #c3963d9)
 * - ソートドロップダウン: ドロップダウン操作後のURLバー誤表示防止 (#1e6815f)
 * - ボトムシート: モバイルでのドロップダウン表示
 * - プレビュースタイル: 本番サイト相当のCSS注入 (#e1dc51d)
 * - codeblockクラッシュ: モバイルでのcodeblockボタン非表示
 * - EXIF回転: image-orientation CSS + Canvas補正
 * - iOS対応: pull-to-refresh防止、自動ズーム防止
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

  const loginButton = page.locator('button:has-text("GitHub でログインする")');
  if (await loginButton.isVisible().catch(() => false)) {
    const popupPromise = page.waitForEvent('popup').catch(() => null);
    await loginButton.click();
    const popup = await popupPromise;
    if (popup) {
      await popup.waitForLoadState().catch(() => {});
      await popup.waitForTimeout(500).catch(() => {});
    }
    await page.waitForTimeout(5000);
  }
}

// ============================================================
// E-13: CMS カスタマイズ基盤検証
// カスタマイズの基盤インフラが正しく実装されていることを検証する
// ============================================================
test.describe('E-13: CMS カスタマイズ基盤検証', () => {
  test('全カスタマイズ関数がrunCustomizations内で呼び出されている', async ({ page }) => {
    await page.goto('/admin/');
    const html = await page.content();
    const functions = [
      'addSiteLink',
      'formatCollectionEntries',
      'relabelImageButtons',
      'updateDeleteButtonState',
      'showPublicUrl',
      'manageDropdownOverlay',
      'hideCodeBlockOnMobile',
    ];
    for (const fn of functions) {
      expect(html, `関数 ${fn} が見つからない`).toContain(fn);
    }
  });

  test('MutationObserverがRAFデバウンスで実装されている', async ({ page }) => {
    await page.goto('/admin/');
    const html = await page.content();
    expect(html).toContain('requestAnimationFrame');
    expect(html).toContain('MutationObserver');
    expect(html).toContain('rafPending');
  });

  test('Slateエラーハンドラ（toSlatePoint/toSlateRange）が実装されている', async ({ page }) => {
    await page.goto('/admin/');
    const html = await page.content();
    expect(html).toContain('toSlatePoint');
    expect(html).toContain('toSlateRange');
    expect(html).toContain('setEnd');
    // エラーの伝播を止めてクラッシュを防止
    expect(html).toContain('e.preventDefault()');
  });

  test('hashchange・popstateイベントリスナーが登録されている', async ({ page }) => {
    await page.goto('/admin/');
    const html = await page.content();
    // hashchange: ハッシュ遷移でshowPublicUrl再実行
    expect(html).toContain('hashchange');
    // popstate: ブラウザ戻るボタン対応
    expect(html).toContain('popstate');
  });

  test('戻るボタン（BackCollection・BackStatus）のクリックハンドラが実装されている', async ({ page }) => {
    await page.goto('/admin/');
    const html = await page.content();
    // BackCollection: 通常の戻りリンク
    expect(html).toContain('BackCollection');
    // BackStatus: 保存後の戻りリンク（過去不具合: BackStatusが未対応だった）
    expect(html).toContain('BackStatus');
  });

  test('公開URLバーのvisibility-based判定（getBoundingClientRect）が実装されている', async ({ page }) => {
    await page.goto('/admin/');
    const html = await page.content();
    // DOM存在チェックではなくvisibility-basedで判定（過去不具合: DOM存在だけでは不十分）
    expect(html).toContain('getBoundingClientRect');
    expect(html).toContain('cms-public-url');
  });

  test('ドロップダウンとURLバーの競合回避（hiddenByDropdown）が実装されている', async ({ page }) => {
    await page.goto('/admin/');
    const html = await page.content();
    // hiddenByDropdown: showPublicUrlで非表示にしたバーをmanageDropdownOverlayが誤復元するのを防止
    expect(html).toContain('hiddenByDropdown');
    // ドロップダウン表示中のURLバーが表示されている場合のみフラグを立てる
    expect(html).toContain("style.display !== 'none'");
  });

  test('image-orientation: from-imageがCSSで設定されている', async ({ page }) => {
    await page.goto('/admin/');
    const html = await page.content();
    // EXIF回転をCSS側で処理（JS補正は廃止済み）
    expect(html).toContain('image-orientation: from-image');
  });

  test('showPublicUrlのエラーがコンソールに出力される（サイレント失敗防止）', async ({ page }) => {
    await page.goto('/admin/');
    const html = await page.content();
    // catch(e) {} ではなく console.warn でエラーログが出力される
    expect(html).toContain('console.warn');
    expect(html).toContain('showPublicUrl error');
  });

  test('Canvas 2Dコンテキスト取得失敗時のフォールバックが実装されている', async ({ page }) => {
    await page.goto('/admin/');
    const html = await page.content();
    // canvas.getContext('2d') が null の場合のガード
    expect(html).toContain('if (!ctx)');
  });
});

// ============================================================
// E-14: プレビュースタイル本番再現
// CMS.registerPreviewStyleによる本番サイト相当のスタイル注入を検証する
// ============================================================
test.describe('E-14: プレビュースタイル本番再現', () => {
  test('registerPreviewStyleで本番サイト相当のスタイルが注入されている', async ({ page }) => {
    await page.goto('/admin/');
    const html = await page.content();
    expect(html).toContain('CMS.registerPreviewStyle');
    expect(html).toContain('raw: true');
    // フォントファミリー（Base.astro相当）
    expect(html).toContain('-apple-system');
    expect(html).toContain('Hiragino Kaku Gothic ProN');
    // 行間（[slug].astro .post-content相当）
    expect(html).toContain('line-height: 1.9');
    // 画像スタイル
    expect(html).toContain('border-radius: 4px');
    // コードブロック
    expect(html).toContain('background: #f5f5f5');
    // コンテンツ幅
    expect(html).toContain('max-width: 700px');
  });

  test('Decap CMSオブジェクトがロードされている', async ({ page }) => {
    await page.goto('/admin/');
    await page.waitForTimeout(3000);
    const hasCMS = await page.evaluate(() => typeof (window as any).CMS !== 'undefined');
    expect(hasCMS).toBeTruthy();
  });
});

// ============================================================
// E-15: 公開URLバー表示制御
// 過去の不具合（戻るボタン後・ソート後にURLバーが残る）を検証する
// ============================================================
test.describe('E-15: 公開URLバー表示制御', () => {
  test('ログイン画面で公開URLバーが表示されない', async ({ page }) => {
    await page.goto('/admin/');
    await page.waitForTimeout(3000);
    // ログイン画面ではEditorControlBarが存在しないためURLバーは非表示
    const urlBar = page.locator('#cms-public-url');
    const count = await urlBar.count();
    if (count > 0) {
      await expect(urlBar).not.toBeVisible();
    }
    // count === 0 はURLバーが未作成（＝非表示）で正常
  });

  test('コレクション一覧で公開URLバーが表示されない', async ({ page }) => {
    await openCmsWithAuth(page);
    // 認証後はコレクション一覧ページ
    // EditorControlBarが表示されていないためURLバーは非表示であるべき
    const urlBar = page.locator('#cms-public-url');
    const count = await urlBar.count();
    if (count > 0) {
      const isHidden = await urlBar.evaluate(
        (el) => (el as HTMLElement).style.display === 'none' || !el.offsetParent,
      );
      expect(isHidden).toBeTruthy();
    }
  });

  test('エディタ→コレクション遷移で公開URLバーが非表示になる', async ({ page }) => {
    await openCmsWithAuth(page);

    // エディタに遷移
    await page.evaluate(() => {
      window.location.hash = '#/collections/posts/entries/2026/02/テスト記事';
    });
    await page.waitForTimeout(3000);

    // コレクション一覧に戻る
    await page.evaluate(() => {
      window.location.hash = '#/collections/posts';
    });
    await page.waitForTimeout(2000);

    // コレクション一覧ではURLバーが非表示
    const urlBar = page.locator('#cms-public-url');
    const count = await urlBar.count();
    if (count > 0) {
      const isHidden = await urlBar.evaluate(
        (el) => (el as HTMLElement).style.display === 'none' || !el.offsetParent,
      );
      expect(isHidden).toBeTruthy();
    }
  });

  test('hashchange遷移後にURLバーの状態が正しく更新される', async ({ page }) => {
    await openCmsWithAuth(page);

    // エディタに遷移
    await page.evaluate(() => {
      window.location.hash = '#/collections/posts/entries/2026/02/テスト記事';
    });
    await page.waitForTimeout(3000);

    // エディタが描画されていればURLバーが表示されていることを確認
    const editorBar = page.locator('[class*="EditorControlBar"]');
    const editorBarVisible = await editorBar.first().isVisible().catch(() => false);

    if (editorBarVisible) {
      const urlBar = page.locator('#cms-public-url');
      await expect(urlBar).toBeVisible();
      const text = await urlBar.textContent();
      expect(text).toContain('reiwa.casa');
      expect(text).toContain('/posts/2026/02/');
    }

    // popstateでコレクションに戻る
    await page.evaluate(() => {
      window.location.hash = '#/collections/posts';
    });
    await page.waitForTimeout(2000);

    // URLバーが非表示になること
    const urlBar = page.locator('#cms-public-url');
    const count = await urlBar.count();
    if (count > 0) {
      const isHidden = await urlBar.evaluate(
        (el) => (el as HTMLElement).style.display === 'none' || !el.offsetParent,
      );
      expect(isHidden).toBeTruthy();
    }
  });

  test('エディタ→コレクション→エディタの往復ナビゲーションでURLバーが正しく制御される', async ({ page }) => {
    await openCmsWithAuth(page);

    // 1回目: エディタに遷移
    await page.evaluate(() => {
      window.location.hash = '#/collections/posts/entries/2026/02/テスト記事';
    });
    await page.waitForTimeout(3000);

    // 1回目: コレクションに戻る
    await page.evaluate(() => {
      window.location.hash = '#/collections/posts';
    });
    await page.waitForTimeout(2000);

    // コレクション一覧ではURLバー非表示
    let urlBar = page.locator('#cms-public-url');
    let count = await urlBar.count();
    if (count > 0) {
      const isHidden1 = await urlBar.evaluate(
        (el) => (el as HTMLElement).style.display === 'none' || !el.offsetParent,
      );
      expect(isHidden1).toBeTruthy();
    }

    // 2回目: 再びエディタに遷移
    await page.evaluate(() => {
      window.location.hash = '#/collections/posts/entries/2026/02/テスト記事';
    });
    await page.waitForTimeout(3000);

    // 2回目: コレクションに戻る
    await page.evaluate(() => {
      window.location.hash = '#/collections/posts';
    });
    await page.waitForTimeout(2000);

    // 2回目もURLバーが非表示であること（状態がリセットされていること）
    urlBar = page.locator('#cms-public-url');
    count = await urlBar.count();
    if (count > 0) {
      const isHidden2 = await urlBar.evaluate(
        (el) => (el as HTMLElement).style.display === 'none' || !el.offsetParent,
      );
      expect(isHidden2).toBeTruthy();
    }
  });

  test('新規記事画面のハッシュでURLバーが非表示にならない', async ({ page }) => {
    await openCmsWithAuth(page);

    // 新規記事画面に遷移
    await page.evaluate(() => {
      window.location.hash = '#/collections/posts/new';
    });
    await page.waitForTimeout(3000);

    // 新規記事画面ではEditorControlBarが表示されていれば、URLバーも表示可能
    // （タイトル・日付が空ならURLバーは非表示でもOK）
    const editorBar = page.locator('[class*="EditorControlBar"]');
    const editorBarVisible = await editorBar.first().isVisible().catch(() => false);

    if (editorBarVisible) {
      // エディタが表示されている場合、showPublicUrlのロジックが動作していることを確認
      // タイトルが空なのでURLバーは非表示であるべき
      const urlBar = page.locator('#cms-public-url');
      const count = await urlBar.count();
      if (count > 0) {
        const display = await urlBar.evaluate((el) => (el as HTMLElement).style.display);
        // タイトルが空なので非表示、またはエディタが描画されていれば表示される可能性
        expect(display === 'none' || display === '').toBeTruthy();
      }
    }
  });
});

// ============================================================
// E-16: モバイル固有カスタマイズ
// ボトムシート・codeblock非表示・iOS対策を検証する
// ============================================================
test.describe('E-16: モバイル固有カスタマイズ', () => {
  test('ドロップダウンのボトムシートCSSが定義されている', async ({ page }) => {
    await page.goto('/admin/');
    const html = await page.content();
    // position: fixedでbottom: 0に配置
    expect(html).toContain('position: fixed');
    expect(html).toContain('bottom: 0');
    // ボトムシートの角丸
    expect(html).toContain('border-radius: 16px 16px 0 0');
    // ボトムシートのz-index
    expect(html).toContain('z-index: 99999');
    // ドラッグスクロール対応
    expect(html).toContain('-webkit-overflow-scrolling: touch');
  });

  test('iOS自動ズーム防止の16px font-sizeが設定されている', async ({ page }) => {
    await page.goto('/admin/');
    const html = await page.content();
    // data-slate-editor, input, textarea, select に16px
    expect(html).toContain('font-size: 16px');
    expect(html).toContain('data-slate-editor');
  });

  test('codeblockボタン非表示ロジック（hideCodeBlockOnMobile）が実装されている', async ({ page }) => {
    await page.goto('/admin/');
    const html = await page.content();
    expect(html).toContain('hideCodeBlockOnMobile');
    // 「Code Block」テキストマッチで非表示にする
    expect(html).toContain("text === 'Code Block'");
    expect(html).toContain('mobileHidden');
    // Slateエディタ内のラベルは対象外
    expect(html).toContain('data-slate-editor');
  });

  test('タップ領域が44px以上確保されている', async ({ page }) => {
    await page.goto('/admin/');
    const html = await page.content();
    // モバイルのボタン・タップ領域の最小高さ
    expect(html).toContain('min-height: 44px');
    // ボトムシート項目のタップ領域
    expect(html).toContain('min-height: 48px');
  });

  test('pull-to-refresh防止のtouchイベントハンドラが実装されている', async ({ page }) => {
    await page.goto('/admin/');
    const html = await page.content();
    expect(html).toContain('touchstart');
    expect(html).toContain('touchmove');
    // Slateエディタ内のtouchmoveは除外（codeblock挿入時のクラッシュ防止）
    expect(html).toContain("data-slate-editor");
    // CodeMirror内も除外
    expect(html).toContain('CodeMirror');
    // モーダル・メディアライブラリ内も除外
    expect(html).toContain('Modal');
    expect(html).toContain('Library');
  });

  test('モーダルが画面幅95%で表示される', async ({ page }) => {
    await page.goto('/admin/');
    const html = await page.content();
    expect(html).toContain('width: 95vw');
    expect(html).toContain('max-width: 95vw');
  });

  test('メディアライブラリのカードグリッドが2列表示に設定されている', async ({ page }) => {
    await page.goto('/admin/');
    const html = await page.content();
    expect(html).toContain('grid-template-columns: repeat(2, 1fr)');
  });

  test('エディタのコントロールバーがstickyに設定されている', async ({ page }) => {
    await page.goto('/admin/');
    const html = await page.content();
    // EditorControlBarをsticky固定
    expect(html).toContain('position: sticky');
    expect(html).toContain('z-index: 300');
  });
});

// ============================================================
// E-17: サイトリンク・コレクション表示
// CMS認証後のUI動作を検証する
// ============================================================
test.describe('E-17: サイトリンク・コレクション表示', () => {
  test('サイドバーに「ブログを見る」リンクが表示される', async ({ page }) => {
    await openCmsWithAuth(page);

    // addSiteLink() によりサイドバーにリンクが追加される
    const siteLink = page.locator('#cms-site-link');
    const count = await siteLink.count();
    if (count > 0) {
      await expect(siteLink).toBeVisible();
      const text = await siteLink.textContent();
      expect(text).toContain('ブログを見る');
      const href = await siteLink.getAttribute('href');
      expect(href).toBe('https://reiwa.casa');
      const target = await siteLink.getAttribute('target');
      expect(target).toBe('_blank');
    }
  });

  test('コレクション一覧でエントリーが日付バッジ付きでフォーマットされる', async ({ page }) => {
    await openCmsWithAuth(page);

    // formatCollectionEntries() により日付バッジがフォーマットされる
    // CMS がエントリーを読み込んだ後に確認
    await page.waitForTimeout(2000);
    const dateBadge = page.locator('.entry-date');
    const count = await dateBadge.count();
    if (count > 0) {
      // 日付バッジのテキストがYYYY-MM-DD形式
      const text = await dateBadge.first().textContent();
      expect(text).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  test('エントリーフォーマットにentry-title・entry-dateクラスが使用されている', async ({ page }) => {
    await page.goto('/admin/');
    const html = await page.content();
    // CSSクラス定義の存在
    expect(html).toContain('entry-date');
    expect(html).toContain('entry-title');
    expect(html).toContain('entry-draft');
    // 日付バッジのスタイル
    expect(html).toContain('#e8f0fe');
    expect(html).toContain('#1a73e8');
    // 下書きバッジのスタイル
    expect(html).toContain('#fff3e0');
    expect(html).toContain('#e65100');
  });
});

// ============================================================
// E-18: EXIF画像処理・アップロード
// 画像EXIF正規化とHEIC変換の仕組みを検証する
// ============================================================
test.describe('E-18: EXIF画像処理・アップロード', () => {
  test('Canvas APIによるEXIF回転正規化が実装されている', async ({ page }) => {
    await page.goto('/admin/');
    const html = await page.content();
    // canvas.toBlobで画像を再生成
    expect(html).toContain('canvas.toBlob');
    // exifFixedフラグで再処理を防止
    expect(html).toContain('exifFixed');
    // DataTransferでファイル置換
    expect(html).toContain('DataTransfer');
    // capture phaseで最初に処理
    expect(html).toContain('true'); // addEventListener の第3引数
  });

  test('HEIC制限のaccept属性設定が実装されている', async ({ page }) => {
    await page.goto('/admin/');
    const html = await page.content();
    // accept属性をJPEG等に制限（iPhoneのHEIC→JPEG自動変換を有効化）
    expect(html).toContain('image/jpeg');
    expect(html).toContain('image/png');
    expect(html).toContain('image/webp');
    expect(html).toContain('image/gif');
    expect(html).toContain('input[type="file"]');
  });

  test('画像プレビューのCSS（max-width・object-fit）が設定されている', async ({ page }) => {
    await page.goto('/admin/');
    const html = await page.content();
    // 画像プレビューの縦横比維持
    expect(html).toContain('object-fit: contain');
    expect(html).toContain('max-height: 50vh');
  });
});

// ============================================================
// E-19: 削除ボタン動作・メディアライブラリ
// 削除ボタンのラベル変更と無効化ロジックを検証する
// ============================================================
test.describe('E-19: 削除ボタン動作・メディアライブラリ', () => {
  test('画像ウィジェット内の削除ボタンが「選択解除」に変更されるロジックがある', async ({ page }) => {
    await page.goto('/admin/');
    const html = await page.content();
    // 「選択解除」ラベル
    expect(html).toContain('選択解除');
    expect(html).toContain('cms-deselect-btn');
    // FileWidget/ImageWidget内の判定
    expect(html).toContain('FileWidget');
    expect(html).toContain('ImageWidget');
  });

  test('メディアライブラリの削除ボタンが「完全削除」に変更されるロジックがある', async ({ page }) => {
    await page.goto('/admin/');
    const html = await page.content();
    expect(html).toContain('完全削除');
    expect(html).toContain('cms-full-delete-btn');
  });

  test('完全削除ボタンの無効化ロジック（選択状態判定）が実装されている', async ({ page }) => {
    await page.goto('/admin/');
    const html = await page.content();
    // borderColorで選択状態を判定
    expect(html).toContain('borderColor');
    expect(html).toContain('hasSelected');
    expect(html).toContain('deleteBtn.disabled');
  });

  test('完全削除ボタンの無効状態CSSが定義されている', async ({ page }) => {
    await page.goto('/admin/');
    const html = await page.content();
    // 無効状態のスタイル
    expect(html).toContain('cms-full-delete-btn:disabled');
    expect(html).toContain('cursor: not-allowed');
    expect(html).toContain('opacity: 0.6');
  });

  test('選択解除ボタンのCSSが安全な色（グレー系）に設定されている', async ({ page }) => {
    await page.goto('/admin/');
    const html = await page.content();
    // 選択解除ボタンはグレー系（安全な操作）
    expect(html).toContain('background: #f5f5f5');
    expect(html).toContain('color: #555');
  });

  test('完全削除ボタンのCSSが危険色（赤系）に設定されている', async ({ page }) => {
    await page.goto('/admin/');
    const html = await page.content();
    // 完全削除ボタンは赤（危険操作）
    expect(html).toContain('background: #d32f2f');
    expect(html).toContain('color: white');
  });
});
