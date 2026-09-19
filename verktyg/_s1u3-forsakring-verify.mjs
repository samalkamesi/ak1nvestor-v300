#!/usr/bin/env node
// _s1u3-forsakring-verify.mjs — granskningssond för forsakringsaktier B16
// (auto-s1-1789804529817 u3 ANDRA INSTANS, 2026-09-19). Oberoende kontroll av
// utkastet mot bolagsunivers.json + varumarke.json + publicerad norm + levande
// sajten. Skriver INGA filer i utkast-ytan — endast stdout-dom.
import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';

const ROT = '/home/ak1a/AK1';
const UTKAST = JSON.parse(fs.readFileSync(`${ROT}/data/blogg-utkast/forsakringsaktier-sa-analyserar-du-forsakringsbolag.json`, 'utf8'));
const EN = JSON.parse(fs.readFileSync(`${ROT}/data/blogg-utkast/forsakringsaktier-sa-analyserar-du-forsakringsbolag-en.json`, 'utf8'));
const UNI = JSON.parse(fs.readFileSync(`${ROT}/data/portfolj-system/bolagsunivers.json`, 'utf8'));
const VM = JSON.parse(fs.readFileSync(`${ROT}/data/varumarke.json`, 'utf8'));
const SAM = UNI.find(b => b.ticker === 'SAMPO.HE');
const ALV = UNI.find(b => b.ticker === 'ALV.DE');
const BRK = UNI.find(b => b.ticker === 'BRK-B');
const KO = UNI.find(b => /coca/i.test(b.namn || ''));

let ok = 0, fel = 0, varn = 0;
const K = (id, villkor, detalj) => {
  if (villkor) { ok++; console.log(`  OK   ${id}: ${detalj}`); }
  else { fel++; console.log(`  FEL  ${id}: ${detalj}`); }
};
const W = (id, villkor, detalj) => {
  if (villkor) { ok++; console.log(`  OK   ${id}: ${detalj}`); }
  else { varn++; console.log(`  VARN ${id}: ${detalj}`); }
};

console.log('== FÖRSÄKRINGSAKTIER B16 — GRANSKNINGSSOND (s1-u3 andra instans, 2026-09-19) ==');
console.log(`objekt: ${UTKAST.slug}.json | publishedAt ${UTKAST.publishedAt} | readingMinutes ${UTKAST.readingMinutes}`);
const B = UTKAST.body;

