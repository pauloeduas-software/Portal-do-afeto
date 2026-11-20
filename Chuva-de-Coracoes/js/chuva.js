/* ================================================================
   chuva.js — Os corações que caem
   Cada coração sorteia tamanho, ritmo e giro, e já nasce sabendo onde
   vai parar na pilha. A posição em cada quadro sai do tempo desde que
   ele nasceu.
   ================================================================ */

import { pilha, escolherLugar } from './pilha.js';
import { simboloDaChuva, CORACAO_CONTORNO, CORACAO_PREENCHIDO } from './simbolos.js';
import { spriteDe, BRILHOS } from './sprites.js';
import { desenharCoracao, ctxPilha, acordar } from './palco.js';

/* A chuva enche a tela em uns 25s, em qualquer tamanho de tela: o
   ritmo sai de quantos corações cabem nela. Os últimos saem aos 22s e
   ainda levam um pouco para cair */
const TEMPO_ENCHER = 22000;

/* Começa fina (30% do ritmo) e engrossa até o ritmo cheio em 6s */
const COMECO = 0.3;
const RAMPA  = 6000;

/* De quanto em quanto tempo a chuva solta os corações devidos */
const INTERVALO = 60;

/* Tamanho em unidades de --coracao-unidade: um sorteio vezes o outro */
const TAMANHO = [0.7, 2.8];
const ESCALA  = [0.5, 1.5];

/* Quanto da tela os discos da pilha cobrem quando ela enche (medido
   simulando a pilha; quase igual do celular ao computador) */
const DENSIDADE = 0.7;

/* Corações no ar */
export const caindo = [];

let intervalo = null;
let inicio    = 0;
let ultimo    = 0;
let devendo   = 0;   // corações a soltar no próximo intervalo
let pico      = 0;   // corações por ms no ritmo cheio

function sorteio(de, ate) {
  return de + Math.random() * (ate - de);
}

/* Média de x² com x sorteado entre `de` e `ate` */
function mediaDoQuadrado(de, ate) {
  return (ate * ate * ate - de * de * de) / (3 * (ate - de));
}

/* Quantos corações cabem na tela: a área coberta pela pilha cheia sobre
   a área média do disco de um coração */
function capacidadeDaTela() {
  const raio = (spriteDe(CORACAO_CONTORNO, 0).raio + spriteDe(CORACAO_PREENCHIDO, 0).raio) / 2;
  const tamanho2 = pilha.unidade * pilha.unidade
    * mediaDoQuadrado(TAMANHO[0], TAMANHO[1]) * mediaDoQuadrado(ESCALA[0], ESCALA[1]);
  return DENSIDADE * pilha.largura * pilha.altura / (Math.PI * raio * raio * tamanho2);
}

/* Corações por ms, `t` ms depois de a chuva ligar */
function ritmo(t) {
  return pico * (COMECO + (1 - COMECO) * Math.min(t / RAMPA, 1));
}

/* Cria um coração da chuva. Devolve true se a pilha encheu */
export function criarCoracaoDaChuva() {
  const sprite = spriteDe(simboloDaChuva(), Math.floor(Math.random() * BRILHOS.length));

  /* Tamanhos variados: sensação de profundidade */
  const tamanho = pilha.unidade * sorteio(TAMANHO[0], TAMANHO[1]) * sorteio(ESCALA[0], ESCALA[1]);

  /* Sem lugar na pilha, o coração nem nasce: perto do topo a chuva vai
     afinando sozinha e, quando enche, não sobra ninguém no ar sem destino */
  const lugar = escolherLugar(sprite.raio * tamanho);
  if (!lugar) return pilha.cheia;

  /* Atravessar a tela (110% da altura) leva de 4s a 7s */
  const velocidade = pilha.altura * 1.1 / sorteio(4, 7);

  const c = {
    sprite:  sprite,
    tamanho: tamanho,
    inicio:  performance.now(),
    y0:      -tamanho,
    deriva:  sorteio(0.5, 2.5) * 16,   // amplitude do vai-e-vem lateral (px)
    giro:    0,
    alpha:   0,
    x0:      lugar.x,
    y1:      lugar.y,
    giroFinal: sorteio(-12, 12)   // parado, gira pouco
  };
  pilha.coracoes.push(c);
  c.tempo = (c.y1 - c.y0) / velocidade * 1000;

  /* Vai-e-vem com um número inteiro de meias-voltas: chega no lugar
     exatamente no meio do balanço, sem tranco */
  const meiaVolta = sorteio(1200, 2800);
  c.meiaVolta = c.tempo / Math.max(1, Math.round(c.tempo / meiaVolta));

  caindo.push(c);
  acordar();
  return pilha.cheia;
}

/* Brilho: aparece nos primeiros 8% da queda */
function transparencia(p) {
  return Math.min(p / 0.08, 1);
}

/* Move e desenha quem está caindo; quem pousa vai para a camada da pilha.
   Devolve true se ainda há coração no ar */
export function desenharChuva(agora, ctx) {
  let restam = 0;
  for (let i = 0; i < caindo.length; i++) {
    const c = caindo[i];
    const t = Math.max(0, agora - c.inicio);
    const p = Math.min(t / c.tempo, 1);
    c.x = c.x0 + c.deriva * Math.sin(Math.PI * t / c.meiaVolta);
    c.y = c.y0 + (c.y1 - c.y0) * p;
    c.giro  = c.giroFinal * p;
    c.alpha = transparencia(p);

    if (p >= 1) {
      c.x = c.x0;
      desenharCoracao(ctxPilha, c);
      /* A pilha já foi copiada neste quadro: o que pousa agora vai
         direto na tela também */
      desenharCoracao(ctx, c);
      continue;
    }
    caindo[restam++] = c;
  }
  caindo.length = restam;

  caindo.forEach(function (c) { desenharCoracao(ctx, c); });
  return restam > 0;
}

/* Liga a chuva; `aoEncher` é chamado quando a pilha enche */
export function iniciarChuva(aoEncher) {
  if (intervalo) return;
  /* Soma do ritmo de 0 a TEMPO_ENCHER = capacidade da tela */
  pico    = capacidadeDaTela() / (TEMPO_ENCHER - (1 - COMECO) * RAMPA / 2);
  inicio  = ultimo = performance.now();
  devendo = 1;   // o primeiro sai logo no primeiro intervalo
  intervalo = setInterval(function () {
    const agora = performance.now();
    /* Aba em segundo plano atrasa o intervalo: sem o teto, na volta
       cairia tudo de uma vez */
    devendo += ritmo(agora - inicio) * Math.min(agora - ultimo, 250);
    ultimo = agora;
    for (; devendo >= 1; devendo--) {
      if (criarCoracaoDaChuva()) {
        aoEncher();
        return;
      }
    }
  }, INTERVALO);
}

export function pararChuva() {
  clearInterval(intervalo);
  intervalo = null;
}
