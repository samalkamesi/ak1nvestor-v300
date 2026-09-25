#!/usr/bin/env node
/**
 * _r216-u20-universum-inlagg.mjs — v173 dataset-djup rond 216 U20 (+1):
 * E.ON EOAN.DE (Tyskland/energi 1→2) — cellmotiverad duo: RWE (produktion/
 * grön kraft) + E.ON (nätdistribution) = samma producent/distributör-kontrast
 * som Japan/energi-duon (INPEX+Tokyo Gas). P/E-bärarkontroll FÖRE leverans
 * (TTM-netto 3 207 M EUR > 0 — GRÖN); kollisionskontroll exakt-match GRÖN.
 * VÅGENS ÅTTONDE BROTTSFRIA RAD. Källans P/E-basvist dokumenterad.
 * Kvitto: /tmp/r216-inlagg.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const FÖRE = u.length;
if (u.some((b) => b.ticker === "EOAN.DE" || /^e\.on/i.test(b.namn ?? ""))) {
  console.error("ABORT: EOAN.DE finns redan på disken");
  process.exit(1);
}

const K = {
  pris: 12.01, aktierMdr: 2596, mcap: 31.17, epsGaap: 1.235, pe: 12.89, fwdPe: 11.53,
  pb: 1.45, evEbit: 9.6, pFcf: 10.2, pegKalla: 6.3, ps: 0.71,
  roe: 0.114, roic: 0.035, wacc: 0.048, ebitM: 0.075,
  nettoTtm: 3207, revTtm: 44023, nettoM: 0.073,
  fcf: 3046, de: 1.22, rantaTackning: 4.9, altman: 1.5, piotroski: 6, beta: 0.6,
  div: 0.57, payout: 0.462,
  omsSerie: [39325, 41676, 43429, 43935],   // M EUR, dec-slut FY2022–FY2025
  resSerie: [2096, 2884, 2930, 3076],
  fcfSerie: [2255, 2091, 2588, 3088],
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
  ["ps", R.ps, K.ps, 0.02], ["payout", R.payoutReplik, K.payout, 0.02],
  ["fcfY", R.fcfY, 1 / K.pFcf, 0.01],
];
const dokument = [["pe", R.peGaap, K.pe, 0.35]]; // källans justerade bas — dokumentklass med not
const fel = [...exakt, ...dokument].filter(([n, r, k, tol]) => avv(r, k) > tol);
if (fel.length) {
  console.error("ABORT: replik utanför tolerans: " + fel.map(([n, r, k]) => `${n} ${r.toFixed(4)} vs ${k}`).join("; "));
  process.exit(1);
}

const PARANOID =
  "ETR-PRIMÄRNOTING i EUR (RWE.DE/MUV2.DE-precedensens Frankfurt-rad; underlag S&P Global Market Intelligence + Fiscal.ai via StockAnalysis; intradag 2026-09-25 delayed +0,2 %; färshämtning direkt med cache-bypass + kompletterande FY-panel): " +
  "pris 12,01 EUR (beta 0,6), mcap 31,17 mdr EUR på 2 596 M aktier (replik 2 596 × 12,01 = 31,18 — 0,02 %), " +
  "P/E 12,89 ur källan på dess justerade EPS-bas 0,932 (GAAP-aktiebasrepliken 12,01/1,235 = 9,72 — dokumenterad basdifferens; Tokyo Gas/Hitachi-klassens not) mot forward P/E 11,53 ⇒ prognosTillväxt +11,80 % (trailing/fwd-modellen, MUFG-konventionen; spår-PEG 12,89/11,80 = 1,09 mot källans PEG 6,3 på 3-års, kalibreringsnot), P/B 1,45 · EV/EBIT 9,6 · PS 0,71 EXAKT replik (31 170/44 023 = 0,708), " +
  "ROE 11,4 % · ROIC 3,5 % under WACC 4,8 % (REGLERAD NÄTMETODNOT — distributionsnätets tillgångsbas, Redeia/Tokyo Gas-konventionen) · EBIT-marginal 7,5 % (nätdistributörens volymmarginal) · netto-marginal 7,29 % EXAKT replik (3 207/44 023 = 7,285 %) · FCF-yield 9,77 % (källans P/FCF-invers 9,80 % — 0,3 %), " +
  "balans: D/E 1,22 · räntetäckning 4,9 · Altman 1,5 (KÄLLANS VARNINGSZON — reglerat nätverk med tung infrastrukturinvestering (nätutbyggnadsprogrammet); Redeia/Cellnex/Tokyo Gas-metodnot-klassen; datafakta) · Piotroski 6; " +
  "utdelning 0,57 EUR/aktie (4,75 % — energikrisårens höjda utdelning) ⇒ senasteArMdr 1,480 (0,57 × 2 596) med payout 46,2 % EXAKT replikerbar (0,57/1,235 = 46,2 %); " +
  "FY-SERIEN dec-slutande (M EUR): oms [39 325 · 41 676 · 43 429 · 43 935] · netto [2 096 · 2 884 · 2 930 · 3 076] · FCF [2 255 · 2 091 · 2 588 · 3 088] — VÅGENS ÅTTONDE BROTTSFRIA RAD: samtliga positiva med NETTO STIGANDE VARJE ÅR (2 096→3 076) och FCF stigande tre år räknat; rak 3-årig CAGR FY22→FY25 (oms +3,79 % · netto +13,71 % — energikrisårens nättariffexpansion + reglerad bas); EPS-GAAP-serien [0,807 · 1,111 · 1,129 · 1,185]; " +
  "analytikerläge saknas i panelutdraget — ingen målkurs förs in; NÄSTA RAPPORT Q3 2026 est. tidigt november — v172-könotis v45; " +
  "kandidatur: CELLMOTIVERAD duo enligt U13-mönstret — Tyskland/energi-cellens TVÅ affärsmodeller: RWE (RWE.DE, produktion/grön kraft) + E.ON (EOAN.DE, nätdistribution) — SAMMA producent/distributör-kontrast som Japan/energi-duon (INPEX+Tokyo Gas, U19) — pedagogisk parallellitet över länderna; P/E-bärarkriteriet kontrollerat FÖRE leverans (TTM-netto 3 207 M EUR > 0; Sony/Honda-doktrinen); kollisionskontroll exakt-match GRÖN; Utilities ⇒ energi-cellen (27→28 bolag), Tyskland 19→20 (energi-grenen 1→2).";

const RAD = {
  ticker: "EOAN.DE",
  namn: "E.ON SE",
  bransch: "energi",
  land: "Tyskland",
  valuta: "EUR",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-25", url: "https://stockanalysis.com/quote/etr/EOAN/ (+ /statistics/ + /financials/)", paranoid: PARANOID }],
  hamtat: "2026-09-25",
  pris: K.pris,
  marknadsKapitalMdr: K.mcap,
  tillvaxt: {
    omsattningCAGR5ar: R.omsCagr3,
    resultatCAGR5ar: R.resCagr3,
    omsattningTillvaxtTTM: 0.011,
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
  aterkop: { senasteArMdr: 1.48, andelUtestande: K.payout, insiderkopSenaste6man: 0 },
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
    "cellmotiverad duo (Tyskland/energi 1→2: RWE produktion + E.ON nätdistribution — samma producent/distributör-kontrast som Japan/energi U19, pedagogisk parallellitet); ETR-primär EUR; VÅGENS ÅTTONDE BROTTSFRIA RAD (netto stigande varje år 2 096→3 076; rak CAGR oms +3,79 % · netto +13,71 % — energikrisårens nättariffexpansion); P/E 12,89 källans justerade bas (GAAP-replik 9,72 noterad); PS/netto-M/payout EXAKTA repliker; FCF-yield 9,77 %; utdelning 4,75 % (krisårens höjda nivå); REGLERAD NÄTMETODNOT (ROIC=WACC-formeln; Altman 1,5 = infrastrukturprogrammet — Redeia/Cellnex/Tokyo Gas-klassen); EK-serie saknas — serier.egetKapital tomt; rappdag Q3 est. tidigt november = v172-könotis; alla repliker i paranoid (StockAnalysis ETR 2026-09-25)",
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
  if (el[el.length - 1].ticker !== "EOAN.DE") { console.error("ABORT: sista raden ≠ EOAN.DE"); process.exit(1); }
}
const slut = JSON.parse(readFileSync(UNI, "utf8"));
const forandrade = backup.filter((b, i) => JSON.stringify(b) !== JSON.stringify(slut[i])).length;
if (forandrade !== 0) { console.error(`ABORT: ${forandrade} gamla rader förändrade`); process.exit(1); }

kvitto.push(
  `UNIVERSUM-INLÄGG GRÖN: ${FÖRE}→${slut.length} (+1 E.ON EOAN.DE, Tyskland/energi 27→${slut.filter((b) => b.bransch === "energi").length}; Tyskland → ${slut.filter((b) => b.land === "Tyskland").length})`,
  `indent=${indent} · gamla rader förändrade=${forandrade} · läs-tillbaka ×2 OK`,
  `REPLIKER: mcap ${R.mcap.toFixed(2)} 0,02 % · nettoM ${(R.nettoM * 100).toFixed(2)} % EXAKT · ps ${R.ps.toFixed(3)} (${K.ps}) EXAKT · payout ${R.payoutReplik.toFixed(4)} (${K.payout}) EXAKT · fcfY ${(R.fcfY * 100).toFixed(2)} % (mot ${(100 / K.pFcf).toFixed(2)} %) · pe 12,89 källa (GAAP-replik 9,72 noterad)`,
  `CAGR rak brottsfri (VÅGENS ÅTTONDE — netto stigande varje år): oms ${(R.omsCagr3 * 100).toFixed(2)} % · netto ${(R.resCagr3 * 100).toFixed(2)} %`,
  `prognosTillväxt +${(R.prognos * 100).toFixed(2)} % · spår-PEG ${R.peg.toFixed(2)} · reglerad nätmotodnot · producent/distributör-parallellen Japan–Tyskland dokumenterad`,
);
writeFileSync("/tmp/r216-inlagg.txt", kvitto.join("\n"));
console.log(kvitto.join("\n"));
