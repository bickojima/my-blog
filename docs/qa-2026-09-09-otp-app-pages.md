# Gmail OAuth本番化用ページ（playwright-home #220）

## 要件確認

| 確認事項 | ユーザーの回答・決定 |
| --- | --- |
| OTP Gmail認証の復旧を進めるか | 「はいやって」。7日で失効する原因を是正する |
| 認証方式 | 「Gmail APIを本番モードへ変更」。IMAPやWorkspace移行は採用しない |
| 公開ドメイン | `reiwa.casa`。既存my-blogリポジトリのCloudflare Pagesで使用中、DNSもCloudflare |
| 公開説明の分量 | 「皆に見られるので超最小限の記載で」。紹介は用途の短文、ポリシーは必要なデータ取扱いだけに限定 |
| 紹介文をさらにぼかせないか | 「運営者本人が使用するツールです。Gmailの取得をします」程度へ短縮。**プライバシーポリシー本文はぼかさない**（Googleがデータの取得・利用・共有・保存の開示を求めるため） |
| CMSで管理できないのは困る、元のサイトに統合してほしい | 専用ルート・専用レイアウトを廃し、既存の固定ページコレクションへ移す |
| 変な実装を入れず最小限の変更で | sitemap除外はfrontmatter走査をやめ、既存の `/admin/` 除外と同じ1行のfilterに戻す。ずれはビルドテストで検出する |
| CMSで編集した瞬間にnoindexが消えないように | CMSに「検索結果に出さない」項目を定義済み。さらに、固定ページの全フロントマター項目・Zodスキーマ項目がCMS設定に存在することをテストで固定した（フィールドを消すと3件が落ちることを実測） |
| 検索結果への露出 | 「追加した2ページはnoindexで」。`noindex` とsitemap除外をセットで適用する |

## メニュー表示の追加確認（2026-09-09）

| 確認事項 | ユーザーの回答・決定 |
| --- | --- |
| 2ページを統合したい理由 | 「プルダウンメニューから2ページ出るので邪魔だった」 |
| 本番反映の承認 | 「e2e問題なければmain反映までやってください」。staging検証後にmainへ反映する |
| メニューから除外する条件 | 「noindexならプルダウン非表示にすると良い」。`noindex: true` の固定ページをヘッダーナビ全体から除外する |

2ページの構成とURL、CMS編集、本文の相互リンクは維持する。表示対象件数で既存の0件・1件・複数件のナビ分岐を使う。CSSで隠すのではなく、ビルド時のナビ生成対象から外す。新しいCMS項目は追加しない。これは `noindex` 自体の標準動作ではなく、本ブログの表示方針である。

## 実装判断

- FR-29として `/playwright-home/` と `/playwright-home-privacy/` を追加する。既存の同一ドメイン内のパスを使うためDNS変更は不要。
- **既存の固定ページコレクション（`src/content/pages/`）に載せ、CMSから編集できるようにする。** 当初は `src/pages/playwright-home/` の専用ルートと `AppInfo.astro` で実装したが、「CMSで管理できない」「元のサイトに統合してほしい」という指摘を受けて作り直した。当初はヘッダーナビにも並べたが、追加確認により `noindex` の固定ページは除外する。
- CMSのURLスラグは `^[a-z0-9-]+$` でスラッシュを含められないため、プライバシーポリシーのURLは `/playwright-home/privacy/` から `/playwright-home-privacy/` へ変わった。
- 検索除外は固定ページのfrontmatter `noindex: true`（CMSの「検索結果に出さない」）で行い、sitemap除外は `astro.config.mjs` のfilter1行で行う。両者のずれはビルドテスト（2.5.9章 #3）が検出する。
- **Decap CMSは設定にないフロントマター項目を保存時に落とす**ため、CMS側の項目定義は必須。将来の追加項目でも同じ事故が起きないよう、固定ページの全フロントマター項目とZodスキーマ項目がCMS設定に存在することを `cms-config.test.mjs`（2.4章 #35b〜#35d）で突き合わせる。CMS設定から項目を消すと3件が失敗することを実測で確認した。
- Gmail連携の公開説明に限定し、取得項目、認証コードの送信目的、既読化、保存、削除、Limited Useを最小限の文章で説明する。金融機関名・連携サービス名・個人名・メールアドレス・機器構成・認証値は掲載しない。連絡先はGoogle同意画面のサポートメールを案内する。
- staging先行。main反映とGoogle Cloudの設定適用はレビュー後に行う。ページ公開自体はOAuth認証機能を持たない。
- Google公式の個人利用例外はOAuth審査申請の免除であり、必要なブランディング項目を省略できる意味ではない。現行ConsoleでホームページとプライバシーポリシーのURLが必須と実測済み。

## 検証

- `npm test`（既存ビルド統合テストを含む）。
- FR-29の実操作E2E：公開レスポンス、タイトル、見出し、日本語設定、横はみ出し、axe WCAG 2.1 AA、リンククリック、Enter操作をPC/iPad/iPhoneで確認。
- stagingデプロイ後も同じE2Eを実行し、スクリーンショットを `evidence/2026-09-09/` に保存する。

### 検証用サーバーの起動修正

初回E2Eはテスト開始前にローカルサーバーが404を返した。5 Whys: (1) 起動確認URLが404、(2) `dist`を参照できない、(3) PlaywrightのwebServerが設定ファイルのディレクトリで起動、(4) 設定を日付別evidenceへ置いた、(5) 設定追加時にcwdを明示しなかった。`webServer.cwd`をリポジトリルートに固定した。本番・共有サービスへの影響はない。

