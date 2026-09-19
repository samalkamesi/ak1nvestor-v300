#!/usr/bin/env node
/**
 * s2-u3 omg18 (manifest auto-s2-1789806329851) — DATASET-DJUP:
 * AUSTRALIEN/MATERIAL +3: FMG.AX (Fortescue) + NST.AX (Northern Star) +
 * S32.AX (South32) — cellen matta 2→5 P/E-mätbara ⇒ /dataset/material/australien
 * föds vid nästa prod-bygge (land.ts-australienmodulen byggs i samma leverans,
 * tyskland-precedensen omg17). Omg17-u3:s FIFO-förslag infriat.
 * JÄRNMALMS-TRION FÖDS (BHP+RIO+FMG) + guldklustret (NST mot NEM/FCX) +
 * avknoppningsarvet (S32 = BHP 2015). Tre motstående cykelriktningar i EN cell
 * = kvartilpedagogik (malm ned / guld upp / vändning).
 * Idempotent append på diskens faktiska läge (omg11–17-konventionen).
 * Källa StockAnalysis ASX-primär (asx-källvägen, Samsung-KRX/TCS-NSE-
 * precedensen) hämtad 2026-09-19 (S&P Global MI + Fiscal.ai-underlag, close
 * 2026-09-18 AEST). ALL aritmetik maskinverifierad FÖRE skrivning
 * (abort-grind, omg13-läxan).
 */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/portfolj-system/bolagsunivers.json";
const u = JSON.parse(readFileSync(FIL, "utf8"));
const innan = u.length;
const har = (t) => u.some((b) => b.ticker === t);

