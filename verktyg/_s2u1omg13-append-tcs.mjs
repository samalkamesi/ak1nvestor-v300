#!/usr/bin/env node
/**
 * s2-u1 omg13 — APPEND Tata Consultancy Services (TCS.NS, teknik, Indien)
 * till data/portfolj-system/bolagsunivers.json (165→166; universumets första
 * Indien-rad, 19:e landet — teknikgrenens IT-tjänste-led föds: ASML→TSM→
 * 005930.KS täcker kapitalet, TCS täcker människan).
 *
 * Metod (spårets etablerade sedan omg6, Samsung-mallen omg12): textbaserad
 * kirurgisk insert före slut-]-parentesen (minimal diff), idempotensguard,
 * aritmetikverifierad EFTER append, medianer/kvartiler före/efter med EXAKT
 * replik av raknaBranschMedianer (src/lib/dataset-medianer.ts), landmatta-
 * svep enligt omg8-rättasen.
 *
 * Data: stockanalysis.com NSE-primärnotering (översikt+statistics+financials+
 * cash-flow-statement; underlag S&P Global Market Intelligence + Fiscal.ai),
 * stängningskurs 2026-09-17 INR. Räkenskapsår april–mars (slutårsetikett:
 * FY2026 = apr 2025–mar 2026). Serier M INR.
 */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(FIL, "utf8");
const u = JSON.parse(raw);
if (!Array.isArray(u)) throw new Error("universumet är inte en array");
if (u.some((b) => b.ticker === "TCS.NS")) {
  console.log("IDEMPOTENT: TCS.NS finns redan — avslutar utan ändring");
  process.exit(0);
}
const fore = JSON.parse(raw); // färsk kopia för före-mätning

// ── TCS-rådata (miljoner INR; FY = april–mars, slutårsetikett; NSE-kurs 2026-09-17) ──
const R = {
  // FY2022 finns bara i moat/CAGR-underlaget (5 år); serierna bär 4 år konventionen
  oms5: [1917540, 2254580, 2408930, 2553240, 2670210],
  brutto5: [830370, 960550, 970600, 978880, 1076280],
  res5: [383270, 421470, 459080, 485530, 492100],
  oms: [2254580, 2408930, 2553240, 2670210],
  brutto: [960550, 970600, 978880, 1076280],
  res: [421470, 459080, 485530, 492100],
  fcf: [394330, 421360, 449280, 478700],
  utd5: [133170, 413470, 251370, 448640, 394370], // utdelningar betalda (common)
  kop5: [180000, 41920, 209590, null, null], // återköp (pausade sedan FY2024)
  kapex: [25320, 22020, 39800, 42240],
  pris: 2190, mcapT: 7920, // mdr INR (7,92 biljoner)
  pe: 15.91, peFwd: 14.17, pb: 7.15, bvps: 303.01,
  evEbit: 11.07, pegKalla: 2.35,
  roe: 0.4774, roic: 0.6638, wacc: 0.0522, beta: 0.17,
  bruttoTtm: 0.4039, ebitTtm: 0.2489, nettoTtm: 0.1805, fcfTtm: 0.1746,
  skuldEk: 0.10, skuldT: 113.09, kassaT: 450.31, // mdr INR
  omsTtmT: 2758.59, resTtmT: 497.99, fcfTtmT: 481.59, epsTtm: 137.64,
  utdAktie: 111, payout: 0.7992, ttmTillvaxt: 0.077,
  lv52: [1976.8, 3350],
};

// CAGR endpoint FY2022→FY2026 = 4 perioder (FEM räkenskapsår — fältet
// "5ar" blir här bokstavligen sant; dokumenterad not i protokollet)
const cagr4 = (a, b) => Math.pow(b / a, 1 / 4) - 1;
const omsCagr = cagr4(R.oms5[0], R.oms5[4]);
const resCagr = cagr4(R.res5[0], R.res5[4]);
const prognos = R.pe / R.peFwd - 1; // TTE-konventionen (trailing/fwd)
const peg = R.pe / (prognos * 100); // spårkonvention (HSBC/MA/ASML)
const fcfYield = R.fcfTtmT / R.mcapT;
const bruttoSerie5 = R.brutto5.map((g, i) => g / R.oms5[i]);
const bruttoMedel = bruttoSerie5.reduce((a, b) => a + b, 0) / bruttoSerie5.length;
const bruttoSpread = Math.max(...bruttoSerie5) - Math.min(...bruttoSerie5);
const ebitTtmAbs = R.omsTtmT * R.ebitTtm;
const evEbitReplik = (R.mcapT + R.skuldT - R.kassaT) / ebitTtmAbs;
const aktier = (R.resTtmT * 1000) / R.epsTtm; // M st (NI/EPS)
const ekReplik = R.bvps * aktier; // M INR
const roeReplik = (R.resTtmT * 1000) / ekReplik;

