export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return new Response('No code provided', { status: 400 });
  }

  const clientId = env.OAUTH_CLIENT_ID;
  const clientSecret = env.OAUTH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return new Response('OAuth credentials not configured', { status: 500 });
  }

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
      return new Response(`Error: ${data.error_description}`, { status: 400 });
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
      var token = "${token}";
      var provider = "github";
      var expectedOrigin = "${escapedOrigin}";
      var statusEl = document.getElementById('status');

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
        var message = "authorization:github:success:" + JSON.stringify({
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
      },
    });
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}
