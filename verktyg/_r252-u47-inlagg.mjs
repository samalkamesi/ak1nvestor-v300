#!/usr/bin/env node
/** _r252-u47-inlagg.mjs — v173 U47: kirurgisk append 308→309 — Oil and Natural Gas
 *  Corporation ONGC.NS (Indien/energi 1→2, Reliance+ONGC-duon, NSE/INR,
 *  RELIANCE-precedensen). */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/portfolj-system/bolagsunivers.json";
const u = JSON.parse(readFileSync(FIL, "utf8"));
if (u.length !== 308) { console.error(`FEL: förväntade 308 rader, fann ${u.length}`); process.exit(1); }
if (u.some(r => r.ticker === "ONGC.NS")) { console.error("FEL: ONGC.NS finns redan"); process.exit(1); }

const rad = {
  ticker: "ONGC.NS",
  namn: "Oil and Natural Gas Corporation Limited",
  bransch: "energi",
  land: "Indien",
  valuta: "INR",
  kallor: [{
    namn: "StockAnalysis",
    hamtat: "2026-09-25",
    url: "https://stockanalysis.com/quote/nse/ONGC/",
    paranoid: "NSE-primärnotering (översikt + statistics + financials + cash-flow-statement; underlag S&P Global Market Intelligence + Financial Modeling Prep; stängningskurs 2026-09-25 15:15 IST). Källan presenterar ONGC i INR — serier i M INR, ingen valutabrygga. KÄLLSPRIDNINGAR DOKUMENTERADE: (1) EV 4,78T mot dekompositionens 4,40T (8,6 % — minoritets/underlagsbärning, Engie-doktrinen); (2) brutto-årsserien ~17-21 % mot statistics-TTM 35,33 % (källans bruttodefinitioner skiljer ~15 p — moat-fälten lämnas NULL med not); (3) segmentvyn med ELIMINERINGSBEN summerar 8-13 % över IS-intäkten (bruttokonvention — andelar av segmentsumman redovisas). Statens majoritetsägande (~58 %) syns ej i källans institutionsfält — strukturfakta-not"
  }],
  hamtat: "2026-09-25",
  pris: 235.25,
  marknadsKapitalMdr: 3010,
  tillvaxt: { omsattningCAGR5ar: 0.0551, resultatCAGR5ar: -0.0233, omsattningTillvaxtTTM: 0.1615, prognosTillvaxt: 0.2295 },
  lonksamhet: { roe: null, roic: 0.0761, bruttoMarginal: 0.3533, ebitMarginal: 0.0783, nettoMarginal: 0.0618, fcfMarginal: 0.0965 },
  stabilitet: { skuldEgenkapital: 0.43, rantaTackning: 4.4, fcfPositivaSenaste5: 5, kassaManaderBurnRate: null, nyemissionerSenaste5ar: 0 },
  aterkop: { senasteArMdr: 169.801, andelUtestande: 0.0004, insiderkopSenaste6man: 0 },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
  vardering: { pe: 6.91, pb: 0.73, evEbit: 8.1, peg: null, fcfYield: 0.1953, egenKapitalMultipl: 0.73 },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2022", "2023", "2024", "2025", "2026"],
    omsattning: [4913005, 6323260, 6015809, 6120636, 6086628],
    resultat: [455221, 367093, 491439, 362256, 414244],
    egetKapital: [],
    fcf: [337217, 351318, 467278, 351813]
  },
  notering: "INDIEN/ENERGI 1→2 — VERTIKALENS TVÅ ÄNDAR FÖDS: RELIANCE (nedströms+digital — raffinaderierna, petkem, Jio/Retail; minoritetstrappan flyttar koncernvikt) + ONGC (uppströms — Indiens statliga råolje/gas-producent, grundad 1955): energi-cellens hela kedja i ett land, TTE+BP/XOM-klassens indiska spegel med staten som majoritetsägare (~58 %, strukturfakta — källans institutionsfält 23,01 % speglar bara free float). SIGNATURTAL — RÅVARUPLATTFORMENS ANATOMI: omsättningen PLATT [4 913 → 6 323 → 6 016 → 6 121 → 6 087] Mdr (CAGR +5,5 %; prissett av råvaran — FY22:61,7 % och FY23:28,7 % var oljeprisfenomen, sedan ±5 %-bandet) medan TTM +16,2 % (olje-CF-fönstret) och NETTOTS BERGPLOGGTAVLA [455 · 367 · 491 · 362 · 414] + TTM 435 Mdr — FY22-högt basår ger resCAGR −2,3 % (dokumenterat som plattforms-netto, ej kollaps: fem raka FCF-år [337 · 351 · 467 · 352 · 352] + TTM 587). SEGMENT (brutto-andelar FY26 med ELIMINERINGSBEN −11,7 %): Refining & Marketing 88,2 % av brutto-intäkten men VINSTEN sitter i E&P — Offshore 14,0 + Onshore 6,0 bär marginalerna (upstream-tjocken, R&M-tunnheten: EBIT-M 7,83 % mot E&P-drift); vertikal-logiken i en andelstabell. VÄRDERINGENS STATLIGA RABATT: P/B 0,73 (mcap/EK 3 010/4 100 — under 1: substansrabatt 27 %; BVPS-basen 0,80) · P/E 6,91 (replik mcap/netto 6,914 EXAKT) · fwd 5,62 (TTE-prognos +22,95 %) · P/FCF 5,12 EXAKT · P/OCF 2,67 EXAKT · EV/Earnings 10,98 EXAKT (på källans EV) · EV/FCF 8,13 EXAKT · EV/Sales 0,68 · EV/EBIT 8,10 · PS 0,43 · **FCF-YIELD 19,53 % EXAKT** (587,3/3 010 — råvarucykelns högvatten) · divY 5,63 % EXAKT (13,25/235,25) · netto-M 6,18 · skatt 24,24 EXAKT · D/E 0,43. PEG NULL (källans 1,09 utan ren replikerbar bas). EV-SPRIDNINGEN dokumenterad: 4,78T mot dekomp 4,40T (8,6 % — Engie-klassen). UTDELNINGEN OLJE-LÄNKAD: DPS 13,25 (5,63 % EXAKT) · betald serie [169,8 · 176,1 · 128,9 · 169,8 · 129,2] Mdr svänger med priset (policy-doktrinen: oljeinkomst → utdelning) · PAYOUT RÄTT BAS betald TTM 169 801/435 192 = 39,0 % · FCF-payout 28,4 % (källans fält 15,53 bär egen bas — notis). BALANSEN: kassa [121 → 354] Mdr (FY22-frånvaran kurad) · skuld-topp FY24 1 912 → nedtrappad 1 743 · nettoskuld −1 390 Mdr (−110,5/aktie) · räntetäckning 4,40 (kapitalintensiv borrare — D&A 497 Mdr/år, capex 540 Mdr). ROIC 7,61 mot WACC 5,03 = +2,58 pp (råvarumodellens smala gap — RELIANCE +0,8?: duon bär inte moat i kapitalmått utan i RESURSERNAS livslängd). KURSEN: 235,25 INR · 52v −1,37 % (FLACKAST i duon — oljeprissvag året) · under båda MA (50d 238 · 200d 257) · RSI 49 · beta 0,10 · Buy PT 294,70 (+25,27 %). 23 117 anställda · rev/person 304,6 M INR (duons högsta — borrplattformsautomation). RAPPDAG 2026-11-13 — EFTER fönstrets slut (11-04): november-FIFO med ENGI (11-05) och SN efter. FY april–mars slutårsetikett."
};

