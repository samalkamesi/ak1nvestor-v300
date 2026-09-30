#!/usr/bin/env node
/**
 * s2-u1 (manifest auto-s2-1790799927010) — GLEN.L Glencore-append i
 * data/portfolj-system/bolagsunivers.json (universum 322→323).
 *
 * Konventioner (spår 2, LON-/BP.L-familjen):
 *  - idempotensguard: SKIP om GLEN.L redan finns (race-disciplin)
 *  - aritmetikgrind med ABORT FÖRE skrivning (14 kontroller)
 *  - medianer mätta i PROCESSMINNET före skrivning + efter (omg6-konventionen)
 *  - ALL data live-hämtad 2026-09-30 från stockanalysis.com /quote/lon/GLEN/
 *    (+statistics +financials +balance-sheet +cash-flow-statement), S&P GMI.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execSync, execFileSync } from "node:child_process";

const FIL = "data/portfolj-system/bolagsunivers.json";
const u = JSON.parse(readFileSync(FIL, "utf8"));

// ── idempotensguard ─────────────────────────────────────────────────────────
if (u.some((r) => r.ticker === "GLEN.L")) {
  console.log("SKIP: GLEN.L finns redan — append idempotent, inget görs.");
  process.exit(0);
}

// ── medianreplik (dataset-medianer.ts, EXAKT — _nyttovalt-llms-regen-mönstret)
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
const stat = (rader, f, pct) => {
  const v = rader.map((b) => f(b) ?? null);
  const n = v.filter((x) => typeof x === "number" && Number.isFinite(x)).length;
  const omv = (x) => (x === null ? null : pct ? Math.round(x * 1000) / 10 : Math.round(x * 100) / 100);
  return { median: omv(median(v)), p25: omv(percentil(v, 0.25)), p75: omv(percentil(v, 0.75)), n };
};
const mät = (label, rader) => {
  console.log(`  ${label}: P/E ${JSON.stringify(stat(rader, (b) => b.vardering?.pe, false))} ` +
    `P/B ${JSON.stringify(stat(rader, (b) => b.vardering?.pb, false))} ` +
    `EBIT ${JSON.stringify(stat(rader, (b) => b.lonksamhet?.ebitMarginal, true))} ` +
    `FCF ${JSON.stringify(stat(rader, (b) => b.lonksamhet?.fcfMarginal, true))} ` +
    `tillv ${JSON.stringify(stat(rader, (b) => b.tillvaxt?.omsattningTillvaxtTTM, true))} ` +
    `resCAGR ${JSON.stringify(stat(rader, (b) => b.tillvaxt?.resultatCAGR5ar, true))}`);
};
const mätTotalt = (label, rader) => {
  console.log(`  ${label}: totalt P/E ${JSON.stringify(stat(rader, (b) => b.vardering?.pe, false))} ` +
    `resCAGR ${JSON.stringify(stat(rader, (b) => b.tillvaxt?.resultatCAGR5ar, true))}`);
};
const matta = (rader) => {
  const m = {};
  for (const r of rader) m[`${r.land}|${r.bransch}`] = (m[`${r.land}|${r.bransch}`] ?? 0) + 1;
  return m;
};

console.log(`FÖRE (${u.length} rader):`);
mät("material", u.filter((r) => r.bransch === "material"));
mätTotalt("universum", u);
const mattorFöre = matta(u);
console.log(`  Storbritannien|material-matta: ${mattorFöre["Storbritannien|material"] ?? 0}`);

// ── källdata (stockanalysis lon/GLEN, S&P GMI, påläst 2026-09-30) ───────────
const K = {
  prisGBX: 555.20, aktierMdr: 11.737, mcapMdrGBP: 64.76,
  pe: 16.26, fwdPe: 12.14, eps: 0.34, nettoTTM_229fönster: 4.09e9, intaktTTM_229fönster: 229.55e9,
  pb: 2.33, ekStats: 27.75, evEbit: 13.68, ev: 92.71, evEarnings: 22.68,
  skuld: 34.47, kassa: 2.82, skuldEk: 1.24, rantaTack: 2.17,
  fcfStats: -1.01e9, fcfYield: -0.0156,
  brutto: 0.0340, ebit: 0.0239, netto: 0.0178, roe: 0.1604, roic: 0.0815, wacc: 0.0689,
  peg: 0.66, payout: 0.2926,
  oms: [203751e6, 255984e6, 217829e6, 230944e6, 247535e6],
  res: [4974e6, 17320e6, 4280e6, -1634e6, 363e6],
  bruttoVinst: [12448e6, 27517e6, 10778e6, 6282e6, 6124e6],
  ekSerie: [36917e6, 45219e6, 38237e6, 35660e6, 33606e6],
  fcf: [5242e6, 9482e6, 6552e6, 4444e6, -290e6],
  ttmOms: 304569e6, ttmFcf: -1343e9 / 1000 * 1000, // -1 343 MUSD (cash-flow-sidans TTM Jun'26)
  ttmTillv: 0.2304, divFY25Mdr: 1.192,
};
K.ttmFcf = -1343e6;

// ── ARITMETIKGRIND (ABORT FÖRE skrivning) ───────────────────────────────────
const fel = [];
const jamfor = (id, beräknad, kalla, relTol, absTol) => {
  const diff = Math.abs(beräknad - kalla);
  const grans = Math.max(Math.abs(kalla) * relTol, absTol ?? 0);
  const ok = diff <= grans;
  if (!ok) fel.push(`${id}: beräknad ${beräknad} mot källa ${kalla} (diff ${diff} > ${grans})`);
  console.log(`  [${ok ? "OK" : "FEL"}] ${id}: ${beräknad} mot ${kalla}`);
};

console.log("\nARITMETIKGRIND (14 kontroller):");
// 1. mcap-replik via aktier (avrundat aktieantal ⇒ 1 %-tolerans)
jamfor("mcap = pris×aktier", (K.prisGBX / 100) * K.aktierMdr, K.mcapMdrGBP, 0.01);
// 2. P/E-replik: mcap÷(EPS×aktier)
jamfor("P/E = mcap÷(EPS×aktier)", K.mcapMdrGBP / (K.eps * K.aktierMdr), K.pe, 0.005);
// 3. P/B-replik på källans statistics-EK
jamfor("P/B = mcap÷EK(stats)", K.mcapMdrGBP / K.ekStats, K.pb, 0.005);
// 4. skuld/EK-replik
jamfor("skuld/EK = 34,47÷27,75", K.skuld / K.ekStats, K.skuldEk, 0.005);
// 5. fcfYield-replik på samma fönster
jamfor("fcfYield = −1,01÷64,76", K.fcfStats / (K.mcapMdrGBP * 1e9), K.fcfYield, 0.005, 0.0005);
// 6. netto-marginal på 229-fönstret
jamfor("nettoMarg = 4,09÷229,55", K.nettoTTM_229fönster / K.intaktTTM_229fönster, K.netto, 0.005);
// 7. EV/Earnings internt
jamfor("EV/E = 92,71÷4,09", K.ev / (K.nettoTTM_229fönster / 1e9), K.evEarnings, 0.005);
// 8. omsCAGR (absTol = avrundningsprecision 4 decimaler)
const omsCAGR = Math.pow(K.oms[4] / K.oms[0], 1 / 4) - 1;
jamfor("omsCAGR (247535/203751)^¼−1", omsCAGR, 0.0499, 0.00001, 0.00005);
// 9. resCAGR (endpoint positiva ⇒ mätbar)
if (K.res[0] <= 0 || K.res[4] <= 0) fel.push("resCAGR: endpoint ej positiva — konvention kräver OSATT");
else {
  const resCAGR = Math.pow(K.res[4] / K.res[0], 1 / 4) - 1;
  jamfor("resCAGR (363/4974)^¼−1", resCAGR, -0.4802, 0.00001, 0.00005);
}
// 10. prognosTillväxt implicit trailing→fwd
jamfor("prognos = pe÷fwdPe−1", K.pe / K.fwdPe - 1, 0.3394, 0.0001);
// 11. moat: bruttomarginalserie medel+spread (procentenheter)
const bm = K.bruttoVinst.map((g, i) => (g / K.oms[i]) * 100);
const moatMedel = bm.reduce((a, b) => a + b, 0) / bm.length;
const moatSpread = Math.max(...bm) - Math.min(...bm);
jamfor("moat medel 5 år", moatMedel, 5.40, 0, 0.05);
jamfor("moat spread 5 år", moatSpread, 8.28, 0, 0.05);
if (bm.some((x) => x <= 0)) fel.push("bruttovinstserie ej positiv — moat kan ej fyllas");
// 12. fcfMarginal på källans TTM-kolumner (avrundningsprecision 1e-5)
jamfor("fcfMarginal = −1343÷304569", K.ttmFcf / K.ttmOms, -0.0044, 0.0001, 0.00001);
// 13. ROIC−WACC (dokumentationskontroll)
jamfor("ROIC−WACC", K.roic - K.wacc, 0.0126, 0.0001);
// 14. fcfPositiva 5 år = 4
const fcfPos = K.fcf.filter((x) => x > 0).length;
if (fcfPos !== 4) fel.push(`fcfPositivaSenaste5: räknat ${fcfPos} mot angivet 4`);
else console.log("  [OK] fcfPositivaSenaste5: 4 av 5 (2025 negativt)");

if (fel.length) {
  console.error(`\nGRIND RÖD — ${fel.length} fel, ABORT FÖRE skrivning:`);
  fel.forEach((f) => console.error("  ✗ " + f));
  process.exit(1);
}
console.log("\nGRIND GRÖN — 14/14, skriver raden.");

// ── raden ───────────────────────────────────────────────────────────────────
const rad = {
  ticker: "GLEN.L",
  namn: "Glencore plc",
  bransch: "material",
  land: "Storbritannien",
  valuta: "GBX",
  kallor: [
    {
      namn: "StockAnalysis",
      hamtat: "2026-09-30",
      url: "https://stockanalysis.com/quote/lon/GLEN/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/)",
      paranoid: "LSE-primärnotering (lon-vägen bar full panel — NG.L/RR.L/LLOY.L-precedenserna), S&P Global Market Intelligence-underlag (semi-annual-synk), sidor pålästa 2026-09-30 med kurs 555,20 GBX intraday 17:03 GMT: pris i PENCE (BP.L-konventionen; £5,552) · aktier 11,737 mdr · mcap 64,76 mdr GBP (replik 5,552×11,737 = 65,17, 0,6 % — avrundat aktieantal); FÖNSTERDUALITETEN dokumenterad: overview/statistics bär TTM ca Sep-25-basen (intäkter 229,55 mdr USD · netto 4,09 ⇒ P/E 16,26 · EBIT-marg 2,39 % · EV/EBIT 13,68 · EV/E 22,68 med EV-internt-repliken 92,71÷4,09 = 22,67 EXAKT) medan financials-sidorna bär TTM Jun-26 (intäkter 304 569 · netto 5 423 ⇒ beräknad färsk P/E 11,9 som kontrast-not — Veolia-klassen 'statistics = annan bas, avvikelsen dokumenterad', S&P:s halvårssynk); EV-identiteten mcap 64,76 + skuld 34,47 − kassa 2,82 = 96,41 mot källans EV 92,71 ⇒ −3,70 mdr bär minoritets-/pensionsjusteringar (källans EV-fält bärs); P/B 2,33 = mcap÷EK 27,75 (källans statistics-EK; balance-sheet Total Common Equity FY25 38,86 ⇒ replik på den basen 1,67 — fältet bärs, fönster-/definitionsavvikelsen dokumenterad); skuld/EK 1,24 = 34,47÷27,75 EXAKT (balance-sheet-skulden 42,1 FY25/45,7 TTM = samma fönsterskillnad, dokumenterad); prognosTillväxt +33,94 % implicit ur trailing 16,26/fwd 12,14 (ASML/Veolia-normaliseringsgapklassen; källans EGEN 3-års EPS-prognos +45,53 %/år som kontrast-not); PEG 0,66 källans fält (spårvägen pe÷prognos = 0,48 dokumenterad); brutto 3,40 % · EBIT 2,39 % · netto 1,78 % (= 4,09÷229,55 EXAKT) · FCF n/a i statistics ⇒ fcfMarginal beräknad på källans TTM-kolumner −1 343÷304 569 = −0,44 %, fcfYield −1,56 % källans fält (replik −1,01÷64,76 EXAKT); ROE 16,04 % · ROIC 8,15 % mot WACC 6,89 % ⇒ +1,26 pp (svagt positivt); räntetäckning 2,17; Piotroski 6 · Altman 2,78; utdelning FY2025 1,192 mdr USD payout 29,26 % + återköp 1,992 mdr (buyback-yield 0,94 %/härled 3,22 %) · ex-div 2026-08-27 · dividend 0,13 (2,29 %); insiders 12,81 % (Glasenberg-arvets storägare kvar); beta 0,52; 52-v 332,20–707,20 GBX; analytiker Buy 644,00 GBX (20 st — värderingsnot, ej rekommendation); nästa rapp 2026-10-29; ASX-andranotering GLC beräknad 2026-10-14 (nyhetsnot); 140 000 anställda; grundat 1974; branschfältet material = källans Sector Materials/Industry Other Industrial Metals & Mining; land Storbritannien = PRIMÄRNOTINGENS land (LSE; huvudkontor Baar/registrerat Jersey dokumenterat — SHEL-noteringsland-konventionen); FY kalenderår; SERIERNAS signatur: handlarhusets volymprofil — bruttomarginaler 6,11/10,75/4,95/2,72/2,47 % (universumets materialgren bär gruvoir 40–90 %; GLEN 2–11 % = marketing-modellens köp-och-sälj-marginal) med moat-FÄLTEN FYLDA (medel 5,40 % spread 8,28 pp — 5-årig bruttovinstserie finns, BASF-klassen); netto −1 634 MUSD FY2024 = förlustår MITTEN i serien (koboltprisras + juridiska nedskrivningar; Enagás-klassen — CAGR definierad, endpoint 4 974→363 båda positiva) ⇒ resCAGR −48,02 %/år bär cykeln 2022-topp → 2025-botten, dokumenterat; FCF 5 242/9 482/6 552/4 444/−290 med TTM Jun-26 −1 343 (capexupptrappning 3,6→6,8 mdr); EK-serien bär totalt EK inkl minoritet (Veolia-konventionen)"
    }
  ],
  hamtat: "2026-09-30",
  pris: 555.2,
  marknadsKapitalMdr: 64.76,
  tillvaxt: {
    omsattningCAGR5ar: 0.0499,
    resultatCAGR5ar: -0.4802,
    omsattningTillvaxtTTM: 0.2304,
    prognosTillvaxt: 0.3394
  },
  lonksamhet: {
    roe: 0.1604,
    roic: 0.0815,
    bruttoMarginal: 0.034,
    ebitMarginal: 0.0239,
    nettoMarginal: 0.0178,
    fcfMarginal: -0.0044
  },
  stabilitet: {
    skuldEgenkapital: 1.24,
    rantaTackning: 2.17,
    fcfPositivaSenaste5: 4,
    kassaManaderBurnRate: null,
    nyemissionerSenaste5ar: null
  },
  aterkop: {
    senasteArMdr: 1.192,
    andelUtestande: null,
    insiderkopSenaste6man: null
  },
  moat: {
    bruttoMarginalMedel5ar: 5.4,
    bruttoMarginalSpread5ar: 8.28,
    roeMedel5ar: null
  },
  vardering: {
    pe: 16.26,
    pb: 2.33,
    evEbit: 13.68,
    peg: 0.66,
    fcfYield: -0.0156,
    egenKapitalMultipl: 2.33
  },
  golv: {
    typ: "osatt",
    vardePerAktie: null,
    marginal: null
  },
  serier: {
    ar: ["2021", "2022", "2023", "2024", "2025"],
    omsattning: [203751000000, 255984000000, 217829000000, 230944000000, 247535000000],
    resultat: [4974000000, 17320000000, 4280000000, -1634000000, 363000000],
    egetKapital: [36917000000, 45219000000, 38237000000, 35660000000, 33606000000],
    fcf: [5242000000, 9482000000, 6552000000, 4444000000, -290000000]
  }
};

// ── append + läs-tillbaka ×2 ────────────────────────────────────────────────
const slut = [...u, rad];
writeFileSync(FIL, JSON.stringify(slut, null, 2) + "\n");
const tb1 = JSON.parse(readFileSync(FIL, "utf8"));
const tb2 = JSON.parse(readFileSync(FIL, "utf8"));
if (tb1.length !== slut.length || tb2.length !== slut.length) {
  console.error("LÄS-TILLBAKA FEL — längd avviker, ABORT.");
  process.exit(1);
}
const g1 = tb1.find((r) => r.ticker === "GLEN.L");
const g2 = tb2.find((r) => r.ticker === "GLEN.L");
if (!g1 || !g2 || JSON.stringify(g1) !== JSON.stringify(rad) || JSON.stringify(g2) !== JSON.stringify(rad)) {
  console.error("LÄS-TILLBAKA FEL — raden avviker, ABORT.");
  process.exit(1);
}

console.log(`\nEFTER (${tb1.length} rader):`);
mät("material", tb1.filter((r) => r.bransch === "material"));
mätTotalt("universum", tb1);
const mattorEfter = matta(tb1);
console.log(`  Storbritannien|material-matta: ${mattorEfter["Storbritannien|material"] ?? 0} (tröskel 5 för landsida — ej nådd)`);

console.log("\nmd5 före/efter:");
// Mimosa-härdning (o59): array-form utan skal — FIL är filscope-konstant.
console.log(execFileSync("git", ["hash-object", FIL]).toString().trim());
console.log("APPEND KLAR: GLEN.L — universum " + u.length + "→" + tb1.length);
