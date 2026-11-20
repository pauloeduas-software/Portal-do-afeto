/* ================================================================
   palco.js — Os canvas onde o globo é desenhado
   Duas camadas do mesmo tamanho, uma por cima da outra: o globo
   (#ceu), refeito só quando gira, e as luzes (#luzes), todo quadro.
   Guarda o tamanho da tela e avisa quem precisa refazer algo quando
   ele muda (o celular girou, a janela mudou).
   ================================================================ */

const canvasGlobo = document.getElementById('ceu');
const canvasLuzes = document.getElementById('luzes');
export const ctxGlobo = canvasGlobo.getContext('2d');
export const ctxLuzes = canvasLuzes.getContext('2d');

export let largura = 0;
export let altura = 0;
export let escalaTela = 1;

const ouvintes = [];

/* Acompanha o tamanho da tela; nítido em telas de alta densidade */
function ajustar() {
  escalaTela = Math.min(window.devicePixelRatio || 1, 1.5);
  largura = window.innerWidth;
  altura  = window.innerHeight;
  [canvasGlobo, canvasLuzes].forEach(function (canvas) {
    canvas.width  = Math.round(largura * escalaTela);
    canvas.height = Math.round(altura * escalaTela);
  });
  ouvintes.forEach(function (fn) { fn(); });
}

/* fn roda agora e de novo a cada mudança de tamanho */
export function aoAjustar(fn) {
  ouvintes.push(fn);
  fn();
}

ajustar();
window.addEventListener('resize', ajustar);
