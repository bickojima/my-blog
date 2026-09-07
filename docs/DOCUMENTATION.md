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
| config.yml base_url | `https://reiwa.casa` | `https://staging.reiwa.casa` |
| config.yml branch | `main` | `staging` |
| OAuth App | My Blog CMS | tbiのブログ CMS (staging) |
| [STAGING]ラベル | 非表示 | 表示 |

staging環境の検知:
- `Base.astro`: 環境変数`CF_PAGES_BRANCH`が`main`以外の場合に[STAGING]表示
- `admin/index.html`: `hostname`が`reiwa.casa`以外の場合に[STAGING]表示

#### FR-22〜FR-28 個人ブログ化ロードマップ（2026-07-04）

技術テストサイトから個人ブログへの段階的移行を目的として、GitHub issue #81〜#89（[公開準備]系・機能系）で追加した要件群。

| 要件 | 環境別の値・挙動 |
|:---|:---|
| FR-22 site/canonical | `astro.config.mjs`の`site`はconfig.ymlの`base_url`/`branch`と同じくブランチ別手動管理（staging: `https://staging.reiwa.casa`、main: `https://reiwa.casa`）。マージ時の確認観点は4.6.2章参照 |
| FR-23 OGP | 記事ページは`summary`→description、`thumbnail`→og:image（絶対URL化）。画像がない場合は`twitter:card`を`summary`にフォールバックする（プレースホルダ画像は生成しない） |
| FR-24 RSS | `/rss.xml`、draft記事除外、date降順。`<link rel="alternate" type="application/rss+xml">`で自動検出対応 |
| FR-25 サイトマップ | `/sitemap-index.xml` + `/sitemap-0.xml`、`filter`で`/admin/`配下を除外 |
| FR-26 タグ一覧 | `/tags/`、`ArchiveNav.astro`から導線 |
| FR-27 前後記事ナビ | 記事詳細フッターに前/次記事リンク（タイトル付き）。最古・最新記事では片側のみ表示 |
| FR-28 ページネーション | `pageSize: 10`。1ページに収まる記事数の間は`/page/`配下のルートは生成されない |

staging環境のrobots.txtは`Disallow: /`を維持し、mainマージ時のみ`Allow: /` + `Sitemap:`行に切り替える（2.5.4章、4.6.2章参照。Bug #41再発防止）。

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
| SEC-02 | XSS防止（テンプレート）: HTML埋め込み変数をエスケープする | `functions/auth/callback.js` | escapeForScript()でHTML特殊文字をエスケープ |
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
| SEC-22 | OAuthコールバックセキュリティヘッダー: トークン応答にCache-Control: no-store, X-Content-Type-Options, X-Frame-Options, CSPを設定する | `functions/auth/callback.js` | トークン漏洩・キャッシュ防止 |
| SEC-23 | 公開ページCOOP/CORP/X-Frame-Options: `/*`セクションにも管理画面と同一値のCOOP/CORP/X-Frame-Optionsを設定し、Bug #28のAppend動作で安全に重複させる | `_headers` | 同一値重複は安全（ブラウザ動作に影響なし） |
| SEC-24 | Zodスキーマ厳格化: title max(200), date YYYY-MM-DD正規表現, tags max(50)/max(20), thumbnail startsWith('/images/'), summary max(500) | `content.config.ts` | 入力値を型＋値域の両面で制約 |
| SEC-25 | ビルドスクリプト防御強化: シンボリックリンクスキップ、ファイルサイズ上限(50MB)、ピクセル数上限(50Mピクセル)、gray-matterエンジン無効化、パス境界チェック | `scripts/`, `src/integrations/` | ピクセルフラッド・シンボリックリンク攻撃防止 |
| SEC-26 | OAuth HTTPメソッド制限: OAuth関数をonRequestからonRequestGetに変更し、POST/PUT/DELETE等の不要なHTTPメソッドを拒否する | `functions/auth/` | Cloudflare Functions のメソッド別ハンドラ |

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
| SEC-02 | XSS防止（テンプレート） | auth-functions | 2.3.1章 #1 | M-02 | 充足 |
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
| SEC-22 | OAuthコールバックセキュリティヘッダー | auth-functions | 2.3章（レスポンスヘッダー検証） | M-02 | 充足 |
| SEC-23 | 公開ページCOOP/CORP/X-Frame-Options | fuzz-validation, build | 2.7.8章, 2.5.1章 | M-02 | 充足 |
| SEC-24 | Zodスキーマ厳格化 | fuzz-validation | 2.7.2〜2.7.6章 | M-09 | 充足 |
| SEC-25 | ビルドスクリプト防御強化 | build | ビルドパイプライン検証 | M-02 | 充足 |
| SEC-26 | OAuth HTTPメソッド制限 | auth-functions | 2.3章 | M-02 | 充足 |

