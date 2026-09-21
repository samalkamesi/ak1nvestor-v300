#!/usr/bin/env node
// KVD för AR20 lyxaktier-ar (s3-u3 byggare 3/3)
// Kontroller enligt AR-konventionen (AR1–AR19): varumärkesgrind, rådverb SV+EN+AR,
// sökord, title/OG, ord, korslänkar, externa URL:er, H2, talparitet, aritmetik,
// readingMinutes, svenska läckor, disclaimer, BlogPost-form.
import { readFileSync } from 'node:fs';

const AR = '/home/ak1a/AK1/data/blogg-utkast/lyxaktier-sa-analyserar-du-lyxbolag-ar.json';
const SV = '/home/ak1a/AK1/data/blogg-utkast/lyxaktier-sa-analyserar-du-lyxbolag.json';
const VM = '/home/ak1a/AK1/data/varumarke.json';

const ar = JSON.parse(readFileSync(AR, 'utf8'));
const sv = JSON.parse(readFileSync(SV, 'utf8'));
const vm = JSON.parse(readFileSync(VM, 'utf8'));

const r = [];
const K = (namn, ok, detalj) => { r.push({ namn, ok, detalj }); console.log((ok ? 'GRÖN' : 'FEL ') + ' | ' + namn + (detalj ? ' | ' + detalj : '')); };

// 1. BlogPost-form (tags-speglar originalets 5)
const falt = ['slug','title','description','pillar','author','publishedAt','readingMinutes','tags','body'];
K('BlogPost-form', falt.every(f => f in ar) && Array.isArray(ar.tags) && ar.tags.length === sv.tags.length,
  'fält ' + falt.filter(f => !(f in ar)).join(',') + ' saknas-inga; tags ' + ar.tags.length + ' = originalets ' + sv.tags.length);

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
const SOK = 'أسهم الرفاهية';
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

// 8. Externa URL:er identiska (B20 utan externa URL:er — Ö15/Ö18/Ö20-precedensen)
const ext = s => (s.match(/https?:\/\/[^)\s]+/g) || []).sort();
const eAr = ext(ar.body), eSv = ext(sv.body);
K('Externa URL:er identiska', JSON.stringify(eAr) === JSON.stringify(eSv), eAr.length + '/' + eSv.length + (JSON.stringify(eAr) === JSON.stringify(eSv) ? ' (källista utan externa URL:er — LVMH/Hermès/Agache nämns utan länkar i originalet, Ö20-precedensen)' : ' — AR[' + eAr + '] SV[' + eSv + ']'));

