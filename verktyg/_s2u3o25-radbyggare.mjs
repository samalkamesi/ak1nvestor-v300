#!/usr/bin/env node
/**
 * s2-u3 omg25 (manifest auto-s2-1789954504687) — DATASET-DJUP +3 FRANKRIKE/
 * KONSUMENT-TRION: RMS.PA Hermès + BN.PA Danone + RI.PA Pernod Ricard
 * ⇒ cellen 2→5 = MATTAN NÅS ⇒ /dataset/konsument/frankrike föds data-drivet
 * (frankrike-modulen i land.ts finns sedan omg21, bransch-dynamisk; src/ orörd
 * = INGET bygge). Kering KER.PA avvisad i sonderingen (TTM −213 M EUR,
 * trailing P/E n/a — Sony-fällan).
 * ARITMETISK ABORT-GRIND: varje tal omräknat oberoende ur rådata FÖRE disk.
 */
import { mkdirSync, writeFileSync } from "node:fs";

const FEL = [];
const OK = [];
const grind = (id, calc, expect, tolPct, unit = "") => {
  if (expect === null) { OK.push(`${id}: källa n/a — bär null/eftermodell`); return; }
  const av = Math.abs(calc - expect) / Math.abs(expect);
  if (av > tolPct) FEL.push(`${id}: calc ${calc.toFixed(4)}${unit} vs förväntat ${expect}${unit} = ${(av * 100).toFixed(2)} % avvikelse > ${tolPct * 100} %`);
  else OK.push(`${id}: ${calc.toFixed(4)}${unit} ≈ ${expect}${unit} (${(av * 100).toFixed(2)} %)`);
};

// ═══════════════ RÅDATA (StockAnalysis EPA-primär hämtad 2026-09-21, close 2026-09-18; M EUR) ═══════════════
const RMS = {
  pris: 1331.50, aktierM: 104.74, aktierFilingM: 104.81, mcapMdr: 139.46, eps: 43.00, peF: 30.97, peFwd: 27.98,
  pbF: 7.33, ptbvF: 7.49, psF: 8.65, evMdr: 129.44, evEbitF: 19.06, evEbitdaF: 17.34,
  ekTotalM: 19025, ekCommonM: 19023, tbvM: 18610, kassaM: 12310, skuldM: 2280, minorM: 26,
  ttmRevM: 16131, ttmBruttoM: 11508, ttmEbitM: 6747, ttmNettoM: 4516, ttmOcfM: 5743, ttmCapexM: -681, ttmFcfM: 5062,
  bruttoF: 71.34, ebitF: 41.83, nettoF: 28.00, fcfMargF: 31.38, roeF: 25.45, roaF: 18.09, roicF: 50.14, waccF: 9.62,
  deF: 0.12, rantaF: 116.33, altmanF: 24.03, piotroskiF: 6, skattF: 33.16, betaF: 1.00, instF: 9.53, insiderF: 0.08,
  payoutF: 41.86, dps: 18.00, dpsYieldF: 1.35, utdelTTMm: 1916, pt: 1835.27,
  rev: [8982, 11602, 13427, 15170, 16002], res: [2445, 3367, 4311, 4603, 4524],
  bruttoSerie: [6402, 8213, 9707, 10659, 11379],
  ek: [9412, 12456, 15203, 17334, 18846], fcf: [3002, 3770, 3750, 4072, 4666],
  utdel: [485, 844, 1376, 1595, 1705],
  omsCAGR: 0.1554, resCAGR: 0.1662, omsTTM: 0.027, peg: 2.91, pegKalla: 2.84,
};
const BN = {
  pris: 60.54, aktierM: 643.30, mcapMdr: 38.95, eps: 3.02, peF: 20.05, peFwd: 14.83,
  pbF: 2.20, ptbvF: null, psF: 1.42, evMdr: 48.11, evEbitF: 12.33, evEbitdaF: 9.76,
  ekTotalM: 17689, ekCommonM: 17609, tbvM: -6238, kassaSmalM: 1864, kassaBredM: 8340, skuldM: 17427, minorM: 80,
  ttmRevM: 27482, ttmBruttoM: 13751, ttmEbitM: 3711, ttmNettoM: 1945, ttmOcfM: 3518, ttmCapexM: -1096, ttmFcfM: 2422,
  bruttoF: 50.04, ebitF: 13.50, nettoF: 7.13, fcfMargF: 8.81, roeF: 12.19, roaF: 5.02, roicF: 9.96, waccF: 4.30,
  deF: 0.99, rantaF: 6.99, altmanF: 2.2, piotroskiF: 6, skattF: 28.13, betaF: 0.18, instF: 55.43, insiderF: 0.01,
  payoutF: 73.47, dps: 2.25, dpsYieldF: 3.72, utdelTTMm: 1440, pt: 79.93,
  rev: [24281, 27661, 27619, 27376, 27283], res: [1898, 946, 873, 2017, 1817],
  bruttoSerie: [11521, 12739, 13084, 13607, 13810],
  ek: [17375, 17992, 16222, 17854, 16969], fcf: [2431, 2091, 2595, 2908, 2724],
  utdel: [1261, 1238, 1279, 1348, 1379],
  omsCAGR: 0.0295, resCAGR: -0.0109, omsTTM: 0.005, peg: 0.57, pegKalla: 2.71,
};
const RI = {
  pris: 59.44, aktierM: 251.68, mcapMdr: 14.96, eps: 4.77, peF: 12.46, peFwd: 10.41,
  pbF: 0.90, ptbvF: null, psF: 1.59, evMdr: 26.68, evEbitF: 11.04, evEbitdaF: 9.66,
  ekTotalM: 16540, ekCommonM: 15500, tbvM: -2500, kassaM: 1993, skuldM: 12677, minorM: 1040,
  ttmRevM: 9404, ttmBruttoM: 5495, ttmEbitM: 2417, ttmNettoM: 1203, ttmOcfM: 1579, ttmCapexM: -391, ttmFcfM: 1188,
  bruttoF: 58.43, ebitF: 25.70, nettoF: 12.79, fcfMargF: 12.63, roeF: 7.56, roaF: 4.06, roicF: 6.39, waccF: 5.00,
  deF: 0.77, rantaF: 4.89, altmanF: 1.32, piotroskiF: 5, skattF: 28.01, betaF: 0.47, instF: 52.47, insiderF: 0.69,
  payoutF: 101.91, dps: 4.70, dpsYieldF: 7.91, utdelFYm: 1226, pt: 81.76,
  rev: [10701, 12137, 11598, 10959, 9404], res: [1996, 2262, 1476, 1626, 1203],
  bruttoSerie: [6473, 7246, 6975, 6516, 5495],
  ek: [16253, 16715, 16797, 16226, 16540], fcf: [1788, 1331, 954, 1121, 1188],
  utdel: [826, 1072, 1208, 1201, 1226],
  omsCAGR: -0.0318, resCAGR: -0.1188, omsTTM: -0.1419, peg: 0.63, pegKalla: 5.24,
};

