#!/usr/bin/env node
// _s2u1o34-append.mjs — s2-u1 (manifest auto-s2-1790861711679) CELLTRION
// 068270.KS append till data/portfolj-system/bolagsunivers.json (328→329).
// Regler (omg29/omg32/omg33-konventionerna): mutex via mkdir-lås; append på
// diskens FAKTISKA läge (syskon kan ha skrivit); prefix-bit-identiskt bevis +
// läs-tillbaka ×2; idempotent; aritmetikgrind 48/48 GRÖN FÖRE detta skript.
import { readFileSync, writeFileSync, mkdirSync, rmdirSync } from "node:fs";
import { createHash } from "node:crypto";

const FIL = "data/portfolj-system/bolagsunivers.json";
const LAS = "/tmp/ak1a-s2u1o34-append.lock";

try { mkdirSync(LAS); } catch {
  console.log("MUTEX upptagen — annan append pågår. Avbryter (omkörning säker).");
  process.exit(2);
}
const lasBort = () => { try { rmdirSync(LAS); } catch {} };
process.on("exit", lasBort);
process.on("SIGINT", () => { lasBort(); process.exit(3); });
process.on("SIGTERM", () => { lasBort(); process.exit(3); });

const rå = readFileSync(FIL, "utf8");
const före = JSON.parse(rå);
if (före.some(r => r.ticker === "068270.KS")) {
  console.log("IDEMPOTENT: 068270.KS finns — inget skrivs.");
  process.exit(0);
}
const prefixHash = createHash("sha256").update(rå).digest("hex").slice(0, 16);
console.log(`Före: ${före.length} rader · prefix-sha256 ${prefixHash}`);

