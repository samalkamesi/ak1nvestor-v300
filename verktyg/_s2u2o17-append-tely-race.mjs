#!/usr/bin/env node
/**
 * s2-u2 omg17 (manifest auto-s2-1789782925889) — append Tokyo Electron + Ferrari
 * till bolagsunivers.json med ARITMETISK ABORT-GRIND (omg13-läxan: FEL>0 ⇒
 * INGET skrivs). Konventioner:
 *  - 8035.T = TSE-PRIMÄRNOTERING (Samsung/KRX-precedensen omg12): FY-serier i
 *    rapportvaluta JPY, räkenskapsår april–mars med SLUTÅRSETIKETT
 *    (TCS.NS/NTDOY-konventionen), statistics-TTM i JPY.
 *  - RACE = NYSE-ADR (BUD/ITUB-precedensen): pris/mcap/statistics-TTM i USD,
 *    FY-serier i rapportvaluta EUR (PBR/VALE-precedensen), kalenderår.
 *  - Superlativtest FÖRE bygg (spår 1:s läxa): P/B-rank TEL 27 / RACE 18,
 *    P/E-rank TEL 22 / RACE 20 av 183, ROE-rank 20/35, ROIC-rank 22/22 —
 *    MITT I FALTET, noteringarna bär placeringar ej superlativer.
 *  - Idempotent: redan tagna tickers hoppar append-raden (syskonvakt).
 * Källa: stockanalysis.com (stämplad 2026-09-18: US close 18:e, TSE 15:30 JST
 * 18:e — fördröjd notis enligt källsidan).
 * ODDITET DOKUMENTERAD: kassflödesradens NI (FY2026 748,2 mdr JPY) avviker från
 * resultaträdens NI (574,5) hos källan — CF-bilden bär totalresultatposter;
 * IS-siffrorna är radens underlag (EPS-konsistens bevisar).
 */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/portfolj-system/bolagsunivers.json";
const univers = JSON.parse(readFileSync(FIL, "utf8"));

const KONTROLLER = [];
let FEL = 0;
const kontroll = (id, namn, irritall, expect, tolerans = 0.005, motiv = "") => {
  const avv = Math.abs(irritall - expect);
  const gron = avv <= tolerans;
  if (!gron) FEL++;
  KONTROLLER.push({ id, irritall, expect, avv, tolerans, gron, motiv });
};

// ══════════════ TOKYO ELECTRON (8035.T) ══════════════
// Aritmetik innan raden skrivs
kontroll("TEL-01", "P/E-identitet pris/EPS-TTM", 53110 / 1354.41, 39.21, 0.005,
  "EXAKT: källans EPS-rad bär TTM-yta — starkaste identiteten i raden");
kontroll("TEL-02", "P/B pris/BVPS", 53110 / 4713.28, 11.27, 0.005, "källans P/B; equity 2 142,9 mdr JPY (BVPS × 454,65 M)");
kontroll("TEL-03", "prognosTillväxt pe/fwd−1", 39.21 / 28.26 - 1, 0.38747, 0.0005, "TTE-spårkonventionen");
kontroll("TEL-04", "PEG pe/(100·prognos)", 39.21 / 38.747, 1.01, 0.005,
  "spårkonvention; källans PEG 0,90 som not (källan räknar på 3-årsprognos +26,52 %/år)");
kontroll("TEL-05", "EV/EBIT-replik (mcap−nettokassa)/EBIT", (24150 - 409.61) / 691.652, 34.19, 0.2,
  "egen kvot 34,32 mot källans 34,19 (0,4 %) — källans EV bär exakta poster; VALE/ABEV-klassens dokumenterade marginal");
kontroll("TEL-06", "fcfYield FCF/mcap", 391.252 / 24150, 0.0162, 0.0005, "källans P/FCF 61,72 ⇒ 1,62 %");
kontroll("TEL-07", "bruttoMarginal", 1196.623 / 2626.335, 0.4556, 0.0005, "källans 45,56 %");
kontroll("TEL-08", "ebitMarginal", 691.652 / 2626.335, 0.2634, 0.0005, "källans 26,34 %");
kontroll("TEL-09", "nettoMarginal", 620.994 / 2626.335, 0.2364, 0.0005, "källans 23,64 %");
kontroll("TEL-10", "fcfMarginal", 391.252 / 2626.335, 0.149, 0.0005, "källans 14,90 %");
kontroll("TEL-11", "oms-CAGR serieendpoints 3 steg", Math.pow(2443533 / 2209025, 1 / 3) - 1, 0.0343, 0.0005, "M JPY FY2023→FY2026");
kontroll("TEL-12", "res-CAGR serieendpoints 3 steg", Math.pow(574454 / 471584, 1 / 3) - 1, 0.068, 0.0005, "M JPY FY2023→FY2026");
kontroll("TEL-13", "omsattningTillvaxtTTM", 2626335 / 2443533 - 1, 0.0748, 0.0005, "TTM jun-26 mot FY2026");
kontroll("TEL-14", "bruttoMedel5ar FY2022–FY2026",
  (911822 / 2003805 + 984408 / 2209025 + 830270 / 1830527 + 1146288 / 2431568 + 1107881 / 2443533) / 5,
  0.4558, 0.0005, "fem kvoter ur källans brutokolumn");
