/* ============================ CONTACT ============================
   Envio via EmailJS (dados completos por e-mail) + WhatsApp (mensagem
   fixa, sem dados pessoais, aberto somente após o e-mail ser enviado
   com sucesso). Sem backend, sem banco de dados.
   ================================================================ */

/* --------------------------------------------------------------------
   Credenciais do EmailJS (https://dashboard.emailjs.com/)
   Preencha os três valores abaixo antes de publicar o site.
   NUNCA insira a Private Key aqui — apenas a Public Key é segura
   para uso no navegador (frontend).
   -------------------------------------------------------------------- */
const EMAILJS_PUBLIC_KEY = "CTmTLFF9PMpULG7Y0";
const EMAILJS_SERVICE_ID = "service_3p6vz84";
const EMAILJS_TEMPLATE_ID = "template_27v1fyu";

// Inicializa o EmailJS assim que o SDK (carregado via CDN no index.html) estiver disponível.
let emailjsPronto = false;
if (typeof emailjs !== "undefined") {
  emailjs.init(EMAILJS_PUBLIC_KEY);
  emailjsPronto = true;
}

// WhatsApp: abre só com esta mensagem fixa, nunca com dados do formulário.
const whatsappNumber = "5551996505850";
const MENSAGEM_WHATSAPP =
  "Olá! Acabei de preencher o formulário no site do HUB e quero ser colaborador.";

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
  const form = document.getElementById("contactForm");
  if (!form) return;

  const submit = form.querySelector(".contact__submit");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (submit.disabled) return; // já está enviando, evita envio duplicado

    const dados = capturarDadosFormulario(form);
    const camposInvalidos = validarFormulario(dados);

    marcarCamposComErro(form, camposInvalidos);

    if (camposInvalidos.length > 0) {
      exibirFeedback(
        form,
        "Preencha todos os campos antes de continuar.",
        "erro",
      );
      return;
    }

    limparFeedback(form);
    enviarFormulario(form, submit);
  });
}

/**
 * Envia o formulário completo por e-mail via EmailJS. Só abre o
 * WhatsApp (com mensagem fixa, sem dados pessoais) depois que o
 * EmailJS confirmar o envio com sucesso.
 */
function enviarFormulario(form, submit) {
  if (!emailjsPronto) {
    exibirFeedback(
      form,
      "Não foi possível conectar ao serviço de e-mail. Tente novamente em instantes.",
      "erro",
    );
    return;
  }

  const textoOriginal = submit.textContent;
  submit.disabled = true;
  submit.textContent = "Enviando...";
  submit.style.opacity = "0.85";

  emailjs
    .sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form)
    .then(() => {
      abrirWhatsApp();
      exibirFeedback(
        form,
        "Recebemos seu interesse! Abrindo o WhatsApp...",
        "sucesso",
      );
      form.reset();
    })
    .catch((erro) => {
      console.error("Falha ao enviar formulário via EmailJS:", erro);
      exibirFeedback(
        form,
        "Não foi possível enviar seu formulário agora. Tente novamente.",
        "erro",
      );
      // Em caso de erro, os dados preenchidos permanecem no formulário.
    })
    .finally(() => {
      submit.disabled = false;
      submit.textContent = textoOriginal;
      submit.style.opacity = "1";
    });
}

/**
 * Abre uma nova aba no WhatsApp com a mensagem fixa (sem dados do
 * formulário), chamada apenas após o EmailJS confirmar o envio.
 */
function abrirWhatsApp() {
  const texto = encodeURIComponent(MENSAGEM_WHATSAPP);
  const url = `https://wa.me/${whatsappNumber}?text=${texto}`;
  window.open(url, "_blank", "noopener,noreferrer");
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
 * Mostra uma mensagem de feedback (erro ou sucesso) abaixo do botão
 * de envio. Em caso de erro de campos obrigatórios, também leva o
 * usuário até o primeiro campo que falta preencher.
 */
function exibirFeedback(form, texto, tipo) {
  let feedback = form.querySelector(".contact__feedback");

  if (!feedback) {
    feedback = document.createElement("p");
    form
      .querySelector(".contact__submit")
      .insertAdjacentElement("afterend", feedback);
  }

  feedback.className =
    tipo === "sucesso"
      ? "contact__feedback contact__feedback--sucesso"
      : "contact__feedback";
  feedback.textContent = texto;

  const primeiroComErro = form.querySelector(
    ".has-error input, .has-error select, .has-error textarea",
  );
  if (primeiroComErro) {
    primeiroComErro.focus();
  }
}

function limparFeedback(form) {
  const feedback = form.querySelector(".contact__feedback");
  if (feedback) feedback.remove();
}
