# Issue #153の続き（Bug #55）QA — Cloudflare Pages の Node.js ビルド失敗

PR #157（Decap CMS 3.16.3 / Node.js 22.23.3 更新）を staging へマージした後、Cloudflare Pages の staging ビルドが以下のログで失敗した。

```
Detected the following tools from environment: nodejs@22.23.3, npm@10.9.2
Installing nodejs 22.23.3
node-build: definition not found: 22.23.3
CFPAGESLOG:ASDF_RETRY: nodejs 22.23.3 not found in image, updating plugin and retrying...
node-build: definition not found: 22.23.3
Failed: build command exited with code: 1
```

| 質問 | 決定 | 根拠 |
|---|---|---|
| `.nvmrc`・`engines` の戻し先バージョン | 22.23.2（2026-07-28公開） | `https://github.com/nodenv/node-build/tree/master/share/node-build/22.23.2` が200、`22.23.3` は404であることを実測で確認。22.23.3が使えるようになるまで暫定的に1つ前の定義済みパッチへ据え置く |
| Decap CMS のバージョン | 3.16.3のまま変更しない | 今回の障害はNode.jsのバージョンに起因し、Decap CMSとは無関係。Issue #153で既に検証済み |
| CIのNode指定 | `node-version: '22'` を維持 | setup-nodeは22系の最新パッチを選ぶため影響を受けない。Cloudflare Pagesの`.nvmrc`のみが影響対象 |
| 再発防止の方式 | SEC-40依存鮮度チェックに猶予期間（`nodePatchGraceDays`、既定14日）を追加 | Node.js公式リリース直後はCloudflare Pagesのnode-build (asdf)がまだ対応していないことがあるため、「最新パッチに追従すべき」という機械判定が誤ったタイミングで追従を促さないようにする。endoflife.dateの`latest.date`（パッチ公開日）を使って猶予内かどうかを判定する |
| 判定ロジックの動作 | 猶予期間内: `NODE_PATCH_BEHIND`（warning）ではなく`NODE_PATCH_TOO_NEW`（ok、情報記録のみ）。猶予期間超過、または公開日が取得できない場合: 従来どおり`NODE_PATCH_BEHIND`（warning） | 猶予は「追従を止める」ためではなく「追従を急かさない」ためのものなので、猶予が切れれば通常どおり警告に戻る。公開日が取得できないケース（endoflife.dateの応答形式変化等）では安全側に倒し、猶予を適用しない |
| テスト方式 | `tests/dependency-freshness.test.mjs`にフィクスチャ固定日付のテストを3件追加（猶予内/猶予超過/公開日未取得）。ネットワークには一切出ない | 既存方針（`npm test`をネットワーク非依存に保つ、SEC-40）を踏襲 |
| Cloudflare Pagesの`NODE_VERSION`環境変数 | 未設定（`.nvmrc`の値を使用）と確認 | 2026-09-24のビルド失敗ログに`Build environment variables: (none found)`とあり判明。`scripts/dependency-freshness.config.json`の手動確認項目に記録 |
| Cloudflare PagesのBuild system version | 未確認のまま（Issue #154で継続） | ダッシュボード認証が得られず、本タスクの範囲外。ローカルからの推測はしない |
| `.nvmrc`更新の運用手順 | 更新前にnode-buildの該当パッチ定義の存在を確認する手順をDOCUMENTATION.md 4.11.5章に明記 | 同種の障害の再発防止。`curl -s -o /dev/null -w '%{http_code}' https://raw.githubusercontent.com/nodenv/node-build/master/share/node-build/<version>`が200であることを確認してから`.nvmrc`を書き換える |

## 動作確認

- `CF_PAGES_BRANCH=staging npm test`、`CF_PAGES_BRANCH=main npm test`: 両方765/765 PASS（ローカル Node.js 22.23.2、`nvm install 22.23.2` で用意。Homebrew node が壊れていたため nvm 経由）
- `npm run build`: 成功（vitest run 636 PASS → normalize-images → organize-posts → astro build → image-optimize、20ページビルド）
- `.nvmrc`の対象パッチ（22.23.2）がnode-buildに存在すること: `curl`で200を実測確認
- staging PR の CI（`test-and-build`、SEC-42 identity gate含む）通過後、Cloudflare Pages の staging ビルドが成功し、`https://staging.reiwa.casa/admin/` に `decap-cms@3.16.3` と SRI が存在すること、トップページが200を返すことを確認（本ドキュメント作成時点ではPRマージ・デプロイ待ち。結果はIssue #153のコメントおよびPR説明に記録する）
