#!/usr/bin/env node
/**
 * _r244-u41-universum-inlagg.mjs — v173 dataset-djup rond 244 U41 (+1):
 * Compagnie de Saint-Gobain SGO.PA (Frankrike/material 1→2). Cellmotiverad
 * duo: Air Liquide (industrigaserna — processkemins insatsvaror) + Saint-Gobain
 * (byggmaterial — konstruktionens insatsvaror): materialgrenens två kunder.
 * EPA/EUR (AI.PA-precedensen). GEO-FEM-BENSLÅS TRE EXAKTA FÖNSTER: Northern
 * Europe + Southern Europe/MEA + Americas + Asia-Pacific + Interna försäljningar
 * (negativt ben) = totalen EXAKT i TTM+FY25+FY24 (allt vyn erbjuder — geo-vyn ny).
 * PAYOUT med RÄTT bas EXAKT (betald TTM 1 118/netto 2 671 = 41,86 %).
 * PEG NULL (basblandning: kälrad 2,09 mot fwd-replik 2,46/trailing 3,01).
 * Rappdag 2026-10-30 INOM v172-fönstret (SJÄTTE bolaget; samma dag som 4503.T).
 * Kvitto: /tmp/r244-inlagg.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const FÖRE = u.length;
if (u.some((b) => ["SGO", "SGO.PA"].includes(b.ticker) || /saint.?gobain/i.test(b.namn ?? "") || (b.kallor?.[0]?.url ?? "").includes("/epa/SGO/"))) {
  console.error("ABORT: SGO finns redan på disken");
  process.exit(1);
}

const K = {
  prisEUR: 69.82, aktierMdr: 0.48923, mcap: 34.16, eps: 5.39, peKalla: 12.96,
  fwdPe: 10.61, pb: 1.31, psKalla: 0.74, evKalla: 46.32,
  evEarnings: 17.34, evSales: 1.00, evEbit: 9.12, pFcf: 10.11, pocf: 6.41,
  roe: 0.1104, roic: 0.1002, roce: 0.1133, wacc: 0.0808,
  ebitM: 0.1076, pretaxM: 0.0792, bruttoM: 0.2717,
  nettoTtm: 2.671, revTtm: 46.226, fcfTtm: 3.378,
  skuld: 17.270, ek: 26.04, kassa: 5.751, de: 0.66, rantaTackning: 8.65,
  div: 2.30, divYieldKalla: 0.0329, payoutKalla: 0.4186,
  utdelningTtm: 1118,
  // EUR-serier, dec-slut FY2022–FY2025
  omsSerie: [51197, 47944, 46571, 46483],
  resSerie: [3003, 2669, 2844, 2883],
  fcfSerie: [3822, 4064, 3486, 3464],
  ocfSerie: [5711, 6035, 5569, 5638], ocfTtm: 5327,
  capexSerie: [1889, 1971, 2083, 2174], capexTtm: 1949,
  bruttoSerie: [0.2654, 0.2577, 0.2677, 0.2766, 0.2784],  // FY21–FY25
  // Geo-divisioner [TTM · FY25 · FY24], M EUR
  nEur: [13794, 13783, 13773],
  sEur: [16242, 16068, 16176],
  amer: [12464, 12957, 13558],
  apac: [5307, 5256, 4733],
  intern: [-1581, -1581, -1669],
  geoTotal: [46226, 46483, 46571],
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
  bruttoMedel: K.bruttoSerie.reduce((a, b) => a + b, 0) / K.bruttoSerie.length,
  bruttoSpread: Math.max(...K.bruttoSerie) - Math.min(...K.bruttoSerie),
  psReplik: K.mcap / K.revTtm,
  pbReplik: K.mcap / K.ek,
  deReplik: K.skuld / K.ek,
  evEarningsReplik: K.evKalla / K.nettoTtm,
  evSalesReplik: K.evKalla / K.revTtm,
  payoutReplik: K.utdelningTtm / (K.nettoTtm * 1000),
  epsBeraknad: K.nettoTtm / K.aktierMdr,
};
const avv = (a, b) => Math.abs(a / b - 1);
const exakt = [
  ["mcap", R.mcapReplik, K.mcap, 0.02],
  ["ps", R.psReplik, K.psKalla, 0.02],
  ["pb", R.pbReplik, K.pb, 0.02],
  ["ev-dekomposition", R.evReplik, K.evKalla, 0.02],
  ["nettoM mot källans rad", R.nettoM, 0.0578, 0.02],
  ["fcfM mot källans rad", R.fcfM, 0.0731, 0.02],
  ["fcfY mot källrad", R.fcfY, 0.0989, 0.02],
  ["divYield mot källrad", R.divY, K.divYieldKalla, 0.02],
  ["de", R.deReplik, K.de, 0.02],
  ["payout med RÄTT bas (betald TTM 1 118/netto 2 671)", R.payoutReplik, K.payoutKalla, 0.02],
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
const fcfIdent = [];
for (let i = 0; i < 4; i++) fcfIdent.push([K.ocfSerie[i] - K.capexSerie[i], K.fcfSerie[i]]);
fcfIdent.push([K.ocfTtm - K.capexTtm, 3378]);
if (fcfIdent.some(([a, b]) => Math.abs(a - b) > 0.001)) {
  console.error("ABORT: FCF-serien ej OCF−capex-låst");
  process.exit(1);
}
// GEO-FEM-BENSLÅS: tre exakta fönster (TTM+FY25+FY24 — allt vyn erbjuder)
const geoNycklar = ["nEur", "sEur", "amer", "apac", "intern"];
const geoSum = K.geoTotal.map((x, i) => [geoNycklar.reduce((s, k) => s + K[k][i], 0), x]);
if (!geoSum.every(([s, x]) => s === x)) {
  console.error("ABORT: geo-fem-bensdifferansen avviker: " + geoSum.map(([s, x]) => `${s - x}`).join(", "));
  process.exit(1);
}
if (K.nettoTtm <= 0) { console.error("ABORT: P/E-bärarkontroll — TTM-netto ≤ 0"); process.exit(1); }
if (!(R.nettoM < K.pretaxM && K.pretaxM < K.ebitM && K.ebitM < K.bruttoM)) { console.error("ABORT: normal kaskad bruten"); process.exit(1); }

const RAD = {
  ticker: "SGO.PA",
  namn: "Compagnie de Saint-Gobain S.A.",
  bransch: "material",
  land: "Frankrike",
  valuta: "EUR",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-25", url: "https://stockanalysis.com/quote/epa/SGO/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/)", paranoid:
    "EPA-PRIMÄRNOTING (underlag S&P Global Market Intelligence via StockAnalysis; senaste handelsdag 2026-09-24, hämtat 2026-09-25 — close 69,82 EUR · 52v −25,57 % = BYGGKONJUNKTURENS NEDGÅNG dokumenterad (pris under 50-MA 77,15 och 200-MA 78,99; RSI 33,9; beta 1,21; konsensus PT 97,66 = +39,9 % Buy 18 analytiker — datafakta utan köpsignal); färskhämtning med FYRA paneler; KALENDERÅRSBOKSLUT (31 dec; TTM = jun '26 efter H1 — HALVÅRSRAPPORTERING; NÄSTA RAPPORT est. 2026-10-30 — INOM v172-FÖNSTRET 10-20→11-04: SJÄTTE BOLAGET, SAMMA DAG SOM 4503.T/Astellas); EPA/EUR-PRECEDENSEN (AI.PA-klassen): " +
    "pris 69,82 EUR, mcap 34,16 mdr EUR på 0,48923 mdr aktier (replik 0,48923×69,82 = 34,16 — EXAKT på fyra siffror; aktieantal −1,05 % YoY = ÅTERKÖP-yield EXAKT: [−873 · −789 · −854 · −831 · −778] TTM −923 stadiga), " +
    "P/E-FAMILJEN: källrad 12,96 · GAAP 34,16/2,671 = 12,79 · pris/EPS 69,82/5,39 = 12,954 (0,05 % EXAKT); EPS-raden 5,39 mot beräknad netto/aktier 5,461 — aktieavrundning; fwd P/E 10,61 ⇒ implied EPS +22 % (byggcykel-konsensus, referens); PEG-KÄLRRAD 2,09 MED BASBLANDNING (fwd-replik 10,61/4,31 = 2,46; trailing 12,96/4,31 = 3,01 — ingen ren) ⇒ fältet NULL (SN.L-precedensen); PS 0,74 (0,14 %) · P/B 1,31 (0,14 %) · P/FCF 10,11 · P/OCF 6,41; " +
    "EV-DEKOMPOSITION: 34,16 + 17,270 − 5,751 = 45,679 mot källans 46,32 (1,4 % — mindre NCI/pension, inom standardtolerans dokumenterad); EV/Earnings 17,34 (0,05 %) · EV/Sales 1,00 (0,19 %) · EV/EBIT 9,12 · EV/EBITDA 6,22 (billigt — byggcykel-botten); NETTO-SKULD −11,52 mdr (−23,55/aktie; serien [−7,3 · −8,2 · −7,4 · −9,8 · −10,4] nu −11,5 — CertainTeed/förvärsåren); " +
    "GEO-FEM-BENSLÅSET TRE EXAKTA FÖNSTER (vågens tätaste tillsammans med ENGI): Northern Europe [13 794 · 13 783 · 13 773] + Southern Europe/ME&Africa [16 242 · 16 068 · 16 176] (STÖRSTA BENET 35 %) + Americas [12 464 · 12 957 · 13 558] (Amerika DALAR — räntabolighetens bostadsstyrning) + Asia-Pacific [5 307 · 5 256 · 4 733] + Interna försäljningar [−1 581 · −1 581 · −1 669] (NEGATIVT BEN — konsolideringen syns öppet) = totalen EXAKT i TTM+FY25+FY24 (allt vyn erbjuder — geo-omläggningen rapporteras sedan FY24); " +
    "KONJUNKTURPORTRÄTTET: omsättning [44 160 · 51 197 · 47 944 · 46 571 · 46 483] + TTM 46 226 (FY22-toppen +15,9 % = renoverings/pandemi-boomen; därefter platå −6,4 · −2,9 · −0,2 · TTM −0,6 — mjuk landning, ej kollaps; CAGR −3,17 % FY22→25 dokumenterad); netto [2 521 · 3 003 · 2 669 · 2 844 · 2 883] + TTM 2 671 (svävande stabilt; TTM-dip −7 % räntekostnadsburen); bruttomarginal [26,5 · 25,8 · 26,8 · 27,7 · 27,8] % (medel 26,9 %, spridning 2,1 pp — prissättningsmakten höll genom nedgången); " +
    "FCF-SPEGELN: [2 998 · 3 822 · 4 064 · 3 486 · 3 464] + TTM 3 378 — identitetslåst exakt sex fönster ([4 439−1 441 · 5 711−1 889 · 6 035−1 971 · 5 569−2 083 · 5 638−2 174 · 5 327−1 949]); PLATÅ ej stigande (dokumenterat); FCF-M 7,31 % EXAKT · FCF-yield 9,89 % (efter kursnedgången); capex ~2,0 mdr = industriell underhållsnivå; " +
    "UTDELNING + ÅTERKÖP: DPS current 2,30 EUR (3,29 % — replik 2,30/69,82 = 3,294 % EXAKT; +4,55 % senaste); utdelningsbelopp VÄXER VARJE ÅR [−697 · −833 · −1 013 · −1 045 · −1 085] TTM −1 118; PAYOUT med RÄTT bas EXAKT (betald TTM 1 118/netto 2 671 = 41,86 % — TD-mönstret); FCF-payout 33,31 %; återköp stadiga ~0,8-0,9 mdr/år (aktieantal −1,05 % EXAKT); shareholder yield 4,34 %; " +
    "LÖNSAMHET: ROE 11,04 % · ROIC 10,02 % mot WACC 8,08 % (gap +1,94 p — positivt; byggmaterials Moat genom varumärken + distribution) · räntetäckning 8,65 · D/E 0,66 (0,5 %) · Debt/EBITDA 2,35 · skatt 24,39 % · institutionsägande 45,61 %; kaskaden TTM: netto-M 5,78 % EXAKT < pretax-M 7,92 % < EBIT-M 10,76 % < brutto-M 27,17 % (normal); balansserier M EUR [FY21–FY25]: kassa [6 943 · 6 134 · 8 602 · 8 460 · 7 732] nu 5 751 · skuld [14 230 · 14 366 · 15 995 · 18 238 · 18 088] nu 17 270; " +
    "kandidatur: CELLMOTIVERAD duo enligt U30-mönstret — Frankrike/material-cellens två kunder: Air Liquide (industrigaserna — processkemins insatsvaror, stål/halvledare/sjukvård) + Saint-Gobain (byggmaterial — konstruktionens insatsvaror, glas/isolering/gips/CertainTeed): materialgrenens B2B-spegel; P/E-bärarkriteriet kontrollerat FÖRE leverans (TTM-netto 2 671 M EUR > 0 — GRÖN; Sony/Honda-doktrinen); material-cellen 1→2, Frankrike 24→25; NÄSTA RAPPORT est. 2026-10-30 INOM v172-fönstret (SJÄTTE bolaget — samma dag som Astellas)." }],
  hamtat: "2026-09-25",
  pris: K.prisEUR,
  marknadsKapitalMdr: K.mcap,
  tillvaxt: {
    omsattningCAGR5ar: +R.omsCagr3.toFixed(4),
    resultatCAGR5ar: +R.resCagr3.toFixed(4),
    omsattningTillvaxtTTM: -0.0055,
    prognosTillvaxt: 0.0243,
  },
  lonksamhet: {
    roe: K.roe, roic: K.roic, bruttoMarginal: K.bruttoM, ebitMarginal: K.ebitM,
    nettoMarginal: +R.nettoM.toFixed(4), fcfMarginal: +R.fcfM.toFixed(4),
  },
  stabilitet: {
    skuldEgenkapital: K.de, rantaTackning: K.rantaTackning, fcfPositivaSenaste5: 5,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: 0,
  },
  aterkop: { senasteArMdr: 0.923, andelUtestande: K.payoutKalla, insiderkopSenaste6man: 0 },
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
    "cellmotiverad duo (Frankrike/material 1→2: Air Liquide industrigaserna/processkemins insatsvaror + Saint-Gobain byggmaterial/konstruktionens insatsvaror — materialgrenens B2B-spegel); kollisionskontroll primär+sekundär GRÖN (SGO/SGO.PA+namn+URL); EPA/EUR (AI.PA-precedensen); kalenderårsbokslut, halvårsrapportering (TTM = jun '26); RAPPDAG est. 2026-10-30 INOM v172-fönstret (SJÄTTE bolaget, samma dag som 4503.T); GEO-FEM-BENSLÅSET TRE EXAKTA FÖNSTER (tillsammans med ENGI vågens tätaste): S.Europa/MEA störst 35 % · Amerika dalar (räntaboligheten) · interna försäljningar NEGATIVT BEN (konsolideringen syns); KONJUNKTURPORTRÄTT: FY22-toppen +15,9 % (renoveringsboomen) → mjuk platå (CAGR −3,17 % dokumenterad; ej kollaps); bruttomarginal 25,8→27,8 % (prissättningen höll); FCF [2 998 · 3 822 · 4 064 · 3 486 · 3 464] + TTM 3 378 identitetslåst exakt (PLATÅ dokumenterad); UTD VÄXER varje år (2,30 EUR · 3,29 % EXAKT; +4,55 %) med PAYOUT RÄTT BAS EXAKT (1 118/2 671 = 41,86 %) + återköp stadiga (aktieantal −1,05 % EXAKT; shareholder yield 4,34 %); PEG NULL (basblandning); P/E-familjen 12,96/12,79/12,954; EV/EBITDA 6,22 = byggcykel-botten dokumenterad; 52v −25,57 % (PT-gap +39,9 % — datafakta); ROIC-gap +1,94 p; D/E 0,66; NETTO-SKULD −11,5 mdr (förvärsåren); EK-serie saknas; alla repliker i paranoid (StockAnalysis EPA 2026-09-25)",
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
  if (el[el.length - 1].ticker !== "SGO.PA") { console.error("ABORT: sista raden ≠ SGO.PA"); process.exit(1); }
}
const slut = JSON.parse(readFileSync(UNI, "utf8"));
const forandrade = backup.filter((b, i) => JSON.stringify(b) !== JSON.stringify(slut[i])).length;
if (forandrade !== 0) { console.error(`ABORT: ${forandrade} gamla rader förändrade`); process.exit(1); }

const kvitto = [];
kvitto.push(
  `UNIVERSUM-INLÄGG GRÖN: ${FÖRE}→${slut.length} (+1 Saint-Gobain SGO.PA, Frankrike/material 1→2; material-cellen → ${slut.filter((b) => b.bransch === "material").length}; Frankrike → ${slut.filter((b) => b.land === "Frankrike").length})`,
  `indent=${indent} · gamla rader förändrade=${forandrade} · läs-tillbaka ×2 OK`,
  `REPLIKER (TRETTON LÅS — SEX EXAKTA): mcap EXAKT (0,48923×69,82 = 34,16 fyra siffror) · netto-M EXAKT (5,78) · FCF-M EXAKT (7,31) · divY EXAKT (3,29) · PAYOUT med RÄTT bas EXAKT (1 118/2 671 = 41,86 %) · P/E 0,05 % · fcfY 0,05 % · EV/Earnings 0,05 % · PS/PB 0,14 % · EV/Sales 0,19 % · D/E 0,5 % · EV 1,4 % (NCI dokumenterad); P/E-familjen 12,96/12,79/12,954; PEG NULL (basblandning)`,
  `GEO-FEM-BENSLÅSET TRE EXAKTA FÖNSTER (tillsammans med ENGI vågens tätaste): fyra regioner + interna försäljningar som NEGATIVT BEN = totalen exakt i TTM+FY25+FY24; S.Europa/MEA störst 35 % · Amerika dalar`,
  `KONJUNKTURPORTRÄTT: FY22-toppen → mjuk platå (oms-CAGR −3,17 % dokumenterad); bruttomarginal 25,8→27,8 %; FCF-platå [3 822 · 4 064 · 3 486 · 3 464] + TTM 3 378 identitetslåst exakt`,
  `UTD VÄXER varje år (2,30 EUR · 3,29 % EXAKT) + återköp stadiga (aktieantal −1,05 % EXAKT) · ROIC-gap +1,94 p · EV/EBITDA 6,22 = byggcykel-botten`,
  `P/E-BÄRARKONTROLL: TTM-netto 2 671 M EUR > 0 — GRÖN · RAPPDAG est. 2026-10-30 INOM v172-fönstret (SJÄTTE bolaget — samma dag som Astellas)`,
);
writeFileSync("/tmp/r244-inlagg.txt", kvitto.join("\n"));
console.log(kvitto.join("\n"));
