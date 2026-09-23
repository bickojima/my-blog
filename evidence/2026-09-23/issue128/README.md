# Issue #128 実証: Cloudflare Pages のテストゲート（ローカル）

- 実施日: 2026-09-23
- ブランチ: `docs/issue-128-pages-test-gate`（`origin/staging` fc4fb3b（PR #135 マージ後）へ rebase して再実行）
- スクリプト: `verify-pages-test-gate.mjs`
- 結果JSON: `pages-test-gate-results.json`

## 前提（Cloudflare ダッシュボードで確認済み: 2026-09-23）

| 項目 | 値 |
| :--- | :--- |
| Build command | `npm run build` |
| Build output | `dist` |
| Production branch | `main` |
| Automatic deployments | Enabled |

`npm run build` = `vitest run --exclude tests/build.test.mjs && normalize-images && organize-posts && astro build`。
`&&` 連結のため、Vitest が失敗すると後続の `astro build` は実行されず、Pages のビルドは失敗扱いになりデプロイされない。

## 結果

| ケース | 条件 | Vitest | 終了コード | astro build ログ | dist | 判定 |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| C1 | 通常ビルド | 554 passed | 0 | あり | あり | PASS |
| C2 | 一時的な失敗テスト `tests/zz-intentional-fail.test.mjs` を配置 | 1 failed / 554 passed | 1 | なし | なし | PASS |
| C3 | C2 + `CF_PAGES_BRANCH=staging` | 1 failed / 557 passed | 1 | なし | なし | PASS |

- 各ケースの実行前に `dist` を削除している。
- C3 で passed が3件多いのは、SEC-35（Bug #51 再発防止）が `CF_PAGES_BRANCH` からブランチを staging と判定し、実ブランチ用のテストを登録したため。Pages 上でもこの判定が有効になる。
- 一時ファイルはスクリプト内で削除済み（`tempFileRemoved: true`）。

## 残余リスク

- `tests/build.test.mjs` は `npm run build` から除外されている（内部で `build:raw` を実行するため再帰を避ける）。このため build.test.mjs の失敗は Pages のデプロイを止めず、GitHub Actions CI でのみ検出される。
- staging への意図的な失敗コミットによる実環境での実証は、ユーザー判断により実施しない。
