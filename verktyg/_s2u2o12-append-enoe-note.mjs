#!/usr/bin/env node
/**
 * s2-u2 omg12 (manifest auto-s2-1789675529483) — DATASET-DJUP:
 * Sverige/teknik ENEA.ST + NOTE.ST — universum 160→162 (idempotent append,
 * race-säker: syskonens rader lämnas elementvis orörda; redan förekommande
 * tickers hoppas). Källa StockAnalysis sto/-flödena hämtade 2026-09-17.
 * All aritmetik maskinverifierad i detta skript FÖRE skrivning (abort-grind).
 */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/portfolj-system/bolagsunivers.json";
const u = JSON.parse(readFileSync(FIL, "utf8"));
const innan = u.length;
const har = (t) => u.some((b) => b.ticker === t);

// ── käldata (StockAnalysis, hämtat 2026-09-17; SEK; TTM/intervall enligt paranoid) ──
const K = {
  ENEA: {
    pris: 64.6, aktier: 18.79,           // M aktier → mcap 1 213,9 MSEK
    pe: 11.37, peFwd: 11.14, pb: 0.71, evEbit: 7.48, evEbitda: 5.45, ps: 1.36, evSales: 1.62,
    revTTM: 891.69, nettoTTM: 107.91, ebitTTM: 193.7, epsTTM: 5.68,
    bruttoM: 0.7733, ebitdaM: 0.2816, ebitM: 0.2172,
    roe: 0.0641, roce: 0.0927, wacc: 0.0797,
    skuldEk: 0.19, rantaTack: 16.41, nettoskuldM: 234.4,      // Net Cash −234,4
    fcfTTM: 148.47, beta: 0.9, buybackYield: 0.0551, insiders: 0.4354,
    utdelningAktie: null, direktAvk: null, payout: null,
    revTillvaxtTTM: -0.015, nettoTillvaxtTTM: 0.521,
    rev3yProg: 0.0616, eps3yProg: null,
    v52l: 54.0, v52h: 92.7, rapport: "2026-10-22",
    serier: {
      ar: ["2022", "2023", "2024", "2025"],
      oms: [927.67, 912.68, 904.27, 888.99],
      netto: [224.81, -550.72, 143.06, 49.41],
      fcf: [159.17, 251.6, 272.31, 95.97],
      brutto: [713.99, 697.7, 708.52, 683.68],
    },
    brutto5: [864.13, 927.67, 912.68, 904.27, 888.99], // FY2021..2025 omsättning
    bruttoVinst5: [721.62, 713.99, 697.7, 708.52, 683.68], // FY2021..2025 bruttovinst
  },
  NOTE: {
    pris: 172.1, aktier: 28.55,          // M aktier → mcap 4 913,5 MSEK
    pe: 19.74, peFwd: 14.48, pb: 2.68, evEbit: 17.47, evEbitda: 12.58, ps: 1.24, evSales: 1.65,
    pegKalla: 1.99,
    revTTM: 3968, nettoTTM: 248.74, ebitTTM: 375.19, epsTTM: 8.72,
    bruttoM: 0.1425, ebitdaM: 0.124, ebitM: 0.0945,
    roe: 0.1482, roce: 0.1313, wacc: 0.0611,
    skuldEk: 0.98, rantaTack: 7.35, nettoskuldM: 1640,      // Net Cash −1,64 B
    fcfTTM: 183.36, beta: 0.59, buybackYield: 0.0014, insiders: 0.3003,
    utdelningAktie: null, direktAvk: null, payout: 0.8016, utdAr: 1,
    revTillvaxtTTM: 0.04, nettoTillvaxtTTM: -0.032,
    rev3yProg: 0.1436, eps3yProg: 0.157,
    v52l: 138.1, v52h: 205.2, rapport: "2026-10-23",
    serier: {
      ar: ["2022", "2023", "2024", "2025"],
      oms: [3687, 4243, 3901, 3814],
      netto: [254.24, 319.96, 248.03, 281.74],
      fcf: [3.38, 250.11, 512.32, 393.36],
    },
    brutto5: [2643, 3687, 4243, 3901, 3814],
    bruttoVinst5: [353.65, 473.17, 513.79, 519.47, 529.33],
  },
};

// ── härledda tal + aritmetikgrind ─────────────────────────────────────────────
const cagr = (a, b, ar) => Math.pow(b / a, 1 / ar) - 1;
const FEL = [];
const jamfor = (namn, calc, ext, tol = 0.005) => {
  if (Math.abs(calc - ext) > tol) FEL.push(`${namn}: beräknat ${calc} vs källa ${ext}`);
};
const r4 = (x) => Math.round(x * 10000) / 10000;

