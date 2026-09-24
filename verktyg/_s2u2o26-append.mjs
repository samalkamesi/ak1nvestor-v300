#!/usr/bin/env node
/**
 * _s2u2o26-append.mjs — AUTO-S2 omgång 26 u2: DSY.PA + CAP.PA in i
 * bolagsunivers.json. Frankrike/teknik 0→2 — tillsammans med u1:s AI.PA
 * (Frankrike/material, omg26) når Frankrike ALLA TIO grenarna.
 * Aritmetikgrind med ABORT FÖRE skrivning (omg22-25-mönstret).
 * Race-tolerant: diskens faktiska läge accepteras (syskon levererar
 * parallellt); endast krav = mina tickers nya + gamla rader identiska.
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const HAMTAT = "2026-09-21";
const AS_OF = "intradag 2026-09-21 ~11:00 CET (föregående close 2026-09-18); SA-sidorna S&P GMI, uppdaterade 2026-07-23/08-03";

// ── Källpaket: DSY.PA Dassault Systèmes (EPA-primär, EUR, kalenderår) ────────
const DSY = {
  ticker: "DSY.PA", namn: "Dassault Systèmes SE", bransch: "teknik", land: "Frankrike",
  valuta: "EUR", hamtat: HAMTAT,
  pris: 20.85, prevClose: 20.56, mcapMdr: 27.22, aktierM: 1324, aktierFY21M: 1310,
  peFalt: 21.13, peFwd: 15.02, epsVisad: 0.97, pegKalla: 2.90,
  psFalt: 4.39, pbFalt: 2.92, ptbv: 11.20, pFcf: 17.12, bvps: 7.04,
  evMdr: 24.94, evEbit: 16.05, evEbitda: 14.10, evEarn: 18.84, evSales: 4.02,
  bruttoTTM: 5.228, ebitTTM: 1.554, nettoTTM: 1.324, revTTM: 6.206, ebitdaTTM: 1.68,
  roe: 0.1509, roic: 0.1845, wacc: 0.0661,
  bruttoMarg: 0.8424, ebitMarg: 0.2504, nettoMarg: 0.2133, fcfMarg: 0.2562,
  ocfTTM: 1.720, capexTTM: 0.1295, fcfTTM: 1.590,
  kassa: 5.660, skuld: 3.378, nettokassa: 2.282, ekTotal: 9.323, ekCommon: 9.318,
  minoritet: 0.0054,
  skuldEk: 0.36, rantack: 34.69,
  dps: 0.27, yieldFalt: 0.0130, payoutFalt: 0.2701, dpsTillvaxt1Y: 0.0385,
  buybackY: 0.0010, shareholderY: 0.0141,
  altman: 4.35, piotroski: 6, beta: 0.55, skatt: 0.1763,
  institutioner: 0.2582, insiders: 0.0900,
  analys: "Hold", analysAntal: 20, pt: 23.71,
  topp52: 30.36, botten52: 15.83,
  anstallda: 25000, grundat: 1981, rapp: "2026-10-28",
  serirAr: ["2021", "2022", "2023", "2024", "2025"],
  oms: [4.860, 5.665, 5.951, 6.214, 6.236],
  res: [0.7737, 0.9315, 1.051, 1.200, 1.196],
  bruttoSerie: [4.070, 4.746, 4.980, 5.197, 5.221],
  ekSerie: [6.211, 7.325, 7.846, 9.081, 8.798], // total-EK (common 6.197→8.793)
  fcfSerie: [1.509, 1.393, 1.420, 1.466, 1.469],
  ocfSerie: [1.613, 1.525, 1.565, 1.660, 1.630],
  capexSerie: [0.1037, 0.1323, 0.1453, 0.1934, 0.1605],
  utdSerie: [0.1471, 0.2235, 0.2762, 0.3027, 0.3426],
  buybackSerie: [0.2832, 0.6396, 0.3754, 0.374, 0.3403],
  dpsSerie: [0.112, 0.17, 0.21, 0.23, 0.26], // 2021-2025 utdelningar (2026: 0.27)
};

// ── Källpaket: CAP.PA Capgemini (EPA-primär, EUR, kalenderår) ────────────────
const CAP = {
  ticker: "CAP.PA", namn: "Capgemini SE", bransch: "teknik", land: "Frankrike",
  valuta: "EUR", hamtat: HAMTAT,
  pris: 107.05, prevClose: 104.35, mcapMdr: 17.71, aktierM: 169.74, aktierTTM_M: 168.34, aktierFY21M: 172,
  peFalt: 13.25, peFwd: 7.90, epsVisad: 7.88, pegKalla: 0.93,
  psFalt: 0.76, pbFalt: 1.52, pFcf: 8.09, bvps: 69.00,
  evMdr: 25.64, evEbit: 9.88, evEbitda: 7.64, evEarn: 18.65, evSales: 1.09,
  bruttoTTM: 6.290, ebitTTM: 2.626, nettoTTM: 1.375, revTTM: 23.440,
  roe: 0.1220, roic: 0.0947, wacc: 0.0572,
  bruttoMarg: 0.2683, ebitMarg: 0.1120, nettoMarg: 0.0587, fcfMarg: 0.0934,
  ocfTTM: 2.469, capexTTM: 0.279, fcfTTM: 2.190,
  kassa: 2.279, skuld: 10.186, nettoskuld: 7.907, ekTotal: 11.640, ekCommon: 11.615,
  minoritet: 0.025,
  skuldEk: 0.88, rantack: 9.69,
  dps: 3.40, yieldFalt: 0.0318, payoutFalt: 0.4145,
  buybackY: 0.0073, shareholderY: 0.0393,
  altman: 2.2, piotroski: 5, beta: 0.67, skatt: 0.2954,
  institutioner: 0.5693, insiders: 0.0021,
  analys: "Buy", analysAntal: 17, pt: 140.51,
  topp52: 153.05, botten52: 85.62,
  anstallda: 417610, grundat: 1967, rapp: "2027-02-16",
  serirAr: ["2021", "2022", "2023", "2024", "2025"],
  oms: [18.160, 21.995, 22.522, 22.096, 22.465],
  res: [1.157, 1.547, 1.663, 1.671, 1.601],
  bruttoSerie: [4.792, 5.832, 6.048, 6.052, 6.075],
  ekSerie: [8.479, 9.743, 10.473, 11.797, 11.672], // total-EK (common 8.467→11.648)
  fcfSerie: [2.315, 2.227, 2.266, 2.211, 2.195],
  ocfSerie: [2.581, 2.517, 2.525, 2.526, 2.482],
  capexSerie: [0.266, 0.290, 0.259, 0.315, 0.287],
  utdSerie: [0.329, 0.409, 0.559, 0.580, 0.578],
  buybackSerie: [0.197, 0.826, 0, 0.989, 0.543],
  dpsSerie: [1.95, 2.40, 3.25, 3.40, 3.40], // 2021-2025 (2026: 3.40 tredje plata)
  skuldFY24: 6.097, skuldFY25: 9.458, goodwillFY24: 12.343, goodwillFY25: 14.858,
  acquisitionsFY25: 3.775, netDebtIssuedFY25: 2.651,
};

// ── Aritmetikgrind (ABORT vid rött; inget skrivs förrån alla gröna) ──────────
const rok = [];
let n = 0;
const K = (namn, tankt, vantat, tol) => {
  n++;
  const avvik = typeof tankt === "number" && typeof vantat === "number" ? Math.abs(tankt - vantat) : Infinity;
  const gron = avvik <= tol;
  if (!gron) rok.push(`${namn}: tänkt ${tankt} mot väntat ${vantat} (avvik ${avvik?.toFixed?.(6)}, tol ${tol})`);
  return gron;
};
const cagr = (f, s) => Math.pow(s / f, 0.25) - 1;
const cagr4 = (f, s) => Math.pow(s / f, 0.25) - 1; // 5 värden = 4 intervall

// DSY-kontroller
K("DSY-1 omsCAGR", cagr4(DSY.oms[0], DSY.oms[4]), 0.0643, 0.0005);
K("DSY-2 resCAGR (fem raka stigande nettoår)", cagr4(DSY.res[0], DSY.res[4]), 0.1151, 0.0005);
K("DSY-3 prognosTillväxt TTE", DSY.peFalt / DSY.peFwd - 1, 0.40679, 0.001);
K("DSY-4 PEG spårkonvention", DSY.peFalt / ((DSY.peFalt / DSY.peFwd - 1) * 100), 0.5196, 0.005);
K("DSY-5 PS-replik", DSY.mcapMdr / DSY.revTTM, 4.3864, 0.005);
K("DSY-6 P/B-fält = mcap/EK-total", DSY.mcapMdr / DSY.ekTotal, 2.9197, 0.005);
K("DSY-7 P/E-replikband (EPS-visad 0,97 ⇒ 21,49 · netto/aktier 1,00 ⇒ 20,56; fält 21,13 inom)", DSY.peFalt > 20.4 && DSY.peFalt < 21.6 ? DSY.peFalt : 0, DSY.peFalt, 0.5);
K("DSY-8 EV-replik mcap − NETTOKASSA (kassabolaget)", DSY.mcapMdr - DSY.nettokassa, 24.94, 0.02);
K("DSY-9 EV/EBIT-replik", DSY.evMdr / DSY.ebitTTM, 16.051, 0.01);
K("DSY-10 EV/Earnings-replik", DSY.evMdr / DSY.nettoTTM, 18.837, 0.01);
K("DSY-11 bruttomarginal TTM", DSY.bruttoTTM / DSY.revTTM, 0.84241, 0.0005);
K("DSY-12 EBIT-marginal TTM", DSY.ebitTTM / DSY.revTTM, 0.25040, 0.0005);
K("DSY-13 nettomarginal TTM", DSY.nettoTTM / DSY.revTTM, 0.21334, 0.0005);
K("DSY-14 FCF-marginal TTM", DSY.fcfTTM / DSY.revTTM, 0.25620, 0.0005);
K("DSY-15 FCF = OCF − capex", DSY.ocfTTM - DSY.capexTTM, 1.5905, 0.001);
K("DSY-16 direktavkastning", DSY.dps / DSY.pris, 0.012950, 0.00005);
K("DSY-17 skuld/EK", DSY.skuld / DSY.ekTotal, 0.36237, 0.002);
K("DSY-18 NETTOKASSA = kassa − skuld", DSY.kassa - DSY.skuld, 2.282, 0.001);
K("DSY-19 fcfYield", DSY.fcfTTM / DSY.mcapMdr, 0.058412, 0.0005);
K("DSY-20 aktiebas FY21→TTM (utspädning via medarbetarprogram)", DSY.aktierM / DSY.aktierFY21M - 1, 0.01069, 0.0005);
K("DSY-21 BVPS-replik common-bas (M €/M aktier)", DSY.ekCommon * 1000 / DSY.aktierM, 7.0377, 0.005);
K("DSY-22 bruttomarginal-medel 5 år", DSY.bruttoSerie.reduce((s, g, i) => s + g / DSY.oms[i], 0) / 5, 0.83714, 0.0005);
K("DSY-23 brutto-spread 5 år (UNIVERSUMETS SMALASTE moat-kurva)", Math.max(...DSY.bruttoSerie.map((g, i) => g / DSY.oms[i])) - Math.min(...DSY.bruttoSerie.map((g, i) => g / DSY.oms[i])), 0.00171, 0.0003);
K("DSY-24 utdelningstrappa stigande", DSY.dpsSerie.every((d, i, a) => i === 0 || d > a[i - 1]) && DSY.dps > DSY.dpsSerie[4] ? 1 : 0, 1, 0);
K("DSY-25 DPS×aktier run-rate = CF-ytan (M €)", DSY.dps * DSY.aktierM, 357.48, 0.1);
K("DSY-26 ROIC−WACC", DSY.roic - DSY.wacc, 0.1184, 0.0005);
K("DSY-27 toppavstånd 52-v", DSY.pris / DSY.topp52 - 1, -0.31324, 0.001);
K("DSY-28 netto>0 Sony-grön", DSY.nettoTTM > 0 ? 1 : 0, 1, 0);
K("DSY-29 kapex/OCF (kapitallätta licensverktyget)", DSY.capexTTM / DSY.ocfTTM, 0.0753, 0.001);
K("DSY-30 TTM/FY2025-omsättning", DSY.revTTM / DSY.oms[4] - 1, -0.00481, 0.0005);

// CAP-kontroller
K("CAP-1 omsCAGR", cagr4(CAP.oms[0], CAP.oms[4]), 0.0548, 0.0005);
K("CAP-2 resCAGR", cagr4(CAP.res[0], CAP.res[4]), 0.0847, 0.0005);
K("CAP-3 prognosTillväxt TTE (TTM nedtryckt, fwd stark)", CAP.peFalt / CAP.peFwd - 1, 0.67722, 0.001);
K("CAP-4 PEG spårkonvention", CAP.peFalt / ((CAP.peFalt / CAP.peFwd - 1) * 100), 0.1957, 0.005);
K("CAP-5 PS-replik", CAP.mcapMdr / CAP.revTTM, 0.75554, 0.005);
K("CAP-6 P/B-fält = mcap/EK-total", CAP.mcapMdr / CAP.ekTotal, 1.5215, 0.005);
K("CAP-7 P/E-replikband (EPS-visad 7,88 ⇒ 13,58 · netto/aktier 8,10-8,17 ⇒ 13,1-13,2; fält 13,25 inom)", CAP.peFalt > 13.0 && CAP.peFalt < 13.65 ? CAP.peFalt : 0, CAP.peFalt, 0.5);
K("CAP-8 EV-replik mcap + nettoskuld", CAP.mcapMdr + CAP.nettoskuld, 25.617, 0.03);
K("CAP-9 EV/EBIT-replik (källans EBIT-bas 2,595 — spridning 1,2 % dokumenterad)", CAP.evMdr / CAP.ebitTTM, 9.7657, 0.011);
K("CAP-10 EV/Earnings-replik", CAP.evMdr / CAP.nettoTTM, 18.647, 0.01);
K("CAP-11 bruttomarginal TTM", CAP.bruttoTTM / CAP.revTTM, 0.26826, 0.0005);
K("CAP-12 EBIT-marginal TTM", CAP.ebitTTM / CAP.revTTM, 0.11203, 0.0005);
K("CAP-13 nettomarginal TTM", CAP.nettoTTM / CAP.revTTM, 0.05866, 0.0005);
K("CAP-14 FCF-marginal TTM", CAP.fcfTTM / CAP.revTTM, 0.09343, 0.0005);
K("CAP-15 FCF = OCF − capex", CAP.ocfTTM - CAP.capexTTM, 2.190, 0.001);
K("CAP-16 direktavkastning", CAP.dps / CAP.pris, 0.031762, 0.00005);
K("CAP-17 skuld/EK", CAP.skuld / CAP.ekTotal, 0.87526, 0.002);
K("CAP-18 nettoskuld = skuld − kassa", CAP.skuld - CAP.kassa, 7.907, 0.001);
K("CAP-19 fcfYield", CAP.fcfTTM / CAP.mcapMdr, 0.12366, 0.0005);
K("CAP-20 aktiebas FY21→TTM MINSKAR (återköpsmaskinen)", CAP.aktierTTM_M / CAP.aktierFY21M - 1, -0.02128, 0.0005);
K("CAP-21 BVPS-replik common-bas TTM (M €/M aktier)", CAP.ekCommon * 1000 / CAP.aktierTTM_M, 69.004, 0.05);
K("CAP-22 bruttomarginal-medel 5 år", CAP.bruttoSerie.reduce((s, g, i) => s + g / CAP.oms[i], 0) / 5, 0.26836, 0.0005);
K("CAP-23 brutto-spread 5 år", Math.max(...CAP.bruttoSerie.map((g, i) => g / CAP.oms[i])) - Math.min(...CAP.bruttoSerie.map((g, i) => g / CAP.oms[i])), 0.01002, 0.0005);
K("CAP-24 utdelningstrappa: 3 steg + TRE PLATTA", CAP.dpsSerie[0] < CAP.dpsSerie[1] && CAP.dpsSerie[1] < CAP.dpsSerie[2] && CAP.dpsSerie[2] < CAP.dpsSerie[3] && CAP.dpsSerie[3] === CAP.dpsSerie[4] && CAP.dps === 3.40 ? 1 : 0, 1, 0);
K("CAP-25 DPS×aktier run-rate = CF-ytan (M €)", CAP.dps * CAP.aktierM, 577.116, 0.2);
K("CAP-26 ROIC−WACC", CAP.roic - CAP.wacc, 0.0375, 0.0005);
K("CAP-27 toppavstånd 52-v", CAP.pris / CAP.topp52 - 1, -0.30055, 0.001);
K("CAP-28 netto>0 Sony-grön", CAP.nettoTTM > 0 ? 1 : 0, 1, 0);
K("CAP-29 WNS-steget: skuld +55 % FY2025", CAP.skuldFY25 / CAP.skuldFY24, 1.5513, 0.002);
K("CAP-30 WNS-steget: goodwill +2 515 M", CAP.goodwillFY25 - CAP.goodwillFY24, 2.515, 0.002);
K("CAP-31 WNS-finansieringen: acquisitions 3 775 ≈ net debt issued 2 651 + kassa 1 124 (dok.)", CAP.acquisitionsFY25 - CAP.netDebtIssuedFY25, 1.124, 0.5);
K("CAP-32 TTM/FY2025-omsättning (WNS i toppen)", CAP.revTTM / CAP.oms[4] - 1, 0.04337, 0.0005);
K("CAP-33 shareholder yield summa", CAP.yieldFalt + CAP.buybackY, 0.0391, 0.0005);

console.log(`ARITMETIKGRIND: ${n - rok.length}/${n} GRÖNA`);
if (rok.length) {
  console.error("ABORT — röda kontroller (filen orörd):");
  for (const r of rok) console.error("  RÖD " + r);
  process.exit(1);
}

// Härledda fält
const dsyOms = cagr4(DSY.oms[0], DSY.oms[4]);
const dsyRes = cagr4(DSY.res[0], DSY.res[4]);
const dsyProg = DSY.peFalt / DSY.peFwd - 1;
const capOms = cagr4(CAP.oms[0], CAP.oms[4]);
const capRes = cagr4(CAP.res[0], CAP.res[4]);
const capProg = CAP.peFalt / CAP.peFwd - 1;

// ── Objekt (skrivs endast efter grön grind) ─────────────────────────────────
const dsyObj = {
  ticker: DSY.ticker, namn: DSY.namn, bransch: DSY.bransch, land: DSY.land, valuta: DSY.valuta,
  kallor: [{
    namn: "StockAnalysis",
    hamtat: HAMTAT,
    url: "https://stockanalysis.com/quote/epa/DSY/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/ + /dividend/)",
    paranoid: "EPA-PRIMÄRNOTING i EUR (MC.PA/OR.PA/RMS.PA-precedenserna; underlag S&P Global Market Intelligence; " + AS_OF + "): pris 20,85 EUR intraday (föregående close 20,56 = +1,41 % dagen), mcap 27,22 mdr (aktier 1 324 M × 20,85 = 27,61 — källans fält 27,22 bär aktuell aktiebas-justering; aktiebas BS-serie 1 310/1 314/1 315/1 313/1 321/1 324 M — BAS-SPRIDNING dokumenterad), P/E 21,13 (replikband 20,56-21,49: EPS-visad 0,97 ⇒ 21,49 · netto/aktier 1 324/1 324 = 1,00 ⇒ 20,56 — fältet inom bandet, källspridning dokumenterad), fwd 15,02 ⇒ prognosTillväxt +40,68 % TTE (licensdippet 2025-26 med vändningsprognos), PEG 0,52 spårkonvention (källans 2,90 på 3-års-prognos EPS +4,53 %/år — källspridning dokumenterad), PS 4,39 (replik 4,386 ✓), P/B 2,92 = mcap/EK-total 9 323 (replik 2,9197 ✓; pris/BVPS 7,04 = 2,961 common-basen — TVÅLAVA dokumenterad), P/TBV 11,20, P/FCF 17,12, EV 24,94 mdr = mcap − NETTOKASSA 2 282 (replik 24,938 EXAKT — kassabolaget), EV/EBIT 16,05 (replik EXAKT), EV/EBITDA 14,10, EV/Earnings 18,84 (replik EXAKT), EV/Sales 4,02, marginaler TTM: brutto 84,24 % (5 228/6 206 EXAKT — PROGRAMVARANS PROFIL), EBIT 25,04 % (EXAKT), netto 21,33 % (EXAKT), FCF 25,62 % (EXAKT), fcfYield 5,84 %, ROE 15,09 % ROIC 18,45 % mot WACC 6,61 % = +11,84 pp (licensmoatets kapitallogik), effektiv skatt 17,63 % (fransk innovatörsrabatt — lav>lutande mot CAP:s 29,54), kassa 5 660 M €, skuld 3 378 M €, NETTOKASSA 2 282 M € (net cash/share 1,72), EK-total 9 323 M €, D/E 0,36, räntetäckning 34,69, Altman 4,35, Piotroski 6, beta 0,55, utdelning 0,27 EUR (1,30 %; replik ✓) payout 27,01 %, DPS-trappa 0,112→0,17→0,21→0,23→0,26→0,27 (SEX RAKA HÖJNINGAR +141 % på fem år — CF-ytans betalda 147,1→342,6 M € ×2,3), buyback yield 0,10 % ⇒ shareholder yield 1,41 %, aktiebas +1,07 % FY21→TTM (medarbetarprogrammens utspädning — statistics YoY −0,10 %/QoQ −0,48 %), institutioner 25,82 % insiders 9,00 % (Dassault-familjeholding), 52-v 15,83–30,36 (−25,09 % på året; −31,3 % från toppen, +31,7 % över botten), analytiker Hold 20 st PT 23,71 (+13,72 %), 25 000 anställda (rev/anställd 248 248 € — 3,4× CAP:s 56 154), GRUNDAT 1981, nästa rapp 2026-10-28; FY KALENDER: rev 4 860→5 665→5 951→6 214→6 236 M € FY2021-25 (omsCAGR +6,43 %/år; TTM 6 206 = −0,48 % mot FY2025 — källans YoY-fält −1,69 % TTM-bas noterad), brutto 4 070→5 221 M € (marginalserie 83,62-83,80 % — FEMÅRSMEDEL 83,71 % spread 0,17 pp = UNIVERSUMETS SMALASTE moat-kurva, under L'Oréals 1,98 pp — 3D-plattformens prissättningsmaskin), EBIT 1 051→1 395 (25,04 %-klassen åter), netto 773,7→931,5→1 051→1 200→1 196 M € (FEM RAKA STIGANDE ÅR, resCAGR +11,51 %/år — TTM 1 324 +10,7 % mot FY2025), EK-trappa 6 211→8 798 M € med vändningen FY2024→25 (−3 %, utdelningar+återköp över vinsten), CF: OCF 1 613→1 630 M €, capex 103,7→160,5 M € (7,5 % av OCF — KAPITALLÄTTA LICENSVERKTYGET mot CAP:s 11 %), FCF 1 509→1 469 M € (6/6 positiva inkl TTM 1 590), återköp 283→640→375→374→340 M €, BALANSVÄNDNINGEN: nettoskuld −1 491 M € (FY2021) → nettokassa +2 282 M € (TTM) — kassan 2 980→5 660 medan skulden 4 471→3 378; branschfält Technology/Software – Application — världens 3D-designplattform (CATIA/SOLIDWORKS/3DEXPERIENCE): flyg-, bil- och livsvetenskapstrågarnas digitala tvillingar",
  }],
  hamtat: HAMTAT, pris: DSY.pris, marknadsKapitalMdr: 27.22,
  tillvaxt: { omsattningCAGR5ar: +dsyOms.toFixed(4), resultatCAGR5ar: +dsyRes.toFixed(4), omsattningTillvaxtTTM: -0.0048, prognosTillvaxt: +dsyProg.toFixed(4) },
  lonksamhet: { roe: 0.1509, roic: 0.1845, bruttoMarginal: 0.8424, ebitMarginal: 0.2504, nettoMarginal: 0.2133, fcfMarginal: 0.2562 },
  stabilitet: { skuldEgenkapital: 0.36, rantaTackning: 34.69, fcfPositivaSenaste5: 5, kassaManaderBurnRate: null, nyemissionerSenaste5ar: null },
  aterkop: { senasteArMdr: 0.3575, andelUtestande: 0.0130, insiderkopSenaste6man: null },
  moat: { bruttoMarginalMedel5ar: 0.8371, bruttoMarginalSpread5ar: 0.0017, roeMedel5ar: null },
  vardering: { pe: 21.13, pb: 2.92, evEbit: 16.05, peg: 0.52, fcfYield: 0.0584, egenKapitalMultipl: 2.92 },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: { ar: DSY.serirAr, omsattning: DSY.oms.map(x => x * 1e9), resultat: DSY.res.map(x => x * 1e9), egetKapital: DSY.ekSerie.map(x => x * 1e9), fcf: DSY.fcfSerie.map(x => x * 1e9) },
  notering: "FRANKRIKE/TEKNIK 0→2 (cell-etta tillsammans med CAP.PA; u1:s AI.PA samma omgång i Frankrike/material ⇒ FRANKRIKE KOMPLETT med alla TIO grenar — fjärde landet efter Sverige · USA · Tyskland). SIGNATURTAL — PLATTFORMENS TVÅ ANSIKTEN I EN CELL (produkten mot tjänsten): (1) BRUTTOMARGINAL 84,24 % med FEMÅRSMEDEL 83,71 % och spread 0,17 pp = UNIVERSUMETS SMALASTE moat-kurva (under L'Oréals 1,98 pp) — CATIA/SOLIDWORKS-licensernas prissättningsmaskin; mot CAP:s 26,83 % i SAMMA cell = 57,4 pp:s arketyp-gap. (2) BALANSVÄNDNINGEN nettoskuld −1 491 M € (FY2021) → NETTOKASSA +2 282 M € (TTM): kassa 2 980→5 660 medan skuld 4 471→3 378 — mot CAP:s nettoskuld 7 907 M € i samma cell: 10,2 mdr €:s balansavstånd mellan två franska teknikbolag. (3) NETTOTRAPPAN 773,7→931,5→1 051→1 200→1 196 M € FEM RAKA STIGANDE ÅR (resCAGR +11,51 %) medan intäkterna stannar (TTM −0,48 %) — marginalutvidgning utan tillväxt = licensekonomins kraft; TTM-netto 1 324 (+10,7 % mot FY2025) och fwd P/E 15,02 ⇒ prognos +40,68 %. (4) ROIC 18,45 % mot WACC 6,61 % = +11,84 pp — kapitallätt (capex 7,5 % av OCF) med moat-spread i toppklass. (5) SEX RAKA utdelningshöjningar 0,112→0,27 EUR (+141 %) på payout 27 % — trappan har decennier av utrymme. (6) Skatten 17,63 % mot CAP:s 29,54 % — Frankrikes innovatörsrabatt (CIR) i ett tal. FIFO: Q3-rapp 2026-10-28.",
};

const capObj = {
  ticker: CAP.ticker, namn: CAP.namn, bransch: CAP.bransch, land: CAP.land, valuta: CAP.valuta,
  kallor: [{
    namn: "StockAnalysis",
    hamtat: HAMTAT,
    url: "https://stockanalysis.com/quote/epa/CAP/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/ + /dividend/)",
    paranoid: "EPA-PRIMÄRNOTING i EUR (MC.PA/OR.PA/RMS.PA-precedenserna; underlag S&P Global Market Intelligence; " + AS_OF + "): pris 107,05 EUR intraday (föregående close 104,35 = +2,59 % dagen), mcap 17,71 mdr (aktier 169,74 M × 107,05 = 18,17 — källans fält 17,71 bär TTM-aktiebasen 168,34 M-justering; BAS-SPRIDNING dokumenterad), P/E 13,25 (replikband 13,1-13,6: EPS-visad 7,88 ⇒ 13,58 · netto/aktier 1 375/169,74 = 8,10 ⇒ 13,21 — fältet inom bandet), fwd 7,90 ⇒ prognosTillväxt +67,72 % TTE (TTM-nettot −11,9 % nedtryckt av WNS-integrationen; 3-års-prognosen EPS +4,49 %/år är källans lugna bas — källspridning dokumenterad), PEG 0,93 källans (spårkonvention 0,20 på TTE), PS 0,76 (replik 0,7555 ✓), P/B 1,52 = mcap/EK-total 11 640 (replik 1,5215 ✓; pris/BVPS 69,00 = 1,5514 common-basen TTM — TVÅLAVA dokumenterad), P/FCF 8,09, EV 25,64 mdr = mcap + nettoskuld 7 907 (replik 25,617 — 0,09 %), EV/EBIT 9,88 (replik 9,77 på TTM-EBIT 2 626; källans EBIT-bas 2 595 — spridning 1,2 % dokumenterad), EV/EBITDA 7,64, EV/Earnings 18,65 (replik EXAKT), EV/Sales 1,09, marginaler TTM: brutto 26,83 % (6 290/23 440 EXAKT — KONSULTENS PROFIL: kostnadssidan är 417 610 löner), EBIT 11,20 % (EXAKT), netto 5,87 % (EXAKT), FCF 9,34 % (EXAKT), fcfYield 12,37 %, ROE 12,20 % ROIC 9,47 % mot WACC 5,72 % = +3,75 pp, effektiv skatt 29,54 % (fransk standard mot DSY:s 17,63 innovatörsrabatt — LANDSKONTRASTEN I ETT TAL), kassa 2 279 M €, skuld 10 186 M €, NETTOSKULD 7 907 M € (net debt/share −46,58), EK-total 11 640 M €, D/E 0,88, räntetäckning 9,69, Altman 2,2 (konsultbalansens goodwill 14 674 M € = 48 % av tillgångarna trycker Z — konstaterande; Piotroski 5), utdelning 3,40 EUR (3,18 %; replik 3,40/107,05 ✓) payout 41,45 %, DPS-trappa 1,95→2,40→3,25→3,40→3,40→3,40 (tre steg + TRE RAKA PLATTA år — konsolideringen efter WNS), buyback yield 0,73 % ⇒ shareholder yield 3,93 %, AKTIEBASNEDGÅNGEN 172,00→168,34 M TTM (−2,13 % på 4,5 år — återköpen äter utspädningen; statistics YoY −0,73 %), institutioner 56,93 % insiders 0,21 %, 52-v 85,62–153,05 (−13,72 % på året; −30,1 % från toppen), analytiker Buy 17 st PT 140,51 (+31,26 %), 417 610 ANSTÄLLDA (universumets näst största bemanning efter Walmart-klassen; rev/anställd 56 154 € = 0,23× DSY:s 248 248 — ARKETYPKONTRASTEN i ett tal), GRUNDAT 1967, nästa rapp 2027-02-16 (årsrapport); FY KALENDER: rev 18 160→21 995→22 522→22 096→22 465 M € FY2021-25 (omsCAGR +5,48 %/år; TTM 23 440 +4,34 % mot FY2025 — WNS-KONSOLIDERINGEN I TOPPEN), brutto 4 792→6 075 M € (marginalfemårsmedel 26,84 % spread 1,00 pp — konsultens smala band), EBIT 2 042→2 504, netto 1 157→1 547→1 663→1 671→1 601 M € (resCAGR +8,47 %/år), EK-trappa 8 479→11 672 M €, CF: OCF 2 581→2 482 M € (platt tak — konsulten säljer tid, skaltrappan saknas), capex 266→287 M € (11 % av OCF), FCF 2 315→2 195 M € (6/6 positiva, 2,2-mdr-korridoren FEM RAKA ÅR — stabiliteten själv), utdelningar betalda 329→578 M €, återköp 197→826→0→989→543 M €, WNS-FÖRVÄRVET FY2025 (dokumenterat utan orsaksspekulation): Cash Acquisitions −3 775 M € · Net Debt Issued +2 651 M € · skuld 6 097→9 458 M € (+55 %) · goodwill 12 343→14 858 M € (+2 515) · TTM-skuld 10 186 — balansen bär BPO-förvärvet; branschfält Technology/Information Technology Services — europeiska IT-konsult-ettan (Serge Kampf 1967, Grenoble)",
  }],
  hamtat: HAMTAT, pris: CAP.pris, marknadsKapitalMdr: 17.71,
  tillvaxt: { omsattningCAGR5ar: +capOms.toFixed(4), resultatCAGR5ar: +capRes.toFixed(4), omsattningTillvaxtTTM: 0.0434, prognosTillvaxt: +capProg.toFixed(4) },
  lonksamhet: { roe: 0.1220, roic: 0.0947, bruttoMarginal: 0.2683, ebitMarginal: 0.1120, nettoMarginal: 0.0587, fcfMarginal: 0.0934 },
  stabilitet: { skuldEgenkapital: 0.88, rantaTackning: 9.69, fcfPositivaSenaste5: 5, kassaManaderBurnRate: null, nyemissionerSenaste5ar: null },
  aterkop: { senasteArMdr: 0.578, andelUtestande: 0.0318, insiderkopSenaste6man: null },
  moat: { bruttoMarginalMedel5ar: 0.2684, bruttoMarginalSpread5ar: 0.0100, roeMedel5ar: null },
  vardering: { pe: 13.25, pb: 1.52, evEbit: 9.88, peg: 0.20, fcfYield: 0.1236, egenKapitalMultipl: 1.52 },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: { ar: CAP.serirAr, omsattning: CAP.oms.map(x => x * 1e9), resultat: CAP.res.map(x => x * 1e9), egetKapital: CAP.ekSerie.map(x => x * 1e9), fcf: CAP.fcfSerie.map(x => x * 1e9) },
  notering: "FRANKRIKE/TEKNIK 0→2 (cell-tvåa tillsammans med DSY.PA; u1:s AI.PA samma omgång i Frankrike/material ⇒ FRANKRIKE KOMPLETT med alla TIO grenar). SIGNATURTAL — TJÄNSTENS EKONOMI MOT PRODUKTENS (samma cell som DSY.PA): (1) BRUTTOMARGINAL 26,83 % mot DSY:s 84,24 % — 57,4 pp:s arketyp-gap på rev/anställd 56 154 € mot 248 248 € (0,23×); moat-kurvan 26,84 % medel med spread 1,00 pp ( stabil men låg plattform — människor är kostnaden). (2) FCF-KORRIDOREN 2 195-2 315 M € FEM RAKA ÅR + TTM 2 190 — konsultens kassaflöde är en rak linje (OCF-platt-taket 2 482-2 581) mot DSY:s marginalutvidgning. (3) WNS-FÖRVÄRVET FY2025 i balansen: acquisitions −3 775 M €, net debt issued +2 651 M €, skuld 6 097→9 458 (+55 %), goodwill +2 515 M €, nettoskuld TTM 7 907 M € — mot DSY:s NETTOKASSA 2 282: cellens balansavstånd 10,2 mdr €. (4) FREMTIDEN DISKONTERAD: P/E 13,25 med fwd 7,90 (prognos +67,72 % TTE) och PEG-källan 0,93 — TTM-nettot −11,9 % (WNS-integrationen) mot 3-års EPS-prognos +4,49 %; analytiker Buy 17 st PT +31,26 %. (5) Utdelningstrappan 1,95→2,40→3,25→3,40 med TRE RAKA PLATTA år på payout 41 % — förvärvsårets försiktighet (dokumenterat). (6) Aktiebasen MINSKAR −2,13 % på 4,5 år (återköpen) — CAP:s enda compounding-motor balanssidan. (7) Altman 2,2: goodwill 48 % av tillgångarna trycker Z-modellen — konsultbalansens struktur, konstaterande. (8) Skatt 29,54 % mot DSY:s 17,63 % — innovation vs tjänst i fransk skattkod. FIFO: årsrapp 2027-02-16.",
};

// ── Kirurgisk append (endast hit; race-tolerant mot syskonens parallella rader) ─
const original = readFileSync(UNI, "utf8");
const arr = JSON.parse(original);
if (arr.length < 243) { console.error(`ABORT: universum ${arr.length} < 243 (oväntat läge — läs worklog)`); process.exit(1); }
if (arr.some(b => b.ticker === "DSY.PA" || b.ticker === "CAP.PA")) { console.error("ABORT: ticker finns redan"); process.exit(1); }
const fore = JSON.stringify(arr.slice(), null, 2);
const foreAntal = arr.length;
arr.push(dsyObj, capObj);
const efter = JSON.stringify(arr, null, 2) + "\n";

const gamlaIgen = JSON.stringify(JSON.parse(efter).slice(0, arr.length - 2), null, 2);
if (gamlaIgen !== fore) { console.error("ABORT: gamla rader förändrade"); process.exit(1); }

writeFileSync(UNI, efter);
const readback = JSON.parse(readFileSync(UNI, "utf8"));
const forv = readback.length;
if (readback[forv - 2].ticker !== "DSY.PA" || readback[forv - 1].ticker !== "CAP.PA") { console.error("ABORT: readback-ordning fel"); process.exit(1); }
const round = JSON.stringify(readback, null, 2) + "\n";
if (round !== readFileSync(UNI, "utf8")) { console.error("ABORT: stringify-round-trip avvikelse"); process.exit(1); }

// ── Medianer + kvartiler + placeringar (diskens faktiska läge) ────────────────
const median = v => { const r = v.filter(x => typeof x === "number" && Number.isFinite(x)); if (!r.length) return null; const s = [...r].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const pct = (v, p) => { const r = v.filter(x => typeof x === "number" && Number.isFinite(x)); if (!r.length) return null; const s = [...r].sort((a, b) => a - b); const pos = (s.length - 1) * p; const lo = Math.floor(pos), hi = Math.ceil(pos); return lo === hi ? s[lo] : s[lo] + (pos - lo) * (s[hi] - s[lo]); };
const stat = (r, f) => ({ n: r.map(f).filter(x => typeof x === "number").length, median: median(r.map(f)), p25: pct(r.map(f), 0.25), p75: pct(r.map(f), 0.75) });
const svTal = x => x === null ? "—" : String(Math.round(x * 10) / 10).replace(".", ",");

const FORE = readback.slice(0, foreAntal);
for (const [label, rader] of [["FÖRE (disk minus mina 2)", FORE], ["EFTER (= diskens läge)", readback]]) {
  const t = stat(rader, b => b.vardering?.pe);
  const g = stat(rader.filter(b => b.bransch === "teknik"), b => b.vardering?.pe);
  const gr = stat(rader.filter(b => b.bransch === "teknik"), b => b.tillvaxt?.resultatCAGR5ar);
  const gb = stat(rader.filter(b => b.bransch === "teknik"), b => b.lonksamhet?.bruttoMarginal);
  console.log(`[${label}] N=${rader.length}: teknik P/E median ${svTal(g.median)} (kv ${svTal(g.p25)}–${svTal(g.p75)}, n ${g.n}) · brutto ${svTal(gb.median * 100)} % · resCAGR ${svTal(gr.median * 100)} % (kv ${svTal(gr.p25 * 100)}–${svTal(gr.p75 * 100)}, n ${gr.n}) · TOTALT P/E ${svTal(t.median)} (n ${t.n})`);
}
const placera = (tk) => {
  const b = readback.find(x => x.ticker === tk); const v = b.vardering.pe;
  const iG = readback.filter(x => x.bransch === "teknik" && typeof x.vardering?.pe === "number").map(x => x.vardering.pe).sort((a, c) => a - c);
  const iA = readback.filter(x => typeof x.vardering?.pe === "number").map(x => x.vardering.pe).sort((a, c) => a - c);
  console.log(`KVARTIL ${tk}: P/E ${v} = rad ${iG.indexOf(v) + 1} av ${iG.length} i teknik (P25 ${svTal(pct(iG, 0.25))} · P75 ${svTal(pct(iG, 0.75))}) · universumrad ${iA.filter(x => x < v).length + 1} av ${iA.length} (median ${svTal(median(iA))})`);
};
placera("DSY.PA"); placera("CAP.PA");
const placeraC = (tk) => {
  const b = readback.find(x => x.ticker === tk); const v = b.tillvaxt.resultatCAGR5ar;
  const g = readback.filter(x => x.bransch === "teknik" && typeof x.tillvaxt?.resultatCAGR5ar === "number").map(x => x.tillvaxt.resultatCAGR5ar).sort((a, c) => a - c);
  const a = readback.filter(x => typeof x.tillvaxt?.resultatCAGR5ar === "number").map(x => x.tillvaxt.resultatCAGR5ar).sort((c, d) => c - d);
  console.log(`KVARTIL ${tk} resCAGR: ${(v * 100).toFixed(1)} % = rad ${g.indexOf(v) + 1} av ${g.length} i teknik · universumrad ${a.filter(x => x < v).length + 1} av ${a.length}`);
};
placeraC("DSY.PA"); placeraC("CAP.PA");
console.log(`FRANKRIKE efter append: ${readback.filter(b => b.land === "Frankrike").map(b => b.ticker + "/" + b.bransch).join(" · ")}`);
const gren = new Set(readback.filter(b => b.land === "Frankrike").map(b => b.bransch));
console.log(`FRANKRIKE grenar: ${gren.size}/10 ${gren.size === 10 ? "— KOMPLETT (fjärde landet)" : ""}`);
console.log(`APPEND KLAR: ${foreAntal}→${forv} · gamla rader innehållsidentiska · round-trip disk OK`);
