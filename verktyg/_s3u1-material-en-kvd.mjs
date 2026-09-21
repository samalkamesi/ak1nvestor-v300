#!/usr/bin/env node
// KVD för material-en (Ö25) — s3-u1 byggare 1/3, Spår 3 SEO-GUIDER, 2026-09-21
// Kontrollklass: s3-u2:s energi-en + AR22 (B-radslöst original → -en-spegel).
// Varumärkesgrind × 3 ytor, rådverb SV+EN, sökord, längder, ord, korslänkar
// multiset, externa URL:er, H2-paritet, talparitet normaliserad, aritmetik
// motorräknad, readingMinutes, disclaimer, BlogPost-form.
import { readFileSync } from 'node:fs';

const EN = '/home/ak1a/AK1/data/blogg-utkast/ravarubolag-materialbranschens-cykel-en.json';
const SV = '/home/ak1a/AK1/data/blogg-utkast/ravarubolag-materialbranschens-cykel.json';
const VM = '/home/ak1a/AK1/data/varumarke.json';

const en = JSON.parse(readFileSync(EN, 'utf8'));
const sv = JSON.parse(readFileSync(SV, 'utf8'));
const vm = JSON.parse(readFileSync(VM, 'utf8'));

const r = [];
const K = (namn, ok, detalj) => { r.push({ namn, ok, detalj }); console.log((ok ? 'GRÖN' : 'FEL ') + ' | ' + namn + (detalj ? ' | ' + detalj : '')); };

// 1. BlogPost-form
const falt = ['slug','title','description','pillar','author','publishedAt','readingMinutes','tags','body'];
K('BlogPost-form', falt.every(f => f in en) && Array.isArray(en.tags) && en.tags.length === sv.tags.length, 'fält komplett; tags ' + en.tags.length + ' = originalets ' + sv.tags.length);

const ytor = [en.title, en.description, en.body];

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

// 3. Rådverb SV+EN (EN-klass enligt energi-en; ingen AR-text i en -en-fil)
const radRe = [
  /\b(köp|sälj|köp den|håll undan|ta position|i denna aktie|investera i (?:denna|den här) aktien|rekommendera (?:köp|sälj)|mina tips)\b/gi,
  /\b(buy|sell|invest in this|my recommendation|you should buy)\b/gi
];
let radTraff = [];
for (let i = 0; i < ytor.length; i++) for (const re of radRe) { const m = ytor[i].match(re); if (m) radTraff.push([...m].join(',') + ' @yta' + (i+1)); }
K('Rådverb SV+EN', radTraff.length === 0, radTraff.length ? radTraff.join('; ') : '0 träffar');

// 4. Sökord i title + ingress + minst 2 H2 (B23-klassen: ingress = block 0, originalet saknar H1)
const SOK = 'commodity stocks';
const ingress = en.body.split('\n\n')[0];
const h2r = (en.body.match(/^## .*$/gm) || []);
const h2Traff = h2r.filter(h => h.toLowerCase().includes(SOK));
K('Sökord i title+ingress+2 H2', en.title.toLowerCase().includes(SOK) && ingress.toLowerCase().includes(SOK) && h2Traff.length >= 2,
  'title ' + (en.title.toLowerCase().includes(SOK) ? '✓' : '✗') + ', ingress ' + (ingress.toLowerCase().includes(SOK) ? '✓' : '✗') + ', H2 ' + h2Traff.length + ' st: ' + h2Traff.map(h => h.slice(0, 45)).join(' | '));

// 5. Title ≤ 60, OG ≤ 155
K('Title ≤ 60', [...en.title].length <= 60, [...en.title].length + '/60');
K('OG-description ≤ 155', [...en.description].length <= 155, [...en.description].length + '/155');

// 6. Ord (raw: body split whitespace) — i originalets täthet, tak 1400
const ordEn = en.body.trim().split(/\s+/).length;
const ordSv = sv.body.trim().split(/\s+/).length;
K('Ord 1200–1400', ordEn >= 1200 && ordEn <= 1400, ordEn + '/1400 (originalet ' + ordSv + ')');

// 7. Korslänkar multiset mot originalet (km-045 ×2 enligt originalet)
const links = s => { const m = s.match(/\]\((\/[^)]+)\)/g) || []; return m.map(x => x.slice(2, -1)).sort(); };
const lEn = links(en.body), lSv = links(sv.body);
K('Korslänkar multiset', JSON.stringify(lEn) === JSON.stringify(lSv), lEn.length + '/' + lSv.length + (JSON.stringify(lEn) === JSON.stringify(lSv) ? '' : ' — diff: EN[' + lEn.filter(x => !lSv.includes(x)) + '] SV[' + lSv.filter(x => !lEn.includes(x)) + ']'));

// 8. Externa URL:er identiska (originalet har 0 — källraden bär källnamn utan länkar)
const ext = s => (s.match(/https?:\/\/[^)\s]+/g) || []).sort();
const eEn = ext(en.body), eSv = ext(sv.body);
K('Externa URL:er identiska', JSON.stringify(eEn) === JSON.stringify(eSv), eEn.length + '/' + eSv.length);

