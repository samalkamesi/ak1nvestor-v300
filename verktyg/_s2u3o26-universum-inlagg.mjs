#!/usr/bin/env node
/**
 * s2-u3 omg26 (manifest auto-s2-1789982125241) — universum-inlägg:
 * Storbritannien/finans 2→5 med BARC.L + NWG.L + LLOY.L (klaim på disk
 * FÖRE byggstart). Append på diskens FAKTISKA läge (race 16), indent 2,
 * round-trip-bevis, gamla rader innehållsidentiska (omg22-formatläxan:
 * första appenden skrev indent 1 — här styrs indent explicit).
 * Bankkonvention enligt UBSG.SW/HSBA.L-precedenserna: roic/evEbit/fcfYield/
 * fcfMarginal/bruttoMarginal/skuldEgenkapital/rantaTackning/aterkop = null,
 * serier.egetKapital/fcf = tomma arrayer, ebitMarginal satt (UBSG-modellen).
 * Pris-fält i GBP-decimal på close 2026-09-18 (LSEG.L-o23+-konventionen).
 */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/portfolj-system/bolagsunivers.json";
const MINA = ["BARC.L", "NWG.L", "LLOY.L"];

const poster = [
  {
    ticker: "BARC.L",
    namn: "Barclays plc",
    bransch: "finans",
    land: "Storbritannien",
    valuta: "GBP",
    kallor: [
      {
        namn: "StockAnalysis",
        hamtat: "2026-09-21",
        url: "https://stockanalysis.com/quote/lon/BARC/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/)",
        paranoid:
          "LON-PRIMÄRNOTING, pris i GBX på sidan (462,2 p = £4,622; HSBA.L/LSEG.L-precedenserna; underlag S&P/FMP; nyckeltalen bär på fredags-close 2026-09-18 medan sidan visade live 473,65 p måndag 10:14 GMT): 52-v 353,60–554,10 GBX (+23,95 % på året), mcap £61,91 mdr (aktier 13,40 mdr × £4,62 = £61,9 mdr ✓), P/E 9,61 = £4,62/EPS-TTM 0,48 = 9,63 (0,2 % band — EPS-rundning), fwd P/E 7,91 ⇒ prognosTillväxt +21,5 % implicit EPS +1 år (HSBA-derivationen), P/B 0,78 (replik mcap/EK-total 61,91/79,811 TTM = 0,776 ✓), P/TBV 0,88, P/S 2,20, PEG källa 0,46 mot spårets 0,45 (9,61/21,5) — källspridningen dokumenterad (LSEG-modellen), marginaler TTM: brutto n/a (bank), EBIT 37,55 % (källans operating margin; UBSG-konventionen), netto 24,32 % (replik 6 843/28 141 ✓), ROE 10,09 % ROA 0,47 % (bankbalansens konstaterande), skuld £782,35 mdr mot kassa £771,66 mdr (bankbalanser — konstaterande, fält null enligt konventionen), kassa ÖVER skuld i källans 'net cash −10,69'-notering (negativt = nettoskuld £10,69 mdr), totala tillgångar £1 730 mdr TTM mot £1 384 mdr FY2021, EK-total 70,0→78,2 mdr FY21→25, BVPS 3,39→4,87, beta 0,87, institutioner 87,85 % insiders 0,07 %, analytiker Buy PT 573,59 GBX (+21,1 %; 17 st), 93 000 anställda, grundat 1690, nästa rapp 2026-10-22 (Q3 2026); FY KALENDER: rev £22 593→23 736→23 497→24 250→26 818 M FY2021→25 (+4,4 %/år), netto £6 205→5 023→4 274→5 316→6 175 M med TTM 6 843 +11,8 % (endpoint-resCAGR −0,1 % — plana nettot med dippen FY22–23 och TTM-återhämtningen: ärligt bokförd), EPS 0,36→0,42 med TTM 0,48; CF (bankkonvention: fcf-fält null — källans FCF −8 070 M FY2025 = kundmedelsflöden, ej utdelningskapacitet): utdelningar £1 360→1 933→2 195→2 212→2 210 M, ÅTERKÖP £1 674→4 133→5 249→5 034→6 234 M — återköpen ÖVERSTIGER utdelningarna alla fem år (TTM 7 181 + 2 191), buyback yield 4,64 % + utdelning 1,82 % ⇒ shareholder yield 6,50 %, payout 27,94 %, DPS-tillväxt +35,29 % med fyra raka tillväxtår; branschfält Financials/Banks — diversified investment & retail",
      },
      {
        namn: "Yahoo Finance chart-API (paranoid)",
        hamtat: "2026-09-21",
        url: "https://query1.finance.yahoo.com/v8/finance/chart/BARC.L?range=5d&interval=1d",
        paranoid:
          "close 2026-09-18 = 462,20 GBX (£4,6220) via WebFetch-kanalen; identisk med SA-mcap-inferensen 61,91/13,40 = £4,620 (462,0 p) — band 0,04 %; dagsfasta: 470,30 (tis 15/9) · 475,35 (ons) · 478,85 (tors) · 462,20 (fre 18/9) — fredagsfallet −3,48 % mot torsdagen",
      },
    ],
    hamtat: "2026-09-21",
    pris: 4.622,
    marknadsKapitalMdr: 61.91,
    tillvaxt: {
      omsattningCAGR5ar: 0.0438,
      resultatCAGR5ar: -0.0012,
      omsattningTillvaxtTTM: 0.0493,
      prognosTillvaxt: 0.2149,
    },
    lonksamhet: {
      roe: 0.1009,
      roic: null,
      bruttoMarginal: null,
      ebitMarginal: 0.3755,
      nettoMarginal: 0.2432,
      fcfMarginal: null,
    },
    stabilitet: {
      skuldEgenkapital: null,
      rantaTackning: null,
      fcfPositivaSenaste5: null,
      kassaManaderBurnRate: null,
      nyemissionerSenaste5ar: null,
    },
    aterkop: {
      senasteArMdr: null,
      andelUtestande: null,
      insiderkopSenaste6man: null,
    },
    moat: {
      bruttoMarginalMedel5ar: null,
      bruttoMarginalSpread5ar: null,
      roeMedel5ar: null,
    },
    vardering: {
      pe: 9.61,
      pb: 0.78,
      evEbit: null,
      peg: 0.45,
      fcfYield: null,
      egenKapitalMultipl: 0.78,
    },
    golv: { typ: "osatt", vardePerAktie: null, marginal: null },
    serier: {
      ar: ["2021", "2022", "2023", "2024", "2025"],
      omsattning: [22593000000, 23736000000, 23497000000, 24250000000, 26818000000],
      resultat: [6205000000, 5023000000, 4274000000, 5316000000, 6175000000],
      egetKapital: [],
      fcf: [],
    },
    notering:
      "STORBRITANNIEN/FINANS 2→5:3 (HSBA.L + LSEG.L föregår; UK-banktrions investmentbank-arm). SIGNATURTAL — ÅTERKÖPSMASKINEN: återköpen ÖVERSTIGER utdelningarna alla fem år (1 674>1 360 · 4 133>1 933 · 5 249>2 195 · 5 034>2 212 · 6 234>2 210 £M; TTM 7 181+2 191) — buyback yield 4,64 % mot utdelning 1,82 % ⇒ shareholder yield 6,50 % med payout 27,94 % och DPS +35,29 % (fyra raka höjningsår); (2) P/B 0,78 = cellens billiga bokförings-kvant med P/TBV 0,88 — investeringsbankens hybridvikt mot LSEG:s data-moat 1,89 och HSBC 1,77; (3) grundat 1690 — universums NÄST ÄLDSTA bolag efter LSEG 1698 (Londons två 1600-talsinstitutioner i samma cell); (4) netto-dippen FY2022–23 (5 023/4 274 mot 6 205 FY2021) med TTM 6 843 +11,8 % ⇒ endpoint-resCAGR −0,1 % ÄRLIGT bokförd (plana femårsnettot, återhämtningen pågår); (5) prognosgap +21,5 % (trailing 9,61 mot fwd 7,91). Bankkonvention: fcf-fält null (källans FCF −8 070 = kundmedelsflöden), EV/EBIT null, skuld/kassa £782/£772 mdr dokumenterade i paranoid. FIFO: Q3-rapp 2026-10-22.",
  },
  {
    ticker: "NWG.L",
    namn: "NatWest Group plc",
    bransch: "finans",
    land: "Storbritannien",
    valuta: "GBP",
    kallor: [
      {
        namn: "StockAnalysis",
        hamtat: "2026-09-21",
        url: "https://stockanalysis.com/quote/lon/NWG/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/)",
        paranoid:
          "LON-PRIMÄRNOTING, pris i GBX (699,4 p = £6,994; underlag S&P/FMP; nyckeltalen på fredags-close 2026-09-18 medan sidan visade live 710,00 p måndag 10:23 GMT): 52-v 504,00–726,00 GBX, mcap £55,63 mdr (aktier 7,95 mdr × £7,00 = £55,7 mdr ✓), P/E 9,37 (replik £7,00/EPS-TTM 0,75 = 9,33 — 0,5 % EPS-rundningsband), fwd P/E 8,72 ⇒ prognosTillväxt +7,5 % implicit EPS +1 år, P/B 1,27 (replik mcap/EK-total 55,63/43,828 TTM = 1,269 ✓), P/S 3,31, PEG källa 0,79 mot spårets 1,26 (9,37/7,5) — källspridningen dokumenterad: källan räknar på 3-års EPS-prognos +11,28 %/år (9,37/11,28 = 0,83-klassen) — tvärvillkoret bokfört, marginaler TTM: brutto n/a (bank), EBIT 50,75 % (källans operating margin; UBSG-konventionen), netto 35,86 % (replik 6 026/16 806 ✓ — TRIONS HÖGSTA), ROE 14,78 % (cellens högsta bärare mot HSBC 13,1) ROA 0,86 %, skuld £137,07 mdr mot kassa £227,99 mdr (bankbalans — kassa ÖVER skuld: källans 'net cash'-not positiv — fält null enligt konventionen), totala tillgångar £745 mdr TTM, EK-total 41,8→42,6 mdr FY21→25, BVPS 3,57→4,76, beta 0,81, institutioner 92,09 % (f.d. RBS: statens utträdesår — institutionsbasen efter 2008:s räddningsägande) insiders 0,03 %, analytiker Buy PT 793,72 GBX (+13,4 %; 18 st), 53 200 anställda, nästa rapp 2026-10-30 (Q3 2026); FY KALENDER: rev £11 747→12 980→14 174→14 344→15 970 M FY2021→25 (+8,0 %/år — VART ENDA ÅR STIGANDE), netto £2 950→3 340→4 394→4 519→5 479 M = FEM RAKA VINSTÅR (+85,9 % totalt; resCAGR 16,7 %) med TTM 6 026 +20,8 % (sexårig svit vid TTM-räkning), EPS 0,27→0,67 med TTM 0,75 (+25 % YoY); CF (bankkonvention: fcf-fält null — källans FCF −13 081 M FY2025): utdelningar £1 011→1 454→1 698→1 788→2 370 M = FEM RAKA STIGANDE, återköp £1 806→2 054→2 416→2 716→579 M (FY2025-lågpunkten i statsexit-året; TTM 1 058), AKTIEBAS 10 467 M FY2021 → 7 959 M TTM = −23,96 % på 4,5 år (balansräkningens egen aktieräkning), payout 46,02 %, buyback yield 1,82 % + utdelning 4,58 % ⇒ shareholder yield 6,46 % (cellens högsta direktavkastning), 2 raka div-tillväxtår; branschfält Financials/Banks — commercial & retail",
      },
      {
        namn: "Yahoo Finance chart-API (paranoid)",
        hamtat: "2026-09-21",
        url: "https://query1.finance.yahoo.com/v8/finance/chart/NWG.L?range=5d&interval=1d",
        paranoid:
          "close 2026-09-18 = 699,40 GBX (£6,9940) via WebFetch-kanalen; mot SA-mcap-inferensen 55,63/7,95 = £7,0013 (700,1 p) — band 0,10 %; dagsfasta: 689,20 (tis 15/9) · 702,20 (ons) · 712,80 (tors) · 699,40 (fre 18/9)",
      },
    ],
    hamtat: "2026-09-21",
    pris: 6.994,
    marknadsKapitalMdr: 55.63,
    tillvaxt: {
      omsattningCAGR5ar: 0.0798,
      resultatCAGR5ar: 0.1675,
      omsattningTillvaxtTTM: 0.0523,
      prognosTillvaxt: 0.0745,
    },
    lonksamhet: {
      roe: 0.1478,
      roic: null,
      bruttoMarginal: null,
      ebitMarginal: 0.5075,
      nettoMarginal: 0.3586,
      fcfMarginal: null,
    },
    stabilitet: {
      skuldEgenkapital: null,
      rantaTackning: null,
      fcfPositivaSenaste5: null,
      kassaManaderBurnRate: null,
      nyemissionerSenaste5ar: null,
    },
    aterkop: {
      senasteArMdr: null,
      andelUtestande: null,
      insiderkopSenaste6man: null,
    },
    moat: {
      bruttoMarginalMedel5ar: null,
      bruttoMarginalSpread5ar: null,
      roeMedel5ar: null,
    },
    vardering: {
      pe: 9.37,
      pb: 1.27,
      evEbit: null,
      peg: 1.26,
      fcfYield: null,
      egenKapitalMultipl: 1.27,
    },
    golv: { typ: "osatt", vardePerAktie: null, marginal: null },
    serier: {
      ar: ["2021", "2022", "2023", "2024", "2025"],
      omsattning: [11747000000, 12980000000, 14174000000, 14344000000, 15970000000],
      resultat: [2950000000, 3340000000, 4394000000, 4519000000, 5479000000],
      egetKapital: [],
      fcf: [],
    },
    notering:
      "STORBRITANNIEN/FINANS 2→5:4 (UK-banktrions kommersiella arm; f.d. RBS — institutionsbasen 92,09 % bär statens utträdesår efter 2008:s räddningsägande). SIGNATURTAL — (1) FEM RAKA VINSTÅR 2 950→3 340→4 394→4 519→5 479 £M (+85,9 % totalt, resCAGR 16,7 %) med VART ENDA ÅR STIGANDE omsättning 11 747→15 970 (+8,0 %/år) och TTM-netto 6 026 +20,8 % — trions renaste resultattrappa; (2) AKTIEBAS −23,96 % på 4,5 år (10 467→7 959 M aktier, balansräkningens egen räkning) med återköpen 1 806→579 £M (FY2025-lågpunkten i statsexit-året) + utdelningsserien FEM RAKA STIGANDE 1 011→2 370 £M; (3) ROE 14,78 % och nettoMarginal 35,86 % = TRIONS/CELLENS HÖGSTA (mot HSBC 13,1/37,8-klassen på tre gånger balansen) med EBIT 50,75 %; (4) utdelning 4,58 % + buyback 1,82 % ⇒ shareholder yield 6,46 % — cellens högsta direktavkastningsbärare; (5) PEG-tvålaravan 1,26 (spårets: 9,37/+7,5 %) mot källans 0,79 (3-års EPS +11,28 %) — prognosbasernas skillnad i en rad, dokumenterad. Bankkonvention: fcf-fält null, EV/EBIT null, skuld/kassa £137/£228 mdr i paranoid. FIFO: Q3-rapp 2026-10-30.",
  },
  {
    ticker: "LLOY.L",
    namn: "Lloyds Banking Group plc",
    bransch: "finans",
    land: "Storbritannien",
    valuta: "GBP",
    kallor: [
      {
        namn: "StockAnalysis",
        hamtat: "2026-09-21",
        url: "https://stockanalysis.com/quote/lon/LLOY/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/)",
        paranoid:
          "LON-PRIMÄRNOTING, pris i GBX (108,95 p = £1,0895 — previous close på källans översiktssida EXAKT; underlag S&P/FMP; nyckeltalen på fredags-close 2026-09-18 medan sidan visade live 110,25 p måndag 10:22 GMT): 52-v 81,04–117,90 GBX, mcap £62,72 mdr (aktier 57,57 mdr × £1,0895 = £62,7 mdr ✓ EXAKT), P/E 13,65 (replik 1,0895/EPS-TTM 0,08 = 13,62 — EPS-rundningsband), fwd P/E 9,76 ⇒ prognosTillväxt +39,9 % implicit EPS +1 år (TRIONS STÖRSTA gap), P/B 1,33 (replik mcap/EK-total 62,72/47,867 FY2025 = 1,311 — 1,4 % band mot TTM-basen 47,237: 1,328), P/S 3,18, PEG källa 0,52 mot spårets 0,34 (13,65/39,9) — källspridningen dokumenterad (källan räknar på 3-års EPS +26,07 %: 13,65/26,07 = 0,52 EXAKT — källans egen PEG bär 3-årsbasen), marginaler TTM: brutto n/a (bank), EBIT 38,19 % (källans operating margin; UBSG-konventionen), netto 24,16 % (replik 4 758/19 693 ✓), ROE 11,34 % ROA 0,56 %, skuld £167,55 mdr mot kassa £169,78 mdr (bankbalans — fält null enligt konventionen), totala tillgångar £994 mdr TTM (≈ HALVA Barclays trots fler kunder — hushållsbankens balans), EK-total 51,2→47,9 mdr FY21→25 (FY2022-dippen 43,9), BVPS 0,58→0,71, beta 0,91, institutioner 85,06 % insiders 0,04 %, analytiker Buy PT 121,32 GBX (+10,0 %; 19 st), 60 061 anställda, nästa rapp 2026-10-27 (Q3 2026); FY KALENDER: rev £17 127→14 530→18 326→17 572→18 627 M FY2021→25 (FY2022-fallet −15,2 % sedan aldrig tillbaka till 2021-nivån i nivå — men TTM 19 693 +11,0 % passerar), netto £5 355→3 389→4 933→3 923→4 196 M med TTM 4 758 +15,0 % (endpoint-resCAGR −5,9 % ÄRLIGT bokförd: FY2021 bär efterpandemi-toppmarginalen 31,3 %, FY2024 bär dippen 3 923, TTM återhämtningen), EPS 0,07→0,07 med TTM 0,08 (+21,2 % YoY); CF (bankkonvention: fcf-fält null — källans FCF svänger −17 090→+21 174→+7 809→−20 085→−12 852 £M = kundmedelsflödenas berg-och-dalbana): utdelningar £1 306→1 913→2 178→2 326→2 463 M (fyra raka stigande efter FY21), återköp £3 408→3 835→2 128→3 469 M FY22→25 (FY2021 blank i källtabellen — ärligt bokförd), AKTIEBAS 70 562 M FY2021 → 58 081 M TTM = −17,69 % på 4,5 år, payout 49,88 %, buyback yield 3,04 % + utdelning 3,31 % ⇒ shareholder yield 6,39 %, fyra raka div-tillväxtår; branschfält Financials/Banks — retail & mortgages (Halifax-sfären)",
      },
      {
        namn: "Yahoo Finance chart-API (paranoid)",
        hamtat: "2026-09-21",
        url: "https://query1.finance.yahoo.com/v8/finance/chart/LLOY.L?range=5d&interval=1d",
        paranoid:
          "close 2026-09-18 = 108,95 GBX (£1,0895) via WebFetch-kanalen; IDENTISK med SA:s previous close 108,95 — band 0,00 %; dagsfasta: 108,90 (tis 15/9) · 111,25 (ons) · 112,20 (tors) · 108,95 (fre 18/9) — fredagsfallet −2,90 % mot torsdagen",
      },
    ],
    hamtat: "2026-09-21",
    pris: 1.0895,
    marknadsKapitalMdr: 62.72,
    tillvaxt: {
      omsattningCAGR5ar: 0.0212,
      resultatCAGR5ar: -0.0473,
      omsattningTillvaxtTTM: 0.0572,
      prognosTillvaxt: 0.3986,
    },
    lonksamhet: {
      roe: 0.1134,
      roic: null,
      bruttoMarginal: null,
      ebitMarginal: 0.3819,
      nettoMarginal: 0.2416,
      fcfMarginal: null,
    },
    stabilitet: {
      skuldEgenkapital: null,
      rantaTackning: null,
      fcfPositivaSenaste5: null,
      kassaManaderBurnRate: null,
      nyemissionerSenaste5ar: null,
    },
    aterkop: {
      senasteArMdr: null,
      andelUtestande: null,
      insiderkopSenaste6man: null,
    },
    moat: {
      bruttoMarginalMedel5ar: null,
      bruttoMarginalSpread5ar: null,
      roeMedel5ar: null,
    },
    vardering: {
      pe: 13.65,
      pb: 1.33,
      evEbit: null,
      peg: 0.34,
      fcfYield: null,
      egenKapitalMultipl: 1.33,
    },
    golv: { typ: "osatt", vardePerAktie: null, marginal: null },
    serier: {
      ar: ["2021", "2022", "2023", "2024", "2025"],
      omsattning: [17127000000, 14530000000, 18326000000, 17572000000, 18627000000],
      resultat: [5355000000, 3389000000, 4933000000, 3923000000, 4196000000],
      egetKapital: [],
      fcf: [],
    },
    notering:
      "STORBRITANNIEN/FINANS 2→5:5 (UK-banktrions hushållsarm — Halifax-sfären, UK:s största bolånebank). SIGNATURTAL — (1) PROGNOSGAPET +39,9 % (trailing 13,65 mot fwd 9,76) = TRIONS STÖRSTA: marknadens högst prissatta storbank med störst väntade EPS-tillväxt — PEG 0,34 spårets mot källans 0,52 (3-års EPS +26,07 % — källans egen PEG bär basen, båda dokumenterade); (2) P/E 13,65 = CELLENS DYRASTE bank (mot BARC 9,61 · NWG 9,37 · HSBC 16,6 som icke-trio-referens) med P/B 1,33 — hushållsbankens stabilare inlåning prissätts över syskonens investmentbank-vikter; (3) netto-karusellen 5 355→3 389→4 933→3 923→4 196 £M (endpoint −5,9 %/år ÄRLIGT: FY2021:s efterpandemi-topp 31,3 % marginal, FY2024:s dipp, TTM +15,0 % återhämtning) — trions enda med FALLANDE endpoint-trend men STIGANDE TTM; (4) totala tillgångar £994 mdr ≈ HALVA Barclays trots större kundbas — detaljutlåningens balansvikt mot investmentbankens; (5) aktiebas −17,69 % på 4,5 år (70 562→58 081 M) + utdelningsserie fyra raka stigande 1 306→2 463 £M + återköp 3 469 £M FY2025 ⇒ shareholder yield 6,39 %. Bankkonvention: fcf-fält null (källans FCF-sväng ±20 mdr = kundmedelsflöden), EV/EBIT null. FIFO: Q3-rapp 2026-10-27.",
  },
];

