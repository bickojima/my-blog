# Modern Web Guidance 日本語索引

## 改訂履歴

| 版数 | 日付 | 内容 |
| :--- | :--- | :--- |
| 1.0 | 2026-09-07 | 初版作成。Modern Web Guidance 全139ガイド（+未公開2本）の日本語索引、人間向け閲覧手順、本ブログの適用実績・検討候補を整理 |

---

## 1. 本書の目的

本ブログは [Google Modern Web Guidance](https://developer.chrome.com/docs/modern-web-guidance?hl=ja) 準拠を基本方針としている（DOCUMENTATION.md 1.1.5章・2.2.3章、NFR-07）。しかし公式が提供するのはコーディングエージェント向けのスキルであり、**日本語でカテゴリ横断的に中身を俯瞰できる目次が存在しない**。

本書はその欠落を埋めるための索引である。ガイド本文の翻訳ではなく、「どのガイドに何が書いてあるか」「本ブログに適用済みか」を1行で引けるようにすることを目的とする。ガイド本文は英語のまま公式を参照する。

> **注意**: 本書はスナップショット（取得日 2026-09-07、`npx modern-web-guidance@latest list` 実行結果）である。Modern Web Guidanceはプレビューリリースであり、ガイドは随時追加・変更される。最新の一覧は 6章の手順で再取得すること。

---

## 2. Modern Web Guidanceとは

Google Chromeチーム（およびMicrosoft Edgeチーム、Webコミュニティ）が提供する、**コーディングエージェント向けのWeb標準ベストプラクティス集**。Apache 2.0ライセンス。

### 2.1 何を解決するのか

LLMの学習データには大量のレガシーコードが含まれるため、コーディングエージェントは「今はネイティブAPIで解決できる課題」に対しても古いJavaScript実装を生成しがちである。Modern Web Guidanceは、Baseline対応状況を含む最新のWeb標準知識をエージェントのコンテキストへ注入し、この乖離を埋める。

- **Modern Browser APIs**: モデルが誤用しがちなAPIの正しい構造を示す
- **Performance & Accessibility**: ブラウザ最適化とアクセシビリティ機構が組み込まれたプラットフォームAPIを優先させる
- **Responsible Fallbacks**: 重いポリフィルやレガシーライブラリではなく、軽量なフォールバックへ誘導する

### 2.2 構成

| 要素 | 内容 |
| :--- | :--- |
| 配布形態 | npmパッケージ `modern-web-guidance` / Claude Codeプラグイン / Gemini拡張 / Cursorプラグイン |
| ガイド本数 | 139本（`list`コマンド基準、2026-09-07時点）。リポジトリには未公開2本を含め141ファイル |
| カテゴリ | 14分類（下表） |
| 形式 | 1ガイド＝1 Markdownファイル。散文＋実装手順＋サンプルコード＋W3C仕様参照 |
| 検索方式 | オフラインのTensorFlow.jsモデルによるローカルセマンティック検索（ネットワーク・APIキー不要） |

### 2.3 ガイドの書きぶり

エージェント向けの特殊フォーマットではなく、通常の技術記事として人間が読める。`MANDATORY` / `DO` / `DO NOT` による強い規範表現が特徴。

例（`performance/defer-rendering-heavy-content`）:

> **MANDATORY**: 初期ビューポート内の要素に `content-visibility: auto` を適用してはならない。ブラウザが描画前に可視性境界を評価するため、逆にページ読み込みが遅くなる。
>
> **MANDATORY**: `content-visibility: auto` は必ず `contain-intrinsic-size` と併用すること。怠るとオフスクリーン時に要素が高さ0pxへ潰れ、深刻なレイアウトシフトとスクロールバーの飛びが発生する。

この記述が、本ブログのBug #40 / F-1で「`content-visibility` を7枚目以降のカードに限定」した根拠である（DOCUMENTATION.md 4.5章）。

---

## 3. 人間が中身を読む方法

| 方法 | 手順 | 用途 |
| :--- | :--- | :--- |
| A. 公式ドキュメント | [developer.chrome.com/docs/modern-web-guidance](https://developer.chrome.com/docs/modern-web-guidance?hl=ja)（日本語あり） | 思想・導入方法の理解。**個々のガイド本文は載っていない** |
| B. GitHubで直接読む | [skills/modern-web-guidance/guides](https://github.com/GoogleChrome/modern-web-guidance/tree/main/skills/modern-web-guidance/guides) | ガイド本文の通読。カテゴリ別フォルダ構成 |
| C. CLIで読む（推奨） | `npx modern-web-guidance@latest retrieve "<ガイドID>"` | 特定ガイドの全文を標準出力へ。インストール不要 |
| D. CLIで探す | `npx modern-web-guidance@latest search "<やりたいこと>"` | 課題からガイドIDを逆引き |
| E. ソースリポジトリ | [GoogleChrome/modern-web-guidance-src](https://github.com/GoogleChrome/modern-web-guidance-src) | ガイド作成方針（`CONTEXT.md`）・貢献方法 |

```bash
# 例: 画像の読み込み優先度に関するガイドを探して全文を読む
npx modern-web-guidance@latest search "optimize image loading priority"
npx modern-web-guidance@latest retrieve "optimize-image-priority"

# 全ガイドをJSONで一覧化（本書5章の生成元）
npx modern-web-guidance@latest list
```

---

## 4. 本ブログでの適用実績

Modern Web Guidance準拠対応（README.md 1.8版・1.9版、DOCUMENTATION.md 1.35版・1.44版、Bug #40）で実装した内容と、対応するガイドの対照表。

| 実装内容 | 実装箇所 | 対応ガイドID |
| :--- | :--- | :--- |
| 先頭サムネイルのみ `fetchpriority="high"` + `loading="eager"`、以降は `lazy` | `src/pages/index.astro`, `src/pages/page/[page].astro` | `performance/optimize-image-priority` |
| 7枚目以降の記事カードに `content-visibility: auto` + `contain-intrinsic-size: auto 220px` | 同上 | `performance/defer-rendering-heavy-content` |
| 記事カードの `container-type: inline-size` + `@container (min-width: 560px)` | 同上 | `css/size-aware-styling` |
| サムネイル有無で1カラム/多カラムを切替（`.post-card:has(.post-thumbnail)`） | 同上 | `css/content-based-styling` |
| 見出し `text-wrap: balance` / 本文 `text-wrap: pretty` | `Base.astro`, 各ページ | `visual-design/improve-text-layout-and-legibility` |
| `<meta name="color-scheme" content="light dark">` + `prefers-color-scheme` 対応 | `Base.astro` | `visual-design/dark-mode` |
| ナビ `aria-expanded` 同期、`aria-label`/`aria-labelledby`、`:focus-visible`、Escape/focusout、44pxタップ領域、コードブロック `tabindex` | `Base.astro`, `public/admin/index.html`, `rehype-focusable-code-blocks.mjs` | `accessibility/accessibility` |

### 4.1 適用対象外の扱い

Decap CMS本体UIは引用元リポジトリの実装を尊重し、保存・OAuth・プレビュー互換性を壊すリスクが高い変更は非準拠許容とする。適用対象は公開サイトのAstro実装（`src/layouts`, `src/pages`, `src/components`, 独自rehype plugin）と `public/admin/index.html` 内の独自カスタマイズに限定する（DOCUMENTATION.md 2.2.3章）。

---

## 5. カテゴリ別ガイド索引（全139本）

「本ブログ」列の凡例: **✅** 適用済み / **○** 未適用だが検討候補 / **—** 現時点では対象外。
ガイド名が category と同名のものは、そのカテゴリの総論ガイドである。

### 5.1 accessibility（2本）

| ガイドID | 日本語要約 | 本ブログ |
| :--- | :--- | :---: |
| `accessibility` | 【総論】セマンティックHTML、フォーカス管理、フォーム、メディア、テストを網羅したアクセシビリティ実装指針 | ✅ |
| `accessible-error-announcement` | `aria-invalid` などのプログラム的状態を視覚的な `:user-invalid` と同期させ、操作後にのみスクリーンリーダーへエラーを伝える | — |

### 5.2 built-in-ai（4本）

| ガイドID | 日本語要約 | 本ブログ |
| :--- | :--- | :---: |
| `language-detection` | ユーザー投稿やサイト内テキストの言語をオンデバイスで判定する | — |
| `language-model` | Prompt APIによるオンデバイス推論。ストリーミング出力、構造化JSON応答、マルチターンセッション管理 | — |
| `summarizer` | オンデバイスSummarizer APIによるテキスト要約 | — |
| `translator` | オンデバイスTranslator APIによる翻訳 | — |

### 5.3 css（15本）

| ガイドID | 日本語要約 | 本ブログ |
| :--- | :--- | :---: |
| `css` | 【総論】モダンCSSアーキテクチャ、レイアウト、描画パフォーマンスの指針 | ✅ |
| `css-layout` | 【総論】flexbox、grid、subgrid、コンテナクエリ、アンカー配置、intrinsic sizing | ✅ |
| `animate-to-intrinsic-sizes` | アコーディオン・メニュー・展開カードを自然な寸法へ滑らかにアニメーションさせる | ○ |
| `calculate-with-intrinsic-sizes` | 要素の内在サイズを基準にしつつ、デザイン上の制約内に収まるようサイズを算出する | — |
| `child-state-based-styling` | `:has()` と状態擬似クラスの組合せで、子要素の状態に応じて親のスタイルを変える（JSでのクラス付替を排除） | ○ |
| `content-based-styling` | 特定の子要素を含むかどうかでレイアウトを切り替える（画像があれば多カラム、なければ1カラム等） | ✅ |
| `design-token-reactivity` | 密度モード（compact/comfortable/spacious）やテーマといった上位デザイントークンに、子孫コンポーネントが個別に反応できるようにする | — |
| `dynamic-sibling-styling` | グループ内の要素数に応じて配色スペクトラムやレイアウトを自動調整する | — |
| `fluid-scaling` | フォントサイズ・余白・メディアサイズを固定ブレークポイントではなく親コンテナサイズに応じて滑らかにスケールさせる | ○ |
| `individual-transform-properties` | `translate` / `rotate` / `scale` を互いに独立してアニメーション・上書きする | — |
| `overflow-clipping-control` | クリッピング境界をcontent/padding/border edge、またはそこからのオフセットへ細かく指定する | — |
| `reduce-style-repetition` | 複雑・動的なスタイルロジックを再利用可能な関数（CSS関数）へ集約し、記述の重複を減らす | — |
| `size-aware-styling` | ビューポートではなく自要素の幅・高さに応じてスタイルを変えるコンポーネントを作る（コンテナクエリ） | ✅ |
| `style-parent-with-has` | フォーム項目が不正な際に、その親（label や fieldset）側をスタイルする | — |
| `usage-aware-component-variations` | CSSコンテナスタイルクエリで、意味的な文脈に応じてコンポーネントの見た目を切り替える | — |

### 5.4 forms（15本）

| ガイドID | 日本語要約 | 本ブログ |
| :--- | :--- | :---: |
| `forms` | 【総論】アクセシブルで安全かつ使いやすいフォーム、入力欄、送信フローの構築指針 | — |
| `animated-select-picker` | ドロップダウンがアニメーションするカスタムselectを作る（フェード・スライド・選択時アニメ） | ○ |
| `autofill-address-form` | 正しい `autocomplete` 属性を備えた住所フォーム | — |
| `autofill-highlight-inputs` | ブラウザが自動入力し、ユーザーが未編集のフィールドをCSSで強調する | — |
| `autofill-payment-form` | 正しい `autocomplete` 値を備えたカード情報フォーム | — |
| `autofill-sign-in-form` | 正しい `autocomplete` 値を備えたサインインフォーム | — |
| `autofill-sign-up-form` | 正しい `autocomplete` 値を備えたサインアップフォーム | — |
| `brand-consistent-forms` | チェックボックス、ラジオ、レンジスライダー、プログレスバーを、カスタム部品に置き換えずサイト配色へ合わせる | ○ |
| `branded-select-styling` | selectのボタン・ピッカー・矢印・チェックマークをデザインシステムへ完全に合わせる | ○ |
| `custom-select-picker-layouts` | 従来の縦積みリストではない独自配置の選択肢を持つカスタムselectピッカー | — |
| `form-fields-automatically-fit-contents` | 入力内容に応じてフィールドが伸縮する（最大・最小サイズ制限付き） | — |
| `required-field-feedback` | 必須項目のエラーを、ユーザーが操作した後にのみ表示し、先回りエラーを避ける | — |
| `rich-media-picker` | 画像・アイコン等のリッチHTMLを選択肢に含められるカスタムselect | — |
| `select-menu-interaction` | selectで既定以外の選択がされたかを、ユーザー操作後にのみ検証する | — |
| `validate-input-after-interaction` | パスワード強度やメール形式の検証フィードバックを、初回操作完了後にのみ表示する | — |

### 5.5 html（1本）

| ガイドID | 日本語要約 | 本ブログ |
| :--- | :--- | :---: |
| `html` | 【総論】モダンHTML構造、セマンティクス、ネイティブ対話API（Dialog / Popover / Details）、フォーカス管理、リソース優先度制御 | ✅ |

### 5.6 js（8本）

日付・時刻処理（Temporal API等）に特化したカテゴリ。

| ガイドID | 日本語要約 | 本ブログ |
| :--- | :--- | :---: |
| `calculate-event-differentials` | 日時間の経過時間・残り時間を算出する | — |
| `capture-location-agnostic-data` | 生年月日・繰返しアラーム・祝日など、ユーザーの所在地で変化してはならない時系列データを記録する | — |
| `coordinate-global-events` | IANAタイムゾーンに明示的に紐づけ、夏時間の切替（スキップ／重複時刻）を跨いでも正確な会議・イベント時刻を保つ | — |
| `format-human-readable-durations` | 経過時間を「1時間30分」「90分」のようにローカライズして可読表示する | ○ |
| `manage-recurring-intervals` | サブスク課金・給与サイクルの繰返し期間を、月末（1月31日＋1か月等）を含め正確に計算する | — |
| `model-partial-time-concepts` | 年・日・日付が欠けた時間概念を、誤差を生むダミー値なしでモデリングする | — |
| `stabilize-reactive-state` | データ駆動ビューで、共有可変状態による予期せぬ副作用なしに期限・スケジュールを扱う | — |
| `support-global-calendar-systems` | イスラム暦・ヘブライ暦・中国暦など非グレゴリオ暦を正確に表示・計算する | — |

### 5.7 performance（24本）

| ガイドID | 日本語要約 | 本ブログ |
| :--- | :--- | :---: |
| `performance` | 【総論】読み込み指標・低速インタラクション・Core Web Vitals（LCP/INP/CLS）の最適化指針 | ✅ |
| `batch-analytics-events` | 複数の解析イベントをデバウンス・バッチ化し、1回のbeaconで送ってネットワーク競合とサーバー負荷を減らす | — |
| `break-up-long-tasks` | 重い同期処理や長いループ、DOM更新を分割し、ブラウザが入力処理と再描画を行えるようにする | — |
| `calculate-total-foreground-time` | タブがバックグラウンドだった時間を除いた、実際の閲覧時間を計測する | — |
| `conditional-async-dependencies` | ポリフィル等の非同期依存を、全スクリプトの複雑な調整なしに条件付きで読み込む | — |
| `defer-rendering-heavy-content` | 長いフィードや記事一覧など、画面外コンテンツの描画を遅延して初期描画を高速化する（`content-visibility`） | ✅ |
| `defer-work-until-scroll-ends` | DOM更新・データ取得・解析送信・レイアウト再計算をスクロール完了後まで遅延し、スクロールを滑らかに保つ | ○ |
| `deliver-optimized-decorative-images` | 背景・アイコン等の装飾画像を、次世代フォーマット（AVIF/WebP）と複数解像度（1x/2x）で同時提供する | ○ |
| `deprioritize-background-fetches` | Fetch APIによる背景データ取得の優先度を下げ、ユーザー起点リクエストとの競合を防ぐ | — |
| `detect-initial-visibility-state` | 非同期読込スクリプトでも、ページがバックグラウンドで読み込まれたかを確実に判定する | — |
| `efficient-background-processing` | 画面外のcanvasアニメ・WebGL・高頻度WebSocketを停止し、再表示時に再開してリソースとバッテリーを節約する | — |
| `faster-spa-view-transitions` | SPAで既訪ビューのDOM構造を破棄せず保持し、戻り遷移を高速化する | — |
| `flicker-free-client-side-ab-testing` | クライアントサイドA/Bテストで、元コンテンツが一瞬見えてから切り替わるちらつきを防ぐ | — |
| `full-session-analytics` | 訪問全体の解析・エラー・テレメトリを確実に記録し、離脱時にまとめて送信する | — |
| `identify-heavy-scripts` | Long Animation Frameの主因となっているスクリプトを特定する | ○ |
| `identify-inp-causes` | INPを悪化させている低速JavaScriptを特定する | ○ |
| `improve-next-page-load-performance` | 次に訪問しそうなページを prefetch / prerender して次ページ読込を高速化する | ○ |
| `interactions-in-complex-layouts` | データ密度の高いダッシュボードや表形式グリッドで、レイアウト再計算を避けINPを改善する | — |
| `optimize-image-priority` | LCP候補画像の読込優先度を上げ、非重要画像は下げる（`fetchpriority`） | ✅ |
| `optimize-preload-priority` | preloadしたリソース同士の相対優先度を調整し、重要リソースの読込遅延を減らす | ○ |
| `optimize-script-priority` | 重要な非同期スクリプトを昇格、非必須・末尾スクリプトを降格して読込順序を最適化する | ○ |
| `resolution-optimized-pseudo-elements` | `::before` / `::after` で解像度最適化画像を使い、DOMノード数を削減する | — |
| `schedule-tasks-by-priority` | 優先度付きでタスクをスケジュールし、重要な処理を先に実行する（`scheduler.postTask`） | — |
| `sequence-distributed-events` | 分散トレーシング環境でナノ秒精度のタイムスタンプにより処理を順序付ける | — |

### 5.8 privacy（1本）

| ガイドID | 日本語要約 | 本ブログ |
| :--- | :--- | :---: |
| `privacy` | 【総論】プライバシー・バイ・デザイン、データ最小化、サードパーティ監査、安全なデータ取扱い、セキュリティヘッダー設定 | ○ |

### 5.9 security（7本）

| ガイドID | 日本語要約 | 本ブログ |
| :--- | :--- | :---: |
| `security` | 【総論】XSS、CSP、Cookie、Cross-Origin Isolationの予防的セキュリティ指針。ポリシーの監査・テスト・安全な適用手順 | ✅ |
| `passkeys` | 【総論】WebAuthn / パスキー実装の全体像と横断原則 | — |
| `passkey-authentication` | 再訪ユーザーをパスキーで一次認証する | — |
| `passkey-conditional-create` | パスワードログイン成功後に、既存ユーザーへパスキーを暗黙登録する | — |
| `passkey-management` | ユーザーが自アカウントに登録済みのパスキーを閲覧・管理できるようにする | — |
| `passkey-reauthentication` | 重要操作の前に既存パスキーで本人確認する | — |
| `passkey-registration` | 既存アカウントにパスキーを登録する | — |

> セキュリティ総論は本ブログのSEC-01〜SEC-26（DOCUMENTATION.md 1.4.2章）およびCSP・`_headers` 設計と直接対応する。パスキー系はCMS認証がGitHub OAuthのため対象外。

### 5.10 ui-atoms（10本）

| ガイドID | 日本語要約 | 本ブログ |
| :--- | :--- | :---: |
| `carousel-slide-effects` | スライドが入場・中央・退場するたびにフェード／回転／拡縮するカルーセル | — |
| `component-specific-light-dark-theme` | コードブロックやメディアプレーヤーだけを、ページのcolor-schemeと独立してライト／ダーク固定にする | ○ |
| `position-aware-tooltips` | フォールバック位置へ反転した際に、矢印が自動で正しい向きを指すツールチップ・ポップオーバー | — |
| `pull-to-reveal` | 画面を引き下げて検索バー等の追加コンテンツを表示する | — |
| `resilient-context-menus-and-nested-dropdowns` | ビューポート端で自動的に軸を反転し、決して見切れないメニュー・ドロップダウン・オーバーレイ | ○ |
| `scroll-position-aware-elements` | スクロール有無に応じて出現・消滅するフローティングボタン（トップへ戻る、チャット起動等） | ○ |
| `scroll-progress-indicator` | ページ・セクションの読み進み度を示すスクロールプログレスバーやステップ表示 | ○ |
| `scrollability-affordance-hints` | その方向にまだスクロールできる場合だけ表示される影・グラデーション・矢印 | ○ |
| `shrinking-header-on-scroll` | スクロール距離に応じて固定ヘッダーやカバーが縮小・影付与・レイアウト変形する | — |
| `state-aware-sticky-headers` | 実際に上端へ「貼り付いた」ときだけ配色や影が変化するスティッキーヘッダー | ○ |

### 5.11 ui-behaviors（29本）

| ガイドID | 日本語要約 | 本ブログ |
| :--- | :--- | :---: |
| `anchor-positioning-tab-underline` | 選択中タブの下線を、前のタブから現在のタブへ滑らかに移動させる | — |
| `animate-element-entry-exit` | DOMへの追加・削除や `display` 切替に伴う表示／非表示を滑らかにアニメーションする | ○ |
| `animate-to-from-top-layer` | ダイアログ・ポップオーバー・ツールチップがトップレイヤーへ出入りする際のアニメーション | ○ |
| `carousel-snap-highlights` | スクロールスナップ中のカルーセルで、現在スナップ中の項目を視覚的に強調する | — |
| `consistent-cross-document-transitions` | 文書間ビュー遷移の開始前に、重要CSS・JS・初期表示HTMLが確実に整った状態を作る | ○ |
| `cross-document-transitions` | ページ遷移全体をクロスフェードやモーフィングで滑らかにつなぐ（View Transitions） | ○ |
| `custom-button-actions` | 宣言的なボタンコマンド（invoker commands）で、ボタンと任意要素の独自アクションを結び付ける | ○ |
| `declarative-dialog-popover-control` | JavaScriptなしで、ボタンからダイアログ・ポップオーバーの表示を切り替える | ○ |
| `directional-navigation-transitions` | 進む／戻るの方向に応じて、右から／左からスライドインさせる | — |
| `dynamic-sibling-animations` | 兄弟要素の並び順に応じた遅延を自動計算し、アニメーションをずらして開始する | — |
| `group-element-transitions` | 同種要素をまとめて遷移させる（カートから1件削除すると残りが新位置へアニメーション等） | — |
| `highlight-text-ranges` | 検索結果・スペルミス・共同編集カーソルなど任意のテキスト範囲をハイライトする（CSS Custom Highlight API） | ○ |
| `interactive-content-reveal` | ポインタ追従スポットライトなど、対話的に内容を露出させる演出 | — |
| `interest-triggered-action-previews` | クリック確定前に、ホバー・フォーカス・長押しでボタンの効果をライブプレビューする | — |
| `interest-triggered-tooltips` | クリックを要さず、ホバー・フォーカス・長押しでツールチップや補足情報を表示する | ○ |
| `light-dismiss-a-dialog` | ダイアログ外のクリック・タップで閉じられるモーダルを作る | ○ |
| `move-dom-element-without-losing-state` | フォーカス／`:active`、`<iframe>` の読込状態、アニメーション状態を失わずにDOM要素を移動・再親付けする | — |
| `parallax-scroll-effects` | 前景と背景を異なる速度で動かし奥行きを出すスクロール演出 | — |
| `persistent-top-layer-ui` | DOMノードを移動・再親付けしてもモーダル・全画面・ポップオーバーを開いたまま機能させ続ける | — |
| `physics-based-easing` | バウンスやスプリングなど、物理ベースの自然なイージングを作る | — |
| `platform-controls-dismiss-dialog` | Escキーやモバイルの戻る／却下ジェスチャーなど、プラットフォーム標準操作でモーダルを閉じられるようにする | ○ |
| `same-document-transitions` | SPA内でサムネイルからヒーロー画像へ拡大するなど、持続する要素をモーフィングでつなぐ | — |
| `scroll-entry-exit-effects` | 要素がスクロールポートへ出入りする際のフェードイン・拡大などの演出 | ○ |
| `scroll-snap-realtime-feedback` | スクロールジェスチャー完了前に、連動UIへリアルタイムの視覚フィードバックを返す | — |
| `scroll-snap-state-sync` | ナビゲーション表示・連動パネル・解析トラッキングを、現在スナップ中の項目と同期する | — |
| `scroll-target-on-load` | カルーセルやチャットスレッドを、特定要素が表示された状態で初期描画する | — |
| `scrollytelling` | 別要素のスクロール位置に駆動されて、背景色や不透明度を変化させるスクロールテリング | — |
| `search-hidden-content` | アコーディオン・タブ・「続きを読む」で隠したテキストを、ページ内検索・SEOインデックス・URLフラグメント・ARIAに対応させたまま隠す（`hidden="until-found"`） | ○ |
| `swipe-to-remove` | リスト項目を横スワイプで削除・アーカイブ・既読化する | — |

### 5.12 ui-components（4本）

| ガイドID | 日本語要約 | 本ブログ |
| :--- | :--- | :---: |
| `navigation-drawer` | メニューボタンから横スライドインし、スワイプ／外側タップ／Escapeで閉じるナビゲーションドロワー | ○ |
| `persistent-app-tours` | 操作中も開いたままの、要素にひも付いたネイティブオーバーレイによるオンボーディングツアー | — |
| `persistent-toast-notifications` | 積み重ね可能で持続的な、非侵襲的トースト通知 | — |
| `stack-drill-down` | 階層を掘り下げ、スワイプや戻る操作で復帰できる全画面ナビゲーション（ブラウザ履歴と同期） | — |

### 5.13 visual-design（16本）

| ガイドID | 日本語要約 | 本ブログ |
| :--- | :--- | :---: |
| `adapt-scrollbar-to-contrast-preferences` | 高コントラスト設定のユーザー向けにスクロールバーの視認性を高める | ○ |
| `apply-webgl-shaders` | HTMLコンテンツへWebGLシェーダーによる独自ビジュアルエフェクトを適用する | — |
| `complex-shapes` | 記号・筆致・有機的テクスチャなど自由形状で要素と内容をクリップする | — |
| `customize-scrollbar-color-and-thickness` | スクロールバーの色・太さをカスタマイズする（`scrollbar-color` / `scrollbar-width`） | ○ |
| `dark-mode` | ユーザーのライト／ダーク設定を尊重し、スクロールバーやフォーム部品などブラウザUIも追随させるダークモード実装 | ✅ |
| `export-html-media-from-canvas` | canvas内から動的HTMLコンテンツを画像・動画フレームとして書き出す | — |
| `expose-canvas-content-to-browser-features` | canvas描画内容を支援技術・翻訳・リーダーモードへ露出させる | — |
| `improve-text-layout-and-legibility` | 数行程度の見出しなど短いテキストで、ブラウザに均等な行分割をさせて可読性を上げる（`text-wrap: balance`） | ✅ |
| `interactive-content-in-3d-scenes` | 3DシーンへインタラクティブなHTML要素を統合する | — |
| `precise-text-alignment` | 任意フォントで、テキスト上下の視覚的余白を正確に等しくする／アイコンと完全に揃える | ○ |
| `prevent-text-wrapping` | ブラウザに改行を挿入させず、コンテナからあふれさせる | ○ |
| `shaped-cutouts` | 複数の図形を組み合わせて、要素に切り欠き（ノッチ）などのくり抜き効果を作る | — |
| `soft-edge-content-fade` | 端に透明グラデーションをかけ、まだスクロールできること／ペイウォール文を示す（`mask-image`） | ○ |
| `visually-stable-font-fallbacks` | 優先フォントとフォールバックが入れ替わっても、可読性と見た目の一貫性が崩れないフォント指定 | ○ |
| `visually-stable-mixed-fonts` | 1つのテキストブロックが複数フォントで描かれる状況でも、見た目の一貫性を保つ | ○ |
| `visually-texture-content` | 要素に風化・質感パターンを適用し、有機的・物質的な外観を与える | — |

### 5.14 webmcp（3本）

| ガイドID | 日本語要約 | 本ブログ |
| :--- | :--- | :---: |
| `webmcp` | 【総論】WebMCP（Web Model Context Protocol）でクライアント機能をAIエージェントへツールとして公開する | — |
| `agentic-forms` | 標準HTMLフォームにWebMCP属性を付与し、AIエージェント向けツールとして公開する | — |
| `agentic-javascript-tools` | WebMCP命令的APIで、クライアントサイドJS関数をAIエージェント向けツールとして登録する | — |

### 5.15 リポジトリのみに存在するガイド（npm未公開、2本）

`list` コマンドの結果には含まれないが、リポジトリには存在するファイル。将来のリリースで公開される見込み。

| ガイドID | 日本語要約 | 本ブログ |
| :--- | :--- | :---: |
| `built-in-ai/prompt-api` | Prompt API（`language-model` の別名または前身と推測される） | — |
| `forms/ime-safe-enter-submit` | **日本語入力（IME）変換確定のEnterを送信と誤認しないフォーム送信処理** | ○ |

> `forms/ime-safe-enter-submit` は日本語サイト固有の頻出バグに直結する。CMS検索欄など将来Enter送信を実装する際は必ず参照すること。

---

## 6. 索引の更新手順

Modern Web Guidanceはプレビューリリースであり、ガイドは随時追加される。本書は以下の手順で再生成・差分確認する。

```bash
# 1. 最新のガイド一覧を取得
npx modern-web-guidance@latest list > /tmp/mwg-list.json

# 2. 本数とカテゴリ内訳を確認
node -e "
const d=require('/tmp/mwg-list.json');
console.log('TOTAL', d.length);
const by={}; for(const g of d){(by[g.category]=by[g.category]||[]).push(g);}
for(const c of Object.keys(by)) console.log(c, by[c].length);
"

# 3. 本書5章に無いガイドIDを抽出
node -e "
const fs=require('fs');
const d=require('/tmp/mwg-list.json');
const doc=fs.readFileSync('docs/MODERN-WEB-GUIDANCE.md','utf8');
for(const g of d) if(!doc.includes('\`'+g.id+'\`')) console.log('NEW:', g.category+'/'+g.id, '-', g.description);
"
```

新規ガイドが検出された場合:

1. 本書5章の該当カテゴリへ行を追加し、日本語要約と「本ブログ」欄を記入する
2. 本ブログへ適用する場合は、DOCUMENTATION.md 1.2〜1.4章へ要件IDを追加し、1.5章トレーサビリティマトリクスを更新する（CLAUDE.md「新機能追加時」の手順に従う）
3. 本書の改訂履歴へ追記する

### 6.1 スキル本体の更新

```bash
# Claude Codeプラグインとして導入する場合
/plugin marketplace add GoogleChrome/modern-web-guidance
/plugin install modern-web-guidance@googlechrome
/reload-plugins

# 対話式インストーラ（Claude Code / Gemini CLI / Cursor 等を自動判別）
npx modern-web-guidance@latest install
```

---

## 7. 関連ドキュメント

| 文書 | 参照箇所 |
| :--- | :--- |
| `README.md` | 10章 Modern Web Guidance準拠方針、11章 参考リンク |
| `docs/DOCUMENTATION.md` | 1.1.5章 準拠方針、1.4.1章 NFR-07、2.2.3章 基本設計方針、4.5章 Bug #40、4.10章 継続的品質改善 |
| `tests/TEST-REPORT.md` | 2.5.4章 Modern Web Guidanceアクセシビリティ検証、テストケース23b/23c、E-05/E-21 |
| `CLAUDE.md` | 「Modern Web Guidance準拠」節、「実操作E2E必須」節 |
