# CLAUDE.md — Claude Code プロジェクトガイド

## プロジェクト概要

個人ブログ「tbiのブログ」（https://reiwa.casa）。Astro SSG + Decap CMS + Cloudflare Pages 構成の静的サイト。

## コマンド

```bash
npm run dev          # 開発サーバー起動（前処理含む）
npm run build        # 本番ビルド（normalize-images → organize-posts → astro build → image-optimize）
npm test             # Vitest 全テスト実行（177テスト、記事数により変動）
npm run test:watch   # Vitest ウォッチモード
npm run test:e2e     # Playwright E2Eテスト（要: npm run build 済み、192テスト）
```

## ディレクトリ構成

```
src/
├── content/posts/YYYY/MM/   # 記事Markdown（frontmatter: title, date, draft, tags, thumbnail）
├── pages/                   # Astroルーティング（/posts/[year]/[month]/[slug]）
├── layouts/Base.astro       # 共通レイアウト（CSS image-orientation: from-image）
├── plugins/rehype-image-caption.mjs  # img → figure/figcaption 変換プラグイン
├── integrations/image-optimize.mjs   # ビルド後画像リサイズ（sharp, MAX_WIDTH: 1200）
├── lib/posts.ts             # URL生成ユーティリティ
└── content.config.ts        # Zodスキーマ定義

public/
├── admin/index.html         # Decap CMS管理画面（CSS/JS カスタマイズ含む、約950行）
├── admin/config.yml         # CMS設定（GitHub backend, OAuth）
└── images/uploads/          # アップロード画像

scripts/
├── normalize-images.mjs     # prebuild: EXIF正規化 + リサイズ
└── organize-posts.mjs       # prebuild: 記事ファイル整理 + url-map.json生成

functions/auth/              # Cloudflare Functions: GitHub OAuth proxy
tests/
├── *.test.mjs               # Vitest単体・統合テスト（6ファイル）
└── e2e/                     # Playwright E2E（site.spec.ts, cms.spec.ts, cms-customizations.spec.ts）
```

## アーキテクチャ上の注意点

### 画像EXIF方針
- **CSS `image-orientation: from-image` をプライマリとする**（Base.astro, admin/index.html）
- JSによるcanvas EXIF修正（fixPreviewImageOrientation）は廃止済み
- アップロード時にcanvasでEXIF正規化、ビルド時にsharp `.rotate()` で二重保証

### CMS管理画面 (admin/index.html)
- Decap CMS v3.10.0 をDOM操作でカスタマイズ（MutationObserver、RAFデバウンス済み）
- モバイル: ドロップダウンは `position: fixed; bottom: 0` のボトムシート形式
- プレビュースタイル: `CMS.registerPreviewStyle()` で本番サイト相当のCSSをプレビューiframeに注入
- 主要JS関数: `addSiteLink`, `formatCollectionEntries`, `relabelImageButtons`, `updateDeleteButtonState`, `showPublicUrl`, `manageDropdownOverlay`, `hideCodeBlockOnMobile`
- `showPublicUrl`: EditorControlBarの表示状態（`getBoundingClientRect`）でエディタ画面を判定し、コレクション一覧では確実に非表示
- `manageDropdownOverlay`: ドロップダウン表示時のみURLバーを退避（`hiddenByDropdown`フラグで誤復元を防止）
- **Slate codeblockクラッシュ対策**: モバイル（≤799px）でcodeblockボタン非表示、`toSlatePoint`エラーハンドラ、touchmoveエディタ除外

### ビルドパイプライン
`normalize-images.mjs` → `organize-posts.mjs` → `astro build` → `image-optimize.mjs`（Astro integration）

## テスト

- **Vitest**: 設定検証、コンテンツ検証、単体テスト、ビルド統合テスト（177テスト、記事数により変動）
- **Playwright**: PC/iPad/iPhone 3デバイス × 64テスト = 192テスト（ローカルのみ、CIでは未実行）
- コンテンツ検証テストは記事数に応じて動的展開される

## ドキュメント

| ファイル | 内容 |
| :--- | :--- |
| README.md | プロジェクト概要・システム変更履歴 |
| DOCUMENTATION.md | 要件定義・設計書・実装ガイド |
| tests/TEST-REPORT.md | テスト計画書・テストケース一覧・実行結果 |
| CLAUDE.md | 本ファイル（Claude Code向けガイド） |

## 変更時のルール

- コード修正時は関連ドキュメント（README.md, DOCUMENTATION.md, TEST-REPORT.md, CLAUDE.md）も更新する
- テストが失敗した場合はテストを修正し、TEST-REPORT.md のテストケース説明を更新する
- admin/index.html を変更した場合は `admin-html.test.mjs` との整合性を確認する
