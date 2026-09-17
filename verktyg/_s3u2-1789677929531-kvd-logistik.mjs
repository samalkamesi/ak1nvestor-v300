// KVD för B21 logistikaktier — 0 FEL 0 VARNING = GRÖN krävs före commit
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const FIL = 'data/blogg-utkast/logistikaktier-sa-analyserar-du-fraktbolag.json';
const p = JSON.parse(readFileSync(FIL, 'utf8'));
let fel = 0, varning = 0;
const F = (m) => { fel++; console.log('FEL:', m); };
const V = (m) => { varning++; console.log('VARN:', m); };

// 1. BlogPost-form: exakt 9 fält
const falt = ['slug','title','description','pillar','author','publishedAt','readingMinutes','tags','body'];
const nycklar = Object.keys(p);
if (nycklar.join(',') !== falt.join(',')) F(`BlogPost-form: fick ${nycklar.join(',')}`);

// 2. Varumärkesgrind: samtliga forbjudnaFraser (giu) × title+desc+body
const vm = JSON.parse(readFileSync('data/varumarke.json', 'utf8'));
const ytor = [p.title, p.description, p.body];
for (const r of vm.forbjudnaFraser) {
  const re = new RegExp(r.fran, 'giu');
  for (const yta of ytor) { const t = yta.match(re); if (t) F(`varumärkesgrind "${r.fran}" träff: ${t[0]}`); }
}
console.log(`varumärkesgrind: ${vm.forbjudnaFraser.length} regexer × 3 ytor körd`);

// 3. Rådverb SV+EN
const rad = [/köp\s+(denna|den här|aktien)/giu, /\bsälj\s+(aktien|denna)/giu, /vi\s+rekommenderar/giu, /\bbör\s+du\s+(köpa|sälja)/giu, /you\s+should\s+(buy|sell)/giu, /we\s+recommend/giu, /\binvesterar\s+i\s+/giu, /\bundvik\s+aktien/giu];
for (const r of rad) { const t = (p.title + ' ' + p.description + ' ' + p.body).match(r); if (t) F(`rådverb "${r}" träff: ${t[0]}`); }

// 4. Ord (raw-metoden), span 800–1400, mål 1200
const ord = p.body.split(/\s+/).filter(Boolean).length;
console.log('ord:', ord);
if (ord < 800 || ord > 1400) F(`ord ${ord} utanför span 800–1400`);
if (p.readingMinutes !== Math.round(ord / 600)) F(`readingMinutes ${p.readingMinutes} != round(${ord}/600)=${Math.round(ord/600)}`);

// 5. Title ≤ 60, desc ≤ 155
if (p.title.length > 60) F(`title ${p.title.length} > 60`);
if (p.description.length > 155) F(`desc ${p.description.length} > 155`);
console.log('title tkn:', p.title.length, '/ desc tkn:', p.description.length);

// 6. Sökordsdisciplin: "logistikaktier" i title + ingress (första stycket) + minst en H2
const sok = 'logistikaktier';
const h2 = p.body.split('\n').filter(l => l.startsWith('## '));
const ingress = p.body.split('\n\n')[0];
if (!p.title.toLowerCase().includes(sok)) F('sökord saknas i title');
if (!ingress.toLowerCase().includes(sok)) F('sökord saknas i ingress');
if (!h2.some(h => h.toLowerCase().includes(sok))) F('sökord saknas i H2');
console.log(`sökord "${sok}": title ✓ ingress ${ingress.toLowerCase().includes(sok) ? '✓' : '✗'} H2 ${h2.filter(h=>h.toLowerCase().includes(sok)).length} st`);

