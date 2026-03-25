// netlify/functions/ml-proxy.js
// Proxy para chamadas à API do ML — resolve CORS no navegador

exports.handler = async function(event, context) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const params = event.queryStringParameters || {};
    const mlPath  = params.path;
    const token   = params.token;

    if (!mlPath || !token) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ _status: 400, error: "Parâmetros 'path' e 'token' são obrigatórios." })
      };
    }

    const url = "https://api.mercadolibre.com" + mlPath;

    const resp = await fetch(url, {
      headers: {
        "Authorization": "Bearer " + token,
        "Accept": "application/json"
      }
    });

    let data;
    const text = await resp.text();
    try { data = JSON.parse(text); } catch(e) { data = { error: text }; }

    // Inject HTTP status so client can handle errors without fetch() throwing
    if (typeof data === 'object' && data !== null) {
      data._status = resp.status;
    }

    return {
      statusCode: 200, // always 200 — error detection via _status field
      headers,
      body: JSON.stringify(data)
    };

  } catch (err) {
    console.error("ml-proxy error:", err);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ _status: 500, error: err.message })
    };
  }
};
