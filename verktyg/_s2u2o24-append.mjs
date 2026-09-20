#!/usr/bin/env node
/**
 * _s2u2o24-append.mjs — AUTO-S2 omgång 24 u2: OR.PA + 000660.KS in i
 * bolagsunivers.json (231→233). Aritmetikgrind med ABORT FÖRE skrivning
 * (omg22/23-mönstret: första körningen ABORTAR vid rött — filen orörd).
 * Frankrike/konsument 1→2 (LVMH + L'Oréal) + Sydkorea/teknik 1→2
 * (Samsung + SK hynix) = TVÅ KONTRAST-CELLER.
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const HAMTAT = "2026-09-20";

// ── Källpaket: OR.PA L'Oréal (EPA-primär, stockanalysis.com, close 2026-09-18) ─
const OR = {
  ticker: "OR.PA", namn: "L'Oréal", bransch: "konsument", land: "Frankrike",
  valuta: "EUR", hamtat: HAMTAT, pris: 376.05, mcapMdr: 200.20,
  aktierM: 532.39, aktierFY25: 533.78, aktierFY21: 535.41, // miljoner
  epsTTM: 11.78, peFalt: 31.93, peFwd: 26.37, pegKalla: 2.91,
  ps: 4.41, pbFalt: 5.91, ptbv: 20.34, bvps: 63.56, tbv: 9844,
  evMdr: 212.92, evEbit: 23.12, evEbitdaFalt: 19.66, ebitdaTTM: 10350,
  bruttoTTM: 33735, ebitTTM: 9206, nettoTTM: 6306, revTTM: 45355,
  roe: 0.1941, roa: 0.0951, roic: 0.1430, wacc: 0.0859,
  bruttoMarg: 0.7438, ebitMarg: 0.2030, nettoMarg: 0.1390, fcfMarg: 0.1663,
  ocfTTM: 8988, capexTTM: 1446, fcfTTM: 7543,
  kassa: 4049, skuld: 16713, nettoskuld: 12664, ekTotal: 33889, ekCommon: 33840,
  skuldEk: 0.49, rantaTackning: 20.74,
  dps: 7.20, yieldFalt: 0.0192, payoutFalt: 0.6347, dpsTillvaxt: 0.0286,
  buybackYield: 0.0011, shareholderYield: 0.0203,
  utdTTM: 4003,
  serirAr: ["2021", "2022", "2023", "2024", "2025"],
  oms: [32288, 38261, 41183, 43487, 44052],        // M EUR
  res: [4597, 5707, 6184, 6409, 6127],             // M EUR
  ekTotalSerie: [23593, 27187, 29082, 33138, 35004], // M EUR
  fcfSerie: [5653, 4935, 6116, 6644, 7162],        // M EUR
  bruttoSerie: [23854, 27683, 30416, 32260, 32739], // M EUR
  topp52: 405.80, botten52: 338.85,
};

// ── Källpaket: 000660.KS SK hynix (KRX-primär, stockanalysis.com, close 2026-09-18) ─
const SKH = {
  ticker: "000660.KS", namn: "SK hynix", bransch: "teknik", land: "Sydkorea",
  valuta: "KRW", hamtat: HAMTAT, pris: 1857000, mcapTdrMdr: 1353500, // mdr KRW (1 353,50 T)
  aktierStatM: 728.87, aktierBS: 711.08, aktierFY25: 701.69, aktierFY21: 687.62, // miljoner
  epsTTM: 227588.30, peFalt: 8.16, peFwd: 4.54, pegKalla: 0.06,
  ps: 7.15, pbFalt: 5.15, ptbv: 5.24, bvpsBS: 368991.21,
  evTdr: 1318490, evEbit: 10.29, evEbitda: 9.22, // mdr KRW resp. multipler
  bruttoTTM: 144276245, ebitTTM: 128705855, nettoTTM: 161965390, revTTM: 189170615, // M KRW
  pretaxMargFalt: 1.0930,
  roe: 0.9268, roa: 0.3366, roic: 0.6159, wacc: 0.1716,
  bruttoMarg: 0.7627, ebitMarg: 0.6803, nettoMarg: 0.8562, fcfMarg: 0.4847,
  ocfTTM: 126925786, capexTTM: 35232021, fcfTTM: 91693765, // M KRW
  kassa: 87980983, skuld: 21113139, nettokassa: 66867844, // M KRW
  ekTotal: 262693228, ekCommon: 262380610, // M KRW
  skuldEk: 0.08, rantaTackning: 167.80,
  dps: 3000, yieldFalt: 0.0016, payoutFalt: 0.0132, dpsTillvaxt: 0.4606,
  utdTTM: 2116417, // M KRW
  serirAr: ["2021", "2022", "2023", "2024", "2025"],
  oms: [42997792, 44621568, 32765719, 66192960, 97146675],   // M KRW
  res: [9602316, 2229560, -9112428, 19788681, 42919287],     // M KRW
  ekTotalSerie: [62191058, 63290542, 53503752, 73915704, 120666751], // M KRW
  fcfSerie: [7311013, -4229744, -4046947, 13850351, 25854202], // M KRW
  bruttoSerie: [18952192, 15627855, -533448, 31828146, 58690790], // M KRW
  nettokassaFY23: -23723638, // M KRW
  topp52: 2987000, botten52: 333000,
};

// ── Aritmetikgrind (ABORT vid rött; inget skrivs förrån alla gröna) ──────────
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

// OR-kontroller
K("OR-1 omsCAGR", Math.round(cagr(32288, 44052) * 10000) / 10000, 0.0808, 0.0005);
K("OR-2 resCAGR", Math.round(cagr(4597, 6127) * 10000) / 10000, 0.0744, 0.0005);
K("OR-3 prognosTillväxt TTE", OR.peFalt / OR.peFwd - 1, 0.21084, 0.001);
K("OR-4 PEG spårkonvention", Math.round((OR.peFalt / ((OR.peFalt / OR.peFwd - 1) * 100)) * 100) / 100, 1.51, 0.005);
K("OR-5 PS-replik", OR.mcapMdr / (OR.revTTM / 1000), 4.41, 0.01);
K("OR-6 P/B pris/BVPS (fält 5,91 ✓)", OR.pris / OR.bvps, 5.9157, 0.001);
K("OR-7 P/E-fält = pris/EPS-TTM (EXAKT replik, ingen källspridning)", OR.pris / OR.epsTTM, 31.927, 0.005);
K("OR-8 mcap-replik aktier×pris", OR.aktierM * OR.pris / 1000, 200.20, 0.05);
K("OR-9 EV-replik mcap+nettoskuld", OR.mcapMdr + OR.nettoskuld / 1000, 212.864, 0.07);
K("OR-10 EV/EBIT-replik", OR.evMdr * 1000 / OR.ebitTTM, 23.126, 0.01);
K("OR-11 EV/EBITDA källspridning (dok. +4,6 %)", OR.evMdr * 1000 / OR.ebitdaTTM, 20.569, 0.01);
K("OR-12 bruttomarginal TTM", OR.bruttoTTM / OR.revTTM, 0.74379, 0.0005);
K("OR-13 EBIT-marginal TTM", OR.ebitTTM / OR.revTTM, 0.20300, 0.0005);
K("OR-14 nettomarginal TTM", OR.nettoTTM / OR.revTTM, 0.13904, 0.0005);
K("OR-15 FCF-marginal TTM", OR.fcfTTM / OR.revTTM, 0.16632, 0.0005);
K("OR-16 FCF = OCF − capex (källavrundning 1 M)", OR.ocfTTM - OR.capexTTM, 7542, 1.5);
K("OR-17 direktavkastning", OR.dps / OR.pris, 0.019147, 0.00005);
K("OR-18 shareholder yield summa", OR.yieldFalt + OR.buybackYield, 0.0203, 0.0005);
K("OR-19 skuld/EK", OR.skuld / OR.ekTotal, 0.49315, 0.001);
K("OR-20 ROA-replik netto/tillgångar", OR.nettoTTM / 66354, 0.09503, 0.0005);
K("OR-21 aktiebas FY21→TTM", OR.aktierM / OR.aktierFY21 - 1, -0.00564, 0.0005);
K("OR-22 TTM-tillväxt mot FY2025", OR.revTTM / 44052 - 1, 0.029576, 0.0005);
K("OR-23 bruttomarginal-medel 5 år", OR.bruttoSerie.reduce((s, g, i) => s + g / OR.oms[i], 0) / 5, 0.73718, 0.0005);
K("OR-24 brutto-spread 5 år (smal — moat-signatur)", Math.max(...OR.bruttoSerie.map((g, i) => g / OR.oms[i])) - Math.min(...OR.bruttoSerie.map((g, i) => g / OR.oms[i])), 0.01987, 0.0005);
K("OR-25 payout-replik TTM (fält 63,47 bär annan EPS-bas, dok.)", OR.dps / OR.epsTTM, 0.61121, 0.001);
K("OR-26 utdelning/FCF TTM", OR.utdTTM / OR.fcfTTM, 0.53065, 0.001);
K("OR-27 BVPS common (källa 63,56)", OR.ekCommon / OR.aktierM, 63.56, 0.01);
K("OR-28 P/TBV-replik", OR.pris / (OR.tbv / OR.aktierM), 20.339, 0.01);
K("OR-29 toppavstånd 52-v", OR.pris / OR.topp52 - 1, -0.07335, 0.001);
K("OR-30 serielängder 4×5", [OR.oms, OR.res, OR.ekTotalSerie, OR.fcfSerie].every(s => s.length === 5) ? 1 : 0, 1, 0);

// SKH-kontroller
K("SKH-1 omsCAGR", Math.round(cagr(42997792, 97146675) * 10000) / 10000, 0.2259, 0.0005);
K("SKH-2 resCAGR", Math.round(cagr(9602316, 42919287) * 10000) / 10000, 0.4541, 0.0005);
K("SKH-3 prognosTillväxt TTE", SKH.peFalt / SKH.peFwd - 1, 0.79736, 0.001);
K("SKH-4 PEG spårkonvention", Math.round((SKH.peFalt / ((SKH.peFalt / SKH.peFwd - 1) * 100)) * 1000) / 1000, 0.102, 0.005);
K("SKH-5 PS-replik (mdr/mdr)", SKH.mcapTdrMdr * 1000 / SKH.revTTM, 7.1534, 0.01);
K("SKH-6 P/B tvålava pris/BVPS (fält 5,15 +2,3 % snitt-EK, dok.)", SKH.pris / SKH.bvpsBS, 5.0327, 0.001);
K("SKH-7 P/E-fält = pris/EPS-TTM (EXAKT replik)", SKH.pris / SKH.epsTTM, 8.1601, 0.001);
K("SKH-8 P/E-fält vs mcap/netto (fältet −2,3 %, aktiebasskillnad dok.)", SKH.mcapTdrMdr * 1000 / SKH.nettoTTM, 8.3563, 0.01);
K("SKH-9 mcap-replik aktier×pris (mdr KRW)", SKH.aktierStatM * SKH.pris / 1e3, 1353510.6, 10);
K("SKH-10 EV-replik mcap−nettokassa (fält +2,5 % över, dok.)", SKH.mcapTdrMdr - SKH.nettokassa / 1e3, 1286632.16, 100);
K("SKH-11 EV/EBIT-replik", SKH.evTdr / (SKH.ebitTTM / 1e3), 10.2443, 0.01);
K("SKH-12 bruttomarginal TTM", SKH.bruttoTTM / SKH.revTTM, 0.76270, 0.0005);
K("SKH-13 EBIT-marginal TTM", SKH.ebitTTM / SKH.revTTM, 0.68035, 0.0005);
K("SKH-14 nettomarginal TTM (netto ÖVER EBIT — icke-operativ bärare)", SKH.nettoTTM / SKH.revTTM, 0.85618, 0.0005);
K("SKH-15 FCF-marginal TTM", SKH.fcfTTM / SKH.revTTM, 0.48467, 0.0005);
K("SKH-16 FCF = OCF − capex EXAKT", SKH.ocfTTM - SKH.capexTTM, 91693765, 1);
K("SKH-17 direktavkastning", SKH.dps / SKH.pris, 0.0016153, 0.000005);
K("SKH-18 skuld/EK", SKH.skuld / SKH.ekTotal, 0.08037, 0.0005);
K("SKH-19 aktiebas BS FY21→TTM", SKH.aktierBS / SKH.aktierFY21 - 1, 0.03412, 0.0005);
K("SKH-20 bruttomarginal-medel 5 år", SKH.bruttoSerie.reduce((s, g, i) => s + g / SKH.oms[i], 0) / 5, 0.37198, 0.0005);
K("SKH-21 brutto-spread 5 år (universumets bredaste — cykelsignatur)", Math.max(...SKH.bruttoSerie.map((g, i) => g / SKH.oms[i])) - Math.min(...SKH.bruttoSerie.map((g, i) => g / SKH.oms[i])), 0.62047, 0.0005);
K("SKH-22 pretax-implied 109,30 % ⇒ icke-operativ post", SKH.pretaxMargFalt * SKH.revTTM - SKH.ebitTTM, 78061691, 100000);
K("SKH-23 netto > EBIT (konstaterande)", SKH.nettoTTM > SKH.ebitTTM ? 1 : 0, 1, 0);
K("SKH-24 balansvändning FY23→TTM (teckenbyte)", SKH.nettokassaFY23 < 0 && SKH.nettokassa > 0 ? 1 : 0, 1, 0);
K("SKH-25 utdelning/FCF TTM", SKH.utdTTM / SKH.fcfTTM, 0.02308, 0.0005);
K("SKH-26 BVPS common-bas", SKH.ekCommon / SKH.aktierBS, 368954, 100);
K("SKH-27 FY2023-minusåret (brutto+op+netto alla <0)", [SKH.bruttoSerie[2], SKH.oms[2] * 0 + SKH.res[2]].every(x => x < 0) && SKH.bruttoSerie[2] < 0 ? 1 : 0, 1, 0);
K("SKH-28 toppavstånd 52-v", SKH.pris / SKH.topp52 - 1, -0.37830, 0.001);
K("SKH-29 fcfPositivaSenaste5 = 3 av 5", SKH.fcfSerie.filter(x => x > 0).length, 3, 0);
K("SKH-30 serielängder 4×5", [SKH.oms, SKH.res, SKH.ekTotalSerie, SKH.fcfSerie].every(s => s.length === 5) ? 1 : 0, 1, 0);

console.log(`ARITMETIKGRIND: ${n - rok.length}/${n} GRÖNA`);
if (rok.length) {
  console.error("ABORT — röda kontroller (filen orörd):");
  for (const r of rok) console.error("  RÖD " + r);
  process.exit(1);
}

// ── Objekt (skrivs endast efter grön grind) ─────────────────────────────────
const orObj = {
  ticker: OR.ticker, namn: OR.namn, bransch: OR.bransch, land: OR.land,
  valuta: OR.valuta,
  kallor: [{
    namn: "StockAnalysis",
    hamtat: HAMTAT,
    url: "https://stockanalysis.com/quote/epa/OR/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/)",
    paranoid: "EPA-PRIMÄRNOTING i EUR (MC.PA/TTE.PA/ORA.PA/SAN.PA-precedenserna; underlag S&P Global Market Intelligence; close 2026-09-18 17:37 CET, −1,07 %): pris 376,05 EUR, mcap 200,20 mdr (aktier 532,39 M × 376,05 = 200,20 — 0,002 %; BS-TTM-samma aktiebas), 52-v 338,85–405,80 (−0,29 % på året; −7,3 % från toppen), P/E 31,93 = pris/EPS-TTM 11,78 = 31,927 EXAKT REPLIK (ingen källspridning på fältet — cellens renaste rad), fwd 26,37 ⇒ prognosTillväxt +21,1 % TTE, PEG 1,51 spårkonvention (källans 2,91 på 3-års EPS +8,58 %), PS 4,41 (replik 200,20/45,355 = 4,41 ✓), P/B 5,91 (pris/BVPS 376,05/63,56 = 5,916 ✓), P/TBV 20,34 (replik mot TBV 9 844 M/532,39 M ✓), EV 212,92 mdr (replik mcap+nettoskuld 212,86 — 0,03 %), EV/EBIT 23,12 (replik ✓), EV/EBITDA 19,66 (KÄLLSPRIDNING +4,6 %: replik 212 920/10 350 = 20,57 — källans EBITDA-bas torde skilja, dokumenterat), bruttomarginal 74,38 % TTM (replik 33 735/45 355 EXAKT; femårsserie 73,88/72,35/73,85/74,18/74,33 — spridning 1,98 pp, universumets smalaste klass), EBIT 20,30 % (EXAKT), netto 13,90 % (EXAKT), FCF-marginal 16,63 % (EXAKT), fcfYield 3,77 %, ROE 19,41 % ROA 9,51 % (replik 6 306/66 354 ✓) ROIC 14,30 % mot WACC 8,59 % (+5,7 pp; ROE−WACC +10,8 pp), effektiv skatt 27,67 %, kassa 4,05 mdr, skuld 16,71 mdr, nettoskuld 12,66 mdr (skulden 6,3→16,7 mdr FY21→TTM — förvärvsvågen syns i goodwill 11,1→17,7 och TTM cash-acquisitions −5 718 M med net borrowing +6 416; retained-earnings-dippen 24 294→3 547 TTM är REKLASSIFICERING till Comprehensive Income +26 676 enligt källans not, ej förlust), EK-total 33,89 mdr (trappa 23,59→35,00 mdr FY21→25), skuld/EK 0,49, räntetäckning 20,74, Altman 4,89, Piotroski 5, utdelning 7,20 EUR (1,92 %; replik 7,20/376,05 = 1,915 ✓) payout källfält 63,47 % (replik på TTM-EPS 61,1 % — källans bär annan EPS-bas, dokumenterad) DPS-tillväxt +2,86 % med FEM RAKA tillväxtår, utdelningar 2 352→4 003 M EUR FY21→TTM (53,1 % av FCF), återköp små ~501 M/år utom FY2021:s −10 061 M-engång (källraden som den är), aktiebas 535,41→532,39 M = −0,56 % på 4,5 år (statistics −0,11 % YoY), beta 0,89, institutioner 15,48 % insiders 1,31 % (lågt institutionsfält — stabilt familje-/strategiskt ägande utanför institutionsdefinitionen, notis utan siffror i extraktet), float 231,68 M, analytiker Buy PT 418,42 EUR (+11,27 %; 24 st), 79 033 anställda, grundat 1909, nästa rapp 2026-10-20 (Q3 2026); FY KALENDER: rev 32 288→38 261→41 183→43 487→44 052 mdr FY2021→25 (omsCAGR +8,08 %/år), brutto 23 854→32 739, operativ 6 150→8 883, netto 4 597→5 707→6 184→6 409→6 127 (resCAGR +7,44 %/år; FY2025 −4,4 % — asiatiska avmattningen), EPS 8,21→11,44 med TTM 11,78, TTM jun-26: rev 45 355 (+2,96 % källfält = replik ✓), brutto 33 735, operativ 9 206, netto 6 306; CF: OCF 6 728→8 988 (TTM), capex ~1,1–1,6 mdr/år, FCF 5 653→7 543 (TTM), branschfält Consumer Staples/Household & Personal Products — världens största skönhetskoncern, Frankrikes konsumentgren får sin andra bärare",
  }],
  hamtat: HAMTAT, pris: OR.pris, marknadsKapitalMdr: 200,
  tillvaxt: {
    omsattningCAGR5ar: 0.0808, resultatCAGR5ar: 0.0744,
    omsattningTillvaxtTTM: 0.0296, prognosTillvaxt: 0.2108,
  },
  lonksamhet: {
    roe: 0.1941, roic: 0.1430, bruttoMarginal: 0.7438,
    ebitMarginal: 0.2030, nettoMarginal: 0.1390, fcfMarginal: 0.1663,
  },
  stabilitet: {
    skuldEgenkapital: 0.49, rantaTackning: 20.74, fcfPositivaSenaste5: 5,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: null,
  },
  aterkop: { senasteArMdr: 4.003, andelUtestande: 0.0192, insiderkopSenaste6man: null },
  moat: { bruttoMarginalMedel5ar: 0.7372, bruttoMarginalSpread5ar: 0.0199, roeMedel5ar: null },
  vardering: {
    pe: 31.93, pb: 5.91, evEbit: 23.12, peg: 1.51,
    fcfYield: 0.0377, egenKapitalMultipl: 5.91,
  },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: OR.serirAr,
    omsattning: OR.oms.map(x => x * 1e6),
    resultat: OR.res.map(x => x * 1e6),
    egetKapital: OR.ekTotalSerie.map(x => x * 1e6),
    fcf: OR.fcfSerie.map(x => x * 1e6),
  },
  notering: "FRANKRIKE/KONSUMENT 1→2 (MC.PA LVMH etta — cellens tvillingfödelse: världens största lyxkoncern får världens största skönhetskoncern som granne). SIGNATURTAL — STABILITETENS PREMIUMMULTIPEL: bruttomarginal 74,4 % TTM på femårsmedel 73,7 % med spread 1,98 pp (universumets smalaste moat-kurva — mot SK hynix 62,0 pp födda samma omgång: cell-pedagogikens extrempar) + ROIC 14,3 mot WACC 8,59 (+5,7 pp) + fem raka utdelningshöjningsår (2 352→4 003 M EUR, 53 % av FCF) ⇒ P/E 31,9 = premium mot cellmedianen 19,7 — kvalitetsrabatten finns inte, priset är vänt konsistens. FY-serien: rev 32,3→44,1 mdr (CAGR +8,1 %), netto 4,6→6,1 (CAGR +7,4 %, FY2025 −4,4 %). Balansen: nettoskuld 12,66 mdr TTM efter förvärvsvågen (skuld 6,3→16,7, goodwill 11,1→17,7). P/E-fältet EXAKT replikerbart (31,93 = 376,05/11,78) — cellens renaste värderingsrad. FIFO: Q3-rapp 2026-10-20.",
};

const skhObj = {
  ticker: SKH.ticker, namn: SKH.namn, bransch: SKH.bransch, land: SKH.land,
  valuta: SKH.valuta,
  kallor: [{
    namn: "StockAnalysis",
    hamtat: HAMTAT,
    url: "https://stockanalysis.com/quote/krx/000660/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/)",
    paranoid: "KRX-PRIMÄRNOTING i KRW (005930.KS Samsung-precedensen; underlag S&P Global Market Intelligence; close 2026-09-18 +6,42 % på dagen): pris 1 857 000 KRW, mcap 1 353,50 T KRW (aktier-statistics 728,87 M × 1 857 000 = 1 353 506 mdr — 0,0004 %; BS-TTM-basen 711,08 M ger 1 321,7 — AKTIEBAS-TVÅLAVA dokumenterad: statistics bär aktuell, BS/EPS bär periodens), 52-v 333 000–2 987 000 (+456,82 % på året; −37,8 % från toppen, +457,7 % från botten — AI-minnescykelns fulla båge i ett band), P/E 8,16 = pris/EPS-TTM 227 588,30 = 8,160 EXAKT REPLIK (mcap/netto-replik 8,36 — fältet −2,3 % på aktiebas-tvålavan, dokumenterad), fwd 4,54 ⇒ prognosTillväxt +79,7 % TTE, PEG 0,10 spårkonvention (källans 0,06 på 3-års EPS +103,75 %), PS 7,15 (replik ✓), P/B 5,15 (pris/BVPS 1 857 000/368 991,21 = 5,033 — fältet +2,3 %, snitt-EK-konventionen), P/TBV 5,24, EV 1 318,49 T (replik mcap−nettokassa 1 286,63 — fältet +2,5 % över, källans minority-/justeringsposter utanför extraktet, dokumenterat), EV/EBIT 10,29 (replik 10,24 ✓ 0,4 %) EV/EBITDA 9,22 P/FCF 14,76, bruttomarginal 76,27 % TTM (replik 144 276 245/189 170 615 EXAKT; femårsserie 44,08/35,02/−1,63/48,10/60,42 — spridning 62,0 pp = UNIVERSUMETS BREDASTE), EBIT-marginal 68,04 % (EXAKT), pretax-marginal 109,30 % (PRETAX ÖVER INTÄKTEN: implied pretax 206,77 T − EBIT 128,71 T = icke-operativ post ≈ +78,1 T KRW TTM under resultaträdet — raden ej synlig i extraktet, dokumenterat utan orsaksspekulation; källans egen not konstaterar netto > operativ), nettomarginal 85,62 % (EXAKT — netto 161,97 T ÖVER EBIT 128,71 T via samma post), FCF-marginal 48,47 % (EXAKT), fcfYield 6,77 %, ROE 92,68 % ROA 33,66 % (TTM-replik på jun-26-tillgångar 46,4 % — källans bär äldre snitt-bas, källspridning dokumenterad) ROIC 61,59 % mot WACC 17,16 % (+44,4 pp — universumets högsta ROIC−WACC), effektiv skatt 21,60 %, kassa 87,98 T, skuld 21,11 T, NETTOKASSA 66,87 T KRW (balansvändningen: nettoskuld −23,7 T FY2023 → nettokassa +66,9 T TTM — kassan ×10 på 2,5 år medan skulden 32,5→21,1 T), EK-total 262,69 T (trappa 62,2→120,7→262,7 T FY21→TTM), skuld/EK 0,08, räntetäckning 167,80, Altman 7,28, Piotroski 7, utdelning 3 000 KRW (0,16 %; payout 1,32 % — HBM-kassan stannar i fabriken) DPS-tillväxt +46,06 %, utdelningar 800→2 116 T KRW FY21→TTM (2,3 % av FCF), aktiebas 687,62→711,08 M = +3,4 % på 4,5 år ( små nyemissioner; statistics +0,14 % YoY; inga återköp i CF-vyn), beta 2,39 (universumets högsta klass — medelmåttig dag rör 2,4 %), institutioner 35,37 % insiders 0,01 %, analytiker Strong Buy PT 3 202 944 KRW (+72,48 %; 38 st = universums näst största panel efter HINDUNILVR:s 39), 36 042 anställda, grundat 1949, nästa rapp 2026-10-29 (Q3 2026); FY KALENDER: rev 42 998→44 622→32 766→66 193→97 147 T KRW FY2021→25 (omsCAGR +22,59 %/år; FY2023 −26,6 % cykelbotten), brutto 18 952→15 628→−533→31 828→58 691 T (FY2023 NEGATIV brutto — priser under varukostnad i minnesblodbadet), operativ 12 410→6 809→−7 730→23 467→47 206 T, netto 9 602→2 230→−9 112→19 789→42 919 T (resCAGR +45,41 %/år; minusåret FY2023 → vinst ×2,2 ×2,2 — kapacitetscykelns klassiska båge), EPS 13 984→3 242→−13 244→28 419→60 378 KRW, TTM jun-26: rev 189 171 T (+94,7 % mot FY2025 — universumets konvention TTM/FY; källans +145 % bär TTM/TTM-jun25-basen, dokumenterat), brutto 144 276, operativ 128 706, netto 161 965 T; CF: OCF 19 798→126 926 T FY21→TTM, capex 12 487→35 232 T, FCF 7 311→−4 230→−4 047→13 850→25 854 T FY21→25 (TVÅ NEGATIVA ÅR — kapitalkostnaderna upp i bottenåret, sedan kassflödet ×3,3 på två år; TTM 91 694 T = OCF−capex EXAKT), branschfält Technology/Semiconductors — världens minnesduopol får sin andra bärare (DRAM/NAND + HBM-kärnan), Sydkoreas teknikgren föds komplett",
  }],
  hamtat: HAMTAT, pris: SKH.pris, marknadsKapitalMdr: 1353500,
  tillvaxt: {
    omsattningCAGR5ar: 0.2259, resultatCAGR5ar: 0.4541,
    omsattningTillvaxtTTM: 0.9474, prognosTillvaxt: 0.7974,
  },
  lonksamhet: {
    roe: 0.9268, roic: 0.6159, bruttoMarginal: 0.7627,
    ebitMarginal: 0.6803, nettoMarginal: 0.8562, fcfMarginal: 0.4847,
  },
  stabilitet: {
    skuldEgenkapital: 0.08, rantaTackning: 167.80, fcfPositivaSenaste5: 3,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: null,
  },
  aterkop: { senasteArMdr: 2116.417, andelUtestande: 0.0016, insiderkopSenaste6man: null },
  moat: { bruttoMarginalMedel5ar: 0.3720, bruttoMarginalSpread5ar: 0.6205, roeMedel5ar: null },
  vardering: {
    pe: 8.16, pb: 5.15, evEbit: 10.29, peg: 0.1,
    fcfYield: 0.0677, egenKapitalMultipl: 5.15,
  },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: SKH.serirAr,
    omsattning: SKH.oms.map(x => x * 1e6),
    resultat: SKH.res.map(x => x * 1e6),
    egetKapital: SKH.ekTotalSerie.map(x => x * 1e6),
    fcf: SKH.fcfSerie.map(x => x * 1e6),
  },
  notering: "SYDKOREA/TEKNIK 1→2 (005930.KS Samsung etta — minnesduopolets två ansikten i samma cell: diversifierad konglomerat-jätte P/E 12,4 mot renodlad HBM-cyklister P/E 8,2). SIGNATURTAL — CYKELNS FULLA BÅGE FY2021→TTM: (1) bruttomarginal-spridningen 62,0 pp (44,1/35,0/−1,6/48,1/60,4) = universumets bredaste — mot L'Oréals 2,0 pp född samma omgång: moat-stabilitetens extrempar; (2) FY2023-minusåret: brutto −0,5 T (priser under varukostnad), operativ −7,7 T, netto −9,1 T KRW → sedan netto ×2,2 ×2,2 och TTM 162 T; (3) pretax-marginal 109,3 % — netto ÖVER EBIT via icke-operativ post ≈ +78 T KRW under resultaträdet (rad ej synlig, dokumenterad); (4) balansvändningen nettoskuld −23,7 T → nettokassa +66,9 T på 2,5 år, skuld/EK 0,08; (5) fwd P/E 4,54 mot trailing 8,16 = prognosTillväxt +79,7 % (panel 38 st Strong Buy PT +72 % — HBM-efterfrågan i talet); (6) 52-v +456,8 % men −37,8 % från toppen, beta 2,39. Utdelning 0,16 % (payout 1,3 % — kapitalet stannar i fabriken: capex TTM 35,2 T). FIFO: Q3-rapp 2026-10-29.",
};

// ── Kirurgisk append (endast hit) ────────────────────────────────────────────
const original = readFileSync(UNI, "utf8");
const arr = JSON.parse(original);
if (arr.length !== 231) { console.error(`ABORT: universum ${arr.length} ≠ 231 (disk-läget förändrat — syskon-race? läs worklog)`); process.exit(1); }
if (arr.some(b => b.ticker === "OR.PA" || b.ticker === "000660.KS")) {
  console.error("ABORT: ticker finns redan"); process.exit(1);
}
const fore = JSON.stringify(arr.slice(), null, 2);
arr.push(orObj, skhObj);
const efter = JSON.stringify(arr, null, 2) + "\n";

// gamla rader innehållsidentiska (append utan formatteringsdrift)
const gamlaIgen = JSON.stringify(JSON.parse(efter).slice(0, 231), null, 2);
if (gamlaIgen !== fore) { console.error("ABORT: gamla rader förändrade"); process.exit(1); }

writeFileSync(UNI, efter);
const readback = JSON.parse(readFileSync(UNI, "utf8"));
if (readback.length !== 233) { console.error("ABORT: readback ≠ 233"); process.exit(1); }
if (readback[231].ticker !== "OR.PA" || readback[232].ticker !== "000660.KS") {
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
  for (const grupp of ["konsument", "teknik"]) {
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
placera("OR.PA", "konsument");
placera("000660.KS", "teknik");
const placeraC = (tk) => {
  const b = ny.find(x => x.ticker === tk); const v = b.tillvaxt.resultatCAGR5ar;
  const g = ny.filter(x => x.bransch === b.bransch && typeof x.tillvaxt?.resultatCAGR5ar === "number").map(x => x.tillvaxt.resultatCAGR5ar).sort((a, c) => a - c);
  const a = ny.filter(x => typeof x.tillvaxt?.resultatCAGR5ar === "number").map(x => x.tillvaxt.resultatCAGR5ar).sort((c, d) => c - d);
  console.log(`KVARTIL ${tk} resCAGR: ${(v * 100).toFixed(1)} % = rad ${g.indexOf(v) + 1} av ${g.length} i ${b.bransch} · universumrad ${a.filter(x => x < v).length + 1} av ${a.length}`);
};
placeraC("OR.PA"); placeraC("000660.KS");
console.log(`FRANKRIKE: ${ny.filter(b => b.land === "Frankrike").map(b => b.ticker + "/" + b.bransch).join(" · ")}`);
console.log(`SYDKOREA: ${ny.filter(b => b.land === "Sydkorea").map(b => b.ticker + "/" + b.bransch).join(" · ")}`);
console.log(`APPEND KLAR: 231→233 · gamla rader innehållsidentiska · round-trip disk OK`);
