/* ================================================================
   primeiro-encontro.js — Primeiro Encontro 🗺️
   Conta a noite do primeiro encontro. Uma luz anda por um caminho de
   pedrinhas que passa pelos lugares daquela noite, como num mapa; a
   cada toque ela vai até a próxima parada, o nome do lugar aparece e
   vem o momento que aconteceu ali. No fim do caminho, a luz voa até
   o vão de um coração, as pedrinhas voam até o contorno dele e a
   linha se desenha; o coração acende, começa a pulsar e a luz se
   apaga dentro dele. O header conta há quantos dias foi.

     inicio   → toque                  → andando
     andando  → a luz chega            → frase (ou virando, na última)
     frase    → toque                  → andando
     virando  → o caminho vira coração → encontro
     encontro → o coração acende       → fim
     fim      → toque                  → esconde ou mostra a frase final

   js/ceu.js       o quadro da tela, que junta os outros js/
   js/palco.js     o canvas, o tamanho da tela e a altura do header
   js/fundo.js     a noite quente de luzes desfocadas
   js/trilha.js    o caminho pelos lugares da noite
   js/coracao.js   o contorno do coração
   js/caminho.js   a luz, as pedrinhas, os nomes e o caminho virando coração
   js/brilho.js    o coração aceso: clarão, coraçõezinhos e pulso
   js/cores.js     cores da página, lidas do CSS
   ================================================================ */

import { PARADAS, fracaoDoCaminho, colocarEm, andarAte, virarCoracao, apagarLuz, acenderCoracao } from './js/ceu.js';

/* A noite, na ordem em que aconteceu: uma frase por parada do
   caminho (PARADAS em js/trilha.js), a última no fim dele */
const mensagens = [
  {
    titulo: 'Você se atrasou, e eu fiquei lá fora te esperando.',
    sub: 'Hoje a gente ri disso. Naquela noite, eu só queria te ver.'
  },
  {
    titulo: 'Até que a porta abriu.',
    sub: 'Vestido azul, sobretudo preto e um saltinho branco. Valeu cada minuto.'
  },
  {
    titulo: 'No parque, as árvores seguravam a chuva fininha.',
    sub: 'E a gente conversava sobre tudo, sem ver o tempo passar.'
  },
  {
    titulo: 'Então eu coloquei a música clássica e o clima mudou completamente.',
    sub: 'As primeiras notas tocaram e a nossa noite ganhou trilha sonora.'
  },
  {
    titulo: 'E abrimos um Pergola, o nosso primeiro vinho.',
    sub: 'Bebemos debaixo das árvores, entre uma conversa e outra. A garrafa eu guardo até hoje, como quem guarda o começo de uma história.'
  },
  {
    titulo: 'A chuva engrossou, e eu peguei na sua mão.',
    sub: 'Fomos correndo até o carro, rindo, só um pouquinho molhados.'
  },
  {
    titulo: 'No carro, a chuva batia no vidro.',
    sub: 'E a música clássica seguia tocando baixinho, embalando cada palavra.'
  },
  {
    titulo: 'Tocava Prologue quando eu te beijei.',
    sub: 'Nosso primeiro beijo, com trilha sonora e tudo.'
  },
  {
    titulo: 'A chuva passou, e fomos jantar no Outback.',
    sub: 'Batata frita, a sua favorita, e tiramos fotos de nós dois.'
  },
  {
    titulo: 'De volta ao parque, começamos a andar pelo lago.',
    sub: 'Não queríamos que a noite acabasse.'
  },
  {
    titulo: 'Te peguei no colo, já que o seu pezinho doía.',
    sub: 'E eu te carreguei até o final do lago, com muito carinho.'
  },
  {
    titulo: 'Te levei para casa, mas ainda não dava para dizer tchau.',
    sub: 'Mais conversa e mais beijos no carro... e foi assim que tudo começou, vidinha.'
  }
];

/* O dia do primeiro encontro (o mês do Date começa em 0: 10 é novembro) */
const PRIMEIRO_ENCONTRO = new Date(2025, 10, 8);

/* Quanto a luz levaria para andar o caminho todo, e o mínimo e o
   máximo de um trecho (ms): os trechos longos levam mais tempo, sem
   ficar devagar demais nem rápido demais */
