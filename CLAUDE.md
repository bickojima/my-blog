# CLAUDE.md — Claude Code プロジェクトガイド

## プロジェクト概要

個人ブログ「tbiのブログ」（https://reiwa.casa）。Astro SSG + Decap CMS + Cloudflare Pages 構成の静的サイト。

### 環境構成

| 環境 | URL | ブランチ | 用途 |
| :--- | :--- | :--- | :--- |
| 本番 | https://reiwa.casa | `main` | 公開サイト |
| テスト | https://staging.reiwa.casa | `staging` | 新機能テスト・動作確認 |

- `admin/index.html` のサイトURL参照は `window.location.origin` で動的取得（環境非依存）
- `config.yml` の `base_url` / `branch` は各ブランチで手動管理
- staging環境では [STAGING] ラベルを表示（Base.astro: `CF_PAGES_BRANCH`、admin/index.html: hostname判定）
- テスト環境ドメインはDNS CNAME（`staging` → `staging.my-blog-3cg.pages.dev`）で接続
- 新機能: `feature/*` → `staging` PR → テスト → `main` PR

## コマンド

```bash
npm run dev          # 開発サーバー起動（前処理含む）
npm run build        # 本番ビルド（normalize-images → organize-posts → astro build → image-optimize）
npm test             # Vitest 全テスト実行（245テスト、記事数により変動）
npm run test:watch   # Vitest ウォッチモード
npm run test:e2e     # Playwright E2Eテスト（要: npm run build 済み、240テスト）
```

## ディレクトリ構成

