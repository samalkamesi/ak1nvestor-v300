#!/usr/bin/env node
/**
 * _r228-u31-universum-inlagg.mjs — v173 dataset-djup rond 228 U31 (+1):
 * Pearson plc PSON.L (Storbritannien/kommunikation 1→2) — cellmotiverad duo:
 * BT (nätinfrastruktur: fast bredband + EE-mobil — kommunikationens RÖR) +
 * Pearson (kunskapsinnehåll: utbildningsförlag — kommunikationens INNEHÅLL).
 * Kollisionskontroll primär+sekundär (AZN-läxan: PSON.L/PSON/PSO+namn+URL)
 * GRÖN. P/E-bärarkontroll FÖRE leverans: TTM-netto 319 M GBP > 0 — GRÖN
 * (VOD −397 M EUR FY26 och WPP −240 M GBP TTM bägge P/E-döda — rond 228-sonden).
 * SEGMENTLÅSET I FEM DELAR: fem produktsegment = totalen EXAKT FY2024–FY2025
 * + TTM (FY23 diff 9 M = 0,25 % dokumenterad källavvikelse; FY22–FY21
 * fragmenterade — ELS-segmentet tillkom FY23). FCF-SPEGELN [304 · 495 · 594
 * · 627] + TTM 765 DUBBELT låst; marginalen 7,92 → 17,53 → 21,05 %.
 * Kvitto: /tmp/r228-inlagg.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const FÖRE = u.length;
if (u.some((b) => ["PSON.L", "PSON", "PSO"].includes(b.ticker) || /pearson/i.test(b.namn ?? "") || (b.kallor?.[0]?.url ?? "").includes("/lon/PSON/"))) {
  console.error("ABORT: PSON.L finns redan på disken");
  process.exit(1);
}

const K = {
  prisGBX: 1212.5, aktierMdr: 0.60114, mcap: 7.29, eps: 0.50, peKalla: 24.21,
  fwdPe: 16.20, pb: 2.17, psKalla: 2.01, evKalla: 8.73,
  evEarnings: 27.36, evSales: 2.40, evEbit: 16.91, pFcf: 9.53, pocf: 9.04,
  roe: 0.0916, roic: 0.0771, roce: 0.0980, wacc: 0.0395,
  ebitM: 0.1412, pretaxM: 0.1222, bruttoM: 0.5204,
  nettoTtm: 0.319, revTtm: 3.63, fcfTtm: 0.765,                    // GBP (statistikpanelen)
  skuld: 1.76, ek: 3.36, kassa: 0.339, de: 0.52, rantaTackning: 6.04,
  div: 0.252, divYieldKalla: 0.0208, payoutKalla: 0.4953,
  // GBP-serier, dec-slut FY2022–FY2025 (4 år, SN-mallens seriefönster)
  omsSerie: [3841, 3674, 3552, 3577],
  resSerie: [242, 378, 434, 335],
  fcfSerie: [304, 495, 594, 627],
  ocfSerie: [361, 525, 627, 656], ocfTtm: 806,
  capexSerie: [57, 30, 33, 29], capexTtm: 41,
  fcfMarginSerie: [0.0792, 0.1347, 0.1672, 0.1753],   // källans egna rader — tvärverifiering
  bruttoSerie: [0.4904, 0.4673, 0.4995, 0.5098, 0.5200],  // FY2021–FY2025
  dpsSerie: [0.205, 0.215, 0.227, 0.240, 0.252],      // FY2021–FY2025; current 0,252 GBP
  // Segment [TTM · FY25 · FY24 · FY23 · FY22 · FY21], M GBP (null = ej rapporterat)
  assessment: [1605, 1604, 1591, 1559, 1444, 1238],
  virtualLearning: [549, 511, 489, 616, 820, 713],
  english: [400, 405, 420, 415, 321, 238],
  enterprise: [292, 282, 271, 269, null, null],
  higherEd: [788, 775, 781, 806, 898, 849],
  segTotal: [3634, 3577, 3552, 3674, 3841, 3428],
};
const R = {
  mcapReplik: (K.aktierMdr * K.prisGBX) / 100,
  pePrisEps: K.prisGBX / 100 / K.eps,
  peGaap: K.mcap / K.nettoTtm,
  evReplik: K.mcap + K.skuld - K.kassa,
  nettoM: K.nettoTtm / K.revTtm,
  fcfM: K.fcfTtm / K.revTtm,
  fcfY: K.fcfTtm / K.mcap,
  divY: (K.div * 100) / K.prisGBX,
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
  payoutReplik: K.div / K.eps,
  epsBeraknad: K.nettoTtm / K.aktierMdr,
};
const avv = (a, b) => Math.abs(a / b - 1);
const exakt = [
  ["mcap", R.mcapReplik, K.mcap, 0.02],
  ["ps", R.psReplik, K.psKalla, 0.02],
  ["pb", R.pbReplik, K.pb, 0.02],
  ["ev-dekomposition", R.evReplik, K.evKalla, 0.02],
  ["nettoM mot källans rad", R.nettoM, 0.0878, 0.02],
  ["fcfM mot källans rad", R.fcfM, 0.2105, 0.02],
  ["fcfY mot källrad", R.fcfY, 0.1050, 0.02],
  ["divYield mot källrad", R.divY, K.divYieldKalla, 0.02],
  ["de", R.deReplik, K.de, 0.02],
  ["payout", R.payoutReplik, K.payoutKalla, 0.02],
  ["pe pris/EPS", R.pePrisEps, K.peKalla, 0.02],
  ["evEarnings", R.evEarningsReplik, K.evEarnings, 0.02],
  ["evSales", R.evSalesReplik, K.evSales, 0.02],
];
const fel = exakt.filter(([n, r, k, tol]) => avv(r, k) > tol);
if (fel.length) {
  console.error("ABORT: replik utanför tolerans: " + fel.map(([n, r, k]) => `${n} ${r.toFixed(4)} vs ${k}`).join("; "));
  process.exit(1);
}
// P/E-familjen dokumenterad (källans EPS-rad 0,50 mot beräknad 0,531 — vägd aktiebas 638 M mot utestående 601 M)
if (!(R.peGaap < K.peKalla && R.peGaap > 22 && R.peGaap < 23)) {
  console.error(`ABORT: P/E-familjen utanför dokumenterat spann (GAAP ${R.peGaap.toFixed(2)})`);
  process.exit(1);
}
const fcfIdent = [];
for (let i = 0; i < 4; i++) fcfIdent.push([K.ocfSerie[i] - K.capexSerie[i], K.fcfSerie[i], K.fcfMarginSerie[i] * K.omsSerie[i]]);
fcfIdent.push([K.ocfTtm - K.capexTtm, 765, 0.2105 * K.revTtm]);
if (fcfIdent.slice(0, 4).some(([a, b, m]) => Math.abs(a - b) > 0.001 || Math.abs(m - b) > 0.002 * b)) {
  console.error("ABORT: FCF-serien ej OCF−capex-/marginalradslåst: " + fcfIdent.map(([a, b]) => `${a}≠${b}`).join("; "));
  process.exit(1);
}
const stigande = K.fcfSerie.every((x, i) => i === 0 || x > K.fcfSerie[i - 1]);
if (!stigande || !(765 > K.fcfSerie[3])) { console.error("ABORT: FCF-serien ej stigande genom serien+TTM"); process.exit(1); }
const segNycklar = ["assessment", "virtualLearning", "english", "enterprise", "higherEd"];
const segSum = K.segTotal.map((x, i) => [segNycklar.reduce((s, k) => s + (K[k][i] ?? 0), 0), x]);
// Exakta fönster: TTM, FY25, FY24 (FY23 diff 9 M dokumenteras; FY22/FY21 fragmenterade — ELS tillkom FY23)
const exaktaSeg = [0, 1, 2].filter((i) => segSum[i][0] === segSum[i][1]).length;
const fy23Diff = Math.abs(segSum[3][0] - segSum[3][1]);
if (exaktaSeg !== 3 || fy23Diff !== 9) {
  console.error("ABORT: segmentlåset bruten: " + segSum.map(([s, x]) => `${s}≠${x}`).join("; "));
  process.exit(1);
}
if (K.nettoTtm <= 0) { console.error("ABORT: P/E-bärarkontroll — TTM-netto ≤ 0"); process.exit(1); }
if (!(R.nettoM < K.pretaxM && K.pretaxM < K.ebitM)) { console.error("ABORT: normal kaskad bruten (engångskontrollen)"); process.exit(1); }

const RAD = {
  ticker: "PSON.L",
  namn: "Pearson plc",
  bransch: "kommunikation",
  land: "Storbritannien",
  valuta: "GBP",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-25", url: "https://stockanalysis.com/quote/lon/PSON/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/)", paranoid:
    "LSE-PRIMÄRNOTING (underlag S&P Global Market Intelligence via StockAnalysis; senaste handelsdag 2026-09-24, hämtat 2026-09-25 — föregående close 1 203,00 · dagsspann [efter handelsdag] · 52v 874,80–1 337,00 (priset +17,38 % på 52v — MITT I SPANNET, ej botten); färskhämtning med FYRA paneler (quote/statistics/financials/cash-flow); KALENDERÅRSBOKSLUT (31 dec; TTM-fönstret = jun '26 efter H1-rapporten 2026-08-06 — HALVÅRSRAPPORTERING; nästa rappdag est. 2026-10-12 enligt statistics-panelen — FÖRE v172-fönstret 10-20→11-04); GBP-RAPPORTVALUTA + GBX-NOTING (BT.L-precedensen, samma kombination): prisfältet i PENCE, mcap/aktier/statistik-yield i GBP, SERIER/DPS i GBP (ingen valutabrygga behövs — ren GBP-genomgång): " +
    "pris 12,125 GBP (1 212,5 GBp; beta −0,03 — lägre volatilitet än marknaden), mcap 7,29 mdr GBP på 0,60114 mdr aktier (replik 0,60114 × 12,125 = 7,289 — EXAKT), " +
    "P/E-FAMILJEN DOKUMENTERAD: källrad 24,21 · GAAP 7,29/0,319 = 22,85 · pris/EPS 12,125/0,50 = 24,25 (0,2 % mot källraden — LÅST); källans EPS-rad 0,50 mot beräknad netto/aktier 0,531 (6 % — vägd aktiebas 638 M mot utestående 601 M: återköpen −5,85 % YoY förklarar; fälten = källrader); fwd P/E 16,20 ⇒ implied EPS +49 % (turnaround-konsensus — referens, ALDRIG löfte); PEG-källrad 1,62 med oklar bas (24,21/1,62 = 14,9 % mot konsensus 3Y EPS 11,38 %) ⇒ fältet NULL (basblandning vägras — SN.L-precedensen); PS 2,01 EXAKT (7,29/3,63) · P/B 2,17 (7,29/3,36 — 0,0 %) · P/FCF 9,53 · P/OCF 9,04; " +
    "EV-DEKOMPOSITION: 7,29 + 1,76 − 0,339 = 8,711 mot källans 8,73 (0,2 %) — NETTO-SKULD −1,42 mdr GBP (−2,37/aktie); EV/Earnings 27,36 EXAKT (8,73/0,319) · EV/Sales 2,40 EXAKT (8,73/3,63 = 2,405) · EV/EBIT 16,91 · EV/EBITDA 13,61; " +
    "SEGMENTLÅSET I FEM DELAR: Assessment & Qualifications [1 605 · 1 604 · 1 591 · 1 559 · 1 444 · 1 238] + Virtual Learning [549 · 511 · 489 · 616 · 820 · 713] + English Language Learning [400 · 405 · 420 · 415 · 321 · 238] + Enterprise Learning & Skills [292 · 282 · 271 · 269 · — · —] + Higher Education [788 · 775 · 781 · 806 · 898 · 849] = totalen EXAKT FY2024–FY2025 SAMT TTM (fyra exakta fönster; FY23 diff 9 M = 0,25 % — källans segmentsumma låser inte exakt det året, dokumenterad avvikelse; FY22–FY21 fragmenterade: ELS-segmentet tillkom FY23); A&Q = STÖRSTA SEGMENTET 1 605 TTM (44 % av omsättningen) — prov- och kvalifikationsverksamheten (både organisk volym och konsumentcykeln); Virtual Learning DALAR [820 → 489] sedan pandemintoppen FY22 (distansplattformarnas normalisering) medan ELL växer [238 → 405]; " +
    "FCF-SPEGELN [304 · 495 · 594 · 627] + TTM 765 M GBP — DUBBELT låst (OCF−capex exakt fem fönster [361−57 · 525−30 · 627−33 · 656−29 · 806−41] + källans marginalrader exakta mot omsättningen); marginalen 7,92 → 13,47 → 16,72 → 17,53 → TTM 21,05 % — KAPITALSNÅLA MODELLEN: capex 41 M på 3 634 M omsättning = 1,1 % (förlagsmodellen utan fabrik); FCF-yield 10,50 % EXAKT (0,765/7,29); FCF-CAGR +27,3 % (FY22→FY25); " +
    "RESULTATPROFILEN: netto [242 · 378 · 434 · 335] + TTM 319 (FY25-dippet −23 % efter FY23–24-topparna; CAGR +11,4 % FY22→FY25); EPS [0,33 · 0,53 · 0,64 · 0,51] + TTM 0,50; bruttomarginal [49,04 · 46,73 · 49,95 · 50,98 · 52,00] % FY21–FY25 (medel 49,74 %, spridning 5,27 pp — digitaliseringens glidning uppåt); " +
    "ENGÅNGSKONTROLLEN PER FÖNSTER: NORMAL KASKAD i TTM (netto-M 8,78 < pretax-M 12,22 < EBIT-M 14,12 — inga engångsposter); " +
    "UTDELNING + ÅTERKÖP = TVÅ BEN: DPS [0,205 · 0,215 · 0,227 · 0,240 · 0,252] — HÖJD VARJE ÅR (+4,9 % senaste; FEM raka höjningar); current 0,252 GBP/år (2,08 % EXAKT replik 25,2/1 212,5); payout-källrad 49,53 % (replik 0,252/0,50 = 50,4 %, 1,7 %) · FCF-payout 20,12 %; ÅTERKÖPEN TRIPPLAR UTDELNINGEN: Repurchase of Common Stock TTM −546 M GBP [−16 · −353 · −186 · −318 · −352] mot utdelning −158 M — aktieantal −5,85 % YoY = buyback-yield 5,85 % EXAKT · shareholder yield 7,92 % · nyemissioner 0; " +
    "STABILITETEN: D/E 0,52 EXAKT (1,76/3,36) · räntetäckning 6,04 · Debt/EBITDA 2,76 · current ratio 2,00 · Altman 2,42 (GRÅ ZON — under 3, dokumenterad: återköpsfinansierad nettoskuld) · Piotroski 6 · ROE 9,16 % · ROIC 7,71 % mot WACC 3,95 % (gap +3,76 p — positivt kapitalvärdeskapande) · skattesats 28,15 % · institutionsägande 87,62 % · insiders 0,34 %; balansserier [FY21–FY25]: kassa [937 · 558 · 312 · 543 · 333] · skuld [1 434 · 1 295 · 1 204 · 1 530 · 1 484] · netto [−497 · −737 · −892 · −987 · −1 151] — NETTOSKULDEN VÄXER FY23→FY25 (−892 → −1 151) MEDAN FC F ökar: återköpsintensiteten finansieras med skuld (dokumenterad policy, ej nöd); " +
    "kandidatur: CELLMOTIVERAD duo enligt U30-mönstret — Storbritannien/kommunikation-cellens TVÅ sidor: BT (nätinfrastruktur: fast bredband + EE-mobil — RÖREN) + Pearson (kunskapsinnehåll: utbildningsförlag — INNEHÅLLET SOM FÄRDAS I RÖREN; Publishing-industri = Communication Services i källans klassning); VOD/WPP bägge P/E-döda på färskt TTM (VOD FY26 −397 M EUR; WPP −240 M GBP — rond 228-sonden dokumenterad) ⇒ Pearson bär cellens andra P/E; RELX förbigången med dokumenterad orsak (källan klassar Industrials/Specialty Business Services — fel cell); AAF förbigången (Bharti-familjen = BHARTIARTL.NS/Indien — AZN-läxan); P/E-bärarkriteriet kontrollerat FÖRE leverans (TTM-netto 319 M GBP > 0; Sony/Honda-doktrinen); kommunikation-cellen 1→2 (30→31 bolag? nej — kommunikation-grenen), Storbritannien 16→17; NÄSTA RAPPORT est. 2026-10-12 (FÖRE v172-fönstret — notis vid kalenderberöring)." }],
  hamtat: "2026-09-25",
  pris: K.prisGBX,
  marknadsKapitalMdr: K.mcap,
  tillvaxt: {
    omsattningCAGR5ar: +R.omsCagr3.toFixed(4),
    resultatCAGR5ar: +R.resCagr3.toFixed(4),
    omsattningTillvaxtTTM: 0.0159,
    prognosTillvaxt: 0.044,
  },
  lonksamhet: {
    roe: K.roe, roic: K.roic, bruttoMarginal: K.bruttoM, ebitMarginal: K.ebitM,
    nettoMarginal: +R.nettoM.toFixed(4), fcfMarginal: +R.fcfM.toFixed(4),
  },
  stabilitet: {
    skuldEgenkapital: K.de, rantaTackning: K.rantaTackning, fcfPositivaSenaste5: 5,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: 0,
  },
  aterkop: { senasteArMdr: 0.546, andelUtestande: K.payoutKalla, insiderkopSenaste6man: 0 },
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
    "cellmotiverad duo (Storbritannien/kommunikation 1→2: BT nätinfrastruktur/fast+bredband+EE-mobil + Pearson kunskapsinnehåll/utbildningsförlag — kommunikationens RÖR mot dess INNEHÅLL); kollisionskontroll primär+sekundär GRÖN (PSON.L/PSON/PSO+namn+URL — AZN-läxan); VOD/WPP bägge P/E-döda på färskt TTM (VOD FY26 −397 M EUR · WPP −240 M GBP — rond 228-sonden), RELX fel cell (källan: Industrials), AAF Bharti-familjen — Pearson bär; LSE-primär, GBP-rapportvaluta + GBX-noting enl. BT.L-precedensen (ren GBP-genomgång); kalenderårsbokslut, HALVÅRSRAPPORTERING (TTM = jun '26; nästa rappdag est. 2026-10-12 FÖRE v172-fönstret); SEGMENTLÅSET I FEM DELAR: fem produktsegment = totalen EXAKT FY2024–FY2025 + TTM (FY23 diff 0,25 % dokumenterad; FY22–FY21 fragmenterade — ELS tillkom FY23); A&Q störst 1 605 (44 %); FCF-SPEGELN [304 · 495 · 594 · 627] + TTM 765 DUBBELT låst (OCF−capex + marginalrader), marginalen 7,92→21,05 % — KAPITALSNÅLA MODELLEN (capex 1,1 % av omsättningen); P/E-familjen 24,21/22,85/24,25 dokumenterad (EPS-raden bär vägd aktiebas 638 M mot utestående 601 M — återköpen); PEG NULL (basblandning); UTDELNINGEN HÖJD varje år [0,205→0,252], current 0,252 GBP (2,08 % EXAKT); återköpen tripplar utdelningen (TTM −546 M mot −158 M; aktieantal −5,85 % = buyback-yield EXAKT); D/E 0,52 EXAKT; Altman 2,42 GRÅ ZON (dokumenterad) · Piotroski 6; ROIC 7,71 % mot WACC 3,95 % gap +3,76 p; nettoskulden växer med återköpen (−892→−1 151 FY23→FY25, dokumenterad policy); bruttomarginal-medel 49,7 % spridning 5,27 pp; EK-serie saknas; alla repliker i paranoid (StockAnalysis LON 2026-09-25)",
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
  if (el[el.length - 1].ticker !== "PSON.L") { console.error("ABORT: sista raden ≠ PSON.L"); process.exit(1); }
}
const slut = JSON.parse(readFileSync(UNI, "utf8"));
const forandrade = backup.filter((b, i) => JSON.stringify(b) !== JSON.stringify(slut[i])).length;
if (forandrade !== 0) { console.error(`ABORT: ${forandrade} gamla rader förändrade`); process.exit(1); }

const kvitto = [];
kvitto.push(
  `UNIVERSUM-INLÄGG GRÖN: ${FÖRE}→${slut.length} (+1 Pearson PSON.L, Storbritannien/kommunikation 1→2; kommunikation-cellen → ${slut.filter((b) => b.bransch === "kommunikation").length}; Storbritannien → ${slut.filter((b) => b.land === "Storbritannien").length})`,
  `indent=${indent} · gamla rader förändrade=${forandrade} · läs-tillbaka ×2 OK`,
  `REPLIKER (TRETTON LÅS): mcap ${R.mcapReplik.toFixed(3)} (7,29) EXAKT · PS ${R.psReplik.toFixed(3)} (2,01) · P/B ${R.pbReplik.toFixed(3)} (2,17) · EV ${R.evReplik.toFixed(4)} (8,73) 0,2 % · netto-M ${(R.nettoM * 100).toFixed(2)} % · FCF-M ${(R.fcfM * 100).toFixed(2)} % · fcfY ${(R.fcfY * 100).toFixed(2)} % EXAKT · divY ${(R.divY * 100).toFixed(2)} % · D/E ${R.deReplik.toFixed(3)} EXAKT · payout 1,7 % · P/E pris/EPS 0,2 % · EV/Earnings ${R.evEarningsReplik.toFixed(2)} EXAKT · EV/Sales EXAKT; P/E-familjen 24,21/22,85/24,25 dokumenterad`,
  `SEGMENTLÅSET I FEM DELAR: fem produktsegment = totalen EXAKT TTM+FY25+FY24 (tre exakta fönster); FY23 diff 9 M (0,25 %) dokumenterad; FY22–FY21 fragmenterade (ELS tillkom FY23); A&Q störst 1 605 (44 %)`,
  `FCF-SPEGELN: [304 · 495 · 594 · 627] + TTM 765 — DUBBELT låst (OCF−capex + marginalrader); marginal 7,92→21,05 %; kapitalsnåla modellen (capex 1,1 %)`,
  `ENGÅNGSKONTROLLEN: normal kaskad TTM (8,8 < 12,2 < 14,1) · oms-CAGR ${(R.omsCagr3 * 100).toFixed(2)} % (FY22-toppen 3 841) · res-CAGR +${(R.resCagr3 * 100).toFixed(2)} % · FCF-CAGR +${(R.fcfCagr3 * 100).toFixed(1)} %`,
  `UTDELNINGEN HÖJD varje år [0,205→0,252] (+4,9 % senaste) · current 0,252 GBP (2,08 % EXAKT) · återköp TTM −546 M (aktieantal −5,85 % EXAKT) · Altman 2,42 GRÅ ZON · ROIC-gap +3,76 p`,
  `P/E-BÄRARKONTROLL: TTM-netto 319 M GBP > 0 — GRÖN · VOD (−397 M EUR) och WPP (−240 M GBP) avvisade dokumenterat · rappdag est. 2026-10-12 (FÖRE v172-fönstret)`,
);
writeFileSync("/tmp/r228-inlagg.txt", kvitto.join("\n"));
console.log(kvitto.join("\n"));
