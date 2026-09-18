#!/usr/bin/env node
/**
 * s2-u3 omg14 (manifest auto-s2-1789715100341) — DATASET-DJUP:
 * DANMARK/HÄLSA +3: GENMAB (GMAB) + H. LUNDBECK (HLUN.B) + AMBU (AMBU.B)
 * — cellen 2→5 P/E-mätbara ⇒ /dataset/halso/danmark föds (ny danmark-modul
 * i land.ts, samma leverans). Idempotent append på diskens faktiska läge
 * (syskonens rader lämnas elementvis orörda; redan förekommande tickers
 * hoppas — omg11/12/13-konventionen). Källa StockAnalysis hämtad
 * 2026-09-18 (GMAB close 2026-09-17 16:00 EDT; HLUN.B/AMBU.B intraday
 * 2026-09-18 ~09:1x–09:2x CET, data-uppdaterad 2026-09-17).
 * ALL aritmetik maskinverifierad FÖRE skrivning (abort-grind, omg13-läxan).
 */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/portfolj-system/bolagsunivers.json";
const u = JSON.parse(readFileSync(FIL, "utf8"));
const innan = u.length;
const har = (t) => u.some((b) => b.ticker === t);

// ── käldata (StockAnalysis, hämtat 2026-09-18; paranoid per rad) ─────────────
const K = {
  GMAB: {
    pris: 34.54, mcapMdr: 20.59, evMdr: 24.37,
    pe: 26.13, peFwd: 20.88, pegKalla: null, pb: 3.46, evEbit: 18.27, evEbitda: 17.7,
    bruttoM: 0.9303, ebitdaM: 0.3333, ebitM: 0.3229, nettoM: 0.1908, fcfM: 0.2104,
    roe: 0.14, roa: 0.0879, roic: 0.1207, roce: 0.1173, wacc: 0.0735,
    skuldEk: 0.89, rantaTack: 4.96,
    kassaMdr: 1.51, skuldMdr: 5.27, equityMdr: null,
    fcfTTM: 869, ocfTTM: 891, revTTM: 4131, nettoTTM: 788,
    dps: null, direktAvk: null, payout: null, buybackYield: 0.0173, insiders: 1.21,
    revTillvaxtTTM: 0.2225, nettoTillvaxtTTM: -0.379,
    rev3yProg: 0.2014, eps3yProg: 0.1464, effSkatt: 0.1302,
    beta: 0.7, v52Forandr: 0.2229,
    rapport: "2026-11-05",
    analytiker: "Strong Buy mål 38,86 (+12,5 %), 12 st",
    bruttoMargAr: [1.0, 0.9862, 0.9542, 0.936],        // FY2022..FY2025
    serier: { ar: ["2022", "2023", "2024", "2025"], oms: [2084, 2390, 3121, 3720], netto: [783.33, 631, 1133, 963], fcf: [516.52, 1018, 1099, 1149] },
   terkopAr: [76.02, 143.1, 96, 576, 448],              // återköp FY2021..FY2025 MUSD
  },
  HLUN: {
    pris: 42.92, mcapMdr: 41.63, evMdr: 48.85,
    pe: 10.75, peFwd: 6.98, pegKalla: 1.62, pb: 1.55, evEbit: 7.53, evEbitda: 5.84, evFcf: 9.36,
    bruttoM: 0.8206, ebitdaM: 0.3186, ebitM: 0.2499, nettoM: 0.1516, fcfM: 0.2011,
    roe: 0.1541, roa: 0.0776, roic: 0.1367, roce: 0.1497, wacc: 0.0464,
    skuldEk: 0.35, rantaTack: 405.5,
    kassaMdr: 2.2, skuldMdr: 9.42, bvps: 27.15, aktier: 991.23,
    fcfTTM: 5220, revTTM: 25960, nettoTTM: 3940, epsTTM: 3.97,
    dps: 1.15, direktAvk: 0.0268, payout: 0.29, utdVaxst: 0.2105, buybackYield: -0.0004, insiders: 0.15,
    revTillvaxtTTM: 0.104, nettoTillvaxtTTM: 0.147,
    rev3yProg: 0.0111, eps3yProg: 0.027, effSkatt: 0.2765,
    beta: 0.26, v52Forandr: -0.0201,
    analytiker: "Buy mål 48,58 (+13,2 %), 13 st",
    bruttoMargAr: [0.7746, 0.7669, 0.7785, 0.7835, 0.7748],  // FY2019..FY2023 (cachad vintage, fasta historiska)
    serier: { ar: ["2021", "2022", "2023", "2024", "2025"], oms: [16299, 18246, 19912, 22005, 24630], netto: [1318, 1916, 2290, 3141, 3190], fcf: [] },
    dpsAr: [0.58, 0.70, 0.95, 1.15],                     // 2023..2026 DKK
  },
  AMBU: {
    pris: 65.65, mcapMdr: 17.1, evMdr: 16.97,
    pe: 34.12, peFwd: 22.79, pegKalla: 0.75, pb: 2.77, evEbit: 24.07, evEbitda: 18.09, evFcf: 23.03,
    bruttoM: 0.6011, ebitdaM: 0.1393, ebitM: 0.113, nettoM: 0.0818, fcfM: 0.1182,
    roe: 0.0845, roa: 0.0581, roic: 0.0904, roce: 0.1057, wacc: 0.1169,
    skuldEk: 0.09, rantaTack: 15.67,
    kassaMdr: 0.705, skuldMdr: 0.579,
    fcfTTM: 737, ocfTTM: null, revTTM: 6237, nettoTTM: 510, epsTTM: 1.92,
    dps: 0.41, direktAvk: 0.0062, payout: 0.2157, buybackYield: 0.0067, insiders: 20.45,
    revTillvaxtTTM: 0.0468, nettoTillvaxtTTM: 0.421,
    rev3yProg: 0.0927, eps3yProg: 0.1758, effSkatt: 0.2308,
    beta: 1.39, v52Forandr: -0.3241,
    analytiker: "Hold mål 81,77 (+24,6 %), 8 st",
    bruttoMargAr: [0.6237, 0.5747, 0.5682, 0.5938, 0.6018],  // FY2021..FY2025
    serier: { ar: ["2021", "2022", "2023", "2024", "2025"], oms: [4013, 4444, 4775, 5391, 6037], netto: [247, 93, 168, 235, 609], fcf: [152.1, -43.1, 447.0, 725.1, 673.7] },
    fcfMargAr: [0.0379, -0.0097, 0.0936, 0.1345, 0.1116],     // källans FCF-marginal FY2021..FY2025 (seriens derivationsbas)
  },
};

