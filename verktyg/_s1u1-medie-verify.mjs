#!/usr/bin/env node
// s1-u1 sond — oberoende omgranskning av medieaktier-sa-analyserar-du-medie-och-streamingbolag.json
// Låst källa: bolagsunivers.json @ vintage c256c659 (138 poster, 2026-09-16 21:51 — utkastet byggt 22:16, commit 3b355abd)
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const UTKAST = 'data/blogg-utkast/medieaktier-sa-analyserar-du-medie-och-streamingbolag.json';
const VINTAGE_CMD = 'git show c256c659:data/portfolj-system/bolagsunivers.json';

const uni = JSON.parse(execSync(VINTAGE_CMD, { cwd: '/home/ak1a/AK1', encoding: 'utf8', maxBuffer: 64 << 20 }));
const ut = JSON.parse(readFileSync('/home/ak1a/AK1/' + UTKAST, 'utf8'));
const body = ut.body;

let ok = 0, fel = 0, notiser = [];
function chk(id, kond, detalj) {
  if (kond) { ok++; console.log(`OK   ${id} :: ${detalj}`); }
  else { fel++; console.log(`FEL  ${id} :: ${detalj}`); }
}
function not(id, text) { notiser.push(id + ': ' + text); console.log(`NOT  ${id} :: ${text}`); }

const byTicker = Object.fromEntries(uni.map(r => [r.ticker, r]));
const NFLX = byTicker['NFLX'], SPOT = byTicker['SPOT'], DIS = byTicker['DIS'],
      VPLAY = byTicker['VPLAY-B.ST'], WBD = byTicker['WBD'], MTG = byTicker['MTG-B.ST'];

console.log(`== universum vintage: ${uni.length} poster; kommunikation: ${uni.filter(r => r.bransch === 'kommunikation').length} ==\n`);

// ---- A. sektorns sex bolag existerar i vintagen ----
for (const [t, n] of [['NFLX','Netflix'],['SPOT','Spotify'],['DIS','Disney'],['VPLAY-B.ST','Viaplay'],['WBD','Warner Bros. Discovery'],['MTG-B.ST','Modern Times Group']])
  chk(`A-${n}`, !!byTicker[t] && byTicker[t].bransch === 'kommunikation', `finns, bransch=${byTicker[t]?.bransch}, land=${byTicker[t]?.land}`);

// medie-delmängden av kommunikation-grenen (ej telekom: T, TEL2, TELIA, VZ, TEL.OL, DTE.DE; ej META)
const mediaTickers = ['DIS','NFLX','SPOT','VPLAY-B.ST','WBD','MTG-B.ST'];
const kom = uni.filter(r => r.bransch === 'kommunikation').map(r => r.ticker);
const telekom = ['T','TEL2-A.ST','TELIA.ST','VZ','TEL.OL','DTE.DE'];
const ovriga = kom.filter(t => !mediaTickers.includes(t) && !telekom.includes(t));
console.log(`INFO kommunikation-grenen ${kom.length} poster = ${mediaTickers.length} medie + ${telekom.length} telekom + övriga: ${ovriga.join(',')}`);
not('N1', `kommunikation-grenen har ${kom.length} poster; utkastets "sektorn sex bolag" gäller medie-delmängden efter guidens EGEN telekom-avgränsning (ingressen) — övriga i grenen: ${ovriga.join(', ')} (Meta: annonsplattform, nämns ej i utkastet)`);

