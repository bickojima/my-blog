# tbiのブログ システム設計書

## 改訂履歴

| 版数 | 日付 | 内容 |
| :--- | :--- | :--- |
| 1.0 | 2026-02-15 | 初版作成（全PR履歴より抽出） |
| 1.1 | 2026-02-15 | JTC設計書体系に再構成（第1部〜第4部構成） |
| 1.2 | 2026-02-15 | 認証基盤（第2.4章）を大幅拡充: Decap CMS連携詳細、認証アーキテクチャ図、シーケンス図、セキュリティ考慮事項、GitHub OAuth App設定を追加 |
| 1.3 | 2026-02-15 | Playwright E2Eテスト導入（PC/iPad/iPhone対応）、システム変更履歴追加 |
| 1.4 | 2026-02-15 | EXIF画像回転修正（fixPreviewImageOrientation削除）、ドロップダウンCSS位置制御、公開URLバーhashchange対応、テスト更新（237テスト） |
| 1.5 | 2026-02-15 | CMS管理画面ヘッダーに本番サイトリンク追加（CMS-11） |
| 1.6 | 2026-02-15 | iPhone codeblockクラッシュ対策（MutationObserverデバウンス、touchmoveエディタ除外） |
| 1.7 | 2026-02-20 | 本番/テスト環境分離（staging.reiwa.casa）、admin/index.htmlサイトURL動的化、テスト環境セクション（2.5.4章）追加 |
| 1.8 | 2026-02-20 | [STAGING]ラベル実装（2.5.4.3章追加）、CNAME方式ドメイン接続（2.5.3章更新）、CMS-11/3.4.5/3.4.6を環境動的化 |
| 1.9 | 2026-02-20 | 固定ページシステム導入（FR-14/CMS-13追加、pagesコレクション、ヘッダーナビ動的生成） |
| 1.10 | 2026-02-20 | 固定ページ不具合修正: CMS slugテンプレート修正（`{{slug}}`→`{{fields.slug}}`）、公開URL表示の固定ページ対応、ヘッダーナビドロップダウンUX改善（hover遅延閉じ・トグルボタン分離）、再発防止テスト追加（218テスト） |
| 1.11 | 2026-02-20 | テスト・ドキュメント全面レビュー: Vitest 18件追加（218テスト）、E2E 11テストシナリオ追加（237テスト）、要件記述をふるまい中心に改訂、バグ一覧（4.5章）追加 |
| 1.12 | 2026-02-21 | FR-10テスト充足化、CMS-14/CMS-15要件追加、要件トレーサビリティマトリクス追加（1.5章）、章番号を部ベース体系（1.x〜4.x）に再構成 |
| 1.13 | 2026-02-21 | テスト動的化（ハードコードコンテンツ排除）、ヘッダーナビ条件分岐テスト追加（2.1.3章）、境界値・一意性テスト追加（2.1.4章）、FR-14トレーサビリティ更新 |
| 1.14 | 2026-02-21 | ブランチマージ手順（4.6章）追加、3.3.4章コレクション順序修正（posts先頭）、CMS-05固定ページ番号バッジ追加、コードリファクタリング（image-optimize.mjs writeFile整理、テスト変数重複排除） |
| 1.15 | 2026-02-21 | 固定ページ一覧に下書きバッジ表示追加（CMS-05更新）、sortable_fieldsオブジェクト形式非対応を確認しv3.10.0互換の文字列配列に修正 |

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
| 2026-02-20 | **CMSプレビュースタイル**: `CMS.registerPreviewStyle()` で本番サイト相当のCSSをプレビューiframeに注入 | - |
| 2026-02-20 | **公開URLバー改善**: visibility-based判定、ドロップダウン誤復元修正 | - |
| 2026-02-20 | **E2Eテスト拡充**: CMS UIカスタマイズ検証34テスト追加（合計64テスト×3デバイス=204テスト） | - |
| 2026-02-20 | **本番/テスト環境分離**: staging.reiwa.casa構築（CNAME方式）、admin/index.htmlサイトURL動的化、[STAGING]ラベル表示、専用OAuth App | - |
| 2026-02-20 | **固定ページシステム導入**: pagesコレクション、ヘッダーナビ動的生成、[slug].astroルーティング | - |
| 2026-02-20 | **固定ページ不具合修正**: CMS slugテンプレート`{{slug}}`→`{{fields.slug}}`（ファイル名がタイトルになる不具合）、公開URL表示の固定ページ対応（`/posts/タイトル`→`/slug`）、ドロップダウンhover時のCSS`:hover`とJSトグルの競合修正、メニューgap問題（margin→padding）修正 | - |

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

