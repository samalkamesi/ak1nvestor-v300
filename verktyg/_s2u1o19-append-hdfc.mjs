#!/usr/bin/env node
/**
 * _s2u1o19-append-hdfc.mjs — SPÅR 2 s2-u1 omg19: +1 HDFC BANK (Indien/finans 0→1)
 * PIVOT från MUFG 8306.T (kollision med syskon-u2:s primärval — se anspråket:
 * data/vakten/auto-s2-1789831500945-s2-u1-ansprak.md; u2:s rad lever, mina
 * grindar stoppade 0 skrivningar under MUFG-fasen).
 *
 * Kedja (EN sekvens — clobberfönstret omg12-15-läxan):
 *   1. Aritmetik-ABORT-grind FÖRE all skrivning (omg13-läxan; MUFG-fasen
 *      fångade 2 egna fel: PEG-avrundningskonvention + spread-kollision i
 *      median-repliken — konvergensbeviset gör sitt jobb)
 *   2. Konvergensbevis: Dataset-sektions-replik (raknaBranschMedianer exakt)
 *      på aktuellt diskläge == public/llms.txt:s sektion — annars ABORT
 *   3. Idempotent append av HDFCBANK.NS-rad sist i bolagsunivers.json
 *      (redan närvarande ⇒ verifierar fält + går vidare till regen, 0 ändring)
 *   4. Medianer före/efter (finans-grenen + totalt) — protokollutskrift
 *   5. llms Dataset-sektion HELREGEN på nya läget; aspektraden (finans/
 *      resultat-cagr-5ar) bevaras ORÖRD — u2:s regen-yta bär glömskan från
 *      BNP.PA (n 14 på disk mot beräknat 15); HDFC (CAGR mätbar) fördjupar
 *      densamma till 16 — könotis åt u2, dokumenterad i protokollet
 *   6. Skriv båda filerna + kvitto
 *
 * Bankkonvention (ITUB/RY/HSBA/8306.T-raderna): evEbit/fcfYield/bruttoMarginal/
 * fcfMarginal/skuldEgenkapital/roic/moat = null — kassaflöde och balans bär
 * kundmedel, inte fri likviditet (RBC-precedensen).
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROT = process.cwd();
const UNI = path.join(ROT, "data", "portfolj-system", "bolagsunivers.json");
const LLMS = path.join(ROT, "public", "llms.txt");
const SITE = "https://lab.ak1nvestor.com";

// ── 0. Läsa ──────────────────────────────────────────────────────────────────
const uniRaw = readFileSync(UNI, "utf8");
const rader = JSON.parse(uniRaw);
const llmsRaw = readFileSync(LLMS, "utf8");

// ── HDFC-raden (bankkonventionen; pivot från MUFG — se anspråket) ────────────
const HDFC = {
  ticker: "HDFCBANK.NS",
  namn: "HDFC Bank Limited",
  bransch: "finans",
  land: "Indien",
  valuta: "INR",
  kallor: [
    {
      namn: "StockAnalysis",
      hamtat: "2026-09-19",
      url: "https://stockanalysis.com/quote/nse/HDFCBANK/ (+ /statistics/ + /financials/)",
      paranoid:
        'NSE-primärnoteringen HDFCBANK (översikt + statistics + financials, underlag S&P Global Market Intelligence + Fiscal.ai; slutkurs 2026-09-18 15:15 IST, +2,52 %): pris 731,00 INR, mcap 11,27T INR på 15,41 Mdr aktier (replik 15,41 × 731 = 11 264,7 mdr — 0,05 %), P/E 14,28 replikerbar EXAKT (731/51,19 = 14,280) mot forward 13,04 ⇒ prognosTillväxt +9,5 % TTE (PEG 1,50 spårkonvention; källans PEG 1,04 på 3-års EPS-prognos +13,32 %/år som kalibreringsnot), P/B 1,79 (mcap/total equity 11 264,7/6 290 = 1,791 — 0,06 %) med BVPS-spridningen 731/393,81 = 1,856 (+3,6 % — BVPS-fältet bär vägt aktieantal 15,97 Mdr = 6 290/393,81, HEN3/JNJ-klassen), P/TBV 1,86, P/S 3,82; TTM INR (mdr): rev 2 949,644 (+7,81 %), operating/pretax-marginal 36,78 % (källan sammanfaller — bank utan varukostnadslinje), netto 790,128 (+12,0 %) med nettoMarginal 26,79 % replikerbar EXAKT (790,128/2 949,644 = 26,787 %), EPS 51,19 (+11,39 %; EPS-identitet 790 128/15 410 = 51,27 — 0,16 % vägt aktietal); BANK-KASSAFLÖDETS TECKEN: OCF −2 752,3 mdr, capex −38,9, FCF −2 791,2 mdr (−181,08/aktie) = kundmedelsflöden (depos/utlåning) — fcfYield/fcfMarginal NULL enligt RBC/ITUB/RY/HSBA/8306.T-konventionen; balans: kassa 2,38T, skuld 5,66T, nettoskuld −3 281,1 mdr (−212,86/aktie — kreditportföljen är tillgången), bokfört EK 6,29T; ROE 13,84 %, ROA 1,75 %, ROIC n/a, WACC 4,31 % (ROE−WACC +9,5 pp — Indiens räntenivå mellan Japans 1,64 och Vestens ~7), effektiv skatt 23,94 %, Altman n/a (bank), Piotroski F 2 (balansräkningsklassens artefakt, 8306.T-dokumentationens spegel); utdelning 13 INR (1,78 %; replik 13/731 = 1,778 %) payout 25,40 % replikerbar EXAKT (13/51,19 = 25,396 %) — RBI:s utdelningspolice håller kvarvinster i kapitalbasen; buyback-yield NEGATIV −0,52 % (banker emitterar kapital) med shareholder yield 1,26 % = 1,78−0,52 EXAKT; beta 0,40 (5 år), 52v 681,90–1 020,50 med 52v-change −24,37 % och kursen −28,4 % från toppen 1 020,50; institutioner 82,36 % (universumets höga klass — free float-stor bank), insiders 0,24 %; analytiker Strong Buy 41 st PT 994,49 (+36,05 %), rev-prognos 3 år +11,51 %/år, EPS-prognos +13,32 %/år; anställda 212 958; grundad 1994 (banken; HDFC-bolånerötter 1977); risknotis: US klassaction mot HDB-ADR:n om deposit inducements ~45 crore INR (≈ 4,7 mdr SEK-klassen små) med lead-plaintiff-deadline 2026-10-13 — rubrikburet men beloppslitet; nästa rapp 2026-10-16 (Q2 FY2027); räkenskapsår APRIL–MARS med slutårsetikett (FY2026 = apr 2025–mar 2026, TCS.NS-konventionen exakt); FY-serier i M INR (FY2022→FY2026): rev 911 858→1 130 321→2 288 379→2 728 471→2 833 154, netto 380 528→459 971→640 620→707 923→760 260, EPS 34,15→41,13→45,01→46,20→49,28 (fem raka EPS-tillväxtår); FY2024:S REV-HOPP +102,45 % = HDFC LTD-MERGERN (juli 2023) — strukturbytet i intäktsserien (Holcim/GSK-scope-klassen: bank+bolånekoncern förenades; EPS-serien bär fusionen mjukare via aktieutbytet); nettoCAGR +18,9 %/år (positiv bas — mätbar), omsCAGR +32,8 %/år merger-förvriden (baselineffekten dokumenterad); branschfältet Financials/Banks–Regional källkonsekvent med ITUB/RY/HSBA/8306.T-radernas finansklass',
    },
  ],
  hamtat: "2026-09-19",
  pris: 731,
  marknadsKapitalMdr: 11264.7,
  tillvaxt: {
    omsattningCAGR5ar: 0.3276,
    resultatCAGR5ar: 0.1889,
    omsattningTillvaxtTTM: 0.0781,
    prognosTillvaxt: 0.0951,
  },
  lonksamhet: {
    roe: 0.1384,
    roic: null,
    bruttoMarginal: null,
    ebitMarginal: 0.3678,
    nettoMarginal: 0.2679,
    fcfMarginal: null,
  },
  stabilitet: {
    skuldEgenkapital: null,
    rantaTackning: null,
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
    bruttoMarginalMedel5ar: null,
    bruttoMarginalSpread5ar: null,
    roeMedel5ar: null,
  },
  vardering: {
    pe: 14.28,
    pb: 1.79,
    evEbit: null,
    peg: 1.5,
    fcfYield: null,
    egenKapitalMultipl: 1.79,
  },
  golv: {
    typ: "osatt",
    vardePerAktie: null,
    marginal: null,
  },
  serier: {
    ar: ["2022", "2023", "2024", "2025", "2026"],
    omsattning: [
      911858000000, 1130321000000, 2288379000000, 2728471000000, 2833154000000,
    ],
    resultat: [
      380528000000, 459971000000, 640620000000, 707923000000, 760260000000,
    ],
    egetKapital: [],
    fcf: [],
  },
  notering:
    "INDIEN/FINANS-CELLENS FÖRSTA RAD — bank-pedagogikens FEMTE ben föds: ITUB (Brasilien, emerging-kredit Sydamerika) · RY (Kanada, konservativ hypotek) · HSBA.L (Storbritannien, universal) · 8306.T (Japan, keiretsu; syskon-u2 omg19) · HDFCBANK.NS (Indien, private banking Sydasien) — fem bankkulturer på fem marknader, och Indien får sin andra gren (teknik TCS.NS + finans): världens folkrikaste lands universumsfötter. GRUNDAD 1994 på HDFC-bolånerötter (1977); 212 958 anställda; institutioner 82,36 % (free float-stor bank mot 8306.T:s keiretsu-institut 45,69 % — de två institutionsarketyperna). HDFC LTD-MERGERN (juli 2023) = SERIENS STRUKTURBROTT: FY2024:s intäktshopp +102,45 % är konsolideringen av bolånekoncernen (Holcim/GSK-scope-klassen — två världar i EN serie); EPS-trappan bär fusionen ärligare: 34,15→41,13→45,01→46,20→49,28 = FEM raka tillväxtår med nettoCAGR +18,9 %/år (positiv bas — mätbar, motsatsparen 8306.T/VW:s negativa baser) — bankvärldens tillväxtmaskin på merger-justerad bas, TTM netto +12,0 %. VÄRDERINGENS BANKTUMREGEL I ETT TALPAR: ROE 13,84 % mot P/B 1,79 — och P/B-rankningen FÖLJER riskjusterad ROE i det femte paketet (RY 2,72/16,2 · ITUB 2,17/21,5 emerging-rabatt · HDFC 1,79/13,8 · HSBA 1,77/13,1 · 8306.T 1,68/9,5): marknaden betalar avkastningen, rabatterar tillväxtmarknadens valutarisk; P/E 14,28 mot forward 13,04 ⇒ prognosTillväxt +9,5 % (PEG 1,50 spår, källans 1,04 på EPS-prognos +13,32 %) — intäktsprognosen +11,51 %/år bär mergerårets fulla synergiring. WACC 4,31 % (Indiens räntenivå: mellan Japans 1,64 och Vestens ~7) med ROE−WACC +9,5 pp. RÄNTESPRIDNINGENS KONSISTENS: operating 36,78 % = pretax (bank utan varukostnadslinje) och netto 26,79 % replikerbar EXAKT. Utdelning 13 INR (1,78 %) payout 25,40 % EXAKT — RBI:s utdelningspolice bygger kapitalbas (buyback-yield NEGATIV −0,52 %: banker emitterar kapital, köper ej tillbaka — paketets enda minus); shareholder yield 1,26 % = 1,78−0,52 EXAKT. 52v-FALLSÄSONEN −24,37 % (−28,4 % från toppen 1 020,50) med rubrikburen men beloppslit riskbild: US klassaction om deposit inducements ~45 crore INR (≈ 4,7 mkr USD-klassen) mot HDB-ADR:n — medan analytikerna Strong Buy 41 st (universumets största paneler) PT 994,49 = +36,05 %. BANK-KASSAFLÖDETS TECKEN dokumenterat (OCF −2 752 mdr = kundmedel): fcfYield/fcfMarginal/skuldEgenkapital NULL enligt paketkonventionen; nättskuld −3 281 mdr = kreditportföljen är tillgången (8306.T:s spegelbildsnot). Räkenskapsår april–mars (FY2026 = apr 2025–mar 2026, TCS-konventionen exakt); Q2 FY2027 rapp 2026-10-16 — oktober-FIFO:tätt (GS 10-13 samma vecka)",
};

// ── 1. ARITMETIK-ABORT-GRIND (FÖRE all skrivning) ───────────────────────────
const GRONA = [];
const kontroll = (id, namn, calc, expect, tol) => {
  const rel = Math.abs(calc - expect) / Math.abs(expect);
  const ok = rel <= tol;
  GRONA.push({ id, namn, calc, expect, rel, ok: rel <= tol });
  if (!ok) {
    console.error(`ABORT ${id}: ${namn}: calc ${calc} mot ${expect} (rel ${(rel * 100).toFixed(3)} % > ${(tol * 100).toFixed(2)} %)`);
    process.exit(1);
  }
};
const approx = (x) => Math.round(x * 1e6) / 1e6;

kontroll("A1", "mcap = aktier × pris", (15.41e9 * 731) / 1e9, 11264.7, 0.001);
kontroll("A1b", "mcap mot källans display 11,27T", 11264.7 / 11270, 1, 0.005);
kontroll("A2", "P/E = pris/EPS exakt", 731 / 51.19, 14.28, 0.001);
kontroll("A3", "P/B = mcap/EK", 11264.7 / 6290, 1.79, 0.005);
kontroll("A4", "BVPS-spridning dokumenterad", 731 / 393.81, 1.856, 0.005);
kontroll("A5", "utdelningsyield", (13 / 731) * 100, 1.78, 0.005);
kontroll("A6", "payout = DPS/EPS", (13 / 51.19) * 100, 25.4, 0.003);
kontroll("A7", "shareholder yield = div+buyback(neg)", 1.78 - 0.52, 1.26, 0.005);
kontroll("A8", "EPS-identitet NI/aktier (vägt 0,2 %)", 790128 / 15410, 51.19, 0.005);
kontroll("A9", "prognosTillväxt = pe/fwd − 1", 14.28 / 13.04 - 1, 0.0951, 0.003);
kontroll("A10", "PEG = pe/prognosTillväxt(%)", Math.round((14.28 / 9.51) * 100) / 100, 1.5, 0.001);
kontroll("A11", "omsCAGR FY22→26 (4 år, merger-förvriden)", Math.pow(2833154 / 911858, 1 / 4) - 1, 0.3276, 0.002);
kontroll("A12", "nettoCAGR FY22→26 (4 år, positiv bas)", Math.pow(760260 / 380528, 1 / 4) - 1, 0.1889, 0.002);
kontroll("A13", "FY2026 rev-tillväxt mot källan", 2833154 / 2728471 - 1, 0.0384, 0.003);
kontroll("A14", "FY2026 res-tillväxt mot källan", 760260 / 707923 - 1, 0.0739, 0.003);
kontroll("A14b", "FY2026 nettoMarginal mot källan", 760260 / 2833154, 0.2683, 0.002);
kontroll("A15", "TTM nettoMarginal mot källan EXAKT", 790128 / 2949644, 0.2679, 0.002);
kontroll("A16", "FY2026 vägt aktietal (M) mot outstanding", 760260 / 49.28, 15420, 0.005);
kontroll("A17", "−28,4 % från 52v-toppen", 731 / 1020.5 - 1, -0.2837, 0.01);
kontroll("A19", "FY2026 EPS-tillväxt mot källans 6,67 %", 49.28 / 46.2 - 1, 0.0667, 0.003);
// Serieintegritet: 5 stapplar, basår positiv (CAGR mätbar — motsatsen till 8306.T:s null)
if (HDFC.serier.ar.length !== 5 || HDFC.serier.omsattning.length !== 5 || HDFC.serier.resultat.length !== 5) {
  console.error("ABORT A20: serielängder"); process.exit(1);
}
GRONA.push({ id: "A20", namn: "serielängder 5/5/5", calc: 5, expect: 5, rel: 0, ok: true });
if (HDFC.serier.resultat[0] <= 0) { console.error("ABORT A20b: basår ej positivt"); process.exit(1); }
GRONA.push({ id: "A20b", namn: "FY2022-basen 380 528 M > 0 (resultatCAGR mätbar)", calc: HDFC.serier.resultat[0], expect: 380528, rel: 0, ok: true });
// Bankkonventionen: null-fälten
for (const [sokvag, fel] of [
  ["vardering.evEbit", HDFC.vardering.evEbit !== null],
  ["vardering.fcfYield", HDFC.vardering.fcfYield !== null],
  ["lonksamhet.bruttoMarginal", HDFC.lonksamhet.bruttoMarginal !== null],
  ["lonksamhet.fcfMarginal", HDFC.lonksamhet.fcfMarginal !== null],
  ["lonksamhet.roic", HDFC.lonksamhet.roic !== null],
  ["stabilitet.skuldEgenkapital", HDFC.stabilitet.skuldEgenkapital !== null],
]) {
  if (fel) { console.error(`ABORT A22: bankkonventionen bruten: ${sokvag} ska vara null`); process.exit(1); }
}
GRONA.push({ id: "A22", namn: "bankkonventionens sex null-fält (RBC/ITUB/RY/HSBA/8306.T)", calc: 6, expect: 6, rel: 0, ok: true });

console.log(`ARITMETIKGRIND: ${GRONA.length}/${GRONA.length} GRÖN (abort-grind passerad FÖRE skrivning)`);

// ── 2. KODVÄGS-REPLIK (raknaBranschMedianer exakt ur dataset-medianer.ts) ────
const median = (v) => {
  const rena = v.filter((x) => typeof x === "number" && Number.isFinite(x));
  if (!rena.length) return null;
  const s = [...rena].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 === 1 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const percentil = (v, p) => {
  const rena = v.filter((x) => typeof x === "number" && Number.isFinite(x));
  if (!rena.length) return null;
  const s = [...rena].sort((a, b) => a - b);
  const pos = (s.length - 1) * p;
  const lo = Math.floor(pos), hi = Math.ceil(pos);
  if (lo === hi) return s[lo];
  return s[lo] + (pos - lo) * (s[hi] - s[lo]);
};
const runda1 = (x) => Math.round(x * 10) / 10;

function rakna(rs) {
  const per = new Map();
  let hamtat = null, nBolag = 0;
  const uPe = [], uPb = [], uEbit = [], uFcf = [], uTill = [];
  for (const r of rs) {
    const b = (typeof r.bransch === "string" && r.bransch.trim()) ? r.bransch : "osatt";
    if (!per.has(b)) per.set(b, []);
    per.get(b).push(r);
    nBolag++;
    const mata = (v, ut) => { if (typeof v === "number" && Number.isFinite(v)) ut.push(v); };
    mata(r.vardering?.pe, uPe); mata(r.vardering?.pb, uPb);
    mata(r.lonksamhet?.ebitMarginal, uEbit); mata(r.lonksamhet?.fcfMarginal, uFcf);
    mata(r.tillvaxt?.omsattningTillvaxtTTM, uTill);
    if (typeof r.hamtat === "string" && r.hamtat > (hamtat ?? "")) hamtat = r.hamtat;
  }
  const stat = (v, proc) => ({
    median: v.length ? (proc ? runda1(median(v) * 100) : runda1(median(v))) : null,
    p25: v.length ? (proc ? runda1(percentil(v, 0.25) * 100) : runda1(percentil(v, 0.25))) : null,
    p75: v.length ? (proc ? runda1(percentil(v, 0.75) * 100) : runda1(percentil(v, 0.75))) : null,
    n: v.filter((x) => typeof x === "number" && Number.isFinite(x)).length,
  });
  const raderUt = [];
  for (const [b, bolag] of per) {
    const pe = stat(bolag.map((x) => x.vardering?.pe ?? null), false);
    const pb = stat(bolag.map((x) => x.vardering?.pb ?? null), false);
    const ebit = stat(bolag.map((x) => x.lonksamhet?.ebitMarginal ?? null), true);
    const fcf = stat(bolag.map((x) => x.lonksamhet?.fcfMarginal ?? null), true);
    const till = stat(bolag.map((x) => x.tillvaxt?.omsattningTillvaxtTTM ?? null), true);
    raderUt.push({ bransch: b, antalBolag: bolag.length, pe, pb, ebit, fcf, till });
  }
  raderUt.sort((a, b) => a.bransch.localeCompare(b.bransch, "sv"));
  return { hamtat, nBolag, totalt: { pe: stat(uPe, false), pb: stat(uPb, false), ebit: stat(uEbit, true), fcf: stat(uFcf, true), till: stat(uTill, true) }, rader: raderUt };
}

const NAMN = { energi: "Energi", fastighet: "Fastighet", finans: "Finans", halso: "Hälsa", industri: "Industri", kommunikation: "Kommunikation", konsument: "Konsument", material: "Material", teknik: "Teknik", tillvaxt: "Tillväxt" };
const svTal = (x) => (x === null ? "—" : String(x).replace(".", ","));

// ── 3. KONVERGENSBEVIS på aktuellt läge ──────────────────────────────────────
const gamlaSektionMatch = llmsRaw.match(/^## Dataset — branschmedianer$[\s\S]*?(?=^## )/m);
if (!gamlaSektionMatch) { console.error("ABORT K1: hittade inte Dataset-sektionen i llms.txt"); process.exit(1); }
const gamlaSektion = gamlaSektionMatch[0];

// Aspektrader ur gamla sektionen (icke-branschmedianer) — bevaras per bransch
const aspektrader = gamlaSektion.split("\n").filter((l) => l.startsWith("- [Dataset") && !l.includes("— branschmedianer]"));
const aspektPerBransch = new Map();
for (const l of aspektrader) {
  const mm = l.match(/\(https:\/\/lab\.ak1nvestor\.com\/dataset\/([a-z]+)\/[a-z0-9-]+\)/);
  if (!mm) { console.error("ABORT K3: aspektrad utan bransch-URL:", l.slice(0, 80)); process.exit(1); }
  const b = mm[1];
  if (!aspektPerBransch.has(b)) aspektPerBransch.set(b, []);
  aspektPerBransch.get(b).push(l);
}

function datasetSektionMedAspekter(rs) {
  const m = rakna(rs);
  const L = [];
  L.push("## Dataset — branschmedianer");
  L.push("");
  L.push(`AK1A:s publika dataset: median P/E, P/B, EBIT-marginal, FCF-marginal och omsättningstillväxt per bransch, räknat ur det fasta universumet på ${m.nBolag} bolag i ${m.rader.length} branscher (rådata ${m.hamtat ?? "—"}). Observationsantal (n) redovisas per nyckeltal. Varje branschsida redovisar dessutom kvartilspridningen (P25–P75) per nyckeltal och jämför branschens medianer med hela universumets medianer. Under varje bransch finns dessutom aspektsidor — ett nyckeltal per sida (P/E, P/B, ROE, ROIC, EV/EBIT, PEG, marginaler, tillväxt m.fl.) — där varje sida redovisar median, kvartiler och spridning för branschen samt samma mått för hela universumet som jämförelserad. Pedagogisk referens — inte investeringsrådgivning.`);
  L.push("");
  L.push(`- [Dataset — branschmedianer](${SITE}/dataset): Median P/E per bransch i AK1A:s universum (${m.nBolag} bolag i ${m.rader.length} branscher, rådata ${m.hamtat ?? "—"}) — totalt median P/E ${svTal(m.totalt.pe.median)} (n=${m.totalt.pe.n} av ${m.nBolag} bolag med mätt P/E). Med P/B, EBIT-marginal, FCF-marginal och omsättningstillväxt per bransch.`);
  for (const r of m.rader) {
    const namn = NAMN[r.bransch] ?? r.bransch;
    L.push(`- [Dataset ${namn} — branschmedianer](${SITE}/dataset/${r.bransch}): Medianerna för ${namn} i AK1A:s universum (${r.antalBolag} bolag i branschen, rådata ${m.hamtat ?? "—"}): P/E ${svTal(r.pe.median)} med kvartilspridning P25–P75 ${svTal(r.pe.p25)}–${svTal(r.pe.p75)} (n=${r.pe.n}) · P/B ${svTal(r.pb.median)} · EBIT-marginal ${svTal(r.ebit.median)} % · FCF-marginal ${svTal(r.fcf.median)} % · omsättningstillväxt ${svTal(r.till.median)} %. Jämförd med universumet: median P/E ${svTal(m.totalt.pe.median)} för samtliga ${m.nBolag} bolag.`);
    const ask = aspektPerBransch.get(r.bransch);
    if (ask) L.push(...ask);
  }
  L.push("");
  return { text: L.join("\n") + "\n", m };
}

// Konvergens: repliken (med bevarade aspektrader) måste vara byte-identisk med filens sektion
const replikNu = datasetSektionMedAspekter(rader);
if (replikNu.text !== gamlaSektion) {
  console.error("ABORT K2: kodvägs-repliken skiljer från filens Dataset-sektion (konvergens brutet)");
  const a = replikNu.text.split("\n"), b = gamlaSektion.split("\n");
  for (let i = 0; i < Math.max(a.length, b.length); i++) if (a[i] !== b[i]) { console.error(`  rad ${i} skiljer:\n  REPLIK [${a[i]?.length} tkn]: ${a[i]}\n  FIL    [${b[i]?.length} tkn]: ${b[i]}`); break; }
  process.exit(1);
}
console.log(`KONVERGENS: kodvägs-replik == filens Dataset-sektion, byte-identisk (${replikNu.m.nBolag}-läget); aspektrader korrekt identifierade: ${aspektrader.length} st`);

// Aspektraden: HDFC CAGR MÄTBAR (+18,9 %) men raden bevaras orörd (u2:s regen-yta
// bär redan glömskan från BNP.PA n 14→15; HDFC fördjupar till 16 — könotis)
const cagrFin = rader.filter((r) => r.bransch === "finans" && typeof r.tillvaxt?.resultatCAGR5ar === "number").length;
if (typeof HDFC.tillvaxt.resultatCAGR5ar !== "number") { console.error("ABORT K5: HDFC CAGR ej mätbar — noteringen fel"); process.exit(1); }
console.log(`K5: finans resultatCAGR n=${cagrFin} på diskläget; HDFC bidrar (+18,9 %) ⇒ beräknat n=${cagrFin + 1} — aspektraden i llms bevaras orörd (u2:s yta), könotis bokförd`);

// ── 4. Medianer FÖRE (protokoll) ─────────────────────────────────────────────
const mFöre = rakna(rader);
const fFöre = mFöre.rader.find((r) => r.bransch === "finans");

// ── 5. IDEMPOTENT APPEND ──────────────────────────────────────────────────────
let nyaRader;
if (rader.some((r) => r.ticker === "HDFCBANK.NS")) {
  const bef = rader.find((r) => r.ticker === "HDFCBANK.NS");
  const skillnad = Object.keys(HDFC).filter((k) => JSON.stringify(bef[k]) !== JSON.stringify(HDFC[k]));
  if (skillnad.length) { console.error("ABORT I1: HDFCBANK.NS finns med AVVIKANDE fält:", skillnad.join(",")); process.exit(1); }
  console.log("IDEMPOTENS: HDFCBANK.NS redan närvarande, fältidentisk — ingen append");
  nyaRader = rader;
} else {
  // Gamla rader orörda-bevis: stringify(parse) == råfilen (indent 1 = filens
  // konvention; normaliserad trailing newline)
  const norm = (s) => (s.endsWith("\n") ? s : s + "\n");
  if (JSON.stringify(rader, null, 1) + "\n" !== norm(uniRaw)) {
    console.error("ABORT I2: universumfilens format avviker från stringify(null,1)+\\n — skrivning vägras (riskydd)");
    process.exit(1);
  }
  nyaRader = [...rader, HDFC];
  writeFileSync(UNI, JSON.stringify(nyaRader, null, 1) + "\n");
  console.log(`APPEND: bolagsunivers.json ${rader.length}→${nyaRader.length} (HDFCBANK.NS sist, gamla rader orörda — stringify-bevis)`);
}

// ── 6. Medianer EFTER + diff ──────────────────────────────────────────────────
const mEfter = rakna(nyaRader);
const fEfter = mEfter.rader.find((r) => r.bransch === "finans");
const fmt = (s) => `P/E ${svTal(s.pe.median)} [P25–P75 ${svTal(s.pe.p25)}–${svTal(s.pe.p75)}, n=${s.pe.n}] P/B ${svTal(s.pb.median)} EBIT ${svTal(s.ebit.median)} % FCF ${svTal(s.fcf.median)} % tillv ${svTal(s.till.median)} %`;
console.log(`FINANS FÖRE: ${fmt(fFöre)}`);
console.log(`FINANS EFTER: ${fmt(fEfter)} (antalBolag ${fFöre.antalBolag}→${fEfter.antalBolag})`);
console.log(`TOTALT FÖRE: n=${mFöre.nBolag} P/E ${svTal(mFöre.totalt.pe.median)} (n=${mFöre.totalt.pe.n})`);
console.log(`TOTALT EFTER: n=${mEfter.nBolag} P/E ${svTal(mEfter.totalt.pe.median)} (n=${mEfter.totalt.pe.n})`);

// HDFC:s kvartilplacering i finansgrenen (universumjämförelsen)
const peFin = nyaRader.filter((r) => r.bransch === "finans" && typeof r.vardering?.pe === "number").map((r) => r.vardering.pe).sort((a, b) => a - b);
const posPe = peFin.indexOf(14.28) + 1;
console.log(`KVARTILPLACERING: HDFC P/E 14,28 = rad ${posPe} av ${peFin.length} i finansgrenen; P25 ${svTal(fEfter.pe.p25)} P75 ${svTal(fEfter.pe.p75)}`);
const peAll = nyaRader.filter((r) => typeof r.vardering?.pe === "number").map((r) => r.vardering.pe).sort((a, b) => a - b);
console.log(`UNIVERSUM: P/E-rank ${peAll.filter((x) => x < 14.28).length + 1} av ${peAll.length}; median ${svTal(mEfter.totalt.pe.median)}`);
// Bank-paketets P/B och ROE (superlativtestet: P/B-rankning följer riskjusterad ROE)
for (const t of ["ITUB", "RY", "HSBA.L", "8306.T", "HDFCBANK.NS"]) {
  const r = nyaRader.find((x) => x.ticker === t);
  if (r) console.log(`BANK-PAR: ${t} P/B ${r.vardering.pb} · ROE ${(r.lonksamhet.roe * 100).toFixed(1)} %`);
}

// ── 7. LLMS REGEN (idempotent) ────────────────────────────────────────────────
const nySektion = datasetSektionMedAspekter(nyaRader);
if (nySektion.text === gamlaSektion) {
  console.log("LLMS IDEMPOTENS: sektionen redan på mål-läge — ingen skrivning");
} else {
  const nyLlms = llmsRaw.replace(gamlaSektion, nySektion.text);
  if (nyLlms === llmsRaw) { console.error("ABORT L1: replace gav ingen ändring"); process.exit(1); }
  writeFileSync(LLMS, nyLlms);
  const kontroll = readFileSync(LLMS, "utf8");
  const kontrollSektion = kontroll.match(/^## Dataset — branschmedianer$[\s\S]*?(?=^## )/m)[0];
  if (kontrollSektion !== nySektion.text) { console.error("ABORT L2: skriv-och-återläs-avvikelse"); process.exit(1); }
}
console.log(`LLMS REGEN: Dataset-sektion omgenererad ur kodvägen — ${nySektion.m.nBolag} bolag, totalt P/E ${svTal(nySektion.m.totalt.pe.median)} (n=${nySektion.m.totalt.pe.n}); round-trip disk OK`);
console.log(`SLUTINARIANT: universum ${nyaRader.length} · llms "på ${nySektion.m.nBolag} bolag" · aspektrader bevarade ${aspektrader.length}`);
