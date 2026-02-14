# 自動テスト レポート

**テストフレームワーク**: vitest v4
**実行コマンド**: `npm test`
**テスト結果**: 全151テスト / 6ファイル **ALL PASS**

---

## テスト一覧

### 1. コンテンツ検証 (`content-validation.test.mjs`) — 31テスト

記事ファイル（Markdown）のフロントマターと構造を検証。
記事の新規作成・編集後に不整合がないかを自動チェック。

| # | テストケース | 対象 | 結果 |
|---|---|---|---|
| 1 | 記事ファイルが1つ以上存在する | 全体 | PASS |
| 2 | フロントマターが正しくパースできる | 各記事 | PASS |
| 3 | title（タイトル）が文字列で存在する | 各記事 | PASS |
| 4 | date（日付）がYYYY-MM-DD形式である | 各記事 | PASS |
| 5 | draft（下書き）がboolean型である | 各記事 | PASS |
| 6 | category（カテゴリ）が有効な値（devices/finance） | 各記事 | PASS |
| 7 | categoryがファイルパスのディレクトリと一致する | 各記事 | PASS |
| 8 | tags（タグ）が配列で各要素が空でない文字列 | 各記事 | PASS |
| 9 | thumbnail（サムネイル）が/images/で始まるパス | 各記事 | PASS |
| 10 | 本文が空でない | 各記事 | PASS |
| 11 | ファイル名がYYYY-MM-DD-で始まる規約に従っている | 各記事 | PASS |

**想定シナリオ**: CMS で新しい記事を作成・編集した後、フロントマターの不備を即座に検出

---

### 2. rehype-image-caption プラグイン (`rehype-image-caption.test.mjs`) — 8テスト

画像キャプション変換プラグインのユニットテスト。

| # | テストケース | 結果 |
|---|---|---|
| 1 | img要素にloading="lazy"とdecoding="async"が自動追加される | PASS |
| 2 | 既存のloading属性は上書きしない | PASS |
| 3 | 既存のdecoding属性は上書きしない | PASS |
| 4 | title属性を持つimgがfigure+figcaptionに変換される | PASS |
| 5 | title属性がないimgはfigureに変換されない | PASS |
| 6 | 既にfigure内にあるimgは二重変換されない | PASS |
| 7 | 日本語のtitleが正しくキャプションになる | PASS |
| 8 | 複数のimg要素がそれぞれ正しく処理される | PASS |

**想定シナリオ**: 記事に画像を挿入した際、title属性によるキャプション表示とlazy loading が正しく動作するか

---

### 3. OAuth認証関数 (`auth-functions.test.mjs`) — 10テスト

Cloudflare Functions による GitHub OAuth 認証フローのテスト。

| # | テストケース | エンドポイント | 結果 |
|---|---|---|---|
| 1 | OAUTH_CLIENT_ID設定時、GitHubへ302リダイレクト | /auth | PASS |
| 2 | リダイレクトURIにコールバックパスが含まれる | /auth | PASS |
| 3 | OAUTH_CLIENT_ID未設定時、500エラーを返す | /auth | PASS |
| 4 | localhost等の異なるオリジンでも正しいコールバックURL | /auth | PASS |
| 5 | codeパラメータなしで400エラーを返す | /auth/callback | PASS |
| 6 | OAuth資格情報未設定で500エラーを返す | /auth/callback | PASS |
| 7 | CLIENT_IDのみ設定（SECRET未設定）で500エラー | /auth/callback | PASS |
| 8 | GitHub APIエラー時に400エラーを返す | /auth/callback | PASS |
| 9 | 成功時にDecap CMSハンドシェイクHTMLを返す | /auth/callback | PASS |
| 10 | GitHubへのリクエストパラメータが正しい | /auth/callback | PASS |

**想定シナリオ**: 管理画面へのログイン（PC / iPad / iPhone の各ブラウザ）

---

### 4. CMS設定検証 (`cms-config.test.mjs`) — 41テスト

Decap CMS の config.yml が正しく定義されているか検証。

| # | テストケース | 結果 |
|---|---|---|
| 1 | GitHubバックエンドが設定されている | PASS |
| 2 | リポジトリが正しく設定されている | PASS |
| 3 | ブランチがmainに設定されている | PASS |
| 4 | 認証エンドポイント（/auth）が設定されている | PASS |
| 5 | base_urlが本番URL（https://reiwa.casa）に設定されている | PASS |
| 6 | メディアフォルダがpublic配下 | PASS |
| 7 | 公開フォルダパスが正しい | PASS |
| 8 | 日本語ロケールが設定されている | PASS |
| 9 | Unicode対応スラッグエンコーディング | PASS |
| 10 | コレクションが2つ定義されている | PASS |
| 11-20 | devices コレクションのフォルダ・フィールド定義 | PASS |
| 21-30 | finance コレクションのフォルダ・フィールド定義 | PASS |
| 31-41 | 各フィールドのウィジェット型・デフォルト値・必須/任意 | PASS |

**想定シナリオ**: CMS設定変更後に、コレクション構造やフィールド定義が壊れていないか検証

---

### 5. ビルド検証 (`build.test.mjs`) — 26テスト

`npm run build` を実行し、生成された dist/ の内容を検証。

