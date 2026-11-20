/* ================================================================
   relampago.js — Com o céu fechado, de vez em quando um clarão rosado
   acende as nuvens por dentro: um forte e logo um eco mais fraco
   ================================================================ */

import { rgbDaVariavel, rgba } from '../../comum/cores.js';

/* Intervalo sorteado entre um e outro, e quanto cada um dura (ms) */
const INTERVALO_MIN = 6000;
const INTERVALO_MAX = 14000;
const DURACAO = 700;

/* Só relampeja com o céu quase todo fechado */
const SO_FECHADO = 0.8;

/* A cor da página e, no miolo do clarão, ela quase branca */
const COR = rgbDaVariavel('--page-accent');
const COR_MIOLO = COR.map(function (v) { return Math.round(v + (255 - v) * 0.7); });

let proximo = null;  // quando sai o próximo
let atual = null;    // { inicio, x, y, r } do que está acontecendo

function sortearIntervalo() {
  return INTERVALO_MIN + Math.random() * (INTERVALO_MAX - INTERVALO_MIN);
}

/* Sobe e desce entre os instantes a e b (t de 0 a 1 na duração) */
function pulso(t, a, b) {
  if (t < a || t > b) return 0;
  return Math.sin((t - a) / (b - a) * Math.PI);
}

export function desenharRelampago(ctx, agora, fechado, tela) {
  if (fechado < SO_FECHADO) {
    proximo = null;
    atual = null;
    return;
  }
  if (proximo === null) proximo = agora + sortearIntervalo();
  if (!atual && agora >= proximo) {
    atual = {
      inicio: agora,
      x: tela.largura * (0.15 + Math.random() * 0.7),
      y: tela.altura * (0.05 + Math.random() * 0.15),
      r: Math.max(tela.largura, tela.altura) * 0.45
    };
    proximo = agora + DURACAO + sortearIntervalo();
  }
  if (!atual) return;

  const t = (agora - atual.inicio) / DURACAO;
  if (t >= 1) {
    atual = null;
    return;
  }
  const forca = pulso(t, 0, 0.25) * 0.45 + pulso(t, 0.35, 0.7) * 0.25;

  /* Somado por cima: clareia as nuvens sem cobri-las */
  ctx.globalCompositeOperation = 'lighter';
  const clarao = ctx.createRadialGradient(atual.x, atual.y, 0, atual.x, atual.y, atual.r);
  clarao.addColorStop(0, rgba(COR_MIOLO, forca));
  clarao.addColorStop(0.4, rgba(COR, forca * 0.35));
  clarao.addColorStop(1, rgba(COR, 0));
  ctx.fillStyle = clarao;
  ctx.fillRect(0, 0, tela.largura, tela.altura);
  ctx.globalCompositeOperation = 'source-over';
}
