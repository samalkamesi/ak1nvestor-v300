#!/usr/bin/env node
/**
 * s2-u1 omg11 — APPEND Royal Bank of Canada (RY, finans, Kanada) till
 * data/portfolj-system/bolagsunivers.json (153→154; universumets första
 * Kanada-rad, 17:e landet).
 *
 * Metod (spårets etablerade): textbaserad kirurgisk insert före slut-]-parentesen
 * (minimal diff, befintlig formattering orörd — omg9:s normaliseringsläxa), idempotensguard,
 * aritmetikverifierad EFTER append, medianer/kvartiler före/efter med EXAKT replik av
 * raknaBranschMedianer (src/lib/dataset-medianer.ts), landmatta-svep enligt omg8-rättasen
 * (P/E-matta: r.land===L && r.bransch===B && isFinite(pe)), aspektmedian resultat-cagr.
 *
 * Data: stockanalysis.com översikt+statistics+financials+cash-flow (S&P-underlag),
 * close 2026-09-16 16:00 EDT, sidor pålästa 2026-09-17. Serier i MCAD, oktober-bokslut.
 */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(FIL, "utf8");
const u = JSON.parse(raw);
if (!Array.isArray(u)) throw new Error("universumet är inte en array");
if (u.some((b) => b.ticker === "RY")) {
  console.log("IDEMPOTENT: RY finns redan — avslutar utan ändring");
  process.exit(0);
}
const fore = JSON.parse(raw); // färsk kopia för före-mätning

// ── RBC-rådata (MCAD; oktober-bokslut FY2022–FY2025; USD-ADR-kurs 2026-09-16) ──
const R = {
  oms: [48501, 48996, 54112, 62243],
  res: [15547, 14369, 15908, 19868],
  fcf: [-89091, -20641, -70737, -53108],
  utd: [6713, 5313, 6315, 8306],
  kop: [11127, 4075, 6667, 13495],
  pris: 202.29, mcap: 281.18, pe: 17.89, peFwd: 16.23, pb: 2.72, ptbv: 3.68,
  roe: 0.1621, ebitM: 0.457, nettoM: 0.3387, wacc: 0.0407, beta: 0.92,
  utdAktie: 4.92, payout: 0.4349, epsTtm: 11.31, ttmTillvaxt: 0.1141,
};

const cagr = (a, b) => Math.pow(b / a, 1 / 3) - 1; // 4 räkenskapsår = 3 perioder (endpoint)
const omsCagr = cagr(R.oms[0], R.oms[3]);
const resCagr = cagr(R.res[0], R.res[3]);
const prognos = R.pe / R.peFwd - 1; // TTE-konventionen (trailing/fwd)
const peg = R.pe / (prognos * 100); // spårkonvention (HSBC/MA)