kontroll("TEL-15", "bruttoSpread max−min", 1146288 / 2431568 - 984408 / 2209025, 0.0258, 0.0005, "FCX/VALE-konventionen max−min (FY2025-toppen − FY2023-botten)");
kontroll("TEL-16", "ROIC-spread", 0.321 - 0.1157, 0.2053, 0.0005, "ROIC 32,10 % mot WACC 11,57 %");
kontroll("TEL-17", "mcap/aktieenheter", 24150000 / 454.65, 53110, 30,
  "24 150 mdr JPY / 454,65 M aktier = 53 105 ≈ pris 53 110 (0,01 % — källans shares-rad bär mcap)");

const TEL = {
  ticker: "8035.T",
  namn: "Tokyo Electron Limited",
  bransch: "teknik",
  land: "Japan",
  valuta: "JPY",
  kallor: [
    {
      namn: "StockAnalysis",
      hamtat: "2026-09-18",
      url: "https://stockanalysis.com/quote/tyo/8035/",
      paranoid:
        "TSE-primärnoteringen (översikt + statistics + financials + cash-flow-statement, underlag S&P Global Market Intelligence + Fiscal.ai; fördröjd notis 2026-09-18 15:30 JST — dag +4,20 %): pris 53 110 JPY, mcap 24,15 T JPY (454,65 M aktier), EV 23,74 T (NETTOKASSA: kassa 409,61 mdr JPY, total skuld n/a/ingen), P/E 39,21 EXAKT mot EPS-TTM 1 354,41, forward 28,26, PEG 0,90 (källans — 3-årsprognosunderlag; spårets TTE-PEG 1,01), P/S 9,19, P/B 11,27 (BVPS 4 713,28; equity 2 142,9 mdr), P/FCF 61,72, EV/EBIT 34,19 (replik (24 150−409,61)/691,652 = 34,32 — 0,4 %; källans EV bär exakta poster), EV/EBITDA 30,39; TTM JPY (mdr): rev 2 626,335, brutto 1 196,623, EBIT 691,652, netto 620,994, EBITDA 778,34; OCF 583,522, capex 192,270, FCF 391,252 (fcfYield 1,62 %); marginaler TTM: brutto 45,56 %, operating 26,34 %, profit 23,64 %, EBITDA 29,64 %, FCF 14,90 %; ROE 30,93 %, ROA 15,82 %, ROIC 32,10 % mot WACC 11,57 %; skuld/ek 0 (skuldfri), räntetäckning n/a, Altman Z 15,74 (nettokassa-jätten), Piotroski F 3; effektiv skatt 23,50 %; utdelning 748 JPY (1,41 %, källans payout 46,28 % — beräkningsunderlag ej replikerbart ur TTM-EPS, egen kvot 748/1 354,41 = 55,2 % dokumenterad), ex-div 2026-09-29; återköpsyield 0,43 %; beta 1,33 (5Y), 52-v 24 165–81 260 (3,4× — bland universumets bredaste; kursen −34,7 % från toppen på AI-omvärderingen); insiders 0,05 %, institutioner 47,02 %; analytiker Buy PT 76 809 JPY; rev-prognos 3 år +26,52 %/år; anställda 20 236; nästa rapport 2026-10-30; räkenskapsår APRIL–MARS med slutårsetikett (FY2026 = apr 2025–mar 2026 — TCS.NS/NTDOY-konventionen); FY-serier i JPY (M): rev 2 003 805→2 209 025→1 830 527→2 431 568→2 443 533, netto 437 076→471 584→363 963→544 133→574 454 (FY2022→FY2026), brutto 911 822→984 408→830 270→1 146 288→1 107 881; kassaflöde FY2026: OCF 539,732, capex 208,984, FCF 330,748; utdelningar betalda 166 252→252 988→202 457→236 276→271 618 (M JPY FY2022→FY2026), återköp 15→1 728→120 028→150 008→150 010; ODDITET: kassaflödesradens NI (FY2026 748 180 M) avviker från resultaträdens (574 454) — källans CF-bild bär totalresultatposter, IS-siffrorna är underlag (EPS-konsistensen 1 250,88 × 454,65 M ≈ 570 mdr bevisar); bransch Technology/Special Industry Machinery källkonsekvent med teknik-grenen",
    },
  ],
  hamtat: "2026-09-18",
  pris: 53110,
  marknadsKapitalMdr: 24150,
  tillvaxt: {
    omsattningCAGR5ar: 0.0343,
    resultatCAGR5ar: 0.068,
    omsattningTillvaxtTTM: 0.0748,
    prognosTillväxt: 0.3875,
  },
  lonksamhet: {
    roe: 0.3093,
    roic: 0.321,
    bruttoMarginal: 0.4556,
    ebitMarginal: 0.2634,
    nettoMarginal: 0.2364,
    fcfMarginal: 0.149,
  },
  stabilitet: {
    skuldEgenkapital: 0,
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
    bruttoMarginalMedel5ar: 0.4558,
    bruttoMarginalSpread5ar: 0.0258,
    roeMedel5ar: null,
  },
  vardering: {
    pe: 39.21,
    pb: 11.27,
    evEbit: 34.19,
    peg: 1.01,
    fcfYield: 0.0162,
    egenKapitalMultipl: 11.27,
  },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2023", "2024", "2025", "2026"],
    omsattning: [2209025000000, 1830527000000, 2431568000000, 2443533000000],
    resultat: [471584000000, 363963000000, 544133000000, 574454000000],
    egetKapital: [],
    fcf: [359373000000, 317727000000, 423800000000, 330748000000],
  },
  notering:
    "JAPAN/TEKNIK-CELLENS FÖRSTA RAD (Japan 2→3: TM Toyota konsument · NTDOY Nintendo kommunikation · 8035.T teknik — världens fjärde största börsekonomi fick sin teknikgren) och HALVLEDARKEDJANS UTROSTNINGS-LED: ASML (EUV-litografi) → TSMC (foundry) → Samsung (minne + foundry) → TOKYO ELECTRON (beläggning/framkallning, gravering och avsättning) — en av världens största tillverkare av halvledarutrustning och kapitalkedjans fjärde ben; ASML:s konkurrent på process-steget bredvid litografin. WAFE-CYKELNS ANDRA SVING: omsättning 2,21→1,83 T JPY (FY2023→FY2024, −17 %) med resultat −23 % — sedan återgång 2,43→2,44 T med TTM 2,63 T (+7,5 % mot FY2026); prognosTillväxt +38,7 % (P/E 39,21 mot forward 28,26) med källans 3-års rev-prognos +26,52 %/år som kalibrering — AI-byggvågen i källans prognosunderlag. VALLGRAVEN ÄR MARGINALSTABILITETEN, INTE NIVÅN: brutto 45,6 % (under Samsungs 57,5 % men med femårs-spread 2,6 pp — mot VALE:s 25 pp: processknow-how prissätts som halvfabrikat, inte råvara). BALANSRÄKNINGEN: NOLL skuld, nettokassa 409,6 mdr JPY (17 % av mcap), Altman Z 15,74 — men Piotroski F 3 (momentum-komponenterna sjunker i toppcykler — kontrasten är pedagogiken). KAPITALÅTERKOMSTEN FÖDS I CYKELN: återköp 15→1 728→120 028→150 008→150 010 M JPY (FY2022→FY2026 — Samsung-mönstret: återköpen startar vid resultattratten) + utdelningar 166→253→202→236→272 M JPY; DPS 748 JPY (1,41 %). ROIC 32,10 % mot WACC 11,57 % = +20,5 pp (utrustningshusets kapitalätande men lönsamma cykel). KURSBILDET: 52-vägers 24 165–81 260 JPY = 3,4× SPridning (bland universumets bredaste; −34,7 % från toppen) med beta 1,33 — cykelns båda ändar i ett år; dag +4,20 %. P/B 11,27 på BVPS 4 713,28. Räkenskapsår april–mars med SLUTÅRSETIKETT (TCS/NTDOY-konventionen), FY-serier i JPY enligt Samsung-precedensen. Nästa rapport 2026-10-30, ex-div 2026-09-29.",
};

