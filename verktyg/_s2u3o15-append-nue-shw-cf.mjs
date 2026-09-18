#!/usr/bin/env node
/**
 * s2-u3 omg15 (manifest auto-s2-1789737901251) — DATASET-DJUP:
 * USA/MATERIAL +3: NUCOR (NUE) + SHERWIN-WILLIAMS (SHW) + CF INDUSTRIES (CF)
 * — cellen 2→5 P/E-mätbara ⇒ /dataset/material/usa föds vid nästa prod-bygge
 * (omg14-u1:s utpekade koordinat, FCX-notisens "1→2 här … +3 öppnar").
 * PIVOT-KEDJA v1 DOW (TTM-förlust, P/E n/a) → v2 APD (engångsnedskrivning,
 * P/E n/a) → v3 NUE+SHW+CF — alla tre mätbara; dokumenterad i anspråksfilen.
 * Idempotent append på diskens faktiska läge (syskonens rader lämnas
 * elementvis orörda; redan förekommande tickers hoppas — omg11–14-konventionen).
 * Källa StockAnalysis hämtad 2026-09-18 (intraday 08:32–09:30 EDT;
 * financials TTM-fönster NUE jul-2026, SHW/CF jun-2026, S&P Global MI-underlag).
 * ALL aritmetik maskinverifierad FÖRE skrivning (abort-grind, omg13-läxan).
 */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/portfolj-system/bolagsunivers.json";
const u = JSON.parse(readFileSync(FIL, "utf8"));
const innan = u.length;
const har = (t) => u.some((b) => b.ticker === t);

