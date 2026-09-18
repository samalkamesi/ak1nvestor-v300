#!/usr/bin/env node
/**
 * s2-u1 omg12 — APPEND Samsung Electronics (005930.KS, teknik, Sydkorea) till
 * data/portfolj-system/bolagsunivers.json (159→160; universumets första
 * Sydkorea-rad, 18:e landet — halvledartrion ASML→TSMC→Samsung fullständig).
 *
 * Metod (spårets etablerade sedan omg6): textbaserad kirurgisk insert före
 * slut-]-parentesen (minimal diff), idempotensguard, aritmetikverifierad EFTER
 * append, medianer/kvartiler före/efter med EXAKT replik av raknaBranschMedianer
 * (src/lib/dataset-medianer.ts), landmatta-svep enligt omg8-rättasen.
 *
 * Data: stockanalysis.com KRX-primärnotering (översikt+statistics+financials+
 * cash-flow, underlag S&P Global Market Intelligence + Fiscal.ai), close
 * 2026-09-17 KRW. SSNLF-OTC-sidans kursdata förkastad (volym 1, stal close) —
 * primärnoteringen är källan. Serier i mdr-hundradelar (miljoner KRW), kalenderår.
 */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(FIL, "utf8");
const u = JSON.parse(raw);
if (!Array.isArray(u)) throw new Error("universumet är inte en array");
if (u.some((b) => b.ticker === "005930.KS")) {
  console.log("IDEMPOTENT: 005930.KS finns redan — avslutar utan ändring");
  process.exit(0);
}
const fore = JSON.parse(raw); // färsk kopia för före-mätning

// ── Samsung-rådata (miljoner KRW; kalenderår FY2022–FY2025; KRX-kurs 2026-09-17) ──
const R = {
  oms: [302231360, 258935494, 300870903, 333605938],
  brutto: [112189590, 78546914, 114308635, 131370425],
  res: [54730018, 14473401, 33621363, 44260956],
  fcf: [12750918, -13473865, 21576266, 37792969],
  utd: [9814426, 9864474, 10888749, 9897183], // utdelningar betalda (common)
  kop: [null, null, 1811775, 8189263], // återköp (rad finns först FY2024)
  kapex: [49430428, 57611292, 51406355, 47522179],
  pris: 252500, mcapT: 1610.83, // mdr KRW
  pe: 12.39, peFwd: 4.06, pb: 2.78, bvps: 86051.83,
  evEbit: 8.1, pegKalla: 0.04,
  roe: 0.3079, roic: 0.3686, wacc: 0.126, beta: 1.54,
  bruttoTtm: 0.5748, ebitTtm: 0.3688, nettoTtm: 0.3084, fcfTtm: 0.2984,
  skuldEk: 0.04, skuldT: 22.41, kassaT: 190.0, // mdr KRW
  omsTtmT: 485.27, resTtmT: 135.26, fcfTtmT: 144.8, epsTtm: 20372.85,
  utdAktie: 2264, payout: 0.0744, ttmTillvaxt: 0.573,
  lv52: [76700, 374500],
};

const cagr = (a, b) => Math.pow(b / a, 1 / 3) - 1; // 4 räkenskapsår = 3 perioder (endpoint)
const omsCagr = cagr(R.oms[0], R.oms[3]);
const resCagr = cagr(R.res[0], R.res[3]);
const prognos = R.pe / R.peFwd - 1; // TTE-konventionen (trailing/fwd)
const peg = R.pe / (prognos * 100); // spårkonvention (HSBC/MA/ASML)
const fcfYield = R.fcfTtmT / R.mcapT;
const bruttoSerie = R.brutto.map((g, i) => g / R.oms[i]);
const bruttoMedel = bruttoSerie.reduce((a, b) => a + b, 0) / bruttoSerie.length;
const bruttoSpread = Math.max(...bruttoSerie) - Math.min(...bruttoSerie);
const evEbitReplik = (R.mcapT + R.skuldT - R.kassaT) / (R.omsTtmT * R.ebitTtm);
const ebitTtm = R.omsTtmT * R.ebitTtm; // T-lient replik av TTM-EBIT

