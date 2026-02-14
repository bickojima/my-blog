# My Blog - 技術ドキュメント

## 目次

1. [技術スタック](#技術スタック)
2. [セットアップ手順](#セットアップ手順)
3. [Decap CMS 設定詳細](#decap-cms-設定詳細)
4. [管理画面UIカスタマイズ詳細](#管理画面uiカスタマイズ詳細)
5. [ビルド時画像最適化](#ビルド時画像最適化)
6. [GitHub OAuth 認証](#github-oauth-認証)
7. [Cloudflare Pages 設定](#cloudflare-pages-設定)
8. [トラブルシューティング](#トラブルシューティング)
9. [今後の拡張](#今後の拡張)

---

## 技術スタック

| 分類 | 技術 | バージョン/備考 |
| :--- | :--- | :--- |
| 静的サイトジェネレーター | Astro | v5.17.1 |
| CMS | Decap CMS | v3.10.0 |
| ホスティング | Cloudflare Pages | 静的サイト + Functions |
| 認証 | GitHub OAuth App | Cloudflare Functions で処理 |
| 画像最適化 | sharp | v0.34.5（devDependencies） |
| コンテンツ形式 | Markdown | frontmatter 形式 |

---

## セットアップ手順

### ローカル開発

```bash
git clone https://github.com/bickojima/my-blog.git
cd my-blog
npm install
npm run dev
```

開発サーバーは `http://localhost:4321` で起動します。

### ビルド

```bash
npm run build
```

ビルド成果物は `dist/` ディレクトリに出力されます。ビルド完了後、画像最適化が自動実行されます。

---

## Decap CMS 設定詳細

設定ファイル: `public/admin/config.yml`

### バックエンド

```yaml
backend:
  name: github
  repo: bickojima/my-blog
  branch: main
  base_url: https://reiwa.casa
  auth_endpoint: /auth
```

- `base_url`: OAuth認証サーバーのURL（本番ドメイン）
- `auth_endpoint`: Cloudflare Functions の認証エンドポイント

### メディア設定

```yaml
media_folder: "public/images/uploads"
public_folder: "/images/uploads"
```

- アップロード画像はGit管理下の `public/images/uploads/` に保存
- HEIC/HEIF形式はiOS側で自動的にJPEGに変換される

### スラグ設定

```yaml
locale: "ja"
slug:
  encoding: "unicode"
  clean_accents: false
```

- 日本語タイトルがそのままスラグに使用される
- ファイル名形式: `{日付}-{タイトル}.md`（例: `2026-02-14-ブラザープリンターを買った話.md`）

### コレクション定義

各コレクションは独立したフォルダに保存され、カテゴリは `hidden` ウィジェットで自動設定されます。

#### デバイス

```yaml
- name: "devices"
  label: "デバイス"
  folder: "src/content/posts/devices"
  slug: "{{fields.date}}-{{slug}}"
  summary: "{{date}} | {{title}}"
  fields:
    - { label: "タイトル", name: "title", widget: "string" }
    - { label: "日付", name: "date", widget: "datetime", format: "YYYY-MM-DD" }
    - { label: "下書き", name: "draft", widget: "boolean", default: false }
    - { name: "category", widget: "hidden", default: "devices" }
    - { label: "タグ", name: "tags", widget: "list", required: false }
    - { label: "サムネイル画像", name: "thumbnail", widget: "image", required: false }
    - { label: "概要", name: "summary", widget: "text", required: false }
    - { label: "本文", name: "body", widget: "markdown" }
```

#### ファイナンス

`devices` と同じフィールド構成。`folder` が `src/content/posts/finance`、`category` のデフォルト値が `"finance"` になります。

### カテゴリの仕組み

カテゴリは `hidden` ウィジェットを使用しており、編集画面には表示されません。コレクションごとにデフォルト値が異なるため、記事がどのコレクションに属しているかに応じて自動的に正しいカテゴリが設定されます。

### 下書き機能

各コレクションには `draft` フィールド（booleanウィジェット、デフォルト: `false`）があり、編集画面のトグルで下書き状態を切り替えられます。

#### 動作仕様

| 表示箇所 | 下書きON時の挙動 |
| :--- | :--- |
| トップページ (`/`) | 一覧に表示されない |
| カテゴリページ (`/category/[name]`) | 一覧に表示されない |
| タグページ (`/tags/[tag]`) | 一覧に表示されない |
| 個別記事ページ (`/posts/[slug]`) | **URL直打ちでアクセス可能** |

#### 仕組み

- ビルド時のフィルタリングで実現（サーバーサイドの認証は不要）
- `src/pages/index.astro`、`src/pages/category/[category].astro`、`src/pages/tags/[tag].astro` で `!post.data.draft` によるフィルタリングを実施
- `src/pages/posts/[...slug].astro` ではフィルタリングしていないため、個別ページは生成される
- YouTubeの「限定公開」に近い挙動：リンクを知っていればアクセスできるが、一覧には表示されない

---

## 管理画面UIカスタマイズ詳細

すべてのカスタマイズは `public/admin/index.html` に実装されています。

### CSSカスタマイズ

#### モバイルレスポンシブ対応（799px以下）

Decap CMS はデフォルトではモバイル対応が不十分なため、以下のCSSで対応しています。

| 対象 | カスタマイズ内容 |
| :--- | :--- |
| アプリ全体 | ビューポート幅に収まるよう `max-width: 100vw` |
| ヘッダー | flexboxで左右配置 |
| サイドバー | `position: initial` で通常フローに変更 |
| エディタ制御バー | `position: sticky; top: 0` で上部固定 |
| 保存/公開ボタン | `flex-shrink: 0; min-height: 44px` で縮小防止・タップ領域確保 |
| 戻るリンク | `text-overflow: ellipsis` で省略表示 |
| ドロップダウン | `position: fixed; bottom: 10px` で画面下部に固定 |
| モーダル | `width: 95vw` で画面幅いっぱいに表示 |
| メディアライブラリ | ヘッダー縦並び、カードグリッド2列、スクロール可能 |
| 画像ウィジェット | ボタン縦並び・全幅表示 |

#### iOS自動ズーム防止

```css
[data-slate-editor="true"], input, textarea, select {
  font-size: 16px !important;
}
```

iOSでは16px未満のフォントサイズの入力欄にフォーカスすると自動ズームが発生するため、全入力要素を16px以上に設定しています。

#### 一覧表示の日付ラベル

コレクション一覧の `2026-02-14 | タイトル` という表示を、青いバッジの日付とタイトルに分離します。

```css
.entry-date {
  background: #e8f0fe;
  color: #1a73e8;
  padding: 2px 8px;
  border-radius: 4px;
  font-family: monospace;
}
```

#### 削除ボタンのスタイル

```css
/* 選択解除ボタン（エディタ内） */
.cms-deselect-btn {
  background: #f5f5f5 !important;
  color: #555 !important;
  border: 1px solid #ccc !important;
}

/* 完全削除ボタン（メディアライブラリ内） */
.cms-full-delete-btn {
  background: #d32f2f !important;
  color: white !important;
}
```

### JavaScriptカスタマイズ

#### コレクション一覧の日付・タイトル分離（`formatCollectionEntries`）

`MutationObserver` でDOM変更を監視し、`YYYY-MM-DD | タイトル` 形式のテキストを検出してスタイル付きの要素に変換します。

#### 削除ボタンのリネーム（`relabelImageButtons`）

全 `<button>` 要素を監視し、テキストが「削除」または「削除する」（日本語locale対応）のボタンを検出します。

- **メディアライブラリ内**（`StyledModal`, `MediaLibrary`, `LibraryFooter` の子孫）: 「完全削除」に変更（赤色スタイル適用）
- **エディタフィールド内**（上記以外）: 「選択解除」に変更（グレースタイル適用）

#### HEIC画像の自動変換対応

`MutationObserver` で `input[type="file"]` 要素を監視し、accept属性を `image/jpeg,image/jpg,image/png,image/webp,image/gif` に制限します。iOSではこの制限により、HEIC画像が自動的にJPEG形式で送信されます。

#### pull-to-refresh 無効化

iOSでページ上部から下方向にスワイプした際のリロードを防止します。モーダル内やスクロール可能な要素内でのスクロールは妨害しません。

---

## ビルド時画像最適化

`src/integrations/image-optimize.mjs` で Astro のビルドフック `astro:build:done` を使用しています。

### 処理内容

1. `dist/images/uploads/` ディレクトリを走査
2. JPEG、PNG、WebP ファイルを検出
3. 幅が1200pxを超える画像をリサイズ
4. 各形式に応じた圧縮を適用
5. 元ファイルを上書き保存

### 設定値

| 項目 | 値 |
| :--- | :--- |
| 最大幅 | 1200px |
| JPEG品質 | 80%（mozjpeg） |
| PNG品質 | 80%（compressionLevel: 9） |
| WebP品質 | 80% |

### Astro設定（astro.config.mjs）

```javascript
import imageOptimize from './src/integrations/image-optimize.mjs';

export default defineConfig({
  output: 'static',
  integrations: [imageOptimize()],
  markdown: {
    rehypePlugins: [rehypeImageCaption],
  },
});
```

---

## GitHub OAuth 認証

### OAuth App の作成手順

1. [GitHub > Settings > Developer settings > OAuth Apps](https://github.com/settings/developers) を開く
2. 「New OAuth App」をクリック
3. 以下を入力:

| 項目 | 値 |
| :--- | :--- |
| Application name | `My Blog CMS` |
| Homepage URL | `https://reiwa.casa` |
| Authorization callback URL | `https://reiwa.casa/auth/callback` |

4. Client ID と Client Secret を取得

### 認証フロー

```
1. 管理画面で「GitHubでログイン」をクリック
2. /auth にリダイレクト（Cloudflare Function）
3. GitHubの認可画面に遷移
4. ユーザーが承認
5. /auth/callback にリダイレクト（Cloudflare Function）
6. アクセストークンを取得
7. postMessage でDecap CMSにトークンを送信
8. ログイン完了
```

### Cloudflare Functions の実装

#### `/auth` エンドポイント（`functions/auth/index.js`）

GitHubの認可URLにリダイレクトします。`redirect_uri` はリクエストのオリジンから自動構築されます。

#### `/auth/callback` エンドポイント（`functions/auth/callback.js`）

GitHubからアクセストークンを取得し、Decap CMSのハンドシェイクプロトコルに従ってトークンを送信します。

```javascript
// ハンドシェイクプロトコル
window.opener.postMessage("authorizing:github", "*");
// 親ウィンドウからの応答を待ってからトークンを送信
window.opener.postMessage(
  "authorization:github:success:" + JSON.stringify({ token, provider: "github" }),
  event.origin
);
```

---

## Cloudflare Pages 設定

### ビルド設定

| 項目 | 値 |
| :--- | :--- |
| フレームワーク | Astro |
| ビルドコマンド | `npm run build` |
| 出力ディレクトリ | `dist` |
| ルートディレクトリ | `/` |
| Node.js バージョン | 18以上 |

### 環境変数

| 変数名 | 説明 | 設定環境 |
| :--- | :--- | :--- |
| `OAUTH_CLIENT_ID` | GitHub OAuth App の Client ID | Production + Preview |
| `OAUTH_CLIENT_SECRET` | GitHub OAuth App の Client Secret | Production + Preview |

環境変数を変更した場合は再デプロイが必要です。

### カスタムドメイン

1. Cloudflare Pages ダッシュボードの「カスタムドメイン」タブを開く
2. `reiwa.casa` を追加
3. DNSレコードが自動設定される

---

## トラブルシューティング

### 「OAuth client ID not configured」エラー

**原因**: Cloudflare Pagesの環境変数が未設定

**対処**:
1. Cloudflare Pages > 設定 > 環境変数を確認
2. `OAUTH_CLIENT_ID` と `OAUTH_CLIENT_SECRET` を設定
3. 再デプロイを実行

### 「redirect_uri is not associated」エラー

**原因**: GitHub OAuth AppのCallback URLが不正

**対処**:
1. GitHub OAuth App 設定を開く
2. Authorization callback URL が `https://reiwa.casa/auth/callback` であることを確認
3. 末尾スラッシュなし、`https://` であることを確認

### 認証後にログインできない

**原因**: postMessage のハンドシェイクが正しく動作していない

**対処**: `functions/auth/callback.js` が以下のプロトコルを正しく実装しているか確認
1. `window.opener.postMessage("authorizing:github", "*")` を送信
2. 親ウィンドウからの応答を待機
3. トークンを含むメッセージを `event.origin` 宛に送信

### キャッシュが残っている

**対処**:
- ブラウザのキャッシュをクリア（Ctrl+Shift+Delete / Cmd+Shift+Delete）
- またはシークレットモードで開く

---

## 今後の拡張

### コレクションの追加

1. `public/admin/config.yml` に新しいコレクション定義を追加
2. `src/content/posts/` に対応するディレクトリを作成
3. コミット・プッシュで反映

### 検索機能

Algolia等の検索サービスを統合してサイト内検索を追加できます。

### プレビュー機能

Cloudflare PagesのPreview環境を活用して、記事のプレビューを実装できます。

---

**最終更新**: 2026年2月14日
