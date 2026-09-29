#!/usr/bin/env node
// _s2u2o32-append.mjs — s2-u2 (omg 32) KINA-DUBLING BIDU+NTES append till
// data/portfolj-system/bolagsunivers.json.
// Regler (omg29-u3/omg30-konventionerna): mutex via mkdir-lås; append på
// diskens FAKTISKA läge; prefix-bit-identiskt bevis + läs-tillbaka ×2;
// idempotent (redan-appendat => exit 0, inget skrivs); aritmetikgrinden
// 56/56 GRÖN FÖRE detta skript (kördes separat, protokollfört).
import { readFileSync, writeFileSync, mkdirSync, rmdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";

const FIL = "data/portfolj-system/bolagsunivers.json";
const LAS = "/tmp/ak1a-s2u2o32-append.lock";

// ── mutex (omg29-u3:s clobber-läxa) ─────────────────────────────────────────
try { mkdirSync(LAS); } catch {
  console.log("MUTTEX upptagen — annan append pågår. Avbryter (omkörning säker).");
  process.exit(2);
}
const lasBort = () => { try { rmdirSync(LAS); } catch {} };
process.on("exit", lasBort);
process.on("SIGINT", () => { lasBort(); process.exit(3); });
process.on("SIGTERM", () => { lasBort(); process.exit(3); });

const rå = readFileSync(FIL, "utf8");
const före = JSON.parse(rå);
if (före.some(r => r.ticker === "BIDU" || r.ticker === "NTES")) {
  console.log(`IDEMPOTENT: ${före.find(r => r.ticker === "BIDU") ? "BIDU" : "NTES"} finns — inget skrivs.`);
  process.exit(0);
}
const prefixHash = createHash("sha256").update(rå).digest("hex").slice(0, 16);
console.log(`Före: ${före.length} rader · prefix-sha256 ${prefixHash}`);

// ── raderna (källor: StockAnalysis statistics+financials 2026-09-29 pålästa,
//    kurs close 2026-09-28 16:00 EDT S&P GMI-bas; Yahoo chart-API band 0,00 %
//    EXAKT båda; aritmetikgrind 56/56) ────────────────────────────────────────
const bidu = {
  ticker: "BIDU",
  namn: "Baidu, Inc.",
  bransch: "teknik",
  land: "Kina",
  valuta: "USD",
  kallor: [
    {
      namn: "StockAnalysis",
      hamtat: "2026-09-29",
      url: "https://stockanalysis.com/stocks/bidu/",
      paranoid: "statistics + financials (underlag S&P Global Market Intelligence; kurs close 2026-09-28 16:00 EDT, sidor pålästa 2026-09-29): pris, börsvärde, EV, P/B–EV/EBIT–EV/EBITDA, marginaler, ROE/ROIC/WACC, skuld/EK, FCF, 5 räkenskapsår FY2021–FY2025 (kalenderår) — financials i CNY (koncernrapportvaluta) medan kurs/mcap/TTM-derivat i USD enligt ADR-konventionen (BABA-precedensen); Yahoo chart-API paranoid 86,97 = 0,00 % band EXAKT",
    },
  ],
  hamtat: "2026-09-29",
  pris: 86.97,
  marknadsKapitalMdr: 29.72,
  tillvaxt: {
    omsattningCAGR5ar: 0.0091,
    resultatCAGR5ar: -0.1711,
    omsattningTillvaxtTTM: -0.0416,
    prognosTillvaxt: null,
  },
  lonksamhet: {
    roe: -0.0139,
    roic: 0.0344,
    bruttoMarginal: 0.4087,
    ebitMarginal: 0.0691,
    nettoMarginal: -0.037,
    fcfMarginal: -0.1009,
  },
  stabilitet: {
    skuldEgenkapital: 0.38,
    rantaTackning: 3.48,
    fcfPositivaSenaste5: 4,
    kassaManaderBurnRate: null,
    nyemissionerSenaste5ar: 0,
  },
  aterkop: {
    senasteArMdr: null,
    andelUtestande: null,
    insiderkopSenaste6man: null,
  },
  moat: {
    bruttoMarginalMedel5ar: 0.4855,
    bruttoMarginalSpread5ar: 0.0781,
    roeMedel5ar: null,
  },
  vardering: {
    pe: null,
    pb: 0.74,
    evEbit: 16.88,
    peg: null,
    fcfYield: -0.0637,
    egenKapitalMultipl: 0.68,
  },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2021", "2022", "2023", "2024", "2025"],
    omsattning: [124493000000, 123675000000, 134598000000, 133125000000, 129079000000],
    resultat: [9876000000, 6968000000, 19598000000, 23172000000, 4663000000],
    egetKapital: [],
    fcf: [9226000000, 17884000000, 25425000000, 13100000000, -15086000000],
  },
  notering:
    "universumets TREDJE KINA-RAD och teknik-grenens Kina-dubblering (TCEHY+BIDU) — Kinas internet-fyra arketyper nu tre i universumet: Alibaba (e-handel), Tencent (social/plattform), Baidu (sök+AI-moln): tre moat-modeller i EN ekonomi med samma ADR-valuta (USD) mot tre hemvalutor; ADR-konventionen (BABA-precedensen): kurs 86,97 $ och börsvärde 29,72 mdr $ i USD medan räkenskapsserierna FY2021–FY2025 (kalenderår — enklare än Alibabas april–mars) är i koncernrapportvalutan CNY; ANNONS-MASKINENS ANATOMI (FY2024-segment, M CNY): Online Marketing 72 972 = 55 % av omsättningen, Cloud 21 860, iQIYI-blocket 29 225 — sökannonsens kassaflöde finansierar AI-molnet och videoplattformen, tre affärsmodeller i en balansräkning; FÖRSTA KINA-RADEN MED NEGATIVT TTM-NETTO: pe satt till null med fwd P/E 12,69 i not (ELUX-precedensens null-konvention; prognosTillväxt null — trailing/fwd-konventionen kräver positivt trailing-P/E; källans 3-års EPS-prognos +3,04 %/år och kursmålsuppsidan +67,47 % av 32 analytiker som notiser); NETTOKOLLAPSENS ÅR: netto 9 876→6 968→19 598→23 172→4 663 M CNY (resCAGR −17,11 %/år; FY2025 −79,9 % från FY2024-topp) medan bruttomarginalen glider 48,47→48,36→51,69→50,35→43,88 % — intäktssidan håller (omsättning +0,91 %/år, TTM −4,16 %) men marginalerna bär omställningen; FCF-VÄNDSLINGAN: +9,2→+17,9→+25,4→+13,1→−15,1 mdr CNY där FY2025 är UNIVERSUMETS FÖRSTA exempel på negativt OPERATIVT kassaflöde (−3 013 M) under capex-trappan (10 896→8 286→11 190→8 134→12 073 M) — ORCL-/BABA-klassens AI-capex-år men ett steg djupare: driften själv förbrukar kassa (fcfYield −6,37 %, fcf-marginal replik −10,09 % mot källans CNY-rad −9,98); BALANSRÄKNINGENS KUDDE ändå HEL: nettokassa 7,85 mdr $ (kassa 24,47 mot skuld 16,62; 22,99 $/aktie; räntetäckning 3,48×) och EV 21,86 < mcap 29,72 — nettokassa-bolag; VÄRDERINGENS DUBBEL-BAS dokumenterad: P/B 0,74 (källans fält, BVPS-basen 86,97/117,81) mot egenkapitalmultipl 0,68 (mcap/EK 29,72/43,44) — skillnaden är aktiebasens dual-klass-struktur (EK/aktie 127,13 mot källans BVPS 117,81, 7,3 %), P/TBV 0,90; P/B 0,74 = rang 19/316 UNDER-BOOK-KVARTILEN medan EV/EBIT 16,88 på den nedtryckta EBIT-nämnaren (6,91 %) — multipelns två ansikten; ROIC 3,44 % MOT WACC 5,37 % = −1,93 pp (Kina-familjens andra värdeförstörande marginal — BABA −3,33; kompositens gemensamma drag: kapitalkostnaden betalad av marginalerna som ännu inte kommit); Altman 2,15 GRÅZON (INPEX-speglingen: formeln straffar, balansen bär); källans nettomarginal-fält −2,90 % mot repliken −3,70 % (NI −693,23 M$/rev 18,74 mdr $; CNY-financials TTM −3,70 stödjer repliken) — dokumenterad källspridning; utdelning SAKNAS, återköps-yield 1,74 % (aktiebasen −1,74 %/år) = enda återbäringskanalen; insider 19,86 % (Li-familjens grundblock), institutioner 43,88 %; beta 0,57, 52-vägers −33,78 %, RSI 34,37; RISKNOTIS (källans nyhetsflöde, inga slutsatser): securities class actions med klassperiod 18 nov 2025–17 aug 2026 kring AI-tillväxtuppgifter, anmälningsdeadline 13 nov 2026; nästa rapport 17 nov 2026 BMO (Q3); rapport i CNY, räkenskapsår kalenderår, NASDAQ-ADR",
};

