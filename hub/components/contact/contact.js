/* ============================ CONTACT ============================
   Envio 100% client-side: captura os dados do formulário, monta uma
   mensagem formatada e abre o WhatsApp com o texto pronto (wa.me).
   Sem backend, sem banco de dados, sem bibliotecas externas.
   ================================================================ */

// Número que recebe os contatos vindos do site (formato: DDI + DDD + número).
const whatsappNumber = "5551992664141";

export function init() {
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
