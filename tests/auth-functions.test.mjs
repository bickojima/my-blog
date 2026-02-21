import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { onRequest as authIndex } from '../functions/auth/index.js';
import { onRequest as authCallback } from '../functions/auth/callback.js';

/**
 * Cloudflare Functions のコンテキストをモック生成
 */
function createContext({ url, env = {}, headers = {} }) {
  return {
    request: new Request(url, { headers }),
    env,
  };
}

/** テスト用の固定stateトークン */
const TEST_STATE = 'test-state-token-12345';

describe('OAuth認証: /auth/index.js（認証開始）', () => {
  it('OAUTH_CLIENT_IDが設定されている場合、GitHubへリダイレクトされる', async () => {
    const context = createContext({
      url: 'https://reiwa.casa/auth',
      env: { OAUTH_CLIENT_ID: 'test-client-id' },
    });

    const response = await authIndex(context);

    expect(response.status).toBe(302);
    const location = response.headers.get('location');
    expect(location).toContain('github.com/login/oauth/authorize');
    expect(location).toContain('client_id=test-client-id');
    expect(location).toContain('scope=public_repo%2Cread%3Auser');
    // stateパラメータが含まれること（SEC-11）
    expect(location).toMatch(/state=[a-f0-9-]+/i);
    // Set-Cookieヘッダーにoauth_stateが含まれること
    expect(response.headers.get('set-cookie')).toMatch(/oauth_state=[a-f0-9-]+/i);
  });

  it('リダイレクトURIにコールバックパスが含まれる', async () => {
    const context = createContext({
      url: 'https://reiwa.casa/auth',
      env: { OAUTH_CLIENT_ID: 'test-client-id' },
    });

    const response = await authIndex(context);
    const location = response.headers.get('location');
    const url = new URL(location);

    expect(url.searchParams.get('redirect_uri')).toBe(
      'https://reiwa.casa/auth/callback'
    );
  });

  it('OAUTH_CLIENT_IDが未設定の場合、500エラーを返す', async () => {
    const context = createContext({
      url: 'https://reiwa.casa/auth',
      env: {},
    });

    const response = await authIndex(context);

    expect(response.status).toBe(500);
    const text = await response.text();
    expect(text).toContain('not configured');
  });

  it('異なるオリジンでも正しいコールバックURLが生成される', async () => {
    const context = createContext({
      url: 'http://localhost:4321/auth',
      env: { OAUTH_CLIENT_ID: 'dev-client-id' },
    });

    const response = await authIndex(context);
    const location = response.headers.get('location');
    const url = new URL(location);

    expect(url.searchParams.get('redirect_uri')).toBe(
      'http://localhost:4321/auth/callback'
    );
  });
});

describe('OAuth認証: /auth/callback.js（コールバック処理）', () => {
  it('codeパラメータがない場合、400エラーを返す', async () => {
    const context = createContext({
      url: 'https://reiwa.casa/auth/callback',
      env: {
        OAUTH_CLIENT_ID: 'test-id',
        OAUTH_CLIENT_SECRET: 'test-secret',
      },
    });

    const response = await authCallback(context);

    expect(response.status).toBe(400);
    const text = await response.text();
    expect(text).toContain('No code provided');
  });

  it('OAuth資格情報が未設定の場合、500エラーを返す', async () => {
    const context = createContext({
      url: `https://reiwa.casa/auth/callback?code=test-code&state=${TEST_STATE}`,
      env: {},
      headers: { Cookie: `oauth_state=${TEST_STATE}` },
    });

    const response = await authCallback(context);

    expect(response.status).toBe(500);
    const text = await response.text();
    expect(text).toContain('not configured');
  });

  it('CLIENT_IDのみ設定でSECRETが未設定の場合も500エラー', async () => {
    const context = createContext({
      url: `https://reiwa.casa/auth/callback?code=test-code&state=${TEST_STATE}`,
      env: { OAUTH_CLIENT_ID: 'test-id' },
      headers: { Cookie: `oauth_state=${TEST_STATE}` },
    });

    const response = await authCallback(context);
    expect(response.status).toBe(500);
  });

  it('GitHubがエラーを返した場合、400エラーを返す', async () => {
    // GitHub API のモック
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: async () => ({
        error: 'bad_verification_code',
        error_description: 'The code passed is incorrect or expired.',
      }),
    });

    try {
      const context = createContext({
        url: `https://reiwa.casa/auth/callback?code=invalid-code&state=${TEST_STATE}`,
        env: {
          OAUTH_CLIENT_ID: 'test-id',
          OAUTH_CLIENT_SECRET: 'test-secret',
        },
        headers: { Cookie: `oauth_state=${TEST_STATE}` },
      });

      const response = await authCallback(context);

      expect(response.status).toBe(400);
      const text = await response.text();
      expect(text).toContain('Authentication failed');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('GitHubが成功した場合、トークンを含むHTMLが返される', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: async () => ({
        access_token: 'gho_test_token_12345',
        token_type: 'bearer',
        scope: 'repo,user',
      }),
    });

    try {
      const context = createContext({
        url: `https://reiwa.casa/auth/callback?code=valid-code&state=${TEST_STATE}`,
        env: {
          OAUTH_CLIENT_ID: 'test-id',
          OAUTH_CLIENT_SECRET: 'test-secret',
        },
        headers: { Cookie: `oauth_state=${TEST_STATE}` },
      });

      const response = await authCallback(context);

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toBe('text/html');

      const html = await response.text();
      // Decap CMS ハンドシェイクプロトコルの確認
      expect(html).toContain('authorizing:github');
      expect(html).toContain('authorization:github:success');
      expect(html).toContain('postMessage');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('GitHubへのリクエストが正しいパラメータで送信される', async () => {
    const originalFetch = globalThis.fetch;
    const mockFetch = vi.fn().mockResolvedValue({
      json: async () => ({ access_token: 'test-token' }),
    });
    globalThis.fetch = mockFetch;

    try {
      const context = createContext({
        url: `https://reiwa.casa/auth/callback?code=auth-code-123&state=${TEST_STATE}`,
        env: {
          OAUTH_CLIENT_ID: 'my-client-id',
          OAUTH_CLIENT_SECRET: 'my-client-secret',
        },
        headers: { Cookie: `oauth_state=${TEST_STATE}` },
      });

      await authCallback(context);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://github.com/login/oauth/access_token',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Accept: 'application/json',
          }),
        })
      );

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.client_id).toBe('my-client-id');
      expect(body.client_secret).toBe('my-client-secret');
      expect(body.code).toBe('auth-code-123');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