const bilda = (k) => {
  const mcapM = k.pris * k.aktier;                       // MSEK
  const mcapMdr = r4(mcapM / 1000);                      // mdr SEK
  const prog = k.pe / k.peFwd - 1;                       // spårkonventionen
  const peg = Math.round((k.pe / (prog * 100)) * 100) / 100; // PEG = P/E ÷ prognosTillväxt(%) — 2 dec (SOBI-konventionen)
  const nettoM = r4(k.nettoTTM / k.revTTM);
  const fcfM = r4(k.fcfTTM / k.revTTM);
  const fcfY = r4(k.fcfTTM / mcapM);
  const omsCagr = cagr(k.serier.oms[0], k.serier.oms[3], 3);
  const resCagr = cagr(k.serier.netto[0], k.serier.netto[3], 3);
  const bm5 = k.brutto5.map((o, i) => k.bruttoVinst5[i] / o);
  const moatMedel = bm5.reduce((a, b) => a + b, 0) / 5;
  const moatSpread = Math.max(...bm5) - Math.min(...bm5);

  // kontroller mot källans egna publicerade mått (externa vittnen)
  jamfor("mcap", mcapMdr, k === K.ENEA ? 1.21 : 4.91, 0.011);
  jamfor("P/E-identitet EPS", k.pris / k.epsTTM, k.pe, 0.01);
  jamfor("EV/EBIT", (mcapM + k.nettoskuldM) / k.ebitTTM, k.evEbit, 0.06);
  if (k === K.ENEA) jamfor("P/B-identitet", k.pe * k.roe, k.pb, 0.03);
  if (!(k.serier.netto[0] > 0 && k.serier.netto[3] > 0)) FEL.push("CAGR-endpoint: icke-positiva endpoints");

  return {
    mcapMdr, prog, peg, nettoM, fcfM, fcfY, omsCagr, resCagr, moatMedel, moatSpread,
    evCheck: (mcapM + k.nettoskuldM) / k.ebitTTM,
  };
};

const D = { ENEA: bilda(K.ENEA), NOTE: bilda(K.NOTE) };

// utskrift av kontrolltalet
for (const [n, d] of Object.entries(D)) {
  console.log(`${n}: mcap ${d.mcapMdr} mdr · prognosTillväxt ${(d.prog * 100).toFixed(1)} % · PEG ${d.peg} · nettoM ${d.nettoM} · fcfM ${d.fcfM} · fcfY ${d.fcfY} · omsCAGR ${(d.omsCagr * 100).toFixed(2)} % · resCAGR ${(d.resCagr * 100).toFixed(2)} % · moat medel ${(d.moatMedel * 100).toFixed(2)} % spread ${(d.moatSpread * 100).toFixed(2)} pp · EV/EBIT-check ${d.evCheck.toFixed(2)}`);
}
if (FEL.length) { console.error("ARITMETIKFEL:", FEL); process.exit(1); }
console.log("ARITMETIKGRIND: GRÖN");

