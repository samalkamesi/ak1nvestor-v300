#!/usr/bin/env node
/**
 * _s2u2o23-append.mjs — AUTO-S2 omgång 23 u2: SAN.MC + HINDUNILVR.NS in i
 * bolagsunivers.json (225→227). Aritmetikgrind med ABORT FÖRE skrivning
 * (omg22-mönstret: första körningen ABORTAR vid rött — filen orörd).
 * Spanien/finans 0→1 + Indien/konsument 0→1 = TVÅ NYA CELLER.
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const HAMTAT = "2026-09-20";

// ── Källpaket: SAN.MC (BME-primär, stockanalysis.com, close 2026-09-18) ──────
const SAN = {
  ticker: "SAN.MC", namn: "Banco Santander", bransch: "finans", land: "Spanien",
  valuta: "EUR", hamtat: HAMTAT, pris: 12.52, mcapMdr: 180.97,
  aktierKalla: 14.45, // miljarder, overview
  aktierBS: 14321, aktierFY25: 14678, aktierFY21: 17063, // miljoner
  epsTTM: 1.07, epsFY25: 0.90, peFalt: 14.20, peFwd: 10.83, pegKalla: 0.67,
  ps: 3.73, pbFalt: 1.56, ptbv: 2.00, bvps: 7.64,
  ekTotalJun26: 115898, ekCommonJun26: 109346, // M EUR (BS TTM)
  roe: 0.1311, roa: 0.0078, wacc: 0.0290,
  opMarg: 0.4233, pretaxMarg: 0.4026, profitMarg: 0.3346,
  nettoTTMattr: 15611, nettoTTMtotal: 16241, revTTM: 48533,
  dps: 0.25, yieldFalt: 0.0200, payoutFalt: 0.2154, dpsTillvaxt: 0.1429,
  buybackYield: 0.0349, shareholderYield: 0.0548,
  ocfTTM: -36698, capexTTM: -5496, fcfTTM: -42194,
  serirAr: ["2021", "2022", "2023", "2024", "2025"],
  oms: [39007, 41947, 43261, 47810, 46836],   // M EUR
  res: [7558, 9076, 10584, 11954, 13479],     // M EUR attributable
  ekTotal: [97053, 97585, 104241, 107327, 112748], // M EUR (FY2021→25)
  ttmTillvaxtFalt: 0.0333,
};

// ── Källpaket: HINDUNILVR.NS (NSE-primär, stockanalysis.com, close 2026-09-18) ─
const HUL = {
  ticker: "HINDUNILVR.NS", namn: "Hindustan Unilever", bransch: "konsument", land: "Indien",
  valuta: "INR", hamtat: HAMTAT, pris: 1932, mcapTdr: 4540,
  aktierMdr: 2.35, // miljarder (BS-vyns filings 2 350 M konstant)
  epsFY26: 64.00, epsTTMFalt: 54.04, peFalt: 50.55, peFwd: 39.24, pegKalla: 4.68,
  ps: 6.87, pbFalt: 9.26, bvps: 207.44,
  evTdr: 4.49, evEbitFalt: 32.16, evEbitda: 29.18,
  skuld: 14.78, kassa: 69.93, nettokassa: 55.15, // mdr INR (statistics jun-26)
  bruttoTTM: 0.5037, bruttoTTMbelopp: 332700, ebitTTMbelopp: 139640,
  ebitMarg: 0.2114, nettoMarg: 0.2264, nettoTTM: 149570, revTTM: 660520,
  fcfMarg: 0.1511, fcfTTM: 97410, fcfYield: 0.0215,
  roic: 0.2399, wacc: 0.0604, rantaTackning: 48.66,
  dps: 41, yieldFalt: 0.0212, dpsTillvaxt: -0.2264,
  serirAr: ["2022", "2023", "2024", "2025", "2026"],
  oms: [524460, 605800, 618960, 613280, 644680], // M INR, FY april–mars
  res: [88790, 101200, 102770, 106490, 150400],
  bruttoSerie: [0.5053, 0.4728, 0.5155, 0.5115, 0.5058],
  ttmTillvaxtFalt: 0.033,
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

// SAN-kontroller
K("SAN-1 omsCAGR", Math.round(cagr(39007, 46836) * 10000) / 10000, 0.0468, 0.0005);
K("SAN-2 resCAGR", Math.round(cagr(7558, 13479) * 10000) / 10000, 0.1556, 0.0005);
K("SAN-3 prognosTillvaxt TTE", SAN.peFalt / SAN.peFwd - 1, 0.3112, 0.001);
K("SAN-4 PEG spårkonvention", Math.round((SAN.peFalt / (SAN.peFalt / SAN.peFwd - 1) / 100) * 100) / 100, 0.46, 0.005);
K("SAN-5 PS-replik", 180.97 / 48.533, 3.73, 0.01);
K("SAN-6 P/B mcap/EK-total", 180970 / 115898, 1.56, 0.005);
K("SAN-7 P/B tvålava pris/BVPS (dok. +5,0 %)", 12.52 / 7.64, 1.6386, 0.001);
K("SAN-8 pe-fält vs replik EPS-TTM (källspridning dok.)", Math.abs(14.20 / (12.52 / 1.07) - 1), 0.2135, 0.02);
K("SAN-9 pe-fält vs FY2025-EPS-bas (dok. −2 %)", 12.52 / 0.90, 13.911, 0.05);
K("SAN-10 mcap-replik aktier×pris", 14.45 * 12.52, 180.91, 0.1);
K("SAN-11 direktavkastning", 0.25 / 12.52, 0.019968, 0.00005);
K("SAN-12 shareholder yield summa", 0.0200 + 0.0349, 0.0549, 0.005);
K("SAN-13 BVPS common", 109346 / 14321, 7.6355, 0.005);
K("SAN-14 profit-marginal total-bas", 16241 / 48533, 0.3346, 0.0005);
K("SAN-15 FCF = OCF − capex", -36698 - 5496, -42194, 1);
K("SAN-16 fem raka vinstår", [9076-7558, 10584-9076, 11954-10584, 13479-11954].every(d => d > 0) ? 1 : 0, 1, 0);
K("SAN-17 ROE-replik attributable/EK-total", 15611 / 115898, 0.1347, 0.005);
K("SAN-18 aktiebasminskning FY21→jun26", 14321 / 17063 - 1, -0.16065, 0.001);
K("SAN-19 TTM-tillväxt replik (fält 3,33 dok.)", 48533 / 46836 - 1, 0.03624, 0.0005);
K("SAN-20 serielängder", SAN.oms.length === 5 && SAN.res.length === 5 ? 1 : 0, 1, 0);

// HUL-kontroller
K("HUL-1 omsCAGR", Math.round(cagr(524460, 644680) * 10000) / 10000, 0.0530, 0.0005);
K("HUL-2 resCAGR", Math.round(cagr(88790, 150400) * 10000) / 10000, 0.1408, 0.0005);
K("HUL-3 prognosTillvaxt TTE", 50.55 / 39.24 - 1, 0.2882, 0.001);
K("HUL-4 PEG spårkonvention", Math.round((50.55 / ((50.55 / 39.24 - 1) * 100)) * 100) / 100, 1.75, 0.01);
K("HUL-5 PS-replik", 4540 / 660.52, 6.874, 0.01);
K("HUL-6 P/B pris/BVPS", 1932 / 207.44, 9.3132, 0.001);
K("HUL-7 pe-fält vs mcap/netto-replik (fältet +67 % över, dok.)", Math.abs(50.55 / (4540 * 1000 / 149570) - 1), 0.6654, 0.02);
K("HUL-8 pe-fält vs FY2026-EPS-replik (fältet +67 % över, dok.)", Math.abs(50.55 / (1932 / 64.0) - 1), 0.6745, 0.02);
K("HUL-9 mcap-replik aktier×pris", 2.35 * 1932, 4540.2, 0.5);
K("HUL-10 EV-replik mcap+skuld−kassa", 4540.2 + 14.78 - 69.93, 4485.05, 1);
K("HUL-11 EV/EBIT-replik", 4490 * 1000 / 139640, 32.153, 0.01);
K("HUL-12 bruttomarginal TTM", 332700 / 660520, 0.50372, 0.0005);
K("HUL-13 EBIT-marginal TTM", 139640 / 660520, 0.21144, 0.0005);
K("HUL-14 nettomarginal TTM", 149570 / 660520, 0.22638, 0.0005);
K("HUL-15 FCF-marginal replik (fält 15,11 dok. −2,4 %)", 97410 / 660520, 0.14746, 0.0005);
K("HUL-16 fcfYield", 97410 / 4540000, 0.021458, 0.0002);
K("HUL-17 direktavkastning", 41 / 1932, 0.021216, 0.00005);
K("HUL-18 FY2026-EPS = netto/aktier", 150400 / 2350, 64.0, 0.01);
K("HUL-19 FY2026-bruttomarginal", 326100 / 644680, 0.50586, 0.0005);
K("HUL-20 FY2026-operativmarginal", 136840 / 644680, 0.21229, 0.0005);
K("HUL-21 FY2026-nettomarginal", 150400 / 644680, 0.23327, 0.0005);
K("HUL-22 moat-medel", (0.5053 + 0.4728 + 0.5155 + 0.5115 + 0.5058) / 5, 0.50218, 0.0005);
K("HUL-23 moat-spread (range)", 0.5155 - 0.4728, 0.0427, 0.0005);
K("HUL-24 skuld/EK-replik (jun-26 EK)", 14.78 / 487.484, 0.0303, 0.0005);
K("HUL-25 utdelning total", 41 * 2.35, 96.35, 0.01);
K("HUL-26 nettokassa identitet", 69.93 - 14.78, 55.15, 0.01);
K("HUL-27 serielängder", HUL.oms.length === 5 && HUL.res.length === 5 ? 1 : 0, 1, 0);
K("HUL-28 TTM-tillväxt replik (fält 3,3 dok.)", 660520 / 644680 - 1, 0.024588, 0.0005);

console.log(`ARITMETIKGRIND: ${n - rok.length}/${n} GRÖNA`);
if (rok.length) {
  console.error("ABORT — röda kontroller (filen orörd):");
  for (const r of rok) console.error("  RÖD " + r);
  process.exit(1);
}

// ── Objekt (skrivs endast efter grön grind) ─────────────────────────────────
const sanObj = {
  ticker: SAN.ticker, namn: SAN.namn, bransch: SAN.bransch, land: SAN.land,
  valuta: SAN.valuta,
  kallor: [{
    namn: "StockAnalysis",
    hamtat: HAMTAT,
    url: "https://stockanalysis.com/quote/bme/SAN/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/ + /financials/balance-sheet/)",
    paranoid: "BME-PRIMÄRNOTING i EUR (IBE.MC-precedensen; underlag S&P Global Market Intelligence; close 2026-09-18 17:41 CET, −3,30 %): pris 12,52 EUR, mcap 180,97 mdr (källans aktier 14,45 mdr; replik 14,45 × 12,52 = 180,91 — 0,03 %; BS jun-26 14 321 M ger 179,4 — 0,9 %, tre aktiebaser), 52-v 8,10–13,12 (+45,4 % på året; −4,6 % från toppen), P/E 14,20 (KÄLLSPRIDNING −17,6 % DOKUMENTERAD: replik pris/EPS-TTM 1,07 = 11,70; fältet ≈ pris/FY2025-EPS 0,90 = 13,91 (−2 %) — bär sannolikt en kvartal bakomliggande EPS-bas; fwd 10,83 ⇒ prognosTillväxt +31,1 % TTE), PEG 0,46 spårkonvention (källans PEG 0,67 på 3-års EPS-tillväxt +17,66 % som not), PS 3,73 (replik 180,97/48,53 = 3,729 ✓), P/B 1,56 (mcap/EK-total 180 970/115 898 = 1,5614 EXAKT; pris/BVPS-common 12,52/7,64 = 1,639 — tvålava dokumenterad; P/TBV 2,00), EV/EBIT/P-FCF n/a (bankkonventionen: GS/HSBA/ITUB-ordlistan), bruttomarginal n/a (bankintäkter utan varukostnad), operating-marginal 42,33 % pretax 40,26 (statistics), profit 33,46 % = TTM TOTAL-netto 16 241/48 533 = 33,47 replikerbar EXAKT — marginalerna bär total-nettot medan IS-tabellen bär attributable 15 611 (≈ minorities +630, tvålavan netto attributable/total dokumenterad), ROE 13,11 % (replik attributable/EK-total 15 611/115 898 = 13,47 — källan bär snitt-EK, 8306/ITUB-konventionen), ROA 0,78 %, ROIC n/a (bank), WACC 2,90 % (ROE−WACC +10,2 pp), nettoskuld-källrad −89,49 mdr (kassa-bas 315,34 mot skuld 404,83; FY2025-basen +30,98 mdr NETTKASSA — basberoendet dokumenterat som på bankerna), FCF TTM −42,19 mdr = OCF −36,70 − capex 5,50 EXAKT (kundmedels-/trading-flöden — 8306/8316/8411-noten), utdelning 0,25 EUR (2,00 %; replik 0,25/12,52 = 1,997 ✓) payout 21,54 % på källans 1,16-EPS-bas (fjärde EPS-basen; replik på IS-EPS 0,25/1,07 = 23,4 %), DPS-tillväxt +14,29 %, återköpsyield 3,49 %, shareholder yield 5,48 % (replik 2,00+3,49 = 5,49 ✓), aktiebas −3,49 % YoY (BS-trappan 17 063→16 551→15 886→15 137→14 678 M FY2021→25 + jun-26 14 321 = −16,1 % på 4,5 år; CF: återköp −1 645→−3 109→−4 789→−4 081 mdr FY2021→25 med TTM −6 700 = halvårsrekord), beta 0,93 (5Y), institutioner 38,38 % insiders 1,27 %, analytiker Buy PT 13,47 EUR (+7,55 %; 20 st), effektiv skatt 24,56 %, Piotroski 2, Altman n/a (bank), räntetäckning n/a, 185 279 anställda, grundat 1856, huvudkontor Madrid (allmän faktakunskap, ej källpaketet), nästa rapp 2026-10-28 (Q3 2026); FY KALENDER jan–dec: rev 39 007→41 947→43 261→47 810→46 836 mdr FY2021→FY2025 (omsCAGR +4,68 %/år; FY2025 −2,04 %), netto 7 558→9 076→10 584→11 954→13 479 (FEM RAKA VINSTÅR, nettoCAGR +15,56 %/år; EPS 0,44→0,54→0,65→0,77→0,90 med TTM 1,07; marginaltrappa attributable 19,38→28,78 % med TTM 32,17), TTM jun-26: rev 48 533 (+3,3 % källfält; replik mot FY2025 +3,62 % dokumenterad), netto attributable 15 611 (+21,7 %) total 16 241, EK-total-trappa 97 053→112 748 mdr FY2021→25 (BVPS 5,09→7,03; common 86 930→103 170; TBV 70 346→85 862), totala tillgångar 1,60→1,87 biljon EUR, retained earnings 61 512→95 187; FY2024/25-rader SAKNAS i CF-vyn (bankmalls-lucka: OCF −36 698/capex −5 496/FCF −42 194 endast TTM synligt med FY2021–23-serien 56 691/27 706/5 015), branschfält Financials/Banks — eurozonens största detaljbankskoncern, Spaniens finansgren föds",
  }],
  hamtat: HAMTAT, pris: SAN.pris, marknadsKapitalMdr: 181,
  tillvaxt: {
    omsattningCAGR5ar: 0.0468, resultatCAGR5ar: 0.1556,
    omsattningTillvaxtTTM: 0.0333, prognosTillvaxt: 0.3112,
  },
  lonksamhet: {
    roe: 0.1311, roic: null, bruttoMarginal: null,
    ebitMarginal: 0.4233, nettoMarginal: 0.3346, fcfMarginal: null,
  },
  stabilitet: {
    skuldEgenkapital: null, rantaTackning: null, fcfPositivaSenaste5: null,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: null,
  },
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: null },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
  vardering: {
    pe: 14.20, pb: 1.56, evEbit: null, peg: 0.46,
    fcfYield: null, egenKapitalMultipl: 1.56,
  },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: SAN.serirAr,
    omsattning: SAN.oms.map(x => x * 1e6),
    resultat: SAN.res.map(x => x * 1e6),
    egetKapital: [],
    fcf: [],
  },
  notering: "SPANIEN/FINANS 0→1 (omg22-u2:s landmatta-logik: eurozonens fjärde ekonomi hade ITX.MC+IBE.MC men ingen bankgren — SAN = eurozonens största detaljbankskoncern, BME-kanalens andra rad). SIGNATURTAL — ÅTERKÖPSMASKINEN + FEM RAKA VINSTÅR: netto 7 558→13 479 M EUR FY2021→25 (nettoCAGR +15,6 %/år) med aktiebasen 17 063→14 321 M (−16,1 % på 4,5 år; TTM-återköp 6,7 mdr EUR = halvårsrekord i UBSG-klassens netto-maskin) ⇒ EPS 0,44→1,07 TTM (+143 %) på netto +100 % — hävstången som betalar utdelningsvägen: DPS 0,25 (+14,3 % YoY, payout 21,5 %) + återköp 3,49 % = shareholder yield 5,48 %. VÄRDERINGSTVÅLAVAN (cellens pedagogik med källspridningen −17,6 % dokumenterad i paranoid): källans P/E-fält 14,20 mot replik 11,70 — fältet bår sannolikt FY2025-EPS-basen 13,91; fwd 10,83 ⇒ prognosTillväxt +31,1 % TTE = finansgrenens hetaste vinstförväntning (ITUB +14,3-klassen). ROE 13,11 på WACC 2,90 (+10,2 pp). Bankkonventionerna fullföljda (EV/skuld-EK/FCF-fält null; marginaler på total-netto). FIFO: Q3-rapp 2026-10-28.",
};

const hulObj = {
  ticker: HUL.ticker, namn: HUL.namn, bransch: HUL.bransch, land: HUL.land,
  valuta: HUL.valuta,
  kallor: [{
    namn: "StockAnalysis",
    hamtat: HAMTAT,
    url: "https://stockanalysis.com/quote/nse/HINDUNILVR/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/)",
    paranoid: "NSE-PRIMÄRNOTING i INR (HDFCBANK.NS/TCS.NS-precedensen; underlag S&P Global Market Intelligence; close 2026-09-18 15:15 IST, −0,53 %): pris 1 932 INR, mcap 4,54 T INR (källans aktier 2,35 mdr; replik 2,35 × 1 932 = 4 540,2 mdr — 0,005 %), 52-v 1 926,20–2 667,20 (−24,8 % på året; priset 0,3 % ÖVER 52-v-lägsta = universumets enda rad vid bandets botten), P/E 50,55 (KÄLLSPRIDNING DOKUMENTERAD: replikerna ligger 40 % UNDER fältet (+67 % sett från fältet): pris/FY2026-EPS 64,00 = 30,19 · mcap/TTM-netto 4 540 200/149 570 = 30,36 · pris/källans TTM-EPS-fält 54,04 = 35,75 — tre replikbaser; fältets egen EPS-bas 1 932/50,55 = 38,22 syns ej i extraktet — sannolikt normaliserad exkl FY2026:s icke-operativa netto-hopp; fwd 39,24 ⇒ prognosTillväxt +28,8 % TTE), PEG 1,75 spårkonvention (källans PEG 4,68 = fwd 39,24 på 3-års 8,34 % som not), PS 6,87 (replik 4 540/660,52 = 6,874 ✓), P/B 9,26 (pris/BVPS 1 932/207,44 = 9,313 — 0,6 %), P/TBV n/a statistics (balans-vyns TBV 55 050 M mar-24 på goodwill 174 660 + immateriella 282 520 = 457 180 — GSK Consumer-fusionens horisont, godwill-tung balansräkning), EV 4,49 T (replik mcap+skuld−kassa 4 540,2+14,78−69,93 = 4 485,1 — 0,1 %) EV/EBIT 32,16 (replik 4 490 000/139 640 = 32,15 ✓) EV/EBITDA 29,18, bruttomarginal 50,37 % TTM (replik 332 700/660 520 EXAKT; femårsserie 50,53/47,28/51,55/51,15/50,58 — spread 4,3 pp), EBIT-marginal 21,14 % (replik 139 640/660 520 EXAKT), netto 22,64 % (149 570/660 520 EXAKT), FCF-marginal 15,11 % (replik 97 410/660 520 = 14,75 — −2,4 % källspridning), fcfYield 2,15 % (97,41/4 540), ROE n/a källan (replik TTM/EK-jun-26 149 570/487 484 = 30,7 % — notis), ROIC 23,99 % mot WACC 6,04 % (+18,0 pp), skuld/EK 0,03 (replik 14,78/487,5 — källan utan fält, egen replik dokumenterad), räntetäckning 48,66, nettokassa 55,15 mdr INR (kassa 69,93 − skuld 14,78 EXAKT), effektiv skatt 25,29 %, Altman n/a, Piotroski 2, utdelning 41 INR (2,12 %; replik 41/1 932 = 2,12 ✓) DPS-tillväxt −22,64 % (mot specialutdelningsåret), payout källan n/a (replik 41/64 = 64,1 % på FY2026-EPS; FY2024 CF-bas 93 980/102 770 = 91,4 %), aktiebas 2 350 M KONSTANT 5 år enligt balans-vyns filings — statistics-sidans shares-change +17,78 % är KÄLLARTEFAKT som speglar TTM-EPS-fältets 2 768 M-bas (149 570/54,04), buyback/shareholder-yield-fälten bärs av samma artefakt (−17,78/−15,66) och rapporteras ej, beta 0,32 (universumets lägsta klass med 8750.T 0,27), institutioner 20,58 % insiders 0,01 % (ULVR-förälderns ~62 % ägarskap syns ej i källans fält — ACA/AMUN-förälder/barn-precedensens spegel: föräldern i annan cell, allmän faktakunskap som not), analytiker Buy PT 2 419,16 INR (+25,2 %; 39 st = universumets största analytikerpanel), 17 477 anställda, grundat 1888, nästa rapp 2026-10-28 (Q2 FY2027); FY APRIL–MARS slutårsetikett (HDFC/TCS-konventionen): rev 524 460→605 800→618 960→613 280→644 680 M INR FY2022→FY2026 (omsCAGR +5,30 %/år; FY2023 +15,5 %, FY2025 −0,9 %), brutto 265 020→326 100, operativ 117 470→129 870→134 140→134 190→136 840 (+3,9 %/år PLATT), netto 88 790→101 200→102 770→106 490→150 400 (FY2026 +41,2 % PÅ +5,1 % intäkt med operativ +2,0 % och pretax-marginal FALLANDE 23,53→21,42 ⇒ hoppet bär ICKE-OPERATIV post under resultaträdets rad (skatt/associates — raden ej synlig i extraktet); nettoCAGR +14,08 %/år med basårs-not), EPS 37,79→43,07→43,74→45,32→64,00 (replik 150 400/2 350 = 64,00 EXAKT), TTM jun-26: rev 660 520, netto 149 570, brutto 332 700, operativ 139 640; CF-VYN NSE-VINTAGE (når mar-24 + TTM dec-24): OCF 90 480→99 910→154 690 FY2022→24, FCF 78 230→88 170→140 010 (FCF/aktie 33,30→59,59; dec-24-TTM 116 140), utdelningar −75 190→−84 740→−93 980, capex −10 110→−16 680, cash-skatt FY2023 31 380 mot FY2024 3 810 (sväng dokumenterad); BALANS-VYN SAMMA VINTAGE: EK-total 490 870→505 220→514 230 mar-22→24 (dec-24-TTM 509 870; jun-26-replik BVPS 207,44 × 2 350 = 487 484) — KÄLLANS NSE-BALANSVY SLÄPAR vid mar-24 medan IS-vyn nått mar-26, dokumenterat; totala tillgångar 785 080 (mar-24), goodwill-tung balansräkning (P/TBV-noten ovan), kassa+ST-inv 129 000 skuld 16 510 (dec-24-baser); statistics-jun-26-punktläget bär fcfYield/marginaler ovan; branschfält Consumer Staples/Household & Personal Products — Indiens största FMCG-koncern, konsumentgrenen föds",
  }],
  hamtat: HAMTAT, pris: HUL.pris, marknadsKapitalMdr: 4540,
  tillvaxt: {
    omsattningCAGR5ar: 0.0530, resultatCAGR5ar: 0.1408,
    omsattningTillvaxtTTM: 0.033, prognosTillvaxt: 0.2882,
  },
  lonksamhet: {
    roe: null, roic: 0.2399, bruttoMarginal: 0.5037,
    ebitMarginal: 0.2114, nettoMarginal: 0.2264, fcfMarginal: 0.1511,
  },
  stabilitet: {
    skuldEgenkapital: 0.03, rantaTackning: 48.66, fcfPositivaSenaste5: null,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: null,
  },
  aterkop: { senasteArMdr: 96.35, andelUtestande: 0.0001, insiderkopSenaste6man: null },
  moat: { bruttoMarginalMedel5ar: 0.5022, bruttoMarginalSpread5ar: 0.0427, roeMedel5ar: null },
  vardering: {
    pe: 50.55, pb: 9.26, evEbit: 32.16, peg: 1.75,
    fcfYield: 0.0215, egenKapitalMultipl: 9.26,
  },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: HUL.serirAr,
    omsattning: HUL.oms.map(x => x * 1e6),
    resultat: HUL.res.map(x => x * 1e6),
    egetKapital: [],
    fcf: [],
  },
  notering: "INDIEN/KONSUMENT 0→1 (världens femte största ekonomi — tredje grenen efter TCS.NS/HDFCBANK.NS; ULVR.L-förälderns ~62 %-dotter = universumets ANDRA förälder/barn-par i skilda celler, ACA/AMUN-precedensen). SIGNATURTAL — BOTTENPRISET PÅ STABIL MASKIN: 52-v −24,8 % med priset 0,3 % över 52-v-lägsta (universumets enda rad vid bandets botten) MEDAN bruttomarginalen 50,4 % TTM ligger på femårsmedlet 50,2 % (spread 4,3 pp) och ROIC 23,99 mot WACC 6,04 = +18,0 pp — FMCG-klassens kapitallogik intakt under kursfallet. FY2026-NETTOHOPPET +41,2 % på operativ +2,0 % med FALLANDE pretax-marginal = icke-operativ bärare under raden; källans P/E-fält 50,55 bär sannolikt normaliserad bas (repliker 30,2–35,8, tre baser i paranoid) — P/E:T ÄR BASVALET: cellens pedagogiska kärna (mönstret från BEI:s prognosgap i omg17). Utdelning 41 INR (2,12 %, DPS −22,6 % mot specialåret), nettokassa 55,2 mdr INR, beta 0,32, analytikerpanel 39 st (universumets största) PT +25,2 %. FIFO: Q2 FY2027 2026-10-28.",
};

// ── Kirurgisk append (endast hit) ────────────────────────────────────────────
const original = readFileSync(UNI, "utf8");
const arr = JSON.parse(original);
if (arr.length !== 229) { console.error(`ABORT: universum ${arr.length} ≠ 229 (disk-läget förändrat — läs worklog)`); process.exit(1); }
if (arr.some(b => b.ticker === "SAN.MC" || b.ticker === "HINDUNILVR.NS")) {
  console.error("ABORT: ticker finns redan"); process.exit(1);
}
const fore = JSON.stringify(arr.slice(), null, 2);
arr.push(sanObj, hulObj);
const efter = JSON.stringify(arr, null, 2) + "\n";

// gamla rader innehållsidentiska (append utan formatteringsdrift)
const gamlaIgen = JSON.stringify(JSON.parse(efter).slice(0, 229), null, 2);
if (gamlaIgen !== fore) { console.error("ABORT: gamla rader förändrade"); process.exit(1); }

writeFileSync(UNI, efter);
const readback = JSON.parse(readFileSync(UNI, "utf8"));
if (readback.length !== 231) { console.error("ABORT: readback ≠ 227"); process.exit(1); }
if (readback[229].ticker !== "SAN.MC" || readback[230].ticker !== "HINDUNILVR.NS") {
  console.error("ABORT: readback-ordning fel"); process.exit(1);
}
const round = JSON.stringify(readback, null, 2) + "\n";
if (round !== readFileSync(UNI, "utf8")) { console.error("ABORT: stringify-round-trip avvikelse"); process.exit(1); }

// ── Medianer + kvartiler FÖRE→EFTER + placeringar (diskens faktiska läge) ────
const median = v => { const r = v.filter(x => typeof x === "number" && Number.isFinite(x)); if (!r.length) return null; const s = [...r].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const pct = (v, p) => { const r = v.filter(x => typeof x === "number" && Number.isFinite(x)); if (!r.length) return null; const s = [...r].sort((a, b) => a - b); const pos = (s.length - 1) * p; const lo = Math.floor(pos), hi = Math.ceil(pos); return lo === hi ? s[lo] : s[lo] + (pos - lo) * (s[hi] - s[lo]); };
const stat = (r, f) => ({ n: r.map(f).filter(x => typeof x === "number").length, median: median(r.map(f)), p25: pct(r.map(f), 0.25), p75: pct(r.map(f), 0.75) });
const f1 = (t) => (t === "x" ? null : null);

const ny = readback;
for (const [namn, f] of [["P/E", b => b.vardering?.pe], ["P/B", b => b.vardering?.pb], ["resCAGR %", b => b.tillvaxt?.resultatCAGR5ar]]) {
  for (const grupp of ["finans", "konsument"]) {
    const s = stat(ny.filter(b => b.bransch === grupp), f);
    console.log(`${grupp.toUpperCase()} ${namn}: median ${s.median?.toFixed(2)} [P25–P75 ${s.p25?.toFixed(2)}–${s.p75?.toFixed(2)}, n=${s.n}]`);
  }
  const t = stat(ny, f);
  console.log(`TOTALT ${namn}: median ${t.median?.toFixed(2)} (n=${t.n} av ${ny.length})`);
}
const placera = (tk, f, grupp) => {
  const b = ny.find(x => x.ticker === tk); const v = f(b);
  const iG = ny.filter(x => x[grupp === "finans" ? "bransch" : "bransch"] === (grupp === "finans" ? "finans" : "konsument") && typeof f(x) === "number").map(f).sort((a, c) => a - c);
  const iA = ny.filter(x => typeof f(x) === "number").map(f).sort((a, c) => a - c);
  console.log(`KVARTIL ${tk}: P/E ${v} = rad ${iG.indexOf(v) + 1} av ${iG.length} i ${grupp} · universumrad ${iA.filter(x => x < v).length + 1} av ${iA.length} (median ${median(iA)?.toFixed(2)})`);
};
placera("SAN.MC", b => b.vardering?.pe, "finans");
placera("HINDUNILVR.NS", b => b.vardering?.pe, "konsument");
const placeraC = (tk) => {
  const b = ny.find(x => x.ticker === tk); const v = b.tillvaxt.resultatCAGR5ar;
  const g = ny.filter(x => x.bransch === b.bransch && typeof x.tillvaxt?.resultatCAGR5ar === "number").map(x => x.tillvaxt.resultatCAGR5ar).sort((a, c) => a - c);
  const a = ny.filter(x => typeof x.tillvaxt?.resultatCAGR5ar === "number").map(x => x.tillvaxt.resultatCAGR5ar).sort((c, d) => c - d);
  console.log(`KVARTIL ${tk} resCAGR: ${(v * 100).toFixed(1)} % = rad ${g.indexOf(v) + 1} av ${g.length} i ${b.bransch} · universumrad ${a.filter(x => x < v).length + 1} av ${a.length}`);
};
placeraC("SAN.MC"); placeraC("HINDUNILVR.NS");
console.log(`SPANIEN: ${ny.filter(b => b.land === "Spanien").map(b => b.ticker + "/" + b.bransch).join(" · ")}`);
console.log(`INDIEN: ${ny.filter(b => b.land === "Indien").map(b => b.ticker + "/" + b.bransch).join(" · ")}`);
console.log(`APPEND KLAR: 229→231 · gamla rader innehållsidentiska · round-trip disk OK`);
