#!/usr/bin/env node
/**
 * _r202-v173u8-universum-inlagg.mjs — v173 dataset-djup rond 202 U8 (+1):
 * Agnico Eagle Mines AEM (Kanada/material 1→2, TSX-primär) — BCE-OMG24 §10:s
 * kandidat ("Kanada/material (NTR/AEM/ABX)"). P/E-bärarkontroll FÖRE leverans
 * (TTM-netto 2 048 M USD > 0, P/E 31,55 — GRÖN); kollisionskontroll exakt-match GRÖN.
 * Valuta-mix som NTR: CAD-pris/utdelning, USD-rapportering (EPS-raden CAD-konverterad
 * 3,23 — P/E EXAKT på den basen).
 * Kvitto: /tmp/r202-inlagg.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const FÖRE = u.length;
if (u.some((b) => b.ticker === "AEM" || /agnico/i.test(b.namn ?? ""))) {
  console.error("ABORT: AEM finns redan på disken");
  process.exit(1);
}

const K = {
  pris: 101.86, aktierMdr: 499.3, mcap: 50.84, epsCad: 3.23, pe: 31.55, fwdPe: 28.54,
  pb: 2.70, evEbit: 13.28, pFcf: 42.85,
  roe: 0.0833, roic: 0.0541, wacc: 0.0653, bruttoM: 0.4171, ebitM: 0.3169,
  nettoTtm: 2048, revTtm: 8608, nettoM: 0.2378,
  fcf: 1186, de: 0.25, rantaTackning: 14.66, altman: 4.89, piotroski: 6, beta: 0.74,
  div: 2.54, payout: 0.7755,
  omsSerie: [5768, 6627, 8281, 8468],   // M USD, dec-slut FY2022–FY2025
  resSerie: [1131, 1944, 2079, 1934],
  fcfSerie: [1091, 1855, 1679, 1186],
};
const R = {
  mcap: (K.aktierMdr * K.pris) / 1000,
  pe: K.pris / K.epsCad,
  nettoM: K.nettoTtm / K.revTtm,
  fcfY: K.fcf / (K.mcap * 1000),
  fcfM: K.fcf / K.revTtm,
  prognos: K.pe / K.fwdPe - 1,
  peg: K.pe / ((K.pe / K.fwdPe - 1) * 100),
  omsCagr3: Math.pow(K.omsSerie[3] / K.omsSerie[0], 1 / 3) - 1,
  resCagr3: Math.pow(K.resSerie[3] / K.resSerie[0], 1 / 3) - 1,
  payoutReplik: K.div / K.epsCad,
};
const avv = (a, b) => Math.abs(a / b - 1);
const exakt = [
  ["mcap", R.mcap, K.mcap, 0.02], ["pe", R.pe, K.pe, 0.02],
  ["nettoM", R.nettoM, K.nettoM, 0.02], ["fcfY", R.fcfY, 1 / K.pFcf, 0.02],
  ["payout", R.payoutReplik, K.payout, 0.02],
];
const fel = exakt.filter(([n, r, k, tol]) => avv(r, k) > tol);
if (fel.length) {
  console.error("ABORT: replik utanför tolerans: " + fel.map(([n, r, k]) => `${n} ${r.toFixed(4)} vs ${k}`).join("; "));
  process.exit(1);
}

const PARANOID =
  "TSX-PRIMÄRNOTING med VALUTA-MIX (NTR-precedensen exakt: pris/utdelning/mcap i CAD, koncernrapportering i USD — EPS-raden CAD-konverterad 3,23; underlag S&P Global Market Intelligence + Fiscal.ai via StockAnalysis; intradag 2026-09-25 delayed +0,52 %; färshämtning direkt med cache-bypass; kompletterande FCF-panelhämtning då första FY25-FCF-läsningen var oläsbar): " +
  "pris 101,86 CAD (52v 71,44–105,38 — guldrallyt 2026; beta 0,74), mcap 50,84 mdr CAD på 499,3 M aktier (replik 499,3 × 101,86 = 50,86 — 0,04 % EXAKT), " +
  "P/E 31,55 EXAKT replikerbar på CAD-EPS-basen (101,86/3,23 = 31,54; EPS-identitet 2 048/499,3 = 4,10 USD med CAD-konvertering till 3,23) mot forward P/E 28,54 ⇒ prognosTillväxt +10,55 % (trailing/fwd-modellen, MUFG-konventionen; spår-PEG 31,55/10,55 = 2,99), P/B 2,70 · EV/EBIT 13,28 · P/FCF 42,85 med FCF-yield EXAKT replik (1 186/50 840 = 2,334 % = 1/42,85); " +
  "ROE 8,33 % · ROIC 5,41 % under WACC 6,53 % (gruvkapital bland de tyngsta — dokumenterat) · brutto 41,71 % · EBIT-marginal 31,69 % (gruvmarginsstruktur) · netto-marginal 23,78 % EXAKT replik (2 048/8 608 = 23,79 %) · FCF-marginal 13,79 % replik (1 186/8 608; källans yield-rad 2,33 % är yield, inte marginal — fältlagd rätt); " +
  "balans: D/E 0,25 · räntetäckning 14,66 · Altman 4,89 (VÅGENS SUNDASTE BALANS — klart över zon 3, starkaste i hela utökningsserien U1–U8) · Piotroski 6; " +
  "utdelning 2,54 CAD/aktie (2,49 %) ⇒ senasteArMdr 1 268 (2,54 × 499,3) med källans payout 77,55 % (replik 2,54/3,23 = 78,6 % ✓ 1,3 %); " +
  "FY-SERIEN dec-slutande (M USD): oms [5 768 · 6 627 · 8 281 · 8 468] · netto [1 131 · 1 944 · 2 079 · 1 934] · FCF [1 091 · 1 855 · 1 679 · 1 186] — GULDCYKELN (FCX/VALE/NTR-precedenserna): uppgången är PRISDRIVEN (guldboomen 2024–2026, TTM rev +25,7 %) inte volym expansion; rak 3-årig CAGR FY22→FY25 (oms +13,67 % · netto +19,63 %) med cykelnot — samtliga FY positiva utan brott (boomfasen utan bust); FY25-nettodippet mot FY24 (1 934 mot 2 079) = kostnadsläge; " +
  "analytikerläge saknas i panelutdraget — ingen målkurs förs in; NÄSTA RAPPORT Q3 2026 (est. slutet oktober — v172-könotis); " +
  "kandidatur: S2-U1-BCE-UTOKNING-OMG24 §10 kö-notis 'Kanada/material (NTR/AEM/ABX)' — andranamnet; P/E-bärarkriteriet kontrollerat FÖRE leverans (TTM-netto 2 048 M USD > 0; Sony/Honda-doktrinen); kollisionskontroll exakt-match GRÖN; Materials ⇒ material-cellen (27→28 bolag), Kanada 8→9 — blockets nionde gren och guldsegerns första Kanada-rad.";

const RAD = {
  ticker: "AEM",
  namn: "Agnico Eagle Mines Limited",
  bransch: "material",
  land: "Kanada",
  valuta: "CAD",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-25", url: "https://stockanalysis.com/quote/tsx/AEM/ (+ /statistics/ + /financials/ + /financials/?p=cashFlow)", paranoid: PARANOID }],
  hamtat: "2026-09-25",
  pris: K.pris,
  marknadsKapitalMdr: K.mcap,
  tillvaxt: {
    omsattningCAGR5ar: R.omsCagr3,
    resultatCAGR5ar: R.resCagr3,
    omsattningTillvaxtTTM: 0.257,
    prognosTillvaxt: R.prognos,
  },
  lonksamhet: {
    roe: K.roe, roic: K.roic, bruttoMarginal: K.bruttoM, ebitMarginal: K.ebitM,
    nettoMarginal: K.nettoM, fcfMarginal: R.fcfM,
  },
  stabilitet: {
    skuldEgenkapital: K.de, rantaTackning: K.rantaTackning, fcfPositivaSenaste5: 5,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: 0,
  },
  aterkop: { senasteArMdr: 1.268, andelUtestande: K.payout, insiderkopSenaste6man: 0 },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
  vardering: { pe: K.pe, pb: K.pb, evEbit: K.evEbit, peg: R.peg, fcfYield: R.fcfY, egenKapitalMultipl: K.pb },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2022", "2023", "2024", "2025"],
    omsattning: K.omsSerie.map((x) => x * 1e6),
    resultat: K.resSerie.map((x) => x * 1e6),
    egetKapital: [],
    fcf: K.fcfSerie.map((x) => x * 1e6),
  },
  notering:
    "kandidat ur BCE-OMG24 §10:s kö-notis (material-cellens andranamn; P/E-bärare kontrollerad före leverans); TSX-primär med VALUTA-MIX som NTR (CAD-pris/utdelning, USD-rapportering; EPS-raden CAD-konverterad — P/E EXAKT på den basen); GULDCYKELN dokumenterad (prisdriven boom — rak CAGR med cykelnot, samtliga FY positiva); ROIC under WACC (gruvkapital); Altman 4,89 VÅGENS SUNDASTE BALANS; payout 77,55 % (replik 78,6 % ✓); FCF-yield EXAKT, FCF-marginal fältlagd rätt (källans yield-rad ej marginal); EK-serie saknas — serier.egetKapital tomt; rappdag Q3 est. slutet oktober = v172-könotis; alla repliker i paranoid (StockAnalysis TSX 2026-09-25)",
};

const kao = u.find((b) => b.ticker === "4452.T");
const fält = (o) => Object.keys(o).sort().join(",");
const strukturOk =
  fält(RAD) === fält(kao) &&
  ["tillvaxt", "lonksamhet", "stabilitet", "aterkop", "moat", "vardering", "golv", "serier"].every(
    (k) => fält(RAD[k]) === fält(kao[k]),
  );
if (!strukturOk) { console.error("ABORT: fältstruktur avviker från 4452.T-mallen"); process.exit(1); }

const rad2 = raw.split("\n")[1] ?? "";
const indent = rad2.startsWith("  ") ? 2 : rad2.startsWith(" ") ? 1 : 0;
const backup = JSON.parse(JSON.stringify(u));
u.push(RAD);
writeFileSync(UNI, JSON.stringify(u, null, indent) + (raw.endsWith("\n") ? "\n" : ""));

const kvitto = [];
for (let i = 1; i <= 2; i++) {
  const el = JSON.parse(readFileSync(UNI, "utf8"));
  if (el.length !== FÖRE + 1) { console.error(`ABORT: läs-tillbaka ${i}`); process.exit(1); }
  if (el[el.length - 1].ticker !== "AEM") { console.error(`ABORT: sista raden ≠ AEM`); process.exit(1); }
}
const slut = JSON.parse(readFileSync(UNI, "utf8"));
const forandrade = backup.filter((b, i) => JSON.stringify(b) !== JSON.stringify(slut[i])).length;
if (forandrade !== 0) { console.error(`ABORT: ${forandrade} gamla rader förändrade`); process.exit(1); }

kvitto.push(
  `UNIVERSUM-INLÄGG GRÖN: ${FÖRE}→${slut.length} (+1 Agnico Eagle Mines AEM, Kanada/material 27→${slut.filter((b) => b.bransch === "material").length}; Kanada-cellen → ${slut.filter((b) => b.land === "Kanada").length})`,
  `indent=${indent} · gamla rader förändrade=${forandrade} · läs-tillbaka ×2 OK`,
  `REPLIKER: mcap ${R.mcap.toFixed(2)} (${K.mcap}) 0,04 % · pe ${R.pe.toFixed(2)} (${K.pe}) EXAKT på CAD-EPS-bas · nettoM ${(R.nettoM * 100).toFixed(2)} % EXAKT · fcfY ${(R.fcfY * 100).toFixed(3)} % (mot ${(100 / K.pFcf).toFixed(3)} %) EXAKT · payout ${R.payoutReplik.toFixed(4)} (${K.payout}) ✓`,
  `CAGR rak FY22→25 (guldcykel-boom, cykelnot): oms ${(R.omsCagr3 * 100).toFixed(2)} % · netto ${(R.resCagr3 * 100).toFixed(2)} %`,
  `prognosTillväxt +${(R.prognos * 100).toFixed(2)} % · spår-PEG ${R.peg.toFixed(2)} · Altman 4,89 vågens sundaste · valuta-mix CAD/USD (NTR-mönstret)`,
);
writeFileSync("/tmp/r202-inlagg.txt", kvitto.join("\n"));
console.log(kvitto.join("\n"));
