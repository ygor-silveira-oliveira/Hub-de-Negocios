/* ============================ SIMULATOR ============================
   Fluxo: 1) plano -> 2) serviço liberado pra aquele plano -> 3) campos
   do serviço -> 4) resultado em tempo real.

   Todas as regras comerciais ficam centralizadas nas constantes abaixo.
   Se o HUB alterar algum percentual/valor no futuro, a alteração deve
   ser feita em UM único lugar, aqui neste bloco.
   ================================================================== */

/* -------- Quais serviços cada plano libera --------
   O plano é só uma regra de ACESSO aos serviços — não altera o
   percentual de comissão de cada serviço. */
const PLANOS = {
  simples: ["clt", "saque"],
  pro: ["clt", "saque", "loovi", "agv"],
  prime: ["clt", "saque", "loovi", "agv", "igreen"],
};

/* -------- Crédito CLT --------
   Comissão = valor liberado × percentual do prazo escolhido. */
const REGRAS_CLT = {
  12: 0.007,
  18: 0.019,
  24: 0.029,
  30: 0.044,
  36: 0.059,
};

/* -------- Antecipação Saque-Aniversário --------
   Comissão = valor da antecipação × percentual da faixa em que o
   valor se encaixa. */
const REGRAS_SAQUE = [
  { min: 50, max: 350, pct: 0.4 },
  { min: 350.01, max: 4700, pct: 0.26 },
  { min: 4700.01, max: 9080, pct: 0.2 },
];

/* -------- iGreen Energy (somente plano Prime) --------
   O percentual promocional SUBSTITUI os 3% de recorrência padrão —
   nunca somar os dois.

   ATENÇÃO / AMBIGUIDADE JÁ SINALIZADA AO CLIENTE:
   Para a faixa de 1 a 9 conexões, a regra informada foi "até 4%",
   sem detalhar uma progressão interna (ex: 1 conexão = X%, 5 conexões
   = Y%). Enquanto essa progressão não for definida, usamos o valor
   máximo informado (4%) fixo para toda a faixa de 1 a 9 conexões.
   Ajustar apenas este objeto quando a regra for detalhada. */
const REGRAS_IGREEN = [
  {
    min: 1,
    max: 9,
    pct: 0.04,
    obs: "Regra informada como 'até 4%' — usando o valor máximo (4%) até definição de uma progressão interna.",
  },
  { min: 10, max: 39, pct: 0.2 },
  { min: 40, max: Infinity, pct: 0.4 },
];

/* -------- Seguro de Carros — Universo AGV --------
   Comissão fixa por seguro vendido. */
const COMISSAO_AGV = 500;

/* ================================================================== */

function formatBRL(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/** Encontra a faixa de regra (saque ou iGreen) em que um valor se encaixa. */
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
  return { faixa, comissao: faixa ? valor * faixa.pct : 0 };
}

function calcularIgreen(valorConta, conexoes) {
  const faixa = encontrarFaixa(REGRAS_IGREEN, conexoes);
  const porConexao = faixa ? valorConta * faixa.pct : 0;
  const potencial = porConexao * conexoes;
  return { faixa, porConexao, potencial };
}

function calcularAGV(quantidade) {
  return quantidade * COMISSAO_AGV;
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

    serviceBtns.forEach((btn) => {
      const servico = btn.dataset.service;
      const disponivel = liberados.includes(servico);
      btn.hidden = !disponivel;
      btn.disabled = !disponivel;
    });

    // Se o serviço ativo não estiver mais liberado, seleciona o primeiro disponível.
    const ativoAtual = document.querySelector(".simulator__service-btn.is-active");
    const servicoAtivo = ativoAtual && !ativoAtual.hidden ? ativoAtual.dataset.service : null;

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

    recalcularServico(servico);
  }

  function recalcularServico(servico) {
    if (servico === "clt") recalcularCLT();
    else if (servico === "saque") recalcularSaque();
    else if (servico === "agv") recalcularAGV();
    else if (servico === "igreen") recalcularIgreen();
    // "loovi" não tem cálculo — é só uma vitrine de interesse.
  }

  // ---------- Etapa 1: planos ----------
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

  // ---------- Etapa 2: serviços ----------
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
    saquePercentual.textContent = faixa ? `${(faixa.pct * 100).toFixed(0)}%` : "—";
    saqueResultado.textContent = formatBRL(comissao);
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
    if (Number.isNaN(qtd) || qtd < 0) qtd = 0;
    agvQtd.value = qtd;
    agvResultado.textContent = formatBRL(calcularAGV(qtd));
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
  const igreenPorConexao = document.getElementById("igreenPorConexao");
  const igreenResultado = document.getElementById("igreenResultado");

  function recalcularIgreen() {
    if (!igreenConta || !igreenConexoes) return;

    let conta = parseFloat(igreenConta.value);
    if (Number.isNaN(conta) || conta < 0) conta = 0;

    let conexoes = parseInt(igreenConexoes.value, 10);
    if (Number.isNaN(conexoes) || conexoes < 0) conexoes = 0;

    const { faixa, porConexao, potencial } = calcularIgreen(conta, conexoes);

    igreenPercentual.textContent = faixa ? `${(faixa.pct * 100).toFixed(0)}%` : "—";
    igreenPorConexao.textContent = formatBRL(porConexao);
    igreenResultado.textContent = formatBRL(potencial);
  }

  if (igreenConta) igreenConta.addEventListener("input", recalcularIgreen);
  if (igreenConexoes) igreenConexoes.addEventListener("input", recalcularIgreen);

  // ---------- Estado inicial ----------
  atualizarServicosDisponiveis();
}
