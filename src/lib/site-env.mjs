// Issue #127 / Bug #51: ビルド時の環境固有値（サイトURL・robots.txt）を1か所から導出する。
//
// 以前は astro.config.mjs の SITE_URL と public/robots.txt を main / staging で別の値にしていたため、
// どちら向きにマージしても相手ブランチの値が持ち込まれた（Bug #51）。
// ここでは Cloudflare Pages がビルド時に渡す CF_PAGES_BRANCH だけを入力にし、
// ファイルの中身は main と staging で同一にする。
//
// 安全側の既定: 「main と判定できたときだけ本番値」。未設定・空文字・未知のブランチ
// （feature/*、プレビュー、ローカル、CI）はすべて staging 値（検索除外）に倒す。
// 本番を誤って検索除外にするより、staging を誤ってインデックスさせる方が発生しにくい構造にする。

/** 本番として扱うブランチ名（完全一致のみ） */
export const PRODUCTION_BRANCH = 'main';

/** 本番サイトURL（main ビルドの site / canonical / sitemap / robots の Sitemap 行） */
export const PRODUCTION_SITE_URL = 'https://reiwa.casa';

/** 本番以外のビルドで使うサイトURL（staging・プレビュー・ローカル・CI） */
export const STAGING_SITE_URL = 'https://staging.reiwa.casa';

/**
 * ブランチ名が本番か。文字列の完全一致のみ本番とする（前後空白・大文字違い・非文字列は本番にしない）。
 * @param {unknown} branch 通常は process.env.CF_PAGES_BRANCH
 * @returns {boolean}
 */
export function isProductionBranch(branch) {
  return typeof branch === 'string' && branch === PRODUCTION_BRANCH;
}

/**
 * Astro の site に渡すサイトURL。
 * @param {unknown} branch
 * @returns {string}
 */
export function resolveSiteUrl(branch) {
  return isProductionBranch(branch) ? PRODUCTION_SITE_URL : STAGING_SITE_URL;
}

/**
 * robots.txt の本文。本番のみ Allow + 本番 Sitemap、それ以外は全面 Disallow（Sitemap 行なし）。
 * @param {unknown} branch
 * @returns {string}
 */
export function buildRobotsTxt(branch) {
  if (isProductionBranch(branch)) {
    return `User-agent: *\nAllow: /\nSitemap: ${PRODUCTION_SITE_URL}/sitemap-index.xml\n`;
  }
  return 'User-agent: *\nDisallow: /\n';
}
