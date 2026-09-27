#!/usr/bin/env node
/**
 * _r210-u14-universum-inlagg.mjs — v173 dataset-djup rond 210 U14 (+1):
 * Siemens Healthineers SHL.DE (Tyskland/halso 1→2) — cellmotiverad duo enligt
 * U13-mönstret: Fresenius (vårdoperatör) + Healthineers (medtech) = cellens två
 * affärsmodeller. P/E-bärarkontroll FÖRE leverans (TTM-netto 2 472 M EUR > 0 —
 * GRÖN); kollisionskontroll exakt-match GRÖN. SEP-bokslut (etikett = slutår).
 * Kvitto: /tmp/r210-inlagg.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const FÖRE = u.length;
if (u.some((b) => b.ticker === "SHL.DE" || /healthineers/i.test(b.namn ?? ""))) {
  console.error("ABORT: SHL.DE finns redan på disken");
  process.exit(1);
}

const K = {
  pris: 54.36, aktierMdr: 1102, mcap: 59.84, eps: 2.25, pe: 24.19, fwdPe: 19.50,
  pb: 2.68, evEbit: 15.78, pFcf: 20.25, pegKalla: 2.98, ps: 2.55,
  roe: 0.1126, roic: 0.0824, wacc: 0.0718, bruttoM: 0.4205, ebitM: 0.1613,
  nettoTtm: 2472, revTtm: 23440, nettoM: 0.1055,
  fcf: 2956, de: 0.62, rantaTackning: 9.61, altman: 2.86, piotroski: 7, beta: 0.91,
  div: 1.20, payout: 0.5324,
  omsSerie: [21691, 21678, 22372, 23393],   // M EUR, sep-slut FY2022–FY2025
  resSerie: [1730, 1912, 2075, 2417],
  fcfSerie: [2561, 2733, 2686, 2962],
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
  "ETR-PRIMÄRNOTING i EUR (SAP.DE/MUV2.DE-precedensens Frankfurt-rad; underlag S&P Global Market Intelligence + Fiscal.ai via StockAnalysis; intradag 2026-09-25 delayed +0,18 %; färshämtning direkt med cache-bypass + kompletterande FY-panelhämtning för exakt tabelläsning; SEPTEMBER-BOKSLUT — etikett = slutår, sällsynt konvention dokumenterad): " +
  "pris 54,36 EUR (52v 42,02–58,60 · beta 0,91), mcap 59,84 mdr EUR på 1 102 M aktier (replik 1 102 × 54,36 = 59,91 — 0,12 %), " +
  "P/E 24,19 replikerbar (54,36/2,25 = 24,16 = 0,1 %) mot forward P/E 19,50 ⇒ prognosTillväxt +24,05 % (trailing/fwd-modellen, MUFG-konventionen — medtech-växlingens bild-diagnostik-expansion; spår-PEG 24,19/24,05 = 1,01 mot källans PEG 2,98 på 3-års, kalibreringsnot), P/B 2,68 · EV/EBIT 15,78 · PS 2,55 EXAKT (59 840/23 440 = 2,553), " +
  "ROE 11,26 % · ROIC 8,24 % ÖVER WACC 7,18 % (värdeskapande medtech — dokumenterat) · brutto 42,05 % (medtech-kontraktens tjänstecomponent) · EBIT-marginal 16,13 % · netto-marginal 10,55 % EXAKT (2 472/23 440 = 10,546 %) · FCF-yield EXAKT (2 956/59 840 = 4,94 % = 1/P·FCF 1/20,25 = 4,94 %); " +
  "balans: D/E 0,62 · räntetäckning 9,61 · Altman 2,86 (KÄLLANS GRÄNSZON — medtech-nduvvet med FDA-godkännandekapital; datafakta) · Piotroski 7 · kassa 2,00 mdr · skuld 3,47 mdr · NETTOSKULD 1,47 mdr · EK 22,3 mdr; " +
  "utdelning 1,20 EUR/aktie (2,21 %) ⇒ senasteArMdr 1,322 (1,20 × 1 102) med payout 53,24 % (replik 1,20/2,25 = 53,3 % ✓ 0,1 %); " +
  "FY-SERIEN september-slutande (M EUR, etikett = slutår): oms [21 691 · 21 678 · 22 372 · 23 393] · netto [1 730 · 1 912 · 2 075 · 2 417] · FCF [2 561 · 2 733 · 2 686 · 2 962] — VÅGENS FEMTE BROTTSFRIA RAD (efter TELUS/CNR/Redeia/Munich Re): samtliga positiva med STADIGT STIGANDE netto (1 730→2 417); rak 3-årig CAGR FY22→FY25 (oms +2,54 % · netto +11,77 % — vinsttillväxten bär marginalexpansion, ej volym); EPS-serien [1,57 · 1,73 · 1,88 · 2,19]; " +
  "analytikerläge saknas i panelutdraget — ingen målkurs förs in; NÄSTA RAPPORT Q4 FY2025 est. november 2026 (sep-årets slutrapport) — v172-könotis v45; " +
  "kandidatur: CELLMOTIVERAD duo enligt U13-mönstret — Tyskland/halso-cellens TVÅ affärsmodeller: Fresenius (FRE.DE, vårdoperatör/Klinikbetrieb) + Siemens Healthineers (SHL.DE, medtech/bild-diagnostik) — cellens pedagogiska kontrast (tjänsteindustri mot produkttillverkare); P/E-bärarkriteriet kontrollerat FÖRE leverans (TTM-netto 2 472 M EUR > 0; Sony/Honda-doktrinen); kollisionskontroll exakt-match GRÖN; Health Care ⇒ halso-cellen (26→27 bolag), Tyskland 17→18 (halso-grenen 1→2).";

const RAD = {
  ticker: "SHL.DE",
  namn: "Siemens Healthineers AG",
  bransch: "halso",
  land: "Tyskland",
  valuta: "EUR",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-25", url: "https://stockanalysis.com/quote/etr/SHL/ (+ /statistics/ + /financials/)", paranoid: PARANOID }],
  hamtat: "2026-09-25",
  pris: K.pris,
  marknadsKapitalMdr: K.mcap,
  tillvaxt: {
    omsattningCAGR5ar: R.omsCagr3,
    resultatCAGR5ar: R.resCagr3,
    omsattningTillvaxtTTM: 0.055,
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
  aterkop: { senasteArMdr: 1.322, andelUtestande: K.payout, insiderkopSenaste6man: 0 },
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
    "cellmotiverad duo enligt U13-mönstret (Tyskland/halso 1→2: Fresenius vårdoperatör + Healthineers medtech = cellens två affärsmodeller); ETR-primär EUR; SEPTEMBER-BOKSLUT (etikett = slutår — sällsynt konvention dokumenterad); VÅGENS FEMTE BROTTSFRIA RAD (samtliga positiva, stadigt stigande netto 1 730→2 417; rak CAGR oms +2,54 % · netto +11,77 % — marginalexpansion, ej volym); ROIC 8,24 % ÖVER WACC 7,18 % (värdeskapande medtech); Altman 2,86 gränszon (medtech-nduvvet) som datafakta; payout 53,24 % (replik 0,1 %); EK-serie saknas — serier.egetKapital tomt; rappdag Q4 FY2025 est. november = v172-könotis; alla repliker i paranoid (StockAnalysis ETR 2026-09-25)",
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
  if (el[el.length - 1].ticker !== "SHL.DE") { console.error("ABORT: sista raden ≠ SHL.DE"); process.exit(1); }
}
const slut = JSON.parse(readFileSync(UNI, "utf8"));
const forandrade = backup.filter((b, i) => JSON.stringify(b) !== JSON.stringify(slut[i])).length;
if (forandrade !== 0) { console.error(`ABORT: ${forandrade} gamla rader förändrade`); process.exit(1); }

kvitto.push(
  `UNIVERSUM-INLÄGG GRÖN: ${FÖRE}→${slut.length} (+1 Siemens Healthineers SHL.DE, Tyskland/halso 26→${slut.filter((b) => b.bransch === "halso").length}; Tyskland → ${slut.filter((b) => b.land === "Tyskland").length})`,
  `indent=${indent} · gamla rader förändrade=${forandrade} · läs-tillbaka ×2 OK`,
  `REPLIKER: mcap ${R.mcap.toFixed(2)} 0,12 % · pe ${R.pe.toFixed(2)} (${K.pe}) 0,1 % · nettoM ${(R.nettoM * 100).toFixed(2)} % EXAKT · ps ${R.ps.toFixed(3)} (${K.ps}) EXAKT · fcfY ${(R.fcfY * 100).toFixed(2)} % (mot ${(100 / K.pFcf).toFixed(2)} %) EXAKT · payout ${R.payoutReplik.toFixed(4)} (${K.payout}) 0,1 %`,
  `CAGR rak brottsfri FY22→25 (VÅGENS FEMTE): oms ${(R.omsCagr3 * 100).toFixed(2)} % · netto ${(R.resCagr3 * 100).toFixed(2)} % — stadigt stigande netto, marginalexpansion`,
  `prognosTillväxt +${(R.prognos * 100).toFixed(2)} % · spår-PEG ${R.peg.toFixed(2)} (källans 2,98 kalibreringsnot) · ROIC 8,24 % > WACC 7,18 % · sep-bokslut dokumenterat`,
);
writeFileSync("/tmp/r210-inlagg.txt", kvitto.join("\n"));
console.log(kvitto.join("\n"));
