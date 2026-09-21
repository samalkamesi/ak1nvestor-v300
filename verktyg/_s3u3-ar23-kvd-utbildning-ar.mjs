#!/usr/bin/env node
// KVD för AR23 utbildningsaktier-ar (s3-u3 byggare 3/3, Spår 3 SEO-GUIDER, 2026-09-21)
// Kontroller enligt AR-konventionen (AR1–AR22): varumärkesgrind, rådverb SV+EN+AR,
// sökord, title/OG, ord, korslänkar, externa URL:er, H2/H1, talparitet, aritmetik,
// readingMinutes, svenska läckor, disclaimer, BlogPost-form.
import { readFileSync } from 'node:fs';

const AR = '/home/ak1a/AK1/data/blogg-utkast/utbildningsaktier-sa-analyserar-du-utbildningsbolag-ar.json';
const SV = '/home/ak1a/AK1/data/blogg-utkast/utbildningsaktier-sa-analyserar-du-utbildningsbolag.json';
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

// 4. Sökord i title + ingress + 2 H2 — B23 saknar H1 ⇒ ingress = block 0
const SOK = 'أسهم التعليم';
const ingress = ar.body.split('\n\n')[0];
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

// 8. Externa URL:er identiska (B23 har 6 enligt B23/Ö23-notisen)
const ext = s => (s.match(/https?:\/\/[^)\s]+/g) || []).sort();
const eAr = ext(ar.body), eSv = ext(sv.body);
K('Externa URL:er identiska', JSON.stringify(eAr) === JSON.stringify(eSv), eAr.length + '/' + eSv.length + (JSON.stringify(eAr) !== JSON.stringify(eSv) ? ' — AR[' + eAr.filter(x => !eSv.includes(x)) + '] SV[' + eSv.filter(x => !eAr.includes(x)) + ']' : ''));

// 9. H2-paritet + H1-paritet (B23 saknar H1 ⇒ AR också 0)
const h2Sv = (sv.body.match(/^## .*$/gm) || []);
K('H2-paritet', h2r.length === h2Sv.length, h2r.length + ' = ' + h2Sv.length);
const h1Ar = (ar.body.match(/^# [^#].*$/gm) || []).length, h1Sv = (sv.body.match(/^# [^#].*$/gm) || []).length;
K('H1-paritet (B23 utan H1 ⇒ AR utan)', h1Ar === h1Sv, h1Ar + ' = ' + h1Sv);

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

// 11. Aritmetik motorräknad (B23/Ö23:s klass — dekomponering, täckning, beläggning, marginaler)
const approx = (a, b, tol) => Math.abs(a - b) <= tol;
const arit = [
  ['Pris/mix 1.070÷1.036−1 = 3.28 % → »نحو 3.3«', approx(1.070 / 1.036 - 1, 0.033, 0.001)],
  ['Täckning 20360÷115270 = 176.6 tkr → »177,000«', approx(20360 / 115270 * 1000, 177, 1)],
  ['Beläggning 5÷40 = 12.5 %', 5 / 40 === 0.125],
  ['Marginal 25/26 1947÷20360 = 9.56 % → 9.6', approx(1947 / 20360, 0.096, 0.001)],
  ['Marginal 24/25 1752÷19021 = 9.21 % → 9.2', approx(1752 / 19021, 0.092, 0.001)],
  ['Volym 115270÷111290−1 = 3.58 % → 3.6', approx(115270 / 111290 - 1, 0.036, 0.001)],
  ['EBIT-tillväxt 1947÷1752−1 = 11.13 % → 11.1', approx(1947 / 1752 - 1, 0.111, 0.001)],
  ['Intäktstillväxt 20360÷19021−1 = 7.04 % → 7.0', approx(20360 / 19021 - 1, 0.070, 0.001)]
];
K('Aritmetik ' + arit.length + '/' + arit.length + ' motorräknad', arit.every(a => a[1]), arit.filter(a => !a[1]).map(a => a[0]).join('; ') || arit.length + '/' + arit.length);

// 12. readingMinutes = round(ord/600)
K('readingMinutes', ar.readingMinutes === Math.round(ordAr / 600), ar.readingMinutes + ' = round(' + ordAr + '/600)');

// 13. Svenska läckor: URL-slugar + egennamn/akronymer/finstermer/legala citat strippade —
// kvar ska 0 svenska ord ha. AR23-vitlistan enligt AR6/AR7-konventionen "namn översätts aldrig":
// bolagsnamnen AcadeMedia/Pearson/Laureate Education/Grand Canyon Education + institutionsnamnen
// Skolverket/Skolinspektionen (AR2/AR22-klassens institutionsvitlista) + Ö23-precedensens två
// citerade svenska rättsliga termerna (bidrag till enskilda huvudmän, Skärpta villkor för
// friskolesektorn) + finstermer/akronymer + källetiketternas domäner.
const vitlista = ['AcadeMedia','Pearson','Laureate','Education','Grand','Canyon','OPM','SOU','MFN','PDF','EES','P/E','Skolverket','Skolinspektionen','bidrag','till','enskilda','huvudmän','Skärpta','villkor','för','friskolesektorn','plc.pearson.com','investors.laureate.net','investors.gce.com','skolinspektionen.se'];
const baraLatinska = stripYta(ar.body)
  .replace(/[\[\]()`*_#>•–—…,:;!?«»"']/g, ' ');
const latinskaOrd = (baraLatinska.match(/[a-zA-ZÅÄÖåäö&][a-zA-ZÅÄÖåäö&0-9./-]*/g) || []);
const läckor = [...new Set(latinskaOrd.map(w => w.replace(/[./-]+$/, '')))].filter(w => w && !vitlista.includes(w));
K('Svenska/latinska läckor 0', läckor.length === 0, läckor.length ? 'träffar: ' + läckor.join(', ') : [...new Set(latinskaOrd)].length + ' latinska token, alla vitlistade (egennamn + institutionsvitlista + legala citat enligt Ö23-precedensen + finstermer + källetiketter — AR6/AR7/AR22-konventionen)');

// 14. Disclaimer arabisk exakt sista rad
const sista = ar.body.trim().split('\n').pop().trim();
K('Disclaimer arabisk sista rad', sista === '_هذا تحليل مالي تعليمي، وليس نصيحة استثمارية._', sista);

// 15. Slug + publiceringsdatum
K('Slug = originalet + -ar', ar.slug === sv.slug + '-ar', ar.slug);
K('publishedAt dagens dygn', ar.publishedAt === '2026-09-21', ar.publishedAt);

// Sammanställning
const fel = r.filter(x => !x.ok).length;
console.log('\n' + (fel === 0 ? 'KVD GRÖN 0/0 — ' + r.length + ' kontroller' : 'KVD EJ GRÖN: ' + fel + ' FEL av ' + r.length));
process.exit(fel === 0 ? 0 : 1);
