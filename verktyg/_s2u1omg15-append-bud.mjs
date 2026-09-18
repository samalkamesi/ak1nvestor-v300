#!/usr/bin/env node
/**
 * s2-u1 omg15 — APPEND Anheuser-Busch InBev (BUD, konsument, Belgien) till
 * data/portfolj-system/bolagsunivers.json (177→178). BELGIEN = 21:A LANDET
 * (omg14-u1:s "LÄMNAS FRIA"-koordinat); CARLSBERG-JÄMFÖRELSERADEN FÖDS
 * (öl-duon: världens största mot nordisk utmanare); SABMiller-skuldens
 * deleveraging-resa = universumets tyngsta skuldpedagogik.
 *
 * Metod (spårets etablerade sedan omg6; FCX-mallen omg14): textbaserad
 * kirurgisk insert före slut-]-parentesen (minimal diff; filens indent 1
 * enligt omg13-formatnotisen), idempotensguard, aritmetikverifierad FÖRE
 * skrivning (abort-grind — omg13-läxan: kontrollblock fångar stavfel FÖRE
 * disk), medianer/kvartiler före/efter med EXAKT replik av
 * raknaBranschMedianer (src/lib/dataset-medianer.ts), landmatta-svep.
 *
 * PROGNOS-KONVENTION: peFwd (16,79) > pe (16,67) ⇒ TTE −0,7 % (TTM-netto
 * +31 % uppsvällt av Q2-26) — negativt gap ⇒ prognosTillväxt-fältet UTELÄMNAS
 * och peg = null, exakt som AMZN/KAMBI/VOLCAR-B-raderna (sonderade omg15);
 * universumets FÖRSTA dokumenterat negativa TTE-gap i noteringen.
 *
 * marknadsKapitalMdr = 155,46 mdr USD i KO/BABA-majoritetskonventionen
 * (FCX:s 101740-miljö var avvikare; fältnamnets Mdr gäller).
 *
 * Data: stockanalysis.com NYSE-ADR BUD (översikt + statistics + financials +
 * cash-flow-statement + balance-sheet; underlag S&P Global Market
 * Intelligence), stängningskurs 2026-09-17 78,77 USD, sidor pålästa
 * 2026-09-18. Räkenskapsår = kalenderår (universumets huvudkonvention);
 * rapportering i USD sedan 2019 (ingen växelkursväg behövs).
 */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(FIL, "utf8");
const u = JSON.parse(raw);
if (!Array.isArray(u)) throw new Error("universumet är inte en array");
if (u.some((b) => b.ticker === "BUD")) {
  console.log("IDEMPOTENT: BUD finns redan — avslutar utan ändring");
  process.exit(0);
}
const fore = JSON.parse(raw); // färsk kopia för före-mätning

// ── BUD-rådata (miljoner USD; NYSE-ADR-kurs 2026-09-17) ──────────────────────
const R = {
  // 5 år brutto-underlag (FY2021 för moat-serien — pandemiåtets återhämtningsbas)
  oms5: [54304, 57786, 59380, 59768, 59320],
  brutto5: [31207, 31481, 31984, 33024, 33179],
  // serier 4 år (konventionen)
  oms: [57786, 59380, 59768, 59320],
  brutto: [31481, 31984, 33024, 33179],
  res: [5969, 5341, 5855, 6837],
  fcf: [8138, 8627, 11192, 11227],
  ocf: [13298, 13265, 15055, 14883],
  kapex: [5160, 4638, 3863, 3656],
  utd5: [2442, 3013, 2672, 4543], // utdelningar betalda (common)
  kop5: [0, 362, 937, 2301], // återköp (deleveraging först, sedan aktieägarström)
  pris: 78.77, mcapT: 155.46, // mdr USD
  shares: 1.97, // mdr
  pe: 16.67, peFwd: 16.79, pb: 1.54, bvps: 47.42,
  evEbit: 13.63, evEbitda: 11.56, ev: 228.23,
  roe: 0.1139, roic: 0.0801, roce: 0.0906, wacc: 0.0695, beta: 0.78,
  bruttoTtm: 0.5649, ebitTtm: 0.2675, nettoTtm: 0.149, fcfTtm: 0.2198,
  skuldEk: 0.72, rantaTackning: 5.07, skuldT: 72.73, kassaT: 8.01,
  ekCommon: 93.42, ekTotal: 101.19, ekTotalFy25: 97.736, minoritetFy25: 10.449,
  omsTtm: 62.615, resTtm: 9.327, fcfTtmAbs: 13.762, ocfTtm: 17.42, epsTtm: 4.64,
  utdAktie: 0.83, payout: 0.1783, ttmTillvaxt: 0.07,
  skatt: 0.2231, lv52: [58.33, 86.6], lv52Prestanda: 0.3597,
};

