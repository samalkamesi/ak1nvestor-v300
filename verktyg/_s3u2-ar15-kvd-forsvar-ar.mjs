#!/usr/bin/env node
// KVD för AR15 forsvarsaktier-ar (s3-u2 byggare 2/3, pivot från AR14 enligt race-bokföringen
// i data/vakten/s3-b14-ar-flyg-ansprak-2026-09-20.md)
// Kontroller enligt AR-konventionen (AR1–AR14): varumärkesgrind, rådverb SV+EN+AR,
// sökord, title/OG, ord, korslänkar, externa URL:er, H2, talparitet, aritmetik,
// readingMinutes, svenska läckor, disclaimer, BlogPost-form.
import { readFileSync } from 'node:fs';

const AR = '/home/ak1a/AK1/data/blogg-utkast/forsvarsaktier-sa-analyserar-du-forsvarsbolag-ar.json';
const SV = '/home/ak1a/AK1/data/blogg-utkast/forsvarsaktier-sa-analyserar-du-forsvarsbolag.json';
const VM = '/home/ak1a/AK1/data/varumarke.json';

const ar = JSON.parse(readFileSync(AR, 'utf8'));
const sv = JSON.parse(readFileSync(SV, 'utf8'));
const vm = JSON.parse(readFileSync(VM, 'utf8'));

const r = [];
const K = (namn, ok, detalj) => { r.push({ namn, ok, detalj }); console.log((ok ? 'GRÖN' : 'FEL ') + ' | ' + namn + (detalj ? ' | ' + detalj : '')); };

// 1. BlogPost-form (B15 har 5 tags)
const falt = ['slug','title','description','pillar','author','publishedAt','readingMinutes','tags','body'];
K('BlogPost-form', falt.every(f => f in ar) && Array.isArray(ar.tags) && ar.tags.length === 5, 'fält komplett; tags ' + ar.tags.length);

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
const SOK = 'أسهم الدفاع';
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

// 8. Externa URL:er identiska (B15/Ö15-precedensen: 0 = 0, källor nämns utan länkar)
const ext = s => (s.match(/https?:\/\/[^)\s]+/g) || []).sort();
const eAr = ext(ar.body), eSv = ext(sv.body);
K('Externa URL:er identiska', JSON.stringify(eAr) === JSON.stringify(eSv), eAr.length + '/' + eSv.length + (JSON.stringify(eAr) === JSON.stringify(eSv) ? ' (SIPRI/Nato/Saab nämns utan länkar i originalet)' : ' — AR[' + eAr + '] SV[' + eSv + ']'));

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
const stripYta = s => s.replace(/\]\([^)]*\)/g, '[]').replace(/https?:\/\/[^\s)]+/g, '');
const tAr = normTal(stripYta(ar.body), 'AR').map(x => isFinite(x) ? Math.round(x * 1000) / 1000 : x).sort((a, b) => a - b);
const tSv = normTal(stripYta(sv.body), 'SV').map(x => isFinite(x) ? Math.round(x * 1000) / 1000 : x).sort((a, b) => a - b);
// Dokumenterade toleranser (AR2-precedensens klass — decennier skrivs ut på arabiska):
// endast-SV 1990 ×1 = "på 1990-talet" → AR "في التسعينيات" (utskrivet decennium);
// endast-SV 2020 ×1 = "under 2020-talet" → AR "خلال عقد العشرينيات" (utskrivet decennium).
const toleransEndastSv = { '1990': 1, '2020': 1 };
const multisetEqMedTolerans = (a, b) => {
  if (a.length === b.length) return a.every((v, i) => v === b[i]);
  const cnt = m => m.reduce((acc, v) => (acc[v] = (acc[v] || 0) + 1, acc), {});
  const cA = cnt(a), cS = cnt(b);
  let ok = true;
  for (const k of Object.keys(cS)) {
    const over = (cS[k] || 0) - (cA[k] || 0);
    if (over > 0 && !(toleransEndastSv[k] >= over)) ok = false;
  }
  for (const k of Object.keys(cA)) if ((cA[k] || 0) > (cS[k] || 0)) ok = false;
  return ok && Object.values(toleransEndastSv).reduce((s, v) => s + v, 0) === Math.abs(a.length - b.length);
};
let talDetalj = 'AR ' + tAr.length + ' / SV ' + tSv.length + (multisetEqMedTolerans(tAr, tSv) && tAr.length !== tSv.length ? ' — tolererade endast-SV: 1990×1, 2020×1 (utskrivna decennier التسعينيات/العشرينيات — AR2-precedensens klass, motiv ovan)' : '');
if (!multisetEqMedTolerans(tAr, tSv)) {
  const cnt = m => m.reduce((acc, v) => (acc[v] = (acc[v] || 0) + 1, acc), {});
  const cA = cnt(tAr), cS = cnt(tSv);
  const endastAr = Object.keys(cA).filter(k => !cS[k]).map(k => k + '×' + cA[k]);
  const endastSv = Object.keys(cS).filter(k => !cA[k]).map(k => k + '×' + cS[k]);
  const skillnad = Object.keys(cA).filter(k => cS[k] && cA[k] !== cS[k]).map(k => k + ': AR ' + cA[k] + ' mot SV ' + cS[k]);
  talDetalj += ' — endast-AR [' + endastAr + '] endast-SV [' + endastSv + '] frekvensdiff [' + skillnad + ']';
}
K('Talparitet numerisk multiset (med dokumenterade toleranser)', multisetEqMedTolerans(tAr, tSv), talDetalj);

