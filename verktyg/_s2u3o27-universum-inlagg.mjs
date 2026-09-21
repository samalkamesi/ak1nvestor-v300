#!/usr/bin/env node
/**
 * s2-u3 omg27 (manifest auto-s2-1790017500456) — universum-inlägg:
 * Frankrike/teknik 2→5 med STMPA.PA + SOP.PA + SWP.PA (klaim på disk
 * FÖRE byggstart). Append på diskens FAKTISKA läge (race 17: u1:s 4502.T
 * Takeda landade under fönstret 249→250; u2:s SRT3.DE+HFG.DE kan landa
 * under fönstret — append är oberoende av totalantalet, vakterna gäller
 * cellen och tickrarna), indent 2, round-trip-bevis, gamla rader
 * innehållsidentiska (omg22-formatläxan).
 * Konventioner: EUR-notering EPA (CAP.PA/DSY.PA-precedensen); STMPA bär
 * FY-USD-serier (UBSG-precedensen: EUR-noterad, USD-rapporterande).
 * Alla tre med MÄTT trailing-P/E — mattan 5 nås ⇒ landsidan
 * /dataset/teknik/frankrike föds data-drivet (kontraktstest 188→189).
 */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/portfolj-system/bolagsunivers.json";
const MINA = ["STMPA.PA", "SOP.PA", "SWP.PA"];

