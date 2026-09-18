#!/usr/bin/env node
/**
 * s2-u2 omg13 (manifest auto-s2-1789696529917) — DATASET-DJUP:
 * BRASILIEN PBR (energi) + VALE (material) — universumets 19:e land och
 * första Sydamerika-rader; 165→167 (idempotent append, syskonens rader
 * lämnas elementvis orörda; redan förekommande tickers hoppas).
 * Källa StockAnalysis /stocks/{pbr,vale}/{,statistics/,financials/}
 * hämtade 2026-09-18 (close 2026-09-17). ADR-konventioner: PBR ADR = 2
 * stamaktier (mcap bärs av 6,174 mdr ADR-ekvivalenter; källans shares-out
 * 12,89 mdr = samtliga stamaktier ON+PN), VALE ADR = 1:1. Serier i
 * rapportvaluta BRL (CNQ/EQNR-precedensen: USD-noterad, serier i lokal
 * valuta). All aritmetik maskinverifierad FÖRE skrivning (abort-grind).
 */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/portfolj-system/bolagsunivers.json";
const u = JSON.parse(readFileSync(FIL, "utf8"));
const innan = u.length;
const har = (t) => u.some((b) => b.ticker === t);

// ── käldata (StockAnalysis, hämtat 2026-09-18, close 2026-09-17; USD ADR; TTM/serier enligt paranoid) ──
const K = {
  PBR: {
    pris: 20.94, mcapMdr: 129.27, evMdr: 190.10,          // källans mcap/EV direkt (ADR-ekvivalenter)
    pe: 5.02, peFwd: 4.62, pb: 1.39, ptbv: 1.43, evEbit: 4.98, evEbitda: 4.05, ps: 1.22,
    revTTM: 105.87, nettoTTM: 25.74, ebitTTM: 38.17, ebitdaTTM: 46.91, gpTTM: 53.57, epsTTM: 4.17,
    bruttoM: 0.506, ebitdaM: 0.4431, ebitM: 0.3605, nettoMKalla: 0.2432, fcfMKalla: 0.192,
    roe: 0.3027, roa: 0.1007, roic: 0.1869, roce: 0.1801, wacc: 0.0199,
    skuldEk: 0.76, rantaTack: null,                       // källan: interest coverage n/a
    kassaMdr: 10.38, skuldMdr: 70.75, nettoskuldMdr: 60.37, equityMdr: 93.01,
    fcfTTM: 20.55, ocfTTM: 41.83, capexTTM: 21.27, beta: -0.21,
    dps: 1.185, direktAvk: 0.0566, payout: 0.2839, buybackYield: null, insiders: 0.0173,
    revTillvaxtTTM: 0.112, nettoTillvaxtTTM: 0.724,
    rev3yProg: 0.0273, eps3yProg: null,
    v52laag: 11.43, v52hog: 22.24, v52Forandr: 0.6182,
    rapport: "2026-11-10", exDiv: "2026-08-25",
    analytiker: "Buy mål 22,38 (+6,9 %), 14 st",
    serier: {                                              // mkr BRL, FY2022–FY2025
      ar: ["2022", "2023", "2024", "2025"],
      oms: [641256, 511994, 490829, 497549],
      netto: [188328, 124606, 36606, 110129],
      fcf: [205754, 155381, 124181, 91619],
    },
    brutto5: [219637, 334100, 269933, 246462, 236998],     // bruttovinst FY2021..FY2025 mkr BRL
    bruttoMarg5Kalla: [0.4852, 0.5210, 0.5272, 0.5021, 0.4763], // källans procentkolumn
    oms5: [452668, 641256, 511994, 490829, 497549],        // omsättning FY2021..FY2025 mkr BRL
    dpsBrl: [7.773, 17.062, 7.270, 5.734, 3.199],          // DPS FY2021..FY2025 BRL
  },
  VALE: {
    pris: 14.47, mcapMdr: 61.49, evMdr: 77.97,
    pe: 30.72, peFwd: 8.71, pb: 1.58, ptbv: 2.15, evEbit: 6.68, evEbitda: 5.22, ps: 1.46,
    revTTM: 42.09, nettoTTM: 2.00, ebitTTM: 11.68, ebitdaTTM: 14.93, gpTTM: 14.70, epsTTM: 0.47,
    bruttoM: 0.3492, ebitdaM: 0.3546, ebitM: 0.2774, nettoMKalla: 0.0475, fcfMKalla: 0.086,
    roe: 0.0411, roa: 0.0791, roic: 0.0767, roce: 0.1569, wacc: 0.0751,
    skuldEk: 0.55, rantaTack: 3.89,
    kassaMdr: 5.76, skuldMdr: 21.23, nettoskuldMdr: 15.47, equityMdr: 38.89,
    fcfTTM: 3.66, ocfTTM: 9.87, capexTTM: 6.21, beta: 0.75,
    dps: 0.712, direktAvk: 0.0492, payout: 1.5243, buybackYield: 0.0001, insiders: 0.0002,
    revTillvaxtTTM: 0.04, nettoTillvaxtTTM: -0.642,
    rev3yProg: 0.0314, eps3yProg: -0.0154, effSkatt: 0.644,
    v52laag: 10.58, v52hog: 17.94, v52Forandr: 0.3263,
    rapport: "2026-10-29", exDiv: "2026-08-13",
    analytiker: "Buy mål 16,66 (+15,1 %), 25 st",
    serier: {                                              // mkr BRL, FY2022–FY2025
      ar: ["2022", "2023", "2024", "2025"],
      oms: [226508, 208066, 206005, 213595],
      netto: [95924, 39940, 31592, 13814],
      fcf: [30017, 36459, 15101, 15375],
    },
    brutto5: [176257, 102313, 88050, 74687, 74708],        // bruttovinst FY2021..FY2025 mkr BRL
    bruttoMarg5Kalla: [0.6005, 0.4517, 0.4232, 0.3625, 0.3498],
    oms5: [293524, 226508, 208066, 206005, 213595],
    dpsBrl: [14.094, 5.691, 6.987, 4.757, 5.477],
  },
};

