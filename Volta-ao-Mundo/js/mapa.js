/* ================================================================
   mapa.js — Os países de paises.js, prontos para o globo
   Cada país tem partes (o continente e as ilhas). Cada parte guarda
   os pontos duas vezes: na esfera, para desenhar, e em latitude e
   longitude, para saber se o dedo caiu dentro dela.
   ================================================================ */

import { PAISES, CONTORNOS } from './paises.js';

/* Latitude e longitude em graus → ponto na esfera */
export function naEsfera(lat, lon) {
  const fi = lat * Math.PI / 180;
  const la = lon * Math.PI / 180;
  return [Math.cos(fi) * Math.sin(la), Math.sin(fi), Math.cos(fi) * Math.cos(la)];
}

function inteiro(i) {
  const v = CONTORNOS.charCodeAt(i) | (CONTORNOS.charCodeAt(i + 1) << 8);
  return v >= 32768 ? v - 65536 : v;
}

/* Versões mais leves do contorno, para o globo pequeno: cada uma só
   com os pontos a pelo menos essa distância (na esfera) do anterior.
   A distância na tela é ela vezes o raio do globo, qualquer que seja
   a rotação, então dá para escolher a versão uma vez por tamanho */
export const DETALHES = [0, 0.003, 0.006, 0.012];

function maisLeve(esfera, distancia) {
  const n = esfera.length;
  const fica = [esfera[0], esfera[1], esfera[2]];
  let ux = esfera[0], uy = esfera[1], uz = esfera[2];
  for (let i = 3; i < n; i += 3) {
    const longe = Math.hypot(esfera[i] - ux, esfera[i + 1] - uy, esfera[i + 2] - uz) >= distancia;
    if (!longe && i + 3 < n) continue;
    fica.push(esfera[i], esfera[i + 1], esfera[i + 2]);
    ux = esfera[i]; uy = esfera[i + 1]; uz = esfera[i + 2];
  }
  return new Float32Array(fica);
}

/* Uma parte: pontos na esfera (com as versões mais leves), latitude e
   longitude, a caixa que a contém e o centro, para pular as que estão
   atrás do globo */
function montarParte(lats, lons) {
  const n = lats.length;
  const esfera = new Float32Array(n * 3);
  const caixa = { latMin: 90, latMax: -90, lonMin: 180, lonMax: -180 };
  let sx = 0, sy = 0, sz = 0;
  for (let i = 0; i < n; i++) {
    const p = naEsfera(lats[i], lons[i]);
    esfera[i * 3] = p[0];
    esfera[i * 3 + 1] = p[1];
    esfera[i * 3 + 2] = p[2];
    sx += p[0]; sy += p[1]; sz += p[2];
    caixa.latMin = Math.min(caixa.latMin, lats[i]);
    caixa.latMax = Math.max(caixa.latMax, lats[i]);
    caixa.lonMin = Math.min(caixa.lonMin, lons[i]);
    caixa.lonMax = Math.max(caixa.lonMax, lons[i]);
  }
  const m = Math.hypot(sx, sy, sz) || 1;
  const centro = [sx / m, sy / m, sz / m];
  /* O quanto a parte se abre em volta do centro: o seno dessa abertura
     diz até onde atrás do globo ela ainda pode aparecer na borda.
     Aberta mais de 90°, sempre tem um pedaço de frente (2) */
  let menorCos = 1;
  for (let i = 0; i < n; i++) {
    menorCos = Math.min(menorCos,
      esfera[i * 3] * centro[0] + esfera[i * 3 + 1] * centro[1] + esfera[i * 3 + 2] * centro[2]);
  }
  return {
    esfera: esfera,
    versoes: DETALHES.map(function (d) { return d ? maisLeve(esfera, d) : esfera; }),
    lats: new Float32Array(lats),
    lons: new Float32Array(lons),
    caixa: caixa,
    centro: centro,
    alcance: menorCos <= 0 ? 2 : Math.sqrt(1 - menorCos * menorCos)
  };
}

/* Área de uma parte, mais ou menos (em graus², com a longitude
   encolhida pela latitude): só para saber qual país é maior */
function areaDaParte(lats, lons) {
  const lat0 = lats.reduce(function (a, b) { return a + b; }, 0) / lats.length;
  const encolhe = Math.cos(lat0 * Math.PI / 180);
  let soma = 0;
  for (let i = 0, j = lats.length - 1; i < lats.length; j = i++) {
    soma += (lons[j] - lons[i]) * encolhe * (lats[j] + lats[i] - 2 * lat0);
  }
  return Math.abs(soma / 2);
}

/* [{ codigo, nome, partes, tamanho }], na ordem de PAISES */
export const paises = (function () {
  const lista = PAISES.map(function (p) { return { codigo: p[0], nome: p[1], partes: [], tamanho: 0 }; });
  let k = 0;
  let lats = [];
  let lons = [];
  function fecharParte() {
    if (lats.length) {
      lista[k].partes.push(montarParte(lats, lons));
      lista[k].tamanho += areaDaParte(lats, lons);
    }
    lats = [];
    lons = [];
  }
  for (let i = 0; i < CONTORNOS.length; i += 4) {
    const lat = inteiro(i);
    const lon = inteiro(i + 2);
    if (lat === -32768) {
      fecharParte();
      if (lon === 1) k++;
      continue;
    }
    lats.push(lat / 100);
    lons.push(lon / 100);
  }
  fecharParte();
  return lista;
})();

export const paisPorCodigo = new Map(paises.map(function (p) { return [p.codigo, p]; }));

/* Raio de "par ou ímpar": quantas vezes uma linha para leste a partir
   do ponto cruza o contorno */
function dentroDaParte(parte, lat, lon) {
  const c = parte.caixa;
  if (lat < c.latMin || lat > c.latMax || lon < c.lonMin || lon > c.lonMax) return false;
  const la = parte.lats;
  const lo = parte.lons;
  let dentro = false;
  for (let i = 0, j = la.length - 1; i < la.length; j = i++) {
    if ((la[i] > lat) !== (la[j] > lat) &&
        lon < (lo[j] - lo[i]) * (lat - la[i]) / (la[j] - la[i]) + lo[i]) {
      dentro = !dentro;
    }
  }
  return dentro;
}

/* O país que tem esse lugar, ou null no mar */
export function paisEm(lat, lon) {
  for (const pais of paises) {
    for (const parte of pais.partes) {
      if (dentroDaParte(parte, lat, lon)) return pais;
    }
  }
  return null;
}
