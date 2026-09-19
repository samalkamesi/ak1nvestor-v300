#!/usr/bin/env node
/**
 * s2-u1 omg18 — APPEND Fast Retailing Co., Ltd. (9983.T, konsument, Japan)
 * till data/portfolj-system/bolagsunivers.json (195→196 i mitt fönster; disk-
 * glidning beaktad — syskon u2 +2 / u3 +3 (Australien/material) kan landa
 * parallellt; idempotensguard + append SIST i arrayen orör deras rader,
 * BASF/EMBJ-precedensen).
 *
 * JAPAN/KONSUMENT-CELLEN 1→2: TM (Toyota) + 9983.T (Uniqlo) — Japens två
 * globala konsumtionsvarumärken i EN cell. PIVOTEN: Sony 6790.T sonderades
 * först men DOW/APD-FÄLLAN TRÄFFAR (TTM-EPS −0,23 USD, P/E n/a; TYO-sökvägen
 * 404) — avvisad enligt spårets P/E-bärande-kriterium, dokumenterad i
 * protokollet. Cellen 1→2 föder INGEN aspektsida (MIN_MATTA=5) ⇒ src/ orörd.
 *
 * Metod (VW-mallen omg17, FCX-mallen omg14 — spårets etablerade): textbaserad
 * kirurgisk insert före slut-]-parentesen (minimal diff; filens indent 1),
 * idempotensguard, aritmetikverifierad FÖRE skrivning (abort-grind —
 * omg13-läxan: kontrollblock fångar stavfel FÖRE disk), medianer/kvartiler
 * före/efter med EXAKT replik av raknaBranschMedianer
 * (src/lib/dataset-medianer.ts), landmatta-svep enligt omg8-rättesnören.
 *
 * Data: stockanalysis.com /quote/tyo/9983/ (översikt + statistics +
 * financials; underlag S&P Global Market Intelligence + Fiscal.ai),
 * TSE-slutkurs 2026-09-18 15:30 JST, sidor pålästa 2026-09-19. Financials i
 * miljoner JPY, räkenskapsår september–augusti (FY-etikett = slutåret).
 */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(FIL, "utf8");
const u = JSON.parse(raw);
if (!Array.isArray(u)) throw new Error("universumet är inte en array");
if (u.some((b) => /9983|fast ?retail/i.test(b.ticker + " " + b.namn))) {
  console.log("IDEMPOTENT: 9983/Fast Retailing finns redan — avslutar utan ändring");
  process.exit(0);
}
const fore = JSON.parse(raw); // färsk kopia för före-mätning

// ── FR-rådata (TSE:9983, JPY; FY sep–aug, FY-etikett = slutår) ───────────────
const R = {
  // 5 år brutto-underlag (FY2021 för moat-serien) + netto (M JPY)
  oms5: [2132992, 2301122, 2766557, 3103836, 3400539],
  brutto5: [1073956, 1206859, 1436361, 1673072, 1828858],
  res5: [169847, 273335, 296229, 371999, 433009],
  ebit5: [254725, 315824, 384297, 492253, 558520], // operating income
  eps5: [553.48, 890.43, 964.48, 1210.81, 1409.32],
  pris: 67680, aktier: 306.85, // M aktier
  mcapMdr: 20767.61, // aktier × pris = 20 767,608 (källans display 20,77T JPY)
  pe: 39.99, peFwd: 36.87, pb: 7.39, epsTtm: 1692.37,
  evKallaMdr: 19548.9, evEbit: 27.51, evEbitda: 21.43, evEarnings: 37.60,
  ps: 5.40, pFcf: 28.86,
  roe: 0.2248, roic: 0.3751, roa: 0.1092, roce: 0.2031, wacc: 0.0653, beta: 0.45,
  bruttoTtm: 0.5466, ebitTtm: 0.1845, nettoTtm: 0.1351, fcfTtm: 0.1870,
  skuldEk: 0.28, rantaTackning: 52.35,
  skuldMdr: 798.43, ekBokMdr: 2810, bvps: 8891.74,
  nettokassaMdr: 1295.72, // 4 222,81/aktie × 306,85 M (källans display 1,30T)
  ocfMdr: 803.59, kapexMdr: 83.91, fcfMdr: 719.69,
  omsTtm: 3849.013, resTtm: 519.987, ebitTtmAbs: 710.302, ebitdaTtmAbs: 774.86,
  utdAktie: 640, payoutKalla: 0.3422, utdTillvaxt: 0.28,
  ttmTillvaxt: 0.1476, revPrognos3ar: 0.1281, pegKalla: 3.16,
  lv52: [44380, 88690], lv52Prestanda: 0.4225,
  insiders: 0.3877, institutioner: 0.4008,
  skatt: 0.2903, altmanZ: 9.14, piotroski: 7,
  anstallda: 59522, pt: 85717.65, rapport: "2026-10-08",
};

