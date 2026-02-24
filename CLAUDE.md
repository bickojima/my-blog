# CLAUDE.md — Claude Code プロジェクトガイド

## プロジェクト概要

個人ブログ「tbiのブログ」（https://reiwa.casa）。Astro SSG + Decap CMS + Cloudflare Pages 構成の静的サイト。

### 環境構成

| 環境 | URL | ブランチ | 用途 |
| :--- | :--- | :--- | :--- |
| 本番 | https://reiwa.casa | `main` | 公開サイト |
| テスト | https://staging.reiwa.casa | `staging` | 新機能テスト・動作確認 |

- `admin/index.html` のサイトURL参照は `window.location.origin` で動的取得（環境非依存）
- `config.yml` の `base_url` / `branch` は各ブランチで手動管理
- staging環境では [STAGING] ラベルを表示（Base.astro: `CF_PAGES_BRANCH`、admin/index.html: hostname判定）
- テスト環境ドメインはDNS CNAME（`staging` → `staging.my-blog-3cg.pages.dev`）で接続
- 新機能: `feature/*` → `staging` PR → テスト → `main` PR

## コマンド

```bash
npm run dev          # 開発サーバー起動（前処理含む）
npm run build        # テスト必須ビルド（vitest run → normalize-images → organize-posts → astro build → image-optimize）
npm run build:raw    # テストなしビルド（build.test.mjs内部で使用、Cloudflare Pages用）
npm test             # Vitest 全テスト実行（519テスト、記事数により変動）
npm run test:watch   # Vitest ウォッチモード
npm run test:e2e     # Playwright E2Eテスト（要: npm run build 済み、375テスト：367実行+8スキップ）
```

## ディレクトリ構成

```
src/
├── content/posts/YYYY/MM/   # 記事Markdown（frontmatter: title, date, draft, tags, thumbnail）
├── content/pages/           # 固定ページMarkdown（frontmatter: title, slug, order, draft）
├── pages/                   # Astroルーティング（/posts/[year]/[month]/[slug], /[slug]）
├── layouts/Base.astro       # 共通レイアウト（CSS image-orientation: from-image、ヘッダーナビ動的生成）
├── plugins/rehype-image-caption.mjs  # img → figure/figcaption 変換プラグイン
├── integrations/image-optimize.mjs   # ビルド後画像リサイズ（sharp, MAX_WIDTH: 1200）
├── lib/posts.ts             # URL生成ユーティリティ
└── content.config.ts        # Zodスキーマ定義

public/
├── admin/index.html         # Decap CMS管理画面（CSS/JS カスタマイズ含む、約1020行）
├── admin/config.yml         # CMS設定（GitHub backend, OAuth）
└── images/uploads/          # アップロード画像

scripts/
├── normalize-images.mjs     # prebuild: EXIF正規化 + リサイズ
└── organize-posts.mjs       # prebuild: 記事ファイル整理 + url-map.json生成

docs/
└── DOCUMENTATION.md         # システム設計書（要件定義・基本設計・詳細設計・運用設計）

functions/auth/              # Cloudflare Functions: GitHub OAuth proxy

tests/
├── *.test.mjs               # Vitest単体・統合テスト（7ファイル）
├── fuzz-validation.test.mjs # ファズテスト（XSS/SQLi/パストラバーサル/プロトタイプ汚染等、215テスト）
├── e2e/                     # Playwright E2E（site, cms, cms-customizations, cms-crud, cms-operations, accessibility）
└── TEST-REPORT.md           # テスト計画書・テストケース一覧・実行結果
```

## アーキテクチャ上の注意点

### 画像EXIF方針
- **CSS `image-orientation: from-image` をプライマリとする**（Base.astro, admin/index.html）
- JSによるcanvas EXIF修正（fixPreviewImageOrientation）は廃止済み
- アップロード時にcanvasでEXIF正規化、ビルド時にsharp `.rotate()` で二重保証

