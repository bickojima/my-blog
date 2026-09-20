# セキュリティ監査 run-2 対応 引き継ぎメモ（第2版 / 2026-09-20）

> 第1版（Antigravity による中断時メモ）は本ファイルを全面改訂したもので置き換えた。第1版の内容は
> git 履歴（コミット `38205a0`）から参照できる。**第1版の記述には誤りが含まれていたため、本ファイルの
> 記述を正とすること**（誤りの詳細は「前任作業の検証結果」章）。

## 状態サマリー

- **作業ブランチ**: `fix/security-audit-run2`
- **ベース**: `origin/staging`（`b5a42a3`）
- **中断理由**: ユーザー指示による作業停止・別エージェントへの引き継ぎ
- **Vitest 実測**: **634 passed / 0 failed（8ファイル）** ※ Bug #50 再発防止テスト追加後
- **未実施**: ローカル E2E 全件（実行中） / エビデンス `evidence/2026-09-20/` / 本ファイルの完了化

---

## ユーザーから受けている指示（重要）

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

### 3. 【完了】スコープ拡大3件（B 未使用依存削除 / C CDN 3.16.2 / D Astro 7.3.3）

本番反映済み。詳細は DOCUMENTATION.md 改訂履歴 1.57〜1.59。

### 4. 【完了】GO 判定ゲート → staging → main → 本番

本番反映済み（PR #118 → staging → main）。ただし **ローカル E2E 全件は本番マージ時点で未完了だった（Bug #50）**。再発防止として 4.6章を必須化し、**CI に Playwright は載せない**。

ゲート1〜3・5〜7はマージ前に実施済み。ゲート4（`npm run test:e2e` 3デバイス全件）はマージ後の事後実行。

### 5. 【進行中】エビデンス取得 + ローカル E2E 全件

`evidence/2026-09-20/` へスクリーンショット付き HTML レポートを作成する。雛形は `evidence/2026-05-24/verify-comprehensive.mjs`。**main マージ後の事後実行であり、本来はマージ前必須（Bug #50）**。

### 6. 【一部完了】Issue の処理
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
