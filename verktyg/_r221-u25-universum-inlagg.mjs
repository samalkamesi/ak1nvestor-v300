#!/usr/bin/env node
/**
 * _r221-u25-universum-inlagg.mjs — v173 dataset-djup rond 221 U25 (+1):
 * DSV A/S DSV.CO (Danmark/industri 1→2) — cellmotiverad duo:
 * Maersk (tillgangstungt integrerat containerrederi — ager flottan) +
 * DSV (tillgangslos fraktformedling — hyr kapaciteten; post-Schenker
 * varldens storsta forwarder) = agare-mot-hyrare-kontrasten (freenet-
 * klassen). P/E-bärarkontroll FÖRE leverans (TTM-netto 6 869 M DKK > 0 —
 * GRÖN); kollisionskontroll exakt-match GRÖN (AZN-kollisionen tagen av
 * grunden Forst: AstraZeneca levererad 2026-09-03 som AZN.ST — UK/halsa-
 * duon avbruten, DSV vald i stallet). KURSBASDOKUMENTATION: källans mcap-
 * rad (282,23) och P/E-rad (39,25) bar aldre prisbaser an citatpanelens
 * 1 235 DKK — tio prisneutrala repliker bar leveransen (EV/PS/PB/
 * marginaler/yield/EPS-identitet). FCF-serien intern last (OCF−capex
 * exakt fem fonster, HEI-klassen).
 * Kvitto: /tmp/r221-inlagg.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const FÖRE = u.length;
if (u.some((b) => b.ticker === "DSV.CO" || /\bdsv\b/i.test(b.namn ?? ""))) {
  console.error("ABORT: DSV.CO finns redan på disken");
  process.exit(1);
}

const K = {
  pris: 1235, aktierMdr: 238.77, mcap: 282.23, eps: 28.89, peKalla: 39.25,
  pb: 2.24, evEbitReplik: 16.68, psKalla: 0.97, pFcf: 28.90,
  roe: 0.063, roic: 0.0717, wacc: 0.0782, ebitM: 0.0758, bruttoM: 0.2676,
  nettoTtm: 6.869, revTtm: 290.772, fcfTtm: 9.766,
  skuld: 95.527, ek: 125.98, kassa: 10.058, evKalla: 368.07, de: 0.76, rantaTackning: 5.58,
  div: 7.00,
  omsSerie: [235665, 150785, 167106, 247331],   // M DKK, dec-slut FY2022–FY2025
  resSerie: [17568, 12315, 10109, 8095],
  fcfSerie: [25332, 14428, 9559, 19416],
  ocfSerie: [26846, 16458, 11651, 21481], ocfTtm: 12.319,
  capexSerie: [1514, 2030, 2092, 2065], capexTtm: 2.553,
};
const R = {
  mcapReplik: (K.aktierMdr * K.pris) / 1000,
  pePrisEps: K.pris / K.eps,
  peGaap: K.mcap / K.nettoTtm,
  evReplik: K.mcap + K.skuld - K.kassa,
  nettoM: K.nettoTtm / K.revTtm,
  fcfM: K.fcfTtm / K.revTtm,
  fcfY: K.fcfTtm / K.mcap,
  omsCagr3: Math.pow(K.omsSerie[3] / K.omsSerie[0], 1 / 3) - 1,
  resCagr3: Math.pow(K.resSerie[3] / K.resSerie[0], 1 / 3) - 1,
  payoutReplik: K.div / K.eps,
  psReplik: K.mcap / K.revTtm,
  pbReplik: K.mcap / K.ek,
  deReplik: K.skuld / K.ek,
  epsIdentitet: (K.eps * K.aktierMdr) / 1000,
};
const avv = (a, b) => Math.abs(a / b - 1);
const exakt = [
  ["ps", R.psReplik, K.psKalla, 0.02],
  ["pb", R.pbReplik, K.pb, 0.02],
  ["ev-dekomposition", R.evReplik, K.evKalla, 0.02],
  ["nettoM mot källans rad", R.nettoM, 0.0236, 0.02],
  ["fcfM mot källans rad", R.fcfM, 0.0336, 0.02],
  ["fcfY mot källrad", R.fcfY, 0.0346, 0.02],
  ["fcfY mot 1/P·FCF", R.fcfY, 1 / K.pFcf, 0.02],
  ["de", R.deReplik, K.de, 0.02],
  ["EPS×aktier=netto", R.epsIdentitet, K.nettoTtm, 0.02],
  ["payout", R.payoutReplik, 0.2450, 0.02],
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
if (K.nettoTtm <= 0) { console.error("ABORT: P/E-bärarkontroll — TTM-netto ≤ 0"); process.exit(1); }

const PARANOID =
  "CPH-PRIMÄRNOTING i DKK (underlag S&P Global Market Intelligence via StockAnalysis; intradag 2026-09-25 — öppning 1 231 · föregående close 1 235 · dagsspann 1 182–1 247 · 52v 1 174,5–1 913,5; färshämtning direkt med cache-bypass + FYRA paneler (quote/statistics/financials/cash-flow); dec-slut): " +
  "KURSBASDOKUMENTATIONEN (leveransens viktigaste fynd): källans mcap-rad 282,23 mdr och P/E-rad 39,25 bär ÄLDRE prisbaser än citatpanelens kurs — mcap-raden motsvarar ≈1 182 DKK/aktie (dagens låg) och P/E-raden ≈1 134 (nedre 52v-zonen); pris/EPS-repliken 1 235/28,89 = 42,8 och GAAP-repliken 282,23/6,869 = 41,1 noterade öppet; FÄLTEN bär källans egna rader (mcap 282,23 · P/E 39,25 — E.ON/freenet-precedenserna) och leveransen bärs av TIO PRISNEUTRALA LÅS: PS 0,9707 (0,97 — 0,08 %) · P/B 2,2403 (2,24 — 0,02 %) · EV-DEKOMPOSITION 282,23+95,53−10,06 = 367,70 mot 368,07 (0,1 % — Schenker-lånet syns i skulden) · netto-M 2,362 % (2,36) · FCF-M 3,359 % (3,36) · FCF-yield 3,459 % DUBBELT (källrad 3,46 + 1/P·FCF 1/28,90 = 3,4602) · D/E 0,7582 (0,76) · EPS×AKTIER 28,89 × 238,77 M = 6 898 ≈ netto 6 869 (0,4 %) · payout 24,23 % (källrad 24,50) · FCF-serien intern låst; " +
  "FCF-SERIEN INTERN LÅST (HEI/Astellas-klassen): OCF − capex = FCF EXAKT samtliga fem fönster (FY22 26 846−1 514 = 25 332 ✓ · FY23 16 458−2 030 = 14 428 ✓ · FY24 11 651−2 092 = 9 559 ✓ · FY25 21 481−2 065 = 19 416 ✓ · TTM 12 319−2 553 = 9 766 ✓); " +
  "INTEGRATIONSPROFILEN (datafakta, aldrig råd): oms [235 665 · 150 785 · 167 106 · 247 331] med Schenker-konsolideringen FY2025 (+48,01 %) och TTM +52,02 % (FÖRVÄRVSDRIVEN — basblandningen dokumenterad i fältet); netto [17 568 · 12 315 · 10 109 · 8 095] FALLANDE VARJE ÅR (fraktrecensionen + integrationskostnader; rak CAGR −22,8 % på positiv bas); EPS [76,20 · 57,10 · 47,00 · 34,27]; marknadens normalisering: fwd P/E 17,39 mot trailing 39,25 ⇒ implied EPS +126 % (konsensus EPS Growth Forecast 3Y +24,85 % — scenariot, inte löftet); ROIC 7,17 % < WACC 7,82 % (integrationsårets finansiering — datafakta med kontext: skulden 95,5 mdr post-Schenker bär EV-låset); " +
  "marginaler: brutto 26,8 % (förmedlarens inköpsstruktur mot Maersk:s rederi-marginal) · EBIT 7,58 % · netto 2,36 % (kompressionen 6,05 → 2,36 från FY24 = integrationen); ROE-raden 6,30 % (replik 5,45 % noterad); " +
  "balans: D/E 0,76 · räntetäckning 5,58 · Debt/EBITDA 2,99 · Altman 3,0 (exakt gränsen) · Piotroski 8 · beta 0,96; " +
  "utdelning 7,00 DKK/aktie (0,59 %) med payout 24,2 % (källrad 24,50) och FCF-payout 17,1 % ⇒ senasteArMdr 1,671 (7,00 × 238,77 M); aktieantalet +3,86 % YoY (emission/aktieprogram — buyback-yield −3,86 %) ⇒ nyemissioner 1 dokumenterad; insiderägande 9,77 %; 52-veckorsförändring −10,76 %; " +
  "kandidatur: CELLMOTIVERAD duo enligt U13-mönstret — Danmark/industri-cellens TVÅ logikmodeller: Maersk (MAERSK-B.CO, tillgångstungt integrerat containerrederi — äger flottan, cykelbar) + DSV (DSV.CO, tillgångslös fraktförmedling — hyr kapaciteten, post-Schenker världens största forwarder) = ÄGARE-MOT-HYRARE-kontrasten (freenet/Telekom-klassen); AZN-KOLLISIONEN: Storbritannien/hälsa-duon (GSK+AZN) avbröts av kollisionsgrinden — AstraZeneca levererad 2026-09-03 som AZN.ST (land=Sverige, Stockholmsnoteringen); P/E-bärarkriteriet kontrollerat FÖRE leverans (TTM-netto 6 869 M DKK > 0; Sony/Honda-doktrinen); Industrials ⇒ industri-cellen (26→27 bolag), Danmark 10→11 (industri-grenen 1→2); NÄSTA RAPPORT 2026-10-21 INOM v172-FÖNSTRET (10-20→11-04) — könotis.";

const RAD = {
  ticker: "DSV.CO",
  namn: "DSV A/S",
  bransch: "industri",
  land: "Danmark",
  valuta: "DKK",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-25", url: "https://stockanalysis.com/quote/cph/DSV/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/)", paranoid: PARANOID }],
  hamtat: "2026-09-25",
  pris: K.pris,
  marknadsKapitalMdr: K.mcap,
  tillvaxt: {
    omsattningCAGR5ar: +R.omsCagr3.toFixed(4),
    resultatCAGR5ar: +R.resCagr3.toFixed(4),
    omsattningTillvaxtTTM: 0.5202,
    prognosTillvaxt: 0.0838,
  },
  lonksamhet: {
    roe: K.roe, roic: K.roic, bruttoMarginal: K.bruttoM, ebitMarginal: K.ebitM,
    nettoMarginal: +R.nettoM.toFixed(4), fcfMarginal: +R.fcfM.toFixed(4),
  },
  stabilitet: {
    skuldEgenkapital: K.de, rantaTackning: K.rantaTackning, fcfPositivaSenaste5: 5,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: 1,
  },
  aterkop: { senasteArMdr: 1.671, andelUtestande: +R.payoutReplik.toFixed(3), insiderkopSenaste6man: 0 },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
  vardering: { pe: K.peKalla, pb: K.pb, evEbit: K.evEbitReplik, peg: null, fcfYield: +R.fcfY.toFixed(4), egenKapitalMultipl: K.pb },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2022", "2023", "2024", "2025"],
    omsattning: K.omsSerie.map((x) => x * 1e6),
    resultat: K.resSerie.map((x) => x * 1e6),
    egetKapital: [],
    fcf: K.fcfSerie.map((x) => x * 1e6),
  },
  notering:
    "cellmotiverad duo (Danmark/industri 1→2: Maersk tillgångstungt integrerat containerrederi + DSV tillgångslös fraktförmedling — ÄGARE-MOT-HYRARE, freenet/Telekom-klassen; post-Schenker världens största forwarder); AZN-kollisionen dokumenterad (UK/hälsa-duon avbröts — AstraZeneca levererad 2026-09-03 som AZN.ST/Sverige); CPH-primär DKK; KURSBASDOKUMENTATION: källans mcap/P/E-rader bär äldre prisbaser — fältet = källrader (E.ON/freenet-precedens), TIO PRISNEUTRALA LÅS bär leveransen (PS 0,97 · P/B 2,24 · EV 0,1 % REN med Schenker-lånet 95,5 mdr · netto-M 2,36 · FCF-M 3,36 · FCF-yield 3,46 % dubbelt · D/E 0,76 · EPS×aktier 0,4 % · payout · FCF-serien); FCF-serien intern låst (OCF−capex exakt fem fönster); INTEGRATIONSPROFILEN: netto fallande varje år [17 568 · 12 315 · 10 109 · 8 095] (fraktrecension+Schenker-kostnader; rak CAGR −22,8 %) mot oms +48 % FY25 (FÖRVÄRVSDRIVEN basblandning dokumenterad); fwd P/E 17,39 ⇒ implied EPS +126 % = normaliseringsscenariot (konsensus +24,85 %/3 år — aldrig löfte); ROIC 7,17 % < WACC 7,82 % = integrationsåret (datafakta); Altman 3,0 · Piotroski 8 · beta 0,96; utdelning 7,00 DKK (0,59 %) payout 24,2 %; nyemission 1 (aktieantal +3,86 %); rappdag 2026-10-21 I v172-fönstret; EK-serie saknas; alla repliker i paranoid (StockAnalysis CPH 2026-09-25)",
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
  if (el[el.length - 1].ticker !== "DSV.CO") { console.error("ABORT: sista raden ≠ DSV.CO"); process.exit(1); }
}
const slut = JSON.parse(readFileSync(UNI, "utf8"));
const forandrade = backup.filter((b, i) => JSON.stringify(b) !== JSON.stringify(slut[i])).length;
if (forandrade !== 0) { console.error(`ABORT: ${forandrade} gamla rader förändrade`); process.exit(1); }

const kvitto = [];
kvitto.push(
  `UNIVERSUM-INLÄGG GRÖN: ${FÖRE}→${slut.length} (+1 DSV A/S DSV.CO, Danmark/industri 1→2; industri-cellen 26→${slut.filter((b) => b.bransch === "industri").length}; Danmark → ${slut.filter((b) => b.land === "Danmark").length})`,
  `indent=${indent} · gamla rader förändrade=${forandrade} · läs-tillbaka ×2 OK`,
  `TIO PRISNEUTRALA LÅS: PS ${R.psReplik.toFixed(4)} (0,97) · P/B ${R.pbReplik.toFixed(4)} (2,24) · EV ${R.evReplik.toFixed(2)} (${K.evKalla}) 0,1 % REN · netto-M ${(R.nettoM * 100).toFixed(2)} % · FCF-M ${(R.fcfM * 100).toFixed(2)} % · fcfY ${(R.fcfY * 100).toFixed(2)} % DUBBELT (3,46 + 1/28,90) · D/E ${R.deReplik.toFixed(3)} · EPS×aktier ${R.epsIdentitet.toFixed(0)} ≈ ${K.nettoTtm * 1000} M 0,4 % · payout ${(R.payoutReplik * 100).toFixed(1)} %`,
  `KURSBAS-FYND: källans mcap-rad ≈1 182-aktie och P/E-rad ≈1 134-aktie mot citat 1 235 — fältet = källrader, repliker 42,8/41,1 noterade`,
  `FCF-SERIE-IDENTITET: OCF−capex = FCF exakt i SAMTLIGA fem fönster (${fcfIdent.map(([a]) => a).join(" · ")})`,
  `INTEGRATIONSPROFILEN: netto fallande varje år (rak CAGR ${(R.resCagr3 * 100).toFixed(1)} %) på förvärvsdriven omsättning +48 % FY25 — basblandningen dokumenterad; fwd implied EPS +126 % = normaliseringsscenario`,
);
writeFileSync("/tmp/r221-inlagg.txt", kvitto.join("\n"));
console.log(kvitto.join("\n"));
