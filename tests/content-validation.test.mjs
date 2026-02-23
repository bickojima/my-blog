import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, extname, relative, basename } from 'path';
import matter from 'gray-matter';

const POSTS_DIR = join(process.cwd(), 'src/content/posts');
const PAGES_DIR = join(process.cwd(), 'src/content/pages');
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
    markdownFiles.map((f) => [relative(process.cwd(), f).replace(/\\/g, '/'), f])
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
      const relPath = relative(POSTS_DIR, filePath).replace(/\\/g, '/');
      expect(relPath).toMatch(/^\d{4}\/\d{2}\/.+\.md$/);
    });

    it('ファイルのディレクトリがfrontmatterの日付と一致する', () => {
      const relPath = relative(POSTS_DIR, filePath).replace(/\\/g, '/');
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
  const pageFiles = existsSync(PAGES_DIR)
    ? readdirSync(PAGES_DIR).filter(f => extname(f) === '.md').map(f => join(PAGES_DIR, f))
    : [];

  it('固定ページファイルが1つ以上存在する', () => {
    expect(pageFiles.length).toBeGreaterThan(0);
  });

  describe.each(
    pageFiles.map(f => [relative(process.cwd(), f).replace(/\\/g, '/'), f])
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
      const fileName = basename(filePath, '.md');
      expect(fileName).toBe(frontmatter.slug);
    });

    it('orderが数値である', () => {
      expect(typeof frontmatter.order).toBe('number');
    });

    it('draftがboolean型である（存在する場合）', () => {
      if (frontmatter.draft !== undefined) {
        expect(typeof frontmatter.draft).toBe('boolean');
      }
    });

    it('slugが予約語でない（posts, tags, admin）', () => {
      const reservedSlugs = ['posts', 'tags', 'admin'];
      expect(
        reservedSlugs.includes(frontmatter.slug),
        `slugが予約語です: ${frontmatter.slug}（${reservedSlugs.join(', ')}は使用不可）`
      ).toBe(false);
    });

    it('本文が空でない', () => {
      expect(content.trim().length).toBeGreaterThan(0);
    });
  });
});

describe('ヘッダーナビゲーション条件分岐の検証（Base.astroソース）', () => {
  const baseAstro = readFileSync(
    join(process.cwd(), 'src/layouts/Base.astro'),
    'utf-8'
  );

  describe('3分岐テンプレートロジック', () => {
    it('0件分岐: navPages.length === 0 → null が返る', () => {
      // テンプレートに `: null}` が存在する（0件時は何も描画しない）
      expect(baseAstro).toContain(': null}');
    });

    it('1件分岐: navPages.length === 1 → 直接<a>リンク（ドロップダウンなし）', () => {
      // 1件分岐: navPages.length === 1 のチェックが存在する
      expect(baseAstro).toContain('navPages.length === 1');
      // nav-dropdown-linkクラスではなく素の<a>タグ
      expect(baseAstro).toMatch(/navPages\.length === 1.*[\r\n]+.*<a href/);
    });

    it('2件以上分岐: navPages.length > 1 → ドロップダウン構造', () => {
      expect(baseAstro).toContain('navPages.length > 1');
      expect(baseAstro).toContain('nav-dropdown');
      expect(baseAstro).toContain('nav-dropdown-link');
      expect(baseAstro).toContain('nav-dropdown-toggle');
      expect(baseAstro).toContain('nav-dropdown-menu');
    });
  });

  describe('navPagesデータ取得ロジック', () => {
    it('draftフィルタ: 下書きページを除外している', () => {
      expect(baseAstro).toContain('.filter(p => !p.data.draft)');
    });

    it('orderソート: 昇順で並べ替えている', () => {
      expect(baseAstro).toContain('.sort((a, b) => a.data.order - b.data.order)');
    });

    it('pagesコレクションから取得している', () => {
      expect(baseAstro).toContain("getCollection('pages')");
    });
  });

  describe('ドロップダウンJS制御', () => {
    it('dropdownがnullの場合のガード（if文）が存在する', () => {
      expect(baseAstro).toContain("if (dropdown)");
    });

    it('mouseenter でis-openクラスを追加する', () => {
      expect(baseAstro).toContain("addEventListener('mouseenter'");
      expect(baseAstro).toContain("classList.add('is-open')");
    });

    it('mouseleave で300ms遅延後にis-openクラスを削除する', () => {
      expect(baseAstro).toContain("addEventListener('mouseleave'");
      expect(baseAstro).toContain('setTimeout');
      expect(baseAstro).toContain('300');
      expect(baseAstro).toContain("classList.remove('is-open')");
    });

    it('▾ボタンクリックでトグルする', () => {
      expect(baseAstro).toContain("addEventListener('click'");
      expect(baseAstro).toContain("classList.toggle('is-open')");
    });

    it('外側クリックで閉じる', () => {
      expect(baseAstro).toContain("document.addEventListener('click'");
      expect(baseAstro).toContain('dropdown.contains');
    });
  });
});

describe('固定ページフィールドの境界値・一意性検証', () => {
  const pageFiles = existsSync(PAGES_DIR)
    ? readdirSync(PAGES_DIR).filter(f => extname(f) === '.md').map(f => join(PAGES_DIR, f))
    : [];

  const allPages = pageFiles.map(f => {
    const raw = readFileSync(f, 'utf-8');
    const { data } = matter(raw);
    return { file: basename(f), ...data };
  });

  it('全固定ページのorderが整数である', () => {
    for (const page of allPages) {
      expect(
        Number.isInteger(page.order),
        `${page.file}: order=${page.order} は整数ではない`
      ).toBe(true);
    }
  });

  it('全固定ページのorderが1以上の正の整数である', () => {
    for (const page of allPages) {
      expect(
        page.order >= 1,
        `${page.file}: order=${page.order} は1未満の不正値`
      ).toBe(true);
    }
  });

  it('全固定ページのslugが空でない', () => {
    for (const page of allPages) {
      expect(
        page.slug && page.slug.trim().length > 0,
        `${page.file}: slugが空`
      ).toBe(true);
    }
  });

  it('slugが一意である（重複なし）', () => {
    const slugs = allPages.map(p => p.slug);
    const uniqueSlugs = new Set(slugs);
    expect(
      slugs.length,
      `slug重複あり: ${slugs.filter((s, i) => slugs.indexOf(s) !== i).join(', ')}`
    ).toBe(uniqueSlugs.size);
  });

  it('orderが一意である（同じ表示順のページがない）', () => {
    const orders = allPages.map(p => p.order);
    const uniqueOrders = new Set(orders);
    expect(
      orders.length,
      `order重複あり: ${orders.filter((o, i) => orders.indexOf(o) !== i).join(', ')}`
    ).toBe(uniqueOrders.size);
  });

  it('全固定ページのtitleが空でない', () => {
    for (const page of allPages) {
      expect(
        page.title && page.title.trim().length > 0,
        `${page.file}: titleが空`
      ).toBe(true);
    }
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
