export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code) {
    return new Response('No code provided', { status: 400 });
  }

  // CSRF防止: stateパラメータとCookie内のstateを照合
  const cookies = request.headers.get('Cookie') || '';
  const stateMatch = cookies.match(/(?:^|;\s*)oauth_state=([^;]+)/);
  const savedState = stateMatch ? stateMatch[1] : null;

  if (!state || !savedState || state !== savedState) {
    return new Response('Invalid state parameter', { status: 403 });
  }

  const clientId = env.OAUTH_CLIENT_ID;
  const clientSecret = env.OAUTH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return new Response('OAuth credentials not configured', { status: 500 });
  }

  // state Cookie を即座に削除
  const clearStateCookie = 'oauth_state=; Path=/auth; HttpOnly; Secure; SameSite=Lax; Max-Age=0';

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
      }),
    });

    const data = await tokenResponse.json();

    if (data.error) {
      return new Response('Authentication failed', {
        status: 400,
        headers: { 'Set-Cookie': clearStateCookie },
      });
    }

    // HTMLに安全に埋め込むためのエスケープ関数
    // <script>タグ内でのXSSを防止: </script>脱出、バックスラッシュ、改行を処理
    function escapeForScript(str) {
      return String(str)
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/'/g, "\\'")
        .replace(/</g, '\\x3c')
        .replace(/>/g, '\\x3e')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r');
    }

    const token = data.access_token ? escapeForScript(data.access_token) : '';
    const escapedOrigin = escapeForScript(url.origin);

    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Authorizing...</title>
</head>
<body>
  <h2>Authorization Status</h2>
  <p id="status">Processing...</p>
  <script>
    (function() {
      const token = "${token}";
      const provider = "github";
      const expectedOrigin = "${escapedOrigin}";
      const statusEl = document.getElementById('status');

      if (!token) {
        statusEl.textContent = "Error: No token received";
        return;
      }

      statusEl.textContent = "Token received. Initiating handshake...";

      if (!window.opener) {
        statusEl.textContent = "Error: No parent window found";
        return;
      }

      // Step 1: Send authorizing message（オリジン指定で送信先を制限）
      window.opener.postMessage("authorizing:github", expectedOrigin);

      // Step 2: Wait for acknowledgment from parent
      window.addEventListener("message", function(event) {
        // オリジン検証: 想定されるオリジンからのメッセージのみ受け付ける
        if (event.origin !== expectedOrigin) return;

        statusEl.textContent = "Received acknowledgment. Sending token...";

        // Step 3: Send success message with token
        const message = "authorization:github:success:" + JSON.stringify({
          token: token,
          provider: provider
        });

        window.opener.postMessage(message, event.origin);
        statusEl.textContent = "Token sent! Closing window...";

        setTimeout(function() {
          window.close();
        }, 1000);
      }, { once: true });
    })();
  </script>
</body>
</html>
    `;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
        'Set-Cookie': clearStateCookie,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Content-Security-Policy': "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'",
      },
    });
  } catch (error) {
    return new Response('Authentication failed', {
      status: 500,
      headers: { 'Set-Cookie': clearStateCookie },
    });
  }
}
