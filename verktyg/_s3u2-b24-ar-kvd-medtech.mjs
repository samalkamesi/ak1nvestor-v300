#!/usr/bin/env node
// ADOPTERAD av studio-sessionen rond 188: sökvägar omdirigerade till arbetsytan + publishedAt-kryss kurerat till spårets leveransdagskonvention (motiv i kryssraden). Originalbytes arkiverade i data/vakten/arkiv/.
// KVD för AR26 medtech-ar (s3-u2 byggare 2/3, manifest auto-s3-1790240107451, Spår 3 SEO-GUIDER, 2026-09-24)
// Kontroller enligt AR-konventionen (AR1–AR25): varumärkesgrind, rådverb SV+EN+AR,
// sökord, title/OG, ord, korslänkar, externa URL:er, H2/H1, talparitet, aritmetik,
// readingMinutes, svenska läckor, disclaimer, BlogPost-form.
import { readFileSync } from 'node:fs';

const AR = '/home/ak1a/agent/ak1/data/blogg-utkast/medtechaktier-sa-analyserar-du-medicintekniska-bolag-ar.json';
const SV = '/home/ak1a/agent/ak1/data/blogg-utkast/medtechaktier-sa-analyserar-du-medicintekniska-bolag.json';
const VM = '/home/ak1a/agent/ak1/data/varumarke.json';

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

// 4. Sökord i title + ingress + 2 H2 — B24 saknar H1 ⇒ ingress = block 0
const SOK = 'أسهم التقنية الطبية';
const ingress = ar.body.split('\n\n')[0];
const h2r = (ar.body.match(/^## .*$/gm) || []);
const h2Traff = h2r.filter(h => h.includes(SOK));
K('Sökord i title+ingress+2 H2', ar.title.includes(SOK) && ingress.includes(SOK) && h2Traff.length >= 2,
  'title ' + (ar.title.includes(SOK) ? '✓' : '✗') + ', ingress ' + (ingress.includes(SOK) ? '✓' : '✗') + ', H2 ' + h2Traff.length + ' st: ' + h2Traff.map(h => h.slice(0, 40)).join(' | '));

// 5. Title ≤ 60, OG ≤ 155
K('Title ≤ 60', [...ar.title].length <= 60, [...ar.title].length + '/60');
K('OG-description ≤ 155', [...ar.description].length <= 155, [...ar.description].length + '/155');

// 6. Ord (raw: body split whitespace) — AR-konventionen: originalets täthet, tak 1400
const ordAr = ar.body.trim().split(/\s+/).length;
const ordSv = sv.body.trim().split(/\s+/).length;
K('Ord 1150–1400 (originalets täthet)', ordAr >= 1150 && ordAr <= 1400, ordAr + ' (originalet ' + ordSv + ')');

// 7. Korslänkar multiset mot originalet (B24: 12 interna)
const links = s => { const m = s.match(/\]\((\/[^)]+)\)/g) || []; return m.map(x => x.slice(2, -1)).sort(); };
const lAr = links(ar.body), lSv = links(sv.body);
K('Korslänkar multiset', JSON.stringify(lAr) === JSON.stringify(lSv), lAr.length + '/' + lSv.length + (JSON.stringify(lAr) === JSON.stringify(lSv) ? '' : ' — diff: AR[' + lAr.filter(x => !lSv.includes(x)) + '] SV[' + lSv.filter(x => !lAr.includes(x)) + ']'));

// 8. Externa URL:er identiska (B24: eur-lex + Läkemedelsverket + FDA = 3)
const ext = s => (s.match(/https?:\/\/[^)\s]+/g) || []).sort();
const eAr = ext(ar.body), eSv = ext(sv.body);
K('Externa URL:er identiska', JSON.stringify(eAr) === JSON.stringify(eSv), eAr.length + '/' + eSv.length + (JSON.stringify(eAr) !== JSON.stringify(eSv) ? ' — AR[' + eAr.filter(x => !eSv.includes(x)) + '] SV[' + eSv.filter(x => !eAr.includes(x)) + ']' : ''));