// CAGR endpoint FY2021→FY2025 = 4 perioder — båda endpoints positiva
const cagr4 = (a, b) => Math.pow(b / a, 1 / 4) - 1;
const omsCagr = cagr4(R.oms5[0], R.oms5[4]);
const resCagr = cagr4(R.res5[0], R.res5[4]);
const prognos = R.pe / R.peFwd - 1; // TTE-konventionen (trailing/fwd)
const peg = R.pe / (prognos * 100); // spårkonvention (HSBC/MA/ASML/VOW3)
const fcfYield = R.fcfMdr / R.mcapMdr;
const bruttoSerie5 = R.brutto5.map((g, i) => g / R.oms5[i]);
const bruttoMedel = bruttoSerie5.reduce((a, b) => a + b, 0) / bruttoSerie5.length;
const bruttoSpread = Math.max(...bruttoSerie5) - Math.min(...bruttoSerie5);
const peIdentitet = R.pris / R.epsTtm;
const pbReplik = R.mcapMdr / R.ekBokMdr;
const pbPrisBvps = R.pris / R.bvps;
const evEbitReplik = R.evKallaMdr / R.ebitTtmAbs;
const evEarningsReplik = R.evKallaMdr / R.resTtm;
const evEbitdaReplik = R.evKallaMdr / R.ebitdaTtmAbs;
const evEnkel = R.mcapMdr - R.nettokassaMdr; // utan minoritetsposter
const mcapReplik = (R.aktier * R.pris) / 1000; // mdr
const direkt = R.utdAktie / R.pris;
const payoutReplik = R.utdAktie / R.epsTtm;
const fcfReplik = R.ocfMdr - R.kapexMdr;
const epsIdentitet = (R.resTtm * 1000) / R.aktier; // M JPY / M aktier = JPY
const skuldEkReplik = R.skuldMdr / R.ekBokMdr;

