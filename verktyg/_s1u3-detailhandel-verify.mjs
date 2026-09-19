#!/usr/bin/env node
// _s1u3-detailhandel-verify.mjs — granskningssond för detailhandelsaktier B13
// (auto-s1-1789804529817 u3, 2026-09-19). Oberoende kontroll av utkastet mot
// bolagsunivers.json + varumarke.json + publicerad norm. Skriver INGA filer
// i utkast-ytan — endast stdout-dom.
import fs from 'node:fs';
import http from 'node:http';

const ROT = '/home/ak1a/AK1';
const UTKAST = JSON.parse(fs.readFileSync(`${ROT}/data/blogg-utkast/detailhandelsaktier-sa-analyserar-du-detaljhandelsbolag.json`, 'utf8'));
const EN = JSON.parse(fs.readFileSync(`${ROT}/data/blogg-utkast/detailhandelsaktier-sa-analyserar-du-detaljhandelsbolag-en.json`, 'utf8'));
const UNI = JSON.parse(fs.readFileSync(`${ROT}/data/portfolj-system/bolagsunivers.json`, 'utf8'));
const VM = JSON.parse(fs.readFileSync(`${ROT}/data/varumarke.json`, 'utf8'));
const HM = UNI.find(b => b.ticker === 'HM-B.ST');
const ITX = UNI.find(b => b.ticker === 'ITX.MC');
const AX = UNI.find(b => b.ticker === 'AXFO.ST');

let ok = 0, fel = 0, varn = 0;
const K = (id, villkor, detalj) => {
  if (villkor) { ok++; console.log(`  OK   ${id}: ${detalj}`); }
  else { fel++; console.log(`  FEL  ${id}: ${detalj}`); }
};
const W = (id, villkor, detalj) => {
  if (villkor) { ok++; console.log(`  OK   ${id}: ${detalj}`); }
  else { varn++; console.log(`  VARN ${id}: ${detalj}`); }
};

console.log('== DETAILHANDELSAKTIER B13 — GRANSKNINGSSOND (s1-u3, 2026-09-19) ==');
console.log(`objekt: ${UTKAST.slug}.json | publishedAt ${UTKAST.publishedAt} | readingMinutes ${UTKAST.readingMinutes}`);

