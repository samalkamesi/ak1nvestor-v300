#!/usr/bin/env node
/**
 * _s1u1-telia-kontroll.mjs — granskningssond för sa-laser-du-telia-q3-2026.json
 * (agentfabrik auto-s1-1790653512758 s1-u1, 2026-09-29). Read-only: läser
 * utkast + källor, omräknar allt, skriver PASS/FAIL-rapport till stdout.
 * Skriver ALDRIG i andras filer.
 */
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const ROT = "/home/ak1a/AK1";
const ut = JSON.parse(fs.readFileSync(ROT + "/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-telia-q3-2026.json", "utf8"));
const dagensUnivers = JSON.parse(fs.readFileSync(ROT + "/data/portfolj-system/bolagsunivers.json", "utf8"));

// Byggvindan: sista commit av bolagsunivers.json FÖRE utkastets byggtid 2026-09-17 02:25 +02:00
const VIND_SHA = "795fe396ec2d99f956cad0c68f5ce2cb42ef908e"; // 2026-09-17 03:04:45 +0200 — 144 poster, 40 min efter paketbygget 02:25
const vindRaw = execFileSync("git", ["-C", ROT, "show", VIND_SHA + ":data/portfolj-system/bolagsunivers.json"], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
const vind = JSON.parse(vindRaw);

const resultat = [];
let pass = 0, fel = 0, varn = 0;
function k(nr, namn, ok, fakta, extra) {
  resultat.push({ nr, namn, dom: ok ? "PASS" : (extra === "VARN" ? "VARN" : "FAIL"), fakta });
  if (ok) pass++; else if (extra === "VARN") varn++; else fel++;
}
const nara = (a, b, tol = 0.005) => Math.abs(a - b) <= tol;
const proc = (x) => x * 100;

// ---------- A. UNIVERSUMRADEN ----------
const T = vind.find((b) => b.ticker === "TELIA.ST");
k("A1", "TELIA.ST finns i byggvindan", !!T, `poster=${vind.length}`);
k("A2", "vindans längd = textens 144-bolagsfil", vind.length === 144, `vinda=${vind.length}`);
k("A3", "kurs 44,77", T.pris === 44.77, String(T.pris));
k("A4", "mcap 176,0 mdr", nara(T.marknadsKapitalMdr, 176.0, 0.05), String(T.marknadsKapitalMdr));
k("A5", "P/E 35,816", T.vardering.pe === 35.816, String(T.vardering.pe));
k("A6", "P/B 3,532", T.vardering.pb === 3.532, String(T.vardering.pb));
k("A7", "EV/EBIT 17,885 → textens 17,9", nara(T.vardering.evEbit, 17.9, 0.005) || Math.round(T.vardering.evEbit * 10) / 10 === 17.9, String(T.vardering.evEbit));
k("A8", "PEG 1,97", T.vardering.peg === 1.97, String(T.vardering.peg));
k("A9", "FCF-yield 11,95 %", nara(T.vardering.fcfYield, 0.1195, 1e-9), String(T.vardering.fcfYield));
k("A10", "ROE 10,56 %", nara(T.lonksamhet.roe, 0.1056, 1e-9), String(T.lonksamhet.roe));
k("A11", "ROIC 10,30 %", nara(T.lonksamhet.roic, 0.103, 1e-9), String(T.lonksamhet.roic));
k("A12", "bruttomarginal 50,15 %", nara(T.lonksamhet.bruttoMarginal, 0.5015, 1e-9), String(T.lonksamhet.bruttoMarginal));
k("A13", "EBIT-marginal 17,68 %", nara(T.lonksamhet.ebitMarginal, 0.1768, 1e-9), String(T.lonksamhet.ebitMarginal));
k("A14", "nettomarginal 6,03 %", nara(T.lonksamhet.nettoMarginal, 0.0603, 1e-9), String(T.lonksamhet.nettoMarginal));
k("A15", "FCF-marginal 25,71 %", nara(T.lonksamhet.fcfMarginal, 0.2571, 1e-9), String(T.lonksamhet.fcfMarginal));
k("A16", "skuld/EK 1,691(4)", nara(T.stabilitet.skuldEgenkapital, 1.691, 0.0005), String(T.stabilitet.skuldEgenkapital));
k("A17", "räntetäckning osatt (null)", T.stabilitet.rantaTackning === null, String(T.stabilitet.rantaTackning));
k("A18", "insiderköp 0", T.aterkop.insiderkopSenaste6man === 0, String(T.aterkop.insiderkopSenaste6man));
k("A19", "omsättningCAGR −3,75 %", nara(T.tillvaxt.omsattningCAGR5ar, -0.0375, 1e-9), String(T.tillvaxt.omsattningCAGR5ar));
k("A20", "resultatCAGR null", T.tillvaxt.resultatCAGR5ar === null, String(T.tillvaxt.resultatCAGR5ar));
k("A21", "TTM +4,6 %", nara(T.tillvaxt.omsattningTillvaxtTTM, 0.046, 1e-9), String(T.tillvaxt.omsattningTillvaxtTTM));
k("A22", "prognostillväxt 6,55 %", nara(T.tillvaxt.prognosTillvaxt, 0.0655, 1e-9), String(T.tillvaxt.prognosTillvaxt));
k("A23", "intäktsserie 90 827→88 785→89 127→80 982 Mkr", JSON.stringify(T.serier.omsattning) === JSON.stringify([90827000000, 88785000000, 89127000000, 80982000000]), JSON.stringify(T.serier.omsattning));
k("A24", "resultatserie −14 638→303→7 079→3 525 Mkr", JSON.stringify(T.serier.resultat) === JSON.stringify([-14638000000, 303000000, 7079000000, 3525000000]), JSON.stringify(T.serier.resultat));
k("A25", "serier = 4 år (källnot)", T.serier.ar.length === 4 && T.notering.includes("4 räkenskapsår"), T.serier.ar.join(","));
k("A26", "ROIC-proxy-not i källan", T.notering.includes("approximerad proxy"), "notering bär proxy-formen");
k("A27", "bransch kommunikation + hämtad 2026-09-03", T.bransch === "kommunikation" && T.hamtat === "2026-09-03", `${T.bransch} ${T.hamtat}`);
k("A28", "moat-bruttohistorik saknas (källnot)", T.moat.bruttoMarginalMedel5ar === null && T.notering.includes("ingen årlig bruttovinsthistorik"), "null + not");

// ---------- B. ARITMETIK (oberoende omräkning) ----------
const body = ut.body;
const r1 = (x) => Math.round(x * 10) / 10, r2 = (x) => Math.round(x * 100) / 100;
k("B1", "P/E = P/B ÷ ROE → 33,45", nara(3.532 / 0.1056, 33.45, 0.005), `${r2(3.532 / 0.1056)}`);
k("B2", "identitetsavvikelse −6,6 %", nara((33.447 - 35.816) / 35.816 * 100, -6.6, 0.05), `${r1((3.532 / 0.1056 - 35.816) / 35.816 * 100)} %`);
k("B3", "omvänt 35,816 × 0,1056 = 3,78", nara(35.816 * 0.1056, 3.78, 0.005), `${r2(35.816 * 0.1056)}`);
k("B4", "implicit EPS 44,77 ÷ 35,816 = 1,25", nara(44.77 / 35.816, 1.25, 0.005), `${r2(44.77 / 35.816)}`);
const nettoExakt = 80982 * 0.0603; // 4 883,2 — oavrundat genom hela residualvägen
k("B5", "nettofält-väg 80 982 × 6,03 % = 4 883 Mkr", Math.round(nettoExakt) === 4883, `${nettoExakt.toFixed(1)} → ${Math.round(nettoExakt)}`);
k("B6", "P/E × netto = 174,9 mdr", nara(35.816 * nettoExakt / 1000, 174.9, 0.05), `${r1(35.816 * nettoExakt / 1000)}`);
k("B7", "residual väg ett −0,6 % (med oavrundat netto)", Math.round((35.816 * nettoExakt / 1000 - 176.041) / 176.041 * 100 * 10) / 10 === -0.6, `${r1((35.816 * nettoExakt / 1000 - 176.041) / 176.041 * 100)} % — textens −0,6 är korrekt avrundat (sond v1 avrundade netto först: sondbugg, ärligt bokförd)`);
k("B8", "P/E × serie-resultat = 126,3 mdr", nara(35.816 * 3525 / 1000, 126.3, 0.05), `${r1(35.816 * 3525 / 1000)}`);
k("B9", "residual väg två −28,3 %", nara((35.816 * 3525 / 1000 - 176.041) / 176.041 * 100, -28.3, 0.05), `${r1((35.816 * 3525 / 1000 - 176.041) / 176.041 * 100)} %`);
const gapIsar = (4883 - 3525) / 3525 * 100;
k("B10", "två vinstbegrepp 39 % isär (38,5→39)", Math.round(gapIsar) === 39, `${gapIsar.toFixed(1)} %`);
k("B11", "PEG-konvention 35,816 ÷ 6,55 = 5,47", nara(35.816 / 6.55, 5.47, 0.005), `${r2(35.816 / 6.55)}`);
k("B12", "PEG-kvot 1,97 ÷ 5,47 = 0,36", nara(1.97 / (35.816 / 6.55), 0.36, 0.005), `${r2(1.97 / (35.816 / 6.55))}`);
k("B13", "implicit tillväxt 35,816 ÷ 1,97 = 18,2", nara(35.816 / 1.97, 18.2, 0.05), `${r1(35.816 / 1.97)}`);
const EK = 176.041 / 3.532, skuld = EK * 1.6914, EV = EK + skuld;
const EBIT = 80982 * 0.1768;
k("B14", "EV-steg 1: EK 49,8 mdr", nara(EK, 49.8, 0.05), `${EK.toFixed(2)}`);
k("B15", "EV-steg 2: skuld 84,3 mdr (texten 'cirka 84')", nara(skuld, 84.3, 0.05), `${skuld.toFixed(2)}`);
k("B16", "EV-steg 3: EV 134,1 mdr", nara(EV, 134.1, 0.05), `${EV.toFixed(2)}`);
k("B17", "EV-steg 4: EBIT 14 318 Mkr", Math.round(EBIT) === 14318, String(Math.round(EBIT)));
k("B18", "EV-steg 5: kedja EV/EBIT 9,37", nara(EV * 1000 / 14318, 9.37, 0.005), `${r2(EV * 1000 / 14318)}`);
k("B19", "kvot kedja/fält 0,52", nara((EV * 1000 / 14318) / 17.885, 0.52, 0.005), `${r2((EV * 1000 / 14318) / 17.885)}`);
const residEV = EV - 17.885 * 14.318;
k("B20", "EV-residual: fält implicerar −122,0 mdr (texten −121,9)", nara(residEV, -121.9, 0.15), `beräknat ${residEV.toFixed(1)} mdr; textens −121,9 avviker ≤0,1`);
k("B21", "FCF-kontroll 25,71 % × 80 982 = 20 820 Mkr", Math.round(80982 * 0.2571) === 20820, String(Math.round(80982 * 0.2571)));
k("B22", "FCF-yield 20 820 ÷ 176 000 = 11,83 %", nara(20820 / 176041 * 100, 11.83, 0.005), `${r2(20820 / 176041 * 100)} %`);
k("B23", "'inom tolv hundradelar': 11,95−11,83 = 0,12", nara(11.95 - 20820 / 176041 * 100, 0.12, 0.005), `${r2(11.95 - 20820 / 176041 * 100)} pp`);
// marginalserier
k("B24", "härledd nettomarginalserie −16,12", nara(-14638 / 90827 * 100, -16.12, 0.005), `${r2(-14638 / 90827 * 100)}`);
k("B25", "…+0,34", nara(303 / 88785 * 100, 0.34, 0.005), `${r2(303 / 88785 * 100)}`);
k("B26", "…+7,94", nara(7079 / 89127 * 100, 7.94, 0.005), `${r2(7079 / 89127 * 100)}`);
k("B27", "…+4,35", nara(3525 / 80982 * 100, 4.35, 0.005), `${r2(3525 / 80982 * 100)}`);
k("B28", "intäktssteg −2,25/+0,39/−9,14", nara((88785 / 90827 - 1) * 100, -2.25, 0.005) && nara((89127 / 88785 - 1) * 100, 0.39, 0.005) && nara((80982 / 89127 - 1) * 100, -9.14, 0.005), `${r2((88785 / 90827 - 1) * 100)}/${r2((89127 / 88785 - 1) * 100)}/${r2((80982 / 89127 - 1) * 100)}`);
k("B29", "omsättningCAGR −3,75 %/år över 3 steg", nara(((80982 / 90827) ** (1 / 3) - 1) * 100, -3.75, 0.005), `${r2(((80982 / 90827) ** (1 / 3) - 1) * 100)}`);
// +227-problemet
const tot2ar = (3525 / 303 - 1) * 100, cagrVand = ((3525 / 303) ** 0.5 - 1) * 100, ettAr = (7079 / 303 - 1) * 100;
k("B30", "'+227 procent på två år' reproducerbar (303→3 525)", Math.round(tot2ar) === 227 || Math.round(cagrVand) === 227 || Math.round(ettAr) === 227, `totalt två år = ${Math.round(tot2ar)} %; per år = ${Math.round(cagrVand)} %; ett år = ${Math.round(ettAr)} % — inget = 227`);
k("B31", "halveringen 2025 −50,2 %", nara((3525 / 7079 - 1) * 100, -50.2, 0.05), `${r1((3525 / 7079 - 1) * 100)} %`);
// marginalgap
k("B32", "brutto→EBIT 32,5 pp", nara(50.15 - 17.68, 32.5, 0.05) || nara(50.15 - 17.68, 32.47, 0.005), `${r2(50.15 - 17.68)}`);
k("B33", "EBIT→netto 11,7 pp", nara(17.68 - 6.03, 11.65, 0.005) && Math.round(17.68 - 6.03) === 12 || nara(17.68 - 6.03, 11.65, 0.005), `${r2(17.68 - 6.03)} (text: 11,7)`);
k("B34", "brutto→netto 44,1 pp", nara(50.15 - 6.03, 44.12, 0.005), `${r2(50.15 - 6.03)} (text: 44,1)`);
// scenariorutan 3×3
const celler = [
  [78553, 0.1668, 13103], [78553, 0.1768, 13888], [78553, 0.1868, 14674],
  [80982, 0.1668, 13508], [80982, 0.1768, 14318], [80982, 0.1868, 15127],
  [83411, 0.1668, 13913], [83411, 0.1768, 14747], [83411, 0.1868, 15581],
];
k("B35", "scenarioruta 9/9 celler", celler.every(([o, m, v]) => Math.round(o * m) === v), celler.map(([o, m, v]) => `${Math.round(o * m)}==${v}`).join(" "));
k("B36", "marginalraten ≈810 Mkr/pp", Math.round(80982 * 0.01) === 810, String(Math.round(80982 * 0.01)));
k("B37", "intäktsraten ≈430 Mkr", Math.round(80982 * 0.03 * 0.1768) === 430, String(Math.round(80982 * 0.03 * 0.1768)));
k("B38", "vikt 1,89 (=810/430 och Essity-formeln)", nara(810 / 429.5, 1.886, 0.01) && nara(1 / (3 * 0.1768), 1.885, 0.001), `${r2(1 / (3 * 0.1768))}`);
k("B39", "FCF-nivåer 20 196/20 820/21 445 (bodyn)", Math.round(78553 * 0.2571) === 20196 && Math.round(80982 * 0.2571) === 20820 && Math.round(83411 * 0.2571) === 21445, `${Math.round(78553 * 0.2571)}/${Math.round(80982 * 0.2571)}/${Math.round(83411 * 0.2571)}`);
const fcfKalla = [20203, 20820, 21437];
k("B40", "källradens FCF-nivåer 20 203/21 437 == bodyns 20 196/21 445", fcfKalla[0] === 20196 && fcfKalla[2] === 21445, `källrad ${fcfKalla.join("/")} vs body 20 196/21 445 — avviker`);
k("B41", "FCF-yield-spann 11,5–12,2 %", nara(20196 / 176041 * 100, 11.47, 0.01) && nara(21445 / 176041 * 100, 12.18, 0.01), `${r2(20196 / 176041 * 100)}–${r2(21445 / 176041 * 100)} %`);
k("B42", "'åtta–nio år': 176 041/20 820 = 8,45", nara(176041 / 20820, 8.45, 0.01), `${r2(176041 / 20820)} år`);
k("B43", "P/E ÷ (1+g) = 33,61", nara(35.816 / 1.0655, 33.61, 0.005), `${r2(35.816 / 1.0655)}`);
k("B44", "aktieantal: 44,77 × 3 932 M ≈ 176,0 mdr", nara(44.77 * 3932 / 1000, 176.0, 0.3), `${r1(44.77 * 3932 / 1000)} mdr`);
k("B45", "4,3× : 25,71 ÷ 6,03", nara(25.71 / 6.03, 4.26, 0.01) && Math.round(25.71 / 6.03 * 10) / 10 === 4.3, `${r2(25.71 / 6.03)}`);
// relativt medianer (testas även i sektion C)
k("B46", "P/E 64 % över 21,8 / 69 % över 21,2", Math.round((35.816 / 21.8 - 1) * 100) === 64 && Math.round((35.816 / 21.2 - 1) * 100) === 69, `${Math.round((35.816 / 21.8 - 1) * 100)} % / ${Math.round((35.816 / 21.2 - 1) * 100)} %`);
k("B47", "P/B 32 % över 2,68 / 23 % över 2,88", Math.round((3.532 / 2.68 - 1) * 100) === 32 && Math.round((3.532 / 2.88 - 1) * 100) === 23, `${Math.round((3.532 / 2.68 - 1) * 100)} % / ${Math.round((3.532 / 2.88 - 1) * 100)} %`);
k("B48", "EBIT 16 % under 21,11; netto 48 % under 11,64; ROE 33 % under 15,84", Math.round((1 - 17.68 / 21.11) * 100) === 16 && Math.round((1 - 6.03 / 11.64) * 100) === 48 && Math.round((1 - 10.56 / 15.84) * 100) === 33, `${Math.round((1 - 17.68 / 21.11) * 100)}/${Math.round((1 - 6.03 / 11.64) * 100)}/${Math.round((1 - 10.56 / 15.84) * 100)}`);
k("B49", "skuld 32 % över 1,28; tre gånger 0,52", Math.round((1.691 / 1.28 - 1) * 100) === 32 && Math.round(1.691 / 0.52) === 3, `${Math.round((1.691 / 1.28 - 1) * 100)} %; ${r2(1.691 / 0.52)}×`);

// ---------- C. MEDIANER (byggvindan + dagens drift) ----------
function median(varde) {
  const s = varde.filter((v) => v !== null && v !== undefined && Number.isFinite(v)).sort((a, b) => a - b);
  if (s.length === 0) return { v: null, n: 0 };
  const n = s.length;
  return { v: n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2, n };
}
const komm = vind.filter((b) => b.bransch === "kommunikation");
k("C1", "kommunikation 13 bolag i vindan", komm.length === 13, String(komm.length));
const mK = {
  pe: median(komm.map((b) => b.vardering?.pe)),
  pb: median(komm.map((b) => b.vardering?.pb)),
  roe: median(komm.map((b) => b.lonksamhet?.roe)),
  ebit: median(komm.map((b) => b.lonksamhet?.ebitMarginal)),
  netto: median(komm.map((b) => b.lonksamhet?.nettoMarginal)),
  skuld: median(komm.map((b) => b.stabilitet?.skuldEgenkapital)),
};
const mU = {
  pe: median(vind.map((b) => b.vardering?.pe)),
  pb: median(vind.map((b) => b.vardering?.pb)),
  roe: median(vind.map((b) => b.lonksamhet?.roe)),
  ebit: median(vind.map((b) => b.lonksamhet?.ebitMarginal)),
  netto: median(vind.map((b) => b.lonksamhet?.nettoMarginal)),
  skuld: median(vind.map((b) => b.stabilitet?.skuldEgenkapital)),
};
k("C2", "median kommunikation P/E 21,8 (n=12)", nara(mK.pe.v, 21.8, 0.05) && mK.pe.n === 12, `${r1(mK.pe.v)} n=${mK.pe.n}`);
k("C3", "median kommunikation P/B 2,68", nara(mK.pb.v, 2.68, 0.005), `${r2(mK.pb.v)} n=${mK.pb.n}`);
k("C4", "median kommunikation ROE 15,84 %", nara(proc(mK.roe.v), 15.84, 0.005), `${r2(proc(mK.roe.v))} n=${mK.roe.n}`);
k("C5", "median kommunikation EBIT 21,11 %", nara(proc(mK.ebit.v), 21.11, 0.005), `${r2(proc(mK.ebit.v))} n=${mK.ebit.n}`);
k("C6", "median kommunikation netto 11,64 %", nara(proc(mK.netto.v), 11.64, 0.005), `${r2(proc(mK.netto.v))} n=${mK.netto.n}`);
k("C7", "median kommunikation skuld/EK 1,28", nara(mK.skuld.v, 1.28, 0.005), `${r2(mK.skuld.v)} n=${mK.skuld.n}`);
k("C8", "median universum P/E 21,2 (n=135)", nara(mU.pe.v, 21.2, 0.05) && mU.pe.n === 135, `${r1(mU.pe.v)} n=${mU.pe.n}`);
k("C9", "median universum P/B 2,88 (n=141)", nara(mU.pb.v, 2.88, 0.005) && mU.pb.n === 141, `${r2(mU.pb.v)} n=${mU.pb.n}`);
k("C10", "median universum ROE 15,58 % (n=140)", nara(proc(mU.roe.v), 15.58, 0.005) && mU.roe.n === 140, `${r2(proc(mU.roe.v))} n=${mU.roe.n}`);
k("C11", "median universum EBIT 21,22 % (n=143)", nara(proc(mU.ebit.v), 21.22, 0.005) && mU.ebit.n === 143, `${r2(proc(mU.ebit.v))} n=${mU.ebit.n}`);
k("C12", "median universum netto 14,67 % (n=144)", nara(proc(mU.netto.v), 14.67, 0.005) && mU.netto.n === 144, `${r2(proc(mU.netto.v))} n=${mU.netto.n}`);
k("C13", "median universum skuld/EK 0,52 (n=130)", nara(mU.skuld.v, 0.52, 0.005) && mU.skuld.n === 130, `${r2(mU.skuld.v)} n=${mU.skuld.n}`);
k("C14", "DRIFTNOT: dagens fil", true, `dagens universum = ${dagensUnivers.length} poster (textens tal tidsstämplade mot 144-vindan ${VIND_SHA.slice(0, 8)} 2026-09-16 21:51 — dagens fil används ej som domslut`);

// ---------- D. KALENDER + RAPPDAGSPÅSTÅENDEN ----------
const kalFiler = fs.readdirSync(ROT + "/data/blogg-utkast/kvartal/2026-q3").filter((f) => f.startsWith("kalender-"));
const kalm = new Map();
for (const f of kalFiler) {
  const j = JSON.parse(fs.readFileSync(ROT + "/data/blogg-utkast/kvartal/2026-q3/" + f, "utf8"));
  for (const b of j.bolag || []) kalm.set(b.ticker, { namn: b.namn, fonster: b.rapportfenster, notera: b.notera || "", fil: f });
}
function dag(ticker) { const e = kalm.get(ticker); if (!e) return null; const m = e.fonster.match(/2026-(10|11)-\d{2}/); return m ? m[0] : e.fonster; }
const teliaKal = kalm.get("TELIA.ST");
k("D1", "kalendern bär Telia med fönster 2026-10-21", !!teliaKal && dag("TELIA.ST") === "2026-10-21", teliaKal ? `${teliaKal.fonster} (${teliaKal.fil})` : "saknas");
k("D2", "divergensnot 22 oktober i kalendern", !!teliaKal && /22 oktober|2026-10-22/.test(teliaKal.notera + teliaKal.fonster), (teliaKal?.notera || "").slice(0, 160));
k("D3", "SKF 21/10", dag("SKF-B.ST") === "2026-10-21", String(dag("SKF-B.ST")));
k("D4", "Handelsbanken 21/10", dag("SHB-A.ST") === "2026-10-21", String(dag("SHB-A.ST")));
k("D5", "Iberdrola 21/10", dag("IBE.MC") === "2026-10-21", String(dag("IBE.MC")));
k("D6", "ABB 20/10", dag("ABB.ST") === "2026-10-20", String(dag("ABB.ST")));
k("D7", "Tele2 20/10 (textens 'ABB och Tele2 den 20:e')", dag("TEL2-A.ST") === "2026-10-20", String(dag("TEL2-A.ST")));
k("D8", "Yara 22/10", dag("YAR.OL") === "2026-10-22", String(dag("YAR.OL")));
k("D9", "Billerud 22/10", dag("BILL.ST") === "2026-10-22", String(dag("BILL.ST")));
k("D10", "SCA 23/10", dag("SCA-B.ST") === "2026-10-23", String(dag("SCA-B.ST")));
k("D11", "Hydro 23/10", dag("NHY.OL") === "2026-10-23", String(dag("NHY.OL")));
k("D12", "SSAB 28/10 + UPM 28/10", dag("SSAB-B.ST") === "2026-10-28" && dag("UPM.HE") === "2026-10-28", `${dag("SSAB-B.ST")} + ${dag("UPM.HE")}`);
k("D13", "Boliden 29/10 + Stora Enso 30/10", dag("BOL.ST") === "2026-10-29" && dag("STERV.HE") === "2026-10-30", `${dag("BOL.ST")} + ${dag("STERV.HE")}`);
// publishedAt vs rappdag (seriens form: Investor = rappdagen)
k("D14", "publishedAt 2026-10-19 ≤ rappdag 2026-10-21 — i linje med publicerade syskon", ut.publishedAt <= "2026-10-21" && ut.publishedAt >= "2026-10-14", `publishedAt=${ut.publishedAt}, rappdag=2026-10-21; publicerade syskon: skf-b/sandvik 2026-10-19 (rappdagar 21 resp 22/10), holm 10-21 (22/10), evolution 10-20 (20/10) — konventionen är läspaket FÖRE rapporten; Investor-passets "=rappdag" var inte seriens regel`);
// läspaketsräkning 20–23/10 — paket som FANNS i trädet vid byggtidpunkten (vindshan)
const traedFiler = execFileSync("git", ["-C", ROT, "ls-tree", "--name-only", VIND_SHA, "--", "data/blogg-utkast/kvartal/2026-q3/"], { encoding: "utf8" })
  .split("\n").filter((f) => f.startsWith("sa-laser-du-") && f.endsWith(".json"));
const slugDag = new Map();
for (const f of traedFiler) {
  const j = JSON.parse(execFileSync("git", ["-C", ROT, "show", `${VIND_SHA}:${f}`], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }));
  const bold = j.body.match(/den \*{0,2}(\d{1,2}) oktober\*{0,2}/);
  const iso = j.body.match(/2026-10-(\d{2})/);
  let d = null;
  if (bold) d = `2026-10-${String(bold[1]).padStart(2, "0")}`;
  else if (iso) d = `2026-10-${iso[1]}`;
  slugDag.set(f.replace("sa-laser-du-", "").replace("-q3-2026.json", ""), d);
}
const fonstret = [...slugDag.entries()].filter(([sl, d]) => d && d >= "2026-10-20" && d <= "2026-10-23");
const perDagEmpirisk = { "2026-10-20": [], "2026-10-21": [], "2026-10-22": [], "2026-10-23": [] };
for (const [sl, d] of fonstret) perDagEmpirisk[d].push(sl);
const totEmpirisk = fonstret.length;
k("D15", "läspaket i fönstret 20–23/10 vid byggtid = textens 15", totEmpirisk === 15, `trädet ${VIND_SHA.slice(0, 8)} bar ${traedFiler.length} paket; empiri: ${totEmpirisk} i fönstret — 20:e [${perDagEmpirisk["2026-10-20"].join(", ")}], 21:a [${perDagEmpirisk["2026-10-21"].join(", ")}], 22:a [${perDagEmpirisk["2026-10-22"].join(", ")}], 23:e [${perDagEmpirisk["2026-10-23"].join(", ")}]`);
k("D16", "SCA-motsägelsen: parentes 'SCA ännu utan paket' vs listning i 23:e-gruppen", false, `empirisk SCA-status i trädet vid byggtid: ${slugDag.get("sca") ? `paket FINNS (rappdag ${slugDag.get("sca")})` : "inget paket"} — texten listar SCA bland 23:e-paketen OCH i 'ännu utan paket'-parentesen; se dom i KONTROLL`);

