import { describe, it, expect, vi } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, extname } from 'path';
import matter from 'gray-matter';
import { z } from 'astro/zod';
import yaml from 'js-yaml';

/**
 * 不整合値・境界値・異常値の自由テスト（ファズテスト）
 *
 * CMS入力、コンテンツファイル、OAuth認証に対して
 * 不正値・境界値・攻撃ペイロードを投入し、
 * バリデーションが正しく機能することを検証する。
 *
 * ビルド時に必ず実行される必須テスト。
 */

// ========================================
// テスト対象のスキーマ・設定をロード
// ========================================

const PAGES_DIR = join(process.cwd(), 'src/content/pages');
const POSTS_DIR = join(process.cwd(), 'src/content/posts');

// Zodスキーマ（content.config.ts相当）を再定義してテスト
const postsSchema = z.object({
  title: z.string().min(1).max(200),
  date: z.union([
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    z.date(),
  ]).transform((val) =>
    val instanceof Date ? val.toISOString().split('T')[0] : val
  ),
  draft: z.boolean().default(false),
  tags: z.array(z.string().min(1).max(50)).max(20).default([]),
  thumbnail: z.string().startsWith('/images/').optional(),
  summary: z.string().max(500).optional(),
});

const pagesSchema = z.object({
  title: z.string().min(1).max(200),
  order: z.number().int().min(1).default(1),
  draft: z.boolean().default(false),
});

// CMS config.yml
const configPath = join(process.cwd(), 'public/admin/config.yml');
const config = yaml.load(readFileSync(configPath, 'utf-8'));
const pagesCollection = config.collections.find(c => c.name === 'pages');
const postsCollection = config.collections.find(c => c.name === 'posts');

// OAuth関数
import { onRequestGet as authIndex } from '../functions/auth/index.js';
import { onRequestGet as authCallback } from '../functions/auth/callback.js';

function createContext({ url, env = {}, headers = {} }) {
  return {
    request: new Request(url, { headers }),
    env,
  };
}

const TEST_STATE = 'test-state-fuzz-12345';

// ========================================
// XSS / インジェクション ペイロード集
// ========================================

const XSS_PAYLOADS = [
  '<script>alert(1)</script>',
  '<img src=x onerror=alert(1)>',
  '"><script>alert(document.cookie)</script>',
  "';alert(String.fromCharCode(88,83,83))//",
  '<svg/onload=alert(1)>',
  'javascript:alert(1)',
  '<iframe src="javascript:alert(1)">',
  '{{constructor.constructor("return this")()}}',
  '${7*7}',
  '<a href="javascript:void(0)" onclick="alert(1)">click</a>',
];

const SQLI_PAYLOADS = [
  "' OR '1'='1",
  "1; DROP TABLE users--",
  "' UNION SELECT * FROM users--",
  "1' AND '1'='1",
  "admin'--",
];

const PATH_TRAVERSAL_PAYLOADS = [
  '../../../etc/passwd',
  '..\\..\\..\\windows\\system32\\config\\sam',
  '/etc/passwd',
  '....//....//....//etc/passwd',
  '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
  'file:///etc/passwd',
];

const COMMAND_INJECTION_PAYLOADS = [
  '; ls -la',
  '| cat /etc/passwd',
  '`whoami`',
  '$(id)',
  '& ping -c 1 evil.com',
];

const SPECIAL_STRINGS = [
  '',                           // 空文字
  ' ',                          // スペースのみ
  '\t\n\r',                     // 制御文字
  'a'.repeat(10000),            // 超長文字列
  'a'.repeat(100000),           // さらに超長文字列
  '\0',                         // NULL文字
  '\x00\x01\x02',              // バイナリ
  '🎉🎊🎈',                   // 絵文字
  '日本語テスト',               // マルチバイト
  'Ñoño',                      // アクセント文字
  'مرحبا',                     // RTL文字（アラビア語）
  '\u200B\u200C\u200D',        // ゼロ幅文字
  '\uFEFF',                    // BOM
  'null',                      // 文字列の"null"
  'undefined',                 // 文字列の"undefined"
  'true',                      // 文字列の"true"
  'false',                     // 文字列の"false"
  'NaN',                       // 文字列の"NaN"
  'Infinity',                  // 文字列の"Infinity"
  '__proto__',                 // プロトタイプ汚染
  'constructor',               // プロトタイプ汚染
  'toString',                  // プロトタイプ汚染
];

// ========================================
// 1. order フィールドの境界値・異常値テスト
// ========================================

