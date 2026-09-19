#!/usr/bin/env node
/**
 * s2-u1 omg17 — APPEND Volkswagen AG (VOW3.DE, konsument, Tyskland) till
 * data/portfolj-system/bolagsunivers.json (189→190 i mitt fönster; disk-
 * glidning beaktad — syskon u2 +2 / u3 +3 kan landa parallellt; idempotens-
 * guard + append SIST i arrayen orör deras rader, BASF/EMBJ-precedensen).
 *
 * TYSKA BILTRION KOMPLETT: MBG.DE (Mercedes-Benz) · BMW.DE (BMW) · VOW3
 * (Volkswagen) — och universumets FÖRSTA PREFERENSAKTIE (Vorzugsaktie utan
 * rösträtt). Tyskland/konsument-cell 2→3.
 *
 * Metod (FCX-mallen omg14, spårets etablerade): textbaserad kirurgisk
 * insert före slut-]-parentesen (minimal diff; filens indent 1),
 * idempotensguard, aritmetikverifierad FÖRE skrivning (abort-grind —
 * omg13-läxan: kontrollblock fångar stavfel FÖRE disk), medianer/kvartiler
 * före/efter med EXAKT replik av raknaBranschMedianer
 * (src/lib/dataset-medianer.ts), landmatta-svep enligt omg8-rättasen.
 *
 * Data: stockanalysis.com /quote/etr/VOW3/ (översikt + statistics +
 * financials + cash-flow-statement + balance-sheet; underlag S&P Global
 * Market Intelligence + Fiscal.ai), Xetra-slutkurs 2026-09-18 VERIFIERAD
 * mot Yahoo Finance (76,52 EUR; OHLC + volym identiska), sidor pålästa
 * 2026-09-19. Financials i miljoner EUR, räkenskapsår = kalenderår.
 */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(FIL, "utf8");
const u = JSON.parse(raw);
if (!Array.isArray(u)) throw new Error("universumet är inte en array");
if (u.some((b) => /VOW|VWAGY/i.test(b.ticker))) {
  console.log("IDEMPOTENT: VOW/VWAGY finns redan — avslutar utan ändring");
  process.exit(0);
}
const fore = JSON.parse(raw); // färsk kopia för före-mätning

// ── VOW3-rådata (EUR-serier i miljoner; ETR-preferensaktie) ──────────────────
const R = {
  // 5 år brutto-underlag (FY2021 för moat-serien — toppåret)
  oms5: [250200, 279050, 322284, 324656, 321913],
  brutto5: [44519, 49515, 58223, 55961, 45345],
  // serier 5 år (GALE-konventionen omg16: 5 år när källan bär det)
  oms: [250200, 279050, 322284, 324656, 321913],
  res: [14843, 14881, 15947, 10721, 6673], // netto EFTER minoriteter (resultaträkningsraden)
  fcf: [27978, 15548, 4703, -51, -290],
  ocf: [38633, 28496, 19356, 17151, 15009],
  kapex: [10655, 12948, 14653, 17202, 15299],
  minoritet5: [1705, 12952, 14218, 14437, 14777],
  pris: 76.52, mcapT: 38.36, // mdr EUR (501,30 M aktier × 76,52; källans display 38,25 = intraday −0,3 %)
  pe: 7.32, peFwd: 2.94, pb: 0.19, epsTtm: 10.46,
  evEbit: 18.26, evEbitda: 12.12, evKalla: 267.12, // källans EV mdr EUR
  roe: 0.0276, roic: 0.0235, roce: 0.0322, wacc: 0.0193, beta: 0.99,
  bruttoTtm: 0.1377, ebitTtm: 0.0418, nettoTtm: 0.0163, fcfTtm: 0.0097,
  skuldEk: 1.39, rantaTackning: 3.96, skuldT: 280.904, kassaT: 66.774,
  minoritetT: 14.738, ekTotalT: 202.460, ekCommonT: 187.722, // mdr EUR, TTM Jun-30 2026
  omsTtm: 321.651, resTtm: 5.242, fcfTtmAbs: 3.128,
  utdAktie: 5.26, payoutKalla: 0.57, ttmTillvaxt: -0.0079,
  lv52: [69.2, 109.15], lv52Prestanda: -0.2274,
  aktier: 501.30, // M aktier (206,21 M preferens + 295,09 M ordinära ≈ — källans Shares Out)
};

