/* ============================ SIMULATOR ============================
   Simulação ilustrativa: cada plano tem um ticket médio mensal por
   cliente (derivado dos valores de referência do briefing). O usuário
   ajusta o número de clientes ativos e a projeção é recalculada em
   tempo real. Não há integração com dados reais/backend.
   ================================================================== */
const PLANS = {
  start: {
    name: "Start",
    ticket: 24, // R$/cliente/mês — base: R$288 com 12 clientes
    recurringRate: 0, // sem recorrência estruturada neste plano
    recurringLabel: "—",
    payback: "Payback 3–4 meses",
  },
  pro: {
    name: "Pro",
    ticket: 33.71, // base: R$1.685,70 com 50 clientes
    recurringRate: 0.3, // recorrência parcial
    recurringLabel: "Parcial",
    payback: "Payback 60–90 dias",
  },
  prime: {
    name: "Prime",
    ticket: 38.64, // base: R$3.863,50 com 100 clientes
    recurringRate: 18, // R$/cliente/mês — base: R$1.800 com 100 clientes
    recurringLabel: null, // calculado em R$
    payback: "Payback 60–90 dias",
  },
};

const DEFAULT_CLIENTS = { start: 12, pro: 50, prime: 100 };
const MAX_CLIENTS = 200;

function formatBRL(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

export function init() {
  const pills = document.querySelectorAll(".simulator__pill");
  const range = document.getElementById("simClients");
  if (!pills.length || !range) return;

  const el = {
    name: document.getElementById("simPlanName"),
    monthly: document.getElementById("simMonthly"),
    yearly: document.getElementById("simYearly"),
    recurring: document.getElementById("simRecurring"),
    payback: document.getElementById("simPayback"),
    bar: document.getElementById("simBar"),
    clientsValue: document.getElementById("simClientsValue"),
  };

  let currentPlan = "start";

  function recalc() {
    const plan = PLANS[currentPlan];
    const clients = Number(range.value);
    const monthly = plan.ticket * clients;
    const yearly = monthly * 12;
    const recurring =
      plan.recurringLabel === "—"
        ? "—"
        : plan.recurringLabel === "Parcial"
        ? "Parcial"
        : formatBRL(plan.recurringRate * clients) + " / mês";

    el.name.textContent = plan.name;
    el.monthly.textContent = formatBRL(monthly);
    el.yearly.textContent = formatBRL(yearly);
    el.recurring.textContent = recurring;
    el.payback.textContent = plan.payback;
    el.clientsValue.textContent = String(clients);
    el.bar.style.width = Math.max(8, (clients / MAX_CLIENTS) * 100) + "%";
  }

  function selectPlan(planKey) {
    currentPlan = planKey;
    range.value = String(DEFAULT_CLIENTS[planKey]);
    recalc();
  }

  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      pills.forEach((p) => {
        p.classList.remove("is-active");
        p.setAttribute("aria-selected", "false");
      });
      pill.classList.add("is-active");
      pill.setAttribute("aria-selected", "true");
      selectPlan(pill.dataset.plan);
    });
  });

  range.addEventListener("input", recalc);

  selectPlan("start");
}