// CAGR endpoint FY2022→FY2025 = 3 perioder (VALE-konventionen: fältet heter
// 5ar men mäter seriens endpoint — den ärvda flaggan lever, 178:e raden)
const cagr3 = (a, b) => Math.pow(b / a, 1 / 3) - 1;
const omsCagr = cagr3(R.oms[0], R.oms[3]);
const resCagr = cagr3(R.res[0], R.res[3]);
const prognos = R.pe / R.peFwd - 1; // TTE-konventionen (trailing/fwd) = −0,7 %
const fcfYield = R.fcfTtmAbs / R.mcapT;
const bruttoSerie5 = R.brutto5.map((g, i) => g / R.oms5[i]);
const bruttoMedel = bruttoSerie5.reduce((a, b) => a + b, 0) / bruttoSerie5.length;
const bruttoSpread = Math.max(...bruttoSerie5) - Math.min(...bruttoSerie5);
const ebitTtmAbs = R.omsTtm * R.ebitTtm; // 16,750 mdr
const evEbitReplik = (R.mcapT + R.skuldT - R.kassaT) / ebitTtmAbs;
const pbReplik = R.mcapT / R.ekTotal;
const peIdentitet = R.mcapT / R.resTtm;
const roeReplik = R.resTtm / R.ekTotal;