// ══════════════ FERRARI (RACE) ══════════════
kontroll("RACE-01", "P/E-identitet mcap/NI", 78.08 / 1.87, 41.77, 0.05,
  "källans P/E bär mcap på share class 192,48 M — 41,76; pris/EPS-rad 406,69/10,54 = 38,6 (aktiebas-spridning dokumenterad, ITUB-notisens mönster)");
kontroll("RACE-02", "prognosTillväxt pe/fwd−1", 41.77 / 37.27 - 1, 0.12074, 0.0005, "TTE-spårkonventionen");
kontroll("RACE-03", "PEG pe/(100·prognos)", 41.77 / 12.074, 3.46, 0.005, "spårkonvention (källans PEG n/a)");
kontroll("RACE-04", "P/B mcap/equity", 78.08 / 4.19, 18.65, 0.02,
  "källans P/B 18,65 bär exakt equity (78,08/18,65 = 4,184 mdr) mot equity-raden 4,19 (2 dec) — FCX/VALE-klassens dokumenterade avrundningsmarginal; P/TBV 58,54");
kontroll("RACE-05", "EV/EBIT-replik (mcap+skuld−kassa)/EBIT", (78.08 + 3.62 - 1.64) / 2.47, 32.41, 0.05,
  "replik 32,41 EXAKT mot källans EV 80,08 mdr — EV-måttet konvergerar");
