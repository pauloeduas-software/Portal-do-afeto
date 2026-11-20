/* ================================================================
   cores.js — Cores da página, lidas do CSS (../../comum/cores.js)
   ================================================================ */

import { rgbDaVariavel, rgba } from '../../comum/cores.js';
export { rgba };

export const COR = rgbDaVariavel('--page-accent');
export const COR_NEBULOSA = rgbDaVariavel('--cor-nebulosa');

/* A cor de destaque, com transparência */
export function cor(alpha) {
  return rgba(COR, alpha);
}
