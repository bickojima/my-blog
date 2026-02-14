import { describe, it, expect } from 'vitest';
import rehypeImageCaption from '../src/plugins/rehype-image-caption.mjs';

/**
 * テスト用のシンプルなHAST（HTML Abstract Syntax Tree）ノードを生成
 */
function makeImgNode(properties = {}) {
  return {
    type: 'element',
    tagName: 'img',
    properties: { ...properties },
    children: [],
  };
}

function makeParent(children) {
  return {
    type: 'element',
    tagName: 'p',
    properties: {},
    children: [...children],
  };
}

function makeTree(bodyChildren) {
  const body = {
    type: 'element',
    tagName: 'body',
    properties: {},
    children: [...bodyChildren],
  };
  return {
    type: 'root',
    children: [body],
  };
}

describe('rehype-image-caption プラグイン', () => {
  const plugin = rehypeImageCaption();

  describe('lazy loading と async decoding の自動付与', () => {
    it('img要素にloading="lazy"とdecoding="async"が追加される', () => {
      const img = makeImgNode({ src: '/test.jpg', alt: 'テスト画像' });
      const parent = makeParent([img]);
      const tree = makeTree([parent]);

      plugin(tree);

      expect(img.properties.loading).toBe('lazy');
      expect(img.properties.decoding).toBe('async');
    });

    it('既にloading属性がある場合は上書きしない', () => {
      const img = makeImgNode({
        src: '/test.jpg',
        loading: 'eager',
      });
      const parent = makeParent([img]);
      const tree = makeTree([parent]);

      plugin(tree);

      expect(img.properties.loading).toBe('eager');
      expect(img.properties.decoding).toBe('async');
    });

    it('既にdecoding属性がある場合は上書きしない', () => {
      const img = makeImgNode({
        src: '/test.jpg',
        decoding: 'sync',
      });
      const parent = makeParent([img]);
      const tree = makeTree([parent]);

      plugin(tree);

      expect(img.properties.loading).toBe('lazy');
      expect(img.properties.decoding).toBe('sync');
    });
  });

  describe('title属性によるfigure/figcaption変換', () => {
    it('title属性を持つimgがfigure+figcaptionに変換される', () => {
      const img = makeImgNode({
        src: '/photo.jpg',
        alt: '写真の代替テキスト',
        title: 'キャプションテキスト',
      });
      const parent = makeParent([img]);
      const tree = makeTree([parent]);

      plugin(tree);

      const figure = parent.children[0];
      expect(figure.tagName).toBe('figure');
      // hastscript は class を className 配列に変換する
      expect(figure.properties.className).toContain('image-caption');

      // img要素が子として含まれる
      const innerImg = figure.children[0];
      expect(innerImg.tagName).toBe('img');
      expect(innerImg.properties.alt).toBe('写真の代替テキスト');
      // title属性は削除されている
      expect(innerImg.properties.title).toBeUndefined();

      // figcaptionが含まれる
      const figcaption = figure.children[1];
      expect(figcaption.tagName).toBe('figcaption');
    });

    it('title属性がないimgはfigureに変換されない', () => {
      const img = makeImgNode({ src: '/photo.jpg', alt: 'テスト' });
      const parent = makeParent([img]);
      const tree = makeTree([parent]);

      plugin(tree);

      expect(parent.children[0].tagName).toBe('img');
    });

    it('既にfigure内にあるimgは二重変換されない', () => {
      const img = makeImgNode({
        src: '/photo.jpg',
        title: 'テスト',
      });
      const figure = {
        type: 'element',
        tagName: 'figure',
        properties: {},
        children: [img],
      };
      const tree = makeTree([figure]);

      plugin(tree);

      // figureの中身が変わっていないことを確認
      expect(figure.children[0].tagName).toBe('img');
      // title属性はそのまま（figure内なので処理されない）
      expect(figure.children[0].properties.title).toBe('テスト');
    });
  });

  describe('日本語キャプション対応', () => {
    it('日本語のtitleが正しくキャプションになる', () => {
      const img = makeImgNode({
        src: '/photo.jpg',
        title: 'プリンターの外観',
      });
      const parent = makeParent([img]);
      const tree = makeTree([parent]);

      plugin(tree);

      const figure = parent.children[0];
      const figcaption = figure.children[1];
      expect(figcaption.children[0].value).toBe('プリンターの外観');
    });
  });

  describe('複数画像の同時処理', () => {
    it('複数のimg要素がそれぞれ正しく処理される', () => {
      const img1 = makeImgNode({ src: '/a.jpg', title: 'キャプションA' });
      const img2 = makeImgNode({ src: '/b.jpg' }); // titleなし
      const img3 = makeImgNode({ src: '/c.jpg', title: 'キャプションC' });
      const parent = makeParent([img1, img2, img3]);
      const tree = makeTree([parent]);

      plugin(tree);

      expect(parent.children[0].tagName).toBe('figure');
      expect(parent.children[1].tagName).toBe('img'); // titleなしはそのまま
      expect(parent.children[2].tagName).toBe('figure');
    });
  });
});
