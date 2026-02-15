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

    it('ドロップダウンのスタイルが定義されている', () => {
      expect(adminHtml).toContain('[class*=DropdownList]');
      expect(adminHtml).toContain('min-width: 160px');
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
});
