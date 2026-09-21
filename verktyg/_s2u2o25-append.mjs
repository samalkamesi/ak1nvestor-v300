#!/usr/bin/env node
/**
 * _s2u2o25-append.mjs — AUTO-S2 omgång 25 u2: RELIANCE.NS + LSEG.L in i
 * bolagsunivers.json (237→239). Aritmetikgrind med ABORT FÖRE skrivning
 * (omg22/23/24-mönstret). TVÅ NYA CELL-ETTIOR: Indien/energi 0→1
 * (Reliance — världens folkrikaste lands fjärde gren) + Storbritannien/
 * finans 1→2 (LSEG mot HSBC — kapitalmarknads-infrastruktur mot bank).
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const HAMTAT = "2026-09-20";

// ── Källpaket: RELIANCE.NS (NSE-primär, stockanalysis.com, close 2026-09-18) ─
// Enhet: mdr INR om ej annat sägs. Fiscal år = apr–mar (FY2026 = to 2026-03-31).
const REL = {
  ticker: "RELIANCE.NS", namn: "Reliance Industries", bransch: "energi", land: "Indien",
  valuta: "INR", hamtat: HAMTAT, pris: 1226.40, mcapMdr: 16595.6,
  aktierM: 13532, aktierFY22impl: 13361, // miljoner (EPS-implied 607050/45,43)
  epsTTM: 55.22, peFalt: 22.21, peFwd: 18.63, pegKalla: 1.39,
  ps: 1.47, pbFalt: 1.53, ptbv: 3.42, bvps: 668.04,
  evMdr: 19810, evEbit: 15.08, evEbitdaFalt: 10.52, evEarnings: 26.51,
  bruttoTTM: 3820, ebitTTM: 1310, nettoTTM: 747.27, revTTM: 11300,
  roic: 0.0807, wacc: 0.0503,
  bruttoMarg: 0.3384, ebitMarg: 0.1161, nettoMarg: 0.0662, fcfMargKalla: 0.0655,
  ocfTTM: 1921.13, capexTTM: 1229.16, fcfTTM: 691.97,
  kassa: 2580, skuld: 3980, nettoskuld: 1398.53, ekTotal: 10858.66,
  minoriter: 1818.36,
  skuldEk: 0.37, rantaTackning: 5.17,
  dps: 6.00, yieldFalt: 0.0049, dpsTillvaxt: 0.0909,
  utdFY26: 74.43,
  serirAr: ["2022", "2023", "2024", "2025", "2026"],
  oms: [6959.63, 8778.35, 9010.64, 9646.93, 10572.19],
  res: [607.05, 667.02, 696.21, 696.48, 807.75],
  ekTotalSerie: [8889.84, 8288.81, 9257.88, 10096.26, 10858.66],
  fcfSerie: [105.09, -259.56, 59.05, 387.36, 691.97],
  bruttoSerie: [2229.71, 2893.52, 3157.21, 3350.04, 3685.56],
  minorSerie: [1094.99, 1130.09, 1323.07, 1664.26, 1818.36],
  capexSerie: [1001.45, 1409.88, 1528.83, 1399.67, 1229.16],
  utdSerie: [42.97, 50.83, 60.89, 67.66, 74.43],
  topp52: 1611.80, botten52: 1226.40,
};

// ── Källpaket: LSEG.L (LON-primär, stockanalysis.com, close 2026-09-18) ──────
// Pris i GBX (8 246 p), övrigt GBP; enhet M GBP för serier, mdr för mcap/EV.
const LSEG = {
  ticker: "LSEG.L", namn: "London Stock Exchange Group", bransch: "finans",
  land: "Storbritannien", valuta: "GBP", hamtat: HAMTAT,
  prisGBX: 8246, prisGBP: 82.46, mcapMdr: 39.80,
  aktierM: 482.63, aktierFY21impl: 541.18, // miljoner (EPS-implied 3129/5,78)
  epsTTM: 2.77, peFalt: 29.77, peFwd: 16.23, pegKalla: 1.28,
  ps: 4.12, pbFalt: 1.89, bvps: 37.63,
  evMdr: 51.47, evEbit: 19.74, evEbitda: 15.67, evEarnings: 36.40,
  bruttoTTM: 8572, ebitTTM: 2607, nettoTTM: 1414, revTTM: 9659, pretaxTTM: 2260,
  roe: 0.0769, roic: 0.0648, wacc: 0.0535,
  bruttoMarg: 0.8875, ebitMarg: 0.2699, nettoMarg: 0.1464, fcfMarg: 0.3911,
  ocfTTM: 3930, capexTTM: 147, fcfTTM: 3783,
  kassa: 4240, skuld: 13550, nettoskuld: 9310, ekTotal: 21070,
  minorTTM: 2909,
  skuldEk: 0.64, rantaTackning: 6.84,
  dps: 1.58, yieldFalt: 0.0192, payoutFalt: 0.5354, dpsTillvaxt: 0.1618,
  buybackYield: 0.0404, shareholderYield: 0.0596,
  utdFY25: 718, buybackFY25: 2072,
  serirAr: ["2021", "2022", "2023", "2024", "2025"],
  oms: [6535, 7743, 8379, 8858, 9346],
  res: [3129, 1302, 761, 685, 1249],
  ekTotalSerie: [25519, 28151, 25944, 25153, 22168],
  ekCommonSerie: [23640, 25996, 23807, 23013, 19951],
  fcfSerie: [2512, 2544, 2820, 3322, 3498],
  bruttoSerie: [5676, 6679, 7236, 7685, 8233],
  utdSerie: [426, 567, 611, 642, 718],
  buybackSerie: [0, 303, 1207, 1005, 2072],
  topp52: 10140, botten52: 6684, // GBX
};

// ── Aritmetikgrind (ABORT vid rött; inget skrivs förrän alla gröna) ──────────
const rok = [];
let n = 0;
const K = (namn, tankt, vantat, tol) => {
  n++;
  const avvik = typeof tankt === "number" && typeof vantat === "number"
    ? Math.abs(tankt - vantat) : Infinity;
  const gron = avvik <= tol;
  if (!gron) rok.push(`${namn}: tänkt ${tankt} mot väntat ${vantat} (avvik ${avvik?.toFixed?.(6)}, tol ${tol})`);
  return gron;
};
const cagr = (forsta, sista) => Math.pow(sista / forsta, 0.25) - 1;

// REL-kontroller
K("REL-1 omsCAGR", Math.round(cagr(REL.oms[0], REL.oms[4]) * 10000) / 10000, 0.1102, 0.0005);
K("REL-2 resCAGR", Math.round(cagr(REL.res[0], REL.res[4]) * 10000) / 10000, 0.0740, 0.0005);
K("REL-3 prognosTillväxt TTE", REL.peFalt / REL.peFwd - 1, 0.19216, 0.001);
K("REL-4 PEG spårkonvention", Math.round((REL.peFalt / ((REL.peFalt / REL.peFwd - 1) * 100)) * 100) / 100, 1.16, 0.005);
K("REL-5 PS-replik", REL.mcapMdr / REL.revTTM, 1.4684, 0.005);
K("REL-6 P/B-fält = mcap/EK-total (minoritetsbas)", REL.mcapMdr / REL.ekTotal, 1.52797, 0.002);
K("REL-7 P/B parent-bas pris/BVPS (tvålava dok.)", REL.pris / REL.bvps, 1.83552, 0.002);
K("REL-8 P/E-fält = pris/EPS-TTM (EXAKT replik)", REL.pris / REL.epsTTM, 22.2079, 0.005);
K("REL-9 mcap-replik aktier×pris (mdr INR)", REL.aktierM * REL.pris / 1000, 16595.6, 2);
K("REL-10 EV-replik mcap+nettoskuld+minoriteter (BEVIS: fältet bär minoriteter)", REL.mcapMdr + REL.nettoskuld + REL.minoriter, 19812.49, 3);
K("REL-11 EV/EBIT-replik (källans EBIT 1,312)", REL.evMdr / 1312, 15.099, 0.05);
K("REL-12 bruttomarginal TTM (källavrundning på T-bas)", REL.bruttoTTM / REL.revTTM, 0.33805, 0.001);
K("REL-13 EBIT-marginal TTM", REL.ebitTTM / REL.revTTM, 0.11593, 0.0006);
K("REL-14 nettomarginal TTM", REL.nettoTTM / REL.revTTM, 0.06613, 0.0005);
K("REL-15 FCF-marginal källans FY-bas (6,55 fält)", REL.fcfTTM / REL.oms[4], 0.06545, 0.0005);
K("REL-16 FCF = OCF − capex", REL.ocfTTM - REL.capexTTM, REL.fcfTTM, 0.01);
K("REL-17 direktavkastning", REL.dps / REL.pris, 0.004893, 0.00002);
K("REL-18 skuld/EK", REL.skuld / REL.ekTotal, 0.36653, 0.002);
K("REL-19 nettoskuld", REL.skuld - REL.kassa, 1400, 2);
K("REL-20 ROE-replik netto/EK-total (fält n/a, dok.)", REL.nettoTTM / REL.ekTotal, 0.06882, 0.0005);
K("REL-21 aktiebas FY22-impl → TTM", REL.aktierM / REL.aktierFY22impl - 1, 0.01280, 0.001);
K("REL-22 TTM-tillväxt mot FY2026", REL.revTTM / REL.oms[4] - 1, 0.06885, 0.0005);
K("REL-23 bruttomarginal-medel 5 år", REL.bruttoSerie.reduce((s, g, i) => s + g / REL.oms[i], 0) / 5, 0.33928, 0.0005);
K("REL-24 brutto-spread 5 år", Math.max(...REL.bruttoSerie.map((g, i) => g / REL.oms[i])) - Math.min(...REL.bruttoSerie.map((g, i) => g / REL.oms[i])), 0.02999, 0.0005);
K("REL-25 minoritetstrappa endast stigande (Jio/Retail-värdering)", REL.minorSerie.every((m, i, a) => i === 0 || m > a[i - 1]) ? 1 : 0, 1, 0);
K("REL-26 capex-bågen tre fallande år (utbyggnadsfasen avslutad)", REL.capexSerie[2] > REL.capexSerie[3] && REL.capexSerie[3] > REL.capexSerie[4] ? 1 : 0, 1, 0);
K("REL-27 FCF-vändningen (FY23 minus → FY26 rekord)", REL.fcfSerie[1] < 0 && REL.fcfSerie[4] === Math.max(...REL.fcfSerie) ? 1 : 0, 1, 0);
K("REL-28 payout-replik TTM (fält n/a)", REL.dps / REL.epsTTM, 0.10866, 0.001);
K("REL-29 EV/Earnings-replik", REL.evMdr / REL.nettoTTM, 26.505, 0.01);
K("REL-30 toppavstånd 52-v", REL.pris / REL.topp52 - 1, -0.23907, 0.001);
K("REL-31 PRIS = 52-V-BOTTEN EXAKT (signaturdagen)", REL.pris === REL.botten52 ? 1 : 0, 1, 0);
K("REL-32 pretax under EBIT (nettofinanskostnad)", 1170 < REL.ebitTTM ? 1 : 0, 1, 0);
K("REL-33 serielängder 4×5", [REL.oms, REL.res, REL.ekTotalSerie, REL.fcfSerie].every(s => s.length === 5) ? 1 : 0, 1, 0);

// LSEG-kontroller
K("LS-1 omsCAGR", Math.round(cagr(LSEG.oms[0], LSEG.oms[4]) * 10000) / 10000, 0.0936, 0.0005);
K("LS-2 resCAGR endpoint (NEGATIV — FY2021 bär one-off, dok.)", Math.round(cagr(LSEG.res[0], LSEG.res[4]) * 10000) / 10000, -0.2051, 0.0005);
K("LS-3 prognosTillväxt TTE (TTM-netto nedtryckt)", LSEG.peFalt / LSEG.peFwd - 1, 0.83426, 0.001);
K("LS-4 PEG spårkonvention", Math.round((LSEG.peFalt / ((LSEG.peFalt / LSEG.peFwd - 1) * 100)) * 100) / 100, 0.36, 0.005);
K("LS-5 PS-replik", LSEG.mcapMdr * 1000 / LSEG.revTTM, 4.1204, 0.005);
K("LS-6 P/B-fält = mcap/EK-total (minoritetsbas)", LSEG.mcapMdr * 1000 / LSEG.ekTotal, 1.8894, 0.002);
K("LS-7 P/B parent-bas pris/BVPS (tvålava dok.)", LSEG.prisGBP / LSEG.bvps, 2.19134, 0.002);
K("LS-8 P/E-fält = pris/EPS-TTM (EXAKT replik)", LSEG.prisGBP / LSEG.epsTTM, 29.7690, 0.005);
K("LS-9 mcap-replik aktier×pris (M GBP)", LSEG.aktierM * LSEG.prisGBP, 39797.9, 5);
K("LS-10 EV-fältets replikband mcap+nettoskuld [+minoriteter]", LSEG.evMdr - (LSEG.mcapMdr + LSEG.nettoskuld / 1000), LSEG.minorTTM / 1000, 0.8);
K("LS-11 EV/EBIT-replik", LSEG.evMdr * 1000 / LSEG.ebitTTM, 19.743, 0.01);
K("LS-12 bruttomarginal TTM", LSEG.bruttoTTM / LSEG.revTTM, 0.88746, 0.0005);
K("LS-13 EBIT-marginal TTM", LSEG.ebitTTM / LSEG.revTTM, 0.26991, 0.0005);
K("LS-14 nettomarginal TTM", LSEG.nettoTTM / LSEG.revTTM, 0.14639, 0.0005);
K("LS-15 FCF-marginal (källans FCF 3 778)", LSEG.fcfTTM / LSEG.revTTM, 0.39162, 0.001);
K("LS-16 FCF = OCF − capex", LSEG.ocfTTM - LSEG.capexTTM, LSEG.fcfTTM, 0);
K("LS-17 direktavkastning", LSEG.dps / LSEG.prisGBP, 0.019159, 0.00005);
K("LS-18 shareholder yield summa", LSEG.yieldFalt + LSEG.buybackYield, 0.0596, 0.0005);
K("LS-19 skuld/EK", LSEG.skuld / LSEG.ekTotal, 0.64309, 0.002);
K("LS-20 nettoskuld", LSEG.skuld - LSEG.kassa, LSEG.nettoskuld, 0);
K("LS-21 ROE-fält mot parent-replik (källans bas, dok.)", LSEG.nettoTTM / (LSEG.ekTotal - LSEG.minorTTM), 0.07791, 0.002);
K("LS-22 aktiebas FY21-impl → TTM (återköpsmaskinen)", LSEG.aktierM / LSEG.aktierFY21impl - 1, -0.10815, 0.001);
K("LS-23 TTM-tillväxt mot FY2025", LSEG.revTTM / LSEG.oms[4] - 1, 0.03349, 0.0005);
K("LS-24 bruttomarginal-medel 5 år", LSEG.bruttoSerie.reduce((s, g, i) => s + g / LSEG.oms[i], 0) / 5, 0.86870, 0.0005);
K("LS-25 brutto-spread 5 år (SMAL — data-moatet)", Math.max(...LSEG.bruttoSerie.map((g, i) => g / LSEG.oms[i])) - Math.min(...LSEG.bruttoSerie.map((g, i) => g / LSEG.oms[i])), 0.01827, 0.0005);
K("LS-26 FY2021-one-off (marginal 47,9 % mot TTM 14,6 %)", LSEG.res[0] / LSEG.oms[0] > 0.47 && LSEG.nettoMarg < 0.15 ? 1 : 0, 1, 0);
K("LS-27 EK-fallet tre raka år (återköpen äter EK)", LSEG.ekTotalSerie[1] > LSEG.ekTotalSerie[2] && LSEG.ekTotalSerie[2] > LSEG.ekTotalSerie[3] && LSEG.ekTotalSerie[3] > LSEG.ekTotalSerie[4] ? 1 : 0, 1, 0);
K("LS-28 återköpsbågen ×6,8 på tre år", LSEG.buybackSerie[4] / LSEG.buybackSerie[1], 6.838, 0.01);
K("LS-29 utdelning/FCF FY25", LSEG.utdFY25 / LSEG.fcfSerie[4], 0.20526, 0.001);
K("LS-30 EV/Earnings-replik", LSEG.evMdr * 1000 / LSEG.nettoTTM, 36.402, 0.01);
K("LS-31 toppavstånd 52-v", LSEG.prisGBX / LSEG.topp52 - 1, -0.18678, 0.001);
K("LS-32 capex-andel av OCF (kapitallätt plattform)", LSEG.capexTTM / LSEG.ocfTTM, 0.03740, 0.0005);
K("LS-33 pretax under EBIT (nettofinanskostnad)", LSEG.pretaxTTM < LSEG.ebitTTM ? 1 : 0, 1, 0);
K("LS-34 serielängder 5×5", [LSEG.oms, LSEG.res, LSEG.ekTotalSerie, LSEG.fcfSerie, LSEG.utdSerie].every(s => s.length === 5) ? 1 : 0, 1, 0);

console.log(`ARITMETIKGRIND: ${n - rok.length}/${n} GRÖNA`);
if (rok.length) {
  console.error("ABORT — röda kontroller (filen orörd):");
  for (const r of rok) console.error("  RÖD " + r);
  process.exit(1);
}

// ── Objekt (skrivs endast efter grön grind) ─────────────────────────────────
const relObj = {
  ticker: REL.ticker, namn: REL.namn, bransch: REL.bransch, land: REL.land,
  valuta: REL.valuta,
  kallor: [{
    namn: "StockAnalysis",
    hamtat: HAMTAT,
    url: "https://stockanalysis.com/quote/nse/RELIANCE/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/)",
    paranoid: "NSE-PRIMÄRNOTING i INR (TCS.NS/HDFCBANK.NS/HINDUNILVR.NS-precedenserna; underlag S&P Global Market Intelligence; close 2026-09-18 −1,41 %): pris 1 226,40 INR = EXAKT 52-V-BOTTEN (bandet 1 226,40–1 611,80; −13,26 % på året, −23,9 % från toppen — kontrast mot analytikerkåran Strong Buy 26 st PT 1 676,85 +36,73 %), mcap 16,60T INR (aktier 13 532 M EPS-implied × 1 226,40 = 16 595,6 mdr — 0,03 % under källans T-avrundning), P/E 22,21 = pris/EPS-TTM 55,22 = 22,208 EXAKT REPLIK, fwd 18,63 ⇒ prognosTillväxt +19,2 % TTE, PEG 1,16 spårkonvention (källans 1,39 på 3-års-prognosen EPS +34,53 %/år — dokumenterad källspridning), PS 1,47 (replik ✓), P/B 1,53 = mcap/EK-total 10 859 (minoritetsbasen) medan pris/BVPS 668,04 = 1,84 parent-basen — TVÅLAVAN dokumenterad: EK-total 10 859 − minoriteter 1 818 = 9 040 = BVPS-basen, P/TBV 3,42, EV 19 810 mdr med REPLIK-BEVIS: mcap 16 595,6 + nettoskuld 1 398,53 + minoriteter 1 818,36 = 19 812,5 (källans EV bär minoriteterna — 0,01 % avvik på T-avrundningen; fältet mekaniskt dekomponerat), EV/EBIT 15,08 (replik på EBIT 1 312 ✓) EV/EBITDA 10,52 (replik 10,95 — källans EBITDA-bas ~1 883, spridning 4 % dokumenterad) EV/Earnings 26,51 (replik 26,51 ✓), marginaler TTM: brutto 33,84 % (replik på T-avrundade brutto 3 820/11 300 = 33,80 %), EBIT 11,61 %, netto 6,62 % (replik ✓), FCF 6,55 % KÄLLANS FY-BAS 691,97/10 572 (TTM-basen 6,12 % — dokumenterad), fcfYield 4,17 %, ROIC 8,07 % mot WACC 5,03 % (+3,0 pp), ROE fält n/a — replik netto/EK-total 6,88 % (dokumenterad), effektiv skatt 24,57 %, kassa 2,58T, skuld 3,98T, nettoskuld 1 398,53 mdr (net cash/share −103,35), EK-total 10 858,66 mdr, skuld/EK 0,37, räntetäckning 5,17, Altman n/a, Piotroski 3, utdelning 6,00 INR (0,49 %; replik 6/1 226,40 ✓) payout fält n/a — replik 10,9 %, DPS-tillväxt +9,09 % med 5 tillväxtår, utdelningar 42,97→74,43 mdr INR FY22→FY26, återköp saknas i CF-vyn (buyback yield −0,00), aktiebas +1,28 % FY22-impl→TTM (statistics +0,00 % YoY), beta 0,15 (5Y), institutioner 28,69 % insiders 0,71 % (Ambani-familjens promotorägande större delen utanför institutionsfältet — notis), float 6 640 M, analytiker Strong Buy PT 1 676,85 INR (+36,73 %; 26 st), 404 501 anställda, grundat 1957, nästa rapp 2026-10-23 (Q2 FY2027); FY APRIL–MARS: rev 6 959,63→8 778,35→9 010,64→9 646,93→10 572,19 mdr FY2022→26 (omsCAGR +11,02 %/år), brutto 2 229,71→3 685,56, operativ 792,39→1 212,61, netto 607,05→667,02→696,21→696,48→807,75 (resCAGR +7,40 %/år), EPS 45,43→59,69 med TTM 55,22, TTM jun-26: rev 11 300 (+6,89 % mot FY2026 — universumets TTM/FY-konvention), brutto 3 820, operativ 1 310, netto 747,27; CF: OCF 1 106,54→1 921,13 mdr FY22→26, CAPEX-BÅGEN 1 001,45→1 409,88→1 528,83→1 399,67→1 229,16 (toppen FY2024, TRE FALLANDE ÅR — 5G/pan-Indien-utbyggnaden avslutad), FCF 105,09→−259,56→59,05→387,36→691,97 (FY2023 NEGATIVT — capex över OCF; sedan ×11,7 på tre år), MINORITETSTRAPPAN 1 094,99→1 130,09→1 323,07→1 664,26→1 818,36 mdr (endast stigande — Jio/Retail-värderingarnas andel av koncernen växer), EK-trappa 8 889,84→10 858,66; branschfält Energy/Oil & Gas Refining & Marketing — Indiens största privata koncern (raffinad + petrokem + Jio-telekom + retail), världens folkrikaste lands fjärde gren föds",
  }],
  hamtat: HAMTAT, pris: REL.pris, marknadsKapitalMdr: 16595.6,
  tillvaxt: {
    omsattningCAGR5ar: 0.1102, resultatCAGR5ar: 0.0740,
    omsattningTillvaxtTTM: 0.0688, prognosTillvaxt: 0.1922,
  },
  lonksamhet: {
    roe: 0.0688, roic: 0.0807, bruttoMarginal: 0.3384,
    ebitMarginal: 0.1161, nettoMarginal: 0.0662, fcfMarginal: 0.0655,
  },
  stabilitet: {
    skuldEgenkapital: 0.37, rantaTackning: 5.17, fcfPositivaSenaste5: 4,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: null,
  },
  aterkop: { senasteArMdr: 74.43, andelUtestande: 0.0049, insiderkopSenaste6man: null },
  moat: { bruttoMarginalMedel5ar: 0.3393, bruttoMarginalSpread5ar: 0.0300, roeMedel5ar: null },
  vardering: {
    pe: 22.21, pb: 1.53, evEbit: 15.08, peg: 1.16,
    fcfYield: 0.0417, egenKapitalMultipl: 1.53,
  },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: REL.serirAr,
    omsattning: REL.oms.map(x => x * 1e6),
    resultat: REL.res.map(x => x * 1e6),
    egetKapital: REL.ekTotalSerie.map(x => x * 1e6),
    fcf: REL.fcfSerie.map(x => x * 1e6),
  },
  notering: "INDIEN/ENERGI 0→1 — CELL ETTAN (TCS.NS teknik · HDFCBANK.NS finans · HINDUNILVR.NS konsument · RELIANCE.NS energi = fyra grenar). SIGNATURTAL — UTBYGGNADSFASENS SLUT OCH KASSANS VÄNDSIDÅ: (1) capex-bågen 1 001→1 529→1 229 mdr INR med TRE FALLANDE ÅR efter 5G-toppen FY2024 medan FCF går 105→−260→59→387→692 mdr (FY2023 minusår, sedan ×11,7 på tre år); (2) minoritetstrappan 1 095→1 818 mdr ENDAST STIGANDE — Jio/Retail-värderingarna flyttar koncernvikt från raffinad till digital, EV-repliken BEVISAR minoritetsbärningen: mcap+nettoskuld+minoriteter = 19 810 = källans EV; (3) pris 1 226,40 = EXAKT 52-V-BOTTEN (−23,9 % från toppen) mot panelen Strong Buy 26 st PT +36,7 % — bottnen som körmärke, blott dokumentation; (4) P/E 22,21 på energi-grenens premium-sida (konglomeratets konsument/digital-andelar bär multiplen, inte raffinaderiet); (5) beta 0,15. P/B-tvålavan 1,53/EK-total mot 1,84/BVPS — minoritetsbasens pedagogik. FIFO: Q2 FY2027-rapp 2026-10-23.",
};

const lsegObj = {
  ticker: LSEG.ticker, namn: LSEG.namn, bransch: LSEG.bransch, land: LSEG.land,
  valuta: LSEG.valuta,
  kallor: [{
    namn: "StockAnalysis",
    hamtat: HAMTAT,
    url: "https://stockanalysis.com/quote/lon/LSEG/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/)",
    paranoid: "LON-PRIMÄRNOTING, pris i GBX (8 246 p = £82,46; HSBA.L/GSK.L/ULVR.L/BA.L/BP.L-precedenserna; underlag S&P/FMP; close 2026-09-18 −0,19 %): 52-v 6 684–10 140 GBX (−3,44 % på året; −18,7 % från toppen), mcap £39,80 mdr (aktier 482,63 M × £82,46 = £39 798 M ✓), P/E 29,77 = £82,46/EPS-TTM 2,77 = 29,769 EXAKT REPLIK, fwd 16,23 ⇒ prognosTillväxt +83,4 % TTE (TTM-nettot nedtryckt — se FY2021-noten; 3-års-prognos EPS +13,54 %/år är källans lugnare bas, PEG-källspridning dokumenterad: spår 0,36 mot källa 1,28), PS 4,12 (replik ✓), P/B 1,89 = mcap/EK-total 21 070 (minoritetsbasen) medan £82,46/BVPS 37,63 = 2,19 parent-basen — TVÅLAVAN dokumenterad: EK-total − minoriteter 2 909 = 18 161 = BVPS-basen, EV £51,47 mdr (replikband: mcap+nettoskuld 49,11 … +minoriteter 52,02 — fältet mitt i, källans justeringsposter), EV/EBIT 19,74 (replik 19,74 EXAKT) EV/EBITDA 15,67 EV/Earnings 36,40 (replik EXAKT), marginaler TTM: brutto 88,75 % (replik ✓ — DATA-BOLAGETS PROFIL: kostnadssidan är människor och licenser, inte varor), EBIT 26,99 %, netto 14,64 %, FCF 39,11 % (källans FCF 3 778; replik 3 783 på OCF−capex), fcfYield 9,49 %, ROE 7,69 % (parent-replik 7,79 % — källans bas dokumenterad; EK-total-replik 6,71 %) ROA 0,19 % (clearing-jättens balans — konstaterande, inte fel) ROIC 6,48 % mot WACC 5,35 % (+1,1 pp), effektiv skatt 24,47 %, kassa £4,24 mdr, skuld £13,55 mdr, nettoskuld £9,31 mdr, EK-total £21,07 mdr, skuld/EK 0,64, räntetäckning 6,84, Altman 0,07 (LÅG — börsers_clearingbalanser bryter Z-modellens antaganden; konstaterande), Piotroski 6, utdelning £1,58 (1,92 %; replik 1,58/82,46 ✓) payout 53,54 %, DPS-tillväxt +16,18 % med TIO RAKA tillväxtår, ÅTERKÖPSMASKINEN: buyback yield 4,04 % + utdelning ⇒ shareholder yield 5,96 %, återköp £303→2 072 M FY2022→25 (×6,8), aktiebas 541,18 M FY21-impl → 482,63 M TTM = −10,8 % på 4,5 år (statistics −4,04 % YoY), EK-FALLET tre raka år 28 151→22 168 (återköpen äter balansen — LSEG:s eget val), institutioner 69,65 % insiders 0,04 %, beta 0,40, analytiker Strong Buy PT 11 804 GBX (+43,15 %; 15 st), 28 516 anställda, GRUNDAT 1698 (börsens egen 328-åriga historia — universumets äldsta bolag), nästa rapp 2026-10-22 (Q3 2026); FY KALENDER: rev £6 535→7 743→8 379→8 858→9 346 M FY2021→25 (omsCAGR +9,35 %/år), brutto £5 676→8 233 M (marginal 86,9 % medel, spread 1,8 pp — SMAL: data-moatets stabilitet), operativ £1 454→2 301 M, netto £3 129→1 302→761→685→1 249 M — FY2021 bär ONE-OFF (marginal 47,9 % mot TTM 14,6 %; Refinitiv-epokens engångsposter, källans egen not 'unusual gains') ⇒ endpoint-resCAGR −20,5 % (ÄRLIGT BOKFÖRD: FY2021→FY2025; TTM-netto £1 414 +43,1 % YoY är pågående återhämtning), EPS 5,78→2,37 med TTM 2,77; CF: OCF £2 602→3 622 M FY21→25, capex £74–193 M/år (3,7 % av OCF — KAPITALLÄTT), FCF £2 512→3 498 M (fem raka stigande år), utdelningar £426→718 M, återköp £0→2 072 M; branschfält Financials/Financial Data & Stock Exchanges — börsernas börst: Refinitiv-dataarmen + clearing + index (FTSE Russell) + kapitalmarknader, Storbritanniens finansgren får sin icke-bank-bärare",
  }],
  hamtat: HAMTAT, pris: LSEG.prisGBP, marknadsKapitalMdr: 39.8,
  tillvaxt: {
    omsattningCAGR5ar: 0.0936, resultatCAGR5ar: -0.2051,
    omsattningTillvaxtTTM: 0.0335, prognosTillvaxt: 0.8343,
  },
  lonksamhet: {
    roe: 0.0769, roic: 0.0648, bruttoMarginal: 0.8875,
    ebitMarginal: 0.2699, nettoMarginal: 0.1464, fcfMarginal: 0.3911,
  },
  stabilitet: {
    skuldEgenkapital: 0.64, rantaTackning: 6.84, fcfPositivaSenaste5: 5,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: null,
  },
  aterkop: { senasteArMdr: 0.718, andelUtestande: 0.0192, insiderkopSenaste6man: null },
  moat: { bruttoMarginalMedel5ar: 0.8687, bruttoMarginalSpread5ar: 0.0183, roeMedel5ar: null },
  vardering: {
    pe: 29.77, pb: 1.89, evEbit: 19.74, peg: 0.36,
    fcfYield: 0.0949, egenKapitalMultipl: 1.89,
  },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: LSEG.serirAr,
    omsattning: LSEG.oms.map(x => x * 1e6),
    resultat: LSEG.res.map(x => x * 1e6),
    egetKapital: LSEG.ekTotalSerie.map(x => x * 1e6),
    fcf: LSEG.fcfSerie.map(x => x * 1e6),
  },
  notering: "STORBRITANNIEN/FINANS 1→2 (HSBA.L HSBC etta — cellens tvillingfödelse: detaljbank-jätten P/E 8-klass mot kapitalmarknads-infrastrukturen P/E 29,8; Londons två ansikten i en cell). SIGNATURTAL — PLATTFORMENS EKONOMI: (1) bruttomarginal 88,75 % TTM på femårsmedel 86,9 % med spread 1,8 pp (data-moatets stabilitet — nära L'Oréal-klassen men på B2B-sidan); (2) ÅTERKÖPSMASKINEN + TIO RAKA utdelningshöjningsår: shareholder yield 5,96 % (buyback 4,04 % + utdelning 1,92 %), aktiebas −10,8 % på 4,5 år, EK-fallet tre raka år 28,2→22,2 mdr — bolaget köper tillbaka sig självt; (3) capex 3,7 % av OCF — KAPITALLÄTT (mot Reliances 64 % i samma omgång: de två kapitallogikernas extrempar); (4) FY2021-one-offen: netto £3 129 M på 47,9 % marginal mot TTM 14,6 % ⇒ endpoint-resCAGR −20,5 % ÄRLIGT bokförd med TTM +43,1 % som återhämtningen; (5) grundat 1698 — universumets äldsta bolag (börsens egen historia); (6) P/B-tvålava 1,89/EK-total mot 2,19/BVPS. ROA 0,19 % och Altman 0,07 = clearingbalansernas konstaterande (modellernas gränser, dokumenterat). FIFO: Q3-rapp 2026-10-22.",
};

// ── Kirurgisk append (endast hit) ────────────────────────────────────────────
const original = readFileSync(UNI, "utf8");
const arr = JSON.parse(original);
if (arr.length < 237) { console.error(`ABORT: universum ${arr.length} < 237 (oväntat läge — läs worklog)`); process.exit(1); }
if (arr.length > 239) { console.error(`ABORT: universum ${arr.length} > 239 (syskon hunnit? kontrollera tickrar)`); process.exit(1); }
if (arr.some(b => b.ticker === "RELIANCE.NS" || b.ticker === "LSEG.L")) {
  console.error("ABORT: ticker finns redan"); process.exit(1);
}
const fore = JSON.stringify(arr.slice(), null, 2);
arr.push(relObj, lsegObj);
const efter = JSON.stringify(arr, null, 2) + "\n";

// gamla rader innehållsidentiska (append utan formatteringsdrift)
const gamlaIgen = JSON.stringify(JSON.parse(efter).slice(0, arr.length - 2), null, 2);
if (gamlaIgen !== fore) { console.error("ABORT: gamla rader förändrade"); process.exit(1); }

writeFileSync(UNI, efter);
const readback = JSON.parse(readFileSync(UNI, "utf8"));
const forv = readback.length;
if (readback[forv - 2].ticker !== "RELIANCE.NS" || readback[forv - 1].ticker !== "LSEG.L") {
  console.error("ABORT: readback-ordning fel"); process.exit(1);
}
const round = JSON.stringify(readback, null, 2) + "\n";
if (round !== readFileSync(UNI, "utf8")) { console.error("ABORT: stringify-round-trip avvikelse"); process.exit(1); }

// ── Medianer + kvartiler + placeringar (diskens faktiska läge) ────────────────
const median = v => { const r = v.filter(x => typeof x === "number" && Number.isFinite(x)); if (!r.length) return null; const s = [...r].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const pct = (v, p) => { const r = v.filter(x => typeof x === "number" && Number.isFinite(x)); if (!r.length) return null; const s = [...r].sort((a, b) => a - b); const pos = (s.length - 1) * p; const lo = Math.floor(pos), hi = Math.ceil(pos); return lo === hi ? s[lo] : s[lo] + (pos - lo) * (s[hi] - s[lo]); };
const stat = (r, f) => ({ n: r.map(f).filter(x => typeof x === "number").length, median: median(r.map(f)), p25: pct(r.map(f), 0.25), p75: pct(r.map(f), 0.75) });

const ny = readback;
for (const [namn, f] of [["P/E", b => b.vardering?.pe], ["P/B", b => b.vardering?.pb], ["resCAGR %", b => b.tillvaxt?.resultatCAGR5ar]]) {
  for (const grupp of ["energi", "finans"]) {
    const s = stat(ny.filter(b => b.bransch === grupp), f);
    console.log(`${grupp.toUpperCase()} ${namn}: median ${s.median?.toFixed(2)} [P25–P75 ${s.p25?.toFixed(2)}–${s.p75?.toFixed(2)}, n=${s.n}]`);
  }
  const t = stat(ny, f);
  console.log(`TOTALT ${namn}: median ${t.median?.toFixed(2)} (n=${t.n} av ${ny.length})`);
}
const placera = (tk, grupp) => {
  const b = ny.find(x => x.ticker === tk); const v = b.vardering.pe;
  const iG = ny.filter(x => x.bransch === grupp && typeof x.vardering?.pe === "number").map(x => x.vardering.pe).sort((a, c) => a - c);
  const iA = ny.filter(x => typeof x.vardering?.pe === "number").map(x => x.vardering.pe).sort((a, c) => a - c);
  console.log(`KVARTIL ${tk}: P/E ${v} = rad ${iG.indexOf(v) + 1} av ${iG.length} i ${grupp} · universumrad ${iA.filter(x => x < v).length + 1} av ${iA.length} (median ${median(iA)?.toFixed(2)})`);
};
placera("RELIANCE.NS", "energi");
placera("LSEG.L", "finans");
const placeraC = (tk) => {
  const b = ny.find(x => x.ticker === tk); const v = b.tillvaxt.resultatCAGR5ar;
  const g = ny.filter(x => x.bransch === b.bransch && typeof x.tillvaxt?.resultatCAGR5ar === "number").map(x => x.tillvaxt.resultatCAGR5ar).sort((a, c) => a - c);
  const a = ny.filter(x => typeof x.tillvaxt?.resultatCAGR5ar === "number").map(x => x.tillvaxt.resultatCAGR5ar).sort((c, d) => c - d);
  console.log(`KVARTIL ${tk} resCAGR: ${(v * 100).toFixed(1)} % = rad ${g.indexOf(v) + 1} av ${g.length} i ${b.bransch} · universumrad ${a.filter(x => x < v).length + 1} av ${a.length}`);
};
placeraC("RELIANCE.NS"); placeraC("LSEG.L");
console.log(`INDIEN: ${ny.filter(b => b.land === "Indien").map(b => b.ticker + "/" + b.bransch).join(" · ")}`);
console.log(`STORBRITANNIEN: ${ny.filter(b => b.land === "Storbritannien").map(b => b.ticker + "/" + b.bransch).join(" · ")}`);
console.log(`APPEND KLAR: ${forv - 2}→${forv} · gamla rader innehållsidentiska · round-trip disk OK`);
