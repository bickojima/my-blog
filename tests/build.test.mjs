import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'child_process';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const DIST_DIR = join(process.cwd(), 'dist');

describe('ビルド検証', () => {
  beforeAll(() => {
    execSync('npm run build', {
      cwd: process.cwd(),
      stdio: 'pipe',
      timeout: 120000,
    });
  }, 180000);

  describe('ビルド成果物の存在確認', () => {
    it('distディレクトリが生成される', () => {
      expect(existsSync(DIST_DIR)).toBe(true);
    });

    it('トップページ（index.html）が生成される', () => {
      expect(existsSync(join(DIST_DIR, 'index.html'))).toBe(true);
    });

    it('管理画面（admin/index.html）がコピーされる', () => {
      expect(existsSync(join(DIST_DIR, 'admin/index.html'))).toBe(true);
    });

    it('CMS設定（admin/config.yml）がコピーされる', () => {
      expect(existsSync(join(DIST_DIR, 'admin/config.yml'))).toBe(true);
    });

    it('faviconファイルが存在する', () => {
      expect(existsSync(join(DIST_DIR, 'favicon.svg'))).toBe(true);
      expect(existsSync(join(DIST_DIR, 'favicon.ico'))).toBe(true);
    });

    it('robots.txtが存在する', () => {
      expect(existsSync(join(DIST_DIR, 'robots.txt'))).toBe(true);
    });

    it('_headersファイルが存在する', () => {
      expect(existsSync(join(DIST_DIR, '_headers'))).toBe(true);
    });

    it('_redirectsファイルが存在する', () => {
      expect(existsSync(join(DIST_DIR, '_redirects'))).toBe(true);
    });
  });

  describe('記事ページの生成確認', () => {
    it('公開記事のページが生成されている', () => {
      const postsDir = join(DIST_DIR, 'posts');
      expect(existsSync(postsDir)).toBe(true);

      const entries = readdirSync(postsDir, { withFileTypes: true });
      const directories = entries.filter((e) => e.isDirectory());
      expect(directories.length).toBeGreaterThan(0);
    });

    it('記事ページがyyyy/mm/記事名の構造で生成されている', () => {
      const postPath = join(
        DIST_DIR,
        'posts/2026/02/ブラザープリンターを買った話/index.html'
      );
      expect(existsSync(postPath)).toBe(true);
    });
  });

  describe('アーカイブページの生成確認', () => {
    it('年別アーカイブページが生成される', () => {
      expect(
        existsSync(join(DIST_DIR, 'posts/2026/index.html'))
      ).toBe(true);
    });

    it('月別アーカイブページが生成される', () => {
      expect(
        existsSync(join(DIST_DIR, 'posts/2026/02/index.html'))
      ).toBe(true);
    });

    it('カテゴリページが生成されていない', () => {
      expect(
        existsSync(join(DIST_DIR, 'category'))
      ).toBe(false);
    });
  });

  describe('タグページの生成確認', () => {
    it('タグページディレクトリが生成される', () => {
      const tagsDir = join(DIST_DIR, 'tags');
      expect(existsSync(tagsDir)).toBe(true);
    });
  });

  describe('トップページHTMLの検証', () => {
    let indexHtml;

    beforeAll(() => {
      indexHtml = readFileSync(join(DIST_DIR, 'index.html'), 'utf-8');
    });

    it('HTML5 doctype宣言がある', () => {
      expect(indexHtml).toMatch(/<!DOCTYPE html>/i);
    });

    it('lang="ja"が設定されている', () => {
      expect(indexHtml).toContain('lang="ja"');
    });

    it('viewportメタタグが設定されている', () => {
      expect(indexHtml).toContain(
        'name="viewport" content="width=device-width, initial-scale=1.0"'
      );
    });

    it('サイトタイトルが含まれている', () => {
      expect(indexHtml).toContain('tbiのブログ');
    });

    it('「記事一覧」見出しが含まれている', () => {
      expect(indexHtml).toContain('記事一覧');
    });

    it('管理画面へのリンクがある', () => {
      expect(indexHtml).toContain('href="/admin/"');
      expect(indexHtml).toContain('管理画面');
    });

    it('公開記事へのリンクが含まれている', () => {
      expect(indexHtml).toContain('ブラザープリンターを買った話');
      expect(indexHtml).toContain('href="/posts/2026/02/');
    });

    it('カテゴリリンクが含まれていない', () => {
      expect(indexHtml).not.toContain('href="/category/');
    });

    it('タグリンクが含まれている', () => {
      expect(indexHtml).toContain('href="/tags/');
    });

    it('アーカイブナビゲーションが含まれている', () => {
      expect(indexHtml).toContain('アーカイブ');
      expect(indexHtml).toContain('href="/posts/2026"');
    });

    it('copyright表記がある', () => {
      expect(indexHtml).toMatch(/(&copy;|©).*tbiのブログ/);
    });
  });

  describe('個別記事ページHTMLの検証', () => {
    it('記事ページに「記事一覧に戻る」リンクがある', () => {
      const postHtml = join(
        DIST_DIR,
        'posts/2026/02/ブラザープリンターを買った話/index.html'
      );
      if (existsSync(postHtml)) {
        const html = readFileSync(postHtml, 'utf-8');
        expect(html).toContain('記事一覧に戻る');
        expect(html).toContain('href="/"');
      }
    });
  });

  describe('画像関連の検証', () => {
    it('アップロード画像ディレクトリが存在する', () => {
      expect(existsSync(join(DIST_DIR, 'images/uploads'))).toBe(true);
    });
  });

  describe('rehype-image-captionプラグインの適用確認', () => {
    it('title付き画像がfigure/figcaptionに変換されている', () => {
      const htmlPath = join(
        DIST_DIR,
        'posts/2026/02/ブラザープリンターを買った話/index.html'
      );
      expect(existsSync(htmlPath)).toBe(true);

      const html = readFileSync(htmlPath, 'utf-8');
      expect(html).toContain('<figure');
      expect(html).toContain('<figcaption');
      expect(html).toContain('プリンター');
      expect(html).toContain('loading="lazy"');
      expect(html).toContain('decoding="async"');
    });
  });
});
