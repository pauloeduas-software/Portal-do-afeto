/* ================================================================
   petalas.js — Pétalas caindo atrás do pedido
   Uma noite quente com um brilho atrás da pergunta, e pétalas de rosa
   na cor da página caindo devagar, balançando e virando no ar (de
   costas ficam mais escuras). As de perto são maiores, mais rápidas e
   mais fortes; as de longe, pequenas e apagadas. As que passam atrás
   do header ficam desfocadas pelo vidro dele.
   O fundo é pintado numa camada à parte quando a tela muda; cada
   quadro só a copia e desenha as pétalas por cima.
   ================================================================ */

import { rgbDaVariavel, rgba } from '../../comum/cores.js';

const canvas = document.getElementById('fundo');
const ctx = canvas.getContext('2d');

const COR = rgbDaVariavel('--page-accent');

/* Uma pétala a cada tantos px², com limite */
const AREA_POR_PETALA = 9000;
const MAXIMO_DE_PETALAS = 110;
/* Tamanho da pétala (px), da mais longe à mais perto. As de perto
   passam de 10px: menores, o vidro do header as apaga */
const TAMANHO = [7, 22];
/* Quanto tempo leva para atravessar a tela (s), da mais longe à mais perto */
const TEMPO_DA_QUEDA = [30, 13];

/* A cor da página clareada (para o branco) ou escurecida (para o preto) */
function misturar(quanto) {
  const alvo = quanto > 0 ? 255 : 0;
  const q = Math.abs(quanto);
  return COR.map(function (c) { return Math.round(c + (alvo - c) * q); });
}

/* Cores da pétala: base funda, ponta clara, borda brilhando e o verso */
const BASE  = misturar(-0.35);
const PONTA = misturar(0.45);
const BORDA = misturar(0.75);
const VERSO = misturar(-0.55);

/* Sorteadas uma vez, em fração da tela. Ordenadas da mais longe à
   mais perto, para as de perto passarem por cima */
const petalas = [];
for (let i = 0; i < MAXIMO_DE_PETALAS; i++) {
  const perto = Math.pow(Math.random(), 1.5);
  petalas.push({
    perto: perto,
    x: Math.random(),
    y: Math.random(),
    tamanho: TAMANHO[0] + perto * (TAMANHO[1] - TAMANHO[0]),
    queda: 1 / (TEMPO_DA_QUEDA[0] + perto * (TEMPO_DA_QUEDA[1] - TEMPO_DA_QUEDA[0])),
    balanco: 0.015 + Math.random() * 0.03,
    giro: (Math.random() - 0.5) * 1.2,
    virar: 0.5 + Math.random() * 0.7,
    fase: Math.random() * Math.PI * 2,
    alpha: 0.3 + perto * 0.6
  });
}

/* Os degradês da frente e do verso só dependem do tamanho da pétala:
   cada pétala já nasce com os dela */
function degrade(t, paradas) {
  const cor = ctx.createLinearGradient(0, t, 0, -t);
  paradas.forEach(function (parada) { cor.addColorStop(parada[0], rgba(parada[1], 1)); });
  return cor;
}
petalas.forEach(function (p) {
  p.frente = degrade(p.tamanho, [[0, BASE], [0.6, COR], [1, PONTA]]);
  p.verso  = degrade(p.tamanho, [[0, VERSO], [1, BASE]]);
});
const COR_DA_BORDA = rgba(BORDA, 1);

let largura = 0;
let altura = 0;
let escalaTela = 1;
let quantas = 0;
let visiveis = [];

const camada = document.createElement('canvas');
const ctxCamada = camada.getContext('2d');

