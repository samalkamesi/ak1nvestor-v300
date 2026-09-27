#!/usr/bin/env node
/**
 * _r222-u26-universum-inlagg.mjs — v173 dataset-djup rond 222 U26 (+1):
 * Rolls-Royce Holdings RR.L (Storbritannien/industri 1→2) — cellmotiverad
 * duo: BAE Systems (försvarsplattformskontraktör, orderbacklog-modellen) +
 * Rolls-Royce (motorer + aftermarket-tjänster — MOTORN OCH BLADET:
 * segmentsraderna OE/Aftermarket summerar EXAKT mot omsättningen alla fyra
 * år, tjänsteandelen 54 % → 57 %). P/E-bärarkontroll FÖRE leverans
 * (TTM-netto 3 038 M GBP > 0 — GRÖN); kollisionskontroll primär+sekundär
 * (AZN-läxan) GRÖN. FCF stigande FYRA ÅR RAKT [1 165 → 3 944] + TTM 4 461,
 * serien intern låst. FY2025-engångsposten (netto-M 27,5 % > EBIT-M 19,8 %)
 * dokumenterad — TTM-fönstret som bär fälten är normaliserat (13,1 < 20,7).
 * Kvitto: /tmp/r222-inlagg.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const FÖRE = u.length;
if (u.some((b) => b.ticker === "RR.L" || /rolls.?royce/i.test(b.namn ?? ""))) {
  console.error("ABORT: RR.L finns redan på disken");
  process.exit(1);
}

const K = {
  prisGBX: 1503.2, aktierMdr: 8.30, mcap: 123.16, eps: 0.36, peKalla: 41.02,
  pb: 42.73, evEbitReplik: 25.22, psKalla: 5.32, pFcf: 27.61,
  roe: 1.1448, roic: 4.7058, wacc: 0.1056, ebitM: 0.2072, bruttoM: 0.2880,
  nettoTtm: 3.038, revTtm: 23.165, fcfTtm: 4.461,
  skuld: 4.37, ek: 2.88, kassa: 6.48, evKalla: 121.07, de: 1.52, rantaTackning: 19.12,
  div: 0.12,
  omsSerie: [13520, 16486, 18909, 21207],   // M GBP, dec-slut FY2022–FY2025
  resSerie: [-1269, 2412, 2521, 5841],
  fcfSerie: [1165, 2056, 3263, 3944],
  ocfSerie: [1524, 2485, 3782, 4565], ocfTtm: 5.117,
  capexSerie: [359, 429, 519, 621], capexTtm: 0.656,
  oeSerie: [6273, 7635, 8389, 9103], asSerie: [7247, 8851, 10520, 12104],  // Original Equipment / Aftermarket Services
};
const R = {
  mcapReplik: (K.aktierMdr * K.prisGBX) / 100,
  pePrisEps: K.prisGBX / 100 / K.eps,
  peGaap: K.mcap / K.nettoTtm,
  evReplik: K.mcap + K.skuld - K.kassa,
  nettoM: K.nettoTtm / K.revTtm,
  fcfM: K.fcfTtm / K.revTtm,
  fcfY: K.fcfTtm / K.mcap,
  omsCagr3: Math.pow(K.omsSerie[3] / K.omsSerie[0], 1 / 3) - 1,
  fcfCagr3: Math.pow(K.fcfSerie[3] / K.fcfSerie[0], 1 / 3) - 1,
  payoutReplik: K.div / K.eps,
  psReplik: K.mcap / K.revTtm,
  pbReplik: K.mcap / K.ek,
  deReplik: K.skuld / K.ek,
  epsIdentitet: (K.eps * K.aktierMdr * 1000) / 1000,
};
const avv = (a, b) => Math.abs(a / b - 1);
const exakt = [
  ["mcap", R.mcapReplik, K.mcap, 0.02],
  ["ps", R.psReplik, K.psKalla, 0.02],
  ["pb", R.pbReplik, K.pb, 0.02],
  ["ev-dekomposition", R.evReplik, K.evKalla, 0.02],
  ["nettoM mot källans rad", R.nettoM, 0.1311, 0.02],
  ["fcfM mot källans rad", R.fcfM, 0.1926, 0.02],
  ["fcfY mot källrad", R.fcfY, 0.0362, 0.02],
  ["fcfY mot 1/P·FCF", R.fcfY, 1 / K.pFcf, 0.02],
  ["de", R.deReplik, K.de, 0.02],
  ["EPS×aktier=netto", K.eps * K.aktierMdr, K.nettoTtm, 0.02],
  ["pe pris/EPS", R.pePrisEps, K.peKalla, 0.02],
];
const fel = exakt.filter(([n, r, k, tol]) => avv(r, k) > tol);
if (fel.length) {
  console.error("ABORT: replik utanför tolerans: " + fel.map(([n, r, k]) => `${n} ${r.toFixed(4)} vs ${k}`).join("; "));
  process.exit(1);
}
const fcfIdent = [];
for (let i = 0; i < 4; i++) fcfIdent.push([K.ocfSerie[i] - K.capexSerie[i], K.fcfSerie[i]]);
fcfIdent.push([K.ocfTtm - K.capexTtm, K.fcfTtm]);
if (fcfIdent.some(([a, b]) => Math.abs(a - b) > 0.001)) {
  console.error("ABORT: FCF-serien ej OCF−capex-låst: " + fcfIdent.map(([a, b]) => `${a}≠${b}`).join("; "));
  process.exit(1);
}
const segment = K.omsSerie.map((x, i) => [K.oeSerie[i] + K.asSerie[i], x]);
if (segment.some(([s, x]) => s !== x)) {
  console.error("ABORT: OE+Aftermarket ≠ omsättning: " + segment.map(([s, x]) => `${s}≠${x}`).join("; "));
  process.exit(1);
}
if (K.nettoTtm <= 0) { console.error("ABORT: P/E-bärarkontroll — TTM-netto ≤ 0"); process.exit(1); }

const PARANOID =
  "LSE-PRIMÄRNOTING (underlag S&P Global Market Intelligence via StockAnalysis; intradag 2026-09-25 — öppning 1 496,40 · föregående close 1 503,20 GBp · dagsspann 1 464,40–1 499,80 · 52v 990–1 586; färshämtning direkt med cache-bypass + FYRA paneler (quote/statistics/financials/cash-flow); dec-slut; prisfältet i PENCE enligt BA.L/HSBA-cellkonventionen, mcap i GBP mdr): " +
  "pris 15,032 GBP (1 503,2 GBp; beta 1,19), mcap 123,16 mdr GBP på 8,30 mdr aktier (replik 8,30 × 15,032 = 124,8 — 1,3 %), " +
  "P/E 41,02 källans rad med pris/EPS-repliken 15,032/0,36 = 41,8 (1,8 %, EPS-raden 0,36 avrundad från 0,366 = 3 038/8 300) och GAAP-repliken 123,16/3,038 = 40,5 (1,2 %) — tre tal i familjedokumentation; fwd P/E 32,02 (marknadens implied EPS +28 % — referens); PS 5,32 EXAKT (123,16/23,165 — 0,06 %) · P/B 42,73 EXAKT (123,16/2,88 — 0,07 %; P/B-extremet är STRUKTURELLT: eget kapital 2,88 mdr efter pandemins nedskrivningar och hedge-volymer — metodnoten nedan) · EPS×AKTIER 0,36 × 8 300 = 2 988 ≈ netto 3 038 (1,6 %); " +
  "EV-DEKOMPOSITION REN MED NETTO-KASSA: 123,16 + 4,37 − 6,48 = 121,05 mot källans 121,07 (0,02 %) — RR står i NETTO-KASSA +2,11 mdr (mot DSV:s −85 mdr i samma cell: cellens två balansmodeller); EV/EBIT 25,22 (replik) · EV/EBITDA 22,26 (källrad) · EV/Earnings 39,85 EXAKT (121,07/3,038); " +
  "FY2025-ENGÅNGSPOSTEN DOKUMENTERAD (Kirin-U3-kontrollen per fönster): FY2025 netto 5 841 med netto-M 27,5 % ÖVER EBIT-M 19,8 % = finanspost/avyttring under EBIT-linjen — engångskaraktär; TTM-FÖNSTRET SOM BÄR FÄLTEN ÄR NORMALISERAT: netto-M 13,11 % < EBIT-M 20,72 % (ordning OK, kontrollen godkänd); " +
  "FCF FYRA ÅR RAKT + TTM: [1 165 · 2 056 · 3 263 · 3 944] + TTM 4 461 — stigande varje år, rak CAGR +50,1 % (motorvärvningens eftermarknadsmaskin); FCF-serien intern låst (OCF−capex exakt fem fönster) · FCF-M 19,26 % EXAKT · FCF-yield 3,62 % DUBBELT EXAKT (4 461/123 160 mot källrad + 1/27,61); " +
  "SEGMENTLÅSET (vågens första): Original Equipment [6 273 · 7 635 · 8 389 · 9 103] + Aftermarket Services [7 247 · 8 851 · 10 520 · 12 104] summerar EXAKT mot omsättningen samtliga fyra år — MOTORN OCH BLADET: tjänsteandelen 53,6 % → 54,2 % → 55,6 % → 57,1 % (bladen växer snabbare än raknen); " +
  "SERIEPROFILER: oms [13 520 · 16 486 · 18 909 · 21 207] (rak CAGR +16,25 %) · netto [−1 269 · 2 412 · 2 521 · 5 841] — resultatCAGR NULL på negativ bas (Vonovia-precedensen: pandemiförlusten FY2022 gör CAGR meningslös; vändningen dokumenterad i stället: fyrlägg från −1 269 till +2 412 på två år) · EPS [−0,15 · 0,29 · 0,30 · 0,69]; omsättningstillväxt TTM +9,23 % · prognosTillväxt +11,07 % (källans rev-fwd 3Y — ren bas); källans PEG 1,48 med oklar bas ⇒ fältet NULL (basblandning vägras); " +
  "METODNOTER: ROE 114,48 % och ROIC 470,58 % är källans rader och STRUKTURELLT SANNA men historiskt betingade — det tunna EK:t (2,88 mdr på 123 mdr mcap) gör avkastningstal oansenliga som jämförelsetal (dokumenterat; ROCE 24,79 % är det jämförbara talet) · WACC 10,56 % (hög beta-rabatt); " +
  "balans: D/E 1,52 EXAKT (4,37/2,88) · räntetäckning 19,12 · Debt/EBITDA 0,81 · NETTO-KASSA +2,11 mdr · Altman 2,78 (gränszon) · Piotroski 6; " +
  "utdelning 0,12 GBP/aktie (0,81 %) med payout-källrad 26,17 % (EPS-bas-repliken 33,3 % på det avrundade EPS:t, noterad) ⇒ senasteArMdr 0,996; aktieantalet −0,70 % YoY (återköp 0,70 %) ⇒ nyemissioner 0; 52-veckorsförändring +27,49 %; " +
  "kandidatur: CELLMOTIVERAD duo enligt U13-mönstret — Storbritannien/industri-cellens TVÅ affärsmodeller: BAE Systems (BA.L, försvarsplattformskontraktör — orderbacklog-modellen) + Rolls-Royce (RR.L, motorer + aftermarket-tjänster — motorn-och-bladet; segmentlåset dokumenterar tjänsteflytten); kontrasten spänner intäktsmodell OCH balans (BAE kontraktsstock mot RR netto-kassa + tjänstemaskin); kollisionskontroll primär+sekundär (AZN-läxan rond 221) GRÖN; P/E-bärarkriteriet kontrollerat FÖRE leverans (TTM-netto 3 038 M GBP > 0; Sony/Honda-doktrinen); Industrials ⇒ industri-cellen (27→28 bolag), Storbritannien 11→12 (industri-grenen 1→2); NÄSTA RAPPORT est. 2026-11-12 (strax utanför v172-fönstret 10-20→11-04 — notis vid kalenderberöring).";

const RAD = {
  ticker: "RR.L",
  namn: "Rolls-Royce Holdings plc",
  bransch: "industri",
  land: "Storbritannien",
  valuta: "GBX",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-25", url: "https://stockanalysis.com/quote/lon/RR/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/)", paranoid: PARANOID }],
  hamtat: "2026-09-25",
  pris: K.prisGBX,
  marknadsKapitalMdr: K.mcap,
  tillvaxt: {
    omsattningCAGR5ar: +R.omsCagr3.toFixed(4),
    resultatCAGR5ar: null,
    omsattningTillvaxtTTM: 0.0923,
    prognosTillvaxt: 0.1107,
  },
  lonksamhet: {
    roe: K.roe, roic: K.roic, bruttoMarginal: K.bruttoM, ebitMarginal: K.ebitM,
    nettoMarginal: +R.nettoM.toFixed(4), fcfMarginal: +R.fcfM.toFixed(4),
  },
  stabilitet: {
    skuldEgenkapital: K.de, rantaTackning: K.rantaTackning, fcfPositivaSenaste5: 4,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: 0,
  },
  aterkop: { senasteArMdr: 0.996, andelUtestande: +R.payoutReplik.toFixed(3), insiderkopSenaste6man: 0 },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
  vardering: { pe: K.peKalla, pb: K.pb, evEbit: K.evEbitReplik, peg: null, fcfYield: +R.fcfY.toFixed(4), egenKapitalMultipl: K.pb },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2022", "2023", "2024", "2025"],
    omsattning: K.omsSerie.map((x) => x * 1e6),
    resultat: K.resSerie.map((x) => x * 1e6),
    egetKapital: [],
    fcf: K.fcfSerie.map((x) => x * 1e6),
  },
  notering:
    "cellmotiverad duo (Storbritannien/industri 1→2: BAE försvarsplattformskontraktör + Rolls-Royce motorer/aftermarket — MOTORN OCH BLADET: segmentlåset OE+Aftermarket = omsättningen EXAKT fyra år, tjänsteandelen 54→57 %); LSE-primär, prisfältet i PENCE (BA.L-konventionen), mcap GBP mdr; kollisionskontroll primär+sekundär (AZN-läxan) GRÖN; FY2025-ENGÅNGSPOSTEN dokumenterad (netto-M 27,5 % > EBIT-M 19,8 %) — TTM-fönstret som bär fälten NORMALISERAT (13,1 < 20,7, Kirin-kontrollen godkänd); netto [−1 269 · 2 412 · 2 521 · 5 841] — resultatCAGR NULL på negativ bas (Vonovia-precedens; pandemivändningen dokumenterad); FCF FYRA ÅR RAKT + TTM [1 165 → 4 461] rak CAGR +50,1 %, serien intern låst; FCF-yield 3,62 % DUBBELT EXAKT; EV REN 0,02 % MED NETTO-KASSA +2,11 mdr (mot DSV:s −85 mdr i samma cell: två balansmodeller); P/B 42,73 EXAKT men STRUKTURELLT (tunt EK 2,88 mdr — metodnot); ROE/ROIC-extremer (114/471 %) historiskt betingade, ROCE 24,8 % jämförbart; PS 5,32 EXAKT; Altman 2,78 · Piotroski 6 · beta 1,19; återköp 0,70 % (aktieantal −0,70 %); rappdag est. 2026-11-12 strax utanför v172-fönstret; EK-serie saknas; alla repliker i paranoid (StockAnalysis LON 2026-09-25)",
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

for (let i = 1; i <= 2; i++) {
  const el = JSON.parse(readFileSync(UNI, "utf8"));
  if (el.length !== FÖRE + 1) { console.error(`ABORT: läs-tillbaka ${i}`); process.exit(1); }
  if (el[el.length - 1].ticker !== "RR.L") { console.error("ABORT: sista raden ≠ RR.L"); process.exit(1); }
}
const slut = JSON.parse(readFileSync(UNI, "utf8"));
const forandrade = backup.filter((b, i) => JSON.stringify(b) !== JSON.stringify(slut[i])).length;
if (forandrade !== 0) { console.error(`ABORT: ${forandrade} gamla rader förändrade`); process.exit(1); }

const kvitto = [];
kvitto.push(
  `UNIVERSUM-INLÄGG GRÖN: ${FÖRE}→${slut.length} (+1 Rolls-Royce RR.L, Storbritannien/industri 1→2; industri-cellen 27→${slut.filter((b) => b.bransch === "industri").length}; Storbritannien → ${slut.filter((b) => b.land === "Storbritannien").length})`,
  `indent=${indent} · gamla rader förändrade=${forandrade} · läs-tillbaka ×2 OK`,
  `REPLIKER (ELVA LÅS): mcap ${R.mcapReplik.toFixed(1)} (123,16) 1,3 % · PS ${R.psReplik.toFixed(3)} (5,32) 0,06 % · P/B ${R.pbReplik.toFixed(2)} (42,73) 0,07 % · EV ${R.evReplik.toFixed(2)} (121,07) 0,02 % REN NETTO-KASSA · netto-M ${(R.nettoM * 100).toFixed(2)} % · FCF-M ${(R.fcfM * 100).toFixed(2)} % · fcfY ${(R.fcfY * 100).toFixed(2)} % DUBBELT (3,62 + 1/27,61) · D/E ${R.deReplik.toFixed(3)} · EPS×aktier 1,6 % · P/E-familjen 41,0/40,5/41,8 dokumenterad · payout`,
  `SEGMENTLÅSET (vågens första): OE+Aftermarket = omsättning EXAKT samtliga fyra år; tjänsteandel 53,6→57,1 %`,
  `FCF FYRA ÅR RAKT: [1 165 · 2 056 · 3 263 · 3 944] + TTM 4 461 (rak CAGR +${(R.fcfCagr3 * 100).toFixed(1)} %) — serien OCF−capex-låst fem fönster`,
  `ENGÅNGSKONTROLLEN: FY2025 netto-M 27,5 % > EBIT-M 19,8 % (engångskaraktär dokumenterad) — TTM-fönstret normaliserat 13,1 < 20,7 (fälten godkända) · resultatCAGR NULL (negativ bas, Vonovia-precedens)`,
);
writeFileSync("/tmp/r222-inlagg.txt", kvitto.join("\n"));
console.log(kvitto.join("\n"));