// ── härledda tal + aritmetikgrind ─────────────────────────────────────────────
const cagr = (a, b, ar) => Math.pow(b / a, 1 / ar) - 1;
const FEL = [];
const jamfor = (namn, calc, ext, tol = 0.005) => {
  if (Math.abs(calc - ext) > tol) FEL.push(`${namn}: beräknat ${calc} vs källa ${ext} (tol ${tol})`);
};
const r4 = (x) => Math.round(x * 10000) / 10000;

const bilda = (k) => {
  const prog = k.pe / k.peFwd - 1;                           // spårkonventionen
  const peg = Math.round((k.pe / (prog * 100)) * 100) / 100; // PEG = P/E ÷ prognosTillväxt % (SOBI-konventionen)
  const nettoM = r4(k.nettoTTM / k.revTTM);
  const fcfM = r4(k.fcfTTM / k.revTTM);
  const fcfY = r4(k.fcfTTM / k.mcapMdr);
  const omsCagr = cagr(k.serier.oms[0], k.serier.oms[3], 3);
  const resCagr = cagr(k.serier.netto[0], k.serier.netto[3], 3);
  const bm5 = k.brutto5.map((b, i) => b / k.oms5[i]);
  const moatMedel = bm5.reduce((a, b) => a + b, 0) / 5;
  const moatSpread = Math.max(...bm5) - Math.min(...bm5);

  // kontroller mot källans egna publicerade mått (externa vittnen)
  jamfor("P/E-identitet pris/EPS", k.pris / k.epsTTM, k.pe, k === K.PBR ? 0.01 : 0.1); // VALE: källans EPS visas med 2 dec (0,47) — identiteten håller på avrundningsnivå
  jamfor("P/B mcap/equity", k.mcapMdr / k.equityMdr, k.pb, 0.01);
  jamfor("EV/EBIT (mcap+nettoskuld)/EBIT", (k.mcapMdr + k.nettoskuldMdr) / k.ebitTTM, k.evEbit, k === K.PBR ? 0.06 : 0.1); // källans EV bär poster utöver mcap+nettoskuld (dokumenterat)
  jamfor("direktavkastning DPS/pris", k.dps / k.pris, k.direktAvk, 0.001);
  jamfor("payout DPS/EPS", k.dps / k.epsTTM, k.payout, 0.02); // källans payout på exakta underliggande tal
  jamfor("fcfYield FCF/mcap", k.fcfTTM / k.mcapMdr, k.pe === 5.02 ? 0.159 : 0.0595, 0.001);
  jamfor("bruttomarginal TTM", k.gpTTM / k.revTTM, k.bruttoM, 0.001);
  jamfor("EBIT-marginal TTM", k.ebitTTM / k.revTTM, k.ebitM, 0.0015);
  jamfor("nettomarginal TTM", k.nettoTTM / k.revTTM, k.nettoMKalla, 0.001);
  jamfor("nettoskuld skuld−kassa", k.skuldMdr - k.kassaMdr, k.nettoskuldMdr, 0.01);
  if (!(k.serier.netto[0] > 0 && k.serier.netto[3] > 0)) FEL.push("CAGR-endpoint: icke-positiva endpoints");
  for (let i = 0; i < 5; i++) jamfor(`bruttomarginal FY${2021 + i} mot källans procentkolumn`, r4(bm5[i]), k.bruttoMarg5Kalla[i], 0.0005);

  return { prog, peg, nettoM, fcfM, fcfY, omsCagr, resCagr, moatMedel, moatSpread,
    evCheck: (k.mcapMdr + k.nettoskuldMdr) / k.ebitTTM };
};

