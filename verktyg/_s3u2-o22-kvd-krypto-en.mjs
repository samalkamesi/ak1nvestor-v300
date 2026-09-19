#!/usr/bin/env node
// KVD för Ö22 kryptoaktier-en (s3-u2, klaim 2026-09-19T09:09:18Z, anspråksfil
// data/vakten/s3-o22-krypto-en-ansprak-2026-09-19.md)
// Kontroller: varumärkesgrind × 3 ytor, rådverb EN+SV, sökord, title/OG-längd,
// ordantal, korslänkar MULTISET vs original, externa URL:er identiska,
// talparitet tusentalsnormaliserad (SV mellanslag/decimalkomma == EN komma/punkt),
// aritmetik motorräknad, H2-paritet, rm, svenska läckor efter URL-strip
// (vitlista: institutionsnamn enligt AR2-precedensen), disclaimer engelsk form.
import { readFileSync } from 'node:fs';

const orig = JSON.parse(readFileSync('/home/ak1a/AK1/data/blogg-utkast/kryptoaktier-sa-analyserar-du-kryptobolag.json', 'utf8'));
const ny = JSON.parse(readFileSync('/home/ak1a/AK1/data/blogg-utkast/kryptoaktier-sa-analyserar-du-kryptobolag-en.json', 'utf8'));
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
const sok = 'crypto stocks';
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
ok('korslänkar MULTISET vs B22', JSON.stringify(sortKey(lo)) === JSON.stringify(sortKey(ln)), `${Object.values(ln).reduce((a, b) => a + b, 0)} länkar mot originalets ${Object.values(lo).reduce((a, b) => a + b, 0)}`);

// 7. Externa käll-URL:er identiska med originalet
const extUrl = (t) => [...t.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map(m => m[1]).sort();
ok('externa URL:er identiska', JSON.stringify(extUrl(orig.body)) === JSON.stringify(extUrl(ny.body)), `${extUrl(ny.body).length} URL:er`);

// 8. H2-paritet (samma antal sektioner som originalet)
const h2orig = [...orig.body.matchAll(/^## (.+)$/gm)].map(m => m[1]);
ok('H2-antal = originalets', h2or.length === h2orig.length, `${h2or.length} mot ${h2orig.length}`);

// 9. Talparitet tusentalsnormaliserad
// SV: "845 000" → "845000" (mellanslagsgrupper), "45,9" → "45.9" (decimalkomma)
// EN: "845,000" → "845000" (kommagrupper), decimalpunkt kvar
const stripUrls = (t) => t.replace(/\]\(\/?[^)]+\)/g, (m) => m.replace(/\(([^)]*)\)/, ''));
const normSV = (t) => { let s = stripUrls(t), prev; do { prev = s; s = s.replace(/(\d)[ \u00a0](\d{3})(?=\D|$)/g, '$1$2'); } while (s !== prev); return s.replace(/(\d),(\d)/g, '$1.$2'); };
const normEN = (t) => { let s = stripUrls(t), prev; do { prev = s; s = s.replace(/(\d),(\d{3})(?=\D|$)/g, '$1$2'); } while (s !== prev); return s; };
const tal = (t) => (t.match(/\d+(?:\.\d+)?/g) || []).sort((a, b) => a.localeCompare(b, 'sv', { numeric: true }));
const tSV = tal(normSV(orig.body)), tEN = tal(normEN(ny.body));
const endastSV = tSV.filter(x => !tEN.includes(x));
const endastEN = tEN.filter(x => !tSV.includes(x));
ok('talparitet tusentalsnormaliserad', endastSV.length === 0 && endastEN.length === 0, `${tSV.length} SV-tal mot ${tEN.length} EN-tal${endastSV.length || endastEN.length ? ' — endast-SV: [' + endastSV.join(', ') + '] endast-EN: [' + endastEN.join(', ') + ']' : ''}`);

// 10. Aritmetik motorräknad (originalets genomgångna exempel)
const arre = [];
arre.push(['nettomarginal TTM −987.8/6040 = −16.4 %', Math.abs((-987.8 / 6040) * 100 + 16.4) < 0.05]);
arre.push(['marginalsvängning 18.3+16.4 = 34.7 ≈ "nearly 35"', Math.abs(18.3 + 16.4 - 34.7) < 1e-9 && 34.7 < 35 && ny.body.includes('35 percentage points')]);
arre.push(['57 % under toppen: 1−173.97/402 = ' + ((1 - 173.97 / 402) * 100).toFixed(1), Math.round((1 - 173.97 / 402) * 100) === 57]);
arre.push(['Strategy-andel 845050/21000000 = ' + ((845050 / 21000000) * 100).toFixed(2) + ' % > "over 3 percent"', 845050 / 21000000 > 0.03 && ny.body.includes('over 3 percent')]);
arre.push(['halveringen 2 × 3.125 = 6.25 (föregående blockbelöning)', 2 * 3.125 === 6.25 && ny.body.includes('3.125 bitcoin per block')]);
arre.push(['beta 3.39: "three and a half times wider" (3 < 3.39 < 3.6) och "more than three times"', 3 < 3.39 && 3.39 < 3.6 && ny.body.includes('three and a half times wider') && ny.body.includes('more than three times wider')]);
arre.push(['spannet 139 < 173.97 < 402', 139 < 173.97 && 173.97 < 402]);
for (const [namn, v] of arre) ok('aritmetik: ' + namn, v);

// 11. Svenska läckor 0 efter URL-strip (vitlista: institutionsnamn som källstruktur
// bär och som förklaras i parentes vid första nämnd — AR2-precedensens klass)
const vitlista = ['finansinspektionen', 'skatteverket'];
const svOrd = ['och', 'är', 'att', 'med', 'som', 'på', 'av', 'inte', 'till', 'från', 'procent', 'aktie', 'aktier', 'bolag', 'bolaget', 'utdelning', 'värde', 'präglas'];
const bodyOrd = stripUrls(ny.body).toLowerCase().replace(/[_*#()\[\]]/g, ' ').split(/\s+/);
const leakor = bodyOrd.filter(w => svOrd.includes(w) && !vitlista.some(v => w.includes(v)));
ok('svenska läckor 0 (URL-strip + institutionsvitlista)', leakor.length === 0, leakor.length ? 'läckta: ' + [...new Set(leakor)].join(', ') : `${vitlista.length} vitlistade institutionsnamn`);

// 12. Disclaimer engelsk form = exakt sista rad
const sista = ny.body.trim().split('\n').slice(-1)[0];
ok('disclaimer sista rad', sista === '_This is educational financial analysis, not investment advice._', sista);

console.log(r.join('\n'));
console.log(`\n${fel.length === 0 ? 'KVD GRÖN' : 'KVD RÖD'}: ${r.length - fel.length}/${r.length} kontroller GRÖNA${fel.length ? ' — FEL: ' + fel.join(', ') : ''}`);
process.exit(fel.length === 0 ? 0 : 1);
