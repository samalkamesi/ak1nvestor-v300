#!/usr/bin/env node
/**
 * s2-u2 (manifest auto-s2-1790861711679, omgång 34) — SU.PA + LR.PA append i
 * data/portfolj-system/bolagsunivers.json (universum 328→330) ⇒
 * Frankrike|industri-mattan 3→5 (aspektsidan /dataset/industri/frankrike
 * föds datadrivet vid nästa gröna bygge).
 *
 * Konventioner (spår 2, epa-familjen — VIE.PA-precedensen):
 *  - idempotensguard: SKIP om SU.PA/LR.PA redan finns (race-disciplin)
 *  - aritmetikgrind med ABORT FÖRE skrivning (16+16 kontroller)
 *  - medianer/kvartiler/mattor mätta i PROCESSMINNET före + efter
 *  - ALL data live-hämtad 2026-10-01 från stockanalysis.com /quote/epa/SU/ +
 *    /quote/epa/LR/ (fem ytor per bolag, curl-html ordagrant — kanonfilerna
 *    /tmp/s2u2/su-kanon.json + lr-kanon.json), S&P Global Market Intelligence.
 *  - pris = Previous Close (SAMPO/Veolia-konventionen: fördröjd slutnotering
 *    vid hämtningsläget, innevarande session pågår) — mcap-replikerna EXAKTA.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const FIL = "data/portfolj-system/bolagsunivers.json";
const u = JSON.parse(readFileSync(FIL, "utf8"));

// ── idempotensguard ─────────────────────────────────────────────────────────
const finnes = (t) => u.some((r) => r.ticker === t);
if (finnes("SU.PA") || finnes("LR.PA")) {
  console.log("SKIP: SU.PA/LR.PA finns redan — append idempotent, inget görs.");
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
    `tillv ${JSON.stringify(stat(rader, (b) => b.tillvaxt?.omsattningTillvaxtTTM, true))}`);
};
const mätTotalt = (label, rader) => {
  console.log(`  ${label}: totalt P/E ${JSON.stringify(stat(rader, (b) => b.vardering?.pe, false))} ` +
    `P/B ${JSON.stringify(stat(rader, (b) => b.vardering?.pb, false))} ` +
    `EBIT ${JSON.stringify(stat(rader, (b) => b.lonksamhet?.ebitMarginal, true))}`);
};
const matta = (rader) => {
  const m = {};
  for (const r of rader) m[`${r.land}|${r.bransch}`] = (m[`${r.land}|${r.bransch}`] ?? 0) + 1;
  return m;
};

console.log(`FÖRE (${u.length} rader):`);
mät("industri", u.filter((r) => r.bransch === "industri"));
mätTotalt("universum", u);
const mattorFöre = matta(u);
console.log(`  Frankrike|industri-matta: ${mattorFöre["Frankrike|industri"] ?? 0} (tröskel 5)`);

// ── källdata (stockanalysis epa, S&P GMI, påläst 2026-10-01) ────────────────
// SU = Schneider Electric S.E. — alla tal i M€ där ej annat sägs
const SU = {
  pris: 292.00, aktierMdr: 0.56233, mcapMdr: 164.20,
  eps: 8.31, pe: 35.12, fwdPe: 25.99, peg: 1.73,
  pb: 6.64, ekTTM: 24.736, evEbit: 23.96, ev: 180.76, evE: 38.15,
  omsTTM: 42042, nettoTTM: 4738, bruttoVinstTTM: 17707, fcfTTM: 6187,
  fcfYield: 0.0377, brutto: 0.4212, ebit: 0.1792, netto: 0.1127, fcfMarg: 0.1472,
  roe: 0.1862, roic: 0.1396, wacc: 0.0961,
  skuldTTM: 20.809, nettoSkuld: 16.291, skuldEk: 0.84, rantaTack: 13.31,
  payout: 0.4987, dps: 4.20, divYield: 0.0144, beta: 1.15,
  altman: 3.55, piotroski: 5, anstallda: 159844, grundat: 1836,
  rapp: "2026-10-28", v52l: 220.40, v52h: 312.30, target: 329.93, analytiker: 23,
  revF3Y: 0.1001, aktieForandringYoY: 0.0063,
  oms: [28905, 34176, 35902, 38153, 40152],
  res: [3204, 3477, 4003, 4269, 4163],
  ek: [28109, 26094, 27168, 31280, 24455],
  fcf: [3073, 3647, 4993, 4630, 5059],
  bruttoMargSerie: [0.4097, 0.4060, 0.4181, 0.4264, 0.4208],
  divTrappa: [2.900, 3.150, 3.500, 3.900, 4.200],
  segEM: 34879, segIA: 7163,
};
// LR = Legrand S.A. — alla tal i M€ där ej annat sägs
const LR = {
  pris: 141.60, aktierMdr: 0.26214, mcapMdr: 37.12,
  eps: 4.97, pe: 28.51, fwdPe: 22.13, peg: 1.70,
  pb: 4.93, ekTTM: 7.532, evEbit: 22.54, ev: 42.91, evE: 32.64,
  omsTTM: 10107, nettoTTM: 1315, fcfTTM: 1340,
  fcfYield: 0.0361, brutto: 0.5019, ebit: 0.1884, netto: 0.1301, fcfMarg: 0.1325,
  roe: 0.1821, roic: 0.1099, wacc: 0.0834,
  skuldTTM: 7.724, nettoSkuld: 5.754, skuldEk: 1.03, rantaTack: 10.14,
  payout: 0.4792, dps: 2.38, divYield: 0.0170, beta: 0.99,
  altman: 3.29, piotroski: 4, anstallda: 40931, grundat: 1865,
  rapp: "2026-11-05", v52l: 121.95, v52h: 166.95, target: 168.06, analytiker: 18,
  revF3Y: 0.1179, epsF3Y: 0.1367, divTillvYoY: 0.0818, divAr: 5,
  aktieForandringYoY: 0.0171,
  oms: [6994.2, 8339.4, 8416.9, 8648.9, 9480.6],
  res: [904.5, 999.5, 1148.5, 1166.4, 1244.6],
  ek: [5720, 6643, 6735, 7548, 7334],
  fcf: [972.8, 1059, 1614, 1313, 1356],
  bruttoMargSerie: [0.5083, 0.4972, 0.5226, 0.5164, 0.5083],
  divTrappa: [1.650, 1.900, 2.090, 2.200, 2.380],
  divBetaldTTM: 622.5,
};

// ── ARITMETIKGRIND (ABORT FÖRE skrivning) ───────────────────────────────────
const fel = [];
const jamfor = (id, beräknad, kalla, relTol, absTol) => {
  const diff = Math.abs(beräknad - kalla);
  const grans = Math.max(Math.abs(kalla) * relTol, absTol ?? 0);
  const ok = diff <= grans;
  if (!ok) fel.push(`${id}: beräknad ${beräknad} mot källa ${kalla} (diff ${diff} > ${grans})`);
  console.log(`  [${ok ? "OK" : "FEL"}] ${id}: ${beräknad} mot ${kalla}`);
};
const cagr = (s) => Math.pow(s[4] / s[0], 1 / 4) - 1;
const moatStat = (serie) => {
  const p = serie.map((x) => x * 100);
  return { medel: p.reduce((a, b) => a + b, 0) / p.length, spread: Math.max(...p) - Math.min(...p) };
};

console.log("\nARITMETIKGRIND — SCHNEIDER (16 kontroller):");
jamfor("SU mcap = pris×aktier", SU.pris * SU.aktierMdr, SU.mcapMdr, 0.001);
jamfor("SU P/E = mcap÷(EPS×aktier)", SU.mcapMdr / (SU.eps * SU.aktierMdr), SU.pe, 0.005);
jamfor("SU P/B = mcap÷EK(TTM)", SU.mcapMdr / SU.ekTTM, SU.pb, 0.005);
jamfor("SU EV-identitet mcap+nettoskuld", SU.mcapMdr + SU.nettoSkuld, SU.ev, 0.005);
jamfor("SU EV/EBIT = EV÷(ebit%×oms)", (SU.ev * 1000) / (SU.ebit * SU.omsTTM), SU.evEbit, 0.005);
jamfor("SU EV/E = EV÷netto", (SU.ev * 1000) / SU.nettoTTM, SU.evE, 0.005);
jamfor("SU nettoMarg = 4738÷42042", SU.nettoTTM / SU.omsTTM, SU.netto, 0.005);
jamfor("SU bruttoMarg = 17707÷42042", SU.bruttoVinstTTM / SU.omsTTM, SU.brutto, 0.005);
jamfor("SU fcfYield = 6187÷164200", SU.fcfTTM / (SU.mcapMdr * 1000), SU.fcfYield, 0.005, 0.0005);
jamfor("SU fcfMarg = 6187÷42042", SU.fcfTTM / SU.omsTTM, SU.fcfMarg, 0.005);
jamfor("SU skuld/EK = 20,809÷24,736", SU.skuldTTM / SU.ekTTM, SU.skuldEk, 0.005);
jamfor("SU omsCAGR (40152/28905)^¼−1", cagr(SU.oms), 0.0856, 0.0001, 0.00005);
jamfor("SU resCAGR (4163/3204)^¼−1", cagr(SU.res), 0.0676, 0.0001, 0.00005);
jamfor("SU prognos = pe÷fwdPe−1", SU.pe / SU.fwdPe - 1, 0.3513, 0.0001, 0.00005);
jamfor("SU moat medel 5 år", moatStat(SU.bruttoMargSerie).medel, 41.62, 0, 0.05);
jamfor("SU moat spread 5 år", moatStat(SU.bruttoMargSerie).spread, 2.04, 0, 0.05);
jamfor("SU ROIC−WACC", SU.roic - SU.wacc, 0.0435, 0.0001);
jamfor("SU segment EM+IA = omsTTM", SU.segEM + SU.segIA, SU.omsTTM, 0);

console.log("\nARITMETIKGRIND — LEGRAND (16 kontroller):");
jamfor("LR mcap = pris×aktier", LR.pris * LR.aktierMdr, LR.mcapMdr, 0.001);
jamfor("LR P/E = mcap÷(EPS×aktier)", LR.mcapMdr / (LR.eps * LR.aktierMdr), LR.pe, 0.005);
jamfor("LR P/B = mcap÷EK(TTM)", LR.mcapMdr / LR.ekTTM, LR.pb, 0.005);
jamfor("LR EV-identitet mcap+nettoskuld", LR.mcapMdr + LR.nettoSkuld, LR.ev, 0.005);
jamfor("LR EV/EBIT = EV÷(ebit%×oms)", (LR.ev * 1000) / (LR.ebit * LR.omsTTM), LR.evEbit, 0.005);
jamfor("LR EV/E = EV÷netto", (LR.ev * 1000) / LR.nettoTTM, LR.evE, 0.005);
jamfor("LR nettoMarg = 1315÷10107", LR.nettoTTM / LR.omsTTM, LR.netto, 0.005);
jamfor("LR fcfYield = 1340÷37120", LR.fcfTTM / (LR.mcapMdr * 1000), LR.fcfYield, 0.005, 0.0005);
jamfor("LR fcfMarg = 1340÷10107", LR.fcfTTM / LR.omsTTM, LR.fcfMarg, 0.005, 0.0006);
jamfor("LR skuld/EK = 7,724÷7,532", LR.skuldTTM / LR.ekTTM, LR.skuldEk, 0.005);
jamfor("LR omsCAGR (9480,6/6994,2)^¼−1", cagr(LR.oms), 0.0790, 0.0001, 0.00005);
jamfor("LR resCAGR (1244,6/904,5)^¼−1", cagr(LR.res), 0.0831, 0.0001, 0.00005);
jamfor("LR prognos = pe÷fwdPe−1", LR.pe / LR.fwdPe - 1, 0.2883, 0.0001, 0.00005);
jamfor("LR moat medel 5 år", moatStat(LR.bruttoMargSerie).medel, 51.02, 0, 0.05);
jamfor("LR moat spread 5 år", moatStat(LR.bruttoMargSerie).spread, 2.54, 0, 0.05);
jamfor("LR ROIC−WACC", LR.roic - LR.wacc, 0.0265, 0.0001);
jamfor("LR utdelning total = dps×aktier ≈ betald TTM", LR.dps * LR.aktierMdr * 1000, LR.divBetaldTTM, 0.005);
jamfor("LR brutto replik = fält×oms (definitionsnot)", LR.brutto * LR.omsTTM, 5072, 0.005);

// Seriens hälsokontroller (konventionskrav)
if (SU.res.some((x) => x <= 0) || LR.res.some((x) => x <= 0)) fel.push("resultatserie innehåller icke-positivt värde — resCAGR-konventionen kräver dokumentation");
const suFcfPos = SU.fcf.filter((x) => x > 0).length;
const lrFcfPos = LR.fcf.filter((x) => x > 0).length;
if (suFcfPos !== 5 || lrFcfPos !== 5) fel.push(`fcfPositiva: SU ${suFcfPos}/5, LR ${lrFcfPos}/5 — angivet 5/5`);
else console.log("  [OK] fcfPositivaSenaste5: SU 5/5, LR 5/5");

if (fel.length) {
  console.error(`\nGRIND RÖD — ${fel.length} fel, ABORT FÖRE skrivning:`);
  fel.forEach((f) => console.error("  ✗ " + f));
  process.exit(1);
}
console.log("\nGRIND GRÖN — samtliga kontroller, skriver de två raderna.");

// ── raderna ─────────────────────────────────────────────────────────────────
const suRad = {
  ticker: "SU.PA",
  namn: "Schneider Electric S.E.",
  bransch: "industri",
  land: "Frankrike",
  valuta: "EUR",
  kallor: [
    {
      namn: "StockAnalysis",
      hamtat: "2026-10-01",
      url: "https://stockanalysis.com/quote/epa/SU/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/)",
      paranoid: "Euronext Paris-primärnoting (epa-vägen bär full panel — VIE.PA/AIR.PA/SAF.PA-precedenserna), S&P Global Market Intelligence-underlag, sidor pålästa 2026-10-01 med Previous Close 292,00 EUR (SAMPO/Veolia-konventionen: fördröjd slutnotering vid hämtningsläget, innevarande session pågår; day's range 289,05–294,75): aktier 562,33 M · mcap 164,20 mdr EUR (replik 292,00×562,33 = 164 199 M EXAKT) · 52-v 220,40–312,30 · analytiker Buy 329,93 (23 st — värderingsnot, ej rekommendation) · 159 844 anställda · grundat 1836 · nästa rapp 2026-10-28. STATISTICS-panelen: P/E 35,12 mot forward 25,99 ⇒ prognosTillväxt +35,13 % implicit (normaliseringsgap-klassen — källans EGEN 3-års intäktstillväxtprognos +10,01 %/år som kontrast-not; ~3,5× mellan normaliseringsgap och organisk guide) · PEG 1,73 källans fält · P/B 6,64 = mcap÷EK(TTM) 24,736 EXAKT (statistics Equity Book Value 24,74; balansens Shareholders' Equity FY25 24 455 med FY24-toppen 31 280 — EK-serien bär omfattande återköp/valutaeffekter, dokumenterat) · EV/EBIT 23,96 (replik EV 180,76÷(17,92 %×42 042) = 23,99; EV-identiteten mcap 164,20+nettoskuld 16,29 = 180,49 mot källans 180,76 = 0,15 % minoritets-/pensionsjusteringar) · EV/E 38,15 EXAKT replik 180,76÷4 738 · skuld/EK 0,84 (replik 20 809÷24 736 EXAKT) · räntetäckning 13,31 · beta 1,15 · Altman-Z 3,55 · Piotroski 5. MARGINALER (TTM-fönstret Oct'26, financials-sidans egna fält): brutto 42,12 % = 17 707÷42 042 EXAKT (elektrifieringsmoatet — industri-grenens gruvoir-klass är 40–90 % men SU bär den på TERBINDNINGAR inte råvaror; bruttomarginalserien FY21–25 40,97/40,60/41,81/42,64/42,08 % ⇒ moat-FÄLTEN FYLLDA: medel 41,62 % spread 2,04 pp — BASF-klassen; stabiliteten ÄR moatet) · EBIT 17,92 % · netto 11,27 % = 4 738÷42 042 EXAKT · FCF 14,72 % = 6 187÷42 042 EXAKT · fcfYield 3,77 % = 6 187÷164 200 EXAKT · ROE 18,62 % · ROIC 13,96 % mot WACC 9,61 % ⇒ +4,35 pp (duons bredaste avkastningsluft — priset på moat i kapitaltermer). SEGMENT: Energy Management 34 879 + Industrial Automation 7 163 = 42 042 EXAKT (datanmält-AI-drivna elnätet + fabriksautomationen). SERIER FY2021–2025 (M€): omsättning 28 905→34 176→35 902→38 153→40 152 (omsCAGR +8,56 %/år) · resultat 3 204→3 477→4 003→4 269→4 163 (resCAGR +6,76 %/år; FY25-dippningen −2,5 % mot FY24 dokumenterad —EPS-serien 5,67→6,15→7,07→7,53→7,33, EPS-tillväxten bär återköpens motverkan av aktieantalet +0,63 % y/y) · FCF 3 073→3 647→4 993→4 630→5 059 med TTM 6 187 (capex-upptrappning 543→1 073 M€ — datacenter/elnät-capex) · EK 28 109→26 094→27 168→31 280→24 455. UTDELNINGSTRAPPAN 2,900→3,150→3,500→3,900→4,200 EUR (+11,5/+8,6/+11,1/+7,7 %) · payout 49,87 % av vinst mot FCF-payout 38,17 % (definitionsnoten dokumenterad) · total utdelning FY25 ≈ 2,36 mdr EUR. BRANSCHFÄLT industri = källans Sector Industrials/Industry Electrical Equipment & Parts (Keyence-precedensen — S&P:s struktur, inte vardagsspråkets 'teknik'); land Frankrike = primärnotingens konvention (Euronext Paris; huvudkontor Rueil-Malmaison dokumenterat). FY kalenderår. CELLENS SIGNATUR: Frankrike|industri-mattan 3→5 — flygkroppen (AIR volymcykel) + motorn (SAF eftermarknad) + avfallet (VIE koncession) + NU effektdistributionen: duon SU+LR bär datacenter/elnät-ombyggnadens moat-marginaler (brutto 42/50 %) på P/E 35/29 — cellens fyra arketyper täcker cykel, eftermarknad, koncession och strukturell effekt."
    }
  ],
  hamtat: "2026-10-01",
  pris: 292.00,
  marknadsKapitalMdr: 164.20,
  tillvaxt: {
    omsattningCAGR5ar: 0.0856,
    resultatCAGR5ar: 0.0676,
    omsattningTillvaxtTTM: 0.069,
    prognosTillvaxt: 0.3513
  },
  lonksamhet: {
    roe: 0.1862,
    roic: 0.1396,
    bruttoMarginal: 0.4212,
    ebitMarginal: 0.1792,
    nettoMarginal: 0.1127,
    fcfMarginal: 0.1472
  },
  stabilitet: {
    skuldEgenkapital: 0.84,
    rantaTackning: 13.31,
    fcfPositivaSenaste5: 5,
    kassaManaderBurnRate: null,
    nyemissionerSenaste5ar: null
  },
  aterkop: {
    senasteArMdr: 2.362,
    andelUtestande: null,
    insiderkopSenaste6man: null
  },
  moat: {
    bruttoMarginalMedel5ar: 41.62,
    bruttoMarginalSpread5ar: 2.04,
    roeMedel5ar: null
  },
  vardering: {
    pe: 35.12,
    pb: 6.64,
    evEbit: 23.96,
    peg: 1.73,
    fcfYield: 0.0377,
    egenKapitalMultipl: 6.64
  },
  golv: {
    typ: "osatt",
    vardePerAktie: null,
    marginal: null
  },
  serier: {
    ar: ["2021", "2022", "2023", "2024", "2025"],
    omsattning: [28905000000, 34176000000, 35902000000, 38153000000, 40152000000],
    resultat: [3204000000, 3477000000, 4003000000, 4269000000, 4163000000],
    egetKapital: [28109000000, 26094000000, 27168000000, 31280000000, 24455000000],
    fcf: [3073000000, 3647000000, 4993000000, 4630000000, 5059000000]
  }
};

const lrRad = {
  ticker: "LR.PA",
  namn: "Legrand S.A.",
  bransch: "industri",
  land: "Frankrike",
  valuta: "EUR",
  kallor: [
    {
      namn: "StockAnalysis",
      hamtat: "2026-10-01",
      url: "https://stockanalysis.com/quote/epa/LR/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/)",
      paranoid: "Euronext Paris-primärnoting (epa-vägen, SU-duons syskonrad), S&P Global Market Intelligence-underlag, sidor pålästa 2026-10-01 med Previous Close 141,60 EUR (SAMPO/Veobia-konventionen; day's range 139,60–142,60, sista intraday 140,95): aktier 262,14 M (+1,71 % y/y — utvidgande bas, motsatsen till återköpsmaskinerna; dokumenterad not) · mcap 37,12 mdr EUR (replik 141,60×262,14 = 37 119 M EXAKT) · 52-v 121,95–166,95 · analytiker Buy 168,06 (18 st — värderingsnot, ej rekommendation) · 40 931 anställda · grundat 1865 · nästa rapp 2026-11-05. STATISTICS-panelen: P/E 28,51 mot forward 22,13 ⇒ prognosTillväxt +28,83 % implicit (normaliseringsgap-klassen — källans EGEN 3-års EPS-prognos +13,67 %/år och intäkt +11,79 %/år som kontrast-noter; CMD 2026-09-29 höjde 2030-målet till 11–13 % årlig tillväxt enligt källans nyhetsflöde) · PEG 1,70 källans fält · P/B 4,93 = mcap÷EK(TTM) 7 532 EXAKT (balansens Shareholders' Equity FY25 7 334, TTM Jun'26 7 532 — källans P/B-fält bär TTM-basen, dokumenterat) · EV/EBIT 22,54 (replik EV 42,91÷(18,84 %×10 107) = 22,53; EV-identiteten mcap 37,12+nettoskuld 5,75 = 42,87 mot källans 42,91 = 0,1 %) · EV/E 32,64 EXAKT replik 42,91÷1 315 · skuld/EK 1,03 (replik 7 724÷7 532 = 1,025 — fältet bärs, acquisitions-bärande balans: goodwill 25 142 M€ FY25) · räntetäckning 10,14 · beta 0,99 · Altman-Z 3,29 · Piotroski 4. MARGINALER (TTM-fönstret Jun'26, financials-sidans egna fält): brutto 50,19 % (DUONS HÖGSTA — uttagskraften på kontaktor/brytare/elcentral; bruttomarginalserien FY21–25 50,83/49,72/52,26/51,64/50,83 % ⇒ moat-FÄLTEN FYLLDA: medel 51,02 % spread 2,54 pp — BASF-klassen) · EBIT 18,84 % · netto 13,01 % = 1 315÷10 107 EXAKT · FCF 13,25 % = 1 340÷10 107 (avrundningsklass 13,26 räknat) · fcfYield 3,61 % = 1 340÷37 120 EXAKT · ROE 18,21 % · ROIC 10,99 % mot WACC 8,34 % ⇒ +2,65 pp. SERIER FY2021–2025 (M€): omsättning 6 994,2→8 339,4→8 416,9→8 648,9→9 480,6 (omsCAGR +7,90 %/år; +19,2 %-året 2022 bär pris/valuta + förvärv — H1-2026-rapportens 'sju förvärv' dokumenterade i källans nyhetsflöde) · resultat 904,5→999,5→1 148,5→1 166,4→1 244,6 (resCAGR +8,31 %/år) · FCF 972,8→1 059→1 614→1 313→1 356 med TTM 1 340 (FCF-marginalerna 13,9/12,7/19,2/15,2/14,3 % — kapitalleicht modell: capex 2,3 % av oms) · EK 5 720→6 643→6 735→7 548→7 334. UTDELNINGSTRAPPAN 1,650→1,900→2,090→2,200→2,380 EUR (+16,2/+15,2/+10,0/+5,3/+8,2 % senaste; 5 raka tillväxtår, källans 'Years of Dividend Growth' = 5) · payout 47,92 % av vinst mot FCF-payout 46,58 % (båda under hälften — trappan bär FCF) · common dividends betald TTM 622,5 M€ (replik dps×aktier = 623,9, 0,2 %). BRANSCHFÄLT industri = källans Sector Industrials/Industry Electrical Equipment & Parts (Keyence-precedensen — samma struktur som syskonraden SU.PA); land Frankrike = primärnotingens konvention (Euronext Paris; huvudkontor Limoges dokumenterat). FY kalenderår. CELLENS SIGNATUR: Frankrike|industri-mattan 3→5 — duons andra halva: SU bär skalan (164 mdr), LR bär bruttomarginalen (50,2 % mot cellens övriga 17–43 %) och utdelningstrappan; datacenterboomen är cellens gemensamma namn (WSJ/Reuters via källans flöde: 'data-center boom prompts guidance upgrade' 2026-09-29)."
    }
  ],
  hamtat: "2026-10-01",
  pris: 141.60,
  marknadsKapitalMdr: 37.12,
  tillvaxt: {
    omsattningCAGR5ar: 0.079,
    resultatCAGR5ar: 0.0831,
    omsattningTillvaxtTTM: 0.097,
    prognosTillvaxt: 0.2883
  },
  lonksamhet: {
    roe: 0.1821,
    roic: 0.1099,
    bruttoMarginal: 0.5019,
    ebitMarginal: 0.1884,
    nettoMarginal: 0.1301,
    fcfMarginal: 0.1325
  },
  stabilitet: {
    skuldEgenkapital: 1.03,
    rantaTackning: 10.14,
    fcfPositivaSenaste5: 5,
    kassaManaderBurnRate: null,
    nyemissionerSenaste5ar: null
  },
  aterkop: {
    senasteArMdr: 0.624,
    andelUtestande: null,
    insiderkopSenaste6man: null
  },
  moat: {
    bruttoMarginalMedel5ar: 51.02,
    bruttoMarginalSpread5ar: 2.54,
    roeMedel5ar: null
  },
  vardering: {
    pe: 28.51,
    pb: 4.93,
    evEbit: 22.54,
    peg: 1.7,
    fcfYield: 0.0361,
    egenKapitalMultipl: 4.93
  },
  golv: {
    typ: "osatt",
    vardePerAktie: null,
    marginal: null
  },
  serier: {
    ar: ["2021", "2022", "2023", "2024", "2025"],
    omsattning: [6994200000, 8339400000, 8416900000, 8648900000, 9480600000],
    resultat: [904500000, 999500000, 1148500000, 1166400000, 1244600000],
    egetKapital: [5720000000, 6643000000, 6735000000, 7548000000, 7334000000],
    fcf: [972800000, 1059000000, 1614000000, 1313000000, 1356000000]
  }
};

// ── append + läs-tillbaka ×2 ────────────────────────────────────────────────
const slut = [...u, suRad, lrRad];
writeFileSync(FIL, JSON.stringify(slut, null, 2) + "\n");
const tb1 = JSON.parse(readFileSync(FIL, "utf8"));
const tb2 = JSON.parse(readFileSync(FIL, "utf8"));
if (tb1.length !== slut.length || tb2.length !== slut.length) {
  console.error("LÄS-TILLBAKA FEL — längd avviker, ABORT.");
  process.exit(1);
}
const s1 = tb1.find((r) => r.ticker === "SU.PA");
const s2 = tb2.find((r) => r.ticker === "SU.PA");
const l1 = tb1.find((r) => r.ticker === "LR.PA");
const l2 = tb2.find((r) => r.ticker === "LR.PA");
if (!s1 || !s2 || !l1 || !l2 ||
  JSON.stringify(s1) !== JSON.stringify(suRad) || JSON.stringify(s2) !== JSON.stringify(suRad) ||
  JSON.stringify(l1) !== JSON.stringify(lrRad) || JSON.stringify(l2) !== JSON.stringify(lrRad)) {
  console.error("LÄS-TILLBAKA FEL — raderna avviker, ABORT.");
  process.exit(1);
}

console.log(`\nEFTER (${tb1.length} rader):`);
mät("industri", tb1.filter((r) => r.bransch === "industri"));
mätTotalt("universum", tb1);
const mattorEfter = matta(tb1);
console.log(`  Frankrike|industri-matta: ${mattorEfter["Frankrike|industri"] ?? 0} (tröskel 5 — ${mattorEfter["Frankrike|industri"] >= 5 ? "NÅDD: aspektsidan /dataset/industri/frankrike föds datadrivet vid nästa gröna bygge" : "ej nådd"})`);

console.log("\ngit hash-object efter skrivning:");
console.log(execFileSync("git", ["hash-object", FIL]).toString().trim());
console.log("APPEND KLAR: SU.PA + LR.PA — universum " + u.length + "→" + tb1.length);
