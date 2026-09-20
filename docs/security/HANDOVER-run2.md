# セキュリティ監査 run-2 対応 中断引き継ぎメモ (2026-09-20)

## 概要

本ドキュメントは、セキュリティ監査 run-2 に伴う脆弱性対応・Issue対応の作業中断に伴う引き継ぎメモです。
エージェント間連携ルール（共通グローバルルール11）に基づき、敵対的サブエージェント（Red Team）のレビュー結果、実装完了項目、残作業、再開手順を記録します。

---

## 状態サマリー

- **作業ブランチ**: `fix/security-audit-run2`（リモートに push 済み）
- **ベースコミット**: `origin/staging` (`b5a42a3`)
- **中断理由**: ユーザー指示による一時中断

---

## 完了した作業

### 1. 監査 run-2 成果物の取り込みと個人情報（PII）排除
- `origin/audit/security-run2` から以下のドキュメント・設定を取り込み完了：
  - `docs/security/audit-run2-findings-detail.md`
  - `docs/security/audit-run2-needs-validation.md`
  - `docs/security/audit-run2-report.md`
  - `skills-lock.json`
- **PII サニタイズ**: `docs/security/audit-run2-report.md` 7行目のローカル絶対パス（`/Users/...`）を `bickojima/my-blog` に置換・除去（CLAUDE.md 第9項準拠）。

### 2. Issue #114（url-map.json 下書き記事漏洩）の修正
- `scripts/organize-posts.mjs`:
  - `gray-matter` のフロントマター解析で `{ language: 'yaml' }` を明示（eval 実行穴の遮断）。
  - `extractFrontmatter()` で `draft: data.draft === true` を抽出。
  - `urlMap` 生成ループで `if (!fm || fm.draft) continue;` を適用。
  - ⚠️ ファイル整理（mover）ループは変更せず、下書き記事も日付ディレクトリへ移動する挙動を維持。
- `public/admin/url-map.json`:
  - 再生成により下書き記事 2 件（`2026/01/過去記事`, `2026/02/codeblockテスト`）が除外され、公開記事 5 件のみに更新。
- `tests/build.test.mjs`:
  - 下書き記事が `url-map.json` に含まれないことを検証する回帰テスト（SEC-27, Bug #46 再発防止）を追加。

### 3. Issue #115（/admin/* COOP/CORP 重複ヘッダ）の修正
- 本番実測（`curl -sI https://reiwa.casa/admin/`）により、Cloudflare Pages が `/*` と `/admin/*` の両方から同一ヘッダを append し、重複出力されていることを確認。RFC 8941 Structured Header（COOP）が構文エラーで `unsafe-none` にフォールバックする脆弱性リスクを特定。
- `public/_headers`:
  - `/admin/*` から `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`, `X-Frame-Options` を削除（`/*` から継承されるため 1 回のみ出力される）。
  - 将来公開サイトの COOP を `same-origin` に引き上げる際の分離要件（Decap CMS の OAuth ポップアップ要件）をコメントに明記。
- `tests/build.test.mjs`:
  - `/*` と `/admin/*` で同名ヘッダーが一切重複していないことを検証する回帰テスト（SEC-28, Bug #47 再発防止）を追加。

---

## 敵対的サブエージェント（Red Team）レビューの主要指摘（要引き継ぎ）

再開時に考慮すべき重要な知見：

1. **`functions/auth/callback.js` の `event.data` 未検証欠陥（致命的）**:
   - Issue #117 項目4（`{ once: true }` 解除）を行う際は、単にオリジン検証だけでなく、**`if (event.data !== "authorizing:github") return;` による Decap CMS プロトコル完全一致検証を必須とする**こと。
   - これがないと、同一オリジンの別用途 `postMessage`（拡張機能やツール等）で認証完了が誤爆し、ログインが永久ハングする。
2. **`url-map.json` の位置づけ（重要）**:
   - `admin/index.html` の `showPublicUrl()` は URL ハッシュと DOM 入力から直接 URL を生成しており、`url-map.json` は fetch されていない死霊成果物（Ghost Artifact）。
   - 今回は既存要件（FR-10）との互換性維持のため下書き除外を行ったが、将来的には完全廃止の検討余地あり。
3. **下書き添付画像の公開制限（重要）**:
   - `url-map.json` から slug を消しても、下書き記事に挿入されたアップロード画像は `public/images/uploads/` に保存され、Astro ビルドで無条件公開される。
   - 静的ホスティング（Decap CMS）の仕様上の制限事項として `DOCUMENTATION.md` に明記が必要。

---

## 残作業一覧（再開時ステップ）

| # | タスク | 対象ファイル / 場所 | 備考 |
|---|---|---|---|
| 1 | **Issue #117 項目4 対応** | `functions/auth/callback.js` | `{ once: true }` 削除、`handleMessage` で `event.data !== "authorizing:github"` 検証、30秒タイムアウト |
| 2 | **Issue #117 項目11 対応** | `scripts/normalize-images.mjs` | 画像処理の try/catch 保護、回転後バッファサイズ上限チェック |
| 3 | **Issue #116 のクローズ** | GitHub Issue #116 | ユーザー確認結果（Pages ダッシュボードで `npm ci` 確認済み）をコメントしクローズ |
| 4 | **テスト全件実行** | `npm test`, `npm run build`, `npm run test:e2e` | Vitest / ビルド / E2E の全 PASS 確認 |
| 5 | **ドキュメント更新** | `docs/DOCUMENTATION.md`, `tests/TEST-REPORT.md`, `CLAUDE.md`, `AGENTS.md` | 要件追加（SEC-27, SEC-28, SEC-29）、バグ一覧（Bug #46, #47, #48）、テスト件数カウンター更新 |
| 6 | **敵対的レビュー（再検証）** | 敵対的サブエージェント | 実装全体の最終レビューで「GO」を取得 |
| 7 | **staging マージ & 本番反映** | git / GitHub | staging へ push → 動作確認（`curl -sI`） → main へマージ |

---

## 再開手順コマンド例

```bash
# 作業ブランチのチェックアウト
git checkout fix/security-audit-run2
git pull origin fix/security-audit-run2

# 現状のテスト確認
npm test
```
