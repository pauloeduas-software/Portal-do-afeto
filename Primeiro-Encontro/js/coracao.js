/* ================================================================
   coracao.js — O coração em que o caminho se transforma
   Usa a curva clássica do coração, em unidades da fórmula: x de -16
   a 16, y de -12 (topo dos lobos) a 17 (ponta). Medido como uma volta
   só, que começa e termina no vão de cima: desce pela direita até a
   ponta e sobe pela esquerda.
   ================================================================ */

import { largura, altura, topo } from './palco.js';

/* Centro vertical da curva (meio entre -12 e 17) */
const CENTRO_Y = 2.5;
const LARGURA_DA_CURVA = 32;
const ALTURA_DA_CURVA = 29;

/* Quanto do espaço livre o coração ocupa, e o maior tamanho dele (px) */
const OCUPA = 0.86;
const LARGURA_MAXIMA = 600;
/* Folga entre o coração e o header ou o pé da tela (px) */
const FOLGA = 16;

/* Pontos da metade direita, a distâncias iguais pela curva */
const PONTOS = 240;

function pontoDaCurva(t) {
  return {
    x: 16 * Math.pow(Math.sin(t), 3),
    y: -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))
  };
}

/* A fórmula anda devagar no vão e na ponta: andando por ela, a luz
   pararia ali. Medindo o comprimento, ela anda num ritmo só */
const fina = [];
const comprimentos = [0];
for (let i = 0; i <= 2000; i++) {
  /* t = π é a ponta e t = 0 é o vão: a metade direita, de baixo para cima */
  fina.push(pontoDaCurva(Math.PI * (1 - i / 2000)));
  if (i) comprimentos.push(comprimentos[i - 1] + Math.hypot(fina[i].x - fina[i - 1].x, fina[i].y - fina[i - 1].y));
}
const total = comprimentos[comprimentos.length - 1];

const metade = [];
for (let i = 0, j = 0; i < PONTOS; i++) {
  const s = total * i / (PONTOS - 1);
  while (j < comprimentos.length - 2 && comprimentos[j + 1] < s) j++;
  const p = (s - comprimentos[j]) / (comprimentos[j + 1] - comprimentos[j]);
  metade.push({
    x: fina[j].x + (fina[j + 1].x - fina[j].x) * p,
    y: fina[j].y + (fina[j + 1].y - fina[j].y) * p
  });
}

/* Ponto a `fracao` da volta (0 e 1 = vão, 0.5 = ponta), já na tela */
export function pontoNoCoracao(fracao, lugar) {
  const v = ((fracao % 1) + 1) % 1;
  /* `metade` vai da ponta ao vão: a direita a percorre de trás para frente */
  const lado = v < 0.5 ? 1 : -1;
  const f = v < 0.5 ? 1 - v * 2 : v * 2 - 1;
  const i = f * (PONTOS - 1);
  const a = metade[Math.floor(i)];
  const b = metade[Math.min(Math.floor(i) + 1, PONTOS - 1)];
  const p = i - Math.floor(i);
  return naTela({ x: (a.x + (b.x - a.x) * p) * lado, y: a.y + (b.y - a.y) * p }, lugar);
}

/* Um ponto da fórmula na tela */
function naTela(p, lugar) {
  return {
    x: lugar.cx + p.x * lugar.escala,
    y: lugar.cy + (p.y - CENTRO_Y) * lugar.escala
  };
}

/* Traça o coração inteiro, fechado: sobe pela direita e desce pela esquerda */
export function tracarCoracao(ctx, lugar) {
  for (let i = 0; i < PONTOS; i++) {
    const p = naTela(metade[i], lugar);
    if (i) ctx.lineTo(p.x, p.y);
    else ctx.moveTo(p.x, p.y);
  }
  for (let i = PONTOS - 1; i >= 0; i--) {
    const p = naTela({ x: -metade[i].x, y: metade[i].y }, lugar);
    ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();
}

/* Onde o coração fica: no meio do espaço abaixo do header, do tamanho que
   couber. Calculado a cada quadro, então acompanha o celular girando.
   `pulso` aumenta tudo a partir do centro */
export function lugarDoCoracao(pulso) {
  const livreTopo = topo + FOLGA;
  const livreAltura = Math.max(altura - livreTopo - FOLGA, 1);
  const escala = Math.min(
    largura * OCUPA / LARGURA_DA_CURVA,
    livreAltura * OCUPA / ALTURA_DA_CURVA,
    LARGURA_MAXIMA / LARGURA_DA_CURVA
  );
  return { cx: largura / 2, cy: livreTopo + livreAltura / 2, escala: escala * pulso };
}
