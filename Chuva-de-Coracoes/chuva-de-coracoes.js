/* ================================================================
   chuva-de-coracoes.js — Chuva de Corações 🌧💖
   O efeito de clique global já está em ../comum/toque.js. Este arquivo
   só conduz as fases da página; cada parte mora em js/:

     abertura         → toque         → chuva (o céu acende e o
                                         toque já solta o coração)
     chuva            → a pilha enche → cheia
     cheia            → o último pousa → frase
     frase            → toque         → juntando → grande
     grande           → toque         → explodindo → chuva

   js/ceu.js             céu de nuvens atrás de tudo (nuvens.js, relampago.js)
   js/palco.js           o canvas onde tudo é desenhado
   js/sprites.js         corações pré-desenhados
   js/chuva.js           corações que caem
   js/pilha.js           onde cada coração assenta na pilha
   js/coracao-grande.js  juntar, pulsar e explodir o coração grande
   js/formato-coracao.js pontos do formato de coração
   js/simbolos.js        ♡ ou ♥︎, conforme o painel
   js/painel.js          painel de configurações
   ================================================================ */

import { ajustarPalco, aoDesenhar, acordar, limparCamada, ctxPilha, pararDePulsar } from './js/palco.js';
import { pilha, zerarPilha } from './js/pilha.js';
import { caindo, desenharChuva, iniciarChuva, pararChuva } from './js/chuva.js';
import {
  juntarCoracoes, desenharJuntando, fixarCoracaoGrande,
  explodirCoracaoGrande, desenharExplodindo, removerCoracaoGrande
} from './js/coracao-grande.js';
import { iniciarPainel } from './js/painel.js';
import { fecharCeu } from './js/ceu.js';

/* O botão liga e desliga a chuva; a pilha cheia só a pausa */
let chuvaLigada = false;

/* 'chuva' | 'cheia' | 'frase' | 'juntando' | 'grande' | 'explodindo'
   ('cheia' é a espera até a frase aparecer: toque ainda não junta) */
let fase = 'chuva';

const frase      = document.getElementById('frase-pilha');
const avisoExplodir = document.getElementById('aviso-explodir');
const botaoChuva = document.getElementById('rain-btn');
const mensagemInicial = document.getElementById('mensagem-inicial');

/* O toque global (comum/toque.js) não solta coração enquanto isto estiver ligado */
function desligarToque(desligado) {
  if (desligado) document.body.dataset.toque = 'desligado';
  else delete document.body.dataset.toque;
}

function ligarChuva() {
  if (fase === 'chuva') iniciarChuva(aoEncherPilha);
}

/* Pilha cheia: a chuva para na hora e a frase espera os últimos pousarem
   (desenharQuadro) */
function aoEncherPilha() {
  pararChuva();
  fase = 'cheia';
  acordar();
}

/* A frase aparece no meio, por cima da pilha */
function mostrarFrase() {
  fase = 'frase';
  frase.classList.add('visivel');
  document.body.classList.add('com-frase');
}

/* Primeiro toque com a frase: todos os corações da pilha viram um coração grande */
function juntar() {
  fase = 'juntando';
  desligarToque(true);
  frase.classList.remove('visivel');
  document.body.classList.remove('com-frase');

  /* Na frase todos já pousaram: a pilha tem todos os corações */
  const todos = pilha.coracoes;
  pilha.coracoes = [];
  limparCamada(ctxPilha);
  juntarCoracoes(todos, pilha.unidade, performance.now());
  acordar();
}

/* Segundo toque: o coração grande explode e tudo recomeça */
function explodir() {
  fase = 'explodindo';
  desligarToque(false);
  avisoExplodir.classList.remove('visivel');
  explodirCoracaoGrande(performance.now(), pararDePulsar());
  acordar();
}

