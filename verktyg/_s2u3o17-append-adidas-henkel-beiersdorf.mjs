#!/usr/bin/env node
/**
 * s2-u3 omg17 (manifest auto-s2-1789783106) — DATASET-DJUP:
 * TYSKLAND/KONSUMENT +3: ADIDAS (ADS.DE) + HENKEL (HEN3.DE) + BEIERSDORF (BEI.DE)
 * — cellen matta 2→5 P/E-mätbara ⇒ /dataset/konsument/tyskland föds vid nästa
 * prod-bygge (land.ts-tysklandmodulen byggs i samma leverans, schweiz-precedensen).
 * Tre SKILDA delar av konsumentvärdekedjan (discretionary sportmode + staples
 * hemvård + staples hudvård) mot bil-duon MBG/BMW — cellens P25–P75 blir en
 * pedagogisk spridningsläxa (cykelmultiplar mot varumärkesmultiplar).
 * Idempotent append på diskens faktiska läge (omg11–16-konventionen).
 * Källa StockAnalysis (etr-källvägen) hämtad 2026-09-18 (S&P Global MI +
 * Fiscal.ai-underlag). ALL aritmetik maskinverifierad FÖRE skrivning
 * (abort-grind, omg13-läxan).
 */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/portfolj-system/bolagsunivers.json";
const u = JSON.parse(readFileSync(FIL, "utf8"));
const innan = u.length;
const har = (t) => u.some((b) => b.ticker === t);

// ── käldata (StockAnalysis etr, hämtat 2026-09-18; paranoid per rad) ─────────
const K = {
  ADS: {
    pris: 142.25, mcapMdr: 24.75,
    pe: 18.27, peFwd: 13.62, pegKalla: 0.64, pb: 3.90, evEbit: 13.60, evEbitda: 8.95,
    bruttoM: 0.5158, ebitM: 0.0835, nettoM: 0.0530, fcfM: 0.0745,
    roe: 0.2432, roic: 0.1475, roa: 0.0670, wacc: 0.0927,
    skuldM: 5980, kassaM: 1560, nettoSkuldM: 4420, skuldEk: 0.94, rantaTack: 9.45,
    ocfTTM: 2310, capexTTM: 372, fcfTTM: 1940,
    revTTM: 26041, nettoTTM: 1379, epsTTM: 7.77, ebitTTM: 2174, evKalla: 29560,
    dps: 2.80, direktAvk: 0.0197, payoutKalla: 0.3561,
    aktier: 173.98, beta: 1.19, v52Spann: [129.95, 196.40],
    rapport: "2026-10-29", analytiker: "Buy mål 198,97 EUR (+39,9 %), 30 st",
    serier: { ar: ["2021", "2022", "2023", "2024", "2025"], oms: [21234, 22511, 21427, 23683, 24811], netto: [2116, 1, -756, 764, 1340] },
  },
  HEN3: {
    pris: 72.94, mcapMdr: 28.57,
    pe: 15.78, peFwd: 12.90, pegKalla: 3.06, pb: 1.36, evEbit: 10.91, evEbitda: 9.13,
    bruttoM: 0.5132, ebitM: 0.1388, nettoM: 0.0936, fcfM: 0.0999,
    roe: 0.0940, roic: 0.0914, roa: 0.0512, wacc: 0.0624,
    skuldM: 6720, kassaM: 4420, nettoSkuldM: 2300, skuldEk: 0.32, rantaTack: 24.89,
    ocfTTM: 2730, capexTTM: 684, fcfTTM: 2046,
    revTTM: 20441, nettoTTM: 1913, epsTTM: 4.69, ebitTTM: 2837, evKalla: 30960,
    dps: 2.07, direktAvk: 0.0284, payoutKalla: 0.4354,
    aktier: 404.99, beta: 0.57, v52Spann: [61.28, 84.20],
    rapport: "2026-11-10", analytiker: "Hold mål 79,44 EUR (+8,9 %), 19 st",
    serier: { ar: ["2021", "2022", "2023", "2024", "2025"], oms: [20066, 22397, 21514, 21586, 20495], netto: [1634, 1259, 1318, 2007, 2035] },
  },
  BEI: {
    pris: 74.10, mcapMdr: 16.20,
    pe: 17.32, peFwd: 18.95, pegKalla: 6.26, pb: 1.80, evEbit: 10.30, evEbitda: 8.15,
    bruttoM: 0.5713, ebitM: 0.1361, nettoM: 0.0975, fcfM: 0.0616,
    roe: 0.1089, roic: 0.1505, roa: 0.0624, wacc: 0.0699,
    skuldM: 110, kassaM: 2840, nettokassaM: 2730, skuldEk: 0.01, rantaTack: 56.91,
    ocfTTM: 1020, capexTTM: 429, fcfTTM: 592,
    revTTM: 9616, nettoTTM: 938, epsTTM: 4.29, ebitTTM: 1309, evKalla: 13480,
    dps: 1.00, direktAvk: 0.0135, payoutKalla: 0.2335,
    aktier: 218.07, beta: 0.49, v52Spann: [67.08, 110.15],
    rapport: "2026-10-27", analytiker: "Hold mål 82,11 EUR (+10,8 %), 20 st",
    serier: { ar: ["2021", "2022", "2023", "2024", "2025"], oms: [7627, 8799, 9447, 9850, 9852], netto: [638, 755, 736, 912, 939] },
  },
};

