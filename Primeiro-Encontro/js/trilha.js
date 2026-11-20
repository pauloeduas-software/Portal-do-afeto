/* ================================================================
   trilha.js — O caminho da noite, como num mapa
   Passa pelos lugares do encontro na ordem em que aconteceram: a
   casa dela, o parque, o carro, o Outback e o parque de novo. Segue
   um desenho feito à mão, da esquerda para a direita, descendo,
   subindo e dando voltas: uma curva suave passando por todos os
   pontos dele (Catmull-Rom). O desenho estica para a largura da tela
   e é refeito quando ela muda (sobrevive a girar o celular).
   ================================================================ */

import { largura, altura, topo, aoAjustar } from './palco.js';

/* O caminho como foi desenhado, em px do desenho: da esquerda para a
   direita, com dois laços, descidas e subidas */
const DESENHO = [
  [88, 412], [150, 418], [200, 437], [260, 490], [320, 545], [360, 592],
  [420, 614], [495, 590], [530, 540], [548, 450], [520, 405], [440, 355],
  [370, 315], [338, 265], [360, 212], [405, 205], [470, 228], [530, 250],
  [590, 263], [660, 262], [740, 250], [808, 238], [832, 212], [848, 170],
  [835, 138], [820, 160], [822, 195], [848, 212], [910, 216], [990, 203],
  [1050, 203], [1120, 228], [1170, 270], [1188, 330], [1190, 400], [1180, 470],
  [1178, 540], [1200, 600], [1250, 665], [1273, 712], [1262, 765], [1225, 797],
  [1160, 805], [1080, 795], [990, 770], [920, 735], [885, 690], [876, 610],
  [895, 535], [940, 485], [1010, 450], [1090, 434], [1170, 436], [1240, 443],
  [1310, 451], [1400, 447], [1480, 433], [1550, 410], [1600, 368], [1632, 322],
  [1640, 286], [1610, 271], [1555, 282], [1522, 310], [1528, 350], [1580, 372],
  [1660, 390], [1730, 407]
];

/* Onde a luz para (posição no DESENHO, que pode cair entre dois
   pontos) e o nome do lugar, se tiver um. Uma parada por momento da
   noite, à mesma distância uma da outra pelo caminho; só a sexta sobe
   um pouco, para não cair no cruzamento da volta grande */
const PARADAS_DO_DESENHO = [
  { i: 5.4,  nome: 'casa dela' },
  { i: 10.4 },
  { i: 15.8, nome: 'parque' },
  { i: 21.1 },
  { i: 29.2 },
  { i: 33.2 },
  { i: 40.2, nome: 'carro' },
  { i: 45.1 },
  { i: 50.1, nome: 'Outback' },
  { i: 54.7, nome: 'lago' },
  { i: 60.8 },
  { i: 67 }
];

/* O retângulo do desenho, para encaixá-lo na tela */
const XS = DESENHO.map(function (p) { return p[0]; });
const YS = DESENHO.map(function (p) { return p[1]; });
const DESENHO_X = Math.min.apply(null, XS);
const DESENHO_Y = Math.min.apply(null, YS);
const DESENHO_LARGURA = Math.max.apply(null, XS) - DESENHO_X;
const DESENHO_ALTURA = Math.max.apply(null, YS) - DESENHO_Y;
/* Na tela estreita o desenho ficaria baixinho: pode esticar na altura
   até tanto, sem deformar demais os laços */
const ESTICA = 2.2;

/* Margem do mapa nas beiradas da tela e folga abaixo do header (px) */
const MARGEM = 0.06;
const FOLGA = 16;
/* Distância entre as pedrinhas (px) e o mínimo delas: no celular em
   pé o caminho é curto, e elas ficam mais juntas para formar o desenho */
const ENTRE_PEDRINHAS = 22;
const MINIMO_DE_PEDRINHAS = 130;
/* Mais perto que isso de uma parada, a pedrinha encostaria no marco (px) */
const ENCOSTA = 10;

const TRECHOS = DESENHO.length - 1;

/* Onde ficam as paradas e os nomes, em `u` do caminho (0 = começo,
   1 = fim). Não muda com a tela: a luz parada continua no lugar */