### 検証結果（2026-09-09、ローカル `feature/otp-app-pages`）

| 実行 | 結果 |
| --- | --- |
| `npm test`（Vitest） | 610 passed（検索除外の検証5件＋CMS項目欠落防止3件＋固定ページ2件分のコンテンツ検証） |
| `npm run build` | 成功。`dist/playwright-home/index.html` と `dist/playwright-home-privacy/index.html` を生成 |
| FR-29 E2E（`evidence/2026-09-09/verify-app-info.config.ts`） | 6 passed（2ページ×PC/iPad/iPhone） |
| `npm run test:e2e`（全体） | 442 passed / 8 skipped（定義450件）。既存テストの退行なし |
| FR-29 E2E（staging実機） | 6 passed。`https://staging.reiwa.casa/playwright-home/`・`/playwright-home-privacy/` に対して実行 |

- `webServer.cwd` 修正後のE2Eをこの引き継ぎで実行し、合格を確認した。
- 証跡は `evidence/2026-09-09/screenshots/`（6枚）と `app-info-results.json`。赤枠は注釈で、合否は実クリック・Enter操作とaxeで判定する。
- staging実機の実測（2026-09-09、CMS統合後）: 両ページとも `<meta name="robots" content="noindex">` あり。
  `sitemap-0.xml` は17URLで `playwright-home` を含まない。トップ・`/about/`・`/profile/` に `noindex` の混入なし。
  ヘッダーナビのドロップダウンから両ページへ到達できる。
- 当初のCMS統合後はヘッダーナビに掲載されていた（旧記録の「載らない」は誤記）。今回の追加要件で除外する。RSSには載らない。当初はsitemapに載せていたが、ユーザーの指示により **`noindex` ＋ sitemap除外** に変更した（`Base.astro` の `noindex` プロパティと `astro.config.mjs` の `filter`）。Googleの要件は公開アクセス可能であることで、`noindex` は同意画面の登録を妨げない。

## main反映時の注意

`astro.config.mjs` はブランチごとに手動管理する差分（`SITE_URL`）を持つ。staging→main のマージでは
**`SITE_URL` は main の値（`https://reiwa.casa`）を維持し、sitemap の `filter` 変更（`/playwright-home/` 除外）は取り込む**。
取り込み漏れがあると、noindexは効いていてもsitemapに載ったままになる。ビルドテスト（2.5.9章 #3）で検出できる。

## Google側へ登録する予定値

| 項目 | 値 |
| --- | --- |
| ホームページ | `https://reiwa.casa/playwright-home/` |
| プライバシーポリシー | `https://reiwa.casa/playwright-home-privacy/` |
| 承認済みドメイン | `reiwa.casa` |

登録前にmain公開URLの応答と内容を確認する。Googleからドメイン所有権確認を要求された場合は、既存のSearch Console確認状態を調べてから必要な確認を進める。

参考：
- https://support.google.com/cloud/answer/13464323?hl=en
- https://support.google.com/cloud/answer/15549945?hl=en
- https://support.google.com/cloud/answer/15549049?hl=en

本番運用・認証情報の正本はplaywright-home。my-blogは公開説明ページのみを保管する。

### noindexメニュー除外の検証

- ローカル: Vitest 610件、FR-29実操作E2E 9件（3デバイス）、既存セキュリティ検証10件が成功。
- 証跡の注釈位置調整後にメニュー操作3件を再実行し成功。PC・iPad・iPhoneのスクリーンショットを全数目視確認した。
- セキュリティ検証は既存 `verify-security.mjs` を既存のローカルE2Eサーバーへ接続して実行。過去証跡を保護し、サーバーの強制終了処理を除外。HTTPセキュリティヘッダーの実配信はローカルサーバーの対象外。
- 全E2E: 445件成功・既存の条件付きスキップ8件・失敗0件（18.1分）。GitHub CIも成功。
- staging反映: PR #106（`9c9de0c`）。GitHub CI・Cloudflare Pages成功。実サイトのFR-29 E2Eは9 passed（PC/iPad/iPhone）、画面も全3枚確認済み。
- 証跡: `evidence/2026-09-09/report.html`。

### main反映後の本番検証（2026-09-09 21:29〜21:33 JST）

PR #107（`e1d27cc`）のCloudflare Pagesデプロイ完了後に実施した。

| 確認 | 結果 |
| --- | --- |
| FR-29 E2E（`https://reiwa.casa`、3ケース×PC/iPad/iPhone） | 9 passed / 0 failed |
| `/playwright-home/`・`/playwright-home-privacy/` | いずれも200、`<meta name="robots" content="noindex">` あり |
| `/`・`/about/`・`/profile/` | いずれも200、`robots` メタなし（非波及） |
| ヘッダーメニューのリンク | `/profile` と `/about` のみ。noindexの2ページは出ない |
| `sitemap-0.xml` | 17URL、`playwright-home` を含まない |
| `robots.txt` | `Allow: /` ＋ 本番Sitemap（staging値の混入なし） |
| Vitest（main） | 610 passed |

証跡: `evidence/2026-09-09/screenshots-production/`（9枚）、`app-info-results-production.json`。
2ページの公開URL・CMS編集・本文の相互リンクは維持されている。Googleへ登録するURLは変わらない。
