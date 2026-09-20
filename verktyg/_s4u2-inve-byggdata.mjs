#!/usr/bin/env node
/**
 * _s4u2-inve-byggdata.mjs — beräkningsmotor för Investor AB Q3-läspaketet
 * (kvartalsrapportserien paket #65, manifest auto-s4-1789908909779 s4-u2).
 *
 * KÄLLOR (hårdförankrade konstanter — allt som inte är en räkneoperation står
 * i källan; motorvärdena nedan härleds och ABORTAR vid inkonsistens):
 *  K1 = Investor AB Interim Report January–June 2026 (officiell PDF,
 *       investorab.com/media/12jpon2s/interim-report-january-june-2026.pdf,
 *       hämtad 2026-09-20, publicerad 2026-07-16 08:15 CET)
 *  K2 = bolagsuniversum INVE-B.ST (data/portfolj-system/bolagsunivers.json,
 *       insamlat 2026-09-03, Yahoo quoteSummary; MarketStack utan färsk kurs)
 *  K3 = finansgrenens medianer ur 231-postsfilen (omräknade 2026-09-20)
 *  K4 = analysbiblioteket INVE-B_ST.json (vågvalideringsdata, 2026-09-04)
 *
 * Regler: ingen gissning — varje härlett värde kedjas med explicit formel;
 * avvikelser > 0,5 % mot källans eget tal ⇒ ABORT (fånga fel FÖRE disk).
 */
import { readFileSync } from "node:fs";

const abort = (m) => { console.error("ABORT: " + m); process.exit(1); };
const sv = (x, d = 2) => x.toFixed(d).replace(".", ",");
const pct = (x, d = 1) => (x * 100).toFixed(d).replace(".", ",") + " %";

// ── K1: officiella tal ur Q2-rapporten (MSEK om ej annat sägs) ──────────────
const K1 = {
  kalender: [
    { datum: "2026-10-16", text: "Interim Management Statement January-September 2026" },
    { datum: "2026-11-04", text: "Capital Markets Update" },
    { datum: "2027-01-22", text: "Year-end report 2026" },
    { datum: "2027-04-20", text: "Interim Management Statement January-March 2027" },
    { datum: "2027-07-20", text: "Interim Report January-June 2027" },
  ],
  publicerad: "2026-07-16 08:15 CET",
  adjNav:    { "2025-12-31": 1087082, "2026-03-31": 1125062, "2026-06-30": 1214733 },
  adjNavPs:  { "2025-12-31": 355, "2026-03-31": 367, "2026-06-30": 397 },
  repNav:    { "2025-12-31": 953705, "2026-06-30": 1085862 },
  repNavPs:  { "2025-12-31": 311, "2026-06-30": 354 },
  aktierExEgna: 3063530101,
  aktierTotalt: 3068700120,
  egnaAktier: 5170019,
  mcap:      { "2026-06-30": 1225307, "2026-03-31": 1081360, "2025-12-31": 1009998 },
  kursB:     { "2026-06-30": 402.55, "2026-03-31": 354.30, "2025-12-31": 330.40 },
  adjNavSeq: { q2: { msek: 106827, pct: 9 }, h1: { msek: 144807, pct: 13 } },
  tsrQ2: { inve: 15, sixrx: 9 },
  netDebt: 23300, netDebtPrev: 23387, leverage: 1.9, leveragePrev: 2.1,
  leverageMal: "0-10 %", leverageTak: 20,
  grossCash: 28800, grossCashPrev: 27119, grossDebt: 52100, grossDebtPrev: 50507,
  utdelningsskuld: 4902,
  noterade: [
    // [namn, värde 6/30-26, värde 12/31-25, TR Q2 %, TR H1 %, ägarandel kap %]
    ["ABB", 278983, 182966, 40.2, 54.7, 14.6],
    ["Atlas Copco", 163785, 138888, 22.3, 19.6, 17.1],
    ["AstraZeneca", 94045, 88009, -2.0, 8.0, 3.3],
    ["SEB", 84699, 87230, 12.2, 5.0, 22.1],
    ["Saab", 82912, 88419, -17.5, -6.1, 30.2],
    ["Sobi", 56427, 40821, 17.2, 38.2, 34.4],
    ["Epiroc", 54882, 43325, 17.4, 27.6, 17.1],
    ["Nasdaq", 44836, 51999, -4.7, -13.6, 10.3],
    ["Wärtsilä", 38624, 34390, 7.2, 15.1, 17.7],
    ["Ericsson", 36118, 30291, 3.3, 20.9, 9.9],
    ["Electrolux", 4738, 3255, null, null, 18.5],
    ["Husqvarna", 3671, 4483, null, null, 16.8],
    ["Electrolux Professional", 2479, 3822, null, null, 20.4],
  ],
  patriciaQ2: { vardeForandring: -3, exKassa: -4, forsäljning: 6, organiskt: 7, ebitaJusterad: 16, molnlycke: 2 },
  eqt: { h1TR: -25, q2TR: -4, utdelningMsek: 455, koptAktierMsek: 349, vardeForandringQ2: -2 },
  emissionElectroluxMsek: 1701,
  sebSald: { aktier: 8000000, intaktMsek: 1520, avtalAktier: 2000000, avtalVntatMsek: 375 },
};

