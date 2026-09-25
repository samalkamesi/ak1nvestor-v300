#!/usr/bin/env node
// KVD för AR29 bygg-ar (studio-sessionen rond 191, 2026-09-25) — AR28-mallens kontroller med byggens aritmetik
import { readFileSync } from 'node:fs';

const AR = '/home/ak1a/agent/ak1/data/blogg-utkast/byggaktier-sa-analyserar-du-byggbolag-ar.json';
const SV = '/home/ak1a/agent/ak1/data/blogg-utkast/byggaktier-sa-analyserar-du-byggbolag.json';
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

// 2. Varumärkesgrind
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

// 4. Sökord
const SOK = 'أسهم البناء';
const ingress = ar.body.split('\n\n')[0];
const h2r = ar.body.match(/^## .*$/gm) || [];
const h2Traff = h2r.filter((h) => h.includes(SOK));
K('Sökord i title+ingress+2 H2', ar.title.includes(SOK) && ingress.includes(SOK) && h2Traff.length >= 2, `title ${ar.title.includes(SOK) ? '✓' : '✗'}, ingress ${ingress.includes(SOK) ? '✓' : '✗'}, H2 ${h2Traff.length} st`);

// 5. Title/OG
K('Title ≤ 60', [...ar.title].length <= 60, [...ar.title].length + '/60 (originalet ' + [...sv.title].length + ')');
K('OG-description ≤ 155', [...ar.description].length <= 155, [...ar.description].length + '/155');

// 6. Ord
const ordAr = ar.body.trim().split(/\s+/).length;
const ordSv = sv.body.trim().split(/\s+/).length;
K('Ord 1000–1400 (originalets täthet)', ordAr >= 1000 && ordAr <= 1400, `${ordAr} (originalet ${ordSv})`);

// 7. Korslänkar multiset
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
K('H1-paritet (B27 utan H1 ⇒ AR utan)', h1Ar === h1Sv, `${h1Ar} = ${h1Sv}`);

// 10. Tal-paritet — språkmedveten normalisering
const rensad = (t) => t.replace(/https?:\/\/[^\s)\]]+/g, ' ').replace(/\]\([^)]*\)/g, ']');
function talUrSv(t) {
  // Kvartalsetiketter (Q4 2025) är formatkod ej innehållstal — strippas SYMMETRISKT på båda språken
  // (AR5/AR12-precedensens klass; AR29:s arabiska skriver ut الربع الرابع = fyra, rätt språkform)
  const x = rensad(t).replace(/\bQ([1-4])\b/g, ' ').replace(/(\d)[ ](\d{3})(?![\d])/g, '$1$2').replace(/,(\d+)/g, '.$1');
  return x.match(/\d+(?:\.\d+)?/g) || [];
}
function talUrAr(t) {
  const x = rensad(t).replace(/\bQ([1-4])\b/g, ' ').replace(/(\d),(\d{3})(?![\d,])/g, '$1$2');
  return x.match(/\d+(?:\.\d+)?/g) || [];
}
const tmSv = multiset(talUrSv(sv.body)), tmAr = multiset(talUrAr(ar.body));
const differensTal = [...new Set([...tmSv.keys(), ...tmAr.keys()])].filter((k) => (tmSv.get(k) || 0) !== (tmAr.get(k) || 0));
const totaltTal = [...tmSv.values()].reduce((a, b) => a + b, 0);
K('Tal-paritet numerisk multiset', differensTal.length === 0, `${totaltTal} SV-tal${differensTal.length === 0 ? ' == AR' : ' — differens: ' + differensTal.map((k) => `${k} SV×${tmSv.get(k) || 0}/AR×${tmAr.get(k) || 0}`).join(', ')}`);

