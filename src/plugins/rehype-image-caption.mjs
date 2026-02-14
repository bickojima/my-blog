import { visit } from 'unist-util-visit';
import { h } from 'hastscript';

/**
 * rehype plugin: img with title attribute → <figure><img><figcaption>title</figcaption></figure>
 * alt stays as alt attribute, title becomes visible caption.
 */
export default function rehypeImageCaption() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      // すべてのimg要素にlazy loadingとasync decodingを追加
      if (node.tagName === 'img') {
        node.properties.loading = node.properties.loading || 'lazy';
        node.properties.decoding = node.properties.decoding || 'async';
      }

      if (node.tagName !== 'img' || !node.properties?.title) return;
      if (parent?.tagName === 'figure') return;

      const caption = node.properties.title;
      delete node.properties.title;

      const figure = h('figure', { class: 'image-caption' }, [
        node,
        h('figcaption', caption),
      ]);

      parent.children[index] = figure;
    });
  };
}
