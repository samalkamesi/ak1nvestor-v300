#!/usr/bin/env node
/**
 * _r225-u29-universum-inlagg.mjs — v173 dataset-djup rond 225 U29 (+1):
 * The Sage Group plc SGE.L (Storbritannien/teknik 1→2) — cellmotiverad duo:
 * ARM (ren chip-IP-licensiering, hypergrowth, P/E 249, bruttomarginal 97,5 %
 * = universumets högsta) + Sage (SaaS-affärsprogramvara, kompounderaren,
 * P/E 24,9, bruttomarginal 92,6 % = näst högsta) — MJUKVARUMARGINALENS BÅDA
 * SMAKER I EN CELL: licensiera kisel-IP mot hyra ut bokföringsflöden.
 * Kollisionskontroll primär+sekundär (AZN-läxan: SGE.L/SGE/SGEYY+namn+URL)
 * GRÖN; P/E-bärarkontroll FÖRE leverans: TTM-netto 385 M GBP > 0 — GRÖN.
 * GEOGRAFILÅSET (vågens tredje, nya låstypen): NA+UK&I+Afrika&APAC+Europa
 * summerar EXAKT mot totalen i TTM/FY25/FY24/FY22 (FY23 diff 41 M = 1,9 %
 * källavrundning/omklassning). FCF-serien DUBBELT låst (OCF−capex exakt +
 * marginalrader exakt) och STIGANDE varje år FY2022–FY2025+TTM. TUNN-EK-
 * STRUKTUREN (P/B 40,4 · D/E 9,19 · ROE 75,6 %): återköpen konsumerat
 * bokfört kapital — metodnot enl. RR-precedensen.
 * Kvitto: /tmp/r225-inlagg.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const FÖRE = u.length;
if (u.some((b) => ["SGE.L", "SGE", "SGEYY"].includes(b.ticker) || /sage group/i.test(b.namn ?? "") || (b.kallor?.[0]?.url ?? "").includes("/lon/SGE/"))) {
  console.error("ABORT: SGE.L finns redan på disken");
  process.exit(1);
}

const K = {
  prisGBX: 990.0, aktierMdr: 0.89753, mcap: 8.89, eps: 0.40, peKalla: 24.92,
  fwdPe: 18.43, pb: 40.39, psKalla: 3.37, evKalla: 10.39,
  evEarnings: 26.99, evSales: 3.94, evEbit: 17.43, pFcf: 17.81, pocf: 16.77,
  roe: 0.7556, roic: 0.261, roce: 0.2592, wacc: 0.0539,
  ebitM: 0.2263, pretaxM: 0.1936, bruttoM: 0.9256,
  nettoTtm: 0.385, revTtm: 2.634, fcfTtm: 0.499,
  skuld: 2.02, ek: 0.22, kassa: 0.518, de: 9.19, rantaTackning: 9.03,
  div: 0.225, divYieldKalla: 0.0227, payoutKalla: 0.5403,
  // GBP-serier, sep-slut FY2022–FY2025
  omsSerie: [1947, 2184, 2332, 2513],
  resSerie: [260, 211, 323, 369],
  fcfSerie: [273, 382, 472, 487],
  ocfSerie: [285, 387, 491, 528], ocfTtm: 530,
  capexSerie: [12, 5, 19, 41], capexTtm: 31,
  fcfMarginSerie: [0.1402, 0.1749, 0.2024, 0.1938],   // källans egna rader — tvärverifiering
  bruttoSerie: [0.9290, 0.9291, 0.9286, 0.9280, 0.9272],  // FY2021–FY2025
  dpsSerie: [0.177, 0.184, 0.193, 0.204, 0.218],      // FY2021–FY2025, current 0.225
  // Geograf [TTM · FY25 · FY24 · FY23 · FY22]
  naSerie: [1186, 1138, 1052, 973, 818],
  ukiSerie: [580, 554, 505, 471, 433],
  afapacSerie: [186, 175, 165, 156, 153],
  euSerie: [682, 646, 610, 584, 543],
  geoTotal: [2634, 2513, 2332, 2184, 1947],
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
  epsBeraknad: K.nettoTtm / K.aktierMdr,
};
const avv = (a, b) => Math.abs(a / b - 1);
const exakt = [
  ["mcap", R.mcapReplik, K.mcap, 0.02],
  ["ps", R.psReplik, K.psKalla, 0.02],
  ["pb", R.pbReplik, K.pb, 0.02],
  ["ev-dekomposition", R.evReplik, K.evKalla, 0.02],
  ["nettoM mot källans rad", R.nettoM, 0.1462, 0.02],
  ["fcfM mot källans rad", R.fcfM, 0.1894, 0.02],
  ["fcfY mot källrad", R.fcfY, 0.0562, 0.02],
  ["divYield mot källrad", R.divY, K.divYieldKalla, 0.02],
  ["de", R.deReplik, K.de, 0.02],
  ["pe pris/EPS", R.pePrisEps, K.peKalla, 0.02],
  ["evEarnings", R.evEarningsReplik, K.evEarnings, 0.02],
  ["evSales", R.evSalesReplik, K.evSales, 0.02],
];
const fel = exakt.filter(([n, r, k, tol]) => avv(r, k) > tol);
if (fel.length) {
  console.error("ABORT: replik utanför tolerans: " + fel.map(([n, r, k]) => `${n} ${r.toFixed(4)} vs ${k}`).join("; "));
  process.exit(1);
}
// P/E-FAMILJEANOMALIN (Shin-Etsu/freenet-precedensen): GAAP-repliken avviker — dokumenteras, låses ej
if (!(R.peGaap < K.peKalla && R.peGaap > 22.5 && R.peGaap < 23.7)) {
  console.error(`ABORT: P/E-familjen utanför dokumenterat spann (GAAP ${R.peGaap.toFixed(2)})`);
  process.exit(1);
}
if (!(R.epsBeraknad > 0.42 && R.epsBeraknad < 0.44)) {
  console.error(`ABORT: EPS-anomalin utanför dokumenterat spann (${R.epsBeraknad.toFixed(3)})`);
  process.exit(1);
}
const fcfIdent = [];
for (let i = 0; i < 4; i++) fcfIdent.push([K.ocfSerie[i] - K.capexSerie[i], K.fcfSerie[i], K.fcfMarginSerie[i] * K.omsSerie[i]]);
fcfIdent.push([K.ocfTtm - K.capexTtm, 499, 0.1895 * K.revTtm * 1000]);
if (fcfIdent.some(([a, b, m]) => Math.abs(a - b) > 0.001 || Math.abs(m - b) > 0.002 * b)) {
  console.error("ABORT: FCF-serien ej OCF−capex-/marginalradslåst: " + fcfIdent.map(([a, b]) => `${a}≠${b}`).join("; "));
  process.exit(1);
}
const stigande = K.fcfSerie.every((x, i) => i === 0 || x > K.fcfSerie[i - 1]);
if (!stigande || !(499 > K.fcfSerie[3])) { console.error("ABORT: FCF-serien ej stigande genom serien+TTM"); process.exit(1); }
const geoSum = K.geoTotal.map((x, i) => [
  K.naSerie[i] + K.ukiSerie[i] + K.afapacSerie[i] + K.euSerie[i], x,
]);
const exaktaGeo = geoSum.filter(([s, x]) => s === x).length;
if (exaktaGeo !== 5) {
  console.error("ABORT: geograf låset bruten: " + geoSum.map(([s, x]) => `${s}≠${x}`).join("; "));
  process.exit(1);
}
if (K.nettoTtm <= 0) { console.error("ABORT: P/E-bärarkontroll — TTM-netto ≤ 0"); process.exit(1); }
if (!(R.nettoM < K.pretaxM && K.pretaxM < K.ebitM)) { console.error("ABORT: normal kaskad bruten (engångskontrollen)"); process.exit(1); }

const PARANOID =
  "LSE-PRIMÄRNOTING (underlag S&P Global Market Intelligence via StockAnalysis; close 2026-09-24, hämtat 2026-09-25 — öppning 995,00 · föregående close 1 000,00 · dagsspann 989,40–1 008,00 · 52v 771,70–1 181,00 (−10,45 %); färshämtning med FYRA paneler (quote/statistics/financials/cash-flow); RÄKENSKAPSÅRET SLUTAR 30 SEPTEMBER (sep-slut — FY2025 = okt 2024→sep 2025; TTM-fönstret = mar '26 efter halvårsrapporten; rapporterar halvårsvis; källans data senast uppdaterad 2026-09-25); GBP-rapportvaluta, prisfältet i PENCE enligt BA.L/HSBA.L-konventionen, mcap i GBP mdr): " +
  "pris 9,90 GBP (990,0 GBp; beta 0,33), mcap 8,89 mdr GBP på 0,89753 mdr aktier (replik 0,89753 × 9,90 = 8,886 — 0,05 % EXAKT), " +
  "P/E-FAMILJEN DOKUMENTERAD (Shin-Etsu/freenet-precedensen: källans EPS-rad 0,40 mot beräknad netto/aktier 0,429 — 7 % aktivitetsavvikelse, källan bär annan aktiebas/avenårsbas): källrad 24,92 · GAAP-replik 8,89/0,385 = 23,09 · pris/EPS 9,90/0,40 = 24,75 (0,7 % mot källraden — LÅST) — FÄLTEN = KÄLLRADER med metodnot; fwd P/E 18,43 ⇒ implied EPS +35 % (referens); PEG-källrad 1,29 mot konsensus 3Y EPS 15,69 %: 24,92/15,69 = 1,59 — basblandning vägras, fältet NULL; PS 3,37 (8,89/2,634 — 0,15 %) · P/B 40,39 EXAKT (8,89/0,22 — 0,05 %; STRUKTURELLT: bokfört EK 220 M efter åratal av återköp — RR-precedensens tunn-EK-metodnot) · P/FCF 17,81 · P/OCF 16,77; " +
  "EV-DEKOMPOSITION 0,02 % REN: 8,89 + 2,02 − 0,518 = 10,392 mot källans 10,39 — NETTO-SKULD −1,50 mdr (−1,68/aktie): lånefinansierade återköp, inte driftsbelastning; EV/Earnings 26,99 EXAKT (10,39/0,385) · EV/Sales 3,94 (replik 3,945 — 0,1 %) · EV/EBIT 17,43 · EV/EBITDA 16,21; " +
  "GEOGRAFILÅSET (VÅGENS TREDJE LÅSTYP — efter RR:s produktsegment och NG:s segment; VÅGENS FÖRSTA PERFECTA FEMFÖNSTERLÅS): North America [1 186 · 1 138 · 1 052 · 973 · 818] + UK & Ireland [580 · 554 · 505 · 471 · 433] + Africa & APAC [186 · 175 · 165 · 156 · 153] + Europe [682 · 646 · 610 · 584 · 543] summerar EXAKT mot totalen [2 634 · 2 513 · 2 332 · 2 184 · 1 947] SAMTLIGA FEM FÖNSTER (TTM+FY25+FY24+FY23+FY22 — skriptgrunden tvingade fram kolumnrättelsen: förslag till FY23-diff var EGEN avläsningsfel, maskinen före hand); NORDAMERIKA-PROFILEN: NA-andelen 687→1 186 M (FY21→TTM) = 36,8→45,0 % — Sage är en nordamerikansk tillväxtberättelse noterad i London; " +
  "FCF FYRA ÅR RAKT + TTM: [273 · 382 · 472 · 487] + TTM 499 (rak CAGR +21,3 %) — serien DUBBELT låst: OCF−capex exakt fem fönster [285−12 · 387−5 · 491−19 · 528−41 · 530−31] OCH källans marginalrader [14,02 · 17,49 · 20,24 · 19,38 · 18,95 %] reproducerar serien mot omsättningen; FCF-M 18,94 % > netto-M 14,62 % — SaaS-kassaprofilen (capex 31 M = 1,2 % av omsättningen); FCF-yield 5,62 % (källrad + replik 0,499/8,89); " +
  "ENGÅNGSKONTROLLEN PER FÖNSTER (Kirin-U3): NORMAL KASKAD i TTM-fönstret (netto-M 14,62 < pretax-M 19,36 < EBIT-M 22,63 — inga engångsposter) och samtliga fem år; FY2023-DIPPET dokumenterat: netto 211 (netto-M 9,66 %, pretax-M 12,91 %) = molnomställningens omstruktursår, sedan TRE STIGANDE ÅR [211 → 323 → 369] (EPS 0,20 → 0,32 → 0,37); " +
  "SERIEPROFILER: oms [1 947 · 2 184 · 2 332 · 2 513] (rak CAGR +8,88 %) · netto [260 · 211 · 323 · 369] (CAGR +12,38 % — alla fönster positiva) · EPS [0,25 · 0,20 · 0,32 · 0,37]; omsättningstillväxt TTM +4,81 % (källans TTM-rad; quote-panelens +8,8 % bär annat fönster — dokumenterad anomali) · prognosTillväxt +9,38 % (källans rev-fwd 3Y); UTDELNINGSTRAPPAN: DPS [0,177 · 0,184 · 0,193 · 0,204 · 0,218] + current 0,225 (2,27 % EXAKT replik 22,5/990) — 11 raka tillväxtår (källrad) med takter +2,49 → +7,16 %/år; payout-källrad 54,03 % (EPS-bas-repliken 0,225/0,40 = 56,3 % på den aktivitetsavrundade EPS-raden — noterad) · FCF-payout 40,38 % (0,225/0,556); " +
  "ÅTERKÖPSMASKINEN: aktieantal −4,40 % YoY (QoQ −1,94 %) = buyback-yield 4,40 % EXAKT MOT KÄLLRADEN (0,39 mdr GBP/år) — återköpen FINANSIERADE med ny låneskuldsättning (skuld 814 → 2 022 M FY21→nu; netto-skuld −261 → −1 504 M) och KONSUMERAT bokfört kapital (EK 220 M): P/B 40,39 · D/E 9,19 EXAKT (2,02/0,22) · ROE 75,56 % — alla tre STRUKTURELLT betingade av det tunna EK:t (RR-precedensens metodnot); de jämförbara talen: ROIC 26,10 % mot WACC 5,39 % — gap +20,7 p (mjukvaruekonomins bredd) · ROCE 25,92 %; räntetäckning 9,03 · Debt/EBITDA 3,15 · Altman 2,61 (gränszon — tunn-EK-artefakt dokumenterad) · Piotroski 5 · skattesats 24,51 % · institutionsägande 81,81 % · insiders 0,22 %; " +
  "BRUTTOMARGINAL-STABILITETEN: [92,90 · 92,91 · 92,86 · 92,80 · 92,72] % FY2021–FY2025 — medel 92,84 % med spridning 0,19 pp (universumets TIGHTASTE: mot ARM:s 2,4 pp i samma cell) — SaaS-prissättningens sticklighet; CELLDUON: ARM 97,5 % (chip-IP-licensiering, hypergrowth P/E 249) + Sage 92,6 % (affärsprogramvara, kompounderare P/E 25) = universumets TVÅ HÖGSTA bruttomarginaler i samma cell — mjukvarumarginelens båda smaker: licensiera kisel-IP mot hyra ut bokföringsflöden; " +
  "kandidatur: CELLMOTIVERAD duo enligt U13-mönstret — Storbritannien/teknik-cellens TVÅ affärsmodeller: ARM (ren IP-licensiering, royalty på varje chip, global halvledarcykel, P/E 249 mot fwd 102) + Sage (prenumerations-SaaS för SMB-redovisning, Nordamerika-drivet, P/E 25 med 11-årig utdelningstrappa och återköpsmaskin): hypergrowth-multiple mot kompounder-multiple; kollisionskontroll primär+sekundär (AZN-läxan r221: SGE.L/SGE/SGEYY+namn+URL) GRÖN; P/E-bärarkriteriet kontrollerat FÖRE leverans (TTM-netto 385 M GBP > 0; Sony/Honda-doktrinen); Software-Application ⇒ teknik-cellen (29→30 bolag), Storbritannien 14→15 (teknik-grenen 1→2 — UK:S SISTA 1-GREN ÖPPNAD); NÄSTA RAPPORT BEKRÄFTAD 2026-11-19 (strax utanför v172-fönstret 10-20→11-04 — notis vid kalenderberöring).";

const RAD = {
  ticker: "SGE.L",
  namn: "The Sage Group plc",
  bransch: "teknik",
  land: "Storbritannien",
  valuta: "GBX",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-25", url: "https://stockanalysis.com/quote/lon/SGE/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/)", paranoid: PARANOID }],
  hamtat: "2026-09-25",
  pris: K.prisGBX,
  marknadsKapitalMdr: K.mcap,
  tillvaxt: {
    omsattningCAGR5ar: +R.omsCagr3.toFixed(4),
    resultatCAGR5ar: +R.resCagr3.toFixed(4),
    omsattningTillvaxtTTM: 0.0481,
    prognosTillvaxt: 0.0938,
  },
  lonksamhet: {
    roe: K.roe, roic: K.roic, bruttoMarginal: K.bruttoM, ebitMarginal: K.ebitM,
    nettoMarginal: +R.nettoM.toFixed(4), fcfMarginal: +R.fcfM.toFixed(4),
  },
  stabilitet: {
    skuldEgenkapital: K.de, rantaTackning: K.rantaTackning, fcfPositivaSenaste5: 5,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: 0,
  },
  aterkop: { senasteArMdr: 0.39, andelUtestande: K.payoutKalla, insiderkopSenaste6man: 0 },
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
    "cellmotiverad duo (Storbritannien/teknik 1→2: ARM ren chip-IP-licensiering hypergrowth + Sage SaaS-kompounderare — mjukvarumarginelens båda smaker: licensiera kisel-IP mot hyra ut bokföringsflöden; universumets två högsta bruttomarginaler 97,5+92,6 % i samma cell; UK:S SISTA 1-GREN ÖPPNAD); LSE-primär, GBP-rapportvaluta, prisfältet i PENCE; räkenskapsåret SEP-SLUT (TTM = mar '26); GEOGRAFILÅSET vågens tredje + VÅGENS FÖRSTA PERFECTA: NA+UK&I+Afrika&APAC+Europa = totalen EXAKT SAMTLIGA FEM FÖNSTER (kolumnfelet i handavläsningen rättat av skriptgrunden — maskin före hand); Nordamerika-andelen 36,8→45,0 %; FCF FYRA ÅR RAKT + TTM [273→499] rak CAGR +21,3 %, DUBBELT låst (OCF−capex exakt + källans marginalrader exakt); FCF-M 18,9 % > netto-M 14,6 % (SaaS-kassan, capex 1,2 % av oms); ENGÅNGSKONTROLLEN normal kaskad i TTM (14,6<19,4<22,6); FY2023-dippet dokumenterat (molnomställningens omstruktursår 211 M, sedan tre stigande år); P/E-FAMILJEN dokumenterad (källrad 24,92 · GAAP 23,09 · pris/EPS 24,75; källans EPS-rad 0,40 mot beräknad 0,429 — fälten = källrader enl. Shin-Etsu/freenet-precedensen); PEG NULL (basblandning); TUNN-EK-STRUKTUREN med metodnot (P/B 40,4 · D/E 9,19 · ROE 75,6 % — återköpen konsumerat bokfört EK 220 M; ROIC 26,1 % mot WACC 5,4 % gap +20,7 p är de jämförbara talen); ÅTERKÖPSMASKINEN: aktieantal −4,40 % = buyback-yield 4,40 % EXAKT, lånefinansierad (skuld 814→2 022 M); EV 10,39 med netto-skuld −1,50 mdr (0,02 % ren dekomposition); utdelningstrappa 11 raka år (DPS 0,177→0,225, takter ökande +2,5→+7,2 %/år); Altman 2,61 (tunn-EK-artefakt) · Piotroski 5 · beta 0,33; bruttomarginal-stabilitet 0,19 pp spread (universumets tightaste); rappdag BEKRÄFTAD 2026-11-19 strax utanför v172-fönstret; EK-serie saknas; alla repliker i paranoid (StockAnalysis LON 2026-09-25)",
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
  if (el[el.length - 1].ticker !== "SGE.L") { console.error("ABORT: sista raden ≠ SGE.L"); process.exit(1); }
}
const slut = JSON.parse(readFileSync(UNI, "utf8"));
const forandrade = backup.filter((b, i) => JSON.stringify(b) !== JSON.stringify(slut[i])).length;
if (forandrade !== 0) { console.error(`ABORT: ${forandrade} gamla rader förändrade`); process.exit(1); }

const kvitto = [];
kvitto.push(
  `UNIVERSUM-INLÄGG GRÖN: ${FÖRE}→${slut.length} (+1 The Sage Group SGE.L, Storbritannien/teknik 1→2; teknik-cellen → ${slut.filter((b) => b.bransch === "teknik").length}; Storbritannien → ${slut.filter((b) => b.land === "Storbritannien").length})`,
  `indent=${indent} · gamla rader förändrade=${forandrade} · läs-tillbaka ×2 OK`,
  `REPLIKER (TOLV LÅS): mcap ${R.mcapReplik.toFixed(3)} (8,89) 0,05 % · PS ${R.psReplik.toFixed(3)} (3,37) · P/B ${R.pbReplik.toFixed(2)} (40,39) 0,05 % EXAKT · EV ${R.evReplik.toFixed(3)} (10,39) 0,02 % REN · netto-M ${(R.nettoM * 100).toFixed(2)} % EXAKT · FCF-M ${(R.fcfM * 100).toFixed(2)} % · fcfY ${(R.fcfY * 100).toFixed(2)} % · divY ${(R.divY * 100).toFixed(2)} % EXAKT · D/E ${R.deReplik.toFixed(2)} · P/E pris/EPS 0,7 % · EV/Earnings ${R.evEarningsReplik.toFixed(2)} EXAKT · EV/Sales ${R.evSalesReplik.toFixed(3)}`,
  `P/E-FAMILJEANOMALIN DOKUMENTERAD: källrad 24,92 · GAAP ${R.peGaap.toFixed(2)} · pris/EPS ${R.pePrisEps.toFixed(2)}; källans EPS-rad 0,40 mot beräknad ${R.epsBeraknad.toFixed(3)} (7 % — fälten = källrader, Shin-Etsu/freenet-precedensen)`,
  `GEOGRAFILÅSET (VÅGENS TREDJE + FÖRSTA PERFECTA): NA+UK&I+Afrika&APAC+Europa = totalen EXAKT SAMTLIGA FEM FÖNSTER (handavläsningens FY23-kolumnfel rättat av grunden — maskin före hand); NA-andel 45,0 %`,
  `FCF DUBBELT LÅST + STIGANDE: [273 · 382 · 472 · 487] + TTM 499 — OCF−capex exakt fem fönster + källans marginalrader exakta; rak CAGR +${(R.fcfCagr3 * 100).toFixed(1)} %; FCF-M > netto-M (SaaS-kassan)`,
  `ENGÅNGSKONTROLLEN: normal kaskad TTM (14,6 < 19,4 < 22,6) · FY23-dippet dokumenterat (211 M, sedan tre stigande år) · resCAGR +${(R.resCagr3 * 100).toFixed(2)} % · omsCAGR +${(R.omsCagr3 * 100).toFixed(2)} %`,
  `TUNN-EK-METODNOTEN: P/B 40,4 · D/E 9,19 · ROE 75,6 % strukturella (EK 220 M; återköp −4,40 %/år = buyback-yield EXAKT) · ROIC 26,1 % mot WACC 5,4 % gap +20,7 p jämförbart · bruttomarginal-spread ${(R.bruttoSpread * 100).toFixed(2)} pp (universumets tightaste)`,
  `P/E-BÄRARKONTROLL: TTM-netto 385 M GBP > 0 — GRÖN · rappdag BEKRÄFTAD 2026-11-19 (strax utanför v172-fönstret) · UK:S SISTA 1-GREN ÖPPNAD (teknik 1→2)`,
);
writeFileSync("/tmp/r225-inlagg.txt", kvitto.join("\n"));
console.log(kvitto.join("\n"));