const rad = {
  ticker: "BUD",
  namn: "Anheuser-Busch InBev SA/NV",
  bransch: "konsument",
  land: "Belgien",
  valuta: "USD",
  kallor: [
    {
      namn: "StockAnalysis",
      hamtat: "2026-09-18",
      url: "https://stockanalysis.com/stocks/bud/",
      paranoid:
        "NYSE-ADR BUD (översikt + statistics + financials + cash-flow-statement + balance-sheet; underlag S&P Global Market Intelligence; stängningskurs 2026-09-17): pris 78,77, mcap 155,46 mdr, EV 228,23, P/E 16,67 forward 16,79, P/B 1,54 (mcap/total equity 101,19 OCH not: pris/BVPS 78,77/47,42 = 1,66 common-bas — minoritetsspridningen dokumenterad), EV/EBIT 13,63 EV/EBITDA 11,56, marginaler TTM brutto 56,49 EBIT 26,75 netto 14,90 FCF 21,98, ROE 11,39/ROIC 8,01/ROCE 9,06/WACC 6,95, skuld/EK 0,72 (total equity-bas), räntetäckning 5,07×, nettoskuld 64,72 mdr (72,73 skuld − 8,01 kassa), utdelning 0,83 USD/ADR (1,05 %, payout 17,83 %; replik 0,83/4,64 = 17,89 % — aktiebas-spridning), återköpsavkastning 1,28 %, aktieägaravkastning 2,33 %, beta 0,78, 52-v 58,33–86,60 (+35,97 %), Altman Z 1,5, Piotroski F 8, effektiv skattesats 22,31 %, analytiker Köp (11 st, mål 97,03), institutioner 28,85 %, insiders 1,38 %, 136 805 anställda, oms/anställd 457 695 USD, intäktstillväxtprognos 3 år +5,67 %, EPS-prognos 3 år +13,38 %; bransch Consumer Staples/Brewers källkonsekvent med CARL-B.CO-familjen",
    },
  ],
  hamtat: "2026-09-18",
  pris: R.pris,
  marknadsKapitalMdr: R.mcapT,
  tillvaxt: {
    omsattningCAGR5ar: Math.round(omsCagr * 10000) / 10000,
    resultatCAGR5ar: Math.round(resCagr * 10000) / 10000,
    omsattningTillvaxtTTM: R.ttmTillvaxt,
    // prognosTillväxt UTELÄMNAS medvetet: TTE 16,67/16,79 − 1 = −0,7 % (negativt
    // gap) ⇒ peg-null-konventionen (AMZN/KAMBI/VOLCAR-B — sonderad omg15)
  },
  lonksamhet: {
    roe: R.roe,
    roic: R.roic,
    bruttoMarginal: R.bruttoTtm,
    ebitMarginal: R.ebitTtm,
    nettoMarginal: R.nettoTtm,
    fcfMarginal: R.fcfTtm,
  },
  stabilitet: {
    skuldEgenkapital: R.skuldEk,
    rantaTackning: R.rantaTackning,
    fcfPositivaSenaste5: null,
    kassaManaderBurnRate: null,
    nyemissionerSenaste5ar: null,
  },
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: null },
  moat: {
    bruttoMarginalMedel5ar: Math.round(bruttoMedel * 10000) / 10000,
    bruttoMarginalSpread5ar: Math.round(bruttoSpread * 10000) / 10000,
    roeMedel5ar: null,
  },
  vardering: {
    pe: R.pe,
    pb: R.pb,
    evEbit: R.evEbit,
    peg: null, // negativt TTE-gap ⇒ meningslöst (universumskonventionen)
    fcfYield: Math.round(fcfYield * 10000) / 10000,
    egenKapitalMultipl: R.pb,
  },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2022", "2023", "2024", "2025"],
    omsattning: R.oms,
    resultat: R.res,
    egetKapital: [],
    fcf: R.fcf,
  },
  notering:
    "BELGIEN = UNIVERSUMETS 21:A LAND (BABA/RY/Samsung/TCS/PBR-precedenskedjans nästa bricka; omg14-u1:s utpekade fria koordinat 'Belgien/BUD') och CARLSBERG-JÄMFÖRELSERADEN FÖDS: öl-duon som spårets bevisade mönster (NEM+FCX ädelmetall/basmetall, MBG+BMW tyska biltvillingar) — BUD P/E 16,7 · brutto 56,5 % · EBIT 26,8 % mot CARL-B 18,2 · 45,0 · 14,6: VÄRLDENS STÖRSTA BRYGGERIKONCERN mot nordisk utmanare, och efter tio års deleveraging LÄGRE skuld/EK än utmanaren (0,72 mot 1,34 — skuldresan klarad). AB INBEV = 500+ VARUMÄRKEN (Budweiser, Corona, Stella Artois, Michelob Ultra, Spaten, Beck's) i 150+ länder, 136 805 anställda, 0,458 MUSD omsättning per anställd, rötter till 1366 (Den Hoorn-bryggeriet Leuven — universumets äldsta företagslinje); huvudkontor Bryssel med SA/NV-dubbeljuridik (belgisk/schweizisk konventionsnot), NYSE-ADR BUD primär för USD-datan, rapportering i USD sedan 2019. SABMILLER-SKULDENS DELEVERAGING-RESA (universumets tyngsta skuldpedagogik — kontrasten mot BABA:s 17,5 mdr NETTOKASSA i omg9): förvärvet 2016 (~100 mdr USD) satte total skuld 88,9 mdr (FY2021) som nu är 72,7 — netto 64,7 mdr (72,73 − 8,01); EV 228,2 mot mcap 155,5 = SKULDANS SYNLIGHET I EV/EBIT-SPRIDNINGEN; FCF-trappan 8,1 → 8,6 → 11,2 → 11,2 mdr USD (FY2022–25, TTM 13,8) med capex fallande 5,2 → 3,7 mdr; utdelningarna betalda 2 442 → 3 013 → 2 672 → 4 543 mdr och återköpen 0 → 362 → 937 → 2 301 (TTM 1 701) — DELEVERAGING FÖRST, AKTIEÄGARSTRÖM EFTER: kapitalprioritetens lärobok. FCF-MASKINEN: FCF 13,8 mdr TTM på omsättning 62,6 = fcfYield 8,85 % (REPLIKERBAR EXAKT 13,762/155,46) och FCF-marginal 22,0 % — bland konsumentgrenens fetaste (KO/PEP-familjen), med payout blott 17,8 % (utdelningen 0,83 USD/ADR, 1,05 % direktavkastning): skuldprioriteten håller utdelningen låg trots maskinen. MOAT = STABILITET (VALE-KONTRASTEN): bruttomarginal 5 år inom 3,6 pp-band — 57,5 → 54,5 → 53,9 → 55,3 → 55,9 % (medel 55,4, spread 0,036) — prissättningsmakten över 500 varumärken håller genom pandemi/inflation/krona; Carlsbergs 45,0 % är vallgraven på nästa nivå ned. VÄRLDENS STÖRSTA-doktrinen: BUD brygger mer öl än nr 2+3 TILLSAMMANS (volym ~585 Mhl-familjen mot Heineken+Carlsberg). PROGNOS-GAPET NEGATIVT — UNIVERSUMETS FÖRSTA: forward P/E 16,79 ÖVER trailing 16,67 ⇒ TTE −0,7 %: TTM-nettot 9,3 mdr (+31,1 %) är uppsvällt (Q2-26-fönstret) och marknaden diskonterar normalisering; prognosTillväxt-fältet UTELÄMNAS och peg = null enligt AMZN/KAMBI/VOLCAR-B-konventionen (sonderad denna omgång — 29 null-peg-rader, 0 negativa); källans 3-års EPS-prognos +13,38 %/år och intäkt +5,67 %/år som kalibrerings-noter. MINORITETSPEDAGOGIKEN: total equity 101,2 mdr TTM inkluderar ~10,4 mdr minoritetsintressen (FY2025: total 97,736 − minoritet 10,449 = common 87,287 EXAKT; Ambev-kedjans konsolideringsstruktur) — P/B 1,54 på total-bas mot pris/BVPS 1,66 på common-bas (47,42 × 1,97 mdr); EV-repliken (mcap+skuld−kassa) 220,2 ÷ EBIT 16,75 = 13,15 mot källans 13,63 — källans EV 228,2 väger in minoritet/pension (källspridningsnot i VALE/005930.KS-familjen). KAPITALMARGINALKNAPP: ROIC 8,01 % mot WACC 6,95 % = +1,06 pp — skuldtung kapitalbas pressar marginalen (FCX +1,57 samma familj; konsultkontrasten TCS +61,2); ROE 11,39 % (källans common-bas) mot netto/total equity 9,2 % (replik-not). DUALITETEN: Altman Z 1,5 (lågt — skuldbördans signatur) MEDAN Piotroski F 8 (hög — rörelsens kvalitet): balansräkningens risk och resultaträkningens styrka i samma rad; räntetäckning 5,07×; beta 0,78 defensivt konsumentmonster; 52-vägers 58,33–86,60 (+36,0 %); institutioner 28,85 % (familjestrukturerat ägande — BUD:s fyra belgiska grundarfamiljer + Altria/BAT-blokken dokumenterat lågt flyt). Räkenskapsår kalenderår (universumets huvudkonvention); nästa rapport 2026-10-29 (Q3 2026 — samma FIFO-dag som VALE)",
};

