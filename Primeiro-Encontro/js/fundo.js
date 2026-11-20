/* ================================================================
   fundo.js — A noite quente atrás do coração
   Como as luzes de uma rua vistas de longe, fora de foco: o céu é
   pintado numa camada à parte quando a tela muda; cada quadro só a
   copia e desenha por cima as luzes, que respiram e andam devagar.
   As de cima ficam atrás do header: o vidro dele as desfoca, como as
   nuvens nos Corações.
   ================================================================ */

import { largura, altura, escalaTela, topo, aoAjustar } from './palco.js';
import { COR, LUZ, LUZ_CLARA, rgba, pintarLuz } from './cores.js';

/* Luzes do céu: raio em fração do lado maior da tela */
const LUZES_DO_CEU = 22;
const RAIO_DO_CEU = [0.015, 0.06];

/* Luzes atrás do header: uma a cada tantos px de largura, com raio entre
   os dois valores (px). Menores que isso o desfoque do vidro apaga */
const LARGURA_POR_LUZ = 110;
const RAIO_DO_TOPO = [10, 18];

/* Sorteadas uma vez, em fração da tela. Mais luzes embaixo, onde
   ficaria a cidade */
const luzesDoCeu = [];
for (let i = 0; i < LUZES_DO_CEU; i++) {
  luzesDoCeu.push({
    x: Math.random(),
    y: 0.15 + Math.pow(Math.random(), 0.6) * 0.85,
    r: RAIO_DO_CEU[0] + Math.random() * (RAIO_DO_CEU[1] - RAIO_DO_CEU[0]),
    clara: Math.random() < 0.4,
    alpha: 0.04 + Math.random() * 0.1,
    fase: Math.random() * Math.PI * 2,
    ritmo: 0.6 + Math.random() * 0.8
  });
}

/* x em fração da largura, y de 0 a 1 dentro do header. A luz inteira
   fica dentro dele: fora do vidro ela apareceria nítida */
const luzesDoTopo = [];
for (let i = 0; i < 40; i++) {
  luzesDoTopo.push({
    x: Math.random(),
    y: Math.random(),
    r: RAIO_DO_TOPO[0] + Math.random() * (RAIO_DO_TOPO[1] - RAIO_DO_TOPO[0]),
    clara: Math.random() < 0.5,
    fase: Math.random() * Math.PI * 2
  });
}
let quantasNoTopo = 0;

const camada = document.createElement('canvas');
const ctxCamada = camada.getContext('2d');

function pintarCamada() {
  camada.width  = Math.round(largura * escalaTela);
  camada.height = Math.round(altura * escalaTela);
  const c = ctxCamada;
  c.setTransform(escalaTela, 0, 0, escalaTela, 0, 0);

  /* Noite quente, mais escura em cima */
  const noite = c.createLinearGradient(0, 0, 0, altura);
  noite.addColorStop(0, '#07040a');
  noite.addColorStop(0.6, '#140a0a');
  noite.addColorStop(1, '#1f0f08');
  c.fillStyle = noite;
  c.fillRect(0, 0, largura, altura);

  /* O brilho da cidade, subindo do pé da tela */
  const maior = Math.max(largura, altura);
  const cidade = c.createRadialGradient(largura / 2, altura * 1.1, 0, largura / 2, altura * 1.1, maior * 0.8);
  cidade.addColorStop(0, rgba(COR, 0.16));
  cidade.addColorStop(1, rgba(COR, 0));
  c.fillStyle = cidade;
  c.fillRect(0, 0, largura, altura);

  quantasNoTopo = Math.min(luzesDoTopo.length, Math.ceil(largura / LARGURA_POR_LUZ));
}

export function desenharFundo(ctx, agora) {
  ctx.drawImage(camada, 0, 0, largura, altura);
  const segundos = agora / 1000;
  const maior = Math.max(largura, altura);

  /* Respiram e andam um pouco para lá e para cá, cada uma no seu ritmo */
  luzesDoCeu.forEach(function (l) {
    const onda = segundos * 0.25 * l.ritmo + l.fase;
    const x = (l.x + Math.sin(onda) * 0.015) * largura;
    const y = (l.y + Math.cos(onda * 0.8) * 0.01) * altura;
    const alpha = l.alpha * (0.7 + 0.3 * Math.sin(onda * 2.3));
    pintarLuz(ctx, l.clara ? LUZ_CLARA : LUZ, x, y, l.r * maior, alpha);
  });

  for (let i = 0; i < quantasNoTopo; i++) {
    const l = luzesDoTopo[i];
    const y = l.r + l.y * Math.max(topo - l.r * 2, 0);
    const alpha = 0.35 + 0.2 * Math.sin(segundos * 0.8 + l.fase);
    pintarLuz(ctx, l.clara ? LUZ_CLARA : LUZ, l.x * largura, y, l.r, alpha);
  }
}

aoAjustar(pintarCamada);
