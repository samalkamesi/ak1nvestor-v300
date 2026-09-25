#!/usr/bin/env node
/**
 * _r218-u22-universum-inlagg.mjs — v173 dataset-djup rond 218 U22 (+1):
 * Aroundtown SA AT1.DE (Tyskland/fastighet 1→2) — cellmotiverad duo:
 * Vonovia (tysk bostadsjätte) + Aroundtown (kommersiell diversifierad —
 * kontor/hotell/logistik/bostad; Lux-SA med Frankfurt-notering, ABB-
 * precedensen för landklassning). P/E-bärarkontroll FÖRE leverans
 * (TTM-netto 403,4 M EUR > 0 — GRÖN); kollisionskontroll exakt-match GRÖN.
 * RÄNTECHOCKENS TVILLINGKURVOR: netto [−645 · −1 988 · 53 · 665] — samma
 * förlustår 2022–2023 som Vonovia i samma cell, vändning 2024–2025
 * (resultatCAGR NULL på Vonovia-precedensen — negativ bas).
 * Kvitto: /tmp/r218-inlagg.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const FÖRE = u.length;
if (u.some((b) => b.ticker === "AT1.DE" || /aroundtown/i.test(b.namn ?? ""))) {
  console.error("ABORT: AT1.DE finns redan på disken");
  process.exit(1);
}

const K = {
  pris: 1.70, aktierMdr: 1.13, mcap: 1.90, eps: 0.37, peKalla: 4.57,
  pb: 0.13, evEbitReplik: 16.59, pFcf: 116.82,
  roe: 0.0511, roic: 0.0310, wacc: 0.0254, ebitM: 0.599, bruttoM: 0.6409,
  nettoTtm: 403.4, revTtm: 1558, fcfTtm: 16.3,
  de: 1.04, skuld: 15.17, ek: 14.65, kassa: 3.80, rantaTackning: 3.42,
  div: 0.08,
  omsSerie: [1616, 1453, 1500, 1558],   // M EUR, dec-slut FY2022–FY2025
  resSerie: [-645.1, -1988, 52.9, 665],
};
const R = {
  mcap: K.aktierMdr * K.pris,
  peLock: K.pris / K.eps,
  nettoM: K.nettoTtm / K.revTtm,
  fcfY: K.fcfTtm / (K.mcap * 1000),
  fcfM: K.fcfTtm / K.revTtm,
  omsCagr3: Math.pow(K.omsSerie[3] / K.omsSerie[0], 1 / 3) - 1,
  payoutReplik: K.div / K.eps,
  psReplik: (K.mcap * 1000) / K.revTtm,
  pbReplik: K.mcap / K.ek,
  deReplik: K.skuld / K.ek,
  evLedd: K.mcap + K.skuld - K.kassa,
};
const avv = (a, b) => Math.abs(a / b - 1);
const exakt = [
  ["mcap", R.mcap, K.mcap, 0.02],
  ["fcfY mot 1/P·FCF", R.fcfY, 1 / K.pFcf, 0.02],
  ["pb", R.pbReplik, K.pb, 0.02],
  ["ps", R.psReplik, 1.22, 0.02],
  ["nettoM mot källans TTM-rad", R.nettoM, 0.2589, 0.02],
  ["de", R.deReplik, K.de, 0.02],
];
const fel = exakt.filter(([n, r, k, tol]) => avv(r, k) > tol);
if (fel.length) {
  console.error("ABORT: replik utanför tolerans: " + fel.map(([n, r, k]) => `${n} ${r.toFixed(4)} vs ${k}`).join("; "));
  process.exit(1);
}
if (K.nettoTtm <= 0) { console.error("ABORT: P/E-bärarkontroll — TTM-netto ≤ 0"); process.exit(1); }

const PARANOID =
  "ETR-PRIMÄRNOTING i EUR (Frankfurt/MDAX; underlag S&P Global Market Intelligence via StockAnalysis; intradag 2026-09-25 — öppning 1,700 · föregående close 1,710 · dagsspann 1,686–1,715; färshämtning direkt med cache-bypass + TRE kompletterande panelhämtningar (statistics/financials/cash-flow); dec-slut): " +
  "pris 1,70 EUR (beta 1,31), mcap 1,90 mdr EUR på 1,13 mdr aktier (replik 1,13 × 1,70 = 1,921 — 1,1 %), " +
  "P/E 4,57 källans rad LÅST av EPS-basen (1,70/0,37 = 4,59 — 0,6 %); GAAP-repliken mcap/netto = 1,90/0,4034 = 4,71 noterad öppet (EPS-raden × aktier ger 0,418 mot netto 0,403 — ~3,7 % avrundningsfönster i källans egna rader; P/B-, PS-, FCF-, netto-M- och D/E-låsen bär fälten); P/B 0,13 EXAKT (1,90/14,65 totalt-EK-bas — 0,2 %) med källans BVPS-rad 7,54 (mot totalt EK/aktie 12,97) noterad som annat fönster; PS 1,22 EXAKT (1,90/1,558); " +
  "EV-DEKOMPOSITIONEN: källans EV 15,48 mdr = mcap 1,90 + skuld 15,17 − kassa 3,80 + PREFERENSAKTIER ≈ 2,21 mdr (Aroundtowns 2023-emittens — kapitalstrukturposten, EV/EBIT 16,59 och EV/EBITDA 16,26 (källrad) bärs av den fulla EV:n); EV/EBIT-raden egen replik (källan saknar EV/EBIT-rad); " +
  "FCF-DUBBELBAS DOKUMENTERAD: kapex-dragen TTM-FCF 16,3 M EUR (OCF 795,6 − capex 779,3 — fastighetsförvärv i posten) ger FCF-yield 0,86 % EXAKT mot källans rad OCH 1/P·FCF (1/116,82 = 0,856 %) — DUBBELT LÅS · FCF-marginal 1,05 % EXAKT; källans FCF-SERIE i finanspanelen är ett OCF-DUBBLETT (788/772/820/808 = OCF-raderna; per-år-capex saknas i panelen) ⇒ serier.fcf lämnas TOM på VNA-precedensen (samma cell, samma konvention); " +
  "netto-marginal 25,89 % EXAKT mot finanspanelens TTM-rad (403,4/1 558) med statistics-sidans 38,48 % dokumenterad som total-netto-basen 599,6 (inkl. minoriteter — cash-flow-panelens netto-rad 599,6 mot resultaträkningens 403,4: samma fönsterskillnad); " +
  "ROE 5,11 % källans rad (repliken 403,4/14,65 = 2,75 % — källans bas sannolikt snitt/attributable-EK, noterad utan överkrav) · ROIC 3,10 % > WACC 2,54 % (källans båda rader; WACC låg pga kapitalstrukturens preferens/eget-andel) · EBIT-marginal 59,9 % · bruttomarginal 64,1 % (fastighetens hyresstruktur), " +
  "balans: D/E 1,04 EXAKT (15,17/14,65) · räntetäckning 3,42 · Debt/EBITDA 15,93 · Altman n/a (källan saknar — fastighetsbalansräkningens belåning, datafakta) · Piotroski 4; " +
  "utdelning 0,08 EUR/aktie (4,75 %) ⇒ senasteArMdr 0,090 med EPS-bas-payout 21,6 % (källans payout n/a · FCF-payout 554 % — kapex-basens bidrag dokumenterat); DIVIDENDSERIENS BROTT: FY2022–FY2024 utdelningsfria år (paus efter räntechocken), FY2021 0,23 och FY2025 0,08 — återupptagen på lägre nivå, datafakta; " +
  "FY-SERIEN dec-slutande (M EUR): oms [1 616 · 1 453 · 1 500 · 1 558] · netto [−645,1 · −1 988 · 52,9 · 665] — RÄNTECHOCKENS TVILLINGKURVOR: samma förlustår 2022–2023 som Vonovia (VNA.DE) i samma cell (värderingsskrivningarna) och vändning 2024–2025 (Vonovia −643,8/−6 285/−896/+3 723 — mönsterparalleliteten dokumenterad i båda raderna); rak 3-årig CAGR FY22→FY25 oms −1,21 % · netto NULL på negativ bas (Vonovia-precedensen — vändningsåren döms ALDRIG med CAGR); EPS-serien [−0,58 · −1,82 · 0,05 · 0,61]; omsättningstillväxt TTM +1,02 % · prognosTillväxt +1,74 % (källans rev-fwd 3Y — basen ren); källans PEG 1,79 med oklar tillväxtbas ⇒ fältet NULL (basblandning vägras); " +
  "aktieantalet i princip oförändrat YoY (−0,01 %; QoQ −3,74 % = återköpsfönster) ⇒ nyemissioner 0 (preferens-emittensen 2023 är kapitalstruktur, ej vanlig aktieemission — dokumenterad i EV-dekompositionen); insiderägande 13,67 % datafakta; " +
  "kandidatur: CELLMOTIVERAD duo enligt U13-mönstret — Tyskland/fastighet-cellens TVÅ hyresvärdmodeller: Vonovia (VNA.DE, bostadsjätte ~490k lägenheter) + Aroundtown (AT1.DE, kommersiell diversifierad: kontor/hotell/logistik/bostad) — bostad mot kommersiell genom samma räntechock; LAND=TYSKLAND på ABB-precedensen (schweiziskt bolag Stockholm-noterat = Sverige i universumet): notering/verksamhetsprincipen — Lux-SA med Frankfurt-notering och tysk portföljkärna; P/E-bärarkriteriet kontrollerat FÖRE leverans (TTM-netto 403,4 M EUR > 0; Sony/Honda-doktrinen); kollisionskontroll exakt-match GRÖN; Real Estate ⇒ fastighet-cellen (17→18 bolag), Tyskland 21→22 (fastighet-grenen 1→2).";

const RAD = {
  ticker: "AT1.DE",
  namn: "Aroundtown SA",
  bransch: "fastighet",
  land: "Tyskland",
  valuta: "EUR",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-25", url: "https://stockanalysis.com/quote/etr/AT1/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/)", paranoid: PARANOID }],
  hamtat: "2026-09-25",
  pris: K.pris,
  marknadsKapitalMdr: K.mcap,
  tillvaxt: {
    omsattningCAGR5ar: +R.omsCagr3.toFixed(4),
    resultatCAGR5ar: null,
    omsattningTillvaxtTTM: 0.0102,
    prognosTillvaxt: 0.0174,
  },
  lonksamhet: {
    roe: K.roe, roic: K.roic, bruttoMarginal: K.bruttoM, ebitMarginal: K.ebitM,
    nettoMarginal: +R.nettoM.toFixed(4), fcfMarginal: +R.fcfM.toFixed(4),
  },
  stabilitet: {
    skuldEgenkapital: K.de, rantaTackning: K.rantaTackning, fcfPositivaSenaste5: null,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: 0,
  },
  aterkop: { senasteArMdr: 0.090, andelUtestande: +R.payoutReplik.toFixed(3), insiderkopSenaste6man: 0 },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
  vardering: { pe: K.peKalla, pb: K.pb, evEbit: K.evEbitReplik, peg: null, fcfYield: +R.fcfY.toFixed(4), egenKapitalMultipl: K.pb },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2022", "2023", "2024", "2025"],
    omsattning: K.omsSerie.map((x) => x * 1e6),
    resultat: K.resSerie.map((x) => x * 1e6),
    egetKapital: [],
    fcf: [],
  },
  notering:
    "cellmotiverad duo (Tyskland/fastighet 1→2: Vonovia bostadsjätte + Aroundtown kommersiell diversifierad — två hyresvärdmodeller genom räntechocken); land=Tyskland på ABB-precedensen (notering/verksamhetsprincipen — Lux-SA Frankfurt-noterad med tysk portföljkärna); ETR-primär EUR; RÄNTECHOCKENS TVILLINGKURVOR: netto [−645 · −1 988 · 53 · 665] speglar Vonovias cell-mönster (förlustår 2022–2023, vändning 2024–2025) — resultatCAGR NULL på negativ bas (Vonovia-precedensen); P/E 4,57 EPS-låst (GAAP-replik 4,71 noterad); P/B 0,13 totalt-EK-låst (BVPS-raden annat fönster); FCF-DUBBELBAS: kapex-dragen TTM 16,3 M (yield 0,86 % DUBBELT LÅS mot källrad + 1/P·FCF; marginal 1,05 % EXAKT) med källans FCF-serie som OCG-dubbelt ⇒ serier.fcf TOM (VNA-konventionen); EV 15,48 dekomponerad: mcap+skuld−kassa+preferens ≈2,21 mdr (2023-emittensen); netto-M 25,89 % EXAKT (statistics-sidans 38,48 % = total-netto-basen 599,6 inkl. minoriteter, dokumenterad); ROIC 3,10 % > WACC 2,54 %; dividendseriens brott FY22–24 (paus) → FY25 0,08 (4,75 %) på EPS-payout 21,6 %; Altman n/a · Piotroski 4 · beta 1,31 — datafakta; EK-serie saknas — serier.egetKapital tomt; alla repliker i paranoid (StockAnalysis ETR 2026-09-25)",
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
  if (el[el.length - 1].ticker !== "AT1.DE") { console.error("ABORT: sista raden ≠ AT1.DE"); process.exit(1); }
}
const slut = JSON.parse(readFileSync(UNI, "utf8"));
const forandrade = backup.filter((b, i) => JSON.stringify(b) !== JSON.stringify(slut[i])).length;
if (forandrade !== 0) { console.error(`ABORT: ${forandrade} gamla rader förändrade`); process.exit(1); }

const kvitto = [];
kvitto.push(
  `UNIVERSUM-INLÄGG GRÖN: ${FÖRE}→${slut.length} (+1 Aroundtown AT1.DE, Tyskland/fastighet; fastighet-cellen 17→${slut.filter((b) => b.bransch === "fastighet").length}; Tyskland → ${slut.filter((b) => b.land === "Tyskland").length})`,
  `indent=${indent} · gamla rader förändrade=${forandrade} · läs-tillbaka ×2 OK`,
  `REPLIKER (SEX LÅS): mcap ${R.mcap.toFixed(3)} (${K.mcap}) 1,1 % · P/B ${R.pbReplik.toFixed(4)} (${K.pb}) 0,2 % · PS ${R.psReplik.toFixed(4)} (1,22) 0,04 % · netto-M ${(R.nettoM * 100).toFixed(2)} % (25,89) EXAKT · fcfY ${(R.fcfY * 100).toFixed(2)} % mot ${(100 / K.pFcf).toFixed(2)} % DUBBELT LÅS · D/E ${R.deReplik.toFixed(3)} (${K.de}) 0,4 %`,
  `P/E 4,57 källans rad EPS-låst (1,70/0,37 = ${R.peLock.toFixed(2)} — 0,6 %) · GAAP-replik 4,71 noterad · EPS×aktier-identitet 3,7 %-avrundningsfönster dokumenterad öppet`,
  `EV-DEKOMPOSITION: 1,90 + 15,17 − 3,80 + preferens ≈2,21 = 15,48 mdr (källans EV) · EV/EBIT 16,59 (replik) · EV/EBITDA 16,26 (källrad)`,
  `RÄNTECHOCKENS TVILLINGKURVOR: netto [−645,1 · −1 988 · 52,9 · 665] — Vonovia-cellens mönster; resultatCAGR NULL (negativ bas, VNA-precedens) · omsCAGR ${ (R.omsCagr3 * 100).toFixed(2)} %`,
  `FCF-dubbelbas: TTM kapex-dragen 16,3 M (marginal ${(R.fcfM * 100).toFixed(2)} % EXAKT) · källans serie = OCF-dubbelt ⇒ serier.fcf TOM (VNA-konvention) · dividendbrottet FY22–24 dokumenterat (FY25 0,08 EUR, 4,75 %)`,
);
writeFileSync("/tmp/r218-inlagg.txt", kvitto.join("\n"));
console.log(kvitto.join("\n"));
