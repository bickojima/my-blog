# Modern Web Guidance 遵守確認・操作性レビュー報告書（2026-06-11）

- **対象**: staging ブランチ（`bad8698` 時点）の公開サイトおよび CMS 管理画面の独自カスタマイズ
- **照合基準**: Google 公式 Modern Web Guidance スキル（`npx modern-web-guidance@latest` で当日取得した最新ガイド本文）
- **検証方法**: 静的コードレビュー（ガイド本文との突合）＋ Playwright 実操作検証（PC 1280x800 / iPad Pro 11 / iPhone 14、CMS は OAuth・GitHub API モック方式）＋ axe-core 4.x スキャン
- **検証スクリプト**: `verify-mwg-review.mjs`（実行結果: `results.json`、45チェック）
- **位置づけ**: レビューのみ（修正は別セッションで実施予定）

---

## 1. 総評

Modern Web Guidance 準拠対応（staging 先行反映）は **おおむねガイドに忠実に適用されており、公開サイトの axe-core 違反は 3 デバイスとも 0 件**。LCP 画像優先度・コンテナクエリ・text-wrap・aria-expanded 同期・focus-visible・コントラスト改善・CMS 44px タップ領域は、実操作検証で動作を確認した。

一方で、(1) `content-visibility: auto` のファーストビュー内適用（ガイドの MANDATORY 違反）、(2) 公開サイト側モバイルタップターゲットの未対応（CMS 側との方針不整合）、(3) ナビドロップダウンのキーボード操作（Esc・フォーカス離脱）、(4) CMS 月セレクターのアクセシブルネーム欠如、の4点は修正を推奨する。

---

## 2. 適合確認済み項目（実測ベース）

| # | 適用機能 | 対応ガイド | 判定 | 実測内容 |
|---|---|---|---|---|
| 1 | 先頭サムネイル `fetchpriority="high"` + `loading="eager"`、2枚目以降 lazy | optimize-image-priority | ✅ | 3デバイスで属性を確認。high は1枚のみ（ガイドの1-2枚制限内） |
| 2 | `contain-intrinsic-size: auto 220px` 併用 | defer-rendering-heavy-content | ✅ | MANDATORY のペア指定を充足（適用範囲は課題F-1参照） |
| 3 | コンテナクエリ（`.post-list` inline-size + `@container 560px`） | size-aware-styling | ✅ | PC/iPad で横並びグリッド、iPhone で縦積みを実測。`:has()` も Baseline Widely Available |
| 4 | `text-wrap: balance`（見出し）/ `pretty`（本文） | improve-text-layout-and-legibility | ✅ | 使い分けがガイドの推奨通り。グローバル適用なし。pretty は Firefox 非対応だがプログレッシブエンハンスメントとして妥当 |
| 5 | ナビ `aria-expanded`/`aria-controls` 同期 | accessibility §5 | ✅ | 開閉時の属性同期を3デバイスで実測（ラベル文言は課題F-7参照） |
| 6 | `focus-visible` スタイル（2px #1a73e8） | accessibility §5 | ✅ | Tab 巡回34ステップ全てで可視フォーカスを確認 |
| 7 | コントラスト改善 #888→#595959（CMS figcaption・削除ボタン無効時） | accessibility §9 | ✅ | 白背景で約7:1、WCAG AA 充足 |
| 8 | CMS タップ領域 44px（WCAG 2.5.5、Bug #39 対応） | accessibility / forms | ✅ | iPhone 実測: 記事を作成 90×44、新規作成 94×44、ソート 48×52、エディタツールバー全ボタン 44px 以上（独自月セレクターのみ漏れ＝課題F-5） |
| 9 | `content-visibility` 領域へのキーボード到達性 | defer-rendering-heavy-content MANDATORY検証 | ✅ | Tab のみでファーストビュー外のカードへ到達可能を3デバイスで実測 |
| 10 | axe-core スキャン | accessibility §12 | ✅ | 公開サイト（トップ・記事詳細）違反 0 件 × 3デバイス。コンソールエラー 0 件 |
| 11 | CMS-19 年月グルーピング一式 | —（機能検証） | ✅ | 自動有効化・日本語見出し・降順整列・月セレクター絞り込みを PC/iPhone で実操作確認 |

