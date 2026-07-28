/* ============================ NAVBAR ============================ */
export function init() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  // Navbar transparente -> sólida ao rolar.
  const onScroll = () => {
    navbar.classList.toggle("is-scrolled", window.scrollY > 40);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // ----- Scroll Spy: destaca o link da seção visível -----
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".navbar__menu a");

  if (!sections.length || !navLinks.length) return;

  const spy = () => {
    const navbarH = navbar.offsetHeight || 80;
    let current = "";

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      // Seção "ativa" quando seu topo está próximo do topo da tela
      // (descontando a altura da navbar) e seu fundo ainda está visível
      if (rect.top <= navbarH + 60 && rect.bottom > navbarH + 60) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.toggle(
        "is-active",
        link.getAttribute("href") === `#${current}`,
      );
    });
  };

  requestAnimationFrame(spy);
  window.addEventListener("scroll", spy, { passive: true });
  window.addEventListener("resize", spy, { passive: true });
}