const ntes = {
  ticker: "NTES",
  namn: "NetEase, Inc.",
  bransch: "konsument",
  land: "Kina",
  valuta: "USD",
  kallor: [
    {
      namn: "StockAnalysis",
      hamtat: "2026-09-29",
      url: "https://stockanalysis.com/stocks/ntes/",
      paranoid: "statistics + financials (underlag S&P Global Market Intelligence; kurs close 2026-09-28 16:00 EDT +4,88 % på dagen, sidor pålästa 2026-09-29): pris, börsvärde, EV, P/E–P/B–EV/EBIT, marginaler, ROE/ROIC/WACC, skuld/EK, FCF, utdelning, 5 räkenskapsår FY2021–FY2025 (kalenderår) — financials i CNY (koncernrapportvaluta) medan kurs/mcap/TTM-derivat i USD enligt ADR-konventionen (BABA-precedensen); ADR-FÖRHÅLLANDE 5:1 (1 ADR = 5 ordinaries) belagt i källans egna fält (EPS 7,48 $ = NI/ordinary 1,497 × 5; utdelning 2,92 $/ADR; nettokassa/aktie 7,48 $ och FCF/aktie 2,36 $ däremot per ordinary); Yahoo chart-API paranoid 121,04 = 0,00 % band EXAKT",
    },
  ],
  hamtat: "2026-09-29",
  pris: 121.04,
  marknadsKapitalMdr: 77.41,
  tillvaxt: {
    omsattningCAGR5ar: 0.0648,
    resultatCAGR5ar: 0.1896,
    omsattningTillvaxtTTM: 0.0631,
    prognosTillvaxt: 0.3211,
  },
  lonksamhet: {
    roe: 0.2037,
    roic: 3.6826,
    bruttoMarginal: 0.6715,
    ebitMarginal: 0.3523,
    nettoMarginal: 0.2788,
    fcfMarginal: 0.435,
  },
  stabilitet: {
    skuldEgenkapital: 0.07,
    rantaTackning: 122.84,
    fcfPositivaSenaste5: 5,
    kassaManaderBurnRate: null,
    nyemissionerSenaste5ar: 0,
  },
  aterkop: {
    senasteArMdr: 1.87,
    andelUtestande: null,
    insiderkopSenaste6man: null,
  },
  moat: {
    bruttoMarginalMedel5ar: 0.5921,
    bruttoMarginalSpread5ar: 0.1066,
    roeMedel5ar: null,
  },
  vardering: {
    pe: 16.17,
    pb: 3.07,
    evEbit: 8.95,
    peg: 0.50,
    fcfYield: 0.0976,
    egenKapitalMultipl: 3.06,
  },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2021", "2022", "2023", "2024", "2025"],
    omsattning: [87606000000, 96496000000, 103415000000, 105295000000, 112626000000],
    resultat: [16857000000, 19922000000, 29417000000, 29699000000, 33760000000],
    egetKapital: [],
    fcf: [12926000000, 15907000000, 21753000000, 28305000000, 28200000000],
  },
  notering:
    "universumets FJÄRDE KINA-RAD och konsument-grenens Kina-dubblering (BABA+NTES) — Kinas internet-fyra arketyper komplett pedagogik: Alibaba (e-handelns marginal-makt) mot NetEase (spelets och musikens): BABA brutto 38,6 % mot NTES 59,2 % i samma ekonomi, samma ADR-valuta, samma regulatoriska hemvist; ADR-FÖRHÅLLANDET 5:1 är universumets Första explicit belagda (källans egna fält bär beviset: EPS 7,48 $ per ADR = NI/ordinary 1,497 × 5 medan nettokassa 7,48 $/aktie och FCF 2,36 $/aktie är per ORDINARY — samma siffra 7,48 i två valutor-serier, pedagogisk fälla som noteras); BRUTTOTRAPPAN som signatur: 53,62→54,68→60,95→62,50→64,28 % fem raka år (spel+musiks marginal-elevatör; spread 10,66 pp = pågående förflyttning, universumets högsta brutto-familj med rang 218/292 — 0,15 pp under P75); FEM RAKA VINSTÅR 16 857→19 922→29 417→29 699→33 760 M CNY (resCAGR +18,96 %/år — LT-/hälso-arketypernas CAGR-klass) på omsättning +6,48 %/år: VINSTEN VÄXER TRE GÅNGER SNABBARE ÄN INTÄKTEN = marginalhistorien i en kvot; KASSAFÄSTNINGEN: nettokassa 23,96 mdr $ = 31 % av börsvärde (kassa 25,82 mot skuld 1,86), D/E 0,07, räntetäckning 122,84×, Altman 8,53 universumets topp — fästningsbalansen medan P/B 3,07 ändå betalar premie; ROIC-FÄLTETS ARTEFAKT dokumenterad: källans 368,26 % beror på negativt investerat kapital (EK 25,26 − kassa 25,82 = −0,56 mdr $) — fältet speglas men bär ingen information; lönsamheten bär ROE 20,37 % MOT WACC 8,44 % = +11,93 pp (Bharti +10,54 / Sun Pharma +14,08 — tillväxtmarknadens breda moat-gap-familj); VÄRDERINGENS GÖMSTA VÄG: P/E 16,17 UNDER universummedianen 19,8 (rang 112/306) och EV/EBIT 8,95 rang 31/291 botten-kvartilen — EBIT-marginal 35,23 % + fcfYield 9,76 % till substanspris; prognosTillväxt +32,11 % på spårets trailing/fwd-konvention (16,17/12,24; källans 3-års EPS-prognos +10,83 %/år och PEG-fältet n/a som noter; spårets PEG 0,50); ÅTERBÄRINGENS PARADOX: FCF-payout 123,78 % — utdelningen (2,92 $/ADR, yield 2,41 %, 4 år tillväxt, payout 38,96 % av netto) ÖVERSTIGER ÅRETS FCF medan FCF-serien är 5/5 positiv (12,9→28,2 mdr CNY; FY2024-topp 28 305 och FY2025 −0,4 %) — kassabergets avkastning finansierar mellanskillnaden; shareholder yield 2,03 % (buyback-yield −0,39 % = netto-utspädning: aktiebasen växer lätt); insider 45,32 % (Ding Leis grundarkontroll — universumets näst högsta insider-andel av de stora ADR:erna efter grundarfamiljerna), institutioner 34,31 %; beta 0,79, 52-vägers −18,01 %, RSI 52,58; kurs 121,04 +4,88 % på hämtdagen (närmaste match i universumet till ett starkt_enkel_dagssvar i otherwise svag Kina-vy); senaste rapport 20 aug 2026 (Q2), ex-div 3 sep 2026, split 2:1 (2020-10-02, ADR); rapport i CNY, räkenskapsår kalenderår, NASDAQ-ADR",
};

