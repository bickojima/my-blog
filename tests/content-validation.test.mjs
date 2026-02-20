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

    it('thumbnail（サムネイル）が/images/で始まるパスであり画像ファイルが実在する', () => {
      if (frontmatter.thumbnail) {
        expect(frontmatter.thumbnail).toMatch(/^\/images\//);
        const imagePath = join(process.cwd(), 'public', frontmatter.thumbnail);
        expect(
          existsSync(imagePath),
          `サムネイル画像が見つかりません: ${frontmatter.thumbnail}`
        ).toBe(true);
      }
    });

    it('本文が空でない', () => {
      expect(content.trim().length).toBeGreaterThan(0);
    });
  });
});

describe('固定ページ（pages）コンテンツの検証', () => {
  const PAGES_DIR = join(process.cwd(), 'src/content/pages');
  const pageFiles = existsSync(PAGES_DIR)
    ? readdirSync(PAGES_DIR).filter(f => extname(f) === '.md').map(f => join(PAGES_DIR, f))
    : [];

  it('固定ページファイルが1つ以上存在する', () => {
    expect(pageFiles.length).toBeGreaterThan(0);
  });

  describe.each(
    pageFiles.map(f => [f.replace(process.cwd() + '/', ''), f])
  )('%s', (_relativePath, filePath) => {
    const raw = readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content } = matter(raw);

    it('titleが文字列で存在する', () => {
      expect(frontmatter.title).toBeDefined();
      expect(typeof frontmatter.title).toBe('string');
      expect(frontmatter.title.trim().length).toBeGreaterThan(0);
    });

    it('slugが半角英数字とハイフンのみである', () => {
      expect(frontmatter.slug).toBeDefined();
      expect(frontmatter.slug).toMatch(/^[a-z0-9-]+$/);
    });

    it('ファイル名がslugフィールドと一致する', () => {
      // CMS config.ymlのslugテンプレートが{{fields.slug}}であることの実データ検証
      // {{slug}}（タイトルベース）だとファイル名が日本語タイトルになる不具合の再発防止
      const fileName = filePath.split('/').pop().replace('.md', '');
      expect(fileName).toBe(frontmatter.slug);
    });

    it('orderが数値である', () => {
      expect(typeof frontmatter.order).toBe('number');
    });

    it('本文が空でない', () => {
      expect(content.trim().length).toBeGreaterThan(0);
    });
  });
});

describe('画像回転（EXIF orientation）対応の検証', () => {
  it('ソース画像にEXIF回転が残っていない（ピクセルデータに反映済み）', async () => {
    const sharp = (await import('sharp')).default;
    const uploadsDir = join(process.cwd(), 'public/images/uploads');
    if (!existsSync(uploadsDir)) return;

    const files = readdirSync(uploadsDir).filter(
      (f) => /\.(jpe?g|png|webp)$/i.test(f)
    );

    for (const file of files) {
      const meta = await sharp(join(uploadsDir, file)).metadata();
      expect(
        meta.orientation === undefined || meta.orientation === 1,
        `${file}: EXIF orientation=${meta.orientation}（ソース画像の回転が未修正）`
      ).toBe(true);
    }
  });

  it('image-optimize.mjs で .rotate() が呼ばれている', () => {
    const src = readFileSync(
      join(process.cwd(), 'src/integrations/image-optimize.mjs'),
      'utf-8'
    );
    expect(src).toContain('.rotate()');
  });

  it('image-optimize.mjs でEXIF orientationによる幅の補正がある', () => {
    const src = readFileSync(
      join(process.cwd(), 'src/integrations/image-optimize.mjs'),
      'utf-8'
    );
    // orientation >= 5 で width/height を入れ替える処理
    expect(src).toContain('orientation');
    expect(src).toContain('effectiveWidth');
  });

  it('Base.astro に image-orientation: from-image が設定されている', () => {
    const src = readFileSync(
      join(process.cwd(), 'src/layouts/Base.astro'),
      'utf-8'
    );
    expect(src).toContain('image-orientation: from-image');
  });
});
