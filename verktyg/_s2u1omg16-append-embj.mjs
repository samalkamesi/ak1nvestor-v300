#!/usr/bin/env node
/**
 * s2-u1 omg16 — APPEND Embraer S.A. (EMBJ, industri, Brasilien) till
 * data/portfolj-system/bolagsunivers.json (183→184 i mitt fönster; disk-
 * glidning beaktad — syskon u2 ITUB/ABEV och u3 LONN/STMN/SOON kan landa
 * parallellt; idempotensguard + append SIST i arrayen orör deras rader).
 *
 * FLYGTILLVERKNINGSTRION komplett: AIR.PA (Airbus) · BA (Boeing) · EMBJ
 * (Embraer) — industrigrenens skarpaste kvalitetsgradient; Brasilien/
 * industri-cell föds 0→1 (tredje sektorraden: PBR energi · VALE material ·
 * EMBJ industri; med u2:s ITUB+ABEV blir Brasilien 5-bolagsland).
 *
 * Metod (FCX-mallen omg14, spårets etablerade): textbaserad kirurgisk
 * insert före slut-]-parentesen (minimal diff; filens indent 1),
 * idempotensguard, aritmetikverifierad FÖRE skrivning (abort-grind —
 * omg13-läxan: kontrollblock fångar stavfel FÖRE disk), medianer/kvartiler
 * före/efter med EXAKT replik av raknaBranschMedianer
 * (src/lib/dataset-medianer.ts), landmatta-svep enligt omg8-rättasen.
 *
 * Data: stockanalysis.com NYSE-ADR EMBJ (översikt + statistics +
 * financials + financials/cash-flow-statement + financials/balance-sheet;
 * underlag S&P Global Market Intelligence + Fiscal.ai), stängningskurs
 * 2026-09-17, sidor pålästa 2026-09-18. FINANCIALS I MILJONER BRL (källans
 * uttryckliga vy — PBR/VALE-precedensen omg13: BRL-serier, USD-pris/mcap),
 * värderings- och marginalandelar valuta-neutrala, ADR-priset i USD.
 * Räkenskapsår = kalenderår (universumets huvudkonvention).
 *
 * SYMBOLBYTE: NYSE-ADR:n bytte symbol ERJ → EMBJ (källan 301-redirectar
 * /stocks/erj/ → /stocks/embj/) — dokumenteras i raden; ticker i universumet
 * = EMBJ (PBR/VALE-ADR-konventionen: noteringssymbolen som ticker).
 */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(FIL, "utf8");
const u = JSON.parse(raw);
if (!Array.isArray(u)) throw new Error("universumet är inte en array");
if (u.some((b) => b.ticker === "EMBJ" || b.ticker === "ERJ")) {
  console.log("IDEMPOTENT: EMBJ/ERJ finns redan — avslutar utan ändring");
  process.exit(0);
}
const fore = JSON.parse(raw); // färsk kopia för före-mätning

// ── EMBJ-rådata (BRL-serier i miljoner; ADR-pris/mcap i USD) ────────────────
const R = {
  // 5 år brutto-underlag (FY2021 för moat-serien — pandemiårets djup)
  oms5: [22670, 23449, 26111, 35424, 41883],
  brutto5: [3539, 4710, 4503, 6382, 7358],
  // serier 4 år (konventionen)
  oms: [23449, 26111, 35424, 41883],
  brutto: [4710, 4503, 6382, 7358],
  res: [-953.66, 783.56, 1919, 1953],
  fcf: [3139, 1640, 4464, 3439],
  ocf: [3841, 2827, 5532, 4484],
  kapex: [701.87, 1188, 1069, 1045],
  utd5: [0, 66.65, 0, 130.81], // utdelningar betalda BRL M (0 under 2022/24)
  kop5: [0, 0, 0, 1000], // återköp BRL M (första sedan 2021: R$1 000 M 2025)
  pris: 74.55, mcapT: 13.20, // mdr USD (ADR-noteringen)
  pe: 29.36, peFwd: 20.46, pb: 3.45, bvpsUnder: 4.86, // BVPS per underliggande aktie
  evEbit: 18.3, evEbitda: 15.31, evKalla: 14.05, // källans EV mdr USD
  roe: 0.1219, roic: 0.1446, roce: 0.0947, wacc: 0.0786, beta: 0.69,
  bruttoTtm: 0.1785, ebitTtm: 0.0901, nettoTtm: 0.0528, fcfTtm: 0.1178,
  skuldEk: 0.69, rantaTackning: 3.42, skuldT: 2.64, kassaT: 2.16,
  minoritetT: 0.372, ekCommonT: 3.456, ekTotalT: 3.83, // mdr USD, TTM Jun-30 2026
  omsTtm: 8.52, resTtm: 0.44958, fcfTtmAbs: 1.01, epsTtm: 2.54,
  utdAktie: 0.68, payout: 0.2689, ttmTillvaxt: 0.1086,
  skatt: 0.1763, lv52: [53.56, 80.75], lv52Prestanda: 0.3164,
  backlogFY25: 174053, // R$ M — källans balancesheet-rad
};

