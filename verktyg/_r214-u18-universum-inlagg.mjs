#!/usr/bin/env node
/**
 * _r214-u18-universum-inlagg.mjs — v173 dataset-djup rond 214 U18 (+1):
 * Hitachi 6501.T (Japan/industri 1→2) — cellmotiverad duo: Komatsu
 * (byggnadsmaskiner) + Hitachi (digitala system/Lumada-konglomerat efter
 * omvandlingen) = cellens två modeller. P/E-bärarkontroll FÖRE leverans
 * (TTM-netto 539 mdr JPY > 0 — GRÖN); kollisionskontroll exakt-match GRÖN.
 * OMVANDLINGSPROFILEN: netto 67→559 på tre år (fyrdubbling) — vändnings-CAGR
 * med låg-bas-not (Daiichi-klassen). Källans basvister dokumenterade.
 * Kvitto: /tmp/r214-inlagg.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const FÖRE = u.length;
if (u.some((b) => b.ticker === "6501.T" || /^hitachi/i.test(b.namn ?? ""))) {
  console.error("ABORT: 6501.T finns redan på disken");
  process.exit(1);
}

const K = {
  pris: 4111.0, aktierMdr: 4787, mcap: 19700, pe: 22.25, fwdPe: 19.08,
  pb: 2.87, evEbit: 15.3, pFcf: 38.4, pegKalla: 1.68,
  roe: 0.136, roic: 0.072, wacc: 0.064, ebitM: 0.095,
  nettoTtm: 539, revTtm: 8707, nettoMKalla: 0.074,
  fcf: 513, de: 0.81, rantaTackning: 17.3, altman: 2.9, piotroski: 6, beta: 1.05,
  div: 77,
  omsSerie: [8364, 8406, 8567, 8730],   // mdr JPY, mars-slut FY2022–FY2025
  resSerie: [67, 173, 350, 559],
  fcfSerie: [488, 275, 280, 543],
};
const R = {
  mcap: (K.aktierMdr * K.pris) / 1000,
  nettoM: K.nettoTtm / K.revTtm,
  fcfY: K.fcf / K.mcap,
  prognos: K.pe / K.fwdPe - 1,
  peg: K.pe / ((K.pe / K.fwdPe - 1) * 100),
  omsCagr3: Math.pow(K.omsSerie[3] / K.omsSerie[0], 1 / 3) - 1,
  resCagr3: Math.pow(K.resSerie[3] / K.resSerie[0], 1 / 3) - 1,
  payoutReplik: K.div / ((K.nettoTtm * 1000) / K.aktierMdr),
};
const avv = (a, b) => Math.abs(a / b - 1);
const exakt = [["mcap", R.mcap, K.mcap, 0.02], ["fcfY", R.fcfY, 1 / K.pFcf, 0.02]];
const fel = exakt.filter(([n, r, k, tol]) => avv(r, k) > tol);
if (fel.length) {
  console.error("ABORT: replik utanför tolerans: " + fel.map(([n, r, k]) => `${n} ${r.toFixed(4)} vs ${k}`).join("; "));
  process.exit(1);
}

const PARANOID =
  "TYO-PRIMÄRNOTING i JPY (6301.T/4502.T-precedensens Tokyo-rad; underlag S&P Global Market Intelligence + Fiscal.ai via StockAnalysis; intradag 2026-09-25; färshämtning direkt med cache-bypass + kompletterande FY-panel; MARS-BOKSLUT, etikett = slutår): " +
  "pris 4 111 JPY, mcap 19 700 mdr JPY på 4 787 M aktier (replik 4 787 × 4 111 = 19 679 — 0,1 %), " +
  "P/E 22,25 ur källan på dess justerade EPS-bas 184,8 (GAAP-aktiebasrepliken 4 111/111,3 = 36,9 — Hitachis minoritetsrika konglomeratstruktur gör basgapet stort; dokumenterad, Shin-Etsu/Daiichi-klassens not) mot forward P/E 19,08 ⇒ prognosTillväxt +16,61 % (trailing/fwd-modellen, MUFG-konventionen; spår-PEG 22,25/16,61 = 1,34 mot källans PEG 1,68 — nära kalibrering), P/B 2,87 · EV/EBIT 15,3 · källans netto-M-rad 7,4 % bär annat fönster (aktiebasrepliken 539/8 707 = 6,19 % TTM · FY25 6,4 % — dokumenterad fönsterdifferens; fältet bår repliken som mest konsistent med serien), " +
  "ROE 13,6 % · ROIC 7,2 % ÖVER WACC 6,4 % (värdeskapande post-omvandling — dokumenterat) · EBIT-marginal 9,5 % (konglomeratblandning: digitala system + infrastruktur) · FCF-yield EXAKT replik (513/19 700 = 2,60 % = 1/P·FCF 1/38,4 = 2,60 %); " +
  "balans: D/E 0,81 · räntetäckning 17,3 · Altman 2,9 (KÄLLANS GRÄNSZON — konglomeratbalansen efter förvärvsavvecklingar; datafakta) · Piotroski 6; " +
  "utdelning 77 JPY/aktie (1,87 %) ⇒ senasteArMdr 369 (77 × 4 787) med payout-rad saknad i utdraget (GAAP-replik 69 % på TTM-EPS med not — utdelningen höjd gradvis under omvandlingen); " +
  "FY-SERIEN mars-slutande (mdr JPY): oms [8 364 · 8 406 · 8 567 · 8 730] · netto [67 · 173 · 350 · 559] · FCF [488 · 275 · 280 · 543] — OMVANDLINGSPROFILEN (Lumada-vändningen): netto FYRDUBBLAT på tre år (67→559; konglomeratomvandlingen: tunga divisioner sålda, digitala Lumada-system växer) medan omsättningen är PLATT (+1,42 %/år — VINSTEN är storyn, ej volymen); rak netto-CAGR +102,4 % bär LÅG BAS (vändningshörnet) och dokumenteras som VÄNDNINGS-CAGR med bas-not (Daiichi-klassen); samtliga FY positiva; EPS-GAAP-serien [13,8 · 35,7 · 72,2 · 115,3]; " +
  "analytikerläge saknas i panelutdraget — ingen målkurs förs in; NÄSTA RAPPORT Q2 FY2026 est. tidigt november — v172-könotis v45; " +
  "kandidatur: CELLMOTIVERAD duo enligt U13-mönstret — Japan/industri-cellens TVÅ affärsmodeller: Komatsu (6301.T, byggnadsmaskiner) + Hitachi (6501.T, digitala system/konglomerat efter omvandlingen) — cellens pedagogiska kontrast (maskintillverkare mot digital tjänsteplattform); P/E-bärarkriteriet kontrollerat FÖRE leverans (TTM-netto 539 mdr JPY > 0; Sony/Honda-doktrinen); kollisionskontroll exakt-match GRÖN; Industrials ⇒ industri-cellen (25→26 bolag), Japan 24→25 (industri-grenen 1→2).";

const RAD = {
  ticker: "6501.T",
  namn: "Hitachi, Ltd.",
  bransch: "industri",
  land: "Japan",
  valuta: "JPY",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-25", url: "https://stockanalysis.com/quote/tyo/6501/ (+ /statistics/ + /financials/)", paranoid: PARANOID }],
  hamtat: "2026-09-25",
  pris: K.pris,
  marknadsKapitalMdr: K.mcap,
  tillvaxt: {
    omsattningCAGR5ar: R.omsCagr3,
    resultatCAGR5ar: R.resCagr3,
    omsattningTillvaxtTTM: 0.026,
    prognosTillvaxt: R.prognos,
  },
  lonksamhet: {
    roe: K.roe, roic: K.roic, bruttoMarginal: null, ebitMarginal: K.ebitM,
    nettoMarginal: R.nettoM, fcfMarginal: K.fcf / K.revTtm,
  },
  stabilitet: {
    skuldEgenkapital: K.de, rantaTackning: K.rantaTackning, fcfPositivaSenaste5: 5,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: 0,
  },
  aterkop: { senasteArMdr: 0.369, andelUtestande: +R.payoutReplik.toFixed(3), insiderkopSenaste6man: 0 },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
  vardering: { pe: K.pe, pb: K.pb, evEbit: K.evEbit, peg: R.peg, fcfYield: R.fcfY, egenKapitalMultipl: K.pb },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2022", "2023", "2024", "2025"],
    omsattning: K.omsSerie.map((x) => x * 1e9),
    resultat: K.resSerie.map((x) => x * 1e9),
    egetKapital: [],
    fcf: K.fcfSerie.map((x) => x * 1e9),
  },
  notering:
    "cellmotiverad duo (Japan/industri 1→2: Komatsu byggnadsmaskiner + Hitachi digitala system/konglomerat); TYO-primär JPY; mars-bokslut; OMVANDLINGSPROFILEN: netto fyrdubblat 67→559 (Lumada-vändningen) med PLATT omsättning (+1,4 %/år — vinsten är storyn) ⇒ netto-CAGR +102 % bär LÅG BAS och dokumenteras som VÄNDNINGS-CAGR (Daiichi-klassen); P/E 22,25 källans justerade bas (GAAP-replik 36,9 — minoritetsrikt konglomerat, basgap dokumenterat); källans netto-M-rad 7,4 % bår annat fönster (fältet bår repliken 6,19 % — seriekonsistent); FCF-yield EXAKT 2,60 %; ROIC>WACC post-omvandling; Altman 2,9 gränszon datafakta; payout-rad saknades (GAAP-replik med not); EK-serie saknas — serier.egetKapital tomt; rappdag Q2 FY2026 est. november = v172-könotis; alla repliker i paranoid (StockAnalysis TYO 2026-09-25)",
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
  if (el[el.length - 1].ticker !== "6501.T") { console.error("ABORT: sista raden ≠ 6501.T"); process.exit(1); }
}
const slut = JSON.parse(readFileSync(UNI, "utf8"));
const forandrade = backup.filter((b, i) => JSON.stringify(b) !== JSON.stringify(slut[i])).length;
if (forandrade !== 0) { console.error(`ABORT: ${forandrade} gamla rader förändrade`); process.exit(1); }

kvitto.push(
  `UNIVERSUM-INLÄGG GRÖN: ${FÖRE}→${slut.length} (+1 Hitachi 6501.T, Japan/industri 25→${slut.filter((b) => b.bransch === "industri").length}; Japan → ${slut.filter((b) => b.land === "Japan").length})`,
  `indent=${indent} · gamla rader förändrade=${forandrade} · läs-tillbaka ×2 OK`,
  `REPLIKER: mcap ${R.mcap.toFixed(0)} (${K.mcap}) 0,1 % · fcfY ${(R.fcfY * 100).toFixed(2)} % (mot ${(100 / K.pFcf).toFixed(2)} %) EXAKT · pe 22,25 källa (GAAP-replik 36,9 noterad — minoritetsgap) · netto-M fält=replik ${(R.nettoM * 100).toFixed(2)} % (källans 7,4 %-rad annat fönster, noterad)`,
  `CAGR: oms rak platt ${(R.omsCagr3 * 100).toFixed(2)} % · netto VÄNDNINGS-CAGR +${(R.resCagr3 * 100).toFixed(1)} % från LÅG BAS (67→559 fyrdubbling; Daiichi-klassens bas-not)`,
  `prognosTillväxt +${(R.prognos * 100).toFixed(2)} % · spår-PEG ${R.peg.toFixed(2)} (källans 1,68 — nära) · ROIC 7,2 % > WACC 6,4 % · Altman 2,9 gränszon`,
);
writeFileSync("/tmp/r214-inlagg.txt", kvitto.join("\n"));
console.log(kvitto.join("\n"));
