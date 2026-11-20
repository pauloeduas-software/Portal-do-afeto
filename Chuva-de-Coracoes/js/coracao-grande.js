/* ================================================================
   coracao-grande.js — Juntar todos os corações num coração grande,
   fazê-lo pulsar e depois explodi-lo
   Os corações são os mesmos objetos da chuva: aqui só mudam de lugar.
   ================================================================ */

import { pontosDoCoracao } from './formato-coracao.js';
import { desenharCoracao, pulsar } from './palco.js';

const TEMPO_VOO      = 1200;   // cada coração até o lugar dele
const ATRASO_MAXIMO  = 300;    // saídas um pouco desencontradas
const TEMPO_EXPLOSAO = 1200;

let grande = null;

function aceleraEFreia(p) {
  return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
}

function freia(p) {
  return 1 - Math.pow(1 - p, 3);
}

function misturar(a, b, p) {
  return a + (b - a) * p;
}

/* Centro e escala do coração grande, entre a nav e o aviso de explodir:
   com o celular deitado, a ponta dele cobriria o aviso */
function medirCoracaoGrande() {
  const largura = window.innerWidth;
  const topo    = document.querySelector('.top-nav').getBoundingClientRect().bottom;
  const base    = document.getElementById('aviso-explodir').getBoundingClientRect().top;
  const altura  = base - topo;
  return {
    cx: largura / 2,
    cy: topo + altura / 2,
    escalaPx: Math.min(largura * 0.8 / 32, altura * 0.75 / 29)
  };
}

/* Tamanho de cada coraçãozinho (px) para o grande ficar preenchido */
function ladoDeCadaCoracao(quantidade, escalaPx, unidade) {
  const area = 32 * 29 * 0.6 * escalaPx * escalaPx;
  const lado = Math.sqrt(area * 3 / Math.max(quantidade, 1));
  return Math.min(Math.max(lado, 0.6 * unidade), 2.5 * unidade);
}

/* Todos os corações da pilha partem de onde estão para o
   formato de coração. `unidade` é o valor em px de --coracao-unidade */
export function juntarCoracoes(coracoes, unidade, agora) {
  const { cx, cy, escalaPx } = medirCoracaoGrande();
  const pontos = pontosDoCoracao(coracoes.length, cx, cy, escalaPx);
  const lado   = ladoDeCadaCoracao(coracoes.length, escalaPx, unidade);

  coracoes.forEach(function (c, i) {
    c.de   = { x: c.x ?? c.x0, y: c.y ?? c.y0, giro: c.giro, tamanho: c.tamanho, alpha: c.alpha };
    c.para = { x: pontos[i].x, y: pontos[i].y, tamanho: lado * (0.8 + Math.random() * 0.4) };
    c.atraso = Math.random() * ATRASO_MAXIMO;
  });

  grande = { coracoes: coracoes, cx: cx, cy: cy, inicio: agora };
}

/* Desenha o voo. Devolve true quando todos chegaram */
export function desenharJuntando(ctx, agora) {
  grande.coracoes.forEach(function (c) {
    const p = aceleraEFreia(Math.min(Math.max((agora - grande.inicio - c.atraso) / TEMPO_VOO, 0), 1));
    c.x       = misturar(c.de.x, c.para.x, p);
    c.y       = misturar(c.de.y, c.para.y, p);
    c.tamanho = misturar(c.de.tamanho, c.para.tamanho, p);
    c.giro    = misturar(c.de.giro, 0, p);
    c.alpha   = misturar(c.de.alpha, 1, p);
    desenharCoracao(ctx, c);
  });
  return agora - grande.inicio >= TEMPO_VOO + ATRASO_MAXIMO;
}

/* Formado: o último quadro do voo fica parado no canvas e só pulsa */
export function fixarCoracaoGrande() {
  pulsar(grande.cx, grande.cy);
}

/* Cada coração voa para longe do centro, na direção em que estava.
   `zoom` é o tamanho em que o pulso estava, para não dar tranco */
export function explodirCoracaoGrande(agora, zoom) {
  const alcance = Math.max(window.innerWidth, window.innerHeight);

  grande.coracoes.forEach(function (c) {
    const x = grande.cx + (c.x - grande.cx) * zoom;
    const y = grande.cy + (c.y - grande.cy) * zoom;
    const angulo    = Math.atan2(y - grande.cy, x - grande.cx) + (Math.random() - 0.5) * 0.6;
    const distancia = alcance * (0.5 + Math.random() * 0.6);
    c.de   = { x: x, y: y, tamanho: c.tamanho * zoom };
    c.para = { x: x + Math.cos(angulo) * distancia, y: y + Math.sin(angulo) * distancia, giro: Math.random() * 180 - 90 };
  });
  grande.inicio = agora;
}

/* Desenha a explosão. Devolve true quando todos sumiram */
export function desenharExplodindo(ctx, agora) {
  const t = Math.min((agora - grande.inicio) / TEMPO_EXPLOSAO, 1);
  const p = freia(t);
  grande.coracoes.forEach(function (c) {
    c.x       = misturar(c.de.x, c.para.x, p);
    c.y       = misturar(c.de.y, c.para.y, p);
    c.tamanho = c.de.tamanho * misturar(1, 0.5, p);
    c.giro    = c.para.giro * p;
    c.alpha   = 1 - t * t;
    desenharCoracao(ctx, c);
  });
  return t >= 1;
}

export function removerCoracaoGrande() {
  grande = null;
}
