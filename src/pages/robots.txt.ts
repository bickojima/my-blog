import type { APIRoute } from 'astro';
import { buildRobotsTxt } from '../lib/site-env.mjs';

// Issue #127: robots.txt はビルド時に CF_PAGES_BRANCH から生成する（public/robots.txt は置かない）。
// main と判定できたときだけ Allow + 本番 Sitemap、それ以外は Disallow: /（判定は src/lib/site-env.mjs）。
// Base.astro の [STAGING] 判定と同じく import.meta.env.CF_PAGES_BRANCH を参照する。
export const GET: APIRoute = () =>
  new Response(buildRobotsTxt(import.meta.env.CF_PAGES_BRANCH), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
