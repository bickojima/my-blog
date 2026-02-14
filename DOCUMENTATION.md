# My Blog - プロジェクトドキュメント

## 📋 目次

1. [プロジェクト概要](#プロジェクト概要)
2. [技術スタック](#技術スタック)
3. [ディレクトリ構造](#ディレクトリ構造)
4. [セットアップ手順](#セットアップ手順)
5. [Decap CMS設定](#decap-cms設定)
6. [GitHub OAuth設定](#github-oauth設定)
7. [Cloudflare Pages設定](#cloudflare-pages設定)
8. [トラブルシューティング](#トラブルシューティング)
9. [今後の拡張](#今後の拡張)

---

## プロジェクト概要

Astro + Decap CMSを使用した静的ブログサイト。Cloudflare Pagesでホスティングし、GitHubアカウントでログインしてコンテンツを管理できます。

- **本番URL**: https://reiwa.casa
- **管理画面**: https://reiwa.casa/admin
- **リポジトリ**: https://github.com/bickojima/my-blog

---

## 技術スタック

### フロントエンド
- **Astro** v5.17.1 - 静的サイトジェネレーター
- **Decap CMS** v3.10.0 - ヘッドレスCMS

### ホスティング & デプロイ
- **Cloudflare Pages** - 静的サイトホスティング
- **Cloudflare Functions** - サーバーレス関数（OAuth認証）

### バージョン管理 & 認証
- **GitHub** - コード管理 + コンテンツストレージ
- **GitHub OAuth App** - 認証プロバイダー

---

## ディレクトリ構造

```
my-blog/
├── functions/              # Cloudflare Functions
│   └── auth/
│       ├── index.js        # OAuth認証開始エンドポイント
│       └── callback.js     # OAuthコールバック処理
│
├── public/                 # 静的アセット
│   ├── admin/             # Decap CMS管理画面
│   │   ├── index.html     # 管理画面HTML
│   │   └── config.yml     # Decap CMS設定
│   ├── images/            # 画像ファイル
│   └── _headers           # Cloudflare Pagesヘッダー設定
│
├── src/                   # Astroソースコード
│   ├── content/           # コンテンツファイル（Markdown）
│   │   └── posts/
│   │       ├── devices/   # デバイスカテゴリ
│   │       └── finance/   # ファイナンスカテゴリ
│   ├── layouts/           # レイアウトコンポーネント
│   ├── pages/             # ページファイル
│   ├── styles/            # スタイルシート
│   └── content.config.ts  # コンテンツコレクション設定
│
├── astro.config.mjs       # Astro設定
├── wrangler.toml          # Cloudflare Workers設定
├── package.json           # 依存関係
└── tsconfig.json          # TypeScript設定
```

---

## セットアップ手順

### 1. ローカル開発環境

```bash
# リポジトリをクローン
git clone https://github.com/bickojima/my-blog.git
cd my-blog

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

開発サーバーは `http://localhost:4321` で起動します。

### 2. ビルド

```bash
npm run build
```

ビルド成果物は `dist/` ディレクトリに生成されます。

---

## Decap CMS設定

### 設定ファイル: `public/admin/config.yml`

```yaml
backend:
  name: github
  repo: bickojima/my-blog
  branch: main
  base_url: https://reiwa.casa
  auth_endpoint: /auth

media_folder: "public/images/uploads"
public_folder: "/images/uploads"

locale: "ja"

collections:
  - name: "devices"
    label: "デバイス"
    folder: "src/content/posts/devices"
    create: true
    fields:
      - { label: "タイトル", name: "title", widget: "string" }
      - { label: "公開日", name: "date", widget: "datetime" }
      - { label: "本文", name: "body", widget: "markdown" }
      # ... その他のフィールド

  - name: "finance"
    label: "ファイナンス"
    folder: "src/content/posts/finance"
    create: true
    fields:
      # ... 同様のフィールド定義
```

### 重要な設定項目

- **`base_url`**: OAuth認証サーバーのベースURL（本番ドメイン）
- **`auth_endpoint`**: 認証エンドポイントのパス（`/auth`）
- **`media_folder`**: 画像アップロード先（Git管理下）
- **`public_folder`**: 公開時の画像パス

---

## GitHub OAuth設定

### 1. OAuth Appの作成

1. [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. 「New OAuth App」をクリック
3. 以下を入力：

| 項目 | 値 |
|------|-----|
| **Application name** | `My Blog CMS` |
| **Homepage URL** | `https://reiwa.casa` |
| **Authorization callback URL** | `https://reiwa.casa/auth/callback` |

4. 「Register application」をクリック
5. **Client ID** をコピー
6. 「Generate a new client secret」をクリックして **Client Secret** をコピー

### 2. 認証フロー

```
1. ユーザーが「GitHubでログインする」をクリック
2. /auth にリダイレクト（Cloudflare Function）
3. GitHubの認証画面に遷移
4. ユーザーが承認
5. /auth/callback にリダイレクト（Cloudflare Function）
6. アクセストークンを取得
7. postMessageでDecap CMSにトークンを送信
8. ログイン完了
```

---

## Cloudflare Pages設定

### 1. ビルド設定

| 項目 | 値 |
|------|-----|
| **Framework preset** | Astro |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `/` |
| **Node version** | 18以上 |

### 2. 環境変数

**Settings > Environment variables** で以下を設定：

| 変数名 | 値 | 環境 |
|--------|-----|------|
| `OAUTH_CLIENT_ID` | GitHub OAuth AppのClient ID | Production + Preview |
| `OAUTH_CLIENT_SECRET` | GitHub OAuth AppのClient Secret | Production + Preview |

**重要**: 環境変数を追加・変更した後は、必ず再デプロイが必要です。

### 3. カスタムドメイン

1. Cloudflare Pages ダッシュボード > my-blog
2. 「カスタムドメイン」タブ
3. `reiwa.casa` を追加
4. DNSレコードを設定（Cloudflareが自動設定）

---

## トラブルシューティング

### 問題1: 「OAuth client ID not configured」エラー

**原因**: Cloudflare Pagesの環境変数が設定されていない

**解決策**:
1. Cloudflare Pages > 設定 > 環境変数
2. `OAUTH_CLIENT_ID` と `OAUTH_CLIENT_SECRET` を確認
3. 再デプロイを実行

---

### 問題2: GitHubで「redirect_uri is not associated」エラー

**原因**: GitHub OAuth AppのCallback URLが間違っている

**解決策**:
1. GitHub OAuth App設定を開く
2. **Authorization callback URL** が `https://reiwa.casa/auth/callback` になっているか確認
3. 末尾にスラッシュがないこと、`https://` であることを確認

---

### 問題3: 認証後、管理画面に戻るがログインできない

**原因**: postMessageの形式が間違っている、またはハンドシェイクが実装されていない

**解決策**:
Decap CMSは以下の認証フローを期待しています：

1. **Step 1**: `window.opener.postMessage("authorizing:github", "*")`
2. **Step 2**: 親ウィンドウからの応答を待つ
3. **Step 3**: `window.opener.postMessage("authorization:github:success:" + JSON.stringify({token, provider}), event.origin)`

この実装は `functions/auth/callback.js` で行われています。

---

### 問題4: 古いキャッシュが残っている

**原因**: ブラウザが古いJavaScriptをキャッシュしている

**解決策**:
- Chrome/Edge: `Ctrl + Shift + Delete` (Windows) / `Cmd + Shift + Delete` (Mac)
- または、シークレット/プライベートモードで開く

---

### 問題5: Netlify Identityとの競合

**原因**: `public/admin/index.html` に `netlify-identity-widget.js` が残っている

**解決策**:
```html
<!-- ❌ 削除すべき -->
<script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>

<!-- ✅ これのみでOK -->
<script src="https://unpkg.com/decap-cms@^3.10.0/dist/decap-cms.js"></script>
```

---

## Cloudflare Functions実装の詳細

### `/auth` エンドポイント (`functions/auth/index.js`)

認証を開始し、GitHubの認可URLにリダイレクトします。

```javascript
// ポイント1: redirect_uri を正しく構築
const redirectUri = `${origin}/auth/callback`;

// ポイント2: GitHub認可URLにリダイレクト
const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
githubAuthUrl.searchParams.set('client_id', clientId);
githubAuthUrl.searchParams.set('redirect_uri', redirectUri);
githubAuthUrl.searchParams.set('scope', 'repo,user');
```

### `/auth/callback` エンドポイント (`functions/auth/callback.js`)

GitHub認証後のコールバックを処理し、アクセストークンを取得してDecap CMSに送信します。

**重要なポイント**:

1. **GitHubからアクセストークンを取得**
```javascript
const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  body: JSON.stringify({
    client_id: clientId,
    client_secret: clientSecret,
    code: code,
  }),
});
```

2. **OAuth ハンドシェイクプロトコルの実装**
```javascript
// Step 1: 認可開始を通知
window.opener.postMessage("authorizing:github", "*");

// Step 2: 親ウィンドウからの応答を待つ
window.addEventListener("message", function(event) {
  // Step 3: トークンを送信
  const message = "authorization:github:success:" + JSON.stringify({
    token: token,
    provider: "github"
  });
  window.opener.postMessage(message, event.origin);
});
```

このハンドシェイクプロトコルは、Netlify CMS / Decap CMSの公式仕様に準拠しています。

**参考**:
- [netlify-cms-github-oauth-provider](https://github.com/vencax/netlify-cms-github-oauth-provider)
- [Decap CMS External OAuth Clients](https://decapcms.org/docs/external-oauth-clients/)

---

## 今後の拡張

### 1. コンテンツコレクションの追加

新しいカテゴリを追加する場合：

1. `public/admin/config.yml` に新しいコレクションを追加
2. `src/content/posts/` に対応するディレクトリを作成
3. コミット & プッシュ

### 2. 画像最適化

Astroの画像最適化機能を活用：

```bash
npm install @astrojs/image
```

### 3. カスタムウィジェット

Decap CMSでカスタムウィジェットを追加して、より高度な入力フォームを実装できます。

### 4. プレビュー機能

Cloudflare PagesのPreview環境を活用して、記事のプレビューを実装できます。

### 5. 検索機能

Algoliaなどの検索サービスを統合して、サイト内検索を追加できます。

---

## まとめ

このプロジェクトは以下の構成で動作しています：

- **Astro**: 静的サイト生成
- **Decap CMS**: コンテンツ管理
- **Cloudflare Pages**: ホスティング & デプロイ
- **Cloudflare Functions**: OAuth認証処理
- **GitHub**: コード & コンテンツ管理 + OAuth認証プロバイダー

全ての設定が正しく行われていれば、`https://reiwa.casa/admin` でログインして記事を作成・編集でき、変更は自動的にGitHubにコミットされ、Cloudflare Pagesで自動デプロイされます。

---

## 参考リンク

- [Astro Documentation](https://docs.astro.build)
- [Decap CMS Documentation](https://decapcms.org/docs/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [GitHub OAuth Apps Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)

---

**作成日**: 2026年2月14日
**最終更新**: 2026年2月14日
