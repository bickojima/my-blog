# Issue #117 hardening 項目 判定表（2026-09-23）

対象: [Issue #117](https://github.com/bickojima/my-blog/issues/117)（セキュリティ監査 run-2 の hardening 項目 15件）
方針: `docs/qa-2026-09-23-open-issues.md` Q5「各項目を調査し、効果があるものは実装・検証する。効果が乏しいものは理由を記録して対応不要と判断する」。
前提: 15件はいずれも**脆弱性ではなく hardening**（監査の敵対的検証で「影響を受ける主体が立たない」または「境界を越えない」と判定済み）。本表の「実装」も脆弱性修正ではなく多層防御・保守性の改善として扱う。
照合基準: 2026-09-23 時点の `origin/staging`（`6654446`）と `origin/main`（`1c4ea54`）。`functions/`・`scripts/`・`.github/`・`public/_headers`・`Base.astro` は両ブランチで差分なし。Issue コメントの「対応済み」も実ファイルと実挙動で再確認した。

## 1. 判定一覧

| # | 項目 | 照合時の現状 | 判定 | 根拠 | 残余リスク | 検証手段 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | gray-matter の `---js` が eval される | **未解決**（Issue コメントの「SEC-29で完了」は誤り）。`matter(content, { language: 'yaml' })` を渡しても、本文が `---js` で始まると gray-matter は区切り直後の言語宣言を優先する（`gray-matter/index.js` parseMatter）。`organize-posts.mjs` 旧版で `---js` 記事を処理するとペイロードが実行されることを実測。**第2の経路（レビュー差し戻しで判明）**: Cloudflare Pages のビルドコマンド `npm run build` は organize-posts より前に `vitest run --exclude tests/build.test.mjs` を実行し、`content-validation`・`cms-config`・`fuzz-validation`・`build`（CI のみ）の各テストと E2E `app-info.spec.ts` が全記事・固定ページを gray-matter の `matter()` で直接解析していた。このため `---js` 記事は Pages のビルド環境と CI で organize-posts より先に eval される（修正前、一時的な `---js` 記事を置いて `npx vitest run tests/content-validation.test.mjs` を実行し、ペイロードがマーカーファイルを作ることを実測）。**Astro 本体のローダーは安全**: `@astrojs/internal-helpers/frontmatter` は `---`/`+++` の中身を js-yaml の `load`（v4、JS 型なし）／TOML でのみ解析し、`---js` は YAML エラーでビルド失敗になる（`npx astro build` で実測、ペイロード非実行） | **実装（Bug #52）** | 意図した防御が効いていないことの是正。修正は小さい | 能力の増加は無い（到達主体は既にリポジトリ書込権限または CI 上の任意コード実行を持つ）。`---js` 記事を置くと Vitest のコンテンツ系テストと organize-posts は例外で失敗・除外され（fail-closed）、`npm run build` はビルドを止める | `tests/security-hardening.test.mjs`（`---js`/`---javascript`/`---JS`/`---json` 拒否、YAML 正常解析、organize-posts 実行でペイロード非実行、tests/・scripts/ の gray-matter 直接読み込み禁止、`src/content` 読み取り箇所のラッパー経由）。旧版で実行・新版で非実行を organize-posts と `npx vitest run tests/content-validation.test.mjs` の両経路で実測 |
| 2 | CI に `permissions: contents: read` | 対応済み（SEC-33）。staging/main とも確認 | 対応済み | — | — | `build.test.mjs`（SEC-33） |
| 3 | actions を commit SHA で固定 | 未対応（`@v4` タグ参照） | **実装（SEC-36）** | タグは上流で付け替え可能。SHA 固定でタグ改ざん時に CI で任意コードが動く経路を閉じる。現在 `@v4` が指す commit（checkout / setup-node とも v4.4.0）にそのまま固定したので挙動変化なし | 固定した SHA が古くなる（更新の検知・運用は #132 の依存監視へ委ねる）。CI トークンは `contents: read` で、Pages デプロイは CI と独立のため影響範囲は元々小さい | `build.test.mjs`（全 `uses:` が40桁 SHA＋版コメント） |
| 4 | `{ once: true }` | 対応済み（SEC-31） | 対応済み | — | — | `auth-functions.test.mjs`（SEC-31 4件） |
| 5 | `isAllowedOrigin` の重複 | 未対応（index.js / callback.js に同一実装） | **実装（SEC-37）** | 許可リストの写しが独立に腐る（片方だけ変えると `/auth` は通るが `/auth/callback` は 403 などログイン不能）ことを構造的に防ぐ。`functions/_shared/allowed-origin.js` に一本化。許可範囲は従来と完全に同一 | なし（許可範囲は不変）。共有モジュールは onRequest* を export しないため Pages のルートにならないことを `wrangler pages functions build` で確認（生成ルートは `/auth` と `/auth/callback` のみ） | `security-hardening.test.mjs`（重複定義なし・import・許可/拒否表・両エンドポイントの判定一致）、`auth-functions.test.mjs`（SEC-27 更新）、実ブラウザ E2E H01 |
| 6 | `redirect_uri` の定数化 | 未対応（`url.origin` から導出） | **対応不要** | `url.origin` は「この Function が配信されているホスト」であり、Cloudflare がホスト名でルーティングするため要求側が任意の値を入れられない。さらに許可リストで絞られ、GitHub OAuth App は登録済み callback URL（本番 `https://reiwa.casa/auth/callback`、staging `https://staging.reiwa.casa/auth/callback`。DOCUMENTATION 2.4.8章）とホストが一致しない `redirect_uri` を拒否する。定数化には環境ごとの値を Cloudflare ダッシュボード（リポジトリ外）かブランチ別ファイルで持つ必要があり、#127（環境値の手動管理）を悪化させる | `redirect_uri` の最終的な正しさは GitHub 側の照合に依存する（現状どおり）。照合に失敗しても fail-closed（ログイン不可）でありトークンは発行されない | `auth-functions.test.mjs`（redirect_uri がオリジンから生成されること）、E2E H01（実コードの redirect_uri で認可→コールバックが成立） |
| 7 | プレビューのワイルドカードが広い | 未対応（`*.my-blog-3cg.pages.dev` を許可） | **対応不要** | 判定対象は自分が配信されているホストなので、許可リストが制限できるのは「このプロジェクトのどのデプロイで OAuth を動かすか」だけ。任意ブランチのプレビューは**そのブランチ自身の Functions コード**で動くため、ここを狭めても悪意あるブランチは自分のコピーを書き換えられ、防御にならない。加えてプレビューのホストは GitHub の callback URL と一致せず、正規コードでもログインは成立しない。`staging.my-blog-3cg.pages.dev`（staging の実体ホスト）等の検証用途を壊すだけで効果がない | プレビュー上で `/auth` が GitHub へのリダイレクトまで進む（GitHub 側で拒否される）。プレビューを作れるのはリポジトリ書込権限保持者のみ | `auth-functions.test.mjs` / `security-hardening.test.mjs`（許可・拒否表） |
| 8 | `http://localhost` 分岐 | 未対応 | **対応不要** | Cloudflare Pages 上では TLS 終端されホストは常に `https://` の独自ドメインまたは `*.pages.dev` のため、この分岐には到達しない（本番挙動への寄与はゼロ）。削除してもセキュリティ上の差は無く、ローカルの `wrangler pages dev` による認証確認と既存テストを壊す | なし（到達不能分岐） | `security-hardening.test.mjs`（`https://localhost` や `evil-localhost` は拒否） |
| 9 | callback の CSP（frame-ancestors / form-action / base-uri、charset） | 未対応 | **実装（SEC-38）** | `frame-ancestors`・`form-action`・`base-uri` は `default-src` にフォールバックしない。Functions の応答には `public/_headers` が適用されないため、この応答自身で完結させる必要がある。`X-Frame-Options: DENY` に加えて CSP 側でも埋め込みを拒否し、`Content-Type: text/html; charset=utf-8` と `<meta charset>` で文字コード推測を排除 | `script-src 'unsafe-inline'` は残る（トークンを埋め込む動的インラインスクリプトのため。nonce 化は効果に対して変更が大きく今回は見送り） | `security-hardening.test.mjs`（CSP ディレクティブ・charset）、`auth-functions.test.mjs`（Content-Type）、実ブラウザ E2E H02/H04/H05（CSP 下でハンドシェイク成立、iframe は `frame-ancestors 'none'` 違反として遮断、opener なしでもインラインスクリプトが動作） |
| 10 | `escapeForScript` が U+2028/U+2029・バッククオートを扱わない | 未対応 | **実装（SEC-39）** | 現在の sink（ダブルクオート文字列）では破綻しないが、置換順序と sink の形に依存した推論だった。`JSON.stringify` で「引用符込みのリテラル」を生成し `< > &` と U+2028/U+2029 を `\uXXXX` 化する方式に置換。テンプレートリテラルへ流用されても安全 | なし（トークン・オリジンはいずれも GitHub/Cloudflare 由来で攻撃者制御下にない前提は従来どおり） | `security-hardening.test.mjs`（敵対的トークン9種で「評価結果が元の文字列と完全一致」「生の区切り文字が出ない」「`</script>` は1回のみ」）、`fuzz-validation.test.mjs`（ソース文字列一致から挙動検証へ強化）、実ブラウザ E2E H03（`</script>`・引用符・バッククオート・`${}` を含むトークンが CMS へ完全一致で渡る） |
| 11 | normalize-images の例外処理・サイズ上限 | 対応済み（SEC-32） | 対応済み | — | — | `build.test.mjs`（SEC-32 3件） |
| 12 | `.assetsignore` は Pages で無効 | 対応済み（SEC-34） | 対応済み | — | — | `build.test.mjs` / `fuzz-validation.test.mjs`（SEC-34） |
| 13 | `decap-cms-app` が未使用 | 対応済み（依存削除、CDN は `decap-cms@3.16.2`） | 対応済み | — | — | `package.json` に無いこと、admin の CDN 固定テスト |
| 14 | 公開ページにヘッダ配信の CSP が無い | 未対応（`Base.astro` の meta CSP のみ） | **対応不要（現時点）** | (a) `/*` にヘッダ CSP を置くと Cloudflare Pages は `/admin/*` にも Append する（Bug #28/#49）。CSP は複数あると全て適用されるため、公開用の厳しい方針（unpkg・`unsafe-eval` 不可）が管理画面を壊す。回避には `! Content-Security-Policy` による detach 等の未検証の構成が必要で、本番管理画面へのリスクが効果を上回る。(b) meta CSP が運べない `frame-ancestors` は `/*` の `X-Frame-Options: SAMEORIGIN` で既に担保。(c) 非 HTML 応答（RSS・画像・favicon・url-map.json）は自前の静的ファイルで `nosniff` 付き。(d) `'unsafe-inline'` の撤廃はインラインスクリプトのハッシュ化（Astro の CSP 機能等）を伴う公開サイト全体の変更で、注入元となりうるのはリポジトリ書込権限を持つ執筆者本人のみ | 公開ページに将来 XSS の sink が生じた場合、CSP は緩和にならない（`'unsafe-inline'`）。**再検討の契機**: 第三者由来のコンテンツ（コメント・埋め込み等）を受け入れるとき、外部スクリプトを追加するとき、または `/admin/*` の CSP 設計（#130）を見直すとき | 現状の meta CSP・XFO は既存テスト（SEC-28、SEC-30）で担保 |
| 15 | ブランチ束縛が4箇所で手動管理 | 未対応 | **#127 へ移管** | #127（環境固有ファイルの構造的解消）と同根。実装要件・完了証跡は #127 に集約する（Q5 / 4章の依存関係） | #127 の完了まで SEC-35（Bug #51 再発防止テスト）で検知のみ。**2026-09-23 追記: #127 で4箇所をファイルから削除し、ビルド時 `CF_PAGES_BRANCH`／実行時ホスト名から導出する構造へ変更**（`src/lib/site-env.mjs`・`public/admin/cms-env.js`。DOCUMENTATION 4.6.4章） | SEC-35 改訂（`cms-config`・`env-derivation`・`build`・E2E `cms-env-branch`）、SEC-127A（仮ID） |

## 2. 実装内容と本番影響範囲

| 要件 | 変更ファイル | 本番への影響 |
| :--- | :--- | :--- |
| Bug #52（SEC-29 是正） | `scripts/lib/safe-frontmatter.mjs`（新規）、`scripts/organize-posts.mjs`、`src/content` を読むテスト（`content-validation`・`cms-config`・`fuzz-validation`・`build` の各 `.test.mjs`、`e2e/app-info.spec.ts`） | ビルド前処理のみ。YAML の記事は従来どおり処理（本ブランチで `npm run build:raw` 後の `public/admin/url-map.json` に差分なし）。YAML 以外の frontmatter を持つ記事は url-map.json とフォルダ整理の対象外になる（Astro 本体は元々 YAML のみ対応） |
| SEC-36 | `.github/workflows/ci.yml` | CI のみ。固定先は現行 `@v4` と同一 commit のため挙動変化なし。本番配信・Pages ビルドには影響しない |
| SEC-37 | `functions/_shared/allowed-origin.js`（新規）、`functions/auth/index.js`、`functions/auth/callback.js` | **本番の OAuth ログイン経路（Pages Functions）**。許可範囲は同一。Pages のバンドルで共有モジュールが取り込まれ、ルートは `/auth`・`/auth/callback` のみであることを `wrangler pages functions build` で確認済み |
| SEC-38 | `functions/auth/callback.js` | **本番の OAuth コールバック応答ヘッダー**。ポップアップとして開くため `frame-ancestors 'none'` の影響は無い（実ブラウザ E2E で3デバイス確認） |
| SEC-39 | `functions/auth/callback.js` | **本番の OAuth コールバック HTML**。トークンの受け渡し値は同一（E2E で Authorization ヘッダーの完全一致を確認） |

`public/_headers`・`Base.astro`・`public/admin/*` は変更していない（公開ページ・管理画面の配信ヘッダーは不変）。

**staging 反映後に必要な確認**: Functions の実ランタイム（Cloudflare）での動作はローカルでは再現しきれないため、staging マージ後に `https://staging.reiwa.casa/admin/` で実際に GitHub ログインが完了すること、および `curl -sI` 相当で `/auth/callback` 応答（エラー応答でも可）が 403/400 等の想定ステータスを返すことを確認する。認証情報の入力は本人が行う。

## 3. 実ブラウザ E2E エビデンス

- スクリプト: `evidence/2026-09-23/issue117/verify-oauth-hardening.mjs`
- レポート: `evidence/2026-09-23/issue117/report.html`、結果: `oauth-hardening-results.json`（**15/15 PASS**、PC / iPad / iPhone × H01〜H05）
- 方式: `/auth`・`/auth/callback` を **`functions/auth/*.js` の実コード**で応答させ、GitHub のトークン交換と GitHub API のみモック。管理画面は `dist/` を `https://staging.reiwa.casa` として配信し `public/_headers` のヘッダーを付与。ログインは「GitHub でログインする」ボタンの実クリックで開始する。既存の `verify-comprehensive.mjs` は `/auth` をスタブ HTML に置換するため Functions の実コードを通らない点を補完する
- ハーネス上の変換（テスト対象外）: Playwright はフルフィルした 302 の転送先をルーティングしないため、実コードが返した 302 を同じ Location への meta refresh に置き換えている。また観測のためコールバックページの `window.close()` を記録のみに差し替えている

## 4. 判断に迷った点

- 項目1は Issue コメントで「完了」とされていたが、実挙動では未解決だった。初回修正（organize-posts のみ）はレビューで「`npm run build` が先に実行する Vitest のテスト群も同じ経路」と差し戻され、`src/content` を読む全箇所をラッパー経由にした。脆弱性ではない（能力の増加が無い）ため、新規バグ **Bug #52** として SEC-29 の実装不備を是正する扱いにした（新規 SEC ID は採番しない）。
- 項目14は「効果が乏しい」というより「効果に対して本番管理画面を壊すリスクが高い」ための見送り。再検討の契機を上表に記載した。
- 項目3の SHA 更新運用（Dependabot 等）は #132 の範囲とし、本作業では導入しない。
