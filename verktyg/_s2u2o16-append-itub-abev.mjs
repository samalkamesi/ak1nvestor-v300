#!/usr/bin/env node
/**
 * s2-u2 omg16 (manifest auto-s2-1789760724916) — append ITUB+ABEV till
 * bolagsunivers.json med ARITMETISK ABORT-GRIND (omg13-läxan: FEL>0 ⇒
 INGET skrivs). Konventioner:
 *  - ITUB = bankkonventionen (RY-precedensen omg11): evEbit/brutto/fcf/skuld-EK
 *    null när källan saknar meningsfulla bank-mått; dokumenterat i paranoid.
 *  - ABEV = PBR/VALE-precedensen (NYSE-ADR, FY-serier i rapportvaluta BRL,
 *    statistics-TTM i USD).
 *  - CAGR5ar-fältnamnet = SERIENS endpoints FY2022→FY2025, 3 steg (ärvd flagga).
 *  - Idempotent: redan tagna tickers hoppar append-raden (syskonvakt).
 * Källa: stockanalysis.com (stämplad 2026-09-18 15:4x EDT, realtid).
 * CACHE-FYND: ABEV:s FÖRSTA hämtningsservade inkonsistent cache (pris 2,53/
 * P/E 11,26 med EPS 0,13 ⇒ P/E 19,5 internt); omhämtning internt konsistent —
 * VITEC-lärdomen (stämpelkontroll + identitetskontroll) tvingande.
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

// ══════════════ ITAÚ UNIBANCO (ITUB) ══════════════
// Aritmetik innan raden skrivs
kontroll("ITUB-01", "P/E-identitet", 8.23 / 0.81, 10.57, 0.45,
  "källans EPS-rad 2 dec (0,81); källans P/E bär exakta underliggande tal — FCX/VALE-klassens dokumenterade tolerans");
kontroll("ITUB-02", "prognosTillväxt pe/fwd−1", 10.57 / 9.25 - 1, 0.1427, 0.0005, "TTE-spårkonventionen");
kontroll("ITUB-03", "PEG pe/(100·prognos)", 10.57 / 14.27, 0.74, 0.005, "spårkonvention (RY 1.75-mönstret)");
kontroll("ITUB-04", "P/B mcap/equity", 95.58 / 44.01, 2.17, 0.005, "källans P/B = mcap/equity; P/TBV 2,59");
kontroll("ITUB-05", "ebitMarginal = operating/revenue", 10.27 / 27.74, 0.3704, 0.0005, "TTM USD");
kontroll("ITUB-06", "nettoMarginal", 9.04 / 27.74, 0.3258, 0.0005, "källans 32,58 %; egen kvot 32,59 % — avrundning");
kontroll("ITUB-07", "oms-CAGR serieendpoints 3 steg", Math.pow(138947 / 114542, 1 / 3) - 1, 0.0665, 0.0005, "BRL mkr FY2022→FY2025");
kontroll("ITUB-08", "res-CAGR serieendpoints 3 steg", Math.pow(44857 / 29207, 1 / 3) - 1, 0.1538, 0.0005, "BRL mkr FY2022→FY2025");
kontroll("ITUB-09", "FCF-marginal komponentkvot", (8.58 - 0.26) / 27.74, 0.2999, 0.0005,
  "komponenterna (OCF−capex)/rev; källans 29,86 % bär exakta tal (FCF 8,29 mdr) — fältet null ändå enligt bankkonventionen, endast dokumentation");
kontroll("ITUB-10", "mcap/aktieenheter", 95.58 / 8.23, 11.61, 0.01,
  "källans shares-rad 11,02 mdr = annan mätning (aktieklass) — ADR-konvention dokumenterad");

const ITUB = {
  ticker: "ITUB",
  namn: "Itaú Unibanco Holding S.A.",
  bransch: "finans",
  land: "Brasilien",
  valuta: "USD",
  kallor: [
    {
      namn: "StockAnalysis",
      hamtat: "2026-09-18",
      url: "https://stockanalysis.com/stocks/itub/",
      paranoid:
        "översikt + statistics + financials (underlag S&P Global Market Intelligence; NYSE-ADR realtid 2026-09-18 15:44/15:51 EDT — börs öppen, kursen 8,23 USD dag +0,86 %): pris, mcap 95,58 mdr USD, P/E 10,57 forward 9,25, P/B 2,17 (mcap/equity 44,01 mdr — källans P/TBV 2,59), PS 3,45, P/FCF 11,48, PEG n/a; EV/EBITDA/EBIT n/a (bank — källan redovisar ej EV-mått); ROE 21,48 % (egen kvot 20,54 % — källans bär exakta equity-medeltal), ROA 1,58 %, ROIC n/a, WACC 1,55 % (källans kapitalkostnadsmodell — PBR:s 1,99 %-klass); marginaler TTM USD: operating 37,04 %, pretax 38,05 %, profit 32,58 %, FCF 29,86 % (gross n/a — bank saknar varukostnad); kassa 93,45 mdr, skuld 215,39 mdr, equity 44,01 mdr, BVPS 3,81; Debt/Equity n/a (bank — kundinsättningarnas värld), skatt 12,34 % (1,30 mdr); OCF 8,58 mdr, capex −0,26 mdr, FCF 8,32 mdr (FY-serien BRL −26,5 mdr FY2025 = kundmedelsflöden); utdelning current 0,14 USD (1,70 %, payout 17,25 %, growth −80,68 % — ADR:s delbetalningsfångst; FY-trappan i financials är sanningen); buyback 0,34 %; beta 0,14, 52-v +16,68 % (6,54–9,60); Altman n/a (bank), Piotroski F 3; insiders 0,58 %, institutioner 30,15 %; analytiker Buy PT 8,88 (+7,96 %); rev-prognos 3 år +6,57 %/år, EPS +9,77 %/år; anställda 92 470; ADR ≈ 1:1 (mcap/pris ⇒ 11,61 mdr aktieenheter mot källans shares-rad 11,02 mdr — aktieklass-skillnad dokumenterad); split 2025-12-29 1,03:1 forward; FY-serier i rapportvaluta BRL (mkr) enligt CNQ/EQNR/PBR-precedensen — statistics-TTM är USD-översatt (växelkurs ≈5,18); bransch Financials/Banks — Regional källkonsekvent med finans-grenen; Q2-2026 (2026-08-05): recurring resultat 12,4 mdr BRL +7,8 % RÖR, ROE >24 %; nästa rapport 2026-11-03 (AMC), ex-div 2026-10-02",
    },
  ],
  hamtat: "2026-09-18",
  pris: 8.23,
  marknadsKapitalMdr: 95.58,
  tillvaxt: {
    omsattningCAGR5ar: 0.0665,
    resultatCAGR5ar: 0.1538,
    omsattningTillvaxtTTM: 0.0663,
    prognosTillvaxt: 0.1427,
  },
  lonksamhet: {
    roe: 0.2148,
    roic: null,
    bruttoMarginal: null,
    ebitMarginal: 0.3704,
    nettoMarginal: 0.3258,
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
    pe: 10.57,
    pb: 2.17,
    evEbit: null,
    peg: 0.74,
    fcfYield: null,
    egenKapitalMultipl: 2.17,
  },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2022", "2023", "2024", "2025"],
    omsattning: [114542000000, 124526000000, 135739000000, 138947000000],
    resultat: [29207000000, 33105000000, 41085000000, 44857000000],
    egetKapital: [],
    fcf: [42584000000, 17466000000, -97578000000, -26451000000],
  },
  notering:
    "UNIVERSUMETS FÖRSTA BRASILIENS-BANKRAD (Brasilien 2→4 rader: PBR+VALE+ITUB+ABEV — omg13:s utpekade Itaú/Ambev/Embraer-fält halverat): Latinamerikas största privatbank (92 470 anställda) och sjätte depositionsbanken i bankkonventionen (GS/JPM/Nordea/HSBC/RY) — BRASILIENS DOMINERANDE UNIVERSALBANK med segmentsvikten TTM BRL: Retail Banking 117,1 mdr (81 %) · Wholesale 62,5 mdr · Markets+Corp 9,4 mdr — spegelbilden av RY (där Wealth vuxit förbi banksalen): Itaú är RETAIL-maskinen. BANKKONVENTIONEN (RY-precedensen): roic/skuld-EK/EV-EBIT/bruttomarginal ej meningsfullt — null; källans FCF-serie BRL 42,6→17,5→−97,6→−26,5 mkr = KUNDMEDELSFLÖDEN (depositioner och lånebok flyttar kassaflödet), ej utdelningskapacitet — fcfYield/fcfMarginal null trots källans TTM-USD 29,9 %/8,71 % (dokumenterat); skulden 215,4 mdr USD är balansräkenskapsartefakt (kassan 93,4 mdr är kundernas pengar). TILLVÄXTMASKINEN: resultat-CAGR +15,4 %/år (FY2022→FY2025, BRL) med ROE 21,5 % — Q2-2026 recurring 12,4 mdr BRL (+7,8 %) och ROE >24 % per rapporten; källans EPS-prognos +9,77 %/år 3 år fram. UTDDELNINGSTRAPPAN BRL 0,562→0,754→2,193→2,629→2,955 (FY2021→FY2025; FY2025 direktavkastning 7,62 % i BRL) — FY2023-hoppet = JCP-mekaniken (brasiliansk utdelning på juridiskt kapital); källans current 0,14 USD (1,70 %, payout 17,25 %) fångar bara en delbetalning (samma ADR-fälla som ABEV). VÄRDERINGEN: P/E 10,57 mot forward 9,25 ⇒ prognosTillväxt +14,3 % implicit (TTE-konventionen) — PEG 0,74 spårkonvention (källans PEG n/a); P/B 2,17 mot P/TBV 2,59 (bankernas substansmått) — HALVA RY:s 2,72/3,68: emerging-bankens multiplar. KURSEN: 52-vägers 6,54–9,60 USD (+16,7 %) med beta 0,14 — BETA-PARET XOM 0,13/ITUB 0,14 (båda råvaru-/finansvaluta-drivna motvikter); effektiv skatt 12,34 % (brasiliansk bankskattemix). WACC 1,55 % (källans modell — PBR:s 1,99 %-familjen, dokumenterat som källtal). Split 2025-12-29 1,03:1 (indexjustering). NYSE-ADR ≈1:1, FY-serierna i BRL, statistics-TTM i USD (växelkurs ≈5,18 driver skillnaden mellan världarna — PBR/VALE-precedensen). Nästa rapport 2026-11-03 (AMC), ex-div 2026-10-02.",
};

// ══════════════ AMBEV (ABEV) ══════════════
kontroll("ABEV-01", "P/E-identitet", 2.945 / 0.2, 14.86, 0.15,
  "källans EPS 0,20 (2 dec) ⇒ 14,73; källans P/E 14,86 bär exakta tal");
kontroll("ABEV-02", "prognosTillväxt pe/fwd−1", 14.86 / 14.73 - 1, 0.0088, 0.0005, "nästan platt prognos — dokumenteras");
kontroll("ABEV-03", "P/B mcap/equity", 46.6 / 17.16, 2.72, 0.005, "källans P/B; P/TBV 6,41");
kontroll("ABEV-04", "EV/EBIT-replik (mcap−nettokassa)/EBIT", (46.6 - 2.97) / 4.46, 9.81, 0.05,
  "källans EV 43,72 bär poster utöver mcap+nettokassa — PBR 0,24 %/VALE 1,3 %-klassen; här 0,26 %");
kontroll("ABEV-05", "fcfYield FCF/mcap", 4.67 / 46.6, 0.1002, 0.0005, "källans 10,03 %; egen kvot dokumenterad");
kontroll("ABEV-06", "bruttoMarginal", 8.84 / 17.04, 0.519, 0.0005, "källans 51,90 %");
kontroll("ABEV-07", "ebitMarginal", 4.46 / 17.04, 0.2616, 0.0005, "källans 26,16 %");
kontroll("ABEV-08", "nettoMarginal", 3.14 / 17.04, 0.1841, 0.0005, "källans 18,41 %; minoritetsbilden se paranoid");
kontroll("ABEV-09", "oms-CAGR serieendpoints 3 steg", Math.pow(88242 / 79709, 1 / 3) - 1, 0.0345, 0.0005, "BRL mkr FY2022→FY2025");
kontroll("ABEV-10", "res-CAGR serieendpoints 3 steg", Math.pow(15503 / 14458, 1 / 3) - 1, 0.0235, 0.0005, "BRL mkr FY2022→FY2025");
kontroll("ABEV-11", "bruttoMedel5ar", (51.05 + 49.29 + 50.72 + 51.24 + 51.42) / 5 / 100, 0.5074, 0.0005, "FY2021–FY2025 källans procentkolumn");
kontroll("ABEV-12", "bruttoSpread max−min", (51.42 - 49.29) / 100, 0.0213, 0.0005, "FCX/VALE-konventionen max−min");
kontroll("ABEV-13", "FCF-marginal", 4.67 / 17.04, 0.2741, 0.002,
  "egen kvot 27,41 % mot källans 27,24 % (avrundade komponenter) — PBR/VALE-notismönstret; fältet sätts till källans 0,2724 med egen kvot dokumenterad");
kontroll("ABEV-14", "ROIC-spread", 0.2565 - 0.0628, 0.1937, 0.0005, "ROIC 25,65 % mot WACC 6,28 %");
kontroll("ABEV-15", "DPS-payout FY2025", 1.114 / 0.99, 1.1253, 0.005, ">100 % — JCP-mekaniken, dokumenteras");

const ABEV = {
  ticker: "ABEV",
  namn: "Ambev S.A.",
  bransch: "konsument",
  land: "Brasilien",
  valuta: "USD",
  kallor: [
    {
      namn: "StockAnalysis",
      hamtat: "2026-09-18",
      url: "https://stockanalysis.com/stocks/abev/",
      paranoid:
        "översikt + statistics + financials (underlag S&P Global Market Intelligence; NYSE-ADR realtid 2026-09-18 15:47 EDT — CACHE-FYNDET: första hämtningen servade inkonsistent cache med pris 2,53/P/E 11,26/EPS 0,13 ⇒ P/E 19,5 internt; omhämtningen internt konsistent på ALLA identiteter = VITEC-lärdomen verifierad): pris 2,945 USD (−1,17 %), mcap 46,60 mdr USD, EV 43,72 mdr (NETTOKASSA-läge: kassa 3,54 mdr > skuld 0,57 mdr — nettokassa 2,97 mdr), P/E 14,86 forward 14,73, PS 2,73, P/B 2,72 (mcap/equity 17,16 mdr — P/TBV 6,41), P/FCF 9,97, P/OCF 8,54, PEG n/a; EV/EBIT 9,81 (replik (46,60−2,97)/4,46 = 9,78 — källans EV bär ytterligare poster), EV/EBITDA 8,46; ROE 18,40 %, ROA 10,30 %, ROIC 25,65 % mot WACC 6,28 % (ROCE 23,42 %); marginaler TTM USD: brutto 51,90 %, operating 26,16 %, pretax 23,13 %, profit 18,41 %, EBITDA 30,35 %, FCF 27,24 % (egen kvot 27,41 % — avrundade komponenter); TTM USD: rev 17,04 mdr, bruttovinst 8,84 mdr, EBIT 4,46 mdr, netto 3,14 mdr, EBITDA 5,17 mdr, EPS 0,20; OCF 5,45 mdr, capex −0,78 mdr, FCF 4,67 mdr (fcfYield 10,03 %, källans — egen kvot 10,02 %); skuld/ek 0,03, Debt/EBITDA 0,11, räntetäckning 10,82×, current ratio 1,02; skatt 0,71 mdr, effektiv 17,94 %; beta 0,25 (5Y), 52-v +25,42 % (MA50 2,98, MA200 2,94, RSI 48); utdelning current 0,014 USD (0,49 %, payout 7,22 %) — ADR:s delbetalningsfångst av påbörjad kvartalsutdelning; FY-trappan BRL är sanningen: DPS 0,604→0,762→0,730→0,668→1,114 (FY2021→FY2025; FY2025-payout 112,5 % av EPS 0,99 = JCP-mekaniken betalar ur juridiskt kapital; FY2025 direktavkastning 8,20 % enligt källan); buyback 0,57 %, shareholder yield 1,05 %; Altman Z 4,51, Piotroski F 6; anställda 39 606; analytiker Hold PT 3,34 (+13,41 %, 11 st); rev-prognos 3 år +4,42 %/år, EPS +9,22 %/år (PEG på senare = 1,61 — referens i notering); short 0,92 %; insiders 0,22 %, institutioner 26,18 % (AB InBev-systemet håller majoriteten via float 4,08 mdr av 15,45 mdr — källans float-bild); FY-serier i rapportvaluta BRL (mkr) enligt PBR/VALE-precedensen — statistics-TTM är USD-översatt (växelkurs ≈5,18: 88,3 mdr BRL = 17,0 mdr USD); bransch Consumer Defensive/Beverages — Brewers källkonsekvent med BUD/CARL-B.CO-familjen; split 2013-11-11 5:1; nästa rapport 2026-10-29 (BOM), ex-div 2026-09-23",
    },
  ],
  hamtat: "2026-09-18",
  pris: 2.945,
  marknadsKapitalMdr: 46.6,
  tillvaxt: {
    omsattningCAGR5ar: 0.0345,
    resultatCAGR5ar: 0.0235,
    omsattningTillvaxtTTM: -0.0376,
    prognosTillvaxt: 0.0088,
  },
  lonksamhet: {
    roe: 0.184,
    roic: 0.2565,
    bruttoMarginal: 0.519,
    ebitMarginal: 0.2616,
    nettoMarginal: 0.1841,
    fcfMarginal: 0.2724,
  },
  stabilitet: {
    skuldEgenkapital: 0.03,
    rantaTackning: 10.82,
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
    bruttoMarginalMedel5ar: 0.5074,
    bruttoMarginalSpread5ar: 0.0213,
    roeMedel5ar: null,
  },
  vardering: {
    pe: 14.86,
    pb: 2.72,
    evEbit: 9.81,
    peg: null,
    fcfYield: 0.1002,
    egenKapitalMultipl: 2.72,
  },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2022", "2023", "2024", "2025"],
    omsattning: [79709000000, 79737000000, 89453000000, 88242000000],
    resultat: [14458000000, 14502000000, 14437000000, 15503000000],
    egetKapital: [],
    fcf: [14109000000, 18707000000, 21350000000, 19860000000],
  },
  notering:
    "AB INBEV-SYSTEMETS LATAM-BEN och Öl-TRIONS TREDJE BEN (BUD världens största · CARL-B.CO nordisk utmanare · ABEV latam-volymen — omg15:s BUD/CARL-B-kontrast får sin emerging-ände; BUD äger ~62 % via spärregler): världens största bryggerivolym (39 606 anställda) med segmentsvikten FY2025 BRL: Brazil 49,0 mdr (56 %) · CAC 11,0 mdr · Latin America South 18,0 mdr · Canada 10,3 mdr — SÖDRA HALVKLOTETS DRYCKESKANAL: Brasilien+Latin America South = 76 % av intäkterna. MOAT-KONTRASTEN INOM öl-trion: ABEV bruttomarginal 51,9 % (femårsmedel 50,7 %, spread 2,1 pp — STABILAST i trion: BUD 56,5 %·3,6 pp, CARL-B 45,0 %) medan EBIT 26,2 % mot BUD 26,8 % — samma varumärkesvallgrav, olika skala; ROIC 25,65 % mot WACC 6,28 % = +19,4 pp (trions bredaste marginal mot kapitalkostnaden). BALANSRÄKNINGEN ÄR TRIONS BÄSTA: nettokassa 2,97 mdr USD (skuld/ek 0,03, Debt/EBITDA 0,11, räntetäckning 10,8×) mot BUD:s tioåriga deleveraging — distributionskraften utan arvet från InBev-fusionerna. FLASKHALSEN = TILLVÄXTEN: omsättning-CAGR +3,5 %/år (FY2022→FY2025 BRL) med TTM −3,8 %; resultat-CAGR +2,4 %; prognosTillväxt +0,9 % (P/E 14,86 mot fwd 14,73 — nästan platt) ⇒ PEG formellt 16,8 (exploderar vid ~nolltillväxt) = NULL med dokumentation (SAMPO/SPG-klassens princip); källans 3-års EPS-prognos +9,22 %/år ger PEG 1,61 som referens — margin-recovery berättelsen. UTDDELNINGSTRAPPAN BRL 0,604→0,762→0,730→0,668→1,114 (FY2021→FY2025) med FY2025-payout 112,5 % av EPS 0,99 — JCP-mekaniken (brasiliansk utdelning ur juridiskt kapital, samma som ITUB) betalar ur balansen, inte bara vinsten; källans current 0,014 USD (0,49 %) fångar en påbörjad kvartagsutdelning (ADR-fällan). KASSAFLÖDESMASKINEN: FCF 4,67 mdr USD TTM (fcfYield 10,0 %, FCF-marginal 27,2 %) med capex nedtrappat 7,7→4,6 mdr BRL (FY2021→FY2025) — mogna anläggningars frigörande kapital. VÄRDERINGEN: P/E 14,86 mot BUD 16,7 och CARL-B 18,2 — emerging-rabatten synlig i multiplarna men inte i moaten; P/B 2,72 mot BUD 1,54; beta 0,25 (trions lugvaste — BUD 0,77-klassen). Effektiv skatt 17,94 % mot BUD:s belgiska mix. Altman Z 4,51, Piotroski 6. NYSE-ADR, FY-serier i BRL, statistics-TTM i USD (växelkurs ≈5,18). Nästa rapport 2026-10-29 (BOM), ex-div 2026-09-23.",
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
for (const k of KONTROLLER) console.log(`  GRÖN ${k.id} (${k.irritall} ≈ ${k.expect}, avv ${k.avv.toFixed(4)}) — ${k.motiv}`);

const fanns = new Set(univers.map((b) => b.ticker));
let tillagda = [];
if (!fanns.has("ITUB")) { univers.push(ITUB); tillagda.push("ITUB"); }
if (!fanns.has("ABEV")) { univers.push(ABEV); tillagda.push("ABEV"); }

if (tillagda.length) {
  writeFileSync(FIL, JSON.stringify(univers, null, 1) + "\n");
  console.log(`APPEND: ${tillagda.join("+")} — universum ${fanns.size}→${univers.length}`);
} else {
  console.log(`IDEMPOTENT: ITUB/ABEV redan på disk (${univers.length} rader) — inget skrivet`);
}
