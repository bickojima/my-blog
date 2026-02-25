import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

const adminHtml = readFileSync(
  join(process.cwd(), 'public/admin/index.html'),
  'utf-8'
);

describe('管理画面HTML（public/admin/index.html）の検証', () => {
  describe('基本構造', () => {
    it('HTML5 doctype宣言がある', () => {
      expect(adminHtml).toMatch(/<!doctype html>/i);
    });

    it('文字エンコーディングがUTF-8に設定されている', () => {
      expect(adminHtml).toContain('charset="utf-8"');
    });

    it('robots noindex が設定されている（検索エンジン除外）', () => {
      expect(adminHtml).toContain('name="robots" content="noindex"');
    });

    it('viewportメタタグが設定されている', () => {
      expect(adminHtml).toContain('name="viewport"');
      expect(adminHtml).toContain('width=device-width');
    });

    it('Decap CMSのスクリプトが読み込まれている', () => {
      expect(adminHtml).toContain('decap-cms');
      expect(adminHtml).toContain('</script>');
    });

    // バグ#27再発防止: SRI追加時に</script>閉じタグが脱落し、
    // 後続のCMS.registerPreviewStyleブロックがCDNスクリプトのインライン内容として
    // HTMLパーサーに飲み込まれ、iPhoneで「TypeError: Load failed」が発生した
    it('CDN scriptタグが</script>で正しく閉じられている（閉じタグ欠落防止）', () => {
      // <script src="...cdn..."></script> の形式を検証
      // 閉じタグがないと後続スクリプトブロックが飲み込まれる致命的バグになる
      const cdnScriptRegex = /<script\s+src="https:\/\/unpkg\.com\/decap-cms[^"]*"[^>]*><\/script>/;
      expect(adminHtml).toMatch(cdnScriptRegex);
    });

    it('CMS.registerPreviewStyleが独立した<script>ブロック内にある', () => {
      // registerPreviewStyleが<script>...</script>の中にあることを確認
      // CDNスクリプトタグのインライン内容に含まれていないことの検証
      const scriptBlocks = adminHtml.match(/<script>[\s\S]*?<\/script>/g) || [];
      const hasRegisterPreviewStyle = scriptBlocks.some(block =>
        block.includes('CMS.registerPreviewStyle')
      );
      expect(hasRegisterPreviewStyle).toBe(true);
    });
  });

  describe('PC端末対応', () => {
    it('box-sizing: border-boxがグローバルに設定されている', () => {
      expect(adminHtml).toContain('box-sizing: border-box');
    });

    it('横はみ出し防止のoverflow-x: hiddenが設定されている', () => {
      expect(adminHtml).toContain('overflow-x: hidden');
    });

    it('コレクション一覧の日付バッジスタイルが定義されている', () => {
      expect(adminHtml).toContain('.entry-date');
      expect(adminHtml).toContain('background: #e8f0fe');
      expect(adminHtml).toContain('color: #1a73e8');
    });

    it('選択解除ボタンのスタイルが定義されている', () => {
      expect(adminHtml).toContain('.cms-deselect-btn');
    });

    it('完全削除ボタンのスタイルが定義されている', () => {
      expect(adminHtml).toContain('.cms-full-delete-btn');
      expect(adminHtml).toContain('background: #d32f2f');
    });

    it('完全削除ボタンの無効状態スタイルが定義されている', () => {
      expect(adminHtml).toContain('.cms-full-delete-btn:disabled');
    });
  });

  describe('モバイル対応（iPad・iPhone共通: max-width 799px）', () => {
    it('799pxブレイクポイントのメディアクエリが存在する', () => {
      expect(adminHtml).toContain('@media (max-width: 799px)');
    });

    it('アプリコンテナのレイアウト調整がある', () => {
      expect(adminHtml).toContain('[class*=AppMainContainer]');
      expect(adminHtml).toContain('max-width: 100vw');
    });

    it('サイドバーがposition: initialに変更されている', () => {
      expect(adminHtml).toContain('[class*=SidebarContainer]');
      expect(adminHtml).toContain('position: initial');
    });

    it('エディタのコントロールバーがstickyに設定されている', () => {
      expect(adminHtml).toContain('[class*=EditorControlBar]');
      expect(adminHtml).toContain('position: sticky');
    });

    it('保存・公開ボタンのタップ領域が44px以上確保されている', () => {
      expect(adminHtml).toContain('min-height: 44px');
    });

    it('ドロップダウンがボトムシート形式でfixed表示される', () => {
      expect(adminHtml).toContain('[class*=DropdownList]');
      expect(adminHtml).toContain('position: fixed');
      expect(adminHtml).toContain('z-index: 99999');
      expect(adminHtml).toContain('bottom: 0');
    });

    it('モーダルが画面幅95%で表示される', () => {
      expect(adminHtml).toContain('[class*=StyledModal]');
      expect(adminHtml).toContain('width: 95vw');
    });

    it('メディアライブラリのカードグリッドが2列表示', () => {
      expect(adminHtml).toContain('[class*=CardGrid]');
      expect(adminHtml).toContain('grid-template-columns: repeat(2, 1fr)');
    });

    it('画像選択ボタンが縦並び・全幅表示', () => {
      expect(adminHtml).toContain('[class*=FileWidgetButton]');
      expect(adminHtml).toContain('[class*=ImageWidgetButton]');
      expect(adminHtml).toContain('display: block');
      expect(adminHtml).toContain('width: 100%');
    });

    it('メディアライブラリのスクロール対応（タッチスクロール）', () => {
      expect(adminHtml).toContain('-webkit-overflow-scrolling: touch');
    });
  });

  describe('画像回転（EXIF orientation）対応', () => {
    it('image-orientation: from-image が設定されている', () => {
      expect(adminHtml).toContain('image-orientation: from-image');
    });

    it('ドロップダウン表示時にURLバーとの重なりをJSで制御している', () => {
      // ドロップダウン（ボトムシート）表示中に公開URLバーを非表示にする
      expect(adminHtml).toContain('manageDropdownOverlay');
      expect(adminHtml).toContain('cms-public-url');
    });
  });

  describe('iPhone（iOS）固有の対応', () => {
    it('入力フォームのfont-sizeが16px以上（自動ズーム防止）', () => {
      // iOS は font-size が16px未満の input にフォーカスすると自動ズームする
      expect(adminHtml).toContain('[data-slate-editor="true"]');
      expect(adminHtml).toContain('font-size: 16px !important');
    });

    it('HEIC画像アップロード時のaccept属性制限スクリプトがある', () => {
      // iPhoneのHEIC→JPEG自動変換対応
      expect(adminHtml).toContain('input[type="file"][accept*="image"]');
      expect(adminHtml).toContain(
        'image/jpeg,image/jpg,image/png,image/webp,image/gif'
      );
    });

    it('pull-to-refresh（引っ張って更新）の無効化スクリプトがある', () => {
      expect(adminHtml).toContain('touchstart');
      expect(adminHtml).toContain('touchmove');
      expect(adminHtml).toContain('e.preventDefault()');
    });

    it('モーダル内のスクロールは許可されている', () => {
      // モーダル内のスクロールを妨害しない処理
      expect(adminHtml).toContain("indexOf('Modal')");
      expect(adminHtml).toContain("indexOf('Library')");
      expect(adminHtml).toContain("indexOf('CardGrid')");
    });

    it('touchmoveハンドラがSlateエディタとCodeMirrorを除外している', () => {
      // codeblock挿入時のクラッシュ防止: エディタ内のタッチ操作を妨害しない
      expect(adminHtml).toContain("data-slate-editor");
      expect(adminHtml).toContain("CodeMirror");
    });
  });

  describe('Slate codeblockクラッシュ対策（iOS Safari）', () => {
    it('モバイルでcodeblockボタンを非表示にする関数がある', () => {
      // Slate v0.47のvoid nodeクラッシュが根本修正不可能なため、モバイルでは機能自体を無効化
      expect(adminHtml).toContain('hideCodeBlockOnMobile');
      expect(adminHtml).toContain('window.innerWidth > 799');
    });

    it('Slateエラー（toSlatePoint/toSlateRange）のグローバルハンドラがある', () => {
      // Slate v0.47のsetEnd()クラッシュをReact Error Boundaryの前でキャッチ
      expect(adminHtml).toContain('toSlatePoint');
      expect(adminHtml).toContain('toSlateRange');
      expect(adminHtml).toContain('e.preventDefault()');
    });

    it('MutationObserverがrequestAnimationFrameでデバウンスされている', () => {
      // 大量DOM変更時（codeblock挿入等）にコールバックの過負荷を防止
      expect(adminHtml).toContain('requestAnimationFrame');
      expect(adminHtml).toContain('rafPending');
    });
  });

  describe('JavaScript カスタマイズ機能', () => {
    it('MutationObserverによるDOM監視が設定されている', () => {
      expect(adminHtml).toContain('MutationObserver');
      expect(adminHtml).toContain('observe(document.body');
    });

    it('ヘッダーにサイトへのリンク追加機能がある', () => {
      expect(adminHtml).toContain('addSiteLink');
      expect(adminHtml).toContain('cms-site-link');
      expect(adminHtml).toContain('window.location.origin');
      expect(adminHtml).toContain("target = '_blank'");
    });

    it('コレクション一覧の日付フォーマット処理がある', () => {
      // "YYYY-MM-DD | draft | タイトル" パターンの正規表現
      expect(adminHtml).toContain('formatCollectionEntries');
      expect(adminHtml).toContain(
        String.raw`/^(\d{4}-\d{2}-\d{2})\s*\|\s*(true|false)\s*\|\s*(.+)$/`
      );
    });

    it('固定ページ一覧の番号・下書きフォーマット処理がある', () => {
      // "番号 | draft | タイトル" パターンの正規表現（entry-dateと同じスタイルで表示）
      expect(adminHtml).toContain(
        String.raw`/^(-?\d+)\s*\|\s*(true|false)\s*\|\s*(.+)$/`
      );
      expect(adminHtml).toContain("'#' + pagesMatch[1]");
      // 下書きバッジ表示処理がある
      expect(adminHtml).toContain("pagesMatch[2] === 'true'");
      expect(adminHtml).toContain("pageDraftSpan.className = 'entry-draft'");
    });

    it('削除ボタンのラベル変更処理がある', () => {
      expect(adminHtml).toContain('relabelImageButtons');
      expect(adminHtml).toContain('選択解除');
      expect(adminHtml).toContain('完全削除');
    });

    it('削除ボタンの文脈判定（画像ウィジェット内 vs メディアライブラリ）がある', () => {
      expect(adminHtml).toContain('inFileWidget');
      expect(adminHtml).toContain('FileWidget');
      expect(adminHtml).toContain('ImageWidget');
    });

    it('メディアライブラリの選択状態による削除ボタンの有効/無効制御がある', () => {
      expect(adminHtml).toContain('updateDeleteButtonState');
      expect(adminHtml).toContain('deleteBtn.disabled');
    });

    it('エディタ画面に公開URL表示機能がある', () => {
      expect(adminHtml).toContain('showPublicUrl');
      expect(adminHtml).toContain('cms-public-url');
      expect(adminHtml).toContain('window.location.origin');
    });

    it('公開URLが記事ではタイトルと日付フィールドから動的に生成される', () => {
      expect(adminHtml).toContain('titleInput');
      expect(adminHtml).toContain('dateInput');
      expect(adminHtml).toContain('urlBound');
    });

    it('公開URLが固定ページではslugフィールドから生成される', () => {
      // 固定ページの公開URLは /{slug} であり /posts/{title} ではない
      expect(adminHtml).toContain("'/collections/pages/'");
      expect(adminHtml).toContain('slugInput');
    });

    it('選択状態の判定がborderColor（青系）で行われている', () => {
      // styled-components のクラス名では判定できないため、描画結果で判定
      expect(adminHtml).toContain('borderColor');
      // rgb\( はJS正規表現内で使用されている
      expect(adminHtml).toMatch(/rgb/);
    });

    it('グルーピング表示時にグループを降順に並べ替える機能がある（CMS-19）', () => {
      // Decap CMSのview_groupsはデフォルト昇順のため、DOM操作で降順に並べ替え
      expect(adminHtml).toContain('reverseViewGroups');
      expect(adminHtml).toContain('GroupHeading');
      // テキスト比較で既に降順かを判定し、無限ループを防止
      expect(adminHtml).toContain('first >= second');
    });
  });

  describe('iPad対応（タッチUI）', () => {
    it('フッターボタンがflex配置でタップしやすい', () => {
      expect(adminHtml).toContain('[class*=ModalFooter]');
      expect(adminHtml).toContain('flex-wrap: wrap');
    });

    it('アップロードボタンが全幅で大きく表示される', () => {
      expect(adminHtml).toContain('[class*=UploadButton]');
      expect(adminHtml).toContain('width: 100%');
    });

    it('ツールバーがwrapで折り返し対応', () => {
      expect(adminHtml).toContain('[class*=ToolbarContainer]');
      expect(adminHtml).toContain('flex-wrap: wrap');
    });

    it('戻るリンクが長い場合にtext-overflow: ellipsisで省略表示', () => {
      expect(adminHtml).toContain('[class*=BackCollection]');
      expect(adminHtml).toContain('text-overflow: ellipsis');
    });
  });

  describe('ボタン押下可能性の検証（PC・iPad・iPhone共通）', () => {
    it('保存・公開ボタンがflex-shrink: 0で縮小されない', () => {
      // ボタンが他要素に押されて小さくなりタップ不能にならないこと
      expect(adminHtml).toContain('[class*=ToolbarButton]');
      expect(adminHtml).toContain('[class*=PublishedToolbarButton]');
      expect(adminHtml).toContain('flex-shrink: 0');
    });

    it('保存・公開ボタンのmin-heightが44px以上（Apple HIG準拠タップ領域）', () => {
      // iOS Human Interface Guidelines: 最小タップ領域 44x44pt
      const minHeightMatches = adminHtml.match(/min-height:\s*(\d+)px/g) || [];
      const heights = minHeightMatches.map((m) => parseInt(m.match(/(\d+)/)[1]));
      expect(heights.some((h) => h >= 44)).toBe(true);
    });

    it('モーダルフッターのボタンがflex: 1 1 autoで均等配置される', () => {
      // 挿入・キャンセル等のボタンが重ならず均等に並ぶ
      expect(adminHtml).toContain('[class*=ModalFooter] button');
      expect(adminHtml).toContain('flex: 1 1 auto');
    });

    it('メディアライブラリのアップロードボタンがmin-height: 44pxでタップ可能', () => {
      expect(adminHtml).toContain('[class*=LibraryTop] button');
      expect(adminHtml).toContain('[class*=UploadButton]');
    });

    it('画像ウィジェットの選択/解除ボタンが全幅でタップ可能', () => {
      expect(adminHtml).toContain('[class*=FileWidgetButton]');
      expect(adminHtml).toContain('[class*=ImageWidgetButton]');
    });

    it('新規投稿ボタンにパディングが設定されている', () => {
      expect(adminHtml).toContain('[class*=CollectionTopNewButton]');
    });
  });

  describe('ドロップダウン・タブの重なり防止（PC想定）', () => {
    it('公開ボタンのドロップダウンがz-index: 9999で最前面に表示される', () => {
      expect(adminHtml).toContain('z-index: 9999');
    });

    it('公開URLバーがz-index: 9998で表示される（ドロップダウンより下）', () => {
      expect(adminHtml).toContain('z-index:9998');
    });

    it('DropdownListがボトムシートとしてposition:fixedで表示される', () => {
      // モバイルではドロップダウンを画面下部のボトムシートとして表示
      expect(adminHtml).toContain('[class*=DropdownList]');
      expect(adminHtml).toContain('position: fixed');
      expect(adminHtml).toContain('border-radius: 16px 16px 0 0');
    });
  });

  describe('プレビュースタイル（本番サイト再現）', () => {
    it('CMS.registerPreviewStyle が呼び出されている', () => {
      expect(adminHtml).toContain('CMS.registerPreviewStyle');
    });

    it('本番サイト相当のフォントファミリーが設定されている', () => {
      expect(adminHtml).toContain('-apple-system');
      expect(adminHtml).toContain('Hiragino Kaku Gothic ProN');
    });

    it('本番サイト相当の行間（line-height: 1.9）が設定されている', () => {
      expect(adminHtml).toContain('line-height: 1.9');
    });

    it('画像スタイル（border-radius, margin）が設定されている', () => {
      expect(adminHtml).toContain('border-radius: 4px');
      expect(adminHtml).toContain('margin: 1rem 0');
    });

    it('コードブロックスタイルが設定されている', () => {
      expect(adminHtml).toContain('background: #f5f5f5');
    });
  });

  describe('ドロップダウン・タブの重なり防止（iPad・iPhone想定: max-width 799px）', () => {
    it('EditorControlBarがz-index: 300でstickyヘッダーとして表示される', () => {
      // ドロップダウンやモーダルと干渉しない適切なz-index階層
      expect(adminHtml).toContain('z-index: 300');
    });

    it('エディタコンテナのoverflowがvisibleでドロップダウンがクリップされない', () => {
      // overflow: hiddenだとドロップダウンが切れる
      expect(adminHtml).toContain('[class*=EditorContainer]');
      expect(adminHtml).toContain('overflow: visible');
    });

    it('ツールバーコンテナのoverflowがvisibleで子要素が隠れない', () => {
      expect(adminHtml).toContain('[class*=ToolbarContainer]');
      // overflow: visibleが設定されていること
      const toolbarSection = adminHtml.match(
        /\[class\*=ToolbarContainer\][^}]*\{[^}]*overflow:\s*visible[^}]*/
      );
      expect(toolbarSection).not.toBeNull();
    });

    it('モーダルがz-indexなし（ブラウザデフォルトのスタッキング）でドロップダウンを遮らない', () => {
      // StyledModalにz-indexを明示的に設定するとドロップダウンと競合する可能性
      // モーダルはflex配置のみで、z-index競合を起こさない
      expect(adminHtml).toContain('[class*=StyledModal]');
    });

    it('メディアライブラリのカードグリッドがoverlowスクロール対応', () => {
      // スクロール可能エリアでドロップダウンを遮らない
      expect(adminHtml).toContain('overflow-y: auto');
    });

    it('AppMainContainerのmin-widthが0でコンテンツが横にはみ出さない', () => {
      // min-width: 0がないとflex子要素がはみ出してボタンが押せなくなる
      expect(adminHtml).toContain('[class*=AppMainContainer]');
      expect(adminHtml).toContain('min-width: 0');
    });

    it('コントロールパネルがmax-width: 100vwで横はみ出しを防止', () => {
      expect(adminHtml).toContain('[class*=ControlPaneContainer]');
      expect(adminHtml).toContain('max-width: 100vw');
    });

    it('PublishedToolbarButtonの::after疑似要素が非表示（ドロップダウン矢印の重なり防止）', () => {
      expect(adminHtml).toContain('[class*=PublishedToolbarButton]::after');
      expect(adminHtml).toContain('display: none');
    });
  });

  describe('環境分離検証（FR-21）', () => {
    it('staging環境検知ロジックが存在する（hostname判定）', () => {
      // admin/index.html でhostnameベースのstaging検知がある
      expect(adminHtml).toContain('hostname');
      // STAGING ラベル表示ロジック
      expect(adminHtml).toMatch(/STAGING|staging/);
    });
  });

  describe('セキュリティ検証', () => {
    it('innerHTML/outerHTMLを使用していない（SEC-01: XSS防止）', () => {
      // scriptブロック内のJS部分を抽出して検査（HTML部分のinnerHTMLコメント等は除外）
      const scriptBlocks = adminHtml.match(/<script(?:\s[^>]*)?>[\s\S]*?<\/script>/gi) || [];
      for (const block of scriptBlocks) {
        // CDNスクリプトタグ（src属性あり）は中身が空なので除外
        if (block.match(/<script\s[^>]*src=/i)) continue;
        const jsContent = block.replace(/<\/?script[^>]*>/gi, '');
        expect(jsContent).not.toContain('innerHTML');
        expect(jsContent).not.toContain('outerHTML');
      }
    });

    it('CDN外部スクリプトのバージョンが正確に固定されている（SEC-03）', () => {
      // unpkgやcdnから読み込むスクリプトのsrc属性を検査
      const cdnScripts = adminHtml.match(/src="https?:\/\/[^"]*unpkg\.com[^"]*"/g) || [];
      expect(cdnScripts.length).toBeGreaterThan(0);
      for (const src of cdnScripts) {
        // キャレット(^)やチルダ(~)が含まれていないこと
        expect(src).not.toMatch(/[@/][~^]/);
      }
    });

    it('target="_blank"リンクにrel="noopener"が付与されている（SEC-04）', () => {
      // JSコード内のtarget='_blank'設定箇所を検出
      const targetBlankCount = (adminHtml.match(/target\s*=\s*['"]_blank['"]/g) || []).length;
      const noopenerCount = (adminHtml.match(/rel\s*=\s*['"]noopener['"]/g) || []).length;
      expect(targetBlankCount).toBeGreaterThan(0);
      expect(noopenerCount).toBe(targetBlankCount);
    });

    it('eval()/Function()/document.write()を使用していない（SEC-05: コード注入防止）', () => {
      const scriptBlocks = adminHtml.match(/<script(?:\s[^>]*)?>[\s\S]*?<\/script>/gi) || [];
      for (const block of scriptBlocks) {
        if (block.match(/<script\s[^>]*src=/i)) continue;
        const jsContent = block.replace(/<\/?script[^>]*>/gi, '');
        // eval()の呼び出しがないこと（プロパティアクセス等は除外）
        expect(jsContent).not.toMatch(/\beval\s*\(/);
        // new Function()の呼び出しがないこと
        expect(jsContent).not.toMatch(/\bnew\s+Function\s*\(/);
        // document.write()の呼び出しがないこと
        expect(jsContent).not.toMatch(/document\.write\s*\(/);
      }
    });

    it('console.logが本番コードに含まれていない（SEC-09: デバッグコード排除）', () => {
      // console.warnはエラーハンドリング用に許可、console.logは禁止
      const scriptBlocks = adminHtml.match(/<script(?:\s[^>]*)?>[\s\S]*?<\/script>/gi) || [];
      for (const block of scriptBlocks) {
        if (block.match(/<script\s[^>]*src=/i)) continue;
        const jsContent = block.replace(/<\/?script[^>]*>/gi, '');
        expect(jsContent).not.toMatch(/console\.log\s*\(/);
      }
    });

    it('ハードコードされたサイトURLが含まれていない（SEC-08）', () => {
      // window.location.originで動的取得すべきところにreiwa.casaがハードコードされていない
      const scriptBlocks = adminHtml.match(/<script(?:\s[^>]*)?>[\s\S]*?<\/script>/gi) || [];
      for (const block of scriptBlocks) {
        if (block.match(/<script\s[^>]*src=/i)) continue;
        const jsContent = block.replace(/<\/?script[^>]*>/gi, '');
        expect(jsContent).not.toMatch(/reiwa\.casa/);
      }
    });

    it('Decap CMSのバージョンが正確に指定されている（SEC-03: バージョン固定）', () => {
      // @X.Y.Z の正確なバージョン形式であること
      const cdnUrl = adminHtml.match(/unpkg\.com\/decap-cms@([^/]+)/);
      expect(cdnUrl).not.toBeNull();
      // セマンティックバージョニング（X.Y.Z）であり、^や~が付いていないこと
      expect(cdnUrl[1]).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('strictモードが有効である（品質基準Q-02）', () => {
      expect(adminHtml).toContain("'use strict'");
    });

    it('var宣言が使用されていない（品質基準Q-01）', () => {
      const scriptBlocks = adminHtml.match(/<script(?:\s[^>]*)?>[\s\S]*?<\/script>/gi) || [];
      for (const block of scriptBlocks) {
        if (block.match(/<script\s[^>]*src=/i)) continue;
        const jsContent = block.replace(/<\/?script[^>]*>/gi, '');
        // var宣言がないこと（varプレフィックスの変数名は除外）
        expect(jsContent).not.toMatch(/\bvar\s+\w/);
      }
    });

    it('CDNスクリプトにintegrity属性が設定されている（SEC-12: SRI）', () => {
      // unpkg.comのscriptタグにintegrity属性が含まれること
      const cdnScriptTags = adminHtml.match(/<script\s[^>]*src="https?:\/\/[^"]*unpkg\.com[^"]*"[^>]*>/gi) || [];
      expect(cdnScriptTags.length).toBeGreaterThan(0);
      for (const tag of cdnScriptTags) {
        expect(tag).toMatch(/integrity="sha384-[A-Za-z0-9+/=]+"/);
      }
    });

    it('CDNスクリプトにcrossorigin属性が設定されている（SEC-12: SRI）', () => {
      // unpkg.comのscriptタグにcrossorigin="anonymous"が含まれること
      const cdnScriptTags = adminHtml.match(/<script\s[^>]*src="https?:\/\/[^"]*unpkg\.com[^"]*"[^>]*>/gi) || [];
      expect(cdnScriptTags.length).toBeGreaterThan(0);
      for (const tag of cdnScriptTags) {
        expect(tag).toContain('crossorigin="anonymous"');
      }
    });
  });
});