// CAGR endpoint FY2022→FY2025 = 3 perioder — men FY2022-resultatet är
// NEGATIVT (−R$953,66 M) ⇒ resultatCAGR = null (BA/NEM/AMZN-precedensen:
// universumet sätter null när endpoint-starten är under noll)
const cagr3 = (a, b) => Math.pow(b / a, 1 / 3) - 1;
const omsCagr = cagr3(R.oms[0], R.oms[3]);
const resCagr = null;
const prognos = R.pe / R.peFwd - 1; // TTE-konventionen (trailing/fwd)
const peg = R.pe / (prognos * 100); // spårkonvention (HSBC/MA/ASML)
const fcfYield = R.fcfTtmAbs / R.mcapT;
const bruttoSerie5 = R.brutto5.map((g, i) => g / R.oms5[i]);
const bruttoMedel = bruttoSerie5.reduce((a, b) => a + b, 0) / bruttoSerie5.length;
const bruttoSpread = Math.max(...bruttoSerie5) - Math.min(...bruttoSerie5);
const peIdentitet = R.pris / R.epsTtm;
const pbReplik = R.mcapT / R.ekTotalT; // källans bas: total equity INKL minoriteter
const pbCommon = R.mcapT / R.ekCommonT;
const evReplikInklMinoritet = (R.mcapT + R.skuldT - R.kassaT) + R.minoritetT;
const utdKonverterad = R.utdAktie; // USD per ADR
const direkt = utdKonverterad / R.pris;
const payoutReplik = utdKonverterad / R.epsTtm;
const backlogArsintakter = R.backlogFY25 / R.oms5[4];

