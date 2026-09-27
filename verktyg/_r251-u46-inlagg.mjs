#!/usr/bin/env node
/** _r251-u46-inlagg.mjs — v173 U46: kirurgisk append 307→308 — ITC Limited ITC.NS
 *  (Indien/konsument 1→2, HUL+ITC FMCG-duopolet, NSE/INR med HINDUNILVR-precedensen). */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/portfolj-system/bolagsunivers.json";
const u = JSON.parse(readFileSync(FIL, "utf8"));
if (u.length !== 307) { console.error(`FEL: förväntade 307 rader, fann ${u.length}`); process.exit(1); }
if (u.some(r => r.ticker === "ITC.NS")) { console.error("FEL: ITC.NS finns redan"); process.exit(1); }

const rad = {
  ticker: "ITC.NS",
  namn: "ITC Limited",
  bransch: "konsument",
  land: "Indien",
  valuta: "INR",
  kallor: [{
    namn: "StockAnalysis",
    hamtat: "2026-09-25",
    url: "https://stockanalysis.com/quote/nse/ITC/",
    paranoid: "NSE-primärnotering (översikt + statistics + financials + cash-flow-statement; underlag S&P Global Market Intelligence + Financial Modeling Prep; stängningskurs 2026-09-25 15:15 IST). Källan presenterar ITC i INR — serier i M INR, ingen valutabrygga. Segmentvyn redovisas BRUTTO (fem ben summerar 1,26× netto-intäkten — andelar av segmentsumman, inte lås mot totalen). FY2025-nettots höjd 347 466 M bär engångspost (hotell-avknoppningsåret) — resCAGR redovisas med not. CF-vyns FY2022-kolumn saknas — fcf-serien FY2023–FY2026 + TTM; fem senaste mätvärdena alla positiva. Utdelningens FCF-payout 111,6 % dokumenterad (tobaksmodellen — kassabufferten 245 mdr bär)"
  }],
  hamtat: "2026-09-25",
  pris: 268.9,
  marknadsKapitalMdr: 3370,
  tillvaxt: { omsattningCAGR5ar: 0.0678, resultatCAGR5ar: 0.0793, omsattningTillvaxtTTM: -0.0323, prognosTillvaxt: -0.0374 },
  lonksamhet: { roe: null, roic: 0.3559, bruttoMarginal: 0.5828, ebitMarginal: 0.3132, nettoMarginal: 0.2594, fcfMarginal: 0.2064 },
  stabilitet: { skuldEgenkapital: 0.03, rantaTackning: 220.83, fcfPositivaSenaste5: 5, kassaManaderBurnRate: null, nyemissionerSenaste5ar: 1 },
  aterkop: { senasteArMdr: 179.676, andelUtestande: null, insiderkopSenaste6man: 0 },
  moat: { bruttoMarginalMedel5ar: 0.5742, bruttoMarginalSpread5ar: 0.0393, roeMedel5ar: null },
  vardering: { pe: 16.98, pb: 4.63, evEbit: 12.95, peg: null, fcfYield: 0.0483, egenKapitalMultipl: 4.63 },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2022", "2023", "2024", "2025", "2026"],
    omsattning: [606681, 709369, 679319, 753233, 788684],
    resultat: [152427, 191917, 204588, 347466, 206895],
    egetKapital: [],
    fcf: [136339, 161346, 136163, 153483]
  },
  notering: "INDIEN/KONSUMENT 1→2 — FMCG-DUOPOLET FÖDS: HUL (mäkesfokus — Unilever-barnets 50-plus-varumärkesportfölj, bruttomarginal 50,4 %) + ITC (portföljbredd från tobaksgrunden — cigarett-kassamaskinen som bygger FMCG/Agri/Papper): samma gren, två kapitalkulturer — dotterbolagsdisciplinen mot konglomeratets internfinansiering. SIGNATURTAL — TOBAKSMARGINALENS TYNGDLAG: bruttomarginal 58,28 % TTM (HUL 50,4 — ITC:s cig-mix bär GRENSER HÖGRE; femårsserien [55,4 · 57,9 · 59,3 · 56,7 · 57,8] spread 3,9 p) med EBIT-M 31,32 (HUL 21,1) och netto-M 25,94 — segmentbilden TTM (brutto-andelar): FMCG-Cigarettes 44,8 % · FMCG-Others 23,7 % · Agri 18,1 % · Paperboards 8,4 % · Övrigt 4,9 % — TOBAKEN BÄR 45 % AV INTÄKTEN men (marginalbilden) nästan hela vinstkärnan; cig-segmentet växer dessutom +13,1 %/år [261 583 → 406 010] med TTM-hop +17 %. UTDELNINGSMASKINEN (tobaksmodellen, BTI-klassen): DPS 14,50 INR (5,39 % EXAKT · +1,05 %) med PAYOUT RÄTT BAS betald TTM 179 676/netto 198 394 = 90,6 % (DPS/EPS 91,5 % — två baser tight) och FCF-PAYOUT 111,59 % (betalar ÖVER FCF — kassabufferten 245,1 mdr bär, nettokassa +221,1 = 17,65/aktie): avkastningsprofilen HUL inte kan matcha (2,12 %/64 % payout). FY2025-ENGÅNGSÅRET dokumenterat: netto 347 466 M (hotell-avknoppningens gain) mot FY26 206 895 — resCAGR +7,9 % med basårsnot, EPS-trappan [12,37 · 15,46 · 16,39 · 27,75 · 16,51] + TTM 15,84 visar engångsposten öppet. KASSA- OCH SKULDKULTUREN: D/E 0,03 · räntetäckning 220,83 (universumets högsta klass) · ROIC 35,59 mot WACC 3,73 = +31,86 pp · FY26:s FÖRSTA STÖRRE LÅNEUPPTAGNING (skuld 2,8→24,0 mdr — 21,2 emitterat; D/E fortfarande 0,03) · aktieemissioner årliga [2,9 · 24,8 · 14,4 · 8,0 · 4,0 mdr] dokumenterade. FCF-IDENTITETEN TTM EXAKT: OCF 184,64 − capex 21,83 = 162,81 mdr (FCF-M 20,64 · FY23-26-serien [136 339 · 161 346 · 136 163 · 153 483] — FEM RAKA MÅTT >20 % marginal). TRETTON LÅS: EV-dekomp EXAKT (3 370+24,0−245,1 = 3 148,9 mot 3,15T) · P/E 16,98 EXAKT på både mcap/netto och pris/EPS · PS 4,41 · PB 4,63 (mcap/EK; pris/BVPS 4,65) · P/FCF 20,70 EXAKT · P/OCF 18,25 EXAKT · EV/Sales 4,12 · EV/EBIT 12,95 (1,5 % källspridning) · EV/FCF 19,37 · EV/Earnings 15,89 · FCF-yield 4,83 EXAKT · divY 5,39 EXAKT · netto-M 25,94 EXAKT · skatt 24,59 EXAKT (65,83/267,66) · D/E 0,03. PEG NULL (källans 4,55 utan ren replikerbar bas — basblandning). KURSEN: 268,90 INR · 52v −32,94 % (tobaksaskatt-rädsla + FMCG-tillväxtoro) · UNDER BÅDA MA (50d 273 · 200d 307) · RSI 52 · **BETA −0,09 — universumets NEGATIVA beta** (tobakens motcykliska natur i portföljteori-termer: federationen av försäkringsliknande kassaflöden) · panel Buy PT 327 (+21,61 %). 22 493 anställda · rev/person 34,0 M INR (HUL 37,8 — dottern effektivare per huvud) · vinst/person 8,82 M · institutioner 51,03 %. RAPPDAG 2026-10-29 (samma dag som HUL · DGE · BBVA · PUIG — v172-fönstrets tätaste kluster). FY april–mars slutårsetikett (HDFC/TCS/HUL-konventionen)."
};

