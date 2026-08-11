/* ============================ FAVICON GIRANDO ============================
   Gera vários "quadros" do favicon rotacionado usando canvas e troca
   rapidamente entre eles pra simular uma animação de giro de 360°
   sempre que a página carrega. Roda uma vez e para no ícone original.
   ============================================================================ */
(function () {
  const ICON_SRC = "assets/icon/icon.ico"; // ícone original (parado, no final)
  const FONTE_ROTACAO = "assets/icon/icon.ico"; // fonte p/ gerar os quadros
  const TOTAL_QUADROS = 36;
  const DURACAO_MS = 500;
  const CANVAS_TAM = 96; // canvas quadrado onde o ícone é centralizado

  const link = document.querySelector('link[rel="shortcut icon"]');
  if (!link) return;

  const img = new Image();
  img.onload = () => {
    const quadros = [];
    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_TAM;
    canvas.height = CANVAS_TAM;
    const ctx = canvas.getContext("2d");

    // Escala a imagem original pra caber no canvas, mantendo proporção
    const escala =
      Math.min(CANVAS_TAM / img.width, CANVAS_TAM / img.height) * 0.9;
    const w = img.width * escala;
    const h = img.height * escala;

    for (let i = 0; i < TOTAL_QUADROS; i++) {
      const angulo = (i / TOTAL_QUADROS) * 360;
      ctx.clearRect(0, 0, CANVAS_TAM, CANVAS_TAM);
      ctx.save();
      ctx.translate(CANVAS_TAM / 2, CANVAS_TAM / 2);
      ctx.rotate((angulo * Math.PI) / 180);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      ctx.restore();
      quadros.push(canvas.toDataURL("image/png"));
    }

    let indice = 0;
    const intervalo = setInterval(() => {
      link.href = quadros[indice];
      indice++;
      if (indice >= quadros.length) {
        clearInterval(intervalo);
        link.href = ICON_SRC; // volta pro ícone original, parado
      }
    }, DURACAO_MS / TOTAL_QUADROS);
  };
  img.src = FONTE_ROTACAO;
})();
