#!/bin/bash
# Issue #127: 両方向マージの実証（ローカルの一時 clone のみで行う。push はしない）
#
# 使い方: bash evidence/2026-09-23/issue127/merge-demo.sh <作業用の一時ディレクトリ>
#   リポジトリ直下で実行する。未使用の /private/tmp/my-blog-issue127-demo-review-* を指定する。
#   使い捨て clone 内だけでブランチ・マージ・ビルドを行い、結果は merge-demo-review.log に書く。
#
# 手順:
#   0. 変更前（origin/main と origin/staging）の環境固有ファイル差分を記録（問題の再確認）
#   1. staging-sim = 実装コミット（staging に PR をマージした状態）
#   2. main-sim    = origin/main に staging-sim を初回マージ（DOCUMENTATION 4.6.5章の移行手順）
#   3. 両ブランチで別々の変更を入れて分岐させる（main-sim: CMS からの記事追加を模擬 / staging-sim: 機能追加を模擬）
#   4. staging→main（merge-to-main）と main→staging（merge-to-staging）をそれぞれ実行
#   5. 環境固有ファイルの差分・マージによる変化がゼロであること、各ブランチの生成物の環境値を確認
#   6. 陰性対照: 旧構造の値（config.yml の branch 等）を持ち込むと静的ガードが失敗すること
set -u
REPO="$(pwd)"
WORK="$1"
LOG="$REPO/evidence/2026-09-23/issue127/merge-demo-review.log"
ENV_FILES="astro.config.mjs public/admin/config.yml public/admin/index.html public/admin/cms-env.js src/lib/site-env.mjs src/pages/robots.txt.ts public/robots.txt"
FEATURE_SHA="$(git rev-parse HEAD)"
BASE_MAIN="$(git rev-parse origin/main)"
BASE_STAGING="$(git rev-parse origin/staging)"

case "$WORK" in
  /private/tmp/my-blog-issue127-demo-review-*) ;;
  *) echo "拒否: WORKは /private/tmp/my-blog-issue127-demo-review-* の未使用パスを指定してください" >&2; exit 2 ;;
esac
if [ -e "$WORK" ]; then echo "拒否: WORKが既に存在します: $WORK" >&2; exit 2; fi
mkdir -p "$WORK"
exec > "$LOG" 2>&1

echo "# Issue #127 両方向マージ実証ログ"
echo "実行日時: $(date '+%Y-%m-%d %H:%M:%S %z')"
echo "feature(HEAD)=$FEATURE_SHA origin/main=$BASE_MAIN origin/staging=$BASE_STAGING"
echo

G() { git -C "$WORK/r" -c core.quotepath=false -c user.name="tbi" -c user.email="noreply@users.noreply.github.com" "$@"; }

git clone -q --no-hardlinks "$REPO" "$WORK/r"
G fetch -q "$REPO" "$BASE_MAIN:refs/heads/base-main" "$BASE_STAGING:refs/heads/base-staging" "$FEATURE_SHA:refs/heads/staging-sim"
ln -s "$REPO/node_modules" "$WORK/r/node_modules"
# .gitignore の node_modules/ はディレクトリにしか一致しないため、シンボリックリンクを clone 側で除外する
echo "node_modules" >> "$WORK/r/.git/info/exclude"

echo "## 0. 変更前: origin/main と origin/staging の環境固有ファイル差分（Bug #51 の原因）"
G diff --stat base-main base-staging -- $ENV_FILES
G diff base-main base-staging -- astro.config.mjs public/admin/config.yml public/robots.txt | grep -E '^[-+][^-+]'
echo

echo "## 1. staging-sim = 実装コミット"
G checkout -q staging-sim
G log --oneline -1
echo

echo "## 2. main-sim = origin/main に staging-sim を初回マージ（4.6.5章 移行手順）"
G checkout -q -b main-sim base-main
if G merge --no-ff --no-edit staging-sim >/dev/null 2>&1; then
  echo "初回マージ: コンフリクトなし"
else
  echo "初回マージ: コンフリクトあり（移行手順どおり新構造側に揃える）"
  G diff --name-only --diff-filter=U
  # 環境固有ファイルは新構造（staging 側）に揃える。それ以外のコンフリクトも本実証では staging 側を採用し、ログに残す
  for f in $(G diff --name-only --diff-filter=U); do
    if [ "$f" = public/robots.txt ]; then G rm -q -f public/robots.txt; else G checkout --theirs -- "$f"; fi
  done
  G rm -q -f --ignore-unmatch public/robots.txt
  G add -A
  G commit -q --no-edit
fi
echo "移行後 main-sim と staging-sim の環境固有ファイル差分（空であること）:"
G diff --stat main-sim staging-sim -- $ENV_FILES
echo "public/robots.txt 存在: $(test -e "$WORK/r/public/robots.txt" && echo あり || echo なし)"
echo

