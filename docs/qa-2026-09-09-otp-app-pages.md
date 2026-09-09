# Gmail OAuth本番化用ページ（playwright-home #220）

## 要件確認

| 確認事項 | ユーザーの回答・決定 |
| --- | --- |
| OTP Gmail認証の復旧を進めるか | 「はいやって」。7日で失効する原因を是正する |
| 認証方式 | 「Gmail APIを本番モードへ変更」。IMAPやWorkspace移行は採用しない |
| 公開ドメイン | `reiwa.casa`。既存my-blogリポジトリのCloudflare Pagesで使用中、DNSもCloudflare |
| 公開説明の分量 | 「皆に見られるので超最小限の記載で」。紹介は用途の短文、ポリシーは必要なデータ取扱いだけに限定 |

## 実装判断

- FR-29として `/playwright-home/` と `/playwright-home/privacy/` を追加する。既存の同一ドメイン内のパスを使うためDNS変更は不要。
- 専用Markdownルートと既存 `Base.astro` を使う小さなラッパーを追加する。ブログ記事やCMS固定ページコレクションには加えず、記事一覧・RSS・ヘッダーナビの内容に混ぜない。
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
| `npm test`（Vitest） | 588 passed |
| `npm run build` | 成功。`dist/playwright-home/index.html` と `dist/playwright-home/privacy/index.html` を生成 |
| FR-29 E2E（`evidence/2026-09-09/verify-app-info.config.ts`） | 6 passed（2ページ×PC/iPad/iPhone） |
| `npm run test:e2e`（全体） | 442 passed / 8 skipped（定義450件）。既存テストの退行なし |

- `webServer.cwd` 修正後のE2Eをこの引き継ぎで実行し、合格を確認した。
- 証跡は `evidence/2026-09-09/screenshots/`（6枚）と `app-info-results.json`。赤枠は注釈で、合否は実クリック・Enter操作とaxeで判定する。
- 追加した2ページはヘッダーナビ・RSSに載らず、`sitemap-0.xml` にのみ載る（Googleから参照される公開ページのため）。

## Google側へ登録する予定値

| 項目 | 値 |
| --- | --- |
| ホームページ | `https://reiwa.casa/playwright-home/` |
| プライバシーポリシー | `https://reiwa.casa/playwright-home/privacy/` |
| 承認済みドメイン | `reiwa.casa` |

登録前にmain公開URLの応答と内容を確認する。Googleからドメイン所有権確認を要求された場合は、既存のSearch Console確認状態を調べてから必要な確認を進める。

参考：
- https://support.google.com/cloud/answer/13464323?hl=en
- https://support.google.com/cloud/answer/15549945?hl=en
- https://support.google.com/cloud/answer/15549049?hl=en

本番運用・認証情報の正本はplaywright-home。my-blogは公開説明ページのみを保管する。
