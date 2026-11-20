/* ================================================================
   nuvens.js — Nuvens macias no alto da tela
   Cada nuvem é um punhado de bolas desfocadas, pintado uma vez numa
   imagem à parte em duas versões: clara (fim de tarde, rosa e lilás)
   e escura (de chuva). Em cada quadro ela só anda para o lado, e as
   duas versões se misturam conforme o céu fecha.
   ================================================================ */

const QUANTAS = 14;
/* Velocidade da nuvem mais longe e da mais perto (px por segundo) */
const VELOCIDADE_LONGE = 4;
const VELOCIDADE_PERTO = 14;

/* Tons da nuvem clara (rosa, magenta claro, lilás) e da de chuva */
const CLARAS = [[249, 168, 212], [240, 171, 252], [196, 181, 253]];
const ESCURA = [125, 48, 110];

/* Céu aberto mostra só parte das nuvens; fechando, as outras chegam.
   Cada nuvem aparece quando o céu passa do seu limiar, aos poucos */
const SURGIR = 0.25;

const nuvens = [];

/* Bolas da nuvem, em fração da imagem: mais altas e maiores no meio */
function sortearBolas() {
  const bolas = [];
  const quantas = 6 + Math.floor(Math.random() * 4);
  for (let i = 0; i < quantas; i++) {
    const meio = 1 - Math.abs(i / (quantas - 1) - 0.5) * 2;  // 0 nas pontas, 1 no meio
    bolas.push({
      x: 0.15 + 0.7 * i / (quantas - 1) + (Math.random() - 0.5) * 0.06,
      y: 0.62 - meio * 0.18 + (Math.random() - 0.5) * 0.08,
      r: 0.22 + meio * 0.16 + Math.random() * 0.06
    });
  }
  return bolas;
}

/* Pinta a nuvem numa imagem à parte, na cor dada. Em 1 px por px de
   tela mesmo em tela densa: desfocada, não perde nada e gasta 4× menos */
function pintar(bolas, w, h, rgb) {
  const imagem = document.createElement('canvas');
  imagem.width  = Math.round(w);
  imagem.height = Math.round(h);
  const c = imagem.getContext('2d');
  const cor = 'rgba(' + rgb.join(',') + ',';
  bolas.forEach(function (b) {
    const x = b.x * w;
    const y = b.y * h;
    const r = b.r * h;
    const bola = c.createRadialGradient(x, y, 0, x, y, r);
    bola.addColorStop(0, cor + '0.55)');
    bola.addColorStop(0.5, cor + '0.35)');
    bola.addColorStop(1, cor + '0)');
    c.fillStyle = bola;
    c.fillRect(x - r, y - r, r * 2, r * 2);
  });
  return imagem;
}

/* Sorteia as nuvens de novo para o tamanho da tela; da mais longe
   (pequena, lenta, apagada) para a mais perto, que é desenhada por cima */
export function criarNuvens(tela) {
  /* Zerar as imagens velhas devolve a memória logo (o iPhone demora) */
  nuvens.forEach(function (n) { n.clara.width = n.escura.width = 0; });
  nuvens.length = 0;
  for (let i = 0; i < QUANTAS; i++) {
    const perto = i / (QUANTAS - 1);
    const w = Math.max(tela.largura * (0.3 + perto * 0.25), 220) * (0.85 + Math.random() * 0.3);
    const h = w * 0.45;
    const bolas = sortearBolas();
    nuvens.push({
      x0: Math.random() * (tela.largura + w),
      y: tela.altura * (0.28 * Math.random()) - h * 0.45,
      w: w,
      h: h,
      velocidade: VELOCIDADE_LONGE + (VELOCIDADE_PERTO - VELOCIDADE_LONGE) * perto,
      alpha: 0.2 + perto * 0.3,
      /* Uma a cada três fica sempre; as outras chegam com o céu fechando */
      limiar: i % 3 === 0 ? -SURGIR : Math.random() * 0.75,
      clara: pintar(bolas, w, h, CLARAS[i % CLARAS.length]),
      escura: pintar(bolas, w, h, ESCURA)
    });
  }
}

/* fechado: de 0 (céu aberto) a 1 (céu de chuva) */
export function desenharNuvens(ctx, agora, fechado, tela) {
  nuvens.forEach(function (n) {
    const surgiu = Math.min(Math.max((fechado - n.limiar) / SURGIR, 0), 1);
    if (surgiu <= 0) return;

    /* Anda para a direita e volta pela esquerda */
    const volta = tela.largura + n.w;
    const x = (n.x0 + n.velocidade * agora / 1000) % volta - n.w;

    /* A versão que não aparece (a escura com o céu aberto) nem é desenhada */
    const clara  = n.alpha * surgiu * (1 - fechado * 0.85);
    const escura = Math.min(n.alpha * surgiu * fechado * 1.3, 1);
    if (clara > 0.01) {
      ctx.globalAlpha = clara;
      ctx.drawImage(n.clara, x, n.y, n.w, n.h);
    }
    if (escura > 0.01) {
      ctx.globalAlpha = escura;
      ctx.drawImage(n.escura, x, n.y, n.w, n.h);
    }
  });
  ctx.globalAlpha = 1;
}
