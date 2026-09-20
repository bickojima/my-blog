function isAllowedOrigin(origin) {
  if (origin === 'https://reiwa.casa' || origin === 'https://staging.reiwa.casa') {
    return true;
  }
  if (/^https:\/\/([a-z0-9-]+\.)*my-blog-3cg\.pages\.dev$/.test(origin)) {
    return true;
  }
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    return true;
  }
  return false;
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const noCacheHeaders = {
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Pragma': 'no-cache',
  };

  if (!isAllowedOrigin(url.origin)) {
    return new Response('Unauthorized origin', {
      status: 403,
      headers: noCacheHeaders,
    });
  }

  const clientId = env.OAUTH_CLIENT_ID;

  if (!clientId) {
    return new Response('OAuth client ID not configured', {
      status: 500,
      headers: noCacheHeaders,
    });
  }

  // Get the origin for callback URL
  const origin = url.origin;
  const redirectUri = `${origin}/auth/callback`;

  // CSRF防止: ランダムなstateトークンを生成しCookieに保存
  const state = crypto.randomUUID();

  // Redirect to GitHub OAuth
  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
  githubAuthUrl.searchParams.set('client_id', clientId);
  githubAuthUrl.searchParams.set('redirect_uri', redirectUri);
  githubAuthUrl.searchParams.set('scope', 'public_repo,read:user');
  githubAuthUrl.searchParams.set('state', state);

  return new Response(null, {
    status: 302,
    headers: {
      'Location': githubAuthUrl.toString(),
      'Set-Cookie': `oauth_state=${state}; Path=/auth; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
    },
  });
}
