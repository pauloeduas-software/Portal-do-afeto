/* ================================================================
   comum/efeitos-toque.js — Os corações do toque, desenhados no canvas
   (comum/camada-toque.js)
     soltarCoracao   toque rápido: aparece, sobe e some
     segurarCoracao  cresce até 3× e pulsa; depois explode ou some
   ================================================================ */

import {
  CORACAO_CONTORNO, CORACAO_PREENCHIDO, corDaPagina, desenharSprite, medirUnidade
} from './sprites-coracao.js';
import { desenhar, animar } from './camada-toque.js';

/* Desenhados em resolução maior: o coração segurado cresce até 3× */
const FONTE_TOQUE = 160;

const TEMPO_SUBIR   = 1800;   // toque rápido, do aparecer ao sumir
const TEMPO_CRESCER = 2000;   // segurado, até o tamanho máximo
const TEMPO_PULSO   = 450;    // segurado, meia batida
const TEMPO_SUMIR   = 200;    // segurado cancelado

/* Tamanho do coração em px da fonte: 2 × --coracao-unidade */
let tamanhoBase = 2 * medirUnidade();
window.addEventListener('resize', function () { tamanhoBase = 2 * medirUnidade(); });

/* A página pode dar várias cores em --cores-do-toque (a home, que tem
   a cor de todas): cada coração sai numa delas. Sem isso, a da página */
const lista = getComputedStyle(document.documentElement).getPropertyValue('--cores-do-toque').trim();
const CORES = lista ? lista.split(',').map(function (cor) { return cor.trim(); }) : [corDaPagina(1)];

const prontos = new Map();

function spriteAleatorio() {
  const simbolo = Math.random() < 0.5 ? CORACAO_CONTORNO : CORACAO_PREENCHIDO;
  const cor = CORES[Math.floor(Math.random() * CORES.length)];
  const chave = simbolo + cor;
  if (!prontos.has(chave)) prontos.set(chave, desenharSprite(simbolo, cor, FONTE_TOQUE));
  return prontos.get(chave);
}

/* Começa rápido e freia no fim */
function freia(p) {
  return 1 - Math.pow(1 - p, 3);
}

function misturar(a, b, p) {
  return a + (b - a) * p;
}

/* Toque rápido: cresce girando um pouco e depois sobe 22% da tela sumindo */
export function soltarCoracao(x, y) {
  const inicio = performance.now();
  const subida = window.innerHeight * 0.22;
  const c = { sprite: spriteAleatorio(), x: x, y: y, tamanho: 0, giro: 0, alpha: 0 };

  animar(function (agora) {
    const t = Math.max(0, agora - inicio) / TEMPO_SUBIR;
    if (t >= 1) return false;

    if (t < 0.18) {
      const p = freia(t / 0.18);
      c.tamanho = tamanhoBase * 1.3 * p;
      c.giro    = 12 * p;
      c.alpha   = p;
      c.y       = y;
    } else {
      const p = freia((t - 0.18) / 0.82);
      c.tamanho = tamanhoBase * misturar(1.3, 0.7, p);
      c.giro    = misturar(12, -8, p);
      c.alpha   = 1 - p;
      c.y       = y - subida * p;
    }
    desenhar(c);
    return true;
  });
}

/* Segurando: aparece, cresce de 0.8× a 3× em 2s e pulsa. Devolve o
   coração, que acompanha o arrasto com mover(), ao soltar explode()
   e ao cancelar sumir() */
export function segurarCoracao(x, y) {
  const inicio = performance.now();
  const c = { sprite: spriteAleatorio(), x: x, y: y, tamanho: 0, giro: 0, alpha: 0 };
  let sumindoDesde = 0;
  let acabou = false;

  animar(function (agora) {
    if (acabou) return false;
    const t = Math.max(0, agora - inicio);
    const cresce = misturar(0.8, 3, freia(Math.min(t / TEMPO_CRESCER, 1)));
    const pulso  = 1 + 0.12 * (1 - Math.cos(Math.PI * t / TEMPO_PULSO)) / 2;
    c.tamanho = tamanhoBase * cresce * pulso;
    c.alpha   = Math.min(t / 150, 1);

    if (sumindoDesde) {
      const s = (agora - sumindoDesde) / TEMPO_SUMIR;
      if (s >= 1) return false;
      c.alpha *= 1 - Math.max(s, 0);
    }
    desenhar(c);
    return true;
  });

  return {
    mover: function (novoX, novoY) {
      c.x = novoX;
      c.y = novoY;
    },
    sumir: function () {
      if (!sumindoDesde) sumindoDesde = performance.now();
    },
    /* 10 a 30 corações, mais longe quanto mais tempo segurou. Explode
       onde o coração está, que pode ter sido arrastado */
    explodir: function () {
      acabou = true;
      const forca = Math.min((performance.now() - inicio) / TEMPO_CRESCER, 1);
      explodirEm(c.x, c.y, forca);
    }
  };
}

function explodirEm(x, y, forca) {
  const inicio     = performance.now();
  const quantidade = Math.round(10 + 20 * forca);
  const alcance    = Math.max(window.innerWidth, window.innerHeight) / 3 * (0.4 + 0.6 * forca);
  const de         = 1 + 2 * forca;

  const cacos = [];
  for (let i = 0; i < quantidade; i++) {
    const angulo    = (i / quantidade) * Math.PI * 2 + Math.random() * 0.5;
    const distancia = alcance * (0.45 + Math.random() * 0.55);
    cacos.push({
      dx: Math.cos(angulo) * distancia,
      dy: Math.sin(angulo) * distancia,
      giroFinal: Math.random() * 120 - 60,
      duracao:   800 + Math.random() * 500,
      c: { sprite: spriteAleatorio(), x: x, y: y, tamanho: 0, giro: 0, alpha: 1 }
    });
  }

  /* Todos os cacos num efeito só: um laço por quadro */
  animar(function (agora) {
    let vivos = 0;
    cacos.forEach(function (caco) {
      const t = Math.max(0, agora - inicio) / caco.duracao;
      if (t >= 1) return;
      vivos++;
      const p = freia(t);
      const c = caco.c;
      c.x       = x + caco.dx * p;
      c.y       = y + caco.dy * p;
      c.tamanho = tamanhoBase * misturar(de, 0.5, p);
      c.giro    = caco.giroFinal * p;
      c.alpha   = t < 0.65 ? 1 : 1 - (t - 0.65) / 0.35;
      desenhar(c);
    });
    return vivos > 0;
  });
}
