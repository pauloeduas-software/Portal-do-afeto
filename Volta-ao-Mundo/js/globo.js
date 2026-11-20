/* ================================================================
   globo.js — O mundo de pontinhos, girando atrás da frase
   Os continentes são pontos espalhados por igual na esfera (espiral
   de Fibonacci), só os que caem em terra (terra.js), com o contorno
   de cada país por cima (mapa.js), para reconhecer cada lugar.

   Cada país tem uma luz só, com todas as línguas dele: apagada até
   alguma aparecer, acesa depois, e pulsando a do idioma na tela, com
   o nome do país ao lado e ele tingido. O país sob o mouse (ou sob o
   dedo encostado) brilha, e a luz dele mostra os "te amo" de lá, um
   de cada vez; o toque escolhe o que está aparecendo.

   O globo é desenhado de frente (projeção ortográfica): o centro da
   tela olha para a longitude `giro` e a latitude `inclinacao`.
   ================================================================ */

import { ctxGlobo, ctxLuzes, largura, altura, escalaTela, aoAjustar } from './palco.js';
import { TOTAL_PONTOS, TERRA } from './terra.js';
import { paises, paisPorCodigo, paisEm, naEsfera, DETALHES } from './mapa.js';
import { rgbDaVariavel, rgba } from '../../comum/cores.js';

/* Giro sozinho, parado (rad/ms): uma volta em pouco menos de 2 minutos */
const GIRO_SOZINHO = 0.00006;
/* Depois de mexer no globo ou trocar de idioma, espera um bom tempo
   antes de voltar a girar sozinho, e volta aos poucos (ms) */
const ESPERA_GIRO = 30000;
const VOLTA_GIRO  = 3000;
/* Quanto tempo leva para virar até o lugar de um idioma (ms) */
const TEMPO_IDA = 1200;
/* Inclinar além de ~60° deixaria o polo de frente, e o mapa irreconhecível */
const INCLINACAO_MAX = 1.05;
/* Solto depois de arrastar, o globo continua e vai parando (por ms) */
const ATRITO = 0.004;
/* Ao soltar, o globo segue com a velocidade do dedo nos últimos
   instantes (ms). Se o dedo parou antes de soltar, não há nada nesse
   intervalo e o globo fica onde está */
const PARADO = 80;
/* Bem em cima de uma luz, ela ganha do país embaixo do dedo; no mar,
   uma ilha pequena conta como tocada até um pouco mais longe (px) */
const EM_CIMA_DA_LUZ = 8;
const PERTO_DA_ILHA  = 20;
/* Duas luzes mais perto que isto na tela (vezes a escala do globo)
   viram uma mancha: só a do país maior aparece (px). Com folga para
   os dois lados, senão girando devagar a luz piscaria no limite */
const ESPACO_LUZES = 11;
const FOLGA_SOME   = 0.8;
const FOLGA_VOLTA  = 1.15;
/* Luz aparecendo ou sumindo: um fade curto em vez de piscar (ms) */
const FADE_LUZ = 250;
/* Com o mouse (ou o dedo) parado num país, cada "te amo" dele fica
   este tempo antes de dar a vez ao próximo (ms) */
const TROCA_APONTADO = 1600;
/* Fatias de profundidade: pontos mais de frente brilham mais */
const FATIAS = 5;
/* Contorno: pontos a menos disto um do outro na tela não mudam o
   desenho e só pesam (px). Decide qual versão de mapa.js usar */
const PASSO_CONTORNO = 3;

const cor      = rgbDaVariavel('--page-accent');
/* Terra num tom mais claro da cor da página, para ler sobre o escuro;
   contornos quase brancos, para aparecer por cima da terra */
function clarear(quanto) {
  return cor.map(function (c) { return Math.round(c + (255 - c) * quanto); });
}
const corTerra = clarear(0.35);
const corLinha = clarear(0.85);

const area = document.querySelector('.lugar-globo');
const nav  = document.querySelector('.top-nav');

/* --- Pontos de terra --- */

/* Um bit por ponto da espiral (terra.js): 1 se é terra */
function ehTerra(i) {
  return (TERRA.charCodeAt(i >> 3) >> (i & 7)) & 1;
}

