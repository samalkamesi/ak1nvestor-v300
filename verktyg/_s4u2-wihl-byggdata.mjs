#!/usr/bin/env node
/**
 * _s4u2-wihl-byggdata.mjs — beräkningsmotor för Wihlborgs Q3-2026-läspaketet.
 * Spår 4 s4-u2 (manifest auto-s4-1789931110711).
 *
 * Källor:
 *  K1 = Wihlborgs rapporttal, sökverifierade 2026-09-20 (wihlborgs.se/Cision/Nasdaq):
 *       Q1-26 (2026-04-21), jan-jun-26 (2026-07-06), jan-sep-25 (2025-10-23),
 *       årsslut-25 (2026-02-10), årsslut-23 (2024-02-13), kallelse årsstämma (2026-03-16).
 *  K2 = bolagsuniversum WIHL.ST (data/portfolj-system/bolagsunivers.json, insamling 2026-09-03).
 *  K3 = medianer/rang ur samma fil (237 poster, 17 fastighet).
 *
 * ABORT-grind: varje inkonsistens stoppar skrivning till disk — inget felaktigt
 * tal når paketet. Körs alltid FÖRE paketskrivning.
 */
import { readFileSync, writeFileSync } from "node:fs";

const abort = (m) => { console.error("ABORT: " + m); process.exit(1); };

// ── K1: rapporttal (dokumenterade, sökverifierade 2026-09-20) ────────────────
const K1 = {
  // hyresintäkter per kvartal, Mkr. Q1-25/Q3-25/Q1-26/Q2-26 dokumenterade;
  // Q2-25 och Q4-25 härledda (se grinds kontroller mot periodsummor).
  hyrQ: { q1_25: 1045, q2_25: 1097, q3_25: 1101, q4_25: 1111, q1_26: 1150, q2_26: 1174 },
  h1_25_hyr: 2142, jansep_25_hyr: 3243, helar_25_hyr: 4354, helar_24_hyr: 4174,
  h1_26_hyr: 2324,
  // driftsöverskott, Mkr. Q1-25/Q3-25/Q1-26/Q2-26 dokumenterade; Q2-25/Q4-25 härledda.
  doQ: { q1_25: 731, q2_25: 813, q3_25: 790, q4_25: 773, q1_26: 800, q2_26: 864 },
  h1_25_do: 1544, jansep_25_do: 2334, helar_25_do: 3107, h1_26_do: 1664,
  // vinst efter skatt, Mkr. Q1-25/Q1-26 dokumenterade; Q2-25/Q2-26 härledda ur H1-summor.
  vinstQ: { q1_25: 431, q2_25: 452, q1_26: 548, q2_26: 302 },
  h1_25_vinst: 883, h1_26_vinst: 850,
  epsH1_26: 2.76, epsH1_25: 2.87, epsQ1_26: 1.78, epsQ1_25: 1.40,
  forvResultat: { q1_26: 520, h1_26: 1077, h1_25: 987 },
  // övriga rapportfakta
  utdelning_25: 3.30, agmDatum: "2026-04-22",
  vakans: { kontorHandel_26: 89, kontorHandel_25: 91, logistik_26: 87, logistik_25: 88 },
  nettouthyrningQ2_26: 5,
  forvarvMdr: 13.3, fastighetsBokvardMdr: 64, hyresvardeMdr: 5.0,
  rappdag_26: "2026-10-21", rappdag_25: "2025-10-23",
  q1_26_rappdag: "2026-04-21", q2_26_rappdag: "2026-07-06",
  arsv_27: "2027-02-09", q1_27: "2027-04-26",
  doTillvaxt_23: 0.19, do_23: 2763, forv_23: 1747, forv_22: 1861,
};

