#!/usr/bin/env node
/**
 * s2-u3 omg29 (manifest auto-s2-1790237704889) — universum-inlägg:
 * INDIEN 4→7 GRENAR med BHARTIARTL.NS + SUNPHARMA.NS + LT.NS (klaim på
 * disk FÖRE byggstart, anspråksfilen). Append på diskens FAKTISKA läge
 * (race 18: syskonen u1/u2 kan landa under fönstret — append är oberoende
 * av totalantalet; vakterna gäller cellerna och tickrarna), indent 1 +
 * trailing newline (od-bevisat 2026-09-24), prefix-bit-identisk läs-tillbaka
 * (omg22-formatläxan), duplikatstopp + cellkontroll 0→1 ×3.
 * Konventioner: NSE-primär (RELIANCE/HDFCBANK-precedenserna), serier i
 * FULLA INR-tal (HDFC/HUL/Takeda-kanon), marknadsKapitalMdr i mdr INR,
 * FY = räkenskapsår slutande mars (indisk konvention, TCS/RELIANCE-spegeln).
 * Aritmetikgrinden MUST ha körts GRÖN före detta skript (ABORT-kulturen).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const FIL = "data/portfolj-system/bolagsunivers.json";
const MINA = ["BHARTIARTL.NS", "SUNPHARMA.NS", "LT.NS"];

const poster = [
  {
    ticker: "BHARTIARTL.NS",
    namn: "Bharti Airtel Limited",
    bransch: "kommunikation",
    land: "Indien",
    valuta: "INR",
    kallor: [
      {
        namn: "StockAnalysis",
        hamtat: "2026-09-24",
        url: "https://stockanalysis.com/quote/nse/BHARTIARTL/ (+ /statistics/ + /financials/ + /financials/balance-sheet/)",
        paranoid:
          "NSE-PRIMÄRNOTING i INR (RELIANCE/HDFCBANK-precedenserna; underlag S&P Global Market Intelligence; kanon 2026-09-24 med intraday-pris 13:50 IST — FY-KOLONNER = indiskt räkenskapsår slutande mars): pris 1 803,00 INR (−1,65 % dagen), mcap 11,42 T INR (aktiebasernas trippel dokumenterad: filing-shares 6 236 M TTM × 1 803 = 11 243 mdr = −1,6 % mot mcap-fältet — partly-paid-klassens konventioner; vägd EPS-bas 6 041 M = 289 147/47,86; mcap-fältets bas 6 333 M — Maersk-precedensens aktieantalsklass), 52-v 1 511–2 045,80, P/E 39,49 (replik mcap/netto 11 420 000/289 147 = 39,50 ✓ EXAKT; pris/EPS 1 803/47,86 = 37,67 — EPS-basens två konventioner dokumenterade), fwd P/E 27,46 ⇒ prognosTillväxt +43,81 % mekanisk konvention (39,49/27,46−1), PEG 0,90 spårkonvention, P/S 5,19 EXAKT replik, P/B 5,69 (replik mcap/EK-total-TTM 11 420/2 006,5 = 5,69 ✓ EXAKT — BAS-BEVISAT: statistics Equity 2,01T = Shareholders' Equity INKLUSIVE minoriteter 388,3 mdr; BVPS-fältet 259,48 = EK-common 1 618 151/6 236 ✓ EXAKT — två skilda EK-baser, båda belagda), EV 13 240 mdr (replik mcap+nettoskuld 11 420+1 430,7 = 12 850,7 — källspridning 3,0 % dokumenterad: källans EV bär spectrum-/leaseposter), EV/EBIT 18,55 (EBIT TTM 709 659 M = 32,25 % × rev), EV/EBITDA 10,59, marginaler TTM: brutto 67,86 % · EBIT 32,25 % · netto 13,14 % (289 147/2 200 493 ✓ EXAKT) · FCF 35,12 % (772 800/2 200 493 ✓ EXAKT), ROE 20,15 % (källans fält; replik netto/EK-total 14,41 % — källans ROE-bas parent/kvantitet dokumenterad som källspridning), ROIC 15,15 % mot WACC 4,61 % = +10,54 pp, D/E 1,00 (replik 2 014 802/2 006 467 = 1,004 ✓), räntetäckning 3,91, beta −0,00 (5Y — dokumenterat fält), kassa 584 093 M mot skuld 2 014 802 M ⇒ NETTOSKULD 1 430 709 M (−236,81/aktie enligt källan), fcfYield 6,77 % (772 800/11 420 000 ✓ EXAKT), DPS 24,00 INR (1,33 %, payout 39,18 %; DPS-tratta 3→4→8→16→24 = ÅTTA FÖRDOUBLINGAR på fyra år +50 % YoY), PT 2 320,64 (+28,71 %, Strong Buy, 33 analytiker), Piotroski 8, rev-tillväxtprognos 3Y +13,14 % EPS +27,61 %, anställda 28 743 (konsoliderat; statistics-ytan), ex-div 2026-07-24, nästa rapp 2026-10-30; FY KALENDER mars (FY2026 = april 2025–mars 2026): rev 1 165 469→1 391 448→1 499 824→1 729 852→2 109 728 M INR FY2022→26 (omsCAGR +15,99 %/år) med netto 42 549→83 459→74 670→335 561→266 952 (FY2025 = ENGÅNGSÅRET: Indus Towers-omvärderingen lyfte nettot 335,6 mdr — därför TTM 289 147 lägre än FY2025 trots tillväxt; resCAGR +58,27 %/år endpoint FY2022-botten 7,63-EPS), EPS 7,63→14,57→12,80→56,04→44,37, FCF 284 760→392 680→407 067→604 245→770 540 (5/5 positiva; TTM 772 800), OCF 550 166→1 251 744 TTM, capex 265 406→478 944 TTM (capex/OCF 38 %), bruttomarginalernas trappa 59,43→67,65 % (moat-medel 63,48 %, spread 8,22 pp), EK (total) 937 056→1 959 634 + TTM 2 006 467 (Q1FY27-språnget: Comprehensive Income & Other TTM 1 586 949 — RIGHTS-ISSUE-TRANCHEN LANDAR: partly paid konverteras, nettoskuld sjunker 1 646 899→1 430 709), aktieantal 5 881→6 089→6 236 M (TTM), minoriteter 253 807→388 316 M (Airtel Africa/Indus-konsolideringarnas vikt), segment FY2026: Mobile India 1 129 954 · Afrika 568 064 · Passive infra 324 931 · Airtel Business 211 766 · Homes 77 747 · Digital TV 30 179 (elim −232 914); Q1 FY2027 (jun 2026) rappat: vinst 81,67 mdr +37,3 % med EBITDA-marginal 51 %",
      },
      {
        namn: "Yahoo Finance chart-API (paranoid)",
        hamtat: "2026-09-24",
        url: "https://query1.finance.yahoo.com/v8/finance/chart/BHARTIARTL.NS?range=5d&interval=1d",
        paranoid:
          "intraday 2026-09-24 ~13:47 IST = 1 800,80 INR (−1,77 %) mot SA:s 13:50-snapshot 1 803,00 — band 0,12 %; dagsfasta NSE: fre 18/9 1 893,30 · mån 21/9 1 830,20 · tis 22/9 1 817,20 · ons 23/9 1 833,20 · tors 24/9 1 800,80 (intraday); 52-v 1 740,50–2 174,50 (Yahoo) mot SA 1 511–2 045,80 — SA:s fönster bredare (äldre botten), Yahoo-glaset 25 %-kvantilen; chartPreviousClose 1 840,00",
      },
    ],
    hamtat: "2026-09-24",
    pris: 1803.0,
    marknadsKapitalMdr: 11420,
    tillvaxt: {
      omsattningCAGR5ar: 0.1599,
      resultatCAGR5ar: 0.5827,
      omsattningTillvaxtTTM: 0.196,
      prognosTillvaxt: 0.4381,
    },
    lonksamhet: {
      roe: 0.2015,
      roic: 0.1515,
      bruttoMarginal: 0.6786,
      ebitMarginal: 0.3225,
      nettoMarginal: 0.1314,
      fcfMarginal: 0.3512,
    },
    stabilitet: {
      skuldEgenkapital: 1.0,
      rantaTackning: 3.91,
      fcfPositivaSenaste5: 5,
      kassaManaderBurnRate: null,
      nyemissionerSenaste5ar: null,
    },
    aterkop: {
      senasteArMdr: 149.664,
      andelUtestande: 0.0133,
      insiderkopSenaste6man: null,
    },
    moat: {
      bruttoMarginalMedel5ar: 0.6348,
      bruttoMarginalSpread5ar: 0.0822,
      roeMedel5ar: null,
    },
    vardering: {
      pe: 39.49,
      pb: 5.69,
      evEbit: 18.55,
      peg: 0.9,
      fcfYield: 0.0677,
      egenKapitalMultipl: 5.69,
    },
    golv: { typ: "osatt", vardePerAktie: null, marginal: null },
    serier: {
      ar: ["2022", "2023", "2024", "2025", "2026"],
      omsattning: [1165469000000, 1391448000000, 1499824000000, 1729852000000, 2109728000000],
      resultat: [42549000000, 83459000000, 74670000000, 335561000000, 266952000000],
      egetKapital: [937056000000, 1064443000000, 1055639000000, 1534677000000, 1959634000000],
      fcf: [284760000000, 392680000000, 407067000000, 604245000000, 770540000000],
    },
    notering:
      "INDIEN/KOMMUNIKATION 0→1 (Indiens fjärde gren blir sjunde — kommunikation föds). SIGNATURTAL — DUOPOLKONSOLIDERINGENS ANATOMI: (1) DPS-trattan 3→4→8→16→24 INR = ÅTTA FÖRDOUBLINGAR på fyra år samtidigt som P/E-trappan 101,08→30,91 → 39,49 TTM bär marknadens omprisning från nolltillväxt-telen till infrastrukturcompounder; (2) FY2025-ENGÅNGSÅRET netto 335 561 M (Indus Towers-omvärderingen) mot FY2026 266 952 — TTM 289 147 vänder upp, endpoint-resCAGR +58,27 %/år från FY2022-botten 42 549 (7,63-EPS-året); (3) RIGHTS-ISSUE-TRANCHEN LANDAR I BALANSRÄKNINGEN Q1 FY2027: partly-paid-aktierna konverteras (aktiebas 6 089→6 236 M, Comprehensive Income & Other 1 586 949 M TTM) medan nettoskulden SJUNKER 1 646 899→1 430 709 M trots capex-toppen 478 944 — kapitalstrukturens flöde synlig i en kolumn; (4) bruttomarginaltrappan 59,43→67,65 % (moat-medel 63,48 % spridning 8,22 pp) medan ROIC 15,15 % mot WACC 4,61 % = +10,54 pp — frekvensauktionernas prissättning efter spektrumkatastroferna (Vi/Jio-kriget) gav duopolets marginalmakt; (5) AKTIEBASERNAS TRIPPEL (filing 6 236 M / vägd EPS 6 041 M / mcap-bas 6 333 M) dokumenterad — partly-paid-instrumentens konventioner, Maersk-klassen; (6) tre skilda EK-baser (common 1 618 / total 2 006 / BVPS-fält 259,48) — P/B-fältets bas bevisad mcap/EK-total. FIFO: Q2 FY2027-rapp 2026-10-30.",
  },
  {
    ticker: "SUNPHARMA.NS",
    namn: "Sun Pharmaceutical Industries Limited",
    bransch: "halso",
    land: "Indien",
    valuta: "INR",
    kallor: [
      {
        namn: "StockAnalysis",
        hamtat: "2026-09-24",
        url: "https://stockanalysis.com/quote/nse/SUNPHARMA/ (+ /statistics/ + /financials/ + /financials/balance-sheet/)",
        paranoid:
          "NSE-PRIMÄRNOTING i INR (RELIANCE/HDFCBANK-precedenserna; S&P GMI-underlag; kanon 2026-09-24, intraday 13:50 IST; FY = mars): pris 1 856,70 INR (−0,45 %), mcap 4,47 T INR (aktier 2 399 M × 1 856,70 = 4 456 mdr — band 0,3 %), EV 4,19 T = mcap − NETTOKASSA 288 893 M (replik 4 470−288,9 = 4 181 ✓ band 0,2 % — NETTOKASSA-BOLAGET), 52-v 1 550–2 050 (+14,45 % 1 år), P/E 37,00 (replik mcap/netto 4 470 000/120 956 = 36,96 ✓ band 0,1 %; EPS-bas 50,40 ⇒ pris/EPS 36,84), fwd P/E 34,47 ⇒ prognosTillväxt +7,34 % mekanisk, PEG 5,04 spårkonvention mot källans fält 2,19 (källans PEG-bas EPS-tillväxt 16,9 %/år — BAS-TVÅLAVAN dokumenterad, LLOY/NWG-precedenserna), P/S 7,47, P/B 5,33 (replik mcap/EK-total 4 470 000/838 797 = 5,329 ✓ EXAKT; BVPS 348,31 = EK-common 835 701/2 399 ✓ band 0,0 %), P/FCF 50,79, EV/EBIT 30,49 (EBIT TTM 137 965 M = 23,03 % × rev ✓ EXAKT), EV/EBITDA 25,09, marginaler TTM: brutto 78,92 % (472 835/599 105 ✓ EXAKT) · EBIT 23,03 % · netto 20,19 % (120 956/599 105 ✓ EXAKT) · FCF 15,07 % (FY26: 88 098/584 620 ✓ EXAKT), ROE n/a i källan ⇒ härledd netto/EK 14,42 % (dokumenterad härledning), ROIC 19,01 % mot WACC 4,93 % = +14,08 pp, D/E 0,06 (rå replik 46 273/838 797 = 0,055), räntetäckning 37,93, beta 0,12, kassa 335 166 M mot skuld 46 273 M (identitet → nettokassa 288 893 ✓ EXAKT; +120,41/aktie), fcfYield 1,97 % (88 098/4 470 000 ✓ EXAKT), DPS 16,00 INR (0,86 %, FCF-payout 43,58 %, SJU tillväxtår; DPS-trappa 10→11,5→13,5→16→16), PT 2 175,59 (+17,18 %, Buy, 33 analytiker), 3Y rev-prognos +11,45 % EPS +12,97 %, Piotroski 4, anställda 47 000 (statistics-ytan), ex-div 2026-07-07, nästa rapp 2026-10-30; FY KALENDER mars: rev 386 545→438 857→484 969→525 784→584 620 M INR FY2022→26 (omsCAGR +10,90 %/år, TTM 599 105 +2,5 %), netto 32 727→84 736→95 764→109 290→114 794 (resCAGR +36,85 %/år från FY2022-depressionens botten — SEBALE-förlikningsårets låga bas; fem raka tillväxtår), EPS 13,60→47,80 (FY26), FCF 74 895→28 738→99 332→119 435→88 098 (5/5 positiva; FY2023 = förlikningsbetalningens år 28,7 mdr), bruttomarginal 71,86→78,66 % (moat-medel 75,83 % spridning 6,80 pp — specialitetsskiftet), EK 510 661→838 797 M (+64 % på fyra år), EK-common 480 112→835 701, minoritetsfallet FY24→FY25: 34 592→2 679 M = TARO-UTKÖPET (dotterbolagets fria andelar förvärvades — minoritetsposten raderas), total skuld 12 903→46 273 M (lågt genomgående), NETTOKASSA alla fem år: +113 645→+288 893 M, BVPS 200,10→348,31, aktiebas 2 399 M konstant (noll utspädning/återköp — org-familjekontroll), segment FY2026: Indien 192 904 · USA 168 242 · tillväxtmarknader 111 865 · övriga världen 85 684 · API 21 854",
      },
      {
        namn: "Yahoo Finance chart-API (paranoid)",
        hamtat: "2026-09-24",
        url: "https://query1.finance.yahoo.com/v8/finance/chart/SUNPHARMA.NS?range=5d&interval=1d",
        paranoid:
          "intraday 2026-09-24 ~13:47 IST = 1 851,20 INR (−0,74 %) mot SA:s 13:50-snapshot 1 856,70 — band 0,30 % (intraday-rörelse); dagsfasta NSE: fre 18/9 1 837,30 · mån 21/9 1 868,90 · tis 22/9 1 846,40 · ons 23/9 null (Yahoo-bar saknad — källans fönsterlogik, dokumenterad) · tors 24/9 1 851,20 (intraday); 52-v 1 548,0–2 046,9 mot SA 1 550–2 050 konsistent; chartPreviousClose 1 865,15",
      },
    ],
    hamtat: "2026-09-24",
    pris: 1856.7,
    marknadsKapitalMdr: 4470,
    tillvaxt: {
      omsattningCAGR5ar: 0.109,
      resultatCAGR5ar: 0.3685,
      omsattningTillvaxtTTM: 0.0248,
      prognosTillvaxt: 0.0734,
    },
    lonksamhet: {
      roe: 0.1442,
      roic: 0.1901,
      bruttoMarginal: 0.7892,
      ebitMarginal: 0.2303,
      nettoMarginal: 0.2019,
      fcfMarginal: 0.1507,
    },
    stabilitet: {
      skuldEgenkapital: 0.06,
      rantaTackning: 37.93,
      fcfPositivaSenaste5: 5,
      kassaManaderBurnRate: null,
      nyemissionerSenaste5ar: null,
    },
    aterkop: {
      senasteArMdr: 38.272,
      andelUtestande: 0.0086,
      insiderkopSenaste6man: null,
    },
    moat: {
      bruttoMarginalMedel5ar: 0.7583,
      bruttoMarginalSpread5ar: 0.068,
      roeMedel5ar: null,
    },
    vardering: {
      pe: 37.0,
      pb: 5.33,
      evEbit: 30.49,
      peg: 5.04,
      fcfYield: 0.0197,
      egenKapitalMultipl: 5.33,
    },
    golv: { typ: "osatt", vardePerAktie: null, marginal: null },
    serier: {
      ar: ["2022", "2023", "2024", "2025", "2026"],
      omsattning: [386545000000, 438857000000, 484969000000, 525784000000, 584620000000],
      resultat: [32727000000, 84736000000, 95764000000, 109290000000, 114794000000],
      egetKapital: [510661000000, 593155000000, 671259000000, 724860000000, 838797000000],
      fcf: [74895000000, 28738000000, 99332000000, 119435000000, 88098000000],
    },
    notering:
      "INDIEN/HALSO 0→1 (Indiens femte gren; universumets första indiska läkemedelsrad — stormarknadspharma bredvid Novartis/Novo/GSK/Takeda). SIGNATURTAL — GENERIKANS TILL SPECIALITETENS RESA: (1) bruttomarginalens trappa 71,86→78,66 % på fyra år (moat-medel 75,83 % spridning 6,80 pp) = mixskiftet från volymgenerika till specialitet (Ilumya/Winlevi/Cequentus) i ETT tal; (2) TARO-UTKÖPET SYNLI GT I BALANSRÄKNINGEN: minoritetsposten 34 592→2 679 M INR FY24→FY25 — dotterbolagets fria andelar köptes in, konsolideringen fullbordad (organisk kontrast till Bhartis växande minoriteter 253 807→388 316); (3) NETTOKASSA-KULTUREN: +113 645→+288 893 M INR alla fem år med skuld 46 273 M mot kassa 335 166 — Indiens försiktiga balansdoktrin mot Airtels spektrumslast i samma omgång (två kapitalkulturer, ett land); (4) resCAGR +36,85 %/år från FY2022-botten 32 727 M (SEBALE-förlikningsåret) — FEM RAKA VINSTÅR med FCF-förlikningsdippen FY2023 28 738 M ärligt bokförd; (5) aktiebasen 2 399 M KONSTANT fem år — org-familjekontrollens noll-utspädning mot tech-bolagens återköpsmaskiner; (6) ROIC 19,01 % mot WACC 4,93 % = +14,08 pp — omgångens bredaste moat-gap bland de tre (Airtel +10,54 · L&T +7,21). FIFO: Q2 FY2027-rapp 2026-10-30.",
  },
  {
    ticker: "LT.NS",
    namn: "Larsen & Toubro Limited",
    bransch: "industri",
    land: "Indien",
    valuta: "INR",
    kallor: [
      {
        namn: "StockAnalysis",
        hamtat: "2026-09-24",
        url: "https://stockanalysis.com/quote/nse/LT/ (+ /statistics/ + /financials/ + /financials/balance-sheet/)",
        paranoid:
          "NSE-PRIMÄRNOTING i INR (RELIANCE/HDFCBANK-precedenserna; S&P GMI-underlag; kanon 2026-09-24 intraday 13:50 IST; FY = mars): pris 3 867,40 INR (−1,59 %), mcap 5,40 T INR (aktiebas-trippel: filing 1 376 M × 3 867,40 = 5 322 mdr = −1,4 % mot mcap-fältet; mcap-fältets bas 1 396 M; vägd EPS-bas 1 536 M = 165 897/108,03 — tre baser dokumenterade, Bharti/Maersk-klassen), EV 6,08 T (replik mcap+nettoskuld 5 400+488,8 = 5 888,8 — källspridning 3,3 %: källans EV bär låneboken/projektposter), 52-v 3 100–4 440 (+5,97 % 1 år), P/E 32,57 (replik mcap/netto 5 400 000/165 897 = 32,55 ✓ band 0,06 %; pris/EPS 3 867,40/108,03 = 35,80 — EPS-basens vägda konvention), fwd P/E 25,25 ⇒ prognosTillväxt +28,99 % mekanisk, PEG 1,12 spårkonvention, P/S 1,82, P/B 4,20 (replik mcap/EK-total 5 400 000/1 285 305 = 4,201 ✓ EXAKT; BVPS 794,47 = EK-common 1 092 898/1 376 ✓ band 0,03 %), EV/EBIT 19,51 (EBIT TTM 313 749 M = 10,57 % × rev ✓ EXAKT), EV/EBITDA 17,22, marginaler TTM: brutto 37,43 % (1 111 145/2 969 008 ✓ EXAKT) · EBIT 10,57 % · netto 5,59 % (165 897/2 969 008 ✓ EXAKT) · FCF 4,09 % (FY26 119 318/2 916 180 ✓ EXAKT), ROE n/a i källan ⇒ härledd netto/EK 12,91 %, ROIC 13,21 % mot WACC 6,00 % = +7,21 pp, D/E 0,98 (replik 1 254 966/1 285 305 = 0,976 ✓), räntetäckning 12,05, beta 0,51, kassa 766 147 M mot skuld 1 254 966 M ⇒ NETTOSKULD 488 819 M (identitet ✓ EXAKT; mot mars '25 718 149 — HALVERAD på ett år), fcfYield 2,21 % (119 318/5 400 000 ✓ EXAKT), DPS 38,00 INR (0,98 %, payout 35,17 %, +11,76 % YoY; DPS-trappa 22→24→28→34→38), PT 4 499,52 (+16,35 %, Buy, 30 analytiker), 3Y rev-prognos +13,54 % EPS +18,56 %, Piotroski 4, anställda 55 662, ex-div 2026-05-22, nästa rapp 2026-10-28; FY KALENDER mars: rev 1 587 506→1 861 940→2 251 890→2 598 063→2 916 180 M INR FY2022→26 (omsCAGR +16,42 %/år, TTM 2 969 008 +1,8 %), netto 86 693→104 707→130 591→150 371→160 840 (resCAGR +16,71 %/år — FEM RAKA VINSTÅR, trion/slagningens mest jämna resultattrappa), EPS 61,65→104,36, FCF 160 530→186 332→137 498→47 325→119 318 (5/5 positiva; FY2025 = arbetkapitalåret 47 325 — orderbokens tillväxt binder kassa), bruttomarginal 38,66→36,91 % (moat-medel 37,70 % spridning BLOTT 2,52 pp = trion/slagningens stabilaste), EK 953 737→1 285 305 M, minoritetsvikt 129 661→192 407 M (infrastruktur-JV:en), total skuld 1 255 081→1 254 966 M (PLATT medan omsättningen +84 % — hävstången WEKS: Debt/EBITDA 3,53→lägre), NETTOSKULD −794 761→−488 819 (kassa växer snabbare än skuld), ORDERBACKLOG 3 575 950→3 970 330→4 758 090→5 791 370→7 403 270 M INR (CAGR +19,95 %/år — 2,5× omsättningen: framtidens intäkter redan kontrakterade), låneboken (Financial Services) 428 255+749 957 M FY26 (kunder + projekt), förskottsintäkter (unearned) 772 489+167 802 M — kunderna betalar i förskott, segment FY2026: Infrastruktur & Utilities 1 008 425 · Energikonvertering 543 743 · Tech/Plattformar 541 090 · Energi grönt 350 202 · Manufacturing 190 915 · Finansiella tjänster 172 834 · Realty 31 303; grundat 1938 (danska ingenjörer i Bombay — L&T:s ursprung), anställda 55 662",
      },
      {
        namn: "Yahoo Finance chart-API (paranoid)",
        hamtat: "2026-09-24",
        url: "https://query1.finance.yahoo.com/v8/finance/chart/LT.NS?range=5d&interval=1d",
        paranoid:
          "intraday 2026-09-24 ~13:47 IST = 3 856,00 INR (−1,88 %) mot SA:s 13:50-snapshot 3 867,40 — band 0,30 % (intraday-rörelse); dagsfasta NSE: fre 18/9 3 960,00 · mån 21/9 3 986,00 · tis 22/9 3 933,60 · ons 23/9 3 930,00 · tors 24/9 3 856,00 (intraday); 52-v 3 288,1–4 440,0 mot SA 3 100–4 440 (SA:s fönster bredare); chartPreviousClose 3 930,00",
      },
    ],
    hamtat: "2026-09-24",
    pris: 3867.4,
    marknadsKapitalMdr: 5400,
    tillvaxt: {
      omsattningCAGR5ar: 0.1642,
      resultatCAGR5ar: 0.1671,
      omsattningTillvaxtTTM: 0.0181,
      prognosTillvaxt: 0.2899,
    },
    lonksamhet: {
      roe: 0.1291,
      roic: 0.1321,
      bruttoMarginal: 0.3743,
      ebitMarginal: 0.1057,
      nettoMarginal: 0.0559,
      fcfMarginal: 0.0409,
    },
    stabilitet: {
      skuldEgenkapital: 0.98,
      rantaTackning: 12.05,
      fcfPositivaSenaste5: 5,
      kassaManaderBurnRate: null,
      nyemissionerSenaste5ar: null,
    },
    aterkop: {
      senasteArMdr: 52.288,
      andelUtestande: 0.0098,
      insiderkopSenaste6man: null,
    },
    moat: {
      bruttoMarginalMedel5ar: 0.377,
      bruttoMarginalSpread5ar: 0.0252,
      roeMedel5ar: null,
    },
    vardering: {
      pe: 32.57,
      pb: 4.2,
      evEbit: 19.51,
      peg: 1.12,
      fcfYield: 0.0221,
      egenKapitalMultipl: 4.2,
    },
    golv: { typ: "osatt", vardePerAktie: null, marginal: null },
    serier: {
      ar: ["2022", "2023", "2024", "2025", "2026"],
      omsattning: [1587506000000, 1861940000000, 2251890000000, 2598063000000, 2916180000000],
      resultat: [86693000000, 104707000000, 130591000000, 150371000000, 160840000000],
      egetKapital: [953737000000, 1035672000000, 1025497000000, 1154037000000, 1285305000000],
      fcf: [160530000000, 186332000000, 137498000000, 47325000000, 119318000000],
    },
    notering:
      "INDIEN/INDUSTRI 0→1 (Indiens sjätte gren; universumets första indiska industrikoncern — Cat+Komatsu+Volvo-klubben får tillväxtmarknadskontrasten, samma cykel i fyra valutor). SIGNATURTAL — ORDERBOKSMASKINEN: (1) ORDERBACKLOG 3 575 950→7 403 270 M INR FY2022→26 (+19,95 %/år, 2,5× årsomsättningen) = framtidens intäkter redan kontrakterade — EPC-bolagets försäljningspipeline som ledande indikator, universumets första rad där orderboken är huvudnyckeltalet; (2) FEM RAKA VINSTÅR netto 86 693→160 840 M (resCAGR +16,71 % — mot Bhartis volatila engångsår och Suns förlikningsbotten: tre CAGR-arketyper i en omgång) med bruttomarginal-spridningen BLOTT 2,52 pp (trion/slagningens stabilaste moat-kurva — EPC-kontraktens prissatta marginaler); (3) FY2025 = ARBETSKAPITALÅRET: FCF 47 325 M (backlog +27 % binder kassa genom förskott/ongoing) med återhämtning FY2026 119 318 — kassacykelns pedagogik mot tjänstebolagens jämna FCF-linjer; (4) HÄVSTÅNGEN WEKS MEDAN BACKLOG VÄXER: total skuld PLATT 1 255 mdr genom +84 % omsättning, nettoskuld HALVERAD −794 761→−488 819 M, D/E 0,98 mot kapitalintensitetens gräns; (5) LÅNEBOKEN 1 178 mdr (kunder 428 + projekt 750) = halva balansräkningen är bankverksamhet i industriell förpackning (EV-källspridningen 3,3 % rotad här); grundat 1938 av danska ingenjörer — ingenjörsarvet i namnet. FIFO: Q2 FY2027-rapp 2026-10-28.",
  },
];

// ── Race-vakt + append på diskens faktiska läge ─────────────────────────────
const u = JSON.parse(readFileSync(FIL, "utf8"));
const dup = u.filter((b) => MINA.includes(b.ticker));
if (dup.length) {
  console.error(`RÖD: ${dup.map((d) => d.ticker).join(", ")} finns redan på disk — duplikatstopp`);
  process.exit(1);
}
const cellK = u.filter((b) => b.land === "Indien" && b.bransch === "kommunikation");
const cellH = u.filter((b) => b.land === "Indien" && b.bransch === "halso");
const cellI = u.filter((b) => b.land === "Indien" && b.bransch === "industri");
console.log(
  `diskens läge FÖRE: ${u.length} poster · Indien-celler: kommunikation ${cellK.length} · halso ${cellH.length} · industri ${cellI.length}`,
);
if (cellK.length !== 0 || cellH.length !== 0 || cellI.length !== 0) {
  console.error("RÖD: någon av mina tre celler är inte 0 — klaimkoordinaten ogiltig (syskonrace?)");
  process.exit(1);
}
const gamla = JSON.stringify(u, null, 1);
const nya = [...u, ...poster];
const ut = JSON.stringify(nya, null, 1);
if (JSON.stringify(nya.slice(0, u.length), null, 1) !== gamla) {
  console.error("RÖD: gamla rader ej innehållsidentiska vid append");
  process.exit(1);
}
if (!ut.startsWith(gamla.slice(0, -2))) {
  console.error("RÖD: append inte suffix-läge (gamla block ej först)");
  process.exit(1);
}
writeFileSync(FIL, ut + "\n");
const efter = JSON.parse(readFileSync(FIL, "utf8"));
console.log(
  `EFTER: ${efter.length} poster (+${efter.length - u.length}) · Indien: ${efter.filter((b) => b.land === "Indien").length} bolag i ${new Set(efter.filter((b) => b.land === "Indien").map((b) => b.bransch)).size} grenar`,
);
console.log("nya tickers:", efter.slice(-3).map((b) => b.ticker).join(", "));
// läs-tillbaka ×2 (readback-konventionen)
const efter2 = JSON.parse(readFileSync(FIL, "utf8"));
if (efter2.length !== efter.length || efter2.slice(-3).map((b) => b.ticker).join() !== MINA.join()) {
  console.error("RÖD: läs-tillbaka ×2 misslyckad");
  process.exit(1);
}
console.log("läs-tillbaka ×2: OK — diskens läge", efter2.length, "med", MINA.join(", "), "sist");
