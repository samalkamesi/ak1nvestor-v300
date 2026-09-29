#!/usr/bin/env node
// KVD för B31 kemiktier-en (engelsk spegling av kemiguiden) — B33-mallens kontrollklasser
// anpassade för översättningsfallet: talparitet SV↔EN, korslänkar multiset mot originalet,
// engelsk disclaimer-form, sökord "chemical stocks".
import fs from 'node:fs';
import https from 'node:https';

const FIL = '/home/ak1a/AK1/data/blogg-utkast/kemiktier-sa-analyserar-du-kemibalag-en.json';
const ORIG = '/home/ak1a/AK1/data/blogg-utkast/kemiktier-sa-analyserar-du-kemibalag.json';
const vm = JSON.parse(fs.readFileSync('/home/ak1a/AK1/data/varumarke.json', 'utf8'));
const j = JSON.parse(fs.readFileSync(FIL, 'utf8'));
const o = JSON.parse(fs.readFileSync(ORIG, 'utf8'));

const body = j.body;
const ytor = { title: j.title, description: j.description, body };
let fel = 0, varn = 0;
const F = (m) => { fel++; console.log('FEL:', m); };
const V = (m) => { varn++; console.log('VARN:', m); };
const OK = (m) => console.log('ok:', m);

// 1. Varumärkesgrindens egna regexer × 3 ytor
let vmTräffar = 0;
for (const r of vm.forbjudnaFraser) {
  const re = new RegExp(r.fran, 'giu');
  for (const [namn, yta] of Object.entries(ytor)) {
    const t = yta.match(re);
    if (t) { vmTräffar++; F(`varumärkesgrind [${r.id ?? r.fran}] på ${namn}: "${t[0]}" (${r.allvar})`); }
  }
}
OK(`varumärkesgrind ${vm.forbjudnaFraser.length} regexer × 3 ytor = ${vmTräffar} träffar`);

// 2. Rådverb SV+EN, ordgränsmedvetna
const radVerb = /\b(köp|köper|köp\.|sälj|sälja|säljer|rekommendera|rekommenderar|rekommendation|buy|sell|hold|recommend(?:s|ed|ation)?)\b/gi;
for (const [namn, yta] of Object.entries(ytor)) {
  const t = [...yta.matchAll(radVerb)].map(m => m[0]);
  if (t.length) F(`rådverb på ${namn}: ${t.join(', ')}`);
}
OK('rådverb SV+EN 0 (ordgränsmedveten)');