基本要素（`lang="ja"`・viewport・ランドマーク・見出し階層・`<time datetime>`・セマンティックHTML）も公開サイト側は適合。

---

## 3. 指摘事項（修正候補）

### F-1【MWG不適合・中】`content-visibility: auto` がファーストビュー内カードに適用されている
- **場所**: `src/pages/index.astro` `.post-card:not(:first-child)`
- **実測**: PC/iPad では2〜4枚目、iPhone では2枚目のカードが初期ビューポート内にあるのに `content-visibility: auto` が当たっている
- **ガイド**: defer-rendering-heavy-content は「初期ファーストビュー内の要素に適用してはならない（MANDATORY）。可視性境界の評価が先行し、かえって初期描画を遅らせる」と明記
- **修正方向**: 適用開始位置を後ろへ（例: `:nth-child(n+4)` 以降）、または各デバイスで確実にビューポート外となる位置から適用

### F-2【操作性/a11y・中】ナビドロップダウンが Esc で閉じず、フォーカスが離れても開いたまま
- **場所**: `src/layouts/Base.astro` ドロップダウンスクリプト
- **実測**: 3デバイスとも Escape キーで閉じない。トグルを開いた後 Tab でメニュー外へ抜けても開いたまま残る（マウスの外側クリックでのみ閉じる）
- **ガイド**: html §4 はメニュー等の非モーダル UI に Popover API（`popover` 属性）を推奨。light-dismiss と Esc クローズが宣言的に得られ、現行の click ハンドラ＋is-open クラスの大部分を置き換えられる（Baseline Widely Available）
- **修正方向**: Popover API 化、または現行実装に keydown(Escape) と focusout 処理を追加

### F-3【a11y・中】公開サイトのモバイルタップターゲットが小さい（CMS 側と方針不整合）
- **実測（iPhone/iPad）**: ▾トグル 18×21px、ナビドロップダウンリンク 83×15px、フッター管理リンク 21×19px。WCAG 2.2 AA（24px）にも、CMS 側で採用した 2.5.5 AAA（44px）にも届かない
- **備考**: タグ（53×25px）は 24px 基準は充足。CMS だけ 44px 対応済みで公開サイトが未対応という不整合がある
- **修正方向**: タッチデバイス向けに padding 拡大（見た目を変えずに当たり判定のみ広げる手もある）

### F-4【a11y・中】CMS 月セレクターにアクセシブルネームがない
- **場所**: `public/admin/index.html` `createMonthSelector()`
- **実測**: `#cms-month-selector` に label / aria-label / title いずれもなし。スクリーンリーダーには用途不明の select として通知される
- **ガイド**: accessibility §3・§7「フォームコントロールには label を programmatic に関連付ける」
- **修正方向**: `sel.setAttribute('aria-label', '年月で絞り込み')` 等

### F-5【a11y・小】CMS 月セレクター自体が 44px 未満（iPhone 実測 144×37px）
- Bug #39 で Decap 本体ボタンに 44px を確保した一方、後から追加した独自 UI が自らのルールから漏れている
- **修正方向**: min-height: 44px を追加（44px CSS の media query に #cms-month-selector を含める）

### F-6【a11y・小】`admin/index.html` の `<html>` に `lang` 属性がない
- axe-core: html-has-lang（serious）。管理画面 UI は日本語のため `<html lang="ja">` が妥当。独自管理ファイルなので非準拠許容（Decap 本体）には該当しない

### F-7【a11y・軽微】`aria-label="サイトナビゲーション"` にロール名が含まれる
- accessibility §3 DON'T「ラベルにロール名を含めない」（「ナビゲーション ナビゲーション」と読み上げられる）。「メイン」「サイト」等ロール名を含まない語へ

### F-8【潜在バグ・中】記事本文内リンクが視覚的に判別不能になる
- **場所**: `Base.astro` グローバル `a { color: inherit; text-decoration: none }` に対し、`.post-content` 内の `a` のスタイル定義がない
- **現状**: 現在の全記事に本文リンクがないため顕在化していない（実測で no-link-in-content を確認）が、リンクを含む記事を書いた瞬間に WCAG 1.4.1（色のみ/手がかりなし）違反となる
- **修正方向**: `.post-content :global(a)` に下線＋色を定義