// CAGR endpoint FY2021→FY2025 = 4 perioder — båda endpoints POSITIVA ⇒
// resultatCAGR ÄR definierbar (BA-spegeln: VW:s är bara djupt negativ)
const cagr4 = (a, b) => Math.pow(b / a, 1 / 4) - 1;
const omsCagr = cagr4(R.oms[0], R.oms[4]);
const resCagr = cagr4(R.res[0], R.res[4]);
const prognos = R.pe / R.peFwd - 1; // TTE-konventionen (trailing/fwd)
const peg = R.pe / (prognos * 100); // spårkonvention (HSBC/MA/ASML/EMBJ)
const fcfYield = R.fcfTtmAbs / R.mcapT;
const bruttoSerie5 = R.brutto5.map((g, i) => g / R.oms5[i]);
const bruttoMedel = bruttoSerie5.reduce((a, b) => a + b, 0) / bruttoSerie5.length;
const bruttoSpread = Math.max(...bruttoSerie5) - Math.min(...bruttoSerie5);
const peIdentitet = R.pris / R.epsTtm;
const pbReplik = R.mcapT / R.ekTotalT; // källans bas: total equity INKL minoriteter
const pbCommon = R.mcapT / R.ekCommonT;
const evReplikInklMinoritet = R.mcapT + R.skuldT - R.kassaT + R.minoritetT;
const mcapReplik = (R.aktier * R.pris) / 1000; // mdr
const direkt = R.utdAktie / R.pris;
const payoutReplik = R.utdAktie / R.epsTtm;
const evEbitReplikRa = R.evKalla / 13.429; // på rå EBIT TTM
const segSum = 217299 + 41517 + 57853; // FY2025-segment (Power Engineering avyttrat, fanns t.o.m. FY2024)