// ── radbygge ──────────────────────────────────────────────────────────────────
const rad = (t, namn, k, d, paranoid, notering) => ({
  ticker: t, namn, bransch: "teknik", land: "Sverige", valuta: "SEK",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-17", url: `https://stockanalysis.com/quote/sto/${t.replace(".ST", "")}/`, paranoid }],
  hamtat: "2026-09-17",
  pris: k.pris,
  marknadsKapitalMdr: d.mcapMdr,
  tillvaxt: {
    omsattningCAGR5ar: r4(d.omsCagr),
    resultatCAGR5ar: r4(d.resCagr),
    omsattningTillvaxtTTM: k.revTillvaxtTTM,
    prognosTillvaxt: r4(d.prog),
  },
  lonksamhet: {
    roe: k.roe, roic: k.roce, bruttoMarginal: k.bruttoM, ebitMarginal: k.ebitM,
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
  rad("ENEA.ST", "Enea AB (publ)", K.ENEA, D.ENEA,
    "översikt + statistics + financials + cash-flow-statement (underlag S&P Global Market Intelligence; fördröjd STO-kurs previous close 2026-09-17, sidorna pålästa 2026-09-17): pris, börsvärde, P/E–P/B–EV/EBIT–EV/EBITDA, marginaler, ROE/ROCE/WACC, skuld/EK, räntetäckning, återköpsyield, 5 räkenskapsår bruttovinst (moat) + 4 räkenskapsår FY2022–FY2025 i serier; rapportvaluta SEK; källan klassar bolaget Technology — branschfältet teknik är källkonsekvent",
    "Svensk telecom- och cybersäkerhetsmjukvara (realtidsoperativsystem, trafikanalys och nätverksskydd sedan 1968 — källan klassar bolaget Technology): öppnar med NOTE koordinaten Sverige/teknik 3→5 mätbara ⇒ /dataset/teknik/sverige publiceras vid nästa prod-bygge (omg11:s utpekade koordinat; originalkandidaterna föll — Fortnox AVMOTERAD 2025-07-24 efter Omega II:s uppköp, Sectra klassas av källan som Healthcare). Affärsmodellen i ett tal: bruttomarginal 76–84 % fem år (medel 78,4 %, spread 7,1 pp) = mjukvaruvallgrav som NOTE:s EMS-hårdvara (13–14 %) speglar i samma branschetikett — tekniketikettens två världar. Serierna FY2022–FY2025 MSEK: oms 927,7→889,0 (−1,4 %/år endpoint — platt försäljning) men netto 224,8→49,4 (−39,7 %/år endpoint) där FY2023 = storförlust −550,7 MSEK med EBIT +9,4: svansen sitter UNDER driftsraden (finansiella/engångsposter enligt källans resultat), TTM netto 107,9 (+52,1 % YoY) på väg tillbaka; FCF fyra raka positiva 159,2/251,6/272,3/96,0 (TTM 148,5, fcfYield 12,2 %). P/E 11,37 (forward 11,14 ⇒ prognosTillväxt +2,1 %, PEG 5,51 spårkonventionen — stillastående konsensus) · P/B 0,71 = källkonsekvent med identiteten P/E × ROE (11,37 × 6,41 %) · EV/EBIT 7,48 mot EV/EBITDA 5,45. ROCE 9,27 % mot WACC 7,97 % = +1,30 pp (mjukt värdeskapande); skuld/EK 0,19, räntetäckning 16,4×, nettoskuld 234,4 MSEK; ingen utdelning — kapitalåterföring via återköp 5,51 %/år (aktieantal −5,51 % YoY); insiders 43,5 %; beta 0,90; 52-vägers 54,00–92,70. Nästa rapport 2026-10-22."),
  rad("NOTE.ST", "NOTE AB (publ)", K.NOTE, D.NOTE,
    "översikt + statistics + financials + cash-flow-statement + dividend (underlag S&P Global Market Intelligence; fördröjd STO-kurs previous close 2026-09-17, sidorna pålästa 2026-09-17): pris, börsvärde, P/E–P/B–EV/EBIT–EV/EBITDA, marginaler, ROE/ROCE/WACC, skuld/EK, räntetäckning, payout, återköpsyield, 5 räkenskapsår bruttovinst (moat) + 4 räkenskapsår FY2022–FY2025 i serier; rapportvaluta SEK; källan klassar bolaget Technology (Electronic Manufacturing Services) — branschfältet teknik är källkonsekvent",
    "Svensk electronics manufacturing services (EMS — kretskortsmontage och helhetsmontering åt industrial/medtech/infrastruktur; källan klassar bolaget Technology): tillsammans med ENEA koordinaten Sverige/teknik 3→5 mätbara ⇒ /dataset/teknik/sverige vid nästa bygge — och pedagogiken inbyggd: ENEA:s mjukvarubrutto 77 % mot NOTE:s EMS-brutto 14,3 % i SAMMA branschetikett = kvartilspridningens levande exempel (mjukvarans marginal mot monteringens volym). Serierna FY2022–FY2025 MSEK: oms 3 687→3 814 (+1,1 %/år endpoint, fyrtakt med FY2023-toppen 4 243) · netto 254,2→281,7 (+3,5 %/år endpoint, fyra raka positiva år) · FCF 3,4→393,4 (vändningen 2021→2022 från −60,6 till positivt, därefter tre raka starka: 250,1/512,3/393,4). P/E 19,74 mot forward 14,48 ⇒ prognosTillväxt +36,3 % (PEG 0,54 spårkonventionen; källans egen PEG 1,99 på 3års-EPS-prognos +15,7 % som not) · P/B 2,68 · EV/EBIT 17,47 (EV = börsvärde + nettoskuld 1 640 MSEK — källans EV 6,55 mdr). ROE 14,82 %, ROCE 13,13 % mot WACC 6,11 % = +7,02 pp (kaptitaltätt men värdeskapande); skuld/EK 0,98 (EMS-finansiering med lager/kundfordringar), räntetäckning 7,4×, quick ratio 0,63. Utdelning: DPS n/a hos källan men payout 80,16 % + 1 år av utdelningstillväxt (ny policy) redovisas; återköp 0,14 %/år; insiders 30,0 %; beta 0,59; 52-vägers 138,10–205,20; analytiker Buy mål 197,00 (+12,8 %). Nästa rapport 2026-10-23."),
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

// efterkontroll: matta teknik/Sverige
const svtek = u.filter((b) => b.bransch === "teknik" && b.land === "Sverige" && typeof b.vardering?.pe === "number");
console.log("Matta teknik/Sverige mätbara:", svtek.length, svtek.map((b) => `${b.ticker} ${b.vardering.pe}`).join(" · "));
