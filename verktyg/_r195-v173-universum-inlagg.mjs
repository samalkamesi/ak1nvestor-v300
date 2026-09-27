#!/usr/bin/env node
/**
 * _r195-v173-universum-inlagg.mjs — v173 dataset-djup rond 195 (+1 bolag):
 * Oriental Land 4661.T (Japan/konsument) — kandidatur dokumenterad i
 * S2-U3-JAPAN-KONSUMENT-KOMPLEMENT-OMG20.md ("P/E-bärande alternativ, avsändat");
 * färsk rådata StockAnalysis TYO 2026-09-25 (översikt+statistics+financials,
 * cache-bypass efter avvisad Jan-2025-kopia).
 *
 * Kontrakt (V209-u2-mall): vägrar duplikat · repliker beräknas och VALIDERAS
 * mot källvärdena (avvikelse > 2 % ⇒ ABORT) · kirurgisk append med filens eget
 * indent · läs-tillbaka ×2 · 0 gamla rader förändrade (per-index bitidentitet).
 * Kvitto: /tmp/r195-inlagg.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const FÖRE = u.length;
if (u.some((b) => b.ticker === "4661.T")) {
  console.error("ABORT: 4661.T finns redan på disken");
  process.exit(1);
}

// ── Källvärden (StockAnalysis TYO 4661, 2026-09-25 09:25 JST) + repliker ───────
const K = {
  pris: 2967.5, aktierMdr: 1.64, mcap: 4850, eps: 82.76, pe: 35.72, fwdPe: 36.38,
  bvps: 687.96, pb: 4.30, ps: 6.72, ebitTtm: 177.36, ebitM: 0.2458,
  nettoTtm: 135.70, revTtm: 721.52, nettoM: 0.1881, fcf: 104.26, fcfY: 0.0215,
  ekMdr: 1127, de: 0.29, skuld: 326.30, roic: 0.1476, roce: 0.1221,
  bruttoM: 0.3918, fcfM: 0.1480, div: 16.0, omsTtm: 0.039,
  omsSerie: [275728, 483123, 618493, 679374, 704539],   // mdr JPY, mars-slut FY2022–FY2026
  resSerie: [8067, 80734, 120225, 124160, 121881],
  fcfSerie: [-44236, 79212, 149347, 95341, 104256],
  bruttoSerie: [23.84, 38.55, 40.34, 40.21, 38.74],      // %
};
const R = {
  mcap: K.aktierMdr * K.pris,
  pe: K.pris / K.eps,
  pb: K.pris / K.bvps,
  ps: K.mcap / K.revTtm,
  ebitM: K.ebitTtm / K.revTtm,
  nettoM: K.nettoTtm / K.revTtm,
  fcfY: K.fcf / K.mcap,
  de: K.skuld / K.ekMdr,
  roe: K.nettoTtm / K.ekMdr,                              // källans ROE-rad n/a — dokumenterad replik
  prognos: K.pe / K.fwdPe - 1,
  payout: K.div / K.eps,
  omsCagr3: Math.pow(K.omsSerie[4] / K.omsSerie[1], 1 / 3) - 1,   // konsekutiv bas FY2023→FY2026
  resCagr3: Math.pow(K.resSerie[4] / K.resSerie[1], 1 / 3) - 1,
  omsCagr4: Math.pow(K.omsSerie[4] / K.omsSerie[0], 1 / 4) - 1,   // COVID-bas — loggas, används ej
  resCagr4: Math.pow(K.resSerie[4] / K.resSerie[0], 1 / 4) - 1,
  bruttoMedel: K.bruttoSerie.reduce((a, b) => a + b, 0) / 5,
  bruttoSpread: Math.max(...K.bruttoSerie) - Math.min(...K.bruttoSerie),
};
const avv = (a, b) => Math.abs(a / b - 1);
const kontroller = [
  ["mcap", R.mcap, K.mcap, 0.005], ["pe", R.pe, K.pe, 0.02], ["pb", R.pb, K.pb, 0.02],
  ["ps", R.ps, K.ps, 0.02], ["ebitM", R.ebitM, K.ebitM, 0.02], ["nettoM", R.nettoM, K.nettoM, 0.02],
  ["fcfY", R.fcfY, K.fcfY, 0.02], ["de", R.de, K.de, 0.02],
];
const fel = kontroller.filter(([n, r, k, tol]) => avv(r, k) > tol);
if (fel.length) {
  console.error("ABORT: replik utanför tolerans: " + fel.map(([n, r, k]) => `${n} ${r.toFixed(4)} vs ${k}`).join("; "));
  process.exit(1);
}
const roeKalibrering = avv(R.roe, K.roce); // nivåkontroll mot ROCE (dokumenterat i paranoid)
if (roeKalibrering > 0.05) { console.error("ABORT: ROE-replik kalibrerar ej mot ROCE"); process.exit(1); }

const PARANOID =
  "TYO-PRIMÄRNOTING i JPY (8306.T/9983.T/3382.T/4452.T-precedensen; underlag S&P Global Market Intelligence + Fiscal.ai via StockAnalysis; intradag 2026-09-25 09:25 JST delayed +0,37 %; färshämtning med cache-bypass — en cached Jan-2025-kopia (P/E 50,53) avvisades först, inaktuella tal kommer ALDRIG in): " +
  "pris 2 967,50 JPY (prev close 2 956,50; day range 2 951–3 000), mcap 4,85 T JPY på 1,64 mdr aktier (replik 1,64 × 2 967,50 = 4 867 mdr — 0,34 % mot källan, vägt aktietal/HEN3-JNJ-klassen), " +
  "P/E 35,72 (aktiebasreplik 2 967,50/82,76 = 35,85 = 0,4 % spridning; EPS-identitet 82,76 × 1,64 = 135,73 mdr mot TTM-netto 135,70 ✓ 0,02 %) mot forward P/E 36,38 ⇒ prognosTillväxt −1,81 % (trailing/fwd-modellen, MUFG-konventionen; NEGATIV redovisas öppet — konsensus väntar lägre EPS framåt; källans PEG 8,87 på 3-års EPS-tillväxt som kalibreringsnot ⇒ vardering.peg NULL: negativ prognos gör spår-PEG meningslös), " +
  "P/B 4,30 replikerbar (2 967,50/687,96 = 4,313 på BVPS), EV/EBIT 24,55 (EV 4,61 T; EBIT TTM 177,36 mdr), PS 6,72 EXAKT replik (4 850/721,52), " +
  "ROE n/a i källans panel — REPLIK netto/EK = 135,70/1 127 = 12,03 % (EK-stomme: BVPS 687,96 × 1,64 = 1 128 mdr; nivåkalibrerad mot källans ROCE 12,21 % ✓ 1,5 %), ROIC 14,76 % · WACC 5,61 % · räntetäckning 61,01 · D/E 0,29 EXAKT replik (326,30/1 127 = 0,290) · beta 0,31 · 52v 2 103–3 689 (−18,60 %) · Altman 7,89 · Piotroski 4 · aktuell volym 3 352 800; " +
  "balans: kassa 560,67 mdr · skuld 326,30 mdr · NETTKASSA 234,37 mdr (142,92/aktie) · EK 1,13 T; TTM JPY mdr: rev 721,52 (+3,9 %) · netto 135,70 (+6,7 %) · OCF 181,28 · capex −77,03 · FCF 104,26 med FCF-yield 2,15 % EXAKT replik (104,26/4 850) och P/FCF 46,50; " +
  "marginaler: brutto 39,18 · EBIT 24,58 EXAKT replik (177,36/721,52) · netto 18,81 EXAKT replik (135,70/721,52) · FCF 14,80 (replik 104,26/721,52 = 14,45 — källans rad bär annat fönster, dokumenterat); " +
  "utdelning 16,00 JPY/aktie (0,54 %) ⇒ senasteArMdr 26,2 (16 × 1,64) med payout-replik 19,33 % (16/82,76; källans payout-rad n/a) och FCF-payout 25,17 % · buyback-yield −0,02 % (utspädning ej aktiv; nyemissioner 0 — aktiebasen i princip konstant); " +
  "FY-SERIEN mars-slutande (mdr JPY): oms [275,73 · 483,12 · 618,49 · 679,37 · 704,54] · netto [8,07 · 80,73 · 120,23 · 124,16 · 121,88] · FCF [−44,24 · 79,21 · 149,35 · 95,34 · 104,26] — COVID-BROTT FY2022 (parkstängningar: netto 8,07 på oms 275,73) gör 4-års-CAGR absurda (oms +26,4 %, netto +96,0 %) ⇒ CAGR-fälten bär 3-ÅRS KONSEKUTIV bas FY2023→FY2026 (AXA IFRS17-brott-precedensen); bruttomarginalserie [23,84 · 38,55 · 40,34 · 40,21 · 38,74] ⇒ moat-medel 36,34 % med spread 16,50 pp (COVID-dipen syns i spriden); EK-historik saknas (balance-sheet-panel ej hämtad) ⇒ serier.egetKapital tomt; " +
  "analytikerläge Hold · 14 st · medelmål 3 279,23 JPY (datafakta, ej rekommendation); NÄSTA RAPPORT 2026-10-29 (Q2 FY2027) — v172-könotis; " +
  "kandidatur: S2-U3-JAPAN-KONSUMENT-KOMPLEMENT-OMG20 'Oriental Land 4661.T (P/E 36,67, Consumer Discretionary) — P/E-bärande alternativ, avsändat' — läget 2026-09-25 P/E 35,72 mot dokumentets 36,67 (2026-09-19) = nivåkonsekvent (veckans kursrörelse); Consumer Discretionary ⇒ konsument-cellen (femte affärsmodellen: temaparker, 39:e bolaget i branschen).";

const RAD = {
  ticker: "4661.T",
  namn: "Oriental Land Co., Ltd.",
  bransch: "konsument",
  land: "Japan",
  valuta: "JPY",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-25", url: "https://stockanalysis.com/quote/tyo/4661/ (+ /statistics/ + /financials/)", paranoid: PARANOID }],
  hamtat: "2026-09-25",
  pris: K.pris,
  marknadsKapitalMdr: K.mcap,
  tillvaxt: {
    omsattningCAGR5ar: R.omsCagr3,
    resultatCAGR5ar: R.resCagr3,
    omsattningTillvaxtTTM: K.omsTtm,
    prognosTillvaxt: R.prognos,
  },
  lonksamhet: {
    roe: R.roe, roic: K.roic, bruttoMarginal: K.bruttoM, ebitMarginal: K.ebitM,
    nettoMarginal: K.nettoM, fcfMarginal: K.fcfM,
  },
  stabilitet: {
    skuldEgenkapital: K.de, rantaTackning: 61.01, fcfPositivaSenaste5: 4,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: 0,
  },
  aterkop: { senasteArMdr: 26.2, andelUtestande: R.payout, insiderkopSenaste6man: 0 },
  moat: { bruttoMarginalMedel5ar: R.bruttoMedel / 100, bruttoMarginalSpread5ar: R.bruttoSpread / 100, roeMedel5ar: null },
  vardering: { pe: K.pe, pb: K.pb, evEbit: 24.55, peg: null, fcfYield: K.fcfY, egenKapitalMultipl: K.pb },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2022", "2023", "2024", "2025", "2026"],
    omsattning: K.omsSerie.map((x) => x * 1e6),
    resultat: K.resSerie.map((x) => x * 1e6),
    egetKapital: [],
    fcf: K.fcfSerie.map((x) => x * 1e6),
  },
  notering:
    "kandidat ur S2-U3-OMG20-komplementets fält (P/E-bärande Japan/konsument); COVID-brott FY2022 (parkstängningar) ⇒ CAGR-fält på 3-årig konsekutiv bas FY2023→FY2026, de absurda 4-års-CAGR:arna dokumenterade i paranoid; prognosTillväxt NEGATIV (−1,8 %, forward P/E 36,38 > trailing 35,72) redovisas öppet ⇒ peg NULL (meningslös på negativ prognos; källans 3-års PEG 8,87 som kalibreringsnot i paranoid); ROE = dokumenterad replik netto/EK (källans ROE-rad n/a, nivåkalibrerad mot ROCE 12,21 %); EK-serie saknas (balance-sheet ej hämtad) — serier.egetKapital tomt; rapportdag 2026-10-29 (Q2 FY2027) = v172-könotis; alla repliker och källpaneler i paranoid (StockAnalysis TYO 2026-09-25)",
};

// ── Fältgrind mot Kao-strukturen (Japan/konsument-syskon) ──────────────────────
const kao = u.find((b) => b.ticker === "4452.T");
const fält = (o) => Object.keys(o).sort().join(",");
const strukturOk =
  fält(RAD) === fält(kao) &&
  ["tillvaxt", "lonksamhet", "stabilitet", "aterkop", "moat", "vardering", "golv", "serier"].every(
    (k) => fält(RAD[k]) === fält(kao[k]),
  );
if (!strukturOk) { console.error("ABORT: fältstruktur avviker från 4452.T-mallen"); process.exit(1); }

// ── Kirurgisk append med filens eget indent ───────────────────────────────────
const rad2 = raw.split("\n")[1] ?? "";
const indent = rad2.startsWith("  ") ? 2 : rad2.startsWith(" ") ? 1 : 0;
const backup = JSON.parse(JSON.stringify(u));
u.push(RAD);
const ut = JSON.stringify(u, null, indent) + (raw.endsWith("\n") ? "\n" : "");
writeFileSync(UNI, ut);

// ── Läs-tillbaka ×2 + per-index bitidentitet på de gamla raderna ─────────────
const kvitto = [];
for (let i = 1; i <= 2; i++) {
  const el = JSON.parse(readFileSync(UNI, "utf8"));
  if (el.length !== FÖRE + 1) { console.error(`ABORT: läs-tillbaka ${i}: ${el.length} ≠ ${FÖRE + 1}`); process.exit(1); }
  if (el[el.length - 1].ticker !== "4661.T") { console.error(`ABORT: läs-tillbaka ${i}: sista raden ≠ 4661.T`); process.exit(1); }
}
const slut = JSON.parse(readFileSync(UNI, "utf8"));
const forandrade = backup.filter((b, i) => JSON.stringify(b) !== JSON.stringify(slut[i])).length;
if (forandrade !== 0) { console.error(`ABORT: ${forandrade} gamla rader förändrade`); process.exit(1); }
const konsumentFöre = backup.filter((b) => b.bransch === "konsument").length;
const konsumentEfter = slut.filter((b) => b.bransch === "konsument").length;

kvitto.push(
  `UNIVERSUM-INLÄGG GRÖN: ${FÖRE}→${slut.length} (+1 Oriental Land 4661.T, Japan/konsument ${konsumentFöre}→${konsumentEfter})`,
  `indent=${indent} · gamla rader förändrade=${forandrade} · läs-tillbaka ×2 OK`,
  `REPLIKER: pe ${R.pe.toFixed(3)} (källa ${K.pe}) · pb ${R.pb.toFixed(3)} (${K.pb}) · ps ${R.ps.toFixed(3)} (${K.ps}) · mcap ${R.mcap.toFixed(0)} (${K.mcap}) · ebitM ${(R.ebitM * 100).toFixed(2)} % · nettoM ${(R.nettoM * 100).toFixed(2)} % · fcfY ${(R.fcfY * 100).toFixed(2)} % · D/E ${R.de.toFixed(3)} (${K.de}) — alla inom tolerans`,
  `ROE-replik ${(R.roe * 100).toFixed(2)} % kalibrerad mot ROCE 12,21 % (avv ${((roeKalibrering * 100)).toFixed(1)} %)`,
  `CAGR: oms3å ${(R.omsCagr3 * 100).toFixed(2)} % · res3å ${(R.resCagr3 * 100).toFixed(2)} % (konsekutiv bas; 4-åriga absurda: oms ${(R.omsCagr4 * 100).toFixed(1)} % / res ${(R.resCagr4 * 100).toFixed(1)} % — COVID, dokumenterat)`,
  `prognosTillväxt ${(R.prognos * 100).toFixed(2)} % (negativ — öppet redovisad; peg NULL) · payout ${(R.payout * 100).toFixed(2)} % · moat-medel ${R.bruttoMedel.toFixed(2)} % spread ${R.bruttoSpread.toFixed(2)} pp`,
);
writeFileSync("/tmp/r195-inlagg.txt", kvitto.join("\n"));
console.log(kvitto.join("\n"));
