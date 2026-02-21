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
    const adminMatch = headersContent.match(/^\/admin\/\*\n([\s\S]*)$/m);
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
  });

  describe('_headersヘッダー重複防止検証（Bug #28 再発防止）', () => {
    const headersPath = join(process.cwd(), 'public/_headers');
    const headersContent = readFileSync(headersPath, 'utf-8');

    // Cloudflare Pages は /* と /admin/* で同名ヘッダーを指定すると
    // オーバーライドではなくAppend（重複送信）する。
    // ブラウザは重複ヘッダーの最も厳しい値を採用するため、
    // 管理画面で緩和が必要なヘッダーを /* に含めてはならない。
    const adminOnlyHeaders = [
      'Cross-Origin-Opener-Policy',
      'Cross-Origin-Resource-Policy',
      'X-Frame-Options',
    ];

    // _headers ファイルをパースして各パスルールのヘッダーを抽出
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
          sections[currentPath].push(headerName);
        }
      }
      return sections;
    }

    it('/* と /admin/* で同名ヘッダーが重複していない', () => {
      const sections = parseHeadersFile(headersContent);
      const globalHeaders = sections['/*'] || [];
      const adminHeaders = sections['/admin/*'] || [];
      const duplicates = globalHeaders.filter(h => adminHeaders.includes(h));
      expect(
        duplicates,
        `/* と /admin/* で重複するヘッダー: ${duplicates.join(', ')}。Cloudflare Pagesはオーバーライドせずappendするため、管理画面で異なる値が必要なヘッダーを /* に含めてはならない。`
      ).toEqual([]);
    });

    it('管理画面で緩和が必要なヘッダーが /* に含まれていない', () => {
      const sections = parseHeadersFile(headersContent);
      const globalHeaders = sections['/*'] || [];
      for (const header of adminOnlyHeaders) {
        expect(
          globalHeaders,
          `${header} は /admin/* で異なる値が必要なため /* に含めてはならない`
        ).not.toContain(header);
      }
    });
  });
});