// ── Aritmetikkontroller FÖRE skrivning (abort-grind: EN OLL ⇒ ingen disk) ──
const K = [];
const jfr = (namn, v, exp, tol = 5e-5) =>
  K.push([namn, Math.abs(v - exp) <= tol ? "GRÖN" : `OLL (${v} ≠ ${exp})`]);
jfr("omsCAGR endpoint 3 perioder 57 786→59 320", Math.round(omsCagr * 10000) / 10000, rad.tillvaxt.omsattningCAGR5ar);
jfr("resCAGR endpoint 3 perioder 5 969→6 837", Math.round(resCagr * 10000) / 10000, rad.tillvaxt.resultatCAGR5ar);
jfr("prognos-tecken: peFwd 16,79 > pe 16,67 ⇒ fält utelämnat", R.peFwd > R.pe ? 1 : 0, 1, 0);
jfr("peg = null (negativt TTE-gap)", rad.vardering.peg === null ? 1 : 0, 1, 0);
jfr("fcfYield 13,762/155,46", rad.vardering.fcfYield, Math.round(fcfYield * 10000) / 10000);
jfr("fcfYield mot källans 8,85 %", fcfYield, 0.0885, 0.0005);
jfr("direktavkastning 0,83/78,77", R.utdAktie / R.pris, 0.010536, 5e-6);
jfr("payout-replik DPS/EPS 0,83/4,64 mot källans 17,83 %", R.utdAktie / R.epsTtm, R.payout, 0.001);
jfr("P/E-identitet mcap/netto 155,46/9,327 = källans 16,67", peIdentitet, R.pe, 0.02);
jfr("EV/EBIT-replik (mcap+skuld−kassa)/EBIT = 13,15 mot källans 13,63 (EV-definitionsnot)", evEbitReplik, R.evEbit, 0.5);
jfr("P/B-replik mcap/total equity = 1,54", pbReplik, R.pb, 0.011);
jfr("pris/BVPS 78,77/47,42 — common-bas-notis", R.pris / R.bvps, 1.661, 0.001);
jfr("FCF-marginal 13,762/62,615 mot källans 21,98 %", R.fcfTtmAbs / R.omsTtm, 0.2198, 0.0005);
jfr("bruttomarginalserie 5 år (2021–2025) → medel", Math.round(bruttoMedel * 10000) / 10000, rad.moat.bruttoMarginalMedel5ar);
jfr("bruttospread max−min FY21→FY25 (0,5746−0,5386)", Math.round(bruttoSpread * 10000) / 10000, rad.moat.bruttoMarginalSpread5ar);
jfr("egenKapitalMultipl = pb", rad.vardering.egenKapitalMultipl, rad.vardering.pb);
jfr("serielängder 4/4/4 + moat 5", [R.oms.length, R.res.length, R.fcf.length, R.brutto5.length].join(""), "4445", 0);
jfr("ROE-replik-notis 9,327/101,19 = 9,2 % mot källans 11,39 (common-bas)", roeReplik, 0.092, 0.003);
jfr("minoritetsidentitet FY2025 total − minoritet = common", R.ekTotalFy25 - R.minoritetFy25, 87.287, 0.001);
jfr("nettoskuld 72,73−8,01 = källans 64,72", R.skuldT - R.kassaT, 64.72, 0.01);
jfr("marknadsKapitalMdr i KO/BABA-konvention (mdr)", rad.marknadsKapitalMdr, 155.46, 0);
const oll = K.filter(([, s]) => s !== "GRÖN");
for (const [n, s] of K) console.log(`KONTROLL ${s === "GRÖN" ? "✓" : "✗"} ${n}: ${s}`);
if (oll.length) {
  console.error(`ABORT: ${oll.length} kontroll(er) OLL — ingen skrivning sker`);
  process.exit(1);
}

