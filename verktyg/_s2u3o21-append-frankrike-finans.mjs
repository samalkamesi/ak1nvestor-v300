#!/usr/bin/env node
/**
 * s2-u3 omg21 (manifest auto-s2-1789856706519) — DATASET-DJUP:
 * FRANKRIKE/FINANS +3: ACA.PA (Crédit Agricole) + GLE.PA (Société Générale) +
 * AMUN.PA (Amundi) — cellens P/E-matta 2→5 ⇒ /dataset/finans/frankrike föds
 * vid nästa prod-bygge (land.ts-frankrikemodulen byggs i samma leverans,
 * tyskland-/australien-/japan-precedenserna omg17/18/20).
 * Syskon-u2:s anspråk utpekade Frankrike/finans som u3:s jägarfält —
 * koordinaten följs; u1 (Mizuho, Japan/finans) berörs ej.
 * METSB-PIVOTEN: ursprungsplanen Finland/material (Kemira+Huhtamäki+Metsä
 * Board) föll i sonderingen — METSB TTM-förlust (P/E n/a) ⇒ Sony-fällan;
 * dokumenterad i anspråksfilen FÖRE detta dataarbete.
 * Cellens fem finansarketyper efter leverans: universalbank (BNP) +
 * försäkring (AXA) + kooperativ bank (ACA) + universalbank (GLE) +
 * kapitalförvaltare (AMUN, ~70 % moderägare = ACA) = kvartilpedagogik i
 * EN cell med en förälder/barn-länk.
 * Idempotent append på diskens faktiska läge (omg11–20-konventionen).
 * Källa StockAnalysis EPA-primär (/quote/epa/, BNP.PA-precedensen omg19)
 * hämtad 2026-09-20 (S&P Global MI-underlag, close 2026-09-18 17:30 CEST);
 * Yahoo chart-API paranoid-koll (09-17/09-18 null-gaps på Yahoo för ACA/GLE,
 * AMUN 09-18 91,65 mot SA 92,25 = 0,65 % band).
 * ALL aritmetik maskinverifierad FÖRE skrivning (abort-grind, omg13-läxan).
 * Enhetshygien: mcapMdr i mdr EUR; serier i M EUR.
 * Bankkonvention (MUFG/SMFG/BNP-raderna): evEbit/fcfYield/fcfMarginal/
 * skuldEgenkapital/rantaTackning NULL — insättningsbalansen gör EV/FCF
 * meningslösa; fcf-SERIEN förs (bank-OCF-artefakten dokumenterad, BNP).
 * Amundi = förvaltarkonvention (BLK/AXA): fulla fält.
 */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/portfolj-system/bolagsunivers.json";
const u = JSON.parse(readFileSync(FIL, "utf8"));
const innan = u.length;
const har = (t) => u.some((b) => b.ticker === t);

