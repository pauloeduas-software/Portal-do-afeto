/* ================================================================
   comum/cores.js — Cores lidas do CSS, para desenhar no canvas
   ================================================================ */

/* Qualquer cor do CSS em [r, g, b]: o canvas converte para #rrggbb */
export function lerCor(cor) {
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.fillStyle = cor;
  const hex = ctx.fillStyle;
  return [1, 3, 5].map(function (i) { return parseInt(hex.slice(i, i + 2), 16); });
}

/* Cor de uma variável do CSS (como --page-accent) em [r, g, b] */
export function rgbDaVariavel(nome) {
  return lerCor(getComputedStyle(document.documentElement).getPropertyValue(nome).trim());
}

export function rgba(rgb, alpha) {
  return 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + alpha + ')';
}