kontroll("RACE-06", "fcfYield FCF/mcap", 2.19 / 78.08, 0.028, 0.0005, "källans P/FCF 35,58 ⇒ 2,81 %; egen kvot 2,80 %");
kontroll("RACE-07", "bruttoMarginal", 4.34 / 8.4, 0.5162, 0.0005, "källans 51,62 % bär exakta tal (egen kvot 51,67 %)");
kontroll("RACE-08", "ebitMarginal", 2.47 / 8.4, 0.2941, 0.0005, "källans 29,41 %");
kontroll("RACE-09", "nettoMarginal", 1.87 / 8.4, 0.2225, 0.0005, "källans 22,25 %");
kontroll("RACE-10", "fcfMarginal komponentkvot", 2.19 / 8.4, 0.2598, 0.0015,
  "källans 25,98 % (FCF 2,1826 mdr exakt) mot egen kvot 26,07 % (avrundade komponenter) — PBR/VALE-mönstret; fältet = källans");
kontroll("RACE-11", "oms-CAGR serieendpoints 3 steg", Math.pow(7146 / 5095, 1 / 3) - 1, 0.1194, 0.0005, "M EUR FY2022→FY2025");
kontroll("RACE-12", "res-CAGR serieendpoints 3 steg", Math.pow(1597 / 932.6, 1 / 3) - 1, 0.1963, 0.0005, "M EUR FY2022→FY2025");
kontroll("RACE-13", "omsattningTillvaxtTTM EUR", 7353 / 7146 - 1, 0.029, 0.0005, "TTM jun-26 mot FY2025, rapportvalutan");
kontroll("RACE-14", "bruttoMedel5ar FY2021–FY2025",
  (2190 / 4271 + 2446 / 5095 + 2974 / 5970 + 3347 / 6677 + 3693 / 7146) / 5,
  0.5018, 0.0005, "fem kvoter ur källans EUR-kolumner");
kontroll("RACE-15", "bruttoSpread max−min", 3693 / 7146 - 2446 / 5095, 0.0367, 0.0005,
  "FY2022-botten 48,0 % → FY2025-topp 51,7 % — marginalen BYGGS, ej ärvs");
kontroll("RACE-16", "ROIC-spread", 0.3152 - 0.0725, 0.2427, 0.0005, "ROIC 31,52 % mot WACC 7,25 %");
kontroll("RACE-17", "DPS-payout", 4.26 / 10.54, 0.4041, 0.0005, "källans 40,41 % EXAKT replikerbar");
kontroll("RACE-18", "skuld/ek", 3.62 / 4.19, 0.86, 0.005, "källans 3,62/4,19 mdr USD");