echo "## 3. 両ブランチを分岐させる"
mkdir -p "$WORK/r/src/content/posts/2026/09"
printf -- '---\ntitle: マージ実証用の記事\ndate: 2026-09-23\ndraft: true\ntags: []\n---\nmain 側で CMS から追加された記事を模擬する。\n' > "$WORK/r/src/content/posts/2026/09/マージ実証用の記事.md"
G add -A
G commit -q -m "demo: main 側で記事を追加（CMS の本番コミットを模擬）"
G checkout -q staging-sim
printf '\n<!-- merge demo: staging 側の機能追加を模擬 -->\n' >> "$WORK/r/docs/MODERN-WEB-GUIDANCE.md"
G commit -q -am "demo: staging 側で機能追加（ドキュメント変更を模擬）"
echo "main-sim:    $(G log --oneline -1 main-sim)"
echo "staging-sim: $(G log --oneline -1 staging-sim)"
echo "分岐点: $(G merge-base main-sim staging-sim)"
echo

merge_check() { # $1=結果ブランチ名 $2=マージ先の元 $3=マージ元
  local out="$1" into="$2" from="$3"
  G checkout -q -b "$out" "$into"
  if G merge --no-ff --no-edit "$from" >/dev/null 2>&1; then
    echo "マージ $from → $into: コンフリクトなし"
  else
    echo "マージ $from → $into: コンフリクトあり"; G diff --name-only --diff-filter=U; G merge --abort
  fi
  echo "マージで環境固有ファイルが変化したか（空であること）:"
  G diff --stat "$into" "$out" -- $ENV_FILES
  echo "マージで取り込まれたファイル:"
  G diff --name-only "$into" "$out"
}

echo "## 4a. staging → main（merge-to-main）"
merge_check merge-to-main main-sim staging-sim
echo
echo "## 4b. main → staging（merge-to-staging）"
merge_check merge-to-staging staging-sim main-sim
echo
echo "## 5. マージ後の両ブランチの環境固有ファイル差分（空であること）"
G diff --stat merge-to-main merge-to-staging -- $ENV_FILES
echo "public/robots.txt 存在: merge-to-main=$(G cat-file -e merge-to-main:public/robots.txt 2>/dev/null && echo あり || echo なし) / merge-to-staging=$(G cat-file -e merge-to-staging:public/robots.txt 2>/dev/null && echo あり || echo なし)"
echo "config.yml の branch/base_url 行: merge-to-main=$(G show merge-to-main:public/admin/config.yml | grep -cE '^\s*(branch|base_url):') / merge-to-staging=$(G show merge-to-staging:public/admin/config.yml | grep -cE '^\s*(branch|base_url):')"
echo

build_check() { # $1=ブランチ $2=CF_PAGES_BRANCH
  local br="$1"
  local env="$2"
  local out="$WORK/dist-$1"
  G checkout -q "$br"
  (cd "$WORK/r" && CF_PAGES_BRANCH="$env" npx astro build --outDir "$out" >/dev/null 2>&1) || echo "BUILD FAILED"
  echo "### $br を CF_PAGES_BRANCH=$env でビルド"
  echo "robots.txt:"; sed 's/^/    /' "$out/robots.txt"
  echo "canonical(index): $(grep -o '<link rel="canonical"[^>]*>' "$out/index.html")"
  echo "sitemap-index: $(grep -o '<loc>[^<]*</loc>' "$out/sitemap-index.xml" | tr '\n' ' ')"
  echo "sitemap-0 のオリジン一覧: $(grep -o '<loc>https://[^/<]*' "$out/sitemap-0.xml" | sort -u | sed 's/<loc>//' | tr '\n' ' ')"
  echo "admin/config.yml の branch/base_url 行数: $(grep -cE '^\s*(branch|base_url):' "$out/admin/config.yml")"
  echo "Vitest（CF_PAGES_BRANCH=${env}）:"
  (cd "$WORK/r" && CF_PAGES_BRANCH="$env" npx vitest run 2>&1 | grep -E 'Test Files|Tests ')
}
echo "## 5b. 生成物の環境値"
build_check merge-to-main main
build_check merge-to-staging staging
echo

echo "## 6. 陰性対照: 旧構造の値を持ち込むと静的ガードが検出する"
G checkout -q -b negative-control merge-to-staging
perl -0pi -e 's#(  repo: bickojima/my-blog\n)#$1  branch: main\n  base_url: https://reiwa.casa\n#' "$WORK/r/public/admin/config.yml"
printf 'User-agent: *\nAllow: /\n' > "$WORK/r/public/robots.txt"
(cd "$WORK/r" && npx vitest run tests/env-derivation.test.mjs tests/cms-config.test.mjs 2>&1 | grep -E '✗|×|FAIL|Tests ' | head -20)
echo
echo "完了"
