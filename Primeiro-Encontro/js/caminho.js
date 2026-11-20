/* ================================================================
   caminho.js — A luz, as pedrinhas do caminho e o caminho virando coração
   Uma luz anda pelo caminho (js/trilha.js) e acende as pedrinhas por
   onde passa. Cada parada tem um marco maior, e cada lugar mostra o
   nome quando a luz chega nele. No fim, a luz voa até o vão do
   coração (js/coracao.js), as pedrinhas levantam voo uma depois da
   outra até o contorno dele, e a linha do coração se desenha a partir
   do vão, engolindo as pedrinhas. Quando o coração acende, a luz se
   apaga dentro dele.
   ================================================================ */

import { largura } from './palco.js';
import { COR, COR_CLARA, LUZ, LUZ_CLARA, rgba, pintarLuz } from './cores.js';
import { PARADAS, LUGARES, pontoNaTrilha, pedrinhasDaTrilha } from './trilha.js';
import { pontoNoCoracao, tracarCoracao } from './coracao.js';

/* Raio do brilho da luz (px) */
const RAIO = 22;

/* Pedrinhas: raio apagada, acesa e no meio do voo; marcos das paradas:
   raio apagado e aceso (px) */
const PEDRINHA = 1.8;
const PEDRINHA_ACESA = 2.4;
const PEDRINHA_VOANDO = 3.4;
const MARCO = 5;
const MARCO_ACESO = 11;

/* Nome do lugar: tamanho da letra, distância do marco (px) e quanto
   leva para aparecer (ms) */
const LETRA = 11;
const NOME_ABAIXO = 18;
const SURGIR = 800;

/* A transformação, em fração do tempo dela. Primeiro somem os marcos
   e os nomes e a luz voa até o vão; as pedrinhas saem uma depois da
   outra, do começo do caminho para o fim; por último a linha se
   desenha do vão até a ponta, pelos dois lados */
const SOMEM_MARCOS = 0.15;
const LUZ_VOA = 0.25;
const PEDRAS_SAEM = [0.05, 0.5];
const PEDRA_VOA = 0.3;
const LINHA = [0.68, 1];
/* Quanto a curva do voo se afasta da reta, em fração da distância */
const CURVA_DO_VOO = 0.3;

/* Quanto a luz leva para se apagar quando o coração acende (ms) */
const APAGAR = 1200;

/* Até onde a luz já andou (`u` do caminho) e o passo em curso */
let andado = 0;
let passo = null;
/* Quanto da transformação já passou (0 a 1) e a transformação em curso */
let virado = 0;
let mudanca = null;
/* Quando a luz começa a se apagar; null antes disso */
let apagarEm = null;
/* Quando a luz chegou em cada lugar, para o nome surgir aos poucos */
const chegouEm = LUGARES.map(function () { return null; });