/* Sem pilha, sem frase, sem coração grande. A chuva volta se estiver ligada */
function recomecar() {
  pararChuva();
  pararDePulsar();
  removerCoracaoGrande();
  caindo.length = 0;
  limparCamada(ctxPilha);
  frase.classList.remove('visivel');
  document.body.classList.remove('com-frase');
  avisoExplodir.classList.remove('visivel');
  desligarToque(false);
  zerarPilha();
  fase = 'chuva';
  if (chuvaLigada) ligarChuva();
  acordar();
}

/* Um quadro do palco. Devolve true enquanto houver movimento */
function desenharQuadro(agora, ctx) {
  const chovendo = desenharChuva(agora, ctx);
  if (fase === 'cheia' && !chovendo) mostrarFrase();

  if (fase === 'juntando') {
    if (!desenharJuntando(ctx, agora)) return true;
    /* Formado: o palco para de redesenhar e o pulso fica com o CSS */
    fixarCoracaoGrande();
    fase = 'grande';
    avisoExplodir.classList.add('visivel');
    return false;
  }
  if (fase === 'explodindo') {
    if (desenharExplodindo(ctx, agora)) recomecar();
    return true;
  }
  return chovendo;
}

/* Fim da abertura: o céu acende. O mesmo toque já solta o coração
   (comum/toque.js), como a abertura promete. Só na primeira vez: o botão da
   chuva chama de novo, e com a frase da pilha o céu fica escuro */
function esconderMensagemInicial() {
  if (mensagemInicial.classList.contains('escondida')) return;
  mensagemInicial.classList.add('escondida');
  document.body.classList.remove('com-frase');
}

function alternarChuva() {
  chuvaLigada = !chuvaLigada;
  fecharCeu(chuvaLigada);
  /* Ligar a chuva pelo teclado também tira a mensagem do caminho */
  esconderMensagemInicial();
  if (chuvaLigada) ligarChuva();
  else pararChuva();
  botaoChuva.setAttribute('aria-pressed', chuvaLigada);
  botaoChuva.querySelector('.icone').textContent  = chuvaLigada ? '❤️' : '🌧️';
  botaoChuva.querySelector('.rotulo').textContent = chuvaLigada ? 'Parar Chuva de Amor' : 'Iniciar Chuva de Amor';
}

/* O toque na página: junta a pilha ou explode o coração grande */
function tocar() {
  if (fase === 'frase') juntar();
  else if (fase === 'grande') explodir();
}

/* --- Inicialização (módulos rodam com o HTML já carregado) --- */

ajustarPalco();
zerarPilha();
aoDesenhar(desenharQuadro);
iniciarPainel();
botaoChuva.addEventListener('click', alternarChuva);

/* Esconde a mensagem inicial no primeiro toque fora da nav e do painel.
   No pointerdown, não no click: segurar não gera click, e quem seguisse
   a mensagem e segurasse continuaria com ela na tela */
document.addEventListener('pointerdown', function esconderNoToque(e) {
  if (e.target.closest('.top-nav, .settings-panel')) return;
  esconderMensagemInicial();
  document.removeEventListener('pointerdown', esconderNoToque);
});

/* Toque fora da nav e do painel */
document.addEventListener('click', function (e) {
  if (e.target.closest('.top-nav, .settings-panel, a, button')) return;
  tocar();
});

/* Teclado (Espaço, Seta Direita, Enter): o mesmo que o toque. Tecla
   segurada e atalhos (Alt+Seta é voltar no navegador) ficam de fora */
document.addEventListener('keydown', function (e) {
  if (e.repeat || e.altKey || e.ctrlKey || e.metaKey) return;
  if (e.target.closest('a, button')) return;
  if (e.key !== ' ' && e.key !== 'ArrowRight' && e.key !== 'Enter') return;
  e.preventDefault();
  esconderMensagemInicial();
  tocar();
});

/* Girou o celular: a pilha e a frase somem e a chuva continua */
window.addEventListener('resize', function () {
  if (window.innerWidth === pilha.largura && Math.abs(window.innerHeight - pilha.altura) < 120) return;
  ajustarPalco();
  recomecar();
});
