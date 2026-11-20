/* ================================================================
   cadentes.js — De vez em quando, uma estrela cadente risca o céu
   ================================================================ */

import { ctx, largura, altura } from './palco.js';
import { desacelera } from './curvas.js';

/* Intervalo sorteado entre uma e outra, e quanto cada uma dura (ms) */
const INTERVALO_MIN = 3000;
const INTERVALO_MAX = 8000;
const DURACAO = 900;

/* Cada uma: { x, y (início), dx, dy (direção), comprimento, inicio } */
const cadentes = [];
let proxima = performance.now() + INTERVALO_MIN;

/* Nasce no alto e risca para baixo, para a esquerda ou para a direita */
function soltar(agora) {
  const angulo = (25 + Math.random() * 30) * Math.PI / 180;
  const lado = Math.random() < 0.5 ? 1 : -1;
  cadentes.push({
    x: Math.random() * largura,
    y: altura * (0.1 + Math.random() * 0.35),
    dx: Math.cos(angulo) * lado,
    dy: Math.sin(angulo),
    comprimento: Math.min(largura, altura) * 0.3,
    inicio: agora
  });
}

export function desenharCadentes(agora) {
  if (agora >= proxima) {
    soltar(agora);
    proxima = agora + INTERVALO_MIN + Math.random() * (INTERVALO_MAX - INTERVALO_MIN);
  }

  for (let i = cadentes.length - 1; i >= 0; i--) {
    const c = cadentes[i];
    const t = (agora - c.inicio) / DURACAO;
    if (t >= 1) {
      cadentes.splice(i, 1);
      continue;
    }
    /* Corre o dobro do próprio comprimento, com a cauda esticando */
    const andado = desacelera(t) * c.comprimento * 2;
    const cauda = c.comprimento * Math.min(t * 3, 1);
    const hx = c.x + c.dx * andado;
    const hy = c.y + c.dy * andado;
    const tx = hx - c.dx * cauda;
    const ty = hy - c.dy * cauda;

    const rastro = ctx.createLinearGradient(tx, ty, hx, hy);
    rastro.addColorStop(0, 'rgba(255,255,255,0)');
    rastro.addColorStop(1, 'rgba(255,255,255,' + 0.8 * (1 - t) + ')');
    ctx.strokeStyle = rastro;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(hx, hy);
    ctx.stroke();
  }
}
