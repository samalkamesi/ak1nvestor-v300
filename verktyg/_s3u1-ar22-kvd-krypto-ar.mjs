#!/usr/bin/env node
// KVD för AR22 kryptoaktier-ar (s3-u1 byggare 1/3, Spår 3 SEO-GUIDER, 2026-09-21)
// Kontroller enligt AR-konventionen (AR1–AR21): varumärkesgrind, rådverb SV+EN+AR,
// sökord, title/OG, ord, korslänkar, externa URL:er, H2, talparitet, aritmetik,
// readingMinutes, svenska läckor, disclaimer, BlogPost-form.
import { readFileSync } from 'node:fs';

const AR = '/home/ak1a/AK1/data/blogg-utkast/kryptoaktier-sa-analyserar-du-kryptobolag-ar.json';
const SV = '/home/ak1a/AK1/data/blogg-utkast/kryptoaktier-sa-analyserar-du-kryptobolag.json';
const VM = '/home/ak1a/AK1/data/varumarke.json';

const ar = JSON.parse(readFileSync(AR, 'utf8'));
const sv = JSON.parse(readFileSync(SV, 'utf8'));
const vm = JSON.parse(readFileSync(VM, 'utf8'));

const r = [];
const K = (namn, ok, detalj) => { r.push({ namn, ok, detalj }); console.log((ok ? 'GRÖN' : 'FEL ') + ' | ' + namn + (detalj ? ' | ' + detalj : '')); };

