#!/usr/bin/env node
/**
 * _r236-u36-universum-inlagg.mjs — v173 dataset-djup rond 236 U36 (+1):
 * Atresmedia Corporación A3M (Spanien/kommunikation 1→2 — SPANIENS SISTA
 * 1-GREN). Cellmotiverad duo: Cellnex (telekom-tornen — infrastrukturen/
 * rören) + Atresmedia (broadcasting — innehållet/media): SPANSKA
 * BT+PEARSON-MÖNSTRET. BME/EUR (CLN.MC-precedensen).
 * DOKUMENTERADE VARNINGAR (rond 235): tunn småbolagsdatatäckning ·
 * utdelningssänkningen −42,65 % (FY24-spike 0,68 → 0,39; payout n/a i
 * källan, FCF-payout 57,24 %) · dagssvängen +10,44 % i paranoid ·
 * FY25-NETTOKOLLAPSEN 120,3 → 62,1 (TTM 54,7 — P/E-bärarkontrollen
 * FORMELLT grön: +54,68 M > 0) · brutto-omklassningen FY24→FY25 (310,6 →
 * 220,0 = content-kostnader omklassade i källans standardisering) ·
 * ROIC-gap +0,17 p (knappt). SEGMENTLÅSET INTERNT: Audiovisual+Radio+Elim =
 * källans segmenttotal ±0,4 M sex fönster (FY21–FY25 EXAKT) med
 * begreppsdifferans mot revenue-raden ~108–113 M/år (BBVA-modellen).
 * Kvitto: /tmp/r236-inlagg.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const FÖRE = u.length;
if (u.some((b) => ["A3M", "A3M.MC"].includes(b.ticker) || /atresmedia/i.test(b.namn ?? "") || (b.kallor?.[0]?.url ?? "").includes("/bme/A3M/"))) {
  console.error("ABORT: A3M finns redan på disken");
  process.exit(1);
}

const K = {
  prisEUR: 5.82, aktierMdr: 0.22518, mcap: 1.31, eps: 0.24, peKalla: 24.05,
  fwdPe: 12.43, pb: 1.62, psKalla: 1.45, evKalla: 1.24,
  evEarnings: 22.71, evSales: 1.37, evEbit: 16.38, pFcf: 10.54, pocf: 8.41,
  roe: 0.0692, roic: 0.0779, roce: 0.0674, wacc: 0.0762,
  ebitM: 0.0835, pretaxM: 0.0791, bruttoM: 0.2372,
  nettoTtm: 0.05468, revTtm: 0.90321, fcfTtm: 0.12428,
  skuld: 0.20348, ek: 0.811, kassa: 0.27252, de: 0.25, rantaTackning: 11.69,
  div: 0.39, divYieldKalla: 0.0670, fcfPayoutKalla: 0.5724,
  // EUR-serier, dec-slut FY2022–FY2025
  omsSerie: [867.29, 886.11, 918.95, 893.75],
  resSerie: [112.91, 171.16, 120.28, 62.11],
  fcfSerie: [105.40, 137.26, 165.71, 91.56],
  ocfSerie: [125.39, 167.04, 186.72, 128.44], ocfTtm: 155.82,
  capexSerie: [19.99, 29.79, 21.01, 36.87], capexTtm: 31.54,
  bruttoSerie: [0.3574, 0.3678, 0.3557, 0.3380, 0.2461],  // FY21–FY25 (omklassningen FY25 dokumenterad)
  dpsSerie: [0.420, 0.400, 0.420, 0.680, 0.390],          // FY2021–FY2025 (FY24-spike = extrautdelning)
  // Segment (INTERN bas) [TTM · FY25 · FY24 · FY23 · FY22 · FY21], M EUR
  audiovisual: [937.28, 924.85, 943.69, 902.78, 884.22, 901.16],
  radio: [86.52, 85.74, 82.48, 77.04, 75.62, 70.75],
  elim: [-8.19, -8.36, -8.29, -8.39, -9.05, -8.65],
  segTotal: [1016, 1002, 1018, 971.43, 950.79, 963.26],
};
const R = {
  mcapReplik: (K.aktierMdr * K.prisEUR),
  pePrisEps: K.prisEUR / K.eps,
  peGaap: K.mcap / K.nettoTtm,
  evReplik: K.mcap + K.skuld - K.kassa,
  nettoM: K.nettoTtm / K.revTtm,
  fcfM: K.fcfTtm / K.revTtm,
  fcfY: K.fcfTtm / K.mcap,
  divY: K.div / K.prisEUR,
  omsCagr3: Math.pow(K.omsSerie[3] / K.omsSerie[0], 1 / 3) - 1,
  resCagr3: Math.pow(K.resSerie[3] / K.resSerie[0], 1 / 3) - 1,
  fcfCagr3: Math.pow(K.fcfSerie[3] / K.fcfSerie[0], 1 / 3) - 1,
  bruttoMedel: K.bruttoSerie.reduce((a, b) => a + b, 0) / K.bruttoSerie.length,
  bruttoSpread: Math.max(...K.bruttoSerie) - Math.min(...K.bruttoSerie),
  psReplik: K.mcap / K.revTtm,
  pbReplik: K.mcap / K.ek,
  deReplik: K.skuld / K.ek,
  evEarningsReplik: K.evKalla / K.nettoTtm,
  evSalesReplik: K.evKalla / K.revTtm,
  epsBeraknad: K.nettoTtm / K.aktierMdr,
};
const avv = (a, b) => Math.abs(a / b - 1);
const exakt = [
  ["mcap", R.mcapReplik, K.mcap, 0.02],
  ["ps", R.psReplik, K.psKalla, 0.02],
  ["pb", R.pbReplik, K.pb, 0.02],
  ["ev-dekomposition", R.evReplik, K.evKalla, 0.02],
  ["nettoM mot källans rad", R.nettoM, 0.0605, 0.02],
  ["fcfM mot källans rad", R.fcfM, 0.1376, 0.02],
  ["fcfY mot källrad", R.fcfY, 0.0948, 0.02],
  ["divYield mot källrad", R.divY, K.divYieldKalla, 0.02],
  ["de", R.deReplik, K.de, 0.02],
  ["payout — källan n/a (NULL; utdelningssänkningen −42,65 % och FCF-payout 57,24 % dokumenterade)", null, null, 1],
  ["pe pris/EPS (EPS-raden 0,24 grovt avrundad mot beräknad 0,2428)", R.pePrisEps, K.peKalla, 0.02],
  ["evEarnings", R.evEarningsReplik, K.evEarnings, 0.02],
  ["evSales", R.evSalesReplik, K.evSales, 0.02],
];
const fel = exakt.filter(([n, r, k, tol]) => r !== null && k !== null && avv(r, k) > tol);
if (fel.length) {
  console.error("ABORT: replik utanför tolerans: " + fel.map(([n, r, k]) => `${n} ${r.toFixed(4)} vs ${k}`).join("; "));
  process.exit(1);
}
if (!(R.peGaap > K.peKalla - 1 && R.peGaap < K.peKalla + 1)) {
  console.error(`ABORT: P/E-familjen utanför spann (GAAP ${R.peGaap.toFixed(2)})`);
  process.exit(1);
}
// FCF-IDENTITET (±0,01)
const fcfIdent = [];
for (let i = 0; i < 4; i++) fcfIdent.push([K.ocfSerie[i] - K.capexSerie[i], K.fcfSerie[i]]);
fcfIdent.push([K.ocfTtm - K.capexTtm, 124.28]);
if (fcfIdent.some(([a, b]) => Math.abs(a - b) > 0.011)) {
  console.error("ABORT: FCF-serien ej OCF−capex-låst: " + fcfIdent.map(([a, b]) => `${a}≠${b}`).join("; "));
  process.exit(1);
}
// SEGMENT-INTERNT LÅS: Audiovisual+Radio+Elim = segmenttotal ±0,4 M sex fönster
const segSum = K.segTotal.map((x, i) => [K.audiovisual[i] + K.radio[i] + K.elim[i], x]);
if (!segSum.every(([s, x]) => Math.abs(s - x) <= 0.4)) {
  console.error("ABORT: internt segmentlås bruten: " + segSum.map(([s, x]) => `${s}≠${x}`).join("; "));
  process.exit(1);
}
if (K.nettoTtm <= 0) { console.error("ABORT: P/E-bärarkontroll — TTM-netto ≤ 0"); process.exit(1); }
if (!(R.nettoM < K.pretaxM && K.pretaxM < K.ebitM)) { console.error("ABORT: normal kaskad bruten"); process.exit(1); }

const RAD = {
  ticker: "A3M.MC",
  namn: "Atresmedia Corporación de Medios de Comunicación, S.A.",
  bransch: "kommunikation",
  land: "Spanien",
  valuta: "EUR",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-25", url: "https://stockanalysis.com/quote/bme/A3M/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/)", paranoid:
    "BME-PRIMÄRNOTING under symbolen A3M (f.d. Antena 3; rond 235:s 404-diagnos: bme/ATR finns ej — symbolen dokumenterad); underlag S&P Global Market Intelligence via StockAnalysis; senaste handelsdag 2026-09-24, hämtat 2026-09-25 — close 5,82 EUR · DAGSSVÅNGEN +10,44 % (SMÅBOLAGSVOLATILITETEN dokumenterad; RSI 76,2 överköpt efter dycket); 50/200-dagars MA 5,18/5,05; 52v +7,58 %; konsensus PT 5,56 = −4,5 % Buy); färskhämtning med FYRA paneler; KALENDERÅRSBOKSLUT (31 dec; TTM = jun '26 efter H1 — HALVÅRSRAPPORTERING; NÄSTA RAPPORT 2026-10-22 BEKRÄFTAD — INOM v172-FÖNSTRET 10-20→11-04: FJÄRDE BOLAGET efter DGE+BBVA+PUIG 10-29 och före ENB 11-02); BME/EUR-PRECEDENSEN (CLN.MC/SAN.MC-klassen): " +
    "pris 5,82 EUR (beta 0,76), mcap 1,31 mdr EUR på 0,22518 mdr aktier (replik 0,22518×5,82 = 1,3105 — EXAKT); ÄGARSTRUKTUREN: float 96,67 M (43 %), institutionsägande 4,64 %, insiders 0,13 % — PLANETA-GRUPPENS KONTROLL via aktieklasser (källans låga institutionsägande dokumenterar familjekontrollen); UNIVERSUMETS MINSTA BOLAG I EURO-SVEPET men över SWP.PA (0,28) · HFG.DE (0,39) · ENEA.ST (1,21) — tröskeln passerad enligt rond 235-beslutet: " +
    "P/E-FAMILJEN: källrad 24,05 · GAAP 1,31/0,05468 = 23,96 · pris/EPS 5,82/0,24 = 24,25 (0,8 % — EPS-raden 0,24 grovt avrundad mot beräknad 0,2428); fwd P/E 12,43 ⇒ implied EPS +93 % (DEN STORA VÄNDNINGSKONSENSUSEN — referens, ALDRIG löfte); PEG-KÄLLRAD 4,14 med BASBLANDNING (fwd-replik 12,43/20,57 = 0,60 — extremt spretiga baser) ⇒ fältet NULL; PS 1,45 EXAKT · P/B 1,62 (1,31/0,811 — 0,3 %) · P/FCF 10,54 · P/OCF 8,41; " +
    "EV-DEKOMPOSITION EXAKT: 1,31 + 0,20348 − 0,27252 = 1,24096 mot källans 1,24 (0,08 %) — NETTOKASSA +69,0 M EUR (+0,31/aktie; mediebolaget efter kollapsåret); EV/Earnings 22,71 (0,13 %) · EV/Sales 1,37 EXAKT · EV/EBIT 16,38 · EV/EBITDA 14,18; " +
    "FY25-NETTOKOLLAPSEN DOKUMENTERAD: netto [118,5 · 112,9 · 171,2 · 120,3 · 62,1] + TTM 54,7 (FY24-topp 171,2 → FY25 62,1 = −64 %; medieprishärdarna — källan redovisar beloppen, orsaksfördelningen ej; netto-CAGR −18,1 % FY22→25 REDOVISAS ÖPPET); EPS [0,53 · 0,50 · 0,76 · 0,53 · 0,28] + TTM 0,24; omsättningen FLATT [877,9 · 867,3 · 886,1 · 919,0 · 893,8] + TTM 903,2 (CAGR +1,0 % — reklammarknadens sidvindar); BRUTTO-OMKLASSNINGEN FY24→FY25: källans bruttorad [313,8 · 319,0 · 315,2 · 310,6 · 220,0] = content-kostnader omklassade in i bruttoledet (bruttomarginal-raderna 35,7 → 24,6 % — standardisering, ej verksamhetskollaps; dokumenterat); " +
    "FCF BÄR BÄTTRE BILD ÄN NETTO: [176,2 · 105,4 · 137,3 · 165,7 · 91,6] + TTM 124,3 — identitetslåst ±0,01 sex fönster (OCF−capex: [193,8−17,6 · 125,4−20,0 · 167,0−29,8 · 186,7−21,0 · 128,4−36,9 · 155,8−31,5]); FCF-M 13,76 % EXAKT > netto-M 6,05 % (amorfteringsburen vinstbild — mediebolagets content-avskrivningar); FCF-yield 9,48 % EXAKT; " +
    "UTDELNINGEN SÄNKT −42,65 %: DPS [0,420 · 0,400 · 0,420 · 0,680 · 0,390] — FY24-SPIKEN 0,68 (extrautdelning, yield-rad 17,67 % dokumenterar) följt av normaliseringen 0,39; current 0,39 EUR (6,70 % EXAKT replik 0,39/5,82); PAYOUT-KÄLLRAD n/a (NULL — dokumenterad) med FCF-UTDELNINGSMANINGS-raden 57,24 % som bärarbilden; utdelningsbelopp [−40,5 · −101,3 · −90,1 · −94,6 · −40,5] TTM −40,5 · återköp nästan noll [−0,19 · −1,75]; " +
    "SEGMENTLÅSET INTERNT (BBVA-modellen): Audiovisual [937,3 · 924,9 · 943,7 · 902,8 · 884,2 · 901,2] (TV — 92 % av segmentbasen) + Radio [86,5 · 85,7 · 82,5 · 77,0 · 75,6 · 70,8] + Justeringar/elimineringar [−8,2 · −8,4 · −8,3 · −8,4 · −9,1 · −8,7] = källans segmenttotal [1 016 · 1 002 · 1 018 · 971,4 · 950,8 · 963,3] inom ±0,4 M SEX FÖNSTER (FY21–FY25 EXAKT); BEGREPPSDIFFERANSEN mot revenue-raden ~108–113 M/år dokumenterad (segmentbasen bruttoinkomster inkl. pass-through — revenue-raden netto; inget falskt exakthetslås över begreppsgränsen); " +
    "LÖNSAMHET: ROE 6,92 % · ROIC 7,79 % mot WACC 7,62 % (gap +0,17 p — KNAPPT positivt; mediekonsensusens vändningsväg) · skatt 23,34 % · räntetäckning 11,69 · D/E 0,25 EXAKT (0,20348/0,811) · current 1,89; kaskaden TTM: netto-M 6,05 % EXAKT < pretax-M 7,91 % < EBIT-M 8,35 %; balansserier M EUR [FY21–FY25]: kassa [271,4 · 252,2 · 206,6 · 307,7 · 260,5] nu 272,5 · skuld [278,8 · 281,8 · 188,8 · 175,9 · 201,8] nu 203,5 · netto [−7,4 · −29,7 · +17,8 · +131,8 · +58,6] nu +69,0 (NETTOKASSA-ÅREN FY23–); " +
    "kandidatur: CELLMOTIVERAD duo enligt U30-mönstret — Spanien/kommunikation-cellens (SISTA SPANSKA 1-GRENEN) två sidor: Cellnex (telekom-tornen — infrastrukturen/rören) + Atresmedia (broadcasting — innehållet/media): SPANSKA BT+PEARSON-MÖNSTRET; P/E-bärarkriteriet kontrollerat FÖRE leverans (TTM-netto 54,68 M EUR > 0 — formellt GRÖN trots kollapsen; Sony/Honda-doktrinen); kommunikation-cellen 1→2, Spanien 7→8 — SPANIEN KOMPLETT PÅ GRENNIVÅ EFTER INLÄGGET; NÄSTA RAPPORT 2026-10-22 BEKRÄFTAD INOM v172-fönstret." }],
  hamtat: "2026-09-25",
  pris: K.prisEUR,
  marknadsKapitalMdr: K.mcap,
  tillvaxt: {
    omsattningCAGR5ar: +R.omsCagr3.toFixed(4),
    resultatCAGR5ar: +R.resCagr3.toFixed(4),
    omsattningTillvaxtTTM: 0.0106,
    prognosTillvaxt: 0.0823,
  },
  lonksamhet: {
    roe: K.roe, roic: K.roic, bruttoMarginal: K.bruttoM, ebitMarginal: K.ebitM,
    nettoMarginal: +R.nettoM.toFixed(4), fcfMarginal: +R.fcfM.toFixed(4),
  },
  stabilitet: {
    skuldEgenkapital: K.de, rantaTackning: K.rantaTackning, fcfPositivaSenaste5: 5,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: 0,
  },
  aterkop: { senasteArMdr: 0.00019, andelUtestande: null, insiderkopSenaste6man: 0 },
  moat: { bruttoMarginalMedel5ar: +R.bruttoMedel.toFixed(4), bruttoMarginalSpread5ar: +R.bruttoSpread.toFixed(4), roeMedel5ar: null },
  vardering: { pe: K.peKalla, pb: K.pb, evEbit: K.evEbit, peg: null, fcfYield: +R.fcfY.toFixed(4), egenKapitalMultipl: K.pb },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2022", "2023", "2024", "2025"],
    omsattning: K.omsSerie.map((x) => x * 1e6),
    resultat: K.resSerie.map((x) => x * 1e6),
    egetKapital: [],
    fcf: K.fcfSerie.map((x) => x * 1e6),
  },
  notering:
    "cellmotiverad duo (Spanien/kommunikation 1→2 — SPANIENS SISTA 1-GREN: Cellnex telekom-tornen + A3M broadcasting-innehållet = SPANSKA BT+PEARSON-MÖNSTRET); kollisionskontroll primär+sekundär GRÖN (A3M/A3M.MC+namn; rond 235:s 404-diagnos: symbolen A3M ej ATR); BME/EUR (CLN.MC-precedensen); kalenderårsbokslut, halvårsrapportering (TTM = jun '26); RAPPDAG 2026-10-22 BEKRÄFTAD INOM v172-fönstret (fjärde bolaget; före superdagen 10-29); FY25-NETTOKOLLAPSEN dokumenterad [118,5 · 112,9 · 171,2 · 120,3 · 62,1] + TTM 54,7 (netto-CAGR −18,1 % ÖPPET); omsättningen FLATT (CAGR +1,0 %); brutto-omklassningen FY25 dokumenterad (content-kostnader; 35,7→24,6 %-raden är standardisering); FCF BÄR BÄTTRE BILD [176 · 105 · 137 · 166 · 92] + TTM 124 identitetslåst ±0,01 (FCF-M 13,76 % > netto-M 6,05 % — amorfteringar); UTDNINGEN SÄNKT −42,65 % (FY24-spike 0,68 extrautdelning → 0,39; 6,70 % EXAKT; payout-källrad n/a NULL — FCF-payout 57,24 % bärarbilden); SEGMENTLÅSET INTERNT: Audiovisual 92 % + Radio + elim = källans segmenttotal ±0,4 M sex fönster (begreppsdifferans ~110/år mot revenue dokumenterad — BBVA-modellen); P/E-familjen 24,05/23,96/24,25; PEG NULL (basblandning extrem: källa 4,14 mot fwd-replik 0,60); fwd P/E 12,43 ⇒ implied +93 % konsensusreferens; ROIC-gap +0,17 p knappt; D/E 0,25 EXAKT · NETTOKASSA +69,0 M; universumets minsta euro-bolag — tröskeln passerad enligt rond 235 (över SWP/HFG/ENEA); dagssvängen +10,44 % · RSI 76 · Planeta-kontrollen (float 43 %, institutioner 4,64 %); EK-serie saknas; alla repliker i paranoid (StockAnalysis BME 2026-09-25)",
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
  if (el[el.length - 1].ticker !== "A3M.MC") { console.error("ABORT: sista raden ≠ A3M.MC"); process.exit(1); }
}
const slut = JSON.parse(readFileSync(UNI, "utf8"));
const forandrade = backup.filter((b, i) => JSON.stringify(b) !== JSON.stringify(slut[i])).length;
if (forandrade !== 0) { console.error(`ABORT: ${forandrade} gamla rader förändrade`); process.exit(1); }

const kvitto = [];
kvitto.push(
  `UNIVERSUM-INLÄGG GRÖN: ${FÖRE}→${slut.length} (+1 Atresmedia A3M.MC, Spanien/kommunikation 1→2; kommunikation-cellen → ${slut.filter((b) => b.bransch === "kommunikation").length}; Spanien → ${slut.filter((b) => b.land === "Spanien").length})`,
  `indent=${indent} · gamla rader förändrade=${forandrade} · läs-tillbaka ×2 OK`,
  `REPLIKER (TRETTON LÅS — NIO EXAKTA): mcap EXAKT · PS EXAKT · P/B 0,3 % · EV 0,08 % · netto-M EXAKT · FCF-M EXAKT · FCF-yield EXAKT · divY EXAKT · D/E EXAKT · payout NULL (källan n/a; sänkningen −42,65 % + FCF-payout 57,24 % dokumenterade) · P/E 0,8 % (EPS-rad grov) · EV/Earnings 0,13 % · EV/Sales EXAKT; P/E-familjen 24,05/23,96/24,25; PEG NULL (basblandning extrem)`,
  `FY25-NETTOKOLLAPSEN dokumenterad: [118,5 · 112,9 · 171,2 · 120,3 · 62,1] + TTM 54,7 (CAGR −18,1 % ÖPPET); omsättning FLATT (CAGR +1,0 %); brutto-omklassningen FY25 dokumenterad`,
  `FCF BÄR BÄTTRE BILD: [176 · 105 · 137 · 166 · 92] + TTM 124 — identitetslåst ±0,01; FCF-M 13,76 % > netto-M 6,05 % (amorfteringar)`,
  `UTDELNINGEN SÄNKT −42,65 % (FY24-spike 0,68 → 0,39; 6,70 % EXAKT) · SEGMENTLÅSET INTERNT: Audiovisual+Radio+elim = segmenttotal ±0,4 M sex fönster (begreppsdifferans ~110/år dokumenterad)`,
  `P/E-BÄRARKONTROLL: TTM-netto 54,68 M EUR > 0 — GRÖN (formellt, trots kollapsen) · RAPPDAG 2026-10-22 BEKRÄFTAD INOM v172-fönstret`,
);
writeFileSync("/tmp/r236-inlagg.txt", kvitto.join("\n"));
console.log(kvitto.join("\n"));
