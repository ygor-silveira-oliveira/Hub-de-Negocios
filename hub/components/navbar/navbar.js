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

  // ----- Menu mobile (hambúrguer) -----
  const toggle = document.getElementById("navbarToggle");
  const menu = document.getElementById("navbarMenu");

  if (toggle && menu) {
    const closeMenu = () => {
      menu.classList.remove("is-open");
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Abrir menu");
      document.body.classList.remove("nav-open");
    };

    const openMenu = () => {
      menu.classList.add("is-open");
      toggle.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Fechar menu");
      document.body.classList.add("nav-open");
    };

    toggle.addEventListener("click", () => {
      const isOpen = menu.classList.contains("is-open");
      isOpen ? closeMenu() : openMenu();
    });

    // Fecha o menu ao clicar em um link.
    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    // Fecha o menu ao redimensionar para desktop.
    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) closeMenu();
    });
  }

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