const rad = {
  ticker: "TCS.NS",
  namn: "Tata Consultancy Services Limited",
  bransch: "teknik",
  land: "Indien",
  valuta: "INR",
  kallor: [
    {
      namn: "StockAnalysis",
      hamtat: "2026-09-18",
      url: "https://stockanalysis.com/quote/nse/TCS/",
      paranoid:
        "NSE-primärnoteringen (översikt + statistics + financials + cash-flow-statement; underlag S&P Global Market Intelligence + Fiscal.ai; stängningskurs 2026-09-17 15:15 IST): pris, börsvärde, P/E-forward-P/B-EV/EBIT-PEG, marginaler, ROE/ROIC, WACC, utdelning/payout, beta, anställda — 5 räkenskapsår FY2022–FY2026 (april–mars, slutårsetikett) i INR; källans yield-fält 4,78 % avviker från DPS/kurs 5,07 % (källans eget underlag) — notis i raden",
    },
  ],
  hamtat: "2026-09-18",
  pris: R.pris,
  marknadsKapitalMdr: Math.round(R.mcapT * 1000), // 7 920 000 mdr INR
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
    ar: ["2023", "2024", "2025", "2026"],
    omsattning: R.oms,
    resultat: R.res,
    egetKapital: [],
    fcf: R.fcf,
  },
  notering:
    "UNIVERSUMETS FÖRSTA INDIEN-RAD (19:e landet) — och teknikgrenens IT-TJÄNSTE-LED föds: ASML (maskinerna) → TSMC (foundry) → 005930.KS (minnet) täcker kapitalets kedja; TCS täcker MÄNNISKAN — världens största renodlade IT-tjänstekoncern med 584 519 anställda och 4,72 M INR i omsättning per anställd (0,85 M i vinst): affärsmodellen ÄR personalen. KONSULTENS KAPITALBALANS: ROIC 66,4 % mot WACC 5,2 % = +61,2 procentenheter — bland universumets bredaste noteringsspridningarna (Mastercards +85,8 pp bredast i noteringssvepet; Nintendos +47,8 pp passerad) — kapitalåtergången i en affär där huvudtillgången går hem varje kväll; nettokassa 337,2 mdr INR (93,20 per aktie; kassa 450,3 − skuld 113,1), skuld/EK 0,10. TJÄNSTEAFFÄRENS KASSAFLÖDESIDENTITET: driftskassa 520,9 mdr INR FY2026 mot resultat 492,1 = 106 % — tjänsteintäkter faktureras och betalas (kontrast mot lagerbärande branschgrannar); FCF +394 → +421 → +449 → +479 mdr INR fyra raka; capex 25,3 → 22,0 → 39,8 → 42,2 mdr = 1,6–2,0 % av omsättningen — foundry-kontrasten: TSMC/Samsung binder hundratals miljarder i fabriker, konsulten hyr kompetens. TILLVÄXTNEDGÅNGEN: omsättning +6,0 % → +4,6 % (FY2025→FY2026) med TTM +7,7 %, resultat +5,5 % → +1,4 % med TTM +1,1 % — indisk IT möter lönekostnadsinflation och AI-automatiseringens fråga; endpoint-CAGR FY2022→FY2026 omsättning +8,6 %/år, resultat +6,4 %/år — och FÖRSTA GÅNGEN I UNIVERSUMET beräknas fältet 'CAGR5ar' på FEM räkenskapsår (den ärvda flaggan 'namnet vs 4 perioder' är här bokstavligen sant). UTDDELNINGSMASKINEN: utdelningar betalda 133 → 413 → 251 → 449 → 394 mdr INR FY2022–FY2026 — indisk interim+special-policy ger taggig serie (källans '1 år utdelningstillväxt' är ett fältartefakt av YoY-fallet −12,6 %, ej historien) + återköp 180 → 42 → 210 → 0 → 0 (programmen pausade sedan FY2024); DPS 111 INR (5,07 % på kursen 2 190; källans yield-fält 4,78 % bär dess eget underlag — notis) med payout 79,9 % — utdelningsandelen bland universumets högsta mot en balansräkning som inte behöver kapitalet. VARDERINGEN: P/E 15,91 mot forward 14,17 ⇒ prognosTillväxt +12,3 % (TTE-konventionen; källans 3-års EPS-prognos +5,44 %/år som kontrast-not — konsensus kalibrerad lägre än TTE-gapet), PEG 1,30 spårkonvention (källans 2,35 som not — ENEA/NOTE-klassens källspridning); P/B 7,15 (källans) mot pris/BVPS 7,23 (BVPS 303,01) — equity-måttens inre spridning, 005930.KS-notisens kusin; EV/EBIT 11,07 replikerbar ((7 920 + 113,1 − 450,3) ÷ 686,6 TTM-EBIT ≈ 11,0); fcfYield 6,1 % (481,6 ÷ 7 920). MARGINALTRAPPAN: brutto 40,4 % → EBIT 24,9 % → netto 18,1 % — lönekostnaden är affären; bruttomarginalens 5-årsmedel 40,97 % med spread 4,98 pp = vallgravens stadiga form (FY2022 43,3 % → FY2025 38,3 % → TTM-vändning upp). ROE-NOTIS: källans 47,74 % mot egen replik 45,4 % (NI ÷ (BVPS × aktier)) — källans equity-underlag skiljer; fältet bär källans tal. FY2026:S FÖRVÄRVSSPOR: investing-kassaflödet −128,5 mdr med acquisitions −67,7 mdr — första större förvärvet i en annars organiskt växt historia. KURSEN: NSE-primärnotering 2 190 INR (2026-09-17), 52-vägers spann 1 976,80–3 350,00 (kursen nära bottenspannet efter IT-sektorns AI-osäkerhetsreträtt), beta 0,17 — bland universumets lugnaste (endast DNO −0,15, TRYG/LMT 0,10, COP 0,13, NTDOY 0,14 lägre av 32 noterade); institutioner 89,2 %, insiders 0,01 %; börsvärde 7,92 biljoner INR. RÄKENSKAPSÅRET april–mars (FY2026 = apr 2025–mar 2026, slutårsetikett — RBC:s nov–okt-konventions kusin, universumets tredje årskonvention); nästa rapport 2026-10-09 (Q2 FY2027 — teknikgrenens tidigaste kommande rappdag: före ENEA/NOTE 10-22/23, SAP 10-21, Samsung 10-28)",
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
console.log(`APPEND: ${fore.length} → ${efter.length} rader (TCS.NS tillagd)`);

