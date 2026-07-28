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
    const scrollY = window.scrollY;
    const navbarH = navbar.offsetHeight || 80;
    let current = "";

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - navbarH - 10;
      const sectionBottom = sectionTop + section.offsetHeight;

      if (scrollY >= sectionTop && scrollY < sectionBottom) {
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

  spy();
  window.addEventListener("scroll", spy, { passive: true });
}
