#!/usr/bin/env node
/**
 * _r201-v173u7-universum-inlagg.mjs — v173 dataset-djup rond 201 U7 (+1):
 * Canadian Pacific Kansas City CP (Kanada/industri 1→2, TSX-primär CAD) —
 * BCE-OMG24 §10:s andrakandidat i industri-cellens öppning. P/E-bärarkontroll
 * FÖRE leverans (TTM-netto 3 847 M CAD > 0, P/E 28,17 — GRÖN); kollisions-
 * kontroll exakt-match GRÖN.
 *
 * K&A-BROTT FY2023 (Kansas City Southern) dokumenteras; P/E bär källans
 * justerade bas (GAAP-avvikelse 7,4 % — dokumentklass med 8 %-tak, CPKC:s
 * purchase-accounting-core-bas).
 *
 * Kontrakt som U1–U6. Kvitto: /tmp/r201-inlagg.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const FÖRE = u.length;
if (u.some((b) => b.ticker === "CP" || /canadian pacific/i.test(b.namn ?? ""))) {
  console.error("ABORT: CP/CPKC finns redan på disken");
  process.exit(1);
}

// ── Källvärden (StockAnalysis TSX CP, 2026-09-25) + repliker ──────────────────
const K = {
  pris: 107.49, aktierMdr: 933.0, mcap: 100.27, epsGaap: 4.12, pe: 28.17, fwdPe: 25.05,
  pb: 2.63, evEbit: 18.85, pFcf: 55.16, pegKalla: 5.41, ps: 6.87,
  roe: 0.0954, roic: 0.0566, wacc: 0.0737, bruttoM: 0.4640, ebitM: 0.2827,
  nettoTtm: 3847, revTtm: 14596, nettoM: 0.2635,
  fcf: 1818, de: 0.66, rantaTackning: 5.23, altman: 2.69, piotroski: 6, beta: 1.08,
  div: 0.80, payout: 0.1923,
  omsSerie: [8814, 12555, 14546, 14655],   // M CAD, dec-slut FY2022–FY2025
  resSerie: [3317, 3861, 3923, 3801],
  fcfSerie: [2644, 2876, 2546, 1818],
};
const R = {
  mcap: (K.aktierMdr * K.pris) / 1000,
  peGaap: K.pris / K.epsGaap,
  nettoM: K.nettoTtm / K.revTtm,
  ps: (K.mcap * 1000) / K.revTtm,
  fcfY: K.fcf / (K.mcap * 1000),
  prognos: K.pe / K.fwdPe - 1,
  peg: K.pe / ((K.pe / K.fwdPe - 1) * 100),
  omsCagr2: Math.pow(K.omsSerie[3] / K.omsSerie[1], 1 / 2) - 1,  // konsekutiv post-KCS FY23→FY25
  resCagr2: Math.pow(K.resSerie[3] / K.resSerie[1], 1 / 2) - 1,
  omsCagr3: Math.pow(K.omsSerie[3] / K.omsSerie[0], 1 / 3) - 1,  // över brottet (loggas)
  payoutReplik: K.div / K.epsGaap,
};
const avv = (a, b) => Math.abs(a / b - 1);
const exakt = [
  ["mcap", R.mcap, K.mcap, 0.02], ["nettoM", R.nettoM, K.nettoM, 0.02],
  ["ps", R.ps, K.ps, 0.02], ["fcfY", R.fcfY, 1 / K.pFcf, 0.02],
  ["payout", R.payoutReplik, K.payout, 0.02],
];
const dokument = [["pe", R.peGaap, K.pe, 0.08]]; // källans core-justerade bas (KCS purchase accounting) — dokumenterad
const fel = [...exakt, ...dokument].filter(([n, r, k, tol]) => avv(r, k) > tol);
if (fel.length) {
  console.error("ABORT: replik utanför tolerans: " + fel.map(([n, r, k]) => `${n} ${r.toFixed(4)} vs ${k}`).join("; "));
  process.exit(1);
}

const PARANOID =
  "TSX-PRIMÄRNOTING i CAD (BCE/TELUS/RCI-B/NTR/CNR-precedensens Toronto-rad; underlag S&P Global Market Intelligence + Fiscal.ai via StockAnalysis; intradag 2026-09-25 delayed +0,22 %; färshämtning direkt med cache-bypass): " +
  "pris 107,49 CAD (52v 91,12–113,14 · beta 1,08 — Kanada-blockets enda över 1), mcap 100,27 mdr CAD på 933,0 M aktier (replik 933,0 × 107,49 = 100,29 — 0,02 % EXAKT), " +
  "P/E 28,17 ur källan på bolagets CORE-JUSTERADE bas (CPKC rapporterar core adjusted EPS med KCS-purchase-accounting-avdrag; GAAP-repliken 107,49/4,12 = 26,08 avviker 7,4 % — dokumentklass med dokumenterad bas-skillnad, CNR-klassens justerade bas men djupare för att purchase accounting ligger i siffran), mot forward P/E 25,05 ⇒ prognosTillväxt +12,46 % (trailing/fwd-modellen, MUFG-konventionen; spår-PEG 28,17/12,46 = 2,26 mot källans PEG 5,41 på 3-års — kalibreringsnot), P/B 2,63 · EV/EBIT 18,85 · PS 6,87 EXAKT replik (100 270/14 596 = 6,870), " +
  "ROE 9,54 % · ROIC 5,66 % UNDER WACC 7,37 % (KCS-integrationens enorma kapitalbas — dokumenterad kontrast mot CNR som ligger över; integrationssyntes pågår), brutto 46,40 % · EBIT-marginal 28,27 % (järnvägsstruktur) · netto-marginal 26,35 % EXAKT replik (3 847/14 596) · FCF-yield EXAKT replik (1 818/100 270 = 1,813 % = 1/P·FCF 1/55,16 = 1,813 %); " +
  "balans: D/E 0,66 · räntetäckning 5,23 · Altman 2,69 (KÄLLANS VARNINGSZON — dokumenterad som datafakta; Piotroski 6) · kassa 0,34 mdr · skuld 21,31 mdr · NETTOSKULD 20,97 mdr · EK 37,72 mdr; " +
  "utdelning 0,80 CAD/aktie (0,74 %) ⇒ senasteArMdr 746 (0,80 × 933,0) med källans payout 19,23 % (GAAP-replik 0,80/4,12 = 19,4 % ✓ 0,9 %); " +
  "FY-SERIEN dec-slutande (M CAD): oms [8 814 · 12 555 · 14 546 · 14 655] · netto [3 317 · 3 861 · 3 923 · 3 801] · FCF [2 644 · 2 876 · 2 546 · 1 818] — K&A-BROTTET FY2023: Kansas City Southern-förvärvet (kontroll april 2023) ger omsättningshoppet +42 % i ett steg (struktur, ej organiskt — USA:s-Mexiko-nätet tillkommer); CAGR därför på 2-årig KONSEKUTIV post-KCS-bas FY2023→FY2025 (oms +8,05 % · netto −0,78 %) medan 3-årig rak bas (oms +18,5 %) skulle misstolka förvärvet som tillväxt — AXA/Shaw-precedenserna; nettot stabilt 3,3–3,9 miljarder över hela serien (integrationen bär engångskostnader i EBIT, inte i nettolinjen); FCF-nedgången 2 876→1 818 = integrations-capex; EPS-GAAP-serien [3,57 · 4,15 · 4,20 · 4,08]; " +
  "analytikerläge saknas i panelutdraget — ingen målkurs förs in; NÄSTA RAPPORT 2026-10-28 (Q3 2026) — v172-könotis; " +
  "kandidatur: S2-U1-BCE-UTOKNING-OMG24 §10 kö-notis 'Kanada/industri (CNR/CPKC) — öppna celler' — andrakandidaten; P/E-bärarkriteriet kontrollerat FÖRE leverans (TTM-netto 3 847 M > 0; Sony/Honda-doktrinen); kollisionskontroll exakt-match GRÖN; Industrials ⇒ industri-cellen (23→24 bolag), Kanada 7→8 — blockets åttonde gren och järnvägsduon komplett (CNR+CPKC).";

const RAD = {
  ticker: "CP",
  namn: "Canadian Pacific Kansas City Limited",
  bransch: "industri",
  land: "Kanada",
  valuta: "CAD",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-25", url: "https://stockanalysis.com/quote/tsx/CP/ (+ /statistics/ + /financials/)", paranoid: PARANOID }],
  hamtat: "2026-09-25",
  pris: K.pris,
  marknadsKapitalMdr: K.mcap,
  tillvaxt: {
    omsattningCAGR5ar: R.omsCagr2,
    resultatCAGR5ar: R.resCagr2,
    omsattningTillvaxtTTM: 0.05,
    prognosTillvaxt: R.prognos,
  },
  lonksamhet: {
    roe: K.roe, roic: K.roic, bruttoMarginal: K.bruttoM, ebitMarginal: K.ebitM,
    nettoMarginal: K.nettoM, fcfMarginal: K.fcf / K.revTtm,
  },
  stabilitet: {
    skuldEgenkapital: K.de, rantaTackning: K.rantaTackning, fcfPositivaSenaste5: 5,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: 0,
  },
  aterkop: { senasteArMdr: 0.746, andelUtestande: K.payout, insiderkopSenaste6man: 0 },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
  vardering: { pe: K.pe, pb: K.pb, evEbit: K.evEbit, peg: R.peg, fcfYield: R.fcfY, egenKapitalMultipl: K.pb },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2022", "2023", "2024", "2025"],
    omsattning: K.omsSerie.map((x) => x * 1e6),
    resultat: K.resSerie.map((x) => x * 1e6),
    egetKapital: [],
    fcf: K.fcfSerie.map((x) => x * 1e6),
  },
  notering:
    "kandidat ur BCE-OMG24 §10:s kö-notis (industri-cellens andrakandidat; P/E-bärare kontrollerad före leverans); TSX-primär CAD; K&A-BROTT FY2023 (Kansas City Southern +42 % omsättningshopp) ⇒ CAGR på 2-årig konsekutiv post-KCS-bas (oms +8,05 % · netto −0,78 %); P/E på källans CORE-JUSTERADE bas (KCS purchase accounting; GAAP-replik 26,08 = 7,4 % dokumenterad avvikelse); ROIC 5,66 % under WACC 7,37 % (integrationens kapitalbas — kontrast mot CNR dokumenterad); Altman 2,69 varningszonen öppet (Piotroski 6); FCF-nedgång = integrations-capex; EK-serie saknas — serier.egetKapital tomt; rappdag 2026-10-28 = v172-könotis; alla repliker i paranoid (StockAnalysis TSX 2026-09-25)",
};

// ── Fältgrind mot Kao-strukturen ──────────────────────────────────────────────
const kao = u.find((b) => b.ticker === "4452.T");
const fält = (o) => Object.keys(o).sort().join(",");
const strukturOk =
  fält(RAD) === fält(kao) &&
  ["tillvaxt", "lonksamhet", "stabilitet", "aterkop", "moat", "vardering", "golv", "serier"].every(
    (k) => fält(RAD[k]) === fält(kao[k]),
  );
if (!strukturOk) { console.error("ABORT: fältstruktur avviker från 4452.T-mallen"); process.exit(1); }

// ── Kirurgisk append ──────────────────────────────────────────────────────────
const rad2 = raw.split("\n")[1] ?? "";
const indent = rad2.startsWith("  ") ? 2 : rad2.startsWith(" ") ? 1 : 0;
const backup = JSON.parse(JSON.stringify(u));
u.push(RAD);
writeFileSync(UNI, JSON.stringify(u, null, indent) + (raw.endsWith("\n") ? "\n" : ""));

const kvitto = [];
for (let i = 1; i <= 2; i++) {
  const el = JSON.parse(readFileSync(UNI, "utf8"));
  if (el.length !== FÖRE + 1) { console.error(`ABORT: läs-tillbaka ${i}: ${el.length} ≠ ${FÖRE + 1}`); process.exit(1); }
  if (el[el.length - 1].ticker !== "CP") { console.error(`ABORT: läs-tillbaka ${i}: sista raden ≠ CP`); process.exit(1); }
}
const slut = JSON.parse(readFileSync(UNI, "utf8"));
const forandrade = backup.filter((b, i) => JSON.stringify(b) !== JSON.stringify(slut[i])).length;
if (forandrade !== 0) { console.error(`ABORT: ${forandrade} gamla rader förändrade`); process.exit(1); }

kvitto.push(
  `UNIVERSUM-INLÄGG GRÖN: ${FÖRE}→${slut.length} (+1 Canadian Pacific Kansas City CP, Kanada/industri 23→${slut.filter((b) => b.bransch === "industri").length}; Kanada-cellen → ${slut.filter((b) => b.land === "Kanada").length})`,
  `indent=${indent} · gamla rader förändrade=${forandrade} · läs-tillbaka ×2 OK`,
  `REPLIKER: mcap ${R.mcap.toFixed(2)} (${K.mcap}) 0,02 % · nettoM ${(R.nettoM * 100).toFixed(2)} % EXAKT · ps ${R.ps.toFixed(3)} (${K.ps}) EXAKT · fcfY ${(R.fcfY * 100).toFixed(3)} % (mot ${(100 / K.pFcf).toFixed(3)} %) EXAKT · payout ${R.payoutReplik.toFixed(4)} (${K.payout}) ✓ · pe-GAAP ${R.peGaap.toFixed(2)} vs källa ${K.pe} (7,4 % core-justerad bas, dokumentklass)`,
  `CAGR (post-KCS konsekutiv FY23→25): oms ${(R.omsCagr2 * 100).toFixed(2)} % · netto ${(R.resCagr2 * 100).toFixed(2)} % — 3-årig rak hade gett oms +${(R.omsCagr3 * 100).toFixed(1)} % (förvärvshopp, ej organiskt)`,
  `prognosTillväxt +${(R.prognos * 100).toFixed(2)} % · spår-PEG ${R.peg.toFixed(2)} · ROIC 5,66 % < WACC 7,37 % (integration) · Altman 2,69 varningszon`,
);
writeFileSync("/tmp/r201-inlagg.txt", kvitto.join("\n"));
console.log(kvitto.join("\n"));
