#!/usr/bin/env node
// KVD för Ö20 lyxaktier-en (manifest auto-s3-1789762524949, s3-u3)
// Kontroller: varumärkesgrind × 3 ytor, rådverb EN+SV, sökord, title/OG-längd,
// ordantal, korslänkar MULTISET vs original, talparitet, aritmetik, rm, disclaimer.
import { readFileSync } from 'node:fs';

const orig = JSON.parse(readFileSync('/home/ak1a/AK1/data/blogg-utkast/lyxaktier-sa-analyserar-du-lyxbolag.json', 'utf8'));
const ny = JSON.parse(readFileSync('/home/ak1a/AK1/data/blogg-utkast/lyxaktier-sa-analyserar-du-lyxbolag-en.json', 'utf8'));
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
const sok = 'luxury stocks';
const ingress = ny.body.split('\n\n')[0];
const h2or = [...ny.body.matchAll(/^## (.+)$/gm)].map(m => m[1]);
ok('sökord i title', ny.title.toLowerCase().includes(sok));
ok('sökord i ingress', ingress.toLowerCase().includes(sok));
ok('sökord i ≥1 H2', h2or.some(h => h.toLowerCase().includes(sok)), h2or.filter(h => h.toLowerCase().includes(sok)).join(' | ') || 'inget');

// 4. Längder
ok(`title ≤ 60 tkn`, ny.title.length <= 60, `${ny.title.length}/60`);
ok(`OG-description ≤ 155 tkn`, ny.description.length <= 155, `${ny.description.length}/155`);

// 5. Ordantal (raw: whitespace-delat) + readingMinutes
const ord = ny.body.trim().split(/\s+/).length;
ok('ord 800–1400', ord >= 800 && ord <= 1400, `${ord} ord`);
ok(`readingMinutes = round(ord/600)`, ny.readingMinutes === Math.round(ord / 600), `rm ${ny.readingMinutes} = round(${ord}/600) = ${Math.round(ord / 600)}`);

// 6. Korslänkar MULTISET-identiska med originalet
const lankar = (t) => { const m = {}; for (const x of t.match(/\]\((\/[^)]+)\)/g) || []) { const u = x.slice(2, -1); m[u] = (m[u] || 0) + 1; } return m; };
const lo = lankar(orig.body), ln = lankar(ny.body);
const sortKey = (o) => Object.entries(o).map(([u, c]) => `${c}×${u}`).sort();
ok('korslänkar MULTISET identiska', JSON.stringify(sortKey(lo)) === JSON.stringify(sortKey(ln)), `${Object.values(ln).reduce((a, b) => a + b, 0)} st`);

// 7. Talparitet: unika tal, normaliserade (decimalkomma→punkt, mellanslagstusental bort)
const tal = (t) => {
  const raw = t.match(/\d+(?:[.,]\d+)?/g) || [];
  const ren = raw.map(x => x.replace(',', '.'));
  return [...new Set(ren)].sort((a, b) => a - b);
};
const to = tal(orig.title + ' ' + orig.description + ' ' + orig.body);
const tn = tal(ny.title + ' ' + ny.description + ' ' + ny.body);
const saknas = to.filter(x => !tn.includes(x));
const extra = tn.filter(x => !to.includes(x));
ok('talparitet (unika tal, originalets alla tal närvarande)', saknas.length === 0,
   `orig ${to.length} unika, ny ${tn.length} unika; saknas i EN: [${saknas.join(', ')}]; extra i EN: [${extra.join(', ')}]`);

// 8. Aritmetik motorräknad
const a1 = 1.06 * 1.00, a2 = 1.06 * 0.92, a3 = 19.7 / 1.123;
ok('aritmetik 1.06×1.00 → 6.0 %', Math.abs((a1 - 1) * 100 - 6.0) < 0.01, `${(a1 - 1) * 100} %`);
// Dokumenterad tolerans (Ö13-precedensen): originalets egen avrundning 0,975 / −2,5 %
// mot motorns 0.9752 / −2.48 % — originaltalen är paritetsbundna, toleransen 0.001/0.05.
ok('aritmetik 1.06×0.92 = 0.975 → −2.5 % (originalets avrundning, tol 0.001/0.05)', Math.abs(a2 - 0.975) < 0.001 && Math.abs((a2 - 1) * 100 + 2.5) < 0.05, `${a2} = ${(a2 - 1) * 100} %`);
ok('aritmetik 19.7÷1.123 ≈ 17.6', Math.abs(a3 - 17.6) < 0.1, `${a3.toFixed(2)}`);

// 9. Disclaimer sista rad, engelsk form
const sista = ny.body.trim().split('\n').pop().trim();
ok('disclaimer sista rad (engelsk form)', sista === '_This is educational financial analysis, not investment advice._', sista);

// 10. Form: obligatoriska BlogPost-fält + slug-konvention
const falt = ['slug', 'title', 'description', 'pillar', 'author', 'publishedAt', 'readingMinutes', 'tags', 'body'];
ok('BlogPost-fält komplet', falt.every(f => ny[f] !== undefined));
ok('slug = originalets + "-en"', ny.slug === orig.slug + '-en', ny.slug);

console.log('\n' + r.join('\n'));
console.log(`\nSLUTSATS: ${fel.length === 0 ? 'KVD GRÖN — ' + r.length + ' kontroller, 0 fel' : 'KVD RÖD — ' + fel.length + ' fel: ' + fel.join('; ')}`);
process.exit(fel.length === 0 ? 0 : 1);