// ── K2: universumposten ─────────────────────────────────────────────────────
const uni = JSON.parse(readFileSync("/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json", "utf8"));
const arr = Array.isArray(uni) ? uni : (uni.bolag || uni.poster || []);
const K2 = arr.find((x) => x.ticker === "WIHL.ST");
if (!K2) abort("universumpost WIHL.ST saknas");
if (K2.pris !== 79.65) abort("universumpost WIHL.ST pris ändrat: " + K2.pris);
if (K2.vardering.pb !== 1.013) abort("P/B-fält ändrat: " + K2.vardering.pb);
if (K2.vardering.pe !== 11.203) abort("P/E-fält ändrat: " + K2.vardering.pe);
if (K2.golv.vardePerAktie !== 78.66) abort("golv-fält ändrat: " + K2.golv.vardePerAktie);

// ── K3: medianer och rang ur 237-filen ──────────────────────────────────────
const fast = arr.filter((x) => x.bransch === "fastighet");
if (fast.length !== 17) abort("fastighetsgrenen != 17: " + fast.length);
if (arr.length !== 237) abort("universumet != 237: " + arr.length);
const med = (vals) => {
  const v = vals.filter((x) => x != null).sort((a, b) => a - b);
  if (!v.length) return null;
  return v.length % 2 ? v[(v.length - 1) / 2] : (v[v.length / 2 - 1] + v[v.length / 2]) / 2;
};
const f = (x, k) => (x.vardering ? x.vardering[k] : null);
const rangFranTopp = (vals, mine) => {
  const v = vals.filter((x) => x != null).sort((a, b) => b - a); // fallande
  return 1 + v.indexOf(mine);
};
const K3 = {
  nFast: fast.length, nUni: arr.length,
  medFast: {
    pb: med(fast.map((x) => f(x, "pb"))), pe: med(fast.map((x) => f(x, "pe"))),
    roe: med(fast.map((x) => x.lonksamhet && x.lonksamhet.roe)),
    ebit: med(fast.map((x) => x.lonksamhet && x.lonksamhet.ebitMarginal)),
    netto: med(fast.map((x) => x.lonksamhet && x.lonksamhet.nettoMarginal)),
    skuldEk: med(fast.map((x) => x.stabilitet && x.stabilitet.skuldEgenkapital)),
    fcfy: med(fast.map((x) => f(x, "fcfYield"))),
  },
  medUni: {
    pb: med(arr.map((x) => f(x, "pb"))), pe: med(arr.map((x) => f(x, "pe"))),
    roe: med(arr.map((x) => x.lonksamhet && x.lonksamhet.roe)),
    ebit: med(arr.map((x) => x.lonksamhet && x.lonksamhet.ebitMarginal)),
    netto: med(arr.map((x) => x.lonksamhet && x.lonksamhet.nettoMarginal)),
    skuldEk: med(arr.map((x) => x.stabilitet && x.stabilitet.skuldEgenkapital)),
  },
  rang: {
    pb: rangFranTopp(fast.map((x) => f(x, "pb")), K2.vardering.pb),           // högt = högt P/B
    pbStig: 1 + fast.map((x) => f(x, "pb")).filter((x) => x != null).sort((a, b) => a - b).indexOf(K2.vardering.pb),
    roe: rangFranTopp(fast.map((x) => x.lonksamhet && x.lonksamhet.roe), K2.lonksamhet.roe),
    ebit: rangFranTopp(fast.map((x) => x.lonksamhet && x.lonksamhet.ebitMarginal), K2.lonksamhet.ebitMarginal),
    fcfy: rangFranTopp(fast.map((x) => f(x, "fcfYield")), K2.vardering.fcfYield),
    skuldEk: rangFranTopp(fast.map((x) => x.stabilitet && x.stabilitet.skuldEgenkapital), K2.stabilitet.skuldEgenkapital),
  },
  nPb: fast.map((x) => f(x, "pb")).filter((x) => x != null).length,
  nRoe: fast.map((x) => x.lonksamhet && x.lonksamhet.roe).filter((x) => x != null).length,
  nFcfy: fast.map((x) => f(x, "fcfYield")).filter((x) => x != null).length,
  under_095: fast.map((x) => f(x, "pb")).filter((x) => x != null && x < 0.95).length,
  pegMedianUni: med(arr.map((x) => x.vardering && x.vardering.peg).filter((x) => x != null)),
  nPeg: arr.map((x) => x.vardering && x.vardering.peg).filter((x) => x != null).length,
};

