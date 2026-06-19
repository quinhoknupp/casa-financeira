const { handleError, readBody, sendJson, supabaseInsert } = require("./_utils");

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") return sendJson(res, 200, { ok: true });
  if (req.method !== "POST") return sendJson(res, 405, { ok: false, message: "Método não permitido." });

  try {
    const body = await readBody(req);
    const ownerRole = body.ownerRole || "joao";
    const saved = await supabaseInsert("bank_connections", {
      owner_role: ownerRole,
      bank_name: body.bankName || "Banco",
      pluggy_item_id: body.itemId || null,
      status: body.status || "connected"
    });

    sendJson(res, 200, {
      ok: true,
      saved: Boolean(saved),
      connection: saved?.[0] || {
        owner_role: ownerRole,
        bank_name: body.bankName || "Banco",
        pluggy_item_id: body.itemId || null,
        status: body.status || "connected"
      }
    });
  } catch (error) {
    handleError(res, error);
  }
};
