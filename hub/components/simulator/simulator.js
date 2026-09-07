/* ============================ SIMULATOR ============================
   Fluxo: 1) plano -> 2) serviço liberado pra aquele plano -> 3) campos
   do serviço -> 4) resultado em tempo real.

   Todas as regras comerciais ficam centralizadas nas constantes abaixo.
   ================================================================== */

/* -------- Quais serviços cada plano libera -------- */
const PLANOS = {
  simples: ["clt", "saque"],
  pro: ["clt", "saque", "loovi", "agv"],
  prime: ["clt", "saque", "loovi", "agv", "igreen"],
};

/* -------- Crédito CLT -------- */
const REGRAS_CLT = {
  12: 0.007,
  18: 0.019,
  24: 0.029,
  30: 0.044,
  36: 0.059,
};

/* -------- Antecipação Saque-Aniversário -------- */
const REGRAS_SAQUE = [
  { min: 50, max: 350, pct: 0.4 },
  { min: 350.01, max: 4700, pct: 0.26 },
  { min: 4700.01, max: 9080, pct: 0.2 },
];

/* -------- iGreen Energy --------
   O percentual aplicado depende da quantidade de contas ativas.
   A regra anterior de 3% de recorrência foi substituída por estas faixas.

   1 a 20 contas ativas = 3%
   21 a 40 contas ativas = 20%
   41 ou mais contas ativas = 40%

   NÃO somar os percentuais.
   ================================================================== */
const REGRAS_IGREEN = [
  { min: 1, max: 20, pct: 0.03 },
  { min: 21, max: 40, pct: 0.2 },
  { min: 41, max: Infinity, pct: 0.4 },
];

/* -------- Seguro de Carros — Universo AGV -------- */
const COMISSAO_AGV = 500;

/* -------- Seguros / Loovi -------- */
const LOOVI_VALOR_MIN = 50;
const LOOVI_VALOR_MAX = 300;
const LOOVI_VALOR_PASSO = 50;

function calcularLoovi(quantidade, valorPorSeguro) {
  return quantidade * valorPorSeguro;
}

/* ================================================================== */