/* Começa e termina devagar */
function suave(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/* Quanto de um trecho [de, ate] da transformação já passou, de 0 a 1 */
function trecho(de, ate) {
  return Math.min(Math.max((virado - de) / (ate - de), 0), 1);
}

/* Começo da página: a luz parada em `u`, sem andar */
export function colocarEm(u) {
  andado = u;
  passo = null;
}

/* A luz anda até `u` em `duracao` ms; `aoChegar` roda quando chega */
export function andarAte(u, duracao, aoChegar) {
  passo = { de: andado, ate: u, inicio: null, duracao: duracao, aoChegar: aoChegar };
}

/* O caminho vira coração em `duracao` ms; `aoTerminar` roda no fim */
export function virarCoracao(duracao, aoTerminar) {
  mudanca = { inicio: null, duracao: duracao, aoTerminar: aoTerminar };
}

/* O coração acendeu: a luz se apaga dentro dele */
export function apagarLuz() {
  apagarEm = performance.now();
}

function avancar(agora) {
  if (passo) {
    if (passo.inicio === null) passo.inicio = agora;
    const t = Math.min((agora - passo.inicio) / passo.duracao, 1);
    andado = passo.de + (passo.ate - passo.de) * suave(t);
    if (t >= 1) {
      const aoChegar = passo.aoChegar;
      passo = null;
      if (aoChegar) aoChegar();
    }
  }
  if (mudanca) {
    if (mudanca.inicio === null) mudanca.inicio = agora;
    virado = Math.min((agora - mudanca.inicio) / mudanca.duracao, 1);
    if (virado >= 1) {
      const aoTerminar = mudanca.aoTerminar;
      mudanca = null;
      if (aoTerminar) aoTerminar();
    }
  }
  LUGARES.forEach(function (l, i) {
    if (chegouEm[i] === null && andado >= l.u - 0.0001) chegouEm[i] = agora;
  });
}

/* Voo de `a` até `b` numa curva: o meio do caminho se afasta da reta,
   sempre para o mesmo lado, e as pedrinhas parecem girar até o lugar */
function voo(a, b, t) {
  if (t <= 0) return a;
  if (t >= 1) return b;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const cx = (a.x + b.x) / 2 - dy * CURVA_DO_VOO;
  const cy = (a.y + b.y) / 2 + dx * CURVA_DO_VOO;
  const s = 1 - t;
  return {
    x: s * s * a.x + 2 * s * t * cx + t * t * b.x,
    y: s * s * a.y + 2 * s * t * cy + t * t * b.y
  };
}

/* Quanto o voo da pedrinha já andou: sai mais cedo a do começo do caminho */
function vooDaPedrinha(fracao) {
  const sai = PEDRAS_SAEM[0] + fracao * (PEDRAS_SAEM[1] - PEDRAS_SAEM[0]);
  return suave(trecho(sai, sai + PEDRA_VOA));
}

/* Até onde a linha do coração já se desenhou, a partir do vão: 0 nada,
   1 até a ponta pelos dois lados */
function linhaDesenhada() {
  return suave(trecho(LINHA[0], LINHA[1]));
}

/* Do vão até o ponto `fracao` do coração, pelo lado mais curto: 0 no
   vão, 1 na ponta */
function longeDoVao(fracao) {
  return Math.min(fracao, 1 - fracao) * 2;
}

export function desenharCaminho(ctx, agora, lugar) {
  avancar(agora);

  const linha = linhaDesenhada();
  desenharPedrinhas(ctx, lugar, linha);
  const marcos = 1 - trecho(0, SOMEM_MARCOS);
  if (marcos > 0) {
    desenharParadas(ctx, marcos);
    desenharNomes(ctx, agora, marcos);
  }
  if (linha > 0) desenharLinha(ctx, lugar, linha);
  desenharLuz(ctx, agora, lugar);
}

/* A luz: no caminho, depois voando até o vão, e se apagando quando o
   coração acende */
function desenharLuz(ctx, agora, lugar) {
  let alpha = 1;
  if (apagarEm !== null) {
    alpha = 1 - Math.min((agora - apagarEm) / APAGAR, 1);
    if (alpha <= 0) return;
  }
  const noCaminho = pontoNaTrilha(andado);
  const luz = virado ? voo(noCaminho, pontoNoCoracao(0, lugar), suave(trecho(0, LUZ_VOA))) : noCaminho;
  const respira = 1 + 0.12 * Math.sin(agora / 350);
  ctx.globalCompositeOperation = 'lighter';
  pintarLuz(ctx, LUZ, luz.x, luz.y, RAIO * respira, 0.85 * alpha);
  pintarLuz(ctx, LUZ_CLARA, luz.x, luz.y, RAIO * 0.3, alpha);
  ctx.globalCompositeOperation = 'source-over';
}

/* As pedrinhas: apagadas à frente da luz, acesas por onde ela passou,
   maiores enquanto voam. Somem quando a linha do coração passa por
   elas. Num caminho só para cada grupo, mais leve que um por pedrinha */
function desenharPedrinhas(ctx, lugar, linha) {
  const apagadas = new Path2D();
  const acesas = new Path2D();
  pedrinhasDaTrilha().forEach(function (pedrinha) {
    /* Encostada num marco, só aparece quando os marcos somem: sem
       ela, o coração ficaria com um buraco ali */
    if (pedrinha.encosta && !virado) return;
    const t = virado ? vooDaPedrinha(pedrinha.fracao) : 0;
    /* Já pousou e a linha já passou por aqui: virou parte dela */
    if (t >= 1 && longeDoVao(pedrinha.fracao) < linha) return;
    const noCaminho = pontoNaTrilha(pedrinha.u);
    const p = t ? voo(noCaminho, pontoNoCoracao(pedrinha.fracao, lugar), t) : noCaminho;
    const acesa = pedrinha.u <= andado + 0.0001;
    let raio = acesa ? PEDRINHA_ACESA : PEDRINHA;
    if (t > 0 && t < 1) raio += (PEDRINHA_VOANDO - raio) * Math.sin(t * Math.PI);
    const grupo = acesa ? acesas : apagadas;
    grupo.moveTo(p.x + raio, p.y);
    grupo.arc(p.x, p.y, raio, 0, Math.PI * 2);
  });
  ctx.fillStyle = rgba(COR_CLARA, 0.28);
  ctx.fill(apagadas);
  ctx.save();
  ctx.shadowColor = rgba(COR, 1);
  ctx.shadowBlur = 8;
  ctx.fillStyle = rgba(COR_CLARA, 0.95);
  ctx.fill(acesas);
  ctx.restore();
}

/* A linha do coração, do vão até onde já chegou, pelos dois lados.
   Inteira, é o contorno fechado */
function desenharLinha(ctx, lugar, linha) {
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (linha >= 1) {
    tracarCoracao(ctx, lugar);
  } else {
    const passos = Math.max(Math.ceil(120 * linha), 2);
    [1, -1].forEach(function (sentido) {
      for (let i = 0; i <= passos; i++) {
        const f = (sentido === 1 ? 0 : 1) + sentido * linha / 2 * i / passos;
        const p = pontoNoCoracao(f, lugar);
        if (i) ctx.lineTo(p.x, p.y);
        else ctx.moveTo(p.x, p.y);
      }
    });
  }
  ctx.lineWidth = 7;
  ctx.strokeStyle = rgba(COR, 0.18);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.strokeStyle = rgba(COR_CLARA, 0.9);
  ctx.stroke();

  /* A ponta da linha brilha enquanto ela se desenha */
  if (linha < 1) {
    ctx.globalCompositeOperation = 'lighter';
    [linha / 2, 1 - linha / 2].forEach(function (f) {
      const p = pontoNoCoracao(f, lugar);
      pintarLuz(ctx, LUZ_CLARA, p.x, p.y, 9, 0.8);
    });
    ctx.globalCompositeOperation = 'source-over';
  }
}

/* Um marco maior em cada parada: um anel até a luz chegar, uma luz depois */
function desenharParadas(ctx, alpha) {
  PARADAS.forEach(function (u) {
    const p = pontoNaTrilha(u);
    if (andado >= u - 0.0001) {
      ctx.globalCompositeOperation = 'lighter';
      pintarLuz(ctx, LUZ_CLARA, p.x, p.y, MARCO_ACESO, 0.6 * alpha);
      ctx.globalCompositeOperation = 'source-over';
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, MARCO, 0, Math.PI * 2);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = rgba(COR_CLARA, 0.4 * alpha);
      ctx.stroke();
    }
  });
}

/* O nome de cada lugar, embaixo do marco, surgindo quando a luz chega.
   Perto da beirada, ele entra na tela em vez de ser cortado */
function desenharNomes(ctx, agora, alpha) {
  ctx.font = '600 ' + LETRA + 'px Outfit, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  LUGARES.forEach(function (l, i) {
    if (chegouEm[i] === null) return;
    const surgiu = Math.min((agora - chegouEm[i]) / SURGIR, 1);
    const p = pontoNaTrilha(l.u);
    const texto = l.nome.toUpperCase();
    const metade = ctx.measureText(texto).width / 2 + 8;
    const x = Math.min(Math.max(p.x, metade), largura - metade);
    ctx.fillStyle = rgba(COR_CLARA, 0.75 * surgiu * alpha);
    ctx.fillText(texto, x, p.y + NOME_ABAIXO);
  });
}