```
src/
├── content/posts/YYYY/MM/   # 記事Markdown（frontmatter: title, date, draft, tags, thumbnail）
├── content/pages/           # 固定ページMarkdown（frontmatter: title, slug, order, draft）
├── pages/                   # Astroルーティング（/posts/[year]/[month]/[slug], /[slug]）
├── layouts/Base.astro       # 共通レイアウト（CSS image-orientation: from-image、ヘッダーナビ動的生成）
├── plugins/rehype-image-caption.mjs  # img → figure/figcaption 変換プラグイン
├── integrations/image-optimize.mjs   # ビルド後画像リサイズ（sharp, MAX_WIDTH: 1200）
├── lib/posts.ts             # URL生成ユーティリティ
└── content.config.ts        # Zodスキーマ定義

public/
├── admin/index.html         # Decap CMS管理画面（CSS/JS カスタマイズ含む、約1000行）
├── admin/config.yml         # CMS設定（GitHub backend, OAuth）
└── images/uploads/          # アップロード画像

scripts/
├── normalize-images.mjs     # prebuild: EXIF正規化 + リサイズ
└── organize-posts.mjs       # prebuild: 記事ファイル整理 + url-map.json生成

docs/
└── DOCUMENTATION.md         # システム設計書（要件定義・基本設計・詳細設計・運用設計）

functions/auth/              # Cloudflare Functions: GitHub OAuth proxy

tests/
├── *.test.mjs               # Vitest単体・統合テスト（6ファイル）
├── e2e/                     # Playwright E2E（site.spec.ts, cms.spec.ts, cms-customizations.spec.ts）
└── TEST-REPORT.md           # テスト計画書・テストケース一覧・実行結果
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
- `showPublicUrl`: EditorControlBarの表示状態（`getBoundingClientRect`）でエディタ画面を判定。ハッシュURLからコレクション種別（posts/pages）を判定し、記事は`/posts/年/月/タイトル`、固定ページは`/slug`形式でURL生成
- `manageDropdownOverlay`: ドロップダウン表示時のみURLバーを退避（`hiddenByDropdown`フラグで誤復元を防止）
- **Slate codeblockクラッシュ対策**: モバイル（≤799px）でcodeblockボタン非表示、`toSlatePoint`エラーハンドラ、touchmoveエディタ除外
- `formatCollectionEntries`: 記事は「日付 | 下書き | タイトル」、固定ページは「番号 | 下書き | タイトル」形式で一覧を整形。下書き時はオレンジの「下書き」バッジを表示
- **コレクション表示順序**: config.yml で posts が先頭、pages が2番目（CMS初期表示で記事が最初に表示される）。固定ページはorder昇順がデフォルトソート（`{field: order, default_sort: asc}`）

### ビルドパイプライン
`normalize-images.mjs` → `organize-posts.mjs` → `astro build` → `image-optimize.mjs`（Astro integration）

### ヘッダーナビゲーション（Base.astro）
- 固定ページ数に応じて表示が変化:
  - 0件: リンクなし
  - 1件: 直接リンク
  - 2件以上: 最優先ページ名 + ▾ドロップダウン（全ページ一覧）
- ドロップダウン: ページ名部分は直接リンク（即遷移）、▾ボタンはトグル
- PC: mouseenter/mouseleave（300ms遅延閉じ）、モバイル: タップでトグル

## テスト

- **Vitest**: 設定検証、コンテンツ検証、単体テスト、ビルド統合テスト（245テスト、記事数により変動）
- **Playwright**: PC/iPad/iPhone 3デバイス × 80テスト = 240テスト（ローカルのみ、CIでは未実行）
- コンテンツ検証テストは記事数・ページ数に応じて動的展開される
- テスト実行後、失敗がある場合は原因を調査し修正する（テストを削除・スキップしない）
- **テストにコンテンツをハードコードしない**: 記事名・固定ページ名・URL等はソースから動的取得する（コンテンツ変更でテストが壊れない設計）

## ドキュメント体系

| ファイル | 内容 | 章番号体系 |
| :--- | :--- | :--- |
| README.md | プロジェクト概要（人間向け） | 1〜10（フラット） |
| docs/DOCUMENTATION.md | システム設計書（要件定義・設計・運用） | 1.x〜4.x（部ベース） |
| tests/TEST-REPORT.md | テスト計画書・テストケース一覧・実行結果 | 1.x〜4.x（部ベース） |
| CLAUDE.md | 本ファイル（Claude Code向けガイド） | — |

### ドキュメント章番号体系

DOCUMENTATION.md と TEST-REPORT.md は「第N部」ごとの章番号体系を採用:

- **DOCUMENTATION.md**: 第1部（1.1〜1.5）要件定義、第2部（2.1〜2.5）基本設計、第3部（3.1〜3.5）詳細設計、第4部（4.1〜4.5）運用設計
- **TEST-REPORT.md**: 第1部（1.1〜1.6）テスト計画、第2部（2.1〜2.6）テストケース、第3部（3.1）トレーサビリティ、第4部（4.1〜4.3）テスト実行

## 変更時のルール

### コード変更時
1. コード修正時は関連ドキュメント（README.md, docs/DOCUMENTATION.md, tests/TEST-REPORT.md, CLAUDE.md）も必ず更新する
2. テストが失敗した場合はテストを修正し、TEST-REPORT.md のテストケース説明を更新する
3. admin/index.html を変更した場合は `admin-html.test.mjs` との整合性を確認する
4. config.yml を変更した場合は `cms-config.test.mjs` との整合性を確認する
5. コンテンツ（記事・固定ページ）を追加した場合は `content-validation.test.mjs` の動的テストが対応する

### 新機能追加時（要件トレーサビリティの維持）
1. docs/DOCUMENTATION.md の要件一覧（1.2章 FR / 1.3章 CMS / 1.4章 NFR）に要件IDを追加
2. テストを実装し、tests/TEST-REPORT.md のテストケース一覧に追記
3. docs/DOCUMENTATION.md のトレーサビリティマトリクス（1.5章）に要件ID→テストケースの対応を追加
4. トレーサビリティマトリクスに「未テスト」が残らないことを確認
5. CLAUDE.md のテスト件数を更新する

### バグ発生時の対応フロー
1. docs/DOCUMENTATION.md のバグ一覧（4.5章）にバグ概要・原因・対策・再発防止テストを追記
2. 再発防止テストを実装し、tests/TEST-REPORT.md のテストケース一覧に追記
3. 関連する要件のトレーサビリティマトリクス（1.5章）を更新
4. テスト件数が変わった場合は CLAUDE.md・TEST-REPORT.md のテスト件数を更新する

### ドキュメント変更時
1. 章番号を変更する場合は、他ドキュメントの相互参照も全て更新する
2. 改訂履歴に変更内容を追記する
3. DOCUMENTATION.md の最終更新日を更新する

### やってはいけないこと
- テストを削除・スキップして通す（必ず原因を修正する）
- 要件IDなしに機能を追加する（必ず FR/CMS/NFR IDを付与する）
- トレーサビリティマトリクスを更新せずに要件・テストを追加する
- ドキュメントを更新せずにコード変更をコミットする
- ハードコードされたURL（`reiwa.casa`）を admin/index.html に追加する（`window.location.origin` を使用）
- テストに特定のコンテンツ名をハードコードする（記事タイトル、固定ページ名等はソースから動的取得する）
