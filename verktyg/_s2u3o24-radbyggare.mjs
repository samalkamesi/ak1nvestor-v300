#!/usr/bin/env node
/**
 * s2-u3 omg24 (manifest auto-s2-1789927508250) — DATASET-DJUP +3 JAPAN/
 * KOMMUNIKATION-TRION: 9432.T NTT + 9434.T SoftBank Corp + 4751.T CyberAgent
 * ⇒ cellen 2→5 = MATTAN NÅS ⇒ /dataset/kommunikation/japan föds data-drivet
 * (japan-modulen i land.ts är bransch-dynamisk; src/ orörd = INGET bygge).
 * Sony 6758.T föll i sonderingen (SA: Technology/Consumer Electronics + TTM-
 * förlust — Sony-fällan); Dentsu 4324.T föll (TTM-förlust −207,7 mdr ¥).
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

// ═══════════════ RÅDATA (StockAnalysis TYO-primär 2026-09-20, close 2026-09-18; Yahoo paranoid ×3 0,00 % band) ═══════════════
const NTT = {
  pris: 177.30, aktierM: 81425, aktierFilingM: 81455, mcapT: 14440, eps: 12.84, peF: 13.81, peFwd: 13.66,
  pbF: 1.40, ptbvF: 2.97, evF: 29960, evEbitF: 15.11, evEbitdaF: 7.91, psF: 0.98,
  ekTotalM: 10348007, ekCommonM: 9858080, tbvM: 4860329, kassaM: 2387389, skuldM: 17425652, minorM: 489927,
  ttmRevM: 14764789, ttmBruttoM: 4028309, ttmEbitM: 1930539, ttmNettoM: 1052148,
  bruttoF: 27.28, ebitF: 13.08, nettoF: 7.13, roeF: 10.71, roicF: 5.18, waccF: 2.07,
  deF: 1.68, rantaF: 7.37, altmanF: 0.62, piotroskiF: 4, skattF: 32.11, betaF: -0.16, instF: 16.75,
  ocfTTMm: 1533429, capexTTMm: -2295265, fcfTTMm: -761836, fcfYieldF: -5.28, payoutF: 41.31, buybackYieldF: 1.62,
  utdelBetTTMm: 434693, copTTMm: 204910, dps: 5.40, dpsYieldF: 3.05,
  rev: [12156447, 13136194, 13374569, 13704727, 14409121], res: [1181083, 1213116, 1279521, 1000016, 1037032],
  ek: [9018132, 9350627, 10893059, 11344639, 10217533], fcf: [1252212, 409134, 290155, 231739, -770542],
  omsCAGR: 0.0434, resCAGR: -0.0324, omsTTM: 0.0756, peg: 12.6, pegKalla: 1.90,
};
const SB = {
  pris: 248.10, aktierM: 47908, aktierFilingM: 47847, mcapT: 11893, eps: 11.37, peF: 21.82, peFwd: 19.25,
  pbF: 2.56, ptbvF: null, evF: 19390, evEbitF: 19.21, evEbitdaF: 10.72, psF: 1.65,
  ekTotalM: 4638510, ekCommonM: 2912232, tbvM: -1865404, kassaM: 1645785, skuldM: 7421354, minorM: 1726278,
  ttmRevM: 7194787, ttmBruttoM: 3452022, ttmEbitM: 1014604, ttmNettoM: 546119,
  bruttoF: 47.98, ebitF: 14.10, nettoStatF: 7.72, nettoIS: 7.59, roeF: 16.71, roicF: 7.99, waccF: 3.38,
  deF: 1.60, rantaF: 8.65, altmanF: 0.89, piotroskiF: 4, skattF: 20.72, betaF: 0.08, instF: 23.26, insiderF: 0.56,
  ocfTTMm: 1297062, capexTTMm: -589793, fcfTTMm: 707269, fcfYieldF: 5.95, fcfMargF: 9.83, payoutF: 75.85,
  utdelBetTTMm: 421380, dps: 8.80, dpsYieldF: 3.55,
  rev: [5690606, 5911999, 6084002, 6544349, 7038680], res: [517517, 531366, 487828, 519977, 541359],
  ek: [2888346, 3683067, 3935647, 4265371, 4668455], fcf: [506826, 546528, 685615, 621214, 823295],
  bruttoSerie: [2801490, 2717914, 2933349, 3160234, 3383995],
  omsCAGR: 0.0545, resCAGR: 0.0113, omsTTM: 0.0791, peg: 1.63, pegKalla: 2.96,
};
const CA = {
  pris: 1260.00, aktierM: 507.10, mcapMdr: 638.95, eps: 81.24, peF: 15.51, peFwd: 13.97,
  pbF: 2.14, ptbvF: 4.40, evMdr: 612.62, evEbitF: 6.80, evEbitdaF: 6.24, psF: 0.67,
  ekTotalM: 297897, ekCommonM: 209002, tbvM: 145104, kassaM: 212081, skuldM: 96858, minorM: 88895,
  ttmRevM: 951309, ttmBruttoM: 300832, ttmEbitM: 90155, ttmNettoM: 43599,
  bruttoF: 31.62, ebitF: 9.48, nettoF: 4.58, roeF: 20.28, roicF: 34.39, waccF: 6.54,
  deF: 0.33, rantaF: 185.50, altmanF: 4.96, piotroskiF: 7, skattF: 32.87, betaF: 0.59, instF: 44.17, insiderF: 17.56,
  ocfTTMm: 75340, capexTTMm: -20870, fcfTTMm: 54470, fcfYieldF: 8.53, fcfMargF: 5.85,
  utdelFY25m: 8093, dps: 20.00, dpsYieldF: 1.59,
  rev: [666149, 709923, 719451, 801236, 874030], res: [41242, 22901, 3540, 15977, 31667],
  ek: [193790, 221244, 228448, 250503, 275679], fcf: [105775, 1020, 7744, 46552, 68801],
  bruttoSerie: [231684, 218506, 191649, 218764, 264052],
  omsCAGR: 0.0704, resCAGR: -0.0642, omsTTM: 0.1188, peg: 1.41, pegKalla: 0.63,
};

// ═══════════════ GRIND: NTT ═══════════════
{
  const mcap = NTT.pris * NTT.aktierM; // M¥
  grind("NTT-01 mcap-identitet", mcap / 1000, NTT.mcapT, 0.005);
  grind("NTT-02 P/E aktiebas", NTT.pris / NTT.eps, NTT.peF, 0.005);
  grind("NTT-03 P/B total EK", mcap / NTT.ekTotalM, NTT.pbF, 0.005);
  grind("NTT-04 P/TBV", mcap / NTT.tbvM, NTT.ptbvF, 0.005);
  const ev = mcap + NTT.skuldM - NTT.kassaM + NTT.minorM;
  grind("NTT-05 EV mcap+skuld-kassa+minority", ev / 1000, NTT.evF, 0.005);
  grind("NTT-06 bruttomarginal TTM", NTT.ttmBruttoM / NTT.ttmRevM * 100, NTT.bruttoF, 0.005, " %");
  grind("NTT-07 EBIT-marginal TTM", NTT.ttmEbitM / NTT.ttmRevM * 100, NTT.ebitF, 0.005, " %");
  grind("NTT-08 nettomarginal TTM", NTT.ttmNettoM / NTT.ttmRevM * 100, NTT.nettoF, 0.005, " %");
  grind("NTT-09 fcfYield", NTT.fcfTTMm / mcap * 100, NTT.fcfYieldF, 0.005, " %");
  grind("NTT-10 payout CF-bas", NTT.utdelBetTTMm / NTT.ttmNettoM * 100, NTT.payoutF, 0.005, " %");
  grind("NTT-11 D/E", NTT.skuldM / NTT.ekTotalM, NTT.deF, 0.005);
  grind("NTT-12 nettoskuld", (NTT.skuldM - NTT.kassaM) / 1000, 15038.26, 0.0005, " mdr ¥");
  grind("NTT-13 omsCAGR endpoint", (Math.pow(NTT.rev[4] / NTT.rev[0], 1 / 4) - 1) * 100, NTT.omsCAGR * 100, 0.02, " %");
  grind("NTT-14 resCAGR endpoint", (Math.pow(NTT.res[4] / NTT.res[0], 1 / 4) - 1) * 100, NTT.resCAGR * 100, 0.03, " %");
  grind("NTT-15 prognosTillväxt PE/fwd", (NTT.peF / NTT.peFwd - 1) * 100, 1.10, 0.05, " %");
  grind("NTT-16 PEG spår PE/prognTillv", NTT.peF / 1.098, NTT.peg, 0.01);
  grind("NTT-17 DPS-yield", NTT.dps / NTT.pris * 100, NTT.dpsYieldF, 0.01, " %");
  grind("NTT-18 FCF = OCF+capex", NTT.ocfTTMm + NTT.capexTTMm, NTT.fcfTTMm, 0.0001);
  const nPos = NTT.fcf.filter(x => x > 0).length;
  if (nPos !== 4) FEL.push(`NTT-19 fcfPositiva: räknade ${nPos} förväntat 4`);
  else OK.push("NTT-19 fcfPositivaSenaste5 = 4/5 (serien 1252→409→290→232→−771)");
}
// ═══════════════ GRIND: SB ═══════════════
{
  const mcap = SB.pris * SB.aktierM; // M¥
  grind("SB-01 mcap-identitet", mcap / 1000, SB.mcapT, 0.01);
  grind("SB-02 P/E aktiebas", SB.pris / SB.eps, SB.peF, 0.005);
  grind("SB-03 P/B total EK", mcap / SB.ekTotalM, SB.pbF, 0.005);
  grind("SB-04 EV mcap+skuld-kassa+minority", (mcap + SB.skuldM - SB.kassaM + SB.minorM) / 1000, SB.evF, 0.005);
  grind("SB-05 bruttomarginal TTM", SB.ttmBruttoM / SB.ttmRevM * 100, SB.bruttoF, 0.005, " %");
  grind("SB-06 EBIT-marginal TTM", SB.ttmEbitM / SB.ttmRevM * 100, SB.ebitF, 0.005, " %");
  grind("SB-07 nettomarginal IS-TTM", SB.ttmNettoM / SB.ttmRevM * 100, SB.nettoIS, 0.005, " %");
  grind("SB-08 fcfYield", SB.fcfTTMm / (SB.mcapT * 1000) * 100, SB.fcfYieldF, 0.005, " %");
  grind("SB-09 fcf-marginal", SB.fcfTTMm / SB.ttmRevM * 100, SB.fcfMargF, 0.005, " %");
  grind("SB-10 D/E", SB.skuldM / SB.ekTotalM, SB.deF, 0.005);
  grind("SB-11 nettoskuld", (SB.skuldM - SB.kassaM) / 1000, 5775.57, 0.0005, " mdr ¥");
  grind("SB-12 omsCAGR endpoint", (Math.pow(SB.rev[4] / SB.rev[0], 1 / 4) - 1) * 100, SB.omsCAGR * 100, 0.02, " %");
  grind("SB-13 resCAGR endpoint", (Math.pow(SB.res[4] / SB.res[0], 1 / 4) - 1) * 100, SB.resCAGR * 100, 0.05, " %");
  grind("SB-14 prognosTillväxt", (SB.peF / SB.peFwd - 1) * 100, 13.35, 0.01, " %");
  grind("SB-15 PEG spår", SB.peF / 13.35, SB.peg, 0.01);
  grind("SB-16 DPS-yield", SB.dps / SB.pris * 100, SB.dpsYieldF, 0.005, " %");
  grind("SB-17 FCF = OCF+capex", SB.ocfTTMm + SB.capexTTMm, SB.fcfTTMm, 0.0001);
  const marg = SB.bruttoSerie.map((g, i) => g / SB.rev[i] * 100);
  const medel = marg.reduce((a, b) => a + b, 0) / 5;
  const spread = Math.max(...marg) - Math.min(...marg);
  grind("SB-18 moat-brutto-medel", medel, 47.96, 0.005, " %");
  grind("SB-19 moat-brutto-spread", spread, 3.25, 0.02, " pp");
  if (SB.fcf.every(x => x > 0)) OK.push("SB-20 fcfPositivaSenaste5 = 5/5"); else FEL.push("SB-20 fcf-serien ej 5/5 positiv");
  if (SB.tbvM >= 0) FEL.push("SB-21 TBV förväntas NEGATIV (källartefakt-kontroll)");
  else OK.push(`SB-21 TBV negativ ${SB.tbvM / 1e6} mdr ¥ — P/TBV n/a, dokumenterad`);
}
// ═══════════════ GRIND: CA ═══════════════
{
  const mcap = CA.pris * CA.aktierM; // M¥ (aktier i miljoner)
  grind("CA-01 mcap-identitet", mcap / 1000, CA.mcapMdr, 0.001);
  grind("CA-02 P/E aktiebas", CA.pris / CA.eps, CA.peF, 0.005);
  grind("CA-03 P/B total EK", mcap / CA.ekTotalM, CA.pbF, 0.005);
  grind("CA-04 P/TBV", mcap / CA.tbvM, CA.ptbvF, 0.005);
  const ev = mcap + CA.skuldM - CA.kassaM + CA.minorM;
  grind("CA-05 EV mcap+skuld-kassa+minority", ev / 1000, CA.evMdr, 0.001);
  grind("CA-06 EV/EBIT", ev / CA.ttmEbitM, CA.evEbitF, 0.005);
  grind("CA-07 bruttomarginal TTM", CA.ttmBruttoM / CA.ttmRevM * 100, CA.bruttoF, 0.005, " %");
  grind("CA-08 EBIT-marginal TTM", CA.ttmEbitM / CA.ttmRevM * 100, CA.ebitF, 0.005, " %");
  grind("CA-09 nettomarginal TTM", CA.ttmNettoM / CA.ttmRevM * 100, CA.nettoF, 0.005, " %");
  grind("CA-10 fcfYield", CA.fcfTTMm / mcap * 100, CA.fcfYieldF, 0.005, " %");
  // CA-11: källspridning 2,1 % (fält 5,85 mot replik 5,73) — dokumenterad i paranoid
  grind("CA-11 fcf-marginal (källspridning ≤3 %)", CA.fcfTTMm / CA.ttmRevM * 100, CA.fcfMargF, 0.03, " %");
  grind("CA-12 D/E", CA.skuldM / CA.ekTotalM, CA.deF, 0.02);
  grind("CA-13 nettkassa", (CA.kassaM - CA.skuldM) / 1000, 115.22, 0.001, " mdr ¥");
  grind("CA-14 omsCAGR endpoint", (Math.pow(CA.rev[4] / CA.rev[0], 1 / 4) - 1) * 100, CA.omsCAGR * 100, 0.02, " %");
  grind("CA-15 resCAGR endpoint (basårs-not)", (Math.pow(CA.res[4] / CA.res[0], 1 / 4) - 1) * 100, CA.resCAGR * 100, 0.02, " %");
  grind("CA-16 prognosTillväxt", (CA.peF / CA.peFwd - 1) * 100, 11.02, 0.01, " %");
  grind("CA-17 PEG spår", CA.peF / 11.024, CA.peg, 0.01);
  grind("CA-18 DPS-yield", CA.dps / CA.pris * 100, CA.dpsYieldF, 0.01, " %");
  grind("CA-19 FCF = OCF+capex", CA.ocfTTMm + CA.capexTTMm, CA.fcfTTMm, 0.0005);
  const marg = CA.bruttoSerie.map((g, i) => g / CA.rev[i] * 100);
  const medel = marg.reduce((a, b) => a + b, 0) / 5;
  const spread = Math.max(...marg) - Math.min(...marg);
  grind("CA-20 moat-brutto-medel", medel, 29.94, 0.005, " %");
  grind("CA-21 moat-brutto-spread", spread, 8.15, 0.02, " pp");
  if (CA.fcf.every(x => x > 0)) OK.push("CA-22 fcfPositivaSenaste5 = 5/5"); else FEL.push("CA-22 fcf-serien ej 5/5 positiv");
  const vaxt = CA.res[4] > CA.res[3] && CA.res[3] > CA.res[2];
  if (!vaxt) FEL.push("CA-23 vändbågen brutet"); else OK.push("CA-23 vändbågen netto 3,5→16,0→31,7 mdr intakt (AI/reklam-återhämtning)");
}

if (FEL.length) {
  console.error(`\nABORT — ${FEL.length} grinfel, DISKEN RÖRD EJ:`);
  for (const f of FEL) console.error("  ✗ " + f);
  process.exit(1);
}
console.log(`\nGRIND GRÖN — ${OK.length} kontroller 0 fel:`);
for (const o of OK) console.log("  ✓ " + o);

// ═══════════════ RADER (kanonformat; moat i procent, lonksamhet decimal, PEG spårkonvention) ═══════════════
const M = 1e6;
const raderNya = [
  {
    ticker: "9432.T", namn: "Nippon Telegraph and Telephone", bransch: "kommunikation", land: "Japan", valuta: "JPY",
    kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-20", url: "https://stockanalysis.com/quote/tyo/9432/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/ + /dividend/)", paranoid: "TYO-PRIMÄRNOTING i JPY (9433.T/8306.T-precedensen; underlag S&P Global Market Intelligence; close 2026-09-18 15:30 JST −1,50 %): pris 177,30 ¥, mcap 14,44 T¥ (aktiebas 81 425 M replik 14 440,6 mdr — 0,003 %; filing-aktier 81 455 → 14 446, band dokumenterat), 52-v 142,60–180,10 (+24,5 % från botten, 1,6 % under toppen), P/E 13,81 (aktiebas 177,30÷12,84 EXAKT; mcap÷TTM-netto 14 440,6/1 052,1 = 13,73 — EPS-basens implied-netto 1 045,5 mot IS-radens 1 052,1 = 0,6 % källspridning), fwd 13,66 ⇒ prognosTillväxt +1,10 % PLATT (incumbent-mogen; PEG 12,6 spårkonvention — källans PEG 1,90 på 3-årsprognos 4,02 % som not), P/B 1,40 (mcap÷totalt EK 10 348 mdr; common 9 858 → 1,46 — BASE-SPLITTRA), P/TBV 2,97 (replik 14 440,6÷4 860,3 EXAKT), P/S 0,98, EV 29,96 T¥ (replik mcap+skuld 17 425,7−kassa 2 387,4+minority 490 = 29 969 — 0,03 %; källans EV bär minoriteten), EV/EBIT 15,11 (replik på TTM-EBIT 1 930,5 = 15,52 — källans EBIT-bas ~1 983 bär justering, 2,7 % källspridning dokumenterad), EV/EBITDA 7,91, bruttomarginal 27,28 % TTM (replik 4 028 309/14 764 789 EXAKT; FY-kolumnens brutto == EBIT = KÄLLARTEFAKT dokumenterad ⇒ moat null enligt SAMPO-precedensen — ingen ärlig årlig bruttoserie i panelen), EBIT 13,08 % (replik EXAKT), netto 7,13 % (replik EXAKT), FCF-marginal n/a källan (replik −761,8/14 764,8 = −5,16 % bär fält null), fcfYield −5,28 % (replik −761 836/14 440 627 EXAKT — universumets första NEGATIVA fcfYield-rad med fyra positiva FCF-år i serien: capex 2 295,3 mdr/år = 15,5 % av intäkt, fiber-5G-cykeln), ROE 10,71 % (replik common 1 052,1/9 858 = 10,67 nära; total-EK 10,17), ROIC 5,18 mot WACC 2,07 % (+3,1 pp — Tokyos lågräntevärld, KDDI 2,69-klassen), skuld/EK 1,68 (replik 17 425,7/10 348 EXAKT), räntetäckning 7,37, Altman 0,62 (goodwill 2 144 mdr + konsolideringssteget), Piotroski 4, effektiv skatt 32,11 %, nettoskuld 15 038,3 mdr ¥ (replik 17 425,7−2 387,4 EXAKT), utdelning 5,40 ¥ (3,05 %; replik 5,40/177,30 = 3,05 EXAKT) DPS-trappa 4,60→4,80→5,10→5,20→5,30 FY2022-26 + 5,40E run-rate = SEX RAKA HÖJNINGAR (payout 41,31 % = 434 693/1 052 148 EXAKT CF-bas), återköp TTM 204,9 mdr ¥ (buyback yield 1,62 %), FY2026 KONSOLIDERINGSSTEG i balansbilden: tillgångar 30,1→46,7 T¥ · skuld 11,2→16,9 · ny skuldemittering +3 685 mdr/år — källpanelen ger bilden, inte berättelsen (ORA-notis-klassen), EK-serien 9 018→9 351→10 893→11 345→10 218 mdr (FY2026 nedåt = steget), FCF-serie 1 252→409→290→232→−771 mdr (4/5 positiva; OCF 3 010→1 485 halverad medan capex 1 758→2 256 stigande — snittet äter FCF:en), beta −0,16 = universumets FEMTE dokumenterade negativa betan (BAE −0,06 · KDDI −0,10 · DNO · PBR-klassen), institutioner 16,75 % (statens ~34 %-block syns ej i fältet — JT/ORA-statens-block-familjen, allmän faktakunskap som not; NTT Docomo 100 %-dotter sedan 2021 = parent-struktur i koncernen), analytiker Buy PT 177 ¥ (0 % — vid pris), 344 196 anställda (universumets största arbetsgivarpanel), grundat 1952 (telegramverket), nästa rapp 2026-11-06 (samma dag som KDDI/SoftBank Corp — telecom-rapportdagen); FY APRIL–MARS slutårsetikett (KDDI-konventionen): rev 12 156→13 136→13 375→13 705→14 409 mdr ¥ (+4,34 %/år), EBIT 1 769→1 829→1 923→1 650→1 706, netto 1 181→1 213→1 280→1 000→1 037 (−3,24 %/år endpoint — FY2024-dippen), TTM jun-26: rev 14 765 · brutto 4 028 · EBIT 1 931 · netto 1 052" }],
    hamtat: "2026-09-20", pris: 177.3, marknadsKapitalMdr: 14440,
    tillvaxt: { omsattningCAGR5ar: 0.0434, resultatCAGR5ar: -0.0324, omsattningTillvaxtTTM: 0.0756, prognosTillvaxt: 0.011 },
    lonksamhet: { roe: 0.1071, roic: 0.0518, bruttoMarginal: 0.2728, ebitMarginal: 0.1308, nettoMarginal: 0.0713, fcfMarginal: null },
    stabilitet: { skuldEgenkapital: 1.68, rantaTackning: 7.37, fcfPositivaSenaste5: 4, kassaManaderBurnRate: null, nyemissionerSenaste5ar: null },
    aterkop: { senasteArMdr: 434.7, andelUtestande: 0.1675, insiderkopSenaste6man: null },
    moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
    vardering: { pe: 13.81, pb: 1.4, evEbit: 15.11, peg: 12.6, fcfYield: -0.0528, egenKapitalMultipl: 1.4 },
    golv: { typ: "osatt", vardePerAktie: null, marginal: null },
    serier: { ar: ["2022", "2023", "2024", "2025", "2026"], omsattning: NTT.rev.map(x => x * M), resultat: NTT.res.map(x => x * M), egetKapital: NTT.ek.map(x => x * M), fcf: NTT.fcf.map(x => x * M) },
    notering: "JAPAN/KOMMUNIKATION 2→5 — MATTAN NÅS: LANDSIDAN /dataset/kommunikation/japan FÖDS (data-drivet; japan-modulen i land.ts är bransch-dynamisk — src orörd, Vonovia-precedensen). SIGNATURTAL — FIBER-CYKELN ÄTER FCF:EN MEDAN UTDELNINGEN VÄXER SEX RAKA ÅR: capex 2 295 mdr ¥/år (15,5 % av intäkt) driver universumets första negativa fcfYield-rad (−5,28 %) medan DPS-trappan 4,60→5,40 och payout 41,3 % CF-bas hålls — telefoninfrastruktur som pågående kapitalbruk, pedagogisk kontrast till KDDI:s nettkassa-värld. FY2026-konsolideringssteget (tillgångar 30→47 T¥, skuld +5,7 T¥) dokumenterat i serien utan orsaksspekulation (källpanelen ger bilden). Statens ~34 % block (JT/ORA-familjen) + Docomo-100 %-dottern = ägarstruktur-pedagogiken. Beta −0,16 = universumets femte negativa. P/E 13,81 under cellens KDDI 15,70 med EV/EBIT 15,11 — telecom-regimernas EV-plan-pedagogik (omg23-taket 14,5 hålls ±0,6). FIFO: Q2 FY2027 2026-11-06.",
  },
  {
    ticker: "9434.T", namn: "SoftBank Corp", bransch: "kommunikation", land: "Japan", valuta: "JPY",
    kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-20", url: "https://stockanalysis.com/quote/tyo/9434/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/ + /dividend/)", paranoid: "TYO-PRIMÄRNOTING i JPY (9433.T-precedensen; S&P-underlag; close 2026-09-18 −1,39 %): pris 248,10 ¥, mcap 11,89 T¥ (aktiebas 47 908 M replik 11 885 mdr — 0,07 %; filing 47 847 → 11 870, band dokumenterat), 52-v 202,60–252,90 (+22,6 % från botten, 1,9 % under toppen), P/E 21,82 (aktiebas 248,10÷11,37 EXAKT — cellens dyraste telecom-rad), fwd 19,25 ⇒ prognosTillväxt +13,35 % (PEG 1,63 spårkonvention; källans PEG 2,96 på 3-års 6,43 % som not), P/B 2,56 (mcap÷totalt EK 4 638,5 mdr; common 2 912,2 → 4,08 — BASE-SPLITTRA: minority 1 726 mdr = 37 % av EK, mobilnät-JV-strukturen KDDI-spegelbilden), P/TBV n/a (TBV NEGATIV −1 865 mdr ¥ — goodwill 2 198 + spektrumimmateriella; balansräkningsstrukturen dokumenterad), P/S 1,65, EV 19,39 T¥ (replik mcap+skuld 7 421,4−kassa 1 645,8+minority 1 726,3 = 19 395 — 0,03 %), EV/EBIT 19,21 (replik TTM-EBIT 1 014,6 → 19,11; 0,5 % band), EV/EBITDA 10,72, bruttomarginal 47,98 % TTM (replik 3 452 022/7 194 787 EXAKT; femårsserie 49,23/45,98/48,22/48,30/48,08 % — medel 47,96 spread 3,25 pp), EBIT 14,10 % (replik EXAKT), netto 7,72 % statistics mot 7,59 % IS-TTM (fönster-not, KDDI/ORA-klassen), FCF-marginal 9,83 %, fcfYield 5,95 % (replik 707 269/11 893 000 EXAKT), ROE 16,71 % (replik common 546,1/2 912,2 = 18,75; total 11,77 — källans bas mellan, dokumenterad), ROIC 7,99 mot WACC 3,38 % (+4,6 pp), skuld/EK 1,60 (replik 7 421,4/4 638,5 EXAKT), räntetäckning 8,65, Altman 0,89 (TBV-negativ-klassen), Piotroski 4, effektiv skatt 20,72 % (låg — mobilnät-avskrivningsavdrag), nettoskuld 5 775,6 mdr ¥ (replik EXAKT), utdelning 8,80 ¥ (3,55 %; replik 8,80/248,10 = 3,547 EXAKT) — DPS-PLATÅ 8,60 ¥ ×4 år (FY2022-25, källans FY2025-rad '43,00' = KÄLLARTEFAKT dokumenterad, alla andra betalningar 4,30 halvårsvis) sedan höjning 8,80 (4,40×2); payout 75,85 % källan (repliker 77,2 CF-bas 421,4/546,1 · 77,4 DPS-bas 8,80/11,37 — källspridning dokumenterad), återköp EPISODISKA: FY2023 100 mdr + FY2025 69,8 mdr, TTM noll (buyback yield −0,57 % = utspädning), FCF-serie 507→547→686→621→823 mdr ¥ 5/5 VÄXANDE-trend (FY2026 +32,5 %; OCF 1 216→1 394 stabil-tioprocentare), FY-serier: rev 5 691→5 912→6 084→6 544→7 039 mdr ¥ (+5,45 %/år endpoint, fem raka tillväxtår), EBIT 967→756→861→960→991 (FY2023-dippen = engångsklass, sedan tre raka återhämtningsår), netto 518→531→488→520→541 (+1,13 %/år — planyetten), EPS 10,83→11,10→10,12→10,84→11,27, EK 2 888→3 683→3 936→4 265→4 668 mdr (uppbyggnadsfasen), beta 0,08 (KDDI 0,09-stillaklassen), institutioner 23,26 % insiders 0,56 % (SoftBank Group-moderns ~40 %-block syns ej i fältet — förälder/barn-not ACA/AMUN-klassen, allmän faktakunskap), analytiker Buy PT 263,40 ¥ (+6,2 %, 15 st), 58 432 anställda, grundat 1986, nästa rapp 2026-11-06 (telecom-dagen: NTT+KDDI+SB samma dag); FY APRIL–MARS slutårsetikett; TTM jun-26: rev 7 195 · brutto 3 452 · EBIT 1 015 · netto 546" }],
    hamtat: "2026-09-20", pris: 248.1, marknadsKapitalMdr: 11893,
    tillvaxt: { omsattningCAGR5ar: 0.0545, resultatCAGR5ar: 0.0113, omsattningTillvaxtTTM: 0.0791, prognosTillvaxt: 0.1335 },
    lonksamhet: { roe: 0.1671, roic: 0.0799, bruttoMarginal: 0.4798, ebitMarginal: 0.141, nettoMarginal: 0.0772, fcfMarginal: 0.0983 },
    stabilitet: { skuldEgenkapital: 1.6, rantaTackning: 8.65, fcfPositivaSenaste5: 5, kassaManaderBurnRate: null, nyemissionerSenaste5ar: null },
    aterkop: { senasteArMdr: 421.4, andelUtestande: 0.2326, insiderkopSenaste6man: null },
    moat: { bruttoMarginalMedel5ar: 47.96, bruttoMarginalSpread5ar: 3.25, roeMedel5ar: null },
    vardering: { pe: 21.82, pb: 2.56, evEbit: 19.21, peg: 1.63, fcfYield: 0.0595, egenKapitalMultipl: 2.56 },
    golv: { typ: "osatt", vardePerAktie: null, marginal: null },
    serier: { ar: ["2022", "2023", "2024", "2025", "2026"], omsattning: SB.rev.map(x => x * M), resultat: SB.res.map(x => x * M), egetKapital: SB.ek.map(x => x * M), fcf: SB.fcf.map(x => x * M) },
    notering: "JAPAN/KOMMUNIKATION 2→5 — MATTAN NÅS: LANDSIDAN FÖDS (japan-modulen data-drivet). SIGNATURTAL — DUOPOLETS UTMANARHALVA: fem raka intäktsår (+5,45 %/år — cellens enda telecom-rad med fem raka) mot KDDI:s planyettt 2,75 % och NTT:s 4,34 %; P/E 21,82 = cellens dyraste telecom-rad med EV/EBIT 19,21 — värderingspremien på tillväxten, spännvidden mot NTT 13,81 är sidans jämförande kärna. TBV NEGATIV (−1 865 mdr ¥) medan FCF växer 5/5 — goodwill/spektrum-bärande balans mot kassaflödets stabilitet: bokförd EK vs ekonomisk EK-pedagogiken (SPG-klassen). Minority 37 % av EK (JV-struktur). DPS-platå 8,60 fyra år + första höjningen 8,80; payout 75,85 % = utdelningslagen-ansats utan REIT-form. FIFO: Q2 FY2027 2026-11-06.",
  },
  {
    ticker: "4751.T", namn: "CyberAgent", bransch: "kommunikation", land: "Japan", valuta: "JPY",
    kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-20", url: "https://stockanalysis.com/quote/tyo/4751/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/)", paranoid: "TYO-PRIMÄRNOTING i JPY (4751.T; S&P-underlag; close 2026-09-18 −0,94 %): pris 1 260 ¥, mcap 638,95 mdr ¥ (aktiebas 507,10 M replik 638 946 M — 0,00 %, universumets tightaste klass), 52-v 1 204–1 789 (−29,6 % från toppen, 4,6 % över botten), P/E 15,51 (aktiebas 1 260÷81,24 EXAKT), fwd 13,97 ⇒ prognosTillväxt +11,02 % (PEG 1,41 spårkonvention; källans PEG 0,63 på 3-års 6,28 %/EPS-tillväxt som not), P/B 2,14 (mcap÷totalt EK 297 897 M; common 209 002 → 3,06 — BASE-SPLITTRA: minority 88 895 M = 30 % av EK, Abema/JV-struktur), P/TBV 4,40 (replik 638 946÷145 104 EXAKT), P/S 0,67, EV 612,62 mdr (replik mcap+skuld 96 858−kassa 212 081+minority 88 895 = 612 618 — 0,01 %), EV/EBIT 6,80 (replik 612 618/90 155 EXAKT), EV/EBITDA 6,24 — cellens LÄGSTA EV-plan (telecom 15,1-19,2): reklam värderas på kassaflödesplan, phone på EV-plan = sidans struktur fynd, bruttomarginal 31,62 % TTM (replik 300 832/951 309 EXAKT; femårsserie 34,79/30,78/26,64/27,30/30,21 % — medel 29,94 spread 8,15 pp = mediabyråns annonskonjunktur-cykel dokumenterad), EBIT 9,48 % (replik EXAKT), netto 4,58 % (replik EXAKT), FCF-marginal 5,85 %, fcfYield 8,53 % (replik 54 470/638 946 EXAKT — cellens högsta), ROE 20,28 % (replik common 43 599/209 002 = 20,86 nära), ROIC 34,39 mot WACC 6,54 % (+27,9 pp — universumets toppklass, kapitallätt reklam-modell), skuld/EK 0,33, räntetäckning 185,50 (universumets högsta dokumenterade — nettkassa + lågt lånebehov), Altman 4,96 (cellens enda >3-värde: sund finansiering mot telecom 0,62-0,89), Piotroski 7 (trions högsta), effektiv skatt 32,87 %, NETTKASSA 115,2 mdr ¥ (replik 212 081−96 858 EXAKT — cellens enda nettkassa-rad), VÄNDBÅGEN FY2021-25: EBIT 103 987→67 553→22 183→39 485→71 504 M¥ (FY2021 covid-boom-toppen → FY2023-botten → AI/reklam-återhämtning; TTM 90 155 nära toppen), netto 41 242→22 901→3 540→15 977→31 667 (TTM 43 599 +82,3 % — basårets topp ger resCAGR −6,42 %/år endpoint = MÄTSTOCK-intellektet: fyra av fem år nedåt från boom-basen medan TTM växer), EPS 77,90→45,29→7,00→29,49→58,96 (TTM 81,24), bruttovinst-serien 231 684→218 506→191 649→218 764→264 052, FCF-serie 105 775→1 020→7 744→46 552→68 801 M¥ (5/5 positiva; FY2022-nästan-noll = capex 16 926 M¥ det året, TTM OCF 75 340 + capex −20 870 = 54 470), utdelning 20 ¥ (1,59 %; replik 20/1 260 = 1,587 EXAKT) utdelningar betalda 4 290→8 093 M¥ växande fem raka (payout n/a källan; DPS-tillväxt dokumenterad), återköp noll-linjen (aktieutfärdigande +1 050 M¥ FY2025; buyback yield −5,71 % = utspädning dokumenterad), goodwill-tredubbling FY2023-24 (7 084→14 778 M¥ = förvärvsaktivitet i serien), EK 193 790→275 679 M¥, aktiebas ~506-507 M KONSTANT (organisk EK-tillväxt, ingen emitteringsmaskin), beta 0,59, institutioner 44,17 % insiders 17,56 % (grundare Susumu Fujita — universumets näst högsta insider-rad efter RCN-klassen), analytiker Buy PT 1 808 ¥ (+43,5 %, 16 st), 8 150 anställda, grundat 1998 (internetpionjären), nästa rapp 2026-11-11 (Q3 FY2026); FY OKTOBER–SEPTEMBER slutårsetikett (HINDUNILVR-april-konventionens spegel: etikett = slutår, här 2021-2025); TTM jun-26: rev 951 309 · brutto 300 832 · EBIT 90 155 · netto 43 599" }],
    hamtat: "2026-09-20", pris: 1260, marknadsKapitalMdr: 639,
    tillvaxt: { omsattningCAGR5ar: 0.0704, resultatCAGR5ar: -0.0642, omsattningTillvaxtTTM: 0.1188, prognosTillvaxt: 0.1102 },
    lonksamhet: { roe: 0.2028, roic: 0.3439, bruttoMarginal: 0.3162, ebitMarginal: 0.0948, nettoMarginal: 0.0458, fcfMarginal: 0.0585 },
    stabilitet: { skuldEgenkapital: 0.33, rantaTackning: 185.5, fcfPositivaSenaste5: 5, kassaManaderBurnRate: null, nyemissionerSenaste5ar: null },
    aterkop: { senasteArMdr: 8.1, andelUtestande: 0.4417, insiderkopSenaste6man: null },
    moat: { bruttoMarginalMedel5ar: 29.94, bruttoMarginalSpread5ar: 8.15, roeMedel5ar: null },
    vardering: { pe: 15.51, pb: 2.14, evEbit: 6.8, peg: 1.41, fcfYield: 0.0853, egenKapitalMultipl: 2.14 },
    golv: { typ: "osatt", vardePerAktie: null, marginal: null },
    serier: { ar: ["2021", "2022", "2023", "2024", "2025"], omsattning: CA.rev.map(x => x * M), resultat: CA.res.map(x => x * M), egetKapital: CA.ek.map(x => x * M), fcf: CA.fcf.map(x => x * M) },
    notering: "JAPAN/KOMMUNIKATION 2→5 — MATTAN NÅS: LANDSIDAN FÖDS (japan-modulen data-drivet). SIGNATURTAL — CELLENS FINANSIERINGSMOTSATS: nettkassa 115 mdr ¥ · räntetäckning 185,5 (universumets högsta dokumenterade) · Altman 4,96 · ROIC 34,4 % mot WACC 6,5 (+27,9 pp) mot telecom-skuldbältena (NTT nettoskuld 15,0 T¥ · SB 5,8 T¥) — branschregistret visar tre kapitalvärldar i EN cell. Vändbågen EBIT 22,2→90,2 mdr ¥ (FY2023-botten → AI/reklam-återhämtning) med resCAGR −6,4 % endpoint från boom-basen FY2021 = mätstock-pedagogiken (GLE/ORA-klassen). EV/EBIT 6,80 = cellens lägsta EV-plan: telefon värderas på företagsvärde, reklam på kassaflöde. Grundar-insider 17,56 % (internettjänstens ägarstruktur). FIFO: Q3 FY2026 2026-11-11.",
  },
];

mkdirSync("/tmp/s2u3o24", { recursive: true });
writeFileSync("/tmp/s2u3o24/rader-nya.json", JSON.stringify(raderNya, null, 2));
console.log(`\nSKREV /tmp/s2u3o24/rader-nya.json — 3 rader (${raderNya.map(r => r.ticker).join(", ")}), väntar på append.`);
