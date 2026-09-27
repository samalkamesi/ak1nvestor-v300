#!/usr/bin/env node
// KVD för AR28 vård-ar (studio-sessionen rond 190, 2026-09-25) — AR-konventionens kontroller
// (mall: AR26/AR27-klassen; talparitet språkmedveten: SV mellanslagstusental/decimalkomma == AR tusentelskomma/punkt)
import { readFileSync } from 'node:fs';

const AR = '/home/ak1a/agent/ak1/data/blogg-utkast/vardaktier-sa-analyserar-du-vardbolag-ar.json';
const SV = '/home/ak1a/agent/ak1/data/blogg-utkast/vardaktier-sa-analyserar-du-vardbolag.json';
const VM = '/home/ak1a/agent/ak1/data/varumarke.json';

const ar = JSON.parse(readFileSync(AR, 'utf8'));
const sv = JSON.parse(readFileSync(SV, 'utf8'));
const vm = JSON.parse(readFileSync(VM, 'utf8'));

const r = [];
const K = (namn, ok, detalj) => { r.push({ namn, ok }); console.log((ok ? 'GRÖN' : 'FEL ') + ' | ' + namn + (detalj ? ' | ' + detalj : '')); };

// 1. BlogPost-form + pillar/author orörda + tags-paritet
const falt = ['slug', 'title', 'description', 'pillar', 'author', 'publishedAt', 'readingMinutes', 'tags', 'body'];
K('BlogPost-form + pillar/author orörda', falt.every((f) => f in ar) && ar.pillar === sv.pillar && ar.author === sv.author && ar.tags.length === sv.tags.length, `tags ${ar.tags.length} = originalets ${sv.tags.length}`);

const ytor = [ar.title, ar.description, ar.body];

// 2. Varumärkesgrind: egna FEL-regexer × 3 ytor
let vmFel = 0, vmVarn = 0;
const vmTraff = [];
for (const fras of vm.forbjudnaFraser) {
  const re = new RegExp(fras.fran, 'gi');
  for (let i = 0; i < ytor.length; i++) {
    const m = ytor[i].match(re);
    if (m) { if (fras.allvar === 'FEL') vmFel++; else vmVarn++; vmTraff.push(`${fras.fran} @yta${i + 1}: ${m.join(',')}`); }
  }
}
K('Varumärkesgrind × 3 ytor', vmFel === 0 && vmVarn === 0, `FEL ${vmFel}, VARNING ${vmVarn}${vmTraff.length ? ' — ' + vmTraff.join('; ') : ''}`);

// 3. Rådverb SV+EN+AR
const radRe = [
  /\b(köp|sälj|håll undan|ta position|investera i (?:denna|den här) aktien|rekommendera (?:köp|sälj)|mina tips)\b/gi,
  /\b(buy|sell|hold|invest in this|my recommendation|you should buy)\b/gi,
  /(اشترِ|بِع|استثمر في هذا|أنصحك|نوصي بشراء|نصيحتي إليك)/g,
];
const radTraff = [];
for (let i = 0; i < ytor.length; i++) for (const re of radRe) { const m = ytor[i].match(re); if (m) radTraff.push([...m].join(',') + ` @yta${i + 1}`); }
K('Rådverb SV+EN+AR', radTraff.length === 0, radTraff.length ? radTraff.join('; ') : '0 träffar');

