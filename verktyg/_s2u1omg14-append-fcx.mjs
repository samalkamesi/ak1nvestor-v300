#!/usr/bin/env node
/**
 * s2-u1 omg14 — APPEND Freeport-McMoRan (FCX, material, USA) till
 * data/portfolj-system/bolagsunivers.json (171→172). Koppar-ledet föds i
 * materialgrenen; USA/material-cellen 1→2 (NEM+FCX = ädelmetall/basmetall-
 * jämförelseraden, grundplåt mot /dataset/material/usa).
 *
 * Metod (spårets etablerade sedan omg6; TCS-mallen omg13): textbaserad
 * kirurgisk insert före slut-]-parentesen (minimal diff; filens indent 1 enligt
 * omg13-formatnotisen), idempotensguard, aritmetikverifierad FÖRE skrivning
 * (abort-grind — omg13-läxan: kontrollblock fångar stavfel FÖRE disk),
 * medianer/kvartiler före/efter med EXAKT replik av raknaBranschMedianer
 * (src/lib/dataset-medianer.ts), landmatta-svep enligt omg8-rättasen.
 *
 * Data: stockanalysis.com NYSE-primärnotering (översikt + statistics +
 * financials + cash-flow-statement + balance-sheet; underlag S&P Global
 * Market Intelligence + Fiscal.ai), stängningskurs 2026-09-17, sidor pålästa
 * 2026-09-18. Räkenskapsår = kalenderår (universumets huvudkonvention).
 */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(FIL, "utf8");
const u = JSON.parse(raw);
if (!Array.isArray(u)) throw new Error("universumet är inte en array");
if (u.some((b) => b.ticker === "FCX")) {
  console.log("IDEMPOTENT: FCX finns redan — avslutar utan ändring");
  process.exit(0);
}
const fore = JSON.parse(raw); // färsk kopia för före-mätning

// ── FCX-rådata (miljoner USD; NYSE-kurs 2026-09-17) ──────────────────────────
const R = {
  // 5 år brutto-underlag (FY2021 för moat-serien — koppar-boomens topp)
  oms5: [22845, 22780, 22855, 25455, 25915],
  brutto5: [10905, 9710, 9295, 10067, 9605],
  // serier 4 år (konventionen)
  oms: [22780, 22855, 25455, 25915],
  brutto: [9710, 9295, 10067, 9605],
  res: [3461, 1842, 1883, 2197],
  fcf: [1670, 455, 2352, 1116],
  ocf: [5139, 5279, 7160, 5610],
  kapex: [3469, 4824, 4808, 4494],
  utd5: [866, 863, 865, 865], // utdelningar betalda (common)
  kop5: [1402, 50, 94, 130], // återköp (2022-cykeltoppens raketen sedan avstannad)
  pris: 70.85, mcapT: 101.74, // mdr USD
  pe: 34.72, peFwd: 20.21, pb: 5.06, bvps: 14.0,
  evEbit: 15.32, evEbitda: 11.31, pegKalla: 0.55,
  roe: 0.1475, roic: 0.1268, roce: 0.1334, wacc: 0.1111, beta: 1.4,
  bruttoTtm: 0.3828, ebitTtm: 0.2726, nettoTtm: 0.1138, fcfTtm: 0.0681,
  skuldEk: 0.32, rantaTackning: 16.55, skuldT: 10.359, kassaT: 4.08,
  ekCommon: 20.109, ekTotal: 32.222, minoritet: 12.113, // Jun-30 2026
  omsTtm: 25.868, resTtm: 2.936, fcfTtm: 1.762, ocfTtm: 5.9, epsTtm: 2.04,
  utdAktie: 0.6, payout: 0.2941, ttmTillvaxt: 0.0019,
  skatt: 0.3106, lv52: [35.15, 80.24], lv52Prestanda: 0.564,
};

// CAGR endpoint FY2022→FY2025 = 3 perioder (VALE-konventionen: fältet heter
// 5ar men mäter seriens endpoint — den ärvda flaggan lever, 172:a raden)
const cagr3 = (a, b) => Math.pow(b / a, 1 / 3) - 1;
const omsCagr = cagr3(R.oms[0], R.oms[3]);
const resCagr = cagr3(R.res[0], R.res[3]);
const prognos = R.pe / R.peFwd - 1; // TTE-konventionen (trailing/fwd)
const peg = R.pe / (prognos * 100); // spårkonvention (HSBC/MA/ASML)
const fcfYield = R.fcfTtm / R.mcapT;
const bruttoSerie5 = R.brutto5.map((g, i) => g / R.oms5[i]);
const bruttoMedel = bruttoSerie5.reduce((a, b) => a + b, 0) / bruttoSerie5.length;
const bruttoSpread = Math.max(...bruttoSerie5) - Math.min(...bruttoSerie5);
const ebitTtmAbs = R.omsTtm * R.ebitTtm; // 7,052 mdr
const evEbitReplik = (R.mcapT + R.skuldT - R.kassaT) / ebitTtmAbs;
const pbReplik = R.mcapT / R.ekCommon;
const peIdentitet = R.pris / R.epsTtm;
const roeReplik = R.resTtm / R.ekCommon;