/* Mesma espiral com que terra.js foi gerado: o ponto i em x, y, z */
const pontos = (function () {
  const ouro = Math.PI * (3 - Math.sqrt(5));
  const lista = [];
  for (let i = 0; i < TOTAL_PONTOS; i++) {
    if (!ehTerra(i)) continue;
    const y = 1 - (i + 0.5) * 2 / TOTAL_PONTOS;
    const r = Math.sqrt(1 - y * y);
    lista.push(r * Math.sin(i * ouro), y, r * Math.cos(i * ouro));
  }
  return new Float32Array(lista);
})();

/* Onde cada ponto cai na tela, separado por fatia (0 é o lado de trás) */
const fatias = [];
const contas = new Uint16Array(FATIAS + 1);
for (let f = 0; f <= FATIAS; f++) fatias.push(new Float32Array(pontos.length / 3 * 2));

/* --- Rotação --- */

let giro = 0;          // longitude no centro (rad)
let inclinacao = 0;    // latitude no centro (rad)
/* Senos e cossenos do quadro, usados em toda a conta de girar */
let cg = 1, sg = 0, ci = 1, si = 0;
let velGiro = 0;       // depois de soltar (rad/ms)
let velInclinacao = 0;
let arrastando = false;
/* Onde o globo estava a cada movimento do arrasto, só os recentes:
   [tempo, giro, inclinacao, ...] */
let rastro = [];
/* Última vez que algo mexeu no globo: o giro sozinho espera por ela.
   Ao abrir a página ninguém mexeu ainda, e ele já sai girando */
let mexidoEm = -Infinity;
/* Virando até um idioma: { giro0, inclinacao0, dGiro, dInclinacao, inicio } */
let ida = null;

/* Resultado de girar(): onde o ponto cai na tela e se está de frente (z > 0) */
let tx = 0, ty = 0, tz = 0;

function girar(x, y, z) {
  const x1 = x * cg - z * sg;
  const z1 = x * sg + z * cg;
  tx = cx + raio * x1;
  ty = cy - raio * (y * ci - z1 * si);
  tz = y * si + z1 * ci;
}

/* O contrário: um ponto da tela → [latitude, longitude], ou null fora do globo */
function lugarNaTela(x, y) {
  const a = (x - cx) / raio;
  const b = (cy - y) / raio;
  const d = a * a + b * b;
  if (d > 1) return null;
  const c = Math.sqrt(1 - d);
  const py = b * ci + c * si;
  const z1 = -b * si + c * ci;
  const px = a * cg + z1 * sg;
  const pz = -a * sg + z1 * cg;
  return [Math.asin(py) * 180 / Math.PI, Math.atan2(px, pz) * 180 / Math.PI];
}

function limitarInclinacao(v) {
  return Math.max(-INCLINACAO_MAX, Math.min(INCLINACAO_MAX, v));
}