export const PARADAS = [];
export const LUGARES = [];
PARADAS_DO_DESENHO.forEach(function (p) {
  PARADAS.push(p.i / TRECHOS);
  if (p.nome) LUGARES.push({ u: p.i / TRECHOS, nome: p.nome });
});

/* Refeitos quando a tela muda: as pedrinhas, a distâncias iguais pelo
   caminho, e o quanto do comprimento já se andou em cada `u` */
let pedrinhas = [];
const AMOSTRAS = 2000;
let andadoAte = [];

/* Um ponto do desenho na tela: ocupa a largura toda e fica no meio
   da altura, na proporção do desenho (ou um pouco mais alto) */
function naTela(p) {
  const livreTopo = topo + FOLGA;
  const livreAltura = altura - livreTopo - FOLGA;
  const mapaLargura = largura * (1 - 2 * MARGEM);
  const mapaAltura = livreAltura * (1 - 2 * MARGEM);
  const escalaX = mapaLargura / DESENHO_LARGURA;
  const escalaY = Math.min(mapaAltura / DESENHO_ALTURA, escalaX * ESTICA);
  return {
    x: largura * MARGEM + (p[0] - DESENHO_X) * escalaX,
    y: livreTopo + (livreAltura - DESENHO_ALTURA * escalaY) / 2 + (p[1] - DESENHO_Y) * escalaY
  };
}

/* Catmull-Rom: entre dois pontos, a curva que já chega apontando
   para o próximo. Nas pontas, o ponto vizinho é ele mesmo */
function curva(a, b, c, d, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (3 * b - a - 3 * c + d) * t3);
}

/* Ponto do caminho em `u` (0 = começo, 1 = fim), em px */
export function pontoNaTrilha(u) {
  const s = Math.min(Math.max(u, 0), 1) * TRECHOS;
  const i = Math.min(Math.floor(s), TRECHOS - 1);
  const t = s - i;
  const a = naTela(DESENHO[Math.max(i - 1, 0)]);
  const b = naTela(DESENHO[i]);
  const c = naTela(DESENHO[i + 1]);
  const d = naTela(DESENHO[Math.min(i + 2, TRECHOS)]);
  return { x: curva(a.x, b.x, c.x, d.x, t), y: curva(a.y, b.y, c.y, d.y, t) };
}

/* Quanto do comprimento do caminho fica antes de `u`, de 0 a 1 */
export function fracaoDoCaminho(u) {
  const i = Math.min(Math.max(u, 0), 1) * AMOSTRAS;
  const a = andadoAte[Math.floor(i)];
  const b = andadoAte[Math.min(Math.floor(i) + 1, AMOSTRAS)];
  return a + (b - a) * (i - Math.floor(i));
}

/* As pedrinhas desta tela: o `u` de cada uma, a fração do comprimento
   e se ela encosta no marco de uma parada */
export function pedrinhasDaTrilha() {
  return pedrinhas;
}

/* Mede o caminho e espalha as pedrinhas a distâncias iguais: assim
   ficam igualmente espaçadas nas retas e nas curvas */
function refazer() {
  const comprimentos = [0];
  let anterior = pontoNaTrilha(0);
  for (let i = 1; i <= AMOSTRAS; i++) {
    const p = pontoNaTrilha(i / AMOSTRAS);
    comprimentos.push(comprimentos[i - 1] + Math.hypot(p.x - anterior.x, p.y - anterior.y));
    anterior = p;
  }
  const total = comprimentos[AMOSTRAS];
  andadoAte = comprimentos.map(function (c) { return c / total; });

  const quantas = Math.max(Math.round(total / ENTRE_PEDRINHAS), MINIMO_DE_PEDRINHAS);
  const marcos = PARADAS.map(pontoNaTrilha);
  pedrinhas = [];
  for (let k = 0, j = 0; k <= quantas; k++) {
    const s = total * k / quantas;
    while (j < AMOSTRAS - 1 && comprimentos[j + 1] < s) j++;
    const p = (s - comprimentos[j]) / (comprimentos[j + 1] - comprimentos[j] || 1);
    const u = (j + p) / AMOSTRAS;
    const ponto = pontoNaTrilha(u);
    pedrinhas.push({
      u: u,
      fracao: k / quantas,
      encosta: marcos.some(function (m) { return Math.hypot(ponto.x - m.x, ponto.y - m.y) < ENCOSTA; })
    });
  }
}

aoAjustar(refazer);
