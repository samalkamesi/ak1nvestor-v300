#!/usr/bin/env node
// KVD för AR16 forsakringsaktier-ar (s3-u3, manifest auto-s3-1789906522650)
// Kontroller enligt AR-konventionen (AR1–AR13): varumärkesgrind, rådverb SV+EN+AR,
// sökord, title/OG, ord, korslänkar, externa URL:er, H2, talparitet, aritmetik,
// readingMinutes, svenska läckor, disclaimer, BlogPost-form.
import { readFileSync } from 'node:fs';

const AR = '/home/ak1a/AK1/data/blogg-utkast/forsakringsaktier-sa-analyserar-du-forsakringsbolag-ar.json';
const SV = '/home/ak1a/AK1/data/blogg-utkast/forsakringsaktier-sa-analyserar-du-forsakringsbolag.json';
const VM = '/home/ak1a/AK1/data/varumarke.json';

const ar = JSON.parse(readFileSync(AR, 'utf8'));
const sv = JSON.parse(readFileSync(SV, 'utf8'));
const vm = JSON.parse(readFileSync(VM, 'utf8'));

const r = [];
const K = (namn, ok, detalj) => { r.push({ namn, ok, detalj }); console.log((ok ? 'GRÖN' : 'FEL ') + ' | ' + namn + (detalj ? ' | ' + detalj : '')); };

// 1. BlogPost-form
const falt = ['slug','title','description','pillar','author','publishedAt','readingMinutes','tags','body'];
K('BlogPost-form', falt.every(f => f in ar) && Array.isArray(ar.tags) && ar.tags.length === 5, 'fält ' + falt.filter(f => !(f in ar)).join(',') + ' saknas-inga; tags ' + ar.tags.length);

const ytor = [ar.title, ar.description, ar.body];

// 2. Varumärkesgrind: egna regexer × 3 ytor
let vmFel = 0, vmVarn = 0, vmTraff = [];
for (const fras of vm.forbjudnaFraser) {
  const re = new RegExp(fras.fran, 'gi');
  for (let i = 0; i < ytor.length; i++) {
    const m = ytor[i].match(re);
    if (m) { if (fras.allvar === 'FEL') vmFel++; else vmVarn++; vmTraff.push(fras.fran + ' @yta' + (i+1)); }
  }
}
K('Varumärkesgrind 26 regexer × 3 ytor', vmFel === 0 && vmVarn === 0, 'FEL ' + vmFel + ', VARNING ' + vmVarn + (vmTraff.length ? ' — ' + vmTraff.join('; ') : ''));

// 3. Rådverb SV+EN+AR
const radRe = [
  /\b(köp|sälj|köp den|håll undan|ta position|i denna aktie|investera i (?:denna|den här) aktien|rekommendera (?:köp|sälj)|mina tips)\b/gi,
  /\b(buy|sell|hold|invest in this|my recommendation|you should buy)\b/gi,
  /(اشترِ|بِع|استثمر في هذا|أنصحك|نوصي بشراء|نصيحتي إليك)/g
];
let radTraff = [];
for (let i = 0; i < ytor.length; i++) for (const re of radRe) { const m = ytor[i].match(re); if (m) radTraff.push([...m].join(',') + ' @yta' + (i+1)); }
K('Rådverb SV+EN+AR', radTraff.length === 0, radTraff.length ? radTraff.join('; ') : '0 träffar');

// 4. Sökord i title + ingress + 2 H2
const SOK = 'أسهم التأمين';
const ingress = ar.body.split('\n\n')[0];
const h2r = (ar.body.match(/^## .*$/gm) || []);
const h2Traff = h2r.filter(h => h.includes(SOK));
K('Sökord i title+ingress+2 H2', ar.title.includes(SOK) && ingress.includes(SOK) && h2Traff.length >= 2,
  'title ' + (ar.title.includes(SOK) ? '✓' : '✗') + ', ingress ' + (ingress.includes(SOK) ? '✓' : '✗') + ', H2 ' + h2Traff.length + ' st: ' + h2Traff.map(h => h.slice(0, 40)).join(' | '));

// 5. Title ≤ 60, OG ≤ 155
K('Title ≤ 60', [...ar.title].length <= 60, [...ar.title].length + '/60');
K('OG-description ≤ 155', [...ar.description].length <= 155, [...ar.description].length + '/155');

// 6. Ord (raw: body split whitespace)
const ordAr = ar.body.trim().split(/\s+/).length;
const ordSv = sv.body.trim().split(/\s+/).length;
K('Ord 1200–1400', ordAr >= 1200 && ordAr <= 1400, ordAr + ' (originalet ' + ordSv + ')');

// 7. Korslänkar multiset mot originalet
const links = s => { const m = s.match(/\]\((\/[^)]+)\)/g) || []; return m.map(x => x.slice(2, -1)).sort(); };
const lAr = links(ar.body), lSv = links(sv.body);
K('Korslänkar multiset', JSON.stringify(lAr) === JSON.stringify(lSv), lAr.length + '/' + lSv.length + (JSON.stringify(lAr) === JSON.stringify(lSv) ? '' : ' — diff: AR[' + lAr.filter(x => !lSv.includes(x)) + '] SV[' + lSv.filter(x => !lAr.includes(x)) + ']'));

