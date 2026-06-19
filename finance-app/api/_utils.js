const PLUGGY_BASE_URL = "https://api.pluggy.ai";

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function envStatus() {
  return {
    pluggy: Boolean(process.env.PLUGGY_CLIENT_ID && process.env.PLUGGY_CLIENT_SECRET),
    supabase: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
    appBaseUrl: Boolean(process.env.APP_BASE_URL)
  };
}

async function getPluggyApiKey() {
  if (!process.env.PLUGGY_CLIENT_ID || !process.env.PLUGGY_CLIENT_SECRET) {
    const error = new Error("PLUGGY_CLIENT_ID e PLUGGY_CLIENT_SECRET não configurados.");
    error.statusCode = 503;
    throw error;
  }

  const response = await fetch(`${PLUGGY_BASE_URL}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientId: process.env.PLUGGY_CLIENT_ID,
      clientSecret: process.env.PLUGGY_CLIENT_SECRET
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.message || "Falha ao autenticar na Pluggy.");
    error.statusCode = response.status;
    error.payload = payload;
    throw error;
  }

  return payload.apiKey;
}

async function pluggyRequest(path, options = {}) {
  const apiKey = await getPluggyApiKey();
  const response = await fetch(`${PLUGGY_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": apiKey,
      ...(options.headers || {})
    }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.message || "Falha na API da Pluggy.");
    error.statusCode = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

async function supabaseInsert(table, rows) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      Prefer: "return=representation"
    },
    body: JSON.stringify(rows)
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.message || `Falha ao gravar em ${table}.`);
    error.statusCode = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

function handleError(res, error) {
  sendJson(res, error.statusCode || 500, {
    ok: false,
    message: error.message || "Erro inesperado.",
    details: error.payload || null
  });
}

module.exports = {
  envStatus,
  handleError,
  pluggyRequest,
  readBody,
  sendJson,
  supabaseInsert
};
