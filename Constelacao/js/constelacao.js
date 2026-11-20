/* ================================================================
   constelacao.js — As estrelas que ela acende e as linhas entre elas
   Cada estrela guarda onde foi tocada em fração da tela, para o
   desenho não desmontar se o celular girar. No final, o desenho
   inteiro desliza e cresce até ocupar o espaço livre.
   ================================================================ */

import { ctx, largura, altura, escalaTela } from './palco.js';
import { cor } from './cores.js';
import { suave, desacelera, estala } from './curvas.js';

/* Tempos das animações (ms) */
const NASCER  = 700;   // estrela crescendo até o tamanho certo
const TRACAR  = 450;   // linha correndo da estrela anterior até a nova
const ONDA    = 900;   // anel que se espalha quando a estrela nasce ou é tocada
const AFASTAR = 1800;  // constelação indo para o meio no final

/* Miolo da estrela (px) */
const RAIO = 2.6;
/* Desenho pequenininho cresce no final, mas não sem limite */
const ZOOM_MAXIMO = 3;
/* Distância do toque que ainda conta como tocar na estrela (px) */
const ALCANCE_TOQUE = 32;

/* Cada estrela: { fx, fy (fração da tela), elogio, nasceu, tocada, piscar } */
const estrelas = [];
let final = null;        // { inicio, area } quando a constelação está pronta
let selecionada = null;  // estrela tocada no final, que fica em destaque

export function acenderEstrela(x, y, elogio) {
  estrelas.push({
    fx: x / largura,
    fy: y / altura,
    elogio: elogio,
    nasceu: performance.now(),
    tocada: -Infinity,
    piscar: Math.random() * Math.PI * 2
  });
}

/* area() devolve { x, y, w, h } em px, onde a constelação deve caber; é
   lida a cada quadro, então acompanha a tela girando */
export function mostrarConstelacao(area) {
  final = { inicio: performance.now(), area: area };
}

export function apagarConstelacao() {
  estrelas.length = 0;
  final = null;
  selecionada = null;
}

/* Estrela mais perto do toque, se estiver ao alcance; ela fica em destaque */
export function tocarEstrela(x, y) {
  const agora = performance.now();
  let maisPerto = null;
  let menor = ALCANCE_TOQUE;
  posicoes(agora).forEach(function (p, i) {
    const d = Math.hypot(p.x - x, p.y - y);
    if (d < menor) {
      menor = d;
      maisPerto = estrelas[i];
    }
  });
  if (maisPerto) {
    selecionada = maisPerto;
    maisPerto.tocada = agora;
  }
  return maisPerto;
}

/* Quando o desenho termina de chegar no meio, ou null antes do final */
export function chegadaNoMeio() {
  return final ? final.inicio + AFASTAR : null;
}

/* Quanto o final já andou, de 0 a 1 */
function chegada(agora) {
  return final ? suave(Math.min((agora - final.inicio) / AFASTAR, 1)) : 0;
}

/* Mesma forma do desenho, centralizada na área e do maior tamanho que cabe */
function encaixe(base, a) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  base.forEach(function (p) {
    x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x);
    y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y);
  });
  const k = Math.min(a.w / Math.max(x1 - x0, 1), a.h / Math.max(y1 - y0, 1), ZOOM_MAXIMO);
  return {
    k: k,
    dx: a.x + a.w / 2 - (x0 + x1) / 2 * k,
    dy: a.y + a.h / 2 - (y0 + y1) / 2 * k
  };
}

/* Onde cada estrela está agora: onde foi tocada, ou a caminho do meio */
export function posicoes(agora) {
  const base = estrelas.map(function (e) { return { x: e.fx * largura, y: e.fy * altura }; });
  if (!final || !base.length) return base;

  const p = chegada(agora);
  const enc = encaixe(base, final.area());
  return base.map(function (b) {
    return {
      x: b.x + (b.x * enc.k + enc.dx - b.x) * p,
      y: b.y + (b.y * enc.k + enc.dy - b.y) * p
    };
  });
}

export function desenharLinhas(lugares, agora) {
  /* No final as linhas ganham força, junto com a chegada no meio */
  const forca = chegada(agora);
  ctx.lineWidth   = 1.2 + forca * 0.6;
  ctx.lineCap     = 'round';
  ctx.strokeStyle = cor(0.35 + forca * 0.35);
  ctx.shadowColor = cor(0.8);
  ctx.shadowBlur  = (6 + forca * 6) * escalaTela;  // a sombra não segue a escala do ctx

  ctx.beginPath();
  for (let i = 1; i < lugares.length; i++) {
    const t = desacelera(Math.min((agora - estrelas[i].nasceu) / TRACAR, 1));
    const a = lugares[i - 1];
    const b = lugares[i];
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;
}

/* Anel que se espalha a partir da estrela */
function desenharOnda(p, r, desde) {
  const t = desde / ONDA;
  if (t < 0 || t >= 1) return;
  ctx.strokeStyle = cor(0.6 * (1 - t));
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r + desacelera(t) * 28, 0, Math.PI * 2);
  ctx.stroke();
}

/* passagem: de 0 a 1, o quanto a luz que acabou de passar ainda a acende */
function desenharEstrela(e, p, agora, passagem) {
  const idade  = agora - e.nasceu;
  const brilho = Math.min(0.75 + 0.25 * Math.sin(agora / 600 + e.piscar) + passagem * 0.6, 1.3);
  const realce = (e === selecionada ? 1.6 + 0.15 * Math.sin(agora / 250) : 1) + passagem * 0.8;
  const r = RAIO * estala(Math.min(idade / NASCER, 1)) * realce;
  if (r <= 0) return;

  /* Halo colorido */
  const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 7);
  halo.addColorStop(0, cor(Math.min(0.55 * brilho, 1)));
  halo.addColorStop(1, cor(0));
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r * 7, 0, Math.PI * 2);
  ctx.fill();

  /* Cruz de brilho, que pisca junto */
  const braco = r * (3 + 2 * brilho);
  ctx.strokeStyle = 'rgba(255,255,255,' + Math.min(0.6 * brilho, 1) + ')';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(p.x - braco, p.y); ctx.lineTo(p.x + braco, p.y);
  ctx.moveTo(p.x, p.y - braco); ctx.lineTo(p.x, p.y + braco);
  ctx.stroke();

  /* Miolo */
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
  ctx.fill();

  desenharOnda(p, r, idade);
  desenharOnda(p, r, agora - e.tocada);
}

/* passagem(i) diz o quanto a luz ainda acende a estrela i */
export function desenharEstrelas(lugares, agora, passagem) {
  lugares.forEach(function (p, i) {
    desenharEstrela(estrelas[i], p, agora, passagem(i));
  });
}