const ANDAR_TUDO = 13000;
const ANDAR = [1200, 3200];
/* Quanto o caminho leva para virar coração: a luz voa até o vão, as
   pedrinhas voam até o contorno e a linha se desenha (ms) */
const VIRAR = 4200;
/* Do encontro até a frase final: o coração acende e pulsa sozinho (ms) */
const CORACAO_SOZINHO = 2400;
/* A frase leva 0.8s para surgir: antes disso o toque não conta */
const SURGIR = 800;

const camada = document.getElementById('mensagem');
const titulo = document.getElementById('frase');
const sub    = document.getElementById('frase-sub');
const aviso  = document.getElementById('aviso');
const dias   = document.getElementById('dias');

/* 'inicio' | 'andando' | 'frase' | 'virando' | 'encontro' | 'fim' */
let fase = 'inicio';
/* Quantas frases já apareceram */
let passo = 0;
let prontaEm = 0;

/* Conta pelo dia do calendário, não pelas horas: o arredondamento
   cobre o dia de 23 ou 25 horas do horário de verão */
function textoDosDias() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const n = Math.round((hoje - PRIMEIRO_ENCONTRO) / 86400000);
  if (n <= 0) return 'Primeiro encontro hoje';
  if (n === 1) return 'Primeiro encontro ontem';
  return 'Primeiro encontro há ' + n.toLocaleString('pt-BR') + ' dias';
}

/* A frase surge e o fundo escurece para ela (.com-frase) */
function mostrarFrase(mensagem, ultima) {
  titulo.textContent = mensagem.titulo;
  sub.textContent = mensagem.sub || '';
  sub.hidden = !mensagem.sub;
  /* Na última não há próximo toque */
  aviso.hidden = ultima;
  aviso.textContent = 'Dê mais um toque na tela';
  camada.classList.add('visivel');
  document.body.classList.add('com-frase');
  prontaEm = performance.now() + SURGIR;
}

function esconderFrase() {
  camada.classList.remove('visivel');
  document.body.classList.remove('com-frase');
}

/* A frase some, a luz anda e, quando chegam, vem a próxima */
function avancar() {
  passo++;
  fase = 'andando';
  esconderFrase();
  const ultima = passo === mensagens.length;
  const de = fracaoDoCaminho(passo > 1 ? PARADAS[passo - 2] : 0);
  const ate = fracaoDoCaminho(PARADAS[passo - 1]);
  const duracao = Math.min(Math.max((ate - de) * ANDAR_TUDO, ANDAR[0]), ANDAR[1]);
  andarAte(PARADAS[passo - 1], duracao, ultima ? virar : chegar);
}

function chegar() {
  fase = 'frase';
  mostrarFrase(mensagens[passo - 1], false);
}

/* A luz chegou ao fim do caminho: ele vira coração */
function virar() {
  fase = 'virando';
  virarCoracao(VIRAR, encontrar);
}

/* O coração se fechou: ele pulsa um pouco sozinho antes da frase */
function encontrar() {
  fase = 'encontro';
  acenderCoracao();
  apagarLuz();
  setTimeout(function mostrarFraseFinal() {
    fase = 'fim';
    mostrarFrase(mensagens[mensagens.length - 1], true);
  }, CORACAO_SOZINHO);
}

/* No fim, o toque deixa ver o coração sem a frase, e a traz de volta */
function alternarFraseFinal() {
  if (camada.classList.contains('visivel')) esconderFrase();
  else mostrarFrase(mensagens[mensagens.length - 1], true);
}

function tocar() {
  if (performance.now() < prontaEm) return;
  if (fase === 'inicio' || fase === 'frase') avancar();
  else if (fase === 'fim') alternarFraseFinal();
}

colocarEm(0);
dias.textContent = textoDosDias();

/* Toque fora do header */
document.addEventListener('click', function (e) {
  if (e.target.closest('.top-nav, a, button')) return;
  tocar();
});

/* Teclado (Espaço, Seta Direita, Enter): o mesmo que o toque. Tecla
   segurada e atalhos (Alt+Seta é voltar no navegador) ficam de fora */
document.addEventListener('keydown', function (e) {
  if (e.repeat || e.altKey || e.ctrlKey || e.metaKey) return;
  if (e.target.closest('a, button')) return;
  if (e.key !== ' ' && e.key !== 'ArrowRight' && e.key !== 'Enter') return;
  e.preventDefault();
  tocar();
});
