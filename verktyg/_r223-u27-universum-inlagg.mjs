#!/usr/bin/env node
/**
 * _r223-u27-universum-inlagg.mjs — v173 dataset-djup rond 223 U27 (+1):
 * National Grid plc NG.L (Storbritannien/energi 1→2) — cellmotiverad duo:
 * BP p.l.c. (supermajor-producent, oljeprisets cykel) + National Grid
 * (reglerad transatlantisk el- och gasnätsoperatör — ASSET-BASE-MASKINEN:
 * rekordkapitalprogrammet kör FCF negativ [1 174 · 573 · 35 · −1 972 ·
 * −2 160] medan capex nästan dubblats 5 098 → 9 989; utdelningen betalas
 * under negativt FCF = den reglerade finansieringsmodellen). SHEL-KOLLISIONEN
 * tagen av grunden FÖRE valet (Shell plc står USA-klassad i universumet enl.
 * NYSE-primärnotingskonventionen — AZN-läxan r221: NG.L/NG/NGG-ADR+namn+URL
 * GRÖN). P/E-bärarkontroll FÖRE leverans: TTM-netto 3,241 mdr GBP > 0 — GRÖN.
 * SEGMENTLÅSET (vågens andra): sju segment summerar mot totalen (FY24/FY25/
 * FY26 EXAKT; FY23 diff 3 M = 0,014 % källavrundning) — ESO-kolumnen
 * förklaras av nationaliseringen 1 okt 2024. ENGÅNGSKONTROLLEN PER FÖNSTER
 * (Kirin-U3): FY2023 netto-M 36,00 % — mer än DUBBLA pretax-M 16,58 % =
 * avyttringsvinsten (UK Gas Transmission, divestiterrad 7 492) under linjen;
 * TTM-fönstret som bär fälten normaliserat (18,32 < 29,22).
 * Kvitto: /tmp/r223-inlagg.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const FÖRE = u.length;
if (u.some((b) => ["NG.L", "NG", "NGG"].includes(b.ticker) || /national.?grid/i.test(b.namn ?? "") || (b.kallor?.[0]?.url ?? "").includes("/lon/NG/"))) {
  console.error("ABORT: NG.L finns redan på disken");
  process.exit(1);
}

const K = {
  prisGBX: 1135.5, aktierMdr: 4.98, mcap: 56.50, eps: 0.65, peKalla: 17.42,
  fwdPe: 12.70, pb: 1.44, psKalla: 3.19, evKalla: 101.41,
  evEarnings: 31.29, evEbit: 19.33, evEbitda: 14.02, pocf: 7.22,
  roe: 0.0841, roic: 0.0372, roce: 0.0525, wacc: 0.0520,
  ebitM: 0.2922, pretaxM: 0.2364, ebitTtm: 5.17,
  nettoTtm: 3.241, revTtm: 17.687, fcfTtm: -2.160,
  skuld: 47.705, ek: 39.33, kassa: 2.828, de: 1.21, rantaTackning: 3.39,
  div: 0.485, payoutKalla: 0.7437, divYieldKalla: 0.0427,
  omsSerie: [21659, 19850, 18378, 17687],   // M GBP, mar-slut FY2023–FY2026
  resSerie: [7797, 2290, 2902, 3241],
  fcfSerie: [573, 35, -1972, -2160],
  ocfSerie: [6898, 6939, 6808, 7829], ocfTtm: 7.829,
  capexSerie: [6325, 6904, 8780, 9989], capexTtm: 9.989,
  // Segment FY2023–FY2026 (M GBP) — ESO 0 från och med FY2026 (nationaliserad 1 okt 2024)
  uketSerie: [1943, 2695, 2484, 2811],   // UK Electricity Transmission
  ukedSerie: [2033, 1790, 2421, 1937],   // UK Electricity Distribution
  esoSerie: [4659, 3753, 1012, 0],       // UK Electricity System Operator
  neSerie: [4427, 3948, 4306, 4174],     // New England
  nySerie: [6994, 6094, 6689, 7618],     // New York
  ngvSerie: [1283, 1332, 1350, 1057],    // National Grid Ventures
  otherSerie: [317, 238, 116, 90],       // Other Segment
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
  resPostDisposal: Math.pow(K.resSerie[3] / K.resSerie[1], 1 / 2) - 1,
  payoutReplik: K.div / K.eps,
  psReplik: K.mcap / K.revTtm,
  pbReplik: K.mcap / K.ek,
  deReplik: K.skuld / K.ek,
  evEarningsReplik: K.evKalla / K.nettoTtm,
  evEbitReplik: K.evKalla / K.ebitTtm,
  epsIdentitet: K.eps * K.aktierMdr,
};
const avv = (a, b) => Math.abs(a / b - 1);
const exakt = [
  ["mcap", R.mcapReplik, K.mcap, 0.02],
  ["ps", R.psReplik, K.psKalla, 0.02],
  ["pb", R.pbReplik, K.pb, 0.02],
  ["ev-dekomposition", R.evReplik, K.evKalla, 0.02],
  ["nettoM mot källans rad", R.nettoM, 0.1832, 0.02],
  ["fcfM mot källans rad", R.fcfM, -0.1221, 0.02],
  ["fcfY mot källrad", R.fcfY, -0.0382, 0.02],
  ["divYield mot källrad", R.divY, K.divYieldKalla, 0.02],
  ["de", R.deReplik, K.de, 0.02],
  ["EPS×aktier=netto", R.epsIdentitet, K.nettoTtm, 0.02],
  ["pe GAAP", R.peGaap, K.peKalla, 0.02],
  ["pe pris/EPS", R.pePrisEps, K.peKalla, 0.02],
  ["evEarnings", R.evEarningsReplik, K.evEarnings, 0.02],
  ["evEbit", R.evEbitReplik, K.evEbit, 0.02],
];
const fel = exakt.filter(([n, r, k, tol]) => avv(r, k) > tol);
if (fel.length) {
  console.error("ABORT: replik utanför tolerans: " + fel.map(([n, r, k]) => `${n} ${r.toFixed(4)} vs ${k}`).join("; "));
  process.exit(1);
}
const fcfIdent = [];
for (let i = 0; i < 4; i++) fcfIdent.push([K.ocfSerie[i] - K.capexSerie[i], K.fcfSerie[i]]);
fcfIdent.push([K.ocfTtm - K.capexTtm, K.fcfTtm]);
if (fcfIdent.some(([a, b]) => Math.abs(a - b) > 0.001)) {
  console.error("ABORT: FCF-serien ej OCF−capex-låst: " + fcfIdent.map(([a, b]) => `${a}≠${b}`).join("; "));
  process.exit(1);
}
const segSum = K.omsSerie.map((x, i) => [
  K.uketSerie[i] + K.ukedSerie[i] + K.esoSerie[i] + K.neSerie[i] + K.nySerie[i] + K.ngvSerie[i] + K.otherSerie[i], x,
]);
const exaktaAr = segSum.slice(1).filter(([s, x]) => s === x).length;   // FY24–FY26
const fy23Diff = Math.abs(segSum[0][0] - segSum[0][1]);
if (exaktaAr !== 3 || fy23Diff > 3) {
  console.error("ABORT: segmentlåset bruten: " + segSum.map(([s, x]) => `${s}≠${x}`).join("; "));
  process.exit(1);
}
if (K.nettoTtm <= 0) { console.error("ABORT: P/E-bärarkontroll — TTM-netto ≤ 0"); process.exit(1); }
const fy23NettoM = K.resSerie[0] / K.omsSerie[0];
if (!(fy23NettoM > 0.3599 && fy23NettoM < 0.3601)) { console.error("ABORT: FY23 netto-M ≠ 36,00 %"); process.exit(1); }
if (!(R.nettoM < K.ebitM)) { console.error("ABORT: TTM netto-M ≥ EBIT-M — normaliseringsordning bruten"); process.exit(1); }

const PARANOID =
  "LSE-PRIMÄRNOTING (underlag S&P Global Market Intelligence via StockAnalysis; senaste handelsdag 2026-09-24, hämtat 2026-09-25 — öppning 1 131,50 · föregående close 1 134,50 · dagsspann 1 127,00–1 148,50 · 52v 1 041,50–1 428,50 (+9,29 %); färshämtning med FYRA paneler (quote/statistics/financials/cash-flow); RÄKENSKAPSÅRET SLUTAR 31 MARS (mar-slut — FY2026 = apr 2025→mar 2026; rapporterar halvårsvis enligt källan); prisfältet i PENCE enligt BA.L/HSBA.L/RR.L-cellkonventionen, mcap/serier i GBP mdr): " +
  "pris 11,355 GBP (1 135,5 GBp; beta 0,59), mcap 56,50 mdr GBP på 4,98 mdr aktier (replik 4,98 × 11,355 = 56,55 — 0,08 %), " +
  "P/E 17,42 källans rad med GAAP-repliken 56,50/3,241 = 17,43 (0,08 %) och pris/EPS-repliken 11,355/0,65 = 17,47 (0,28 %) — tre tal i familjedokumentation; fwd P/E 12,70 (marknadens implied EPS +37 % — normaliseringsscenario efter investeringstoppen, referens aldrig löfte); PEG-källrad 1,30 med oklar tillväxtbas (17,42/1,30 = 13,4 % mot konsensus 3Y EPS 10,96 %) ⇒ fältet NULL (basblandning vägras, Shin-Etsu/freenet-precedensen); PS 3,19 EXAKT (56,50/17,687 — 0,15 %) · P/B 1,44 EXAKT (56,50/39,33 — 0,25 %) · P/TBV 2,17 · P/OCF 7,22 · EPS×AKTIER 0,65 × 4,98 = 3,237 ≈ netto 3,241 (0,12 %); " +
  "EV-DEKOMPOSITION REN: 56,50 + 47,705 − 2,828 = 101,38 mot källans 101,41 (0,03 %) — NETTO-SKULD −44,88 mdr (−9,02/aktie): EV = 1,79× mcap, den reglerade balansmodellen (mot RR:s netto-kassa +2,11 mdr i grann-cellen); EV/Earnings 31,29 EXAKT (101,41/3,241 — 0,009 %) · EV/EBIT 19,33 källrad med repliken 101,41/5,17 = 19,61 (1,5 %, avrundad EBIT-rad dokumenterad) · EV/EBITDA 14,02 (källrad; EBITDA-raden 7,03 bär annan bas än EV/EBITDA-implieden 7,23 — 2,9 %, familjediskrepans dokumenterad); " +
  "ENGÅNGSKONTROLLEN PER FÖNSTER (Kirin-U3-doktrinen): FY2023 netto 7 797 på oms 21 659 = netto-M 36,00 % — MER ÄN DUBBLA pretax-M 16,58 % = avyttringsvinsten under linjen (UK Gas Transmission såld jan 2023; divestiterraden 7 492 i kassaflödet) — därför resultatCAGR NULL (basen 7 797 bär engångsposten; basblandning vägras) och post-disposal-CAGR dokumenterad i stället: FY2024→FY2026 (2 290→3 241) = +18,96 % konsekutiv; TTM-FÖNSTRET SOM BÄR FÄLTEN ÄR NORMALISERAT: netto-M 18,32 % < EBIT-M 29,22 % (ordning OK, kontrollen godkänd); " +
  "FCF-KOLLAPSEN — cellens pedagogiska kärna: [1 174 · 573 · 35 · −1 972 · −2 160] FY2022–FY2026 (capex 5 098 → 6 325 → 6 904 → 8 780 → 9 989 ≈ DUBBLAT på fyra år — rekordkapitalprogrammet, £60 mdr+-femårsplanen som AGM 2026 bekräftade); FCF-serien intern låst (OCF−capex exakt fem fönster mot källans egna FCF-rader) · FCF-M −12,21 % EXAKT (−2 160/17 687) · FCF-yield −3,82 % (källrad + replik −2,160/56,50 EXAKT) · utdelningen 0,485 GBP (4,27 % EXAKT replik 48,5/1 135,5) betalas under negativt FCF = den reglerade finansieringsmodellen (payout-källrad 74,37 %; EPS-bas-repliken 0,485/0,65 = 74,6 %, noterad); " +
  "UTDELNINGSTRAPPAN: DPS [0,510 · 0,554 · 0,585 · 0,467 · 0,485] — ombaseringen −20,16 % FY2025 efter nyemissionen maj 2024, sedan +3,79 %; " +
  "SEGMENTLÅSET (vågens andra, efter RR): UK Electricity Transmission [1 943 · 2 695 · 2 484 · 2 811] + UK Electricity Distribution [2 033 · 1 790 · 2 421 · 1 937] + UK Electricity System Operator [4 659 · 3 753 · 1 012 · 0] + New England [4 427 · 3 948 · 4 306 · 4 174] + New York [6 994 · 6 094 · 6 689 · 7 618] + National Grid Ventures [1 283 · 1 332 · 1 350 · 1 057] + Other [317 · 238 · 116 · 90] summerar EXAKT mot omsättningen FY2024/FY2025/FY2026 (FY2023 diff 3 M = 0,014 % källavrundning); ESO-KOLUMNEN: Electricity System Operator nationaliserad av UK-regeringen 1 okt 2024 — FY2026 helt utan ESO-intäkt (källradens partiella kolumner förklarade); TRANSATLANTISKA PROFILEN: New England + New York = 11,79 av 17,69 mdr (66,6 %) — UK-reglering möter USA-reglering i samma bolag; " +
  "SERIEPROFILER: oms [21 659 · 19 850 · 18 378 · 17 687] (rak CAGR −6,54 % — PERIMETER + VALUTOR: gasavyttringen och ESO lämnat konsolideringen, GBP-styrka mot USD; fyra fallande år dokumenterade som sådana) · netto [7 797 · 2 290 · 2 902 · 3 241] (resultatCAGR NULL, se engångskontrollen) · EPS [2,12 · 0,57 · 0,61 · 0,65] (FY2023 bär engångsposten; sedan tre stigande på utspädd aktiebas); omsättningstillväxt TTM −3,76 % · prognosTillväxt +9,43 % (källans rev-fwd 3Y — ren bas, capexplanens tillväxt); " +
  "METODNOTER: ROE 8,41 % · ROIC 3,72 % (S&P-definition) mot WACC 5,20 % — gap −1,48 p: ROIC<WACC är den reglerade tillgångsbasens SIGNATUR (kapitalstocken växer snabbare än resultatet under investeringsfasen — jämför DSV-integrationsåret men strukturellt här); bruttoMarginal NULL — källans 100,00 % är en ARTEFAKT (Gross Profit = Revenue; nätbolag utan COGS-linje — BT-precedensen 'osatt hellre än felbas'); räntetäckning 3,39 · D/E 1,21 EXAKT (47,705/39,33) · Debt/EBITDA 6,66 (kapitalintensiv balans) · current ratio 0,76; Altman n/a (källan saknar — utility-konvention med reglerad balans) · Piotroski saknas i källan; skattesats 22,45 %; institutionsägande 80,36 % · insiders 0,02 %; " +
  "AKTIEANTAL +5,12 % YoY (buyback-yield −5,12 % — DILUTION inte återköp): nyemissionen maj 2024 (~7 mdr GBP rights issue för kapitalprogrammet) ⇒ nyemissioner 1 · återköp 0; balansserierna: kassa [2 768 · 4 258 · 6 931 · 2 828] · skuld [44 104 · 48 198 · 48 677 · 47 705] · netto [−41 336 · −43 940 · −41 746 · −44 877] (FY2023–FY2026); " +
  "kandidatur: CELLMOTIVERAD duo enligt U13-mönstret — Storbritannien/energi-cellens TVÅ affärsmodeller: BP (supermajor-producent, oljeprisets cykel, utdelning på råvaruintäkt) + National Grid (reglerad nätsoperatör, tillgångsbastillväxt, utdelning på reglerad avkastning); producent/distributör-paralleliteten dokumenterar Japan/energi (INPEX+Tokyo Gas) och Tyskland/energi (RWE+E.ON); kontrasten spänner intäktsmodell OCH balans (BP:s råvarucykel mot NG:s −45 mdr netto-skuld + negativa FCF under investeringstoppen); SHEL-KOLLISIONEN tagen av grunden FÖRE valet: Shell plc står USA-klassad i universumet (NYSE-primärnotingskonventionen, supermajor-kvintetten) — kollisionskontroll primär+sekundär (AZN-läxan r221: NG.L/NG/NGG-ADR+namn+URL) GRÖN; P/E-bärarkriteriet kontrollerat FÖRE leverans (TTM-netto 3 241 M GBP > 0; Sony/Honda-doktrinen); Utilities-Regulated Electric ⇒ energi-cellen (28→29 bolag), Storbritannien 12→13 (energi-grenen 1→2); NÄSTA RAPPORT BEKRÄFTAD 2026-11-05 (strax utanför v172-fönstret 10-20→11-04 — EN DAG efter fönstrets slut; notis vid kalenderberöring).";

const RAD = {
  ticker: "NG.L",
  namn: "National Grid plc",
  bransch: "energi",
  land: "Storbritannien",
  valuta: "GBX",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-25", url: "https://stockanalysis.com/quote/lon/NG/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/)", paranoid: PARANOID }],
  hamtat: "2026-09-25",
  pris: K.prisGBX,
  marknadsKapitalMdr: K.mcap,
  tillvaxt: {
    omsattningCAGR5ar: +R.omsCagr3.toFixed(4),
    resultatCAGR5ar: null,
    omsattningTillvaxtTTM: -0.0376,
    prognosTillvaxt: 0.0943,
  },
  lonksamhet: {
    roe: K.roe, roic: K.roic, bruttoMarginal: null, ebitMarginal: K.ebitM,
    nettoMarginal: +R.nettoM.toFixed(4), fcfMarginal: +R.fcfM.toFixed(4),
  },
  stabilitet: {
    skuldEgenkapital: K.de, rantaTackning: K.rantaTackning, fcfPositivaSenaste5: 3,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: 1,
  },
  aterkop: { senasteArMdr: 0, andelUtestande: K.payoutKalla, insiderkopSenaste6man: 0 },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
  vardering: { pe: K.peKalla, pb: K.pb, evEbit: K.evEbit, peg: null, fcfYield: +R.fcfY.toFixed(4), egenKapitalMultipl: K.pb },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2023", "2024", "2025", "2026"],
    omsattning: K.omsSerie.map((x) => x * 1e6),
    resultat: K.resSerie.map((x) => x * 1e6),
    egetKapital: [],
    fcf: K.fcfSerie.map((x) => x * 1e6),
  },
  notering:
    "cellmotiverad duo (Storbritannien/energi 1→2: BP supermajor-producent + National Grid reglerad nätsoperatör — ASSET-BASE-MASKINEN mot oljeprisets cykel; producent/distributör-parallelitet som Japan/energi och Tyskland/energi); LSE-primär, prisfältet i PENCE (BA.L-konventionen), mcap GBP mdr; RÄKENSKAPSÅRET MAR-SLUT (FY2026 = apr 2025→mar 2026, halvårsvis rapportering); SHEL-KOLLISIONEN avvärjd FÖRE valet (Shell står USA-klassad i universumet — AZN-läxan tillämpad på NG.L/NG/NGG+namn+URL GRÖN); SEGMENTLÅSET vågens andra: sju segment = totalen EXAKT FY24/FY25/FY26 (FY23 diff 3 M = 0,014 %); ESO nationaliserad 1 okt 2024 (FY26 utan ESO); transatlantisk profil 66,6 % USA; ENGÅNGSKONTROLLEN (Kirin-U3): FY2023 netto-M 36,00 % mer än dubbla pretax-M 16,58 % = avyttringsvinst UK Gas Transmission under linjen — resultatCAGR NULL (basblandning vägras; post-disposal-CAGR FY24→FY26 +18,96 % dokumenterad); TTM-fönstret som bär fälten normaliserat (18,32 < 29,22); FCF-KOLLAPSEN [1 174 · 573 · 35 · −1 972 · −2 160] — capex 5 098→9 989 ≈ dubblat, rekordkapitalprogram; serien OCF−capex-låst fem fönster; FCF-M −12,21 % · FCF-yield −3,82 % (källrad+replik) — utdelning 0,485 (4,27 % EXAKT) BETALAS UNDER NEGATIVT FCF = reglerad finansieringsmodell; DPS-trappan med ombasering −20,16 % FY2025; NYEMISSION 1 (maj 2024 ~7 mdr GBP; aktieantal +5,12 % YoY, återköp 0); EV 101,41 med NETTO-SKULD −44,88 mdr (0,03 % ren dekomposition — mot RR:s netto-kassa i grann-cellen); ROIC 3,72 % < WACC 5,20 % = regleringens signatur (metodnot); bruttoMarginal NULL (källans 100 % artefakt — BT-precedensen); D/E 1,21 EXAKT · räntetäckning 3,39 · Debt/EBITDA 6,66; Altman/Piotroski saknas i källan; beta 0,59; rappdag BEKRÄFTAD 2026-11-05 (en dag efter v172-fönstrets slut); EK-serie saknas; alla repliker i paranoid (StockAnalysis LON 2026-09-25)",
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
  if (el[el.length - 1].ticker !== "NG.L") { console.error("ABORT: sista raden ≠ NG.L"); process.exit(1); }
}
const slut = JSON.parse(readFileSync(UNI, "utf8"));
const forandrade = backup.filter((b, i) => JSON.stringify(b) !== JSON.stringify(slut[i])).length;
if (forandrade !== 0) { console.error(`ABORT: ${forandrade} gamla rader förändrade`); process.exit(1); }

const kvitto = [];
kvitto.push(
  `UNIVERSUM-INLÄGG GRÖN: ${FÖRE}→${slut.length} (+1 National Grid NG.L, Storbritannien/energi 1→2; energi-cellen 28→${slut.filter((b) => b.bransch === "energi").length}; Storbritannien → ${slut.filter((b) => b.land === "Storbritannien").length})`,
  `indent=${indent} · gamla rader förändrade=${forandrade} · läs-tillbaka ×2 OK`,
  `REPLIKER (FJORTON LÅS): mcap ${R.mcapReplik.toFixed(2)} (56,50) 0,08 % · PS ${R.psReplik.toFixed(3)} (3,19) 0,15 % · P/B ${R.pbReplik.toFixed(3)} (1,44) 0,25 % · EV ${R.evReplik.toFixed(2)} (101,41) 0,03 % REN · netto-M ${(R.nettoM * 100).toFixed(2)} % · FCF-M ${(R.fcfM * 100).toFixed(2)} % EXAKT · fcfY ${(R.fcfY * 100).toFixed(2)} % · divY ${(R.divY * 100).toFixed(2)} % EXAKT · D/E ${R.deReplik.toFixed(3)} · EPS×aktier 0,12 % · P/E-familjen 17,42/17,43/17,47 · EV/Earnings ${R.evEarningsReplik.toFixed(2)} EXAKT · EV/EBIT 1,5 % (avrundad EBIT-rad dokumenterad)`,
  `SEGMENTLÅSET (vågens andra): sju segment = totalen EXAKT FY24/FY25/FY26; FY23 diff ${fy23Diff} M (0,014 % källavrundning); ESO 0 från FY26 (nationaliserad 1 okt 2024)`,
  `FCF-SERIEN INTERN LÅST: [573 · 35 · −1 972 · −2 160] + TTM −2 160 (OCF−capex exakt fem fönster mot källans egna rader); capex 5 098→9 989 ≈ dubblat`,
  `ENGÅNGSKONTROLLEN: FY2023 netto-M 36,00 % > pretax-M 16,58 % (avyttringsvinsten under linjen — dokumenterad) · resultatCAGR NULL · post-disposal-CAGR FY24→FY26 +${(R.resPostDisposal * 100).toFixed(2)} % · TTM-fönstret normaliserat 18,32 < 29,22 · oms-CAGR ${(R.omsCagr3 * 100).toFixed(2)} % (perimeter+valutor dokumenterat)`,
  `P/E-BÄRARKONTROLL: TTM-netto 3,241 mdr GBP > 0 — GRÖN · SHEL-kollisionsgrinden: NG.L bär duopartnerrollen (Shell USA-klassad)`,
);
writeFileSync("/tmp/r223-inlagg.txt", kvitto.join("\n"));
console.log(kvitto.join("\n"));
