#!/usr/bin/env node
// KVD för AR1 fastighetsaktier-ar (s3-u1, 2026-09-19) — AR2-konventionen tillämpad på B1.
// Körs: node verktyg/_s3u1-b1-ar-kvd-fastighet.mjs  → GRÖN/röd dom + detaljrader.
import { readFileSync, existsSync } from 'node:fs';

const AR_PATH = 'data/blogg-utkast/fastighetsaktier-sa-analyserar-du-fastighetsbolag-ar.json';
const SV_PATH = 'data/blogg-utkast/fastighetsaktier-sa-analyserar-du-fastighetsbolag.json';
const LIVE_PATH = 'data/blogg/fastighetsaktier-sa-analyserar-du-fastighetsbolag-ar.json';

let fel = 0, varn = 0;
const F = (m) => { fel++; console.log('FEL: ' + m); };
const V = (m) => { varn++; console.log('VARN: ' + m); };
const OK = (m) => console.log('OK: ' + m);

// -- 1. filer & fält --
if (!existsSync(AR_PATH)) { console.log('FEL: AR-filen saknas'); process.exit(1); }
const ar = JSON.parse(readFileSync(AR_PATH, 'utf8'));
const sv = JSON.parse(readFileSync(SV_PATH, 'utf8'));
for (const k of ['slug', 'title', 'description', 'pillar', 'author', 'publishedAt', 'readingMinutes', 'tags', 'body'])
  if (!(k in ar)) F('falt saknas: ' + k);
if (ar.slug !== 'fastighetsaktier-sa-analyserar-du-fastighetsbolag-ar') F('slug fel: ' + ar.slug); else OK('slug');
if (existsSync(LIVE_PATH)) F('data/blogg/ (live) rord — filen far inte finnas'); else OK('live-mapp orord (ingen -ar i data/blogg/)');

const title = ar.title, description = ar.description, body = ar.body;
const ytor = { title, description, body };

// -- 2. varumärkesgrind: data/varumarke.json forbjudnaFraser x 3 ytor --
const vm = JSON.parse(readFileSync('data/varumarke.json', 'utf8'));
let vmFel = 0, vmVar = 0, vmN = 0;
for (const p of vm.forbjudnaFraser || []) {
  vmN++;
  const re = new RegExp(p.fran, 'iu');
  for (const [namn, yt] of Object.entries(ytor)) {
    const m = yt.match(re);
    if (m) { if (p.allvar === 'FEL') { vmFel++; F(`varumarke [${p.id}] ${namn}: "${m[0]}"`); } else { vmVar++; V(`varumarke-VARN [${p.id}] ${namn}: "${m[0]}"`); } }
  }
}
OK(`varumärkesgrind: ${vmN} mönster x 3 ytor = ${vmFel} FEL / ${vmVar} VARN`);

// -- 3. rådverb SV+EN+AR = 0 --
const radRe = [
  [/(köp|sälj)\s+(denna|detta|den|aktien\b)|rekommenderar\s+(att\s+)?(köpa|sälja)|du\s+(bör|borde)\s+(köpa|sälja)/iu, 'SV'],
  [/(buy|sell)\s+(this\s+)?(stock|share)|you\s+should\s+(buy|sell)|we\s+recommend/iu, 'EN'],
  [/اشترِ|بِع|استثمر في هذا|أنصحك|نوصي بشراء/u, 'AR'],
];
let radFel = 0;
for (const [re, sprak] of radRe) { const m = (title + ' ' + description + ' ' + body).match(re); if (m) { radFel++; F(`radverb ${sprak}: "${m[0]}"`); } }
OK(`radverb SV+EN+AR = ${radFel}`);

// -- 4. sökord i title + ingress + >=2 H2 --
const KW = 'أسهم العقارات';
const ingress = body.split(/\n\n/)[0];
const h2 = [...body.matchAll(/^## (.+)$/gm)].map(m => m[1]);
const kwH2 = h2.filter(h => h.includes(KW)).length;
if (!title.includes(KW)) F('sokord saknas i title'); else OK('sokord i title');
if (!ingress.includes(KW)) F('sokord saknas i ingress'); else OK('sokord i ingress');
if (kwH2 < 2) F(`sokord i bara ${kwH2} H2 (krav >=2)`); else OK(`sokord i ${kwH2} H2`);

// -- 5. längder --
const tLen = [...title].length, dLen = [...description].length;
if (tLen > 60) F(`title ${tLen}/60`); else OK(`title ${tLen}/60`);
if (dLen > 155) F(`OG ${dLen}/155`); else OK(`OG ${dLen}/155`);

// -- 6. ord --
const ord = body.split(/\s+/).filter(Boolean).length;
const svOrd = sv.body.split(/\s+/).filter(Boolean).length;
if (ord < 1150 || ord > 1400) F(`ord ${ord} utanfor 1150–1400 (originalet ${svOrd})`); else OK(`ord ${ord}/1400 (originalet ${svOrd})`);

// -- 7. korslänkar multiset --
const lank = (t) => [...t.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]).sort();
const aL = lank(body), sL = lank(sv.body);
const samma = aL.length === sL.length && aL.every((x, i) => x === sL[i]);
if (!samma) F(`korslankar skiljer: AR ${aL.length} (${JSON.stringify(aL)}) vs SV ${sL.length} (${JSON.stringify(sL)})`); else OK(`korslankar ${aL.length}/${sL.length} MULTITSET-identiska (km-042 x2)`);

// -- 8. talparitet (normaliserad) --
const rensaUrls = (t) => t.replace(/\]\([^)]+\)/g, ']').replace(/https?:\/\/[^\s)]+/g, '');
function tal(text) {
  const rå = rensaUrls(text).match(/\d[\d\s.,]*\d|\d/g) || [];
  return rå.map(r => {
    const p = r.trim().split(/[\s.,]/);
    const sista = p[p.length - 1];
    if (p.length > 1 && sista.length === 3 && p.slice(0, -1).every(x => x.length >= 1 && x.length <= 3)) return p.join('');
    if (p.length > 1) return p.slice(0, -1).join('') + '.' + sista;
    return p[0];
  });
}
const norm = (arr) => arr.map(x => String(parseFloat(x))).sort();
const tA = norm(tal(body)), tS = norm(tal(sv.body));
const diffA = tA.filter(x => !tS.includes(x)), diffS = tS.filter(x => !tA.includes(x));
if (tA.length !== tS.length || diffA.length || diffS.length)
  F(`talparitet: AR ${tA.length} vs SV ${tS.length}; endast-AR [${diffA}] endast-SV [${diffS}]`);