| # | テストケース | カテゴリ | 結果 |
|---|---|---|---|
| 1 | distディレクトリが生成される | 成果物 | PASS |
| 2 | トップページ（index.html）が生成される | 成果物 | PASS |
| 3 | 管理画面がコピーされる | 成果物 | PASS |
| 4 | CMS設定がコピーされる | 成果物 | PASS |
| 5 | faviconファイルが存在する | 成果物 | PASS |
| 6 | robots.txtが存在する | 成果物 | PASS |
| 7 | _headersファイルが存在する | 成果物 | PASS |
| 8 | _redirectsファイルが存在する | 成果物 | PASS |
| 9 | 公開記事のページが生成されている | 記事 | PASS |
| 10 | 下書き記事のページが生成されていない | 記事 | PASS |
| 11 | devicesカテゴリページが生成される | カテゴリ | PASS |
| 12 | financeカテゴリページが生成される | カテゴリ | PASS |
| 13 | タグページディレクトリが生成される | タグ | PASS |
| 14 | HTML5 doctype宣言がある | HTML品質 | PASS |
| 15 | lang="ja"が設定されている | HTML品質 | PASS |
| 16 | viewportメタタグ設定されている | HTML品質 | PASS |
| 17 | サイトタイトルが含まれている | コンテンツ | PASS |
| 18 | 「記事一覧」見出しが含まれている | コンテンツ | PASS |
| 19 | 管理画面へのリンクがある | ナビゲーション | PASS |
| 20 | 公開記事へのリンクが含まれている | ナビゲーション | PASS |
| 21 | カテゴリリンクが含まれている | ナビゲーション | PASS |
| 22 | タグリンクが含まれている | ナビゲーション | PASS |
| 23 | copyright表記がある | フッター | PASS |
| 24 | 記事ページに「記事一覧に戻る」リンクがある | ナビゲーション | PASS |
| 25 | アップロード画像ディレクトリが存在する | 画像 | PASS |
| 26 | title付き画像がfigure/figcaptionに変換されている | プラグイン | PASS |

**想定シナリオ**: デプロイ前のビルド確認（Cloudflare Pages にデプロイされるのと同等の出力を検証）

---

### 6. 管理画面HTML検証 (`admin-html.test.mjs`) — 35テスト

PC・iPad・iPhone の各端末向けの管理画面カスタマイズを検証。

#### PC端末対応（7テスト）

| # | テストケース | 結果 |
|---|---|---|
| 1 | box-sizing: border-boxがグローバルに設定 | PASS |
| 2 | 横はみ出し防止のoverflow-x: hidden設定 | PASS |
| 3 | コレクション一覧の日付バッジスタイル（青色） | PASS |
| 4 | 選択解除ボタンのスタイル定義 | PASS |
| 5 | 完全削除ボタンのスタイル定義（赤色） | PASS |
| 6 | 完全削除ボタンの無効状態スタイル | PASS |
| 7 | HTML基本構造（doctype, charset, viewport, robots noindex） | PASS |

#### モバイル対応: iPad・iPhone共通（10テスト）

| # | テストケース | 結果 |
|---|---|---|
| 1 | 799pxブレイクポイントのメディアクエリ | PASS |
| 2 | アプリコンテナのレイアウト調整（max-width: 100vw） | PASS |
| 3 | サイドバーがposition: initialに変更 | PASS |
| 4 | エディタのコントロールバーがstickyに設定 | PASS |
| 5 | 保存・公開ボタンのタップ領域が44px以上 | PASS |
| 6 | ドロップダウンが画面下部に固定表示 | PASS |
| 7 | モーダルが画面幅95%で表示 | PASS |
| 8 | メディアライブラリのカードグリッドが2列表示 | PASS |
| 9 | 画像選択ボタンが縦並び・全幅表示 | PASS |
| 10 | メディアライブラリのタッチスクロール対応 | PASS |

#### iPhone（iOS）固有対応（4テスト）

| # | テストケース | 結果 |
|---|---|---|
| 1 | 入力フォームのfont-size 16px以上（自動ズーム防止） | PASS |
| 2 | HEIC画像アップロード時のaccept属性制限 | PASS |
| 3 | pull-to-refresh（引っ張って更新）の無効化 | PASS |
| 4 | モーダル内スクロール許可（妨害しない） | PASS |

#### iPad対応: タッチUI（4テスト）

| # | テストケース | 結果 |
|---|---|---|
| 1 | フッターボタンがflex配置でタップしやすい | PASS |
| 2 | アップロードボタンが全幅で大きく表示 | PASS |
| 3 | ツールバーがwrapで折り返し対応 | PASS |
| 4 | 戻るリンクが長い場合の省略表示 | PASS |

#### JavaScriptカスタマイズ機能（6テスト）

| # | テストケース | 結果 |
|---|---|---|
| 1 | MutationObserverによるDOM監視 | PASS |
| 2 | コレクション一覧の日付フォーマット処理 | PASS |
| 3 | 削除ボタンのラベル変更（選択解除/完全削除） | PASS |
| 4 | 削除ボタンの文脈判定（ウィジェット内 vs ライブラリ） | PASS |
| 5 | メディアライブラリの選択状態による削除ボタン制御 | PASS |
| 6 | 選択状態の判定（borderColor青系） | PASS |

---

## 端末別テストカバレッジまとめ

| 端末 | テスト数 | カバー範囲 |
|---|---|---|
| PC | 基本構造 + ビルド + CMS設定 + プラグイン | 記事閲覧・管理画面のPC表示・ビルド検証 |
| iPad | モバイルCSS + タッチUI + タップ領域 | 管理画面のiPad表示・タッチ操作 |
| iPhone | iOS固有対応 + モバイルCSS | 自動ズーム防止・HEIC変換・pull-to-refresh無効化 |

## 実行方法

```bash
# 全テスト実行
npm test

# ウォッチモード（ファイル変更時に自動再実行）
npm run test:watch

# 特定テストのみ実行
npx vitest run tests/content-validation.test.mjs
```
