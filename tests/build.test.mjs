import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'child_process';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join, extname } from 'path';
import matter from 'gray-matter';

const DIST_DIR = join(process.cwd(), 'dist');
const POSTS_DIR = join(process.cwd(), 'src/content/posts');
const PAGES_DIR = join(process.cwd(), 'src/content/pages');

/**
 * ソースの記事Markdownを再帰収集し、非draftの公開記事を返す
 */
function getPublishedPosts() {
  const files = [];
  function collect(dir) {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) collect(fullPath);
      else if (extname(entry.name) === '.md') files.push(fullPath);
    }
  }
  collect(POSTS_DIR);
  return files
    .map(f => {
      const { data } = matter(readFileSync(f, 'utf-8'));
      const dateStr = data.date instanceof Date
        ? data.date.toISOString().split('T')[0]
        : String(data.date);
      const [year, month] = dateStr.split('-');
      return { title: data.title, year, month, draft: data.draft, path: f };
    })
    .filter(p => !p.draft);
}

/**
 * ソースの固定ページMarkdownを収集し、非draftページをorder順で返す
 */
function getPublishedPages() {
  if (!existsSync(PAGES_DIR)) return [];
  return readdirSync(PAGES_DIR)
    .filter(f => extname(f) === '.md')
    .map(f => {
      const { data } = matter(readFileSync(join(PAGES_DIR, f), 'utf-8'));
      return { title: data.title, slug: data.slug, order: data.order, draft: data.draft };
    })
    .filter(p => !p.draft)
    .sort((a, b) => a.order - b.order);
}

// ソースから動的取得（ビルド前に読める）
const publishedPosts = getPublishedPosts();
const publishedPages = getPublishedPages();
const firstPost = publishedPosts[0];
const firstPage = publishedPages[0];