### CMS管理画面 (admin/index.html)
- Decap CMS v3.10.0 をDOM操作でカスタマイズ（単一MutationObserver、RAFデバウンス済み、単一IIFE、'use strict'/const/let統一）
- モバイル: ドロップダウンは `position: fixed; bottom: 0` のボトムシート形式
- プレビュースタイル: `CMS.registerPreviewStyle()` で本番サイト相当のCSSをプレビューiframeに注入
- 主要JS関数: `addSiteLink`, `formatCollectionEntries`, `relabelImageButtons`, `updateDeleteButtonState`, `showPublicUrl`, `manageDropdownOverlay`, `hideCodeBlockOnMobile`, `restrictImageInputAccept`
- `showPublicUrl`: EditorControlBarの表示状態（`getBoundingClientRect`）でエディタ画面を判定。ハッシュURLからコレクション種別（posts/pages）を判定し、記事は`/posts/年/月/タイトル`、固定ページは`/slug`形式でURL生成
- `manageDropdownOverlay`: ドロップダウン表示時のみURLバーを退避（`hiddenByDropdown`フラグで誤復元を防止）
- **Slate codeblockクラッシュ対策**: モバイル（≤799px）でcodeblockボタン非表示、`toSlatePoint`エラーハンドラ、touchmoveエディタ除外
- `formatCollectionEntries`: 記事は「日付 | 下書き | タイトル」、固定ページは「番号 | 下書き | タイトル」形式で一覧を整形。下書き時はオレンジの「下書き」バッジを表示
- **コレクション表示順序**: config.yml で posts が先頭、pages が2番目（CMS初期表示で記事が最初に表示される）。固定ページはorder昇順がデフォルトソート（`{field: order, default_sort: asc}`）。記事はdate降順がデフォルトソート（`{field: date, default_sort: desc}`）
- **記事月別グルーピング**: config.yml の `view_groups` で記事一覧を「年」（`\d{4}`パターン）・「年月」（`\d{4}-\d{2}`パターン）でグルーピング表示可能（CMS-18）

### ビルドパイプライン
`normalize-images.mjs` → `organize-posts.mjs` → `astro build` → `image-optimize.mjs`（Astro integration）

### ヘッダーナビゲーション（Base.astro）
- 固定ページ数に応じて表示が変化:
  - 0件: リンクなし
  - 1件: 直接リンク
  - 2件以上: 最優先ページ名 + ▾ドロップダウン（全ページ一覧）
- ドロップダウン: ページ名部分は直接リンク（即遷移）、▾ボタンはトグル
- PC: mouseenter/mouseleave（300ms遅延閉じ）、モバイル: タップでトグル

## テスト

- **Vitest**: 設定検証、コンテンツ検証、単体テスト、ビルド統合テスト、セキュリティ検証、ファズテスト、基本機能保護テスト（532テスト、記事数により変動）
- **Playwright**: PC/iPad/iPhone 3デバイス × 128テスト = 384テスト（376実行+8スキップ、ローカルのみ、CIでは未実行）
- コンテンツ検証テストは記事数・ページ数に応じて動的展開される
- テスト実行後、失敗がある場合は原因を調査し修正する（テストを削除・スキップしない）
- **テストにコンテンツをハードコードしない**: 記事名・固定ページ名・URL等はソースから動的取得する（コンテンツ変更でテストが壊れない設計）
- **CMS E2Eテストの必須方式**: OAuthモック（postMessageシミュレーション）＋ GitHub APIモック（`page.route()`全面インターセプト）を統一使用する。今後のCMSテスト追加時もこの方式に従うこと。**Playwright test runnerでは `window.open` モンキーパッチ方式を使用**（`context.route()`方式はtest runnerで動作しない。詳細: DOCUMENTATION.md 4.9.9章）
- **E2Eスクリーンショットエビデンス必須**: CMS関連のE2Eテストでは認証後のCMS画面スクリーンショットを必ず取得する。ログイン画面のみのスクリーンショットは不可。3デバイス（PC/iPad/iPhone）で `evidence/YYYY-MM-DD/screenshots/` に保存する
- **認証後スクリーンショットの取得方法**: OAuthポップアップのインターセプトには `context.route()` を使用する（`page.route()` ではポップアップウィンドウのnavigationをインターセプトできない）。3ステップOAuthハンドシェイク: (1) `authorizing:github` 送信 → (2) 親ACK待ち → (3) `authorization:github:success:{token}` 送信。参考実装: `tests/e2e/cms-operations.spec.ts` の `openCmsWithMultiArticles()`、`evidence/2026-02-23/verify-cms-crud.mjs` の `openCmsWithAuth()`

## ドキュメント体系