const rad = {
  ticker: "EMBJ",
  namn: "Embraer S.A.",
  bransch: "industri",
  land: "Brasilien",
  valuta: "USD",
  kallor: [
    {
      namn: "StockAnalysis",
      hamtat: "2026-09-18",
      url: "https://stockanalysis.com/stocks/embj/",
      paranoid:
        "NYSE-ADR:n EMBJ — SYMBOLBYTE ERJ→EMBJ dokumenterat (källan 301-redirectar /stocks/erj/): översikt + statistics + financials + financials/cash-flow-statement + financials/balance-sheet; underlag S&P Global Market Intelligence + Fiscal.ai; stängningskurs 2026-09-17: ADR-pris 74,55 USD, mcap 13,20 mdr USD på 711,83 M underliggande aktier (ADR-kvot 4:1 — EPS 2,54 USD är PER ADR, 177,96 M ADR:er); financials i MILJONER BRL (källans uttryckliga vy — PBR/VALE-precedensen omg13: rapportvaluta-serier, ADR-USD-pris; källans TTM-kurs BRL/USD ≈ 5,18: intäkt TTM R$44 128 M = 8,52 mdr USD); P/E 29,36 forward 20,46, P/B 3,45 (källans bas = TOTAL equity 3,83 mdr USD inkl minoriteter R$1 924 M; på common equity 3,456 mdr = 3,82 — spegelbilden av FCX:s minoritetsnot), EV 14,05 mdr REPLIKERBAR EXAKT med minoritetsposten (13,20 + 2,64 − 2,16 + 0,372), EV/EBIT 18,30 EV/EBITDA 15,31, marginaler TTM (brutto 17,85/EBIT 9,01/netto 5,28/FCF 11,78 %), ROE 12,19/ROIC 14,46/ROCE 9,47/WACC 7,86, skuld/EK 0,69 på total equity, räntetäckning 3,42×, DPS 0,68 USD/ADR (0,91 %, payout 26,89 %), återköpsavkastning 1,51 %, beta 0,69 (5 år), 52-v 53,56–80,75 (+31,64 %), Altman Z 1,83 GRÅZONEN, Piotroski F 6, effektiv skattesats 17,63 %, analytiker 91,60 (15 st), institutioner 69,23 %, 21 122 anställda, oms/anställd 403 257 USD; order backlog R$174 053 M (FY2025); bransch Industri/Aerospace & Defense källkonsekvent med LMT/CAT-familjen",
    },
  ],
  hamtat: "2026-09-18",
  pris: R.pris,
  marknadsKapitalMdr: Math.round(R.mcapT * 1000), // 13 200 M USD
  tillvaxt: {
    omsattningCAGR5ar: Math.round(omsCagr * 10000) / 10000,
    resultatCAGR5ar: resCagr,
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
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: 0 },
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
    ar: ["2022", "2023", "2024", "2025"],
    omsattning: R.oms.map((x) => x * 1e6),
    resultat: R.res.map((x) => x * 1e6),
    egetKapital: [],
    fcf: R.fcf.map((x) => x * 1e6),
  },
  notering:
    "FLYGTILLVERKNINGSTRION KOMPLETT I UNIVERSUMET — AIR.PA (Airbus) · BA (Boeing) · EMBJ (Embraer) = världens tre största flygplanstillverkare i industrigrenen, och Brasilien/industri-cell FÖDS 0→1 (tredje sektorraden efter PBR energi + VALE material; med syskonens ITUB/ABEV blir Brasilien femransland). EMBJ = REGIONALA JETENS DUOPOL-UTMANARE (E2-familjen mot Airbus A220 — förra Bombardier C Series) + VÄRLDENS STÖRSTA BUSINESS-JET-TILLVERKARE (Phenom/Praetor-familjen) + försvarsgrenen (A-29 Super Tucano — Nato-standardsignatur 2025) — FY2025-segment i R$ M: Commercial 13 026 · Defense & Security 5 444 · Executive 12 172 · Services 10 729. VÄNDNINGSBÅGEN ÄR BERÄTTELSEN: EBIT-marginal −1,03 % (FY2022) → 5,70 (FY2023) → 8,57 (FY2024) → 8,15 % (FY2025) med TTM 9,01 %; R$-resultat −953,66 M → +783,56 → +1 919 → +1 953 M (resultatCAGR = NULL, BA/NEM-precedensen: negativ endpoint-start förlorar CAGR-räckvidd — universumets konvention); utdelningen återfödd 0 → R$130,81 M (2025) + FÖRSTA ÅTERKÖPET sedan 2021 (R$1 000 M). ORDERBOKEN: R$174 053 M backlog FY2025 = 4,2 ÅRSINTÄKTER — duopolyklientens depositioner syns EJ i resultaträkningen men äger backlog-raderna (källan: 163 281 FY2024, 92 516 FY2022 — böjan är datan). ADR-ARBETET: NYSE-symbolen bytte ERJ→EMBJ (källan redirectar; universumsticker = EMBJ enligt PBR/VALE-ADR-konventionen); ADR-kvot 4:1 (EPS 2,54 USD är per ADR på 177,96 M ADR:er; 711,83 M underliggande aktier; BVPS 4,86 USD per AKTIE ⇒ ADR-BVPS 19,44 — enhetsdisiplinen dokumenterad); financials i BRL (källans vy — källans TTM-kurs ≈ 5,18). MINORITETSSPEGELN (FCX omvänd): källans P/B 3,45 på TOTAL equity 3,83 mdr USD INKL minoriteter R$1 924 M (= 0,372 mdr USD — EV-repliken BEVISAR posten: 13,20 + 2,64 − 2,16 + 0,372 = 14,05 mdr EXAKT källans EV); på common equity 3,456 mdr = 3,82. BRUTTOMARGINALPEDAGOGIKEN: 17,85 % TTM (femårsmedel 17,70 %, spread 4,47 pp) — TILLVERKNINGS-MOATENS tal mot IP-moatens (ASML 52,7 % · ARM 97,5 %): flygplanskroppens vallgrav är installationsbas och certifieringsbarriärer, inte mjukvarans marginalgrav — därför är orderboken (inte marginalen) Embraers kapitalvärdemätare. VARDERING: P/E 29,36 mot forward 20,46 ⇒ prognosTillväxt +43,5 % (TTE-konventionen — sällskapet FCX +71,8/Holcim +479); källans EPS-prognos 3 år +55,09 %/år som kalibrering; PEG 0,68 spårkonvention; fcfYield 7,65 % (1,01/13,20 — industrigrenens övre region; TTM-FCF R$5 200 M ≈ 1,01 mdr USD driven av förskottsbetalningar: unearned revenue +R$2 171 M TTM). KAPITALMARGINALKNAPP: ROIC 14,46 % mot WACC 7,86 % = +6,60 pp (konsultkontrasten TCS +61,2; gråzongsbolaget CAT? — nej: Altman Z 1,83 GRÅZONEN mot Piotroski F 6: solid kortsiktig styrka, tunn konkursavståndsmarginal — flygplansbalansräkningens paradox: 19,2 mdr R$ INVENTORY (TTM, 44 % av omsättningen — halvbyggda flygplan är lager, inte försäljning) mot 13,7 mdr R$ skuld). RÖRLIGHET: beta 0,69 — LÅGASTA i flygtrion (BA 1,51/LMT 0,84-klassen), business-jet-diversifikationen dämpar linjecykeln; 52-v +31,64 % (kurs 74,55 mitt i spannet 53,56–80,75; RSI 55,9 neutral). VALUTASPIGGELEN: F/X-adjustments −R$1 311 M TTM (realens svaghet äter den dollar-rapporterande kassan — Embraer bokför i USD men B3-noteringen betalar i BRL). Utdelning 0,68 USD/ADR (0,91 %; källans payout 26,89 % på justerat bas-EPS; DPS/EPS-replik 26,77 % — källspridningsnot i VALE/FCX-familjen). Räkenskapsår kalenderår; Q2 2026 rapporterad (TTM Jun-30-2026) — nästa rapp Q3 2026 (november-fönstret, källans 'Aug 10' är senaste framförda; CAT 10-28/LMT 10-27 industrigrenens FIFO-dagar före)",
};

