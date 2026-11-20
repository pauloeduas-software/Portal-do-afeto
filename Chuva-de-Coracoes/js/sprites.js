/* ================================================================
   sprites.js — Corações pré-desenhados da chuva
   Cada combinação de símbolo e brilho é desenhada uma vez só (com
   ../../comum/sprites-coracao.js, o mesmo desenho dos corações do toque).
   Depois a chuva só copia a imagem pronta.
   ================================================================ */

import { corDaPagina, desenharSprite } from '../../comum/sprites-coracao.js';

/* Tons do mesmo rosa da página, como o brightness(0.8 a 1.2) de antes */
export const BRILHOS = [0.8, 0.9, 1, 1.1, 1.2];

const prontos = new Map();

/* Coração da chuva: símbolo + índice em BRILHOS */
export function spriteDe(simbolo, brilho) {
  const chave = simbolo + brilho;
  if (!prontos.has(chave)) prontos.set(chave, desenharSprite(simbolo, corDaPagina(BRILHOS[brilho])));
  return prontos.get(chave);
}
