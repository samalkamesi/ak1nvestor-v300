#!/usr/bin/env node
/**
 * _r203-v173u9-universum-inlagg.mjs — v173 dataset-djup rond 203 U9 (+1):
 * Barrick Gold ABX (Kanada/material 2→3 — BCE-OMG24 §10:s SISTA namn, trion
 * komplett) — P/E-bärarkontroll FÖRE leverans (TTM-netto 3 402 M USD > 0 — GRÖN);
 * kollisionskontroll exakt-match GRÖN. Valuta-mix NTR/AEM-mönstret.
 * Kvitto: /tmp/r203-inlagg.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const FÖRE = u.length;
if (u.some((b) => b.ticker === "ABX" || /barrick/i.test(b.namn ?? ""))) {
  console.error("ABORT: ABX finns redan på disken");
  process.exit(1);
}

const K = {
  pris: 53.12, aktierMdr: 1722, mcap: 91.13, pe: 11.73, fwdPe: 10.28,
  pb: 1.66, evEbit: 7.22, pFcf: 18.87, pegKalla: 0.28,
  roe: 0.1163, roic: 0.0705, wacc: 0.0678, bruttoM: 0.4217, ebitM: 0.3306,
  nettoTtm: 3402, revTtm: 14091, nettoM: 0.2415,
  fcf: 4829, de: 0.22, rantaTackning: 15.13, altman: 4.42, piotroski: 7, beta: 0.88,
  divCad: 0.60,
  omsSerie: [11013, 11397, 12922, 14432],   // M USD, dec-slut FY2022–FY2025
  resSerie: [432, 1272, 2144, 2748],
  fcfSerie: [712, 1467, 3132, 3362],
};
const R = {
  mcap: (K.aktierMdr * K.pris) / 1000,
  nettoM: K.nettoTtm / K.revTtm,
  fcfY: K.fcf / (K.mcap * 1000),
  prognos: K.pe / K.fwdPe - 1,
  peg: K.pe / ((K.pe / K.fwdPe - 1) * 100),
  omsCagr2: Math.pow(K.omsSerie[3] / K.omsSerie[1], 1 / 2) - 1,  // konsekutiv FY23→FY25
  resCagr2: Math.pow(K.resSerie[3] / K.resSerie[1], 1 / 2) - 1,
  resCagr3: Math.pow(K.resSerie[3] / K.resSerie[0], 1 / 3) - 1,  // bottenbas (loggas som meningslös)
  payoutReplik: (K.divCad * K.aktierMdr * 0.72) / K.resSerie[3], // CAD-utdelning → USD (~0,72) / FY25-netto
};
const avv = (a, b) => Math.abs(a / b - 1);
const exakt = [
  ["mcap", R.mcap, K.mcap, 0.02], ["nettoM", R.nettoM, K.nettoM, 0.02],
  ["fcfY", R.fcfY, 1 / K.pFcf, 0.02],
];
const fel = exakt.filter(([n, r, k, tol]) => avv(r, k) > tol);
if (fel.length) {
  console.error("ABORT: replik utanför tolerans: " + fel.map(([n, r, k]) => `${n} ${r.toFixed(4)} vs ${k}`).join("; "));
  process.exit(1);
}

const PARANOID =
  "TSX-PRIMÄRNOTING med VALUTA-MIX (NTR/AEM-precedenserna: pris/utdelning/mcap i CAD, koncernrapportering i USD; underlag S&P Global Market Intelligence + Fiscal.ai via StockAnalysis; intradag 2026-09-25 delayed +0,14 %; färshämtning direkt med cache-bypass + kompletterande FY-panelhämtning för exakt tabelläsning): " +
  "pris 53,12 CAD (52v 27,55–55,04 — guldrallyts fulla spänn; beta 0,88), mcap 91,13 mdr CAD på 1 722 M aktier (replik 1 722 × 53,12 = 91,47 — 0,37 %), " +
  "P/E 11,73 ur källan på bolagets justerade bas (Barrick-rapporteringskonvention; GAAP-identiteten USD-pris/TTM-EPS ger högre multiplar — bas-skillnaden dokumenterad i CNR/CPKC-klassen men med valutamixen som extra not) mot forward P/E 10,28 ⇒ prognosTillväxt +14,11 % (trailing/fwd-modellen, MUFG-konventionen; spår-PEG 11,73/14,11 = 0,83 mot källans PEG 0,28 på 3-års — olika baser, kalibreringsnot), P/B 1,66 · EV/EBIT 7,22 · P/FCF 18,87 med FCF-yield EXAKT replik (4 829/91 130 = 5,298 % = 1/18,87 = 5,300 %); " +
  "ROE 11,63 % · ROIC 7,05 % ÖVER WACC 6,78 % (guldsektorns kapitaldisiplin — dokumenterad) · brutto 42,17 % · EBIT-marginal 33,06 % (gruvmarginsstruktur) · netto-marginal 24,15 % EXAKT replik (3 402/14 091 = 24,15 %) · FCF-marginal 34,3 % replik (4 829/14 091 — guldsektorns kassaflödesstyrka); " +
  "balans: D/E 0,22 · räntetäckning 15,13 · Altman 4,42 (SUND zon — AEM 4,89 och ABX 4,42 gör guldduon till Kanada-blockets balansryggrad) · Piotroski 7 · kassa 4,44 mdr · skuld 5,16 mdr · NETTOSKULD 0,72 mdr; " +
  "utdelning 0,60 CAD/aktie (1,13 %) ⇒ senasteArMdr 1 033 CAD (0,60 × 1 722) med payout-replik ~27 % av FY25-netto i USD (kurskonvertering ~0,72 dokumenterad); " +
  "FY-SERIEN dec-slutande (M USD): oms [11 013 · 11 397 · 12 922 · 14 432] · netto [432 · 1 272 · 2 144 · 2 748] · FCF [712 · 1 467 · 3 132 · 3 362] — GULDCYKELN MED BOTTENBAS-VARNING (FCX/VALE/NTR/AEM-precedenserna): FY2022-netto 432 M = cykelbottnen (nedskrivningar + lägre guldpris); serien 432→2 748 är BOOMENS språng (6,4×) och rak CAGR från bottnen (+85 %/år) är MENINGSLÖS som tillväxtmått — CAGR-fälten bär KONSEKUTIV FY23→FY25-bas (oms +12,5 % · netto +46,9 %) med bottennoten dokumenterad; TTM rev +29,6 % = prisdrivet (guldboomen 2024–2026), ingen volymexpansion; EPS-USD-serien [0,25 · 0,72 · 1,24 · 1,58]; " +
  "analytikerläge saknas i panelutdraget — ingen målkurs förs in; NÄSTA RAPPORT Q3 2026 (est. tidigt november — v172-könotis v45); " +
  "kandidatur: S2-U1-BCE-UTOKNING-OMG24 §10 kö-notis 'Kanada/material (NTR/AEM/ABX)' — SISTA NAMNET, TRION KOMPLETT (NTR gödsel · AEM+ABX guld); P/E-bärarkriteriet kontrollerat FÖRE leverans (TTM-netto 3 402 M USD > 0; Sony/Honda-doktrinen); kollisionskontroll exakt-match GRÖN; Materials ⇒ material-cellen (28→29 bolag), Kanada 9→10 — BLOCKETS TIONDE BOLAG.";

const RAD = {
  ticker: "ABX",
  namn: "Barrick Gold Corporation",
  bransch: "material",
  land: "Kanada",
  valuta: "CAD",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-25", url: "https://stockanalysis.com/quote/tsx/ABX/ (+ /statistics/ + /financials/)", paranoid: PARANOID }],
  hamtat: "2026-09-25",
  pris: K.pris,
  marknadsKapitalMdr: K.mcap,
  tillvaxt: {
    omsattningCAGR5ar: R.omsCagr2,
    resultatCAGR5ar: R.resCagr2,
    omsattningTillvaxtTTM: 0.296,
    prognosTillvaxt: R.prognos,
  },
  lonksamhet: {
    roe: K.roe, roic: K.roic, bruttoMarginal: K.bruttoM, ebitMarginal: K.ebitM,
    nettoMarginal: K.nettoM, fcfMarginal: K.fcf / K.revTtm,
  },
  stabilitet: {
    skuldEgenkapital: K.de, rantaTackning: K.rantaTackning, fcfPositivaSenaste5: 5,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: 0,
  },
  aterkop: { senasteArMdr: 1.033, andelUtestande: 0.27, insiderkopSenaste6man: 0 },
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
    "kandidat ur BCE-OMG24 §10:s kö-notis (SISTA namnet — material-trion NTR/AEM/ABX komplett; P/E-bärare kontrollerad före leverans); TSX-primär med VALUTA-MIX (CAD-pris/utdelning, USD-rapportering); GULDCYKELN MED BOTTENBAS-VARNING: FY22-netto 432 M = cykelbotten (rak CAGR från bottnen +85 %/år är MENINGSLÖS — dokumenterad); CAGR-fält på konsekutiv FY23→FY25-bas (oms +12,5 % · netto +46,9 %); prisdriven boom (TTM rev +29,6 %); P/E 11,73 på källans justerade bas (bas-skillnad dokumenterad); ROIC 7,05 % ÖVER WACC 6,78 % (guldsektorns kapitaldisiplin); Altman 4,42 sund — guldduon AEM+ABX = Kanada-blockets balansryggrad; payout-replik ~27 % (kurskonvertering dokumenterad); EK-serie saknas — serier.egetKapital tomt; rappdag Q3 est. tidigt november = v172-könotis; alla repliker i paranoid (StockAnalysis TSX 2026-09-25)",
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
  if (el[el.length - 1].ticker !== "ABX") { console.error("ABORT: sista raden ≠ ABX"); process.exit(1); }
}
const slut = JSON.parse(readFileSync(UNI, "utf8"));
const forandrade = backup.filter((b, i) => JSON.stringify(b) !== JSON.stringify(slut[i])).length;
if (forandrade !== 0) { console.error(`ABORT: ${forandrade} gamla rader förändrade`); process.exit(1); }

kvitto.push(
  `UNIVERSUM-INLÄGG GRÖN: ${FÖRE}→${slut.length} (+1 Barrick Gold ABX, Kanada/material 28→${slut.filter((b) => b.bransch === "material").length}; Kanada-cellen → ${slut.filter((b) => b.land === "Kanada").length})`,
  `indent=${indent} · gamla rader förändrade=${forandrade} · läs-tillbaka ×2 OK`,
  `REPLIKER: mcap ${R.mcap.toFixed(2)} (${K.mcap}) 0,37 % · nettoM ${(R.nettoM * 100).toFixed(2)} % EXAKT · fcfY ${(R.fcfY * 100).toFixed(3)} % (mot ${(100 / K.pFcf).toFixed(3)} %) EXAKT · pe 11,73 källa (justerad bas, dokumenterad)`,
  `CAGR (konsekutiv FY23→25): oms ${(R.omsCagr2 * 100).toFixed(2)} % · netto +${(R.resCagr2 * 100).toFixed(2)} % — bottenbas FY22→25 (+${(R.resCagr3 * 100).toFixed(0)} %/år) MENINGSLÖS och dokumenterad som varning`,
  `prognosTillväxt +${(R.prognos * 100).toFixed(2)} % · spår-PEG ${R.peg.toFixed(2)} (källans 0,28 kalibreringsnot) · ROIC 7,05 % > WACC 6,78 % · Altman 4,42 sund`,
);
writeFileSync("/tmp/r203-inlagg.txt", kvitto.join("\n"));
console.log(kvitto.join("\n"));