// 8. Externa URL:er identiska
const ext = s => (s.match(/https?:\/\/[^)\s]+/g) || []).sort();
const eAr = ext(ar.body), eSv = ext(sv.body);
K('Externa URL:er identiska', JSON.stringify(eAr) === JSON.stringify(eSv), eAr.length + '/' + eSv.length + (JSON.stringify(eAr) === JSON.stringify(eSv) ? '' : ' — AR[' + eAr + '] SV[' + eSv + ']'));

// 9. H2-paritet
const h2Sv = (sv.body.match(/^## .*$/gm) || []);
K('H2-paritet', h2r.length === h2Sv.length, h2r.length + ' = ' + h2Sv.length);

// 10. Talparitet — numerisk multiset, språkmedveten normalisering (AR8-precedensen):
// SV: komma = decimal, mellanslag = tusental. AR: punkt = decimal, komma(3 siffror) = tusental.
const normTal = (s, lang) => {
  const ut = [];
  const re = /\d[\d .,]*\d|\d/g;
  for (let rå of s.match(re) || []) {
    rå = rå.trim();
    if (lang === 'SV') ut.push(parseFloat(rå.replace(/\s/g, '').replace(',', '.')));
    else {
      if (/,\d{3}(\D|$)/.test(rå)) ut.push(parseFloat(rå.replace(/,/g, '')));
      else ut.push(parseFloat(rå.replace(/,/g, '.')));
    }
  }
  return ut;
};
// Tal i URL:er/slugar räknas inte (strippa markdown-länkar och URL:er); datum och år är tal på båda språken och ska vara med.
// KONTROLLBUGG kurerad (motiv, AR3/AR8/AR13-precedensens klass): SV-serien "−22,8, 96,2, 89,0" med
// komma+mellanslag mellan talen slås samman till ETT token av klassen [\d .,] ⇒ SV tappade 96.2 och 89.
// Ingen legitim talnotering i någon av konventionerna innehåller ", " (SV decimal = komma utan space,
// SV tusental = mellanslag; AR decimal = punkt, AR tusental = komma utan space) ⇒ ", " delas symmetriskt
// med ett tokenbrytande tecken — INTE mellanslag, som SV-grenens tusentalsrensning (\s→'') annars åter-
// sammanfogar ("22,8 96,2" → 22.896 — körning 2:s bevisade artefakt).
const stripYta = s => s.replace(/\]\([^)]*\)/g, '[]').replace(/https?:\/\/[^\s)]+/g, '').replace(/,\s+/g, '|');
const tAr = normTal(stripYta(ar.body), 'AR').map(x => isFinite(x) ? Math.round(x * 1000) / 1000 : x).sort((a, b) => a - b);
const tSv = normTal(stripYta(sv.body), 'SV').map(x => isFinite(x) ? Math.round(x * 1000) / 1000 : x).sort((a, b) => a - b);
const multisetEq = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
let talDetalj = 'AR ' + tAr.length + ' / SV ' + tSv.length;
if (!multisetEq(tAr, tSv)) {
  const cnt = m => m.reduce((acc, v) => (acc[v] = (acc[v] || 0) + 1, acc), {});
  const cA = cnt(tAr), cS = cnt(tSv);
  const endastAr = Object.keys(cA).filter(k => !cS[k]).map(k => k + '×' + cA[k]);
  const endastSv = Object.keys(cS).filter(k => !cA[k]).map(k => k + '×' + cS[k]);
  const skillnad = Object.keys(cA).filter(k => cS[k] && cA[k] !== cS[k]).map(k => k + ': AR ' + cA[k] + ' mot SV ' + cS[k]);
  talDetalj += ' — endast-AR [' + endastAr + '] endast-SV [' + endastSv + '] frekvensdiff [' + skillnad + ']';
}
K('Talparitet numerisk multiset', multisetEq(tAr, tSv), talDetalj);

