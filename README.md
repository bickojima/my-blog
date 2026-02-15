# My Blog

Astro + Decap CMS によるブログサイト。Cloudflare Pages でホスティングしている。

## 改訂履歴

| 版数 | 日付 | 内容 |
| :--- | :--- | :--- |
| 1.0 | 2026-02-15 | 初版作成 |
| 1.1 | 2026-02-15 | カテゴリ記載を削除しタグ構造に更新、ドキュメント体系セクション追加、章番号付与 |

## システム変更履歴（主要マイルストーン）

| 時期 (JST) | 主な変更 | 関連PR |
| :--- | :--- | :--- |
| 2026-02-14 16時 | 初期構築（Decap CMS + Astro + Netlify Identity） | #1 |
| 2026-02-14 18〜20時 | CMS モバイル・iOS対応 | #2〜#6 |
| 2026-02-14 21〜22時 | URL自動生成・画像最適化・UI大幅改善 | #13〜#17 |
| 2026-02-14 23時 | 自動テスト導入（Vitest / 151テスト） | #40 |
| 2026-02-15 7〜8時 | カテゴリ廃止→タグ構造に統合 | #41 |
| 2026-02-15 8時 | URL構造変更（/posts/yyyy/mm/slug）・アーカイブ追加 | #42 |
| 2026-02-15 13〜14時 | EXIF回転正規化（normalize-images.mjs） | #73 |
| 2026-02-15 午後 | 包括的リファクタリング・ドキュメント全面改訂 | #80 |

---

## 1. プロジェクト概要

- **本番URL**: https://reiwa.casa
- **管理画面**: https://reiwa.casa/admin
- **認証方式**: GitHub OAuth
- **CMS**: Decap CMS v3.10.0

## 2. システム構成図

```
┌─────────────────────────────────────────────────────┐
│                   Cloudflare Pages                   │
│                                                      │
│  ┌──────────┐   ┌──────────────────┐                │
│  │ 静的サイト │   │ Cloudflare       │                │
│  │ (dist/)   │   │ Functions        │                │
│  │           │   │ ┌──────────────┐ │                │
│  │ index.html│   │ │ /auth        │ │  ┌──────────┐ │
│  │ posts/    │   │ │ /auth/callback│─┼─→│ GitHub   │ │
│  │ tags/     │   │ └──────────────┘ │  │ OAuth API│ │
│  │ admin/    │   │                  │  └──────────┘ │
│  │ images/   │   │                  │                │
│  └──────────┘   └──────────────────┘                │
│        ↑                                             │
└────────┼─────────────────────────────────────────────┘
         │ デプロイ
┌────────┴─────────────────────────────────────────────┐
│                  ビルドパイプライン                     │
│                                                      │
│  1. normalize-images.mjs  → EXIF回転正規化            │
│  2. organize-posts.mjs    → 記事ファイル整理            │
│  3. astro build           → 静的ページ生成              │
│  4. image-optimize.mjs    → 画像圧縮・リサイズ          │
└──────────────────────────────────────────────────────┘
```

## 3. プロジェクト構成

```
my-blog/
├── functions/                    # Cloudflare Functions（OAuth認証）
│   └── auth/
│       ├── index.js              # 認証開始エンドポイント
│       └── callback.js           # コールバック処理
├── public/
│   ├── admin/
│   │   ├── index.html            # 管理画面（UIカスタマイズ含む）
│   │   └── config.yml            # Decap CMS設定
│   ├── images/uploads/           # アップロード画像
│   ├── _headers                  # Cloudflare Pagesカスタムヘッダー
│   ├── _redirects                # リダイレクト設定
│   ├── robots.txt                # クローラー制御
│   ├── favicon.svg / favicon.ico # ファビコン
├── scripts/
│   ├── normalize-images.mjs      # EXIF回転正規化（prebuild）
│   └── organize-posts.mjs        # 記事ファイル自動整理（prebuild）
├── src/
│   ├── content/posts/            # 記事（yyyy/mm/ディレクトリ構造）
│   ├── components/
│   │   └── ArchiveNav.astro      # アーカイブナビゲーション
│   ├── integrations/
│   │   └── image-optimize.mjs    # ビルド時画像最適化
│   ├── plugins/
│   │   └── rehype-image-caption.mjs  # 画像キャプションプラグイン
│   ├── layouts/
│   │   └── Base.astro            # 共通レイアウト
│   ├── lib/
│   │   └── posts.ts              # 記事URL生成ロジック
│   ├── pages/                    # ページルーティング
│   └── content.config.ts         # コンテンツコレクション定義
├── tests/                        # 自動テスト（Vitest）
├── astro.config.mjs
├── package.json
└── wrangler.toml
```

