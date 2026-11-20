/* ================================================================
   formato-coracao.js — Pontos para desenhar o coração grande
   Usa a curva clássica do coração, em unidades da fórmula:
   x de -16 a 16, y de -12 (topo dos lobos) a 17 (ponta).
   ================================================================ */

/* Centro vertical da curva (meio entre -12 e 17) */
const CENTRO_Y = 2.5;

/* O contorno fica um pouco para dentro da curva, e o meio fica dentro dele */
const ENCOLHE = 0.95;

/* Lugares sorteados para cada coraçãozinho do meio: fica o mais longe
   dos que já estão. Mais sorteios espalham melhor, e custam mais */
const CANDIDATOS = 8;

function pontoDaCurva(t) {
  return {
    x: 16 * Math.pow(Math.sin(t), 3),
    y: -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))
  };
}

/* Contorno como polígono, para saber se um ponto está dentro */
const poligono = [];
for (let i = 0; i < 96; i++) poligono.push(pontoDaCurva(i / 96 * Math.PI * 2));

function dentroDoCoracao(x, y) {
  let dentro = false;
  for (let i = 0, j = poligono.length - 1; i < poligono.length; j = i++) {
    const a = poligono[i];
    const b = poligono[j];
    if ((a.y > y) !== (b.y > y) && x < (b.x - a.x) * (y - a.y) / (b.y - a.y) + a.x) {
      dentro = !dentro;
    }
  }
  return dentro;
}

/* Contorno fino, com o comprimento andado até cada ponto. A fórmula anda
   devagar no vão de cima e na ponta: sortear pela fórmula amontoava
   corações ali. Medindo o comprimento, eles ficam a distâncias iguais */
const borda = [];
const comprimentos = [];
let perimetro = 0;
for (let i = 0; i < 720; i++) {
  const p = pontoDaCurva(i / 720 * Math.PI * 2);
  if (i) perimetro += Math.hypot(p.x - borda[i - 1].x, p.y - borda[i - 1].y);
  borda.push(p);
  comprimentos.push(perimetro);
}
perimetro += Math.hypot(borda[0].x - borda[719].x, borda[0].y - borda[719].y);

/* Ponto do contorno a `s` de distância do começo, andando pela curva */
function pontoNoComprimento(s) {
  let de = 0;
  let ate = comprimentos.length - 1;
  while (de < ate) {
    const meio = (de + ate + 1) >> 1;
    if (comprimentos[meio] <= s) de = meio;
    else ate = meio - 1;
  }
  const a = borda[de];
  const b = borda[(de + 1) % borda.length];
  const fim = de + 1 < comprimentos.length ? comprimentos[de + 1] : perimetro;
  const p = (s - comprimentos[de]) / (fim - comprimentos[de]);
  return { x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p };
}

/* Ponto dentro do contorno já encolhido: sem isso, a faixa entre ele e a
   curva sobrava vazia e o "mais longe de todos" mandava corações para
   fora da borda, deixando-a borrada */
function sortearDentro() {
  let p;
  do {
    p = { x: Math.random() * 32 - 16, y: Math.random() * 29 - 12 };
  } while (!dentroDoCoracao(p.x / ENCOLHE, (p.y - CENTRO_Y) / ENCOLHE + CENTRO_Y));
  return p;
}

/* Distância (ao quadrado) até o ponto mais perto de `p` em `pontos` */
function distanciaAoMaisPerto(p, pontos) {
  let menor = Infinity;
  for (let i = 0; i < pontos.length; i++) {
    const dx = p.x - pontos[i].x;
    const dy = p.y - pontos[i].y;
    const d = dx * dx + dy * dy;
    if (d < menor) menor = d;
  }
  return menor;
}

/* `quantidade` pontos na tela, centrados em (cx, cy), com 1 unidade da
   fórmula valendo `escalaPx` px. Um quarto fica no contorno, para a borda
   ficar nítida; o resto preenche o meio por igual. */
export function pontosDoCoracao(quantidade, cx, cy, escalaPx) {
  const pontos = [];

  /* Contorno: a distâncias iguais pela curva, um pouco para dentro */
  const noContorno = Math.round(quantidade * 0.25);
  const passo  = perimetro / Math.max(noContorno, 1);
  const inicio = Math.random() * passo;
  for (let i = 0; i < noContorno; i++) {
    const p = pontoNoComprimento((inicio + i * passo) % perimetro);
    pontos.push({ x: p.x * ENCOLHE, y: (p.y - CENTRO_Y) * ENCOLHE + CENTRO_Y });
  }

  /* Meio: de alguns lugares sorteados, fica o mais longe dos que já estão
   — espalha sem buracos nem montinhos, sem virar uma grade */
  while (pontos.length < quantidade) {
    let melhor = null;
    let maisLonge = -1;
    for (let k = 0; k < CANDIDATOS; k++) {
      const candidato = sortearDentro();
      const d = distanciaAoMaisPerto(candidato, pontos);
      if (d > maisLonge) {
        melhor = candidato;
        maisLonge = d;
      }
    }
    pontos.push(melhor);
  }

  return pontos.map(function (p) {
    return { x: cx + p.x * escalaPx, y: cy + (p.y - CENTRO_Y) * escalaPx };
  });
}
