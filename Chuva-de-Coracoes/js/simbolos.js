/* ================================================================
   simbolos.js — Qual coração a chuva desenha (♡ ou ♥︎)
   ================================================================ */

import { CORACAO_CONTORNO, CORACAO_PREENCHIDO } from '../../comum/sprites-coracao.js';
export { CORACAO_CONTORNO, CORACAO_PREENCHIDO };

/* Escolha do painel: 'random' ou um dos dois símbolos */
let estiloEscolhido = 'random';

export function definirEstilo(estilo) {
  estiloEscolhido = estilo;
}

export function simboloDaChuva() {
  if (estiloEscolhido === 'random') {
    return Math.random() < 0.5 ? CORACAO_CONTORNO : CORACAO_PREENCHIDO;
  }
  return estiloEscolhido;
}