// ── M: härledda mått ────────────────────────────────────────────────────────
const r2 = (x) => Math.round(x * 100) / 100;
const r3 = (x) => Math.round(x * 1000) / 1000;
const r4 = (x) => Math.round(x * 10000) / 10000;
const M = {};

// kapital och kurs
M.kurs = K2.pris;
M.aktietal = K2.marknadsKapitalMdr * 1000 / K2.pris;          // M aktier
M.ek = K2.marknadsKapitalMdr / K2.vardering.pb;               // mdr
M.ekPerAktie_vgC = M.ek * 1000 / M.aktietal;                  // väg C: mcap/P/B → per aktie
M.ekPerAktie_vgA = K2.pris / K2.vardering.pb;                 // väg A: kurs/P/B
M.ekPerAktie_vgB = K2.golv.vardePerAktie;                     // väg B: golv-fältet
M.kapitalSpann = Math.max(M.ekPerAktie_vgA, M.ekPerAktie_vgB, M.ekPerAktie_vgC) -
                 Math.min(M.ekPerAktie_vgA, M.ekPerAktie_vgB, M.ekPerAktie_vgC);
M.kapitalSpannPct = M.kapitalSpann / M.ekPerAktie_vgB;
M.premieMotBokfort = (K2.pris - K2.golv.vardePerAktie) / K2.golv.vardePerAktie; // +, kurs ÖVER golv
M.golvMarginalFalt = K2.golv.marginal;                                   // −0,0126 = kurs över golv

// identitetstest P/E = P/B / ROE
M.peIdentitet = K2.vardering.pb / K2.lonksamhet.roe;
M.peAvvikelse = K2.vardering.pe / M.peIdentitet - 1;
M.pbUrvant = K2.vardering.pe * K2.lonksamhet.roe;

// PEG
M.pegKonvention = K2.vardering.pe / (K2.tillvaxt.prognosTillvaxt * 100);
M.pegKvot = K2.vardering.peg / M.pegKonvention;

// serier (universumet lagrar kronor; paketet räknar Mkr)
const S = { ...K2.serier, omsattning: K2.serier.omsattning.map((v) => v / 1e6), resultat: K2.serier.resultat.map((v) => v / 1e6) };
M.cagrOms = Math.pow(S.omsattning[3] / S.omsattning[0], 1 / 3) - 1;
M.cagrRes = Math.pow(S.resultat[3] / S.resultat[0], 1 / 3) - 1;
M.stegOms = [1, 2, 3].map((i) => S.omsattning[i] / S.omsattning[i - 1] - 1);
M.resKvot = S.resultat.map((r, i) => r / S.omsattning[i]);
M.nettoBokslut25 = S.resultat[3] / S.omsattning[3];

// fönster: trailing via P/E vs bokslut
M.epsImplicit = K2.pris / K2.vardering.pe;                    // kr
M.vinstTrailing = M.epsImplicit * M.aktietal;                 // Mkr
M.peBokslut = (K2.marknadsKapitalMdr * 1000) / S.resultat[3];
M.roeBokslut = S.resultat[3] / (M.ek * 1000);

// FCF-fönster
M.fcfBokslut25 = S.omsattning[3] * K2.lonksamhet.fcfMarginal; // Mkr
M.fcfYieldBokslut = M.fcfBokslut25 / (K2.marknadsKapitalMdr * 1000);

// belåningsgrammatik
M.skulder = M.ek * K2.stabilitet.skuldEgenkapital;            // mdr
M.balans = M.ek + M.skulder;                                  // mdr (ungefärlig, utan övrigt)
M.belanGrad = M.skulder / M.balans;
M.roicProxyBokslut = (S.omsattning[3] * K2.lonksamhet.ebitMarginal) / (M.balans * 1000);

