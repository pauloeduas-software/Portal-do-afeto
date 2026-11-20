/* ================================================================
   luz.js — Uma luz percorre a constelação pronta de estrela em
   estrela; cada estrela brilha quando ela passa. Depois de uma pausa
   longa, ela passa de novo, sozinha
   ================================================================ */

import { ctx, escalaTela } from './palco.js';
import { cor } from './cores.js';

/* Quanto leva por linha e espera depois que o desenho chega no meio (ms) */
const POR_LINHA = 160;
const ESPERA = 800;
/* Pausa entre o fim de uma volta e a próxima (ms): longa, para a luz
   ser uma surpresa de vez em quando e não um enfeite girando sem parar */
const PAUSA = 8000;
/* Quanto a estrela fica acesa depois que a luz passa por ela (ms) */
const BRILHO_PASSAGEM = 700;
/* Rastro que a luz deixa atrás de si (px) */
const RASTRO = 90;

/* Quando a primeira volta começa a contar (a luz sai ESPERA ms depois),
   ou null sem constelação pronta */
let partida = null;

export function soltarLuz(quando) {
  partida = quando;
}

export function pararLuz() {
  partida = null;
}

/* Onde a luz está na volta atual, ou null se ainda não saiu ou está na
   pausa. Depois que chega ao fim, continua valendo até a última estrela
   terminar de brilhar, mas sem desenhar a luz (chegou) */
export function percurso(agora, lugares) {
  if (partida === null || lugares.length < 2) return null;

  const duracao = (lugares.length - 1) * POR_LINHA;
  const passou = agora - partida - ESPERA;
  if (passou < 0) return null;
  const desde = passou % (duracao + BRILHO_PASSAGEM + PAUSA);
  if (desde > duracao + BRILHO_PASSAGEM) return null;

  /* Distância acumulada até cada estrela */
  const marcos = [0];
  for (let i = 1; i < lugares.length; i++) {
    marcos.push(marcos[i - 1] + Math.hypot(lugares[i].x - lugares[i - 1].x, lugares[i].y - lugares[i - 1].y));
  }
  return {
    andado: Math.min(desde / duracao, 1) * marcos[marcos.length - 1],
    marcos: marcos,
    desde: desde,
    duracao: duracao,
    chegou: desde >= duracao
  };
}

/* Ponto do caminho a uma distância do começo */
function pontoNoCaminho(lugares, marcos, s) {
  let i = 1;
  while (i < marcos.length - 1 && marcos[i] < s) i++;
  const trecho = Math.max(marcos[i] - marcos[i - 1], 0.0001);
  const t = Math.min(Math.max((s - marcos[i - 1]) / trecho, 0), 1);
  return {
    x: lugares[i - 1].x + (lugares[i].x - lugares[i - 1].x) * t,
    y: lugares[i - 1].y + (lugares[i].y - lugares[i - 1].y) * t
  };
}

export function desenharLuz(lugares, luz) {
  if (!luz || luz.chegou) return;

  /* Rastro: os pedaços do caminho entre (andado - RASTRO) e andado */
  const inicio = Math.max(luz.andado - RASTRO, 0);
  ctx.beginPath();
  const p0 = pontoNoCaminho(lugares, luz.marcos, inicio);
  ctx.moveTo(p0.x, p0.y);
  for (let i = 1; i < luz.marcos.length; i++) {
    if (luz.marcos[i] > inicio && luz.marcos[i] < luz.andado) ctx.lineTo(lugares[i].x, lugares[i].y);
  }
  const cabeca = pontoNoCaminho(lugares, luz.marcos, luz.andado);
  ctx.lineTo(cabeca.x, cabeca.y);
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 2.2;
  ctx.shadowColor = cor(1);
  ctx.shadowBlur = 12 * escalaTela;
  ctx.stroke();
  ctx.shadowBlur = 0;

  const halo = ctx.createRadialGradient(cabeca.x, cabeca.y, 0, cabeca.x, cabeca.y, 14);
  halo.addColorStop(0, 'rgba(255,255,255,0.95)');
  halo.addColorStop(0.3, cor(0.6));
  halo.addColorStop(1, cor(0));
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cabeca.x, cabeca.y, 14, 0, Math.PI * 2);
  ctx.fill();
}

/* Quanto a estrela i ainda brilha por a luz ter passado por ela, de 0 a 1 */
export function brilhoDaPassagem(i, luz) {
  if (!luz) return 0;
  const total = luz.marcos[luz.marcos.length - 1] || 1;
  /* Há quanto tempo a luz passou por ela */
  const desde = luz.desde - luz.marcos[i] / total * luz.duracao;
  return desde >= 0 && desde < BRILHO_PASSAGEM ? 1 - desde / BRILHO_PASSAGEM : 0;
}