// ---- B. Netflix ----
chk('B-NFLX-oms2025', Math.abs(NFLX.serier.omsattning[3] / 1e9 - 45.2) < 0.05, `oms2025 ${NFLX.serier.omsattning[3] / 1e9} mdr USD mot påstått 45,2`);
chk('B-NFLX-oms2022', Math.abs(NFLX.serier.omsattning[0] / 1e9 - 31.6) < 0.05, `oms2022 ${NFLX.serier.omsattning[0] / 1e9} mot 31,6`);
chk('B-NFLX-brutto', Math.abs(NFLX.lonksamhet.bruttoMarginal * 100 - 49.1) < 0.05, `brutto ${(NFLX.lonksamhet.bruttoMarginal * 100).toFixed(2)} % mot 49,1`);
const nflxBV = NFLX.serier.omsattning[3] * NFLX.lonksamhet.bruttoMarginal / 1e9;
chk('B-NFLX-bruttovinst', nflxBV >= 21.5 && nflxBV <= 22.5, `bruttovinst 2025 ${nflxBV.toFixed(2)} mdr USD mot "omkring 22"`);
chk('B-NFLX-res2022', Math.abs(NFLX.serier.resultat[0] / 1e9 - 4.5) < 0.05, `res2022 ${(NFLX.serier.resultat[0] / 1e9).toFixed(3)} mot 4,5`);
chk('B-NFLX-res2025', Math.abs(NFLX.serier.resultat[3] / 1e9 - 11.0) < 0.05, `res2025 ${(NFLX.serier.resultat[3] / 1e9).toFixed(3)} mot 11,0`);
const cagr = (Math.pow(NFLX.serier.omsattning[3] / NFLX.serier.omsattning[0], 1 / 3) - 1) * 100;
chk('B-NFLX-cagr', Math.abs(cagr - 12.6) < 0.05, `omsCAGR 2022→2025 ${cagr.toFixed(3)} % mot "12,6 procent per år"`);
chk('B-NFLX-skuld', Math.abs(NFLX.stabilitet.skuldEgenkapital - 0.55) < 0.005, `skuld/EK ${NFLX.stabilitet.skuldEgenkapital} mot 0,55`);
chk('B-NFLX-roe', Math.abs(NFLX.lonksamhet.roe * 100 - 49.5) < 0.05, `ROE ${(NFLX.lonksamhet.roe * 100).toFixed(2)} % mot 49,5`);
chk('B-NFLX-pb', Math.abs(NFLX.vardering.pb - 11.4) < 0.05, `P/B ${NFLX.vardering.pb} mot 11,4`);

// ---- C. Spotify ----
const sp23 = SPOT.serier.resultat[SPOT.serier.ar.indexOf('2023')], sp25 = SPOT.serier.resultat[SPOT.serier.ar.indexOf('2025')];
chk('C-SPOT-2023', sp23 / 1e6 <= -520 && sp23 / 1e6 >= -545, `res2023 ${sp23 / 1e6} M ${SPOT.valuta} mot "minus 532 miljoner euro"`);
chk('C-SPOT-2025', Math.abs(sp25 / 1e6 - 2212) < 5, `res2025 ${sp25 / 1e6} M mot "plus 2 212 miljoner"`);
chk('C-SPOT-skuld', Math.abs(SPOT.stabilitet.skuldEgenkapital - 0.06) < 0.005, `skuld/EK ${SPOT.stabilitet.skuldEgenkapital} mot 0,06`);
chk('C-SPOT-roe', Math.abs(SPOT.lonksamhet.roe * 100 - 44.5) < 0.05, `ROE ${(SPOT.lonksamhet.roe * 100).toFixed(2)} % mot 44,5`);

// ---- D. Disney ----
const d23 = DIS.serier.resultat[DIS.serier.ar.indexOf('2023')], d25 = DIS.serier.resultat[DIS.serier.ar.indexOf('2025')];
chk('D-DIS-2023', Math.abs(d23 / 1e9 - 2.4) < 0.05, `res2023 ${d23 / 1e9} mdr ${DIS.valuta} mot 2,4`);
chk('D-DIS-2025', Math.abs(d25 / 1e9 - 12.4) < 0.05, `res2025 ${d25 / 1e9} mdr mot 12,4`);
chk('D-DIS-skuld', Math.abs(DIS.stabilitet.skuldEgenkapital - 0.39) < 0.005, `skuld/EK ${DIS.stabilitet.skuldEgenkapital} mot 0,39`);