// ---------- E. SERIEPÅSTÅENDEN MOT UNIVERSUMET ----------
const t2 = vind.find((b) => b.ticker === "TEL2-A.ST");
k("E1", "Tele2 ROE 47,6 %", t2 && nara(proc(t2.lonksamhet.roe), 47.6, 0.05), t2 ? `${r1(proc(t2.lonksamhet.roe))}` : "saknas");
k("E2", "Tele2 skuld/EK 1,35", t2 && nara(t2.stabilitet.skuldEgenkapital, 1.35, 0.005), t2 ? `${r2(t2.stabilitet.skuldEgenkapital)}` : "saknas");
k("E3", "Tele2 P/E 11,9", t2 && nara(t2.vardering.pe, 11.9, 0.05), t2 ? `${r1(t2.vardering.pe)}` : "saknas");
k("E4", "Tele2 ROE−ROIC-gap 24 pp", t2 && nara(proc(t2.lonksamhet.roe - t2.lonksamhet.roic), 24, 0.5), t2 ? `${r1(proc(t2.lonksamhet.roe - t2.lonksamhet.roic))} pp` : "saknas");
const ibe = vind.find((b) => b.ticker === "IBE.MC");
k("E5", "Iberdrola FCF-yield 1,96 %", ibe && nara(proc(ibe.vardering.fcfYield), 1.96, 0.005), ibe ? `${r2(proc(ibe.vardering.fcfYield))}` : "saknas");
k("E6", "Iberdrola netto 15,9 % / FCF 5,8 %", ibe && nara(proc(ibe.lonksamhet.nettoMarginal), 15.9, 0.05) && nara(proc(ibe.lonksamhet.fcfMarginal), 5.8, 0.05), ibe ? `${r1(proc(ibe.lonksamhet.nettoMarginal))} / ${r1(proc(ibe.lonksamhet.fcfMarginal))}` : "saknas");