// 4. Sökord i title + ingress + ≥2 H2 (B25 utan H1 ⇒ ingress = block 0)
const SOK = 'أسهم الرعاية الصحية';
const ingress = ar.body.split('\n\n')[0];
const h2r = ar.body.match(/^## .*$/gm) || [];
const h2Traff = h2r.filter((h) => h.includes(SOK));
K('Sökord i title+ingress+2 H2', ar.title.includes(SOK) && ingress.includes(SOK) && h2Traff.length >= 2, `title ${ar.title.includes(SOK) ? '✓' : '✗'}, ingress ${ingress.includes(SOK) ? '✓' : '✗'}, H2 ${h2Traff.length} st`);

// 5. Title ≤60, OG ≤155
K('Title ≤ 60', [...ar.title].length <= 60, [...ar.title].length + '/60 (originalet ' + [...sv.title].length + ')');
K('OG-description ≤ 155', [...ar.description].length <= 155, [...ar.description].length + '/155');

// 6. Ord — originalets täthet, band 1000–1400
const ordAr = ar.body.trim().split(/\s+/).length;
const ordSv = sv.body.trim().split(/\s+/).length;
K('Ord 1000–1400 (originalets täthet)', ordAr >= 1000 && ordAr <= 1400, `${ordAr} (originalet ${ordSv})`);

// 7. Korslänkar multiset mot originalet
const lankarUttagna = (t) => [...t.matchAll(/\]\((\/[^)]+)\)/g)].map((m) => m[1]);
const multiset = (arr) => { const m = new Map(); for (const a of arr) m.set(a, (m.get(a) || 0) + 1); return m; };
const lmAr = multiset(lankarUttagna(ar.body)), lmSv = multiset(lankarUttagna(sv.body));
const länkDifferens = [...new Set([...lmAr.keys(), ...lmSv.keys()])].filter((k) => (lmAr.get(k) || 0) !== (lmSv.get(k) || 0));
K('Korslänkar multiset', länkDifferens.length === 0, `${lmAr.size} unika (originalet ${lmSv.size})${länkDifferens.length ? ' — differens: ' + länkDifferens.map((k) => `${k} AR×${lmAr.get(k) || 0}/SV×${lmSv.get(k) || 0}`).join(', ') : ''}`);

