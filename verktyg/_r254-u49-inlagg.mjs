#!/usr/bin/env node
/** _r254-u49-inlagg.mjs — U49 APOLLOHOSP: kirurgisk append till bolagsunivers.json
 *  + medianuträkning för llms HELREGEN (hälsa + total, före/efter). */
import { readFileSync, writeFileSync } from "node:fs";
const FIL = "data/portfolj-system/bolagsunivers.json";
const u = JSON.parse(readFileSync(FIL, "utf8"));

const median = (a) => { const s = [...a].sort((x, y) => x - y); const m = (s.length - 1) / 2; const l = Math.floor(m); return s.length % 2 ? s[l] : (s[l] + s[l + 1]) / 2; };
const kvartil = (a, q) => { const s = [...a].sort((x, y) => x - y); const p = (s.length - 1) * q; const l = Math.floor(p); return l + 1 < s.length ? s[l] + (p - l) * (s[l + 1] - s[l]) : s[l]; };
const stats = (arr, f) => { const v = arr.map(f).filter((x) => typeof x === "number" && !Number.isNaN(x)); return { n: v.length, med: median(v), p25: kvartil(v, 0.25), p75: kvartil(v, 0.75) }; };
const fmt = (x, d = 1) => (x * 100).toFixed(d).replace(/\.0$/, "");

const sammanfatta = (label, arr) => {
  const pe = stats(arr, (b) => b.vardering?.pe);
  const pb = stats(arr, (b) => b.vardering?.pb);
  const ebit = stats(arr, (b) => b.lonksamhet?.ebitMarginal);
  const fcfm = stats(arr, (b) => b.lonksamhet?.fcfMarginal);
  const omst = stats(arr, (b) => b.tillvaxt?.omsattningTillvaxtTTM);
  const rcagr = stats(arr, (b) => b.tillvaxt?.resultatCAGR5ar);
  console.log(`${label}: antal=${arr.length}`);
  console.log(`  P/E median ${pe.med.toFixed(1)} (P25 ${pe.p25.toFixed(1)} P75 ${pe.p75.toFixed(1)}, n=${pe.n}) | P/B ${pb.med.toFixed(1)} | EBIT-M ${fmt(ebit.med)}% | FCF-M ${fmt(fcfm.med)}% | omsTillv ${fmt(omst.med)}%`);
  console.log(`  resCAGR median ${fmt(rcagr.med)}% (P25 ${fmt(rcagr.p25)} P75 ${fmt(rcagr.p75)}, n=${rcagr.n})`);
};

if (u.some((b) => b.ticker === "APOLLOHOSP.NS")) { console.log("APOLLOHOSP finns redan — AVBRYTER (idempotent)"); process.exit(0); }
const fore = [...u];
console.log("== FÖRE (universum " + fore.length + ") ==");
sammanfatta("HALSO", fore.filter((b) => b.bransch === "halso"));
sammanfatta("TOTALT", fore);

