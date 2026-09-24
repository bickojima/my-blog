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
| 1.15 | 2026-02-21 | 固定ページ一覧に下書きバッジ表示追加（CMS-05更新）、固定ページデフォルトソートをorder昇順に設定（`{field: order, default_sort: asc}`）、config.ymlスキーマエラー検知E2Eテスト追加 |
| 1.16 | 2026-02-21 | CMS-16要件追加（固定ページデフォルトソート）、トレーサビリティマトリクス更新、システム変更履歴・テスト基盤変更履歴の欠落補完 |
| 1.17 | 2026-02-21 | 第三者セキュリティ診断に基づく修正: XSS脆弱性修正（callback.js escapeForScript、admin/index.html innerHTML排除）、postMessageオリジン検証、OAuthスコープ最小化（public_repo,read:user）、CDNバージョン固定、MutationObserver統合、var→const/let統一、セキュリティチェックリスト・品質向上策（4.7章）追加、バグ一覧No.18〜24追加、ドキュメント不整合修正（テスト件数・行数・章番号参照） |
| 1.18 | 2026-02-21 | セキュリティ要件を1.4.2章（SEC-01〜SEC-09）として独立、セキュリティ検証テスト追加（admin-html 9件、auth-functions 4件）、トレーサビリティマトリクス1.5.4章追加、4.7章を品質向上策・定期診断に再構成、TOC整備 |
| 1.19 | 2026-02-21 | 第2回ペネトレーションテスト実施: SEC-10〜SEC-13追加（HTTPセキュリティヘッダー、OAuth CSRF防止stateパラメータ、SRI、エラー情報漏洩防止）、_headers全面強化（CSP/X-Frame-Options/X-Content-Type-Options）、callback.js var→const修正・エラーメッセージ汎化、admin/index.html SRI属性追加 |
| 1.20 | 2026-02-21 | SEC-14〜SEC-20追加: HSTS preload対応、Cross-Origin Isolation(COOP/CORP)、DNS Prefetch防止、Permissions-Policy拡張(FLoC/Topics無効化)、情報漏洩防止(ファイル)、入力値バリデーション強化(order=-1バグ修正、3層バリデーション)、ファズテスト必須化(207テスト: XSS/SQLi/パストラバーサル/コマンドインジェクション/プロトタイプ汚染)。ビルドパイプライン再構成(build:raw+build=テスト必須)。バグNo.25-26追加。全477テスト |
| 1.21 | 2026-02-21 | iPhone記事保存失敗バグ修正（バグNo.27）: CDNスクリプト`</script>`閉じタグ欠落復元、管理画面セキュリティヘッダーオーバーライド追加（COOP: same-origin-allow-popups、X-Frame-Options: SAMEORIGIN、CSP frame-ancestors 'self'）。SEC-15要件を管理画面例外考慮に更新。再発防止テスト7件追加。全484テスト |
| 1.22 | 2026-02-21 | 機能観点の要件定義追加: FR-15〜FR-21（コンテンツCRUD、リッチテキスト編集、ライブプレビュー、メディアライブラリ、ビルドパイプライン、環境分離）、NFR-05（レスポンシブデザイン）。基本機能保護ルール（4.7.2章）策定。再発防止テスト追加。全491テスト |
| 1.23 | 2026-02-21 | バグNo.28修正: Cloudflare Pages `_headers`ヘッダー重複送信問題。`/*`と`/admin/*`で同名ヘッダーがAppendされブラウザが最厳格値を採用する問題を解消。COOP/CORP/X-Frame-Optionsを`/*`から削除し`/admin/*`のみに設定。ヘッダー重複検知テスト3件追加、既存ヘッダーテスト4件修正。全496テスト |
| 1.24 | 2026-02-21 | バグNo.29修正: CSP `connect-src`に`blob:`不足による画像付き記事保存失敗。Decap CMSは画像保存時に`fetch(blobURL)`を実行するため`connect-src`に`blob:`が必要。再発防止テスト2件追加。全498テスト |
| 1.25 | 2026-02-21 | E2E CRUDテスト追加（E-22〜E-24: 記事作成・編集・削除）、アクセシビリティテスト追加（E-25〜E-27: axe-core WCAG 2.1 AA検証）、NFR-06（アクセシビリティ）要件追加。色コントラスト比修正（#888→#595959、#999→#767676、#aaa→#767676、#ccc→#767676）、見出し階層修正（h3→h2）。E2E 291テスト、全498+291=789テスト |
| 1.26 | 2026-02-21 | CMS実操作E2Eテスト追加（E-28〜E-35: フォーム入力→保存→API検証、UIインタラクション、モバイル固有動作、削除ボタン状態変化）。OAuthモック＋GitHub APIモックをCMS E2Eテストの必須インフラとして規定。E2E 375テスト（367実行+8スキップ）、全498+367=865テスト |
| 1.27 | 2026-02-23 | 第三者セキュリティ・品質レビュー対応: SEC-21〜SEC-26追加（下書き静的生成防止、OAuthセキュリティヘッダー、公開ページCOOP/CORP、Zodスキーマ厳格化、ビルドスクリプト防御強化、OAuth HTTPメソッド制限）。Bug #30〜#34修正。テストWindows互換性修正（パスセパレータ・CRLF正規化）。全519+375=894テスト |
| 1.28 | 2026-02-23 | 個人情報保護対応: git履歴から個人情報を完全削除（filter-branch）、ローカルgit設定匿名化、pre-commit hookによる個人情報混入防止、CLAUDE.mdルール9追加。Bug #35追加 |
| 1.29 | 2026-02-23 | 動作確認エビデンス取得方針追加（4.9章）: CMS操作性検証（T01〜T16）、サイト操作性検証（S01〜S10）、赤枠アノテーション必須化、過去バグ由来の検証マトリクス（16件）を定義 |
| 1.30 | 2026-02-23 | CMS CRUD操作エビデンス追加（T17〜T32: 記事作成/編集/削除、画像アップロード、メディアライブラリ、タグ編集、下書き切替、固定ページCRUD）、セキュリティ検証エビデンス追加（SEC01〜SEC10: XSS/CSP/OAuth/CDN/postMessage/パストラバーサル）、継続的品質・セキュリティ改善フレームワーク（4.10章）追加 |
| 1.31 | 2026-02-24 | Bug #36修正: CMS CRUDエビデンス認証不具合（ログイン画面のみ表示問題）。verify-cms-crud.mjsにDecap CMS 3ステップOAuthハンドシェイク実装、Playwright context.route()によるポップアップインターセプト、GitHub APIモックLIFO順序修正。エビデンス48枚を正常な編集画面で再取得。CLAUDE.mdにエビデンス社内レビュー義務化（ルール11）・バグ修正ドキュメント反映義務化（バグフロー5）追加。4.9.8章にエビデンス収集認証方式の技術ノート追加 |
| 1.32 | 2026-02-24 | CMS-17追加（記事デフォルトソート日付降順）、CMS-18追加（記事月別グルーピング）。config.yml postsコレクションに`sortable_fields: {field: date, default_sort: desc}`と`view_groups`（年・年月パターン）を設定。E2Eテスト E-36追加（3デバイススクリーンショットエビデンス付き）。Vitestテスト3件追加（#48〜#50） |
| 1.33 | 2026-02-25 | CMS-19追加（グルーピング降順表示）。admin/index.htmlに`reverseViewGroups()`追加：Decap CMSのview_groupsがデフォルト昇順のため、GroupHeading要素のテキスト比較→DOM並べ替えで降順表示に変更。admin-htmlテスト1件追加 |
| 1.34 | 2026-02-26 | CMS-19拡張（年月グルーピングUI改善）。config.ymlから「年」グルーピング削除（年月のみに簡略化）。`activateDefaultGrouping()`（デフォルト自動有効化）・`formatGroupHeadings()`（日本語表記変換）・`createMonthSelector()`（年月選択プルダウン）追加。`reverseViewGroups()`を`getSortKey()`で日本語形式対応に修正 |
| 1.35 | 2026-05-22 | Modern Web Guidance準拠対応（staging先行反映）: Google公式ガイドに基づき、トップページ先頭サムネイルのLCP優先度制御（`fetchpriority="high"` + 非lazy）、記事カードのコンテナクエリ、ナビゲーションの`aria-expanded`同期、CMS独自プレビュースタイルのコントラスト改善を追加。QA履歴、準拠方針、非準拠許容、NFR-07、トレーサビリティを追加 |
| 1.36 | 2026-05-22 | 基本設計（2.2章）にGoogle Modern Web Guidanceスキル準拠方針を明記。CLAUDE.mdにstaging先行、過去E2Eエビデンス手法、OAuth/GitHub APIモック利用を今後のルールとして追加 |
| 1.37 | 2026-05-22 | Bug #37修正: CMS-19の年月選択プルダウンがフィルターではなくスクロール動作になっていた問題を修正。CMS-19要件を「選択年月のみ表示」に明確化し、`createMonthSelector()`に`applyMonthFilter()`を追加。admin-html再発防止テスト更新 |
| 1.38 | 2026-05-24 | Bug #38修正: CMS-19年月フィルター操作時に管理画面がハングアップする問題を修正。`createMonthSelector()`でネイティブselect操作中にoptionを再構築しないよう、`optionsSignature`で見出し変更時のみ再生成する方式に変更。E2Eにselect操作中のMutationObserver再実行耐性検証を追加 |
| 1.39 | 2026-05-24 | プロジェクト方針追加: ドキュメント更新をコード変更の完了条件化、ユーザー実操作E2E確認をUI変更時の必須条件化。Modern Web Guidance横展開として、ナビゲーション/アーカイブのARIAラベル、focus-visible、記事一覧の`content-visibility`、記事・アーカイブの`text-wrap`を追加 |
| 1.40 | 2026-05-25 | Bug #39修正: CMS管理画面モバイルタップ領域不足（WCAG 2.5.5）。「新規作成」「ソート」等のボタンがiPad/iPhoneで44px未満。`@media (max-width: 899px)`を新設し全対象ボタンにmin-height/min-width: 44pxを適用。verify-comprehensive.mjs 150/150 PASSを確認 |
| 1.41 | 2026-05-25 | 探索的E2Eテスト追加: `tests/e2e/cms-exploratory.spec.ts`新規作成（E-37, E-39〜E-43: 月別セレクタ実操作・固定ページ作成画面・エラーハンドリング・下書きバッジ・グルーピング再適用・コンソールエラー監視）。36テスト（12×3デバイス）全PASS確認。E2Eテスト総数423件（415実行+8スキップ）に更新 |
| 1.42 | 2026-05-25 | テスト知見の文書化: TEST-REPORT.md 4.1.8章「包括的エビデンス検証スクリプト（verify-comprehensive.mjs）の方式」追加（雛形ファイル・認証方式・シナリオ番号体系・赤枠アノテーション・HTMLレポート・新シナリオ追加手順を記載）。E-34タップ領域skip条件を799px→899pxに修正（Bug #39対応）、ToolbarButtonを899px CSSブロックに追加。E2Eテスト423件（416実行+7スキップ）に更新 |
| 1.43 | 2026-05-30 | 基本設計（2.2.3章）にGoogle Modern Web Guidanceの導入手順として`npx modern-web-guidance@latest install`を明記 |
| 1.44 | 2026-06-11 | Modern Web Guidance遵守レビューF-1〜F-10対応（Bug #40）: 実測に基づき`content-visibility`を7枚目以降へ限定、ナビEscape/フォーカス離脱対応、公開サイト/CMSタップ領域44px化、CMSセレクターa11y、本文リンク識別、コードブロックtabindex、サムネイル寸法属性、lang/ARIA修正。Vitest 562件、E2E 432件へ更新 |
| 1.45 | 2026-07-04 | ドキュメント整理: 2.1.1章ディレクトリ構成を最新化（E2E 7ファイル、content/pages・docs/・evidence/・README.md追記）。コード変更なし |
| 1.46 | 2026-07-04 | 個人ブログ化ロードマップ（issue #81〜#89）の要件ID追加: FR-22〜FR-28（site/canonical, OGP, RSS, サイトマップ, タグ一覧, 前後記事ナビ, ページネーション）、NFR-08（ダークモード対応）を1.2章・1.4章に追加し、1.5章トレーサビリティマトリクスを更新。Bug #41（staging robots.txtの`Allow: /`＋誤ドメイン混入）・Bug #42（ページネーション`/page/1/`重複コンテンツ）を4.5章に追記。RSS下書き除外・タグ件数・実操作E2Eを含むVitest 585件、E2E 444件へ更新 |
| 1.47 | 2026-07-05 | Bug #43（ダークモード配色刷新によるライトモード本文リンクのコントラスト比不足、WCAG AA未達）を4.5章に追記。`--color-link`/`--color-focus`のライトモード値を修正し、CSSカスタムプロパティの実値からコントラスト比を計算する回帰テストを追加（パターンマッチのみだった既存テストの検知漏れを解消）。Vitest 586件へ更新 |
| 1.48 | 2026-07-05 | Bug #44（E-36テストのスクリーンショット出力先が`evidence/2026-02-24/`に過去日付固定され、`npm run test:e2e`実行の度に過去エビデンスが上書きされていた）を4.5章に追記。tests/e2e/cms-operations.spec.tsの3箇所を`test-results/`（gitignore対象）配下への出力に修正。テスト件数増減なし |
| 1.49 | 2026-08-09 | staging → main マージ（本番反映）: Modern Web Guidance対応（F-1〜F-10）、個人ブログ化ロードマップ（FR-22〜FR-28, NFR-08）、ダークモード、Bug #41〜#44対応をmainへ反映。マージ時に`astro.config.mjs`の`SITE_URL`をmain値（`https://reiwa.casa`）へ切替。Bug #45（Bug #41再発防止テストのブランチ非対応によりmainの正しいrobots.txt設定でテストが失敗し、本番robots.txtがstaging値のまま放置されていた問題）を4.5章に追記 |
| 1.50 | 2026-08-11 | Issue #97の必須残作業を完了。リリースブランチ削除、CI/Cloudflare Pages、本番SEOリソース・ダークモード、CMS含む全444件E2E、認証後CMS証跡を確認。Bug #46（Vitest探索範囲逸脱）・Bug #47（E-28並列負荷タイムアウト）を修正し、Vitest 588件へ更新 |
| 1.51 | 2026-08-11 | Issue #97の最終反映実績を追記。staging PR #98、main PR #99、GitHub Actions・Cloudflare Pagesの成功、本番27/27・認証済みCMS 3/3のデプロイ後再確認、Issue #97のcompletedクローズを記録 |
| 1.52 | 2026-09-07 | Modern Web Guidance 日本語索引（`docs/MODERN-WEB-GUIDANCE.md`）を新規作成し、ドキュメント体系へ追加。全139ガイド（+npm未公開2本）の1行要約、人間向け閲覧手順（公式ドキュメント／GitHub／`retrieve`・`search` CLI）、本ブログの適用実績7項目と検討候補、索引の更新手順を整理。2.2.3章から索引へ導線を追加。コード変更なし |
| 1.53 | 2026-09-09 | FR-29追加。個人用Gmailアプリの紹介・プライバシーポリシーを固定ページコレクションへ追加し、CMSで編集できるようにした。固定ページに`noindex`項目を新設し、sitemap除外と合わせて検索結果から外す。Vitest 588→610件。CMS保存時のフロントマター欠落を防ぐ検証を追加。staging先行 |
| 1.54 | 2026-09-09 | FR-29追加QA: noindex固定ページをヘッダーナビから除外。ビルド検証を更新し、実メニュー操作E2Eを3件追加（453定義） |
| 1.55 | 2026-09-20 | セキュリティIssue #109〜#113対応（敵対的レビュー反映）: SEC-27（OAuth送信先オリジン許可リスト検証）、SEC-28（公開ページCSPメタタグ導入）追加。SEC-22（OAuth開始・エラー時Cache-Control適用拡大）、SEC-25（normalize-images.mjs回転後再取得時ピクセル上限適用整合性）更新。sharp ^0.35.4更新、npm audit fix実施。Vitest 610→622件（全622テストPASS） |
| 1.56 | 2026-09-20 | セキュリティ監査run-2対応（Issue #114, #115, #117項目4/項目11）: SEC-29（下書き記事のurl-map.json混入防止＋gray-matterエンジン明示、Bug #48）、SEC-30（`/*`・`/admin/*`ヘッダー重複排除、Bug #49）、SEC-31（OAuthハンドシェイクのメッセージリスナー堅牢化）、SEC-32（画像正規化処理のtry/catch保護＋出力バッファ上限）を追加。1.5.4章トレーサビリティにSEC-29〜32を追記（SEC-31・SEC-32は実装済みだが自動回帰テスト未実装のためフォローアップ要として明記）。4.5章にBug #48・#49を5 Whysとともに追記し、Bug #48関連の既知の制限事項（下書き記事のアップロード画像自体は公開される仕様上の制限）を4.5.1章に追記。**改訂履歴の訂正**: 1.55の「Vitest 610→622件（全622テストPASS）」は、その後のコミット`38205a0`による`_headers`変更（`/admin/*`からのCOOP/CORP/X-Frame-Options削除）で前提が変わり、既存テスト8件（build.test.mjs 2件、fuzz-validation.test.mjs 6件）が実際にFAILする状態になっていた。加えてfuzz-validation.test.mjsの重複検証テスト1件はガード条件（`if (globalVal && adminVal)`）によりFAILはしないものの何も検証しない空のテストになっていた（テスト名は「同一値の重複は安全」という旧設計の主張のまま）。本改訂でFAILしていた8件を新設計（`/admin/*`では再定義せず`/*`から継承）に合わせて書き換え、空のテスト1件もガード条件を撤廃し実効的な検証（3ヘッダーが`/admin/*`に存在せず`/*`に管理画面の必要値で存在すること）へ書き換えた。本改訂時点の実測値はVitest 624件全PASS |
| 1.57 | 2026-09-20 | 未使用 production 依存 `decap-cms-app` を削除（Issue #117 項目13）。ソースからの import/require は無し。当時の CMS 実行体は CDN の `decap-cms@3.10.0`。`npm audit` 31件（low 1 / moderate 21 / high 8 / critical 1）→ 3件（low 1 / high 1 / critical 1）。残件は astro 5.18.2 由来。Vitest 624件全PASS |
| 1.58 | 2026-09-20 | Astro 5.18.2（宣言 `^5.17.1`）を 7.3.3 へメジャーアップ（Issue #117）。Content Layer の `glob` loader へ移行し、`page.slug` / `entry.render()` を `page.id` / `render(entry)` に置換。rehype プラグイン維持のため `@astrojs/markdown-remark` の `unified()` を採用。CI と Cloudflare Pages 向けに Node 22.12.0（`.nvmrc`、workflow `node-version: '22'`）。`npm audit` 3件 → 0件。Vitest 624件全PASS。サイト系 E2E（PC）`site.spec.ts` 37 PASS / 1 skip、`app-info.spec.ts` 3 PASS |
| 1.59 | 2026-09-20 | 本番CMS CDNを Decap CMS `3.10.0` から `3.16.2` へ更新（SEC-03 バージョン固定、SEC-12 SRI再計算）。`public/admin/index.html` の unpkg URL と SHA-384 integrity を差し替え。3.16.2 dist に `.wasm` があるが、メインバンドルに `.wasm` ファイル名は無く `media_processing.enabled` 時のみ遅延読み込み。本サイトの `config.yml` では未使用のため `/admin/*` CSP は変更しない（COOP/CORP/XFO の再定義も行わない）。カスタマイズが依存する Emotion ラベル（`EditorControlBar` / `GroupHeading` / `DropdownList` 等）は 3.16.2 バンドルに残存することを確認。要件ID新設なし |
| 1.60 | 2026-09-20 | SEC-31/SEC-32 の自動回帰テストを追加。`auth-functions.test.mjs` に4件（`{ once: true }` 不使用、ack 完全一致、両検証通過後の `removeEventListener`、30秒フェイルセーフ）、`build.test.mjs` に3件（sharp の try/catch 継続、`buffer.length` の MAX_FILE_SIZE 上限、lstat 失敗保護）。1.5.4章の SEC-31/32 を充足に更新し未テスト例外を解消。Vitest 624→**631**件（全PASS、`npx vitest run` 実測） |
| 1.61 | 2026-09-20 | 4.7章・4.10.2章の要件範囲表記を SEC-01〜SEC-28 から SEC-01〜SEC-32 へ更新（現行定義との不一致を解消） |
| 1.62 | 2026-09-20 | staging → main 本番反映（PR #118 を staging へマージ後）。ゲート5（staging CMS 実ログイン）・ゲート6（`/admin/` の COOP/CORP/XFO 重複解消を curl 実測）を確認してから main へマージ。`config.yml` は `branch: main` / `base_url: https://reiwa.casa`、`SITE_URL` は `https://reiwa.casa`、`robots.txt` は `Allow: /` + Sitemap を維持 |
| 1.63 | 2026-09-20 | Bug #50: 本番マージを Vitest（CI含む）と staging 実ログインだけで完了し、ローカル E2E 全件を後回しにしたプロセス不備。4.6章の「E2E は可能な場合」を廃止し、ローカル `npm run test:e2e` 全件と `verify-comprehensive.mjs` を main マージ必須条件に変更。**CI に Playwright は載せない**（実行時間のためローカル運用継続）。雛形はシナリオ FAIL で非ゼロ終了。再発防止は手順文書の固定＋Vitest 4件。Vitest 631→**635**件 |
| 1.64 | 2026-09-20 | Issue #117 項目2/12: SEC-33（CI `permissions: contents: read`）、SEC-34（無効な `public/.assetsignore` 削除）。Vitest 635→**638**件 |
| 1.65 | 2026-09-21 | Bug #51: PR #119 のマージで staging の環境固有ファイル（config.ymlのbranch/base_url、astro.config.mjsのSITE_URL、robots.txt）が丸ごとmain値へ上書きされ、staging CMSが本番mainへ直接コミットする状態が約21分間発生していた問題を4.5章に5 Whysとともに追記（復旧コミット `0a6c762`）。SEC-35（環境固有ファイルの実ブランチ整合性検証）を1.4.2章に追加し、1.5章トレーサビリティマトリクスに反映。cms-config.test.mjsに、実際にチェックアウトしているブランチ（`CF_PAGES_BRANCH` > `GITHUB_REF_NAME` > `git rev-parse`で判定）に対して4項目が正しい値かを検証する回帰テストを追加（main/staging以外は内部整合のみ検証）。SEC-35はブランチ別にテストを登録する設計のため、Vitest合計は**featureブランチ639件／main・staging642件**になる（登録数の差3件はテストの欠落ではなくSEC-35の設計）。4.6.2章のマージ確認観点に自動検証の項目を追加 |
| 1.66 | 2026-09-23 | Issue #129: verify-security.mjsの守備範囲を4.9.8章のSEC01〜SEC10のエビデンス確認に限定し、SEC-01〜SEC-35全体の検査器との誤認を解消。全要件の検証責務は1.5.4章を正本とし、SEC-33〜35をbuild/cms-configのVitestへ対応づける |
| 1.67 | 2026-09-23 | Issue #117 hardening 項目の全件判定（判定表: `docs/security/issue-117-hardening-decisions.md`）。**Bug #52**（SEC-29 の実装不備: gray-matter は `language: 'yaml'` 指定時も `---js` の言語宣言を優先し javascript エンジン＝eval が動く。Issue #117 項目1の「完了」判定は誤りだった。organize-posts に加え、`npm run build` が organize-posts より先に実行する Vitest（と E2E）のテストも同じ経路だった）を4.5章に5 Whysとともに追記し、`scripts/lib/safe-frontmatter.mjs` で YAML 以外のエンジンを拒否、`src/content` を読む全テストもラッパー経由に置換。SEC-36（Actions の commit SHA 固定、項目3）、SEC-37（OAuth オリジン許可リストの単一化 `functions/_shared/allowed-origin.js`、項目5）、SEC-38（OAuth コールバック応答の CSP 自己完結＋charset 明示、項目9）、SEC-39（`<script>` 埋め込み値の JSON.stringify リテラル化、項目10）を1.4.2章・1.5.4章に追加。項目6・7・8・14は対応不要（根拠・残余リスクは判定表）、項目15は #127 へ移管。2.4.5章・2.4.6章・3.2.3章を更新。Vitest featureブランチ 639→**668**件／main・staging 642→**671**件 |
| 1.68 | 2026-09-23 | Issue #128: Cloudflare Pages のビルドコマンドが `npm run build` であることを 2026-09-23 にダッシュボードで確認した。Vitest が失敗すると `astro build` まで進まずデプロイされない（テストゲート）ことも確認した。この内容を2.5.1章に明記した。あわせて、`build:raw` を「Cloudflare Pages用」としていた誤記を訂正した（実際の用途は build.test.mjs の内部と CI）。build.test.mjs がゲート対象外で CI でのみ実行されるという残余リスクと、SEC-35 が `CF_PAGES_BRANCH` により Pages 上の最終防壁になることも記載した。ローカル実証のエビデンスは `evidence/2026-09-23/issue128/` にある |
| 1.69 | 2026-09-23 | Issue #132: npm管理外依存（CDN の Decap CMS、GitHub Actions、Node.js 宣言、Cloudflare Pages ビルド環境）の棚卸し・鮮度・EOL・SRI を週次で機械判定する SEC-40 を追加。`scripts/check-dependency-freshness.mjs`（結果 JSON / Markdown、ok・warning・alert・error）、`.github/workflows/dependency-freshness.yml`（週次、alert で Issue 起票＋ジョブ失敗）、`.github/dependabot.yml`（github-actions を staging 向け週次更新。SEC-36 の SHA 固定と版コメントを同時更新）を追加し、4.11章に棚卸し表・判定ルール・通知経路・Decap 更新/SRI 再計算/E2E 手順・Dependabot との分担・四半期の手動確認を記載。Cloudflare Pages の手動確認（2026-09-23、ビルドイメージと NODE_VERSION は未確認）を記録。Vitest feature 668→**695**件／main・staging 671→**698**件 |
| 1.70 | 2026-09-23 | Issue #127: 環境固有の4項目（`astro.config.mjs` の SITE_URL、`public/admin/config.yml` の backend.branch / base_url、`public/robots.txt`）をファイルから削除し、ビルド時（`CF_PAGES_BRANCH`）・実行時（`location.hostname` / `origin`）に導出する構造へ変更（ユーザー決定「環境値の自動導出」方式）。導出点は `src/lib/site-env.mjs`（SITE_URL・robots、`src/pages/robots.txt.ts` で生成）と `public/admin/cms-env.js`（CMS の branch・base_url。admin/index.html が `CMS_MANUAL_INIT` + `CMS.init` で deepmerge）。安全側の既定: 本番値は `CF_PAGES_BRANCH === 'main'`／ホスト名 `reiwa.casa` 完全一致のときだけ、それ以外は staging 値。main と staging の環境差分はゼロになり、Bug #51 の構造的原因を解消。SEC-35 を「導出結果の正しさ」の検証へ改訂し、SEC-127A（仮ID・マージ時採番調整）を1.4.2章・1.5.4章に追加。2.1.1・2.5.4・3.3.2・4.3.1・4.6（マージ手順・環境別値・main 移行手順 4.6.5・本番読み取り確認 4.6.6）・4.7.2・4.9.9・4.10.3章を更新。Bug #P127-1（仮番号: iPhone エミュレーションで「公開」メニューが表示領域外。変更前から発生・未修正）を4.5章に記録。Bug #P127-2（仮番号: CMS 系 E2E spec が base_url とのオリジン差で未認証のまま実行され、弱い分岐で PASS していた。本変更で認証が成立し E-39 の失敗で発覚。E-39 を書き換え）を4.5章に記録。Vitest 695件（feature）／698件（main・staging）→ **全ブランチ共通 751件**（ブランチ別登録を廃止）、E2E 453→**465件**（`cms-env-branch.spec.ts` 4ホスト×3デバイス） |
| 1.71 | 2026-09-23 | Issue #130: Cloudflare Insights beacon を `/admin/*` のCSPで遮断し、検証した操作中に他のCSP違反・機能エラーがないことを確認する SEC-41 を追加.`_headers` のCSPポリシーは維持し、遮断方針コメントと実操作回帰テストを追加。production/staging 実ホストでOAuth・GitHub APIをモックし実書込を遮断した上で、PC/iPad/iPhoneの編集・入力・preview・保存要求branchを検証（54/54 PASS: production/stagingの操作各3端末、ローカルPC操作、実ホストreadonly。非Insights CSP違反0、機能エラー0）。Vitest 754件、E2E 465件。証跡 `evidence/2026-09-23/issue130-review/` |
| 1.72 | 2026-09-24 | 4.6.1章に「リリース経路の原則」を追記: リリースは staging のマージでのみ行い、main 直コミット・staging 未経由の main 向け PR を禁止。Issue #127 以降 main と staging はツリー完全一致が正。PR #144（`c91eb81`）・#145 の main 直行と Dependabot #140/#141 の staging 残留による双方向のずれを同期 PR で解消した経緯を記録。4.6.3章に同期後のツリー一致確認を追記。テスト件数変更なし |
| 1.73 | 2026-09-24 | #90/#131 履歴移行計画と証跡アーカイブを4.2.6章に追加。公開索引のスキーマ、SHA-256復元確認、バックアップbundle、PR refsの制約と残余リスクを記録。`.gitignore` に画像・動画・PDF・trace・ZIP・report.html/work-completion-report.html を追加し、必須HTMLレポートはDrive正本としてreadback SHA-256検証後に索引へ登録、JSONと検証scriptはGit保持する運用を明記。
| 1.74 | 2026-09-24 | #90/#131 の25 heads履歴更新を実施。old-OID lease付きatomic push、143/143 refs一致、main/staging CIとfresh clone fsck成功、Cloudflare production/stagingのread-only確認を記録。118 read-only PR refsは残存し、完全消去とは扱わない。TEST-REPORT 4.3.6 と履歴監査文書を更新。
| 1.75 | 2026-09-24 | CLAUDE.md・TEST-REPORT.mdに残っていた旧エビデンス保存記述（`report.html`/`work-completion-report.html`をコミット・プッシュする前提の記述）を4.2.6章のDrive正本方針に統一。4.9.2章のエビデンス構成表と4.10.3章のフォルダ構成図にGit保持対象／Drive正本対象の区別を明記。2026-09-24の履歴書換え時点で既にGit管理下にあった14件（`work-completion-report.html` 13件、`report.html` 1件）は`evidence/archive-index.json`で`storage_class: "git"`登録済みの例外として当面Gitに残す方針を明文化（新規作成分はDrive正本を適用）。テスト件数変更なし。 |
| 1.76 | 2026-09-24 | Issue #152 の再発防止として SEC-42 を追加。main/staging に入る新規コミットの author/committer を PR 差分・push 差分で検査し、force-push と before SHA 不在時は新HEAD全履歴を検査する。PRはマージ前に検査されるが、main/stagingのブランチ保護は未設定のため直接pushは受理後のCI検知となる。履歴修復force-push完了後にrequired status checks等のブランチ保護を別Issueで検討する。Dependabot botの許可identityと、拒否値をログへ出さない挙動を含む。

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
| 2026-02-21 | **固定ページ一覧改善・品質向上**: 下書きバッジ表示追加（CMS-05）、デフォルトソートをorder昇順に設定（CMS-16）、config.ymlスキーマエラー検知E2Eテスト追加、要件トレーサビリティ検証テスト追加。計247 Vitest + 240 E2E = 487テスト | - |

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
4.7. [品質向上策・基本機能保護・定期セキュリティ診断](#47-品質向上策基本機能保護定期セキュリティ診断)
4.8. [個人情報保護](#48-個人情報保護)
4.9. [動作確認エビデンス取得](#49-動作確認エビデンス取得)
4.10. [継続的品質・セキュリティ改善フレームワーク](#410-継続的品質セキュリティ改善フレームワーク)
4.11. [npm管理外依存の鮮度・EOL管理](#411-npm管理外依存の鮮度eol管理)

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

### 1.1.4 要件確認QA履歴

| No | 質問 | 回答 | 確認結果 |
| :--- | :--- | :--- | :--- |
| Q1 | 今回やりたい作業内容は何か | Modern Web Guidance準拠 | 確認済み |
| Q2 | myblogのローカルリポジトリはどこか | `https://github.com/bickojima/my-blog` | 確認済み |
| Q3 | E2E確認とスクリーンショット保存は必要か | 実際のスクリーンショットをエビデンス保存する。CMS画面も認証モックで擬似ログインして確認する | 確認済み |
| Q4 | リスクが高い項目は非準拠として残す方針でよいか | リスクが高い項目は非準拠とする | 確認済み |
| Q5 | Decap CMS本体UIのModern Web Guidance全面適用は対象外でよいか | Decap CMS本体は引用元レポジトリのままでよい。独自実装を準拠対象とする | 確認済み |
| Q6 | 準拠対象は独自実装部に限定してよいか | 独自実装部を対象とする | 確認済み |
| Q7 | 明確な主要画像だけ高優先度化し、判断できない本文画像は遅延読み込みのままでよいか | OK | 確認済み |
| Q8 | E2Eスクリーンショットの保存対象は、公開サイトをPC/iPad/iPhone相当、CMS独自カスタマイズ画面を認証モックでPC/iPhone相当まで確認する方針でよいか | OK | 確認済み |
| Q9 | スクリーンショット保存先は`test-results/evidence/modern-web-guidance/`配下でよいか | OK | 確認済み |
| Q10 | 要件定義を本書にQA表として残し、実装・テスト・エビデンス保存まで進めてよいか | OK。GoogleのModern Web Guidanceスキル準拠を方針として記載する | 確認済み |
| Q11 | UI変更では実際の操作をしてのE2E動作確認を必須とする方針でよいか | 工数がかかってよいので、実際の操作してのE2E動作確認は必須というプロジェクト方針にする | 確認済み |
| Q12 | 変更時のドキュメント更新を必須プロジェクト方針にしてよいか | ドキュメント修正は必ずする方針で、プロジェクト方針とする | 確認済み |
| Q13 | Modern Web Guidanceに準拠できる箇所を横展開してよいか | 工数がかかってよいので横展開する | 確認済み |
| Q14 | 基本設計書にModern Web Guidanceの導入コマンドを明記してよいか | `npx modern-web-guidance@latest install`で導入することを追記する | 確認済み |
| Q15 | staging同期時にローカル未コミット変更がある場合の扱いはどうするか | 既存変更を保持したまま作業し、競合して進められない場合のみ報告する | 確認済み |
| Q16 | 2026-06-11レビュー修正の対象範囲はF-1〜F-10のみとし、F-11・F-12およびDecap CMS本体のaxe違反を対象外としてよいか | 指定範囲のみ実装する | 確認済み |
| Q17 | F-2は既存挙動を優先し、Popover APIと両立困難な場合は現行実装へEscape・focusoutを追加してよいか | 現行実装へのキーボード対応追加を許容する | 確認済み |
| Q18 | F-1の`content-visibility`は全デバイスで余裕を持たせて4枚目以降へ適用してよいか | 4枚目以降を初期案とし、実機相当検証で初期表示内ならさらに後ろへ調整する | 確認済み |
| Q19 | F-3の44pxタップ領域はタッチ入力環境を基本にし、必要に応じて幅条件を併用してよいか | `hover: none`または`pointer: coarse`を基本に44pxを確保する | 確認済み |
| Q20 | 要件IDは既存IDを優先し、不足時のみ既存採番規則で追加してよいか | 既存IDを再利用し、必要な場合だけ新規追加する | 確認済み |
| Q21 | 全テスト・実操作E2E・3デバイスと認証後CMSのエビデンスが成功した場合、指定authorでコミットしstagingへプッシュしてよいか | `tbi <noreply@users.noreply.github.com>`でコミットしstagingへプッシュする | 確認済み |
| Q22 | Issue #97の対象に任意項目F-11（レスポンシブ画像）も含めるか | F-11は対象外とし、Issue #97の必須残作業のみを完遂する。検証結果とQA履歴を含む関連ドキュメントも更新する | 確認済み（2026-08-11） |
| Q23 | 本番マージ前の E2E を CI 必須にするか | しない。ローカル全件必須のまま。CI は Vitest + ビルドのみ。**CI に Playwright は載せない**（Bug #50） | 確認済み（2026-09-20） |
| Q24 | Issue #117 の残り hardening のうち 2 と 12 だけ実装してよいか | よい。2 は CI `contents: read`、12 は無効な `.assetsignore` 削除。他項目はやらない。GO なら本番反映 | 確認済み（2026-09-20） |

**Issue #97 残作業の完了条件（2026-08-11）:**

| ID | 要件 | 完了判定 |
| :--- | :--- | :--- |
| REL-97-01 | マージ済み一時ブランチ`release/2026-08-09-main`を削除する | GitHub上で対象ブランチが存在しない |
| REL-97-02 | mainコミット`6a320bd`のCI・Cloudflare Pagesデプロイ結果を確認する | `test-and-build`とCloudflare Pagesの成功を記録する |
| REL-97-03 | 本番のrobots.txt、サイトマップ、RSS、タグ一覧、canonical/OG URL、ダークモードを実地確認する | 全項目が期待値を満たし、3デバイスの証跡を保存する |
| REL-97-04 | CMSを含むPlaywright E2Eをネットワーク到達可能な環境で実行する | 444テスト中436 PASS・8 skip、認証後CMS画面の証跡を保存する |
| REL-97-05 | エビデンスを社内レビューし、レポート・完了報告・関連ドキュメントを更新する | 不備がなく、検証結果と判断理由を追跡できる |
| REL-97-06 | staging先行反映後にmainへ本番反映し、無影響確認を行ってIssue #97をクローズする | mainのデプロイ成功・本番再確認・Issueクローズを確認する |

F-11（レスポンシブ画像）は新規機能開発に当たり、今回の残作業には含めない。

**Issue #97 反映実績（2026-08-11）:**

| 工程 | 実績 |
| :--- | :--- |
| staging先行反映 | PR #98をマージ。merge SHA `3c95c2337d0faaf1980e6f88dfd1da1413230947`、`test-and-build` success。`https://staging.reiwa.casa/`、`robots.txt`、`admin/config.yml`を実地確認し、HTTP 200・`Disallow: /`・`branch: staging`・staging `base_url`を確認 |
| main本番反映 | PR #99をマージ。merge SHA `f47d5f81c1a313c97232d9a41b5f66505ec2c940`、`test-and-build` check `93721464330` success、Cloudflare Pages check `93721691730` success、preview `https://d30b5fc7.my-blog-3cg.pages.dev` |
| デプロイ後確認 | 本番27/27 PASS、axe違反0件、コンソールエラー0件。認証済みCMSはPC・iPad・iPhoneの3/3 PASSで、各端末12記事・ログイン画面なしを確認 |
| 完了処理 | GitHub Issue #97へ結果を記録し、state reason `completed`でクローズ |

### 1.1.5 Modern Web Guidance準拠方針

Google公式Modern Web Guidanceスキル準拠を方針とし、公開サイトおよびCMSの独自実装部に対して、Baseline対応済みのモダンWeb機能をプログレッシブエンハンスメントとして採用する。対象はAstroの`src/layouts`、`src/pages`、`src/components`、独自rehype plugin、および`public/admin/index.html`内の独自カスタマイズに限定する。今回の反映先はstagingのみとする。

Decap CMS本体UIは外部プロダクト由来のコードとして扱い、引用元レポジトリの実装を尊重する。過去にCMS保存・OAuth・プレビュー周りの不具合が発生しているため、本体UIの全面的な上書きはリスクが高い項目として非準拠許容に分類する。

| 対象 | 方針 | 理由 |
| :--- | :--- | :--- |
| 公開サイトの独自UI | 準拠対象 | 影響範囲を把握でき、E2Eで確認可能 |
| CMS独自カスタマイズ | 準拠対象 | 既存の保存・認証互換性を壊さない範囲で改善可能 |
| Decap CMS本体UI | 対象外 | 外部プロダクト由来であり、深い上書きは保存・OAuth・プレビューの再発リスクが高い |
| 記事本文画像の一律LCP高優先度化 | 非準拠許容 | Markdown本文では全記事のLCP画像を安全に自動判定できず、誤った高優先度化で通信競合を起こす可能性がある |

---

### 1.1.5 個人用アプリ案内の追加（2026-09-09）

[要件確認QA・判断経緯](qa-2026-09-09-otp-app-pages.md)。ユーザー指定の既存ドメインを利用し、公開文面は最小限とする。専用レイアウトは作らず、**既存の固定ページコレクションに載せてCMSから編集できるようにする**（当初は専用ルート＋専用レイアウトで実装したが、CMSで管理できない・サイトから浮くという指摘を受けて作り直した）。Gmail認証やバックエンド処理は追加しない。Googleへの登録はmain公開後に行う。

ヘッダーナビは `draft` と `noindex` の固定ページを除外して生成する（2026-09-09追加QA）。公開ルート・CMS編集・本文リンクは維持する。

検索流入を想定しないため、固定ページのfrontmatter `noindex: true` で `Base.astro` の `noindex` プロパティを立て、`astro.config.mjs` の sitemap `filter` と合わせて検索結果から外す。Google側の要件は「公開アクセスできること」であり、`noindex` は登録の妨げにならない。プライバシーポリシー本文はデータの取得・利用・共有・保存を具体的に書く必要があるため、ぼかさない。

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
| FR-15 | コンテンツ保存・公開: CMSで編集した記事・固定ページがGitHubリポジトリにコミットされ、自動ビルド・デプロイがトリガーされる | `config.yml` backend, `functions/auth/`, `_headers` | Decap CMS GitHub backend + OAuth |
| FR-16 | コンテンツ削除: CMSから記事・固定ページを削除でき、リポジトリから該当ファイルが除去される | `config.yml` create: true, Decap CMS | GitHub API経由のファイル削除 |
| FR-17 | リッチテキスト編集: マークダウンエディタで書式設定・画像挿入・リンク・コードブロック等の操作ができる | `config.yml` body widget: markdown | Decap CMS Slate-based editor |
| FR-18 | ライブプレビュー: CMSエディタでリアルタイムプレビューが本番サイト相当のスタイルで表示される | `admin/index.html` CMS.registerPreviewStyle() | Decap CMS split-pane preview |
| FR-19 | メディアライブラリ: アップロード済み画像の一覧表示・選択挿入・削除ができる | `config.yml` media_folder, `admin/index.html` CSS | Decap CMS media library |
| FR-20 | ビルドパイプライン: 4段階の自動ビルド（EXIF正規化→記事整理→Astroビルド→画像最適化）が正常実行される | `package.json`, `scripts/`, `integrations/` | prebuild + build + postbuild |
| FR-21 | 環境分離: staging/production環境が独立した設定で動作し、テスト環境で[STAGING]ラベルが表示される | `config.yml`, `Base.astro`, `admin/index.html` | ブランチごとの設定管理 |
| FR-22 | サイト設定・canonical URL: 全ページに正規URL（canonical）が出力される | `astro.config.mjs`, `Base.astro` | `site`設定 + `Astro.url`ベースの絶対URL生成 |
| FR-23 | OGP・meta description: SNS共有時にタイトル・説明・画像がプレビュー表示される | `Base.astro`, 各ページテンプレート | og:title/description/type/url/image, twitter:card |
| FR-24 | RSSフィード配信: 公開記事の更新をRSSリーダーで購読できる | `src/pages/rss.xml.js`, `Base.astro` | `@astrojs/rss`、draft記事は除外、autodiscoveryリンク付き |
| FR-25 | XMLサイトマップ生成: 検索エンジンにページ一覧を通知する | `astro.config.mjs` | `@astrojs/sitemap`、`/admin/`配下を除外 |
| FR-26 | タグ一覧ページ: 全タグを件数付きで一覧できる | `src/pages/tags/index.astro` | 件数降順、draft記事のみのタグは非表示 |
| FR-27 | 記事の前後ナビゲーション: 記事詳細から時系列で前後の記事に遷移できる | `src/pages/posts/[year]/[month]/[slug].astro` | date降順配列から前後記事を算出、draft記事は対象外 |
| FR-28 | 記事一覧のページネーション: 記事数が1ページの表示件数を超えた場合にページ分割される | `src/pages/page/[page].astro`, `src/components/Pagination.astro` | 1ページ目は`/`が担い、`/page/2`以降で分割（重複コンテンツ防止のため`/page/1`は生成しない） |
| FR-29 | 検索除外の固定ページ: `noindex` を指定すると、`robots`メタとsitemap除外で検索結果から外れ、ヘッダーナビにも表示しない | `src/content/pages/`, `src/content.config.ts`, `src/pages/[slug].astro`, `src/layouts/Base.astro`, `astro.config.mjs`, `public/admin/config.yml` | 用途はGmail OAuth同意画面から参照するアプリ案内・プライバシーポリシー。CMSから編集できる |

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

#### FR-15 コンテンツ保存・公開

CMSでの記事・固定ページの保存はブログの最も基本的な操作である。保存フローは以下の通り:

```
CMS編集画面 → 保存ボタン → Decap CMS → GitHub API (commit) → Cloudflare Pages webhook → ビルド → デプロイ
```

この操作が正常に動作するための前提条件:

| 前提条件 | 検証方法 |
|:---|:---|
| Backend設定（name, repo, branch, base_url, auth_endpoint）が正しい | cms-config テスト |
| OAuth認証が正常に動作する（ポップアップ経由のトークン取得） | auth-functions テスト |
| COOP ヘッダーがOAuthポップアップをブロックしない | fuzz-validation テスト |
| CDNスクリプトが正しく読み込まれる（`</script>`閉じタグ含む） | admin-html テスト |
| CSP/CORS ヘッダーがGitHub APIアクセスを許可する | fuzz-validation テスト |

> **注意**: バグNo.27（iPhone記事保存失敗）は、セキュリティヘッダー追加時にCMS互換性を検証しなかったことが原因。本要件のテストは保存操作の前提条件を網羅的に検証することで再発を防止する。

#### FR-16 コンテンツ削除

CMSから記事・固定ページを削除できる。Decap CMSでは`create: true`が設定されたコレクションに対し、エントリの削除がGitHub API経由のファイル削除として実行される。`delete`オプションが明示的に`false`に設定されていないことが条件。

#### FR-17 リッチテキスト編集

Decap CMSはSlate-basedのマークダウンエディタを提供し、以下の操作が可能:

- インライン書式: 太字、斜体、見出し（H1〜H6）、リスト（箇条書き・番号付き）、引用
- メディア挿入: 画像（メディアライブラリ連携）、リンク
- コードブロック: インラインコード、コードブロック（モバイルではクラッシュ防止のため非表示: CMS-12）
- 公開記事・固定ページのコードブロックはrehype pluginで`tabindex="0"`を付与し、横スクロール時もキーボードで到達可能にする
- 公開記事・固定ページの本文リンクは下線とコントラスト4.5:1以上の識別色を持ち、`:focus-visible`を表示する
- `config.yml`の`body`フィールドが`widget: "markdown"`であることが条件

#### FR-18 ライブプレビュー

CMSエディタの右ペインにリアルタイムプレビューが表示される。`CMS.registerPreviewStyle()`により本番サイト相当のCSS（フォント、レイアウト、画像スタイル）がプレビューiframeに注入される。プレビューiframeの表示にはCSP `frame-ancestors 'self'`およびX-Frame-Options `SAMEORIGIN`が必要（`DENY`ではiframeがブロックされる）。

#### FR-19 メディアライブラリ

Decap CMSのメディアライブラリ機能により:
- `public/images/uploads/`にアップロード済みの画像を一覧表示
- 画像をクリックして記事に挿入
- 不要な画像をリポジトリから削除
- 新規画像をアップロード（FR-06と連携）

#### FR-20 ビルドパイプライン

4段階の自動ビルドパイプラインが`package.json`のスクリプトで定義される:

| 段階 | スクリプト | 処理内容 |
|:---|:---|:---|
| 1. EXIF正規化 | `normalize-images.mjs` | iPhone画像のEXIF回転をピクセルデータに反映 |
| 2. 記事整理 | `organize-posts.mjs` | 日付ベースのディレクトリ配置 + url-map.json生成 |
| 3. Astroビルド | `astro build` | 静的HTML/CSS/JS生成 |
| 4. 画像最適化 | `image-optimize.mjs` | 最大1200px、80%品質にリサイズ・圧縮 |

`build`コマンドではビルド前にテスト（build.test.mjs以外）が自動実行され、テスト失敗時はビルドが中断される。

#### FR-21 環境分離

staging/production環境が独立した設定で動作する:

| 項目 | production | staging |
|:---|:---|:---|
| URL | `https://reiwa.casa` | `https://staging.reiwa.casa` |
| ブランチ | `main` | `staging` |
| CMS base_url（実行時導出。常に `location.origin`） | `https://reiwa.casa` | `https://staging.reiwa.casa` |
| CMS 書き込み先 branch（実行時導出。ホスト名 `reiwa.casa` のときだけ main） | `main` | `staging` |
| site / canonical / sitemap（ビルド時導出。`CF_PAGES_BRANCH === 'main'` のときだけ本番URL） | `https://reiwa.casa` | `https://staging.reiwa.casa` |
| robots.txt（ビルド時生成） | `Allow: /` + 本番 Sitemap | `Disallow: /` |
| OAuth App | My Blog CMS | tbiのブログ CMS (staging) |
| [STAGING]ラベル | 非表示 | 表示 |

これらの環境値はファイルに書かず、同一のソースからビルド環境変数・配信ホスト名で導出する（Issue #127、SEC-127A。main と staging のファイル差分はゼロ）。導出規則は4.6.4章。

staging環境の検知:
- `Base.astro`: 環境変数`CF_PAGES_BRANCH`が`staging`の場合に[STAGING]表示
- `admin/index.html`: `hostname`が`reiwa.casa`以外の場合に[STAGING]表示

#### FR-22〜FR-28 個人ブログ化ロードマップ（2026-07-04）

技術テストサイトから個人ブログへの段階的移行を目的として、GitHub issue #81〜#89（[公開準備]系・機能系）で追加した要件群。

| 要件 | 環境別の値・挙動 |
|:---|:---|
| FR-22 site/canonical | `astro.config.mjs`の`site`は `resolveSiteUrl(process.env.CF_PAGES_BRANCH)`（`src/lib/site-env.mjs`）でビルド時に導出する（main: `https://reiwa.casa`、それ以外: `https://staging.reiwa.casa`。Issue #127）。旧: ブランチ別手動管理 |
| FR-23 OGP | 記事ページは`summary`→description、`thumbnail`→og:image（絶対URL化）。画像がない場合は`twitter:card`を`summary`にフォールバックする（プレースホルダ画像は生成しない） |
| FR-24 RSS | `/rss.xml`、draft記事除外、date降順。`<link rel="alternate" type="application/rss+xml">`で自動検出対応 |
| FR-25 サイトマップ | `/sitemap-index.xml` + `/sitemap-0.xml`、`filter`で`/admin/`配下を除外 |
| FR-26 タグ一覧 | `/tags/`、`ArchiveNav.astro`から導線 |
| FR-27 前後記事ナビ | 記事詳細フッターに前/次記事リンク（タイトル付き）。最古・最新記事では片側のみ表示 |
| FR-28 ページネーション | `pageSize: 10`。1ページに収まる記事数の間は`/page/`配下のルートは生成されない |

robots.txtは`src/pages/robots.txt.ts`がビルド時に生成し、`CF_PAGES_BRANCH === 'main'`のときだけ`Allow: /` + `Sitemap:`行、それ以外は`Disallow: /`にする（2.5.4章、4.6.4章参照。Bug #41再発防止、Issue #127で手動切替を廃止）。

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
| CMS-16 | 固定ページデフォルトソート: 固定ページ一覧がデフォルトで表示順（order）の昇順でソートされる | `config.yml` sortable_fields | `{field: order, default_sort: asc}` |
| CMS-17 | 記事デフォルトソート日付降順: 記事一覧がデフォルトで日付の降順（最新が先頭）でソートされる | `config.yml` sortable_fields | `{field: date, default_sort: desc}` |
| CMS-18 | 記事月別グルーピング: 記事一覧を年月でグルーピング表示できる | `config.yml` view_groups | `view_groups`で`date`フィールドを`\d{4}-\d{2}`（年月）パターンでグルーピング |
| CMS-19 | 年月グルーピングUI: 記事一覧でデフォルト年月グルーピング有効、降順表示、日本語見出し（「2026年2月」形式）、アクセシブルな年月選択プルダウンで選択年月のみ表示 | `admin/index.html` CSS/JS | `createMonthSelector()`の`aria-label`、モバイル`min-height: 44px`を含む |

---

## 1.4. 非機能要件

### 1.4.1 非機能要件一覧 (NFR)

| ID | 要件 | 実装箇所 | 備考 |
| :--- | :--- | :--- | :--- |
| NFR-01 | 静的サイト生成: サイト全体が静的HTMLとして生成・配信される | `astro.config.mjs` | Astro SSG、`output: 'static'` |
| NFR-02 | CDNホスティング: サイトがCDN経由で高速に配信される | `wrangler.toml`, `_routes.json` | Cloudflare Pages + Functions |
| NFR-03 | 管理画面SEO除外: 管理画面が検索エンジンにインデックスされない | `_headers`, `admin/index.html` | `robots: noindex`, `X-Robots-Tag` |
| NFR-04 | 日本語URL対応: 日本語タイトルの記事がそのまま日本語URLで公開される | `config.yml` | Unicode slug（`encoding: "unicode"`） |
| NFR-05 | レスポンシブデザイン: 公開サイトおよびCMS管理画面がモバイル端末で適切に表示・操作できる | `Base.astro` CSS, `admin/index.html` CSS | viewport設定、メディアクエリ |
| NFR-06 | アクセシビリティ（WCAG 2.2 AA）: 公開サイトがWCAG 2.2 Level AAのcritical/serious違反なしを維持し、独自UIのタップ対象を最低24px、目標44pxとする | `Base.astro`, 各ページCSS, `ArchiveNav.astro`, `admin/index.html` | 色コントラスト、本文リンク識別、キーボード操作、タップ領域、文書言語、axe-core自動検証 |
| NFR-07 | Modern Web Guidance準拠: Google公式Modern Web Guidanceの推奨に従い、Baseline対応済みのモダンWeb機能を安全なプログレッシブエンハンスメントとして採用する | `Base.astro`, `index.astro`, 各本文ページ, 独自rehype plugin | 初期ビューポート外描画最適化、LCP画像優先度、コンテナクエリ、アクセシブルな開閉・スクロール操作 |
| NFR-08 | ダークモード対応: OS設定（`prefers-color-scheme`）に追従し、ライト/ダーク両配色でWCAG AA以上のコントラストを維持する | `Base.astro`, 各ページCSS, `ArchiveNav.astro` | CSSカスタムプロパティで配色を集約、`<meta name="color-scheme" content="light dark">`。Decap CMS本体UIは対象外 |

### 1.4.2 セキュリティ要件一覧 (SEC)

第三者セキュリティ診断（2026年2月21日実施）に基づき定義。運用面の品質基準・定期診断は第4部 4.7章を参照。

| ID | 要件 | 実装箇所 | 備考 |
| :--- | :--- | :--- | :--- |
| SEC-01 | XSS防止（DOM）: innerHTML/outerHTMLを使用せずDOM APIで構築する | `admin/index.html` | createElement, textContent, appendChild を使用 |
| SEC-02 | XSS防止（テンプレート）: HTML埋め込み変数をエスケープする | `functions/auth/callback.js` | `toScriptStringLiteral()`（JSON.stringify ベース、SEC-39）で JS 文字列リテラル化してから埋め込む（旧 `escapeForScript()` は SEC-39 で置換） |
| SEC-03 | CDN外部リソース安全性: 外部スクリプトのバージョンを正確に固定する | `admin/index.html` | `^`/`~`範囲指定でなく正確なバージョン番号を使用 |
| SEC-04 | リンク安全性: target="_blank"にrel="noopener"を付与する | `admin/index.html` | window.opener逆参照攻撃を防止 |
| SEC-05 | コード注入防止: eval()/Function()/document.write()を使用しない | 全ソースコード | コード注入経路の排除 |
| SEC-06 | postMessage安全性: 送信先オリジンを制限し受信時にevent.originを検証する | `functions/auth/callback.js` | expectedOrigin使用、ワイルドカード`"*"`禁止 |
| SEC-07 | OAuth最小権限: スコープを必要最小限に制限する | `functions/auth/index.js` | public_repo, read:user のみ。repo, user は禁止 |
| SEC-08 | 秘密情報保護: APIキー・トークンをソースコードにハードコードしない | `functions/auth/` | 環境変数で管理 |
| SEC-09 | デバッグコード排除: 本番コードにconsole.log等を残さない | 全ソースコード | デバッグ情報からの情報漏洩を防止 |
| SEC-10 | HTTPセキュリティヘッダー: CSP, X-Frame-Options, X-Content-Type-Options等を設定する | `_headers` | Cloudflare Pages Headers設定。CSPはadmin配下のみ（Decap CMS要件） |
| SEC-11 | OAuth CSRF防止: stateパラメータでCSRFを防止する | `functions/auth/` | crypto.randomUUID()でstate生成、HttpOnly Cookieで保存・照合 |
| SEC-12 | SRI（Subresource Integrity）: 外部CDNスクリプトの完全性を検証する | `admin/index.html` | integrity属性 + crossorigin="anonymous" |
| SEC-13 | エラー情報漏洩防止: OAuthエラーメッセージを汎化する | `functions/auth/callback.js` | GitHubエラー詳細をクライアントに返さない |
| SEC-14 | HSTS（HTTP Strict Transport Security）: max-age≧2年、includeSubDomains、preloadを設定する | `_headers` | HSTS Preload List登録対応 |
| SEC-15 | Cross-Origin Isolation: COOP（same-origin）、CORP（same-origin）を設定する。管理画面（/admin/*）はOAuth popup許可のためCOOP: same-origin-allow-popups、プレビューiframe許可のためX-Frame-Options: SAMEORIGIN、CSP frame-ancestors 'self'にオーバーライドする | `_headers` | Spectre系サイドチャネル攻撃緩和 + CMS互換性 |
| SEC-16 | DNS Prefetch / Cross-Domain Policy防止: X-DNS-Prefetch-Control: off、X-Permitted-Cross-Domain-Policies: noneを設定する | `_headers` | 情報漏洩経路の遮断 |
| SEC-17 | Permissions-Policy拡張: FLoC/Topics（interest-cohort）含む全不要APIを無効化する | `_headers` | プライバシー保護（広告トラッキング拒否） |
| SEC-18 | 情報漏洩防止（ファイル）: public配下に.env/.git/package.json等の機密ファイルが存在しないことを保証する | ビルドプロセス | ペネトレーションテストで確認 |
| SEC-19 | 入力値バリデーション強化: フィールド境界値・不整合値をCMS設定・Zodスキーマ・テストの3層で防止する | `config.yml`, `content.config.ts` | order≧1、slug正規表現、型チェック |
| SEC-20 | ファズテスト必須化: XSS/SQLi/パストラバーサル/プロトタイプ汚染等の攻撃ペイロードに対する耐性を自動テストで検証する | `fuzz-validation.test.mjs` | ビルド時にファズテスト必須実行 |
| SEC-21 | 下書き記事静的生成防止: draft=trueの記事がgetStaticPathsから除外され、公開URLでアクセスできないことを保証する | `src/pages/posts/[year]/[month]/[slug].astro` | `.filter(post => !post.data.draft)` |
| SEC-22 | OAuthセキュリティヘッダー: 認証開始（302）およびコールバック（200/エラー時）の全応答にCache-Control: no-store, no-cache, must-revalidate、Pragma: no-cacheを設定し、トークン応答にはX-Content-Type-Options, X-Frame-Options, CSPを設定する | `functions/auth/` | トークン漏洩・OAuth state誤キャッシュ防止 |
| SEC-23 | 公開ページCOOP/CORP/X-Frame-Options: `/*`セクションにも管理画面と同一値のCOOP/CORP/X-Frame-Optionsを設定し、Bug #28のAppend動作で安全に重複させる | `_headers` | 同一値重複は安全（ブラウザ動作に影響なし） |
| SEC-24 | Zodスキーマ厳格化: title max(200), date YYYY-MM-DD正規表現, tags max(50)/max(20), thumbnail startsWith('/images/'), summary max(500) | `content.config.ts` | 入力値を型＋値域の両面で制約 |
| SEC-25 | ビルドスクリプト防御強化: シンボリックリンクスキップ、ファイルサイズ上限(50MB)、ピクセル数上限(50Mピクセル、回転後再取得含む全sharp呼び出し)、gray-matterエンジン無効化、パス境界チェック | `scripts/`, `src/integrations/` | ピクセルフラッド・シンボリックリンク攻撃防止 |
| SEC-26 | OAuth HTTPメソッド制限: OAuth関数をonRequestからonRequestGetに変更し、POST/PUT/DELETE等の不要なHTTPメソッドを拒否する | `functions/auth/` | Cloudflare Functions のメソッド別ハンドラ |
| SEC-27 | OAuth送信先オリジン許可リスト検証: 本番・staging・プロジェクトプレビュー（`*.my-blog-3cg.pages.dev`）・ローカル開発環境のみ許可し、不正オリジンを403拒否する | `functions/_shared/allowed-origin.js`（`functions/auth/` から import。SEC-37） | postMessageトークン窃取・悪意のあるリダイレクト防止 |
| SEC-28 | 公開ページCSPメタタグ導入: Base.astro の `<head>` に `<meta http-equiv="Content-Security-Policy">` を設定（default-src 'self'等）。Bug #28防止のため`_headers`の`/*`には設定せず管理画面と完全分離 | `src/layouts/Base.astro` | 公開ページの多層防御（Defense-in-Depth） |
| SEC-29 | 下書き記事のurl-map.json混入防止: `organize-posts.mjs`で`draft: true`の記事を`public/admin/url-map.json`の生成対象から除外し、`gray-matter`の組み込みjavascriptエンジン（内部的に`eval`相当を実行しうる）を無効化する。**`{ language: 'yaml' }`の指定だけでは`---js`の言語宣言が優先され無効化できない（Bug #52）ため、`scripts/lib/safe-frontmatter.mjs`でjavascript/jsonエンジンを例外を投げるエンジンで上書きし、YAML以外のfrontmatterを評価前に拒否する** | `scripts/organize-posts.mjs`, `scripts/lib/safe-frontmatter.mjs` | 対応Issue: #114。下書き記事のURLマッピング漏洩防止＋frontmatter経由のコード実行防止 |
| SEC-30 | `/*`と`/admin/*`のヘッダー重複排除: `_headers`の`/admin/*`セクションからCross-Origin-Opener-Policy / Cross-Origin-Resource-Policy / X-Frame-Optionsの再定義を削除し、`/*`からの継承に一本化する | `public/_headers` | 対応Issue: #115。Cloudflare Pagesは`/*`と`/admin/*`の同名ヘッダーをオーバーライドせずAppend（重複送信）するため、COOP等のRFC 8941 Structured Headerがカンマ結合され構文エラーとして無効化される蓋然性がある。重複を解消すれば実効値を変えずにこの懸念を無条件に除去できる（ブラウザ側の実際の解決結果までは未観測。詳細: `docs/security/audit-run2-needs-validation.md`） |
| SEC-31 | OAuthハンドシェイクのメッセージリスナー堅牢化: `functions/auth/callback.js`のpostMessage受信リスナーで`{ once: true }`を廃止し、オリジン検証（`event.origin !== expectedOrigin`）とペイロード完全一致検証（`event.data !== "authorizing:github"`）の両方を通過した場合にのみ`removeEventListener`する。加えて30秒のフェイルセーフタイマーでハング防止する | `functions/auth/callback.js` | 対応Issue: #117 項目4。`{ once: true }`は最初に届いた無関係メッセージでリスナーを消費してしまい、正規のackを取りこぼす可能性があった |
| SEC-32 | 画像正規化処理のビルド堅牢化: `normalize-images.mjs`のsharp処理全体をtry/catchで保護し、壊れた画像1件でビルド全体が失敗しないようにする。加えて`.rotate().toBuffer()`の出力バッファにも`MAX_FILE_SIZE`（50MB）上限を適用し、超過時は書き戻さず元ファイルを保持する | `scripts/normalize-images.mjs` | 対応Issue: #117 項目11。入力側のpixel limit・ファイルサイズ上限に加え、出力側にも上限を設けることで回転処理による意図しない肥大化を防止する |
| SEC-33 | CIトークン最小権限: GitHub Actions の `test-and-build` ジョブは `permissions: contents: read` のみを宣言する | `.github/workflows/ci.yml` | 対応Issue: #117 項目2。fork PR は既定で読取専用だが、ソース上に明示してリポジトリ既定の将来変更から守る。**CI に Playwright は載せない**（Bug #50） |
| SEC-34 | 無効な `.assetsignore` を置かない: Cloudflare Pages では Workers Static Assets の `.assetsignore` は効かず、`public/` に置くと公開配信される | ファイルを置かない | 対応Issue: #117 項目12。保護にならないノイズを削除する |
| SEC-35 | 環境固有値の導出整合性検証（Issue #127 で改訂）: ビルド時導出（`CF_PAGES_BRANCH` → SITE_URL・robots.txt）と実行時導出（`location.hostname` / `origin` → CMS の書き込み先 branch・base_url）が、ブランチ・ホストごとに正しい値を返すことを、導出関数の単体テスト・`CF_PAGES_BRANCH=main`/`staging`/未設定での実ビルド生成物（robots.txt・canonical・sitemap・RSS）・config.yml との deepmerge 後の実効設定で検証する。テスト集合はチェックアウト中のブランチに依存しない（旧版の「実ブランチ判定＋判定不能時は内部整合のみ」は廃止） | `tests/cms-config.test.mjs`, `tests/env-derivation.test.mjs`, `tests/build.test.mjs`, `tests/e2e/cms-env-branch.spec.ts` | Bug #51再発防止。旧版は検知のみで、CI の pull_request では `GITHUB_REF_NAME` が `NNN/merge` になり判定不能側に倒れていた |
| SEC-36 | GitHub Actions の action 参照は40桁の commit SHA で固定し、行末に対応する版（`# vX.Y.Z`）を併記する | `.github/workflows/*.yml` | 対応Issue: #117 項目3。タグは上流で付け替え可能なため。固定先は従来の `@v4` と同一 commit（checkout / setup-node とも v4.4.0）。SHA の更新検知は #132 の依存監視で扱う |
| SEC-37 | OAuth オリジン許可リストの単一化: `isAllowedOrigin` は `functions/_shared/allowed-origin.js` にのみ定義し、`/auth`・`/auth/callback` の両方が import する。共有モジュールは `onRequest*` を export せず Pages のルートにならない | `functions/_shared/allowed-origin.js`, `functions/auth/*.js` | 対応Issue: #117 項目5。許可リストの写しが独立に変更され、開始とコールバックで判定が食い違う（ログイン不能等）ことを構造的に防ぐ。許可範囲は SEC-27 と同一 |
| SEC-38 | OAuth コールバック応答の CSP 自己完結: `Content-Security-Policy` に `default-src 'none'` に加えて `frame-ancestors 'none'; form-action 'none'; base-uri 'none'` を明示し、`Content-Type: text/html; charset=utf-8` と `<meta charset="utf-8">` を付ける | `functions/auth/callback.js` | 対応Issue: #117 項目9。これらのディレクティブは `default-src` にフォールバックせず、Functions の応答には `public/_headers` が適用されないため応答自身で完結させる |
| SEC-39 | `<script>` 埋め込み値の安全なリテラル化: コールバック HTML に埋め込むトークン・オリジンは `JSON.stringify` で引用符込みの JS 文字列リテラルにし、`<` `>` `&` と U+2028/U+2029 を `\uXXXX` へ変換してから埋め込む | `functions/auth/callback.js` | 対応Issue: #117 項目10。手書きの置換列（旧 `escapeForScript`）は U+2028/U+2029・バッククオート・`${` を扱わず置換順序にも依存していた。埋め込み先の引用符の種類に依存しない方式にする |
| SEC-40 | npm管理外依存の鮮度・EOL監視: npm audit / Dependabot の対象外である依存（CDN の `<script>`、GitHub Actions、Node.js のバージョン宣言、Cloudflare Pages ビルド環境）を棚卸しし、最新版との差・EOL・SRI 実体一致・既知脆弱性を週次で機械判定して結果 JSON に記録する。alert は Issue 起票とジョブ失敗で通知し、判定ロジックはネットワーク非依存のテストで検証する | `scripts/check-dependency-freshness.mjs`, `scripts/dependency-freshness.config.json`, `.github/workflows/dependency-freshness.yml`, `.github/dependabot.yml` | 対応Issue: #132。Decap CMS が 3.10.0 のまま 6 マイナー遅れていたことに監査まで気づけなかった再発防止。運用手順は 4.11章 |
| SEC-41 | 管理画面CSPで Cloudflare Insights beacon を許可しない: `/admin/*` の `script-src` / `connect-src` に外部解析ホストを追加せず、実ホストのCMS操作で他のCSP違反・機能エラーが観測されないことを確認する | `public/_headers`, `tests/fuzz-validation.test.mjs`, `evidence/2026-09-23/issue130-review/` | 対応Issue: #130。実ホスト証跡はproduction/staging・PC/iPad/iPhone、OAuth/GitHub APIモック、保存要求branchの確認を含む。検証対象操作の範囲を超える一般的無影響の主張はしない |
| SEC-42 | main/staging に新しく入るコミットの author と committer を固定 allowlist で検査する。PR は base..head、通常 push は before..head を検査し、force-push または before SHA を取得できない場合は新 HEAD の全履歴を検査する。不許可値はログへ出さない | `.github/workflows/ci.yml`, `scripts/check-commit-identities.mjs` | tbi、従来の bickojima noreply、GitHub Web、Dependabot bot の定義済み identity tuple のみ許可する |
| SEC-127A（仮ID・マージ時採番調整） | 環境固有値をファイルに置かない: main / staging で値が異なる設定（SITE_URL、robots.txt、CMS の backend.branch / base_url）をリポジトリのファイルに書かず、ビルド時は `src/lib/site-env.mjs`、実行時は `public/admin/cms-env.js` の1か所から導出する。本番値になるのは `CF_PAGES_BRANCH === 'main'`（ビルド）／ホスト名 `reiwa.casa` 完全一致（CMS）のときだけで、未設定・未知の値はすべて staging 値（検索除外・staging への書き込み）に倒す。config.yml に branch / base_url、`public/robots.txt`、SITE_URL のリテラルを置かないことを静的テストで固定する | `src/lib/site-env.mjs`, `src/pages/robots.txt.ts`, `astro.config.mjs`, `public/admin/cms-env.js`, `public/admin/index.html`, `public/admin/config.yml` | 対応Issue: #127（#117 項目15 と同根）。どちら向きのマージでも相手の値が持ち込まれない（差分がそもそも存在しない）。Decap は config.yml の上に `CMS.init({config})` を deepmerge し init 側が優先（3.16.2 配布物で確認） |

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
| FR-15 | コンテンツ保存・公開 | cms-config, auth-functions, admin-html, fuzz-validation, E2E cms-operations | 2.4章 #1〜#5, #45, 2.3章 #1〜#10, 2.6.1章 #6,#7, 2.7.12章 #1〜#5, E-28, E-29 | M-03, M-06, M-07, M-02, M-11 | 充足 |
| FR-16 | コンテンツ削除 | cms-config, E2E cms-operations | 2.4章 #13, #46, E-35 | M-03, M-11 | 充足 |
| FR-17 | リッチテキスト編集 | cms-config, rehype-focusable-code-blocks, build | 2.4章 #26b, #33b, 2.2.1章 #1〜#2, 2.5章 Modern Web Guidanceアクセシビリティ検証 | M-03, M-05, M-02 | 充足 |
| FR-18 | ライブプレビュー | admin-html | 2.6.11章 #1〜#5, 2.6.1章 #7 | M-02 | 充足 |
| FR-19 | メディアライブラリ | cms-config, admin-html | 2.4章 #6,#7, #47, 2.6.3章 #8,#10 | M-03, M-02 | 充足 |
| FR-20 | ビルドパイプライン | build | 2.5章 #1〜#8, #51 | M-01, M-02, M-12 | 充足 |
| FR-21 | 環境分離 | cms-config, admin-html | 2.4章 #3,#5, 2.6.1章 #8 | M-03, M-02 | 充足 |
| FR-22 | サイト設定・canonical URL | build | 2.5.6章 #1,#2 | M-01 | 充足 |
| FR-23 | OGP・meta description | build | 2.5.6章 #3,#4 | M-01 | 充足 |
| FR-24 | RSSフィード配信 | build | 2.5.6章 #5〜#7 | M-01 | 充足 |
| FR-25 | XMLサイトマップ生成 | build | 2.5.6章 #8,#9 | M-01 | 充足 |
| FR-26 | タグ一覧ページ | build | 2.5.6章 #10 | M-01 | 充足 |
| FR-27 | 記事の前後ナビゲーション | build | 2.5.6章 #11〜#13 | M-01 | 充足 |
| FR-28 | 記事一覧のページネーション | build | 2.5.7章 #1〜#4 | M-01 | 充足 |
| FR-29 | 検索除外の固定ページ | build / E2E app-info | 2.5.9章 #1〜#5、E-46: 2ページ×3デバイス＋ナビ3デバイス | 実クリック・axe | 充足 |

### 1.5.2 CMS管理画面要件 (CMS) → テストケース

| 要件ID | 要件概要 | テストファイル | 対応テストケース | 主テスト手法 | 充足状況 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| CMS-01 | モバイルレスポンシブ | admin-html | 2.6.3章 #1〜#10 | M-02 | 充足 |
| CMS-02 | iOS自動ズーム防止 | admin-html | 2.6.5章 #1 | M-02 | 充足 |
| CMS-03 | pull-to-refresh無効化 | admin-html | 2.6.5章 #3,#4 | M-02 | 充足 |
| CMS-04 | 削除ボタンラベル区別 | admin-html, E2E cms-operations | 2.6.6章 #3,#4,#5, E-35 | M-02, M-11 | 充足 |
| CMS-05 | 一覧表示改善 | admin-html, E2E cms-operations | 2.6.2章 #3, 2.6.6章 #2, 2.6.6章 #10, E-31 | M-02, M-11 | 充足 |
| CMS-06 | エディタ公開URL表示 | admin-html, E2E cms-operations | 2.6.6章 #6,#7, E-30 | M-02, M-11 | 充足 |
| CMS-07 | メディアライブラリ | admin-html | 2.6.3章 #8,#10 | M-02 | 充足 |
| CMS-08 | 保存ボタン常時表示 | admin-html | 2.6.3章 #4,#5, 2.6.8章 #1,#2 | M-02 | 充足 |
| CMS-09 | ドロップダウン重なり防止 | admin-html, E2E cms-operations | 2.6.9章 #1〜#3, 2.6.10章 #1〜#8, E-34 | M-02, M-11 | 充足 |
| CMS-10 | 公開URLバー自動制御 | admin-html, E2E cms-operations | 2.6.6章 #6,#7, E-15, E-30, E-32 | M-02, DOM検証, M-11 | 充足 |
| CMS-11 | サイトリンク表示（環境動的） | admin-html, E2E cms-operations | 2.6.6章 #1b, E-30 | M-02, M-11 | 充足 |
| CMS-12 | Slate codeblockクラッシュ対策 | admin-html, E2E cms-operations | 2.6.5b章 #1,#2,#3, 2.6.5章 #5, E-34 | M-02, M-11 | 充足 |
| CMS-13 | 固定ページCMS編集 | cms-config, content-validation | 2.4章 #28〜#39, 2.1.2章 #16〜#23 | M-03, M-04 | 充足 |
| CMS-14 | コレクション表示順序 | cms-config | 2.4章 #11b | M-03 | 充足 |
| CMS-15 | プレビュースタイル本番再現 | admin-html | 2.6.11章 #1〜#5 | M-02 | 充足 |
| CMS-16 | 固定ページデフォルトソート | cms-config | 2.4章 #40, #41 | M-03 | 充足 |
| CMS-17 | 記事デフォルトソート日付降順 | cms-config, E2E cms-operations | 2.4章 #48, #49, E-36 | M-03, M-11 | 充足 |
| CMS-18 | 記事月別グルーピング | cms-config, E2E cms-operations | 2.4章 #50, E-36 | M-03, M-11 | 充足 |
| CMS-19 | 年月グルーピングUI | admin-html, E2E cms-exploratory | 2.6章 #11〜#15, E-37 | M-02, 実操作 | 充足 |

### 1.5.3 非機能要件 (NFR) → テストケース

| 要件ID | 要件概要 | テストファイル | 対応テストケース | 主テスト手法 | 充足状況 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| NFR-01 | 静的サイト生成 | build | 2.5章 #1〜#8 | M-01, M-12 | 充足 |
| NFR-02 | Cloudflare Pagesホスティング | build | 2.5章 #6,#7,#8 | M-01 | 充足 |
| NFR-03 | 管理画面SEO除外 | admin-html | 2.6.1章 #3 | M-02 | 充足 |
| NFR-04 | 日本語URL | cms-config | 2.4章 #9,#10 | M-03 | 充足 |
| NFR-05 | レスポンシブデザイン | admin-html, build, E2E site, E2E cms-operations | 2.6.3章 #1〜#10, 2.5章 #19, E-21, E-34 | M-02, M-11, 実操作 | 充足 |
| NFR-06 | アクセシビリティ（WCAG 2.2 AA） | admin-html, build, E2E site, E2E accessibility, E2E cms-exploratory | 2.5章 #23b/#23c, 2.6章 #15, E-21, E-25〜E-27, E-37 | M-02, M-11（axe-core）, 実操作 | 充足 |
| NFR-07 | Modern Web Guidance準拠 | build, content-validation, admin-html, rehype-focusable-code-blocks, E2E site, E2E evidence | 2.5章 Modern Web Guidance検証, 2.6章, 2.2.1章, E-05, E-21, 2026-06-11 evidence | M-02, M-05, M-11, 実操作 | 充足 |
| NFR-08 | ダークモード対応 | build | 2.5.6章 #14,#15, 2.5.4章 #3 | M-01 | 充足 |

### 1.5.4 セキュリティ要件 (SEC) → テストケース

| 要件ID | 要件概要 | テストファイル | 対応テストケース | 主テスト手法 | 充足状況 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| SEC-01 | XSS防止（DOM） | admin-html | 2.6.12章 #1 | M-02 | 充足 |
| SEC-02 | XSS防止（テンプレート） | auth-functions, fuzz-validation, security-hardening | 2.3.1章 #1、TEST-REPORT 2.8章（SEC-39） | M-02 | 充足 |
| SEC-03 | CDN外部リソース安全性 | admin-html | 2.6.12章 #2, #7 | M-02 | 充足 |
| SEC-04 | リンク安全性 | admin-html | 2.6.12章 #3 | M-02 | 充足 |
| SEC-05 | コード注入防止 | admin-html | 2.6.12章 #4 | M-02 | 充足 |
| SEC-06 | postMessage安全性 | auth-functions | 2.3.1章 #2, #3 | M-02 | 充足 |
| SEC-07 | OAuth最小権限 | auth-functions | 2.3章 #1, 2.3.1章 #4 | M-06, M-02 | 充足 |
| SEC-08 | 秘密情報保護 | admin-html | 2.6.12章 #6 | M-02 | 充足 |
| SEC-09 | デバッグコード排除 | admin-html | 2.6.12章 #5 | M-02 | 充足 |
| SEC-10 | HTTPセキュリティヘッダー | build, fuzz-validation | 2.5.1章 #1〜#5, #8, 2.7.8章 | M-02 | 充足 |
| SEC-11 | OAuth CSRF防止 | auth-functions | 2.3.1章 #5, #6 | M-02 | 充足 |
| SEC-12 | SRI（Subresource Integrity） | admin-html | 2.6.12章 #10, #11 | M-02 | 充足 |
| SEC-13 | エラー情報漏洩防止 | auth-functions | 2.3.1章 #7 | M-02 | 充足 |
| SEC-14 | HSTS（preload対応） | fuzz-validation | 2.7.8章 #7〜#10 | M-02 | 充足 |
| SEC-15 | Cross-Origin Isolation + 管理画面オーバーライド | fuzz-validation | 2.7.8章 #11, #12, 2.7.12章 #1〜#5 | M-02 | 充足 |
| SEC-16 | DNS Prefetch / Cross-Domain Policy防止 | fuzz-validation | 2.7.8章 #13, #14 | M-02 | 充足 |
| SEC-17 | Permissions-Policy拡張 | fuzz-validation | 2.7.8章 #3〜#6 | M-02 | 充足 |
| SEC-18 | 情報漏洩防止（ファイル） | fuzz-validation | 2.7.10章 #1〜#7 | M-02 | 充足 |
| SEC-19 | 入力値バリデーション強化 | fuzz-validation | 2.7.1〜2.7.6章 | M-02, M-09 | 充足 |
| SEC-20 | ファズテスト必須化 | fuzz-validation | 2.7章全体 | M-09 | 充足 |
| SEC-21 | 下書き記事静的生成防止 | build | 2.5章（draft記事が生成されないこと） | M-02 | 充足 |
| SEC-22 | OAuthセキュリティヘッダー | auth-functions | 2.3章（全レスポンスCache-Control検証） | M-02 | 充足 |
| SEC-23 | 公開ページCOOP/CORP/X-Frame-Options | fuzz-validation, build | 2.7.8章, 2.5.1章 | M-02 | 充足 |
| SEC-24 | Zodスキーマ厳格化 | fuzz-validation | 2.7.2〜2.7.6章 | M-09 | 充足 |
| SEC-25 | ビルドスクリプト防御強化 | build | ビルドパイプライン検証（全sharp呼び出しpixel limit） | M-02 | 充足 |
| SEC-26 | OAuth HTTPメソッド制限 | auth-functions | 2.3章 | M-02 | 充足 |
| SEC-27 | OAuth送信先オリジン許可リスト検証 | auth-functions, security-hardening | 2.3章（オリジン許可・拒否検証）、TEST-REPORT 2.8章（SEC-37） | M-02 | 充足 |
| SEC-28 | 公開ページCSPメタタグ導入 | build | 2.5章（Base.astro・生成HTMLメタタグ検証） | M-02 | 充足 |
| SEC-29 | 下書き記事のurl-map.json混入防止＋frontmatterはYAMLのみ | build, security-hardening | `下書き記事がurl-map.jsonに含まれていない（SEC-29, Bug #48 再発防止）`, `公開記事のslugが全てurl-map.jsonに含まれている（下書き除外が過剰でないことの確認）` / security-hardening: `frontmatter は YAML のみを解析する（SEC-29, Bug #52 再発防止, Issue #117 項目1）`（`---js`等4言語の拒否、未登録言語の拒否、YAML正常解析、organize-posts実行でペイロード非実行、安全ラッパー経由、`tests/ と scripts/ で gray-matter を直接 import / require するのは安全ラッパーだけである`、`src/content を読む tests/・scripts/ のファイルは全て安全ラッパー経由で frontmatter を解析する`） | M-02 | 充足 |
| SEC-30 | `/*`と`/admin/*`のヘッダー重複排除 | build, fuzz-validation | build: `X-Frame-Optionsは/admin/*で再定義されず/*から継承される（Issue #115, Bug #49）`, `COOPは/admin/*で再定義されず/*から継承され、same-origin-allow-popupsが適用される（Issue #115, Bug #49）`, `/* と /admin/* で同名ヘッダーが一切重複していない（SEC-30, Bug #49 再発防止）` / fuzz-validation: `X-Frame-Options は /admin/* で再定義されず /* から継承される（Issue #115, Bug #49）`, `Cross-Origin-Opener-Policy は /admin/* で再定義されず /* から継承される（Issue #115, Bug #49）`, `Cross-Origin-Resource-Policy は /admin/* で再定義されず /* から継承される（Issue #115, Bug #49）`, `COOP/CORP/X-Frame-Options は /admin/* で再定義されず /* から継承される（Bug #28 再発防止・Issue #115/Bug #49で設計変更）` | M-02 | 充足 |
| SEC-31 | OAuthハンドシェイクのメッセージリスナー堅牢化 | auth-functions | `OAuthハンドシェイクのmessage listenerに { once: true } を使っていない（SEC-31）`, `ackは event.data の完全一致で検証している（SEC-31）`, `オリジン検証とペイロード検証の両方を通過したときだけ removeEventListener している（SEC-31）`, `フェイルセーフの setTimeout（30000ms）でタイムアウト時に listener を外す（SEC-31）` | M-02 | 充足 |
| SEC-32 | 画像正規化処理のビルド堅牢化 | build | `sharp処理が try/catch で囲まれ、catch でビルド全体を throw していない（SEC-32）`, `.rotate().toBuffer() の出力 buffer.length に MAX_FILE_SIZE 上限がある（SEC-32）`, `lstat 失敗も try/catch で保護されている（SEC-32）` | M-02 | 充足 |
| SEC-33 | CIトークン最小権限 | build | `CI ジョブは contents: read に限定する（SEC-33, Issue #117 項目2）` | M-02 | 充足 |
| SEC-34 | 無効な `.assetsignore` を置かない | build, fuzz-validation | `dist に .assetsignore が存在しない（SEC-34, Issue #117 項目12）`, `Cloudflare Pages で無効な public/.assetsignore が存在しない（SEC-34, Issue #117 項目12）` | M-02 | 充足 |
| SEC-35 | 環境固有値の導出整合性検証（Issue #127 改訂） | cms-config, env-derivation, build, E2E | cms-config `環境固有値の導出整合性検証（SEC-35 改訂, Bug #51再発防止, Issue #127）`（5件: 4ホストの実効 backend、config.yml 単体に branch/base_url なし）、env-derivation `ビルド時の環境値導出`（16件）・`CMS の書き込み先ブランチ・base_url の実行時導出`（14件）、build `CF_PAGES_BRANCH 別ビルドの環境値（SEC-35 改訂, Issue #127）`（15件: main/staging/未設定×robots・canonical・sitemap・RSS・config.yml）、E2E `cms-env-branch.spec.ts`（4ホスト×3デバイス: 実操作保存で PATCH `git/refs/heads/<branch>` を実測）、エビデンス `evidence/2026-09-23/issue127/` | M-01, M-02, M-03 | 充足 |
| SEC-36 | Actions の commit SHA 固定 | build | `CI の全 action 参照は40桁の commit SHA で固定し、版をコメントで併記する（SEC-36, Issue #117 項目3）` | M-02 | 充足 |
| SEC-37 | OAuth オリジン許可リストの単一化 | security-hardening, auth-functions | `OAuth オリジン許可リストは1か所で定義する（SEC-37, Issue #117 項目5）`（4件）、`OAuth開始・コールバックで送信先オリジン許可リスト判定関数を実装している（SEC-27, SEC-37）`、E2E エビデンス `evidence/2026-09-23/issue117/` H01 | M-02 | 充足 |
| SEC-38 | OAuth コールバック応答の CSP 自己完結 | security-hardening, auth-functions | `OAuth コールバック応答の CSP を自己完結させる（SEC-38, Issue #117 項目9）`（2件）、`GitHubが成功した場合、トークンを含むHTMLが返される`（Content-Type）、E2E エビデンス H02/H04/H05 | M-02 | 充足 |
| SEC-39 | `<script>` 埋め込み値の JSON.stringify リテラル化 | security-hardening, fuzz-validation, auth-functions | `<script> 埋め込み値は JSON.stringify リテラルで出力する（SEC-39, Issue #117 項目10）`（12件）、fuzz-validation `トークンのエスケープ検証`（挙動検証へ強化）、E2E エビデンス H03 | M-02 | 充足 |
| SEC-40 | npm管理外依存の鮮度・EOL監視 | dependency-freshness | TEST-REPORT 2.9章 #1〜#27（判定ロジックはフィクスチャ、実ファイル棚卸し、週次ワークフローの権限・SHA 固定・通知分岐、Dependabot 設定）。ネットワーク実行と alert/error 経路の dry-run は `evidence/2026-09-23/issue132/` | M-02, M-07, M-08, M-12 | 充足 |
| SEC-41 | 管理画面CSPで外部解析ビーコンを許可しない | fuzz-validation, E2E evidence | fuzz-validationのSEC-41検証3件、実ホストE2E `evidence/2026-09-23/issue130-review/`（production/staging×3端末、ユーザー操作、mock保存branch） | M-02, M-03 | 対象操作の範囲で充足 |
| SEC-42 | 新規コミット author/committer allowlist | commit-identities | TEST-REPORT 2.11章 #1〜#8（差分限定、force-push全履歴、許可bot、拒否値の非出力）。PRはマージ前検査、ブランチ保護未設定のため直接pushは受理後検知 | M-02, Git実行テスト | 充足（CI検査。push拒否を保証しない） |
| SEC-127A（仮ID） | 環境固有値をファイルに置かない | env-derivation | `main / staging で環境固有ファイルに差分を置かない静的ガード（SEC-35 改訂, Bug #51・Issue #127）`（7件: config.yml に branch/base_url・環境URLなし、public/robots.txt なし・エンドポイント生成、SITE_URL 非リテラル、CMS_MANUAL_INIT と cms-env.js の読込順、CMS.init 1回、cms-env.js の URL 非保持・strict）、両方向マージ実証 `evidence/2026-09-23/issue127/merge-demo.md` | M-02, M-03 | 充足 |

**充足状況: FR-01〜FR-29, CMS-01〜CMS-19, NFR-01〜NFR-08, SEC-01〜SEC-42, SEC-127A（仮ID）はテストで充足されている。SEC-41は実ホストで検証した操作範囲を対象とする。未テスト要件は0件。**

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
│   │   ├── index.html                  # CMS管理画面（CSS/JS含む約1020行）
│   │   └── config.yml                  # CMS設定定義
│   ├── images/uploads/                 # アップロード画像（Git管理）
│   ├── _headers                        # HTTPレスポンスヘッダー
│   └── _redirects                      # URLリダイレクト規則
│   （robots.txt は置かない。src/pages/robots.txt.ts がビルド時に生成。Issue #127）
├── scripts/                            # ビルド前処理スクリプト
│   ├── normalize-images.mjs            # EXIF回転正規化
│   └── organize-posts.mjs             # 記事ファイル配置整理
├── src/                                # ソースコード
│   ├── content/posts/{yyyy}/{mm}/      # 記事Markdownファイル
│   ├── content/pages/                  # 固定ページMarkdownファイル
│   ├── components/ArchiveNav.astro     # アーカイブナビゲーション
│   ├── components/Pagination.astro     # ページネーションナビ（FR-28）
│   ├── integrations/image-optimize.mjs # ビルド後画像最適化
│   ├── plugins/rehype-image-caption.mjs# 画像キャプション変換
│   ├── plugins/rehype-focusable-code-blocks.mjs # preのキーボード到達性
│   ├── layouts/Base.astro              # 共通レイアウト（canonical/OGP/RSS autodiscovery含む）
│   ├── lib/posts.ts                    # 記事URL生成ロジック
│   ├── pages/                          # ページルーティング
│   │   ├── rss.xml.js                  # RSSフィード（FR-24）
│   │   ├── tags/index.astro            # タグ一覧ページ（FR-26）
│   │   └── page/[page].astro           # 記事一覧ページネーション（FR-28）
│   └── content.config.ts              # コンテンツスキーマ定義
├── tests/                              # 自動テスト
│   ├── *.test.mjs                      # 単体・統合テスト（Vitest 8ファイル）
│   ├── e2e/                            # E2Eテスト（Playwright 7ファイル）
│   └── TEST-REPORT.md                  # テスト計画書・テストケース一覧・実行結果
├── docs/
│   ├── DOCUMENTATION.md                # システム設計書（本書）
│   └── MODERN-WEB-GUIDANCE.md          # Modern Web Guidance 日本語索引
├── evidence/                           # 動作確認エビデンス（日付フォルダごと）
├── README.md                           # プロジェクト概要（人間向け）
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
| SSG | Astro | v7.3.3 | 静的サイト生成 |
| CMS | Decap CMS | v3.16.2 | コンテンツ管理 |
| ホスティング | Cloudflare Pages | - | 静的配信 + Functions |
| 認証 | GitHub OAuth App | - | CMS管理者認証 |
| 画像処理 | sharp | v0.35.4 | 画像圧縮・回転・リサイズ |
| Web実装方針 | Google Modern Web Guidance | 公式ガイド準拠 | 独自実装部のモダンWeb機能・アクセシビリティ・パフォーマンス設計指針 |
| テスト（単体・統合） | Vitest | v4.0.18 | 単体テスト・統合テスト・セキュリティ検証・基本機能保護（featureブランチ695テスト／main・staging 698テスト、記事数により変動） |
| テスト（E2E） | Playwright | v1.58.2 | ブラウザE2Eテスト（PC/iPad/iPhone 453テスト、うち8件はデバイス固有条件でスキップ） |
| コンテンツ | Markdown | - | frontmatter形式 |

### 2.2.2 選定理由

| 技術 | 選定理由 |
| :--- | :--- |
| Astro | Markdownネイティブ対応、高速ビルド、コンテンツコレクション機能 |
| Decap CMS | Git-basedでサーバー不要、Markdown対応、日本語対応 |
| Cloudflare Pages | 無料枠が充実、Functions対応、CDN自動配信 |
| GitHub OAuth | Decap CMSのgithubバックエンドと整合する認証方式 |
| Google Modern Web Guidance | Baseline対応済みのモダンWeb機能を、AI支援開発時にも再現可能な形で設計判断へ注入できる。LCP画像優先度、コンテナクエリ、アクセシブルな状態同期などを、独自実装部に限定して安全に適用する |

### 2.2.3 Modern Web Guidance基本設計方針

本システムの独自実装部は、Google公式Modern Web Guidanceスキル準拠を基本設計方針とする。適用対象は公開サイトのAstro実装（`src/layouts`, `src/pages`, `src/components`, 独自rehype plugin）およびCMS管理画面の独自カスタマイズ（`public/admin/index.html`内の追加CSS/JS）に限定する。

Modern Web Guidanceは、AIエージェントへGoogle公式のモダンWeb機能知識を注入するため、プロジェクト初期化時または方針更新時に `npx modern-web-guidance@latest install` で導入する。

ガイド本体は英語のエージェント向けスキルとして配布されており、公式にはカテゴリ横断の日本語目次が存在しない。設計判断の根拠を人間が追跡できるようにするため、全ガイドの日本語索引を [MODERN-WEB-GUIDANCE.md](MODERN-WEB-GUIDANCE.md) に維持する。同書は各ガイドの1行要約、本設計方針で適用済みの項目、`npx modern-web-guidance@latest retrieve "<ガイドID>"` によるガイド全文の参照手順、およびガイド追加時の索引更新手順を含む。

Decap CMS本体UIは外部プロダクト由来の実装であり、保存・OAuth・プレビュー互換性を壊すリスクが高いため、Modern Web Guidanceの全面適用対象外とする。記事本文画像のLCP自動判定も、Markdown本文の構造差により誤判定の可能性があるため、明確な主要画像のみ高優先度化し、それ以外は遅延読み込みを維持する。

| 設計観点 | 採用方針 | 実装例 |
| :--- | :--- | :--- |
| Performance | 明確なLCP候補だけを高優先度化する | トップページ先頭サムネイルに`fetchpriority="high"`、`loading="eager"` |
| Performance | ブラウザ標準の描画最適化を使い、初期表示に不要な下部コンテンツの描画負荷を抑える | 7件目以降の記事カードに`content-visibility: auto`と`contain-intrinsic-size: auto 220px`。修正後実測でPCは4枚目、iPad Pro 11縦向きは5枚目まで初期表示内だったため、全対象デバイスで確実に外側となる7枚目から適用する |
| CSS Layout | 画面幅ではなくコンポーネント幅に応じた段階的拡張を優先する | 記事カードの`container-type: inline-size`と`@container` |
| Typography | 対応ブラウザでは読みやすい改行を優先し、非対応時は通常表示にフォールバックする | 見出しに`text-wrap: balance`、本文/タイトルに`text-wrap: pretty` |
| Accessibility | 開閉状態などのUI状態をARIA属性へ同期し、キーボードフォーカスを明示する | ヘッダーナビの`aria-expanded`同期、Escape/フォーカス離脱クローズ、`aria-label`/`aria-labelledby`、`:focus-visible` |
| Accessibility | タッチ対象、本文リンク、スクロール可能領域を入力方式に依存せず操作可能にする | タッチ端末44px領域、本文リンクの下線と識別色、rehypeで`pre tabindex="0"`付与 |
| CMS独自UI | Decap CMS本体を壊さない範囲で独自CSS/JSのみ改善する | 月セレクターの`aria-label`と44px高さ、管理画面`lang="ja"` |
| 検証 | 過去エビデンス方式を継承し、stagingで先行確認する。UI変更は実操作E2Eを必須とする | `evidence/2026-05-22/verify-modern-web-guidance.mjs`、`verify-cms19-month-filter.mjs` |

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
     │                   │                     │  scope=          │
     │                   │                     │  public_repo,    │
     │                   │                     │  read:user       │
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

GitHub の認可 URL にリダイレクトする。`redirect_uri` はリクエストのオリジンから自動構築される（定数化しない理由は `docs/security/issue-117-hardening-decisions.md` 項目6: オリジンは配信ホストそのもので許可リストと GitHub の callback URL 照合の二重で制約される）。オリジン許可リストは `functions/_shared/allowed-origin.js`（SEC-37）を `/auth`・`/auth/callback` の両方が import する。

```javascript
// 処理概要（擬似コード）
const redirectUri = `${request.origin}/auth/callback`;
const githubUrl = `https://github.com/login/oauth/authorize`
  + `?client_id=${OAUTH_CLIENT_ID}`
  + `&redirect_uri=${redirectUri}`
  + `&scope=public_repo,read:user`;
return Response.redirect(githubUrl, 302);
```

| パラメータ | 値 | 説明 |
| :--- | :--- | :--- |
| `client_id` | 環境変数 `OAUTH_CLIENT_ID` | GitHub OAuth App の識別子 |
| `redirect_uri` | `https://reiwa.casa/auth/callback` | コールバックURL（オリジンから自動構築） |
| `scope` | `public_repo,read:user` | 公開リポジトリ操作権限とユーザー情報（読取） |

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
    // Step 1: 認証開始通知（オリジン制限付き）
    const expectedOrigin = url.origin;  // サーバーサイドで算出
    window.opener.postMessage("authorizing:github", expectedOrigin);
    // Step 2: 親ウィンドウからの応答を待機（オリジン検証＋ack完全一致。SEC-31）
    window.addEventListener("message", function handleMessage(event) {
      if (event.origin !== expectedOrigin) return;
      if (event.data !== "authorizing:github") return;
      window.removeEventListener("message", handleMessage);
      // Step 3: トークン送信（XSSエスケープ済み）
      const msg = "authorization:github:success:" + JSON.stringify({token, provider});
      window.opener.postMessage(msg, event.origin);
      // Step 4: ポップアップを閉じる
      window.close();
    });
  </script>
`, { headers: {
  // SEC-38: charset 明示と自己完結した CSP（_headers は Functions 応答に適用されない）
  'Content-Type': 'text/html; charset=utf-8',
  'Content-Security-Policy': "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; frame-ancestors 'none'; form-action 'none'; base-uri 'none'",
  'X-Frame-Options': 'DENY',
}});
// token / expectedOrigin は toScriptStringLiteral()（JSON.stringify ベース、SEC-39）でリテラル化して埋め込む
```

### 2.4.6 セキュリティ上の考慮事項

| 項目 | 対策 |
| :--- | :--- |
| Client Secret の保護 | `OAUTH_CLIENT_SECRET` はサーバーサイド（Cloudflare Functions）でのみ使用し、ブラウザには露出しない |
| トークン交換 | 認可コード→アクセストークンの交換はサーバーサイドで実行する（ブラウザで行うと Secret が漏洩する） |
| postMessage のオリジン検証 | callback.js は `expectedOrigin`（サーバーサイド算出）で `postMessage` の送信先を制限し、`event.origin` で受信元を検証する。ワイルドカード `"*"` は使用しない |
| scope の最小化 | `public_repo,read:user` のみを要求し、不要な権限は取得しない。`repo` スコープ（プライベートリポジトリ含む全アクセス）は使用しない |
| XSS 対策 | callback.js でトークン値をHTMLに埋め込む際に `toScriptStringLiteral()`（JSON.stringify で引用符込みリテラル化し `< > &`・U+2028/U+2029 を `\uXXXX` 化。SEC-39）を使い、スクリプト注入を防止する。admin/index.html では innerHTML を使用せず DOM API（createElement/textContent）で安全にDOM構築する |
| CDN バージョン固定 | Decap CMS の CDN URL はキャレット範囲（`^3.16.2`）ではなく正確なバージョン（`3.16.2`）を指定し、SRI（`integrity`）と合わせてサプライチェーン攻撃のリスクを軽減する。3.16.2 dist の `.wasm` は任意の `media_processing` WebP 変換でのみ遅延読み込みされ、本サイトでは未使用のため管理画面 CSP に `wasm-unsafe-eval` は追加しない |
| コールバック応答の CSP | `frame-ancestors`・`form-action`・`base-uri` は `default-src` にフォールバックしないため個別に `'none'` を指定し、`charset=utf-8` を明示する（SEC-38）。Functions の応答には `public/_headers` が適用されない |
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
| Node.js バージョン | 22.12.0以上（`.nvmrc` で 22.12.0。Astro 7 要件。Cloudflare Pages v3 既定は 22.16.0）。ビルドイメージ・`NODE_VERSION` の実設定はダッシュボード管理で、2026-09-23 時点では未確認（4.11章の四半期手動確認で記録） |

#### テストゲート（Issue #128）

2026-09-23 に Cloudflare ダッシュボードで、Build command が `npm run build`、Build output が `dist`、Production branch が `main`、Automatic deployments が Enabled であることを確認した。`build:raw`（テストなしビルド）は Pages では使っていない。`build:raw` を使うのは `tests/build.test.mjs` の内部と GitHub Actions CI（`npm test` の後に実行）だけである。

- **Vitest 失敗時はデプロイされない**: `npm run build` は `vitest run --exclude tests/build.test.mjs && normalize-images && organize-posts && astro build` を `&&` でつないでいる。このため Vitest が失敗すると `astro build` まで進まず、`dist` は生成されない。その結果、Pages のビルドが失敗し、デプロイは行われない。GitHub Actions CI の成否とは独立して、Pages 自体がテストゲートになる。
- **ローカル実証（2026-09-23）**: 通常ビルドでは終了コード0で、`dist` が生成された。一時的な失敗テストを置くと終了コード1になり、`astro build` は実行されず、`dist` は生成されなかった。`CF_PAGES_BRANCH=staging` を付けた場合も終了コード1で、`dist` は生成されなかった。エビデンスは `evidence/2026-09-23/issue128/` にある。staging への意図的な失敗コミットによる実環境での実証は行っていない（ユーザー判断）。
- **残余リスク（build.test.mjs はゲート対象外）**: `tests/build.test.mjs` は内部で `npm run build:raw` を実行する。そのため再帰を避ける目的で、`npm run build` からは `--exclude` で除外している。ビルド成果物を検証するテスト（dist の内容、sitemap、ヘッダー、コントラスト比など）が失敗しても Pages のデプロイは止まらず、GitHub Actions CI の `npm test` でのみ検出される。CI の失敗はデプロイを止めない。このため、main へのマージ前に `build.test.mjs` を含む `npm test` の全 PASS を確認する運用（4.6.2章 No.3）で補う。
- **Bug #51 / SEC-35 は Pages 上で最終防壁になる**: `tests/cms-config.test.mjs` の SEC-35 テストは `build.test.mjs` 以外のテストファイルにあるため、Pages のゲートに含まれる。Pages のビルド環境では `CF_PAGES_BRANCH` によって実ブランチ（main / staging）を判定し、実ブランチ用のテストを登録する。そのため、環境固有ファイル（config.yml の branch/base_url、SITE_URL、robots.txt）が別環境の値で上書きされたブランチはビルドが失敗し、デプロイされない。ローカル実証の `CF_PAGES_BRANCH=staging` ケースでは、SEC-35 の staging 用テストが登録され、Vitest の合格件数が3件増えることも確認した。

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
| robots.txt（ビルド時生成） | `Allow: /` + 本番 Sitemap | `Disallow: /`（インデックス防止） |
| CMS base_url（実行時導出） | `https://reiwa.casa` | `https://staging.reiwa.casa` |
| CMS 書き込み先 branch（実行時導出） | `main` | `staging` |

上記の環境値はリポジトリのファイルでは区別しない（main と staging でファイル内容は同一）。導出規則は4.6.4章（Issue #127）。

#### 2.5.4.1 ブランチ運用

```
main (本番)  ←── merge ── staging (テスト) ←── merge ── feature/*
     │                        ↑
     └── 定期マージ ──────────┘ (コンテンツ同期)
```

- 新機能: `feature/*` → `staging` へPR → テスト → `staging` → `main` へPR
- コンテンツ同期: `main` の記事更新を `staging` に定期マージ
- 環境固有値（SITE_URL・robots.txt・CMS の `branch` / `base_url`）はファイルに持たず導出するため、どちら向きのマージでも手動での値の戻しは不要（Issue #127。旧運用: `config.yml` 等を各ブランチで手動管理）。

#### 2.5.4.2 サイトURL動的化

`public/admin/index.html` 内のサイトURL参照（`addSiteLink`、`showPublicUrl`）と CMS の `base_url`（Issue #127、`/admin/cms-env.js`）は `window.location.origin` で動的取得する。これにより、本番（`reiwa.casa`）・テスト（`staging.reiwa.casa`）・ローカル開発（`localhost`）のいずれの環境でも正しいURLが表示される。

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
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
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
  loader: glob({ pattern: '*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    order: z.number().default(0),
    draft: z.boolean().optional().default(false),
    noindex: z.boolean().default(false),
  }),
});
```

> **注意**: Astro 7 の Content Layer ではエントリ識別子は `id`（ファイルパスから拡張子を除いた値）である。固定ページの URL は `page.id` を使う。frontmatter の `slug` は CMS のファイル名テンプレート（`{{fields.slug}}`）とテスト用であり、Zod スキーマには含めない（Decap は未設定項目を保存時に落とすため、CMS 側の slug フィールドは維持する）。Markdown 本文の描画は `render(entry)`（`astro:content`）を使う。

### 3.2.3 organize-posts.mjs の処理仕様

| 処理項目 | 内容 |
| :--- | :--- |
| 対象ディレクトリ | `src/content/posts/` |
| 入力 | 全`.md`ファイル（再帰スキャン） |
| 処理1 | frontmatterの`date`を解析し、`yyyy/mm/`ディレクトリを決定。frontmatterは`scripts/lib/safe-frontmatter.mjs`経由でYAMLのみ解析し（`src/content`を読むテストも同じラッパーを使う）、`---js`等のYAML以外は評価せず警告を出して対象外にする（SEC-29, Bug #52） |
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
  # branch / base_url はここに書かない（Issue #127・Bug #51）
  auth_endpoint: /auth
```

`auth_endpoint`はCloudflare Functionsの認証エンドポイントである。`branch`（書き込み先）と`base_url`（OAuth ポップアップを開くオリジン）は、`public/admin/index.html` が実行時に決めて渡す（Issue #127）:

1. Decap 読み込み前に `window.CMS_MANUAL_INIT = true` を設定し、`/admin/cms-env.js` を読み込む（`resolveCmsBackend(location)` を定義）。
2. `CMS.registerPreviewStyle()` の後で `CMS.init({ config: { backend: window.resolveCmsBackend(window.location) } })` を1回呼ぶ。
3. Decap は config.yml を読み込み、その上に init の config を deepmerge する（init 側が優先。3.16.2 配布物の `deepmerge(loadedYaml, manualConfig)` を確認済み）。

| 配信ホスト名 | branch | base_url |
|:---|:---|:---|
| `reiwa.casa`（完全一致） | `main` | `location.origin`（`https://reiwa.casa`） |
| それ以外（`staging.reiwa.casa`、`*.pages.dev`、`localhost`、未知のホスト） | `staging` | `location.origin` |

ホスト名→ブランチの対応は `cms-env.js` の `HOSTNAME_TO_BRANCH`（本番1件だけの許可リスト）に置き、admin/index.html には URL・ホスト名を書かない（CLAUDE.md の「admin/index.html に URL をハードコードしない」方針を維持。ホスト名は比較用の定数で、画面・通信に使う URL はすべて `location.origin` から作る）。`cms-env.js` が読めない場合は `CMS.init` が例外になり CMS は起動しない（誤ったブランチへは書き込まない）。`cms-env.js` は同一オリジンの `/admin/` 配下にあり、`/admin/*` の CSP `script-src 'self'` で許可される。

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
    sortable_fields:
      - { field: order, default_sort: asc }
      - title
```

- `slug`（pages）: `{{fields.slug}}` でフロントマターのslugフィールド値をファイル名に使用（`{{slug}}` はDecap CMSではタイトルのURL安全版を意味するため不可）
- `sortable_fields`（pages）: orderフィールドをデフォルトで昇順ソートに設定（`{field: order, default_sort: asc}`形式）。Decap CMS v3.10.0は`field`+`default_sort`のオブジェクト形式に対応（`default`プロパティは非対応）
- `sortable_fields`（posts）: dateフィールドをデフォルトで降順ソートに設定（`{field: date, default_sort: desc}`形式）。最新記事が一覧の先頭に表示される（CMS-17）
- `view_groups`（posts）: 記事一覧を年月（`\d{4}-\d{2}`パターン）でグルーピング表示（CMS-18）。`admin/index.html`で以下のUI改善を実施（CMS-19）: `activateDefaultGrouping()`でpostsコレクション表示時に自動有効化、`reverseViewGroups()`で降順並べ替え（`getSortKey()`でISO/日本語両形式対応）、`formatGroupHeadings()`で見出しを「2026年2月」形式に変換、`createMonthSelector()`で年月フィルターを作成（`aria-label="年月で絞り込み"`、899px以下で`min-height: 44px`、選択年月以外のグループは非表示）
- `path`（posts）: ファイルの保存・読み取りパスを定義。CMSがサブディレクトリ`yyyy/mm/`内の既存記事を再帰スキャンする
- `slug`（posts）: ファイル名部分のみ（タイトルベース）

---

## 3.4. 管理画面UIカスタマイズ

すべてのカスタマイズは`public/admin/index.html`に実装されている。

### 3.4.1 カスタマイズ対象と処理方式

```
┌───────────────────────────────────────────────────────┐
│               admin/index.html (1021行)                │
│                                                       │
│  ┌─────────────────┐  ┌────────────────────────────┐ │
│  │   CSS (Style)    │  │   JavaScript（単一IIFE）    │ │
│  │                 │  │   'use strict' / const/let │ │
│  │ PC向けスタイル    │  │                            │ │
│  │   日付バッジ     │  │ MutationObserver（単一、    │ │
│  │   削除ボタン色   │  │  RAFデバウンス済み）        │ │
│  │                 │  │   ├ addSiteLink            │ │
│  │ モバイル         │  │   ├ formatCollectionEntries│ │
│  │   (≤799px)      │  │   ├ relabelImageButtons   │ │
│  │   sticky header │  │   ├ updateDeleteButtonState│ │
│  │   ボトムシート   │  │   ├ showPublicUrl          │ │
│  │                 │  │   ├ manageDropdownOverlay │ │
│  │   2列グリッド    │  │   ├ hideCodeBlockOnMobile  │ │
│  │   44pxタップ領域 │  │   ├ activateDefaultGrouping│ │
│  │                 │  │   ├ reverseViewGroups      │ │
│  │                 │  │   ├ formatGroupHeadings    │ │
│  │                 │  │   ├ createMonthSelector    │ │
│  │                 │  │   └ restrictImageInputAccept│ │
│  │                 │  │                            │ │
│  │ iOS対応         │  │ hashchange リスナー        │ │
│  │   16px font     │  │   └ showPublicUrl再実行    │ │
│  │   image-orient. │  │                            │ │
│  │                 │  │ EXIF canvas補正（upload時） │ │
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
- フォントファミリー（-apple-system, ヒラギノ角ゴ等）、行間（グローバル: 1.8、記事本文: 1.9）、文字色（#333）
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

### 4.2.6 Git履歴からのエビデンスアーカイブ

大容量の過去エビデンスは、本人専用のGoogle Driveアーカイブへ退避し、Gitには復元に必要な最小索引を残す。公開索引 `evidence/archive-index.json` の1行は、`path`、`git_blob_sha1`、`sha256`、`size`、`storage_class`（`git` / `drive`）で構成し、Drive file ID・共有URL・個人情報は格納しない。索引形式は `node scripts/validate-evidence-archive-index.mjs` で検証する。pathのabsolute化、`.` / `..` segment、空segment、backslash、NUL、PII・URL・Drive ID様文字列を拒否する。

2026-09-24の履歴全体inventoryでは1,518個のpath/blob pairを特定した。うち1,395 pair（694 unique blob）はDriveへ移し、123 pairはGitに保持する。redaction済みの結果JSONは新しいGit blobとして追加するため、公開索引は1,519 entryとなる。これは「履歴全体のpair数」に新しいredacted blob entryを加えた数であり、Driveの既存758 pairを再コピーしない。全てのDrive移動対象は履歴全体でevidence外aliasがないことを確認する。HTMLが相対画像を参照する場合はHTML自体と画像を同じアーカイブへ保管し、復元後に相対参照のbrokenが0であることを確認する。

4.10.3章で必須としている新規 `report.html` と `work-completion-report.html` は、今後は本人専用Driveを正本として保存する。スクリーンショット・大容量メディア・画像埋込レポートはDriveに保管し、各ファイルの読戻し後にSHA-256を照合してから公開索引へ追加する。`verify-*.mjs` と `*-results.json` はGitで保持する。小さく画像埋込のない非レポートHTMLもGitに保持できる。過去日付フォルダのGit媒体を除去できるのは、Drive上の全件hash・readback・復元・HTML相対画像参照・索引更新が全てPASSした後だけとする。これは「過去日付エビデンスを上書き・削除しない」規則の限定例外である。

履歴書換えの手順:

1. GitHubの全heads・tagsを凍結し、GitHubのlive ref mapと一致すること、open PRが0件であることを確認する。`refs/pull/*` は読み取り専用のため更新対象と混同しない。
2. 事前bundleを作成し、SHA-256を記録する。Driveへ保管したbundleは転送partごとのSHA-256、結合後のbundle SHA-256、`git bundle verify`、別bare repositoryへの復元refsを照合する。
3. 全履歴のpath/blob inventoryを独立二方式で一致させ、Driveの復元manifestと全対象SHA-256、HTML相対画像参照、非evidence alias、keep対象を検証する。
4. すべてのheadsを隔離候補で書き換え、全コミットの個人情報、削除対象blob、author/committerカテゴリ、main/stagingのtree一致、全テストを検証する。
5. 最終ユーザー承認後に限り、凍結済みold OIDをleaseに使ったatomicなheads更新を実施する。`--mirror` は使わず、tagsが存在する場合は個別にレビューする。更新の失敗・一部反映・ref driftを検出した場合は追加pushを止める。
6. push後にlive refs、GitHub CI、Cloudflare Pages、本番・stagingの読取確認、fresh clone復元を実施する。読み取り専用PR refsが旧履歴を保持する場合は、その残存範囲とGitHub側の保持状態を記録し、解消済みと誤記しない。

バックアップbundleはGoogle Driveの本人専用領域に保管し、GitHub公開索引へDrive IDや非公開共有URLを記録しない。復旧時はbundleの全hashを照合してから別のbare repositoryへrefsを復元し、通常cloneへの復旧反映は内容を確認した後に行う。

---

## 4.3. フォーク転用ガイド

本プロジェクトを別サイト向けにフォークして転用する場合、以下の箇所を変更する必要がある。

### 4.3.1 サイト固有の変更箇所一覧

| No. | ファイル | 変更箇所 | 現在値 | 説明 |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `public/admin/config.yml` | `backend.repo` | `bickojima/my-blog` | GitHubリポジトリ名 |
| 2 | `public/admin/cms-env.js` / `src/lib/site-env.mjs` | 本番ホスト名 `HOSTNAME_TO_BRANCH` / `PRODUCTION_SITE_URL`・`STAGING_SITE_URL` | `reiwa.casa` / `https://reiwa.casa`・`https://staging.reiwa.casa` | 本番ドメイン（両ファイルの一致は env-derivation テストが検証。config.yml の base_url は廃止） |
| 3 | `src/layouts/Base.astro` | サイトタイトル | `tbiのブログ` | ヘッダー・フッターに表示される |
| 4 | `src/lib/site-env.mjs` | robots.txt の Sitemap URL（`buildRobotsTxt`） | `https://reiwa.casa/sitemap-index.xml` | サイトマップURL（`public/robots.txt` は廃止） |
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
| `src/plugins/rehype-image-caption.mjs` | 画像キャプション・遅延読込プラグイン |
| `src/plugins/rehype-focusable-code-blocks.mjs` | コードブロックのキーボード到達性プラグイン |
| `src/lib/posts.ts` | 汎用ロジック |
| `functions/auth/index.js` | 環境変数から取得 |
| `functions/auth/callback.js` | 環境変数から取得 |
| `tests/` | テストは設定値を動的に読み取る |

### 4.3.3 転用手順

1. リポジトリをフォークする
2. 4.3.1 の変更箇所一覧に従い各ファイルを更新する
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
| 16 | 2026-02-21 | sortable_fieldsプロパティ名エラー: `{field: order, default: true}`でCMS起動時にスキーマエラー | `default`プロパティが非対応。正しくは`default_sort: asc\|desc` | `{field: order, default_sort: asc}`に修正 | cms-config 2.4章 #40, #41, E-07 |
| 17 | 2026-02-21 | 要件ID・ドキュメント更新漏れ: デフォルトソート機能に要件ID（CMS-16）が付与されず、システム変更履歴・テスト基盤変更履歴・README改訂履歴が未更新のまま放置 | 機能実装時に要件ID付与とドキュメント履歴更新を同時に行わなかった | CMS-16追加、全履歴テーブル補完、再発防止テスト追加 | cms-config 2.4章 #42 |
| 18 | 2026-02-21 | XSS脆弱性（callback.js）: OAuthコールバックHTMLでトークン値を未エスケープでscriptタグに埋め込み。悪意あるレスポンスでスクリプト注入可能 | HTMLテンプレートリテラル内に値を直接展開 | `escapeForScript()`関数でHTML特殊文字・改行をエスケープ | auth-functions 2.3章 |
| 19 | 2026-02-21 | postMessageオリジン未検証（callback.js）: `postMessage("authorizing:github", "*")`でワイルドカード送信し、受信側でもオリジン検証なし | Decap CMS公式サンプルの踏襲 | `expectedOrigin`（サーバーサイド算出）で送信先を制限し、`event.origin`で受信元を検証 | auth-functions 2.3章 |
| 20 | 2026-02-21 | XSS脆弱性（admin/index.html showPublicUrl）: `innerHTML`で公開URLバーを構築しており、URLに含まれるスクリプトが実行される可能性 | innerHTML使用 | DOM API（createElement/textContent）に置換し、innerHTML使用を排除 | admin-html 2.6.6章 |
| 21 | 2026-02-21 | OAuthスコープ過剰（auth/index.js）: `scope=repo,user`でプライベートリポジトリ全アクセス権を含む不要な権限を要求 | 初期実装時の過剰設定 | `scope=public_repo,read:user`に最小化（公開リポジトリ操作+ユーザー情報読取のみ） | auth-functions 2.3章 |
| 22 | 2026-02-21 | CDNバージョン範囲指定（admin/index.html）: `decap-cms@^3.10.0`でキャレット範囲を使用しており、サプライチェーン攻撃で悪意あるバージョンが配信される可能性 | npmのキャレット構文をCDN URLにそのまま使用 | `decap-cms@3.10.0`に正確なバージョンを固定 | admin-html 2.6.1章 |
| 23 | 2026-02-21 | MutationObserver二重定義（admin/index.html）: 2つの独立したMutationObserverが存在し、片方はRAFデバウンスなし | 機能追加時の統合漏れ | 単一MutationObserverに統合し、全監視をRAFデバウンス付きで一元管理 | admin-html 2.6.6章 |
| 24 | 2026-02-21 | var/let/const混在（admin/index.html）: varとconst/letが混在し、変数スコープが不明確 | 段階的な機能追加でコーディングスタイルが統一されなかった | 全変数を'use strict'モードでconst/letに統一 | admin-html 2.6.6章 |
| 25 | 2026-02-21 | 固定ページorder値に負数(-1)設定可能: CMS config.ymlのorderフィールドにmin制約がなく、-1等の不正値が入力・保存可能。表示崩れやエラーの原因となる | config.ymlのnumberウィジェットにmin制約が未設定、Zodスキーマにも最小値チェックなし | 3層バリデーション: (1) config.yml min:1, (2) Zodスキーマ z.number().int().min(1), (3) admin/index.html 正規表現を負数対応(-?\d+)で防御的表示。既存データのorder=-1を1に修正 | fuzz-validation 2.7.1章, content-validation 2.1.4章, cms-config 2.4章 |
| 26 | 2026-02-21 | HTTPセキュリティヘッダー不足: HSTS/COOP/CORP/拡張Permissions-Policy等のMozilla Observatory A+評価に必要なヘッダーが未設定 | 初期構築時にOWASP推奨ヘッダーの網羅的設定を行わなかった | _headersファイルにHSTS(preload), COOP(same-origin), CORP(same-origin), X-DNS-Prefetch-Control(off), X-Permitted-Cross-Domain-Policies(none), Permissions-Policy(全不要API無効化)を追加 | fuzz-validation 2.7.8章, build 2.5.1章 |
| 27 | 2026-02-21 | iPhone記事保存失敗「TypeError: Load failed」: 4つのバグが複合。(1) コミット`295b44f`でSRI追加時に`</script>`閉じタグが脱落し、後続の`CMS.registerPreviewStyle`ブロックがCDNスクリプトのインライン内容としてHTMLパーサーに飲み込まれた。(2) コミット`a92ccbd`でCOOP `same-origin`を全ページに適用しOAuth popupの`window.opener`が`null`になり認証フロー破壊。(3) コミット`295b44f`でCSP `frame-ancestors 'none'`がCMSプレビューiframeを阻害。(4) 同コミットで`X-Frame-Options: DENY`が同上 | バグ#26修正（セキュリティヘッダー追加）とSRI追加（SEC-12）時に、管理画面（Decap CMS）固有の要件（OAuth popup: window.opener、プレビューiframe: frame-ancestors/X-Frame-Options）との互換性を検証しなかった。SRI追加時の単純な編集ミスで閉じタグ脱落 | (1) `</script>`閉じタグ復元。(2) /admin/*でCOOP: same-origin-allow-popupsにオーバーライド。(3) CSP frame-ancestors 'self'に変更。(4) /admin/*でX-Frame-Options: SAMEORIGINにオーバーライド。再発防止: CDNスクリプト閉じタグ自動テスト、管理画面ヘッダーオーバーライド自動テスト、CLAUDE.mdにヘッダー追加時の管理画面影響チェック義務化 | admin-html 2.6.1章, fuzz-validation 2.7.8章 |
| 28 | 2026-02-21 | iPhone記事保存失敗「TypeError: Load failed」（バグ#27修正不完全）: バグ#27の対策として`_headers`で`/admin/*`にCOOP/CORP/X-Frame-Optionsのオーバーライドを追加したが、Cloudflare Pagesは`/*`と`/admin/*`で同名ヘッダーを**オーバーライドではなくAppend（重複送信）する**。ブラウザは重複ヘッダーの最も厳しい値を採用するため、実質的にCOOP: same-origin（OAuth popup破壊）、X-Frame-Options: DENY（プレビューiframe破壊）、CORP: same-origin（CDNリソース制限）が適用され続けた | Cloudflare Pages `_headers`ファイルのヘッダーマージ仕様を誤解。同名ヘッダーが`/*`と`/admin/*`両方に存在する場合、より具体的なパスの値でオーバーライドされると想定したが、実際にはHTTPレスポンスに両方の値がAppendされる | (1) COOP/CORP/X-Frame-Optionsを`/*`セクションから完全削除。(2) これらのヘッダーは`/admin/*`セクションにのみ設定。(3) 非管理画面ページはこれらのヘッダーなし（公開ブログとして許容範囲）。再発防止: `_headers`ヘッダー重複検知テスト追加（build.test.mjs）、`/*`と`/admin/*`の同名ヘッダー禁止テスト追加（fuzz-validation）、CLAUDE.mdにCloudflare Pages `_headers`動作仕様を記載 | build 2.5.1章, fuzz-validation 2.7.8章 |
| 29 | 2026-02-21 | 画像付き記事保存失敗「TypeError: Load failed」: テキストのみの記事保存は成功するが、画像を含む記事の保存が失敗する。CSP `connect-src`に`blob:`が不足しており、Decap CMS v3.10.0が画像保存時に内部で実行する`fetch(blobURL)`がブラウザにブロックされる | Decap CMSは画像アップロード時に`URL.createObjectURL()`でblob: URLを生成し、エントリ永続化時に`fetch(blobURL).then(e => e.blob())`でファイルデータを読み戻す。CSP `connect-src`に`blob:`が含まれていないため、このfetchが`Refused to connect to 'blob:...'`エラーとなる。テキストのみの保存ではblob: URLのfetchが発生しないため成功する（GitHub Issue #6829） | CSP `connect-src`に`blob:`を追加。再発防止: CSP connect-src blob:検証テスト追加（build.test.mjs、fuzz-validation.test.mjs）、CLAUDE.mdにCSP connect-src要件を記載 | build 2.5.1章, fuzz-validation 2.7.8章 |
| 30 | 2026-02-23 | 下書き記事がビルド公開される: draft=trueの記事がgetStaticPathsでフィルタされておらず、静的生成され公開URLでアクセス可能 | getStaticPathsにdraftフィルタが未実装 | `.filter(post => !post.data.draft)`をgetStaticPathsに追加 | build 2.5章 |
| 31 | 2026-02-23 | モバイルドロップダウンhover/tapバグ: タッチデバイスでBase.astroのヘッダーナビドロップダウンが一瞬開いてすぐ閉じる | mouseenterイベントがタッチデバイスでもclickより先に発火し、is-openを追加→即座にmouseleaveで削除 | `(hover: hover)`メディアクエリでhover可能デバイスのみmouseenter/mouseleaveを登録 | content-validation ドロップダウンJS検証 |
| 32 | 2026-02-23 | CMS公開URLバーとモーダル重複: CMSのStyledModalダイアログ表示時に公開URLバーが重なり、z-index競合でUI操作不能 | manageDropdownOverlayがモーダルを検知していなかった | StyledModal検出ロジック追加、モーダル表示時にURLバーを退避 | E2E cms-operations |
| 33 | 2026-02-23 | タグURL未エンコード: 日本語タグのhref属性にencodeURIComponentが適用されておらず、一部ブラウザで正しく遷移できない可能性 | テンプレートでタグ文字列をそのままhrefに使用 | `encodeURIComponent(tag)`を追加（index.astro, [slug].astro） | build 2.5章（タグリンク存在検証） |
| 34 | 2026-02-23 | Windowsパスセパレータ問題: organize-posts.mjsのurl-map.json生成でpath.relativeがバックスラッシュを使用し、Windows環境でキー形式が不正 | path.relative()がOSのパスセパレータを使用 | `.replace(/\\\\/g, '/')`でurl-map.jsonキーを正規化。テストコードも同様に正規化 | build 2.5章（URLマッピング検証）, content-validation |
| 35 | 2026-02-23 | git履歴に個人情報（氏名・メールアドレス）が含まれていた: 100件のコミットにauthor/committer情報として個人のフルネーム・Gmailアドレスが記録されていた | gitのグローバル設定に個人メールアドレスが設定されており、リポジトリ固有の設定がなかった | (1) `git filter-branch --env-filter`で全履歴のauthor/committerを匿名化（tbi / noreply@users.noreply.github.com）。(2) ローカルgit設定（`git config user.name/user.email`）を匿名値に設定。(3) pre-commit hookで個人情報パターン検出時にコミット拒否。(4) CLAUDE.mdルール9に個人情報禁止を明文化 | 運用手順（4.8章） |
| 36 | 2026-02-24 | CMS CRUDエビデンスが全てログイン画面のみ表示: verify-cms-crud.mjsで取得した48枚のスクリーンショットが全てCMSログインボタン画面のみで、認証後の編集画面が撮影されていなかった | (1) Decap CMS OAuth認証は3ステップハンドシェイク（`authorizing:github` → ACK → `authorization:github:success:{token,provider}`）を要するが、エビデンス収集スクリプトはステップ1-2を省略してトークンを直接送信していたためCMSがメッセージを無視。(2) Playwrightの`page.route()`はポップアップウィンドウのナビゲーションをインターセプトできない（`context.route()`が必要）。(3) globパターン`**/auth`はクエリパラメータ付きURLにマッチしない。(4) config.ymlの`base_url`がstaging URLのままだとlocalhost上のpostMessageがクロスオリジン拒否される | (1) 3ステップOAuthハンドシェイクを完全実装（`context.route()`でポップアップをインターセプトし、`authorizing:github`→ACK待機→`authorization:github:success`の3段階を再現）。(2) `page.route()`→`context.route()`に変更。(3) glob→関数マッチャー（`url => url.pathname === '/auth'`）に変更。(4) GitHub API モックのルート登録順序をLIFO対応（catch-all先登録→具体ルート後登録）に修正。(5) エビデンス提出前の社内レビュー義務化（CLAUDE.mdルール11追加） | verify-cms-crud.mjs, CLAUDE.md |
| 37 | 2026-05-22 | CMS年月選択プルダウンがフィルターとして動作しない: CMS-19の年月セレクターが選択年月のみ表示ではなく、該当見出しへスクロールするだけだった | 要件定義で「年月選択」がフィルターかジャンプか曖昧なまま実装され、admin-htmlテストも`scrollIntoView`の存在確認に留まっていた | CMS-19要件を「年月選択プルダウンで選択年月のみ表示」に明確化。`createMonthSelector()`に`applyMonthFilter()`を追加し、選択年月以外のグループコンテナを`display:none`にする | admin-html 2.6.6章 #14, verify-cms19-month-filter.mjs |
| 38 | 2026-05-24 | CMS年月フィルター操作時に管理画面がハングアップする: 月セレクターを開いて年月を選ぼうとするとChromeが固まる | `MutationObserver`の再実行ごとに`createMonthSelector()`が`sel.textContent = ''`でoptionを全再構築していた。ネイティブselectを開いている最中にoption DOMを差し替えるため、ブラウザのselect UIとDecap CMSの再描画が競合した | `optionsSignature`でグループ見出し構成を記録し、見出しが変わった時だけoptionを再構築する。フィルター適用は毎回現在DOMを再取得して実行し、React再描画後の追従とselect操作安定性を両立する | admin-html 2.6.6章 #14, verify-cms19-month-filter.mjs |
| 39 | 2026-05-25 | CMS管理画面モバイルのタップ領域不足（WCAG 2.5.5違反）: 「新規作成」ボタン（h=27px）、コレクションToolbarの「ソート」ボタン（h=27px）、AppHeaderのアイコンボタン（h=24px）等がモバイル推奨44pxを下回り、タッチ操作の精度不足を招く。iPad Pro 11（834px）ではモバイル用CSSブレークポイント（max-width: 799px）が適用されず、既存min-heightルールが無効 | `@media (max-width: 799px)` ブレークポイントがiPad Pro 11のビューポート幅834pxより小さいため、CollectionTopNewButton・ソートボタン（`[role="button"][aria-haspopup]`）・AppHeaderButtonにmin-height: 44pxが適用されなかった | `@media (max-width: 899px)` の新ブレークポイントを追加し、CollectionTopNewButton・CollectionTop内のbutton/[role="button"]・AppHeaderButton・ViewControls内ボタン・`[role="button"][aria-haspopup]`すべてに`min-height: 44px; min-width: 44px`を適用。iPadとiPhone両デバイスで全ボタン≥44pxを確認 | verify-comprehensive.mjs T28 |
| 40 | 2026-06-11 | Modern Web Guidance遵守レビューF-1〜F-10: 初期表示内`content-visibility`、ナビEscape/フォーカス離脱未対応、公開サイト/CMS月セレクターの小さいタップ領域、CMSセレクター名・管理画面lang・navラベル、本文リンク識別、コードブロック到達性、サムネイル属性に不備 | 初回対応が属性存在の静的確認中心で、デバイス別初期表示範囲・キーボード離脱・独自UI追加後のa11y横断確認が不足 | 実測に基づき7枚目以降へ描画最適化を限定、現行ドロップダウンへEscape/focusout追加、899px幅またはタッチ入力で44px化、CMS/本文/rehype/画像属性を修正 | build/content-validation/admin-html/rehype-focusable-code-blocks, E-05/E-21/E-37, evidence/2026-06-11 |
| 41 | 2026-07-04 | staging環境のrobots.txtが`Allow: /`＋誤ドメイン（`bickojima.com`）のSitemapになっていた: #81対応（site/canonical設定）の実装中に別エージェントへ引き継ぎが発生し、引き継ぎ後のマージで2.5.4章の環境別方針（staging=`Disallow: /`）に反していた | 引き継ぎ時にstaging/main環境別のrobots.txt方針（本節参照）がレビューされず、既存のドメイン誤り（bickojima.com、包括的リファクタリング#80で修正済みだったはずの内容）が再混入した。robots.txtの内容（Allow/Disallow）を検証するテストが存在せず、存在確認（`robots.txtが存在する`）のみだったため回帰を検知できなかった | staging用`public/robots.txt`を`Disallow: /`のみに修正（Sitemap行はmainマージ時に`https://reiwa.casa/sitemap-index.xml`で追加する運用に統一）。build.test.mjsに内容検証テストを2件追加（Disallow必須・Allow禁止、Sitemapドメイン検証） | build.test.mjs（robots.txt内容検証2件） |
| 42 | 2026-07-04 | 記事一覧ページネーション（#89対応）で1ページ目が`/`と`/page/1/`の2URLに重複生成され、`/page/1/`側もsitemapに登録される重複コンテンツ状態になっていた | `src/pages/page/[page].astro`の`getStaticPaths`が`paginate()`の結果をフィルタせずそのまま返しており、`params.page === '1'`のページ（1ページ目）も生成対象に含まれていた。ページネーション機能に対するテストが存在せず検知できなかった | `getStaticPaths`に`.filter((p) => p.params.page !== '1')`を追加し、1ページ目は`/`のみが担うよう修正。build.test.mjsに重複防止検証テストを4件追加（2.5.7章） | build.test.mjs（2.5.7章、4件） |
| 43 | 2026-07-05 | ダークモード対応（#88）のSleek Slate Blue配色刷新で、ライトモードの本文リンク色`--color-link: #0284c7`が背景`#f8fafc`に対してコントラスト比3.91:1となり、WCAG AA基準（通常文字4.5:1）を下回っていた（FR-17/NFR-08違反）。現在の公開記事・固定ページは本文中に画像リンクのみでテキストリンクが存在しないため、レンダリング上は顕在化していなかった | FR-17の再発防止テスト（`本文リンクに下線・識別色・focus-visibleが定義されている`）が配色トークン導入時に`color: var(--color-link)`という記法の存在確認へ緩和され、トークンの実際の色値が変わってもテストを検知できなくなっていた。実コンテンツにテキストリンクがなくaxe-coreのcolor-contrastルールも発火しなかった | `--color-link`/`--color-focus`をライトモードのみ`#0284c7`→`#0369a1`（コントラスト比5.67:1）に変更。build.test.mjsにCSSカスタムプロパティの実値からWCAG相対輝度・コントラスト比を計算し4.5:1以上を検証する回帰テストを追加（パターンマッチではなく計算による検証） | build.test.mjs（本文リンク色コントラスト比検証、ライト/ダーク各1件） |
| 44 | 2026-07-05 | E-36テスト（tests/e2e/cms-operations.spec.ts）のスクリーンショット出力先が`evidence/2026-02-24/screenshots/e36-*-${deviceName}.png`という過去日付固定パスでハードコードされており、`npm run test:e2e`を実行するたびに2026-02-24時点のエビデンス画像9枚（default-sort/view-groups/layout × PC/iPad/iPhone）が「実行日の結果」で上書きされ、エビデンス格納規約（過去日付フォルダを上書きしない）に違反していた | E-36テスト実装時（2026-02-24）にその場のエビデンス取得を目的として`evidence/`配下への直書きを行い、以降のリグレッション実行でも同じ固定パスへ書き続ける設計になっていた。エビデンス生成は本来`verify-*.mjs`スクリプトが実行日ディレクトリへ出力する専用の仕組みであり、通常のPlaywright回帰スイートが恒久的なエビデンスパスへ書き込むべきではなかった | 3箇所のスクリーンショット出力先を`evidence/2026-02-24/screenshots/...`から`test-results/e36-*-${deviceName}.png`（gitignore対象、テスト実行時の一時キャプチャ用）に変更。`grep -rn "evidence/20" tests/e2e/`で他のe2eスペックに同様のハードコードがないことを確認済み | tests/e2e/cms-operations.spec.ts（E-36、3件） |
| 45 | 2026-08-09 | Bug #41の再発防止テスト（`staging環境のrobots.txtはDisallow: /でインデックスを防止する`）がブランチ非依存で`Disallow: /`必須・`Allow: /`禁止を検証していたため、2.5.4章・4.6.4章が定めるmain側の正しい設定（`Allow: /` + `Sitemap:`行）にすると`npm test`が必ず失敗し、4.6.1章のマージ手順（手順5でmainのテストを実行）を完了できない状態になっていた。結果としてmainブランチのrobots.txtがstaging値（`Disallow: /`）のまま放置され、本番サイトが全検索エンジンからインデックス拒否される状態が継続していた（FR-25 サイトマップ・OGP等のSEO施策が無効化） | Bug #41の修正時にstaging側の期待値のみをテスト化し、環境別方針（staging=`Disallow`／main=`Allow`+`Sitemap`）の分岐を実装しなかった。`base_urlがブランチに対応するURLに設定されている`（cms-config.test.mjs）のような既存のブランチ判定パターンが横展開されていなかった | `astro.config.mjs`の`SITE_URL`からブランチを判定し、staging時は`Disallow: /`かつ`Allow: /`・`Sitemap:`なし、main時は`Allow: /`かつ`Disallow: /`なし・`Sitemap: https://reiwa.casa/sitemap-index.xml`を検証するブランチ対応テストへ修正。mainマージ時にrobots.txtを4.6.4章どおりの本番値へ切り替える | build.test.mjs（robots.txt環境別ポリシー検証） |
| 46 | 2026-08-11 | リポジトリ内に未追跡の`.claude/worktrees/`があると、`npm run build`のVitestが別worktreeとその`node_modules`内の外部パッケージテストまで収集し、160ファイルが失敗する | `vitest.config.ts`が除外指定だけで、プロジェクトテストの包含範囲を明示していなかった。`node_modules/**`はリポジトリ直下だけを想定し、任意のネスト配下を防げなかった | `include: ['tests/**/*.test.mjs']`で単体・統合テストの探索範囲を明示し、外部worktree・依存パッケージ・Playwright specを収集不能にする | build.test.mjs（Vitest探索範囲検証） |
| 47 | 2026-08-11 | Playwright全444件の並列実行時、E-28「新規記事画面で日付フィールドが入力可能である」が初回30秒でタイムアウトし、リトライでは21秒で成功してflaky判定になった | OAuthモック、Decap CMS初期化、新規記事エディタ遷移を含むE-28が全体既定30秒を使用しており、5 worker並列時のCDN読込・CPU負荷の余裕がなかった | E-28 describeのタイムアウトを60秒に明示し、通常所要約21秒を維持しつつ一時的な並列負荷を許容する | build.test.mjs（E-28タイムアウト設定検証）、Playwright E-28複数回実行 |
| 48 | 2026-09-20 | 下書き記事（`draft: true`）のslugが`public/admin/url-map.json`に含まれていた: CMSエディタの「公開URLを見る」機能が参照するurl-map.jsonを`organize-posts.mjs`が全記事から生成しており、下書き記事のslugと生成予定URLも含まれていた。加えて`gray-matter`のfront-matter解析エンジンが明示指定されておらず、YAML以外のエンジン（内部的に`eval`相当を実行しうる組み込みjavascriptエンジン）が暗黙に有効化されうる状態だった（監査Issue #114、深刻度low） | organize-posts.mjs実装時にurl-map.jsonの生成対象を「公開記事のみ」に絞る要件が明文化されず、`getStaticPaths`側の`.filter(post => !post.data.draft)`（SEC-21, Bug #30）と同等のフィルタがurl-map.json生成経路に横展開されていなかった。gray-matterはデフォルトでフロントマター内`engines`指定を許容するため、呼び出し側で明示的に`{ language: 'yaml' }`を指定しない限りYAML以外のパーサーが選択されうる余地が残っていた | (1) `organize-posts.mjs`のurl-map.json生成ループに`draft: true`記事の除外フィルタを追加。(2) `matter(content, { language: 'yaml' })`を明示指定し、YAML以外のエンジン選択を遮断。再発防止: url-map.jsonに下書きslugが含まれないことを検証するテストを追加し、下書き除外が過剰でないこと（公開記事のslugが全て含まれること）も併せて検証する | build.test.mjs（`下書き記事がurl-map.jsonに含まれていない（SEC-29, Bug #48 再発防止）`, `公開記事のslugが全てurl-map.jsonに含まれている`） |
| 49 | 2026-09-20 | `_headers`の`/*`と`/admin/*`両方にCross-Origin-Opener-Policy / Cross-Origin-Resource-Policy / X-Frame-Optionsが定義されており、Cloudflare Pagesの同名ヘッダーAppend仕様（Bug #28で判明済みの仕様）により本番`/admin/`で各ヘッダーが2回送出されることを`curl -sI https://reiwa.casa/admin/`で実測確認した（`https://reiwa.casa/`では各1回）。COOP等はRFC 8941 Structured Headerであり、重複値がカンマ結合されるとitemパースに失敗し無効な値として扱われる（＝`unsafe-none`等へのフォールバック）蓋然性が高い。ただし、ブラウザが実際にどう解決したかは未観測であり、これは「決定的事実」ではなく「リード（要検証所見）」である（詳細: `docs/security/audit-run2-needs-validation.md`）。対応Issue: #115 | Bug #28対策時に「`/*`と`/admin/*`で同一値なら重複送信されても安全」という設計判断（旧SEC-23の記述）を採用し、公開ページにも管理画面と同一値のCOOP/CORP/X-Frame-Optionsを`/*`に追加した。しかしCloudflare Pagesのヘッダー結合はオーバーライドではなく単純なAppendであるため、「同一値なら安全」という前提はCOOP/CORP等のStructured Header（カンマ結合で複数値になった時点でパース仕様上不正になりうる）には成立しなかった。この観点は`_headers`ヘッダー重複防止検証（Bug #28再発防止）の既存テストでもガード条件（`if (globalVal && adminVal)`）に隠れて長らく実効的に検証されていなかった | `/admin/*`セクションからCross-Origin-Opener-Policy / Cross-Origin-Resource-Policy / X-Frame-Optionsの再定義を削除し、`/*`からの継承一本化に設計変更した（管理画面が必要とする値は`/*`側にのみ定義する）。重複を解消することで、ブラウザの実解決結果によらず本懸念を無条件に除去できる。再発防止: (1) `/admin/*`にこれら3ヘッダーが存在しないことを検証するテストへ更新（build.test.mjs, fuzz-validation.test.mjs）。(2) 旧テストのガード条件（両方の値が存在する場合のみ検証）を撤廃し、アサーションが必ず実行される形に書き換え | build.test.mjs（`X-Frame-Optionsは/admin/*で再定義されず/*から継承される（Issue #115, Bug #49）`ほか）、fuzz-validation.test.mjs（`COOP/CORP/X-Frame-Options は /admin/* で再定義されず /* から継承される（Bug #28 再発防止・Issue #115/Bug #49で設計変更）`ほか） |
| 50 | 2026-09-20 | セキュリティ監査run-2の本番反映で、ローカル Playwright E2E 全件（3デバイス）と包括エビデンスを完了せずに main へマージした。CI の Vitest 成功と staging CMS 実ログインをもって完了扱いし、E2E を「プロセス負債」として後回しにした | 4.6.2章が E2E を「可能な場合」と任意化し、マージ後手順も `npm test`（Vitest）のみだった。Playwright は CI 未実行（実行時間のためローカル運用）であるため、「CI が緑＝テスト完了」と読み替えられた。ユーザーの staging ログイン確認と「やりきる」指示が、未完了の E2E を免除すると解釈された | 4.6章から「可能な場合」を削除し、ローカル `npm run test:e2e` 全件と `verify-comprehensive.mjs` を main マージの必須条件にする。**CI に Playwright は載せない**（Q23）。Vitest 成功・CMS 実ログイン・「後で E2E」は代替にならないと明文化。雛形スクリプトはシナリオ FAIL で `process.exit(1)` する。再発防止テストで CI ワークフローと手順文書を固定する | build.test.mjs（`CI は Vitest とビルドのみで Playwright E2E を必須化しない（Bug #50）`ほか2件） |
| 51 | 2026-09-20 | PR #119 のマージにより staging ブランチの環境固有ファイルが main の値で丸ごと上書きされた: `public/admin/config.yml` の `branch`（`staging`→`main`）・`base_url`（`https://staging.reiwa.casa`→`https://reiwa.casa`）、`astro.config.mjs` の `SITE_URL`（`https://staging.reiwa.casa`→`https://reiwa.casa`）、`public/robots.txt`（`Disallow: /`→`Allow: /` + 本番sitemap行）の4項目が同時に main 値へ変わった。結果として staging の CMS 管理画面で記事を保存すると本番 main ブランチへ直接コミットされる状態になり、staging の `robots.txt` も検索インデックス可能になった。上書きは22:26:18のマージで発生し、22:47:40の復旧コミット `0a6c762` まで約21分間継続した。実害の報告はない | マージ作業がPRのマージ方向（マージ元→マージ先のファイル差分をそのまま採用する操作）の副作用で環境固有ファイルを巻き込んだ。上書き後の4項目（config.ymlのbranch/base_url、SITE_URL、robots.txt）はすべてmain値で揃っており内部的には完全に整合していたため、当時存在した「4項目が互いに整合しているか」だけを見る既存テスト（cms-config.test.mjsのbase_url検証等）では検知できなかった。実際にチェックアウトしているブランチに対して値が正しいかを検証する仕組みが存在しなかった | （初期対策 2026-09-21）実際にチェックアウトしているブランチに対して4項目が正しい値かを検証する回帰テスト（旧 SEC-35）を追加。（恒久対策 2026-09-23, Issue #127）4項目をファイルから削除し、ビルド時は `CF_PAGES_BRANCH`、CMS は配信ホスト名から導出する構造に変更。main と staging のファイル差分がゼロになり、マージで持ち込まれる値そのものが存在しない。旧 SEC-35 は検知のみで CI の pull_request では判定不能側に倒れていたため、導出結果の正しさを検証するテストへ改訂（SEC-35 改訂、SEC-127A 仮ID） | cms-config.test.mjs（`環境固有値の導出整合性検証（SEC-35 改訂, Bug #51再発防止, Issue #127）`）、env-derivation.test.mjs、build.test.mjs（`CF_PAGES_BRANCH 別ビルドの環境値`）、E2E cms-env-branch.spec.ts |
| 52 | 2026-09-23 | SEC-29（Bug #48 対策）で「gray-matter の javascript エンジンを無効化する」として入れた `matter(content, { language: 'yaml' })` が効いていなかった: frontmatter が `---js`（`---javascript`/`---JS` も同様）で始まる記事を `organize-posts.mjs` が処理すると、gray-matter の javascript エンジン（`eval`）でペイロードが実行される。旧版で実行・新版で非実行を実測。Issue #117 項目1は「完了」と記録されていたが誤りだった。**第2の経路（レビュー差し戻しで判明）**: Cloudflare Pages のビルドコマンド `npm run build` は organize-posts より前に `vitest run --exclude tests/build.test.mjs` を実行し、`content-validation`・`cms-config`・`fuzz-validation`・`build`（CI のみ）の各テストと E2E `app-info.spec.ts` が全記事・固定ページを gray-matter の `matter()` で直接解析していた。このため `---js` 記事は Pages のビルド環境と CI で organize-posts より先に eval される（修正前、一時的な `---js` 記事を置いて `npx vitest run tests/content-validation.test.mjs` を実行し、ペイロードがマーカーファイルを作ることを実測）。Astro 本体のコンテンツローダー（`@astrojs/internal-helpers/frontmatter`）は `---`/`+++` を js-yaml の `load`／TOML でのみ解析するため `---js` は YAML エラーになり eval されない（実測: ビルド失敗・マーカー非作成）。能力の増加は無い（到達主体は既にリポジトリ書込権限または CI 上の任意コード実行を持つ）ため脆弱性ではなく hardening の実装不備 | gray-matter は `language` オプションより開始区切り直後の言語宣言を優先し（`index.js` parseMatter）、`engines` は置換ではなくマージされる（`lib/defaults.js`）。修正時にオプションの字面だけで効果を判断し、`---js` を実際に投入する挙動テストを書かなかった。さらに修正範囲を organize-posts に限定し、同じライブラリで同じ入力（`src/content`）を読む他の呼び出し元（テスト群）を洗い出さなかった | `scripts/lib/safe-frontmatter.mjs` で javascript/json エンジンを「必ず例外を投げるエンジン」で上書きし、`organize-posts.mjs` と、`src/content` を読む全テスト（`content-validation`・`cms-config`・`fuzz-validation`・`build`・E2E `app-info.spec.ts`）をこのラッパー経由に置換。tests/ と scripts/ ではラッパー以外の gray-matter 読み込みを禁止する。例外は既存の catch で当該記事を対象外にして継続 | security-hardening.test.mjs（`frontmatter は YAML のみを解析する（SEC-29, Bug #52 再発防止, Issue #117 項目1）` 10件。うち1件は一時ディレクトリで organize-posts.mjs を実行しペイロード非実行を確認、2件は tests/・scripts/ の gray-matter 直接読み込み禁止と `src/content` 読み取り箇所のラッパー経由を静的検証） |
| 53 | 2026-09-24 | PR #151 のマージ後、mainに許可されていないcommit author metadataを含む新規コミットが入った。既存の内容テストとローカルhookでは、PRやCMS経由で追加されたGit metadataを止められなかった | main/stagingへ入るcommit metadataをCIで検証するゲートがなく、ローカルhookはGitHub上の操作へ適用されなかった | SEC-42としてPR差分とmain/staging push差分のauthor/committerを固定allowlistで検査する。force-pushとbefore SHA不在時は新HEAD全履歴を検査し、不許可値はログへ出さない。Dependabotの公式bot identityは個別tupleで許可する | `tests/commit-identities.test.mjs`（TEST-REPORT 2.11章） |

Bug #53 の5 Whys: (1) なぜ許可外metadataがmainへ入ったか—PRマージcommitのauthor/committerを検査しなかった。(2) なぜ検査しなかったか—CIは内容とビルドだけを検証していた。(3) なぜ内容検証で防げなかったか—Git identityはファイル内容ではない。(4) なぜローカルhookで防げなかったか—GitHub上のPR作成・マージやCMS経由のcommitにはローカルhookが適用されない。(5) なぜ再発可能だったか—main/stagingへ入る差分をサーバー側で検査する統制がなかった。SEC-42のCIゲートを追加し、通常差分・force-push・base SHA欠損を別々に監査する。

| P127-1（仮番号・マージ時採番調整） | 2026-09-23 | iPhone 14 エミュレーション（Playwright Chromium）で記事編集画面の「公開」ボタンを押すと、メニュー（公開する／公開して新規作成／公開して複製する）がレイアウト幅 800px・表示領域外（y≈1238、表示領域の高さ 664）に描画され、タップ（クリック）が届かない。Issue #127 の E2E 実装中に発見。**変更前の staging（fc4fb3b）のビルドでも同じ位置に描画されることを確認済み**で、Issue #127 の変更による退行ではない。実機 iOS Safari では未確認 | 未調査（推測: モバイル向けボトムシート CSS〔`position: fixed; bottom: 0`〕が、transform 等で包含ブロックが変わる祖先要素の中で効き、表示領域ではなくエディタ要素基準で配置されている可能性） | **未修正**（1セッション1系統のため別 Issue で扱う）。Issue #127 の E2E・エビデンスでは iPhone のみメニュー項目をキーボード（Enter）で選択し、その旨を結果に記録している | （未作成。別 Issue で再現テストを追加する） |
| P127-2（仮番号・マージ時採番調整） | 2026-09-23 | CMS 系 E2E スペック（window.open モンキーパッチ方式）の多くが、実際には**ログイン未完了のまま**実行されていた。モンキーパッチは `window.location.origin`（localhost）から postMessage するが、Decap は config.yml の `base_url`（staging/本番の URL）のオリジンからのメッセージしか受け付けないため、認証が成立しない。各テストは「要素が無ければ別の弱い条件で PASS」の分岐を持つため失敗として表に出なかった。Issue #127 で base_url が `location.origin` になり認証が実際に成立した結果、E-39「固定ページのorderフィールドはmin=1の数値フィールドである」が3デバイスで失敗して発覚した（認証後のエディタ画面では `body` の高さが0になり、フォールバック分岐の `body.isVisible()` が false）。変更前の staging（fc4fb3b）のビルドで、同じモンキーパッチでは記事一覧まで到達しないことを確認済み | (1) テスト側の認証方式が config.yml の base_url と localhost のオリジン差に依存していた（スタンドアロン証跡スクリプトは config.yml を一時書き換えて回避していたが、spec 側は回避していなかった）。(2) 認証が成立したことを必須条件にせず、未認証でも PASS する分岐を持たせていた。(3) 「認証後の画面が撮れているか」の社内レビュー規定は証跡スクリプト向けで、spec の合否には効いていなかった | Issue #127 で base_url が配信オリジンから導出され、spec でも認証が成立するようになった（構造的に解消）。E-39 は数値フィールドの表示・min=1・編集可を必須で検証する形に書き換えた。**他の CMS spec に残る「未認証でも PASS する分岐」の見直しは未着手**（別 Issue で扱う。Issue #127 の範囲では、認証が成立した状態で全件 PASS することを確認） | cms-exploratory.spec.ts E-39（書き換え）、cms-env-branch.spec.ts E-47（ログイン後の一覧表示を必須で待つ） |

**Bug #46 5 Whys:**

1. なぜビルドが失敗したか: Vitestが`.claude/worktrees/`配下の外部テストを実行したため。
2. なぜ外部テストを収集したか: テスト対象の`include`がなく、既定パターンがリポジトリ全体へ適用されたため。
3. なぜ`exclude`で防げなかったか: `node_modules/**`が任意階層のworktree内`node_modules`を確実に除外する設計ではなかったため。
4. なぜ事前に検知できなかったか: CIと通常開発環境にはリポジトリ内worktreeがなく、探索境界を検証するテストもなかったため。
5. なぜ環境依存になったか: 除外対象を列挙する方式で、許可するテストディレクトリを限定する最小権限設計になっていなかったため。

根本対策は除外追加ではなく、`tests/**/*.test.mjs`だけを許可する包含指定とする。

**Bug #47 5 Whys:**

1. なぜflakyになったか: E-28の日付入力テストが初回だけ30秒でタイムアウトしたため。
2. なぜ30秒へ到達したか: OAuthモック、CMS初期化、エディタ遷移、固定待機を同一テストで行っていたため。
3. なぜリトライでは成功したか: CDNキャッシュと実行負荷が安定し、同じ処理が約21秒で完了したため。
4. なぜ負荷変動を許容できなかったか: CMS実操作テストに全体既定30秒をそのまま適用していたため。
5. なぜ事前に検知できなかったか: 単独・低負荷実行では30秒未満で、444件・5 workerの全体実行時だけ余裕不足が顕在化したため。

根本対策はリトライ依存ではなく、CMS初期化を含むE-28の実測に基づいて60秒の上限を明示し、複数回実行で安定性を確認することとする。

**Bug #48 5 Whys:**

1. なぜ下書き記事のslugがurl-map.jsonに含まれていたか: `organize-posts.mjs`のurl-map.json生成処理が、記事の`draft`フラグを見ずに全記事を対象にしていたため。
2. なぜdraftフラグを見ていなかったか: url-map.jsonの用途（CMSエディタの「公開URLを見る」機能向け）を実装した時点で、下書き記事はそもそも表示対象外という前提を暗黙に置いており、明示的なフィルタ要件として文書化・実装しなかったため。
3. なぜ`getStaticPaths`の`.filter(post => !post.data.draft)`（SEC-21, Bug #30）と同じ考え方が横展開されなかったか: url-map.json生成はAstroのビルドパイプラインとは別の独立スクリプト（`organize-posts.mjs`）であり、SEC-21対応時にコードレビューの対象範囲に含まれなかったため。
4. なぜgray-matterのエンジン未指定が問題になるか: gray-matterはfront-matter内の`engines`指定によって解析エンジンを切り替え可能で、明示的に`language: 'yaml'`を指定しない場合、悪意あるfront-matterが組み込みjavascriptエンジン（内部的に`eval`相当）を選択させる余地が理論上残るため。
5. なぜ今まで顕在化しなかったか: 記事はCMS経由（Decap CMS）でのみ作成され、直接ファイルシステムへ任意のfront-matterを書き込む経路が想定利用者に開放されていなかったため（監査は防御的多層化としてlow深刻度で指摘）。

根本対策は「公開対象のみを生成する」という原則をビルドパイプライン全体（Astro側・スクリプト側の両方）で横展開することと、外部入力を解析する全箇所でパーサーのエンジン・オプションを明示指定することである。

**Bug #49 5 Whys:**

1. なぜCOOP/CORP/X-Frame-Optionsが本番で重複送出されたか: `_headers`の`/*`と`/admin/*`の両方に同名ヘッダーが定義されていたため（`curl -sI https://reiwa.casa/admin/`で各ヘッダー2回送出を実測確認）。
2. なぜ`/*`にも管理画面と同一値を定義したか: Bug #28対応時に「異なる値の重複は危険だが、同一値の重複は安全」という設計判断（旧SEC-23）を採用し、公開ページにも管理画面と同一値のCOOP/CORP/X-Frame-Optionsを追加したため。
3. なぜ「同一値なら安全」という前提が誤りだったか: Cloudflare PagesのApp仕様は値の比較を行わず単純にAppendするため、COOP等のRFC 8941 Structured Headerは同一値であってもカンマ結合されて複数値になり、item形式のパースに失敗しうるため（値が同じかどうかは仕様上考慮されない）。
4. なぜこの問題が既存テストで検知されなかったか: 既存の重複検証テスト（Bug #28再発防止）が`if (globalVal && adminVal)`というガード条件を持ち、両方に値が存在する場合しかアサーションを実行しない実装だったため、「値が一致していれば何も検証せず通過する」空のテストになっていた。
5. なぜガード条件付きの実装がレビューで見過ごされたか: テスト名（「同一値の重複は安全」）が当時の設計方針をそのまま表現しており、テストの中身（ガード条件が常に成立しアサーション未実行になるケース）まで検証されなかったため。

根本対策はガード条件付きの検証をやめ、常にアサーションが実行される形に書き換えることと、ヘッダー設計を「重複してもよい値を選ぶ」から「重複自体をなくす（片方でのみ定義する）」に変更することである。ブラウザが実際にCOOPをどう解決していたか（`unsafe-none`へのフォールバックが発生していたか）はcurl実測の範囲を超えるため確定できないが、重複を解消したことで実効値を変えずにこの懸念を無条件に除去できる。

**Bug #50 5 Whys:**

1. なぜ E2E なしで本番へ出たか: main マージを CI の Vitest 成功と staging CMS 実ログインで完了扱いし、ローカル Playwright 全件を「プロセス負債」として後回しにしたため。
2. なぜ後回しが通ったか: 4.6.2章が E2E を「可能な場合」と任意化し、マージ後手順も `npm test`（Vitest）だけだったため。
3. なぜ「可能な場合」と書いたか: Playwright は実行時間が長く CI に載せていない（ローカル運用）ため、CI 未実行＝省略可と読まれたため。
4. なぜエージェントが省略したか: ユーザーの staging ログイン確認と「やりきる」指示を、未完了 E2E の免除と解釈したため。CMS 実ログインは OAuth 経路の確認であり、3デバイス全件 E2E の代替ではない。
5. なぜ手順逸脱をテストが止めなかったか: マージ手順の必須条件を固定する回帰テストがなく、CI が緑ならゲート通過とみなせたため。

根本対策は E2E を CI 必須にすることではない（Q23）。ローカル `npm run test:e2e` 全件を main マージの必須条件にし、**CI に Playwright は載せない**方針を手順と Vitest で固定する。Vitest 成功・CMS 実ログイン・「後で E2E」は代替にならない。

**Bug #51 5 Whys:**

1. なぜ staging の CMS が本番 main ブランチへ直接コミットする状態になったか: PR #119 のマージで `public/admin/config.yml` の `branch` が `staging` から `main` に上書きされたため。
2. なぜ `branch` だけでなく `base_url`・`SITE_URL`・`robots.txt` も同時に main 値へ変わったか: これら4項目はいずれも「マージ元とマージ先で意図的に異なる値を持つ」環境固有ファイルであり、通常のマージ操作（差分の機械的な採用）では区別されず、まとめて上書き対象になったため。
3. なぜ事前に検知できなかったか: 当時の `cms-config.test.mjs` の検証（`base_urlがブランチに対応するURLに設定されている`）は「config.yml内の branch と base_url が一致しているか」という**ファイル内部の整合性**しか見ておらず、上書き後の4項目はすべてmain値で揃っていたため、この内部整合チェックには合格してしまったため。
4. なぜ内部整合チェックだけでは不十分だったか: 「4項目が互いに整合している」ことと「4項目が今チェックアウトしているブランチに対して正しい」ことは別の性質であり、後者を検証するには「実際のブランチが何か」という外部情報（git状態やビルド環境変数）との突き合わせが必須だが、そのような検証軸を持つテストが存在しなかったため。
5. なぜ21分間で発見できたか（逆に、なぜ即座に発見されなかったか）: 復旧はコミットメッセージのみに痕跡が残っており、CLAUDE.mdが定める「バグ発生時の対応フロー」（バグ一覧への記録・再発防止テストの実装）が実施されないまま次の作業（Bug #50対応）に進んでいたため、根本原因分析と恒久対策が先送りになっていた。

（2026-09-21 時点の対策）環境固有ファイルの検証を「ファイル間の相互整合性」から「実際にチェックアウトしているブランチに対する正しさ」に設計変更した。ブランチは `CF_PAGES_BRANCH`（Cloudflare Pagesビルド時。Base.astroの既存判定方式を踏襲）→ `GITHUB_REF_NAME`（GitHub Actions）→ `git rev-parse --abbrev-ref HEAD`（ローカル）の優先順で判定し、main/staging と判定できた場合のみ絶対値を検証、それ以外（feature/*ブランチやCIのpull_requestイベント等）は誤検知を避けるため内部整合のみを検証する。加えて、今回のようにバグ一覧への記録が漏れる再発を防ぐため、CLAUDE.mdの「バグ発生時の対応フロー」を都度確実に履行する。

6. なぜ検知テストを入れても構造的に再発しうるか（Issue #127 で追加）: 検知は修正しないうえ、CI の pull_request イベントでは `GITHUB_REF_NAME` が `NNN/merge` になって判定不能側（内部整合のみ）に倒れ、Cloudflare Pages のビルドは CI と独立に走るため、PR マージ直後の誤った値のデプロイを止められない。原因は「main と staging でファイルの中身が違う」こと自体にある。

**恒久対策（Issue #127）**: 4項目をファイルから消し、同じソースからビルド時は `CF_PAGES_BRANCH`、CMS は配信ホスト名で導出する（4.6.4章）。ファイル差分が無いのでどちら向きのマージでも持ち込まれる値が存在しない。SEC-35 は「導出結果がブランチ・ホストごとに正しいか」を、ブランチに依存しない同一のテスト集合で検証する形に改訂した。`.gitattributes` の `merge=ours` は事前の実験で失敗したため候補から外した（Issue #127 事前調査）。

**Bug #52 5 Whys:**

1. なぜ `---js` の frontmatter が評価されたか: gray-matter の parseMatter は、開始区切り `---` の直後に言語名があるとそれを `file.language` として採用し、呼び出し側の `language` オプションを上書きする。
2. なぜ `{ language: 'yaml' }` で防げると判断したか: オプション名から「解析言語を固定する」と読み取り、ライブラリ実装（区切り直後の言語宣言が優先、`engines` はマージ）を確認しなかった。監査 run-2 の指摘（`{ engines: {} }` はマージで無効）への対処でも同じ誤りの型（オプションの字面で効果を判断）を繰り返した。
3. なぜテストで検出できなかったか: SEC-29 の回帰テストは url-map.json の下書き除外だけを検証し、`---js` を実際に投入してペイロードが実行されないことを確かめる挙動テストが無かった。
3a. なぜ organize-posts を直しても経路が残ったか: Pages のビルドコマンド `npm run build` は organize-posts より前に `vitest run` を実行し、テスト（content-validation / cms-config / fuzz-validation / build、E2E app-info）自身が全記事・固定ページを gray-matter で直接解析していた。初回修正は監査が指摘したファイル（organize-posts）だけを対象にし、「同じライブラリで同じ信頼境界の入力を読む箇所」を横断的に洗い出さなかった。敵対的レビューで指摘され、一時的な `---js` 記事で `npx vitest run tests/content-validation.test.mjs` がペイロードを実行することを実測した。
4. なぜ Issue で「完了」と記録されたか: 完了判定をコード差分（オプション追加）の存在で行い、攻撃入力による実測を完了条件にしていなかった。
5. なぜ実害に至らなかったか: 記事を置けるのはリポジトリ書込権限保持者のみで、その主体は元々ビルドスクリプト自体を書き換えられる（能力の増加が無い）。

根本対策は、セキュリティ上の遮断を「オプション指定の有無」ではなく「遮断対象の入力を実際に与えて非実行を確認するテスト」で担保し、遮断点をライブラリ呼び出しの単一ラッパーに集約して「ラッパー以外からの直接読み込み禁止」を静的テストで固定すること。`security-hardening.test.mjs` は旧実装ではペイロードが実行されることを確認したうえで、新実装で非実行となることを検証している。

### 4.5.1 既知の制限事項（Bug #48関連: url-map.json対策の適用範囲）

SEC-29（Bug #48）の対策は`public/admin/url-map.json`から下書き記事のslugを除外するものであり、下書き記事の**アップロード画像そのもの**は対象外である。Decap CMS ＋ 静的ホスティング（Cloudflare Pages）構成では、記事本文に挿入した画像は記事の公開状態と無関係に`public/images/uploads/`へ保存され、Astroビルド時に無条件で`dist/images/uploads/`へコピーされて公開URLでアクセス可能になる。これはCMSの保存フロー（画像は先にアップロードされ、後から記事の下書き/公開状態が決まる）に起因する仕様上の制限であり、コード修正では解消できない。運用面の回避策として、**下書き記事に未公開情報を含む画像を貼らない**運用を徹底する（監査の敵対的レビューで指摘された事項）。

---

## 4.6. ブランチマージ手順

### 4.6.1 staging → main マージ手順

staging ブランチで開発・テスト完了後、main ブランチにマージする手順を示す。

**リリース経路の原則（2026-09-24 追記）:**

- **リリースは staging のマージ（staging → main の PR）でのみ行う**。main への直接コミット・直接 push、および staging を経由しない main 向け PR（リリース候補ブランチ上での追加コミット、CI 設定のみの main 直行 PR を含む）は禁止する。main に必要な変更は、まず staging 向け PR で staging に入れてから staging → main でリリースする。
- **Issue #127 以降、main と staging はツリー完全一致が正**（環境固有値はファイルに無く、4.6.4章の規則で導出する）。リリース直後・同期直後に `git diff origin/main origin/staging` が空であることを確認し、差分があれば「どちらが新しいか」を内容で判定して同期 PR で解消する。
- 経緯: 2026-09-23 のリリース 2 で、main 向け PR #144 に staging 未経由のコミット（`c91eb81`、evidence/docs 追加）が入り、PR #145（CI Actions の SHA 固定）も main に直行した。一方 staging には Dependabot PR #140/#141 が main 未反映で残り、両ブランチの履歴が双方向にずれた。2026-09-24 に `sync/main-into-staging-2026-09-24`（main → staging、コンフリクトなし・環境固有ファイル差分ゼロ）と `sync/staging-into-main-2026-09-24`（staging → main）で解消した。これは Issue #127 の「両方向マージで環境値が汚染されない」ことの実地確認にもなった。

**本番マージの完了条件（Bug #50）:**

- `npm test`（Vitest）全PASS。これは CI でも見る。
- ローカル `npm run test:e2e` 全件（PC/iPad/iPhone）PASS。**CI に Playwright は載せない**（実行時間のためローカル運用を継続）。
- 包括エビデンス `node evidence/YYYY-MM-DD/verify-comprehensive.mjs` 完了（雛形 `evidence/2026-05-24/verify-comprehensive.mjs`）。認証後 CMS 画面を含む。ログイン画面のみは不可。**CI に載せない**。
- **Vitest だけでは main マージ不可**。部分 E2E・CMS 実ログイン確認・「後で回す／プロセス負債」は代替にならない。`npm run test:e2e` だけでは包括エビデンスの代替にならない。

```bash
# 1. staging ブランチで Vitest + ローカル E2E 全件 + 包括エビデンスを確認（main マージの必須条件）
#    CI の Vitest 成功は E2E / verify-comprehensive の代替にならない。CI に Playwright は載せない。
git checkout staging
npm test
npm run build && npm run test:e2e
mkdir -p evidence/$(date +%Y-%m-%d)
cp evidence/2026-05-24/verify-comprehensive.mjs evidence/$(date +%Y-%m-%d)/verify-comprehensive.mjs
# TODAY / 出力パスを実行日に合わせてから:
node evidence/YYYY-MM-DD/verify-comprehensive.mjs

# 2. main ブランチに切り替え、最新を取得
git checkout main
git pull origin main

# 3. staging をマージ
git merge staging
#    Issue #127 以降、環境固有値はファイルに無い（4.6.4章）。config.yml / astro.config.mjs / robots.txt の
#    「main の値へ戻す」手作業は不要。次のコマンドで環境関連ファイルが staging と同一であることだけ確認する:
git diff staging -- astro.config.mjs public/admin/config.yml public/admin/cms-env.js src/lib/site-env.mjs src/pages/robots.txt.ts
#    （出力が空であること。public/robots.txt が存在しないこと）
#    ※ 初回（Issue #127 を main に初めて反映するとき）だけは 4.6.5章の移行手順に従う。

# 4. （旧手順「config.yml のコンフリクト解消」は Issue #127 で廃止）

# 5. main ブランチで Vitest 実行（SEC-35 改訂テストが導出結果を検証する）
#    E2E は手順1で完了済み。ここで省略してよいのは手順1を完了している場合のみ。
npm test

# 6. main にプッシュ
git push origin main

# 7. 本番デプロイ後、4.6.6章の読み取りのみの確認を行う
```

### 4.6.2 マージ時の確認観点

| No. | 確認項目 | 確認方法 | 備考 |
|:---|:---|:---|:---|
| 1 | config.yml に `branch` が無い | ファイル確認・`npm test`（env-derivation 静的ガード） | Issue #127: 書き込み先はホスト名から実行時導出。値が書かれていたら誤り |
| 2 | config.yml に `base_url` が無い | 同上 | Issue #127: 常に `location.origin` |
| 3 | Vitest 全テスト PASS | `npm test` | CI でも実行されるが、**Vitest だけでは main マージ不可** |
| 4 | ビルド成功 | `npm run build` | エラーなく完了すること |
| 5 | ローカル E2E 全件 PASS | `npm run test:e2e` | **必須**。**CI に Playwright は載せない**（実行時間のためローカル運用）。部分実行・後回し・CMS実ログイン確認では代替しない（Bug #50） |
| 6 | `public/robots.txt` が存在しない（`src/pages/robots.txt.ts` が生成） | ファイル確認・`npm test` | Issue #127: 本番の `Allow: /` は `CF_PAGES_BRANCH=main` のビルドでのみ生成。デプロイ後は4.6.6章で本番の実物を読み取り確認（Bug #41再発防止） |
| 7 | astro.config.mjs の `SITE_URL` が `resolveSiteUrl(process.env.CF_PAGES_BRANCH)` | ファイル確認・`npm test` | Issue #127: リテラル URL を書かない。canonical/OGP/RSS/sitemap の絶対URLは main ビルドでのみ本番URL |
| 8 | 包括エビデンス | `node evidence/YYYY-MM-DD/verify-comprehensive.mjs` | **必須**。雛形は `evidence/2026-05-24/verify-comprehensive.mjs`。認証後 CMS 画面。ログイン画面のみ不可。**CI に載せない**（Bug #50） |
| 9 | 環境固有値の導出が正しい（ブランチ・ホスト別） | `npm test`（SEC-35 改訂: cms-config / env-derivation / build の CF_PAGES_BRANCH 別ビルド）＋ 4.6.6章の本番読み取り確認 | Bug #51再発防止。Issue #127 以降はファイル差分が無いので「混ざる」値が存在しない。テスト件数はブランチに依存しない（754件） |

### 4.6.3 main → staging コンテンツ同期

本番で CMS から記事が追加・編集された場合、staging に反映する。
同期後は `git diff main staging` が空（ツリー完全一致）であることを確認する。コード・文書・CI の変更をこの方向で持ち込んではならない（4.6.1章「リリース経路の原則」）。

```bash
git checkout staging
git merge main
# Issue #127 以降、環境固有値はファイルに無いため「staging の値を維持する」コンフリクト解消は不要。
# 環境関連ファイルが main と同一であることを確認（出力が空）:
git diff main -- astro.config.mjs public/admin/config.yml public/admin/cms-env.js src/lib/site-env.mjs src/pages/robots.txt.ts
npm test
git push origin staging
```

### 4.6.4 環境別値の導出規則（Issue #127）

環境固有値はファイルに書かず、次の規則で導出する。**main と staging でこれらのファイルの内容は同一**であり、マージで値を戻す作業は存在しない。

| 項目 | 導出点 | 入力 | main（本番） | それ以外（staging・プレビュー・ローカル・CI・未設定） |
|:---|:---|:---|:---|:---|
| `site`（canonical/OGP/RSS/sitemap の絶対URL） | `astro.config.mjs` → `resolveSiteUrl()`（`src/lib/site-env.mjs`） | ビルド時 `process.env.CF_PAGES_BRANCH` | `'main'` 完全一致で `https://reiwa.casa` | `https://staging.reiwa.casa` |
| `robots.txt` | `src/pages/robots.txt.ts` → `buildRobotsTxt()` | ビルド時 `import.meta.env.CF_PAGES_BRANCH` | `Allow: /` + `Sitemap: https://reiwa.casa/sitemap-index.xml` | `Disallow: /`（Sitemap行なし） |
| CMS `backend.branch` | `/admin/cms-env.js` → `resolveCmsBackend()` | 実行時 `location.hostname` | ホスト名 `reiwa.casa` 完全一致で `main` | `staging` |
| CMS `backend.base_url` | 同上 | 実行時 `location.origin` | `https://reiwa.casa` | 配信オリジン（例 `https://staging.reiwa.casa`、`http://localhost:4173`） |

- **安全側の既定**: 本番値になるのは「本番と判定できたとき」だけ。空文字・大文字違い・前後空白・`refs/heads/main`・`NNN/merge`・未知のホストはすべて staging 側に倒す（env-derivation テストで固定）。
- ビルド側（ブランチ名）と CMS 側（ホスト名）で入力が異なる。`*.pages.dev`（main の Pages エイリアスを含む）で開いた CMS は staging に書き込む。本番ブランチへ書き込めるのは `https://reiwa.casa/admin/` からだけ。
- 本番ホスト名は `cms-env.js` の `HOSTNAME_TO_BRANCH` と `site-env.mjs` の `PRODUCTION_SITE_URL` の2か所にあり、一致は env-derivation テストが検証する。
- 旧運用（〜Issue #127）: config.yml の `branch`/`base_url`、astro.config.mjs の `SITE_URL`、`public/robots.txt` を各ブランチで手動管理し、マージのたびに戻していた（Bug #41・#45・#51）。

### 4.6.5 main への初回反映（移行手順, Issue #127）

Issue #127 を staging に取り込んだ後、初めて staging → main をマージするときだけ、main 側の旧ファイル（main 値）と staging 側の新構造がぶつかる。**main 側も staging と同じ内容（新構造）にする**のが正解で、main の旧値を残してはならない。

```bash
git checkout main && git pull origin main
git merge staging
# コンフリクトが出た場合は、次の4ファイルをすべて staging（新構造）側に揃える:
#   astro.config.mjs        … const SITE_URL = resolveSiteUrl(process.env.CF_PAGES_BRANCH);
#   public/admin/config.yml … backend に branch / base_url を書かない
#   public/robots.txt       … 削除（src/pages/robots.txt.ts が生成）
#   public/admin/index.html … CMS_MANUAL_INIT + /admin/cms-env.js + CMS.init
git checkout --theirs astro.config.mjs public/admin/config.yml public/admin/index.html
git rm -f --ignore-unmatch public/robots.txt
git add astro.config.mjs public/admin/config.yml public/admin/index.html
# 確認: 環境関連ファイルが staging と完全一致すること（出力が空）
git diff staging -- astro.config.mjs public/admin/config.yml public/admin/index.html public/admin/cms-env.js src/lib/site-env.mjs src/pages/robots.txt.ts
test ! -e public/robots.txt
npm test                                   # SEC-35 改訂テスト含め全PASS
CF_PAGES_BRANCH=main npm run build:raw     # 本番ビルドの生成物を確認
cat dist/robots.txt                        # Allow: / と Sitemap: https://reiwa.casa/sitemap-index.xml
grep -o '<link rel="canonical"[^>]*>' dist/index.html   # https://reiwa.casa/
git commit
```

移行後は 4.6.1章・4.6.3章の通常手順（環境値の手動修正なし）に戻る。移行の実証記録は `evidence/2026-09-23/issue127/merge-demo.md`。

### 4.6.6 本番反映後の読み取り確認（Issue #127）

staging → main マージと Cloudflare Pages の本番デプロイ完了後、**読み取りのみ**で次を確認する（本番で保存・書き込みは試さない。CLAUDE.md 共通ルール12・15）。

```bash
# 1. robots.txt が本番値（Allow + 本番 Sitemap、Disallow なし）
curl -fsS https://reiwa.casa/robots.txt
# 2. canonical・sitemap が本番URL
curl -fsS https://reiwa.casa/ | grep -o '<link rel="canonical"[^>]*>'
curl -fsS https://reiwa.casa/sitemap-index.xml | grep -o '<loc>[^<]*</loc>'
# 3. CMS 設定: config.yml に branch / base_url が無く、cms-env.js が配信され本番ホストだけ main に対応づけている
curl -fsS https://reiwa.casa/admin/config.yml | grep -nE '^\s*(branch|base_url):' ; echo "exit=$? (1 なら該当行なし)"
curl -fsS https://reiwa.casa/admin/cms-env.js | grep -n "HOSTNAME_TO_BRANCH\|\['reiwa.casa', 'main'\]"
curl -fsS https://reiwa.casa/admin/ | grep -n 'CMS_MANUAL_INIT\|/admin/cms-env.js\|CMS.init('
# 4. staging 側も同様に読み取り（Disallow・staging canonical）
curl -fsS https://staging.reiwa.casa/robots.txt
curl -fsS https://staging.reiwa.casa/ | grep -o '<link rel="canonical"[^>]*>'
```

5. ブラウザで `https://reiwa.casa/admin/` を開きログインまで行い（保存はしない）、開発者ツールの Network で `git/trees/main:` のように **main** を読みに行っていることを確認する。staging（`https://staging.reiwa.casa/admin/`）では `staging:` を読むこと。書き込み先の実測は `tests/e2e/cms-env-branch.spec.ts` と `evidence/2026-09-23/issue127/` のモック環境で行う。

---

## 4.7. 品質向上策・基本機能保護・定期セキュリティ診断

第三者セキュリティ診断（2026年2月21日実施）で検出された問題と対策を踏まえ、再発防止のための品質向上策と定期診断の運用を定める。

セキュリティ要件は第1部 1.4.2章（SEC-01〜SEC-42）として定義されている。本章では運用面での品質基準、再発防止策、定期診断の手順を定める。個人情報保護については4.8章を参照。

### 4.7.1 品質向上策

#### コード品質基準

| No. | 基準 | 詳細 |
|:---|:---|:---|
| Q-01 | 変数宣言は `const` / `let` を使用し `var` を使用しない | ブロックスコープにより変数の影響範囲を明確化し、意図しない再代入を防止する |
| Q-02 | `'use strict'` モードを有効にする | 未宣言変数の使用やサイレントエラーを検出する |
| Q-03 | YAML/frontmatter のパース処理には専用ライブラリを使用する | 正規表現による独自パースは脆弱であるため、gray-matter 等の実績あるライブラリを使用する |
| Q-04 | MutationObserver は用途に関わらず単一インスタンスに統合する | 複数Observerによるパフォーマンス劣化とデバウンス漏れを防止する |
| Q-05 | テストのアサーションは明示的に失敗させる | `if (condition) { ... }` で暗黙にスキップせず、`expect(condition).toBe(true)` で失敗を検知する |
| Q-06 | sharp等のリソース消費ライブラリはインスタンスを最小限にする | 同一ファイルに対する重複インスタンス生成を排除する |

#### ドキュメント品質基準

| No. | 基準 | 詳細 |
|:---|:---|:---|
| D-01 | コード中の数値（行数・テスト件数等）とドキュメントの記載が一致すること | 自動テスト（要件トレーサビリティ検証）で検知可能な範囲を拡大する |
| D-02 | 章番号の相互参照が正しいこと | 章番号を変更する場合は全ドキュメントの参照を検索・更新する |
| D-03 | テスト対象外テーブルの内容が実態と矛盾しないこと | テスト実装済みの機能が「テスト対象外」に記載されたまま放置しない |
| D-04 | 擬似コード・シーケンス図がコードの実装と一致すること | セキュリティ修正等でコードを変更した場合はドキュメントの擬似コードも更新する |
| D-05 | ドキュメント更新はコード変更の完了条件であること | 要件、設計、テスト計画、運用ルール、QA履歴、バグ一覧の該当箇所を確認し、影響がある場合は必ず同一変更内で更新する |

### 4.7.2 基本機能保護（再発防止策）

バグNo.27（iPhone記事保存失敗）の教訓に基づき、ブログの基本機能（コンテンツCRUD）が破壊されることを防止するための運用ルールを定める。

#### 基本機能一覧（破壊禁止）

以下はブログの「あるべき基本機能」であり、いかなる変更でも破壊してはならない:

| 要件ID | 基本機能 | 破壊時の影響 |
|:---|:---|:---|
| FR-15 | コンテンツ保存・公開 | 記事が書けない（致命的） |
| FR-16 | コンテンツ削除 | 不要記事を削除できない |
| FR-17 | リッチテキスト編集 | マークダウンエディタが使えない |
| FR-18 | ライブプレビュー | プレビューが表示されない |
| FR-19 | メディアライブラリ | 画像の管理ができない |
| FR-12 | CMS認証 | ログインできない（致命的） |

#### CMS互換性影響評価（必須チェック）

以下の変更を行う際は、CMS基本機能への影響を必ず評価する:

| 変更対象 | CMS影響リスク | 確認事項 |
|:---|:---|:---|
| `_headers`（セキュリティヘッダー） | **高** | COOP: OAuth popupをブロックしないか。X-Frame-Options/CSP frame-ancestors: プレビューiframeをブロックしないか。CSP connect-src: GitHub APIアクセスを許可するか。**CSP connect-src に `blob:` を含むか（Decap CMS画像保存に必須、Bug #29）**。**Cloudflare Pages制約: `/*`と`/admin/*`で同名ヘッダーを設定するとAppend（重複送信）される。管理画面で異なる値が必要なヘッダー（COOP/CORP/X-Frame-Options）は`/*`に含めない**（Bug #28） |
| `admin/index.html`（HTML構造） | **高** | `<script>`タグの閉じタグが正しいか。CDNスクリプトが後続ブロックを飲み込まないか |
| `config.yml`（CMS設定） | **中** | backend設定（name, repo, auth_endpoint）が正しいか。branch / base_url を書いていないか（Issue #127: `cms-env.js` から実行時導出）。コレクション設定が有効か |
| `cms-env.js` / CMS 初期化（`CMS_MANUAL_INIT`・`CMS.init`） | **高** | 本番ホストだけ main・それ以外 staging になるか。`CMS_MANUAL_INIT` と cms-env.js が Decap より前に読まれるか。`CMS.init` が registerPreviewStyle の後に1回だけ呼ばれるか（env-derivation・E2E cms-env-branch） |
| `functions/auth/`（OAuth） | **高** | 認証フロー全体が正常に動作するか。postMessageハンドシェイクが成功するか |
| CDN外部スクリプト更新 | **高** | SRIハッシュが正しいか。`</script>`閉じタグが維持されているか |

#### 再発防止テスト要件

バグNo.27の根本原因（セキュリティ強化がCMS基本機能を破壊）に対する自動テスト:

| テスト | 検証内容 | テストファイル |
|:---|:---|:---|
| CDNスクリプト閉じタグ | `<script src="...cdn..."></script>`の形式を検証 | admin-html |
| プレビュースタイル独立性 | `CMS.registerPreviewStyle`が独立`<script>`ブロック内にある | admin-html |
| COOP管理画面オーバーライド | `/admin/*`がsame-origin-allow-popups | fuzz-validation |
| X-Frame-Options管理画面オーバーライド | `/admin/*`がSAMEORIGIN | fuzz-validation |
| CSP frame-ancestors | `/admin/*`にframe-ancestors 'self' | fuzz-validation |
| Backend設定完全性 | 保存に必要な全フィールドが設定されている | cms-config |
| コレクション削除許可 | deleteが明示的に無効化されていない | cms-config |
| Bodyウィジェット | markdownウィジェットが設定されている | cms-config |
| ビルドパイプライン完全性 | 4段階パイプラインが正しく定義されている | build |
| _headersヘッダー重複禁止 | `/*`と`/admin/*`で同名ヘッダーが存在しないこと（Bug #28） | build |
| _headers管理画面限定ヘッダー | COOP/CORP/X-Frame-Optionsが`/*`に含まれていないこと（Bug #28） | build |
| _headers同名ヘッダー重複禁止 | admin セクションのヘッダーが global セクションと重複しないこと（Bug #28） | fuzz-validation |
| CSP connect-src blob: | connect-srcに`blob:`が含まれていること（Bug #29: Decap CMS画像保存時の`fetch(blobURL)`に必要） | build, fuzz-validation |

### 4.7.3 定期セキュリティ診断

| 項目 | 内容 |
|:---|:---|
| 実施頻度 | 機能追加時、および四半期に1回 |
| 対象範囲 | フロントエンド（admin/index.html）、サーバーサイド（functions/auth/）、外部依存関係（CDN、npm）。npm管理外依存の鮮度・EOL は 4.11章の週次ジョブ（SEC-40）で常時監視する |
| 診断手法 | コードレビュー、OWASP Top 10チェック、依存関係の脆弱性スキャン |
| 記録方法 | 検出事項はバグ一覧（4.5章）に追記し、対策と再発防止テストを実施する |

---

## 4.8. 個人情報保護

### 4.8.1 概要

git履歴に個人情報（氏名・メールアドレス）が含まれていた問題（Bug #35）を契機に、個人情報の混入防止策を導入した。

### 4.8.2 防止策一覧

| No. | 対策 | 内容 | 適用範囲 |
|:---|:---|:---|:---|
| 1 | ローカルgit設定 | `user.name=tbi`, `user.email=noreply@users.noreply.github.com` をリポジトリ固有設定として設定 | ローカルコミット |
| 2 | pre-commit hook | `.git/hooks/pre-commit` でauthor emailとステージファイル内容を検査し、個人情報パターン検出時にコミットを拒否 | ローカルコミット |
| 3 | CLAUDE.md ルール9 | Claude Codeが個人情報をコード・ドキュメント・コミットに含めないルールを明文化 | AI支援開発 |
| 4 | GitHub noreply設定 | GitHubアカウントの「Keep my email addresses private」を有効化し、CMS経由のコミットにも個人メールが使われないようにする | CMS経由コミット |
| 5 | CI identity gate（SEC-42） | PRのbase..headとmain/staging pushのbefore..headを検査し、不許可identityがあればジョブを失敗させる。force-pushまたはbefore SHA不在時は新HEAD全履歴を検査する。ブランチ保護未設定の現状では直接push後の検知となる | main/stagingに入る新規コミット |

### 4.8.3 pre-commit hook の検査内容

1. **author email検査**: `git config user.email` が個人メールパターン（gmail.com, yahoo.co.jp, hotmail等）に該当する場合、コミットを拒否
2. **ステージファイル内容検査**: ステージされたテキストファイル内に特定の個人情報パターンが含まれる場合、コミットを拒否

**注意**: `.git/hooks/` はgit管理外のため、リポジトリをクローンした場合はhookを再設定する必要がある。SEC-42はPR差分またはpush差分をCIで検査し、force-push、およびbefore SHAを取得できない場合は新HEADの全履歴を検査する。PRはマージ前にチェックされるが、main/stagingにブランチ保護がない限り直接pushはGitHubに受理された後でCIが失敗するだけであり、pushを拒否しない。履歴修復force-push完了前はブランチ保護を有効化せず、完了後にrequired status checks等を別Issueで検討する。過去のPR refsは対象外とする。

## 4.9. 動作確認エビデンス取得

### 4.9.1 概要

コード変更のstaging検証時およびmainマージ前に、Playwright自動検証によるスクリーンショット付きHTMLエビデンスレポートを作成する。

### 4.9.2 エビデンス構成

| 項目 | 内容 |
|:---|:---|
| 保存先（ローカル生成） | `evidence/YYYY-MM-DD/` フォルダ（日付ごとに整理） |
| レポート形式（ローカル生成、正本はDrive） | `report.html`（画像埋め込み、PC/iPad/iPhone 3デバイス横並び表示） |
| スクリーンショット（ローカル生成、正本はDrive） | `screenshots/`, `site-interactive/`, `cms-interactive/` サブフォルダ |
| テストデバイス | PC (1280x800) / iPad Pro 11 (834x1194) / iPhone 14 (390x844) |
| Git保持対象 | 検証JSON・`verify-*.mjs`・`archive-index.json`・小さな非レポートHTMLのみ（画像・動画・PDF・`report.html`系はDriveを正本とし、読戻しSHA-256検証後に4.2.6章の索引へ登録。詳細は4.2.6章・4.10.3章） |

### 4.9.3 検証スクリプト

| スクリプト | 用途 | テスト数 |
|:---|:---|:---|
| `verify-staging.mjs` | 基本動作確認（サイト表示・セキュリティヘッダー） | 7 checks × 3 devices |
| `verify-site-interactive.mjs` | サイト操作性（ドロップダウン展開・ページ遷移等） | 10 scenarios × 3 devices |
| `verify-cms-interactive.mjs` | CMS操作性（ボタン押下・メニュー展開・モーダル・画像アップロード） | 16 scenarios × 3 devices |
| `verify-cms-crud.mjs` | CMS CRUD操作（記事作成/編集/削除・画像アップロード・タグ・固定ページ） | 16 scenarios × 3 devices |
| `evidence/YYYY-MM-DD/verify-security.mjs` | セキュリティ証跡の対象10項目（SEC01〜SEC10） | 10 checks × 1 device |
| `evidence/2026-05-22/verify-modern-web-guidance.mjs` | Modern Web Guidance準拠検証（公開サイト3デバイス、CMS独自カスタマイズPC/iPhone） | 8 checks |
| `evidence/2026-05-22/verify-cms19-month-filter.mjs` | CMS年月フィルター検証（OAuthモック、月選択フィルター、select安定性、ソート切替） | 5 scenarios × 3 devices |

### 4.9.4 実操作E2E確認ルール（必須）

UI変更・CMS変更・Modern Web Guidance対応では、DOMを直接書き換える検証だけでは完了扱いにしない。実ユーザーが行う操作をPlaywrightで再現し、操作後の画面状態とスクリーンショットを確認する。

| 対象 | 必須確認 | 備考 |
|:---|:---|:---|
| UI操作 | `click`, `fill`, `selectOption`, `press`, ファイル選択などのPlaywright実操作を最低1本含める | `page.evaluate()`や`dispatchEvent()`だけの合格は禁止 |
| CMS認証後画面 | OAuthモックとGitHub APIモックを使い、認証後のCMS画面を確認する | 過去エビデンス方式を踏襲 |
| セレクト・メニュー | ネイティブUIを開く/選ぶ操作中に再描画やMutationObserverで不安定化しないことを確認する | Bug #38再発防止 |
| エビデンス | PC/iPad/iPhoneの3デバイスでスクリーンショットを保存し、赤枠アノテーションで確認箇所を示す | 既存の`verify-*.mjs`形式を踏襲 |

### 4.9.5 赤枠アノテーション方針

全スクリーンショットに対し、注目すべき箇所に赤枠（`border: 3px solid red`）とラベルを必ず付与する。対象箇所:
- ボタン・リンク等のクリック可能要素
- ドロップダウン・モーダル等の展開状態
- ボタン重なり検出箇所（「重なり!」ラベル付き）
- バグ再発防止の確認箇所（URLバー・保存ボタン・Code Block非表示等）

### 4.9.6 過去バグ由来の検証

以下のバグについてエビデンス内で再発していないことを確認する。

| バグ | 検証内容 | エビデンスID |
|:---|:---|:---|
| Bug #1 | モバイル保存ボタン表示（sticky header） | T03, T16 |
| Bug #4 | 削除ボタンラベル分離 | T06 |
| Bug #5,#6 | 画像EXIF回転 | T11, S04 |
| Bug #7 | ボトムシート形式ドロップダウン | T13 |
| Bug #8,#11 | URLバー表示/非表示遷移 | T03, T07, T15 |
| Bug #9 | モバイルCode Blockボタン非表示 | T04 |
| Bug #13 | 固定ページURL表示 | T08 |
| Bug #14,#15 | ドロップダウン開閉・gap | S02, S03 |
| Bug #29 | CSP connect-src blob: | T11, T12 |
| Bug #30 | 下書き記事404 | S09 |
| Bug #31 | モバイルドロップダウンhover/tap | S02 |
| Bug #32 | URLバーとモーダル非重複 | T09, T12 |
| Bug #33 | タグURLエンコード | S08 |
| Bug #36 | CMS認証後エディタ表示（ログイン画面のみ問題） | T17〜T32 全48枚 |
| Bug #37 | CMS年月フィルター（選択年月のみ表示） | E-37 / cms19-month-filter |

### 4.9.7 CMS CRUD操作検証（T17〜T32）

ログイン後のCMS各操作を実際に実行してスクリーンショット取得する。

| ID | シナリオ | 操作内容 | バグ参照 |
|:---|:---|:---|:---|
| T17 | 記事新規作成: フォーム入力 | タイトル・日付・本文入力→フィールド表示確認 | - |
| T18 | 記事新規作成: Publish実行 | 保存ボタンクリック→API呼び出し確認 | - |
| T19 | 記事編集: 既存記事読み込み | 既存記事のフィールド・URLバー表示 | - |
| T20 | 記事編集: タイトル・本文変更 | タイトル変更・本文追加→変更状態表示 | - |
| T21 | 記事編集: 保存実行 | 保存クリック→API呼び出し確認 | - |
| T22 | 記事削除: 削除ボタン確認 | 選択解除・完全削除ボタンのラベル表示 | Bug #4 |
| T23 | 記事削除: 確認ダイアログ | 削除クリック→確認ダイアログ表示 | - |
| T24 | 画像ウィジェット: accept制限 | file inputのaccept属性・HEIC制限 | Bug #5,#6 |
| T25 | 画像アップロード: ファイル選択 | ファイル選択→EXIF処理→プレビュー | Bug #5,#29 |
| T26 | メディアライブラリ: モーダル操作 | モーダル表示・アップロードボタン・URLバー退避 | Bug #29,#32 |
| T27 | タグ編集: タグ追加 | タグ入力・追加・表示確認 | - |
| T28 | 下書き/公開ステータス切替 | ステータスドロップダウン展開・切替 | Bug #7 |
| T29 | Publish確認ワークフロー | 公開→確認ダイアログ→完了 | - |
| T30 | 固定ページ新規作成 | タイトル・slug・order入力 | - |
| T31 | 固定ページ編集 | 既存ページ読み込み・slug URL表示 | Bug #13 |
| T32 | エディタツールバー操作 | 書式ボタン・Code Block非表示（モバイル） | Bug #9 |

### 4.9.8 セキュリティ検証エビデンス（SEC01〜SEC10）

列挙したSEC01〜SEC10の10項目について証跡を取得・確認し、スクリーンショット付きで記録する。

| ID | 検証項目 | 要件参照 | 検証方法 |
|:---|:---|:---|:---|
| SEC01 | XSS耐性 | SEC-01 | XSSペイロードがエスケープ済みか検証 |
| SEC02 | セキュリティヘッダー | SEC-02,SEC-03 | CSP/COOP/CORP/X-Frame-Options等の設定確認 |
| SEC03 | DOM安全性 | SEC-05 | innerHTML/outerHTML不使用、var不使用確認 |
| SEC04 | OAuth scope | SEC-06 | public_repo,read:user限定確認 |
| SEC05 | CDNバージョン固定 | SEC-07 | キャレット不使用・integrity属性確認 |
| SEC06 | postMessage origin | SEC-10 | ワイルドカード"*"不使用確認 |
| SEC07 | ハードコードURL | SEC-12 | admin内にreiwa.casaハードコードなし確認 |
| SEC08 | _headersファイル | SEC-15 | セキュリティヘッダー設定・Bug #28重複回避確認 |
| SEC09 | scriptタグ閉じ | SEC-18 | CDNスクリプト閉じタグ完備・use strict確認 |
| SEC10 | パストラバーサル | SEC-14 | 不正パス・XSSペイロードへのアクセス確認 |

### 4.9.9 エビデンス収集における認証方式（技術ノート）

CMS CRUDエビデンス（verify-cms-crud.mjs）では、Decap CMS OAuth認証をPlaywrightでシミュレートする必要がある。以下の技術的知見に基づいて実装されている。

**Decap CMS OAuth 3ステップハンドシェイク:**

実際のOAuth認証フロー（`functions/auth/callback.js`）は以下の3段階で動作する:
1. ポップアップが親ウィンドウに `"authorizing:github"` を送信
2. 親ウィンドウ（CMS）がACKメッセージをポップアップに返信
3. ポップアップが `"authorization:github:success:" + JSON.stringify({token, provider})` を送信

ステップ1-2を省略してトークンを直接送信すると、CMSはメッセージを無視する（Bug #36）。

**Playwrightの制約と対策:**

| 制約 | 対策 |
|:---|:---|
| `page.route()`はポップアップウィンドウのナビゲーションをインターセプトできない | `context.route()`（ブラウザコンテキストレベル）を使用 |
| glob `**/auth`はクエリパラメータ付きURL（`/auth?provider=github&...`）にマッチしない | 関数マッチャー（`url => url.pathname === '/auth'`）を使用 |
| Playwrightのルートはデフォルトでマッチ順がLIFO（後登録が先にチェック） | catch-allルートを最初に登録（最後にチェック）、具体ルートを後から登録（先にチェック） |
| config.ymlの`base_url`がリモートURLだとlocalhost上のpostMessageがクロスオリジン拒否される | （旧）エビデンス収集時はconfig.ymlの`base_url`をlocalhostに一時変更していた。**Issue #127 以降は base_url が常に `location.origin` なので一時変更は不要**（`evidence/2026-09-23/issue127/` で書き換えなしにログインできることを確認）。旧スクリプト（2026-05-24 版 verify-comprehensive 等）の一時書き換え処理は、置換対象行が無いため何もしない |

### 4.9.10 E2Eスペックテストにおける認証方式の知見（引き継ぎノート）

CMS-17/CMS-18実装時（2026-02-24〜25）に、Playwright test runnerでのCMS認証に多大な工数を要した。以下の知見を今後のCMS E2Eテスト実装時に活用すること。

#### スタンドアロン検証スクリプト vs Playwright test runner の違い

スタンドアロンスクリプト（`verify-cms-*.mjs`）では `context.route()` + 物理ファイル書き換え方式で認証が成功するが、**Playwright test runner 環境では同じ手法が動作しない**。

| 方式 | スタンドアロン | test runner | 原因 |
|:---|:---|:---|:---|
| `context.route()` でポップアップインターセプト | 成功 | 失敗（"ログインしています..."で停止） | test runnerのコンテキスト管理がroute登録に影響 |
| `dist/admin/config.yml` 物理ファイル書き換え | 成功 | config変更は反映されるがauth完了せず | ファイル書き換え自体は有効だが、ポップアップの問題が残る |
| `page.route('**/admin/config.yml')` でレスポンス差し替え | — | 効果なし | Decap CMSの自動初期化タイミングとの競合が疑われる |
| **`window.open` モンキーパッチ（採用方式）** | — | **成功** | ポップアップを開かず、CMS内部で完結する |

Modern Web Guidanceエビデンスでは、過去のスタンドアロン検証スクリプト方式（`context.route()` + 3ステップOAuthハンドシェイク + 赤枠アノテーション + HTMLレポート）を採用する。スクリーンショットとレポートは `evidence/YYYY-MM-DD/` に保存する。

#### 採用方式: `window.open` モンキーパッチ + GitHub APIモック

Playwright test runner では以下の方式で安定動作する:

```javascript
// 1. page.addInitScript() で window.open をオーバーライド
await page.addInitScript(() => {
  window.open = function () {
    const fakePopup = {
      closed: false,
      close() { this.closed = true; },
      postMessage(_msg, _origin) {
        // CMS からの ACK → success トークンを返す
        setTimeout(() => {
          window.postMessage(
            'authorization:github:success:' + JSON.stringify({ token: 'mock-token', provider: 'github' }),
            window.location.origin,
          );
        }, 100);
      },
    };
    // CMS に 'authorizing:github' を送信（3ステップの開始）
    setTimeout(() => {
      window.postMessage('authorizing:github', window.location.origin);
    }, 200);
    return fakePopup;
  };
});

// 2. GitHub APIモック（関数プレディケート必須）
await page.route(
  (url) => url.hostname === 'api.github.com' && url.pathname === '/repos/owner/repo',
  (route) => route.fulfill({ body: JSON.stringify({ permissions: { push: true } }) })
);

// 3. ページ遷移 → ログインボタンクリック
await page.goto('/admin/');
await loginButton.click();
```

#### 重要な注意事項

1. **GitHub APIモックのルートマッチング**: `page.route('https://api.github.com/repos/...')` 形式の文字列URLパターンはクエリパラメータやトレイリングスラッシュでマッチしない場合がある。**関数プレディケート `(url) => url.hostname === 'api.github.com' && url.pathname === '...'` を使用すること**

2. **catch-allルートの必須性**: 特定エンドポイント以外の全GitHub APIリクエストに200を返すcatch-allルートを**最初に登録**すること（LIFO順で最後にチェック＝フォールバック）。これがないと未ハンドルのAPIコールで認証が停止する

3. **リポジトリ情報の完全性**: `/repos/owner/repo` のレスポンスには `permissions: { admin: true, push: true, pull: true }` を含めること。`permissions` フィールドが欠落すると `TypeError: Repo not found` エラーでCMSが停止する

4. **認証の間欠的失敗**: 同一describeブロック内の3番目以降のテストで認証が失敗する場合がある（3ステップハンドシェイクのタイミング依存）。レイアウト検証等のテストは認証失敗時もPASSするように設計し、スクリーンショットエビデンスで視覚的に確認する

5. **スタンドアロンスクリプトとの使い分け**: 確実に認証後スクリーンショットが必要な場合は、`verify-cms-*.mjs` スタンドアロンスクリプト方式（物理ファイル書き換え + `context.route()`）を使用する。E2Eスペックテストでは上記モンキーパッチ方式を使用する

---

## 4.10. 継続的品質・セキュリティ改善フレームワーク

本プロジェクトでは、品質とセキュリティを継続的に向上させるための体系的な仕組みを運用する。

### 4.10.1 バグ駆動テストケース生成

バグ一覧（4.5章）に記録された全バグから再発防止テストケースを作成し、テストスイートに組み込む。

**プロセス:**
1. バグ発生→4.5章に記録（原因・対策・影響範囲）
2. 再発防止テストを実装（Vitest/Playwright）
3. TEST-REPORT.md のテストケース一覧に追記
4. 1.5章トレーサビリティマトリクスを更新
5. エビデンス検証マトリクス（4.9.6章）にバグIDとエビデンスIDの対応を追加
6. 次回エビデンス取得時にバグ再発がないことを自動検証

**方針:**
- バグ修正時は必ず再発防止テストを同時実装する（テストなしのバグ修正は不可）
- 過去バグの教訓をエビデンス取得方針に反映し、重点検証箇所として継続監視する
- バグパターンの傾向分析を行い、類似バグの予防的テストを追加する

### 4.10.2 定期セキュリティ検証

**エビデンス検証（エビデンス取得時に実行）:**
- `evidence/YYYY-MM-DD/verify-security.mjs` は、4.9.8章のSEC01〜SEC10に記載した項目をスクリーンショット付きで確認するエビデンス用スクリプトであり、SEC-01〜SEC-41全体の完全な自動検証器ではない。ローカル実行環境の制約により一部確認は表示・ソース確認に限られる。
- SEC要件全体のテスト網羅性は1.5.4章のトレーサビリティマトリクスを正本とする。設定・コードの回帰検査はVitest、公開環境の応答・操作は必要に応じてE2E/実測で担保する。
- SEC-33は `tests/build.test.mjs`（CIの `permissions: contents: read`）、SEC-34は `tests/build.test.mjs` / `tests/fuzz-validation.test.mjs`（`.assetsignore`の不在）、SEC-35は `tests/cms-config.test.mjs`（現在のブランチと環境固有値の整合）、SEC-40は `tests/dependency-freshness.test.mjs`（判定ロジック・週次ワークフロー設定）と週次ジョブ `dependency-freshness.yml` で検証する。これらを `verify-security.mjs` へ重複実装しない。
- 結果の保存方法とスクリーンショットは4.9章のエビデンス方針に従う。

**追加の手動レビュー（機能追加時）:**
- admin/index.html 変更時: innerHTML不使用、var不使用、use strict確認
- _headers 変更時: Bug #28（ヘッダー重複）の回避確認
- OAuth関連変更時: scope最小化、stateパラメータ確認
- CDN変更時: バージョン固定、integrity属性確認、4.11.4章の Decap CMS 更新手順（SRI 再計算・E2E）

### 4.10.3 エビデンス取得の継続運用

**タイミング:**
- コード変更のstaging検証時（全スクリプト実行）
- mainマージ前の最終確認時
- セキュリティ要件追加時（該当するセキュリティ検証を追加）

**保存と管理:**
- エビデンスは `evidence/YYYY-MM-DD/` に日付ごとに保存
- `report.html` に対応の概要（何のシステム変更に対するテストか）を記載
- テストスクリプトは `evidence/YYYY-MM-DD/` に保存し、今後の再利用に備える
- 各スクリプトの検証シナリオはTEST-REPORT.mdに記録

**エビデンス取得後の必須作業:**
1. **社内レビュー**: スクリーンショット全数を確認し、ログイン画面のみ等の不備がないことを検証する（CLAUDE.md ルール11）
2. **レポート生成（ローカル）**: `report.html` をローカルの `evidence/YYYY-MM-DD/` に更新し、全スクリーンショットをPC/iPad/iPhone横並びで確認可能な形式にまとめる。この時点ではGitにコミットしない
3. **作業完了報告書生成（ローカル）**: 変更がある場合は `work-completion-report.html` をローカルに作成し、システム要件変更の有無・テスト結果・エビデンス確認結果を記録する。この時点ではGitにコミットしない
4. **Drive正本化**: 新規スクリーンショット、画像埋込レポート、`report.html`、`work-completion-report.html` を本人専用Driveへ保存する。読戻ししたファイル単位のSHA-256が一致した後に `evidence/archive-index.json` を更新し、validatorを実行する。`verify-*.mjs` と `*-results.json` はGitに残す
5. **フォルダ整理**: デバッグ用スクリーンショット・一時ファイルを削除し、正式なフォルダ構成のみを維持する

**フォルダ構成（標準・ローカル作業ディレクトリ）:**
```
evidence/YYYY-MM-DD/
├── report.html                    # エビデンスレポート（画像参照、PC/iPad/iPhone横並び）※Drive正本化後はGit未コミット
├── work-completion-report.html    # 作業完了報告書（要件変更確認、テスト結果）※Drive正本化後はGit未コミット
├── verify-staging.mjs             # Part 1: サイト基本動作検証スクリプト（Gitに保持）
├── verify-site-interactive.mjs    # Part 2: サイト操作性検証スクリプト（Gitに保持）
├── verify-cms-interactive.mjs     # Part 3: CMS操作性検証スクリプト（Gitに保持）
├── verify-cms-crud.mjs            # Part 4: CMS CRUD操作検証スクリプト（Gitに保持）
├── verify-security.mjs            # Part 5: セキュリティ検証スクリプト（Gitに保持）
├── *-results.json                 # 各検証の結果JSON（Gitに保持）
├── screenshots/                   # Part 1: サイト基本動作スクリーンショット ※Drive正本化後はGit未コミット
├── site-interactive/              # Part 2: サイト操作性スクリーンショット ※Drive正本化後はGit未コミット
├── cms-interactive/               # Part 3: CMS操作性スクリーンショット ※Drive正本化後はGit未コミット
├── cms-crud/                      # Part 4: CMS CRUD操作スクリーンショット ※Drive正本化後はGit未コミット
└── security/                      # Part 5: セキュリティ検証スクリーンショット ※Drive正本化後はGit未コミット
```
上記のうち画像・動画・PDFと `report.html` / `work-completion-report.html` はローカルで生成した後 Google Drive（本人のみ閲覧可能）へ保存し、読戻しSHA-256を照合してから `evidence/archive-index.json`（4.2.6章）へ登録する。Gitにコミットするのは検証スクリプト・結果JSON・索引・小さな非レポートHTMLのみ（`.gitignore` 参照）。2026-09-24の履歴書換え時点で既にGit管理下にあった14件（`work-completion-report.html` 13件、`report.html` 1件）は索引で `storage_class: "git"` の例外として当面Gitに残す。

**CMS CRUDエビデンス取得時の特記事項:**
- verify-cms-crud.mjsはDecap CMS OAuth 3ステップハンドシェイクをシミュレートする（詳細は4.9.9章参照）
- （旧）実行前にconfig.ymlの`base_url`をlocalhostに一時変更し、実行後に復元していた。Issue #127 以降は config.yml に `base_url` が無く `location.origin` を使うため、この操作は不要

### 4.10.4 品質指標

| 指標 | 目標値 | 現状 |
|:---|:---|:---|
| Vitestテスト全PASS | 100% | 754/754 (100%)（2026-09-23 Issue #130対応後。Issue #127 以降は全ブランチ共通件数） |
| Playwright E2Eテスト全PASS | 100% | 2026-09-20 ローカル全件: 445 PASS・8 skip / 453件（16.3m）。CI では実行しない（Bug #50） |
| セキュリティ検証全PASS | 100% | 10/10 (100%) |
| ボタン重なり検出 | 0件 | 0件 |
| 未テスト要件 | 0件 | 0件 |
| バグ再発 | 0件 | 0件 |

---

## 4.11. npm管理外依存の鮮度・EOL管理

SEC-40（Issue #132）。`npm audit` と Dependabot は npm 依存グラフと GitHub Actions しか見ないため、CDN から読み込む Decap CMS や Node.js のバージョン宣言、Cloudflare Pages のビルド環境は誰も自動で見ていなかった（Decap CMS は 3.10.0 のまま 6 マイナー遅れていたことに監査 run-2 まで気づけなかった）。これらを一覧として追跡し、週次で機械判定する。運用モデルは個人の自動化基盤で使っている「週次ジョブ・機械可読な最新結果・正常と劣化状態の分離・既存経路での通知」を踏襲し、対象は本リポジトリに実在する依存に限定する（2026-09-23 の open issue 一括QA Q10 で決定）。

### 4.11.1 棚卸し（2026-09-23 時点）

| 名称 | 現在バージョン | 固定方法（箇所） | 最新確認方法 | EOL・サポート情報源 | 更新手順 | 自動判定 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Decap CMS（unpkg CDN） | 3.16.2 | 正確なバージョン＋SRI sha384＋`crossorigin="anonymous"`（`public/admin/index.html`） | npm registry `decap-cms` の `dist-tags.latest`、`/-/npm/v1/security/advisories/bulk`、CDN 実体の sha384 | 明文化された EOL ポリシーなし（コミュニティメンテの Netlify CMS フォーク）。上流の最終リリースからの経過日数を代替指標にする（`decaporg/decap-cms` Releases） | 4.11.4章 | 週次 |
| GitHub Actions `actions/checkout` | v4.4.0（`ci.yml`）／v7.0.1（`dependency-freshness.yml`） | commit SHA＋`# vX.Y.Z` コメント（`ci.yml` は SEC-36 / Issue #117 項目3 で固定済み） | GitHub API `releases/latest` | 各リポジトリの Releases。実行ランタイム（Node）の非推奨告知は GitHub Changelog | Dependabot PR（staging 向け）をレビューしてマージ（SHA とバージョンコメントを同時に更新） | 週次＋Dependabot |
| GitHub Actions `actions/setup-node` | v4.4.0（`ci.yml`）／v7.0.0（`dependency-freshness.yml`） | 同上 | 同上 | 同上 | 同上 | 週次＋Dependabot |
| GitHub Actions `actions/upload-artifact` / `actions/download-artifact` | v7.0.1 / v8.0.1 | commit SHA＋バージョンコメント（`dependency-freshness.yml`） | 同上 | 同上 | 同上 | 週次＋Dependabot |
| Node.js | 22 系（`.nvmrc` 22.12.0、`engines` `>=22.12.0`、CI `node-version: '22'`、週次ジョブは `.nvmrc`） | `.nvmrc`（Cloudflare Pages とローカル）・`package.json` engines・CI | endoflife.date `api/v1/products/nodejs` の該当サイクル `latest` | endoflife.date（Node.js 公式リリーススケジュール）。22 系は 2027-04-30 EOL | 4.11.5章 | 週次 |
| Cloudflare Pages ビルドイメージ・`NODE_VERSION` | 2026-09-23 ダッシュボード確認: Build command `npm run build`、Build output `dist`、Production branch `main`。**ビルドイメージのバージョンと `NODE_VERSION` は未確認**（2.5.1章の記載値は v3） | ダッシュボード設定（API 未連携） | Cloudflare ダッシュボード Settings > Build、デプロイログ | Cloudflare Pages Build image ドキュメント（旧イメージの廃止告知） | 4.11.5章。確認後に `scripts/dependency-freshness.config.json` の `lastReviewed`・`reviewed`・`unverified` を更新 | 四半期の手動確認（期限超過・未記録・`unverified` 残存で warning） |

対象外: `https://github.com` / `api.github.com`（OAuth・API のエンドポイントであり依存ライブラリではない）、`wrangler.toml` の `compatibility_date`（Workers の互換性日付で EOL の概念がない）、`skills-lock.json`（開発補助のエージェントスキル。配信物・ビルドに含まれない）、npm パッケージと Playwright ブラウザ（npm 依存として `npm audit` / Dependabot alerts の対象）。

### 4.11.2 判定ルール

`scripts/check-dependency-freshness.mjs` が次のとおり分類し、項目ごとの最悪値、全体は全項目の最悪値を `status` にする。閾値は `scripts/dependency-freshness.config.json` で管理する。

| 状態 | 条件 | 対応 |
| :--- | :--- | :--- |
| alert | CDN: SRI 実体不一致／integrity 欠落／バージョン範囲指定／固定版が npm で deprecated／high・critical の既知脆弱性／メジャー遅れ／3 マイナー以上の遅れ。Node.js: 宣言メジャーの EOL まで 30 日以内または経過 | Issue 起票とジョブ失敗で通知。1 週間以内に staging で対処 |
| warning | CDN: patch または 1〜2 マイナー遅れ／low・moderate の既知脆弱性／上流の最終リリースから 365 日超。Actions: タグ固定／SHA 固定でバージョンコメントなし／メジャー遅れ。Node.js: EOL まで 90 日以内／固定パッチがサイクル最新より古い／宣言箇所のメジャー不一致。手動確認: 未記録・92 日超・未確認項目（`unverified`）の残存 | 結果 JSON とジョブサマリーに記録。四半期レビューまでに解消するか理由を記録 |
| unknown | 個別のリモート照会の失敗（warning 相当として集計） | 翌週の結果で再確認。連続する場合は原因を調査 |
| error | リモート照会がすべて失敗し判定できない | ジョブ失敗で通知 |
| ok / manual | 上記に該当しない／手動確認が期限内 | なし |

Actions のメジャー遅れを alert にしないのは、Dependabot が更新 PR を作る一次経路であり、本ジョブは記録用とするため。Decap CMS は EOL ポリシーがないため、バージョン差・deprecated・advisory・上流停滞の 4 指標で代替する。EOL の 90 日／30 日閾値は個人の自動化基盤の既存運用と揃えた。

### 4.11.3 実行・結果・通知

| 項目 | 内容 |
| :--- | :--- |
| 定期実行 | `.github/workflows/dependency-freshness.yml`。毎週月曜 00:00 UTC（09:00 JST）＋ `workflow_dispatch`。スケジュール実行は GitHub の仕様上デフォルトブランチ（main）のワークフローのみ動くため、main 反映後に有効になる |
| 権限 | ワークフロー既定 `permissions: {}`。判定ジョブ `contents: read`、通知ジョブ `issues: write` のみ。全 action を commit SHA 固定。`run:` には `${{ }}` を埋め込まず `env:` 経由 |
| 結果 | `latest.json`（`schemaVersion`、`status`、`counts`、`items[].findings[]`、`problems`、`exitCode`）と `latest.md` を artifact `dependency-freshness`（90 日保持）に保存し、Markdown をジョブサマリーに出す |
| 通知 | alert: タイトル `[dependency-freshness] npm管理外依存に要対応（alert）があります` の Issue を 1 件だけ起票（未クローズの同名 Issue があればコメント追記）し、ジョブを失敗させて GitHub Actions の失敗通知も送る。error: 判定ジョブを失敗させる。warning: 通知せず記録のみ |
| ローカル実行 | `node scripts/check-dependency-freshness.mjs [--out-dir DIR] [--fail-on alert\|warning\|never]`（既定の出力先 `reports/dependency-freshness/` は `.gitignore` 済み）。終了コード 0=ok/warning、2=alert、1=error。Node 組み込みモジュールのみで動き `npm ci` 不要 |
| dry-run | `--remote-fixture tests/fixtures/dependency-freshness/remote-alert.json --now 2027-04-10T00:00:00Z` でネットワークに出ず alert 経路を再現できる。Issue 起票手順は `evidence/2026-09-23/issue132/notify-dry-run.sh`（`gh issue list` のみ実行し create/comment は表示だけ）で確認する |
| テスト | `tests/dependency-freshness.test.mjs`。判定はフィクスチャのみで行い `fetch` を禁止する。`npm test` と CI はネットワーク非依存のまま |

### 4.11.4 Decap CMS 更新手順（SRI 再計算必須）

`public/admin/index.html` は Decap の内部 DOM を直接操作しているため、パッチ更新でもフル CMS E2E と 3 デバイスのエビデンス取得を必須とする。

1. `feature/*` ブランチを staging から作成し、上流の CHANGELOG / Releases で破壊的変更と修正内容を確認する
2. `public/admin/index.html` の `<script src="https://unpkg.com/decap-cms@X.Y.Z/dist/decap-cms.js">` を正確なバージョンに書き換える（`^` / `~` / 省略は禁止。SEC-03）
3. SRI を再計算して `integrity` を更新する: `curl -sL https://unpkg.com/decap-cms@X.Y.Z/dist/decap-cms.js | openssl dgst -sha384 -binary | openssl base64 -A`（`sha384-` を前置。`crossorigin="anonymous"` は維持。SEC-12）。ハッシュを誤ると管理画面が起動しない
4. `node scripts/check-dependency-freshness.mjs` を実行し、`SRI_MATCH` と `CDN_LATEST`（または意図した版）になることを確認する
5. `npm test`（admin-html の SEC-03/SEC-12 と SEC-40 のテスト）を全 PASS させる
6. `npm run build` 後に `npm run test:e2e` を全件実行する。E2E は unpkg をインターセプトしないため実 CDN バンドルに対して検証される。加えて `evidence/2026-05-24/verify-comprehensive.mjs` を雛形に 3 デバイスの認証後 CMS 画面エビデンスを取得する（4.9章）
7. 2.2.1章の採用技術一覧・4.11.1章の棚卸し表・改訂履歴を更新し、staging へ PR。staging.reiwa.casa で実ログイン確認後、ユーザー承認を得て main へ反映する

### 4.11.5 Node.js・Cloudflare Pages ビルド環境の更新手順

- **パッチ更新**（例: `.nvmrc` 22.12.0 → 22 系最新）: `.nvmrc` を更新し、`npm test`・`npm run build`・`npm run test:e2e` を実行して staging へ。Cloudflare Pages は `.nvmrc` を読むため、デプロイログの Node バージョン表示で反映を確認する
- **メジャー更新**（EOL の 90 日前 warning を起点に計画）: `.nvmrc`、`package.json` の `engines`、`ci.yml` の `node-version` を同時に揃え、Cloudflare Pages の環境変数 `NODE_VERSION`（設定している場合）とビルドイメージの対応バージョンも確認する。宣言箇所の不一致は週次ジョブが `NODE_MAJOR_MISMATCH` として warning にする
- **ビルドイメージ**: Cloudflare が旧イメージの廃止を告知した場合、または四半期の手動確認時に、ダッシュボードで Build system version を確認・更新し、`scripts/dependency-freshness.config.json` の `current`・`lastReviewed`・`reviewed`・`unverified` を更新する。確認できなかった項目は `unverified` に残し、warning として表示し続ける
- **手動確認記録**: 2026-09-23 にダッシュボードで Build command `npm run build`・Build output `dist`・Production branch `main` を確認（`lastReviewed: 2026-09-23`）。ビルドイメージのバージョンと `NODE_VERSION` は未確認のため `unverified` に登録し、次回確認まで warning（`MANUAL_PARTIAL`）

### 4.11.6 Dependabot・npm audit との役割分担

| 対象 | 検知 | 更新 |
| :--- | :--- | :--- |
| GitHub Actions | Dependabot（`.github/dependabot.yml`、`github-actions`、毎週月曜 JST、`target-branch: staging`）＋週次ジョブの記録 | Dependabot PR を staging でレビュー・マージ（SHA 固定の場合は SHA とコメントを同時更新） |
| npm 依存 | `npm audit` と GitHub の Dependabot alerts（リポジトリ設定） | 手動で staging に更新 PR（Dependabot の npm バージョン更新 PR は現状使わない） |
| CDN（Decap CMS） | 週次ジョブ（Dependabot は `<script src>` を扱えない） | 4.11.4章 |
| Node.js・Cloudflare Pages | 週次ジョブ（EOL・パッチ遅れ・不一致・手動確認期限） | 4.11.5章 |

### 4.11.7 定期レビュー

- **週次**（自動）: 上記ジョブ。alert は起票された Issue で追跡し、対処後にクローズする
- **四半期**（1・4・7・10 月の第 1 週、手動）: 直近の `latest.json`（artifact）で warning を棚卸しし、解消するか残す理由を Issue に記録する。Cloudflare Pages ビルド環境を確認して `lastReviewed` を更新する。棚卸し表（4.11.1章）に新しい npm 管理外依存が増えていないかを確認する（新しい CDN スクリプトは `public/`・`src/` を走査して自動で対象になる）

---

**最終更新**: 2026年9月24日（v1.76）