// ── K2: universumposten ─────────────────────────────────────────────────────
const K2 = JSON.parse(readFileSync("/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json", "utf8"))
  .find((b) => b.ticker === "INVE-B.ST");
if (!K2 || K2.pris !== 410.75) abort("universumpost INVE-B.ST saknas/ändrad pris");

// ── MOTOR: härledda tal ─────────────────────────────────────────────────────
const M = {};
M.repNavPsExact = K1.repNav["2026-06-30"] / (K1.aktierExEgna / 1e6);           // kr
M.adjNavPsExact = K1.adjNav["2026-06-30"] / (K1.aktierExEgna / 1e6);
M.kursPerRepNav = K2.pris / M.repNavPsExact;                                    // = P/B-läsartest
M.kursPerAdjNav = K2.pris / M.adjNavPsExact;
M.pbAvvikelse = M.kursPerRepNav / K2.vardering.pb - 1;                          // mot källans P/B-fält
M.premieRep = M.kursPerRepNav - 1;
M.premieAdj = M.kursPerAdjNav - 1;
M.justering = {
  msek: K1.adjNav["2026-06-30"] - K1.repNav["2026-06-30"],
  perAktie: (K1.adjNav["2026-06-30"] - K1.repNav["2026-06-30"]) / (K1.aktierExEgna / 1e6),
  andelAvRep: (K1.adjNav["2026-06-30"] - K1.repNav["2026-06-30"]) / K1.repNav["2026-06-30"],
};
M.navTrappaAdj = {
  q1: K1.adjNavPs["2026-03-31"] / K1.adjNavPs["2025-12-31"] - 1,
  q2: K1.adjNavPs["2026-06-30"] / K1.adjNavPs["2026-03-31"] - 1,
  h1: K1.adjNavPs["2026-06-30"] / K1.adjNavPs["2025-12-31"] - 1,
};
M.navTrappaRep = { h1: K1.repNavPs["2026-06-30"] / K1.repNavPs["2025-12-31"] - 1 };
M.navTotalH1 = K1.adjNav["2026-06-30"] / K1.adjNav["2025-12-31"] - 1;
M.mcapH1 = K1.mcap["2026-06-30"] / K1.mcap["2025-12-31"] - 1;
M.notSum = { nu: K1.noterade.reduce((s, x) => s + x[1], 0), prev: K1.noterade.reduce((s, x) => s + x[2], 0) };
M.notAndel = { nu: M.notSum.nu / K1.adjNav["2026-06-30"], prev: M.notSum.prev / K1.adjNav["2025-12-31"] };
M.abb = {
  andel: K1.noterade[0][1] / K1.adjNav["2026-06-30"],
  h1Varde: K1.noterade[0][1] / K1.noterade[0][2] - 1,
};
M.topp3 = (K1.noterade[0][1] + K1.noterade[1][1] + K1.noterade[2][1]) / K1.adjNav["2026-06-30"];
M.saabH1 = K1.noterade[4][1] / K1.noterade[4][2] - 1;
M.pegImplicit = K2.vardering.pe / K2.vardering.peg;   // % (källans PEG ⇒ implicit tillväxt)
M.pegPaTTM = K2.vardering.pe / K2.tillvaxt.omsattningTillvaxtTTM;
M.mcapHarlet = K2.pris * (K1.aktierExEgna / 1e6);      // mdr SEK, GS-precedensen
M.navPerMcapDiff = K1.mcap["2026-06-30"] / K1.adjNav["2026-06-30"] - 1;
M.kurs30juniPerAdj = K1.kursB["2026-06-30"] / M.adjNavPsExact - 1;
M.kurs30juniPerRep = K1.kursB["2026-06-30"] / M.repNavPsExact - 1;
M.utdPerAktie = K1.utdelningsskuld / (K1.aktierExEgna / 1e6);