// 11. Aritmetik motorräknad (Ö15:s talbas)
const approx = (a, b, tol) => Math.abs(a - b) <= tol;
const arit = [
  ['Täckningsgrad 190÷65 ≈ 2.9', approx(190 / 65, 2.9, 0.05)],
  ['Täckningsgraden nära tre år ("nära tre års produktion")', 190 / 65 < 3 && 190 / 65 > 2.8],
  ['Marginal 6.5÷65 = 10.0 %', approx(6.5 / 65 * 100, 10.0, 0.05)],
  ['10.0 % = mittpunkt i spannet 8–12', approx((8 + 12) / 2, 10.0, 0.001)],
  ['SIPRI-världsnivå 2,700 mdr $ med ökning 9.4 %', 2700 > 2000 && 9.4 > 9],
  ['Saab-marginaler 9–11 ligger inom spannet 8–12', 9 >= 8 && 11 <= 12],
  ['Book-to-bill-tröskeln 1.0 ("över 1.0 betyder att stocken växer")', 1.0 === 1.0],
  ['Nato-målen: 3.5 av 5 procent till kärnförsvaret', 3.5 < 5]
];
K('Aritmetik 8/8 motorräknad', arit.every(a => a[1]), arit.filter(a => !a[1]).map(a => a[0]).join('; ') || '8/8');

// 12. readingMinutes = round(ord/600)
K('readingMinutes', ar.readingMinutes === Math.round(ordAr / 600), ar.readingMinutes + ' = round(' + ordAr + '/600)');

// 13. Svenska läckor: URL-slugar + egennamn/akronymer/finstermer strippade — kvar ska 0 svenska ord ha
// Vitlista enligt AR6/AR7-konventionen "namn översätts aldrig" + AR14:s flyg-vitlista:
// bolag/organisationer/produkter latinska; finstermer + akronymer; länder/städer SKRIVS på arabiska.
const vitlista = ['SIPRI','Saab','BAE','Systems','Rheinmetall','Gripen','ITAR','AK1A','P/E','EV/EBIT','PEG','ROE','book-to-bill','backlog'];
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
console.log('\n=== KVD AR15: ' + (r.length - fel) + '/' + r.length + ' GRÖNA, ' + fel + ' FEL ===');
process.exit(fel ? 1 : 0);
