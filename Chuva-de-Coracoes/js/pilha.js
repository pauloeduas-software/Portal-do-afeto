/* ================================================================
   pilha.js — A pilha de corações que cobre a tela
   Cada coração é tratado como um disco. Antes de cair ele já sabe
   onde vai parar: testa alguns lugares, desce cada um até encostar
   em quem está embaixo e fica com o encaixe mais baixo — como
   bolinhas assentando num pote. Ninguém entra em ninguém.
   ================================================================ */

import { medirUnidade } from '../../comum/sprites-coracao.js';

/* Quantos pontos de partida sorteia e quantos encaixes testa em volta de cada */
const PARTIDAS = 2;
const ENCAIXES = 5;

/* A pilha conta como cheia quando, das últimas JANELA tentativas, 70%
   não acharam lugar. Contar falhas seguidas arrastava o fim: um coração
   pequeno que ainda cabia zerava a conta. Simulado, para com ~97% dos
   corações no lugar e corta ~15% do tempo */
const JANELA        = 40;
const LIMITE_FALHAS = 0.7;

export const pilha = {
  largura:  0,
  altura:   0,
  unidade:  16,   // valor em px de --coracao-unidade (comum/estilo.css)
  coracoes: [],   // corações que já pousaram ou estão caindo para ela
  cheia:    false
};

/* Discos guardados em faixas verticais da tela, para só olhar os vizinhos */
let faixas = [];
let larguraFaixa = 1;
let maiorRaio = 0;
let ultimas = [];   // true = achou lugar, das tentativas mais recentes
let falhas = 0;     // quantas de `ultimas` não acharam

export function zerarPilha() {
  pilha.coracoes = [];
  pilha.cheia    = false;
  pilha.unidade  = medirUnidade();
  pilha.largura  = window.innerWidth;
  pilha.altura   = window.innerHeight;
  larguraFaixa   = pilha.unidade * 3;
  faixas   = Array.from({ length: Math.ceil(pilha.largura / larguraFaixa) + 1 }, function () { return []; });
  maiorRaio = 0;
  ultimas   = [];
  falhas    = 0;
}

function anotarTentativa(achou) {
  ultimas.push(achou);
  if (!achou) falhas++;
  if (ultimas.length > JANELA && !ultimas.shift()) falhas--;
  if (ultimas.length === JANELA && falhas >= JANELA * LIMITE_FALHAS) pilha.cheia = true;
}

/* Altura do centro (px acima do chão) de um disco de raio `r` solto em `x`:
   desce até encostar no chão ou no disco mais alto que ele tocar */
function alturaDePouso(x, r) {
  let altura = r;
  const de  = Math.max(0, Math.floor((x - r - maiorRaio) / larguraFaixa));
  const ate = Math.min(faixas.length - 1, Math.floor((x + r + maiorRaio) / larguraFaixa));
  for (let f = de; f <= ate; f++) {
    for (const d of faixas[f]) {
      const dx = Math.abs(x - d.x);
      const encosta = r + d.r;
      if (dx < encosta) altura = Math.max(altura, d.y + Math.sqrt(encosta * encosta - dx * dx));
    }
  }
  return altura;
}

/* Lugar de um coração de raio `r` (px), ou null se não cabe mais.
   O coração inteiro fica dentro da tela: nem metade para fora nos lados
   nem cortado no topo. Devolve { x, y } com y medido do topo da tela */
export function escolherLugar(r) {
  let melhor = null;
  for (let p = 0; p < PARTIDAS; p++) {
    const partida = r + Math.random() * (pilha.largura - 2 * r);
    for (let e = 0; e < ENCAIXES; e++) {
      const x = Math.min(Math.max(partida + (e - (ENCAIXES - 1) / 2) * r * 0.5, r), pilha.largura - r);
      const y = alturaDePouso(x, r);
      if (!melhor || y < melhor.y) melhor = { x: x, y: y };
    }
  }

  /* O topo do coração precisa ficar dentro da tela */
  if (melhor.y + r > pilha.altura) {
    anotarTentativa(false);
    return null;
  }

  anotarTentativa(true);
  maiorRaio = Math.max(maiorRaio, r);
  faixas[Math.floor(melhor.x / larguraFaixa)].push({ x: melhor.x, y: melhor.y, r: r });
  return { x: melhor.x, y: pilha.altura - melhor.y };
}