// ── käldata (StockAnalysis, hämtat 2026-09-18; paranoid per rad) ─────────────
const K = {
  NUE: {
    pris: 258.88, mcapMdr: 58.73,
    pe: 21.17, peFwd: 11.37, pegKalla: 0.36, pb: 2.72, evEbit: 15.49,
    bruttoM: 0.1555, ebitM: 0.1154, nettoM: 0.0796,
    roe: 0.1455, roa: 0.0732, roic: 0.1205, roce: 0.1314, wacc: 0.1323,
    skuldEk: 0.31, rantaTack: 28.74,
    skuldMdr: 7.10, kassaMdr: 2.69,
    fcfTTM: 1583, ocfTTM: 4424, capexTTM: 2841, revTTM: 36101, nettoTTM: 2873, epsTTM: 12.52, ebitTTM: 4168,
    dps: 2.24, direktAvk: 0.0087, payout: 0.1789, utdArHojda: 53, buybackYield: 0.018, insiders: 0.56,
    revTillvaxtTTM: 0.172, nettoTillvaxtTTM: 1.225,
    beta: 1.88, v52Spann: [131.32, 280.11], mcapForandr: 0.79,
    effSkatt: 0.2068, altmanZ: 4.6, piotroskiF: 7,
    aktier: 226.88, anstallda: 33000, omsPerAnstalld: 1.09,
    rapport: "2026-10-26", analytiker: "Buy mål 285,19 (+10,2 %), 17 st",
    bruttoMargAr: [0.3028, 0.3018, 0.2259, 0.1341, 0.1203],   // FY2021..FY2025
    serier: { ar: ["2021", "2022", "2023", "2024", "2025"], oms: [36484, 41512, 34714, 30734, 32494], netto: [6795, 7576, 4508, 2018, 1737], fcf: [4609, 8124, 4898, 806, -188] },
    utdBetalda: [483.47, 534, 515, 522, 512],                  // FY2021..FY2025 MUSD
    terkop: [3349, 2827, 1603, 2270, 732],                     // FY2021..FY2025 MUSD
    capexAr: [1622, 1948, 2214, 3173, 3422],                   // FY2021..FY2025 MUSD
  },
  SHW: {
    pris: 315.14, mcapMdr: 76.05,
    pe: 29.61, peFwd: 25.13, pegKalla: 2.20, pb: 20.09, evEbit: 23.15, evEbitda: 19.58,
    bruttoM: 0.4898, ebitM: 0.1631, nettoM: 0.1101, fcfM: 0.1316,
    roe: 0.6512, roa: 0.0952, roic: 0.1639, roce: 0.2299, wacc: 0.0901,
    skuldEk: 3.90, rantaTack: 7.71, currentRatio: 0.73,
    skuldMdr: 15.03, kassaMdr: 0.2935,
    fcfTTM: 3213, ocfTTM: 3887, capexTTM: 673.5, revTTM: 24410, nettoTTM: 2688, epsTTM: 10.84, ebitTTM: 3983,
    dps: 3.20, direktAvk: 0.01, payout: 0.2952, utdArHojda: 49, buybackYield: 0.0178, insiders: 0.32,
    revTillvaxtTTM: 0.058, nettoTillvaxtTTM: 0.056,
    beta: 1.09, v52Spann: [289.86, 377.77], mcapForandr: -0.136,
    effSkatt: 0.2301, altmanZ: 3.55, piotroskiF: 5,
    aktier: 241.33, anstallda: 64249, omsPerAnstalld: 0.379933,
    rev3yProg: 0.0526, eps3yProg: 0.0981,
    rapport: "2026-10-27", analytiker: "Buy mål 391,00 (+24,1 %), 27 st", exDatum: "2026-08-21",
    bruttoMargAr: [0.4283, 0.4210, 0.4667, 0.4847, 0.4885],   // FY2021..FY2025
    serier: { ar: ["2021", "2022", "2023", "2024", "2025"], oms: [19945, 22149, 23052, 23099, 23574], netto: [1864, 2020, 2389, 2681, 2569], fcf: [1873, 1275, 2634, 2083, 2654] },
    utdBetalda: [587.1, 618.5, 623.7, 723.4, 789.8],           // FY2021..FY2025 MUSD
    terkop: [2752, 883.2, 1432, 1739, 1656],                   // FY2021..FY2025 MUSD (TTM 2 623)
  },
  CF: {
    pris: 132.50, mcapMdr: 20.05,
    pe: 9.96, peFwd: 10.65, pegKalla: null, pb: 3.53, evEbit: 7.16, evEbitda: 5.52,
    bruttoM: 0.4249, ebitM: 0.3857, nettoM: 0.2712, fcfM: 0.2468,
    roe: 0.2987, roa: 0.1293, roic: 0.2451, roce: 0.2083, wacc: 0.0606,
    skuldEk: 0.41, rantaTack: 17.46, currentRatio: 4.86,
    skuldMdr: 3.61, kassaMdr: 2.48,
    fcfTTM: 1910, ocfTTM: 2977, capexTTM: 1067, revTTM: 7739, nettoTTM: 2099, epsTTM: 13.44, ebitTTM: 2985,
    dps: 2.40, direktAvk: 0.018, payout: 0.1563, utdArHojda: null, buybackYield: 0.0851, insiders: 0.53,
    revTillvaxtTTM: 0.20, nettoTillvaxtTTM: 0.612,
    beta: 0.40, v52Spann: [75.42, 141.96], mcapForandr: 0.457,
    effSkatt: 0.1835, altmanZ: 3.34, piotroskiF: 7,
    aktier: 151.34, anstallda: 2900, omsPerAnstalld: 2.67,
    rev3yProg: -0.0084, eps3yProg: -0.02,
    rapport: "2026-11-04", analytiker: "Hold mål 125,25 (−5,5 %), 21 st", exDatum: "2026-08-14",
    bruttoMargAr: [0.3651, 0.5240, 0.3838, 0.3464, 0.3845],   // FY2021..FY2025
    serier: { ar: ["2021", "2022", "2023", "2024", "2025"], oms: [6538, 11186, 6631, 5936, 7084], netto: [917, 3346, 1525, 1218, 1455], fcf: [2359, 3402, 2258, 1753, 1802] },
    utdBetalda: [260, 306, 311, 364, 326],                     // FY2021..FY2025 MUSD
    terkop: [550, 1370, 602, 1535, 1379],                       // FY2021..FY2025 MUSD
    capexAr: [514, 453, 499, 518, 950],                         // FY2021..FY2025 MUSD
  },
};

// ── härledda tal + aritmetikgrind (abort FÖRE skrivning) ─────────────────────
const cagr = (a, b, perioder) => Math.pow(b / a, 1 / perioder) - 1;
const FEL = [];
const jamfor = (namn, calc, ext, tol) => {
  const ok = Math.abs(calc - ext) <= tol;
  if (!ok) FEL.push(`${namn}: beräknat ${calc} mot externt ${ext} (tol ${tol})`);
  return ok;
};

