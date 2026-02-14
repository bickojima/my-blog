export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const clientId = env.OAUTH_CLIENT_ID;

  if (!clientId) {
    return new Response('OAuth client ID not configured', { status: 500 });
  }

  // Get the origin for callback URL
  const origin = url.origin;
  const redirectUri = `${origin}/auth/callback`;

  // Redirect to GitHub OAuth
  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
  githubAuthUrl.searchParams.set('client_id', clientId);
  githubAuthUrl.searchParams.set('redirect_uri', redirectUri);
  githubAuthUrl.searchParams.set('scope', 'repo,user');

  return Response.redirect(githubAuthUrl.toString(), 302);
}