const D = { PBR: bilda(K.PBR), VALE: bilda(K.VALE) };

for (const [n, d] of Object.entries(D)) {
  console.log(`${n}: prognosTillväxt ${(d.prog * 100).toFixed(1)} % · PEG ${d.peg} · nettoM ${d.nettoM} · fcfM ${d.fcfM} · fcfY ${d.fcfY} · omsCAGR ${(d.omsCagr * 100).toFixed(2)} % · resCAGR ${(d.resCagr * 100).toFixed(2)} % · moat medel ${(d.moatMedel * 100).toFixed(2)} % spread ${(d.moatSpread * 100).toFixed(2)} pp · EV/EBIT-check ${d.evCheck.toFixed(2)}`);
}
if (FEL.length) { console.error("ARITMETIKFEL:", FEL); process.exit(1); }
console.log("ARITMETIKGRIND: GRÖN");

// ── radbygge ──────────────────────────────────────────────────────────────────
const rad = (t, namn, bransch, k, d, paranoid, notering) => ({
  ticker: t, namn, bransch, land: "Brasilien", valuta: "USD",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-18", url: `https://stockanalysis.com/stocks/${t.toLowerCase()}/`, paranoid }],
  hamtat: "2026-09-18",
  pris: k.pris,
  marknadsKapitalMdr: k.mcapMdr,
  tillvaxt: {
    omsattningCAGR5ar: r4(d.omsCagr),
    resultatCAGR5ar: r4(d.resCagr),
    omsattningTillvaxtTTM: k.revTillvaxtTTM,
    prognosTillvaxt: r4(d.prog),
  },
  lonksamhet: {
    roe: k.roe, roic: k.roic, bruttoMarginal: k.bruttoM, ebitMarginal: k.ebitM,
    nettoMarginal: d.nettoM, fcfMarginal: d.fcfM,
  },
  stabilitet: {
    skuldEgenkapital: k.skuldEk, rantaTackning: k.rantaTack,
    fcfPositivaSenaste5: null, kassaManaderBurnRate: null, nyemissionerSenaste5ar: null,
  },
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: null },
  moat: { bruttoMarginalMedel5ar: r4(d.moatMedel), bruttoMarginalSpread5ar: r4(d.moatSpread), roeMedel5ar: null },
  vardering: {
    pe: k.pe, pb: k.pb, evEbit: k.evEbit, peg: d.peg, fcfYield: d.fcfY, egenKapitalMultipl: k.pb,
  },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: k.serier.ar,
    omsattning: k.serier.oms.map((x) => x * 1e6),
    resultat: k.serier.netto.map((x) => x * 1e6),
    egetKapital: [],
    fcf: k.serier.fcf.map((x) => x * 1e6),
  },
  notering,
});

