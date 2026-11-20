/* ================================================================
   comum/camada-toque.js — Canvas por cima da página para os corações
   do toque. Só desenha enquanto houver coração na tela; parado, não
   custa nada.
   ================================================================ */

const GRAU = Math.PI / 180;

const canvas = document.createElement('canvas');
canvas.className = 'camada-toque';
canvas.setAttribute('aria-hidden', 'true');
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

let escalaTela = 1;

/* Cada efeito é uma função (agora) que desenha um quadro e devolve
   false quando acabou */
const efeitos = new Set();
let rodando = false;

/* Acompanha o tamanho da tela; nítido em telas de alta densidade */
function ajustar() {
  escalaTela = Math.min(window.devicePixelRatio || 1, 1.5);
  canvas.width  = Math.round(window.innerWidth * escalaTela);
  canvas.height = Math.round(window.innerHeight * escalaTela);
}

ajustar();
window.addEventListener('resize', ajustar);

/* Um coração { sprite, x, y (px), tamanho (px da fonte), giro (graus), alpha } */
export function desenhar(c) {
  const k   = c.tamanho * escalaTela / c.sprite.fonte;
  const cos = Math.cos(c.giro * GRAU) * k;
  const sin = Math.sin(c.giro * GRAU) * k;
  const img = c.sprite.imagem;
  ctx.setTransform(cos, sin, -sin, cos, c.x * escalaTela, c.y * escalaTela);
  ctx.globalAlpha = c.alpha;
  ctx.drawImage(img, -img.width / 2, -img.height / 2);
}

export function animar(efeito) {
  efeitos.add(efeito);
  if (rodando) return;
  rodando = true;
  requestAnimationFrame(quadro);
}

function quadro(agora) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  efeitos.forEach(function (efeito) {
    if (!efeito(agora)) efeitos.delete(efeito);
  });
  rodando = efeitos.size > 0;
  if (rodando) requestAnimationFrame(quadro);
}
