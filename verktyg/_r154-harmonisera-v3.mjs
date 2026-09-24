// Rond 154 v3 — SLUTKUR: samtliga 41 KOMPONENTER-arrayer ersätts med HELA
// widgetkedjan i exakt ordning (81 lager). v2-buggen: regex [A-Za-z]+ tappade
// det nakna "svaraLokalt" och siffersuffix ("Sektorskola2") — \w* korrigerar.
// Dokumentationsplikten: array-sviterna ska spegla hela kedjan (fönster-
// harmoniserarnas ständiga mål); provenienskommentarer bevaras.
import fs from 'node:fs';
import path from 'node:path';

const ROT = '/home/ak1a/agent/ak1';
const DIRT = path.join(ROT, 'verktyg');

const w = fs.readFileSync(path.join(ROT, 'src/components/ak1a/chat-widget.tsx'), 'utf8');
const kedjerad = w.split('\n').find(r => r.includes('const lokalt ='));
const WIDGET = [...new Set([...kedjerad.matchAll(/(svaraLokalt\w*)\(/g)].map(m => m[1]))];

const RUBRIK = [
  '    // R154-v3 (rond 154, huvudagenten [Φ]): HELA widgetkedjan i exakt ordning —',
  '    // 81 lager. v2:s regex tappade nakna "svaraLokalt" + siffersuffix (grinden',
  '    // fångade det: "okänd kedjekomponent"). Dokumentationsplikten (V219) full-',
  '    // följdas: arrayen speglar hela kedjan, som fönsterharmoniserarna jagade.',
  '    // Provenienskommentarer från V219/o24/o27/o31/v1/v2 bevaras nedan.',
].join('\n');

const filer = fs.readdirSync(DIRT).filter(f => /^testa-ai-mentor-.*\.mjs$/.test(f));
let andrade = 0;
for (const f of filer) {
  const p = path.join(DIRT, f);
  let txt = fs.readFileSync(p, 'utf8');
  const arrMatch = txt.match(/KOMPONENTER\s*=\s*\[/);
  if (!arrMatch) continue;
  const start = txt.indexOf(arrMatch[0]);
  const slut = txt.indexOf('];', start);
  const block = txt.slice(start, slut);

  const nuvarande = [...new Set([...block.matchAll(/"(svaraLokalt\w*)"/g)].map(x => x[1]))];
  if (nuvarande.length === WIDGET.length && nuvarande.every((k, i) => k === WIDGET[i])) continue; // redan komplett

  const kommentarer = block.split('\n').filter(r => r.trim().startsWith('//')).map(r => '    ' + r.trim());
  const listaRader = [];
  for (let i = 0; i < WIDGET.length; i += 4) {
    listaRader.push('    ' + WIDGET.slice(i, i + 4).map(k => `"${k}"`).join(', ') + ',');
  }
  const nyBlock = 'KOMPONENTER = [\n' + [RUBRIK, ...kommentarer].join('\n') + '\n' + listaRader.join('\n') + '\n  ';
  txt = txt.slice(0, start) + nyBlock + txt.slice(slut);
  fs.writeFileSync(p, txt);
  andrade++;
}
fs.writeFileSync(path.join(ROT, 'data/vakten/r154-harmonisering-v3.json'), JSON.stringify({ andrade, widgetLager: WIDGET.length }, null, 1));
console.log(`v3: ${andrade} sviter ⇒ hela kedjan (${WIDGET.length} lager, nakna svaraLokalt ${WIDGET.includes('svaraLokalt') ? 'med' : 'SAKNAS!'})`);
