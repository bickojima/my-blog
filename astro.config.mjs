// @ts-check
import { defineConfig } from 'astro/config';
import rehypeImageCaption from './src/plugins/rehype-image-caption.mjs';
import rehypeFocusableCodeBlocks from './src/plugins/rehype-focusable-code-blocks.mjs';
import imageOptimize from './src/integrations/image-optimize.mjs';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  integrations: [imageOptimize()],
  markdown: {
    rehypePlugins: [rehypeImageCaption, rehypeFocusableCodeBlocks],
  },
});