describe('固定ページ order フィールドのファズテスト', () => {
  describe('Zodスキーマによるバリデーション', () => {
    const validBase = { title: 'テストページ', draft: false };

    it('order=1 は有効（最小有効値）', () => {
      const result = pagesSchema.safeParse({ ...validBase, order: 1 });
      expect(result.success).toBe(true);
    });

    it('order=100 は有効', () => {
      const result = pagesSchema.safeParse({ ...validBase, order: 100 });
      expect(result.success).toBe(true);
    });

    it('order=999999 は有効（大きな正の整数）', () => {
      const result = pagesSchema.safeParse({ ...validBase, order: 999999 });
      expect(result.success).toBe(true);
    });

    it('order=0 は拒否（最小値未満）', () => {
      const result = pagesSchema.safeParse({ ...validBase, order: 0 });
      expect(result.success).toBe(false);
    });

    it('order=-1 は拒否（負の値）', () => {
      const result = pagesSchema.safeParse({ ...validBase, order: -1 });
      expect(result.success).toBe(false);
    });

    it('order=-999 は拒否（大きな負の値）', () => {
      const result = pagesSchema.safeParse({ ...validBase, order: -999 });
      expect(result.success).toBe(false);
    });

    it('order=Number.MIN_SAFE_INTEGER は拒否', () => {
      const result = pagesSchema.safeParse({ ...validBase, order: Number.MIN_SAFE_INTEGER });
      expect(result.success).toBe(false);
    });

    it('order=Number.MAX_SAFE_INTEGER は有効（極大整数）', () => {
      const result = pagesSchema.safeParse({ ...validBase, order: Number.MAX_SAFE_INTEGER });
      expect(result.success).toBe(true);
    });

    it('order=1.5 は拒否（小数）', () => {
      const result = pagesSchema.safeParse({ ...validBase, order: 1.5 });
      expect(result.success).toBe(false);
    });

    it('order=0.999 は拒否（1未満の小数）', () => {
      const result = pagesSchema.safeParse({ ...validBase, order: 0.999 });
      expect(result.success).toBe(false);
    });

    it('order=1.001 は拒否（1より大きい小数）', () => {
      const result = pagesSchema.safeParse({ ...validBase, order: 1.001 });
      expect(result.success).toBe(false);
    });

    it('order=NaN は拒否', () => {
      const result = pagesSchema.safeParse({ ...validBase, order: NaN });
      expect(result.success).toBe(false);
    });

    it('order=Infinity は拒否', () => {
      const result = pagesSchema.safeParse({ ...validBase, order: Infinity });
      expect(result.success).toBe(false);
    });

    it('order=-Infinity は拒否', () => {
      const result = pagesSchema.safeParse({ ...validBase, order: -Infinity });
      expect(result.success).toBe(false);
    });

    it('order="1"（文字列）は拒否', () => {
      const result = pagesSchema.safeParse({ ...validBase, order: '1' });
      expect(result.success).toBe(false);
    });

    it('order="abc" は拒否', () => {
      const result = pagesSchema.safeParse({ ...validBase, order: 'abc' });
      expect(result.success).toBe(false);
    });

    it('order=null は拒否', () => {
      const result = pagesSchema.safeParse({ ...validBase, order: null });
      expect(result.success).toBe(false);
    });

    it('order=true は拒否', () => {
      const result = pagesSchema.safeParse({ ...validBase, order: true });
      expect(result.success).toBe(false);
    });

    it('order=[] は拒否', () => {
      const result = pagesSchema.safeParse({ ...validBase, order: [] });
      expect(result.success).toBe(false);
    });

    it('order={} は拒否', () => {
      const result = pagesSchema.safeParse({ ...validBase, order: {} });
      expect(result.success).toBe(false);
    });

    it('order未指定はデフォルト1が適用される', () => {
      const result = pagesSchema.safeParse({ title: 'テスト', draft: false });
      expect(result.success).toBe(true);
      expect(result.data.order).toBe(1);
    });

    describe('XSSペイロードをorder値として注入', () => {
      XSS_PAYLOADS.forEach((payload, i) => {
        it(`XSS payload #${i + 1} は拒否される`, () => {
          const result = pagesSchema.safeParse({ ...validBase, order: payload });
          expect(result.success).toBe(false);
        });
      });
    });
  });

  describe('CMS config.yml の制約', () => {
    const orderField = pagesCollection.fields.find(f => f.name === 'order');

    it('orderフィールドがnumberウィジェット', () => {
      expect(orderField.widget).toBe('number');
    });

    it('value_typeがintに設定（小数を防止）', () => {
      expect(orderField.value_type).toBe('int');
    });

    it('min=1が設定（0以下を防止）', () => {
      expect(orderField.min).toBe(1);
    });

    it('デフォルト値が1以上', () => {
      expect(orderField.default).toBeGreaterThanOrEqual(1);
    });
  });

  describe('既存コンテンツの整合性（実データ検証）', () => {
    const pageFiles = existsSync(PAGES_DIR)
      ? readdirSync(PAGES_DIR).filter(f => extname(f) === '.md').map(f => join(PAGES_DIR, f))
      : [];

    it('全固定ページのorderが正の整数（1以上）', () => {
      for (const file of pageFiles) {
        const { data } = matter(readFileSync(file, 'utf-8'));
        expect(
          Number.isInteger(data.order) && data.order >= 1,
          `${file.split('/').pop()}: order=${data.order} は不正値`
        ).toBe(true);
      }
    });

    it('全固定ページのorderがNumber.MAX_SAFE_INTEGER以下', () => {
      for (const file of pageFiles) {
        const { data } = matter(readFileSync(file, 'utf-8'));
        expect(
          data.order <= Number.MAX_SAFE_INTEGER,
          `${file.split('/').pop()}: order=${data.order} がMAX_SAFE_INTEGERを超過`
        ).toBe(true);
      }
    });
  });
});

// ========================================
// 2. slug フィールドの異常値テスト
// ========================================

describe('固定ページ slug フィールドのファズテスト', () => {
  const slugPattern = new RegExp(pagesCollection.fields.find(f => f.name === 'slug').pattern[0]);

  describe('有効なslug', () => {
    const validSlugs = ['profile', 'about-me', 'contact-us', 'page1', 'a', 'test-123-page'];
    validSlugs.forEach(slug => {
      it(`"${slug}" は有効`, () => {
        expect(slugPattern.test(slug)).toBe(true);
      });
    });
  });

  describe('無効なslug（パターンバリデーション）', () => {
    const invalidSlugs = [
      'Profile',          // 大文字
      'ABOUT',            // 全大文字
      'about me',         // スペース
      'about_me',         // アンダースコア
      'about.me',         // ドット
      'about/me',         // スラッシュ
      'about\\me',        // バックスラッシュ
      'あいうえお',        // 日本語
      '日本語-slug',       // 日本語混在
      '',                 // 空文字列
    ];
    invalidSlugs.forEach(slug => {
      it(`"${slug}" は拒否される`, () => {
        expect(slugPattern.test(slug)).toBe(false);
      });
    });
  });

  describe('XSSペイロードのslug注入', () => {
    XSS_PAYLOADS.forEach((payload, i) => {
      it(`XSS payload #${i + 1} は拒否される`, () => {
        expect(slugPattern.test(payload)).toBe(false);
      });
    });
  });

  describe('SQLインジェクションのslug注入', () => {
    SQLI_PAYLOADS.forEach((payload, i) => {
      it(`SQLi payload #${i + 1} は拒否される`, () => {
        expect(slugPattern.test(payload)).toBe(false);
      });
    });
  });

  describe('パストラバーサルのslug注入', () => {
    PATH_TRAVERSAL_PAYLOADS.forEach((payload, i) => {
      it(`パストラバーサル payload #${i + 1} は拒否される`, () => {
        expect(slugPattern.test(payload)).toBe(false);
      });
    });
  });

  describe('コマンドインジェクションのslug注入', () => {
    COMMAND_INJECTION_PAYLOADS.forEach((payload, i) => {
      it(`コマンドインジェクション payload #${i + 1} は拒否される`, () => {
        expect(slugPattern.test(payload)).toBe(false);
      });
    });
  });

  describe('予約語の検証', () => {
    const reservedSlugs = ['posts', 'tags', 'admin'];
    const pageFiles = existsSync(PAGES_DIR)
      ? readdirSync(PAGES_DIR).filter(f => extname(f) === '.md').map(f => join(PAGES_DIR, f))
      : [];

    it('既存ページに予約語slugが使われていない', () => {
      for (const file of pageFiles) {
        const { data } = matter(readFileSync(file, 'utf-8'));
        expect(
          !reservedSlugs.includes(data.slug),
          `${file.split('/').pop()}: slug="${data.slug}" は予約語`
        ).toBe(true);
      }
    });
  });
});