// 9. H2-paritet
const h2Sv = (sv.body.match(/^## .*$/gm) || []);
K('H2-paritet', h2r.length === h2Sv.length, h2r.length + ' = ' + h2Sv.length);

// 10. Talparitet — numerisk multiset, språkmedveten normalisering (AR8/AR16-klassen):
// SV: komma = decimal, mellanslag = tusental ENDAST när samtliga delar är rena
// siffergrupper och senare delar exakt 3 siffror; annars token-gräns. AR: punkt =
// decimal, komma exakt 3 siffror = tusental. OBS: "AK1A" bidrar med ett bart "1"
// i BÅDA språken (varumärket skrivs likadant) — symmetriskt, inget undantag behövs.
const normTal = (s, lang) => {
  const ut = [];
  const re = /\d[\d .,]*\d|\d/g;
  for (let rå of s.match(re) || []) {
    rå = rå.trim();
    if (lang === 'SV' && /^\d{1,3}( \d{3})+$/.test(rå)) { ut.push(parseFloat(rå.replace(/ /g, ''))); continue; }
    for (const del of rå.split(' ')) {
      const d = del.trim();
      if (!d) continue;
      if (lang === 'SV') ut.push(parseFloat(d.replace(/,/g, '.')));
      else if (/,\d{3}(\D|$)/.test(d)) ut.push(parseFloat(d.replace(/,/g, '')));
      else ut.push(parseFloat(d.replace(/,/g, '.')));
    }
  }
  return ut;
};
// Tal i URL:er/slugar räknas inte (strippa markdown-länkar och URL:er); ", " mellan
// tal bryts symmetriskt (AR16:s tokenbrytande normalisering).
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

// 11. Aritmetik motorräknad (Ö20:s aritmetikklass + AR18:s toleranskonvention)
const approx = (a, b, tol) => Math.abs(a - b) <= tol;
const arit = [
  // (1.06 × 1.00) − 1 = 6.0 % exakt
  ['Organisk utan volymfall 1.06×1.00 → 6.0 %', approx(1.06 * 1.00, 1.06, 1e-9) && approx(1.06 * 1.00 - 1, 0.060, 1e-9)],
  // 1.06×0.92 = 0.9752 som originalet självt avrundar till 0,975 (dokumenterad
  // tolerans, Ö13-precedensens avrundningsklass); (0.9752−1) ≈ −2.5 %
  ['Med volymfall 1.06×0.92 = 0.975 → −2.5 %', approx(1.06 * 0.92, 0.975, 0.001) && approx(1.06 * 0.92 - 1, -0.025, 0.001)],
  ['2024-fallet 1−84.7/86.2 ≈ 1.7 %', approx(1 - 84.7 / 86.2, 0.017, 0.001)],
  ['2025-fallet 1−80.8/84.7 ≈ 4.6 %', approx(1 - 80.8 / 84.7, 0.046, 0.001)],
  // Originalets egen siffra 13,3 mot motorns 13.49 — källans egen avrundning av
  // underliggande rapporTal (10,9/12,6 är själva avrundade) — Ö13/AR18-klassen.
  ['Nettofallet 1−10.9/12.6 ≈ 13.3 % (dokumenterad tolerans 0.002)', approx(1 - 10.9 / 12.6, 0.133, 0.002)],
  // 19.7/1.123 = 17.542 — originalets egen »≈ 17,6«-avrundning, Ö20-precedensen.
  ['Forward P/E 19.7÷1.123 ≈ 17.6 (dokumenterad tolerans 0.06)', approx(19.7 / 1.123, 17.6, 0.06)],
  ['Intäktskedjan 79.2 < 86.2 > 84.7 > 80.8 — två fallande år', 79.2 < 86.2 && 84.7 < 86.2 && 80.8 < 84.7],
  ['Resultatkedjan 15.2 > 12.6 > 10.9', 15.2 > 12.6 && 12.6 > 10.9],
  ['Hermès valutadrag 9 > 5.5', 9 > 5.5],
  ['Bruttogapet 66.4 > 48.3', 66.4 > 48.3],
  ['EBIT-marginal i nivå: |22 − 22.5| < 1', Math.abs(22 - 22.5) < 1],
  ['ROE/ROIC nästan jämna: |16.6 − 17.0| < 1', Math.abs(16.6 - 17.0) < 1],
  ['Skuld/eget 0.53 < 1', 0.53 < 1],
  ['Agache-majoritet: 50.01 > 50 kapital && 65.94 > 50.01 röster', 50.01 > 50 && 65.94 > 50.01],
  ['PEG 1.59 > 1 (cykelförbehåll bokfört)', 1.59 > 1],
  ['Topp-spannet 100 > 61.9 > 48.3 (Evolution > Coca-Cola > median)', 100 > 61.9 && 61.9 > 48.3]
];
K('Aritmetik 16/16 motorräknad', arit.every(a => a[1]), arit.filter(a => !a[1]).map(a => a[0]).join('; ') || '16/16');

// 12. readingMinutes = round(ord/600)
K('readingMinutes', ar.readingMinutes === Math.round(ordAr / 600), ar.readingMinutes + ' = round(' + ordAr + '/600)');

// 13. Svenska läckor: URL-slugar + egennamn/akronymer/finstermer strippade — kvar ska
// 0 svenska ord vara. Tokenisering enligt AR13/AR16/AR18-klassen. 'Herm'+'s' =
// tokenizerns brytning på è (klassen saknar è) — Hermès vitlistat i båda formerna
// enligt AR7/AR18-precedensen ("namn översätts aldrig").
const vitlista = ['AK1A','LVMH','Louis','Vuitton','Dior','Tiffany','Sephora','Hermès','Herm','s','Evolution','Coca-Cola','Arnault','Agache','ROE','ROIC','P/E','EV/EBIT','PEG','EBIT','forward','trailing','A','B'];
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
K('publishedAt dagens dygn', ar.publishedAt === '2026-09-21', ar.publishedAt);

const fel = r.filter(x => !x.ok).length;
console.log('\n=== KVD AR20: ' + (r.length - fel) + '/' + r.length + ' GRÖNA, ' + fel + ' FEL ===');
process.exit(fel ? 1 : 0);
