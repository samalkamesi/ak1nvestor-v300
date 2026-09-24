#!/usr/bin/env node
/**
 * v209-u1 (manifest v209-datasetdjup-1789850833630, byggare 1/3 "+1 bolag") —
 * VESTAS WIND SYSTEMS (VWS.CO): idempotent append i bolagsunivers.json med
 * ARITMETIKGRIND + ABORT FÖRE skrivning (omg13-läxan), FÖRE/EFTER-medianreplik
 * (EXAKT replik av raknaBranschMedianer ur src/lib/dataset-medianer.ts — samma
 * hjälpare som _s2u3o20-llms-regen.mjs) och LÄCKAGEVAKT ×2 (universum läst två
 * gånger, samma antal båda gångerna — v209-KVD:n).
 */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/portfolj-system/bolagsunivers.json";

// ── medianreplik (dataset-medianer.ts, ordagrant som _s2u3o20-llms-regen.mjs) ──
const median = (v) => {
  const r = v.filter((x) => typeof x === "number" && Number.isFinite(x));
  if (!r.length) return null;
  const s = [...r].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const percentil = (v, p) => {
  const r = v.filter((x) => typeof x === "number" && Number.isFinite(x));
  if (!r.length) return null;
  const s = [...r].sort((a, b) => a - b);
  const pos = (s.length - 1) * p;
  const lo = Math.floor(pos), hi = Math.ceil(pos);
  return lo === hi ? s[lo] : s[lo] + (pos - lo) * (s[hi] - s[lo]);
};
const runda1 = (x) => Math.round(x * 10) / 10;
const stat = (rader, f, pct) => {
  const v = rader.map((b) => f(b) ?? null);
  const n = v.filter((x) => typeof x === "number" && Number.isFinite(x)).length;
  const omv = (x) => (x === null ? null : pct ? runda1(x * 100) : runda1(x));
  return { median: omv(median(v)), p25: omv(percentil(v, 0.25)), p75: omv(percentil(v, 0.75)), n };
};

// ── RÅDATA (källa: StockAnalysis CPH-primär, close 2026-09-18, hämtat 2026-09-19) ──
// DKK-panel (statistics/overview, TTM jun-2026): pris 207,00 · aktier 977,10 M ·
// mcap 202,26 mdr DKK · EV 201,63 · EPS 7,97 DKK · BV/aktie 30,10 · netto 8,25 ·
// EBIT 11,72 · bruttovinst 22,38 · EBITDA 15,60 · OCF 16,96 · capex 5,76 · FCF 11,19 ·
// P/E 25,99 · P/B 6,82 · EV/EBIT 17,04 · PEG 0,45 · fcfYield 5,53 % ·
// ROE 30,94 % · ROIC 32,15 % · WACC 8,98 % · brutto 14,75 % · EBIT 7,72 % · netto 5,43 % ·
// FCF 7,37 % · skuld 26,43 · EK 29,64 · D/E 0,89 · räntetäckning 9,12× · payout 8,88 % ·
// DPS 0,75 DKK · 52-v 113,55–220,20 · EPS-prognos 3Y 32,22 %/år · rev-prognos 3Y 8,29 %/år.
// EUR-serier (financials, koncernrapportvaluta, FY kalenderår): omsättning
// [15587,14486,15382,17295,18822] · netto [134,−1572,77,499,778] · brutto
// [1556,192,1283,2057,2497] · EK [4697,3060,3042,3542,3881] · FCF [480,−566,571,1662,1465].
const OMS = [15587, 14486, 15382, 17295, 18822];
const RES = [134, -1572, 77, 499, 778];
const BRU = [1556, 192, 1283, 2057, 2497];
const EK = [4697, 3060, 3042, 3542, 3881];
const FCF = [480, -566, 571, 1662, 1465];

const cagr = (ser) => Math.pow(ser[ser.length - 1] / ser[0], 1 / (ser.length - 1)) - 1;
const omsCagr = cagr(OMS);
const resCagr = cagr(RES);
const bruMarg = BRU.map((b, i) => b / OMS[i]);
const bruMedel = bruMarg.reduce((a, b) => a + b, 0) / bruMarg.length;
const bruSpread = Math.max(...bruMarg) - Math.min(...bruMarg);

// ── VESTAS-RADEN (kontraktet i noga enligt FMG.AX-förebilden omg18) ──────────
const vestas = {
  ticker: "VWS.CO",
  namn: "Vestas Wind Systems A/S",
  bransch: "energi",
  land: "Danmark",
  valuta: "DKK",
  kallor: [
    {
      namn: "StockAnalysis",
      hamtat: "2026-09-19",
      url: "https://stockanalysis.com/quote/cph/VWS/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/ + /financials/balance-sheet/)",
      paranoid:
        "CPH-PRIMÄRNOTERING (AMBU-precedensen: WebFetch-kanalen bar full panel på alla fem sidor; ADR/OTC-vägen VWDRY undveken — SSNLF-fällan), S&P Global Market Intelligence-underlag, close 2026-09-18 CEST: pris 207,00 DKK/202,26 mdr DKK; KONVENTION: DKK-kurs och DKK-paneler, FY-serier i EUR = koncernrapportvaluta EUR (BHP-mönstret) — multiplarna valuta-konsistenta inom måttet (P/E på DKK-mcap mot DKK-EPS), FX DKK/EUR ≈ 7,46 bevisad på EPS-identiteten (EUR-EPS 1,07 × 7,46 = 7,98 ≈ källans DKK-EPS 7,97) och EK/kassa/skuld (panel-EK 29,64 mdr DKK ÷ 7,46 = 3 973 M EUR mot FY2025-balansen 3 881 = TTM-vy; kassa 27,12 ÷ 7,46 = 3 636 mot 4 384 FY — TTM-fönstrets buyback −372 + utdelning −98 + capex −771 EUR M dokumenterade); P/E 25,99 (aktiebas 207÷7,97 = 25,97 — EPS-rundning dokumenterad; mcap÷netto 202,26÷8,25 = 24,52 = viktat aktieantal-läge, båda fönstren dokumenterade) forward 18,87 LÄGRE ⇒ POSITIVT prognosgap +27,3 % ⇒ prognosTillväxt bärs av källans 3-års-EPS +32,22 %/år (rev-prognos +8,29 %/år kalibrerar); PEG 0,45 källans fält (replik P/E÷3-års-EPS 25,99÷32,22 = 0,81 — källans PEG bygger på egen tillväxtbas, källspridningen dokumenterad, fältet bärs); P/B 6,82 (aktiebas 207÷30,10 = 6,88 — BV-rundning) EV/EBIT 17,04 (replik EV÷EBIT 201,63÷11,72 = 17,21, +1,0 % — VALE/BUD-familjens justerade EBIT-bas) EV/EBITDA 11,55 PS 1,33 P/FCF 18,07; brutto TTM 14,75 % (EUR-fönstret 2 993÷20 298 = 14,75 — ENDA inte-två-fönstriga marginalen: DKK och EUR ger samma tal) EBIT 7,72 % (EUR 7,73 %) netto 5,43 % (EUR 5,43 %) FCF 7,37 % (EUR 7,38 % — statistics-panelsidans bärs, SOON/HEN3-precedensen); ROE 30,94 % ROIC 32,15 % MOT WACC 8,98 % (spread +23,2 pp — kvalitetsänder efter förluståret; källans ROIC>ROE = EK-mindre nämnarmetodik, ROCE 16,13 % dokumenterad som motpol) ROA 3,75 %; skuld 26,43 mdr DKK kassa 27,12 ⇒ NETTOKASSA 0,69 mdr DKK (EUR-balansen 3 374 skuld/4 384 kassa = nettokassa 1 010 EUR M FY-läget) skuld/EK 0,89 (replik 26,43÷29,64 = 0,8917 EXAKT) räntetäckning 9,12× Altman 1,73 Piotroski 7; aktier 977,10 M (källans YoY +5,02 %/float>aktier = panelartefakt, buybacks −282 EUR M FY2025/−372 TTM dokumenterade som underliggande flytt) EPS TTM 7,97 DKK; TTM=jun-2026: oms 20 298 EUR M (+9,5 % översikts- och financials-fönstret enade) netto 1 103 (+57,1 % FY-växten) OCF 2 268 capex 771 ⇒ FCF 1 497 (fcfYield 5,53 % = 11,19÷202,26 EXAKT); utdelning 0,75 DKK/aktie (0,36 %) payout 8,88 % källans fält; insiders 0,08 % institutioner 37,05 %; beta 0,99; 52-v 113,55–220,20 (+77,7 %); 39 520 anställda; analytiker Buy 216,22 DKK (+4,4 %, 25 st); nästa rapp 2026-11-11; orderbacklog €36 mdr rekord (Q1-2026) — branschfältet energi källkonsekvent med ORSTED i cellen. FY kalenderår (dansk konvention, januari–december)",
    },
  ],
  hamtat: "2026-09-19",
  pris: 207.0,
  marknadsKapitalMdr: 202.26,
  tillvaxt: {
    omsattningCAGR5ar: Math.round(omsCagr * 10000) / 10000,
    resultatCAGR5ar: Math.round(resCagr * 10000) / 10000,
    omsattningTillvaxtTTM: 0.0954,
    prognosTillvaxt: 0.3222,
  },
  lonksamhet: {
    roe: 0.3094,
    roic: 0.3215,
    bruttoMarginal: 0.1475,
    ebitMarginal: 0.0772,
    nettoMarginal: 0.0543,
    fcfMarginal: 0.0737,
  },
  stabilitet: {
    skuldEgenkapital: 0.89,
    rantaTackning: 9.12,
    fcfPositivaSenaste5: null,
    kassaManaderBurnRate: null,
    nyemissionerSenaste5ar: null,
  },
  aterkop: {
    senasteArMdr: null,
    andelUtestande: null,
    insiderkopSenaste6man: null,
  },
  moat: {
    bruttoMarginalMedel5ar: Math.round(bruMedel * 10000) / 10000,
    bruttoMarginalSpread5ar: Math.round(bruSpread * 10000) / 10000,
    roeMedel5ar: null,
  },
  vardering: {
    pe: 25.99,
    pb: 6.82,
    evEbit: 17.04,
    peg: 0.45,
    fcfYield: 0.0553,
    egenKapitalMultipl: 6.82,
  },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2021", "2022", "2023", "2024", "2025"],
    omsattning: OMS.map((x) => x * 1e6),
    resultat: RES.map((x) => x * 1e6),
    egetKapital: EK.map((x) => x * 1e6),
    fcf: FCF.map((x) => x * 1e6),
  },
  notering:
    "VINDKRAFT-TILLVERKARENS VÄNDBÅGE — dansk energi-cells P/E-BÄRARE (ORSTED.CO bär pe=null efter förluståren; Vestas blir cellens FÖRSTA mätbara P/E och dess största bolag 202,3 mdr DKK mot Ørsteds 172,3): logistik- och stålkostnadschocken 2022 = seriens botten (netto −1 572 M EUR, bruttomarginal 1,3 %, EK 4 697 → 3 060) och därefter prisdisciplinens vändning: bruttomarginal 1,3 → 8,3 → 11,9 → 13,3 % (+12,0 pp på fyra år — fabriksdisciplin och serviceandelen, cellens Ørsted-kontrast: utvecklarens havsvind-förlustår mot tillverkarens marginalvändning); netto 77 → 499 → 778 M EUR (endpoint +55,2 %/år på omsättning +4,8 %/år) med TTM-jun-2026 på 1 103 M EUR (+41,7 % över FY2025) och EBIT-marginal 7,7 % TTM; orderbacklog €36 mdr rekord. MOAT-SIGNATUREN ÄR SPREADEN: bruttomarginal-medel 5 år 9,0 % med spread 11,9 pp = VINDKRAFTENS CYKELKÄRNA — priset på stål, logistik och turbinkontraktstyrning avgör marginalen, inte varumärket (mot BAS.DE 0,6 pp och V 0,4 pp: commoditetsgrenen av universumet); ROIC 32,2 % mot WACC 9,0 % = +23,2 pp efter vändningen, NETTOKASSA 0,69 mdr DKK, räntetäckning 9,1× — balansräkningen överlevde bottenåret (skuld/EK topp 1,11 i EK-dipen 2022 → 0,89). UTDELNINGEN ÄR UNG: DPS 0,75 DKK (0,36 %) payout 8,9 % + buybacks 282 EUR M FY2025 — tillverkarens återbäring följer marginalvändningen (mot FMG:s 88 % payout på cykeltoppen: cykelbolagets utdelning speglar VAR I CYKELN, inte policy). PEG 0,45 källans fält på 3-års-EPS +32,22 %/år (positivt prognosgap +27,3 %: forward 18,87 mot trailing 25,99 — vändningsårets signatur, BUD-konventionens motsatta pol); fcfYield 5,53 % med FCF-dip 2022 (−566 M EUR) som seriens lärdom: working capital i backlog-tillväxt äter kassan kort sikt. Bokföringsår kalenderår (dansk konvention); CPH-primär i DKK, koncernrapportvaluta EUR (RACE-mönstret: kursvaluta ≠ serievaluta dokumenterad; FX DKK/EUR ≈ 7,46 bevisad på EPS/EK/kassa-identiteter). Nästa rapp 2026-11-11.",
};

