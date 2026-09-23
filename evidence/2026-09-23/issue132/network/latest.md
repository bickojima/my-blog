# npm管理外依存 鮮度・EOL チェック結果

- 判定時刻: 2026-09-23T05:36:49.686Z（リモート: network）
- 総合: **WARNING**
- 閾値: EOL warning 90日前 / alert 30日前、CDN 3マイナー遅れで alert、手動確認 92日ごと

| 状態 | 分類 | 名称 | 現在 | 最新 | 固定方法 | 箇所 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| WARNING | cdn | decap-cms | 3.16.2 | 3.16.3 | version + SRI(sha384) | public/admin/index.html:451 |
| WARNING | github-actions | actions/checkout | v4.4.0 | v7.0.1 | commit SHA | .github/workflows/ci.yml:19 |
| WARNING | github-actions | actions/setup-node | v4.4.0 | v7.0.0 | commit SHA | .github/workflows/ci.yml:22 |
| OK | github-actions | actions/checkout | v7.0.1 | v7.0.1 | commit SHA | .github/workflows/dependency-freshness.yml:30 |
| OK | github-actions | actions/setup-node | v7.0.0 | v7.0.0 | commit SHA | .github/workflows/dependency-freshness.yml:35 |
| OK | github-actions | actions/upload-artifact | v7.0.1 | v7.0.1 | commit SHA | .github/workflows/dependency-freshness.yml:51 |
| OK | github-actions | actions/download-artifact | v8.0.1 | v8.0.1 | commit SHA | .github/workflows/dependency-freshness.yml:71 |
| WARNING | runtime | Node.js | .nvmrc=22.12.0, package.json#engines.node=>=22.12.0, .github/workflows/ci.yml:24=22, .github/workflows/dependency-freshness.yml:37=.nvmrc | 22.23.2 | .nvmrc（Pages/ローカル）・engines・CI node-version | .nvmrc, package.json#engines.node, .github/workflows/ci.yml:24, .github/workflows/dependency-freshness.yml:37 |
| WARNING | manual | Cloudflare Pages ビルドイメージ・環境変数 NODE_VERSION | Build command `npm run build`、Build output `dist`、Production branch `main`（2026-09-23 ダッシュボードで確認）。ビルドイメージのバージョンと NODE_VERSION は未確認（設計書 2.5.1章の記載値は v3） | - | ダッシュボード設定（API 未連携） | scripts/dependency-freshness.config.json |

## 要確認
- [warning] decap-cms（public/admin/index.html:451）: 更新あり（3.16.2 → 3.16.3）
- [warning] actions/checkout（.github/workflows/ci.yml:19）: メジャー更新あり（v4.4.0 → v7.0.1）。Dependabot PR で追従する
- [warning] actions/setup-node（.github/workflows/ci.yml:22）: メジャー更新あり（v4.4.0 → v7.0.0）。Dependabot PR で追従する
- [warning] Node.js（.nvmrc, package.json#engines.node, .github/workflows/ci.yml:24, .github/workflows/dependency-freshness.yml:37）: .nvmrc の固定版 22.12.0 は 22 系最新 22.23.2 より古い（セキュリティリリース未適用の可能性。Cloudflare Pages は .nvmrc を使う）
- [warning] Cloudflare Pages ビルドイメージ・環境変数 NODE_VERSION（scripts/dependency-freshness.config.json）: 未確認の項目が残っている: ビルドイメージ（Build system version）、環境変数 NODE_VERSION の有無・値

対応手順: docs/DOCUMENTATION.md 4.11章
