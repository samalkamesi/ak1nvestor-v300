#!/usr/bin/env node
/**
 * _r224-u28-universum-inlagg.mjs — v173 dataset-djup rond 224 U28 (+1):
 * Diageo plc DGE.L (Storbritannien/konsument 1→2) — cellmotiverad duo:
 * Unilever (dagligvarubredd, 400 varumärken) + Diageo (spritportfölj —
 * Johnnie Walker, Guinness, Don Julio: premium-prissättning och on-trade).
 * USD-RAPPORTVALUTA + GBX-NOTING (BP.L-precedensen). Kollisionskontroll
 * primär+sekundär (AZN-läxan: DGE.L/DGE/DEO-ADR+namn+URL) GRÖN; P/E-
 * bärarkontroll FÖRE leverans: TTM-netto 1,31 mdr GBP > 0 — GRÖN.
 * EARNINGS-VS-CASH-KLIVET: netto kollapsar 4 445→1 737 (nedskrivningar
 * 1 666 M USD källbelagda i kassaflödet) medan FCF stiger FYRA ÅR RAKT
 * [2 219 → 3 195] — serie intern låst via marginalraderna (10,79/12,80/
 * 13,26/16,27 % EXAKT). UTDELNINGEN HALVERAD: DPS [0,986 · 1,035 · 1,035 ·
 * 0,500] USD — FY2026 −51,68 %; current annualiserad 0,37 GBP (2,25 %);
 * FCF-payout 34,29 % EXAKT. Rappdag est. 2026-10-29 — INOM v172-fönstret.
 * Kvitto: /tmp/r224-inlagg.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const FÖRE = u.length;
if (u.some((b) => ["DGE.L", "DGE", "DEO"].includes(b.ticker) || /diageo/i.test(b.namn ?? "") || (b.kallor?.[0]?.url ?? "").includes("/lon/DGE/"))) {
  console.error("ABORT: DGE.L finns redan på disken");
  process.exit(1);
}

const K = {
  prisGBX: 1642.5, aktierMdr: 2.22, mcap: 36.54, eps: 0.59, peKalla: 27.97,
  fwdPe: 12.97, pb: 3.74, psKalla: 2.47, evKalla: 53.49,
  evEarnings: 40.86, evSales: 3.61, evEbit: 11.88, evEbitda: 10.68,
  pFcf: 15.17, pocf: 11.04, pegKalla: 2.64,
  roe: 0.1499, roic: 0.1317, roce: 0.1594, wacc: 0.0527,
  ebitM: 0.2930, pretaxM: 0.1305, bruttoM: 0.5982,
  nettoTtm: 1.31, revTtm: 14.80, fcfTtm: 2.41,          // GBP (statistikpanelen)
  skuld: 16.73, ek: 9.76, kassa: 1.34, de: 1.71, rantaTackning: 5.45,
  div: 0.37, divYieldKalla: 0.0225, payoutFcf: 0.3429, fcfPerShare: 1.08,
  // USD-serier (rapportvaluta), jun-slut FY2023–FY2026
  omsSerie: [20555, 20269, 20245, 19643],
  resSerie: [4445, 3870, 2354, 1737],
  fcfSerie: [2219, 2595, 2685, 3195],
  ocfSerie: [3636, 4105, 4297, 4392], ocfTtm: 4.392,
  capexSerie: [1417, 1510, 1612, 1197], capexTtm: 1.197,
  fcfMarginSerie: [0.1079, 0.1280, 0.1326, 0.1627],   // källans egna rader — tvärverifiering
  dpsSerieUsd: [0.986, 1.035, 1.035, 0.500],
};
const R = {
  mcapReplik: (K.aktierMdr * K.prisGBX) / 100,
  pePrisEps: K.prisGBX / 100 / K.eps,
  peGaap: K.mcap / K.nettoTtm,
  nettoM: K.nettoTtm / K.revTtm,
  fcfM: K.fcfTtm / K.revTtm,
  fcfY: K.fcfTtm / K.mcap,
  divY: (K.div * 100) / K.prisGBX,
  omsCagr3: Math.pow(K.omsSerie[3] / K.omsSerie[0], 1 / 3) - 1,
  resCagr3: Math.pow(K.resSerie[3] / K.resSerie[0], 1 / 3) - 1,
  fcfCagr3: Math.pow(K.fcfSerie[3] / K.fcfSerie[0], 1 / 3) - 1,
  payoutReplik: K.div / K.eps,
  psReplik: K.mcap / K.revTtm,
  pbReplik: K.mcap / K.ek,
  deReplik: K.skuld / K.ek,
  evEarningsReplik: K.evKalla / K.nettoTtm,
  evSalesReplik: K.evKalla / K.revTtm,
  evResidual: K.evKalla - (K.mcap + K.skuld - K.kassa),
  epsIdentitet: K.eps * K.aktierMdr,
  fcfPerShareReplik: K.fcfTtm / K.aktierMdr,
};
const avv = (a, b) => Math.abs(a / b - 1);
const exakt = [
  ["mcap", R.mcapReplik, K.mcap, 0.02],
  ["ps", R.psReplik, K.psKalla, 0.02],
  ["pb", R.pbReplik, K.pb, 0.02],
  ["nettoM mot källans rad", R.nettoM, 0.0884, 0.02],
  ["fcfM mot källans rad", R.fcfM, 0.1620, 0.02],
  ["fcfY mot källrad", R.fcfY, 0.0659, 0.02],
  ["divYield mot källrad", R.divY, K.divYieldKalla, 0.02],
  ["de", R.deReplik, K.de, 0.02],
  ["EPS×aktier=netto", R.epsIdentitet, K.nettoTtm, 0.02],
  ["pe GAAP", R.peGaap, K.peKalla, 0.02],
  ["pe pris/EPS", R.pePrisEps, K.peKalla, 0.02],
  ["evEarnings", R.evEarningsReplik, K.evEarnings, 0.02],
  ["evSales", R.evSalesReplik, K.evSales, 0.02],
  ["fcfPerShare", R.fcfPerShareReplik, K.fcfPerShare, 0.02],
];
const fel = exakt.filter(([n, r, k, tol]) => avv(r, k) > tol);
if (fel.length) {
  console.error("ABORT: replik utanför tolerans: " + fel.map(([n, r, k]) => `${n} ${r.toFixed(4)} vs ${k}`).join("; "));
  process.exit(1);
}
if (!(R.evResidual > 1.2 && R.evResidual < 1.9)) {
  console.error(`ABORT: EV-residualen utanför dokumenterat spann: ${R.evResidual.toFixed(2)}`);
  process.exit(1);
}
const fcfIdent = [];
for (let i = 0; i < 4; i++) fcfIdent.push([K.ocfSerie[i] - K.capexSerie[i], K.fcfSerie[i], K.fcfMarginSerie[i] * K.omsSerie[i]]);
// TTM = FY2026 (jun-slut, bokslutet digesterat 2026-08-18): USD-identiteten täcks av fjärde fönstret;
// GBP-pariteten (2,41 mdr GBP × 1,33 ≈ 3,21 M USD) är approximativ och kontrolleras ej som identitet.
if (fcfIdent.some(([a, b, m]) => Math.abs(a - b) > 0.001 || Math.abs(m - b) > 0.002 * b)) {
  console.error("ABORT: FCF-serien ej OCF−capex-/marginalradslåst: " + fcfIdent.map(([a, b]) => `${a}≠${b}`).join("; "));
  process.exit(1);
}
const stigande = K.fcfSerie.every((x, i) => i === 0 || x > K.fcfSerie[i - 1]);
if (!stigande) { console.error("ABORT: FCF-serien ej stigande fyra år"); process.exit(1); }
if (K.nettoTtm <= 0) { console.error("ABORT: P/E-bärarkontroll — TTM-netto ≤ 0"); process.exit(1); }
if (!(K.ebitM - K.pretaxM > 0.15)) { console.error("ABORT: EBIT-M→pretax-M-gapet (engångsbelastningarna) ej dokumenterbart"); process.exit(1); }

const PARANOID =
  "LSE-PRIMÄRNOTING (underlag S&P Global Market Intelligence via StockAnalysis; senaste handelsdag 2026-09-24, hämtat 2026-09-25 — öppning 1 631,50 · föregående close 1 620,50 · dagsspann 1 629,00–1 652,00 · 52v 1 295,50–1 903,90 (−7,67 %); färshämtning med FYRA paneler (quote/statistics/financials/cash-flow); RÄKENSKAPSÅRET SLUTAR 30 JUNI (jun-slut — FY2026 = jul 2025→jun 2026; rapporterar halvårsvis, senaste datauppdatering 2026-08-18 = FY26 bokslutet); USD-RAPPORTVALUTA + GBX-NOTING enligt BP.L-precedensen: prisfältet i PENCE, mcap/aktier i GBP, SERIER OCH DPS I USD (källans finansiella paneler bär USD); valutaparitet USD/GBP ≈ 1,33 dokumenterar bryggan 19 643 M USD ≈ 14,80 mdr GBP): " +
  "pris 16,425 GBP (1 642,5 GBp; beta 0,32), mcap 36,54 mdr GBP på 2,22 mdr aktier (replik 2,22 × 16,425 = 36,46 — 0,21 %), " +
  "P/E 27,97 källans rad med GAAP-repliken 36,54/1,31 = 27,89 (0,3 %) och pris/EPS-repliken 16,425/0,59 = 27,84 (0,5 %) — tre tal i familjedokumentation; fwd P/E 12,97 ⇒ implied EPS +116 % — NORMALISERINGSSCENARIO efter nedskrivningsåret (konsensusreferens, ALDRIG löfte; DSV-precedensen fwd +126 %); PEG-källrad 2,64 med oklar bas (27,97/2,64 = 10,6 % mot konsensus 3Y EPS 5,00 %) ⇒ fältet NULL (basblandning vägras); PS 2,47 EXAKT (36,54/14,80) · P/B 3,74 EXAKT (36,54/9,76) · P/FCF 15,17 · P/OCF 11,04 · EPS×AKTIER 0,59 × 2,22 = 1,310 ≈ netto 1,31 EXAKT; " +
  "EV-ANVÄNDNINGARNA LÅSTA, DEKOMPOSITIONEN DOKUMENTERAD MED RESIDUAL: EV 53,49 bär residual +1,56 mdr utöver mcap+skuld−kassa (36,54+16,73−1,34 = 51,93; 2,9 %) = källans EV inkluderar poster utanför balansraderna (lease/pension/NCI) — EV/Earnings 40,86 med replik 53,49/1,31 = 40,83 (0,08 %) · EV/Sales 3,61 med replik 3,614 (0,1 %) · EV/EBIT 11,88 · EV/EBITDA 10,68; NETTO-SKULD −15,39 mdr GBP (−6,92/aktie); " +
  "ENGÅNGSKONTROLLEN PER FÖNSTER (Kirin-U3-doktrinen, INVERSA signaturen): EBIT-M 29,30 % mot pretax-M 13,05 % — gapet 16,25 p.p. = räntekostnader (kontant-ränta 1 044 M USD) + NEDSKRIVNINGARNA: kassaflödets rad 'Asset Writedown & Restructuring Costs' 1 666 M USD FY2026 källbelagd (fyra år: [413 · 700 · −182 · 590 · 1 666]) — TTM netto-M 8,84 % är DEPRIMERAT av engångsposter (nettots kollaps 4 445→1 737 dokumenterad som nedskrivningsburen, inte driftsburen: rörelseresultatet 5 756 mot 6 366 FY23 = −9,6 %); " +
  "EARNINGS-VS-CASH-KLIVET — cellens pedagogiska kärna: FCF FYRA ÅR RAKT [2 219 · 2 595 · 2 685 · 3 195] M USD (rak CAGR +12,9 %) MEDAN netto faller varje år [4 445 · 3 870 · 2 354 · 1 737] — nedskrivningarna är icke-kontanta och kassaskåpet växer genom boksletskollapsen; FCF-serien DUBBELT låst: OCF−capex exakt fyra fönster [3 636−1 417 · 4 105−1 510 · 4 297−1 612 · 4 392−1 197] OCH källans egna marginalrader [10,79 · 12,80 · 13,26 · 16,27 %] reproducerar serien exakt mot omsättningen; FCF/share 1,08 GBP (replik 2,41/2,22 = 1,086) · FCF-yield 6,59 % (källrad + replik 2,41/36,54) · FCF-payout 34,29 % EXAKT (0,37/1,08); " +
  "UTDELNINGEN HALVERAD: DPS [0,911 · 0,986 · 1,035 · 1,035 · 0,500] USD FY2022–FY2026 — FY2025 hållen (0 %), FY2026 SKUREN −51,68 % (0,500 USD); current annualiserad 0,37 GBP = 2,25 % yield (EXAKT replik 37/1 642,5; källans tillväxtrader −51,68 % USD-bas FY26 och −53,24 % GBP-bas current — två valutabaser redovisade); payout-källrad 106,28 % = KONTANTBAS (under året utbetalda utdelningar/deprimerat netto) — EPS-basen 0,37/0,59 = 62,7 % och FCF-basen 34,29 % redovisas bredvid (tre baser, dokumenterade); " +
  "SERIEPROFILER: oms [20 555 · 20 269 · 20 245 · 19 643] M USD — rak CAGR −1,50 % (fyra fallande år: Kina-svaghet, Latinamerika-valutor, aperitiv-trenden; dokumenterade som sådana) · netto [4 445 · 3 870 · 2 354 · 1 737] — resultatCAGR −26,89 % ÄRLIGT LAGRAD (toppen FY2023 → nedskrivningsåret FY2026; fönstret positivt i samtliga fem år) · EPS [1,96 · 1,73 · 1,06 · 0,78] USD; bruttoMarginal 59,82 % · EBIT-M 29,30 %; källans TTM-tillväxtrad −0,81 % anomali mot FY26-raden −2,97 % (TTM = FY26) — FY26-radan bär fältet; prognosTillväxt +0,40 % (källans rev-fwd 3Y); " +
  "METODNOTER: ROE 14,99 % · ROIC 13,17 % mot WACC 5,27 % — gap +7,9 p (varumärkesmoatet lever i avkastningstalen även genom nedskrivningsåret) · segmentsektionen låses INTE: Spirits+Beer+RTD+Other [21 805 · 4 554 · 1 113 · 290] summerar till 27 762 mot nettoomsättning 19 643 — källan visar BRUTTOINTÄKTER inkl. accis (≈1,43× netto) — redovisat som datafakta, inget segmentlås (NG/RR-precedenserna låser bara exakta serier) · aktieantal +0,14 % YoY (buyback-yield −0,14 % ≈ neutralt) ⇒ nyemissioner 0 · återköp 0 · D/E 1,71 EXAKT (16,73/9,76) · räntetäckning 5,45 · Debt/EBITDA 3,45 · Altman 2,21 (gränszon, dokumenterad) · Piotroski 5 · skattesats 23,63 % · institutionsägande 85,31 % · netto-skuld/aktie −6,92 GBP; balansserier USD [FY23–FY26]: kassa [2 062 · 1 405 · 2 518 · 1 781] · skuld [21 831 · 22 481 · 24 401 · 22 196] · netto [−19 769 · −21 076 · −21 883 · −20 415]; " +
  "kandidatur: CELLMOTIVERAD duo enligt U13-mönstret — Storbritannien/konsument-cellens TVÅ affärsmodeller: Unilever (dagligvarubredd — 400 varumärken, emerging markets-exponering, utdelningsaristokratprofilen) + Diageo (spritportfölj — premium-prissättning, on-trade/cyclical spirits, Guinness): bred staples mot varumärkespremium; kontrasten spänner prismakt OCH kapitalcykel (ULVR stabilt mot DGE:s nedskrivningsår + utdelningsomsbasering); kollisionskontroll primär+sekundär (AZN-läxan r221: DGE.L/DGE/DEO-ADR+namn+URL) GRÖN; P/E-bärarkriteriet kontrollerat FÖRE leverans (TTM-netto 1,31 mdr GBP > 0; Sony/Honda-doktrinen); Beverages/Brewers ⇒ konsument-cellen, Storbritannien 13→14 (konsument-grenen 1→2); NÄSTA RAPPORT est. 2026-10-29 — INOM v172-FÖNSTRET (10-20→11-04): DGE är rappdagsleveransen som DSV 10-21 och 4503 10-30.";

const RAD = {
  ticker: "DGE.L",
  namn: "Diageo plc",
  bransch: "konsument",
  land: "Storbritannien",
  valuta: "GBX",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-25", url: "https://stockanalysis.com/quote/lon/DGE/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/)", paranoid: PARANOID }],
  hamtat: "2026-09-25",
  pris: K.prisGBX,
  marknadsKapitalMdr: K.mcap,
  tillvaxt: {
    omsattningCAGR5ar: +R.omsCagr3.toFixed(4),
    resultatCAGR5ar: +R.resCagr3.toFixed(4),
    omsattningTillvaxtTTM: -0.0297,
    prognosTillvaxt: 0.004,
  },
  lonksamhet: {
    roe: K.roe, roic: K.roic, bruttoMarginal: K.bruttoM, ebitMarginal: K.ebitM,
    nettoMarginal: +R.nettoM.toFixed(4), fcfMarginal: 0.162,
  },
  stabilitet: {
    skuldEgenkapital: K.de, rantaTackning: K.rantaTackning, fcfPositivaSenaste5: 5,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: 0,
  },
  aterkop: { senasteArMdr: 0, andelUtestande: +R.payoutReplik.toFixed(3), insiderkopSenaste6man: 0 },
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
    "cellmotiverad duo (Storbritannien/konsument 1→2: Unilever dagligvarubredd + Diageo spritportfölj — bred staples mot varumärkespremium); LSE-primär, USD-RAPPORTVALUTA + GBX-NOTING enl. BP.L-precedensen (serier/DPS i USD, pris/mcap i GBP/pence); räkenskapsåret JUN-SLUT, rapporterar halvårsvis; kollisionskontroll primär+sekundär (AZN-läxan) GRÖN; EARNINGS-VS-CASH-KLIVET: netto kollapsar [4 445→1 737] på nedskrivningar (källbelagda 1 666 M USD FY26 i kassaflödet) medan FCF stiger FYRA ÅR RAKT [2 219→3 195] — serien DUBBELT låst (OCF−capex exakt + källans marginalrader 10,79/12,80/13,26/16,27 % EXAKT); ENGÅNGSKONTROLLEN (Kirin-U3, inversa signaturen): EBIT-M 29,3 % mot pretax-M 13,1 % — gapet = ränta + nedskrivningar; TTM netto-M 8,84 % DEPRIMERAT, normaliseringsscenario (fwd P/E 12,97 ⇒ implied EPS +116 %, konsensus aldrig löfte); UTDELNINGEN HALVERAD: DPS [0,986 · 1,035 · 1,035 · 0,500] USD (FY26 −51,7 %), current 0,37 GBP (2,25 % EXAKT); payout tre baser dokumenterade (kontant 106,28 % · EPS 62,7 % · FCF 34,29 % EXAKT); resultatCAGR −26,89 % ÄRLIGT LAGRAD (topp→nedskrivningsår, alla fönster positiva); oms fyra fallande år (rak CAGR −1,50 %, Kina/valutor dokumenterat); EV med residual +1,56 mdr dokumenterad (användningarna låsta: EV/Earnings 0,08 % · EV/Sales 0,1 %); netto-skuld −15,39 mdr; segmentsektionen låses INTE (bruttointäkter inkl. accis ≈1,43× netto — datafakta); ROIC 13,2 % mot WACC 5,3 % (gap +7,9 p — varumärkesmoatet); D/E 1,71 EXAKT; Altman 2,21 · Piotroski 5; beta 0,32; aktieantal +0,14 % (nyemissioner 0, återköp 0); rappdag est. 2026-10-29 INOM v172-fönstret; EK-serie saknas; alla repliker i paranoid (StockAnalysis LON 2026-09-25)",
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
  if (el[el.length - 1].ticker !== "DGE.L") { console.error("ABORT: sista raden ≠ DGE.L"); process.exit(1); }
}
const slut = JSON.parse(readFileSync(UNI, "utf8"));
const forandrade = backup.filter((b, i) => JSON.stringify(b) !== JSON.stringify(slut[i])).length;
if (forandrade !== 0) { console.error(`ABORT: ${forandrade} gamla rader förändrade`); process.exit(1); }

const kvitto = [];
kvitto.push(
  `UNIVERSUM-INLÄGG GRÖN: ${FÖRE}→${slut.length} (+1 Diageo DGE.L, Storbritannien/konsument 1→2; konsument-cellen → ${slut.filter((b) => b.bransch === "konsument").length}; Storbritannien → ${slut.filter((b) => b.land === "Storbritannien").length})`,
  `indent=${indent} · gamla rader förändrade=${forandrade} · läs-tillbaka ×2 OK`,
  `REPLIKER (FJORTON LÅS): mcap ${R.mcapReplik.toFixed(2)} (36,54) 0,21 % · PS ${R.psReplik.toFixed(3)} (2,47) · P/B ${R.pbReplik.toFixed(3)} (3,74) · netto-M ${(R.nettoM * 100).toFixed(2)} % · FCF-M ${(R.fcfM * 100).toFixed(2)} % · fcfY ${(R.fcfY * 100).toFixed(2)} % · divY ${(R.divY * 100).toFixed(2)} % EXAKT · D/E ${R.deReplik.toFixed(3)} EXAKT · EPS×aktier EXAKT · P/E-familjen 27,97/27,89/27,84 · EV/Earnings ${R.evEarningsReplik.toFixed(2)} (40,86) 0,08 % · EV/Sales ${R.evSalesReplik.toFixed(3)} (3,61) · FCF/aktie ${R.fcfPerShareReplik.toFixed(3)} (1,08)`,
  `EV-RESIDUAL DOKUMENTERAD: ${R.evResidual.toFixed(2)} mdr GBP utöver mcap+skuld−kassa (lease/pension/NCI) — dekompositionen ej REN, användningarna låsta`,
  `FCF DUBBELT LÅST: OCF−capex exakt [2 219 · 2 595 · 2 685 · 3 195] + källans marginalrader EXAKTA — FYRA ÅR RAKT (CAGR +${(R.fcfCagr3 * 100).toFixed(1)} %) medan netto faller varje år [4 445 · 3 870 · 2 354 · 1 737]`,
  `ENGÅNGSKONTROLLEN (inversa Kirin): EBIT-M 29,30 % − pretax-M 13,05 % = 16,25 p.p. (ränta 1 044 + nedskrivningar 1 666 M USD källbelagda) · TTM netto-M deprimerat 8,84 % · resultatCAGR ${ (R.resCagr3*100).toFixed(2) } % ärligt lagrad · oms-CAGR ${(R.omsCagr3 * 100).toFixed(2)} %`,
  `UTDELNINGSHALVERINGEN: DPS USD [0,986 · 1,035 · 1,035 · 0,500] — FY26 −51,68 %; current 0,37 GBP (2,25 %) · FCF-payout 34,29 % EXAKT`,
  `P/E-BÄRARKONTROLL: TTM-netto 1,31 mdr GBP > 0 — GRÖN · rappdag est. 2026-10-29 INOM v172-fönstret`,
);
writeFileSync("/tmp/r224-inlagg.txt", kvitto.join("\n"));
console.log(kvitto.join("\n"));
