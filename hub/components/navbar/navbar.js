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
}
