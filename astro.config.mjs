// @ts-check
import { defineConfig } from 'astro/config';
import rehypeImageCaption from './src/plugins/rehype-image-caption.mjs';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  markdown: {
    rehypePlugins: [rehypeImageCaption],
  },
});
