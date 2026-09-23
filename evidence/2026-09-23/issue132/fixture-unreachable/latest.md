# npm管理外依存 鮮度・EOL チェック結果

- 判定時刻: 2026-09-23T05:00:00.000Z（リモート: fixture）
- 総合: **ERROR**
- 閾値: EOL warning 90日前 / alert 30日前、CDN 3マイナー遅れで alert、手動確認 92日ごと

| 状態 | 分類 | 名称 | 現在 | 最新 | 固定方法 | 箇所 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| UNKNOWN | cdn | decap-cms | 3.16.2 | - | version + SRI(sha384) | public/admin/index.html:451 |
| UNKNOWN | github-actions | actions/checkout | v4.4.0 | - | commit SHA | .github/workflows/ci.yml:19 |
| UNKNOWN | github-actions | actions/setup-node | v4.4.0 | - | commit SHA | .github/workflows/ci.yml:22 |
| UNKNOWN | github-actions | actions/checkout | v7.0.1 | - | commit SHA | .github/workflows/dependency-freshness.yml:30 |
| UNKNOWN | github-actions | actions/setup-node | v7.0.0 | - | commit SHA | .github/workflows/dependency-freshness.yml:35 |
| UNKNOWN | github-actions | actions/upload-artifact | v7.0.1 | - | commit SHA | .github/workflows/dependency-freshness.yml:51 |
| UNKNOWN | github-actions | actions/download-artifact | v8.0.1 | - | commit SHA | .github/workflows/dependency-freshness.yml:71 |
| UNKNOWN | runtime | Node.js | .nvmrc=22.12.0, package.json#engines.node=>=22.12.0, .github/workflows/ci.yml:24=22, .github/workflows/dependency-freshness.yml:37=.nvmrc | - | .nvmrc（Pages/ローカル）・engines・CI node-version | .nvmrc, package.json#engines.node, .github/workflows/ci.yml:24, .github/workflows/dependency-freshness.yml:37 |
| WARNING | manual | Cloudflare Pages ビルドイメージ・環境変数 NODE_VERSION | Build command `npm run build`、Build output `dist`、Production branch `main`（2026-09-23 ダッシュボードで確認）。ビルドイメージのバージョンと NODE_VERSION は未確認（設計書 2.5.1章の記載値は v3） | - | ダッシュボード設定（API 未連携） | scripts/dependency-freshness.config.json |

## 要確認
- [unknown] decap-cms（public/admin/index.html:451）: CDN 実体の取得に失敗: fixture: getaddrinfo ENOTFOUND
- [unknown] decap-cms（public/admin/index.html:451）: npm registry 取得失敗: fixture: getaddrinfo ENOTFOUND
- [unknown] decap-cms（public/admin/index.html:451）: 脆弱性情報の取得失敗: fixture: getaddrinfo ENOTFOUND
- [unknown] actions/checkout（.github/workflows/ci.yml:19）: 最新リリース取得失敗: fixture: HTTP 403
- [unknown] actions/setup-node（.github/workflows/ci.yml:22）: 最新リリース取得失敗: fixture: HTTP 403
- [unknown] actions/checkout（.github/workflows/dependency-freshness.yml:30）: 最新リリース取得失敗: fixture: HTTP 403
- [unknown] actions/setup-node（.github/workflows/dependency-freshness.yml:35）: 最新リリース取得失敗: fixture: HTTP 403
- [unknown] actions/upload-artifact（.github/workflows/dependency-freshness.yml:51）: 最新リリース取得失敗: fixture: HTTP 403
- [unknown] actions/download-artifact（.github/workflows/dependency-freshness.yml:71）: 最新リリース取得失敗: fixture: HTTP 403
- [unknown] Node.js（.nvmrc, package.json#engines.node, .github/workflows/ci.yml:24, .github/workflows/dependency-freshness.yml:37）: endoflife.date 取得失敗: fixture: getaddrinfo ENOTFOUND
- [warning] Cloudflare Pages ビルドイメージ・環境変数 NODE_VERSION（scripts/dependency-freshness.config.json）: 未確認の項目が残っている: ビルドイメージ（Build system version）、環境変数 NODE_VERSION の有無・値

対応手順: docs/DOCUMENTATION.md 4.11章
