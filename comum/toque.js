/* ================================================================
   comum/toque.js — Lógica Global de Interação 💖
   Toque rápido solta um coração; segurar faz um coração crescer
   acima do dedo, que acompanha o arrasto e ao soltar explode em
   vários corações.
   Os corações são desenhados num canvas por cima da página
   (comum/efeitos-toque.js); aqui fica só a leitura do toque.
   ================================================================ */

import { soltarCoracao, segurarCoracao } from './efeitos-toque.js';

/* Quanto tempo segurando até o coração começar a crescer (ms) */
const ESPERA_SEGURAR = 300;
/* No dedo, andar mais que isto antes de segurar é rolagem, não segurar (px) */
const TOLERANCIA = 10;
/* No toque, o coração segurado aparece acima do dedo para não ficar escondido */
const ACIMA_DO_DEDO = 70;

/* Links e botões continuam com o coração na hora, sem segurar */
const INTERATIVOS = 'a, button, input, textarea, select, label, [role="button"]';

/* Com data-toque="so-no-topo" a página usa o toque para outra coisa
   (as estrelas da Constelação); o coração fica só onde ela não age */
const SO_NO_TOPO = '.top-nav, .settings-panel';

/* A página pode dizer, ponto a ponto, onde o toque é dela e não solta
   coração (o globo do Volta ao Mundo): fn(x, y) devolve true ali */
let pontoDaPagina = null;

export function toqueDaPaginaEm(fn) {
  pontoDaPagina = fn;
}

/* Toques em andamento, um por dedo */
const toques = new Map();

/* Depois de segurar, o click que o navegador dispara ao soltar é barrado
   — senão Constelação, Volta ao Mundo e Encontro passariam para a próxima frase */
let barrarCliqueAte = 0;

/* Onde fica o coração segurado: no mouse, na ponta; no dedo, acima dele */
function lugarDoCoracao(toque) {
  return { x: toque.x, y: toque.y - (toque.tipo === 'mouse' ? 0 : ACIMA_DO_DEDO) };
}

/* Passou o tempo de toque rápido: o coração aparece e começa a crescer */
function comecarASegurar(toque) {
  const lugar = lugarDoCoracao(toque);
  toque.coracao = segurarCoracao(lugar.x, lugar.y);
}

/* Rolou a página ou o navegador interrompeu: some sem explodir */
function cancelar(toque) {
  clearTimeout(toque.timer);
  if (!toque.coracao) return;

  toque.coracao.sumir();
  barrarCliqueAte = performance.now() + 500;
}

function cancelarTodos() {
  toques.forEach(cancelar);
  toques.clear();
}

function algumSegurando() {
  for (const toque of toques.values()) {
    if (toque.coracao) return true;
  }
  return false;
}

window.addEventListener('pointerdown', function (e) {
  /* Gesto novo: o click do gesto anterior, se viesse, já teria vindo */
  barrarCliqueAte = 0;

  /* A página pode desligar o toque (ex.: coração grande da Chuva) */
  const modo = document.body.dataset.toque;
  if (modo === 'desligado') return;
  if (modo === 'so-no-topo' && !e.target.closest(SO_NO_TOPO)) return;
  if (pontoDaPagina && !e.target.closest(SO_NO_TOPO) && pontoDaPagina(e.clientX, e.clientY)) return;
  if (e.pointerType === 'mouse' && e.button !== 0) return;

  if (e.target.closest(INTERATIVOS)) {
    soltarCoracao(e.clientX, e.clientY);
    return;
  }

  /* O pointerup do anterior se perdeu: sem isso o timer dele ainda
     faria um coração crescer sem dono, preso na tela */
  const anterior = toques.get(e.pointerId);
  if (anterior) cancelar(anterior);

  const toque = {
    x0: e.clientX, y0: e.clientY,   // onde encostou
    x:  e.clientX, y:  e.clientY,   // onde está agora
    tipo: e.pointerType,
    coracao: null
  };
  toque.timer = setTimeout(function () { comecarASegurar(toque); }, ESPERA_SEGURAR);
  toques.set(e.pointerId, toque);
});

window.addEventListener('pointermove', function (e) {
  const toque = toques.get(e.pointerId);
  if (!toque) return;
  toque.x = e.clientX;
  toque.y = e.clientY;

  /* Segurando: o coração vai junto com o arrasto */
  if (toque.coracao) {
    const lugar = lugarDoCoracao(toque);
    toque.coracao.mover(lugar.x, lugar.y);
    return;
  }

  /* No dedo, andar antes de segurar é rolagem: não começa a crescer, mas
     se a página não rolar, ao soltar ainda sai o coração do toque rápido.
     No mouse, mexer enquanto clica não muda nada */
  if (toque.tipo !== 'mouse' && Math.hypot(toque.x - toque.x0, toque.y - toque.y0) > TOLERANCIA) {
    clearTimeout(toque.timer);
  }
});

window.addEventListener('pointerup', function (e) {
  const toque = toques.get(e.pointerId);
  if (!toque) return;
  toques.delete(e.pointerId);
  clearTimeout(toque.timer);

  if (toque.coracao) {
    toque.coracao.explodir();
    barrarCliqueAte = performance.now() + 500;
  } else {
    /* Toque rápido: o coração aparece ao soltar, no ponto onde encostou */
    soltarCoracao(toque.x0, toque.y0);
  }
});

window.addEventListener('pointercancel', function (e) {
  const toque = toques.get(e.pointerId);
  if (!toque) return;
  cancelar(toque);
  toques.delete(e.pointerId);
});

/* Dedo segurando um coração: arrastar leva o coração em vez de rolar a
   página (sem isso o navegador rola e cancela o toque) */
window.addEventListener('touchmove', function (e) {
  if (e.cancelable && algumSegurando()) e.preventDefault();
}, { passive: false });

window.addEventListener('scroll', cancelarTodos, { capture: true, passive: true });
window.addEventListener('blur', cancelarTodos);
document.addEventListener('visibilitychange', cancelarTodos);

/* Captura na window roda antes dos listeners de click das páginas */
window.addEventListener('click', function (e) {
  if (performance.now() < barrarCliqueAte) {
    e.stopImmediatePropagation();
    e.preventDefault();
    barrarCliqueAte = 0;
  }
}, true);

/* Segurar o dedo abriria o menu de copiar/compartilhar: barrado só durante
   um toque na página. O botão direito do mouse mantém o menu, e links
   mantêm o menu deles */
window.addEventListener('contextmenu', function (e) {
  if (toques.size && !e.target.closest('a, input, textarea')) e.preventDefault();
});