// kvartalskedjan
M.kedjaHyr = [K1.hyrQ.q1_25, K1.hyrQ.q2_25, K1.hyrQ.q3_25, K1.hyrQ.q4_25, K1.hyrQ.q1_26, K1.hyrQ.q2_26];
M.rullande4Hyr = K1.hyrQ.q3_25 + K1.hyrQ.q4_25 + K1.hyrQ.q1_26 + K1.hyrQ.q2_26;
M.kvartalSteg = [1, 2, 3, 4, 5].map((i) => M.kedjaHyr[i] / M.kedjaHyr[i - 1] - 1);
M.hyrVaxtQ1 = K1.hyrQ.q1_26 / K1.hyrQ.q1_25 - 1;
M.hyrVaxtQ2 = K1.hyrQ.q2_26 / K1.hyrQ.q2_25 - 1;
M.doKedja = [K1.doQ.q1_25, K1.doQ.q2_25, K1.doQ.q3_25, K1.doQ.q4_25, K1.doQ.q1_26, K1.doQ.q2_26];
M.rullande4Do = K1.doQ.q3_25 + K1.doQ.q4_25 + K1.doQ.q1_26 + K1.doQ.q2_26;
M.doMarginalKvartal = M.doKedja.map((d, i) => d / M.kedjaHyr[i]);
M.vinstVaxtQ1 = K1.vinstQ.q1_26 / K1.vinstQ.q1_25 - 1;
M.vinstVaxtQ2 = K1.vinstQ.q2_26 / K1.vinstQ.q2_25 - 1;

// utdelning
M.direktavkastning = K1.utdelning_25 / K2.pris;

// scenarioruta på 2025: intäkter 4 354, EBIT-marginal 71,09 %
M.scenBas = { oms: S.omsattning[3], m: K2.lonksamhet.ebitMarginal };
M.scen = { rad: [0.97, 1, 1.03].map((k) => k * M.scenBas.oms), kol: [K2.lonksamhet.ebitMarginal - 0.01, K2.lonksamhet.ebitMarginal, K2.lonksamhet.ebitMarginal + 0.01] };
M.scenCeller = M.scen.rad.map((o) => M.scen.kol.map((m) => r2(o * m)));
M.scenEbitBas = M.scenBas.oms * M.scenBas.m;
M.scenPpVikt = M.scenBas.oms * 0.01;
M.scenOmsVikt = M.scenBas.oms * 0.03;
M.scenKvot = M.scenOmsVikt / M.scenPpVikt;
M.marginalvikt = 1 / (3 * M.scenBas.m);

// EBIT-fältetskvot mot driftsöverskott 2025
M.ebitFalt25 = S.omsattning[3] * K2.lonksamhet.ebitMarginal;

// ── GRINDER: konsistens innan disk ──────────────────────────────────────────
const E = [];
const eq = (a, b, tol, namn) => { if (Math.abs(a - b) > tol) E.push(`${namn}: ${a} ≠ ${b} (tol ${tol})`); };

