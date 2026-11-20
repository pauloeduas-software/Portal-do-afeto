/* ================================================================
   curvas.js — Ritmo das animações: recebem t de 0 a 1
   ================================================================ */

/* Começa e termina devagar */
export function suave(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/* Sai rápido e chega devagar */
export function desacelera(t) {
  return 1 - Math.pow(1 - t, 3);
}

/* Passa um pouco do tamanho e volta, como se a estrela "estalasse" */
export function estala(t) {
  return 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2);
}