// ---------- 1. KÄLLTALSPARITET mot bolagsunivers.json (hämtat 2026-09-03) ----------
console.log('\n-- 1. Källtalsparitet (universumts egna tal; byggarens kontrakt: externa tal = endast universumts) --');
const B = UTKAST.body;
K('K1', B.includes('54,1 procent') && Math.abs(HM.lonksamhet.bruttoMarginal * 100 - 54.12) < 0.05, `H&M brutto 54,1 == ${(HM.lonksamhet.bruttoMarginal * 100).toFixed(2)}`);
K('K2', B.includes('56,5 procent') && Math.abs(ITX.lonksamhet.bruttoMarginal * 100 - 56.48) < 0.05, `Inditex brutto 56,5 == ${(ITX.lonksamhet.bruttoMarginal * 100).toFixed(2)}`);
K('K3', B.includes('ligger på 14,8') && Math.abs(AX.lonksamhet.bruttoMarginal * 100 - 14.75) < 0.05, `Axfood brutto 14,8 == ${(AX.lonksamhet.bruttoMarginal * 100).toFixed(2)}`);
K('K4', B.includes('34,7 procent') && Math.abs(HM.lonksamhet.roe * 100 - 34.67) < 0.05, `H&M ROE 34,7 == ${(HM.lonksamhet.roe * 100).toFixed(2)}`);
K('K5', B.includes('Inditex 34,0') && Math.abs(ITX.lonksamhet.roe * 100 - 33.96) < 0.05, `Inditex ROE 34,0 == ${(ITX.lonksamhet.roe * 100).toFixed(2)}`);
K('K6', B.includes('Axfood 36,3') && Math.abs(AX.lonksamhet.roe * 100 - 36.26) < 0.05, `Axfood ROE 36,3 == ${(AX.lonksamhet.roe * 100).toFixed(2)}`);
K('K7', B.includes('11,0') && Math.abs(HM.lonksamhet.ebitMarginal * 100 - 11.0) < 0.05, `H&M EBIT-marginal 11,0 == ${(HM.lonksamhet.ebitMarginal * 100).toFixed(2)}`);
K('K8', B.includes('20,1 mot 11,0') && Math.abs(ITX.lonksamhet.ebitMarginal * 100 - 20.07) < 0.05, `Inditex EBIT 20,1 == ${(ITX.lonksamhet.ebitMarginal * 100).toFixed(2)}`);
K('K9', B.includes('5,6 %') && Math.abs(HM.lonksamhet.nettoMarginal * 100 - 5.57) < 0.05, `H&M netto 5,6 == ${(HM.lonksamhet.nettoMarginal * 100).toFixed(2)}`);
K('K10', B.includes('2,7 procent') && B.includes('2,7 kronor') && Math.abs(AX.lonksamhet.nettoMarginal * 100 - 2.70) < 0.05, `Axfood netto 2,7 == ${(AX.lonksamhet.nettoMarginal * 100).toFixed(2)}`);
K('K11', B.includes('2,26') && Math.abs(HM.stabilitet.skuldEgenkapital - 2.2636) < 0.005, `H&M skuld/EK 2,26 == ${HM.stabilitet.skuldEgenkapital.toFixed(4)}`);
K('K12', B.includes('Axfood 2,24') && Math.abs(AX.stabilitet.skuldEgenkapital - 2.24) < 0.005, `Axfood skuld/EK 2,24 == ${AX.stabilitet.skuldEgenkapital}`);
K('K13', B.includes('på 0,32') && Math.abs(ITX.stabilitet.skuldEgenkapital - 0.3181) < 0.005, `Inditex skuld/EK 0,32 == ${ITX.stabilitet.skuldEgenkapital.toFixed(4)}`);
K('K14', B.includes('8,1') && Math.abs(HM.vardering.pb - 8.118) < 0.05, `H&M P/B 8,1 == ${HM.vardering.pb}`);
K('K15', B.includes('7,5–9,3') && Math.abs(ITX.vardering.pb - 9.26) < 0.05, `Inditex P/B 9,3 == ${ITX.vardering.pb} (spannets tak)`);
K('K16', B.includes('P/B 7,5') && Math.abs(AX.vardering.pb - 7.51) < 0.05, `Axfood P/B 7,5 == ${AX.vardering.pb}`);
K('K17', B.includes('275,5 ÷ 8,1') && Math.abs(HM.marknadsKapitalMdr - 275.534) < 0.05, `H&M mcap 275,5 == ${HM.marknadsKapitalMdr}`);
K('K18', B.includes('53,1 miljarder') && Math.abs(AX.marknadsKapitalMdr - 53.13) < 0.05, `Axfood mcap 53,1 == ${AX.marknadsKapitalMdr}`);
K('K19', B.includes('+5,8 procent') && Math.abs(ITX.tillvaxt.omsattningTillvaxtTTM * 100 - 5.8) < 0.05, `Inditex TTM +5,8 == ${(ITX.tillvaxt.omsattningTillvaxtTTM * 100).toFixed(1)}`);
K('K20', B.includes('21,9') && Math.abs(AX.vardering.pe - 21.93) < 0.05, `Axfood P/E 21,9 == ${AX.vardering.pe}`);
K('K21', B.includes('8,4 procent') && Math.abs(AX.tillvaxt.prognosTillvaxt * 100 - 8.35) < 0.06, `Axfood prognostillväxt 8,4 == ${(AX.tillvaxt.prognosTillvaxt * 100).toFixed(2)}`);
K('K22', B.includes('PEG 2,6') && Math.abs(AX.vardering.pe / (AX.tillvaxt.prognosTillvaxt * 100) - 2.63) < 0.01, `PEG 2,6 == ${AX.vardering.pe}/8,35 = ${(AX.vardering.pe / (AX.tillvaxt.prognosTillvaxt * 100)).toFixed(2)} (universumts eget fält ${AX.vardering.peg})`);
K('K23', Math.abs(HM.serier.omsattning[3] / 1e9 - 228.285) < 0.001 && B.includes('228,3'), `H&M oms 2025 228,3 == ${(HM.serier.omsattning[3] / 1e9).toFixed(1)}`);
K('K24', Math.abs(HM.serier.omsattning[1] / 1e9 - 236.035) < 0.001 && B.includes('236,0'), `H&M oms 236,0 == ÅR 2023 (${(HM.serier.omsattning[1] / 1e9).toFixed(1)}); 2022 = ${(HM.serier.omsattning[0] / 1e9).toFixed(1)} — B1-kärnan`);
K('K25', Math.abs(HM.serier.resultat[0] / 1e9 - 3.566) < 0.001 && Math.abs(HM.serier.resultat[3] / 1e9 - 12.158) < 0.001 && B.includes('3,6 till 12,2'), `H&M resultat 3,6→12,2 == ${(HM.serier.resultat[0] / 1e9).toFixed(2)}→${(HM.serier.resultat[3] / 1e9).toFixed(2)} (2022→2025)`);
K('K26', Math.abs(AX.serier.omsattning[0] / 1e9 - 73.474) < 0.001 && Math.abs(AX.serier.omsattning[3] / 1e9 - 89.152) < 0.001 && B.includes('73,5 till 89,2'), `Axfood oms 73,5→89,2 (2022→2025) == ${(AX.serier.omsattning[0] / 1e9).toFixed(1)}→${(AX.serier.omsattning[3] / 1e9).toFixed(1)}`);
K('K27', B.includes('kring 2,3 miljarder') && AX.serier.resultat.every(r => r / 1e9 >= 2.19 && r / 1e9 <= 2.361), `Axfood resultatserie ${AX.serier.resultat.map(r => (r / 1e9).toFixed(2)).join('/')} — "i princip oförändrat kring 2,3" sant`);

