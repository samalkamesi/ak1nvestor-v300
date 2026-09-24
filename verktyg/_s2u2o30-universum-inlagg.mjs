#!/usr/bin/env node
/**
 * s2-u2 omg30 (manifest auto-s2-1790237704889) — ENI (bit/ENI) + TERNA (bit/TRN),
 * Italien/energi 1→3: olje-jätten och elnätsmonopolisten in i ENEL:s cell.
 * Aritmetikgrind med ABORT FÖRE skrivning (omg13-läxan): varje identitet
 * kontrollräknas ur rådata; EN röd ⇒ filen orörd + exit 1. Idempotent (redan
 * där ⇒ no-op) och race-säker (appendar efter diskens faktiska läge).
 * Konventioner enligt TTE.PA (EPA/energi-mall) + 6301.T (bit-kanalens första
 * leverans; Borsa Italiana = "bit/" på StockAnalysis — MIL/-prefixet är 404).
 * Enhetssystem: balans/ström i mdr EUR på toppnivå, M EUR i serier.
 * MOAT-KONVENTION: fraction (0–1) enligt kodebeviset karna.ts scorV07
 * (medel5 > 0.7 jämförs direkt mot lonksamhet.bruttoMarginal) — KEYENCE-
 * fyndet följt; de 16 äldre procent-raderna är dokumenterad teknisk skuld.
 */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/portfolj-system/bolagsunivers.json";
const u = JSON.parse(readFileSync(FIL, "utf8"));

const NYA = ["ENI.MI", "TRN.MI"];
const befintliga = NYA.filter((t) => u.some((r) => r.ticker === t));
if (befintliga.length) {
  console.log(`${befintliga.join(",")} finns redan — idempotent no-op, disk =`, u.length);
  process.exit(0);
}
const FÖRE = u.length;

// ══ RÅDATA ENI (StockAnalysis bit/ENI fem ytor 2026-09-24 ~10:05 CET live; ═════
// S&P GMI-underlag; Yahoo chart-API paranoid 24,145 EUR 08:08 UTC samma morgon)
const E = {
  kurs: 24.14, yahoo: 24.145,
  aktiebasMdr: 2.902,            // mcap/kurs (översiktens fält 2,91 md avrundat)
  aktiebasViktadMdr: 3.031,      // källans EPS-bas: nettoTTM/EPS
  mcap: 70.06,                   // mdr EUR (översikt + statistics enade)
  epsTTM: 1.66,
  peFalt: 12.61,                 // källans fält = mcap/netto-INKL-minoritet (bevis nedan)
  pe: 14.54,                     // publicerad = kurs/EPS (attributable-vägen, 6301.T-konventionen)
  fwdPeFalt: 9.36, pegFalt: 0.24,
  pb: 1.23, ptbvFalt: 1.39,
  ev: 96.89, evEbitFalt: 11.24, evEbitdaFalt: 6.07, evEarningsFalt: 19.26,
  evEbit: 13.93,                 // publicerad = EV/EBIT-TTM(financials) — källspridning dokumenterad
  pFcFalt: 19.18,
  dps: 1.08, dpsYieldFalt: 4.47, payoutFalt: 66.19,
  revTTM: 89.932, bruttoTTM: 19.353, ebitTTM: 6.956, nettoTTM: 5.031, // mdr EUR
  nettoInklMinoritet: 5.556,     // mcap/peFalt — källans P/E-bas (bevis)
  ocfTTM: 13.125, capexTTM: 9.473, fcfTTM: 3.652,
  kassaStat: 15.09, kassaBalans: 8.365, skuldTTM: 36.99, ekTTM: 56.93,
  minoritetTTM: 4.929,           // balansräkningens minoritetsintresse
  deFalt: 0.65, debtEbitdaFalt: 2.59, rantaTackning: 5.34,
  roeFalt: 0.109, roicFalt: 0.0594, waccFalt: 0.0445,
  altman: 1.66, piotroski: 7, beta: 0.24,
  insiders: 0.0336, institutioner: 0.24,
  ser: { // M EUR, FY2021–2025 (decemberlutande)
    ar: ["2021", "2022", "2023", "2024", "2025"],
    oms: [77664, 133639, 94789, 91166, 83604],
    brutto: [22435, 31480, 21272, 20376, 16852],
    ebit: [12416, 19012, 10219, 6009, 5229],
    netto: [5726, 13778, 4662, 2492, 2371],
    ek: [44519, 55230, 53644, 55648, 52787],           // attributable-EK (minoritet separat)
    ocf: [12861, 17460, 15119, 13092, 13330],
    capex: [4950, 7700, 8739, 7999, 8702],
    fcf: [7911, 9760, 6380, 5093, 4628],
    utdel: [2419, 3147, 3184, 3206, 3390],
    aterkop: [400, 2400, 1803, 2012, 1914],
    skuld: [33131, 31868, 34065, 36843, 34202],
    kassa: [8254, 10155, 10193, 8183, 8100],
    minoritet: [82, 471, 460, 2863, 4847],              // 2024-hoppet = konsolideringar
    tillgangar: [137765, 152130, 142606, 146939, 137069],
  },
};