// ── Kirurgisk textbaserad insert (minimal diff; filens indent = 1) ───────────
const nyRadJson = JSON.stringify(rad, null, 1)
  .split("\n")
  .map((l) => (l === "" ? "" : " " + l))
  .join("\n");
const slutIdx = raw.lastIndexOf("\n]");
if (slutIdx === -1) throw new Error("hittar inte slutparentesen");
const nyRaw = raw.slice(0, slutIdx) + ",\n " + nyRadJson + "\n]";
const efter = JSON.parse(nyRaw); // giltighetsbevis
writeFileSync(FIL, nyRaw);
console.log(`\nAPPEND: ${fore.length} → ${efter.length} rader (BUD tillagd)`);

// ── Medianreplik (EXAKT raknaBranschMedianer) ────────────────────────────────
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
const fPe = (b) => b.vardering?.pe, fPb = (b) => b.vardering?.pb,
  fEbit = (b) => b.lonksamhet?.ebitMarginal, fFcf = (b) => b.lonksamhet?.fcfMarginal,
  fTill = (b) => b.tillvaxt?.omsattningTillvaxtTTM, fRes = (b) => b.tillvaxt?.resultatCAGR5ar,
  fRoe = (b) => b.lonksamhet?.roe;

for (const [namn, data] of [["FÖRE (" + fore.length + ")", fore], ["EFTER (" + efter.length + ")", efter]]) {
  const kon = data.filter((b) => b.bransch === "konsument");
  const tot = data;
  console.log(`\n=== ${namn} ===`);
  console.log(`konsument: ${kon.length} bolag | P/E`, JSON.stringify(stat(kon, fPe, false)),
    "| P/B", JSON.stringify(stat(kon, fPb, false)));
  console.log(`konsument EBIT%:`, JSON.stringify(stat(kon, fEbit, true)),
    "FCF%:", JSON.stringify(stat(kon, fFcf, true)), "tillv%:", JSON.stringify(stat(kon, fTill, true)));
  console.log(`konsument ROE%:`, JSON.stringify(stat(kon, fRoe, true)), "resCAGR%:", JSON.stringify(stat(kon, fRes, true)));
  console.log(`TOTALT: P/E`, JSON.stringify(stat(tot, fPe, false)), "P/B", JSON.stringify(stat(tot, fPb, false)));
  console.log(`TOTALT resultatCAGR%:`, JSON.stringify(stat(tot, fRes, true)));
}