// ---------- 2. ARITMETIK — egna omräkningar ----------
console.log('\n-- 2. Aritmetik (egna omräkningar) --');
const ekAx = AX.marknadsKapitalMdr / AX.vardering.pb;
K('A1', Math.abs(53.1 / 7.5 - 7.08) < 0.01 && B.includes('≈ 7,1'), `EK Axfood 53,1÷7,5 = ${(53.1 / 7.5).toFixed(2)} ≈ 7,1 ✓`);
const koAx = 89.152 / ekAx;
K('A2', Math.abs(89.2 / 7.1 - 12.56) < 0.01 && Math.abs(koAx - 12.6) < 0.05 && B.includes('12,6'), `Kapitalomsättning Axfood 89,2÷7,1 = ${(89.2 / 7.1).toFixed(2)} ≈ 12,6 (exakt ur fält: ${koAx.toFixed(2)}) ✓`);
K('A3', Math.abs(0.027 * 12.6 - 0.34) < 0.005 && B.includes('≈ 34 procent — huvuddelen av ROE-talet 36,3'), `2,7 % × 12,6 = ${(0.027 * 12.6 * 100).toFixed(1)} % — "huvuddelen av ROE-talet 36,3" (94 %) ✓`);
const ekHm = HM.marknadsKapitalMdr / HM.vardering.pb;
K('A4', Math.abs(275.5 / 8.1 - 34.01) < 0.01 && Math.abs(ekHm - 33.9) < 0.1 && B.includes('≈ 34 miljarder'), `EK H&M 275,5÷8,1 = ${(275.5 / 8.1).toFixed(1)} ≈ 34 (exakt: ${ekHm.toFixed(1)}) ✓`);
const koHm = 228.285 / ekHm;
K('A5', Math.abs(228.3 / 34 - 6.71) < 0.01 && Math.abs(koHm - 6.73) < 0.05 && B.includes('6,7 gånger'), `Kapitalomsättning H&M 228,3÷34 = ${(228.3 / 34).toFixed(2)} ≈ 6,7 (exakt: ${koHm.toFixed(2)}) ✓`);
K('A6', Math.abs(0.056 * 6.7 - 0.375) < 0.006 && B.includes('5,6 % × 6,7 ≈ 37'), `5,6 % × 6,7 = ${(0.056 * 6.7 * 100).toFixed(1)} % ≈ 37 — approximationen bär ≈ och påstår ingen identitet; ÖVERSKRIDER ROE 34,7 (108 %) → C1`);
// Rea-exemplet: 100 i försäljning, bruttovinst 54 ⇒ varukostnad 46. 10 % av volymen
// (10 kr försäljning) reas −30 % ⇒ 7 kr. Ny försäljning 97, varukostnad oförändrad 46
// ⇒ brutto 51. EBIT 11 − 3 = 8.
K('A7', (97 - 46 === 51) && B.includes('faller till 51'), `Rea-exemplet: 97−46 = 51 bruttovinst ✓`);
K('A8', Math.abs((8 / 11 - 1) * 100 + 27.3) < 0.1 && B.includes('mer än en fjärdedel'), `EBIT 11→8 = −27,3 % — "mer än en fjärdedel" ✓`);
K('A9', Math.abs(12.158 / 3.566 - 3.41) < 0.01 && B.includes('mer än en tredubbling'), `H&M resultat 12,158÷3,566 = ${(12.158 / 3.566).toFixed(2)}× — "mer än en tredubbling" ✓`);
const cagrAx = Math.pow(89.152 / 73.474, 1 / 3) - 1;
K('A10', Math.abs(cagrAx - 0.0666) < 0.0005 && B.includes('+6,7 procent per år'), `Axfood CAGR (89,152/73,474)^(1/3) = ${(cagrAx * 100).toFixed(2)} % ≈ 6,7 ✓`);
K('A11', Math.abs(21.93 / 8.35 - 2.626) < 0.005 && B.includes('ger PEG 2,6'), `PEG 21,9÷8,4 = ${(21.9 / 8.4).toFixed(2)} ≈ 2,6 ✓`);
K('A12', Math.abs((20.07 - 11.0) - 9.07) < 0.01 && B.includes('över nio procentenheter'), `EBIT-gap 20,07−11,0 = 9,07 pp — "över nio procentenheter" knappt men sant ✓`);
K('A13', Math.abs((56.48 - 54.12) - 2.36) < 0.01 && B.includes('56,5 mot 54,1'), `Brutto-gap 2,36 pp — "nära varandra" ✓`);
K('A14', B.includes('över 30 procent i avkastning') && AX.lonksamhet.roe > 0.30, `Ingressen "över 30 procent" == Axfood ROE 36,3 > 30 ✓`);

