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

    // Return success page that sends token to parent window
    const token = data.access_token ? data.access_token.replace(/"/g, '\\"') : '';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Authorizing...</title>
</head>
<body>
  <h2>Authorization Status</h2>
  <p id="status">Processing...</p>
  <p id="debug"></p>
  <script>
    (function() {
      const token = "${token}";
      const provider = "github";
      const statusEl = document.getElementById('status');
      const debugEl = document.getElementById('debug');

      if (!token) {
        statusEl.textContent = "Error: No token received";
        debugEl.textContent = "GitHub response: ${JSON.stringify(data).replace(/"/g, '\\"')}";
        return;
      }

      statusEl.textContent = "Token received. Sending to parent window...";
      debugEl.textContent = "Token length: " + token.length;

      // Send message in the format Decap CMS expects (object format)
      const message = {
        type: 'authorization',
        provider: provider,
        token: token
      };

      console.log("Sending message:", JSON.stringify(message));

      if (window.opener) {
        window.opener.postMessage(message, "*");
        statusEl.textContent = "Message sent! Closing window...";

        setTimeout(function() {
          window.close();
        }, 2000);
      } else {
        statusEl.textContent = "Error: No parent window found";
      }
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
