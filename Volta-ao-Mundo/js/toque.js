/* ================================================================
   toque.js — No globo, arrastar gira e tocar sem arrastar é um toque
   Um dedo por vez: o segundo dedo, no meio de um gesto, não conta.
   O mouse passando, ou o dedo encostado, aponta o país embaixo dele
   (brilha no globo) antes de escolher.
   Fora do globo, o toque é o de todas as páginas (../../comum/toque.js):
   tocar solta o coração e passa o idioma pelo click; segurar faz o
   coração crescer, e o click que viria depois é barrado lá.
   ================================================================ */

import { comecarArrasto, arrastar, soltarArrasto, apontar, pararDeApontar, estaNoGlobo } from './globo.js';

/* Andar mais que isto com o dedo encostado já é arrastar (px) */
const LIMITE_ARRASTO = 8;

/* Header e painel são da página, não do globo */
const FORA_DO_GLOBO = '.top-nav, .settings-panel';

/* { id, x0, y0, x, y, tipo, arrastando } do gesto em andamento */
let gesto = null;

/* O último toque começou no globo: o click dele não é de fora */
let comecouNoGlobo = false;

/* Mãozinha só onde o toque escolheria um idioma */
function marcarApontado(temLuz) {
  document.body.classList.toggle('apontando', temLuz);
}

/* Cursor de arrastar só em cima do globo */
function marcarSobreOGlobo(sobre) {
  document.body.classList.toggle('sobre-globo', sobre);
}

function esquecerApontado() {
  pararDeApontar();
  marcarApontado(false);
}

function terminar() {
  if (gesto && gesto.arrastando) soltarArrasto();
  document.body.classList.remove('arrastando');
  gesto = null;
}

/* `aoTocar(x, y)` recebe o toque rápido, no ponto onde encostou */
export function iniciarToque(aoTocar) {
  window.addEventListener('pointerdown', function (e) {
    if (gesto) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    comecouNoGlobo = !e.target.closest(FORA_DO_GLOBO) && estaNoGlobo(e.clientX, e.clientY);
    if (!comecouNoGlobo) return;
    gesto = {
      id: e.pointerId,
      x0: e.clientX, y0: e.clientY,
      x:  e.clientX, y:  e.clientY,
      tipo: e.pointerType,
      arrastando: false
    };
    marcarApontado(apontar(e.clientX, e.clientY).temLuz);
  });

  window.addEventListener('pointermove', function (e) {
    /* Mouse só passando por cima: aponta, sem escolher */
    if (!gesto) {
      if (e.pointerType !== 'mouse') return;
      if (e.target.closest(FORA_DO_GLOBO)) {
        esquecerApontado();
        marcarSobreOGlobo(false);
      } else {
        const a = apontar(e.clientX, e.clientY);
        marcarApontado(a.temLuz);
        marcarSobreOGlobo(a.noGlobo);
      }
      return;
    }
    if (e.pointerId !== gesto.id) return;
    if (!gesto.arrastando) {
      if (Math.hypot(e.clientX - gesto.x0, e.clientY - gesto.y0) < LIMITE_ARRASTO) return;
      gesto.arrastando = true;
      document.body.classList.add('arrastando');
      esquecerApontado();
      comecarArrasto();
    }
    arrastar(e.clientX - gesto.x, e.clientY - gesto.y);
    gesto.x = e.clientX;
    gesto.y = e.clientY;
  });

  window.addEventListener('pointerup', function (e) {
    if (!gesto || e.pointerId !== gesto.id) return;
    const gesto0 = gesto;
    const tocou = !gesto.arrastando;
    const dedo = gesto.tipo !== 'mouse';
    terminar();
    /* O toque escolhe o "te amo" que a luz apontada está mostrando:
       só depois dele o dedo para de apontar (no dedo não há "passando
       por cima") */
    if (tocou) aoTocar(gesto0.x0, gesto0.y0);
    if (dedo) esquecerApontado();
  });

  /* Toque rápido fora do globo: o próximo idioma. Pelo click, que o
     ../../comum/toque.js barra quando o dedo segurou um coração */
  document.addEventListener('click', function (e) {
    if (comecouNoGlobo) return;
    if (e.target.closest(FORA_DO_GLOBO + ', a, button')) return;
    aoTocar(e.clientX, e.clientY);
  });

  window.addEventListener('pointercancel', function (e) {
    if (gesto && e.pointerId === gesto.id) {
      esquecerApontado();
      terminar();
    }
  });
  window.addEventListener('blur', function () {
    esquecerApontado();
    terminar();
  });
  /* Mouse saiu da janela */
  document.documentElement.addEventListener('mouseleave', function () {
    esquecerApontado();
    marcarSobreOGlobo(false);
  });
}
