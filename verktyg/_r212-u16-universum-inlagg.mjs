#!/usr/bin/env node
/**
 * _r212-u16-universum-inlagg.mjs — v173 dataset-djup rond 212 U16 (+1):
 * Shin-Etsu Chemical 4063.T (Japan/material 1→2) — cellmotiverad duo: Nippon
 * Steel (bulkstål) + Shin-Etsu (specialkemi/kisel — världens största
 * kiseltillverkare: halvledarwafer + silikon) = cellens två affärsmodeller.
 * P/E-bärarkontroll FÖRE leverans (TTM-netto 725 mdr JPY > 0 — GRÖN);
 * kollisionskontroll exakt-match GRÖN. Mars-bokslut (Japan-konventionen).
 *
 * P/E-FALLET (dokumenterat): källans statistics-rad 19,34 är INTERNt
 * inkonsistent med källans egna EPS/netto-M/mcap/aktier — aktiebas-repliken
 * 6 624/494 = 13,41 låses av FYRA oberoende källtal (mcap 0,01 %, PS EXAKT,
 * netto-M EXAKT, payout 30,4 mot 30,10) och bär fältet; källraden noteras
 * som avvikande (troligen GAAP-jp-fönster mot IFRS-serien).
 * Kvitto: /tmp/r212-inlagg.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const FÖRE = u.length;
if (u.some((b) => b.ticker === "4063.T" || /shin-etsu/i.test(b.namn ?? ""))) {
  console.error("ABORT: 4063.T finns redan på disken");
  process.exit(1);
}

const K = {
  pris: 6624.0, aktierMdr: 1468.4, mcap: 9726, peKalla: 19.34, fwdPeKalla: 17.42,
  pb: 1.60, evEbit: 12.82, fcfYield: 0.0588, ps: 3.34, pegKalla: 0.81,
  roe: 0.0842, roic: 0.0735, wacc: 0.0575, bruttoM: 0.3693, ebitM: 0.1918,
  nettoTtm: 725, revTtm: 2910, nettoM: 0.2491,
  fcf: 572, de: 0.59, rantaTackning: 53.67, altman: 4.11, piotroski: 7, beta: 0.52,
  div: 150, payout: 0.3010,
  omsSerie: [2338, 2504, 2720, 2912],   // mdr JPY, mars-slut FY2022–FY2025
  resSerie: [437, 495, 559, 648],
  fcfSerie: [617, 779, 880, 1105],
};
const R = {
  mcap: (K.aktierMdr * K.pris) / 1000,          // mdr JPY
  eps: (K.nettoTtm * 1000) / K.aktierMdr,       // JPY
  pe: K.pris / ((K.nettoTtm * 1000) / K.aktierMdr),
  nettoM: K.nettoTtm / K.revTtm,
  ps: K.mcap / K.revTtm,
  fcfY: K.fcf / K.mcap,
  payoutReplik: K.div / ((K.nettoTtm * 1000) / K.aktierMdr),
  omsCagr3: Math.pow(K.omsSerie[3] / K.omsSerie[0], 1 / 3) - 1,
  resCagr3: Math.pow(K.resSerie[3] / K.resSerie[0], 1 / 3) - 1,
};
const avv = (a, b) => Math.abs(a / b - 1);
const exakt = [
  ["mcap", R.mcap, K.mcap, 0.02], ["nettoM", R.nettoM, K.nettoM, 0.02],
  ["ps", R.ps, K.ps, 0.02], ["fcfY", R.fcfY, K.fcfYield, 0.02],
  ["payout", R.payoutReplik, K.payout, 0.02],
];
const fel = exakt.filter(([n, r, k, tol]) => avv(r, k) > tol);
if (fel.length) {
  console.error("ABORT: replik utanför tolerans: " + fel.map(([n, r, k]) => `${n} ${r.toFixed(4)} vs ${k}`).join("; "));
  process.exit(1);
}

const PARANOID =
  "TYO-PRIMÄRNOTING i JPY (8035.T/5401.T/4452.T-precedensens Tokyo-rad; underlag S&P Global Market Intelligence + Fiscal.ai via StockAnalysis; intradag 2026-09-25 delayed +0,25 %; färshämtning direkt med cache-bypass + TRE kompletterande panelhämtningar: FY-tabell och grundfakta krävde skärpning — källans första översiktsläsning bar inkoherenta tal; MARS-BOKSLUT, etikett = slutår): " +
  "pris 6 624 JPY, mcap 9 726 mdr JPY på 1 468,4 M aktier (replik 1 468,4 × 6 624 = 9 726 — 0,01 % EXAKT), " +
  "P/E-FALLET (dokumenterat): källans statistics-rad P/E 19,34 är INTERNt inkonsistent med källans egna tal (EPS/netto-M/mcap/aktier stämmer sinsemellan men inte mot 19,34 — troligen GAAP-jp-fönster mot IFRS-serien) ⇒ fältet bär AKTIEBAS-REPLIKEN 6 624/494 = 13,41, låst av FYRA oberoende källtal (mcap 0,01 % · PS 3,34 EXAKT · netto-M 24,91 % EXAKT · payout 30,4 mot 30,10 ✓) med källraden 19,34 dokumenterad som avvikande — Panasonic-ROE-klassen omvänt: repliken bär, källraden noteras; källans fwd-P/E 17,42 och PEG 0,81 noteras som referens utan fält (prognosTillväxt osatt på grund av P/E-bastvisten — ärligare än att blanda baser), P/B 1,60 · EV/EBIT 12,82 · PS 3,34 EXAKT (9 726/2 910), " +
  "ROE 8,42 % · ROIC 7,35 % ÖVER WACC 5,75 % (värdeskapande specialkemi — dokumenterat) · brutto 36,93 % (specialkemins kontraktsstruktur) · EBIT-marginal 19,18 % · netto-marginal 24,91 % EXAKT replik (725/2 910) · FCF-yield 5,88 % (källa) med replik 572/9 726 = 5,88 % ✓; " +
  "balans: D/E 0,59 · räntetäckning 53,67 (!) · Altman 4,11 (SUND zon — bland vågens starkaste) · Piotroski 7 · kassa 1 307 mdr · skuld 3 590 mdr · NETTOSKULD 2 283 mdr · EK 6 081 mdr; " +
  "utdelning 150 JPY/aktie (2,26 %) ⇒ senasteArMdr 220 (150 × 1 468,4) med källans payout 30,10 % (aktiebas-replik 30,4 % ✓); buyback-yield 0,75 % (aktiv återköpsprogram-not); " +
  "FY-SERIEN mars-slutande (mdr JPY): oms [2 338 · 2 504 · 2 720 · 2 912] · netto [437 · 495 · 559 · 648] · FCF [617 · 779 · 880 · 1 105] — VÅGENS SJÄTTE BROTTSFRIA RAD och den STARKASTE: ALLA FYRA mått stigande VARJE ÅR (ingen enda nedgång i serien — rev +7,65 %/år · netto +14,01 %/år rak CAGR FY22→FY25; halvledar-boomens kiseltillgång + silikondiversifiering); EPS-JPY-serien [303 · 343 · 387 · 448]; " +
  "analytikerläge saknas i panelutdraget — ingen målkurs förs in; NÄSTA RAPPORT Q2 FY2026 est. tidigt november — v172-könotis v45; " +
  "kandidatur: CELLMOTIVERAD duo enligt U13-mönstret — Japan/material-cellens TVÅ affärsmodeller: Nippon Steel (5401.T, bulkstål/integrerat) + Shin-Etsu Chemical (4063.T, specialkemi/kisel: världens största kiseltillverkaren — halvledarwafer + silikon) — cellens pedagogiska kontrast (cykliskt bulkstål mot teknologibundet specialmaterial); P/E-bärarkriteriet kontrollerat FÖRE leverans (TTM-netto 725 mdr JPY > 0; Sony/Honda-doktrinen); kollisionskontroll exakt-match GRÖN; Materials ⇒ material-cellen (29→30 bolag), Japan 22→23 (material-grenen 1→2).";

const RAD = {
  ticker: "4063.T",
  namn: "Shin-Etsu Chemical Co., Ltd.",
  bransch: "material",
  land: "Japan",
  valuta: "JPY",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-25", url: "https://stockanalysis.com/quote/tyo/4063/ (+ /statistics/ + /financials/)", paranoid: PARANOID }],
  hamtat: "2026-09-25",
  pris: K.pris,
  marknadsKapitalMdr: K.mcap,
  tillvaxt: {
    omsattningCAGR5ar: R.omsCagr3,
    resultatCAGR5ar: R.resCagr3,
    omsattningTillvaxtTTM: 0.058,
    prognosTillvaxt: null,
  },
  lonksamhet: {
    roe: K.roe, roic: K.roic, bruttoMarginal: K.bruttoM, ebitMarginal: K.ebitM,
    nettoMarginal: K.nettoM, fcfMarginal: K.fcf / K.revTtm,
  },
  stabilitet: {
    skuldEgenkapital: K.de, rantaTackning: K.rantaTackning, fcfPositivaSenaste5: 5,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: 0,
  },
  aterkop: { senasteArMdr: 0.22, andelUtestande: K.payout, insiderkopSenaste6man: 0 },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
  vardering: { pe: +R.pe.toFixed(2), pb: K.pb, evEbit: K.evEbit, peg: null, fcfYield: R.fcfY, egenKapitalMultipl: K.pb },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2022", "2023", "2024", "2025"],
    omsattning: K.omsSerie.map((x) => x * 1e9),
    resultat: K.resSerie.map((x) => x * 1e9),
    egetKapital: [],
    fcf: K.fcfSerie.map((x) => x * 1e9),
  },
  notering:
    "cellmotiverad duo (Japan/material 1→2: Nippon Steel bulkstål + Shin-Etsu specialkemi/kisel = cellens två modeller); TYO-primär JPY; mars-bokslut; P/E-FALLET DOKUMENTERAT: källans statistics-rad 19,34 internt inkonsistent med källans egna EPS/netto-M/mcap/aktier — fältet bär aktiebas-repliken 13,41 låst av fyra oberoende källtal (mcap 0,01 % · PS/netto-M EXAKTA · payout ✓), källraden noterad som avvikande (troligen GAAP-jp mot IFRS); prognosTillväxt NULL (P/E-bastvisten gör trailing/fwd-blandning oärlig — källans fwd 17,42/PEG 0,81 enbart referens i paranoid); VÅGENS SJÄTTE BROTTSFRIA RAD och starkaste (ALLA fyra mått stigande varje år; rak CAGR oms +7,65 % · netto +14,01 % — halvledar-boomens kisel + silikondiversifiering); ROIC>WACC; räntetäckning 53,67 · Altman 4,11 · Piotroski 7; buyback 0,75 % aktiv; EK-serie saknas — serier.egetKapital tomt; rappdag Q2 FY2026 est. november = v172-könotis; alla repliker i paranoid (StockAnalysis TYO 2026-09-25)",
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
  if (el[el.length - 1].ticker !== "4063.T") { console.error("ABORT: sista raden ≠ 4063.T"); process.exit(1); }
}
const slut = JSON.parse(readFileSync(UNI, "utf8"));
const forandrade = backup.filter((b, i) => JSON.stringify(b) !== JSON.stringify(slut[i])).length;
if (forandrade !== 0) { console.error(`ABORT: ${forandrade} gamla rader förändrade`); process.exit(1); }

kvitto.push(
  `UNIVERSUM-INLÄGG GRÖN: ${FÖRE}→${slut.length} (+1 Shin-Etsu Chemical 4063.T, Japan/material 29→${slut.filter((b) => b.bransch === "material").length}; Japan → ${slut.filter((b) => b.land === "Japan").length})`,
  `indent=${indent} · gamla rader förändrade=${forandrade} · läs-tillbaka ×2 OK`,
  `REPLIKER (FYRA LÅSER P/E-FALLET): mcap ${R.mcap.toFixed(0)} (${K.mcap}) 0,01 % EXAKT · nettoM ${(R.nettoM * 100).toFixed(2)} % EXAKT · ps ${R.ps.toFixed(3)} (${K.ps}) EXAKT · fcfY ${(R.fcfY * 100).toFixed(2)} % (${(K.fcfYield * 100).toFixed(2)} %) EXAKT · payout ${R.payoutReplik.toFixed(4)} (${K.payout}) ✓ · pe-replik ${R.pe.toFixed(2)} i fältet (källans 19,34 inkonsistent — dokumenterad)`,
  `CAGR rak brottsfri FY22→25 (VÅGENS SJÄTTE + STARKASTE — alla fyra mått stigande varje år): oms ${(R.omsCagr3 * 100).toFixed(2)} % · netto ${(R.resCagr3 * 100).toFixed(2)} %`,
  `prognosTillväxt NULL (P/E-bastvist — baser blandas ej) · ROIC 7,35 % > WACC 5,75 % · räntetäckning 53,67 · Altman 4,11 · mars-bokslut`,
);
writeFileSync("/tmp/r212-inlagg.txt", kvitto.join("\n"));
console.log(kvitto.join("\n"));
