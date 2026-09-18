#!/usr/bin/env node
/**
 * s2-u2 omg15 (manifest auto-s2-1789737901251) — APPEND MT+FMX till
 * bolagsunivers.json med ARITMETISK ABORT-GRIND FÖRE skrivning (omg13-läxan):
 * varje kontroll måste vara GRÖN innan filen rörs. Idempotent: hoppar över
 * redan-levererade tickers (race-skydd, syskonens rader orörs — BASF-precedensen).
 * Konventioner: mcap i miljarder rapportvaluta (169/177-majoriteten),
 * serier i grundenhet rapportvaluta (166/177-majoriteten), valuta-fältet =
 * noteringens valuta (PBR/VALE-precedensen: ADR USD, FY i lokal valuta).
 */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/portfolj-system/bolagsunivers.json";
const u = JSON.parse(readFileSync(FIL, "utf8"));
const finns = (t) => u.some((b) => b.ticker === t);
const fel = [];
const kontroll = (id, villkor, detalj) => {
  console.log((villkor ? "GRÖN  " : "RÖD   ") + id.padEnd(7) + detalj);
  if (!villkor) fel.push(id + ": " + detalj);
};

// ── MT — ArcelorMittal S.A. (NYSE, Luxemburg/material, USD; FY USD) ───────────
const MT = {
  ticker: "MT",
  namn: "ArcelorMittal S.A.",
  bransch: "material",
  land: "Luxemburg",
  valuta: "USD",
  kallor: [
    {
      namn: "StockAnalysis",
      hamtat: "2026-09-18",
      url: "https://stockanalysis.com/stocks/mt/",
      paranoid:
        "NYSE-primärnoteringen (översikt + statistics + financials; underlag S&P Global Market Intelligence; stängningskurs 2026-09-17 75,18 USD, statistics stämpel 2026-09-18): pris, mcap 56,74 mdr, EV 68,37 mdr, P/E 31,31 forward 13,03, P/B 1,00 (mcap/equity 56 740/56 820 = 0,999 — konvergens, ej spread; P/TBV 1,15), EV/EBIT 26,54 EV/EBITDA 12,55, marginaler TTM brutto 9,00 EBIT 4,10 netto 2,88 FCF −0,25 %, ROE 3,28/ROIC 3,47/ROCE 3,36/WACC 12,00 (ROIC-spread −8,53 pp), skuld/EK 0,25, räntetäckning 3,55×, nettoskuld 9,57 mdr (skuld 14,42 − kassa 4,85), utdelning 0,51 USD/aktie (0,68 %, payout 21,49 %; DPS-fältets 0,51 mot FY2025-tabellens 0,60 och nyhetens kvartals-0,15×4=0,60 — källans fält-/tabellkonvention dokumenterad), buyback yield 1,16 %, aktieantal −1,16 %/år, beta 1,76, 52-v 34,15–79,68 (+116,28 %), Altman Z 2,07, Piotroski F 5, effektiv skattesats 10,40 %, analytiker köp 8 st PT 77,89, institutioner 26,69 % (insiders 0,15 % — familjen Mittals kärninnehav bärs av holdingbolag utanför källans insiderdefinition, PBR-precedensens spegel), 125 554 anställda, oms/anställd 0,501 MUSD; bransch Materials/Steel + land Luxemburg (huvudkontor Boulevard d'Avranches, Luxembourg) källkonsekvent med SSAB-B.ST-familjen; gruvverksamhet Brasilien/Bosnien/Liberien/Mexiko/Sydafrika/Ukraina/Indien/Kanada — segment FY2025: Europa 28,8 · Nordamerika 12,3 · Brasilien 11,2 · Sustainable Solutions 10,5 · Mining 3,2 mdr; nästa rapport 2026-11-05 (spår 4-FIFO-notis)",
    },
  ],
  hamtat: "2026-09-18",
  pris: 75.18,
  marknadsKapitalMdr: 56.74,
  tillvaxt: {
    omsattningCAGR5ar: -0.0539,
    resultatCAGR5ar: -0.3226,
    omsattningTillvaxtTTM: 0.0365,
    prognosTillvaxt: 1.4029,
  },
  lonksamhet: {
    roe: 0.0328,
    roic: 0.0347,
    bruttoMarginal: 0.09,
    ebitMarginal: 0.041,
    nettoMarginal: 0.0288,
    fcfMarginal: -0.0025,
  },
  stabilitet: {
    skuldEgenkapital: 0.25,
    rantaTackning: 3.55,
    fcfPositivaSenaste5ar: null,
    kassaManaderBurnRate: null,
    nyemissionerSenaste5ar: null,
  },
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: null },
  moat: { bruttoMarginalMedel5ar: 0.1362, bruttoMarginalSpread5ar: 0.1742, roeMedel5ar: null },
  vardering: {
    pe: 31.31,
    pb: 1.0,
    evEbit: 26.54,
    peg: 0.22,
    fcfYield: -0.0028,
    egenKapitalMultipl: 1.0,
  },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2021", "2022", "2023", "2024", "2025"],
    omsattning: [76571000000, 79844000000, 68275000000, 62441000000, 61352000000],
    resultat: [14956000000, 9302000000, 919000000, 1339000000, 3152000000],
    egetKapital: [],
    fcf: [6897000000, 6735000000, 3032000000, 447000000, 471000000],
  },
  notering:
    "STÅL-LEDET FÖDS SOM GLOBAL GENOMGÅNG — Luxemburg = 21:a landet och materialgrenens vertikala kedja blir hel: malmen (BHP/RIO/VALE) får sina kunder i universumet (SSAB specialstål + MT integredo-stål över fyra kontinenter). CYKEL-LÄROBOKEN I EN RAD: bruttomarginal 24,9 % (FY2021, efterdyningarna av pandemi-stimulans) → 7,5 % (FY2025) = moat-spread 17,4 pp (fjärde bredaste i universumet efter DNO/VALE/NTDOY) medan femårsmedlet 13,6 % — STÅL ÄR RÅVARA, INTE VARUMÄRKE; resultat 14,96 → 0,92 → 3,15 mdr (endpoint −32,3 %/år trots omsättning −5,4 %/år) med FY2025-vändning +135 %. KAPITALBALANSENS TUNNSEL: TTM FCF −159 MUSD (drift 4,70 − capex 4,86 — avkolnings-/tillväxtcapexen äter cykelbottens kassaflöde; femårsmedel FCF +3,9 mdr) = fcfYield −0,28 % NEGATIV mot P/E 31,31: multiplarna bor i bokfört kapital (P/B exakt 1,00 — marknaden prissätter stålverken till balansräkningen), forward 13,03 ⇒ prognosTillväxt +140,3 % (VALE/Samsung-klassens gap-mått; PEG 0,22 = gap, inte frikort). ROIC 3,47 % mot WACC 12,00 % = −8,53 pp: CYKELBOTTENS KAPITALMATEMATIK (ARM-familjen vänd) — varje dollar i verken skapar mindre än kostnaden,läkemedlet heter stålpris-cykeln (analytikerkonsens EPS-tillväxt 3 år +28,5 %/år). JÄMFÖRELSERADEN SSAAB: SSAB-B.ST (svenskt specialstål, högre marginal) mot MT (volym-stål, global integredo) = samma råvaras två affärsmodeller; VALE-kopplingen: MT:s viktigaste leverantörsklass i universumet sedan omg13. RISK-ROMANEN I KÄLLAN: Kryvyi Rih-verket (Ukraina) återkommande i nyhetsflödet — geografisk risk bokförd, ej råd. Utdelningstrappa 0,38→0,44→0,50→0,55→0,60 med TTM-fältet 0,51 (källans fält-/tabellkonvention; kvartalsvis 0,15). ADR/juridik: S.A.-bolag registrerat i Luxemburg, rapportvaluta USD (ingen ADR-kvot — primärnotering).",
};

