#!/usr/bin/env node
/**
 * _r211-u15-universum-inlagg.mjs — v173 dataset-djup rond 211 U15 (+1):
 * Deutsche Post DHL DHL.DE (Tyskland/industri 1→2) — cellmotiverad duo enligt
 * U13/U14-mönstret: Siemens (industriautomation) + DHL (logistik) = cellens två
 * affärsmodeller. P/E-bärarkontroll FÖRE leverans (TTM-netto 4 893 M EUR > 0 —
 * GRÖN); kollisionskontroll exakt-match GRÖN.
 * PANDEMIBOOMS-BROTTET FY2022 (paketboomens topp) ⇒ konsekutiv post-boom-bas.
 * Kvitto: /tmp/r211-inlagg.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const FÖRE = u.length;
if (u.some((b) => b.ticker === "DHL.DE" || /deutsche post/i.test(b.namn ?? ""))) {
  console.error("ABORT: DHL.DE finns redan på disken");
  process.exit(1);
}

const K = {
  pris: 48.66, aktierMdr: 1190, mcap: 57.93, epsTotal: 4.11, pe: 12.87, fwdPe: 11.60,
  pb: 2.64, evEbit: 9.51, pFcf: 17.85, pegKalla: 1.29, ps: 0.66,
  roe: 0.2010, roic: 0.0890, wacc: 0.0741, ebitM: 0.0740,
  nettoTtm: 4893, revTtm: 87143, nettoM: 0.0561,
  fcf: 3246, de: 1.06, rantaTackning: 8.36, altman: 2.63, piotroski: 7, beta: 1.04,
  div: 2.15, payout: 0.5231,
  omsSerie: [94439, 81824, 84779, 87193],   // M EUR, dec-slut FY2022–FY2025
  resSerie: [8458, 4885, 4710, 5132],
  fcfSerie: [4857, 2960, 3323, 3040],
};
const R = {
  mcap: (K.aktierMdr * K.pris) / 1000,
  peTotal: K.pris / K.epsTotal,
  nettoM: K.nettoTtm / K.revTtm,
  ps: (K.mcap * 1000) / K.revTtm,
  fcfY: K.fcf / (K.mcap * 1000),
  prognos: K.pe / K.fwdPe - 1,
  peg: K.pe / ((K.pe / K.fwdPe - 1) * 100),
  omsCagr2: Math.pow(K.omsSerie[3] / K.omsSerie[1], 1 / 2) - 1,  // konsekutiv post-boom FY23→FY25
  resCagr2: Math.pow(K.resSerie[3] / K.resSerie[1], 1 / 2) - 1,
  omsCagr3: Math.pow(K.omsSerie[3] / K.omsSerie[0], 1 / 3) - 1,  // boomstoppsbas (loggas)
  resCagr3: Math.pow(K.resSerie[3] / K.resSerie[0], 1 / 3) - 1,
  payoutReplik: K.div / K.epsTotal,
};
const avv = (a, b) => Math.abs(a / b - 1);
const exakt = [
  ["mcap", R.mcap, K.mcap, 0.02], ["nettoM", R.nettoM, K.nettoM, 0.02],
  ["fcfY", R.fcfY, 1 / K.pFcf, 0.02], ["payout", R.payoutReplik, K.payout, 0.02],
];
const dokument = [["pe", R.peTotal, K.pe, 0.10]]; // attributable-/vägd EPS-bas — dokumentklass med not
const fel = [...exakt, ...dokument].filter(([n, r, k, tol]) => avv(r, k) > tol);
if (fel.length) {
  console.error("ABORT: replik utanför tolerans: " + fel.map(([n, r, k]) => `${n} ${r.toFixed(4)} vs ${k}`).join("; "));
  process.exit(1);
}

const PARANOID =
  "ETR-PRIMÄRNOTING i EUR (SAP.DE/MUV2.DE/SHL.DE-precedensens Frankfurt-rad; underlag S&P Global Market Intelligence + Fiscal.ai via StockAnalysis; intradag 2026-09-25 delayed +0,04 %; färshämtning direkt med cache-bypass + kompletterande FY-panelhämtning för exakt tabelläsning): " +
  "pris 48,66 EUR (52v 38,14–51,56 · beta 1,04), mcap 57,93 mdr EUR på 1 190 M aktier (replik 1 190 × 48,66 = 57,91 — 0,04 %), " +
  "P/E 12,87 ur källan på attributable-/vägd EPS-bas (48,66/3,78; totalnetto-repliken 48,66/4,11 = 11,84 avviker 8 % — minoritets-/vägningsnot dokumenterad, Rogers/BT-klassen) mot forward P/E 11,60 ⇒ prognosTillväxt +10,95 % (trailing/fwd-modellen, MUFG-konventionen; spår-PEG 12,87/10,95 = 1,18 mot källans PEG 1,29 — nära kalibrering), P/B 2,64 · EV/EBIT 9,51 · PS 0,66 (replik 57 930/87 143 = 0,665 = 0,7 %), " +
  "ROE 20,10 % · ROIC 8,90 % ÖVER WACC 7,41 % (värdeskapande logistik — dokumenterat) · EBIT-marginal 7,40 % (logistikbranschens marginalstruktur: volymbransch med tunn marginal) · netto-marginal 5,61 % EXAKT replik (4 893/87 143 = 5,615 %) · FCF-yield EXAKT replik (3 246/57 930 = 5,60 % = 1/P·FCF 1/17,85 = 5,60 %); " +
  "balans: D/E 1,06 · räntetäckning 8,36 · Altman 2,63 (KÄLLANS VARNINGSZON — logistikbalansens leasade flygplan/fordon och nätinvesteringar; datafakta) · Piotroski 7 · kassa 3,60 mdr · skuld 18,42 mdr · NETTOSKULD 14,82 mdr · EK 21,9 mdr; " +
  "utdelning 2,15 EUR/aktie (4,42 %) ⇒ senasteArMdr 2,559 (2,15 × 1 190) med payout 52,31 % EXAKT replikerbar (2,15/4,11 = 52,31 %); " +
  "FY-SERIEN dec-slutande (M EUR): oms [94 439 · 81 824 · 84 779 · 87 193] · netto [8 458 · 4 885 · 4 710 · 5 132] · FCF [4 857 · 2 960 · 3 323 · 3 040] — PANDEMIBOOMS-BROTTET FY2022: netto 8 458 = paketboomens topp (e-handelsexplosionens sista toppår) följt av normalisering till ~4,7–5,1 mdr och påbörjad återhämtning; rak CAGR FY22→FY25 (oms −2,60 % · netto −15,42 %) bär BOOMSTOPPSBAS och är vilseledande som tillväxtmått — CAGR-fälten bär KONSEKUTIV post-boom-bas FY23→FY25 (oms +3,25 % · netto +2,49 % = den normaliserade bilden; NTR/AEM-klassens spegelvända situation: där bottenbas, här boomstoppsbas — samma doktrin); EPS-totalserien [7,17 · 4,13 · 3,97 · 4,31]; " +
  "analytikerläge saknas i panelutdraget — ingen målkurs förs in; NÄSTA RAPPORT Q3 2026 est. tidigt november — v172-könotis v45; " +
  "kandidatur: CELLMOTIVERAD duo enligt U13/U14-mönstret — Tyskland/industri-cellens TVÅ affärsmodeller: Siemens (SIE.DE, industriautomation) + Deutsche Post/DHL (DHL.DE, logistik/express) — cellens pedagogiska kontrast (kapitalvaru-tillverkare mot tjänstenät); P/E-bärarkriteriet kontrollerat FÖRE leverans (TTM-netto 4 893 M EUR > 0; Sony/Honda-doktrinen); kollisionskontroll exakt-match GRÖN; Industrials ⇒ industri-cellen (24→25 bolag), Tyskland 18→19 (industri-grenen 1→2).";

const RAD = {
  ticker: "DHL.DE",
  namn: "Deutsche Post AG",
  bransch: "industri",
  land: "Tyskland",
  valuta: "EUR",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-25", url: "https://stockanalysis.com/quote/etr/DHL/ (+ /statistics/ + /financials/)", paranoid: PARANOID }],
  hamtat: "2026-09-25",
  pris: K.pris,
  marknadsKapitalMdr: K.mcap,
  tillvaxt: {
    omsattningCAGR5ar: R.omsCagr2,
    resultatCAGR5ar: R.resCagr2,
    omsattningTillvaxtTTM: 0.052,
    prognosTillvaxt: R.prognos,
  },
  lonksamhet: {
    roe: K.roe, roic: K.roic, bruttoMarginal: null, ebitMarginal: K.ebitM,
    nettoMarginal: K.nettoM, fcfMarginal: K.fcf / K.revTtm,
  },
  stabilitet: {
    skuldEgenkapital: K.de, rantaTackning: K.rantaTackning, fcfPositivaSenaste5: 5,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: 0,
  },
  aterkop: { senasteArMdr: 2.559, andelUtestande: K.payout, insiderkopSenaste6man: 0 },
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
    "cellmotiverad duo enligt U13/U14-mönstret (Tyskland/industri 1→2: Siemens automation + DHL logistik = cellens två affärsmodeller); ETR-primär EUR; PANDEMIBOOMS-BROTT FY2022 (netto 8 458 = paketboomens topp) ⇒ CAGR på konsekutiv post-boom-bas FY23→FY25 (oms +3,25 % · netto +2,49 % — normaliserad bild; boomstoppsbasen −15,4 %/år dokumenterad som vilseledande; NTR/AEM-klassens spegelvända); P/E 12,87 på attributable-bas (totalnetto-replik 11,84 = 8 % dokumenterad); ROIC 8,90 % ÖVER WACC 7,41 % (värdeskapande); Altman 2,63 varningszon (leasad logistikbalans) datafakta; payout 52,31 % EXAKT; bruttoMarginal null (logistikens bruttobegrepp osammanhängande — osatt); EK-serie saknas — serier.egetKapital tomt; rappdag Q3 est. tidigt november = v172-könotis; alla repliker i paranoid (StockAnalysis ETR 2026-09-25)",
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
  if (el[el.length - 1].ticker !== "DHL.DE") { console.error("ABORT: sista raden ≠ DHL.DE"); process.exit(1); }
}
const slut = JSON.parse(readFileSync(UNI, "utf8"));
const forandrade = backup.filter((b, i) => JSON.stringify(b) !== JSON.stringify(slut[i])).length;
if (forandrade !== 0) { console.error(`ABORT: ${forandrade} gamla rader förändrade`); process.exit(1); }

kvitto.push(
  `UNIVERSUM-INLÄGG GRÖN: ${FÖRE}→${slut.length} (+1 Deutsche Post DHL DHL.DE, Tyskland/industri 24→${slut.filter((b) => b.bransch === "industri").length}; Tyskland → ${slut.filter((b) => b.land === "Tyskland").length})`,
  `indent=${indent} · gamla rader förändrade=${forandrade} · läs-tillbaka ×2 OK`,
  `REPLIKER: mcap ${R.mcap.toFixed(2)} 0,04 % · nettoM ${(R.nettoM * 100).toFixed(2)} % EXAKT · fcfY ${(R.fcfY * 100).toFixed(2)} % (mot ${(100 / K.pFcf).toFixed(2)} %) EXAKT · payout ${R.payoutReplik.toFixed(4)} (${K.payout}) EXAKT · pe-total ${R.peTotal.toFixed(2)} vs källa ${K.pe} (attributable-bas — dokumentklass)`,
  `CAGR (post-boom konsekutiv FY23→25): oms ${(R.omsCagr2 * 100).toFixed(2)} % · netto ${(R.resCagr2 * 100).toFixed(2)} % — boomstoppsbasen FY22→25 (oms ${(R.omsCagr3 * 100).toFixed(1)} % · netto ${(R.resCagr3 * 100).toFixed(1)} %) dokumenterad som vilseledande`,
  `prognosTillväxt +${(R.prognos * 100).toFixed(2)} % · spår-PEG ${R.peg.toFixed(2)} (källans 1,29 — nära) · ROIC 8,90 % > WACC 7,41 % · pandemibooms-brottet dokumenterat`,
);
writeFileSync("/tmp/r211-inlagg.txt", kvitto.join("\n"));
console.log(kvitto.join("\n"));
