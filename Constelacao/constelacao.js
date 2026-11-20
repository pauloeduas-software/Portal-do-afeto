/* ================================================================
   constelacao.js — Constelação ✦
   Cada toque acende uma estrela onde o dedo encostou, ligada à
   anterior, e mostra um elogio. Depois do último, o desenho vira
   uma constelação com nome, e cada estrela guarda o seu elogio
   para reler.

     abertura    → toque              → desenhando (o céu acende e a
                                         primeira estrela também)
     desenhando  → último elogio      → completa
     completa    → toque              → constelacao
     constelacao → "Desenhar outra"   → desenhando

   Na constelação pronta, tocar numa estrela relê o elogio dela, e de
   tempos em tempos uma luz percorre o desenho sozinha.

   js/ceu.js          o quadro do céu, que junta os outros js/
   js/palco.js        o canvas e o tamanho da tela
   js/fundo.js        noite, nebulosa, estrelinhas e luzes do header
   js/cadentes.js     estrelas cadentes
   js/constelacao.js  as estrelas dela, as linhas e o encaixe no meio
   js/luz.js          a luz que percorre a constelação pronta, em loop
   js/cores.js        cores da página, lidas do CSS
   js/curvas.js       curvas de animação
   ================================================================ */

import {
  acenderEstrela, mostrarConstelacao, tocarEstrela, apagarConstelacao
} from './js/ceu.js';

/* Nome que aparece em cima da constelação pronta */
const NOME_CONSTELACAO = 'Nossa Constelação';

/* Folga entre as estrelas e o que está em volta delas (px) */
const FOLGA = 24;

const elogios = [
  "Você é fofa.",
  "Nosso senso de humor combina.",
  "Você é a melhor parte do meu dia.",
  "Amo seus olhos apaixonados.",
  "Adoro seu beijo.",
  "Seu abraço é o melhor.",
  "Sua voz é doce.",
  "Adoro seu sorriso.",
  "Eu amo a sua companhia.",
  "Você me faz passar o dia todo pensando em você.",
  "Você me faz rir.",
  "Você é muito estilosa.",
  "Nossa conversa encaixa.",
  "Você é única pra mim.",
  "Amo sua energia.",
  "Seu cabelo é lindo.",
  "Você tem mãos tão macias.",
  "Você é maravilhosa.",
  "Sua risada é perfeita.",
  "Você tem um sorriso lindo.",
  "Gosto de nós dois juntos.",
  "Você torna o meu mundo melhor.",
  "Gosto do seu jeitinho.",
  "Sua presença me alegra.",
  "Adoro a sua voz.",
  "Você é incrivelmente gentil.",
  "Você me acalma.",
  "Me sinto confortável com você.",
  "Você tem um jeito especial.",
  "Eu confio em você.",
];

const texto     = document.getElementById('compliment-text');
const aviso     = document.getElementById('aviso-texto');
const contador  = document.getElementById('contador');
const recomecar = document.getElementById('recomecar');
const titulo    = document.getElementById('titulo-final');
const nome      = document.getElementById('nome-constelacao');
const releitura = document.getElementById('releitura');
const lido      = document.getElementById('releitura-texto');
const barraTopo = document.querySelector('.top-nav');
/* O aviso de reler, guardado para voltar no recomeço */
const dicaReler = lido.firstElementChild;

/* 'abertura' | 'desenhando' | 'completa' | 'constelacao' */
let fase = 'abertura';
/* Elogios na ordem sorteada desta vez, e quantos já viraram estrela */
let fila = [];
let acesas = 0;
/* Quando o último elogio termina de surgir (0.3s + 0.8s): antes disso,
   toques rápidos levariam à constelação sem ele aparecer */
let prontaEm = 0;

