/* ================================================================
   palco.js — O canvas onde tudo é desenhado
   Um quadro por vez (requestAnimationFrame), só enquanto houver algo
   se mexendo. A pilha parada fica numa camada à parte, desenhada uma
   vez só: cada quadro apenas a copia.
   ================================================================ */

const GRAU = Math.PI / 180;

const canvas = document.getElementById('palco');
const ctx    = canvas.getContext('2d');

/* Camada da pilha: corações que já pousaram */
const camadaPilha = document.createElement('canvas');
export const ctxPilha = camadaPilha.getContext('2d');

let escalaTela = 1;
let aCadaQuadro = null;
let rodando = false;

/* Acompanha o tamanho da tela; nítido em telas de alta densidade */
export function ajustarPalco() {
  escalaTela = Math.min(window.devicePixelRatio || 1, 1.5);
  canvas.width  = camadaPilha.width  = Math.round(window.innerWidth * escalaTela);
  canvas.height = camadaPilha.height = Math.round(window.innerHeight * escalaTela);
  /* Tamanho fixo em px: se a tela mudar pouco (a pilha não recomeça),
     o desenho fica do tamanho dele em vez de esticar */
  canvas.style.width  = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
}

export function limparCamada(alvo) {
  alvo.setTransform(1, 0, 0, 1, 0, 0);
  alvo.globalAlpha = 1;
  alvo.clearRect(0, 0, alvo.canvas.width, alvo.canvas.height);
}

/* Um coração { sprite, x, y (px), tamanho (px da fonte), giro (graus), alpha } */
export function desenharCoracao(alvo, c) {
  const k   = c.tamanho * escalaTela / c.sprite.fonte;
  const cos = Math.cos(c.giro * GRAU) * k;
  const sin = Math.sin(c.giro * GRAU) * k;
  const img = c.sprite.imagem;
  alvo.setTransform(cos, sin, -sin, cos, c.x * escalaTela, c.y * escalaTela);
  alvo.globalAlpha = c.alpha;
  alvo.drawImage(img, -img.width / 2, -img.height / 2);
}

/* Pulso do coração grande: o canvas parado aumenta e diminui pelo CSS,
   sem redesenhar nada (.palco.pulsando em chuva-de-coracoes.css) */
export function pulsar(cx, cy) {
  canvas.style.transformOrigin = cx + 'px ' + cy + 'px';
  canvas.classList.add('pulsando');
}

/* Para o pulso e devolve o tamanho em que ele estava (1 a 1.06) */
export function pararDePulsar() {
  const zoom = new DOMMatrix(getComputedStyle(canvas).transform).a || 1;
  canvas.classList.remove('pulsando');
  return zoom;
}

/* `funcao(agora, ctx)` desenha um quadro e devolve true se ainda há
   movimento; quando devolve false o palco para até o próximo acordar() */
export function aoDesenhar(funcao) {
  aCadaQuadro = funcao;
}

export function acordar() {
  if (rodando) return;
  rodando = true;
  requestAnimationFrame(quadro);
}

function quadro(agora) {
  limparCamada(ctx);
  ctx.drawImage(camadaPilha, 0, 0);
  rodando = aCadaQuadro(agora, ctx);
  if (rodando) requestAnimationFrame(quadro);
}
