#!/usr/bin/env node
/** _r250-u45-inlagg.mjs — v173 U45: kirurgisk append 306→307 — ICICI Bank ICICIBANK.NS
 *  (Indien/finans 1→2, HDFC+ICICI-duon, NSE/INR med HDFCBANK-precedensens bankprofil)
 *  + DOKUMENTERAD SKALREPARATION: TCS.NS 7 920 000 → 7 920 · INFY.NS 4 110 000 → 4 110
 *  (universumets mcap-norm = miljard-tal: HDFC 11 264,7 · RELIANCE 16 595,6 · PUB 24,39;
 *  bolagssidans renderar råtalet + 'mdr' — TCS visade '7920000 mdr INR' 1000× fel sedan 09-18). */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/portfolj-system/bolagsunivers.json";
const u = JSON.parse(readFileSync(FIL, "utf8"));
if (u.length !== 306) { console.error(`FEL: förväntade 306 rader, fann ${u.length}`); process.exit(1); }
if (u.some(r => r.ticker === "ICICIBANK.NS")) { console.error("FEL: ICICIBANK.NS finns redan"); process.exit(1); }

// — Skalreparation (dokumenterad) —
let repar = [];
for (const r of u) {
  if (r.ticker === "TCS.NS" && r.marknadsKapitalMdr === 7920000) { r.marknadsKapitalMdr = 7920; repar.push("TCS.NS 7920000→7920"); }
  if (r.ticker === "INFY.NS" && r.marknadsKapitalMdr === 4110000) { r.marknadsKapitalMdr = 4110; repar.push("INFY.NS 4110000→4110"); }
}
console.log("SKALREPARATION:", repar.join(" · ") || "INGET (redan rätt)");

const rad = {
  ticker: "ICICIBANK.NS",
  namn: "ICICI Bank Limited",
  bransch: "finans",
  land: "Indien",
  valuta: "INR",
  kallor: [{
    namn: "StockAnalysis",
    hamtat: "2026-09-25",
    url: "https://stockanalysis.com/quote/nse/ICICIBANK/",
    paranoid: "NSE-primärnotering (översikt + statistics + financials + cash-flow-statement; underlag S&P Global Market Intelligence + Financial Modeling Prep; stängningskurs 2026-09-25 15:15 IST). Källan presenterar denna bank i INR (till skillnad från ADR-kollegan INFY) — ingen valutabrygga behövs; serier i M INR. BANKKONVENTIONER enligt HDFCBANK-precedensen: EV n/a (dekomposition ej tillämplig), OCF −1 210,6 mdr = kundmedlens tecken, fcfYield/fcfMarginal/skuldEgenkapital NULL, bruttomarginal NULL; segmenten redovisas på RISKBAS brutto (sex ben summerar 2,6× netto-intäkten — andelar av segmentsumman, inte lås mot totalen); källans skattrad för banker bär artefakt (netto ≈ pretax) — notis"
  }],
  hamtat: "2026-09-25",
  pris: 1327.7,
  marknadsKapitalMdr: 9580,
  tillvaxt: { omsattningCAGR5ar: 0.1897, resultatCAGR5ar: 0.2122, omsattningTillvaxtTTM: -0.0085, prognosTillvaxt: 0.0505 },
  lonksamhet: { roe: 0.1607, roic: null, bruttoMarginal: null, ebitMarginal: 0.292, nettoMarginal: 0.2753, fcfMarginal: null },
  stabilitet: { skuldEgenkapital: null, rantaTackning: null, fcfPositivaSenaste5: null, kassaManaderBurnRate: null, nyemissionerSenaste5ar: 0 },
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: 0 },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
  vardering: { pe: 17.25, pb: 2.41, evEbit: null, peg: null, fcfYield: null, egenKapitalMultipl: 2.41 },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2022", "2023", "2024", "2025", "2026"],
    omsattning: [989356, 1169021, 1427895, 1822187, 1980670],
    resultat: [251101, 340366, 442564, 510292, 542077],
    egetKapital: [],
    fcf: []
  },
  notering: "INDIEN/FINANS 1→2 — PRIVATBANK-DUOPOLET FÖDS: HDFC (bolånerötterna 1977/1994 — merchant-bank-kulturen, merger-året FY24) + ICICI (project finance-roterna 1955/1994 — industrialfinansieringens arv) = Indiens två största privatbanker, femte och sjätte benet i bank-pedagogiken (ITUB Brasilien · RY Kanada · HSBA.L universal · 8306.T keiretsu · HDFC private Sydasien · ICICI tillväxt-Sydasien). SIGNATURTAL — EPS-TRAPPAN OCH UTDELNINGSFÖDSELN: EPS [35,44 · 47,84 · 61,96 · 71,14 · 74,77] + TTM 77,35 = FEM RAKA TILLVÄXTÅR (netto 251→542+561 mdr, resCAGR +21,2 %/år) samtidigt som BETALD UTDDELNING [13,9 · 34,8 · 56,0 · 70,4 · 78,5] + TTM 78,5 mdr = ×5,7 PÅ FYRA ÅR — från RBI:s lågpayout-vana (14,0 % av netto TTM; DPS 12 INR · 0,90 % · +9,09 %) växer maskinen fram: kapitalbasen först, utdelningen sen — bankens livscykel-i-en-rad. VÄRDERINGENS SPEGLAR: P/B 2,41 = mcap/EK EXAKT (9 580/3 980; BVPS-basen 2,50) mot ROE 16,07 och WACC 4,59 (ROE-gap +11,5 p) — HDFC-paret 1,79/13,8 visar prisbilden: marknaden betalar ICICIs tillväxt-ROE med 35 % P/B-premie; P/E-familjen 17,25 (källa) / 17,16 (pris/EPS) / 17,08 (mcap/netto) — tre baser inom 1,0 %; PS 4,70 EXAKT (9 580/2 040); PEG-källan 0,89 utan replikerbar bas i panelerna ⇒ NULL (basblandning dokumenterad). PROGNOS-TTE +5,05 % (fwd 16,42 mot trail 17,25). KASSAFLÖDETS BANKTECKEN: OCF −1 210,6 mdr = kundmedel (fcf-fälten NULL enligt paketkonventionen, HDFC:s spegel) · netto-skuld −1 523 mdr = kreditportföljen är tillgången (HDFC −3 281) · kassan Current 740 mdr efter FY26-1 709 (kvartalssvängningen dokumenterad). UTSPÄDNINGEN (duons kontrast): aktieantal +0,77 % YoY (banker emitterar kapital — HDFC:s buyback −0,52 % spegelbilden; buyback-yield-fältet −0,77 ärligt negativt) · institutioner 93,41 % (HDFC 82,36) · insiders 0,04 %. SEGMENT-sexBEN på riskbas (TTM-andelar av segmentsumman): Retail 31,6 % · Treasury 26,7 % · Wholesale 17,7 % · Life Insurance 12,9 % · General Insurance 5,7 % · Other Banking 1,5 % + Other 3,8 % — försäkringsbenet (Liv+försäkring 18,6 %) är ICICI:s gruppdjup mot HDFC:s renodlade bank. KURSEN: 1 327,70 INR · 52v −3,98 % (duons flackaste) · ÖVER 200MA (1 355) UNDER 50MA (1 412) · RSI 29 · beta 0,26 · panel Strong Buy PT 1 746,74 (+31,56 %). Anställda 124 029 (HDFC 212 958) · rev/person 16,4 M INR (HDFC ~13,3) · vinst/person 4,52 M (HDFC ~3,6) — ICICI:s produktivhetsparell. RAPPDAG 2026-10-17 CONFIRMED — PRE-fönsterklassen (PUB 10-15 · EL 10-16 · PSON 10-12): tre dagar före fönstrets öppning. FY april–mars slutårsetikett (TCS/HDFC-konventionen)."
};