const RACE = {
  ticker: "RACE",
  namn: "Ferrari N.V.",
  bransch: "konsument",
  land: "Italien",
  valuta: "USD",
  kallor: [
    {
      namn: "StockAnalysis",
      hamtat: "2026-09-18",
      url: "https://stockanalysis.com/stocks/race/",
      paranoid:
        "NYSE-ADR (översikt + statistics + financials + cash-flow-statement, underlag S&P Global Market Intelligence; close 2026-09-18, −1,77 %): pris 406,69 USD, mcap 78,08 mdr (källans mcap bär share class 192,48 M aktier: 78,08/406,69 = 192,0 M — mot shares-raden 175,92 M; aktiebas-spridningen dokumenterad, ITUB-notisens mönster), EV 80,08 mdr (net debt −1,98: skuld 3,62 − kassa 1,64), P/E 41,77 (= mcap/NI 78,08/1,87; pris/EPS 406,69/10,54 = 38,6 — P/E:n bär mcap-basen), forward 37,27, PEG n/a (spårets TTE-PEG 3,46), PS 9,29, P/B 18,65 (equity 4,19 mdr; P/TBV 58,54), P/FCF 35,58, P/OCF 28,24, EV/EBIT 32,41 (replik (78,08+3,62−1,64)/2,47 = 32,41 EXAKT), EV/EBITDA 28,37, EV/Sales 9,53; TTM USD (mdr): rev 8,40 (+5,7 %), brutto 4,34, EBIT 2,47, pretax 2,43, netto 1,87 (+2,6 %), EBITDA 2,82, EPS 10,54; OCF 2,77, capex 0,571, FCF 2,19 (12,48/aktie); marginaler TTM: brutto 51,62 %, operating 29,41 %, pretax 28,94 %, profit 22,25 %, EBITDA 33,60 %, FCF 25,98 % (egen kvot 26,07 %); ROE 45,44 %, ROA 13,61 %, ROIC 31,52 % mot WACC 7,25 % (ROCE 26,81 %); skuld/ek 0,86 (3,62/4,19), BVPS 23,76, arbetskapital 3,51 mdr; skatt 0,559 mdr, effektiv 23,01 %; utdelning 4,26 USD (1,05 %, payout 40,41 % EXAKT på 4,26/10,54), ex-div 2026-04-21; återköp 0,97 %, shareholder yield 2,02 %; beta 0,60 (5Y), 52-v 312,51–504,49 (−13,48 % på året); Altman Z 7,79, Piotroski F 6; short 2,93 % (dygn 7,84); insiders 0,06 %, institutioner 56,69 %; analytiker Strong Buy PT 462,11 (+13,63 %); anställda 5 718; nästa rapport 2026-11-03 (BMO); FY-serier i EUR (M) kalenderår enligt BUD/ITUB-ADR-precedensen (statistics-TTM USD-översatt, växelkurs ≈1,142 ur EPS-paret 10,54/9,23): rev 4 271→5 095→5 970→6 677→7 146, netto 830,77→932,6→1 252→1 522→1 597 (FY2021→FY2025), brutto 2 190→2 446→2 974→3 347→3 693, EPS EUR 4,50→5,09→6,90→8,46→8,96; kassaflöde FY2025 EUR: OCF 2 349, capex 485, FCF 1 864; utdelningar betalda 160,1→249,52→328,63→439,92→529,71 (M EUR FY2021→FY2025), återköp 230,9→396,52→460,63→581,08→785,33; bransch Consumer Discretionary/Auto Manufacturers källkonsekvent med konsument-grenen; pressmeddelanden datelade Maranello (Italy) — källans HQ-bild; NV-registreringen i Nederländerna (Ferrari N.V.) dokumenterad som juridisk hemvist med drift och identitet i Maranello",
    },
  ],
  hamtat: "2026-09-18",
  pris: 406.69,
  marknadsKapitalMdr: 78.08,
  tillvaxt: {
    omsattningCAGR5ar: 0.1194,
    resultatCAGR5ar: 0.1963,
    omsattningTillvaxtTTM: 0.029,
    prognosTillvaxt: 0.1207,
  },
  lonksamhet: {
    roe: 0.4544,
    roic: 0.3152,
    bruttoMarginal: 0.5162,
    ebitMarginal: 0.2941,
    nettoMarginal: 0.2225,
    fcfMarginal: 0.2598,
  },
  stabilitet: {
    skuldEgenkapital: 0.86,
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
    bruttoMarginalMedel5ar: 0.5018,
    bruttoMarginalSpread5ar: 0.0367,
    roeMedel5ar: null,
  },
  vardering: {
    pe: 41.77,
    pb: 18.65,
    evEbit: 32.41,
    peg: 3.46,
    fcfYield: 0.028,
    egenKapitalMultipl: 18.65,
  },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2022", "2023", "2024", "2025"],
    omsattning: [5095000000, 5970000000, 6677000000, 7146000000],
    resultat: [932600000, 1252000000, 1522000000, 1597000000],
    egetKapital: [],
    fcf: [1056000000, 1335000000, 1444000000, 1864000000],
  },
  notering:
    "ITALIEN/KONSUMENT-CELLENS FÖRSTA RAD (Italien 1→2: ENEL.MI energi + RACE konsument) och LYX-KLUSTRETS AUTO-ÄNDE: MC.PA LVMH (lyxens konglomerat, brutto 66 %-klassen) möter biltillverkningens ekonomiska motpol — Ferrari brutto 51,6 % EBIT 29,4 % netto 22,3 % mot bil-volymtillverkarnas brutto ~15–18 %-värld (EMBJ 17,9 %): väntelistornas prissättningsmakt flyttar bilen från tillverknings- till varumärkesekonomi, och öl-trions värld på fyra hjul (ABEV 51,9 · BUD 56,5 · CARL-B 45,0). MARGINALEN BYGGS: brutto FY2022 48,0 % → FY2025 51,7 % (spread 3,7 pp över fem år — prissättningsmakten ökar inåt, VALE-spegelbilden). LÖNSAMHETEN: ROE 45,44 % · ROIC 31,52 % mot WACC 7,25 % = +24,3 pp — 5 718 anställda bär 1,87 mdr USD i nettoresultat (1,47 M USD per anställd): tillverkaren med storbankens resultat. TILLVÄXTMASKINEN I EUR: omsättning +11,9 %/år (5 095→7 146 M EUR FY2022→FY2025), resultat +19,6 %/år, TTM +2,9 %; prognosTillväxt +12,1 % (P/E 41,77 mot forward 37,27). VÄRDERINGENS TRIANGEL: P/E 41,77 (rank 20 av 183 — över medianen 21-klassen men ej extrem) · P/B 18,65 mot P/TBV 58,54 · EV/EBIT 32,41 (replikerad EXAKT) · PEG 3,46 — kvalitetens pris i alla tre multiplar; beta 0,60 trots 52-vägars −13,5 % (312,51–504,49). KAPITALPOLITIKENS TRAPPA: utdelningar EUR 160→250→329→440→530 M (FY2021→FY2025) + återköp 231→785 M — shareholder yield 2,02 % (payout 40,41 % EXAKT replikerbar på 4,26/10,54 USD); net skuld −1,98 mdr USD (skuld/ek 0,86 — elmotorns omställnings-lån). Altman Z 7,79, Piotroski 6, short 2,93 %. NYSE-ADR (2002-notingen), FY-serier i EUR kalenderår enligt BUD/ITUB-precedensen (statistics-TTM i USD, växelkurs ≈1,142 ur EPS-paret); aktiebas-spridningen dokumenterad (shares-rad 175,92 M mot share class 192,48 M — källans mcap bär den senare). Ferrari N.V.: NV-registrering i Nederländerna, drift och identitet i Maranello (källans HQ-bild). Nästa rapport 2026-11-03 (BMO — samma dag som ITUB:s AMC), ex-div 2026-04-21.",
};

