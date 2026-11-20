/* ================================================================
   comum/sprites-coracao.js — Corações desenhados uma vez numa imagem
   Usado pelo toque (toque.js) e pela Chuva de Corações: depois de
   pronto, cada coração só é copiado no canvas, o que é bem mais leve
   que criar um elemento da página para cada um.
   ================================================================ */

import { lerCor } from './cores.js';

export const CORACAO_CONTORNO   = '♡';
export const CORACAO_PREENCHIDO = '♥︎';

/* Tamanho padrão da fonte dos desenhos, em px de tela */
const FONTE = 96;

export function corDaPagina(brilho) {
  const cor = getComputedStyle(document.documentElement).getPropertyValue('--page-accent').trim() || '#ec4899';
  const rgb = lerCor(cor).map(function (v) { return Math.min(255, Math.round(v * brilho)); });
  return 'rgb(' + rgb.join(',') + ')';
}

/* Desenha o símbolo com o centro do desenho no centro da imagem.
   `raio` é o raio do círculo que o coração ocupa, em frações da fonte */
export function desenharSprite(simbolo, cor, fonteBase) {
  const fonte   = (fonteBase || FONTE) * Math.min(window.devicePixelRatio || 1, 2);
  const familia = getComputedStyle(document.body).fontFamily;

  const medidor = document.createElement('canvas').getContext('2d');
  medidor.font = fonte + 'px ' + familia;
  const m = medidor.measureText(simbolo);
  const largura = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
  const altura  = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
  const margem  = fonte * 0.7;   // espaço para o brilho

  const imagem = document.createElement('canvas');
  imagem.width  = Math.ceil(largura + margem * 2);
  imagem.height = Math.ceil(altura + margem * 2);
  const ctx = imagem.getContext('2d');
  ctx.font = medidor.font;
  ctx.fillStyle = cor;
  ctx.shadowColor = cor;

  /* Brilho em volta, em duas camadas, como um text-shadow */
  const x = margem + m.actualBoundingBoxLeft;
  const y = margem + m.actualBoundingBoxAscent;
  [[0.62, 0.35], [0.31, 0.6]].forEach(function (camada) {
    ctx.shadowBlur = fonte * camada[0];
    ctx.globalAlpha = camada[1];
    ctx.fillText(simbolo, x, y);
  });
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.fillText(simbolo, x, y);

  return { imagem: imagem, fonte: fonte, raio: Math.max(largura, altura) / fonte / 2 };
}

/* Valor em px de --coracao-unidade (estilo.css), que muda com a tela */
export function medirUnidade() {
  const sonda = document.createElement('div');
  sonda.style.cssText = 'position:absolute;visibility:hidden;width:var(--coracao-unidade)';
  document.body.appendChild(sonda);
  const largura = sonda.getBoundingClientRect().width;
  sonda.remove();
  return largura || 16;
}
