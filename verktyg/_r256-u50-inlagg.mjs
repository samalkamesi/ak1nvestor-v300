#!/usr/bin/env node
/** _r256-u50-inlagg.mjs — U50 HAL: kirurgisk append till bolagsunivers.json
 *  + medianuträkning för llms HELREGEN (industri + total, före/efter). */
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

if (u.some((b) => b.ticker === "HAL.NS")) { console.log("HAL finns redan — AVBRYTER (idempotent)"); process.exit(0); }
const fore = [...u];
console.log("== FÖRE (universum " + fore.length + ") ==");
sammanfatta("INDUSTRI", fore.filter((b) => b.bransch === "industri"));
sammanfatta("TOTALT", fore);

const post = {
  ticker: "HAL.NS",
  namn: "Hindustan Aeronautics Limited",
  bransch: "industri",
  land: "Indien",
  valuta: "INR",
  kallor: [
    {
      namn: "StockAnalysis",
      hamtat: "2026-09-25",
      url: "https://stockanalysis.com/quote/nse/HAL/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/ + /financials/balance-sheet/)",
      paranoid: "NSE-primärnoting (översikt + statistics + financials + cash-flow-statement + balance-sheet; underlag S&P Global Market Intelligence; kurs 2026-09-25 15:14 IST). Källan INR — serier i M INR (FY april–mars, slutårsetikett). KÄLLSPRIDNINGAR DOKUMENTERADE: (1) mcap-fält 3,19T mot aktiebas 668,78 M × 4 795,30 = 3 207,0 Mdr (0,5 % — källans fält används); (2) EV 2,73T mot dekompositionens 2 728,7 Mdr = 3 190+0,658−461,958 (0,05 %); (3) EV/EBIT 39,09 mot dekomp 39,32 (0,6 %) · EV/EBITDA 33,94 mot 34,13 (0,6 % — källans EV/EBIT-bas); (4) PEG 2,04 utan ren replikerbar bas (34,25/2,04 ⇒ okänd 16,8 %-tillväxtbas; prognos-EPS 3Y 13,64 % ger 2,51) ⇒ NULL; (5) ROE n/a i källan ⇒ härledd netto/EK 93 215/410 446 = 22,71 %; (6) källans payout 32,29 = DPS-bas (45×aktier/TTM-netto), betald/netto FY26 = 33 439/91 156 = 36,7 %; (7) FCF-yield 2,95 replikerbar 94 212/3 190 000 EXAKT; P/FCF 33,89 mot 33,86 · P/OCF 29,28 mot 29,24 (0,1 %). Yahoo-paranoid 429-frekvensspärr (v173-klassens enkällsprotokoll mot S&P GMI, U49-precedensen)"
    }
  ],
  hamtat: "2026-09-25",
  pris: 4795.3,
  marknadsKapitalMdr: 3190,
  tillvaxt: { omsattningCAGR5ar: 0.0767, resultatCAGR5ar: 0.1575, omsattningTillvaxtTTM: 0.021, prognosTillvaxt: 0.1084 },
  lonksamhet: { roe: 0.2271, roic: 0.114, bruttoMarginal: 0.517, ebitMarginal: 0.2055, nettoMarginal: 0.2759, fcfMarginal: 0.2847 },
  stabilitet: { skuldEgenkapital: 0.0, rantaTackning: 1188.93, fcfPositivaSenaste5: 5, kassaManaderBurnRate: null, nyemissionerSenaste5ar: 0 },
  aterkop: { senasteArMdr: 33.439, andelUtestande: 0.0094, insiderkopSenaste6man: null },
  moat: { bruttoMarginalMedel5ar: 0.5745, bruttoMarginalSpread5ar: 0.0916, roeMedel5ar: null },
  vardering: { pe: 34.25, pb: 7.78, evEbit: 39.09, peg: null, fcfYield: 0.0295, egenKapitalMultipl: 7.78 },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2022", "2023", "2024", "2025", "2026"],
    omsattning: [246200, 269275, 303811, 309810, 330888],
    resultat: [50800, 58277, 76211, 83641, 91156],
    egetKapital: [193169, 235759, 291418, 349852, 410446],
    fcf: [93738, 80473, 73064, 127134, 94212]
  },
  notering: "INDIEN/INDUSTRI 1→2 — GRUNDEN MOT HANGARER: LT (den civila orderboksmaskinen: EPC 1938, backlog 7 403 Mdr = 2,5× oms, finansierad av projektbank — nettoskuld 489, D/E 0,98) + HAL (försvarets hangar: statligt, grundat 1940 Bangalore, flygplansmotorer/overhaul/service — orderboken finansierad av KUNDERNA själva genom förskott: nollskuld). SIGNATURTAL — FÖRSKOTTENS BERG: (1) OBFÖRD INTÄKT [266,6 · 289,8 · 326,2 · 522,2] Mdr FY22-26 + TTM 739,4 (2,23× årsomsättningen) — kassaberget 462,0 Mdr är inte bolagets utan framtidens leveransers; FY25-TTm-språnget +217 Mdr (LT-unearned 940 Mdr är spegelbilden i kropp med bank); (2) NOLLSKULDEN: D/E 0,00 EXAKT (total skuld 0,658 Mdr mot kassa 461,96) · räntetäckning 1 188,93 (svepets klass) · nettokassa 461,3 Mdr = 689,77/aktie; (3) OTHER-INCOME-BERGET: pretax 124,3 mot EBIT 69,4 — 54,9 Mdr UNDER EBIT-raden (förskottskassans avkastning) gör netto-M 27,59 ÖVER EBIT-M 20,55 — spegelvänd kassaflödeslogik (LT: netto-M 5,59 UNDER EBIT-M 10,57); (4) FY25 = FCF-TOPPEN 127,1 Mdr → FY26 94,2 (capex nästan fördubblad 9,3→14,9 Mdr = kapacitetsbygget); OCF-serien [101,7 · 88,3 · 82,2 · 136,4 · 109,1] speglar förskottsvågorna (FY25: Change in Other Net Operating Assets +157,7 Mdr = förskottsinflödet); (5) TTM-KVARTALET Jun'26: totala tillgångar +26 % på ETT KVARTAL (1 062,7→1 324,1 Mdr), inventarier +45 % (280,8→406,4) — leveranserna bygger; balansekvationen EXAKT 913,7+410,4 = 1 324,1; (6) DUONS FYRA TAL: brutto 51,7/37,4 · netto-M 27,6/5,6 · rev/person 9,50/53,3 M · vinst/person 2,62/2,98 M INR — margin-makten mot volymen; resCAGR nästan identiska +15,75/+16,71 (två vägar till samma vinsttillväxt); (7) brutto-årsserien [57,0 · 59,5 · 61,0 · 57,9 · 51,9] % — FALLANDE trend (mixskifte mot reservdelar/tjänster) moat-medel 57,45 spridning 9,16 pp (dokumenterad öppet). VÄRDERING: P/E 34,25 (replik mcap/netto 3 190 000/93 215 = 34,21 band 0,1 %; pris/EPS 4 795,30/139,38 = 34,40) · fwd 30,90 (prognosTillväxt +10,84 % mekanisk) · PS 9,45 (replik 9,44) · PB 7,78 = mcap/EK EXAKT · P/FCF 33,89 · P/OCF 29,28 · EV-familjen på dekomp 2 728,7 Mdr: EV/Earnings 29,30 EXAKT · EV/Sales 8,08 · EV/FCF 28,98 · EV/EBIT 39,32 (källa 39,09) · EV/EBITDA 34,13 (källa 33,94) · FCF-yield 2,95 EXAKT · divY 0,94 (45,00/4 795,30 = 0,938) · netto-M 27,59 · EBIT-M 20,55 · brutto-M 51,70 · EBITDA-M 23,67 · FCF-M 28,47 · skatt 25,02 · D/E 0,00 EXAKTA · PEG NULL (källans 2,04 utan ren bas) · ROIC 11,40 mot WACC 6,99 = +4,41 pp. FCF-IDENTITETEN SEX FÖNSTER EXAKTA: TTM 109,06−14,85 = 94,21 + årsserie FY22-26 [101 731−7 993 · 88 297−7 824 · 82 228−9 164 · 136 435−9 301 · 109 064−14 852] — 5/5 positiva år. UTDELNINGEN VÄXER ×2,5: DPS 45,00 (+12,50 % YoY) · betald serie [13,4 · 16,7 · 19,7 · 25,4 · 33,4] Mdr · PAYOUT RÄTT BAS 33 439/91 156 = 36,7 % (källans 32,29 = DPS-bas) · FCF-payout 35,5 (betald/FCF; källans 31,94 DPS-bas). KURSEN: 4 795,30 · 52v +1,51 % (3 479,1–5 149,9: 6,9 % under toppen) · UNDER MA50 (4 806,65) · ÖVER MA200 (4 402,08) · RSI 48,11 · beta 0,50 · Buy 28 analytiker PT 5 516,61 (+15,04 %) · float blott 27,4 % (183,22 av 668,78 M aktier) · institutions 15,25 % · insiders 0,00 % (statligt huvudägarskap under försvarsministeriet). SEGMENT FY26 (summan EXAKT 330 889): Inland Sale of Services 47,4 % · Finished Goods 27,9 % · Spares 14,8 % · Other Operating 3,9 % · Development 2,9 % · Misc 1,6 % · Export products 1,3 % · Export services 0,2 % — exportandel 1,5 % avslöjar kunden. Anställda 35 566 (LT 55 662); split 2023-09-28 2:1 (notis). RAPPDAG 2026-11-06 — EFTER fönstrets slut: november-FIFO med APOLLOHOSP (11-06) och ONGC (11-13); LT rapp 10-28 = duons fönsterbolag. RONDNOTIS: U49-dataleveransen (cd6d2e2c) återställd i prod-trädet av extern aktör 2026-09-25 ~14:48Z utan dokumentation — återlevereras i samma push som denna (U49+U50); U48 INDUSTOWER förblir externt reverterad."
};
u.push(post);
writeFileSync(FIL, JSON.stringify(u, null, 2) + "\n", "utf8");

const efter = JSON.parse(readFileSync(FIL, "utf8"));
console.log("\n== EFTER (universum " + efter.length + ") ==");
sammanfatta("INDUSTRI", efter.filter((b) => b.bransch === "industri"));
sammanfatta("TOTALT", efter);
const sista = efter[efter.length - 1];
console.log("\nLÄS-TILLBAKA: sista ticker = " + sista.ticker + " · pe " + sista.vardering.pe + " · serier.om 5 st = " + sista.serier.omsattning.length + " · EK 5 st = " + sista.serier.egetKapital.length);
const gamla = efter.slice(0, -1);
console.log("KONTROLL gamla orörda: " + (JSON.stringify(gamla) === JSON.stringify(fore) ? "JA (0 förändrade)" : "NEJ — AVVIKELSE!"));
console.log("Indien-bolag EFTER: " + efter.filter((b) => b.land === "Indien").map((b) => b.ticker).join(" · "));
const indien = efter.filter((b) => b.land === "Indien");
const grenar = {};
for (const b of indien) grenar[b.bransch] = (grenar[b.bransch] || 0) + 1;
console.log("Indiens grenar: " + Object.entries(grenar).map(([k, v]) => `${k} ${v}`).join(" · "));