const poster = [
  {
    ticker: "STMPA.PA",
    namn: "STMicroelectronics N.V.",
    bransch: "teknik",
    land: "Frankrike",
    valuta: "EUR",
    kallor: [
      {
        namn: "StockAnalysis",
        hamtat: "2026-09-21",
        url: "https://stockanalysis.com/quote/epa/STMPA/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/)",
        paranoid:
          "EPA-PRIMÄRNOTING i EUR med börsnotationen STMPA (Yahoo-notationen STMPA.PA; STM.PA = 404 i Yahoo chart-API — notationen dokumenterad; underlag S&P Global Market Intelligence; close 2026-09-21 17:35 CET-fönstret): pris 44,65 EUR (+2,94 % dagen), mcap 38,77 mdr (aktier 892,10 M × 44,65 = 39,83 — källans fält bär TTM-aktiebasen 892,55 M-klassen; BAS-SPRIDNING 2,7 % dokumenterad, CAP.PA-precedensen), 52-v 18,20–70,85 EUR (−37 % från toppen, +145 % från botten — ex-dividend DAGEN 2026-09-21), P/E 98,78 (replikband: mcap/netto-TTM 38 770/408,59 EUR-omräknat ✓ · EPS-visad 0,44 EUR ⇒ 101,2 — band dokumenterat) = HALVLEDARCYKELNS BOTTEN-P/E, fwd P/E 24,83 ⇒ prognosTillväxt +297,8 % implicit EPS +1 år (EPS-tillväxtprognos 3-årig +92,86 %/år enligt källan ⇒ PEG-källa 98,78/92,86 = 1,06; spårets 0,33 på TTE-basen — BAS-TVÅLAVAN dokumenterad, LLOY/NWG-precedenserna), P/B 2,45 (replik mcap/EK-total 38,77/15,83 = 2,449 ✓ EXAKT), P/S 3,38, EV 37,54 mdr, EV/EBIT 48,77, EV/EBITDA 14,99, EV/Sales 3,27, P/FCF 143,09, marginaler TTM: brutto 34,48 % · EBIT 6,70 % · netto 3,56 % · FCF 2,38 %, ROE 2,69 % ROIC 3,48 % mot WACC 11,54 % = −8,06 pp (cykelbotten: avkastning under kapitalkostnad — konstaterande), skatt 35,29 %, Altman 3,75, beta 1,51, institutioner 45,63 %, kassa 5,29 mdr EUR mot skuld 3,71 mdr ⇒ källans NETTOKASSA +1,58 mdr (1,77/aktie) — MEN BS-USD-tabellen TTM: kassa 3 096 mot skuld 4 232 = NETTOSKULD 1 136 M USD (källans statistics-fält inkluderar finansiella placeringar; TVÅ BASER dokumenterade), D/E 0,23, räntetäckning 16,26, aktiebas 906,52→892,55 M FY2021→TTM = −1,54 % (svag återköpskanal: 390–534 M USD/år), utdelning 0,31 EUR (0,69 %; payout 70,21 % PÅ DET LILLA BOTTENNETTOT), analytiker Buy 20 st PT 67,50 (+51,18 %), 49 000 anställda, nästa rapp 2026-10-29 (Q3); FY KALENDER men RAPPORTVALUTA USD (EUR-noterad, USD-redovisande — UBSG-precedensen; FY-USD-serier nedan): rev 12 761→16 128→17 286→13 269→11 800 M USD FY2021→25 (topp FY2023, −23,2 % FY2024, −11,1 % FY2025; TTM 13 099 +10,5 % VÄNDER), brutto 5 326→7 635→8 287→5 220→3 999 (marginal V-form 41,7→48,0→39,3→33,9 % — moat-kurvan speglar cykeln), EBIT 2 428→4 429→4 593→1 655→496, netto 2 000→3 960→4 211→1 557→166 M USD (−92 % från topp till botten; TTM 466 +181 % mot FY2025) — resCAGR endpoint −46,3 %/år ÄRLIGT BOKFÖRT (cykelfallet, inte driftsproblem), EK 9 273→18 225 (BVPS 10,16→20,06 USD), FCF 1 220→1 653→1 553→−123→+41 (TTM 309; FY2024 NEGATIVT = capex-toppen 4 439 möter OCF-fallet — kapitalcykelns anatomi), utdelningar 205→321 M USD stigande samtliga år, återköp 534→390→400→403→390; branschfält Technology/Semiconductors — europas största halvledarbolag (SGS-Thomson 1987)",
      },
      {
        namn: "Yahoo Finance chart-API (paranoid)",
        hamtat: "2026-09-21",
        url: "https://query1.finance.yahoo.com/v8/finance/chart/STMPA.PA?range=5d&interval=1d",
        paranoid:
          "close 2026-09-21 = 44,65 EUR via WebFetch-kanalen (notation STMPA.PA; STM.PA svarar 404 — Yahoo bär börsnotationen); IDENTISK med SA:s kurs 44,65 — band 0,00 %; dagsfasta: 41,785 (tis 15/9) · 42,605 (ons 16/9) · 42,440 (tors 17/9) · 43,455 (fre 18/9) · 44,650 (mån 21/9, +2,94 %); adjclose avviker de fyra första (utdelningen 0,08 USD-klassen ex-div 21/9)",
      },
    ],
    hamtat: "2026-09-21",
    pris: 44.65,
    marknadsKapitalMdr: 38.77,
    tillvaxt: {
      omsattningCAGR5ar: -0.0194,
      resultatCAGR5ar: -0.4633,
      omsattningTillvaxtTTM: 0.1049,
      prognosTillvaxt: 2.978,
    },
    lonksamhet: {
      roe: 0.0269,
      roic: 0.0348,
      bruttoMarginal: 0.3448,
      ebitMarginal: 0.067,
      nettoMarginal: 0.0356,
      fcfMarginal: 0.0238,
    },
    stabilitet: {
      skuldEgenkapital: 0.23,
      rantaTackning: 16.26,
      fcfPositivaSenaste5: 4,
      kassaManaderBurnRate: null,
      nyemissionerSenaste5ar: null,
    },
    aterkop: {
      senasteArMdr: 0.711,
      andelUtestande: 0.0069,
      insiderkopSenaste6man: null,
    },
    moat: {
      bruttoMarginalMedel5ar: 0.4205,
      bruttoMarginalSpread5ar: 0.1405,
      roeMedel5ar: null,
    },
    vardering: {
      pe: 98.78,
      pb: 2.45,
      evEbit: 48.77,
      peg: 0.33,
      fcfYield: 0.007,
      egenKapitalMultipl: 2.45,
    },
    golv: { typ: "osatt", vardePerAktie: null, marginal: null },
    serier: {
      ar: ["2021", "2022", "2023", "2024", "2025"],
      omsattning: [12761000000, 16128000000, 17286000000, 13269000000, 11800000000],
      resultat: [2000000000, 3960000000, 4211000000, 1557000000, 166000000],
      egetKapital: [9273000000, 12758000000, 16852000000, 17679000000, 18225000000],
      fcf: [1220000000, 1653000000, 1553000000, -123000000, 41000000],
    },
    notering:
      "FRANKRIKE/TEKNIK 2→5:3 (cell-treja efter DSY.PA+CAP.PA; frankrike-modulen finns sedan omg21 — med fem mätta P/E FÖDS LANDSIDAN /dataset/teknik/frankrike data-drivet, kontraktstestet bär beviset). SIGNATURTAL — HALVLEDARCYKELNS ANATOMI I EN RAD: (1) netto 2 000→3 960→4 211→1 557→166 M USD = −92 % TOPP-TILL-BOTTEN med P/E 98,78 — cykelns botten prissätter bottnettops-EPS; fwd 24,83 ⇒ prognosgap +297,8 % (TTM 466 vänder +181 % mot FY2025); (2) bruttomarginalens V-form 41,7→48,0→33,9 % = moat-kurvan som cykelspegel (mot DSY:s stabila 84-klass: samma cell, två olika ekonomier); (3) FCF 1 220→−123→+41 = capex-toppen 4 439 möter OCF-fallet FY2024 — kapitalcykelns pedagogik (4 av 5 positiva år); (4) FY-USD-serier vid EUR-notering (UBSG-precedensen) med tvåbalans-dokumentationen: källans nettokassa +1,58 mdr EUR mot BS-USD-tabellens nettoskuld 1 136 M USD (placeringar med/exkluderade); (5) aktiebas −1,54 % på 4,5 år med återköp 390–534 M USD/år + stigande utdelning 205→321 payout 70,21 % på bottennettot. ROIC 3,48 % under WACC 11,54 % = −8,06 pp: cykelbottens avkastningsgap, konstaterande utan råd. FIFO: Q3-rapp 2026-10-29.",
  },
  {
    ticker: "SOP.PA",
    namn: "Sopra Steria Group SA",
    bransch: "teknik",
    land: "Frankrike",
    valuta: "EUR",
    kallor: [
      {
        namn: "StockAnalysis",
        hamtat: "2026-09-21",
        url: "https://stockanalysis.com/quote/epa/SOP/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/)",
        paranoid:
          "EPA-PRIMÄRNOTING i EUR (CAP.PA-precedensen; underlag S&P Global Market Intelligence, sidor uppdaterade 2026-07-31; close 2026-09-21): pris 159,70 EUR (+1,01 % dagen), mcap 3,03 mdr (aktier 19,14 M × 159,70 = 3,06 — BAS-SPRIDNING 1,0 % dokumenterad, TTM-aktiebasen), 52-v 109,40–202,20 EUR (−20,9 % från toppen), P/E 10,17 (replikband: EPS 15,55 ⇒ 10,27 · mcap/netto 3 030/301,1 = 10,06 — fältet inom bandet), fwd P/E 8,28 ⇒ prognosTillväxt +22,83 % implicit EPS +1 år, PEG spårets 0,45 (10,17/22,83) mot källans 3-årsbas EPS +7,64 %/år ⇒ 1,33 — BAS-TVÅLAVAN dokumenterad (LLOY-precedensen), P/B 1,41 (replik mcap/EK-total 3 030/2 140 = 1,416 ✓), P/S 0,53, EV 4,21 mdr = mcap + nettoskuld 1 120, EV/EBIT 8,39, EV/EBITDA 6,27, EV/Sales 0,73, P/FCF 6,19, marginaler TTM: brutto 14,93 % (KONSULTPROFILEN — mot DSY:s 84: samma cell, arketyps-gapet 69 pp) · EBIT 8,71 % · netto 5,22 % · FCF 8,49 %, ROE 14,58 % ROIC 11,42 % mot WACC 7,15 % = +4,27 pp, skatt 25,77 % (fransk standard — mot DSY:s 17,63 innovatörsrabatt: LANDSKONTRASTEN i ett tal, CAP:s 29,54 som referens), kassa 270,4 M € mot skuld 1 393 M € = NETTOSKULD 1 120 M € (−58,65/aktie), D/E 0,65, räntetäckning 11,72, Piotroski 6, BVPS 108,55, rev/anställd 110 982 €, 51 929 anställda, institutioner 34,04 % insiders 1,92 %, beta 0,93, aktiebas 20,21→19,14 M FY2021→TTM = −5,30 % på 4,5 år (ÅTERKÖPSMASKINEN: 16,2→132,4→63,7 M €/år + TTM 56,3) med aktiebas-YoY −2,82 %, utdelning 5,30 EUR (3,32 %; DPS-trappa dokumenterad, div-tillväxt +13,98 % YoY), payout 34,11 %, analytiker Buy 9 st PT 219,00 (+37,13 %), nästa rapp 2027-02-25 (årsrapport); FY KALENDER: rev 4 683→5 101→5 469→5 777→5 648 M € FY2021→25 (omsCAGR +4,8 %/år; FY2025-dippen −2,2 % mot FY2024-topp; TTM 5 763 +2,0 % vänder), brutto 654→844,1 M € (marginalerna 13,96→15,46→14,94 % — korridoren 1,77 pp: konsultens stabila band), EBIT 331,8→506,8→484,6 (FY2024-topp), netto 187,7→247,8→183,7→251→296,8 M € (FY2023-dippen 183,7 med TTM 301,1 — resCAGR +12,1 %/år endpointen), EK 1 696→2 148 M €, FCF 408,7→409,4→522→581,6→490,5 M € (5/5 positiva, TTM 489,3 — 400–580-korridoren; capex 54,6→64,1 M € = 11 % av OCF 553,4), utdelningar betalda 40,7→90,2 M € (TTM 102,7 — mer än fördubblade), återköp 16,2→132,4→63,7 M €; branschfält Technology/Information Technology Services — europeisk IT-konsult (Sopra 1968 + Steria 1969, fusion 2014)",
      },
      {
        namn: "Yahoo Finance chart-API (paranoid)",
        hamtat: "2026-09-21",
        url: "https://query1.finance.yahoo.com/v8/finance/chart/SOP.PA?range=5d&interval=1d",
        paranoid:
          "close 2026-09-21 = 159,70 EUR via WebFetch-kanalen; IDENTISK med SA:s kurs 159,70 — band 0,00 %; dagsfasta: 165,60 (tis 15/9) · 163,30 (ons 16/9) · 161,20 (tors 17/9) · 158,10 (fre 18/9) · 159,70 (mån 21/9, +1,01 %)",
      },
    ],
    hamtat: "2026-09-21",
    pris: 159.7,
    marknadsKapitalMdr: 3.03,
    tillvaxt: {
      omsattningCAGR5ar: 0.048,
      resultatCAGR5ar: 0.1214,
      omsattningTillvaxtTTM: 0.0204,
      prognosTillvaxt: 0.2283,
    },
    lonksamhet: {
      roe: 0.1458,
      roic: 0.1142,
      bruttoMarginal: 0.1493,
      ebitMarginal: 0.0871,
      nettoMarginal: 0.0522,
      fcfMarginal: 0.0849,
    },
    stabilitet: {
      skuldEgenkapital: 0.65,
      rantaTackning: 11.72,
      fcfPositivaSenaste5: 5,
      kassaManaderBurnRate: null,
      nyemissionerSenaste5ar: null,
    },
    aterkop: {
      senasteArMdr: 0.154,
      andelUtestande: 0.0332,
      insiderkopSenaste6man: null,
    },
    moat: {
      bruttoMarginalMedel5ar: 0.145,
      bruttoMarginalSpread5ar: 0.0177,
      roeMedel5ar: null,
    },
    vardering: {
      pe: 10.17,
      pb: 1.41,
      evEbit: 8.39,
      peg: 0.45,
      fcfYield: 0.1615,
      egenKapitalMultipl: 1.41,
    },
    golv: { typ: "osatt", vardePerAktie: null, marginal: null },
    serier: {
      ar: ["2021", "2022", "2023", "2024", "2025"],
      omsattning: [4683000000, 5101000000, 5469000000, 5777000000, 5648000000],
      resultat: [187700000, 247800000, 183700000, 251000000, 296800000],
      egetKapital: [1696000000, 1893000000, 1925000000, 1985000000, 2148000000],
      fcf: [408700000, 409400000, 522000000, 581600000, 490500000],
    },
    notering:
      "FRANKRIKE/TEKNIK 2→5:4 (cell-fyra; CAP:s mindre syskon med HALVA P/E:t). SIGNATURTAL — VÄRDEKONSULTEN MOT CYKELCHIPT: (1) P/E 10,17 mot CAP 13,25 och DSY 21,13 — samma bransch, tre prisnivåer; fwd 8,28 ⇒ prognosgap +22,83 % med PEG 0,45 (spårets) mot källans 1,33 (3-års EPS +7,64 %) — bas-tvålavan dokumenterad; (2) resCAGR +12,1 %/år endpoint 187,7→296,8 M € (FY2023-dippen 183,7 ärligt bokförd; TTM 301,1 toppar) — cellens renaste resultattrappa; (3) AKTIEBAS −5,30 % på 4,5 år (20,21→19,14 M) = återköpsmaskinen 16,2→132,4 M € + utdelningarna FÖRDOUBLADE 40,7→90,2 M € (TTM 102,7) — CAP:s spegelbild i skala 1:6; (4) FCF-korridoren 408,7–581,6 M € 5/5 positiva (konsultens rak linje — mot STMPA:s FCF-sväng −123→+41); (5) bruttomarginal 14,93 % med 5-års-spridning 1,77 pp = arketyp-gapet mot DSY:s 84-klass i ett tal; ROIC 11,42 % mot WACC 7,15 % = +4,27 pp. FIFO: årsrapp 2027-02-25.",
  },
  {
    ticker: "SWP.PA",
    namn: "Sword Group S.E.",
    bransch: "teknik",
    land: "Frankrike",
    valuta: "EUR",
    kallor: [
      {
        namn: "StockAnalysis",
        hamtat: "2026-09-21",
        url: "https://stockanalysis.com/quote/epa/SWP/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/)",
        paranoid:
          "EPA-PRIMÄRNOTING i EUR (CAP.PA-precedensen; underlag S&P Global Market Intelligence, uppdaterad 2026-08-28; close 2026-09-21): pris 29,40 EUR (+1,20 % dagen), mcap 278,13 M€ (aktier 9,46 M × 29,40 = 278,1 ✓ EXAKT), 52-v 28,35–39,70 EUR (nära botten; ex-div 2026-04-29), P/E 13,01 (replik EPS 2,26 ⇒ 13,01 ✓ EXAKT), fwd P/E 10,39 ⇒ prognosTillväxt +25,22 % implicit EPS +1 år, PEG spårets 0,52 mot källans 3-årsbas EPS +4,25 %/år ⇒ 3,06 (höga PEG = låg prognoserad tillväxt — BAS-TVÅLAVAN dokumenterad, NWG-precedensen), P/B 3,95 (replik mcap/EK 278,13/70,35 = 3,953 ✓ EXAKT — DEN HÖGA MULTIPELNS ROT: utdelningspolitiken tömmer balansen), P/S 0,75, EV 354,11 M€, EV/EBIT 10,84, EV/EBITDA 9,70, P/FCF 7,16, marginaler TTM: brutto 38,27 % (mjukvara+tjänst-hybriden — mellan DSY 84 och SOP 15: cellens MITTEN-bärare) · EBIT 8,84 % · netto 5,78 % · FCF 10,50 %, ROE 31,54 % (cellens högsta — med låg EK-bas: P/B 3,95:s spegel) ROIC 18,95 % mot WACC 6,84 % = +12,11 pp (STÖRSTA MOAT-GAPET I CELLEN), skatt 16,21 % (S.E.-strukturen — konstaterande utan spekulation), kassa 61,89 M€ mot skuld 136,06 M€ = NETTOSKULD 74,17 M€, D/E 1,93 (balansledd utdelning), räntetäckning 9,81, Altman 2,52 (goodwill 96,28 M€ = 30 % av tillgångarna trycker Z — konstaterande), Piotroski 5, BVPS 7,24, rev/anställd 145 157 €, 2 546 anställda, institutioner 13,53 % (småbolagsprofilen), beta 0,90, aktiebas 9,54→9,46 M = i princip PLATT (+0,18 % YoY — UTAN återköpsmotor: cellens kontrast mot SOP −5,3 %), utdelning 2,00 EUR = 6,80 % DIREKTAVKASTNING (CELLENS HÖGSTA; payout 88,49 %), analytiker Strong Buy 2 st PT 42,50 (+44,56 %), H1-2026 rappat 2026-09-10 (nästa: årsrapp vintern 2027); FY KALENDER: rev 214,56→272,26→288,13→323,02→357,74 M€ FY2021→25 (omsCAGR +13,6 %/år — VART ENDA ÅR STIGANDE; TTM 369,57 +3,3 % mot FY2025), brutto 105,52→143,39 M€ (marginalerna 49,2→40,1 % FALLANDE = mixskiftet mot tjänster, dokumenterat utan orsaksspekulation), EBIT 22,58→32,15 M€ (marginalkorridoren 8,8–10,5 % — stabil), netto 17,65→109,76→22,82→21,81→19,05 M€ (FY2022 = ENGÅNGSÅRET: netto 109,76 med divestment-inflöde 98,78 M€ + extra-utdelning 95,41 M€ bokfört i CF — källans tabell bär det; endpoint-resCAGR +1,9 %/år med TTM 21,37 +12,1 % mot FY2025), EK 94,33→105,41→70,35 M€ (FALLANDE sedan FY2023: retained earnings −20,37 — utdelningspolitiken + förvärvsskulden 9,28→136,06 M€ äter balansen), FCF 14,78→21,47 M€ 5/5 positiva (TTM 38,82 — nära fördubbling: capex 1,15 M€ = 3 % av OCF, ASSET-LIGHT), utdelningar betalda 45,81→95,41(engångs)→16,21→15,99→18,87 M€, återköp enbart FY2022–23 (0,17+4,86 M€); branschfält Technology/Software—Application (cyber + digital-säkerhetsprofil)",
      },
      {
        namn: "Yahoo Finance chart-API (paranoid)",
        hamtat: "2026-09-21",
        url: "https://query1.finance.yahoo.com/v8/finance/chart/SWP.PA?range=5d&interval=1d",
        paranoid:
          "close 2026-09-21 = 29,40 EUR via WebFetch-kanalen; IDENTISK med SA:s kurs 29,40 — band 0,00 %; dagsfasta: 30,05 (mån 14/9) · 29,45 (tis 15/9) · 29,10 (ons 16/9) · 29,05 (tors 17/9) · 29,40 (mån 21/9, +1,20 %); Yahoo 5d-fönstret bär 14–21/9 utan fredag 18/9-bar (källans fönsterlogik, dokumenterad)",
      },
    ],
    hamtat: "2026-09-21",
    pris: 29.4,
    marknadsKapitalMdr: 0.28,
    tillvaxt: {
      omsattningCAGR5ar: 0.1363,
      resultatCAGR5ar: 0.0193,
      omsattningTillvaxtTTM: 0.0331,
      prognosTillvaxt: 0.2522,
    },
    lonksamhet: {
      roe: 0.3154,
      roic: 0.1895,
      bruttoMarginal: 0.3827,
      ebitMarginal: 0.0884,
      nettoMarginal: 0.0578,
      fcfMarginal: 0.105,
    },
    stabilitet: {
      skuldEgenkapital: 1.93,
      rantaTackning: 9.81,
      fcfPositivaSenaste5: 5,
      kassaManaderBurnRate: null,
      nyemissionerSenaste5ar: null,
    },
    aterkop: {
      senasteArMdr: 0.019,
      andelUtestande: 0.068,
      insiderkopSenaste6man: null,
    },
    moat: {
      bruttoMarginalMedel5ar: 0.4458,
      bruttoMarginalSpread5ar: 0.091,
      roeMedel5ar: null,
    },
    vardering: {
      pe: 13.01,
      pb: 3.95,
      evEbit: 10.84,
      peg: 0.52,
      fcfYield: 0.1396,
      egenKapitalMultipl: 3.95,
    },
    golv: { typ: "osatt", vardePerAktie: null, marginal: null },
    serier: {
      ar: ["2021", "2022", "2023", "2024", "2025"],
      omsattning: [214560000, 272260000, 288130000, 323020000, 357740000],
      resultat: [17650000, 109760000, 22820000, 21810000, 19050000],
      egetKapital: [94330000, 101540000, 105410000, 97110000, 76450000],
      fcf: [14780000, 13020000, 20740000, 21750000, 21470000],
    },
    notering:
      "FRANKRIKE/TEKNIK 2→5:5 (mattan nås — cellens femte och sista bärare; landsidan /dataset/teknik/frankrike föds data-drivet, frankrike-modulen omg21). SIGNATURTAL — UTDELNINGSBÄRAREN SOM BALANSPEDAGOGIK: (1) direktavkastning 6,80 % med payout 88,49 % = CELLENS HÖGSTA (mot STMPA 0,69 · SOP 3,32 · DSY/CAP:s klass) — men ROE 31,54 % och P/B 3,95 bär SAMMA mekanism: utdelningspolitiken tömmer EK 105,41→70,35 M€ (retained −20,37) medan skulden reser 9,28→136,06 M€ (D/E 1,93); (2) ROIC 18,95 % mot WACC 6,84 % = +12,11 pp = CELLENS STÖRSTA moat-gap trots lägst EK — avkastning på verksamhetskapital slår balansstrukturen; (3) vartenda år stigande rev 214,56→357,74 M€ (+13,6 %/år) med bruttomarginal-fallet 49,2→40,1 % = mixskiftet mot tjänster dokumenterat; (4) FY2022-engångsåret (netto 109,76 med divestment 98,78 in + extra-utdelning 95,41 ut) ärligt isolerat — endpoint-resCAGR +1,9 %/år, TTM 21,37 +12,1 %; (5) FCF 5/5 positiv med capex 3 % av OCF (asset-light) men aktiebas PLATT +0,18 % — cellens enda UTAN återköpsmotor (SOP −5,3 % som kontrast). FIFO: årsrapp vintern 2027 (H1-2026 rappat 2026-09-10).",
  },
];

