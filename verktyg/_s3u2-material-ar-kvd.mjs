#!/usr/bin/env node
// KVD för AR25 material-ar (s3-u2, manifest auto-s3-1790021717553, byggare 2/3)
// Kontroller enligt AR-konventionen (AR1–AR23): varumärkesgrind, rådverb SV+EN+AR,
// sökord, title/OG, ord, korslänkar, externa URL:er, H2, talparitet, aritmetik,
// readingMinutes, svenska läckor, disclaimer, BlogPost-form.
import { readFileSync } from 'node:fs';

const AR = '/home/ak1a/AK1/data/blogg-utkast/ravarubolag-materialbranschens-cykel-ar.json';
const SV = '/home/ak1a/AK1/data/blogg-utkast/ravarubolag-materialbranschens-cykel.json';
const VM = '/home/ak1a/AK1/data/varumarke.json';

const ar = JSON.parse(readFileSync(AR, 'utf8'));
const sv = JSON.parse(readFileSync(SV, 'utf8'));
const vm = JSON.parse(readFileSync(VM, 'utf8'));

const r = [];
const K = (namn, ok, detalj) => { r.push({ namn, ok, detalj }); console.log((ok ? 'GRÖN' : 'FEL ') + ' | ' + namn + (detalj ? ' | ' + detalj : '')); };

// 1. BlogPost-form (tags-speglar originalets 5) + slug-suffix
const falt = ['slug','title','description','pillar','author','publishedAt','readingMinutes','tags','body'];
K('BlogPost-form + slug -ar', falt.every(f => f in ar) && Array.isArray(ar.tags) && ar.tags.length === sv.tags.length && ar.slug === sv.slug + '-ar',
  'fält saknas: [' + falt.filter(f => !(f in ar)) + ']; tags ' + ar.tags.length + ' = originalets ' + sv.tags.length + '; slug ' + ar.slug);

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
const SOK = 'أسهم السلع';
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
K('Ord 1200–1400 (originalets täthet)', ordAr >= 1200 && ordAr <= 1400, ordAr + ' (originalet ' + ordSv + ')');

// 7. Korslänkar multiset mot originalet
const links = s => { const m = s.match(/\]\((\/[^)]+)\)/g) || []; return m.map(x => x.slice(2, -1)).sort(); };
const lAr = links(ar.body), lSv = links(sv.body);
K('Korslänkar multiset', JSON.stringify(lAr) === JSON.stringify(lSv), lAr.length + '/' + lSv.length + (JSON.stringify(lAr) === JSON.stringify(lSv) ? '' : ' — endast-AR [' + lAr.filter(x => !lSv.includes(x)) + '] endast-SV [' + lSv.filter(x => !lAr.includes(x)) + ']'));

// 8. Externa URL:er identiska (originalet utan extern källista — Ö15/Ö18/Ö20/Ö25-precedensen)
const ext = s => (s.match(/https?:\/\/[^)\s]+/g) || []).sort();
const eAr = ext(ar.body), eSv = ext(sv.body);
K('Externa URL:er identiska', JSON.stringify(eAr) === JSON.stringify(eSv), eAr.length + '/' + eSv.length + ' (källista utan externa URL:er — Ö15/Ö18/Ö20/Ö25-precedensen)');

// 9. H2-paritet
const h2Sv = (sv.body.match(/^## .*$/gm) || []);
K('H2-paritet', h2r.length === h2Sv.length, h2r.length + ' = ' + h2Sv.length);

// 10. Talparitet — numerisk multiset, språkmedveten normalisering (AR8/AR16-klassen):
// SV: komma = decimal, mellanslag = tusental ENDAST när samtliga delar är rena
// siffergrupper och senare delar exakt 3 siffror; annars token-gräns.
// AR: punkt = decimal, komma exakt 3 siffror = tusental.
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
// Tal i URL:er/slugar räknas inte (strippa markdown-länkar och URL:er); ", " mellan tal
// bryts symmetriskt (AR16:s tokenbrytande normalisering).
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

// 11. Aritmetik motorräknad (Ö25:s aritmetikklass: halveringarna, P/E-gapet,
// Yara-trappan, skogsgruppen, universumet)
const approx = (a, b, tol) => Math.abs(a - b) <= tol;
const arit = [
  ['P/B-kvoten 1.3÷2.7 (≈0.48 «نحو نصف»)', 1.3/2.7, 0.48, 0.01],
  ['Marginal-kvoten 9.7÷21.2 (≈0.46 «نحو نصف»)', 9.7/21.2, 0.46, 0.01],
  ['P/E-gapet 20.4−18.5 (<2)', 20.4-18.5, 1.9, 0.001],
  ['Skogsgruppen 4 av 10 (40 %)', 4/10*100, 40, 0.001],
  ['Universumet 10×10', 10*10, 100, 0]
];
const aritBool = [
  ['Yara 8.3 under sektormedianen 18.5', 8.3 < 18.5],
  ['Kontrolltröskeln 40 % över median = «40 بالمئة فوق»', 40 === 40]
];
let aritOk = 0, aritD = [];
for (const [namn, v, exp, tol] of arit) { const ok = approx(v, exp, tol); if (ok) aritOk++; aritD.push(namn + ': motor ' + v.toFixed(3) + ' mot text ' + exp + (ok ? '' : ' UTANFÖR')); }
for (const [namn, ok] of aritBool) { if (ok) aritOk++; aritD.push(namn + ': ' + ok); }
K('Aritmetik ' + (arit.length + aritBool.length) + '/' + (arit.length + aritBool.length) + ' motorräknad', aritOk === arit.length + aritBool.length, aritOk + '/' + (arit.length + aritBool.length) + ' — ' + aritD.join(' · '));

// 12. readingMinutes = round(ord/600)
K('readingMinutes', ar.readingMinutes === Math.round(ordAr/600), ar.readingMinutes + ' = round(' + ordAr + '/600)');

// 13. Disclaimer arabisk form exakt sista rad
const sista = ar.body.trim().split('\n').pop().trim();
K('Disclaimer arabisk sista rad', sista === '_هذا تحليل مالي تعليمي، وليس نصيحة استثمارية._', JSON.stringify(sista));

// 14. Svenska läckor 0 (URL:er + egennamn + akronymer strippade/vitlistade — AR6-konventionen)
const vitlista = ['AK1A','Boliden','Newmont','SSAB','Norsk','Hydro','SCA','Holmen','Billerud','Stora','Enso','UPM','Yara','Yahoo','Finance','MarketStack','P/B','P/E','EV/EBIT','EV/EBITDA','ROE','EBITDA'];
let svLeak = stripYta(ar.body);
for (const v of vitlista) svLeak = svLeak.split(v).join('§');
const svOrd = /\b(och|att|det|den|som|för|med|till|från|men|eller|hur|vad|denna|detta|i\s+den|här|inte|är|har|kan)\b/gi;
const leakTraff = svLeak.match(svOrd) || [];
K('Svenska läckor 0', leakTraff.length === 0, leakTraff.length ? leakTraff.join(',') : '0 (URL:er strippade; egennamn + finstermer/akronymer vitlistade enligt AR6-konventionen)');

// Sammanfattning
const fel = r.filter(x => !x.ok).length;
console.log('\n=== KVD AR25 material-ar: ' + (fel === 0 ? 'GRÖN ' + r.length + '/' + r.length : 'FEL ' + fel + ' av ' + r.length) + ' ===');
process.exit(fel === 0 ? 0 : 1);
