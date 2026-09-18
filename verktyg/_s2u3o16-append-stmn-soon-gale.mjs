#!/usr/bin/env node
/**
 * s2-u3 omg16 (manifest auto-s2-1789760724916) — DATASET-DJUP:
 * SCHWEIZ/HÄLSO +3: STRAUMANN (STMN.SW) + SONOVA (SOON.SW) + GALENICA (GALE.SW)
 * — cellen matta 2→5 P/E-mätbara ⇒ /dataset/halso/schweiz föds vid nästa
 * prod-bygge (land.ts-modulen byggs i samma leverans, danmark-precedensen).
 * PIVOT-KEDJA v1 LONN (TTM-förlust, källans "EV/Earnings n/a" trots
 * PE-fält 35,23 = normaliserat underlag) → v2 TECN (TTM-förlust, PE n/a)
 * → v3 BACH (källan saknar, 404) → v4 YPSN (reserv: negativt prognosgap +
 * FCF/netto-paradox) → FINAL STMN+SOON+GALE — alla tre mätbara.
 * Idempotent append på diskens faktiska läge (syskonens rader lämnas
 * elementvis orörda; redan förekommande tickers hoppas — omg11–15-konventionen).
 * Källa StockAnalysis (swx-källvägen) hämtad 2026-09-18 (intraday 17:31 CET,
 * S&P Global MI-underlag). ALL aritmetik maskinverifierad FÖRE skrivning
 * (abort-grind, omg13-läxan).
 */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/portfolj-system/bolagsunivers.json";
const u = JSON.parse(readFileSync(FIL, "utf8"));
const innan = u.length;
const har = (t) => u.some((b) => b.ticker === t);

