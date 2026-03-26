// functions/ml-token.js
// Cloudflare Pages Function — troca código OAuth por token do ML

export const onRequestPost = async (context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  try {
    const body = await context.request.json();
    const { code, refresh_token, grant_type } = body;

    const ML_APP_ID   = "4538292403150286";
    const ML_SECRET   = context.env.ML_CLIENT_SECRET;
    const ML_REDIRECT = "https://meu-estoquepro.pages.dev";

    if (!ML_SECRET) {
      return new Response(
        JSON.stringify({ error: "ML_CLIENT_SECRET não configurado." }),
        { status: 500, headers }
      );
    }

    const params = new URLSearchParams();
    params.append("client_id", ML_APP_ID);
    params.append("client_secret", ML_SECRET);

    if (grant_type === "refresh_token") {
      params.append("grant_type", "refresh_token");
      params.append("refresh_token", refresh_token);
    } else {
      params.append("grant_type", "authorization_code");
      params.append("code", code);
      params.append("redirect_uri", ML_REDIRECT);
    }

    const resp = await fetch("https://api.mercadolibre.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      body: params.toString(),
    });

    const data = await resp.json();

    if (!resp.ok) {
      return new Response(
        JSON.stringify({ error: data.message || "Erro ao obter token", detail: data }),
        { status: resp.status, headers }
      );
    }

    return new Response(JSON.stringify(data), { status: 200, headers });

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers }
    );
  }
};

export const onRequestOptions = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
};

// Catch all other methods
export const onRequest = async (context) => {
  if (context.request.method === "POST") return onRequestPost(context);
  if (context.request.method === "OPTIONS") return onRequestOptions();
  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" }
  });
};