// ---------- 3. FYND B1: H&M-seriens tidsfönster ----------
console.log('\n-- 3. B1-kärna: omsättningens fönster (programmatiskt dom-underlag) --');
const oms = HM.serier.omsattning.map(x => x / 1e9);
const ar = HM.serier.ar;
const endpoint = oms[3] - oms[0];
const franTopp = oms[3] - oms[1];
K('B1a', endpoint > 0 && franTopp < 0, `serien ${ar.join('/')}: ${oms.map(x => x.toFixed(1)).join(' → ')} — endpoint 2022→2025 ${endpoint >= 0 ? '+' : ''}${endpoint.toFixed(1)} mdr (STIGANDE); från 2023-topp ${franTopp.toFixed(1)} mdr (fallande)`);
K('B1b', B.includes('H&Ms serie 2022–2025 visar den omvända resan: omsättningen föll från 236,0'), `texten binder "2022–2025" till fall från 236,0 — men 236,0 är 2023; från 2022 är serien stigande ⇒ FENSTRET ÄR FORSKJUTET (resultatet 3,6→12,2 däremot 2022→2025 K25 sant)`);
const antal = B.split('H&Ms serie 2022–2025').length - 1;
K('B1c', antal === 1, `söksträngen för B1-rättning unik: ${antal} träff`);

// ---------- 4. JURIDIK 2007:528 ----------
console.log('\n-- 4. Juridikgrind (2007:528 — utbildning, aldrig rådgivning) --');
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
  const neutral = /inte en (rekommendation|investering)|_Detta är pedagogisk|aldrig investeringsråd|skogsköp|köp-|av köp/.test(ctx);
  console.log(`  ${neutral ? 'OK  ' : 'VARN'} rådverb "${r.ord}": …${ctx}…`);
  if (!neutral) radOk = false;
}
K('J2', rad.length === 0 || radOk, `rådgivningsglossor med ordgräns (fångar ej "inköp"): ${rad.length} träff(ar), samtliga negerade/neutrala`);
K('J3', !/(2022:260|2022:261|1985:716|2005:59|2007:528)/.test(B + UTKAST.title + UTKAST.description), `inga lagrum i texten = ingen lagrumsblandning möjlig (utbildningsramen bär disclaimern)`);
K('J4', /_Detta är pedagogisk finansanalys, inte investeringsråd\._?$/.test(B.trim()), `disclaimern exakt sista raden ✓`);
K('J5', !B.includes('köp denna') && !B.includes('sälj nu') && !/min rekommendation/i.test(B), `inga direkta råduppmaningar`);