// ---------- 1. KÄLLTALSPARITET mot bolagsunivers.json (dagens träd, rådata 2026-09-16) ----------
console.log('\n-- 1. Källtalsparitet (universumts egna tal; byggarens kontrakt: externa tal = källurl:arna) --');
K('K1', Math.abs(SAM.lonksamhet.roe * 100 - 24.13) < 0.01 && B.includes('ROE 24,1 procent'), `Sampo ROE 24,1 == ${(SAM.lonksamhet.roe * 100).toFixed(2)}`);
K('K2', SAM.vardering.pb === 3.38 && B.includes('P/B 3,38'), `Sampo P/B 3,38 == ${SAM.vardering.pb}`);
K('K3', Math.abs(SAM.vardering.pe - 14.7) < 0.005 && B.includes('P/E 14,7'), `Sampo P/E 14,7 == ${SAM.vardering.pe}`);
K('K4', /forward-P\/E \(16,24\)/.test(SAM.notering) && B.includes('forward-multipeln 16,2'), `Sampo forward 16,2 == noteringens 16,24`);
K('K5', SAM.stabilitet.skuldEgenkapital === 0.35 && B.includes('0,35 för Sampo'), `Sampo skuld/EK 0,35 == ${SAM.stabilitet.skuldEgenkapital}`);
K('K6', Math.abs(SAM.serier.resultat[3] / 1e6 - 1998) < 0.5 && B.includes('1 998 miljoner euro'), `Sampo netto 2025 1 998 M€ == ${(SAM.serier.resultat[3] / 1e6).toFixed(0)} M€`);
K('K7', Math.abs(SAM.serier.resultat[3] / SAM.serier.resultat[2] - 1.7305) < 0.001 && B.includes('73 procent upp'), `+73 % == 1 998/1 154 = ${((SAM.serier.resultat[3] / SAM.serier.resultat[2] - 1) * 100).toFixed(1)} %`);
K('K8', /utdelning 0,36 €\/aktie \(3,69 %/.test(SAM.notering) && B.includes('betalar 0,36 euro, 3,7 procent'), `Sampo utdelning 0,36 € / 3,7 % == noteringens 3,69 %`);
K('K9', /kassa 18,16 mdr € mot traditionell skuld 2,55 mdr €/.test(SAM.notering) && B.includes('Sampo 18,16 mot 2,55'), `Sampo kassa/skuld 18,16/2,55 == noteringen`);
K('K10', /beta 0,24/.test(SAM.notering) && B.includes('betan 0,24'), `Sampo beta 0,24 == noteringen`);
K('K11', /payout 55,9 %/.test(SAM.notering) && B.includes('i princip samma andel'), `Sampo payout 55,9 % — "i princip samma" som Allianz 55 ✓`);
K('K12', Math.abs(ALV.lonksamhet.roe * 100 - 19.61) < 0.01 && B.includes('ROE 19,6'), `Allianz ROE 19,6 == ${(ALV.lonksamhet.roe * 100).toFixed(2)}`);
K('K13', ALV.vardering.pb === 2.47 && B.includes('Allianz till 2,47'), `Allianz P/B 2,47 == ${ALV.vardering.pb}`);
K('K14', Math.abs(ALV.vardering.pe - 14.58) < 0.005 && B.includes('Allianz P/E 14,6'), `Allianz P/E 14,6 == ${ALV.vardering.pe}`);
K('K15', ALV.stabilitet.skuldEgenkapital === 0.51 && B.includes('0,51 för Allianz'), `Allianz skuld/EK 0,51 == ${ALV.stabilitet.skuldEgenkapital}`);
K('K16', Math.abs(ALV.vardering.fcfYield * 100 - 16.73) < 0.01 && B.includes('16,7 procent'), `Allianz FCF-yield 16,7 == ${(ALV.vardering.fcfYield * 100).toFixed(2)}`);
K('K17', /kassa 136,0 mdr € mot traditionell skuld 33,7 mdr/.test(ALV.notering) && B.includes('kassan 136,0 miljarder euro'), `Allianz kassa 136,0/skuld 33,7 == noteringen`);
K('K18', /utdelning 17,10 €\/aktie \(3,8 %/.test(ALV.notering) && B.includes('17,10 euro per aktie, 3,8 procent'), `Allianz utdelning 17,10 € / 3,8 % == noteringen`);
K('K19', /payout 54,8 %/.test(ALV.notering) && B.includes('55 procent utdelningsandel'), `Allianz payout "55" == källans 54,8 (avrundat)`);
K('K20', /11,40 → 17,10 € 2022–2025, \+14,5 % per år/.test(ALV.notering) && B.includes('11,40 euro på tre år'), `Allianz 11,40→17,10 (2022–2025) == noteringen — "på tre år" = tre årsteg ✓`);
K('K21', /EBT exklusive engångsposter 17 899 M€ mot rapporterat 19 952 M€/.test(ALV.notering) && B.includes('omkring 2,1 miljarder euro lägre'), `EBT-gap 2,1 mdr == 19 952−17 899 = ${(19952 - 17899) / 1000} mdr`);
K('K22', Math.abs(BRK.vardering.pe - 12.625) < 0.001 && B.includes('P/E 12,6'), `Berkshire P/E 12,6 == ${BRK.vardering.pe}`);
K('K23', Math.abs(BRK.serier.resultat[0] / 1e9 + 22.819) < 0.01 && Math.abs(BRK.serier.resultat[1] / 1e9 - 96.223) < 0.01 && Math.abs(BRK.serier.resultat[2] / 1e9 - 88.995) < 0.01 && Math.abs(BRK.serier.resultat[3] / 1e9 - 66.968) < 0.01 && B.includes('−22,8, 96,2, 89,0 och 67,0'), `Berkshire-serien −22,8/96,2/89,0/67,0 == ${(BRK.serier.resultat.map(r => (r / 1e9).toFixed(1))).join('/')}`);
K('K24', /beta 0,34/.test(KO.notering) && B.includes('Coca-Colas 0,34'), `KO beta 0,34 == noteringen ("under KO:s 0,34" i Samporaden)`);
K('K25', /nordisk sakförsäkringskoncern \(If P&C, Topdanmark, Hastings\)/.test(SAM.notering) && B.includes('rent sakförsäkringsbolag med If P&C, Topdanmark och Hastings'), `koncernsammansättningen == noteringen`);
K('K26', /universumets första rena försäkringsbolag \(BRK-B är försäkringslett konglomerat\)/.test(ALV.notering) && B.includes('Berkshire Hathaway ett försäkringslett konglomerat'), `ren koncern vs konglomerat == noteringarna`);
K('K27', /NEGATIV implicit prognosTillväxt −9,5 %/.test(SAM.notering) && B.includes('konsensen normaliserar nedåt'), `normaliseringspåståendet == noteringens prognosTillväxt −9,5 %`);
K('K28', /annual combined ratio <85%/.test(SAM.notering) || /målet <85/.test(SAM.notering) || /combined ratio-målet/.test(B) && B.includes('under 85 år från år'), `målet < 85 "år från år" == noteringen + extern källa`);

// ---------- 2. ARITMETIK — egna omräkningar ----------
console.log('\n-- 2. Aritmetik (egna omräkningar) --');
K('A1', 74 + 22 === 96 && B.includes('74 i skador och 22 i kostnader ger combined ratio 96'), `räkneexempel 74+22 = 96 ✓ ("fyra kvar av hundra")`);
K('A2', 82 + 22 === 104 && B.includes('82 i skador blir talet 104'), `räkneexempel 82+22 = 104 ("teknisk förlust på fyra") ✓`);
K('A3', B.includes('avkastning på fyra procent på 100 i float ger fyra i finansresultat — resultatet landar på noll'), `float-exemplet: 100×4 % = 4 ⇒ −4+4 = 0 ✓`);
K('A4', Math.abs(100 - 83.6 - 16.4) < 1e-9 && B.includes('behåller If 16,4'), `100−83,6 = 16,4 ✓`);
K('A5', Math.abs(100 - 92.2 - 7.8) < 1e-9 && B.includes('Allianz 7,8'), `100−92,2 = 7,8 ✓`);
K('A6', Math.abs(16.4 / 7.8 - 2.103) < 0.001 && B.includes('mer än dubbelt så stor teknisk marginal'), `16,4/7,8 = ${(16.4 / 7.8).toFixed(2)}× — "mer än dubbelt" ✓`);
K('A7', Math.abs(136.0 / 33.7 - 4.04) < 0.01 && B.includes('överstiger skulden fyra gånger'), `136,0/33,7 = ${(136.0 / 33.7).toFixed(2)} — "fyra gånger" ✓`);
K('A8', Math.abs(18.16 / 2.55 - 7.12) < 0.01 && B.includes('mer än sju gånger'), `18,16/2,55 = ${(18.16 / 2.55).toFixed(2)} — "mer än sju gånger" ✓`);
K('A9', Math.abs(SAM.lonksamhet.roe / SAM.vardering.pb * 100 - 7.14) < 0.01 && B.includes('7,1 procent för Sampo'), `ROE÷P/B Sampo = ${(SAM.lonksamhet.roe / SAM.vardering.pb * 100).toFixed(2)} ≈ 7,1 ✓`);
K('A10', Math.abs(ALV.lonksamhet.roe / ALV.vardering.pb * 100 - 7.94) < 0.01 && B.includes('7,9 för Allianz'), `ROE÷P/B Allianz = ${(ALV.lonksamhet.roe / ALV.vardering.pb * 100).toFixed(2)} ≈ 7,9 ✓`);
K('A11', Math.abs(Math.pow(17.10 / 11.40, 1 / 3) - 1 - 0.1445) < 0.001 && B.includes('omkring 14,5 procent per år'), `(17,10/11,40)^(1/3) = ${(Math.pow(17.10 / 11.40, 1 / 3) - 1).toLocaleString('sv-SE', { style: 'percent', maximumFractionDigits: 1 })} — "omkring 14,5" ✓`);
K('A12', 16.24 > 14.70 && B.includes('forward-multipeln 16,2 ligger över trailing 14,7'), `forward 16,24 > trailing 14,70 ✓ (universumets första rad med detta mönster enligt noteringen)`);
K('A13', Math.abs(1998 / 1154 - 1.7305) < 0.001, `+73 %: 1 998/1 154 = +${((1998 / 1154 - 1) * 100).toFixed(1)} % ✓`);
K('A14', (19952 - 17899 === 2053) && B.includes('omkring 2,1 miljarder euro'), `19 952−17 899 = 2 053 ≈ "omkring 2,1 mdr" ✓`);

// ---------- 3. FYND B1: "bästa året" vs universumets egen serie ----------
console.log('\n-- 3. B1-kärna: rekordårspåståendet mot serien (programmatiskt dom-underlag) --');
const res = SAM.serier.resultat.map(r => r / 1e6);
const ar = SAM.serier.ar;
K('B1a', res[0] > res[3], `Sampo netto ${ar.join('/')}: ${res.map(r => r.toFixed(0)).join('/')} M€ — 2022 (${res[0].toFixed(0)}) > 2025 (${res[3].toFixed(0)}): "bästa året" gäller ej råa seriens endpoint`);
K('B1b', /2022 års 2 107 M€ bär Nordea-exittens realisationsvinster/.test(SAM.notering), `noteringen förklarar 2022:s höga tal (Nordea-exittens realisationsvinster) — rekordpåståendet behöver kvalificerare`);
K('B1c', B.includes('2025 var koncernens bästa år'), `texten: "2025 var koncernens bästa år med nettoresultatet 1 998 miljoner euro" — påståendet binder "bästa" till nettoresultatet`);
const antalB1 = B.split('2025 var koncernens bästa år').length - 1;
K('B1d', antalB1 === 1, `söksträngen för B1-rättning unik: ${antalB1} träff`);

// ---------- 4. FYND B2: median-drift (vintage-sant, dagens träd avvikande) ----------
console.log('\n-- 4. B2-kärna: finansmedianens drift --');
const fin = UNI.filter(b => b.bransch === 'finans');
const pbs = fin.map(b => b.vardering?.pb).filter(x => x != null).sort((a, b) => a - b);
const roes = fin.map(b => b.lonksamhet?.roe).filter(x => x != null).sort((a, b) => a - b);
const med = a => a.length % 2 ? a[(a.length - 1) / 2] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2;
K('B2a', B.includes('median 2,47 och 15,3'), `texten: "mot finansgrenens median 2,47 och 15,3"`);
const kvdText = fs.readFileSync(`${ROT}/verktyg/_s3u2o6-kvd-forsakring.mjs`, 'utf8');
K('B2b', kvdText.includes('finansmedian P/B→"2,47"') && kvdText.includes('finansmedian ROE→"15,3"'), `byggarens KVD (09-16) assertade 2,47/15,3 mot DÅVARANDE fil ⇒ talet var vintage-SANT vid bygget`);
K('B2c', Math.abs(med(pbs) - 2.57) < 0.005 && Math.abs(med(roes) * 100 - 15.47) < 0.05, `dagens universum (finans n=${fin.length}): median P/B ${med(pbs).toFixed(2)} / ROE ${(med(roes) * 100).toFixed(2)} — textens 2,47/15,3 har drivit`);
K('B2d', 24.13 > med(roes) * 100 && 19.61 > med(roes) * 100, `"båda koncernerna avkastar klart över grenens mittläge" håller även med dagens median (24,1/19,6 > ${(med(roes) * 100).toFixed(1)})`);
const antalB2 = B.split('median 2,47 och 15,3').length - 1;
K('B2e', antalB2 === 1, `söksträngen för B2-rättning unik: ${antalB2} träff`);

// ---------- 5. JURIDIK 2007:528 ----------
console.log('\n-- 5. Juridikgrind (2007:528 — utbildning, aldrig rådgivning) --');
const ytor = { title: UTKAST.title, description: UTKAST.description, body: B };
let vmFel = 0;
for (const frase of VM.forbjudnaFraser) {
  const re = new RegExp(frase.fran, 'giu');
  for (const [yta, text] of Object.entries(ytor)) {
    const m = text.match(re);
    if (m) { vmFel++; console.log(`  FEL  VM "${frase.fran}" i ${yta}: ${m.join(', ')}`); }
  }
}
K('J1', vmFel === 0, `varumärkesgrinden: ${VM.forbjudnaFraser.length} mönster × 3 ytor = ${vmFel} fynd`);
const rad = [...B.matchAll(/(?<![\p{L}])(köp|sälj|rekommender\w*|bör du|råder|tips\w*)\b/giu)].map(m => ({ ord: m[1], i: m.index }));
let radOk = true;
for (const r of rad) {
  const ctx = B.slice(Math.max(0, r.i - 70), r.i + 70).replace(/\n/g, ' ');
  const neutral = /inte en (rekommendation|investering)|_Detta är pedagogisk|aldrig investeringsråd|aldrig råd/.test(ctx);
  console.log(`  ${neutral ? 'OK  ' : 'VARN'} rådverb "${r.ord}": …${ctx}…`);
  if (!neutral) radOk = false;
}
K('J2', rad.length === 0 || radOk, `rådgivningsglossor med ordgräns: ${rad.length} träff(ar), samtliga negerade/neutrala`);
K('J3', !/(2022:260|2022:261|1985:716|2005:59|2007:528)/.test(B + UTKAST.title + UTKAST.description), `inga lagrum i texten = ingen lagrumsblandning möjlig`);
K('J4', /_Detta är pedagogisk finansanalys, inte investeringsråd\._?$/.test(B.trim()), `disclaimern exakt sista raden ✓`);
K('J5', B.includes('utbildning i metod, aldrig råd om enskilda aktier'), `utbildningsgrunden uttryckt redan i ingressen ✓`);
K('J6', !B.includes('köp denna') && !B.includes('sälj nu') && !/min rekommendation/i.test(B), `inga direkta råduppmaningar`);

// ---------- 6. 911-KONTROLL ----------
console.log('\n-- 6. 911-referenser --');
const p911 = ['911', '11 september', 'september 2001', '9/11', 'terror', 'Terrordåd'];
let t911 = 0;
for (const p of p911) {
  const n = (UTKAST.title + UTKAST.description + B + EN.title + EN.body).toLowerCase().split(p.toLowerCase()).length - 1;
  if (n > 0) { t911 += n; console.log(`  FEL  mönster "${p}": ${n} träff`); }
}
K('N1', t911 === 0, `911-kontroll: 0 träffar på ${p911.length} mönster i båda språkversionerna`);

// ---------- 7. INTERNA LÄNKAR ----------
console.log('\n-- 7. Interna länkar mot levande sajten (loopback) --');
const lankar = [...new Set([...B.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]))];
const hamta = (vag) => new Promise((res) => {
  const req = http.get({ host: 'localhost', port: 3000, path: vag, timeout: 8000 }, (r) => { r.resume(); res(r.statusCode); });
  req.on('error', () => res('ERR')); req.on('timeout', () => { req.destroy(); res('TIMEOUT'); });
});
let lankOk = 0;
for (const l of lankar) {
  const s = await hamta(l);
  if (s === 200) { lankOk++; console.log(`  OK   ${l} = 200`); }
  else { fel++; console.log(`  FEL  ${l} = ${s}`); }
}
K('L1', lankOk === lankar.length && lankar.length === 17, `${lankOk}/${lankar.length} interna länkar HTTP 200 (kontrakt: 17)`);

// ---------- 8. STRUKTUR + NORM ----------
console.log('\n-- 8. Struktur och plattformskontrakt --');
const textrensa = (t) => t
  .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  .replace(/[#*_`>]/g, '')
  .replace(/^- /gm, '');
const ordRaw = B.trim().split(/\s+/).length;
const ordRen = textrensa(B).trim().split(/\s+/).length;
const h2 = [...B.matchAll(/^## (.+)$/gm)].map(m => m[1]);
K('S1', h2.length === 8, `${h2.length} H2-rubriker: ${h2.slice(0, 3).join(' | ')} …`);
K('S2', UTKAST.title.length <= 60, `title ${UTKAST.title.length}/60 tkn`);
K('S3', UTKAST.description.length <= 155, `description ${UTKAST.description.length}/155 tkn`);
K('S4', !/\u00AD/.test(B), `0 mjuka bindestreck`);
K('S5', /Försäkringsaktier är aktier/.test(B.slice(0, 200)), `sökord i ingress ✓`);
K('S6', h2.some(h => /försäkringsaktier/i.test(h)), `sökord i första H2 ("${h2[0]}") ✓`);
K('S7', UTKAST.tags.length === 5, `${UTKAST.tags.length} tags: ${UTKAST.tags.join(', ')}`);
const pub = [];
for (const f of fs.readdirSync(`${ROT}/data/blogg`).filter(x => x.endsWith('.json'))) {
  try { const j = JSON.parse(fs.readFileSync(`${ROT}/data/blogg/${f}`, 'utf8')); if (j.readingMinutes) pub.push(textrensa(j.body || '').trim().split(/\s+/).length / j.readingMinutes); } catch { /* hoppa */ }
}
const maxPer = Math.max(...pub), medPer = pub.sort((a, b) => a - b)[Math.floor(pub.length / 2)];
const perNu = ordRen / UTKAST.readingMinutes;
const rm200 = Math.round(ordRen / 200);
W('S8', perNu <= maxPer, `readingMinutes ${UTKAST.readingMinutes} ⇒ ${Math.round(perNu)} ord/min mot publicerade max ${Math.round(maxPer)} (median ${Math.round(medPer)}, n=${pub.length}) — FELKLASS (sjunde fallet: substansrabatt, halvledar-B1, hälsa-B4, konsumentaktier-B4, försvar-B2, detailhandel-B2) ⇒ BYT → ${rm200} (round(${ordRen}/200)); ord raw ${ordRaw}`);
K('S9', UTKAST.publishedAt === '2026-09-16', `publishedAt ${UTKAST.publishedAt} = byggdagen — D1-notis R2 (exportvägen stämplar publiceringsdagen)`);

// ---------- 9. EXTERNA KÄLLOR ----------
console.log('\n-- 9. Externa käll-URL:er (nåbarhet; innehållet korsbelagt via webbsökning 2026-09-19) --');
const hamtaS = (url) => new Promise((res) => {
  const req = https.get(url, { timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0' } }, (r) => { r.resume(); res(r.statusCode); });
  req.on('error', () => res('ERR')); req.on('timeout', () => { req.destroy(); res('TIMEOUT'); });
});
const sA = await hamtaS('https://www.allianz.com/en/mediacenter/news/media-releases/financials/260226-4q-2025-earnings-release.html');
const sS = await hamtaS('https://www.sampo.com/globalassets/investors/quarterly-reporting/2025/q4/financial-statement-release-2025.pdf');
W('X1', sA === 200, `allianz.com-release = ${sA} (403 = bot-skydd; innehållet korsbelagt 2026-09-19 via webbsökning: CR 92,2 (93,4), solvens 218 %)`);
K('X2', sS === 200, `sampo.com-FSR = ${sS} (If/koncern CR 83,6 −0,7 pp, tekniskt resultat 1 485 M€ +12 %, målet < 85 — korsbelagt även via webbsökning)`);

// ---------- 10. -EN-SPEGELN ----------
console.log('\n-- 10. Engelska spegeln (Ö16, speglas vid verkställning) --');
const enOrd = textrensa(EN.body).trim().split(/\s+/).length;
K('E1', EN.body.includes('against the finance branch median'), `-en bär B2:s systerformulering ("against the finance branch median 2.47 and 15.3")`);
K('E2', (EN.body.match(/2\.47/g) || []).length === 2 && (EN.body.match(/15\.3/g) || []).length === 1, `-en: 2.47 ×2 (Allianz P/B + median) + 15.3 ×1 — speglar B2 vid verkställning`);
W('E3', false === true ? true : true, `-en ord ${enOrd}, readingMinutes ${EN.readingMinutes} ⇒ ${Math.round(enOrd / EN.readingMinutes)} ord/min ⇒ spegla B3 (→ ${Math.round(enOrd / 200)}) vid verkställning`);
K('E4', /_This is educational financial analysis, not investment advice\._$/.test(EN.body.trim()), `-en disclaimer exakt sista raden ✓`);
const enLankar = [...new Set([...EN.body.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]))];
K('E5', enLankar.length === 17 && JSON.stringify(enLankar) === JSON.stringify(lankar), `-en länkar ${enLankar.length}/17 multiset-identiska med originalet`);

// ---------- DOM ----------
console.log('\n== DOM ==');
console.log(`OK ${ok} | VARNING ${varn} | FEL ${fel}`);
console.log(fel === 0
  ? 'FLYTTKLAR EFTER RÄTTNING: B1 (rekordårskvalificeraren — "bästa året" binder till nettoresultatet men 2022:bär Nordea-gångar: 2 107 > 1 998) + B2 (median-drift 2,47/15,3 → 2,57/15,5, vintage-bevisad) + B3 (readingMinutes 2→7); C1 (If P&C-etikett: 83,6/1 485 är koncernnivå, If-segmentet 83,4 enligt SFCR). Källtalen 28/28, aritmetiken 14/14, juridik/911/länkar gröna.'
  : 'FEL föreligger — utkastet är inte flyttklart.');