// ── härledda tal + aritmetikgrind (abort FÖRE skrivning) ─────────────────────
const cagr = (a, b, perioder) => Math.pow(b / a, 1 / perioder) - 1;
const FEL = [];
const INFO = [];
const jamfor = (namn, calc, ext, tol) => {
  const ok = Math.abs(calc - ext) <= tol;
  if (!ok) FEL.push(`${namn}: beräknat ${calc} mot externt ${ext} (tol ${tol})`);
  return ok;
};

// ADS — Adidas
{
  const n = K.ADS;
  const prognos = n.pe / n.peFwd - 1;                        // +0,34141
  jamfor("ADS prognosTillväxt", prognos, 0.34141, 0.0005);
  jamfor("ADS peg-spår", n.pe / (prognos * 100), 0.5351, 0.005);
  jamfor("ADS revCAGR", cagr(n.serier.oms[0], n.serier.oms[4], 4), 0.0397, 0.0005);
  jamfor("ADS resCAGR", cagr(n.serier.netto[0], n.serier.netto[4], 4), -0.1079, 0.0005);
  jamfor("ADS fcfMarginal", n.fcfTTM / n.revTTM, n.fcfM, 0.0005);
  jamfor("ADS fcfYield", n.fcfTTM / (n.mcapMdr * 1000), 0.07838, 0.0005);
  jamfor("ADS EV/EBIT-replik", (n.mcapMdr * 1000 + n.nettoSkuldM) / n.ebitTTM, 13.4134, 0.01);
  jamfor("ADS EV/EBIT-avvik mot källfäl", ((n.mcapMdr * 1000 + n.nettoSkuldM) / n.ebitTTM) / n.evEbit - 1, -0.0137, 0.005);
  jamfor("ADS direktavkastning", n.dps / n.pris, n.direktAvk, 0.0005);
  jamfor("ADS payout mot TTM-EPS", n.dps / n.epsTTM, 0.3604, 0.0005);
  jamfor("ADS P/E-identitet mcap/netto", (n.mcapMdr * 1000) / n.nettoTTM, 17.947, 0.01);
  jamfor("ADS aktiebas pris/EPS", n.pris / n.epsTTM, 18.306, 0.01);
  jamfor("ADS mcap-identitet", (n.pris * n.aktier) / (n.mcapMdr * 1000) - 1, -0.00005, 0.002);
  jamfor("ADS P/B equity", (n.mcapMdr * 1000) / 6350, n.pb, 0.01);
  if (n.serier.ar.length !== 5 || n.serier.oms.length !== 5 || n.serier.netto.length !== 5) FEL.push("ADS serielängder");
}
// HEN3 — Henkel
{
  const s = K.HEN3;
  const prognos = s.pe / s.peFwd - 1;                        // +0,22326
  jamfor("HEN3 prognosTillväxt", prognos, 0.22326, 0.0005);
  jamfor("HEN3 peg-spår", s.pe / (prognos * 100), 0.7068, 0.005);
  jamfor("HEN3 revCAGR", cagr(s.serier.oms[0], s.serier.oms[4], 4), 0.0053, 0.0005);
  jamfor("HEN3 resCAGR", cagr(s.serier.netto[0], s.serier.netto[4], 4), 0.0564, 0.0005);
  jamfor("HEN3 fcfMarginal", s.fcfTTM / s.revTTM, s.fcfM, 0.0005);
  jamfor("HEN3 fcfYield", s.fcfTTM / (s.mcapMdr * 1000), 0.07161, 0.0005);
  jamfor("HEN3 EV/EBIT-replik", (s.mcapMdr * 1000 + s.nettoSkuldM) / s.ebitTTM, 10.881, 0.01);
  jamfor("HEN3 direktavkastning", s.dps / s.pris, s.direktAvk, 0.0005);
  jamfor("HEN3 payout mot TTM-EPS", s.dps / s.epsTTM, 0.4414, 0.0005);
  jamfor("HEN3 P/E-identitet mcap/netto", (s.mcapMdr * 1000) / s.nettoTTM, 14.935, 0.01);
  jamfor("HEN3 aktiebas pris/EPS", s.pris / s.epsTTM, 15.554, 0.01);
  // mcap-identiteten bär aktieklass-strukturen (se INFO) — dokumenterad avvik
  const mcapIdent = (s.pris * s.aktier) / (s.mcapMdr * 1000) - 1;
  INFO.push(`HEN3 mcap-identitet +${(mcapIdent * 100).toFixed(1)} %: källans mcap räknas på vägd aktiebas (~391,6 M vägt HEN3+ordinarie), shares-fältet 404,99 M = hela basen — KGaA-strukturens två klasser, dokumenterad`);
  if (Math.abs(mcapIdent - 0.0340) > 0.005) FEL.push("HEN3 mcap-avvik avviker från dokumentationen");
  jamfor("HEN3 P/B equity", (s.mcapMdr * 1000) / (51.74 * s.aktier), s.pb, 0.01);
  const peIdent = (s.mcapMdr * 1000) / s.nettoTTM / s.pe - 1;
  INFO.push(`HEN3 P/E-källspridning: mcap/netto ${((s.mcapMdr * 1000) / s.nettoTTM).toFixed(2)} mot källans PE-fält ${s.pe} (${(peIdent * 100).toFixed(1)} %; aktiebas ${s.pris}/${s.epsTTM} = ${(s.pris / s.epsTTM).toFixed(2)} = −1,4 % — S&P-normaliserat netto-underlag dokumenterat, JNJ/BUD-klassen)`);
  if (Math.abs(peIdent + 0.0536) > 0.005) FEL.push("HEN3 P/E-källspridning avviker från dokumentationen");
  if (s.serier.ar.length !== 5 || s.serier.oms.length !== 5 || s.serier.netto.length !== 5) FEL.push("HEN3 serielängder");
}
// BEI — Beiersdorf
{
  const g = K.BEI;
  const prognos = g.pe / g.peFwd - 1;                        // −0,08602 NEGATIVT
  jamfor("BEI prognosgap (negativt)", prognos, -0.08602, 0.0005);
  INFO.push(`BEI NEGATIVT prognosgap ${(prognos * 100).toFixed(1)} % (P/E ${g.pe} mot forward ${g.peFwd}) ⇒ prognosTillväxt/PEG sätts null enligt BUD-konventionen — dokumenterat i not`);
  jamfor("BEI revCAGR", cagr(g.serier.oms[0], g.serier.oms[4], 4), 0.0661, 0.0005);
  jamfor("BEI resCAGR", cagr(g.serier.netto[0], g.serier.netto[4], 4), 0.1015, 0.0005);
  jamfor("BEI fcfMarginal", g.fcfTTM / g.revTTM, g.fcfM, 0.0005);
  jamfor("BEI fcfYield", g.fcfTTM / (g.mcapMdr * 1000), 0.03654, 0.0005);
  jamfor("BEI EV/EBIT källa", g.evKalla / g.ebitTTM, g.evEbit, 0.01);
  jamfor("BEI EV-replik nettokassa", (g.mcapMdr * 1000 - g.nettokassaM) / g.ebitTTM, 10.29, 0.05);
  jamfor("BEI direktavkastning", g.dps / g.pris, g.direktAvk, 0.0005);
  jamfor("BEI payout mot TTM-EPS", g.dps / g.epsTTM, 0.2331, 0.0005);
  jamfor("BEI P/E-identitet mcap/netto", (g.mcapMdr * 1000) / g.nettoTTM, 17.273, 0.01);
  jamfor("BEI aktiebas pris/EPS", g.pris / g.epsTTM, 17.273, 0.01);
  jamfor("BEI mcap-identitet", (g.pris * g.aktier) / (g.mcapMdr * 1000) - 1, -0.0025, 0.002);
  jamfor("BEI P/B equity", (g.mcapMdr * 1000) / 9010, g.pb, 0.01);
  if (g.serier.ar.length !== 5 || g.serier.oms.length !== 5 || g.serier.netto.length !== 5) FEL.push("BEI serielängder");
}

