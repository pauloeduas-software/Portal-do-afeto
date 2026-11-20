/* ================================================================
   inicio.js — O redemoinho atrás do título ✧
   A home é a entrada de todas as páginas: atrás do título gira um
   portal em redemoinho. Riscos de luz na cor de cada página nascem
   na borda, giram cada vez mais rápido e são sugados para o centro
   brilhante; nascendo sempre em cinco braços, desenham a espiral.
   Os de fora passam atrás dos portais de vidro e ficam desfocados.
   ================================================================ */

import { rgbDaVariavel, rgba } from './comum/cores.js';

const canvas = document.getElementById('ceu');
const ctx = canvas.getContext('2d');

const COR_DO_MEIO = rgbDaVariavel('--page-accent');
/* Um braço da espiral por página */
const CORES = ['--cor-primeiro-encontro', '--cor-chuva-de-coracoes', '--cor-constelacao',
  '--cor-volta-ao-mundo', '--cor-um-pedido']
  .map(rgbDaVariavel);

const RISCOS = 500;
/* Tamanho do redemoinho: fração do lado maior da tela */
const TAMANHO = 0.75;
/* Giro de cada risco (rad/s): mais rápido perto do centro */
const GIRO = 0.25;
/* Quanto o risco é puxado para dentro (fração do raio por segundo) */
const PUXAO = 0.14;
/* Os braços giram devagar (rad/s) */
const GIRO_DOS_BRACOS = 0.1;
/* Abaixo deste raio o risco foi sugado e renasce na borda */
const RAIO_DO_FIM = 0.05;

function velocidade(r) {
  return GIRO / (r + 0.08);
}

const riscos = [];
let relogio = 0;

/* Renasce na borda, num dos braços, um pouco espalhado */
function nascer(risco) {
  const braco = Math.floor(Math.random() * CORES.length);
  risco.rgb = CORES[braco];
  risco.r = 1 + Math.random() * 0.1;
  risco.angulo = braco / CORES.length * Math.PI * 2 + relogio * GIRO_DOS_BRACOS + (Math.random() - 0.5) * 0.35;
  risco.forca = 0.5 + Math.random() * 0.5;
}

function avancar(risco, passo) {
  risco.angulo += velocidade(risco.r) * passo;
  risco.r -= PUXAO * (risco.r + 0.15) * passo;
  if (risco.r < RAIO_DO_FIM) nascer(risco);
}

for (let i = 0; i < RISCOS; i++) {
  const risco = {};
  nascer(risco);
  riscos.push(risco);
}
/* Começa já girando: simula uns segundos antes de mostrar, para a
   espiral estar formada, com cada risco num ponto diferente do caminho */
for (let t = 0; t < 20; t += 0.05) {
  relogio = t;
  riscos.forEach(function (risco, i) {
    if (t >= i / RISCOS * 15) avancar(risco, 0.05);
  });
}

let largura = 0;
let altura = 0;
let escalaTela = 1;
/* Centro do portal: o meio do título */
let centroX = 0;
let centroY = 0;

/* Acompanha o tamanho da tela; nítido em telas de alta densidade */
function ajustar() {
  escalaTela = Math.min(window.devicePixelRatio || 1, 1.5);
  largura = window.innerWidth;
  altura  = window.innerHeight;
  canvas.width  = Math.round(largura * escalaTela);
  canvas.height = Math.round(altura * escalaTela);
  medirCentro();
}

function medirCentro() {
  const titulo = document.querySelector('.abertura .titulo-brilho').getBoundingClientRect();
  centroX = titulo.left + titulo.width / 2;
  centroY = titulo.top + titulo.height / 2 + window.scrollY;
}

/* Aparece ao nascer e some ao ser sugado */
function brilhoDoRisco(r) {
  const entrada = Math.min((1.1 - r) / 0.25, 1);
  const saida = Math.min((r - RAIO_DO_FIM) / 0.1, 1);
  return Math.max(Math.min(entrada, saida), 0);
}

let antes = 0;

function desenhar(agora) {
  /* Volta de outra aba: não deixa o redemoinho dar um salto */
  const passo = Math.min((agora - antes) / 1000, 0.1);
  antes = agora;
  relogio += passo;

  ctx.setTransform(escalaTela, 0, 0, escalaTela, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#07050d';
  ctx.fillRect(0, 0, largura, altura);

  const raio = Math.max(largura, altura) * TAMANHO;
  const y = centroY - window.scrollY;

  /* Somadas, as cores clareiam onde os riscos se juntam */
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  riscos.forEach(function (risco) {
    avancar(risco, passo);
    /* O rastro é o caminho dos últimos instantes */
    const rastro = Math.min(velocidade(risco.r) * 0.35, 0.7);
    ctx.globalAlpha = 0.45 * risco.forca * brilhoDoRisco(risco.r);
    ctx.strokeStyle = rgba(risco.rgb, 1);
    ctx.lineWidth = 1 + 2.5 * risco.r;
    ctx.beginPath();
    ctx.arc(centroX, y, risco.r * raio, risco.angulo - rastro, risco.angulo);
    ctx.stroke();
  });
  ctx.globalAlpha = 1;

  /* O centro brilhante, que respira */
  const respiro = 0.5 + 0.5 * Math.sin(relogio * 0.8);
  const raioDoMeio = raio * (0.16 + 0.02 * respiro);
  const meio = ctx.createRadialGradient(centroX, y, 0, centroX, y, raioDoMeio);
  meio.addColorStop(0, rgba([255, 255, 255], 0.25 + 0.1 * respiro));
  meio.addColorStop(0.25, rgba(COR_DO_MEIO, 0.3));
  meio.addColorStop(1, rgba(COR_DO_MEIO, 0));
  ctx.fillStyle = meio;
  ctx.fillRect(centroX - raioDoMeio, y - raioDoMeio, raioDoMeio * 2, raioDoMeio * 2);

  requestAnimationFrame(desenhar);
}

ajustar();
window.addEventListener('resize', ajustar);
/* A fonte muda o tamanho do título quando carrega */
document.fonts.ready.then(medirCentro);
/* O centro vale quando o título termina de subir (loadFadeIn) */
document.querySelector('.abertura').addEventListener('animationend', medirCentro);
requestAnimationFrame(function (agora) {
  antes = agora;
  desenhar(agora);
});