// 8. Externa URL:er multiset
const extUttagna = (t) => [...t.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map((m) => m[1].replace(/\/$/, ''));
const emAr = multiset(extUttagna(ar.body)), emSv = multiset(extUttagna(sv.body));
const extDifferens = [...new Set([...emAr.keys(), ...emSv.keys()])].filter((k) => (emAr.get(k) || 0) !== (emSv.get(k) || 0));
K('Externa URL:er identiska', extDifferens.length === 0, `${emAr.size} unika: ${[...emAr.keys()].map((u) => u.replace(/^https?:\/\//, '').split('/')[0]).join(' + ')}`);

// 9. H2/H1-paritet
const h2Sv = (sv.body.match(/^## /gm) || []).length;
const h1Sv = (sv.body.match(/^# /gm) || []).length;
const h1Ar = (ar.body.match(/^# /gm) || []).length;
K('H2-paritet', h2r.length === h2Sv, `${h2r.length} = ${h2Sv}`);
K('H1-paritet (B25 utan H1 ⇒ AR utan)', h1Ar === h1Sv, `${h1Ar} = ${h1Sv}`);

// 10. Tal-paritet — språkmedveten normalisering, numerisk multiset
const rensad = (t) => t.replace(/https?:\/\/[^\s)\]]+/g, ' ').replace(/\]\([^)]*\)/g, ']');
function talUrSv(t) {
  const x = rensad(t).replace(/(\d)[ ](\d{3})(?![\d])/g, '$1$2').replace(/,(\d+)/g, '.$1');
  return x.match(/\d+(?:\.\d+)?/g) || [];
}
function talUrAr(t) {
  const x = rensad(t).replace(/(\d),(\d{3})(?![\d,])/g, '$1$2');
  return x.match(/\d+(?:\.\d+)?/g) || [];
}
const tmSv = multiset(talUrSv(sv.body)), tmAr = multiset(talUrAr(ar.body));
const differensTal = [...new Set([...tmSv.keys(), ...tmAr.keys()])].filter((k) => (tmSv.get(k) || 0) !== (tmAr.get(k) || 0));
const totaltTal = [...tmSv.values()].reduce((a, b) => a + b, 0);
K('Tal-paritet numerisk multiset', differensTal.length === 0, `${totaltTal} SV-tal${differensTal.length === 0 ? ' == AR' : ' — differens: ' + differensTal.map((k) => `${k} SV×${tmSv.get(k) || 0}/AR×${tmAr.get(k) || 0}`).join(', ')}`);

// 11. Aritmetik motorräknad
const approx = (a, b, tol = 0.051) => Math.abs(a - b) <= tol;
const arit = [];
arit.push(['per-anställd: floor(18991e6/33e3/1000)×1000 = 575,000 (originalets egen golavrundning)', Math.floor((18991e6 / 33e3) / 1000) * 1000 === 575000]);
arit.push(['Attendo-CAGR (18991/14496)^(1/3)−1 ≈ 9.4 %', approx((Math.pow(18991 / 14496, 1 / 3) - 1) * 100, 9.4, 0.06)]);
arit.push(['Fresenius-fallet 22299/40840−1 ≈ −45.4 %', approx(Math.abs(22299 / 40840 - 1) * 100, 45.4, 0.06)]);
arit.push(['Roche-gapet 74.2−12.5 = 61.7 pp', approx(74.2 - 12.5, 61.7)]);
arit.push(['Trappspannet 93.0−12.5 = 80.5 > 80 (»mer än åttio«)', 93.0 - 12.5 === 80.5 && 80.5 > 80]);
arit.push(['ROIC−WACC 7.57−6.88 = 0.69 pp', approx(7.57 - 6.88, 0.69)]);
arit.push(['FCF-kvoten 2657/1165 ≈ 2.28×', approx(2657 / 1165, 2.28, 0.005)]);
arit.push(['Ägaravkastning 4.25+1.47 = 5.72 → 5.7 (originalets avrundning)', approx(4.25 + 1.47, 5.7, 0.06)]);
arit.push(['forward 16.05 < trailing 19.25', 16.05 < 19.25]);
arit.push(['EBITDA 7.50 < EBIT 10.34', 7.5 < 10.34]);
arit.push(['Attendo-vändningen −45 → 813', -45 < 0 && 813 > 0]);
arit.push(['Fresenius-vändningen −594 → +1264', -594 < 0 && 1264 > 0]);
arit.push(['PEG-ordningen 0.79 < 0.97 < 1.01', 0.79 < 0.97 && 0.97 < 1.01]);
arit.push(['beta 0.28 < 1', 0.28 < 1]);
const aritFel = arit.filter(([, p]) => !p);
K('Aritmetik motorräknad', aritFel.length === 0, `${arit.length - aritFel.length}/${arit.length}${aritFel.length ? ' — FEL: ' + aritFel.map(([n]) => n).join('; ') : ''}`);

// 12. readingMinutes
K('readingMinutes', ar.readingMinutes === Math.round(ordAr / 600), `${ar.readingMinutes} = round(${ordAr}/600)`);

// 13. Svenska/latinska läckor — vitlista (AR6/AR7-konventionen: namn översätts aldrig)
const vitlista = new Set(['ak1a', 'ak', 'lss', 'fresenius', 'attendo', 'galenica', 'genmab', 'eli', 'lilly', 'novo', 'nordisk', 'sonova', 'cellavision', 'getinge', 'roche', 'ifrs', 'ebitda', 'ebit', 'roe', 'roic', 'wacc', 'p', 'e', 'ev', 'peg', 'fcf', 'yahoo', 'finance', 'marketstack', 'stockanalysis', 's', 'p', 's&p', 'ivo.se', 'riksdagen.se']);
const latin = [...new Set(rensad(ar.body).match(/[A-Za-z][A-Za-z0-9&.\-]*/g) || [])];
const läckor = latin.filter((t) => !vitlista.has(t.toLowerCase()));
K('Svenska/latinska läckor 0', läckor.length === 0, `${latin.length} latinska token${läckor.length ? ' — LÄCKA: ' + läckor.join(', ') : ', alla vitlistade'}`);

// 14. Disclaimer exakt sista rad
const sista = ar.body.trim().split('\n').pop().trim();
K('Disclaimer arabisk sista rad', sista === '_هذا تحليل مالي تعليمي، وليس نصيحة استثمارية._', sista.slice(0, 60));

// 15. publishedAt = spegelns leveransdag (AR1/AR26-konventionen — rond 188 bevisad)
K('publishedAt = leveransdagen 2026-09-25', ar.publishedAt === '2026-09-25', `${ar.publishedAt} (originalet ${sv.publishedAt})`);

const fel = r.filter((x) => !x.ok).length;
console.log(`\nDOM: ${fel} FEL — ${fel === 0 ? 'GRÖN' : 'INTE LEVERANSKLAR'}`);
process.exit(fel === 0 ? 0 : 1);
