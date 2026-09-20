#!/usr/bin/env node
// KVD för AR17 medieaktier-ar (s3-u2 byggare 2/3, manifest auto-s3)
// Kontroller enligt AR-konventionen (AR1–AR16): varumärkesgrind, rådverb SV+EN+AR,
// sökord, title/OG, ord, korslänkar, externa URL:er, H2, talparitet, aritmetik,
// readingMinutes, svenska läckor, disclaimer, BlogPost-form.
import { readFileSync } from 'node:fs';

const AR = '/home/ak1a/AK1/data/blogg-utkast/medieaktier-sa-analyserar-du-medie-och-streamingbolag-ar.json';
const SV = '/home/ak1a/AK1/data/blogg-utkast/medieaktier-sa-analyserar-du-medie-och-streamingbolag.json';
const VM = '/home/ak1a/AK1/data/varumarke.json';

const ar = JSON.parse(readFileSync(AR, 'utf8'));
const sv = JSON.parse(readFileSync(SV, 'utf8'));
const vm = JSON.parse(readFileSync(VM, 'utf8'));

const r = [];
const K = (namn, ok, detalj) => { r.push({ namn, ok, detalj }); console.log((ok ? 'GRÖN' : 'FEL ') + ' | ' + namn + (detalj ? ' | ' + detalj : '')); };

// 1. BlogPost-form
const falt = ['slug','title','description','pillar','author','publishedAt','readingMinutes','tags','body'];
K('BlogPost-form', falt.every(f => f in ar) && Array.isArray(ar.tags) && ar.tags.length === 6, 'fält saknas-inga; tags ' + ar.tags.length);

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
const SOK = 'أسهم الإعلام';
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
// ", " delas tokenbrytande (|) symmetriskt på båda språken — AR16-kurerad klass.
// KONTROLLBUGG kurerad (motiv, AR3/AR8/AR13/AR16-precedensens klass): SV-originalets
// "omsatte 2025 45,2" slår tokenklassen [\d .,] samman till ETT token 202545.2. Svensk
// tusentalskonvention är mellanslag före EXAKT tresiffrig grupp ("2 212" är originalets
// enda legitima mellanslagstusental) ⇒ mellanslag mellan siffror sammanslås endast vid
// tresiffrig grupp, i övrigt delas det tokenbrytande med | — symmetriskt mot AR16:s ", "-kur.
const svTusentalsFix = s => s.replace(/(\d) (\d+)(?=[^\d]|$)/g, (m, a, b) => (b.length === 3 ? a + b : a + '|' + b));
const stripYta = (s, lang) => s.replace(/\]\([^)]*\)/g, '[]').replace(/https?:\/\/[^\s)]+/g, '').replace(/,\s+/g, '|');
const tAr = normTal(stripYta(ar.body, 'AR'), 'AR').map(x => isFinite(x) ? Math.round(x * 1000) / 1000 : x).sort((a, b) => a - b);
const tSv = normTal(svTusentalsFix(stripYta(sv.body, 'SV')), 'SV').map(x => isFinite(x) ? Math.round(x * 1000) / 1000 : x).sort((a, b) => a - b);
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

// 11. Aritmetik motorräknad (B17:s räknevärld)
const approx = (a, b, tol) => Math.abs(a - b) <= tol;
const arit = [
  ['Abonnentexemplet 10M×120kr×12 = 14.4 mdr', approx(10 * 120 * 12 / 1000, 14.4, 1e-9)],
  ['Täckning 14.4 − 12 = 2.4', approx(14.4 - 12, 2.4, 1e-9)],
  ['Tillväxt 10 % av 14.4 = 1.44', approx(0.10 * 14.4, 1.44, 1e-9)],
  ['Ny täckning 2.4 + 1.44 = 3.84', approx(2.4 + 1.44, 3.84, 1e-9)],
  ['Hävstång 3.84÷2.4 − 1 = 60 %', approx(3.84 / 2.4 - 1, 0.60, 1e-9)],
  ['Netflix CAGR (45.2÷31.6)^(1/3)−1 ≈ 12.6 %', approx((45.2 / 31.6) ** (1 / 3) - 1, 0.126, 0.001)],
  ['Netflix brutto 45.2×49.1 % ≈ 22 (»omkring«)', approx(45.2 * 0.491, 22, 0.3)],
  ['Viaplay brutto 18.6×15.0 % ≈ 2.8 (»knappt«)', approx(18.6 * 0.15, 2.8, 0.05)],
  ['WBD-vändningen −11.3 → +0.7 (0.7 > 0)', 0.7 > 0],
  ['Spotify-vändningen −532 → +2212 (2212 > 532)', 2212 > 532],
  ['Disney 2.4 → 12.4 (mer än femdubbling)', 12.4 / 2.4 > 5],
  ['MTG 6.5 → 0.2 (0.2 < 6.5)', 0.2 < 6.5],
  ['Skuldspannet 0.06 < 0.55 < 3.30', 0.06 < 0.55 && 0.55 < 3.30],
  ['ROE-spannet +49.5 > 0 > −52.9', 49.5 > 0 && 0 > -52.9]
];
K('Aritmetik 14/14 motorräknad', arit.every(a => a[1]), arit.filter(a => !a[1]).map(a => a[0]).join('; ') || '14/14');

// 12. readingMinutes = round(ord/600)
K('readingMinutes', ar.readingMinutes === Math.round(ordAr / 600), ar.readingMinutes + ' = round(' + ordAr + '/600)');

// 13. Svenska läckor: URL-slugar + egennamn/akronymer/finstermer strippade — kvar ska 0 svenska ord ha
// Tokenisering enligt AR13/AR16-kurerad klass: siffror tillåtna i token (AK1A splittras ej),
// punkt/bindestreck/slash FÅR VARA KVAR (P/B, EV/Sales, ir.netflix.net hålls hela mot vitlistan).
const vitlista = ['AK1A','Disney','Netflix','Spotify','Viaplay','Warner','Bros','Discovery','Modern','Times','Group','MTG','The','Walt','Company','churn','P/E','P/B','PEG','ROE','EV/Sales','EV/EBITDA','ARPU','ARR','P/S','forward','trailing','streaming','Yahoo','Finance','MarketStack','Stockanalysis/S&P','StockAnalysis/S&P','Global','viaplaygroup.com','mtg.com','thewaltdisneycompany.com','wbd.com','ir.netflix.net','investors.spotify.com'];
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
console.log('\n=== KVD AR17: ' + (r.length - fel) + '/' + r.length + ' GRÖNA, ' + fel + ' FEL ===');
process.exit(fel ? 1 : 0);