// NUE
{
  const n = K.NUE;
  const prognos = n.pe / n.peFwd - 1;                        // +0,8619
  jamfor("NUE prognosTillväxt", prognos, 0.8619, 0.0005);
  jamfor("NUE peg-spår", n.pe / (prognos * 100), 0.2457, 0.005);
  jamfor("NUE revCAGR", cagr(n.serier.oms[0], n.serier.oms[4], 4), -0.0285, 0.0005);
  jamfor("NUE resCAGR", cagr(n.serier.netto[0], n.serier.netto[4], 4), -0.289, 0.001);
  jamfor("NUE fcfMarginal", n.fcfTTM / n.revTTM, 0.0439, 0.0005);
  jamfor("NUE fcfYield", n.fcfTTM / (n.mcapMdr * 1000), 0.027, 0.0005);
  jamfor("NUE EV-replik", n.mcapMdr + n.skuldMdr - n.kassaMdr, 63.14, 0.02);
  jamfor("NUE EV/EBIT-avvik", (n.mcapMdr + n.skuldMdr - n.kassaMdr) / (n.ebitTTM / 1000) / n.evEbit - 1, -0.022, 0.01);
  jamfor("NUE moat-medel", n.bruttoMargAr.reduce((a, b) => a + b, 0) / 5, 0.217, 0.0005);
  jamfor("NUE moat-spread", Math.max(...n.bruttoMargAr) - Math.min(...n.bruttoMargAr), 0.1825, 0.0005);
  jamfor("NUE direktavkastning", n.dps / n.pris, n.direktAvk, 0.0005);
  jamfor("NUE payout", n.dps / n.epsTTM, n.payout, 0.0005);
  jamfor("NUE fcf-serie", n.ocfTTM - n.capexTTM, n.fcfTTM, 1);
  if (n.serier.ar.length !== 5 || n.serier.oms.length !== 5 || n.serier.netto.length !== 5 || n.serier.fcf.length !== 5) FEL.push("NUE serielängder");
}
// SHW
{
  const s = K.SHW;
  const prognos = s.pe / s.peFwd - 1;                        // +0,1783
  jamfor("SHW prognosTillväxt", prognos, 0.1783, 0.0005);
  jamfor("SHW peg-spår", s.pe / (prognos * 100), 1.6607, 0.005);
  jamfor("SHW revCAGR", cagr(s.serier.oms[0], s.serier.oms[4], 4), 0.0427, 0.0005);
  jamfor("SHW resCAGR", cagr(s.serier.netto[0], s.serier.netto[4], 4), 0.0834, 0.001);
  jamfor("SHW fcfMarginal", s.fcfTTM / s.revTTM, s.fcfM, 0.0005);
  jamfor("SHW fcfYield", s.fcfTTM / (s.mcapMdr * 1000), 0.0422, 0.0005);
  jamfor("SHW EV-replik", s.mcapMdr + s.skuldMdr - s.kassaMdr, 90.79, 0.02);
  jamfor("SHW EV/EBIT-avvik", (s.mcapMdr + s.skuldMdr - s.kassaMdr) / (s.ebitTTM / 1000) / s.evEbit - 1, -0.016, 0.01);
  jamfor("SHW moat-medel", s.bruttoMargAr.reduce((a, b) => a + b, 0) / 5, 0.4578, 0.0005);
  jamfor("SHW moat-spread", Math.max(...s.bruttoMargAr) - Math.min(...s.bruttoMargAr), 0.0675, 0.0005);
  jamfor("SHW direktavkastning", s.dps / s.pris, 0.010155, 0.0005);
  jamfor("SHW payout", s.dps / s.epsTTM, s.payout, 0.0005);
  jamfor("SHW identitet P/B÷ROE≈P/E", s.pb / s.roe / s.pe - 1, 0.0416, 0.005);
  jamfor("SHW fcf-serie", s.ocfTTM - s.capexTTM, s.fcfTTM, 1);
  if (s.serier.ar.length !== 5 || s.serier.oms.length !== 5 || s.serier.netto.length !== 5 || s.serier.fcf.length !== 5) FEL.push("SHW serielängder");
}
// CF
{
  const c = K.CF;
  const prognos = c.pe / c.peFwd - 1;                        // −0,0648
  jamfor("CF prognosTillväxt", prognos, -0.0648, 0.0005);
  jamfor("CF revCAGR", cagr(c.serier.oms[0], c.serier.oms[4], 4), 0.0203, 0.0005);
  jamfor("CF resCAGR", cagr(c.serier.netto[0], c.serier.netto[4], 4), 0.1223, 0.001);
  jamfor("CF fcfMarginal", c.fcfTTM / c.revTTM, c.fcfM, 0.0005);
  jamfor("CF fcfYield", c.fcfTTM / (c.mcapMdr * 1000), 0.0953, 0.0005);
  jamfor("CF EV-replik", c.mcapMdr + c.skuldMdr - c.kassaMdr, 21.18, 0.02);
  jamfor("CF EV/EBIT-avvik", (c.mcapMdr + c.skuldMdr - c.kassaMdr) / (c.ebitTTM / 1000) / c.evEbit - 1, -0.009, 0.01);
  jamfor("CF moat-medel", c.bruttoMargAr.reduce((a, b) => a + b, 0) / 5, 0.4008, 0.0005);
  jamfor("CF moat-spread", Math.max(...c.bruttoMargAr) - Math.min(...c.bruttoMargAr), 0.1776, 0.0005);
  jamfor("CF direktavkastning", c.dps / c.pris, 0.018113, 0.0005);
  jamfor("CF payout mot TTM-EPS", c.dps / c.epsTTM, 0.1786, 0.0005);
  if (prognos >= 0) FEL.push("CF PEG-måste-vara-null — prognosen är ej negativ");
  if (c.serier.ar.length !== 5 || c.serier.oms.length !== 5 || c.serier.netto.length !== 5 || c.serier.fcf.length !== 5) FEL.push("CF serielängder");
}