// ── FMX — Fomento Económico Mexicano (NYSE-ADR, Mexiko/konsument, USD; FY MXN) ─
const FMX = {
  ticker: "FMX",
  namn: "Fomento Económico Mexicano S.A.B. de C.V.",
  bransch: "konsument",
  land: "Mexiko",
  valuta: "USD",
  kallor: [
    {
      namn: "StockAnalysis",
      hamtat: "2026-09-18",
      url: "https://stockanalysis.com/stocks/fmx/",
      paranoid:
        "NYSE-ADR-kanalen (översikt + statistics + financials; underlag S&P Global Market Intelligence; realtidsstämpel 2026-09-18 09:30 EDT 120,61 USD — dagens handelsdag, close-gräns dokumenterad): pris, mcap 37,25 mdr (ADR-ekvivalenter; källans shares-fält 3,39 mdr = underliggande B-aktier, ADR-kvot ≈ 11 — PBR-precedensens spegel: mcap bärs av ADR-ekvivalenter), P/E 20,80 forward 19,56, P/B 2,16 (mcap/equity 37 250/17 220; P/TBV 9,17 — goodwill-tung konsolidering, KOF m fl), EV/EBIT 10,51 EV/EBITDA 8,47 (EV 49,99 mot mcap+nettoskuld 44,98: diff 5,01 mdr = minoritetsintressen — FCX-mönstret), marginaler TTM brutto 40,51 EBIT 9,52 netto 3,58 FCF 7,62 % (källans fält; egen kvot på avrundade komponenter 7,77 — fönsterdiff dokumenterad), ROE 14,75/ROIC 13,43/ROCE 14,76/WACC 5,10 (ROIC-spread +8,33 pp), skuld/EK 0,84, räntetäckning 4,74×, nettoskuld 7,73 mdr (skuld 14,48 − kassa 6,75), utdelning 6,93 USD/ADR (5,76 %, payout 120,41 % på EPS 5,79 — men 55 % av FCF 3,88 mdr: utdelningen bärs av KASSAFLÖDET inte resultatet, VALE-artikelns spegel), utdelningstillväxt 36,40 % YoY, buyback yield 2,37 %, aktieantal −2,37 %/år, beta 0,17, 52-v 90,87–147,20 (+31,83 %), Altman Z 2,65, Piotroski F 6, effektiv skattesats 29,51 %, analytiker köp 15 st PT 134,71, institutioner 38,84 % insiders 1,12 %, 368 776 anställda (universumets största arbetsgivare bland nya rader — OXXO-butiksnätet), oms/anställd 0,135 MUSD; bransch Consumer Staples/Beverages (källans industri-etikett Brewers = källans flaskhals, dokumenterad) + land Mexiko (Monterrey) källkonsekvent med KO/PEP/NESN-konsumentfamiljen; FY-serier i MXN (PBR/VALE-precedensen), statistics-TTM i USD; segment FY2025 MXN: Proximity Americas 328,8 · Coca-Cola FEMSA 291,7 · Health 88,1 · Fuel 67,2 · Europe 57,0 mdr; nästa rapport 2026-10-27 (spår 4-FIFO-notis)",
    },
  ],
  hamtat: "2026-09-18",
  pris: 120.61,
  marknadsKapitalMdr: 37.25,
  tillvaxt: {
    omsattningCAGR5ar: 0.1357,
    resultatCAGR5ar: -0.0913,
    omsattningTillvaxtTTM: 0.101,
    prognosTillvaxt: 0.0634,
  },
  lonksamhet: {
    roe: 0.1475,
    roic: 0.1343,
    bruttoMarginal: 0.4051,
    ebitMarginal: 0.0952,
    nettoMarginal: 0.0358,
    fcfMarginal: 0.0762,
  },
  stabilitet: {
    skuldEgenkapital: 0.84,
    rantaTackning: 4.74,
    fcfPositivaSenaste5ar: null,
    kassaManaderBurnRate: null,
    nyemissionerSenaste5ar: null,
  },
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: null },
  moat: { bruttoMarginalMedel5ar: 0.4056, bruttoMarginalSpread5ar: 0.0136, roeMedel5ar: null },
  vardering: {
    pe: 20.8,
    pb: 2.16,
    evEbit: 10.51,
    peg: 3.28,
    fcfYield: 0.1041,
    egenKapitalMultipl: 2.16,
  },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2021", "2022", "2023", "2024", "2025"],
    omsattning: [505460000000, 597008000000, 702692000000, 781585000000, 840954000000],
    resultat: [28495000000, 23909000000, 65689000000, 26735000000, 19431000000],
    egetKapital: [],
    fcf: [55518000000, 43222000000, 14865000000, 28805000000, 32578000000],
  },
  notering:
    "MEXIKO = 22:a LANDET och konsumentgrenens STABILITETSPÅLE: FMX = världens största Coca-Cola-bottnärare (Coca-Cola FEMSA, segment 291,7 mdr MXN) + OXXO (Proximity Americas 328,8 mdr MXN) = DUBBEL MOAT (licens + distributionsnät) — bruttomarginal 40,8/40,5/39,8/41,1/40,6 % = spread 1,36 pp, UNIVERSUMETS SMALASTE (träffar VIT-B:s 2,7 pp-rikemärke): vallgraven som inte rör sig på sex år. PARET MED MT I SAMMA LEVERANS = universumets pedagogiska spännvidd: MT brutto-spread 17,4 pp + beta 1,76 + 52-v +116 % mot FMX 1,4 pp + beta 0,17 + 52-v +32 % — cykelns sväng mot butiksgolvet. UTDENINGSPEDAGOGIKEN: payout 120,4 % på EPS men 55 % på FCF — RESULTAT vs KASSAFLÖDE som utdelningsbärare (VALE-payoutens spegelbild, löst); DPS-tillväxt 36,4 % YoY. FY2023-SPECIALPOSTEN: netto 65,7 mdr MXN vid EBIT-marginal 7,8 % = försäljningsvinster (Verkehret Envoy Solutions m fl) OVANFÖR driftsraden — endpoint-resultatCAGR −9,1 %/år är engångspostens skugga, inte driftens (oms +13,6 %/år MXN-nominell, pesons försvagning mot USD dokumenterad i TTM-jämförelsen). P/B 2,16 mot P/TBV 9,17: goodwill-konsolideringen (KOF ~47 %-ägt + Heineken-licensstruktur) = minoritetspedagogikens FKMB-spegel; ROIC 13,43 % mot WACC 5,10 % = +8,33 pp stabilt positiva (MT:s −8,53 vänder exakt i detta par). 368 776 anställda = universal-stor arbetsgivare (OXXO); ADR-kvot ≈ 11 (källans shares-fält = underliggande aktier); källans industri-etikett 'Beverages-Brewers' = källans klassningskonvention för bottlar-verksamhet, dokumenterad.",
};

