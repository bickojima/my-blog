import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, extname, relative } from 'path';
import matter from 'gray-matter';

const POSTS_DIR = join(process.cwd(), 'src/content/posts');
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * 全Markdownファイルを再帰的に収集
 */
function collectMarkdownFiles(dir) {
  const files = [];
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectMarkdownFiles(fullPath));
    } else if (extname(entry.name) === '.md') {
      files.push(fullPath);
    }
  }
  return files;
}

const markdownFiles = collectMarkdownFiles(POSTS_DIR);

describe('コンテンツ（Markdownファイル）の検証', () => {
  it('記事ファイルが1つ以上存在する', () => {
    expect(markdownFiles.length).toBeGreaterThan(0);
  });

  describe.each(
    markdownFiles.map((f) => [f.replace(process.cwd() + '/', ''), f])
  )('%s', (_relativePath, filePath) => {
    const raw = readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content } = matter(raw);

    it('フロントマターが正しくパースできる', () => {
      expect(frontmatter).toBeDefined();
      expect(typeof frontmatter).toBe('object');
    });

    it('title（タイトル）が文字列で存在する', () => {
      expect(frontmatter.title).toBeDefined();
      expect(typeof frontmatter.title).toBe('string');
      expect(frontmatter.title.trim().length).toBeGreaterThan(0);
    });

    it('date（日付）がYYYY-MM-DD形式である', () => {
      expect(frontmatter.date).toBeDefined();
      const dateStr =
        frontmatter.date instanceof Date
          ? frontmatter.date.toISOString().split('T')[0]
          : String(frontmatter.date);
      expect(dateStr).toMatch(DATE_REGEX);
      const parsed = new Date(dateStr);
      expect(parsed.toString()).not.toBe('Invalid Date');
    });

    it('draft（下書き）がboolean型である', () => {
      expect(typeof frontmatter.draft).toBe('boolean');
    });

    it('categoryフィールドが存在しない', () => {
      expect(frontmatter.category).toBeUndefined();
    });

    it('ファイルがyyyy/mm/ディレクトリに配置されている', () => {
      const relPath = relative(POSTS_DIR, filePath);
      expect(relPath).toMatch(/^\d{4}\/\d{2}\/.+\.md$/);
    });

    it('ファイルのディレクトリがfrontmatterの日付と一致する', () => {
      const relPath = relative(POSTS_DIR, filePath);
      const [dirYear, dirMonth] = relPath.split('/');
      const dateStr =
        frontmatter.date instanceof Date
          ? frontmatter.date.toISOString().split('T')[0]
          : String(frontmatter.date);
      const [fmYear, fmMonth] = dateStr.split('-');
      expect(dirYear).toBe(fmYear);
      expect(dirMonth).toBe(fmMonth);
    });

    it('tags（タグ）が配列である（存在する場合）', () => {
      if (frontmatter.tags !== undefined) {
        expect(Array.isArray(frontmatter.tags)).toBe(true);
        for (const tag of frontmatter.tags) {
          expect(typeof tag).toBe('string');
          expect(tag.trim().length).toBeGreaterThan(0);
        }
      }
    });

    it('thumbnail（サムネイル）が/images/で始まるパスである（存在する場合）', () => {
      if (frontmatter.thumbnail) {
        expect(frontmatter.thumbnail).toMatch(/^\/images\//);
      }
    });

    it('本文が空でない', () => {
      expect(content.trim().length).toBeGreaterThan(0);
    });
  });
});