// ── K3: finansmedianer (omräknade ur 231-filen 2026-09-20) ──────────────────
const univ = JSON.parse(readFileSync("/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json", "utf8"));
const fin = univ.filter((b) => b.bransch === "finans");
const stat = (f) => {
  const a = fin.map(f).filter((v) => typeof v === "number").sort((x, y) => x - y);
  const med = a.length % 2 ? a[(a.length - 1) / 2] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2;
  return { n: a.length, median: med, p25: a[Math.floor(a.length * 0.25)], p75: a[Math.ceil(a.length * 0.75) - 1] };
};
const K3 = {
  pe: stat((b) => b.vardering?.pe), pb: stat((b) => b.vardering?.pb),
  evEbit: stat((b) => b.vardering?.evEbit), peg: stat((b) => b.vardering?.peg),
  roe: stat((b) => b.lonksamhet?.roe),
};
K3.peRank = fin.filter((b) => typeof b.vardering?.pe === "number" && b.vardering.pe < K2.vardering.pe).length + 1;
K3.roeRank = fin.filter((b) => typeof b.lonksamhet?.roe === "number" && b.lonksamhet.roe > K2.lonksamhet.roe).length + 1;
K3.roeOvan = fin.filter((b) => typeof b.lonksamhet?.roe === "number" && b.lonksamhet.roe > K2.lonksamhet.roe).map((b) => b.ticker);

// ── GRINDER: konsistenskontroller (ABORT vid brott) ──────────────────────────
if (Math.abs(M.pbAvvikelse) > 0.005) abort(`P/B-paritet bruten: kurs/repNav ${sv(M.kursPerRepNav)} mot fält ${sv(K2.vardering.pb)} (avv ${pct(M.pbAvvikelse, 3)})`);
if (Math.abs(M.repNavPsExact - K1.repNavPs["2026-06-30"]) > 1) abort("repNav/aktie avviker > 1 kr mot rapportens 354");
if (Math.abs(M.adjNavPsExact - K1.adjNavPs["2026-06-30"]) > 1) abort("adjNav/aktie avviker > 1 kr mot rapportens 397");
if (Math.abs(K1.adjNavSeq.q2.pct / 100 - (K1.adjNav["2026-06-30"] - K1.adjNav["2026-03-31"] - 0) / (K1.adjNav["2026-03-31"] + 0)) > 0.02)
  console.log("NOT: Q2-sekventiell % inkl. återlagd utdelning (källans 9 %) — rådelta " + pct(K1.adjNav["2026-06-30"] / K1.adjNav["2026-03-31"] - 1) + " utan utdelning");
// Premie-konsistens: mcap/adjNAV skall stämma med B-kurs/adjNAV-per-aktie inom 1 pp per datum
// (A/B-blend kan avvika lite); isärgången H1 är SJÄLVA FYNDET — rabattvändningen.
M.premie30juni = { mcap: K1.mcap["2026-06-30"] / K1.adjNav["2026-06-30"] - 1, kurs: K1.kursB["2026-06-30"] / M.adjNavPsExact - 1 };
M.premie3112 = { mcap: K1.mcap["2025-12-31"] / K1.adjNav["2025-12-31"] - 1, kurs: K1.kursB["2025-12-31"] / K1.adjNavPs["2025-12-31"] - 1 };
M.kursH1 = K1.kursB["2026-06-30"] / K1.kursB["2025-12-31"] - 1;
if (Math.abs(M.premie30juni.mcap - M.premie30juni.kurs) > 0.01) abort("premie 6/30: mcap- och kursvägar brister isär > 1 pp");
if (Math.abs(M.premie3112.mcap - M.premie3112.kurs) > 0.01) abort("premie 12/31: mcap- och kursvägar brister isär > 1 pp");

