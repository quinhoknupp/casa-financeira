const { envStatus, sendJson } = require("./_utils");

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") return sendJson(res, 200, { ok: true });
  const status = envStatus();
  sendJson(res, 200, {
    ok: true,
    configured: status.pluggy && status.supabase,
    status,
    nextSteps: [
      "Configurar PLUGGY_CLIENT_ID e PLUGGY_CLIENT_SECRET na hospedagem.",
      "Configurar SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.",
      "Rodar supabase-schema.sql no Supabase.",
      "Conectar bancos pelo app."
    ]
  });
};
