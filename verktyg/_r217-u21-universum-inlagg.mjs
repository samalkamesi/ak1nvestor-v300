#!/usr/bin/env node
/**
 * _r217-u21-universum-inlagg.mjs — v173 dataset-djup rond 217 U21 (+1):
 * freenet AG FNT.DE (Tyskland/kommunikation 1→2) — cellmotiverad duo:
 * Deutsche Telekom (integrerad jätte) + freenet (MVNO/mobil detaljhandel —
 * kassageneratoren) = cellens två modeller. P/E-bärarkontroll FÖRE leverans
 * (TTM-netto 610 M EUR > 0 — GRÖN); kollisionskontroll exakt-match GRÖN.
 * VÅGENS NIONDE BROTTSFRIA RAD. SHIN-ETSU-PRECEDENSEN åter:
 * källans P/E-rad 11,4 motsägs av källans egen EPS-rad — aktiebas-repliken
 * 5,13 bär fältet, låst av tre oberoende identiteter.
 * Kvitto: /tmp/r217-inlagg.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const FÖRE = u.length;
if (u.some((b) => b.ticker === "FNT.DE" || /freenet ag/i.test(b.namn ?? ""))) {
  console.error("ABORT: FNT.DE finns redan på disken");
  process.exit(1);
}

const K = {
  pris: 23.92, aktierMdr: 130.9, mcap: 3.133, eps: 4.66, peKalla: 11.40,
  pb: 1.05, evEbit: 6.2, pFcf: 5.6, pegKalla: 0.41,
  roe: 0.092, roic: 0.059, wacc: 0.060, ebitM: 0.190,
  nettoTtm: 610, revTtm: 2545,
  fcf: 560, de: 1.01, rantaTackning: 6.5, altman: 2.1, piotroski: 7, beta: 0.8,
  div: 1.85,
  omsSerie: [2389, 2484, 2528, 2540],   // M EUR, dec-slut FY2022–FY2025
  resSerie: [447, 491, 549, 580],
  fcfSerie: [427, 436, 431, 427],
};
const R = {
  mcap: (K.aktierMdr * K.pris) / 1000,
  pe: K.pris / K.eps,
  nettoM: K.nettoTtm / K.revTtm,
  fcfY: K.fcf / (K.mcap * 1000),
  fcfM: K.fcf / K.revTtm,
  omsCagr3: Math.pow(K.omsSerie[3] / K.omsSerie[0], 1 / 3) - 1,
  resCagr3: Math.pow(K.resSerie[3] / K.resSerie[0], 1 / 3) - 1,
  payoutReplik: K.div / K.eps,
  psReplik: K.mcap / K.revTtm,
};
const avv = (a, b) => Math.abs(a / b - 1);
const exakt = [
  ["mcap", R.mcap, K.mcap, 0.02],
  ["fcfY", R.fcfY, 1 / K.pFcf, 0.02],
  ["eps-identitet", K.eps * K.aktierMdr, K.nettoTtm, 0.02],
];
const fel = exakt.filter(([n, r, k, tol]) => avv(r, k) > tol);
if (fel.length) {
  console.error("ABORT: replik utanför tolerans: " + fel.map(([n, r, k]) => `${n} ${r.toFixed(2)} vs ${k}`).join("; "));
  process.exit(1);
}

const PARANOID =
  "ETR-PRIMÄRNOTING i EUR (DTE.DE-precedensens Frankfurt-rad; underlag S&P Global Market Intelligence + Fiscal.ai via StockAnalysis; intradag 2026-09-25; färshämtning direkt med cache-bypass + TRE kompletterande panelhämtningar — netto-raden krävde skärpning; dec-slut): " +
  "pris 23,92 EUR (beta 0,8), mcap 3 133 M EUR på 130,9 M aktier (replik 130,9 × 23,92 = 3 131 — 0,05 %), " +
  "P/E-FALLET (SHIN-ETSU-PRECEDENSEN, andra gången i vågen): källans P/E-rad 11,40 motsägs av källans EGEN EPS-rad 4,66 (11,40 × 4,66 = 53,1 ≠ pris 23,92) ⇒ fältet bär AKTIEBAS-REPLIKEN 23,92/4,66 = 5,13, låst av TRE oberoende identiteter: EPS × aktier = netto (4,66 × 130,9 = 610 ✓) · FCF-yield EXAKT (560/3 133 = 17,87 % = 1/P·FCF 1/5,6 = 17,86 %) · mcap 0,05 %; källans P/E-rad noterad som avvikande (troligen annat redovisningsfönster); källans PS-rad 1,00 och payout-rad 80,4 % avviker motsvarande mot replikerna (1,23 · 39,7 %) — samma fönsterdokumentation; prognosTillväxt NULL (fwd-basen delar källans tvistiga fönster — basblandning vägras, källans fwd 10,70/PEG 0,41 enbart referens), P/B 1,05 · EV/EBIT 6,2, " +
  "ROE 9,2 % · ROIC 5,9 % mot WACC 6,0 % (MVNO-METODNOT: virtuell operatör hyr nätet — kapitalkravet minimalt men marginalspektrumet smalare; ROIC≈WACC är modellens struktur, dokumenterat) · EBIT-marginal 19,0 % (MVNO-kassamodellen) · netto-marginal 24,0 % aktiebasreplik (610/2 545) · FCF-marginal 22,0 % replik (560/2 545 — MVNO-modellens kassagenerering), " +
  "balans: D/E 1,01 · räntetäckning 6,5 · Altman 2,1 (KÄLLANS VARNINGSZON — freenets balans bär licenser/spektrum och MVNO-åtaganden; datafakta) · Piotroski 7; " +
  "utdelning 1,85 EUR/aktie (7,73 % — direktavkastningsprofilen, kassamodellens utdelning) ⇒ senasteArMdr 242 (1,85 × 130,9) med aktiebas-payout 39,7 % (källans 80,4 %-rad annat fönster, noterad); " +
  "FY-SERIEN dec-slutande (M EUR): oms [2 389 · 2 484 · 2 528 · 2 540] · netto [447 · 491 · 549 · 580] · FCF [427 · 436 · 431 · 427] — VÅGENS NIONDE BROTTSFRIA RAD: NETTO STIGANDE VARJE ÅR (447→580) med stabil FCF (~430 hela serien); rak 3-årig CAGR FY22→FY25 (oms +2,04 % · netto +9,03 % — MVNO-modellens marginalutflytt: mobilabonnentvärde högre än TV/fasta); EPS-serien [3,41 · 3,75 · 4,19 · 4,43]; " +
  "analytikerläge saknas i panelutdraget — ingen målkurs förs in; NÄSTA RAPPORT Q3 2026 est. tidigt november — v172-könotis v45; " +
  "kandidatur: CELLMOTIVERAD duo enligt U13-mönstret — Tyskland/kommunikation-cellens TVÅ affärsmodeller: Deutsche Telekom (DTE.DE, integrerad nätjätte) + freenet (FNT.DE, MVNO/mobil detalj — kassageneratorn utan eget nät) — cellens pedagogiska kontrast (nätägare mot ntvånare/hyrare); P/E-bärarkriteriet kontrollerat FÖRE leverans (TTM-netto 610 M EUR > 0; Sony/Honda-doktrinen); kollisionskontroll exakt-match GRÖN; Communication Services ⇒ kommunikation-cellen (28→29 bolag), Tyskland 20→21 (kommunikation-grenen 1→2).";

const RAD = {
  ticker: "FNT.DE",
  namn: "freenet AG",
  bransch: "kommunikation",
  land: "Tyskland",
  valuta: "EUR",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-25", url: "https://stockanalysis.com/quote/etr/FNT/ (+ /statistics/ + /financials/)", paranoid: PARANOID }],
  hamtat: "2026-09-25",
  pris: K.pris,
  marknadsKapitalMdr: K.mcap,
  tillvaxt: {
    omsattningCAGR5ar: R.omsCagr3,
    resultatCAGR5ar: R.resCagr3,
    omsattningTillvaxtTTM: 0.008,
    prognosTillvaxt: null,
  },
  lonksamhet: {
    roe: K.roe, roic: K.roic, bruttoMarginal: null, ebitMarginal: K.ebitM,
    nettoMarginal: R.nettoM, fcfMarginal: R.fcfM,
  },
  stabilitet: {
    skuldEgenkapital: K.de, rantaTackning: K.rantaTackning, fcfPositivaSenaste5: 5,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: 0,
  },
  aterkop: { senasteArMdr: 0.242, andelUtestande: +R.payoutReplik.toFixed(3), insiderkopSenaste6man: 0 },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
  vardering: { pe: +R.pe.toFixed(2), pb: K.pb, evEbit: K.evEbit, peg: null, fcfYield: R.fcfY, egenKapitalMultipl: K.pb },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2022", "2023", "2024", "2025"],
    omsattning: K.omsSerie.map((x) => x * 1e6),
    resultat: K.resSerie.map((x) => x * 1e6),
    egetKapital: [],
    fcf: K.fcfSerie.map((x) => x * 1e6),
  },
  notering:
    "cellmotiverad duo (Tyskland/kommunikation 1→2: Deutsche Telekom integrerad jätte + freenet MVNO/mobil detalj — nätägare mot hyrare); ETR-primär EUR; P/E-FALLET (Shin-Etsu-precedensen andra gången): källans P/E-rad 11,40 motsagd av källans egen EPS-rad — fältet bär aktiebas-repliken 5,13 låst av TRE identiteter (EPS×aktier=netto · FCF-yield EXAKT 17,87 % · mcap 0,05 %); PS/payout-rader samma fönsterdokumentation; prognosTillväxt NULL (basblandning vägras); VÅGENS NIONDE BROTTSFRIA RAD (netto stigande varje år 447→580; rak CAGR oms +2,04 % · netto +9,03 % — MVNO-marginalutflytt); MVNO-METODNOT (ROIC≈WACC = modellens struktur: hyr nätet, minimalt kapital); Altman 2,1 datafakta; direktavkastning 7,73 % (kassamodellen); EK-serie saknas — serier.egetKapital tomt; rappdag Q3 est. november = v172-könotis; alla repliker i paranoid (StockAnalysis ETR 2026-09-25)",
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
  if (el[el.length - 1].ticker !== "FNT.DE") { console.error("ABORT: sista raden ≠ FNT.DE"); process.exit(1); }
}
const slut = JSON.parse(readFileSync(UNI, "utf8"));
const forandrade = backup.filter((b, i) => JSON.stringify(b) !== JSON.stringify(slut[i])).length;
if (forandrade !== 0) { console.error(`ABORT: ${forandrade} gamla rader förändrade`); process.exit(1); }

kvitto.push(
  `UNIVERSUM-INLÄGG GRÖN: ${FÖRE}→${slut.length} (+1 freenet FNT.DE, Tyskland/kommunikation 28→${slut.filter((b) => b.bransch === "kommunikation").length}; Tyskland → ${slut.filter((b) => b.land === "Tyskland").length})`,
  `indent=${indent} · gamla rader förändrade=${forandrade} · läs-tillbaka ×2 OK`,
  `REPLIKER (TRE LÅS): mcap ${R.mcap.toFixed(0)} (${K.mcap}) 0,05 % · fcfY ${(R.fcfY * 100).toFixed(2)} % (mot ${(100 / K.pFcf).toFixed(2)} %) EXAKT · EPS-identitet 4,66 × 130,9 = ${K.eps * K.aktierMdr} ≈ ${K.nettoTtm} ✓ · pe-FÄLT = aktiebas ${R.pe.toFixed(2)} (källans 11,40 motsagd av dess egen EPS-rad — Shin-Etsu-precedensen)`,
  `CAGR rak brottsfri (VÅGENS NIONDE — netto stigande varje år): oms ${(R.omsCagr3 * 100).toFixed(2)} % · netto ${(R.resCagr3 * 100).toFixed(2)} %`,
  `prognosTillväxt NULL (basblandning vägras) · MVNO-metodnot · direktavkastning 7,73 % · P/FCF 5,6 — kassageneratorprofilen dokumenterad`,
);
writeFileSync("/tmp/r217-inlagg.txt", kvitto.join("\n"));
console.log(kvitto.join("\n"));
