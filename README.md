# HUB de Negócios — Site institucional

Site em **HTML/CSS/JS puro (vanilla)**, sem framework e sem etapa de build.
Os componentes são carregados dinamicamente em tempo de execução via `fetch()`.

## Como rodar localmente

Projeto 100% estático — sem Node.js, sem instalação de dependências.

Use a extensão **Live Server** do VS Code: clique com o botão direito em
`hub/index.html` e escolha **"Open with Live Server"**.

> Importante: abra o Live Server a partir de `hub/index.html` (não do
> `index.html` da raiz — esse arquivo não existe). Os caminhos relativos do
> projeto (`css/`, `components/`, `assets/`) são resolvidos a partir da
> pasta `hub/`.

Alternativa via terminal, sem VS Code (requer apenas Python, já vem
instalado na maioria dos sistemas):

```bash
cd hub
python3 -m http.server 3000
```

## Estrutura

```
hub/
├── index.html          # esqueleto da página + containers [data-component]
├── css/global.css      # design tokens, reset, utilitários globais
├── js/main.js           # orquestrador: carrega HTML e inicializa JS de cada componente
└── components/
    └── <nome>/
        ├── <nome>.html  # markup do componente
        ├── <nome>.css   # estilos exclusivos do componente
        └── <nome>.js    # opcional — deve exportar function init()
```

Não há bundler nem gerenciador de pacotes: cada asset novo precisa ser
referenciado manualmente. Isso é intencional (mantém o projeto leve, sem
dependências e sem etapa de instalação), mas exige atenção nos passos abaixo.

## Como adicionar um novo componente

1. Crie a pasta `hub/components/<nome>/` com `<nome>.html` e `<nome>.css`
   (e `<nome>.js` se precisar de comportamento — deve exportar `init()`).
2. No `hub/index.html`:
   - adicione `<link rel="stylesheet" href="components/<nome>/<nome>.css" />` no `<head>`;
   - adicione um container `<section data-component="<nome>"></section>` no local desejado.
3. No `hub/js/main.js`, adicione `"<nome>"` ao array `COMPONENTS`.

O orquestrador (`main.js`) cuida do resto: busca o HTML, injeta no container,
importa o JS do componente (se existir) e chama `init()` automaticamente.

## Como adicionar um novo asset (imagem, ícone, etc.)

Coloque o arquivo em `hub/assets/images/` (ou crie uma subpasta) e referencie
com caminho relativo à raiz de `hub/`, por exemplo `assets/images/novo.png`
— igual ao padrão já usado em `navbar.html` e `footer.html`.

## Convenções de código

- CSS em BEM simples: `.componente`, `.componente__parte`, `.componente__parte--modificador`.
- Cores, espaçamentos e tipografia sempre via variáveis de `css/global.css`
  (`var(--brand)`, `var(--text-muted)`, etc.) — nunca valores soltos.
- Animações de entrada: adicione a classe `.reveal` (e opcionalmente
  `data-delay="1"` a `"4"`) a qualquer elemento; o observer global em
  `main.js` cuida da transição ao entrar na viewport.
