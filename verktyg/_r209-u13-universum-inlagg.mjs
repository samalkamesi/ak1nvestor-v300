#!/usr/bin/env node
/**
 * _r209-u13-universum-inlagg.mjs — v173 dataset-djup rond 209 U13 (+1):
 * Munich Re MUV2.DE (Tyskland/finans 1→2) — cellmotiverad kandidatur enligt
 * S2-mönstret: finanscellens ANDRA affärsmodell (återförsäkring bredvid Allianz
 * direktförsäkring — TRYG/AXA-precedensens duostruktur). P/E-bärarkontroll FÖRE
 * leverans (TTM-netto 5 957 M EUR > 0 — GRÖN); kollisionskontroll exakt-match GRÖN.
 * Kvitto: /tmp/r209-inlagg.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const FÖRE = u.length;
if (u.some((b) => b.ticker === "MUV2.DE" || /munich re/i.test(b.namn ?? ""))) {
  console.error("ABORT: MUV2.DE finns redan på disken");
  process.exit(1);
}

const K = {
  pris: 532.20, aktierMdr: 140.8, mcap: 74.75, eps: 38.48, pe: 13.83, fwdPe: 13.50,
  pb: 1.98, evEbit: 13.12, pFcf: 8.93, pegKalla: 0.94, ps: 1.09,
  roe: 0.1455, roic: 0.0283, wacc: 0.0579, ebitM: 0.0920,
  nettoTtm: 5957, revTtm: 68595, nettoM: 0.0868,
  fcf: 8375, de: 0.52, altman: 2.03, piotroski: 6, beta: 0.81,
  div: 20.00, payout: 0.5194,
  omsSerie: [67096, 67720, 68850, 69075],   // M EUR, dec-slut FY2022–FY2025
  resSerie: [5563, 5707, 5671, 5811],
  fcfSerie: [7733, 7988, 8341, 8216],
};
const R = {
  mcap: (K.aktierMdr * K.pris) / 1000,
  pe: K.pris / K.eps,
  nettoM: K.nettoTtm / K.revTtm,
  ps: (K.mcap * 1000) / K.revTtm,
  fcfY: K.fcf / (K.mcap * 1000),
  prognos: K.pe / K.fwdPe - 1,
  peg: K.pe / ((K.pe / K.fwdPe - 1) * 100),
  omsCagr3: Math.pow(K.omsSerie[3] / K.omsSerie[0], 1 / 3) - 1,
  resCagr3: Math.pow(K.resSerie[3] / K.resSerie[0], 1 / 3) - 1,
  payoutReplik: K.div / K.eps,
};
const avv = (a, b) => Math.abs(a / b - 1);
const exakt = [
  ["mcap", R.mcap, K.mcap, 0.02], ["pe", R.pe, K.pe, 0.02],
  ["nettoM", R.nettoM, K.nettoM, 0.02], ["ps", R.ps, K.ps, 0.02],
  ["fcfY", R.fcfY, 1 / K.pFcf, 0.02], ["payout", R.payoutReplik, K.payout, 0.02],
];
const fel = exakt.filter(([n, r, k, tol]) => avv(r, k) > tol);
if (fel.length) {
  console.error("ABORT: replik utanför tolerans: " + fel.map(([n, r, k]) => `${n} ${r.toFixed(4)} vs ${k}`).join("; "));
  process.exit(1);
}

const PARANOID =
  "ETR-PRIMÄRNOTING i EUR (SAP.DE/ALV.DE/SIE.DE-precedensens Frankfurt-rad; underlag S&P Global Market Intelligence + Fiscal.ai via StockAnalysis; intradag 2026-09-25 delayed +0,10 %; färshämtning direkt med cache-bypass + kompletterande FY-panelhämtning för exakt tabelläsning): " +
  "pris 532,20 EUR (52v 447,90–561,00 · beta 0,81), mcap 74,75 mdr EUR på 140,8 M aktier (replik 140,8 × 532,20 = 74,93 — 0,25 %), " +
  "P/E 13,83 EXAKT replikerbar på källans EPS-rad 38,48 (532,20/38,48 = 13,83; EPS-identiteten på totalnetto 5 957/140,8 = 42,3 — källans EPS bär attributable-/vägd bas, dokumenterad; BT/Redeia-klassens minoritetsnot) mot forward P/E 13,50 ⇒ prognosTillväxt +2,44 % (trailing/fwd-modellen, MUFG-konventionen — MOGEN BRANSCH: återförsäkringens avtalscykel ger lugn konsensus; spår-PEG 13,83/2,44 = 5,67 mot källans PEG 0,94 på 3-års, kalibreringsnot — olika baser dokumenterade), P/B 1,98 · EV/EBIT 13,12 · PS 1,09 EXAKT (74 750/68 595 = 1,0897), " +
  "ROE 14,55 % · ROIC 2,83 % (FÖRSÄKRINGSMETODNOT: återförsäkrarens 'kapital' är försäkringstekniska reserver — ROIC speglar ej kapitalproduktivitet utan balansstruktur; dokumenterat som ALLIANZ/SAN.MC-konventionen) · EBIT-marginal 9,20 % · netto-marginal 8,68 % EXAKT (5 957/68 595 = 8,683 %) · FCF-yield EXAKT (8 375/74 750 = 11,20 % = 1/P·FCF 1/8,93 = 11,20 %); " +
  "balans: D/E 0,52 · Altman 2,03 (KÄLLANS VARNINGSGRÄNS — FÖRSÄKRINGSBALANSMETODNOT: premieinflows är skuld innan de är vinst; balansens storlek är affärsmodellen; datafakta med not, Piotroski 6) · kassa 3,99 mdr · skuld 34,29 mdr (försäkringstekniska balansen) · EK 38,40 mdr; " +
  "utdelning 20,00 EUR/aktie (3,76 %) ⇒ senasteArMdr 2,816 (20,00 × 140,8 M) med payout 51,94 % EXAKT replikerbar (20,00/38,48 = 51,98 % — 0,08 %); " +
  "FY-SERIEN dec-slutande (M EUR): oms [67 096 · 67 720 · 68 850 · 69 075] · netto [5 563 · 5 707 · 5 671 · 5 811] · FCF [7 733 · 7 988 · 8 341 · 8 216] — VÅGENS FJÄRDE BROTTSFRIA RAD (efter TELUS/CNR/Redeia): samtliga positiva, mjukt stigande, inga brott/cykler; rak 3-årig CAGR FY22→FY25 (oms +0,97 % · netto +1,46 %) — STABILITETENS KÄRNA, inte tillväxt (reglerad försäkringsbas; dokumenterat som sådan — P/E 13,8 på 1,5 %-tillväxt är moget bolag); EPS-serien [35,85 · 36,81 · 36,56 · 37,42]; " +
  "analytikerläge saknas i panelutdraget — ingen målkurs förs in; NÄSTA RAPPORT Q3 2026 est. tidigt november — v172-könotis v45; " +
  "kandidatur: CELLMOTIVERAD enligt S2-mönstret (dokumenterade listor tomma efter U12) — Tyskland/finans-cellens ANDRA affärsmodell: Allianz (direktförsäkring) + Munich Re (återförsäkring) = TRYG/AXA-precedensens duostruktur; P/E-bärarkriteriet kontrollerat FÖRE leverans (TTM-netto 5 957 M EUR > 0; Sony/Honda-doktrinen); kollisionskontroll exakt-match GRÖN (SAP-förslaget avlivat av samma grind — SAP.DE på disk sedan tidigare); Financials ⇒ finans-cellen (37→38 bolag), Tyskland 16→17 (landets nionde gren öppnad på 1→2).";

const RAD = {
  ticker: "MUV2.DE",
  namn: "Münchener Rückversicherungs-Gesellschaft AG",
  bransch: "finans",
  land: "Tyskland",
  valuta: "EUR",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-25", url: "https://stockanalysis.com/quote/etr/MUV2/ (+ /statistics/ + /financials/)", paranoid: PARANOID }],
  hamtat: "2026-09-25",
  pris: K.pris,
  marknadsKapitalMdr: K.mcap,
  tillvaxt: {
    omsattningCAGR5ar: R.omsCagr3,
    resultatCAGR5ar: R.resCagr3,
    omsattningTillvaxtTTM: 0.057,
    prognosTillvaxt: R.prognos,
  },
  lonksamhet: {
    roe: K.roe, roic: K.roic, bruttoMarginal: null, ebitMarginal: K.ebitM,
    nettoMarginal: K.nettoM, fcfMarginal: K.fcf / K.revTtm,
  },
  stabilitet: {
    skuldEgenkapital: K.de, rantaTackning: null, fcfPositivaSenaste5: 5,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: 0,
  },
  aterkop: { senasteArMdr: 2.816, andelUtestande: K.payout, insiderkopSenaste6man: 0 },
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
    "cellmotiverad kandidatur (S2-mönstret — dokumenterade listor tomma): Tyskland/finans 1→2 med Allianz direkt + Munich Re åter (TRYG/AXA-precedensens duostruktur); ETR-primär EUR; VÅGENS FJÄRDE BROTTSFRIA RAD (samtliga FY positiva, mjuk stigning — rak CAGR oms +0,97 % · netto +1,46 % = stabilitet, inte tillväxt; P/E 13,8 dokumenterat som moget bolag); P/E EXAKT på källans EPS-rad (attributable-bas med totalnotto-not); FÖRSÄKRINGSMETODNOTER: ROIC speglar reservstruktur (ej kapitalproduktivitet), Altman 2,03 varningsgräns = försäkringsbalansens affärsmodell (premier är skuld innan vinst), bruttoMarginal null (försäkring saknar meningsfull brutto — osatt); payout 51,94 % EXAKT replikerbar; rantaTackning null (räntekostnad ej bruten ut i försäkringsbalansen); EK-serie saknas — serier.egetKapital tomt; rappdag Q3 est. tidigt november = v172-könotis; alla repliker i paranoid (StockAnalysis ETR 2026-09-25)",
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
  if (el[el.length - 1].ticker !== "MUV2.DE") { console.error("ABORT: sista raden ≠ MUV2.DE"); process.exit(1); }
}
const slut = JSON.parse(readFileSync(UNI, "utf8"));
const forandrade = backup.filter((b, i) => JSON.stringify(b) !== JSON.stringify(slut[i])).length;
if (forandrade !== 0) { console.error(`ABORT: ${forandrade} gamla rader förändrade`); process.exit(1); }

kvitto.push(
  `UNIVERSUM-INLÄGG GRÖN: ${FÖRE}→${slut.length} (+1 Munich Re MUV2.DE, Tyskland/finans 37→${slut.filter((b) => b.bransch === "finans").length}; Tyskland → ${slut.filter((b) => b.land === "Tyskland").length})`,
  `indent=${indent} · gamla rader förändrade=${forandrade} · läs-tillbaka ×2 OK`,
  `REPLIKER: mcap ${R.mcap.toFixed(2)} (${K.mcap}) 0,25 % · pe ${R.pe.toFixed(2)} (${K.pe}) EXAKT · nettoM ${(R.nettoM * 100).toFixed(2)} % EXAKT · ps ${R.ps.toFixed(4)} (${K.ps}) EXAKT · fcfY ${(R.fcfY * 100).toFixed(2)} % (mot ${(100 / K.pFcf).toFixed(2)} %) EXAKT · payout ${R.payoutReplik.toFixed(4)} (${K.payout}) EXAKT 0,08 %`,
  `CAGR rak brottsfri FY22→25 (VÅGENS FJÄRDE): oms ${(R.omsCagr3 * 100).toFixed(2)} % · netto ${(R.resCagr3 * 100).toFixed(2)} % — stabilitetens kärna dokumenterad`,
  `prognosTillväxt +${(R.prognos * 100).toFixed(2)} % (mogen bransch) · spår-PEG ${R.peg.toFixed(2)} (källans 0,94 kalibreringsnot) · försäkringsmetodnoter (ROIC/Altman/brutto-null) dokumenterade`,
);
writeFileSync("/tmp/r209-inlagg.txt", kvitto.join("\n"));
console.log(kvitto.join("\n"));
