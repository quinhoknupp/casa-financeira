const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });

const icons = {
  home: '<svg class="icon" viewBox="0 0 24 24"><path d="m3 10 9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></svg>',
  card: '<svg class="icon" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/></svg>',
  sync: '<svg class="icon" viewBox="0 0 24 24"><path d="M21 12a9 9 0 0 0-15-6.7L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 15 6.7L21 16"/><path d="M16 16h5v5"/></svg>',
  rules: '<svg class="icon" viewBox="0 0 24 24"><path d="M4 7h16"/><path d="M4 12h10"/><path d="M4 17h7"/><path d="m17 15 2 2 4-4"/></svg>',
  bell: '<svg class="icon" viewBox="0 0 24 24"><path d="M10 21h4"/><path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/></svg>',
  plus: '<svg class="icon" viewBox="0 0 24 24"><path d="M12 5v14"/><path d="M5 12h14"/></svg>'
};

const initialState = {
  tab: "home",
  filter: "todos",
  activeDialog: null,
  toast: "",
  backendStatus: "Verificando configuração online...",
  lastSync: "Hoje, 08:12",
  selectedOwner: "João",
  banks: [
    { id: "itau", name: "Itaú", status: "Pronto para conectar" },
    { id: "santander", name: "Santander", status: "Pronto para conectar" },
    { id: "nubank", name: "Nubank", status: "Pronto para conectar" },
    { id: "mercado-pago", name: "Mercado Pago", status: "Pronto para conectar" }
  ],
  automations: [
    { id: 1, label: "Importar bancos e cartões", enabled: true },
    { id: 2, label: "Classificar por regras", enabled: true },
    { id: 3, label: "Avisar vencimentos", enabled: true },
    { id: 4, label: "Separar João e esposa", enabled: true }
  ],
  accounts: [
    { bank: "Itaú", owner: "João", kind: "Conta corrente", balance: 8420.2, status: "Conectado" },
    { bank: "Nubank", owner: "Esposa", kind: "Cartão de crédito", balance: -2184.73, status: "Conectado" },
    { bank: "Santander", owner: "Casal", kind: "Conta conjunta", balance: 3810.42, status: "Conectado" },
    { bank: "PicPay", owner: "João", kind: "Carteira", balance: 402.15, status: "Pendente" }
  ],
  rules: [
    { match: "MERCADO, MULTI MARKE, ASSAI", category: "Mercado", confidence: 96 },
    { match: "UBER, 99, POSTO", category: "Transporte", confidence: 91 },
    { match: "FARM, DROGA, SAUDE", category: "Saúde", confidence: 88 },
    { match: "PAG*, PIX RECEBIDO", category: "Mov. bancária", confidence: 84 }
  ],
  transactions: [
    { id: 1, title: "RSHOP-MULTI MARKE", amount: -35.69, owner: "João", account: "Itaú", category: "Mercado", date: "2026-06-18", source: "Open Finance", review: false },
    { id: 2, title: "RECEBIMENTO DE VALOR", amount: 100.0, owner: "Casal", account: "Santander", category: "Escola", date: "2026-06-18", source: "Pix", review: false },
    { id: 3, title: "CARTÃO NUBANK FATURA", amount: -2184.73, owner: "Esposa", account: "Nubank", category: "Cartão", date: "2026-06-17", source: "Cartão", review: false },
    { id: 4, title: "RSHOP-SMART SUSHI", amount: -58.9, owner: "João", account: "Itaú", category: "Comida", date: "2026-06-16", source: "Open Finance", review: false },
    { id: 5, title: "PAG*SCIMPORTS", amount: -600.0, owner: "João", account: "Itaú", category: "Revisar", date: "2026-06-15", source: "Open Finance", review: true },
    { id: 6, title: "SALÁRIO", amount: 7350.0, owner: "Esposa", account: "Santander", category: "Receita", date: "2026-06-12", source: "Open Finance", review: false }
  ]
};

let state = loadState();

checkBackend();