// ── raden (källa: StockAnalysis fem ytor krx-vägen, curl-html ordagrant
//    2026-10-01 14:16Z, S&P GMI-underlag; aritmetikgrind 48/48) ──────────────
const celltrion = {
  ticker: "068270.KS",
  namn: "Celltrion, Inc.",
  bransch: "halso",
  land: "Sydkorea",
  valuta: "KRW",
  kallor: [
    {
      namn: "StockAnalysis",
      hamtat: "2026-10-01",
      url: "https://stockanalysis.com/quote/krx/068270/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/)",
      paranoid:
        "KRX-PRIMÄRNOTING i KRW (krx-vägen bevisad av 005930-precedensen; S&P Global Market Intelligence-underlag; SA-html ordagrant via curl 2026-10-01 14:16Z — s2u2-metodfyndet: sammanfattningslagret kasseras): kurs 183 600 KRW (översiktens huvudtal i kursformat; PT-FALGROPEN dokumenterad: Price Target-raden bär 267 786,94 (+45,85 %) som vid första anblick liknar en kurs — triangulering tre vägar: mcap/aktier 41,94T/228,43 M = 183 779 (0,10 % band) · P/E×EPS 26,84×6 840,22 = 183 583,7 (0,009 %) · day's range 178 200–184 200 + prev close 177 700 innesluter; under MA50 186 142 och MA200 188 910), mcap 41,94T KRW, aktiebas 228,43 M statistics (FILING-basen 240 M — splittran dokumenterad; split Jun 4 2026 forward 1:1,05; aktiebas −1,80 %/år), STATISTICS: P/E 26,84 = 183 600/6 840,22 replik 0,005 % · fwd 29,59 (⇒ prognosTillväxt −9,29 % implicit — fwd ÖVER trailing: marknaden prissatter NEDATGÅENDE EPS efter TTM-toppåret +220,3 %; källans 3-års EPS-prognos +24,94 %/år som kontrast-not — spannet är biosimilar-konkurrensens prissättning), PEG 1,07 (källans bas 25,08 % ≈ EPS-prognosen 24,94 — dokumenterad), P/B 2,32 = mcap/EK-total 41,94T/18,048T (källans bas; replik 2,3238) · P/TBV 7,85 = pris/(TBV/aktiebas) 183 600/23 377,6 replik EXAKT 0,04 % — tre baser dokumenterade: PB på total-EK, P/TBV på TBV/nuvarande aktier, BVPS-fältet 74 595,25 på common-EK/filing-aktier (17 902 769/240 EXAKT 0,001 %), EV 44,69T med IDENTITETEN mcap 41,94 + skuld 3,8667 − kassa 1,2582 + minoritet 0,1454 = 44,694 EXAKT 0,009 % (ENI-konventionen), EV/EBIT 29,13 källans fält (replik på EV-identiteten 28,91 — 0,75 % källspridning dokumenterad), EV/Earnings 28,36 replik EXAKT, EV/EBITDA 24,46 · EV/Sales 9,13 · EV/FCF 54,30, D/E 0,21 = 3 866 738/18 048 160 = 0,2142 (tjödecimalsfältet) · räntetäckning 16,46 · Debt/EBITDA 2,10 · current 1,36 · quick 0,68, ROE 9,11 % källans fält (replik netto/EK-slut 8,73 % — källans medel-EK-bas, spannet dokumenterat; fältet bärs) · ROA 4,37 · ROIC 6,65 % mot WACC 5,60 = +1,05 pp (trångt positivt — CAPM-strukturens klass) · ROCE 8,31, marginaler TTM: brutto 61,86 % = 3 029 878/4 897 805 EXAKT · EBIT 31,56 % EXAKT · netto 32,18 % EXAKT · FCF 16,80 % EXAKT — FCF 823 072 = OCF 995 898 − capex 172 827 EXAKT, fcfYield 1,96 % = 823 072/41,94T, utdelning 714,29 KRW/år (0,39 %) · payout 10,65 % (källans bas; DPS/EPS-replik 10,44 % — aktiebas-världarnas splittran dokumenterad) · FCF-payout 19,82 % · buyback 1,80 % ⇒ shareholder yield 2,19 %, insiders 4,84 % · institutioner 20,05 % · float 151,10 M, skatt 214 760 M / 11,96 % (Koreas skattereduktion för bioteknik), beta 0,30 (5Y) · 52v +7,60 % (158 500–239 048) · RSI 51,70, Altman 5,13 · Piotroski 5, analytiker Buy PT 267 786,94 (+45,85 %) av 22 · rev-prognos 3 år +19,02 %/år, anställda 2 956 (rev/anställd 1,66 mdr KRW · vinst/anställd 533 M), FY kalenderår · nästa rapport 2026-11-13 (SA:s est.-fält), FY-SERIER (M KRW): rev 1 893 401→2 283 967→2 176 432→3 557 304→4 162 495 (+21,77 %/år 2021→25; TTM 4 897 805 = +17,66 % mot FY2025 mallens bas — källans eget TTM/TTM-fält +30,64 % dokumenterad), netto 579 465→537 836→535 648→422 692→1 029 613 (+15,45 %/år; TTM 1 576 119 — FY2024-botten 422 692 med EBIT-marginal 13,83 % är VÄNDNINGEN: TTM-netto 3,7× bottenåret på bruttomarginalens resa 45,21→61,86 %), EPS 3 472,89→3 258,27→3 273,16→1 786,67→4 438,10 (TTM 6 840,22), bruttomarginaler 57,44→45,21→48,33→47,27→59,27 (TTM 61,86 — spread 14,06 pp = prisklipps- och portföljmognadens båge, moat-fälten fyllda), EK-total 4 050 375→4 274 204→17 125 794→17 580 062→17 352 530 (FY2023-KVANTHOPPET = Celltrion Healthcare-fusionens konsolidering: goodwill 35 159→11 429 619 M, tillgångar 5,9T→20,0T — balansen femfjärdedelades, TBV-andelen sjönk), skuld 744 356→3 866 738 (5,2×; netto +475 545→−2 608 571 — SKULDVANDRINGEN: LT-utfärdande FY2025 3 386 234 MOT återköp 908 401 = LÅNEFINANSIERAD ÅTERKÖPSMOTOR), kassa 1 219 901→1 258 167, OCF 911 159→…→995 898 (FY2022-källcellen '863,53' trasig dokumenterad — identiteten FCF+capex = 864 stödjer), capex 63 379→172 827, FCF 847 780→−110 305→327 112→766 812→537 827 (TTM 823 072; FY2022 det negativa året: OCF-torka + inventariebygget 616 352→2 940 521 = 4,8× pandemi-antikroppsproduktionens nedmontering), utdelning betald 3,78→102 451→51 664→103 604→153 764 (TTM 167 847), återköp 39 126→908 401 (TTM 532 649)",
    },
    {
      namn: "Yahoo Finance (chart-API)",
      hamtat: "2026-10-01",
      url: "https://query1.finance.yahoo.com/v8/finance/chart/068270.KS?range=5d&interval=1d",
      paranoid:
        "paranoid kurskoll FÖRSÖKT ×3 (14:16Z query1, 14:19Z query2, 14:22Z query1): 'Too Many Requests' — 429-frekvensspärren, v173-klassens dokumenterade enhällsprotokoll mot S&P GMI. Kompenserad med intern triangulering (mcap/aktier 0,10 %-band · P/E×EPS 0,009 %-band · range-konsistens) — tre oberoende vägar innesluter huvudkursen 183 600 KRW",
    },
  ],
  hamtat: "2026-10-01",
  pris: 183600,
  marknadsKapitalMdr: 41940,
  tillvaxt: {
    omsattningCAGR5ar: 0.217,
    resultatCAGR5ar: 0.1545,
    omsattningTillvaxtTTM: 0.1766,
    prognosTillvaxt: -0.0929,
  },
  lonksamhet: {
    roe: 0.0911,
    roic: 0.0665,
    bruttoMarginal: 0.6186,
    ebitMarginal: 0.3156,
    nettoMarginal: 0.3218,
    fcfMarginal: 0.168,
  },
  stabilitet: {
    skuldEgenkapital: 0.21,
    rantaTackning: 16.46,
    fcfPositivaSenaste5: 4,
    kassaManaderBurnRate: null,
    nyemissionerSenaste5ar: null,
  },
  aterkop: {
    senasteArMdr: 153.764,
    andelUtestande: 0.0484,
    insiderkopSenaste6man: null,
  },
  moat: {
    bruttoMarginalMedel5ar: 0.515,
    bruttoMarginalSpread5ar: 0.1406,
    roeMedel5ar: null,
  },
  vardering: {
    pe: 26.84,
    pb: 2.32,
    evEbit: 29.13,
    peg: 1.07,
    fcfYield: 0.0196,
    egenKapitalMultipl: 2.32,
  },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2021", "2022", "2023", "2024", "2025"],
    omsattning: [1893401000000, 2283967000000, 2176432000000, 3557304000000, 4162495000000],
    resultat: [579465000000, 537836000000, 535648000000, 422692000000, 1029613000000],
    egetKapital: [4050375000000, 4274204000000, 17125794000000, 17580062000000, 17352530000000],
    fcf: [847780000000, -110305000000, 327112000000, 766812000000, 537827000000],
  },
  notering:
    "universumets FÖRSTA Sydkorea/häLSO-rad och landets ANDRA gren (Samsung+SK hynix = teknik; hälsans 33 rader saknade hela KRX-världen) — könotisen från omg33:s u3 löst: 'Sydkorea 2 KRX-vägen bevisad ×1'; ARKETYPEN BIOSIMILAR-PIONJÄREN: grundat 2002 i Incheon (allmän faktakunskap, NTT-precedensen), världens största rena biosimilar-tillverkare (Remsima/CT-P13 — världens första monoklonala antikropps-biosimilar) = 'molekylen efter patentet' som pedagogisk motpol till originator-jättarna: lägre pris, lägre risk, lägre marginal — OCH TVÅ OMVÄNDA SIGNATURER MOT ORIGINATOR-LÄROMEDLEN: (1) bruttomarginalens RESA 45,21→61,86 % är uppåtgående medan originatorernas är platt hög — biosimilar-mognaden (portföljen i prisklipps- och konkurrensbalans) Är moat-historien, spread 14,06 pp dokumenterad; (2) FÖRLUSTÅRET FY2022 FCF −110 305 M KRW medan NETTOT hölls 537 836 — pandemi-antikroppsproduktionens nedmontering bands i KASSAFLÖDET (inventarier 616→2 941 Mdkr = 4,8×) inte i resultaträkningen: OCF-torka som vinstår (5/5 positiva nettoår mot 4/5 FCF-år — vinst/kassa-gapets läroboksexempel); FY2023-KVANTHOPPET: Celltrion Healthcare-fusionen (goodwill 35→11 430 Mdkr, tillgångar 5,9→20,0 T) — köpdiffusen blev 2/3 av substansen (P/TBV 7,85 mot P/B 2,32: substansen är köpta rättigheter, ej maskiner); SKULDVANDRINGEN 744 356→3 866 738 M KRW (5,2×) med netto +475→−2 609: LT-utfärdandet FY2025 3 386 234 i samma rör som återköpen 908 401 — LÅNEFINANSIERAD ÅTERKÖPSMOTOR (aktiebas −1,8 %/år, räntetäckning 16,46 bär trycket) medan kapex bara 172 827: balansväxeln mot aktiägaravkastning (shareholder yield 2,19 %); VÄNDNINGEN FY2024: netto-botten 422 692 (EBIT-marginal 13,83 %) → TTM 1 576 119 = 3,7× på två år — och marknadens svar: fwd P/E 29,59 ÖVER trailing 26,84 (prognosTillväxt −9,29 % prissatt) medan källans analytikerpanel Buy 22 st PT +45,85 %: KONSOLIDERINGENS TWO-ROOM — kortsiktigt fallande EPS mot långsiktig expansionsprognos (rev-prognos +19,02 %/år), dokumenterat utan slutsats; TTM-tillväxt-notisen: +17,66 % mallens TTM/FY-bas mot källans +30,64 % TTM/TTM (båda dokumenterade); skatten 11,96 % (bioteknik-reduktion); 52-v +7,60 % under MA50+MA200; ex-div Dec 29 2025; rapport i KRW, räkenskapsår kalenderår; nästa rapport 2026-11-13",
};