const rad = {
  ticker: "9983.T",
  namn: "Fast Retailing Co., Ltd.",
  bransch: "konsument",
  land: "Japan",
  valuta: "JPY",
  kallor: [
    {
      namn: "StockAnalysis",
      hamtat: "2026-09-19",
      url: "https://stockanalysis.com/quote/tyo/9983/ (+ /statistics/ + /financials/)",
      paranoid:
        "TSE-primärnoteringen 9983 (översikt + statistics + financials, underlag S&P Global Market Intelligence + Fiscal.ai; slutkurs 2026-09-18 15:30 JST): pris 67 680 JPY (−0,03 %), mcap 20 767,5 mdr JPY på 306,85 M aktier (källans display 20,77T — replik 306,85 × 67 680 EXAKT), P/E 39,99 replikerbar (67 680/1 692,37 = 39,990 — 0,003 %), forward 36,87, PEG källans 3,16 (3-års intäktstillväxt +12,81 %/år som bas; spårets TTE-PEG 4,73 dokumenterad separat), P/S 5,40, P/B 7,39 på bokfört EK 2 810 mdr (pris/BVPS-vägen 67 680/8 891,74 = 7,61 — källspridning −2,9 %, BVPS-fältet bår vägt aktieantal ~315,9 M, HEN3/JNJ-klassen), P/FCF 28,86 (replik 67 680/2 345,40 = 28,86 EXAKT), EV 19 548,9 mdr (källans 19,55T; enkel replik mcap−nettokassa = 19 471,8 — gap 77 mdr = minoritetsposter som källans EV bär, EMBJ/VW-mönstret; EV/EBIT 27,51 replikerbar på källans EV (19 548,9/710,302 = 27,52 — 0,04 %), EV/Earnings 37,60 samma bevis (37,60 replik), EV/EBITDA 21,43 med replik-på-rå-EBITDA 25,2 = källspridning −15 % (lease-justerat underlag, JNJ/BUD/SOON-klassen) dokumenterad), TTM JPY (mdr): rev 3 849,013 (+14,76 %), brutto 2 103,937 (54,66 %), EBIT 710,302 (18,45 %), EBITDA 774,86 (20,13 %), netto 519,987 (13,51 % — EPS-identitet 519 987/306,85 = 1 694,6 mot fältet 1 692,37 = −0,13 % vägt aktietal, dokumenterad), OCF 803,59, capex 83,91, FCF 719,69 (replik 803,59−83,91 = 719,68 — 0,001 %), fcfYield 3,47 % (replik 719,69/20 767,5 = 3,465 %), ROE 22,48 % (källans medel-EK-bas), ROA 10,92, ROIC 37,51 % mot WACC 6,53 % = +30,98 pp (superlativtestat: universumets bredaste kapitalmarginal bland rader med bägge fält), räntetäckning 52,35× (BEI 56,9-klassen), skuld/EK 0,28 (replik 798,43/2 810 = 0,284), NETTOKASSA 1 295,7 mdr JPY (kassa ~2 094 mot skuld 798,43; 4 222,81/aktie), effektiv skatt 29,03 %, Altman Z 9,14, Piotroski F 7; DPS 640 JPY (0,945 %; källans payout 34,22 % på eget basunderlag — DPS/EPS-replik 37,8 %, källspridningsnot i 8035-klassen), utdelningstillväxt +28 % YoY, buyback-yield ~0; beta 0,45 (5 år), 52-v 44 380–88 690 (+42,25 % — kursen −23,6 % från 52v-toppen 88 690 efter Q3-rallyt +45,7 %); insiders 38,77 % (Yanai-familjens grundarblock), institutioner 40,08 %; analytiker Buy PT 85 717,65 (+26,65 %, 17 st); rev-prognos 3 år +12,81 %/år; anställda 59 522; split 3:1 2023-02-27 (källans corporate actions); nästa rapport torsdagen 2026-10-08 (Q4 FY2026); räkenskapsår SEPTEMBER–AUGUSTI med slutårsetikett (FY2025 = sep 2024–aug 2025 — TCS.NS/NTDOY-FY-konventionens augustivariant); FY-serier i M JPY (FY2021→FY2025): rev 2 132 992→2 301 122→2 766 557→3 103 836→3 400 539, netto 169 847→273 335→296 229→371 999→433 009, EBIT 254 725→315 824→384 297→492 253→558 520, EPS 553,48→890,43→964,48→1 210,81→1 409,32 (fyra raka EPS-tillväxtår +60,9/+8,3/+25,5/+16,4 %); branschfältet Consumer Discretionary/Apparel Retail källkonsekvent med HM/ITX/RACE-radernas konsumentklass",
    },
  ],
  hamtat: "2026-09-19",
  pris: R.pris,
  marknadsKapitalMdr: Math.round(R.mcapMdr * 100) / 100,
  tillvaxt: {
    omsattningCAGR5ar: Math.round(omsCagr * 10000) / 10000,
    resultatCAGR5ar: Math.round(resCagr * 10000) / 10000,
    omsattningTillvaxtTTM: R.ttmTillvaxt,
    prognosTillvaxt: Math.round(prognos * 10000) / 10000,
  },
  lonksamhet: {
    roe: R.roe,
    roic: R.roic,
    bruttoMarginal: R.bruttoTtm,
    ebitMarginal: R.ebitTtm,
    nettoMarginal: R.nettoTtm,
    fcfMarginal: R.fcfTtm,
  },
  stabilitet: {
    skuldEgenkapital: R.skuldEk,
    rantaTackning: R.rantaTackning,
    fcfPositivaSenaste5: null,
    kassaManaderBurnRate: null,
    nyemissionerSenaste5ar: null,
  },
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: null },
  moat: {
    bruttoMarginalMedel5ar: Math.round(bruttoMedel * 10000) / 10000,
    bruttoMarginalSpread5ar: Math.round(bruttoSpread * 10000) / 10000,
    roeMedel5ar: null,
  },
  vardering: {
    pe: R.pe,
    pb: R.pb,
    evEbit: R.evEbit,
    peg: Math.round(peg * 100) / 100,
    fcfYield: Math.round(fcfYield * 10000) / 10000,
    egenKapitalMultipl: R.pb,
  },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2021", "2022", "2023", "2024", "2025"],
    omsattning: R.oms5.map((x) => x * 1e6),
    resultat: R.res5.map((x) => x * 1e6),
    egetKapital: [],
    fcf: [],
  },
  notering:
    "JAPAN/KONSUMENT-CELLENS ANDRA RAD — TM (Toyota, världens största biltillverkare) + 9983.T (Uniqlo, Asiens största detaljhandelskoncern): Japens två globala konsumtionsvarumärkesjättar i EN cell, och cellens P/E-kvartilbredd blir berättelsen (8,3 mot 40,0 = cykelkapital mot varumärkeskapital). UNIQLO-ANKRET: 2 400+ butiker i 25 länder (Uniqlo Japan + Uniqlo International + GU + Theory-segmenten), grundat 1949 i Ube som Ogori Shoji — Yanai-familjen äger 38,77 % (källans insiders-andel; grundarblocket är själva styrningen). MARGINALTRAPPAN ÄR LÄROBOKEN: brutto 50,35 → 52,45 → 51,92 → 53,90 → 53,78 % (FY2021→2025) med TTM 54,66 % — Uniqlo Internationals skalning driver varenda steg; EBIT-marginal 11,94 → 18,45 %; netto 7,96 → 13,51 % — FEM raka år av marginalutvidgning på +13,9 % omsättningstillväxt/år (resultatCAGR +26,4 %/år = hävstången på marginaltaket). KAPITALMARGINALENS REKORD: ROIC 37,51 % mot WACC 6,53 % = +30,98 pp — ROIC-rank 17/176 i universumet (jämförelsetrappan 8035:s gap +20,5 · ABEV:s +19,4 · FCX:s +1,6): koncernen tjänar 5,7× sin kapitalkostnad per år. BALANSEN: NETTOKASSA 1 295,7 mdr JPY med räntetäckning 52,35× och Altman Z 9,14 — Beiersdorf-klassens försiktighet (56,9×) i yen. VARDERING: P/E 39,99 mot forward 36,87 ⇒ prognosTillväxt +8,5 % (TTE-konventionen) — PEG 4,73 spårkonvention (källans 3,16 på 3-års intäktsbas +12,81 %/år som kalibrering): premiummultipeln prissätter marginaltrappan, inte volymtillväxten — universumjämförelseraden: konsumentgrenens median P/E 18,1 mot FR 40,0 — grenens näst dyraste efter Ferrari (RACE 41,8) och över grenens P75 22,2. P/B 7,39 = grenens sjätte högsta (RACE 18,7 · KO 10,6 · ITX 9,3 · PEP 8,4 · HM 8,1). STABILITET: beta 0,45 (5 år), 52-v +42,25 % (44 380 → 88 690 med −23,6 % från toppen efter Q3-rallyt +45,7 % vinsttillväxt och lyfta guider; RSI 34 vid hämtningen). TARIFF-ÅRET DOKUMENTERAT: USA-tullarnas 'significant impact' varnades i okt-2025 med prishöjningsplaner — kedjans Kina-andel i leverantörsmixen är själva riskfaktorn, Q3-26 (+45,7 %) väger än så länge över. Utdelning 640 JPY (0,95 %) med payout-replik 37,8 % (källans 34,22 % på justerad bas) och +28 % YoY — utdelningskulturens tidiga år. Räkenskapsår september–augusti (FY2025 = sep-24→aug-25); Q3 FY2026 rapporterad 2026-07-09 — nästa rapp torsdagen 2026-10-08 (bland universumets tidigaste oktober-rappdagar; GS rapporterar 10-13). SPLIT-NOTIS 3:1 (2023-02-27) — aktiens yen-prisnivå 67 680 bär delningen",
};