// ── käldata (StockAnalysis /quote/asx/, hämtat 2026-09-19; paranoid per rad) ─
const K = {
  FMG: {
    // AUD-kurs/panel; FY-serier i USD (koncernrapportvaluta USD, BHP-mönstret)
    pris: 16.73, mcapMdr: 51.45, // AUD
    pe: 12.43, peFwd: 14.06, pegKalla: null, pb: 1.76, evEbit: 6.69, evEbitda: 4.38,
    bruttoM: 0.4014, ebitM: 0.3215, nettoM: 0.1692, fcfM: 0.2221,
    roe: 0.1423, roic: 0.1704, roa: 0.1098, wacc: 0.0764,
    skuldM: 8570, kassaM: 7330, nettoSkuldM: 1240, skuldEk: 0.29, rantaTack: 19.76,
    ocfTTM: 9880, capexTTM: 4600, fcfTTM: 5280, // AUD
    revTTM: 24520, nettoTTM: 4150, epsTTM: 1.35, ebitTTM: 7880, evKalla: 52640, // AUD
    dps: 1.08, direktAvk: 0.0646, payoutKalla: 0.8812, payoutAktiebas: 0.800,
    aktier: 3080, beta: 0.76, v52Spann: [16.14, 23.38], v52Change: -0.1139,
    rapport: "2026-10-22", analytiker: "Hold mål 17,42 AUD (+4,1 %), 17 st",
    ekUSD: 20283, ekAudProxy: 29315, // balansräkning FY2026 USD; AUD via FX ~1,4451
    utdelningarUSD: [6699, 3922, 4140, 2851, 2529],
    serier: { ar: ["2022", "2023", "2024", "2025", "2026"], oms: [17390, 16871, 18220, 15541, 16966], netto: [6197, 4798, 5683, 3373, 2870], ek: [17337, 17989, 19552, 19984, 20283], fcf: [3843, 4531, 5085, 3211, 3655] }, // USD M
  },
  NST: {
    // AUD hela vägen (både kurs och FY-serier)
    pris: 22.21, mcapMdr: 31.62,
    pe: 19.20, peFwd: 16.97, pegKalla: 0.94, pb: 2.02, evEbit: 13.16, evEbitda: 7.55,
    bruttoM: 0.3777, ebitM: 0.3221, nettoM: 0.2183, fcfM: 0.0617,
    roe: 0.1088, roic: 0.1037, roa: 0.0732, wacc: 0.1145,
    skuldM: 1725, kassaM: 1018, nettoSkuldM: 706.6, skuldEk: 0.11, rantaTack: 27.74,
    ocfTTM: 3183, capexTTM: 2713, fcfTTM: 470.6,
    revTTM: 7623, nettoTTM: 1664, epsTTM: 1.16, ebitTTM: 2455, evKalla: 32320,
    dps: 0.55, direktAvk: 0.0248, payoutKalla: 0.4584, payoutAktiebas: 0.4741,
    aktier: 1420, beta: 1.39, v52Spann: [17.07, 31.96], v52Change: 0.0845,
    rapport: "2026-10-20", analytiker: "Hold mål 24,57 AUD (+10,6 %), 15 st",
    utdelningarAUD: [218.3, 255.3, 333.7, 558.9, 762.9],
    serier: { ar: ["2022", "2023", "2024", "2025", "2026"], oms: [3806, 4131, 4921, 6415, 7623], netto: [452.1, 585.2, 638.5, 1340, 1664], ek: [8247, 8484, 8791, 14917, 15682], fcf: [570.5, 292.3, 630.4, 668.2, 470.6] }, // AUD M
  },
  S32: {
    // AUD-kurs/panel; FY-serier i USD (koncernrapportvaluta USD — avknoppningsarvet)
    pris: 4.93, mcapMdr: 22.10, // AUD
    pe: 14.51, peFwd: 14.24, pegKalla: null, pb: 1.57, evEbit: 14.78, evEbitda: 10.36,
    bruttoM: 0.5222, ebitM: 0.1561, nettoM: 0.1830, fcfM: 0.0902,
    roe: 0.1140, roic: 0.0762, roa: 0.0411, wacc: 0.0773,
    skuldM: 2680, kassaM: 3080, nettokassaM: 409, skuldEk: 0.19, rantaTack: 8.43,
    ocfTTM: 2360, capexTTM: 1610, fcfTTM: 751.66, // AUD
    revTTM: 8590, nettoTTM: 1570, epsTTM: 0.35, ebitTTM: 1340, evKalla: 21710, // AUD
    dps: 0.13, direktAvk: 0.0265, payoutKalla: 0.2686, payoutAktiebas: 0.3714,
    aktier: 4480, beta: 0.70, v52Spann: [2.55, 5.33], v52Change: 0.8745,
    rapport: "halvårsvis ~februari 2027 (källans rappfält bar passerade 2026-08-26)", analytiker: "Buy mål 5,13 AUD (+4,1 %), 12 st",
    ekUSDFY26: 9700, ekAudProxy: 14040,
    utdelningarUSD: [567, 869, 163, 294, 292],
    serier: { ar: ["2022", "2023", "2024", "2025", "2026"], oms: [9375, 5752, 5020, 5982, 5940], netto: [2669, -173, -203, 213, 1087], ek: [10780, 9376, 8960, 8845, 9700], fcf: [2478, 303, 2, 338, 520] }, // USD M
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

// FMG — Fortescue
{
  const n = K.FMG;
  const prognos = n.pe / n.peFwd - 1;                        // −0,11593 NEGATIVT
  jamfor("FMG prognosgap (negativt)", prognos, -0.11593, 0.0005);
  INFO.push(`FMG NEGATIVT prognosgap ${(prognos * 100).toFixed(1)} % (P/E ${n.pe} mot forward ${n.peFwd}) ⇒ prognosTillväxt/PEG sätts null enligt BUD-konventionen — källans 3-års-EPS-prognos −10,3 %/år kalibrerar (universumets tredje negativa gap: BUD −0,7 · BEI −8,6 · FMG −11,6)`);
  jamfor("FMG revCAGR", cagr(n.serier.oms[0], n.serier.oms[4], 4), -0.00617, 0.0005);
  jamfor("FMG resCAGR", cagr(n.serier.netto[0], n.serier.netto[4], 4), -0.17507, 0.0005);
  jamfor("FMG fcfYield", n.fcfTTM / (n.mcapMdr * 1000), 0.10262, 0.0005);
  jamfor("FMG EV/EBIT källa", n.evKalla / n.ebitTTM, n.evEbit, 0.01);
  jamfor("FMG EV-replik mcap+nettoskuld", (n.mcapMdr * 1000 + n.nettoSkuldM) / n.ebitTTM, 6.676, 0.02);
  jamfor("FMG direktavkastning", n.dps / n.pris, n.direktAvk, 0.0005);
  jamfor("FMG payout aktiebas", n.dps / n.epsTTM, n.payoutAktiebas, 0.0005);
  jamfor("FMG payout cash-bas", 2529 / 2870, n.payoutKalla, 0.0005);
  jamfor("FMG aktiebas pris/EPS", n.pris / n.epsTTM, 12.393, 0.01);
  const peSpread = n.pris / n.epsTTM / n.pe - 1;
  INFO.push(`FMG P/E-fönster: aktiebas avrundad ${ (n.pris / n.epsTTM).toFixed(2) } mot källans PE-fält ${n.pe} (${(peSpread * 100).toFixed(1)} % — EPS-fältet 1,35 bär avrundning av EPS ≈ 1,3466 på NI 4 147 AUD M; exakt EPS-bas 16,73÷1,3466 = 12,43, dokumenterat)`);
  if (Math.abs(peSpread + 0.003) > 0.005) FEL.push("FMG P/E-fönster avviker från dokumentationen");
  jamfor("FMG mcap-identitet", (n.pris * n.aktier) / (n.mcapMdr * 1000) - 1, 0.0015, 0.005);
  jamfor("FMG P/B via AUD-ekv.", (n.mcapMdr * 1000) / n.ekAudProxy, n.pb, 0.01);
  jamfor("FMG FX-konsistens ek", 20283 * 1.4451 / n.ekAudProxy, 1.0, 0.002);
  jamfor("FMG FX-konsistens skuld", 5931 * 1.4451 / n.skuldM, 1.0, 0.005);
  const fcfMargFin = 0.2154;
  INFO.push(`FMG fcf-marginal två fönster: statistics-fältet ${(n.fcfM * 100).toFixed(2)} % mot financials-fönstret ${(fcfMargFin * 100).toFixed(2)} % (5 280÷24 520) — fältet bär statistics-panelsidans (SOON/HEN3-precedensen), båda dokumenterade`);
  if (Math.abs(n.fcfM - 0.2221) > 0.0001) FEL.push("FMG fcfM dokumentationskontroll");
  if (n.serier.ar.length !== 5 || n.serier.oms.length !== 5 || n.serier.netto.length !== 5 || n.serier.ek.length !== 5 || n.serier.fcf.length !== 5) FEL.push("FMG serielängder");
}
// NST — Northern Star
{
  const s = K.NST;
  const prognos = s.pe / s.peFwd - 1;                        // +0,13141
  jamfor("NST prognosTillväxt", prognos, 0.13141, 0.0005);
  jamfor("NST peg-spår", s.pe / (prognos * 100), 1.4611, 0.005);
  jamfor("NST revCAGR", cagr(s.serier.oms[0], s.serier.oms[4], 4), 0.18998, 0.0005);
  jamfor("NST resCAGR", cagr(s.serier.netto[0], s.serier.netto[4], 4), 0.38508, 0.0005);
  jamfor("NST fcfMarginal", s.fcfTTM / s.revTTM, s.fcfM, 0.0005);
  jamfor("NST fcfYield", s.fcfTTM / (s.mcapMdr * 1000), 0.014883, 0.0005);
  jamfor("NST EV/EBIT källa", s.evKalla / s.ebitTTM, s.evEbit, 0.01);
  jamfor("NST EV-replik", (s.mcapMdr * 1000 + s.nettoSkuldM) / s.ebitTTM, 13.167, 0.01);
  jamfor("NST direktavkastning", s.dps / s.pris, s.direktAvk, 0.0005);
  jamfor("NST payout aktiebas", s.dps / s.epsTTM, s.payoutAktiebas, 0.0005);
  jamfor("NST payout cash-bas", 762.9 / 1664, s.payoutKalla, 0.0005);
  jamfor("NST aktiebas pris/EPS", s.pris / s.epsTTM, 19.146, 0.01);
  const peIdent = (s.mcapMdr * 1000) / s.nettoTTM / s.pe - 1;
  INFO.push(`NST P/E-källspridning: mcap/netto ${((s.mcapMdr * 1000) / s.nettoTTM).toFixed(2)} mot källans PE-fält ${s.pe} (${(peIdent * 100).toFixed(1)} %; aktiebas ${(s.pris / s.epsTTM).toFixed(2)} = −0,3 % — nettofältet 1 664 bär rundning mot källans P/E-bas ≈1 647 M, dokumenterat)`);
  if (Math.abs(peIdent + 0.0104) > 0.005) FEL.push("NST P/E-källspridning avviker från dokumentationen");
  jamfor("NST mcap-identitet", (s.pris * s.aktier) / (s.mcapMdr * 1000) - 1, -0.0026, 0.005);
  jamfor("NST P/B equity", (s.mcapMdr * 1000) / 15682, s.pb, 0.01);
  jamfor("NST bruttomarginal-serie", 37.77 / 14.33, 2.6357, 0.01); // fyra år: 37,77 mot 14,33
  if (s.serier.ar.length !== 5 || s.serier.oms.length !== 5 || s.serier.netto.length !== 5 || s.serier.ek.length !== 5 || s.serier.fcf.length !== 5) FEL.push("NST serielängder");
}
// S32 — South32
{
  const g = K.S32;
  const prognos = g.pe / g.peFwd - 1;                        // +0,01896 NÄRA NOLL
  jamfor("S32 prognosgap (nära noll)", prognos, 0.01896, 0.0005);
  const pegFormell = g.pe / (prognos * 100);
  INFO.push(`S32 prognosgap +${(prognos * 100).toFixed(1)} % ⇒ PEG null med dokumentation (formellt ${pegFormell.toFixed(1)} exploderar vid nolltillväxt — ABEV-precedensen; källans PEG-fält n/a och 3-års-EPS-prognos −3,2 %/år = NEGATIV kalibrering: marknaden betalar för balansräkningen, inte prognosen)`);
  if (Math.abs(pegFormell - 7.65) > 0.05) FEL.push("S32 formell PEG avviker från dokumentationen");
  jamfor("S32 revCAGR", cagr(g.serier.oms[0], g.serier.oms[4], 4), -0.10784, 0.0005);
  jamfor("S32 resCAGR", cagr(g.serier.netto[0], g.serier.netto[4], 4), -0.20120, 0.0005);
  jamfor("S32 fcfYield", g.fcfTTM / (g.mcapMdr * 1000), 0.034012, 0.0005);
  jamfor("S32 EV-replik nettokassa", (g.mcapMdr * 1000 - g.nettokassaM) / g.ebitTTM, 16.17, 0.05);
  const evSpread = (g.mcapMdr * 1000 - g.nettokassaM) / g.ebitTTM / g.evEbit - 1;
  INFO.push(`S32 EV/EBIT-källspridning: replik EV÷EBIT-panel ${((g.mcapMdr * 1000 - g.nettokassaM) / g.ebitTTM).toFixed(2)} mot källans fält ${g.evEbit} (+${(evSpread * 100).toFixed(1)} % — källans fält räknar på justerad EBIT-bas ≈1 469 AUD M, panelens EBIT 1 340; fältet bär källans, VALE/BUD-familjen)`);
  if (Math.abs(evSpread - 0.096) > 0.01) FEL.push("S32 EV/EBIT-spridning avviker från dokumentationen");
  jamfor("S32 direktavkastning", g.dps / g.pris, g.direktAvk, 0.0005);
  jamfor("S32 payout aktiebas", g.dps / g.epsTTM, g.payoutAktiebas, 0.0005);
  jamfor("S32 payout cash-bas", 292 * 1.4451 / 1570, g.payoutKalla, 0.002);
  jamfor("S32 aktiebas pris/EPS", g.pris / g.epsTTM, 14.086, 0.01);
  const peSpread = g.pris / g.epsTTM / g.pe - 1;
  INFO.push(`S32 P/E-källspridning: aktiebas ${(g.pris / g.epsTTM).toFixed(2)} mot källans PE-fält ${g.pe} (${(peSpread * 100).toFixed(1)} % — EPS-fältet 0,35 bär avrundning av EPS ≈ 0,3467 på NI ≈ 1 553 AUD M; källans P/E-bas i sin tur 1 523, fönstren dokumenterade öppet)`);
  if (Math.abs(peSpread + 0.029) > 0.006) FEL.push("S32 P/E-källspridning avviker från dokumentationen");
  jamfor("S32 mcap-identitet", (g.pris * g.aktier) / (g.mcapMdr * 1000) - 1, -0.0006, 0.005);
  jamfor("S32 P/B equity", (g.mcapMdr * 1000) / g.ekAudProxy, g.pb, 0.01);
  jamfor("S32 FX-konsistens ek", 9700 * 1.4451 / g.ekAudProxy, 1.0, 0.002);
  const fcfMargFin = 0.0875;
  INFO.push(`S32 fcf-marginal två fönster: statistics-fältet ${(g.fcfM * 100).toFixed(2)} % mot financials-fönstret ${(fcfMargFin * 100).toFixed(2)} % — fältet bär statistics-panelsidans (SOON/HEN3-precedensen)`);
  if (g.serier.ar.length !== 5 || g.serier.oms.length !== 5 || g.serier.netto.length !== 5 || g.serier.ek.length !== 5 || g.serier.fcf.length !== 5) FEL.push("S32 serielängder");
}
// gemensamma strukturkontroller
for (const [t, n] of Object.entries(K)) {
  const monoOk = n.serier.ar.every((x, i) => i === 0 || Number(x) > Number(n.serier.ar[i - 1]));
  if (!monoOk) FEL.push(t + " årsetiketter ej stigande");
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
if (!har("FMG.AX")) rader.push({
  ticker: "FMG.AX", namn: "Fortescue Ltd", bransch: "material", land: "Australien", valuta: "AUD",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-19", url: "https://stockanalysis.com/quote/asx/fmg/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/ + /financials/balance-sheet/)",
    paranoid: "ASX-PRIMÄRNOTERING (Samsung-KRX/TCS-NSE/TEL-TSE-precedensen; ADR-vägen FSUMF-OTC undveken — SSNLF-fällan: tunn volym/stala kurser), S&P Global Market Intelligence + Fiscal.ai-underlag, close 2026-09-18 AEST: pris 16,73 AUD/51,45 mdr AUD; KONVENTION: AUD-kurs och AUD-paneler, FY-serier i USD = koncernrapportvaluta USD (BHP-mönstret) — multiplarna valuta-konsistenta inom måttet (P/E på AUD-mcap mot AUD-EPS), FX ~1,445 AUD/USD bevisad på tre identiteter (kassa 5 074 USD M × 1,4451 = 7 33 AUD-panel; skuld 5 931→8 57; EK 20 283→29 3); P/E 12,43 (aktiebas avrundad 12,39 på EPS-fältet 1,35; exakt EPS 1,3466 ⇒ 12,43 — EPS-rundning dokumenterad) forward 14,06 HÖGRE ⇒ NEGATIVT prognosgap −11,6 % ⇒ prognosTillväxt/PEG null enligt BUD-konventionen (källans PEG-fält n/a; 3-års-EPS-prognos −10,28 %/år + rev-prognos −3,58 %/år kalibrerar); P/B 1,76 (51 450÷29 315 AUD-EK = 1,755) EV/EBIT 6,69 (källans EV 52 640÷EBIT 7 880 = 6,68; replik (51 450+1 240)÷7 880 = 6,68 — FX-rundning i nettoskuldposten dokumenterad) EV/EBITDA 4,38 PS 2,10 P/FCF 9,74; brutto TTM 40,14 % EBIT 32,15 % netto 16,92 % FCF 22,21 % (financials-fönstret 21,54 % — två fönster, fältet bär statistics-panelsidans); ROE 14,23 % ROA 10,98 % ROIC 17,04 % MOT WACC 7,64 % (spread +9,4 pp) ROCE 19,31 %; skuld 8 570 M AUD kassa 7 330 M ⇒ NETTOSKULD 1 240 M AUD (balansräkning USD 857 M netto) skuld/EK 0,29 räntetäckning 19,76× Altman 4,36 Piotroski 5; aktier 3 080 M (YoY +0,06 %) EPS TTM 1,35 AUD; TTM=juni-FY: oms 24 520 M AUD (+9,2 % översiktsfönstret = FY2026-tillväxten; financials-TTM-fönstret +3,8 % — June-FY-bolagets dubbla fönster dokumenterat) netto 4 150 M (−14,9 %) OCF 9 880 capex 4 600 ⇒ FCF 5 280 (fcfYield 10,27 %); utdelning 1,08 AUD/aktie (6,46 %) payout 88,12 % källans fält = cash-bas 2 529÷2 870 USD EXAKT (aktiebas 80,0 % — båda dokumenterade) dividend growth −1,82 %; återköp 138→157 M USD/år (marginellt); insiders 1,80 % institutioner 59,07 %; beta 0,76; 52-v 16,14–23,38 (−11,4 %); eff skatt 34,06 % (australisk mineralroyalty-värld); 15 745 anställda; analytiker Hold 17,42 AUD (+4,1 %, 17 st); nästa rapp 2026-10-22 (samma FIFO-dag som FCX); Sector Materials (källans branschindelning) — branschfältet material källkonsekvent med BHP/RIO i cellen. FY july–juni slutårsetikett (BHP-konventionen)" }],
  hamtat: "2026-09-19",
  pris: 16.73, marknadsKapitalMdr: 51.45,
  tillvaxt: { omsattningCAGR5ar: -0.0062, resultatCAGR5ar: -0.1751, omsattningTillvaxtTTM: 0.0917, prognosTillvaxt: null },
  lonksamhet: { roe: 0.1423, roic: 0.1704, bruttoMarginal: 0.4014, ebitMarginal: 0.3215, nettoMarginal: 0.1692, fcfMarginal: 0.2221 },
  stabilitet: { skuldEgenkapital: 0.29, rantaTackning: 19.76, fcfPositivaSenaste5: null, kassaManaderBurnRate: null, nyemissionerSenaste5ar: null },
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: null },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
  vardering: { pe: 12.43, pb: 1.76, evEbit: 6.69, peg: null, fcfYield: 0.1027, egenKapitalMultipl: 1.76 },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: { ar: ["2022", "2023", "2024", "2025", "2026"], omsattning: [17390000000, 16871000000, 18220000000, 15541000000, 16966000000], resultat: [6197000000, 4798000000, 5683000000, 3373000000, 2870000000], egetKapital: [17337000000, 17989000000, 19552000000, 19984000000, 20283000000], fcf: [3843000000, 4531000000, 5085000000, 3211000000, 3655000000] },
  notering: "JÄRNMALMS-KASSAKON EFTER CYKELTOPPEN — Pilbara-trions tredje ben (BHP→RIO→FMG): malmbolaget med SERIENS CYKELTOPP FY2022 (netto 6 197 M USD, brutto 56,0 %) och DÄREFTER MALMBÖRDAN: netto 6 197 → 4 798 → 5 683 → 3 373 → 2 870 M USD (endpoint −17,5 %/år på omsättning −0,6 %/år; bruttomarginalen 56,0 → 40,1 % = −15,9 pp på fem år — järnmalmspriset är vallgraven som VIKER, BHP:s −8,7 %-CAGR i större skala). UTDelningsbågen är signaturnumret: utdelningar 6 699 → 3 922 → 4 140 → 2 851 → 2 529 M USD (−62 % från toppen) på DPS 1,08 AUD = 6,46 % direktavkastning och payout 88 % (cash-bas) — gruvcykelns utdelning följer VINSTEN, inte en utdelningspolitik (BHP-mönstret 89,9 % payout). NEGATIVT PROGNOSGAP: P/E 12,43 mot forward 14,06 = −11,6 % ⇒ prognosTillväxt/PEG null enligt BUD-konventionen (källans 3-års-EPS-prognos −10,3 %/år — universumets TREDJE dokumenterat negativa gap: BUD −0,7 · BEI −8,6 · FMG −11,6, och det DJUPASTE). KASSAN ARBETAR KVAR: FCF 3 655 M USD FY2026 ⇒ fcfYield 10,3 % = CELLENS HÖGSTA (över BHP 5,4 · RIO 3,4 · S32 3,4 · NST 1,5) på OCF 6 836 − capex 3 181 (18,8 % av oms — Iron Bridge-magnetitprojektet och Fortescue Energy [grönt väte] är bolagets dokumenterade kapitalprogram); EV/EBIT 6,69 och EV/EBITDA 4,38 = cykel-värderingsfotens multiplar; ROIC 17,0 mot WACC 7,6 = +9,4 pp; räntetäckning 19,8× Altman 4,36; skuld/EK 0,29. ROE 14,2 %. P/E 12,43 = CELLENS LÄGSTA (under RIO 13,6 — malmbotten noteras under jätten). Bokföringsår juli–juni (FY2026 slutade 30 juni 2026; slutårsetikett enligt BHP-konventionen); ASX-primär i AUD, koncernrapportvaluta USD — serierna USD, multiplarna valuta-konsistenta (RACE-mönstret: kursvaluta ≠ serievaluta dokumenterad). Nästa rapp 2026-10-22 (FCX:s FIFO-dag).",
});
if (!har("NST.AX")) rader.push({
  ticker: "NST.AX", namn: "Northern Star Resources Limited", bransch: "material", land: "Australien", valuta: "AUD",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-19", url: "https://stockanalysis.com/quote/asx/nst/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/ + /financials/balance-sheet/)",
    paranoid: "ASX-PRIMÄRNOTING i AUD HELA VÄGEN (både kurs och FY-serier — koncernen redovisar i AUD); S&P Global Market Intelligence-underlag, close 2026-09-18 AEST 22,21 AUD/31,62 mdr AUD (aktiebas 1 420 M aktier, +19,88 % YoY = De Grey-emissionen); P/E 19,20 (mcap/netto 31 620÷1 664 = 19,00 = −1,0 % källspridning — nettofältets rundning mot källans P/E-bas ≈1 647 M, dokumenterad; aktiebas 22,21÷1,16 = 19,15) forward 16,97 ⇒ prognosTillväxt +13,1 % TTE (PEG spår 1,46; källans PEG 0,94 på 3-års-EPS-prognos +29,31 %/år — expansionsprognos, båda dokumenterade); P/B 2,02 (31 620÷15 682 EXAKT) EV/EBIT 13,16 (32 320÷2 455 EXAKT; replik (31 620+706,6)÷2 455 = 13,17) EV/EBITDA 7,55 P/FCF 67,18; brutto TTM 37,77 % EBIT 32,21 % netto 21,83 % FCF 6,17 %; ROE 10,88 % ROA 7,32 % ROIC 10,37 % MOT WACC 11,45 % (spread −1,1 pp — ROIC UNDER WACC, ARM-klassen) ROCE 12,30 %; skuld 1 725 M kassa 1 018 M ⇒ nettoskuld 706,6 M skuld/EK 0,11 räntetäckning 27,74× Altman 4,4 Piotroski 6; EPS TTM 1,16; TTM=juni-FY: oms 7 623 M AUD (+18,8 % översiktsfönstret; financials-TTM-fönstret +9,5 % — dubbla fönster dokumenterat) netto 1 664 M (+24,2 %) OCF 3 183 capex 2 713 ⇒ FCF 471 M (fcfYield 1,49 % — expansionsåren äter kassan); utdelning 0,55 AUD (2,48 %) payout 45,84 % källans fält = cash-bas 762,9÷1 664 EXAKT (aktiebas 47,4 %) 4 år av utdelningstillväxt; återköp 42→177→150 M AUD; cash skatt −86,4 → +661,4 M (FY2022→FY2026 — gruvnäringens skatteväxling dokumenterad); insiders 0,36 % institutioner 59,16 %; beta 1,39; 52-v 17,07–31,96 (+8,4 %); eff skatt 30,79 %; 10 062 anställda; analytiker Hold 24,57 AUD (+10,6 %, 15 st); nästa rapp 2026-10-20 (cellens FÖRSTA FIFO-dag, före FCX/FMG 10-22); Sector Materials Industry Gold — guldklustrets ASX-ände mot NEM (USA) och FCX (koppar/guld); FY july–juni slutårsetikett" }],
  hamtat: "2026-09-19",
  pris: 22.21, marknadsKapitalMdr: 31.62,
  tillvaxt: { omsattningCAGR5ar: 0.19, resultatCAGR5ar: 0.3851, omsattningTillvaxtTTM: 0.1883, prognosTillvaxt: 0.1314 },
  lonksamhet: { roe: 0.1088, roic: 0.1037, bruttoMarginal: 0.3777, ebitMarginal: 0.3221, nettoMarginal: 0.2183, fcfMarginal: 0.0617 },
  stabilitet: { skuldEgenkapital: 0.11, rantaTackning: 27.74, fcfPositivaSenaste5: null, kassaManaderBurnRate: null, nyemissionerSenaste5ar: null },
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: null },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
  vardering: { pe: 19.2, pb: 2.02, evEbit: 13.16, peg: 1.46, fcfYield: 0.0149, egenKapitalMultipl: 2.02 },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: { ar: ["2022", "2023", "2024", "2025", "2026"], omsattning: [3806000000, 4131000000, 4921000000, 6415000000, 7623000000], resultat: [452100000, 585200000, 638500000, 1340000000, 1664000000], egetKapital: [8247000000, 8484000000, 8791000000, 14917000000, 15682000000], fcf: [570500000, 292300000, 630400000, 668200000, 470600000] },
  notering: "GULDPRISCYKLENS RESULTATBÅGE — cellens tillväxtände: netto 452 → 585 → 639 → 1 340 → 1 664 M AUD (+38,5 %/år endpoint på omsättning +19,0 %/år) med BRUTTOMARGINALENS EXPLOSION 14,3 → 37,8 % (+23,4 pp på fem år — guldpriset gör för NST vad järnmalmen gjorde OMVÄNT för Fortescue −15,9 pp): CELLENS TVÅ METALLER PEKAR I VARsin RIKTNING och det är cellens pedagogiska kärna — samma land, samma bransch, motsatta råvarucykler (malm-cykel top-pad 2021/22 ↔ guld-cykel bördad av samma makro). P/E 19,20 mot forward 16,97 ⇒ prognosTillväxt +13,1 % (PEG spår 1,46; källans 0,94 på 3-års-EPS +29,3 %/år — expansionsfasen prissatt måttligt mot sin prognos). DE GREY-FÖRVÄRVET ÄR BALANSRÄKNINGENS LÄROBOK: FY2025 hoppar EK 8 791 → 14 917 M AUD (+6,1 mdr på ett år) och totala tillgångar 13,1 → 20,4 mdr med aktiebasen +19,9 % — förvärvet av De Grey Mining (Hemi-guldprojektet, slutfört maj 2025) skrivs in som tillgångar/goodwill mot emitterade aktier; året efter organisk konsolidering till EK 15 682. MEN EXPANSIONEN ÄTER KASSAN: OCF 3 183 − capex 2 713 ⇒ FCF 471 M = fcfYield 1,49 % (P/FCF 67) och FCF-marginal 6,2 % — vinsten finns, kassan bygger gruva (fem raka år capex > 1 mdr AUD: 1 061 → 1 059 → 1 440 → 2 285 → 2 713) och ROIC 10,4 hamnar UNDER WACC 11,5 = −1,1 pp (ARM-klassen: tillväxten köps till överkapitalkostnad under expansionsåren — kontrasten mot färdigbyggda FMG +9,4 pp i SAMMA cell). Utdelningstrappan 218 → 763 M AUD (DPS 0,55 = 2,48 %, payout 45,8 % cash-bas) växer med resultatet; skatteväxlingen −86 → +661 M AUD dokumenterad. Beta 1,39 = trions högsta (guld-momentum). 52-v 17,07–31,96 (+8,4 %). P/E-källspridning −1,0 % dokumenterad. Nästa rapp 2026-10-20 — cellens FÖRSTA FIFO-dag (före FCX/FMG 10-22, VALE 10-29).",
});
if (!har("S32.AX")) rader.push({
  ticker: "S32.AX", namn: "South32 Limited", bransch: "material", land: "Australien", valuta: "AUD",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-19", url: "https://stockanalysis.com/quote/asx/s32/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/ + /financials/balance-sheet/)",
    paranoid: "ASX-PRIMÄRNOTING i AUD, FY-serier i USD = koncernrapportvaluta USD (BHP-avknoppningsarvet — koncernen bildades ur BHP 2015 med USD-redovisning); S&P Global Market Intelligence-underlag, close 2026-09-18 AEST 4,93 AUD/22,10 mdr AUD (aktiebas 4 480 M, −0,46 % YoY); P/E 14,51 (aktiebas 4,93÷0,35 = 14,09; mcap/NI-panel 22 100÷1 570 = 14,08 — båda ≈3 % under källans PE-fält 14,51: EPS/NI-fälten bär rundning, källans P/E-bas 1 523 AUD M; fönstren dokumenterade öppet) forward 14,24 ⇒ prognosgap +1,9 % NÄRA NOLL ⇒ PEG null med dokumentation (formellt 7,7 exploderar vid nolltillväxt — ABEV-precedensen; källans PEG-fält n/a, 3-års-EPS-prognos −3,18 %/år = NEGATIV kalibrering, rev-prognos +1,58 %/år); P/B 1,57 (22 100÷14 040 AUD-EK EXAKT; balansräkning USD 9 700 × 1,4451 = 14 017 konsistent) EV/EBIT 14,78 (KÄLLSPRIDNING dokumenterad: replik EV 21 710÷EBIT-panel 1 340 = 16,20 = +9,6 % — källans fält bär justerad EBIT-bas ≈1 469, VALE/BUD-familjen) EV/EBITDA 10,36; brutto TTM 52,22 % EBIT 15,61 % netto 18,30 % FCF 9,02 % (financials-fönstret 8,75 % — fältet bär statistics-panelsidans); RESULTATETS BÄRARPOST: pretax 1,98 mdr AUD > EBIT 1,34 — andelar i associerade bolag/jv (bland annat Sierra Gorda-koppargruvan, 45 %) ligger UNDER EBIT-raden men I vinsten; ROE 11,40 % ROA 4,11 % ROIC 7,62 % MOT WACC 7,73 % (spread −0,1 pp) ROCE 7,18 %; skuld 2 680 M kassa 3 080 M ⇒ NETTKASSA 409 M AUD (EV 21 710 < mcap 22 100) skuld/EK 0,19 räntetäckning 8,43× Altman 2,23 (trions lägsta — nedskrivningsårens ärr) Piotroski 6; EPS TTM 0,35 AUD (USD-seriens EPS 0,24); TTM=juni-FY: oms 8 590 M AUD (−0,7 % översiktsfönstret; financials-TTM +0,6 %) netto 1 570 M AUD (+410,3 %!) OCF 2 360 capex 1 610 ⇒ FCF 752 M (fcfYield 3,40 %); utdelning 0,13 AUD (2,65 %) payout 26,86 % källans fält = cash-bas 292 USD M×1,4451÷1 570 EXAKT (aktiebas 37,1 %) dividend growth +40,4 %; återköp 150→251→46→66→40 M USD; insiders 0,13 % institutioner 44,95 %; beta 0,70; 52-v 2,55–5,33 (+87,4 %!! trions största ettårsrörelse); eff skatt 22,53 %; 6 867 anställda; analytiker Buy 5,13 AUD (+4,1 %, 12 st); nästa rapp halvårsvis ~februari 2027 (källans rappfält bar det passerade 2026-08-26 — juni-FY-bolag utan kvartalsrapporter); Sector Materials Industry Other Industrial Metals & Mining; FY july–juni slutårsetikett. KONTRASTEN I SERIEN: nedskrivningar 1 300 M USD (FY2023) + 604 M (FY2024) = de två röda åren" }],
  hamtat: "2026-09-19",
  pris: 4.93, marknadsKapitalMdr: 22.1,
  tillvaxt: { omsattningCAGR5ar: -0.1078, resultatCAGR5ar: -0.2012, omsattningTillvaxtTTM: -0.007, prognosTillvaxt: 0.019 },
  lonksamhet: { roe: 0.114, roic: 0.0762, bruttoMarginal: 0.5222, ebitMarginal: 0.1561, nettoMarginal: 0.183, fcfMarginal: 0.0902 },
  stabilitet: { skuldEgenkapital: 0.19, rantaTackning: 8.43, fcfPositivaSenaste5: null, kassaManaderBurnRate: null, nyemissionerSenaste5ar: null },
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: null },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
  vardering: { pe: 14.51, pb: 1.57, evEbit: 14.78, peg: null, fcfYield: 0.034, egenKapitalMultipl: 1.57 },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: { ar: ["2022", "2023", "2024", "2025", "2026"], omsattning: [9375000000, 5752000000, 5020000000, 5982000000, 5940000000], resultat: [2669000000, -173000000, -203000000, 213000000, 1087000000], egetKapital: [10780000000, 9376000000, 8960000000, 8845000000, 9700000000], fcf: [2478000000, 303000000, 2000000, 338000000, 520000000] },
  notering: "AVKNOPPNINGENS TVÅ RÖDA ÅR OCH VÄNDNINGEN — BHP:s 2015-avknoppning (noterad i Perth och London med aluminium/mangan/nickel/kol, koncernrapportvaluta USD = arvet) med KOLET LÄMNAR SERIEN: omsättning 9 375 → 5 752 M USD (−38,7 % FY2023 — kol-utträdets avyttringar, 954 M USD in i kasflödet FY2025, påfallande med råvaruprisernas vända) och NEDSKRIVNINGAR 1 300 M (FY2023) + 604 M (FY2024) ⇒ NETTO −173 → −203 M = TVÅ FÖRLUSTÅR I RAD (VALE-precedensens nedskrivningsläxa; retained earnings 901 → −723 M USD) — DÄREFTER VÄNDNINGEN: netto 213 → 1 087 M (+410 %, EPS 0,24 USD), retained earnings tillbaka på +75 M, OCF 1 335 → 1 634 (+22 %), FCF 338 → 520 M (+53,9 %), bruttomarginal 45,0 → 52,2 %. MARKNADEN HANN FÖRST: 52-v +87,4 % = trions klart största ettårsrörelse (FMG −11,4 · NST +8,4) — VÄNDNINGSMULTIPLENs läxa: P/E 14,51 på BOTTENVINSTEN kan bli 'billig' utan kursrus när marginalen återkommer (FCX-mönstret +53 % TTM-vinst i samma år). PROGNOSGAPET +1,9 % ⇒ PEG null med dokumentation (formellt 7,7; källans 3-års-EPS-prognos −3,2 %/år = marknaden betalar för BALANSRÄKNINGEN: NETTKASSA 409 M AUD, EV under mcap, skuld/EK 0,19). RESULTATETS BÄRARPOST UNDER EBIT: pretax 1,98 > EBIT 1,34 mdr AUD — andelar i associerade bolag/jv (bland annat Sierra Gorda, 45 %) bär vinsten utanför driften; EV/EBIT-källspridning 14,78 mot replik 16,20 dokumenterad. Altman 2,23 = trions lägsta (nedskrivningsårens ärr i Z-modellen) medan Piotroski 6 — balansrisk mot resultatkvalitet (BUD-dualiteten). ROIC 7,62 mot WACC 7,73 = −0,1 pp: vändningsåret ligger precis PÅ kapitalkostnaden (mellan NST −1,1 och FMG +9,4 — cellens tre ROIC-lägen är kursens tredje läxa). Utdelning 0,13 AUD (2,65 %) payout 27 % cash-bas + utdelningstillväxt +40,4 %. USD-serier med ASX-primärkurs i AUD (RACE-mönstret dokumenterat). Nästa rapp halvårsvis ~februari 2027.",
});