// ── ARITMETIKGRIND (ABORT FÖRE skrivning — omg13-läxan) ───────────────────────
const kontroller = [];
const K = (namn, faktiskt, vantat, tolerans = 0) => {
  const avvik = tolerans ? Math.abs(faktiskt - vantat) / Math.abs(vantat) : Math.abs(faktiskt - vantat);
  const ok = avvik <= tolerans;
  kontroller.push({ namn, faktiskt, vantat, ok, avvik: runda1(avvik * 1000) / 10 });
  return ok;
};
let gron = true;
gron &= K("mcap-replik 977,10×207 = 202 260 M", 977.1e6 * 207, 202.26e9, 0.005);
gron &= K("fcfYield 11,19/202,26", 11.19 / 202.26, 0.0553, 0.01);
gron &= K("P/E aktiebas 207/7,97", 207 / 7.97, 25.99, 0.01);
gron &= K("P/B aktiebas 207/30,10", 207 / 30.1, 6.82, 0.02);
gron &= K("EV/EBIT replik 201,63/11,72", 201.63 / 11.72, 17.04, 0.02);
gron &= K("skuld/EK replik 26,43/29,64", 26.43 / 29.64, 0.89, 0.01);
gron &= K("bruttoMarginal DKK 22,38/151,75", 22.38 / 151.75, 0.1475, 0.005);
gron &= K("ebitMarginal DKK 11,72/151,75", 11.72 / 151.75, 0.0772, 0.005);
gron &= K("nettoMarginal DKK 8,25/151,75", 8.25 / 151.75, 0.0543, 0.005);
gron &= K("fcfMarginal DKK 11,19/151,75", 11.19 / 151.75, 0.0737, 0.005);
gron &= K("bruttoMarginal EUR 2993/20298", 2993 / 20298, 0.1475, 0.005);
gron &= K("nettoMargin EUR 1103/20298", 1103 / 20298, 0.0543, 0.005);
gron &= K("FX-identitet EPS 1,07×7,46≈7,97", 1.07 * 7.46, 7.97, 0.01);
gron &= K("TTM-netto EUR→DKK 1103×7,46≈8250", 1103e6 * 7.46, 8.25e9, 0.01);
gron &= K("omsCAGR (18822/15587)^(1/4)−1", omsCagr, 0.0483, 0.0005);
gron &= K("resCAGR (778/134)^(1/4)−1", resCagr, 0.5524, 0.0005);
gron &= K("moat bruttoMedel 5år", bruMedel, 0.0896, 0.0005);
gron &= K("moat bruttoSpread 5år", bruSpread, 0.1194, 0.0005);
gron &= K("serielängder 5=5=5=5=5", new Set([OMS.length, RES.length, EK.length, FCF.length, BRU.length, 5]).size, 1, 0);
gron &= K("prognosgap positivt (forward<trailing)", 18.87 < 25.99 ? 1 : 0, 1, 0);
gron &= K("ROIC−WACC spread +23,2pp", 0.3215 - 0.0898, 0.2317, 0.001);
console.log("ARITMETIKGRIND:");
for (const k of kontroller) console.log(` ${k.ok ? "✅" : "❌"} ${k.namn}: ${k.faktiskt} mot ${k.vantat} (avvik ${k.avvik}%)`);
if (!gron) {
  console.error("ABORT: aritmetikgrind RÖD — inget skrivs (omg13-läxan).");
  process.exit(1);
}
console.log(`ARITMETIKGRIND GRÖN: ${kontroller.filter((k) => k.ok).length}/${kontroller.length} kontroller`);