// ── append: textuell, prefix-bit-identisk ────────────────────────────────────
const klippt = rå.replace(/\]\n?$/, "");
const ser = (rad) => JSON.stringify(rad, null, 2).split("\n").map(l => (l ? "  " + l : l)).join("\n");
const ny = `${klippt},\n${ser(celltrion)}\n]\n`;

// verifiera FÖRE skrivning: prefix-bevis + giltighet + antal
const gamlaBuf = Buffer.from(rå, "utf8");
const nyaBuf = Buffer.from(ny, "utf8");
if (!nyaBuf.slice(0, klippt.length).equals(gamlaBuf.slice(0, klippt.length)))
  throw new Error("PREFIX-BEVIS FÖRKASTAT — klipp ej bitidentiskt");
const efter = JSON.parse(ny);
if (efter.length !== före.length + 1) throw new Error(`antal ${efter.length} ≠ ${före.length + 1}`);
if (efter[före.length].ticker !== "068270.KS") throw new Error("sista raden fel");
// källvärdes-identiteter (dubbelstängning mot grinden)
if (efter[före.length].vardering.pe !== 26.84 || efter[före.length].serier.resultat[4] !== 1029613000000)
  throw new Error("CELLTRION-fält verifiering misslyckad");
if (efter[före.length].serier.fcf[1] !== -110305000000 || efter[före.length].vardering.pb !== 2.32)
  throw new Error("CELLTRION-fält verifiering misslyckad (runda 2)");

writeFileSync(FIL, ny);

// läs-tillbaka ×2 (omg30-konventionen)
for (let i = 1; i <= 2; i++) {
  const tb = readFileSync(FIL, "utf8");
  const tbr = JSON.parse(tb);
  const tbPrefix = tb.slice(0, klippt.length);
  console.log(`läs-tillbaka ${i}: ${tbr.length} rader · prefix bitidentisk ${tbPrefix === rå.slice(0, klippt.length) ? "JA" : "NEJ"} · sista ${tbr[tbr.length - 1].ticker}`);
}
const efterHash = createHash("sha256").update(readFileSync(FIL)).digest("hex").slice(0, 16);
console.log(`EFTER: ${efter.length} rader · ny sha256 ${efterHash} (före ${prefixHash})`);
console.log(`Sydkorea: ${efter.filter(r => r.land === "Sydkorea").map(r => r.ticker).join("·")}`);
console.log(`halso n=${efter.filter(r => r.bransch === "halso").length}`);
console.log(`syskonkoll — nya tickrar sedan 328: ${efter.length - 328} (syskon levererat under mitt fönster syns här)`);