// ══ RÅDATA TERNA (StockAnalysis bit/TRN fem ytor 2026-09-24 ~10:09 CET live; ══
// Yahoo chart-API paranoid 9,166 EUR 08:14 UTC samma morgon)
const T = {
  kurs: 9.19, yahoo: 9.166,
  aktiebasMdr: 2.011,
  mcap: 18.48,
  epsTTM: 0.53,
  pe: 17.34, fwdPe: 16.52, pegFalt: 4.45,
  pb: 2.14,
  ev: 31.14, evEbitFalt: 16.85, evEbitdaFalt: 10.93,
  evEbit: 16.88,
  dps: 0.40, dpsYieldFalt: 4.31, payoutFalt: 76.15,
  revTTM: 4.217, nettoTTM: 1.066,                     // mdr EUR
  bruttoMarginalFalt: 0.8010, ebitMarginalFalt: 0.4373, nettoMarginalFalt: 0.2644,
  ebitTTM: 1.8446,                                     // revTTM × ebitMarginalFalt
  ocfTTM: 2.925, capexTTM: 3.186, fcfTTM: -0.2614,
  kassa: 2.27, skuld: 14.91, ekTTM: 8.65, ekCommon: 8.629, minoritetTTM: 0.0215,
  deFalt: 1.72, debtEbitdaFalt: 5.24, rantaTackning: 6.62,
  roeFalt: 0.1383, roicFalt: 0.0502, waccFalt: 0.0477,
  altman: null, piotroski: 6, beta: 0.61,
  insiders: null, institutioner: 0.3185,
  ser: { // M EUR, FY2021–2025
    ar: ["2021", "2022", "2023", "2024", "2025"],
    oms: [2565, 2924, 3154, 3661, 4010],
    netto: [789.4, 857, 885.4, 1062, 1063],
    ek: [4682, 6142, 6324, 7524, 7791],               // common-EK (minoritet ~20–30 M)
    ocf: [832.3, 2324, 1085, 1477, 2628],
    capex: [1344, 1492, 2049, 2322, 2945],
    fcf: [-511.9, 831.4, -963.9, -845.3, -317.5],
    skuld: [12552, 11062, 12274, 13906, 15576],
    kassa: [1567, 2155, 1378, 2312, 1833],
    minoritet: [31.1, 27.1, 18.9, 19.8, 21.4],
    tillgangar: [22359, 22803, 23393, 27187, 29983],
  },
};

// ── ARITMETIKGRIND ────────────────────────────────────────────────────────────
const kontroller = [];
const K = (namn, beraknad, falt, tolerans) => {
  const dev = falt === 0 ? Math.abs(beraknad) : Math.abs((beraknad - falt) / falt);
  kontroller.push({ namn, beraknad, falt, dev, ok: dev <= tolerans, tolerans });
};
const sum = (a) => a.reduce((x, y) => x + y, 0);