// ── FÖRE-läget + medianreplik ─────────────────────────────────────────────────
const forr = JSON.parse(readFileSync(FIL, "utf8"));
const foreTotPe = stat(forr, (b) => b.vardering?.pe, false);
const foreEnergi = forr.filter((b) => b.bransch === "energi");
const foreEnergiPe = stat(foreEnergi, (b) => b.vardering?.pe, false);
const foreEnergiBrutto = stat(foreEnergi, (b) => b.lonksamhet?.bruttoMarginal, true);
const foreEnergiRoe = stat(foreEnergi, (b) => b.lonksamhet?.roe, true);
console.log(`FÖRE: ${forr.length} bolag · totalt P/E ${foreTotPe.median} (n=${foreTotPe.n}) · energi P/E ${foreEnergiPe.median} (n=${foreEnergiPe.n})`);

// idempotens: redan där?
const befintlig = forr.findIndex((b) => b.ticker === "VWS.CO");
if (befintlig !== -1) {
  console.error(`VWS.CO finns redan på index ${befintlig} — idempotent körmekanism; ABORT utan skrivning.`);
  process.exit(0);
}

// ── APPEND + json-bevis ───────────────────────────────────────────────────────
const nya = [...forr, vestas];
const gamlaIdentiska = nya.slice(0, -1).every((b, i) => JSON.stringify(b) === JSON.stringify(forr[i]));
if (!gamlaIdentiska) {
  console.error("ABORT: gamla rader förändrade i append — kontraktbrott.");
  process.exit(1);
}
// Indentering 1 = filens kontrakt (objekt på 1 space, fält på 2) — stringify(…,2)
// skriver om ALLA 18 407 rader och begraver diffen; första försökets läxa.
writeFileSync(FIL, JSON.stringify(nya, null, 1) + "\n");
console.log(`APPEND: ${forr.length}→${nya.length} · json-bevis: 0 gamla rader förändrade · indentering 1`);

