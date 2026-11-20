/* ================================================================
   painel.js — Painel de Configurações (ordem dos idiomas)
   ================================================================ */

/* `aoMudarOrdem(ordem)` recebe 'familiar' ou 'aleatoria' */
export function iniciarPainel(aoMudarOrdem) {
  const botaoPainel = document.getElementById('settings-toggle');
  const painel      = document.getElementById('settings-panel');
  const botoesOrdem = painel.querySelectorAll('[data-ordem]');

  /* Abre e fecha o painel deslizante. Fechado, fica fora do Tab e do
     leitor de tela (inert) */
  botaoPainel.addEventListener('click', function () {
    /* Posiciona o painel logo abaixo do botão — no celular os botões quebram
       linha e um topo fixo fazia o painel cobrir os botões */
    const topo = botaoPainel.getBoundingClientRect().bottom + 12;
    painel.style.top       = topo + 'px';
    painel.style.maxHeight = (window.innerHeight - topo - 12) + 'px';
    const aberto = painel.classList.toggle('open');
    painel.inert = !aberto;
    botaoPainel.setAttribute('aria-expanded', aberto);
  });

  botoesOrdem.forEach(function (botao) {
    botao.addEventListener('click', function () {
      botoesOrdem.forEach(function (b) {
        b.classList.toggle('active', b === botao);
        b.setAttribute('aria-pressed', b === botao);
      });
      aoMudarOrdem(botao.dataset.ordem);
    });
  });
}
