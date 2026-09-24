#!/usr/bin/env node
/**
 * s2-u2 omg21 (manifest auto-s2-1789856706519) — append Sanofi SAN.PA + BAE Systems BA.L
 * till bolagsunivers.json med ARITMETISK ABORT-GRIND (omg13-läxan: FEL>0 ⇒ INGET skrivs).
 * Konventioner:
 *  - SAN.PA = EURONEXT PARIS-PRIMÄR (TTE.PA/AIR.PA/BNP.PA-precedensen): /quote/epa/SAN/,
 *    pris EUR, mcap EUR mdr, kalenderår. FRANKRIKE/HÄLSO 0→1 (cellens första rad).
 *  - BA.L = LSE-PRIMÄR (HSBA.L-precedensen): /quote/lon/BA/, pris i GBX (2 025 = £20,25),
 *    mcap GBP mdr, kalenderår. STORBRITANNIEN/INDUSTRI 0→1 (cellens första rad).
 *  - Läkemedels-konvention (NOVN.SW-mönstret): full lonksamhet, vardering med evEbit/fcfYield,
 *    stabilitet bär skuld/EK + räntetäckning, moat bär brutto-serien (medel+spread).
 *  - TTE-spårets prognosTillväxt = pe/fwd − 1; PEG = pe/(100·prognos).
 *  - Superlativtestat på 213-läget FÖRE bygg (sond 2026-09-20): SAN PEG 0,13 = MELLAN Vale 0,12
 *    och Pfizer 0,14 (5:e lägsta, ingen superlativ) · SAN FCF-marginal 20,5 % = 6:e i hälsogrenen
 *    (under Genmab 21,0) · SAN FCF-yield 11,3 % utanför topp-8 · BA P/E 29,0 = mellan Sandvik 28,6
 *    och Embraer 29,4 (mittfältet) · BA EV/EBIT 19,98 under Eaton/GE/CAT/Atlas-klassen · BA beta
 *    −0,06 = universumets TREDJE dokumenterade negativa beta (DNO + Petrobras före) — noteringarna
 *    bär PLACERINGAR, inga superlativ-påståenden.
 *  - Idempotent: redan tagna tickers hoppar append-raden (syskonvakt).
 * Källa: stockanalysis.com (S&P Global Market Intelligence-underlag; SAN stämplad 2026-09-18
 * CET close, BA 2026-09-18 16:54 GMT close).
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

// ══════════════ SANOFI (SAN.PA) ══════════════
kontroll("SAN-01", "P/E-identitet pris/EPS-TTM", 74.05 / 3.26, 22.8, 0.1,
  "BAS-SPLITTRA: financials-EPS 3,26 ger 22,715 mot källans P/E-fält 22,80 (bär egen bas 3,2478) — 0,4 %-fönstret dokumenterat, fältbärare = källan");
kontroll("SAN-02", "P/B BVPS-kvoten", 74.05 / 57.77, 1.28, 0.005,
  "pris/BVPS = 1,2818 ⇒ källans 1,28; mcap/equity-ytan 88,72/69,567 = 1,2747 = den andra ytan (dokumenterad i paranoid)");
kontroll("SAN-03", "prognosTillväxt pe/fwd−1", 22.8 / 8.39 - 1, 1.7175, 0.0005,
  "TTE-spårkonventionen — EXTREMVÄRDE som artefakt: TTM-vinsten är nedtryckt av nedskrivningar (CF-addback 3 147 M EUR), fwd 8,39 bär normaliserad bas; källans PEG 1,07 på 3-årsprognos +8,01 % som not");
kontroll("SAN-04", "PEG pe/(100·prognos)", 22.8 / 171.871, 0.13, 0.005,
  "spårkonvention (0,1327); 5:e lägsta i universumet — MELLAN Vale 0,12 och Pfizer 0,14, ingen superlativ");
kontroll("SAN-05", "DPS-yield", 4.12 / 74.05, 0.0556, 0.0005, "källans 5,56 %");
kontroll("SAN-06", "payout-kvoten own bas", 4.12 / 3.26, 1.2638, 0.0005,
  "BAS-SPLITTRAN dokumenterad: egen kvot 126,4 % på financials-EPS 3,26 mot källans fält 124,38 % (bär EPS-bas 3,311) — GSK/ULVR-klassen, fältbärare = källan; UTANFÖR 100 % = TTM-artefakten (normaliserad payout 4,12/8,826-fwd = 46,7 %)");
kontroll("SAN-07", "mcap/aktieenheter", 88720 / 1.2, 74050, 200,
  "88,72 mdr EUR / 1,20 Mdr aktier = 73 933 ≈ pris 74,05 (0,16 % — aktiebasen bär mcap)");
kontroll("SAN-08", "oms-CAGR serieendpoints 4 steg", Math.pow(46716 / 39175, 1 / 4) - 1, 0.045, 0.0005,
  "M EUR FY2021→FY2025 — stadig fyra-procentsmaskin (källans 3-årsprognos +4,41 % i linje)");
kontroll("SAN-09", "res-CAGR serieendpoints 4 steg", Math.pow(7813 / 6223, 1 / 4) - 1, 0.0585, 0.0005,
  "M EUR FY2021→FY2025 — svängande netto (2022-topp 8 371, 2023-dipp 5 400): seriens volatilitet dokumenterad i notering");
kontroll("SAN-10", "ebitMarginal operating/rev", 10350 / 48919, 0.2116, 0.0005,
  "källans 21,16 % TTM — OPERATIVA RESULTATET INTAKT medan netto kollapsade (8,09 %): slaget sitter under drift");
kontroll("SAN-11", "nettoMarginal", 3958 / 48919, 0.0809, 0.0005, "källans 8,09 % TTM (FY2025: 16,72 %)");
kontroll("SAN-12", "fcfMarginal", 10039 / 48919, 0.2052, 0.0005, "källans 20,52 % — FCF TTM 10 039 M EUR VÄXTE (+5,5 %) medan netto föll 49 %: papper mot kassa");
kontroll("SAN-13", "FCF-yield", 10039 / 88720, 0.1132, 0.0005, "källans 11,32 % — utanför universumets topp-8 (DNO 36,1-ledet)");
kontroll("SAN-14", "nettskuld kassa−skuld (M EUR)", 6350 - 23576, -17226, 1,
  "6 350 − 23 576 = −17 226 M EUR = NETTSKULD 17,23 mdr (statistics-ytans −17,23 mdr = avrundning av samma tal)");
kontroll("SAN-15", "DPS-tillväxt YoY", 4.12 / 3.92 - 1, 0.051, 0.0005,
  "källans 5,10 % — ex-div 2026-05-05 betald, nästa rapp 2026-10-30 (Q3)");
kontroll("SAN-16", "från 52-v-toppen", 74.05 / 91.15 - 1, -0.1876, 0.0005, "kursen −18,8 % under toppen 91,15");
kontroll("SAN-17", "shareholder yield DPS+återköp", 0.0556 + 0.0254, 0.081, 0.0005, "källans 8,10 % = 5,56 + 2,54");
kontroll("SAN-18", "brutto-moat medel 5 år", (0.6873 + 0.7055 + 0.693 + 0.702 + 0.7234) / 5, 0.7022, 0.0005,
  "FY2021→FY2025 marginaler — patentmoatets nivå (Novartis 74,5 i samma klass, dokumenterad i notering)");
kontroll("SAN-19", "brutto-moat spread 5 år", 0.7234 - 0.6873, 0.0361, 0.0005, "3,6 pp — bredare än Novartis 2,7 pp (källans marginalserie bär spridningen)");
jaNej("SAN-20", "52-v-intervallet omsluter kursen", 74.05 >= 71.25 && 74.05 <= 91.15, "71,25–91,15 EUR");
jaNej("SAN-21", "DPS-trappan stigande 6 synliga år", 3.2 < 3.33 && 3.33 < 3.56 && 3.56 < 3.76 && 3.76 < 3.92 && 3.92 < 4.12,
  "ex-div-åren 2021→2026: 3,20→3,33→3,56→3,76→3,92→4,12 EUR — statistics-ytan 25 tillväxtår, dividend-sidan visar 6 steg");

const SANOFI = {
  ticker: "SAN.PA",
  namn: "Sanofi",
  bransch: "halso",
  land: "Frankrike",
  valuta: "EUR",
  kallor: [
    {
      namn: "StockAnalysis",
      hamtat: "2026-09-18",
      url: "https://stockanalysis.com/quote/epa/SAN/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/ + /financials/balance-sheet/ + /dividend/)",
      paranoid:
        "EURONEXT-PARIS-PRIMÄRNOTING i EUR (TTE.PA/BNP.PA-precedensen; underlag S&P Global Market Intelligence + Fiscal.ai; close 2026-09-18, −1,61 % på dagen; statistics-ytan stämplad 2026-09-19): pris 74,05 EUR, mcap 88,72 mdr EUR (1,20 Mdr aktier), 52-v 71,25–91,15 (kursen −18,8 % under toppen; under båda MA 76,19/78,01; RSI 42,37), P/E 22,80 (financials-EPS 3,26 ⇒ 22,715 — BAS-SPLITTRA 0,4 %: källans fält bär bas 3,2478) forward 8,39, PEG 1,07 källans (på 3-års EPS-prognos +8,01 %; spårets TTE-PEG 0,13 på prognosTillväxt +171,8 % — EXTREMVÄRDET ÄR ARTEFAKTEN: nedskrivningsnedtryckt TTM-bas, se nedan), PS 1,81 (88,72/48,919), P/B 1,28 (BVPS-kvot 74,05/57,77 = 1,2818; mcap/equity-ytan 88,72/69,567 = 1,2747 — båda ytorna dokumenterade), P/FCF 8,84, P/OCF 7,49, EV/EBIT 10,51, EV/EBITDA 7,83; NETTSKULD 17 226 M EUR (kassa 6 350 − skuld 23 576; statistics-ytans −17,23 mdr = avrundning); TTM jun-26 (M EUR): rev 48 919 (+6,96 % källans TTM-growth), brutto 35 932 (73,45 %), operating 10 350 (21,16 % — INTAKT och växande), netto 3 958 (8,09 % — KOLLAPSEN: EPS −55,6 % YoY), FCF 10 039 (20,52 % marginal — VÄXTE +5,5 % medan netto föll 49 %); pretax-marginal 10,62 % mot operating 21,16 % ⇒ slaget ≈ 5,2 mdr EUR sitter UNDER drift: kassaflödets 'Asset Writedown & Restructuring' 231→−42→1 062→369→2 309 M (FY2021→FY2025) + 3 147 TTM som icke-kassa-addback = nedskrivningsvågen som tryckte netot; OCF 11 838 TTM med D&A 3 462; ROE 5,71 % (TTM-deprimerad), ROA 5,09 %, ROIC 9,12 %, ROCE 10,66 %, WACC 4,99 %; EBITDA-marginal 27,68 %; equity 69 567 M EUR (varav common 69 207), BVPS 57,77, arbetskapital −408 M, totala tillgångar 129 060 M; skuld/ek 0,34, räntetäckning 17,08, Altman n/a, Piotroski 6; effektiv skatt 23,16 %; utdelning 4,12 EUR (5,56 %, payout 124,38 % på källans EPS-bas 3,311 — BAS-SPLITTRAN mot financials-EPS 3,26/egen kvot 126,4 %; normaliserad payout på fwd-EPS ≈ 47 %), tillväxt +5,10 % YoY, STATISTICS-YTAN 25 RAKA TILLVÄXTÅR (dividend-sidan visar 6 synliga steg 3,20→4,12); ex-div 2026-05-05 (betald); återköpsyield 2,54 %, shareholder yield 8,10 %; beta 0,28 (5Y); institutioner 43,90 %, insiders 0,02 %; analytiker Buy PT 94,06 EUR (+27,0 %; 25 st; 3-års prognos rev +4,41 %/EPS +8,01 %); 74 846 anställda; grundat 1994 (fusionsspiran Synthélabo-Sanofi-Hoechst-Aventis); nästa rapp 2026-10-30 (Q3); FY-serier kalenderår (M EUR): rev 39 175→40 304→41 109→44 286→46 716 (FY2021→FY2025, +4,50 %/år), brutto 26 924→28 435→28 490→31 091→33 793, operating 8 565→10 381→8 121→8 869→9 650, netto 6 223→8 371→5 400→5 560→7 813 (+5,85 %/år med svängen 2022-topp/2023-dipp), EPS 4,95→6,67→4,31→4,44→6,37; DPS 3,20→3,33→3,56→3,76→3,92 med nuvarande 4,12; profit margin 15,88→20,77→13,14→12,55→16,72 % (TTM 8,09 — nedskrivningsåret); bruttomarginal 68,73→70,55→69,30→70,20→72,34 % (moat-serien); FCF-marginal 23,09→22,32→21,02→16,59→19,24 % (TTM 20,52); kassaflöde (M EUR): OCF 10 522→10 526→10 258→9 081→10 750 (TTM 11 838), capex −1 478→−1 529→−1 619→−1 733→−1 762, FCF 9 044→8 997→8 639→7 348→8 988 (TTM 10 039 — KASSA-MASKINEN OBERÖRD); utdelningar betalda −4 008→−4 168→−4 454→−4 704→−4 772, återköp −382→−497→−593→−302→−5 030 (FY2025 = återköpsvågen 5,0 mdr; TTM −2 036); kassaförvärv −5 594→−987→−2 535→−1 901→−9 394 (TTM −10 186 — M&A-MASKINEN: fyra år av pipelin-köp); 'Other Operating Activities' TTM −1 674; FY2025 Other Investing +10 322 mot Other Operating −5 287 (källans buckets bär omplaceringen av en divestering-yta — dokumenterat som oklassificerad i källan); balansräkning jun-26: kassa 6 350, skuld 23 576, equity 69 567, tillgångar 129 060, aktuella 31 522/31 930; Sector Healthcare Industry Drug Manufacturers—General källkonsekvent med hälsogrenen",
    },
  ],
  hamtat: "2026-09-18",
  pris: 74.05,
  marknadsKapitalMdr: 88.72,
  tillvaxt: {
    omsattningCAGR5ar: 0.045,
    resultatCAGR5ar: 0.0585,
    omsattningTillvaxtTTM: 0.0696,
    prognosTillvaxt: 1.7175,
  },
  lonksamhet: {
    roe: 0.0571,
    roic: 0.0912,
    bruttoMarginal: 0.7345,
    ebitMarginal: 0.2116,
    nettoMarginal: 0.0809,
    fcfMarginal: 0.2052,
  },
  stabilitet: {
    skuldEgenkapital: 0.34,
    rantaTackning: 17.08,
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
    bruttoMarginalMedel5ar: 0.7022,
    bruttoMarginalSpread5ar: 0.0361,
    roeMedel5ar: null,
  },
  vardering: {
    pe: 22.8,
    pb: 1.28,
    evEbit: 10.51,
    peg: 0.13,
    fcfYield: 0.1132,
    egenKapitalMultipl: 1.28,
  },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2021", "2022", "2023", "2024", "2025"],
    omsattning: [39175000000, 40304000000, 41109000000, 44286000000, 46716000000],
    resultat: [6223000000, 8371000000, 5400000000, 5560000000, 7813000000],
    egetKapital: [],
    fcf: [9044000000, 8997000000, 8639000000, 7348000000, 8988000000],
  },
  notering:
    "FRANKRIKE/HÄLSO-CELLENS FÖRSTA RAD (Frankrike 6→7 rader, SJÄTTE grenen: TTE.PA energi · URW.PA fastighet · AIR.PA industri · MC.PA konsument · BNP.PA+AXA finans · SAN.PA halso — eurozonens andra ekonomi fullbordar sex grenar) och PAPPER-FÖRLUSTENS MOT KASSA-MASKINENS LÄXA: TTM-netto 3 958 M EUR (8,09 % marginal, EPS −55,6 %) medan OPERATIVA RESULTATET ÄR INTAKT (21,16 % marginal, växande serie 8 565→9 650 FY2021→FY2025) och FCF VÄXTE till 10 039 M EUR (20,52 %) — slaget ≈ 5,2 mdr EUR sitter UNDER drift: kassaflödets nedskrivnings-addback 3 147 M EUR TTM (writedown-serien 369→2 309→3 147) = P/E 22,80 ÄR ARTEFAKTEN, forward 8,39 bär normaliserade basen (prognosTillväxt +171,8 % enligt TTE-konventionen — universumets mest extrema normaliseringsgap, dokumenterat; källans PEG 1,07 på 3-års +8,01 % som not; normaliserad payout ≈ 47 % mot TTM:s 124). PATENTMOATET I SIFFROR: bruttomarginal 68,73→72,34 % (medel 70,2 %, spread 3,6 pp — bredare än Novartis 2,7 pp), ROIC 9,12 % på WACC 4,99 %. M&A-MASKINEN: kassaförvärv −5 594→−9 394 M FY2025 (TTM −10 186) finansierad av nettskuld 17,2 mdr + kassaflödet — pipelin-byggandets stallningstakning; återköpsvågen FY2025 −5 030 M (shareholder yield 8,10 %). UTDELNINGEN SOM ARV: DPS 3,20→4,12 EUR (25 raka tillväxtår enligt statistics-ytan, 6 synliga steg på dividend-sidan; 5,56 % direktavkastning) — payout 124 % på TTM-basen är nedskrivningsårets artefakt, inte utdelningsrisken. PLACERINGAR (sonderade på 213-läget): TTE-PEG 0,13 = 5:e lägsta i universumet MELLAN Vale 0,12 och Pfizer 0,14 · FCF-marginal 20,5 % = 6:e i hälsogrenen (under Novartis 29,2/AbbVie 28,3/Swedish Orphan 25,6/Roche 25,0/Genmab 21,0) · FCF-yield 11,3 % utanför topp-8 · P/E 22,8 mellan Novartis 21,3 och Roche 23,6 = Hälsa-medianens grannskap. Kursen −18,8 % under 52-v-toppen under båda MA:na; PT 94,06 EUR (Buy, 25 st). Beta 0,28; 74 846 anställda; grundat 1994; ex-div betald 2026-05-05, nästa rapp 2026-10-30.",
};

// ══════════════ BAE SYSTEMS (BA.L) ══════════════
kontroll("BA-01", "P/E-identitet pris/EPS-TTM", 20.25 / 0.7, 29.01, 0.1,
  "GBX-priset 2 025 = £20,25; financials-EPS 0,70 ger 28,93 mot källans 29,01 (bär bas 0,6979) — 0,3 %-fönstret dokumenterat, fältbärare = källan");
kontroll("BA-02", "P/B mcap/equity", 57280 / 12547, 4.57, 0.005,
  "57,28/12,547 = 4,5652 ⇒ källans 4,57; BVPS-ytan 4,13 bår filing-aktiebasen 2 996 M mot overview 2 830 M — AKTIEBAS-SPLITTRAN dokumenterad (mcap-bärande basen = overview)");
kontroll("BA-03", "prognosTillväxt pe/fwd−1", 29.01 / 22.52 - 1, 0.2882, 0.0005,
  "TTE-spårkonventionen — rearmaments-multiple med tillväxtgap (källans 3-års EPS-prognos +12,71 % som not)");
kontroll("BA-04", "PEG pe/(100·prognos)", 29.01 / 28.818, 1.01, 0.005,
  "spårkonvention (1,0067 — multipeln proportionell mot egen prognos = neutralt värderad på TTE-basen); källans PEG 1,67 på 3-årsbasen som not");
kontroll("BA-05", "DPS-yield egen kvot", 0.36 / 20.25, 0.0178, 0.0005,
  "källans yield-fält 1,79 % på egen avrundningsbas (0,36/20,25 = 1,778 %) — dokumenterad; kalender-2026-summan 0,378 ger 1,87 % (båda ytorna i paranoid)");
kontroll("BA-06", "payout-basens EPS-spegling", 0.36 / 0.5163, 0.6973, 0.005,
  "källans payout 51,63 % ⇒ EPS-bas 0,6973 mot financials 0,70 — avrundningsfönstret, ingen klass-splitter (0,5 %)");
kontroll("BA-07", "mcap/aktieenheter", 57280 / 2.83, 20250, 100,
  "57,28 mdr GBP / 2,83 Mdr aktier = 20 240 GBX ≈ pris 2 025 (0,05 % — aktiebasen bär mcap)");
kontroll("BA-08", "oms-CAGR serieendpoints 4 steg", Math.pow(28336 / 19521, 1 / 4) - 1, 0.0976, 0.0005,
  "M GBP FY2021→FY2025 — FYRA RAKA tillväxtår +8,9/+8,6/+14,0/+7,7 %: rearmaments-ordboken i intäktssidan");
kontroll("BA-09", "res-CAGR serieendpoints 4 steg", Math.pow(2062 / 1758, 1 / 4) - 1, 0.0407, 0.0005,
  "M GBP FY2021→FY2025 — resultatet halvar intäkternas takt (kostnadskrivningarna i ramp-åren), 2022-dippen 1 591 dokumenterad");
kontroll("BA-10", "ebitMarginal operating/rev", 2911 / 29380, 0.0991, 0.0005, "källans 9,91 % TTM");
kontroll("BA-11", "nettoMarginal", 2113 / 29380, 0.0719, 0.0005, "källans 7,19 % TTM (7,3 %-klassen alla fem åren)");
kontroll("BA-12", "fcfMarginal", 4698 / 29380, 0.1599, 0.0005, "källans 15,99 % — TTM-FCF 4 698 M GBP (+107,8 % YoY): förskottsballongen (AP +2 464 M) bär kassan");
kontroll("BA-13", "FCF-yield", 4698 / 57280, 0.082, 0.0005, "källans 8,20 %");
kontroll("BA-14", "EV/EBIT-replikens dokumentation", 62233 / 2911, 19.98, 1.5,
  "egen replik (mcap 57,28 + nettskuld 4,95)/EBIT = 21,4 mot källans 19,98 — källans EV-definition avviker 1,4 enheter (ev. genomsnitts-EV); FÄLTBÄRARE = källan, gapet dokumenterat öppet");
kontroll("BA-15", "nettskuld kassa−skuld (M GBP)", 4200 - 9153, -4953, 1,
  "4 200 − 9 153 = −4 953 M GBP = NETTSKULD 4,95 mdr — Ball-förvärvets skuld FY2024 (skuldutgivning 6 933 M mot förvärv −4 776 M i CF) ligger kvar i balansen");
kontroll("BA-16", "DPS-tillväxt FY-paret", 0.378 / 0.341 - 1, 0.1085, 0.0005,
  "källans growth-fält 10,85 % bår FY2025→FY2026-paret 34,1p→37,8p (headline-räntan 36,0p = ANNAN yta — BAS-SPLITTRAN dokumenterad)");
kontroll("BA-17", "från 52-v-toppen", 2025 / 2360 - 1, -0.142, 0.0005, "kursen −14,2 % under toppen 2 360");
kontroll("BA-18", "från 52-v-botten", 2025 / 1529 - 1, 0.324, 0.0005, "+32,4 % över botten 1 529 — rearmations-årets spann");
kontroll("BA-19", "shareholder yield DPS+återköp", 0.0179 + 0.0046, 0.0225, 0.0005, "källans 2,25 % = 1,79 + 0,46");
kontroll("BA-20", "brutto-moat medel 5 år", (0.12822 + 0.13049 + 0.12995 + 0.1302 + 0.13213) / 5, 0.1302, 0.0005,
  "FY2021→FY2025 marginaler — försvarprisingens tak (kostnad-plus-kontrakt)");
kontroll("BA-21", "brutto-moat spread 5 år", 0.13213 - 0.12822, 0.0039, 0.0005,
  "0,39 pp — universumets tightaste brutto-spridning i sonden (vs Novartis 2,7/Sanofi 3,6 pp): statliga kontrakt prissätter marginalen");
jaNej("BA-22", "52-v-intervallet omsluter kursen", 2025 >= 1529 && 2025 <= 2360, "1 529–2 360 GBX");
jaNej("BA-23", "DPS-trappan stigande 4 synliga år", 0.256 < 0.281 && 0.281 < 0.309 && 0.309 < 0.341 && 0.341 < 0.378,
  "kalenderåren 2022→2026: 25,6p→28,1p→30,9p→34,1p→37,8p (statistics-ytan 21 tillväxtår)");
jaNej("BA-24", "intäktstrappan fyra raka steg", 19521 < 21258 && 21258 < 23078 && 23078 < 26312 && 26312 < 28336,
  "FY2021→FY2025: 19,5→21,3→23,1→26,3→28,3 mdr GBP — ordernas årtionde");

const BAE = {
  ticker: "BA.L",
  namn: "BAE Systems plc",
  bransch: "industri",
  land: "Storbritannien",
  valuta: "GBX",
  kallor: [
    {
      namn: "StockAnalysis",
      hamtat: "2026-09-18",
      url: "https://stockanalysis.com/quote/lon/BA/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/ + /financials/balance-sheet/ + /dividend/)",
      paranoid:
        "LSE-PRIMÄRNOTING i GBX (HSBA.L-precedensen; underlag S&P Global Market Intelligence; close 2026-09-18 16:54 GMT, −0,88 % på dagen): pris 2 025 GBX (= £20,25), mcap 57,28 mdr GBP (2,83 Mdr aktier på overview-ytan — AKTIEBAS-SPLITTRAN: filing-ytan bär 2 993-2 996 M aktier och BVPS 4,13 på den basen; overview-basen bär mcap/pris-kvoten 57 280/20,25 = 2 830 M — fältbärare = overview, dokumenterat öppet), 52-v 1 529–2 360 (kursen +32,4 % över botten, −14,2 % under toppen; under MA50 2 039,15, över MA200 2 005,05; RSI 50,48), P/E 29,01 (financials-EPS 0,70 ⇒ 28,93 — BAS-SPLITTRA 0,3 %: källans bas 0,6979) forward 22,52, PEG 1,67 källans (på 3-års EPS-prognos +12,71 %; spårets TTE-PEG 1,01 på prognosTillväxt +28,8 %), PS 1,95 (57,28/29,38), P/B 4,57 (mcap/equity 57 280/12 547 = 4,5652), P/FCF 12,19, P/OCF 10,23, EV/EBIT 19,98 (egen replik (57,28+4,95)/2,911 = 21,4 — källans EV-definition avviker, FÄLTBÄRARE = källan), EV/EBITDA 14,88; NETTSKULD 4 953 M GBP (kassa 4 200 − skuld 9 153; skulden inkluderar lease 1 573+193 enligt källans additional-metrics — dokumenterat); TTM jun-26 (M GBP): rev 29 380 (+3,68 % källans TTM-growth), brutto 3 912 (13,32 %), operating 2 911 (9,91 %), netto 2 113 (7,19 %), FCF 4 698 (15,99 % — TTM-BALLONGEN: OCF 5 601 med 'Change in Account Payables' +2 464 M = kundförskotten på orderboken, inte organisk marginal); ROE 18,63 %, ROA 4,79 %, ROIC 13,69 %, ROCE 11,10 %, WACC 4,00 %; EBITDA-marginal 12,77 %; equity 12 547 M GBP (varav common 12 375), BVPS 4,13 (filing-basen), arbetskapital +284 M, totala tillgångar 39 893 M; skuld/ek 0,73, räntetäckning 5,97, Altman 2,42, Piotroski 8 (universumets toppklass); effektiv skatt 17,70 % (UK:s patent-box/rabatter); utdelning 36,0p GBP (1,79 % källans yield-fält; egen kvot 0,36/20,25 = 1,778 % — avrundningsyta; kalender-2026-betalningarna 22,8p jun + 15,0p dec = 37,8p ger 1,87 % — tre ytor dokumenterade, fältbärare = headline 36,0p), payout 51,63 % (EPS-bas 0,6973), tillväxt +10,85 % YoY (bär FY-paret 34,1→37,8p), STATISTICS-YTAN 21 RAKA TILLVÄXTÅR (dividend-sidan visar 4 synliga kalenderår +halva 2026); semi-årlig frekvens; ex-div 2026-10-22 (kommande); återköpsyield 0,46 %, shareholder yield 2,25 %; beta −0,06 (5Y — NEGATIV: universumets TREDJE dokumenterade fall efter DNO och Petrobras); institutioner 83,70 % (statligt förankrad ägarbas: UK Golden Share-dokumenterad elsestans, källan visar bara andelen), insiders 0,14 %; analytiker Buy PT 2 330,65 GBX (+15,1 %; 20 st; 3-års prognos rev +11,38 %/EPS +12,71 %); 112 400 anställda; grundat 1979 (British Aerospace-Marconi-fusionen); nästa rapp 2026-11-06; FY-serier kalenderår (M GBP): rev 19 521→21 258→23 078→26 312→28 336 (FY2021→FY2025, +9,76 %/år — FYRA RAKA: +8,9/+8,6/+14,0/+7,7 %), brutto 2 503→2 774→2 999→3 426→3 744 (marginal 12,82→13,21 % — moat-serien medel 13,02 spread 0,39 pp = försvarprisingens tak), operating 1 844→2 082→2 361→2 473→2 750, netto 1 758→1 591→1 857→1 956→2 062 (+4,07 %/år med 2022-dippen), EPS 0,55→0,51→0,60→0,64→0,68; DPS 25,6p→28,1p→30,9p→34,1p (kalender 2022→2025) med 2026:e 37,8p; profit margin 9,01→7,48→8,05→7,43→7,28 % (TTM 7,19); kassaflöde (M GBP): OCF 2 447→2 839→3 760→3 925→3 432 (TTM 5 601), capex −516→−599→−826→−990→−920, FCF 1 931→2 240→2 934→2 935→2 512 (TTM 4 698 — FY2025-dippen −14,4 % på working capital −345, TTM +107,8 % på AP +2 464); utdelningar betalda −777→−802→−857→−937→−1 027, återköp −368→−788→−561→−555→−502; FY2024 = FÖRVÄRSÅRET: kassaförvärv −4 776 + LT-skuldutgivning 6 933 (skulden 6 699→10 316 i balansen — nettskuld 2 589→6 889) mot equity-tillväxten 10 723→11 777 (goodwill); balansräkning jun-26: kassa 4 200, skuld 9 153, equity 12 547, tillgångar 39 893, aktuella 13 957/13 673; Sector Industrials Industry Aerospace & Defense källkonsekvent med industrigrenen",
    },
  ],
  hamtat: "2026-09-18",
  pris: 2025,
  marknadsKapitalMdr: 57.28,
  tillvaxt: {
    omsattningCAGR5ar: 0.0976,
    resultatCAGR5ar: 0.0407,
    omsattningTillvaxtTTM: 0.0368,
    prognosTillvaxt: 0.2882,
  },
  lonksamhet: {
    roe: 0.1863,
    roic: 0.1369,
    bruttoMarginal: 0.1332,
    ebitMarginal: 0.0991,
    nettoMarginal: 0.0719,
    fcfMarginal: 0.1599,
  },
  stabilitet: {
    skuldEgenkapital: 0.73,
    rantaTackning: 5.97,
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
    bruttoMarginalMedel5ar: 0.1302,
    bruttoMarginalSpread5ar: 0.0039,
    roeMedel5ar: null,
  },
  vardering: {
    pe: 29.01,
    pb: 4.57,
    evEbit: 19.98,
    peg: 1.01,
    fcfYield: 0.082,
    egenKapitalMultipl: 4.57,
  },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2021", "2022", "2023", "2024", "2025"],
    omsattning: [19521000000, 21258000000, 23078000000, 26312000000, 28336000000],
    resultat: [1758000000, 1591000000, 1857000000, 1956000000, 2062000000],
    egetKapital: [],
    fcf: [1931000000, 2240000000, 2934000000, 2935000000, 2512000000],
  },
  notering:
    "STORBRITANNIEN/INDUSTRI-CELLENS FÖRSTA RAD (UK 4→5 rader, femte grenen: HSBA.L finans · ARM teknik · GSK.L halso · ULVR konsument · BA.L industri — G5-ekonomins fem grenar; Shell SHEL noterad som USA/energi enligt NYSE-konventionen, UK-energicellen förblir öppen) och REARMAMENTS-MULTIPLENS LÄXA: P/E 29,0 med FYRA RAKA intäktsår +9,8 %/år (19,5→28,3 mdr GBP FY2021→FY2025, +8,9/+8,6/+14,0/+7,7 %) — marknaden betalar orderboken, inte marginalen: EBIT 9,9 %/netto 7,2 % i kostnads-plus-kontraktets fack (bruttomarginal 13,0 % med spridning 0,39 pp = universumets tightaste i sonden — statliga kunder prissätter vinsten, mot Novartis 2,7/Sanofi 3,6 pp patentmoat-spridningar). FÖRSKOTTSBALLONGEN: TTM-FCF 4 698 M GBP (+107,8 %) bärs av 'Change in Account Payables' +2 464 M — kunderna betalar orderboken i förskott (FCF-marginal 16,0 % = kassakällan, ej lönsamhetshöjning); FY2024 = FÖRVÄRSÅRET (kassaförvärv −4 776 + skuldutgivning 6 933 mot skuld 6 699→10 316: nettskuld 2 589→6 889→4 953 TTM). RESULTATETS HALVFAKTOR: netto +4,1 %/år mot intäkter +9,8 % — ramp-kostnaderna och amortiseringarna av förvärvet äter multipelunderlaget (2022-dippen 1 591 MGBP dokumenterad). KAPITALÅTERKOMSTEN: DPS 25,6p→37,8p (kalender 2022→2026; statistics-ytan 21 raka tillväxtår) med payout 51,6 % — låg direktavkastning 1,8 % men tio-procentig tillväxt = återinvesteringsmaskin; Piotroski 8 (universumets toppklass); beta −0,06 = TREDJE dokumenterade negativa betan i universumet (DNO + Petrobras före) — försvarsorder är makro-okorrelerade. PLACERINGAR (sonderade på 213-läget): P/E 29,0 mellan Sandvik 28,6 och Embraer 29,4 = industri-fältets mittplan · P/B 4,57 under Sandvik 4,8 · EV/EBIT 20,0 under Eaton/GE/CAT/Atlas-klassen · TTE-PEG 1,01 = multiple proportionell mot prognos (källans 1,67 på 3-årsbasen). Kursen −14,2 % under toppen 2 360, +32,4 % över botten; PT 2 330,65 GBX (Buy, 20 st). Skatt 17,7 % (patent-box); 112 400 anställda; grundat 1979; ex-div 2026-10-22, nästa rapp 2026-11-06.",
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
  const hal = lista.filter((b) => b.bransch === "halso");
  const ind = lista.filter((b) => b.bransch === "industri");
  const peAlla = lista.map((b) => b.vardering?.pe ?? null).filter((x) => x != null);
  const r1 = (x) => (x == null ? "—" : (Math.round(x * 10) / 10).toString().replace(".", ","));
  const peHal = hal.map((b) => b.vardering?.pe).filter((x) => typeof x === "number");
  const peInd = ind.map((b) => b.vardering?.pe).filter((x) => typeof x === "number");
  const pbInd = ind.map((b) => b.vardering?.pb).filter((x) => typeof x === "number");
  return `halso P/E ${r1(median(peHal))} (n=${peHal.length}) · industri P/E ${r1(median(peInd))} (n=${peInd.length}) P/B ${r1(median(pbInd))} | totalt P/E ${r1(median(peAlla))} (n=${peAlla.length} av ${lista.length})`;
};
console.log(`\nMEDIANER FÖRE: ${rapport(univers)}`);

const fanns = new Set(univers.map((b) => b.ticker));
let tillagda = [];
if (!fanns.has("SAN.PA")) { univers.push(SANOFI); tillagda.push("SAN.PA"); }
if (!fanns.has("BA.L")) { univers.push(BAE); tillagda.push("BA.L"); }

if (tillagda.length) {
  console.log(`MEDIANER EFTER: ${rapport(univers)}`);
  writeFileSync(FIL, JSON.stringify(univers, null, 1) + "\n");
  console.log(`APPEND: ${tillagda.join("+")} — universum ${fanns.size}→${univers.length}`);
} else {
  console.log(`IDEMPOTENT: SAN.PA/BA.L redan på disk (${univers.length} rader) — inget skrivet`);
}