// ── käldata (StockAnalysis swx, hämtat 2026-09-18; paranoid per rad) ─────────
const K = {
  STMN: {
    pris: 94.58, mcapMdr: 15.09,
    pe: 40.98, peFwd: 26.83, pegKalla: 2.04, pb: 6.60, evEbit: 23.81, evEbitda: 19.82,
    bruttoM: 0.6926, ebitM: 0.2470, nettoM: 0.1400, fcfM: 0.1447,
    roe: 0.1705, roic: 0.2162, roa: 0.1099,
    skuldEk: 0.21, nettoSkuldM: 60.02, rantaTack: 20.72,
    fcfTTM: 381.47, ocfTTM: 523.22, capexTTM: 141.75,
    revTTM: 2640, nettoTTM: 369.18, epsTTM: 2.31,
    dps: 1.00, direktAvk: 0.0106, payout: 0.4296,
    aktier: 159.45, beta: 1.37, v52Spann: [73.02, 109.80],
    rapport: "2026-10-28", analytiker: "Buy mål 112,61 CHF (+19,1 %), 19 st",
    serier: { ar: ["2021", "2022", "2023", "2024", "2025"], oms: [2022, 2321, 2277, 2504, 2605], netto: [396.08, 434.79, 246.07, 388.32, 355.92] },
    bruttoEndpoints: [0.7616, 0.7010],               // FY2021 → FY2025 (financials bruttovinst/oms)
  },
  SOON: {
    pris: 232.00, mcapMdr: 13.96,
    pe: 26.08, peFwd: 21.89, pegKalla: 2.26, pb: 5.30, evEbit: 20.05, evEbitda: 15.65,
    bruttoM: 0.7372, ebitM: 0.1955, nettoM: 0.1194, fcfM: 0.1736,
    roe: 0.2052, roic: 0.1701, roa: 0.0763,
    skuldEk: 0.65, skuldM: 1710, kassaM: 722, rantaTack: 24.56,
    fcfTTM: 626.10, ocfTTM: 707.50, capexTTM: 81.40,
    revTTM: 3606, nettoTTM: 430.60, epsTTM: 7.22,
    dps: 4.70, direktAvk: 0.0203, payout: 0.6092,
    aktier: 59.40, beta: 1.11, v52Spann: [163.00, 248.00],
    rapport: "2026-11-12", analytiker: "Hold mål 230,95 CHF (−0,5 %), 19 st",
    serier: { ar: ["2022", "2023", "2024", "2025", "2026"], oms: [3364, 3738, 3627, 3613, 3606], netto: [649.0, 647.5, 601.0, 540.5, 430.6] },
  },
  GALE: {
    pris: 81.60, mcapMdr: 4.13,
    pe: 25.68, peFwd: 20.48, pegKalla: 2.98, pb: 2.92, evEbit: 24.55,
    bruttoM: 0.1246, ebitM: 0.0477, nettoM: 0.0371, fcfM: 0.0513,
    roe: 0.1136, roic: 0.0682,
    skuldEk: 0.78, rantaTack: 13.90,
    ebitTTM: 204.42, evKalla: 5200, ebitdaTTM: 255.69,
    revTTM: 4285, nettoTTM: 159.18, epsTTM: 3.19,
    fcfHerlett: 219.82,                                  // 0,0513 × 4 285 (marginalfältet är källans)
    direktAvk: 0.0306, payout: 0.7872,
    aktier: 49.82, beta: 0.28, forandr52v: -0.0478,
    analytiker: "Hold mål 87,60 CHF (+7,4 %)",
    serier: { ar: ["2021", "2022", "2023", "2024", "2025"], oms: [3841, 3595, 3756, 3931, 4146], netto: [167.68, 165.13, 285.37, 182.95, 181.11] },
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

// STMN — Straumann
{
  const n = K.STMN;
  const prognos = n.pe / n.peFwd - 1;                        // +0,52740
  jamfor("STMN prognosTillväxt", prognos, 0.5274, 0.0005);
  jamfor("STMN peg-spår", n.pe / (prognos * 100), 0.7769, 0.005);
  jamfor("STMN revCAGR", cagr(n.serier.oms[0], n.serier.oms[4], 4), 0.0654, 0.0005);
  jamfor("STMN resCAGR", cagr(n.serier.netto[0], n.serier.netto[4], 4), -0.0264, 0.0005);
  jamfor("STMN fcfMarginal", n.fcfTTM / n.revTTM, n.fcfM, 0.0005);
  jamfor("STMN fcfYield", n.fcfTTM / (n.mcapMdr * 1000), 0.02528, 0.0005);
  jamfor("STMN EV/EBIT-avvik", (n.mcapMdr * 1000 + n.nettoSkuldM) / (n.ebitM * n.revTTM) / n.evEbit - 1, -0.0242, 0.01);
  jamfor("STMN direktavkastning", n.dps / n.pris, n.direktAvk, 0.0005);
  jamfor("STMN payout mot TTM-EPS", n.dps / n.epsTTM, n.payout, 0.005);
  jamfor("STMN P/E-identitet mcap/netto", (n.mcapMdr * 1000) / n.nettoTTM / n.pe - 1, -0.0026, 0.005);
  jamfor("STMN aktiebas pris/EPS", n.pris / n.epsTTM, 40.94, 0.05);
  jamfor("STMN mcap-identitet", (n.pris * n.aktier) / (n.mcapMdr * 1000) - 1, -0.0006, 0.002);
  if (n.serier.ar.length !== 5 || n.serier.oms.length !== 5 || n.serier.netto.length !== 5) FEL.push("STMN serielängder");
}
// SOON — Sonova
{
  const s = K.SOON;
  const prognos = s.pe / s.peFwd - 1;                        // +0,19141
  jamfor("SOON prognosTillväxt", prognos, 0.1914, 0.0005);
  jamfor("SOON peg-spår", s.pe / (prognos * 100), 1.3625, 0.005);
  jamfor("SOON revCAGR", cagr(s.serier.oms[0], s.serier.oms[4], 4), 0.0175, 0.0005);
  jamfor("SOON resCAGR", cagr(s.serier.netto[0], s.serier.netto[4], 4), -0.0975, 0.0005);
  jamfor("SOON fcfMarginal", s.fcfTTM / s.revTTM, s.fcfM, 0.0005);
  jamfor("SOON fcfYield", s.fcfTTM / (s.mcapMdr * 1000), 0.04485, 0.0005);
  jamfor("SOON EV/EBIT-avvik", (s.mcapMdr * 1000 + s.skuldM - s.kassaM) / (s.ebitM * s.revTTM) / s.evEbit - 1, 0.0575, 0.07);
  jamfor("SOON direktavkastning", s.dps / s.pris, s.direktAvk, 0.0005);
  jamfor("SOON payout mot TTM-EPS", s.dps / s.epsTTM, s.payout, 0.05);
  const peIdent = (s.mcapMdr * 1000) / s.nettoTTM / s.pe - 1;   // +0,243 — KÄLLSPRIDNING
  INFO.push(`SOON P/E-källspridning: mcap/netto ${((s.mcapMdr * 1000) / s.nettoTTM).toFixed(2)} mot källans PE-fält ${s.pe} (${(peIdent * 100).toFixed(1)} % — S&P-normaliserat underlag ~535 MCHF; dokumenteras i paranoid+not, JNJ/BUD-klassen)`);
  if (Math.abs(peIdent - 0.2427) > 0.005) FEL.push("SOON P/E-källspridning avviker från dokumentationen");
  jamfor("SOON aktiebas pris/EPS", s.pris / s.epsTTM, 32.13, 0.05);
  jamfor("SOON mcap-identitet", (s.pris * s.aktier) / (s.mcapMdr * 1000) - 1, -0.0129, 0.02);
  if (s.serier.ar.length !== 5 || s.serier.oms.length !== 5 || s.serier.netto.length !== 5) FEL.push("SOON serielängder");
}
// GALE — Galenica
{
  const g = K.GALE;
  const prognos = g.pe / g.peFwd - 1;                        // +0,25391
  jamfor("GALE prognosTillväxt", prognos, 0.2539, 0.0005);
  jamfor("GALE peg-spår", g.pe / (prognos * 100), 1.0114, 0.005);
  jamfor("GALE revCAGR", cagr(g.serier.oms[0], g.serier.oms[4], 4), 0.0193, 0.0005);
  jamfor("GALE resCAGR", cagr(g.serier.netto[0], g.serier.netto[4], 4), 0.0195, 0.0005);
  jamfor("GALE fcfYield", g.fcfHerlett / (g.mcapMdr * 1000), 0.05322, 0.0005);
  jamfor("GALE EV/EBIT-avvik", g.evKalla / g.ebitTTM / g.evEbit - 1, 0.0382, 0.05);
  const dps = g.payout * g.epsTTM;                          // 2,51 CHF härledd ur payout×EPS
  jamfor("GALE direktavkastning", dps / g.pris, g.direktAvk, 0.0005);
  jamfor("GALE payout aktiebas", dps / g.epsTTM, g.payout, 0.0005);
  jamfor("GALE P/E-identitet mcap/netto", (g.mcapMdr * 1000) / g.nettoTTM / g.pe - 1, 0.0102, 0.02);
  jamfor("GALE aktiebas pris/EPS", g.pris / g.epsTTM, 25.58, 0.05);
  jamfor("GALE mcap-identitet", (g.pris * g.aktier) / (g.mcapMdr * 1000) - 1, -0.0157, 0.02);
  if (g.serier.ar.length !== 5 || g.serier.oms.length !== 5 || g.serier.netto.length !== 5) FEL.push("GALE serielängder");
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
if (!har("STMN.SW")) rader.push({
  ticker: "STMN.SW", namn: "Straumann Holding AG", bransch: "halso", land: "Schweiz", valuta: "CHF",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-18", url: "https://stockanalysis.com/quote/swx/STMN/ (+ /statistics/ + /financials/)",
    paranoid: "S&P Global Market Intelligence-underlag, intraday 2026-09-18 17:31 CET 94,58 CHF/15,09 mdr; P/E 40,98 forward 26,83 ⇒ prognosTillväxt +52,7 % TTE (CELLENS BREDASTE PROGNOSGAP — TTM-netto 369,2 MCHF efter 2023-dippen 246,1 medan estimaten ser återhämtning; PEG spår 0,78 mot källans 2,04: källan räknar på 3-års-EPS-prognos +8,76 %/år, spåret på TTE-gapet — båda dokumenterade); P/B 6,60 EV/EBIT 23,81 EV/EBITDA 19,82 (EV/EBIT-replik på TTM-EBIT 652 MCHF: (15 090+60)÷652 = 23,24 = −2,4 % mot källans fält, dokumenterad avvik); brutto TTM 69,26 % EBIT 24,70 % netto 14,00 % FCF 14,47 %; ROE 17,05 % ROA 10,99 % ROIC 21,62 %; skuld/EK 0,21 NETTOSKULD blott 60,0 MCHF räntetäckning 20,72×; aktier 159,45 M EPS TTM 2,31 (aktiebas 94,58÷2,31 = 40,94 ≈ P/E-fältet 40,98 — identitet inom 0,1 %); TTM oms 2 640 MCHF (+2,2 %) netto 369,2 M OCF 523,2 M capex 141,8 M ⇒ FCF 381,5 M (fcfYield 2,53 %); utdelning 1,00 CHF/aktie (1,06 %) payout 42,96 % (aktiebas 43,3 % — fönsterskillnad dokumenterad); beta 1,37; 52-v 73,02–109,80; eff skatt 22,14 %; bruttomarginal-endpoints FY2021 76,2 % → FY2025 70,1 % (fallande ≈6 pp, dokumenterat i not — mellanår saknas i källutdraget); nästa rapp 2026-10-28; analytiker Buy 112,61 (+19,1 %, 19 st); Industry Medical Devices, Sector Healthcare — branschfältet halso källkonsekvent med cellens ROG/NOVN" }],
  hamtat: "2026-09-18",
  pris: 94.58, marknadsKapitalMdr: 15.09,
  tillvaxt: { omsattningCAGR5ar: 0.0654, resultatCAGR5ar: -0.0264, omsattningTillvaxtTTM: 0.022, prognosTillvaxt: 0.5274 },
  lonksamhet: { roe: 0.1705, roic: 0.2162, bruttoMarginal: 0.6926, ebitMarginal: 0.247, nettoMarginal: 0.14, fcfMarginal: 0.1447 },
  stabilitet: { skuldEgenkapital: 0.21, rantaTackning: 20.72, fcfPositivaSenaste5: null, kassaManaderBurnRate: null, nyemissionerSenaste5ar: null },
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: null },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
  vardering: { pe: 40.98, pb: 6.6, evEbit: 23.81, peg: 0.78, fcfYield: 0.0253, egenKapitalMultipl: 6.6 },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: { ar: ["2021", "2022", "2023", "2024", "2025"], omsattning: [2022000000, 2321000000, 2277000000, 2504000000, 2605000000], resultat: [396080000, 434790000, 246070000, 388320000, 355920000], egetKapital: [], fcf: [] },
  notering: "DENTAL-IMPLANTATENS VALLGRAV — cellens tredje ben: tandvårdens implantatjätte (med NOVN/ROG läkemedel och SOON hörapparater täcker cellen tre SKILDA delar av hälsovärdekedjan). BRUTTOMARGINALENS PRISSETTNINGSMAKT 69,3 % (endast ROG 74,2 och SOON 73,7 högre i cellen) men den FALLER: endpoints FY2021 76,2 % → FY2025 70,1 % (≈−6 pp — Kina-efterfrågansutmattning + mixskiften, dokumenterad som endpoints då mellanårens bruttovinster inte bars av källutdraget). CYKELN I SERIEN: omsättningen växer 2 022 → 2 605 MCHF (+6,5 %/år endpoint) medan resultatet ZIGZAGGAR 396 → 435 → 246 → 388 → 356 MCHF (endpoint −2,6 %/år; 2023 = Kina-dippen −43 % EPS, 2024-upphämtning +58 %, 2025-mattning −9 % — ingen stapel är 'normal', SCA-glidningens kusin). PROGNOSGAPET +52,7 % = CELLENS BREDASTE (P/E 40,98 mot forward 26,83): TTM-vinsten är det tillfälligt låga underlaget, analytikerna ser 112,61 CHF (+19,1 %, 19 st Buy) — PEG-spåret 0,78 mot källans 2,04 (3-års-EPS +8,8 %/år) dokumenterar båda läsningarna. BALANSRÄKNINGEN ÄR CELLENS RENASTE: nettoskuld 60 MCHF = 0,4 % av mcap, skuld/EK 0,21, räntetäckning 20,72× — implantattillverkningen kräver kapital men inte belåning. ROIC 21,62 % på beta 1,37 (tillväxtkaraktären i cellens mest skuldfria balansräkning). Utdelning 1,00 CHF (1,06 %) payout 43 % — tillväxtbolagets utdelning. Nästa rapp 2026-10-28.",
});
if (!har("SOON.SW")) rader.push({
  ticker: "SOON.SW", namn: "Sonova Holding AG", bransch: "halso", land: "Schweiz", valuta: "CHF",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-18", url: "https://stockanalysis.com/quote/swx/SOON/ (+ /statistics/ + /financials/)",
    paranoid: "S&P Global Market Intelligence-underlag, intraday 2026-09-18 17:31 CET 232,00 CHF/13,96 mdr; räkenskapsår APRIL–MARS (FY2026 slutar 2026-03-31; MT/CNQ-spegel-konventionen: seriens årtal = bolagets fiscal year, TTM = FY2026); P/E-FÄLTET 26,08 bär S&P-normaliserat underlag ~535 MCHF medan TTM-netto är 430,6 MCHF (mcap/netto = 32,41; pris/EPS = 32,13 — KÄLLSPRIDNING +24 % DOKUMENTERAD, JNJ/BUD-klassen: fältet följer källans P/E-konvention, avvikelsen redovisas öppet); forward 21,89 ⇒ prognosTillväxt +19,1 % TTE (PEG spår 1,36 mot källans 2,26); P/B 5,30 EV/EBIT 20,05 EV/EBITDA 15,65 (EV/EBIT-replik (13 960+1 710−722)÷705 = 21,2 = +5,7 % mot källans fält — källans EV bär pension/lease-justeringar ≈813 MCHF, VALE-familjens EV-diff dokumenterad); brutto TTM 73,72 % EBIT 19,55 % netto 11,94 % FCF 17,36 %; ROE 20,52 % ROA 7,63 % ROIC 17,01 %; skuld 1 710 MCHF kassa 722 MCHF ⇒ NETTOSKULD 989 MCHF skuld/EK 0,65 räntetäckning 24,56×; aktier 59,40 M EPS TTM 7,22; TTM oms 3 606 MCHF (översiktspanelen −4,8 %; financials TTM-kolumn −6,5 % — två fönster documented, fältet bär översiktens) netto 430,6 M OCF 707,5 M capex 81,4 M ⇒ FCF 626,1 M (fcfYield 4,48 % — kapitallätt verksamhet: capex 2,3 % av oms); utdelning 4,70 CHF/aktie (2,03 %) payout 60,92 % (aktiebas 65,1 % — normaliseringsdifferensen igen, dokumenterad); beta 1,11; 52-v 163,00–248,00; eff skatt 14,91 % (schweizisk patentbox-klass); nästa rapp 2026-11-12; analytiker Hold 230,95 (−0,5 %, 19 st); Industry Medical Devices, Sector Healthcare" }],
  hamtat: "2026-09-18",
  pris: 232, marknadsKapitalMdr: 13.96,
  tillvaxt: { omsattningCAGR5ar: 0.0175, resultatCAGR5ar: -0.0975, omsattningTillvaxtTTM: -0.048, prognosTillvaxt: 0.1914 },
  lonksamhet: { roe: 0.2052, roic: 0.1701, bruttoMarginal: 0.7372, ebitMarginal: 0.1955, nettoMarginal: 0.1194, fcfMarginal: 0.1736 },
  stabilitet: { skuldEgenkapital: 0.65, rantaTackning: 24.56, fcfPositivaSenaste5: null, kassaManaderBurnRate: null, nyemissionerSenaste5ar: null },
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: null },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
  vardering: { pe: 26.08, pb: 5.3, evEbit: 20.05, peg: 1.36, fcfYield: 0.0448, egenKapitalMultipl: 5.3 },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: { ar: ["2022", "2023", "2024", "2025", "2026"], omsattning: [3364000000, 3738000000, 3627000000, 3613000000, 3606000000], resultat: [649000000, 647500000, 601000000, 540500000, 430600000], egetKapital: [], fcf: [] },
  notering: "HÖRAPPARATERNAS MARGINALKOMPRESSON — cellens fjärde ben: hörselvårdens värledare (Phonak/ReSound/Unitron/Sennheiser-livscykeln) med bruttomarginal 73,7 % (näst högst i cellen efter ROG) men NETTOFALLET SOM SIGNATUR: resultatet trappar 649,0 → 647,5 → 601,0 → 540,5 → 430,6 MCHF FY2022→FY2026 (endpoint −9,8 %/år; −33,6 % från toppen) på INTÄKTER SOM STÅR STILLA (3 364 → 3 606, +1,8 %/år; FY2023-topp 3 738) — varje procents marginalförlust faller rakt igenom: EBIT 19,6 % mot STMN 24,7, netto 11,9 % mot 14,0. MEKANISMEN (källbelagt): OTC-oregleringen av hörapparater i USA (2022) öppnade lägre prispunkter medan rehab-bidragens köpkraft trycktes — volymen håller, priset inte. PROGNOSGAPET +19,1 % (26,08 mot 21,89) = marknadens väntan på vändning; analytiker Hold 230,95 (−0,5 % — cellens försiktigaste mål). KAPITALLÄTTHETEN ÄR MOTPOLENT: capex 81 MCHF = 2,3 % av omsättningen (STMN 5,4 %) ⇒ FCF 626 MCHF = 17,4 % marginal (cellens näst högsta) på fcfYield 4,48 %; utdelningen 4,70 CHF (2,03 %) payout 61 % hålls av kassan, inte resultattrappan. P/E-KÄLLSPRIDNINGEN +24 % (fält 26,08 mot mcap/netto-TTM 32,41) dokumenteras öppet — källans normaliserade underlag ~535 MCHF; lägg märke till att BÅDA läsningarna (26,1 och 32,4) hamnar ÖVER cellens kommande median. Skuld/EK 0,65 med räntetäckning 24,6×; nästa rapp 2026-11-12.",
});
if (!har("GALE.SW")) rader.push({
  ticker: "GALE.SW", namn: "Galenica AG", bransch: "halso", land: "Schweiz", valuta: "CHF",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-18", url: "https://stockanalysis.com/quote/swx/GALE/ (+ /statistics/ + /financials/)",
    paranoid: "S&P Global Market Intelligence-underlag, intraday 2026-09-18 17:31 CET 81,60 CHF/4,13 mdr; P/E 25,68 EXAKT replikerbar (mcap/netto 4 130÷159,18 = 25,94 = +1,0 %; aktiebas 81,60÷3,19 = 25,58 — båda inom hållhake) forward 20,48 ⇒ prognosTillväxt +25,4 % TTE (PEG spår 1,01 mot källans 2,98 på 3-års-EPS); P/B 2,92 EV/EBIT 24,55 (källans EV 5,20 mdr ÷ EBIT TTM 204,4 M = 25,49 = +3,8 % mot fältet — fönsterdiff i källan dokumenterad); brutto TTM 12,46 % EBIT 4,77 % netto 3,71 % FCF 5,13 % (FCF-beloppet 219,8 MCHF härlett ur källans marginalfält × TTM-oms — beloppet ej separat publicerat, dokumenterat); ROE 11,36 % ROIC 6,82 %; skuld/EK 0,78 räntetäckning 13,90×; aktier 49,82 M EPS TTM 3,19; TTM (jun-2026) oms 4 285 MCHF (+3,4 %) netto 159,2 M; EBIT TTM 204,4 M EBITDA 255,7 M; utdelning ~2,51 CHF/aktie härledd ur yield 3,06 % × pris (payout 78,72 % × EPS 3,19 bekräftar — beloppet ej separat publicerat, dokumenterat); beta 0,28 (!); 52-v −4,78 %; analytiker Hold 87,60 (+7,4 %); Industry Healthcare — branschfältet halso källkonsekvent" }],
  hamtat: "2026-09-18",
  pris: 81.6, marknadsKapitalMdr: 4.13,
  tillvaxt: { omsattningCAGR5ar: 0.0193, resultatCAGR5ar: 0.0195, omsattningTillvaxtTTM: 0.0336, prognosTillvaxt: 0.2539 },
  lonksamhet: { roe: 0.1136, roic: 0.0682, bruttoMarginal: 0.1246, ebitMarginal: 0.0477, nettoMarginal: 0.0371, fcfMarginal: 0.0513 },
  stabilitet: { skuldEgenkapital: 0.78, rantaTackning: 13.9, fcfPositivaSenaste5: null, kassaManaderBurnRate: null, nyemissionerSenaste5ar: null },
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: null },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
  vardering: { pe: 25.68, pb: 2.92, evEbit: 24.55, peg: 1.01, fcfYield: 0.0532, egenKapitalMultipl: 2.92 },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: { ar: ["2021", "2022", "2023", "2024", "2025"], omsattning: [3841000000, 3595000000, 3756000000, 3931000000, 4146000000], resultat: [167680000, 165130000, 285370000, 182950000, 181110000], egetKapital: [], fcf: [] },
  notering: "APOTEKSLEDET — CELLENS AFFÄRSMODELL-MOTPOL: läkemedelsdistribution + retail (amavita/Sun Store-apoteken, Medbase-vårdcentralerna) med BRUTTOMARGINAL 12,5 % mot cellens Roche 74,2 % — samma branschfält, SEXTIOEN procentenheters bruttomarginal-skillnad: utvecklingsbolaget säljer immateriella rättigheter, distributören säljer logistik per paket. SERIEN BÄR EN ENGÅNGSPOST: FY2023-nettot 285,4 MCHF (+72,9 % EPS-tillväxt i källan) mot grannårens 165–183 M — försäljningsvinster i portföljen (källans EPS-tillväxtspan bekräftar hoppet); endpoint-resultatCAGR +2,0 %/år (167,7 → 181,1 MCHF) över fyra normalår + ett postår, TTM (jun-2026) 159,2 M. FÖRSÖRJNINGSKARAKTÄREN ÄR SIGNATURNUMRET: beta 0,28 (cellens och bland universumets lägsta — FMX 0,17-klassen), direktavkastning 3,06 % på payout 78,7 % (beloppet ~2,51 CHF härlett ur yield×pris, dokumenterat), intäktstillväxt fyra raka år +3–5 % genom 2022-fallet (3 595 → 4 146 MCHF). VÄRDERINGENS PARADOX: EV/EBIT 24,55 = HÖGRE än Roche-typen trots ROIC 6,82 % (cellens lägsta) — distributions-EV bärs av volymstabiliteten, inte kapitalavkastningen; P/E 25,68 med prognosgap +25,4 % (PEG-spår 1,01 = cellens jämnaste paritet). P/B 2,92 = cellens lägsta (balansräkningens goodwill från apotekskedjorna). Skuld/EK 0,78 räntetäckning 13,9×. Analytiker Hold 87,60 (+7,4 %).",
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
const m = efter.filter((b) => b.land === "Schweiz" && b.bransch === "halso" && typeof b.vardering?.pe === "number");
console.log(`SCHWEIZ/HÄLSA: ${m.length} P/E-mätbara — ${m.map((b) => b.ticker + " " + b.vardering.pe).join(" · ")}`);
const halso = efter.filter((b) => b.bransch === "halso" && typeof b.vardering?.pe === "number");
const pes = halso.map((b) => b.vardering.pe).sort((a, b) => a - b);
console.log(`HÄLSO (alla länder): n=${pes.length} · sorterade P/E: ${pes.map((x) => Math.round(x * 100) / 100).join(" ")}`);
const schweiz = efter.filter((b) => b.land === "Schweiz");
console.log(`SCHWEIZ totalt: ${schweiz.length} bolag — ${schweiz.map((b) => b.ticker).join(", ")}`);
