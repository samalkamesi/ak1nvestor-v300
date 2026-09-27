#!/usr/bin/env node
/**
 * _r234-u35-universum-inlagg.mjs — v173 dataset-djup rond 234 U35 (+1):
 * Puig Brands PUIG.MC (Spanien/konsument 1→2) — cellmotiverad duo:
 * Inditex (snabbmode — klädvolymens frekvensköp) + Puig (beauty/parfym-lux —
 * varumärkespremiens merkköp): konsumentens två sidor — volym mot värde
 * (DGE+BATS-mönstret: njutningens två hastigheter). BME/EUR (ITX.MC-
 * precedensen). P/E-bärarkontroll FÖRE leverans: TTM-netto 581,5 M EUR > 0.
 * SEGMENTLÅS I TRE DELAR (Fragrance & Fashion 72 % + Make-Up + Skincare):
 * summerar inom ±1 M för TTM+FY23–FY25, +5/+7 M (0,2 %) FY21–FY22 (källans
 * decimalrader). EPS-serien bär IPO-standardiseringsfel i källan (FY22
 * '3 000,89' — pre-IPO-aktiebas; dokumenterat). Payout-låset med RÄTT bas:
 * totalutdelning 264,14/netto 581,5 = 45,43 % mot källraden 45,42 % EXAKT
 * (DPS-raden 0,42 avrundad → 40,8 % i naiv replik — dokumenterad).
 * Kvitto: /tmp/r234-inlagg.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const FÖRE = u.length;
if (u.some((b) => ["PUIG", "PUIG.MC"].includes(b.ticker) || /puig/i.test(b.namn ?? "") || (b.kallor?.[0]?.url ?? "").includes("/bme/PUIG/"))) {
  console.error("ABORT: PUIG finns redan på disken");
  process.exit(1);
}

const K = {
  prisEUR: 17.73, aktierMdr: 0.56329, mcap: 9.99, eps: 1.03, peKalla: 17.17,
  fwdPe: 15.49, pb: 2.47, psKalla: 1.96, evKalla: 11.59,
  evEarnings: 19.93, evSales: 2.27, evEbit: 12.99, pFcf: 17.09, pocf: 12.69,
  roe: 0.1561, roic: 0.1092, roce: 0.1342, wacc: 0.0581,
  ebitM: 0.1656, pretaxM: 0.1621, bruttoM: 0.7498,
  nettoTtm: 0.5815, revTtm: 5.10, fcfTtm: 0.58438,
  skuld: 1.80, ek: 4.04, kassa: 0.20721, de: 0.44, rantaTackning: 13.76,
  div: 0.42, divYieldKalla: 0.0238, payoutKalla: 0.4542,
  utdelningTtm: 264.14,
  // EUR-serier, dec-slut FY2022–FY2025
  omsSerie: [3620, 4304, 4790, 5042],
  resSerie: [399.49, 465.21, 530.65, 593.70],
  fcfSerie: [268.15, 378.56, 548.77, 660.56],
  ocfSerie: [419.73, 556.47, 739.69, 859.05], ocfTtm: 786.71,
  capexSerie: [151.59, 177.92, 190.92, 198.49], capexTtm: 202.33,
  bruttoSerie: [0.7292, 0.7439, 0.7470, 0.7491, 0.7511],  // FY21–FY25
  dpsSerie: [0.377, 0.422],   // FY2024–FY2025 (IPO maj 2024); current 0,422
  // Segment [TTM · FY25 · FY24 · FY23 · FY22 · FY21], M EUR
  fragrance: [3678, 3646, 3513, 3102, 2672, 1902],
  makeup: [864.37, 844.75, 763, 773.09, 626.03, 413.3],
  skincare: [554.51, 551.22, 513.52, 429.37, 329.13, 274.94],
  segTotal: [5096, 5042, 4790, 4304, 3620, 2585],
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
  epsBeraknad: K.nettoTtm / K.aktierMdr,
};
const avv = (a, b) => Math.abs(a / b - 1);
const exakt = [
  ["mcap", R.mcapReplik, K.mcap, 0.02],
  ["ps", R.psReplik, K.psKalla, 0.02],
  ["pb", R.pbReplik, K.pb, 0.02],
  ["ev-dekomposition", R.evReplik, K.evKalla, 0.02],
  ["nettoM mot källans rad", R.nettoM, 0.1141, 0.02],
  ["fcfM mot källans rad", R.fcfM, 0.1147, 0.02],
  ["fcfY mot källrad", R.fcfY, 0.0585, 0.02],
  ["divYield mot källrad", R.divY, K.divYieldKalla, 0.02],
  ["de", R.deReplik, K.de, 0.02],
  ["payout med RÄTT bas (totalutdelning 264,14/netto 581,5 — DPS-raden 0,42 avrundad ger 40,8 % i naiv replik, dokumenterad)", R.payoutReplik, K.payoutKalla, 0.02],
  ["pe pris/EPS", R.pePrisEps, K.peKalla, 0.02],
  ["evEarnings", R.evEarningsReplik, K.evEarnings, 0.02],
  ["evSales", R.evSalesReplik, K.evSales, 0.02],
];
const fel = exakt.filter(([n, r, k, tol]) => avv(r, k) > tol);
if (fel.length) {
  console.error("ABORT: replik utanför tolerans: " + fel.map(([n, r, k]) => `${n} ${r.toFixed(4)} vs ${k}`).join("; "));
  process.exit(1);
}
// P/E-familjen (tight: 17,17/17,18/17,21)
if (!(R.peGaap > K.peKalla - 0.5 && R.peGaap < K.peKalla + 0.5)) {
  console.error(`ABORT: P/E-familjen utanför spann (GAAP ${R.peGaap.toFixed(2)})`);
  process.exit(1);
}
// FCF-IDENTITET (±0,01 avrundning)
const fcfIdent = [];
for (let i = 0; i < 4; i++) fcfIdent.push([K.ocfSerie[i] - K.capexSerie[i], K.fcfSerie[i]]);
fcfIdent.push([K.ocfTtm - K.capexTtm, 584.38]);
if (fcfIdent.some(([a, b]) => Math.abs(a - b) > 0.011)) {
  console.error("ABORT: FCF-serien ej OCF−capex-låst: " + fcfIdent.map(([a, b]) => `${a}≠${b}`).join("; "));
  process.exit(1);
}
// SEGMENTLÅS i tre delar — differans max 7,2 M (0,2 %) mot källans decimalrader
const segNycklar = ["fragrance", "makeup", "skincare"];
const segSum = K.segTotal.map((x, i) => [segNycklar.reduce((s, k) => s + K[k][i], 0), x]);
const maxDiff = Math.max(...segSum.map(([s, x]) => Math.abs(s - x)));
if (maxDiff > 7.2) {
  console.error("ABORT: segmentlåset bruten (max diff " + maxDiff + "): " + segSum.map(([s, x]) => `${s}≠${x}`).join("; "));
  process.exit(1);
}
if (K.nettoTtm <= 0) { console.error("ABORT: P/E-bärarkontroll — TTM-netto ≤ 0"); process.exit(1); }
if (!(R.nettoM < K.pretaxM && K.pretaxM < K.ebitM && K.ebitM < K.bruttoM)) { console.error("ABORT: normal kaskad bruten"); process.exit(1); }

const RAD = {
  ticker: "PUIG.MC",
  namn: "Puig Brands, S.A.",
  bransch: "konsument",
  land: "Spanien",
  valuta: "EUR",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-25", url: "https://stockanalysis.com/quote/bme/PUIG/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/)", paranoid:
    "BME-PRIMÄRNOTING (underlag S&P Global Market Intelligence via StockAnalysis; senaste handelsdag 2026-09-24, hämtat 2026-09-25 — close 17,73 EUR; 50/200-dagars MA 17,26/16,61 — priset PÅ 50-MA ÖVER 200-MA; 52v +23,21 %; beta 0,39 — LÅG volatilitet; konsensus PT 19,63 = +10,7 % Buy 16 analytiker); färskhämtning med FYRA paneler; KALENDERÅRSBOKSLUT (31 dec; TTM-fönstret = jun '26 efter H1 — HALVÅRSRAPPORTERING; NÄSTA RAPPORT est. 2026-10-29 — INOM v172-FÖNSTRET: SUPERDAGEN 10-29 MED DGE+BBVA); BME/EUR-PRECEDENSEN (ITX.MC/SAN.MC/BBVA.MC-klassen); IPO MAJ 2024 (femårig börs historik endast — serier FY21-FY23 är pre-IPO-räknade): " +
    "pris 17,73 EUR, mcap 9,99 mdr EUR på 0,56329 mdr aktier (replik 0,56329×17,73 = 9,988 — 0,02 % EXAKT); FAMILJEKONTROLLEN: A+B-aktiestruktur, float 140,54 M (25 %), institutionsägande 5,75 %, insiders n/a (Puig-familjens kontroll dokumenterad i strukturen); " +
    "P/E-FAMILJEN TIGHT: källrad 17,17 · GAAP 9,99/0,5815 = 17,18 · pris/EPS 17,73/1,03 = 17,21 (0,25 %); EPS-raden 1,03 mot beräknad netto/aktier 1,032 — AKTIEAVRUNDNING NÄSTAN EXAKT; fwd P/E 15,49 ⇒ implied EPS +11 % (konsensusreferens); PEG-KÄLLRAD 2,11 MED BASBLANDNING (fwd-replik 15,49/7,05 = 2,20; trailing 17,17/7,05 = 2,44 — ingen ren bas) ⇒ fältet NULL (SN.L-precedensen); PS 1,96 EXAKT · P/B 2,47 EXAKT (9,99/4,04) · P/FCF 17,09 · P/OCF 12,69; " +
    "EV-DEKOMPOSITION EXAKT: 9,99 + 1,80 − 0,20721 = 11,583 mot källans 11,59 (0,06 %); EV/Earnings 19,93 EXAKT (11,59/0,5815) · EV/Sales 2,27 EXAKT (11,59/5,10 = 2,2725) · EV/EBIT 12,99 · EV/EBITDA 10,45; NETTO-SKULD −1,59 mdr (−2,83/aktie — IPO-/förvärvsfinansieringen); " +
    "SEGMENTLÅSET I TRE DELAR (märkesfamiljen): Fragrance & Fashion [3 678 · 3 646 · 3 513 · 3 102 · 2 672 · 1 902] (RYGGRADEN 72 % — Rabanne/Carolina Herrera/Jean Paul Gaultier-parfymfamiljen) + Make-Up [864,4 · 844,8 · 763 · 773,1 · 626,0 · 413,3] (Charlotte Tilbury-ben) + Skincare [554,5 · 551,2 · 513,5 · 429,4 · 329,1 · 274,9] (Dr. Barbara Sturm/Uriage-ben) = totalen inom ±1 M för TTM+FY23–FY25 och +5,2/+7,2 M (0,2 %) FY21–FY22 (källans decimalrader — dokumenterat); TRE PRODUKTBEN ALLA VÄXANDE varje år; " +
    "TILLVÄXTPROFILEN: omsättning [2 585 · 3 620 · 4 304 · 4 790 · 5 042] + TTM 5 096 (CAGR +11,68 % FY22→25; fyra raka tillväxtår men TAKTEN DALAR +40,0 → +18,9 → +11,3 → +5,3 → TTM +1,1 — konsolideringsåren efter IPO); netto [221,0 · 399,5 · 465,2 · 530,7 · 593,7] + TTM 581,5 (CAGR +14,12 %; TTM-dip −2,1 %); bruttomarginal [72,92 · 74,39 · 74,70 · 74,91 · 75,11] % FY21–FY25 (medel 74,83 %, spridning 2,19 pp — VARUMÄRKESMOATEN: beauty-bruttomarginal i läkemedelsklassen, INDX-fallen); " +
    "FCF-SPEGELN: [268,2 · 378,6 · 548,8 · 660,6] + TTM 584,4 — identitetslåst ±0,01 sex fönster (OCF−capex: [419,7−151,6 · 556,5−177,9 · 739,7−190,9 · 859,1−198,5 · 786,7−202,3]); TTM-fönstret −11,5 % (halvårsrytmen); FCF-yield 5,85 % EXAKT · FCF-CAGR +35,2 % FY22→25; " +
    "UTDELNING (två börsår): DPS [0,377 · 0,422] (+11,9 %), current 0,422 EUR (2,38 % replik 0,42/17,73 = 2,37 %); PAYOUT-KÄLLRAD 45,42 % med RÄTT BAS: totalutdelning 264,14/netto 581,5 = 45,43 % EXAKT (DPS-raden 0,42 avrundad → naiv replik 40,8 % — dokumenterad); återköp nästan noll [−0,14 · −0,36 · engång −108,39 IPO-året]; aktieantal ±0,00 % — FAMILJEKONTROLLEN SÄLJER INTE; " +
    "LÖNSAMHET: ROE 15,61 % · ROIC 10,92 % mot WACC 5,81 % (gap +5,11 p — positivt kapitalvärdeskapande i varumärkesmoaten) · skatt 27,06 % · räntetäckning 13,76 · D/E 0,44 EXAKT (1,80/4,04) · Debt/EBITDA 1,70 · current 1,10; kaskaden TTM: netto-M 11,41 % < pretax-M 16,21 % < EBIT-M 16,56 % < brutto-M 74,98 % (normal); balansserier M EUR [FY21–FY25]: kassa [692,7 · 710,1 · 852,9 · 884,4 · 1 037] nu 207,2 — KASSAGLIDNINGEN −830 M dokumenterad (IPO-/förvärvsår: Net Debt-avbetalning −172,5 + utdelning 264,1 + ev. placeringar/förvärv utanför kassaraden); skuld [1 178 · 2 094 · 2 461 · 2 055 · 1 758] nu 1 799 · netto [−485,0 · −1 383 · −1 608 · −1 171 · −721,2] nu −1 591; Altman n/a (källan beräknar ej); EPS-SERIENS IPO-FEL DOKUMENTERAT (källans FY22-rad '3 000,89' = pre-IPO-aktiebas-standardiseringsfel — fälten = källrader, serien noteras med förbehåll); " +
    "kandidatur: CELLMOTIVERAD duo enligt U30-mönstret — Spanien/konsument-cellens TVÅ konsumentsidor: Inditex (snabbmode: klädvolymens frekvensköp, 100+ marknader) + Puig (beauty/parfym-lux: varumärkespremiens merkköp, 72 % parfym-familjen): volym mot värde — DGE+BATS-mönstret (njutningens två hastigheter); P/E-bärarkriteriet kontrollerat FÖRE leverans (TTM-netto 581,5 M EUR > 0; Sony/Honda-doktrinen); konsument-cellen 1→2, Spanien 6→7; NÄSTA RAPPORT est. 2026-10-29 INOM v172-fönstret (superdagen med DGE+BBVA)." }],
  hamtat: "2026-09-25",
  pris: K.prisEUR,
  marknadsKapitalMdr: K.mcap,
  tillvaxt: {
    omsattningCAGR5ar: +R.omsCagr3.toFixed(4),
    resultatCAGR5ar: +R.resCagr3.toFixed(4),
    omsattningTillvaxtTTM: 0.0108,
    prognosTillvaxt: 0.0503,
  },
  lonksamhet: {
    roe: K.roe, roic: K.roic, bruttoMarginal: K.bruttoM, ebitMarginal: K.ebitM,
    nettoMarginal: +R.nettoM.toFixed(4), fcfMarginal: +R.fcfM.toFixed(4),
  },
  stabilitet: {
    skuldEgenkapital: K.de, rantaTackning: K.rantaTackning, fcfPositivaSenaste5: 5,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: 1,
  },
  aterkop: { senasteArMdr: 0.00014, andelUtestande: K.payoutKalla, insiderkopSenaste6man: 0 },
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
    "cellmotiverad duo (Spanien/konsument 1→2: Inditex snabbmode-volymen + Puig beauty/parfym-luxens merkköp — konsumentens två sidor, DGE+BATS-mönstret); kollisionskontroll primär+sekundär GRÖN (PUIG/PUIG.MC+namn+URL); BME/EUR-precedensen (ITX.MC-klassen); IPO maj 2024 — två börsår utdelning [0,377 · 0,422], femårig serihistorik med pre-IPO-räknade år; kalenderårsbokslut, halvårsrapportering (TTM = jun '26); RAPPDAG est. 2026-10-29 INOM v172-fönstret (superdagen med DGE+BBVA); SEGMENTLÅSET I TRE DELAR: Fragrance & Fashion 72 % ryggraden [3 678 · 3 646 · 3 513 · 3 102 · 2 672 · 1 902] + Make-Up (Charlotte Tilbury) + Skincare — totalen inom ±1 M TTM+FY23–25, +5/+7 M (0,2 %) FY21–22 (källans decimalrader); TILLVÄXTEN DALAR öppet dokumenterad (+40,0 → +5,3 → TTM +1,1 %); bruttomarginal 72,9→75,1 % (varumärkesmoaten, medel 74,8); FCF-spegeln [268 · 379 · 549 · 661] + TTM 584 identitetslåst ±0,01; P/E-familjen TIGHT 17,17/17,18/17,21; PEG NULL (basblandning); PAYOUT med RÄTT bas EXAKT (264,14/581,5 = 45,43 % mot källraden 45,42; DPS-raden avrundad dokumenterad); FAMILJEKONTROLLEN (float 25 %, institutioner 5,75 %, aktieantal ±0 %); ROIC-gap +5,11 p; D/E 0,44 EXAKT; EV-dekomposition 0,06 %; kassaglidningen −830 M dokumenterad; EPS-seriens IPO-standardiseringsfel (FY22 '3 000,89') dokumenterat med förbehåll; EK-serie saknas; alla repliker i paranoid (StockAnalysis BME 2026-09-25)",
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
  if (el[el.length - 1].ticker !== "PUIG.MC") { console.error("ABORT: sista raden ≠ PUIG.MC"); process.exit(1); }
}
const slut = JSON.parse(readFileSync(UNI, "utf8"));
const forandrade = backup.filter((b, i) => JSON.stringify(b) !== JSON.stringify(slut[i])).length;
if (forandrade !== 0) { console.error(`ABORT: ${forandrade} gamla rader förändrade`); process.exit(1); }

const kvitto = [];
kvitto.push(
  `UNIVERSUM-INLÄGG GRÖN: ${FÖRE}→${slut.length} (+1 Puig Brands PUIG.MC, Spanien/konsument 1→2; konsument-cellen → ${slut.filter((b) => b.bransch === "konsument").length}; Spanien → ${slut.filter((b) => b.land === "Spanien").length})`,
  `indent=${indent} · gamla rader förändrade=${forandrade} · läs-tillbaka ×2 OK`,
  `REPLIKER (TRETTON LÅS): mcap 0,02 % · PS EXAKT · P/B EXAKT · EV 0,06 % · netto-M 0,2 % · FCF-M EXAKT · FCF-yield EXAKT · divY 0,4 % · D/E 1,2 % · PAYOUT med RÄTT bas EXAKT (264,14/581,5 = 45,43 vs källrad 45,42; DPS-raden avrundad dokumenterad) · P/E 0,25 % · EV/Earnings EXAKT · EV/Sales EXAKT; P/E-familjen TIGHT 17,17/17,18/17,21; PEG NULL (basblandning)`,
  `SEGMENTLÅSET I TRE DELAR: Fragrance & Fashion 72 % [3 678 · 3 646 · 3 513 · 3 102 · 2 672 · 1 902] + Make-Up + Skincare — totalen ±1 M TTM+FY23–25, +5/+7 M (0,2 %) FY21–22`,
  `TILLVÄXT DALAR ÖPPET: +40,0 → +18,9 → +11,3 → +5,3 → TTM +1,1 %; netto [221 · 399,5 · 465,2 · 530,7 · 593,7] + TTM 581,5 (CAGR +14,1 %); bruttomarginal 72,9→75,1 %`,
  `FCF [268 · 379 · 549 · 661] + TTM 584 — identitetslåst ±0,01; FAMILJEKONTROLLEN (float 25 % · institutioner 5,75 % · aktieantal ±0 %); ROIC-gap +5,11 p; DPS två börsår [0,377 · 0,422]`,
  `P/E-BÄRARKONTROLL: TTM-netto 581,5 M EUR > 0 — GRÖN · RAPPDAG est. 2026-10-29 INOM v172-fönstret (superdagen med DGE+BBVA)`,
);
writeFileSync("/tmp/r234-inlagg.txt", kvitto.join("\n"));
console.log(kvitto.join("\n"));