**充足状況: 全要件（FR-01〜FR-28, CMS-01〜CMS-19, NFR-01〜NFR-08, SEC-01〜SEC-26）がテストで充足されている。未テスト要件なし。**

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
│   ├── _redirects                      # URLリダイレクト規則
│   └── robots.txt                      # クローラー制御
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
| SSG | Astro | v5.17.1 | 静的サイト生成 |
| CMS | Decap CMS | v3.10.0 | コンテンツ管理 |
| ホスティング | Cloudflare Pages | - | 静的配信 + Functions |
| 認証 | GitHub OAuth App | - | CMS管理者認証 |
| 画像処理 | sharp | v0.34.5 | 画像圧縮・回転・リサイズ |
| Web実装方針 | Google Modern Web Guidance | 公式ガイド準拠 | 独自実装部のモダンWeb機能・アクセシビリティ・パフォーマンス設計指針 |
| テスト（単体・統合） | Vitest | v4.0.18 | 単体テスト・統合テスト・セキュリティ検証・基本機能保護（588テスト、記事数により変動） |
| テスト（E2E） | Playwright | v1.58.2 | ブラウザE2Eテスト（PC/iPad/iPhone 444テスト、うち8件はデバイス固有条件でスキップ） |
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

GitHub の認可 URL にリダイレクトする。`redirect_uri` はリクエストのオリジンから自動構築される。

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
    // Step 2: 親ウィンドウからの応答を待機（オリジン検証）
    window.addEventListener("message", function(event) {
      if (event.origin !== expectedOrigin) return;
      // Step 3: トークン送信（XSSエスケープ済み）
      const msg = "authorization:github:success:" + JSON.stringify({token, provider});
      window.opener.postMessage(msg, event.origin);
      // Step 4: ポップアップを閉じる
      window.close();
    }, { once: true });
  </script>
`);
```

### 2.4.6 セキュリティ上の考慮事項

| 項目 | 対策 |
| :--- | :--- |
| Client Secret の保護 | `OAUTH_CLIENT_SECRET` はサーバーサイド（Cloudflare Functions）でのみ使用し、ブラウザには露出しない |
| トークン交換 | 認可コード→アクセストークンの交換はサーバーサイドで実行する（ブラウザで行うと Secret が漏洩する） |
| postMessage のオリジン検証 | callback.js は `expectedOrigin`（サーバーサイド算出）で `postMessage` の送信先を制限し、`event.origin` で受信元を検証する。ワイルドカード `"*"` は使用しない |
| scope の最小化 | `public_repo,read:user` のみを要求し、不要な権限は取得しない。`repo` スコープ（プライベートリポジトリ含む全アクセス）は使用しない |
| XSS 対策 | callback.js でトークン値をHTMLに埋め込む際に `escapeForScript()` でエスケープし、スクリプト注入を防止する。admin/index.html では innerHTML を使用せず DOM API（createElement/textContent）で安全にDOM構築する |
| CDN バージョン固定 | Decap CMS の CDN URL はキャレット範囲（`^3.10.0`）ではなく正確なバージョン（`3.10.0`）を指定し、サプライチェーン攻撃のリスクを軽減する |
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
| Node.js バージョン | 18以上 |

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
| robots.txt | `Allow: /` | `Disallow: /`（インデックス防止） |
| CMS config.yml base_url | `https://reiwa.casa` | `https://staging.reiwa.casa` |
| CMS config.yml branch | `main` | `staging` |