// kvartalskedjans summor mot dokumenterade periodtal
eq(K1.hyrQ.q1_25 + K1.hyrQ.q2_25, K1.h1_25_hyr, 1, "H1-25 hyr summa");
eq(K1.hyrQ.q1_26 + K1.hyrQ.q2_26, K1.h1_26_hyr, 1, "H1-26 hyr summa");
eq(K1.h1_25_hyr + K1.hyrQ.q3_25, K1.jansep_25_hyr, 1, "jan-sep-25 hyr summa");
eq(K1.jansep_25_hyr + K1.hyrQ.q4_25, K1.helar_25_hyr, 1, "helår-25 hyr summa");
eq(K1.doQ.q1_25 + K1.doQ.q2_25, K1.h1_25_do, 1, "H1-25 driftsöverskott summa");
eq(K1.doQ.q1_26 + K1.doQ.q2_26, K1.h1_26_do, 1, "H1-26 driftsöverskott summa");
eq(K1.h1_25_do + K1.doQ.q3_25, K1.jansep_25_do, 1, "jan-sep-25 driftsöverskott summa");
eq(K1.jansep_25_do + K1.doQ.q4_25, K1.helar_25_do, 1, "helår-25 driftsöverskott summa");
eq(K1.vinstQ.q1_25 + K1.vinstQ.q2_25, K1.h1_25_vinst, 1, "H1-25 vinst summa");
eq(K1.vinstQ.q1_26 + K1.vinstQ.q2_26, K1.h1_26_vinst, 1, "H1-26 vinst summa");
// dokumenterade tillväxtprocent
eq(M.hyrVaxtQ2, 0.07, 0.005, "Q2 hyresväxt mot dokumenterad +7 %");
eq(M.hyrVaxtQ1, 0.10, 0.005, "Q1 hyresväxt mot dokumenterad +10 %");
// universumets omsättningsserie == rapporternas hyresintäkter (begreppsgap 0)
eq(S.omsattning[3], K1.helar_25_hyr, 0.5, "universum-omsättning 2025 == hyresintäkter 2025");
eq(S.omsattning[2], K1.helar_24_hyr, 0.5, "universum-omsättning 2024 == hyresintäkter 2024");
// golv-identitet: marginalfältet = (golv − kurs)/golv
eq(M.golvMarginalFalt, (K2.golv.vardePerAktie - K2.pris) / K2.golv.vardePerAktie, 0.0005, "golv-marginalfält");
// kapital-trevägar inom 0,2 %
if (M.kapitalSpannPct > 0.002) E.push(`kapitaltreff spänn ${M.kapitalSpannPct} > 0,2 %`);
// identitetstest inom 3 % (Essity-klassen)
if (Math.abs(M.peAvvikelse) > 0.03) E.push(`identitet P/E avvikelse ${M.peAvvikelse} > 3 %`);
// belåningskonsistens: balansomslutning 55–70 mdr mot bokfört fastighetsvärde ~64
if (M.balans < 55 || M.balans > 70) E.push(`balansomslutning ${M.balans} mdr utanför 55–70`);
// EPS-aktietal: vinst/EPS ≈ aktietal ur mcap/kurs (inom 1 %)
eq(K1.h1_26_vinst / K1.epsH1_26, M.aktietal, M.aktietal * 0.01, "aktietal EPS-väg");

if (E.length) { console.error("GRIND-FEL:"); for (const e of E) console.error("  - " + e); process.exit(1); }

