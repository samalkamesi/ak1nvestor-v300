#!/usr/bin/env node
/**
 * _r226-u30-universum-inlagg.mjs — v173 dataset-djup rond 226 U30 (+1):
 * Smith & Nephew plc SN.L (Storbritannien/halso 1→2) — cellmotiverad duo:
 * GSK (läkemedelspipeline, storskalig R&D) + S&N (ortopedisk medtech —
 * sjukhusens kapitalcykel): samma modellkontrast som Tyskland/hälsa
 * (Fresenius vård + SHL medtech). USD-RAPPORTVALUTA + GBX-NOTING (tredje
 * bolaget enligt BP.L/DGE.L-precedensen). Kollisionskontroll primär+
 * sekundär (AZN-läxan: SN.L/SN/SNN-ADR+namn+URL) GRÖN — AZN-upptagen sedan
 * rond 221, därför bär S&N hälsocellens duopartnerroll. P/E-bärarkontroll
 * FÖRE leverans: TTM-netto 480,47 M GBP > 0 — GRÖN. SEGMENTLÅSET I TIO
 * DELAR — vågens mest granulära: tio produktsegment summerar EXAKT mot
 * totalen FY2021–FY2025 (fem räkenskapsår; TTM diff 1 M = 0,016 %);
 * portraitskiftet dokumenterat: Sports Medicine Joint Repair (1 131) har
 * passerat Knee Implants (1 002) som största segment. VÄNDNINGSPROFILEN:
 * netto [223 · 263 · 412 · 625] + TTM 635 efter FY2022-kollapsen (−57 %,
 * Kina-VBP + Ryssland-exit) — VÄNDNINGS-CAGR +41,0 % med låg-bas-not enl.
 * Hitachi U18-precedensen; FCF-spegeln [110 · 181 · 606 · 852 · 855] med
 * marginalen 2,11 → 13,57 %.
 * Kvitto: /tmp/r226-inlagg.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const FÖRE = u.length;
if (u.some((b) => ["SN.L", "SN", "SNN"].includes(b.ticker) || /smith.?nephew/i.test(b.namn ?? "") || (b.kallor?.[0]?.url ?? "").includes("/lon/SN/"))) {
  console.error("ABORT: SN.L finns redan på disken");
  process.exit(1);
}

const K = {
  prisGBX: 1004.5, aktierMdr: 0.84119, mcap: 8.45, eps: 0.56, peKalla: 18.05,
  fwdPe: 11.58, pb: 2.16, psKalla: 1.77, evKalla: 10.74,
  evEarnings: 22.36, evSales: 2.25, evEbit: 13.99, pFcf: 13.06, pocf: 8.34,
  roe: 0.1185, roic: 0.0869, roce: 0.10, wacc: 0.0669,
  ebitM: 0.1422, pretaxM: 0.1265, bruttoM: 0.6844,
  nettoTtm: 0.48047, revTtm: 4.77, fcfTtm: 0.64694,           // GBP (statistikpanelen)
  skuld: 2.86, ek: 3.92, kassa: 0.57051, de: 0.73, rantaTackning: 6.59,
  div: 0.29, divYieldKalla: 0.0288, payoutKalla: 0.5244,
  // USD-serier (rapportvaluta), dec-slut FY2022–FY2025
  omsSerie: [5215, 5549, 5810, 6164],
  resSerie: [223, 263, 412, 625],
  fcfSerie: [110, 181, 606, 852],
  ocfSerie: [468, 608, 987, 1285], ocfTtm: 1339,
  capexSerie: [358, 427, 381, 433], capexTtm: 484,
  fcfMarginSerie: [0.0211, 0.0326, 0.1043, 0.1382],   // källans egna rader — tvärverifiering
  bruttoSerie: [0.7095, 0.7095, 0.7019, 0.7021, 0.6825],  // FY2021–FY2025
  dpsSerieUsd: [0.375, 0.375, 0.375, 0.375, 0.391],   // FY2021–FY2025; current 0,29 GBP
  // Segment [TTM · FY25 · FY24 · FY23 · FY22 · FY21], M USD
  knee: [1002, 1011, 977, 940, 899, 876],
  hip: [655, 641, 619, 599, 584, 612],
  otherRecon: [139, 136, 101, 111, 87, 92],
  trauma: [661, 649, 608, 564, 543, 576],
  sportsMed: [1131, 1067, 982, 945, 870, 839],
  arthro: [681, 647, 632, 588, 567, 590],
  ent: [216, 220, 210, 196, 153, 131],
  woundCare: [798, 766, 735, 725, 712, 731],
  woundBio: [600, 621, 581, 553, 520, 496],
  woundDev: [418, 406, 365, 328, 280, 269],
  segTotal: [6300, 6164, 5810, 5549, 5215, 5212],
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
  ["nettoM mot källans rad", R.nettoM, 0.1008, 0.02],
  ["fcfM mot källans rad", R.fcfM, 0.1357, 0.02],
  ["fcfY mot källrad", R.fcfY, 0.0766, 0.02],
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
// P/E-familjen dokumenterad (källans EPS-rad 0,56 mot beräknad 0,571 — avrundningsbas)
if (!(R.peGaap < K.peKalla && R.peGaap > 17 && R.peGaap < 18.1)) {
  console.error(`ABORT: P/E-familjen utanför dokumenterat spann (GAAP ${R.peGaap.toFixed(2)})`);
  process.exit(1);
}
const fcfIdent = [];
for (let i = 0; i < 4; i++) fcfIdent.push([K.ocfSerie[i] - K.capexSerie[i], K.fcfSerie[i], K.fcfMarginSerie[i] * K.omsSerie[i]]);
fcfIdent.push([K.ocfTtm - K.capexTtm, 855, 0.1357 * K.revTtm * 1.32]);
if (fcfIdent.slice(0, 4).some(([a, b, m]) => Math.abs(a - b) > 0.001 || Math.abs(m - b) > 0.002 * b)) {
  console.error("ABORT: FCF-serien ej OCF−capex-/marginalradslåst: " + fcfIdent.map(([a, b]) => `${a}≠${b}`).join("; "));
  process.exit(1);
}
const stigande = K.fcfSerie.every((x, i) => i === 0 || x > K.fcfSerie[i - 1]);
if (!stigande || !(855 > K.fcfSerie[3])) { console.error("ABORT: FCF-serien ej stigande genom serien+TTM"); process.exit(1); }
const segNycklar = ["knee", "hip", "otherRecon", "trauma", "sportsMed", "arthro", "ent", "woundCare", "woundBio", "woundDev"];
const segSum = K.segTotal.map((x, i) => [segNycklar.reduce((s, k) => s + K[k][i], 0), x]);
const exaktaSeg = segSum.slice(1).filter(([s, x]) => s === x).length;   // FY25–FY21
const ttmDiff = Math.abs(segSum[0][0] - segSum[0][1]);
if (exaktaSeg !== 5 || ttmDiff !== 1) {
  console.error("ABORT: segmentlåset bruten: " + segSum.map(([s, x]) => `${s}≠${x}`).join("; "));
  process.exit(1);
}
if (K.nettoTtm <= 0) { console.error("ABORT: P/E-bärarkontroll — TTM-netto ≤ 0"); process.exit(1); }
if (!(R.nettoM < K.pretaxM && K.pretaxM < K.ebitM)) { console.error("ABORT: normal kaskad bruten (engångskontrollen)"); process.exit(1); }

const PARANOID =
  "LSE-PRIMÄRNOTING (underlag S&P Global Market Intelligence via StockAnalysis; senaste handelsdag 2026-09-24, hämtat 2026-09-25 — öppning 1 009,00 · föregående close 1 007,50 · dagsspann 1 001,50–1 014,50 · 52v 1 002,00–1 426,60 (−25,48 % — PRISET VID 52-VÄCKORSBOTTEN: 1 004,5 mot spannets 1 002,0); färshämtning med FYRA paneler (quote/statistics/financials/cash-flow); KALENDERÅRSBOKSLUT (31 dec; TTM-fönstret = jun '27-väckt 2026-06-27 efter kvartalsrapporten — kvartalsvis rapportering); USD-RAPPORTVALUTA + GBX-NOTING enligt BP.L/DGE.L-precedensen (tredje bolaget): prisfältet i PENCE, mcap/aktier/statistik-yield i GBP, SERIER/DPS I USD; pariteten USD/GBP ≈ 1,32 dokumenterar bryggan 6 300 M USD ≈ 4,77 mdr GBP): " +
  "pris 10,045 GBP (1 004,5 GBp; beta 0,68), mcap 8,45 mdr GBP på 0,84119 mdr aktier (replik 0,84119 × 10,045 = 8,450 — EXAKT), " +
  "P/E-FAMILJEN DOKUMENTERAD: källrad 18,05 · GAAP 8,45/0,48047 = 17,58 · pris/EPS 10,045/0,56 = 17,94 (0,6 % mot källraden — LÅST); källans EPS-rad 0,56 mot beräknad netto/aktier 0,571 (2 % avrundningsbas — dokumenterad, fälten = källrader); fwd P/E 11,58 ⇒ implied EPS +56 % (vändningens fortsättning i konsensus — referens, ALDRIG löfte); PEG-källrad 1,19 med oklar bas (18,05/1,19 = 15,2 % mot konsensus 3Y EPS 9,28 %) ⇒ fältet NULL (basblandning vägras); PS 1,77 EXAKT (8,45/4,77) · P/B 2,16 (8,45/3,92 — 0,2 %) · P/FCF 13,06 · P/OCF 8,34; " +
  "EV-DEKOMPOSITION EXAKT: 8,45 + 2,86 − 0,57051 = 10,7395 mot källans 10,74 (0,005 %) — NETTO-SKULD −2,29 mdr GBP (−2,73/aktie); EV/Earnings 22,36 EXAKT (10,74/0,48047) · EV/Sales 2,25 (replik 2,252) · EV/EBIT 13,99 · EV/EBITDA 9,16; " +
  "SEGMENTLÅSET I TIO DELAR — VÅGENS MEST GRANULÄRA: Knee Implants [1 002 · 1 011 · 977 · 940 · 899 · 876] + Hip [655 · 641 · 619 · 599 · 584 · 612] + Other Reconstruction [139 · 136 · 101 · 111 · 87 · 92] + Trauma & Extremities [661 · 649 · 608 · 564 · 543 · 576] + Sports Medicine Joint Repair [1 131 · 1 067 · 982 · 945 · 870 · 839] + Arthroscopic Enabling Tech [681 · 647 · 632 · 588 · 567 · 590] + ENT [216 · 220 · 210 · 196 · 153 · 131] + Advanced Wound Care [798 · 766 · 735 · 725 · 712 · 731] + Advanced Wound Bioactives [600 · 621 · 581 · 553 · 520 · 496] + Advanced Wound Devices [418 · 406 · 365 · 328 · 280 · 269] summerar EXAKT mot totalen SAMTLIGA FEM RÄKENSKAPSÅR FY2021–FY2025 (TTM diff 1 M = 0,016 % avrundning); PORTRATTSKIFTET: Sports Medicine Joint Repair 1 131 > Knee Implants 1 002 som största segment — idrottsskadevårdens tillväxt mot knäprotesernas volymcykel (electiv kirurgi är procyklisk: FY2022-kollapsen = utskjuten elektiv kirurgi + Kina-VBP-prispress + Ryssland-exit); " +
  "VÄNDNINGSPROFILEN: netto [223 · 263 · 412 · 625] + TTM 635 M USD — FY2022-kollapsen −57 % (524→223) följt av TRE FÖRDOUBLINGSÅR; VÄNDNINGS-CAGR +41,02 % med LÅG-BAS-NOT (Hitachi U18-precedensen: FY22-basen 223 är kollapsåret — CAGR:n redovisas med sin natur, aldrig som fortsättning); EPS [0,26 · 0,30 · 0,47 · 0,72] + TTM 0,74; FCF-SPEGELN [110 · 181 · 606 · 852] + TTM 855 — marginalen 2,11 → 13,82 → TTM 13,57 %; FCF-serien DUBBELT låst (OCF−capex exakt fem fönster [468−358 · 608−427 · 987−381 · 1 285−433 · 1 339−484] + källans marginalrader exakta mot omsättningen); FCF-yield 7,66 % EXAKT (0,64694/8,45); " +
  "ENGÅNGSKONTROLLEN PER FÖNSTER (Kirin-U3): NORMAL KASKAD i TTM (netto-M 10,08 < pretax-M 12,65 < EBIT-M 14,22 — inga engångsposter) samtliga år; FY2022 = operationell kollaps (EBIT-M 12,62 %, netto-M 4,28 %) inte engångspost-buren — utskjuten elektiv kirurgi och prispress är driftsposter; " +
  "SERIEPROFILER: oms [5 215 · 5 549 · 5 810 · 6 164] (rak CAGR +5,73 %) · bruttomarginal [70,95 · 70,95 · 70,19 · 70,21 · 68,25] % FY21–FY25 (medel 70,11 %, spridning 2,70 pp — Kina-VBP-prispressen syns i glidningen); omsättningstillväxt TTM +2,21 % (TTM-raden; quote-panelens +6,0 % bär annat fönster — dokumenterad) · prognosTillväxt +5,20 % (rev-fwd 3Y); " +
  "UTDELNINGSPOLITIKEN: DPS [0,375 · 0,375 · 0,375 · 0,375 · 0,391] USD FY2021–FY2025 — FRUSEN i fyra år genom kollaps och vändning, första höjningen FY2025 +4,27 %; current 0,29 GBP/år (2,88 % EXAKT replik 29/1 004,5); payout-källrad 52,44 % (replik 0,29/0,56 = 51,8 %, 1,2 %) · FCF-payout 38,12 %; " +
  "STABILITETEN: aktieantal −1,79 % YoY = återköp 1,79 % (buyback-yield EXAKT) ⇒ nyemissioner 0 · D/E 0,73 EXAKT (2,86/3,92) · räntetäckning 6,59 · Debt/EBITDA 2,65 · current ratio 2,14 · Altman 3,26 (GRÖN ZON — vågens ovanliga) · Piotroski 6 · ROE 11,85 % · ROIC 8,69 % mot WACC 6,69 % (gap +2,0 p — vändningsåret lämnar knappt positivt kapitalvärdeskapande; fwd-implied +56 % = konsensusvägen till bredare gap, referens); skattesats 20,33 % · institutionsägande 89,85 %; balansserier USD [FY21–FY25]: kassa [1 290 · 350 · 302 · 619 · 557] · skuld [3 339 · 2 872 · 3 084 · 3 321 · 3 327] · netto [−2 049 · −2 522 · −2 782 · −2 702 · −2 770]; " +
  "kandidatur: CELLMOTIVERAD duo enligt U13-mönstret — Storbritannien/hälsa-cellens TVÅ affärsmodeller: GSK (läkemedelspipeline — patentscykel, storskalig R&D, vaccin/virologi) + Smith & Nephew (ortopedisk medtech — sjukhusens kapitalcykel, elektiv kirurgi, implantat): modellkontrasten speglar Tyskland/hälsa (Fresenius vård + SHL medtech); AZN-KOLLISIONEN fortsatt avvärjd (AstraZeneca = AZN.ST/Sverige sedan 09-03 — AZN-läxan r221 tillämpad på SN.L/SN/SNN+namn+URL GRÖN); P/E-bärarkriteriet kontrollerat FÖRE leverans (TTM-netto 480,47 M GBP > 0; Sony/Honda-doktrinen); Medical Devices ⇒ halso-cellen (29→30 bolag), Storbritannien 15→16 (halso-grenen 1→2); NÄSTA RAPPORT est. 2026-11-05 (en dag efter v172-fönstrets slut 10-20→11-04 — notis vid kalenderberöring; samma dag som National Grid).";

const RAD = {
  ticker: "SN.L",
  namn: "Smith & Nephew plc",
  bransch: "halso",
  land: "Storbritannien",
  valuta: "GBX",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-25", url: "https://stockanalysis.com/quote/lon/SN/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/)", paranoid: PARANOID }],
  hamtat: "2026-09-25",
  pris: K.prisGBX,
  marknadsKapitalMdr: K.mcap,
  tillvaxt: {
    omsattningCAGR5ar: +R.omsCagr3.toFixed(4),
    resultatCAGR5ar: +R.resCagr3.toFixed(4),
    omsattningTillvaxtTTM: 0.0221,
    prognosTillvaxt: 0.052,
  },
  lonksamhet: {
    roe: K.roe, roic: K.roic, bruttoMarginal: K.bruttoM, ebitMarginal: K.ebitM,
    nettoMarginal: +R.nettoM.toFixed(4), fcfMarginal: +R.fcfM.toFixed(4),
  },
  stabilitet: {
    skuldEgenkapital: K.de, rantaTackning: K.rantaTackning, fcfPositivaSenaste5: 5,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: 0,
  },
  aterkop: { senasteArMdr: 0.15, andelUtestande: K.payoutKalla, insiderkopSenaste6man: 0 },
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
    "cellmotiverad duo (Storbritannien/halso 1→2: GSK läkemedelspipeline + S&N ortopedisk medtech — sjukhusens kapitalcykel; modellkontrasten speglar Tyskland/hälsa Fresenius+SHL); AZN-kollisionen fortsatt avvärjd (AstraZeneca = AZN.ST/Sverige — SN.L/SN/SNN GRÖN enl. AZN-läxan); LSE-primär, USD-RAPPORTVALUTA + GBX-NOTING enl. BP.L/DGE.L-precedensen (tredje bolaget; serier/DPS i USD); kalenderårsbokslut, kvartalsvis rapportering (TTM = jun '26); SEGMENTLÅSET I TIO DELAR vågens mest granulära: tio produktsegment = totalen EXAKT FY2021–FY2025 (fem räkenskapsår; TTM diff 0,016 %); portraitskiftet: Sports Medicine 1 131 > Knee 1 002 som största segment; VÄNDNINGSPROFILEN: netto [223 · 263 · 412 · 625] + TTM 635 efter FY22-kollapsen (−57 %: utskjuten elektiv kirurgi + Kina-VBP + Ryssland-exit — driftsposter, ej engångspost; normal kaskad i TTM) — VÄNDNINGS-CAGR +41,0 % med låg-bas-not enl. Hitachi U18; FCF-spegeln [110 · 181 · 606 · 852 · 855] dubbellåst (OCF−capex + marginalrader), marginalen 2,11→13,57 %; PRIS VID 52-VÄCKORBOTTEN (1 004,5 mot spannet 1 002–1 427, −25,5 %/år); P/E-familjen 18,05/17,58/17,94 dokumenterad (EPS-rad 0,56 mot beräknad 0,571 — fälten = källrader); PEG NULL (oklar bas); UTDELNINGEN FRUSEN fyra år på 0,375 USD (första höjningen FY25 +4,3 %), current 0,29 GBP (2,88 % EXAKT); D/E 0,73 EXAKT; Altman 3,26 GRÖN ZON · Piotroski 6; ROIC 8,69 % mot WACC 6,69 % gap +2,0 p (vändningsåret); återköp 1,79 % EXAKT (aktieantal −1,79 %); bruttomarginal-medel 70,1 % spridning 2,70 pp (VBP-prispressen syns); rappdag est. 2026-11-05 en dag efter v172-fönstret (samma dag som National Grid); EK-serie saknas; alla repliker i paranoid (StockAnalysis LON 2026-09-25)",
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
  if (el[el.length - 1].ticker !== "SN.L") { console.error("ABORT: sista raden ≠ SN.L"); process.exit(1); }
}
const slut = JSON.parse(readFileSync(UNI, "utf8"));
const forandrade = backup.filter((b, i) => JSON.stringify(b) !== JSON.stringify(slut[i])).length;
if (forandrade !== 0) { console.error(`ABORT: ${forandrade} gamla rader förändrade`); process.exit(1); }

const kvitto = [];
kvitto.push(
  `UNIVERSUM-INLÄGG GRÖN: ${FÖRE}→${slut.length} (+1 Smith & Nephew SN.L, Storbritannien/halso 1→2; halso-cellen → ${slut.filter((b) => b.bransch === "halso").length}; Storbritannien → ${slut.filter((b) => b.land === "Storbritannien").length})`,
  `indent=${indent} · gamla rader förändrade=${forandrade} · läs-tillbaka ×2 OK`,
  `REPLIKER (TRETTON LÅS): mcap ${R.mcapReplik.toFixed(3)} (8,45) EXAKT · PS ${R.psReplik.toFixed(3)} (1,77) · P/B ${R.pbReplik.toFixed(3)} (2,16) · EV ${R.evReplik.toFixed(4)} (10,74) 0,005 % EXAKT · netto-M ${(R.nettoM * 100).toFixed(2)} % · FCF-M ${(R.fcfM * 100).toFixed(2)} % · fcfY ${(R.fcfY * 100).toFixed(2)} % EXAKT · divY ${(R.divY * 100).toFixed(2)} % · D/E ${R.deReplik.toFixed(3)} EXAKT · payout 1,2 % · P/E pris/EPS 0,6 % · EV/Earnings ${R.evEarningsReplik.toFixed(2)} EXAKT · EV/Sales; P/E-familjen 18,05/17,58/17,94 dokumenterad`,
  `SEGMENTLÅSET I TIO DELAR (vågens mest granulära): tio produktsegment = totalen EXAKT FY2021–FY2025 (FEM räkenskapsår); TTM diff 1 M (0,016 %); portraitskiftet Sports Medicine 1 131 > Knee 1 002`,
  `VÄNDNINGSPROFILEN: netto [223 · 263 · 412 · 625] + TTM 635 — CAGR +41,0 % med låg-bas-not (Hitachi U18); FCF-spegeln [110 · 181 · 606 · 852 · 855] DUBBELT låst; marginal 2,11→13,57 %`,
  `ENGÅNGSKONTROLLEN: normal kaskad TTM (10,1 < 12,7 < 14,2) · FY22 = driftskollaps (ej engångspost) dokumenterad · oms-CAGR +${(R.omsCagr3 * 100).toFixed(2)} % · FCF-CAGR +${(R.fcfCagr3 * 100).toFixed(1)} %`,
  `UTDELNINGEN FRUSEN fyra år (0,375 USD FY21–FY24), första höjningen FY25; current 0,29 GBP (2,88 % EXAKT) · Altman 3,26 GRÖN ZON · ROIC-gap +2,0 p (vändningsåret)`,
  `P/E-BÄRARKONTROLL: TTM-netto 480,47 M GBP > 0 — GRÖN · PRIS VID 52v-BOTTEN · rappdag est. 2026-11-05 (en dag efter v172-fönstret, samma dag som NG)`,
);
writeFileSync("/tmp/r226-inlagg.txt", kvitto.join("\n"));
console.log(kvitto.join("\n"));