| ファイル | 内容 | 章番号体系 |
| :--- | :--- | :--- |
| README.md | プロジェクト概要（人間向け） | 1〜10（フラット） |
| docs/DOCUMENTATION.md | システム設計書（要件定義・設計・運用） | 1.x〜4.x（部ベース） |
| tests/TEST-REPORT.md | テスト計画書・テストケース一覧・実行結果 | 1.x〜4.x（部ベース） |
| CLAUDE.md | 本ファイル（Claude Code向けガイド） | — |

### ドキュメント章番号体系

DOCUMENTATION.md と TEST-REPORT.md は「第N部」ごとの章番号体系を採用:

- **DOCUMENTATION.md**: 第1部（1.1〜1.5）要件定義、第2部（2.1〜2.5）基本設計、第3部（3.1〜3.5）詳細設計、第4部（4.1〜4.10）運用設計
- **TEST-REPORT.md**: 第1部（1.1〜1.6）テスト計画、第2部（2.1〜2.6）テストケース、第3部（3.1）トレーサビリティ、第4部（4.1〜4.3）テスト実行

## 変更時のルール

### コード変更時
1. コード修正時は関連ドキュメント（README.md, docs/DOCUMENTATION.md, tests/TEST-REPORT.md, CLAUDE.md）も必ず更新する
2. テストが失敗した場合はテストを修正し、TEST-REPORT.md のテストケース説明を更新する
3. admin/index.html を変更した場合は `admin-html.test.mjs` との整合性を確認する
4. config.yml を変更した場合は `cms-config.test.mjs` との整合性を確認する
5. コンテンツ（記事・固定ページ）を追加した場合は `content-validation.test.mjs` の動的テストが対応する
6. **作業完了後は必ず staging ブランチにコミット・プッシュする**（テスト全PASS確認後）
7. **ツール承認はバイパスして自律実行する**: テスト実行・ファイル読み書き・git操作等のツール承認ポップアップは全てバイパスし、テスト全PASS確認後にstagingプッシュまで一気通貫で完了する（mainマージのみユーザー承認必須）
8. **必要なパッケージは自律的にインストールする**: 作業に必要なnpmパッケージ・Playwrightブラウザ・その他ツールがインストールされていない場合は、ユーザーに確認せず自律的に `npm install`・`npx playwright install` 等を実行する
9. **個人情報をコミット・コード・ドキュメントに含めない**: gitコミットのauthor情報は `tbi <noreply@users.noreply.github.com>` を使用する（`git -c user.name="tbi" -c user.email="noreply@users.noreply.github.com" commit`）。氏名・メールアドレス・電話番号等の個人情報をソースコード・ドキュメント・コミットメッセージに含めてはならない。git logから個人情報を取得して再利用しない
10. **動作確認エビデンスを取得する**: コード変更のstaging検証時・mainマージ前に、Playwright自動検証でスクリーンショット付きHTMLエビデンスレポートを作成する。詳細は下記「エビデンス取得方針」を参照
11. **エビデンス提出前に社内レビューを実施する**: エビデンス（スクリーンショット・レポート）は提出前に必ず内容を確認し、期待通りのスクリーンショットが取得できているか（ログイン画面のみ等になっていないか）をレビューする