const rader = [
  rad("PBR", "Petróleo Brasileiro S.A. - Petrobras", "energi", K.PBR, D.PBR,
    "översikt + statistics + financials (underlag S&P Global Market Intelligence; NYSE-ADR close 2026-09-17 20,94 USD, sidorna pålästa 2026-09-18): pris, mcap 129,27 mdr USD, EV 190,10 mdr, P/E 5,02 forward 4,62, P/B 1,39 (mcap/equity — källans P/TBV 1,43), EV/EBIT 4,98 EV/EBITDA 4,05, marginaler, ROE 30,27 %/ROIC 18,69 %/WACC 1,99 %, skuld/EK 0,76, nettoskuld 60,37 mdr USD, utdelning 1,185 USD/aktie (5,66 %, payout 28,39 %), beta −0,21, 52-v 11,43–22,24 (+61,8 %), Altman Z 1,53, Piotroski F 8, analytiker Buy 22,38 USD; ADR-konvention: 1 ADR = 2 stamaktier (källans shares-out 12,89 mdr = samtliga stamaktier ON+PN; mcap bärs av 6,174 mdr ADR-ekvivalenter; EPS 4,17 är per ADR); FY-serier i rapportvaluta BRL (mkr) enligt CNQ/EQNR-precedensen — statistics-TTM är USD-översatt; bransch Energy/Oil & Gas Integrated källkonsekvent med XOM/CVX/SHEL/TTE-familjen",
    "Universumets FÖRSTA SYDAMERIKA-RAD och 19:e landet: Brasiliens statskontrollerade oljemajor (statlig majoritet via Petrobras Participações; Reuters etiketterar 'state-run'; källan klassar Energy/Oil & Gas Integrated). UTDDELNINGSCYKELNS LÄROBOK: DPS BRL 7,773 (FY2021) → 17,062 (FY2022, direktavkastning 52,2 % i oljeboomens topp) → 7,270 → 5,734 → 3,199 (FY2025, 5,1 %) — utdelningen följer oljepriset, precis som konventionen lär (nuvarande 1,185 USD = 5,66 %, payout 28,39 % av TTM-EPS 4,17). FY2024-dipet netto 36,6 mdr BRL → FY2025 110,1 mdr (+200,8 %) = skatte-/engångsposternas svans. TTM (USD): oms 105,87 mdr (+11,2 %), netto 25,74 mdr (+72,4 %), bruttomarginal 50,6 %, EBIT 36,1 %, FCF 20,55 mdr (fcfYield 15,9 % — kassaflödesmaskinen i oljeprisets farvatten). P/E 5,02 mot forward 4,62 ⇒ prognosTillväxt +8,7 % (PEG 0,58 spårkonventionen; källans PEG n/a). ROIC 18,69 % mot WACC 1,99 % = +16,7 pp; ROE 30,3 %. Beta −0,21 = universumets andra negativa beta (DNO −0,15) — oljan som motvikt mot tekniktunga index. Skuld/EK 0,76, nettoskuld 60,4 mdr USD, Debt/EBITDA 1,27; räntetäckning n/a hos källan. Insiders 1,73 % (formella insiders — den statliga kontrollen bärs av holdingsbolag utanför källans insiderdefinition). Nästa rapport 2026-11-10 (Q3), ex-div 2026-08-25."),
  rad("VALE", "Vale S.A.", "material", K.VALE, D.VALE,
    "översikt + statistics + financials (underlag S&P Global Market Intelligence; NYSE-ADR close 2026-09-17 14,47 USD, ADR 1:1, sidorna pålästa 2026-09-18): pris, mcap 61,49 mdr USD, EV 77,97 mdr, P/E 30,72 forward 8,71, P/B 1,58 (mcap/equity; P/TBV 2,15), EV/EBIT 6,68 EV/EBITDA 5,22, marginaler, ROE 4,11 %/ROIC 7,67 %/ROCE 15,69 %/WACC 7,51 %, skuld/EK 0,55, räntetäckning 3,89×, nettoskuld 15,47 mdr USD, utdelning 0,712 USD/aktie (4,92 %, payout 152,4 % av TTM-EPS), köpavkastning 0,01 %, beta 0,75, 52-v 10,58–17,94 (+32,6 %), Altman Z 1,96, Piotroski F 7, analytiker Buy 16,66 USD (25 st); EFFEKTIV SKATTESATS 64,40 % TTM (källans signifikanta tal — provisioner för Brumadinho/Samarco-förpliktelser trycker TTM-nettot); FY-serier i rapportvaluta BRL (mkr) — statistics-TTM är USD-översatt; bransch Materials/Other Industrial Metals & Mining källkonsekvent med BHP/RIO-familjen",
    "Världens största järnmals- och pelletsproducent (segment FY2025 BRL: Iron Ore 101 658 · Pellets 6 196 · Nickel 16 571 · Copper 22 251 — källans segmenttabell): tillsammans med PBR universumets första Sydamerika-rader och grundplåten till framtida /dataset/material/brasilien + /dataset/energi/brasilien. MOAT-FALLETS LÄROBOK: bruttomarginal 60,0 % (FY2021, järnmalmsboomen) → 35,0 % (FY2025) — spread 25,1 pp = universumets NÄST BREDASTE efter DNO (27,6 pp): råvaruvallgraven som försvinner med priscykeln (femårsgenomsnitt 43,8 %). P/E 30,72 mot forward 8,71 ⇒ prognosTillväxt +252,7 % = universumets näst extremaste gap efter DNO (+365,8 %; ARM +143,7 och Samsung +205,1 klara den nedre trappan) — PEG 0,12 spårkonventionen, gap-mått inte frikort. TTM-netto 2,00 mdr USD (−64,2 %) mot EBIT 11,68 mdr: skillnaden bor UNDER driftsraden — finansiella poster och skatteprovisioner med effektiv skattesats 64,4 % (Brumadinho/Samarco-efterdyningar), därav payout 152,4 % av TTM-EPS medan utdelningen bärs av kassaflödet (FCF 3,66 mdr, fcfYield 5,95 %, DPS 0,712 USD = 4,92 %). DPS BRL-serien 14,094→5,691→6,987→4,757→5,477 = samma cykeldoktrin som PBR men mjukare amplitud. Serierna FY2022–FY2025 mkr BRL: oms 226 508→213 595 (−1,9 %/år endpoint) · netto 95 924→13 814 (−47,6 %/år endpoint — cykelbotten) · FCF 30 017→15 375. ROIC 7,67 % mot WACC 7,51 % = +0,16 pp (knapp marginal på TTM-botten) medan ROCE 15,69 % visar driftens kraft; skuld/EK 0,55, räntetäckning 3,9×. Beta 0,75. Insiders 0,02 %, institutioner 53,9 %. Nästa rapport 2026-10-29 (Q3), ex-div 2026-08-13."),
];

