# tbiのブログ テスト計画書・テストケース一覧

## 改訂履歴

| 版数 | 日付 | 内容 |
| :--- | :--- | :--- |
| 1.0 | 2026-02-15 | 初版作成 |
| 1.1 | 2026-02-15 | JTCテスト計画書体系に再構成、テスト手法を追加 |
| 1.2 | 2026-02-15 | テスト手法の実装詳細を追記、E2Eテスト提案を追加、テスト実行結果を追記 |
| 1.3 | 2026-02-15 | Playwright E2Eテスト実装（PC/iPad/iPhone 3デバイス×30テスト=90テスト）、テスト実行結果を更新 |
| 1.4 | 2026-02-15 | admin-htmlテスト更新（ドロップダウンボトムシート化・EXIF修正に対応）、テスト実行結果を更新（237テスト全PASS） |
| 1.5 | 2026-02-15 | admin-htmlテストに本番サイトリンク検証を追加（CMS-11対応） |
| 1.6 | 2026-02-15 | Slate codeblockクラッシュ対策テスト追加（void node CSS、エラーハンドラ、デバウンス、touchmove除外）、172テスト全PASS |
| 1.7 | 2026-02-20 | 本番/テスト環境分離対応: admin-htmlテストのサイトURL検証を動的化（`window.location.origin`）、E2Eテストの公開URL検証を環境非依存化 |
| 1.8 | 2026-02-20 | 固定ページ・ドロップダウンのテスト追加: cms-config 5件、content-validation 4件、build 9件追加（218テスト）。E2E site.spec.ts にE-20（固定ページ表示）4件・E-21（ヘッダーナビドロップダウン）7件追加（237テスト） |
| 1.9 | 2026-02-20 | FR-10充足化（url-map.jsonテスト6件追加）、CMS-14追加（コレクション表示順序テスト1件）、全要件トレーサビリティ充足、コレクション順序変更（posts先頭） |
| 1.10 | 2026-02-21 | テスト動的化（ハードコードコンテンツ排除）、ヘッダーナビ条件分岐テスト11件追加、境界値・一意性テスト6件追加、ビルドテストをソースデータ動的参照に改修（242テスト） |
| 1.11 | 2026-02-21 | 固定ページ番号バッジフォーマットテスト追加（admin-html 68件）、テスト件数更新（243テスト） |
| 1.12 | 2026-02-21 | 固定ページ下書きバッジテスト更新（#10説明更新）、Decap CMS v3.10.0互換性テスト追加（sortable_fields形式検証）、orderデフォルトソート昇順テスト追加（245テスト） |
| 1.13 | 2026-02-21 | CMS-16要件追加、要件トレーサビリティ検証テスト2件追加（#42,#43）、テスト基盤変更履歴補完（247テスト） |
| 1.14 | 2026-02-21 | 第三者セキュリティ診断対応: OAuthスコープテスト更新（public_repo,read:user）、admin-htmlテスト更新（target属性DOM API対応）、テスト対象外からurl-map.json削除（テスト実装済みのため矛盾解消）、終了基準テスト件数更新（247+240=487） |
| 1.15 | 2026-02-21 | セキュリティ検証テスト追加: admin-html 2.6.12章（9件）、auth-functions 2.3.1章（4件）。SEC-01〜SEC-09要件の充足テスト。終了基準テスト件数更新（260+240=500） |
| 1.16 | 2026-02-21 | 第2回ペネトレーションテスト対応: SEC-10〜SEC-13テスト追加。build.test.mjs セキュリティヘッダー検証5件（2.5.1章）、auth-functions セキュリティ検証3件追加（2.3.1章 #5〜#7）、admin-html SRI検証2件追加（2.6.12章 #10〜#11）。終了基準テスト件数更新（270+240=510） |
| 1.17 | 2026-02-21 | SEC-14〜SEC-20対応: fuzz-validation.test.mjs新規追加（207テスト）。ファズテスト（XSS/SQLi/パストラバーサル/コマンドインジェクション/プロトタイプ汚染ペイロード注入）、order境界値テスト（最大値/最小値/小数/NaN/Infinity/文字列/配列/null）、slugバリデーション（攻撃ペイロード/予約語/大文字/日本語/特殊文字）、OAuth異常値注入テスト、セキュリティヘッダー包括検証（HSTS/COOP/CORP/Permissions-Policy）、情報漏洩防止テスト、コードセキュリティ品質テスト。ビルドパイプライン再構成（build:raw+buildテスト必須化）。order=-1バグ修正・再発防止。終了基準テスト件数更新（477+240=717） |
| 1.18 | 2026-02-21 | バグ#27（iPhone記事保存失敗）修正対応: admin-htmlに`</script>`閉じタグ検証テスト2件追加（2.6.1章）、fuzz-validationに管理画面ヘッダーオーバーライド検証テスト5件追加（2.7.12章）、frame-ancestorsテスト更新。終了基準テスト件数更新（484+240=724） |
| 1.19 | 2026-02-21 | 機能観点の要件定義対応: FR-15〜FR-21, NFR-05要件追加。cms-config基本機能保護テスト5件追加（2.4.1章）、build パイプライン検証1件追加（2.5.2章）、admin-html環境分離検証1件追加（2.6.13章）。終了基準テスト件数更新（491+240=731） |
| 1.20 | 2026-02-21 | バグ#28（Cloudflare Pages `_headers`ヘッダー重複送信）修正対応: build.test.mjsセキュリティヘッダー検証を5件→7件に再構成＋重複防止検証2件追加（2.5.3章）。fuzz-validationヘッダーテスト4件修正＋1件追加（2.7.8章、2.7.12章）。終了基準テスト件数更新（496+240=736） |
| 1.21 | 2026-02-21 | バグ#29（CSP connect-src blob:不足による画像付き記事保存失敗）修正対応: build.test.mjs CSP connect-src blob:検証1件追加（2.5.1章 #8）、fuzz-validation CSP connect-src blob:検証1件追加（2.7.12章）。終了基準テスト件数更新（498+240=738） |
| 1.22 | 2026-02-21 | E2E CRUDテスト追加（E-22〜E-24: cms-crud.spec.ts 11テスト×3デバイス=33テスト）、アクセシビリティテスト追加（E-25〜E-27: accessibility.spec.ts 6テスト×3デバイス=18テスト）。色コントラスト比修正、見出し階層修正。NFR-06要件追加。終了基準テスト件数更新（498+291=789） |
| 1.23 | 2026-02-23 | 第三者セキュリティ・品質レビュー対応: SEC-21〜SEC-26要件追加。Bug #30〜#34修正（下書き記事公開、モバイルhover/tapバグ、モーダル重複、タグURL未エンコード、Windowsパス問題）。Zodスキーマ厳格化（date正規表現、title/tags長さ制限）。ビルドスクリプト防御強化（シンボリックリンク・ピクセルフラッド・ファイルサイズ上限）。OAuth HTTPメソッド制限。_headers COOP/CORP/X-Frame-Options公開ページ追加。テストWindows互換性修正（パスセパレータ・CRLF正規化）。hiddenByDropdown→hiddenByOverlayリネーム。終了基準テスト件数更新（519+375=894） |
| 1.24 | 2026-05-22 | Modern Web Guidance準拠検証追加（staging先行）: トップページ先頭サムネイルのLCP優先度、コンテナクエリ、ナビゲーション`aria-expanded`同期、CMS独自プレビュースタイルのコントラスト、スクリーンショットエビデンス保存を検証。NFR-07対応 |
| 1.24 | 2026-02-23 | 個人情報保護対応: git履歴から個人情報を完全削除（Bug #35）。pre-commit hookによる個人情報混入防止を運用手順（DOCUMENTATION.md 4.8章）に記載。テスト件数に変更なし |
| 1.25 | 2026-02-23 | エビデンス取得方針を大幅拡充: CMS操作性検証（T01〜T16, 16シナリオ×3デバイス=48テスト）、サイト操作性検証（S01〜S10, 10シナリオ×3デバイス=30テスト）を追加。全スクリーンショットに赤枠アノテーション必須化。過去バグ由来の検証マトリクス（Bug #1,#4,#5,#6,#7,#8,#9,#11,#13,#14,#15,#29,#30,#31,#32,#33の16件）を追加。記事編集画面・画像アップロード画面・メディアライブラリのエビデンスを重点取得 |
| 1.26 | 2026-02-23 | CMS CRUD操作エビデンス追加（verify-cms-crud.mjs: T17〜T32, 16シナリオ×3デバイス=48テスト）、セキュリティ検証エビデンス追加（verify-security.mjs: SEC01〜SEC10, 10項目）。検証スクリプト一覧にverify-cms-crud.mjs・verify-security.mjsを追加。継続的品質・セキュリティ改善フレームワークをDOCUMENTATION.md 4.10章に新設 |
| 1.27 | 2026-02-24 | CMS-17（記事デフォルトソート日付降順）・CMS-18（記事月別グルーピング）対応。Vitestテスト3件追加（#48〜#50: sortable_fields, view_groups検証）。E2E E-36追加（3テスト×3デバイス=9テスト: ソート順検証、view_groupsボタン表示、レイアウト崩れ検証、スクリーンショットエビデンス取得）。E2Eスクリーンショットエビデンスルール追加（4.1.6章: 認証後スクリーンショット必須、context.route()による3ステップOAuthハンドシェイク方式を文書化）。全522+384=906テスト |
| 1.28 | 2026-02-25 | CMS-19（グルーピング降順表示）対応。admin-htmlテスト1件追加（reverseViewGroups関数検証） |
| 1.29 | 2026-02-26 | CMS-19拡張（年月グルーピングUI改善）。config.yml view_groups簡略化（年削除→年月のみ）。admin-htmlテスト3件追加（activateDefaultGrouping, formatGroupHeadings, createMonthSelector）。cms-configテスト view_groups検証を1グループに更新 |
| 1.30 | 2026-05-22 | Bug #37修正対応: CMS-19の年月選択プルダウンをスクロール動作から選択年月のみ表示するフィルター動作へ変更。admin-htmlテスト #14 を`applyMonthFilter`・`activeFilter`・`scrollIntoView`不使用の検証に更新し、E2Eエビデンス`verify-cms19-month-filter.mjs`を追加 |
| 1.31 | 2026-05-24 | Bug #38修正対応: CMS-19年月フィルター操作時のハングアップを修正。ネイティブselect操作中にoptionを再構築しないよう`optionsSignature`で見出し変更時のみ再生成。E2Eにselect操作中のMutationObserver再実行耐性検証を追加 |
| 1.32 | 2026-05-24 | プロジェクト方針追加: ドキュメント更新をコード変更の完了条件化、UI変更時の実操作E2Eを必須化。Modern Web Guidance横展開として、`content-visibility`、`contain-intrinsic-size`、`:focus-visible`、`aria-label`/`aria-labelledby`、`text-wrap`の検証を追加 |
| 1.33 | 2026-06-11 | Modern Web GuidanceレビューF-1〜F-10の再発防止テスト追加。ナビEscape/Tab離脱、タッチ領域、CMSセレクターa11y、本文リンク、コードブロックtabindex、画像寸法属性を検証。Vitest 562件、E2E 432件（424実行+8スキップ）へ更新 |
| 1.34 | 2026-07-04 | ドキュメント整理: 2.7章ファズテスト件数の表記を実測に合わせ214件→215件に修正（テスト実体の変更なし） |
| 1.35 | 2026-07-04 | 個人ブログ化ロードマップ（FR-22〜FR-28, NFR-08）のテストケースを追加: robots.txt、RSS下書き除外、タグ件数、ページネーションの検証と実操作E2E 4件を追加。build.test.mjs 67→90件、Vitest合計 562→585件、E2E 444件へ更新 |
| 1.36 | 2026-07-05 | 2.5.4章にBug #43再発防止テスト追加: 本文リンク色（--color-link）のライト/ダーク双方のコントラスト比を実値から計算し4.5:1以上を検証（3件目として追加）。build.test.mjs 90→91件、Vitest合計 586件へ更新 |
| 1.37 | 2026-07-05 | Bug #44対応: E-36（`cms-operations.spec.ts`）のスクリーンショット出力先を過去日付固定の`evidence/2026-02-24/`から`test-results/`（gitignore対象）へ変更。2.2章のE-36説明を更新。テスト件数増減なし |
| 1.38 | 2026-08-09 | Bug #45対応: 2.5.5章のrobots.txt環境別ポリシー検証をブランチ対応に変更（`astro.config.mjs`の`SITE_URL`でstaging/mainを判定）。テスト件数増減なし（Vitest 586件） |
| 1.39 | 2026-08-11 | Issue #97完了対応: Bug #46のVitest探索範囲固定テスト、Bug #47のCMS E-28タイムアウト設定テストを追加。build.test.mjs 91→93件、Vitest合計586→588件。全444件E2Eを再実行し436 PASS・8 skip・flakyなしを確認 |
| 1.40 | 2026-08-11 | Issue #97のstaging/main反映後結果を追記。mainのtest-and-build・Cloudflare Pages成功、本番27/27・認証済みCMS 3/3のデプロイ後再確認を記録 |
| 1.41 | 2026-09-09 | FR-29のE-46を追加。検索除外の固定ページをfrontmatterから動的取得し3デバイスで表示・リンク・アクセシビリティ・noindexを確認。E2E定義は444→450件。noindex・sitemap除外のビルド検証5件、CMS保存でフロントマター項目が消えないことのCMS設定検証3件、固定ページ2件増によるコンテンツ検証の動的展開でVitestは588→610件 |
| 1.42 | 2026-09-09 | FR-29追加QA: noindex固定ページをヘッダーナビから除外。ビルド検証を更新し、実メニュー操作E2Eを3件追加（453定義） |
| 1.43 | 2026-09-09 | main反映後の本番実機検証（E-46の9件）を追記。E-46にメニュー除外を含めた際に更新漏れだったE2E件数（450→453件、442→445 PASS）と最新実行結果を実測値へ是正 |
| 1.44 | 2026-09-20 | セキュリティIssue #109〜#113対応: auth-functionsテスト8件追加（SEC-27 送信先オリジン許可リスト検証、SEC-22 全レスポンスCache-Control検証）。buildテスト4件追加（SEC-25 sharp pixel limit検証、SEC-28 公開ページCSPメタタグ検証）。Vitest 610→622件（全622件PASS）へ更新 |
| 1.45 | 2026-09-20 | セキュリティ監査run-2対応（Issue #114, #115, #117項目4/項目11）: 2.5章にurl-map.json下書き除外テスト2件追加（No.51〜52、SEC-29/Bug #48再発防止）でbuild.test.mjs 102→104件。2.5.1章・2.7.8章・2.7.12章の該当8件の説明を「/admin/*にオーバーライドで設定」から「/admin/*では再定義せず/*から継承」（Issue #115, Bug #49）へ書き換え。fuzz-validation.test.mjsの重複検証テスト1件（ガード条件`if (globalVal && adminVal)`により何も検証しない空のテストになっていた）を、ガード条件を撤廃し3ヘッダーとも実効的に検証する形へ書き換え（件数増減なし）。3.1章・4.3章のVitest件数を610→622→**624**（本改訂の実測値）へ更新。SEC-31（OAuthハンドシェイクのメッセージリスナー堅牢化）・SEC-32（画像正規化処理のtry/catch保護＋出力バッファ上限）はコード実装済みだが自動回帰テストが未実装であることを3.1章に明記（フォローアップ要） |
| 1.46 | 2026-09-20 | Astro 7.3.3 へメジャーアップ（Content Layer glob loader、`render(entry)`、`page.id`）。テスト件数増減なし（Vitest 624件全PASS）。サイト系 E2E を PC で再実行: `site.spec.ts` 37 PASS / 1 skip、`app-info.spec.ts` 3 PASS。実行環境の Node 要件を 22.12.0 以上へ更新 |
| 1.47 | 2026-09-20 | 本番CMS CDNを Decap CMS `3.10.0` から `3.16.2` へ更新。既存の admin-html 検証（SEC-03 バージョン固定、SEC-12 SRI `integrity` / `crossorigin`、CDN `<script>` 閉じタグ）で新URLを確認。テスト件数増減なし。CMS系E2E（`cms-customizations.spec.ts` / `cms-operations.spec.ts` / `cms.spec.ts`、`--project=PC`）は 77 PASS・4 skip（E-34 モバイル固有は PC 対象外） |
| 1.48 | 2026-09-20 | SEC-31/SEC-32 の自動回帰テストを追加。`auth-functions.test.mjs` に4件（2.3.1章 #8〜#11）、`build.test.mjs` に3件（2.5.10章 #1〜#3）。3.1章の未テスト例外と1.6.2章の例外注記を削除。Vitest 624→**631**件（全PASS、`npx vitest run` 実測。内訳: auth-functions 25→29、build 104→107） |
| 1.49 | 2026-09-20 | Bug #50: 本番マージ前のローカル E2E 全件と `verify-comprehensive.mjs` を必須化し、「可能な場合」を廃止。**CI に Playwright は載せない**（Q23）。雛形はシナリオ FAIL で非ゼロ終了。build.test.mjs に手順固定テスト4件を追加。Vitest 631→**635**件 |
| 1.50 | 2026-09-20 | Issue #117 項目2/12: SEC-33（CI `contents: read`）、SEC-34（`.assetsignore` 削除）。build 111→113、fuzz 215→216。Vitest 635→**638**件 |
| 1.51 | 2026-09-21 | Bug #51再発防止: `cms-config.test.mjs`にSEC-35（環境固有ファイルの実ブランチ整合性検証）テストを追加（2.4.3章）。SEC-35はブランチ判定結果によって登録するテスト数が変わるため、Vitest合計は**featureブランチ639件／main・staging642件**になる（cms-config: feature 56件／main・staging 59件）。4.3.1・4.3.2章に両文脈の実測を追記 |
| 1.52 | 2026-09-23 | Issue #129: `verify-security.mjs` はSEC01〜SEC10の証跡取得・確認を行うと明記し、SEC-01〜SEC-35全体の検査責務をDOCUMENTATION 1.5.4章のトレーサビリティへ集約。SEC-33〜35の対応するVitestを記載。テスト件数変更なし |
| 1.53 | 2026-09-23 | Issue #117 hardening 対応（判定表: `docs/security/issue-117-hardening-decisions.md`）: 新規 `security-hardening.test.mjs`（2.8章、28件: Bug #52/SEC-29 frontmatter YAML限定 10件〔うち2件は tests/・scripts/ の gray-matter 直接読み込み禁止の静的検証〕、SEC-37 許可リスト単一化 4件、SEC-38 コールバックCSP 2件、SEC-39 JSON.stringifyリテラル 12件）、`build.test.mjs` に SEC-36（Actions SHA 固定）1件（113→114）。既存テストの更新: auth-functions 2.3.1章 #1（escapeForScript→toScriptStringLiteral）、SEC-27 テスト（共有モジュール import を検証）、成功時 Content-Type（`text/html; charset=utf-8`）、fuzz 2.7章 #9/#10（ソース文字列一致→生成リテラルを評価して元トークンと完全一致する挙動検証へ強化、改行テストは実際に改行・U+2028/U+2029 を含むトークンで検証）。件数は増減なし（削除・スキップなし）。Bug #52 の第2経路（`npm run build` が先に実行する Vitest/E2E のテストも gray-matter で `src/content` を直接解析）に対応し、content-validation / cms-config / fuzz-validation / build / e2e app-info の frontmatter 解析を `parseFrontmatter` に置換（テストケースの内容・件数は不変）。Vitest featureブランチ 639→**668**件／main・staging 642→**671**件。実ブラウザE2Eエビデンス `evidence/2026-09-23/issue117/`（OAuth Functions 実コード経由、15/15 PASS） |
| 1.54 | 2026-09-23 | Issue #132: SEC-40（npm管理外依存の鮮度・EOL監視）の判定ロジック・棚卸し・週次ワークフロー設定を検証する `dependency-freshness.test.mjs` 27件を追加（2.9章）。ネットワーク取得はフィクスチャで置換し、`fetch` が呼ばれたら失敗させて `npm test` のオフライン決定性を担保。Vitest **feature 668→695件／main・staging 671→698件** |
| 1.55 | 2026-09-23 | Issue #127（環境値の自動導出）: 環境固有の4項目をファイルから削除し導出する構造に変えたため、SEC-35 のテストを「導出結果の正しさ」の検証へ作り替え。新規 `env-derivation.test.mjs`（2.10章、37件: ビルド時導出16件・CMS 実行時導出14件・main/staging 差分ゼロの静的ガード7件）、`build.test.mjs` に `CF_PAGES_BRANCH 別ビルドの環境値` 15件（main/staging/未設定の3ビルド×5項目、114→129）、`cms-config.test.mjs` の SEC-35 を5件に改訂（旧: feature 1件／main・staging 4件のブランチ別登録 → 全ブランチ共通5件、56→60）。**書き換えた既存テスト（削除・スキップなし）**: cms-config 2.4章 No.3・No.5・No.45（config.yml から branch/base_url を削除したため、config.yml と実行時導出値を deepmerge した実効設定で同じ性質を検証）、2.4.3章 No.51〜55（ブランチ判定＋内部整合 → ホスト別の実効 backend 4件＋config.yml 単体に値が無いこと1件。旧テストは対象の値がファイルから消えたため成立しない）、build 2.5.5章 No.1（SITE_URL リテラルからの環境推定 → ビルド時 CF_PAGES_BRANCH による判定）。E2E E-39「固定ページのorderフィールドはmin=1の数値フィールドである」（本変更で spec の認証が実際に成立するようになり、未認証時用の `body.isVisible()` フォールバックが認証後画面で false になって3デバイスで失敗。数値フィールドの表示・min≥1・編集可を必須とする形に強化。DOCUMENTATION 4.5章 Bug #P127-2）。Vitest feature 695／main・staging 698 → **全ブランチ 751件**。SEC-41対応で `fuzz-validation.test.mjs` にCSP運用時の違反検知3件を追加し、全ブランチ共通 **754件**。E2E に `cms-env-branch.spec.ts`（E-47、4ホスト×3デバイス=12件、実操作保存で書き込み先 ref を実測）を追加し 453→**465件**。エビデンス `evidence/2026-09-23/issue127/` |
| 1.56 | 2026-09-23 | Issue #130（SEC-41）: admin CSP で Cloudflare Insights beacon を許可せず、CSPポリシーは緩和せず、`public/_headers` の方針コメントとCMS実操作E2Eで検証。`fuzz-validation.test.mjs` にadmin CSP・重複ヘッダー防止35件を追加。production/staging 実ホストへPlaywrightで接続し、OAuth/GitHub APIは全面モックして実書込を遮断。PC/iPad/iPhoneで編集・入力・preview・保存要求branchを確認し54/54 PASS（production/staging各3端末の操作、ローカルPC操作、実ホストreadonly）。非Insights CSP違反・機能エラーなし。ローカルiPad/iPhoneは従前証跡 `evidence/2026-09-23/issue130/` を別保存。Vitest 754件、ローカルE2E全465件。証跡 `evidence/2026-09-23/issue130-review/` |
| 1.57 | 2026-09-23 | Issue #127/#130 実測更新: Vitest 754件（fuzz 219件）、Playwright 457 PASS + 8 skip / 465。2.5章を2.5.1〜2.5.13順に整理し、2.10節を第3部前へ移動。包括E2Eの件数は50シナリオID×3デバイス=150検証と訂正。staging実配信の包括E2Eは端末別50/50 PASS。
| 1.58 | 2026-09-24 | #90/#131 履歴移行の完了結果を追記。25 headsをold-OID lease付きatomic pushで更新（exit 0）、live refs 143/143一致。main/staging CI PASS、新規clone `git fsck` PASS（pack 40.14 MiB）、Pages read-only確認を記録。118 read-only PR refsは残存。公開証跡索引 validator を追加。
| 1.59 | 2026-09-24 | 1.6.4章・4.1.6章に残っていた旧エビデンス保存記述（`report.html`/スクリーンショットをコミット前提の記述）をDrive正本方針（DOCUMENTATION.md 4.2.6章・4.10.3章）に統一。Git保持対象（検証JSON・`verify-*.mjs`・索引・小さな非レポートHTML）とDrive正本対象（画像・動画・PDF・`report.html`系）の区別を明記。テスト件数変更なし。 |
| 1.60 | 2026-09-24 | SEC-42 の回帰テストを追加（`commit-identities.test.mjs` 8件）。PR差分と通常push差分のみを検査し、force-pushまたはbefore SHA不在時は新HEAD全履歴を検査すること、tbi/bickojima/GitHub/Dependabotの許可tuple、author/committer両方の拒否、拒否値の非出力を検証。CI workflowのSHA range wiringを静的確認。 |
| 1.61 | 2026-09-24 | SEC-42 identity gate実装後に `npm test` を実行し、既存754件＋新規回帰8件の計762件PASSを確認。個別実行 `npx vitest run tests/commit-identities.test.mjs` も8/8 PASS。 |


