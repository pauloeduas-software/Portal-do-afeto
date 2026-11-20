/* ================================================================
   cores.js — Cores da página, lidas do CSS (../../comum/cores.js)
   ================================================================ */

import { rgbDaVariavel, rgba } from '../../comum/cores.js';
export { rgba };

export const COR = rgbDaVariavel('--page-accent');

/* A mesma cor, mais clara: o miolo da luz, as pedrinhas e a linha do coração */
export const COR_CLARA = COR.map(function (v) { return Math.round(v + (255 - v) * 0.55); });

/* Luz redonda e desfocada, desenhada uma vez: cada quadro só a copia */
export function desenharLuz(rgb) {
  const tamanho = 128;
  const imagem = document.createElement('canvas');
  imagem.width = imagem.height = tamanho;
  const c = imagem.getContext('2d');
  const brilho = c.createRadialGradient(tamanho / 2, tamanho / 2, 0, tamanho / 2, tamanho / 2, tamanho / 2);
  brilho.addColorStop(0, rgba(rgb, 1));
  brilho.addColorStop(0.55, rgba(rgb, 0.8));
  brilho.addColorStop(1, rgba(rgb, 0));
  c.fillStyle = brilho;
  c.fillRect(0, 0, tamanho, tamanho);
  return imagem;
}

export const LUZ       = desenharLuz(COR);
export const LUZ_CLARA = desenharLuz(COR_CLARA);

/* Copia a luz com centro em (x, y), raio e transparência */
export function pintarLuz(ctx, imagem, x, y, raio, alpha) {
  ctx.globalAlpha = alpha;
  ctx.drawImage(imagem, x - raio, y - raio, raio * 2, raio * 2);
  ctx.globalAlpha = 1;
}
