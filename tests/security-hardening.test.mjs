/**
 * Issue #117（セキュリティ監査 run-2 hardening 項目）の再発防止テスト。
 * 判定表: docs/security/issue-117-hardening-decisions.md
 *
 * - Bug #52 / SEC-29 : organize-posts の frontmatter は YAML のみ（`---js` 等を評価しない）… 項目1の再対応
 * - SEC-37           : OAuth オリジン許可リストの単一化 … 項目5
 * - SEC-38           : OAuth コールバック応答の CSP 自己完結・charset 明示 … 項目9
 * - SEC-39           : <script> 埋め込み値の JSON.stringify リテラル化 … 項目10
 * （SEC-36 = Actions の SHA 固定 … 項目3 は tests/build.test.mjs）
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseFrontmatter } from '../scripts/lib/safe-frontmatter.mjs';
import { isAllowedOrigin, PRODUCTION_ORIGINS } from '../functions/_shared/allowed-origin.js';
import { onRequestGet as authIndex } from '../functions/auth/index.js';
import { onRequestGet as authCallback } from '../functions/auth/callback.js';

const ORGANIZE_POSTS = join(process.cwd(), 'scripts/organize-posts.mjs');

describe('frontmatter は YAML のみを解析する（SEC-29, Bug #52 再発防止, Issue #117 項目1）', () => {
  afterEach(() => {
    delete globalThis.__bug52_executed;
  });

  // `language: 'yaml'` を渡しても `---js` の宣言が優先される（gray-matter の仕様）ことが Bug #52 の原因
  for (const lang of ['js', 'javascript', 'JS', 'json']) {
    it(`---${lang} で始まる frontmatter を評価せずに拒否する`, () => {
      const body = lang === 'json'
        ? '{"title":"x","date":"2026-01-01"}'
        : '({ title: (globalThis.__bug52_executed = true, "x"), date: "2026-01-01" })';
      expect(() => parseFrontmatter(`---${lang}\n${body}\n---\n本文`)).toThrow(/not allowed/);
      expect(globalThis.__bug52_executed).toBeUndefined();
    });
  }

  it('未登録の言語（---coffee 等）も拒否する', () => {
    expect(() => parseFrontmatter('---coffee\ntitle: "x"\n---\n本文')).toThrow();
  });

  it('通常の YAML frontmatter は従来どおり解析できる（過剰遮断しない）', () => {
    const { data, content } = parseFrontmatter('---\ntitle: テスト\ndate: 2026-01-02\ndraft: true\n---\n本文');
    expect(data.title).toBe('テスト');
    expect(data.draft).toBe(true);
    expect(content.trim()).toBe('本文');
  });

  it('organize-posts.mjs を実行しても ---js 記事のコードは実行されず、ビルドは継続する', () => {
    const work = mkdtempSync(join(tmpdir(), 'bug52-'));
    try {
      const postsDir = join(work, 'src/content/posts/2026/01');
      mkdirSync(postsDir, { recursive: true });
      const marker = join(work, 'PWNED');
      // gray-matter の javascript エンジンは CommonJS 内の eval なので require が使える
      writeFileSync(join(postsDir, 'evil.md'),
        `---js\n({ title: (require('fs').writeFileSync(${JSON.stringify(marker)}, '1'), 'x'), date: '2026-01-01' })\n---\n本文\n`);
      writeFileSync(join(postsDir, 'good.md'), '---\ntitle: good\ndate: 2026-01-03\n---\n本文\n');

      execFileSync(process.execPath, [ORGANIZE_POSTS], { cwd: work, stdio: 'pipe' });

      expect(existsSync(marker), '---js frontmatter が評価された（Bug #52 再発）').toBe(false);
      const urlMap = JSON.parse(readFileSync(join(work, 'public/admin/url-map.json'), 'utf-8'));
      expect(urlMap['2026/01/good']).toBe('/posts/2026/01/good');
      expect(urlMap['2026/01/evil']).toBeUndefined();
    } finally {
      rmSync(work, { recursive: true, force: true });
    }
  });

  it('organize-posts.mjs は gray-matter を直接呼ばず安全ラッパー経由で解析する', () => {
    const src = readFileSync(ORGANIZE_POSTS, 'utf-8');
    expect(src).toContain("from './lib/safe-frontmatter.mjs'");
    expect(src).not.toMatch(/from ['"]gray-matter['"]/);
  });
});

describe('OAuth オリジン許可リストは1か所で定義する（SEC-37, Issue #117 項目5）', () => {
  const indexSrc = readFileSync('functions/auth/index.js', 'utf-8');
  const callbackSrc = readFileSync('functions/auth/callback.js', 'utf-8');

  it('index.js / callback.js は共有モジュールを import し、独自の許可リスト実装を持たない', () => {
    for (const [name, src] of [['index.js', indexSrc], ['callback.js', callbackSrc]]) {
      expect(src, name).toContain("import { isAllowedOrigin } from '../_shared/allowed-origin.js';");
      expect(src, name).not.toMatch(/function\s+isAllowedOrigin/);
      expect(src, name).not.toContain('my-blog-3cg');
      expect(src, name).not.toMatch(/['"]https:\/\/(staging\.)?reiwa\.casa['"]/);
    }
  });

  it('共有モジュールは Pages Functions のルートにならない（onRequest* を export しない）', () => {
    const shared = readFileSync('functions/_shared/allowed-origin.js', 'utf-8');
    expect(shared).not.toMatch(/export\s+(async\s+)?(function|const|let)\s+onRequest/);
  });

  it('本番・staging・プレビュー・ローカルを許可し、それ以外を拒否する（許可範囲は従来と同一）', () => {
    expect(PRODUCTION_ORIGINS).toEqual(['https://reiwa.casa', 'https://staging.reiwa.casa']);
    for (const ok of [
      'https://reiwa.casa', 'https://staging.reiwa.casa', 'https://my-blog-3cg.pages.dev',
      'https://staging.my-blog-3cg.pages.dev', 'https://abc123.my-blog-3cg.pages.dev',
      'http://localhost:4321', 'http://127.0.0.1', 'http://localhost',
    ]) {
      expect(isAllowedOrigin(ok), ok).toBe(true);
    }
    for (const ng of [
      'http://reiwa.casa', 'https://reiwa.casa.evil.com', 'https://evilreiwa.casa',
      'https://attacker.pages.dev', 'https://my-blog-3cg.pages.dev.evil.com',
      'https://evil-my-blog-3cg.pages.dev', 'https://localhost:4321', 'http://evil-localhost:4321',
      'null', '', undefined,
    ]) {
      expect(isAllowedOrigin(ng), String(ng)).toBe(false);
    }
  });

  it('許可リストの判定が /auth と /auth/callback で一致する（403 になるオリジンが同じ）', async () => {
    for (const origin of ['https://reiwa.casa', 'https://attacker.pages.dev', 'http://localhost:4321']) {
      const start = await authIndex({ request: new Request(`${origin}/auth`), env: { OAUTH_CLIENT_ID: 'id' } });
      const cb = await authCallback({ request: new Request(`${origin}/auth/callback`), env: {} });
      expect(start.status === 403, origin).toBe(cb.status === 403);
    }
  });
});

async function renderCallback(accessToken, origin = 'https://reiwa.casa') {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = vi.fn().mockResolvedValue({ json: async () => ({ access_token: accessToken }) });
  try {
    const response = await authCallback({
      request: new Request(`${origin}/auth/callback?code=c&state=s`, { headers: { Cookie: 'oauth_state=s' } }),
      env: { OAUTH_CLIENT_ID: 'id', OAUTH_CLIENT_SECRET: 'secret' },
    });
    return { response, html: await response.text() };
  } finally {
    globalThis.fetch = originalFetch;
  }
}

describe('OAuth コールバック応答の CSP を自己完結させる（SEC-38, Issue #117 項目9）', () => {
  it('Content-Type に charset=utf-8 を明示し、HTML にも meta charset を持つ', async () => {
    const { response, html } = await renderCallback('tok');
    expect(response.headers.get('content-type')).toBe('text/html; charset=utf-8');
    expect(html).toMatch(/<meta charset="utf-8">/i);
  });

  it('CSP は default-src none に加え frame-ancestors / form-action / base-uri を明示する', async () => {
    const { response } = await renderCallback('tok');
    const csp = response.headers.get('content-security-policy');
    const directives = Object.fromEntries(csp.split(';').map(d => d.trim().split(/\s+/)).map(([k, ...v]) => [k, v.join(' ')]));
    expect(directives['default-src']).toBe("'none'");
    expect(directives['frame-ancestors']).toBe("'none'");
    expect(directives['form-action']).toBe("'none'");
    expect(directives['base-uri']).toBe("'none'");
    // 外部スクリプト・接続は許可しない（インラインスクリプトのみ）
    expect(directives['script-src']).toBe("'unsafe-inline'");
    expect(csp).not.toMatch(/connect-src|https?:/);
    expect(response.headers.get('x-frame-options')).toBe('DENY');
  });
});

describe('<script> 埋め込み値は JSON.stringify リテラルで出力する（SEC-39, Issue #117 項目10）', () => {
  const callbackSrc = readFileSync('functions/auth/callback.js', 'utf-8');
  const literalOf = (html, name) => html.match(new RegExp(`const ${name} = (.*);\\n`))[1];

  it('手書きの escapeForScript を廃止し、JSON.stringify ベースの変換関数を使う', () => {
    expect(callbackSrc).not.toMatch(/function escapeForScript|escapeForScript\(/);
    expect(callbackSrc).toMatch(/function toScriptStringLiteral\(value\)\s*\{\s*return JSON\.stringify\(String\(value\)\)/);
    expect(callbackSrc).toContain('const token = ${tokenLiteral};');
    expect(callbackSrc).toContain('const expectedOrigin = ${originLiteral};');
  });

  const hostile = [
    '</script><script>alert(1)</script>',
    '"; alert(1); //',
    "'; alert(1); //",
    '`${alert(1)}`',
    '\\"); alert(1); //',
    'a\u2028b\u2029c',
    '<!--<script>',
    '&lt;&amp;',
    '\u0000\u001f\u007f',
  ];
  for (const token of hostile) {
    it(`敵対的なトークン ${JSON.stringify(token)} が元の文字列に正確に復元され、脱出しない`, async () => {
      const { html } = await renderCallback(token);
      const literal = literalOf(html, 'token');
      // HTML パーサ・JS パーサの両方で区切りになりうる文字が生で出ない
      expect(literal).not.toMatch(/[<>&\n\r\u2028\u2029]/);
      expect(literal.startsWith('"') && literal.endsWith('"')).toBe(true);
      // 評価結果が完全一致＝リテラルから脱出していない
      expect(new Function(`return ${literal};`)()).toBe(token);
      // </script> はスクリプト終端の1回だけ
      expect(html.split('</script>').length - 1).toBe(1);
    });
  }

  it('トークンが無い場合は空文字リテラルになりエラー表示に分岐する', async () => {
    const { html } = await renderCallback(undefined);
    expect(literalOf(html, 'token')).toBe('""');
  });

  it('expectedOrigin もリテラルとして正しく出力される', async () => {
    const { html } = await renderCallback('tok', 'https://staging.reiwa.casa');
    expect(new Function(`return ${literalOf(html, 'expectedOrigin')};`)()).toBe('https://staging.reiwa.casa');
  });
});
