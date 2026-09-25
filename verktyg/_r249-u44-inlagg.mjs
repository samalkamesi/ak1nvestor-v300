#!/usr/bin/env node
/** _r249-u44-inlagg.mjs — v173 U44: kirurgisk append 305→306 — Infosys INFY.NS
 *  (Indien/teknik 1→2, TCS+INFY-duon, NSE/INR med TCS-precedensen).
 *  Valutabrygga dokumenterad: källan presenterar ADR-noterade INFY i USD; INR-årsbilderna
 *  härledda ur segmentvyens INR-tal (implicita kurser 81,8→89,5). TTM-låsen mot statistics INR. */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/portfolj-system/bolagsunivers.json";
const u = JSON.parse(readFileSync(FIL, "utf8"));
if (u.length !== 305) { console.error(`FEL: förväntade 305 rader, fann ${u.length}`); process.exit(1); }
if (u.some(r => r.ticker === "INFY.NS")) { console.error("FEL: INFY.NS finns redan"); process.exit(1); }

const rad = {
  ticker: "INFY.NS",
  namn: "Infosys Limited",
  bransch: "teknik",
  land: "Indien",
  valuta: "INR",
  kallor: [{
    namn: "StockAnalysis",
    hamtat: "2026-09-25",
    url: "https://stockanalysis.com/quote/nse/INFY/",
    paranoid: "NSE-primärnotering (översikt + statistics + financials + cash-flow-statement; underlag S&P Global Market Intelligence + Financial Modeling Prep; stängningskurs 2026-09-25 15:15 IST). VALUTABRYGGA: källan presenterar financials/cashflow i USD (NYSE-ADR-noteringen — TCS utan ADR visar INR); INR-årsbilderna härledda ur segmentvyens INR-tal med implicita periodkurser 81,8→89,5 (FY23→FY26; FY22 74,6) — rupeens försvagning är radens valutavind: samma tillväxt +5,4 %/år i USD och +10,3 %/år i INR. Segmentvyn bär Total-rad med 5 värden mot 6 kolumner (parsningsLucka) — segmentsumman är INR-sanningen; TTM-Other 97 962 M = valuta/hedge-post (dokumenterad)"
  }],
  hamtat: "2026-09-25",
  pris: 998.8,
  marknadsKapitalMdr: 4110000,
  tillvaxt: { omsattningCAGR5ar: 0.1035, resultatCAGR5ar: 0.0761, omsattningTillvaxtTTM: 0.041, prognosTillvaxt: 0.0099 },
  lonksamhet: { roe: 0.32, roic: 0.4169, bruttoMarginal: 0.2968, ebitMarginal: 0.2038, nettoMarginal: 0.1637, fcfMarginal: 0.1843 },
  stabilitet: { skuldEgenkapital: 0.10, rantaTackning: 86.19, fcfPositivaSenaste5: 5, kassaManaderBurnRate: null, nyemissionerSenaste5ar: 0 },
  aterkop: { senasteArMdr: 179537, andelUtestande: null, insiderkopSenaste6man: 0 },
  moat: { bruttoMarginalMedel5ar: 0.3019, bruttoMarginalSpread5ar: 0.0313, roeMedel5ar: null },
  vardering: { pe: 13.24, pb: 4.49, evEbit: 9.98, peg: null, fcfYield: 0.0875, egenKapitalMultipl: 4.49 },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2023", "2024", "2025", "2026"],
    omsattning: [1489419, 1565706, 1640102, 1804173],
    resultat: [243757, 266976, 268682, 296514],
    egetKapital: [],
    fcf: [207205, 242995, 347767, 334104]
  },
  notering: "INDIEN/TEKNIK 1→2 — IT-KONSULTDUOPOLET FÖDS: TCS (skalan: 584 519 anställda · 4,72 M INR omsättning/person · världens största renodlade IT-koncern) + INFY (produktiviteten: 328 062 anställda · 5,85 M INR/person +24 % högre · 0,958 M vinst/person) — samma bransch, två strategier: gigantens volym mot Bengaluru-grundarnas margin-disciplin (grundat 1981 på Sudha Murty's 10 000-rsplån — källflödets genesis). SIGNATURTAL — AI-RETRÄTTENS BOTTEN: kursen 998,80 INR ligger 1,7 % över 52-v-LÄGSTA (spann 982,40–1 728,00; −33,17 % på 52 v; −42,2 % från toppen) UNDER BÅDA MA (50d 1 107 · 200d 1 278) med RSI 29,8 — medan CLSA samtidigt nedgraderar 'legacy IT = AI losers' (TCS/INFY/TechM till Hold — källflödet dokumenterar sektorns omprisning); panelen 42 analytiker Buy PT 1 204,52 (+20,60 %). KASSKULTUREN (duons gemensamma doktrin): NETTOKASSA +208,1 mdr INR (51,39/aktie · kassa 295,4 − skuld 87,3) · D/E 0,10 (TCS 0,10 identiskt) · räntetäckning 86,19 · Altman Z 9,44. KAPITALÅTERGÅNGEN: ROIC 41,69 mot WACC 4,82 = +36,87 pp (TCS +61,2 — duons elit-gap) · ROE 32,00. UTD-OCH-ÅTERKÖPSMASKINEN: DPS 50 INR (5,01 % EXAKT · +11,63 %/år); PAYOUT RÄTT BAS betald TTM 2 453/3 323 = 73,8 % (källrad 73,83; DPS/EPS-dubbeltheten 65,3 % dokumenterad — TD-mönstret); återköp födda FY24 [1 503 → 1 398 → 2 006 MUSD] = 179,5 mdr INR FY26 (4,5 % av mcap — den VERKLIGA shareholder-yielden ~9,5 % dokumenterad mot källans fältkonvention 6,37 = div+aktieändring −1,37 %). TTM-LÅSEN (statistics INR): EV-dekomposition EXAKT (4 110+87,3−295,4 = 3 901,9 mot 3,91T) · PS 2,14 · PB 4,49 · P/FCF 11,42 · P/OCF 10,62 · EV/Sales 2,03 · EV/EBIT 9,98 · EV/FCF 10,86 · EV/Earnings 12,43 · FCF-YIELD 8,75 EXAKT · NETTO-M 16,37 · EBIT-M 20,38 · SKATT 26,57 (113,8/428,4) — PEG NULL (basblandning: källa 2,33 · /EPS-fwd 3,06 · /rev-fwd 2,24); P/E-familjen 13,24/13,11/pris-per-EPS 13,04 (källans EPS/mcap-bas 1,2 % dokumenterad). FCF-IDENTITETEN TTM EXAKT: OCF 386,91 − capex 27,23 = 359,67 (FCF-M 18,43 · capex 1,4 % av omsättningen — konsultens kapitallätthet). SERIERNA (valutabryggan ovan): oms INR [1 489 419 · 1 565 706 · 1 640 102 · 1 804 173] (CAGR +10,3 %; USD-vyn +5,4 %) · netto INR [243 757 · 266 976 · 268 682 · 296 514] (USD [2 981 · 3 167 · 3 158 · 3 313] CAGR +2,9 % — lågvatten-växarn; Q1 FY27 netto +12 % YoY = VÄNDNINGEN dokumenterad i källflödet) · FCF INR [207 205 · 242 995 · 347 767 · 334 104] + TTM 359,67 mdr (FY25-topp = WC-frigörelse; FY26-dip dokumenterad neutralt; SBC växer 56→108 MUSD — AI-talangkriget). SEGMENT (åtta branschben, TTM-andelar av segmentsumman): Financial Services 27,9 % · Manufacturing 16,2 % · Energy/Utilities/Resources 13,3 % · Retail 12,8 % · Communication 12,2 % · Hi-Tech 7,8 % · Life Sciences 7,2 % · Övrigt 2,6 % — bank/styrsel-segmentet bär fjärdedelen; GEO-VY EJ ERBJUDEN i källan (dokumenterat). BRUTTO-KONTRASTEN: INFY 29,68 mot TCS 40,39 i SAMMA källa = IFRS-indelningsdifferens (personalredovisning) — dokumenterad som datafakta, EJ direkt jämförbar. Beta 0,11 (TCS 0,17 — duon bland universumets lugnaste) · institutioner 66,37 % · insiders 2,56 %. RAPPDAG 2026-10-23 CONFIRMED (samma dag som RELIANCE — v172-fönstret; TCS 10-09 är teknikgrenens FIFO-första). FY april–mars, slutårsetikett (TCS-konventionen exakt)."
};