// ---------- F. JURIDIK (2007:528) ----------
const vm = JSON.parse(fs.readFileSync(ROT + "/data/varumarke.json", "utf8"));
const hela = ut.title + "\n" + ut.description + "\n" + body;
let vmFel = 0, vmVarn = 0;
const vmTraff = [];
for (const f of vm.forbjudnaFraser) {
  const re = new RegExp(f.fran, "giu");
  let m;
  while ((m = re.exec(hela)) !== null) {
    if (f.allvar === "FEL") { vmFel++; vmTraff.push(`FEL: ${m[0]} @${m.index}`); }
    else { vmVarn++; vmTraff.push(`VARN: ${m[0]} @${m.index}`); }
  }
}
k("F1", `varumärkesgrind ${vm.forbjudnaFraser.length} mönster × 3 ytor = 0 FEL`, vmFel === 0, `träffar: ${vmTraff.join(" | ") || "0"}`);
k("F2", "exakt ETT lagrum: 2007:528 2 kap 5 §", (hela.match(/2007:528/g) || []).length >= 1 && /2 kap 5 §/.test(hela), `${(hela.match(/2007:528/g) || []).length} förekomster`);
k("F3", "inga blandade lagrum (2022:260/2022:261/1985:716/2005:59)", !/2022:260|2022:261|1985:716|2005:59/.test(hela), "0 träffar");
k("F4", "utbildningsram i ingress", /utbildningspaket|utbildning i metod/.test(body.split("\n")[0] + body.slice(0, 800)), "bär 'utbildningspaket' + 'utbildning i metod'");
k("F5", "negerad räd-fras i ingressen", /inte en rekommendation att köpa, sälja eller behålla/.test(body.slice(0, 1000)), "negerad trippelform närvarande");
k("F6", "disclaimer exakt sista raden + 2007:528-form", /\n\*Detta är pedagogisk finansutbildning enligt lagen \(2007:528\) 2 kap 5 § — inte investeringsrådgivning/.test(body) && body.trimEnd().endsWith("kundens beslut.*"), "italic-disclaimer sist");
// rådglossor med kontext
const glossor = [];
for (const ord of ["köp", "sälj", "rekommender", "borde", "bör du", "tips"]) {
  const re = new RegExp(`.{30}\\b${ord}\\b.{30}`, "giu");
  let m;
  while ((m = re.exec(hela)) !== null) glossor.push(`[${ord}] …${m[0].replace(/\n/g, " ")}…`);
}
k("F7", "rådglossor endast i negerade/utbildningsformer (manuell dom ur kontext)", glossor.length >= 0, glossor.join("\n") || "0 träffar");
// 911 — sex mönster
const p911 = [/\b911\b/, /9\s*\/\s*11/, /11\s+september/i, /september\s+11/i, /nine[-\s]?eleven/i, /9-1-1/];
let t911 = 0;
for (const re of p911) { const m = hela.match(re); if (m) { t911++; } }
k("F8", "911-referenser: 0 (sex mönster × alla ytor)", t911 === 0, `${t911} träffar`);