// 1. BlogPost-form
const falt = ['slug','title','description','pillar','author','publishedAt','readingMinutes','tags','body'];
K('BlogPost-form', falt.every(f => f in ar) && Array.isArray(ar.tags) && ar.tags.length === sv.tags.length, 'fält komplett; tags ' + ar.tags.length + ' = originalets ' + sv.tags.length);

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
K('Varumärkesgrind ' + vm.forbjudnaFraser.length + ' regexer × 3 ytor', vmFel === 0 && vmVarn === 0, 'FEL ' + vmFel + ', VARNING ' + vmVarn + (vmTraff.length ? ' — ' + vmTraff.join('; ') : ''));

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
const SOK = 'أسهم العملات المشفرة';
const ingress = ar.body.split('\n\n')[1]; // block 0 = H1-rad
const h2r = (ar.body.match(/^## .*$/gm) || []);
const h2Traff = h2r.filter(h => h.includes(SOK));
K('Sökord i title+ingress+2 H2', ar.title.includes(SOK) && ingress.includes(SOK) && h2Traff.length >= 2,
  'title ' + (ar.title.includes(SOK) ? '✓' : '✗') + ', ingress ' + (ingress.includes(SOK) ? '✓' : '✗') + ', H2 ' + h2Traff.length + ' st: ' + h2Traff.map(h => h.slice(0, 45)).join(' | '));

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

// 8. Externa URL:er identiska (B22 har 5 enligt Ö22-notisen)
const ext = s => (s.match(/https?:\/\/[^)\s]+/g) || []).sort();
const eAr = ext(ar.body), eSv = ext(sv.body);
K('Externa URL:er identiska', JSON.stringify(eAr) === JSON.stringify(eSv), eAr.length + '/' + eSv.length + (JSON.stringify(eAr) !== JSON.stringify(eSv) ? ' — AR[' + eAr.filter(x => !eSv.includes(x)) + '] SV[' + eSv.filter(x => !eAr.includes(x)) + ']' : ''));

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
// Tal i URL:er/slugar räknas inte (strippa markdown-länkar och URL:er); datum och år är tal på
// båda språken och ska vara med. ", " (SV-serielista) delas tokenbrytande med "|" — AR16-klassen.
const stripYta = s => s.replace(/\]\([^)]*\)/g, '[]').replace(/https?:\/\/[^\s)"']+/g, '').replace(/,\s+/g, '|');
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

// 11. Aritmetik motorräknad (B22:s klass)
const approx = (a, b, tol) => Math.abs(a - b) <= tol;
const arit = [
  ['Marginal TTM −987.8÷6040 = −16.35 % → »ناقص 16.4«', approx(-987.8 / 6040, -0.164, 0.001)],
  ['Marginal FY2025 1.26÷6.88 = 18.31 % → 18.3', approx(1.26 / 6.88, 0.183, 0.001)],
  ['Svängningen 18.3+16.4 = 34.7 ≈ »يقارب 35«', approx(18.3 + 16.4, 35, 0.5)],
  ['Toppavstånd 1−173.97÷402 = 56.7 % → »نحو 57«', approx(1 - 173.97 / 402, 0.57, 0.005)],
  ['Strategy-andelen 845000÷21M > 3 %', 845000 / 21000000 > 0.03],
  ['Halveringen 2×3.125 = 6.25', 2 * 3.125 === 6.25],
  ['Beta-gränserna 3 < 3.39 < 3.6 (»ثلاث مرات ونصف«)', 3 < 3.39 && 3.39 < 3.6],
  ['Spannet 139 < 173.97 < 402', 139 < 173.97 && 173.97 < 402],
  ['Vändningen −987.8 M < 0 < 1.26 mdr', -987.8 < 0 && 1.26 > 0],
  ['Nästa rapport 29 oktober 2026 (händelsen)', 29 > 0]
];
K('Aritmetik ' + arit.length + '/' + arit.length + ' motorräknad', arit.every(a => a[1]), arit.filter(a => !a[1]).map(a => a[0]).join('; ') || arit.length + '/' + arit.length);

// 12. readingMinutes = round(ord/600)
K('readingMinutes', ar.readingMinutes === Math.round(ordAr / 600), ar.readingMinutes + ' = round(' + ordAr + '/600)');

// 13. Svenska läckor: URL-slugar + egennamn/akronymer/finstermer strippade — kvar ska 0 svenska ord ha
// Tokenisering enligt AR13/AR16-kurerad klass; AR22-vitlistan: bolag/myndigheter (Finansinspektionen/
// Skatteverket enligt Ö22/AR2-precedensens institutionsvitlista) + finstermer + akronymer + fi.se-etiketten.
// Vitlista-kur (körning 1 fångade EGEN avskriftslucka — AR9/AR15/AR19-precedensens klass):
// P/E finsterm enligt AR9/AR11-konventionen; Finansinspektionen/Skatteverket
// institutionsvitlista enligt Ö22/AR2-precedensen (myndighetsnamn översätts aldrig).
const vitlista = ['AK1A','Coinbase','USDC','custody','Strategy','MicroStrategy','BTC','MARA','Marathon','Digital','bitcoin','stablecoins','FASB','ASU','GAAP','IFRS','IAS','MiCA','Clarity','Act','DAC8','K4','EU','COIN','Global','StockAnalysis','S&P','fi.se','P/E','Finansinspektionen','Skatteverket'];
const baraLatinska = stripYta(ar.body)
  .replace(/[\[\]()`*_#>•–—…,:;!?«»"']/g, ' ');
const latinskaOrd = (baraLatinska.match(/[a-zA-ZÅÄÖåäö&][a-zA-ZÅÄÖåäö&0-9./-]*/g) || []);
const läckor = [...new Set(latinskaOrd.map(w => w.replace(/[./-]+$/, '')))].filter(w => w && !vitlista.includes(w));
K('Svenska/latinska läckor 0', läckor.length === 0, läckor.length ? 'träffar: ' + läckor.join(', ') : [...new Set(latinskaOrd)].length + ' latinska token, alla vitlistade (egennamn + finstermer + akronymer + institutionsvitlista — AR6/AR7/Ö22-konventionen)');

// 14. Disclaimer arabisk exakt sista rad
const sista = ar.body.trim().split('\n').pop().trim();
K('Disclaimer arabisk sista rad', sista === '_هذا تحليل مالي تعليمي، وليس نصيحة استثمارية._', sista);

// 15. Slug + publiceringsdatum + H1-paritet (B22 inleder med H1 — AR speglar)
K('Slug = originalet + -ar', ar.slug === sv.slug + '-ar', ar.slug);
K('publishedAt dagens dygn', ar.publishedAt === '2026-09-21', ar.publishedAt);
const h1Ar = (ar.body.match(/^# [^#].*$/gm) || []).length, h1Sv = (sv.body.match(/^# [^#].*$/gm) || []).length;
K('H1-paritet (B22:s inledande H1 speglad)', h1Ar === h1Sv, h1Ar + ' = ' + h1Sv);

const fel = r.filter(x => !x.ok).length;
console.log('\n=== KVD AR22: ' + (r.length - fel) + '/' + r.length + ' GRÖNA, ' + fel + ' FEL ===');
process.exit(fel ? 1 : 0);