function pintarCamada() {
  camada.width  = canvas.width;
  camada.height = canvas.height;
  const c = ctxCamada;
  const maior = Math.max(largura, altura);
  c.setTransform(escalaTela, 0, 0, escalaTela, 0, 0);

  /* Noite quente, mais escura em cima */
  const noite = c.createLinearGradient(0, 0, 0, altura);
  noite.addColorStop(0, '#0c0614');
  noite.addColorStop(1, '#1a0b22');
  c.fillStyle = noite;
  c.fillRect(0, 0, largura, altura);

  /* O brilho atrás da pergunta */
  const brilho = c.createRadialGradient(largura / 2, altura * 0.5, 0, largura / 2, altura * 0.5, maior * 0.5);
  brilho.addColorStop(0, rgba(COR, 0.22));
  brilho.addColorStop(1, rgba(COR, 0));
  c.fillStyle = brilho;
  c.fillRect(0, 0, largura, altura);
}

/* Acompanha o tamanho da tela; nítido em telas de alta densidade */
function ajustar() {
  escalaTela = Math.min(window.devicePixelRatio || 1, 1.5);
  largura = window.innerWidth;
  altura  = window.innerHeight;
  canvas.width  = Math.round(largura * escalaTela);
  canvas.height = Math.round(altura * escalaTela);
  quantas = Math.min(Math.max(Math.round(largura * altura / AREA_POR_PETALA), 35), petalas.length);
  visiveis = petalas.slice(0, quantas).sort(function (a, b) { return a.perto - b.perto; });
  pintarCamada();
}

/* Contorno da pétala de rosa: base fina embaixo, topo largo com um
   recorte no meio */
function contorno(t) {
  ctx.beginPath();
  ctx.moveTo(0, t);
  ctx.bezierCurveTo(t * 0.95, t * 0.45, t * 1.05, -t * 0.55, t * 0.4, -t * 0.95);
  ctx.quadraticCurveTo(0, -t * 0.7, -t * 0.4, -t * 0.95);
  ctx.bezierCurveTo(-t * 1.05, -t * 0.55, -t * 0.95, t * 0.45, 0, t);
}

/* virada: de 1 (de frente) a -1 (de costas), passando por 0 (de lado) */
function desenharPetala(p, x, y, angulo, virada) {
  const t = p.tamanho;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angulo);
  /* De lado ela fica fininha, mas nunca some */
  ctx.scale(1, Math.max(Math.abs(virada), 0.12));
  ctx.globalAlpha = p.alpha;

  contorno(t);
  if (virada >= 0) {
    ctx.fillStyle = p.frente;
    ctx.fill();

    /* Borda acesa e um veio do meio, bem de leve */
    ctx.globalAlpha = p.alpha * 0.5;
    ctx.strokeStyle = COR_DA_BORDA;
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.globalAlpha = p.alpha * 0.25;
    ctx.beginPath();
    ctx.moveTo(0, t * 0.85);
    ctx.quadraticCurveTo(t * 0.08, 0, 0, -t * 0.5);
    ctx.stroke();
  } else {
    ctx.fillStyle = p.verso;
    ctx.fill();
  }
  ctx.restore();
}

let antes = 0;

function desenhar(agora) {
  /* Volta de outra aba: não deixa as pétalas darem um salto */
  const passo = Math.min((agora - antes) / 1000, 0.1);
  antes = agora;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(camada, 0, 0);
  ctx.setTransform(escalaTela, 0, 0, escalaTela, 0, 0);

  const segundos = agora / 1000;
  visiveis.forEach(function (p) {
    p.y += p.queda * passo;
    /* Saiu por baixo: volta por cima, num lugar novo */
    if (p.y > 1.05) {
      p.y = -0.05;
      p.x = Math.random();
    }
    const x = (p.x + Math.sin(segundos * 0.5 + p.fase) * p.balanco) * largura;
    const y = p.y * altura;
    /* Balança como folha: o giro vai e volta junto com o balanço */
    const angulo = p.fase + Math.sin(segundos * 0.5 + p.fase) * 0.6 + segundos * p.giro * 0.3;
    const virada = Math.cos(segundos * p.virar + p.fase);
    desenharPetala(p, x, y, angulo, virada);
  });

  requestAnimationFrame(desenhar);
}

ajustar();
window.addEventListener('resize', ajustar);
requestAnimationFrame(function (agora) {
  antes = agora;
  desenhar(agora);
});