// 7. Korslänkar: /kurser/ mot register, /blogg/ mot publicerade; 0 utkastlänkar
const dc = JSON.parse(readFileSync('public/deep-courses.json', 'utf8'));
const kursreg = new Set(Object.keys(dc));
const bloggreg = new Set(readdirSync('data/blogg').filter(f => f.endsWith('.json')).map(f => f.replace('.json', '')));
const lankar = [...p.body.matchAll(/\]\((\/(?:kurser|blogg)\/[^)]+)\)/g)].map(m => m[1]);
let doda = 0;
for (const l of lankar) {
  const slug = l.replace('/kurser/', '').replace('/blogg/', '');
  if (l.startsWith('/kurser/')) { if (!kursreg.has(slug)) { F(`död kurslänk ${l}`); doda++; } }
  else { if (!bloggreg.has(slug)) { F(`död blogglänk ${l}`); doda++; } }
}
const utkast = readdirSync('data/blogg-utkast').filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
const utkastLank = lankar.filter(l => utkast.includes(l.replace('/kurser/', '').replace('/blogg/', '')));
if (utkastLank.length) F(`länkar till utkast: ${utkastLank.join(', ')}`);
console.log(`korslänkar: ${lankar.length} st (${lankar.filter(l=>l.startsWith('/kurser/')).length} kurser + ${lankar.filter(l=>l.startsWith('/blogg/')).length} poster), döda: ${doda}, utkastlänkar: ${utkastLank.length}`);

// 8. Disclaimer-sista-rad identisk mallens
const siste = p.body.trimEnd().split('\n').pop().trim();
if (siste !== '_Detta är pedagogisk finansanalys, inte investeringsråd._') F(`disclaimer-sista-rad avviker: "${siste}"`);

// 9. Mjuka/hårda bindestreck (U+00AD, U+2010, U+2011)
for (const [namn, tecken] of [['soft hyphen','\u00ad'], ['hyphen U+2010','\u2010'], ['non-breaking hyphen','\u2011']]) {
  if ((p.title + p.description + p.body).includes(tecken)) F(`${namn} i text`);
}

// 10. Aritmetik — samtliga räknepåståenden i guiden
const A = [
  ['Maersk 2022 marginal', 31/82*100, 37.8, 0.1],
  ['Maersk 2025 marginal', 3.5/54.0*100, 6.5, 0.05],
  ['Maersk 2022→2023 EBIT', (4-31)/31*100, -87, 0.5],
  ['DSV bruttomarginal 2025', 66859/247331*100, 27.0, 0.05],
  ['DSV bruttomarginal 2024', 42974/167106*100, 25.7, 0.05],
  ['DSV EBIT-tillväxt', (19611/16096-1)*100, 21.8, 0.05],
  ['DSV vinstförändring', (8463/10175-1)*100, -16.8, 0.05],
  ['DSV intäktstillväxt', (247331/167106-1)*100, 48, 0.5],
  ['Air&Sea andel av EBIT', 13013/19611*100, 66.4, 0.5],
  ['K+N rörelsemarginal', 1242/24476*100, 5.1, 0.05],
  ['K+N bruttomarginal', 8800/24476*100, 36.0, 0.05],
  ['K+N EBIT-förändring', (1242/1654-1)*100, -24.9, 0.05],
];
for (const [namn, räknat, påstått, tol] of A) {
  if (Math.abs(räknat - påstått) > tol) F(`aritmetik ${namn}: räknat ${räknat.toFixed(2)} mot påstått ${påstått}`);
  else console.log(`aritmetik ✓ ${namn}: ${räknat.toFixed(2)} ≈ ${påstått}`);
}
// Talnärvaro i bodyn (citerade källtal finns med)
const tal = ['247,3','66,9','27,0','19,6','21,8','50,9','51,6','16,3','5,6','13,0','2,7','3,8','8,5','10,2','4,5','0,8','23,0–25,5','24,5','8,8','1 242','5,1','36,0','24,9','37,8','6,5','31','3,5','82','54'];
const saknade = tal.filter(t => !p.body.includes(t));
if (saknade.length) V(`tal saknas i body: ${saknade.join(', ')}`);
else console.log(`talganska: ${tal.length}/${tal.length} citerade tal närvarande`);

console.log(`\n=== KVD: ${fel} FEL, ${varning} VARNING — ${fel === 0 && varning === 0 ? 'GRÖN' : 'RÖD'} ===`);
process.exit(fel === 0 && varning === 0 ? 0 : 1);
