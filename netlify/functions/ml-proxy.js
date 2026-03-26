// functions/ml-proxy.js
// Cloudflare Pages Function — proxy para API do ML (resolve CORS)

export const onRequestGet = async (context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  try {
    const url = new URL(context.request.url);
    const mlPath = url.searchParams.get("path");
    const token  = url.searchParams.get("token");

    if (!mlPath || !token) {
      return new Response(
        JSON.stringify({ _status: 400, error: "Parâmetros 'path' e 'token' são obrigatórios." }),
        { status: 200, headers }
      );
    }

    const mlUrl = "https://api.mercadolibre.com" + mlPath;

    const resp = await fetch(mlUrl, {
      headers: {
        "Authorization": "Bearer " + token,
        "Accept": "application/json",
      },
    });

    let data;
    const text = await resp.text();
    try { data = JSON.parse(text); } catch (e) { data = { error: text }; }

    if (typeof data === "object" && data !== null) {
      data._status = resp.status;
    }

    return new Response(JSON.stringify(data), { status: 200, headers });

  } catch (err) {
    return new Response(
      JSON.stringify({ _status: 500, error: err.message }),
      { status: 200, headers }
    );
  }
};

export const onRequestOptions = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
};

// Catch all methods
export const onRequest = async (context) => {
  if (context.request.method === "GET") return onRequestGet(context);
  if (context.request.method === "OPTIONS") return onRequestOptions();
  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" }
  });
};
