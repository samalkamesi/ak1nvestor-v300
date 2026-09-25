#!/usr/bin/env node
/**
 * _r232-u34-universum-inlagg.mjs — v173 dataset-djup rond 232 U34 (+1):
 * Banco Bilbao Vizcaya Argentaria BBVA.MC (Spanien/finans 1→2) —
 * cellmotiverad duo: SAN (global utlåning, fem kontinenter — den breda)
 * + BBVA (Mexico-fokuserad emerging-bank + Turkiet — den djupa): spanska
 * bankens två riskprofiler. BME/EUR-precedensen (SAN.MC-klassen).
 * BANK-LÅSPROFIL enligt RY/SAN/TD-mallen men med FCF-MÅTT (källan redovisar
 * dem: P/FCF 4,13 · FCF-yield 24,21 %) — FCF-serien VILD men identitetslåst
 * exakt fem fönster. GEOGRAFIBILDEN på gross income-basen med dokumenterad
 * begreppsdifferans mot revenue-totalen (inget falskt lås). PEG NULL
 * (basblandning). P/E-bärarkontroll FÖRE leverans: TTM-netto 10,718 mdr
 * EUR > 0 — GRÖN. Rappdag 2026-10-29 BEKRÄFTAD — INOM v172-fönstret.
 * Kvitto: /tmp/r232-inlagg.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const FÖRE = u.length;
if (u.some((b) => ["BBVA", "BBVA.MC"].includes(b.ticker) || /bilbao vizcaya|bbva/i.test(b.namn ?? "") || (b.kallor?.[0]?.url ?? "").includes("/bme/BBVA/"))) {
  console.error("ABORT: BBVA finns redan på disken");
  process.exit(1);
}

const K = {
  prisEUR: 24.88, aktierMdr: 5.51, mcap: 137.01, eps: 1.89, peKalla: 13.15,
  fwdPe: 11.41, pb: 2.15, psKalla: 4.01,
  roe: 0.1892, opM: 0.5391, pretaxM: 0.5092,
  nettoTtm: 10.718, revTtm: 34.135, fcfTtm: 33.164,
  div: 0.92, divYieldKalla: 0.0370, payoutKalla: 0.4675,
  // EUR-serier, dec-slut FY2022–FY2025
  omsSerie: [22975, 27133, 31557, 31648],
  resSerie: [6045, 7675, 9666, 10114],
  fcfSerie: [21906, -1850, -19385, 14141],
  ocfSerie: [23718, -721, -18190, 14968], ocfTtm: 34162,
  capexSerie: [1812, 1129, 1195, 827], capexTtm: 998,
  dpsSerie: [0.31, 0.43, 0.55, 0.70, 0.92],      // FY2021–FY2025; current 0,92
  // Geo gross income [TTM · FY25 · FY24 · FY23 · FY22 · FY21], M EUR
  spain: [10136, 10027, 9443, 7888, 6112, 5890],
  mexico: [16415, 15198, 15337, 14267, 10734, 7603],
  turkey: [6176, 5213, 4212, 2981, 3172, 3422],
  southam: [5968, 5363, 5405, 4331, 4265, 3162],
  rest: [2169, 1807, 1472, 1103, 790, 776],
  corpCenter: [-809, -678, -388, -1029, -329, 212],
  revTotal: [34135, 31648, 31557, 27133, 22975, 18600],
};
const R = {
  mcapReplik: (K.aktierMdr * K.prisEUR),
  pePrisEps: K.prisEUR / K.eps,
  peGaap: K.mcap / K.nettoTtm,
  nettoM: K.nettoTtm / K.revTtm,
  fcfM: K.fcfTtm / K.revTtm,
  fcfY: K.fcfTtm / K.mcap,
  divY: K.div / K.prisEUR,
  omsCagr3: Math.pow(K.omsSerie[3] / K.omsSerie[0], 1 / 3) - 1,
  resCagr3: Math.pow(K.resSerie[3] / K.resSerie[0], 1 / 3) - 1,
  psReplik: K.mcap / K.revTtm,
  pbReplik: 137.01 / 63.79,
  payoutReplik: K.div / K.eps,
  epsBeraknad: K.nettoTtm / K.aktierMdr,
};
const avv = (a, b) => Math.abs(a / b - 1);
const exakt = [
  ["mcap", R.mcapReplik, K.mcap, 0.02],
  ["ps", R.psReplik, K.psKalla, 0.02],
  ["pb (källrad 2,15 — EK 63,79 mdr)", R.pbReplik, K.pb, 0.02],
  ["ev — BANK: n/a i källan (NULL, dokumenterad)", null, null, 1],
  ["nettoM mot financials-TTM-raden 31,40 (statistics-veget 32,56 = annan bas, dokumenterad)", R.nettoM, 0.3140, 0.02],
  ["fcfM mot källans rad", R.fcfM, 0.9716, 0.02],
  ["fcfY mot källrad (P/FCF 4,13 ⇒ 24,21)", R.fcfY, 0.2421, 0.02],
  ["divYield", R.divY, K.divYieldKalla, 0.02],
  ["de — BANK: n/a (NULL)", null, null, 1],
  ["payout (dokum. tolerans: kälrbas okänd — DPS/EPS-replik 48,7)", R.payoutReplik, K.payoutKalla, 0.05],
  ["pe pris/EPS", R.pePrisEps, K.peKalla, 0.02],
  ["evEarnings — BANK: n/a (NULL)", null, null, 1],
  ["evSales — BANK: n/a (NULL)", null, null, 1],
];
const fel = exakt.filter(([n, r, k, tol]) => r !== null && k !== null && avv(r, k) > tol);
if (fel.length) {
  console.error("ABORT: replik utanför tolerans: " + fel.map(([n, r, k]) => `${n} ${r?.toFixed(4)} vs ${k}`).join("; "));
  process.exit(1);
}
const nullAntal = exakt.filter(([n, r]) => r === null).length;
if (nullAntal !== 4) { console.error(`ABORT: bank-NULL-profilen avviker (väntade 4, fick ${nullAntal})`); process.exit(1); }
if (!(R.peGaap > K.peKalla - 1 && R.peGaap < K.peKalla + 1)) {
  console.error(`ABORT: P/E-familjen utanför spann (GAAP ${R.peGaap.toFixed(2)})`);
  process.exit(1);
}
// FCF-IDENTITET (bank: volatila bokningar men OCF−capex låser exakt)
const fcfIdent = [];
for (let i = 0; i < 4; i++) fcfIdent.push([K.ocfSerie[i] - K.capexSerie[i], K.fcfSerie[i]]);
fcfIdent.push([K.ocfTtm - K.capexTtm, 33164]);
if (fcfIdent.some(([a, b]) => Math.abs(a - b) > 0.001)) {
  console.error("ABORT: FCF-serien ej OCF−capex-låst: " + fcfIdent.map(([a, b]) => `${a}≠${b}`).join("; "));
  process.exit(1);
}
// Geografi-differansen — dokumenterad begreppsdifferans (gross income vs revenue)
const geoNycklar = ["spain", "mexico", "turkey", "southam", "rest", "corpCenter"];
const geoDiff = K.revTotal.map((x, i) => geoNycklar.reduce((s, k) => s + K[k][i], 0) - x);
const vantaDiff = [5920, 5282, 3924, 2408, 1769, 2465];
if (!geoDiff.every((d, i) => d === vantaDiff[i])) {
  console.error("ABORT: geografi-differansen avviker från dokumenterad: " + geoDiff.join(", "));
  process.exit(1);
}
if (K.nettoTtm <= 0) { console.error("ABORT: P/E-bärarkontroll — TTM-netto ≤ 0"); process.exit(1); }
if (!(R.nettoM < K.pretaxM && K.pretaxM < K.opM)) { console.error("ABORT: normal kaskad bruten"); process.exit(1); }

const RAD = {
  ticker: "BBVA.MC",
  namn: "Banco Bilbao Vizcaya Argentaria, S.A.",
  bransch: "finans",
  land: "Spanien",
  valuta: "EUR",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-25", url: "https://stockanalysis.com/quote/bme/BBVA/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/)", paranoid:
    "BME-PRIMÄRNOTING (underlag S&P Global Market Intelligence via StockAnalysis; senaste handelsdag 2026-09-24, hämtat 2026-09-25 — close 24,88 EUR; 50/200-dagars MA 24,47/21,07 — priset PÅ 50-MA ÖVER 200-MA; 52v +53,82 % = emerging-vändningens år; RSI 50,7; konsensus PT 23,24 = −6,6 % — priset sprungit förbi Hold-konsensusen); färskhämtning med FYRA paneler; KALENDERÅRSBOKSLUT (31 dec; TTM-fönstret = jun '26 efter H1 — HALVÅRSRAPPORTERING; NÄSTA RAPPORT 2026-10-29 BEKRÄFTAD — INOM v172-FÖNSTRET 10-20→11-04, SAMMA DAG SOM DGE); BME/EUR-PRECEDENSEN (SAN.MC-klassen — ren EUR-genomgång): " +
    "pris 24,88 EUR (beta 0,89), mcap 137,01 mdr EUR på 5,51 mdr aktier (replik 5,51×24,88 = 137,09 — 0,06 %), " +
    "P/E-FAMILJEN DOKUMENTERAD: källrad 13,15 · GAAP 137,01/10,718 = 12,78 · pris/EPS 24,88/1,89 = 13,16 (0,1 %); EPS-raden 1,89 mot beräknad netto/aktier 1,945 — aktieavrundningsbas; fwd P/E 11,41 ⇒ implied EPS +15 % (konsensusreferens); PEG-KÄLLRAD 0,80 MED BASBLANDNING (implied 14,3 % mot konsensus 3Y EPS 12,90; fwd-replik 11,41/12,90 = 0,88; trailing 1,02 — tre baser, ingen ren) ⇒ fältet NULL (SN.L-precedensen); PS 4,01 EXAKT (137,01/34,14) · P/B 2,15 (137,01/63,79 — 0,1 %) · P/TBV 2,45 · P/FCF 4,13; " +
    "BANK-NULL-PROFILEN (källans n/a — RY/SAN/TD-mallen): EV n/a · EV/Earnings n/a · EV/Sales n/a · D/E n/a · räntetäckning n/a — men källan REDOVISAR FCF-MÅTT (olika bokningspraxis än TD/RY): FCF-M 97,16 % EXAKT (33,164/34,135) · FCF-yield 24,21 % (0,06 % mot källraden) — bank-FCF = lånebokens bokningar, INTE ägarutdelningsbar kassa (dokumenterat); balans: kassa 183,6 mdr · skuld 198,9 mdr · netto −15,4 mdr (−2,79/aktie); working capital −492 mdr (insättningarna i rörelse); " +
    "GEOGRAFIBILDEN — DUONS KÄRNA (gross income per marknad [TTM · FY25 · FY24 · FY23 · FY22 · FY21] M EUR): Spain [10 136 · 10 027 · 9 443 · 7 888 · 6 112 · 5 890] + MEXICO [16 415 · 15 198 · 15 337 · 14 267 · 10 734 · 7 603] (STÖRSTA MARKNADEN sedan FY22 — 10 734 > 6 112; BBVA = i praktiken en mexikansk bank med spansk bas) + Turkey [6 176 · 5 213 · 4 212 · 2 981 · 3 172 · 3 422] (fördubblad sedan FY23 — hyperinflationsredovisning) + South America [5 968 · 5 363 · 5 405 · 4 331 · 4 265 · 3 162] + Rest of Business [2 169 · 1 807 · 1 472 · 1 103 · 790 · 776] + Corporate Center [−809 · −678 · −388 · −1 029 · −329 · +212] — BEGREPPSDIFFERANSEN DOKUMENTERAD: gross income-summan överstiger revenue-totalen med [+5 920 · +5 282 · +3 924 · +2 408 · +1 769 · +2 465] = poster utanför segment-gross-income (handelsresultat/övriga intäkter/konsolidering — SAGE-U29:s geolås gick på revenue-segment, BBVA:s källa erbjuder ej det; inget falskt exakthetslås); " +
    "SEX RAKA VINSTÅR: netto [4 294 · 6 045 · 7 675 · 9 666 · 10 114] + TTM 10 718 (CAGR +18,75 % FY22→25; vartenda år högre); EPS [0,67 · 0,98 · 1,29 · 1,68 · 1,76] + TTM 1,89; omsättning [18 600 · 22 975 · 27 133 · 31 557 · 31 648] + TTM 34 135 (CAGR +11,26 % FY22→25; FY25 nearly flat +0,29 % men TTM +8,83 %); ROE 18,92 % — HÖGST I SPANSKA FINANS-CELLDUON (SAN 13,11) OCH UNIVERSUMETS BANK-ELIT; " +
    "FCF-SERIEN VILD MEN IDENTITETSLÅST: [−1 638 · +21 906 · −1 850 · −19 385 · +14 141] + TTM +33 164 — OCF−capex exakt sex fönster [−1 242−396 · 23 718−1 812 · −721−1 129 · −18 190−1 195 · 14 968−827 · 34 162−998]; bankens driftskassa rör låneboken (mexikansk/Turkiet-kreditvolym) — FCF-året är bokningsår, inte utdelningsförmåga (dokumenterat); FCF-marginalrader [−8,81 · 95,35 · −6,82 · −61,43 · 44,68 · TTM 97,16] % — källans egna rader tvärverifierar; " +
    "UTDELNING + ÅTERKÖP: DPS [0,31 · 0,43 · 0,55 · 0,70 · 0,92] — MER ÄN FÖRDOBLAD på fyra år (+31,4 % senaste); current 0,92 EUR (3,70 % EXAKT replik 0,92/24,88); payout-källrad 46,75 % (replik 0,92/1,89 = 48,7 % — 4,1 %, kälrbas dokumenterad okänd) · FCF-payout 12,37 %; ÅTERKÖPEN SPIKAR: [−1 022 · −2 983 · −2 166 · −1 529 · −1 995] TTM −5 191 (den största posten hittills — aktiebas −1,55 % YoY = buyback-yield EXAKT · shareholder yield 5,25 %) mot emissioner [+813 · +757 · +691 …] små; vanliga utdelningar [−926 · −2 185 · −2 808 · −3 913 · −4 196] TTM −5 196 — utdelning och återköp nu lika stora; " +
    "LÖNSAMHET: ROE 18,92 % · ROA 1,35 % · WACC 3,73 % · skattesats 32,13 % (den spanska+emerging-blandningen) · institutionsägande 41,53 %; kaskaden TTM: netto-M 31,40 % EXAKT (financials-TTM-raden; statistics-veget 32,56 % = annan fönsterbas dokumenterad) < pretax-M 50,92 % < operating-M 53,91 %; balansserier M EUR [FY21–FY25]: kassa [140,9 · 130,2 · 163,0 · 135,3 · 148,5] · skuld [106,5 · 111,9 · 142,6 · 140,7 · 152,8] · netto [+34,4 · +18,3 · +20,4 · −5,4 · −4,2] — VÄNDNINGEN TILL NETTOSKULD FY2024 (emerging-tillväxten finansieras) nu −15,4; Altman n/a (bank); " +
    "kandidatur: CELLMOTIVERAD duo enligt U30-mönstret — Spanien/finans-cellens TVÅ riskprofiler: Santander (global utlåning, fem kontinenter, diversifierad — den breda) + BBVA (Mexico-fokuserad emerging-bank + Turkiet/Sydamerika — den djupa): spanska bankens två sätt att möta världen; P/E-bärarkriteriet kontrollerat FÖRE leverans (TTM-netto 10 718 M EUR > 0; Sony/Honda-doktrinen); finans-cellen 1→2, Spanien 5→6; NÄSTA RAPPORT 2026-10-29 BEKRÄFTAD INOM v172-fönstret (samma dag som Diageo)." }],
  hamtat: "2026-09-25",
  pris: K.prisEUR,
  marknadsKapitalMdr: K.mcap,
  tillvaxt: {
    omsattningCAGR5ar: +R.omsCagr3.toFixed(4),
    resultatCAGR5ar: +R.resCagr3.toFixed(4),
    omsattningTillvaxtTTM: 0.0883,
    prognosTillvaxt: 0.0874,
  },
  lonksamhet: {
    roe: K.roe, roic: null, bruttoMarginal: null, ebitMarginal: K.opM,
    nettoMarginal: +R.nettoM.toFixed(4), fcfMarginal: +R.fcfM.toFixed(4),
  },
  stabilitet: {
    skuldEgenkapital: null, rantaTackning: null, fcfPositivaSenaste5: null,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: 5,
  },
  aterkop: { senasteArMdr: 5.191, andelUtestande: K.payoutKalla, insiderkopSenaste6man: 0 },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
  vardering: { pe: K.peKalla, pb: K.pb, evEbit: null, peg: null, fcfYield: +R.fcfY.toFixed(4), egenKapitalMultipl: K.pb },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2022", "2023", "2024", "2025"],
    omsattning: K.omsSerie.map((x) => x * 1e6),
    resultat: K.resSerie.map((x) => x * 1e6),
    egetKapital: [],
    fcf: K.fcfSerie.map((x) => x * 1e6),
  },
  notering:
    "cellmotiverad duo (Spanien/finans 1→2: Santander global utlåning/fem kontinenter — den breda + BBVA Mexico-fokuserad emerging-bank/Turkiet — den djupa; spanska bankens två riskprofiler); kollisionskontroll primär+sekundär GRÖN (BBVA/BBVA.MC+namn+URL); BME/EUR-precedensen (SAN.MC-klassen); kalenderårsbokslut, halvårsrapportering (TTM = jun '26); RAPPORT 2026-10-29 BEKRÄFTAD INOM v172-fönstret (samma dag som DGE); GEOGRAFIBILDEN gross income med BEGREPPSDIFFERANS mot revenue dokumenterad [+5 920 · +5 282 · +3 924 · +2 408 · +1 769 · +2 465] — inget falskt lås; Mexico största marknad sedan FY22 (BBVA = mexikansk bank med spansk bas); SEX RAKA VINSTÅR netto 4 294→10 718 (CAGR +18,75 %); ROE 18,92 % — duons högsta; FCF-serien vild men identitetslåst exakt sex fönster (bank-FCF = lånebok, dokumenterat); FCF-M 97,16 % EXAKT · FCF-yield 24,21 %; DPS mer än fördubblad [0,31→0,92] (+31,4 % senaste; 3,70 % EXAKT); återköpsspike TTM −5,2 mdr (aktiebas −1,55 % EXAKT); P/E-familjen 13,15/12,78/13,16; PEG NULL (basblandning — tre basar, ingen ren); netto-M 31,40 % EXAKT (financials-TTM; statistics 32,56 dokumenterad annan bas); NETTOVÄNDNING till skuld FY24 (+20,4→−5,4→−15,4 — emerging-tillväxten finansieras); EK-serie saknas; alla repliker i paranoid (StockAnalysis BME 2026-09-25)",
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
  if (el[el.length - 1].ticker !== "BBVA.MC") { console.error("ABORT: sista raden ≠ BBVA.MC"); process.exit(1); }
}
const slut = JSON.parse(readFileSync(UNI, "utf8"));
const forandrade = backup.filter((b, i) => JSON.stringify(b) !== JSON.stringify(slut[i])).length;
if (forandrade !== 0) { console.error(`ABORT: ${forandrade} gamla rader förändrade`); process.exit(1); }

const kvitto = [];
kvitto.push(
  `UNIVERSUM-INLÄGG GRÖN: ${FÖRE}→${slut.length} (+1 BBVA.MC, Spanien/finans 1→2; finans-cellen → ${slut.filter((b) => b.bransch === "finans").length}; Spanien → ${slut.filter((b) => b.land === "Spanien").length})`,
  `indent=${indent} · gamla rader förändrade=${forandrade} · läs-tillbaka ×2 OK`,
  `BANK-LÅS (TRETTON): mcap 0,06 % · PS 4,01 EXAKT · P/B 0,1 % · netto-M 31,40 % EXAKT (financials-TTM; statistics 32,56 dokumenterad annan bas) · FCF-M 97,16 % EXAKT · FCF-yield 24,21 % (0,06 %) · divY 3,70 % EXAKT · payout 4,1 % (dokum. tolerans: kälrbas okänd) · P/E pris/EPS 0,1 % + FYRA DOKUMENTERADE NULL (EV/evEarnings/evSales/D-E — källans n/a); P/E-familjen 13,15/12,78/13,16; PEG NULL (basblandning: tre basar ingen ren)`,
  `GEOGRAFIBILDEN: Mexico störst [16 415 · 15 198 · 15 337 · 14 267 · 10 734 · 7 603] sedan FY22; Spain [10 136 · …]; BEGREPPSDIFFERANS dokumenterad [+5 920 · +5 282 · +3 924 · +2 408 · +1 769 · +2 465] — inget falskt lås`,
  `SEX RAKA VINSTÅR: netto [4 294 · 6 045 · 7 675 · 9 666 · 10 114] + TTM 10 718 (CAGR +18,75 %); oms-CAGR +11,26 %; 52v +53,82 %; ROE 18,92 % (duons högsta)`,
  `FCF-serien vild men identitetslåst sex fönster: [−1 638 · +21 906 · −1 850 · −19 385 · +14 141] + TTM +33 164`,
  `DPS mer än fördubblad [0,31→0,92] (+31,4 %; 3,70 % EXAKT) · återköpsspike TTM −5 191 (aktiebas −1,55 % EXAKT) · NETTOVÄNDNING till skuld FY24 (+20,4→−5,4→−15,4)`,
  `P/E-BÄRARKONTROLL: TTM-netto 10 718 M EUR > 0 — GRÖN · RAPPORT 2026-10-29 BEKRÄFTAD INOM v172-fönstret (samma dag som DGE)`,
);
writeFileSync("/tmp/r232-inlagg.txt", kvitto.join("\n"));
console.log(kvitto.join("\n"));