const rad = {
  ticker: "VOW3.DE",
  namn: "Volkswagen AG",
  bransch: "konsument",
  land: "Tyskland",
  valuta: "EUR",
  kallor: [
    {
      namn: "StockAnalysis",
      hamtat: "2026-09-19",
      url: "https://stockanalysis.com/quote/etr/VOW3/ (+ /statistics/ + /financials/)",
      paranoid:
        "ETR:XETRA-noteringen VOW3 (preferensaktien — källan redirectar ej, ordinära VOW noteras separat): översikt + statistics + financials + financials/cash-flow-statement + financials/balance-sheet; underlag S&P Global Market Intelligence + Fiscal.ai; Xetra-slutkurs 2026-09-18 = 76,52 EUR OBEROENDE VERIFIERAD mot Yahoo Finance (öppning 80,26 · högt 80,50 · lågt 74,96 · volym 8 287 568 — alla identiska; dag −5,58 %), mcap 38,36 mdr EUR på 501,30 M aktier (källans display 38,25 mdr = intradayögonblick −0,3 %, dokumenterat); P/E 7,32 replikerbar (76,52/10,46 = 7,316 — +0,05 %) forward 2,94, P/B 0,19 på TOTAL equity 202,46 mdr INKL minoriteter 14,74 mdr (på common equity 187,72 = 0,20), EV 267,12 mdr REPLIKERBAR (38,36+280,90−66,77+14,74 = 267,23 — +0,04 %; minoritetsposten BEVISAD av EV-repliken, EMBJ-mönstret), EV/EBIT 18,26 (källans normaliseringsbas — replik på rått EBIT TTM 13,43 mdr ger 19,89 = +8,9 % källspridning, JNJ/BUD/SOON-klassen) EV/EBITDA 12,12, marginaler TTM (brutto 13,77/EBIT 4,18/netto 1,63/FCF 0,97 % — statistics-vyns 1,80 %-netto är källspridning, financials-sidans marginalrad används), ROE 2,76/ROIC 2,35/ROCE 3,22/WACC 1,93 (källans låga WACC-not är modellnot, dokumenterad), skuld/EK 1,39 på total equity, räntetäckning 3,96×, DPS 5,26 EUR (6,87 %; källans payout 57,0 % på justerat bas-EPS — DPS/EPS-replik 50,3 %, källspridningsnot), beta 0,99 (5 år), 52-v 69,20–109,15 (−22,74 %; lågpunkten 1 juli 2026, toppen 15 dec 2025 enligt Yahoo), effektiv skattesats 27,79 %, institutioner 11,72 %, 594 022 anställda, oms/anställd 541 480 EUR; branschfältet Consumer Cyclical källkonsekvent med MBG/BMW-raderna",
    },
  ],
  hamtat: "2026-09-19",
  pris: R.pris,
  marknadsKapitalMdr: Math.round(R.mcapT * 100) / 100,
  tillvaxt: {
    omsattningCAGR5ar: Math.round(omsCagr * 10000) / 10000,
    resultatCAGR5ar: Math.round(resCagr * 10000) / 10000,
    omsattningTillvaxtTTM: R.ttmTillvaxt,
    prognosTillvaxt: Math.round(prognos * 10000) / 10000,
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
    peg: Math.round(peg * 100) / 100,
    fcfYield: Math.round(fcfYield * 10000) / 10000,
    egenKapitalMultipl: R.pb,
  },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2021", "2022", "2023", "2024", "2025"],
    omsattning: R.oms.map((x) => x * 1e6),
    resultat: R.res.map((x) => x * 1e6),
    egetKapital: [],
    fcf: R.fcf.map((x) => x * 1e6),
  },
  notering:
    "TYSKA BILTRION KOMPLETT I UNIVERSUMET — MBG.DE (Mercedes-Benz) · BMW.DE (BMW) · VOW3.DE (Volkswagen) = världens tre största tyska biltillverkare, och med Toyota (Japan) + Volvo är den globala bilmängden komplett: VW är volymmässigt världens största biltillverkare (tio märken från Audi till Škoda) men handlas till P/B 0,19 — EN FEMTEDEL av bokfört eget kapital, universumets första bolag under 0,2: substansrabatten ÄR casestudiet. UNIVERSUMETS FÖRSTA PREFERENSAKTIE: VOW3 = Vorzugsaktie utan rösträtt (ordinärie VOW noteras separat, 76,15 EUR samma dag) — Porsche-Piëch-familjens kontroll bär ordinärieaktierna, preferensaktien bär utdelningsrätten; likviditeten ligger på VOW3 (källans volym 8,3 M). MINORITETSPOSTENS FÖDELSEBERÄTTELSE: 1,7 mdr (FY2021) → 13,0 (FY2022) = Porsche AG-konsolideringen — och EV-repliken bevisar posten än (38,36+280,90−66,77+14,74 = 267,23 mot källans 267,12). BALANSRÄKNINGENS TVÅ VÄRLDAR: total skuld 280,9 mdr EUR mot kassa 66,8 = netto −214,1 mdr — men Financial Services-divisionen bär 176,1 mdr av utlåningen (bank-i-bolaget: 72,8 kortfristigt + 103,3 långfristigt): bilbankens skuld är inte tillverkningens skuld, och P/B 0,19 speglar att marknaden vägrar betala bokfört värde på kapital som är utlåat till bilköpare. SEGMENTSPLIT FY2025 (EUR M): Personvagnar & LCV 217 299 · Lastbilar (Traton) 41 517 · Financial Services 57 853 · Power Engineering avyttrat (sista året FY2024: 4 332) — summa 316 669 + koncernjustering 5 244 = 321 913 EXAKT (intern konsistensbevis). MARGINALKOLLAPSEN ÄR BERÄTTELSEN: brutto 17,79 → 14,09 % (FY2021→2025), EBIT 7,72 → 4,11, netto 5,93 → 2,07; resultat 14 843 → 6 673 M EUR (resultatCAGR −18,1 %/år — definierbar, båda endpoints positiva, BA-spegeln: där Embraer förlorade CAGR-räckvidden förlorade VW 45 % av resultatet). FCF-SVEPET: 27 978 → 15 548 → 4 703 → −51 → −290 M EUR (FY2021→2025) med TTM +3 128 — capex-toppen 17 202 (FY2024) är el-omställningens pris och kinesiska konkurrenters marginaltryck; fcfYield 8,15 % på TTM-vändningen (P/FCF 12,23 replik +0,3 %). VARDERING: P/E 7,32 mot forward 2,94 ⇒ prognosTillväxt +149,0 % (TTE-konventionen) — normaliseringsgap-listans övre region (Holcim +479 · VW +149 · BABA +85 · FCX +72); PEG 0,05 spårkonvention (formellt lågt MEN på ett gap som är konsensusgrafens lutning, inte en observation — källans PEG 0,13 på 3-årsbas som kalibrering); direktavkastning 6,87 % på DPS 5,26 efter skärningar 9,06 → 6,36 → 5,26 (−17,3 %/år) med payout-replik 50,3 % mot källans 57,0 % på justerat bas-EPS. KAPITALMARGINALKNAPP: ROIC 2,35 % mot WACC 1,93 % = +0,42 pp — universumets trängsta marginalklyfta (Siemens +4,0-klassen är bred; VW:s kapital knappt täcker sin kostnad i botten av cykeln). RÖRLIGHET: beta 0,99; 52-v −22,74 % (69,20 den 1 juli 2026 — 109,15 den 15 dec 2025); fredagen 2026-09-18 föll aktien −5,58 % (81,04 → 76,52, båda identifierade). Räkenskapsår kalenderår; Q2 2026 rapporterad (TTM Jun-30-2026) — nästa rapp Q3 2026 onsdagen 2026-10-29 (källans earnings date), MBG 10-23/BMW 11-4-tidsfönstret runt om",
};