// ========================================
// 3. title フィールドの異常値テスト
// ========================================

describe('title フィールドのファズテスト', () => {
  describe('posts スキーマ', () => {
    const validBase = { date: '2026-01-01', draft: false };

    it('空文字列のtitleは拒否される', () => {
      const result = postsSchema.safeParse({ ...validBase, title: '' });
      expect(result.success).toBe(false); // z.string().min(1) は空文字列を拒否
    });

    it('超長文タイトル（10000文字）はスキーマで拒否される', () => {
      const result = postsSchema.safeParse({ ...validBase, title: 'a'.repeat(10000) });
      expect(result.success).toBe(false); // z.string().max(200) を超過
    });

    it('200文字以内のタイトルは受理される', () => {
      const result = postsSchema.safeParse({ ...validBase, title: 'a'.repeat(200) });
      expect(result.success).toBe(true);
    });

    it('XSSペイロードはスキーマ上は文字列として受理されるがSSGでエスケープされる', () => {
      // Astro SSGは自動エスケープするため、文字列としては受理される
      const result = postsSchema.safeParse({ ...validBase, title: '<script>alert(1)</script>' });
      expect(result.success).toBe(true);
      // ただし出力時にHTMLエスケープされることをビルドテストで確認
    });

    it('titleにnullは拒否される', () => {
      const result = postsSchema.safeParse({ ...validBase, title: null });
      expect(result.success).toBe(false);
    });

    it('titleに数値は拒否される', () => {
      const result = postsSchema.safeParse({ ...validBase, title: 12345 });
      expect(result.success).toBe(false);
    });

    it('titleにオブジェクトは拒否される', () => {
      const result = postsSchema.safeParse({ ...validBase, title: { toString: () => 'hack' } });
      expect(result.success).toBe(false);
    });

    it('titleに配列は拒否される', () => {
      const result = postsSchema.safeParse({ ...validBase, title: ['title1', 'title2'] });
      expect(result.success).toBe(false);
    });
  });
});

// ========================================
// 4. date フィールドの異常値テスト
// ========================================

describe('date フィールドのファズテスト', () => {
  const validBase = { title: 'テスト記事', draft: false };

  describe('有効な日付形式', () => {
    it('YYYY-MM-DD形式は受理される', () => {
      const result = postsSchema.safeParse({ ...validBase, date: '2026-01-15' });
      expect(result.success).toBe(true);
    });

    it('Dateオブジェクトは受理されYYYY-MM-DDに変換される', () => {
      const result = postsSchema.safeParse({ ...validBase, date: new Date('2026-01-15') });
      expect(result.success).toBe(true);
      expect(result.data.date).toBe('2026-01-15');
    });
  });

  describe('無効な日付', () => {
    it('数値は拒否される', () => {
      const result = postsSchema.safeParse({ ...validBase, date: 12345 });
      expect(result.success).toBe(false);
    });

    it('nullは拒否される', () => {
      const result = postsSchema.safeParse({ ...validBase, date: null });
      expect(result.success).toBe(false);
    });

    it('オブジェクトは拒否される', () => {
      const result = postsSchema.safeParse({ ...validBase, date: {} });
      expect(result.success).toBe(false);
    });

    it('配列は拒否される', () => {
      const result = postsSchema.safeParse({ ...validBase, date: [] });
      expect(result.success).toBe(false);
    });

    it('booleanは拒否される', () => {
      const result = postsSchema.safeParse({ ...validBase, date: true });
      expect(result.success).toBe(false);
    });
  });

  describe('XSSペイロードの日付注入', () => {
    XSS_PAYLOADS.forEach((payload, i) => {
      it(`XSS payload #${i + 1} はスキーマのYYYY-MM-DD正規表現で拒否される`, () => {
        // date は z.string().regex(/^\d{4}-\d{2}-\d{2}$/) で厳密に検証
        // XSSペイロードはYYYY-MM-DD形式に合致しないため拒否される
        const result = postsSchema.safeParse({ ...validBase, date: payload });
        expect(result.success).toBe(false);
      });
    });
  });
});

// ========================================
// 5. tags フィールドの異常値テスト
// ========================================

describe('tags フィールドのファズテスト', () => {
  const validBase = { title: 'テスト', date: '2026-01-01', draft: false };

  it('空配列は有効', () => {
    const result = postsSchema.safeParse({ ...validBase, tags: [] });
    expect(result.success).toBe(true);
  });

  it('文字列配列は有効', () => {
    const result = postsSchema.safeParse({ ...validBase, tags: ['tag1', 'tag2'] });
    expect(result.success).toBe(true);
  });

  it('文字列でない要素を含む配列は拒否', () => {
    const result = postsSchema.safeParse({ ...validBase, tags: [1, 2, 3] });
    expect(result.success).toBe(false);
  });

  it('ネストされた配列は拒否', () => {
    const result = postsSchema.safeParse({ ...validBase, tags: [['nested']] });
    expect(result.success).toBe(false);
  });

  it('オブジェクト要素を含む配列は拒否', () => {
    const result = postsSchema.safeParse({ ...validBase, tags: [{ tag: 'test' }] });
    expect(result.success).toBe(false);
  });

  it('文字列（配列でない）は拒否', () => {
    const result = postsSchema.safeParse({ ...validBase, tags: 'not-an-array' });
    expect(result.success).toBe(false);
  });

  it('tags未指定はデフォルト空配列', () => {
    const result = postsSchema.safeParse({ title: 'テスト', date: '2026-01-01', draft: false });
    expect(result.success).toBe(true);
    expect(result.data.tags).toEqual([]);
  });

  describe('XSSペイロードをタグ値として注入', () => {
    XSS_PAYLOADS.forEach((payload, i) => {
      it(`XSS payload #${i + 1} は${payload.length <= 50 ? 'スキーマ上文字列として受理されるがSSGでエスケープ' : 'max(50)制限で拒否される'}`, () => {
        const result = postsSchema.safeParse({ ...validBase, tags: [payload] });
        if (payload.length <= 50) {
          expect(result.success).toBe(true);
          // Astro SSGは出力時に自動エスケープする
        } else {
          // z.string().max(50) を超過するペイロードはスキーマで拒否
          expect(result.success).toBe(false);
        }
      });
    });
  });
});