#### 2.5.4.1 ブランチ運用

```
main (本番)  ←── merge ── staging (テスト) ←── merge ── feature/*
     │                        ↑
     └── 定期マージ ──────────┘ (コンテンツ同期)
```

- 新機能: `feature/*` → `staging` へPR → テスト → `staging` → `main` へPR
- コンテンツ同期: `main` の記事更新を `staging` に定期マージ
- `config.yml` の `base_url` / `branch` は各ブランチで手動管理。staging → main マージ時は main の値を維持する。

#### 2.5.4.2 サイトURL動的化

`public/admin/index.html` 内のサイトURL参照（`addSiteLink`、`showPublicUrl`）は `window.location.origin` で動的取得する。これにより、本番（`reiwa.casa`）・テスト（`staging.reiwa.casa`）・ローカル開発（`localhost`）のいずれの環境でも正しいURLが表示される。

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
  type: 'content',
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
  type: 'content',
  schema: z.object({
    title: z.string(),
    order: z.number().default(0),
    draft: z.boolean().optional().default(false),
  }),
});
```

> **注意**: `slug`フィールドはAstroの`type: 'content'`コレクションで予約語のため、Zodスキーマには含めない。固定ページの`slug`はfrontmatterで定義されCMSとテストで使用されるが、Astro側ではファイル名からの自動推論で処理される。

### 3.2.3 organize-posts.mjs の処理仕様

| 処理項目 | 内容 |
| :--- | :--- |
| 対象ディレクトリ | `src/content/posts/` |
| 入力 | 全`.md`ファイル（再帰スキャン） |
| 処理1 | frontmatterの`date`を解析し、`yyyy/mm/`ディレクトリを決定 |
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
  branch: main
  base_url: https://reiwa.casa
  auth_endpoint: /auth
```

`base_url`にはOAuth認証サーバーのURLを指定する。`auth_endpoint`はCloudflare Functionsの認証エンドポイントである。

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

---

## 4.3. フォーク転用ガイド

本プロジェクトを別サイト向けにフォークして転用する場合、以下の箇所を変更する必要がある。

### 4.3.1 サイト固有の変更箇所一覧

| No. | ファイル | 変更箇所 | 現在値 | 説明 |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `public/admin/config.yml` | `backend.repo` | `bickojima/my-blog` | GitHubリポジトリ名 |
| 2 | `public/admin/config.yml` | `backend.base_url` | `https://reiwa.casa` | 本番ドメイン |
| 3 | `src/layouts/Base.astro` | サイトタイトル | `tbiのブログ` | ヘッダー・フッターに表示される |
| 4 | `public/robots.txt` | Sitemap URL | `https://reiwa.casa/sitemap.xml` | サイトマップURL |
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

---

## 4.6. ブランチマージ手順

### 4.6.1 staging → main マージ手順

staging ブランチで開発・テスト完了後、main ブランチにマージする手順を示す。

```bash
# 1. staging ブランチで全テスト PASS を確認
git checkout staging
npm test
npm run build && npm run test:e2e

# 2. main ブランチに切り替え、最新を取得
git checkout main
git pull origin main

# 3. staging をマージ
git merge staging

# 4. config.yml のコンフリクト解消（必須）
#    staging の値 → main の値に修正:
#    - branch: staging → branch: main
#    - base_url: https://staging.reiwa.casa → base_url: https://reiwa.casa
#    手動で確認・修正後:
git add public/admin/config.yml
git commit  # マージコミット完了

# 5. main ブランチでテスト実行
npm test

# 6. main にプッシュ
git push origin main
```

### 4.6.2 マージ時の確認観点