// ── Aritmetikkontroller (13 st — GRÖN/OLL) ────────────────────────────────────
const K = [];
const jfr = (namn, v, exp, tol = 5e-5) =>
  K.push([namn, Math.abs(v - exp) <= tol ? "GRÖN" : `OLL (${v} ≠ ${exp})`]);
jfr("omsCAGR endpoint 4 perioder FY22→FY26 (FEM år — 5ar sant)", Math.round(omsCagr * 10000) / 10000, rad.tillvaxt.omsattningCAGR5ar);
jfr("resCAGR endpoint 4 perioder", Math.round(resCagr * 10000) / 10000, rad.tillvaxt.resultatCAGR5ar);
jfr("prognosTillväxt TTE 15,91/14,17", Math.round(prognos * 10000) / 10000, rad.tillvaxt.prognosTillvaxt);
jfr("PEG 1,30 spårkonvention (källans 2,35 not)", rad.vardering.peg, Math.round((R.pe / (prognos * 100)) * 100) / 100);
jfr("fcfYield 481,59/7 920", rad.vardering.fcfYield, Math.round(fcfYield * 10000) / 10000);
jfr("direktavkastning 111/2 190", R.utdAktie / R.pris, 0.050685, 5e-5);
jfr("payout-replik utd-betald/res FY2026 ≈ källans 79,9 %", R.utd5[4] / R.res5[4], R.payout, 0.005);
jfr("EV/EBIT-replik (mcap+skuld−kassa)/EBIT", evEbitReplik, R.evEbit, 0.06);
jfr("bruttomarginalserie 5 år → medel", Math.round(bruttoMedel * 10000) / 10000, rad.moat.bruttoMarginalMedel5ar);
jfr("bruttospread max−min FY22–FY26", Math.round(bruttoSpread * 10000) / 10000, rad.moat.bruttoMarginalSpread5ar);
jfr("egenKapitalMultipl = pb", rad.vardering.egenKapitalMultipl, rad.vardering.pb);
jfr("serier längd 4/4/4/4 + moat 5", [R.oms.length, R.res.length, R.fcf.length, R.brutto.length, R.brutto5.length].join(""), "44445", 0);
jfr("P/B-notis: pris/BVPS 2 190/303,01 = 7,23 mot källans 7,15", R.pris / R.bvps, 7.2274, 0.001);
jfr("ROE-replik-notis 45,4 % mot källans 47,74", roeReplik, 0.4542, 0.001);
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

for (const [namn, data] of [["FÖRE (" + fore.length + ")", fore], ["EFTER (" + efter.length + ")", efter]]) {
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
console.log("\n=== LANDMATTA Indien/teknik ===");
console.log("före:", mFore.get("Indien/teknik") ?? 0, "→ efter:", mEfter.get("Indien/teknik") ?? 0, "(MIN_MATTA=5)");
const p4 = [...mEfter.entries()].filter(([, v]) => v === 4).map(([k]) => k);
const p3 = [...mEfter.entries()].filter(([, v]) => v === 3).map(([k]) => k);
console.log("celler på matta 4 (koordinater):", p4.join(", ") || "—");
console.log("celler på matta 3 (+2 krävs):", p3.join(", ") || "—");
const landEfter = new Set(efter.map((b) => b.land));
console.log("länder:", landEfter.size);

// ── Slutlig verifiering: radens innehåll i filen ─────────────────────────────
const s = efter.find((b) => b.ticker === "TCS.NS");
console.log("\nTCS.NS i filen:", s ? `${s.ticker} ${s.namn} ${s.bransch}/${s.land} pe=${s.vardering.pe} pb=${s.vardering.pb} peg=${s.vardering.peg} fcfY=${s.vardering.fcfYield}` : "SAKNAS");
console.log("SUMMA kontroller GRÖNA:", K.filter(([, st]) => st === "GRÖN").length + "/" + K.length);