// 11. Aritmetik motorräknad
const approx = (a, b, tol = 0.051) => Math.abs(a - b) <= tol;
const arit = [];
arit.push(['orderstockstäckning 257.9/176.7 ≈ 1.46 år', approx(257.9 / 176.7, 1.46, 0.005)]);
arit.push(['NCC-kvoten 54.4/55.7 nästan exakt 1 (|x−1| < 0.05)', Math.abs(54.4 / 55.7 - 1) < 0.05]);
arit.push(['Skanska-orderingång 179.5/207.9−1 ≈ −13.7 %', approx(Math.abs(179.5 / 207.9 - 1) * 100, 13.7, 0.06)]);
arit.push(['Veidekke 47.3/41.0−1 ≈ +15.4 %', approx((47.3 / 41.0 - 1) * 100, 15.4, 0.06)]);
arit.push(['fastprisbas 1000−900 = 100 → 100/1000 = 10.0 %', 1000 - 900 === 100 && approx(100 / 1000 * 100, 10.0)]);
arit.push(['8 % inflation: 900×1.08 = 972 → marginal 28 = 2.8 %', approx(900 * 1.08, 972, 0.001) && 1000 - 972 === 28 && approx(28 / 1000 * 100, 2.8)]);
arit.push(['12 % inflation: 900×1.12 = 1008 → marginal −8 = −0.8 %', approx(900 * 1.12, 1008, 0.001) && 1000 - 1008 === -8 && approx(8 / 1000 * 100, 0.8)]);
arit.push(['50 % prisskrivning: pris 1000+0.5×72 = 1036 → marginal 64 = 6.4 %', 1000 + 0.5 * 72 === 1036 && 1036 - 972 === 64 && approx(64 / 1000 * 100, 6.4)]);
arit.push(['IFRS 15-broexemplet: 0.60×800 = 480 → 36/480 = 7.5 %', 0.6 * 800 === 480 && approx(36 / 480 * 100, 7.5)]);
arit.push(['Skanska intäkt 176658/163174−1 ≈ +8.3 %', approx((176658 / 163174 - 1) * 100, 8.3, 0.06)]);
arit.push(['Skanska resultat 5702/8256−1 ≈ −30.9 %', approx(Math.abs(5702 / 8256 - 1) * 100, 30.9, 0.06)]);
arit.push(['nettomarginal 5702/176658 ≈ 3.2 %', approx((5702 / 176658) * 100, 3.2, 0.06)]);
arit.push(['NCC intäkt 55.7/61.6−1 ≈ −9.6 %', approx(Math.abs(55.7 / 61.6 - 1) * 100, 9.6, 0.06)]);
arit.push(['NCC rörelse 1938/55700 ≈ 3.5 %', approx((1938 / 55700) * 100, 3.5, 0.06)]);
arit.push(['Skanska multipler P/E 16.4 > EV/EBIT 13.8', 16.4 > 13.8]);
const aritFel = arit.filter(([, p]) => !p);
K('Aritmetik motorräknad', aritFel.length === 0, `${arit.length - aritFel.length}/${arit.length}${aritFel.length ? ' — FEL: ' + aritFel.map(([n]) => n).join('; ') : ''}`);

// 12. readingMinutes
K('readingMinutes', ar.readingMinutes === Math.round(ordAr / 600), `${ar.readingMinutes} = round(${ordAr}/600)`);

// 13. Läckor
const vitlista = new Set(['ak1a', 'ak', 'skanska', 'ncc', 'veidekke', 'ifrs', 'p', 'e', 'ev', 'ebit', 'b', 'roe', 'roic', 'ttm', 'q4', 'stockanalysis', 's', 's&p', 'global']);
const latin = [...new Set(rensad(ar.body).match(/[A-Za-z][A-Za-z0-9&.\-]*/g) || [])];
const läckor = latin.filter((t) => !vitlista.has(t.toLowerCase()));
K('Svenska/latinska läckor 0', läckor.length === 0, `${latin.length} latinska token${läckor.length ? ' — LÄCKA: ' + läckor.join(', ') : ', alla vitlistade'}`);

// 14. Disclaimer
const sista = ar.body.trim().split('\n').pop().trim();
K('Disclaimer arabisk sista rad', sista === '_هذا تحليل مالي تعليمي، وليس نصيحة استثمارية._', sista.slice(0, 60));

// 15. publishedAt
K('publishedAt = leveransdagen 2026-09-25', ar.publishedAt === '2026-09-25', `${ar.publishedAt} (originalet ${sv.publishedAt})`);

const fel = r.filter((x) => !x.ok).length;
console.log(`\nDOM: ${fel} FEL — ${fel === 0 ? 'GRÖN' : 'INTE LEVERANSKLAR'}`);
process.exit(fel === 0 ? 0 : 1);