1.1. [システム概要](#11-システム概要)
1.2. [機能要件](#12-機能要件)
1.3. [CMS管理画面要件](#13-cms管理画面要件)
1.4. [非機能要件](#14-非機能要件)
1.5. [要件トレーサビリティマトリクス](#15-要件トレーサビリティマトリクス)

### 第2部 基本設計書

2.1. [システム構成](#21-システム構成)
2.2. [技術スタック](#22-技術スタック)
2.3. [URL設計](#23-url設計)
2.4. [認証基盤](#24-認証基盤)
2.5. [インフラストラクチャ](#25-インフラストラクチャ)

### 第3部 詳細設計書

3.1. [ビルドパイプライン](#31-ビルドパイプライン)
3.2. [コンテンツ管理](#32-コンテンツ管理)
3.3. [CMS設定](#33-cms設定)
3.4. [管理画面UIカスタマイズ](#34-管理画面uiカスタマイズ)
3.5. [画像処理パイプライン](#35-画像処理パイプライン)

### 第4部 運用設計書

4.1. [移行設計](#41-移行設計)
4.2. [バックアップ設計](#42-バックアップ設計)
4.3. [フォーク転用ガイド](#43-フォーク転用ガイド)
4.4. [トラブルシューティング](#44-トラブルシューティング)
4.5. [バグ一覧](#45-バグ一覧)
4.6. [ブランチマージ手順](#46-ブランチマージ手順)

---

# 第1部 要件定義書

本部では、システムが満たすべき要件を定義する。要件IDは本部第1.5章の要件トレーサビリティマトリクス、および TEST-REPORT.md のテストケースにて参照する。

---

## 1.1. システム概要

### 1.1.1 目的

本システムは、Astro（静的サイトジェネレーター）とDecap CMS（ヘッドレスCMS）を組み合わせたブログシステムである。Cloudflare Pages上で静的サイトとして配信し、GitHub OAuthによる認証を介してCMSから記事を管理する。

### 1.1.2 システム全体像

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

### 1.1.3 利用者

| 種別 | 操作内容 | アクセス経路 |
| :--- | :--- | :--- |
| 閲覧者 | 記事の閲覧 | `https://reiwa.casa` |
| 管理者 | 記事の作成・編集・公開 | `https://reiwa.casa/admin` |

---

## 1.2. 機能要件

### 1.2.1 機能要件一覧 (FR)

| ID | 要件 | 実装箇所 | 備考 |
| :--- | :--- | :--- | :--- |
| FR-01 | 記事管理: タイトル・日付・タグ等のメタデータを持つ記事を作成・編集・公開できる | `content.config.ts`, `config.yml` | Markdown + frontmatter形式 |
| FR-02 | URL生成: 記事の公開URLが日付とファイル名に基づき自動生成される | `src/lib/posts.ts` | `/posts/{年}/{月}/{ファイル名}` 形式 |
| FR-03 | 下書き: 下書き記事は一覧に表示されないが、URLを知っていればアクセスできる | `pages/*.astro` | 限定公開的な挙動 |
| FR-04 | タグ分類: 記事をタグで分類し、タグごとの一覧ページを閲覧できる | `pages/tags/[tag].astro` | `/tags/{タグ名}` で表示 |
| FR-05 | アーカイブ: 年別・月別の記事一覧ページが自動生成される | `pages/posts/[year]/`, `[month]/` | ArchiveNav.astroでナビ表示 |
| FR-06 | 画像アップロード: CMSから画像をアップロードしGit管理できる | `config.yml` | `public/images/uploads/` に保存 |
| FR-07 | 画像最適化: アップロード画像が自動的にリサイズ・圧縮される | `image-optimize.mjs` | 最大1200px, 80%品質, ビルド後自動実行 |
| FR-08 | EXIF回転正規化: iPhone等で撮影した画像が正しい向きで表示される | `normalize-images.mjs`, `image-optimize.mjs`, `Base.astro` | ピクセル回転 + CSS fallbackの3段階パイプライン |
| FR-09 | 記事自動整理: 記事ファイルが日付に基づくディレクトリに自動配置される | `organize-posts.mjs` | `yyyy/mm/` 形式、prebuildで実行 |
| FR-10 | URLマッピング: CMS上で各記事の公開URLを確認できるようにマッピングデータが生成される | `organize-posts.mjs` | `url-map.json` を生成 |
| FR-11 | HEIC変換: iOSで撮影したHEIC形式の画像がJPEGに自動変換される | `admin/index.html` | accept属性制限によるiOS自動変換 |
| FR-12 | CMS認証: 管理者がGitHubアカウントでCMSにログインできる | `functions/auth/` | GitHub OAuth + Cloudflare Functions |
| FR-13 | 画像キャプション: 画像にタイトルを設定するとキャプション付きで表示される | `rehype-image-caption.mjs` | `<figcaption>` 変換 + lazy loading自動付与 |
| FR-14 | 固定ページ管理: CMSから固定ページを作成・編集、ヘッダーナビに動的表示 | `src/content/pages/`, `src/pages/[slug].astro`, `Base.astro` | pagesコレクション |

### 1.2.2 各要件の詳細

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

#### FR-14 固定ページ管理

固定ページはCMSから作成・編集可能な静的ページ。ヘッダーナビゲーションに動的表示される。

| フィールド | 型 | 必須 | デフォルト | 説明 |
| :--- | :--- | :--- | :--- | :--- |
| `title` | string | 必須 | - | ページタイトル |
| `slug` | string | 必須 | - | URLスラグ（半角英数字とハイフンのみ、ファイル名に使用） |
| `order` | number | 任意 | `0` | ヘッダーナビ表示順（昇順、重複時は順不定だがエラーにはならない） |
| `draft` | boolean | 任意 | `false` | 下書きフラグ |

**ヘッダーナビゲーション表示ルール:**

| 固定ページ数 | ヘッダー表示 |
|:---|:---|
| 0 | リンクなし |
| 1 | 直接リンク（`<a>`タグ） |
| 2以上 | 最優先ページ名 + ▾ドロップダウン（全ページ一覧） |

**ドロップダウン動作:**
- ページ名部分: 直接リンク（クリック/タップで即遷移）
- ▾ボタン: クリック/タップでドロップダウン開閉トグル
- PC: `mouseenter`でメニュー表示、`mouseleave`で300ms遅延後に閉じる（メニューへの移動を許容）
- メニューと要素間のギャップは`padding-top`で実装（`margin-top`だとホバー判定が途切れる）
- CSS `:hover` ではなく JS `is-open` クラスで表示制御（`:hover` とトグルの競合を防止）

**CMS設定上の注意:**
- `config.yml` の固定ページコレクションの `slug` プロパティは `"{{fields.slug}}"` を使用する
- `"{{slug}}"` は Decap CMS ではタイトルのURL安全版を意味するため、フィールド値を使うには `"{{fields.slug}}"` が必要

#### FR-03 下書き機能

下書き状態（`draft: true`）の記事は、一覧ページ（トップ・アーカイブ・タグ）に表示されない。ただし個別記事URL（`/posts/yyyy/mm/記事名`）に直接アクセスした場合は閲覧可能である。YouTubeの「限定公開」に相当する挙動である。

#### FR-04 タグによる分類

記事の分類にはタグを使用する。カテゴリ機能はPR#41で廃止済みである。タグは各記事のfrontmatterに配列で定義し、`/tags/{タグ名}` で該当記事の一覧を表示する。

---

## 1.3. CMS管理画面要件

### 1.3.1 CMS管理画面要件一覧 (CMS)

| ID | 要件 | 実装箇所 | 備考 |
| :--- | :--- | :--- | :--- |
| CMS-01 | モバイルレスポンシブ: 799px以下のモバイル端末で管理画面を使用できる | `admin/index.html` CSS | サイドバー、ボタン、モーダル等 |
| CMS-02 | iOS自動ズーム防止: iPhoneで入力フィールドにフォーカスしても画面がズームしない | `admin/index.html` CSS | font-size 16px以上を確保（iOS HIG準拠） |
| CMS-03 | pull-to-refresh無効化: 編集中にスクロール操作でページがリロードされない | `admin/index.html` JS | touchstart/touchmoveのpreventDefault |
| CMS-04 | 削除ボタンラベル区別: 画像の「選択解除」と「完全削除」が明確に区別できる | `admin/index.html` JS | 操作ミス防止 |
| CMS-05 | 一覧表示改善: 記事一覧で日付・下書き状態、固定ページ一覧で番号・下書き状態が視認しやすく表示される | `admin/index.html` JS | MutationObserver使用 |
| CMS-06 | エディタ公開URL表示: 編集中の記事・ページの公開URLがリアルタイムで表示される | `admin/index.html` JS | url-map.json連携 |
| CMS-07 | メディアライブラリ: モバイルでもメディア一覧が見やすく操作しやすい | `admin/index.html` CSS | 2列グリッド、タッチスクロール対応 |
| CMS-08 | 保存ボタン常時表示: モバイルでも保存・公開ボタンが常に画面内に表示される | `admin/index.html` CSS | sticky header、min-height 44px（Apple HIG準拠） |
| CMS-09 | ドロップダウン重なり防止: ドロップダウンメニューが公開URLバーと重ならない | `admin/index.html` JS | manageDropdownOverlay関数 |
| CMS-10 | 公開URLバー自動制御: 画面遷移時に公開URLバーが適切に表示・非表示される | `admin/index.html` JS | hashchangeリスナー |
| CMS-11 | サイトリンク表示: 管理画面からワンクリックで公開サイトにアクセスできる | `admin/index.html` JS | addSiteLink関数、staging環境では[STAGING]ラベル付与 |
| CMS-12 | codeblockクラッシュ防止: モバイルでcodeblock操作によるクラッシュが発生しない | `admin/index.html` CSS/JS | codeblockボタン非表示、Slateエラーハンドラ、デバウンス |
| CMS-13 | 固定ページCMS編集: CMSから固定ページのタイトル・slug・表示順・本文を管理できる | `config.yml` pagesコレクション | `src/content/pages/` に保存 |
| CMS-14 | コレクション表示順序: CMS管理画面で記事コレクションが最初に表示される | `config.yml` collections順序 | postsが先頭、pagesが2番目 |
| CMS-15 | プレビュースタイル本番再現: エディタプレビューが本番サイトと同等のスタイルで表示される | `admin/index.html` JS | `CMS.registerPreviewStyle()` |

---

## 1.4. 非機能要件

### 1.4.1 非機能要件一覧 (NFR)

| ID | 要件 | 実装箇所 | 備考 |
| :--- | :--- | :--- | :--- |
| NFR-01 | 静的サイト生成: サイト全体が静的HTMLとして生成・配信される | `astro.config.mjs` | Astro SSG、`output: 'static'` |
| NFR-02 | CDNホスティング: サイトがCDN経由で高速に配信される | `wrangler.toml`, `_routes.json` | Cloudflare Pages + Functions |
| NFR-03 | 管理画面SEO除外: 管理画面が検索エンジンにインデックスされない | `_headers`, `admin/index.html` | `robots: noindex`, `X-Robots-Tag` |
| NFR-04 | 日本語URL対応: 日本語タイトルの記事がそのまま日本語URLで公開される | `config.yml` | Unicode slug（`encoding: "unicode"`） |

---

## 1.5. 要件トレーサビリティマトリクス

要件定義書（第1部）で定義された各要件とテストケース（TEST-REPORT.md）の対応関係を示す。要件追加時は本マトリクスも必ず更新し、充足状況を管理する。

### 1.5.1 機能要件 (FR) → テストケース

| 要件ID | 要件概要 | テストファイル | 対応テストケース | 主テスト手法 | 充足状況 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| FR-01 | 記事管理 (frontmatter) | content-validation | 2.1章 #2〜#5, #9〜#11 | M-03, M-04 | 充足 |
| FR-02 | URL生成 | build | 2.5章 #10 | M-01 | 充足 |
| FR-03 | 下書き | content-validation | 2.1章 #5 | M-04 | 充足 |
| FR-04 | タグ分類 | content-validation, build | 2.1章 #9, 2.5章 #14,#23 | M-04, M-01, M-02 | 充足 |
| FR-05 | アーカイブ | build | 2.5章 #11,#12,#24 | M-01, M-02 | 充足 |
| FR-06 | 画像アップロード | cms-config, build | 2.4章 #6,#7, 2.5章 #28 | M-03, M-01 | 充足 |
| FR-07 | 画像最適化 | build | 2.5章 #30 | M-10, M-12 | 充足 |
| FR-08 | EXIF回転正規化 | content-validation, build, admin-html | 2.1章 #12〜#15, 2.5章 #29, 2.6.4章 | M-10, M-11, M-02 | 充足 |
| FR-09 | 記事自動整理 | content-validation | 2.1章 #7,#8 | M-01, M-03 | 充足 |
| FR-10 | URLマッピングJSON | build | 2.5章 #45〜#50 | M-01, M-02, M-03 | 充足 |
| FR-11 | HEIC→JPEG変換 | admin-html | 2.6.5章 #2 | M-02 | 充足 |
| FR-12 | CMS認証 | auth-functions, build | 2.3章 #1〜#10, 2.5章 #26 | M-06, M-07, M-08 | 充足 |
| FR-13 | 画像キャプション | rehype-image-caption, build | 2.2章 #1〜#8, 2.5章 #31 | M-05, M-02 | 充足 |
| FR-14 | 固定ページ管理 | cms-config, content-validation, build, E2E site | 2.4章 #28〜#39, 2.1.2章 #16〜#23, 2.1.3章 #24〜#34, 2.1.4章 #35〜#40, 2.5章 #32〜#44, E-20, E-21 | M-03, M-04, M-01, M-02, M-11, DOM検証 | 充足 |

### 1.5.2 CMS管理画面要件 (CMS) → テストケース

| 要件ID | 要件概要 | テストファイル | 対応テストケース | 主テスト手法 | 充足状況 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| CMS-01 | モバイルレスポンシブ | admin-html | 2.6.3章 #1〜#10 | M-02 | 充足 |
| CMS-02 | iOS自動ズーム防止 | admin-html | 2.6.5章 #1 | M-02 | 充足 |
| CMS-03 | pull-to-refresh無効化 | admin-html | 2.6.5章 #3,#4 | M-02 | 充足 |
| CMS-04 | 削除ボタンラベル区別 | admin-html | 2.6.6章 #3,#4,#5 | M-02 | 充足 |
| CMS-05 | 一覧表示改善 | admin-html | 2.6.2章 #3, 2.6.6章 #2, 2.6.6章 #10 | M-02 | 充足 |
| CMS-06 | エディタ公開URL表示 | admin-html | 2.6.6章 #6,#7 | M-02 | 充足 |
| CMS-07 | メディアライブラリ | admin-html | 2.6.3章 #8,#10 | M-02 | 充足 |
| CMS-08 | 保存ボタン常時表示 | admin-html | 2.6.3章 #4,#5, 2.6.8章 #1,#2 | M-02 | 充足 |
| CMS-09 | ドロップダウン重なり防止 | admin-html | 2.6.9章 #1〜#3, 2.6.10章 #1〜#8 | M-02 | 充足 |
| CMS-10 | 公開URLバー自動制御 | admin-html, E2E site | 2.6.6章 #6,#7, E-15 | M-02, DOM検証 | 充足 |
| CMS-11 | サイトリンク表示（環境動的） | admin-html | 2.6.6章 #1b | M-02 | 充足 |
| CMS-12 | Slate codeblockクラッシュ対策 | admin-html | 2.6.5b章 #1,#2,#3, 2.6.5章 #5 | M-02 | 充足 |
| CMS-13 | 固定ページCMS編集 | cms-config, content-validation | 2.4章 #28〜#39, 2.1.2章 #16〜#23 | M-03, M-04 | 充足 |
| CMS-14 | コレクション表示順序 | cms-config | 2.4章 #11b | M-03 | 充足 |
| CMS-15 | プレビュースタイル本番再現 | admin-html | 2.6.11章 #1〜#5 | M-02 | 充足 |

### 1.5.3 非機能要件 (NFR) → テストケース

| 要件ID | 要件概要 | テストファイル | 対応テストケース | 主テスト手法 | 充足状況 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| NFR-01 | 静的サイト生成 | build | 2.5章 #1〜#8 | M-01, M-12 | 充足 |
| NFR-02 | Cloudflare Pagesホスティング | build | 2.5章 #6,#7,#8 | M-01 | 充足 |
| NFR-03 | 管理画面SEO除外 | admin-html | 2.6.1章 #3 | M-02 | 充足 |
| NFR-04 | 日本語URL | cms-config | 2.4章 #9,#10 | M-03 | 充足 |

**充足状況: 全要件（FR-01〜FR-14, CMS-01〜CMS-15, NFR-01〜NFR-04）がテストで充足されている。未テスト要件なし。**

---

# 第2部 基本設計書

本部では、要件定義に基づくシステムのアーキテクチャ設計を記述する。各コンポーネントの役割、技術選定、主要な設計判断を示す。

---

## 2.1. システム構成

### 2.1.1 ディレクトリ構成

```
my-blog/
├── functions/                          # サーバーサイド処理
│   └── auth/
│       ├── index.js                    # OAuth認証開始
│       └── callback.js                 # OAuthコールバック
├── public/                             # 静的ファイル（そのままdistにコピー）
│   ├── admin/
│   │   ├── index.html                  # CMS管理画面（CSS/JS含む約950行）
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
│   └── e2e/                            # E2Eテスト（Playwright 3ファイル）
├── CLAUDE.md                           # Claude Code向けプロジェクトガイド
├── astro.config.mjs                    # Astro設定
├── playwright.config.ts                # Playwright E2E設定
├── vitest.config.ts                    # Vitest設定
├── package.json                        # 依存関係・スクリプト定義
└── wrangler.toml                       # Cloudflare設定
```

### 2.1.2 コンポーネント間依存関係

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

### 2.1.3 データフロー概要

```
┌────────┐    ┌──────────┐    ┌───────────────┐    ┌───────────────┐
│ CMS    │    │ GitHub   │    │ Cloudflare    │    │ Cloudflare    │
│ 記事保存│───→│ main push│───→│ Pages ビルド   │───→│ Pages 配信    │
│        │    │          │    │ (npm run build)│    │ (CDN)         │
└────────┘    └──────────┘    └───────────────┘    └───────────────┘
```

---

## 2.2. 技術スタック

### 2.2.1 採用技術一覧

| 分類 | 技術 | バージョン | 用途 |
| :--- | :--- | :--- | :--- |
| SSG | Astro | v5.17.1 | 静的サイト生成 |
| CMS | Decap CMS | v3.10.0 | コンテンツ管理 |
| ホスティング | Cloudflare Pages | - | 静的配信 + Functions |
| 認証 | GitHub OAuth App | - | CMS管理者認証 |
| 画像処理 | sharp | v0.34.5 | 画像圧縮・回転・リサイズ |
| テスト（単体・統合） | Vitest | v4.0.18 | 単体テスト・統合テスト（242テスト） |
| テスト（E2E） | Playwright | v1.58.2 | ブラウザE2Eテスト（PC/iPad/iPhone 237テスト） |
| コンテンツ | Markdown | - | frontmatter形式 |

### 2.2.2 選定理由

| 技術 | 選定理由 |
| :--- | :--- |
| Astro | Markdownネイティブ対応、高速ビルド、コンテンツコレクション機能 |
| Decap CMS | Git-basedでサーバー不要、Markdown対応、日本語対応 |
| Cloudflare Pages | 無料枠が充実、Functions対応、CDN自動配信 |
| GitHub OAuth | Decap CMSのgithubバックエンドと整合する認証方式 |

---

## 2.3. URL設計

### 2.3.1 URL体系

| URL パターン | ページ種別 | ルーティングファイル |
| :--- | :--- | :--- |
| `/` | トップページ（記事一覧） | `src/pages/index.astro` |
| `/posts/{yyyy}/{mm}/{slug}` | 個別記事 | `src/pages/posts/[year]/[month]/[slug].astro` |
| `/posts/{yyyy}` | 年別アーカイブ | `src/pages/posts/[year]/index.astro` |
| `/posts/{yyyy}/{mm}` | 月別アーカイブ | `src/pages/posts/[year]/[month]/index.astro` |
| `/tags/{tag}` | タグ別一覧 | `src/pages/tags/[tag].astro` |
| `/{slug}` | 固定ページ | `src/pages/[slug].astro` |
| `/admin/` | CMS管理画面 | `public/admin/index.html` |

### 2.3.2 URLスラグ生成規則

URLスラグはファイル名（拡張子除く）をそのまま使用する。CMSで新規作成した場合、ファイル名はタイトルから自動生成される。

```
記事ファイル: src/content/posts/2026/02/ブラザープリンターを買った話.md
  ↓
URL: /posts/2026/02/ブラザープリンターを買った話
```

実装箇所: `src/lib/posts.ts` の `getPostUrl()` / `getPostUrlParts()`

同タイトルの記事が同一年月に存在する場合、CMSがファイル名に `-1`, `-2` 等のサフィックスを自動付与する。

### 2.3.3 日付変更時の挙動

frontmatterの日付を変更した場合、次回ビルド時に`organize-posts.mjs`が当該ファイルを正しい`yyyy/mm/`ディレクトリに自動移動する。URLも新しい日付に基づいて生成される。

---

## 2.4. 認証基盤

### 2.4.1 認証方式

GitHub OAuth 2.0 を使用する。Decap CMS は CMS 自体に GitHub API へのアクセストークンを渡すことで認証を完了させるが、OAuth のトークン交換にはサーバーサイド処理（Client Secret の秘匿）が必要である。本システムでは Cloudflare Functions が OAuth プロキシとして動作し、Decap CMS 独自のハンドシェイクプロトコル（Post-Message API）に従いアクセストークンをブラウザに中継する。

### 2.4.2 認証アーキテクチャ

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

### 2.4.3 認証フロー詳細

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

### 2.4.4 Decap CMS 側の認証処理

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

### 2.4.5 Cloudflare Functions の実装

#### 2.4.5.1 `/auth` エンドポイント（`functions/auth/index.js`）

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

#### 2.4.5.2 `/auth/callback` エンドポイント（`functions/auth/callback.js`）

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

### 2.4.6 セキュリティ上の考慮事項

| 項目 | 対策 |
| :--- | :--- |
| Client Secret の保護 | `OAUTH_CLIENT_SECRET` はサーバーサイド（Cloudflare Functions）でのみ使用し、ブラウザには露出しない |
| トークン交換 | 認可コード→アクセストークンの交換はサーバーサイドで実行する（ブラウザで行うと Secret が漏洩する） |
| postMessage のオリジン検証 | callback.js は `event.origin` を使用してトークン送信先を制限する |
| scope の最小化 | `repo,user` のみを要求し、不要な権限は取得しない |
| トークンの保管 | ブラウザの localStorage に保管される。XSS 対策として管理画面に `noindex` を設定し外部からのアクセスを制限する |

### 2.4.7 環境変数

| 変数名 | 説明 | 設定環境 |
| :--- | :--- | :--- |
| `OAUTH_CLIENT_ID` | GitHub OAuth App の Client ID | Production + Preview |
| `OAUTH_CLIENT_SECRET` | GitHub OAuth App の Client Secret | Production + Preview |

### 2.4.8 GitHub OAuth App の設定

GitHub Settings > Developer settings > OAuth Apps で環境ごとに個別のアプリを作成する。

#### 本番環境

| 設定項目 | 値 |
| :--- | :--- |
| Application name | `My Blog CMS` |
| Homepage URL | `https://reiwa.casa` |
| Authorization callback URL | `https://reiwa.casa/auth/callback` |
| Client ID | `Ov23liNxCgnMDc7a1KJC` |
| Cloudflare Pages 環境変数 | Production |

#### テスト環境

| 設定項目 | 値 |
| :--- | :--- |
| Application name | `tbiのブログ CMS (staging)` |
| Homepage URL | `https://staging.reiwa.casa` |
| Authorization callback URL | `https://staging.reiwa.casa/auth/callback` |
| Client ID | `Ov23liv4hYxJQvNUZEgi` |
| Cloudflare Pages 環境変数 | Preview |

> **注意**: Client Secret は GitHub OAuth App 設定画面と Cloudflare Pages 環境変数でのみ管理する。ソースコードにコミットしない。

---

## 2.5. インフラストラクチャ

### 2.5.1 Cloudflare Pages設定

| 項目 | 値 |
| :--- | :--- |
| プロジェクト名 | `my-blog` |
| フレームワーク | Astro |
| ビルドコマンド | `npm run build` |
| 出力ディレクトリ | `dist` |
| ルートディレクトリ | `/` |
| Node.js バージョン | 18以上 |

#### ブランチコントロール

| 項目 | 設定 |
| :--- | :--- |
| プロダクションブランチ | `main`（自動デプロイ有効） |
| プレビューブランチ | カスタム: `staging` のみ |

#### 環境変数

| 変数名 | Production | Preview |
| :--- | :--- | :--- |
| `OAUTH_CLIENT_ID` | 本番OAuth App の Client ID | テストOAuth App の Client ID |
| `OAUTH_CLIENT_SECRET` | 本番OAuth App の Client Secret | テストOAuth App の Client Secret |

### 2.5.2 HTTPヘッダー設定（`_headers`）

管理画面に対して以下のヘッダーを設定し、検索エンジンからのインデックスを防止する。

```
/admin/*
  X-Robots-Tag: noindex
```

### 2.5.3 カスタムドメインとDNS

Cloudflare DNS（`reiwa.casa` ゾーン）で以下のレコードを管理している。

| タイプ | 名前 | ターゲット | プロキシ | 用途 |
| :--- | :--- | :--- | :--- | :--- |
| CNAME | `reiwa.casa` | `my-blog-3cg.pages.dev` | ON | 本番サイト（Pages Production） |
| CNAME | `staging` | `staging.my-blog-3cg.pages.dev` | ON | テストサイト（Pages Preview） |
| CNAME | `blog` | `ghs.google...` | ON | （別用途） |

テスト環境はCloudflare Pagesのカスタムドメイン機能がProductionブランチのみ対応のため、DNS CNAMEレコードでPreview deploymentのURL（`staging.my-blog-3cg.pages.dev`）に直接ルーティングしている。

### 2.5.4 テスト環境

本番サイトへの影響なく新機能をテストするため、`staging`ブランチによるテスト環境を運用する。

| 項目 | 本番環境 | テスト環境 |
| :--- | :--- | :--- |
| URL | `https://reiwa.casa` | `https://staging.reiwa.casa` |
| ブランチ | `main` | `staging` |
| Cloudflare Pages | Production deployment | Preview deployment（カスタムドメイン） |
| GitHub OAuth App | 本番用 | テスト用（別アプリ） |
| OAUTH_CLIENT_ID | Production環境変数 | Preview環境変数 |
| robots.txt | `Allow: /` | `Disallow: /`（インデックス防止） |
| CMS config.yml base_url | `https://reiwa.casa` | `https://staging.reiwa.casa` |
| CMS config.yml branch | `main` | `staging` |

#### 2.5.4.1 ブランチ運用

```
main (本番)  ←── merge ── staging (テスト) ←── merge ── feature/*
     │                        ↑
     └── 定期マージ ──────────┘ (コンテンツ同期)
```

- 新機能: `feature/*` → `staging` へPR → テスト → `staging` → `main` へPR
- コンテンツ同期: `main` の記事更新を `staging` に定期マージ
- `config.yml` の `base_url` / `branch` は各ブランチで手動管理。staging → main マージ時は main の値を維持する。

#### 2.5.4.2 サイトURL動的化

`public/admin/index.html` 内のサイトURL参照（`addSiteLink`、`showPublicUrl`）は `window.location.origin` で動的取得する。これにより、本番（`reiwa.casa`）・テスト（`staging.reiwa.casa`）・ローカル開発（`localhost`）のいずれの環境でも正しいURLが表示される。

#### 2.5.4.3 [STAGING]ラベル表示

テスト環境を目視で区別するため、以下の箇所に `[STAGING]` プレフィックスを表示する。

| 表示箇所 | 判定方法 | 実装ファイル |
| :--- | :--- | :--- |
| サイトタイトル（ヘッダー・フッター） | `import.meta.env.CF_PAGES_BRANCH === 'staging'` | `src/layouts/Base.astro` |
| CMS管理画面 `<title>` タグ | `window.location.hostname.startsWith('staging.')` or `.pages.dev` | `public/admin/index.html` |
| CMSサイドバー「ブログを見る」リンク | 同上 | `public/admin/index.html` |

---

# 第3部 詳細設計書

本部では、基本設計に基づく各コンポーネントの処理仕様・設定値・実装詳細を記述する。

---

## 3.1. ビルドパイプライン

### 3.1.1 処理フロー

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

### 3.1.2 package.json スクリプト定義

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

## 3.2. コンテンツ管理

### 3.2.1 記事ファイル配置規則

記事ファイルはfrontmatterの`date`フィールドに基づき、`src/content/posts/{yyyy}/{mm}/`ディレクトリに配置される。この配置はビルド前処理（`organize-posts.mjs`）により自動的に強制される。

### 3.2.2 コンテンツスキーマ定義

定義ファイル: `src/content.config.ts`

```typescript
const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.union([z.string(), z.date()]).transform((val) =>
      val instanceof Date ? val.toISOString().split('T')[0] : val
    ),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    thumbnail: z.string().optional(),
    summary: z.string().optional(),
  }),
});

const pages = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    order: z.number().default(0),
    draft: z.boolean().optional().default(false),
  }),
});
```

> **注意**: `slug`フィールドはAstroの`type: 'content'`コレクションで予約語のため、Zodスキーマには含めない。固定ページの`slug`はfrontmatterで定義されCMSとテストで使用されるが、Astro側ではファイル名からの自動推論で処理される。

### 3.2.3 organize-posts.mjs の処理仕様

| 処理項目 | 内容 |
| :--- | :--- |
| 対象ディレクトリ | `src/content/posts/` |
| 入力 | 全`.md`ファイル（再帰スキャン） |
| 処理1 | frontmatterの`date`を解析し、`yyyy/mm/`ディレクトリを決定 |
| 処理2 | 現在のディレクトリと異なる場合、ファイルを移動 |
| 処理3 | `public/admin/url-map.json`を生成（各記事のslug→公開URLマッピング） |
| 出力 | 整理された記事ファイル + url-map.json |

---

## 3.3. CMS設定

### 3.3.1 設定ファイル

設定ファイル: `public/admin/config.yml`

### 3.3.2 バックエンド設定

```yaml
backend:
  name: github
  repo: bickojima/my-blog
  branch: main
  base_url: https://reiwa.casa
  auth_endpoint: /auth
```

`base_url`にはOAuth認証サーバーのURLを指定する。`auth_endpoint`はCloudflare Functionsの認証エンドポイントである。

### 3.3.3 メディア設定

```yaml
media_folder: "public/images/uploads"
public_folder: "/images/uploads"
```

アップロード画像はGit管理下の`public/images/uploads/`に保存される。HEIC/HEIF形式はiOS側で自動的にJPEGに変換される（管理画面カスタマイズによる）。

### 3.3.4 コレクション定義

「記事」と「固定ページ」の2コレクションで管理する。記事コレクションが先頭に定義されており、CMS初期表示で記事一覧が最初に表示される（CMS-14）。

```yaml
collections:
  - name: "posts"
    label: "記事"
    folder: "src/content/posts"
    create: true
    path: "{{year}}/{{month}}/{{slug}}"
    slug: "{{slug}}"

  - name: "pages"
    label: "固定ページ"
    folder: "src/content/pages"
    create: true
    slug: "{{fields.slug}}"
    extension: "md"
    format: "frontmatter"
    summary: "{{order}} | {{draft}} | {{title}}"
    sortable_fields: ["order", "title"]
```

- `slug`（pages）: `{{fields.slug}}` でフロントマターのslugフィールド値をファイル名に使用（`{{slug}}` はDecap CMSではタイトルのURL安全版を意味するため不可）
- `sortable_fields`（pages）: order と title でソート可能。Decap CMS v3.10.0 は文字列配列のみ対応（オブジェクト形式不可）
- `path`（posts）: ファイルの保存・読み取りパスを定義。CMSがサブディレクトリ`yyyy/mm/`内の既存記事を再帰スキャンする
- `slug`（posts）: ファイル名部分のみ（タイトルベース）

---

## 3.4. 管理画面UIカスタマイズ

すべてのカスタマイズは`public/admin/index.html`に実装されている。

### 3.4.1 カスタマイズ対象と処理方式

```
┌───────────────────────────────────────────────────────┐
│               admin/index.html (1006行)                │
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
│  │   ボトムシート   │  │   ├ manageDropdownOverlay │ │
│  │                 │  │   └ hideCodeBlockOnMobile  │ │
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

### 3.4.2 モバイルレスポンシブ対応（≤799px）

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

### 3.4.3 削除ボタンのラベル区別

操作ミス防止のため、文脈に応じて削除ボタンのラベルを変更する。

| 文脈 | 元ラベル | 変更後ラベル | スタイル |
| :--- | :--- | :--- | :--- |
| エディタ内画像ウィジェット | 削除 / 削除する | 選択解除 | グレー背景 |
| メディアライブラリ | 削除 / 削除する | 完全削除 | 赤色背景 |

### 3.4.4 iOS固有対応

| 対応内容 | 手法 | 理由 |
| :--- | :--- | :--- |
| 自動ズーム防止 | `font-size: 16px !important` | iOS は16px未満入力欄でフォーカス時に自動ズームする |
| HEIC→JPEG変換 | `input[type="file"]` のaccept属性制限 | iOSはaccept制限によりHEICを自動変換する |
| pull-to-refresh無効化 | touchstart/touchmove の preventDefault | 編集中の誤リロード防止 |
| エディタtouchmove除外 | Slate(`data-slate-editor`) / CodeMirror をホワイトリスト | codeblock挿入時のクラッシュ防止 |
| MutationObserverデバウンス | `requestAnimationFrame` で1フレームに1回に制限 | codeblock等の大量DOM変更による過負荷防止 |
| codeblockボタン非表示 | `hideCodeBlockOnMobile()` でモバイル（≤799px）時に非表示 | Slate v0.47 void nodeクラッシュが根本修正不可能なため機能自体を無効化 |
| Slateエラーハンドラ | `window.addEventListener('error')` で `toSlatePoint` 等を握りつぶし | 既存codeblock記事を開いた際のクラッシュ画面を回避 |

### 3.4.5 サイトリンク

サイドバーのコレクション一覧の下に「ブログを見る」リンクを表示し、サイトへのワンクリックアクセスを提供する。リンク先は `window.location.origin` で環境に応じたURLを動的生成する。

- `addSiteLink()` 関数が `[class*=SidebarContainer]` に `<a>` 要素を動的注入
- 新規タブで開く（`target="_blank"`）
- 重複防止: `#cms-site-link` IDで既存チェック
- staging環境では `[STAGING] ブログを見る` と表示（hostname判定）

### 3.4.6 公開URL表示

エディタ画面で、画面下部に公開URLをリアルタイム表示する。コレクション種別をハッシュURLから判定し、それぞれ異なるURL形式で動的生成する（`origin` は `window.location.origin` により環境に応じたドメインを使用）。

| コレクション | URL形式 | 既存エントリのソース | 新規エントリのソース |
|:---|:---|:---|:---|
| 記事（posts） | `{origin}/posts/{年}/{月}/{タイトル}` | ハッシュのエントリパス | タイトル＋日付フィールド |
| 固定ページ（pages） | `{origin}/{slug}` | ハッシュのエントリパス（=ファイル名=slug） | slugフィールド |

**重要**: 固定ページのCMS config.ymlでは `slug: "{{fields.slug}}"` を使用する。`{{slug}}` は Decap CMS ではタイトルのURL安全版を意味するため、`{{fields.slug}}` でフロントマターの `slug` フィールド値をファイル名に使用する必要がある。

- `EditorControlBar` の `getBoundingClientRect().height > 0` でエディタ画面を判定し、コレクション一覧では確実に非表示
- ハッシュURL内の `/collections/pages/` または `/collections/posts/` でコレクション種別を判定
- `hashchange` イベントで画面遷移時に `showPublicUrl()` を再実行
- ドロップダウン（ボトムシート）表示中は `manageDropdownOverlay()` でURLバーを一時非表示にし、重なりを防止（`hiddenByDropdown` フラグで `showPublicUrl` による非表示との競合を回避）

### 3.4.7 EXIF画像回転の方針

CMS管理画面での画像表示はCSS `image-orientation: from-image` に委ねる。JavaScript による画像src書き換え（canvas経由の再生成）は、EXIF メタデータの消失と一部ブラウザでの `createImageBitmap` のEXIF非対応により逆効果になるため、廃止した（fixPreviewImageOrientation 削除）。

### 3.4.8 プレビュースタイルの本番再現

`CMS.registerPreviewStyle()` で本番サイト相当のCSSをプレビューiframeに注入し、編集中のプレビュー表示を本番に近づける。注入するスタイルは `Base.astro` のグローバルスタイルと `[slug].astro` の `.post-content` スタイルを統合したもの。

**注入対象:**
- フォントファミリー（-apple-system, ヒラギノ角ゴ等）、行間（1.9）、文字色（#333）
- 画像: `max-width: 100%`, `border-radius: 4px`, `margin: 1rem 0`, `image-orientation: from-image`
- 見出し: h2（1.3rem）、h3（1.1rem）と適切なマージン
- コードブロック: `background: #f5f5f5`, `border-radius: 4px`
- figure/figcaption: キャプション付き画像のスタイル（中央揃え、グレーテキスト）
- コンテンツ幅: `max-width: 700px`（本番のmainと同一）

---

## 3.5. 画像処理パイプライン

### 3.5.1 全体フロー

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

### 3.5.2 normalize-images.mjs（Stage 1）

| 項目 | 内容 |
| :--- | :--- |
| 実行タイミング | ビルド前（prebuild） |
| 対象ディレクトリ | `public/images/uploads/` |
| 対象形式 | JPEG, PNG, WebP |
| 処理内容 | EXIF orientation値が1以外の場合、sharpの`.rotate()`でピクセルを回転し上書き保存 |
| 背景 | iPhoneで撮影した写真はEXIF orientationタグで表示方向を指定しており、一部ブラウザでは正しく解釈されない |

### 3.5.3 image-optimize.mjs（Stage 2）

| 項目 | 内容 |
| :--- | :--- |
| 実行タイミング | ビルド後（Astroの`astro:build:done`フック） |
| 対象ディレクトリ | `dist/images/uploads/` |
| 最大幅 | 1200px（超過時リサイズ） |
| JPEG品質 | 80%（mozjpeg） |
| PNG品質 | 80%（compressionLevel: 9） |
| WebP品質 | 80% |
| 追加処理 | `.rotate()`による回転再確認、EXIF orientation≥5の場合はwidth/height入替 |

### 3.5.4 CSS フォールバック（Stage 3）

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

## 4.1. 移行設計

本セクションは、サイトのコンテンツを維持しつつフロントエンド・バックエンドを全面的に作り直す場合の手順を定義するものである。

### 4.1.1 移行対象の分類

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

### 4.1.2 コンテンツ移行手順

| 手順 | 作業内容 | 備考 |
| :--- | :--- | :--- |
| 1 | `src/content/posts/` 配下の全`.md`ファイルをコピー | ディレクトリ構造（yyyy/mm/）ごと移行する |
| 2 | `public/images/uploads/` 配下の全画像ファイルをコピー | 記事本文およびサムネイルが参照する画像 |
| 3 | frontmatterスキーマの互換性を確認 | `title`, `date`, `draft`, `tags`, `thumbnail`, `summary` の全フィールドが新システムで対応していること |
| 4 | 画像パス（`/images/uploads/`）の互換性を確認 | 新システムで同一パスにて画像が配信されること |
| 5 | URL構造の互換性を確認 | `/posts/{yyyy}/{mm}/{slug}` 形式が維持されること。変更する場合はリダイレクト設定を行う |

### 4.1.3 CMS設定の移行

`public/admin/config.yml` の以下の項目を新環境に合わせて更新する。

| 項目 | 現在値 | 変更が必要な条件 |
| :--- | :--- | :--- |
| `backend.repo` | `bickojima/my-blog` | GitHubリポジトリが異なる場合 |
| `backend.base_url` | `https://reiwa.casa` | ドメインが異なる場合 |
| `media_folder` | `public/images/uploads` | 画像保存先を変更する場合 |
| `public_folder` | `/images/uploads` | 画像配信パスを変更する場合 |

### 4.1.4 移行時の検証チェックリスト

| No. | 検証項目 | 確認方法 |
| :--- | :--- | :--- |
| 1 | 全記事が正常にビルドされる | `npm run build` が成功する |
| 2 | 全記事のURLが正しい | ビルド後のdist/posts/ディレクトリ構造を確認 |
| 3 | 画像が正常に表示される | ビルド後のdist/images/uploads/に全画像が存在する |
| 4 | frontmatterの検証が通る | `npm test` のcontent-validationが全件PASS |
| 5 | CMS管理画面から記事一覧が表示される | /admin/ にアクセスし記事一覧を確認 |
| 6 | CMS管理画面から記事の編集・保存ができる | 任意の記事を編集してcommitされることを確認 |

---

## 4.2. バックアップ設計

### 4.2.1 バックアップ方針

本システムの全データはGitHubリポジトリに格納されており、Gitの分散バージョン管理によりバックアップが担保されている。

### 4.2.2 バックアップ対象

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

### 4.2.3 バックアップ範囲と復元方法

| 対象 | 保管場所 | 復元方法 |
| :--- | :--- | :--- |
| 記事データ（Markdown） | GitHub リポジトリ | `git clone` またはリポジトリの任意コミットを checkout |
| 画像ファイル | GitHub リポジトリ（`public/images/uploads/`） | 同上 |
| CMS設定 | GitHub リポジトリ（`public/admin/config.yml`） | 同上 |
| ソースコード | GitHub リポジトリ | 同上 |
| ビルド成果物 | Cloudflare Pages（デプロイ履歴） | Cloudflare Pagesダッシュボードから過去のデプロイにロールバック可能 |
| 環境変数 | Cloudflare Pages設定 | 手動で再設定が必要（`OAUTH_CLIENT_ID`, `OAUTH_CLIENT_SECRET`） |

### 4.2.4 バックアップ対象外

| 対象 | 理由 | 対処 |
| :--- | :--- | :--- |
| Cloudflare Pages環境変数 | Gitリポジトリに含まれない | 別途安全な場所に記録しておく |
| GitHub OAuth Appの設定 | GitHub Settingsで管理 | Client ID / Secret を安全な場所に記録しておく |
| DNSレコード | Cloudflareで自動管理 | カスタムドメイン設定手順を本ドキュメントに記載済み |

### 4.2.5 災害復旧手順

GitHubリポジトリが利用可能な場合、以下の手順でシステムを復旧する。

1. GitHubリポジトリをcloneする
2. Cloudflare Pagesプロジェクトを新規作成し、リポジトリを接続する
3. 環境変数（`OAUTH_CLIENT_ID`, `OAUTH_CLIENT_SECRET`）を設定する
4. カスタムドメインを設定する
5. ビルド＆デプロイを実行する
6. GitHub OAuth Appの Callback URL を新ドメインに更新する

---

## 4.3. フォーク転用ガイド

本プロジェクトを別サイト向けにフォークして転用する場合、以下の箇所を変更する必要がある。

### 4.3.1 サイト固有の変更箇所一覧

| No. | ファイル | 変更箇所 | 現在値 | 説明 |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `public/admin/config.yml` | `backend.repo` | `bickojima/my-blog` | GitHubリポジトリ名 |
| 2 | `public/admin/config.yml` | `backend.base_url` | `https://reiwa.casa` | 本番ドメイン |
| 3 | `src/layouts/Base.astro` | サイトタイトル | `tbiのブログ` | ヘッダー・フッターに表示される |
| 4 | `public/robots.txt` | Sitemap URL | `https://reiwa.casa/sitemap.xml` | サイトマップURL |
| 5 | `public/admin/index.html` | 公開URL表示のドメイン | `window.location.origin`（動的） | 変更不要（環境自動検出） |
| 6 | Cloudflare環境変数 | `OAUTH_CLIENT_ID` / `SECRET` | - | 新サイト用のOAuth App |
| 7 | GitHub OAuth App | Callback URL | `https://reiwa.casa/auth/callback` | 新ドメインに変更 |

### 4.3.2 転用時に変更不要な箇所

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

### 4.3.3 転用手順

1. リポジトリをフォークする
2. 17.1 の変更箇所一覧に従い各ファイルを更新する
3. `src/content/posts/` 配下の記事を削除し、新サイトの記事を配置する
4. `public/images/uploads/` 配下の画像を新サイトのものに差し替える
5. GitHub OAuth Appを新規作成し、Client ID / Secret を取得する
6. Cloudflare Pagesプロジェクトを新規作成し、環境変数を設定する
7. `npm test` で全テストがPASSすることを確認する
8. デプロイを実行する

---

## 4.4. トラブルシューティング

### 4.4.1 「OAuth client ID not configured」エラー

**原因**: Cloudflare Pagesの環境変数が未設定である。

**対処**: Cloudflare Pages > 設定 > 環境変数で`OAUTH_CLIENT_ID`と`OAUTH_CLIENT_SECRET`を設定し、再デプロイを実行する。本番環境はProduction、テスト環境はPreviewの環境変数をそれぞれ確認すること。

### 4.4.2 「redirect_uri is not associated」エラー

**原因**: GitHub OAuth AppのCallback URLが不正である。

**対処**: GitHub OAuth App設定で、Authorization callback URLが環境に対応するURLであることを確認する（末尾スラッシュなし、`https://`）。本番: `https://reiwa.casa/auth/callback`、テスト: `https://staging.reiwa.casa/auth/callback`。

### 4.4.3 認証後にログインできない

**原因**: postMessageのハンドシェイクが正しく動作していない。

**対処**: `functions/auth/callback.js`が以下のプロトコルを正しく実装しているか確認する。
1. `window.opener.postMessage("authorizing:github", "*")` を送信
2. 親ウィンドウからの応答を待機
3. トークンを含むメッセージを`event.origin`宛に送信

---

## 4.5. バグ一覧

過去に発生したバグと対策の記録。再発防止のため、今後発見されたバグもすべて本一覧に追記する。

| No. | 発生時期 | バグ概要 | 原因 | 対策 | 再発防止テスト |
|:---|:---|:---|:---|:---|:---|
| 1 | 2026-02-14 | モバイル保存ボタン非表示: iPhoneポートレートでCMS保存・公開ボタンが画面外に隠れる | Decap CMSデフォルトのCSS | `flex-shrink: 0`, `min-height: 44px`, sticky header | admin-html 2.6.8章 |
| 2 | 2026-02-14 | iOS自動ズーム: iPhoneでinput/textareaフォーカス時に画面が自動ズーム | iOSは16px未満のフォントサイズで自動ズーム | `font-size: 16px !important` | admin-html 2.6.5章 #1 |
| 3 | 2026-02-14 | pull-to-refresh誤発動: iPhoneで編集中にpull-to-refreshが発動しページがリロード | iOS Safariのデフォルト動作 | touchstart/touchmoveのpreventDefault（エディタ内は除外） | admin-html 2.6.5章 #3,#4,#5 |
| 4 | 2026-02-14 | 削除ボタン誤操作: 画像ウィジェットの「削除」が画像選択解除なのかファイル削除なのか判別不能 | 同一ラベル | 「選択解除」/「完全削除」にラベル分離 | admin-html 2.6.6章 #3,#4,#5 |
| 5 | 2026-02-15 | iPhone EXIF画像回転: iPhoneで撮影した画像が横向きに表示される | EXIF orientationタグが一部ブラウザで未解釈 | normalize-images.mjsでピクセル回転、image-optimize.mjsで再確認、CSS `image-orientation: from-image` | content-validation 2.1章 #12-#15, build 2.5章 #29 |
| 6 | 2026-02-15 | fixPreviewImageOrientation副作用: CMS編集画面で画像が逆に回転する | JSでcanvas経由のEXIF補正がEXIFメタデータを消失させ二重補正 | JSによるcanvas補正を廃止しCSSに委ねる | admin-html 2.6.4章 #1 |
| 7 | 2026-02-15 | ドロップダウン位置ずれ: CMSの公開ボタンドロップダウンがモバイルで画面外に表示 | position: absoluteがビューポート外 | ボトムシート化（position: fixed, bottom: 0） | admin-html 2.6.3章 #6 |
| 8 | 2026-02-15 | 公開URLバー残留（iPhone）: エディタからコレクション一覧に戻った後も公開URLバーが残る | hashchange検知不足 | hashchange/popstateリスナーでshowPublicUrl再実行 | E-15 |
| 9 | 2026-02-15 | Slate codeblockクラッシュ（iPhone）: iPhoneでcodeblockを挿入するとCMSがクラッシュ | Slate v0.47のvoid nodeバグ（根本修正不可） | モバイルでcodeblockボタン非表示、toSlatePointエラーハンドラ、MutationObserverデバウンス | admin-html 2.6.5b章 |
| 10 | 2026-02-15 | サイトリンク注入先ミス: 「ブログを見る」リンクがヘッダーの不適切な位置に表示 | header rootに注入 | SidebarContainerに注入先変更 | admin-html 2.6.6章 #1b |
| 11 | 2026-02-20 | 公開URLバー残留（コレクション一覧）: ソート用ドロップダウン操作後にURLバーが再表示 | EditorControlBar判定が不正確 | getBoundingClientRect().height > 0 による判定 | E-15 |
| 12 | 2026-02-20 | CMS固定ページslugテンプレート: 固定ページのファイル名がタイトル（日本語）になる | config.ymlの`slug: "{{slug}}"`がDecap CMSではタイトルのURL安全版を意味 | `slug: "{{fields.slug}}"`に変更 | cms-config 2.4章 #31, content-validation 2.1.2章 #19 |
| 13 | 2026-02-20 | 固定ページ公開URL表示: CMS上の固定ページに`/posts/タイトル`という間違ったURLが表示 | showPublicUrlが記事専用ロジックのみ | ハッシュURLから`/collections/pages/`を判定し`/{slug}`を生成 | admin-html 2.6.6章 #8 |
| 14 | 2026-02-20 | ドロップダウン▾閉じない: ヘッダーナビの▾ボタンクリックでメニューが閉じない | CSS `:hover`ルールがJS `is-open`トグルと競合 | CSS `:hover`ルール削除、JSのmouseenter/mouseleaveに統一 | build 2.5章, E-21 |
| 15 | 2026-02-20 | ドロップダウンメニューgap: ページ名にホバー後、メニューへマウス移動するとメニューが消える | menu `margin-top`がホバー判定の隙間を作る | `padding-top`に変更 + mouseleave 300ms遅延 | build 2.5章, E-21 |

---

## 4.6. ブランチマージ手順

### 4.6.1 staging → main マージ手順

staging ブランチで開発・テスト完了後、main ブランチにマージする手順を示す。

```bash
# 1. staging ブランチで全テスト PASS を確認
git checkout staging
npm test
npm run build && npm run test:e2e

# 2. main ブランチに切り替え、最新を取得
git checkout main
git pull origin main

# 3. staging をマージ
git merge staging

# 4. config.yml のコンフリクト解消（必須）
#    staging の値 → main の値に修正:
#    - branch: staging → branch: main
#    - base_url: https://staging.reiwa.casa → base_url: https://reiwa.casa
#    手動で確認・修正後:
git add public/admin/config.yml
git commit  # マージコミット完了

# 5. main ブランチでテスト実行
npm test

# 6. main にプッシュ
git push origin main
```

### 4.6.2 マージ時の確認観点

| No. | 確認項目 | 確認方法 | 備考 |
|:---|:---|:---|:---|
| 1 | config.yml の `branch` が `main` | ファイル確認 | staging の値が残っていないこと |
| 2 | config.yml の `base_url` が `https://reiwa.casa` | ファイル確認 | staging URL が残っていないこと |
| 3 | Vitest 全テスト PASS | `npm test` | テスト件数が staging と一致すること |
| 4 | ビルド成功 | `npm run build` | エラーなく完了すること |
| 5 | E2E テスト PASS（可能な場合） | `npm run test:e2e` | ローカル環境のみ |
| 6 | robots.txt が main 用 | ファイル確認 | staging の `Disallow: /` が混入していないこと |

### 4.6.3 main → staging コンテンツ同期

本番で CMS から記事が追加・編集された場合、staging に反映する。

```bash
git checkout staging
git merge main
# config.yml のコンフリクト解消: staging の値を維持
#    - branch: staging
#    - base_url: https://staging.reiwa.casa
git add public/admin/config.yml
git commit
git push origin staging
```

### 4.6.4 config.yml の環境別値

| 項目 | main（本番） | staging（テスト） |
|:---|:---|:---|
| `backend.branch` | `main` | `staging` |
| `backend.base_url` | `https://reiwa.casa` | `https://staging.reiwa.casa` |

**注意**: これらの値はブランチ固有であり、マージ時に必ず対象ブランチの値に修正すること。マージツールの自動解決に任せず、手動で確認する。

---

**最終更新**: 2026年2月21日（v1.15）