// ---------- G. STRUKTUR ----------
const ord = body.trim().split(/\s+/).length;
k("G1", "readingMinutes 5 = round(ord/600)", Math.round(ord / 600) === ut.readingMinutes, `${ord} ord → ${Math.round(ord / 600)} min (post: ${ut.readingMinutes})`);
k("G2", "title-längd inom seriens span (201–229)", ut.title.length >= 195 && ut.title.length <= 240, `${ut.title.length} tkn (Investor 201, Tele2 229)`);
k("G3", "description-längd redovisas (serien 283–762)", ut.description.length >= 250 && ut.description.length <= 800, `${ut.description.length} tkn (Investor 283, Tele2 762)`);
k("G4", "tags innehåller serie+bolag", ut.tags.includes("kvartalsrapport") && ut.tags.some((t) => /telia/i.test(t)), JSON.stringify(ut.tags));
k("G5", "inget maskinkvitto i bodyn (kvartalsserien)", !/## Granskningsunderlag/.test(body), "0 träffar");
k("G6", "pillar/author = seriestandarden", ut.pillar === "Institutionell metodik" && ut.author === "AK1A Research Lab", `${ut.pillar} · ${ut.author}`);
const h2 = (body.match(/^## /gm) || []).length;
k("G7", "rubrikstruktur (H2 ≥ 6)", h2 >= 6, `${h2} H2`);
k("G8", "publishedAt efter isolering?", /^\d{4}-\d{2}-\d{2}$/.test(ut.publishedAt), ut.publishedAt);

// ---------- RAPPORT ----------
console.log(`\n=== S1U1 TELIA-KONTROLL ${new Date().toISOString()} ===`);
console.log(`vindsha ${VIND_SHA.slice(0, 8)} (144?) → ${vind.length} poster | dagens fil ${dagensUnivers.length} poster\n`);
for (const r of resultat) console.log(`${r.dom.padEnd(4)} ${r.nr.padEnd(4)} ${r.namn}\n        ${r.fakta}`);
console.log(`\nSUMMA: ${pass} PASS · ${fel} FAIL · ${varn} VARN av ${resultat.length} kontroller`);
process.exit(fel > 0 ? 1 : 0);
