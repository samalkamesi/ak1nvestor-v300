#!/usr/bin/env node
/**
 * s2-u2 omg18 (manifest auto-s2-1789806329851) — append GSK plc + Unilever PLC
 * till bolagsunivers.json med ARITMETISK ABORT-GRIND (omg13-läxan: FEL>0 ⇒
 * INGET skrivs). Konventioner:
 *  - GSK.L + ULVR.L = LSE-PRIMÄRNOTERINGAR (HSBA.L-precedensen): /quote/lon/,
 *    pris i GBX (pence), mcap i GBP mdr, källans statistics-TTM i GBP.
 *  - GSK rapporterar i GBP (serier GBP, kalenderår). ULVR rapporterar i EUR
 *    (RACE/BUD-ADR-spegeln på LSE-ytan: FY-serier EUR, kalenderår; statistics-
 *    TTM GBP-översatt — växelkurs ≈0,861 ur källans egna EPS-par 3,64/4,23).
 *  - Superlativtest FÖRE bygg (spår 1:s läxa): GSK P/E-rank 60 av 186 · P/B
 *    127 av 193 · brutto 158 av 193 (36:e högsta) · ULVR P/E-rank 93 · P/B 140
 *    · brutto 93 — MITT I FALTET, noteringarna bär placeringar ej superlativer.
 *  - BAS-SPLITTRAR DOKUMENTERADE (BLK/HOLN-klasserna): GSK payout 55,30 % på
 *    källans egen EPS-bas (egen GAAP-kvot 61,0 %); ULVR P/E 21,05 = källans
 *    kärn-EPS-bas (GAAP-kvot 12,69 på engångspost-täckt TTM), EV/earnings
 *    15,51 på GAAP-NI — tre ytor redovisade, fältbärare = källans primäryta.
 *  - Idempotent: redan tagna tickers hoppar append-raden (syskonvakt).
 * Källa: stockanalysis.com (stämplad 2026-09-18, close 18:e 16:54 GMT).
 * KASSAFLÖDESODDITET GSK: kassaflödessidans TTM-kolumn är STALE (sep-24-
 * period, NI 2 511 mot financials-TTM 4 821) — statistics-TTM är fältbärare
 * (VITEC-lärdomen); FY2024/25-FCF härledda ur källans FCF-marginalrader ×
 * intäkt (korscheck FY2022: 21,35 % × 29 324 = 6 261 ≈ kassaflödesradens
 * 6 260 ✓; FY2023: 17,98 % × 30 328 = 5 453 ≈ 5 454 ✓).
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

// ══════════════ GSK PLC (GSK.L) ══════════════
kontroll("GSK-01", "P/E-identitet pris/EPS-TTM", 18.775 / 1.18, 15.93, 0.05,
  "EXAKT-klassen: 15,91 mot källans 15,93 (0,12 %) — EPS-raden bär TTM-ytan");
kontroll("GSK-02", "P/B mcap/equity", 75.23 / 17.18, 4.38, 0.005, "källans P/B; equity 17,18 mdr GBP, BVPS 4,40");
kontroll("GSK-03", "prognosTillväxt pe/fwd−1", 15.93 / 10.21 - 1, 0.5602, 0.0005, "TTE-spårkonventionen");
kontroll("GSK-04", "PEG pe/(100·prognos)", 15.93 / 56.0235, 0.2844, 0.005,
  "spårkonvention; källans PEG 1,88 som not (källan räknar på 3-års EPS-prognos +5,02 %/år)");
kontroll("GSK-05", "EV/EBIT-replik (mcap+nettskuld)/EBIT", (75.23 + 15.19) / 9.686, 9.29, 0.1,
  "egen kvot 9,334 mot källans 9,29 (0,5 %) — källans EV 89,95 bär exakta poster mot egen 90,42 (0,52 %); TEL-05-klassen");
kontroll("GSK-06", "fcfYield FCF/mcap", 6.90 / 75.23, 0.0917, 0.0005, "källans FCF-yield 9,17 % ⇒ P/FCF 10,91 replikeras");
kontroll("GSK-07", "bruttoMarginal", 24.402 / 33.203, 0.7349, 0.0005, "källans 73,49 %");
kontroll("GSK-08", "ebitMarginal", 9.686 / 33.203, 0.2917, 0.0005, "källans 29,17 %");
kontroll("GSK-09", "nettoMarginal", 4.821 / 33.203, 0.1452, 0.0005, "källans 14,52 %");
kontroll("GSK-10", "fcfMarginal", 6.90 / 33.203, 0.2078, 0.0005, "källans 20,78 %");
kontroll("GSK-11", "oms-CAGR serieendpoints 3 steg", Math.pow(32667 / 29324, 1 / 3) - 1, 0.0366, 0.0005, "M GBP FY2022→FY2025");
kontroll("GSK-12", "res-CAGR serieendpoints 3 steg", Math.pow(5716 / 14956, 1 / 3) - 1, -0.2743, 0.0005,
  "startpunkten FY2022 bär Haleon-avknoppningsvinsten 14 956 — endpoint-paret FY2021→FY2025 = +6,8 %/år som not");
kontroll("GSK-13", "bruttoMedel5ar FY2021–FY2025",
  (0.6747 + 0.6792 + 0.7234 + 0.7181 + 0.7261) / 5, 0.7043, 0.0005, "fem kvoter ur källans brutokolumn");
kontroll("GSK-14", "bruttoSpread max−min", 0.7261 - 0.6747, 0.0514, 0.0005,
  "FCX/VALE-konventionen max−min — spridningen bär Haleon-scope-brottet 2022 (Holcims spegelbild)");
kontroll("GSK-15", "ROIC-spread", 0.2638 - 0.0533, 0.2105, 0.0005, "ROIC 26,38 % mot WACC 5,33 %");
kontroll("GSK-16", "skuld/ek", 18.29 / 17.18, 1.06, 0.005, "källans 18,29/17,18 mdr GBP");
kontroll("GSK-17", "DPS-yield", 0.72 / 18.775, 0.0384, 0.0005, "källans 3,84 %");
kontroll("GSK-18", "DPS-payout egen kvot GAAP", 0.72 / 1.18, 0.6102, 0.0005,
  "källans payout 55,30 % bär egen EPS-bas 1,30 GBP (0,72/0,553) — BAS-SPLITTRAN dokumenterad, fältbärare i text = källans rad");
kontroll("GSK-19", "mcap/aktieenheter", 75230 / 4.01, 18775, 30,
  "75,23 mdr GBP / 4,01 miljarder aktier = 18 760,6 p ≈ pris 18 775 (0,08 % — källans shares-rad bär mcap)");
kontroll("GSK-20", "FCF-marginal-korscheck FY2022", 0.2135 * 29324, 6260, 15,
  "källans FCF-marginalrad × intäkt replikerar kassaflödesradens exakta FCF (6 261 mot 6 260) — härledningsmetoden för FY2024/25 bevisad");

const GSK = {
  ticker: "GSK.L",
  namn: "GSK plc",
  bransch: "halso",
  land: "Storbritannien",
  valuta: "GBX",
  kallor: [
    {
      namn: "StockAnalysis",
      hamtat: "2026-09-18",
      url: "https://stockanalysis.com/quote/lon/GSK/",
      paranoid:
        "LSE-primärnotering (översikt + statistics + financials + cash-flow-statement, underlag S&P Global Market Intelligence + Fiscal.ai; close 2026-09-18 16:54 GMT, −1,18 %): pris 1 877,50 GBX (pence), mcap 75,23 mdr GBP (4,01 miljarder aktier), EV 89,95 mdr (net debt 15,19: skuld 18,29 − kassa 3,11), P/E 15,93 (pris/EPS 18,775/1,18 = 15,91 — 0,12 %), forward 10,21, PEG 1,88 (källans — 3-års EPS-prognos +5,02 %/år; spårets TTE-PEG 0,28), PS 2,27, P/B 4,38 (equity 17,18 mdr; BVPS 4,40), P/FCF 10,91, P/OCF 9,03, EV/EBIT 9,29 (replik (75,23+15,19)/9,686 = 9,334 — 0,5 %; källans EV bär exakta poster), EV/EBITDA 8,16, EV/Earnings 18,66; TTM GBP (mdr): rev 33,203 (+4,97 % mot föregående TTM), brutto 24,402, EBIT 9,686, EBITDA 10,82, pretax 5,90, netto 4,821 (+40,8 %), EPS 1,18; OCF 8,33, capex 1,43, FCF 6,90 (fcfYield 9,17 %; 1,72/aktie); marginaler TTM: brutto 73,49 %, operating 29,17 %, pretax 17,78 %, profit 14,52 %, EBITDA 32,58 %, FCF 20,78 %; ROE 33,38 %, ROA 10,01 %, ROIC 26,38 % mot WACC 5,33 % (ROCE 24,09 %); skuld/ek 1,06 (18,29/17,18), räntetäckning 14,65, debt/EBITDA 1,66, Altman Z 2,2, Piotroski F 7; effektiv skatt 10,86 % ( brittisk patentbox — läkemedelspatentens skatteregim); utdelning 0,72 GBP (3,84 %, källans payout 55,30 % på egen EPS-bas 1,30 — egen GAAP-kvot 61,0 % dokumenterad), tillväxt +7,94 % YoY, 2 tillväxtår (återuppbyggnaden efter Haleon-rebasningen), ex-div 2026-08-13; återköpsyield 1,36 %, shareholder yield 5,20 %; beta 0,29 (5Y), 52-v 1 455–2 282 (+27,42 % på året; kursen −17,7 % från toppen); institutions 84,76 %, insiders 0,06 %; analytiker Hold PT 2 171 GBX (+15,63 %; 23 analytiker; Berenberg uppgraderade till Buy PT 2 200 enligt källans nyhetsflöde); anställda 66 841; nästa rapport 2026-10-28; grundat 1715; räkenskapsår kalenderår, FY-serier i GBP (M): rev 24 696→29 324→30 328→31 376→32 667, netto 4 385→14 956→4 928→2 575→5 716 (FY2021→FY2025 — FY2022 bär Haleon-avknoppningsvinsten, FY2024 Zantac-litigation-troughen), brutto 16 663→19 917→21 940→22 531→23 720; bruttomarginal 67,47→67,92→72,34→71,81→72,61 % (scope-brottet 2022: konsumenthälsans lägre brutto lämnade portföljen); FCF FY2022 6 260, FY2023 5 454 (kassaflödesrader exakta), FY2024 5 153, FY2025 6 391 (härledda ur källans FCF-marginalrader 16,43/19,57 % × intäkt — metoden korscheckad mot FY2022: 21,35 % × 29 324 = 6 261 ≈ 6 260 ✓); utdelningar betalda 3 999→3 467→2 247 (M GBP, kalenderår 2021→2023 — rebasningen 80p→61p-klassen efter Haleon), återköp ≈1,5 mdr/år (kassaflödesraderna 1 493–1 500 M); KASSAFLÖDESODDITET: kassaflödessidans TTM-kolumn är stale (sep-24-period, NI 2 511) — statistics-TTM är fältbärare (VITEC-lärdomen); bransch Healthcare/Drug Manufacturers-General källkonsekvent med hälsa-grenen; reverse split 0,8 noterad 2022-07-19 (källans notis)",
    },
  ],
  hamtat: "2026-09-18",
  pris: 1877.5,
  marknadsKapitalMdr: 75.23,
  tillvaxt: {
    omsattningCAGR5ar: 0.0366,
    resultatCAGR5ar: -0.2743,
    omsattningTillvaxtTTM: 0.0497,
    prognosTillvaxt: 0.5602,
  },
  lonksamhet: {
    roe: 0.3338,
    roic: 0.2638,
    bruttoMarginal: 0.7349,
    ebitMarginal: 0.2917,
    nettoMarginal: 0.1452,
    fcfMarginal: 0.2078,
  },
  stabilitet: {
    skuldEgenkapital: 1.06,
    rantaTackning: 14.65,
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
    bruttoMarginalMedel5ar: 0.7043,
    bruttoMarginalSpread5ar: 0.0514,
    roeMedel5ar: null,
  },
  vardering: {
    pe: 15.93,
    pb: 4.38,
    evEbit: 9.29,
    peg: 0.28,
    fcfYield: 0.0917,
    egenKapitalMultipl: 4.38,
  },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2022", "2023", "2024", "2025"],
    omsattning: [29324000000, 30328000000, 31376000000, 32667000000],
    resultat: [14956000000, 4928000000, 2575000000, 5716000000],
    egetKapital: [],
    fcf: [6260000000, 5454000000, 5153000000, 6391000000],
  },
  notering:
    "STORBRITANNIEN/HÄLSO-CELLENS FÖRSTA RAD (Storbritannien 2→3: HSBA.L finans · ARM teknik · GSK.L hälsa — världens sjätte största börsekonomi fick sin hälsogren) och CAMBRIDGE-PARETS BRENTFORD-MOTSVARIGHET: AstraZeneca-raden (AZN.ST) är Sverige-klassad men bolaget brittiskt — GSK blir universumets första UK-KLASSADE hälsorad och läkemedelsgrenens andra brittiska ben (vaccin/specialitet mot AZN:s onkologi). SCOPE-BROTTET SOM BRUTTOLYFT: konsumenthälsan (Haleon) avknoppades 2022 — netto FY2022 14 956 M GBP bär avknoppningsvinsten (Holcim/Amrize-precedensens mekanik), och bruttomarginalen HOPAR 67,9→72,3 % (spread 5,1 pp är STRUKTURELL — konsumenthälsans lägre brutto lämnade portföljen; Holcims spegelbild där spridningen var rak genom brottet). ZANTAC-TROUGHEN OCH VÄNDNINGEN: netto FY2024 2 575 (litigationskostnader) → FY2025 5 716 (+123 %) med TTM 4 821 — prognosTillväxt +56,0 % (P/E 15,93 mot forward 10,21, PEG 0,28 spår; källans PEG 1,88 på 3-års EPS +5,02 %/år som kalibrering). VALLGRAVENS TVÅ BEN: brutto 73,5 % (36:e högsta av 193 — placering, superlativ-testat) med ROIC 26,38 % mot WACC 5,33 % = +21,1 pp; effektiv skatt 10,86 % (patentbox-regimen — patentets andra skydd är skatteytan). KAPITALÅTERKOMSTEN: utdelning 0,72 GBP (3,84 %, +7,94 % YoY, 2 tillväxtår efter Haleon-rebasningen 80p→61p-klassen — betalda utdelningar 3 999→3 467→2 247 M GBP 2021→2023) + återköp ≈1,5 mdr/år (shareholder yield 5,20 %). BALANSRÄKNINGEN: skuld 18,29 mot kassa 3,11 (skuld/ek 1,06, räntetäckning 14,65, Altman 2,2), arbetskapital −3,98 mdr (leverantörskrediten som finansieringsform). FCF genom omställningen: 6,26→5,45→5,15→6,39 mdr (TTM 6,90, yield 9,17 %). KURSBILDET: beta 0,29 med 52-vägers 1 455–2 282 (+27,4 % på året, −17,7 % från toppen); PT 2 171 GBX Hold. Grundat 1715. LSE-primär (HSBA.L-precedensen), kalenderår i GBP; kassaflödessidans TTM-kolumn stale (sep-24) — statistics-TTM fältbärare. Nästa rapport 2026-10-28, ex-div 2026-08-13.",
};

// ══════════════ UNILEVER PLC (ULVR.L) ══════════════
kontroll("ULVR-01", "GAAP P/E-not pris/EPS-GBP", 46.21 / 3.64, 12.69, 0.05,
  "BAS-SPLITTRAN: källans P/E 21,05 bär kärn-EPS-bas (~2,19 GBP, exkl engångsposter); GAAP-kvoten 12,69 på TTM med glass/försäljningsvinster — fältbärare = källans primäryta (båda sidorna visar 21,05), BLK-precedensen");
kontroll("ULVR-02", "P/B mcap/equity", 99.50 / 15.76, 6.31, 0.005, "källans P/B; equity 15,76 mdr GBP, BVPS 6,48");
kontroll("ULVR-03", "prognosTillväxt pe/fwd−1", 21.05 / 16.16 - 1, 0.3026, 0.0005, "TTE-spårkonventionen");
kontroll("ULVR-04", "PEG pe/(100·prognos)", 21.05 / 30.2594, 0.6953, 0.005,
  "spårkonvention; källans PEG 3,33 som not (3-års EPS-prognos +5,94 %/år)");
kontroll("ULVR-05", "EV/EBIT-replik (mcap+nettskuld)/EBIT", (99.50 + 22.53) / 8.73, 13.86, 0.2,
  "egen kvot 13,978 mot källans 13,86 (0,9 %) — källans EV 123,86 bär exakta poster mot egen 122,03; EV/earnings 15,51 = EV/NI 7,98 GAAP-ytan");
kontroll("ULVR-06", "fcfYield FCF/mcap", 6.22 / 99.50, 0.0625, 0.0005, "källans FCF-yield 6,25 % ⇒ P/FCF 16,01 replikeras");
kontroll("ULVR-07", "bruttoMarginal GBP-yta", 20.52 / 43.59, 0.4707, 0.0005, "källans 47,07 %; EUR-ytan 23 826/50 620 = 47,07 % identisk (marginaler valutaoberoende)");
kontroll("ULVR-08", "ebitMarginal", 8.73 / 43.59, 0.2003, 0.0005, "källans 20,03 %");
kontroll("ULVR-09", "nettoMarginal", 7.98 / 43.59, 0.1832, 0.0005, "källans 18,32 % (egen kvot 18,31 %)");
kontroll("ULVR-10", "fcfMarginal", 6.22 / 43.59, 0.1426, 0.0005,
  "financials-TTM-ytan 14,26 % och egen kvot 14,265 %; statistics-ytans 14,32 % = avrundningsyta (dokumenterad, fältet = financials/egen)");
kontroll("ULVR-11", "oms-CAGR serieendpoints 3 steg", Math.pow(50503 / 60073, 1 / 3) - 1, -0.0562, 0.0005,
  "M EUR FY2022→FY2025 — startpunkten FY2022 60 073 INKLUDERAR glassen, FY2023+ är continuing-bas: scope-brott (Holcim-klassen); continuing-basen FY2023→FY2025 = −1,1 %/år som not");
kontroll("ULVR-12", "res-CAGR serieendpoints 3 steg", Math.pow(9469 / 7642, 1 / 3) - 1, 0.074, 0.0005,
  "M EUR FY2022→FY2025 — slutpunkten FY2025 9 469 bär glasstroughens vändning + engångsposter (dokumenterad reservation)");
kontroll("ULVR-13", "omsattningTillvaxtTTM EUR", 50620 / 50503 - 1, 0.0023, 0.0005, "TTM jun-26 mot FY2025, rapportvalutan — källans +0,23 % EXAKT");
kontroll("ULVR-14", "bruttoMedel5ar FY2021–FY2025",
  (0.4230 + 0.4023 + 0.4354 + 0.4669 + 0.4695) / 5, 0.4394, 0.0005, "fem kvoter ur källans EUR-kolumner");
kontroll("ULVR-15", "bruttoSpread max−min", 0.4695 - 0.4023, 0.0672, 0.0005,
  "FY2022-botten 40,23 % (energikostnadstoppen) → FY2025-topp 46,95 % — marginalen BYGGS på fyra år (RACE-spegelbild), spridningen bär även glassens utflytt");
kontroll("ULVR-16", "ROIC-spread", 0.1582 - 0.0582, 0.1, 0.0005, "ROIC 15,82 % mot WACC 5,82 %");
kontroll("ULVR-17", "skuld/ek", 27.65 / 15.76, 1.75, 0.005, "källans 27,65/15,76 mdr GBP");
kontroll("ULVR-18", "DPS-yield", 1.73 / 46.21, 0.0373, 0.0005, "källans 3,73 %");
kontroll("ULVR-19", "DPS-payout egen kvot", 1.73 / 3.64, 0.4753, 0.0005,
  "källans payout 45,85 % bär egen EPS-bas 3,77 GBP — BAS-SPLITTRAN dokumenterad (samma klass som GSK-18)");
kontroll("ULVR-20", "mcap/aktieenheter", 99500 / 2.15, 46210, 100,
  "99,50 mdr GBP / 2,15 miljarder aktier = 46 279 p ≈ pris 46 210 (0,15 %); aktieantalet −4,18 % YoY = återköpen");
kontroll("ULVR-21", "FCF-korscheck marginalrad × intäkt FY2025", 0.1373 * 50503, 6933, 15,
  "källans FCF-marginalrad replikerar kassaflödesradens exakta FCF (6 934 mot 6 933) — sidorna internt konsistenta");

const ULVR = {
  ticker: "ULVR.L",
  namn: "Unilever PLC",
  bransch: "konsument",
  land: "Storbritannien",
  valuta: "GBX",
  kallor: [
    {
      namn: "StockAnalysis",
      hamtat: "2026-09-18",
      url: "https://stockanalysis.com/quote/lon/ULVR/",
      paranoid:
        "LSE-primärnotering (översikt + statistics + financials + cash-flow-statement, underlag S&P Global Market Intelligence + Fiscal.ai; close 2026-09-18 16:54 GMT, −0,25 %): pris 4 621,00 GBX (pence), mcap 99,50 mdr GBP (2,15 miljarder aktier, −4,18 % YoY = återköpen), EV 123,86 mdr (net debt 22,53: skuld 27,65 − kassa 5,12), P/E 21,05 (källans kärn-EPS-bas ~2,19 GBP — BAS-SPLITTRAN: GAAP-kvoten pris/EPS-TTM 46,21/3,64 = 12,69 på engångspost-täckt TTM; EV/earnings 15,51 = EV/GAAP-NI — tre ytor redovisade, fältbärare = källans primäryta som båda översikts-/statistiksidorna visar; BLK/HOLN-klasserna), forward 16,16, PEG 3,33 (källans — 3-års EPS-prognos +5,94 %/år; spårets TTE-PEG 0,70), PS 2,28, P/B 6,31 (equity 15,76 mdr; BVPS 6,48), P/FCF 16,01, P/OCF 13,38, EV/EBIT 13,86 (replik (99,50+22,53)/8,73 = 13,978 — 0,9 %), EV/EBITDA 12,53; TTM GBP (mdr): rev 43,59 (= EUR-ytan 50,620 × växelkurs ≈0,861 ur källans EPS-par 3,64/4,23), brutto 20,52, EBIT 8,73, EBITDA 9,37, pretax 7,56, netto 7,98 (+64,1 %), EPS 3,64; OCF 7,44, capex 1,22, FCF 6,22 (fcfYield 6,25 %; 2,89/aktie); marginaler TTM: brutto 47,07 %, operating 20,03 %, pretax 17,34 %, profit 18,32 %, EBITDA 21,49 %, FCF 14,26 % (financials-ytan; statistics-ytan 14,32 % dokumenterad); ROE 31,87 % (källans kärnbas; GAAP-NI/equity = 50,6 % på engångsposter — dokumenterat), ROA 8,29 %, ROIC 15,82 % mot WACC 5,82 % (ROCE 21,10 %); skuld/ek 1,75 (27,65/15,76), räntetäckning 8,79, debt/EBITDA 2,86, Altman Z 3,07, Piotroski F 6; effektiv skatt 30,59 %; utdelning 1,73 GBP (3,73 %, källans payout 45,85 % på egen EPS-bas 3,77 — egen kvot 47,5 % dokumenterad), tillväxt −3,77 % YoY (rebasningen efter glasavknoppningen), 1 tillväxtår, ex-div 2026-08-06; återköpsyield 4,18 %, shareholder yield 7,91 %; beta 0,45 (5Y), 52-v 3 644–5 542 (−9,90 % på året); institutions 76,18 %, insiders 0,03 %; analytiker Hold PT 5 263,43 GBX (+13,90 %; 16 analytiker); anställda 93 733; nästa rapport 2026-10-23; grundat 1860; reverse split 0,8889 2025-12-09 (glasavknoppningens aktiekonsolidering — källans notis); RAPPORTVALUTA EUR (RACE/BUD-spegeln på LSE-ytan): FY-serier i EUR (M) kalenderår: rev 52 444→60 073→51 680→52 479→50 503 (FY2021→FY2025 — FY2022 inkluderar glassen, FY2023+ continuing-bas: scope-brottet −13,97 % 'fallet' 2023 är reklassificeringen; FY2025 −3,77 % bär glasseXIT + avyttringar), netto 6 049→7 642→6 487→5 744→9 469 (FY2025 +64,9 % bär engångsposter), brutto 22 185→24 167→22 500→24 503→23 709; bruttomarginal 42,30→40,23→43,54→46,69→46,95 % (2022-botten = energikostnadstoppen; därefter pris-/mix-återhämtning fyra år); kassaflöde EUR (M): OCF 7 972→7 282→9 426→9 519→8 350, capex 1 108→1 456→1 194→1 381→1 417, FCF 6 864→5 826→8 232→8 138→6 933 (TTM 7 219); utdelningar betalda 4 483→4 329→4 363→4 319→4 453, återköp 3 018→1 509→1 507→1 508→1 510 (TTM 1 507/4 252); bransch Consumer Staples/Household & Personal Products källkonsekvent med konsument-grenen; källans nyhetsflöde: McCormick–Unilever foods-affär under UK CMA-granskning, varumärkesavyttringar (Zwitsal, Colman's), Indien som tillväxtmotor (Barclays-konferens)",
    },
  ],
  hamtat: "2026-09-18",
  pris: 4621,
  marknadsKapitalMdr: 99.5,
  tillvaxt: {
    omsattningCAGR5ar: -0.0562,
    resultatCAGR5ar: 0.074,
    omsattningTillvaxtTTM: 0.0023,
    prognosTillvaxt: 0.3026,
  },
  lonksamhet: {
    roe: 0.3187,
    roic: 0.1582,
    bruttoMarginal: 0.4707,
    ebitMarginal: 0.2003,
    nettoMarginal: 0.1832,
    fcfMarginal: 0.1426,
  },
  stabilitet: {
    skuldEgenkapital: 1.75,
    rantaTackning: 8.79,
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
    bruttoMarginalMedel5ar: 0.4394,
    bruttoMarginalSpread5ar: 0.0672,
    roeMedel5ar: null,
  },
  vardering: {
    pe: 21.05,
    pb: 6.31,
    evEbit: 13.86,
    peg: 0.7,
    fcfYield: 0.0625,
    egenKapitalMultipl: 6.31,
  },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2022", "2023", "2024", "2025"],
    omsattning: [60073000000, 51680000000, 52479000000, 50503000000],
    resultat: [7642000000, 6487000000, 5744000000, 9469000000],
    egetKapital: [],
    fcf: [5826000000, 8232000000, 8138000000, 6933000000],
  },
  notering:
    "STORBRITANNIEN/KONSUMENT-CELLENS FÖRSTA RAD (Storbritannien 2→4 samma omgång som GSK.L: HSBA.L finans · ARM teknik · GSK.L hälsa · ULVR.L konsument) och KONSUMENTGRENNENS STAPLES-ANKARE: grenen bär bryggerier (BUD/CARL-B/ABEV), bilar (MBG/BMW/VW/TM/VOLCAR), lyx (MC.PA/RACE), detaljhandel och livsmedel — men inget globalt FMCG-konglomerat; Unilever (400+ varumärken, grundat 1860) fyller luckan som öl-trions icke-cyklika spegel: brutto 47,1 % mot bryggeriernas 45–56 på platt intäkt. GLASAVKNOPPNINGENS ÄRVTGÅRD: Magnum-stammen lämnade 2025 (reverse split 0,8889 2025-12-09 = konsolideringen; rev FY2022 60 073 M€ INKLUDERAR glassen, FY2023 51 680 = continuing-bas — 'fallet' −13,97 % är reklassificering, Holcim-klassen) och foods-armen är på väg ut (McCormick-affären under CMA-granskning enligt källans nyhetsflöde); FY2025-nettot 9 469 M€ (+64,9 %) bär engångsposter — BAS-SPLITTRARN dokumenterad i tre ytor: P/E 21,05 kärnbas · GAAP 12,69 · EV/earnings 15,51. MARGINALEN BYGGS: brutto 40,23 % (2022, energikostnadstoppen) → 46,95 % (FY2025) = +6,7 pp pris-/mix-återhämtning (RACE-spegelbilden — staples-prissättningsmakten genom inflationencykeln; spreaden bär även scope-skiftet). KAPITALÅTERKOMSTEN SOM IDENTITET: utdelningar 4,5 mdr EUR/år järnstabila (4 483→4 329→4 363→4 319→4 453) + återköp ~1,5 mdr/år med återköpsyield 4,18 % — aktieantalet −4,18 % YoY, shareholder yield 7,91 % (payout 45,85 % källbas). BALANSRÄKNINGENS VARUMÄRKESSTRUKTUR: equity 15,76 mdr GBP mot mcap 99,50 (P/B 6,31) — goodwill-dominerat EK ger skuld/ek 1,75 och räntetäckning 8,79 trots stabil kassa; arbetskapital −6,46 mdr (staples-floaten: leverantörerna finansierar sortimentet — FMX/OXXO-släkten). FCF-valvet: 5,8→8,2→8,1→6,9 mdr EUR (TTM 7,2; yield 6,25 %) med OCF 9,5 mdr-topp 2024. ROIC 15,82 % mot WACC 5,82 % = +10,0 pp; ROE 31,87 % kärnbas (GAAP 50,6 % dokumenterat). KURSBILDET: beta 0,45, 52-v 3 644–5 542 (−9,9 % på året); PT 5 263 GBX Hold. LSE-primär med EUR-rapportvaluta (RACE/BUD-spegeln — statistics-TTM GBP-översatt, växelkurs ≈0,861 ur källans EPS-par). Nästa rapport 2026-10-23, ex-div 2026-08-06.",
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
if (!fanns.has("GSK.L")) { univers.push(GSK); tillagda.push("GSK.L"); }
if (!fanns.has("ULVR.L")) { univers.push(ULVR); tillagda.push("ULVR.L"); }

if (tillagda.length) {
  writeFileSync(FIL, JSON.stringify(univers, null, 1) + "\n");
  console.log(`APPEND: ${tillagda.join("+")} — universum ${fanns.size}→${univers.length}`);
} else {
  console.log(`IDEMPOTENT: GSK.L/ULVR.L redan på disk (${univers.length} rader) — inget skrivet`);
}