const rad = {
  ticker: "FCX",
  namn: "Freeport-McMoRan Inc.",
  bransch: "material",
  land: "USA",
  valuta: "USD",
  kallor: [
    {
      namn: "StockAnalysis",
      hamtat: "2026-09-18",
      url: "https://stockanalysis.com/stocks/fcx/",
      paranoid:
        "NYSE-primärnoteringen (översikt + statistics + financials + cash-flow-statement + balance-sheet; underlag S&P Global Market Intelligence + Fiscal.ai; stängningskurs 2026-09-17): pris, mcap 101,74 mdr, EV/EBIT 15,32 EV/EBITDA 11,31, P/E 34,72 forward 20,21, P/B 5,06 (mcap/common equity 20,109 mdr JUN-26 OCH pris/BVPS 70,85/14,00 — equity-måttens konvergens, inte spread), marginaler TTM, ROE 14,75/ROIC 12,68/ROCE 13,34/WACC 11,11, skuld/EK 0,32 (på total equity 32,222 INKL minoriteter 12,113 — på common equity 0,51: konsolideringsnotis), räntetäckning 16,55×, nettoskuld 6,28 mdr, utdelning 0,60 USD/aktie (0,85 %, payout 29,41 % exakt 0,60/2,04), köpavkastning 0,09 %, beta 1,40, 52-v 35,15–80,24 (+56,4 %), Altman Z 2,69, Piotroski F 5, effektiv skattesats 31,06 %, analytiker 72,05 (23 st), institutioner 88,93 %, 29 000 anställda, oms/anställd 0,892 MUSD; bransch Materials/Copper källkonsekvent med NEM/BHP/RIO-familjen",
    },
  ],
  hamtat: "2026-09-18",
  pris: R.pris,
  marknadsKapitalMdr: Math.round(R.mcapT * 1000), // 101 740 mdr USD
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
    ar: ["2022", "2023", "2024", "2025"],
    omsattning: R.oms,
    resultat: R.res,
    egetKapital: [],
    fcf: R.fcf,
  },
  notering:
    "KOPPAR-LEDET FÖDS I MATERIALGRENEN — och USA/material-cellen (universumets sämsta USA-cell: nio av tio branscher hade 5+, material ensam med NEM) får sin andra rad: NEM+FCX = ÄDELMETALL/BASMETALL-JÄMFÖRELSERADEN i USA-fållan, grundplåt mot /dataset/material/usa (MIN_MATTA=5 — koordinat åt kommande omgångar: 1→2 här). FCX = VÄRLDENS STÖRSTA BÖRSNOTERADE RENODLADE KOPPARPRODUCENT (Grasberg i Indonesiens bergstrakt — bland världens största kopparfyndigheter; diversifierade BHP/RIO bryter mer koppar men som helhetsgruvor) med betydande guldproducentroll som Grasbergs biprodukt; 29 000 anställda, 0,89 MUSD omsättning per anställd, huvudkontor Phoenix AZ — ingen landstvetydighet (LIN-klassens dilemma undviks). NEM-KONTRASTEN (samma pristagar-DNA, två metaller): NEM P/E 15,8 · fcfYield 6,7 % · bruttomarginal 68,0 % mot FCX 34,7 · 1,7 % · 38,3 % — guldens kassaprinter mot kopparets kapitalbalans; koppar = elektrifieringens metall (datacenter, elnät, EV) där varje ny gruva tar årtionden. KAPITALCYKELN ÄR BERÄTTELSEN: capex 3 469 → 4 824 → 4 808 → 4 494 mdr USD (17–19 % av omsättningen 2023–24; TTM 4 138) — Indonesiens förädlingskrav (Manyar-smältverket, brand okt 2024 med återuppbyggnad 2025) + Grasbergs underhållsbudget; FCF 1 670 → 455 → 2 352 → 1 116 mdr genom cykeln med TTM 1 762 på driftskassa 5 900 — smältverksåren åt kassan, återhämtningsåret ger tillbaka (femårsmedel 1,4 mdr). MINORITETSPEDAGOGIKEN (konsolideringens lärobok): balansräkningens totala equity 32,2 mdr USD INKLUDERAR 12,1 mdr minoritetsintresse (PT Freeport Indonesia — FCX bokför HELA Grasberg men bär ekonomiskt intresse 48,8 % efter 2018 års divestment): skuld/EK 0,32 på total equity mot 0,51 på moderbolagsägarens; minoritetsposten = 38 % av balansräkningens equity. PRIS/VOLYM-ÅRET: TTM-intäkt +0,2 % trots starka kopparpriser — volymsidan höll tillbaka (smältningskapacitet och exportstörningar efter branden) medan nettovinsten steg +53,1 % = MARGINALÅTERKOMSTEN; bruttomarginal 42,6 % (FY2022) → 40,7 → 39,6 → 37,1 % (FY2025) med FY2021-toppen 47,7 % — femårsspread 10,7 pp: råvaruvallgraven rider på metallpriset (moat-fälten dokumenterar; NEM:s 68 %-brutto är fyndighetens, inte branschens). VARDERING: P/E 34,72 mot forward 20,21 ⇒ prognosTillväxt +71,8 % (TTE-konventionen — vändningsgap i DNO/VALE-klassens NEDRE trappa, långt under Holcims +479) med PEG 0,48 spårkonvention (källans 0,55 — källspridningsnot i VALE/005930.KS-familjen); källans 3-års EPS-prognos +36,4 %/år som kalibrerings-not; EV/EBIT 15,32 REPLIKERBAR EXAKT ((101,74 + 10,36 − 4,08) ÷ 7,05 mdr TTM-EBIT); P/B 5,06 på BÅDA vägarna (mcap ÷ common equity 20,109 OCH pris ÷ BVPS 14,00 — equity-måttens sällsynta konvergens); fcfYield 1,7 % (1,762 ÷ 101,74) — mittemellan i materialgrenen (Yara 1,79 % över, SCA 1,53 % under) men en annan värld än NEM:s 6,7 %. KAPITALMARGINALKNAPP: ROIC 12,68 % mot WACC 11,11 % = +1,57 pp — råvarucykelns värdemätare (VALE +0,16 pp samma familj; konsultkontrasten TCS +61,2 pp). UTDELNINGEN: DPS 0,60 USD (0,85 % direktavkastning) med payout 29,4 % — bas+variabel-policyn mot kapitalcykeln; utdelningar betalda 866 → 863 → 865 → 865 mdr USD PLATT medan återköpen 1 402 → 50 → 94 → 130 (2022-cykeltoppens raket avstannad — utdelningsdisciplin när kassan skall till smältverk); effektiv skattesats 31,06 % (indonesisk beskattning och exportavgifter på PT-FI). RÖRLIGHET: beta 1,40 — råvarucykeln i betaform; 52-vägers 35,15–80,24 (+56,4 %, kursen 70,85 nära toppspannet); Altman Z 2,69, Piotroski F 5; institutioner 88,93 %. Räkenskapsår kalenderår (universumets huvudkonvention); nästa rapport 2026-10-22 (Q3 2026 — materialgrenens nästa FIFO-dag, före VALE 10-29)",
};