describe('セキュリティ検証（functions/auth/）', () => {
  const callbackSource = readFileSync('functions/auth/callback.js', 'utf-8');
  const indexSource = readFileSync('functions/auth/index.js', 'utf-8');

  it('escapeForScript関数でテンプレート変数をエスケープしている（SEC-02）', () => {
    expect(callbackSource).toContain('function escapeForScript');
    // access_tokenとoriginの両方がエスケープされていること
    expect(callbackSource).toContain('escapeForScript(data.access_token)');
    expect(callbackSource).toContain('escapeForScript(url.origin)');
  });

  it('postMessageの送信先がワイルドカード"*"でない（SEC-06）', () => {
    // postMessageの第2引数に"*"を使用していないこと
    expect(callbackSource).not.toMatch(/postMessage\([^)]+,\s*["']\*["']\s*\)/);
    // expectedOriginを使用していること
    expect(callbackSource).toContain('postMessage("authorizing:github", expectedOrigin)');
  });

  it('postMessage受信時にevent.originを検証している（SEC-06）', () => {
    expect(callbackSource).toContain('event.origin !== expectedOrigin');
  });

  it('OAuthスコープが最小権限である（SEC-07）', () => {
    // public_repo（公開リポジトリのみ）であること（repoは全リポジトリアクセス）
    expect(indexSource).toContain('public_repo');
    expect(indexSource).not.toMatch(/['"]repo['"]/);
    expect(indexSource).not.toMatch(/scope.*[,\s]repo[,\s'"]/);
    // read:user（読取のみ）であること（userは書込含む）
    expect(indexSource).toContain('read:user');
    expect(indexSource).not.toMatch(/scope.*[,\s]user['"]/);
  });

  it('OAuth開始時にstateパラメータを生成している（SEC-11）', () => {
    // stateトークンの生成（crypto.randomUUID）が含まれること
    expect(indexSource).toContain('crypto.randomUUID');
    // stateパラメータをGitHub auth URLに設定していること
    expect(indexSource).toMatch(/searchParams\.set\(\s*['"]state['"]/);
    // stateをHttpOnly Cookieに保存していること
    expect(indexSource).toContain('oauth_state=');
    expect(indexSource).toContain('HttpOnly');
    expect(indexSource).toContain('Secure');
    expect(indexSource).toContain('SameSite=Lax');
  });

  it('OAuthコールバックでstateパラメータを検証している（SEC-11）', () => {
    // URLからstateパラメータを取得していること
    expect(callbackSource).toMatch(/searchParams\.get\(\s*['"]state['"]\s*\)/);
    // Cookie内のoauth_stateを取得していること
    expect(callbackSource).toContain('oauth_state');
    // stateの照合をしていること
    expect(callbackSource).toContain('state !== savedState');
    // 不一致時に403を返すこと
    expect(callbackSource).toContain('403');
    // 検証後にCookieを削除していること
    expect(callbackSource).toContain('Max-Age=0');
  });

  it('OAuthエラーメッセージが汎化されている（SEC-13）', () => {
    // error_descriptionをクライアントにそのまま返していないこと
    expect(callbackSource).not.toContain('error_description');
    // 汎用メッセージを使用していること
    expect(callbackSource).toContain('Authentication failed');
  });
});
