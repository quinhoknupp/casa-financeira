const { handleError, pluggyRequest, readBody, sendJson } = require("./_utils");

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") return sendJson(res, 200, { ok: true });
  if (!["GET", "POST"].includes(req.method)) return sendJson(res, 405, { ok: false, message: "Método não permitido." });

  try {
    const body = req.method === "POST" ? await readBody(req) : {};
    const payload = await pluggyRequest("/connect_token", {
      method: "POST",
      body: JSON.stringify({
        options: {
          clientUserId: body.clientUserId || body.owner || "casa-financeira",
          ...(body.options || {})
        }
      })
    });
    sendJson(res, 200, { ok: true, ...payload });
  } catch (error) {
    handleError(res, error);
  }
};
