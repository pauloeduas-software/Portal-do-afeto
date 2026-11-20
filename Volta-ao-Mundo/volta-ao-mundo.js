/* ================================================================
   volta-ao-mundo.js — Volta ao Mundo ❤️
   Cada toque mostra "eu te amo" em outro idioma, com a pronúncia e
   o nome da língua, e o globo vira até onde ele se fala. Arrastar
   gira o globo; tocar num país mostra a língua dele (com várias, a que
   a luz dele está mostrando, e tocar de novo passa para a seguinte).
   O toque global de corações fica fora do globo: nele, arrastar
   soltaria um a cada giro.

     abertura → toque               → idioma (o globo acende)
     idioma → toque fora do globo   → próximo idioma
     idioma → toque num país        → a língua dele
     idioma → toque no mar do globo → nada (o globo é para escolher)
     último → toque                 → primeiro de novo

   js/frases.js     a frase e os lugares de cada idioma
   js/globo.js      o globo de pontinhos, as luzes e a rotação
   js/terra.js      onde há terra no globo
   js/mapa.js       os países: contorno e qual tem cada lugar
   js/paises.js     o contorno de cada país
   js/toque.js      arrastar ou tocar
   js/palco.js      o canvas e o tamanho da tela
   js/painel.js     painel de configurações
   ================================================================ */

import { frases } from './js/frases.js';
import { iniciarPainel } from './js/painel.js';
import { definirLuzes, mostrarIdioma, tocarNoPonto, estaNoGlobo } from './js/globo.js';
import { iniciarToque } from './js/toque.js';
import { toqueDaPaginaEm } from '../comum/toque.js';

const frase     = document.getElementById('frase');
const pronuncia = document.getElementById('pronuncia');
const idioma    = document.getElementById('idioma');
const abertura  = document.getElementById('abertura');

/* Nos primeiros 0.8s a abertura ainda está surgindo (loadFadeIn, de
   1.2s): um toque ali não conta */
const SURGIR = 800;

/* Idiomas na ordem escolhida no painel, e qual está na tela */
let fila = frases;
let posicao = 0;

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

/* O texto some rápido e o novo surge crescendo de leve (.trocando no CSS) */
function trocarTexto(elemento, novo) {
  clearTimeout(trocas.get(elemento));
  elemento.classList.add('trocando');
  trocas.set(elemento, setTimeout(function () {
    elemento.textContent = novo;
    elemento.classList.remove('trocando');
  }, 300));
}

/* `luz` é a luz tocada no globo; sem ela, o globo vai à casa da língua */
function mostrar(luz) {
  const item = fila[posicao];
  trocarTexto(frase, item.frase);
  trocarTexto(pronuncia, item.pronuncia);
  trocarTexto(idioma, item.idioma);
  mostrarIdioma(item, luz, true);
}

function avancar() {
  posicao = (posicao + 1) % fila.length;
  mostrar();
}

/* Tocou num país: a língua dele. No mar do globo, nada: ali o toque
   é para escolher um lugar, e passar de idioma sem querer confunde.
   Fora do globo, o próximo idioma. Outro país do mesmo idioma só vira
   o globo, sem trocar o texto */
function tocar(x, y) {
  const toque = tocarNoPonto(x, y);
  const luz = toque.luz;
  if (!luz) {
    if (!toque.noGlobo) avancar();
    return;
  }
  if (luz.item === fila[posicao]) {
    mostrarIdioma(luz.item, luz, true);
    return;
  }
  posicao = fila.indexOf(luz.item);
  mostrar(luz);
}

/* Trocar a ordem não troca o idioma da tela: ele vira o primeiro da
   ordem aleatória, ou volta ao lugar dele na das mais conhecidas */
function mudarOrdem(ordem) {
  const atual = fila[posicao];
  if (ordem === 'aleatoria') {
    fila = [atual].concat(embaralhar(frases.filter(function (item) { return item !== atual; })));
    posicao = 0;
  } else {
    fila = frases;
    posicao = frases.indexOf(atual);
  }
}

/* --- Inicialização (módulos rodam com o HTML já carregado) --- */

/* O primeiro idioma já vem no HTML; aqui só a pronúncia e o globo */
pronuncia.textContent = fila[0].pronuncia;
definirLuzes(frases);
mostrarIdioma(fila[0], null, false);
iniciarPainel(mudarOrdem);

/* No globo o toque é dele (girar, escolher o país): sem coração ali */
toqueDaPaginaEm(estaNoGlobo);

/* Primeiro toque: a abertura some, o globo acende e o idioma surge.
   Só então o globo passa a ouvir o toque, para esse não escolher nada */
function comecar() {
  if (!abertura.classList.contains('visivel')) return false;
  if (performance.now() < SURGIR) return true;
  abertura.classList.remove('visivel');
  document.body.classList.remove('com-frase');
  iniciarToque(tocar);
  return true;
}

/* Toque fora do header */
document.addEventListener('click', function comecarNoToque(e) {
  if (e.target.closest('.top-nav, .settings-panel, a, button')) return;
  comecar();
});

/* Teclado (Espaço, Seta Direita, Enter): o mesmo que o toque. Tecla
   segurada e atalhos (Alt+Seta é voltar no navegador) ficam de fora */
document.addEventListener('keydown', function (e) {
  if (e.repeat || e.altKey || e.ctrlKey || e.metaKey) return;
  if (e.target.closest('a, button')) return;
  if (e.key !== ' ' && e.key !== 'ArrowRight' && e.key !== 'Enter') return;
  e.preventDefault();
  if (!comecar()) avancar();
});
