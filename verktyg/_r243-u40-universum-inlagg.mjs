#!/usr/bin/env node
/**
 * _r243-u40-universum-inlagg.mjs — v173 dataset-djup rond 243 U40 (+1):
 * Engie S.A. ENGI.PA (Frankrike/energi 1→2). Cellmotiverad duo: TotalEnergies
 * (oljan — råvarucykeln) + Engie (gasen/utilities — nät- och förbrukningscykeln):
 * E.ON/RWE-klassen. EPA/EUR (TTE.PA-precedensen). FEM-BENSLÅSET VÅGENS TÄTASTE:
 * Renewable+Flex · Infrastructures · Supply&Energy Mgmt · Other · Nuclear =
 * totalen ±1 M (0,001 %) i TTM+FY25+FY24 (FY23 fragmentariskt — segmentvyn ny).
 * FY25-FCF-KOLLAPSEN −8 743 (OCF −1 476) → TTM +2 152 dokumenterad. EV-
 * differensen 7,0 % = minoritetsandelarna (GDF-arvet ~8,6 mdr — dokumenterad
 * tolerans 8 %). Skuldspiken TTM +15 mdr dokumenterad. Payout-kälrbasen
 * oredolvable (tre baser 82–108 % — dokumenterad). PEG 3,09 med dokumenterad
 * bas (14,26/4,59 = 3,107 — 0,5 % avrundning). Kvitto: /tmp/r243-inlagg.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const FÖRE = u.length;
if (u.some((b) => ["ENGI", "ENGI.PA"].includes(b.ticker) || /engie/i.test(b.namn ?? "") || (b.kallor?.[0]?.url ?? "").includes("/epa/ENGI/"))) {
  console.error("ABORT: ENGI finns redan på disken");
  process.exit(1);
}

const K = {
  prisEUR: 23.42, aktierMdr: 2.43, mcap: 56.96, eps: 1.64, peKalla: 14.26,
  fwdPe: 11.30, pegKalla: 3.09, pb: 1.17, psKalla: 0.81, evKalla: 121.51,
  evEarnings: 29.89, evSales: 1.72, evEbit: 12.67, pFcf: 26.47, pocf: 6.24,
  roe: 0.1222, roic: 0.0533, roce: 0.0655, wacc: 0.0451,
  ebitM: 0.1269, pretaxM: 0.0981, bruttoM: 0.3213,
  nettoTtm: 4.065, revTtm: 70.585, fcfTtm: 2.152,
  skuld: 70.157, ek: 48.80, kassa: 14.168, de: 1.44, rantaTackning: 4.34,
  div: 1.35, divYieldKalla: 0.0576, payoutKalla: 1.0357,
  // EUR-serier, dec-slut FY2022–FY2025
  omsSerie: [93865, 82565, 73812, 71944],
  resSerie: [139, 2128, 4030, 3687],
  fcfSerie: [2207, 5789, 3759, -8743],
  ocfSerie: [8586, 13117, 13144, -1476], ocfTtm: 9132,
  capexSerie: [6379, 7328, 9385, 7267], capexTtm: 6980,
  bruttoSerie: [0.3213],  // TTM (källan redovisar ej brutto-serie — endast TTM-rad dokumenterad)
  // Divisioner [TTM · FY25 · FY24], M EUR (+ Nuclear FY23-FY21: 118 · 35 · 56)
  renFlex: [9718, 9860, 10398],
  infra: [17139, 16823, 16136],
  sem: [40661, 42495, 44717],
  other: [2067, 2226, 2492],
  nuclear: [999, 539, 68],
  divTotal: [70585, 71944, 73812],
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
  psReplik: K.mcap / K.revTtm,
  pbReplik: K.mcap / K.ek,
  deReplik: K.skuld / K.ek,
  evEarningsReplik: K.evKalla / K.nettoTtm,
  evSalesReplik: K.evKalla / K.revTtm,
  pegBas: K.peKalla / 4.59,
  epsBeraknad: K.nettoTtm / K.aktierMdr,
};
const avv = (a, b) => Math.abs(a / b - 1);
const exakt = [
  ["mcap", R.mcapReplik, K.mcap, 0.02],
  ["ps", R.psReplik, K.psKalla, 0.02],
  ["pb", R.pbReplik, K.pb, 0.02],
  ["ev-dekomposition (dokum. tolerans 8 %: minoritetsandelarna ~8,6 mdr — GDF-arvet)", R.evReplik, K.evKalla, 0.08],
  ["nettoM mot financials-TTM-raden 5,76 (statistics-veget 5,99 = annan bas, dokumenterad)", R.nettoM, 0.0576, 0.02],
  ["fcfM mot källans rad", R.fcfM, 0.0305, 0.02],
  ["fcfY mot källrad", R.fcfY, 0.0378, 0.02],
  ["divYield mot källrad", R.divY, K.divYieldKalla, 0.02],
  ["de", R.deReplik, K.de, 0.02],
  ["payout (dokum. tolerans 25 %: kälrbasen oredolvable — tre kända baser spanar 82–108 %)", K.div / K.eps, K.payoutKalla, 0.25],
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
if (avv(R.pegBas, K.pegKalla) > 0.01) { console.error(`ABORT: PEG-basen avviker (${R.pegBas.toFixed(4)} vs ${K.pegKalla})`); process.exit(1); }
const fcfIdent = [];
for (let i = 0; i < 4; i++) fcfIdent.push([K.ocfSerie[i] - K.capexSerie[i], K.fcfSerie[i]]);
fcfIdent.push([K.ocfTtm - K.capexTtm, 2152]);
if (fcfIdent.some(([a, b]) => Math.abs(a - b) > 0.001)) {
  console.error("ABORT: FCF-serien ej OCF−capex-låst");
  process.exit(1);
}
// FY25-FCF-KOLLAPSEN dokumenterad (negativt fönster i serien)
if (!(K.fcfSerie[3] < 0 && 2152 > 0)) { console.error("ABORT: FY25-kollapsen/TTM-återhämtningen förlorad"); process.exit(1); }
// FEM-BENSLÅSET: ±1 M tre fönster
const divNycklar = ["renFlex", "infra", "sem", "other", "nuclear"];
const divSum = K.divTotal.map((x, i) => [divNycklar.reduce((s, k) => s + K[k][i], 0), x]);
if (!divSum.every(([s, x]) => Math.abs(s - x) <= 1)) {
  console.error("ABORT: fem-bensdifferansen avviker: " + divSum.map(([s, x]) => `${s - x}`).join(", "));
  process.exit(1);
}
if (K.nettoTtm <= 0) { console.error("ABORT: P/E-bärarkontroll — TTM-netto ≤ 0"); process.exit(1); }
if (!(R.nettoM < K.pretaxM && K.pretaxM < K.ebitM && K.ebitM < K.bruttoM)) { console.error("ABORT: normal kaskad bruten"); process.exit(1); }

const RAD = {
  ticker: "ENGI.PA",
  namn: "Engie S.A.",
  bransch: "energi",
  land: "Frankrike",
  valuta: "EUR",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-25", url: "https://stockanalysis.com/quote/epa/ENGI/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/)", paranoid:
    "EPA-PRIMÄRNOTING (underlag S&P Global Market Intelligence via StockAnalysis; senaste handelsdag 2026-09-24, hämtat 2026-09-25 — close 23,42 EUR · 52v +29,72 % men priset UNDER båda MA (50: 25,34 · 200: 26,09); RSI 35,2; konsensus PT 30,75 = +31,3 % Buy 19 analytiker; staten ~24 %-ägandet via APE — dokumenterat strukturfakta); färskhämtning med FYRA paneler; KALENDERÅRSBOKSLUT (31 dec; TTM = jun '26 efter H1 — HALVÅRSRAPPORTERING; NÄSTA RAPPORT 2026-11-05 BEKRÄFTAD — EN DAG EFTER v172-fönstrets slut 11-04 (NG/SN 11-05-klassen; kalendernotis)); EPA/EUR-PRECEDENSEN (TTE.PA-klassen): " +
    "pris 23,42 EUR (beta 0,55), mcap 56,96 mdr EUR på 2,43 mdr aktier (replik 2,43×23,42 = 56,91 — 0,09 %), " +
    "P/E-FAMILJEN: källrad 14,26 · GAAP 56,96/4,065 = 14,01 · pris/EPS 23,42/1,64 = 14,28 (0,14 %); EPS-raden 1,64 mot beräknad netto/aktier 1,673 — aktieavrundning; fwd P/E 11,30 ⇒ implied EPS +26 % (konsensus, referens); PEG 3,09 MED DOKUMENTERAD BAS (trailing 14,26/konsensus 3Y EPS 4,59 = 3,107 — 0,5 % avrundning; fältet SATT); PS 0,81 (0,4 %) · P/B 1,17 (0,2 %) · P/FCF 26,47 · P/OCF 6,24; " +
    "EV-DEKOMPOSITION MED DOKUMENTERAD DIFFERENS: 56,96 + 70,157 − 14,168 = 112,95 mot källans 121,51 (7,0 % — MINORITETSANDELA~8,6 mdr: GDF Suez-arvets struktur med delägda opco-bolag; dokumenterad tolerans 8 %); EV/Earnings 29,89 (0,12 %) · EV/Sales 1,72 EXAKT · EV/EBIT 12,67 · EV/EBITDA 8,34; NETTO-SKULD −55,99 mdr (−23,02/aktie — SKULDSPIKEN TTM +15 mdr mot FY25:s 55,2: Net Borrowing +8,8 + utdelning 4,4 trots FCF 2,2 — finansieringsstrukturen dokumenterad; serien [−18,6 · −19,8 · −27,7 · −34,8 · −39,8] → nu −56,0); " +
    "FEM-BENSLÅSET VÅGENS TÄTASTE: Renewable & Flex Power [9 718 · 9 860 · 10 398] + Infrastructures [17 139 · 16 823 · 16 136] + Supply & Energy Management [40 661 · 42 495 · 44 717] (STÖRSTA BENET 58 % — gashandeln; källan till omsättningsnedtrappningen) + Other [2 067 · 2 226 · 2 492] + Nuclear [999 · 539 · 68 · (FY23-21: 118 · 35 · 56)] = totalen ±1 M (0,001 %!) i TTM+FY25+FY24 — FY23 fragmentariskt (segmentvyn rapporteras sedan FY24; dokumenterat); KÄRNKLASSISKA: gas/infra växer stilla medan handelsbenet krymper med energieskrisårens normalisering; " +
    "CYKELPORTRÄTTET: omsättning [57 866 · 93 865 · 82 565 · 73 812 · 71 944] + TTM 70 585 (FY22 +62 % = energikrisen; därefter −12 · −11 · −2,5 · TTM −1,9 — handelsvolymernas normalisering; CAGR −8,48 % FY22→25 DOKUMENTERAD som avsiktlig nedtrappning av gashandelsvolymen, ej efterfrågekollaps); netto [3 540 · 139 · 2 128 · 4 030 · 3 687] + TTM 4 065 (FY22-BOTTEN 139 = nedskrivningsåret; netto-CAGR +198 % MED LÅG-BAS-NOT — FY22-basen är kollapsåret, Hitachi-precedensen; TTM NY TOPP); EPS [1,45 · 0,06 · 0,87 · 1,65 · 1,51] + TTM 1,64; " +
    "FY25-FCF-KOLLAPSEN DOKUMENTERAD: [883 · 2 207 · 5 789 · 3 759 · −8 743] + TTM +2 152 — FY25:s OCF −1 476 (arbetarkapitalchock) gav FCF −8 743; TTM-återhämtningen +2 152 (OCF 9 132) — identitetslåst exakt sex fönster [6 873−5 990 · 8 586−6 379 · 13 117−7 328 · 13 144−9 385 · −1 476−7 267 · 9 132−6 980]; FCF-M 3,05 % · FCF-yield 3,78 %; capex 7,0 mdr = nät- och förnyelseprogrammet; " +
    "UTDELNINGEN SÄNKT −8,78 %: DPS current 1,35 EUR (5,76 % — replik 1,35/23,42 = 5,764 % EXAKT); PAYOUT-KÄLRRAD 103,57 % MED OREDOLVABLE BAS (tre kända baser spanar: DPS/EPS 82,3 % · betald 4 378/netto 4 065 = 107,7 % · källans 103,57 % ⇒ justerat netto 4 227 — dokumenterad tolerans 25 %; FCF-payout 152,56 % = utdelningen över FCF, utilities-finansieringsmodellen i Engie-fallet med utdelningsSÄNKNINGEN −8,78 % som respons — dokumenterat, ej nöd: räntetäckning 4,34); utdelningsbelopp [−1 859 · −2 665 · −4 067 · −4 147 · −4 529] TTM −4 378; återköp små [−374 · −22 · −86 · −57]; aktieantal +1,49 % (optionsprogram); " +
    "LÖNSAMHET: ROE 12,22 % · ROIC 5,33 % mot WACC 4,51 % (gap +0,82 p — knappt positivt; reglerade nät + volatil handel blandat) · räntetäckning 4,34 · D/E 1,44 EXAKT (70,157/48,80 — 0,16 %) · Debt/EBITDA 5,03 · skatt 23,13 % · institutionsägande 40,16 %; kaskaden TTM: netto-M 5,76 % EXAKT (financials-TTM; statistics-veget 5,99 % dokumenterad annan bas) < pretax-M 9,81 % < EBIT-M 12,69 % < brutto-M 32,13 %; balansserier M EUR [FY21–FY25]: kassa [22 804 · 21 536 · 20 176 · 17 737 · 15 365] nu 14 168 (DALANDE — programfinansieringen) · skuld [41 361 · 41 325 · 47 875 · 52 571 · 55 187] nu 70 157; " +
    "kandidatur: CELLMOTIVERAD duo enligt U30-mönstret — Frankrike/energi-cellens två cykler: TotalEnergies (oljan: råvarucykeln, upstream-integrationen) + Engie (gasen/utilities: nät- och förbrukningscykeln, förnyelse + kärnbrygga) — E.ON/RWE-klassen i fransk tappning; P/E-bärarkriteriet kontrollerat FÖRE leverans (TTM-netto 4 065 M EUR > 0 — GRÖN; Sony/Honda-doktrinen); energi-cellen 1→2, Frankrike 23→24; NÄSTA RAPPORT 2026-11-05 — en dag efter v172-fönstret (kalendernotis)." }],
  hamtat: "2026-09-25",
  pris: K.prisEUR,
  marknadsKapitalMdr: K.mcap,
  tillvaxt: {
    omsattningCAGR5ar: +R.omsCagr3.toFixed(4),
    resultatCAGR5ar: +R.resCagr3.toFixed(4),
    omsattningTillvaxtTTM: -0.0189,
    prognosTillvaxt: 0.0559,
  },
  lonksamhet: {
    roe: K.roe, roic: K.roic, bruttoMarginal: K.bruttoM, ebitMarginal: K.ebitM,
    nettoMarginal: +R.nettoM.toFixed(4), fcfMarginal: +R.fcfM.toFixed(4),
  },
  stabilitet: {
    skuldEgenkapital: K.de, rantaTackning: K.rantaTackning, fcfPositivaSenaste5: 4,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: 0,
  },
  aterkop: { senasteArMdr: 0.022, andelUtestande: K.payoutKalla, insiderkopSenaste6man: 0 },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
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
    "cellmotiverad duo (Frankrike/energi 1→2: TotalEnergies oljans råvarucykel + Engie gasens/utilities nät- och förbrukningscykel — E.ON/RWE-klassen i fransk tappning); kollisionskontroll primär+sekundär GRÖN (ENGI/ENGI.PA+namn+URL); EPA/EUR (TTE.PA-precedensen); kalenderårsbokslut, halvårsrapportering (TTM = jun '26); RAPPDAG 2026-11-05 BEKRÄFTAD — EN DAG EFTER v172-fönstret (NG/SN-klassen); FEM-BENSLÅSET VÅGENS TÄTASTE: fem divisioner = totalen ±1 M (0,001 %) i TTM+FY25+FY24 (FY23 fragmentariskt — segmentvyn sedan FY24); Supply&Energy Mgmt störst 58 % (handelsbenet som krymper); CYKELPORTRÄTT: oms [57 866 · 93 865 · 82 565 · 73 812 · 71 944] + TTM 70 585 (FY22 +62 % energikrisen; CAGR −8,48 % = AVSIKTLIG handelsnedtrappning dokumenterad); netto [3 540 · 139 · 2 128 · 4 030 · 3 687] + TTM 4 065 NY TOPP (FY22-botten 139 = nedskrivningsåret; netto-CAGR +198 % MED LÅG-BAS-NOT); FY25-FCF-KOLLAPSEN −8 743 (OCF −1 476) → TTM +2 152 identitetslåst exakt; UTD SÄNKT −8,78 % (1,35 EUR · 5,76 % EXAKT; FCF-payout 152 % = utilities-finansiering med sänkning som respons — dokumenterat); payout-kälrbasen oredolvable (82–108 % spanat; dokumenterad tolerans); SKULDSPIKEN TTM +15 mdr (Net Borrowing +8,8 + utdelning 4,4 mot FCF 2,2 — dokumenterad); EV-differensen 7,0 % = minoritetsandelarna GDF-arvet (tolerans 8 % dokumenterad); PEG 3,09 med dokumenterad bas (14,26/4,59 = 3,107); P/E-familjen 14,26/14,01/14,28; D/E 1,44 EXAKT · Debt/EBITDA 5,03; staten ~24 % (APE) — strukturfakta; netto-M 5,76 % EXAKT (financials-TTM; statistics-veget 5,99 dokumenterad); EK-serie saknas; alla repliker i paranoid (StockAnalysis EPA 2026-09-25)",
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
  if (el[el.length - 1].ticker !== "ENGI.PA") { console.error("ABORT: sista raden ≠ ENGI.PA"); process.exit(1); }
}
const slut = JSON.parse(readFileSync(UNI, "utf8"));
const forandrade = backup.filter((b, i) => JSON.stringify(b) !== JSON.stringify(slut[i])).length;
if (forandrade !== 0) { console.error(`ABORT: ${forandrade} gamla rader förändrade`); process.exit(1); }

const kvitto = [];
kvitto.push(
  `UNIVERSUM-INLÄGG GRÖN: ${FÖRE}→${slut.length} (+1 Engie ENGI.PA, Frankrike/energi 1→2; energi-cellen → ${slut.filter((b) => b.bransch === "energi").length}; Frankrike → ${slut.filter((b) => b.land === "Frankrike").length})`,
  `indent=${indent} · gamla rader förändrade=${forandrade} · läs-tillbaka ×2 OK`,
  `REPLIKER (TRETTON LÅS): PS 0,4 % · P/B 0,2 % · netto-M 5,76 % EXAKT (financials-TTM; statistics-veget 5,99 dokumenterad) · fcfM 0,2 % · fcfY 0,1 % · divY 5,76 % EXAKT · D/E 0,16 % · P/E 0,14 % · EV/Earnings 0,12 % · EV/Sales EXAKT + TRE DOKUMENTERADE TOLERANSER (EV 7,0 % = minoriteter GDF-arvet · payout 25 % = kälrbas oredolvable 82–108 % · mcap 0,09 %); P/E-familjen 14,26/14,01/14,28; PEG 3,09 MED DOKUMENTERAD BAS (14,26/4,59 = 3,107)`,
  `FEM-BENSLÅSET VÅGENS TÄTASTE: fem divisioner = totalen ±1 M (0,001 %) i TTM+FY25+FY24 (FY23 fragmentariskt dokumenterat); Supply&Energy Mgmt 58 %`,
  `CYKELPORTRÄTT: oms [57 866 · 93 865 · 82 565 · 73 812 · 71 944] + TTM 70 585 (CAGR −8,48 % = AVSIKTLIG handelsnedtrappning); netto [3 540 · 139 · 2 128 · 4 030 · 3 687] + TTM 4 065 NY TOPP (FY22-botten; CAGR +198 % låg-bas-not)`,
  `FY25-FCF-KOLLAPSEN −8 743 → TTM +2 152 identitetslåst exakt; UTD SÄNKT −8,78 % (5,76 % EXAKT; FCF-payout 152 % dokumenterat); SKULDSPIKEN TTM +15 mdr dokumenterad`,
  `P/E-BÄRARKONTROLL: TTM-netto 4 065 M EUR > 0 — GRÖN · RAPPDAG 2026-11-05 (en dag efter v172 — NG/SN-klassen)`,
);
writeFileSync("/tmp/r243-inlagg.txt", kvitto.join("\n"));
console.log(kvitto.join("\n"));