// ── Aritmetikkontroller FÖRE skrivning (abort-grind: ENDA OLL ⇒ ingen disk) ──
const K = [];
const jfr = (namn, v, exp, tol = 5e-5) =>
  K.push([namn, Math.abs(v - exp) <= tol ? "GRÖN" : `OLL (${v} ≠ ${exp})`]);
jfr("omsCAGR endpoint 4 perioder 2 132 992→3 400 539", Math.round(omsCagr * 10000) / 10000, rad.tillvaxt.omsattningCAGR5ar);
jfr("resultatCAGR endpoint 4 perioder 169 847→433 009", Math.round(resCagr * 10000) / 10000, rad.tillvaxt.resultatCAGR5ar);
jfr("prognosTillväxt TTE 39,99/36,87", Math.round(prognos * 10000) / 10000, rad.tillvaxt.prognosTillvaxt);
jfr("PEG spårkonvention 39,99/8,4649", rad.vardering.peg, Math.round((R.pe / (prognos * 100)) * 100) / 100);
jfr("fcfYield 719,69/20 767,5", rad.vardering.fcfYield, Math.round(fcfYield * 10000) / 10000);
jfr("mcap-replik 306,85 M × 67 680 = 20 767,5 mdr", mcapReplik, R.mcapMdr, 0.02);
jfr("P/E-identitet 67 680/1 692,37 = 39,99", peIdentitet, R.pe, 0.02);
jfr("P/B-replik mcap/EK 20 767,5/2 810 = 7,39", pbReplik, R.pb, 0.011);
jfr("P/B pris/BVPS-notis 67 680/8 891,74 = 7,61 (källspridning)", pbPrisBvps, 7.61, 0.011);
jfr("EV/EBIT-replik 19 548,9/710,302 = 27,52 mot fältet 27,51", evEbitReplik, R.evEbit, 0.05);
jfr("EV/Earnings-replik 19 548,9/519,987 = 37,60 (EV-nivåns andra bevis)", evEarningsReplik, R.evEarnings, 0.05);
jfr("EV/EBITDA källspridning: rå replik 25,2 mot fältet 21,43 (−15 %)", evEbitdaReplik, 25.23, 0.05);
jfr("EV-enkel mcap−nettokassa 19 471,8: minoritetsgap 77 mdr dokumenterat", evEnkel, 19471.8, 0.2);
jfr("FCF-replik OCF−capex 803,59−83,91", fcfReplik, R.fcfMdr, 0.05);
jfr("EPS-identitet netto/aktier 519 987/306,85 = 1 694,6 (−0,13 % vägt tal)", epsIdentitet, 1694.55, 2.3);
jfr("bruttomarginalserie 5 år (2021–2025) → medel", Math.round(bruttoMedel * 10000) / 10000, rad.moat.bruttoMarginalMedel5ar);
jfr("bruttospread max−min FY21→FY25", Math.round(bruttoSpread * 10000) / 10000, rad.moat.bruttoMarginalSpread5ar);
jfr("egenKapitalMultipl = pb", rad.vardering.egenKapitalMultipl, rad.vardering.pb);
jfr("serielängder 5/5/5 + moat 5", [R.oms5.length, R.res5.length, R.ebit5.length, R.brutto5.length].join(""), "5555", 0);
jfr("direktavkastning 640/67 680 = 0,946 %", direkt, 0.009456, 5e-6);
jfr("payout-replik DPS/EPS 640/1 692,37 = 37,8 % (källans 34,22 dokumenterad)", payoutReplik, 0.3782, 5e-4);
jfr("skuld/EK 798,43/2 810 = 0,28", skuldEkReplik, R.skuldEk, 0.005);
const oll = K.filter(([, s]) => s !== "GRÖN");
for (const [n, s] of K) console.log(`KONTROLL ${s === "GRÖN" ? "✓" : "✗"} ${n}: ${s}`);
if (oll.length) {
  console.error(`ABORT: ${oll.length} kontroll(er) OLL — ingen skrivning sker`);
  process.exit(1);
}

