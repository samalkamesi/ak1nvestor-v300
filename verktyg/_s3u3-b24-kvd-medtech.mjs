#!/usr/bin/env node
// KVD-sond för B24 medtech-aktier (s3-u3, manifest auto-s3-1790021717553)
// Konvention: AR8/AR9/AR14-klassens maskinella kontroller, anpassad för svenskt original
// (ingen talparitet-översättning; i stället talverifiering mot universumets rådata).
import { readFileSync, existsSync, readdirSync } from 'node:fs';

const ROD = (s) => `\x1b[31m${s}\x1b[0m`;
const GRON = (s) => `\x1b[32m${s}\x1b[0m`;
const GUL = (s) => `\x1b[33m${s}\x1b[0m`;

const FIL = 'data/blogg-utkast/medtechaktier-sa-analyserar-du-medicintekniska-bolag.json';
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
check(grindFel === 0, 'varumärkesgrind FEL=0', grindFel ? grindTräffar.join('; ') : `26 regexer × 3 ytor, ${grindVarn} varningar`);
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
const SOK = 'medtech-aktier';
const h2or = (post.body.match(/^## .*$/gm) || []);
const h2medSok = h2or.filter((h) => h.toLowerCase().includes(SOK));
const ingress = post.body.split(/\n\n/)[0];
check(post.title.toLowerCase().includes(SOK), 'sökord i title', `"${SOK}"`);
check(ingress.toLowerCase().includes(SOK), 'sökord i ingress', `första stycket`);
check(h2medSok.length >= 2, 'sökord i ≥2 H2', `${h2medSok.length} av ${h2or.length} H2`);

// === 4. Title ≤ 60, OG-description ≤ 155 ===
check(post.title.length <= 60, 'title ≤ 60 tkn', `${post.title.length}/60`);
check(post.description.length <= 155, 'description ≤ 155 tkn', `${post.description.length}/155`);

// === 5. Ord (rådata-konventionen: whitespace-token på body utan markdown) ===
const ord = post.body.replace(/[#*_\[\]()]/g, ' ').trim().split(/\s+/).length;
check(ord >= 1150 && ord <= 1400, 'ord i spannet 1150–1400 (mall 1200, B-serien 1169–1400)', `${ord}`);

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

// === 7. Aritmetik motorräknad ===
const approx = (a, b, tol = 0.0015) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
const arith = [];
// bruttogapet
arith.push(['73,7 − 25,4 = 48,3', approx(73.7 - 25.4, 48.3)]);
// medianer (8 produktbolag)
const brutto = [69.2, 68.7, 67.2, 39.6, 48.6, 60.1, 69.3, 73.7].sort((a, b) => a - b);
const evEbit = [17.1, 24.7, 17.5, 14.6, 13.7, 24.1, 23.8, 20.1].sort((a, b) => a - b);
const roic = [12.8, 16.2, 20.7, 12.6, 13.8, 9.0, 21.6, 17.0].sort((a, b) => a - b);
const pe7 = [19.4, 30.0, 38.7, 24.8, 34.1, 41.0, 26.1].sort((a, b) => a - b);
arith.push(['bruttomedian (67,2+68,7)/2 = 68,0', approx((brutto[3] + brutto[4]) / 2, 68.0)]);
arith.push(['EV/EBIT-median (17,5+20,1)/2 = 18,8', approx((evEbit[3] + evEbit[4]) / 2, 18.8)]);
arith.push(['ROIC-median (13,8+16,2)/2 = 15,0', approx((roic[3] + roic[4]) / 2, 15.0)]);
arith.push(['P/E-median (7 bolag) = 30,0', approx(pe7[3], 30.0)]);
// fabriksexemplet
arith.push(['täckning 68×100 = 6 800', approx(68 * 100, 6800)]);
arith.push(['EBIT bas 6 800−5 200 = 1 600 (16 %)', approx(6800 - 5200, 1600) && approx(1600 / 10000, 0.16)]);
arith.push(['EBIT +10 % volym: 68×110=7 480, −5 200 = 2 280', approx(68 * 110 - 5200, 2280)]);
arith.push(['resultatökning 2 280/1 600 = 42,5 %', approx(2280 / 1600, 1.425)]);
arith.push(['hävstång 42,5/10 = 4,25 ("mer än fyra gånger")', 2280 / 1600 / 0.10 > 4]);
arith.push(['pris −5 %: intäkt 9 500, täckning 9 500−3 200 = 6 300', approx(9500 - 3200, 6300)]);
arith.push(['EBIT 6 300−5 200 = 1 100; fallet 1−1 100/1 600 = 31 % (31,25 avrundat nedåt — dokumenterad tolerans 0,01)', approx(1 - 1100 / 1600, 0.31, 0.01)]);
// Getinge
arith.push(['intäkt 34 969/28 292 = +23,6 %', approx(34969 / 28292 - 1, 0.236, 0.005)]);
arith.push(['resultat 1−2 258/2 491 = −9,4 %', approx(1 - 2258 / 2491, 0.094, 0.005)]);
arith.push(['nettomarginal 2 491/28 292 = 8,8 %', approx(2491 / 28292, 0.088, 0.005)]);
arith.push(['nettomarginal 2 258/34 969 = 6,5 %', approx(2258 / 34969, 0.065, 0.005)]);
// multipel- och marginalkvoter
arith.push(['P/E-kvot 41,0/19,4 = 2,11 ("mer än dubbelt")', 41.0 / 19.4 > 2]);
arith.push(['EBIT-kvot 24,7/10,5 = 2,35 ("mer än dubbelt")', 24.7 / 10.5 > 2]);
let aFail = arith.filter(([, ok]) => !ok);
check(aFail.length === 0, 'aritmetik motorräknad', aFail.length ? aFail.map(([n]) => n).join('; ') : `${arith.length}/${arith.length}`);

// === 8. Talverifiering: citerade källtal finns i universumets rådata ===
const uni = JSON.parse(readFileSync('data/portfolj-system/bolagsunivers.json', 'utf8'));
const perBolag = {
  'BSX': { pe: 19.4, brutto: 69.2, ebit: 22.9, evEbit: 17.1 },
  'CEVI.ST': { pe: 30.0, brutto: 68.7, evEbit: 24.7 },
  'COLO-B.CO': { pe: 38.7, brutto: 67.2 },
  'EKTA-B.ST': { brutto: 39.6, ebit: 10.5 },
  'GETI-B.ST': { pe: 24.8, brutto: 48.6, skuld: 0.36 },
  'AMBU.B': { pe: 34.1, brutto: 60.1, evEbit: 24.1, omsCAGR5: 10.8 },
  'STMN.SW': { pe: 41.0, brutto: 69.3, ebit: 24.7 },
  'SOON.SW': { pe: 26.1, brutto: 73.7, roe: 20.5 },
  'FRE.DE': { brutto: 25.4 },
  'ATT.ST': { brutto: 36.9 },
};
let talFail = [];
const eps = (x) => Math.round(x * 10) / 10;
for (const [t, falt] of Object.entries(perBolag)) {
  const b = uni.find((x) => x.ticker === t);
  if (!b) { talFail.push(`${t} saknas i universumet`); continue; }
  if ('pe' in falt && eps(b.vardering.pe) !== falt.pe) talFail.push(`${t} P/E ${eps(b.vardering.pe)}≠${falt.pe}`);
  if ('brutto' in falt && eps(b.lonksamhet.bruttoMarginal * 100) !== falt.brutto) talFail.push(`${t} brutto ${eps(b.lonksamhet.bruttoMarginal * 100)}≠${falt.brutto}`);
  if ('ebit' in falt && eps(b.lonksamhet.ebitMarginal * 100) !== falt.ebit) talFail.push(`${t} EBIT ${eps(b.lonksamhet.ebitMarginal * 100)}≠${falt.ebit}`);
  if ('evEbit' in falt && eps(b.vardering.evEbit) !== falt.evEbit) talFail.push(`${t} EV/EBIT ${eps(b.vardering.evEbit)}≠${falt.evEbit}`);
  if ('roe' in falt && eps(b.lonksamhet.roe * 100) !== falt.roe) talFail.push(`${t} ROE ${eps(b.lonksamhet.roe * 100)}≠${falt.roe}`);
  if ('omsCAGR5' in falt && eps(b.tillvaxt.omsattningCAGR5ar * 100) !== falt.omsCAGR5) talFail.push(`${t} omsCAGR5 ${eps(b.tillvaxt.omsattningCAGR5ar * 100)}≠${falt.omsCAGR5}`);
}
// Getinges serie
const g = uni.find((x) => x.ticker === 'GETI-B.ST');
const serie = [
  ['oms 2022 = 28 292', approx(g.serier.omsattning[0] / 1e6, 28292, 0.001)],
  ['oms 2025 = 34 969', approx(g.serier.omsattning[3] / 1e6, 34969, 0.001)],
  ['res 2022 = 2 491', approx(g.serier.resultat[0] / 1e6, 2491, 0.001)],
  ['res 2025 = 2 258', approx(g.serier.resultat[3] / 1e6, 2258, 0.001)],
];
for (const [namn, ok] of serie) if (!ok) talFail.push('Getinge ' + namn);
// rikstäckande cital i text: alla citerade procent/tal i bodyn ska finnas bland tillåtna
// (URL:er strippas först — AR8-precedensens klass: formatkod är inte innehållstal)
const bodyTal = post.body.replace(/\]\([^)]*\)/g, ' ');
const tillatna = new Set(['48,3','68,0','30,0','18,8','15,0','19,4','41,0','17,1','24,7','24,1','10,8','60,1','20,5','8,8','6,5','23,6','9,4','42,5','31','16','68','32','10 000','6 800','5 200','1 600','7 480','2 280','9 500','6 300','1 100','100','110','28 292','34 969','2 491','2 258','25,4','36,9','39,6','48,6','67,2','68,7','69,2','69,3','73,7','60','50','40','70','73','25','10','10,5','745','510','2017/745','2026-09-03','5']);
const talIText = [...bodyTal.matchAll(/\d[\d\s,]*\d|\d/g)].map((m) => m[0].replace(/\s+/g, ' ').trim());
const nyaTal = [...new Set(talIText)].filter((t) => !tillatna.has(t) && !/^(19|20)\d{2}$/.test(t) && !/^\d$/.test(t) && !/^0\d$/.test(t));
check(talFail.length === 0 && nyaTal.length === 0, 'talverifiering mot rådata', [...talFail, ...nyaTal.map((t) => `text-tal "${t}" ej i tillåtnamängd`)].join('; ') || `${Object.keys(perBolag).length} bolag + Getinge-serie + text-tal`);

// === 9. Struktur: BlogPost-form + disclaimer + readingMinutes ===
check(post.slug === 'medtechaktier-sa-analyserar-du-medicintekniska-bolag', 'slug', post.slug);
check(['slug','title','description','pillar','author','publishedAt','readingMinutes','tags','body'].every((k) => k in post), 'BlogPost-fält', '9 fält');
check(post.body.trim().endsWith('_Detta är pedagogisk finansanalys, inte investeringsråd._'), 'disclaimer exakt sista rad', 'OK');
check(post.readingMinutes === Math.round(ord / 600), 'readingMinutes = round(ord/600)', `${post.readingMinutes} = round(${ord}/600)`);
check(existsSync('data/blogg-utkast/' + post.slug + '.json') && !existsSync('data/blogg/' + post.slug + '.json'), 'utkast i blogg-utkast/, EJ publicerad', 'R2 ren');

console.log(`\n${FAIL === 0 ? GRON('KVD GRÖN') : ROD('KVD RÖD')}: ${PASS} PASS · ${FAIL} FAIL`);
process.exit(FAIL === 0 ? 0 : 1);