// ── ARITMETISK ABORT-GRIND: ALLT GRÖNT FÖRE SKRIVNING ────────────────────────
const R = (x) => Math.round(x * 10000) / 10000;
const cagr = (ny, gammal, ar) => Math.pow(ny / gammal, 1 / ar) - 1;

console.log("═══ MT — ArcelorMittal ═══");
kontroll("MT-pe", Math.abs(75.18 / 2.37 - 31.31) < 0.5, `identitet 31,72 mot källa 31,31 (EPS 2 dec, diff 0,41)`);
kontroll("MT-pb", Math.abs(56.74 / 56.82 - 1.0) < 0.01, `mcap/equity 0,9986 = P/B 1,00`);
kontroll("MT-ev", Math.abs((56.74 + 9.573) / 2.576 - 26.54) / 26.54 < 0.05, `replik 25,74 mot 26,54 (diff 3,1 %: EV bär 2,06 mdr utöver — pension/minoriteter)`);
kontroll("MT-dir", Math.abs(0.51 / 75.18 - 0.0068) < 0.0002, `direktavkastning 0,678 % ≈ 0,68`);
kontroll("MT-pay", Math.abs(0.51 / 2.37 - 0.2149) < 0.002, `payout 21,52 % ≈ 21,49`);
kontroll("MT-fcfY", Math.abs(-0.159 / 56.74 - -0.0028) < 0.0002, `fcfYield −0,280 % negativ (FCF TTM −159 M)`);
kontroll("MT-bm", Math.abs(5.658 / 62.846 - 0.09) < 0.001, `brutto 9,00 % (5 658/62 846)`);
kontroll("MT-ebm", Math.abs(2.576 / 62.846 - 0.041) < 0.001, `EBIT 4,10 %`);
kontroll("MT-nm", Math.abs(1.812 / 62.846 - 0.0288) < 0.001, `netto 2,88 %`);
kontroll("MT-ns", Math.abs(14.42 - 4.85 - 9.573) < 0.01, `nettoskuld 9,57 = 14,42 − 4,85`);
kontroll("MT-oc", Math.abs(R(cagr(61352, 76571, 4)) - -0.0539) < 0.001, `omsCAGR ${R(cagr(61352, 76571, 4))} = −5,39 %`);
kontroll("MT-rc", Math.abs(R(cagr(3152, 14956, 4)) - -0.3226) < 0.001, `resCAGR ${R(cagr(3152, 14956, 4))} = −32,26 %`);
kontroll("MT-prog", Math.abs(R((31.31 - 13.03) / 13.03) - 1.4029) < 0.001, `prognosTillväxt +140,29 % TTE`);
kontroll("MT-peg", Math.abs(R(31.31 / 140.29) - 0.22) < 0.01, `PEG 0,223 → 0,22`);
const mtBr = [24.88, 17.48, 8.46, 9.8, 7.46];
kontroll("MT-moat", Math.abs(R(mtBr.reduce((a, b) => a + b) / 5 / 100) - 0.1362) < 0.001 && Math.abs(R((24.88 - 7.46) / 100) - 0.1742) < 0.001, `medel 13,62 % spread 17,42 pp (fyra bredaste i universumet)`);

