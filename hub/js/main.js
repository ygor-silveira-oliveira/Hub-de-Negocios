/* ============================================================
   HUB DE NEGÓCIOS — ORQUESTRADOR PRINCIPAL
   Carrega os componentes via fetch() e inicializa seus scripts.
   ============================================================ */

// Lista de componentes: nome da pasta = nome do arquivo html/js
const COMPONENTS = [
  "navbar",
  "hero",
  "about",
  "services",
  "how-it-works",
  "simulator",
  "plans",
  "comparison",
  "contact",
  "footer",
];

/**
 * Carrega o HTML de um componente e injeta no seu container.
 * O container é identificado por [data-component="<nome>"].
 */
async function loadComponent(name) {
  const container = document.querySelector(`[data-component="${name}"]`);
  if (!container) return;

  try {
    const res = await fetch(`components/${name}/${name}.html`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    container.innerHTML = await res.text();
  } catch (err) {
    console.log(`[v0] Falha ao carregar componente "${name}":`, err.message);
  }
}

/**
 * Importa dinamicamente o módulo JS de um componente, se existir,
 * e chama sua função init() padrão.
 */
async function initComponent(name) {
  try {
    const module = await import(`../components/${name}/${name}.js`);
    if (module && typeof module.init === "function") {
      module.init();
    }
  } catch (err) {
    // Nem todo componente possui JS — silenciar erros de módulo ausente.
    if (!String(err.message).includes("Failed to fetch")) {
      console.log(`[v0] Sem init para "${name}" ou erro:`, err.message);
    }
  }
}

/**
 * Observer global de reveal on scroll.
 * Qualquer elemento com a classe .reveal ganha animação de entrada.
 */
function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
  );

  els.forEach((el) => observer.observe(el));
}

/**
 * Ativa navegação suave e destaque do link ativo na navbar.
 */
function initSmoothNav() {
  const navbar = document.getElementById("navbar");

  // Altura real da navbar (fixa). Fallback caso ainda não exista.
  const getNavbarHeight = () => {
    if (navbar && navbar.offsetHeight) return navbar.offsetHeight;
    return 80; // fallback compatível com o CSS (~80px)
  };

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (!id || id.length <= 1) return;

      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();

      // “Primeira div”/topo real: tenta posicionar no container interno
      // que costuma conter o título (ex.: .container), senão usa o primeiro filho.
      // Para a home (id="inicio"), queremos voltar ao começo do site.
      if (id === "#inicio") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const first =
        target.querySelector(".container") ||
        target.querySelector(".section-tag, .section-title") ||
        target.firstElementChild ||
        target;

      const rect = first.getBoundingClientRect();
      const y = rect.top + window.scrollY - getNavbarHeight();

      window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    });
  });
}

/* -------- Boot -------- */
document.addEventListener("DOMContentLoaded", async () => {
  // 1. Carrega todos os HTMLs em paralelo (mantém a ordem visual pelos containers).
  await Promise.all(COMPONENTS.map(loadComponent));

  // 2. Inicializa o JS de cada componente.
  await Promise.all(COMPONENTS.map(initComponent));

  // 3. Comportamentos globais.
  initReveal();
  initSmoothNav();

  console.log("[v0] HUB de Negócios carregado.");
});