const post = {
  ticker: "APOLLOHOSP.NS",
  namn: "Apollo Hospitals Enterprise Limited",
  bransch: "halso",
  land: "Indien",
  valuta: "INR",
  kallor: [
    {
      namn: "StockAnalysis",
      hamtat: "2026-09-25",
      url: "https://stockanalysis.com/quote/nse/APOLLOHOSP/",
      paranoid: "NSE-primärnoting (översikt + statistics + financials + cash-flow-statement + balance-sheet; underlag S&P Global Market Intelligence + Financial Modeling Prep; kurs 2026-09-25 15:15 IST). Källan INR — serier i M INR, ingen valutabrygga (FY april–mars). KÄLLSPRIDNINGAR DOKUMENTERADE: (1) EV 1,35T mot dekompositionens 1 344,6 Mdr (0,4 %); (2) EV/EBITDA 34,37 mot dekomp 36,40 (5,9 % — källans bas), EV/EBIT 42,60 mot 43,07 (1,1 %); (3) FCF-M-fältet 3,54 % = FY-bas (8 937/252 285), TTM 3,38 % — basnot; (4) BVPS-fältet 659,33 (≈94,8 Mdr) ~5 % under EK-total 99 745 M — P/B 12,81 = mcap/EK EXAKT; (5) PEG 1,74 utan ren replikerbar bas (fwd/EPS-fwd-konvention ~26,7 %). Yahoo-paranoid 429-frekvensspärr (försök dokumenterat; v173 enkällsprotokoll). ROE n/a i källan ⇒ härledd netto/EK 20 896/99 745 = 20,95 %"
    }
  ],
  hamtat: "2026-09-25",
  pris: 8890,
  marknadsKapitalMdr: 1278,
  tillvaxt: { omsattningCAGR5ar: 0.1453, resultatCAGR5ar: 0.1646, omsattningTillvaxtTTM: 0.172, prognosTillvaxt: 0.3131 },
  lonksamhet: { roe: 0.2095, roic: 0.1419, bruttoMarginal: 0.3521, ebitMarginal: 0.1182, nettoMarginal: 0.0791, fcfMarginal: 0.0338 },
  stabilitet: { skuldEgenkapital: 0.85, rantaTackning: 8.48, fcfPositivaSenaste5: 5, kassaManaderBurnRate: null, nyemissionerSenaste5ar: 0 },
  aterkop: { senasteArMdr: 2.876, andelUtestande: 0.00225, insiderkopSenaste6man: 0 },
  moat: { bruttoMarginalMedel5ar: 0.3421, bruttoMarginalSpread5ar: 0.0142, roeMedel5ar: null },
  vardering: { pe: 61.22, pb: 12.81, evEbit: 42.6, peg: null, fcfYield: 0.007, egenKapitalMultipl: 12.81 },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2022", "2023", "2024", "2025", "2026"],
    omsattning: [146626, 166125, 190592, 217940, 252285],
    resultat: [10556, 8191, 8986, 14459, 19417],
    egetKapital: [59030, 65313, 73205, 86529, 99745],
    fcf: [10388, 2484, 7834, 4237, 8937]
  },
  notering: "INDIEN/HALSO 1→2 — HÄLSANS TVÅ EKONOMIER: SUNPHARMA (molekylen: specialitet/generika, brutto 78,9, nettokassa-kultur) + APOLLOHOSP (sängen: Indiens största privata sjukhuskedja, grundad 1979 av Dr Prathap C. Reddy — landets första privata hjärtsjukhus, Chennai; 44 008 anställda). SIGNATURTAL — SÄNGARNAS EKONOMI (BYGGFASCYKELNS FCF): (1) CAPEX-TRAPPAN [6,6 · 11,3 · 11,4 · 17,1 · 19,6] Mdr tredubblad på fyra år (4,5→7,8 % av omsättningen) medan FCF BERGOCHDALBANAR [10,4 · 2,5 · 7,8 · 4,2 · 8,9] — varje dal ett sängbygge; 5 800 nya sängar/5 år (Q1 FY27-kvitto) kommenderar nästa dal; (2) EPS-trappan [73,42 · 56,97 · 62,50 · 100,56 · 134,94]+TTM 145,20 — FY22-dippen −22,4 %, sedan +155 % från FY23-botten: nettot [10,6 · 8,2 · 9,0 · 14,5 · 19,4] Mdr växer GENOM kapitalbindningen (occupancy + case-mix); (3) DUONS FYRA TAL: brutto 35,2/78,9 · netto-M 7,9/20,2 · rev/person 6,0/12,7 M · vinst/person 0,475/2,57 M INR — nästan samma arbetsstyrka (44/47 tusen), femfaldig vinstskillnad per person: TJÄNSTENS mot molekylens kapitallogik; (4) SEGMENT TTM (summan EXAKT med elimineringsben −2 140): Healthcare Services 50,7 % · Digital Health & Pharmacy Distribution 42,8 % (snabbaste benet +19,2 %/år; FY26-förvärvsmassivet 13 030 M = Cradle–Cloudnine till 35× EBITDA enligt källflödet; HealthCo-notning Q4 FY27 vägleds — dold tillgång i 61-P/E-kroppen) · Retail Health & Diagnostics 7,3 %; (5) balansen: skuld [40,7→84,9] Mdr FÖRDOBLAD (FY25:s net debt issued 18 868 M = säng+Cloudnine-finansieringen) · kassa [10,5→18,6] · nettoskuld −66,4 Mdr (−461/aktie) · räntetäckning 8,48 · ROIC 14,19 mot WACC 5,21 = +8,98 pp (bygget lönar sig — Indiens vård-moat: märket + läkartäthet) · EK [59,0→99,7] Mdr +69 % fyra år · ROE härledd netto/EK 20,95 %. VÄRDERINGENS PREMIE (SVEPETS HÖGSTA): P/E 61,22 EXAKT (8 890/145,20) · fwd 46,62 (prognosTillväxt +31,3 % mekanisk) · PB 12,81 = mcap/EK EXAKT · PS 4,84 · P/FCF 143,0 · P/OCF 44,75 EXAKT · EV/Sales 5,11 · EV/EBIT 42,60 · EV/EBITDA 34,37 · EV/Earnings 64,57 · EV/FCF 150,98 (EV-dekomp 1 278,2+84,9−18,6 = 1 344,6 Mdr mot källans 1,35T = 0,4 %) · FCF-yield 0,70 EXAKT · divY 0,225 EXAKT · netto-M 7,91 · EBIT-M 11,82 · brutto-M 35,21 · EBITDA-M 13,98 · skatt 24,50 · D/E 0,85 EXAKTA · PEG NULL (källans 1,74 utan ren bas). FCF-IDENTITET TIO FÖNSTER EXAKTA: TTM 28,56−19,62 = 8,94 + årsserie FY22–26 [16 960−6 572 · 13 769−11 285 · 19 202−11 368 · 21 364−17 127 · 28 557−19 620] mot källans EGEN FCF-rad — 5/5 positiva år. UTDELNINGEN SYMBOLISK (tillväxtbolagets val): DPS 20,00 (0,225 % · +5,26 % YoY) · betald serie [433 · 2 552 · 2 157 · 2 732 · 2 876] M · PAYOUT RÄTT BAS 2 876/19 417 = 14,8 % · FCF-payout 32,18 EXAKT — sängarna får kapitalet före ägarna. KURSEN: 8 890 INR · 52v +16,31 % (6 696,5–9 070,5: 2,0 % under toppen) · ÖVER båda MA (50d 8 838 · 200d 7 992) · RSI 52,23 · beta 0,20 · Strong Buy 30 analytiker PT 9 821 (+10,47 % — SVEPETS TRÄNGSTA MARGINAL: marknaden betalar redan för sängarna som inte är byggda än) · insiders 9,03 % (Reddy-familjen) · institutions 42,81 % · moat-brutto årsserie [34,99 · 34,12 · 33,57 · 33,72 · 34,63] % medel 34,21 spridning 1,42 p (vårdprisernas stabilitet genom expansionscykeln). RAPPDAG 2026-11-06 (est.) — EFTER fönstrets slut: november-FIFO med ONGC (11-13); SUNPHARMA rapp 10-30 (duons fönsterbolag). FY april–mars slutårsetikett. RONDNOTIS: U48 INDUSTOWER extern-reverterad i prod 2026-09-25 15:03 (kommunikation tillbaka på 1; se V173-U49-dokumentet)."
};
u.push(post);
writeFileSync(FIL, JSON.stringify(u, null, 2) + "\n", "utf8");

const efter = JSON.parse(readFileSync(FIL, "utf8"));
console.log("\n== EFTER (universum " + efter.length + ") ==");
sammanfatta("HALSO", efter.filter((b) => b.bransch === "halso"));
sammanfatta("TOTALT", efter);
const sista = efter[efter.length - 1];
console.log("\nLÄS-TILLBAKA: sista ticker = " + sista.ticker + " · pe " + sista.vardering.pe + " · serier.om 5 st = " + sista.serier.omsattning.length + " · EK 5 st = " + sista.serier.egetKapital.length);
const gamla = efter.slice(0, -1);
console.log("KONTROLL gamla orörda: " + (JSON.stringify(gamla) === JSON.stringify(fore) ? "JA (0 förändrade)" : "NEJ — AVVIKELSE!"));
console.log("Indien-bolag EFTER: " + efter.filter((b) => b.land === "Indien").map((b) => b.ticker).join(" · "));
