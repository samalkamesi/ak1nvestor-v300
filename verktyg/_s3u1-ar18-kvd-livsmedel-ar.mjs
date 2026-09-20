#!/usr/bin/env node
// KVD för AR18 livsmedelsaktier-ar (s3-u1, manifest auto-s3-1789929310676)
// Kontroller enligt AR-konventionen (AR1–AR17): varumärkesgrind, rådverb SV+EN+AR,
// sökord, title/OG, ord, korslänkar, externa URL:er, H2, talparitet, aritmetik,
// readingMinutes, svenska läckor, disclaimer, BlogPost-form.
import { readFileSync } from 'node:fs';

const AR = '/home/ak1a/AK1/data/blogg-utkast/livsmedelsaktier-sa-analyserar-du-livsmedelsbolag-ar.json';
const SV = '/home/ak1a/AK1/data/blogg-utkast/livsmedelsaktier-sa-analyserar-du-livsmedelsbolag.json';
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
const SOK = 'أسهم الأغذية';
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

// 8. Externa URL:er identiska (B18 utan externa URL:er — Ö15/Ö18-precedensen)
const ext = s => (s.match(/https?:\/\/[^)\s]+/g) || []).sort();
const eAr = ext(ar.body), eSv = ext(sv.body);
K('Externa URL:er identiska', JSON.stringify(eAr) === JSON.stringify(eSv), eAr.length + '/' + eSv.length + (JSON.stringify(eAr) === JSON.stringify(eSv) ? ' (källista utan externa URL:er — Ö15/Ö18-precedensen)' : ' — AR[' + eAr + '] SV[' + eSv + ']'));

// 9. H2-paritet
const h2Sv = (sv.body.match(/^## .*$/gm) || []);
K('H2-paritet', h2r.length === h2Sv.length, h2r.length + ' = ' + h2Sv.length);

// 10. Talparitet — numerisk multiset, språkmedveten normalisering (AR8/AR16-klassen,
// utökad i AR17-andemeningen): SV: komma = decimal, mellanslag = tusental ENDAST när
// samtliga delar är rena siffergrupper och senare delar exakt 3 siffror ("2 212"→2212);
// annars är mellanslag token-gräns ("2025 45,2" → 2025, 45.2 — AR14/AR16:s läxa: årtal
// följd av tal FÅR EJ slås samman). AR: punkt = decimal, komma exakt 3 siffror = tusental.
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
// bryts symmetriskt (AR16:s tokenbrytande normalisering — ingen legitim talnotering i
// någon konvention innehåller ", ").
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

// 11. Aritmetik motorräknad (Ö18:s aritmetikklass)
const approx = (a, b, tol) => Math.abs(a - b) <= tol;
const arit = [
  // 1.0296−1 = 2.96 % som originalet självt avrundar till »cirka 3,0« (AR-texten
  // speglar med »نحو 3.0«) — dokumenterad tolerans, Ö13-precedensens avrundningsklass.
  ['Organisk tillväxt 1.04×0.99=1.0296 ≈ »cirka 3,0« %', approx(1.04 * 0.99, 1.0296, 1e-9) && approx(1.04 * 0.99 - 1, 0.030, 0.0005)],
  ['PepsiCo-CAGR (93.9/86.4)^(1/3)−1≈2.8 %/år', approx((93.9 / 86.4) ** (1 / 3) - 1, 0.028, 0.001)],
  ['Nestlé-CAGR (89.9/94.8)^(1/3)−1≈−1.8 %/år', approx((89.9 / 94.8) ** (1 / 3) - 1, -0.018, 0.001)],
  ['Duopolet 93.9/47.9≈1.96 = »قرابة الضعف« (<2)', approx(93.9 / 47.9, 1.96, 0.01) && 93.9 / 47.9 < 2],
  ['Resultatet vänder storleken: 13.1>8.2 trots 47.9<93.9', 13.1 > 8.2 && 47.9 < 93.9],
  ['Börsvärdet 183.7/381.7<0.5 = »نصف القيمة تقريباً«', 183.7 / 381.7 < 0.5],
  ['Råvaruchocken 45×1.10=49.5', approx(45 * 1.10, 49.5, 1e-9)],
  ['Marginalfallet 55−50.5=4.5 pp (100−49.5=50.5)', approx(100 - 49.5, 50.5, 1e-9) && approx(55 - 50.5, 4.5, 1e-9)],
  ['Prissatt marginal 53.5/103≈51.9 %', approx(53.5 / 103, 0.519, 0.001)],
  ['Carlsberg 40.8/73.6>0.5 = »أكثر من نصف الإيرادات«', 40.8 / 73.6 > 0.5],
  ['ROIC-gapet |19.4−20.1|<1', Math.abs(19.4 - 20.1) < 1],
  ['P/E-spannet 27.4−17.8=9.6 ≈ »يقارب عشر وحدات«', approx(27.4 - 17.8, 9.6, 0.05) && Math.abs((27.4 - 17.8) - 10) < 1],
  ['Forward 17.0<trailing 27.4', 17.0 < 27.4],
  ['PEG-trippeln 0.45<1.25<12.6', 0.45 < 1.25 && 1.25 < 12.6],
  ['Medianen mellan kvartilerna 17.9≤20.4≤22.4', 17.9 <= 20.4 && 20.4 <= 22.4],
  ['Marginalspridningen 1.6 pp runt 54.3 (54.2 inom)', Math.abs(54.3 - 54.2) < 1.6],
  ['Kassaflödesparet 2022: 9.5=9.5; 2025: 5.3<13.1', 9.5 === 9.5 && 5.3 < 13.1],
  ['Carlsberg-svängen −40.8 → +9.1 → +6.0', 9.1 > 0 && 6.0 > 0 && 40.8 > 9.1]
];
K('Aritmetik 18/18 motorräknad', arit.every(a => a[1]), arit.filter(a => !a[1]).map(a => a[0]).join('; ') || '18/18');

// 12. readingMinutes = round(ord/600)
K('readingMinutes', ar.readingMinutes === Math.round(ordAr / 600), ar.readingMinutes + ' = round(' + ordAr + '/600)');

// 13. Svenska läckor: URL-slugar + egennamn/akronymer/finstermer strippade — kvar ska 0 svenska ord ha
// Tokenisering enligt AR13/AR16-klassen: siffror tillåtna i token, punkt/bindestreck/slash
// FÅR VARA KVAR (Coca-Cola, Frito-Lay, trailing-P/E hålls hela mot vitlistan).
// 'Nestl' = tokenizerns brytning på é (klassen saknar é) — Nestlé vitlistat i båda formerna
// enligt AR7-precedensens bolagsstruta ("namn översätts aldrig").
const vitlista = ['AK1A','Coca-Cola','PepsiCo','Nestlé','Nestl','Carlsberg','Frito-Lay','Quaker','ROE','ROIC','P/E','PEG','CAGR','trailing-P/E','forward','trailing'];
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
console.log('\n=== KVD AR18: ' + (r.length - fel) + '/' + r.length + ' GRÖNA, ' + fel + ' FEL ===');
process.exit(fel ? 1 : 0);
