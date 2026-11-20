/* ================================================================
   palco.js — O canvas onde o céu é desenhado
   Guarda o tamanho da tela e avisa quem precisa refazer algo quando
   ele muda (o celular girou, a janela mudou).
   ================================================================ */

const canvas = document.getElementById('ceu');
export const ctx = canvas.getContext('2d');

export let largura = 0;
export let altura = 0;
export let escalaTela = 1;

const ouvintes = [];

/* Acompanha o tamanho da tela; nítido em telas de alta densidade */
function ajustar() {
  escalaTela = Math.min(window.devicePixelRatio || 1, 1.5);
  largura = window.innerWidth;
  altura  = window.innerHeight;
  canvas.width  = Math.round(largura * escalaTela);
  canvas.height = Math.round(altura * escalaTela);
  ouvintes.forEach(function (fn) { fn(); });
}

/* fn roda agora e de novo a cada mudança de tamanho */
export function aoAjustar(fn) {
  ouvintes.push(fn);
  fn();
}

ajustar();
window.addEventListener('resize', ajustar);