const rad = {
  ticker: "RY",
  namn: "Royal Bank of Canada",
  bransch: "finans",
  land: "Kanada",
  valuta: "USD",
  kallor: [
    {
      namn: "StockAnalysis",
      hamtat: "2026-09-17",
      url: "https://stockanalysis.com/stocks/ry/",
      paranoid:
        "översikt + statistics + financials + cash-flow-statement (underlag S&P Global Market Intelligence + Fiscal.ai; stängningskurs 2026-09-16 16:00 EDT, sidorna pålästa 2026-09-17): pris, börsvärde, P/E-P/B-P/TBV, marginaler, ROE, WACC, utdelning/payout, beta — 4 räkenskapsår FY2022–FY2025 (november–oktober) i MCAD; bankkonvention: källan saknar bruttomarginal/ROIC/EV-mått (n/a) och redovisar FCF i kundmedelsflödenas värld",
    },
  ],
  hamtat: "2026-09-17",
  pris: R.pris,
  marknadsKapitalMdr: R.mcap,
  tillvaxt: {
    omsattningCAGR5ar: Math.round(omsCagr * 10000) / 10000,
    resultatCAGR5ar: Math.round(resCagr * 10000) / 10000,
    omsattningTillvaxtTTM: R.ttmTillvaxt,
    prognosTillvaxt: Math.round(prognos * 10000) / 10000,
  },
  lonksamhet: {
    roe: R.roe,
    roic: null,
    bruttoMarginal: null,
    ebitMarginal: R.ebitM,
    nettoMarginal: R.nettoM,
    fcfMarginal: null,
  },
  stabilitet: {
    skuldEgenkapital: null,
    rantaTackning: null,
    fcfPositivaSenaste5: null,
    kassaManaderBurnRate: null,
    nyemissionerSenaste5ar: null,
  },
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: null },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
  vardering: {
    pe: R.pe,
    pb: R.pb,
    evEbit: null,
    peg: Math.round(peg * 100) / 100,
    fcfYield: null,
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
    "UNIVERSALBANKENS FYRSTATSMÄSTARE (Kanadas största bolag, universumets FÖRSTA Kanada-rad — 17:e landet): segmenten FY2025 i MCAD — Personal Banking 19 854 · Commercial 8 562 · Wealth Management 22 378 (STÖRSTA segmentet — förvaltningen har vuxit förbi banksalen) · Insurance 1 321 · Capital Markets 14 426 — fördelningen gör RBC till nordamerikansk universalbank där kapitalförvaltning är störst, mot JPM:s deposits- och marknadstyngd; HSBC CANADA-FÖRVÄRVET FY2024 (12,7 mdr CAD kontant) syns i Personal Bankings hopp 15 471→17 342 MCAD — omsättningstillväxten +10,4 % FY2024 och +15,0 % FY2025 är delvis förvärvad (organisk kontra förvärvad tillväxt, tx-01-lektionen). BANKKONVENTIONEN (femte depositionsbanken efter GS/JPM/Nordea/HSBC): roic/skuld-EK/EV-EBIT ej meningsfullt jämförbart — null; källans fritt kassaflöde −53,1 mdr CAD FY2025 (serien −89,1→−20,6→−70,7→−53,1) = KUNDMEDELSFLÖDEN (depositioner och lånebok flyttar kassaflödet), ej utdelningskapacitet — fcfYield/fcfMarginal null; källans netto kassa 238 mdr USD är balansräkenskapsartefakt (kassan är kundernas pengar); bruttomarginal null (bank saknar varukostnad). UTDDELNINGSSERIEN 6 713→5 313→6 315→8 306 MCAD (vanliga aktier; FY2023:s sänkning = pandemiförsiktighet) med TTM 8 876 + återköp 4 075→6 667→13 495→18 772 MCAD = återbetalningstrappan; direktavkastning 2,43 % (4,92 USD/ADR) med payout 43,5 % och utdelningstillväxt +13,6 % senaste året. RÄKENSKAPSÅRET november–oktober (FY2025 slut 2025-10-31; Q3 FY2026 rapporterad 2026-08-27, nästa rapport Q4 december 2026) — ytterligare ett avvikande bokslutsår i universumet (BHP juli–juni, TM/BABA april–mars), slutår-etiketter. VÄRDERINGEN: P/E 17,89 mot forward 16,23 ⇒ prognosTillväxt +10,2 % implicit (TTE-konventionen) — källans 3-års EPS-prognos +10,4 %/år sammanfaller nästan exakt (ovanligt väl kalibrerat gap); PEG 1,75 spårkonvention; P/B 2,72 mot P/TBV 3,68 (bankernas eget substansmått — det tangibla bokförda kapitalet); ROE 16,2 % mot WACC 4,07 % = universalbankens marginal mot kapitalkostnaden. KURSEN: 52-vägers 143,13–218,57 USD (+39,1 %, kursen i övre delen av spannet) med beta 0,92; NYSE-ADR 1:1 (kurs och marknadsvärde i USD, serierna i CAD — växelkursen driver differensen mellan världarna)",
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
console.log(`APPEND: ${fore.length} → ${efter.length} rader (RY tillagd)`);

// ── Aritmetikkontroller (8 st — GRÖN/OLL) ────────────────────────────────────
const K = [];
const jfr = (namn, v, exp, tol = 5e-5) =>
  K.push([namn, Math.abs(v - exp) <= tol ? "GRÖN" : `OLL (${v} ≠ ${exp})`]);
jfr("omsCAGR endpoint 3 perioder", Math.round(omsCagr * 10000) / 10000, rad.tillvaxt.omsattningCAGR5ar);
jfr("resCAGR endpoint 3 perioder", Math.round(resCagr * 10000) / 10000, rad.tillvaxt.resultatCAGR5ar);
jfr("prognosTillväxt TTE 17,89/16,23", Math.round(prognos * 10000) / 10000, rad.tillvaxt.prognosTillvaxt);
jfr("PEG 1,75 spårkonvention", rad.vardering.peg, Math.round((R.pe / (prognos * 100)) * 100) / 100);
jfr("direktavkastning 4,92/202,29", R.utdAktie / R.pris, 0.02432, 5e-4);
jfr("payout×EPS = utdelning", R.payout * R.epsTtm, R.utdAktie, 5e-3);
jfr("egenKapitalMultipl = pb", rad.vardering.egenKapitalMultipl, rad.vardering.pb);
jfr("serier längd 4/4/4", [R.oms.length, R.res.length, R.fcf.length].join(""), "444", 0);
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
  fTill = (b) => b.tillvaxt?.omsattningTillvaxtTTM, fRes = (b) => b.tillvaxt?.resultatCAGR5ar;

for (const [namn, data] of [["FÖRE (153)", fore], ["EFTER (154)", efter]]) {
  const fin = data.filter((b) => b.bransch === "finans");
  const tot = data;
  console.log(`\n=== ${namn} ===`);
  console.log(`finans: ${fin.length} bolag | P/E`, JSON.stringify(stat(fin, fPe, false)),
    "| P/B", JSON.stringify(stat(fin, fPb, false)));
  console.log(`finans EBIT%:`, JSON.stringify(stat(fin, fEbit, true)),
    "FCF%:", JSON.stringify(stat(fin, fFcf, true)), "tillv%:", JSON.stringify(stat(fin, fTill, true)));
  console.log(`TOTALT: P/E`, JSON.stringify(stat(tot, fPe, false)), "P/B", JSON.stringify(stat(tot, fPb, false)));
  console.log(`TOTALT resultatCAGR%:`, JSON.stringify(stat(tot, fRes, true)));
  console.log(`finans resultatCAGR%:`, JSON.stringify(stat(fin, fRes, true)));
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
console.log("\n=== LANDMATTA Kanada/finans ===");
console.log("före:", mFore.get("Kanada/finans") ?? 0, "→ efter:", mEfter.get("Kanada/finans") ?? 0, "(MIN_MATTA=5)");
const p4 = [...mEfter.entries()].filter(([, v]) => v === 4).map(([k]) => k);
const p5 = [...mEfter.entries()].filter(([, v]) => v === 5).map(([k]) => k);
console.log("celler på matta 4 (koordinater):", p4.join(", ") || "—");
console.log("celler på matta 5 (öppnar vid +1):", p5.join(", ") || "—");

// ── Slutlig konfiguration: RY-radens innehåll verifierat i filen ──────────────
const ry = efter.find((b) => b.ticker === "RY");
console.log("\nRY i filen:", ry ? `${ry.ticker} ${ry.namn} ${ry.bransch}/${ry.land} pe=${ry.vardering.pe} pb=${ry.vardering.pb} peg=${ry.vardering.peg}` : "SAKNAS");
console.log("SUMMA kontroller GRÖNA:", K.filter(([, s]) => s === "GRÖN").length + "/" + K.length);
