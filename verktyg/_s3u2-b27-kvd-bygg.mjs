#!/usr/bin/env node
// KVD-sond för B27 byggaktier (s3-u2, manifest auto-s3-1790044532079 — klaimfilen heter b25: racets dokumentation i planfilens B27-rad)
// Konvention: B24/AR8-klassens maskinella kontroller för svenskt original
// (talverifiering mot universumets rådata + live-verifierade rapporttal).
import { readFileSync, existsSync, readdirSync } from 'node:fs';

const ROD = (s) => `\x1b[31m${s}\x1b[0m`;
const GRON = (s) => `\x1b[32m${s}\x1b[0m`;

const FIL = 'data/blogg-utkast/byggaktier-sa-analyserar-du-byggbolag.json';
const post = JSON.parse(readFileSync(FIL, 'utf8'));
const ytor = { title: post.title, description: post.description, body: post.body };

let PASS = 0, FAIL = 0;
const fail = (namn, msg) => { FAIL++; console.log(ROD(`FAIL ${namn}: ${msg}`)); };
const pass = (namn, msg) => { PASS++; console.log(GRON(`PASS ${namn}${msg ? ': ' + msg : ''}`)); };
const check = (ok, namn, msg) => (ok ? pass(namn, msg) : fail(namn, msg));

// === 1. Varumärkesgrind: grindens EGNA regexer ur data/varumarke.json × 3 ytor ===
const marke = JSON.parse(readFileSync('data/varumarke.json', 'utf8'));
let grindFel = 0, grindVarn = 0, grindTräffar = [];
for (const { fran, allvar } of marke.forbjudnaFraser) {
  const re = new RegExp(fran, 'giu');
  for (const [yta, text] of Object.entries(ytor)) {
    re.lastIndex = 0;
    if (re.test(text)) {
      if (allvar === 'FEL') { grindFel++; grindTräffar.push(`${yta}: /${fran}/`); }
      else { grindVarn++; grindTräffar.push(`${yta} (VARN): /${fran}/`); }
    }
  }
}
check(grindFel === 0, 'varumärkesgrind FEL=0', grindFel ? grindTräffar.join('; ') : `${marke.forbjudnaFraser.length} regexer × 3 ytor, ${grindVarn} varningar`);
check(grindVarn === 0, 'varumärkesgrind VARN=0', grindVarn ? grindTräffar.join('; ') : 'rena');

// === 2. Rådverb SV+EN (imperativ rådgivning på läsaren; disclaimerns negation exkluderad) ===
const radVerb = [
  /\b(köp|sälj|köp inte|sälj inte|rekommenderar|rekommenderas|vi rekommenderar)\b/giu,
  /\bbör du (köpa|sälja|ägna|teckna)\b/giu,
  /\b(buy|sell|we recommend|strong buy)\b/giu,
];
const bodyUtanDisclaimer = post.body.replace(/_Detta är pedagogisk finansanalys, inte investeringsråd\._\s*$/, '');
let radTräff = [];
for (const re of radVerb) for (const [yta, text] of Object.entries({ ...ytor, body: bodyUtanDisclaimer })) {
  re.lastIndex = 0;
  const m = text.match(re);
  if (m) radTräff.push(`${yta}: ${m[0]}`);
}
check(radTräff.length === 0, 'rådverb SV+EN = 0', radTräff.join('; ') || 'inga');