u.push(rad);
const ut = JSON.stringify(u, null, 2) + "\n";
writeFileSync(FIL, ut);

// Läs-tillbaka ×2
for (let i = 1; i <= 2; i++) {
  const t = JSON.parse(readFileSync(FIL, "utf8"));
  const r = t[t.length - 1];
  const ok = t.length === 306 && r.ticker === "INFY.NS" && r.pris === 998.8 && r.vardering.pe === 13.24
    && r.serier.omsattning.length === 4 && r.serier.fcf[3] === 334104 && r.land === "Indien" && r.valuta === "INR"
    && t.filter(x => x.land === "Indien" && x.bransch === "teknik").length === 2;
  console.log(`LÄS-TILLBAKA ${i}: ${ok ? "GRÖN" : "RÖD"} (n=${t.length}, sista=${r.ticker}, teknik-Indien=${t.filter(x => x.land === "Indien" && x.bransch === "teknik").length})`);
  if (!ok) process.exit(1);
}
writeFileSync("/tmp/r249-infy/kvitto.txt",
  `U44 INFY.NS INLAGD ${new Date().toISOString()}\n305→306 · teknik-Indien 1→2\nTRETTON LÅS: EV-dekomp EXAKT · PS 2,14 · PB 4,49 · P/FCF 11,42 · P/OCF 10,62 · EV/Sales 2,03 · EV/EBIT 9,98 · EV/FCF 10,86 · EV/Earnings 12,43 · FCF-yield 8,75 EXAKT · divY 5,01 EXAKT · payout rätt bas 73,8 (källa 73,83) · netto-M 16,37 · EBIT-M 20,38 · D/E 0,10 · skatt 26,57\nPEG NULL (basblandning 2,33/3,06/2,24)\nFCF-identitet TTM exakt: 386,91−27,23=359,67\nRappdag 2026-10-23 CONFIRMED\n`);
console.log("KVITTO: /tmp/r249-infy/kvitto.txt");