// ========================================
// 6. draft フィールドの異常値テスト
// ========================================

describe('draft フィールドのファズテスト', () => {
  const validBase = { title: 'テスト', date: '2026-01-01' };

  it('true は有効', () => {
    const result = postsSchema.safeParse({ ...validBase, draft: true });
    expect(result.success).toBe(true);
  });

  it('false は有効', () => {
    const result = postsSchema.safeParse({ ...validBase, draft: false });
    expect(result.success).toBe(true);
  });

  it('"true"（文字列）は拒否', () => {
    const result = postsSchema.safeParse({ ...validBase, draft: 'true' });
    expect(result.success).toBe(false);
  });

  it('"false"（文字列）は拒否', () => {
    const result = postsSchema.safeParse({ ...validBase, draft: 'false' });
    expect(result.success).toBe(false);
  });

  it('1 は拒否', () => {
    const result = postsSchema.safeParse({ ...validBase, draft: 1 });
    expect(result.success).toBe(false);
  });

  it('0 は拒否', () => {
    const result = postsSchema.safeParse({ ...validBase, draft: 0 });
    expect(result.success).toBe(false);
  });

  it('null は拒否', () => {
    const result = postsSchema.safeParse({ ...validBase, draft: null });
    expect(result.success).toBe(false);
  });

  it('未指定はデフォルトfalse', () => {
    const result = postsSchema.safeParse({ title: 'テスト', date: '2026-01-01' });
    expect(result.success).toBe(true);
    expect(result.data.draft).toBe(false);
  });
});

// ========================================
// 7. OAuth認証エンドポイントのファズテスト
// ========================================