## 4. コマンド

| コマンド | 説明 |
| :--- | :--- |
| `npm install` | 依存関係のインストール |
| `npm run dev` | 開発サーバー起動（localhost:4321） |
| `npm run build` | 本番ビルド（`./dist/` に出力） |
| `npm run preview` | ビルド結果のローカルプレビュー |
| `npm test` | 自動テスト実行（Vitest） |
| `npm run test:watch` | ウォッチモードでテスト実行 |

## 5. 管理画面のUIカスタマイズ

`public/admin/index.html` に以下のカスタマイズを実装した。

### 5.1 モバイル対応（799px以下）

- アプリ全体のレイアウトをビューポートに収める
- サイドバーを通常フローに変更
- エディタのコントロールバーを上部固定（sticky）
- 保存・公開ボタンのタップ領域を44px以上に確保
- ドロップダウンメニューをボタン付近に固定表示
- モーダル（メディアライブラリ等）を画面幅95%で表示
- メディアライブラリのカードグリッドを2列表示
- 画像選択ボタンを縦並び・全幅表示

### 5.2 削除ボタンのラベル改善

- エディタ内の画像「削除」ボタン → **「選択解除」**（グレー、安全な操作）
- メディアライブラリ内の削除ボタン → **「完全削除」**（赤色、危険操作を明示）

### 5.3 iOS対応

- HEIC画像アップロード時にJPEGへ自動変換されるよう、accept属性を制限
- pull-to-refresh を無効化し、編集中の誤リロードを防止
- 入力フォームのfont-sizeを16px以上に設定し、自動ズームを防止

## 6. CMS設定

単一のコレクション「記事」で全記事を管理する。分類にはタグを使用する（カテゴリ機能は廃止済み）。

| フィールド | ウィジェット | 備考 |
| :--- | :--- | :--- |
| タイトル | string | 必須 |
| 日付 | datetime | YYYY-MM-DD形式 |
| 下書き | boolean | デフォルト: false |
| タグ | list | 任意 |
| サムネイル画像 | image | 任意 |
| 概要 | text | 任意 |
| 本文 | markdown | 必須 |

## 7. デプロイ

| 項目 | 値 |
| :--- | :--- |
| ホスティング | Cloudflare Pages |
| ビルドコマンド | `npm run build` |
| 出力ディレクトリ | `dist` |
| 環境変数 | `OAUTH_CLIENT_ID`, `OAUTH_CLIENT_SECRET` |

## 8. ドキュメント体系

| 文書 | 内容 |
| :--- | :--- |
| `README.md`（本文書） | プロジェクト概要・構成・コマンド |
| `DOCUMENTATION.md` | システム設計書（要件定義・基本設計・詳細設計・運用設計） |
| `tests/TEST-REPORT.md` | テスト仕様書（テストケース一覧・要件トレーサビリティ） |

## 9. 参考リンク

- [Astro ドキュメント](https://docs.astro.build)
- [Decap CMS ドキュメント](https://decapcms.org/docs/)
- [Cloudflare Pages ドキュメント](https://developers.cloudflare.com/pages/)
