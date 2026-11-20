# Portal do Afeto

Site estático (HTML, CSS e JS puro, sem build nem dependências), publicado
no GitHub Pages pelo `.github/workflows/site.yml`.

## Verificar e testar

- `node .github/scripts/verificar.mjs` confere a sintaxe de todos os `.js` e
  se todo arquivo citado em `src`, `href` e `import` existe. Roda no CI antes
  de publicar; rode depois de qualquer mudança.
- Para ver no navegador: `python3 -m http.server` na raiz (os módulos ES não
  abrem por `file://`).
- Pensado primeiro para celular: confira em ~390px de largura e com o
  celular deitado.

## Estrutura

- `comum/estilo.css`: base de todas as páginas (variáveis, fundo, header,
  botões) e as peças comuns da Constelação e dos Corações: `.ceu`,
  `.titulo-brilho` e `.aviso-toque`.
- `index.html` + `inicio.css` + `inicio.js`: a página inicial. Um portal
  por página, na cor dela (`--cor-*` no `inicio.css`), sobre um redemoinho
  em canvas atrás do título, com um braço de cada cor. Página nova ou nome
  novo: atualizar aqui.
- `comum/icone.svg` (abas) e `comum/icone-180.png` (tela inicial do
  iPhone): o ícone do site, ligado no `<head>` de toda página, junto com
  `<meta name="color-scheme" content="dark">` e do `comum/escuro-forcado.js`
  (o Samsung Internet escurece por cima mesmo assim e apaga o degradê do
  `.titulo-brilho`; no Samsung o script troca por cor sólida). Página nova leva tudo.
- `comum/cores.js`: cores lidas do CSS para o canvas (`rgbDaVariavel`,
  `rgba`).
- `comum/toque.js` e o resto de `comum/`: toque global — toque rápido solta
  um coração, segurar faz um crescer e explodir. A página desliga com `data-toque="desligado"`
  no `<body>`, ou deixa só no header e no painel com `data-toque="so-no-topo"`
  (Constelação: no resto da tela o toque acende estrelas). Para tirar só
  de uma área desenhada no canvas, `toqueDaPaginaEm(fn)` do `comum/toque.js`
  (Volta ao Mundo: no globo não sai coração, fora dele sai).
- Cada página numa pasta (`Primeiro-Encontro/`, `Chuva-de-Coracoes/`,
  `Constelacao/`, `Volta-ao-Mundo/`, `Um-Pedido/`) com `index.html`, um CSS e
  um JS com o nome da página, e `js/` com um módulo por assunto quando a
  página cresce.
- O JS principal da página só conduz as fases; o cabeçalho dele descreve as
  fases e lista os módulos de `js/`.

## Status das páginas

- **Todas fechadas:** Primeiro Encontro, Chuva de Corações, Constelação,
  Volta ao Mundo e Um Pedido. Não mexer nelas sem pedido explícito.

## Padrão visual

Não existe página de referência: existe o padrão abaixo, e toda página
segue ele. Nada de copiar o fundo ou outra peça de uma página para outra.

- Cor da página em `--page-accent` no `:root` do CSS da página; degradês,
  linhas e brilhos usam essa variável, inclusive no canvas (nada de cor da
  página escrita à mão no JS).
- Header: `<nav class="top-nav glass">` com o "Voltar" (`back-link` +
  `back-icon`) e, à direita, os botões da página em `.acoes-topo`
  (`.settings-btn`). Clicar no header nunca age na página.
- Sem barra embaixo: contador e botões vão para o header.
- Texto central: título `.titulo-brilho` (degradê branco → cor da página,
  na largura do texto, com brilho), `.decor-line` embaixo e o aviso
  `.aviso-toque`. Entra com `loadFadeIn` e sai com fade suave.
- Abertura: fundo da página escurecido (`.com-frase`), título que convida
  sem mandar, `.decor-line` e o aviso "Dê um toque na tela para…". O
  primeiro toque já faz o que a página faz (acende a estrela, solta o
  coração, mostra o primeiro te amo) e o fundo clareia em 0.8s.
- Aparecer e sumir: 0.8s, com atraso só quando espera outra coisa. O que
  some leva `visibility: hidden` depois do fade (fora do toque, do Tab e
  do leitor de tela).
- Mensagem: surge crescendo de `scale(0.95)` e clareando em 0.8s. Troca
  de texto igual: o antigo some em 0.3s e o novo surge em 0.8s (classe
  `.trocando`).
- Mensagem por cima de algo cheio: sem caixa, vidro ou borrão atrás — quem
  escurece é o fundo (`filter: brightness(0.35)` em 0.8s, como `.com-frase`).
- Fundo próprio só quando conta a história da página, desenhado em canvas
  (sem imagem) e sem a grade padrão. Cada página tem o fundo da sua
  história, nunca o de outra. O fundo deve aparecer desfocado atrás do
  header de vidro; luzes ali precisam de raio de 10 a 18px (menores o
  desfoque apaga).
- Teclado faz o mesmo que o toque: Espaço, Enter e Seta Direita, sem
  tecla segurada nem Alt/Ctrl/Cmd, e nunca com o foco num link ou botão.
- Testando no navegador: módulos JS ficam em cache; use Ctrl+Shift+R.

## Código

- Tudo em português: nomes, comentários, mensagens.
- `function` nomeada nos callbacks, como no resto do código.
- Comentários dizem o porquê, em frases curtas, no topo de cada bloco.
- Animação em canvas: posições em fração da tela (sobrevive a girar o
  celular) e `devicePixelRatio` limitado a 1.5 (a 2, o celular não dava conta da
  tela cheia a cada quadro).
