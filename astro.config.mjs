// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import rehypeImageCaption from './src/plugins/rehype-image-caption.mjs';
import rehypeFocusableCodeBlocks from './src/plugins/rehype-focusable-code-blocks.mjs';
import imageOptimize from './src/integrations/image-optimize.mjs';
import { resolveSiteUrl } from './src/lib/site-env.mjs';

// Issue #127: サイトURLは Cloudflare Pages のビルド環境変数 CF_PAGES_BRANCH から導出する。
// main のときだけ本番URL、それ以外（staging・プレビュー・ローカル・CI）は staging URL。
// このファイルは main / staging で同一内容に保つ（ブランチ別の値をここに書かない。DOCUMENTATION.md 4.6.4章）。
const SITE_URL = resolveSiteUrl(process.env.CF_PAGES_BRANCH);

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
    // Astro 7 の既定は Sätteri。既存 rehype プラグインを維持するため unified に直接渡す。
    processor: unified({
      rehypePlugins: [rehypeImageCaption, rehypeFocusableCodeBlocks],
    }),
  },
});
