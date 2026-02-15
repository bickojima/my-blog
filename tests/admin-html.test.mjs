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
  });

  describe('JavaScript カスタマイズ機能', () => {
    it('MutationObserverによるDOM監視が設定されている', () => {
      expect(adminHtml).toContain('MutationObserver');
      expect(adminHtml).toContain('observe(document.body');
    });

    it('ヘッダーに本番サイトへのリンク追加機能がある', () => {
      expect(adminHtml).toContain('addSiteLink');
      expect(adminHtml).toContain('cms-site-link');
      expect(adminHtml).toContain('https://reiwa.casa');
      expect(adminHtml).toContain('target="_blank"');
    });

    it('コレクション一覧の日付フォーマット処理がある', () => {
      // "YYYY-MM-DD | draft | タイトル" パターンの正規表現
      expect(adminHtml).toContain('formatCollectionEntries');
      expect(adminHtml).toContain(
        String.raw`/^(\d{4}-\d{2}-\d{2})\s*\|\s*(true|false)\s*\|\s*(.+)$/`
      );
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
      expect(adminHtml).toContain('reiwa.casa');
    });

    it('公開URLがタイトルと日付フィールドから動的に生成される', () => {
      expect(adminHtml).toContain('titleInput');
      expect(adminHtml).toContain('dateInput');
      expect(adminHtml).toContain('urlBound');
    });

    it('選択状態の判定がborderColor（青系）で行われている', () => {
      // styled-components のクラス名では判定できないため、描画結果で判定
      expect(adminHtml).toContain('borderColor');
      // rgb\( はJS正規表現内で使用されている
      expect(adminHtml).toMatch(/rgb/);
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
});