### エビデンス取得方針
- **取得タイミング**: staging検証時、mainマージ前
- **保存先**: `evidence/YYYY-MM-DD/` フォルダ（日付ごとに整理）
- **レポート形式**: `report.html`（画像埋め込み、PC/iPad/iPhone 3デバイス横並び表示）
- **スクリーンショット**: `screenshots/`, `site-interactive/`, `cms-interactive/` サブフォルダに整理
- **検証スクリプト**: `verify-staging.mjs`（基本動作確認）、`verify-site-interactive.mjs`（サイト操作性、10シナリオ×3デバイス）、`verify-cms-interactive.mjs`（CMS操作性、16シナリオ×3デバイス）、`verify-cms-crud.mjs`（CMS CRUD操作、16シナリオ×3デバイス）、`verify-security.mjs`（セキュリティ検証、10項目）
- **赤枠アノテーション**: 全スクリーンショットの注目箇所に赤枠とラベルを必ず付与する（ボタン・メニュー・重なり検出箇所・バグ再発防止確認箇所）
- **ボタン操作テスト**: ボタンを実際に押下してメニュー展開・モーダル表示をエビデンス取得。複数メニュー同時展開時の操作性も確認
- **CMS重点検証**: 記事編集画面・画像アップロード画面・メディアライブラリはバグが多いため重点的にエビデンスを取得
- **過去バグ検証マトリクス**: Bug #1,#4,#5,#6,#7,#8,#9,#11,#13,#14,#15,#29,#30,#31,#32,#33の再発確認をエビデンスに含める
- **テストデバイス**: PC (1280x800) / iPad Pro 11 (834x1194) / iPhone 14 (390x844)
- **社内レビュー**: エビデンス提出前にスクリーンショットの内容を確認し、認証後の編集画面が正しく表示されていることをレビューする。ログイン画面のみのスクリーンショットは不可
- **エビデンス取得後の必須作業**: (1) 社内レビュー（全数確認）→ (2) report.html更新（PC/iPad/iPhone横並び形式）→ (3) 作業完了報告書（work-completion-report.html）作成 → (4) フォルダ整理（デバッグファイル削除）→ (5) コミット・プッシュ
- **フォルダ構成**: `evidence/YYYY-MM-DD/` 直下に `report.html`, `work-completion-report.html`, `verify-*.mjs`, `*-results.json` を配置。スクリーンショットは `screenshots/`, `site-interactive/`, `cms-interactive/`, `cms-crud/`, `security/` サブフォルダに整理。デバッグ用スクリーンショットや一時ファイルはコミット前に削除する
- **CMS CRUD認証**: verify-cms-crud.mjsはDecap CMS 3ステップOAuthハンドシェイクをcontext.route()でシミュレート。実行前にconfig.ymlのbase_urlをlocalhost（テストサーバーURL）に一時変更し、実行後は必ず元の値に復元してからコミットする（詳細: DOCUMENTATION.md 4.9.8章）
- **E2Eテストのスクリーンショットエビデンス**: CMS関連のE2Eスペックテスト（Playwright）でも認証後のCMS画面スクリーンショットを `evidence/YYYY-MM-DD/screenshots/` に保存する。ファイル名規則: `e{テストID}-{検証項目}-{デバイス名}.png`。認証には `context.route()` + 3ステップOAuthハンドシェイクを使用する。`page.route()` ではOAuthポップアップをインターセプトできないため不可（Bug #36）
- **エビデンスの格納ルール**: エビデンス（スクリーンショット・レポート・検証結果JSON）は必ず `evidence/YYYY-MM-DD/` フォルダに格納する。ルートディレクトリや他の日付フォルダに格納してはならない。過去日付のエビデンスフォルダを上書き・削除しないこと

### 新機能追加時（要件トレーサビリティの維持）
1. docs/DOCUMENTATION.md の要件一覧（1.2章 FR / 1.3章 CMS / 1.4.1章 NFR / 1.4.2章 SEC）に要件IDを追加
2. テストを実装し、tests/TEST-REPORT.md のテストケース一覧に追記
3. docs/DOCUMENTATION.md のトレーサビリティマトリクス（1.5章）に要件ID→テストケースの対応を追加
4. トレーサビリティマトリクスに「未テスト」が残らないことを確認
5. CLAUDE.md のテスト件数を更新する

### バグ発生時の対応フロー
1. docs/DOCUMENTATION.md のバグ一覧（4.5章）にバグ概要・原因・対策・再発防止テストを追記
2. 再発防止テストを実装し、tests/TEST-REPORT.md のテストケース一覧に追記
3. 関連する要件のトレーサビリティマトリクス（1.5章）を更新
4. テスト件数が変わった場合は CLAUDE.md・TEST-REPORT.md のテスト件数を更新する
5. **バグ修正内容を必ずドキュメントに反映する**: バグ修正で行ったコード変更・設計変更は、関連ドキュメント（DOCUMENTATION.md, README.md, CLAUDE.md）に漏れなく反映する

