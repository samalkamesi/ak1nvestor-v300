#!/usr/bin/env node
/**
 * _r242-u39-universum-inlagg.mjs — v173 dataset-djup rond 242 U39 (+1):
 * EssilorLuxottica EL.PA (Frankrike/halso 1→2). Cellmotiverad duo: Sanofi
 * (läkemedelspipelinen — patentsykeln) + EL (optisk korrektion — glasögonens
 * förbrukningscykel): hälsans två hastigheter (behandlingen mot korrektionen).
 * EPA/EUR (SAN.PA-precedensen). PEG 1,97 MED DOKUMENTERAD BAS (fwd 18,81/
 * konsensus 3Y EPS 9,56 = 1,967 — TD/IFX-precedensen). PAYOUT med RÄTT bas
 * EXAKT (betald TTM-utdelning 1 669/netto 2 494 = 66,92 %; DPS-raden 4,00
 * deklarerad nivå). TVÅ-BENSLÅS: Professional Solutions + Direct to Consumer
 * = totalen EXAKT 4 av 6 fönster (±1 M i två — 0,004 %). 52v-KURSKOLLAPSEN
 * −47,27 % dokumenterad (PT-gap +62,9 % = konsensus). Kvitto: /tmp/r242-inlagg.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const FÖRE = u.length;
if (u.some((b) => ["EL", "EL.PA"].includes(b.ticker) || /essilor/i.test(b.namn ?? "") || (b.kallor?.[0]?.url ?? "").includes("/epa/EL/"))) {
  console.error("ABORT: EL finns redan på disken");
  process.exit(1);
}

const K = {
  prisEUR: 144.70, aktierMdr: 0.45959, mcap: 66.50, eps: 5.35, peKalla: 27.04,
  fwdPe: 18.81, pegKalla: 1.97, pb: 1.67, psKalla: 2.27, evKalla: 80.60,
  evEarnings: 32.32, evSales: 2.75, evEbit: 21.48, pFcf: 17.31, pocf: 12.58,
  roe: 0.0672, roic: 0.0535, roce: 0.0716, wacc: 0.0623,
  ebitM: 0.1282, pretaxM: 0.1183, bruttoM: 0.6003,
  nettoTtm: 2.494, revTtm: 29.285, fcfTtm: 3.842,
  skuld: 15.316, ek: 39.93, kassa: 1.931, de: 0.38, rantaTackning: 10.57,
  div: 4.00, divYieldKalla: 0.0276, payoutKalla: 0.6692,
  utdelningTtm: 1669,
  // EUR-serier, dec-slut FY2022–FY2025
  omsSerie: [24494, 25395, 26508, 28491],
  resSerie: [2152, 2289, 2359, 2315],
  fcfSerie: [3211, 3330, 3352, 3766],
  ocfSerie: [4783, 4861, 4874, 5291], ocfTtm: 5285,
  capexSerie: [1572, 1531, 1522, 1525], capexTtm: 1443,
  bruttoSerie: [0.6083, 0.6276, 0.6222, 0.6245, 0.5974],  // FY21–FY25
  // Divisioner [TTM · FY25 · FY24 · FY23 · FY22 · FY21], M EUR
  profSol: [13852, 13600, 12547, 12199, 11770, 10443],
  dtc: [15433, 14891, 13960, 13195, 12724, 9377],
  divTotal: [29285, 28491, 26508, 25395, 24494, 19820],
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
  payoutReplik: K.utdelningTtm / (K.nettoTtm * 1000),
  pegBas: K.fwdPe / 9.56,
  epsBeraknad: K.nettoTtm / K.aktierMdr,
};
const avv = (a, b) => Math.abs(a / b - 1);
const exakt = [
  ["mcap", R.mcapReplik, K.mcap, 0.02],
  ["ps", R.psReplik, K.psKalla, 0.02],
  ["pb", R.pbReplik, K.pb, 0.02],
  ["ev-dekomposition", R.evReplik, K.evKalla, 0.02],
  ["nettoM mot källans rad", R.nettoM, 0.0852, 0.02],
  ["fcfM mot källans rad", R.fcfM, 0.1312, 0.02],
  ["fcfY mot källrad", R.fcfY, 0.0578, 0.02],
  ["divYield mot källrad", R.divY, K.divYieldKalla, 0.02],
  ["de", R.deReplik, K.de, 0.02],
  ["payout med RÄTT bas (betald TTM-utdelning 1 669/netto 2 494 — DPS-raden 4,00 är deklarerad nivå, dokumenterad)", R.payoutReplik, K.payoutKalla, 0.02],
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
if (avv(R.pegBas, K.pegKalla) > 0.005) { console.error(`ABORT: PEG-basen avviker (${R.pegBas.toFixed(4)} vs ${K.pegKalla})`); process.exit(1); }
const fcfIdent = [];
for (let i = 0; i < 4; i++) fcfIdent.push([K.ocfSerie[i] - K.capexSerie[i], K.fcfSerie[i]]);
fcfIdent.push([K.ocfTtm - K.capexTtm, 3842]);
if (fcfIdent.some(([a, b]) => Math.abs(a - b) > 0.001)) {
  console.error("ABORT: FCF-serien ej OCF−capex-låst");
  process.exit(1);
}
const stigande = K.fcfSerie.every((x, i) => i === 0 || x > K.fcfSerie[i - 1]) && 3842 > K.fcfSerie[3];
if (!stigande) { console.error("ABORT: FCF-serien ej stigande från FY22"); process.exit(1); }
// TVÅ-BENSLÅS: 4 exakta fönster, ±1 M i två
const divSum = K.divTotal.map((x, i) => [K.profSol[i] + K.dtc[i], x]);
const vantaDiff = [0, 0, -1, -1, 0, 0];
if (!divSum.every(([s, x], i) => s - x === vantaDiff[i])) {
  console.error("ABORT: två-bensdifferansen avviker: " + divSum.map(([s, x]) => `${s - x}`).join(", "));
  process.exit(1);
}
if (K.nettoTtm <= 0) { console.error("ABORT: P/E-bärarkontroll — TTM-netto ≤ 0"); process.exit(1); }
if (!(R.nettoM < K.pretaxM && K.pretaxM < K.ebitM && K.ebitM < K.bruttoM)) { console.error("ABORT: normal kaskad bruten"); process.exit(1); }

const RAD = {
  ticker: "EL.PA",
  namn: "EssilorLuxottica S.A.",
  bransch: "halso",
  land: "Frankrike",
  valuta: "EUR",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-25", url: "https://stockanalysis.com/quote/epa/EL/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/)", paranoid:
    "EPA-PRIMÄRNOTING (underlag S&P Global Market Intelligence via StockAnalysis; senaste handelsdag 2026-09-24, hämtat 2026-09-25 — close 144,70 EUR · 52v-KURSKOLLAPSEN −47,27 % DOKUMENTERAD (priset under 50-MA 158,71 OCH 200-MA 199,17; RSI 40,7; konsensus PT 235,65 = +62,85 % Buy 23 analytiker — gapet mellan pris och konsensus är årets bredaste i universumsvepet; datafakta utan köpsignal); beta 0,55; färskhämtning med FYRA paneler; KALENDERÅRSBOKSLUT (31 dec; TTM = jun '26 efter H1 — HALVÅRSRAPPORTERING; NÄSTA RAPPORT est. 2026-10-16 — FYRA DAGAR FÖRE v172-fönstrets start 10-20 (PSON 10-12-klassen: kalibreringsläge)); EPA/EUR-PRECEDENSEN (SAN.PA-klassen): " +
    "pris 144,70 EUR, mcap 66,50 mdr EUR på 0,45959 mdr aktier (replik 0,45959×144,70 = 66,50 — EXAKT på fyra siffror), " +
    "P/E-FAMILJEN: källrad 27,04 · GAAP 66,50/2,494 = 26,67 · pris/EPS 144,70/5,35 = 27,06 (0,06 %); EPS-raden 5,35 mot beräknad netto/aktier 5,424 — aktieavrundning; fwd P/E 18,81 ⇒ implied EPS +44 % (konsensusvägen efter kollapsåret, referens); PEG 1,97 MED DOKUMENTERAD BAS (fwd 18,81/konsensus 3Y EPS 9,56 = 1,967 — fältet SATT, TD/IFX-precedensen); PS 2,27 EXAKT · P/B 1,67 (0,3 %) · P/FCF 17,31 · P/OCF 12,58; " +
    "EV-DEKOMPOSITION: 66,50 + 15,316 − 1,931 = 79,885 mot källans 80,60 (0,9 % — fusionens uppskjutna betalningar/NCI, dokumenterad); EV/Earnings 32,32 (0,15 %) · EV/Sales 2,75 EXAKT · EV/EBIT 21,48 · EV/EBITDA 11,73; NETTO-SKULD −13,39 mdr (−29,12/aktie — konstant skuldburen struktur sedan Luxottica-fusionen 2018 + återköpsåren; serien [−9,7 · −10,2 · −9,1 · −11,0 · −10,9] nu −13,4); " +
    "TVÅ-BENSLÅSET (vågens renaste): Professional Solutions [13 852 · 13 600 · 12 547 · 12 199 · 11 770 · 10 443] (optiker/ögonläkare-kanalen — Essilor-glasen + instrumentsidan) + Direct to Consumer [15 433 · 14 891 · 13 960 · 13 195 · 12 724 · 9 377] (Sun/ottica-butikerna — Ray-Ban/Oakley-märkena; STÖRSTA BENET sedan FY23) = totalen EXAKT 4 av 6 fönster, ±1 M i två (0,004 % — källans avrundning); BÅDA BEN VÄXER varje år; DTC har växt förbi Professional (konsumtionsdirektheten segrar); " +
    "RESULTATPROFILEN — STABILITETEN MITT I KURSKOLLPSEN: omsättning [19 820 · 24 494 · 25 395 · 26 508 · 28 491] + TTM 29 285 (CAGR +5,17 % FY22→25; fusionssynergierna + fusionens integrationsår) · netto [1 448 · 2 152 · 2 289 · 2 359 · 2 315] + TTM 2 494 (CAGR +2,46 % — FY25-dip −1,9 %; TTM +7,7 % ny topp) · bruttomarginal [60,8 · 62,8 · 62,2 · 62,5 · 59,7] % (medel 61,5 %, spridning 3,0 pp — glas+märkesmoaten) — VERKSAMHETEN LEVER medan priset kollapsat: fundamental/kurs-divergensen dokumenterad som datafakta; " +
    "FCF-SPEGELN: [3 211 · 3 330 · 3 352 · 3 766] + TTM 3 842 — identitetslåst exakt sex fönster (OCF−capex: [4 545−1 030 · 4 783−1 572 · 4 861−1 531 · 4 874−1 522 · 5 291−1 525 · 5 285−1 443]); stigande sedan FY22-dippen; FCF-M 13,12 % · FCF-yield 5,78 % (av vikt: kollapsen gör yielden hög); FCF-CAGR +5,5 %; " +
    "UTDELNING + ÅTERKÖP: DPS current 4,00 EUR (2,76 % replik 4,00/144,70 = 2,765 % — 0,2 %); PAYOUT-KÄLLRAD 66,92 % med RÄTT bas EXAKT (betald TTM-utdelning 1 669/netto 2 494 = 66,92 % — DPS-raden 4,00 är DEKLARERAD nivå mot BETALD beloppsrad, dokumenterad); utdelningsbeloppens rytm [−138 · −454 · −487 · −1 163 · −547] TTM −1 669 (fransk betalningsårstandardisering — beloppen klipper över räkenskapsår, dokumenterat); FCF-payout 47,85 %; återköp [−317 · −431 · −271 · −274 · −376] TTM −907; aktieantal +0,91 % (optionsprogram); " +
    "LÖNSAMHET: ROE 6,72 % · ROIC 5,35 % mot WACC 6,23 % (gap −0,88 p — svagt: fusionens goodwill-tyngda balans; källan till låga ROE är EK 39,9 mdr mot netto 2,5 — förvärvsburen kapitalstruktur, dokumenterad) · räntetäckning 10,57 · D/E 0,38 (0,9 %) · Debt/EBITDA 2,23 · skatt 23,99 % · institutionsägande 24,02 % (lågt — Delfin/Valentino-hållningar via structures); kaskaden TTM: netto-M 8,52 % EXAKT < pretax-M 11,83 % < EBIT-M 12,82 % < brutto-M 60,03 % (normal); balansserier M EUR [FY21–FY25]: kassa [3 293 · 1 960 · 2 558 · 2 251 · 3 544] nu 1 931 · skuld [13 016 · 12 204 · 11 657 · 13 216 · 14 398] nu 15 316; " +
    "kandidatur: CELLMOTIVERAD duo enligt U30-mönstret — Frankrike/hälso-cellens två hastigheter: Sanofi (läkemedelspipelinen — patentsykkel, R&D-buren) + EssilorLuxottica (optisk korrektion — glasögonens förbrukningscykel, märkes- och kanalmoat): behandlingen mot korrektionen — hälsans infrastruktur i två takter; P/E-bärarkriteriet kontrollerat FÖRE leverans (TTM-netto 2 494 M EUR > 0 — GRÖN; Sony/Honda-doktrinen); hälso-cellen 1→2, Frankrike 22→23; NÄSTA RAPPORT est. 2026-10-16 — FÖRE v172-fönstret (kalibreringsläge som PSON)." }],
  hamtat: "2026-09-25",
  pris: K.prisEUR,
  marknadsKapitalMdr: K.mcap,
  tillvaxt: {
    omsattningCAGR5ar: +R.omsCagr3.toFixed(4),
    resultatCAGR5ar: +R.resCagr3.toFixed(4),
    omsattningTillvaxtTTM: 0.0279,
    prognosTillvaxt: 0.0758,
  },
  lonksamhet: {
    roe: K.roe, roic: K.roic, bruttoMarginal: K.bruttoM, ebitMarginal: K.ebitM,
    nettoMarginal: +R.nettoM.toFixed(4), fcfMarginal: +R.fcfM.toFixed(4),
  },
  stabilitet: {
    skuldEgenkapital: K.de, rantaTackning: K.rantaTackning, fcfPositivaSenaste5: 5,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: 0,
  },
  aterkop: { senasteArMdr: 0.907, andelUtestande: K.payoutKalla, insiderkopSenaste6man: 0 },
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
    "cellmotiverad duo (Frankrike/hälso 1→2: Sanofi läkemedelspipelinen/patentsykeln + EL optisk korrektion/glasögonens förbrukningscykel — behandlingen mot korrektionen); kollisionskontroll primär+sekundär GRÖN (EL/EL.PA+namn+URL); EPA/EUR (SAN.PA-precedensen); kalenderårsbokslut, halvårsrapportering (TTM = jun '26); RAPPDAG est. 2026-10-16 — FYRA DAGAR FÖRE v172-starten (PSON-klassen); 52v-KURSKOLLAPSEN −47,27 % DOKUMENTERAD (pris under båda MA; PT-gap +62,9 % — årets bredaste; datafakta utan köpsignal) MEDAN VERKSAMHETEN LEVER (oms-CAGR +5,17 % · bruttomarginal ~61,5 % · TTM-netto ny topp) — fundamental/kurs-divergensen radens signatur; TVÅ-BENSLÅSET vågens renaste: Professional Solutions + Direct to Consumer (störst sedan FY23) = totalen exakt 4/6 fönster ±1 M; FCF [3 211 · 3 330 · 3 352 · 3 766] + TTM 3 842 identitetslåst exakt (FCF-yield 5,78 % efter kollapsen); DPS 4,00 (2,76 %; 0,2 %) med PAYOUT RÄTT BAS EXAKT (betald 1 669/netto 2 494 = 66,92 %; DPS-raden deklarerad nivå dokumenterad; beloppsrytmens franska betalningsårstandardisering noterad); PEG 1,97 MED DOKUMENTERAD BAS (18,81/9,56); P/E-familjen 27,04/26,67/27,06; PS EXAKT · EV 0,9 % dokumenterad; NETTO-SKULD −13,4 mdr (fusionens struktur + återköpsår); ROIC-gap −0,88 p (goodwill-tyngd EK dokumenterad); D/E 0,38; EK-serie saknas; alla repliker i paranoid (StockAnalysis EPA 2026-09-25)",
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
  if (el[el.length - 1].ticker !== "EL.PA") { console.error("ABORT: sista raden ≠ EL.PA"); process.exit(1); }
}
const slut = JSON.parse(readFileSync(UNI, "utf8"));
const forandrade = backup.filter((b, i) => JSON.stringify(b) !== JSON.stringify(slut[i])).length;
if (forandrade !== 0) { console.error(`ABORT: ${forandrade} gamla rader förändrade`); process.exit(1); }

const kvitto = [];
kvitto.push(
  `UNIVERSUM-INLÄGG GRÖN: ${FÖRE}→${slut.length} (+1 EssilorLuxottica EL.PA, Frankrike/halso 1→2; halso-cellen → ${slut.filter((b) => b.bransch === "halso").length}; Frankrike → ${slut.filter((b) => b.land === "Frankrike").length})`,
  `indent=${indent} · gamla rader förändrade=${forandrade} · läs-tillbaka ×2 OK`,
  `REPLIKER (TRETTON LÅS — ÅTTA EXAKTA): mcap EXAKT (0,45959×144,70 = 66,50 fyra siffror) · PS EXAKT · netto-M EXAKT (8,52) · fcfM 0,1 % · fcfY 0,1 % · PAYOUT med RÄTT bas EXAKT (betald 1 669/2 494 = 66,92 %) · P/E 0,06 % · EV/Sales EXAKT · PB 0,3 % · divY 0,2 % · EV/Earnings 0,15 % · D/E 0,9 % · EV 0,9 % (fusionens uppskjutna/NCI dokumenterad); P/E-familjen 27,04/26,67/27,06; PEG 1,97 MED DOKUMENTERAD BAS (18,81/9,56 = 1,967)`,
  `52v-KURSKOLLPSEN −47,27 % DOKUMENTERAD (PT-gap +62,9 % = årets bredaste) MEDAN VERKSAMHETEN LEVER: oms-CAGR +5,17 % · netto-CAGR +2,46 % · TTM-netto ny topp 2 494`,
  `TVÅ-BENSLÅSET vågens renaste: Professional Solutions + Direct to Consumer = totalen EXAKT 4/6 fönster (±1 M i två = 0,004 %); DTC störst sedan FY23`,
  `FCF [3 211 · 3 330 · 3 352 · 3 766] + TTM 3 842 — identitetslåst exakt; FCF-yield 5,78 % efter kollapsen · DPS 4,00 (2,76 %)`,
  `P/E-BÄRARKONTROLL: TTM-netto 2 494 M EUR > 0 — GRÖN · RAPPDAG est. 2026-10-16 (fyra dagar före v172-starten — PSON-klassen)`,
);
writeFileSync("/tmp/r242-inlagg.txt", kvitto.join("\n"));
console.log(kvitto.join("\n"));
