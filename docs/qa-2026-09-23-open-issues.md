# Open Issue 整理 要件定義・QA履歴

作成日: 2026-09-23
対象: `bickojima/my-blog` の open issue #81, #90, #95, #117, #127〜#132
状態: **要件定義確定・実作業中（Q6〜Q9・Q13〜Q17を反映）。#81・#129はクローズ済み。#117（PR #135）・#128（PR #137）はstaging反映済み。#127/#130はPR #143でstagingへ反映し、staging配信の環境値確認、実ホストCMS 78/78、包括E2E各端末50/50（計150/150）を確認済み。包括E2Eの「150シナリオ×3デバイス」は文書誤記として50シナリオ×3デバイス=150検証へ訂正。Cloudflare API認証がなくdeploy commit metadataは未確認。現在main向け初回統合候補を隔離ブランチで検証中、mainマージは未実施。#132は実装済み、workflow_dispatch検証待ち。#90/#131の履歴書換えは他issue完了・main反映・open PRゼロの後に凍結して実施する。**

## 1. 目的と完了条件

open issue全10件のクローズを目指す。issueごとに対応完了または対応不要の根拠を整え、クローズ受入条件を満たす。外部判断や検証が残るissueは根拠なく閉じず、未達として明示する。

対応不要または対応済みのissueは根拠と範囲を記録してクローズする。対応が必要なissueは実装・検証・関連ドキュメント更新を行い、完了根拠を記録してクローズする。判断・外部確認が残る場合は、そのissueをクローズせず未達として次に必要な判断・検証を記録する。

issueは全部で10件。全件を対象とし、判断根拠を曖昧にしたまま閉じない。環境・履歴・Driveに関わる破壊的または外部状態の操作は、対象と影響を特定してから実施する。

## 2. QA履歴

確認済みの回答は実装要件として扱う。未決は実装前に一問一答で確認する。

