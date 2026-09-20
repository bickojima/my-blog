# セキュリティ監査 run-2 対応 引き継ぎメモ（第2版 / 2026-09-20）

> 第1版（Antigravity による中断時メモ）は本ファイルを全面改訂したもので置き換えた。第1版の内容は
> git 履歴（コミット `38205a0`）から参照できる。**第1版の記述には誤りが含まれていたため、本ファイルの
> 記述を正とすること**（誤りの詳細は「前任作業の検証結果」章）。

## 状態サマリー

- **作業ブランチ**: `fix/security-audit-run2`
- **ベース**: `origin/staging`（`b5a42a3`）
- **中断理由**: ユーザー指示による作業停止・別エージェントへの引き継ぎ
- **Vitest 実測**: **624 passed / 0 failed（8ファイル）** ※ 2026-09-20 時点、`npx vitest run` 実行
- **未実施**: `npm run build` / `npm run test:e2e` / エビデンス取得 / staging プッシュ / main マージ

---

## ユーザーから受けている指示（重要）

1. **実作業は Sonnet 5 のサブエージェントに行わせる**こと。統括エージェントは敵対的レビューと報告に専念する。
2. **Antigravity（前任）がやった進捗は全て疑ってかかる**こと。主張を鵜呑みにせず自分で裏を取る。
3. **敵対的レビューで GO なら、main へマージして本番反映まで行ってよい**（承認取得済み）。NO-GO なら止めて報告する。
4. 後述の**スコープ拡大3件（B / C / D）も今回の反映に含める**こと。

---

## 完了済みの実装（すべて未コミットではなくコミット済み。本ファイルと同じコミットに含む）

### SEC-29 / Bug #48 — 下書き記事の url-map.json 混入防止（Issue #114）
- `scripts/organize-posts.mjs`: `matter(content, { language: 'yaml' })` を明示（gray-matter の組み込み javascript エンジン＝`eval` 相当の遮断）、`extractFrontmatter()` に `draft` を追加、urlMap 生成ループで `if (!fm || fm.draft) continue;`
- `public/admin/url-map.json`: 下書き2件を除外し公開5件のみ
- `tests/build.test.mjs`: 下書き非混入テスト＋**公開記事slugの網羅性テスト**（除外が過剰でないことの確認）

### SEC-30 / Bug #49 — `/*` と `/admin/*` のヘッダー重複排除（Issue #115）
- `public/_headers`: `/admin/*` から COOP / CORP / X-Frame-Options の再定義を削除し `/*` からの継承に一本化
- `/*` 側が既に `COOP: same-origin-allow-popups` / `CORP: same-site` / `XFO: SAMEORIGIN` を持つため**管理画面の実効値は不変**

### SEC-31 — OAuth ハンドシェイクの堅牢化（Issue #117 項目4）
- `functions/auth/callback.js`: `{ once: true }` を廃止。**オリジン検証と ack ペイロード完全一致検証（`event.data !== "authorizing:github"`）の両方を通過した場合にのみ** `removeEventListener`。30秒フェイルセーフタイマー追加

### SEC-32 — 画像正規化のビルド堅牢化（Issue #117 項目11）
- `scripts/normalize-images.mjs`: sharp 処理全体を try/catch で保護（壊れた画像1件でビルドを落とさない）、`lstat` 失敗も保護、`.rotate().toBuffer()` の**出力バッファ**にも `MAX_FILE_SIZE`（50MB）上限を適用し超過時は元ファイルを保持

### 既存テスト8件の修正（前任が壊したまま放置していたもの）
- `tests/build.test.mjs` 2件 ＋ `tests/fuzz-validation.test.mjs` 6件を、新設計（`/admin/*` では再定義せず `/*` から継承）の検証に書き換え
- `fuzz-validation.test.mjs:993` の空テスト1件もガード条件を撤廃して実効化

### ドキュメント（部分的に完了）
- `docs/DOCUMENTATION.md`: 1.4.2章に SEC-29〜32、1.5.4章トレーサビリティ、4.5章に Bug #48 / #49（5 Whys 付き）、4.5.1章に下書き画像の制限事項、改訂履歴 1.56 を追加
- `tests/TEST-REPORT.md`: 更新済み

---

## 検証済みの事実（再検証不要。根拠付きで確定している）

| 事実 | 根拠 |
|---|---|
| 本番 `/admin/` で COOP / CORP / XFO が**各2回送出**される。`/` は各1回 | `curl -sI https://reiwa.casa/admin/` および `https://reiwa.casa/` を独立に2回実測 |
| `/*` のヘッダーが `/admin/*` に**到達している**（だから重複する） | 同上 |
| Decap CMS の ack 実値は文字列 `"authorizing:github"` | 上流実装 `node_modules/decap-cms-lib-auth/dist/esm/netlify-auth.js:39` — 親は受信した `e.data` をそのままエコーバックする |
| ブランチ差分に PII なし。コミット author は `tbi <noreply@users.noreply.github.com>` のみ | 差分全体を氏名・メール・`/Users/` で grep |
| テストのセクション抽出は `^\/admin\/\*`（行頭アンカー＋`m`）で行われ、コメント行内の `/admin/*` を正しく除外する。**テストは空振りしていない** | `tests/fuzz-validation.test.mjs:898`, `tests/build.test.mjs:904` |

