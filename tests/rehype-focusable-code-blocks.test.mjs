import { describe, expect, it } from 'vitest';
import rehypeFocusableCodeBlocks from '../src/plugins/rehype-focusable-code-blocks.mjs';

function makeTree(children) {
  return { type: 'root', children };
}

describe('rehype-focusable-code-blocks プラグイン', () => {
  const plugin = rehypeFocusableCodeBlocks();

  it('pre要素にtabindex="0"を付与する', () => {
    const pre = {
      type: 'element',
      tagName: 'pre',
      properties: {},
      children: [],
    };

    plugin(makeTree([pre]));

    expect(pre.properties.tabIndex).toBe(0);
  });

  it('pre以外の要素にはtabindexを付与しない', () => {
    const paragraph = {
      type: 'element',
      tagName: 'p',
      properties: {},
      children: [],
    };

    plugin(makeTree([paragraph]));

    expect(paragraph.properties.tabIndex).toBeUndefined();
  });
});