// ---- E. Viaplay ----
const vAr = VPLAY.serier.ar, vOms = VPLAY.serier.omsattning, vRes = VPLAY.serier.resultat;
const toppIdx = vOms.indexOf(Math.max(...vOms));
chk('E-VPLAY-toppoms', vAr[toppIdx] === '2023' && Math.abs(vOms[toppIdx] / 1e9 - 18.6) < 0.05, `toppomsättning ${vAr[toppIdx]}: ${(vOms[toppIdx] / 1e9).toFixed(3)} mdr ${VPLAY.valuta} mot "2023 på 18,6"`);
// halv-upp-avrundning på en decimal = seriens dokumenterade konvention (finansbolagspresedens ROE 14,550→14,6)
const vpB = VPLAY.lonksamhet.bruttoMarginal * 100;
chk('E-VPLAY-brutto', Math.abs((Math.round(vpB * 10) / 10) - 15.0) < 1e-9, `bruttoMarginal-fält ${vpB.toFixed(4)} % → halv-upp 1 dec = ${Math.round(vpB * 10) / 10} mot "15,0" (gränsfall 14,95)`);
not('N2', 'Viaplay "15,0 procent brutto [2023]": universumet bär bara nu-tal för bruttomarginal (inga årliga bruttoserier) — fältet 15,0 % är kontrollerat men dess tidsbindning till toppåret 2023 är ej separat verifierbar ur universumet');
const vBV = vOms[toppIdx] * 0.15 / 1e9;
chk('E-VPLAY-bruttovinst', vBV > 2.75 && vBV < 2.8, `härledd bruttovinst ${vBV.toFixed(3)} mdr mot "knappt 2,8"`);
const v23res = vRes[vAr.indexOf('2023')];
chk('E-VPLAY-res2023', v23res / 1e9 <= -9.65 && v23res / 1e9 >= -9.75, `res2023 ${(v23res / 1e9).toFixed(3)} mdr mot "förlust på 9,7"`);
chk('E-VPLAY-skuld', Math.abs(VPLAY.stabilitet.skuldEgenkapital - 3.30) < 0.005, `skuld/EK ${VPLAY.stabilitet.skuldEgenkapital} mot 3,30`);
chk('E-VPLAY-roe', Math.abs(VPLAY.lonksamhet.roe * 100 - (-52.9)) < 0.05, `ROE ${(VPLAY.lonksamhet.roe * 100).toFixed(2)} % mot −52,9`);
chk('E-VPLAY-pe-saknas', VPLAY.vardering.pe == null, `P/E ${VPLAY.vardering.pe} — utkastet: "Viaplay saknar P/E"`);

// ---- F. Warner Bros. Discovery ----
const wAr = WBD.serier.ar, wRes = WBD.serier.resultat;
chk('F-WBD-2024', Math.abs(wRes[wAr.indexOf('2024')] / 1e9 - (-11.3)) < 0.05, `res2024 ${(wRes[wAr.indexOf('2024')] / 1e9).toFixed(3)} mdr ${WBD.valuta} mot −11,3`);
chk('F-WBD-2025', Math.abs(wRes[wAr.indexOf('2025')] / 1e9 - 0.7) < 0.05, `res2025 ${(wRes[wAr.indexOf('2025')] / 1e9).toFixed(3)} mdr mot +0,7`);
chk('F-WBD-pb', Math.abs(WBD.vardering.pb - 2.2) < 0.05, `P/B ${WBD.vardering.pb} mot 2,2`);
chk('F-WBD-pe-saknas', WBD.vardering.pe == null, `P/E ${WBD.vardering.pe} — utkastet: "WBD saknar P/E"`);
chk('F-WBD-fcf', Math.abs(WBD.lonksamhet.fcfMarginal * 100 - 44.8) < 0.05, `fcfMarginal ${(WBD.lonksamhet.fcfMarginal * 100).toFixed(2)} % mot "44,8 procent"`);
not('N3', 'WBD "fri kassaflödesmarginal 44,8 % samtidigt som minusåret 2024": fältet är nu-tal (hamtat 2026-09-03) — tidsbindningen till 2024 är tolkning, ej separat verifierbar ur universumet');