if (FEL.length) {
  console.error("ABORT — aritmetikgrind RÖD:");
  for (const f of FEL) console.error("  ✗ " + f);
  process.exit(1);
}
console.log("ARITMETIK GRÖN — samtliga kontroller inom tolerans");
for (const i of INFO) console.log("  ℹ " + i);

// ── rader (konventionsenliga; noteringar dokumenterar konventioner+fynd) ─────
const rader = [];
if (!har("ADS.DE")) rader.push({
  ticker: "ADS.DE", namn: "adidas AG", bransch: "konsument", land: "Tyskland", valuta: "EUR",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-18", url: "https://stockanalysis.com/quote/etr/ADS/ (+ /statistics/ + /financials/)",
    paranoid: "S&P Global Market Intelligence + Fiscal.ai-underlag, close 2026-09-18 142,25 EUR/24,75 mdr; P/E 18,27 forward 13,62 ⇒ prognosTillväxt +34,1 % TTE (PEG spår 0,54 mot källans 0,64 på 3-års-EPS-prognos +22,15 % — båda dokumenterade); P/B 3,90 (mcap/eget kapital 24 750÷6 350 = 3,90 EXAKT) EV/EBIT 13,60 EV/EBITDA 8,95 (EV/EBIT-replik (24 750+4 420)÷2 174 = 13,41 = −1,4 % mot källans fält — lease-justeringar i källans EV 29 560, dokumenterad avvik); brutto TTM 51,58 % EBIT 8,35 % netto 5,30 % FCF 7,45 %; ROE 24,32 % ROIC 14,75 % MOT WACC 9,27 % (spread +5,5 pp); skuld 5 980 M kassa 1 560 M ⇒ NETTOSKULD 4 420 M skuld/EK 0,94 räntetäckning 9,45×; aktier 173,98 M EPS TTM 7,77 (aktiebas 142,25÷7,77 = 18,31 ≈ P/E-fältet; mcap/netto 17,95 = −1,8 % EPS-rundning — båda vägarna inom hållhake); TTM (jun-2026) oms 26 041 M (+6,3 % översiktspanelen) netto 1 379 M OCF 2 310 M capex 372 M ⇒ FCF 1 940 M (fcfYield 7,84 %); utdelning 2,80 EUR/aktie (1,97 %) payout 35,61 % (aktiebas 2,80÷7,77 = 36,0 % — fönsterskillnad dokumenterad); beta 1,19; 52-v 129,95–196,40 (−20,4 %); eff skatt 24,70 %; Altman 3,34 Piotroski 7; nästa rapp 2026-10-29; analytiker Buy 198,97 (+39,9 %, 30 st); Industry Footwear & Accessories, Sector Consumer Discretionary — branschfältet konsument källkonsekvent med cellens MBG/BMW (båda discretionary)" }],
  hamtat: "2026-09-18",
  pris: 142.25, marknadsKapitalMdr: 24.75,
  tillvaxt: { omsattningCAGR5ar: 0.0397, resultatCAGR5ar: -0.1079, omsattningTillvaxtTTM: 0.063, prognosTillvaxt: 0.3414 },
  lonksamhet: { roe: 0.2432, roic: 0.1475, bruttoMarginal: 0.5158, ebitMarginal: 0.0835, nettoMarginal: 0.053, fcfMarginal: 0.0745 },
  stabilitet: { skuldEgenkapital: 0.94, rantaTackning: 9.45, fcfPositivaSenaste5: null, kassaManaderBurnRate: null, nyemissionerSenaste5ar: null },
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: null },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
  vardering: { pe: 18.27, pb: 3.9, evEbit: 13.6, peg: 0.54, fcfYield: 0.0784, egenKapitalMultipl: 3.9 },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: { ar: ["2021", "2022", "2023", "2024", "2025"], omsattning: [21234000000, 22511000000, 21427000000, 23683000000, 24811000000], resultat: [2116000000, 1000000, -756000000, 764000000, 1340000000], egetKapital: [], fcf: [] },
  notering: "YEEZY-KRISENS FULLA BÅGE I EN RAD — cellens varumärkesanka: sportmodehuset med bruttomarginal 51,6 % (konsumentgrenens övre halva, NKE 44 %-klassens europeiska motsats) men SERIEN BÄR KOLLAPSEN: netto 2 116 → 1 → −756 → 764 → 1 340 M EUR FY2021→FY2025 (endpoint −10,8 %/år trots att omsättningen växer +4,0 %/år; FY2022 Yeezy-brytningen nästan nollade resultatet, FY2023 = FÖRLUSTÅRET −756 M med EBIT-marginal 1,3 %, därefter två återhämtningsår med EBIT 5,3 → 8,3 %). ÅTERHÄMTNINGENS BEVIS: TTM (jun-2026) oms 26 041 M (+6,3 %) netto 1 379 M (+14,7 %) ⇒ P/E 18,27 mot forward 13,62 = prognosgap +34,1 % (DNO/VALE-klassens nedre trappa) med analytiker-Buy 198,97 (+39,9 %, 30 st) — marknaden prissätter FORTFARANDE bara delvis återhämtningen; PEG-spår 0,54 mot källans 0,64 (3-års-EPS +22,2 %/år — båda läsningarna dokumenterade). VARUMÄRKESKAPITALETS ROE 24,32 % = CELLENS HÖGSTA (mot Henkel 9,4 och Beiersdorf 10,9) men det bär NETTOSKULDEN 4 420 M EUR (skuld/EK 0,94 — cellens enda belånade rad; räntetäckning 9,45×) och working capital-tyngda lagercykeln (inventory turnover 2,25×). FCF 1 940 M = fcfYield 7,84 % (cellens högsta) på capex 372 M = 1,4 % av oms. Utdelning 2,80 EUR (1,97 %) payout 36 % — återuppbyggnadens måttliga utdelning. 52-v −20,4 % (beta 1,19, cellens högsta). Nästa rapp 2026-10-29.",
});
if (!har("HEN3.DE")) rader.push({
  ticker: "HEN3.DE", namn: "Henkel AG & Co. KGaA", bransch: "konsument", land: "Tyskland", valuta: "EUR",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-18", url: "https://stockanalysis.com/quote/etr/HEN3/ (+ /statistics/ + /financials/)",
    paranoid: "S&P Global Market Intelligence + Fiscal.ai-underlag, close 2026-09-18 72,94 EUR/28,57 mdr; P/E 15,78 forward 12,90 ⇒ prognosTillväxt +22,3 % TTE (PEG spår 0,71 mot källans 3,06 på 3-års-EPS-prognos +5,5 % — källan räknar på historisk trappstegsprognos, spåret på TTE-gapet, båda dokumenterade); P/E-källspridning −5,4 % (mcap/netto 14,93 mot fältet 15,78; aktiebas 72,94÷4,69 = 15,55 = −1,4 % — S&P-normaliserat netto-underlag, JNJ/BUD-klassen); P/B 1,36 (mcap/eget kapital via BVPS 51,74 × 404,99 M = 1,36 EXAKT) EV/EBIT 10,91 (replik (28 570+2 300)÷2 837 = 10,88 = −0,3 % — källans EV 30 960, nästan exakt) EV/EBITDA 9,13; brutto TTM 51,32 % EBIT 13,88 % netto 9,36 % FCF 9,99 %; ROE 9,40 % ROIC 9,14 % MOT WACC 6,24 % (spread +2,9 pp); skuld 6 720 M kassa 4 420 M ⇒ NETTOSKULD 2 300 M skuld/EK 0,32 räntetäckning 24,89×; aktier 404,99 M (två klasser: 151,44 M preferens HEN3 + ordinarie — källans mcap räknas på vägd bas ~391,6 M, dokumenterat) EPS TTM 4,69; TTM (jun-2026) oms 20 441 M (översiktspanelen −3,5 %; financials-fönstret −0,26 % — två fönster dokumenterade, fältet bär översiktens) netto 1 913 M OCF 2 730 M capex 684 M ⇒ FCF 2 046 M (fcfYield 7,16 %); utdelning 2,07 EUR/aktie (2,84 %) payout 43,54 % (aktiebas 44,1 % — fönsterskillnad); buyback-yield 2,67 % ⇒ ägaravkastning 5,49 %; beta 0,57; 52-v 61,28–84,20 (+0,7 %); eff skatt 24,71 %; Altman 2,87 Piotroski 5; nästa rapp 2026-11-10; analytiker Hold 79,44 (+8,9 %, 19 st); Industry Household & Personal Products, Sector Consumer Staples — branschfältet konsument källkonsekvent" }],
  hamtat: "2026-09-18",
  pris: 72.94, marknadsKapitalMdr: 28.57,
  tillvaxt: { omsattningCAGR5ar: 0.0053, resultatCAGR5ar: 0.0564, omsattningTillvaxtTTM: -0.035, prognosTillvaxt: 0.2233 },
  lonksamhet: { roe: 0.094, roic: 0.0914, bruttoMarginal: 0.5132, ebitMarginal: 0.1388, nettoMarginal: 0.0936, fcfMarginal: 0.0999 },
  stabilitet: { skuldEgenkapital: 0.32, rantaTackning: 24.89, fcfPositivaSenaste5: null, kassaManaderBurnRate: null, nyemissionerSenaste5ar: null },
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: null },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
  vardering: { pe: 15.78, pb: 1.36, evEbit: 10.91, peg: 0.71, fcfYield: 0.0716, egenKapitalMultipl: 1.36 },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: { ar: ["2021", "2022", "2023", "2024", "2025"], omsattning: [20066000000, 22397000000, 21514000000, 21586000000, 20495000000], resultat: [1634000000, 1259000000, 1318000000, 2007000000, 2035000000], egetKapital: [], fcf: [] },
  notering: "STAPLES-MOTPOLEN TILL BILDUON — tvåaffärslogikens lärobok: Lim/Adhesive Technologies (industrins Loctite) + Consumer Brands (Persil/Dufta) i samma bolag, därför brutto 51,3 % NÄSTAN IDENTISK med sportmodehuset (51,6 %) men EBIT 13,9 % och netto 9,4 % på ett HELT annorlunda sätt: stapelvaror-prisetättning utan modecykelns risk. SERIENS KONSOLIDERING: omsättningen 20 066 → 22 397 → 21 514 → 21 586 → 20 495 M EUR (endpoint +0,5 %/år; 2022-inflationstoppen +11,6 % sedan dämpning −3,9 %/−5,1 %) medan nettoTRAPPAN STIGER 1 634 → 1 259 → 1 318 → 2 007 → 2 035 M (+5,6 %/år; +56 % från 2022-botten) = MARGINALÅTERHÄMTNINGENS KLASSISKA MÖNSTER på flat intäkt — kostnadssidan och portfölj sanering (2023: 1 318 på 21 514 = 6,1 % netto; 2025: 9,9 %). KASSAN ÄR SIGNATURNUMRET: FCF 2 046 M = 10,0 % marginal (cellens högsta) ⇒ fcfYield 7,16 % med utdelning 2,07 EUR (2,84 %) payout 44 % + buyback 2,67 % = ÄGARAVKASTNING 5,49 %. ROE 9,40 % = cellens lägsta (KGaA-strukturens stora balansräkning, P/B 1,36 = cellens lägsta multiplar-familj) men ROIC 9,14 mot WACC 6,24 = +2,9 pp. Beta 0,57 + 52-v +0,7 % = cellens (och en av universumets) stabilitetsankare. Två aktieklasser dokumenterade (preferens noterad). P/E-källspridning −5,4 % (mcap/netto 14,93 mot fältet 15,78) dokumenterad öppet. Nästa rapp 2026-11-10.",
});
if (!har("BEI.DE")) rader.push({
  ticker: "BEI.DE", namn: "Beiersdorf AG", bransch: "konsument", land: "Tyskland", valuta: "EUR",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-18", url: "https://stockanalysis.com/quote/etr/BEI/ (+ /statistics/ + /financials/)",
    paranoid: "S&P Global Market Intelligence (fresch Fiscal.ai-spegel) + cache-korskonfirmation: en andra hämtning (web-reader, äldre CIQ-spegel stämplad TTM jun-2024) bar IDENTISKA FY2021–2023-serier (7 627/8 799/9 447 oms; 638/755/736 netto) = internkonsistenskontroll klar (VITEC-generaliseringen); close 2026-09-18 74,10 EUR/16,20 mdr; P/E 17,32 (mcap/netto 16 200÷938 = 17,27 = −0,3 %; aktiebas 74,10÷4,29 = 17,27 — båda vägarna EXAKTA) men forward 18,95 HÖGRE ⇒ NEGATIVT prognosgap −8,6 % ⇒ prognosTillväxt/PEG null enligt BUD-konventionen (källans PEG 6,26 och 3-års-EPS-prognos −1,07 %/år som not — analysläget: vila efter två starka år); P/B 1,80 (mcap/eget kapital 16 200÷9 010 = 1,80 EXAKT) EV/EBIT 10,30 (källans EV 13 480 ÷ EBIT 1 309 = 10,30 EXAKT; replik mcap−nettokassa (16 200−2 730)÷1 309 = 10,29) EV/EBITDA 8,15 — EV 13,48 mdr LIGGER UNDER mcap (NETTOKASSA-bolag); brutto TTM 57,13 % EBIT 13,61 % netto 9,75 % FCF 6,16 %; ROE 10,89 % ROIC 15,05 % MOT WACC 6,99 % (spread +8,1 pp); skuld 110 M kassa 2 840 M ⇒ NETTOKASSA 2 730 M (12,53 EUR/aktie) skuld/EK 0,01 räntetäckning 56,91× (cellens renaste balansräkning); aktier 218,07 M EPS TTM 4,29; TTM (jun-2026) oms 9 616 M (−2,5 %) netto 938 M (+6,3 %) OCF 1 020 M capex 429 M ⇒ FCF 592 M (fcfYield 3,65 % — capex 4,5 % av oms, cellens tyngsta kapitalcykel); utdelning 1,00 EUR/aktie (1,35 %) payout 23,35 % (aktiebas 23,3 % EXAKT) buyback 2,03 %; beta 0,49; 52-v 67,08–110,15 (−20,4 %); eff skatt 27,82 %; Altman 5,08 Piotroski 5; nästa rapp 2026-10-27; analytiker Hold 82,11 (+10,8 %, 20 st); Industry Household & Personal Products, Sector Consumer Staples — branschfältet konsument källkonsekvent. NOTIS serieskillnad: S&P-standardiserade FY2021-intäkter 7 627 M skiljer från bolagets egna rapporterade ~8 613 M (spegat enligt S&P-konvention) — serien används källkonsekvent internt, CAGR beräknas endpoint på SAMMA källas tal" }],
  hamtat: "2026-09-18",
  pris: 74.1, marknadsKapitalMdr: 16.2,
  tillvaxt: { omsattningCAGR5ar: 0.0661, resultatCAGR5ar: 0.1015, omsattningTillvaxtTTM: -0.025, prognosTillvaxt: null },
  lonksamhet: { roe: 0.1089, roic: 0.1505, bruttoMarginal: 0.5713, ebitMarginal: 0.1361, nettoMarginal: 0.0975, fcfMarginal: 0.0616 },
  stabilitet: { skuldEgenkapital: 0.01, rantaTackning: 56.91, fcfPositivaSenaste5: null, kassaManaderBurnRate: null, nyemissionerSenaste5ar: null },
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: null },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
  vardering: { pe: 17.32, pb: 1.8, evEbit: 10.3, peg: null, fcfYield: 0.0365, egenKapitalMultipl: 1.8 },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: { ar: ["2021", "2022", "2023", "2024", "2025"], omsattning: [7627000000, 8799000000, 9447000000, 9850000000, 9852000000], resultat: [638000000, 755000000, 736000000, 912000000, 939000000], egetKapital: [], fcf: [] },
  notering: "NIVEA-BURKENS VALLGRAV — cellens renaste balansräkning: hudvårdsjätten (Nivea/Eucerin/La Prairie + tesa-industriklister i koncernen) med BRUTTOMARGINAL 57,1 % = CELLENS HÖGSTA (över adidas 51,6 och Henkel 51,3 — hudvårdens prissättningsmakt) och serie utan EN förlustmillimeter: netto 638 → 755 → 736 → 912 → 939 M EUR (+10,2 %/år endpoint på omsättning +6,6 %/år — OPERATIV STATIK, inte cykel). SIGNATURNUMRET ÄR KASSAN: nettokassa 2 730 M EUR (12,53/aktie), skuld/EK 0,01, räntetäckning 56,9× ⇒ EV 13,48 mdr LIGGER UNDER marknadsvärdet 16,20 — EV/EBIT 10,30 blir därmed cellens mest 'äkta' multiplar (inget belåningspåslag). NEGATIVA PROGNOSGAPET ÄR FYNDET: P/E 17,32 mot forward 18,95 = −8,6 % (universumets ovanliga riktning — källans 3-års-EPS-prognos −1,07 %/år) ⇒ prognosTillväxt/PEG null enligt BUD-konventionen: två starka tillväxtår (netto +23,9 % 2024) har mattat, marknaden betalar för STABILITETEN inte tillväxten (beta 0,49 = cellens lugnaste). ROIC 15,05 mot WACC 6,99 = +8,1 pp (mellan adidas +5,5 och toppen) på P/B 1,80 — hudvårdens vallgrav utan sportmodets svansrisk. FCF 592 M = 6,2 % marginal (FCF-paradoxen: kassan tjänas efter kapitaltät capex 4,5 % av oms — cellens tyngsta). Utdelning 1,00 EUR (1,35 %) payout 23 % + buyback 2,0 %. 52-v −20,4 % (konsumentcellens gemensamma 2026-dräkt). S&P-standardiserad serie dokumenterad (FY2021 7 627 mot bolagets ~8 613 rapporterat — källkonsekvent endpoint). Nästa rapp 2026-10-27.",
});