| 1.62 | 2026-09-24 | Issue #153: Decap CMS 3.16.3 / Node.js 22.23.3対応。dependency freshnessの期待値更新、T07/T50実データ読込アサーション、Bug #54再発防止を追加。既存754件にSEC-42 identity gate 8件を含む現行Vitest 762件。包括E2Eは強化条件で150/150 PASS、T07/T50はタイトル・本文を目視確認。初回誤PASSは記録し無効扱い。QA: `docs/qa-2026-09-24-issue153.md`。

## テスト基盤の変更履歴

| 時期 | 主な変更 | 関連PR |
| :--- | :--- | :--- |
| 2026-02-14 | **自動テスト基盤構築**: Vitest導入、設定検証・コンテンツ検証・機能テスト・統合テスト計151テストケースを実装 | #40 |
| 2026-02-15 | **テスト拡充・ドキュメント改訂**: サムネイル画像実在チェック追加、Netlify Identity非含有検証追加、リグレッションテスト実施。テスト計画書をJTC体系に全面書き直し。計227テストケース | #80 |
| 2026-02-15 | **テスト更新**: admin-htmlテストをドロップダウンボトムシート化・EXIF fixPreviewImageOrientation削除に対応、ドロップダウンオーバーレイ管理テスト追加。計237テスト | - |
| 2026-02-20 | **固定ページ・ドロップダウン検証強化**: cms-config 5件、content-validation 4件、build 9件追加。E2E site.spec.ts に固定ページ表示（E-20）4件、ヘッダーナビドロップダウン（E-21）7件追加。計218 Vitest + 237 E2E = 455テスト | - |
| 2026-02-20 | **要件トレーサビリティ完全充足**: FR-10テスト6件追加（url-map.json検証）、CMS-14追加（コレクション表示順序）1件。コレクション順序変更（posts先頭）。計225 Vitest + 237 E2E = 462テスト | - |
| 2026-02-21 | **テスト動的化・条件分岐網羅**: ハードコードコンテンツ排除（ソースから動的取得）、ヘッダーナビ3分岐テンプレートロジック・JS制御テスト11件、固定ページ境界値・一意性テスト6件追加。計242 Vitest + 237 E2E = 479テスト | - |
| 2026-02-21 | **コードリファクタリング・テスト追加**: 固定ページ番号バッジフォーマットテスト1件追加（admin-html 67→68件）。image-optimize.mjs writeFile整理、テスト変数重複排除。計243 Vitest + 237 E2E = 480テスト | - |
| 2026-02-21 | **固定ページ一覧改善・品質向上**: 下書きバッジテスト更新、sortable_fields互換性テスト追加（#40）、orderデフォルトソート昇順テスト追加（#41）、config.ymlスキーマエラー検知E2Eテスト追加（E-07）、要件トレーサビリティ検証テスト追加（#42,#43）。CMS-16要件追加。計247 Vitest + 240 E2E = 487テスト | - |
| 2026-02-21 | **セキュリティ検証テスト追加**: admin-html セキュリティ検証9件（2.6.12章: SEC-01, SEC-03〜SEC-05, SEC-08, SEC-09, Q-01, Q-02）、auth-functions セキュリティ検証4件（2.3.1章: SEC-02, SEC-06, SEC-07）追加。計260 Vitest + 240 E2E = 500テスト | - |
| 2026-02-21 | **バグ#27再発防止テスト追加**: admin-html CDNスクリプト閉じタグ検証2件（2.6.1章）、fuzz-validation 管理画面ヘッダーオーバーライド検証5件（2.7.12章: COOP/X-Frame-Options/CORP/frame-src/COOP緩和度）、frame-ancestorsテスト更新。計484 Vitest + 240 E2E = 751テスト | - |
| 2026-02-21 | **機能観点の要件定義・基本機能保護テスト追加**: cms-config基本機能保護5件（2.4.1章: Backend完全性/削除許可/Markdown編集/メディアライブラリ）、buildパイプライン検証1件（2.5.2章）、admin-html環境分離検証1件（2.6.13章）。FR-15〜FR-21/NFR-05対応。計491 Vitest + 240 E2E = 731テスト | - |
| 2026-02-21 | **バグ#28修正・ヘッダー重複防止テスト追加**: Cloudflare Pages `_headers`重複送信問題修正。build.test.mjsセキュリティヘッダー検証を再構成（5→7件＋重複防止2件）、fuzz-validationヘッダーテスト修正＋1件追加。計496 Vitest + 240 E2E = 736テスト | - |
| 2026-02-21 | **バグ#29修正・CSP connect-src blob:テスト追加**: CSP `connect-src`に`blob:`不足による画像付き記事保存失敗を修正。build.test.mjs CSP connect-src blob:検証1件追加、fuzz-validation connect-src blob:検証1件追加。計498 Vitest + 240 E2E = 738テスト | - |
| 2026-02-21 | **E2E CRUDテスト・アクセシビリティテスト追加**: cms-crud.spec.ts新規作成（E-22〜E-24: 記事作成・編集・削除 11テスト）、accessibility.spec.ts新規作成（E-25〜E-27: axe-core WCAG 2.1 AA検証 6テスト）、@axe-core/playwright導入。色コントラスト比修正（WCAG AA 4.5:1準拠）、見出し階層修正。計498 Vitest + 291 E2E = 789テスト | - |
| 2026-02-23 | **第三者セキュリティ・品質レビュー対応**: SEC-21〜SEC-26対応。fuzz-validationスキーマ更新（date XSSテスト→拒否期待、tags長さ超過テスト追加）、content-validation Windows互換性修正（path.relative正規化、basename使用、CRLF正規表現対応）、build.test.mjs _headersパースCRLF修正、organize-posts.mjs url-map.jsonキー正規化。計519 Vitest + 375 E2E = 894テスト | - |
| 2026-08-11 | **Issue #97回帰基盤の安定化**: Vitestの対象を`tests/**/*.test.mjs`へ限定し、リポジトリ内の別worktree・依存パッケージのテスト混入を防止。OAuth/CMS初期化を含むE-28へ60秒タイムアウトを設定。回帰テスト2件を追加し、588 Vitest + 444 E2E = 1032テスト | #97 |


---

## 目次

### 第1部 テスト計画書