function formatBRL(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function encontrarFaixa(regras, valor) {
  return regras.find((faixa) => valor >= faixa.min && valor <= faixa.max);
}

/* -------- Cálculos de cada serviço -------- */

function calcularCLT(valor, prazo) {
  const pct = REGRAS_CLT[prazo] || 0;
  return valor * pct;
}

function calcularSaque(valor) {
  const faixa = encontrarFaixa(REGRAS_SAQUE, valor);

  return {
    faixa,
    comissao: faixa ? valor * faixa.pct : 0,
  };
}

function calcularIgreen(valorConta, contasAtivas) {
  const faixa = encontrarFaixa(REGRAS_IGREEN, contasAtivas);

  const porConta = faixa ? valorConta * faixa.pct : 0;
  const potencial = porConta * contasAtivas;

  return {
    faixa,
    porConta,
    potencial,
  };
}

function calcularAGV(quantidade) {
  return quantidade * COMISSAO_AGV;
}

/* ================================================================== */

/* ==================== TOTAL ACUMULADO DOS SIMULADORES ====================
   Painel que soma o valor PRINCIPAL de cada simulador (o mesmo número
   que aparece no ".simulator__result-value" de cada painel).

   - Guardado só em memória (objeto abaixo): some ao dar F5, como pedido.
   - Cada simulador ocupa sempre a mesma posição no objeto/lista; ao
     recalcular, o valor antigo é SUBSTITUÍDO (não somado), então não
     tem duplicidade quando o usuário edita os campos várias vezes.
   - Pra adicionar um novo simulador no futuro: só incluir uma entrada
     nova em SIMULADORES_TOTAL e chamar atualizarTotalSimulador(id, valor)
     dentro da função de recálculo dele. Não precisa mexer no resto.
   ========================================================================= */

const SIMULADORES_TOTAL = [
  { id: "saque", label: "Saque-Aniversário" },
  { id: "clt", label: "Crédito CLT" },
  { id: "agv", label: "Seguros (Universo AGV)" },
  { id: "igreen", label: "iGreen Energy" },
  { id: "loovi", label: "Seguros (Loovi)" },
];

/* Valor principal atual de cada simulador. Começa tudo zerado. */
const totaisSimuladores = SIMULADORES_TOTAL.reduce((acc, sim) => {
  acc[sim.id] = 0;
  return acc;
}, {});

let servicoAtivoNoTotal = null;

/* Plano atualmente selecionado (Simples/Pro/Prime) — o painel de total
   só lista/soma os serviços que esse plano libera (mesma lista usada
   pra habilitar os botões da Etapa 2, em PLANOS). */
let planoAtualNoTotal = "simples";

function renderizarTotalPainel() {
  const lista = document.getElementById("simTotalList");
  const totalGeralEl = document.getElementById("simTotalGeral");

  if (!lista || !totalGeralEl) return;

  const liberadosNoPlano = PLANOS[planoAtualNoTotal] || [];

  let totalGeral = 0;

  lista.innerHTML = SIMULADORES_TOTAL.filter((sim) =>
    liberadosNoPlano.includes(sim.id),
  )
    .map((sim) => {
      const valor = totaisSimuladores[sim.id] || 0;

      totalGeral += valor;

      const ativo = sim.id === servicoAtivoNoTotal ? " is-current" : "";

      return `
        <li class="simulator__total-row${ativo}">
          <span class="simulator__total-row-label">${sim.label}</span>
          <span class="simulator__total-row-value">${formatBRL(valor)}</span>
        </li>
      `;
    })
    .join("");

  totalGeralEl.textContent = formatBRL(totalGeral);
}

/* Chamada pelas funções de recálculo de cada simulador, sempre com o
   valor PRINCIPAL daquele resultado (ex.: comissão, total estimado).
   Substitui o valor anterior daquele serviço — nunca soma em cima. */
function atualizarTotalSimulador(servico, valor) {
  const valorNumerico = Number.isFinite(valor) ? valor : 0;

  totaisSimuladores[servico] = valorNumerico;

  renderizarTotalPainel();
}

/* ================================================================== */

export function init() {
  const planBtns = document.querySelectorAll(".simulator__plan-btn");
  const serviceBtns = document.querySelectorAll(".simulator__service-btn");
  const paineis = document.querySelectorAll(".simulator__panel");

  if (!planBtns.length || !serviceBtns.length) return;

  let planoAtual = "simples";

  function atualizarServicosDisponiveis() {
    const liberados = PLANOS[planoAtual] || [];

    planoAtualNoTotal = planoAtual;
    renderizarTotalPainel();

    serviceBtns.forEach((btn) => {
      const servico = btn.dataset.service;
      const disponivel = liberados.includes(servico);

      btn.hidden = !disponivel;
      btn.disabled = !disponivel;
    });

    const ativoAtual = document.querySelector(
      ".simulator__service-btn.is-active",
    );

    const servicoAtivo =
      ativoAtual && !ativoAtual.hidden ? ativoAtual.dataset.service : null;

    if (servicoAtivo && liberados.includes(servicoAtivo)) {
      mostrarServico(servicoAtivo);
    } else {
      mostrarServico(liberados[0]);
    }
  }

  function mostrarServico(servico) {
    if (!servico) return;

    serviceBtns.forEach((btn) => {
      const ativo = btn.dataset.service === servico;

      btn.classList.toggle("is-active", ativo);
      btn.setAttribute("aria-selected", String(ativo));
    });

    paineis.forEach((painel) => {
      painel.hidden = painel.dataset.panel !== servico;
    });

    servicoAtivoNoTotal = servico;

    recalcularServico(servico);
  }

  function recalcularServico(servico) {
    if (servico === "clt") recalcularCLT();
    else if (servico === "saque") recalcularSaque();
    else if (servico === "agv") recalcularAGV();
    else if (servico === "igreen") recalcularIgreen();
    else if (servico === "loovi") recalcularLoovi();
  }

  /* ---------- Etapa 1: planos ---------- */

  planBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      planoAtual = btn.dataset.plan;

      planBtns.forEach((b) => {
        const ativo = b === btn;

        b.classList.toggle("is-active", ativo);
        b.setAttribute("aria-selected", String(ativo));
      });

      atualizarServicosDisponiveis();
    });
  });

  /* ---------- Etapa 2: serviços ---------- */

  serviceBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.hidden || btn.disabled) return;

      mostrarServico(btn.dataset.service);
    });
  });

  /* ============================ CLT ============================ */

  const cltValor = document.getElementById("cltValor");
  const cltValorLabel = document.getElementById("cltValorLabel");
  const cltPrazos = document.getElementById("cltPrazos");
  const cltResultado = document.getElementById("cltResultado");

  let cltPrazoAtual = 36;

  function recalcularCLT() {
    if (!cltValor) return;

    const valor = Number(cltValor.value);

    cltValorLabel.textContent = formatBRL(valor);

    const comissao = calcularCLT(valor, cltPrazoAtual);

    cltResultado.textContent = formatBRL(comissao);

    atualizarTotalSimulador("clt", comissao);
  }

  if (cltValor) {
    cltValor.addEventListener("input", recalcularCLT);
  }

  if (cltPrazos) {
    cltPrazos.querySelectorAll(".simulator__term-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        cltPrazoAtual = Number(btn.dataset.prazo);

        cltPrazos.querySelectorAll(".simulator__term-btn").forEach((b) => {
          b.classList.toggle("is-active", b === btn);
        });

        recalcularCLT();
      });
    });
  }

  /* ========================= SAQUE-ANIVERSÁRIO ========================= */

  const saqueValor = document.getElementById("saqueValor");
  const saqueValorLabel = document.getElementById("saqueValorLabel");
  const saquePercentual = document.getElementById("saquePercentual");
  const saqueResultado = document.getElementById("saqueResultado");

  function recalcularSaque() {
    if (!saqueValor) return;

    const valor = Number(saqueValor.value);

    saqueValorLabel.textContent = formatBRL(valor);

    const { faixa, comissao } = calcularSaque(valor);

    saquePercentual.textContent = faixa
      ? `${(faixa.pct * 100).toFixed(0)}%`
      : "—";

    saqueResultado.textContent = formatBRL(comissao);

    atualizarTotalSimulador("saque", comissao);
  }

  if (saqueValor) {
    saqueValor.addEventListener("input", recalcularSaque);
  }

  /* ============================ UNIVERSO AGV ============================ */

  const agvQtd = document.getElementById("agvQtd");
  const agvMenos = document.getElementById("agvMenos");
  const agvMais = document.getElementById("agvMais");
  const agvResultado = document.getElementById("agvResultado");

  function recalcularAGV() {
    if (!agvQtd) return;

    let qtd = parseInt(agvQtd.value, 10);

    if (Number.isNaN(qtd) || qtd < 0) {
      qtd = 0;
    }

    agvQtd.value = qtd;

    const comissaoAgv = calcularAGV(qtd);

    agvResultado.textContent = formatBRL(comissaoAgv);

    atualizarTotalSimulador("agv", comissaoAgv);
  }

  if (agvQtd) {
    agvQtd.addEventListener("input", recalcularAGV);
  }

  if (agvMenos) {
    agvMenos.addEventListener("click", () => {
      const atual = Math.max(0, parseInt(agvQtd.value, 10) || 0);

      agvQtd.value = Math.max(0, atual - 1);

      recalcularAGV();
    });
  }

  if (agvMais) {
    agvMais.addEventListener("click", () => {
      const atual = Math.max(0, parseInt(agvQtd.value, 10) || 0);

      agvQtd.value = atual + 1;

      recalcularAGV();
    });
  }

  /* ============================ IGREEN ENERGY ============================ */

  const igreenConta = document.getElementById("igreenConta");
  const igreenConexoes = document.getElementById("igreenConexoes");
  const igreenPercentual = document.getElementById("igreenPercentual");
  const igreenResultado = document.getElementById("igreenResultado");

  function recalcularIgreen() {
    if (!igreenConta || !igreenConexoes) return;

    let conta = parseFloat(igreenConta.value);

    if (Number.isNaN(conta) || conta < 0) {
      conta = 0;
    }

    let contasAtivas = parseInt(igreenConexoes.value, 10);

    if (Number.isNaN(contasAtivas) || contasAtivas < 0) {
      contasAtivas = 0;
    }

    const { faixa, potencial } = calcularIgreen(conta, contasAtivas);

    igreenPercentual.textContent = faixa
      ? `${(faixa.pct * 100).toFixed(0)}%`
      : "—";

    igreenResultado.textContent = formatBRL(potencial);

    atualizarTotalSimulador("igreen", potencial);
  }

  if (igreenConta) {
    igreenConta.addEventListener("input", recalcularIgreen);
  }

  if (igreenConexoes) {
    igreenConexoes.addEventListener("input", recalcularIgreen);
  }

  /* ============================ SEGUROS / LOOVI ============================ */

  const looviQtd = document.getElementById("looviQtd");
  const looviQtdMenos = document.getElementById("looviQtdMenos");
  const looviQtdMais = document.getElementById("looviQtdMais");
  const looviValorLabel = document.getElementById("looviValorLabel");
  const looviValorMenos = document.getElementById("looviValorMenos");
  const looviValorMais = document.getElementById("looviValorMais");
  const looviResultado = document.getElementById("looviResultado");

  let looviValorAtual = LOOVI_VALOR_MIN;

  function recalcularLoovi() {
    if (!looviQtd) return;

    let qtd = parseInt(looviQtd.value, 10);

    if (Number.isNaN(qtd) || qtd < 0) {
      qtd = 0;
    }

    looviQtd.value = qtd;

    looviValorLabel.textContent = formatBRL(looviValorAtual);

    const totalLoovi = calcularLoovi(qtd, looviValorAtual);

    looviResultado.textContent = formatBRL(totalLoovi);

    atualizarTotalSimulador("loovi", totalLoovi);
  }

  if (looviQtd) {
    looviQtd.addEventListener("input", recalcularLoovi);
  }

  if (looviQtdMenos) {
    looviQtdMenos.addEventListener("click", () => {
      const atual = Math.max(0, parseInt(looviQtd.value, 10) || 0);

      looviQtd.value = Math.max(0, atual - 1);

      recalcularLoovi();
    });
  }

  if (looviQtdMais) {
    looviQtdMais.addEventListener("click", () => {
      const atual = Math.max(0, parseInt(looviQtd.value, 10) || 0);

      looviQtd.value = atual + 1;

      recalcularLoovi();
    });
  }

  if (looviValorMenos) {
    looviValorMenos.addEventListener("click", () => {
      looviValorAtual = Math.max(
        LOOVI_VALOR_MIN,
        looviValorAtual - LOOVI_VALOR_PASSO,
      );

      recalcularLoovi();
    });
  }

  if (looviValorMais) {
    looviValorMais.addEventListener("click", () => {
      looviValorAtual = Math.min(
        LOOVI_VALOR_MAX,
        looviValorAtual + LOOVI_VALOR_PASSO,
      );

      recalcularLoovi();
    });
  }

  /* ---------- Estado inicial ---------- */

  renderizarTotalPainel();
  atualizarServicosDisponiveis();
}