// 3. Sökord i title (först) + description + H1 + ingress + >=2 H2
const sok = 'chemical stocks';
const h1 = body.match(/^# (.+)$/m)?.[1] ?? '';
const h2or = [...body.matchAll(/^## (.+)$/gm)].map(m => m[1]);
const ingress = body.split('\n\n')[1] ?? '';
if (!j.title.toLowerCase().startsWith(sok)) F('sökord ej först i title');
if (!j.description.toLowerCase().includes(sok)) F('sökord saknas i description');
if (!h1.toLowerCase().includes(sok)) F('sökord saknas i H1');
if (!ingress.toLowerCase().includes(sok)) F('sökord saknas i ingress');
const h2med = h2or.filter(h => h.toLowerCase().includes(sok)).length;
if (h2med < 2) F(`sökord i endast ${h2med} H2 (krav >=2)`);
OK(`sökord i title+description+H1+ingress+${h2med} H2`);

// 4. Längder
if (j.title.length > 60) F(`title ${j.title.length}/60`);
if (j.description.length > 155) F(`description ${j.description.length}/155`);
OK(`title ${j.title.length}/60, description ${j.description.length}/155`);

// 5. Ord (B32-metoden)
const ren = (s) => s.replace(/^[-#>*_]+/gm, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/https?:\/\/\S+/g, '').replace(/[*_`]/g, '');
const ord = ren(body).split(/\s+/).filter(w => /[\p{L}\p{N}]/u.test(w)).length;
if (ord < 1200 || ord > 1400) F(`ord ${ord} utanför 1200–1400`);
OK(`ord ${ord}/1200–1400 (originalet enligt mallens räknemodell)`);

// 6. Korslänkar: MULTISET-identiska med originalet + mot publicerade ytor
const lankarAv = (s) => [...s.matchAll(/\]\((\/(?:kurser|blogg)\/[^)]+)\)/g)].map(m => m[1]);
const lEN = lankarAv(body), lSV = lankarAv(o.body);
const sorterad = (a) => [...a].sort();
if (JSON.stringify(sorterad(lEN)) !== JSON.stringify(sorterad(lSV))) {
  const baraEN = lEN.filter(x => !lSV.includes(x)), baraSV = lSV.filter(x => !lEN.includes(x));
  F(`korslänkar ej multiset-identiska med originalet (enbart EN: ${baraEN.join(', ')}; enbart SV: ${baraSV.join(', ')})`);
}
const dc = JSON.parse(fs.readFileSync('/home/ak1a/AK1/public/deep-courses.json', 'utf8'));
const kurser = (Array.isArray(dc) ? dc : (dc.courses || Object.values(dc))).map(x => x.id ?? x.slug).filter(Boolean);
const blogg = fs.readdirSync('/home/ak1a/AK1/data/blogg').filter(f => f.endsWith('.json'))
  .flatMap(f => { try { return [JSON.parse(fs.readFileSync('/home/ak1a/AK1/data/blogg/' + f, 'utf8')).slug]; } catch { return []; } });
const interna = lEN.map(l => l.replace('/kurser/', '').replace('/blogg/', ''));
const döda = interna.filter(l => !kurser.includes(l) && !blogg.includes(l));
if (döda.length) F(`korslänkar mot icke-publicerade ytor: ${[...new Set(döda)].join(', ')}`);
OK(`korslänkar ${lEN.length} (${new Set(lEN).size} unika) — multiset-identiska med originalet, mot publicerade ytor`);

// 7. Externa URL:er — identiska uppsättning med originalet + slutstatus 200
const extAv = (s) => [...new Set([...s.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map(m => m[1]))];
const eEN = extAv(body), eSV = extAv(o.body);
if (JSON.stringify([...eEN].sort()) !== JSON.stringify([...eSV].sort())) F(`externa URL:er skiljer från originalet (EN: ${eEN.join(', ')}; SV: ${eSV.join(', ')})`);
const hamta = (u, hopp = 0) => new Promise(res => {
  const req = https.get(u, { headers: { 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64)' }, timeout: 15000 }, r => {
    if ([301, 302, 307, 308].includes(r.statusCode) && r.headers.location && hopp < 5) { req.destroy(); return res(hamta(new URL(r.headers.location, u).href, hopp + 1)); }
    res(String(r.statusCode));
  });
  req.on('error', () => res('ERR')).on('timeout', () => { req.destroy(); res('TIMEOUT'); });
});
for (const u of eEN) {
  const code = await hamta(u);
  if (code === '200' || (u.includes('eur-lex') && code === '202')) OK(`extern ${code} ${u}`);
  else F(`extern ${code} ${u}`);
}

// 8. Aritmetik motorräknad (originalets egna ekvationer — speglingen får inga nya)
const arit = [
  ['Norden Bulk brutto', 12000 * 0.18, 2160],
  ['Norden Special brutto', 3000 * 0.38, 1140],
  ['specials bruttovinstandel', 1140 / (2160 + 1140), 0.345],
  ['specials omsättningsandel', 3000 / (12000 + 3000), 0.20],
  ['gas 4', 33 * 4, 132],
  ['gas 8', 33 * 8, 264],
  ['gas 12', 33 * 12, 396],
  ['Yara oms utfall', 165.1 / 249.7 - 1, -0.339],
  ['Yara botten mot topp', 157 / 28800, 0.005],
  ['Yara 2025 mot topp', 13.0 / 28.8, 0.45],
  ['partner kostnad', 396 + 150, 546],
  ['lågkostnad kostnad', 132 + 150, 282],
  ['partner marginal', 560 - 546, 14],
  ['lågkostnad marginal', 560 - 282, 278],
  ['marginalkvot', 278 / 14, 19.9],
  ['gaschock kostnad', 264 + 150, 414],
  ['gaschock marginal', 560 - 414, 146],
  ['prisfall lågkostnad', 500 - 282, 218],
  ['prisfall partner', 500 - 546, -46],
  ['stabiliseringsmarginal', 500 - 414, 86],
  ['FoU special', 150 / 3000, 0.05],
  ['FoU bulk', 60 / 12000, 0.005],
  ['FoU-kvot', (150 / 3000) / (60 / 12000), 10],
  ['BASF oms utfall', 59657 / 87327 - 1, -0.317]
];
for (const [namn, motor, text] of arit) {
  if (Math.abs(motor - text) > Math.max(0.05, Math.abs(text) * 0.01)) F(`aritmetik ${namn}: motor ${motor.toFixed(4)} mot text ${text}`);
}
OK(`aritmetik ${arit.length}/${arit.length} motorräknad`);

// 9. TALPARITET SV↔EN — talmultiset tusentelsnormaliserad
// SV: mellanslag = tusentelsavgränsare, komma = decimal. EN: komma = tusentelsavgränsare, punkt = decimal.
// Kur (AR8/Ö14-klassen): tusentalsavgränsaren normaliseras ENDAST som (siffra)(sep)(exakt 3 siffror)(ej siffra),
// iterativt — annars sammansmälter klassen "[ ,.]\d+" ordlösa årstalsgrannar ("26 940 2025" i originalet).
const tusSV = (s) => { let p = s; while (true) { const n = p.replace(/(\d) (\d{3})(?!\d)/g, '$1$2'); if (n === p) return n; p = n; } };
const tusEN = (s) => { let p = s; while (true) { const n = p.replace(/(\d),(\d{3})(?!\d)/g, '$1$2'); if (n === p) return n; p = n; } };
const rensa = (s) => s.replace(/https?:\/\/\S+/g, '');
const talSV = [...tusSV(rensa(o.body)).matchAll(/\d+(?:[.,]\d+)?/g)].map(m => m[0].replace(/,/g, '.'));
const talEN = [...tusEN(rensa(body)).matchAll(/\d+(?:[.,]\d+)?/g)].map(m => m[0].replace(/,/g, '.'));
const mSV = [...talSV.map(Number).map(v => v.toFixed(4))].sort();
const mEN = [...talEN.map(Number).map(v => v.toFixed(4))].sort();
if (JSON.stringify(mSV) !== JSON.stringify(mEN)) {
  const freq = (a) => a.reduce((m, x) => (m[x] = (m[x] ?? 0) + 1, m), {});
  const fSV = freq(mSV), fEN = freq(mEN);
  const diff = new Set([...Object.keys(fSV), ...Object.keys(fEN)].filter(k => fSV[k] !== fEN[k]));
  F(`talparitet differs (antal SV ${mSV.length} / EN ${mEN.length}): ${[...diff].map(k => `${k}: SV ${fSV[k] ?? 0}/EN ${fEN[k] ?? 0}`).join('; ')}`);
} else OK(`talparitet ${mEN.length}/${mEN.length} tal tusentelsnormaliserad multiset`);

// 10. Struktur
if (h2or.length < 5) F(`H2 ${h2or.length} < 5`);
if ((body.match(/^# /gm) || []).length !== 1) F('H1 != 1');
if (h2or.length !== [...o.body.matchAll(/^## (.+)$/gm)].length) F(`H2-antal skiljer från originalet (${h2or.length} mot ${[...o.body.matchAll(/^## (.+)$/gm)].length})`);
const sista = body.trimEnd().split('\n').pop();
if (sista !== '_This is educational financial analysis, not investment advice._') F(`disclaimer ej exakt sista rad: "${sista}"`);
const rm = Math.round(ord / 600);
if (j.readingMinutes !== rm) F(`readingMinutes ${j.readingMinutes} != round(${ord}/600)=${rm}`);
if (j.publishedAt !== '2026-09-29') F(`publishedAt ${j.publishedAt} != leveransdagen 2026-09-29`);
if (j.slug !== o.slug + '-en') F(`slug ${j.slug} != originalets + '-en'`);
for (const fält of ['slug', 'title', 'description', 'pillar', 'author', 'publishedAt', 'readingMinutes', 'tags', 'body']) if (!(fält in j)) F(`BlogPost-fält saknas: ${fält}`);
OK(`H2 ${h2or.length}, H1 1, readingMinutes ${rm}, BlogPost-formen komplett, disclaimer engelsk exakt sista rad, slug = originalet + -en`);

console.log(`\n=== KVD B31-en: ${fel} FEL, ${varn} VARN ===`);
process.exit(fel ? 1 : 0);
