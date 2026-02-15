# tbiのブログ システム設計書

## 改訂履歴

| 版数 | 日付 | 内容 |
| :--- | :--- | :--- |
| 1.0 | 2026-02-15 | 初版作成（全PR履歴より抽出） |
| 1.1 | 2026-02-15 | JTC設計書体系に再構成（第1部〜第4部構成） |
| 1.2 | 2026-02-15 | 認証基盤（第8章）を大幅拡充: Decap CMS連携詳細、認証アーキテクチャ図、シーケンス図、セキュリティ考慮事項、GitHub OAuth App設定を追加 |
| 1.3 | 2026-02-15 | Playwright E2Eテスト導入（PC/iPad/iPhone対応）、システム変更履歴追加 |
| 1.4 | 2026-02-15 | EXIF画像回転修正（fixPreviewImageOrientation削除）、ドロップダウンCSS位置制御、公開URLバーhashchange対応、テスト更新（237テスト） |
| 1.5 | 2026-02-15 | CMS管理画面ヘッダーに本番サイトリンク追加（CMS-11） |
| 1.6 | 2026-02-15 | iPhone codeblockクラッシュ対策（MutationObserverデバウンス、touchmoveエディタ除外） |

## システム変更履歴

PR履歴に基づく主要なシステム変更の記録である。

| 時期 (JST) | 主な変更 | 関連PR |
| :--- | :--- | :--- |
| 2026-02-14 16時頃 | **初期構築**: Decap CMS + Astro によるブログサイト初期構築。Netlify Identity 認証、カテゴリ別コレクション（devices/finance）構成 | #1 |
| 2026-02-14 18〜20時 | **CMS モバイル対応**: iPhone ポートレート表示修正、モーダルスクロール、メディアライブラリレイアウト、保存ボタン可視性、iOS自動ズーム防止、pull-to-refresh無効化 | #2〜#6 |
| 2026-02-14 20〜21時 | **UI デザイン調整・タグ機能**: エディタ背景色の白統一、記事一覧・詳細へのタグ表示追加 | #7〜#12 |
| 2026-02-14 21時頃 | **URL自動生成**: permalink フィールド廃止、日付ベースURL自動生成、画像キャプションプラグイン導入 | #13〜#16 |
| 2026-02-14 22時頃 | **大規模UI改善**: 日付ラベル、カテゴリプルダウン、画像ボタン、一覧表示改善、favicon、画像最適化（1200px/80%品質）導入 | #17 |
| 2026-02-14 22〜23時 | **削除ボタン改善**: 画像フィールドの「選択解除」/メディアライブラリの「完全削除」のラベル分離・ロジック修正 | #31〜#34 |
| 2026-02-14 23時頃 | **自動テスト導入**: Vitest による151テストケースの自動テスト基盤を構築 | #40 |
| 2026-02-15 7〜8時 | **カテゴリ廃止・構造統合**: カテゴリシステムを廃止し単一postsコレクション+タグ構造に移行 | #41 |
| 2026-02-15 8時頃 | **URL構造変更**: /posts/yyyy/mm/記事名 形式に変更、年月アーカイブページ追加、organize-posts.mjs導入 | #42 |
| 2026-02-15 9〜10時 | **公開URL表示**: CMS エディタ内での公開URL表示機能の実装・改善（DOM検索方式変更、url-map.json連携） | #55, #58, #65, #66 |
| 2026-02-15 13〜14時 | **EXIF回転対応**: iPhone撮影画像のEXIF回転をピクセルレベルで正規化する normalize-images.mjs を導入 | #73 |
| 2026-02-15 14時頃 | **モバイル保存ボタン修正**: エディタの保存/公開ボタンがモバイルポートレートで非表示になる問題を修正 | #77 |
| 2026-02-15 午後 | **包括的リファクタリング**: Netlify Identity残骸除去、robots.txtドメイン修正、壊れた画像参照修正、テスト追加（227テスト）、ドキュメント全面改訂 | #80 |
| 2026-02-15 夕方 | **E2Eテスト導入**: Playwright によるブラウザ自動テスト（PC/iPad/iPhone 3デバイス×30テスト=90テスト） | - |
| 2026-02-15 夜 | **EXIF画像回転修正**: CMS編集画面でEXIF回転が反転する問題を修正（fixPreviewImageOrientation削除）。ドロップダウンをCSSボトムシート化。公開URLバーのhashchange対応。テスト237件 | - |

---

## 文書構成

本文書は以下の4部で構成される。要件定義から運用設計まで、抽象度の高い内容から具体的な実装詳細へと段階的に記述する。

| 部 | 名称 | 内容 |
| :--- | :--- | :--- |
| 第1部 | 要件定義書 | システムが満たすべき機能要件・非機能要件の定義 |
| 第2部 | 基本設計書 | システム構成・技術スタック・URL設計・認証方式等のアーキテクチャ設計 |
| 第3部 | 詳細設計書 | 各コンポーネントの処理仕様・設定値・実装詳細 |
| 第4部 | 運用設計書 | 移行・バックアップ・転用・障害対応の手順 |

---

## 目次

### 第1部 要件定義書

