// Rond 154 — GENERELL svitharmonisering (V219-mönstret, generaliserat):
// varje testa-ai-mentor-*.mjs med KOMPONENTER-strängarray får widgetens SAKNADE
// komponenter infogade i widgetordning FÖRE "svaraLokaltMarknadsrytm" (SIST-ankaret),
// med attributionskommentar. Idempotent. Arraylösa äldre sviter orörda (V219-respekt).
import fs from 'node:fs';
import path from 'node:path';

const ROT = '/home/ak1a/agent/ak1';
const DIRT = path.join(ROT, 'verktyg');

// Widgetens kedja = sanningen
const w = fs.readFileSync(path.join(ROT, 'src/components/ak1a/chat-widget.tsx'), 'utf8');
const kedjerad = w.split('\n').find(r => r.includes('const lokalt ='));
const WIDGET = [...kedjerad.matchAll(/(svaraLokalt[A-Za-z]+)\(/g)].map(m => m[1]);

const ATTRIB = [
  '    // R154-harmonisering (rond 154, huvudagenten [Φ]): fönstren ~29-34:s kedje-',
  '    // komponenter wireades i widgeten utan full svitharmonisering (V219-läxan):',
  '    // kategoristangning (1ea8ccb8+932659c9) · banksektorn (a092db0e) · notlasning ·',
  '    // nykull · nyfodda · skuldordning · valideringsfonster — här i widgetordning.',
].join('\n');

const filer = fs.readdirSync(DIRT).filter(f => /^testa-ai-mentor-.*\.mjs$/.test(f));
const rapport = { widgetLager: WIDGET.length, andrade: [], ororda: [], utanArray: [] };
let antalAndrade = 0;

for (const f of filer) {
  const p = path.join(DIRT, f);
  let txt = fs.readFileSync(p, 'utf8');

  // Har sviten en KOMPONENTER-array av strängtyp?
  const arrMatch = txt.match(/KOMPONENTER\s*=\s*\[/);
  if (!arrMatch) { rapport.utanArray.push(f); continue; }

  // Avgränsa arrayen: från '[' till dess ']' (första ']' efter start — arrayerna är platta stränglistor med kommentarer)
  const start = txt.indexOf(arrMatch[0]);
  const slut = txt.indexOf('];', start);
  const block = txt.slice(start, slut);
  const har = [...block.matchAll(/"(svaraLokalt[A-Za-z]+)"/g)].map(m => m[1]);
  if (har.length === 0) { rapport.utanArray.push(f + ' (array utan strängar)'); continue; }

  const saknade = WIDGET.filter(k => !har.includes(k));
  if (saknade.length === 0) { rapport.ororda.push(f); continue; }

  // Infoga FÖRE SIST-ankaret "svaraLokaltMarknadsrytm" (finns i alla enligt mallen); annars före '];'
  const nyckel = '"svaraLokaltMarknadsrytm"';
  const insattningsRad = block.includes(nyckel) ? nyckel : null;
  const nyBlock = insattningsRad
    ? block.replace(insattningsRad, ATTRIB + '\n    ' + saknade.map(s => `"${s}"`).join(', ') + ',\n    ' + insattningsRad)
    : block.replace(/\];?\s*$/, ATTRIB + '\n    ' + saknade.map(s => `"${s}"`).join(', ') + ',\n  ');
  txt = txt.slice(0, start) + nyBlock + txt.slice(slut);
  fs.writeFileSync(p, txt);
  antalAndrade++;
  rapport.andrade.push({ fil: f, saknade });
}

rapport.antalAndrade = antalAndrade;
fs.writeFileSync(path.join(ROT, 'data/vakten/r154-harmonisering.json'), JSON.stringify(rapport, null, 1));
console.log(`ändrade ${antalAndrade} sviter · orörda (kompletta) ${rapport.ororda.length} · utan array ${rapport.utanArray.length} · widgetlager ${WIDGET.length}`);
console.log(JSON.stringify(rapport.andrade.slice(0, 5).map(a => a.fil + ' +' + a.saknade.length), null, 1));