u.push(rad);
const ut = JSON.stringify(u, null, 2) + "\n";
writeFileSync(FIL, ut);

for (let i = 1; i <= 2; i++) {
  const t = JSON.parse(readFileSync(FIL, "utf8"));
  const r = t[t.length - 1];
  const ok = t.length === 308 && r.ticker === "ITC.NS" && r.pris === 268.9 && r.vardering.pe === 16.98
    && r.serier.omsattning.length === 5 && r.serier.resultat[3] === 347466 && r.marknadsKapitalMdr === 3370
    && t.filter(x => x.land === "Indien" && x.bransch === "konsument").length === 2;
  console.log(`LÄS-TILLBAKA ${i}: ${ok ? "GRÖN" : "RÖD"} (n=${t.length}, sista=${r.ticker}, konsument-Indien=${t.filter(x => x.land === "Indien" && x.bransch === "konsument").length})`);
  if (!ok) process.exit(1);
}
writeFileSync("/tmp/r251-itc/kvitto.txt",
  `U46 ITC.NS INLAGD ${new Date().toISOString()}\n307→308 · konsument-Indien 1→2\nLÅS: EV-dekomp EXAKT · P/E 16,98 EXAKT (båda baserna) · P/FCF 20,70 · P/OCF 18,25 · FCF-yield 4,83 · divY 5,39 · netto-M 25,94 · skatt 24,59 — EXAKTA\nPEG NULL (källa 4.55 basblandning)\nPayout rätt bas 179 676/198 394 = 90,6 % · FCF-payout 111,6 % (tobaksmodellen)\nFCF-identitet exakt: 184,64−21,83=162,81\nBeta −0,09 · rappdag 10-29 (fönstrets klusterdag)\n`);
console.log("KVITTO: /tmp/r251-itc/kvitto.txt");