describe('ビルド検証', () => {
  beforeAll(() => {
    execSync('npm run build:raw', {
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

    it('robots.txtがブランチに対応するクロール方針になっている（Bug #41・#45再発防止）', () => {
      const content = readFileSync(join(DIST_DIR, 'robots.txt'), 'utf-8');
      const astroConfig = readFileSync(join(process.cwd(), 'astro.config.mjs'), 'utf-8');
      const isStaging = /const SITE_URL = 'https:\/\/staging\.reiwa\.casa'/.test(astroConfig);

      if (isStaging) {
        // staging: 検索エンジンにインデックスさせない
        expect(content).toMatch(/Disallow:\s*\//);
        expect(content).not.toMatch(/Allow:\s*\//);
        expect(content).not.toMatch(/Sitemap:/);
      } else {
        // main（本番）: インデックスを許可しSitemapを提示する（DOCUMENTATION.md 2.5.4章・4.6.4章）
        expect(content).toMatch(/Allow:\s*\//);
        expect(content).not.toMatch(/Disallow:\s*\//);
        expect(content).toMatch(/Sitemap:\s*https:\/\/reiwa\.casa\/sitemap-index\.xml/);
      }
    });

    it('robots.txtのSitemap行はreiwa.casaドメインを指す（Bug #41再発防止）', () => {
      const content = readFileSync(join(DIST_DIR, 'robots.txt'), 'utf-8');
      if (content.includes('Sitemap:')) {
        expect(content).toMatch(/Sitemap:\s*https:\/\/(staging\.)?reiwa\.casa\//);
      }
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
      expect(firstPost).toBeDefined();
      const postPath = join(
        DIST_DIR,
        `posts/${firstPost.year}/${firstPost.month}/${firstPost.title}/index.html`
      );
      expect(existsSync(postPath)).toBe(true);
    });
  });

  describe('記事一覧のページネーション（重複コンテンツ防止）', () => {
    const PAGE_SIZE = 10;
    const totalPages = Math.max(1, Math.ceil(publishedPosts.length / PAGE_SIZE));

    it('/page/1/ は生成されない（1ページ目は / が担う。重複コンテンツ防止）', () => {
      expect(existsSync(join(DIST_DIR, 'page/1/index.html'))).toBe(false);
    });

    it('/ の canonical は自身（/）を指す', () => {
      const html = readFileSync(join(DIST_DIR, 'index.html'), 'utf-8');
      expect(html).toMatch(/<link rel="canonical" href="https:\/\/[^"]+\/">/);
    });

    it('公開記事数がPAGE_SIZE超の場合のみ /page/2/ が生成される', () => {
      const page2Exists = existsSync(join(DIST_DIR, 'page/2/index.html'));
      expect(page2Exists).toBe(totalPages > 1);
    });

    it('sitemapに /page/1/ の重複URLが含まれない', () => {
      const sitemapPath = join(DIST_DIR, 'sitemap-0.xml');
      if (existsSync(sitemapPath)) {
        const sitemap = readFileSync(sitemapPath, 'utf-8');
        expect(sitemap).not.toContain('/page/1/');
      }
    });
  });

  describe('アーカイブページの生成確認', () => {
    it('年別アーカイブページが生成される', () => {
      expect(firstPost).toBeDefined();
      expect(
        existsSync(join(DIST_DIR, `posts/${firstPost.year}/index.html`))
      ).toBe(true);
    });

    it('月別アーカイブページが生成される', () => {
      expect(firstPost).toBeDefined();
      expect(
        existsSync(join(DIST_DIR, `posts/${firstPost.year}/${firstPost.month}/index.html`))
      ).toBe(true);
    });

    it('カテゴリページが生成されていない（カテゴリ機能は廃止済み）', () => {
      expect(
        existsSync(join(DIST_DIR, 'category'))
      ).toBe(false);
    });
  });

  describe('固定ページの生成確認', () => {
    it('全固定ページのHTMLが生成される', () => {
      expect(publishedPages.length).toBeGreaterThan(0);
      for (const page of publishedPages) {
        expect(
          existsSync(join(DIST_DIR, `${page.slug}/index.html`)),
          `${page.slug}/index.html が存在しない`
        ).toBe(true);
      }
    });

    it('各固定ページにタイトルが含まれている', () => {
      for (const page of publishedPages) {
        const html = readFileSync(join(DIST_DIR, `${page.slug}/index.html`), 'utf-8');
        expect(html).toContain(page.title);
      }
    });

    it('各固定ページに「記事一覧に戻る」リンクがある', () => {
      for (const page of publishedPages) {
        const html = readFileSync(join(DIST_DIR, `${page.slug}/index.html`), 'utf-8');
        expect(html).toContain('記事一覧に戻る');
        expect(html).toContain('href="/"');
      }
    });
  });

  describe('ヘッダーナビゲーションの検証（2ページ以上ケース）', () => {
    let indexHtml;

    beforeAll(() => {
      indexHtml = readFileSync(join(DIST_DIR, 'index.html'), 'utf-8');
    });

    it('トップページのヘッダーに全固定ページへのリンクがある', () => {
      for (const page of publishedPages) {
        expect(indexHtml).toContain(`href="/${page.slug}"`);
      }
    });

    it('ドロップダウン構造（nav-dropdown）が存在する（固定ページ2つ以上）', () => {
      if (publishedPages.length >= 2) {
        expect(indexHtml).toContain('nav-dropdown');
      }
    });

    it('ドロップダウントグルボタン（▾）が存在する', () => {
      if (publishedPages.length >= 2) {
        expect(indexHtml).toContain('nav-dropdown-toggle');
        expect(indexHtml).toContain('▾');
        expect(indexHtml).toContain('aria-expanded="false"');
        expect(indexHtml).toContain('aria-controls="page-menu"');
      }
    });

    it('ドロップダウンメニュー（nav-dropdown-menu）が存在する', () => {
      if (publishedPages.length >= 2) {
        expect(indexHtml).toContain('nav-dropdown-menu');
      }
    });

    it('最優先ページ（order最小）が直接リンクとして表示される', () => {
      if (publishedPages.length >= 2) {
        const topPage = publishedPages[0];
        // Astroビルドではscoped属性が付与されるため、href+classで照合
        const escapedSlug = topPage.slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        expect(indexHtml).toMatch(new RegExp(`href="/${escapedSlug}"[^>]*class="nav-dropdown-link"`));
        expect(indexHtml).toContain(`>${topPage.title}</a>`);
      }
    });

    it('ドロップダウンメニューに全固定ページが含まれている', () => {
      if (publishedPages.length >= 2) {
        const menuMatch = indexHtml.match(
          /nav-dropdown-menu[\s\S]*?<\/div>/
        );
        expect(menuMatch).not.toBeNull();
        for (const page of publishedPages) {
          expect(menuMatch[0]).toContain(page.title);
        }
      }
    });

    it('ドロップダウンのJS制御スクリプトが存在する', () => {
      expect(indexHtml).toContain('mouseenter');
      expect(indexHtml).toContain('mouseleave');
      expect(indexHtml).toContain('nav-dropdown-toggle');
      expect(indexHtml).toContain('is-open');
      expect(indexHtml).toContain('aria-expanded');
    });

    it('mouseleaveに300ms遅延が設定されている', () => {
      expect(indexHtml).toContain('300');
      expect(indexHtml).toContain('setTimeout');
    });

    it('外側クリックで閉じるハンドラが存在する', () => {
      expect(indexHtml).toContain('document.addEventListener');
      // .contains() はJS最小化後も残る（変数名のみ短縮）
      expect(indexHtml).toMatch(/\.contains\(/);
    });

    it('固定ページが各ページの出力にもドロップダウンナビを持つ', () => {
      if (publishedPages.length >= 2) {
        const pageHtml = readFileSync(join(DIST_DIR, `${firstPage.slug}/index.html`), 'utf-8');
        expect(pageHtml).toContain('nav-dropdown');
        expect(pageHtml).toContain('nav-dropdown-menu');
      }
    });
  });

  describe('タグページの生成確認', () => {
    it('タグページディレクトリが生成される', () => {
      const tagsDir = join(DIST_DIR, 'tags');
      expect(existsSync(tagsDir)).toBe(true);
    });
  });

  describe('個人ブログ化ロードマップ機能検証（FR-22〜FR-28）', () => {
    /**
     * 記事frontmatterを日付降順で取得（tags, thumbnail, summary含む）。
     * getPublishedPosts()はdate/tags/thumbnailを持たないため、この describe 専用に再取得する。
     */
    function getPublishedPostsFull() {
      const files = [];
      function collect(dir) {
        if (!existsSync(dir)) return;
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
          const fullPath = join(dir, entry.name);
          if (entry.isDirectory()) collect(fullPath);
          else if (extname(entry.name) === '.md') files.push(fullPath);
        }
      }
      collect(POSTS_DIR);
      return files
        .map((f) => {
          const { data } = matter(readFileSync(f, 'utf-8'));
          const dateStr = data.date instanceof Date
            ? data.date.toISOString().split('T')[0]
            : String(data.date);
          return { ...data, date: dateStr, path: f };
        })
        .filter((p) => !p.draft)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    const fullPosts = getPublishedPostsFull();

    describe('FR-22 サイト設定・canonical URL', () => {
      it('トップページに自身を指すcanonicalが出力される', () => {
        const html = readFileSync(join(DIST_DIR, 'index.html'), 'utf-8');
        expect(html).toMatch(/<link rel="canonical" href="https:\/\/[^"]+\/">/);
      });

      it('記事詳細ページにcanonicalが出力される', () => {
        if (fullPosts.length === 0) return;
        const post = fullPosts[0];
        const html = readFileSync(join(DIST_DIR, `posts/${post.date.split('-')[0]}/${post.date.split('-')[1]}/${post.title}/index.html`), 'utf-8');
        expect(html).toMatch(/<link rel="canonical" href="https:\/\/[^"]+\/posts\//);
      });
    });

    describe('FR-23 OGP・meta description', () => {
      it('thumbnail付き記事はog:imageが絶対URLで出力される', () => {
        const postWithThumbnail = fullPosts.find((p) => p.thumbnail);
        if (!postWithThumbnail) return;
        const html = readFileSync(
          join(DIST_DIR, `posts/${postWithThumbnail.date.split('-')[0]}/${postWithThumbnail.date.split('-')[1]}/${postWithThumbnail.title}/index.html`),
          'utf-8'
        );
        expect(html).toMatch(/<meta property="og:image" content="https:\/\/[^"]+">/);
        expect(html).toContain('twitter:card" content="summary_large_image"');
      });

      it('summary付き記事はog:description・meta descriptionにsummaryが反映される', () => {
        const postWithSummary = fullPosts.find((p) => p.summary);
        if (!postWithSummary) return;
        const html = readFileSync(
          join(DIST_DIR, `posts/${postWithSummary.date.split('-')[0]}/${postWithSummary.date.split('-')[1]}/${postWithSummary.title}/index.html`),
          'utf-8'
        );
        expect(html).toContain(`content="${postWithSummary.summary}"`);
      });
    });

    describe('FR-24 RSSフィード配信', () => {
      it('rss.xmlが生成される', () => {
        expect(existsSync(join(DIST_DIR, 'rss.xml'))).toBe(true);
      });

      it('公開記事のタイトルが全て含まれる', () => {
        const rss = readFileSync(join(DIST_DIR, 'rss.xml'), 'utf-8');
        for (const post of fullPosts) {
          expect(rss).toContain(`<title>${post.title}</title>`);
        }
      });

      it('下書き記事のタイトルが含まれない', () => {
        const rss = readFileSync(join(DIST_DIR, 'rss.xml'), 'utf-8');
        const draftTitles = readdirSync(POSTS_DIR, { recursive: true })
          .filter((f) => String(f).endsWith('.md'))
          .map((f) => matter(readFileSync(join(POSTS_DIR, String(f)), 'utf-8')).data)
          .filter((data) => data.draft)
          .map((data) => data.title);
        for (const title of draftTitles) {
          expect(rss).not.toContain(`<title>${title}</title>`);
        }
      });

      it('トップページにRSS autodiscoveryリンクがある', () => {
        const html = readFileSync(join(DIST_DIR, 'index.html'), 'utf-8');
        expect(html).toContain('type="application/rss+xml"');
      });
    });

    describe('FR-25 XMLサイトマップ生成', () => {
      it('sitemap-index.xmlが生成される', () => {
        expect(existsSync(join(DIST_DIR, 'sitemap-index.xml'))).toBe(true);
      });

      it('sitemapに/admin/配下のURLが含まれない', () => {
        const files = readdirSync(DIST_DIR).filter((f) => /^sitemap-\d+\.xml$/.test(f));
        for (const f of files) {
          const content = readFileSync(join(DIST_DIR, f), 'utf-8');
          expect(content).not.toContain('/admin/');
        }
      });
    });

    describe('FR-26 タグ一覧ページ', () => {
      it('タグ一覧ページに公開記事の全タグが含まれる', () => {
        const html = readFileSync(join(DIST_DIR, 'tags/index.html'), 'utf-8');
        const allTags = new Set(fullPosts.flatMap((p) => p.tags ?? []));
        for (const tag of allTags) {
          expect(html).toContain(tag);
        }
      });

      it('各タグの記事件数が公開記事のみから集計される', () => {
        const html = readFileSync(join(DIST_DIR, 'tags/index.html'), 'utf-8');
        const counts = new Map();
        for (const post of fullPosts) {
          for (const tag of post.tags ?? []) counts.set(tag, (counts.get(tag) ?? 0) + 1);
        }
        for (const [tag, count] of counts) {
          const escapedTag = String(tag).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          expect(html).toMatch(new RegExp(`<span class="tag-name"[^>]*>${escapedTag}</span>\\s*<span class="tag-count"[^>]*>${count}</span>`));
        }
      });
    });

    describe('FR-27 記事の前後ナビゲーション', () => {
      it('最新記事には「次の記事」が表示されない', () => {
        if (fullPosts.length === 0) return;
        const newest = fullPosts[0];
        const html = readFileSync(
          join(DIST_DIR, `posts/${newest.date.split('-')[0]}/${newest.date.split('-')[1]}/${newest.title}/index.html`),
          'utf-8'
        );
        expect(html).not.toContain('次の記事');
      });

      it('最古記事には「前の記事」が表示されない', () => {
        if (fullPosts.length === 0) return;
        const oldest = fullPosts[fullPosts.length - 1];
        const html = readFileSync(
          join(DIST_DIR, `posts/${oldest.date.split('-')[0]}/${oldest.date.split('-')[1]}/${oldest.title}/index.html`),
          'utf-8'
        );
        expect(html).not.toContain('前の記事');
      });

      it('中間の記事には前後両方のリンクが表示される（記事が3件以上の場合）', () => {
        if (fullPosts.length < 3) return;
        const middle = fullPosts[1];
        const html = readFileSync(
          join(DIST_DIR, `posts/${middle.date.split('-')[0]}/${middle.date.split('-')[1]}/${middle.title}/index.html`),
          'utf-8'
        );
        expect(html).toContain('前の記事');
        expect(html).toContain('次の記事');
      });
    });

    describe('NFR-08 ダークモード対応', () => {
      it('meta color-schemeでダーク対応を宣言する', () => {
        const html = readFileSync(join(DIST_DIR, 'index.html'), 'utf-8');
        expect(html).toContain('color-scheme" content="light dark"');
      });

      it('prefers-color-schemeによる配色切り替えがCSSに定義される（バンドル先を横断検索）', () => {
        const astroDir = join(DIST_DIR, '_astro');
        const cssFiles = existsSync(astroDir)
          ? readdirSync(astroDir).filter((f) => f.endsWith('.css'))
          : [];
        const found = cssFiles.some((f) =>
          readFileSync(join(astroDir, f), 'utf-8').includes('prefers-color-scheme:dark')
          || readFileSync(join(astroDir, f), 'utf-8').includes('prefers-color-scheme: dark')
        );
        expect(found).toBe(true);
      });
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

    it('管理画面へのリンクがフッターにある', () => {
      expect(indexHtml).toContain('href="/admin/"');
      expect(indexHtml).toContain('管理');
    });

    it('公開記事へのリンクが含まれている', () => {
      expect(firstPost).toBeDefined();
      expect(indexHtml).toContain(firstPost.title);
      expect(indexHtml).toContain(`href="/posts/${firstPost.year}/${firstPost.month}/`);
    });

    it('カテゴリリンクが含まれていない', () => {
      expect(indexHtml).not.toContain('href="/category/');
    });

    it('タグリンクが含まれている', () => {
      expect(indexHtml).toContain('href="/tags/');
    });

    it('先頭サムネイルはLCP候補として高優先度で読み込む', () => {
      const firstThumbnailMatch = indexHtml.match(/<img[^>]*class="post-thumbnail"[^>]*>/);
      expect(firstThumbnailMatch).not.toBeNull();
      expect(firstThumbnailMatch[0]).toContain('width="1200"');
      expect(firstThumbnailMatch[0]).toContain('height="800"');
      expect(firstThumbnailMatch[0]).toContain('loading="eager"');
      expect(firstThumbnailMatch[0]).toContain('fetchpriority="high"');
      expect(firstThumbnailMatch[0]).toContain('decoding="async"');
    });

    it('記事カードはコンテナクエリでサイズに応じたレイアウトを適用する', () => {
      expect(indexHtml).toContain('container-type:inline-size');
      expect(indexHtml).toContain('@container');
    });

    it('7件目以降の記事カードはcontent-visibilityで描画負荷を抑える', () => {
      expect(indexHtml).toContain('content-visibility:auto');
      expect(indexHtml).toContain('contain-intrinsic-size:auto 220px');
      const indexSource = readFileSync(join(process.cwd(), 'src/pages/index.astro'), 'utf-8');
      expect(indexSource).toContain('.post-card:nth-child(n+7)');
    });

    it('ナビゲーションにアクセシブルなラベルとfocus-visibleスタイルがある', () => {
      expect(indexHtml).toContain('aria-label="メイン"');
      expect(indexHtml).toContain('aria-labelledby="archive-heading"');
      expect(indexHtml).toContain(':focus-visible');
    });

    it('アーカイブナビゲーションが含まれている', () => {
      expect(firstPost).toBeDefined();
      expect(indexHtml).toContain('アーカイブ');
      expect(indexHtml).toContain(`href="/posts/${firstPost.year}"`);
    });

    it('copyright表記がある', () => {
      expect(indexHtml).toMatch(/(&copy;|©).*tbiのブログ/);
    });

    it('Netlify Identityスクリプトが含まれていない（GitHub OAuthに移行済み）', () => {
      expect(indexHtml).not.toContain('identity.netlify.com');
      expect(indexHtml).not.toContain('netlifyIdentity');
    });
  });

  describe('個別記事ページHTMLの検証', () => {
    it('記事ページに「記事一覧に戻る」リンクがある', () => {
      expect(firstPost).toBeDefined();
      const postHtml = join(
        DIST_DIR,
        `posts/${firstPost.year}/${firstPost.month}/${firstPost.title}/index.html`
      );
      expect(existsSync(postHtml), `記事HTMLが存在しない: ${postHtml}`).toBe(true);
      const html = readFileSync(postHtml, 'utf-8');
      expect(html).toContain('記事一覧に戻る');
      expect(html).toContain('href="/"');
    });
  });

  describe('画像関連の検証', () => {
    it('アップロード画像ディレクトリが存在する', () => {
      expect(existsSync(join(DIST_DIR, 'images/uploads'))).toBe(true);
    });

    it('ビルド後の画像にEXIF回転が残っていない（ピクセルデータに反映済み）', async () => {
      const sharp = (await import('sharp')).default;
      const uploadsDir = join(DIST_DIR, 'images/uploads');
      const files = readdirSync(uploadsDir).filter(
        (f) => /\.(jpe?g|png|webp)$/i.test(f)
      );
      expect(files.length).toBeGreaterThan(0);

      for (const file of files) {
        const meta = await sharp(join(uploadsDir, file)).metadata();
        // orientation が 1（正常）または undefined（タグなし）であること
        // 2〜8 の場合はEXIF回転が未適用
        expect(
          meta.orientation === undefined || meta.orientation === 1,
          `${file}: EXIF orientation=${meta.orientation}（回転未適用）`
        ).toBe(true);
      }
    });

    it('ビルド後の画像がMAX_WIDTH（1200px）以下にリサイズされている', async () => {
      const sharp = (await import('sharp')).default;
      const uploadsDir = join(DIST_DIR, 'images/uploads');
      const files = readdirSync(uploadsDir).filter(
        (f) => /\.(jpe?g|png|webp)$/i.test(f)
      );

      for (const file of files) {
        const meta = await sharp(join(uploadsDir, file)).metadata();
        expect(
          meta.width <= 1200,
          `${file}: width=${meta.width}px（1200px以下であるべき）`
        ).toBe(true);
      }
    });
  });

  describe('URLマッピングJSON（url-map.json）の検証', () => {
    let urlMap;

    beforeAll(() => {
      const urlMapPath = join(DIST_DIR, 'admin/url-map.json');
      expect(existsSync(urlMapPath)).toBe(true);
      urlMap = JSON.parse(readFileSync(urlMapPath, 'utf-8'));
    });

    it('url-map.jsonがdist/admin/に出力されている', () => {
      expect(existsSync(join(DIST_DIR, 'admin/url-map.json'))).toBe(true);
    });

    it('有効なJSONオブジェクトである', () => {
      expect(typeof urlMap).toBe('object');
      expect(urlMap).not.toBeNull();
      expect(Array.isArray(urlMap)).toBe(false);
    });

    it('1件以上のエントリが含まれている', () => {
      expect(Object.keys(urlMap).length).toBeGreaterThan(0);
    });

    it('キーがYYYY/MM/スラグ形式である', () => {
      for (const key of Object.keys(urlMap)) {
        expect(key).toMatch(/^\d{4}\/\d{2}\/.+$/);
      }
    });

    it('値が/posts/YYYY/MM/スラグ形式のURLパスである', () => {
      for (const value of Object.values(urlMap)) {
        expect(value).toMatch(/^\/posts\/\d{4}\/\d{2}\/.+$/);
      }
    });

    it('キーと値のスラグ部分が一致している', () => {
      for (const [key, value] of Object.entries(urlMap)) {
        expect(value).toBe(`/posts/${key}`);
      }
    });
  });

  describe('rehype-image-captionプラグインの適用確認', () => {
    it('title付き画像がfigure/figcaptionに変換されている', () => {
      // dist/posts/ 内の全記事HTMLから figure タグを持つものを動的に検索
      const postsDir = join(DIST_DIR, 'posts');
      let foundFigure = false;

      function searchForFigure(dir) {
        if (!existsSync(dir)) return;
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
          if (foundFigure) return;
          const fullPath = join(dir, entry.name);
          if (entry.isDirectory()) {
            searchForFigure(fullPath);
          } else if (entry.name === 'index.html') {
            const html = readFileSync(fullPath, 'utf-8');
            if (html.includes('<figure') && html.includes('<figcaption')) {
              foundFigure = true;
              // figure/figcaptionが存在する記事で追加検証
              expect(html).toContain('loading="lazy"');
              expect(html).toContain('decoding="async"');
            }
          }
        }
      }
      searchForFigure(postsDir);
      expect(foundFigure, 'figure/figcaptionを含む記事が1件もない').toBe(true);
    });
  });

  describe('Modern Web Guidanceアクセシビリティ検証', () => {
    it('本文リンクに下線・識別色・focus-visibleが定義されている', () => {
      const postPage = readFileSync(
        join(process.cwd(), 'src/pages/posts/[year]/[month]/[slug].astro'),
        'utf-8'
      );
      const fixedPage = readFileSync(
        join(process.cwd(), 'src/pages/[slug].astro'),
        'utf-8'
      );
      for (const source of [postPage, fixedPage]) {
        expect(source).toContain(':global(a)');
        expect(source.includes('color: #1a73e8') || source.includes('color: var(--color-link)')).toBe(true);
        expect(source).toContain('text-decoration: underline');
        expect(source).toContain(':global(a:focus-visible)');
      }
    });

    it('本文リンク色（--color-link）はライト/ダーク両配色で背景とのコントラスト比4.5:1以上を満たす（Bug #43再発防止）', () => {
      // パターンマッチ（var(--color-link)の存在確認）だけでは配色トークンの実値変更による
      // コントラスト劣化を検知できないため、実際のWCAG相対輝度計算で検証する。
      function relativeLuminance(hex) {
        const c = hex.replace('#', '');
        const [r, g, b] = [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16) / 255);
        const f = (v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      }
      function contrastRatio(hexA, hexB) {
        const [l1, l2] = [relativeLuminance(hexA), relativeLuminance(hexB)].sort((a, b) => b - a);
        return (l1 + 0.05) / (l2 + 0.05);
      }
      const baseAstro = readFileSync(join(process.cwd(), 'src/layouts/Base.astro'), 'utf-8');
      const hex = /#[0-9a-fA-F]{6}/;
      const rootBlock = baseAstro.split(':root {')[1].split('\n    }')[0];
      const darkBlock = baseAstro.split('prefers-color-scheme: dark)')[1].split('\n      }')[0];
      const lightBg = rootBlock.match(new RegExp(`--color-bg:\\s*(${hex.source})`))[1];
      const lightLink = rootBlock.match(new RegExp(`--color-link:\\s*(${hex.source})`))[1];
      const darkBg = darkBlock.match(new RegExp(`--color-bg:\\s*(${hex.source})`))[1];
      const darkLink = darkBlock.match(new RegExp(`--color-link:\\s*(${hex.source})`))[1];

      expect(contrastRatio(lightBg, lightLink), `light: ${lightLink} on ${lightBg}`).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(darkBg, darkLink), `dark: ${darkLink} on ${darkBg}`).toBeGreaterThanOrEqual(4.5);
    });

    it('コードブロック用rehypeプラグインが登録されている', () => {
      const astroConfig = readFileSync(join(process.cwd(), 'astro.config.mjs'), 'utf-8');
      expect(astroConfig).toContain('rehypeFocusableCodeBlocks');
      expect(astroConfig).toContain('rehypePlugins: [rehypeImageCaption, rehypeFocusableCodeBlocks]');
    });
  });

  describe('ビルドパイプライン完全性検証（FR-20）', () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf-8'));

    it('buildスクリプトに4段階パイプラインが定義されている', () => {
      const buildScript = packageJson.scripts['build:raw'] || '';
      // 4段階: normalize-images → organize-posts → astro build
      // (image-optimizeはAstro integration経由で自動実行)
      expect(buildScript).toContain('normalize-images');
      expect(buildScript).toContain('organize-posts');
      expect(buildScript).toContain('astro build');
    });
  });

  describe('セキュリティヘッダー検証（SEC-10）', () => {
    const headersPath = join(process.cwd(), 'public/_headers');
    const headersContent = readFileSync(headersPath, 'utf-8');
    // パスルール行（行頭 /admin/*）以降を admin セクションとして抽出
    const adminMatch = headersContent.match(/^\/admin\/\*\r?\n([\s\S]*)$/m);
    const adminSection = adminMatch ? adminMatch[1] : '';

    it('X-Content-Type-Optionsが設定されている', () => {
      expect(headersContent).toContain('X-Content-Type-Options: nosniff');
    });

    it('Referrer-Policyが設定されている', () => {
      expect(headersContent).toContain('Referrer-Policy: strict-origin-when-cross-origin');
    });

    it('Permissions-Policyが設定されている', () => {
      expect(headersContent).toContain('Permissions-Policy:');
    });

    it('Strict-Transport-Securityが設定されている', () => {
      expect(headersContent).toContain('Strict-Transport-Security:');
    });

    it('/admin/*にContent-Security-Policyが設定されている', () => {
      expect(adminSection).toContain('Content-Security-Policy:');
    });

    it('/admin/*にX-Frame-Options: SAMEORIGINが設定されている', () => {
      expect(adminSection).toContain('X-Frame-Options: SAMEORIGIN');
    });

    it('/admin/*にCOOP: same-origin-allow-popupsが設定されている', () => {
      expect(adminSection).toContain('Cross-Origin-Opener-Policy: same-origin-allow-popups');
    });

    it('CSP connect-src に blob: が含まれている（Bug #29: Decap CMS画像保存時の fetch(blobURL) に必要）', () => {
      const cspMatch = adminSection.match(/Content-Security-Policy:(.+)/);
      expect(cspMatch, 'CSPヘッダーが見つからない').toBeTruthy();
      const connectSrcMatch = cspMatch[1].match(/connect-src\s+([^;]+)/);
      expect(connectSrcMatch, 'connect-srcディレクティブが見つからない').toBeTruthy();
      expect(connectSrcMatch[1]).toContain('blob:');
    });
  });

  describe('_headersヘッダー重複防止検証（Bug #28 再発防止）', () => {
    const headersPath = join(process.cwd(), 'public/_headers');
    const headersContent = readFileSync(headersPath, 'utf-8');

    // Cloudflare Pages は /* と /admin/* で同名ヘッダーを指定すると
    // オーバーライドではなくAppend（重複送信）する。
    // 同一値の重複は安全だが、異なる値の重複はブラウザが最も厳しい値を採用するため危険。
    // CSPなど /admin/* でのみ必要なヘッダーは /* に含めてはならない。
    const adminOnlyHeaders = [
      'Content-Security-Policy',  // /admin/* 固有のポリシーが必要
    ];

    // _headers ファイルをパースして各パスルールのヘッダー名と値を抽出
    function parseHeadersFile(content) {
      const sections = {};
      let currentPath = null;
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed.startsWith('#') || trimmed === '') continue;
        if (!trimmed.startsWith(' ') && !trimmed.startsWith('\t') && !trimmed.includes(':')) {
          // 空白で始まらず : を含まない = パスルール
          currentPath = trimmed;
          if (!sections[currentPath]) sections[currentPath] = [];
        } else if (trimmed.startsWith('/')) {
          currentPath = trimmed;
          if (!sections[currentPath]) sections[currentPath] = [];
        } else if (currentPath && trimmed.includes(':')) {
          const headerName = trimmed.split(':')[0].trim();
          const headerValue = trimmed.split(':').slice(1).join(':').trim();
          sections[currentPath].push({ name: headerName, value: headerValue });
        }
      }
      return sections;
    }

    it('/* と /admin/* で同名ヘッダーが異なる値で重複していない', () => {
      // 同一値の重複は安全（ブラウザが正しく処理する）。異なる値の重複のみ検出する。
      const sections = parseHeadersFile(headersContent);
      const globalHeaders = sections['/*'] || [];
      const adminHeaders = sections['/admin/*'] || [];
      const conflicts = [];
      for (const admin of adminHeaders) {
        const global = globalHeaders.find(g => g.name === admin.name);
        if (global && global.value !== admin.value) {
          conflicts.push(`${admin.name}: /*="${global.value}" vs /admin/*="${admin.value}"`);
        }
      }
      expect(
        conflicts,
        `/* と /admin/* で異なる値のヘッダー: ${conflicts.join('; ')}`
      ).toEqual([]);
    });

    it('/admin/* 固有のヘッダーが /* に含まれていない', () => {
      const sections = parseHeadersFile(headersContent);
      const globalHeaderNames = (sections['/*'] || []).map(h => h.name);
      for (const header of adminOnlyHeaders) {
        expect(
          globalHeaderNames,
          `${header} は /admin/* 固有のため /* に含めてはならない`
        ).not.toContain(header);
      }
    });
  });
});
