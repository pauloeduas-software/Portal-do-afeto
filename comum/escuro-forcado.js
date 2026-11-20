/* ================================================================
   comum/escuro-forcado.js — Título legível no modo escuro do Samsung Internet
   O Samsung Internet escurece o site por cima mesmo com o color-scheme,
   e o degradê do .titulo-brilho (branco → cor da página) vira quase preto.
   No Samsung a <html> ganha .escuro-forcado e o título usa cor sólida
   (estilo.css). Vale sempre nele, porque nem sempre ele avisa a página
   que está no modo escuro. Script comum no <head>, para valer antes de
   desenhar a página.
   ================================================================ */

if (/SamsungBrowser/.test(navigator.userAgent)) {
  document.documentElement.classList.add('escuro-forcado');
}