if (rader.length === 0) {
  console.log("IDEMPOTENT: samtliga tre tickers finns redan — inget att göra.");
  process.exit(0);
}

// ── innehållsintegritet: gamla rader orörda (bevis efter skrivning) ──────────
const gamlaJson = JSON.stringify(u);

u.push(...rader);
writeFileSync(FIL, JSON.stringify(u, null, 1) + "\n");

const efter = JSON.parse(readFileSync(FIL, "utf8"));
const gamlaI = JSON.stringify(efter.slice(0, innan));
console.log(`APPEND: ${innan} → ${efter.length} (+${rader.length}: ${rader.map((r) => r.ticker).join(", ")})`);
console.log(`GAMLA RADER: ${gamlaI === gamlaJson ? "INNEHÅLLSIDENTISKA (0 förändrade)" : "FÖRÄNDRADE — FEL!"}`);
if (gamlaI !== gamlaJson) process.exit(1);
const m = efter.filter((b) => b.land === "Tyskland" && b.bransch === "konsument" && typeof b.vardering?.pe === "number");
console.log(`TYSKLAND/KONSUMENT: ${m.length} P/E-mätbara — ${m.map((b) => b.ticker + " " + b.vardering.pe).join(" · ")}`);
const kon = efter.filter((b) => b.bransch === "konsument" && typeof b.vardering?.pe === "number");
const pes = kon.map((b) => b.vardering.pe).sort((a, b) => a - b);
console.log(`KONSUMENT (alla länder): n=${pes.length} · sorterade P/E: ${pes.map((x) => Math.round(x * 100) / 100).join(" ")}`);
const tysk = efter.filter((b) => b.land === "Tyskland");
console.log(`TYSKLAND totalt: ${tysk.length} bolag — ${tysk.map((b) => b.ticker).join(", ")}`);