// ── käldata (StockAnalysis /quote/epa/, hämtat 2026-09-20; paranoid per rad) ─
const K = {
  ACA: {
    // EUR hela vägen; kalenderår
    pris: 18.61, mcapMdr: 55.03,
    pe: 8.99, peFwd: 7.60, pegKalla: 1.11, pb: 0.63, psKalla: 2.11,
    ebitM: 0.3941, nettoM: 0.2532,
    roe: 0.0861, wacc: 0.0069,
    kassaT: "1 041 mdr (stat-ytan 1,04 T)", skuldM: 639134, nettkassaM: 402074,
    aktierM: 3025, beta: 0.81, v52Spann: [15.37, 20.40],
    dps: 1.14, direktAvkKalla: 0.0627,
    revTTM: 26024, nettoTTM: 6123, epsTTM: 2.02, opIncTTM: 10260,
    utdelningarM: [-2333, -3173, -3168, -3177, -3328],
    aterkopM: [0, 0, 0, -174, -289],
    serier: { ar: ["2021", "2022", "2023", "2024", "2025"], oms: [21030, 20760, 23487, 25327, 26557], netto: [5491, 4894, 5890, 6358, 6598], fcf: [10054, 421, -37397, -16979, 17895] }, // M EUR; fcf = bank-OCF-artefakt (BNP-noten)
  },
  GLE: {
    pris: 74.16, mcapMdr: 52.64,
    pe: 9.56, peFwd: 8.56, pegKalla: 0.55, pb: 0.65, psKalla: 2.02,
    ebitM: 0.3443, nettoM: 0.2467,
    roe: 0.0945, wacc: 0.0124,
    skuldM: 354253, nettkassaM: 362580,
    aktierM: 731.23, beta: 0.97, v52Spann: [51.98, 84.82],
    dps: 1.61, direktAvkKalla: 0.0222,
    revTTM: 26056, nettoTTM: 5717, epsTTM: 7.59, opIncTTM: 8974,
    utdelningarM: [-468, -1371, -1362, -719, -1315],
    aterkopM: [-2892, -590, 0, 0, -3073],
    serier: { ar: ["2021", "2022", "2023", "2024", "2025"], oms: [25722, 25508, 24079, 25258, 25777], netto: [5051, 1229, 1735, 3480, 5282], fcf: [14540, 29502, 25556, -21531, -29009] }, // M EUR
  },
  AMUN: {
    pris: 92.25, mcapMdr: 18.47,
    pe: 14.02, peFwd: 11.87, pegKalla: 1.75, pb: 1.47, evEbit: 7.19, evEbitda: 6.81,
    bruttoM: 0.4942, ebitM: 0.2282, nettoM: 0.1875, fcfM: 0.3402,
    roe: 0.1097, roic: 0.1312, wacc: 0.0531,
    skuldEk: 1.56, rantaTack: 11.27,
    nettkassaM: 4290,
    aktierM: 201.58, beta: 1.11, v52Spann: [60.90, 97.70],
    dps: 4.25, direktAvkKalla: 0.0464,
    revTTM: 7186, nettoTTM: 1347, epsTTM: 6.54, ebitTTM: 1642, evKalla: 14230, fcfTTM: 2444,
    bruttoSeriePct: [53.81, 52.01, 53.82, 53.78, 51.45], // FY2021–FY2025 gross margin
    utdelningarM: [-585.63, -831.14, -830.55, -835.43, -866.26],
    aterkopM: [0, -56.4, 0, -72.1, 0],
    serier: { ar: ["2021", "2022", "2023", "2024", "2025"], oms: [5923, 5980, 5995, 6656, 6799], netto: [1369, 1074, 1165, 1305, 1592], ek: [10671, 11026, 11369, 12003, 12655], fcf: [1908, -233.98, 1490, 1522, 1728] }, // M EUR
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

// ACA — Crédit Agricole
{
  const n = K.ACA;
  const prognos = n.pe / n.peFwd - 1; // +0,18289
  jamfor("ACA prognosTillväxt", prognos, 0.18289, 0.0005);
  jamfor("ACA peg-spår", n.pe / (prognos * 100), 0.4915, 0.005);
  INFO.push(`ACA PEG spår 0,49 mot källans fält 1,11 (källans bas: 3-års EPS-prognos ~8,1 %/år) — spårets TTE-konvention bär`);
  jamfor("ACA revCAGR", cagr(n.serier.oms[0], n.serier.oms[4], 4), 0.0601, 0.0005);
  jamfor("ACA resCAGR", cagr(n.serier.netto[0], n.serier.netto[4], 4), 0.0470, 0.0005);
  jamfor("ACA netto-marginal", n.nettoTTM / n.revTTM, 0.2353, 0.005);
  INFO.push(`ACA netto-marginal två baser: financials-kvoten 6 123÷26 024 = 23,5 % mot statistics-ytan 25,3 % (exkl-minoritetsbas — BNP:s BAS-SPLITTRA, fältet bär statistics)`);
  jamfor("ACA direktavkastning aktiebas", n.dps / n.pris, 0.06126, 0.0005);
  INFO.push(`ACA direktavkastning två baser: aktiebas 1,14÷18,61 = 6,13 % mot källans fält 6,27 % (källans prisbas ≈18,185 — troligen äldre close; aktiebasen bär, spreaden dokumenterad)`);
  jamfor("ACA payout aktiebas", n.dps / n.epsTTM, 0.5644, 0.005);
  jamfor("ACA aktiebas pris/EPS", n.pris / n.epsTTM, 9.2129, 0.01);
  const peSpread = (n.pris / n.epsTTM) / n.pe - 1;
  INFO.push(`ACA P/E-källspridning: aktiebas 9,21 mot källans fält 8,99 (+${(peSpread * 100).toFixed(1)} % — källans P/E-bas EPS ≈2,07 på viktat aktiesnitt mot panelens 2,02; dokumenterat)`);
  if (Math.abs(peSpread - 0.0248) > 0.006) FEL.push("ACA aktiebas-P/E-spridning avviker från dokumentationen");
  jamfor("ACA P/B equity", n.mcapMdr * 1000 / 86941, n.pb, 0.005);
  const mcapIdent = (n.pris * n.aktierM) / (n.mcapMdr * 1000) - 1;
  INFO.push(`ACA mcap-identitet: pris×BS-aktier 18,61×3 025 M = 56,3 mdr mot källans mcap 55,03 (+${(mcapIdent * 100).toFixed(1)} % — aktientalsfönster; Maersk-notens leverantörsinkonsistens, dokumenterat)`);
  if (Math.abs(mcapIdent - 0.0228) > 0.006) FEL.push("ACA mcap-identitet avviker från dokumentationen");
  jamfor("ACA utdelningstillväxt DPS", 1.14 / 1.13 - 1, 0.00885, 0.0005);
  if (!(n.v52Spann[0] <= n.pris && n.pris <= n.v52Spann[1])) FEL.push("ACA pris utanför 52-v-spann");
  if (n.serier.ar.length !== 5 || n.serier.oms.length !== 5 || n.serier.netto.length !== 5 || n.serier.fcf.length !== 5) FEL.push("ACA serielängder");
}
// GLE — Société Générale
{
  const s = K.GLE;
  const prognos = s.pe / s.peFwd - 1; // +0,11682
  jamfor("GLE prognosTillväxt", prognos, 0.11682, 0.0005);
  jamfor("GLE peg-spår", s.pe / (prognos * 100), 0.8185, 0.005);
  INFO.push(`GLE PEG spår 0,82 mot källans fält 0,55 (källans bas: 3-års EPS-prognos ~17,4 %/år) — TTE-konventionen bär`);
  jamfor("GLE revCAGR", cagr(s.serier.oms[0], s.serier.oms[4], 4), 0.0005, 0.0005);
  jamfor("GLE resCAGR", cagr(s.serier.netto[0], s.serier.netto[4], 4), 0.0112, 0.0005);
  INFO.push(`GLE endpoint-CAGR-fällan dokumenterad: netto 5 051 → 1 229 → 1 735 → 3 480 → 5 282 — endpointen +1,1 %/år är PLATT men banan bär Ryssland-exiten (FY2022) och återhämtningen; FY2022-botten är mätstock, inte trend`);
  jamfor("GLE netto-marginal", s.nettoTTM / s.revTTM, 0.2194, 0.005);
  INFO.push(`GLE netto-marginal två baser: financials-kvoten 5 717÷26 056 = 21,9 % mot statistics 24,7 % (exkl-minoritetsbas — samma BAS-SPLITTRA som ACA/BNP, fältet bär statistics)`);
  jamfor("GLE direktavkastning", s.dps / s.pris, s.direktAvkKalla, 0.0005);
  jamfor("GLE payout aktiebas", s.dps / s.epsTTM, 0.2121, 0.005);
  INFO.push(`GLE utdelningens tapp: DPS-serien 1,65 → 1,70 → 0,90 → 1,09 → 1,61 EUR (FY2021→FY2025) — Ryssland-exit-årets halvering och återuppbyggnaden i EN trappa; aktiebas-payout 21,2 % på TTM-EPS 7,59 (utdelningen återförs försiktigt)`);
  jamfor("GLE aktiebas pris/EPS", s.pris / s.epsTTM, 9.7700, 0.01);
  const peSpread = (s.pris / s.epsTTM) / s.pe - 1;
  if (Math.abs(peSpread - 0.0220) > 0.006) FEL.push("GLE aktiebas-P/E-spridning avviker från dokumentationen");
  INFO.push(`GLE P/E-källspridning: aktiebas 9,77 mot källans fält 9,56 (+${(peSpread * 100).toFixed(1)} % — viktat aktiesnitt i källans EPS-fönster, dokumenterat)`);
  jamfor("GLE P/B equity", s.mcapMdr * 1000 / 80549, s.pb, 0.005);
  const mcapIdent = (s.pris * s.aktierM) / (s.mcapMdr * 1000) - 1;
  INFO.push(`GLE mcap-identitet: 74,16×731,23 M = 54,2 mdr mot källans 52,64 (+${(mcapIdent * 100).toFixed(1)} % — tre aktientalsytor: översikt 725,17 · BS-TTM 731,23 · BS-FY2025 754,89; återköpen −4,8 % YoY gör fönstret rörligt)`);
  if (Math.abs(mcapIdent - 0.0297) > 0.008) FEL.push("GLE mcap-identitet avviker från dokumentationen");
  if (!(s.v52Spann[0] <= s.pris && s.pris <= s.v52Spann[1])) FEL.push("GLE pris utanför 52-v-spann");
  if (s.serier.ar.length !== 5 || s.serier.oms.length !== 5 || s.serier.netto.length !== 5 || s.serier.fcf.length !== 5) FEL.push("GLE serielängder");
}
// AMUN — Amundi
{
  const a = K.AMUN;
  const prognos = a.pe / a.peFwd - 1; // +0,18113
  jamfor("AMUN prognosTillväxt", prognos, 0.18113, 0.0005);
  jamfor("AMUN peg-spår", a.pe / (prognos * 100), 0.7741, 0.005);
  INFO.push(`AMUN PEG spår 0,77 mot källans fält 1,75 (källans bas: 3-års EPS-prognos ~8,0 %/år) — TTE-konventionen bär`);
  jamfor("AMUN revCAGR", cagr(a.serier.oms[0], a.serier.oms[4], 4), 0.0351, 0.0005);
  jamfor("AMUN resCAGR", cagr(a.serier.netto[0], a.serier.netto[4], 4), 0.0384, 0.0005);
  jamfor("AMUN fcfYield", a.fcfTTM / (a.mcapMdr * 1000), 0.1323, 0.0005);
  jamfor("AMUN fcf-marginal", a.fcfTTM / a.revTTM, 0.3402, 0.0005);
  INFO.push(`AMUN fcf-marginal 34,0 % = förvaltarekonomins capex-löshet (capex 107 M = 1,5 % av intäkten); BLK-notens FCF-definitionssplittrar gäller även här — kundmedelsflöden kan ligga i OCF-ytan, fältet bär SA-financials`);
  jamfor("AMUN EV/EBIT-källspridning", a.evKalla / a.ebitTTM, 8.6726, 0.01);
  const evSpread = (a.evKalla / a.ebitTTM) / a.evEbit - 1;
  INFO.push(`AMUN EV/EBIT: källans fält 7,19 mot replik 14 230÷1 642 = 8,67 (+${(evSpread * 100).toFixed(1)} % — källans EV/EBIT-räknar på justerad EBIT-bas ≈1 979 M; VALE/BUD-familjen, fältet bär källans)`);
  if (Math.abs(evSpread - 0.2059) > 0.008) FEL.push("AMUN EV/EBIT-spridning avviker från dokumentationen");
  jamfor("AMUN direktavkastning", a.dps / a.pris, a.direktAvkKalla, 0.0005);
  jamfor("AMUN payout aktiebas", a.dps / a.epsTTM, 0.6498, 0.005);
  jamfor("AMUN aktiebas pris/EPS", a.pris / a.epsTTM, 14.1077, 0.01);
  if (Math.abs((a.pris / a.epsTTM) / a.pe - 1) > 0.012) FEL.push("AMUN aktiebas-P/E avviker från källans fält");
  INFO.push(`AMUN P/E-fönster: aktiebas 14,11 mot källans fält 14,02 (+0,6 % — EPS-rundning; dokumenterat)`);
  jamfor("AMUN P/B equity", a.mcapMdr * 1000 / 12531, a.pb, 0.005);
  const moatMedel = a.bruttoSeriePct.reduce((x, y) => x + y, 0) / 5;
  jamfor("AMUN moat-medel5ar", moatMedel, 52.974, 0.01);
  jamfor("AMUN moat-spread5ar", Math.max(...a.bruttoSeriePct) - Math.min(...a.bruttoSeriePct), 2.37, 0.01);
  INFO.push(`AMUN moat: bruttomarginal 51,45–53,82 % fem år (medel 52,97 % ± 2,37 pp — avgiftsmodellens stabilitet; BLK-konventionen procentbärare)`);
  jamfor("AMUN ROIC-WACC-spread", a.roic - a.wacc, 0.0781, 0.0005);
  if (!(a.v52Spann[0] <= a.pris && a.pris <= a.v52Spann[1])) FEL.push("AMUN pris utanför 52-v-spann");
  if (a.serier.ar.length !== 5 || a.serier.oms.length !== 5 || a.serier.netto.length !== 5 || a.serier.ek.length !== 5 || a.serier.fcf.length !== 5) FEL.push("AMUN serielängder");
  const fcfPos = a.serier.fcf.filter((x) => x > 0).length;
  if (fcfPos !== 4) FEL.push("AMUN fcfPositivaSenaste5 stämmer ej med serien");
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
if (!har("ACA.PA")) rader.push({
  ticker: "ACA.PA", namn: "Crédit Agricole S.A.", bransch: "finans", land: "Frankrike", valuta: "EUR",
  kallor: [
    { namn: "StockAnalysis", hamtat: "2026-09-20", url: "https://stockanalysis.com/quote/epa/ACA/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/ + /financials/balance-sheet/)",
      paranoid: "EURONEXT-PARIS-PRIMÄRNOTING i EUR (BNP.PA-precedensen omg19; underlag S&P Global Market Intelligence; close 2026-09-18 17:30 CEST, sidan hämtad 2026-09-20): pris 18,61 EUR, mcap 55,03 mdr EUR (aktiebas-identitet 18,61×3 025 M = 56,3 mdr = +2,3 % — aktientalsfönster, Maersk-notens leverantörsinkonsistens), 52-v 15,37–20,40; P/E 8,99 (aktiebas 18,61÷2,02 = 9,21 = +2,5 % — källans P/E-bas EPS ≈2,07 viktat snitt; dokumenterat) forward 7,60 ⇒ prognosTillväxt +18,3 % TTE (PEG spår 0,49; källans fält 1,11 på 3-års EPS ~8,1 %/år — båda dokumenterade), P/B 0,63 (55,03÷86,94 shareholders-equity = 0,633 EXAKT), PS 2,11, P/TBV n/a; EV n/a (BANK — kassa 1 041 mdr mot skuld 639 mdr = NETTKASSA 402 mdr EUR på insättarnas pengar; MUFG/BNP-konventionen: EV/FCF/skuld-EK/räntetäckning meningslösa ⇒ null); marginaler TTM: operating 39,41 % netto 25,32 % (statistics exkl-minoritetsbas) mot financials-kvoten 6 123÷26 024 = 23,5 % (BAS-SPLITTRAN BNP-klassen, fältet bär statistics); ROE 8,61 % ROA n/a ROIC n/a (bank) WACC 0,69 % (eurolågräntan, djupare än BNP:s 1,17 %); equity 86,94 mdr (varav minoriteter+hanköpsavtal ≈8,7), BVPS 23,20 på källans egen bas (hybridkomponenten bruten — tre equity-ytor dokumenterade); aktier 3 025 M (YoY −0,09 %); TTM (M EUR): rev 26 024 (−1,5 %) netto 6 123 (−13,0 %) EPS 2,02; FY-serier kalenderår (M EUR): rev 21 030→20 760→23 487→25 327→26 557 (+6,0 %/år FY2021→FY2025, räntevändningsbågen), netto 5 491→4 894→5 890→6 358→6 598 (+4,7 %/år); fcf-serien 10 054→421→−37 397→−16 979→17 895 (BANK-OCF-ARTEFAKTEN: insättningsströmmar, ej driftskassa — BNP-noten ordagrant, fältet fcfYield null); utdelning 1,14 EUR (6,27 % — cellens högsta) DPS-trappa 1,05→1,05→1,05→1,10→1,13→1,14 (2021→TTM) payout aktiebas 56,4 %; återköp 289 M EUR TTM (buyback-yield 0,52 %); effektiv skatt 26,38 %; beta 0,81 (5Y); institutions 8,08 % (LÅGT — kooperativa regionbankerna via SAS Rue La Boétie äger ~62 % och räknas ej som institution; ägarstrukturens pedagogik), insiders n/a; anställda 79 848; nästa rapp Q3 2026-11-05 (BNP 10-28 + ACA 11-05 = fransk bankföljd); segment: Asset Gathering 8 139 + Large Customers 8 952 + Specialised Financial Services 3 555 + French Retail LCL 4 150 + International Retail 4 082 + Corporate Centre −704 (TTM)" },
    { namn: "Yahoo Finance (chart-API)", hamtat: "2026-09-20", url: "https://query1.finance.yahoo.com/v8/finance/chart/ACA.PA",
      paranoid: "paranoid kurskoll: Yahoo 09-16 18,385 EUR; 09-17/09-17-stängningar NULL på Yahoo (datalucka) medan SA bär 09-18 close 18,61 — SA/S&P primärt, Yahoo bandet 09-11 18,625/09-14 18,44/09-15 18,35/09-16 18,385 kalibrerar nivån (0,3–1,2 % fönster); v7-quote-API:t Unauthorized (dokumenterat)" },
  ],
  hamtat: "2026-09-20",
  pris: 18.61, marknadsKapitalMdr: 55.03,
  tillvaxt: { omsattningCAGR5ar: 0.0601, resultatCAGR5ar: 0.047, omsattningTillvaxtTTM: -0.0147, prognosTillvaxt: 0.1829 },
  lonksamhet: { roe: 0.0861, roic: null, bruttoMarginal: null, ebitMarginal: 0.3941, nettoMarginal: 0.2532, fcfMarginal: null },
  stabilitet: { skuldEgenkapital: null, rantaTackning: null, fcfPositivaSenaste5: null, kassaManaderBurnRate: null, nyemissionerSenaste5ar: null },
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: null },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
  vardering: { pe: 8.99, pb: 0.63, evEbit: null, peg: 0.49, fcfYield: null, egenKapitalMultipl: 0.63 },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: { ar: ["2021", "2022", "2023", "2024", "2025"], omsattning: [21030000000, 20760000000, 23487000000, 25327000000, 26557000000], resultat: [5491000000, 4894000000, 5890000000, 6358000000, 6598000000], egetKapital: [], fcf: [10054000000, 421000000, -37397000000, -16979000000, 17895000000] },
  notering: "KOOPERATIVETS NOTERADE ARM — Frankrikes största bankgrupp är ett kreditkooperativ: 39 regionbanker äger SAS Rue La Boétie som äger ~62 % av den noterade S.A.-enheten — institutionsandelen 8,08 % är därför LÅG utan att ägarspridningen vara det (ägarpedagogikens franska fall, JT/staten-jämförelsen). RÄNTEVÄNDNINGSBÅGEN: intäktsplattformen växte 20 760 → 26 557 M EUR (+6,0 %/år, kalenderår) medan nettot rullade 4 894 → 6 598 (+4,7 %/år) — ECB-årens nollränta till normalränta är cellens renaste räntekänslighetsbevis; TTM-nettot −13,0 % mot FY2025 = fönstret (2026 års svagare kvartal i TTM). KVARTILPLACERING: P/E 8,99 och P/B 0,63 = CELLLENS LÄGSTA par (under BNP 8,72/0,80 — kooperativstrukturens noteringseffekt); direktavkastning 6,27 % = cellens högsta dokumenterade (före MBG 7,36 bland universumets total) med DPS-trappa 1,05→1,14 fyra steg. Amundi-länken: ACA äger ~70 % av AMUN (samma cells förälder/barn-par — ev/konsolideringsnot). WACC 0,69 % = universumets lägsta dokumenterade räntenivå-miljö (BNP 1,17 klassen). Bankkonvention: EV/FCF/skuld-EK/räntetäckning null, fcf-serien bär insättningsströmmar (BNP-noten). Kalenderår, EUR hela vägen. Nästa rapp 2026-11-05.",
});
if (!har("GLE.PA")) rader.push({
  ticker: "GLE.PA", namn: "Société Générale S.A.", bransch: "finans", land: "Frankrike", valuta: "EUR",
  kallor: [
    { namn: "StockAnalysis", hamtat: "2026-09-20", url: "https://stockanalysis.com/quote/epa/GLE/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/ + /financials/balance-sheet/)",
      paranoid: "EURONEXT-PARIS-PRIMÄRNOTING i EUR (BNP.PA-precedensen; S&P-underlag, close 2026-09-18 17:30 CEST): pris 74,16 EUR, mcap 52,64 mdr EUR — TRE AKTIENTALSYTOR: översikt 725,17 M · BS-TTM 731,23 M · BS-FY2025 754,89 M (återköpen −4,82 % YoY gör fönstret rörligt; identitet 74,16×731,23 = 54,2 mdr = +3,0 % mot mcap-fältet, dokumenterat), 52-v 51,98–84,82 (+42,9 % från botten — cellens största ettårsrörelse); P/E 9,56 (aktiebas 74,16÷7,59 = 9,77 = +2,2 % — viktat aktiesnitt i källans EPS-bas; dokumenterat) forward 8,56 ⇒ prognosTillväxt +11,7 % TTE (PEG spår 0,82; källans fält 0,55 på 3-års EPS ~17,4 %/år — baserna dokumenterade), P/B 0,65 (52,64÷80,55 = 0,654 EXAKT), PS 2,02; EV n/a (BANK — kassa 716,8 mdr mot skuld 354,3 mdr = NETTKASSA 362,6 mdr EUR, insättarnas pengar; MUFG/BNP-konventionen: EV/FCF/skuld-EK/räntetäckning null); marginaler TTM: operating 34,43 % netto 24,67 % (statistics exkl-minoritetsbas) mot financials-kvoten 5 717÷26 056 = 21,9 % (BAS-SPLITTRAN, fältet bär statistics); ROE 9,45 % WACC 1,24 %; equity 80,55 mdr, BVPS 97,98; TTM (M EUR): rev 26 056 (+0,6 %) netto 5 717 (+17,6 %) EPS 7,59 (+27,3 %); FY-serier kalenderår (M EUR): rev 25 722→25 508→24 079→25 258→25 777 (endpoint +0,05 %/år PLATT — banan dokumenterad nedan), netto 5 051→1 229→1 735→3 480→5 282 (endpoint +1,1 %/år); fcf-serien 14 540→29 502→25 556→−21 531→−29 009 (BANK-OCF-ARTEFAKTEN, fältet fcfYield null); utdelning 1,61 EUR (2,22 %) DPS-trappa 1,65→1,70→0,90→1,09→1,61 (utdelningens Ryssland-tapp och återuppbyggnad i EN serie) payout aktiebas 21,2 % (försiktig återgång); återköp 2 280 M EUR TTM (buyback-yield 4,3 % — ÅTERKÖPSMASKINEN; 2 892 M FY2021 och 3 073 M FY2025 i serien); effektiv skatt 20,03 %; beta 0,97; institutions 60,76 % insiders 0,03 %; anställda 110 000; nästa rapp Q3 2026-11-04" },
    { namn: "Yahoo Finance (chart-API)", hamtat: "2026-09-20", url: "https://query1.finance.yahoo.com/v8/finance/chart/GLE.PA",
      paranoid: "paranoid kurskoll: Yahoo 09-16 73,67 EUR; 09-17/09-18 NULL (datalucka) medan SA bär 09-18 close 74,16; Yahoo bandet 09-11 74,72/09-14 73,44/09-15 72,76/09-16 73,67 kalibrerar (0,7–1,9 % fönster); v7-quote Unauthorized (dokumenterat)" },
  ],
  hamtat: "2026-09-20",
  pris: 74.16, marknadsKapitalMdr: 52.64,
  tillvaxt: { omsattningCAGR5ar: 0.0005, resultatCAGR5ar: 0.0112, omsattningTillvaxtTTM: 0.0064, prognosTillvaxt: 0.1168 },
  lonksamhet: { roe: 0.0945, roic: null, bruttoMarginal: null, ebitMarginal: 0.3443, nettoMarginal: 0.2467, fcfMarginal: null },
  stabilitet: { skuldEgenkapital: null, rantaTackning: null, fcfPositivaSenaste5: null, kassaManaderBurnRate: null, nyemissionerSenaste5ar: null },
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: null },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
  vardering: { pe: 9.56, pb: 0.65, evEbit: null, peg: 0.82, fcfYield: null, egenKapitalMultipl: 0.65 },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: { ar: ["2021", "2022", "2023", "2024", "2025"], omsattning: [25722000000, 25508000000, 24079000000, 25258000000, 25777000000], resultat: [5051000000, 1229000000, 1735000000, 3480000000, 5282000000], egetKapital: [], fcf: [14540000000, 29502000000, 25556000000, -21531000000, -29009000000] },
  notering: "DIPOCH ÅTERKOMST I EN FEMÅRSSERIE — SocGens netto 5 051 → 1 229 → 1 735 → 3 480 → 5 282 M EUR är cellens renaste cyclicala båge: FY2022-botten (Ryssland-exiten: Rosbank-avyttringen + −3,3 mdr engångseffekt) HALVERADE nettot på i princip PLATT intäkt (25 508 mot 25 722 — endpoint-CAGR +0,05 %/år dokumenterar att volymen aldrig var problemet), därefter FYERNA 3 480/5 282 med TTM 5 717 (+17,6 %): dip/rekord-samma-bolag-pedagogiken (2914.T-familjen). UTDELNINGENS TAPP OCH ÅTERKÖPSMASKINEN: DPS 1,70 → 0,90 (FY2022-utdelningen) → 1,61 med payout aktiebas 21,2 % — försiktig återgång — medan ÅTERKÖPEN bär kapitalåterkomsten 2 280 M EUR TTM (buyback-yield 4,3 %, aktieantalet −4,8 % YoY = snabbaste i cellen): utdelning kontra återköp som KAPITALSTRATEGI-läxa (JT:s spegelbild). KVARTILPLACERING: P/E 9,56/P/B 0,65 = cellens nedre kvartil par med ACA (BNP 0,80 ovan — tre franska banker under bok, P/B-konventionens femte ben: RY 2,72 · HSBA 1,77 · ITUB 2,17 · BNP 0,80 · GLE 0,65). 52-v +42,9 % från botten = cellens största rörelse (dip-återkomsten prissatt). Bankkonvention som ACA/BNP (EV/FCF/skuld-EK null, fcf-serien artefaktbärare). Kalenderår, EUR hela vägen. Nästa rapp 2026-11-04.",
});
if (!har("AMUN.PA")) rader.push({
  ticker: "AMUN.PA", namn: "Amundi S.A.", bransch: "finans", land: "Frankrike", valuta: "EUR",
  kallor: [
    { namn: "StockAnalysis", hamtat: "2026-09-20", url: "https://stockanalysis.com/quote/epa/AMUN/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/ + /financials/balance-sheet/)",
      paranoid: "EURONEXT-PARIS-PRIMÄRNOTING i EUR; S&P-underlag, close 2026-09-18 17:30 CEST: pris 92,25 EUR, mcap 18,47 mdr EUR (aktiebas 92,25×201,58 M = 18,60 mdr = +0,7 % — tightaste fönstret i leveransen), 52-v 60,90–97,70 (+42,3 %-året enligt mcap-ytan); P/E 14,02 (aktiebas 92,25÷6,54 = 14,11 = +0,6 % EPS-rundning) forward 11,87 ⇒ prognosTillväxt +18,1 % TTE (PEG spår 0,77; källans fält 1,75 på 3-års EPS ~8,0 %/år — TTE-konventionen bär), P/B 1,47 (18,47÷12,477 = 1,479 EXAKT), PS 2,57, EV/EBIT 7,19 (källans fält på justerad EBIT-bas ≈1 979 M; replik 14 230÷1 642 = 8,67 = +20,6 % — VALE/BUD-familjen, fältet bär källans), EV/EBITDA 6,81, EV 14,23 mdr UNDER mcap (NETTKASSA 4,29 mdr — kassa 23,85 mot skuld 19,56, kundmedel i balansen); marginaler TTM: brutto 49,42 % EBIT 22,82 % netto 18,75 % FCF 34,02 % (fcfYield 13,23 % — FÖRVALTAREKONVENTIONEN BLK/AXA: fält förs, kundmedelsflöden kan ligga i OCF-ytan, dokumenterat); ROE 10,97 % ROIC 13,12 % MOT WACC 5,31 % (spread +7,8 pp — förvaltarens kapital är kundernas, BLK +0,11 pp:s SPEGELBILD på ren drift); skuld/EK 1,56 räntetäckning 11,27×; equity 12,53 mdr BVPS 61,90; aktier 201,58 M (+0,45 % YoY — oförändrad bas); TTM (M EUR): rev 7 186 (+5,2 %) netto 1 347 (−19,2 %) EPS 6,54; FY-serier kalenderår (M EUR): rev 5 923→5 980→5 995→6 656→6 799 (+3,5 %/år), netto 1 369→1 074→1 165→1 305→1 592 (+3,8 %/år endpoint; FY2022-dipp = räntechocken på förvaltningsavgifternas bas), ek 10 671→12 655, fcf 1 908→−234→1 490→1 522→1 728 (4/5 positiva); bruttomarginalserie 53,81→52,01→53,82→53,78→51,45 % (medel 52,97 ± 2,37 pp); utdelning 4,25 EUR (4,64 %) DPS 4,10→4,10→4,25→4,25 payout 65,0 % aktiebas; återköp 278,91 M TTM; effektiv skatt 26,54 %; beta 1,11 (cellens högsta — AUM följer börsen, BLK 1,43-klassen); institutions 9,84 % (LÅGT: moderbolaget Crédit Agricole äger ~70 % — institutionsfönstret räknar bara fritt float; ACA-länken dokumenterad i båda rader); anställda 5 400; nästa rapp Q3 2026-11-06" },
    { namn: "Yahoo Finance (chart-API)", hamtat: "2026-09-20", url: "https://query1.finance.yahoo.com/v8/finance/chart/AMUN.PA",
      paranoid: "paranoid kurskoll: Yahoo 09-18 91,65 mot SA 09-18 92,25 = 0,65 % band (tight); Yahoo-serien 09-11 94,55/09-14 93,35/09-15 90,40/09-16 90,75 kalibrerar nivån; v7-quote Unauthorized (dokumenterat)" },
  ],
  hamtat: "2026-09-20",
  pris: 92.25, marknadsKapitalMdr: 18.47,
  tillvaxt: { omsattningCAGR5ar: 0.0351, resultatCAGR5ar: 0.0384, omsattningTillvaxtTTM: 0.0521, prognosTillvaxt: 0.1811 },
  lonksamhet: { roe: 0.1097, roic: 0.1312, bruttoMarginal: 0.4942, ebitMarginal: 0.2282, nettoMarginal: 0.1875, fcfMarginal: 0.3402 },
  stabilitet: { skuldEgenkapital: 1.56, rantaTackning: 11.27, fcfPositivaSenaste5: 4, kassaManaderBurnRate: null, nyemissionerSenaste5ar: null },
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: null },
  moat: { bruttoMarginalMedel5ar: 52.97, bruttoMarginalSpread5ar: 2.37, roeMedel5ar: null },
  vardering: { pe: 14.02, pb: 1.47, evEbit: 7.19, peg: 0.77, fcfYield: 0.1323, egenKapitalMultipl: 1.47 },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: { ar: ["2021", "2022", "2023", "2024", "2025"], omsattning: [5923000000, 5980000000, 5995000000, 6656000000, 6799000000], resultat: [1369000000, 1074000000, 1165000000, 1305000000, 1592000000], egetKapital: [10671000000, 11026000000, 11369000000, 12003000000, 12655000000], fcf: [1908000000, -233980000, 1490000000, 1522000000, 1728000000] },
  notering: "AUM-EKONOMINS FRANSKA LÄROBOK — Europas största kapitalförvaltare (grundad 2010 ur Crédit Agricole Asset Management + Société Générale AM — CELLENS TVÅ ANDRA RADER ÄR ITS FÖRÄLDRAR: ACA äger ~70 %, GLE sålde sin andel vid fusionen) = universumets första rad där två syskonrader är bolagets ursprung: förälder/barn-länken ACA→AMUN i samma kvartilsvy är minoritetspedagogikens renaste fall (free float ~30 %, institutionsandelen 9,84 % speglar bara det fria). INTÄKTEN ÄR AVGIFTER PÅ ANDRAS KAPITAL: bruttomarginal 52,97 % ± 2,37 pp fem år utan fysisk produkt (BLK 48,2 %-familjen), capex 107 M EUR = 1,5 % av intäkten ⇒ FCF-marginal 34,0 % och fcfYield 13,2 % — men TTM-nettot −19,2 % på +5,2 % intäkt = performancefee-året svängde (2025:s marknadsfall i fönstret), FY-banan +3,8 %/år stabil. ROIC 13,12 MOT WACC 5,31 = +7,8 pp (BLK:s +0,11 pp spegelbild: förvaltaren utan bankbalans). KVARTILPLACERING: P/E 14,02 = cellens övre halva (över BNP/ACA/GLE-bankarna, under AXA-försäkringens arketyper) — cellens fem arketyper i EN multiplextrappa: GLE 9,56 · ACA 8,99 · BNP 8,72 (bank under bok) → AMUN 14,02 (förvaltare på 1,5× bok) → AXA 12,07 (försäkring emellan). DPS 4,25 EUR (4,64 %) payout 65 %. Beta 1,11. Kalenderår, EUR hela vägen. Nästa rapp 2026-11-06.",
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
const MINA = ["ACA.PA", "GLE.PA", "AMUN.PA"];
const fore = efter.filter((b) => !MINA.includes(b.ticker));
for (const [namn, arr] of [["TOTALT före", fore], ["TOTALT efter", efter], ["finans före", fore.filter((b) => b.bransch === "finans")], ["finans efter", efter.filter((b) => b.bransch === "finans")]]) {
  const pe = statP(arr, (b) => b.vardering?.pe);
  const pb = statP(arr, (b) => b.vardering?.pb);
  const ebit = statP(arr, (b) => b.lonksamhet?.ebitMarginal);
  const fcf = statP(arr, (b) => b.lonksamhet?.fcfMarginal);
  console.log(`${namn}: n=${arr.length} · P/E ${r1(pe.median)} (kv ${r1(pe.p25)}–${r1(pe.p75)}, n ${pe.n}) · P/B ${r1(pb.median)} · EBIT ${r1(ebit.median === null ? null : ebit.median * 100)} % · FCF ${r1(fcf.median === null ? null : fcf.median * 100)} %`);
}
const cell = efter.filter((b) => b.land === "Frankrike" && b.bransch === "finans");
const cellPe = statP(cell, (b) => b.vardering?.pe);
console.log(`CELL Frankrike/finans: ${cell.length} rader, P/E mätbara ${cellPe.n} — median ${r1(cellPe.median)} kv ${r1(cellPe.p25)}–${r1(cellPe.p75)} (landsidans tal vid nästa bygge — GRÄNSREGEL: ≥5 mätta publiceras)`);
const cellPb = statP(cell, (b) => b.vardering?.pb);
const cellEbit = statP(cell, (b) => b.lonksamhet?.ebitMarginal);
console.log(`CELL P/B ${r1(cellPb.median)} (kv ${r1(cellPb.p25)}–${r1(cellPb.p75)}) · EBIT ${r1(cellEbit.median === null ? null : cellEbit.median * 100)} % (kv ${r1(cellEbit.p25 === null ? null : cellEbit.p25 * 100)}–${r1(cellEbit.p75 === null ? null : cellEbit.p75 * 100)})`);
const totPeE = statP(efter, (b) => b.vardering?.pe);
console.log(`UNIVERSUMJÄMFÖRELSE: cellens median ${r1(cellPe.median)} mot universumets ${r1(totPeE.median)} — finans-Frankrikes diskont i ett tal`);
console.log(`CELLRADERNA: ${cell.map((b) => b.ticker + " " + (b.vardering?.pe ?? "null")).join(" · ")}`);
