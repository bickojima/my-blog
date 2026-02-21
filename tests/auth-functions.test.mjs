import { describe, it, expect, vi } from 'vitest';
import { onRequest as authIndex } from '../functions/auth/index.js';
import { onRequest as authCallback } from '../functions/auth/callback.js';

/**
 * Cloudflare Functions のコンテキストをモック生成
 */
function createContext({ url, env = {} }) {
  return {
    request: new Request(url),
    env,
  };
}

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
      url: 'https://reiwa.casa/auth/callback?code=test-code',
      env: {},
    });

    const response = await authCallback(context);

    expect(response.status).toBe(500);
    const text = await response.text();
    expect(text).toContain('not configured');
  });

  it('CLIENT_IDのみ設定でSECRETが未設定の場合も500エラー', async () => {
    const context = createContext({
      url: 'https://reiwa.casa/auth/callback?code=test-code',
      env: { OAUTH_CLIENT_ID: 'test-id' },
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
        url: 'https://reiwa.casa/auth/callback?code=invalid-code',
        env: {
          OAUTH_CLIENT_ID: 'test-id',
          OAUTH_CLIENT_SECRET: 'test-secret',
        },
      });

      const response = await authCallback(context);

      expect(response.status).toBe(400);
      const text = await response.text();
      expect(text).toContain('incorrect or expired');
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
        url: 'https://reiwa.casa/auth/callback?code=valid-code',
        env: {
          OAUTH_CLIENT_ID: 'test-id',
          OAUTH_CLIENT_SECRET: 'test-secret',
        },
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
        url: 'https://reiwa.casa/auth/callback?code=auth-code-123',
        env: {
          OAUTH_CLIENT_ID: 'my-client-id',
          OAUTH_CLIENT_SECRET: 'my-client-secret',
        },
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