// ═══════════════ GRIND: RMS ═══════════════
{
  const mcap = RMS.pris * RMS.aktierM; // M EUR
  grind("RMS-01 mcap-identitet", mcap / 1000, RMS.mcapMdr, 0.001);
  grind("RMS-02 P/E aktiebas", RMS.pris / RMS.eps, RMS.peF, 0.005);
  grind("RMS-03 P/B total EK", mcap / RMS.ekTotalM, RMS.pbF, 0.005);
  grind("RMS-04 P/TBV", mcap / RMS.tbvM, RMS.ptbvF, 0.005);
  grind("RMS-05 P/S", mcap / RMS.ttmRevM, RMS.psF, 0.005);
  const ev = mcap + RMS.skuldM - RMS.kassaM; // källan bär ej minoritet (26 M, 0,02 %)
  grind("RMS-06 EV mcap+skuld-kassa", ev / 1000, RMS.evMdr, 0.001);
  // EV/EBIT: källspridning 0,65 % (källans EBIT-bas skiljer lätt) — dokumenterad
  grind("RMS-07 EV/EBIT (källspridning ≤1 %)", ev / RMS.ttmEbitM, RMS.evEbitF, 0.01);
  grind("RMS-08 bruttomarginal TTM", RMS.ttmBruttoM / RMS.ttmRevM * 100, RMS.bruttoF, 0.005, " %");
  grind("RMS-09 EBIT-marginal TTM", RMS.ttmEbitM / RMS.ttmRevM * 100, RMS.ebitF, 0.005, " %");
  grind("RMS-10 nettomarginal TTM", RMS.ttmNettoM / RMS.ttmRevM * 100, RMS.nettoF, 0.005, " %");
  grind("RMS-11 FCF-marginal", RMS.ttmFcfM / RMS.ttmRevM * 100, RMS.fcfMargF, 0.005, " %");
  grind("RMS-12 FCF = OCF+capex", RMS.ttmOcfM + RMS.ttmCapexM, RMS.ttmFcfM, 0.0001);
  grind("RMS-13 nettkassa", (RMS.kassaM - RMS.skuldM) / 1000, 10.03, 0.001, " mdr");
  grind("RMS-14 D/E", RMS.skuldM / RMS.ekTotalM, RMS.deF, 0.01);
  grind("RMS-15 DPS-yield", RMS.dps / RMS.pris * 100, RMS.dpsYieldF, 0.01, " %");
  grind("RMS-16 payout DPS-bas", RMS.dps / RMS.eps * 100, RMS.payoutF, 0.005, " %");
  grind("RMS-17 omsCAGR endpoint", (Math.pow(RMS.rev[4] / RMS.rev[0], 1 / 4) - 1) * 100, RMS.omsCAGR * 100, 0.02, " %");
  grind("RMS-18 resCAGR endpoint", (Math.pow(RMS.res[4] / RMS.res[0], 1 / 4) - 1) * 100, RMS.resCAGR * 100, 0.02, " %");
  const prognos = (RMS.peF / RMS.peFwd - 1) * 100;
  grind("RMS-19 prognosTillväxt", prognos, 10.65, 0.01, " %");
  grind("RMS-20 PEG spår", RMS.peF / 10.655, RMS.peg, 0.01);
  const marg = RMS.bruttoSerie.map((g, i) => g / RMS.rev[i] * 100);
  const medel = marg.reduce((a, b) => a + b, 0) / 5;
  const spread = Math.max(...marg) - Math.min(...marg);
  grind("RMS-21 moat-brutto-medel", medel, 71.14, 0.005, " %");
  grind("RMS-22 moat-brutto-spread", spread, 2.03, 0.02, " pp");
  if (RMS.fcf.every(x => x > 0)) OK.push("RMS-23 fcfPositivaSenaste5 = 5/5"); else FEL.push("RMS-23 fcf-serien ej 5/5 positiv");
  const hoy = RMS.utdel.every((x, i) => i === 0 || x > RMS.utdel[i - 1]);
  if (!hoy) FEL.push("RMS-24 utdelningshöjningar bruten"); else OK.push("RMS-24 utdelningar 485→844→1 376→1 595→1 705 M = FEM RAKA HÖJNINGAR (+251 % på fyra år)");
  if (RMS.roicF - RMS.waccF < 40) OK.push(`RMS-25 ROIC−WACC +${(RMS.roicF - RMS.waccF).toFixed(1)} pp (under SK Hynix +44,4 — universumets högsta)`);
}
// ═══════════════ GRIND: BN ═══════════════
{
  const mcap = BN.pris * BN.aktierM; // M EUR
  grind("BN-01 mcap-identitet", mcap / 1000, BN.mcapMdr, 0.005);
  grind("BN-02 P/E aktiebas", BN.pris / BN.eps, BN.peF, 0.005);
  grind("BN-03 P/B total EK", mcap / BN.ekTotalM, BN.pbF, 0.005);
  grind("BN-04 P/S", mcap / BN.ttmRevM, BN.psF, 0.005);
  // EV-paritet KRÄVER bred kassa (balansradens 1 864 + korta placeringar ≈ 8 340) + minoritet 80
  const ev = mcap + BN.skuldM - BN.kassaBredM + BN.minorM;
  grind("BN-05 EV mcap+skuld-bredkassa+minority", ev / 1000, BN.evMdr, 0.005);
  grind("BN-06 EV/EBIT (källspridning ≤6 %)", ev / BN.ttmEbitM, BN.evEbitF, 0.06);
  grind("BN-07 bruttomarginal TTM", BN.ttmBruttoM / BN.ttmRevM * 100, BN.bruttoF, 0.005, " %");
  grind("BN-08 EBIT-marginal TTM", BN.ttmEbitM / BN.ttmRevM * 100, BN.ebitF, 0.005, " %");
  // källans netto 7,13 mot IS-replik 7,08 = fönster-not (KDDI/ORA-klassen)
  grind("BN-09 nettomarginal (fönster-not ≤1 %)", BN.ttmNettoM / BN.ttmRevM * 100, BN.nettoF, 0.01, " %");
  grind("BN-10 FCF-marginal", BN.ttmFcfM / BN.ttmRevM * 100, BN.fcfMargF, 0.005, " %");
  grind("BN-11 FCF = OCF+capex", BN.ttmOcfM + BN.ttmCapexM, BN.ttmFcfM, 0.0001);
  grind("BN-12 nettoskuld smal", (BN.skuldM - BN.kassaSmalM) / 1000, 15.563, 0.001, " mdr");
  grind("BN-13 D/E", BN.skuldM / BN.ekTotalM, BN.deF, 0.01);
  grind("BN-14 DPS-yield", BN.dps / BN.pris * 100, BN.dpsYieldF, 0.005, " %");
  // payout: källan 73,47 mellan DPS-bas 74,50 och CF-bas 74,03 — dokumenterad
  grind("BN-15 payout CF-bas", BN.utdelTTMm / BN.ttmNettoM * 100, 74.03, 0.005, " %");
  grind("BN-16 omsCAGR endpoint", (Math.pow(BN.rev[4] / BN.rev[0], 1 / 4) - 1) * 100, BN.omsCAGR * 100, 0.02, " %");
  grind("BN-17 resCAGR endpoint", (Math.pow(BN.res[4] / BN.res[0], 1 / 4) - 1) * 100, BN.resCAGR * 100, 0.02, " %");
  const prognos = (BN.peF / BN.peFwd - 1) * 100;
  grind("BN-18 prognosTillväxt", prognos, 35.17, 0.01, " %");
  grind("BN-19 PEG spår", BN.peF / 35.17, BN.peg, 0.01);
  const marg = BN.bruttoSerie.map((g, i) => g / BN.rev[i] * 100);
  const medel = marg.reduce((a, b) => a + b, 0) / 5;
  const spread = Math.max(...marg) - Math.min(...marg);
  grind("BN-20 moat-brutto-medel", medel, 48.24, 0.005, " %");
  grind("BN-21 moat-brutto-spread", spread, 4.57, 0.02, " pp");
  if (BN.fcf.every(x => x > 0)) OK.push("BN-22 fcfPositivaSenaste5 = 5/5"); else FEL.push("BN-22 fcf-serien ej 5/5 positiv");
  if (BN.tbvM >= 0) FEL.push("BN-23 TBV förväntas NEGATIV (goodwill-kontroll)"); else OK.push(`BN-23 TBV negativ ${BN.tbvM} M — P/TBV n/a, dokumenterad`);
  // FY2022-utdelningen 1 238 < 1 261 = dippen ärligt bokförd (ej fem raka)
  const fyra = BN.utdel.slice(1).every((x, i) => i === 0 || x > BN.utdel[i]);
  if (!fyra) FEL.push("BN-24 utdelningstrenden bruten"); else OK.push("BN-24 utdelningar 1 261→1 238 (dipp)→1 279→1 348→1 379 = FY22-dipp + FYRA RAKA HÖJNINGAR");
}
// ═══════════════ GRIND: RI ═══════════════
{
  const mcap = RI.pris * RI.aktierM; // M EUR
  grind("RI-01 mcap-identitet", mcap / 1000, RI.mcapMdr, 0.001);
  grind("RI-02 P/E aktiebas", RI.pris / RI.eps, RI.peF, 0.005);
  grind("RI-03 P/B total EK", mcap / RI.ekTotalM, RI.pbF, 0.005);
  grind("RI-04 P/S", mcap / RI.ttmRevM, RI.psF, 0.005);
  const ev = mcap + RI.skuldM - RI.kassaM + RI.minorM;
  grind("RI-05 EV mcap+skuld-kassa+minority", ev / 1000, RI.evMdr, 0.005);
  grind("RI-06 EV/EBIT", ev / RI.ttmEbitM, RI.evEbitF, 0.005);
  grind("RI-07 bruttomarginal TTM", RI.ttmBruttoM / RI.ttmRevM * 100, RI.bruttoF, 0.005, " %");
  grind("RI-08 EBIT-marginal TTM", RI.ttmEbitM / RI.ttmRevM * 100, RI.ebitF, 0.005, " %");
  grind("RI-09 nettomarginal TTM", RI.ttmNettoM / RI.ttmRevM * 100, RI.nettoF, 0.005, " %");
  grind("RI-10 FCF-marginal", RI.ttmFcfM / RI.ttmRevM * 100, RI.fcfMargF, 0.005, " %");
  grind("RI-11 FCF = OCF+capex", RI.ttmOcfM + RI.ttmCapexM, RI.ttmFcfM, 0.0001);
  grind("RI-12 nettoskuld", (RI.skuldM - RI.kassaM) / 1000, 10.684, 0.001, " mdr");
  grind("RI-13 D/E", RI.skuldM / RI.ekTotalM, RI.deF, 0.01);
  grind("RI-14 DPS-yield", RI.dps / RI.pris * 100, RI.dpsYieldF, 0.005, " %");
  grind("RI-15 payout CF-bas", RI.utdelFYm / RI.ttmNettoM * 100, RI.payoutF, 0.005, " %");
  grind("RI-16 omsCAGR endpoint", (Math.pow(RI.rev[4] / RI.rev[0], 1 / 4) - 1) * 100, RI.omsCAGR * 100, 0.02, " %");
  grind("RI-17 resCAGR endpoint", (Math.pow(RI.res[4] / RI.res[0], 1 / 4) - 1) * 100, RI.resCAGR * 100, 0.02, " %");
  const prognos = (RI.peF / RI.peFwd - 1) * 100;
  grind("RI-18 prognosTillväxt", prognos, 19.69, 0.01, " %");
  grind("RI-19 PEG spår", RI.peF / 19.69, RI.peg, 0.01);
  const marg = RI.bruttoSerie.map((g, i) => g / RI.rev[i] * 100);
  const medel = marg.reduce((a, b) => a + b, 0) / 5;
  const spread = Math.max(...marg) - Math.min(...marg);
  grind("RI-20 moat-brutto-medel", medel, 59.64, 0.005, " %");
  grind("RI-21 moat-brutto-spread", spread, 2.06, 0.02, " pp");
  if (RI.fcf.every(x => x > 0)) OK.push("RI-22 fcfPositivaSenaste5 = 5/5"); else FEL.push("RI-22 fcf-serien ej 5/5 positiv");
  if (RI.pbF >= 1) FEL.push("RI-23 P/B förväntas UNDER 1 (signaturkontroll)"); else OK.push(`RI-23 P/B ${RI.pbF} = UNDER BOKFÖRT VÄRDE (cellens enda)`);
  const fall = RI.rev[4] < RI.rev[3] && RI.rev[3] < RI.rev[2] && RI.rev[2] < RI.rev[1];
  if (!fall) FEL.push("RI-24 treårsfallet brutet"); else OK.push("RI-24 omsättningen TRE RAKA FALLANDE år (12 137→11 598→10 959→9 404) — spritcykelns nedfas");
  if (RI.altmanF >= 1.5) FEL.push("RI-25 Altman-fält kontroll"); else OK.push(`RI-25 Altman ${RI.altmanF} — cellens lägsta (dokumenterad)`);
}

