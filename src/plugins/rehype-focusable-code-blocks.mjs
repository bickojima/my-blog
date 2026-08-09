import { visit } from 'unist-util-visit';

/**
 * Make horizontally scrollable code blocks keyboard reachable.
 */
export default function rehypeFocusableCodeBlocks() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'pre') return;
      node.properties = node.properties || {};
      node.properties.tabIndex = 0;
    });
  };
}
