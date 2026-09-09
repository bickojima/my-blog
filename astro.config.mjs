// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import rehypeImageCaption from './src/plugins/rehype-image-caption.mjs';
import rehypeFocusableCodeBlocks from './src/plugins/rehype-focusable-code-blocks.mjs';
import imageOptimize from './src/integrations/image-optimize.mjs';

// site/sitemapのfilterはbranchごとに手動管理する（config.ymlのbase_url/branchと同じ方針）。
// staging: https://staging.reiwa.casa / main: https://reiwa.casa（マージ時に手動修正。DOCUMENTATION.md 4.6.4章参照）
const SITE_URL = 'https://reiwa.casa';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  output: 'static',
  integrations: [
    imageOptimize(),
    sitemap({
      // /admin/ はCMS、/playwright-home はfrontmatterで noindex: true の固定ページ。
      // 両者のずれは build.test.mjs（FR-29）が検出する。
      filter: (page) => !page.includes('/admin/') && !page.includes('/playwright-home'),
    }),
  ],
  markdown: {
    rehypePlugins: [rehypeImageCaption, rehypeFocusableCodeBlocks],
  },
});