if (FEL.length) {
  console.error(`\nABORT — ${FEL.length} grinfel, DISKEN RÖRD EJ:`);
  for (const f of FEL) console.error("  ✗ " + f);
  process.exit(1);
}
console.log(`\nGRIND GRÖN — ${OK.length} kontroller 0 fel:`);
for (const o of OK) console.log("  ✓ " + o);

// ═══════════════ RADER (kanonformat; moat decimal OR.PA-konvention; PEG spårkonvention) ═══════════════
const M = 1e6;
const raderNya = [
  {
    ticker: "RMS.PA", namn: "Hermès International", bransch: "konsument", land: "Frankrike", valuta: "EUR",
    kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-21", url: "https://stockanalysis.com/quote/epa/RMS/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/)", paranoid: "EPA-PRIMÄRNOTING i EUR (MC.PA/OR.PA-precedenserna; underlag S&P Global Market Intelligence; close 2026-09-18 17:30 CET): pris 1 331,50 EUR, mcap 139,46 mdr (aktier 104,74 M × 1 331,50 = 139 462 M — 0,00 %; filing-aktier 104,81 M → 139 555, band dokumenterat), 52-v 1 320–2 300 (−42,1 % från toppen, +0,9 % över botten — lyxkorrigeringen), P/E 30,97 (aktiebas 1 331,50÷43,00 EXAKT), fwd 27,98 ⇒ prognosTillväxt +10,65 % (PEG 2,91 spårkonvention; källans PEG 2,84 på 3-års 9,00 % EPS-tillväxt som not), P/B 7,33 (mcap÷totalt EK TTM 19 025 = 7,328 EXAKT; common 19 023 → 7,329; BVPS-väg 1 331,50÷181,62 = 7,331 — tre vägar ett band), P/TBV 7,49 (139 462÷18 610 EXAKT), P/S 8,65 (139 462÷16 131 TTM = 8,645), EV 129,44 mdr (replik mcap+skuld 2 280−kassa 12 310 = 129 432 — 0,006 %; källan bär ej minoritet 26 M, dokumenterat), EV/EBIT 19,06 (replik på TTM-EBIT 6 747 = 19,18 — källspridning 0,65 %, källans EBIT-bas skiljer lätt), EV/EBITDA 17,34, bruttomarginal 71,34 % TTM (replik 11 508/16 131 EXAKT; femårsserie 71,28/70,79/72,29/70,26/71,10 — medel 71,14 spread 2,03 pp), EBIT 41,83 % (replik EXAKT — universumets högsta EBIT-marginal bland icke-programvarubolag), netto 28,00 % (replik EXAKT), FCF-marginal 31,38 % (replik 5 062/16 131 EXAKT — cellens högsta), fcfYield 3,63 % (replik 5 062/139 462), ROE 25,45 % ROA 18,09 %, ROIC 50,14 mot WACC 9,62 (+40,5 pp — universumets näst högsta dokumenterade efter SK Hynix +44,4; kapitalomsättnings-pedagogiken: nästan inget kapital behövs), skuld/EK 0,12 (skulden är i princip ENBART leasingskuld 2 280 M — konventionell upplåning saknas i panelen, dokumenterat), räntetäckning 116,33, Altman 24,03 (universumets högsta dokumenterade klass — CB/AMBU-ligan), Piotroski 6, effektiv skatt 33,16 % (Frankrikes surcharge-world), beta 1,00 (5-års), NETTKASSA 10,03 mdr (12 310−2 280 EXAKT; FY2025 9 927), utdelning 18,00 EUR (1,35 %; replik 18/1 331,50 = 1,352 EXAKT) DPS-trappa 485→844→1 376→1 595→1 705 M betalda = FEM RAKA HÖJNINGAR (+251 % på fyra år; TTM 1 916), payout 41,86 % (DPS-bas 18/43,00 EXAKT; CF-bas 1 916/4 516 = 42,4 — källans bas dokumenterad), återköp små/episodiska 8-162 M/år (buyback yield −0,03 % = lätt utspädning), omsättning 8 982→16 002 M FY2021-25 (+15,54 %/år endpoint — cellens starkaste organiska tillväxt), netto 2 445→4 603→4 524 M (CAGR +16,62 %; FY2025 −1,7 % = första platån), EPS 23,30→43,07, EK 9 412→18 846 M (fördubblad på fyra år — vinsterna stannar i balansen), FCF 3 002→4 666 M 5/5 positiva, OCF TTM 5 743 + capex −681 = 5 062 (capex 4,2 % av intäkt = butiksfläckens låga kapitalbehov mot MAERSK-klassen), institutioner 9,53 % LÅGT (familjen Hermès kontrollblock via holdingar — H51-strukturen, allmän faktakunskap som not, AR/ORA-klassen; fältet bär bara den fria flykten), insiders 0,08 %, analytiker Buy PT 1 835,27 (+37,7 %, 22 st), 27 107 anställda, grundat 1837 (sadelmakarverkstaden — allmän faktakunskap som not), nästa rapp enligt källan 2027-02-11 (årsdag; Q3-interim väntas okt-2026 enligt kvartalsrytmen — källfältet bår årsdatumet); FY KALENDERÅR (slutårsetikett); TTM jun-26: rev 16 131 · brutto 11 508 · EBIT 6 747 · netto 4 516" }],
    hamtat: "2026-09-21", pris: 1331.5, marknadsKapitalMdr: 139.46,
    tillvaxt: { omsattningCAGR5ar: 0.1554, resultatCAGR5ar: 0.1662, omsattningTillvaxtTTM: 0.027, prognosTillvaxt: 0.1065 },
    lonksamhet: { roe: 0.2545, roic: 0.5014, bruttoMarginal: 0.7134, ebitMarginal: 0.4183, nettoMarginal: 0.28, fcfMarginal: 0.3138 },
    stabilitet: { skuldEgenkapital: 0.12, rantaTackning: 116.33, fcfPositivaSenaste5: 5, kassaManaderBurnRate: null, nyemissionerSenaste5ar: null },
    aterkop: { senasteArMdr: 1.705, andelUtestande: 0.0953, insiderkopSenaste6man: null },
    moat: { bruttoMarginalMedel5ar: 0.7114, bruttoMarginalSpread5ar: 0.0203, roeMedel5ar: null },
    vardering: { pe: 30.97, pb: 7.33, evEbit: 19.06, peg: 2.91, fcfYield: 0.0363, egenKapitalMultipl: 7.33 },
    golv: { typ: "osatt", vardePerAktie: null, marginal: null },
    serier: { ar: ["2021", "2022", "2023", "2024", "2025"], omsattning: RMS.rev.map(x => x * M), resultat: RMS.res.map(x => x * M), egetKapital: RMS.ek.map(x => x * M), fcf: RMS.fcf.map(x => x * M) },
    notering: "FRANKRIKE/KONSUMENT 2→5 — MATTAN NÅS: LANDSIDAN /dataset/konsument/frankrike FÖDS DATA-DRIVET (frankrique-modulen i land.ts sedan omg21 är bransch-dynamisk — src orörd, Vonovia-precedensen). SIGNATURTAL — KVALITETENS TAK: EBIT 41,8 % + FCF-marginal 31,4 % + ROIC 50,1 mot WACC 9,6 (+40,5 pp, näst efter SK Hynix) + Altman 24,0 + nettkassa 10,0 mdr MEDAN skulden i princip är enbart leasing (0 konventionell upplåning) = balansräkningens renaste ark i universumet — P/E 30,97 är priset för den konsistensen (mot L'Oréal 31,9: tvillingmultiplen, två vägar dit). Utdelningstrappan +251 % på fyra år med payout 42 % = utrymme kvar. Institutioner 9,53 % — familjeholdingens kontrollblock (AR/ORA-klassen). FIFO: årsrapp 2027-02-11 (Q3-interim ~okt-2026).",
  },
  {
    ticker: "BN.PA", namn: "Danone", bransch: "konsument", land: "Frankrike", valuta: "EUR",
    kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-21", url: "https://stockanalysis.com/quote/epa/BN/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/)", paranoid: "EPA-PRIMÄRNOTING i EUR (MC.PA/OR.PA/TTE.PA-precedenserna; S&P-underlag; close 2026-09-18 −1,37 %): pris 60,54 EUR, mcap 38,95 mdr (aktier 643,30 M × 60,54 = 38 943 M — 0,02 %), 52-v 60,02–80,14 (−24,9 % från toppen, +0,9 % över botten), P/E 20,05 (aktiebas 60,54÷3,02 EXAKT), fwd 14,83 ⇒ prognosTillväxt +35,17 % (vändningsprognos; PEG 0,57 spårkonvention; källans PEG 2,71 på 3-års 6,03 % EPS-tillväxt som not), P/B 2,20 (mcap÷totalt EK TTM 17 689 = 2,201 EXAKT; BVPS-väg 60,54÷27,37 = 2,212 nära), P/TBV n/a (TBV NEGATIV −6 238 M — goodwill/intangibla efter förvärvsvågorna; balansstrukturen dokumenterad), P/S 1,42 (38 943÷27 482 TTM = 1,417), EV 48,11 mdr (replik mcap+skuld 17 427−BRED kassa 8 340+minoritet 80 = 48 110 EXAKT — källans EV bär kassadefinitionen inkl korta placeringar; balansradens smala kassa 1 864 + placeringar ≈ 8 340 dokumenterat, nettoskuld smal 15,6 mdr mot bred 9,1 mdr), EV/EBIT 12,33 (replik på TTM-EBIT 3 711 = 12,96 — källspridning 5,1 %, källans EBIT-bas ~3 902, dokumenterad), EV/EBITDA 9,76, bruttomarginal 50,04 % TTM (replik 13 751/27 482 EXAKT; femårsserie 47,43/46,05/47,38/49,70/50,62 — medel 48,24 spread 4,57 pp), EBIT 13,50 % (replik EXAKT), netto 7,13 % (replik 1 945/27 482 = 7,08 — fönster-not KDDI/ORA-klassen, 0,7 %), FCF-marginal 8,81 % (replik 2 422/27 482 EXAKT), fcfYield 6,22 % (replik 2 422/38 943), ROE 12,19 % ROA 5,02 %, ROIC 9,96 mot WACC 4,30 (+5,7 pp), skuld/EK 0,99 (17 427/17 689 = 0,985), räntetäckning 6,99, Altman 2,2 (TBV-negativ-klassen), Piotroski 6, effektiv skatt 28,13 %, beta 0,18 (5-års — universumets lägsta dokumenterade klass, VWA/GSK-ligan), nettoskuld bred 9,09 mdr TTM, utdelning 2,25 EUR (3,72 %; replik 2,25/60,54 = 3,717 EXAKT) — utdelningar betalda 1 261→1 238 (FY2022-dippen)→1 279→1 348→1 379 M = FYRA RAKA HÖJNINGAR efter dippen (TTM 1 440), payout 73,47 % källan (repliker: DPS-bas 74,50 · CF-bas 1 440/1 945 = 74,03 — källspridning dokumenterad), återköp EPISODISKA: FY2021 801 M · FY2022-24 noll · FY2025 486 M · TTM 294 M (buyback yield 0,07 %), omsättning 24 281→27 661→27 619→27 376→27 283 M FY2021-25 (+2,96 %/år endpoint — platåbolaget: fyra år i 27-korridoren), netto 1 898→946→873→2 017→1 817 M (CAGR −1,09 %; FY2022-23-dipparna = källpanelens rörelse, orsaksspekulation bär ej), EPS 2,94→1,48→1,36→3,13→2,82, EK 17 375→16 969 M (plan), FCF 2 431→2 724 M 5/5 positiva (OCF 3 779 + capex −1 055 FY2025), institutioner 55,43 % insiders 0,01 %, analytiker Buy PT 79,93 (+32,0 %, 22 st), 88 670 anställda (cellens största arbetsgivarpanel), grundat 1919 (Barcelona-yoghurtstarten — allmän faktakunskap som not), nästa rapp 2026-10-26 (Q3); FY KALENDERÅR (slutårsetikett); TTM jun-26: rev 27 482 · brutto 13 751 · EBIT 3 711 · netto 1 945" }],
    hamtat: "2026-09-21", pris: 60.54, marknadsKapitalMdr: 38.95,
    tillvaxt: { omsattningCAGR5ar: 0.0295, resultatCAGR5ar: -0.0109, omsattningTillvaxtTTM: 0.005, prognosTillvaxt: 0.3517 },
    lonksamhet: { roe: 0.1219, roic: 0.0996, bruttoMarginal: 0.5004, ebitMarginal: 0.135, nettoMarginal: 0.0713, fcfMarginal: 0.0881 },
    stabilitet: { skuldEgenkapital: 0.99, rantaTackning: 6.99, fcfPositivaSenaste5: 5, kassaManaderBurnRate: null, nyemissionerSenaste5ar: null },
    aterkop: { senasteArMdr: 1.379, andelUtestande: 0.5543, insiderkopSenaste6man: null },
    moat: { bruttoMarginalMedel5ar: 0.4824, bruttoMarginalSpread5ar: 0.0457, roeMedel5ar: null },
    vardering: { pe: 20.05, pb: 2.2, evEbit: 12.33, peg: 0.57, fcfYield: 0.0622, egenKapitalMultipl: 2.2 },
    golv: { typ: "osatt", vardePerAktie: null, marginal: null },
    serier: { ar: ["2021", "2022", "2023", "2024", "2025"], omsattning: BN.rev.map(x => x * M), resultat: BN.res.map(x => x * M), egetKapital: BN.ek.map(x => x * M), fcf: BN.fcf.map(x => x * M) },
    notering: "FRANKRIKE/KONSUMENT 2→5 — MATTAN NÅS: LANDSIDAN FÖDS (frankrique-modulen data-drivet). SIGNATURTAL — STAPLES-JÄTTENS PLATÅ: fyra år i 27-mdr-korridoren (+2,96 %/år CAGR men TTM +0,5 %) med TBV NEGATIVT −6,2 mdr (förvärvsgoodwill mot Hermès självgjorda EK — cellens organiska/förvärvade pedagogik) och beta 0,18 (universumets lägsta klass). Utdelningsdippen FY2022 + fyra raka höjningar = ärliga serien. PrognosTillväxt +35 % = vändningsförväntan bakom fwd 14,8. FIFO: Q3 2026-10-26.",
  },
  {
    ticker: "RI.PA", namn: "Pernod Ricard", bransch: "konsument", land: "Frankrike", valuta: "EUR",
    kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-21", url: "https://stockanalysis.com/quote/epa/RI/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/)", paranoid: "EPA-PRIMÄRNOTING i EUR (MC.PA/OR.PA-precedenserna; S&P-underlag; close 2026-09-18 −1,13 %): pris 59,44 EUR, mcap 14,96 mdr (aktier 251,68 M × 59,44 = 14 959,8 M — 0,00 %, universumets tightaste klass), 52-v 58,60–90,54 (−34,3 % från toppen, +1,4 % över botten), P/E 12,46 (aktiebas 59,44÷4,77 EXAKT — cellens billigaste), fwd 10,41 ⇒ prognosTillväxt +19,69 % (PEG 0,63 spårkonvention; källans PEG 5,24 på 3-års 1,47 %/rev-tillväxt som not), P/B 0,90 = UNDER BOKFÖRT VÄRDE (mcap÷totalt EK 16 540 = 0,9045 EXAKT; common 15 500 → 0,965; BVPS-väg 59,44÷61,59 = 0,965 — källans fält på total-EK), P/TBV n/a (TBV NEGATIV −2 500 M — goodwill-buren), P/S 1,59 (14 960÷9 404 = 1,591 EXAKT), EV 26,68 mdr (replik mcap+skuld 12 677−kassa 1 993+minoritet 1 040 = 26 684 — 0,015 %; minoriteten bär källan här mot RMS som ej — dokumenterat), EV/EBIT 11,04 (replik 26 684/2 417 EXAKT), EV/EBITDA 9,66, bruttomarginal 58,43 % FY2026 (replik 5 495/9 404 EXAKT; femårsserie 60,49/59,70/60,14/59,46/58,43 — medel 59,64 spread 2,06 pp: SPRITENS SMALA MOAT-KURVA — marginalen håller medan volymen faller, prissättningsmakten dokumenterad), EBIT 25,70 % (replik EXAKT), netto 12,79 % (replik EXAKT), FCF-marginal 12,63 % (replik 1 188/9 404 EXAKT), fcfYield 7,94 % (replik 1 188/14 960 — cellens högsta), ROE 7,56 % ROA 4,06 %, ROIC 6,39 mot WACC 5,00 (+1,4 pp — TRÅNG moat-marginal just nu: cykelbotten pressar avkastningen under cellens arketyper), skuld/EK 0,77 (12 677/16 540 = 0,766), räntetäckning 4,89, Altman 1,32 (cellens lägsta — TBV-negativ + skuldbälte), Piotroski 5, effektiv skatt 28,01 %, beta 0,47 (5-års), nettoskuld 10,68 mdr (12 677−1 993 EXAKT), utdelning 4,70 EUR (7,91 % — cellens högsta yield; replik 4,70/59,44 = 7,907 EXAKT) med PAYOUT 101,91 % CF-bas (1 226/1 203 EXAKT — utdelningen ÖVERSTIGER vinsten: spritcykelns signatur, DPS-bas 98,5 som not) — utdelningar 826→1 072→1 208→1 201→1 226 M (platt på toppnivå medan EBIT faller 3 337→2 417), återköp KOLLAPSAR med cykeln: 813→786→334→11→10 M (FY2022→FY2026; buyback yield −0,13 %), omsättning 10 701→12 137→11 598→10 959→9 404 M FY2022-26 (CAGR −3,18 %/år endpoint; TRE RAKA FALLANDE ÅR −4,4/−5,5/−14,2 % — Kina/USA-spritsvagcykeln, källpanelen ger siffrorna), netto 1 996→1 203 M (CAGR −11,88 %), EPS 7,69→4,77, EK 16 253→16 540 M (plan trots fallet = utdelningen äter vinsten), FCF 1 788→1 188 M 5/5 positiva (OCY 1 579 + capex −391 FY2026 — capex nedskalad till 4,2 % av intäkt i nedfasen), minority 1 040 M = 6,3 % av EK (JV-strukturer), institutioner 52,47 % insiders 0,69 %, analytiker Hold PT 81,76 (+37,6 %, 20 st), 16 013 anställda, grundat 1975 (Pernod+Ricard-fusionen — allmän faktakunskap som not), senaste rapp 2026-08-27 (FY2026 års); SEMI-ÅRSRYTM (H1 FY2027 väntas ~2027-02 — källan anger inget nästa datum, dokumenterat); FY JULI–JUNI slutårsetikett (HINDUNILVR-konventionen); TTM == FY2026: rev 9 404 · brutto 5 495 · EBIT 2 417 · netto 1 203" }],
    hamtat: "2026-09-21", pris: 59.44, marknadsKapitalMdr: 14.96,
    tillvaxt: { omsattningCAGR5ar: -0.0318, resultatCAGR5ar: -0.1188, omsattningTillvaxtTTM: -0.1419, prognosTillvaxt: 0.1969 },
    lonksamhet: { roe: 0.0756, roic: 0.0639, bruttoMarginal: 0.5843, ebitMarginal: 0.257, nettoMarginal: 0.1279, fcfMarginal: 0.1263 },
    stabilitet: { skuldEgenkapital: 0.77, rantaTackning: 4.89, fcfPositivaSenaste5: 5, kassaManaderBurnRate: null, nyemissionerSenaste5ar: null },
    aterkop: { senasteArMdr: 1.226, andelUtestande: 0.5247, insiderkopSenaste6man: null },
    moat: { bruttoMarginalMedel5ar: 0.5964, bruttoMarginalSpread5ar: 0.0206, roeMedel5ar: null },
    vardering: { pe: 12.46, pb: 0.9, evEbit: 11.04, peg: 0.63, fcfYield: 0.0794, egenKapitalMultipl: 0.9 },
    golv: { typ: "osatt", vardePerAktie: null, marginal: null },
    serier: { ar: ["2022", "2023", "2024", "2025", "2026"], omsattning: RI.rev.map(x => x * M), resultat: RI.res.map(x => x * M), egetKapital: RI.ek.map(x => x * M), fcf: RI.fcf.map(x => x * M) },
    notering: "FRANKRIKE/KONSUMENT 2→5 — MATTAN NÅS: LANDSIDAN FÖDS (frankrique-modulen data-drivet). SIGNATURTAL — CYKELRABATTENS ANATOMI: P/B 0,90 (cellens enda under bok) + P/E 12,46 + fcfYield 7,94 % (cellens högsta) mot utdelning 7,91 % med PAYOUT 101,9 % CF-bas — marknaden prissätter spritnedgången medan bruttomarginalen håller 58-60 % (spread 2,06 pp = prissättningsmakten lever, volymen faller 3 år rakt −4,4/−5,5/−14,2 %). Återköpen kollapsade 813→10 M = cykelns kapitaldisciplin-spegel. Altman 1,32 cellens lägsta. ROIC 6,4 mot WACC 5,0 (+1,4 pp) — moat-marginalen juste just nu. FIFO: H1 FY2027 ~2027-02 (semi-årsrytm).",
  },
];

mkdirSync("/tmp/s2u3o25", { recursive: true });
writeFileSync("/tmp/s2u3o25/rader-nya.json", JSON.stringify(raderNya, null, 2));
console.log(`\nSKREV /tmp/s2u3o25/rader-nya.json — 3 rader (${raderNya.map(r => r.ticker).join(", ")}), väntar på append.`);