const rad = {
  ticker: "005930.KS",
  namn: "Samsung Electronics Co., Ltd.",
  bransch: "teknik",
  land: "Sydkorea",
  valuta: "KRW",
  kallor: [
    {
      namn: "StockAnalysis",
      hamtat: "2026-09-17",
      url: "https://stockanalysis.com/quote/krx/005930/",
      paranoid:
        "KRX-primärnoteringen (översikt + statistics + financials + cash-flow-statement; underlag S&P Global Market Intelligence + Fiscal.ai; stängningskurs 2026-09-17): pris, börsvärde, P/E-forward-P/B-EV/EBIT-PEG, marginaler, ROE/ROIC, WACC, utdelning/payout, beta — 4 räkenskapsår FY2022–FY2025 (kalenderår) i KRW. SSNLF-OTC-sidans KURSDATA FÖRKASTAD (volym 1 aktie, close april 2026) — OTC-sidans dollartal för börsvärde (1,18 T USD) används endast som korsreferens",
    },
  ],
  hamtat: "2026-09-17",
  pris: R.pris,
  marknadsKapitalMdr: Math.round(R.mcapT * 1000), // 1 610 830 mdr KRW
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
    rantaTackning: null,
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
    "UNIVERSUMETS FÖRSTA SYDKOREA-RAD (18:e landet) — och halvledartrion fullständig: ASML (EUV-litografin, Nederländerna) → TSMC (foundry, Taiwan) → Samsung (MINNE + foundry tvåa) — teknikgrenens kapitallogiska kedja från maskin till krets till produkt. MINNESCYKELN I FYRA AKTER: resultat 54,7 → 14,5 biljoner KRW FY2023 (−74 % — DRAM/NAND-prisrasen) → 33,6 → 44,3 FY2025; endpoint-CAGR −6,8 %/år TROTS att omsättningen växer +3,4 %/år — 2022-toppen var rekordår (pandemiefterfrågan + svag won) och 2025 ligger fortfarande under den: minnet prissätts som en råvara och resultat-CAGR:n bär cykeln (CVX/XOM/EQNR-familjen — 56 negativa precedenser i universumet). MOTCYKLISK KAPEX = minnesindustrins signatur: kapex-serien 49,4 → 57,6 → 51,4 → 47,5 biljoner KRW — capex-TOPPEN FY2023 träffar resultattratten exakt (man bygger fabriker när priserna är som lägst — ASML:s maskiner är mottagaren); FCF-serien +12,8 → −13,5 → +21,6 → +37,8 biljoner KRW (FY2023 negativ av samma skäl). 2026:S SUPERCYKEL (AI-minne): TTM omsättning 485,3 T KRW (+57,3 %) vs FY2025:s 333,6 T; TTM-resultat 135,3 T = TRE FY2025; bruttomarginal TTM 57,5 % mot FY2025:s 39,4 % — P/E 12,39 mot forward 4,06 ⇒ prognosTillväxt +205 % (TTE-konventionen; universumets näst extremaste efter DNO +366 %) och PEG 0,06 spårkonvention (källans egen 0,04 som not) — gap-mått på en cykel topp, ej en köprekommendation. KAPITALLOGIKEN: ROIC 36,9 % mot WACC 12,6 % (två och en halv gång kapitalkostnaden — motcyklisk kapex ÄR vallgraven); nettokassa 167,6 T KRW (kassa 190,0 − skuld 22,4); skuld/EK 0,04; EV/EBIT 8,10 replikerbar ((1 610,8 + 22,4 − 190,0) ÷ 179,0 TTM-EBIT ≈ 8,1). CHEBOL-STRUKTUREN: elektronik + halvledare + display i samma bolag — bredare intäktsbas än TSMC/ASML, lägre renhet i jämförelsen; utdelning 2 264 KRW/aktie (0,90 % direktavkastning) med payout 7,4 % (TTM-utdelningar ÷ TTM-resultat); återköpen FÖDS först FY2024: 1,8 T → 8,2 T KRW FY2025. P/B-NOTIS: källans P/B 2,78 (totalt eget kapital) mot pris/BVPS 2,93 (stamaktie-BVPS 86 052 KRW) — källans equity-mått skiljer mellan multiplar (ROE 30,8 % bär dess eget underlag); fälten bär källans publicerade värden. KURSEN: KRX-primärnotering 252 500 KRW, 52-vägers spann 76 700–374 500 (kursen mitt i spannet efter våldsam AI-rally med kraftig reträtt); beta 1,54; marknadsvärde 1 610,8 T KRW ≈ 1,18 biljoner USD (OTC-korsreferens) = universumets största icke-USA-rad. RÄKENSKAPSÅRET kalenderår (FY2025 = jan–dec 2025); nästa rapport 2026-10-28 (Q3 2026)",
};

// ── Kirurgisk textbaserad insert (minimal diff) ──────────────────────────────
const nyRadJson = JSON.stringify(rad, null, 2)
  .split("\n")
  .map((l) => (l === "" ? "" : "  " + l))
  .join("\n");
