#!/usr/bin/env node
/**
 * _s2u1o19-append-hdb.mjs — SPÅR 2 s2-u1 omg19: +1 HDB (Indien/finans 0→1)
 *
 * PIVOTEN: första instansen claimade MUFG 8306.T men u2:s anspråk (17:29:01)
 * nådde klaimfilen 67 s före (17:30:08) — Yara/SAAB-precedensen "först till
 * klaimfilen äger" + b72daf08-KOMPLEMENT-presedensen ⇒ pivottill HDB (anspråkets
 * egna rankade alternativ; u2 lämnade explicit Indien åt syskonen). MUFG-skriptet
 * (_s2u1o19-append-mufg.mjs) lämnas ostagat på disk som databidrag till u2:s
 * leverans — deras append verifierar fältvia sin egen idempotensguard.
 *
 * Kedja (EN sekvens — clobberfönstret omg12–15-läxan):
 *   1. Aritmetik-ABORT-grind FÖRE all skrivning (omg13-läxan)
 *   2. K2-konvergens: llms Dataset-sektion == regen-kroppen på diskens läge
 *      (u2:s kanoniska omg18-kropp, ordagrant — deras _s2u2o19-llms-regen.mjs)
 *   3. Idempotent append av HDB-rad sist i bolagsunivers.json
 *   4. Medianer före/efter (finans-grenen + totalt) — protokollutskrift
 *   5. llms Dataset-sektion HELREGEN på nya läget (aspektraden finans/
 *      resultat-cagr-5ar med HDB:s POSITIVA CAGR: n räknas om i mallen)
 *   6. Skriv + readback + kvitto
 *
 * Bankkonventionen (ITUB/RY/HSBA/8306.T-raderna): evEbit/fcfYield/bruttoMarginal/
 * fcfMarginal/skuldEgenkapital/roic/moat = null — kassaflöde och balans bär
 * kundmedel, inte fri likviditet (RBC-precedensen). FY april–mars med
 * slutårsetikett (TCS.NS-konventionen), FY-serier i rapportvaluta INR,
 * statistics-TTM i USD (NYSE-ADR HDB, förhållande 3 aktier per ADR).
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const LLMS = "public/llms.txt";
const SITE = "https://lab.ak1nvestor.com";

// ── HDB-raden (bankkonventionen; ADR-strukturen enligt ITUB-precedensen) ─────
const HDB = {
  ticker: "HDB",
  namn: "HDFC Bank Limited",
  bransch: "finans",
  land: "Indien",
  valuta: "USD",
  kallor: [
    {
      namn: "StockAnalysis",
      hamtat: "2026-09-19",
      url: "https://stockanalysis.com/stocks/hdb/ (+ /statistics/ + /financials/)",
      paranoid:
        'NYSE-ADR HDB (översikt + statistics + financials, underlag S&P Global Market Intelligence + Fiscal.ai; ADR-slutkurs 2026-09-18, statistics as of 2026-09-19): pris 23,16 USD (+2,21 %), mcap 117,43 mdr USD på ADR-ekvivalenter 5,069 mdr (mcap/pris — replik exakt) mot källans shares-rad 15,40 mdr = UNDERLYANDE aktier (ADR-kvot 15,40/5,069 = 3,04 ≈ 3 aktier per ADR, dokumenterad; ITUB:s aktieklass-not-klass), P/E 14,05 replikerbar (23,16/1,65 = 14,036) mot forward 13,21 ⇒ prognosTillväxt +6,36 % TTE, PEG 2,21 spårkonvention (källans PEG n/a; källans 3-års EPS-prognos +13,32 %/år ger PEG 1,05 som kalibreringsnot), P/B 1,76 (mcap/EG 117,43/66,57 = 1,764) med BVPS-spridningen dokumenterad (EG/aktier 66,57/15,40 = 4,32 mot fältet 4,17 — vägt tal; ADR-väg (23,16/3)/4,17 = 1,85 mot källans P/TBV 1,83), P/S 3,76; TTM USD (mdr): rev 31,20 (+7,81 %), operating 11,48 (36,78 %; pretax samma 36,78 — källan likställer för bank), netto 8,36 (26,79 % replik EXAKT 8,36/31,20), EPS 1,65 (+11,4 %); BANK-KASSAFLÖDETS TECKEN: OCF −28,67, capex −0,41, FCF −29,08 mdr USD = kundmedelsflöden (depositioner/utlåning) — fcfYield/fcfMarginal NULL enligt RBC/ITUB/RY/HSBA/8306.T-konventionen; balans: kassa 25,15 mdr, skuld 59,85 mdr (balansräkningsartefakt — kassan är kundernas), EG 66,57 mdr, working capital −309,84 mdr (bankens natur); ROE 13,84 %, ROA 1,75 % (ITUB 1,58-klassen), ROIC n/a, WACC 4,29 % (källans kapitalkostnadsmodell; ROE−WACC +9,55 pp), effektiv skatt 23,94 % (indisk bolagsskattesats ~25 %-familjen); Altman n/a (bank), Piotroski F 2 (balansexpansionens artefakt — 8306.T-notens klass); utdelning current 0,34 USD (1,47 % replik EXAKT 0,34/23,16), payout 20,59 % (0,34/1,65 = 20,61 — dokumenterad avrundning), utdelningstillväxt +5,93 % YoY med 4 raka tillväxtår, buyback-yield −0,52 % (aktiebasen VÄXTE — inga återköp), shareholder yield 0,95 % (1,47−0,52 EXAKT); beta 0,40 (5 år; ITUB 0,14/8306.T 0,32-familjen), 52v 21,77–37,45 med 52v-change −35,61 % (kursen −38,2 % från toppen, +6,4 % över bottnen), RSI 51,13; institutioner 82,36 % (ADR-sidans mätning — primärnoteringens NSE/BSE-ägarbild domineras av institut via ADR/GDR + indiska institutioner), insiders 0,24 %; analytiker Buy 4 st PT 30,78 (+32,90 %), rev-prognos 3 år +11,51 %/år, EPS +13,32 %/år; anställda 212 958 (ITUB 92 470 — mer än dubbelt); ex-div 2026-08-07 (passerad), nästa rapp 2026-10-19 (Q2 FY2027); räkenskapsår APRIL–MARS med slutårsetikett (FY2026 = apr 2025–mar 2026, TCS.NS-konventionen); FY-serier i M INR (FY2022→FY2026): rev 911 858→1 130 321→2 288 379→2 728 471→2 833 154 med FY2024 = FUSIONSÅRET (HDFC Ltd juli 2023, +102,45 % artefakt), netto 380 528→459 971→640 620→707 923→760 260, EPS INR 34,15→41,13→45,01→46,20→49,28; segment FY2026 brutto (M INR): Retail 3 018 535 · Wholesale 1 745 063 · Insurance 1 080 798 (född med fusionen) · Treasury 821 584 · Other 563 484; branschfältet Financials/Banks–Regional källkonsekvent med finans-grenen; FUSIONSANTECKNING: aktiebasen 11,1→15,4 mdr (bytesförhållande 42:25, +38,4 %) — NI-CAGR +18,89 %/år mot EPS-CAGR +9,61 %/år, differensen = utspädningens pris (replik: (15421/11143)^0,25 = 1,0848 = 1,1889/1,0961); GRUPPTALAN-NOTIS: pågående amerikansk securities class action (lead plaintiff deadline 2026-10-13, sex dagar före rappen) om påståenden kring deposit-inducement-program — faktanotis, inget omdöme',
    },
  ],
  hamtat: "2026-09-19",
  pris: 23.16,
  marknadsKapitalMdr: 117.43,
  tillvaxt: {
    omsattningCAGR5ar: 0.3272,
    resultatCAGR5ar: 0.1889,
    omsattningTillvaxtTTM: 0.0781,
    prognosTillvaxt: 0.0636,
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
    pe: 14.05,
    pb: 1.76,
    evEbit: null,
    peg: 2.21,
    fcfYield: null,
    egenKapitalMultipl: 1.76,
  },
  golv: {
    typ: "osatt",
    vardePerAktie: null,
    marginal: null,
  },
  serier: {
    ar: ["2022", "2023", "2024", "2025", "2026"],
    omsattning: [911858000000, 1130321000000, 2288379000000, 2728471000000, 2833154000000],
    resultat: [380528000000, 459971000000, 640620000000, 707923000000, 760260000000],
    egetKapital: [],
    fcf: [],
  },
  notering:
    "INDIENS FÖRSTA FINANSRAD (Indien 1→2: TCS.NS teknik + HDB finans — världens folkrikaste land och femte största ekonomi fick bankgrenen) och bank-pedagogikens femte ben: ITUB (Brasilien, emerging-kredit) · RY (Kanada, konservativ hypotek) · HSBA.L (Storbritannien, universal) · 8306.T (Japan, keiretsu) · HDB (Indien, sammanslagningsjättens retailmaskin) — fem bankkulturer på fem världsdelar. UNIVERSUMETS SENASTE STORFUSION: HDFC Ltd slogs in i banken juli 2023 (bytesförhållande 42:25) — rev-seriens FY2024-hopp +102,45 % (911 858→2 288 379 M INR) är sammanslagningens artefakt, EPS-serien INR 34,15→49,28 (+9,61 %/år) den kontinuerliga sanningen, och differensen mot NI-CAGR +18,89 %/år är aktiebasens +38,4 % (11,1→15,4 mdr aktier) = utspädningens pris (replikbar: (15 421/11 143)^0,25 = 1,0848). KURSKOLLAPSENS KVINNA: 52-v −35,61 % (21,77–37,45 USD; kursen −38,2 % från toppen) med P/E 14,05 mot forward 13,21 (+6,36 % TTE) — och en faktanotis: pågående amerikansk securities class action om påståenden kring deposit-inducement-program (lead plaintiff-deadline 2026-10-13, sex dagar före Q2-rappen 2026-10-19); analytikernas Buy-PT 30,78 (+32,90 %) mot sekretess: grupptalan är ett processfakta, inget omdöme om målighet. ROE 13,84 % mot WACC 4,29 % = +9,55 pp med ROA 1,75 % — och ADR-strukturen 3:1 (shares-rad 15,40 mdr underlying mot 5,069 mdr ADR) dokumenterad i ITUB:s aktieklass-not-klass. BANKRADERNAS NULL-TRIPPEL: OCF −28,67/FCF −29,08 mdr USD = kundmedelsflöden, skuld 59,85 mdr = balansräkensningsartefakt — fcfYield/fcfMarginal/skuldEgenkapital NULL enligt RBC/ITUB/RY/HSBA/8306.T-konventionen. UTDDELNINGSTRAPPAN INR 7,75→9,50→9,75→1,00→3,00 med FY2024-steget = fusionens aktiejustering (ej utdelningskap): current 0,34 USD (1,47 %, payout 20,59 %, +5,93 % YoY, 4 raka tillväxtår) med buyback-yield −0,52 % (aktiebasen växte — inga återköp) = shareholder yield 0,95 % — tillväxtbankens kapital stannar i balansräkningen (Basel-världens lag), payout-spektrumet ITUB 17,25 · HDB 20,59 · 8306.T 54,87. RETAIL-MASKINEN (segment FY2026 brutto, M INR): Retail 3 018 535 · Wholesale 1 745 063 · Insurance 1 080 798 (född med fusionen) · Treasury 821 584 · Other 563 484 — retail-vikten i ITUB:s 81 %-släktning, med 212 958 anställda (mer än dubbelt mot Itaú). beta 0,40 (ITUB 0,14-familjen). Räkenskapsår april–mars (TCS-konventionen); Q2 FY2027-rapp 2026-10-19 — cellens FIFO-ankare för nästa omgångs uppdatering",
};

// ── 1. ARITMETIK-ABORT-GRIND (FÖRE all skrivning) ───────────────────────────
const GRONA = [];
const kontroll = (id, namn, calc, expect, tol) => {
  const rel = Math.abs(calc - expect) / Math.abs(expect);
  const ok = rel <= tol;
  GRONA.push({ id, namn, calc, expect, rel, ok });
  if (!ok) {
    console.error(`ABORT ${id}: ${namn}: calc ${calc} mot ${expect} (rel ${(rel * 100).toFixed(3)} % > ${(tol * 100).toFixed(2)} %)`);
    process.exit(1);
  }
};

kontroll("A1", "ADR-aktier = mcap/pris", 117.43 / 23.16, 5.069, 0.002);
kontroll("A2", "P/E = pris/EPS", 23.16 / 1.65, 14.05, 0.002);
kontroll("A3", "P/B = mcap/EG", 117.43 / 66.57, 1.76, 0.005);
kontroll("A4", "ADR-kvot ≈ 3 (shares/ADR-tal)", 15.4 / (117.43 / 23.16), 3.038, 0.02);
kontroll("A5", "utdelningsyield", (0.34 / 23.16) * 100, 1.47, 0.005);
kontroll("A6", "payout = DPS/EPS", (0.34 / 1.65) * 100, 20.59, 0.005);
kontroll("A7", "shareholder yield = div+buyback", 1.47 - 0.52, 0.95, 0.005);
kontroll("A8", "EPS-identitet NI/ADR-aktier", 8360 / (117430 / 23.16), 1.65, 0.01);
kontroll("A9", "prognosTillväxt = pe/fwd − 1", 14.05 / 13.21 - 1, 0.0636, 0.005);
kontroll("A10", "PEG = pe/prognosTillväxt(%)", 14.05 / 6.359, 2.21, 0.005);
kontroll("A11", "omsCAGR FY22→26 fusionspåverkad", Math.pow(2833154 / 911858, 1 / 4) - 1, 0.3272, 0.002);
kontroll("A12", "resultatCAGR FY22→26", Math.pow(760260 / 380528, 1 / 4) - 1, 0.1889, 0.002);
kontroll("A13", "EPS-CAGR FY22→26", Math.pow(49.28 / 34.15, 1 / 4) - 1, 0.0961, 0.003);
kontroll("A14", "utspädningens pris: bas-CAGR × EPS-CAGR = NI-CAGR", Math.pow(15421 / 11143, 0.25) * (Math.pow(49.28 / 34.15, 1 / 4)) - 1, 0.1889, 0.003);
kontroll("A15", "nettoMarginal TTM", 8.36 / 31.2, 0.2679, 0.002);
kontroll("A16", "ebitMarginal TTM mot källan", 11.48 / 31.2, 0.3678, 0.005);
kontroll("A17", "−38,2 % från 52v-toppen", 23.16 / 37.45 - 1, -0.3816, 0.005);
kontroll("A18", "FY2026 vägt aktietal (M)", 760260 / 49.28, 15421, 0.002);
kontroll("A19", "FY2026 EPS-tillväxt mot källans 6,67 %", 49.28 / 46.2 - 1, 0.0667, 0.003);
kontroll("A20", "FY2026 rev-tillväxt mot källans 3,84 %", 2833154 / 2728471 - 1, 0.0384, 0.003);
kontroll("A21", "FY2024 fusionsartefakt +102,45 %", 2288379 / 1130321 - 1, 1.0245, 0.002);
kontroll("A22", "ROE−WACC-gap", 13.84 - 4.29, 9.55, 0.001);
// Serieintegritet: 5 stapplar, positiva (CAGR bärbart)
if (HDB.serier.ar.length !== 5 || HDB.serier.omsattning.length !== 5 || HDB.serier.resultat.length !== 5) {
  console.error("ABORT A23: serielängder"); process.exit(1);
}
GRONA.push({ id: "A23", namn: "serielängder 5/5/5 (alla positiva)", calc: 5, expect: 5, rel: 0, ok: true });
if (HDB.serier.resultat.some((x) => x <= 0)) { console.error("ABORT A23b: icke-positivt resultatår"); process.exit(1); }
GRONA.push({ id: "A23b", namn: "resultatserien > 0 (resultatCAGR bärbart)", calc: 1, expect: 1, rel: 0, ok: true });

console.log(`ARITMETIKGRIND: ${GRONA.length}/${GRONA.length} GRÖN (abort-grind passerad FÖRE skrivning)`);

// ── 2. REGEN-KROPPEN (u2:s kanoniska omg18-kropp, ordagrant) ─────────────────
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
const svTal = (x) => (x === null ? "—" : String(x).replace(".", ","));
const stat = (rader, f, pct) => {
  const v = rader.map((b) => f(b) ?? null);
  const n = v.filter((x) => typeof x === "number" && Number.isFinite(x)).length;
  const omv = (x) => (x === null ? null : pct ? runda1(x * 100) : runda1(x));
  return { median: omv(median(v)), p25: omv(percentil(v, 0.25)), p75: omv(percentil(v, 0.75)), n };
};
const NAMN = {
  energi: "Energi", fastighet: "Fastighet", finans: "Finans", halso: "Hälsa",
  industri: "Industri", kommunikation: "Kommunikation", konsument: "Konsument",
  material: "Material", teknik: "Teknik", tillvaxt: "Tillväxt", osatt: "osatt",
};

function byggSektion(u) {
  const hamtat = u.reduce((h, b) => (b.hamtat && b.hamtat > (h ?? "") ? b.hamtat : h), null);
  const totPe = stat(u, (b) => b.vardering?.pe, false);
  const totRes = stat(u, (b) => b.tillvaxt?.resultatCAGR5ar, true);
  const fin = u.filter((b) => b.bransch === "finans");
  const finRes = stat(fin, (b) => b.tillvaxt?.resultatCAGR5ar, true);
  const huvudrad =
    `- [Dataset — branschmedianer](${SITE}/dataset): Median P/E per bransch i AK1A:s universum ` +
    `(${u.length} bolag i 10 branscher, rådata ${hamtat ?? "—"}) — totalt median P/E ${svTal(totPe.median)} ` +
    `(n=${totPe.n} av ${u.length} bolag med mätt P/E). Med P/B, EBIT-marginal, FCF-marginal och omsättningstillväxt per bransch.`;
  const aspektrad =
    `- [Dataset Finans — Resultattillväxt (CAGR 5 år)](${SITE}/dataset/finans/resultat-cagr-5ar): ` +
    `Resultattillväxten (CAGR) inom Finans i AK1A:s universum (rådata ${hamtat ?? "—"}): ` +
    `median ${svTal(finRes.median)} % per år med kvartilspridning P25–P75 ${svTal(finRes.p25)}–${svTal(finRes.p75)} % ` +
    `(n=${finRes.n} bolag med mätt resultat-CAGR). Jämförd med universumet: median ${svTal(totRes.median)} % ` +
    `för samtliga ${totRes.n} bolag med mätt resultat-CAGR. Pedagogisk referens — inte investeringsrådgivning.`;
  const branscher = [...new Set(u.map((b) => b.bransch ?? "osatt"))].sort((a, b) => a.localeCompare(b, "sv"));
  const branschrad = (slug) => {
    const bolag = u.filter((b) => (b.bransch ?? "osatt") === slug);
    const namn = NAMN[slug] ?? slug;
    const pe = stat(bolag, (b) => b.vardering?.pe, false);
    const pb = stat(bolag, (b) => b.vardering?.pb, false);
    const ebit = stat(bolag, (b) => b.lonksamhet?.ebitMarginal, true);
    const fcf = stat(bolag, (b) => b.lonksamhet?.fcfMarginal, true);
    const till = stat(bolag, (b) => b.tillvaxt?.omsattningTillvaxtTTM, true);
    return (
      `- [Dataset ${namn} — branschmedianer](${SITE}/dataset/${slug}): Medianerna för ${namn} i AK1A:s universum ` +
      `(${bolag.length} bolag i branschen, rådata ${hamtat ?? "—"}): P/E ${svTal(pe.median)} med kvartilspridning ` +
      `P25–P75 ${svTal(pe.p25)}–${svTal(pe.p75)} (n=${pe.n}) · P/B ${svTal(pb.median)} · ` +
      `EBIT-marginal ${svTal(ebit.median)} % · FCF-marginal ${svTal(fcf.median)} % · ` +
      `omsättningstillväxt ${svTal(till.median)} %. Jämförd med universumet: median P/E ${svTal(totPe.median)} ` +
      `för samtliga ${u.length} bolag.`
    );
  };
  const intro =
    `AK1A:s publika dataset: median P/E, P/B, EBIT-marginal, FCF-marginal och omsättningstillväxt per bransch, ` +
    `räknat ur det fasta universumet på ${u.length} bolag i ${branscher.length} branscher (rådata ${hamtat ?? "—"}). ` +
    `Observationsantal (n) redovisas per nyckeltal. Varje branschsida redovisar dessutom kvartilspridningen (P25–P75) ` +
    `per nyckeltal och jämför branschens medianer med hela universumets medianer. Under varje bransch finns dessutom ` +
    `aspektsidor — ett nyckeltal per sida (P/E, P/B, ROE, ROIC, EV/EBIT, PEG, marginaler, tillväxt m.fl.) — där varje ` +
    `sida redovisar median, kvartiler och spridning för branschen samt samma mått för hela universumet som ` +
    `jämförelserad. Pedagogisk referens — inte investeringsrådgivning.`;
  const sektion = [intro, "", huvudrad];
  for (const slug of branscher) {
    sektion.push(branschrad(slug));
    if (slug === "finans") sektion.push(aspektrad);
  }
  return { rader: sektion, text: sektion.join("\n") + "\n\n", totPe, finRes, totRes };
}

// Filens nuvarande sektion: kroppen = raderna EFTER rubrik+tomrad, fram till
// nästa "## " (kroppen bär en avslutande tom rad — u2:s skrivmönster)
const lasSektion = (txt) => {
  const rader = txt.split("\n");
  const start = rader.findIndex((r) => r === "## Dataset — branschmedianer");
  const slut = rader.findIndex((r, i) => i > start && r.startsWith("## "));
  if (start === -1 || slut === -1) throw new Error("hittar inte Dataset-sektionen");
  const kropp = rader.slice(start + 2, slut).join("\n").replace(/\n+$/, "\n");
  return { start, slut, kropp, rader };
};

// ── 3. K2-KONVERGENS + APPEND (idempotent) ───────────────────────────────────
const uniRaw = readFileSync(UNI, "utf8");
const llmsRaw = readFileSync(LLMS, "utf8");
let rader = JSON.parse(uniRaw);

if (rader.some((r) => r.ticker === "HDB")) {
  const bef = rader.find((r) => r.ticker === "HDB");
  const skillnad = Object.keys(HDB).filter((k) => JSON.stringify(bef[k]) !== JSON.stringify(HDB[k]));
  if (skillnad.length) { console.error("ABORT I1: HDB finns med AVVIKANDE fält:", skillnad.join(",")); process.exit(1); }
  console.log("IDEMPOTENS: HDB redan närvarande, fältidentisk — ingen append");
} else {
  // K2: filens sektion måste vara en korrekt regen av diskens AKTUELLA läge
  const filSek = lasSektion(llmsRaw);
  const replik = byggSektion(rader);
  const replikText = replik.text.replace(/\n+$/, "\n");
  if (replikText !== filSek.kropp) {
    console.error("ABORT K2: llms-sektionen är INTE en regen av diskens universum (mellanläge/race)");
    const a = replikText.split("\n"), b = filSek.kropp.split("\n");
    for (let i = 0; i < Math.max(a.length, b.length); i++) if (a[i] !== b[i]) { console.error(`  rad ${i}:\n  REPLIK: ${a[i]?.slice(0, 200)}\n  FIL:   ${b[i]?.slice(0, 200)}`); break; }
    process.exit(1);
  }
  console.log(`KONVERGENS: llms Dataset-sektion == regen(disk ${rader.length}-läget), byte-identisk`);

  // Medianer FÖRE (protokoll)
  const mFöre = byggSektion(rader);
  const finFöre = stat(rader.filter((r) => r.bransch === "finans"), (b) => b.vardering?.pe, false);

  // I2: formatbevis före skrivning
  const norm = (s) => (s.endsWith("\n") ? s : s + "\n");
  if (JSON.stringify(rader, null, 2) + "\n" !== norm(uniRaw)) {
    console.error("ABORT I2: universumfilens format avviker från stringify(null,2)+\\n — skrivning vägras (riskydd)");
    process.exit(1);
  }
  const nyaRader = [...rader, HDB];
  writeFileSync(UNI, JSON.stringify(nyaRader, null, 2) + "\n");
  console.log(`APPEND: bolagsunivers.json ${rader.length}→${nyaRader.length} (HDB sist, gamla rader orörda — stringify-bevis)`);

  // Medianer EFTER (omläsning från disk — race-säkert totaltillstånd)
  const efterDisk = JSON.parse(readFileSync(UNI, "utf8"));
  const mEfter = byggSektion(efterDisk);
  const finEfter = stat(efterDisk.filter((r) => r.bransch === "finans"), (b) => b.vardering?.pe, false);
  const fmt = (s, pb) => `P/E ${svTal(s.median)} [P25–P75 ${svTal(s.p25)}–${svTal(s.p75)}, n=${s.n}]`;
  console.log(`FINANS FÖRE: ${fmt(finFöre)} (antalBolag ${rader.filter((r) => r.bransch === "finans").length})`);
  console.log(`FINANS EFTER: ${fmt(finEfter)} (antalBolag ${efterDisk.filter((r) => r.bransch === "finans").length})`);
  console.log(`ASPEKTRAD CAGR: n ${mFöre.finRes.n}→${mEfter.finRes.n}, median ${svTal(mFöre.finRes.median)}→${svTal(mEfter.finRes.median)} %, universum-n ${mFöre.totRes.n}→${mEfter.totRes.n}`);
  console.log(`TOTALT: n=${mFöre.text ? rader.length : "?"} → ${efterDisk.length}; P/E ${svTal(mFöre.totPe.median)} (n=${mFöre.totPe.n}) → ${svTal(mEfter.totPe.median)} (n=${mEfter.totPe.n})`);

  // Kvartilplacering + bank-paketet (superlativ-kontrollens underlag)
  const peFin = efterDisk.filter((r) => r.bransch === "finans" && typeof r.vardering?.pe === "number").map((r) => r.vardering.pe).sort((a, b) => a - b);
  console.log(`KVARTILPLACERING: HDB P/E 14,05 = rad ${peFin.indexOf(14.05) + 1} av ${peFin.length} i finansgrenen; P25 ${svTal(finEfter.p25)} median ${svTal(finEfter.median)} P75 ${svTal(finEfter.p75)}`);
  const peAll = efterDisk.filter((r) => typeof r.vardering?.pe === "number").map((r) => r.vardering.pe).sort((a, b) => a - b);
  console.log(`UNIVERSUM: P/E-rank ${peAll.filter((x) => x < 14.05).length + 1} av ${peAll.length}; median ${svTal(mEfter.totPe.median)}`);
  for (const t of ["ITUB", "RY", "HSBA.L", "8306.T", "HDB"]) {
    const r = efterDisk.find((x) => x.ticker === t);
    if (r) console.log(`BANK-P/E: ${t} ${r.vardering.pe} | P/B ${r.vardering.pb} | payout-spectrum`);
  }

  // ── 4. LLMS REGEN på diskens nya totaltillstånd ─────────────────────────────
  // Race-vakt: läs llms och universum i SAMA block — om en syskonrad landat
  // efter mEfter-läsningen byggs target på det ÄNNU nyare totaltillståndet,
  // aldrig ett äldre (llms får aldrig regressera).
  const nyText = readFileSync(LLMS, "utf8");
  const friskDisk = JSON.parse(readFileSync(UNI, "utf8"));
  if (friskDisk.length !== efterDisk.length) {
    console.log(`RACE-VAKT: syskonrad landade under fönstret (${efterDisk.length}→${friskDisk.length}) — target byggs på friska läget`);
  }
  const mFrisk = byggSektion(friskDisk);
  const filSek2 = lasSektion(nyText);
  const sektionRader = [...mFrisk.rader, ""]; // u2:s mönster: kropp + avslutande tom rad
  const target = mFrisk.text.replace(/\n+$/, "\n");
  const nyRaderArr = nyText.split("\n");
  const ersatt = [...nyRaderArr.slice(0, filSek2.start + 2), ...sektionRader, ...nyRaderArr.slice(filSek2.slut)].join("\n");
  if (ersatt === nyText) { console.log("LLMS: redan på mål-läge — ingen skrivning"); }
  else {
    writeFileSync(LLMS, ersatt);
    const kontrollTxt = readFileSync(LLMS, "utf8");
    const kontrollSek = lasSektion(kontrollTxt).kropp;
    if (kontrollSek !== target) { console.error("ABORT L2: skriv-och-återläs-avvikelse"); process.exit(1); }
    console.log(`LLMS REGEN: Dataset-sektion omgenererad ur kodvägen — ${friskDisk.length} bolag; round-trip disk OK`);
  }
  console.log(`SLUTINARIANT: universum ${friskDisk.length} · aspektrad CAGR n=${mFrisk.finRes.n} · rådata ${friskDisk.reduce((h, b) => (b.hamtat && b.hamtat > (h ?? "") ? b.hamtat : h), null)}`);
}