if (FEL.length) {
  console.error("ABORT — aritmetikgrind RÖD:");
  for (const f of FEL) console.error("  ✗ " + f);
  process.exit(1);
}
console.log("ARITMETIK GRÖN — samtliga kontroller inom tolerans");

// ── rader (konventionsenliga; noteringar dokumenterar konventioner+fynd) ─────
const rader = [];
if (!har("NUE")) rader.push({
  ticker: "NUE", namn: "Nucor Corporation", bransch: "material", land: "USA", valuta: "USD",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-18", url: "https://stockanalysis.com/stocks/nue/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/)",
    paranoid: "S&P Global Market Intelligence + Fiscal.ai-underlag (financials uppdaterad 2026-08-12, TTM-fönster till 2026-07-04); intraday 2026-09-18 09:11 EDT 258,88 $/58,73 mdr; P/E 21,17 forward 11,37 ⇒ prognosTillväxt +86,2 % TTE (stålcykelns vändningsgap: TTM-netto +122,5 % på EPS 7,52→12,52 — källans PEG 0,36 mot spårkonventionen 21,17÷86,2 = 0,25: källan diskonterar vändningseffekten); P/B 2,72 EV/EBIT 15,49 (källa; replik på TTM-EBIT 4,168 mdr ger 15,15 = −2,2 % — källan räknar på normaliserad EBIT, dokumenterad avvik); brutto TTM 15,55 % EBIT 11,54 % netto 7,96 %; ROE 14,55 % ROA 7,32 % ROIC 12,05 % ROCE 13,14 % WACC 13,23 % (ROIC UNDER WACC = −1,18 pp — vändningsårets kompressionsartefakt, ARM-klassens mönster med väntetillväxt); skuld 7,10 mdr kassa 2,69 mdr ⇒ NETTOSKULD 4,41 mdr (EV 63,14 = 58,73+4,41 EXAKT); räntetäckning 28,74× kassafläck 2,51; aktier 226,88 M EPS TTM 12,52; TTM oms 36 101 M (+17,2 %) netto 2 873 M (+122,5 %) OCF 4 424 M capex 2 841 M ⇒ FCF 1 583 M (fcfYield 2,70 % härlett; källans FCF-yield-panel 2,63 % — fönsterskillnad dokumenterad); utdelning 2,24 $/aktie (0,87 %) payout 17,89 % — 53 RAKA ÅR av höjningar (universumets längsta kedja: CNQ 10, SHW 49, JNJ-klassen); återköp 1,80 % insiders 0,56 % institutioner 80,12 %; beta 1,88; 52-v 131,32–280,11 (mcap +79,0 % år); eff skatt 20,68 %; Altman Z 4,6 Piotroski F 7; 33 000 anställda 1,09 MUSD oms/anställd; nästa rapp 2026-10-26; analytiker Buy 285,19 (17 st); Industry Steel, Sector Materials — branschfältet material källkonsekvent med SSAB-familjen" }],
  hamtat: "2026-09-18",
  pris: 258.88, marknadsKapitalMdr: 58.73,
  tillvaxt: { omsattningCAGR5ar: -0.0285, resultatCAGR5ar: -0.289, omsattningTillvaxtTTM: 0.172, prognosTillvaxt: 0.8619 },
  lonksamhet: { roe: 0.1455, roic: 0.1205, bruttoMarginal: 0.1555, ebitMarginal: 0.1154, nettoMarginal: 0.0796, fcfMarginal: 0.0439 },
  stabilitet: { skuldEgenkapital: 0.31, rantaTackning: 28.74, fcfPositivaSenaste5: null, kassaManaderBurnRate: null, nyemissionerSenaste5ar: null },
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: 0.56 },
  moat: { bruttoMarginalMedel5ar: 0.217, bruttoMarginalSpread5ar: 0.1825, roeMedel5ar: null },
  vardering: { pe: 21.17, pb: 2.72, evEbit: 15.49, peg: 0.25, fcfYield: 0.027, egenKapitalMultipl: 2.72 },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: { ar: ["2021", "2022", "2023", "2024", "2025"], omsattning: [36484000000, 41512000000, 34714000000, 30734000000, 32494000000], resultat: [6795000000, 7576000000, 4508000000, 2018000000, 1737000000], egetKapital: [], fcf: [4609000000, 8124000000, 4898000000, 806000000, -188000000] },
  notering: "MINI-MILL-STÅLET CYKELN I EN RAD — universumets första USA-stålrad (SSAB:s amerikanska spegel) och USA/material-cellens tredje: bruttomarginal 30,3 → 30,2 → 22,6 → 13,4 → 12,0 % FY2021–2025 (moat-spread 18,25 pp — STÅLETS PRIS ÄR VALLGRAVEN, inte varumärket: 2021–22-takten mot 2024–25-botten) med TTM-VÄNDNINGEN 15,55 % och netto +122,5 % (1 737 → 2 873 MUSD rullande) —endpointresultatCAGR −28,9 %/år FY2021→25 fångar hela fallskördEN medan forward-gapet +86,2 % (P/E 21,17 mot fwd 11,37) speglar återkomsten (PEG spår 0,25 mot källans 0,36 — källan diskonterar, dokumenterat). KAPITALDISCIPLINEN ÄR SIGNATUREN: 53 RAKA ÅR av utdelningshöjningar (universumets längsta kedja — betalda utdelningar 483 → 534 → 515 → 522 → 512 MUSD platt genom botten) med payout 17,9 % — återköpen tar cykeln (3 349 → 732 MUSD) medan CAPEX-TRAPPAN GÅR UPPÅT I BOTTNEN: 1 622 → 1 948 → 2 214 → 3 173 → 3 422 MUSD (Nucors mill-expansioner — bygga när det är billigt; FY2025-FCF −188 MUSD = investeringsåret, TTM +1 583 igen). MINI-MILL-MODELLEN (EAF på skrot mot blandmasugn på malm) = kostnadscurvan i en cell — kontrasten mot gruvmetallerna NEM (fyndigheten 68 % brutto) och FCX (38 %): NUE 15,6 % brutto på 33 000 anställda och återvinnings-ledet. ROIC 12,05 % UNDER WACC 13,23 % = −1,18 pp (vändningsårets artefakt — ARM-klassens mönster: spreaden återhämtar med marginalen). Balansräkningens kuddar: räntetäckning 28,74×, Altman Z 4,6, Piotroski 7, kassalikviditet 2,51 vid beta 1,88 (stålcykeln i betaform — cellens högsta). PRISBILDEN: 52-v 131,32–280,11 med kursen 258,88 nära toppen (mcap +79 % år) — marknaden har hunnit prissätta vändningen; analytiker Buy 285,19 (17 st); nästa rapp 2026-10-26.",
});
if (!har("SHW")) rader.push({
  ticker: "SHW", namn: "The Sherwin-Williams Company", bransch: "material", land: "USA", valuta: "USD",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-18", url: "https://stockanalysis.com/stocks/shw/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/)",
    paranoid: "S&P Global Market Intelligence + Fiscal.ai-underlag (financials uppdaterad 2026-07-28, TTM-fönster till 2026-06-30); intraday 2026-09-18 09:30 EDT 315,14 $/76,05 mdr; P/E 29,61 forward 25,13 ⇒ prognosTillväxt +17,8 % TTE (PEG spår 1,66 mot källans 2,20 — källan räknar på 3-års-EPS +9,81 %/år, spåret på TTE-gapet); P/B 20,09 EV/EBIT 23,15 EV/EBITDA 19,58 (EV/EBIT-replik på TTM-EBIT 3,983 mdr: 90,79÷3,983 = 22,79 = −1,6 % mot källan, dokumenterad avvik); brutto TTM 48,98 % EBIT 16,31 % netto 11,01 % FCF 13,16 % (källans FCF-marginal 13,16 % EXAKT); ROE 65,12 % ROA 9,52 % ROIC 16,39 % ROCE 22,99 % WACC 9,01 % (ROIC över WACC +7,4 pp); IDENTITETSKONTROLLEN P/B ÷ ROE = 20,09 ÷ 65,12 % = 30,8 mot P/E 29,61 (+4,2 % — DuPont-banden håller inom normal avvik); skuld 15,03 mdr kassa 0,29 mdr ⇒ NETTOSKULD 14,74 mdr (EV 90,79 = 76,05+14,74 EXAKT); skuld/EK 3,90 (!) räntetäckning 7,71× kassalikviditet 0,73 — belåning som strategi ( återköpsfinansierad balansräkning: equity 3,79 mdr på mcap 76,05); aktier 241,33 M EPS TTM 10,84; TTM oms 24 410 M (+5,8 %) netto 2 688 M (+5,6 %) OCF 3 887 M capex 674 M ⇒ FCF 3 213 M (fcfYield 4,22 % härlett; källans panel 4,15 % — fönsterskillnad); utdelning 3,20 $/aktie (1,00 %) payout 29,52 % — 49 ÅR av höjningar (universumets näst längsta kedja efter NUE 53); återköp 1,78 % (TTM-återköp 2 623 MUSD — högsta sedan FY2021) insiders 0,32 % institutioner 85,06 %; beta 1,09; 52-v 289,86–377,77 (mcap −13,6 % år); ex 2026-08-21; eff skatt 23,01 %; Altman Z 3,55 Piotroski F 5; 64 249 anställda 0,38 MUSD oms/anställd (målarbutikernas folkarmé — cellens folkrikaste); 3-årsprognos intäkt +5,26 %/år EPS +9,81 %/år; nästa rapp 2026-10-27; analytiker Buy 391,00 (27 st); Industry Specialty Chemicals, Sector Materials — branschfältet material källkonsekvent" }],
  hamtat: "2026-09-18",
  pris: 315.14, marknadsKapitalMdr: 76.05,
  tillvaxt: { omsattningCAGR5ar: 0.0427, resultatCAGR5ar: 0.0834, omsattningTillvaxtTTM: 0.058, prognosTillvaxt: 0.1783 },
  lonksamhet: { roe: 0.6512, roic: 0.1639, bruttoMarginal: 0.4898, ebitMarginal: 0.1631, nettoMarginal: 0.1101, fcfMarginal: 0.1316 },
  stabilitet: { skuldEgenkapital: 3.9, rantaTackning: 7.71, fcfPositivaSenaste5: null, kassaManaderBurnRate: null, nyemissionerSenaste5ar: null },
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: 0.32 },
  moat: { bruttoMarginalMedel5ar: 0.4578, bruttoMarginalSpread5ar: 0.0675, roeMedel5ar: null },
  vardering: { pe: 29.61, pb: 20.09, evEbit: 23.15, peg: 1.66, fcfYield: 0.0422, egenKapitalMultipl: 20.09 },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: { ar: ["2021", "2022", "2023", "2024", "2025"], omsattning: [19945000000, 22149000000, 23052000000, 23099000000, 23574000000], resultat: [1864000000, 2020000000, 2389000000, 2681000000, 2569000000], egetKapital: [], fcf: [1873000000, 1275000000, 2634000000, 2083000000, 2654000000] },
  notering: "FÄRGVARUMÄRKET — CELLENS MOAT-MOTPOL: bruttomarginal STIGANDE 42,8 → 42,1 → 46,7 → 48,5 → 48,9 % FY2021–2025 (spread endast 6,75 pp — PRISSETTNINGSMAKTEN: prishöjningarna gick SNABBARE än råvarukostnaden genom inflationsåren; kontrast i samma cell: NUE 18,3 pp spridning på stålpriset, CF 17,8 pp på gödselpriset — SHW:s 6,8 pp är varumärkes-vallgravens kvantifiering); USA:s största färgbolag med 64 249 anställda (0,38 MUSD oms/anställd — butiks- och konsultrörelsens folkarmé mot CF:s 2 900 tekniker på 2,67 MUSD/anställd: 7× skillnad i kapitalintensitet per anställd, samma branschfält). DUPOINT-SPELLET: ROE 65,12 % vid P/B 20,09 — identitetskontrollen P/B ÷ ROE = 30,8 ≈ P/E 29,61 (+4,2 %) visar att det extremt höga aktieägaravklandet är BELÅNINGENS algebra (skuld/EK 3,90, kassalikviditet 0,73, nettoskuld 14,74 mdr mot equity 3,79 — återköpsfinansierad balansräkning) medan ROIC 16,39 % mot WACC 9,01 % = +7,4 pp visar den äkta avkastningen på KAPITALET. UTDELNINGEN 49 ÅR av höjningar (näst längst i universumet efter cellkollegan NUE:s 53 — USA/material blir utdelningskedjornas cell) på payout 29,5 %; TTM-återköpen accelererar 2 623 MUSD (högsta sedan 2021) på FCF 3 213 M (fcfYield 4,22 %). VÄRDERINGEN: P/E 29,61/EV/EBIT 23,15 = cellens toppmultiplar (motsats CF 9,96/7,16) — marknaden betalar för margin-stabiliteten; prognos-gap +17,8 % med PEG-spår 1,66 (källans 2,20 på 3-års-EPS +9,8 %/år). FCF-trappan 1 873 → 1 275 → 2 634 → 2 083 → 2 654 MUSD (byggåret 2022-capex 1 070 syns; sedan kapitalväxling mot återköp); beta 1,09; Altman 3,55; analytiker Buy 391,00 (27 st); nästa rapp 2026-10-27.",
});
if (!har("CF")) rader.push({
  ticker: "CF", namn: "CF Industries Holdings, Inc.", bransch: "material", land: "USA", valuta: "USD",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-18", url: "https://stockanalysis.com/stocks/cf/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/)",
    paranoid: "S&P Global Market Intelligence-underlag (financials uppdaterad 2026-08-06, TTM-fönster till 2026-06-30); intraday 2026-09-18 09:30 EDT 132,50 $/20,05 mdr; P/E 9,96 forward 10,65 ⇒ prognosTillväxt −6,5 % TTE (PEG NULL enligt CNQ/SAMPO-konventionen — negativt gap; källans 3-årsprognos EPS −2,0 %/år intäkt −0,84 %/år bekräftar normalisering-ned-bilden: gödselpriserna sedda över toppen); P/B 3,53 EV/EBIT 7,16 EV/EBITDA 5,52 (EV/EBIT-replik på TTM-EBIT 2,985 mdr: 21,18÷2,985 = 7,10 = −0,9 % mot källan — inom hållhake); brutto TTM 42,49 % EBIT 38,57 % netto 27,12 % FCF 24,68 % (NETTOMARGINAL ÖVER EBIT-MARGINALENS FAMILJ — räntekostnader låga + skatt 18,35 % + ränteinkomster på obligations-portföljen); ROE 29,87 % ROA 12,93 % ROIC 24,51 % ROCE 20,83 % WACC 6,06 % (ROIC−WACC = +18,45 pp — CELLENS BREDDASTE SPREAD: kvävefabrikerna på billig amerikansk gas); skuld 3,61 mdr kassa 2,48 mdr ⇒ nettoskuld 1,13 mdr (EV 21,18 = 20,05+1,13 EXAKT); skuld/EK 0,41 räntetäckning 17,46× kassalikviditet 4,86 (!); aktier 151,34 M EPS TTM 13,44; TTM oms 7 739 M (+20,0 %) netto 2 099 M (+61,2 %) OCF 2 977 M capex 1 067 M ⇒ FCF 1 910 M (fcfYield 9,53 % härlett; källans panel 9,43 % — fönsterskillnad); utdelning 2,40 $/aktie (1,80 %) HOJD 20 % till 0,60/kv i juli 2026 (källans payout-panel 15,63 % räknar på normaliserat underlag — på TTM-EPS 13,44 blir DPS/EPS 17,86 %, båda dokumenterade); återköp-yield 8,51 % (!) insiders 0,53 % institutioner 107,44 % (aktiv lång/lånad-aktie-artefakt — lent-long-ställningar över 100 %, dokumenterad); beta 0,40; 52-v 75,42–141,96 (mcap +45,7 % år); ex 2026-08-14; eff skatt 18,35 %; Altman Z 3,34 Piotroski F 7; 2 900 anställda 2,67 MUSD oms/anställd (universumets mest kapitaltunta per anställd — TCS 4,72 M INR ≈ 0,056 MUSD som kontrast: ~48×); nästa rapp 2026-11-04; analytiker Hold 125,25 (−5,5 % NEGATIV upside, 21 st — cellens enda under noll); Industry Agricultural Inputs, Sector Materials — branschfältet material källkonsekvent med YARA-paret" }],
  hamtat: "2026-09-18",
  pris: 132.5, marknadsKapitalMdr: 20.05,
  tillvaxt: { omsattningCAGR5ar: 0.0203, resultatCAGR5ar: 0.1223, omsattningTillvaxtTTM: 0.2, prognosTillvaxt: -0.0648 },
  lonksamhet: { roe: 0.2987, roic: 0.2451, bruttoMarginal: 0.4249, ebitMarginal: 0.3857, nettoMarginal: 0.2712, fcfMarginal: 0.2468 },
  stabilitet: { skuldEgenkapital: 0.41, rantaTackning: 17.46, fcfPositivaSenaste5: null, kassaManaderBurnRate: null, nyemissionerSenaste5ar: null },
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: 0.53 },
  moat: { bruttoMarginalMedel5ar: 0.4008, bruttoMarginalSpread5ar: 0.1776, roeMedel5ar: null },
  vardering: { pe: 9.96, pb: 3.53, evEbit: 7.16, peg: null, fcfYield: 0.0953, egenKapitalMultipl: 3.53 },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: { ar: ["2021", "2022", "2023", "2024", "2025"], omsattning: [6538000000, 11186000000, 6631000000, 5936000000, 7084000000], resultat: [917000000, 3346000000, 1525000000, 1218000000, 1455000000], egetKapital: [], fcf: [2359000000, 3402000000, 2258000000, 1753000000, 1802000000] },
  notering: "KVÄVEKEDJAN OCH YARA-PARET — naturgas → ammoniak → gödsel → MAT: universumets kväverads amerikanska halva (YAR.OL redan i cellen) med KOSTNADS-VALLGRAVEN I GEOLOGIN: samma molekyl, olika gaskostnad — Henry Hub-gas mot Europas TTF gör USA-fabrikerna strukturellt billigare (FY2022 BEVISAR DET: gasprischocken + Ukraina-krigets gödselfrånvaro gav netto 3 346 MUSD vid bruttomarginal 52,4 % — cellens ENDA år över 50); MOAT-SERIEN 36,5 → 52,4 → 38,4 → 34,6 → 38,5 % (spread 17,76 pp — gödselpriset är vallgraven, kontrast SHW 6,8). CYKELNS KVADRAT FY2021 917 → FY2022 3 346 → FY2024-botten 1 218 → TTM 2 099 MUSD (+61,2 % rullande): endpointresultatCAGR +12,2 %/år fast ingen enda normalårsstapel är 'normal'. KAPITALÅTERGÅNGSMASKINEN: buyback-yield 8,51 % (återköp 550 → 1 370 → 602 → 1 535 → 1 379 MUSD) + utdelningen HOJD 20 % till 0,60 $/kv i juli 2026 — på kassalikviditet 4,86 och Piotroski 7; institutionsandelen 107,44 % = lent-long-artefakten (aktiv lång + utlåning > hela bolaget, dokumenterad kuriosa). ROIC 24,51 % mot WACC 6,06 % = +18,45 pp CELLENS BREDDASTE — och EV/EBIT 7,16/PEG null/P/E 9,96 cellens LÄGSTA: VÄRDERINGENS SPEGEL av ROIC-spridningen (marknaden betalar 23× EBIT för SHW:s stabila 49-%-brutto men 7× för CF:s cykliska 42 — kvartilpedagogikens kärna på kommande /dataset/material/usa). PROGNOSBILDEN NEGATIV: gap −6,5 % (P/E 9,96 mot fwd 10,65) med 3-årsprognos EPS −2,0 %/år — marknaden ser gödselpriser över toppen (Hold-målet 125,25 = −5,5 % — universumets sällsynta negativa analytiker-upside); PEG NULL enligt CNQ/SAMPO-konventionen. CAPEX-TRAPPAN 514 → 453 → 499 → 518 → 950 MUSD: blå-ammoniak-energiprojekten (ACES/Donaldsonville-klassen) startar — koldioxidfri ammoniak som framtidens skeppsbränsle är optionen bakom talen; Waggaman-förvärvet 1 223 MUSD FY2023 i serien. 2 900 anställda på 2,67 MUSD oms/anställd — processindustrins renodling (kontrast SHW:s 64 249 butiksanknutna i SAMMA branschfält). beta 0,40; nästa rapp 2026-11-04.",
});

