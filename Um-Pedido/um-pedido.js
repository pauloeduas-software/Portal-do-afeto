/* ================================================================
   um-pedido.js — Um Pedido 💍
   Controla o botão "Sim", a fuga do botão "Não" e a mensagem final.

   js/petalas.js   pétalas caindo no fundo
   ================================================================ */

/* O script vem no fim do body, com os botões já na página: o "Sim"
   responde logo, sem esperar os módulos carregarem */
(function () {

  /* Contador de tentativas de clicar em "Não" */
  var tentativas = 0;

  /* Controla se a mensagem de derrota já foi exibida */
  var mensagemExibida = false;

  /* --- Resposta positiva --- */
  function responderSim() {
    var questionText = document.getElementById('question-text');
    var wrapper      = document.getElementById('button-wrapper');

    /* A pergunta some em 0.3s e a confirmação carinhosa surge crescendo
       (.trocando no CSS) */
    questionText.classList.add('trocando');
    setTimeout(function () {
      questionText.innerText = 'Já pode beijar o namorado!';
      questionText.classList.remove('trocando');
    }, 300);

    /* Os botões e o aviso do "Não" somem devagar (.sumido no CSS) */
    var warning = document.querySelector('.warning-message');
    if (warning) warning.classList.add('sumido');
    if (wrapper) wrapper.classList.add('sumido');
  }

  document.querySelector('.yes-btn').addEventListener('click', responderSim);

  var noBtn    = document.querySelector('.no-btn');
  var container = document.getElementById('reveal-container');

  /* Posições de fuga do botão "Não" em cada clique (em px) */
  var posicoes = [
    { x: 100, y: -40 }, /* 1º clique: sobe e vai para a direita */
    { x: 80,  y:  40 }  /* 2º clique: desce e continua na direita */
  ];

  /* Borda direita do botão "Não" antes de fugir — medida no 1º clique */
  var bordaOriginal = null;

  /* Faz o botão "Não" escapar ou sumir no 3º clique */
  function fugir() {
    if (tentativas < posicoes.length) {
      var pos = posicoes[tentativas];
      if (bordaOriginal === null) bordaOriginal = noBtn.getBoundingClientRect().right;
      /* No celular não sobram 100px à direita: limita a fuga para o botão não sair da tela */
      var espacoLivre = document.documentElement.clientWidth - 12 - bordaOriginal;
      var x = Math.min(pos.x, espacoLivre);
      noBtn.style.position  = 'relative';
      noBtn.style.transform  = 'translate(' + x + 'px, ' + pos.y + 'px)';
      tentativas++;
    } else {
      /* 3º clique: esconde o botão e exibe a mensagem de derrota carinhosa */
      if (!mensagemExibida) {
        var mensagem       = document.createElement('p');
        mensagem.innerText = 'Acho que não vai funcionar!';
        mensagem.className = 'warning-message';
        container.appendChild(mensagem);
        mensagemExibida = true;
      }
      noBtn.classList.add('sumido');
    }
  }

  /* O botão "Não" só foge ao clicar — não ao passar o mouse */
  noBtn.addEventListener('click', function (e) {
    e.preventDefault();
    fugir();
  });

})();