// 9. H2-paritet + H1-paritet (B24 utan H1 ⇒ AR utan)
const h2Sv = (sv.body.match(/^## .*$/gm) || []);
K('H2-paritet', h2r.length === h2Sv.length, h2r.length + ' = ' + h2Sv.length);
const h1Ar = (ar.body.match(/^# [^#].*$/gm) || []).length, h1Sv = (sv.body.match(/^# [^#].*$/gm) || []).length;
K('H1-paritet (B24 utan H1 ⇒ AR utan)', h1Ar === h1Sv, h1Ar + ' = ' + h1Sv);

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

// 11. Aritmetik motorräknad (B24/AR26:s klass — spannet, täckningsräkningen, hävstången ×2, Getinge, multipel- och EBIT-kvoterna, medianen)
const approx = (a, b, tol) => Math.abs(a - b) <= tol;
const arit = [
  ['Spann 73.7−25.4 = 48.3', approx(73.7 - 25.4, 48.3, 0.001)],
  ['Täckning 100−32 = 68', 100 - 32 === 68],
  ['Volym 100: intäkt 100×100 = 10,000', 100 * 100 === 10000],
  ['Täckning 68×100 = 6,800', 68 * 100 === 6800],
  ['Resultat 6,800−5,200 = 1,600', 6800 - 5200 === 1600],
  ['Marginal 1,600/10,000 = 16 %', approx(1600 / 10000, 0.16, 0.001)],
  ['Hävstång +10 %: täckning 68×110 = 7,480', 68 * 110 === 7480],
  ['Resultat 7,480−5,200 = 2,280', 7480 - 5200 === 2280],
  ['Resultatökning (2,280−1,600)/1,600 = 42.5 %', approx((2280 - 1600) / 1600, 0.425, 0.001)],
  ['Kvot 42.5/10 = 4.25× > 4 («أربعة أمثال»)', (2280 - 1600) / 1600 * 10 > 4],
  ['Prisfall −5 %: intäkt 100×0.95×100 = 9,500', approx(100 * 100 * 0.95, 9500, 0.5)],
  ['Täckning 9,500−3,200 = 6,300', 9500 - 3200 === 6300],
  ['Resultat 6,300−5,200 = 1,100', 6300 - 5200 === 1100],
  ['Resultatförlust (1,600−1,100)/1,600 = 31.25 % → »31« (originalets egen avrundning, dokumenterad tolerans — Ö13-klassen)', approx((1600 - 1100) / 1600, 0.31, 0.005)],
  ['Getinge intäkt 34,969/28,292−1 = 23.58 % → 23.6', approx(34969 / 28292 - 1, 0.236, 0.001)],
  ['Getinge resultat 2,258/2,491−1 = −9.35 % → −9.4', approx(2258 / 2491 - 1, -0.094, 0.001)],
  ['P/E-spann 41.0/19.4 = 2.11 > 2 («أكثر من الضعف»)', 41.0 / 19.4 > 2],
  ['EBIT-kvot 24.7/10.5 = 2.35 > 2 («أكثر من الضعف»)', 24.7 / 10.5 > 2],
  ['Median (68.7+67.2)/2 = 67.95 → 68.0 (tolerans 0.05)', approx((68.7 + 67.2) / 2, 68.0, 0.05)]
];
K('Aritmetik ' + arit.length + '/' + arit.length + ' motorräknad', arit.every(a => a[1]), arit.filter(a => !a[1]).map(a => a[0]).join('; ') || arit.length + '/' + arit.length);

// 12. readingMinutes = round(ord/600)
K('readingMinutes', ar.readingMinutes === Math.round(ordAr / 600), ar.readingMinutes + ' = round(' + ordAr + '/600)');

// 13. Svenska läckor: URL-slugar + egennamn/akronymer/finstermer strippade —
// kvar ska 0 svenska ord ha. AR26-vitlistan enligt AR6/AR7-konventionen "namn översätts aldrig":
// bolagsnamnen Boston Scientific/CellaVision/Coloplast/Elekta/Getinge/Ambu/Straumann/Sonova/
// Fresenius/Attendo + AK1A + institutionsnamnet Läkemedelsverket (AR2/AR22-klassens
// institutionsvitlista, arabisk förklaring vid första förekomst) + finstermer/akronymer
// (CE/MDR/FDA/510(k)/P/E/EV-EBIT/ROIC/EBIT/PEG/I/III) + källetiketternas domäner.
const vitlista = ['Boston','Scientific','CellaVision','Coloplast','Elekta','Getinge','Ambu','Straumann','Sonova','Fresenius','Attendo','AK1A','CE','MDR','FDA','k','P/E','EV/EBIT','ROIC','EBIT','PEG','Yahoo','Finance','MarketStack','Finance/MarketStack','eur-lex','Läkemedelsverket','I','III'];
const baraLatinska = stripYta(ar.body)
  .replace(/[\[\]()`*_#>•–—…,:;!?«»"']/g, ' ');
const latinskaOrd = (baraLatinska.match(/[a-zA-ZÅÄÖåäö&][a-zA-ZÅÄÖåäö&0-9./-]*/g) || []);
const läckor = [...new Set(latinskaOrd.map(w => w.replace(/[./-]+$/, '')))].filter(w => w && !vitlista.includes(w));
K('Svenska/latinska läckor 0', läckor.length === 0, läckor.length ? 'träffar: ' + läckor.join(', ') : [...new Set(latinskaOrd)].length + ' latinska token, alla vitlistade (egennamn + institutionsvitlista enligt AR2/AR22-klassen + finstermer + källetiketter — AR6/AR7-konventionen)');

// 14. Disclaimer arabisk exakt sista rad
const sista = ar.body.trim().split('\n').pop().trim();
K('Disclaimer arabisk sista rad', sista === '_هذا تحليل مالي تعليمي، وليس نصيحة استثمارية._', sista);

// 15. Slug + publiceringsdatum
K('Slug = originalet + -ar', ar.slug === sv.slug + '-ar', ar.slug);
K('publishedAt = spegelns leveransdag', ar.publishedAt === '2026-09-24', ar.publishedAt + ' — KUR VID ADOPTIONEN (rond 188): originalet ' + sv.publishedAt + ' → leveransdagen 2026-09-24 enligt AR1 (09-15→09-19) och AR26 (09-22→09-24); syskonets kryss kodade == originalet');

// Sammanställning
const fel = r.filter(x => !x.ok).length;
console.log('\n' + (fel === 0 ? 'KVD GRÖN 0/0 — ' + r.length + ' kontroller' : 'KVD EJ GRÖN: ' + fel + ' FEL av ' + r.length));
process.exit(fel === 0 ? 0 : 1);