// ── utdata ──────────────────────────────────────────────────────────────────
const ut = {
  genererad: new Date().toISOString(), agent: "s4-u2", manifest: "auto-s4-1789931110711",
  K1, K2diff: {
    pris: K2.pris, mcap: K2.marknadsKapitalMdr, vardering: K2.vardering, golv: K2.golv,
    lonksamhet: K2.lonksamhet, stabilitet: K2.stabilitet, tillvaxt: K2.tillvaxt, serier: K2.serier,
  }, K3,
  M: {
    aktietal: r2(M.aktietal), ek: r2(M.ek),
    ekPerAktie_vgA: r2(M.ekPerAktie_vgA), ekPerAktie_vgB: r2(M.ekPerAktie_vgB), ekPerAktie_vgC: r2(M.ekPerAktie_vgC),
    kapitalSpann: r2(M.kapitalSpann), kapitalSpannPct: r4(M.kapitalSpannPct),
    premieMotBokfort: r4(M.premieMotBokfort),
    peIdentitet: r3(M.peIdentitet), peAvvikelse: r4(M.peAvvikelse), pbUrvant: r4(M.pbUrvant),
    pegKonvention: r3(M.pegKonvention), pegKvot: r2(M.pegKvot),
    cagrOms: r4(M.cagrOms), cagrRes: r4(M.cagrRes), stegOms: M.stegOms.map(r4), resKvot: M.resKvot.map(r4),
    nettoBokslut25: r4(M.nettoBokslut25),
    epsImplicit: r3(M.epsImplicit), vinstTrailing: r2(M.vinstTrailing), peBokslut: r3(M.peBokslut), roeBokslut: r4(M.roeBokslut),
    fcfBokslut25: r2(M.fcfBokslut25), fcfYieldBokslut: r4(M.fcfYieldBokslut),
    skulder: r2(M.skulder), balans: r2(M.balans), belanGrad: r4(M.belanGrad), roicProxyBokslut: r4(M.roicProxyBokslut),
    rullande4Hyr: M.rullande4Hyr, rullande4Do: M.rullande4Do,
    kvartalSteg: M.kvartalSteg.map(r4), hyrVaxtQ1: r4(M.hyrVaxtQ1), hyrVaxtQ2: r4(M.hyrVaxtQ2),
    doMarginalKvartal: M.doMarginalKvartal.map(r4),
    vinstVaxtQ1: r4(M.vinstVaxtQ1), vinstVaxtQ2: r4(M.vinstVaxtQ2),
    direktavkastning: r4(M.direktavkastning),
    scenBas: { oms: M.scenBas.oms, m: r4(M.scenBas.m) }, scenRad: M.scen.rad.map(r2), scenKol: M.scen.kol.map(r4),
    scenCeller: M.scenCeller, scenEbitBas: r2(M.scenEbitBas), scenPpVikt: r2(M.scenPpVikt), scenOmsVikt: r2(M.scenOmsVikt),
    scenKvot: r2(M.scenKvot), marginalvikt: r4(M.marginalvikt), ebitFalt25: r2(M.ebitFalt25),
  },
};
writeFileSync("/home/ak1a/AK1/verktyg/_s4u2-wihl-data.json", JSON.stringify(ut, null, 1) + "\n");

console.log("GRÖN — alla grindar passerade. Utdata: verktyg/_s4u2-wihl-data.json");
console.log(`  kapitaltreff A/B/C: ${r2(M.ekPerAktie_vgA)} / ${r2(M.ekPerAktie_vgB)} / ${r2(M.ekPerAktie_vgC)} — spänn ${r2(M.kapitalSpann)} kr = ${r4(M.kapitalSpannPct)} %`);
console.log(`  premie mot bokfört: ${r4(M.premieMotBokfort)} | identitet P/E ${r3(M.peIdentitet)} mot ${K2.vardering.pe} = ${r4(M.peAvvikelse)} avvikelse`);
console.log(`  PEG konvention ${r3(M.pegKonvention)} mot källa ${K2.vardering.peg} (kvot ${r2(M.pegKvot)})`);
console.log(`  kedja hyr: ${M.kedjaHyr.join("/")} — rullande 4: ${M.rullande4Hyr} | driftsöverskott rullande: ${M.rullande4Do}`);
console.log(`  vinstväxter Q1/Q2-26: ${r4(M.vinstVaxtQ1)} / ${r4(M.vinstVaxtQ2)} | hyrväxter: ${r4(M.hyrVaxtQ1)} / ${r4(M.hyrVaxtQ2)}`);
console.log(`  scenarioruta bas EBIT ${r2(M.scenEbitBas)} | 1 pp = ${r2(M.scenPpVikt)} | 3 % = ${r2(M.scenOmsVikt)} | vikt ${r4(M.marginalvikt)}`);
console.log(`  rang: P/B ${K3.rang.pbStig}/${K3.nPb} (stigande) | ROE ${K3.rang.roe}/${K3.nRoe} | EBIT ${K3.rang.ebit}/${K3.nPb} | FCFy ${K3.rang.fcfy}/${K3.nFcfy} | skuld/EK ${K3.rang.skuldEk}/${K3.nPb}`);