// ── Aritmetikkontroller FÖRE skrivning (abort-grind: ENDA OLL ⇒ ingen disk) ──
const K = [];
const jfr = (namn, v, exp, tol = 5e-5) =>
  K.push([namn, Math.abs(v - exp) <= tol ? "GRÖN" : `OLL (${v} ≠ ${exp})`]);
jfr("omsCAGR endpoint 4 perioder 250 200→321 913", Math.round(omsCagr * 10000) / 10000, rad.tillvaxt.omsattningCAGR5ar);
jfr("resultatCAGR endpoint 4 perioder 14 843→6 673", Math.round(resCagr * 10000) / 10000, rad.tillvaxt.resultatCAGR5ar);
jfr("prognosTillväxt TTE 7,32/2,94", Math.round(prognos * 10000) / 10000, rad.tillvaxt.prognosTillvaxt);
jfr("PEG 0,05 spårkonvention", rad.vardering.peg, Math.round((R.pe / (prognos * 100)) * 100) / 100);
jfr("fcfYield 3,128/38,36", rad.vardering.fcfYield, Math.round(fcfYield * 10000) / 10000);
jfr("mcap-replik 501,30 × 76,52 = 38,36 mdr", mcapReplik, R.mcapT, 0.005);
jfr("P/E-identitet 76,52/10,46 mot källans 7,32", peIdentitet, R.pe, 0.02);
jfr("P/B-replik mcap/totalEkv 38,36/202,46 = 0,19", pbReplik, R.pb, 0.011);
jfr("P/B common-bas-notis 38,36/187,72 = 0,20", pbCommon, 0.2, 0.011);
jfr("EV-replik inkl minoritet 267,23 mot källans 267,12 (+0,04 %)", evReplikInklMinoritet, R.evKalla, 0.12);
jfr("minoritetspost 14,738 mdr = balansräkningens rad", R.minoritetT, 14.738, 0);
jfr("EV/EBIT-källspridning: rå replik 267,12/13,429 = 19,89", evEbitReplikRa, 19.89, 0.011);
jfr("bruttomarginalserie 5 år (2021–2025) → medel", Math.round(bruttoMedel * 10000) / 10000, rad.moat.bruttoMarginalMedel5ar);
jfr("bruttospread max−min FY21→FY25", Math.round(bruttoSpread * 10000) / 10000, rad.moat.bruttoMarginalSpread5ar);
jfr("egenKapitalMultipl = pb", rad.vardering.egenKapitalMultipl, rad.vardering.pb);
jfr("serielängder 5/5/5 + moat 5", [R.oms.length, R.res.length, R.fcf.length, R.brutto5.length].join(""), "5555", 0);
jfr("direktavkastning 5,26/76,52 = 6,87 %", direkt, 0.0687, 5e-5);
jfr("payout-replik DPS/EPS 5,26/10,46 = 50,3 %", payoutReplik, 0.5029, 5e-4);
jfr("skuld/EK 280,904/202,46 = 1,39", 280.904 / 202.46, R.skuldEk, 0.005);
jfr("segmentsumma FY2025 316 669 + justering = 321 913", segSum, 316669, 0);
const oll = K.filter(([, s]) => s !== "GRÖN");
for (const [n, s] of K) console.log(`KONTROLL ${s === "GRÖN" ? "✓" : "✗"} ${n}: ${s}`);
if (oll.length) {
  console.error(`ABORT: ${oll.length} kontroll(er) OLL — ingen skrivning sker`);
  process.exit(1);
}

