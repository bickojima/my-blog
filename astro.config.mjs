// @ts-check
import { defineConfig } from 'astro/config';
import rehypeFigure from 'rehype-figure';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  markdown: {
    rehypePlugins: [rehypeFigure],
  },
});
