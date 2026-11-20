/* ================================================================
   fundo.js — O céu estrelado atrás da constelação
   Noite, nebulosa e estrelinhas paradas são pintadas numa camada à
   parte quando a tela muda de tamanho; cada quadro só a copia e
   desenha por cima as poucas estrelinhas que piscam, e as luzes grandes
   atrás do header: desfocadas pelo vidro dele, viram pontinhos de luz,
   como as nuvens nos Corações.
   ================================================================ */

import { ctx, largura, altura, escalaTela, aoAjustar } from './palco.js';
import { COR, COR_NEBULOSA, rgba } from './cores.js';

/* Uma estrelinha a cada tantos px², com limite */
const AREA_POR_ESTRELA = 2200;
const ESTRELAS_DO_FUNDO = 700;
/* As primeiras tantas piscam; o resto fica parado */
const PISCANTES = 70;

/* Luzes atrás do header: uma a cada tantos px de largura, com raio entre
   os dois valores (px). Menores que isso o desfoque do vidro apaga */
const LARGURA_POR_LUZ = 110;
const RAIO_DA_LUZ = [10, 18];

/* Nuvens de cor numa faixa atravessando o céu na diagonal
   (posição em fração da tela, raio em fração do lado maior) */
const NEBULOSA = [
  { x: 0.1,  y: 0.85, r: 0.35, rgb: COR,          alpha: 0.12 },
  { x: 0.38, y: 0.6,  r: 0.4,  rgb: COR_NEBULOSA, alpha: 0.10 },
  { x: 0.65, y: 0.4,  r: 0.38, rgb: COR,          alpha: 0.11 },
  { x: 0.92, y: 0.15, r: 0.35, rgb: COR_NEBULOSA, alpha: 0.12 }
];

/* Sorteadas uma vez, em fração da tela. Quase todas fraquinhas,
   poucas maiores */
const estrelinhas = [];
for (let i = 0; i < ESTRELAS_DO_FUNDO; i++) {
  const piscante = i < PISCANTES;
  estrelinhas.push({
    x: Math.random(),
    y: Math.random(),
    tamanho: piscante ? 0.8 + Math.random() * 0.9 : 0.3 + Math.pow(Math.random(), 4) * 1.1,
    alpha: piscante ? 0.5 + Math.random() * 0.4 : 0.15 + Math.random() * 0.5,
    piscar: Math.random() * Math.PI * 2
  });
}

/* Sorteadas uma vez: x em fração da largura, y de 0 a 1 dentro do header.
   A luz inteira fica dentro dele: fora do vidro ela apareceria nítida */
const luzesDoTopo = [];
for (let i = 0; i < 40; i++) {
  luzesDoTopo.push({
    x: Math.random(),
    y: Math.random(),
    r: RAIO_DA_LUZ[0] + Math.random() * (RAIO_DA_LUZ[1] - RAIO_DA_LUZ[0]),
    piscar: Math.random() * Math.PI * 2
  });
}
let alturaDoTopo = 0;
let quantasLuzes = 0;

const camada = document.createElement('canvas');
const ctxCamada = camada.getContext('2d');

function pintarCamada() {
  camada.width  = Math.round(largura * escalaTela);
  camada.height = Math.round(altura * escalaTela);
  const c = ctxCamada;
  const maior = Math.max(largura, altura);
  c.setTransform(escalaTela, 0, 0, escalaTela, 0, 0);

  /* Noite funda, um pouco mais clara perto do meio */
  const noite = c.createRadialGradient(largura / 2, altura * 0.45, 0, largura / 2, altura * 0.45, maior * 0.8);
  noite.addColorStop(0, '#0b1426');
  noite.addColorStop(1, '#03050c');
  c.fillStyle = noite;
  c.fillRect(0, 0, largura, altura);

  NEBULOSA.forEach(function (n) {
    const cx = n.x * largura;
    const cy = n.y * altura;
    const nuvem = c.createRadialGradient(cx, cy, 0, cx, cy, n.r * maior);
    nuvem.addColorStop(0, rgba(n.rgb, n.alpha));
    nuvem.addColorStop(1, rgba(n.rgb, 0));
    c.fillStyle = nuvem;
    c.fillRect(0, 0, largura, altura);
  });

  /* Quantas cabem nesta tela */
  const quantas = Math.min(Math.round(largura * altura / AREA_POR_ESTRELA), estrelinhas.length);
  c.fillStyle = '#fff';
  for (let i = PISCANTES; i < quantas; i++) {
    const s = estrelinhas[i];
    c.globalAlpha = s.alpha;
    c.beginPath();
    c.arc(s.x * largura, s.y * altura, s.tamanho, 0, Math.PI * 2);
    c.fill();
  }
  c.globalAlpha = 1;
}

aoAjustar(pintarCamada);
aoAjustar(function () {
  alturaDoTopo = document.querySelector('.top-nav').getBoundingClientRect().height;
  quantasLuzes = Math.min(Math.max(Math.round(largura / LARGURA_POR_LUZ), 6), luzesDoTopo.length);
});

export function desenharFundo(agora) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(camada, 0, 0);
  ctx.setTransform(escalaTela, 0, 0, escalaTela, 0, 0);

  ctx.fillStyle = '#fff';
  for (let i = 0; i < PISCANTES; i++) {
    const s = estrelinhas[i];
    ctx.globalAlpha = s.alpha * (0.45 + 0.55 * Math.abs(Math.sin(agora / 1400 + s.piscar)));
    ctx.beginPath();
    ctx.arc(s.x * largura, s.y * altura, s.tamanho, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  for (let i = 0; i < quantasLuzes; i++) {
    const l = luzesDoTopo[i];
    const x = l.x * largura;
    const y = l.r + l.y * Math.max(alturaDoTopo - l.r * 2, 0);
    const forca = 0.7 + 0.3 * Math.sin(agora / 1600 + l.piscar);
    const luz = ctx.createRadialGradient(x, y, 0, x, y, l.r);
    luz.addColorStop(0, 'rgba(255,255,255,' + 0.95 * forca + ')');
    luz.addColorStop(0.42, 'rgba(255,255,255,' + 0.6 * forca + ')');
    luz.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = luz;
    ctx.fillRect(x - l.r, y - l.r, l.r * 2, l.r * 2);
  }
}
