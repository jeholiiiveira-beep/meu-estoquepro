// netlify/functions/ml-token.js
// Troca o código OAuth do Mercado Livre por access_token
// Roda no servidor (Netlify) — evita bloqueio CORS do navegador

const ML_APP_ID   = "4538292403150286";
const ML_SECRET   = "sPjaQdPEUONOXFdIgKgzEHTtbFSNkpkY";
const ML_REDIRECT = "https://meu-estoquepro.netlify.app";

exports.handler = async function(event, context) {
  // Permite apenas POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // CORS headers — permite chamadas do próprio site
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  try {
    const body = JSON.parse(event.body || "{}");
    const { code, refresh_token, grant_type } = body;

    // Monta o payload para a API do ML
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

    // Chama a API do Mercado Livre (sem restrição CORS — roda no servidor)
    const response = await fetch("https://api.mercadolibre.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      body: params.toString()
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: data.message || "Erro ao obter token", detail: data })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };

  } catch (err) {
    console.error("ml-token error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
