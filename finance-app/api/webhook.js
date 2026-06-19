const { readBody, sendJson, supabaseInsert } = require("./_utils");

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") return sendJson(res, 200, { ok: true });
  if (req.method !== "POST") return sendJson(res, 405, { ok: false, message: "Método não permitido." });

  const body = await readBody(req).catch(() => ({}));
  await supabaseInsert("bank_connections", {
    owner_role: "casal",
    bank_name: "Pluggy webhook",
    pluggy_item_id: body.itemId || body.item?.id || null,
    status: body.event || body.type || "webhook_received"
  }).catch(() => null);

  sendJson(res, 200, { ok: true, received: true });
};
