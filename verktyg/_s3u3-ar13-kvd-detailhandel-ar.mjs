#!/usr/bin/env node
// KVD för AR13 detailhandelsaktier-ar (s3-u3, manifest auto-s3-1789884303011)
// Kontroller enligt AR-konventionen (AR1–AR10): varumärkesgrind, rådverb SV+EN+AR,
// sökord, title/OG, ord, korslänkar, externa URL:er, H2, talparitet, aritmetik,
// readingMinutes, svenska läckor, disclaimer, BlogPost-form.
import { readFileSync } from 'node:fs';

const AR = '/home/ak1a/AK1/data/blogg-utkast/detailhandelsaktier-sa-analyserar-du-detaljhandelsbolag-ar.json';
const SV = '/home/ak1a/AK1/data/blogg-utkast/detailhandelsaktier-sa-analyserar-du-detaljhandelsbolag.json';
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
const SOK = 'أسهم تجارة التجزئة';
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
      // AR: "1,000"-stil kan förekomma; i denna text används punkt-decimaler och inga tusentalskomman — hantera ändå
      if (/,\d{3}(\D|$)/.test(rå)) ut.push(parseFloat(rå.replace(/,/g, '')));
      else ut.push(parseFloat(rå.replace(/,/g, '.')));
    }
  }
  return ut;
};
// Tal i URL:er/slugar räknas inte: strippa markdown-länkar och URL:er samt datum i källor? Nej — datum är tal på båda språken och ska vara med. Endast länkar+URL:er strippas.
const stripYta = s => s.replace(/\]\([^)]*\)/g, '[]').replace(/https?:\/\/[^\s)]+/g, '');
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
  ['Axfood EK 53.1÷7.5', approx(53.1 / 7.5, 7.1, 0.05)],
  ['Axfood kapitalomsättning 89.2÷7.1', approx(89.2 / 7.1, 12.6, 0.05)],
  ['Axfood ROE-bygge 2.7×12.6', approx(2.7 * 12.6, 34, 0.5)],
  ['H&M EK 275.5÷8.1', approx(275.5 / 8.1, 34, 0.05)],
  ['H&M ROE-bygge 5.6×6.7≈37 (originalets egen avrundning av 37.52 — Ö13-tolerans)', approx(5.6 * 6.7, 37, 0.53)],
  ['Rea: brutto 54−3=51 (10 % av 100 med 30 % rabatt = 3)', 54 - 3 === 51],
  ['Rea: rörelse 11−3=8', 11 - 3 === 8],
  ['Rea: 3/11 av resultatet > en fjärdedel', 3 / 11 > 0.25],
  ['H&M resultat 12.2/3.6 = mer än tredubbling', 12.2 / 3.6 > 3],
  ['Axfood CAGR (89.2/73.5)^(1/3)−1 ≈ 6.7 %', approx((89.2 / 73.5) ** (1 / 3) - 1, 0.067, 0.001)],
  ['PEG 21.9÷8.4 ≈ 2.6', approx(21.9 / 8.4, 2.6, 0.05)],
  ['Rörelsegap 20.1−11.0 = 9.1 → "mer än nio"', 20.1 - 11.0 > 9]
];
K('Aritmetik 12/12 motorräknad', arit.every(a => a[1]), arit.filter(a => !a[1]).map(a => a[0]).join('; ') || '12/12');

// 12. readingMinutes = round(ord/600)
K('readingMinutes', ar.readingMinutes === Math.round(ordAr / 600), ar.readingMinutes + ' = round(' + ordAr + '/600)');

// 13. Svenska läckor: URL-slugar + egennamn/akronymer/finstermer strippade — kvar ska 0 svenska ord ha
// KONTROLLBUGG kurerad (motiv, AR3/AR9-precedensens klass): (a) tokeniseringen tillåter nu siffror så
// att varumärket AK1A inte splittras till "AK"+"A"; (b) källetiketternas domän-länktexter
// ([hmgroup.com](…) — AR5-konventionens format) samt företagssuffixet AB i "Axfood AB" (AR7:s
// källetikettsvitlistklass) tillagt; (c) punkt/bindestreck/slash FÅR VARA KVAR i token — rensningen
// splittrade "like-for-like"/"P/B"/"hmgroup.com" i fragment innan vitlistekontrollen kunde se dem.
const vitlista = ['H&M','Inditex','Axfood','Zara','like-for-like','capex','P/B','P/E','ROE','PEG','IFRS','AK1A','Group','AB','hmgroup.com','inditex.com','axfood.se','svenskhandel.se','hui.se','Svensk','Handel','HUI','Research','Yahoo','Finance','StockAnalysis/S&P','Global','Market','Intelligence'];
const baraSvenska = stripYta(ar.body)
  .replace(/https?:\/\/[^\s)"']+/g, '')
  .replace(/[\[\]()`*_#>•–—…,:;!?«»"']/g, ' ')
  ;
const latinskaOrd = (baraSvenska.match(/[a-zA-ZÅÄÖåäö&][a-zA-ZÅÄÖåäö&0-9./-]*/g) || []);
const läckor = [...new Set(latinskaOrd.map(w => w.replace(/[./-]+$/, '')))].filter(w => w && !vitlista.includes(w));
K('Svenska/latinska läckor 0', läckor.length === 0, läckor.length ? 'träffar: ' + läckor.join(', ') : [...new Set(latinskaOrd)].length + ' latinska token, alla vitlistade (egennamn + finstermer + akronymer — AR6/AR7-konventionen)');

// 14. Disclaimer arabisk exakt sista rad
const sista = ar.body.trim().split('\n').pop().trim();
K('Disclaimer arabisk sista rad', sista === '_هذا تحليل مالي تعليمي، وليس نصيحة استثمارية._', sista);

// 15. Slug + publiceringsdatum
K('Slug = originalet + -ar', ar.slug === sv.slug + '-ar', ar.slug);
K('publishedAt dagens dygn', ar.publishedAt === '2026-09-20', ar.publishedAt);

const fel = r.filter(x => !x.ok).length;
console.log('\n=== KVD AR13: ' + (r.length - fel) + '/' + r.length + ' GRÖNA, ' + fel + ' FEL ===');
process.exit(fel ? 1 : 0);