const slutIdx = raw.lastIndexOf("\n]");
if (slutIdx === -1) throw new Error("hittar inte slutparentesen");
const nyRaw = raw.slice(0, slutIdx) + ",\n  " + nyRadJson + "\n]";
const efter = JSON.parse(nyRaw); // giltighetsbevis
writeFileSync(FIL, nyRaw);
console.log(`APPEND: ${fore.length} → ${efter.length} rader (005930.KS tillagd)`);

// ── Aritmetikkontroller (10 st — GRÖN/OLL) ────────────────────────────────────
const K = [];
const jfr = (namn, v, exp, tol = 5e-5) =>
  K.push([namn, Math.abs(v - exp) <= tol ? "GRÖN" : `OLL (${v} ≠ ${exp})`]);
jfr("omsCAGR endpoint 3 perioder", Math.round(omsCagr * 10000) / 10000, rad.tillvaxt.omsattningCAGR5ar);
jfr("resCAGR endpoint 3 perioder (negativ — 56 precedenser)", Math.round(resCagr * 10000) / 10000, rad.tillvaxt.resultatCAGR5ar);
jfr("prognosTillväxt TTE 12,39/4,06", Math.round(prognos * 10000) / 10000, rad.tillvaxt.prognosTillvaxt);
jfr("PEG 0,06 spårkonvention (källans 0,04 not)", rad.vardering.peg, Math.round((R.pe / (prognos * 100)) * 100) / 100);
jfr("fcfYield 144,8/1 610,83", rad.vardering.fcfYield, Math.round(fcfYield * 10000) / 10000);
jfr("direktavkastning 2 264/252 500", R.utdAktie / R.pris, 0.008965, 5e-5);
jfr("payout TTM ≈ 7,4 % (9,9 T ÷ 135,3 T)", R.utd[3] / (R.resTtmT * 1e6), 0.0732, 0.003);
jfr("EV/EBIT-replik (mcap+skuld−kassa)/EBIT", evEbitReplik, R.evEbit, 0.06);
jfr("bruttomarginalserie 4 år → medel", Math.round(bruttoMedel * 10000) / 10000, rad.moat.bruttoMarginalMedel5ar);
jfr("bruttospread max−min FY22–FY25", Math.round(bruttoSpread * 10000) / 10000, rad.moat.bruttoMarginalSpread5ar);
jfr("egenKapitalMultipl = pb", rad.vardering.egenKapitalMultipl, rad.vardering.pb);
jfr("serier längd 4/4/4/4", [R.oms.length, R.res.length, R.fcf.length, R.brutto.length].join(""), "4444", 0);
for (const [n, s] of K) console.log(`KONTROLL ${s === "GRÖN" ? "✓" : "✗"} ${n}: ${s}`);

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

for (const [namn, data] of [["FÖRE (159)", fore], ["EFTER (160)", efter]]) {
  const tek = data.filter((b) => b.bransch === "teknik");
  const tot = data;
  console.log(`\n=== ${namn} ===`);
  console.log(`teknik: ${tek.length} bolag | P/E`, JSON.stringify(stat(tek, fPe, false)),
    "| P/B", JSON.stringify(stat(tek, fPb, false)));
  console.log(`teknik EBIT%:`, JSON.stringify(stat(tek, fEbit, true)),
    "FCF%:", JSON.stringify(stat(tek, fFcf, true)), "tillv%:", JSON.stringify(stat(tek, fTill, true)));
  console.log(`teknik ROE%:`, JSON.stringify(stat(tek, fRoe, true)), "resCAGR%:", JSON.stringify(stat(tek, fRes, true)));
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
console.log("\n=== LANDMATTA Sydkorea/teknik ===");
console.log("före:", mFore.get("Sydkorea/teknik") ?? 0, "→ efter:", mEfter.get("Sydkorea/teknik") ?? 0, "(MIN_MATTA=5)");
const p4 = [...mEfter.entries()].filter(([, v]) => v === 4).map(([k]) => k);
const p3 = [...mEfter.entries()].filter(([, v]) => v === 3).map(([k]) => k);
console.log("celler på matta 4 (koordinater):", p4.join(", ") || "—");
console.log("celler på matta 3 (+2 krävs):", p3.join(", ") || "—");

// ── Slutlig verifiering: radens innehåll i filen ─────────────────────────────
const s = efter.find((b) => b.ticker === "005930.KS");
console.log("\n005930.KS i filen:", s ? `${s.ticker} ${s.namn} ${s.bransch}/${s.land} pe=${s.vardering.pe} pb=${s.vardering.pb} peg=${s.vardering.peg} fcfY=${s.vardering.fcfYield}` : "SAKNAS");
console.log("SUMMA kontroller GRÖNA:", K.filter(([, st]) => st === "GRÖN").length + "/" + K.length);