// ── Superlativtest (omg14-regeln: information till noteringen, ej abort) ───
const sig = (v) => `${(v * 100).toFixed(1)}`;
const pbRank = [...fore.filter((b) => typeof b.vardering?.pb === "number"), { vardering: { pb: R.pb }, ticker: "VOW3-ny" }].sort((a, b) => a.vardering.pb - b.vardering.pb);
const peRank = [...fore.filter((b) => typeof b.vardering?.pe === "number"), { vardering: { pe: R.pe }, ticker: "VOW3-ny" }].sort((a, b) => a.vardering.pe - b.vardering.pe);
const bruttoRank = [...fore.filter((b) => typeof b.lonksamhet?.bruttoMarginal === "number"), { lonksamhet: { bruttoMarginal: R.bruttoTtm }, ticker: "VOW3-ny" }].sort((a, b) => a.lonksamhet.bruttoMarginal - b.lonksamhet.bruttoMarginal);
console.log(`\nSUPERLATIV: P/B ${R.pb} → plats ${pbRank.findIndex((b) => b.ticker === "VOW3-ny") + 1}/${pbRank.length} från botten (universumets LÄGSTA om plats 1 — substansrabatt-noten)`);
console.log(`SUPERLATIV: P/E ${R.pe} → plats ${peRank.findIndex((b) => b.ticker === "VOW3-ny") + 1}/${peRank.length} från botten`);
console.log(`SUPERLATIV: brutto ${sig(R.bruttoTtm)} % → plats ${bruttoRank.findIndex((b) => b.ticker === "VOW3-ny") + 1}/${bruttoRank.length} från botten`);

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
console.log(`\nAPPEND: ${fore.length} → ${efter.length} rader (VOW3 tillagd)`);

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
console.log("\n=== LANDMATTA Tyskland/konsument ===");
console.log("före:", mFore.get("Tyskland/konsument") ?? 0, "→ efter:", mEfter.get("Tyskland/konsument") ?? 0, "(MIN_MATTA=5)");
const tysk = new Map();
for (const b of efter) if (b.land === "Tyskland") tysk.set(`${b.bransch}/${b.ticker}`, 1);
console.log("Tyskland-rader efter:", [...tysk.keys()].join(", "));
const p4 = [...mEfter.entries()].filter(([, v]) => v === 4).map(([k]) => k);
const p3 = [...mEfter.entries()].filter(([, v]) => v === 3).map(([k]) => k);
console.log("celler på matta 4 (koordinater):", p4.join(", ") || "—");
console.log("celler på matta 3 (+2 krävs):", p3.join(", ") || "—");
const landEfter = new Set(efter.map((b) => b.land));
console.log("länder:", landEfter.size);

// ── Slutlig verifiering: radens innehåll i filen ─────────────────────────────
const s = efter.find((b) => b.ticker === "VOW3.DE");
console.log("\nVOW3.DE i filen:", s ? `${s.ticker} ${s.namn} ${s.bransch}/${s.land} pe=${s.vardering.pe} pb=${s.vardering.pb} peg=${s.vardering.peg} fcfY=${s.vardering.fcfYield} resCAGR=${s.tillvaxt.resultatCAGR5ar}` : "SAKNAS");
console.log("SUMMA kontroller GRÖNA:", K.filter(([, st]) => st === "GRÖN").length + "/" + K.length);