### F-9【潜在・小】コードブロック `pre` に `tabindex="0"` がない
- html §2 DO「スクロール可能なコードブロックはキーボードで到達可能に」。`overflow-x: auto` 指定済みのため、横スクロールが発生する記事でキーボード到達不可になる。rehype プラグインでの付与が候補

### F-10【推奨・小】サムネイル `img` の width/height 属性と `aspect-ratio` の整理
- ガイド DO「全 `<img>` に width/height 指定」。現状は CSS の固定 height で CLS は抑止できているため実害なし。なお `aspect-ratio: 3/2` は width/height 両指定により効いておらず実質デッドコード

### F-11【推奨・小】レスポンシブ画像（srcset/sizes）未使用
- ビルドで 1200px 単一サイズに最適化しているが、iPhone（表示幅 ~358px）にも 1200px を配信。html §3 DO は srcset を推奨。image-optimize.mjs で複数サイズ生成＋srcset 出力が候補（効果は中、工数も中）

### F-12【任意】ダークモード（prefers-color-scheme）未対応
- accessibility §9 DO ではあるが、サイトのデザイン判断として light 固定も成立する。対応する場合は `color-scheme` プロパティとセットで

---

## 4. ユーザ目線の操作性所見

- **サイト（3デバイス）**: 記事一覧→詳細→戻る、タグ、アーカイブの導線は迷いなく操作できた。コンテナクエリにより PC/iPad は横並びカード、iPhone は縦積みで読みやすい。ドロップダウンはタップ開閉・外側タップで閉じるのは良好（キーボード操作のみ F-2 の課題）
- **CMS（PC/iPhone）**: ログイン→一覧→年月絞り込み→記事を開く→一覧へ戻る、の一連がスムーズ。年月グルーピング＋月セレクターは記事数が増えたときの探しやすさに効く良い改善。下書きバッジ・日付バッジも一覧で判別しやすい
- **CMS モバイル編集画面**: Decap 標準の左右分割（入力欄＋プレビュー）のため iPhone では入力欄が画面幅の約半分。プレビュートグル（目アイコン）で全幅にできるが、初見では気づきにくい（Decap 本体挙動のため非準拠許容の範囲。気になる場合のみ将来検討）
- **コンソールエラー**: サイト・CMS とも 0 件（モック環境）

## 5. 実装堅牢性に関する所見（情報）

- `activateDefaultGrouping()` は実ボタンの `click()` ＋ 100ms `setTimeout` でメニュー項目を選択する方式、`reverseViewGroups()` は React 管理下の DOM を `appendChild` で並べ替える方式。今回の実測では誤動作・エラーなしだが、Decap 本体の再描画タイミングやバージョン更新に対して構造的に脆い。E2E（cms-exploratory ほか）が回帰を押さえているのは適切な補強であり、現状維持で可。Decap 更新時は要再検証
- Decap 本体 UI の axe 違反（ViewControlsButton の名前なし等 5 件）は「本体 UI 非準拠許容」方針（DOCUMENTATION.md 1.1.5 章）の対象のため指摘から除外した

## 6. 修正時の優先度案（別セッション向け）

1. **中**: F-1（content-visibility 適用範囲）、F-2（ドロップダウン Esc/フォーカス）、F-3（サイト側タップターゲット）、F-4（月セレクター aria-label）、F-8（本文リンクスタイル＝潜在だが1行で防げる）
2. **小**: F-5、F-6、F-7、F-9、F-10
3. **任意/工数大**: F-11（srcset）、F-12（ダークモード）

※ 修正時は CLAUDE.md のルール（要件ID付与・トレーサビリティ更新・再発防止テスト・エビデンス取得）に従うこと。

---

## 付録: 検証環境の注意

- サンドボックスのネットワーク制約により、Decap CMS 本体（unpkg CDN）は同一バイトのローカルバンドル（decap-cms@3.10.0）を `context.route()` で供給して検証した（SRI integrity 一致）
- `dist/admin/config.yml` の `base_url` のみテストサーバー URL に一時変更（ビルド成果物のみ。ソースの config.yml は未変更）
- CMS エディタ画面はモックの制約でフィールド値が空表示だが、画面遷移・公開URLバー・ツールバー計測は有効