| ID | 確認事項 | 回答・決定 | 状態 |
|---|---|---|---|
| Q1 | 今回の整理対象は一部のissueか、現在のopen issue全件か | 現在のopen issue全件。GitHub上で確認した10件を対象にする | 確認済み |
| Q2 | Issue #131は過去コミットのauthor書換えを計画するか | 全GitHub heads・tagsを対象に履歴を書き換え、authorを `tbi <noreply@users.noreply.github.com>` にする。旧cloneの再同期と旧リンク失効を受容する。GitHub管理PR refs/cacheの旧データ残存は受容し、完全削除とは表現しない | 確認済み |
| Q3 | Issue #90のDrive移行範囲と保存先はどうするか | 過去分を含む重いメディアと画像埋込HTMLを本人専用Google Driveへ移す。Drive証跡は本人のみ閲覧可能とする。Gitには検証スクリプト、結果JSON、ハッシュ索引を残す | 確認済み |
| Q4 | Issue #90で現行ファイルだけでなく過去Git履歴も縮小するか | 現行版と全GitHub heads・tagsの過去履歴から大容量evidenceを除去し、repo全体容量を縮小する。#131のauthor履歴書換えと一体計画にする。旧clone再同期と旧リンク失効を受容する。GitHub管理PR refs/cacheに残る旧データは受容し、完全削除とは表現しない | 確認済み |
| Q5 | Issue #117の未対応hardening各項目を実装するか、対応不要とするか | 各項目を調査し、効果があるものは実装・検証する。効果が乏しいものは理由を記録して対応不要と判断する | 確認済み |
| Q6 | Issue #127の環境値を導出する方式 | 「環境値を自動導出」に確定。`SITE_URL` とrobotsはビルド時に `CF_PAGES_BRANCH` から、CMSの `branch` と `base_url` は実行時にホスト名とoriginから導出する。安全側の既定値はrobots=`Disallow`、CMS=staging。`.gitattributes merge=ours` は実験で失敗したため不採用 | 確認済み |
| Q7 | Issue #128でCI失敗時にPagesデプロイを止める方式 | Cloudflare PagesのBuild commandは既に `npm run build`（Vitestゲート付き）であることをダッシュボードで確認した。Issueの前提（CIとPagesが独立でテストなしにdeployされる）は誤り。stagingに意図的な失敗コミットを入れる実証は不要（ユーザー判断）とし、ローカル実証（PR #137）で代える。保証範囲は `npm run build` が実行するVitestに限る。`build.test.mjs` はPagesデプロイゲート外であり、CI失敗全般の停止を意味しない | 確認済み |
| Q8 | Issue #129で `verify-security.mjs` とVitestの責務をどう分けるか | PR #133で対応済み（`verify-security.mjs` はSEC01〜SEC10の証跡取得用、全SEC要件の網羅性はDOCUMENTATION 1.5.4章と各Vitestを正本とする）。Issueはクローズ済み | 確認済み |
| Q9 | Issue #130のAnalytics CSPエラー | CSPは緩和しない（`static.cloudflareinsights.com` を許可リストへ追加しない）。production/staging実ホストでOAuth/GitHub APIをモックし、PC/iPad/iPhoneから編集・入力・preview・保存要求を実操作。保存先branchはmain/stagingで、実書込なし。54/54 PASS（RP18+RS18+LA6+LB6+R6）。production/staging実ホストはPC/iPad/iPhone各端末で操作、ローカル操作はPCのみ。非Insights CSP違反・機能エラーなし。従前のローカルiPad/iPhone証跡は `evidence/2026-09-23/issue130/` に別保存。証跡 `evidence/2026-09-23/issue130-review/` | 確認済み（限定された操作範囲） |
| Q10 | Issue #132のnpm管理外依存の鮮度・EOL確認方式 | `playwright-home` と同様の運用モデルを使う。週次ジョブ、機械可読な最新結果、正常終了と劣化状態の分離、既存監視による通知を参考にし、my-blogに実在する依存だけを対象とする | 確認済み（my-blog向け対象・実行環境は要設計） |
| Q11 | Issue #95の次フェーズ機能を実装するか | 必須でなければ対応不要とする。公開記事は5件で、アーカイブ・タグ・ダークモードが既にある。候補機能はいずれも現時点で必須でないため実装しない。#81/#90完了後、issueへ判断理由を記録して対応不要として閉じる | 確認済み |
| Q12 | GitHub管理 `refs/pull/*` が保持する旧履歴・evidenceをどう扱うか | GitHub Supportへの削除依頼は不要。全heads/tagsの履歴書換えを進め、read-onlyのPR refsとGitHub cached viewsに旧データが残ることを受容する。完全削除とは表現しない | 確認済み |
| Q13 | Issue #131で過去履歴のファイル本文に含まれる個人識別情報をどう扱うか | 過去履歴のファイル本文にある個人識別情報（5件）も、author書換えと同じ履歴書換えで伏せ字にする（案B） | 確認済み |
| Q14 | Issue #131でGitHub noreply形式のauthor「bickojima」を書き換えるか | 据え置く。公開ハンドルであり個人識別情報に当たらないため | 確認済み |
| Q15 | Issue #90/#131の履歴書換えをいつ実施するか | 他issueの完了・main反映・open PRゼロの後に、作業を凍結して実施する | 確認済み |
| Q16 | Issue #90/#131でPR refsに残る旧データの規模を踏まえても受容するか | PR refs（104本、旧コミット89件分）に個人識別情報と旧evidenceが残ることを、規模を把握したうえで受容する（Q12を維持）。「完全削除」とは表現しない | 確認済み |
| Q17 | stagingにpush済みだった本文書の個人識別情報をどう扱うか | PR #136で現行ファイルから除去した。履歴からはQ13の書換えで除去する | 対応済み |

## 3. Issue別要件とクローズ条件

「暫定処理」は現時点の証拠に基づく分類で、最終クローズ指示ではない。