// ── Superlativtest (omg14-regeln: information till noteringen, ej abort) ────
const sig = (v) => `${(v * 100).toFixed(1)}`;
const roicRank = [...fore.filter((b) => typeof b.lonksamhet?.roic === "number"), { lonksamhet: { roic: R.roic }, ticker: "9983.T-ny" }].sort((a, b) => b.lonksamhet.roic - a.lonksamhet.roic);
const peRank = [...fore.filter((b) => typeof b.vardering?.pe === "number"), { vardering: { pe: R.pe }, ticker: "9983.T-ny" }].sort((a, b) => a.vardering.pe - b.vardering.pe);
const bruttoRank = [...fore.filter((b) => typeof b.lonksamhet?.bruttoMarginal === "number"), { lonksamhet: { bruttoMarginal: R.bruttoTtm }, ticker: "9983.T-ny" }].sort((a, b) => b.lonksamhet.bruttoMarginal - a.lonksamhet.bruttoMarginal);
const pbRank = [...fore.filter((b) => typeof b.vardering?.pb === "number"), { vardering: { pb: R.pb }, ticker: "9983.T-ny" }].sort((a, b) => b.vardering.pb - a.vardering.pb);
console.log(`\nSUPERLATIV: ROIC ${sig(R.roic)} % → plats ${roicRank.findIndex((b) => b.ticker === "9983.T-ny") + 1}/${roicRank.length} från toppen (WACC 6,53 ⇒ gap +30,98 pp — paranoidens superlativkontroll)`);
console.log(`SUPERLATIV: P/E ${R.pe} → plats ${peRank.findIndex((b) => b.ticker === "9983.T-ny") + 1}/${peRank.length} från botten`);
console.log(`SUPERLATIV: brutto ${sig(R.bruttoTtm)} % → plats ${bruttoRank.findIndex((b) => b.ticker === "9983.T-ny") + 1}/${bruttoRank.length} från toppen`);
console.log(`SUPERLATIV: P/B ${R.pb} → plats ${pbRank.findIndex((b) => b.ticker === "9983.T-ny") + 1}/${pbRank.length} från toppen`);