// ── UTSKRIFT: motorns alla tal ───────────────────────────────────────────────
console.log("=== INVE-B.ST byggdata (paket #65) ===\n");
console.log("[Identitetstest]");
console.log(`  rapporterat NAV/aktie exakt : ${sv(M.repNavPsExact)} kr (rapporten: 354)`);
console.log(`  kurs 410,75 ÷ rapport NAV   : ${sv(M.kursPerRepNav, 4)}  mot universumets P/B ${sv(K2.vardering.pb, 3)}  ⇒ avvikelse ${pct(M.pbAvvikelse, 3)}`);
console.log(`  justerat NAV/aktie exakt    : ${sv(M.adjNavPsExact)} kr (rapporten: 397)`);
console.log(`  kurs ÷ justerat NAV         : ${sv(M.kursPerAdjNav, 4)}  ⇒ premie ${pct(M.premieAdj)}`);
console.log(`  premie mot rapporterat      : ${pct(M.premieRep)}`);
console.log(`  justeringsgapet             : ${M.justering.msek.toLocaleString("sv-SE")} Mkr = ${sv(M.justering.perAktie)} kr/aktie = ${pct(M.justering.andelAvRep)} av rapporterat NAV`);
console.log(`  6/30-officiellt par         : mcap/adjNAV ${pct(M.navPerMcapDiff)} · B-kurs/adj ${pct(M.kurs30juniPerAdj)} · B-kurs/rep ${pct(M.kurs30juniPerRep)}`);
console.log("\n[NAV-trappan]");
console.log(`  justerat: 355 → 367 → 397  (Q1 ${pct(M.navTrappaAdj.q1)} · Q2 ${pct(M.navTrappaAdj.q2)} · H1 ${pct(M.navTrappaAdj.h1)})`);
console.log(`  rapporterat: 311 → 354 (H1 ${pct(M.navTrappaRep.h1)}) · totalt justerat NAV H1 ${pct(M.navTotalH1)} · mcap H1 ${pct(M.mcapH1)} · B-kurs H1 ${pct(M.kursH1)}`);
console.log(`  PREMIEVÄNDNINGEN: 12/31 rabatt ${pct(M.premie3112.kurs)} (B-kurs 330,40 mot 355) → 6/30 premie ${pct(M.premie30juni.kurs)} (402,55 mot 396,51) — mcap-vägar: ${pct(M.premie3112.mcap)} → ${pct(M.premie30juni.mcap)}`);
console.log("\n[Portföljen]");
console.log(`  noterade summa: ${M.notSum.nu.toLocaleString("sv-SE")} Mkr (12/31: ${M.notSum.prev.toLocaleString("sv-SE")})`);
console.log(`  andel av justerat NAV: ${pct(M.notAndel.nu)} (12/31: ${pct(M.notAndel.prev)})`);
console.log(`  ABB: ${pct(M.abb.andel)} av justerat NAV · värdeförändring H1 ${pct(M.abb.h1Varde)} · Q2-TR ${sv(K1.noterade[0][3], 1)} %`);
console.log(`  topp-3 (ABB+Atlas Copco+AstraZeneca): ${pct(M.topp3)} av justerat NAV`);
console.log(`  Saab H1-värde: ${pct(M.saabH1)} · Q2-TR ${sv(K1.noterade[4][3], 1)} %`);
console.log("\n[PEG-rakbladet]");
console.log(`  källans PEG ${sv(K2.vardering.peg)} ⇒ implicit tillväxt ${sv(M.pegImplicit)} % (prognosTillväxt = null i universumet)`);
console.log(`  P/E på TTM-tillväxten 1,17 %: ${sv(M.pegPaTTM)}`);
console.log("\n[Börsvärde]");
console.log(`  officiellt mcap 6/30: ${K1.mcap["2026-06-30"].toLocaleString("sv-SE")} Mkr · härlet 9/3: ${sv(M.mcapHarlet, 0)} Mkr (410,75 × 3 063,53 M aktier, GS-precedensen)`);
console.log("\n[Finansmedianer n=33]");
console.log(`  P/E ${sv(K3.pe.median)} (kv ${sv(K3.pe.p25)}–${sv(K3.pe.p75)}, n ${K3.pe.n}) — INVE ${sv(K2.vardering.pe)} = rank ${K3.peRank}/${K3.pe.n} (lägst)`);
console.log(`  P/B ${sv(K3.pb.median)} (kv ${sv(K3.pb.p25)}–${sv(K3.pb.p75)}, n ${K3.pb.n}) — INVE ${sv(K2.vardering.pb, 3)}`);
console.log(`  EV/EBIT ${sv(K3.evEbit.median)} (kv ${sv(K3.evEbit.p25)}–${sv(K3.evEbit.p75)}, n ${K3.evEbit.n}) — INVE ${sv(K2.vardering.evEbit, 3)}`);
console.log(`  PEG ${sv(K3.peg.median)} (kv ${sv(K3.peg.p25)}–${sv(K3.peg.p75)}, n ${K3.peg.n}) — INVE ${sv(K2.vardering.peg)} (källans fält)`);
console.log(`  ROE ${sv(K3.roe.median * 100)} % (n ${K3.roe.n}) — INVE ${pct(K2.lonksamhet.roe)} = rank ${K3.roeRank}/${K3.roe.n} (ovanför: ${K3.roeOvan.join(", ")})`);
console.log(`  utdelningsskuld/aktie: ${sv(M.utdPerAktie)} kr (november 2026)`);
console.log("\nGRIND GRÖN — alla härledningar konsistenta.");