// ── Race-vakt + append på diskens faktiska läge ─────────────────────────────
const u = JSON.parse(readFileSync(FIL, "utf8"));
const dup = u.filter((b) => MINA.includes(b.ticker));
if (dup.length) {
  console.error(`RÖD: ${dup.map((d) => d.ticker).join(", ")} finns redan på disk — duplikatstopp`);
  process.exit(1);
}
const cell = u.filter((b) => b.land === "Frankrike" && b.bransch === "teknik");
console.log(`diskens läge FÖRE: ${u.length} poster · FR/teknik-cellen: ${cell.length} (${cell.map((b) => b.ticker).join(", ")})`);
if (cell.length !== 2) {
  console.error(`RÖD: FR/teknik-cellen är ${cell.length}, inte 2 — klaimkoordinaten ogiltig (syskonrace?)`);
  process.exit(1);
}
const peCell = cell.filter((b) => typeof b.vardering?.pe === "number");
if (peCell.length !== 2) {
  console.error(`RÖD: cellens P/E-matta är ${peCell.length}/2 mätta före mina — kontrollen kräver DSY+CAP mätta`);
  process.exit(1);
}
const gamla = JSON.stringify(u, null, 2);
const nya = [...u, ...poster];
const ut = JSON.stringify(nya, null, 2);
// innehållsidentitets-bevis: diskens poster (inkl syskonens 4502.T som landade
// under fönstret) ska vara strukturellt identiska som prefix
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
const cellEfter = efter.filter((b) => b.land === "Frankrike" && b.bransch === "teknik");
console.log(`EFTER: ${efter.length} poster (+${efter.length - u.length}) · FR/teknik-cellen: ${cellEfter.length} (${cellEfter.map((b) => b.ticker).join(", ")})`);
console.log("matta-kontroll (mätta P/E i cellen):", cellEfter.filter((b) => typeof b.vardering?.pe === "number").length, "av", cellEfter.length);
console.log("nya tickers:", efter.slice(-3).map((b) => b.ticker).join(", "));
