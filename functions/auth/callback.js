import { isAllowedOrigin } from '../_shared/allowed-origin.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // state Cookie を即座に削除
  const clearStateCookie = 'oauth_state=; Path=/auth; HttpOnly; Secure; SameSite=Lax; Max-Age=0';

  const noCacheHeaders = {
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Pragma': 'no-cache',
  };

  if (!isAllowedOrigin(url.origin)) {
    return new Response('Unauthorized origin', {
      status: 403,
      headers: {
        ...noCacheHeaders,
        'Set-Cookie': clearStateCookie,
      },
    });
  }

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code) {
    return new Response('No code provided', {
      status: 400,
      headers: {
        ...noCacheHeaders,
        'Set-Cookie': clearStateCookie,
      },
    });
  }

  // CSRF防止: stateパラメータとCookie内のstateを照合
  const cookies = request.headers.get('Cookie') || '';
  const stateMatch = cookies.match(/(?:^|;\s*)oauth_state=([^;]+)/);
  const savedState = stateMatch ? stateMatch[1] : null;

  if (!state || !savedState || state !== savedState) {
    return new Response('Invalid state parameter', {
      status: 403,
      headers: {
        ...noCacheHeaders,
        'Set-Cookie': clearStateCookie,
      },
    });
  }

  const clientId = env.OAUTH_CLIENT_ID;
  const clientSecret = env.OAUTH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return new Response('OAuth credentials not configured', {
      status: 500,
      headers: {
        ...noCacheHeaders,
        'Set-Cookie': clearStateCookie,
      },
    });
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
      return new Response('Authentication failed', {
        status: 400,
        headers: {
          ...noCacheHeaders,
          'Set-Cookie': clearStateCookie,
        },
      });
    }

    // SEC-02 / SEC-39（Issue #117 項目10）: <script> 内へ埋め込む値は JSON.stringify で
    // 「引用符込みの JS 文字列リテラル」に変換する。手書きの置換列（旧 escapeForScript）は
    // U+2028/U+2029・バッククオート・`${` を扱わず、置換の順序にも依存していた。
    // JSON.stringify はバックスラッシュ・ダブルクオート・制御文字を常に正しくエスケープし、
    // 生成物がリテラルそのものなので、埋め込み先の引用符の種類に依存しない。
    // 追加で HTML パーサに解釈されうる < > & と、旧エンジンで行終端子になる U+2028/U+2029 を \uXXXX 化する。
    function toScriptStringLiteral(value) {
      return JSON.stringify(String(value))
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e')
        .replace(/&/g, '\\u0026')
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029');
    }

    const tokenLiteral = toScriptStringLiteral(data.access_token || '');
    const originLiteral = toScriptStringLiteral(url.origin);

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Authorizing...</title>
</head>
<body>
  <h2>Authorization Status</h2>
  <p id="status">Processing...</p>
  <script>
    (function() {
      const token = ${tokenLiteral};
      const provider = "github";
      const expectedOrigin = ${originLiteral};
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

      // SEC-31: ack を受信しないまま放置されるとハンドシェイクが無期限にハングするため、
      // フェイルセーフタイマーでリスナーを解除しユーザーにエラーを通知する
      const timeoutId = setTimeout(function() {
        window.removeEventListener("message", handleMessage);
        statusEl.textContent = "Error: Authorization timed out. Please close this window and try again.";
      }, 30000);

      // Step 2: Wait for acknowledgment from parent
      // SEC-31: { once: true } は「最初に届いたイベント」でリスナーを外してしまうため、
      // オリジン検証を通過しただけの無関係なメッセージ（同一オリジンの拡張機能・別処理由来等）
      // でも消費されてしまい、正規のackが無視される。関数を名前付きで登録し、
      // オリジン検証とペイロード完全一致検証の両方を通過した場合にのみ明示的に解除する。
      function handleMessage(event) {
        // オリジン検証: 想定されるオリジンからのメッセージのみ受け付ける
        if (event.origin !== expectedOrigin) return;

        // ペイロード検証: Decap CMSが返すack文字列と完全一致する場合のみ受け付ける
        // （同一オリジンの他用途postMessageを誤ってackとして扱わないため）
        if (event.data !== "authorizing:github") return;

        clearTimeout(timeoutId);
        window.removeEventListener("message", handleMessage);

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
      }

      window.addEventListener("message", handleMessage);
    })();
  </script>
</body>
</html>
    `;

    return new Response(html, {
      headers: {
        // SEC-38（Issue #117 項目9）: charset を明示し、CSP を自己完結させる。
        // frame-ancestors / form-action / base-uri は default-src にフォールバックしないため個別に指定する。
        // Functions のレスポンスには public/_headers が適用されないため、この応答自身で完結させる。
        'Content-Type': 'text/html; charset=utf-8',
        'Set-Cookie': clearStateCookie,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Content-Security-Policy': "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; frame-ancestors 'none'; form-action 'none'; base-uri 'none'",
      },
    });
  } catch (error) {
    return new Response('Authentication failed', {
      status: 500,
      headers: {
        ...noCacheHeaders,
        'Set-Cookie': clearStateCookie,
      },
    });
  }
}