function embaralhar(lista) {
  const copia = lista.slice();
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/* Troca em andamento de cada elemento: toques seguidos mostram só o último */
const trocas = new Map();

/* O texto some rápido e o novo surge crescendo de leve (.trocando no CSS).
   `depois` roda com o texto já apagado, para mudar o estilo sem pulo */
function trocarTexto(elemento, novo, depois) {
  clearTimeout(trocas.get(elemento));
  elemento.classList.add('trocando');
  trocas.set(elemento, setTimeout(function () {
    elemento.textContent = novo;
    if (depois) depois();
    elemento.classList.remove('trocando');
  }, 300));
}

/* Recomeço: nenhuma troca pendente escreve texto velho por cima */
function cancelarTrocas() {
  trocas.forEach(function (espera, elemento) {
    clearTimeout(espera);
    elemento.classList.remove('trocando');
  });
  trocas.clear();
}

function atualizarContador() {
  contador.textContent = '✦ ' + acesas + ' / ' + elogios.length;
}

/* Faixa entre a barra de cima e o pé da tela, onde as estrelas podem nascer */
function faixaLivre() {
  return {
    topo: barraTopo.getBoundingClientRect().bottom + FOLGA,
    base: window.innerHeight - FOLGA
  };
}

/* Espaço entre o nome e a releitura, onde a constelação pronta cabe */
function areaDaConstelacao() {
  const topo   = titulo.getBoundingClientRect().bottom + FOLGA;
  const base   = releitura.getBoundingClientRect().top - FOLGA;
  const margem = Math.max(FOLGA * 1.5, window.innerWidth * 0.06);
  return { x: margem, y: topo, w: window.innerWidth - 2 * margem, h: Math.max(base - topo, FOLGA) };
}

function acender(x, y) {
  const faixa = faixaLivre();
  const elogio = fila[acesas];
  acenderEstrela(x, Math.min(Math.max(y, faixa.topo), faixa.base), elogio);
  acesas++;
  trocarTexto(texto, elogio);
  atualizarContador();

  if (acesas === elogios.length) {
    fase = 'completa';
    prontaEm = performance.now() + 1100;
    trocarTexto(aviso, 'Dê mais um toque para ver o que você desenhou');
  }
}

function mostrarFinal() {
  if (performance.now() < prontaEm) return;
  fase = 'constelacao';
  document.body.classList.add('constelacao-pronta');
  mostrarConstelacao(areaDaConstelacao);
}

/* Primeiro toque: o céu acende junto com a primeira estrela, como a
   abertura promete ("Cada toque acende uma estrela") */
function abrir() {
  fase = 'desenhando';
  document.body.classList.remove('com-frase');
  trocarTexto(aviso, 'Dê um toque no céu');
}

function comecar() {
  cancelarTrocas();
  fila = embaralhar(elogios);
  acesas = 0;
  /* "Desenhar outra" volta a desenhar direto, sem abertura */
  if (fase !== 'abertura') fase = 'desenhando';
  apagarConstelacao();
  document.body.classList.remove('constelacao-pronta');
  texto.textContent = 'Cada toque acende uma estrela.';
  aviso.textContent = fase === 'abertura' ? 'Dê um toque na tela para começar' : 'Dê um toque no céu';
  lido.replaceChildren(dicaReler);
  lido.classList.remove('lendo');
  atualizarContador();
  /* O botão some: o foco nele faria o Espaço recomeçar de novo */
  recomecar.blur();
}

nome.textContent = NOME_CONSTELACAO;
comecar();

/* Clique em qualquer lugar fora da barra de cima */
document.addEventListener('click', function (e) {
  if (e.target.closest('.top-nav, a, button')) return;

  if (fase === 'abertura') abrir();
  if (fase === 'desenhando') {
    acender(e.clientX, e.clientY);
  } else if (fase === 'completa') {
    mostrarFinal();
  } else {
    const estrela = tocarEstrela(e.clientX, e.clientY);
    if (estrela) trocarTexto(lido, estrela.elogio, function () { lido.classList.add('lendo'); });
  }
});

/* Teclado (Espaço, Seta Direita, Enter): o mesmo que o toque, com a
   estrela num lugar sorteado. Tecla segurada e atalhos (Alt+Seta é
   voltar no navegador) ficam de fora */
document.addEventListener('keydown', function (e) {
  if (e.repeat || e.altKey || e.ctrlKey || e.metaKey) return;
  if (e.target.closest('a, button')) return;
  if (e.key !== ' ' && e.key !== 'ArrowRight' && e.key !== 'Enter') return;
  e.preventDefault();

  if (fase === 'abertura') abrir();
  if (fase === 'desenhando') {
    const faixa = faixaLivre();
    acender(
      window.innerWidth * (0.1 + Math.random() * 0.8),
      faixa.topo + Math.random() * (faixa.base - faixa.topo)
    );
  } else if (fase === 'completa') {
    mostrarFinal();
  }
});

recomecar.addEventListener('click', comecar);