| No. | 確認項目 | 確認方法 | 備考 |
|:---|:---|:---|:---|
| 1 | config.yml の `branch` が `main` | ファイル確認 | staging の値が残っていないこと |
| 2 | config.yml の `base_url` が `https://reiwa.casa` | ファイル確認 | staging URL が残っていないこと |
| 3 | Vitest 全テスト PASS | `npm test` | テスト件数が staging と一致すること |
| 4 | ビルド成功 | `npm run build` | エラーなく完了すること |
| 5 | E2E テスト PASS（可能な場合） | `npm run test:e2e` | ローカル環境のみ |
| 6 | robots.txt が main 用 | ファイル確認 | staging の `Disallow: /` が混入していないこと（Bug #41再発防止） |
| 7 | astro.config.mjs の `SITE_URL` が `https://reiwa.casa` | ファイル確認 | staging URL（`https://staging.reiwa.casa`）が残っていないこと。canonical/OGP/RSS/sitemapの絶対URLに影響する |

### 4.6.3 main → staging コンテンツ同期

本番で CMS から記事が追加・編集された場合、staging に反映する。

```bash
git checkout staging
git merge main
# config.yml のコンフリクト解消: staging の値を維持
#    - branch: staging
#    - base_url: https://staging.reiwa.casa
git add public/admin/config.yml
git commit
git push origin staging
```

### 4.6.4 config.yml / astro.config.mjs / robots.txt の環境別値

| 項目 | main（本番） | staging（テスト） |
|:---|:---|:---|
| `backend.branch`（config.yml） | `main` | `staging` |
| `backend.base_url`（config.yml） | `https://reiwa.casa` | `https://staging.reiwa.casa` |
| `SITE_URL`（astro.config.mjs） | `https://reiwa.casa` | `https://staging.reiwa.casa` |
| `robots.txt` | `Allow: /` + `Sitemap: https://reiwa.casa/sitemap-index.xml` | `Disallow: /`（インデックス防止。Sitemap行なし） |

**注意**: これらの値はブランチ固有であり、マージ時に必ず対象ブランチの値に修正すること。マージツールの自動解決に任せず、手動で確認する（Bug #41再発防止）。

---

## 4.7. 品質向上策・基本機能保護・定期セキュリティ診断

第三者セキュリティ診断（2026年2月21日実施）で検出された問題と対策を踏まえ、再発防止のための品質向上策と定期診断の運用を定める。

セキュリティ要件は第1部 1.4.2章（SEC-01〜SEC-26）として定義されている。本章では運用面での品質基準、再発防止策、定期診断の手順を定める。個人情報保護については4.8章を参照。

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
| `config.yml`（CMS設定） | **中** | backend設定（name, repo, branch, base_url, auth_endpoint）が正しいか。コレクション設定が有効か |
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
| 対象範囲 | フロントエンド（admin/index.html）、サーバーサイド（functions/auth/）、外部依存関係（CDN、npm） |
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

### 4.8.3 pre-commit hook の検査内容

1. **author email検査**: `git config user.email` が個人メールパターン（gmail.com, yahoo.co.jp, hotmail等）に該当する場合、コミットを拒否
2. **ステージファイル内容検査**: ステージされたテキストファイル内に特定の個人情報パターンが含まれる場合、コミットを拒否

**注意**: `.git/hooks/` はgit管理外のため、リポジトリをクローンした場合はhookを再設定する必要がある。

## 4.9. 動作確認エビデンス取得

### 4.9.1 概要

コード変更のstaging検証時およびmainマージ前に、Playwright自動検証によるスクリーンショット付きHTMLエビデンスレポートを作成する。

### 4.9.2 エビデンス構成

| 項目 | 内容 |
|:---|:---|
| 保存先 | `evidence/YYYY-MM-DD/` フォルダ（日付ごとに整理） |
| レポート形式 | `report.html`（画像埋め込み、PC/iPad/iPhone 3デバイス横並び表示） |
| スクリーンショット | `screenshots/`, `site-interactive/`, `cms-interactive/` サブフォルダ |
| テストデバイス | PC (1280x800) / iPad Pro 11 (834x1194) / iPhone 14 (390x844) |

### 4.9.3 検証スクリプト

