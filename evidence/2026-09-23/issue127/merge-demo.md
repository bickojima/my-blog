# Issue #127 両方向マージの実証（2026-09-23）

- 実行スクリプト: `evidence/2026-09-23/issue127/merge-demo.sh`（レビュー実行ログ全文: `merge-demo-review.log`、旧ログは参考保存）
- 実行場所: 作業用の一時 clone（使い捨て）。push できるブランチは作っていない
- レビュー再実行入力: 実装コミット `fe646e8b8474891be0f3f812ed823a66726a3df5`、`origin/main` `f60b81d3c0810bf273c5ff6430cc83a54e2ad43e`、`origin/staging` `10a1589734e62090c42fbd76ad887b06f0119bcc`

## 手順と結果

| 段階 | 操作 | 結果（事実） |
| :--- | :--- | :--- |
| 0 | 変更前の `origin/main` と `origin/staging` の環境固有ファイル差分 | 3ファイル（astro.config.mjs の SITE_URL、config.yml の branch/base_url、robots.txt）で差分あり。これがマージのたびに持ち込まれていた（Bug #51） |
| 1 | staging-sim = 実装コミット（staging に本 PR をマージした状態） | — |
| 2 | main-sim = `origin/main` に staging-sim を初回マージ（DOCUMENTATION 4.6.5章の移行手順） | コンフリクト3件（astro.config.mjs、public/admin/config.yml、public/robots.txt）。いずれも新構造（staging 側）に揃えた。移行後、main-sim と staging-sim の環境関連ファイル（7パス）差分は**0**、`public/robots.txt` なし |
| 3 | 分岐させる: main-sim に下書き記事を追加（CMS の本番コミットを模擬）、staging-sim にドキュメント変更（機能追加を模擬） | 分岐点は実装コミット |
| 4a | staging → main（`merge-to-main`） | コンフリクトなし。取り込まれたのは `docs/MODERN-WEB-GUIDANCE.md` のみ。環境関連ファイルの変化**0** |
| 4b | main → staging（`merge-to-staging`） | コンフリクトなし。取り込まれたのは追加記事のみ。環境関連ファイルの変化**0** |
| 5 | マージ後の両ブランチの環境関連ファイル差分 | **0**。両方とも `public/robots.txt` なし、config.yml の branch/base_url 行 0 |
| 5b | `merge-to-main` を `CF_PAGES_BRANCH=main` でビルド | robots: `Allow: /` + `Sitemap: https://reiwa.casa/sitemap-index.xml`、canonical `https://reiwa.casa/`、sitemap の全URLが `https://reiwa.casa`。レビュー再実行時 761 passed（この時点の751＋追加記事の動的テスト10。後続SEC-41で基準は754） |
| 5b | `merge-to-staging` を `CF_PAGES_BRANCH=staging` でビルド | robots: `Disallow: /` のみ、canonical `https://staging.reiwa.casa/`、sitemap の全URLが `https://staging.reiwa.casa`。レビュー再実行時 761 passed（基準751＋追加記事10） |
| 6 | 陰性対照: 旧構造の値（config.yml に `branch: main` / `base_url`、`public/robots.txt`）を持ち込む | env-derivation の静的ガード3件と cms-config の SEC-35 改訂1件、計4件が FAIL（検出できる） |

環境関連ファイル（7パス）: `astro.config.mjs` `public/admin/config.yml` `public/admin/index.html` `public/admin/cms-env.js` `src/lib/site-env.mjs` `src/pages/robots.txt.ts` `public/robots.txt`

## 分かったこと

- **事実**: 移行後はどちら向きのマージでも環境関連ファイルは変化せず、コンフリクトも出なかった。環境の違いはビルド環境変数（`CF_PAGES_BRANCH`）だけで生成物に現れた。
- **事実**: 初回（移行）マージだけは3ファイルでコンフリクトする。4.6.5章の手順（新構造側に揃える）で解消できる。
- **推測**: 実際の本番反映（staging → main の PR）でも同じ3ファイルのコンフリクトが出る見込み。GitHub の PR 画面で解消する場合も「staging 側（新構造）を採用、`public/robots.txt` は削除」で揃えればよい。
- 制約: Cloudflare Pages 上の実ビルドは行っていない（ローカルで `CF_PAGES_BRANCH` を与えたビルドで代替）。本番反映後は DOCUMENTATION 4.6.6章の読み取り確認で実物を確かめる。
