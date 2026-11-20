/* ================================================================
   brilho.js — O coração aceso
   Quando o caminho termina de virar coração: um clarão no vão de cima,
   coraçõezinhos saindo dele, e o coração acende por dentro e começa
   a pulsar.
   ================================================================ */

import { COR, COR_CLARA, LUZ_CLARA, rgba, pintarLuz } from './cores.js';
import { pontoNoCoracao, tracarCoracao, lugarDoCoracao } from './coracao.js';
import { escalaTela } from './palco.js';
import { desenharSprite, CORACAO_PREENCHIDO } from '../../comum/sprites-coracao.js';

/* Quanto o coração leva para acender, e o clarão para sumir (ms) */
const ACENDER = 1400;
const CLARAO = 1000;

/* O pulso do coração grande dos Corações: vai e volta, cada ida em
   tantos ms, até tanto maior (palcoPulsa em chuva-de-coracoes.css) */
const PULSO = 900;
const FORCA_DO_PULSO = 0.06;

/* Coraçõezinhos do encontro: quantos, quanto vivem (ms) e o tamanho (px) */
const QUANTOS = 26;
const VIDA = [1200, 2000];
const TAMANHO = [12, 22];

const SPRITES = [
  desenharSprite(CORACAO_PREENCHIDO, rgba(COR, 1), 32),
  desenharSprite(CORACAO_PREENCHIDO, rgba(COR_CLARA, 1), 32)
];

/* Quando o coração acendeu; null antes disso */
let acesoEm = null;
let coracoezinhos = [];

/* Começa e termina devagar; sai rápido e chega devagar */
function suave(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function desacelera(t) {
  return 1 - Math.pow(1 - t, 3);
}

/* O coração se fechou: ele acende. Os coraçõezinhos andam em
   unidades da fórmula, então acompanham o coração se a tela mudar */
export function acenderCoracao() {
  acesoEm = performance.now();
  coracoezinhos = [];
  for (let i = 0; i < QUANTOS; i++) {
    /* Mais para cima e para os lados, saindo do vão */
    const angulo = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.6;
    coracoezinhos.push({
      angulo: angulo,
      distancia: 6 + Math.random() * 12,
      vida: VIDA[0] + Math.random() * (VIDA[1] - VIDA[0]),
      tamanho: TAMANHO[0] + Math.random() * (TAMANHO[1] - TAMANHO[0]),
      giro: (Math.random() - 0.5) * 0.8,
      sprite: SPRITES[i % 2]
    });
  }
}

/* De 0 (apagado) a 1 (aceso) */
function aceso(agora) {
  if (acesoEm === null) return 0;
  return suave(Math.min((agora - acesoEm) / ACENDER, 1));
}

/* Quanto o coração aumenta agora: 1 até acender, depois pulsa devagar,
   começando e terminando cada ida sem tranco */
export function pulsoDoCoracao(agora) {
  const forca = aceso(agora);
  if (!forca) return 1;
  const onda = (1 - Math.cos((agora - acesoEm) / PULSO * Math.PI)) / 2;
  return 1 + FORCA_DO_PULSO * onda * forca;
}

/* Por dentro, atrás da linha e das pedrinhas. A sombra desfocada é
   cara: aceso de vez, o recheio vira uma imagem pronta, e cada quadro
   só a copia do tamanho do pulso */
export function desenharRecheio(ctx, agora, lugar) {
  const forca = aceso(agora);
  if (!forca) return;
  if (forca < 1) {
    pintarRecheio(ctx, lugar, forca);
    return;
  }
  const pronto = recheioParado();
  const pulso = pulsoDoCoracao(agora);
  ctx.save();
  ctx.translate(lugar.cx, lugar.cy);
  ctx.scale(pulso, pulso);
  ctx.drawImage(pronto.imagem, -pronto.meiaLargura, -pronto.meiaAltura, pronto.meiaLargura * 2, pronto.meiaAltura * 2);
  ctx.restore();
}

/* Espaço em volta do coração para a sombra desfocada caber (px) */
const MARGEM_DA_SOMBRA = 60;

/* O recheio aceso, sem pulso, e o lugar e a tela para que foi feito */
let recheioPronto = null;

function recheioParado() {
  const lugar = lugarDoCoracao(1);
  const chave = lugar.cx + ',' + lugar.cy + ',' + lugar.escala + ',' + escalaTela;
  if (recheioPronto && recheioPronto.chave === chave) return recheioPronto;
  /* A curva vai de -16 a 16 na largura e de -14.5 a 14.5 na altura */
  const meiaLargura = 16 * lugar.escala + MARGEM_DA_SOMBRA;
  const meiaAltura = 14.5 * lugar.escala + MARGEM_DA_SOMBRA;
  const imagem = recheioPronto ? recheioPronto.imagem : document.createElement('canvas');
  imagem.width = Math.ceil(meiaLargura * 2 * escalaTela);
  imagem.height = Math.ceil(meiaAltura * 2 * escalaTela);
  const c = imagem.getContext('2d');
  c.setTransform(escalaTela, 0, 0, escalaTela,
    (meiaLargura - lugar.cx) * escalaTela, (meiaAltura - lugar.cy) * escalaTela);
  pintarRecheio(c, lugar, 1);
  recheioPronto = { imagem: imagem, meiaLargura: meiaLargura, meiaAltura: meiaAltura, chave: chave };
  return recheioPronto;
}

function pintarRecheio(ctx, lugar, forca) {
  const meio = lugar.cy - 3 * lugar.escala;
  const recheio = ctx.createRadialGradient(lugar.cx, meio, 0, lugar.cx, meio, 20 * lugar.escala);
  recheio.addColorStop(0, rgba(COR_CLARA, 0.55 * forca));
  recheio.addColorStop(0.5, rgba(COR, 0.35 * forca));
  recheio.addColorStop(1, rgba(COR, 0.12 * forca));
  ctx.save();
  ctx.shadowColor = rgba(COR, 0.8 * forca);
  ctx.shadowBlur = 40;
  ctx.fillStyle = recheio;
  ctx.beginPath();
  tracarCoracao(ctx, lugar);
  ctx.fill();
  ctx.restore();
}

/* Por cima de tudo: o clarão e os coraçõezinhos */
export function desenharEncontro(ctx, agora, lugar) {
  if (acesoEm === null) return;
  const passou = agora - acesoEm;
  const vao = pontoNoCoracao(0, lugar);

  ctx.globalCompositeOperation = 'lighter';
  if (passou < CLARAO) {
    const t = passou / CLARAO;
    pintarLuz(ctx, LUZ_CLARA, vao.x, vao.y, 30 + desacelera(t) * 8 * lugar.escala, 1 - t);
  }
  ctx.globalCompositeOperation = 'source-over';

  coracoezinhos.forEach(function (c) {
    const t = passou / c.vida;
    if (t >= 1) return;
    const longe = desacelera(t) * c.distancia * lugar.escala;
    const x = vao.x + Math.cos(c.angulo) * longe;
    const y = vao.y + Math.sin(c.angulo) * longe;
    const k = c.tamanho / c.sprite.fonte * Math.min(t * 6, 1);
    const img = c.sprite.imagem;
    ctx.save();
    ctx.globalAlpha = 1 - t * t;
    ctx.translate(x, y);
    ctx.rotate(c.giro * t);
    ctx.scale(k, k);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();
  });
}