// ── Aritmetikkontroller FÖRE skrivning (abort-grind: ENDA OLL ⇒ ingen disk) ──
const K = [];
const jfr = (namn, v, exp, tol = 5e-5) =>
  K.push([namn, Math.abs(v - exp) <= tol ? "GRÖN" : `OLL (${v} ≠ ${exp})`]);
jfr("omsCAGR endpoint 3 perioder 23 449→41 883", Math.round(omsCagr * 10000) / 10000, rad.tillvaxt.omsattningCAGR5ar);
jfr("resultatCAGR null (negativ start −953,66 — BA/NEM-precedens)", rad.tillvaxt.resultatCAGR5ar, null, 0);
jfr("prognosTillväxt TTE 29,36/20,46", Math.round(prognos * 10000) / 10000, rad.tillvaxt.prognosTillvaxt);
jfr("PEG 0,68 spårkonvention", rad.vardering.peg, Math.round((R.pe / (prognos * 100)) * 100) / 100);
jfr("fcfYield 1,01/13,20", rad.vardering.fcfYield, Math.round(fcfYield * 10000) / 10000);
jfr("direktavkastning 0,68/74,55", direkt, 0.0091, 5e-5);
jfr("P/E-identitet 74,55/2,54 mot källans 29,36", peIdentitet, R.pe, 0.02);
jfr("P/B-replik mcap/totalEkv 13,20/3,83 = 3,45", pbReplik, R.pb, 0.011);
jfr("P/B common-bas-notis 13,20/3,456 = 3,82", pbCommon, 3.82, 0.011);
jfr("EV-replik inkl minoritet = källans 14,05", evReplikInklMinoritet, R.evKalla, 0.011);
jfr("minoritetspost R$1 924 M = 1,924 mdr/5,177 = 0,372 mdr", R.minoritetT, 1.924 / 5.177, 0.005);
jfr("bruttomarginalserie 5 år (2021–2025) → medel", Math.round(bruttoMedel * 10000) / 10000, rad.moat.bruttoMarginalMedel5ar);
jfr("bruttospread max−min FY21→FY25", Math.round(bruttoSpread * 10000) / 10000, rad.moat.bruttoMarginalSpread5ar);
jfr("egenKapitalMultipl = pb", rad.vardering.egenKapitalMultipl, rad.vardering.pb);
jfr("serielängder 4/4/4 + moat 5", [R.oms.length, R.res.length, R.fcf.length, R.brutto5.length].join(""), "4445", 0);
jfr("payout-replik DPS/EPS 0,68/2,54", payoutReplik, 0.2677, 5e-4);
jfr("backlog ≈ 4,2 årsintäkter 174 053/41 883", backlogArsintakter, 4.156, 0.01);
const oll = K.filter(([, s]) => s !== "GRÖN");
for (const [n, s] of K) console.log(`KONTROLL ${s === "GRÖN" ? "✓" : "✗"} ${n}: ${s}`);
if (oll.length) {
  console.error(`ABORT: ${oll.length} kontroll(er) OLL — ingen skrivning sker`);
  process.exit(1);
}

