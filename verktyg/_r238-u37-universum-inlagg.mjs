#!/usr/bin/env node
/**
 * _r238-u37-universum-inlagg.mjs — v173 dataset-djup rond 238 U37 (+1):
 * Infineon Technologies IFX.DE (Tyskland/teknik 1→2 — TYSKLANDS SISTA
 * 1-GREN). Cellmotiverad duo: SAP (enterprise-mjukvaran — abonnemangscykel,
 * feta marginaler) + Infineon (halvledare — kapitalcykel med botten och
 * topp): tyska teknikens två ben (Panasonic+Tokyo Electron-klassen).
 * ETR/EUR (SAP.DE-precedensen). FISCALÅR OKT–SEP (TTM = jun '26).
 * P/E 61,13 = HALVLEDARCYKELNS BOTTEN dokumenterad i paranoid (FY23-toppen
 * netto 3 108 → FY25-botten 997 = −68 %; TTM-vändning 1 197; ROIC-gap
 * −5,86 p under WACC 13,81 — bottnens natur). PEG 0,56 MED DOKUMENTERAD BAS
 * (fwd 22,38/konsensus 3Y EPS 40,0 = 0,56 EXAKT — TD-precedensen).
 * DIVISIONSDIFFERANSEN dokumenterad: fyra divisioner + Other = totalen
 * inom ±20 M (≤0,14 %) sex fönster; två TTM-fönster dokumenterade
 * (jun-huvud 15 591 mot mar-division 15 121). Kvitto: /tmp/r238-inlagg.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const FÖRE = u.length;
if (u.some((b) => ["IFX", "IFX.DE"].includes(b.ticker) || /infineon/i.test(b.namn ?? "") || (b.kallor?.[0]?.url ?? "").includes("/etr/IFX/"))) {
  console.error("ABORT: IFX finns redan på disken");
  process.exit(1);
}

const K = {
  prisEUR: 56.26, aktierMdr: 1.30, mcap: 72.94, eps: 0.92, peKalla: 61.13,
  fwdPe: 22.38, pegKalla: 0.56, pb: 4.05, psKalla: 4.68, evKalla: 78.53,
  evEarnings: 65.60, evSales: 5.04, evEbit: 30.64, pFcf: 44.31, pocf: 21.69,
  roe: 0.0702, roic: 0.0795, roce: 0.0991, wacc: 0.1381,
  ebitM: 0.1634, pretaxM: 0.1063, bruttoM: 0.4113,
  nettoTtm: 1.197, revTtm: 15.591, fcfTtm: 1.646,
  skuld: 7.24, ek: 18.02, kassa: 1.66, de: 0.40, rantaTackning: 8.35,
  div: 0.35, divYieldKalla: 0.0062, payoutKalla: 0.3762,
  // EUR-serier, fiscal okt–sep FY2022–FY2025
  omsSerie: [14218, 16309, 14955, 14662],
  resSerie: [2150, 3108, 1272, 997],
  fcfSerie: [1927, 1221, 348, 1417],
  ocfSerie: [3980, 3960, 2780, 3217], ocfTtm: 3363,
  capexSerie: [2053, 2739, 2432, 1800], capexTtm: 1717,
  bruttoSerie: [0.3867, 0.4319, 0.4715, 0.4350, 0.4106],  // FY21–FY25
  // Divisioner [TTM(mar'26) · FY25 · FY24 · FY23 · FY22 · FY21], M EUR
  automotive: [7442, 7402, 7716, 8242, 6516, 4841],
  greenIP: [1647, 1631, 1934, 2205, 1790, 1542],
  pss: [4673, 4208, 3795, 3798, 4070, 3268],
  css: [1358, 1418, 1506, 2046, 1822, 1397],
  other: [18, 20, 12],
  divTotal: [15121, 14662, 14955, 16309, 14218, 11060],
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
  payoutReplik: K.div / K.eps,
  pegBas: K.fwdPe / 40.0,
  epsBeraknad: K.nettoTtm / K.aktierMdr,
};
const avv = (a, b) => Math.abs(a / b - 1);
const exakt = [
  ["mcap", R.mcapReplik, K.mcap, 0.02],
  ["ps", R.psReplik, K.psKalla, 0.02],
  ["pb", R.pbReplik, K.pb, 0.02],
  ["ev-dekomposition", R.evReplik, K.evKalla, 0.02],
  ["nettoM mot financials-TTM-raden 7,68 (statistics-veget 7,77 = annan bas, dokumenterad)", R.nettoM, 0.0768, 0.02],
  ["fcfM mot källans rad", R.fcfM, 0.1056, 0.02],
  ["fcfY mot källrad", R.fcfY, 0.0226, 0.02],
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
// P/E-familjen (61,13/60,78/61,15 — tight trots högt nivå)
if (!(R.peGaap > K.peKalla - 1 && R.peGaap < K.peKalla + 1)) {
  console.error(`ABORT: P/E-familjen utanför spann (GAAP ${R.peGaap.toFixed(2)})`);
  process.exit(1);
}
// PEG med DOKUMENTERAD bas: fwd/konsensus3Y = 0,56 EXAKT
if (avv(R.pegBas, K.pegKalla) > 0.005) { console.error(`ABORT: PEG-basen avviker (${R.pegBas.toFixed(4)} vs ${K.pegKalla})`); process.exit(1); }
// FCF-IDENTITET exakt
const fcfIdent = [];
for (let i = 0; i < 4; i++) fcfIdent.push([K.ocfSerie[i] - K.capexSerie[i], K.fcfSerie[i]]);
fcfIdent.push([K.ocfTtm - K.capexTtm, 1646]);
if (fcfIdent.some(([a, b]) => Math.abs(a - b) > 0.001)) {
  console.error("ABORT: FCF-serien ej OCF−capex-låst: " + fcfIdent.map(([a, b]) => `${a}≠${b}`).join("; "));
  process.exit(1);
}
// DIVISIONSDIFFERANSEN — dokumenterad ±20 M
const divNycklar = ["automotive", "greenIP", "pss", "css", "other"];
const divSum = K.divTotal.map((x, i) => [divNycklar.reduce((s, k) => s + (K[k][i] ?? 0), 0), x]);
const vantaDiff = [17, 17, 8, -18, -20, -12];
if (!divSum.every(([s, x], i) => s - x === vantaDiff[i])) {
  console.error("ABORT: divisionsdifferansen avviker: " + divSum.map(([s, x]) => `${s - x}`).join(", "));
  process.exit(1);
}
if (K.nettoTtm <= 0) { console.error("ABORT: P/E-bärarkontroll — TTM-netto ≤ 0"); process.exit(1); }
if (!(R.nettoM < K.pretaxM && K.pretaxM < K.ebitM)) { console.error("ABORT: normal kaskad bruten"); process.exit(1); }

const RAD = {
  ticker: "IFX.DE",
  namn: "Infineon Technologies AG",
  bransch: "teknik",
  land: "Tyskland",
  valuta: "EUR",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-25", url: "https://stockanalysis.com/quote/etr/IFX/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/)", paranoid:
    "ETR-PRIMÄRNOTING (underlag S&P Global Market Intelligence via StockAnalysis; senaste handelsdag 2026-09-24, hämtat 2026-09-25 — close 56,26 EUR · −3,94 % dagen; 50/200-dagars MA 59,03/54,92 — under 50-MA över 200-MA; 52v +66,45 % = VÄNDNINGSÅRET; beta 1,93 — HALVLEDARVOLATILITETEN dokumenterad; RSI 46,7; konsensus PT 86,59 = +53,9 % Buy 24 analytiker — STARK konsensus); färskhämtning med FYRA paneler; FISCALÅR OKT–SEP (30 sep; TTM-fönstret = jun '26 efter Q3 — KVARTALSVIS; NÄSTA RAPPORT 2026-11-10 BEKRÄFTAD = FY2026-ÅRSBOKSLUT — SEX DAGAR EFTER v172-FÖNSTRETS SLUT 11-04 (NG/SN 11-05-klassen; kalendernotis); ETR/EUR-PRECEDENSEN (SAP.DE-klassen): " +
    "pris 56,26 EUR, mcap 72,94 mdr EUR på 1,30 mdr aktier (replik 1,30×56,26 = 73,14 — 0,3 %, aktieavrundning; aktieantal +0,52 % YoY — lätt utspädning, buyback-yield −0,52 %), " +
    "P/E-FAMILJEN TIGHT PÅ HOGT NIVÅ: källrad 61,13 · GAAP 72,94/1,197 = 60,78 · pris/EPS 56,26/0,92 = 61,15 (0,03 % EXAKT); P/E 61 = HALVLEDARCYKLENS BOTTEN DOKUMENTERAD: netto-toppen FY23 3 108 → botten FY25 997 (−68 %) med TTM-vändning 1 197 — det höga P/E:t är deponerat lågt netto, INTE strukturell värdering (fwd P/E 22,38 ⇒ implied EPS +173 % — vändningskonsensusens storlek, referens ALDRIG löfte); PEG 0,56 MED DOKUMENTERAD BAS: fwd 22,38/konsensus 3Y EPS 40,0 % = 0,5595 ≈ 0,56 EXAKT (TD-precedensen — fältet SATT); PS 4,68 EXAKT · P/B 4,05 EXAKT (72,94/18,02) · P/FCF 44,31 · P/OCF 21,69; " +
    "EV-DEKOMPOSITION EXAKT: 72,94 + 7,24 − 1,66 = 78,52 mot källans 78,53 (0,01 %); EV/Earnings 65,60 (0,24 %) · EV/Sales 5,04 EXAKT · EV/EBIT 30,64 · EV/EBITDA 18,30; NETTO-SKULD −5,59 mdr (−4,31/aktie — investeringsprogrammets år; serien [−2 994 · −2 331 · −1 524 · −2 967 · −5 114] bruten FY24→FY25 av fabriksexpansionerna); " +
    "DIVISIONSBILDEN (fyra ben + Other [mar-'26-TTM · FY25 · FY24 · FY23 · FY22 · FY21] M EUR): Automotive [7 442 · 7 402 · 7 716 · 8 242 · 6 516 · 4 841] (STÖRST 49 % — bilens elektrifiering: siC-mosfet-bryggor) + Green Industrial Power [1 647 · 1 631 · 1 934 · 2 205 · 1 790 · 1 542] (sol/vind/drivteknik — korrigeringen djupast här) + Power & Sensor Systems [4 673 · 4 208 · 3 795 · 3 798 · 4 070 · 3 268] (VÄNDER FÖRST — AI-serverströmförsörjningen) + Connected Secure Systems [1 358 · 1 418 · 1 506 · 2 046 · 1 822 · 1 397] (IoT-säkerhet — lagret tömts) — DIVISIONSDIFFERANSEN DOKUMENTERAD [+17 · +17 · +8 · −18 · −20 · −12] (max 0,14 %, källans avrundning/eliminering); TVÅ TTM-FÖNSTER DOKUMENTERADE: huvudtabellen jun-'26 (oms 15 591) mot divisionstabellen mar-'26 (15 121) — källan uppdaterar divisioner trappstegsvis; " +
    "CYKELPORTRÄTTET: omsättning [11 060 · 14 218 · 16 309 · 14 955 · 14 662] + TTM 15 591 (boomen +28,6/+14,7 % → korrigeringen −8,3/−2,0 % → TTM +6,5 % vändning; CAGR +1,03 % FY22→25 — CYKELNS SÅGTAND, dokumenterad) · netto [1 143 · 2 150 · 3 108 · 1 272 · 997] + TTM 1 197 (netto-CAGR −22,6 % — topp-till-botten dokumenterat) · EPS [0,88 · 1,64 · 2,38 · 0,97 · 0,77] + TTM 0,92 · bruttomarginal [38,67 · 43,19 · 47,15 · 43,50 · 41,06] % FY21–25 + TTM 41,13 (medel 42,7 %, spridning 8,48 pp — cykeln syns i bruttoledet); " +
    "FCF-SPEGELN MED BOTTNEN: [1 797 · 1 927 · 1 221 · 348 · 1 417] + TTM 1 646 — identitetslåst exakt sex fönster (OCF−capex: [3 065−1 268 · 3 980−2 053 · 3 960−2 739 · 2 780−2 432 · 3 217−1 800 · 3 363−1 717]); FY24-BOTTNEN 348 = capex-toppen 2 739 (Kulim/Graz-fabrikerna) medan OCF höll 2 780; TTM-återhämtningen 1 646 på capex-nedgång 1 717; FCF-M 10,56 % · FCF-yield 2,26 % EXAKT; " +
    "UTDELNINGEN FRUSEN på 0,35 EUR genom botten (current 0,35, 0,62 % EXAKT replik 0,35/56,26; payout-källrad 37,62 % mot replik 0,35/0,92 = 38,0 % — 0,8 %); utdelningsbeloppen [−286 · −351 · −417 · −456 · −456] TTM −456 växer med aktieantalet; återköpen små och oregelbundna [−39 · −39 · −272 · −44 · −226]; Net Debt Issued TTM +1 715 (lånar för programmet); " +
    "LÖNSAMHET (BOTTNENS NATUR DOKUMENTERAD): ROE 7,02 % · ROIC 7,95 % mot WACC 13,81 % (gap −5,86 p — NEGATIVT under cykelbotten: kapitalvärdeskapandet är cykelberoende, ej strukturellt; fwd-implied EPS +173 % = konsensusvägen tillbak, referens) · räntetäckning 8,35 · D/E 0,40 EXAKT (7,24/18,02) · current 1,73 · skatt 26,43 % · institutionsägande 47,12 %; kaskaden TTM: netto-M 7,68 % EXAKT (financials-TTM-raden; statistics-veget 7,77 dokumenterad annan bas) < pretax-M 10,63 % < EBIT-M 16,34 %; balansserier M EUR [FY21–FY25]: kassa [3 922 · 3 717 · 3 590 · 2 201 · 2 102] nu 1 656 (KASSAGLIDNINGEN −446 M dokumenterad — fabriksåren betalar) · skuld [6 916 · 6 048 · 5 114 · 5 168 · 7 216] nu 7 241; Altman beräknas ej av källan; " +
    "kandidatur: CELLMOTIVERAD duo enligt U30-mönstret — Tyskland/teknik-cellens (TYSKLANDS SISTA 1-GREN) två ben: SAP (enterprise-mjukvaran: abonnemangscykel, bruttomarginal ~70-tals%, stabilt) + Infineon (halvledare: kapitalcykel med botten och topp, bruttomarginal 39–47 % cyklande): tyska teknikens två hastigheter — Panasonic+Tokyo Electron-klassen; P/E-bärarkriteriet kontrollerat FÖRE leverans (TTM-netto 1 197 M EUR > 0 — GRÖN trots bottnen; Sony/Honda-doktrinen); teknik-cellen 1→2, Tyskland 23→24 — TYSKLAND-KOMPLETT EFTER INLÄGGET (femte landet); NÄSTA RAPPORT 2026-11-10 (FY26-årsbokslut — sex dagar efter v172-fönstret)." }],
  hamtat: "2026-09-25",
  pris: K.prisEUR,
  marknadsKapitalMdr: K.mcap,
  tillvaxt: {
    omsattningCAGR5ar: +R.omsCagr3.toFixed(4),
    resultatCAGR5ar: +R.resCagr3.toFixed(4),
    omsattningTillvaxtTTM: 0.0652,
    prognosTillvaxt: 0.1637,
  },
  lonksamhet: {
    roe: K.roe, roic: K.roic, bruttoMarginal: K.bruttoM, ebitMarginal: K.ebitM,
    nettoMarginal: +R.nettoM.toFixed(4), fcfMarginal: +R.fcfM.toFixed(4),
  },
  stabilitet: {
    skuldEgenkapital: K.de, rantaTackning: K.rantaTackning, fcfPositivaSenaste5: 5,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: 0,
  },
  aterkop: { senasteArMdr: 0.226, andelUtestande: K.payoutKalla, insiderkopSenaste6man: 0 },
  moat: { bruttoMarginalMedel5ar: +R.bruttoMedel.toFixed(4), bruttoMarginalSpread5ar: +R.bruttoSpread.toFixed(4), roeMedel5ar: null },
  vardering: { pe: K.peKalla, pb: K.pb, evEbit: K.evEbit, peg: K.pegKalla, fcfYield: +R.fcfY.toFixed(4), egenKapitalMultipl: K.pb },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2022", "2023", "2024", "2025"],
    omsattning: K.omsSerie.map((x) => x * 1e6),
    resultat: K.resSerie.map((x) => x * 1e6),
    egetKapital: [],
    fcf: K.fcfSerie.map((x) => x * 1e6),
  },
  notering:
    "cellmotiverad duo (Tyskland/teknik 1→2 — TYSKLANDS SISTA 1-GREN: SAP enterprise-mjukvarans abonnemangscykel + Infineon halvledarnas kapitalcykel — tyska teknikens två ben, Panasonic+Tokyo Electron-klassen); kollisionskontroll primär+sekundär GRÖN (IFX/IFX.DE+namn+URL); ETR/EUR (SAP.DE-precedensen); FISCALÅR OKT–SEP (TTM = jun '26; Q3); RAPPDAG 2026-11-10 BEKRÄFTAD = FY26-årsbokslut — sex dagar efter v172-fönstret (kalendernotis); P/E 61 = HALVLEDARCYKLENS BOTTEN DOKUMENTERAD (netto [1 143 · 2 150 · 3 108 · 1 272 · 997] + TTM 1 197: topp→botten −68 %, TTM-vändning; netto-CAGR −22,6 % öppet); oms-CAGR +1,03 % (sågtanden +28,6→−8,3→+6,5); bruttomarginal 38,7→47,2→41,1 % (cykeln i bruttoledet); DIVISIONSBILDEN: Automotive 49 % störst (SiC-bryggor) + Green IP (korrigeringen djupast) + PSS (vänder först — AI-strömförsörjning) + CSS (IoT-lagret tömt) — differansen [+17 · +17 · +8 · −18 · −20 · −12] max 0,14 % dokumenterad + två TTM-fönster (jun 15 591 / mar 15 121); FCF med bottnen [1 797 · 1 927 · 1 221 · 348 · 1 417] + TTM 1 646 identitetslåst exakt sex fönster (FY24-botten 348 = capex-toppen 2 739 Kulim/Graz); UTDDELNINGEN FRUSEN 0,35 EUR (0,62 % EXAKT; payout 37,62); PEG 0,56 MED DOKUMENTERAD BAS (fwd 22,38/40,0 — TD-precedensen); P/E-familjen 61,13/60,78/61,15; D/E 0,40 EXAKT · netto-skuld −5,59 mdr (fabriksåren) · kassaglidning −446 M dokumenterad; ROIC-gap −5,86 p (bottennatur, ej strukturell — fwd-implied +173 % konsensusreferens); beta 1,93 · 52v +66,45 %; EK-serie saknas; alla repliker i paranoid (StockAnalysis ETR 2026-09-25)",
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
  if (el[el.length - 1].ticker !== "IFX.DE") { console.error("ABORT: sista raden ≠ IFX.DE"); process.exit(1); }
}
const slut = JSON.parse(readFileSync(UNI, "utf8"));
const forandrade = backup.filter((b, i) => JSON.stringify(b) !== JSON.stringify(slut[i])).length;
if (forandrade !== 0) { console.error(`ABORT: ${forandrade} gamla rader förändrade`); process.exit(1); }

const kvitto = [];
kvitto.push(
  `UNIVERSUM-INLÄGG GRÖN: ${FÖRE}→${slut.length} (+1 Infineon IFX.DE, Tyskland/teknik 1→2; teknik-cellen → ${slut.filter((b) => b.bransch === "teknik").length}; Tyskland → ${slut.filter((b) => b.land === "Tyskland").length})`,
  `indent=${indent} · gamla rader förändrade=${forandrade} · läs-tillbaka ×2 OK`,
  `REPLIKER (TRETTON LÅS — ÅTTA EXAKTA): PS EXAKT · P/B EXAKT · EV 0,01 % · netto-M EXAKT (7,68 financials-TTM; statistics-veget 7,77 dokumenterad) · FCF-yield EXAKT · divY EXAKT · P/E pris/EPS 0,03 % EXAKT · EV/Sales EXAKT · mcap 0,3 % · fcfM 0,2 % · D/E 0,45 % · payout 0,8 % · EV/Earnings 0,24 %; P/E-familjen TIGHT 61,13/60,78/61,15; PEG 0,56 MED DOKUMENTERAD BAS (22,38/40,0 = 0,5595 — TD-precedensen, fältet SATT)`,
  `CYKELPORTRÄTTET: netto [1 143 · 2 150 · 3 108 · 1 272 · 997] + TTM 1 197 (topp→botten −68 %, TTM-vändning; netto-CAGR −22,6 % öppet); oms-CAGR +1,03 % (sågtand +28,6→−8,3→+6,5 %); bruttomarginal 38,7→47,2→41,1 %`,
  `DIVISIONSBILDEN: Automotive 49 % + Green IP + PSS (vänder först — AI) + CSS; differansen [+17 · +17 · +8 · −18 · −20 · −12] max 0,14 % + två TTM-fönster (jun 15 591 / mar 15 121)`,
  `FCF med bottnen [1 797 · 1 927 · 1 221 · 348 · 1 417] + TTM 1 646 — identitetslåst exakt sex fönster (FY24 = capex-toppen 2 739 Kulim/Graz); UTDDELNINGEN FRUSEN 0,35 (0,62 % EXAKT)`,
  `P/E-BÄRARKONTROLL: TTM-netto 1 197 M EUR > 0 — GRÖN trots bottnen · ROIC-gap −5,86 p (bottennatur) · RAPPDAG 2026-11-10 (FY26-bokslut, sex dagar efter v172)`,
);
writeFileSync("/tmp/r238-inlagg.txt", kvitto.join("\n"));
console.log(kvitto.join("\n"));
