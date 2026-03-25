// netlify/functions/ml-proxy.js
// Proxy para chamadas à API do ML — resolve CORS no navegador

exports.handler = async function(event, context) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json"
  };

  // Preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const params = event.queryStringParameters || {};
    const mlPath  = params.path;   // ex: /users/123/items/search?status=active
    const token   = params.token;  // access_token do usuário

    if (!mlPath || !token) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Parâmetros 'path' e 'token' são obrigatórios." })
      };
    }

    const url = "https://api.mercadolibre.com" + mlPath;
    const resp = await fetch(url, {
      headers: { "Authorization": "Bearer " + token }
    });

    const data = await resp.json();

    return {
      statusCode: resp.status,
      headers,
      body: JSON.stringify(data)
    };

  } catch (err) {
    console.error("ml-proxy error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
