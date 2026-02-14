# My Blog

Astro + Decap CMS を使用したブログサイト（Cloudflare Pages でホスティング）

## プロジェクト概要

- **本番URL**: https://reiwa.casa
- **管理画面**: https://reiwa.casa/admin
- **認証方式**: GitHub OAuth
- **CMS**: Decap CMS v3.10.0

## プロジェクト構成

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
│   └── images/uploads/           # アップロード画像
├── src/
│   ├── content/posts/
│   │   ├── devices/              # デバイスカテゴリ記事
│   │   └── finance/              # ファイナンスカテゴリ記事
│   ├── integrations/
│   │   └── image-optimize.mjs    # ビルド時画像最適化
│   ├── plugins/
│   │   └── rehype-image-caption.mjs  # 画像キャプションプラグイン
│   ├── layouts/                  # レイアウト
│   ├── pages/                    # ページ
│   ├── styles/                   # スタイル
│   └── content.config.ts         # コンテンツコレクション定義
├── astro.config.mjs
├── package.json
└── wrangler.toml
```

## コマンド

| コマンド | 説明 |
| :--- | :--- |
| `npm install` | 依存関係のインストール |
| `npm run dev` | 開発サーバー起動（localhost:4321） |
| `npm run build` | 本番ビルド（`./dist/` に出力） |
| `npm run preview` | ビルド結果のローカルプレビュー |

## 管理画面のUIカスタマイズ

`public/admin/index.html` で以下のカスタマイズを実装しています。

### モバイル対応（799px以下）

- アプリ全体のレイアウトをビューポートに収める
- サイドバーを通常フローに変更
- エディタのコントロールバーを上部固定（sticky）
- 保存・公開ボタンのタップ領域を44px以上に確保
- ドロップダウンメニューを画面下部に固定表示
- モーダル（メディアライブラリ等）を画面幅95%で表示
- メディアライブラリのカードグリッドを2列表示
- 画像選択ボタンを縦並び・全幅表示

### 削除ボタンのラベル改善

- エディタ内の画像「削除」/「削除する」ボタン → **「選択解除」**（グレー、安全な操作）
- メディアライブラリ内の削除ボタン → **「完全削除」**（赤色、危険操作を明示）

### 一覧表示の改善

- コレクション一覧で `2026-02-14 | タイトル` 形式の表示を日付ラベル（青バッジ）とタイトルに分離

### iOS対応

- HEIC画像アップロード時に自動的にJPEG変換されるよう、accept属性を制限
- pull-to-refresh（引っ張って更新）を無効化し、編集中の誤リロードを防止
- 入力フォームのfont-sizeを16px以上に設定し、自動ズームを防止

## CMS設定（config.yml）

### コレクション

| コレクション | フォルダ | カテゴリ（自動設定） |
| :--- | :--- | :--- |
| デバイス | `src/content/posts/devices` | `devices` |
| ファイナンス | `src/content/posts/finance` | `finance` |

### フィールド構成

| フィールド | ウィジェット | 備考 |
| :--- | :--- | :--- |
| タイトル | string | 必須 |
| 日付 | datetime | YYYY-MM-DD形式 |
| 下書き | boolean | デフォルト: false |
| カテゴリ | hidden | コレクションに応じて自動設定（編集画面には非表示） |
| タグ | list | 任意 |
| サムネイル画像 | image | 任意 |
| 概要 | text | 任意 |
| 本文 | markdown | 必須 |

## ビルド時の画像最適化

`src/integrations/image-optimize.mjs` により、ビルド完了後に `dist/images/uploads/` 内の画像を自動的に最適化します。

- **対象形式**: JPEG、PNG、WebP
- **最大幅**: 1200px（超える場合はリサイズ）
- **圧縮品質**: 80%（JPEG: mozjpeg使用）
- **依存パッケージ**: sharp（devDependencies）

## デプロイ

### Cloudflare Pages 設定

| 項目 | 値 |
| :--- | :--- |
| ビルドコマンド | `npm run build` |
| 出力ディレクトリ | `dist` |
| Node.js バージョン | 18以上 |

### 環境変数

| 変数名 | 説明 |
| :--- | :--- |
| `OAUTH_CLIENT_ID` | GitHub OAuth App の Client ID |
| `OAUTH_CLIENT_SECRET` | GitHub OAuth App の Client Secret |

## 参考リンク

- [Astro ドキュメント](https://docs.astro.build)
- [Decap CMS ドキュメント](https://decapcms.org/docs/)
- [Cloudflare Pages ドキュメント](https://developers.cloudflare.com/pages/)