// ── append: textuell, prefix-bit-identisk ────────────────────────────────────
const klippt = rå.replace(/\]\n?$/, "");
const ser = (rad) => JSON.stringify(rad, null, 2).split("\n").map(l => (l ? "  " + l : l)).join("\n");
const ny = `${klippt},\n${ser(bidu)},\n${ser(ntes)}\n]\n`;

// verifiera FÖRE skrivning: prefix-bevis + giltighet + antal
const gamlaBuf = Buffer.from(rå, "utf8");
const nyaBuf = Buffer.from(ny, "utf8");
if (!nyaBuf.slice(0, klippt.length).equals(gamlaBuf.slice(0, klippt.length)))
  throw new Error("PREFIX-BEVIS FÖRKASTAT — klipp ej bitidentiskt");
const efter = JSON.parse(ny);
if (efter.length !== före.length + 2) throw new Error(`antal ${efter.length} ≠ ${före.length + 2}`);
if (efter[före.length].ticker !== "BIDU" || efter[före.length + 1].ticker !== "NTES")
  throw new Error("sista två raderna fel ordning");
// källvärdes-identiteter (dubbelstängning mot grinden)
if (efter[före.length].vardering.pb !== 0.74 || efter[före.length].serier.resultat[4] !== 4663000000)
  throw new Error("BIDU-fält verifiering misslyckad");
