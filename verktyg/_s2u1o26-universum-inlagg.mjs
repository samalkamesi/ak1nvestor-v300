#!/usr/bin/env node
/**
 * _s2u1o26-universum-inlagg.mjs — AUTO-S2 omgång 26 u1 (byggare 1/3, +1 bolag):
 * AIR LIQUIDE AI.PA (Frankrike/material 0→1 — Frankrikes åttonde gren; universumets
 * FÖRSTA industriella gas-rad: oligopol-trio Air Liquide/Linde/Air Products, moat-
 * arketypen take-or-pay + distributionsnät).
 *
 * Kontrakt (5401.T/8411.T-mallarna): läser färskt universum, vägrar duplikat,
 * ARITMETIKGRIND med abort FÖRE skrivning (alla kraav gröna eller exit 1, filen
 * orörd), skriver JSON indent 2 + slutradsbrytning, LÄSER TILLBAKA ×2 (samma
 * antal båda gångerna), material-medianer före/efter (projektets konventioner:
 * median standard, kvartiler linjär interpolation — samma kropp som llms-regen)
 * + kvartilsplacering av AI.PA i material och universum.
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const u = JSON.parse(readFileSync(UNI, "utf8"));
const FÖRE = u.length;
if (u.some((b) => b.ticker === "AI.PA")) {
  console.error("ABORT: duplikat — AI.PA finns redan på disken");
  process.exit(1);
}

// ── Aritmetikgrinden: ALLA gröna FÖRE skrivning ──────────────────────────────
const kraav = [];
const kraavRad = (namn, replik, kalla, tolerans) => {
  const avvik = Math.abs(replik - kalla) / Math.abs(kalla);
  const ok = avvik <= tolerans;
  kraav.push({ namn, ok });
  console.log(`${ok ? "GRÖN" : "RÖD "} ${namn}: replik ${replik.toFixed(4)} mot källa ${kalla} (avvik ${(100 * avvik).toFixed(3)} %)`);
};

// Råtal ur källpaketet (stockanalysis.com EPA AI, hämtat 2026-09-21,
// intraday close 11:00 CET fördröjd; S&P Global Market Intelligence-underlag;
// paranoid Yahoo chart-API: 164,04 EUR samma handelsdag = +0,32 % band):
const PRIS = 163.52, MCAP_MDR = 103.85, AKTIER_M = 636.47;               // overview
const EPS_TTM = 5.56, PE = 29.36, FWD = 24.03, PS = 3.84, PB = 3.81;     // overview + statistics
const EV = 119.79, EV_EBIT = 22.50, EV_SALES = 4.43;                     // statistics
const EK_TTM = 27.262, SKULD_TTM = 17.259, KASSA_TTM = 2.061, NETTOSKULD = 15.198; // BS TTM Jun-26
const REV_TTM = 27.046, NETTO_TTM = 3.539, EBIT_TTM = 5.322, BRUTTO_TTM = 17.470;  // financials TTM
const OCF_TTM = 5.496, CAPEX_TTM = 3.836, FCF_TTM = 1.660, GM_TTM = 64.59, NETM = 13.09, EBITM = 19.68, FCFM = 6.14;
const DPS = 3.364, DYIELD = 2.06;
const OCF_FY = [5.571, 5.810, 6.263, 6.322, 6.518], CAPEX_FY = [2.917, 3.273, 3.393, 3.525, 3.843], FCF_FY = [2.654, 2.537, 2.870, 2.797, 2.675];
const REV_FY21 = 23.335, REV_FY25 = 26.940, NET_FY21 = 2.572, NET_FY25 = 3.518;

kraavRad("mcap-identitet (aktiebas × pris)", (AKTIER_M * PRIS) / 1000, MCAP_MDR, 0.005);
kraavRad("P/E (pris ÷ EPS TTM)", PRIS / EPS_TTM, PE, 0.005);
kraavRad("P/S (mcap ÷ rev TTM)", MCAP_MDR / REV_TTM, PS, 0.003);
kraavRad("P/B total-EK (mcap ÷ EK)", MCAP_MDR / EK_TTM, PB, 0.003);
kraavRad("EV (mcap + skuld − kassa)", MCAP_MDR + SKULD_TTM - KASSA_TTM, EV, 0.01);
kraavRad("EV/EBIT", EV / EBIT_TTM, EV_EBIT, 0.003);
kraavRad("EV/Sales", EV / REV_TTM, EV_SALES, 0.003);
kraavRad("nettomarginal (netto ÷ rev)", (NETTO_TTM / REV_TTM) * 100, NETM, 0.003);
kraavRad("EBIT-marginal (EBIT ÷ rev)", (EBIT_TTM / REV_TTM) * 100, EBITM, 0.003);
kraavRad("FCF-marginal (FCF ÷ rev)", (FCF_TTM / REV_TTM) * 100, FCFM, 0.003);
kraavRad("bruttomarginal (brutto ÷ rev)", (BRUTTO_TTM / REV_TTM) * 100, GM_TTM, 0.003);
kraavRad("FCF TTM (OCF − capex)", OCF_TTM - CAPEX_TTM, FCF_TTM, 0.0001);
kraavRad("nettoskuld (kassa − skuld)", KASSA_TTM - SKULD_TTM, -NETTOSKULD, 0.0001);
kraavRad("omsattningCAGR5ar (FY21→FY25)", ((REV_FY25 / REV_FY21) ** 0.25 - 1) * 100, 3.66, 0.02);
kraavRad("resultatCAGR5ar (FY21→FY25)", ((NET_FY25 / NET_FY21) ** 0.25 - 1) * 100, 8.15, 0.02);
kraavRad("prognosTillvaxt (PE ÷ fwd − 1)", (PE / FWD - 1) * 100, 22.18, 0.005);
kraavRad("PEG spårkonvention (PE ÷ prognos %)", PE / 22.18, 1.32, 0.005);
kraavRad("utdelningsavkastning (DPS ÷ pris)", (DPS / PRIS) * 100, DYIELD, 0.005);
let fcfOk = FCF_FY.every((f, i) => Math.abs(OCF_FY[i] - CAPEX_FY[i] - f) < 0.001);
kraav.push({ namn: "FCF-serien 5/5 (OCF − capex per FY)", ok: fcfOk });
console.log(`${fcfOk ? "GRÖN" : "RÖD "} FCF-serien 5/5 (OCF − capex per FY)`);

const roda = kraav.filter((k) => !k.ok);
if (roda.length) {
  console.error(`ABORT: ${roda.length} RÖDA kraav — filen orörd: ` + roda.map((k) => k.namn).join(" · "));
  process.exit(1);
}
console.log(`ARITMETIKGRIND: ${kraav.length}/${kraav.length} GRÖNA\n`);

// ── Medianplacering FÖRE (projektets konventioner) ───────────────────────────
const median = (v) => { const r = v.filter((x) => typeof x === "number" && Number.isFinite(x)); if (!r.length) return null; const s = [...r].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const percentil = (v, p) => { const r = v.filter((x) => typeof x === "number" && Number.isFinite(x)); if (!r.length) return null; const s = [...r].sort((a, b) => a - b); const pos = (s.length - 1) * p; const lo = Math.floor(pos), hi = Math.ceil(pos); return lo === hi ? s[lo] : s[lo] + (pos - lo) * (s[hi] - s[lo]); };
const peMaterialFore = u.filter((b) => b.bransch === "material").map((b) => b.vardering?.pe).filter((x) => typeof x === "number");
const peTotalFore = u.map((b) => b.vardering?.pe).filter((x) => typeof x === "number");
console.log(`FÖRE: material P/E median ${median(peMaterialFore)} [P25 ${percentil(peMaterialFore, 0.25)?.toFixed(1)}–P75 ${percentil(peMaterialFore, 0.75)?.toFixed(1)}, n=${peMaterialFore.length}] · totalt ${median(peTotalFore)} (n=${peTotalFore.length})`);

// ── Raden (kontraktsmallen 5401.T) ───────────────────────────────────────────
const rad = {
  ticker: "AI.PA",
  namn: "Air Liquide S.A.",
  bransch: "material",
  land: "Frankrike",
  valuta: "EUR",
  kallor: [
    {
      namn: "StockAnalysis",
      hamtat: "2026-09-21",
      url: "https://stockanalysis.com/quote/epa/AI/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/)",
      paranoid: "EPA-PRIMÄRNOTING i EUR (S&P Global-underlag, intraday 11:00 CET 2026-09-21 fördröjd close): pris 163,52 € (aktiebas 636,47 M × 163,52 = 104,08 mdr mot mcap-fält 103,85 — 0,22 %, vägd bas), P/E 29,36 (replik 163,52÷5,56 = 29,41, +0,17 %) forward 24,03 ⇒ prognosTillväxt +22,18 % mekanisk konvention (källans 3-års EPS-prognos +10,35 %/år och PEG 2,29 som not — PEG 1,32 spårkonvention), P/S 3,84 (replik 103,85÷27,046 EXAKT), P/B 3,81 på total-EK 27,262 mdr (BAS-SPLITTRA: common-EK 26,517 ger 3,92; BVPS-fält 41,66 ger 3,93 — BCE/HUL-konventionen), P/TBV 12,52, P/FCF 62,55 (capex-cykeln: TTM-capex 3,84 mdr på OCF 5,50 ⇒ FCF 1,66 — fcfYield 1,60 %), EV 119,79 mdr (replik 103,85+17,26−2,06 = 119,05 — avvik 0,62 % = minoritet 0,75 + pensionsbas, dokumenterad utan orsaksspekulation) med EV/EBIT 22,50 (replik 119,79÷5,322 EXAKT) EV/Sales 4,43 (EXAKT) EV/EBITDA 15,24 (marginalbas 7,62 mdr) EV/Earnings 33,84, marginaler TTM: brutto 64,59 % (17,470÷27,046 EXAKT) EBIT 19,68 % (EXAKT) netto 13,09 % (EXAKT) pretax 18,27 %, FCF-marginal 6,14 % (EXAKT), ROE 13,97 % ROA 6,30 % ROIC 9,30 % mot WACC 6,92 % = +2,38 pp spridning, räntetäckning 13,57, D/E 0,63 Debt/EBITDA 2,20, Altman 3,42, Piotroski 6, beta 0,64, effektiv skatt 25,82 %, NETTOSKULD −15,20 mdr € (kassa 2,061 − skuld 17,259 EXAKT), utdelning 3,364 €/år run-rate (2,06 %; replik 3,364÷163,52 EXAKT; payout 62,25 % på källans bas — repliken 3,364÷5,56 = 60,5 % dokumenterad som basskillnad; tillväxt +12,12 % YoY, 6 tillväxtår — kontinuitetsfamiljen sedan 1911), buyback-yield 0,09 % (aktiebas 630,98→636,47 M på fem år = utspädning +0,87 %; emissioner 483 M € mot återköp 548 M € = nära noll-netto, dokumenterad), shareholder yield 2,15 %, institutioner 30,97 % insiders 0,15 %, 52-v 140,78–182,26 (+2,42 %), analytiker Strong Buy 20 st PT 197,23 (+20,62 %), 65 000 anställda, grundat 1902, nästa rapport 2026-10-23; SPLIT-NOTIS 1:1,1 forward 2026-06-08 (SA:s aktiebas-serie retrojusterad — 575 M pre-split ≈ 632,5 post mot seriens 634: konsekvent), FY-serier kalenderår (M €): rev 23 335→29 934→27 608→27 058→26 940 (2022 = energikrisens pristopp; TTM 27 046; omsättningstillväxt TTM −1,3 % på översiktens yoy-konvention mot financials +0,39 % TTM-mot-FY25 — två baser dokumenterade), netto 2 572→2 759→3 078→3 306→3 518 (TTM 3 539; EPS 4,07→5,53, TTM 5,56 — EPS-CAGR 7,95 % mot netto-CAGR 8,15 % = intern konsistens), bruttomarginalserie 59,77/53,85/59,62/63,01/64,18 % (energidipens V-form: 2022-prisbobblan mot volymfallback, sedan fem halvårs-steg uppåt — medel 60,09, spread 10,33 pp), EBIT-marginal 16,83→19,30 % (TTM 19,68), EK totalt 21 999→26 947 (BVPS 34,01→41,23), skuld 13 964→13 651 MEDAN TTM 17 259 (+3,6 — förvärvsfinansieringen 2026: net debt issued +4 235 M € TTM) och goodwill 13 823→16 196 TTM (+2,4 = samma steg), kassa 2 247→3 962→2 061, fcf 2 654→2 537→2 870→2 797→2 675 (5/5 positiva; varje år OCF−capex EXAKT; TTM 1 660 = capex-toppen 3 836), capex 2 917→3 843 (+32 % — Elektrolys/Elektronik-investeringarna), utdelningar betalda 1 335→1 955 (TTM 2 203; 1 955÷635,74 = 3,08 €/aktie mot DPS-fältet 3,364 — kalender-tidsläge dokumenterat), återköp 40,1→230,8→4 M € (puls, ingen maskin)"
    },
    {
      namn: "Yahoo Finance (chart-API)",
      hamtat: "2026-09-21",
      url: "https://query1.finance.yahoo.com/v8/finance/chart/AI.PA",
      paranoid: "paranoid kurskoll: Yahoo 164,04 € (regularMarketPrice, intraday 2026-09-21) mot SA 163,52 € (11:00 CET fördröjd) = +0,32 % band samma handelsdag — två intraday-stämplar, båda röda för sessionen (prev close-vyterna skiljer: SA 163,16 mot Yahoo seriens 166,24 = fredagsveckans fönster, dokumenterat)"
    }
  ],
  hamtat: "2026-09-21",
  pris: 163.52,
  marknadsKapitalMdr: 103.85,
  tillvaxt: {
    omsattningCAGR5ar: 0.0366,
    resultatCAGR5ar: 0.0815,
    omsattningTillvaxtTTM: -0.013,
    prognosTillvaxt: 0.2218
  },
  lonksamhet: {
    roe: 0.1397,
    roic: 0.093,
    bruttoMarginal: 0.6459,
    ebitMarginal: 0.1968,
    nettoMarginal: 0.1309,
    fcfMarginal: 0.0614
  },
  stabilitet: {
    skuldEgenkapital: 0.63,
    rantaTackning: 13.57,
    fcfPositivaSenaste5: 5,
    kassaManaderBurnRate: null,
    nyemissionerSenaste5ar: null
  },
  aterkop: {
    senasteArMdr: 1.955,
    andelUtestande: 0.0015,
    insiderkopSenaste6man: null
  },
  moat: {
    bruttoMarginalMedel5ar: 60.09,
    bruttoMarginalSpread5ar: 10.33,
    roeMedel5ar: null
  },
  vardering: {
    pe: 29.36,
    pb: 3.81,
    evEbit: 22.50,
    peg: 1.32,
    fcfYield: 0.016,
    egenKapitalMultipl: 3.81
  },
  golv: {
    typ: "osatt",
    vardePerAktie: null,
    margimal: null
  },
  serier: {
    ar: ["2021", "2022", "2023", "2024", "2025"],
    omsattning: [23335000000, 29934000000, 27608000000, 27058000000, 26940000000],
    resultat: [2572000000, 2759000000, 3078000000, 3306000000, 3518000000],
    egetKapital: [21999000000, 24572000000, 25043000000, 27621000000, 26947000000],
    fcf: [2654000000, 2537000000, 2870000000, 2797000000, 2675000000]
  },
  notering: "Frankrike/material 0→1 — Frankrikes ÅTTONDE gren (energi · fastighet · finans 5 · hälsa · industri · kommunikation · konsument 5 ⇒ +material; teknik återstår som enda lucka) och universumets FÖRSTA industriella gas-rad — oligopol-trion Air Liquide/Linde/Air Products representeras slutligen, moat-pedagogikens renaste arketyp: take-or-pay-kontrakt + distributionsnätens skalbarhet + växelkostnadernas vallgrav. SIGNATURTAL — COMPOUNDERNS ANATOMI: (1) MARGINALMOTORN PÅ INTÄKTSPLATÅN: omsättning 23,3→29,9→26,9 mdr € (2022 = energikrisens pristopp, sedan normalisering −0,4 % FY25) MEDAN netto 2,572→3,518 M € (resCAGR +8,15 %/år) och EPS 4,07→5,53 — platt intäktsbana + bruttomarginalens V-form 53,85→64,18 % (medel 60,09, spread 10,33 pp) + EBIT-marginal 16,83→19,68 % = vinsttillväxten borjar i marginalerna, inte i volymen (BASF-kontrasten i samma bransch); (2) UTDELNINGSLINJEN DPS 2,174→3,364 € (+11,5 %/år, sex tillväxtår enligt källan, kontinuitetsfamiljen sedan 1911) med payout 62 % — aterkop-blocket 1,955 mdr € betalt; (3) FY2026:FÖRVÄRVSSTEGET TTM Jun-26: skuld 13,65→17,26 mdr (+3,6) + goodwill 13,8→16,2 (+2,4) + nettoskuld 9,7→15,2 mdr € (net debt issued +4 235 M) — kapitalstruktur-risken stiger men räntetäckning 13,57 och Altman 3,42 håller gröna bältet; ROIC 9,30 % mot WACC 6,92 % = +2,38 pp (trång men positiv). VÄRDERINGENS TRIPEL: P/E 29,36 (premium-kvartilen i material — kvalitetspremien prissatt), P/B 3,81 på total-EK (common-bas 3,92 — BAS-SPLITTRA), P/FCF 62,55 (fcfYield 1,60 % — capex-cykeln 3,84 mdr TTM trycker kassaflödet; fcf-marginal 6,14 % mot EBIT-marginal 19,68 % = investeringstung fas). FIFO: Q3-försäljning 2026-10-23."
};

// skydd mot stavfel i golv-typen (5401.T-mallens fält)
rad.golv = { typ: "osatt", vardePerAktie: null, marginal: null };

u.push(rad);
const ut = JSON.stringify(u, null, 2) + "\n";
writeFileSync(UNI, ut);

// ── Läs tillbaka ×2 ──────────────────────────────────────────────────────────
const k1 = JSON.parse(readFileSync(UNI, "utf8")).length;
const k2 = JSON.parse(readFileSync(UNI, "utf8")).length;
if (k1 !== FÖRE + 1 || k2 !== FÖRE + 1) { console.error(`ABORT L2: läsbart ${k1}/${k2} mot väntat ${FÖRE + 1}`); process.exit(1); }
console.log(`UNIVERSUM: ${FÖRE}→${k1} rader (läs-tillbaka ×2 OK)`);

// ── Medianplacering EFTER ────────────────────────────────────────────────────
const u2 = JSON.parse(readFileSync(UNI, "utf8"));
const peMat = u2.filter((b) => b.bransch === "material").map((b) => b.vardering?.pe).filter((x) => typeof x === "number");
const peTot = u2.map((b) => b.vardering?.pe).filter((x) => typeof x === "number");
const placering = (arr, varde) => arr.filter((x) => x < varde).length;
console.log(`EFTER: material P/E median ${median(peMat).toFixed(1)} [P25 ${percentil(peMat, 0.25).toFixed(1)}–P75 ${percentil(peMat, 0.75).toFixed(1)}, n=${peMat.length}] · totalt ${median(peTot).toFixed(1)} (n=${peTot.length})`);
console.log(`AI.PA P/E 29,36 placering: material ${placering(peMat, 29.36) + 1}/${peMat.length} · universum ${placering(peTot, 29.36) + 1}/${peTot.length}`);
const resMat = u2.filter((b) => b.bransch === "material").map((b) => b.tillvaxt?.resultatCAGR5ar).filter((x) => typeof x === "number");
console.log(`material resCAGR median ${(median(resMat) * 100).toFixed(1)} % [P25 ${(percentil(resMat, 0.25) * 100).toFixed(1)}–P75 ${(percentil(resMat, 0.75) * 100).toFixed(1)}, n=${resMat.length}] — AI.PA +8,15 %`);
console.log(`FRANKRIKE grenar: ${[...new Set(u2.filter((b) => b.land === "Frankrike").map((b) => b.bransch))].length} (${[...new Set(u2.filter((b) => b.land === "Frankrike").map((b) => b.bransch))].join(" · ")})`);