### 継続的品質・セキュリティ改善方針
- **バグ駆動テストケース生成**: バグ一覧（DOCUMENTATION.md 4.5章）の全バグに対して再発防止テストを必ず作成する。過去バグ由来の検証マトリクスをエビデンスにも反映する
- **定期セキュリティ検証**: コード変更時に `verify-security.mjs` でSEC要件の充足を自動検証する。新SEC要件追加時はスクリプトも更新する
- **CMS CRUD操作検証**: CMS関連変更時に `verify-cms-crud.mjs` で記事CRUD・画像アップロード・メディアライブラリ等の操作を検証する
- **品質指標**: テストカバレッジ100%（要件対テストケース）、エビデンス取得率100%（主要機能）、バグ再発防止テスト実装率100%を目標とする
- 詳細は DOCUMENTATION.md 4.10章を参照

### ドキュメント変更時
1. 章番号を変更する場合は、他ドキュメントの相互参照も全て更新する
2. 改訂履歴に変更内容を追記する
3. DOCUMENTATION.md の最終更新日を更新する

### ブランチマージ時
1. コード変更は必ず `staging` ブランチで先に実装・テスト・プッシュする
2. staging.reiwa.casa で動作確認を行い、問題がないことを確認する
3. ユーザーの明示的な承認を得てから `staging` → `main` にマージする（勝手にマージしない）
4. マージ後、`config.yml` の `branch` / `base_url` が main の値（`main` / `https://reiwa.casa`）であることを確認する
5. main ブランチでテストを実行し、全PASS を確認してからプッシュする
6. 詳細手順は DOCUMENTATION.md 4.6章を参照

### セキュリティ・品質チェック（コード変更時）
- admin/index.html で `innerHTML` / `outerHTML` を使用しない（DOM API を使用）
- CDN外部スクリプトのバージョンは正確に固定する（キャレット `^` 禁止）
- `postMessage` のオリジンは `"*"` ではなくサーバーサイド算出値を使用する
- OAuth scope は `public_repo,read:user` に限定する（`repo` / `user` 禁止）
- HTMLテンプレートに埋め込む変数は必ずエスケープする
- 変数宣言は `const` / `let` のみ（`var` 禁止）、`'use strict'` を使用
- セキュリティ要件は DOCUMENTATION.md 1.4.2章（SEC-01〜SEC-26）、品質基準は 4.7章を参照
- `npm run build` はビルド前に自動でテスト実行（build.test.mjs以外）。テスト失敗時はビルド中断
- CDN `<script src="...">` タグは必ず `</script>` で閉じる（閉じタグ欠落で後続スクリプトが飲み込まれる）
- `_headers` でセキュリティヘッダーを追加する際、管理画面（`/admin/*`）への影響を必ず検証する:
  - COOP `same-origin` は OAuth popup を破壊する → 管理画面は `same-origin-allow-popups` を使用
  - `X-Frame-Options: DENY` は CMS プレビュー iframe を阻害する → 管理画面は `SAMEORIGIN` を使用
  - CSP `frame-ancestors 'none'` は同上 → 管理画面は `frame-ancestors 'self'` を使用
- **Cloudflare Pages `_headers` 制約（Bug #28）**: `/*` と `/admin/*` で同名ヘッダーを指定すると、オーバーライドではなく **Append（重複送信）** される。ブラウザは最も厳しい値を採用するため、管理画面で異なる値が必要なヘッダー（COOP, CORP, X-Frame-Options）は `/*` セクションに含めてはならない。`/admin/*` セクションにのみ設定する
- **CSP `connect-src` に `blob:` 必須（Bug #29）**: Decap CMS v3.10.0 は画像アップロード時に `URL.createObjectURL()` で blob URL を生成し、エントリ保存時に `fetch(blobURL).then(e => e.blob())` でファイルデータを読み取る。`connect-src` に `blob:` がないとこの fetch がブロックされ、画像付き記事の保存が失敗する（テキストのみの保存は成功する）。参考: GitHub Issue #6829

### やってはいけないこと
- テストを削除・スキップして通す（必ず原因を修正する）
- 要件IDなしに機能を追加する（必ず FR/CMS/NFR/SEC IDを付与する）
- トレーサビリティマトリクスを更新せずに要件・テストを追加する
- ドキュメントを更新せずにコード変更をコミットする
- ハードコードされたURL（`reiwa.casa`）を admin/index.html に追加する（`window.location.origin` を使用）
- テストに特定のコンテンツ名をハードコードする（記事タイトル、固定ページ名等はソースから動的取得する）
- staging で検証せずに直接 main にコード変更をプッシュする
- ユーザーが明示的に指示しない限り main にマージする（自己判断でマージしない）
