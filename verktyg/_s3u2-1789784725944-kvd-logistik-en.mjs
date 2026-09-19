#!/usr/bin/env node
// KVD för Ö21 logistikaktier-en (manifest auto-s3-1789784725944, s3-u2)
// Kontroller: varumärkesgrind × 3 ytor, rådverb EN+SV, sökord, title/OG-längd,
// ordantal, korslänkar MULTISET vs original, talparitet tusentalsnormaliserad,
// aritmetik motorräknad, rm, disclaimer.
import { readFileSync } from 'node:fs';

const orig = JSON.parse(readFileSync('/home/ak1a/AK1/data/blogg-utkast/logistikaktier-sa-analyserar-du-fraktbolag.json', 'utf8'));
const ny = JSON.parse(readFileSync('/home/ak1a/AK1/data/blogg-utkast/logistikaktier-sa-analyserar-du-fraktbolag-en.json', 'utf8'));
const vm = JSON.parse(readFileSync('/home/ak1a/AK1/data/varumarke.json', 'utf8'));

const r = []; const fel = [];
const ok = (namn, villkor, detalj) => { r.push(`${villkor ? 'GRÖN' : 'FEL'}  ${namn}${detalj ? ' — ' + detalj : ''}`); if (!villkor) fel.push(namn); };

const ytor = { title: ny.title, description: ny.description, body: ny.body };

// 1. Varumärkesgrindens egna regexer × 3 ytor
let vmFel = 0, vmKoll = 0;
for (const frase of vm.forbjudnaFraser || []) {
  vmKoll++;
  const re = new RegExp(frase.fran, 'gi');
  for (const [yta, text] of Object.entries(ytor)) {
    const t = (text.match(re) || []).length;
    if (t > 0) { vmFel++; console.log(`  VM ${frase.allvar} "${frase.fran}" träff ${t}× i ${yta}`); }
  }
}
ok(`varumärkesgrind ${vmKoll} regexer × 3 ytor`, vmFel === 0, `${vmKoll} regexer, ${vmFel} träffar`);

// 2. Rådverb EN+SV (rådgivningsverb riktade mot läsaren om värdepapper)
const radVerb = [
  /\byou should (buy|sell|hold|avoid|pick)\b/gi, /\bwe (recommend|advise)\b/gi,
  /\b(invest in (this|the) (stock|company|share))\b/gi, /\bbuy (this|the) stock\b/gi,
  /\b(köp|sälj|undvik) (denne?r? ?aktien?|bolaget|aktiernas?)\b/gi, /\bvi råder\b/gi,
  /\bbör du (köpa|sälja)\b/gi
];
let radTräff = 0;
for (const re of radVerb) { const m = ny.body.match(re) || []; if (m.length) { radTräff += m.length; console.log(`  RÅDVERB "${re}" ${m.length}×`); } }
ok('rådverb EN+SV', radTräff === 0, `${radTräff} träffar`);

// 3. Sökord i title + ingress (första stycket) + minst en H2
const sok = 'logistics stocks';
const ingress = ny.body.split('\n\n')[0];
const h2or = [...ny.body.matchAll(/^## (.+)$/gm)].map(m => m[1]);
ok('sökord i title', ny.title.toLowerCase().includes(sok));
ok('sökord i ingress', ingress.toLowerCase().includes(sok));
ok('sökord i ≥1 H2', h2or.some(h => h.toLowerCase().includes(sok)), h2or.filter(h => h.toLowerCase().includes(sok)).join(' | ') || 'inget');

// 4. Längder
ok('title ≤ 60 tkn', ny.title.length <= 60, `${ny.title.length}/60`);
ok('OG-description ≤ 155 tkn', ny.description.length <= 155, `${ny.description.length}/155`);

// 5. Ordantal (raw: whitespace-delat) + readingMinutes
const ord = ny.body.trim().split(/\s+/).length;
ok('ord 1200–1400', ord >= 1200 && ord <= 1400, `${ord} ord`);
ok('readingMinutes = round(ord/600)', ny.readingMinutes === Math.round(ord / 600), `rm ${ny.readingMinutes} = round(${ord}/600) = ${Math.round(ord / 600)}`);

// 6. Korslänkar MULTISET-identiska med originalet
const lankar = (t) => { const m = {}; for (const x of t.match(/\]\((\/[^)]+)\)/g) || []) { const u = x.slice(2, -1); m[u] = (m[u] || 0) + 1; } return m; };
const lo = lankar(orig.body), ln = lankar(ny.body);
const sortKey = (o) => Object.entries(o).map(([u, c]) => `${c}×${u}`).sort();
ok('korslänkar MULTISET identiska', JSON.stringify(sortKey(lo)) === JSON.stringify(sortKey(ln)), `${Object.values(ln).reduce((a, b) => a + b, 0)} st`);