1. [システム概要](#1-システム概要)
2. [機能要件](#2-機能要件)
3. [CMS管理画面要件](#3-cms管理画面要件)
4. [非機能要件](#4-非機能要件)

### 第2部 基本設計書

5. [システム構成](#5-システム構成)
6. [技術スタック](#6-技術スタック)
7. [URL設計](#7-url設計)
8. [認証基盤](#8-認証基盤)
9. [インフラストラクチャ](#9-インフラストラクチャ)

### 第3部 詳細設計書

10. [ビルドパイプライン](#10-ビルドパイプライン)
11. [コンテンツ管理](#11-コンテンツ管理)
12. [CMS設定](#12-cms設定)
13. [管理画面UIカスタマイズ](#13-管理画面uiカスタマイズ)
14. [画像処理パイプライン](#14-画像処理パイプライン)

### 第4部 運用設計書

15. [移行設計](#15-移行設計)
16. [バックアップ設計](#16-バックアップ設計)
17. [フォーク転用ガイド](#17-フォーク転用ガイド)
18. [トラブルシューティング](#18-トラブルシューティング)

---

# 第1部 要件定義書

本部では、システムが満たすべき要件を定義する。要件IDは後続のテスト仕様書（TEST-REPORT.md）にてトレーサビリティマトリクスの参照元として使用する。

---

## 1. システム概要

### 1.1 目的

本システムは、Astro（静的サイトジェネレーター）とDecap CMS（ヘッドレスCMS）を組み合わせたブログシステムである。Cloudflare Pages上で静的サイトとして配信し、GitHub OAuthによる認証を介してCMSから記事を管理する。

### 1.2 システム全体像

```
┌──────────┐    ┌───────────┐    ┌──────────────────┐
│  閲覧者   │───→│ Cloudflare│───→│ 静的サイト (dist/)│
│ (ブラウザ)│    │   Pages   │    │  HTML/CSS/JS/画像 │
└──────────┘    └───────────┘    └──────────────────┘

┌──────────┐    ┌───────────┐    ┌──────────────────┐    ┌────────┐
│  管理者   │───→│ 管理画面  │───→│ Decap CMS        │───→│ GitHub │
│ (ブラウザ)│    │ /admin/   │    │ (フロントエンド)   │    │ API    │
└──────────┘    └───────────┘    └──────────────────┘    └────────┘
                                         │
                                         ↓
                                  ┌──────────────┐
                                  │ Git リポジトリ │
                                  │ (main branch) │
                                  └──────┬───────┘
                                         │ push hook
                                         ↓
                                  ┌──────────────┐
                                  │ ビルド＆デプロイ│
                                  └──────────────┘
```

### 1.3 利用者

| 種別 | 操作内容 | アクセス経路 |
| :--- | :--- | :--- |
| 閲覧者 | 記事の閲覧 | `https://reiwa.casa` |
| 管理者 | 記事の作成・編集・公開 | `https://reiwa.casa/admin` |

---

## 2. 機能要件

### 2.1 機能要件一覧 (FR)

| ID | 要件 | 実装箇所 | 備考 |
| :--- | :--- | :--- | :--- |
| FR-01 | 記事管理: Markdown + frontmatter (title, date, draft, tags, thumbnail, summary, body) | `content.config.ts`, `config.yml` | コンテンツコレクション定義 |
| FR-02 | URL生成: `/posts/{年}/{月}/{ファイル名}` | `src/lib/posts.ts` | ファイル名ベースのスラグ |
| FR-03 | 下書き: 一覧非表示、URL直打ちアクセス可 | `pages/*.astro` | 限定公開的な挙動 |
| FR-04 | タグ分類: `/tags/{タグ名}` で一覧表示 | `pages/tags/[tag].astro` | カテゴリは廃止済み |
| FR-05 | アーカイブ: 年別・月別ページ生成 | `pages/posts/[year]/`, `[month]/` | ArchiveNav.astroでナビ表示 |
| FR-06 | 画像アップロード: `public/images/uploads/` にGit管理 | `config.yml` | CMSメディアフォルダ設定 |
| FR-07 | 画像最適化: 最大1200px, JPEG/PNG/WebP 80%圧縮 | `image-optimize.mjs` | ビルド後自動実行 |
| FR-08 | EXIF回転正規化: ピクセル回転 + メタデータ除去 | `normalize-images.mjs`, `image-optimize.mjs`, `Base.astro` | 3段階パイプライン |
| FR-09 | 記事自動整理: 日付→`yyyy/mm/`ディレクトリ配置 | `organize-posts.mjs` | prebuildスクリプト |
| FR-10 | URLマッピングJSON: CMS用`url-map.json`生成 | `organize-posts.mjs` | 公開URL表示に使用 |
| FR-11 | HEIC→JPEG変換: iOS accept属性制限で自動変換 | `admin/index.html` | iOSのみ適用 |
| FR-12 | CMS認証: GitHub OAuth + Cloudflare Functions | `functions/auth/` | Netlify Identityから移行済み |
| FR-13 | 画像キャプション: title属性→`<figcaption>`, lazy loading自動付与 | `rehype-image-caption.mjs` | rehypeプラグイン |

### 2.2 各要件の詳細

#### FR-01 記事管理

記事はMarkdown形式で管理し、frontmatterに以下のメタデータを定義する。

| フィールド | 型 | 必須 | デフォルト | 説明 |
| :--- | :--- | :--- | :--- | :--- |
| `title` | string | 必須 | - | 記事タイトル |
| `date` | string | 必須 | - | 日付（`YYYY-MM-DD`形式） |
| `draft` | boolean | 任意 | `false` | 下書きフラグ |
| `tags` | string[] | 任意 | `[]` | 分類タグ |
| `thumbnail` | string | 任意 | - | サムネイル画像パス |
| `summary` | string | 任意 | - | 記事概要 |

#### FR-03 下書き機能

下書き状態（`draft: true`）の記事は、一覧ページ（トップ・アーカイブ・タグ）に表示されない。ただし個別記事URL（`/posts/yyyy/mm/記事名`）に直接アクセスした場合は閲覧可能である。YouTubeの「限定公開」に相当する挙動である。

#### FR-04 タグによる分類

記事の分類にはタグを使用する。カテゴリ機能はPR#41で廃止済みである。タグは各記事のfrontmatterに配列で定義し、`/tags/{タグ名}` で該当記事の一覧を表示する。

---

## 3. CMS管理画面要件

### 3.1 CMS管理画面要件一覧 (CMS)

| ID | 要件 | 実装箇所 | 備考 |
| :--- | :--- | :--- | :--- |
| CMS-01 | モバイルレスポンシブ（799px以下） | `admin/index.html` CSS | サイドバー、ボタン、モーダル等 |
| CMS-02 | iOS自動ズーム防止（font-size 16px+） | `admin/index.html` CSS | iOS HIG準拠 |
| CMS-03 | pull-to-refresh無効化 | `admin/index.html` JS | 編集中の誤リロード防止 |
| CMS-04 | 削除ボタンラベル区別（選択解除/完全削除） | `admin/index.html` JS | 操作ミス防止 |
| CMS-05 | 一覧表示改善（日付バッジ + 下書きラベル + タイトル） | `admin/index.html` JS | MutationObserver使用 |
| CMS-06 | エディタ公開URL表示 | `admin/index.html` JS | リアルタイム更新 |
| CMS-07 | メディアライブラリ（2列グリッド, タッチスクロール） | `admin/index.html` CSS | モバイル対応 |
| CMS-08 | 保存ボタン常時表示（sticky, min-height 44px） | `admin/index.html` CSS | Apple HIG準拠タップ領域 |
| CMS-09 | ドロップダウンとURLバーの重なり防止 | `admin/index.html` JS | manageDropdownOverlay使用 |
| CMS-10 | 画面遷移時の公開URLバー自動非表示 | `admin/index.html` JS | hashchangeリスナー使用 |
| CMS-11 | サイドバーに本番サイトへのリンク表示 | `admin/index.html` JS | addSiteLink関数 |
| CMS-12 | iPhone codeblockクラッシュ対策 | `admin/index.html` CSS/JS | モバイルcodeblockボタン非表示、Slateエラーハンドラ、MutationObserverデバウンス、touchmoveエディタ除外 |

---

## 4. 非機能要件

### 4.1 非機能要件一覧 (NFR)

| ID | 要件 | 実装箇所 | 備考 |
| :--- | :--- | :--- | :--- |
| NFR-01 | 静的サイト生成（Astro SSG） | `astro.config.mjs` | `output: 'static'` |
| NFR-02 | Cloudflare Pagesホスティング | `wrangler.toml`, `_routes.json` | Functions含む |
| NFR-03 | 管理画面SEO除外 | `_headers`, `admin/index.html` | `robots: noindex`, `X-Robots-Tag` |
| NFR-04 | 日本語URL（Unicode slug） | `config.yml` | `encoding: "unicode"` |

---

# 第2部 基本設計書

本部では、要件定義に基づくシステムのアーキテクチャ設計を記述する。各コンポーネントの役割、技術選定、主要な設計判断を示す。

---

## 5. システム構成

### 5.1 ディレクトリ構成

```
my-blog/
├── functions/                          # サーバーサイド処理
│   └── auth/
│       ├── index.js                    # OAuth認証開始
│       └── callback.js                 # OAuthコールバック
├── public/                             # 静的ファイル（そのままdistにコピー）
│   ├── admin/
│   │   ├── index.html                  # CMS管理画面（CSS/JS含む628行）
│   │   └── config.yml                  # CMS設定定義
│   ├── images/uploads/                 # アップロード画像（Git管理）
│   ├── _headers                        # HTTPレスポンスヘッダー
│   ├── _redirects                      # URLリダイレクト規則
│   └── robots.txt                      # クローラー制御
├── scripts/                            # ビルド前処理スクリプト
│   ├── normalize-images.mjs            # EXIF回転正規化
│   └── organize-posts.mjs             # 記事ファイル配置整理
├── src/                                # ソースコード
│   ├── content/posts/{yyyy}/{mm}/      # 記事Markdownファイル
│   ├── components/ArchiveNav.astro     # アーカイブナビゲーション
│   ├── integrations/image-optimize.mjs # ビルド後画像最適化
│   ├── plugins/rehype-image-caption.mjs# 画像キャプション変換
│   ├── layouts/Base.astro              # 共通レイアウト
│   ├── lib/posts.ts                    # 記事URL生成ロジック
│   ├── pages/                          # ページルーティング
│   └── content.config.ts              # コンテンツスキーマ定義
├── tests/                              # 自動テスト
│   ├── *.test.mjs                      # 単体・統合テスト（Vitest）
│   └── e2e/                            # E2Eテスト（Playwright）
├── CLAUDE.md                           # Claude Code向けプロジェクトガイド
├── astro.config.mjs                    # Astro設定
├── playwright.config.ts                # Playwright E2E設定
├── vitest.config.ts                    # Vitest設定
├── package.json                        # 依存関係・スクリプト定義
└── wrangler.toml                       # Cloudflare設定
```

### 5.2 コンポーネント間依存関係

```
                    astro.config.mjs
                    ┌─────────────┐
                    │  Astro 設定  │
                    │             │
                    │ integrations│──→ image-optimize.mjs
                    │ rehypePlugins│──→ rehype-image-caption.mjs
                    └──────┬──────┘
                           │
            ┌──────────────┼──────────────┐
            ↓              ↓              ↓
     ┌─────────────┐ ┌──────────┐ ┌───────────────┐
     │ pages/*.astro│ │ layouts/ │ │ components/   │
     │             │ │ Base.astro│ │ ArchiveNav    │
     │ index       │ │          │ └───────────────┘
     │ posts/[y]/  │ │ header   │        ↑
     │   [m]/      │ │ main     │────────┘
     │   [slug]    │ │ footer   │
     │ tags/[tag]  │ └──────────┘
     └──────┬──────┘
            │
            ↓
     ┌─────────────┐     ┌──────────────────┐
     │ lib/posts.ts│     │ content.config.ts │
     │             │     │                  │
     │ getPostUrl()│     │ posts collection │
     │ getPostUrl  │     │ schema定義       │
     │   Parts()   │     └──────────────────┘
     └─────────────┘
```

### 5.3 データフロー概要

```
┌────────┐    ┌──────────┐    ┌───────────────┐    ┌───────────────┐
│ CMS    │    │ GitHub   │    │ Cloudflare    │    │ Cloudflare    │
│ 記事保存│───→│ main push│───→│ Pages ビルド   │───→│ Pages 配信    │
│        │    │          │    │ (npm run build)│    │ (CDN)         │
└────────┘    └──────────┘    └───────────────┘    └───────────────┘
```

---

## 6. 技術スタック

### 6.1 採用技術一覧

| 分類 | 技術 | バージョン | 用途 |
| :--- | :--- | :--- | :--- |
| SSG | Astro | v5.17.1 | 静的サイト生成 |
| CMS | Decap CMS | v3.10.0 | コンテンツ管理 |
| ホスティング | Cloudflare Pages | - | 静的配信 + Functions |
| 認証 | GitHub OAuth App | - | CMS管理者認証 |
| 画像処理 | sharp | v0.34.5 | 画像圧縮・回転・リサイズ |
| テスト（単体・統合） | Vitest | v4.0.18 | 単体テスト・統合テスト（237テスト） |
| テスト（E2E） | Playwright | v1.58.2 | ブラウザE2Eテスト（PC/iPad/iPhone 90テスト） |
| コンテンツ | Markdown | - | frontmatter形式 |

### 6.2 選定理由

| 技術 | 選定理由 |
| :--- | :--- |
| Astro | Markdownネイティブ対応、高速ビルド、コンテンツコレクション機能 |
| Decap CMS | Git-basedでサーバー不要、Markdown対応、日本語対応 |
| Cloudflare Pages | 無料枠が充実、Functions対応、CDN自動配信 |
| GitHub OAuth | Decap CMSのgithubバックエンドと整合する認証方式 |

---

## 7. URL設計

### 7.1 URL体系

| URL パターン | ページ種別 | ルーティングファイル |
| :--- | :--- | :--- |
| `/` | トップページ（記事一覧） | `src/pages/index.astro` |
| `/posts/{yyyy}/{mm}/{slug}` | 個別記事 | `src/pages/posts/[year]/[month]/[slug].astro` |
| `/posts/{yyyy}` | 年別アーカイブ | `src/pages/posts/[year]/index.astro` |
| `/posts/{yyyy}/{mm}` | 月別アーカイブ | `src/pages/posts/[year]/[month]/index.astro` |
| `/tags/{tag}` | タグ別一覧 | `src/pages/tags/[tag].astro` |
| `/admin/` | CMS管理画面 | `public/admin/index.html` |

### 7.2 URLスラグ生成規則

URLスラグはファイル名（拡張子除く）をそのまま使用する。CMSで新規作成した場合、ファイル名はタイトルから自動生成される。

```
記事ファイル: src/content/posts/2026/02/ブラザープリンターを買った話.md
  ↓
URL: /posts/2026/02/ブラザープリンターを買った話
```

実装箇所: `src/lib/posts.ts` の `getPostUrl()` / `getPostUrlParts()`

同タイトルの記事が同一年月に存在する場合、CMSがファイル名に `-1`, `-2` 等のサフィックスを自動付与する。

### 7.3 日付変更時の挙動

frontmatterの日付を変更した場合、次回ビルド時に`organize-posts.mjs`が当該ファイルを正しい`yyyy/mm/`ディレクトリに自動移動する。URLも新しい日付に基づいて生成される。

---

## 8. 認証基盤

### 8.1 認証方式

GitHub OAuth 2.0 を使用する。Decap CMS は CMS 自体に GitHub API へのアクセストークンを渡すことで認証を完了させるが、OAuth のトークン交換にはサーバーサイド処理（Client Secret の秘匿）が必要である。本システムでは Cloudflare Functions が OAuth プロキシとして動作し、Decap CMS 独自のハンドシェイクプロトコル（Post-Message API）に従いアクセストークンをブラウザに中継する。

### 8.2 認証アーキテクチャ

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         認証アーキテクチャ全体像                          │
│                                                                         │
│  ┌──────────────────┐                     ┌────────────────────────────┐│
│  │ ブラウザ（管理者） │                     │ サーバーサイド               ││
│  │                  │                     │                            ││
│  │ ┌──────────────┐ │                     │ ┌────────────────────────┐ ││
│  │ │ Decap CMS    │ │←── postMessage ───→│ │ Cloudflare Functions   │ ││
│  │ │ (親ウィンドウ) │ │                     │ │                        │ ││
│  │ └──────────────┘ │                     │ │  /auth       → 認可URL  │ ││
│  │        ↑          │                     │ │              生成+302   │ ││
│  │        │token     │                     │ │                        │ ││
│  │ ┌──────────────┐ │                     │ │  /auth/callback        │ ││
│  │ │ OAuthポップアップ│ │                     │ │    → code受信          │ ││
│  │ │ (子ウィンドウ) │ │                     │ │    → token交換         │ ││
│  │ └──────────────┘ │                     │ │    → postMessage返却    │ ││
│  └──────────────────┘                     │ └────────────────────────┘ ││
│                                           │            ↕               ││
│                                           │ ┌────────────────────────┐ ││
│                                           │ │ GitHub OAuth API       │ ││
│                                           │ │  authorize (認可)       │ ││
│                                           │ │  access_token (発行)    │ ││
│                                           │ └────────────────────────┘ ││
│                                           └────────────────────────────┘│
│                                                                         │
│  認証完了後:                                                              │
│  ┌──────────────┐    GitHub API     ┌──────────────┐                    │
│  │ Decap CMS    │──── (Bearer) ───→│ GitHub       │                    │
│  │ トークン保持   │  リポジトリ操作    │ REST API     │                    │
│  └──────────────┘                  └──────────────┘                    │
└─────────────────────────────────────────────────────────────────────────┘
```

### 8.3 認証フロー詳細

以下のシーケンス図は、管理者がログインしてから CMS 操作が可能になるまでの全ステップを示す。

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────┐
│ 管理者    │     │ Decap CMS    │     │ Cloudflare   │     │ GitHub   │
│ (ブラウザ)│     │ (admin/)     │     │ Functions    │     │ OAuth    │
└────┬─────┘     └──────┬───────┘     └──────┬───────┘     └────┬─────┘
     │                   │                     │                  │
     │ 1.ログインクリック │                     │                  │
     │──────────────────→│                     │                  │
     │                   │                     │                  │
     │                   │ 2.ポップアップ起動    │                  │
     │                   │  /auth に遷移        │                  │
     │                   │────────────────────→│                  │
     │                   │                     │                  │
     │                   │                     │ 3.認可URL構築      │
     │                   │                     │  client_id       │
     │                   │                     │  redirect_uri    │
     │                   │                     │  scope=repo,user │
     │←──────────────────────────────302──────│                  │
     │                                         │                  │
     │ 4.GitHub認可画面表示                      │                  │
     │──────────────────────────────────────────────────────────→│
     │                                         │                  │
     │ 5.ユーザーが「Authorize」クリック          │                  │
     │                                         │  6.認可コード発行  │
     │←──────────────────────────────302──────────────────────────│
     │                                         │                  │
     │ 7./auth/callback?code=XXX にリダイレクト  │                  │
     │──────────────────────────────────────→│                  │
     │                                         │                  │
     │                                         │ 8.トークン交換     │
     │                                         │  POST /login/    │
     │                                         │  oauth/access_   │
     │                                         │  token            │
     │                                         │  {client_id,     │
     │                                         │   client_secret,  │
     │                                         │   code}           │
     │                                         │─────────────────→│
     │                                         │                  │
     │                                         │ 9.トークン返却     │
     │                                         │  {access_token}  │
     │                                         │←─────────────────│
     │                                         │                  │
     │ 10.ハンドシェイクHTML返却                  │                  │
     │  （postMessageスクリプト埋め込み）         │                  │
     │←────────────────────────────────────────│                  │
     │                                         │                  │
     │ === Post-Message ハンドシェイク ===       │                  │
     │                   │                     │                  │
     │ 11.ポップアップ→親  │                     │                  │
     │  "authorizing:     │                     │                  │
     │   github"          │                     │                  │
     │──────────────────→│                     │                  │
     │                   │                     │                  │
     │ 12.親→ポップアップ  │                     │                  │
     │  応答(ACK)         │                     │                  │
     │←──────────────────│                     │                  │
     │                   │                     │                  │
     │ 13.ポップアップ→親  │                     │                  │
     │  "authorization:   │                     │                  │
     │   github:success:  │                     │                  │
     │   {token,provider}"│                     │                  │
     │──────────────────→│                     │                  │
     │                   │                     │                  │
     │ 14.ポップアップclose│                     │                  │
     │                   │                     │                  │
     │                   │ 15.トークン保存       │                  │
     │                   │  (localStorage)     │                  │
     │                   │                     │                  │
     │ 16.CMS操作可能      │                     │                  │
     │←─────────────────│                     │                  │
     │                   │                     │                  │
     │ === 認証後のAPI通信 ===                   │                  │
     │                   │                     │                  │
     │                   │ 17.GitHub API呼出し   │                  │
     │                   │  Authorization:     │                  │
     │                   │  Bearer {token}     │                  │
     │                   │──────────────────────────────────────→│
     │                   │                     │                  │
     │                   │ 18.リポジトリ操作     │                  │
     │                   │  (読取/書込/commit)  │                  │
     │                   │←──────────────────────────────────────│
```

### 8.4 Decap CMS 側の認証処理

Decap CMS の認証処理は `config.yml` の `backend` 設定に基づいて自動的に行われる。カスタムコードは不要であり、以下の設定のみで動作する。

```yaml
backend:
  name: github              # GitHubバックエンドを使用
  repo: bickojima/my-blog    # 操作対象のリポジトリ
  branch: main               # 対象ブランチ
  base_url: https://reiwa.casa  # OAuthプロキシのベースURL
  auth_endpoint: /auth       # 認可開始エンドポイント
```

Decap CMS は以下の処理を内部的に実行する。

| 処理 | 内容 |
| :--- | :--- |
| ログインボタン押下 | `base_url + auth_endpoint`（`https://reiwa.casa/auth`）をポップアップウィンドウで開く |
| postMessage受信待機 | `"authorizing:github"` メッセージの受信を待機し、ACKを返す |
| トークン受信 | `"authorization:github:success:{token}"` メッセージからトークンを抽出する |
| トークン保持 | localStorage にトークンを保存し、以後の GitHub API 呼び出しに使用する |
| API通信 | `Authorization: Bearer {token}` ヘッダーを付与してリポジトリの読取・書込・commit を行う |
| セッション管理 | ブラウザの localStorage にトークンが存在する限り認証済みとして扱う。トークン失効時は再ログインが必要である |

### 8.5 Cloudflare Functions の実装

#### 8.5.1 `/auth` エンドポイント（`functions/auth/index.js`）

GitHub の認可 URL にリダイレクトする。`redirect_uri` はリクエストのオリジンから自動構築される。

```javascript
// 処理概要（擬似コード）
const redirectUri = `${request.origin}/auth/callback`;
const githubUrl = `https://github.com/login/oauth/authorize`
  + `?client_id=${OAUTH_CLIENT_ID}`
  + `&redirect_uri=${redirectUri}`
  + `&scope=repo,user`;
return Response.redirect(githubUrl, 302);
```

| パラメータ | 値 | 説明 |
| :--- | :--- | :--- |
| `client_id` | 環境変数 `OAUTH_CLIENT_ID` | GitHub OAuth App の識別子 |
| `redirect_uri` | `https://reiwa.casa/auth/callback` | コールバックURL（オリジンから自動構築） |
| `scope` | `repo,user` | リポジトリ操作権限とユーザー情報 |

#### 8.5.2 `/auth/callback` エンドポイント（`functions/auth/callback.js`）

GitHub から受け取った認可コードをアクセストークンに交換し、Decap CMS のハンドシェイクプロトコルに従い postMessage でトークンを返却する。

```javascript
// 処理概要（擬似コード）
// 1. 認可コードでトークン交換
const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
  method: 'POST',
  body: JSON.stringify({ client_id, client_secret, code }),
});
const { access_token } = await tokenResponse.json();

// 2. ハンドシェイクHTML返却
return new Response(`
  <script>
    // Step 1: 認証開始通知
    window.opener.postMessage("authorizing:github", "*");
    // Step 2: 親ウィンドウからの応答を待機
    window.addEventListener("message", function(event) {
      // Step 3: トークン送信
      const msg = "authorization:github:success:" + JSON.stringify({token, provider});
      window.opener.postMessage(msg, event.origin);
      // Step 4: ポップアップを閉じる
      window.close();
    }, { once: true });
  </script>
`);
```

### 8.6 セキュリティ上の考慮事項

| 項目 | 対策 |
| :--- | :--- |
| Client Secret の保護 | `OAUTH_CLIENT_SECRET` はサーバーサイド（Cloudflare Functions）でのみ使用し、ブラウザには露出しない |
| トークン交換 | 認可コード→アクセストークンの交換はサーバーサイドで実行する（ブラウザで行うと Secret が漏洩する） |
| postMessage のオリジン検証 | callback.js は `event.origin` を使用してトークン送信先を制限する |
| scope の最小化 | `repo,user` のみを要求し、不要な権限は取得しない |
| トークンの保管 | ブラウザの localStorage に保管される。XSS 対策として管理画面に `noindex` を設定し外部からのアクセスを制限する |

### 8.7 環境変数

| 変数名 | 説明 | 設定環境 |
| :--- | :--- | :--- |
| `OAUTH_CLIENT_ID` | GitHub OAuth App の Client ID | Production + Preview |
| `OAUTH_CLIENT_SECRET` | GitHub OAuth App の Client Secret | Production + Preview |

### 8.8 GitHub OAuth App の設定

GitHub Settings > Developer settings > OAuth Apps で作成する。

| 設定項目 | 値 |
| :--- | :--- |
| Application name | 任意（例: `tbiのブログ CMS`） |
| Homepage URL | `https://reiwa.casa` |
| Authorization callback URL | `https://reiwa.casa/auth/callback` |

---

## 9. インフラストラクチャ

### 9.1 Cloudflare Pages設定

| 項目 | 値 |
| :--- | :--- |
| フレームワーク | Astro |
| ビルドコマンド | `npm run build` |
| 出力ディレクトリ | `dist` |
| ルートディレクトリ | `/` |
| Node.js バージョン | 18以上 |

### 9.2 HTTPヘッダー設定（`_headers`）

管理画面に対して以下のヘッダーを設定し、検索エンジンからのインデックスを防止する。

```
/admin/*
  X-Robots-Tag: noindex
```

### 9.3 カスタムドメイン

本番環境では`reiwa.casa`をカスタムドメインとして設定している。DNSレコードはCloudflare Pagesにより自動設定される。

---

# 第3部 詳細設計書

本部では、基本設計に基づく各コンポーネントの処理仕様・設定値・実装詳細を記述する。

---

## 10. ビルドパイプライン

### 10.1 処理フロー

`npm run build` 実行時、以下の4段階で処理が実行される。

```
┌──────────────────┐    ┌──────────────────┐    ┌──────────────┐    ┌──────────────────┐
│ Stage 1          │    │ Stage 2          │    │ Stage 3      │    │ Stage 4          │
│ normalize-images │───→│ organize-posts   │───→│ astro build  │───→│ image-optimize   │
│                  │    │                  │    │              │    │                  │
│ EXIF回転を       │    │ 日付に基づき      │    │ 静的HTML/CSS │    │ dist内画像を     │
│ ピクセルに反映    │    │ yyyy/mm/に配置    │    │ を生成        │    │ 圧縮・リサイズ    │
│                  │    │ url-map.json生成  │    │              │    │                  │
│ 対象: public/    │    │ 対象: src/content │    │ 出力: dist/  │    │ 対象: dist/      │
│ images/uploads/  │    │ /posts/          │    │              │    │ images/uploads/  │
└──────────────────┘    └──────────────────┘    └──────────────┘    └──────────────────┘
```

### 10.2 package.json スクリプト定義

```json
{
  "scripts": {
    "dev": "node scripts/normalize-images.mjs && node scripts/organize-posts.mjs && astro dev",
    "build": "node scripts/normalize-images.mjs && node scripts/organize-posts.mjs && astro build",
    "preview": "astro preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  }
}
```

---

## 11. コンテンツ管理

### 11.1 記事ファイル配置規則

記事ファイルはfrontmatterの`date`フィールドに基づき、`src/content/posts/{yyyy}/{mm}/`ディレクトリに配置される。この配置はビルド前処理（`organize-posts.mjs`）により自動的に強制される。

### 11.2 コンテンツスキーマ定義

定義ファイル: `src/content.config.ts`

```typescript
const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "src/content/posts" }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    draft: z.boolean().optional().default(false),
    tags: z.array(z.string()).optional().default([]),
    thumbnail: z.string().optional(),
    summary: z.string().optional(),
  }),
});
```

### 11.3 organize-posts.mjs の処理仕様

| 処理項目 | 内容 |
| :--- | :--- |
| 対象ディレクトリ | `src/content/posts/` |
| 入力 | 全`.md`ファイル（再帰スキャン） |
| 処理1 | frontmatterの`date`を解析し、`yyyy/mm/`ディレクトリを決定 |
| 処理2 | 現在のディレクトリと異なる場合、ファイルを移動 |
| 処理3 | `public/admin/url-map.json`を生成（各記事のslug→公開URLマッピング） |
| 出力 | 整理された記事ファイル + url-map.json |

---

## 12. CMS設定

### 12.1 設定ファイル

設定ファイル: `public/admin/config.yml`

### 12.2 バックエンド設定

```yaml
backend:
  name: github
  repo: bickojima/my-blog
  branch: main
  base_url: https://reiwa.casa
  auth_endpoint: /auth
```

`base_url`にはOAuth認証サーバーのURLを指定する。`auth_endpoint`はCloudflare Functionsの認証エンドポイントである。

### 12.3 メディア設定

```yaml
media_folder: "public/images/uploads"
public_folder: "/images/uploads"
```

アップロード画像はGit管理下の`public/images/uploads/`に保存される。HEIC/HEIF形式はiOS側で自動的にJPEGに変換される（管理画面カスタマイズによる）。

### 12.4 コレクション定義

単一のコレクション「記事」で全記事を管理する。

```yaml
collections:
  - name: "posts"
    label: "記事"
    folder: "src/content/posts"
    create: true
    path: "{{year}}/{{month}}/{{slug}}"
    slug: "{{slug}}"
```

- `path`: ファイルの保存・読み取りパスを定義。CMSがサブディレクトリ`yyyy/mm/`内の既存記事を再帰スキャンする
- `slug`: ファイル名部分のみ（タイトルベース）

---

## 13. 管理画面UIカスタマイズ

すべてのカスタマイズは`public/admin/index.html`に実装されている。

### 13.1 カスタマイズ対象と処理方式

```
┌───────────────────────────────────────────────────────┐
│                admin/index.html (801行)                │
│                                                       │
│  ┌─────────────────┐  ┌────────────────────────────┐ │
│  │   CSS (Style)    │  │   JavaScript              │ │
│  │                 │  │                            │ │
│  │ PC向けスタイル    │  │ MutationObserver(※RAF     │ │
│  │   日付バッジ     │  │  デバウンス済み)            │ │
│  │   削除ボタン色   │  │   ├ addSiteLink            │ │
│  │                 │  │   ├ formatCollectionEntries│ │
│  │ モバイル         │  │   ├ relabelImageButtons   │ │
│  │   (≤799px)      │  │   ├ updateDeleteButtonState│ │
│  │   sticky header │  │   ├ showPublicUrl          │ │
│  │   ボトムシート   │  │   └ manageDropdownOverlay │ │
│  │   2列グリッド    │  │                            │ │
│  │   44pxタップ領域 │  │ hashchange リスナー        │ │
│  │                 │  │   └ showPublicUrl再実行    │ │
│  │ iOS対応         │  │                            │ │
│  │   16px font     │  │ HEIC accept制御            │ │
│  │   image-orient. │  │ EXIF canvas補正（upload時） │ │
│  │                 │  │ pull-to-refresh無効化      │ │
│  │                 │  │   touchstart/touchmove     │ │
│  │                 │  │   (エディタ内は除外)        │ │
│  └─────────────────┘  └────────────────────────────┘ │
└───────────────────────────────────────────────────────┘
```

### 13.2 モバイルレスポンシブ対応（≤799px）

Decap CMSはデフォルトではモバイル対応が不十分であるため、以下のCSS/JSカスタマイズを適用した。

| 対象要素 | カスタマイズ内容 | 目的 |
| :--- | :--- | :--- |
| AppMainContainer | `max-width: 100vw; min-width: 0` | 横はみ出し防止 |
| SidebarContainer | `position: initial` | サイドバーを通常フローに変更 |
| EditorControlBar | `position: sticky; top: 0; z-index: 300` | 上部固定 |
| ToolbarButton / PublishedToolbarButton | `flex-shrink: 0; min-height: 44px` | Apple HIG準拠タップ領域確保 |
| DropdownList | `position: fixed; bottom: 0; z-index: 99999` | ボトムシート形式で画面下部に表示 |
| StyledModal | `width: 95vw` | 画面幅に合わせる |
| CardGrid | `grid-template-columns: repeat(2, 1fr)` | メディア2列表示 |
| FileWidgetButton / ImageWidgetButton | `display: block; width: 100%` | ボタン全幅表示 |

### 13.3 削除ボタンのラベル区別

操作ミス防止のため、文脈に応じて削除ボタンのラベルを変更する。

| 文脈 | 元ラベル | 変更後ラベル | スタイル |
| :--- | :--- | :--- | :--- |
| エディタ内画像ウィジェット | 削除 / 削除する | 選択解除 | グレー背景 |
| メディアライブラリ | 削除 / 削除する | 完全削除 | 赤色背景 |

### 13.4 iOS固有対応

| 対応内容 | 手法 | 理由 |
| :--- | :--- | :--- |
| 自動ズーム防止 | `font-size: 16px !important` | iOS は16px未満入力欄でフォーカス時に自動ズームする |
| HEIC→JPEG変換 | `input[type="file"]` のaccept属性制限 | iOSはaccept制限によりHEICを自動変換する |
| pull-to-refresh無効化 | touchstart/touchmove の preventDefault | 編集中の誤リロード防止 |
| エディタtouchmove除外 | Slate(`data-slate-editor`) / CodeMirror をホワイトリスト | codeblock挿入時のクラッシュ防止 |
| MutationObserverデバウンス | `requestAnimationFrame` で1フレームに1回に制限 | codeblock等の大量DOM変更による過負荷防止 |
| codeblockボタン非表示 | `hideCodeBlockOnMobile()` でモバイル（≤799px）時に非表示 | Slate v0.47 void nodeクラッシュが根本修正不可能なため機能自体を無効化 |
| Slateエラーハンドラ | `window.addEventListener('error')` で `toSlatePoint` 等を握りつぶし | 既存codeblock記事を開いた際のクラッシュ画面を回避 |

### 13.5 本番サイトリンク

サイドバーのコレクション一覧の下に「ブログを見る」リンクを表示し、本番サイト（`https://reiwa.casa`）へのワンクリックアクセスを提供する。

- `addSiteLink()` 関数が `[class*=SidebarContainer]` に `<a>` 要素を動的注入
- 新規タブで開く（`target="_blank"`）
- 重複防止: `#cms-site-link` IDで既存チェック

### 13.6 公開URL表示

記事編集画面で、画面下部に公開URLをリアルタイム表示する。タイトルと日付のフィールドを監視し、`https://reiwa.casa/posts/{年}/{月}/{タイトル}` 形式で動的生成する。

- `hashchange` イベントで画面遷移を検知し、エディタ外では自動非表示
- ドロップダウン（ボトムシート）表示中は `manageDropdownOverlay()` でURLバーを一時非表示にし、重なりを防止

### 13.7 EXIF画像回転の方針

CMS管理画面での画像表示はCSS `image-orientation: from-image` に委ねる。JavaScript による画像src書き換え（canvas経由の再生成）は、EXIF メタデータの消失と一部ブラウザでの `createImageBitmap` のEXIF非対応により逆効果になるため、廃止した（fixPreviewImageOrientation 削除）。

---

## 14. 画像処理パイプライン

### 14.1 全体フロー

画像は3段階の処理パイプラインを経て表示される。

```
┌────────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌────────────┐
│ CMS画像     │     │ Stage 1: prebuild│     │ Stage 2: postbuild│    │ Stage 3:   │
│ アップロード │────→│ normalize-images │────→│ image-optimize   │───→│ CSS表示     │
│             │     │                  │     │                  │    │            │
│ EXIF付きJPEG│     │ .rotate()で      │     │ .rotate()で再確認│    │ image-     │
│ or HEIC→JPEG│     │ ピクセルに反映    │     │ リサイズ: ≤1200px│    │ orientation│
│             │     │ メタデータ除去    │     │ 圧縮: 80%品質    │    │ : from-    │
│ 保存先:     │     │                  │     │                  │    │ image      │
│ public/     │     │ 対象: public/    │     │ 対象: dist/      │    │            │
│ images/     │     │ images/uploads/  │     │ images/uploads/  │    │ Base.astro │
│ uploads/    │     │                  │     │                  │    │            │
└────────────┘     └──────────────────┘     └──────────────────┘    └────────────┘
```

### 14.2 normalize-images.mjs（Stage 1）

| 項目 | 内容 |
| :--- | :--- |
| 実行タイミング | ビルド前（prebuild） |
| 対象ディレクトリ | `public/images/uploads/` |
| 対象形式 | JPEG, PNG, WebP |
| 処理内容 | EXIF orientation値が1以外の場合、sharpの`.rotate()`でピクセルを回転し上書き保存 |
| 背景 | iPhoneで撮影した写真はEXIF orientationタグで表示方向を指定しており、一部ブラウザでは正しく解釈されない |

### 14.3 image-optimize.mjs（Stage 2）

| 項目 | 内容 |
| :--- | :--- |
| 実行タイミング | ビルド後（Astroの`astro:build:done`フック） |
| 対象ディレクトリ | `dist/images/uploads/` |
| 最大幅 | 1200px（超過時リサイズ） |
| JPEG品質 | 80%（mozjpeg） |
| PNG品質 | 80%（compressionLevel: 9） |
| WebP品質 | 80% |
| 追加処理 | `.rotate()`による回転再確認、EXIF orientation≥5の場合はwidth/height入替 |

### 14.4 CSS フォールバック（Stage 3）

`Base.astro`のグローバルCSS、および`admin/index.html`のCMSスタイルに以下を設定し、ブラウザ側のフォールバックとしている。

```css
img {
  image-orientation: from-image;
}
```

CMS管理画面ではDecap CMSの各コンポーネント内画像にも `!important` 付きで適用している。JavaScript によるcanvas経由のEXIF補正は、EXIFメタデータ消失の副作用があるため廃止済み（CSS に委ねる方針）。

---

# 第4部 運用設計書

本部では、システムの移行・バックアップ・転用・障害対応に関する手順を定義する。

---

## 15. 移行設計

本セクションは、サイトのコンテンツを維持しつつフロントエンド・バックエンドを全面的に作り直す場合の手順を定義するものである。

### 15.1 移行対象の分類

```
┌──────────────────────────────────────────────────────────────┐
│                     移行対象資産                              │
│                                                              │
│  ┌────────────────────┐  ┌────────────────────────────────┐ │
│  │ コンテンツ（必須移行）│  │ システム（再構築対象）          │ │
│  │                    │  │                                │ │
│  │ src/content/posts/ │  │ src/pages/                     │ │
│  │   *.md (記事本文)   │  │ src/layouts/                   │ │
│  │                    │  │ src/components/                │ │
│  │ public/images/     │  │ src/lib/                       │ │
│  │   uploads/ (画像)   │  │ src/plugins/                   │ │
│  │                    │  │ src/integrations/              │ │
│  │ public/admin/      │  │ scripts/                       │ │
│  │   config.yml (設定) │  │ functions/                     │ │
│  └────────────────────┘  │ astro.config.mjs               │ │
│                          │ public/admin/index.html         │ │
│                          └────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### 15.2 コンテンツ移行手順

| 手順 | 作業内容 | 備考 |
| :--- | :--- | :--- |
| 1 | `src/content/posts/` 配下の全`.md`ファイルをコピー | ディレクトリ構造（yyyy/mm/）ごと移行する |
| 2 | `public/images/uploads/` 配下の全画像ファイルをコピー | 記事本文およびサムネイルが参照する画像 |
| 3 | frontmatterスキーマの互換性を確認 | `title`, `date`, `draft`, `tags`, `thumbnail`, `summary` の全フィールドが新システムで対応していること |
| 4 | 画像パス（`/images/uploads/`）の互換性を確認 | 新システムで同一パスにて画像が配信されること |
| 5 | URL構造の互換性を確認 | `/posts/{yyyy}/{mm}/{slug}` 形式が維持されること。変更する場合はリダイレクト設定を行う |

### 15.3 CMS設定の移行

`public/admin/config.yml` の以下の項目を新環境に合わせて更新する。

| 項目 | 現在値 | 変更が必要な条件 |
| :--- | :--- | :--- |
| `backend.repo` | `bickojima/my-blog` | GitHubリポジトリが異なる場合 |
| `backend.base_url` | `https://reiwa.casa` | ドメインが異なる場合 |
| `media_folder` | `public/images/uploads` | 画像保存先を変更する場合 |
| `public_folder` | `/images/uploads` | 画像配信パスを変更する場合 |

### 15.4 移行時の検証チェックリスト

| No. | 検証項目 | 確認方法 |
| :--- | :--- | :--- |
| 1 | 全記事が正常にビルドされる | `npm run build` が成功する |
| 2 | 全記事のURLが正しい | ビルド後のdist/posts/ディレクトリ構造を確認 |
| 3 | 画像が正常に表示される | ビルド後のdist/images/uploads/に全画像が存在する |
| 4 | frontmatterの検証が通る | `npm test` のcontent-validationが全件PASS |
| 5 | CMS管理画面から記事一覧が表示される | /admin/ にアクセスし記事一覧を確認 |
| 6 | CMS管理画面から記事の編集・保存ができる | 任意の記事を編集してcommitされることを確認 |

---

## 16. バックアップ設計

### 16.1 バックアップ方針

本システムの全データはGitHubリポジトリに格納されており、Gitの分散バージョン管理によりバックアップが担保されている。

### 16.2 バックアップ対象

```
┌──────────────────────────────────────────────┐
│            GitHubリポジトリ (main branch)      │
│                                              │
│  ┌──────────────┐  ┌──────────────────────┐ │
│  │ コンテンツ     │  │ ソースコード          │ │
│  │              │  │                      │ │
│  │ 記事 (.md)    │  │ フロントエンド        │ │
│  │ 画像 (uploads)│  │ バックエンド (auth)   │ │
│  │ CMS設定       │  │ スクリプト            │ │
│  │              │  │ テスト               │ │
│  └──────────────┘  └──────────────────────┘ │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │ バージョン履歴                         │   │
│  │ 全コミット履歴によりいつでも任意の       │   │
│  │ 時点の状態に復元可能                    │   │
│  └──────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

### 16.3 バックアップ範囲と復元方法

| 対象 | 保管場所 | 復元方法 |
| :--- | :--- | :--- |
| 記事データ（Markdown） | GitHub リポジトリ | `git clone` またはリポジトリの任意コミットを checkout |
| 画像ファイル | GitHub リポジトリ（`public/images/uploads/`） | 同上 |
| CMS設定 | GitHub リポジトリ（`public/admin/config.yml`） | 同上 |
| ソースコード | GitHub リポジトリ | 同上 |
| ビルド成果物 | Cloudflare Pages（デプロイ履歴） | Cloudflare Pagesダッシュボードから過去のデプロイにロールバック可能 |
| 環境変数 | Cloudflare Pages設定 | 手動で再設定が必要（`OAUTH_CLIENT_ID`, `OAUTH_CLIENT_SECRET`） |

### 16.4 バックアップ対象外

| 対象 | 理由 | 対処 |
| :--- | :--- | :--- |
| Cloudflare Pages環境変数 | Gitリポジトリに含まれない | 別途安全な場所に記録しておく |
| GitHub OAuth Appの設定 | GitHub Settingsで管理 | Client ID / Secret を安全な場所に記録しておく |
| DNSレコード | Cloudflareで自動管理 | カスタムドメイン設定手順を本ドキュメントに記載済み |

### 16.5 災害復旧手順

GitHubリポジトリが利用可能な場合、以下の手順でシステムを復旧する。

1. GitHubリポジトリをcloneする
2. Cloudflare Pagesプロジェクトを新規作成し、リポジトリを接続する
3. 環境変数（`OAUTH_CLIENT_ID`, `OAUTH_CLIENT_SECRET`）を設定する
4. カスタムドメインを設定する
5. ビルド＆デプロイを実行する
6. GitHub OAuth Appの Callback URL を新ドメインに更新する

---

## 17. フォーク転用ガイド

本プロジェクトを別サイト向けにフォークして転用する場合、以下の箇所を変更する必要がある。

### 17.1 サイト固有の変更箇所一覧

| No. | ファイル | 変更箇所 | 現在値 | 説明 |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `public/admin/config.yml` | `backend.repo` | `bickojima/my-blog` | GitHubリポジトリ名 |
| 2 | `public/admin/config.yml` | `backend.base_url` | `https://reiwa.casa` | 本番ドメイン |
| 3 | `src/layouts/Base.astro` | サイトタイトル | `tbiのブログ` | ヘッダー・フッターに表示される |
| 4 | `public/robots.txt` | Sitemap URL | `https://reiwa.casa/sitemap.xml` | サイトマップURL |
| 5 | `public/admin/index.html` | 公開URL表示のドメイン | `reiwa.casa` | JS内のハードコード値 |
| 6 | Cloudflare環境変数 | `OAUTH_CLIENT_ID` / `SECRET` | - | 新サイト用のOAuth App |
| 7 | GitHub OAuth App | Callback URL | `https://reiwa.casa/auth/callback` | 新ドメインに変更 |

### 17.2 転用時に変更不要な箇所

以下のスクリプト・設定はサイト固有の値を含まず、そのまま転用可能である。

| ファイル | 理由 |
| :--- | :--- |
| `scripts/normalize-images.mjs` | 相対パスのみ使用 |
| `scripts/organize-posts.mjs` | 相対パスのみ使用 |
| `src/integrations/image-optimize.mjs` | 相対パスのみ使用 |
| `src/plugins/rehype-image-caption.mjs` | 汎用プラグイン |
| `src/lib/posts.ts` | 汎用ロジック |
| `functions/auth/index.js` | 環境変数から取得 |
| `functions/auth/callback.js` | 環境変数から取得 |
| `tests/` | テストは設定値を動的に読み取る |

### 17.3 転用手順

1. リポジトリをフォークする
2. 17.1 の変更箇所一覧に従い各ファイルを更新する
3. `src/content/posts/` 配下の記事を削除し、新サイトの記事を配置する
4. `public/images/uploads/` 配下の画像を新サイトのものに差し替える
5. GitHub OAuth Appを新規作成し、Client ID / Secret を取得する
6. Cloudflare Pagesプロジェクトを新規作成し、環境変数を設定する
7. `npm test` で全テストがPASSすることを確認する
8. デプロイを実行する

---

## 18. トラブルシューティング

### 18.1 「OAuth client ID not configured」エラー

**原因**: Cloudflare Pagesの環境変数が未設定である。

**対処**: Cloudflare Pages > 設定 > 環境変数で`OAUTH_CLIENT_ID`と`OAUTH_CLIENT_SECRET`を設定し、再デプロイを実行する。

### 18.2 「redirect_uri is not associated」エラー

**原因**: GitHub OAuth AppのCallback URLが不正である。

**対処**: GitHub OAuth App設定で、Authorization callback URLが`https://reiwa.casa/auth/callback`であることを確認する（末尾スラッシュなし、`https://`）。

### 18.3 認証後にログインできない

**原因**: postMessageのハンドシェイクが正しく動作していない。

**対処**: `functions/auth/callback.js`が以下のプロトコルを正しく実装しているか確認する。
1. `window.opener.postMessage("authorizing:github", "*")` を送信
2. 親ウィンドウからの応答を待機
3. トークンを含むメッセージを`event.origin`宛に送信

---

**最終更新**: 2026年2月15日（v1.4）
