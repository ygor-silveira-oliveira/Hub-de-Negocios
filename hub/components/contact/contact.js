/* ============================ CONTACT ============================
   Apenas feedback visual. Sem integração/backend (conforme briefing).
   ================================================================ */
export function init() {
  const form = document.querySelector(".contact__form");
  if (!form) return;

  const submit = form.querySelector(".contact__submit");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!submit) return;

    const original = submit.textContent;
    submit.textContent = "Recebemos seu interesse!";
    submit.disabled = true;
    submit.style.opacity = "0.85";

    setTimeout(() => {
      submit.textContent = original;
      submit.disabled = false;
      submit.style.opacity = "1";
      form.reset();
    }, 2600);
  });
}
