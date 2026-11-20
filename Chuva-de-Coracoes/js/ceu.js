/* ================================================================
   ceu.js — O céu de nuvens rosadas de onde cai a chuva
   Um canvas só para o fundo, atrás de tudo, com o próprio ritmo: as
   nuvens andam o tempo todo, chovendo ou não. Com a chuva ligada, o
   céu fecha (mais nuvens, mais escuras) e de vez em quando relampeja;
   desligada, ele abre de novo.

   js/nuvens.js     as nuvens, pintadas uma vez e só movidas
   js/relampago.js  o clarão rosado por dentro das nuvens
   ================================================================ */

import { criarNuvens, desenharNuvens } from './nuvens.js';
import { desenharRelampago } from './relampago.js';

/* Quanto o céu leva, mais ou menos, para fechar ou abrir (ms) */
const MUDAR = 2500;

/* Céu de fim de tarde (aberto) e de chuva (fechado), de cima para baixo */
const CEU_ABERTO  = [[42, 16, 48], [20, 10, 26], [6, 3, 8]];
const CEU_FECHADO = [[22, 10, 25], [11, 6, 14], [4, 2, 5]];

const canvas = document.getElementById('ceu');
const ctx = canvas.getContext('2d');

/* Tamanho da tela, repassado às nuvens e ao relâmpago */
const tela = { largura: 0, altura: 0, escala: 1 };

/* 0 = céu aberto, 1 = fechado de chuva; alvo é para onde está indo */
let fechado = 0;
let alvo = 0;
let anterior = null;
let sorteio = null;

/* Acompanha o tamanho da tela; nítido em telas de alta densidade.
   Devolve true se a tela mudou de verdade: a barra do navegador
   aparecendo no celular não pode fazer o céu pular */
function medir() {
  const mudou = window.innerWidth !== tela.largura ||
                Math.abs(window.innerHeight - tela.altura) >= 120;
  tela.escala  = Math.min(window.devicePixelRatio || 1, 1.5);
  tela.largura = window.innerWidth;
  tela.altura  = window.innerHeight;
  canvas.width  = Math.round(tela.largura * tela.escala);
  canvas.height = Math.round(tela.altura * tela.escala);
  return mudou;
}

/* Arrastando a janela chegam dezenas de resize: as nuvens só são
   sorteadas de novo quando ela para */
function ajustar() {
  if (!medir()) return;
  clearTimeout(sorteio);
  sorteio = setTimeout(function sortearNuvens() { criarNuvens(tela); }, 250);
}

export function fecharCeu(chovendo) {
  alvo = chovendo ? 1 : 0;
}

/* Cor entre o céu aberto e o fechado */
function corDoCeu(i) {
  const rgb = CEU_ABERTO[i].map(function (v, c) {
    return Math.round(v + (CEU_FECHADO[i][c] - v) * fechado);
  });
  return 'rgb(' + rgb.join(',') + ')';
}

function quadro(agora) {
  /* Anda até o alvo sem pressa, rápido no começo e devagar no fim */
  const passo = anterior === null ? 0 : Math.min(agora - anterior, 100);
  anterior = agora;
  fechado += (alvo - fechado) * (1 - Math.exp(-passo * 3 / MUDAR));

  ctx.setTransform(tela.escala, 0, 0, tela.escala, 0, 0);
  const ceu = ctx.createLinearGradient(0, 0, 0, tela.altura);
  ceu.addColorStop(0, corDoCeu(0));
  ceu.addColorStop(0.45, corDoCeu(1));
  ceu.addColorStop(1, corDoCeu(2));
  ctx.fillStyle = ceu;
  ctx.fillRect(0, 0, tela.largura, tela.altura);

  desenharNuvens(ctx, agora, fechado, tela);
  desenharRelampago(ctx, agora, fechado, tela);
  requestAnimationFrame(quadro);
}

medir();
criarNuvens(tela);
window.addEventListener('resize', ajustar);
requestAnimationFrame(quadro);