function loadState() {
  const saved = localStorage.getItem("casa-financeira-state");
  if (!saved) return structuredClone(initialState);
  const parsed = JSON.parse(saved);
  return {
    ...structuredClone(initialState),
    ...parsed,
    automations: parsed.automations ?? structuredClone(initialState.automations),
    accounts: parsed.accounts ?? structuredClone(initialState.accounts),
    rules: parsed.rules ?? structuredClone(initialState.rules),
    transactions: parsed.transactions ?? structuredClone(initialState.transactions),
    banks: parsed.banks ?? structuredClone(initialState.banks),
    selectedOwner: parsed.selectedOwner ?? initialState.selectedOwner
  };
}

function saveState() {
  localStorage.setItem("casa-financeira-state", JSON.stringify(state));
}

function syncDemo() {
  const now = new Date();
  const nextId = Math.max(...state.transactions.map((tx) => tx.id)) + 1;
  state.transactions.unshift({
    id: nextId,
    title: "PIX MERCADO LOCAL",
    amount: -73.42,
    owner: "Casal",
    account: "Santander",
    category: "Mercado",
    date: now.toISOString().slice(0, 10),
    source: "Sincronizado",
    review: false
  });
  state.lastSync = "Agora";
  state.toast = "Sincronização concluída: 1 nova transação importada.";
  saveState();
  render();
}

function openAddDialog() {
  state.activeDialog = { type: "add" };
  state.toast = "";
  saveState();
  render();
}

function closeDialog() {
  state.activeDialog = null;
  saveState();
  render();
}

function addManualTransaction() {
  const now = new Date();
  const nextId = Math.max(...state.transactions.map((tx) => tx.id)) + 1;
  state.transactions.unshift({
    id: nextId,
    title: "LANÇAMENTO MANUAL",
    amount: -42.9,
    owner: state.selectedOwner,
    account: "Carteira",
    category: "Revisar",
    date: now.toISOString().slice(0, 10),
    source: "Manual",
    review: true
  });
  state.activeDialog = null;
  state.toast = "Lançamento manual criado para revisão.";
  saveState();
  render();
}

function toggleAutomation(id) {
  state.automations = state.automations.map((item) =>
    item.id === id ? { ...item, enabled: !item.enabled } : item
  );
  saveState();
  render();
}

function setTab(tab) {
  state.tab = tab;
  saveState();
  render();
}

function setFilter(filter) {
  state.filter = filter;
  saveState();
  render();
}

function setOwner(owner) {
  state.selectedOwner = owner;
  saveState();
  render();
}

function connectBank(id) {
  const bank = state.banks.find((item) => item.id === id);
  state.activeDialog = { type: "bank", bankId: id, bankName: bank?.name ?? "Banco" };
  state.toast = "";
  saveState();
  render();
}

async function authorizeBank(id) {
  const bank = state.banks.find((item) => item.id === id);
  let onlineReady = false;
  try {
    const tokenResponse = await fetch("/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ owner: state.selectedOwner, bankId: id })
    });
    const tokenPayload = await tokenResponse.json();
    onlineReady = tokenResponse.ok && Boolean(tokenPayload.accessToken);
    if (onlineReady) {
      await fetch("/api/connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerRole: ownerRole(state.selectedOwner),
          bankName: bank?.name,
          status: "awaiting_bank_authorization"
        })
      });
    }
  } catch (error) {
    onlineReady = false;
  }

  state.banks = state.banks.map((bank) =>
    bank.id === id ? { ...bank, status: `Conectado para ${state.selectedOwner}` } : bank
  );
  const exists = state.accounts.some((account) => account.bank === bank?.name && account.owner === state.selectedOwner);
  if (!exists && bank) {
    state.accounts.unshift({
      bank: bank.name,
      owner: state.selectedOwner,
      kind: bank.id === "nubank" ? "Cartão e conta" : "Conta conectada",
      balance: 0,
      status: "Conectado"
    });
  }
  state.activeDialog = null;
  state.toast = onlineReady
    ? `${bank?.name ?? "Banco"} pronto para abrir autorização real.`
    : `${bank?.name ?? "Banco"} conectado em modo demonstração. Configure Pluggy para sync real.`;
  saveState();
  render();
}