// ── Superlativtest (omg14-regeln: information till noteringen, ej abort) ───
const sig = (v) => `${(v * 100).toFixed(1)}`;
const bruttoRank = [...fore.filter((b) => typeof b.lonksamhet?.bruttoMarginal === "number"), { lonksamhet: { bruttoMarginal: R.bruttoTtm }, ticker: "EMBJ-ny" }].sort((a, b) => a.lonksamhet.bruttoMarginal - b.lonksamhet.bruttoMarginal);
const fcfyRank = [...fore.filter((b) => typeof b.vardering?.fcfYield === "number"), { vardering: { fcfYield: fcfYield }, ticker: "EMBJ-ny" }].sort((a, b) => b.vardering.fcfYield - a.vardering.fcfYield);
const betaRank = [...fore.filter((b) => typeof b.stabilitet?.beta === "number")].length; // beta ligger inte i stabilitet — se rad-beta i stället
console.log(`\nSUPERLATIV: brutto ${sig(R.bruttoTtm)} % → plats ${bruttoRank.findIndex((b) => b.ticker === "EMBJ-ny") + 1}/${bruttoRank.length} (lägsta = tillverknings-moat-noten)`);
console.log(`SUPERLATIV: fcfYield ${sig(fcfYield)} % → plats ${fcfyRank.findIndex((b) => b.ticker === "EMBJ-ny") + 1}/${fcfyRank.length} från toppen`);

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
console.log(`\nAPPEND: ${fore.length} → ${efter.length} rader (EMBJ tillagd)`);

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
  const ind = data.filter((b) => b.bransch === "industri");
  const tot = data;
  console.log(`\n=== ${namn} ===`);
  console.log(`industri: ${ind.length} bolag | P/E`, JSON.stringify(stat(ind, fPe, false)),
    "| P/B", JSON.stringify(stat(ind, fPb, false)));
  console.log(`industri EBIT%:`, JSON.stringify(stat(ind, fEbit, true)),
    "FCF%:", JSON.stringify(stat(ind, fFcf, true)), "tillv%:", JSON.stringify(stat(ind, fTill, true)));
  console.log(`industri ROE%:`, JSON.stringify(stat(ind, fRoe, true)), "resCAGR%:", JSON.stringify(stat(ind, fRes, true)));
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
console.log("\n=== LANDMATTA Brasilien/industri ===");
console.log("före:", mFore.get("Brasilien/industri") ?? 0, "→ efter:", mEfter.get("Brasilien/industri") ?? 0, "(MIN_MATTA=5)");
const bras = new Map();
for (const b of efter) if (b.land === "Brasilien") bras.set(`${b.bransch}/${b.ticker}`, 1);
console.log("Brasilien-rader efter:", [...bras.keys()].join(", "));
const p4 = [...mEfter.entries()].filter(([, v]) => v === 4).map(([k]) => k);
const p3 = [...mEfter.entries()].filter(([, v]) => v === 3).map(([k]) => k);
console.log("celler på matta 4 (koordinater):", p4.join(", ") || "—");
console.log("celler på matta 3 (+2 krävs):", p3.join(", ") || "—");
const landEfter = new Set(efter.map((b) => b.land));
console.log("länder:", landEfter.size);

// ── Slutlig verifiering: radens innehåll i filen ─────────────────────────────
const s = efter.find((b) => b.ticker === "EMBJ");
console.log("\nEMBJ i filen:", s ? `${s.ticker} ${s.namn} ${s.bransch}/${s.land} pe=${s.vardering.pe} pb=${s.vardering.pb} peg=${s.vardering.peg} fcfY=${s.vardering.fcfYield} resCAGR=${s.tillvaxt.resultatCAGR5ar}` : "SAKNAS");
console.log("SUMMA kontroller GRÖNA:", K.filter(([, st]) => st === "GRÖN").length + "/" + K.length);
