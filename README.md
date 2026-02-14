# My Blog

Astro + Decap CMS を使用したブログサイト（Cloudflare Pages向け）

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 🚀 Cloudflare Pagesへのデプロイ

### 初回デプロイ

1. [Cloudflare Pages](https://pages.cloudflare.com/)にログイン
2. "Create a project" をクリック
3. GitHubリポジトリを接続
4. ビルド設定:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node version**: 18以上を推奨

### Wranglerを使用したデプロイ（オプション）

```sh
# Wranglerをインストール
npm install -g wrangler

# ログイン
wrangler login

# デプロイ
npm run build
wrangler pages deploy dist
```

### 環境変数

Decap CMSを使用する場合は、Cloudflare Pagesダッシュボードで以下の環境変数を設定してください：
- `OAUTH_CLIENT_ID` - GitHub OAuth AppのClient ID
- `OAUTH_CLIENT_SECRET` - GitHub OAuth AppのClient Secret

## 📚 詳細ドキュメント

プロジェクトの詳細な設定、トラブルシューティング、技術仕様については **[DOCUMENTATION.md](./DOCUMENTATION.md)** を参照してください。

## 🔑 管理画面

- **URL**: https://reiwa.casa/admin
- **認証**: GitHubアカウント
- **CMS**: Decap CMS

## 👀 もっと学ぶ

- [Astro Documentation](https://docs.astro.build)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Decap CMS Documentation](https://decapcms.org/docs/)
