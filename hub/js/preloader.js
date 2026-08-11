/* ============================ PRELOADER ============================
   Esconde a tela de carregamento assim que a página termina de carregar.
   Garante um tempo mínimo visível (evita "piscar" em conexões rápidas)
   e um tempo máximo de segurança (evita ficar preso caso algo trave).
   ===================================================================== */
(function () {
  const preloader = document.getElementById("preloader");
  if (!preloader) return;

  const TEMPO_MINIMO = 700; // ms — tempo mínimo visível na tela
  const TEMPO_MAXIMO = 6000; // ms — trava de segurança
  const inicio = Date.now();
  let escondido = false;

  function esconderPreloader() {
    if (escondido) return;
    escondido = true;

    const decorrido = Date.now() - inicio;
    const espera = Math.max(0, TEMPO_MINIMO - decorrido);

    setTimeout(() => {
      preloader.classList.add("preloader--hidden");
      preloader.addEventListener(
        "transitionend",
        () => preloader.remove(),
        { once: true },
      );
    }, espera);
  }

  window.addEventListener("load", esconderPreloader);
  setTimeout(esconderPreloader, TEMPO_MAXIMO); // trava de segurança
})();