// ── Landmatta-svep (omg8-rättasens formel: P/E-matta, aldrig bolagstal) ──────
const matta = (data) => {
  const m = new Map();
  for (const b of data) {
    const k = `${b.land}/${b.bransch}`;
    if (typeof b.vardering?.pe === "number" && Number.isFinite(b.vardering.pe))
      m.set(k, (m.get(k) ?? 0) + 1);
  }
  return m;
};
const mFore = matta(fore), mEfter = matta(efter);
console.log("\n=== LANDMATTA Belgien/konsument ===");
console.log("före:", mFore.get("Belgien/konsument") ?? 0, "→ efter:", mEfter.get("Belgien/konsument") ?? 0, "(MIN_MATTA=5)");
const p4 = [...mEfter.entries()].filter(([, v]) => v === 4).map(([k]) => k);
const p2 = [...mEfter.entries()].filter(([, v]) => v === 2).map(([k]) => k);
console.log("celler på matta 4 (koordinater):", p4.join(", ") || "—");
console.log("celler på matta 2 (u3:s +3-lista):", p2.sort().join(", ") || "—");
const landEfter = new Set(efter.map((b) => b.land));
console.log("länder:", landEfter.size, "(Belgien tillagt som 21:a)");

// ── Slutlig verifiering: radens innehåll i filen ─────────────────────────────
const s = efter.find((b) => b.ticker === "BUD");
console.log("\nBUD i filen:", s ? `${s.ticker} ${s.namn} ${s.bransch}/${s.land} pe=${s.vardering.pe} pb=${s.vardering.pb} peg=${s.vardering.peg} fcfY=${s.vardering.fcfYield}` : "SAKNAS");
console.log("SUMMA kontroller GRÖNA:", K.filter(([, st]) => st === "GRÖN").length + "/" + K.length);
