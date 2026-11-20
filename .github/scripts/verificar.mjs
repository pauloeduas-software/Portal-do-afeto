/* ================================================================
   verificar.mjs — Checagem do site antes de publicar
   1. Todo arquivo .js precisa ter a sintaxe válida.
   2. Todo arquivo citado em <script src>, <link href>, <a href> e
      import precisa existir (pega nome de módulo digitado errado).
   Uso: node .github/scripts/verificar.mjs
   ================================================================ */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const IGNORAR = new Set(['.git', '.github', 'node_modules']);

const erros = [];

function listarArquivos(pasta) {
  return readdirSync(pasta, { withFileTypes: true }).flatMap(function (item) {
    if (IGNORAR.has(item.name)) return [];
    const caminho = join(pasta, item.name);
    return item.isDirectory() ? listarArquivos(caminho) : [caminho];
  });
}

/* Arquivo com import/export é módulo; o resto é script comum */
function ehModulo(codigo) {
  return /^\s*(import|export)\s/m.test(codigo);
}

function checarSintaxe(arquivo, codigo) {
  const args = ehModulo(codigo) ? ['--input-type=module', '--check'] : ['--check'];
  const resultado = spawnSync(process.execPath, args, { input: codigo, encoding: 'utf8' });
  if (resultado.status !== 0) {
    /* Só a linha com o erro e a mensagem, sem o rastro interno do Node */
    const mensagem = resultado.stderr.split('\n');
    const fim = mensagem.findIndex(function (linha) { return /Error:/.test(linha); });
    erros.push(relative(RAIZ, arquivo) + ': erro de sintaxe\n' + mensagem.slice(0, fim + 1).join('\n').replace('[stdin]', 'linha'));
  }
}

/* Endereço local (sem http, #, mailto...) apontando para algo que não existe */
function checarReferencia(origem, endereco) {
  if (/^([a-z]+:|\/\/|#)/i.test(endereco)) return;
  const semConsulta = endereco.split(/[?#]/)[0];
  if (!semConsulta) return;

  let destino = resolve(dirname(origem), semConsulta);
  if (existsSync(destino) && statSync(destino).isDirectory()) destino = join(destino, 'index.html');
  if (!existsSync(destino)) {
    erros.push(relative(RAIZ, origem) + ': "' + endereco + '" não existe');
  }
}

const arquivos = listarArquivos(RAIZ);

arquivos.filter(function (a) { return a.endsWith('.js') || a.endsWith('.mjs'); }).forEach(function (arquivo) {
  const codigo = readFileSync(arquivo, 'utf8');
  checarSintaxe(arquivo, codigo);
  for (const m of codigo.matchAll(/\bfrom\s+['"]([^'"]+)['"]|\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g)) {
    checarReferencia(arquivo, m[1] || m[2]);
  }
});

arquivos.filter(function (a) { return a.endsWith('.html'); }).forEach(function (arquivo) {
  const html = readFileSync(arquivo, 'utf8');
  for (const m of html.matchAll(/\b(?:src|href)\s*=\s*"([^"]+)"/g)) {
    checarReferencia(arquivo, m[1]);
  }
});

if (erros.length) {
  console.error('Encontrei ' + erros.length + ' problema(s):\n');
  erros.forEach(function (e) { console.error('✗ ' + e + '\n'); });
  process.exit(1);
}

console.log('✓ ' + arquivos.length + ' arquivos verificados, nenhum problema.');