// ── Aritmetikkontroller FÖRE skrivning (abort-grind: ENDA OLL ⇒ ingen disk) ──
const K = [];
const jfr = (namn, v, exp, tol = 5e-5) =>
  K.push([namn, Math.abs(v - exp) <= tol ? "GRÖN" : `OLL (${v} ≠ ${exp})`]);
jfr("omsCAGR endpoint 3 perioder 22 780→25 915", Math.round(omsCagr * 10000) / 10000, rad.tillvaxt.omsattningCAGR5ar);
jfr("resCAGR endpoint 3 perioder 3 461→2 197", Math.round(resCagr * 10000) / 10000, rad.tillvaxt.resultatCAGR5ar);
jfr("prognosTillväxt TTE 34,72/20,21", Math.round(prognos * 10000) / 10000, rad.tillvaxt.prognosTillvaxt);
jfr("PEG 0,48 spårkonvention (källans 0,55 not)", rad.vardering.peg, Math.round((R.pe / (prognos * 100)) * 100) / 100);
jfr("fcfYield 1,762/101,74", rad.vardering.fcfYield, Math.round(fcfYield * 10000) / 10000);
jfr("direktavkastning 0,60/70,85", R.utdAktie / R.pris, 0.008469, 5e-6);
jfr("payout-replik DPS/EPS 0,60/2,04 = källans 29,41 %", R.utdAktie / R.epsTtm, R.payout, 5e-5);
jfr("P/E-identitet 70,85/2,04 mot källans 34,72", peIdentitet, R.pe, 0.02);
jfr("EV/EBIT-replik (mcap+skuld−kassa)/EBIT = 15,32", evEbitReplik, R.evEbit, 0.011);
jfr("P/B-replik mcap/common equity = 5,06", pbReplik, R.pb, 0.011);
jfr("pris/BVPS 70,85/14,00 — konvergensnotis", R.pris / R.bvps, 5.061, 0.001);
jfr("bruttomarginalserie 5 år (2021–2025) → medel", Math.round(bruttoMedel * 10000) / 10000, rad.moat.bruttoMarginalMedel5ar);
jfr("bruttospread max−min FY21→FY25", Math.round(bruttoSpread * 10000) / 10000, rad.moat.bruttoMarginalSpread5ar);
jfr("egenKapitalMultipl = pb", rad.vardering.egenKapitalMultipl, rad.vardering.pb);
jfr("serielängder 4/4/4 + moat 5", [R.oms.length, R.res.length, R.fcf.length, R.brutto5.length].join(""), "4445", 0);
jfr("ROE-replik-notis 2 936/20 109 = 14,6 % mot källans 14,75", roeReplik, 0.146, 0.0015);
jfr("minoritetsidentitet total − minoritet = common", R.ekTotal - R.minoritet, R.ekCommon, 0.001);
const oll = K.filter(([, s]) => s !== "GRÖN");
for (const [n, s] of K) console.log(`KONTROLL ${s === "GRÖN" ? "✓" : "✗"} ${n}: ${s}`);
if (oll.length) {
  console.error(`ABORT: ${oll.length} kontroll(er) OLL — ingen skrivning sker`);
  process.exit(1);
}

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
console.log(`\nAPPEND: ${fore.length} → ${efter.length} rader (FCX tillagd)`);

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
  const mat = data.filter((b) => b.bransch === "material");
  const tot = data;
  console.log(`\n=== ${namn} ===`);
  console.log(`material: ${mat.length} bolag | P/E`, JSON.stringify(stat(mat, fPe, false)),
    "| P/B", JSON.stringify(stat(mat, fPb, false)));
  console.log(`material EBIT%:`, JSON.stringify(stat(mat, fEbit, true)),
    "FCF%:", JSON.stringify(stat(mat, fFcf, true)), "tillv%:", JSON.stringify(stat(mat, fTill, true)));
  console.log(`material ROE%:`, JSON.stringify(stat(mat, fRoe, true)), "resCAGR%:", JSON.stringify(stat(mat, fRes, true)));
  console.log(`TOTALT: P/E`, JSON.stringify(stat(tot, fPe, false)), "P/B", JSON.stringify(stat(tot, fPb, false)));
  console.log(`TOTALT resultatCAGR%:`, JSON.stringify(stat(tot, fRes, true)));
}

