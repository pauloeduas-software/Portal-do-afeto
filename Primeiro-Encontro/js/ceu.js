/* ================================================================
   ceu.js — O quadro da tela, que junta os outros js/
   Redesenha sempre: a luz respira, o coração pulsa e o fundo anda
   mesmo parado.
   ================================================================ */

import { ctx, escalaTela } from './palco.js';
import { desenharFundo } from './fundo.js';
import { lugarDoCoracao } from './coracao.js';
import { desenharCaminho } from './caminho.js';
import { pulsoDoCoracao, desenharRecheio, desenharEncontro } from './brilho.js';

export { colocarEm, andarAte, virarCoracao, apagarLuz } from './caminho.js';
export { PARADAS, fracaoDoCaminho } from './trilha.js';
export { acenderCoracao } from './brilho.js';

function quadro(agora) {
  ctx.setTransform(escalaTela, 0, 0, escalaTela, 0, 0);
  desenharFundo(ctx, agora);
  const lugar = lugarDoCoracao(pulsoDoCoracao(agora));
  desenharRecheio(ctx, agora, lugar);
  desenharCaminho(ctx, agora, lugar);
  desenharEncontro(ctx, agora, lugar);
  requestAnimationFrame(quadro);
}

requestAnimationFrame(quadro);
