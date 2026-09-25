#!/usr/bin/env node
/**
 * _r213-u17-universum-inlagg.mjs — v173 dataset-djup rond 213 U17 (+1):
 * Daiichi Sankyo 4568.T (Japan/halso 1→2) — cellmotiverad duo: Takeda (global
 * diversifierad farmaka) + Daiichi Sankyo (onkologi/ADC — Enhertu-partnerskapet)
 * = cellens två modeller. ASTELLAS 4503.T SONDERADES FÖRST OCH AVVISADES på
 * P/E-bärarkriteriet (TTM-netto −47 mdr JPY ≤ 0 — Sony/Honda-doktrinen,
 * Vestas-före-Ørsted-logiken); Daiichi Sankyo GRÖN (TTM-netto +213 mdr JPY > 0).
 * Kollisionskontroll exakt-match GRÖN (båda). Mars-bokslut.
 * Källans fönsterblandningar (P/E-bas, PS, P/FCF) dokumenterade i paranoid.
 * Kvitto: /tmp/r213-inlagg.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const FÖRE = u.length;
if (u.some((b) => b.ticker === "4568.T" || /daiichi sankyo/i.test(b.namn ?? ""))) {
  console.error("ABORT: 4568.T finns redan på disken");
  process.exit(1);
}

const K = {
  pris: 5374.0, aktierMdr: 2836, mcap: 15240, pe: 61.9, fwdPe: 27.4,
  pb: 1.88, evEbit: 31.2, pFcf: 33.4, pegKalla: 0.25, psKalla: 2.20,
  roe: 0.031, roic: 0.026, wacc: 0.057, bruttoM: 0.72, ebitM: 0.040,
  nettoTtm: 213, revTtm: 6023, nettoM: 0.0355,
  fcfFy25: 456, fcfTtm: 396, de: 0.52, rantaTackning: 7.5, altman: 2.2, piotroski: 6, beta: 0.55,
  div: 60, payout: null,
  omsSerie: [3997, 4326, 5054, 5997],   // mdr JPY, mars-slut FY2022–FY2025
  resSerie: [87, 62, 166, 168],
  fcfSerie: [3, 135, 279, 456],
};
const R = {
  mcap: (K.aktierMdr * K.pris) / 1000,
  epsGaap: (K.nettoTtm * 1000) / K.aktierMdr,   // JPY
  peGaap: K.pris / ((K.nettoTtm * 1000) / K.aktierMdr),
  nettoM: K.nettoTtm / K.revTtm,
  psReplik: K.mcap / K.revTtm,
  fcfYFy25: K.fcfFy25 / K.mcap,
  fcfYTtm: K.fcfTtm / K.mcap,
  prognos: K.pe / K.fwdPe - 1,
  peg: K.pe / ((K.pe / K.fwdPe - 1) * 100),
  omsCagr3: Math.pow(K.omsSerie[3] / K.omsSerie[0], 1 / 3) - 1,
  resCagr3: Math.pow(K.resSerie[3] / K.resSerie[0], 1 / 3) - 1,
  payoutReplik: K.div / ((K.nettoTtm * 1000) / K.aktierMdr),
};
const avv = (a, b) => Math.abs(a / b - 1);
const exakt = [["mcap", R.mcap, K.mcap, 0.02], ["nettoM", R.nettoM, K.nettoM, 0.02]];
const fel = exakt.filter(([n, r, k, tol]) => avv(r, k) > tol);
if (fel.length) {
  console.error("ABORT: replik utanför tolerans: " + fel.map(([n, r, k]) => `${n} ${r.toFixed(4)} vs ${k}`).join("; "));
  process.exit(1);
}

const PARANOID =
  "TYO-PRIMÄRNOTING i JPY (4502.T/4063.T-precedensens Tokyo-rad; underlag S&P Global Market Intelligence + Fiscal.ai via StockAnalysis; intradag 2026-09-25 delayed +0,5 %; färshämtning direkt med cache-bypass + kompletterande FY-panel; MARS-BOKSLUT, etikett = slutår): " +
  "pris 5 374 JPY, mcap 15 240 mdr JPY på 2 836 M aktier (replik 2 836 × 5 374 = 15 240,7 — 0,00 % EXAKT), " +
  "P/E 61,9 ur källan på dess EPS-bas 86,8 JPY (GAAP-aktiebasrepliken 5 374/75,1 = 71,6 — källans bär justerad bas, dokumenterad; Shin-Etsu-klassens dokumentnoter) mot forward P/E 27,4 ⇒ prognosTillväxt +125,9 % (trailing/fwd-modellen, MUFG-konventionen — Enhertu-rampens VÄNDNINGSPROGNOS: konsensus väntar nettofyrdubbling; spår-PEG 61,9/125,9 = 0,49 mot källans PEG 0,25, samma riktning), P/B 1,88 · EV/EBIT 31,2 · PS källa 2,20 med aktiebasreplik 15 240/6 023 = 2,53 — källans PS bår annat fönster (dokumenterad avvikelse), " +
  "ROE 3,1 % · ROIC 2,6 % under WACC 5,7 % (INVESTERINGSFASEN — ADC-plattformens R&D-toppen äter avkastningen; dokumenterat som fas-not, inte strukturbrist) · brutto 72 % (farmaka-patentmarginal) · EBIT-marginal 4,0 % · netto-marginal 3,55 % EXAKT replik (213/6 023 = 3,536 %) — FARMATUNN mot cell-kollegan Takeda ~12-15 % (öppet redovisat: vändningen pågår), FCF-yield källans P/FCF 33,4 bygger på FY25-FCF 456 (replik 456/15 240 = 2,99 % ✓ EXAKT på den basen) medan TTM-FCF 396 ger 2,60 % — fönsterskillnaden dokumenterad, fältet bär källans FY25-bas; " +
  "balans: D/E 0,52 · räntetäckning 7,5 · Altman 2,2 (KÄLLANS VARNINGSZON — investeringsfasens balans; datafakta) · Piotroski 6; " +
  "utdelning 60 JPY/aktie (1,1 % — investeringsfasens låga direktavkastning) ⇒ senasteArMdr 170 (60 × 2 836) med payout-replik 8,1 % på GAAP-EPS (källans payout-rad saknades i utdraget — fältet andelUtestande bär repliken med not); " +
  "FY-SERIEN mars-slutande (mdr JPY): oms [3 997 · 4 326 · 5 054 · 5 997] · netto [87 · 62 · 166 · 168] · FCF [3 · 135 · 279 · 456] — STARK OMSÄTTNINGSTILLVÄXT (rak CAGR +14,47 % — Enhertu-rampen) med FY23-nettodipen 62 (patentförlusterna + R&D-toppen) dokumenterad och därefter återhämtning; samtliga positiva = brottsfri serie men med STRUKTURVAGAN dokumenterad: netto-CAGR +24,58 % från låg bas med vinsten efter omsättningen (ADC-kostnaderna); EPS-GAAP-serien [30,2 · 21,5 · 57,7 · 58,2]; " +
  "analytikerläge saknas i panelutdraget — ingen målkurs förs in; NÄSTA RAPPORT Q2 FY2026 est. tidigt november — v172-könotis v45; " +
  "KANDIDATURVÄGEN DOKUMENTERAD: Astellas 4503.T sonderades FÖRST och AVVISADES på P/E-bärarkriteriet (TTM-netto −47 mdr JPY ≤ 0 — patentklippur + nedskrivningar; Sony/Honda-doktrinen, Vestas-före-Ørsted-logiken; omprövning när TTM-vändning konfirmeras); Daiichi Sankyo VALDES GRÖN (TTM-netto +213 mdr > 0) — cellmotiverad duo enligt U13-mönstret: Takeda (global diversifierad) + Daiichi Sankyo (onkologi/ADC); kollisionskontroll exakt-match GRÖN (båda kandidater); Health Care ⇒ halso-cellen (27→28 bolag), Japan 23→24 (halso-grenen 1→2).";

const RAD = {
  ticker: "4568.T",
  namn: "Daiichi Sankyo Company, Limited",
  bransch: "halso",
  land: "Japan",
  valuta: "JPY",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-25", url: "https://stockanalysis.com/quote/tyo/4568/ (+ /statistics/ + /financials/)", paranoid: PARANOID }],
  hamtat: "2026-09-25",
  pris: K.pris,
  marknadsKapitalMdr: K.mcap,
  tillvaxt: {
    omsattningCAGR5ar: R.omsCagr3,
    resultatCAGR5ar: R.resCagr3,
    omsattningTillvaxtTTM: 0.193,
    prognosTillvaxt: R.prognos,
  },
  lonksamhet: {
    roe: K.roe, roic: K.roic, bruttoMarginal: K.bruttoM, ebitMarginal: K.ebitM,
    nettoMarginal: K.nettoM, fcfMarginal: K.fcfTtm / K.revTtm,
  },
  stabilitet: {
    skuldEgenkapital: K.de, rantaTackning: K.rantaTackning, fcfPositivaSenaste5: 5,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: 0,
  },
  aterkop: { senasteArMdr: 0.17, andelUtestande: +R.payoutReplik.toFixed(3), insiderkopSenaste6man: 0 },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
  vardering: { pe: K.pe, pb: K.pb, evEbit: K.evEbit, peg: R.peg, fcfYield: R.fcfYFy25, egenKapitalMultipl: K.pb },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2022", "2023", "2024", "2025"],
    omsattning: K.omsSerie.map((x) => x * 1e9),
    resultat: K.resSerie.map((x) => x * 1e9),
    egetKapital: [],
    fcf: K.fcfSerie.map((x) => x * 1e9),
  },
  notering:
    "cellmotiverad duo (Japan/halso 1→2: Takeda global diversifierad + Daiichi Sankyo onkologi/ADC); KANDIDATURVÄGEN: Astellas 4503.T AVVISAD först på P/E-bärarkriteriet (TTM-netto −47 mdr ≤ 0 — Sony/Honda-doktrinen; omprövning vid TTM-vändning), Daiichi Sankyo GRÖN (+213 mdr > 0); TYO-primär JPY; mars-bokslut; STARK rev-CAGR +14,5 % (Enhertu-rampen) med FY23-nettodip (patent+R&D) dokumenterad; netto-marginal 3,55 % FARMATUNN mot Takeda — öppet redovisat (vändningsfasen); ROIC<WACC som INVESTERINGSFAS-not (ej strukturbrist); prognosTillväxt +125,9 % = vändningsprognos (fwd 27,4 mot trailing 61,9; spår-PEG 0,49); källans fönsterblandningar dokumenterade (P/E-bas 86,8 mot GAAP 75,1 · PS 2,20 mot replik 2,53 · P/FCF på FY25-FCF); payout-rad saknades — fältet bär GAAP-replik 8,1 % med not; EK-serie saknas — serier.egetKapital tomt; rappdag Q2 FY2026 est. november = v172-könotis; alla repliker i paranoid (StockAnalysis TYO 2026-09-25)",
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
  if (el[el.length - 1].ticker !== "4568.T") { console.error("ABORT: sista raden ≠ 4568.T"); process.exit(1); }
}
const slut = JSON.parse(readFileSync(UNI, "utf8"));
const forandrade = backup.filter((b, i) => JSON.stringify(b) !== JSON.stringify(slut[i])).length;
if (forandrade !== 0) { console.error(`ABORT: ${forandrade} gamla rader förändrade`); process.exit(1); }

kvitto.push(
  `UNIVERSUM-INLÄGG GRÖN: ${FÖRE}→${slut.length} (+1 Daiichi Sankyo 4568.T, Japan/halso 27→${slut.filter((b) => b.bransch === "halso").length}; Japan → ${slut.filter((b) => b.land === "Japan").length})`,
  `indent=${indent} · gamla rader förändrade=${forandrade} · läs-tillbaka ×2 OK`,
  `REPLIKER: mcap ${R.mcap.toFixed(1)} (${K.mcap}) 0,00 % EXAKT · nettoM ${(R.nettoM * 100).toFixed(2)} % EXAKT · pe 61,9 källa (GAAP-replik 71,6 noterad) · PS 2,20 källa (replik 2,53 noterad) · fcfY FY25-bas ${(R.fcfYFy25 * 100).toFixed(2)} % (TTM 2,60 % noterad)`,
  `CAGR rak brottsfri: oms ${(R.omsCagr3 * 100).toFixed(2)} % (Enhertu-rampen) · netto +${(R.resCagr3 * 100).toFixed(2)} % (FY23-dip 62 dokumenterad; från låg bas)`,
  `prognosTillväxt +${(R.prognos * 100).toFixed(1)} % (VÄNDNINGSPROGNOS — fwd 27,4) · spår-PEG ${R.peg.toFixed(2)} · ROIC<WACC som investeringsfas-not · Astellas AVVISAD vägen dokumenterad`,
);
writeFileSync("/tmp/r213-inlagg.txt", kvitto.join("\n"));
console.log(kvitto.join("\n"));
