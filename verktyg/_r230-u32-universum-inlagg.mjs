#!/usr/bin/env node
/**
 * _r230-u32-universum-inlagg.mjs — v173 dataset-djup rond 230 U32 (+1):
 * Enbridge Inc ENB (Kanada/energi 1→2) — cellmotiverad duo: CNQ (upstream-
 * producent: oljesand — BRUNNEN) + ENB (midstream: rörledningar — RÖRET) =
 * producent/transportören, E.ON/RWE + INPEX/Tokyo Gas-mönstret.
 * TSX/CAD-precedensen (BCE/NTR). Kollisionskontroll primär+sekundär GRÖN
 * (ENB/ENB.TO+namn+URL). P/E-bärarkontroll FÖRE leverans: TTM-netto
 * 5 673 M CAD > 0 — GRÖN. SEGMENTLÅSET I FEM DELAR: fem segment = totalen
 * EXAKT TTM+FY2022–FY2025 (FEM exakta fönster; FY21 fragmenterat — Liquids-
 * raden startar FY22 i källans vy). FCF-KOLLAPSEN dokumenterad (NG.L-
 * precedensen): capex 4,6→10,8 mdr = rörbyggnadsprogram; utdelning 8,3 mdr
 * mot FCF 1,7 mdr = skuldfinansierad reglerad modell, 23 raka höjningar.
 * Tre källposter bär sammansatta baser (dokumenterade toleranser): EV (5 % —
 * preferenskapital+minoriteter), netto-M (8 % — minoritetsbasen), payout
 * (6 % — totalutdelningsbasen). Kvitto: /tmp/r230-inlagg.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const FÖRE = u.length;
if (u.some((b) => ["ENB", "ENB.TO"].includes(b.ticker) || /enbridge/i.test(b.namn ?? "") || (b.kallor?.[0]?.url ?? "").includes("/tsx/ENB/") || (b.kallor?.[0]?.url ?? "").includes("/ENB/"))) {
  console.error("ABORT: ENB finns redan på disken");
  process.exit(1);
}

const K = {
  prisCAD: 66.99, aktierMdr: 2.23, mcap: 150.38, eps: 2.59, peKalla: 26.05,
  fwdPe: 22.24, pb: 2.18, psKalla: 1.80, evKalla: 270.79,
  evEarnings: 47.73, evSales: 3.24, evEbit: 19.74, pFcf: 90.16, pocf: 12.10,
  roe: 0.0922, roic: 0.0519, roce: 0.0563, wacc: 0.0640,
  ebitM: 0.1396, pretaxM: 0.0958, bruttoM: 0.3259,
  nettoTtm: 5.673, revTtm: 83.49, fcfTtm: 1.668,                  // CAD mdr (statistikpanelen)
  skuld: 112.20, ek: 68.85, kassa: 2.10, de: 1.63, rantaTackning: 2.27,
  div: 3.88, divYieldKalla: 0.0579, payoutKalla: 1.4317,
  // CAD-serier, dec-slut FY2022–FY2025
  omsSerie: [53309, 43649, 53473, 65194],
  resSerie: [2589, 5839, 5053, 7044],
  fcfSerie: [6583, 9547, 5889, 3297],
  ocfSerie: [11230, 14201, 12600, 12270], ocfTtm: 12432,
  capexSerie: [4647, 4654, 6711, 8973], capexTtm: 10764,
  bruttoSerie: [0.3883, 0.4700, 0.4609, 0.4167],   // FY22–FY25 = bruttovinst/oms (källrad TTM 32,59 % dokumenterad separat)
  dpsSerie: [3.4426, 3.53, 3.62, 3.71],            // APPROX — se PARANOID: källan redovisar DPS current 3,88 + tillväxt 2,94 %; totala utdelningar används i låsen
  // Segment [TTM · FY25 · FY24 · FY23 · FY22], M CAD (FY21 fragmenterat: Liquids+E&O saknas)
  liquids: [63606, 45944, 38183, 29882, 37174],
  gasTrans: [6834, 6652, 6199, 5854, 5426],
  gasDist: [11171, 10654, 7542, 5976, 6729],
  renew: [634, 561, 514, 477, 582],
  elim: [1246, 1383, 1035, 1460, 3398],
  segTotal: [83491, 65194, 53473, 43649, 53309],
};
const R = {
  mcapReplik: (K.aktierMdr * K.prisCAD),
  pePrisEps: K.prisCAD / K.eps,
  peGaap: K.mcap / K.nettoTtm,
  evReplik: K.mcap + K.skuld - K.kassa,
  nettoM: K.nettoTtm / K.revTtm,
  fcfM: K.fcfTtm / K.revTtm,
  fcfY: K.fcfTtm / K.mcap,
  divY: K.div / K.prisCAD,
  omsCagr3: Math.pow(K.omsSerie[3] / K.omsSerie[0], 1 / 3) - 1,
  resCagr3: Math.pow(K.resSerie[3] / K.resSerie[0], 1 / 3) - 1,
  fcfCagr3: Math.pow(K.fcfSerie[3] / K.fcfSerie[0], 1 / 3) - 1,
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
  ["ev-dekomposition (dokum. tolerans: preferens+NCI)", R.evReplik, K.evKalla, 0.05],
  ["nettoM mot källans rad (dokum. tolerans: minoritetsbas)", R.nettoM, 0.0734, 0.08],
  ["fcfM mot källans rad", R.fcfM, 0.0200, 0.02],
  ["fcfY mot källrad", R.fcfY, 0.0111, 0.02],
  ["divYield mot källrad", R.divY, K.divYieldKalla, 0.02],
  ["de", R.deReplik, K.de, 0.02],
  ["payout (dokum. tolerans: totalutdelningsbas)", R.payoutReplik, K.payoutKalla, 0.06],
  ["pe pris/EPS", R.pePrisEps, K.peKalla, 0.02],
  ["evEarnings", R.evEarningsReplik, K.evEarnings, 0.02],
  ["evSales", R.evSalesReplik, K.evSales, 0.02],
];
const fel = exakt.filter(([n, r, k, tol]) => avv(r, k) > tol);
if (fel.length) {
  console.error("ABORT: replik utanför tolerans: " + fel.map(([n, r, k, t]) => `${n} ${r.toFixed(4)} vs ${k} (tol ${(t * 100).toFixed(0)} %)`).join("; "));
  process.exit(1);
}
// P/E-familjen dokumenterad (källans EPS-rad 2,59 mot beräknad 2,544 — aktieavrundning)
if (!(R.peGaap > K.peKalla - 1 && R.peGaap < K.peKalla + 1)) {
  console.error(`ABORT: P/E-familjen utanför dokumenterat spann (GAAP ${R.peGaap.toFixed(2)})`);
  process.exit(1);
}
// FCF-IDENTITET (dubbellås) + dokumenterad KOLLAPS (NG.L-precedensen — rund 223):
const fcfIdent = [];
for (let i = 0; i < 4; i++) fcfIdent.push([K.ocfSerie[i] - K.capexSerie[i], K.fcfSerie[i]]);
fcfIdent.push([K.ocfTtm - K.capexTtm, 1668]);
if (fcfIdent.some(([a, b]) => Math.abs(a - b) > 0.001)) {
  console.error("ABORT: FCF-serien ej OCF−capex-låst: " + fcfIdent.map(([a, b]) => `${a}≠${b}`).join("; "));
  process.exit(1);
}
const kollaps = K.fcfSerie[3] < K.fcfSerie[1] && 1668 < K.fcfSerie[3];  // FY23-toppen → FY25 → TTM fallande
if (!kollaps) { console.error("ABORT: FCF-kollapsen ej som dokumenterad (NG.L-mönstret förväntat)"); process.exit(1); }
const segNycklar = ["liquids", "gasTrans", "gasDist", "renew", "elim"];
const segSum = K.segTotal.map((x, i) => [segNycklar.reduce((s, k) => s + K[k][i], 0), x]);
if (!segSum.every(([s, x]) => s === x)) {
  console.error("ABORT: segmentlåset bruten: " + segSum.map(([s, x]) => `${s}≠${x}`).join("; "));
  process.exit(1);
}
if (K.nettoTtm <= 0) { console.error("ABORT: P/E-bärarkontroll — TTM-netto ≤ 0"); process.exit(1); }
if (!(R.nettoM < K.pretaxM && K.pretaxM < K.ebitM)) { console.error("ABORT: normal kaskad bruten (engångskontrollen)"); process.exit(1); }

const RAD = {
  ticker: "ENB",
  namn: "Enbridge Inc.",
  bransch: "energi",
  land: "Kanada",
  valuta: "CAD",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-25", url: "https://stockanalysis.com/quote/tsx/ENB/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/)", paranoid:
    "TSX-PRIMÄRNOTING (underlag S&P Global Market Intelligence via StockAnalysis; senaste handelsdag 2026-09-24, hämtat 2026-09-25 — close 66,99 CAD · −0,71 %; 52v: pris −2,40 %, spannet dokumenterat i 50/200-dagars MA 71,96/72,26 — priset UNDER båda glidande medel; RSI 34; short 2,92 %); färskhämtning med FYRA paneler (quote/statistics/financials/cash-flow); KALENDERÅRSBOKSLUT (31 dec; TTM-fönstret = jun '26 efter Q2-rapporten 2026-08 — KVARTALSVIS rapportering; NÄSTA RAPPDAG est. 2026-11-02 INOM v172-fönstret 10-20→11-04 — KALENDERNOTIS); TSX/CAD-PRECEDENSEN (BCE/NTR-klassen; RY/CNQ:s USD/NYSE-pris dokumenterad som HISTORISK AVVIKELSE i cellen — ENB bär primärbörsens CAD): " +
    "pris 66,99 CAD (beta 0,77), mcap 150,38 mdr CAD på 2,23 mdr aktier (replik 2,23×66,99 = 149,39 — 0,7 %, aktieavrundning), " +
    "P/E-FAMILJEN DOKUMENTERAD: källrad 26,05 · GAAP 150,38/5,673 = 26,51 · pris/EPS 66,99/2,59 = 25,87 (källradens EPS 2,59 mot beräknad netto/aktier 2,544 — aktieavrundning; fälten = källrader); fwd P/E 22,24 ⇒ implied EPS +17 % (konsensusreferens); PEG-källrad 7,67 (basblandning vägras — fältet NULL); PS 1,80 EXAKT (150,38/83,49) · P/B 2,18 EXAKT (150,38/68,85) · P/FCF 90,16 · P/OCF 12,10; " +
    "EV-DEKOMPOSITION MED DOKUMENTERAD DIFFERENS: 150,38 + 112,20 − 2,10 = 260,48 mot källans 270,79 (3,8 %) — DIFFERENSEN = PREFERENSKAPITAL + MINORITETSINTRESSEN som källans EV inkluderar; preferensutdelningen −425 M CAD/år syns i cashflow-panelen (≈7,7 mdr preferens vid 5,5 %); EV/Earnings 47,73 EXAKT (270,79/5,673) · EV/Sales 3,24 EXAKT (270,79/83,49 = 3,2435) · EV/EBIT 19,74 · EV/EBITDA 13,86; NETTO-SKULD −110,10 mdr CAD (−49,40/aktie — universumets största i absoluta tal); " +
    "SEGMENTLÅSET I FEM DELAR — FEM EXAKTA FÖNSTER: Liquids Pipelines [63 606 · 45 944 · 38 183 · 29 882 · 37 174] + Gas Transmission [6 834 · 6 652 · 6 199 · 5 854 · 5 426] + Gas Distribution & Storage [11 171 · 10 654 · 7 542 · 5 976 · 6 729] + Renewable Power [634 · 561 · 514 · 477 · 582] + Eliminations & Other [1 246 · 1 383 · 1 035 · 1 460 · 3 398] = totalen EXAKT SAMTLIGA TTM+FY2022–FY2025 (FY21 fragmenterat: Liquids- och E&O-raderna startar FY22 i källans standardiserade vy — dokumenterat); LIQUIDS = ryggraden 63 606 TTM (76 % — Mainline-rörens volymkraft, FY23-dipen 29 882 = prisnormalisering); GAS DISTRIBUTION fördubblad [4 980 → 10 654] på Dominion-förvärvet 2024 (amerikansk gasdistribution-konsolidering); " +
    "FCF-KOLLAPSEN DOKUMENTERAD (NG.L-PRECEDENSEN rond 223): capex [−4 647 · −4 654 · −6 711 · −8 973] · TTM −10 764 — MER ÄN FÖRDOBLAT FY23→TTM = rörbyggnadsprogrammet (Mainline-utbyggnad + gasinvesteringar); FCF [6 583 · 9 547 · 5 889 · 3 297] + TTM 1 668 — identitetslåst exakt fem fönster (OCF−capex: [11 230−4 647 · 14 201−4 654 · 12 600−6 711 · 12 270−8 973 · 12 432−10 764]); OCF-STABIL [9 256 · 11 230 · 14 201 · 12 600 · 12 270] TTM 12 432 — DRIFTSIDAN BÄR, BYGGSIDAN ÄTER; FCF-yield 1,11 % EXAKT; FCF-CAGR −20,6 % (kollapsen); " +
    "UTDELNINGEN = DEN REGGLERADE MODELLNS LIVSNERV: Common Dividends [−6 766 · −6 968 · −7 276 · −7 875 · −8 220] TTM −8 347 — 23 RAKA HÖJNINGSÅR (+2,94 % senaste); current 3,88 CAD/aktie (5,79 % EXAKT replik 3,88/66,99); PAYOUT-KÄLLRAD 143,17 % (bas: totalutdelning 8 347/konsoliderat netto 5 830 — dokumenterad); pris/EPS-replik 149,8 %; FCF-PAYOUT 518,46 % — utdelningen överskrider FCF 5× (skuldfinansierad reglerad modell: räntebärande tillgångar byggs med skuld medan utdelningen hålls — NG.L/Redeia-klassen dokumenterad); preferensutdelning −425 M/år utöver; " +
    "STABILITET: D/E 1,63 EXAKT (112,20/68,85) · Debt/EBITDA 6,42 · räntetäckning 2,27 · current ratio 0,72 (låg — infrastruktur-kassaflödesmodellen) · NETTOSKULD-SERIEN [−76 214 · −80 283 · −76 540 · −101 137 · −105 199] nu −110 100 (Dominion-förvärvet 2024 syns i hoppet) · NYEMISSIONER FY2023 (+4 450) och FY2024 (+2 485) = Dominion-gasdistributionen betalades delvis med aktier (aktieantal +0,14 % YoY — ingen återköpsprofil: buyback-yield −0,14 %; återköpen små [−125 · −151]) · Altman 0,93 (DJUP GRÅ ZON — dokumenterad: skuldfinansierad reglerad infrastruktur med låg FCF under byggprogrammet; NG.L-klassens låga Altman är modellens natur, ej nöd — räntetäckningen 2,27 och OCF-stabiliteten bär) · Piotroski 5 · ROE 9,22 % · ROIC 5,19 % mot WACC 6,40 % (gap −1,21 p — REGGLERADE NÄTVERKETS AVKASTNINGSFORMULA: tillåten avkastning på rättdragen bas, inte marknadsmoat — E.ON/Redeia/NG.L-klassen dokumenterad) · skattesats 20,89 % · institutionsägande 50,28 % (lågt — retail-aktien); " +
    "RESULTATPROFILEN: oms [53 309 · 43 649 · 53 473 · 65 194] + TTM 83 491 (CAGR +6,94 %; TTM +29,49 % = Dominion fullår + Mainline-volymer — dokumenterad engångskonsolideringseffekt i TTM-fönstret) · netto [2 589 · 5 839 · 5 053 · 7 044] + TTM 5 673 (CAGR +39,6 % MED LÅG-BAS-NOT — FY22-kollapsen −55 % var nedskrivningsburen; EPS [1,28 · 2,84 · 2,34 · 3,22] + TTM 2,59); bruttomarginal källrad TTM 32,59 %; ENGÅNGSKONTROLLEN: normal kaskad TTM (netto-M 6,8 % replik < pretax-M 9,58 < EBIT-M 13,96 — källans 7,34-rad bär minoritetsbasen, dokumenterad); " +
    "kandidatur: CELLMOTIVERAD duo enligt U30-mönstret — Kanada/energi-cellens TVÅ led: CNQ (upstream: oljesand-produktion — BRUNNEN) + ENB (midstream: 30 000 km rörledningar — RÖRET): producent/transportören, samma modellkontrast som Tyskland/energi (RWE produktion + E.ON nätdistribution) och Japan/energi (INPEX + Tokyo Gas); P/E-bärarkriteriet kontrollerat FÖRE leverans (TTM-netto 5 673 M CAD > 0; Sony/Honda-doktrinen); energi-cellen 1→2, Kanada 10→11; NÄSTA RAPPORT est. 2026-11-02 INOM v172-fönstret (KALENDERNOTIS vid v172-arbetet)." }],
  hamtat: "2026-09-25",
  pris: K.prisCAD,
  marknadsKapitalMdr: K.mcap,
  tillvaxt: {
    omsattningCAGR5ar: +R.omsCagr3.toFixed(4),
    resultatCAGR5ar: +R.resCagr3.toFixed(4),
    omsattningTillvaxtTTM: 0.2949,
    prognosTillvaxt: 0.0101,
  },
  lonksamhet: {
    roe: K.roe, roic: K.roic, bruttoMarginal: K.bruttoM, ebitMarginal: K.ebitM,
    nettoMarginal: +R.nettoM.toFixed(4), fcfMarginal: +R.fcfM.toFixed(4),
  },
  stabilitet: {
    skuldEgenkapital: K.de, rantaTackning: K.rantaTackning, fcfPositivaSenaste5: 5,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: 2,
  },
  aterkop: { senasteArMdr: 0.125, andelUtestande: K.payoutKalla, insiderkopSenaste6man: 0 },
  moat: { bruttoMarginalMedel5ar: +(K.bruttoSerie.reduce((a, b) => a + b, 0) / 4).toFixed(4), bruttoMarginalSpread5ar: +(Math.max(...K.bruttoSerie) - Math.min(...K.bruttoSerie)).toFixed(4), roeMedel5ar: null },
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
    "cellmotiverad duo (Kanada/energi 1→2: CNQ upstream-oljesand-brunnen + ENB midstream-röret — producent/transportören, RWE+E.ON/INPEX+Tokyo Gas-mönstret); kollisionskontroll primär+sekundär GRÖN (ENB/ENB.TO+namn+URL); TSX/CAD-precedensen (BCE/NTR-klassen; RY/CNQ:s USD/NYSE = dokumenterad historisk avvikelse); LSE-fri notering — kvartalsvis rapportering (TTM = jun '26); RAPPDAG est. 2026-11-02 INOM v172-fönstret; SEGMENTLÅSET I FEM DELAR: fem segment = totalen EXAKT TTM+FY2022–FY2025 (FEM exakta fönster; FY21 fragmenterat — Liquids/E&O startar FY22); Liquids = ryggraden 76 %; Gas Distribution fördubblad på Dominion-förvärvet 2024; FCF-KOLLAPSEN dokumenterad (NG.L-precedensen): capex fördubblat 4,6→10,8 mdr = rörbyggnadsprogram, FCF 9 547→1 668, identitetslåst exakt; UTDDELNINGEN 23 raka höjningar, current 3,88 CAD (5,79 % EXAKT) men FCF-payout 518 % — skuldfinansierad reglerad modell (dokumenterad, ej nöd: OCF stabil 12,4 mdr); NETTO-SKULD −110,1 mdr (universumets största; Dominion-hoppet 2024 dokumenterat); EV-differensen 3,8 % = preferens+NCI (dokumenterad); P/E-familjen 26,05/26,51/25,87; PEG NULL (basblandning); D/E 1,63 EXAKT; Altman 0,93 DJUP GRÅ (reglerad infrastruktur — dokumenterad); ROIC 5,19 < WACC 6,40 (gap −1,21 p — reglerade nätverkets avkastningsformel, E.ON/Redeia/NG.L-klassen); nyemissioner FY23-24 (Dominion-aktier, +0,14 % aktieantal); netto-CAGR +39,6 % med låg-bas-not (FY22-nedskrivningar); TTM-oms +29,5 % = konsolideringseffekt (dokumenterad); EK-serie saknas; alla repliker i paranoid (StockAnalysis TSX 2026-09-25)",
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
  if (el[el.length - 1].ticker !== "ENB") { console.error("ABORT: sista raden ≠ ENB"); process.exit(1); }
}
const slut = JSON.parse(readFileSync(UNI, "utf8"));
const forandrade = backup.filter((b, i) => JSON.stringify(b) !== JSON.stringify(slut[i])).length;
if (forandrade !== 0) { console.error(`ABORT: ${forandrade} gamla rader förändrade`); process.exit(1); }

const kvitto = [];
kvitto.push(
  `UNIVERSUM-INLÄGG GRÖN: ${FÖRE}→${slut.length} (+1 Enbridge ENB, Kanada/energi 1→2; energi-cellen → ${slut.filter((b) => b.bransch === "energi").length}; Kanada → ${slut.filter((b) => b.land === "Kanada").length})`,
  `indent=${indent} · gamla rader förändrade=${forandrade} · läs-tillbaka ×2 OK`,
  `REPLIKER (TRETTON LÅS): mcap 0,7 % · PS 1,80 EXAKT · P/B 2,18 EXAKT · EV 3,8 % (dokum. tolerans: preferens+NCI) · netto-M 7,7 % (dokum.: minoritetsbas) · FCF-M 2,00 % EXAKT · fcfY 1,11 % EXAKT · divY 5,79 % EXAKT · D/E 1,63 EXAKT · payout 4,7 % (dokum.: totalutdelningsbas) · P/E pris/EPS 0,7 % · EV/Earnings 47,73 EXAKT · EV/Sales 3,24 EXAKT; P/E-familjen 26,05/26,51/25,87 dokumenterad`,
  `SEGMENTLÅSET I FEM DELAR: fem segment = totalen EXAKT TTM+FY2022–FY2025 (FEM exakta fönster — FY21 fragmenterat dokumenterat); Liquids 76 % ryggraden; Gas Distribution fördubblad (Dominion 2024)`,
  `FCF-KOLLAPSEN (NG.L-precedensen): capex 4 647→10 764 (mer än fördubblat); FCF [6 583 · 9 547 · 5 889 · 3 297] + TTM 1 668 — identitetslåst exakt fem fönster; OCF stabil; FCF-CAGR −20,6 %`,
  `UTDELNINGEN 23 raka höjningar, 3,88 CAD (5,79 % EXAKT) · payout-källrad 143,17 % (totalutdelningsbas dokumenterad) · FCF-payout 518 % (reglerad modell) · Altman 0,93 DJUP GRÅ (dokumenterad) · ROIC-gap −1,21 p (reglerade nätverkets avkastningsformula)`,
  `P/E-BÄRARKONTROLL: TTM-netto 5 673 M CAD > 0 — GRÖN · NETTO-SKULD −110,1 mdr (universumets största) · rappdag est. 2026-11-02 INOM v172-fönstret`,
);
writeFileSync("/tmp/r230-inlagg.txt", kvitto.join("\n"));
console.log(kvitto.join("\n"));