// ── ENI ───────────────────────────────────────────────────────────────────────
K("ENI kurs Yahoo≈SA", E.yahoo, E.kurs, 0.003);
K("ENI mcap = kurs × aktiebas", (E.kurs * E.aktiebasMdr), E.mcap, 0.005);
K("ENI EPS-bas = netto/viktad aktiebas", E.nettoTTM / E.aktiebasViktadMdr, E.epsTTM, 0.005);
K("ENI pe publicerad = kurs/EPS", E.kurs / E.epsTTM, E.pe, 0.005);
K("ENI källans pe-fält-bas = mcap/netto-inkl-minoritet (BEVIS)", E.mcap / E.peFalt, E.nettoInklMinoritet, 0.005);
K("ENI netto-inkl-minoritet ≈ attributable+minoritetsresultat", E.nettoInklMinoritet - E.nettoTTM, 0.525, 0.05);
K("ENI prognosTillväxt = peFalt/fwdPeFalt − 1", E.peFalt / E.fwdPeFalt - 1, 0.3472, 0.005);
K("ENI peg = pe/prognosTillväxt(%)", E.pe / ((E.peFalt / E.fwdPeFalt - 1) * 100), 0.4188, 0.01);
K("ENI EV = mcap+skuld−kassaStat+minoritet", E.mcap + E.skuldTTM - E.kassaStat + E.minoritetTTM, E.ev, 0.005);
K("ENI EV/EBIT publicerad", E.ev / E.ebitTTM, E.evEbit, 0.005);
K("ENI EV/Earnings-fält = EV/netto-attributable (källans spegelbas)", E.ev / E.nettoTTM, E.evEarningsFalt, 0.005);
K("ENI P/B = mcap/EK", E.mcap / E.ekTTM, E.pb, 0.005);
K("ENI bruttoMarginal TTM", E.bruttoTTM / E.revTTM, 0.2152, 0.005);
K("ENI ebitMarginal TTM", E.ebitTTM / E.revTTM, 0.0773, 0.005);
K("ENI nettoMarginal attributable", E.nettoTTM / E.revTTM, 0.0559, 0.005);
K("ENI fcfMarginal TTM", E.fcfTTM / E.revTTM, 0.0406, 0.005);
K("ENI fcfYield = FCF/mcap", E.fcfTTM / E.mcap, 0.0521, 0.005);
K("ENI källans P/FCF = mcap/FCF", E.mcap / E.fcfTTM, E.pFcFalt, 0.005);
K("ENI FCF TTM = OCF − capex", E.ocfTTM - E.capexTTM, E.fcfTTM, 0.0005);
K("ENI D/E", E.skuldTTM / E.ekTTM, E.deFalt, 0.01);
K("ENI debt/EBITDA = FY25-skuld/deras EBITDA-fält 13,24 (deras bas)", E.ser.skuld[4] / 1000 / 13.24, E.debtEbitdaFalt, 0.005);
K("ENI DPS-yield", E.dps / E.kurs, E.dpsYieldFalt / 100, 0.005);
K("ENI omsCAGR FY21→25", Math.pow(E.ser.oms[4] / E.ser.oms[0], 1 / 4) - 1, 0.0186, 0.005);
K("ENI resCAGR FY21→25", Math.pow(E.ser.netto[4] / E.ser.netto[0], 1 / 4) - 1, -0.1977, 0.005);
K("ENI FY25-netto-fallet mot FY22-toppen", E.ser.netto[4] / E.ser.netto[1] - 1, -0.8279, 0.005);
K("ENI TTM-vändningen mot FY25", E.nettoTTM / (E.ser.netto[4] / 1000) - 1, 1.1218, 0.005); // +112,2 %
K("ENI shareholder yield FY25 = (utd+återköp)/mcap", (E.ser.utdel[4] + E.ser.aterkop[4]) / (E.mcap * 1000), 0.0757, 0.01);
for (let i = 0; i < 5; i++) K(`ENI FCF FY${E.ser.ar[i]} = OCF−capex`, E.ser.ocf[i] - E.ser.capex[i], E.ser.fcf[i], 0.0005);
const eGm = E.ser.brutto.map((b, i) => b / E.ser.oms[i]); // fraction-punkter
const eGmMedel = sum(eGm) / 5, eGmSpread = Math.max(...eGm) - Math.min(...eGm);
K("ENI moat medel 5 år (fraction)", eGmMedel, 0.2348, 0.005);
K("ENI moat spread 5 år (fraction)", eGmSpread, 0.0873, 0.005);
kontroller.push({ namn: "ENI Sony-fällan: TTM>0 ⇒ pe mätt", beraknad: E.nettoTTM > 0 ? "mätt ✓" : "negativt?!", falt: "mätt", dev: 0, ok: E.nettoTTM > 0, tolerans: 0 });
kontroller.push({ namn: "ENI endpoint>0 ⇒ resCAGR mätt", beraknad: E.ser.netto[4] > 0 && E.ser.netto[0] > 0 ? "mätt ✓" : "null?!", falt: "mätt", dev: 0, ok: E.ser.netto[4] > 0 && E.ser.netto[0] > 0, tolerans: 0 });

// ── TERNA ─────────────────────────────────────────────────────────────────────
K("TRN kurs Yahoo≈SA (intraday-band)", T.yahoo, T.kurs, 0.003);
K("TRN mcap = kurs × aktiebas", T.kurs * T.aktiebasMdr, T.mcap, 0.005);
K("TRN EPS-bas = netto/aktiebas", T.nettoTTM / T.aktiebasMdr, T.epsTTM, 0.005);
K("TRN pe = kurs/EPS (källfält == replik — REN)", T.kurs / T.epsTTM, T.pe, 0.005);
K("TRN prognosTillväxt = pe/fwdPe − 1", T.pe / T.fwdPe - 1, 0.0496, 0.005);
K("TRN peg = pe/prognosTillväxt(%)", T.pe / ((T.pe / T.fwdPe - 1) * 100), 3.496, 0.01);
K("TRN källans PEG-fält på 3-årsbas 3,9 % (dok.)", T.pe / 3.9, T.pegFalt, 0.005);
K("TRN EV = mcap+skuld−kassa+minoritet", T.mcap + T.skuld - T.kassa + T.minoritetTTM, T.ev, 0.005);
K("TRN EBIT TTM = rev × ebitMarginal-fält", T.revTTM * T.ebitMarginalFalt, T.ebitTTM, 0.005);
K("TRN EV/EBIT publicerad", T.ev / T.ebitTTM, T.evEbit, 0.005);
K("TRN P/B = mcap/EK-total", T.mcap / T.ekTTM, T.pb, 0.005);
K("TRN nettoMarginal attributable", T.nettoTTM / T.revTTM, 0.2528, 0.005);
K("TRN fcfMarginal TTM", T.fcfTTM / T.revTTM, -0.0620, 0.005);
K("TRN fcfYield = FCF/mcap", T.fcfTTM / T.mcap, -0.01414, 0.005);
K("TRN FCF TTM = OCF − capex", T.ocfTTM - T.capexTTM, T.fcfTTM, 0.005);
K("TRN D/E", T.skuld / T.ekTTM, T.deFalt, 0.01);
K("TRN debt/EBITDA mot deras EBITDA-fält 2,82", T.skuld / 2.82, T.debtEbitdaFalt, 0.01);
K("TRN DPS-yield på current-DPS 0,396", 0.396 / T.kurs, T.dpsYieldFalt / 100, 0.005);
K("TRN omsCAGR FY21→25", Math.pow(T.ser.oms[4] / T.ser.oms[0], 1 / 4) - 1, 0.1184, 0.005);
K("TRN resCAGR FY21→25", Math.pow(T.ser.netto[4] / T.ser.netto[0], 1 / 4) - 1, 0.0773, 0.005);
K("TRN capex-resan 2,4× (dok. signatur)", T.ser.capex[4] / T.ser.capex[0], 2.19, 0.01);
for (let i = 0; i < 5; i++) K(`TRN FCF FY${T.ser.ar[i]} = OCF−capex`, T.ser.ocf[i] - T.ser.capex[i], T.ser.fcf[i], 0.002); // källans avrundningar ~0,1 %
kontroller.push({ namn: "TRN Sony-fällan: TTM>0 ⇒ pe mätt", beraknad: T.nettoTTM > 0 ? "mätt ✓" : "negativt?!", falt: "mätt", dev: 0, ok: T.nettoTTM > 0, tolerans: 0 });
kontroller.push({ namn: "TRN endpoint>0 ⇒ resCAGR mätt", beraknad: T.ser.netto[4] > 0 && T.ser.netto[0] > 0 ? "mätt ✓" : "null?!", falt: "mätt", dev: 0, ok: T.ser.netto[4] > 0 && T.ser.netto[0] > 0, tolerans: 0 });