// ══════════════ ABORT-GRIND + APPEND ══════════════
console.log(`KONTROLLER: ${KONTROLLER.length} st, FEL = ${FEL}`);
for (const k of KONTROLLER) {
  if (!k.gron) console.log(`  RÖD ${k.id}: irritall ${k.irritall} expect ${k.expect} avv ${k.avv} > tol ${k.tolerans} — ${k.motiv}`);
}
if (FEL > 0) {
  console.error("ABORT: aritmetisk grind RÖD — INGET skrivs (omg13-läxan)");
  process.exit(1);
}
for (const k of KONTROLLER) console.log(`  GRÖN ${k.id} (${k.irritall.toFixed ? k.irritall.toFixed(4) : k.irritall} ≈ ${k.expect}) — ${k.motiv}`);

const fanns = new Set(univers.map((b) => b.ticker));
let tillagda = [];
if (!fanns.has("8035.T")) { univers.push(TEL); tillagda.push("8035.T"); }
if (!fanns.has("RACE")) { univers.push(RACE); tillagda.push("RACE"); }

if (tillagda.length) {
  writeFileSync(FIL, JSON.stringify(univers, null, 1) + "\n");
  console.log(`APPEND: ${tillagda.join("+")} — universum ${fanns.size}→${univers.length}`);
} else {
  console.log(`IDEMPOTENT: 8035.T/RACE redan på disk (${univers.length} rader) — inget skrivet`);
}