if (efter[före.length + 1].vardering.pe !== 16.17 || efter[före.length + 1].aterkop.senasteArMdr !== 1.87)
  throw new Error("NTES-fält verifiering misslyckad");

writeFileSync(FIL, ny);

// läs-tillbaka ×2 (omg30-konventionen)
for (let i = 1; i <= 2; i++) {
  const tb = readFileSync(FIL, "utf8");
  const tbr = JSON.parse(tb);
  const tbPrefix = tb.slice(0, klippt.length);
  console.log(`läs-tillbaka ${i}: ${tbr.length} rader · prefix bitidentisk ${tbPrefix === rå.slice(0, klippt.length) ? "JA" : "NEJ"} · sista ${tbr[tbr.length - 2].ticker}+${tbr[tbr.length - 1].ticker}`);
}
const efterHash = createHash("sha256").update(readFileSync(FIL)).digest("hex").slice(0, 16);
console.log(`EFTER: ${efter.length} rader · ny sha256 ${efterHash} (före ${prefixHash})`);
console.log(`Kina: ${efter.filter(r => r.land === "Kina").map(r => r.ticker).join("·")}`);
console.log(`teknik n=${efter.filter(r => r.bransch === "teknik").length} · konsument n=${efter.filter(r => r.bransch === "konsument").length}`);