if (rader.length === 0) {
  console.log("IDEMPOTENT: samtliga tre tickers finns redan — inget att göra.");
  process.exit(0);
}

// ── innehållsintegritet: gamla rader orörda (bevis efter skrivning) ──────────
const gamlaJson = JSON.stringify(u);

u.push(...rader);
writeFileSync(FIL, JSON.stringify(u, null, 1) + "\n");

const efter = JSON.parse(readFileSync(FIL, "utf8"));
const gamlaI = JSON.stringify(efter.slice(0, innan));
console.log(`APPEND: ${innan} → ${efter.length} (+${rader.length}: ${rader.map((r) => r.ticker).join(", ")})`);
console.log(`GAMLA RADER: ${gamlaI === gamlaJson ? "INNEHÅLLSIDENTISKA (0 förändrade)" : "FÖRÄNDRADE — FEL!"}`);
if (gamlaI !== gamlaJson) process.exit(1);
const m = efter.filter((b) => b.land === "USA" && b.bransch === "material" && typeof b.vardering?.pe === "number");
console.log(`USA/MATERIAL: ${m.length} P/E-mätbara — ${m.map((b) => b.ticker + " " + b.vardering.pe).join(" · ")}`);
const mat = efter.filter((b) => b.bransch === "material" && typeof b.vardering?.pe === "number");
const pes = mat.map((b) => b.vardering.pe).sort((a, b) => a - b);
console.log(`MATERIAL (alla länder): n=${pes.length} · sorterade P/E: ${pes.map((x) => Math.round(x * 100) / 100).join(" ")}`);
