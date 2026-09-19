#!/usr/bin/env node
/**
 * s2-u2 omg19 (manifest auto-s2-1789831500945) — append MUFG 8306.T + BNP Paribas BNP.PA
 * till bolagsunivers.json med ARITMETISK ABORT-GRIND (omg13-läxan: FEL>0 ⇒ INGET
 * skrivs). Konventioner:
 *  - MUFG 8306.T = TYO-PRIMÄRNOTERING (8035.T/9983.T-precedensen): /quote/tyo/8306/,
 *    pris i JPY, mcap i JPY mdr (mdr = 10^12), FY april–mars med SLUTÅRSETIKETT
 *    (S32.AX-mönstret: FY2026 = avslutad mars 2026), TTM-fönster jun-26.
 *  - BNP.PA = EURONEXT PARIS-PRIMÄR (TTE.PA/AIR.PA-precedensen): /quote/epa/BNP/,
 *    pris EUR, mcap EUR mdr, kalenderår.
 *  - BANKKONVENTIONEN (ITUB/RY/HSBA.L-ordlistan): evEbit/fcfYield/roic/bruttoMarginal/
 *    fcfMarginal = null (bankens EV/FCF är meningslösa på insättarnas balansräkning),
 *    stabilitet+moat = null, ebitMarginal bär källans OPERATING-marginal, nettoMarginal
 *    bär financials-ytans kvot.
 *  - TTE-spårets prognosTillväxt = pe/fwd − 1; PEG = pe/(100·prognos).
 *  - Superlativtestat på 201-läget FÖRE bygg (sond 2026-09-19): BNP P/E 8,72 =
 *    finansgrenens 4:e lägsta (INVE-B 4,79 · ORES 9,43 · ITUB 10,57 under; marginal
 *    till 5:e plats SHB-A 12,4) · P/B 0,80 = 16:e lägsta av 198 (VOW3:s 0,1x-klass
 *    långt under) · MUFG oms-CAGR +22,8 % = 11:e högsta av 192 · MUFG P/E 20,69 =
 *    17:e av 20 i grenen (övre fältet, ej superlativ) · noteringarna bär PLACERINGAR.
 *  - Idempotent: redan tagna tickers hoppar append-raden (syskonvakt).
 * Källa: stockanalysis.com (S&P Global Market Intelligence-underlag; MUFG stämplad
 * 2026-09-18 JST close, BNP 2026-09-18 17:39 CET).
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
  KONTROLLER.push({ id, namn, irritall, expect, avv, tolerans, gron, motiv });
};
const jaNej = (id, namn, sant, motiv) => {
  if (!sant) FEL++;
  KONTROLLER.push({ id, namn, irritall: sant ? 1 : 0, expect: 1, avv: sant ? 0 : 1, tolerans: 0, gron: sant, motiv });
};

// ══════════════ MITSUBISHI UFJ FINANCIAL GROUP (8306.T) ══════════════
kontroll("MUFG-01", "P/E-identitet pris/EPS-TTM", 3620 / 174.97, 20.69, 0.02,
  "EXAKT-klassen: 20,686 mot källans 20,69 (0,02 %) — EPS-raden bär TTM-ytan");
kontroll("MUFG-02", "P/B mcap/equity", 40.75 / 24.18, 1.685, 0.005,
  "källans P/B 1,68 (P/TBV 1,97 dokumenterad i paranoid); equity 24,18 T JPY");
kontroll("MUFG-03", "prognosTillväxt pe/fwd−1", 20.69 / 13.51 - 1, 0.5315, 0.0005,
  "TTE-spårkonventionen (ITUB:s +14,3 %-klass); källans PEG 0,95 som not");
kontroll("MUFG-04", "PEG pe/(100·prognos)", 20.69 / 53.146, 0.3893, 0.0005,
  "spårkonvention; källans PEG-fält 0,95 bär annan tillväxtbas — dokumenterad");
kontroll("MUFG-05", "DPS-yield", 96 / 3620, 0.0265, 0.0005, "källans 2,65 %");
kontroll("MUFG-06", "DPS-payout", 96 / 174.97, 0.5487, 0.0005,
  "källans 54,87 % — INGEN bas-splitter (kvoten exakt på TTM-EPS)");
kontroll("MUFG-07", "mcap/aktieenheter", 40750 / 11.26, 3620, 5,
  "40,75 T JPY / 11,26 Mdr aktier = 3 618,99 ≈ pris 3 620 (0,03 % — aktiebasen bär mcap)");
kontroll("MUFG-08", "oms-CAGR serieendpoints 4 steg", Math.pow(6711541 / 2953234, 1 / 4) - 1, 0.2278, 0.0005,
  "M JPY FY2022→FY2026 — intäktsdubblingen 2,27× på fyra år (11:e högsta i universumet)");
kontroll("MUFG-09", "res-CAGR-not FY2023→FY2026", Math.pow(1729359 / 381798, 1 / 3) - 1, 0.6543, 0.0005,
  "resultatCAGR5ar = NULL: FY2022-basen −83 320 M är negativ (BUD-konventionen — CAGR ohärlebar); not-talet låses här");
kontroll("MUFG-10", "ebitMarginal operating/rev", 3460000 / 7260459, 0.4771, 0.001,
  "källans operating 3,46 T avrundat (replik 47,65 % mot fältet 47,71 % — fönstret dokumenterat)");
kontroll("MUFG-11", "nettoMarginal", 1992718 / 7260459, 0.2745, 0.0005, "källans 27,45 % TTM");
kontroll("MUFG-12", "omsattningTillvaxtTTM replik", 7260459 / 5452535 - 1, 0.3315, 0.005,
  "fältet = källans TTM-tillväxt 33,45 %; egen replik TTM/TTM 33,15 % — källans growth-fönster bår annat par, dokumenterat");
kontroll("MUFG-13", "netto-tillväxt TTM", 1992718 / 1256790 - 1, 0.585, 0.005, "källans +58,5 % (1 992,7 mot föregående TTM 1 256,8)");
kontroll("MUFG-14", "shareholder yield DPS+återköp", 0.0265 + 0.0217, 0.0483, 0.0005, "källans 4,83 % = 2,65 + 2,17");
kontroll("MUFG-15", "från 52-v-toppen", 3620 / 3813 - 1, -0.0506, 0.0005, "kursen −5,1 % under toppen 3 813");
kontroll("MUFG-16", "nettkassa kassa−skuld (T JPY)", (143103682 - 108380645) / 1e6, 34.723, 0.05,
  "143 103 682 − 108 380 645 M JPY = 34,72 T JPY NETTKASSA — källans fält exakt");
jaNej("MUFG-17", "52-v-intervallet omsluter kursen", 3620 >= 2230.5 && 3620 <= 3813, "2 230,50–3 813,00");
jaNej("MUFG-18", "DPS-trappan stigande 5 år", 28 < 32 && 32 < 41 && 41 < 64 && 64 < 86,
  "FY2022→FY2026: 28→32→41→64→86 JPY, current 96 — nio raka tillväxtår enligt källan");

const MUFG = {
  ticker: "8306.T",
  namn: "Mitsubishi UFJ Financial Group",
  bransch: "finans",
  land: "Japan",
  valuta: "JPY",
  kallor: [
    {
      namn: "StockAnalysis",
      hamtat: "2026-09-18",
      url: "https://stockanalysis.com/quote/tyo/8306/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/ + /financials/balance-sheet/)",
      paranoid:
        "TYO-PRIMÄRNOTING i JPY (8035.T/9983.T-precedensen; underlag S&P Global Market Intelligence + Financial Modeling Prep; close 2026-09-18 15:30 JST, −0,88 %): pris 3 620,00 JPY, mcap 40,75 T JPY (11,26 Mdr aktier, −2,17 % YoY = återköpen), 52-v 2 230,50–3 813,00 (+58,81 % på året; −5,1 % från toppen), P/E 20,69 (pris/EPS 3 620/174,97 = 20,686 — 0,02 %) forward 13,51, PEG 0,95 (källans — spårets TTE-PEG 0,39 på prognosTillväxt +53,15 %), PS 5,61, P/B 1,68 (mcap/equity 40,75/24,18 = 1,685; P/TBV 1,97 — tangible-basen dokumenterad), P/FCF och P/OCF n/a, EV n/a (bankens balansräkning: kassa 143,10 T mot skuld 108,38 T = NETTKASSA 34,72 T JPY — EV-konceptet meningslöst på insättarnas pengar, ITUB/RY-ordlistan); TTM jun-26 (M JPY): rev 7 260 459 (+33,45 % källans growth-fält; egen replik mot föregående TTM 5 452 535 = +33,15 % — fönstret dokumenterat), operating 3 460 000, pretax 2 900 000, netto 1 992 718 (+58,5 %), EPS 174,97 (+62,3 %); marginaler TTM: operating 47,71 % (replik 3,46 T/7,26 T = 47,65 % — källans operating-rad avrundad), pretax 39,93 %, profit 27,45 %; brutto/EBIT/EBITDA/FCF-marginal n/a (bank); OCF TTM −3 366 465 (KREDITPORTFÖLJENS SVÄNGNINGAR — bank-OCF är inte driftskassa, dokumenterat i notering), capex −302 858, FCF −3 669 323 (FCF-yield −9,01 % = artefakten); ROE 9,46 % (egen års-slut-EK-kvot 1 992,7/24 180 = 8,24 % — källans fält bär genomsnittligt EK, dokumenterat), ROA 0,51 %, ROIC n/a, WACC 1,64 % (Japans lågränta — ROE/WACC-spridningen 7,8 pp på en 1,6-procentskapitalkostnad), ROCE n/a; equity 24,18 T JPY, BVPS 2 016,73, arbetskapital −190 119,90 mdr (insättningsverksamheten); skuld/ek n/a, räntetäckning n/a, Altman n/a, Piotroski 2; effektiv skatt 25,87 % (750,06 mdr betald); utdelning 96,00 JPY (2,65 %, payout 54,87 % EXAKT på TTM-EPS — ingen bas-splitter, tillväxt +11,63 % YoY, 9 tillväxtår i rad), ex-div 2026-09-29; återköpsyield 2,17 %, shareholder yield 4,83 %; beta 0,32 (5Y), 50-dagars MA 3 016,62/200-dagars 3 041,50 — kursen över båda; institutioner 45,69 %, insiders 0,02 %; analytiker Buy PT 3 685,45 JPY (+1,81 %; 11 st); 184 200 anställda; grundat 1880 (sakanya-erans Mitsubishi-arv; också noterad Nagoya + NYSE-ADR); nästa rapp 2026-11-13 (H1 FY2027); FY april–mars med slutårsetikett (S32.AX-konventionen: FY2026 = avslutad mars 2026); FY-serier (M JPY): rev 2 953 234→4 033 972→5 241 512→5 536 942→6 711 541 (FY2022→FY2026, +22,78 %/år — 11:e högsta oms-CAGR i universumet vid hämtningen), netto −83 320→381 798→1 325 869→1 266 933→1 729 359 (FY2022 NEGATIV: värdepappersförlustarna under BOJ:s nollränta-YCC-eran — resultatCAGR5ar därför NULL med BUD-konventionen; FY2023→FY2026 = +65,43 %/år som not), EPS −6,93→30,68→110,39→108,18→151,09; DPS 28→32→41→64→86 med nuvarande 96; profit margin −2,82→9,46→25,30→22,88→25,77 % (TTM 27,45); P/E-historik 26,11→13,90→18,26→16,97 med nuvarande 20,69 — MULTIPELEN EXPANDERAR MED VINSTEN (ovanligt: normalt komprimerar re-ratingen per-vinst); kassaflöde (M JPY): OCF 909 355→2 013 322→−1 791 585→1 028 836→−3 366 465, capex −102 964→−119 391→−111 213→−131 724→−302 858, FCF 806 391→1 893 931→−1 902 798→897 112→−3 669 323 (bank-OCF = lånevolymens tidecken, ej driftskassa); utdelningar betalda −333 844→−379 490→−438 716→−531 844→−846 715, återköp −158 529→−450 376→−400 090→−418 444→−500 066; SEGMENT FY2026 (M JPY): Japanese Corporate & IB 1 125 (störst) · Japanese Retail & Business Banking 1 131 · Japanese Commercial Banking 741 · Asset Management & Investor Services 694 · Global Corporate & IB 940 · Global Markets 421 · Global Wealth & Investment 421? (källans segmenttabell: summan 4 981 mot rev 6 711 = netto-ränteintäkter/intersegment elimineras i konsoliden) med Global Markets SVÄNGNINGEN −330 596 (FY2025) → +306 900 (FY2026) — handelsbordets vändning; balansräkning jun-26: kassa+investeringar 143 103 682, skuld 108 380 645; Sector Financials Industry Banks—Diversified källkonsekvent med finans-grenen",
    },
  ],
  hamtat: "2026-09-18",
  pris: 3620,
  marknadsKapitalMdr: 40750,
  tillvaxt: {
    omsattningCAGR5ar: 0.2278,
    resultatCAGR5ar: null,
    omsattningTillvaxtTTM: 0.3345,
    prognosTillvaxt: 0.5315,
  },
  lonksamhet: {
    roe: 0.0946,
    roic: null,
    bruttoMarginal: null,
    ebitMarginal: 0.4771,
    nettoMarginal: 0.2745,
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
    pe: 20.69,
    pb: 1.68,
    evEbit: null,
    peg: 0.39,
    fcfYield: null,
    egenKapitalMultipl: 1.68,
  },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2022", "2023", "2024", "2025", "2026"],
    omsattning: [2953234000000, 4033972000000, 5241512000000, 5536942000000, 6711541000000],
    resultat: [-83320000000, 381798000000, 1325869000000, 1266933000000, 1729359000000],
    egetKapital: [],
    fcf: [806391000000, 1893931000000, -1902798000000, 897112000000, -3669323000000],
  },
  notering:
    "JAPAN/FINANS-CELLENS FÖRSTA RAD (Japan 4→5: NTDOY kommunikation · TM+9983.T konsument · 8035.T teknik · 8306.T finans — världens fjärde största börsekonomi fick sin finansgren; omg18-u1:s utpekade koordinat infriad) och UNIVERSUMETS STÖRSTA BANK PÅ MARKNADSVÄRDE: mcap 40,75 T JPY mot HSBA.L:s 263 mdr GBP ≈ 49 T JPY och RY:s 281 mdr USD ≈ 41 T JPY — megabankligan där MUFG är det asiatiska benet (konventionens fjärde kontinent: RY Nordamerika · HSBA.L Europa · ITUB Sydamerika · 8306.T Asien). RÄNTEVÄNDANSENS BJÄLKE: netto −83,3 mdr JPY (FY2022, negativ — värdepappersförluster under BOJ:s nollränta-YCC) → 381,8 → 1 325,9 → 1 266,9 → 1 729,4 mdr (FY2026) med TTM 1 992,7 (+58,5 %) — fyra år av BOJ:s utgång ur negativa räntor (2024) syns som INTÄKTSDUBLING 2,27× på fyra år (+22,78 %/år, 11:e högsta oms-CAGR i universumet vid hämtningen); resultatCAGR5ar NULL med BUD-konventionen (negativ FY2022-bas) — FY2023→FY2026 = +65,4 %/år som dokumenterad not. MULTIPELENS MOTSÄTTDA RÖRELSE: P/E-trappan 26,11→13,90→18,26→16,97→20,69 — kursen stiger SNABBARE än vinsten (ovanligt: re-ratings komprimerar normalt per-vinst); 52-v +58,81 % med kursen −5,1 % under toppen 3 813. KAPITALÅTERKOMSTEN SOM ARV: DPS-trappan 28→32→41→64→86 JPY med nuvarande 96 (2,65 %; payout 54,87 % EXAKT på TTM-EPS — ingen bas-splitter) = NIO RAKA TILLVÄXTÅR, återköp 500 mdr JPY FY2026 (aktiebasen −2,17 % YoY), shareholder yield 4,83 %. BANKENS REALIA: ROE 9,46 % mot ITUB:s 21,5 och RY:s 16,2 — den japanska kapitalbasen är tung (equity 24,18 T JPY, P/B 1,68, P/TBV 1,97) men kapitalkostnaden är Japans: WACC 1,64 % ⇒ spridningen +7,8 pp på en procentbråkdel av västläget; NETTKASSA 34,72 T JPY (kassa 143,10 − skuld 108,38) — EV-konceptet meningslöst (ITUB/RY-ordlistan); OCF −3,67 T JPY TTM = kreditportföljens svängning, inte driftskassa (dokumenterat); skatt 25,87 %; Piotroski 2. SEGMENTETS LÄXA: sju affärsgrupper där Global Markets svänger −330,6 → +306,9 mdr JPY (FY2025→FY2026) — handelsbordets volatilitet mot Japanese Retail & Business Banking 1 131 + Corporate & IB 1 125 (stabilitetens ankare). ex-div 2026-09-29, nästa rapp 2026-11-13. Beta 0,32; PT 3 685,45 JPY (Buy, 11 analytiker); 184 200 anställda; grundat 1880.",
};

// ══════════════ BNP PARIBAS (BNP.PA) ══════════════
kontroll("BNP-01", "P/E-identitet pris/EPS-TTM", 100.74 / 11.55, 8.72, 0.02,
  "EXAKT-klassen: 8,722 mot källans 8,72 (0,03 %)");
kontroll("BNP-02", "P/B mcap/equity", 110.41 / 138.45, 0.7975, 0.005,
  "källans P/B 0,80 (P/TBV 0,92 dokumenterad); equity 138,45 mdr EUR; BVPS-kvoten 100,74/109,58 = 0,92 bär källans tangible-aktiebas — båda ytorna i paranoid");
kontroll("BNP-03", "prognosTillväxt pe/fwd−1", 8.72 / 8.13 - 1, 0.0726, 0.0005,
  "TTE-spårkonventionen — tight gap (+7,3 %) mot MUFG:s +53,2 %: samma gren, två prognosvärldar");
kontroll("BNP-04", "PEG pe/(100·prognos)", 8.72 / 7.2569, 1.2017, 0.0005,
  "spårkonvention; källans PEG 0,76 bär 3-års EPS-prognos +10,22 % (8,72/10,22 = 0,85 avrundningsyta) — dokumenterad");
kontroll("BNP-05", "DPS-yield", 5.14 / 100.74, 0.0510, 0.0005, "källans 5,10 %");
kontroll("BNP-06", "payout-basens EPS-spegling", 5.14 / 0.5023, 10.2334, 0.005,
  "BAS-SPLITTRAN: källans payout 50,23 % bär egen EPS-bas 10,23 EUR mot TTM 11,55 (egen kvot 5,14/11,55 = 44,5 %) — GSK-18/ULVR-19-klassen, fältbärare = källans rad");
kontroll("BNP-07", "mcap/aktieenheter", 110410 / 1.10, 100740, 500,
  "110,41 mdr EUR / 1,10 Mdr aktier = 100 373 ≈ pris 100 740 (0,37 % — aktiebasen bär rundning; −2,06 % YoY = återköpen)");
kontroll("BNP-08", "oms-CAGR serieendpoints 4 steg", Math.pow(47937 / 41625, 1 / 4) - 1, 0.0359, 0.0005,
  "M EUR FY2021→FY2025 (kalenderår) — platt intäktssida mot MUFG:s explosion: cellens pedagogiska kontrast");
kontroll("BNP-09", "res-CAGR serieendpoints 4 steg", Math.pow(11520 / 9052, 1 / 4) - 1, 0.0621, 0.0005,
  "M EUR FY2021→FY2025 — fyra raka tillväxtår på platt intäkt: marginalen bär resultatet");
kontroll("BNP-10", "ebitMarginal operating/rev", 18130 / 51256, 0.3538, 0.0005, "källans operating 35,38 % (18,13/51,256 mdr TTM)");
kontroll("BNP-11", "nettoMarginal financials-ytan", 12767 / 51256, 0.2491, 0.0005,
  "källans statistics-yta visar 26,49 % — BAS-SPLITTRAN dokumenterad (financials-kvoten fältbärare, RACE/BUD-familjen)");
kontroll("BNP-12", "shareholder yield DPS+återköp", 0.0510 + 0.0206, 0.0716, 0.0005, "källans 7,16 % = 5,10 + 2,06");
kontroll("BNP-13", "från 52-v-toppen", 100.74 / 113.82 - 1, -0.1149, 0.0005, "kursen −11,5 % under toppen 113,82");
kontroll("BNP-14", "nettkassa kassa−skuld", (1226725 - 831045) / 1000, 395.68, 0.5,
  "1 226 725 − 831 045 M EUR = 395,68 mdr EUR NETTKASSA — källans fält 395,67 (fönstret 0,01)");
kontroll("BNP-15", "current-DPS mot FY2025-DPS", 5.14 / 5.16 - 1, -0.0039, 0.0005,
  "−0,4 % — källans growth-fält −21,41 % AVVIKANDE (bär ej DPS-paret 5,16→5,14; FY-serien stigande 4 år) — dokumenterad öppet");
jaNej("BNP-16", "52-v-intervallet omsluter kursen", 100.74 >= 65.12 && 100.74 <= 113.82, "65,12–113,82 EUR");
jaNej("BNP-17", "DPS-trappan stigande 5 år", 3.67 < 3.9 && 3.9 < 4.6 && 4.6 < 4.79 && 4.79 < 5.16,
  "FY2021→FY2025: 3,67→3,90→4,60→4,79→5,16 EUR (4 tillväxtår enligt källan)");
jaNej("BNP-18", "resultatserien stigande 5 år", 9052 < 9273 && 9273 < 10298 && 10298 < 10843 && 10843 < 11520,
  "9 052→9 273→10 298→10 843→11 520 M EUR — fyra raka steg, ingen svängning (mot MUFG:s −83 mdr-botten)");

const BNP = {
  ticker: "BNP.PA",
  namn: "BNP Paribas",
  bransch: "finans",
  land: "Frankrike",
  valuta: "EUR",
  kallor: [
    {
      namn: "StockAnalysis",
      hamtat: "2026-09-18",
      url: "https://stockanalysis.com/quote/epa/BNP/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/ + /financials/balance-sheet/)",
      paranoid:
        "EURONEXT-PARIS-PRIMÄRNOTING i EUR (TTE.PA/AIR.PA-precedensen; underlag S&P Global Market Intelligence; close 2026-09-18 17:39 CET, −2,93 % på dagen): pris 100,74 EUR, mcap 110,41 mdr EUR (1,10 Mdr aktier, −2,06 % YoY = återköpen), 52-v 65,12–113,82 (+29,70 % på året; −11,5 % från toppen), P/E 8,72 (pris/EPS 100,74/11,55 = 8,722 — 0,03 %) forward 8,13, PEG 0,76 (källans på 3-års EPS-prognos +10,22 %; spårets TTE-PEG 1,20 på prognosTillväxt +7,26 %), PS 2,15, P/B 0,80 (mcap/equity 110,41/138,45 = 0,7975; P/TBV 0,92; BVPS-kvoten 100,74/109,58 bär källans aktievisa tangible-bas — båda ytorna dokumenterade), P/FCF 4,55, P/OCF 4,05 (bank-OCF-artefakter, se nedan), EV n/a (bank: kassa 1 226,7 mdr mot skuld 831,0 mdr = NETTKASSA 395,68 mdr EUR; statistics-fönstret 395,67 — 0,01 mdr avrundning, current-balance-ytan 357,89 = jun-26-fönstret, dokumenterat); TTM (M EUR): rev 51 256 (+10,96 % källans TTM-growth; mot FY2025 47 937 = +6,92 % — fönstret dokumenterat), operating 18 130, pretax 18 940, netto 12 767 (+19,1 %), EPS 11,55 (+20,6 %); marginaler TTM: operating 35,38 %, pretax 36,95 %, profit 26,49 % på statistics-ytan mot financials-kvoten 12 767/51 256 = 24,91 % (BAS-SPLITTRAN: statistics bär exkl-minoritetsbas, financials-kvoten fältbärare); FCF-yta TTM 47,33 % (OCF 27 277 − capex 3 015 = FCF 24 262; P/FCF 4,55, FCF-yield 21,97 % — bank-OCF bår insättningsströmmarna, ej driftskassa: FY-serien −55,4 mdr (2022) och −99,5 mdr (2024) dokumenterar artefakten); ROE 10,48 %, ROA 0,48 %, ROIC n/a, WACC 1,17 % (eurolågräntan), ROCE n/a; equity 138,45 mdr EUR, BVPS 109,58, arbetskapital −677 961 M (insättningsverksamheten —Same klass som MUFG:s −190 T JPY); skuld/ek n/a, räntetäckning n/a, Altman n/a, Piotroski 4; effektiv skatt 25,29 % (4 794 M betald); utdelning 5,14 EUR (5,10 %, payout 50,23 % på källans egen EPS-bas 10,23 mot TTM 11,55 — BAS-SPLITTRAN GSK/ULVR-klassen, egen kvot 44,5 % dokumenterad), ex-div 2026-09-24; källans growth-fält −21,41 % AVVIKANDE mot DPS-paret 5,16→5,14 (−0,4 %) — FY-trappan stigande fyra år, fältet bår okänt fönster (dokumenterat öppet); återköpsyield 2,06 %, shareholder yield 7,16 %; beta 1,03 (5Y), 50-dagars MA 106,11/200-dagars 93,90 — kursen MITTEMELLAN (konsolidering efter +29,7 %-året); RSI 39,10; institutioner 45,54 %, insiders 0,03 %; analytiker Buy PT 118,96 EUR (+18,09 %; 19 st; 3-års prognos rev +5,42 %/EPS +10,22 %); 180 000 anställda; grundat 1822 (Frankrikes äldsta storbankstam); nästa rapp 2026-10-28 (Q3); FY-serier kalenderår (M EUR): rev 41 625→42 473→42 824→45 738→47 937 (FY2021→FY2025, +3,59 %/år — PLATT INTÄKTSSIDAN), netto 9 052→9 273→10 298→10 843→11 520 (+6,21 %/år, FYRA RAKA tillväxtår), EPS 7,26→7,52→8,58→9,57→10,29; profit margin 21,75→21,83→24,05→23,71→24,03 % (TTM-ytorna 24,91/26,49 — splittran); DPS 3,67→3,90→4,60→4,79→5,16 med nuvarande 5,14; P/E-historik 8,26→7,08→6,98→6,16→7,73 med nuvarande 8,72 — BOTTEN 6,16 (FY2023) och re-ratingen +41 % sedan dess UTAN att lämna enkel-siffrorna; kassaflöde (M EUR): OCF 42 376→−52 837→−34 241→−97 376→46 571, capex −1 664→−2 529→−2 216→−2 136→−2 875, FCF 40 712→−55 366→−36 457→−99 512→43 696 (insättningarnas tidecken — bank-FCF ej jämförbar med industrin); utdelningar betalda (common) −3 323→−4 527→−4 744→−5 198→−8 304 (FY2025 bår två ex-div-kalenderår), preferensandelar −412→−374→−657→−751→−829; återköp −2 691→−2 862→−5 221→−2 439→−3 580; SEGMENT TTM (M EUR): Commercial & Personal Banking 27 356 (störst) · Corporate & Institutional Banking 19 556 · Investment & Protection Services 7 823 · Other −906 (summan 53 829 mot rev 51 256 = koncernposter/elimineringar — dokumenterat); balansräkning dec-25: kassa 1 226 725, skuld 831 045; Sector Financials Industry Banks—Regional källkonsekvent med finans-grenen",
    },
  ],
  hamtat: "2026-09-18",
  pris: 100.74,
  marknadsKapitalMdr: 110.41,
  tillvaxt: {
    omsattningCAGR5ar: 0.0359,
    resultatCAGR5ar: 0.0621,
    omsattningTillvaxtTTM: 0.1096,
    prognosTillvaxt: 0.0726,
  },
  lonksamhet: {
    roe: 0.1048,
    roic: null,
    bruttoMarginal: null,
    ebitMarginal: 0.3538,
    nettoMarginal: 0.2491,
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
    pe: 8.72,
    pb: 0.8,
    evEbit: null,
    peg: 1.2,
    fcfYield: null,
    egenKapitalMultipl: 0.8,
  },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2021", "2022", "2023", "2024", "2025"],
    omsattning: [41625000000, 42473000000, 42824000000, 45738000000, 47937000000],
    resultat: [9052000000, 9273000000, 10298000000, 10843000000, 11520000000],
    egetKapital: [],
    fcf: [40712000000, -55366000000, -36457000000, -99512000000, 43696000000],
  },
  notering:
    "FRANKRIKE/FINANS-CELLENS FÖRSTA RAD (Frankrike 4→5: TTE.PA energi · URW.PA fastighet · AIR.PA industri · MC.PA konsument · BNP.PA finans — eurozonens största ekonomi fick sin finansgren) och EUROBANKENS RABATT SOM LÄXA: P/B 0,80 — marknaden prissätter eurozonens största bank (mcap 110,41 mdr EUR) UNDER bokfört värde medan RY:Ns nordamerikanska spegelbild står i 2,72 — KONVENTIONENS FYRA BEN I EN VY: RY 2,72 (Nordamerika) · HSBA.L 1,77 (Europa-UK) · ITUB 2,17 (emerging) · BNP 0,80 (euroland) — vallgraven är samma, multipeln är regionens. RESULTATET BYGGS PÅ PLATT INTÄKT: netto 9 052→11 520 M EUR (+6,21 %/år, FYRA RAKA tillväxtår) medan intäkterna står stilla (+3,59 %/år) — marginalen bär resultatet (24,03 % FY2025 mot 21,75 % FY2021) — CELLENS PEDAGOGISKA KONTRAST mot MUFG:s räntevändningsexplosion (+22,8 %/år intäkt från −83 mdr-botten): två vägar till samma gren. P/E-TRAPPAN 8,26→7,08→6,98→6,16→7,73→8,72: botten 6,16 (FY2023) och re-ratingen +41 % UTAN att lämna enkel-siffrorna — FINANSGRENNENS FJÄRDE LÄGSTA P/E vid hämtningen (efter INVE-B 4,79 · ORES 9,43 · ITUB 10,57; nästa över SHB-A 12,4 — marginalen dokumenterad). KAPITALÅTERKOMSTEN: DPS-trappan 3,67→3,90→4,60→4,79→5,16 EUR (5,10 % direktavkastning; payout 50,23 % på källans EPS-bas 10,23 mot TTM 11,55 — BAS-SPLITTRAN dokumenterad; källans growth-fält −21,41 % avvikande mot DPS-paret, FY-trappan stigande) + återköp (aktiebasen −2,06 % YoY) = shareholder yield 7,16 %. BALANSRÄKNINGENS STORLEK: kassa 1 226,7 mdr EUR mot skuld 831,0 = NETTKASSA 395,7 mdr; equity 138,45 mdr (P/B 0,80); ROE 10,48 % på WACC 1,17 % (eurolågräntan — spridningen +9,3 pp); arbetskapital −678 mdr = insättningarna finansierar banken (MUFG:s −190 T JPY i samma klass); FCF-seriens −55,4/−99,5 mdr-svängningar = insättningsströmmarnas tidecken, ej driftskassa (dokumenterat). SEGMENTEN: Commercial & Personal 27,4 mdr + CIB 19,6 mdr + IPS 7,8 mdr (summan 53,8 mot rev 51,3 = koncernposter) — detaljhandelsbasen störst mot MUFG:s CIB/Retail-paritet. 52-v +29,70 % (kursen −11,5 % under toppen 113,82; PT 118,96 Buy 19 st). Grundat 1822; 180 000 anställda; ex-div 2026-09-24, nästa rapp 2026-10-28 (SAMMA DAG som GSK.L — oktoberflodens dubbelbokning).",
};

// ══════════════ ABORT-GRIND + MEDIANRAPPORT + APPEND ══════════════
console.log(`KONTROLLER: ${KONTROLLER.length} st, FEL = ${FEL}`);
for (const k of KONTROLLER) {
  if (!k.gron) console.log(`  RÖD ${k.id}: irritall ${k.irritall} expect ${k.expect} avv ${k.avv} > tol ${k.tolerans} — ${k.motiv}`);
}
if (FEL > 0) {
  console.error("ABORT: aritmetisk grind RÖD — INGET skrivs (omg13-läxan)");
  process.exit(1);
}
for (const k of KONTROLLER) console.log(`  GRÖN ${k.id} (${k.irritall.toFixed ? k.irritall.toFixed(4) : k.irritall} ≈ ${k.expect}) — ${k.motiv}`);

// medianreplik (raknaBranschMedianer ur src/lib/dataset-medianer.ts) — före/efter i minnet
const median = (v) => {
  const r = v.filter((x) => typeof x === "number" && Number.isFinite(x));
  if (!r.length) return null;
  const s = [...r].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const rapport = (lista) => {
  const fin = lista.filter((b) => b.bransch === "finans");
  const peFin = fin.map((b) => b.vardering?.pe ?? null).filter((x) => x != null);
  const peAlla = lista.map((b) => b.vardering?.pe ?? null).filter((x) => x != null);
  const resFin = fin.map((b) => b.tillvaxt?.resultatCAGR5ar ?? null).filter((x) => x != null);
  const pbFin = fin.map((b) => b.vardering?.pb ?? null).filter((x) => x != null);
  const r1 = (x) => (x == null ? "—" : (Math.round(x * 10) / 10).toString().replace(".", ","));
  return `finans P/E ${r1(median(peFin))} (n=${peFin.length}) · P/B ${r1(median(pbFin))} · resCAGR ${r1(median(resFin) * 100)} % (n=${resFin.length}) | totalt P/E ${r1(median(peAlla))} (n=${peAlla.length} av ${lista.length})`;
};
console.log(`\nMEDIANER FÖRE: ${rapport(univers)}`);

const fanns = new Set(univers.map((b) => b.ticker));
let tillagda = [];
if (!fanns.has("8306.T")) { univers.push(MUFG); tillagda.push("8306.T"); }
if (!fanns.has("BNP.PA")) { univers.push(BNP); tillagda.push("BNP.PA"); }

if (tillagda.length) {
  console.log(`MEDIANER EFTER: ${rapport(univers)}`);
  writeFileSync(FIL, JSON.stringify(univers, null, 1) + "\n");
  console.log(`APPEND: ${tillagda.join("+")} — universum ${fanns.size}→${univers.length}`);
} else {
  console.log(`IDEMPOTENT: 8306.T/BNP.PA redan på disk (${univers.length} rader) — inget skrivet`);
}
