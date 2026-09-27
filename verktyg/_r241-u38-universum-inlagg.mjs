#!/usr/bin/env node
/**
 * _r241-u38-universum-inlagg.mjs — v173 dataset-djup rond 241 U38 (+1 — UNIVERSUMETS
 * 300:E BOLAG): Safran S.A. SAF.PA (Frankrike/industri 1→2). Cellmotiverad duo:
 * Airbus (flygkroppen — volymcykeln) + Safran (motorerna — CFM/LEAP,
 * eftermarknadens installationsbas): flygets två ben. EPA/EUR (AIR.PA-precedensen).
 * NETTO-SERIEN ENGÅNGSPOSTSBUREN DOKUMENTERAD: [43 · −2 459 · 3 444 · −667 · 7 177] +
 * TTM 3 882 (FY22 = ryska exponerings-/valutaderivatposterna; FY24-justering; FY25-topp —
 * resultatCAGR5ar = NULL, ej definierbar ur negativ bas). FCF DÄREMOT: STIGANDE SEX RAKA
 * ÅR [1 994 → 5 232] identitetslåst exakt — motorernas eftermarknad syns i kassan.
 * DIVISIONSDIFFERANSEN dokumenterad: tre ben = totalen inom ±549 M (max 2,6 %) sex
 * fönster — källans elimineringsovänliga vy (TD/BBVA-klassen). PEG NULL (kälrbas 26,8 %
 * mot konsensus 24,84; fwd-replik 1,15; trailing 1,45 — ingen ren). Kvitto: /tmp/r241-inlagg.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const FÖRE = u.length;
if (u.some((b) => ["SAF", "SAF.PA"].includes(b.ticker) || /safran/i.test(b.namn ?? "") || (b.kallor?.[0]?.url ?? "").includes("/epa/SAF/"))) {
  console.error("ABORT: SAF finns redan på disken");
  process.exit(1);
}

const K = {
  prisEUR: 334.30, aktierMdr: 0.41454, mcap: 138.58, eps: 9.31, peKalla: 35.90,
  fwdPe: 28.58, pb: 9.16, psKalla: 4.13, evKalla: 137.64,
  evEarnings: 35.46, evSales: 4.10, evEbit: 27.96, pFcf: 26.49, pocf: 20.70,
  roe: 0.2749, roic: 0.2359, roce: 0.2167, wacc: 0.0923,
  ebitM: 0.1394, pretaxM: 0.1730, bruttoM: 0.4681,
  nettoTtm: 3.882, revTtm: 33.569, fcfTtm: 5.232,
  skuld: 5.107, ek: 15.126, kassa: 6.667, de: 0.34, rantaTackning: 41.77,
  div: 3.35, divYieldKalla: 0.0100, payoutKalla: 0.3581,
  // EUR-serier, dec-slut FY2022–FY2025
  omsSerie: [19523, 23651, 27716, 31189],
  resSerie: [-2459, 3444, -667, 7177],           // engångspostsburen — CAGR ej definierbar
  fcfSerie: [3009, 3447, 3689, 4483],
  ocfSerie: [3545, 4270, 4733, 5721], ocfTtm: 6695,
  capexSerie: [536, 823, 1044, 1238], capexTtm: 1463,
  bruttoSerie: [0.4943, 0.4696, 0.4740, 0.4855, 0.4804],  // FY21–FY25
  // Divisioner [TTM · FY25 · FY24 · FY23 · FY22 · FY21], M EUR
  propulsion: [17305, 15668, 13652, 11876, 9506, 7439],
  equipment: [13625, 12302, 10618, 8835, 7535, 6325],
  interiors: [3188, 3349, 3037, 2477, 1978, 1475],
  divTotal: [33569, 31189, 27716, 23651, 19523, 15133],
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
  ["nettoM mot källans rad", R.nettoM, 0.1156, 0.02],
  ["fcfM mot källans rad", R.fcfM, 0.1559, 0.02],
  ["fcfY mot källrad", R.fcfY, 0.0378, 0.02],
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
if (!(R.peGaap > K.peKalla - 1 && R.peGaap < K.peKalla + 1)) {
  console.error(`ABORT: P/E-familjen utanför spann (GAAP ${R.peGaap.toFixed(2)})`);
  process.exit(1);
}
// FCF-IDENTITET + STIGANDE SEX RAKA
const fcfIdent = [];
for (let i = 0; i < 4; i++) fcfIdent.push([K.ocfSerie[i] - K.capexSerie[i], K.fcfSerie[i]]);
fcfIdent.push([K.ocfTtm - K.capexTtm, 5232]);
if (fcfIdent.some(([a, b]) => Math.abs(a - b) > 0.001)) {
  console.error("ABORT: FCF-serien ej OCF−capex-låst");
  process.exit(1);
}
const stigande = K.fcfSerie.every((x, i) => i === 0 || x > K.fcfSerie[i - 1]) && 5232 > K.fcfSerie[3];
if (!stigande) { console.error("ABORT: FCF-serien ej stigande sex raka"); process.exit(1); }
// NETTO-SERIENS engångspostsnatur: FY22 och FY24 negativa — CAGR-fältet NULL
if (!K.resSerie.some(x => x < 0)) { console.error("ABORT: netto-seriens engångspostsnatur förlorad"); process.exit(1); }
// DIVISIONSDIFFERANSEN dokumenterad: [+549 · +130 · −409 · −463 · −504 · +106]
const divNycklar = ["propulsion", "equipment", "interiors"];
const divSum = K.divTotal.map((x, i) => [divNycklar.reduce((s, k) => s + K[k][i], 0), x]);
const vantaDiff = [549, 130, -409, -463, -504, 106];
if (!divSum.every(([s, x], i) => s - x === vantaDiff[i])) {
  console.error("ABORT: divisionsdifferansen avviker: " + divSum.map(([s, x]) => `${s - x}`).join(", "));
  process.exit(1);
}
if (K.nettoTtm <= 0) { console.error("ABORT: P/E-bärarkontroll — TTM-netto ≤ 0"); process.exit(1); }
// Kaskad: KÄRKKRAV netto-M < EBIT-M < brutto-M; pretax-M FÅR ligga över EBIT-M vid
// positivt finansnetto (Safran: nettokassan bär räntenetto — dokumenterat i paranoid)
if (!(R.nettoM < K.ebitM && K.ebitM < K.bruttoM)) { console.error("ABORT: normal kaskad bruten (netto→EBIT→brutto)"); process.exit(1); }
if (K.pretaxM > K.ebitM && !(R.nettoM < K.pretaxM)) { console.error("ABORT: pretax-avvikelsen ej av typen finansnetto"); process.exit(1); }

const RAD = {
  ticker: "SAF.PA",
  namn: "Safran S.A.",
  bransch: "industri",
  land: "Frankrike",
  valuta: "EUR",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-25", url: "https://stockanalysis.com/quote/epa/SAF/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/)", paranoid:
    "EPA-PRIMÄRNOTING (underlag S&P Global Market Intelligence via StockAnalysis; senaste handelsdag 2026-09-24, hämtat 2026-09-25 — close 334,30 EUR; 50/200-dagars MA 339,39/315,94 — strax under 50-MA över 200-MA; 52v +14,64 %; beta 0,96; konsensus PT 382,86 = +14,5 % Buy 22 analytiker); färskhämtning med FYRA paneler; KALENDERÅRSBOKSLUT (31 dec; TTM = jun '26 efter H1 — HALVÅRSRAPPORTERING; NÄSTA RAPPORT 2027-02-09 BEKRÄFTAD = årsbokslut — UTANFÖR v172-fönstret); EPA/EUR-PRECEDENSEN (AIR.PA/TTE.PA-klassen) — UNIVERSUMETS 300:E BOLAG: " +
    "pris 334,30 EUR, mcap 138,58 mdr EUR på 0,41454 mdr aktier (replik 0,41454×334,30 = 138,58 — EXAKT på fyra siffror), " +
    "P/E-FAMILJEN: källrad 35,90 · GAAP 138,58/3,882 = 35,72 · pris/EPS 334,30/9,31 = 35,897 (0,008 % EXAKT); EPS-raden 9,31 mot beräknad netto/aktier 9,366 — aktieavrundning; fwd P/E 28,58 ⇒ implied EPS +26 % (flygets konsensus, referens); PEG-KÄLLRAD 1,34 MED BASBLANDNING (kälrbas 26,8 % mot konsensus 3Y EPS 24,84; fwd-replik 28,58/24,84 = 1,15; trailing 1,45 — ingen ren) ⇒ fältet NULL (SN.L-precedensen); PS 4,13 EXAKT · P/B 9,16 EXAKT (138,58/15,13) · P/FCF 26,49 · P/OCF 20,70; " +
    "EV-DEKOMPOSITION: 138,58 + 5,107 − 6,667 = 137,02 mot källans 137,64 (0,45 % — pension/NCI-differens, dokumenterad); EV < mcap = NETTOKASSA +1,56 mdr (+3,77/aktie); EV/Earnings 35,46 (0,04 %) · EV/Sales 4,10 EXAKT · EV/EBIT 27,96 · EV/EBITDA 21,12; " +
    "NETTO-SERIEN ENGÅNGSPOSTSBUREN DOKUMENTERAD: [43 · −2 459 · 3 444 · −667 · 7 177] + TTM 3 882 — FY22:s −2,5 mdr = ryska exponerings-/valutaderivatposterna; FY24:s −667 = artikeljusteringen; FY25:s 7 177 topp (ev. engångsdele); TTM 3 882 = normaliserat löpande; RESULTAT-CAGR = NULL (ej definierbar ur negativ FY22-bas — dokumenterat); marginal-raderna bär samma ([0,28 · −12,60 · 14,56 · −2,41 · 23,01] % profit-M); OMSÄTTNINGEN DÄREMOT RAK: [15 293 · 19 523 · 23 651 · 27 716 · 31 189] + TTM 33 569 (CAGR +16,90 % FY22→25; flygets återhämtningsmotor: +27,7 → +21,1 → +17,2 → +12,5 → TTM +7,6); " +
    "FCF = SERIENS SANNING: [1 994 · 3 009 · 3 447 · 3 689 · 4 483] + TTM 5 232 — STIGANDE SEX RAKA ÅR, identitetslåst exakt (OCF−capex: [2 436−442 · 3 545−536 · 4 270−823 · 4 733−1 044 · 5 721−1 238 · 6 695−1 463]); FCF-M 15,59 % EXAKT > netto-M 11,56 % EXAKT — CFM/LEAP-flottans eftermarknadsservice syns i kassan, inte i bokförda engångsposter; FCF-yield 3,78 % · FCF-CAGR +14,2 %; bruttomarginal [49,4 · 47,0 · 47,4 · 48,6 · 48,0] % (medel 48,1 %, spridning 2,5 pp — motorernas moat); " +
    "DIVISIONSBILDEN (tre ben [TTM · FY25 · FY24 · FY23 · FY22 · FY21] M EUR): Aerospace Propulsion [17 305 · 15 668 · 13 652 · 11 876 · 9 506 · 7 439] (52 % — motorerna) + Aircraft Equipment, Defence Aerosystems [13 625 · 12 302 · 10 618 · 8 835 · 7 535 · 6 325] (41 %) + Aircraft Interiors [3 188 · 3 349 · 3 037 · 2 477 · 1 978 · 1 475] (9,5 %) — DIVISIONSDIFFERANSEN DOKUMENTERAD [+549 · +130 · −409 · −463 · −504 · +106] (max 2,6 % — källans elimineringsvy strider mot koncerntotalen, TD/BBVA-klassen; inget falskt exakthetslås); TRE ben ALLA VÄXANDE varje år; " +
    "UTDELNING + ÅTERKÖP: DPS current 3,35 EUR (1,00 % EXAKT replik 3,35/334,30; +15,52 % senaste); payout-källrad 35,81 % (replik 3,35/9,31 = 35,98 % — 0,5 %); utdelningsbelopp [−183 · −213 · −564 · −911 · −1 216] TTM −1 390 (mer än fördubblad på två år) + ÅTERKÖP [−73 · −270 · −1 535 · −1 320 · −1 358] TTM −1 564 — återköp och utdelning lika stora ben; aktieantal +0,97 % trots köpen (optionsprogram — dokumenterat); " +
    "LÖNSAMHET — ELITEN: ROE 27,49 % · ROIC 23,59 % mot WACC 9,23 % (gap +14,36 p — universumets bredaste; installationsoch eftermarknads-moaten) · räntetäckning 41,77 · D/E 0,34 (0,7 %) · Debt/EBITDA 0,81 · skatt 31,55 % · institutionsägande 38,25 %; kaskaden TTM: netto-M 11,56 % EXAKT < EBIT-M 13,94 % < brutto-M 46,81 % (pretax-M 17,30 % över EBIT — ÖVRIGA INTÄKTER, ev. räntenetto på nettokassan — dokumenterad); balansserier M EUR [FY21–FY25]: kassa [5 247 · 6 687 · 6 681 · 6 519 · 6 848] nu 6 667 · skuld [7 149 · 6 975 · 6 599 · 5 078 · 5 326] nu 5 107 · netto [−1 902 · −288 · +82 · +1 441 · +1 522] nu +1 562 (nettokassa-eran sedan FY23); " +
    "kandidatur: CELLMOTIVERAD duo enligt U30-mönstret — Frankrike/industri-cellens två ben: Airbus (flygkroppen: volymcykeln, orderbacklog) + Safran (motorerna: CFM/LEAP-duopol med GE, eftermarknadens installationsbas — varje leverad motor blir 20 års service): flygets vertikal i en cell; P/E-bärarkriteriet kontrollerat FÖRE leverans (TTM-netto 3 882 M EUR > 0 — GRÖN; Sony/Honda-doktrinen); industri-cellen 1→2, Frankrike 26→27 — UNIVERSUMETS 300:E BOLAG (MILESTONE: dataset-djup-spårets jämna hundrataal); NÄSTA RAPPORT 2027-02-09 (årsbokslut — utanför v172)." }],
  hamtat: "2026-09-25",
  pris: K.prisEUR,
  marknadsKapitalMdr: K.mcap,
  tillvaxt: {
    omsattningCAGR5ar: +R.omsCagr3.toFixed(4),
    resultatCAGR5ar: null,
    omsattningTillvaxtTTM: 0.0763,
    prognosTillvaxt: 0.1215,
  },
  lonksamhet: {
    roe: K.roe, roic: K.roic, bruttoMarginal: K.bruttoM, ebitMarginal: K.ebitM,
    nettoMarginal: +R.nettoM.toFixed(4), fcfMarginal: +R.fcfM.toFixed(4),
  },
  stabilitet: {
    skuldEgenkapital: K.de, rantaTackning: K.rantaTackning, fcfPositivaSenaste5: 5,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: 0,
  },
  aterkop: { senasteArMdr: 1.564, andelUtestande: K.payoutKalla, insiderkopSenaste6man: 0 },
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
    "cellmotiverad duo (Frankrike/industri 1→2: Airbus flygkroppens volymcykel + Safran motorernas eftermarknads-moat — CFM/LEAP-duopolet med GE; flygets vertikal i en cell); kollisionskontroll primär+sekundär GRÖN (SAF/SAF.PA+namn+URL); EPA/EUR (AIR.PA-precedensen); kalenderårsbokslut, halvårsrapportering (TTM = jun '26); RAPPDAG 2027-02-09 (årsbokslut, utanför v172); NETTO-SERIEN ENGÅNGSPOSTSBUREN DOKUMENTERAD [43 · −2 459 · 3 444 · −667 · 7 177] + TTM 3 882 (FY22 ryska/valutaposter; FY24 justering; FY25 topp; TTM normaliserat) — RESULTAT-CAGR NULL (negativ bas); OMSÄTTNINGEN RAK (CAGR +16,90 %; +27,7→+7,6); FCF = SERIENS SANNING: stigande SEX RAKA [1 994→5 232] identitetslåst exakt; FCF-M 15,59 > netto-M 11,56 (båda EXAKTA); bruttomarginal ~48 %; DIVISIONSBILDEN tre ben (Propulsion 52 · Equipment 41 · Interiors 9,5) — differansen [+549 · +130 · −409 · −463 · −504 · +106] max 2,6 % dokumenterad (TD/BBVA-klassen); P/E-familjen 35,90/35,72/35,897 (0,008 %!); PEG NULL (basblandning); PS/P/B EXAKTA · EV 0,45 % (pension/NCI dokumenterad) · NETTOKASSA +1,56 mdr; DPS 3,35 (1,00 % EXAKT; +15,5 %) + återköp −1,6 mdr TTM (lika stora ben; aktieantal +0,97 % pga optionsprogram); ROIC-gap +14,36 p — UNIVERSUMETS BREDASTE; räntetäckning 41,77; pretax-M över EBIT-M (räntenetto, dokumenterad); EK-serie saknas; alla repliker i paranoid (StockAnalysis EPA 2026-09-25)",
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
  if (el[el.length - 1].ticker !== "SAF.PA") { console.error("ABORT: sista raden ≠ SAF.PA"); process.exit(1); }
}
const slut = JSON.parse(readFileSync(UNI, "utf8"));
const forandrade = backup.filter((b, i) => JSON.stringify(b) !== JSON.stringify(slut[i])).length;
if (forandrade !== 0) { console.error(`ABORT: ${forandrade} gamla rader förändrade`); process.exit(1); }

const kvitto = [];
kvitto.push(
  `UNIVERSUM-INLÄGG GRÖN: ${FÖRE}→${slut.length} (+1 Safran SAF.PA — UNIVERSUMETS 300:E BOLAG; Frankrike/industri 1→2; Frankrike → ${slut.filter((b) => b.land === 'Frankrike').length})`,
  `indent=${indent} · gamla rader förändrade=${forandrade} · läs-tillbaka ×2 OK`,
  `REPLIKER (TRETTON LÅS — ÅTTA EXAKTA): mcap EXAKT (0,0004 %) · PS EXAKT · P/B EXAKT · netto-M EXAKT · FCF-M EXAKT · divY EXAKT · payout 0,5 % · P/E pris/EPS 0,008 % EXAKT · EV/Sales EXAKT · EV/Earnings 0,04 % · fcfY 0,2 % · D/E 0,7 % · EV 0,45 % (pension/NCI dokumenterad); P/E-familjen 35,90/35,72/35,897; PEG NULL (basblandning)`,
  `NETTO-SERIEN ENGÅNGSPOSTSBUREN: [43 · −2 459 · 3 444 · −667 · 7 177] + TTM 3 882 — resultat-CAGR NULL (negativ bas dokumenterad); OMSÄTTNINGEN RAK (CAGR +16,90 %)`,
  `FCF = SERIENS SANNING: STIGANDE SEX RAKA [1 994 · 3 009 · 3 447 · 3 689 · 4 483] + TTM 5 232 — identitetslåst exakt; FCF-M 15,59 > netto-M 11,56`,
  `DIVISIONSBILDEN tre ben (Propulsion 52 % · Equipment 41 % · Interiors 9,5 %) — differansen max 2,6 % dokumenterad (TD/BBVA-klassen)`,
  `UTDELNING 3,35 EUR (1,00 % EXAKT; +15,5 %) + ÅTERKÖP −1,6 mdr TTM · ROIC-gap +14,36 p (universumets bredaste) · räntetäckning 41,77 · NETTOKASSA +1,56 mdr`,
  `P/E-BÄRARKONTROLL: TTM-netto 3 882 M EUR > 0 — GRÖN · RAPPDAG 2027-02-09 (årsbokslut, utanför v172)`,
);
writeFileSync("/tmp/r241-inlagg.txt", kvitto.join("\n"));
console.log(kvitto.join("\n"));