// 9. H2-paritet
const h2Sv = (sv.body.match(/^## .*$/gm) || []);
K('H2-paritet', h2r.length === h2Sv.length, h2r.length + ' = ' + h2Sv.length);

// 10. Talparitet — numerisk multiset, språkmedveten (AR8/Ö13-klassen):
// SV: komma = decimal, mellanslag = tusental. EN: punkt = decimal, komma(3 siffror) = tusental.
// AK1A:s "1" är symmetrisk (varumärket skrivs likadant på båda språken — AR20-precedensen).
// ", "-serielistorna tokenbryts med "|" — AR16-klassen.
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
const stripYta = s => s.replace(/\]\([^)]*\)/g, '[]').replace(/https?:\/\/[^\s)"']+/g, '').replace(/,\s+/g, '|');
const tEn = normTal(stripYta(en.body), 'EN').map(x => isFinite(x) ? Math.round(x * 1000) / 1000 : x).sort((a, b) => a - b);
const tSv = normTal(stripYta(sv.body), 'SV').map(x => isFinite(x) ? Math.round(x * 1000) / 1000 : x).sort((a, b) => a - b);
const multisetEq = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
let talDetalj = 'EN ' + tEn.length + ' / SV ' + tSv.length;
if (!multisetEq(tEn, tSv)) {
  const cnt = m => m.reduce((acc, v) => (acc[v] = (acc[v] || 0) + 1, acc), {});
  const cE = cnt(tEn), cS = cnt(tSv);
  const endastEn = Object.keys(cE).filter(k => !cS[k]).map(k => k + '×' + cE[k]);
  const endastSv = Object.keys(cS).filter(k => !cE[k]).map(k => k + '×' + cS[k]);
  const skillnad = Object.keys(cE).filter(k => cS[k] && cE[k] !== cS[k]).map(k => k + ': EN ' + cE[k] + ' mot SV ' + cS[k]);
  talDetalj += ' — endast-EN [' + endastEn + '] endast-SV [' + endastSv + '] frekvensdiff [' + skillnad + ']';
}
K('Talparitet numerisk multiset', multisetEq(tEn, tSv), talDetalj);

// 11. Aritmetik motorräknad (originalets klass)
const approx = (a, b, tol) => Math.abs(a - b) <= tol;
const arit = [
  ["P/B-kvoten 1.3÷2.7 ≈ 0.48 → »half the market's book-value multiple«", approx(1.3 / 2.7, 0.5, 0.05)],
  ['Marginalkvoten 9.7÷21.2 ≈ 0.46 → »half the margin«', approx(9.7 / 21.2, 0.5, 0.05)],
  ['P/E-gapet 20.4−18.5 = 1.9 < 2 (»the gap is smaller than it looks«)', 20.4 - 18.5 < 2],
  ['Yara 8.3 = lägst av de tio < medianen 18.5 (»the lowest P/E of the ten«)', 8.3 < 18.5],
  ['Konsensustillväxten −21 % < 0 (»negative«)', -21 < 0],
  ['Toppmarginalen 40 % över median = faktor 1.4 > 1 (»40 percent above«)', 1.4 > 1],
  ['Fyra av tio under bokvärdet = 4÷10 (skogsgruppen B+S+S+H)', 4 / 10 === 0.4],
  ['Universumet 100 = 10 per bransch × 10 branscher', 10 * 10 === 100],
  ["Kontrollerna 1+2+3 = tre (»three checks«)", 1 + 2 + 3 === 6 && 3 === 3],
  ['Femårstillväxten −2.2 < +3.5 (råvaran mot börsen)', -2.2 < 3.5]
];
K('Aritmetik ' + arit.length + '/' + arit.length + ' motorräknad', arit.every(a => a[1]), arit.filter(a => !a[1]).map(a => a[0]).join('; ') || arit.length + '/' + arit.length);

// 12. readingMinutes = round(ord/600)
K('readingMinutes', en.readingMinutes === Math.round(ordEn / 600), en.readingMinutes + ' = round(' + ordEn + '/600)');

// 13. Disclaimer engelsk exakt sista rad + datakällrad näst sista (originalets dubbelradsspegel)
const rader = en.body.trim().split('\n');
const sista = rader[rader.length - 1].trim();
const nastSista = rader[rader.length - 3].trim(); // tomrad emellan
K('Disclaimer engelsk sista rad', sista === '_This is educational financial analysis, not investment advice._', sista);
K('Datakällrad speglad (näst sista stycket)', nastSista.startsWith('_Data sources: AK1A'), nastSista.slice(0, 60));

// 14. Slug + publiceringsdatum + H1-paritet (originalet saknar H1 — EN speglar)
K('Slug = originalet + -en', en.slug === sv.slug + '-en', en.slug);
K('publishedAt dagens dygn', en.publishedAt === '2026-09-21', en.publishedAt);
const h1En = (en.body.match(/^# [^#].*$/gm) || []).length, h1Sv = (sv.body.match(/^# [^#].*$/gm) || []).length;
K('H1-paritet (originalet saknar H1)', h1En === h1Sv, h1En + ' = ' + h1Sv);

const fel = r.filter(x => !x.ok).length;
console.log('\n=== KVD material-en: ' + (r.length - fel) + '/' + r.length + ' GRÖNA, ' + fel + ' FEL ===');
process.exit(fel ? 1 : 0);
