#!/usr/bin/env node
/** _r253-u48-inlagg.mjs — v173 U48: kirurgisk append 309→310 — Indus Towers
 *  INDUSTOWER.NS (Indien/kommunikation 1→2, Bharti+Indus-duon — operatören mot
 *  tornen, NSE/INR med BHARTIARTL-precedensen). */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/portfolj-system/bolagsunivers.json";
const u = JSON.parse(readFileSync(FIL, "utf8"));
if (u.length !== 309) { console.error(`FEL: förväntade 309 rader, fann ${u.length}`); process.exit(1); }
if (u.some(r => r.ticker === "INDUSTOWER.NS")) { console.error("FEL: INDUSTOWER.NS finns redan"); process.exit(1); }

const rad = {
  ticker: "INDUSTOWER.NS",
  namn: "Indus Towers Limited",
  bransch: "kommunikation",
  land: "Indien",
  valuta: "INR",
  kallor: [{
    namn: "StockAnalysis",
    hamtat: "2026-09-25",
    url: "https://stockanalysis.com/quote/nse/INDUSTOWER/",
    paranoid: "NSE-primärnotering (översikt + statistics + financials + cash-flow-statement; underlag S&P Global Market Intelligence + Financial Modeling Prep; stängningskurs 2026-09-25 15:15 IST). Källan presenterar Indus i INR — serier i M INR, ingen valutabrygga. KÄLLSPRIDNINGAR DOKUMENTERADE: (1) EV/EBITDA-fältet 6,41 mot dekompositionens EV/EBITDA 7,59 (källans EV/EBITDA bär egen underlagsbas ~0,96T — noterat); (2) P/E-familjen sprider 1,6 % mellan aktiebaserna (14,01 källa · 13,97 mcap/netto · 13,79 pris/EPS). Utdelningen NYFÖDD: cashflow-vyn bär endast TTM-beloppet 29 638 M (bolagets första utdelning på åratal) — års-serie ej möjlig, dokumenterat. Bharti-koncernens majoritetsägande syns ej i källans institutionsfält (insiders n/a) — förälder/barn-precedensen (ACA/AMUN · ULVR/HUL)"
  }],
  hamtat: "2026-09-25",
  pris: 374,
  marknadsKapitalMdr: 1000,
  tillvaxt: { omsattningCAGR5ar: 0.0406, resultatCAGR5ar: 0.029, omsattningTillvaxtTTM: 0.0672, prognosTillvaxt: 0.086 },
  lonksamhet: { roe: 0.1891, roic: 0.1454, bruttoMarginal: 0.5594, ebitMarginal: 0.328, nettoMarginal: 0.2178, fcfMarginal: 0.2087 },
  stabilitet: { skuldEgenkapital: 0.52, rantaTackning: 5.75, fcfPositivaSenaste5: 5, kassaManaderBurnRate: null, nyemissionerSenaste5ar: 0 },
  aterkop: { senasteArMdr: 29.638, andelUtestande: null, insiderkopSenaste6man: 0 },
  moat: { bruttoMarginalMedel5ar: 0.5493, bruttoMarginalSpread5ar: 0.0403, roeMedel5ar: null },
  vardering: { pe: 14.01, pb: 2.42, evEbit: 10.6, peg: null, fcfYield: 0.0685, egenKapitalMultipl: 2.42 },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2022", "2023", "2024", "2025", "2026"],
    omsattning: [277172, 283818, 286006, 301228, 324931],
    resultat: [63731, 20400, 60362, 99317, 71449],
    egetKapital: [],
    fcf: [42822, 26292, 128610, 70582]
  },
  notering: "INDIEN/KOMMUNIKATION 1→2 — NÄTETS TVÅ SKIKT FÖDS: BHARTI (operatören — frekvensauktioner, spektrum, abonnenter; duopolets marginmakt) + INDUS TOWERS (tornen — nätets FYSISKA infrastruktur: 3 783 anställda, 86,9 M INR per person = Indien-svepets högsta produktivitet; hyresavtalens längd = intäkternas karaktär): samma cell, två kapitallogiker — spektrumets licenstid mot stålets livslängd. OBS: Bharti är SAMTIDIGT stor ägare och största hyresgäst — förälder/barn-kopplingen i en affärsrelation (ACA/AMUN-precedensens kusin, dokumenterad). SIGNATURTAL — KONSOLIDERINGENS BERGPLOGGTAVLA: netto [63,7 · 20,4 · 60,4 · 99,3 · 71,4] + TTM 71,6 Mdr — FY24-BOTTEN (Vodafone Ideas uteblivna hyror: netto 20,4, kassa 0,6 Mdr!) → FY25-TOPPEN 99,3 (backlag/återvinning) → FY26-normalisering 71,4: TELEKOMKRIGETS EFTERMATH i fem tal — medan omsättningen växer OLIDT [277 → 324,9] (+4,1 %/år, CAGR dokumenterad) och bruttomarginalen håller ~55 %. FCF samma berg: [42,8 · 26,3 · 128,6 · 70,6] + TTM 68,6 (FY25-topp = backlag; fem senaste mätvärdena positiva). KASSANS ÅTERUPPBYGGGNAD: 0,6 → 73,6 Mdr på två år — balansens historia om krisen som kurades. UTDENINGEN NYFÖDD: DPS 14,00 INR (3,74 % EXAKT) · betald TTM 29 638 M (första utdelningen på åratal) · PAYOUT RÄTT BAS betald/netto = 41,4 % (DPS/EPS 51,6 % — två baser dokumenterade) · FCF-payout 53,8 (källans fält ✓). TRETTON LÅS: EV-dekomp EXAKT (1 000+214,3−73,6 = 1 140,8 mot 1,14T) · P/OCF 6,46 EXAKT · EV/EBIT 10,58 ✓ · FCF-yield 6,85 EXAKT · divY 3,743 EXAKT · netto-M 21,78 EXAKT · brutto-M 55,94 EXAKT · skatt 25,57 EXAKT (24,59/96,16) · D/E 0,52 ✓ + snäva P/E-familj 14,01/13,97/13,79 (1,6 % baser) · PS 3,05 · PB 2,42 (mcap/EK; pris/BVPS 2,38) · P/FCF 14,61 · EV/Sales 3,48 · EV/FCF 16,66 · EV/Earnings 15,96. PEG NULL (källans 1,83 utan ren replikerbar bas). EV/EBITDA-SPRIDNING dokumenterad (källans 6,41 mot dekompositionens 7,59 — underlagsbas ~0,96T). EBITDA-M 45,72 % = TORNENS KAPITALLOGIK (Bharti 22-ish: infrastrukturen bär marginalen operatören inte kan). ROIC 14,54 mot WACC 4,86 = +9,68 pp. KURSEN: 374,00 INR · 52v +4,44 % — DUONS ENDA POSITIVA (tornen-okonomick:n: medan operatörerna föll på AI-telefoni-oro stod infrastrukturen) · under båda MA (50d 382 · 200d 414) · RSI 45,7 · BETA 0,05 (universumets flackaste klass) · panel HOLD PT 436,46 (+16,70 %) — svepets första Hold (ärligt datafakta). RAPPDAG 2026-10-23 — klusterdagen (RELIANCE + INFY samma dag; fönstret). Grundat 2007 (Indus-fusionen). FY april–mars slutårsetikett."
};