| スクリプト | 用途 | テスト数 |
|:---|:---|:---|
| `verify-staging.mjs` | 基本動作確認（サイト表示・セキュリティヘッダー） | 7 checks × 3 devices |
| `verify-site-interactive.mjs` | サイト操作性（ドロップダウン展開・ページ遷移等） | 10 scenarios × 3 devices |
| `verify-cms-interactive.mjs` | CMS操作性（ボタン押下・メニュー展開・モーダル・画像アップロード） | 16 scenarios × 3 devices |
| `verify-cms-crud.mjs` | CMS CRUD操作（記事作成/編集/削除・画像アップロード・タグ・固定ページ） | 16 scenarios × 3 devices |
| `verify-security.mjs` | セキュリティ検証（XSS・CSP・OAuth・CDN・postMessage等） | 10 checks × 1 device |
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

セキュリティ要件の充足を自動検証し、スクリーンショット付きで記録する。

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
| config.ymlの`base_url`がリモートURLだとlocalhost上のpostMessageがクロスオリジン拒否される | エビデンス収集時はconfig.ymlの`base_url`をlocalhostに一時変更（コミット前に復元必須） |

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

**自動検証（エビデンス取得時に毎回実行）:**
- `verify-security.mjs` によるセキュリティ要件（SEC-01〜SEC-26）の自動検証
- XSS耐性、CSPヘッダー、OAuth scope、CDNバージョン、postMessage origin等を自動チェック
- 検証結果はスクリーンショット付きで記録

**手動レビュー（機能追加時）:**
- admin/index.html 変更時: innerHTML不使用、var不使用、use strict確認
- _headers 変更時: Bug #28（ヘッダー重複）の回避確認
- OAuth関連変更時: scope最小化、stateパラメータ確認
- CDN変更時: バージョン固定、integrity属性確認

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
2. **レポート生成**: `report.html` を更新し、全スクリーンショットをPC/iPad/iPhone横並びで確認可能な形式にまとめる
3. **作業完了報告書生成**: 変更がある場合は `work-completion-report.html` を作成し、システム要件変更の有無・テスト結果・エビデンス確認結果を記録する
4. **フォルダ整理**: デバッグ用スクリーンショット・一時ファイルを削除し、正式なフォルダ構成のみを維持する

**フォルダ構成（標準）:**
```
evidence/YYYY-MM-DD/
├── report.html                    # エビデンスレポート（画像参照、PC/iPad/iPhone横並び）
├── work-completion-report.html    # 作業完了報告書（要件変更確認、テスト結果）
├── verify-staging.mjs             # Part 1: サイト基本動作検証スクリプト
├── verify-site-interactive.mjs    # Part 2: サイト操作性検証スクリプト
├── verify-cms-interactive.mjs     # Part 3: CMS操作性検証スクリプト
├── verify-cms-crud.mjs            # Part 4: CMS CRUD操作検証スクリプト
├── verify-security.mjs            # Part 5: セキュリティ検証スクリプト
├── *-results.json                 # 各検証の結果JSON
├── screenshots/                   # Part 1: サイト基本動作スクリーンショット
├── site-interactive/              # Part 2: サイト操作性スクリーンショット
├── cms-interactive/               # Part 3: CMS操作性スクリーンショット
├── cms-crud/                      # Part 4: CMS CRUD操作スクリーンショット
└── security/                      # Part 5: セキュリティ検証スクリーンショット
```

**CMS CRUDエビデンス取得時の特記事項:**
- verify-cms-crud.mjsはDecap CMS OAuth 3ステップハンドシェイクをシミュレートする（詳細は4.9.9章参照）
- 実行前にconfig.ymlの`base_url`をlocalhost（テストサーバーURL）に一時変更する必要がある
- 実行後は必ず`base_url`を本来の値（`https://staging.reiwa.casa` or `https://reiwa.casa`）に復元してからコミットする

### 4.10.4 品質指標

| 指標 | 目標値 | 現状 |
|:---|:---|:---|
| Vitestテスト全PASS | 100% | 588/588 (100%) |
| Playwright E2Eテスト全PASS | 100% | 直近実行: 436 PASS・8 skip / 444件、flakyなし (100%) |
| セキュリティ検証全PASS | 100% | 10/10 (100%) |
| ボタン重なり検出 | 0件 | 0件 |
| 未テスト要件 | 0件 | 0件 |
| バグ再発 | 0件 | 0件 |

---

**最終更新**: 2026年9月7日（v1.52）