if (rader.length === 0) {
  console.log("IDEMPOTENT: samtliga tre tickers finns redan — inget att göra.");
  process.exit(0);
}

// ── innehållsintegritet: gamla rader orörda (bevis efter skrivning) ──────────
const gamlaJson = JSON.stringify(u);

u.push(...rader);
writeFileSync(FIL, JSON.stringify(u, null, 1) + "\n");

// ── efterkontroll ────────────────────────────────────────────────────────────
const efter = JSON.parse(readFileSync(FIL, "utf8"));
const gamlaIgen = efter.slice(0, innan).map(JSON.stringify);
const gamlaFore = JSON.parse(gamlaJson).map(JSON.stringify);
const forandrade = gamlaFore.filter((r, i) => r !== gamlaIgen[i]).length;
console.log(`APPEND: ${innan} → ${efter.length} (+${rader.length}); gamla rader förändrade: ${forandrade}`);
if (forandrade !== 0) { console.error("ABORT — gamla rader förändrade!"); process.exit(1); }

// ── medianer + kvartiler (EXAKT replik av raknaBranschMedianer) ──────────────
const median = (v) => { const r = v.filter((x) => typeof x === "number" && Number.isFinite(x)); if (!r.length) return null; const s = [...r].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const percentil = (v, p) => { const r = v.filter((x) => typeof x === "number" && Number.isFinite(x)); if (!r.length) return null; const s = [...r].sort((a, b) => a - b); const pos = (s.length - 1) * p; const lo = Math.floor(pos), hi = Math.ceil(pos); return lo === hi ? s[lo] : s[lo] + (pos - lo) * (s[hi] - s[lo]); };
const r1 = (x) => x === null ? "—" : String(Math.round(x * 10) / 10).replace(".", ",");
const statP = (arr, f) => { const v = arr.map((b) => f(b) ?? null).filter((x) => typeof x === "number" && Number.isFinite(x)); return { median: median(v), p25: percentil(v, 0.25), p75: percentil(v, 0.75), n: v.length }; };

// FÖRE-läget = efter minus mina tre (identiskt)
const fore = efter.filter((b) => !["FMG.AX", "NST.AX", "S32.AX"].includes(b.ticker));
for (const [namn, arr] of [["TOTALT före", fore], ["TOTALT efter", efter], ["material före", fore.filter((b) => b.bransch === "material")], ["material efter", efter.filter((b) => b.bransch === "material")]]) {
  const pe = statP(arr, (b) => b.vardering?.pe);
  const pb = statP(arr, (b) => b.vardering?.pb);
  const ebit = statP(arr, (b) => b.lonksamhet?.ebitMarginal);
  const fcf = statP(arr, (b) => b.lonksamhet?.fcfMarginal);
  console.log(`${namn}: n=${arr.length} · P/E ${r1(pe.median)} (kv ${r1(pe.p25)}–${r1(pe.p75)}, n ${pe.n}) · P/B ${r1(pb.median)} · EBIT ${r1(ebit.median === null ? null : ebit.median * 100)} % · FCF ${r1(fcf.median === null ? null : fcf.median * 100)} %`);
}
const cell = efter.filter((b) => b.land === "Australien" && b.bransch === "material");
const cellPe = statP(cell, (b) => b.vardering?.pe);
console.log(`CELL Australien/material: ${cell.length} rader, P/E mätbara ${cellPe.n} — median ${r1(cellPe.median)} kv ${r1(cellPe.p25)}–${r1(cellPe.p75)} (landsidans tal vid nästa bygge)`);
const totPeE = statP(efter, (b) => b.vardering?.pe);
console.log(`UNIVERSUMJÄMFÖRELSE: cellens median ${r1(cellPe.median)} mot universumets ${r1(totPeE.median)} = gruvcykelns multiplrabatt`);