// ── härledda tal + aritmetikgrind (abort FÖRE skrivning) ─────────────────────
const cagr = (a, b, perioder) => Math.pow(b / a, 1 / perioder) - 1;
const FEL = [];
const jamfor = (namn, calc, ext, tol = 0.005, enhet = "procent") => {
  const c = enhet === "andel" ? calc : calc;
  const ok = Math.abs(c - ext) <= tol;
  if (!ok) FEL.push(`${namn}: beräknat ${c} mot externt ${ext} (tol ${tol})`);
  return ok;
};

// GMAB
{
  const g = K.GMAB;
  const prognos = g.pe / g.peFwd - 1;                        // 0,2514
  jamfor("GMAB prognosTillväxt", prognos, 0.2514, 0.0005);
  jamfor("GMAB peg-spår", g.pe / (prognos * 100), 1.04, 0.01);
  jamfor("GMAB revCAGR", cagr(g.serier.oms[0], g.serier.oms[3], 3), 0.213, 0.001);
  jamfor("GMAB resCAGR", cagr(g.serier.netto[0], g.serier.netto[3], 3), 0.0713, 0.001);
  jamfor("GMAB fcfMarginal", g.fcfTTM / g.revTTM, g.fcfM, 0.001);
  jamfor("GMAB fcfYield", g.fcfTTM / (g.mcapMdr * 1000), 0.0422, 0.0005);
  jamfor("GMAB EV-replik", g.mcapMdr + (g.skuldMdr - g.kassaMdr), g.evMdr, 0.02);
  jamfor("GMAB EV/EBIT-replik", (g.mcapMdr + (g.skuldMdr - g.kassaMdr)) / (g.ebitM * g.revTTM / 1000), g.evEbit, 0.02);
  jamfor("GMAB moat-medel", g.bruttoMargAr.reduce((a, b) => a + b, 0) / 4, 0.9691, 0.001);
  jamfor("GMAB moat-spread", Math.max(...g.bruttoMargAr) - Math.min(...g.bruttoMargAr), 0.064, 0.001);
  if (g.serier.ar.length !== g.serier.oms.length || g.serier.ar.length !== g.serier.netto.length || g.serier.ar.length !== g.serier.fcf.length)
    FEL.push("GMAB serielängder");
}
// HLUN
{
  const h = K.HLUN;
  const prognos = h.pe / h.peFwd - 1;                        // 0,5401
  jamfor("HLUN prognosTillväxt", prognos, 0.5401, 0.0005);
  jamfor("HLUN peg-spår", h.pe / (prognos * 100), 0.2, 0.01);
  jamfor("HLUN revCAGR", cagr(h.serier.oms[0], h.serier.oms[4], 4), 0.1087, 0.001);
  jamfor("HLUN resCAGR", cagr(h.serier.netto[0], h.serier.netto[4], 4), 0.2473, 0.001);
  jamfor("HLUN direktavkastning", h.dps / h.pris, h.direktAvk, 0.0005);
  jamfor("HLUN payout", h.dps / h.epsTTM, h.payout, 0.003);
  jamfor("HLUN fcfYield", h.fcfTTM / (h.mcapMdr * 1000), 0.1254, 0.001);
  jamfor("HLUN fcf-via-EV/FCF", h.evMdr / h.evFcf, h.fcfTTM / 1000, 0.02);
  jamfor("HLUN fcfMarginal", h.fcfTTM / h.revTTM, h.fcfM, 0.001);
  jamfor("HLUN EV-replik", h.mcapMdr + (h.skuldMdr - h.kassaMdr), h.evMdr, 0.02);
  jamfor("HLUN EV/EBIT-replik", h.evMdr / (h.ebitM * h.revTTM / 1000), h.evEbit, 0.02);
  jamfor("HLUN moat-medel", h.bruttoMargAr.reduce((a, b) => a + b, 0) / 5, 0.7757, 0.001);
  jamfor("HLUN moat-spread", Math.max(...h.bruttoMargAr) - Math.min(...h.bruttoMargAr), 0.0166, 0.001);
  jamfor("HLUN FY24-rev härledning", 24630 / 1.1193, 22005, 5);
  jamfor("HLUN FY24-vinst härledning", 3190 / 1.0156, 3141, 5);
  if (h.serier.ar.length !== h.serier.oms.length || h.serier.ar.length !== h.serier.netto.length)
    FEL.push("HLUN serielängder");
}
// AMBU
{
  const a = K.AMBU;
  const prognos = a.pe / a.peFwd - 1;                        // 0,4976
  jamfor("AMBU prognosTillväxt", prognos, 0.4976, 0.0005);
  jamfor("AMBU peg-spår", a.pe / (prognos * 100), 0.69, 0.01);
  jamfor("AMBU revCAGR", cagr(a.serier.oms[0], a.serier.oms[4], 4), 0.1075, 0.001);
  jamfor("AMBU resCAGR", cagr(a.serier.netto[0], a.serier.netto[4], 4), 0.253, 0.001);
  jamfor("AMBU direktavkastning", a.dps / a.pris, a.direktAvk, 0.0005);
  jamfor("AMBU payout", a.dps / a.epsTTM, a.payout, 0.003);
  jamfor("AMBU fcfYield", a.fcfTTM / (a.mcapMdr * 1000), 0.0431, 0.0005);
  jamfor("AMBU fcf-via-EV/FCF", a.evMdr / a.evFcf, a.fcfTTM / 1000, 0.02);
  jamfor("AMBU EV-replik", a.mcapMdr - (a.kassaMdr - a.skuldMdr), a.evMdr, 0.02);
  jamfor("AMBU EV/EBIT-replik", a.evMdr / (a.ebitM * a.revTTM / 1000), a.evEbit, 0.05);
  jamfor("AMBU moat-medel", a.bruttoMargAr.reduce((x, y) => x + y, 0) / 5, 0.5924, 0.001);
  jamfor("AMBU moat-spread", Math.max(...a.bruttoMargAr) - Math.min(...a.bruttoMargAr), 0.0555, 0.001);
  for (let i = 0; i < 5; i++) {
    const deriv = a.fcfMargAr[i] * a.serier.oms[i];
    if (Math.abs(deriv - a.serier.fcf[i]) > 0.6) FEL.push(`AMBU fcf-serie FY${a.serier.ar[i]}: ${deriv} mot ${a.serier.fcf[i]}`);
  }
  if (a.serier.ar.length !== a.serier.oms.length || a.serier.ar.length !== a.serier.netto.length || a.serier.ar.length !== a.serier.fcf.length)
    FEL.push("AMBU serielängder");
}

