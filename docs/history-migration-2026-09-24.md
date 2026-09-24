# Git履歴・E2Eエビデンス移行候補の監査（2026-09-24）

## 状態

この文書は履歴書換えのリハーサルと2026-09-24の実行後確認を記録する。ユーザー承認と敵対的レビューGO後、25 headsをold-OID lease付き`git push --atomic`で更新し、exit 0・25件のforced updateを確認した。

## 凍結・バックアップ

| 項目 | 結果 |
| :--- | :--- |
| 凍結したGitHub refs | 143件（25 heads、0 tags、118 read-only pull refs） |
| live-ref比較 | 書換え直前にfreezeと一致。push直後に143/143 refsが候補期待値と一致 |
| open PR | push前0件。push後もopen PR 0件 |
| pre-rewrite bundle | 220,894,977 bytes、SHA-256 `9b11c7acb0ed918e48f6fa9bf4f4d26f91fcdbc3395af047b0023e59539f8e0b` |
| bundle検証 | 分割ファイルのDrive読戻しSHA、結合後SHA、`git bundle verify`、別bare repositoryのrefs復元が一致 |
| E2E証跡アーカイブ | 履歴全体1,518 path/blob pair・814 unique blobを監査。Drive移行分のZIP全体とpayloadをハッシュ照合し、全pairを復元検証 |

バックアップは本人専用Drive領域にあり、公開文書・公開索引にはDrive IDや共有URLを記録しない。新しい画像・動画・PDF・trace・ZIPと必須の`report.html` / `work-completion-report.html`は`.gitignore`で除外し、Driveを正本としてSHA-256読戻し確認後に索引へ登録する。検証JSON、source script、小さな非レポートHTMLはGitに保持する。過去日付のエビデンスを削除できるのはDrive読戻し・全件hash・復元・HTML相対参照・索引更新の全ゲートがPASSした後だけとする。

## エビデンス索引・分類

`evidence/archive-index.json` は1,519 entriesで、履歴1,518 pairにredacted JSONの新blobを加えたもの。entryは相対path、Git blob SHA-1、SHA-256、size、storage classだけで構成し、Drive ID・URL・個人情報を含めない。validatorは全entryのschema、hash形式、size、storage class、pair重複、path中のPII/URL/Drive ID様文字列と、absolute path・`.` / `..`・空segment・backslash・NULを検査する。

| 履歴分類 | path/blob pair | unique blob |
| :--- | ---: | ---: |
| Driveへ移行 | 1,395 | 694 |
| Gitに保持 | 123 | — |
| 合計 | 1,518 | 814 |

Drive移行対象blobはevidence外aliasが0件。22個のHTML blobを相対画像参照のある記録としてDrive対象へ含め、復元後のbroken相対参照は0件。Drive上にある既存758 pairは再コピーしない。

## 書換え候補の検証

| 項目 | 結果 |
| :--- | :--- |
| refs | heads 25件すべて同名で保持、tags 0件 |
| commit数 | 467 |
| Git整合性 | `git fsck` 成功 |
| Drive移行対象 | 694 unique blobすべてcandidateで到達不能 |
| e2e-results JSON | 個人情報を含む旧blobは到達不能。sanitized JSONの新blobを保持 |
| blob内容走査 | 1,082 reachable unique blob / 80,481,261 bytes。承認済みのemail・user path・氏名ルールの一致は各0 |
| author/committer | author: bickojima 199 / tbi 268、committer: bickojima 81 / tbi 386、other 0 |
| ツリー差分 | evidence移動と、`docs/qa-2026-09-23-open-issues.md`・`docs/security/audit-run2-report.md` の承認済みPII redactionのみ |
| `main` / `staging` | tree hash一致、記事・uploads・url-map差分0 |

GitHubの`refs/pull/*`は読み取り専用で候補から除外した。push後も118個の`refs/pull/*/head`が見え、旧OIDを指す参照が残る。これらは変更できず、heads更新だけでPR refsの旧履歴まで消えたとは扱わない。GitHub側の回収時期は未確認。

## テスト

- Vitest: 754/754 PASS。
- Playwright: 457 PASS、8 skip、465件。最初の非昇格起動はwebServerのlisten EPERMでテスト開始前に終了したため、失敗結果として数えず、許可されたローカルwebServer起動で全件再実行した。
- `CF_PAGES_BRANCH=main npm run build`: 20 pages、robots `Allow: /` と本番Sitemap、canonical/sitemapは本番host。
- `CF_PAGES_BRANCH=staging npm run build`: 20 pages、robots `Disallow: /`・Sitemap行なし、canonical/sitemapはstaging host。
- 両branch build: prebuild Vitest 625/625、CMS env JS生成、CMS `config.yml`にbranch/base_urlなし。
- `node scripts/validate-evidence-archive-index.mjs`: 1,519 entries PASS。
- GitHub Actions CI: rewritten `main` (`79116e1`) run 35950842406 SUCCESS、rewritten `staging` (`2a445cc`) run 35950844123 SUCCESS。
- fresh clone: この実行環境では `github.com` の名前解決に失敗し未実施。GitHub branch APIではmain/stagingのhead SHAを確認した。
- Pages post-rewrite live read-only checks: この実行環境では `reiwa.casa` と `staging.reiwa.casa` のDNS解決に失敗し未実施。事前の同一アプリtreeでの環境別build検証は上記の通り。live post-rewrite反映の独立確認が残る。

## 実行手順と停止条件

1. 完了。書換え直前にlive refs mapとfreezeの一致、open PR 0件を確認した。
2. 完了。25 headsの旧OIDをleaseへ明記し、候補OIDでatomic更新した。`--mirror`は使用していない。
3. 完了。push後の25 headsを含む143 refsが候補期待値と一致。main/staging treeも一致し、tagsは0件。PR refs 118件は残存。
4. Actions CIは両branchで成功。fresh cloneとPages live再確認はDNS制限で未実施のため、残件としてstaging/main配信確認を依頼する。
5. atomic pushは成功。事前バックアップbundleと別bare restore検証を保持する。