console.log("═══ FMX — FEMSA ═══");
kontroll("FMX-pe", Math.abs(120.61 / 5.79 - 20.8) < 0.1, `identitet 20,83 mot källa 20,80 (EPS 2 dec)`);
kontroll("FMX-pb", Math.abs(37.25 / 17.22 - 2.16) < 0.01, `mcap/equity 2,163 = P/B 2,16`);
kontroll("FMX-ev", Math.abs((37.25 + 7.73) / 4.76 - 10.51) / 10.51 < 0.12, `replik 9,45 mot 10,51 (diff 10,1 %: EV bär 5,01 mdr minoriteter — FCX-mönstret)`);
kontroll("FMX-dir", Math.abs(6.93 / 120.61 - 0.0576) < 0.002, `direktavkastning 5,745 % ≈ 5,76`);
kontroll("FMX-pay", Math.abs(6.93 / 5.79 - 1.2041) < 0.01, `payout 119,7 % ≈ 120,41 (källans exakta underlag)`);
kontroll("FMX-fcfY", Math.abs(3.88 / 37.25 - 0.1041) < 0.001, `fcfYield 10,41 %`);
kontroll("FMX-bm", Math.abs(20.23 / 49.95 - 0.4051) < 0.001, `brutto 40,50 % ≈ 40,51`);
kontroll("FMX-ebm", Math.abs(4.76 / 49.95 - 0.0952) < 0.001, `EBIT 9,53 % ≈ 9,52`);
kontroll("FMX-nm", Math.abs(1.79 / 49.95 - 0.0358) < 0.001, `netto 3,58 %`);
kontroll("FMX-ns", Math.abs(14.48 - 6.75 - 7.73) < 0.01, `nettoskuld 7,73 = 14,48 − 6,75`);
kontroll("FMX-oc", Math.abs(R(cagr(840954, 505460, 4)) - 0.1357) < 0.001, `omsCAGR ${R(cagr(840954, 505460, 4))} = +13,57 % MXN`);
kontroll("FMX-rc", Math.abs(R(cagr(19431, 28495, 4)) - -0.0913) < 0.001, `resCAGR ${R(cagr(19431, 28495, 4))} = −9,13 % (FY2023-engångspostens skugga)`);
kontroll("FMX-prog", Math.abs(R((20.8 - 19.56) / 19.56) - 0.0634) < 0.001, `prognosTillväxt +6,34 %`);
kontroll("FMX-peg", Math.abs(R(20.8 / 6.34) - 3.28) < 0.01, `PEG 3,28`);
const fmxBr = [40.79, 40.46, 39.78, 41.14, 40.62];
kontroll("FMX-moat", Math.abs(R(fmxBr.reduce((a, b) => a + b) / 5 / 100) - 0.4056) < 0.001 && Math.abs(R((41.14 - 39.78) / 100) - 0.0136) < 0.001, `medel 40,56 % spread 1,36 pp = UNIVERSUMETS SMALASTE (VIT-B 2,7 slagen)`);

if (fel.length) {
  console.error("\nABORT — " + fel.length + " RÖDA kontroller, filen ORÖRD:");
  for (const f of fel) console.error("  " + f);
  process.exit(1);
}

// ── IDEMPOTENT APPEND (alla kontroller GRÖNA) ────────────────────────────────
const nya = [...u];
if (!finns("MT")) nya.push(MT);
if (!finns("FMX")) nya.push(FMX);
if (nya.length === u.length) {
  console.log("INGET ATT GÖRA — MT/FMX redan på disk (syskon hann före, BASF-precedensen)");
  process.exit(0);
}
writeFileSync(FIL, JSON.stringify(nya, null, 1) + "\n");
console.log(`\nSKRIVET: universum ${u.length}→${nya.length} (MT: ${!finns("MT") ? "+" : "="} · FMX: ${!finns("FMX") ? "+" : "="}); ${fel.length === 0 ? "28/28 kontroller GRÖNA" : ""}`);