u.push(rad);
const ut = JSON.stringify(u, null, 2) + "\n";
writeFileSync(FIL, ut);

for (let i = 1; i <= 2; i++) {
  const t = JSON.parse(readFileSync(FIL, "utf8"));
  const r = t[t.length - 1];
  const ok = t.length === 309 && r.ticker === "ONGC.NS" && r.pris === 235.25 && r.vardering.pe === 6.91
    && r.serier.omsattning.length === 5 && r.serier.resultat[4] === 414244 && r.marknadsKapitalMdr === 3010
    && t.filter(x => x.land === "Indien" && x.bransch === "energi").length === 2;
  console.log(`LÄS-TILLBAKA ${i}: ${ok ? "GRÖN" : "RÖD"} (n=${t.length}, sista=${r.ticker}, energi-Indien=${t.filter(x => x.land === "Indien" && x.bransch === "energi").length})`);
  if (!ok) process.exit(1);
}
writeFileSync("/tmp/r252-ongc/kvitto.txt",
  `U47 ONGC.NS INLAGD ${new Date().toISOString()}\n308→309 · energi-Indien 1→2\nLÅS EXAKTA: P/E 6,914 · P/FCF 5,126 · P/OCF 2,664 · EV/Earnings 10,98 · EV/FCF 8,137 · FCF-yield 19,53 · divY 5,633 · skatt 24,24 · PS 0,428 · PB 0,734 (mcap/EK)\nPEG NULL (1,09 utan ren bas) · EV-spridning 8,6 % dokumenterad\nPayout rätt bas 169 801/435 192 = 39,0 %\nRappdag 11-13 EFTER fönstret\n`);
console.log("KVITTO: /tmp/r252-ongc/kvitto.txt");
