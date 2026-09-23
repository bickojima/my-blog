// SEC-27 / SEC-37（Issue #117 項目5）: OAuth 開始（/auth）とコールバック（/auth/callback）が
// 共有する唯一のオリジン許可リスト。以前は両ファイルに同一実装が複製され、独立に変更されうる状態だった。
// このファイルは onRequest* ハンドラを export しないため、Cloudflare Pages Functions のルートにはならない
// （wrangler のファイルベースルーティングはハンドラ export を持つファイルだけをルート化する）。
//
// 注: この判定は「この関数自体が配信されているホスト（url.origin）」を対象にしている。
// プレビューのワイルドカード（項目7）と localhost（項目8）を残している理由は
// docs/security/issue-117-hardening-decisions.md を参照。

export const PRODUCTION_ORIGINS = Object.freeze([
  'https://reiwa.casa',
  'https://staging.reiwa.casa',
]);

const PAGES_PREVIEW_ORIGIN = /^https:\/\/([a-z0-9-]+\.)*my-blog-3cg\.pages\.dev$/;
const LOCAL_DEV_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

export function isAllowedOrigin(origin) {
  if (PRODUCTION_ORIGINS.includes(origin)) {
    return true;
  }
  if (PAGES_PREVIEW_ORIGIN.test(origin)) {
    return true;
  }
  if (LOCAL_DEV_ORIGIN.test(origin)) {
    return true;
  }
  return false;
}
