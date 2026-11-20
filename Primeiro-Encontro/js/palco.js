/* ================================================================
   palco.js — O canvas onde tudo é desenhado
   Guarda o tamanho da tela e a altura do header, e avisa quem precisa
   refazer algo quando eles mudam (o celular girou, a janela mudou).
   ================================================================ */

const canvas = document.getElementById('ceu');
export const ctx = canvas.getContext('2d');

const barraTopo = document.querySelector('.top-nav');

export let largura = 0;
export let altura = 0;
export let escalaTela = 1;
/* Onde o header termina (px): o coração fica abaixo, as luzes do vidro dentro */
export let topo = 0;

const ouvintes = [];

/* Acompanha o tamanho da tela; nítido em telas de alta densidade */
function ajustar() {
  escalaTela = Math.min(window.devicePixelRatio || 1, 1.5);
  largura = window.innerWidth;
  altura  = window.innerHeight;
  topo    = barraTopo.getBoundingClientRect().bottom;
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
/* O header muda de altura sem a tela mudar: a fonte carrega, ou o
   texto dos dias entra e quebra a linha num celular estreito */
new ResizeObserver(function () {
  if (barraTopo.getBoundingClientRect().bottom !== topo) ajustar();
}).observe(barraTopo);
