// Rond 154 v2 — NORMALISERING av KOMPONENTER-arrayer till exakt widgetordning.
// v1 infogade saknade komponenter men före Marknadsrytm-ankaret, vilket gav fel
// ordning för komponenter som hör hemma tidigare i kedjan (utdelningskalender/
// kreditdjup/sektordjup/kemisektor). v2 skriver om varje array till widgetens
// exakta ordning (mängden komponenter bevaras), med samtliga kommentarrader
// (proveniensen V219/o24/o27/o31/v1) samlade överst + v2-rubrik. Idempotent.
import fs from 'node:fs';
import path from 'node:path';

const ROT = '/home/ak1a/agent/ak1';
const DIRT = path.join(ROT, 'verktyg');

const w = fs.readFileSync(path.join(ROT, 'src/components/ak1a/chat-widget.tsx'), 'utf8');
const kedjerad = w.split('\n').find(r => r.includes('const lokalt ='));
const WIDGET = [...kedjerad.matchAll(/(svaraLokalt[A-Za-z]+)\(/g)].map(m => m[1]);

const RUBRIK = [
  '    // R154-v2-normalisering (rond 154, huvudagenten [Φ]): arrayen omskriven till',
  '    // WIDGETENS exakta kedjeordning (mängden oförändrad) — v1:s infogning före',
  '    // marknadsrytm-ankaret gav fel ordning för tidigt hörande komponenter.',
  '    // Kommentarsproveniens nedan bevarad i ursprunglig ordning.',
].join('\n');

const filer = fs.readdirSync(DIRT).filter(f => /^testa-ai-mentor-.*\.mjs$/.test(f));
let andrade = 0;
const rapport = [];

for (const f of filer) {
  const p = path.join(DIRT, f);
  let txt = fs.readFileSync(p, 'utf8');
  const arrMatch = txt.match(/KOMPONENTER\s*=\s*\[/);
  if (!arrMatch) continue;
  const start = txt.indexOf(arrMatch[0]);
  const slut = txt.indexOf('];', start);
  const block = txt.slice(start, slut);

  const m = [...block.matchAll(/"(svaraLokalt[A-Za-z]+)"/g)].map(x => x[1]);
  if (m.length === 0) continue;
  const M = [...new Set(m)];
  // Redan normaliserad? (M i exakt widgetordning som undersekvens med samma längd)
  const normaliseradLista = WIDGET.filter(k => M.includes(k));
  if (normaliseradLista.length === M.length && normaliseradLista.every((k, i) => k === M[i])) continue;

  const kommentarer = block.split('\n').filter(r => r.trim().startsWith('//')).map(r => '    ' + r.trim());
  const listaRader = [];
  for (let i = 0; i < normaliseradLista.length; i += 4) {
    listaRader.push('    ' + normaliseradLista.slice(i, i + 4).map(k => `"${k}"`).join(', ') + ',');
  }
  const nyBlock = 'KOMPONENTER = [\n' + [RUBRIK, ...kommentarer].join('\n') + '\n' + listaRader.join('\n') + '\n  ';
  txt = txt.slice(0, start) + nyBlock + txt.slice(slut);
  fs.writeFileSync(p, txt);
  andrade++;
  rapport.push({ fil: f, fran: M.length, till: normaliseradLista.length, tappade: M.length - normaliseradLista.length });
}

fs.writeFileSync(path.join(ROT, 'data/vakten/r154-harmonisering-v2.json'), JSON.stringify({ andrade, rapport }, null, 1));
console.log(`normaliserade ${andrade} sviter`, rapport.filter(r => r.tappade > 0).length ? 'VARNING: ' + JSON.stringify(rapport.filter(r => r.tappade > 0)) : '(inga komponenter tappade)');