let roda = kontroller.filter((k) => !k.ok);
for (const k of kontroller) {
  console.log(`${k.ok ? "✓" : "✗"} ${k.namn}: beräknad ${typeof k.beraknad === "number" ? k.beraknad.toFixed(6) : k.beraknad} mot fält ${k.falt} (avvik ${(k.dev * 100).toFixed(3)} %, tol ${(k.tolerans * 100).toFixed(1)} %)`);
}
if (roda.length) {
  console.error(`\nARITMETIKGRIND RÖD — ${roda.length} fel — ABORT, filen orörd`);
  process.exit(1);
}
console.log(`\nARITMETIKGRIND GRÖN — ${kontroller.length}/${kontroller.length} — skriver ${FÖRE}→${FÖRE + 2}`);

// ── RADERNA (kanonisk fältordning enligt 6301.T, 1-space-indent = diskens format) ──
const eniRad = {
  ticker: "ENI.MI",
  namn: "Eni S.p.A.",
  bransch: "energi",
  land: "Italien",
  valuta: "EUR",
  kallor: [
    {
      namn: "StockAnalysis",
      hamtat: "2026-09-24",
      url: "https://stockanalysis.com/quote/bit/ENI/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/)",
      paranoid: "BIT-PRIMÄRNOTING i EUR (S&P GMI-underlag; SA-live 2026-09-24 10:05 CET, fördröjd kurs; MIL/-prefixet är 404 på StockAnalysis — bit/ är Borsa Italiana-kanalen, första leverans i spåret): kurs 24,14 EUR (Yahoo chart-API 24,145 = 0,02 % band EXAKT, samma morgon 08:08 UTC; veckoserien 23,95→23,47→23,38→null→24,145, valuta EUR verifierad i meta), mcap 70,06 mdr EUR = 24,14 × 2 902 M EXAKT (översiktens aktiefält 2,91 md avrundat; den viktade EPS-basen 5 031/1,66 = 3 031 M — samma viktad-bas-splittra som Komatsu 891,51/903,2), EPS TTM 1,66 (financials TTM-kolumn = översikten), P/E-KÄLLSPLITTRAN BEVISAD: källans pe-fält 12,61 = mcap/netto-INKL-minoritet 5 556 (70,06/12,61 = 5,556 EXAKT; attributable 5 031 + minoritetsresultat ≈ 0,5) MEDAN deras EV/Earnings 19,26 = 96,89/5 031 attributable EXAKT — TVÅ netto-baser i samma vy; publicerad pe 14,54 = kurs/EPS-vägen (6301.T-konventionen), fwd PE 9,36 ⇒ prognosTillväxt +34,7 % = peFalt/fwdPeFalt (bas-okänsligt inom paret; källans PEG-fält 0,24 på egen 3-årsbas — repliken 12,61/15,60 ger 0,81, deras bas höljemystisk, dokumenterad rå), publicerad peg 0,42 = 14,54/34,72, P/B 1,23 = 70,06/56,93 EXAKT (P/TBV 1,39 dokumentär), EV 96,89 mdr = mcap+skuld 36,99−kassaStat 15,09+minoritet 4,93 EXAKT (KASS-SPLITTRAN dokumenterad: statistics-kassan 15,09 inkluderar kortfristiga placeringar mot balansräkningens likvida 8,365 — EV-kedjan replikeras endast på statistics-konventionen), EV/EBIT publicerad 13,93 = 96,89/6,956 mot källans fält 11,24 (deras bredare EBIT-bas 8,62 — 6301.T-mönstret), EV/EBITDA 6,07 deras fält, marginaler TTM: brutto 21,52 % (19,353/89,932 EXAKT) EBIT 7,73 % (EXAKT) netto attributable 5,59 % (källfältet 5,87 på bredare bas — splittran dokumenterad) FCF 4,06 % (EXAKT), FCF TTM 3,652 = OCF 13,125 − capex 9,473 EXAKT, fcfYield 5,21 % (källans P/FCF 19,18 = 70,06/3,653 EXAKT samma par), ROE 10,90 % (S&P-bas; replik 8,84 attributable / 8,98 total-EK — dokumenterat spann), ROIC 5,94 % mot WACC 4,45 % = +1,49 pp (supermajorns kapitalmassa), räntetäckning 5,34, D/E 0,65 EXAKT (36,99/56,93), Debt/EBITDA 2,59 EXAKT mot deras EBITDA-fält 13,24 (replik på EBIT 6,956 ger 5,33 — källans EBITDA är bredarebas, dokumenterat), Altman 1,66 (energisektorns tunga balansräkning; källans fält, utan tolkning), Piotroski 7, beta 0,24 (5Y — energijättens låga korrelationsklass), NETTOSKULD −21,90 mdr EUR (källfält), utdelning 1,08 EUR/år (4,47 %; DPS-vägen 0,86→0,88→0,94→1,00→1,05→1,08 — SEX RAKA HÖJNINGAR GENOM CYKELFALLET −83 %: payout steg 26→66 % — utdelningspolitiken som cykelvärdare), payout 66,19 % (FCF-payout 86,19), betalda FY2025 3 390 M EUR (TTM 3 497), återköp FY2025 1 914 M (TTM 2 097) ⇒ shareholder yield FY25 = 5,3/70,1 = 7,57 % (källans yield-fält 6,59 på deras vintage — dokumenterad), aktiebas −2,11 % YoY, insiders 3,36 % institutioner 24,00 %, 52-v 14,54–25,02 (+62,16 %), analytiker Köp 22 st PT 25,79 (+6,8 %), 32 168 anställda (rev/anställd 2,80 M EUR = 89,93/32,168 EXAKT), grundat 1953 (Enrico Mattei; AGIP-arvet 1926), nästa rapport 2026-10-23 (Q3); FY-serier dec-lutande (M EUR): rev 77 664→133 639→94 789→91 166→83 604 (2021→2025; TTM 89 932 +10,6 %), EBIT 12 416→19 012→10 219→6 009→5 229 (TTM 6 956 VÄNDER +33 %), netto 5 726→13 778→4 662→2 492→2 371 (2022-toppen till 2025-botten −82,8 %; TTM 5 031 VÄNDER +112,2 % — cykelns hela berg-och-dalbana på sex punkter), bruttomarginalpunkter 28,89→23,56→22,44→22,35→20,16 % (TTM 21,52 — moat i FRACTION 0,2348/0,0873 enligt kodebeviset karna.ts scorV07 medel5>0.7), EK 44 519→52 787 (TTM 56 930), minoritet 82→471→460→2 863→4 847 (TTM 4 929 — 2024-konsolideringshoppet, Var Energi-klassen; 60× på fem år), skuld 33 131→34 202 stabil, kassa 8 254→8 100, FCF 7 911→9 760→6 380→5 093→4 628 (5/5 positiva; varje år OCF−capex EXAKT; TTM 3 652 — capex 4 950→9 473 har nästan FÖRDOUBLATS medan OCF planar 13 miljardklassen: omställningsinvesteringarna äter FCF-marginalen 10,2→4,1 %), goodwill 2 862→3 164→247 TTM (avyttring/omklassning 2026 — dokumenterad utan orsaksspekulation), tillgångar 137 765→137 069",
    },
    {
      namn: "Yahoo Finance (chart-API)",
      hamtat: "2026-09-24",
      url: "https://query1.finance.yahoo.com/v8/finance/chart/ENI.MI?range=5d&interval=1d",
      paranoid: "paranoid kurskoll: Yahoo regularMarketPrice 24,145 EUR mot SA-live 24,14 = 0,02 % band EXAKT (samma handelsmorgon 2026-09-24; chartPreviousClose 24,09, veckoserien 23,95→23,47→23,38→null→24,145, valuta EUR verifierad i meta)",
    },
  ],
  hamtat: "2026-09-24",
  pris: 24.14,
  marknadsKapitalMdr: 70.06,
  tillvaxt: {
    omsattningCAGR5ar: 0.0186,
    resultatCAGR5ar: -0.1977,
    omsattningTillvaxtTTM: 0.1056,
    prognosTillvaxt: 0.3472,
  },
  lonksamhet: {
    roe: 0.109,
    roic: 0.0594,
    bruttoMarginal: 0.2152,
    ebitMarginal: 0.0773,
    nettoMarginal: 0.0559,
    fcfMarginal: 0.0406,
  },
  stabilitet: {
    skuldEgenkapital: 0.65,
    rantaTackning: 5.34,
    fcfPositivaSenaste5: 5,
    kassaManaderBurnRate: null,
    nyemissionerSenaste5ar: null,
  },
  aterkop: {
    senasteArMdr: 3.39,
    andelUtestande: 0.0336,
    insiderkopSenaste6man: null,
  },
  moat: {
    bruttoMarginalMedel5ar: 0.2348,
    bruttoMarginalSpread5ar: 0.0873,
    roeMedel5ar: null,
  },
  vardering: {
    pe: 14.54,
    pb: 1.23,
    evEbit: 13.93,
    peg: 0.42,
    fcfYield: 0.0521,
    egenKapitalMultipl: 1.23,
  },
  golv: {
    typ: "osatt",
    vardePerAktie: null,
    marginal: null,
  },
  serier: {
    ar: E.ser.ar,
    omsattning: E.ser.oms.map((x) => x * 1e6),
    resultat: E.ser.netto.map((x) => x * 1e6),
    egetKapital: E.ser.ek.map((x) => x * 1e6),
    fcf: E.ser.fcf.map((x) => x * 1e6),
  },
  notering: "Italien/energi 1→2 — G7-ekonomins energi-gren får sin ANDRA affärsmodell: ENEL (förnybar/el-produktion) + ENI (olja/gas integrerad) + Terna (reglerat transmissionsnät) = tre sätt att förhålla sig till energipriser i EN cell (råvarucykel · produktion · reglerad monopolist). SIGNATURTAL — CYKELNS HELA BERG-OGH-DALBANA PÅ SEX PUNKTER: (1) NETTOTRAPpan 5,7→13,8→4,7→2,5→2,4→TTM 5,0 mdr EUR — 2022-toppen till 2025-botten −82,8 % MEDAN TTM vänder +112,2 %: vinstcykelns symmetri som data; EBIT följer samma bana 19,0→5,2→TTM 7,0. (2) SUPERMAJOR-JÄMFÖRELSEN I SAMMA UNIVERSUM: TotalEnergies (TTE.PA, Frankrike/energi sedan omg26) pe-fält 11,32 mot ENI 12,61 — de europeiska olje-integrerade sida vid sida; BP.L (UK/energi) kompletterar triaden. (3) UTDELNINGS-KONTINUITETEN: DPS 0,86→0,88→0,94→1,00→1,05→1,08 — sex raka höjningar GENOM resultatfallet −83 % (payout 26→66 %, FCF-payout 86 %): utdelningspolitiken som cykelvärderare, inte cykeloffer; + återköp ~1,9-2,4 mdr/år ⇒ shareholder yield 7,57 % FY25 (5,30/70,06 = utdelning+återköp). (4) CAPEX-FÖRDOUBLINGEN: 4 950→9 473 M EUR medan OCF planar i 13-miljardklassen — FCF-marginalen 10,2→4,1 %: omställningsinvesteringarna (Plenitude/Var Energi-klassen) äter dagens kassaflöde mot framtidens produktion; minoritetsresan 82→4 929 M (60×) är samma konsolideringsprograms balansräkningsspegling. (5) BETA 0,24 (5Y) — energijättens låga korrelationsklass (dokumenterad kuriosa: lägre än Ternas 0,61 trots råvarulexponering — oljepriset vs reglerade tariffer). (6) GRUNDAT 1953 (Enrico Mattei; AGIP-arvet från 1926) — det italienska energiväsendets statliga grundsten, 32 168 anställda. Källspridningar öppet: pe-fält 12,61 (netto-inkl-minoritet-bas) mot publicerad 14,54 (EPS-attributable-väg — källans EV/Earnings 19,26 bevisar dubbelbasen); statistics-kassa 15,09 (placeringar inkluderade) mot balanslikvider 8,365 — EV 96,89 replikeras ENDAST på statistics-konventionen; ROE-fält 10,90 mot replik 8,84/8,98; Altman 1,66 = källfält (energisektorns tunga balansräkningsklass); PEG-fält 0,24 på källans okända 3-årsbas mot mallens 0,42. Kontrastpartnerna: TTE.PA (supermajor-systern) · BP.L (Nordsjö-motpolen) · ENEL.MI + TRN.MI (samma cells två andra affärsmodeller). FIFO: Q3 2026-10-23.",
};

