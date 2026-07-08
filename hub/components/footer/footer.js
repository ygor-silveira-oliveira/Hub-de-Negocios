/* ============================ FOOTER ============================ */
export function init() {
  // Ano dinâmico no copyright.
  const yearEl = document.getElementById("footerYear");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // Botão "voltar ao topo".
  const toTop = document.getElementById("footerToTop");
  if (!toTop) return;

  const onScroll = () => {
    toTop.classList.toggle("is-visible", window.scrollY > 560);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  toTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