if (FEL.length) {
  console.error("ABORT — aritmetikgrind RÖD:");
  for (const f of FEL) console.error("  ✗ " + f);
  process.exit(1);
}
console.log("ARITMETIK GRÖN — alla kontroller inom tolerans");

// ── rader (konventionsenliga; noteringar dokumenterar konventioner+fynd) ──────
const rader = [];
if (!har("GMAB")) rader.push({
  ticker: "GMAB", namn: "Genmab A/S", bransch: "halso", land: "Danmark", valuta: "USD",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-18", url: "https://stockanalysis.com/stocks/gmab/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/)",
    paranoid: "S&P Global Market Intelligence + Fiscal.ai-underlag; close 2026-09-17 16:00 EDT 34,54 $/20,59 mdr; P/E 26,13 forward 20,88 ⇒ prognosTillväxt +25,1 % TTE (källans 3-årsprognos +20,1 % intäkt/+14,6 % EPS — ovanligt väl kalibrerat gap, RY-klassen); källans PEG n/a ⇒ spårets 1,04 (P/E ÷ prognosTillväxt i procent, EVO-konventionen); P/B 3,46 EV/EBIT 18,27 EV/EBITDA 17,70 EV/FCF 28,05; brutto 93,03 % EBITDA 33,33 % EBIT 32,29 % netto 19,08 % FCF 21,04 %; ROE 14,00 % ROA 8,79 % ROIC 12,07 % ROCE 11,73 % WACC 7,35 %; skuld 5,27 mdr kassa 1,51 mdr ⇒ NETTOSKULD 3,76 mdr (EV 24,37 = 20,59+3,76 EXAKT) — royaltybolagets kapitalbalans vänts på ett år av FY2025-förvärvet (cash acquisitions −7 215 M$, källan); räntetäckning 4,96; TTM oms 4 131 M (+22,3 %) netto 788 M (−37,9 %) FCF 869 M (OCF 891) ⇒ fcfYield 4,22 %; ingen utdelning, återköp 448 M$ FY2025 (buyback-yield 1,73 %), insiders 1,21 %; beta 0,70; 52-v +22,29 %; eff skatt 13,02 %; analytiker Strong Buy 38,86 (12 st); nästa rapport 2026-11-05; EPS-panelglidning i källan dokumenterad (översikt/statistics '1,27' mot financials 12,65 TTM; aktier 59,70 M ⇒ 788/59,7 = 13,2 $/aktie — P/E-talet internt konsekvent 20,59/0,788 = 26,13); Industry Biotechnology, Sector Healthcare — branschfältet halso källkonsekvent" }],
  hamtat: "2026-09-18",
  pris: 34.54, marknadsKapitalMdr: 20.59,
  tillvaxt: { omsattningCAGR5ar: 0.213, resultatCAGR5ar: 0.0713, omsattningTillvaxtTTM: 0.2225, prognosTillvaxt: 0.2514 },
  lonksamhet: { roe: 0.14, roic: 0.1207, bruttoMarginal: 0.9303, ebitMarginal: 0.3229, nettoMarginal: 0.1908, fcfMarginal: 0.2104 },
  stabilitet: { skuldEgenkapital: 0.89, rantaTackning: 4.96, fcfPositivaSenaste5: null, kassaManaderBurnRate: null, nyemissionerSenaste5ar: null },
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: 1.21 },
  moat: { bruttoMarginalMedel5ar: 0.9691, bruttoMarginalSpread5ar: 0.064, roeMedel5ar: null },
  vardering: { pe: 26.13, pb: 3.46, evEbit: 18.27, peg: 1.04, fcfYield: 0.0422, egenKapitalMultipl: 3.46 },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: { ar: ["2022", "2023", "2024", "2025"], omsattning: [2084000000, 2390000000, 3121000000, 3720000000], resultat: [783330000, 631000000, 1133000000, 963000000], egetKapital: [], fcf: [516520000, 1018000000, 1099000000, 1149000000] },
  notering: "DANSK BIOTEK I ROYALITY-KLASSEN: Darzalex-royaltyportföljen (J&J-partnerskapet) ger bruttomarginal 93,0 % — men serien visar GLIDNINGEN 100,0 → 98,6 → 95,4 → 93,6 % FY2022–2025: när egna utvecklingsprogram och kommersiella kostnader växer in mattas royaltypuren (moat-spread 6,4 pp — vallgraven är licensavtalet, inte produkten); FY2025-FÖRVÄRVET vänder kapitalbalansen: kontantförvärv −7 215 M$ (källans cash-acquisitions) tar bolaget från nettokassa till NETTOSKULD 3,76 mdr (kassa 1,51/skuld 5,27; EV 24,37 = 20,59+3,76 exakt) — royaltybolagets balansräkning omskriven på ett år; TTM-kontrasten intäkt +22,3 % mot vinst −37,9 % = förvärvskostnadernas och R&D-satsningens år (netto 1 133→788 M$ glidande), medan FCF håller 869 M$ (fcfYield 4,22 %); ROIC 12,07 % mot WACC 7,35 % = +4,7 pp; ingen utdelning men återköpstrappa 76→143→96→576→448 M$ FY2021–2025 (FY2024-toppen); EPS-panelglidning i källan dokumenterad i paranoid (statistics 1,27 mot financials 12,65 — aktier 59,70 M ger 13,2 $; P/E-talet internt konsekvent); analytiker Strong Buy mål 38,86 $ (12 st); nästa rapport 2026-11-05. NOTIS DATAÄGAREN: GMAB-noteras i USD (US-primärnotering, dansk hemmamarknad i land-fältet enligt kontraktets registerdata-princip).",
});
if (!har("HLUN.B")) rader.push({
  ticker: "HLUN.B", namn: "H. Lundbeck A/S", bransch: "halso", land: "Danmark", valuta: "DKK",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-18", url: "https://stockanalysis.com/quote/cph/HLUN.B/ (+ /statistics/ + /dividend/ + A-aktiens översikt)",
    paranoid: "S&P Global Market Intelligence-underlag; B-aktien (mest omsatt klass) intraday 2026-09-18 09:22 CET 42,92 DKK/mcap 41,63 mdr (A-aktien 40,00, P/E 10,58/fwd 6,75 — klasskillnaden dokumenterad); P/E 10,75 forward 6,98 ⇒ prognosTillväxt +54,0 % TTE mot källans 3-årsprognos +1,1 % intäkt/+2,7 % EPS = NORMALISERINGSGAP-listans nya topp (PSA/DNO-klassen — PEG 0,20 är gap-mått); källans PEG 1,62 som not; P/B 1,55 (BVPS 27,15) EV/EBIT 7,53 EV/EBITDA 5,84 EV/FCF 9,36; brutto 82,06 % EBITDA 31,86 % EBIT 24,99 % netto 15,16 % FCF 20,11 %; ROE 15,41 % ROIC 13,67 % WACC 4,64 %; skuld 9,42 mdr kassa 2,20 mdr ⇒ nettoskuld 7,22 (EV 48,85 = 41,63+7,22 EXAKT); räntetäckning 405,5×; aktier 991,23 M EPS TTM 3,97; TTM oms 25 960 M (+10,4 %) netto 3 940 M (+14,7 %) ⇒ FCF 5 220 M (20,11 %) fcfYield 12,54 %; direktavkastning 2,68 % (DPS 1,15, ex 2026-03-19), payout 29,0 %, utdelningstillväxt +21,05 %, återköp −0,04 %, insiders 0,15 %; beta 0,26; 52-v −2,01 %; eff skatt 27,65 %; analytiker Buy 48,58 (13 st); CACHE-FYNDET (VIT-B-klassen, dokumenterat): web_reader-kanalen servade åldriga HLUN-paneler (statistics dec-2025, financials TTM sep-2024) — färska WebFetch-värden gäller, fasta historiska årsur ditmoat-serien; FY2024 härlett ur översiktens tillväxtprocenter (intäkt +11,93 % ⇒ 22 010; vinst +1,56 % ⇒ 3 141); Industry Drug Manufacturers – Specialty & Generic, Sector Healthcare — branschfältet halso källkonsekvent" }],
  hamtat: "2026-09-18",
  pris: 42.92, marknadsKapitalMdr: 41.63,
  tillvaxt: { omsattningCAGR5ar: 0.1087, resultatCAGR5ar: 0.2473, omsattningTillvaxtTTM: 0.104, prognosTillvaxt: 0.5401 },
  lonksamhet: { roe: 0.1541, roic: 0.1367, bruttoMarginal: 0.8206, ebitMarginal: 0.2499, nettoMarginal: 0.1516, fcfMarginal: 0.2011 },
  stabilitet: { skuldEgenkapital: 0.35, rantaTackning: 405.5, fcfPositivaSenaste5: null, kassaManaderBurnRate: null, nyemissionerSenaste5ar: null },
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: 0.15 },
  moat: { bruttoMarginalMedel5ar: 0.7757, bruttoMarginalSpread5ar: 0.0166, roeMedel5ar: null },
  vardering: { pe: 10.75, pb: 1.55, evEbit: 7.53, peg: 0.2, fcfYield: 0.1254, egenKapitalMultipl: 1.55 },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: { ar: ["2021", "2022", "2023", "2024", "2025"], omsattning: [16299000000, 18246000000, 19912000000, 22005000000, 24630000000], resultat: [1318000000, 1916000000, 2290000000, 3141000000, 3190000000], egetKapital: [], fcf: [] },
  notering: "CNS-FARMAKONENS KVARTILEXTREM: psykiatri/neurologi-portföljen (Rexulti/Vraylar på arvet från Cipralex-epoken) = Danmark/hälsa-cellens BILLIGA ände på P/E 10,75 (forward 6,98) — med Novo Nordisk 11,80 och Coloplast 38,65 samt nya trion ger cellen P25–P75 11,8–34,1 (kontraktets percentilkonvention): landsidan /dataset/halso/danmark blir ett av kvartilpedagogikens renaste exempel (diagnosportfölj mot tillväxtbiotek mot medtech i EN fålla); UTDDELNINGSTRAPPAN 0,58 → 0,70 → 0,95 → 1,15 DKK (2023→2026, senaste höjningen +21,05 %) på payout 29,0 % av EPS 3,97 — kapitalåtergången växer medan 3-årsprognosens intäkt står stilla (+1,11 %/år: patentmogen portfölj); TTE-GAPET +54,0 % mot 3-års-EPS-prognos +2,7 % = normaliseringsgap-listans nya topp — engångsliknande konsensussprång, PEG 0,20 som gap-mått (PSA/DNO-konventionen); RÄNTETÄCKNINGEN 405,5× vid skuld 9,42 mdr mot kassa 2,20 (nettoskuld 7,22 driver EV 48,85): obligationsläroboken — billigt lånat kapital mot psykiatriska kassor; bruttomarginal 82,06 % TTM (moat-serien FY2019–2023 ~77,5 % ur cachad vintage — cache-notis i paranoid, VIT-B-klassen); FCF 5 220 M DKK TTM = fcfYield 12,54 % (elva högsta av 160 mätta i universumet); ROIC 13,67 % mot WACC 4,64 % = +9,0 pp; B-aktien mest omsatt (42,92) med A-aktien 40,00 som kontrollklass; beta 0,26 i universumets lugnare kvartil; analys Buy 48,58 DKK (13 st); serier.fcf tom medvetet (färsk FCF-flik oåtkomlig via källkanalen vid avläsningen — TFM-värdet dokumenterat i stället; cache-vintagen OPÅLITLIG för ändå inte FY2024–2025); FY2024-talen härledda ur källans tillväxtprocenter (dokumenterat); nästa rapportdag ej listad hos källan vid avläsningen (senaste 2026-08-19, H1).",
});
if (!har("AMBU.B")) rader.push({
  ticker: "AMBU.B", namn: "Ambu A/S", bransch: "halso", land: "Danmark", valuta: "DKK",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-18", url: "https://stockanalysis.com/quote/cph/AMBU.B/ (+ /statistics/ + /financials/)",
    paranoid: "S&P Global Market Intelligence + Fiscal.ai-underlag; intraday 2026-09-18 09:13 CET 65,65 DKK/17,10 mdr (data-uppdaterad 2026-09-17, financials senast kontrollerad 2026-09-16); P/E 34,12 forward 22,79 ⇒ prognosTillväxt +49,8 % TTE; PEG spår 0,69 mot källans 0,75 (konventionen: P/E ÷ prognosTillväxt i procent); P/B 2,77 (P/TBV 6,09) EV/EBIT 24,07 EV/EBITDA 18,09 EV/FCF 23,03; brutto 60,11 % EBITDA 13,93 % EBIT 11,30 % netto 8,18 % FCF 11,82 %; ROE 8,45 % ROA 5,81 % ROIC 9,04 % ROCE 10,57 % WACC 11,69 % (ROIC UNDER WACC = −2,7 pp, ARM-klassen); skuld 579 M kassa 705 M ⇒ NETTOKASSA 126 M (EV 16,97 under mcap 17,10); räntetäckning 15,67; aktier 261,05 M (löpande klass 226,73) EPS TTM 1,92; TTM oms 6 237 M (+4,7 %) netto 510 M (+42,1 %) ⇒ FCF 737 M, fcfYield 4,31 %; direktavkastning 0,62 % (DPS 0,41, ex 2025-12-04) payout 21,57 % återköp 0,67 % insiders 20,45 % (grundarfamiljen Obels krets — Det Obelske Familiefond-fållan); beta 1,39; 52-v −32,41 % (spann 56,25–111,80); eff skatt 23,08 %; analytiker Hold 81,77 (8 st); FY SLUT SEPTEMBER (okt–sep, slutårsetikett — tredje årskonventionen i universumet efter Samsung mar/TCS mar); FCF-serien härledd ur källans FCF-marginal × intäkt per år (derivationsbasen i källan, inte en separat flik); Industry Medical Devices, Sector Healthcare — branschfältet halso källkonsekvent" }],
  hamtat: "2026-09-18",
  pris: 65.65, marknadsKapitalMdr: 17.1,
  tillvaxt: { omsattningCAGR5ar: 0.1075, resultatCAGR5ar: 0.253, omsattningTillvaxtTTM: 0.0468, prognosTillvaxt: 0.4976 },
  lonksamhet: { roe: 0.0845, roic: 0.0904, bruttoMarginal: 0.6011, ebitMarginal: 0.113, nettoMarginal: 0.0818, fcfMarginal: 0.1182 },
  stabilitet: { skuldEgenkapital: 0.09, rantaTackning: 15.67, fcfPositivaSenaste5: null, kassaManaderBurnRate: null, nyemissionerSenaste5ar: null },
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: 20.45 },
  moat: { bruttoMarginalMedel5ar: 0.5924, bruttoMarginalSpread5ar: 0.0555, roeMedel5ar: null },
  vardering: { pe: 34.12, pb: 2.77, evEbit: 24.07, peg: 0.69, fcfYield: 0.0431, egenKapitalMultipl: 2.77 },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: { ar: ["2021", "2022", "2023", "2024", "2025"], omsattning: [4013000000, 4444000000, 4775000000, 5391000000, 6037000000], resultat: [247000000, 93000000, 168000000, 235000000, 609000000], egetKapital: [], fcf: [152100000, -43100000, 447000000, 725100000, 673700000] },
  notering: "ENGÅNGS-ENDOSKOPI GRUNDAREN — VÄNDNINGENS LÄROBOK: single-use-bronkoskopi/koloskopi och självtest; FY2022-botten netto 93 M DKK vid EBIT-marginal 2,74 % (efter COVID-testboomens fall) → FY2025 netto 609 M vid 12,99 % — VINSTTRAPPAN 247→93→168→235→609 M DKK (+25,3 %/år endpoint) med bruttomarginalens sågtand 56,8→60,2 % (spread 5,6 pp: devices-moat är produktcykler, inte licensavtal — Genmab-kontrasten i samma cell); P/E 34,12 mot forward 22,79 ⇒ prognosTillväxt +49,8 % (PEG spår 0,69, källans 0,75 som not); ROIC 9,04 % UNDER WACC 11,69 % = −2,7 pp (ARM-klassen: värdestoffet bor i tillväxtförväntningen — kontrast mot Lundbecks +9,0 pp i samma cell); 3-årsprognos EPS +17,6 %/år mot intäkt +9,3 % = marginalhävstången; NETTOKASSA 126 M DKK (kassa 705/skuld 579) ger EV 16,97 UNDER mcap 17,10 — cellens enda nettokassa-bolag; direktavkastning 0,62 % (DPS 0,41 DKK, payout 21,6 %) + återköp 0,67 %; insiders 20,45 % = grundarfamiljen Obels krets (Det Obelske Familiefond); 52-veckor −32,41 % (spann 56,25–111,80) med beta 1,39 = kursens egen vändningsberättelse; FY slut september (oktober–september, slutårsetikett — tredje årskonventionen); FCF-serien härledd ur källans FCF-marginal × intäkt (−43,1 → +673,7 M DKK FY2022–2025, vändningen FY2023 — derivationsbas dokumenterad); senaste rapport 2026-08-26 (Q3 FY25/26), nästa ej listad hos källan; analys Hold 81,77 DKK (8 st).",
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
const m = efter.filter((b) => b.land === "Danmark" && b.bransch === "halso" && typeof b.vardering?.pe === "number");
console.log(`DANMARK/HÄLSA: ${m.length} P/E-mätbara — ${m.map((b) => b.ticker + " " + b.vardering.pe).join(" · ")}`);