u.push(rad);
const ut = JSON.stringify(u, null, 2) + "\n";
writeFileSync(FIL, ut);

// Läs-tillbaka ×2
for (let i = 1; i <= 2; i++) {
  const t = JSON.parse(readFileSync(FIL, "utf8"));
  const r = t[t.length - 1];
  const tcs = t.find(x => x.ticker === "TCS.NS");
  const infy = t.find(x => x.ticker === "INFY.NS");
  const ok = t.length === 307 && r.ticker === "ICICIBANK.NS" && r.pris === 1327.7 && r.vardering.pe === 17.25
    && r.serier.omsattning.length === 5 && r.serier.resultat[0] === 251101 && r.land === "Indien"
    && t.filter(x => x.land === "Indien" && x.bransch === "finans").length === 2
    && tcs.marknadsKapitalMdr === 7920 && infy.marknadsKapitalMdr === 4110;
  console.log(`LÄS-TILLBAKA ${i}: ${ok ? "GRÖN" : "RÖD"} (n=${t.length}, sista=${r.ticker}, finans-Indien=${t.filter(x => x.land === "Indien" && x.bransch === "finans").length}, TCS-mcap=${tcs.marknadsKapitalMdr}, INFY-mcap=${infy.marknadsKapitalMdr})`);
  if (!ok) process.exit(1);
}
writeFileSync("/tmp/r250-icici/kvitto.txt",
  `U45 ICICIBANK.NS INLAGD ${new Date().toISOString()}\n306→307 · finans-Indien 1→2 · SKALREPARATION TCS 7920 + INFY 4110\nLÅS: PS 4,70 EXAKT · PB 2,41 = mcap/EK exakt · P/E-familj 17,25/17,16/17,08 (≤1,0 %) · netto-M 27,53 · pretax-M 29,33\nPEG NULL (källa 0,89 utan replikerbar bas)\nPayout rätt bas: betald TTM 78 532/560 902 = 14,0 %\nEPS fem raka år · utdelning ×5,7 på fyra år\nRappdag 2026-10-17 PRE-fönster\n`);
console.log("KVITTO: /tmp/r250-icici/kvitto.txt");