// ---- G. MTG ----
const mAr = MTG.serier.ar, mRes = MTG.serier.resultat;
chk('G-MTG-2022', Math.abs(mRes[mAr.indexOf('2022')] / 1e9 - 6.5) < 0.05, `res2022 ${(mRes[mAr.indexOf('2022')] / 1e9).toFixed(3)} mdr ${MTG.valuta} mot 6,5`);
chk('G-MTG-2023', Math.abs(mRes[mAr.indexOf('2023')] / 1e9 - 0.2) < 0.05, `res2023 ${(mRes[mAr.indexOf('2023')] / 1e9).toFixed(3)} mdr mot 0,2`);
const efter = mRes.slice(mAr.indexOf('2023') + 1);
chk('G-MTG-förluster', efter.every(x => x < 0), `resultat efter 2023: ${efter.map(x => (x / 1e6).toFixed(0) + ' M').join(', ')} — "sedan till förluster"`);
chk('G-MTG-pb', Math.abs(MTG.vardering.pb - 1.4) < 0.05, `P/B ${MTG.vardering.pb} mot 1,4`);
chk('G-MTG-pe', Math.abs(MTG.vardering.pe - 93.6) < 0.05, `P/E ${MTG.vardering.pe} mot 93,6`);
chk('G-MTG-peg', Math.abs(MTG.vardering.peg - 0.52) < 0.005, `PEG ${MTG.vardering.peg} mot 0,52`);

// ---- H. räkneexempelens aritmetik ----
chk('H1', 10e6 * 120 * 12 === 14.4e9, `10 M abonnenter × 120 kr × 12 = ${(10e6 * 120 * 12 / 1e9).toFixed(1)} mdr kr/år`);
chk('H2', Math.abs(14.4 - 12 - 2.4) < 1e-9, `täckning 14,4 − 12,0 = 2,4 mdr`);
chk('H3', Math.abs(1e6 * 120 * 12 / 1e9 - 1.44) < 1e-9, `+1 M abonnenter = +1,44 mdr`);
chk('H4', Math.abs((14.4 + 1.44) - 12 - 3.84) < 1e-9, `ny täckning 15,84 − 12,0 = 3,84 mdr`);
chk('H5', Math.abs(3.84 / 2.4 - 1.6) < 1e-9, `3,84/2,4 = 1,6 = "60 procent mer"`);

// ---- I. metadata ----
const ord = body.trim().split(/\s+/).length;
console.log(`\n== body: ${ord} ord, ${body.length} tecken ==`);
chk('I-title', ut.title.length <= 60, `title ${ut.title.length} tkn`);
console.log(`INFO description ${ut.description.length} tkn (SEO-norm ~150–160)`);
not('N4', `readingMinutes ${ut.readingMinutes} mot ${ord} ord: /600-konventionen (seriens majoritet: energi/industri/finans/mx1) ger round(${ord}/600)=${Math.round(ord / 600)}; /200-tolkningen (bilaktier-fallet) ger ${Math.round(ord / 200)}`);
not('N5', `publishedAt ${ut.publishedAt} = skapandedagen (serieskonvention; publiceringsdatum = kundens R2)`);

// ---- J. rådverb / juridik-textuell sond (komplement till vakten) ----
const rad = [...body.matchAll(/(?:^|[^\wåäö])(köp|sälj|sälja|rekommenderar|tips|råder|råd)(?=[\s,.;:)]|$)/gi)].map(m => m[1]);
console.log(`INFO rådgivningsglossor (ordnad träff): ${rad.length} ${JSON.stringify(rad)}`);
const disclaimer = body.trim().toLowerCase().endsWith('inte investeringsråd._') || body.includes('pedagogisk finansanalys, inte investeringsråd');
chk('J-disclaimer', disclaimer, 'avslutande disclaimer "pedagogisk finansanalys, inte investeringsråd"');
const lagrum = [...body.matchAll(/\b\d{4}:\d+\b/g)].map(m => m[0]);
chk('J-lagrum', lagrum.length === 0, `åberopade lagrum: ${JSON.stringify(lagrum)} (inga = ingen blandningsrisk)`);

// ---- K. interna länkar ----
const links = [...body.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]);
console.log(`\n== ${links.length} interna länkar ==`);
console.log(JSON.stringify([...new Set(links)]));

console.log(`\n==== SUMMA: ${ok} OK / ${fel} FEL / ${notiser.length} notiser ====`);
