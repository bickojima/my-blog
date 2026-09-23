#!/bin/bash
# 本番リリース後の読み取り専用確認（GET/HEADのみ。ログイン・書き込みなし）
# 使い方: bash evidence/2026-09-23/release-main/verify-prod-readonly.sh <出力ディレクトリ>
set -u
BASE=https://reiwa.casa
OUT=${1:-prod-after}
mkdir -p "$OUT"

code() { curl -sS -o /dev/null -w '%{http_code}' "$1"; }

TOP=$(code "$BASE/")
# 記事URLはトップページの最初の記事リンクから動的取得（コンテンツをハードコードしない）
ARTICLE_PATH=$(curl -sS "$BASE/" | grep -o 'href="/posts/[^"]*"' | head -1 | sed 's/href="//;s/"$//')
ARTICLE_RAW=$(code "$BASE$ARTICLE_PATH")
# Cloudflare Pages は末尾スラッシュなしを 308 で /…/ へ寄せるため、追従後の最終応答も記録する
ARTICLE=$(curl -sSL -o /dev/null -w '%{http_code} (final: %{url_effective})' "$BASE$ARTICLE_PATH")
CANON_TOP=$(curl -sS "$BASE/" | grep -o '<link rel="canonical" href="[^"]*"' | head -1)
CANON_ART=$(curl -sSL "$BASE$ARTICLE_PATH" | grep -o '<link rel="canonical" href="[^"]*"' | head -1)
curl -sS "$BASE/robots.txt" > "$OUT/robots.txt"
SITEMAP=$(code "$BASE/sitemap-index.xml")
ADMIN=$(code "$BASE/admin/")
curl -sSI "$BASE/admin/" > "$OUT/admin-headers.txt"
curl -sS "$BASE/admin/config.yml" | head -6 > "$OUT/admin-config-head.txt"
curl -sS -o /dev/null -D - "$BASE/auth" | grep -i '^HTTP\|^location' \
  | sed -E 's/state=[0-9a-f-]+/state=<redacted>/' > "$OUT/auth-get.txt"

{
  echo "top: $TOP"
  echo "article: $ARTICLE_PATH -> $ARTICLE_RAW, followed: $ARTICLE"
  echo "canonical(top): $CANON_TOP"
  echo "canonical(article): $CANON_ART"
  echo "sitemap-index.xml: $SITEMAP"
  echo "admin/: $ADMIN"
  echo "--- robots.txt"; cat "$OUT/robots.txt"
  echo "--- admin/config.yml (head)"; cat "$OUT/admin-config-head.txt"
  echo "--- admin CSP"; grep -i '^content-security-policy' "$OUT/admin-headers.txt"
  echo "--- /auth"; cat "$OUT/auth-get.txt"
} | tee "$OUT/summary.txt"