else OK(`talparitet ${tA.length}/${tS.length} normaliserade (SV decimalkomma/mellanslag == AR punkt/tusentalskomma)`);

// -- 9. aritmetik motorräknad --
const A = [
  ['direktavkastning 4.80/96', 4.80 / 96 * 100, 5.0, 0.05],
  ['substans 12000-7000', 12000 - 7000, 5000, 0],
  ['NAV 5000/100', 5000 / 100, 50, 0],
  ['P/NAV 42/50', 42 / 50, 0.84, 0.001],
  ['rabatt 1-0.84', (1 - 0.84) * 100, 16, 0.05],
  ['belaning 7000/12000', 7000 / 12000 * 100, 58, 0.5],
  ['rantetackning 900/450', 900 / 450, 2.0, 0.001],
  ['vinstdel 800+400', 800 + 400, 1200, 0],
];
let aOK = 0;
for (const [namn, räknat, källa, tol] of A) {
  if (Math.abs(räknat - källa) <= tol) { aOK++; } else F(`aritmetik ${namn}: ${räknat} != ${källa}`);
}
OK(`aritmetik ${aOK}/${A.length} motorräknad`);

// -- 10. readingMinutes --
const rm = Math.round(ord / 600);
if (ar.readingMinutes !== rm) F(`readingMinutes ${ar.readingMinutes} != round(${ord}/600)=${rm}`); else OK(`readingMinutes ${rm} = round(${ord}/600)`);

// -- 11. disclaimer sista rad --
const rader = body.split('\n').map(s => s.trim()).filter(Boolean);
const sista = rader[rader.length - 1];
if (sista !== '_هذا تحليل مالي تعليمي، وليس نصيحة استثمارية._') F('disclaimer ej exakt sista rad: ' + JSON.stringify(sista)); else OK('disclaimer arabisk form, exakt sista rad');

// -- 12. källor URL-identiska --
const url = (t) => [...rensaUrlsOriginal(t).matchAll(/\((https?:\/\/[^)]+)\)/g)].map(m => m[1].replace(/\/$/, '')).sort();
function rensaUrlsOriginal(t) { return t; } // behåll markdown för URL-extraktion
const uA = url(body), uS = url(sv.body);
const uSamma = uA.length === uS.length && uA.every((x, i) => x === uS[i]);
if (!uSamma) F(`kall-URL:er skiljer: AR ${JSON.stringify(uA)} vs SV ${JSON.stringify(uS)}`); else OK(`kallor ${uA.length}/${uS.length} URL-identiska`);

// -- 13. H2-antal som originalet --
const svH2 = [...sv.body.matchAll(/^## (.+)$/gm)].length;
if (h2.length !== svH2) F(`H2 ${h2.length} != originalets ${svH2}`); else OK(`H2 ${h2.length} == originalets`);

// -- 14. svenska läckor 0 (URL:er + egennamn strippade) --
const vitlista = ['NP3 Fastigheter', 'OMX Stockholm Fastigheter', 'Investment Property', 'Best Practices Recommendations'];
let svText = rensaUrls(body);
for (const v of vitlista) svText = svText.split(v).join(' ');
const svLäcka = svText.match(/\b(och|att|med|för|som|till|eller|från|inte|bolag|aktier|hyres)\b/i);
if (svLäcka) F('svensk läcka i brödtext: "' + svLäcka[0] + '"'); else OK('svenska läckor 0 (URL-slugar + egennamn strippade)');

// -- dom --
console.log('\n=== KVD DOM: ' + (fel === 0 ? 'GRÖN' : 'RÖD') + ` (${fel} FEL / ${varn} VARN) ===`);
process.exit(fel === 0 ? 0 : 1);