| Issue | 要件・現時点の証拠 | 暫定処理 | クローズ受入条件 |
|---|---|---|---|
| [#81 公開準備: robots.txt / site / canonical](https://github.com/bickojima/my-blog/issues/81) | 2026-09-23 live GETで本番・stagingのsitemap indexと子sitemapが200、双方17 URL。掲載全ページでcanonicalが自身のURLと一致。本番robotsは `Allow: /` と正しいsitemap、stagingは `Disallow: /`。Python既定UAでsitemap-0が403、標準ブラウザUAでは200。 | 2026-09-23に証拠コメントを付け、`completed` でクローズ済み | 完了。Issue #81へGET結果・UA差を記録し、live条件に基づいてclose済み |
| [#90 evidence肥大化](https://github.com/bickojima/my-blog/issues/90) | 最新GitHub mirrorではreachable evidence blobが528個・約166.7MB（ユニークblob内容の合計）。全ref reachable blobは約240.1MB、packは182.3MiB。103本のGitHub管理PR refsもmirrorに存在する。旧checkoutのworking-tree計測134MBは古い。README、CLAUDE、設計書、テスト報告、QA記録がパスや再利用手順を参照。古い証跡の上書き・削除を禁止するルールがある。 | 過去分を含む重いメディアと画像埋込HTMLを本人専用Driveへ移す。現行ファイルと全書換え可能refsの過去履歴から大容量evidenceを除去し、repo全体容量を縮小する。Gitにはスクリプト・結果JSON・ハッシュ索引を残す。hidden PR refsの残存は受容済み（Q12/Q16）。履歴書換えは他issue完了・main反映・open PRゼロ後に凍結して実施（Q15） | 全証跡の移行先対応表・Drive権限・SHA-256索引を作成。**Driveへコピーし、全ファイルのハッシュ一致と復元を確認するまでGit側の現行証跡を削除しない。** 例外的削除の条件、新正本、保持・復旧ルールをCLAUDE/DOCUMENTATION等へ反映する。GitHub公開repoからprivate Driveの証跡を直接読めないことを明記し、公開文書に載せるDrive参照の形式・アクセス条件・共有リンクを発行しない方針を決める。全heads/tags/PR/clone/リンクの影響を調査し、#131と統合した履歴書換え計画をレビュー後、repo容量縮小を検証。GitHub管理PR refs・キャッシュに残る証跡と容量縮小の限界について、ユーザーが残余を受容するか明示する |
| [#95 個人ブログ化の次フェーズ](https://github.com/bickojima/my-blog/issues/95) | #81/#90後の次段階実装を希望。Issue本文はコンテンツ充実・デザイン個人化・運用ルーチンを例示するだけ。公開記事は5件で、アーカイブ・タグ・ダークモードが既にある。 | 対応不要候補。必須機能が特定されず、現状のサイト規模・機能で候補はいずれも必須でないとのユーザー判断により実装しない | #81/#90完了後、issueに候補を実装しない理由と現状の機能・記事規模を記録し、対応不要としてクローズする |
| [#117 run-2 hardening項目](https://github.com/bickojima/my-blog/issues/117) | issueコメントと `docs/security/HANDOVER-run2.md` に進捗あり。コメント上、項目1,2,4,11,12,13は対応済み。項目3,5〜10,14,15は未対応候補。いずれも脆弱性とは判定されていない。 | PR #135でstaging反映済み（項目別の判定は `docs/security/issue-117-hardening-decisions.md`）。項目15は#127へ移管 | 各項目の現状を最新main・stagingで照合。実装する項目は試験・文書化し、対応不要項目は効果が乏しいとした根拠・残余リスクを記録。子issueとの重複を解消し、親issueを閉じる範囲を明記 |
| [#127 環境固有ファイルのmerge汚染](https://github.com/bickojima/my-blog/issues/127) | issueはBug #51を報告。PR #125/#126本文はSEC-35テスト、main復元、staging検証を報告する一方、両方向merge時の予防策は未確定。ローカルremote refsでもmain/stagingの3ファイル差分を確認。 | 実装済み・PR作成前レビュー待ち（branch `codex/issue-127-derived-env`、Q6）。ローカル両方向merge rehearsal、3環境ビルド、全Vitest/E2E PASS | staging→main / main→staging双方の試行で3ファイルが正しい環境値を保つ。feature/PRで誤検知・開発阻害がない。staging反映後に実配信 robots/canonical/CMS設定を確認 |
| [#128 CI失敗でPages deployを止める](https://github.com/bickojima/my-blog/issues/128) | CI全失敗ではなく、Pages build command `npm run build` 内のVitest失敗を反映しないことが対象。`build.test.mjs` はPagesコマンドのゲート外。 | PR #137でstaging反映済み。Cloudflare Pages commandが `npm run build` でVitest gateを持つと確認。Q7によりローカル失敗注入で代替し、stagingへの意図的失敗コミットは行わない | Issue本文/受入条件をVitest gateに限定し、ローカル失敗証跡と`build.test.mjs`がdeployを止めない残余リスクを記録。CI失敗全般が止まるとは説明しない |
| [#129 verify-securityのSEC-33〜35網羅性](https://github.com/bickojima/my-blog/issues/129) | issue本文ではVitestがSEC-33/34/35を検証し、未テスト要件0と説明。verify-security単体はSEC01〜10の証跡用で、全SEC検査器ではない。 | PR #133で対応済み、Issueはクローズ済み（Q8） | DOCUMENTATION 1.5.4章で各SEC要件→実際の検査の追跡可能性と未テスト要件0を確認し、feature branchのVitest 639件全PASS・diff整合を確認後、レビューで完了判定 |
| [#130 AdminでCloudflare InsightsがCSPに遮断](https://github.com/bickojima/my-blog/issues/130) | 2026-09-23 本番/staging `/admin/` GETは200、両環境のCSPは一致。`static.cloudflareinsights.com` は許可されず意図通りブロックされる。ただしこれだけではCMS機能無影響の証拠にならない。 | 実装・実ホスト証跡完了、PR作成前レビュー待ち。CSPは緩和しない（Q9）。実操作E2E 54/54 PASS、OAuth/API mockにより実書込を遮断 | コメントを追加し、CSPにAnalyticsを許可していないことを静的確認。本番/staging adminでOAuth後の編集画面、保存/preview操作を実操作し、Analytics beacon以外のCSP違反がないことを確認。スクリーンショットと結果を保存し、レビュー後に理由を記録して閉じる |
| [#131 過去コミットauthorの個人識別情報](https://github.com/bickojima/my-blog/issues/131) | issueでは14件と報告。読み取り専用mirrorで12 heads、0 tags、103本のread-only PR refsを確認。公開済み履歴、PR/Issue/文書のhash参照、複数clone、GitHubキャッシュへの影響が列挙されている。 | 履歴書換えを計画する。#90の過去evidence除去と同じ履歴移行として設計し、まだ実行しない。本文中の個人識別情報も同じ書換えで伏せ字にする（Q13）。noreply author「bickojima」は据え置く（Q14）。実施は他issue完了・main反映・open PRゼロ後に凍結して行う（Q15）。PR refs残存は受容済み（Q12/Q16） | #90と一体のバックアップ・書換え・参照更新・clone再同期・検証・ロールアウト・復元計画をレビュー。全heads/tags/PR/既存clone/外部リンクとGitHubキャッシュ残存可能性を調査。GitHub管理PR refsは書換え対象にできず、Supportの対応可否も保証されない制約を前提にユーザーの残余受容を得る。履歴書換え後に個人識別情報と大容量evidenceの残存範囲、repo容量、各参照の整合を検証 |
| [#132 npm管理外依存のEOL・鮮度管理](https://github.com/bickojima/my-blog/issues/132) | CDNのDecap CMSは3.16.2へ更新済みとの記録。Actions、Node、Pages build image等の一覧・監視・EOL記録・SRI更新手順が要求されている。`playwright-home` にはnpm/pip脆弱性監査とNode/Python/macOS EOLを週次判定し、結果JSON・通知へつなぐ実装例がある。 | 週次workflowはmainに反映済み（PR #134）。`workflow_dispatch`実行とartifact/statusの確認が残る。 | my-blogにある外部依存を一覧化し、バージョン固定、週次の鮮度/EOL検査、結果JSON、warning/alert条件、既存の通知経路を定義。Decap更新・SRI再計算・E2E手順を文書化し、検知・通知の動作を検証 |

### #95候補比較（選定結果: いずれも現時点で必須ではない）

| 候補 | 現状との重複・価値 | 概算 | 受入条件案 |
|---|---|---|---|
| 公開記事の全文検索 | 5記事では現行アーカイブ・タグで到達でき、追加価値が小さい | 中 | 公開記事のみ対象、タイトル/本文/タグの部分一致、キーボード操作・0件表示、下書き非表示 |
| プロフィール/ブログ紹介の充実 | 既存のプロフィール・aboutページとCMSがある。内容は本人が用意する必要がある | 小 | 本人確認済みの原稿、ナビ・モバイル表示、noindex/公開範囲の確認 |
| 手動テーマ切替 | システム設定に応じたライト/ダーク表示は既にある。手動切替は利便性向上に留まる | 小〜中 | system/light/dark切替、選択保存、初期設定・キーボード操作・各色コントラスト確認 |

ユーザー判断は「必須でないなら対応不要」。現状で3案とも必須ではないため、追加機能を実装しない。#81/#90完了後、Issue #95へ候補比較と非実装の理由を記録して対応不要で閉じる。

## 4. Issue間の依存関係

- #95 は #81 と #90 の判断・処理後に次フェーズを定義する。
- #117項目15は #127 と重複するため、実装要件・完了証跡を #127 に集約する。
- #129 は #117で追加されたSEC-33/34および#127のSEC-35が、どのテストで担保されるかを記述する。
- #128 はSEC-35等のCI検知結果がPages deployを止められないという境界を扱う。#127と関連するが別要件。
- #132 は #117のActions固定・依存更新・Decap更新と関係するが、定期管理の運用要件として独立させる。
- #130は `public/_headers` のadmin CSPに関する意図確認。CSPを緩める変更は受入条件に含めない。
- #90のGit履歴容量削減と #131のauthor履歴書換えは、一体の履歴移行計画・バックアップ・復旧・検証・ロールアウト順序で扱う。目的・受入条件はissueごとに保持し、別々に二度書き換えない。

## 5. 未決の実装・運用設計

| 対象 | 未決設計 | 決定時に守る条件 |
|---|---|---|
| #90 / #131 履歴移行 | Drive上の階層・命名・索引、コピー手順、SHA-256 manifest形式、HTMLレポート内画像の配置、Git保持対象、author置換とblob除去を同時に行うfilter-repo等の方式、全refs更新・force push・clone再同期の順序 | 本人専用権限。Driveコピーと全ファイルのhash一致・復元を確認するまでGit証跡を削除しない。全ref/タグ/PR/issue/文書/cloneのhash参照とバックアップを先に記録。復元点を維持してから一回の履歴移行を実行し、移行後に容量・hash参照・PII残存・Drive復元を検証。private Driveで公開repoから直接閲覧できないアクセス条件を文書化し、公開リンクは発行しない |
| #127 環境固有ファイル | branchからのビルド時生成、CMS configの動的生成、merge運用等 | Decap CMSの静的設定要件を壊さない。両方向merge・PRビルド・staging/main実測で確認 |
| #128 Deploy gate | required status checks、Pages buildでのテスト、Actions経由deploy | main/stagingの運用と整合し、意図的失敗テストでdeploy停止を示す |
| #129 検証責務 | 静的検証をVitestへ集約するか、verify-securityへ重複追加するか | 二重管理を避け、SEC要件から検査手段へ単一の追跡表を持つ |
| #132 依存監視 | 四半期棚卸し、スケジュール通知、Dependabot/CDN専用確認の役割分担 | オフライン・CIの決定性を損なわず、EOL/脆弱性に気付く責任と期限を明確化 |

## 6. 既存作業状態と引継ぎ

> この章の「初回調査時点」記録は、2026-09-23の#139本番反映前に採取したスナップショットであり、現在状態を示すものではない。後述の「再開後の進捗」を最新状態の正本とする。

### ローカル状態

- 現在のHEAD: `fix/security-audit-run2` / `38205a0`。`origin/fix/security-audit-run2` と一致。
- 調査開始時点ではtracked/staged差分なし。既存の未追跡ファイル `.claude/launch.json` はローカルClaude preview設定の可能性があるが用途は断定できないため保持し、追跡対象へ追加しない。本QA文書は今回の新規未追跡成果物。
- ローカルremote-tracking refsは古い。`git ls-remote` の実取得結果と一致しないため、実装元に使わず、必要なfetchは作業開始前に別途行う。
- ローカルブランチにClaude由来 `claude/jolly-rubin-d50795`（mainへ統合済みとみられるコンテンツ同期ルール）、Codex noindex枝、`fix/e36-evidence-path`、セキュリティrun2枝がある。`codex/noindex-navigation` はローカルがremoteより2コミット先行。
- 最新GitHubにはClaude review/docs、SEC-33/34、SEC-35などの枝がある。ローカル一覧と一致しない枝があるため、枝の削除・作り直しはしない。
- 全remote headsを最新mainと比較した結果: `audit/security-run2` は固有1 commit（51 behind、監査レポート3件とskills-lock追加）、`claude/cms-modern-web-guidance-review-rn4b0k` は固有1 commit（86 behind、2026-06-11のレビュー証跡・スクリーンショットを追加）、`claude/moderwebguidance-docs-u8skgy` は固有1 commit（60 behind、Modern Web Guidance文書追加）。他7本はmainから遅れているがmainへ固有commitなし（behindは39/15/13/11/13/40/57）。`main`は基準、`staging`は7 behind/0 aheadで環境固有3ファイル差分。これらremote枝は保全し、最新mainへ自動統合しない。

### 初回調査時点のGitHub / Drive読み取り記録（2026-09-23）

- 昇格した読み取り専用 `git ls-remote --heads --tags origin` が成功。取得時点のGitHub headsは12本で、SHAは次の通り: `audit/security-run2` `5fad47f66832cb37f3c9cdf08dfeaf3447ab0e39`; `claude/cms-modern-web-guidance-review-rn4b0k` `a18ff158b786bff1c3dcaa09f6189169ca3b93e9`; `claude/moderwebguidance-docs-u8skgy` `022f9ec29a160e160b2f6b76151a2770bede25ee`; `codex/noindex-navigation` `c27254168d1a250f9f08b5dd183db26aed13a1e1`; `codex/noindex-navigation-main` `d9a330948032ffcca3aea301636edc0f18b64434`; `fix/bug-50-e2e-before-prod` `bd39d282cc4f23e553a7e7ac6929ebb01fa609b1`; `fix/restore-staging-env` `ac8c0c06a250acb0f26a9ab6a07168400dca954b`; `fix/sec-33-34-ci-assetsignore` `735afaeb08e815ef4d5fe41f2775e99969cd6b56`; `fix/sec-33-34-main` `578a040d12f25b690d04d70fef3fbcaa566f252b`; `fix/security-audit-run2` `c15c85d8b19815126ff53fa4b7ebd111472752eb`; `main` `1c4ea54622dd6f27f51a4e0903aa6f50c8914653`; `staging` `4666f6816721e2bb7a7ad8950bc186ed7bce9fcc`. Tagsは0本。open issueは対象10件、open PRは0件。GitHub API `size` は186389KB。
- GitHub公式資料によると `refs/pull/*` はread-only。GitHubのデータ削除手順では、PR refsとcached viewsが残る場合にSupport経由での削除が必要とされる一方、Supportはsensitive dataの削除に限定される。mirrorでは12 heads/0 tags/103 pull refs（合計115 refs）、reachable evidenceは528 unique blobs・166,684,550 bytes、reachable blob全体は240,079,198 bytes、packは182.29 MiBだった。したがって全heads/tagsのrewriteだけで旧証跡・commitがGitHub上から完全に消えるとは言えず、容量縮小も制約される可能性がある。参照: [GitHubで機密データを削除する](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)、[GitHubのPR refs](https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/checking-out-pull-requests-locally)。
- GitHub公式資料によると `refs/pull/*` はread-only。全heads/tags書換え後もPR refs/cacheに旧データが残り得る。ユーザーはSupport依頼不要、残存受容と回答済み。容量縮小は書換え可能refsを対象とするものとし、完全消去とは表現しない。mirrorでは12 heads/0 tags/103 pull refs（合計115 refs）、reachable evidenceは528 unique blobs・166,684,550 bytes、reachable blob全体は240,079,198 bytes、packは182.29 MiBだった。参照: [GitHubで機密データを削除する](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)、[GitHubのPR refs](https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/checking-out-pull-requests-locally)。
- 現在の `main` / `staging` は `staging` をmerge baseとしてmainが7コミット先行。差分ファイルは `astro.config.mjs`、`public/admin/config.yml`、`public/robots.txt` の環境固有値のみ。7コミットの意味とstaging反映手順を確認するまで、stagingを単純にmainへ追従させない。以前のローカルremote-tracking refsは古く、更新していない。
- 指定DriveパスはNFDの `GoogleDrive-<本人アカウント>/マイドライブ/05_自動化環境/06_my-blog` として実在し、各フォルダを読み取れる。通常sandboxではwrite不可だったが、明示的に許可された昇格プローブで一意な小ファイルの作成・SHA-256読み戻し・同一ファイル削除に成功し、ファイル不在を確認した。したがって通常時のwrite不可はsandbox制限。全量コピーは未実施。ディスク空きは18GiB。
- `~/git/playwright-home` はローカルに存在し、関連資料・コードは読み取り済み。未追跡ファイルがあるためstatusのみ確認し、変更していない。`/Users/playwright/git/playwright-home`（Mac mini側）はこのMac上に存在せず、本番実機は未確認。
- 履歴インベントリ用のbare mirrorを `/private/tmp/my-blog-history-inventory.git` にread-only cloneした。対象は12 heads・103 pull refs・tag 0本。Drive移行索引の初稿 `/private/tmp/my-blog-evidence-manifest-draft.json` は528 unique evidence blobsの元path/Git blob SHA/SHA-256/サイズと全115 refsを記録（150,648 bytes、SHA-256 `270ef0fc2b39dd3d55dcf3f7b0b61befbf034b8dc04c1f82fa59548b0bac38e3f2`）。この草稿はsource pathの代表名を記録した初期索引であり、全path alias・HTML相対画像を再構成する最終restore manifestではない。Drive移行前にスナップショット/相対参照の設計と全ファイル照合を追加する。

### 初回調査時点のPR・成果物

- GitHub MCPのopen PR検索は0件。検索結果のPR stateが正規化出力でnullとなるため、作業開始時にPR一覧を再確認する。
- 関連PRの説明: #118（SEC-29〜32）、#123/#124（SEC-33/34）、#125/#126（SEC-35）。PR本文上は後続対応・検証が報告されるが、ローカルorigin/main参照との差があるので証跡として再照合する。
- run2引継ぎ: `docs/security/HANDOVER-run2.md`。監査資料: `docs/security/audit-run2-report.md`, `audit-run2-needs-validation.md`, `audit-run2-findings-detail.md`。
- これらはsource-only監査と未実施の環境確認を明記する。レポートの「未確認」を実証済みと扱わない。
- 次の作業は、GitHub最新refsを作業元とし、対象issueごとのbranch/PRへ分ける。現ローカルcheckoutはmainより40コミットbehind。`fix/security-audit-run2` の広い差分を無条件に他のissue作業へ持ち込まない。

### 初回調査時点の進捗（2026-09-23、staging向けPR作成前）

- GitHub refs: `main=f60b81d`（#139 release 1）、`staging=10a1589`（#142 evidence）。初回調査の refs（main `1c4ea54` / staging `4666f68`）は古い。
- #127/#130: branch `codex/issue-127-derived-env` はstagingを親に作成。#127 commit `fe646e8` と#130 SEC-41変更、E-39 false-pass修正、QA/設計/テスト文書とevidenceを含む。Vitest 754/754 PASS、build PASS、Playwright 457 PASS + 8 skip / 465、#130 実ホスト操作54/54 PASS。両方向merge rehearsalでは初回3ファイル競合を新構造に揃えた後、以後のmergeはcleanで環境値差分0。`evidence/2026-09-23/issue127/` と `issue130-review/`。
- 【初回調査時点の記録】#127/#130はstagingへ未反映で、実配信検証前だった。後続の現況は本書冒頭「状態」を参照。本番mainへの2回目反映は未実施。
- #128: Pagesの`npm run build`がVitestをゲートする範囲に限定して受入確認する。`build.test.mjs`自体はPagesゲート外の残余があり、CI失敗全般のdeploy停止とは説明しない。Q7により意図的staging失敗コミットは不要。
- #130実ホスト証跡54件の内訳はRP18 + RS18 + LA6 + LB6 + R6。production/stagingのCMS操作は3端末、ローカル操作はPCのみ。実OAuth/API書込は遮断しており、旧ローカルiPad/iPhone結果は別ディレクトリ `evidence/2026-09-23/issue130/` に保存。
- #132の週次workflowはmainに存在する。issue close前に`workflow_dispatch` run、artifact/statusを読み取り確認し、alert通知実証の限界を残す。
- #90: 既存Driveの親フォルダ`06_my-blog` ID `1Xd2_sPE1y3LPJwK6NE-yxlyPgD2QSTUl`、配下の`evidence-history-archive` folder ID `1qZpRsZs0kgY-ssH-Uje2KO8YaOf0V9k8`。Drive上のmanifestは758 pairs/528 unique blobs、既存verifyは758件SHA一致、missing/mismatch/stray 0。HTML相対参照540件中539解決、1件はevidence外の`../../docs/qa-2026-09-09-otp-app-pages.md`参照。既存移行物を引継ぎ、新証跡の差分と1 broken external relative linkを調査し、コピーをやり直さない。最終的なDrive metadata・本人のみ権限・復元検証が必要。
- PR #140/#141 Dependabotがstaging向けにopen。#90/#131の履歴書換え開始前に処理してopen PR 0を再確認する。force pushは統合計画・バックアップ・hash/restore検証の敵対的レビューGOまで行わない。

### 最新ゲート状況（2026-09-23、初回調査時点の記録を更新）

- stagingはPR #143 merge commit `2bbac7d4132a2fcdc6a26a66b8473ab236128b07`。`https://staging.reiwa.casa` と `https://staging.my-blog-3cg.pages.dev` から新しい環境設定を読み取り、robotsはDisallow、canonical/sitemapはstaging origin、admin configからbranch/base_url削除、cms-env.jsは200、admin CSPにInsightsなしを確認。配信のSHA-256 fingerprintは作業ツリーと一致。Cloudflare API tokenがなくdeployment commit metadataは未確認。
- #130 staging後の実ホストCMS E2Eは78/78 PASS: RP18 + RS18 + LA18 + LB18 + R-PROD3 + R-STG3。実OAuthとGitHub APIはmockし、実書込0。ローカルはPC/iPad/iPhoneで各18件、実ホストも両環境3端末で保存/previewフローを操作。証跡 `evidence/2026-09-23/issue130-post-staging/`。
- 包括E2Eはstaging実配信に対しPC/iPad/iPhone各50/50、計150/150 PASS。仕様は50 scenario IDsを各端末で実行すること。ローカルPlaywright suiteは465中457 PASS・既存skip 8・失敗0（14.3分）。Vitest 754/754、Pages相当build 625/625、build.test 129/129 PASS。1回目のmain build出力を後続の環境未設定Vitestが `dist` に上書きしたため、一時的にstaging値を読んだ。main buildを単独実行して直後に確認し、robots Allow + production Sitemap、canonical/sitemap production-onlyを再確認。これは観測順序の混同でありコードバグとは認定していない。端末別ビルド結果は `evidence/2026-09-23/release-main/branch-build-results.json`。
- main向け候補は隔離worktree `codex/release-2-issues-127-130` にて `main=f60b81d` と `staging=2bbac7d` を統合中。初回mergeでastro.config.mjs/config.yml/robots.txtの3競合を新構造に解決。main側のrobots Allow・production canonical/sitemapを検証済み。main merge / production deploy未実施。
- #140/#141はGitHub Actions SHA-pin updates（v7）で、CI PASS表示を確認済み。#90/#131履歴移行前にstagingへ順次mergeし、staging/mainへ同期してopen PRゼロを再確認する。

## 7. 敵対的レビューで要再検証の点

1. **#81 live状態**: canonical、robots、sitemap、staging noindexを本番・stagingで読み取り確認する。ブランチ内ファイルの静的検査だけでクローズしない。
2. **#127 実refs**: GitHubの最新main/staging/関連PRを読み取り、ローカルorigin refsやPR本文の古い値と整合させる。両方向merge実験の証拠があるか確認する。
3. **#128 失敗時deploy**: Q7/PR #137でローカル失敗注入を実証済み。確認範囲はPages Build command `npm run build`内のVitestのみ。`build.test.mjs`などCI失敗全般を止める保証はなく、stagingへの意図的失敗コミットも行わない。Issue本文の受入条件と残余リスクの表記をこの範囲に揃え、根拠コメント後にクローズ判断する。
4. **#90 リンク・復元**: Google Driveへのコピー後、全ファイルのhash一致、階層対応、本人アカウントでのリンク到達、ダウンロードからの復元を確認する。HTMLレポートの相対画像参照が維持されるか確認する。過去Git履歴から除去した後のrepo全体容量も計測する。
5. **#90/#131 全refs影響**: Git内外のコミットhash参照（文書、issues、PR、worktree、タグ、他clone）と、書換え後もGitHub上に旧データが残る可能性を洗い出す。Drive移行とauthor書換えを一体化した一回の履歴移行・バックアップ・復旧・検証・ロールアウト順序を敵対的レビューする。履歴書換えを完全削除と誤認しない。
6. **#117監査所見**: 監査資料にある項目は「脆弱性」とhardeningを区別し、最新ブランチにおける実装状態と残余リスクを各々再確認する。

## 8. 作業時の制約

初回調査時点では#81のlive証拠コメントとクローズ、#129の文書責務修正以外のissueクローズ・証跡移動・GitHub refs更新・履歴書換え・force push・main/staging反映を行っていなかった（この記述は初回調査時点の履歴）。一時bare mirrorは `/private/tmp/my-blog-history-inventory.git` に作成した。Q12は旧PR refs/cache残存の受容で確定した。現在は各issueの実装・検証・根拠コメントへ進む。#90/#131では既存Drive移行物を引継いで差分・ハッシュ・復元性を検証し、履歴書換え・force pushはレビューGO前に実施しない。既存作業ブランチ・成果物・ユーザー未追跡ファイルを保全する。
