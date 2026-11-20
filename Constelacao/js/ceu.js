/* ================================================================
   ceu.js — Junta tudo o que é desenhado no céu, um quadro por vez,
   de trás para a frente:

     fundo.js        céu estrelado, nebulosa e estrelinhas piscando
     cadentes.js     estrelas cadentes de vez em quando
     constelacao.js  linhas e estrelas que ela acende
     luz.js          luz que percorre a constelação pronta, de tempos em tempos

   palco.js   o canvas e o tamanho da tela
   cores.js   cores da página, lidas do CSS
   curvas.js  ritmo das animações
   ================================================================ */

import { desenharFundo } from './fundo.js';
import { desenharCadentes } from './cadentes.js';
import {
  posicoes, chegadaNoMeio, desenharLinhas, desenharEstrelas,
  mostrarConstelacao as mostrar, apagarConstelacao as apagar
} from './constelacao.js';
import { percurso, desenharLuz, brilhoDaPassagem, soltarLuz, pararLuz } from './luz.js';

export { acenderEstrela, tocarEstrela } from './constelacao.js';

/* A luz sai sozinha depois que o desenho chega no meio */
export function mostrarConstelacao(area) {
  mostrar(area);
  soltarLuz(chegadaNoMeio());
}

export function apagarConstelacao() {
  apagar();
  pararLuz();
}

function quadro(agora) {
  desenharFundo(agora);
  desenharCadentes(agora);

  const lugares = posicoes(agora);
  const luz = percurso(agora, lugares);
  desenharLinhas(lugares, agora);
  desenharLuz(lugares, luz);
  desenharEstrelas(lugares, agora, function (i) { return brilhoDaPassagem(i, luz); });

  requestAnimationFrame(quadro);
}

requestAnimationFrame(quadro);