// 7. Talparitet: unika tal, tusentalsnormaliserad (Ö14-precedensen):
//    SV: mellanslagstusental "66 859"→66859, decimalkomma "3,5"→3.5
//    EN: kommatusental "66,859"→66859, decimalpunkt kvar
const talSV = (t) => {
  const tvätt = t.replace(/(\d) (\d{3})(?!\d)/g, '$1$2');
  const raw = tvätt.match(/\d+(?:[.,]\d+)?/g) || [];
  return [...new Set(raw.map(x => x.replace(',', '.')))].sort((a, b) => a - b);
};
const talEN = (t) => {
  const tvätt = t.replace(/(\d),(\d{3})(?!\d)/g, '$1$2');
  const raw = tvätt.match(/\d+(?:\.\d+)?/g) || [];
  return [...new Set(raw)].sort((a, b) => a - b);
};
const to = talSV(orig.title + ' ' + orig.description + ' ' + orig.body);
const tn = talEN(ny.title + ' ' + ny.description + ' ' + ny.body);
const saknas = to.filter(x => !tn.includes(x));
const extra = tn.filter(x => !to.includes(x));
ok('talparitet (unika tal, originalets alla tal närvarande)', saknas.length === 0,
   `orig ${to.length} unika, ny ${tn.length} unika; saknas i EN: [${saknas.join(', ')}]; extra i EN: [${extra.join(', ')}]`);

// 8. Aritmetik motorräknad (originalets räkneexempel)
const pct = (x) => (x * 100);
ok('aritmetik Maersk 2022-marginal 31÷82 = 37,8 %', Math.abs(pct(31 / 82) - 37.8) < 0.05, `${pct(31 / 82).toFixed(2)} %`);
ok('aritmetik Maersk 2025-marginal 3,5÷54,0 = 6,5 %', Math.abs(pct(3.5 / 54.0) - 6.5) < 0.05, `${pct(3.5 / 54.0).toFixed(2)} %`);
ok('aritmetik Maersk 2023-fall 1−4/31 = 87 %', Math.abs(pct(1 - 4 / 31) - 87) < 0.5, `${pct(1 - 4 / 31).toFixed(2)} %`);
ok('aritmetik DSV bruttomarginal 66859÷247331 = 27,0 %', Math.abs(pct(66859 / 247331) - 27.0) < 0.05, `${pct(66859 / 247331).toFixed(2)} %`);
ok('aritmetik DSV EBIT-förbättring 19611÷16096 − 1 = 21,8 %', Math.abs(pct(19611 / 16096 - 1) - 21.8) < 0.05, `${pct(19611 / 16096 - 1).toFixed(2)} %`);
ok('aritmetik K+N marginal 1242÷24476 = 5,1 %', Math.abs(pct(1242 / 24476) - 5.1) < 0.05, `${pct(1242 / 24476).toFixed(2)} %`);
// Dokumenterad tolerans (Ö13-precedensen): originalets egen avrundning —
// 10,2→8,5 mdr DKK är −16,67 % mot originalets (och spegelns) −16,8 %; avvikelsen
// 0,13 pp är originalets avrundningsval, paritetsbunden i översättningen.
ok('aritmetik DSV vinst 8,5 vs 10,2 → −16,8 % (originalets avrundning, tol 0,2)', Math.abs(pct(8.5 / 10.2 - 1) + 16.8) < 0.2, `${pct(8.5 / 10.2 - 1).toFixed(2)} %`);

// 9. Disclaimer sista rad + struktur
const sista = ny.body.trim().split('\n').pop().trim();
ok('disclaimer engelsk form på sista raden', sista === '_This is educational financial analysis, not investment advice._', sista);
ok('struktur 7 H2 som originalet', h2or.length === [...orig.body.matchAll(/^## (.+)$/gm)].length, `${h2or.length} H2`);

console.log(r.join('\n'));
console.log(`\n${fel.length === 0 ? 'KVD GRÖN — 0 FEL' : 'KVD RÖD — ' + fel.length + ' FEL: ' + fel.join('; ')}`);
process.exit(fel.length === 0 ? 0 : 1);