### 断定してはいけないこと
`/admin/` の COOP が**実際に `unsafe-none` にフォールバックしていた**とは**断定しない**こと。実測できたのは「重複送出されている」ところまでで、ブラウザ側の解決結果は未観測。実ブラウザで `https://reiwa.casa/admin/` を読み込んでも COOP のパースエラーはコンソールに出力されない（Chrome は出さない）。監査文書 `docs/security/audit-run2-needs-validation.md` 自身も「これは所見ではなくリード（lead）であり決定的事実は観測できていない」と明記している。Issue #114 の深刻度も **low**。過大評価しないこと。

---

## 前任作業（Antigravity / コミット `38205a0`）の検証結果

### 正しかった点（自分で裏を取った結果）
- PII サニタイズ、コミット author の扱い
- 本番ヘッダ重複の実測
- `image-optimize.mjs` に try/catch があるという比較
- `{ once: true }` の危険性と `event.data` 未検証という指摘

### 誤っていた／不足していた点
| # | 内容 | 対応状況 |
|---|---|---|
| 1 | **要件ID・バグ番号の二重使用**。SEC-27 / SEC-28 / Bug #46 / Bug #47 は既存の別要件・別バグに割当済みだった | SEC-29 / SEC-30 / Bug #48 / Bug #49 に採番し直し済み |
| 2 | **既存テスト8件を破壊したまま放置**。`_headers` 変更に既存テストが追従しておらず FAIL していた。前任は全件テストを回していなかった | 8件とも新設計に合わせて書き換え済み |
| 3 | 下書き除外テストが脆弱（「下書きが必ず存在する」前提＋部分一致判定） | 完全一致化・0件許容化＋網羅性テスト追加済み |
| 4 | ゾンビテスト（ガードにより素通りする空テスト）が旧設計を主張し続けていた | `fuzz-validation.test.mjs:993` は実効化済み。2件目（旧1054行、`if (globalVal && adminVal)`）も残作業1で実効化済み |
| 5 | `DOCUMENTATION.md` の「全622テストPASS」が事実でなくなっていた | 改訂履歴 1.56 で経緯とともに訂正済み |

---

## 残作業

### 1. 【完了】2件目の空テストを実効化（2026-09-20 再実測）
`tests/fuzz-validation.test.mjs` の `/* と /admin/* で同名ヘッダーが異なる値で重複していない（Bug #28 再発防止）` を、ガード `if (globalVal && adminVal)` を撤廃して書き換えた。

- `/admin/*` 定義ヘッダーが `/*` にもあるなら値の完全一致を `mismatches === []` で検証（expect を if で囲まない）
- 同名0件でも `expect(overlapping).toEqual([])` が必ず実行される
- COOP / CORP / X-Frame-Options が `/admin/*` に無いことを明示検証
- 同ファイルの `if (x && y) { expect }` は本箇所のみだった（grep で確認し全滅）

対象テスト: `npx vitest run tests/fuzz-validation.test.mjs tests/build.test.mjs` → **319 passed / 0 failed**

### 2. 【完了】CLAUDE.md のテスト件数更新（2026-09-20 再実測）
`npx vitest run` を再実行し **624 passed / 0 failed（8ファイル）** を正とした（前任の「624」は今回の実測と一致）。

- `CLAUDE.md:26` / `:111` — 622 → **624**
- `CLAUDE.md:248` — 610 → **624**（E2E 453件は未実測のため据え置き）
- `AGENTS.md` は `CLAUDE.md` へのシンボリックリンクのため、片方の更新で整合
- `tests/TEST-REPORT.md` の現行件数は既に 624 のため件数欄は未変更

### 3. 【未着手】スコープ拡大3件（ユーザー承認済み。今回の反映に含める）

いずれも**別トラックとして個別に検証可能な構成**にすること（1つが GO を出せなくても他は出荷できるように）。`package.json` / lockfile を共有する B と D は同一エージェント、C は別エージェント、**独立した git worktree で隔離して並列実行**する設計だった。

| トラック | 内容 | 根拠・注意点 |
|---|---|---|
| **B** | 未使用依存 `decap-cms-app` の削除 | `package.json:19` に production 依存として宣言（実解決 3.16.2）だが**どこからも import されていない**（Issue #117 項目13）。本番は CDN の `decap-cms@3.10.0` を読むため node_modules は出荷されない。`npm audit` の decap-cms 系警告の発生源。**削除前に必ず自分で全リポジトリを grep して未参照を確認すること**。安価・低リスク |
| **C** | 本番 decap-cms `3.10.0` → `3.16.2` | `public/admin/index.html:451` の CDN タグ。**SRI ハッシュ（`integrity="sha384-..."`）の再計算が必須**。`admin/index.html` は約1020行にわたり Decap の内部 DOM を直接操作するカスタマイズの塊で、**6マイナー分の更新で壊れる可能性が高い**。フル CMS E2E ＋ 3デバイスのエビデンスが必須 |
| **D** | Astro `5.18.2` → `7.3.3` | **2メジャー分**。`npm audit` で critical 1件（AVIF 経由 RCE / GHSA-26w7-cxv4-gfx2）、high 2件（Host header SSRF / slot name XSS）。ただし本サイトは `IMAGE_EXTENSIONS` を `.jpg/.jpeg/.png/.webp` に限定し **AVIF を受け付けない**ため critical の即時危険性は低い。Content Collections API / Integration API（`astro:build:done`）/ rehype プラグイン / `astro.config.mjs` の sitemap `filter`（FR-29 依存）/ ルーティング / Node 要件（CI・Cloudflare Pages）に破壊的変更が及ぶ。**現実的でなければ無理に進めず、Astro 6 までの到達可否と作業量見積りを報告して中断すること** |