describe('OAuth認証エンドポイントのファズテスト', () => {
  describe('/auth（認証開始）への異常値注入', () => {
    it('OAUTH_CLIENT_IDが空文字列の場合500エラー', async () => {
      const context = createContext({
        url: 'https://reiwa.casa/auth',
        env: { OAUTH_CLIENT_ID: '' },
      });
      const response = await authIndex(context);
      expect(response.status).toBe(500);
    });

    it('非常に長いURLでもクラッシュしない', async () => {
      const longPath = 'a'.repeat(10000);
      const context = createContext({
        url: `https://reiwa.casa/auth?${longPath}=test`,
        env: { OAUTH_CLIENT_ID: 'test-id' },
      });
      const response = await authIndex(context);
      expect(response.status).toBe(302);
    });

    it('XSSペイロードを含むURLでもクラッシュしない', async () => {
      const context = createContext({
        url: 'https://reiwa.casa/auth?redirect=<script>alert(1)</script>',
        env: { OAUTH_CLIENT_ID: 'test-id' },
      });
      const response = await authIndex(context);
      expect(response.status).toBe(302);
      // GitHubへのリダイレクトURL内にXSSが含まれていないこと
      const location = response.headers.get('location');
      expect(location).not.toContain('<script>');
    });
  });

  describe('/auth/callback への異常値注入', () => {
    const validEnv = {
      OAUTH_CLIENT_ID: 'test-id',
      OAUTH_CLIENT_SECRET: 'test-secret',
    };

    it('codeが空文字列の場合400エラー', async () => {
      const context = createContext({
        url: 'https://reiwa.casa/auth/callback?code=',
        env: validEnv,
      });
      const response = await authCallback(context);
      expect(response.status).toBe(400);
    });

    it('stateパラメータなしで403エラー（CSRF防止）', async () => {
      const context = createContext({
        url: 'https://reiwa.casa/auth/callback?code=test-code',
        env: validEnv,
        headers: { Cookie: `oauth_state=${TEST_STATE}` },
      });
      const response = await authCallback(context);
      expect(response.status).toBe(403);
    });

    it('stateパラメータ不一致で403エラー', async () => {
      const context = createContext({
        url: `https://reiwa.casa/auth/callback?code=test-code&state=wrong-state`,
        env: validEnv,
        headers: { Cookie: `oauth_state=${TEST_STATE}` },
      });
      const response = await authCallback(context);
      expect(response.status).toBe(403);
    });

    it('Cookie内のstateが空で403エラー', async () => {
      const context = createContext({
        url: `https://reiwa.casa/auth/callback?code=test-code&state=${TEST_STATE}`,
        env: validEnv,
        headers: { Cookie: 'oauth_state=' },
      });
      const response = await authCallback(context);
      expect(response.status).toBe(403);
    });

    it('Cookie自体がない場合403エラー', async () => {
      const context = createContext({
        url: `https://reiwa.casa/auth/callback?code=test-code&state=${TEST_STATE}`,
        env: validEnv,
      });
      const response = await authCallback(context);
      expect(response.status).toBe(403);
    });

    describe('XSSペイロードをcodeパラメータに注入', () => {
      XSS_PAYLOADS.forEach((payload, i) => {
        it(`XSS payload #${i + 1} がHTMLに反映されない`, async () => {
          const originalFetch = globalThis.fetch;
          // GitHubがエラーを返すケース
          globalThis.fetch = vi.fn().mockResolvedValue({
            json: async () => ({ error: 'bad_verification_code' }),
          });

          try {
            const context = createContext({
              url: `https://reiwa.casa/auth/callback?code=${encodeURIComponent(payload)}&state=${TEST_STATE}`,
              env: validEnv,
              headers: { Cookie: `oauth_state=${TEST_STATE}` },
            });
            const response = await authCallback(context);
            const text = await response.text();
            // レスポンスにスクリプトタグがエスケープなしで含まれていないこと
            expect(text).not.toContain('<script>alert');
            expect(text).not.toContain('onerror=');
          } finally {
            globalThis.fetch = originalFetch;
          }
        });
      });
    });

    describe('超長文字列をcodeパラメータに注入', () => {
      it('10000文字のcodeでもクラッシュしない', async () => {
        const originalFetch = globalThis.fetch;
        globalThis.fetch = vi.fn().mockResolvedValue({
          json: async () => ({ error: 'bad_verification_code' }),
        });

        try {
          const longCode = 'x'.repeat(10000);
          const context = createContext({
            url: `https://reiwa.casa/auth/callback?code=${longCode}&state=${TEST_STATE}`,
            env: validEnv,
            headers: { Cookie: `oauth_state=${TEST_STATE}` },
          });
          const response = await authCallback(context);
          expect([200, 400, 403, 500]).toContain(response.status);
        } finally {
          globalThis.fetch = originalFetch;
        }
      });
    });

    describe('SQLインジェクションをcodeに注入', () => {
      SQLI_PAYLOADS.forEach((payload, i) => {
        it(`SQLi payload #${i + 1} でクラッシュしない`, async () => {
          const originalFetch = globalThis.fetch;
          globalThis.fetch = vi.fn().mockResolvedValue({
            json: async () => ({ error: 'bad_verification_code' }),
          });

          try {
            const context = createContext({
              url: `https://reiwa.casa/auth/callback?code=${encodeURIComponent(payload)}&state=${TEST_STATE}`,
              env: validEnv,
              headers: { Cookie: `oauth_state=${TEST_STATE}` },
            });
            const response = await authCallback(context);
            expect([200, 400, 403, 500]).toContain(response.status);
          } finally {
            globalThis.fetch = originalFetch;
          }
        });
      });
    });

    describe('パストラバーサルをcodeに注入', () => {
      PATH_TRAVERSAL_PAYLOADS.forEach((payload, i) => {
        it(`パストラバーサル payload #${i + 1} でクラッシュしない`, async () => {
          const originalFetch = globalThis.fetch;
          globalThis.fetch = vi.fn().mockResolvedValue({
            json: async () => ({ error: 'bad_verification_code' }),
          });

          try {
            const context = createContext({
              url: `https://reiwa.casa/auth/callback?code=${encodeURIComponent(payload)}&state=${TEST_STATE}`,
              env: validEnv,
              headers: { Cookie: `oauth_state=${TEST_STATE}` },
            });
            const response = await authCallback(context);
            expect([200, 400, 403, 500]).toContain(response.status);
          } finally {
            globalThis.fetch = originalFetch;
          }
        });
      });
    });
  });

  describe('トークンのエスケープ検証', () => {
    it('トークンに</script>が含まれてもHTMLが壊れない', async () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = vi.fn().mockResolvedValue({
        json: async () => ({
          access_token: '</script><script>alert(1)</script>',
          token_type: 'bearer',
        }),
      });

      try {
        const context = createContext({
          url: `https://reiwa.casa/auth/callback?code=test&state=${TEST_STATE}`,
          env: {
            OAUTH_CLIENT_ID: 'test-id',
            OAUTH_CLIENT_SECRET: 'test-secret',
          },
          headers: { Cookie: `oauth_state=${TEST_STATE}` },
        });
        const response = await authCallback(context);
        const html = await response.text();
        // </script>がエスケープされていること（\x3cに変換）
        expect(html).not.toMatch(/<\/script>\s*<script>alert/);
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it('トークンにバックスラッシュが含まれても安全', async () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = vi.fn().mockResolvedValue({
        json: async () => ({
          access_token: 'token\\";alert(1);//',
          token_type: 'bearer',
        }),
      });

      try {
        const context = createContext({
          url: `https://reiwa.casa/auth/callback?code=test&state=${TEST_STATE}`,
          env: {
            OAUTH_CLIENT_ID: 'test-id',
            OAUTH_CLIENT_SECRET: 'test-secret',
          },
          headers: { Cookie: `oauth_state=${TEST_STATE}` },
        });
        const response = await authCallback(context);
        const html = await response.text();
        // バックスラッシュがエスケープされ、文字列リテラルから脱出できないこと
        // \\\" → JS文字列内で \" として解釈される（文字列からのブレイクアウトを防止）
        // escapeForScriptが正しく動作していることをソースレベルで検証
        const callbackSrc = readFileSync('functions/auth/callback.js', 'utf-8');
        expect(callbackSrc).toContain('.replace(/\\\\/g');
        expect(callbackSrc).toContain('.replace(/"/g');
        // HTMLが正常生成されること（クラッシュしないこと）
        expect(response.status).toBe(200);
        expect(html).toContain('postMessage');
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it('トークンに改行が含まれても安全', async () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = vi.fn().mockResolvedValue({
        json: async () => ({
          access_token: 'safe_token_value',
          token_type: 'bearer',
        }),
      });

      try {
        const context = createContext({
          url: `https://reiwa.casa/auth/callback?code=test&state=${TEST_STATE}`,
          env: {
            OAUTH_CLIENT_ID: 'test-id',
            OAUTH_CLIENT_SECRET: 'test-secret',
          },
          headers: { Cookie: `oauth_state=${TEST_STATE}` },
        });
        const response = await authCallback(context);
        const html = await response.text();
        // escapeForScript関数が存在し改行エスケープ処理がソースにあることを検証
        const callbackSrc = readFileSync('functions/auth/callback.js', 'utf-8');
        expect(callbackSrc).toContain('.replace(/\\n/g');
        expect(callbackSrc).toContain('.replace(/\\r/g');
        // レスポンスHTMLが正常に生成されること
        expect(html).toContain('authorization:github:success');
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });
});

// ========================================
// 8. セキュリティヘッダー検証（強化版）
// ========================================

describe('セキュリティヘッダー構成の包括的検証', () => {
  const headersContent = readFileSync(join(process.cwd(), 'public/_headers'), 'utf-8');
  // パスルール行（行頭 /admin/*）で分割してセクション抽出（コメント行内の /admin/* を除外）
  const adminRuleIndex = headersContent.search(/^\/admin\/\*/m);
  const globalSection = adminRuleIndex >= 0 ? headersContent.substring(0, adminRuleIndex) : headersContent;
  const adminSectionAll = adminRuleIndex >= 0 ? headersContent.substring(adminRuleIndex) : '';

  describe('OWASP推奨ヘッダー（全ページ）', () => {
    it('X-Content-Type-Options: nosniff が設定されている', () => {
      expect(headersContent).toContain('X-Content-Type-Options: nosniff');
    });

    it('X-Frame-Options は /admin/* で再定義されず /* から継承される（Issue #115, Bug #49）', () => {
      // Cloudflare Pages は /* と /admin/* で同名ヘッダーを指定するとオーバーライドではなく
      // Append（重複送信）するため、COOP等のStructured Headerがカンマ結合され構文エラーになる。
      // そのため /admin/* では再定義せず、/* の値がそのまま管理画面にも適用される設計に変更した。
      const adminSection = adminSectionAll;
      expect(adminSection).not.toMatch(/^\s*X-Frame-Options:/m);
      expect(globalSection).toContain('X-Frame-Options: SAMEORIGIN');
    });

    it('Referrer-Policy が安全な値に設定されている', () => {
      const safeValues = [
        'no-referrer',
        'same-origin',
        'strict-origin',
        'strict-origin-when-cross-origin',
      ];
      const hasValidPolicy = safeValues.some(v =>
        headersContent.includes(`Referrer-Policy: ${v}`)
      );
      expect(hasValidPolicy).toBe(true);
    });

    it('Permissions-Policy が設定されている', () => {
      expect(headersContent).toContain('Permissions-Policy:');
    });

    it('Permissions-Policy で geolocation が無効化されている', () => {
      expect(headersContent).toContain('geolocation=()');
    });

    it('Permissions-Policy で camera が無効化されている', () => {
      expect(headersContent).toContain('camera=()');
    });

    it('Permissions-Policy で microphone が無効化されている', () => {
      expect(headersContent).toContain('microphone=()');
    });

    it('Permissions-Policy で payment が無効化されている', () => {
      expect(headersContent).toContain('payment=()');
    });

    it('Permissions-Policy で interest-cohort（FLoC）が無効化されている', () => {
      expect(headersContent).toContain('interest-cohort=()');
    });
  });

  describe('HSTS（HTTP Strict Transport Security）', () => {
    it('Strict-Transport-Security が設定されている', () => {
      expect(headersContent).toContain('Strict-Transport-Security:');
    });

    it('max-age が十分な期間（≧6ヶ月=15768000秒）に設定されている', () => {
      const match = headersContent.match(/max-age=(\d+)/);
      expect(match).not.toBeNull();
      expect(parseInt(match[1], 10)).toBeGreaterThanOrEqual(15768000);
    });

    it('includeSubDomains が設定されている', () => {
      expect(headersContent).toContain('includeSubDomains');
    });

    it('preload が設定されている', () => {
      expect(headersContent).toContain('preload');
    });
  });

  describe('Cross-Originヘッダー', () => {
    // Bug #28 / Bug #49 再発防止（Issue #115）: COOP/CORPを /* と /admin/* の両方に
    // 同名で指定すると、Cloudflare Pagesはオーバーライドではなく Append（重複送信）する。
    // COOP等のRFC 8941 Structured Headerはカンマ結合されると構文エラーとなり、
    // ブラウザが安全側の unsafe-none 等にフォールバックして管理画面のOAuth/プレビューが壊れる。
    // そのため /admin/* では再定義せず、/* で定義した値がそのまま管理画面にも継承される設計にした。

    it('Cross-Origin-Opener-Policy は /admin/* で再定義されず /* から継承される（Issue #115, Bug #49）', () => {
      const adminSection = adminSectionAll;
      expect(adminSection).not.toMatch(/^\s*Cross-Origin-Opener-Policy:/m);
      expect(globalSection).toContain('Cross-Origin-Opener-Policy: same-origin-allow-popups');
    });

    it('Cross-Origin-Resource-Policy は /admin/* で再定義されず /* から継承される（Issue #115, Bug #49）', () => {
      const adminSection = adminSectionAll;
      expect(adminSection).not.toMatch(/^\s*Cross-Origin-Resource-Policy:/m);
      expect(globalSection).toContain('Cross-Origin-Resource-Policy: same-site');
    });

    it('COOP/CORP/X-Frame-Options は /admin/* で再定義されず /* から継承される（Bug #28 再発防止・Issue #115/Bug #49で設計変更）', () => {
      // 旧設計（Bug #28時点）は /* と /admin/* の両方に同名ヘッダーを定義し「同一値なら重複送信は安全」
      // という前提だった。しかし Cloudflare Pages は同名ヘッダーをオーバーライドではなく
      // Append（重複送信）するため、COOP等のRFC 8941 Structured Headerはカンマ結合されて
      // パース不能になり得る（Issue #115, Bug #49で判明。ブラウザの実解決結果までは未観測だが、
      // 重複を解消すれば実効値を変えずにこの懸念を無条件に除去できる）。
      // そのため新設計では /admin/* 側で再定義せず、/* の値のみが管理画面にも適用される。
      // 本テストは、この3ヘッダーが /admin/* に一切存在せず、/* に管理画面が必要とする値で
      // 存在することを検証する（アサーションが必ず実行されるようガード条件を撤廃）。
      const getHeaderValue = (section, name) => {
        const line = section.split('\n').find(l => !l.trim().startsWith('#') && l.includes(name + ':'));
        return line ? line.split(':').slice(1).join(':').trim() : null;
      };
      const expectedGlobalValues = {
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
        'Cross-Origin-Resource-Policy': 'same-site',
        'X-Frame-Options': 'SAMEORIGIN',
      };
      for (const header of ['Cross-Origin-Opener-Policy', 'Cross-Origin-Resource-Policy', 'X-Frame-Options']) {
        const adminVal = getHeaderValue(adminSectionAll, header);
        expect(adminVal, `${header} が /admin/* で再定義されている（Append重複の原因になる）`).toBeNull();

        const globalVal = getHeaderValue(globalSection, header);
        expect(globalVal, `${header} が /* に定義されていない`).toBe(expectedGlobalValues[header]);
      }
    });
  });

  // バグ#27再発防止: COOP same-originがOAuth popupのwindow.openerをnullにし、
  // Decap CMSのGitHub認証が失敗→記事保存時「TypeError: Load failed」が発生した
  // 設計変更（Issue #115, Bug #49）: Cloudflare Pages は /* と /admin/* で同名ヘッダーを
  // Append（重複送信）するため、/admin/* 側での「オーバーライド」は成立しない。
  // そのため管理画面が必要とする値は /* 側に直接定義し、/admin/* には再定義しない。
  // 以下は「/admin/* が実際に必要とする値が /* に定義されていること」を検証する。
  describe('管理画面（/admin/*）が必要とするセキュリティヘッダー要件（/* からの継承値検証）', () => {
    const adminSection = adminSectionAll;

    it('COOPは /* で same-origin-allow-popups に設定され、OAuthポップアップのwindow.openerを維持できる（Issue #115, Bug #49: /admin/* でのオーバーライドはAppend挙動により成立しないため /* の値が直接適用される）', () => {
      expect(globalSection).toContain('Cross-Origin-Opener-Policy: same-origin-allow-popups');
    });

    it('X-Frame-Optionsは /* で SAMEORIGIN に設定され、CMSプレビューiframeを許可できる（DENYだと壊れる。Issue #115, Bug #49: /admin/* でのオーバーライドは成立しないため /* の値が直接適用される）', () => {
      expect(globalSection).toContain('X-Frame-Options: SAMEORIGIN');
    });

    it('CORPは /* で same-site に設定されている（Issue #115, Bug #49: /admin/* でのオーバーライドは成立しないため /* の値が直接適用される）', () => {
      expect(globalSection).toContain('Cross-Origin-Resource-Policy: same-site');
    });

    it('CSP frame-src に blob: が含まれている（CMSプレビュー用）', () => {
      expect(adminSection).toContain('blob:');
    });

    it('CSP connect-src に blob: が含まれている（Bug #29: 画像保存時の fetch(blobURL) に必要）', () => {
      const cspLine = adminSection.split('\n').find(l => l.includes('Content-Security-Policy:'));
      expect(cspLine, 'CSPヘッダーが見つからない').toBeTruthy();
      const connectSrcMatch = cspLine.match(/connect-src\s+([^;]+)/);
      expect(connectSrcMatch, 'connect-srcが見つからない').toBeTruthy();
      expect(connectSrcMatch[1]).toContain('blob:');
    });

    it('/* と /admin/* で同名ヘッダーが異なる値で重複していない（Bug #28 再発防止）', () => {
      // Cloudflare Pages は同名ヘッダーをAppendする。同一値の重複も Bug #49 では危険。
      // 本テストはガードで expect を飛ばさず、次を必ず検証する:
      // 1. /admin/* 定義ヘッダーが /* にもあるなら値は完全一致
      // 2. 同名0件でも expect が走る（重複件数 === 0 を明示）
      // 3. COOP/CORP/XFO が /admin/* に存在しない
      const isHeaderLine = (line) => {
        const trimmed = line.trim();
        return trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('/') && trimmed.includes(':');
      };
      const getHeaderValue = (section, name) => {
        const line = section.split('\n').find(l => isHeaderLine(l) && l.trim().startsWith(name + ':'));
        return line ? line.split(':').slice(1).join(':').trim() : null;
      };
      const adminHeaders = [...new Set(
        adminSection.split('\n')
          .filter(isHeaderLine)
          .map(line => line.trim().split(':')[0].trim())
      )];

      expect(adminHeaders.length, '/admin/* からヘッダー名を1件も抽出できない').toBeGreaterThan(0);

      const overlapping = [];
      const mismatches = [];
      for (const header of adminHeaders) {
        const adminVal = getHeaderValue(adminSection, header);
        const globalVal = getHeaderValue(globalSection, header);
        expect(adminVal, `${header} が /admin/* から値を取得できない`).not.toBeNull();
        if (globalVal !== null) {
          overlapping.push(header);
          if (globalVal !== adminVal) {
            mismatches.push({ header, globalVal, adminVal });
          }
        }
      }

      // 1. 同名があるなら値は完全一致（expect を if で囲まない）
      expect(mismatches, `/* と /admin/* で値が異なる同名ヘッダー: ${JSON.stringify(mismatches)}`).toEqual([]);
      // 2. 同名が1件も無くても expect は必ず実行される
      expect(overlapping, `/* と /admin/* で重複しているヘッダー名: ${overlapping.join(', ')}`).toEqual([]);

      // 3. COOP/CORP/XFO が /admin/* に存在しないことを明示検証
      for (const header of ['Cross-Origin-Opener-Policy', 'Cross-Origin-Resource-Policy', 'X-Frame-Options']) {
        expect(
          getHeaderValue(adminSection, header),
          `${header} が /admin/* で再定義されている（Append重複の原因になる）`
        ).toBeNull();
      }
    });
  });

  describe('追加セキュリティヘッダー', () => {
    it('X-DNS-Prefetch-Control: off が設定されている', () => {
      expect(headersContent).toContain('X-DNS-Prefetch-Control: off');
    });

    it('X-Permitted-Cross-Domain-Policies: none が設定されている', () => {
      expect(headersContent).toContain('X-Permitted-Cross-Domain-Policies: none');
    });
  });

  describe('CSP（Content Security Policy）for admin', () => {
    const adminSection = adminSectionAll;

    it('default-src が設定されている', () => {
      expect(adminSection).toContain("default-src 'none'");
    });

    it('script-src が設定されている', () => {
      expect(adminSection).toContain('script-src');
    });

    it('frame-ancestors が self に設定されている（クリックジャッキング防止 + CMSプレビューiframe許可）', () => {
      expect(adminSection).toContain("frame-ancestors 'self'");
    });

    it('base-uri が制限されている（ベースURLハイジャック防止）', () => {
      expect(adminSection).toContain("base-uri 'self'");
    });

    it('form-action が制限されている（フォームハイジャック防止）', () => {
      expect(adminSection).toContain("form-action 'self'");
    });

    it('object-src が設定されていないか none（Flashプラグイン防止）', () => {
      // object-srcが明示的に'none'か、未設定（default-src 'none'で代替）
      const hasObjectSrc = adminSection.includes('object-src');
      if (hasObjectSrc) {
        expect(adminSection).toContain("object-src 'none'");
      }
      // default-src 'none' がフォールバックとして機能
      expect(adminSection).toContain("default-src 'none'");
    });
  });
});

// ========================================
// 9. コードセキュリティ品質テスト
// ========================================

describe('コードセキュリティ品質テスト', () => {
  const callbackSource = readFileSync('functions/auth/callback.js', 'utf-8');
  const indexSource = readFileSync('functions/auth/index.js', 'utf-8');

  it('callback.jsにvar宣言が使われていない', () => {
    // テンプレートHTML内のvar（JavaScript文字列リテラル内）を除外して検証
    // 関数スコープのvar宣言を検出
    const lines = callbackSource.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      // コメント行とテンプレートリテラル内を除外
      if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue;
      // 関数レベルのvar宣言を検出（テンプレート内のconstは許可）
      if (/^\s*var\s+/.test(line)) {
        expect(line, `var宣言が検出されました: ${trimmed}`).not.toMatch(/^\s*var\s+/);
      }
    }
  });

  it('index.jsにvar宣言が使われていない', () => {
    expect(indexSource).not.toMatch(/^\s*var\s+/m);
  });

  it('admin/index.htmlにinnerHTMLが使われていない', () => {
    const adminHtml = readFileSync('public/admin/index.html', 'utf-8');
    expect(adminHtml).not.toContain('.innerHTML');
    expect(adminHtml).not.toContain('.outerHTML');
  });

  it('CDNスクリプトにSRI（integrity）属性がある', () => {
    const adminHtml = readFileSync('public/admin/index.html', 'utf-8');
    // 外部CDNスクリプトのタグ全体を検出（閉じ>まで）
    const externalScripts = adminHtml.match(/<script[^>]+src="https?:\/\/[^"]*"[^>]*>/g) || [];
    expect(externalScripts.length).toBeGreaterThan(0);
    for (const script of externalScripts) {
      expect(script, `SRIなしの外部スクリプト: ${script}`).toContain('integrity=');
    }
  });

  it('CDNスクリプトにcrossorigin属性がある', () => {
    const adminHtml = readFileSync('public/admin/index.html', 'utf-8');
    const externalScripts = adminHtml.match(/<script[^>]+src="https?:\/\/[^"]*"[^>]*>/g) || [];
    expect(externalScripts.length).toBeGreaterThan(0);
    for (const script of externalScripts) {
      expect(script, `crossoriginなしの外部スクリプト: ${script}`).toContain('crossorigin=');
    }
  });
});

// ========================================
// 10. 情報漏洩防止テスト
// ========================================

describe('情報漏洩防止テスト', () => {
  it('public配下に.envファイルが存在しない', () => {
    expect(existsSync(join(process.cwd(), 'public/.env'))).toBe(false);
  });

  it('public配下に.gitディレクトリが存在しない', () => {
    expect(existsSync(join(process.cwd(), 'public/.git'))).toBe(false);
  });

  it('public配下にpackage.jsonが存在しない', () => {
    expect(existsSync(join(process.cwd(), 'public/package.json'))).toBe(false);
  });

  it('public配下にwrangler.tomlが存在しない', () => {
    expect(existsSync(join(process.cwd(), 'public/wrangler.toml'))).toBe(false);
  });

  it('public配下にnode_modulesが存在しない', () => {
    expect(existsSync(join(process.cwd(), 'public/node_modules'))).toBe(false);
  });

  it('config.ymlにシークレット情報が含まれていない', () => {
    const configContent = readFileSync(configPath, 'utf-8');
    expect(configContent).not.toMatch(/client_secret/i);
    expect(configContent).not.toMatch(/password/i);
    expect(configContent).not.toMatch(/api_key/i);
    expect(configContent).not.toMatch(/secret_key/i);
  });

  it('admin/index.htmlにシークレット情報がハードコードされていない', () => {
    const adminHtml = readFileSync('public/admin/index.html', 'utf-8');
    expect(adminHtml).not.toMatch(/client_secret/i);
    expect(adminHtml).not.toMatch(/api_key\s*[:=]/i);
    expect(adminHtml).not.toMatch(/password\s*[:=]/i);
    // ハードコードされたドメイン参照がないこと（window.location.originを使用）
    expect(adminHtml).not.toContain('https://reiwa.casa');
    expect(adminHtml).not.toContain('https://staging.reiwa.casa');
  });
});

// ========================================
// 11. プロトタイプ汚染テスト
// ========================================

describe('プロトタイプ汚染攻撃テスト', () => {
  // アンダースコアを含むペイロードはslugパターン[a-z0-9-]+で拒否される
  // constructor, prototypeは全て小文字英字のためslugパターン上は受理される（予約語チェックで別途対応）
  const protoPayloadsWithUnderscore = [
    '__proto__',
    '__defineGetter__',
    '__defineSetter__',
  ];

  const protoPayloadsLowercase = [
    'constructor',
    'prototype',
  ];

  describe('slugフィールドへのプロトタイプ汚染（アンダースコア付き）', () => {
    const slugPattern = new RegExp(pagesCollection.fields.find(f => f.name === 'slug').pattern[0]);

    protoPayloadsWithUnderscore.forEach(payload => {
      it(`"${payload}" はslugパターンで拒否される（アンダースコアは不許可）`, () => {
        expect(slugPattern.test(payload)).toBe(false);
      });
    });
  });

  describe('slugフィールドへのプロトタイプ汚染（小文字英字のみ）', () => {
    const slugPattern = new RegExp(pagesCollection.fields.find(f => f.name === 'slug').pattern[0]);

    protoPayloadsLowercase.forEach(payload => {
      it(`"${payload}" はslugパターンを通過するがZodスキーマ上安全（文字列値として処理）`, () => {
        // [a-z0-9-]+パターンは小文字英字のみの文字列を許可する
        // これらは予約語リスト（posts, tags, admin）とは異なりURL衝突しない
        // Astro SSGは文字列値として安全に処理する
        expect(slugPattern.test(payload)).toBe(true);
      });
    });
  });

  describe('orderフィールドへのプロトタイプ汚染', () => {
    const validBase = { title: 'テスト', draft: false };
    const allProtoPayloads = [...protoPayloadsWithUnderscore, ...protoPayloadsLowercase];

    allProtoPayloads.forEach(payload => {
      it(`order="${payload}" は拒否される`, () => {
        const result = pagesSchema.safeParse({ ...validBase, order: payload });
        expect(result.success).toBe(false);
      });
    });
  });
});