function suave(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/* --- Luzes dos países --- */

/* { codigo, pais, nome, itens, ponto, x, y, z, visivel, brilho }:
   uma por país, com os idiomas de lá (itens) na ordem de frases.js.
   x, y e z são do último quadro; visivel diz se ela coube na tela sem
   encostar em outra, e brilho é o fade de 0 a 1 */
let marcos = [];
/* Os mesmos, do país maior para o menor: quem chega primeiro aparece */
let porTamanho = [];
/* A luz de cada idioma quando ele vem sem toque: a do país da casa dele */
const casaDe = new Map();
/* O idioma na tela e a luz dele */
let atual = null;
let itemAtual = null;
/* A luz sob o mouse ou o dedo, desde quando, e com qual "te amo" dela
   começou a mostrar */
let apontado = null;
let apontadoDesde = 0;
let apontadoInicio = 0;
/* País sob o mouse ou o dedo */
let paisApontado = null;
/* Idiomas que já apareceram: a luz do país deles fica acesa */
const vistos = new Set();

/* Luz pré-desenhada, toda branca: na cor da página ela sumia no meio
   dos pontinhos, que também são dela */
const sprite = document.createElement('canvas');
(function () {
  sprite.width = sprite.height = 64;
  const c = sprite.getContext('2d');
  const g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
  /* Miolo firme e halo curto: luzes vizinhas não se fundem numa mancha */
  g.addColorStop(0,    'rgba(255,255,255,1)');
  g.addColorStop(0.28, 'rgba(255,255,255,1)');
  g.addColorStop(0.38, 'rgba(255,255,255,0.5)');
  g.addColorStop(0.65, 'rgba(255,255,255,0.1)');
  g.addColorStop(1,    'rgba(255,255,255,0)');
  c.fillStyle = g;
  c.fillRect(0, 0, 64, 64);
})();

/* Uma luz por país (frases.js), no primeiro lugar dele que aparece:
   o da língua mais conhecida de lá */
export function definirLuzes(itens) {
  const porCodigo = new Map();
  marcos = [];
  casaDe.clear();
  itens.forEach(function (item) {
    item.lugares.forEach(function (l, i) {
      let marco = porCodigo.get(l[0]);
      if (!marco) {
        const pais = paisPorCodigo.get(l[0]) || null;
        marco = {
          codigo: l[0], pais: pais, nome: pais ? pais.nome : l[1], itens: [],
          ponto: naEsfera(l[2], l[3]), x: 0, y: 0, z: -1, visivel: false, brilho: 0
        };
        porCodigo.set(l[0], marco);
        marcos.push(marco);
      }
      if (marco.itens.indexOf(item) < 0) marco.itens.push(item);
      if (i === 0) casaDe.set(item, marco);
    });
  });
  porTamanho = marcos.slice().sort(function (a, b) {
    return (b.pais ? b.pais.tamanho : 0) - (a.pais ? a.pais.tamanho : 0);
  });
}

/* A luz mais perto do ponto, até `alcance` px; `escondidas` inclui as
   que não apareceram por encostar numa maior */
function marcoPerto(x, y, alcance, escondidas) {
  let perto = null;
  let menor = alcance;
  marcos.forEach(function (marco) {
    if (marco.z < 0.15 || !(marco.visivel || escondidas)) return;
    const d = Math.hypot(marco.x - x, marco.y - y);
    if (d < menor) {
      menor = d;
      perto = marco;
    }
  });
  return perto;
}

/* A luz embaixo do toque, nesta ordem: a luz bem embaixo do dedo; a do
   país tocado; no mar, uma ilha logo ao lado, que de tão pequena o dedo
   não acerta. Devolve { marco, pais, noGlobo } */
function alvo(x, y) {
  const emCima = marcoPerto(x, y, EM_CIMA_DA_LUZ, false);
  if (emCima) return { marco: emCima, pais: emCima.pais, noGlobo: true };

  const lugar = lugarNaTela(x, y);
  const pais = lugar && paisEm(lugar[0], lugar[1]);
  if (!pais) {
    /* Ilha tão pequena que até a luz dela ficou escondida também vale:
       apontada, ela aparece */
    const ilha = marcoPerto(x, y, PERTO_DA_ILHA, true);
    if (ilha) return { marco: ilha, pais: ilha.pais, noGlobo: true };
    return { marco: null, pais: null, noGlobo: !!lugar };
  }
  const marco = marcos.find(function (m) { return m.pais === pais; }) || null;
  return { marco: marco, pais: pais, noGlobo: true };
}

/* Por qual "te amo" a luz começa: no país do idioma na tela, pelo
   seguinte a ele, para o toque repetido ir passando as línguas de lá */
function primeiroIndice(marco) {
  if (marco !== atual) return 0;
  return (marco.itens.indexOf(itemAtual) + 1) % marco.itens.length;
}

/* O "te amo" que a luz apontada está mostrando agora */
function itemApontado(agora) {
  const n = apontado.itens.length;
  const passados = Math.floor(Math.max(agora - apontadoDesde, 0) / TROCA_APONTADO);
  return apontado.itens[(apontadoInicio + passados) % n];
}

function comecarAApontar(marco, agora) {
  apontado = marco;
  apontadoDesde = agora;
  apontadoInicio = marco ? primeiroIndice(marco) : 0;
}

/* O que um toque nesse ponto pega: `luz` ({ item, marco }) é o idioma
   que ele escolhe (null no mar ou em país sem luz): o que a luz
   apontada está mostrando. `noGlobo` diz se caiu em cima do globo */
export function tocarNoPonto(x, y) {
  const a = alvo(x, y);
  if (!a.marco) return { luz: null, noGlobo: a.noGlobo };
  const item = a.marco === apontado
    ? itemApontado(performance.now())
    : a.marco.itens[primeiroIndice(a.marco)];
  return { luz: { item: item, marco: a.marco }, noGlobo: true };
}

/* Se o ponto cai em cima do globo (ou numa ilha logo ao lado) */
export function estaNoGlobo(x, y) {
  return alvo(x, y).noGlobo;
}

/* Mouse passando ou dedo encostado: o país brilha e a luz dele passa
   a mostrar os "te amo" de lá. Devolve { temLuz, noGlobo }: as duas
   respostas de uma conta só, que o mouse pede a cada movimento */
export function apontar(x, y) {
  const a = alvo(x, y);
  mudarPaisApontado(a.pais);
  if (a.marco !== apontado) comecarAApontar(a.marco, performance.now());
  if (a.noGlobo) mexidoEm = performance.now();
  return { temLuz: !!a.marco, noGlobo: a.noGlobo };
}

export function pararDeApontar() {
  mudarPaisApontado(null);
  apontado = null;
}

/* O país apontado é pintado na camada do globo: só a refaz quando ele muda */
function mudarPaisApontado(pais) {
  if (pais === paisApontado) return;
  paisApontado = pais;
  globoSujo = true;
}

/* Acende a luz e vira o globo até ela, pelo caminho mais curto */
function irPara(marco, item, animar) {
  atual = marco;
  itemAtual = item;
  globoSujo = true;   // o país da frase é tingido na camada do globo
  vistos.add(item);
  /* Ainda apontando para ela: continua pelo "te amo" seguinte */
  if (apontado === marco) comecarAApontar(marco, performance.now());
  const p = marco.ponto;
  const alvoGiro = Math.atan2(p[0], p[2]);
  /* Só parte da latitude: centrar a Europa de vez deixaria o polo de
     frente; um pouco acima do meio ela já fica bem à vista */
  const alvoInclinacao = limitarInclinacao(Math.asin(p[1]) * 0.6);
  let dGiro = alvoGiro - giro;
  dGiro -= 2 * Math.PI * Math.round(dGiro / (2 * Math.PI));

  if (!animar) {
    giro += dGiro;
    inclinacao = alvoInclinacao;
    return;
  }
  velGiro = velInclinacao = 0;
  mexidoEm = performance.now();
  ida = {
    giro0: giro, inclinacao0: inclinacao,
    dGiro: dGiro, dInclinacao: alvoInclinacao - inclinacao,
    inicio: performance.now()
  };
}

/* O idioma na luz tocada; sem toque, na do país da casa dele */
export function mostrarIdioma(item, luz, animar) {
  irPara(luz ? luz.marco : casaDe.get(item), item, animar);
}

/* --- Arrastar --- */

/* Arrastar para a direita leva o mundo junto para a direita */
export function comecarArrasto() {
  arrastando = true;
  ida = null;
  velGiro = velInclinacao = 0;
  rastro = [performance.now(), giro, inclinacao];
  pararDeApontar();
}

export function arrastar(dx, dy) {
  giro -= dx / raio;
  inclinacao = limitarInclinacao(inclinacao + dy / raio);
  const agora = mexidoEm = performance.now();
  rastro.push(agora, giro, inclinacao);
  /* Guarda só o que ainda pode entrar na conta ao soltar */
  while (rastro.length > 6 && agora - rastro[3] > PARADO) rastro.splice(0, 3);
}

/* A velocidade é o caminho dos últimos PARADO ms dividido pelo tempo.
   Medida de um movimento para o outro, dois eventos colados (no
   celular chegam vários por quadro) davam um pico, e o globo saía
   solto num tranco, mais rápido ou mais lento que o dedo */
export function soltarArrasto() {
  arrastando = false;
  const agora = performance.now();
  mexidoEm = agora;
  velGiro = velInclinacao = 0;
  const n = rastro.length;
  if (n < 6 || agora - rastro[n - 3] > PARADO) return;
  let i = 0;
  while (i < n - 6 && agora - rastro[i] > PARADO) i += 3;
  const tempo = rastro[n - 3] - rastro[i];
  if (tempo < 10) return;
  velGiro       = (rastro[n - 2] - rastro[i + 1]) / tempo;
  velInclinacao = (rastro[n - 1] - rastro[i + 2]) / tempo;
}

/* Só o giro sozinho mexendo (sem dedo, sem ida, sem deslizar):
   aí o globo pode ser refeito menos vezes, ver quadro() */
let soGiroSozinho = false;

function mover(agora, dt) {
  soGiroSozinho = false;
  if (ida) {
    const t = Math.min((agora - ida.inicio) / TEMPO_IDA, 1);
    const e = suave(t);
    giro       = ida.giro0 + ida.dGiro * e;
    inclinacao = ida.inclinacao0 + ida.dInclinacao * e;
    mexidoEm = agora;
    if (t === 1) ida = null;
    return;
  }
  if (arrastando) return;

  giro += velGiro * dt;
  inclinacao = limitarInclinacao(inclinacao + velInclinacao * dt);
  const atrito = Math.exp(-ATRITO * dt);
  velGiro *= atrito;
  velInclinacao *= atrito;
  /* Quase parado já é parado: senão o globo seria refeito por mais uns
     segundos sem nada que se veja mudar */
  if (Math.abs(velGiro) < 1e-6) velGiro = 0;
  if (Math.abs(velInclinacao) < 1e-6) velInclinacao = 0;
  /* Ainda solto e deslizando: conta como mexendo */
  if (Math.abs(velGiro) > 1e-5) mexidoEm = agora;

  const volta = Math.min(Math.max((agora - mexidoEm - ESPERA_GIRO) / VOLTA_GIRO, 0), 1);
  giro -= GIRO_SOZINHO * dt * volta;
  soGiroSozinho = velGiro === 0 && velInclinacao === 0;
}

/* --- Lugar na tela --- */

let cx = 0;
let cy = 0;
let raio = 1;
/* Qual versão do contorno (mapa.js) cabe neste tamanho de globo */
let versao = 0;

/* O globo ocupa o espaço de .lugar-globo (no CSS) abaixo do header */
aoAjustar(function () {
  const caixa = area.getBoundingClientRect();
  const topo  = Math.max(caixa.top, nav.getBoundingClientRect().bottom);
  const alto  = caixa.bottom - topo;
  cx   = caixa.left + caixa.width / 2;
  cy   = topo + alto / 2;
  raio = Math.max(Math.min(caixa.width, alto) * 0.44, 40);
  const distancia = PASSO_CONTORNO / raio;
  versao = 0;
  DETALHES.forEach(function (d, i) { if (d <= distancia) versao = i; });
});

/* --- Desenho --- */

/* Duas camadas. A do globo (pontinhos, contornos, o país da frase e o
   apontado) é a pesada: refeita todo quadro em que a rotação anda,
   por pouco que seja, e parada, nunca. Refazer só a cada meio pixel
   deixava o giro sozinho andando aos saltos (um quadro sim, dois não),
   e era isso que se via travando. A das luzes (luzes e nomes) é leve e
   vem todo quadro */
const MUDANCA_VISIVEL = 0.001;   // px
/* No giro sozinho o globo anda uns 10px por segundo: refeito 20 vezes
   por segundo, em passo fixo, cada passo é meio pixel, não se vê
   diferença e custa um terço. A folga absorve a variação do relógio
   entre quadros (ms) */
const INTERVALO_SOZINHO = 1000 / 20 - 4;
let globoDesenhadoEm = -Infinity;

/* Rotação com que a camada do globo foi desenhada pela última vez */
let giroDesenhado = NaN;
let inclinacaoDesenhada = NaN;
/* O globo precisa ser refeito mesmo sem girar (país da frase, tamanho) */
let globoSujo = true;
/* Mudou o tamanho: limpa a tela toda, o globo pode ter saído do lugar */
let tamanhoMudou = true;

aoAjustar(function () { globoSujo = true; tamanhoMudou = true; });

/* Brilho em volta, corpo e borda do globo não giram: desenhados uma
   vez por tamanho de tela e só copiados a cada quadro. Os degradês
   refeitos todo quadro custavam quase tanto quanto os pontinhos */
const enfeite = document.createElement('canvas');
const MARGEM_HALO = 1.3;   // o brilho vai até 1.3 raio

function prepararEnfeite() {
  const lado = Math.ceil(raio * MARGEM_HALO * 2 * escalaTela) + 2;
  enfeite.width = enfeite.height = lado;
  const c = enfeite.getContext('2d');
  const m = lado / 2;
  c.setTransform(escalaTela, 0, 0, escalaTela, m, m);

  const halo = c.createRadialGradient(0, 0, raio * 0.95, 0, 0, raio * MARGEM_HALO);
  halo.addColorStop(0, rgba(cor, 0.18));
  halo.addColorStop(1, rgba(cor, 0));
  c.fillStyle = halo;
  c.beginPath();
  c.arc(0, 0, raio * MARGEM_HALO, 0, 2 * Math.PI);
  c.fill();

  const corpo = c.createRadialGradient(-raio * 0.3, -raio * 0.35, raio * 0.1, 0, 0, raio);
  corpo.addColorStop(0, rgba(cor, 0.08));
  corpo.addColorStop(1, rgba(cor, 0.02));
  c.fillStyle = corpo;
  c.beginPath();
  c.arc(0, 0, raio, 0, 2 * Math.PI);
  c.fill();
  c.strokeStyle = rgba(cor, 0.3);
  c.lineWidth = 1;
  c.stroke();
}

aoAjustar(prepararEnfeite);

/* Cada pontinho é a cópia de um disco já pronto (discoTerra): são
   milhares por quadro, e copiar uma imagem pequena custa bem menos que
   rasterizar um círculo. No lado de trás, pequeno e quase transparente,
   um quadradinho basta */
const discoTerra = document.createElement('canvas');

/* O disco na cor da terra, no tamanho exato do ponto na tela */
function prepararDisco() {
  const raioPonto = Math.max(1.1, raio * 0.0085);
  const lado = Math.ceil(raioPonto * 2 * escalaTela) + 2;
  discoTerra.width = discoTerra.height = lado;
  const c = discoTerra.getContext('2d');
  c.fillStyle = rgba(corTerra, 1);
  c.beginPath();
  c.arc(lado / 2, lado / 2, raioPonto * escalaTela, 0, 2 * Math.PI);
  c.fill();
}

aoAjustar(prepararDisco);

function desenharPontos(c, f, raioPonto, alpha, quadrado) {
  const xy = fatias[f];
  const n = contas[f] * 2;
  if (!n) return;
  c.beginPath();
  if (quadrado) {
    for (let i = 0; i < n; i += 2) {
      c.rect(xy[i] - raioPonto, xy[i + 1] - raioPonto, raioPonto * 2, raioPonto * 2);
    }
    c.fillStyle = rgba(corTerra, alpha);
    c.fill();
    return;
  }
  /* O disco tem 1px de folga em volta: copiado com essa folga, o
     círculo fica do tamanho certo */
  const lado = discoTerra.width / escalaTela;
  const meio = lado / 2;
  c.globalAlpha = alpha;
  for (let i = 0; i < n; i += 2) {
    c.drawImage(discoTerra, xy[i] - meio, xy[i + 1] - meio, lado, lado);
  }
  c.globalAlpha = 1;
}

/* Põe no caminho atual os trechos de frente do contorno de um país.
   Partes inteiras atrás do globo nem entram na conta. É o laço mais
   pesado do desenho: a rotação vai escrita aqui dentro, sem girar() */
function tracarPais(c, pais) {
  const partes = pais.partes;
  for (let k = 0; k < partes.length; k++) {
    const parte = partes[k];
    const m = parte.centro;
    const zc = m[1] * si + (m[0] * sg + m[2] * cg) * ci;
    if (zc < -parte.alcance) continue;
    const e = parte.versoes[versao];
    /* Sem closePath: o contorno já repete o primeiro ponto no fim, e
       cortado pela borda do globo o pedaço fica aberto */
    let seguindo = false;
    for (let i = 0; i < e.length; i += 3) {
      const x1 = e[i] * cg - e[i + 2] * sg;
      const z1 = e[i] * sg + e[i + 2] * cg;
      if (e[i + 1] * si + z1 * ci <= 0) {
        seguindo = false;
        continue;
      }
      const x = cx + raio * x1;
      const y = cy - raio * (e[i + 1] * ci - z1 * si);
      if (seguindo) c.lineTo(x, y);
      else c.moveTo(x, y);
      seguindo = true;
    }
  }
}

/* Costa e fronteiras de todos os países. Um traço escuro mais largo
   por baixo abre um sulco nos pontinhos, e a linha clara por cima
   fica nítida no meio deles */
function desenharContornos(c, espessura) {
  c.beginPath();
  for (let k = 0; k < paises.length; k++) tracarPais(c, paises[k]);
  c.lineJoin = 'bevel';
  c.strokeStyle = 'rgba(12,0,18,0.6)';
  c.lineWidth = espessura * 2.6;
  c.stroke();
  c.strokeStyle = rgba(corLinha, 0.85);
  c.lineWidth = espessura;
  c.stroke();
}

/* O país da frase tingido de leve; o apontado, mais forte e brilhando.
   O brilho é um traço largo e transparente por baixo do branco: sombra
   desfocada (shadowBlur) faria o mesmo, mas custa caro a cada quadro */
function tingirPais(c, pais, alpha, espessura, brilho) {
  c.beginPath();
  tracarPais(c, pais);
  c.fillStyle = rgba(cor, alpha);
  c.fill();
  if (!brilho) return;
  c.lineJoin = 'bevel';
  c.strokeStyle = rgba(cor, 0.35);
  c.lineWidth = espessura * 7;
  c.stroke();
  c.strokeStyle = rgba(cor, 0.6);
  c.lineWidth = espessura * 3.5;
  c.stroke();
  c.strokeStyle = 'rgba(255,255,255,0.95)';
  c.lineWidth = espessura * 1.6;
  c.stroke();
}

/* Nome ao lado da luz. Sem caixa atrás: um contorno escuro em volta
   das letras basta para ler por cima dos pontinhos. Perto da borda
   direita do globo, vai para o lado esquerdo da luz */
function escrever(c, luz, texto, distancia, tamanho, desce) {
  const aDireita = luz.x < cx + raio * 0.4;
  c.globalAlpha = Math.min(luz.z / 0.25, 1);
  c.font = '600 ' + Math.round(tamanho) + 'px Outfit, sans-serif';
  c.textAlign = aDireita ? 'left' : 'right';
  c.textBaseline = 'middle';
  const x = luz.x + (aDireita ? distancia : -distancia);
  c.lineJoin = 'round';
  c.strokeStyle = 'rgba(0,0,0,0.75)';
  c.lineWidth = 4;
  c.strokeText(texto, x, luz.y + desce);
  c.fillStyle = '#fff';
  c.fillText(texto, x, luz.y + desce);
}

function desenharLuz(c, luz, tamanho, alpha) {
  c.globalAlpha = alpha * Math.min(luz.z / 0.25, 1);
  c.drawImage(sprite, luz.x - tamanho / 2, luz.y - tamanho / 2, tamanho, tamanho);
}

function escalaDoGlobo() {
  return Math.min(Math.max(raio / 170, 0.8), 1.6);
}

/* Camada do globo, na rotação de agora */
function desenharGlobo() {
  const c = ctxGlobo;
  giroDesenhado = giro;
  inclinacaoDesenhada = inclinacao;
  globoSujo = false;
  cg = Math.cos(giro);
  sg = Math.sin(giro);
  ci = Math.cos(inclinacao);
  si = Math.sin(inclinacao);

  /* Só a caixa do globo com o brilho: o resto da tela fica sempre vazio */
  const meio = raio * MARGEM_HALO + 2;
  c.setTransform(escalaTela, 0, 0, escalaTela, 0, 0);
  if (tamanhoMudou) {
    c.clearRect(0, 0, largura, altura);
    tamanhoMudou = false;
  } else {
    c.clearRect(cx - meio, cy - meio, meio * 2, meio * 2);
  }

  /* Gira cada ponto e separa por profundidade */
  contas.fill(0);
  for (let i = 0; i < pontos.length; i += 3) {
    girar(pontos[i], pontos[i + 1], pontos[i + 2]);
    const f = tz < 0 ? 0 : Math.min(FATIAS, 1 + Math.floor(tz * FATIAS));
    const k = contas[f]++ * 2;
    fatias[f][k]     = tx;
    fatias[f][k + 1] = ty;
  }

  const raioPonto = Math.max(1.1, raio * 0.0085);
  const escala    = escalaDoGlobo();

  /* O lado de trás aparece de leve através do globo; por cima, o
     brilho, o corpo e a borda, já prontos (prepararEnfeite) */
  desenharPontos(c, 0, raioPonto * 0.7, 0.07, true);
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.drawImage(enfeite, Math.round((cx - enfeite.width / 2 / escalaTela) * escalaTela),
                       Math.round((cy - enfeite.height / 2 / escalaTela) * escalaTela));
  c.setTransform(escalaTela, 0, 0, escalaTela, 0, 0);

  for (let f = 1; f <= FATIAS; f++) {
    desenharPontos(c, f, raioPonto, 0.3 + 0.55 * (f - 0.5) / FATIAS);
  }

  if (atual && atual.pais) tingirPais(c, atual.pais, 0.2, escala, false);
  desenharContornos(c, escala);
  if (paisApontado) tingirPais(c, paisApontado, 0.4, escala, true);

  /* As luzes ficam na rotação do globo desenhado, para não descolar dele */
  marcos.forEach(function (marco) {
    const p = marco.ponto;
    girar(p[0], p[1], p[2]);
    marco.x = tx;
    marco.y = ty;
    marco.z = tz;
  });
}

/* Quais luzes cabem na tela: a do idioma na tela sempre; as outras,
   do país maior para o menor, só onde não encostam numa que já coube.
   A apontada não conta: passar o mouse não esconde as vizinhas */
function arrumarLuzes(dt) {
  const espaco = ESPACO_LUZES * escalaDoGlobo();
  const ocupadas = [];
  if (atual && atual.z > 0) ocupadas.push(atual);
  porTamanho.forEach(function (marco) {
    let cabe = marco.z > 0;
    if (marco === atual) {
      cabe = marco.z > 0;
    } else if (cabe) {
      /* Já na tela, só sai bem colada; fora, só volta com folga */
      const limite = espaco * (marco.visivel ? FOLGA_SOME : FOLGA_VOLTA);
      for (let i = 0; i < ocupadas.length; i++) {
        if (Math.abs(ocupadas[i].x - marco.x) < limite && Math.abs(ocupadas[i].y - marco.y) < limite) {
          cabe = false;
          break;
        }
      }
      if (cabe) ocupadas.push(marco);
    }
    marco.visivel = cabe;
    const passo = dt / FADE_LUZ;
    marco.brilho = cabe ? Math.min(marco.brilho + passo, 1) : Math.max(marco.brilho - passo, 0);
  });
}

/* Camada das luzes: as luzes apagadas, as dos países
   já vistos, a apontada e, por cima de tudo, a do idioma na tela */
function desenharLuzes(agora, dt) {
  const c = ctxLuzes;
  const escala = escalaDoGlobo();
  c.setTransform(escalaTela, 0, 0, escalaTela, 0, 0);
  c.clearRect(0, 0, largura, altura);

  arrumarLuzes(dt);
  marcos.forEach(function (marco) {
    if (marco.brilho <= 0 || marco.z <= 0 || marco === atual || marco === apontado) return;
    const visto = marco.itens.some(function (item) { return vistos.has(item); });
    if (visto) desenharLuz(c, marco, 16 * escala, marco.brilho);
    else desenharLuz(c, marco, 11 * escala, 0.8 * marco.brilho);
  });

  const comApontado = apontado && apontado !== atual && apontado.z > 0;
  if (comApontado) desenharLuz(c, apontado, 26 * escala, 1);
  if (atual && atual.z > 0) {
    const pulso = 1 + 0.15 * Math.sin(agora * 2 * Math.PI / 1800);
    desenharLuz(c, atual, 36 * escala * pulso, 1);
    /* Com outra luz apontada logo ao lado, os dois nomes se encavalariam */
    const encostada = comApontado && Math.hypot(apontado.x - atual.x, apontado.y - atual.y) < 90 * escala;
    if (!encostada && apontado !== atual) escrever(c, atual, atual.nome, 18 * escala, 13 * escala, 0);
  }
  /* A apontada diz o país e, embaixo, o "te amo" que o toque escolheria,
     trocando sozinho quando o país tem mais de uma língua */
  if (apontado && apontado.z > 0) {
    const item = itemApontado(agora);
    const n = apontado.itens.length;
    const qual = n > 1 ? ' (' + (apontado.itens.indexOf(item) + 1) + ' de ' + n + ')' : '';
    const distancia = (apontado === atual ? 18 : 16) * escala;
    escrever(c, apontado, apontado.nome, distancia, 13 * escala, -8 * escala);
    escrever(c, apontado, item.frase + ' · ' + item.idioma + qual, distancia, 11 * escala, 8 * escala);
  }
  c.globalAlpha = 1;
}

let anterior = performance.now();

function quadro(agora) {
  /* Aba escondida e de volta: sem um salto de rotação acumulada */
  const dt = Math.min(agora - anterior, 50);
  anterior = agora;
  mover(agora, dt);
  const andou = (Math.abs(giro - giroDesenhado) + Math.abs(inclinacao - inclinacaoDesenhada)) * raio;
  const cedo = soGiroSozinho && agora - globoDesenhadoEm < INTERVALO_SOZINHO;
  if (globoSujo || (!(andou < MUDANCA_VISIVEL) && !cedo)) {
    desenharGlobo();
    globoDesenhadoEm = agora;
  }
  desenharLuzes(agora, dt);
  requestAnimationFrame(quadro);
}

requestAnimationFrame(quadro);