// ── Race-vakt + append på diskens faktiska läge ─────────────────────────────
const u = JSON.parse(readFileSync(FIL, "utf8"));
const dup = u.filter((b) => MINA.includes(b.ticker));
if (dup.length) {
  console.error(`RÖD: ${dup.map((d) => d.ticker).join(", ")} finns redan på disk — duplikatstopp`);
  process.exit(1);
}
const UKfin = u.filter((b) => b.land === "Storbritannien" && b.bransch === "finans");
console.log(`diskens läge FÖRE: ${u.length} poster · UK/finans-cellen: ${UKfin.length} (${UKfin.map((b) => b.ticker).join(", ")})`);
if (UKfin.length !== 2) {
  console.error(`RÖD: UK/finans-cellen är ${UKfin.length}, inte 2 — klaimkoordinaten ogiltig (syskonrace?)`);
  process.exit(1);
}
const gamla = JSON.stringify(u, null, 2);
const nya = [...u, ...poster];
const ut = JSON.stringify(nya, null, 2);
// innehållsidentitets-bevis: diskens 246 poster (inkl syskonens AI.PA/DSY.PA/CAP.PA
// som landade under fönstret) ska vara strukturellt identiska som prefix
if (JSON.stringify(nya.slice(0, u.length), null, 2) !== gamla) {
  console.error("RÖD: gamla rader ej innehållsidentiska vid append");
  process.exit(1);
}
if (!ut.startsWith(gamla.slice(0, -2))) {
  console.error("RÖD: append inte suffix-läge (gamla block ej först)");
  process.exit(1);
}
writeFileSync(FIL, ut + "\n");
const efter = JSON.parse(readFileSync(FIL, "utf8"));
console.log(`EFTER: ${efter.length} poster (+${efter.length - u.length}) · UK/finans-cellen: ${efter.filter((b) => b.land === "Storbritannien" && b.bransch === "finans").length}`);
console.log("nya tickers:", efter.slice(-3).map((b) => b.ticker).join(", "));
console.log("indent-kontroll: sista 3 raderna börjar med mellanslag:", ut.split("\n").slice(-8).filter((r) => r.startsWith('    "ticker')).length, "ticker-rader à 4 mellanslag");