async function checkBackend() {
  try {
    const response = await fetch("/api/health");
    const payload = await response.json();
    state.backendStatus = payload.configured
      ? "Online configurado"
      : "Online parcial: faltam chaves";
  } catch (error) {
    state.backendStatus = "Modo local";
  }
  saveState();
  render();
}

function ownerRole(owner) {
  if (owner === "Esposa") return "esposa";
  if (owner === "Casal") return "casal";
  return "joao";
}

function totals() {
  const income = state.transactions.filter((tx) => tx.amount > 0).reduce((sum, tx) => sum + tx.amount, 0);
  const expenses = Math.abs(state.transactions.filter((tx) => tx.amount < 0).reduce((sum, tx) => sum + tx.amount, 0));
  const balance = state.accounts.reduce((sum, account) => sum + account.balance, 0);
  const due = state.transactions.filter((tx) => tx.review).reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  return { income, expenses, balance, due };
}

function filteredTransactions() {
  if (state.filter === "todos") return state.transactions;
  if (state.filter === "revisar") return state.transactions.filter((tx) => tx.review);
  return state.transactions.filter((tx) => tx.owner.toLowerCase() === state.filter);
}

function render() {
  const root = document.querySelector("#app");
  const sum = totals();
  root.innerHTML = `
    <main class="shell">
      <header class="topbar">
        <div class="brand">
          <div class="mark">CF</div>
          <div>
            <h1>Casa Financeira</h1>
            <p>Fonte principal do casal</p>
          </div>
        </div>
        <button class="icon-button" onclick="openAddDialog()" title="Adicionar lançamento" aria-label="Adicionar lançamento">${icons.plus}</button>
      </header>

      <section class="hero">
        <article class="summary">
          <p class="tiny">Saldo consolidado</p>
          <div class="balance-line">
            <div class="balance">${currency.format(sum.balance)}</div>
            <div class="delta">+${currency.format(sum.income - sum.expenses)} no mês</div>
          </div>
          <div class="metric-grid">
            <div class="metric"><span class="tiny">Entradas</span><b>${currency.format(sum.income)}</b></div>
            <div class="metric"><span class="tiny">Saídas</span><b>${currency.format(sum.expenses)}</b></div>
            <div class="metric"><span class="tiny">A revisar</span><b>${currency.format(sum.due)}</b></div>
          </div>
        </article>

        <article class="panel sync-card">
          <div class="panel-head">
            <div>
              <h2>Conectar bancos</h2>
              <p class="tiny">Escolha a pessoa e toque no banco</p>
            </div>
            <span class="status-line"><span class="dot"></span> ${state.backendStatus}</span>
          </div>
          ${renderBankConnectSimple()}
        </article>
      </section>

      ${renderContent()}
    </main>
    ${renderNav()}
    ${renderToast()}
    ${renderDialog()}
  `;

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

function renderContent() {
  if (state.tab === "accounts") return renderAccountsView();
  if (state.tab === "automation") return renderAutomationView();
  if (state.tab === "rules") return renderRulesView();
  return renderHomeView();
}

function renderHomeView() {
  return `
    <section class="content">
      <article class="panel">
        <div class="toolbar">
          <div>
            <h2>Transações</h2>
            <p class="tiny">Importadas, categorizadas e separadas por pessoa</p>
          </div>
          <div class="segmented">
            ${filterButton("todos", "Todos")}
            ${filterButton("joão", "João")}
            ${filterButton("esposa", "Esposa")}
            ${filterButton("revisar", "Revisar")}
          </div>
        </div>
        <div class="transactions">
          ${filteredTransactions().map(renderTransaction).join("") || '<div class="empty">Nada por aqui.</div>'}
        </div>
      </article>
      <aside class="side">
        ${renderAccountsPanel()}
        ${renderAutomationPanel()}
      </aside>
    </section>
  `;
}

function renderBankConnectSimple() {
  return `
    <div class="segmented owner-pick">
      ${ownerButton("João")}
      ${ownerButton("Esposa")}
      ${ownerButton("Casal")}
    </div>
    <div class="bank-grid">
      ${state.banks.map(renderBankButton).join("")}
    </div>
    <button class="primary" onclick="syncDemo()">${icons.sync} Sincronizar agora</button>
    <p class="tiny">Na versão real, o botão abre a tela segura do banco ou do provedor. O app não pede nem guarda senha.</p>
  `;
}

function renderToast() {
  if (!state.toast) return "";
  return `<div class="toast" role="status">${state.toast}</div>`;
}

function renderDialog() {
  if (!state.activeDialog) return "";
  if (state.activeDialog.type === "add") {
    return `
      <div class="overlay" onclick="closeDialog()">
        <section class="sheet" onclick="event.stopPropagation()" role="dialog" aria-modal="true" aria-label="Adicionar lançamento">
          <div class="sheet-head">
            <div>
              <h2>Adicionar lançamento</h2>
              <p class="tiny">Atalho simples para criar algo e revisar depois</p>
            </div>
            <button class="icon-button" onclick="closeDialog()" aria-label="Fechar">×</button>
          </div>
          <div class="preview-box">
            <b>LANÇAMENTO MANUAL</b>
            <span>${state.selectedOwner} · Revisar · -R$ 42,90</span>
          </div>
          <button class="primary" onclick="addManualTransaction()">${icons.plus} Criar lançamento</button>
        </section>
      </div>
    `;
  }
  return `
    <div class="overlay" onclick="closeDialog()">
      <section class="sheet" onclick="event.stopPropagation()" role="dialog" aria-modal="true" aria-label="Conectar ${state.activeDialog.bankName}">
        <div class="sheet-head">
          <div>
            <h2>${state.activeDialog.bankName}</h2>
            <p class="tiny">Conexão para ${state.selectedOwner}</p>
          </div>
          <button class="icon-button" onclick="closeDialog()" aria-label="Fechar">×</button>
        </div>
        <div class="step-list">
          <div><b>1</b><span>Você abre a autorização segura do banco.</span></div>
          <div><b>2</b><span>Confirma pelo app do banco, token ou biometria.</span></div>
          <div><b>3</b><span>Aqui entram saldos e transações automáticas.</span></div>
        </div>
        <button class="primary" onclick="authorizeBank('${state.activeDialog.bankId}')">${icons.sync} Autorizar conexão</button>
        <button class="secondary" onclick="closeDialog()">Cancelar</button>
      </section>
    </div>
  `;
}

function ownerButton(owner) {
  return `<button class="chip ${state.selectedOwner === owner ? "active" : ""}" onclick="setOwner('${owner}')">${owner}</button>`;
}

function renderBankButton(bank) {
  return `
    <button class="bank-button" onclick="connectBank('${bank.id}')" aria-label="Conectar ${bank.name}">
      <span>${bank.name}</span>
      <small>${bank.status}</small>
    </button>
  `;
}

function renderAccountsView() {
  return `
    <section class="content">
      <article class="panel">
        <div class="panel-head">
          <div>
            <h2>Contas conectadas</h2>
            <p class="tiny">João, esposa e contas compartilhadas</p>
          </div>
          <button class="secondary" onclick="setTab('home')">${icons.card} Conectar banco</button>
        </div>
        <div class="account-list">${state.accounts.map(renderAccount).join("")}</div>
      </article>
      <aside class="side">${renderRulesPanel()}</aside>
    </section>
  `;
}

function renderAutomationView() {
  return `
    <section class="content">
      <article class="panel">
        <div class="panel-head">
          <div>
            <h2>Rotinas automáticas</h2>
            <p class="tiny">O app trabalha sozinho e pede revisão quando tiver dúvida</p>
          </div>
        </div>
        <div class="automation-list">${state.automations.map(renderAutomationRow).join("")}</div>
      </article>
      <aside class="side">
        <article class="panel">
          <h3>Próximo passo real</h3>
          <p class="tiny">Criar backend com provedor Open Finance, usuários do casal, criptografia de tokens e banco de dados central.</p>
        </article>
      </aside>
    </section>
  `;
}

function renderRulesView() {
  return `
    <section class="content">
      <article class="panel">
        <div class="panel-head">
          <div>
            <h2>Regras de classificação</h2>
            <p class="tiny">Transformam descrições bancárias em categorias úteis</p>
          </div>
          <button class="secondary">${icons.plus} Nova regra</button>
        </div>
        <div class="rules">${state.rules.map(renderRule).join("")}</div>
      </article>
      <aside class="side">${renderAccountsPanel()}</aside>
    </section>
  `;
}

function renderAccountsPanel() {
  return `
    <article class="panel">
      <div class="panel-head"><h3>Contas</h3><button class="icon-button" onclick="setTab('home')" title="Conectar banco">${icons.plus}</button></div>
      <div class="account-list">${state.accounts.slice(0, 3).map(renderAccount).join("")}</div>
    </article>
  `;
}

function renderAutomationPanel() {
  return `
    <article class="panel">
      <div class="panel-head"><h3>Automações</h3><span class="tiny">4 ativas</span></div>
      <div class="automation-list">${state.automations.slice(0, 3).map(renderAutomationRow).join("")}</div>
    </article>
  `;
}

function renderRulesPanel() {
  return `
    <article class="panel">
      <div class="panel-head"><h3>Regras recentes</h3><span class="tiny">Auto</span></div>
      <div class="rules">${state.rules.slice(0, 3).map(renderRule).join("")}</div>
    </article>
  `;
}

function renderTransaction(tx) {
  const amountClass = tx.amount < 0 ? "out" : "in";
  return `
    <div class="transaction">
      <div class="tx-title">
        <b>${tx.title}</b>
        <div class="tx-meta">
          <span class="pill">${tx.owner}</span>
          <span class="pill">${tx.account}</span>
          <span class="pill">${tx.category}</span>
          <span class="pill">${dateFmt.format(new Date(`${tx.date}T12:00:00`))}</span>
          ${tx.review ? '<span class="pill review">revisar</span>' : ""}
        </div>
      </div>
      <div class="amount ${amountClass}">${currency.format(tx.amount)}</div>
    </div>
  `;
}

function renderAccount(account) {
  const initials = account.owner === "Casal" ? "C" : account.owner.slice(0, 1);
  return `
    <div class="account">
      <div class="account-info">
        <div class="avatar">${initials}</div>
        <div><b>${account.bank}</b><span>${account.owner} · ${account.kind}</span></div>
      </div>
      <div class="amount ${account.balance < 0 ? "out" : "in"}">${currency.format(account.balance)}</div>
    </div>
  `;
}

function renderRule(rule) {
  return `
    <div class="rule">
      <div><b>${rule.category}</b><p class="tiny">${rule.match}</p></div>
      <div class="confidence">${rule.confidence}%</div>
    </div>
  `;
}

function renderAutomationRow(item) {
  return `
    <div class="automation-row">
      <div><b>${item.label}</b><p class="tiny">${item.enabled ? "Ativa" : "Pausada"}</p></div>
      <button class="switch ${item.enabled ? "on" : ""}" onclick="toggleAutomation(${item.id})" aria-label="Alternar ${item.label}"></button>
    </div>
  `;
}

function filterButton(id, label) {
  return `<button class="chip ${state.filter === id ? "active" : ""}" onclick="setFilter('${id}')">${label}</button>`;
}

function navButton(id, label, icon) {
  return `<button class="tab ${state.tab === id ? "active" : ""}" onclick="setTab('${id}')">${icons[icon]}<span>${label}</span></button>`;
}

function renderNav() {
  return `
    <nav class="bottom-nav" aria-label="Navegação principal">
      ${navButton("home", "Resumo", "home")}
      ${navButton("accounts", "Contas", "card")}
      ${navButton("automation", "Auto", "sync")}
      ${navButton("rules", "Regras", "rules")}
    </nav>
  `;
}

render();