// ── idempotent append (elementvis, syskonens rader orörda) ────────────────────
const tillagda = [];
for (const r of rader) {
  if (har(r.ticker)) { console.log(`HOPPAR ${r.ticker} (finns redan)`); continue; }
  u.push(r);
  tillagda.push(r.ticker);
}
if (!tillagda.length) { console.log("INGET ATT LÄGGA — fil orörd"); process.exit(0); }

writeFileSync(FIL, JSON.stringify(u, null, 2));           // befintligt format: indent 2, ingen slutradbrytning
console.log(`APPEND: ${innan}→${u.length} (+${tillagda.join(", ")})`);

// ── efterkontroll: mattor + medianförskjutning (energi/material/totalt P/E) ──
const median = (v) => { const s = [...v].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const pct = (v, p) => { const s = [...v].sort((a, b) => a - b); const pos = (s.length - 1) * p; const lo = Math.floor(pos), hi = Math.ceil(pos); return lo === hi ? s[lo] : s[lo] + (pos - lo) * (s[hi] - s[lo]); };
const pes = (f) => u.filter(f).map((b) => b.vardering?.pe).filter((x) => typeof x === "number");
for (const [namn, f] of [["energi", (b) => b.bransch === "energi"], ["material", (b) => b.bransch === "material"], ["TOTALT", () => true]]) {
  const v = pes(f);
  console.log(`${namn}: n=${v.length} median P/E ${median(v).toFixed(3)} P25 ${pct(v, 0.25).toFixed(3)} P75 ${pct(v, 0.75).toFixed(3)}`);
}
const brCell = (l, br) => u.filter((b) => b.land === l && b.bransch === br).length;
console.log(`Matta Brasilien/energi ${brCell("Brasilien", "energi")} · Brasilien/material ${brCell("Brasilien", "material")} (MIN_MATTA=5: ingen landsida öppnas av +2 — cellerna 0→1)`);