// 11. Aritmetik motorräknad
const approx = (a, b, tol) => Math.abs(a - b) <= tol;
const arit = [
  ['CR-exempel 74+22=96', 74 + 22 === 96],
  ['CR-exempel 82+22=104', 82 + 22 === 104],
  ['Float-exemplet 100×0.04=4', approx(100 * 0.04, 4, 1e-9)],
  ['If-marginal 100−83.6=16.4', approx(100 - 83.6, 16.4, 0.05)],
  ['Allianz-marginal 100−92.2=7.8', approx(100 - 92.2, 7.8, 0.05)],
  ['Allianz kassa/skuld 136.0÷33.7≈4.0 (»fyra gånger«)', approx(136.0 / 33.7, 4, 0.05)],
  ['Sampo 18.16÷2.55≈7.1 > 7 (»mer än sju gånger«)', 18.16 / 2.55 > 7],
  ['Sampo ROE/PB 24.1÷3.38≈7.1', approx(24.1 / 3.38, 7.1, 0.05)],
  ['Allianz ROE/PB 19.6÷2.47≈7.9', approx(19.6 / 2.47, 7.9, 0.05)],
  ['Utdelnings-CAGR (17.10÷11.40)^(1/3)−1≈14.5 %/år', approx((17.10 / 11.40) ** (1 / 3) - 1, 0.145, 0.005)],
  ['Forward över trailing 16.2>14.7', 16.2 > 14.7],
  ['Föregående års CR 83.6+0.7=84.3', approx(83.6 + 0.7, 84.3, 0.05)],
  ['Sampo netto föregående år ≈1998÷1.73≈1155', approx(1998 / 1.73, 1155, 1)]
];
K('Aritmetik 13/13 motorräknad', arit.every(a => a[1]), arit.filter(a => !a[1]).map(a => a[0]).join('; ') || '13/13');

// 12. readingMinutes = round(ord/600)
K('readingMinutes', ar.readingMinutes === Math.round(ordAr / 600), ar.readingMinutes + ' = round(' + ordAr + '/600)');

// 13. Svenska läckor: URL-slugar + egennamn/akronymer/finstermer strippade — kvar ska 0 svenska ord ha
// Tokenisering enligt AR13-kurerad klass: siffror tillåtna i token (AK1A splittras ej),
// punkt/bindestreck/slash FÅR VARA KVAR (P/B, Coca-Cola, allianz.com hålls hela mot vitlistan).
// 'Finance/MarketStack' som ETT token: källetikettens slash-form hålls hel av tokenizern
// (AR13:s punkt-/bindestreck-/slash-kurerade klass) — samma ordning som originalets källa.
const vitlista = ['AK1A','Allianz','Sampo','Berkshire','Hathaway','Nordea','If','P&C','Topdanmark','Hastings','Coca-Cola','combined','ratio','float','forward','trailing','PEG','P/B','ROE','P/E','ROIC','SE','Oyj','allianz.com','sampo.com','StockAnalysis/S&P','Global','Market','Intelligence','Yahoo','Finance/MarketStack'];
const baraLatinska = stripYta(ar.body)
  .replace(/https?:\/\/[^\s)"']+/g, '')
  .replace(/[\[\]()`*_#>•–—…,:;!?«»"']/g, ' ');
const latinskaOrd = (baraLatinska.match(/[a-zA-ZÅÄÖåäö&][a-zA-ZÅÄÖåäö&0-9./-]*/g) || []);
const läckor = [...new Set(latinskaOrd.map(w => w.replace(/[./-]+$/, '')))].filter(w => w && !vitlista.includes(w));
K('Svenska/latinska läckor 0', läckor.length === 0, läckor.length ? 'träffar: ' + läckor.join(', ') : [...new Set(latinskaOrd)].length + ' latinska token, alla vitlistade (egennamn + finstermer + akronymer — AR6/AR7-konventionen)');

// 14. Disclaimer arabisk exakt sista rad
const sista = ar.body.trim().split('\n').pop().trim();
K('Disclaimer arabisk sista rad', sista === '_هذا تحليل مالي تعليمي، وليس نصيحة استثمارية._', sista);

// 15. Slug + publiceringsdatum
K('Slug = originalet + -ar', ar.slug === sv.slug + '-ar', ar.slug);
K('publishedAt dagens dygn', ar.publishedAt === '2026-09-20', ar.publishedAt);

const fel = r.filter(x => !x.ok).length;
console.log('\n=== KVD AR16: ' + (r.length - fel) + '/' + r.length + ' GRÖNA, ' + fel + ' FEL ===');
process.exit(fel ? 1 : 0);