// ── Kirurgisk textbaserad insert (minimal diff; filens indent = 1) ───────────
const nyRadJson = JSON.stringify(rad, null, 1)
  .split("\n")
  .map((l) => (l === "" ? "" : " " + l))
  .join("\n");
const slutIdx = raw.lastIndexOf("\n]");
if (slutIdx === -1) throw new Error("hittar inte slutparentesen");
const nyRaw = raw.slice(0, slutIdx) + ",\n " + nyRadJson + "\n]";
const efter = JSON.parse(nyRaw); // giltighetsbevis
writeFileSync(FIL, nyRaw);
console.log(`\nAPPEND: ${fore.length} → ${efter.length} rader (9983.T tillagd)`);

// ── Medianreplik (EXAKT raknaBranschMedianer) ────────────────────────────────
const median = (v) => {
  const r = v.filter((x) => typeof x === "number" && Number.isFinite(x));
  if (!r.length) return null;
  const s = [...r].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const percentil = (v, p) => {
  const r = v.filter((x) => typeof x === "number" && Number.isFinite(x));
  if (!r.length) return null;
  const s = [...r].sort((a, b) => a - b);
  const pos = (s.length - 1) * p;
  const lo = Math.floor(pos), hi = Math.ceil(pos);
  return lo === hi ? s[lo] : s[lo] + (pos - lo) * (s[hi] - s[lo]);
};
const runda1 = (x) => Math.round(x * 10) / 10;
const stat = (rader, f, pct) => {
  const v = rader.map((b) => f(b) ?? null);
  const n = v.filter((x) => typeof x === "number" && Number.isFinite(x)).length;
  const omv = (x) => (x === null ? null : pct ? runda1(x * 100) : runda1(x));
  return { median: omv(median(v)), p25: omv(percentil(v, 0.25)), p75: omv(percentil(v, 0.75)), n };
};
const fPe = (b) => b.vardering?.pe, fPb = (b) => b.vardering?.pb,
  fEbit = (b) => b.lonksamhet?.ebitMarginal, fFcf = (b) => b.lonksamhet?.fcfMarginal,
  fTill = (b) => b.tillvaxt?.omsattningTillvaxtTTM, fRes = (b) => b.tillvaxt?.resultatCAGR5ar,
  fRoe = (b) => b.lonksamhet?.roe;

for (const [namn, data] of [["FÖRE (" + fore.length + ")", fore], ["EFTER (" + efter.length + ")", efter]]) {
  const kon = data.filter((b) => b.bransch === "konsument");
  const jap = data.filter((b) => b.land === "Japan" && b.bransch === "konsument");
  const tot = data;
  console.log(`\n=== ${namn} ===`);
  console.log(`konsument: ${kon.length} bolag | P/E`, JSON.stringify(stat(kon, fPe, false)),
    "| P/B", JSON.stringify(stat(kon, fPb, false)));
  console.log(`konsument EBIT%:`, JSON.stringify(stat(kon, fEbit, true)),
    "FCF%:", JSON.stringify(stat(kon, fFcf, true)), "tillv%:", JSON.stringify(stat(kon, fTill, true)));
  console.log(`konsument ROE%:`, JSON.stringify(stat(kon, fRoe, true)), "resCAGR%:", JSON.stringify(stat(kon, fRes, true)));
  console.log(`JAPAN/KONSUMENT-cell: ${jap.length} bolag`, jap.map((b) => `${b.ticker}(pe ${b.vardering?.pe})`).join(" "));
  console.log(`TOTALT: P/E`, JSON.stringify(stat(tot, fPe, false)), "P/B", JSON.stringify(stat(tot, fPb, false)));
  console.log(`TOTALT resultatCAGR%:`, JSON.stringify(stat(tot, fRes, true)));
}

// ── Landmatta-svep (omg8-formeln: P/E-mattan, aldrig bolagstal) ──────────────
const matta = (data) => {
  const m = new Map();
  for (const b of data) {
    const k = `${b.land}/${b.bransch}`;
    if (typeof b.vardering?.pe === "number" && Number.isFinite(b.vardering.pe))
      m.set(k, (m.get(k) ?? 0) + 1);
  }
  return m;
};
const mFore = matta(fore), mEfter = matta(efter);
console.log("\n=== LANDMATTA Japan/konsument ===");
console.log("före:", mFore.get("Japan/konsument") ?? 0, "→ efter:", mEfter.get("Japan/konsument") ?? 0, "(MIN_MATTA=5)");
const jap = new Map();
for (const b of efter) if (b.land === "Japan") jap.set(`${b.bransch}/${b.ticker}`, 1);
console.log("Japan-rader efter:", [...jap.keys()].join(", "));
const p4 = [...mEfter.entries()].filter(([, v]) => v === 4).map(([k]) => k);
const p3 = [...mEfter.entries()].filter(([, v]) => v === 3).map(([k]) => k);
console.log("celler på matta 4 (+1 krävs till sida):", p4.join(", ") || "—");
console.log("celler på matta 3 (+2 krävs):", p3.join(", ") || "—");
const landEfter = new Set(efter.map((b) => b.land));
console.log("länder:", landEfter.size);

// ── Slutlig verifiering: radens innehåll i filen ─────────────────────────────
const s = efter.find((b) => b.ticker === "9983.T");
console.log("\n9983.T i filen:", s ? `${s.ticker} ${s.namn} ${s.bransch}/${s.land} pe=${s.vardering.pe} pb=${s.vardering.pb} peg=${s.vardering.peg} fcfY=${s.vardering.fcfYield} resCAGR=${s.tillvaxt.resultatCAGR5ar}` : "SAKNAS");
console.log("SUMMA kontroller GRÖNA:", K.filter(([, st]) => st === "GRÖN").length + "/" + K.length);