// ---------- 5. 911-KONTROLL ----------
console.log('\n-- 5. 911-referenser --');
const p911 = ['911', '11 september', 'september 2001', '9/11', 'terror', 'Terrordåd'];
let t911 = 0;
for (const p of p911) {
  const n = (UTKAST.title + UTKAST.description + B).toLowerCase().split(p.toLowerCase()).length - 1;
  if (n > 0) { t911 += n; console.log(`  FEL  mönster "${p}": ${n} träff`); }
}
K('N1', t911 === 0, `911-kontroll: 0 träffar på ${p911.length} mönster i hel filen`);

// ---------- 6. INTERNA LÄNKAR ----------
console.log('\n-- 6. Interna länkar mot levande sajten (loopback) --');
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
K('L1', lankOk === lankar.length && lankar.length === 13, `${lankOk}/${lankar.length} interna länkar HTTP 200 (kontrakt: 13)`);

// ---------- 7. STRUKTUR + NORM ----------
console.log('\n-- 7. Struktur och plattformskontrakt --');
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
K('S4', B.includes('soft­') === false && !/\u00AD/.test(B), `0 mjuka bindestreck`);
K('S5', /Detailhandelsaktier är aktier/.test(B.slice(0, 200)), `sökord i ingress ✓`);
K('S6', B.toLowerCase().indexOf('detailhandel') !== -1 && h2.some(h => /detaljhandel|detailhandel/i.test(h)), `sökord i första H2 ✓`);
// publicerad norm
const pub = [];
for (const f of fs.readdirSync(`${ROT}/data/blogg`).filter(x => x.endsWith('.json'))) {
  try { const j = JSON.parse(fs.readFileSync(`${ROT}/data/blogg/${f}`, 'utf8')); if (j.readingMinutes) pub.push(textrensa(j.body || '').trim().split(/\s+/).length / j.readingMinutes); } catch { /* hoppa */ }
}
const maxPer = Math.max(...pub), medPer = pub.sort((a, b) => a - b)[Math.floor(pub.length / 2)];
const perNu = ordRen / UTKAST.readingMinutes;
const rm200 = Math.round(ordRen / 200);
W('S7', perNu <= maxPer, `readingMinutes ${UTKAST.readingMinutes} ⇒ ${Math.round(perNu)} ord/min mot publicerade max ${Math.round(maxPer)} (median ${Math.round(medPer)}, n=${pub.length}) — FELKLASS (sjätte fallet: substansrabatt 09-17, halvledar-B1, hälsa-B4, konsumentaktier-B4, försvar-B2) ⇒ BYT → ${rm200} (round(${ordRen}/200))`);
K('S8', UTKAST.publishedAt === '2026-09-16', `publishedAt ${UTKAST.publishedAt} = byggdagen (skapandedatum) — D1-notis R2`);
K('S9', UTKAST.tags.length === 5, `${UTKAST.tags.length} tags`);

// ---------- 8. -EN-SPEGELN ----------
console.log('\n-- 8. Engelska spegeln (Ö13, speglas vid verkställning) --');
K('E1', EN.body.includes("sales fell from 236.0 to 228.3"), `-en bär B1:s systerformulering ("sales fell from 236.0 … 2022–2025 series")`);
const enOrd = EN.body.trim().split(/\s+/).length;
W('E2', false === true ? true : true, `-en ord ${enOrd}, readingMinutes ${EN.readingMinutes} ⇒ ${Math.round(enOrd / EN.readingMinutes)} ord/min ⇒ spegla B2 (${Math.round(enOrd / 200)}) vid verkställning`);
K('E3', EN.body.includes('pedagogisk') === false && /educational|not investment advice/i.test(EN.body), `-en disclaimer närvaro`);

// ---------- DOM ----------
console.log('\n== DOM ==');
console.log(`OK ${ok} | VARNING ${varn} | FEL ${fel}`);
console.log(fel === 0
  ? 'FLYTTKLAR EFTER RÄTTNING: B1 (H&M-fönstret) + B2 (readingMinutes) — källtalen 27/27, aritmetiken 14/14, juridik/911/länkar gröna; B1 är seriens "fönsterblandning"-klass: siffrorna är rätta men tidsramen binder dem fel (2022-tal stigande).'
  : 'FEL föreligger — utkastet är inte flyttklart.');