// ── LÄCKAGEVAKT ×2 (v209-KVD: universum läst två gånger, samma antal) ─────────
const las1 = JSON.parse(readFileSync(FIL, "utf8")).length;
const las2 = JSON.parse(readFileSync(FIL, "utf8")).length;
console.log(`LÄCKAGEVAKT ×2: läsning 1 = ${las1} · läsning 2 = ${las2} · ${las1 === las2 && las1 === nya.length ? "GRÖN (samma antal båda gångerna)" : "RÖD"}`);
if (las1 !== las2 || las1 !== nya.length) process.exit(1);

// ── EFTER-medianreplik (kvartiler + universumjämförelse) ──────────────────────
const efter = JSON.parse(readFileSync(FIL, "utf8"));
const efterTotPe = stat(efter, (b) => b.vardering?.pe, false);
const efterEnergi = efter.filter((b) => b.bransch === "energi");
const efterEnergiPe = stat(efterEnergi, (b) => b.vardering?.pe, false);
const efterEnergiBrutto = stat(efterEnergi, (b) => b.lonksamhet?.bruttoMarginal, true);
const efterEnergiRoe = stat(efterEnergi, (b) => b.lonksamhet?.roe, true);
const totRes = stat(efter, (b) => b.tillvaxt?.resultatCAGR5ar, true);
console.log("MEDIANER FÖRE→EFTER (EXAKT raknaBranschMedianer-replik):");
console.log(`  totalt P/E: ${foreTotPe.median} (kv ${foreTotPe.p25}–${foreTotPe.p75}, n ${foreTotPe.n}) → ${efterTotPe.median} (kv ${efterTotPe.p25}–${efterTotPe.p75}, n ${efterTotPe.n})`);
console.log(`  energi P/E: ${foreEnergiPe.median} (kv ${foreEnergiPe.p25}–${foreEnergiPe.p75}, n ${foreEnergiPe.n}) → ${efterEnergiPe.median} (kv ${efterEnergiPe.p25}–${efterEnergiPe.p75}, n ${efterEnergiPe.n})`);
console.log(`  energi brutto: ${foreEnergiBrutto.median} % → ${efterEnergiBrutto.median} % · energi ROE: ${foreEnergiRoe.median} % → ${efterEnergiRoe.median} %`);
console.log(`  universumjämförelserad (llms-format): energi P/E ${efterEnergiPe.median} mot universumets ${efterTotPe.median} (n=${efterTotPe.n} av ${efter.length})`);