// === 3. Sökord i title + ingress + minst 2 H2 ===
const SOK = 'byggaktier';
const h2or = (post.body.match(/^## .*$/gm) || []);
const h2medSok = h2or.filter((h) => h.toLowerCase().includes(SOK));
const ingress = post.body.split(/\n\n/)[0];
check(post.title.toLowerCase().includes(SOK), 'sökord i title', `"${SOK}"`);
check(ingress.toLowerCase().includes(SOK), 'sökord i ingress', 'första stycket');
check(h2medSok.length >= 2, 'sökord i ≥2 H2', `${h2medSok.length} av ${h2or.length} H2`);

// === 4. Title ≤ 60, OG-description ≤ 155 ===
check(post.title.length <= 60, 'title ≤ 60 tkn', `${post.title.length}/60`);
check(post.description.length <= 155, 'description ≤ 155 tkn', `${post.description.length}/155`);

// === 5. Ord (rådata-konventionen: whitespace-token på body utan markdown) ===
const ord = post.body.replace(/[#*_\[\]()]/g, ' ').trim().split(/\s+/).length;
check(ord >= 1150 && ord <= 1400, 'ord i spannet 1150–1400 (mall 1200)', `${ord}`);

// === 6. Korslänkar ENBART till publicerade ytor ===
const bloggPublicerade = new Set(readdirSync('data/blogg').filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, '')));
const deep = JSON.parse(readFileSync('public/deep-courses.json', 'utf8'));
const kurserPublicerade = new Set(Object.keys(deep));
const lnkar = [...post.body.matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1]);
let interna = [], externa = [], trasiga = [];
for (const l of lnkar) {
  if (l.startsWith('/blogg/')) { interna.push(l); if (!bloggPublicerade.has(l.replace('/blogg/', ''))) trasiga.push(l); }
  else if (l.startsWith('/kurser/')) { interna.push(l); if (!kurserPublicerade.has(l.replace('/kurser/', ''))) trasiga.push(l); }
  else externa.push(l);
}
check(trasiga.length === 0, 'korslänkar resolve:ar mot publicerade ytor', `${interna.length} interna OK${externa.length ? `, ${externa.length} externa` : ''}`);
check(!lnkar.some((l) => /-(en|ar)$/.test(l.split('?')[0].replace(/\/$/, '').split('/').pop())), 'inga länkar till utkast/översättningssuffix', 'rena');

// === 7. Aritmetik motorräknad (procentsatser: avrundning till en decimal — Ö13/B24-klassens dokumenterade tolerans) ===
const approx = (a, b, tol = 0.0015) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
const eps = (x) => Math.round(x * 10) / 10;
const arith = [];
// orderstockstäckning och orderingång (Skanska, årsslut 2025)
arith.push(['täckning 257,9/176,7 = 1,46', approx(257.9 / 176.7, 1.46, 0.005)]);
arith.push(['orderingång 1−179,5/207,9 = 13,7 %', eps((1 - 179.5 / 207.9) * 100) === 13.7]);
// Veidekke orderbok
arith.push(['orderbok 47,3/41,0 = +15,4 %', eps((47.3 / 41.0 - 1) * 100) === 15.4]);
// fastpris-exemplet (marginal som procent av kontraktssumman 1 000)
arith.push(['bas 1000−900 = 100 (10,0 %)', approx(1000 - 900, 100) && approx(100 / 1000 * 100, 10.0)]);
arith.push(['8 % inflation: 900×1,08 = 972, marginal 28 (2,8 %)', approx(900 * 1.08, 972) && approx((1000 - 972) / 1000 * 100, 2.8)]);
arith.push(['12 % inflation: 900×1,12 = 1 008, marginal −8 (−0,8 %)', approx(900 * 1.12, 1008) && approx((1000 - 1008) / 1000 * 100, -0.8)]);
arith.push(['50 % prisskrivning: pris 1000+36 = 1 036, marginal 64 (6,4 %)', approx(1000 + 0.5 * 72, 1036) && approx((1036 - 972) / 1000 * 100, 6.4)]);
// broexemplet (procent på färdigt)
arith.push(['intäkt 0,60×800 = 480', approx(0.60 * 800, 480)]);
arith.push(['vinstmarginal 36/480 = 7,5 %', approx(36 / 480 * 100, 7.5)]);
// Skanska-serien 2022→2025
arith.push(['omsättning 176 658/163 174 = +8,3 %', eps((176658 / 163174 - 1) * 100) === 8.3]);
arith.push(['resultat 1−5 702/8 256 = −30,9 %', eps((1 - 5702 / 8256) * 100) === 30.9]);
arith.push(['nettomarginal 5 702/176 658 = 3,2 %', eps(5702 / 176658 * 100) === 3.2]);
// NCC
arith.push(['omsättningsfall 1−55,7/61,6 = −9,6 %', eps((1 - 55.7 / 61.6) * 100) === 9.6]);
arith.push(['rörelsemarginal 1 938/55 717 = 3,5 %', eps(1938 / 55717 * 100) === 3.5]);
let aFail = arith.filter(([, ok]) => !ok);
check(aFail.length === 0, 'aritmetik motorräknad', aFail.length ? aFail.map(([n]) => n).join('; ') : `${arith.length}/${arith.length}`);

// === 8. Talverifiering: citerade källtal finns i universumets rådata ===
const uni = JSON.parse(readFileSync('data/portfolj-system/bolagsunivers.json', 'utf8'));
const r2 = (x) => Math.round(x * 100) / 100;
const ska = uni.find((x) => x.ticker === 'SKA-B.ST');
let talFail = [];
const skaFalt = { pe: 16.4, evEbit: 13.8, pb: 1.76, fcfYield: 7.8, prognos: 10.9, roe: 11.1, roic: 9.1, ebit: 3.9, brutto: 8.9, skuld: 0.25 };
if (eps(ska.vardering.pe) !== skaFalt.pe) talFail.push(`P/E ${eps(ska.vardering.pe)}≠${skaFalt.pe}`);
if (eps(ska.vardering.evEbit) !== skaFalt.evEbit) talFail.push(`EV/EBIT ${eps(ska.vardering.evEbit)}≠${skaFalt.evEbit}`);
if (r2(ska.vardering.pb) !== skaFalt.pb) talFail.push(`P/B ${r2(ska.vardering.pb)}≠${skaFalt.pb}`);
if (eps(ska.vardering.fcfYield * 100) !== skaFalt.fcfYield) talFail.push(`FCF-yield ${eps(ska.vardering.fcfYield * 100)}≠${skaFalt.fcfYield}`);
if (eps(ska.tillvaxt.prognosTillvaxt * 100) !== skaFalt.prognos) talFail.push(`prognos ${eps(ska.tillvaxt.prognosTillvaxt * 100)}≠${skaFalt.prognos}`);
if (eps(ska.lonksamhet.roe * 100) !== skaFalt.roe) talFail.push(`ROE ${eps(ska.lonksamhet.roe * 100)}≠${skaFalt.roe}`);
if (eps(ska.lonksamhet.roic * 100) !== skaFalt.roic) talFail.push(`ROIC ${eps(ska.lonksamhet.roic * 100)}≠${skaFalt.roic}`);
if (eps(ska.lonksamhet.ebitMarginal * 100) !== skaFalt.ebit) talFail.push(`EBIT ${eps(ska.lonksamhet.ebitMarginal * 100)}≠${skaFalt.ebit}`);
if (eps(ska.lonksamhet.bruttoMarginal * 100) !== skaFalt.brutto) talFail.push(`brutto ${eps(ska.lonksamhet.bruttoMarginal * 100)}≠${skaFalt.brutto}`);
if (r2(ska.stabilitet.skuldEgenkapital) !== skaFalt.skuld) talFail.push(`skuld/EK ${r2(ska.stabilitet.skuldEgenkapital)}≠${skaFalt.skuld}`);
// Skanska-serien 2022 och 2025
const serie = [
  ['oms 2022 = 163 174 Mkr', approx(ska.serier.omsattning[0] / 1e6, 163174, 0.001)],
  ['oms 2025 = 176 658 Mkr', approx(ska.serier.omsattning[3] / 1e6, 176658, 0.001)],
  ['res 2022 = 8 256 Mkr', approx(ska.serier.resultat[0] / 1e6, 8256, 0.001)],
  ['res 2025 = 5 702 Mkr', approx(ska.serier.resultat[3] / 1e6, 5702, 0.001)],
];
for (const [namn, ok] of serie) if (!ok) talFail.push('Skanska ' + namn);
// text-tal: alla citerade procent/tal i bodyn ska finnas bland tillåtna
// (URL:er strippas först — AR8-precedensen: formatkod är inte innehållstal)
const bodyTal = post.body.replace(/\]\([^)]*\)/g, ' ');
const tillatna = new Set(['257,9','176,7','1,46','54,4','55,7','179,5','207,9','13,7','41,0','47,3','15,4','1 000','900','100','10,0','972','28','2,8','1 008','0,8','50','1 036','64','6,4','800','480','0,60','36','7,5','60','163 174','176 658','8,3','8 256','5 702','30,9','3,2','2026-09-15','3,9','8,9','11,1','9,1','0,25','61,6','9,6','1 938','3,5','4,8','16,4','13,8','1,76','7,8','10,9','5 702/176 658','12','15','4 2025']);
const talIText = [...bodyTal.matchAll(/\d[\d\s,]*\d|\d/g)].map((m) => m[0].replace(/\s+/g, ' ').trim());
const nyaTal = [...new Set(talIText)].filter((t) => !tillatna.has(t) && !/^(19|20)\d{2}$/.test(t) && !/^\d$/.test(t) && !/^0\d$/.test(t));
check(talFail.length === 0 && nyaTal.length === 0, 'talverifiering mot rådata + text-tal', [...talFail, ...nyaTal.map((t) => `text-tal "${t}" ej i tillåtnamängd`)].join('; ') || 'Skanska 10 fält + serie + text-tal');

// === 9. Struktur: BlogPost-form + disclaimer + readingMinutes + klaimfil ===
check(post.slug === 'byggaktier-sa-analyserar-du-byggbolag', 'slug', post.slug);
check(['slug','title','description','pillar','author','publishedAt','readingMinutes','tags','body'].every((k) => k in post), 'BlogPost-fält', '9 fält');
check(post.body.trim().endsWith('_Detta är pedagogisk finansanalys, inte investeringsråd._'), 'disclaimer exakt sista rad', 'OK');
check(post.readingMinutes === Math.round(ord / 600), 'readingMinutes = round(ord/600)', `${post.readingMinutes} = round(${ord}/600)`);
check(existsSync('data/blogg-utkast/' + post.slug + '.json') && !existsSync('data/blogg/' + post.slug + '.json'), 'utkast i blogg-utkast/, EJ publicerad', 'R2 ren');
check(existsSync('data/vakten/s3-b25-bygg-ansprak-2026-09-22.md'), 'klaimfil på disk', 'disk-först');

console.log(`\n${FAIL === 0 ? GRON('KVD GRÖN') : ROD('KVD RÖD')}: ${PASS} PASS · ${FAIL} FAIL`);
process.exit(FAIL === 0 ? 0 : 1);