// ── Landmatta-svep (omg8-rättasens formel: P/E-matta, aldrig bolagstal) ──────
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
console.log("\n=== LANDMATTA USA/material ===");
console.log("före:", mFore.get("USA/material") ?? 0, "→ efter:", mEfter.get("USA/material") ?? 0, "(MIN_MATTA=5)");
const p4 = [...mEfter.entries()].filter(([, v]) => v === 4).map(([k]) => k);
const p3 = [...mEfter.entries()].filter(([, v]) => v === 3).map(([k]) => k);
console.log("celler på matta 4 (koordinater):", p4.join(", ") || "—");
console.log("celler på matta 3 (+2 krävs):", p3.join(", ") || "—");
const landEfter = new Set(efter.map((b) => b.land));
console.log("länder:", landEfter.size);

// ── Slutlig verifiering: radens innehåll i filen ─────────────────────────────
const s = efter.find((b) => b.ticker === "FCX");
console.log("\nFCX i filen:", s ? `${s.ticker} ${s.namn} ${s.bransch}/${s.land} pe=${s.vardering.pe} pb=${s.vardering.pb} peg=${s.vardering.peg} fcfY=${s.vardering.fcfYield}` : "SAKNAS");
console.log("SUMMA kontroller GRÖNA:", K.filter(([, st]) => st === "GRÖN").length + "/" + K.length);
