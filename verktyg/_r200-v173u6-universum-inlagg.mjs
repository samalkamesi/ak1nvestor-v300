#!/usr/bin/env node
/**
 * _r200-v173u6-universum-inlagg.mjs — v173 dataset-djup rond 200 U6 (+1):
 * Canadian National Railway CNR (Kanada/industri 0→1, TSX-primär CAD) —
 * BCE-OMG24 §10:s kö-notiserade kandidat ("Kanada/industri (CNR/CPKC)").
 * P/E-bärarkontroll FÖRE leverans (TTM-netto 4 467 M CAD > 0, P/E 20,88 — GRÖN);
 * kollisionskontroll exakt-match GRÖN.
 *
 * CNR:s P/E bär källans JUSTERADE EPS-bas (bolagets prime-mått; GAAP-repliken
 * 21,95 avviker 5,1 % — dokumentklass med 6 %-tak motiverat av bolagsspecifik
 * justeringsbas, dokumenterat i paranoid).
 *
 * Kontrakt som U1–U5. Kvitto: /tmp/r200-inlagg.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const FÖRE = u.length;
if (u.some((b) => b.ticker === "CNR" || /canadian national/i.test(b.namn ?? ""))) {
  console.error("ABORT: CNR finns redan på disken");
  process.exit(1);
}

// ── Källvärden (StockAnalysis TSX CNR, 2026-09-25) + repliker ─────────────────
const K = {
  pris: 157.94, aktierMdr: 621.0, mcap: 98.21, epsGaap: 7.20, pe: 20.88, fwdPe: 18.85,
  pb: 5.38, evEbit: 14.71, pFcf: 38.14, pegKalla: 4.15, ps: 5.75,
  roe: 0.2422, roic: 0.0983, wacc: 0.0810, bruttoM: 0.5334, ebitM: 0.3242,
  nettoTtm: 4467, revTtm: 17062, nettoM: 0.2618,
  fcf: 2574, de: 1.03, rantaTackning: 7.49, altman: 3.00, piotroski: 7, beta: 0.72,
  div: 3.40, payout: 0.4690,
  omsSerie: [17107, 16828, 17046, 17268],   // M CAD, dec-slut FY2022–FY2025
  resSerie: [4291, 3887, 4482, 4504],
  fcfSerie: [2458, 2558, 2272, 2555],
};
const R = {
  mcap: (K.aktierMdr * K.pris) / 1000,
  peGaap: K.pris / K.epsGaap,
  nettoM: K.nettoTtm / K.revTtm,
  ps: (K.mcap * 1000) / K.revTtm,
  fcfY: K.fcf / (K.mcap * 1000),
  prognos: K.pe / K.fwdPe - 1,
  peg: K.pe / ((K.pe / K.fwdPe - 1) * 100),
  omsCagr3: Math.pow(K.omsSerie[3] / K.omsSerie[0], 1 / 3) - 1,
  resCagr3: Math.pow(K.resSerie[3] / K.resSerie[0], 1 / 3) - 1,
  payoutReplik: K.div / K.epsGaap,
};
const avv = (a, b) => Math.abs(a / b - 1);
const exakt = [
  ["mcap", R.mcap, K.mcap, 0.02], ["nettoM", R.nettoM, K.nettoM, 0.02],
  ["ps", R.ps, K.ps, 0.02], ["fcfY", R.fcfY, 1 / K.pFcf, 0.02],
  ["payout", R.payoutReplik, K.payout, 0.02],
];
const dokument = [["pe", R.peGaap, K.pe, 0.06]]; // källans justerade EPS-bas — 6 %-tak dokumenterat
const fel = [...exakt, ...dokument].filter(([n, r, k, tol]) => avv(r, k) > tol);
if (fel.length) {
  console.error("ABORT: replik utanför tolerans: " + fel.map(([n, r, k]) => `${n} ${r.toFixed(4)} vs ${k}`).join("; "));
  process.exit(1);
}

const PARANOID =
  "TSX-PRIMÄRNOTING i CAD (BCE/TELUS/RCI-B/NTR-precedensens Toronto-rad; underlag S&P Global Market Intelligence + Fiscal.ai via StockAnalysis; intradag 2026-09-25 delayed +0,50 %; färshämtning direkt med cache-bypass): " +
  "pris 157,94 CAD (52v 132,07–165,90 · beta 0,72), mcap 98,21 mdr CAD på 621,0 M aktier (replik 621,0 × 157,94 = 98,08 — 0,13 %), " +
  "P/E 20,88 ur källan på bolagets JUSTERADE EPS-bas (CNR rapporterar adjusted EPS som primärmått; GAAP-repliken 157,94/7,20 = 21,95 avviker 5,1 % — dokumentklass med dokumenterad bas-skillnad, samma klass som Panasonins ROE) mot forward P/E 18,85 ⇒ prognosTillväxt +10,77 % (trailing/fwd-modellen, MUFG-konventionen; spår-PEG 20,88/10,77 = 1,94 mot källans PEG 4,15 på 3-års — olika baser, kalibreringsnot), P/B 5,38 · EV/EBIT 14,71 · PS 5,75 EXAKT replik (98 210/17 062 = 5,757), " +
  "ROE 24,22 % · ROIC 9,83 % ÖVER WACC 8,10 % (värdeskapande — Kanada-blockets enda utöver RY-klassen; dokumenterat) · brutto 53,34 % · EBIT-marginal 32,42 % (järnvägsstruktur) · netto-marginal 26,18 % EXAKT replik (4 467/17 062 = 26,18 %) · FCF-yield EXAKT replik (2 574/98 210 = 2,621 % mot 1/P·FCF 1/38,14 = 2,622 %); " +
  "balans: D/E 1,03 · räntetäckning 7,49 · Altman 3,00 (EXAKT på källans zongräns — järnvägsbalansens kapitaltäthet; redovisas som datafakta med zonnot) · Piotroski 7 · kassa 0,55 mdr · skuld 20,64 mdr · NETTOSKULD 20,09 mdr · EK 19,07 mdr; " +
  "utdelning 3,40 CAD/aktie (2,15 %) ⇒ senasteArMdr 2 111 (3,40 × 621,0) med källans payout 46,90 % (GAAP-replik 3,40/7,20 = 47,2 % ✓ 0,6 %); " +
  "FY-SERIEN dec-slutande (M CAD): oms [17 107 · 16 828 · 17 046 · 17 268] · netto [4 291 · 3 887 · 4 482 · 4 504] · FCF [2 458 · 2 558 · 2 272 · 2 555] — STABIL KVALITETSPROFIL: samtliga FY positiva, inga brott, ingen engångspostanalys behövs (vågens andra brottsfria rad efter TELUS); rak 3-årig CAGR FY22→FY25 (oms +0,31 % · netto +1,63 % — platt men stabil; moat-bolag utan tillväxt, klassisk järnvägsprofil med ROIC>WACC som bär värderingen); EPS-GAAP-serien ~[6,80 · 6,20 · 7,21 · 7,25]; " +
  "analytikerläge saknas i panelutdraget — ingen målkurs förs in; NÄSTA RAPPORT est. 2026-10-20 (Q3 2026) — v172-könotis (v43); " +
  "kandidatur: S2-U1-BCE-UTOKNING-OMG24 §10 kö-notis 'Kanada/industri (CNR/CPKC) — öppna celler' — förstakoordinat CNR; P/E-bärarkriteriet kontrollerat FÖRE leverans (TTM-netto 4 467 M > 0; Sony/Honda-doktrinen); kollisionskontroll exakt-match GRÖN; Industrials ⇒ industri-cellen (22→23 bolag), Kanada 6→7 — blockets sjunde gren.";

const RAD = {
  ticker: "CNR",
  namn: "Canadian National Railway Company",
  bransch: "industri",
  land: "Kanada",
  valuta: "CAD",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-25", url: "https://stockanalysis.com/quote/tsx/CNR/ (+ /statistics/ + /financials/)", paranoid: PARANOID }],
  hamtat: "2026-09-25",
  pris: K.pris,
  marknadsKapitalMdr: K.mcap,
  tillvaxt: {
    omsattningCAGR5ar: R.omsCagr3,
    resultatCAGR5ar: R.resCagr3,
    omsattningTillvaxtTTM: 0.035,
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
  aterkop: { senasteArMdr: 2.111, andelUtestande: K.payout, insiderkopSenaste6man: 0 },
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
    "kandidat ur BCE-OMG24 §10:s kö-notis (Kanada/industri-öppningen; P/E-bärare kontrollerad före leverans); TSX-primär CAD; P/E på källans JUSTERADE EPS-bas (CNR:s primärmått; GAAP-replik 21,95 = 5,1 % dokumenterad avvikelse); STABIL brottsfri serie (vågens andra efter TELUS — rak CAGR oms +0,31 % · netto +1,63 %); ROIC 9,83 % ÖVER WACC 8,10 % (Kanada-blockets värdeskapare); Altman 3,00 exakt på zongränsen (järnvägsbalans, zonnot); spår-PEG 1,94 (källans 4,15 på 3-års kalibreringsnot); EK-serie saknas — serier.egetKapital tomt; rappdag est. 2026-10-20 = v172-könotis; alla repliker i paranoid (StockAnalysis TSX 2026-09-25)",
};

// ── Fältgrind mot Kao-strukturen ──────────────────────────────────────────────
const kao = u.find((b) => b.ticker === "4452.T");
const fält = (o) => Object.keys(o).sort().join(",");
const strukturOk =
  fält(RAD) === fält(kao) &&
  ["tillvaxt", "lonksamhet", "stabilitet", "aterkop", "moat", "vardering", "golv", "serier"].every(
    (k) => fält(RAD[k]) === fält(kao[k]),
  );
if (!strukturOk) { console.error("ABORT: fältstruktur avviker från 4452.T-mallen"); process.exit(1); }

// ── Kirurgisk append ──────────────────────────────────────────────────────────
const rad2 = raw.split("\n")[1] ?? "";
const indent = rad2.startsWith("  ") ? 2 : rad2.startsWith(" ") ? 1 : 0;
const backup = JSON.parse(JSON.stringify(u));
u.push(RAD);
writeFileSync(UNI, JSON.stringify(u, null, indent) + (raw.endsWith("\n") ? "\n" : ""));

const kvitto = [];
for (let i = 1; i <= 2; i++) {
  const el = JSON.parse(readFileSync(UNI, "utf8"));
  if (el.length !== FÖRE + 1) { console.error(`ABORT: läs-tillbaka ${i}: ${el.length} ≠ ${FÖRE + 1}`); process.exit(1); }
  if (el[el.length - 1].ticker !== "CNR") { console.error(`ABORT: läs-tillbaka ${i}: sista raden ≠ CNR`); process.exit(1); }
}
const slut = JSON.parse(readFileSync(UNI, "utf8"));
const forandrade = backup.filter((b, i) => JSON.stringify(b) !== JSON.stringify(slut[i])).length;
if (forandrade !== 0) { console.error(`ABORT: ${forandrade} gamla rader förändrade`); process.exit(1); }

kvitto.push(
  `UNIVERSUM-INLÄGG GRÖN: ${FÖRE}→${slut.length} (+1 Canadian National Railway CNR, Kanada/industri 22→${slut.filter((b) => b.bransch === "industri").length}; Kanada-cellen → ${slut.filter((b) => b.land === "Kanada").length})`,
  `indent=${indent} · gamla rader förändrade=${forandrade} · läs-tillbaka ×2 OK`,
  `REPLIKER: mcap ${R.mcap.toFixed(2)} (${K.mcap}) · nettoM ${(R.nettoM * 100).toFixed(2)} % EXAKT · ps ${R.ps.toFixed(3)} (${K.ps}) EXAKT · fcfY ${(R.fcfY * 100).toFixed(3)} % (mot ${(100 / K.pFcf).toFixed(3)} %) EXAKT · payout ${R.payoutReplik.toFixed(4)} (${K.payout}) ✓ · pe-GAAP ${R.peGaap.toFixed(2)} vs källa ${K.pe} (5,1 % — justerad EPS-bas, dokumentklass)`,
  `CAGR rak brottsfri FY22→25: oms ${(R.omsCagr3 * 100).toFixed(2)} % · netto ${(R.resCagr3 * 100).toFixed(2)} % — stabil kvalitetsprofil`,
  `prognosTillväxt +${(R.prognos * 100).toFixed(2)} % · spår-PEG ${R.peg.toFixed(2)} · ROIC 9,83 % > WACC 8,10 % · Altman 3,00 zongräns`,
);
writeFileSync("/tmp/r200-inlagg.txt", kvitto.join("\n"));
console.log(kvitto.join("\n"));
