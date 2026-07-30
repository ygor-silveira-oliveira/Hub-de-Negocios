/* ============================ CONTACT ============================
   Envio 100% client-side: captura os dados do formulário, monta uma
   mensagem formatada e abre o WhatsApp com o texto pronto (wa.me).
   Sem backend, sem banco de dados, sem bibliotecas externas.
   ================================================================ */

// Número que recebe os contatos vindos do site (formato: DDI + DDD + número).
const whatsappNumber = "5551996505850";

export function init() {
  initParticles();
  initForm();
}

function initParticles() {
  const canvas = document.getElementById("contactParticles");
  if (!canvas) return;

  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (prefersReduced) return;

  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let particles = [];
  let raf = null;

  const CONNECT_DIST = 130;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(50, Math.floor((width * height) / 20000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.4 + 0.4,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(229, 229, 231, 0.25)";
      ctx.fill();

      // Linhas suaves entre partículas próximas.
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.hypot(dx, dy);
        if (dist < CONNECT_DIST) {
          const alpha = (1 - dist / CONNECT_DIST) * 0.15;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(34, 197, 94, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    raf = requestAnimationFrame(draw);
  }

  resize();
  draw();

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !raf) {
        draw();
      } else if (!entry.isIntersecting && raf) {
        cancelAnimationFrame(raf);
        raf = null;
      }
    });
  });
  io.observe(canvas);
}

function initForm() {
  const form = document.querySelector(".contact__form");
  if (!form) return;

  const submit = form.querySelector(".contact__submit");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const dados = capturarDadosFormulario(form);
    const camposInvalidos = validarFormulario(dados);

    marcarCamposComErro(form, camposInvalidos);

    if (camposInvalidos.length > 0) {
      exibirFeedbackErro(form, "Preencha todos os campos antes de continuar.");
      return;
    }

    limparFeedbackErro(form);

    const mensagem = montarMensagem(dados);
    enviarWhatsApp(mensagem);

    animarEnvio(submit, form);
  });
}

/**
 * Lê os valores atuais de cada campo do formulário.
 */
function capturarDadosFormulario(form) {
  return {
    nome: form.querySelector("#cName").value.trim(),
    telefone: form.querySelector("#cPhone").value.trim(),
    cidade: form.querySelector("#cCity").value.trim(),
    estado: form.querySelector("#cState").value,
    profissao: form.querySelector("#cJob").value.trim(),
    vendas: form.querySelector("#cSales").value,
    plano: form.querySelector("#cPlan").value,
    objetivo: form.querySelector("#cGoal").value.trim(),
  };
}

/**
 * Verifica quais campos obrigatórios não foram preenchidos.
 * Retorna uma lista com os IDs dos campos inválidos (vazia = tudo certo).
 */
function validarFormulario(dados) {
  const camposObrigatorios = [
    { id: "cName", valor: dados.nome },
    { id: "cPhone", valor: dados.telefone },
    { id: "cCity", valor: dados.cidade },
    { id: "cState", valor: dados.estado },
    { id: "cJob", valor: dados.profissao },
    { id: "cSales", valor: dados.vendas },
    { id: "cPlan", valor: dados.plano },
    { id: "cGoal", valor: dados.objetivo },
  ];

  return camposObrigatorios
    .filter((campo) => !campo.valor)
    .map((campo) => campo.id);
}

function montarMensagem(dados) {
  const linha = "\u{2501}".repeat(22); // ━━━━━━━━━━━━━━━━━━━━━━ (caractere de linha, não é emoji)

  return (
    `>> Novo interessado no HUB de Negócios\n\n` +
    `*Nome:*\n${dados.nome}\n\n` +
    `*Telefone:*\n${dados.telefone}\n\n` +
    `*Localização:*\n${dados.cidade} - ${dados.estado}\n\n` +
    `*Profissão:*\n${dados.profissao}\n\n` +
    `*Já trabalha com vendas?*\n${dados.vendas}\n\n` +
    `*Objetivo:*\n${dados.objetivo}\n\n` +
    `*Plano de interesse:*\n${dados.plano}\n` +
    `${linha}\n` +
    `Mensagem enviada automaticamente através do formulário do site do HUB de Negócios.`
  );
}

/**
 * Abre uma nova aba no WhatsApp Web/App com a mensagem já preenchida.
 */
function enviarWhatsApp(mensagem) {
  const texto = encodeURIComponent(mensagem);
  const url = `https://wa.me/${whatsappNumber}?text=${texto}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * Adiciona/remove a classe visual de erro em cada campo do formulário.
 */
function marcarCamposComErro(form, camposInvalidos) {
  form.querySelectorAll(".contact__field").forEach((field) => {
    const input = field.querySelector("input, select, textarea");
    if (!input) return;

    const temErro = camposInvalidos.includes(input.id);
    field.classList.toggle("has-error", temErro);
  });
}

/**
 * Mostra uma mensagem de erro discreta abaixo do formulário e leva
 * o usuário até o primeiro campo que falta preencher.
 */
function exibirFeedbackErro(form, texto) {
  let feedback = form.querySelector(".contact__feedback");

  if (!feedback) {
    feedback = document.createElement("p");
    feedback.className = "contact__feedback";
    form
      .querySelector(".contact__submit")
      .insertAdjacentElement("afterend", feedback);
  }

  feedback.textContent = texto;

  const primeiroComErro = form.querySelector(
    ".has-error input, .has-error select, .has-error textarea",
  );
  if (primeiroComErro) {
    primeiroComErro.focus();
  }
}

function limparFeedbackErro(form) {
  const feedback = form.querySelector(".contact__feedback");
  if (feedback) feedback.remove();
}

/**
 * Feedback visual no botão após o envio (WhatsApp já foi aberto).
 */
function animarEnvio(submit, form) {
  if (!submit) return;

  const original = submit.textContent;
  submit.textContent = "Abrindo WhatsApp...";
  submit.disabled = true;
  submit.style.opacity = "0.85";

  setTimeout(() => {
    submit.textContent = original;
    submit.disabled = false;
    submit.style.opacity = "1";
    form.reset();
  }, 2600);
}