1.1. [テスト目的](#11-テスト目的)
1.2. [テスト対象・範囲](#12-テスト対象範囲)
1.3. [テスト環境](#13-テスト環境)
1.4. [テスト手法](#14-テスト手法)
1.5. [テスト分類と戦略](#15-テスト分類と戦略)
1.6. [開始基準・終了基準](#16-開始基準終了基準)

### 第2部 テストケース一覧

2.1. [コンテンツ検証](#21-コンテンツ検証)
2.2. [rehype-image-caption プラグイン](#22-rehype-image-caption-プラグイン)
2.3. [OAuth認証関数](#23-oauth認証関数)
2.4. [CMS設定検証](#24-cms設定検証)
2.5. [ビルド検証](#25-ビルド検証)
2.6. [管理画面HTML検証](#26-管理画面html検証)
2.7. [ファズテスト・不整合値テスト](#27-ファズテスト不整合値テスト-fuzz-validationtestmjs-219件)
2.8. [Issue #117 hardening 再発防止](#28-issue-117-hardening-再発防止-security-hardeningtestmjs-28件)
2.9. [npm管理外依存の鮮度・EOL監視](#29-npm管理外依存の鮮度eol監視-dependency-freshnesstestmjs--27件)
2.10. [環境値の導出](#210-環境値の導出-env-derivationtestmjs-37件)
2.11. [Git commit identity gate](#211-git-commit-identity-gate-commit-identitiestestmjs--8件)

### 第3部 要件トレーサビリティ

3.1. [要件トレーサビリティマトリクス](#31-要件トレーサビリティマトリクス)

### 第4部 テスト実行

4.1. [動的操作テスト（E2E）](#41-動的操作テストe2e)
4.2. [実行手順](#42-実行手順)
4.3. [テスト実行結果](#43-テスト実行結果)

---

# 第1部 テスト計画書

---

## 1.1. テスト目的

### 1.1.1 目的

本テストは、「CMS で記事を編集 → ビルド → 閲覧」のフロー全体が正常に動作することを保証するものである。具体的には以下の品質特性を検証する。

| 品質特性 | 検証内容 |
| :--- | :--- |
| 機能適合性 | 記事管理、URL生成、タグ分類、画像処理等の機能が仕様通りに動作する |
| 信頼性 | ビルド成果物に必要なファイルがすべて生成される |
| 保守性 | 廃止済み機能（カテゴリ、Netlify Identity）の残存がない |
| 互換性 | CMS設定とコンテンツスキーマの整合性が保たれている |
| セキュリティ | OAuth認証のエラーハンドリングが適切である |

### 1.1.2 前提条件

- 要件定義は `docs/DOCUMENTATION.md` 第1部（第1.2章〜第1.4章）に定義された FR/CMS/NFR 要件に基づく
- テスト対象は自動テストで検証可能な範囲に限定する（CMS管理画面の操作テストは対象外）

---

## 1.2. テスト対象・範囲

### 1.2.1 テスト対象

| 対象 | ファイル | テスト種別 |
| :--- | :--- | :--- |
| コンテンツ（記事Markdown） | `src/content/posts/**/*.md` | コンテンツ検証 |
| CMS設定 | `public/admin/config.yml` | 設定検証 |
| 管理画面HTML | `public/admin/index.html` | 設定検証 |
| 画像キャプションプラグイン | `src/plugins/rehype-image-caption.mjs` | 単体テスト |
| コードブロック到達性プラグイン | `src/plugins/rehype-focusable-code-blocks.mjs` | 単体テスト |
| OAuth認証関数 | `functions/auth/index.js`, `callback.js` | 単体テスト |
| 新規Git commit metadata | `.github/workflows/ci.yml`, `scripts/check-commit-identities.mjs` | 回帰テスト |
| ビルド成果物 | `dist/` | 統合テスト |
| 画像処理スクリプト | `src/integrations/image-optimize.mjs` | コード検証 |
| 画像正規化スクリプト | `scripts/normalize-images.mjs` | コード検証（間接） |
| 共通レイアウト | `src/layouts/Base.astro` | コード検証 |

### 1.2.2 テスト対象外

| 対象 | 対象外理由 |
| :--- | :--- |
| Cloudflare Pages デプロイ | クラウド環境への自動テストが不可であるため |
| GitHub OAuth連携（実際のGitHub API呼び出し） | モック関数で代替しているため |

---

## 1.3. テスト環境

### 1.3.1 実行環境

| 項目 | 内容 |
| :--- | :--- |
| テストフレームワーク | Vitest v4.0.18 |
| テストランナー | `vitest run`（CI）/ `vitest`（ウォッチ） |
| Node.js | v22.23.3以上 |
| OS | macOS / Linux（Cloudflare Pages ビルド環境） |

### 1.3.2 テストファイル構成

```
tests/
├── content-validation.test.mjs   # コンテンツ検証（動的展開: 記事数×項目数）
├── rehype-image-caption.test.mjs # プラグイン単体テスト
├── rehype-focusable-code-blocks.test.mjs # コードブロック到達性テスト
├── auth-functions.test.mjs       # 認証関数単体テスト
├── cms-config.test.mjs           # CMS設定検証
├── build.test.mjs                # 統合テスト（ビルド実行後）
├── admin-html.test.mjs           # 管理画面HTML検証
├── fuzz-validation.test.mjs      # ファズテスト
├── security-hardening.test.mjs   # Issue #117 hardening 再発防止（Bug #52, SEC-36〜39 のうち SEC-37〜39）
├── dependency-freshness.test.mjs # npm管理外依存の鮮度・EOL判定（SEC-40、フィクスチャのみ・ネットワーク不使用）
├── env-derivation.test.mjs       # Issue #127 環境値の導出（SEC-35 改訂 / SEC-127A 仮ID）
└── lib/cms-env-loader.mjs        # テスト用ヘルパ（public/admin/cms-env.js を vm で評価。テスト対象外）
```

---

## 1.4. テスト手法

本プロジェクトで採用するテスト手法を以下に定義する。各テストケースには適用するテスト手法を明記する。

### 1.4.1 テスト手法一覧

| ID | テスト手法 | 概要 | 適用場面 |
| :--- | :--- | :--- | :--- |
| M-01 | ファイル構造検証 | ファイル・ディレクトリの存在、配置パス、拡張子を検証する | ビルド成果物、記事ファイル配置 |
| M-02 | 文字列パターンマッチング | ファイル内容に対して正規表現または部分文字列の含有・非含有を検証する | HTML品質、CSS/JS存在確認 |
| M-03 | YAML/Frontmatterパース検証 | YAML形式のファイルをパースし、キー・値・型の正当性を検証する | CMS設定、記事frontmatter |
| M-04 | スキーマ検証 | フィールドの型（string, boolean, array等）、必須/任意、デフォルト値を検証する | frontmatter、CMS設定フィールド |
| M-05 | AST（抽象構文木）変換テスト | rehype/remarkプラグインにHTML ASTを入力し、変換結果のノード構造を検証する | rehype-image-caption, rehype-focusable-code-blocks |
| M-06 | HTTPレスポンス検証 | 関数にリクエストオブジェクトを入力し、ステータスコード・ヘッダー・ボディを検証する | OAuth認証関数 |
| M-07 | モック置換テスト | 外部API呼び出し（fetch等）をモック関数に置換し、内部ロジックの正当性を検証する | OAuth callback（GitHub API） |
| M-08 | ネガティブテスト | 異常系入力（パラメータ欠損、認証情報未設定等）に対するエラーハンドリングを検証する | OAuth認証関数 |
| M-09 | 回帰テスト（廃止機能確認） | 廃止済み機能（カテゴリ、Netlify Identity等）の残存がないことを検証する | ビルド成果物、記事frontmatter |
| M-10 | バイナリファイル検証 | 画像ファイルのEXIFメタデータ（orientation）やピクセルサイズを検証する | アップロード画像、ビルド後画像 |
| M-11 | ソースコード静的検証 | ソースコードの文字列を読み取り、特定のAPI呼び出しや設定値の存在を検証する | image-optimize.mjs, Base.astro |
| M-12 | エンドツーエンドビルド検証 | `npm run build`を実行し、パイプライン全体（前処理→ビルド→後処理）の出力を検証する | ビルド統合テスト |

### 1.4.2 テスト手法の実装詳細

各テスト手法が実際にどのように実装されているかを、使用ライブラリとコード例で示す。

#### M-01 ファイル構造検証

ファイルシステムAPI（`fs`）を使用し、ファイル・ディレクトリの存在と配置パスを検証する。

```javascript
// 使用ライブラリ: fs, path
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

// ファイル存在確認
expect(existsSync(join('dist', 'index.html'))).toBe(true);

// ディレクトリ走査による記事ファイル配置確認
const files = readdirSync(postsDir, { recursive: true });
const mdFiles = files.filter(f => f.endsWith('.md'));
expect(mdFiles.length).toBeGreaterThan(0);

// パスパターンの検証（yyyy/mm/ 形式）
const relativePath = path.relative(postsDir, filePath);
expect(relativePath).toMatch(/^\d{4}\/\d{2}\//);
```

#### M-02 文字列パターンマッチング

ファイル内容を文字列として読み込み、`toContain()` または `toMatch()` で特定パターンの含有・非含有を検証する。

```javascript
// 使用ライブラリ: fs
const html = readFileSync('dist/index.html', 'utf-8');

// 部分文字列の含有確認
expect(html).toContain('lang="ja"');
expect(html).toContain('<meta name="viewport"');

// 正規表現マッチング
expect(html).toMatch(/<!doctype html>/i);

// 廃止機能の非含有確認（ネガティブ）
expect(html).not.toContain('identity.netlify.com');
expect(html).not.toContain('netlifyIdentity');
```

#### M-03 YAML/Frontmatterパース検証

`gray-matter`ライブラリでMarkdownのfrontmatterをパースし、`js-yaml`でYAMLファイルをパースして構造を検証する。

```javascript
// 使用ライブラリ: gray-matter (frontmatter), js-yaml (YAML設定)
import matter from 'gray-matter';
import yaml from 'js-yaml';

// frontmatterパース
const raw = readFileSync(mdFilePath, 'utf-8');
const { data, content } = matter(raw);
expect(data.title).toBeDefined();
expect(data.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);

// YAML設定パース
const configRaw = readFileSync('public/admin/config.yml', 'utf-8');
const config = yaml.load(configRaw);
expect(config.backend.name).toBe('github');
```

#### M-04 スキーマ検証

パース済みデータの各フィールドに対して、JavaScriptの`typeof`演算子や`Array.isArray()`でデータ型を検証する。

```javascript
// 型検証
expect(typeof data.title).toBe('string');
expect(typeof data.draft).toBe('boolean');
expect(Array.isArray(data.tags)).toBe(true);

// 各要素の検証（配列内の全要素が非空文字列であること）
data.tags.forEach(tag => {
  expect(typeof tag).toBe('string');
  expect(tag.length).toBeGreaterThan(0);
});
```

#### M-05 AST（抽象構文木）変換テスト

テスト用のHAST（HTML Abstract Syntax Tree）ノードをヘルパー関数で構築し、プラグインを適用して変換結果を検証する。

```javascript
// HAST（HTML AST）ノードの構築
function makeImgNode(props) {
  return { type: 'element', tagName: 'img', properties: props, children: [] };
}
function makeTree(bodyChildren) {
  return {
    type: 'root',
    children: [{ type: 'element', tagName: 'body', children: bodyChildren }]
  };
}

// プラグイン適用・検証
const img = makeImgNode({ src: '/test.jpg', title: '説明文' });
const tree = makeTree([{ type: 'element', tagName: 'p', children: [img] }]);
plugin()(tree);  // プラグイン実行

// 変換後のノード構造を検証
const figure = tree.children[0].children[0];
expect(figure.tagName).toBe('figure');
expect(figure.children[1].tagName).toBe('figcaption');
expect(figure.children[1].children[0].value).toBe('説明文');
```

#### M-06 / M-07 / M-08 HTTPレスポンス検証・モック置換・ネガティブテスト

Cloudflare Functionsのリクエスト/レスポンスをモック化し、正常系と異常系の両方を検証する。

```javascript
// Cloudflare Functions互換のコンテキスト構築
function createContext(url, env = {}) {
  return { request: new Request(url), env };
}

// 正常系: HTTPレスポンス検証 (M-06)
const ctx = createContext('https://reiwa.casa/auth', {
  OAUTH_CLIENT_ID: 'test-id'
});
const response = await onRequest(ctx);
expect(response.status).toBe(302);
expect(response.headers.get('location')).toContain('github.com/login/oauth');

// 異常系: ネガティブテスト (M-08)
const ctx2 = createContext('https://reiwa.casa/auth', {}); // 環境変数なし
const response2 = await onRequest(ctx2);
expect(response2.status).toBe(500);

// モック置換テスト (M-07): globalThis.fetch をモック化
const mockFetch = vi.fn().mockResolvedValue({
  json: () => Promise.resolve({ access_token: 'mock-token' })
});
globalThis.fetch = mockFetch;
try {
  const response3 = await callbackHandler(ctx3);
  expect(response3.status).toBe(200);
  // モック呼び出しの検証
  expect(mockFetch).toHaveBeenCalledWith(
    'https://github.com/login/oauth/access_token',
    expect.objectContaining({ method: 'POST' })
  );
} finally {
  globalThis.fetch = originalFetch; // 復元
}
```

#### M-10 バイナリファイル検証

`sharp`ライブラリで画像ファイルのメタデータ（EXIFデータ、ピクセルサイズ）を読み取り検証する。

```javascript
// 使用ライブラリ: sharp（動的import）
const sharp = (await import('sharp')).default;

// EXIF orientation検証
const metadata = await sharp(imagePath).metadata();
const orientation = metadata.orientation || 1;
expect(orientation).toBe(1);  // 1 = 正位置（回転済み）

// ピクセルサイズ検証
expect(metadata.width).toBeLessThanOrEqual(1200);  // MAX_WIDTH
```

#### M-12 エンドツーエンドビルド検証

`child_process.execSync()`でビルドコマンドを実行し、パイプライン全体の出力を検証する。

```javascript
// 使用ライブラリ: child_process
import { execSync } from 'child_process';

// ビルド実行（beforeAllで1回のみ）
beforeAll(() => {
  execSync('npm run build', {
    cwd: projectRoot,
    timeout: 120000,  // 2分タイムアウト
    stdio: 'pipe'
  });
}, 180000);  // Vitestのテストタイムアウト: 3分

// ビルド後のdistディレクトリを検証
expect(existsSync(join(projectRoot, 'dist'))).toBe(true);
```

### 1.4.3 テスト手法の適用マトリクス

```
テストファイル                    M-01  M-02  M-03  M-04  M-05  M-06  M-07  M-08  M-09  M-10  M-11  M-12
─────────────────────────────  ────  ────  ────  ────  ────  ────  ────  ────  ────  ────  ────  ────
content-validation.test.mjs      ●     -     ●     ●     -     -     -     -     ●     ●     ●     -
rehype-image-caption.test.mjs    -     -     -     -     ●     -     -     -     -     -     -     -
auth-functions.test.mjs          -     -     -     -     -     ●     ●     ●     -     -     -     -
cms-config.test.mjs              -     -     ●     ●     -     -     -     -     ●     -     -     -
build.test.mjs                   ●     ●     ●     -     -     -     -     -     ●     ●     -     ●
admin-html.test.mjs              -     ●     -     -     -     -     -     -     -     -     -     -
```

---

## 1.5. テスト分類と戦略

### 1.5.1 テストレベル

```
┌──────────────────────────────────────────────────────────────┐
│                       テストピラミッド                         │
│                                                              │
│                    ┌──────────┐                              │
│                    │ 統合テスト │  build.test.mjs              │
│                    │ (ビルド)  │  ビルドパイプライン全体の       │
│                    │          │  エンドツーエンド検証            │
│                 ┌──┴──────────┴──┐                           │
│                 │  単体テスト      │  rehype-image-caption      │
│                 │ (関数・プラグイン)│  auth-functions            │
│              ┌──┴────────────────┴──┐                        │
│              │ 設定・コンテンツ検証    │  cms-config              │
│              │ (静的解析)            │  admin-html              │
│              │                      │  content-validation       │
│              └──────────────────────┘                        │
└──────────────────────────────────────────────────────────────┘
```

### 1.5.2 テスト分類と対応手法

| テストレベル | 目的 | テストファイル | 主なテスト手法 |
| :--- | :--- | :--- | :--- |
| 設定・コンテンツ検証 | CMS設定・管理画面HTML・記事ファイルの正当性を静的に検証する | `cms-config.test.mjs`, `admin-html.test.mjs`, `content-validation.test.mjs` | M-02, M-03, M-04, M-09, M-10, M-11 |
| 単体テスト | プラグイン・認証関数を入力/出力で個別検証する | `rehype-image-caption.test.mjs`, `auth-functions.test.mjs` | M-05, M-06, M-07, M-08 |
| 統合テスト | ビルドパイプライン全体を実行し成果物を検証する | `build.test.mjs` | M-01, M-02, M-09, M-10, M-12 |

### 1.5.3 テスト実行タイミング

| タイミング | コマンド | 目的 | 対象テスト |
| :--- | :--- | :--- | :--- |
| 開発中 | `npm run test:watch` | ファイル変更時に自動再実行 | 全テスト |
| デプロイ前 | `npm test` | 全テスト合格を確認 | 全テスト |
| 記事編集後 | `npx vitest run tests/content-validation.test.mjs` | frontmatter不備の即時検出 | コンテンツ検証のみ |

---

## 1.6. 開始基準・終了基準

### 1.6.1 テスト開始基準

| No. | 基準 |
| :--- | :--- |
| 1 | `npm install` が正常に完了していること |
| 2 | テストフレームワーク（Vitest）がインストールされていること |
| 3 | テスト対象のソースコード・設定ファイルが存在すること |

### 1.6.2 テスト終了基準

| No. | 基準 |
| :--- | :--- |
| 1 | 全テストケース（Vitest 762件〔全ブランチ共通。Issue #127 で SEC-35 のブランチ別登録を廃止〕 + E2E 465件 = 1227件）がPASSまたは仕様上の条件スキップであること |
| 2 | `npm run build` が正常に完了すること |
| 3 | 要件トレーサビリティマトリクス（docs/DOCUMENTATION.md 1.5章）において全要件が「充足」であること |
| 4 | 本番（main）マージ前にローカル `npm run test:e2e` 全件と `verify-comprehensive.mjs` が完了していること（**CI に Playwright は載せない**。Bug #50） |

### 1.6.3 合否判定基準

| 判定 | 条件 |
| :--- | :--- |
| 合格 | 全テストケースがPASSであり、ビルドが正常に完了する |
| 不合格 | 1件以上のテストケースがFAILである、またはビルドが異常終了する |

### 1.6.4 動作確認エビデンス取得方針

staging検証時およびmainマージ前に、Playwright自動検証でスクリーンショット付きHTMLエビデンスレポートを作成する。

#### エビデンス構成

| 項目 | 内容 |
| :--- | :--- |
| 保存先（ローカル生成） | `evidence/YYYY-MM-DD/` フォルダ（日付ごとに整理） |
| レポート形式（ローカル生成、正本はDrive） | `report.html`（画像埋め込み、PC/iPad/iPhone 3デバイス横並び表示） |
| スクリーンショット（ローカル生成、正本はDrive） | `screenshots/`, `site-interactive/`, `cms-interactive/` サブフォルダ |
| テストデバイス | PC (1280x800) / iPad Pro 11 (834x1194) / iPhone 14 (390x844) |
| 検証スクリプト（Gitに保持） | `verify-staging.mjs`（基本動作）、`verify-site-interactive.mjs`（サイト操作性）、`verify-cms-interactive.mjs`（CMS操作性）、`verify-cms-crud.mjs`（CMS CRUD操作）、`verify-security.mjs`（セキュリティ検証）、`evidence/2026-05-22/verify-modern-web-guidance.mjs`（Modern Web Guidance準拠） |

画像・動画・PDFと `report.html` / `work-completion-report.html` 等のレポートはローカル生成後にGoogle Drive（本人のみ閲覧可能）を正本として保存し、読戻しSHA-256を照合してから `evidence/archive-index.json` に登録する（詳細: CLAUDE.md「エビデンス取得方針」、DOCUMENTATION.md 4.2.6章・4.10.3章）。Gitにコミットするのは検証JSON・`verify-*.mjs`・索引・小さな非レポートHTMLのみ。

#### 赤枠アノテーション方針

全スクリーンショットに対し、注目すべき箇所に赤枠（`border: 3px solid red; background: rgba(255,0,0,0.1)`）とラベルを付与する。具体的には以下を赤枠で示す:

- ボタン・リンク等のクリック可能要素
- ドロップダウン・モーダル等の展開状態
- 重なり検出箇所（「重なり!」ラベル付き）
- バグ再発防止の確認箇所（URLバー、保存ボタン、Code Block非表示等）

#### サイト操作性検証項目（verify-site-interactive.mjs）

| No. | ID | 検証項目 | 関連バグ |
| :--- | :--- | :--- | :--- |
| S01 | S01-top | トップページ: ヘッダー・ナビ・記事リンク表示 | — |
| S02 | S02-dropdown-open | ドロップダウン展開: メニュー表示・重なり | Bug #14,#15,#31 |
| S03 | S03-dropdown-scroll | ドロップダウン+スクロール: メニュー追従 | Bug #15 |
| S04 | S04-article | 記事詳細: 画像・タグリンク・戻るリンク | Bug #5,#33 |
| S05 | S05-fixed-page | 固定ページ: ナビゲーション・コンテンツ | — |
| S06 | S06-404 | 404ページ: エラー表示・リンク | — |
| S07 | S07-archive | アーカイブ: 月別記事一覧 | — |
| S08 | S08-tag | タグページ: タグ別記事一覧 | Bug #33 |
| S09 | S09-draft-hidden | 下書き記事非表示（SEC-21） | Bug #30 |
| S10 | S10-admin | CMS管理画面: ロード確認 | — |

#### CMS操作性検証項目（verify-cms-interactive.mjs）

CMS管理画面を重点検証。OAuthモック＋GitHub APIモック使用。ボタンを実際に押下し、メニュー展開・モーダル表示・画面遷移をエビデンス取得する。

| No. | ID | 検証項目 | 関連バグ | 検証観点 |
| :--- | :--- | :--- | :--- | :--- |
| T01 | T01-login | ログイン画面: ボタン表示 | — | ログインボタンの視認性 |
| T02 | T02-collection-list | 記事一覧: エントリ・新規ボタン | — | 一覧表示・ナビゲーション |
| T03 | T03-editor | 記事編集: ツールバー・保存ボタン・URLバー | Bug #1,#8,#11 | モバイル保存ボタン表示、URLバー正常表示 |
| T04 | T04-toolbar-buttons | ツールバー: ボタン表示・Code Block非表示 | Bug #9 | モバイルでCode Blockボタン非表示 |
| T05 | T05-editor-plus-menu | エディタ: +メニュー展開 | — | メニュー項目の重なり確認 |
| T06 | T06-delete-buttons | 削除ボタン: ラベル確認 | Bug #4 | 「選択解除」「完全削除」ラベル分離 |
| T07 | T07-url-bar-transition | 公開URLバー: 一覧→編集→戻り遷移 | Bug #8,#11 | URLバーの正しい表示/非表示 |
| T08 | T08-pages-editor | 固定ページ: 編集・公開URL | Bug #13 | /slug形式でURL表示 |
| T09 | T09-dropdown-urlbar | ドロップダウン+URLバー競合 | Bug #32 | 同時表示時の重なり検出 |
| T10 | T10-new-entry | 新規記事作成: フィールド・保存ボタン | — | 各入力フィールドの配置 |
| T11 | T11-image-widget | 画像ウィジェット: ボタン配置 | Bug #5,#6,#29 | EXIF対応、accept属性制限 |
| T12 | T12-media-library | メディアライブラリ: モーダル表示 | Bug #29,#32 | URLバー退避、重なり検出 |
| T13 | T13-bottom-sheet | モバイル: ボトムシート | Bug #7 | position:fixed bottom:0 形式 |
| T14 | T14-entry-format | 記事一覧: 日付\|下書き\|タイトル形式 | — | formatCollectionEntries整形確認 |
| T15 | T15-multi-operation | 操作性: 記事→戻る→固定ページ連続遷移 | Bug #8,#11 | URLバー残留なし確認 |
| T16 | T16-sticky-scroll | スクロール時sticky保存ボタン | Bug #1 | スクロール後も保存ボタン表示 |

#### 基本動作検証項目（verify-staging.mjs）

| No. | 検証項目 | 検証方法 |
| :--- | :--- | :--- |
| 1 | サイト基本表示 | トップページの[STAGING]ラベル・記事一覧・タイトル表示を確認 |
| 2 | 記事詳細ページ | 記事タイトル・画像（EXIF回転）・タグ・戻るリンクを確認 |
| 3 | 下書き記事非表示 | draft=trueの記事URLで404が表示されることを確認（SEC-21） |
| 4 | 固定ページ・ナビゲーション | ドロップダウン表示・リンク遷移を確認 |
| 5 | 404ページ | 存在しないURLで404ページが表示されることを確認 |
| 6 | CMS管理画面 | CMSの読み込み完了・タイトル表示を確認 |
| 7 | セキュリティヘッダー | トップページ・管理画面のレスポンスヘッダーを確認 |

#### 過去バグ由来の検証マトリクス

以下のバグについて、エビデンス取得スクリプト内で再発していないことを確認する。

| バグ | 検証項目 | エビデンスID |
| :--- | :--- | :--- |
| Bug #1 | モバイルで保存ボタンが表示される（sticky header） | T03, T16 |
| Bug #4 | 削除ボタンが「選択解除」「完全削除」に分離されている | T06 |
| Bug #5,#6 | 画像EXIF回転が正しい（CSS image-orientation） | T11, S04 |
| Bug #7 | モバイルドロップダウンがボトムシート形式 | T13 |
| Bug #8,#11 | 一覧画面でURLバーが非表示、編集画面で表示 | T03, T07, T15 |
| Bug #9 | モバイルでCode Blockボタンが非表示 | T04 |
| Bug #13 | 固定ページURLが/slug形式で表示 | T08 |
| Bug #14,#15 | ドロップダウンが正しく開閉、gapなし | S02, S03 |
| Bug #29 | CSP connect-src blob:（画像保存） | T11, T12 |
| Bug #30 | 下書き記事が404を返す | S09 |
| Bug #31 | モバイルドロップダウンhover/tap正常動作 | S02 |
| Bug #32 | URLバーとモーダル/ドロップダウンの非重複 | T09, T12 |
| Bug #33 | タグURLが正しくエンコード | S08 |

#### CMS CRUD操作検証項目（verify-cms-crud.mjs）

ログイン後のCMS各操作を実際に実行し、3デバイスでスクリーンショット取得する。OAuthモック＋GitHub APIモック（CRUD対応・API記録付き）使用。

| No. | ID | 検証項目 | 関連バグ | 操作内容 |
| :--- | :--- | :--- | :--- | :--- |
| T17 | T17-create-form | 記事新規作成: フォーム入力 | — | タイトル・日付・本文入力→フィールド表示 |
| T18 | T18-create-publish | 記事新規作成: Publish実行 | — | 保存→確認→API呼び出し確認 |
| T19 | T19-edit-load | 記事編集: 既存記事読み込み | — | 既存記事のフィールド・URLバー表示 |
| T20 | T20-edit-modify | 記事編集: タイトル・本文変更 | — | タイトル変更・本文追加→変更状態表示 |
| T21 | T21-edit-save | 記事編集: 保存実行 | — | 保存クリック→API呼び出し確認 |
| T22 | T22-delete-button | 記事削除: 削除ボタン確認 | Bug #4 | 選択解除・完全削除ボタンのラベル |
| T23 | T23-delete-confirm | 記事削除: 確認ダイアログ | — | 削除クリック→確認ダイアログ表示 |
| T24 | T24-image-widget | 画像ウィジェット: accept制限 | Bug #5,#6 | file input accept属性・HEIC制限 |
| T25 | T25-image-upload | 画像アップロード: ファイル選択 | Bug #5,#29 | ファイル選択→EXIF処理→プレビュー |
| T26 | T26-media-library | メディアライブラリ: モーダル操作 | Bug #29,#32 | モーダル・アップロードボタン・URLバー退避 |
| T27 | T27-tag-edit | タグ編集: タグ追加 | — | タグ入力・追加・表示確認 |
| T28 | T28-draft-toggle | 下書き/公開ステータス切替 | Bug #7 | ステータスドロップダウン展開・切替 |
| T29 | T29-publish-flow | Publish確認ワークフロー | — | 公開→確認ダイアログ→完了 |
| T30 | T30-page-create | 固定ページ新規作成 | — | タイトル・slug・order入力 |
| T31 | T31-page-edit | 固定ページ編集 | Bug #13 | 既存ページ読み込み・slug URL表示 |
| T32 | T32-toolbar-ops | エディタツールバー操作 | Bug #9 | 書式ボタン・Code Block非表示 |

#### セキュリティ検証項目（verify-security.mjs）

このエビデンス用スクリプトはSEC01〜SEC10の項目を扱い、SEC要件全体の網羅性を示すものではない。SEC-01〜SEC-35の検査責務と未テスト要件の有無は `docs/DOCUMENTATION.md` 1.5.4章のトレーサビリティマトリクスで管理する。SEC-33/34はbuild/fuzzテスト、SEC-35はcms-configテストで確認する。

列挙したSEC01〜SEC10の10項目について証跡を取得・確認し、スクリーンショット付きで記録する（PCのみ）。

| No. | ID | 検証項目 | 要件参照 | 検証方法 |
| :--- | :--- | :--- | :--- | :--- |
| SEC01 | SEC01-xss-title | XSS耐性 | SEC-01 | XSSペイロードがエスケープ済みか検証 |
| SEC02 | SEC02-csp-headers | セキュリティヘッダー | SEC-02,SEC-03 | CSP/COOP/CORP等のヘッダー設定確認 |
| SEC03 | SEC03-no-innerhtml | DOM安全性 | SEC-05 | innerHTML/outerHTML不使用、var不使用 |
| SEC04 | SEC04-oauth-scope | OAuth scope | SEC-06 | public_repo,read:user限定確認 |
| SEC05 | SEC05-cdn-pinned | CDNバージョン固定 | SEC-07 | キャレット不使用・integrity確認 |
| SEC06 | SEC06-postmessage | postMessage origin | SEC-10 | ワイルドカード"*"不使用 |
| SEC07 | SEC07-no-hardcoded-url | ハードコードURL | SEC-12 | admin内にreiwa.casaなし |
| SEC08 | SEC08-headers-file | _headersファイル | SEC-15 | ヘッダー設定・Bug #28重複回避 |
| SEC09 | SEC09-script-close | scriptタグ閉じ | SEC-18 | CDNスクリプト閉じタグ・use strict |
| SEC10 | SEC10-path-traversal | パストラバーサル | SEC-14 | 不正パス・XSSペイロード確認 |

---

# 第2部 テストケース一覧

各テストケースには以下の情報を付与する。

| 項目 | 説明 |
| :--- | :--- |
| No. | テストケース番号（テストファイル内での連番） |
| テストケース | 検証内容 |
| テスト手法 | 第4章で定義したテスト手法ID |
| 期待結果 | テスト合格時の期待値 |

---

## 2.1. コンテンツ検証 (`content-validation.test.mjs`)

記事ファイル（Markdown）のfrontmatterと構造を検証する。テストケースNo.2〜11は記事数分だけ動的に展開される。

| No. | テストケース | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 1 | 記事ファイルが1つ以上存在する | M-01 | `src/content/posts/`に`.md`ファイルが1件以上存在する |
| 2 | フロントマターが正しくパースできる | M-03 | gray-matterで例外なくパースできる |
| 3 | title（タイトル）が文字列で存在する | M-04 | `typeof title === 'string'` かつ空でない |
| 4 | date（日付）がYYYY-MM-DD形式である | M-04 | `/^\d{4}-\d{2}-\d{2}$/` にマッチする |
| 5 | draft（下書き）がboolean型である | M-04 | `typeof draft === 'boolean'`（未指定時はundefined許容） |
| 6 | categoryフィールドが存在しない | M-09 | `category` キーが frontmatter に含まれない |
| 7 | ファイルがyyyy/mm/ディレクトリに配置されている | M-01 | パスが `posts/YYYY/MM/` パターンに合致する |
| 8 | ファイルのディレクトリがfrontmatterの日付と一致する | M-01, M-03 | ディレクトリの年月がfrontmatterの`date`と一致する |
| 9 | tags（タグ）が配列で各要素が空でない文字列である | M-04 | 配列かつ各要素が非空文字列（tags未指定時はスキップ） |
| 10 | thumbnailが/images/で始まるパスであり画像ファイルが実在する | M-01, M-04 | パスが`/images/`始まり、かつ`public/`配下に実ファイルが存在する |
| 11 | 本文が空でない | M-04 | frontmatter除去後のMarkdown本文が空でない |
| 12 | ソース画像にEXIF回転が残っていない | M-10 | 全アップロード画像のEXIF orientationが1（正位置）または未定義である |
| 13 | image-optimize.mjs で .rotate() が呼ばれている | M-11 | ソースコード内に`.rotate()`呼び出しが存在する |
| 14 | image-optimize.mjs でEXIF orientationによる幅の補正がある | M-11 | ソースコード内にorientation≥5による幅高さ入替処理が存在する |
| 15 | Base.astro に image-orientation: from-image が設定されている | M-11 | ソースコード内に`image-orientation: from-image`が存在する |

### 2.1.2 固定ページコンテンツ検証

固定ページファイルのfrontmatterと構造を検証する。テストケースNo.17〜21はページ数分だけ動的に展開される。

| No. | テストケース | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 16 | 固定ページファイルが1つ以上存在する | M-01 | `src/content/pages/`に`.md`ファイルが1件以上存在する |
| 17 | titleが文字列で存在する | M-04 | `typeof title === 'string'` かつ空でない |
| 18 | slugが半角英数字とハイフンのみである | M-04 | `/^[a-z0-9-]+$/` にマッチする |
| 19 | ファイル名がslugフィールドと一致する | M-01, M-03 | ファイル名（拡張子除く）がfrontmatterの`slug`値と一致する（CMS slugテンプレート`{{fields.slug}}`の実データ検証） |
| 20 | orderが数値である | M-04 | `typeof order === 'number'` |
| 21 | 本文が空でない | M-04 | frontmatter除去後のMarkdown本文が空でない |
| 22 | draftがboolean型である（存在する場合） | M-04 | `typeof draft === 'boolean'`（未指定時はスキップ） |
| 23 | slugが予約語でない（posts, tags, admin） | M-04 | `slug`が`posts`, `tags`, `admin`のいずれでもない |

### 2.1.3 ヘッダーナビゲーション条件分岐検証（Base.astroソース）

Base.astroのテンプレートロジック（0/1/2+件分岐）とJS制御を静的解析で検証する。

| No. | テストケース | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 24 | 0件分岐: navPages.length === 0 → null が返る | M-11 | テンプレートに `: null}` が存在する |
| 25 | 1件分岐: navPages.length === 1 → 直接リンク | M-11 | `navPages.length === 1` 後に素の`<a>`タグがある |
| 26 | 2件以上分岐: navPages.length > 1 → ドロップダウン構造 | M-11 | `nav-dropdown`, `nav-dropdown-link`, `nav-dropdown-toggle`, `nav-dropdown-menu`が存在する |
| 27 | draftフィルタ: 下書きページを除外している | M-11 | `.filter(p => !p.data.draft)` が存在する |
| 28 | orderソート: 昇順で並べ替えている | M-11 | `.sort((a, b) => a.data.order - b.data.order)` が存在する |
| 29 | pagesコレクションから取得している | M-11 | `getCollection('pages')` が存在する |
| 30 | dropdownがnullの場合のガード（if文）が存在する | M-11 | `if (dropdown)` が存在する |
| 31 | mouseenter でis-openクラスを追加する | M-11 | `addEventListener('mouseenter')` と `classList.add('is-open')` が存在する |
| 32 | mouseleave で300ms遅延後にis-openクラスを削除する | M-11 | `setTimeout`, `300`, `classList.remove('is-open')` が存在する |
| 33 | ▾ボタンクリックでトグルする | M-11 | `addEventListener('click')` と `classList.toggle('is-open')` が存在する |
| 33b | ホバーで開いた直後のトグルクリックがメニューを閉じない | M-11 | `openedByHover` によりPC実操作時のhover/click競合を防止する |
| 34 | 外側クリックで閉じる | M-11 | `document.addEventListener('click')` と `dropdown.contains` が存在する |
| 34b | ナビゲーションにaria-labelとfocus-visibleスタイルがある | M-11 | `aria-label="メイン"` と `:focus-visible` が存在する |
| 34c | Escapeキーとフォーカス離脱でドロップダウンを閉じる | M-11 | `keydown`のEscape処理と`focusout`の外部移動判定が存在する |

### 2.1.4 固定ページフィールドの境界値・一意性検証

固定ページの全データに対し、境界値・一意性制約を検証する。

| No. | テストケース | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 35 | 全固定ページのorderが整数である | M-04 | `Number.isInteger(order)` が全ページでtrue |
| 36 | 全固定ページのorderが0以上である | M-04 | `order >= 0` が全ページでtrue |
| 37 | 全固定ページのslugが空でない | M-04 | `slug.trim().length > 0` が全ページでtrue |
| 38 | slugが一意である（重複なし） | M-04 | 全ページのslugが重複しない |
| 39 | orderが一意である（同じ表示順がない） | M-04 | 全ページのorderが重複しない |
| 40 | 全固定ページのtitleが空でない | M-04 | `title.trim().length > 0` が全ページでtrue |

---

## 2.2. rehype-image-caption プラグイン (`rehype-image-caption.test.mjs`) — 8件

プラグイン関数にrehype AST（HAST）を入力し、変換後のノード構造を検証する。

| No. | テストケース | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 1 | img要素にloading="lazy"とdecoding="async"が自動追加される | M-05 | 変換後ASTのimg要素に`loading="lazy"`, `decoding="async"`が付与される |
| 2 | 既存のloading属性は上書きしない | M-05 | `loading="eager"`のimgが変換後も`loading="eager"`のままである |
| 3 | 既存のdecoding属性は上書きしない | M-05 | `decoding="sync"`のimgが変換後も`decoding="sync"`のままである |
| 4 | title属性を持つimgがfigure+figcaptionに変換される | M-05 | `<img title="X">`が`<figure><img><figcaption>X</figcaption></figure>`になる |
| 5 | title属性がないimgはfigureに変換されない | M-05 | title未指定のimgはそのまま（figure未生成） |
| 6 | 既にfigure内にあるimgは二重変換されない | M-05 | 親がfigureのimgは変換をスキップする |
| 7 | 日本語のtitleが正しくキャプションになる | M-05 | `title="日本語テスト"`がfigcaptionの内容として正しく出力される |
| 8 | 複数のimg要素がそれぞれ正しく処理される | M-05 | 文書内の全img要素が個別に正しく変換される |

### 2.2.1 rehype-focusable-code-blocks プラグイン (`rehype-focusable-code-blocks.test.mjs`) — 2件

| No. | テストケース | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 1 | pre要素にtabindex="0"を付与する | M-05 | 変換後ASTのpre要素に`tabIndex: 0`が設定される |
| 2 | pre以外の要素を変更しない | M-05 | p要素等にはtabindexが追加されない |

---

## 2.3. OAuth認証関数 (`auth-functions.test.mjs`) — 14件

Cloudflare Functions の認証エンドポイントに対し、モックリクエストを入力してレスポンスを検証する。

| No. | テストケース | エンドポイント | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- | :--- |
| 1 | OAUTH_CLIENT_ID設定時、GitHubへリダイレクトされる | /auth | M-06 | ステータス302、LocationヘッダーがGitHub認可URLを指す |
| 2 | リダイレクトURIにコールバックパスが含まれる | /auth | M-06 | Locationヘッダーのredirect_uriに`/auth/callback`が含まれる |
| 3 | OAUTH_CLIENT_ID未設定時、500エラーを返す | /auth | M-06, M-08 | ステータス500、エラーメッセージ含む |
| 4 | 異なるオリジンでも正しいコールバックURLが生成される | /auth | M-06 | リクエストオリジンに対応したcallback URLが生成される |
| 5 | codeパラメータなしで400エラーを返す | /auth/callback | M-06, M-08 | ステータス400 |
| 6 | OAuth資格情報未設定で500エラーを返す | /auth/callback | M-06, M-08 | ステータス500 |
| 7 | CLIENT_IDのみ設定（SECRET未設定）で500エラーを返す | /auth/callback | M-06, M-08 | ステータス500 |
| 8 | GitHub APIエラー時に400エラーを返す | /auth/callback | M-06, M-07, M-08 | fetchモックがエラーを返した際にステータス400 |
| 9 | 成功時にDecap CMSハンドシェイクHTMLを返す | /auth/callback | M-06, M-07 | ステータス200、HTMLにpostMessageハンドシェイクコードが含まれる |
| 10 | GitHubへのリクエストパラメータが正しい | /auth/callback | M-07 | fetchモックに渡されたURLとbodyが仕様通りである |

### 2.3.1 セキュリティ検証（11件）

| No. | テストケース | 検証対象 | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- | :--- |
| 1 | テンプレート変数をJSON.stringifyベースのリテラル変換でエスケープしている（SEC-02, SEC-39） | callback.js | M-02 | `toScriptStringLiteral`関数が存在し、`access_token`と`origin`の両方をリテラル化している（旧 `escapeForScript` は SEC-39 で置換） |
| 2 | postMessageの送信先がワイルドカード"*"でない（SEC-06） | callback.js | M-02, M-09 | `postMessage`の第2引数に`"*"`が使用されず、`expectedOrigin`が使用されている |
| 3 | postMessage受信時にevent.originを検証している（SEC-06） | callback.js | M-02 | `event.origin !== expectedOrigin`による検証が含まれる |
| 4 | OAuthスコープが最小権限である（SEC-07） | index.js | M-02, M-09 | `public_repo`と`read:user`が使用され、`repo`単体や`user`単体が使用されていない |
| 5 | OAuth開始時にstateパラメータを生成している（SEC-11） | index.js | M-02 | `state`パラメータの生成（`crypto.randomUUID`）とCookie保存（`oauth_state`）が含まれる |
| 6 | OAuthコールバックでstateパラメータを検証している（SEC-11） | callback.js | M-02 | URLの`state`パラメータとCookie内の`oauth_state`を照合し、不一致時に403を返す |
| 7 | OAuthエラーメッセージが汎化されている（SEC-13） | callback.js | M-02, M-09 | `error_description`がクライアントに返されず、汎用メッセージ「Authentication failed」を使用 |
| 8 | OAuthハンドシェイクのmessage listenerに { once: true } を使っていない（SEC-31） | callback.js | M-02 | `addEventListener("message"` 付近に `{ once: true }` が無い |
| 9 | ackは event.data の完全一致で検証している（SEC-31） | callback.js | M-02 | `event.data !== "authorizing:github"`（または `===` で早期 return）。部分一致・includes 等は不合格 |
| 10 | オリジン検証とペイロード検証の両方を通過したときだけ removeEventListener している（SEC-31） | callback.js | M-02 | `handleMessage` 内で origin / payload の早期 return より後にのみ `removeEventListener("message"` がある |
| 11 | フェイルセーフの setTimeout（30000ms）でタイムアウト時に listener を外す（SEC-31） | callback.js | M-02 | `setTimeout(..., 30000)` があり、コールバック内で `removeEventListener("message"` する |

---

## 2.4. CMS設定検証 (`cms-config.test.mjs`) — 60件

`public/admin/config.yml`をパースし、設定値の正当性を検証する。

| No. | テストケース | カテゴリ | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- | :--- |
| 1 | GitHubバックエンドが設定されている | バックエンド | M-03 | `backend.name === "github"` |
| 2 | リポジトリが正しく設定されている | バックエンド | M-03 | `backend.repo === "bickojima/my-blog"` |
| 3 | ブランチが有効な値に設定されている（実行時導出の実効値が main/staging のいずれか） | バックエンド | M-03 | 4ホスト（本番・staging・プレビュー・localhost）で config.yml と `resolveCmsBackend(location)` を deepmerge した `branch` が `main`/`staging` のいずれか（Issue #127 で書き換え: config.yml から branch を削除したため） |
| 4 | 認証エンドポイントが設定されている | バックエンド | M-03 | `backend.auth_endpoint` が定義されている |
| 5 | base_urlがブランチに対応するURLに設定されている（本番ホスト=main+本番URL、stagingホスト=staging+staging URL） | バックエンド | M-03 | 実効設定で本番ホストは `branch: main`・`base_url: https://reiwa.casa`、staging ホストは `branch: staging`・`base_url: https://staging.reiwa.casa`（Issue #127 で書き換え） |
| 6 | メディアフォルダがpublic配下に設定されている | メディア | M-03 | `media_folder`に`public`が含まれる |
| 7 | 公開フォルダパスが正しい | メディア | M-03 | `public_folder === "/images/uploads"` |
| 8 | 日本語ロケールが設定されている | ロケール | M-03 | `locale === "ja"` |
| 9 | Unicode対応のスラッグエンコーディングが設定されている | スラッグ | M-03 | `slug.encoding === "unicode"` |
| 10 | アクセント文字のクリーニングが無効である | スラッグ | M-03 | `slug.clean_accents === false` |
| 11 | コレクションが2つ（posts, pages）定義されている | コレクション | M-03, M-04 | `collections.length === 2` かつ `posts`, `pages` が含まれる |
| 11b | postsコレクションが先頭に定義されている | コレクション | M-03 | `collections[0].name === "posts"`, `collections[1].name === "pages"` |
| 12 | フォルダが正しいパスに設定されている | posts | M-03 | `folder === "src/content/posts"` |
| 13 | 新規作成が有効になっている | posts | M-03 | `create === true` |
| 14 | 拡張子がmdに設定されている | posts | M-03 | `extension === "md"` |
| 15 | フォーマットがfrontmatterに設定されている | posts | M-03 | `format === "frontmatter"` |
| 16 | pathプロパティに年月パスが含まれている | posts | M-03, M-02 | `path`に`{{year}}/{{month}}`が含まれる |
| 17 | slugがファイル名部分のみに設定されている | posts | M-03, M-02 | `slug === "{{slug}}"` |
| 18 | サマリー表示に日付とタイトルが含まれている | posts | M-03, M-02 | `summary`に日付とタイトルのテンプレート変数が含まれる |
| 19 | 必須フィールドがすべて定義されている | フィールド | M-04 | `title`, `date`, `body` が`fields`に存在する |
| 20 | categoryフィールドが存在しない | フィールド | M-04, M-09 | `fields`に`category`が含まれない |
| 21 | オプションフィールドが定義されている | フィールド | M-04 | `draft`, `tags`, `thumbnail`が`fields`に存在する |
| 22 | titleフィールドがstringウィジェットである | フィールド | M-04 | `widget === "string"` |
| 23 | dateフィールドがdatetimeウィジェットでYYYY-MM-DD形式である | フィールド | M-04 | `widget === "datetime"`, `format === "YYYY-MM-DD"` |
| 24 | draftフィールドがbooleanウィジェットでデフォルトfalseである | フィールド | M-04 | `widget === "boolean"`, `default === false` |
| 25 | tagsフィールドがlistウィジェットでオプションである | フィールド | M-04 | `widget === "list"`, `required === false` |
| 26 | thumbnailフィールドがimageウィジェットでオプションである | フィールド | M-04 | `widget === "image"`, `required === false` |
| 27 | bodyフィールドがmarkdownウィジェットである | フィールド | M-04 | `widget === "markdown"` |
| 28 | pagesコレクションのフォルダが正しいパスに設定されている | pages | M-03 | `folder === "src/content/pages"` |
| 29 | pagesコレクションの新規作成が有効になっている | pages | M-03 | `create === true` |
| 30 | pagesコレクションの拡張子がmdに設定されている | pages | M-03 | `extension === "md"` |
| 31 | pagesコレクションのslugテンプレートがfields.slugを参照している | pages | M-03 | `slug === "{{fields.slug}}"`（`{{slug}}`はタイトルベースのため不可） |
| 32 | pagesの必須フィールドがすべて定義されている | pages フィールド | M-04 | `title`, `slug`, `order`, `body` が存在する |
| 33 | pagesのslugフィールドにバリデーションパターンがある | pages フィールド | M-04 | `pattern[0] === "^[a-z0-9-]+$"` |
| 34 | pagesのorderフィールドがnumberウィジェットである | pages フィールド | M-04 | `widget === "number"`, `value_type === "int"` |
| 35 | pagesのdraftフィールドがbooleanウィジェットでデフォルトfalseである | pages フィールド | M-04 | `widget === "boolean"`, `default === false` |
| 35b | pagesのnoindexフィールドがbooleanウィジェットでデフォルトfalseである（FR-29） | pages フィールド | M-04 | `widget === "boolean"`、`default === false` |
| 35c | 既存固定ページのフロントマター項目がすべてCMSフィールドに定義されている（FR-29） | pages フィールド | M-04 | `src/content/pages/*.md` の全キーが `fields` の `name` に存在する。CMS保存時の項目欠落を防ぐ |
| 35d | 固定ページのZodスキーマ項目がすべてCMSフィールドに定義されている（FR-29） | pages フィールド | M-04 | `content.config.ts` の pages スキーマの全キーが `fields` に存在する |
| 36 | pagesのbodyフィールドがmarkdownウィジェットである | pages フィールド | M-04 | `widget === "markdown"` |
| 37 | pagesコレクションのフォーマットがfrontmatterに設定されている | pages | M-03 | `format === "frontmatter"` |
| 38 | pagesのサマリー表示にorder・draft・titleが含まれている | pages | M-03, M-02 | `summary`に`{{order}}`、`{{draft}}`、`{{title}}`が含まれる |
| 39 | pagesのソート可能フィールドにorderとtitleが含まれている | pages | M-04 | `sortable_fields`に`order`と`title`が含まれる |
| 40 | 全コレクションのsortable_fieldsが有効な形式である | 互換性 | M-03 | 文字列 or `{field, default_sort}`オブジェクト形式（Decap CMS v3.10.0互換） |
| 41 | pagesのorderフィールドがデフォルトで昇順ソートに設定されている | pages | M-04 | `{field: "order", default_sort: "asc"}`形式で設定されている |
| 42 | DOCUMENTATION.mdの全CMS要件IDがトレーサビリティマトリクスに記載されている | 全体 | M-03 | 要件一覧のCMS-XXがすべてトレーサビリティマトリクスに存在する |
| 43 | config.ymlの全コレクションに対応する要件がDOCUMENTATION.mdに存在する | 全体 | M-03 | config.ymlの各コレクション名がDOCUMENTATION.mdに記載されている |

### 2.4.1 基本機能保護テスト（5件）

| No. | テストケース | カテゴリ | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- | :--- |
| 45 | backend設定に保存に必要な全フィールドが存在する（FR-15） | 基本機能 | M-03 | 4ホストそれぞれの実効設定（config.yml + 実行時導出値）で `name`, `repo`, `branch`, `base_url`, `auth_endpoint`が全て定義されている（Issue #127 で書き換え） |
| 46 | 全コレクションでdeleteが明示的に無効化されていない（FR-16） | 基本機能 | M-03 | `delete !== false`（デフォルト有効） |
| 26b | postsのbodyフィールドがmarkdownウィジェットである（FR-17） | 基本機能 | M-03 | `widget === "markdown"` |
| 33b | pagesのbodyフィールドがmarkdownウィジェットである（FR-17） | 基本機能 | M-03 | `widget === "markdown"` |
| 47 | 全コレクションにmedia_folderが設定されている（FR-19） | 基本機能 | M-03 | 各コレクションに`media_folder`が定義されている |

### 2.4.2 記事ソート・グルーピングテスト（3件）

| No. | テストケース | カテゴリ | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- | :--- |
| 48 | postsのソート可能フィールドにdateとtitleが含まれている（CMS-17） | posts | M-03 | `sortable_fields`に`date`と`title`が含まれる |
| 49 | postsのdateフィールドがデフォルトで降順ソートに設定されている（CMS-17） | posts | M-03 | `{field: date, default_sort: desc}` |
| 50 | postsのview_groupsに年月グルーピングのみが設定されている（CMS-18） | posts | M-03 | `view_groups`に「年月」（`\d{4}-\d{2}`）の1グループ |

### 2.4.3 環境固有値の導出整合性検証（SEC-35 改訂, Bug #51再発防止, Issue #127、5件・全ブランチ共通）

Issue #127 で、環境固有の4項目（config.yml の branch/base_url、astro.config.mjs の SITE_URL、robots.txt）をファイルから削除し、ビルド時（`CF_PAGES_BRANCH`）・実行時（`location`）に導出する構造へ変えた。旧 SEC-35（No.51〜55: チェックアウト中のブランチを `CF_PAGES_BRANCH` > `GITHUB_REF_NAME` > `git rev-parse` で判定し、main/staging なら4項目の絶対値、判定不能なら内部整合だけを見る）は、検証対象の値がファイルから消えたため成立しない。同じ目的（「今の環境で CMS がどこへ書き込み、サイトがどの URL を名乗るか」が正しいこと）を、導出結果に対して検証するテストへ書き換えた。削除・スキップはしていない（旧5件→新5件）。**テスト集合はブランチに依存しない**ため、feature と main/staging で件数差は出ない。

| No. | テストケース | カテゴリ | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- | :--- |
| 51 | reiwa.casa で開いた CMS の実効 backend は branch=main・base_url=配信オリジン | 環境整合 | M-03 | config.yml と `resolveCmsBackend(location)` の deepmerge 結果が `main` / `https://reiwa.casa` |
| 52 | staging.reiwa.casa で開いた CMS の実効 backend は branch=staging・base_url=配信オリジン | 環境整合 | M-03 | `staging` / `https://staging.reiwa.casa` |
| 53 | my-blog-3cg.pages.dev で開いた CMS の実効 backend は branch=staging・base_url=配信オリジン | 環境整合 | M-03 | main の Pages エイリアスでも本番へは書き込まない |
| 54 | localhost:4321 で開いた CMS の実効 backend は branch=staging・base_url=配信オリジン | 環境整合 | M-03 | ローカルは staging。base_url がローカルオリジンなので OAuth モックが config.yml の書き換えなしで動く |
| 55 | config.yml 単体には branch / base_url が無い（マージで持ち込まれる環境値を置かない） | 環境整合 | M-03 | `backend.branch` / `backend.base_url` が undefined |

生成物（dist）の検証は 2.5.13章、導出関数の単体テストと静的ガードは 2.10章、CMS の実操作は 4.1.3章 E-47。

---

## 2.5. ビルド検証 (`build.test.mjs`) — 129件

`npm run build`を実行し、パイプライン全体（normalize-images → organize-posts → astro build → image-optimize）の出力を検証する。全テストケースはビルド完了後に実行される。

| No. | テストケース | カテゴリ | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- | :--- |
| 1 | distディレクトリが生成される | 成果物 | M-01, M-12 | `dist/`ディレクトリが存在する |
| 2 | トップページが生成される | 成果物 | M-01, M-12 | `dist/index.html`が存在する |
| 3 | 管理画面がコピーされる | 成果物 | M-01 | `dist/admin/index.html`が存在する |
| 4 | CMS設定がコピーされる | 成果物 | M-01 | `dist/admin/config.yml`が存在する |
| 5 | faviconファイルが存在する | 成果物 | M-01 | `dist/favicon.*`が存在する |
| 6 | robots.txtが存在する | 成果物 | M-01 | `dist/robots.txt`が存在する |
| 7 | _headersファイルが存在する | 成果物 | M-01 | `dist/_headers`が存在する |
| 8 | _redirectsファイルが存在する | 成果物 | M-01 | `dist/_redirects`が存在する |
| 9 | 公開記事のページが生成されている | 記事 | M-01, M-12 | 公開記事数分のHTMLが`dist/posts/`に生成される |
| 10 | 記事ページがyyyy/mm/記事名の構造である | 記事 | M-01 | ソースから動的取得した記事の`dist/posts/YYYY/MM/記事名/index.html`が存在する |
| 11 | 年別アーカイブページが生成される | アーカイブ | M-01 | ソースの記事日付から動的取得した年の`dist/posts/YYYY/index.html`が存在する |
| 12 | 月別アーカイブページが生成される | アーカイブ | M-01 | ソースの記事日付から動的取得した年月の`dist/posts/YYYY/MM/index.html`が存在する |
| 13 | カテゴリページが生成されていない | アーカイブ | M-01, M-09 | `dist/categories/`が存在しない |
| 14 | タグページディレクトリが生成される | タグ | M-01 | `dist/tags/*/index.html`が存在する |
| 15 | HTML5 doctype宣言がある | HTML品質 | M-02 | `<!DOCTYPE html>`（大文字小文字不問）が含まれる |
| 16 | lang="ja"が設定されている | HTML品質 | M-02 | `<html`タグに`lang="ja"`が含まれる |
| 17 | viewportメタタグが設定されている | HTML品質 | M-02 | `<meta name="viewport"`が含まれる |
| 18 | サイトタイトルが含まれている | コンテンツ | M-02 | `<title>`にサイトタイトルが含まれる |
| 19 | 「記事一覧」見出しが含まれている | コンテンツ | M-02 | HTMLに「記事一覧」を含む見出し要素が存在する |
| 20 | 管理画面へのリンクがフッターにある | ナビゲーション | M-02 | `href="/admin"`を含むリンクが存在する |
| 21 | 公開記事へのリンクが含まれている | ナビゲーション | M-02 | ソースから動的取得した記事タイトルと`href="/posts/YYYY/MM/"`リンクが存在する |
| 22 | カテゴリリンクが含まれていない | ナビゲーション | M-02, M-09 | `href="/categories/`を含むリンクが存在しない |
| 23 | タグリンクが含まれている | ナビゲーション | M-02 | `href="/tags/`を含むリンクが存在する |
| 23b | 7件目以降の記事カードにcontent-visibilityによる描画最適化がある | Modern Web Guidance | M-02 | `content-visibility:auto` と `contain-intrinsic-size:auto 220px` が含まれ、E-05で先頭6件は`visible`、7件目以降は`auto` |
| 23c | ナビゲーションにアクセシブルなラベルとfocus-visibleスタイルがある | Modern Web Guidance | M-02 | `aria-label="メイン"`、`aria-labelledby="archive-heading"`、`:focus-visible` が含まれる |
| 24 | アーカイブナビゲーションが含まれている | ナビゲーション | M-02 | 「アーカイブ」テキストとソースから動的取得した年の`href="/posts/YYYY"`リンクが含まれる |
| 25 | copyright表記がある | フッター | M-02 | `©`またはcopyright文字列が含まれる |
| 26 | Netlify Identityスクリプトが含まれていない | セキュリティ | M-02, M-09 | `identity.netlify.com`および`netlifyIdentity`が含まれない |
| 27 | 記事ページに「記事一覧に戻る」リンクがある | ナビゲーション | M-02 | ソースから動的取得した記事のHTMLに「記事一覧に戻る」と`href="/"`が存在する |
| 28 | アップロード画像ディレクトリが存在する | 画像 | M-01 | `dist/images/uploads/`が存在する |
| 29 | ビルド後の画像にEXIF回転が残っていない | 画像 | M-10, M-12 | 全画像のEXIF orientationが1または未定義である |
| 30 | ビルド後の画像がMAX_WIDTH以下にリサイズされている | 画像 | M-10, M-12 | 全画像のピクセル幅が1200px以下である |
| 31 | title付き画像がfigure/figcaptionに変換されている | プラグイン | M-02, M-12 | dist/posts/内の記事HTMLを動的走査し`<figure>`と`<figcaption>`を含む記事が1件以上存在する |
| 32 | 全固定ページのHTMLが生成される | 固定ページ | M-01 | ソースから動的取得した全固定ページの`dist/{slug}/index.html`が存在する |
| 33 | 各固定ページにタイトルが含まれている | 固定ページ | M-02 | 各固定ページHTMLにソースのtitleが含まれる |
| 34 | 各固定ページに「記事一覧に戻る」リンクがある | 固定ページ | M-02 | 各固定ページHTMLに「記事一覧に戻る」と`href="/"`が含まれる |
| 35 | トップページのヘッダーにナビ表示対象の固定ページへのリンクがある | ナビゲーション | M-02 | ソースから動的取得したdraft・noindex以外の固定ページの`href="/{slug}"`が含まれる |
| 36 | ドロップダウン構造（nav-dropdown）が存在する | ナビゲーション | M-02 | 固定ページ2件以上の場合`nav-dropdown`クラスが含まれる |
| 37 | ドロップダウントグルボタン（▾）が存在する | ナビゲーション | M-02 | `nav-dropdown-toggle`と`▾`が含まれる |
| 38 | ドロップダウンメニュー（nav-dropdown-menu）が存在する | ナビゲーション | M-02 | `nav-dropdown-menu`が含まれる |
| 39 | 最優先ページが直接リンクとして表示される | ナビゲーション | M-02 | ソースのorder最小ページの`nav-dropdown-link`とタイトルが含まれる |
| 40 | ドロップダウンメニューにナビ表示対象の固定ページが含まれている | ナビゲーション | M-02 | メニュー内にソースの全固定ページタイトルが含まれる |
| 41 | ドロップダウンのJS制御スクリプトが存在する | ナビゲーション | M-02 | `mouseenter`, `mouseleave`, `is-open`が含まれる |
| 42 | mouseleaveに300ms遅延が設定されている | ナビゲーション | M-02 | `setTimeout`と`300`が含まれる |
| 43 | 外側クリックで閉じるハンドラが存在する | ナビゲーション | M-02 | `document.addEventListener`と`.contains(`が含まれる |
| 44 | 固定ページが各ページの出力にもドロップダウンナビを持つ | ナビゲーション | M-02 | 固定ページHTMLに`nav-dropdown`と`nav-dropdown-menu`が含まれる |
| 45 | url-map.jsonがdist/admin/に出力されている | URLマッピング | M-01 | `dist/admin/url-map.json`が存在する |
| 46 | url-map.jsonが有効なJSONオブジェクトである | URLマッピング | M-01, M-03 | `typeof === "object"`, 非null, 非配列 |
| 47 | url-map.jsonに1件以上のエントリが含まれている | URLマッピング | M-01, M-03 | `Object.keys(urlMap).length > 0` |
| 48 | url-map.jsonのキーがYYYY/MM/スラグ形式である | URLマッピング | M-03, M-02 | 全キーが`/^\d{4}\/\d{2}\/.+$/`にマッチ |
| 49 | url-map.jsonの値が/posts/YYYY/MM/スラグ形式のURLパスである | URLマッピング | M-03, M-02 | 全値が`/^\/posts\/\d{4}\/\d{2}\/.+$/`にマッチ |
| 50 | url-map.jsonのキーと値のスラグ部分が一致している | URLマッピング | M-03, M-02 | `value === "/posts/" + key` |
| 51 | 下書き記事がurl-map.jsonに含まれていない（SEC-29, Bug #48再発防止） | URLマッピング | M-01, M-09 | 下書き記事（`draft: true`）のslugが、url-map.jsonの全キー・全値の末尾セグメント（basename）と完全一致しない |
| 52 | 公開記事のslugが全てurl-map.jsonに含まれている（下書き除外が過剰でないことの確認） | URLマッピング | M-01, M-03 | 公開記事（`draft`が`true`でない）の全slugが、url-map.jsonのキーのbasenameに含まれる |

### 2.5.1 セキュリティヘッダー検証（8件）

| No. | テストケース | カテゴリ | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- | :--- |
| 1 | _headersにX-Content-Type-Optionsが設定されている（SEC-10） | セキュリティヘッダー | M-02 | `X-Content-Type-Options: nosniff`が含まれる |
| 2 | _headersにReferrer-Policyが設定されている（SEC-10） | セキュリティヘッダー | M-02 | `Referrer-Policy: strict-origin-when-cross-origin`が含まれる |
| 3 | _headersにPermissions-Policyが設定されている（SEC-10） | セキュリティヘッダー | M-02 | `Permissions-Policy`ディレクティブが含まれる |
| 4 | _headersにStrict-Transport-Securityが設定されている（SEC-10） | セキュリティヘッダー | M-02 | `Strict-Transport-Security`が含まれる |
| 5 | /admin/*にContent-Security-Policyが設定されている（SEC-10） | セキュリティヘッダー | M-02 | `Content-Security-Policy`ディレクティブが`/admin/*`セクションに含まれる |
| 6 | X-Frame-Optionsは/admin/*で再定義されず/*から継承される（SEC-10, Issue #115, Bug #49） | セキュリティヘッダー | M-02 | `/admin/*`セクションに`X-Frame-Options:`が存在せず、`/*`セクションに`X-Frame-Options: SAMEORIGIN`が含まれる |
| 7 | COOPは/admin/*で再定義されず/*から継承され、same-origin-allow-popupsが適用される（SEC-10, Issue #115, Bug #49） | セキュリティヘッダー | M-02 | `/admin/*`セクションに`Cross-Origin-Opener-Policy:`が存在せず、`/*`セクションに`Cross-Origin-Opener-Policy: same-origin-allow-popups`が含まれる |
| 8 | CSP connect-srcにblob:が含まれている（Bug #29再発防止） | セキュリティヘッダー | M-02 | CSPの`connect-src`ディレクティブに`blob:`が含まれる（Decap CMS画像保存時の`fetch(blobURL)`に必要） |

### 2.5.2 ビルドパイプライン検証（3件）

| No. | テストケース | カテゴリ | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- | :--- |
| 51 | buildスクリプトに4段階パイプラインが定義されている（FR-20） | パイプライン | M-02 | `build:raw`に`normalize-images`, `organize-posts`, `astro build`が含まれる |
| 52 | Vitestの探索範囲がtests配下の単体・統合テストに限定されている（Bug #46） | パイプライン | M-02 | `vitest.config.ts`に`include: ['tests/**/*.test.mjs']`がある |
| 53 | CMS記事作成E2Eに並列負荷を考慮したタイムアウトがある（Bug #47） | パイプライン | M-02 | E-28 describe に `timeout: 60000` がある |

### 2.5.3 _headersヘッダー重複防止検証（Bug #28再発防止、2件）

| No. | テストケース | カテゴリ | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- | :--- |
| 57 | /* と /admin/* で同名ヘッダーが重複していない | 重複防止 | M-02 | `/*`セクションと`/admin/*`セクションで同名ヘッダーが存在しない |
| 58 | 管理画面で緩和が必要なヘッダーが /* に含まれていない | 重複防止 | M-02 | COOP/CORP/X-Frame-Optionsが`/*`セクションに含まれない |

### 2.5.4 Modern Web Guidanceアクセシビリティ検証（Bug #43再発防止1件を含む、3件）

| No. | テストケース | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 1 | 記事・固定ページ本文リンクに識別可能なスタイルがある | M-02 | 下線、`#1a73e8`、`:focus-visible`が両テンプレートに定義される |
| 2 | コードブロック到達性rehype pluginがAstroへ登録される | M-02 | `rehypeFocusableCodeBlocks`が`rehypePlugins`に登録される |
| 3 | 本文リンク色（--color-link）はライト/ダーク両配色で背景とのコントラスト比4.5:1以上を満たす（Bug #43再発防止） | M-01 | `Base.astro`の`--color-bg`/`--color-link`実値からWCAG相対輝度・コントラスト比を計算し、ライト・ダーク双方で4.5以上 |

### 2.5.5 robots.txt環境別ポリシー検証（Bug #41再発防止、2件）

| No. | テストケース | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 1 | robots.txtがブランチに対応するクロール方針になっている | M-01 | ビルド時の `CF_PAGES_BRANCH`（`isProductionBranch()`）で期待値を決め、main以外は`Disallow: /`かつ`Allow: /`・`Sitemap:`なし、main時は`Allow: /`かつ`Disallow: /`なし・`Sitemap: https://reiwa.casa/sitemap-index.xml`を含む（Bug #45再発防止。Issue #127 で書き換え: 旧版は astro.config.mjs の SITE_URL リテラルから環境を推定していたが、SITE_URL が導出式になったため） |
| 2 | robots.txtのSitemap行はreiwa.casaドメインを指す | M-01 | Sitemap行が存在する場合、`https://(staging.)?reiwa.casa/`にマッチする |

### 2.5.6 個人ブログ化ロードマップ機能検証（FR-22〜FR-28, NFR-08、記事数により動的スキップ、15件）

記事数・summary/thumbnail有無に応じて動的に一部スキップされる（3件未満の記事構成では該当ケースをスキップ）。

| No. | テストケース | 要件 | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- | :--- |
| 1 | トップページに自身を指すcanonicalが出力される | FR-22 | M-01 | `<link rel="canonical" href="https://.../">`が存在する |
| 2 | 記事詳細ページにcanonicalが出力される | FR-22 | M-01 | 記事URLを指すcanonicalが存在する |
| 3 | thumbnail付き記事はog:imageが絶対URLで出力される | FR-23 | M-01 | `og:image`が絶対URL、`twitter:card`が`summary_large_image` |
| 4 | summary付き記事はog:description・meta descriptionにsummaryが反映される | FR-23 | M-01 | summary文字列を含むmeta要素が存在する |
| 5 | rss.xmlが生成される | FR-24 | M-01 | `dist/rss.xml`が存在する |
| 6 | 公開記事のタイトルが全て含まれる | FR-24 | M-01 | ソースから動的取得した全公開記事タイトルが`<title>`として含まれる |
| 7 | トップページにRSS autodiscoveryリンクがある | FR-24 | M-01 | `type="application/rss+xml"`が存在する |
| 8 | sitemap-index.xmlが生成される | FR-25 | M-01 | `dist/sitemap-index.xml`が存在する |
| 9 | sitemapに/admin/配下のURLが含まれない | FR-25 | M-01 | 全`sitemap-*.xml`に`/admin/`を含まない |
| 10 | タグ一覧ページに公開記事の全タグが含まれる | FR-26 | M-01 | ソースから動的取得した全タグ文字列が含まれる |
| 11 | 最新記事には「次の記事」が表示されない | FR-27 | M-01 | date降順で最新の記事HTMLに「次の記事」を含まない |
| 12 | 最古記事には「前の記事」が表示されない | FR-27 | M-01 | date降順で最古の記事HTMLに「前の記事」を含まない |
| 13 | 中間の記事には前後両方のリンクが表示される（記事3件以上） | FR-27 | M-01 | 「前の記事」「次の記事」両方を含む |
| 14 | meta color-schemeでダーク対応を宣言する | NFR-08 | M-01 | `color-scheme" content="light dark"`が存在する |
| 15 | prefers-color-schemeによる配色切り替えがCSSに定義される | NFR-08 | M-01 | ビルド後の`_astro/*.css`いずれかに`prefers-color-scheme: dark`を含む |

### 2.5.7 記事一覧のページネーション検証（FR-28, Bug #42再発防止、4件）

Bug #42: `/page/[page].astro`が`paginate()`の結果をフィルタせず生成していたため、1ページ目が`/`と`/page/1/`の2つのURLに重複生成され、`/page/1/`側もsitemapに登録される重複コンテンツ状態になっていた（引き継ぎ後のマージで混入）。`getStaticPaths`で`params.page !== '1'`のフィルタを追加し、1ページ目は`/`のみが担うよう修正した。

| No. | テストケース | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 1 | /page/1/ は生成されない（1ページ目は / が担う。重複コンテンツ防止） | M-01 | `dist/page/1/index.html`が存在しない |
| 2 | / の canonical は自身（/）を指す | M-01 | `<link rel="canonical" href=".../">`が存在する |
| 3 | 公開記事数がPAGE_SIZE超の場合のみ /page/2/ が生成される | M-01 | 記事数から動的算出した`totalPages`と生成有無が一致する |
| 4 | sitemapに /page/1/ の重複URLが含まれない | M-01 | `sitemap-0.xml`が`/page/1/`を含まない |

### 2.5.8 テストランナー分離・E2E安定性（Bug #46/#47再発防止、2件）

| No. | テストケース | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 1 | Vitestの探索範囲をプロジェクトの単体・統合テストに限定する | M-02 | `vitest.config.ts`に`include: ['tests/**/*.test.mjs']`があり、別worktreeや依存パッケージのテストを収集しない |
| 2 | OAuth・CMS初期化を含むE-28に並列負荷の余裕を設ける | M-02 | E-28 describeに60秒タイムアウトがあり、全444件並列実行時もリトライなしで完了する |

### 2.5.9 検索除外の固定ページ検証（FR-29、5件）

`src/content/pages/` のfrontmatterから対象を決め、URLをテストへハードコードしない。frontmatterの `noindex` と `astro.config.mjs` の sitemap `filter` のずれを #3 が検出する。

| No. | テストケース | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 1 | 検索除外の固定ページがビルドされる | M-01 | `noindex: true` のslugごとに `dist/<slug>/index.html` が存在する |
| 2 | 検索除外の固定ページに noindex が付与される | M-01 | `<meta name="robots" content="noindex">` を含む |
| 3 | 検索除外の固定ページがsitemapに含まれない | M-01 | `sitemap-*.xml` が対象slugを含まない |
| 4 | noindex指定のない固定ページには noindex が付かず、sitemapに載る | M-01 | 既存の固定ページに `robots` メタがなく、sitemapに掲載される |
| 5 | 検索除外ページをヘッダーナビから除外 | M-01 | トップと全公開固定ページのヘッダーにnoindexページへのリンクがなく、通常の固定ページへのリンクは残る |

### 2.5.10 画像正規化処理の堅牢化（SEC-32、3件）

| No. | テストケース | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 1 | sharp処理が try/catch で囲まれ、catch でビルド全体を throw していない（SEC-32） | M-02 | sharp 呼び出しが try 内にあり、`Failed to normalize` の catch は `console.warn` のみで `throw` / `process.exit` しない |
| 2 | .rotate().toBuffer() の出力 buffer.length に MAX_FILE_SIZE 上限がある（SEC-32） | M-02 | `.rotate().toBuffer()` があり、`buffer.length > MAX_FILE_SIZE` で出力側上限を検査する |
| 3 | lstat 失敗も try/catch で保護されている（SEC-32） | M-02 | `lstat` が try/catch で囲まれ、`Failed to stat` の catch は warn して継続する |

---

### 2.5.11 本番マージ前のローカルE2E必須（Bug #50、4件）

Playwright は CI に載せない。ローカル全件と `verify-comprehensive.mjs` を main マージの必須条件とし、手順文書を Vitest で固定する。雛形はシナリオ FAIL で非ゼロ終了する。

| No. | テストケース | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 1 | CI は Vitest とビルドのみで Playwright E2E を必須化しない（Bug #50） | M-02 | `.github/workflows/ci.yml` に `npm test` と `build:raw` があり、`npx playwright` / `npm run test:e2e` / `playwright test` が無い |
| 2 | 4.6章はローカルE2E全件と verify-comprehensive.mjs をmainマージの必須条件とし、Vitest だけでは main マージ不可とする（Bug #50） | M-02 | DOCUMENTATION.md 4.6章に `npm run test:e2e` / `verify-comprehensive.mjs` / `Vitest だけでは main マージ不可` / `CI に Playwright は載せない` があり、「可能な場合」が無い |
| 3 | CLAUDE.md のブランチマージ時は E2E と verify-comprehensive を必須とし、CI に Playwright は載せない（Bug #50） | M-02 | `### ブランチマージ時` 節に `Vitest だけでは main マージ不可` / `CI に Playwright は載せない` / `verify-comprehensive.mjs` / `npm run test:e2e` がある（ファイル全体の雛形言及では通さない） |
| 4 | verify-comprehensive 雛形はシナリオ FAIL で非ゼロ終了する（Bug #50） | M-02 | `evidence/2026-05-24/verify-comprehensive.mjs` に `if (failCount > 0) process.exit(1)` がある |

### 2.5.12 CI最小権限・action SHA固定と無効ファイル排除（SEC-33/SEC-34/SEC-36、3件）

| No. | テストケース | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 1 | CI ジョブは contents: read に限定する（SEC-33, Issue #117 項目2） | M-02 | `ci.yml` の job に `permissions: contents: read` があり `contents: write` が無い |
| 2 | dist に .assetsignore が存在しない（SEC-34, Issue #117 項目12） | M-02 | `public/.assetsignore` と `dist/.assetsignore` が無い |
| 3 | CI の全 action 参照は40桁の commit SHA で固定し、版をコメントで併記する（SEC-36, Issue #117 項目3） | M-02 | `.github/workflows/*.yml` の全 `uses:`（ローカル action 除く）が `owner/repo@<40桁hex>` で、行末に `# vX.Y.Z` がある |

### 2.5.13 CF_PAGES_BRANCH 別ビルドの環境値（SEC-35 改訂, Issue #127、15件）

同一ソースを `CF_PAGES_BRANCH=main` / `staging` / 未設定の3通りで `astro build --outDir <一時ディレクトリ>` し、生成物を検証する（「ビルド検証」の後に同一ファイル内で直列実行。並列ビルドを避ける）。

| No. | テストケース（各ビルドで1件ずつ、計3×5） | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 1 | robots.txt のクロール方針 | M-01 | main: `Allow: /`・本番 Sitemap・Disallow なし／staging・未設定: `Disallow: /`・Allow なし・Sitemap なし |
| 2 | トップと記事ページの canonical | M-01 | main: `https://reiwa.casa`、staging・未設定: `https://staging.reiwa.casa`（記事はソースから動的取得した先頭記事） |
| 3 | sitemap-index.xml と sitemap-0.xml の全 URL のオリジン | M-01 | 同上のオリジンのみ |
| 4 | RSS の全 `<link>` のオリジン | M-01 | 同上のオリジンのみ |
| 5 | admin/config.yml は全ビルド同一で branch / base_url を含まない | M-01, M-03 | `public/admin/config.yml` と完全一致 |

## 2.6. 管理画面HTML検証 (`admin-html.test.mjs`) — 90件

`public/admin/index.html`のHTML/CSS/JavaScript内容を文字列パターンマッチングで検証する。

### 2.6.1 基本構造（7件）

| No. | テストケース | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 1 | HTML5 doctype宣言がある | M-02 | `<!doctype html>`が含まれる |
| 2 | 文字エンコーディングがUTF-8に設定されている | M-02 | `charset="utf-8"`が含まれる |
| 3 | robots noindex が設定されている | M-02 | `noindex`が含まれる |
| 4 | viewportメタタグが設定されている | M-02 | `viewport`が含まれる |
| 5 | Decap CMSのスクリプトが読み込まれている | M-02 | `decap-cms`のスクリプトURLが含まれる |
| 6 | CDN scriptタグが`</script>`で正しく閉じられている（バグ#27再発防止） | M-02 | `<script src="...cdn..."></script>`形式であること。閉じタグ欠落で後続スクリプトブロックが飲み込まれる致命的バグを検出 |
| 7 | CMS.registerPreviewStyleが独立した`<script>`ブロック内にある（バグ#27再発防止） | M-02 | registerPreviewStyleが`<script>...</script>`内にあり、CDNスクリプトのインライン内容に含まれていないこと |

### 2.6.2 PC端末対応（6件）

| No. | テストケース | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 1 | box-sizing: border-boxがグローバルに設定されている | M-02 | CSS内に`box-sizing: border-box`が含まれる |
| 2 | 横はみ出し防止のoverflow-x: hiddenが設定されている | M-02 | CSS内に`overflow-x: hidden`が含まれる |
| 3 | コレクション一覧の日付バッジスタイルが定義されている | M-02 | 日付バッジ用CSSが含まれる |
| 4 | 選択解除ボタンのスタイルが定義されている | M-02 | 選択解除ボタン用CSSが含まれる |
| 5 | 完全削除ボタンのスタイルが定義されている | M-02 | 完全削除ボタン用CSSが含まれる |
| 6 | 完全削除ボタンの無効状態スタイルが定義されている | M-02 | disabled時のCSSが含まれる |

### 2.6.3 モバイル対応（10件）

| No. | テストケース | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 1 | 799pxブレイクポイントのメディアクエリが存在する | M-02 | `max-width: 799px`メディアクエリが含まれる |
| 2 | アプリコンテナのレイアウト調整がある | M-02 | AppMainContainerのCSS調整が含まれる |
| 3 | サイドバーがposition: initialに変更されている | M-02 | `position: initial`が含まれる |
| 4 | エディタのコントロールバーがstickyに設定されている | M-02 | `position: sticky`が含まれる |
| 5 | 保存・公開ボタンのタップ領域が44px以上確保されている | M-02 | `min-height: 44px`が含まれる |
| 6 | ドロップダウンがボトムシート形式でfixed表示される | M-02 | `position: fixed` `z-index: 99999` `bottom: 0`がDropdownListに含まれる |
| 7 | モーダルが画面幅95%で表示される | M-02 | `95vw`が含まれる |
| 8 | メディアライブラリのカードグリッドが2列表示である | M-02 | `repeat(2, 1fr)`が含まれる |
| 9 | 画像選択ボタンが縦並び・全幅表示である | M-02 | `width: 100%`がボタンに適用されている |
| 10 | メディアライブラリのスクロール対応がある | M-02 | `-webkit-overflow-scrolling`または`overflow`関連CSSが含まれる |

### 2.6.4 画像回転対応（2件）

| No. | テストケース | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 1 | image-orientation: from-image が設定されている | M-02 | CSS内に`image-orientation: from-image`が含まれる |
| 2 | ドロップダウン表示時にURLバーとの重なりをJSで制御している | M-02 | `manageDropdownOverlay`関数と`cms-public-url`要素が含まれる |

### 2.6.5 iPhone固有対応（5件）

| No. | テストケース | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 1 | 入力フォームのfont-sizeが16px以上である | M-02 | `font-size: 16px`がinput/textarea/selectに適用されている |
| 2 | HEIC画像アップロード時のaccept属性制限がある | M-02 | JS内にaccept属性の書き換え処理が含まれる |
| 3 | pull-to-refresh無効化スクリプトがある | M-02 | `touchstart`または`touchmove`のpreventDefault処理が含まれる |
| 4 | モーダル内のスクロールは許可されている | M-02 | モーダル内のタッチイベント伝搬許可処理が含まれる |
| 5 | touchmoveハンドラがSlateエディタとCodeMirrorを除外している | M-02 | `data-slate-editor`と`CodeMirror`のホワイトリストチェックが含まれる |

### 2.6.5b Slate codeblockクラッシュ対策（3件）

| No. | テストケース | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 1 | モバイルでcodeblockボタンを非表示にする関数がある | M-02 | `hideCodeBlockOnMobile`関数と`window.innerWidth > 799`のモバイル判定が含まれる |
| 2 | Slateエラー（toSlatePoint/toSlateRange）のグローバルハンドラがある | M-02 | `toSlatePoint`/`toSlateRange`をキャッチするwindow errorハンドラが含まれる |
| 3 | MutationObserverがrequestAnimationFrameでデバウンスされている | M-02 | `requestAnimationFrame`と`rafPending`によるデバウンス処理が含まれる |

### 2.6.6 JavaScriptカスタマイズ（10件）

| No. | テストケース | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 1 | MutationObserverによるDOM監視が設定されている | M-02 | `MutationObserver`のインスタンス化コードが含まれる |
| 1b | ヘッダーにサイトへのリンク追加機能がある | M-02 | `addSiteLink`関数、`cms-site-link` ID、`window.location.origin`によるリンク、`target="_blank"`が含まれる |
| 2 | コレクション一覧の日付フォーマット処理がある | M-02 | 日付パース・フォーマット処理のJS関数が含まれる |
| 3 | 削除ボタンのラベル変更処理がある | M-02 | ボタンテキスト書き換え処理が含まれる |
| 4 | 削除ボタンの文脈判定がある | M-02 | メディアライブラリ/エディタの文脈判定ロジックが含まれる |
| 5 | 選択状態による削除ボタンの有効/無効制御がある | M-02 | disabled属性の動的切替処理が含まれる |
| 6 | エディタ画面に公開URL表示機能がある | M-02 | `window.location.origin`を使った公開URL生成・表示のJS処理が含まれる |
| 7 | 記事の公開URLがタイトルと日付から動的生成される | M-02 | タイトル・日付フィールド監視と URL 構築処理が含まれる |
| 8 | 固定ページの公開URLがslugフィールドから生成される | M-02 | `/collections/pages/`判定とslugInputによるURL構築処理が含まれる |
| 9 | 選択状態の判定がborderColorで行われている | M-02 | `borderColor`による選択判定ロジックが含まれる |
| 10 | 固定ページ一覧の番号・下書きフォーマット処理がある | M-02 | `pagesMatch`正規表現（`番号 \| draft \| タイトル`形式）と番号バッジ・下書きバッジ表示処理が含まれる |
| 11 | グルーピング表示時にグループを降順に並べ替える機能がある（CMS-19） | M-02 | `reverseViewGroups`関数・`getSortKey`ヘルパー・ISO/日本語両形式対応 |
| 12 | 年月グルーピングがデフォルトで自動有効化される（CMS-19） | M-02 | `activateDefaultGrouping`関数・`cms-group-activated`マーカー・`aria-haspopup`トリガー検索 |
| 13 | グループ見出しが日本語形式に変換される（CMS-19） | M-02 | `formatGroupHeadings`関数・`jaFormatted`マーカー |
| 14 | 年月選択プルダウンで選択年月のみ表示される（CMS-19, Bug #37） | M-02 | `createMonthSelector`関数・`cms-month-selector`要素・`すべての年月`初期値・`applyMonthFilter`による非選択グループ非表示・`scrollIntoView`不使用 |
| 15 | 年月選択プルダウンにアクセシブルネームと44pxタップ領域がある | M-02 | `aria-label="年月で絞り込み"`と899px以下の`min-height: 44px`が定義される |

### 2.6.7 iPad対応（4件）

| No. | テストケース | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 1 | フッターボタンがflex配置である | M-02 | `display: flex`がフッターボタン領域に適用されている |
| 2 | アップロードボタンが全幅で表示される | M-02 | `width: 100%`がアップロードボタンに適用されている |
| 3 | ツールバーがwrapで折り返し対応である | M-02 | `flex-wrap: wrap`がツールバーに適用されている |
| 4 | 戻るリンクが省略表示される | M-02 | 戻るリンクの省略表示CSSが含まれる |

### 2.6.8 ボタン押下可能性検証（6件）

| No. | テストケース | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 1 | 保存・公開ボタンがflex-shrink: 0で縮小されない | M-02 | `flex-shrink: 0`がボタンに適用されている |
| 2 | min-heightが44px以上である | M-02 | `min-height: 44px`（Apple HIG基準）が適用されている |
| 3 | モーダルフッターのボタンが均等配置される | M-02 | モーダルフッターにflex均等配置CSSが含まれる |
| 4 | アップロードボタンがタップ可能である | M-02 | タップ領域確保CSSが含まれる |
| 5 | 画像ウィジェットボタンが全幅でタップ可能である | M-02 | `width: 100%`がImageWidgetButtonに適用されている |
| 6 | 新規投稿ボタンにパディングがある | M-02 | paddingが新規投稿ボタンに適用されている |

### 2.6.9 ドロップダウン重なり防止: PC（3件）

| No. | テストケース | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 1 | ドロップダウンがz-index: 9999で最前面に表示される | M-02 | `z-index: 9999`がDropdownListに適用されている |
| 2 | 公開URLバーがz-index: 9998で表示される | M-02 | `z-index: 9998`が公開URLバーに適用されている |
| 3 | DropdownListがボトムシートとしてposition:fixedで表示される | M-02 | DropdownListに`position: fixed`と`border-radius: 16px 16px 0 0`が適用されている |

### 2.6.10 ドロップダウン重なり防止: モバイル（8件）

| No. | テストケース | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 1 | EditorControlBarがz-index: 300でsticky表示される | M-02 | `z-index: 300`かつ`position: sticky`が適用されている |
| 2 | エディタコンテナのoverflowがvisibleである | M-02 | `overflow: visible`が適用されている |
| 3 | ツールバーコンテナのoverflowがvisibleである | M-02 | `overflow: visible`がツールバーに適用されている |
| 4 | モーダルがz-indexなしである | M-02 | モーダルに対してz-indexの上書きが存在しない |
| 5 | カードグリッドがoverflowスクロール対応である | M-02 | `overflow`スクロール設定がカードグリッドに適用されている |
| 6 | AppMainContainerのmin-widthが0である | M-02 | `min-width: 0`が適用されている |
| 7 | コントロールパネルがmax-width: 100vwである | M-02 | `max-width: 100vw`が適用されている |
| 8 | PublishedToolbarButtonの::after疑似要素が非表示である | M-02 | `::after`に`display: none`が適用されている |

### 2.6.11 プレビュースタイル: 本番サイト再現（5件）

| No. | テストケース | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 1 | CMS.registerPreviewStyle が呼び出されている | M-02 | `CMS.registerPreviewStyle`が含まれる |
| 2 | 本番サイト相当のフォントファミリーが設定されている | M-02 | `-apple-system`と`Hiragino Kaku Gothic ProN`が含まれる |
| 3 | 本番サイト相当の行間（line-height: 1.9）が設定されている | M-02 | `line-height: 1.9`が含まれる |
| 4 | 画像スタイル（border-radius, margin）が設定されている | M-02 | `border-radius: 4px`と`margin: 1rem 0`が含まれる |
| 5 | コードブロックスタイルが設定されている | M-02 | `background: #f5f5f5`が含まれる |

### 2.6.12 セキュリティ検証（11件）

| No. | テストケース | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 1 | innerHTML/outerHTMLを使用していない（SEC-01） | M-02, M-09 | scriptブロック内に`innerHTML`/`outerHTML`が含まれない |
| 2 | CDN外部スクリプトのバージョンが正確に固定されている（SEC-03） | M-02 | unpkg.comのURLに`^`/`~`が含まれない |
| 3 | target="_blank"リンクにrel="noopener"が付与されている（SEC-04） | M-02 | target="_blank"の数とrel="noopener"の数が一致する |
| 4 | eval()/Function()/document.write()を使用していない（SEC-05） | M-02, M-09 | scriptブロック内に`eval(`/`new Function(`/`document.write(`が含まれない |
| 5 | console.logが本番コードに含まれていない（SEC-09） | M-02, M-09 | scriptブロック内に`console.log(`が含まれない（console.warnはエラーハンドリング用に許可） |
| 6 | ハードコードされたサイトURLが含まれていない（SEC-08） | M-02, M-09 | scriptブロック内に`reiwa.casa`が含まれない |
| 7 | Decap CMSのバージョンが正確に指定されている（SEC-03） | M-02 | `decap-cms@X.Y.Z`形式（^/~なし）でバージョンが指定されている |
| 8 | strictモードが有効である（Q-02） | M-02 | `'use strict'`が含まれる |
| 9 | var宣言が使用されていない（Q-01） | M-02, M-09 | scriptブロック内に`var `宣言が含まれない |
| 10 | CDNスクリプトにintegrity属性が設定されている（SEC-12） | M-02 | unpkg.comのscriptタグに`integrity="sha384-..."`属性が含まれる |
| 11 | CDNスクリプトにcrossorigin属性が設定されている（SEC-12） | M-02 | unpkg.comのscriptタグに`crossorigin="anonymous"`属性が含まれる |

### 2.6.13 環境分離検証（1件）

| No. | テストケース | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 8 | staging環境検知ロジックが存在する（FR-21: hostname判定） | M-02 | `hostname`文字列と`STAGING`/`staging`関連ロジックが存在する |

### 2.7 ファズテスト・不整合値テスト（fuzz-validation.test.mjs: 219件）

SEC-14〜SEC-20に対応するファズテスト。ビルド時に必ず実行される必須テスト。XSS/SQLi/パストラバーサル/コマンドインジェクション/プロトタイプ汚染の攻撃ペイロードに対する耐性を検証する。

#### 2.7.1 固定ページ order フィールドのファズテスト（SEC-19）

| # | テストケース | 手法 | 備考 |
| :--- | :--- | :--- | :--- |
| 1 | order=1（最小有効値）が受理される | M-02 | Zodスキーマ safeParse |
| 2 | order=0, -1, -999, MIN_SAFE_INTEGER が拒否される | M-02, M-09 | 負数・ゼロの境界値テスト |
| 3 | order=NaN, Infinity, -Infinity が拒否される | M-09 | 特殊数値テスト |
| 4 | order=1.5, 0.999, 1.001（小数）が拒否される | M-09 | 整数制約テスト |
| 5 | order="1", "abc", null, true, [], {} が拒否される | M-09 | 型不正テスト |
| 6 | XSSペイロード10種がorder値として拒否される | M-09 | 攻撃ペイロード注入 |
| 7 | CMS config.yml に min:1, value_type:int 制約がある | M-02 | CMS層バリデーション |
| 8 | 既存全ページのorderが1以上の正の整数 | M-02 | 実データ整合性検証 |

#### 2.7.2 固定ページ slug フィールドのファズテスト（SEC-19）

| # | テストケース | 手法 | 備考 |
| :--- | :--- | :--- | :--- |
| 1 | 有効なslug（英数字・ハイフン）が受理される | M-02 | 正常系6パターン |
| 2 | 大文字・スペース・アンダースコア・日本語等が拒否される | M-02 | 無効slug10パターン |
| 3 | XSSペイロード10種が拒否される | M-09 | `<script>`, `onerror=` 等 |
| 4 | SQLiペイロード5種が拒否される | M-09 | `' OR '1'='1` 等 |
| 5 | パストラバーサル6種が拒否される | M-09 | `../../../etc/passwd` 等 |
| 6 | コマンドインジェクション5種が拒否される | M-09 | `; ls -la`, `` `whoami` `` 等 |
| 7 | 既存ページに予約語slugが使われていない | M-02 | posts, tags, admin |

#### 2.7.3 title フィールドのファズテスト

| # | テストケース | 手法 | 備考 |
| :--- | :--- | :--- | :--- |
| 1 | null, 数値, オブジェクト, 配列が拒否される | M-09 | 型チェック |
| 2 | XSSペイロードはスキーマ上受理されるがSSGでエスケープ | M-02 | Astro自動エスケープ確認 |

#### 2.7.4 date フィールドのファズテスト

| # | テストケース | 手法 | 備考 |
| :--- | :--- | :--- | :--- |
| 1 | YYYY-MM-DD形式・Dateオブジェクトが受理される | M-02 | 正常系 |
| 2 | 数値, null, オブジェクト, 配列, boolean が拒否される | M-09 | 型チェック |

#### 2.7.5 tags フィールドのファズテスト

| # | テストケース | 手法 | 備考 |
| :--- | :--- | :--- | :--- |
| 1 | 空配列・文字列配列が有効 | M-02 | 正常系 |
| 2 | 数値配列, ネスト配列, オブジェクト配列, 文字列が拒否 | M-09 | 型チェック |
| 3 | XSSペイロードはスキーマ上受理されるがSSGでエスケープ | M-02 | Astro自動エスケープ |

#### 2.7.6 draft フィールドのファズテスト

| # | テストケース | 手法 | 備考 |
| :--- | :--- | :--- | :--- |
| 1 | true/false が有効、"true"/"false"/1/0/null が拒否 | M-09 | 厳密boolean型チェック |

#### 2.7.7 OAuth認証エンドポイントのファズテスト（SEC-11, SEC-13）

| # | テストケース | 手法 | 備考 |
| :--- | :--- | :--- | :--- |
| 1 | 空文字列CLIENT_IDで500エラー | M-09 | 環境変数異常値 |
| 2 | 超長URL（10000文字）でクラッシュしない | M-09 | バッファオーバーフロー対策 |
| 3 | XSSペイロードURL注入でリダイレクト先に反映されない | M-09 | リフレクション防止 |
| 4 | 空code, state不一致, Cookie不在で適切なエラーコード | M-06 | CSRF防止検証 |
| 5 | XSSペイロード10種のcode注入でHTMLに反映されない | M-09 | XSSペイロード注入 |
| 6 | 超長code（10000文字）でクラッシュしない | M-09 | バッファオーバーフロー |
| 7 | SQLiペイロード5種のcode注入でクラッシュしない | M-09 | SQLi耐性 |
| 8 | パストラバーサル6種のcode注入でクラッシュしない | M-09 | パストラバーサル耐性 |
| 9 | `</script>`含むトークンでHTMLが壊れない | M-09 | toScriptStringLiteral 検証（SEC-39） |
| 10 | バックスラッシュ・改行含むトークンの安全性検証 | M-09 | 生成リテラルを評価し元トークンと完全一致（ブレイクアウトなし）。改行・U+2028/U+2029 が生で出ない（SEC-39。旧版はソース文字列一致のみだった） |

#### 2.7.8 セキュリティヘッダー包括検証（SEC-10, SEC-14〜SEC-17）

| # | テストケース | 手法 | 備考 |
| :--- | :--- | :--- | :--- |
| 1 | X-Content-Type-Options: nosniff 設定確認 | M-02 | OWASP推奨 |
| 2 | X-Frame-Options は /admin/* で再定義されず /* から継承される | M-02 | クリックジャッキング防止（Issue #115, Bug #49: `/admin/*`では再定義せず`/*`の値を継承する設計に変更） |
| 3 | Referrer-Policy が安全な値に設定 | M-02 | 情報漏洩防止 |
| 4 | Permissions-Policy で geolocation 無効化 | M-02 | プライバシー保護 |
| 5 | Permissions-Policy で camera/microphone 無効化 | M-02 | プライバシー保護 |
| 6 | Permissions-Policy で interest-cohort(FLoC) 無効化 | M-02 | 広告トラッキング拒否 |
| 7 | HSTS: Strict-Transport-Security 設定確認 | M-02 | SEC-14 |
| 8 | HSTS: max-age≧15768000秒（6ヶ月以上） | M-02 | HSTS Preload要件 |
| 9 | HSTS: includeSubDomains 設定確認 | M-02 | サブドメイン保護 |
| 10 | HSTS: preload 設定確認 | M-02 | HSTS Preload List |
| 11 | COOPは /admin/* で再定義されず /* から継承され same-origin-allow-popups が適用される | M-02 | SEC-15, SEC-30（Issue #115, Bug #49: `/admin/*`では再定義しない設計に変更） |
| 12 | CORPは /admin/* で再定義されず /* から継承され same-site が適用される | M-02 | SEC-15, SEC-30（Issue #115, Bug #49: `/admin/*`では再定義しない設計に変更） |
| 16 | COOP/CORP/X-Frame-Options は /admin/* で再定義されず /* から継承される（3ヘッダーまとめて検証） | M-02 | SEC-30, Bug #28/#49 再発防止（重複送信の原因になる`/admin/*`側の再定義がないこと、`/*`に必要な値が定義されていることの両方を検証） |
| 13 | X-DNS-Prefetch-Control: off | M-02 | SEC-16 |
| 14 | X-Permitted-Cross-Domain-Policies: none | M-02 | SEC-16 |
| 15 | CSP: admin配下にdefault-src, frame-ancestors 'self' 設定 | M-02 | CSP検証（'none'→'self'にバグ#27で修正） |

#### 2.7.9 コードセキュリティ品質テスト

| # | テストケース | 手法 | 備考 |
| :--- | :--- | :--- | :--- |
| 1 | callback.js/index.jsにvar宣言なし | M-02 | コード品質 |
| 2 | admin/index.htmlにinnerHTML/outerHTML使用なし | M-02 | SEC-01 |
| 3 | CDNスクリプトにSRI integrity属性あり | M-02 | SEC-12 |
| 4 | CDNスクリプトにcrossorigin属性あり | M-02 | SEC-12 |

#### 2.7.10 情報漏洩防止テスト（SEC-18）

| # | テストケース | 手法 | 備考 |
| :--- | :--- | :--- | :--- |
| 1 | public配下に.envファイルが存在しない | M-02 | 秘密情報漏洩防止 |
| 2 | public配下に.gitディレクトリが存在しない | M-02 | ソースコード漏洩防止 |
| 3 | public配下にpackage.jsonが存在しない | M-02 | 依存関係情報漏洩防止 |
| 4 | public配下にwrangler.tomlが存在しない | M-02 | インフラ設定漏洩防止 |
| 5 | public配下にnode_modulesが存在しない | M-02 | ソース漏洩防止 |
| 6 | config.ymlにシークレット情報が含まれていない | M-02 | 秘密情報ハードコード検出 |
| 7 | admin/index.htmlにシークレット/ハードコードURL含まれない | M-02 | SEC-08 |
| 8 | Cloudflare Pages で無効な public/.assetsignore が存在しない | M-02 | SEC-34, Issue #117 項目12 |

#### 2.7.11 プロトタイプ汚染攻撃テスト

| # | テストケース | 手法 | 備考 |
| :--- | :--- | :--- | :--- |
| 1 | __proto__, __defineGetter__, __defineSetter__ がslugパターンで拒否 | M-09 | アンダースコア付きペイロード |
| 2 | constructor, prototype がslugパターン通過するが安全 | M-02 | 小文字英字のみ、URL衝突なし |
| 3 | 全プロトタイプ汚染ペイロードがorder値として拒否 | M-09 | 型チェックで防止 |

#### 2.7.12 管理画面が必要とするセキュリティヘッダー要件（/* からの継承値検証、バグ#27再発防止・Issue #115/Bug #49で設計変更）

Bug #27時点は`/admin/*`側で値を「オーバーライド」する設計だったが、Cloudflare PagesのAppend仕様（Bug #28/#49）によりオーバーライドは成立しないと判明したため、管理画面が必要とする値を`/*`側に直接定義し、`/admin/*`では再定義しない設計に変更した。以下は「`/admin/*`が実際に必要とする値が`/*`に定義されていること」を検証する。

| # | テストケース | 手法 | 備考 |
| :--- | :--- | :--- | :--- |
| 1 | COOPは /* で same-origin-allow-popups に設定される | M-02 | OAuth popup許可（window.opener維持）。Issue #115, Bug #49: `/admin/*`でのオーバーライドは成立しないため`/*`の値が直接適用される |
| 2 | X-Frame-Optionsは /* で SAMEORIGIN に設定される | M-02 | CMSプレビューiframe許可。Issue #115, Bug #49: 同上 |
| 3 | CORPは /* で same-site に設定される | M-02 | クロスサイトリソース読み込み許可。Issue #115, Bug #49: 同上 |
| 4 | CSP frame-src に blob: 含む | M-02 | CMSプレビュー用blob URL許可 |
| 5 | CSP connect-src に blob: 含む（Bug #29再発防止） | M-02 | Decap CMS画像保存時の`fetch(blobURL)`に必要 |
| 6 | /* と /admin/* で同名ヘッダーが重複していない（Bug #28再発防止） | M-02 | Cloudflare Pages Append動作による重複送信防止 |

#### 2.7.13 管理画面CSPで外部解析ビーコンを許可しない（SEC-41, Issue #130）

| # | テストケース | 手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 1 | `/admin/*` CSP に `cloudflareinsights` が含まれない | M-02 | Insights beacon は遮断されたまま |
| 2 | `script-src` / `connect-src` に任意ホスト向け wildcard / scheme-source がない | M-02 | beacon許可のためにCSPを緩めない |
| 3 | `_headers` に遮断方針を記録する | M-02 | 意図しない将来の許可変更を検出 |

実ホスト操作確認は `evidence/2026-09-23/issue130-review/` に保存する。production/staging のPC/iPad/iPhoneでCMS編集・入力・preview・保存を操作した。OAuth/GitHub APIはモックして実書込を遮断し、検証した操作範囲でInsights以外のCSP違反と機能エラーが無いことを確認する。これは実GitHub保存や全CMS機能の無影響を証明するものではない。

### 2.8 Issue #117 hardening 再発防止（security-hardening.test.mjs: 28件）

判定表: `docs/security/issue-117-hardening-decisions.md`。

| # | テストケース | 手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 1〜4 | `---js` / `---javascript` / `---JS` / `---json` で始まる frontmatter を評価せずに拒否する（Bug #52, SEC-29） | M-09 | `parseFrontmatter` が例外を投げ、ペイロード（グローバル変数の書き換え）が実行されない |
| 5 | 未登録の言語（---coffee 等）も拒否する | M-09 | 例外 |
| 6 | 通常の YAML frontmatter は従来どおり解析できる（過剰遮断しない） | M-06 | title/draft/本文が取得できる |
| 7 | organize-posts.mjs を実行しても ---js 記事のコードは実行されず、ビルドは継続する | M-09 | 一時ディレクトリで実スクリプトを実行し、マーカーファイルが作られない。YAML記事は url-map.json に載り、`---js` 記事は載らない（旧実装ではマーカーが作られることを実測済み） |
| 8 | organize-posts.mjs は gray-matter を直接呼ばず安全ラッパー経由で解析する | M-02 | `./lib/safe-frontmatter.mjs` を import し、`gray-matter` を直接 import しない |
| 8a | tests/ と scripts/ で gray-matter を直接 import / require するのは安全ラッパーだけである（Bug #52 第2経路） | M-02 | tests/（e2e 含む）・scripts/ の全 .js/.mjs/.ts で `gray-matter` の import/require/動的 import がラッパー以外に無い（一時的な違反ファイルで失敗することを確認済み） |
| 8b | src/content を読む tests/・scripts/ のファイルは全て安全ラッパー経由で frontmatter を解析する（Bug #52 第2経路） | M-02 | `src/content`・`POSTS_DIR`・`PAGES_DIR` を参照し frontmatter を解析するファイル（5件以上）が全て `safe-frontmatter.mjs` を import し gray-matter を参照しない |
| 9 | index.js / callback.js は共有モジュールを import し、独自の許可リスト実装を持たない（SEC-37） | M-02 | 両ファイルに `isAllowedOrigin` 定義・ホスト名リテラルが無く、`../_shared/allowed-origin.js` を import |
| 10 | 共有モジュールは Pages Functions のルートにならない（SEC-37） | M-02 | `onRequest*` を export しない |
| 11 | 本番・staging・プレビュー・ローカルを許可し、それ以外を拒否する（SEC-37） | M-06, M-09 | 許可8件・拒否11件（`http://reiwa.casa`、サフィックス偽装、`https://localhost`、`null`、空文字等） |
| 12 | 許可リストの判定が /auth と /auth/callback で一致する（SEC-37） | M-06 | 同一オリジンで両エンドポイントの 403 判定が一致 |
| 13 | Content-Type に charset=utf-8 を明示し、HTML にも meta charset を持つ（SEC-38） | M-06 | `text/html; charset=utf-8` と `<meta charset="utf-8">` |
| 14 | CSP は default-src none に加え frame-ancestors / form-action / base-uri を明示する（SEC-38） | M-06 | 各ディレクティブが `'none'`、`script-src 'unsafe-inline'` のみ、外部オリジン無し、XFO DENY |
| 15 | 手書きの escapeForScript を廃止し、JSON.stringify ベースの変換関数を使う（SEC-39） | M-02 | `toScriptStringLiteral` が `JSON.stringify(String(value))` から始まり、テンプレートは引用符なしでリテラルを埋め込む |
| 16〜24 | 敵対的なトークン（`</script>`、`"`、`'`、バッククオート+`${}`、`\"`、U+2028/U+2029、`<!--<script>`、`&lt;&amp;`、制御文字の9種）が元の文字列に正確に復元され、脱出しない（SEC-39） | M-09 | 生成リテラルに生の `< > & 改行 U+2028 U+2029` が無く、評価結果が元トークンと完全一致、`</script>` は1回のみ |
| 25 | トークンが無い場合は空文字リテラルになりエラー表示に分岐する（SEC-39） | M-06 | `const token = "";` |
| 26 | expectedOrigin もリテラルとして正しく出力される（SEC-39） | M-06 | 評価結果がリクエストオリジンと一致 |

実ブラウザでの確認は `evidence/2026-09-23/issue117/verify-oauth-hardening.mjs`（OAuth Functions の実コードで `/auth`・`/auth/callback` を応答させ、実クリックでログイン。PC/iPad/iPhone × H01〜H05、15/15 PASS）。


### 2.9 npm管理外依存の鮮度・EOL監視 (`dependency-freshness.test.mjs`) — 27件

SEC-40（Issue #132）。`scripts/check-dependency-freshness.mjs` の純関数と、リポジトリ実ファイルの棚卸し、週次ワークフロー・Dependabot 設定を検証する。リモート応答は `tests/fixtures/dependency-freshness/`（`remote-ok.json` / `remote-alert.json` / `remote-unreachable.json`）で与え、`globalThis.fetch` は呼ばれたら例外を投げるスタブに置換し、`afterAll` で未呼び出しを確認する（`npm test` をネットワーク非依存に保つ）。コンテンツ・Decap のバージョン値は判定ロジックのテストでは合成インベントリを使い、実リポジトリのテストでは `public/admin/index.html` から動的に取得する。

| No. | テストケース | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 1 | 正確な x.y.z だけを固定バージョンとして解釈する | M-02 | `^3.16.2` / `3.16` は null |
| 2 | 固定版と最新版の差を major / minor / patch / same に分類する | M-02 | 3.10.0→3.16.3 は minor 6 遅れ |
| 3 | integrity 属性を分解し最も強いアルゴリズムで照合する | M-02 | sha256/384/512 混在時は sha512 を採用 |
| 4 | computeSri は openssl dgst -sha384 -binary \| base64 と同じ値を返す | M-02 | `abc` の既知ダイジェストと一致 |
| 5 | EOL は 90日前 warning / 30日前 alert / 経過で alert | M-02 | 境界日付で ok→warning→alert |
| 6 | CDN URL から npm パッケージ名とバージョンを取り出す | M-02 | unpkg / jsDelivr（scoped）/ 未対応 CDN を判別 |
| 7 | 外部 script / stylesheet だけを抽出し、相対パスや preconnect は除外する | M-02 | 外部 2 件のみ、行番号・integrity を保持 |
| 8 | workflow の uses: を SHA 固定・タグ固定・ローカル action に分類する | M-02 | `./` は除外、SHA とバージョンコメントを抽出 |
| 9 | 全項目が最新・SHA 固定・SRI 一致・確認済みなら ok（exit 0） | M-07 | status=ok、exit 0 |
| 10 | SRI 不一致・メジャー遅れ・deprecated・high 脆弱性・EOL 30日以内は alert（exit 2） | M-07 | 各 alert コードが出て exit 2（`--fail-on never` は 0） |
| 11 | Issue #132 の実例（3.10.0 で 6 マイナー遅れ）は alert、2 マイナー遅れは warning | M-07 | `CDN_MINOR_DRIFT` / `CDN_UPDATE_AVAILABLE` |
| 12 | integrity 欠落・範囲指定バージョンは alert（SEC-03 / SEC-12 の退行検知） | M-08 | `SRI_MISSING` / `CDN_VERSION_NOT_EXACT` |
| 13 | タグ固定の action・未記録／期限超過の手動確認・Node メジャー不一致は warning | M-07 | 総合 warning |
| 14 | 手動確認が期限内でも未確認項目が残れば warning、全て確認済みなら manual | M-07 | `MANUAL_PARTIAL`（Pages のビルドイメージ・NODE_VERSION 未確認の記録に対応） |
| 15 | リモート照会が全て失敗したら ok ではなく error（exit 1） | M-08 | status=error、success=false |
| 16 | 結果 JSON は schemaVersion・status・counts・items・problems を持ち、Markdown はセル内の \| をエスケープする | M-02 | JSON 契約と Markdown 表の安全性 |
| 17 | CLI 引数を検証する | M-08 | 不正な `--fail-on` / 未知引数は例外 |
| 18 | public/ と src/ の外部 CDN スクリプトを全て検出し、正確なバージョンと integrity を持つ | M-01 | 実ファイルから動的に列挙し全件固定済み |
| 19 | Node.js のバージョン宣言（.nvmrc・engines・CI）を収集し、メジャーが一致している | M-01 | メジャーが 1 種類 |
| 20 | 手動確認項目に Cloudflare Pages ビルド環境が登録されている | M-03 | config に `cloudflare-pages-build-image` |
| 21 | CLI はフィクスチャ指定時にネットワークへ出ず、結果 JSON と Markdown を書き出す | M-12 | `remoteSource: fixture`、exit 1（unreachable フィクスチャ） |
| 22 | 週次スケジュールと手動実行を持つ | M-02 | `schedule` cron と `workflow_dispatch`、`pull_request_target` 無し |
| 23 | 全ての action を commit SHA とバージョンコメントで固定する | M-02 | `dependency-freshness.yml` の全 `uses:` が 40 桁 SHA + `# vX` |
| 24 | 権限は既定なし、判定ジョブ contents: read、通知ジョブ issues: write のみ | M-02 | `permissions: {}` と 2 権限のみ |
| 25 | run スクリプトに ${{ }} 式を直接埋め込まない（スクリプトインジェクション防止） | M-02 | 値は `env:` 経由 |
| 26 | alert で Issue 起票（既存はコメント）とジョブ失敗、error でジョブ失敗する | M-02 | 通知経路の分岐が定義されている |
| 27 | Dependabot は github-actions を staging 向けに週次更新する | M-03 | `.github/dependabot.yml` |

ネットワーク実行の結果と alert / error 経路の dry-run は `evidence/2026-09-23/issue132/` に保存する（`network/` 実照会、`fixture-alert/` alert 経路、`fixture-unreachable/` error 経路、`notify-dry-run.log` Issue 起票手順の dry-run）。

---

### 2.10 環境値の導出（env-derivation.test.mjs: 37件, Issue #127・SEC-35 改訂・SEC-127A 仮ID）

| No. | テストケース | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 1 | 本番ブランチ名は main、本番/非本番のサイトURLは reiwa.casa の本番・staging ホスト | M-03 | 定数の値 |
| 2 | CF_PAGES_BRANCH が文字列 "main" と完全一致したときだけ本番と判定する | M-03 | `isProductionBranch('main') === true` |
| 3〜13 | 非本番値（staging、undefined、null、空文字、`Main`、` main`、`main `、`refs/heads/main`、feature ブランチ名、`123/merge`、数値）は本番と判定しない（11件） | M-03, M-07 | `false`、サイトURLは staging、robots は `Disallow: /` のみ |
| 14 | main のサイトURLは本番URL | M-03 | `https://reiwa.casa` |
| 15 | main の robots.txt は Allow: / と本番 Sitemap 行のみ | M-03 | 本文完全一致・Disallow なし |
| 16 | 本番以外の robots.txt に Sitemap 行を出さない（Bug #41） | M-03 | Sitemap・Allow なし |
| 17〜25 | CMS の実行時導出（9ホスト）: 本番→main、staging・`my-blog-3cg.pages.dev`・`*.my-blog-3cg.pages.dev`・localhost・127.0.0.1・`reiwa.casa.example.com`・`evilreiwa.casa`・`www.reiwa.casa`→staging。base_url は常に location.origin | M-03, M-07 | `{ branch, base_url: origin }` |
| 26 | 末尾ドット・大文字・`constructor`/`__proto__`/`toString`・空文字のホスト名は staging | M-07 | プロトタイプ由来のキーで main に倒れない |
| 27 | location を渡せない場合は例外（CMS.init が走らない） | M-07 | throw |
| 28 | 戻り値は凍結されている | M-03 | `Object.isFrozen` |
| 29 | config.yml と deepmerge した実効設定がホストごとに正しい | M-03 | name/repo/auth_endpoint 保持＋branch/base_url |
| 30 | ビルド側の本番URLと CMS 側の本番ホスト名が一致 | M-02 | `HOSTNAME_TO_BRANCH` が `[['reiwa.casa','main']]` の1件のみ |
| 31 | config.yml に backend.branch / base_url を書かない | M-02 | キー・行が存在しない |
| 32 | config.yml に環境URLを書かない | M-02 | `https://…reiwa.casa` なし |
| 33 | public/robots.txt を置かず、src/pages/robots.txt.ts が buildRobotsTxt(CF_PAGES_BRANCH) で生成する | M-02 | ファイル不在・本文リテラル/URL をエンドポイントに書かない |
| 34 | astro.config.mjs の SITE_URL はリテラルではなく resolveSiteUrl(process.env.CF_PAGES_BRANCH) | M-02 | リテラル URL なし |
| 35 | admin/index.html は Decap 読み込み前に CMS_MANUAL_INIT と /admin/cms-env.js を読み込む | M-02 | 出現順 |
| 36 | admin/index.html は registerPreviewStyle の後に CMS.init を1回だけ呼ぶ | M-02 | `CMS.init(` が1回・順序 |
| 37 | cms-env.js は URL を持たず、use strict・const/let のみで innerHTML を使わない | M-02 | 静的検査 |

No.31〜37 は「main と staging で環境固有ファイルに差分を置かない」ことを守る静的ガード（SEC-127A）。これらが通る限り、どちら向きのマージでも環境値は持ち込まれない（両方向マージの実証は `evidence/2026-09-23/issue127/merge-demo.md`）。

## 2.11 Git commit identity gate (`commit-identities.test.mjs`) — 8件

| # | テストケース | 手法 | 備考 |
| :--- | :--- | :--- | :--- |
| 1 | tbi、歴史的 bickojima noreply、GitHub Web、Dependabot bot の完全一致tupleを許可し、他を拒否する | M-02 | 他の名前がGitHub noreplyを自称しても拒否 |
| 2 | base..head に新規追加されたcommitだけを検査し、author/committerの双方を拒否する | M-02 | 一つ前の履歴にあるidentityは通常差分検査の対象外 |
| 3 | CIエラー出力に拒否された名前・emailを含めない | M-02 | SHAとauthor/committerの項目名だけを出力 |
| 4 | 不正なSHA・読み取れないrangeをfail-closedで扱う | M-09 | 検査不能は成功扱いしない |
| 5 | base SHAが存在しない時はhead到達可能履歴全体を監査する | M-02 | force pushのold SHAが取得不能なケース |
| 6 | force-push eventはbase SHAが存在してもhead全履歴を監査する | M-02 | force-push時の巻き戻しを含めて確認 |
| 7 | PR merge ref の第2親として取得できる head SHA を確認し、そのコミットを差分検査できる | M-02 | `git cat-file -e` と合成merge refで検証 |
| 8 | CI workflowはPR/pushのbase/head rangeを渡し、Setup Node後かつnpm ci前に実行する | M-02 | CI wiringの静的検証 |


---

# 第3部 要件トレーサビリティ


## 3.1. 要件トレーサビリティマトリクス

要件トレーサビリティマトリクスは **docs/DOCUMENTATION.md 1.5章** に移動した。要件定義と同一ファイルで管理することで、要件追加時のトレース漏れを防止する。

現在の充足状況: **FR-01〜FR-29, CMS-01〜CMS-19, NFR-01〜NFR-08, SEC-01〜SEC-42, SEC-127A（仮ID）はテストで充足されている。SEC-41は実ホストで検証した操作範囲を対象とする。未テスト要件は0件（docs/DOCUMENTATION.md 1.5.4章参照）。** Modern Web Guidanceエビデンスは `evidence/2026-06-11/` に保存する。

---

# 第4部 テスト実行

---

## 4.1. 動的操作テスト（E2E）

### 4.1.1 概要

Playwright によるブラウザ自動操作テストを導入し、ユーザー操作を動的にシミュレートする。ビルド済み静的サイトをローカルサーバーで配信し、Chromium で PC / iPad / iPhone の3デバイスを想定したテストを実行する。

```
┌──────────────────────────────────────────────────────────┐
│                    Playwright E2E テスト                    │
│                                                            │
│  ┌────────────────┐    ┌──────────────┐    ┌────────────┐│
│  │ テストスクリプト  │───→│ ヘッドレス     │───→│ serve       ││
│  │ (TypeScript)    │    │ Chromium     │    │ localhost   ││
│  │                │    │              │    │ :4173       ││
│  │ site.spec.ts   │    │ PC 1280x720  │    │             ││
│  │ cms.spec.ts    │    │ iPad 810x1080│    │ dist/       ││
│  │                │    │ iPhone 390x844│   │ (静的サイト)  ││
│  └────────────────┘    └──────────────┘    └────────────┘│
└──────────────────────────────────────────────────────────┘
```

### 4.1.2 実行環境

| 項目 | 内容 |
| :--- | :--- |
| 実行環境 | **ローカル開発環境のみ**（VSCode ターミナル等） |
| ツール | Playwright (`@playwright/test` v1.58) |
| ブラウザ | Chromium（PC / iPad / iPhone のビューポートで実行） |
| サーバー | `npx serve dist -l 4173`（Playwright が自動起動） |
| 前提条件 | `npm run build` でビルド済みの `dist/` が存在すること |
| CI実行 | 非対応（Cloudflare Pages ビルド環境にブラウザバイナリが無いため） |

### 4.1.3 テストケース一覧

#### 静的サイトテスト (`tests/e2e/site.spec.ts`)

| No. | テストケース | 検証内容 | テスト手法 |
| :--- | :--- | :--- | :--- |
| E-01 | トップページ表示 | h1「記事一覧」表示、記事カード存在、タイトルリンク・日付の構造検証 | DOM検証 |
| E-02 | 記事ページ遷移 | 記事リンクclick → 記事詳細表示（ヘッダー・コンテンツ・フッター）、戻るリンク動作 | ナビゲーション |
| E-03 | タグフィルタリング | タグclick → タグページ遷移、該当記事のみ表示、戻るリンク動作 | ナビゲーション |
| E-04 | アーカイブナビゲーション | 年・月リンクclick → アーカイブページ遷移、トップページと同数の記事一覧表示 | ナビゲーション |
| E-05 | 画像表示・Modern Web Guidance横展開 | lazy loading属性、async decoding属性、figure/figcaption構造、サムネイル表示、ナビゲーションARIA、content-visibility、focus操作 | DOM検証・実操作 |
| E-06 | 下書き記事非表示 | トップページにdraft記事が含まれないこと、タイトルが空でないこと | DOM検証 |
| E-20 | 固定ページ表示 | プロフィールページ表示、aboutページ表示、「記事一覧に戻る」リンク動作、ヘッダー・フッター構造 | DOM検証・ナビゲーション |
| E-21 | ヘッダーナビドロップダウン | ▾ボタン開閉、300msホバー互換、Escape、Tabフォーカス離脱、aria-expanded同期、タッチ端末44px領域、ページ遷移 | DOM検証・実操作 |

#### CMS管理画面テスト (`tests/e2e/cms.spec.ts`)

OAuth認証はGitHub実環境が必要なため、postMessage APIによるシミュレーション及びHTML構造の静的検証で代替する。

| No. | テストケース | 検証内容 | テスト手法 |
| :--- | :--- | :--- | :--- |
| E-07 | CMS管理画面読込 | HTMLロード、Decap CMS初期化、GitHubログインボタン表示、config.ymlスキーマエラー非表示 | DOM検証 |
| E-08 | 認証シミュレーション | OAuthポップアップ起動（GitHub リダイレクト対応）、postMessageトークン送信のシミュレーション | モック/シミュレーション |
| E-09 | 記事作成フォーム | 新規記事ハッシュルート (`#/collections/posts/new`) への遷移 | ルーティング検証 |
| E-10 | 記事編集 | 記事編集ハッシュルート (`#/collections/posts/entries/...`) への遷移 | ルーティング検証 |
| E-11 | 画像アップロードUI | CMS config.ymlのmedia_folder定義、HEIC→JPEG変換のaccept属性制限 | 構造検証 |
| E-12 | 記事削除UI | 「選択解除」「完全削除」ラベル変更ロジック、無効化ロジックの実装確認 | 構造検証 |

#### CMS UIカスタマイズ検証 (`tests/e2e/cms-customizations.spec.ts`)

過去の不具合修正・手動打鍵テストの観点をE2Eテストに落とし込み、リグレッション検証する。

| No. | テストケース | 検証内容 | テスト手法 |
| :--- | :--- | :--- | :--- |
| E-13 | CMS カスタマイズ基盤検証 | 全カスタマイズ関数の実装、RAFデバウンス、Slateエラーハンドラ、hashchange/popstate、BackCollection/BackStatus、getBoundingClientRect判定、hiddenByOverlayフラグ、image-orientation CSS | 構造検証 |
| E-14 | プレビュースタイル本番再現 | registerPreviewStyleによる本番CSS注入（フォント、行間、画像、コードブロック）、CMSオブジェクトロード | 構造検証・JS検証 |
| E-15 | 公開URLバー表示制御 | ログイン画面で非表示、コレクション一覧で非表示、エディタ→コレクション遷移で非表示、hashchange後の状態 | 動作検証（認証シミュレーション） |
| E-16 | モバイル固有カスタマイズ | ボトムシートCSS、iOS自動ズーム防止16px、codeblockボタン非表示、タップ領域44px、pull-to-refresh防止、モーダル95vw、カードグリッド2列、stickyコントロールバー | 構造検証 |
| E-17 | サイトリンク・コレクション表示 | 「ブログを見る」リンク表示・遷移先（`window.location.origin`動的）、エントリー日付バッジフォーマット、entry-date/entry-title/entry-draftクラス | 動作検証・構造検証 |
| E-18 | EXIF画像処理・アップロード | Canvas EXIF正規化、HEIC制限accept属性、画像プレビューCSS（object-fit、max-height） | 構造検証 |
| E-19 | 削除ボタン動作・メディアライブラリ | 選択解除ラベル・CSS、完全削除ラベル・CSS、無効化ロジック（borderColor判定）、disabled状態CSS | 構造検証 |

#### CMS CRUDテスト (`tests/e2e/cms-crud.spec.ts`)

GitHub APIをモックし、記事の作成・編集・削除の一連のCRUD操作を実際にUI上で実行・検証する。実リポジトリへの変更は一切発生しない。

| No. | テストケース | 検証内容 | テスト手法 |
| :--- | :--- | :--- | :--- |
| E-22 | 記事作成（CRUD: Create） | 新規記事画面遷移、タイトル入力、本文入力（Slateエディタ）、ハッシュルート正常遷移 | モック/フォーム操作 |
| E-23 | 記事編集（CRUD: Update） | 編集画面遷移、フォーム要素存在、タイトル編集可能、本文エディタ表示 | モック/フォーム操作 |
| E-24 | 記事削除（CRUD: Delete） | 削除ボタン存在、コレクション一覧戻り、削除機能HTML実装 | モック/動作検証 |

#### CMS 実操作テスト (`tests/e2e/cms-operations.spec.ts`)

OAuthモック＋GitHub APIモックを使い、CMS管理画面を実際に操作して検証する。フォーム入力→保存→API呼び出し検証、UIインタラクション（ドロップダウン、ボタン重なり、公開URLバー）、モバイル固有動作（ボトムシート、codeblock非表示、タップ領域）を3デバイスで実行する。

| No. | テストケース | 検証内容 | テスト手法 |
| :--- | :--- | :--- | :--- |
| E-28 | 記事作成の実操作 | タイトル・本文入力→保存ボタンクリック、日付フィールド入力可能、Git blob作成API呼び出し検証 | モック/フォーム操作/API検証 |
| E-29 | 記事編集の実操作 | 既存記事タイトルと本文の読込を必須確認後、実操作でタイトル変更、本文テキスト追加、保存ボタン状態を確認（Bug #54再発防止） | モック/フォーム操作 |
| E-30 | UIインタラクション検証 | サイトリンク表示・クリック可能、コレクション切り替え、公開URLバー表示・URL内容、新規作成ボタン、ツールバー重なりなし、URLバーとエディタ重なりなし | モック/動作検証/レイアウト検証 |
| E-31 | コレクション一覧エントリー表示 | 日付バッジフォーマット（YYYY-MM-DD）、バッジスタイル適用、エントリークリックでエディタ遷移 | モック/動作検証 |
| E-32 | 画面遷移の整合性 | エディタ→コレクション戻りリンク動作、往復ナビゲーションでUI状態リセット、ブラウザ戻る・進む | モック/動作検証 |
| E-33 | 画像アップロードUI操作 | 画像ウィジェットボタン表示・クリック可能、accept属性HEIC制限、EXIF処理イベント登録 | モック/動作検証 |
| E-34 | モバイル固有UI操作 | ドロップダウンがボトムシート表示（≤799px）、codeblockボタン非表示、URLバー退避、タップ領域44px以上 | モック/動作検証（iPhoneのみ） |
| E-35 | 削除ボタン状態変化 | 削除ボタンラベル変更（選択解除/完全削除）、disabled状態CSS、色の視覚的区別、borderColor判定ロジック | モック/動作検証/CSS検証 |
| E-36 | 記事デフォルトソート・月別グルーピング | 記事一覧の日付降順ソート検証、view_groups「年月」ボタン表示、レイアウト崩れなし（要素重なり検証）。PC/iPad/iPhone 3デバイスで視覚確認用スクリーンショットを`test-results/`（gitignore対象）に出力（CMS-17, CMS-18） | モック/動作検証/スクリーンショット |
| E-37 | CMS年月フィルター | 月セレクターで選択年月のみ表示、他年月グループ非表示、select操作中のMutationObserver再実行でもoptionを再構築しないこと、降順・昇順切替後のグループ順を確認。PC/iPad/iPhone 3デバイスでスクリーンショットエビデンス取得（CMS-19, Bug #37, Bug #38） | OAuthモック/実操作/動作検証/スクリーンショット |
| E-38 | モバイルタップ領域44px確保（Bug #39再発防止） | iPad Pro 11（834px）とiPhone 14（390px）でCMS管理画面の全ボタン・[role="button"]要素がheight≥40pxであること。特に「新規作成」ボタン・「ソート」ボタン（[role="button"][aria-haspopup]）・AppHeaderボタンを確認。`@media (max-width: 899px)`のmin-height: 44px適用を検証 | verify-comprehensive.mjs T28 |

#### 探索的テスト (`tests/e2e/cms-exploratory.spec.ts`)

OAuthモック（window.openモンキーパッチ）+ GitHub APIモックによる探索的検証。未テストシナリオ・エラーハンドリング・実操作確認を実施する。

| No. | テストケース | 検証内容 | テスト手法 |
| :--- | :--- | :--- | :--- |
| E-37 | 月別セレクタ実操作（CMS-19・Bug #37再発防止） | `#cms-month-selector`に`aria-label`があり、899px以下で高さ44px以上。`selectOption()`でグループ絞り込みが動作し、複数回の選択でもクラッシュしない | OAuthモック/実操作（selectOption）/動作検証 |
| E-39 | 固定ページ作成画面（Bug #25再発防止） | 固定ページ新規作成フォームにslug・order（min=1）・titleフィールドが表示される。orderフィールドが編集可能な数値inputである | OAuthモック/実操作/フィールド検証 |
| E-40 | エラーハンドリング（API 404/500） | GitHub API branches/trees が404・500を返した際にCMSがクラッシュせずUIが表示される（body非空、cmsRoot存在） | OAuthモック/APIエラーモック/UIクラッシュ検証 |
| E-41 | 下書きバッジ表示（formatCollectionEntries） | 下書き記事（draft:true）のエントリーにオレンジ色の「下書き」バッジが表示される。エントリーテキストが「\|」区切り・日付形式で整形されている | OAuthモック/バッジ色検証/DOM検証 |
| E-42 | コレクション切り替え後グルーピング再適用 | posts→pages→postsと切り替えた後にグルーピングが再適用される。複数回の切り替えでもサイドバー・CMS UIが崩れない | OAuthモック/実操作（コレクション切り替え）/安定性検証 |
| E-43 | コンソールエラー監視 | 認証後の初期化フェーズでコンソールエラーが5件以下。基本操作（コレクション切り替え）後のエラー増加が3件以下 | OAuthモック/console.errorキャプチャ/エラー閾値検証 |

#### アクセシビリティテスト (`tests/e2e/accessibility.spec.ts`)

axe-coreエンジン（@axe-core/playwright）を使用してWCAG 2.1 Level AA準拠を自動検証する。

| No. | テストケース | 検証内容 | テスト手法 |
| :--- | :--- | :--- | :--- |
| E-25 | トップページ・記事ページのアクセシビリティ | トップページと記事詳細ページにcritical/seriousなa11y違反がないこと | axe-core WCAG 2.1 AA |
| E-26 | 固定ページ・ナビゲーションのアクセシビリティ | 固定ページのa11y違反なし、画像alt属性、見出し階層（h1→h2スキップなし） | axe-core WCAG 2.1 AA + DOM検証 |
| E-27 | CMS管理画面のアクセシビリティ | CMS管理画面にcriticalなa11y違反がないこと（サードパーティCMSのためcriticalのみ） | axe-core WCAG 2.1 AA |

#### 検索除外ページテスト (`tests/e2e/app-info.spec.ts`)

`src/content/pages/` のfrontmatterで `noindex: true` の固定ページを走査し、タイトル・URLをソースから動的取得する（コンテンツをハードコードしない）。

| No. | テストケース | 検証内容 | テスト手法 |
| :--- | :--- | :--- | :--- |
| E-46 | 検索除外ページの表示・実リンク操作・アクセシビリティ（FR-29） | HTTP 200、title/h1一致、`lang="ja"`、`robots` が `noindex`、フォーム不在、横スクロール非発生、axe WCAG 2.1 AA違反なし、本文リンクのclick遷移 | 実操作（click）＋axe。2ページ×PC/iPad/iPhoneで6件＋ナビの展開・表示対象・リンク遷移を3デバイスで確認（計9件） |

E2E定義は465件。下表の前回実行（445 PASS, 8 skip / 453件）にE-47をPC/iPad/iPhone各4件追加し、今回の実行では457 PASS, 8 skip。ローカルdist・staging実機・本番実機で実行し、結果と画像を `evidence/2026-09-09/` に保存する。

| 実行環境 | 結果 | 証跡 |
| :--- | :--- | :--- |
| ローカル `dist` | ページ検証6件 passed ＋ メニュー除外3デバイス passed | `app-info-results.json` / `noindex-nav-results.json`（local）/ `screenshots/` |
| staging実機（https://staging.reiwa.casa） | 同上 | `app-info-results-staging.json` / `noindex-nav-results.json`（staging）/ `screenshots-staging/` |
| 本番実機（https://reiwa.casa） | 9 passed（E-46の全件を1回で実行） | `app-info-results-production.json` / `noindex-nav-results.json`（production）/ `screenshots-production/` |

ローカル・stagingはメニュー除外の追加前後で2回に分けて取得したため証跡が2ファイルに分かれる。本番は追加後の定義9件をまとめて実行した。

#### E-47 CMS 書き込み先ブランチの実行時導出（Issue #127、`cms-env-branch.spec.ts`）

| No. | テストケース | 検証内容 | テスト手法 |
| :--- | :--- | :--- | :--- |
| E-47 | {localhost, reiwa.casa, staging.reiwa.casa, abc123.my-blog-3cg.pages.dev} から記事を保存すると {staging, main, staging, staging} ブランチへ書き込む | ログインボタン click → window.open に渡された URL が `origin + /auth`（base_url 導出）→ 一覧の記事を click → タイトルを fill → 「公開」→「公開する」→ GitHub API モックが受けた `PATCH git/refs/heads/<branch>` が期待ブランチのみ、反対側ブランチへの参照・書き込みが0件 | 実操作（click/fill）。本番・staging・プレビューのホスト名は `page.route()` でローカル dist から応答（実サーバー通信なし）。認証は window.open モンキーパッチ（4.1.5章）。4ホスト×PC/iPad/iPhone=12件。iPhone は「公開する」がレイアウト上表示領域外に描画される既存事象（DOCUMENTATION 4.5章 Bug #P127-1）のため、そのデバイスだけメニュー項目をキーボード Enter で選ぶ |

### 4.1.4 デバイス別テスト

全テストケースを以下の3デバイスで実行する（合計465テスト：457実行 + 8スキップ）。

| デバイス | ビューポート | 用途 |
| :--- | :--- | :--- |
| PC | 1280 x 720 | デスクトップ表示の検証 |
| iPad (gen 7) | 810 x 1080 | タブレット表示の検証 |
| iPhone 14 | 390 x 844 | モバイル表示の検証 |

#### スキップ仕様（E-34: モバイル固有UI操作）

| テスト | skip条件 | 理由 | PC(1280) | iPad(810) | iPhone(390) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| ドロップダウンがボトムシート表示 | viewportWidth > 799 | `@media (max-width: 799px)` のみ適用 | skip | skip | **実行** |
| codeblockボタン非表示 | viewportWidth > 799 | `@media (max-width: 799px)` のみ適用 | skip | skip | **実行** |
| URLバー退避（ドロップダウン時） | viewportWidth > 799 | `@media (max-width: 799px)` のみ適用 | skip | skip | **実行** |
| タップ領域44px確保 | viewportWidth > **899** | Bug #39: `@media (max-width: 899px)` に拡張（iPad gen7も対象） | skip | **実行** | **実行** |
| 公開サイトのタッチ対象44px確保 | project.name === PC | タッチ入力向けメディアクエリのため | skip | **実行** | **実行** |

スキップ合計: PC 5件 + iPad 3件 = **8件**。

### 4.1.5 CMS操作テストの方式（必須）

CMS E2Eテストでは以下のモック方式を**必須インフラ**として統一使用する。今後のテスト追加時もこの方式に従うこと。

| 項目 | 方式 | 説明 |
| :--- | :--- | :--- |
| OAuth認証 | postMessageシミュレーション | `page.route('**/auth')` でOAuthポップアップをモックし、`window.opener.postMessage()` でトークンを送信。実GitHub環境不要 |
| OAuth認証（認証後スクリーンショット取得時） | `context.route()` + 3ステップOAuthハンドシェイク | `context.route(url => url.pathname === '/auth')` でポップアップnavigationをインターセプト。3ステップ: (1) `authorizing:github` → (2) 親ウィンドウACK待ち → (3) `authorization:github:success:{token}` 送信。`page.route()` ではポップアップウィンドウのnavigationをインターセプトできないため、認証後のCMS画面スクリーンショットが必要な場合は `context.route()` を必ず使用する（Bug #36対応） |
| GitHub API | Playwright `page.route()` 全面モック | ユーザー情報、リポジトリ、ブランチ、Git Data API（trees/blobs/refs/commits）、Contents APIを全てインターセプト。APIコールを記録して検証可能 |
| CRUD操作 | モックAPI経由で実UI操作 | フォーム入力→保存ボタンクリック→モックAPIへのPOST発行を検証。実リポジトリへの変更は一切発生しない |
| 制約 | CMS内部React状態の不完全再現 | postMessageでトークンを注入してもCMS内部のReact状態管理が完全には再現されない場合がある。エディタUIの表示・操作可能性で検証を補完する |

### 4.1.6 E2Eスクリーンショットエビデンス取得ルール（必須）

CMS関連のE2Eテストでは、**認証後のCMS画面のスクリーンショットエビデンス取得を必須**とする。ログイン画面のみのスクリーンショットは不可。

#### 必須要件

1. **認証後のスクリーンショット**: CMS操作に関連するE2Eテストでは、OAuthモック認証後のCMS画面（コレクション一覧・エディタ画面等）のスクリーンショットを取得すること
2. **3デバイス対応**: PC/iPad/iPhone の3デバイスでスクリーンショットを取得すること
3. **エビデンス格納先**: `evidence/YYYY-MM-DD/screenshots/` フォルダにファイル名規則 `e{テストID}-{検証項目}-{デバイス名}.png` でローカル保存すること。このスクリーンショットはGitにコミットせず、Drive正本化・読戻しSHA-256照合を経て `evidence/archive-index.json` に登録する（CLAUDE.md「エビデンス取得方針」参照）
4. **レビュー**: スクリーンショットがログイン画面のみになっていないことを社内レビューで確認すること

#### 認証後スクリーンショットの取得方法

認証が必要なCMS画面のスクリーンショットを取得する場合、以下の手順に従う:

1. **`context.route()`** を使用してOAuthポップアップのnavigationをインターセプトする（`page.route()` ではポップアップウィンドウをインターセプトできないため不可）
2. **3ステップOAuthハンドシェイク**を実装する:
   - Step 1: ポップアップから親ウィンドウに `authorizing:github` を送信
   - Step 2: 親ウィンドウのACK（messageイベント）を待機
   - Step 3: `authorization:github:success:{token,provider}` を送信
3. **認証完了待機**: ログインボタンと「ログインしています...」テキストが消えるまでポーリング（最大15秒）
4. **UI安定化待機**: 認証完了後2秒のバッファを設ける

参考実装: `tests/e2e/cms-operations.spec.ts` の `openCmsWithMultiArticles()` 関数、`evidence/2026-02-23/verify-cms-crud.mjs` の `openCmsWithAuth()` 関数

### 4.1.7 実操作E2E確認ルール（必須）

UI変更・CMS変更・Modern Web Guidance対応では、DOMを直接書き換える検証だけでは完了扱いにしない。実ユーザーが行う操作をPlaywrightで再現し、操作後の画面状態とスクリーンショットを確認する。

| 項目 | 必須ルール | 補足 |
| :--- | :--- | :--- |
| 操作方法 | `click`, `fill`, `selectOption`, `press`, file input操作など、Playwrightの実操作APIを最低1本含める | `page.evaluate()`による値代入や`dispatchEvent()`単独は不可 |
| CMS認証 | OAuth 3ステップモック + GitHub APIモックで認証後画面を開く | ログイン画面のみの確認は不可 |
| ネイティブUI | `<select>`、ファイル選択、モバイルメニュー等は実操作でハング・フォーカス喪失・再描画競合がないことを確認する | Bug #38の再発防止 |
| エビデンス | PC/iPad/iPhoneの3デバイスでスクリーンショットを保存し、赤枠アノテーションで確認箇所を示す | 既存の`verify-*.mjs`形式を踏襲 |
| DOM検証の扱い | DOM検証は結果確認・補助用途に限定する | DOM直叩きだけを合格条件にしない |

### 4.1.8 包括的エビデンス検証スクリプト（verify-comprehensive.mjs）の方式

#### 目的と位置付け

`npm run test:e2e`（Playwright spec ファイル群）が「要件トレーサビリティ」を担うのに対し、
`verify-comprehensive.mjs` は「スクリーンショット付き包括的エビデンス」を担う。
2つは役割が異なり、両方を維持する。

現行雛形は50個のシナリオIDをPC/iPad/iPhoneで各1回実行するため、結果は端末ごと50件、合計150検証である。「150シナリオ×3デバイス」とは記載しない。報告前にJSONのユニークID数、device別件数、合計を照合する。2026-09-23のstaging実配信では各端末50/50、合計150/150 PASS。証跡: `evidence/2026-09-23/issue127/staging-comprehensive/comprehensive-results.json`。

| 項目 | Playwright spec（`tests/e2e/*.spec.ts`） | verify-comprehensive.mjs |
| :--- | :--- | :--- |
| 実行方法 | `npm run test:e2e` | `node evidence/YYYY-MM-DD/verify-comprehensive.mjs` |
| 認証方式 | `page.addInitScript()` window.open モンキーパッチ | `context.route()` + 3ステップOAuthハンドシェイク |
| 出力 | Playwright HTML レポート（`playwright-report/`） | `evidence/YYYY-MM-DD/report.html`（赤枠アノテーション付きスクリーンショット） |
| 目的 | CI/CD 品質ゲート・要件カバレッジ | staging 検証エビデンス・バグ再発防止スクリーンショット |
| デバイス | PC/iPad/iPhone 3プロジェクト | PC(1280×800)/iPad Pro 11(834×1194)/iPhone 14(390×844) |

#### 雛形ファイルと実行手順

```bash
# 1. 前提: ビルド済みの dist/ が必要（httpサーバーは内蔵）
npm run build

# 2. 日付フォルダを作成し雛形をコピー
cp evidence/2026-05-24/verify-comprehensive.mjs evidence/YYYY-MM-DD/verify-comprehensive.mjs

# 3. 実行（組み込みHTTPサーバーが PORT=4174 で起動）
node evidence/YYYY-MM-DD/verify-comprehensive.mjs

# 4. 出力確認
# - evidence/YYYY-MM-DD/screenshots/  スクリーンショット（S/T番号-デバイス.png）
# - evidence/YYYY-MM-DD/report.html   PC/iPad/iPhone 横並びHTMLレポート
# - evidence/YYYY-MM-DD/comprehensive-results.json  JSON結果（PASS/FAIL/SKIP）
```

#### 認証方式（スタンドアロンPlaywright = context.route()方式）

verify-comprehensive.mjs は Playwright test runner **外** で動くため、`context.route()` でOAuthポップアップをインターセプトする（test runner内では `page.addInitScript()` 方式を使う）。

```javascript
// context.route() + 3ステップOAuthハンドシェイク
await context.route('**/auth', async (route) => {
  await route.fulfill({
    status: 200, contentType: 'text/html',
    body: `<html><script>
      // Step1: 'authorizing:github' を親へ送信
      window.opener.postMessage('authorizing:github', origin);
      // Step2: CMSからのACKを受信
      window.addEventListener('message', (e) => {
        if (e.data === 'authorizing:github') {
          // Step3: success トークンを親へ送信
          window.opener.postMessage(
            'authorization:github:success:{"token":"mock-token","provider":"github"}', origin);
          window.close();
        }
      });
    </script></html>`
  });
});
// 参考実装: evidence/2026-05-24/verify-comprehensive.mjs の openCmsWithAuth()
```

#### テストシナリオ番号体系

| プレフィックス | 対象 | 例 |
| :--- | :--- | :--- |
| `S01〜S10` | 公開サイト（トップ・記事・タグ・アーカイブ・ナビ・下書き・EXIF・A11y・レスポンシブ・固定ページ） | S03: タグフィルター |
| `T01〜T15` | CMS基本操作（認証・サイトリンク・エントリー表示・エディタ・URLバー・削除ボタン） | T04: 下書きバッジ |
| `T16〜T25` | CMS年月グルーピングUI（グルーピング有効化・降順・日本語化・月別セレクタ・ソート） | T21: 月別フィルター |
| `T26〜T35` | モバイル固有操作（ボトムシート・codeblock・タップ領域・pull-to-refresh・iOS自動ズーム） | T28: タップ領域44px |
| `T36〜T55` | 探索的テスト（固定ページ新規作成・バリデーション・エラーハンドリング・コンソール監視） | T40: APIエラーハンドリング |

#### 赤枠アノテーション方式

```javascript
// 注目要素に赤枠を追加する
async function addRedBorder(page, selector, label = '') {
  await page.evaluate(({ selector, label }) => {
    const el = document.querySelector(selector);
    if (!el) return;
    el.style.outline = '3px solid red';
    el.style.outlineOffset = '2px';
    if (label) {
      const badge = document.createElement('div');
      badge.textContent = label;
      badge.style.cssText = 'position:absolute;background:red;color:white;font-size:11px;padding:2px 6px;z-index:9999;top:-20px;left:0';
      el.style.position = 'relative';
      el.appendChild(badge);
    }
  }, { selector, label });
}
// 枠をクリア
async function clearOverlays(page) {
  await page.evaluate(() => {
    document.querySelectorAll('[style*="outline"]').forEach(el => el.style.outline = '');
  });
}
// 参考実装: evidence/2026-05-24/verify-comprehensive.mjs の addRedBorder()/clearOverlays()
```

#### HTMLレポート形式

PC/iPad/iPhone の3デバイスのスクリーンショットを横並びに配置し、各シナリオのPASS/FAIL/SKIPと詳細メッセージを記録する。`report.html` を開くだけで全エビデンスを一覧できる。

#### 新シナリオ追加手順

1. `evidence/2026-05-24/verify-comprehensive.mjs` の最新版を雛形としてコピー
2. `SCENARIOS` 配列に新シナリオを追加（`id: 'T56'`、`label`、`run: async (page, device) => { ... }` を定義）
3. `record({ id, label, pass, detail })` で結果を記録
4. 実行して PASS を確認 → `comprehensive-results.json` の結果も確認
5. `evidence/YYYY-MM-DD/report.html` で赤枠アノテーション付きスクリーンショットを目視確認

---

## 4.2. 実行手順

### 4.2.1 単体テスト実行（Vitest）

```bash
# 全テスト実行（CI/デプロイ前）
npm test

# 個別テスト実行
npx vitest run tests/content-validation.test.mjs
npx vitest run tests/rehype-image-caption.test.mjs
npx vitest run tests/auth-functions.test.mjs

# ウォッチモード（開発中）
npm run test:watch
```

### 4.2.2 E2Eテスト実行（Playwright spec）

```bash
# 前提: ビルド済みのdist/が必要
npm run build

# E2Eテスト実行（PC/iPad/iPhone 全デバイス）
npm run test:e2e

# 静的サイトテストのみ
npx playwright test tests/e2e/site.spec.ts

# CMSテストのみ
npx playwright test tests/e2e/cms.spec.ts

# 特定スペックのみ
npx playwright test tests/e2e/cms-exploratory.spec.ts

# 特定デバイスのみ
npx playwright test --project=iPhone

# 特定テストのみ（-g でフィルタ）
npx playwright test -g "タップ領域"
```

**注意**: E2Eテストはローカル開発環境でのみ実行する。**CI に Playwright は載せない**（実行時間のため。Bug #50）。本番（main）マージ前のローカル全件は必須であり、Vitest 成功では代替しない。Chromiumブラウザのバイナリが必要なため、初回は `npx playwright install chromium` でインストールすること。

### 4.2.3 包括的エビデンス検証（verify-comprehensive.mjs）

```bash
# 前提: ビルド済みのdist/が必要
npm run build

# 最新の雛形を日付フォルダにコピー
cp evidence/2026-05-24/verify-comprehensive.mjs evidence/$(date +%Y-%m-%d)/verify-comprehensive.mjs

# 実行（内蔵HTTPサーバーがPORT=4174で起動）
node evidence/YYYY-MM-DD/verify-comprehensive.mjs

# 結果確認
# - evidence/YYYY-MM-DD/report.html           HTMLレポート（ブラウザで開く）
# - evidence/YYYY-MM-DD/screenshots/          スクリーンショット150枚
# - evidence/YYYY-MM-DD/comprehensive-results.json  JSON結果
```

### 4.2.4 ビルド検証

```bash
# ビルドパイプライン全体の実行
npm run build

# 確認事項:
# - normalize-images のログに異常がないこと
# - organize-posts のログに "url-map.json generated" が出力されること
# - astro build が正常に完了すること
# - image-optimize のログにリサイズ結果が出力されること
```

---

## 4.3. テスト実行結果

### 4.3.1 単体テスト最新実行結果（Vitest）

| 項目 | 結果 |
| :--- | :--- |
| 実行日時 | 2026-09-24（Issue #152 CI identity gate candidate、fresh clone `codex/issue152-author-allowlist`） |
| Vitest バージョン | v4.1.11 |
| 実行時間 | 約7s（`npm test`） |
| 合否判定 | **合格**（762 passed。うち新規 identity gate 8件） |

**Vitest総件数はブランチに依存しない（Issue #127 以降）**: SEC-42の8ケース追加後、feature・main・staging・CIで同じ762件。

### 4.3.2 テストファイル別結果

2026-09-24のfresh cloneで実行した実測（lockfile準拠 `npm ci` 後）:

| テストファイル | テスト数 | 結果 | 実行時間 |
| :--- | :--- | :--- | :--- |
| `cms-config.test.mjs` | 60 | PASS | 8ms |
| `admin-html.test.mjs` | 90 | PASS | 6ms |
| `rehype-image-caption.test.mjs` | 8 | PASS | 2ms |
| `rehype-focusable-code-blocks.test.mjs` | 2 | PASS | 1ms |
| `auth-functions.test.mjs` | 29 | PASS | 15ms |
| `fuzz-validation.test.mjs` | 219 | PASS | 25ms |
| `content-validation.test.mjs` | 125 | PASS | 31ms |
| `build.test.mjs` | 129 | PASS | — |
| `security-hardening.test.mjs` | 28 | PASS | — |
| `dependency-freshness.test.mjs` | 27 | PASS | — |
| `env-derivation.test.mjs` | 37 | PASS | — |
| `commit-identities.test.mjs` | 8 | PASS | 0.6s |
| **合計** | **762** | **全PASS** | **`npm test`: 12 files, 762 tests passed** |



Issue #117 項目2/12 により `build.test.mjs` 111→113、`fuzz-validation.test.mjs` 215→216。Vitest 合計 635→638。Bug #51再発防止（SEC-35、`cms-config.test.mjs`に環境固有ファイルの実ブランチ整合性検証を追加）によりVitest合計は **feature ブランチ 639件／main・staging 642件**（差の3件はSEC-35のブランチ別テスト登録による。既存テストへの影響はない）。Issue #117 hardening 対応で `security-hardening.test.mjs` 28件と `build.test.mjs` 1件（SEC-36）を追加し、**feature ブランチ 668件／main・staging 671件**。Issue #132（SEC-40）で `dependency-freshness.test.mjs` 27件を追加し **feature ブランチ 695件／main・staging 698件**。Issue #127 で `env-derivation.test.mjs` 37件、`build.test.mjs` 15件（114→129）を追加し、`cms-config.test.mjs` の SEC-35 を 1件（feature）／4件（main・staging）から全ブランチ共通5件へ改訂（56→60）。**全ブランチ 751件**。SEC-41対応で `fuzz-validation.test.mjs` にCSP運用時の違反検知3件を追加し、全ブランチ共通 **754件**。

### 4.3.3 E2Eテスト最新実行結果（Playwright）

| 項目 | 結果 |
| :--- | :--- |
| 実行日時 | 2026-09-23（main向け統合候補、権限付きローカルwebServer起動） |
| Playwright バージョン | v1.58.2 |
| 実行時間 | 14.3m |
| 合否判定 | **合格**（457 PASS, 8 skip / 465テスト）|

| テストファイル | PC | iPad | iPhone | 合計 |
| :--- | :--- | :--- | :--- | :--- |
| `site.spec.ts`（E-01〜E-06, E-20〜E-21, E-30） | 37 PASS, 1 skip | 38 PASS | 38 PASS | 113 PASS, 1 skip |
| `cms.spec.ts`（E-07〜E-12） | 12 PASS | 12 PASS | 12 PASS | 36 |
| `cms-customizations.spec.ts`（E-13〜E-19） | 38 PASS | 38 PASS | 38 PASS | 114 |
| `cms-crud.spec.ts`（E-22〜E-24） | 11 PASS | 11 PASS | 11 PASS | 33 |
| `cms-operations.spec.ts`（E-28〜E-36） | 27 PASS, 4 skip | 28 PASS, 3 skip | 31 PASS | 86 PASS, 7 skip |
| `accessibility.spec.ts`（E-25〜E-27） | 6 PASS | 6 PASS | 6 PASS | 18 |
| `cms-exploratory.spec.ts`（E-37, E-39〜E-43） | 12 PASS | 12 PASS | 12 PASS | 36 |
| `app-info.spec.ts`（E-46） | 3 PASS | 3 PASS | 3 PASS | 9 |
| `cms-env-branch.spec.ts`（E-47） | 4 PASS | 4 PASS | 4 PASS | 12 |
| **合計** | **150 PASS, 5 skip** | **152 PASS, 3 skip** | **155 PASS** | **457 PASS, 8 skip** |

**スキップ内訳**: E-34のボトムシート・codeblock・URLバーはPC/iPadでskip、CMSタップ領域はPCのみskip。E-21公開サイトタッチ領域はPCのみskip。合計8件skip。

### 4.3.4 ビルド実行結果

| 項目 | 結果 |
| :--- | :--- |
| ビルドコマンド | `npm run build` |
| 生成ページ数 | 20ページ |
| 画像最適化 | 5ファイル（最大-97%削減） |
| ビルド時間 | 1.08s |
| 合否判定 | **合格** |

### 4.3.5 Issue #97 デプロイ後確認

| 項目 | 結果 |
| :--- | :--- |
| staging | PR #98 / merge `3c95c2337d0faaf1980e6f88dfd1da1413230947` / `test-and-build` success / 実環境HTTP・robots・CMS設定 PASS |
| main | PR #99 / merge `f47d5f81c1a313c97232d9a41b5f66505ec2c940` |
| main CI | `test-and-build` check `93721464330` — **success** |
| Cloudflare Pages | check `93721691730` — **success** / preview `https://d30b5fc7.my-blog-3cg.pages.dev` |
| 本番再確認 | 27/27 PASS、axe違反0件、コンソールエラー0件 |
| 認証済みCMS | PC・iPad・iPhone 3/3 PASS、各12記事、ログイン画面なし |
| Issue | #97を`completed`でクローズ |


### 4.3.6 Issue #90/#131 履歴書換え後の検証

| 項目 | 結果 |
| :--- | :--- |
| 対象 | 2026-09-24のfrozen refsから作成した隔離candidate-2（25 heads、467 commits） |
| 全体テスト | Vitest 762/762 PASS、Playwright 457 PASS・8 skip / 465 |
| branch別build | `CF_PAGES_BRANCH=main` はrobots Allow・canonical/sitemap本番URL、`staging` はrobots Disallow・sitemap行なし・canonical/sitemap staging URL。両方のbuildでVitest 625/625、CMS env生成、config.ymlのbranch/base_url不在を確認 |
| アーカイブ索引 | 1,519 entry、許可5 fieldのみ。`node scripts/validate-evidence-archive-index.mjs` PASS |
| 履歴検証 | 移行対象694 unique blobは書き換え後のheadsから0 reachable、evidence外alias 0。Drive move 1,395 path/blob pair、Git keep 123 pair。redacted JSONは新blobで保持 |
| 個人情報検査 | 1,082 unique reachable blob / 80,481,261 bytesをscanし、承認済みのemail・user path・氏名ルールは全0。author/committerはtbi/bickojimaのカテゴリに限定、other 0 |
| refs/PR | freeze/live refsは143/143一致、push前open PR 0。push後の`refs/pull/*/head` 118件は読み取り専用で残存 |
| GitHub履歴書換え | ユーザー承認と敵対的レビューGO後に25 headsをold-OID lease付き`git push --atomic`で更新。exit 0、25 forced update。tags 0、`--mirror`不使用 |
| GitHub CI | main `79116e1` run 35950842406 SUCCESS、staging `2a445cc` run 35950844123 SUCCESS |
| 新規clone | fresh clone後 `git fsck` PASS、pack 40.14 MiB |
| Pages postflight | rootによるproduction/staging read-only確認でrobots、canonical/sitemap、CMS環境値を確認。実配信がブランチ別に正しい |
| E2E起動記録 | 非昇格の初回起動はlisten EPERMでテスト開始前に終了し、テスト失敗には数えない。許可されたローカルwebServer起動条件で再実行し全件を完了 |

公開索引の形式検証は [`scripts/validate-evidence-archive-index.mjs`](../scripts/validate-evidence-archive-index.mjs)、集約結果は [`docs/history-migration-2026-09-24.md`](../docs/history-migration-2026-09-24.md) に記録する。非公開Drive IDや共有URLはGitへ含めない。

### 4.3.7 Issue #152 SEC-42 identity gate 検証

| 項目 | 結果 |
| :--- | :--- |
| 実行日時・環境 | 2026-09-24、fresh clone branch `codex/issue152-author-allowlist` |
| 回帰テスト | `npx vitest run tests/commit-identities.test.mjs`: 8/8 PASS |
| 全体テスト | `npm test`: 762/762 PASS（12 files） |
| ビルド | `npm run build:raw`: PASS |
| CI | staging向け PR #156 `test-and-build`: PASS |
| ゲートの適用限界 | PR経路はマージ前に検査する。main/stagingにブランチ保護がない現状では、直接pushは受理後にCIが検知する。ブランチ保護は今回設定せず、履歴修復force-push完了後に別途検討する。 |


### 4.3.8 Issue #153 CMS / Node.js 更新検証

| 項目 | 結果 |
| :--- | :--- |
| Node.js | 22.23.3（`.nvmrc` と一致） |
| CMS配布物 | Decap CMS 3.16.3。CDN JS SHA-384とSRI一致 |
| Vitest | `npm test`: 762/762 PASS（12 files） |
| Build | `npm run build`: gate 633/633 PASS、Astro 20ページ、画像最適化完了 |
| Playwright | `npm run test:e2e`: 457 PASS / 8 skip（465件）。E-29既存記事のタイトル・本文読込と実編集をPASS |
| CI | staging向けPR #157 `test-and-build`: PASS |
| 包括E2E | PC/iPad/iPhoneで150/150 PASS。T07/T50は実クリック後の既存タイトル・本文をassert |
| 画面証跡 | 145枚の注釈不足0枚。iPhone T10/T36は認証後にfocused再撮影し2/2 PASS。Drive bundle readback SHA-256一致 |
| Cloudflare Pages runtime | ダッシュボード認証がなく、Pages build logの実Nodeバージョンは未確認。workflow_dispatchもstaging実行待ち |

---

**最終更新**: 2026年9月24日（v1.62）


### 2026-09-20 セキュリティIssue #109〜#113対応完了

Vitest 622 passed（全PASS）。SEC-27（オリジン許可リスト）、SEC-22（Cache-Control全レスポンス適用）、SEC-25（ピクセル上限パラメータ整合性）、SEC-28（公開ページCSPメタタグ）の検証を含む。全E2E 457 passed / 8 skipped（465テスト）。
