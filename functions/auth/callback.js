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

      statusEl.textContent = "Token received. Initiating handshake...";
      debugEl.textContent = "Token length: " + token.length;

      if (!window.opener) {
        statusEl.textContent = "Error: No parent window found";
        return;
      }

      // Step 1: Send authorizing message
      window.opener.postMessage("authorizing:github", "*");
      console.log("Sent: authorizing:github");

      // Step 2: Wait for acknowledgment from parent
      window.addEventListener("message", function(event) {
        console.log("Received message from parent:", event.data);
        statusEl.textContent = "Received acknowledgment. Sending token...";

        // Step 3: Send success message with token
        const message = "authorization:github:success:" + JSON.stringify({
          token: token,
          provider: provider
        });

        console.log("Sending message:", message);
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