u.push(rad);
const ut = JSON.stringify(u, null, 2) + "\n";
writeFileSync(FIL, ut);

for (let i = 1; i <= 2; i++) {
  const t = JSON.parse(readFileSync(FIL, "utf8"));
  const r = t[t.length - 1];
  const ok = t.length === 310 && r.ticker === "INDUSTOWER.NS" && r.pris === 374 && r.vardering.pe === 14.01
    && r.serier.omsattning.length === 5 && r.serier.resultat[3] === 99317 && r.marknadsKapitalMdr === 1000
    && t.filter(x => x.land === "Indien" && x.bransch === "kommunikation").length === 2;
  console.log(`LÄS-TILLBAKA ${i}: ${ok ? "GRÖN" : "RÖD"} (n=${t.length}, sista=${r.ticker}, kommunikation-Indien=${t.filter(x => x.land === "Indien" && x.bransch === "kommunikation").length})`);
  if (!ok) process.exit(1);
}
writeFileSync("/tmp/r253-indus/kvitto.txt",
  `U48 INDUSTOWER.NS INLAGD ${new Date().toISOString()}\n309→310 · kommunikation-Indien 1→2\nLÅS EXAKTA: EV-dekomp (1 140,8 mot 1,14T) · P/OCF 6,46 · EV/EBIT 10,58 · FCF-yield 6,85 · divY 3,743 · netto-M 21,78 · brutto-M 55,94 · skatt 25,57\nPEG NULL (1,83 utan ren bas) · EV/EBITDA-spridning dokumenterad\nPayout rätt bas 29 638/71 571 = 41,4 % (utdelningen nyfödd — endast TTM i cashflow)\nRappdag 10-23 klusterdagen · 52v +4,44 % duons enda positiva · beta 0,05\n`);
console.log("KVITTO: /tmp/r253-indus/kvitto.txt");
