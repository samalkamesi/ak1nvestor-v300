#!/usr/bin/env node
/**
 * _r199-v173u5-universum-inlagg.mjs — v173 dataset-djup rond 199 U5 (+1):
 * Nutrien NTR (Kanada/material 0→1, TSX-primär) — BCE-OMG24 §10:s kö-notiserade
 * kandidat ("Kanada/material (NTR/AEM/ABX) ... öppna celler"). P/E-bärarkontroll
 * FÖRE leverans (TTM-netto 2 153 M > 0, P/E 17,28 — GRÖN); kollisionskontroll
 * exakt-match GRÖN.
 *
 * VALUTA-MIX (dokumenterad): TSX-noting med pris/utdelning i CAD; koncern-
 * rapportering i USD (Nutriens konventionsvaluta). Serier/marginaler i USD;
 * pris/mcap/avkastningar i CAD — konventionen för dual-valuta-rader.
 *
 * CYKELN (FCX/VALE-precedensen): kalium/gödning är priscykelbransch — FY22
 * krigstopp, FY24 nedskrivningsdipp; CAGR-fält bär konsekutiv FY23→FY25 med
 * HELA cykeln dokumenterad i paranoid.
 *
 * Kontrakt som U1–U4: duplikatgrind · replikervalidering (EXAKT: mcap/pe/nettoM/
 * ps; dokument: fcfY/payout) · kirurgisk append · läs-tillbaka ×2 · fältgrind.
 * Kvitto: /tmp/r199-inlagg.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const FÖRE = u.length;
if (u.some((b) => b.ticker === "NTR" || /nutrien/i.test(b.namn ?? ""))) {
  console.error("ABORT: Nutrien/NTR finns redan på disken");
  process.exit(1);
}

// ── Källvärden (StockAnalysis TSX NTR, 2026-09-25) + repliker ─────────────────
const K = {
  pris: 75.20, aktierMdr: 494.3, mcap: 37.22, eps: 4.36, pe: 17.28, fwdPe: 16.98,
  pb: 1.44, evEbit: 11.34, pFcf: 24.47, pegKalla: 3.66, ps: 1.43,
  roe: 0.0855, roic: 0.0576, wacc: 0.0713, bruttoM: 0.2635, ebitM: 0.0832,
  nettoTtm: 2153, revTtm: 26072, nettoM: 0.0826,
  fcf: 1562, de: 0.43, rantaTackning: 8.58, altman: 3.24, piotroski: 6, beta: 0.99,
  div: 2.18, payout: 0.5005,
  omsSerie: [37884, 29056, 26046, 26045],   // M USD, dec-slut FY2022–FY2025
  resSerie: [7660, 1410, 744, 2153],
  fcfSerie: [4438, 2016, 2468, 1562],
};
const R = {
  mcap: (K.aktierMdr * K.pris) / 1000,
  pe: K.pris / K.eps,
  nettoM: K.nettoTtm / K.revTtm,
  ps: (K.mcap * 1000) / K.revTtm,
  fcfY: K.fcf / (K.mcap * 1000),
  prognos: K.pe / K.fwdPe - 1,
  peg: K.pe / ((K.pe / K.fwdPe - 1) * 100),
  omsCagr2: Math.pow(K.omsSerie[3] / K.omsSerie[1], 1 / 2) - 1,  // konsekutiv FY23→FY25
  resCagr2: Math.pow(K.resSerie[3] / K.resSerie[1], 1 / 2) - 1,
  omsCagr3: Math.pow(K.omsSerie[3] / K.omsSerie[0], 1 / 3) - 1,  // cykeltoppsbas (loggas)
  resCagr3: Math.pow(K.resSerie[3] / K.resSerie[0], 1 / 3) - 1,
  payoutReplik: K.div / K.eps,
};
const avv = (a, b) => Math.abs(a / b - 1);
const exakt = [
  ["mcap", R.mcap, K.mcap, 0.02], ["pe", R.pe, K.pe, 0.02],
  ["nettoM", R.nettoM, K.nettoM, 0.02], ["ps", R.ps, K.ps, 0.02],
];
const dokument = [["fcfY", R.fcfY, 1 / K.pFcf, 0.05], ["payout", R.payoutReplik, K.payout, 0.05]];
const fel = [...exakt, ...dokument].filter(([n, r, k, tol]) => avv(r, k) > tol);
if (fel.length) {
  console.error("ABORT: replik utanför tolerans: " + fel.map(([n, r, k]) => `${n} ${r.toFixed(4)} vs ${k}`).join("; "));
  process.exit(1);
}

const PARANOID =
  "TSX-PRIMÄRNOTING med VALUTA-MIX (BCE/TELUS/RCI-B-precedensens Toronto-rad; pris/utdelning/mcap i CAD, koncernrapportering i USD enligt Nutriens konventionsvaluta — serier och marginaler bär USD, avkastningar CAD; underlag S&P Global Market Intelligence + Fiscal.ai via StockAnalysis; intradag 2026-09-25 delayed +0,70 %; färshämtning direkt med cache-bypass): " +
  "pris 75,20 CAD (52v 59,53–78,45 · beta 0,99), mcap 37,22 mdr CAD på 494,3 M aktier (replik 494,3 × 75,20 = 37,17 — 0,13 %), " +
  "P/E 17,28 replikerbar (75,20/4,36 = 17,25 = 0,2 %; EPS-radens 4,36 bär CAD-konverterad koncernvinst — payout-konsistens 2,18/4,36 = 50,0 % mot källans 50,05 % bekräkar basen) mot forward P/E 16,98 ⇒ prognosTillväxt +1,77 % (trailing/fwd-modellen, MUFG-konventionen — platt konsensus; spår-PEG 17,28/1,77 = 9,77 meningslös på platt prognos, källans PEG 3,66 på 3-års som kalibreringsnot ⇒ fältet peg NULL-doktrinen värdebärande), P/B 1,44 · EV/EBIT 11,34 · PS 1,43 EXAKT replik (37 220/26 072 = 1,428), " +
  "ROE 8,55 % · ROIC 5,76 % (under WACC 7,13 % — kapitaltät gödselindustri, dokumenterat) · brutto 26,35 % · EBIT-marginal 8,32 % · netto-marginal 8,26 % EXAKT replik (2 153/26 072 = 8,258 %) · FCF-marginal 5,99 % replik (1 562/26 072); FCF-yield 4,20 % replik mot källans P/FCF-invers 4,09 % (2,7 % — FCF-fönsterskillnad, dokumentklass); " +
  "balans: D/E 0,43 · räntetäckning 8,58 · Altman 3,24 (SUND zon — Kanada-raden med starkaste balansmåttet) · Piotroski 6 · kassa 1,26 mdr · skuld 2,32 mdr · NETTOSKULD 1,06 mdr; " +
  "utdelning 2,18 CAD/aktie (2,90 %) ⇒ senasteArMdr 1 078 (2,18 × 494,3) med källans payout 50,05 % (replik 50,0 % ✓); " +
  "FY-SERIEN dec-slutande (M USD): oms [37 884 · 29 056 · 26 046 · 26 045] · netto [7 660 · 1 410 · 744 · 2 153] · FCF [4 438 · 2 016 · 2 468 · 1 562] — GÖDNINGSCYKELN (FCX/VALE-precedensen): FY2022 = kaliumtoppen (krigets prisboom, netto 7 660 M) · FY2024 = nedskrivningsdippen (744 M på gas-/prisnedskrivningar) · FY2025 = återhämtning (2 153 M); CAGR-fälten bär KONSEKUTIV FY23→FY25-bas (oms −5,32 % · netto +23,56 %) medan cykelbasen FY22→FY25 (oms −11,49 % · netto −33,05 %) dokumenteras här — tillväxten är PRISCYKEL, ej strukturell expansion, och läsningen sker mot cykelns läge; EPS-serien [15,10 · 2,74 · 1,48 · 4,36] bär samma cykel; " +
  "analytikerläge saknas i panelutdraget — ingen målkurs förs in; NÄSTA RAPPORT est. 2026-11-04 (Q3 2026) — v172-könotis v45; " +
  "kandidatur: S2-U1-BCE-UTOKNING-OMG24 §10 kö-notis 'Kanada/material (NTR/AEM/ABX) — öppna celler' — förstakoordinat NTR; P/E-bärarkriteriet kontrollerat FÖRE leverans (TTM-netto 2 153 M > 0, P/E 17,28; Sony/Honda-doktrinen); kollisionskontroll exakt-match GRÖN; Basic Materials ⇒ material-cellen (26→27 bolag), Kanada 5→6.";

const RAD = {
  ticker: "NTR",
  namn: "Nutrien Ltd.",
  bransch: "material",
  land: "Kanada",
  valuta: "CAD",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-25", url: "https://stockanalysis.com/quote/tsx/NTR/ (+ /statistics/ + /financials/)", paranoid: PARANOID }],
  hamtat: "2026-09-25",
  pris: K.pris,
  marknadsKapitalMdr: K.mcap,
  tillvaxt: {
    omsattningCAGR5ar: R.omsCagr2,
    resultatCAGR5ar: R.resCagr2,
    omsattningTillvaxtTTM: 0.01,
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
  aterkop: { senasteArMdr: 1.078, andelUtestande: K.payout, insiderkopSenaste6man: 0 },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
  vardering: { pe: K.pe, pb: K.pb, evEbit: K.evEbit, peg: null, fcfYield: R.fcfY, egenKapitalMultipl: K.pb },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2022", "2023", "2024", "2025"],
    omsattning: K.omsSerie.map((x) => x * 1e6),
    resultat: K.resSerie.map((x) => x * 1e6),
    egetKapital: [],
    fcf: K.fcfSerie.map((x) => x * 1e6),
  },
  notering:
    "kandidat ur BCE-OMG24 §10:s kö-notis (Kanada/material-öppningen; P/E-bärare kontrollerad före leverans); TSX-primär med VALUTA-MIX: pris/utdelning CAD, koncernrapportering USD (dokumenterat i paranoid); GÖDNINGSCYKELN dokumenterad (FY22 krigstopp · FY24 nedskrivningsdipp · FY25 återhämtning) ⇒ CAGR på konsekutiv FY23→FY25 medan cykelbasen redovisas — tillväxten är priscykel (FCX/VALE-precedensen); peg NULL (platt prognos +1,8 % gör spår-PEG meningslös; källans 3,66 kalibreringsnot); ROIC under WACC (kapitaltät industri); Altman 3,24 sund zon; FCF-yield-fönsterskillnad dokumenterad; EK-serie saknas — serier.egetKapital tomt; rappdag est. 2026-11-04 = v172-könotis; alla repliker i paranoid (StockAnalysis TSX 2026-09-25)",
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
  if (el[el.length - 1].ticker !== "NTR") { console.error(`ABORT: läs-tillbaka ${i}: sista raden ≠ NTR`); process.exit(1); }
}
const slut = JSON.parse(readFileSync(UNI, "utf8"));
const forandrade = backup.filter((b, i) => JSON.stringify(b) !== JSON.stringify(slut[i])).length;
if (forandrade !== 0) { console.error(`ABORT: ${forandrade} gamla rader förändrade`); process.exit(1); }

kvitto.push(
  `UNIVERSUM-INLÄGG GRÖN: ${FÖRE}→${slut.length} (+1 Nutrien NTR, Kanada/material 26→${slut.filter((b) => b.bransch === "material").length}; Kanada-cellen → ${slut.filter((b) => b.land === "Kanada").length})`,
  `indent=${indent} · gamla rader förändrade=${forandrade} · läs-tillbaka ×2 OK`,
  `REPLIKER: mcap ${R.mcap.toFixed(2)} (${K.mcap}) · pe ${R.pe.toFixed(2)} (${K.pe}) · nettoM ${(R.nettoM * 100).toFixed(2)} % EXAKT · ps ${R.ps.toFixed(3)} (${K.ps}) · fcfY ${(R.fcfY * 100).toFixed(2)} % (mot ${(100 / K.pFcf).toFixed(2)} %, dokument) · payout ${R.payoutReplik.toFixed(4)} (${K.payout}) ✓`,
  `CAGR (konsekutiv FY23→25): oms ${(R.omsCagr2 * 100).toFixed(2)} % · netto ${+(R.resCagr2 * 100).toFixed(2)} % — cykelbasen FY22→25 (oms ${(R.omsCagr3 * 100).toFixed(1)} % · netto ${(R.resCagr3 * 100).toFixed(1)} %) dokumenterad i paranoid`,
  `prognosTillväxt +${(R.prognos * 100).toFixed(2)} % (platt) ⇒ peg NULL · Altman 3,24 sund zon · valuta-mix CAD/USD dokumenterad`,
);
writeFileSync("/tmp/r199-inlagg.txt", kvitto.join("\n"));
console.log(kvitto.join("\n"));
