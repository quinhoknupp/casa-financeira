const { handleError, pluggyRequest, readBody, sendJson, supabaseInsert } = require("./_utils");

async function listAccounts(itemId) {
  return pluggyRequest(`/accounts?itemId=${encodeURIComponent(itemId)}`, { method: "GET" });
}

async function listTransactions(accountId) {
  return pluggyRequest(`/v2/transactions?accountId=${encodeURIComponent(accountId)}`, { method: "GET" });
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") return sendJson(res, 200, { ok: true });
  if (req.method !== "POST") return sendJson(res, 405, { ok: false, message: "Método não permitido." });

  try {
    const body = await readBody(req);
    if (!body.itemId) return sendJson(res, 400, { ok: false, message: "Informe itemId." });

    const ownerRole = body.ownerRole || "joao";
    const accountsPayload = await listAccounts(body.itemId);
    const accounts = accountsPayload.results || accountsPayload.accounts || [];
    const savedAccounts = [];
    const savedTransactions = [];

    for (const account of accounts) {
      const saved = await supabaseInsert("bank_accounts", {
        owner_role: ownerRole,
        bank_name: body.bankName || account.marketingName || account.bankData?.name || "Banco",
        pluggy_account_id: account.id,
        name: account.name || account.marketingName || "Conta",
        type: account.type || null,
        balance: account.balance || 0,
        currency_code: account.currencyCode || "BRL"
      });
      if (saved?.[0]) savedAccounts.push(saved[0]);

      const txPayload = await listTransactions(account.id);
      const transactions = txPayload.results || txPayload.transactions || [];
      const rows = transactions.map((tx) => ({
        account_id: saved?.[0]?.id || null,
        owner_role: ownerRole,
        pluggy_transaction_id: tx.id,
        description: tx.description || tx.descriptionRaw || "Transação",
        amount: tx.amount || 0,
        date: (tx.date || new Date().toISOString()).slice(0, 10),
        category: tx.category || tx.categoryId || "Revisar",
        source: "Pluggy",
        needs_review: !tx.category
      }));
      if (rows.length) {
        const inserted = await supabaseInsert("transactions", rows);
        if (inserted) savedTransactions.push(...inserted);
      }
    }

    sendJson(res, 200, {
      ok: true,
      accountsImported: savedAccounts.length,
      transactionsImported: savedTransactions.length
    });
  } catch (error) {
    handleError(res, error);
  }
};