補足: `sharp` は 0.35.4 が最新で、high 2件（libvips / libheif 継承脆弱性）は**上流に修正版が存在しない**。更新では解消できない。

### 4. 【未着手】GO 判定ゲート → staging → main → 本番

ユーザーからは「敵対的レビューで GO なら main へマージして本番反映」の承認を得ている。ただし **CLAUDE.md の staging 先行フローは省略できない**（ゲート6・7 は staging デプロイ後でないと測定不能）。

| # | ゲート | NO-GO 条件 |
|---|---|---|
| 1 | `npx vitest run` 全件 | FAIL が1件でもある |
| 2 | `npm run build` 完走 | ビルド失敗、または `public/images/uploads/` に意図しない差分 |
| 3 | ドキュメント整合 | 存在しないテスト名・要件IDが書かれている／トレーサビリティに未テストが残る |
| 4 | `npm run test:e2e`（3デバイス） | FAIL がある |
| 5 | **CMS 実ログインの実操作 E2E** | OAuth ハンドシェイク変更後にログインが通らない |
| 6 | staging 実測 | `curl -sI https://staging.reiwa.casa/admin/` で COOP/CORP/XFO の**重複が解消**し、値が `same-origin-allow-popups` / `same-site` / `SAMEORIGIN` のまま**変化していない** |
| 7 | PII 混入 | 差分に氏名・メール・ローカル絶対パスがある |

**ゲート5 が最大リスク**: `functions/auth/callback.js` は Cloudflare Functions 上でしか動かず、ローカルのモック E2E は「モックが正しい前提」を検証しているにすぎない。ack 実値は上流ソースで確定させたが、検証に使った `decap-cms-app` は 3.16.2、本番 CDN は `decap-cms@3.10.0` で**バージョンが異なる**。**staging.reiwa.casa で実際に GitHub ログインを通すところまでやらないと安全性は保証できない**（認証情報の入力はユーザーに依頼すること。エージェントが認証情報を入力してはならない）。

### 5. 【未着手】エビデンス取得
CLAUDE.md の定めにより、staging 検証時・main マージ前に `evidence/2026-09-20/` へスクリーンショット付き HTML レポートを作成する。**OAuth ハンドシェイク変更は CMS 関連のため、実操作 E2E ＋ 認証後 CMS 画面のスクリーンショット（3デバイス）が必須**。雛形は `evidence/2026-05-24/verify-comprehensive.mjs` を優先使用する。

### 6. 【未着手】Issue の処理
| Issue | 状態 | 対応 |
|---|---|---|
| #114 | open | SEC-29 / Bug #48 で修正済み。本番反映後にクローズ |
| #115 | open | SEC-30 / Bug #49 で修正済み。**staging / 本番で重複解消を実測してからクローズ**。「ブラウザでどう解決されるか」は未観測である旨をクローズコメントに明記すること |
| #116 | open | オーナーがダッシュボードで `npm ci` 使用を確認済み。クローズしてよい |
| #117 | open | 項目4・項目11 のみ対応済み。**残りの項目（1〜3, 5〜10, 12〜15）は未対応**。項目13（`decap-cms-app` 未使用）はトラック B で解消予定。対応済み項目にチェックを入れ、Issue は open のまま残す |

---

## 作業上の注意（実際に事故が起きかけた事項）

- **サブエージェントに `git stash` / `git stash pop` / `git checkout --` / `git restore` / `git reset` を絶対に使わせないこと**。本セッションで並列稼働中の2体が `git stash` を使用し、他エージェントの未コミット変更を巻き込む寸前だった（結果的に無事だったが再現性のない幸運）。並列作業させる場合は**担当ファイルを明示的に分離**するか、**`isolation: "worktree"` で隔離**する。
- サブエージェントには**必ず「前任の主張を鵜呑みにせず自分で裏を取れ」と明示する**こと。本セッションで発見した欠陥の大半は、この指示があったから出てきた。
- サブエージェントの「全テスト PASS」報告は**統括側で必ず再実行して確認する**こと。
- ドキュメントに**存在しないテスト名・要件IDを書かせない**こと（必ず実ファイルを grep させる）。

## 再開手順

```bash
git checkout fix/security-audit-run2
git pull origin fix/security-audit-run2
npx vitest run          # 624 passed であることを確認
```