const trnRad = {
  ticker: "TRN.MI",
  namn: "Terna S.p.A.",
  bransch: "energi",
  land: "Italien",
  valuta: "EUR",
  kallor: [
    {
      namn: "StockAnalysis",
      hamtat: "2026-09-24",
      url: "https://stockanalysis.com/quote/bit/TRN/ (+ /statistics/ + /financials/ + /financials/balance-sheet/)",
      paranoid: "BIT-PRIMÄRNOTING i EUR (S&P GMI-underlag; SA-live 2026-09-24 10:09 CET): kurs 9,19 EUR (Yahoo chart-API 9,166 vid 08:14 UTC = 0,26 % INTRADAY-band — dagsspannet 9,16–9,21 OMSLUTER båda; fem minuters drift på samma morgon, ärligt bredare än ENI:s 0,02 %; veckoserien 9,326→9,394→9,316→null→9,166, valuta EUR verifierad i meta; SA previousClose 9,21), mcap 18,48 mdr EUR = 9,19 × 2 011 M EXAKT, EPS TTM 0,53 (financials TTM = översikt), P/E 17,34 = 9,19/0,53 EXAKT — källfält och EPS-väg IDENTISKA (ren notering, ingen bas-splittra), fwd PE 16,52 ⇒ prognosTillväxt +4,96 % (mogen reglerad tillväxt; källans PEG-fält 4,45 på 3-årsbas 3,9 %: 17,34/3,9 = 4,45 EXAKT — dokumenterad deras bas), publicerad peg 3,50 = mallens 1-årsbas, P/B 2,14 = 18,48/8,65 EXAKT (common-basen 8 629 ger 2,142 — minoritet 21,5 M försumbar; statistics-sidans 'BVPS 2,96' är INKOHERENT med EK/aktier 8 650/2 011 = 4,30 — P/B-fältet bärs HELT av mcap/EK-vägen, BVPS-raden dokumenterad som källartefakt), EV 31,14 mdr = mcap+skuld 14,91−kassa 2,27+minoritet 0,0215 EXAKT, EV/EBIT publicerad 16,88 = 31,14/1,8446 (EBIT TTM = 4,217 × 43,73 %-fältet EXAKT; källfältet 16,85 — ±0,03 dokumenterad), EV/EBITDA 10,93 deras fält, marginaler TTM: brutto 80,10 % (källfält — universumets NÄST HÖGSTA mätbara efter Keyence-klassen 83,66 %: nätmonopolisten utan produktkostnad) EBIT 43,73 % netto attributable 25,28 % (1 066/4 217; källfältet 26,44 på bredare bas — splittran dokumenterad) FCF −6,20 % (NEGATIVT — källans P/FCF n/a), FCF TTM −261,4 M EUR = OCF 2 925 − capex 3 186 EXAKT, fcfYield −1,41 % (negativ dokumenterad — inget noll), ROE 13,83 %, ROIC 5,02 % mot WACC 4,77 % = +0,25 pp — DEN REGLERADE EKONOMIN: avkastningstak ≈ kapitalkostnad (RAB-modellen som data), räntetäckning 6,62, D/E 1,72 EXAKT (14,91/8,65), Debt/EBITDA 5,24 — universumets tyngsta skuldklass (infrastrukturens balansräkning: tillgångar 30,5 mdr mot EK 8,7), Altman n/a (källfält saknas — dokumenterat), Piotroski 6, beta 0,61, NETTOSKULD −12,64 mdr EUR (EXAKT 2,27−14,91), utdelning 0,40 EUR/år (4,31 %; DPS-vägen 0,291→0,314→0,340→0,396→0,369 + current 0,396 — FY-värdena är källans BETALNINGS-kalender (FY24 0,396 > FY25 0,369 = föregående års final + årets interim, dokumenterad konvention) medan DEKLARERAAD utdelning växer årligen; payout 76,15 % på reglerad inkomst), institutioner 31,85 % (CdpReti/statliga blocket — dokumentärt utan procent), insider n/a, aktiebas +0,14 % YoY (statligt ägande: inga återköp, fältet −0,14 % = nettoutspädning noll-klassen), 52-v 8,41–10,41 (+8,81 %), analytiker Hold 19 st PT 9,84 (+7,12 %), 7 260 anställda, grundat 1962 (GRTN-arvet — Italiens transmissionsnätoperatör, TSO), nästa rapport 2026-11-12; FY-serier dec-lutande (M EUR): rev 2 565→2 924→3 154→3 661→4 010 (2021→2025, +11,8 % CAGR — nästan ENEL-tempo i halva skala; TTM 4 217 +11,4 %), netto 789,4→1 063 (+7,7 % CAGR; TTM 1 066), EK common 4 682→7 791 (TTM 8 629 — utdelningen äter hälften av vinsten, resten kapitaliseras), skuld 12 552→15 576, kassa 1 567→1 833, FCF −511,9→831,4→−963,9→−845,3→−317,5 (1/5 positiva år! capex 1 344→2 945 = 2,19× — nätutbyggnadsprogrammet äter kassan; varje år OCF−capex ≈ källans FCF inom 0,1 % avrundning), tillgångar 22 359→29 983",
    },
    {
      namn: "Yahoo Finance (chart-API)",
      hamtat: "2026-09-24",
      url: "https://query1.finance.yahoo.com/v8/finance/chart/TRN.MI?range=5d&interval=1d",
      paranoid: "paranoid kurskoll: Yahoo regularMarketPrice 9,166 EUR mot SA-live 9,19 = 0,26 % intraday-band (08:14 UTC resp 10:09 CET samma morgon 2026-09-24; dagsspannet 9,16–9,21 omsluter BÅDA — bandet är realistisk intraday-drift, bredare än ENI:s 0,02 % och dokumenterat som sådant; chartPreviousClose 9,42 = veckofönstrets start, veckoserien 9,326→9,394→9,316→null→9,166, valuta EUR verifierad i meta)",
    },
  ],
  hamtat: "2026-09-24",
  pris: 9.19,
  marknadsKapitalMdr: 18.48,
  tillvaxt: {
    omsattningCAGR5ar: 0.1184,
    resultatCAGR5ar: 0.0773,
    omsattningTillvaxtTTM: 0.1136,
    prognosTillvaxt: 0.0496,
  },
  lonksamhet: {
    roe: 0.1383,
    roic: 0.0502,
    bruttoMarginal: 0.801,
    ebitMarginal: 0.4373,
    nettoMarginal: 0.2528,
    fcfMarginal: -0.062,
  },
  stabilitet: {
    skuldEgenkapital: 1.72,
    rantaTackning: 6.62,
    fcfPositivaSenaste5: 1,
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
    pe: 17.34,
    pb: 2.14,
    evEbit: 16.88,
    peg: 3.5,
    fcfYield: -0.0141,
    egenKapitalMultipl: 2.14,
  },
  golv: {
    typ: "osatt",
    vardePerAktie: null,
    marginal: null,
  },
  serier: {
    ar: T.ser.ar,
    omsattning: T.ser.oms.map((x) => x * 1e6),
    resultat: T.ser.netto.map((x) => x * 1e6),
    egetKapital: T.ser.ek.map((x) => x * 1e6),
    fcf: T.ser.fcf.map((x) => x * 1e6),
  },
  notering: "Italien/energi 2→3 — cellens TREDJE affärsmodell: det reglerade transmissionsnätet (TSO-monopolisten) bredvid ENEL:s produktion och ENI:s råvarucykel — energi-grenens tre arketyper i EN cell. SIGNATURTAL — REGLEDRADEN: (1) BRUTTOMARGINAL 80,10 % = universumets NÄST HÖGSTA mätbara fältvärde (Keyence-klassen 83,66 toppar; RMS.PA under): moat UTAN produktvarumärke — lagstadgad monopolist, noll råvarukostnad i marginalen; moat-fälten null (källan saknar årlig bruttovinsthistorik — ENEL-precedensen). (2) ROIC 5,02 % mot WACC 4,77 % = +0,25 pp — DEN REGLERADE EKONOMIN Som data: avkastningstak ≈ kapitalkostnad (RAB-modellen); jämför ENI +1,49 pp och energi-grenen i övrigt — nätmekaniken är precis avkastning, inte värdeskapande marginal. (3) SKULDARKETYPEN: D/E 1,72, Debt/EBITDA 5,24 (universumets tyngsta klass), tillgångar 30,5 mdr mot EK 8,7 — infrastrukturens balansräkning där räntetäckningen 6,62 ändå bär (reglerad inkomst = förutsägbar debt service). (4) CAPEX-VÅGEN MOT UTDELNINGEN: FCF 1/5 positiva år (−511,9→831,4→−963,9→−845,3→−317,5) medan capex 2,19× (1 344→2 945 M EUR) och DPS växer 0,291→0,396 (+36 %) — nätutbyggnadsprogrammet (elöverföringens kapitalcykel) äter kassan, payout 76 % betalas av reglerad inkoming: FCF-linserna MISSLEDER på RAB-bolag (kvartilens pedagogiska kärna); aktiebasen +0,14 % = statligt block, noll återköp. (5) P/E 17,34 mot ENEL 21,87 och ENI 14,54 — cellens tre multiplar: nät (lägsta riskpremie på reglerad inkoming) · förnybar producent · råvarucykel — KVARTILPEDAGOGIKENS triangel i en cell. (6) GRUNDAT 1962 — Italiens TSO, 7 260 anställda, nätets 380 kV-stamnät som nationalinfrastruktur. Källspridningar öppet: Yahoo-band 0,26 % intraday (dagsspann omsluter; bredare än ENI:s 0,02 %); netto-marginal-fält 26,44 vs attributable 25,28; EV/EBIT-fält 16,85 vs replik 16,88; P/FCF n/a = negativt FCF (publicerat −1,41 %, aldrig noll); statistics-BVPS 2,96 inkoherent (EK/aktier = 4,30 — P/B bärs av mcap/EK); Altman n/a. Kontrastpartnerna: ENEL.MI (produktionen) · ENI.MI (cykeln) · TEL.OL/T vs RAB-mekaniken. FIFO: 1H/Q3-rapport 2026-11-12.",
};

const gammal = readFileSync(FIL, "utf8");
u.push(eniRad, trnRad);
// RACE 19: syskonet u1 (INPEX 1605.T) skrev om filen med indent 2 under fönstret —
// diskens faktiska format är indent 2, appenden följer det (innehåll oberört av indent).
const ny = JSON.stringify(u, null, 2) + "\n";
const prefix = gammal.slice(0, gammal.lastIndexOf("}") + 1);
if (!ny.startsWith(prefix)) {
  console.error("PREFIX-BEVIS RÖTT — gammal fil ej prefix av ny — ABORT");
  process.exit(1);
}
writeFileSync(FIL, ny);
const efter = JSON.parse(readFileSync(FIL, "utf8"));
console.log(`APPEND KIRURGISK: ${FÖRE}→${efter.length} (0 gamla rader förändrade, prefix bit-identisk)`);
for (const t of NYA) {
  const r = efter.find((x) => x.ticker === t);
  console.log(`LÄS-TILLBAKA: ${t} närvarande = ${!!r} · ${r.bransch}/${r.land} · pe ${r.vardering.pe}`);
}
