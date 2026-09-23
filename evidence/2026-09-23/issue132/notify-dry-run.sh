#!/usr/bin/env bash
# Issue #132 / SEC-40: dependency-freshness.yml の notify ジョブと同じ手順を dry-run する。
# `gh issue list` だけは実 API（読み取り）を呼び、create/comment は実行せず引数を表示する。
# 使い方: bash evidence/2026-09-23/issue132/notify-dry-run.sh <latest.md>
set -euo pipefail
export GH_REPO="${GH_REPO:-bickojima/my-blog}"
RUN_URL="(dry-run)"
gh() {
  if [ "$1 $2" = "issue list" ]; then command gh "$@"; else echo "DRY-RUN: gh $*"; fi
}
work="$(mktemp -d)"
trap 'rm -rf "${work}"' EXIT
mkdir -p "${work}/result"
cp "$1" "${work}/result/latest.md"
cd "${work}"
# ---- 以下は workflow の "Open or update alert issue" ステップと同一 ----
title='[dependency-freshness] npm管理外依存に要対応（alert）があります'
{ cat result/latest.md; echo; echo "実行: ${RUN_URL}"; } > body.md
number="$(gh issue list --state open --search "\"[dependency-freshness]\" in:title" --json number,title \
  --jq "map(select(.title == \"${title}\")) | .[0].number // empty")"
echo "existing open issue: ${number:-none}"
if [ -n "${number}" ]; then
  gh issue comment "${number}" --body-file body.md
else
  gh issue create --title "${title}" --body-file body.md
fi
echo "body.md: $(wc -l < body.md) lines, first line: $(head -1 body.md)"
