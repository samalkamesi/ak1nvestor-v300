#!/usr/bin/env node
// _s1u2-wihlborgs-q3-kontroll.mjs — granskningssond för sa-laser-du-wihlborgs-q3-2026.json
// Fabriksagent s1-u2 (auto-s1-1790012730031), 2026-09-21. LÄSER ENDAST — skriver inget.
// Klass: syskonens paketkontroller (sandvik/handelsbanken-mönstret).
import { readFileSync, existsSync } from "node:fs";
import { execSync, execFileSync } from "node:child_process";
import crypto from "node:crypto";

const R = "/home/ak1a/AK1";
const UTKAST = `${R}/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-wihlborgs-q3-2026.json`;
const UNIV = `${R}/data/portfolj-system/bolagsunivers.json`;
const KAL = `${R}/data/blogg-utkast/kvartal/2026-q3/kalender-fastighet.json`;
const VAGMASTER = `${R}/data/rapporter/vagvalidering-SENASTE.md`;

let pass = 0, fail = 0, not = 0;
const fails = [], nots = [];
const ok = (id, cond, belagg) => {
  if (cond) { pass++; }
  else { fail++; fails.push(`${id} — ${belagg}`); }
};
const noter = (id, text) => { not++; nots.push(`${id} — ${text}`); };
const md5 = (s) => crypto.createHash("md5").update(s).digest("hex");
const num = (x, d = 2) => Number(x.toFixed(d));

// Projektets median (dataset-nyckeltal.ts:72 — exakt spegel): udda → mittersta, jämnt → medel av två mittersta.
function median(v) {
  const rena = v.filter((x) => typeof x === "number" && Number.isFinite(x));
  if (!rena.length) return null;
  const s = [...rena].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 === 1 ? s[m] : (s[m - 1] + s[m]) / 2;
}
const pct = (v) => v.filter((x) => typeof x === "number" && Number.isFinite(x) && x !== null);

// ============ 0. FILINLÄSNING ============
const utkast = JSON.parse(readFileSync(UTKAST, "utf8"));
const univIdag = JSON.parse(readFileSync(UNIV, "utf8"));
const kal = JSON.parse(readFileSync(KAL, "utf8"));
const yta = `${utkast.title}\n${utkast.description}\n${utkast.body}`;

// Byggvintage: utkastets egen commit 79d8f765 (09-20 21:24)
const vintage = JSON.parse(execFileSync("git", ["-C", R, "show", "79d8f765:data/portfolj-system/bolagsunivers.json"], { encoding: "utf8", maxBuffer: 64e6 }));

console.log("=== S1U2 WIHLBORGS Q3-KONTROLL — " + new Date().toISOString() + " ===");
console.log(`md5 utkast=${md5(readFileSync(UTKAST, "utf8"))} univ(idag)=${md5(readFileSync(UNIV, "utf8"))} univ(vintage 79d8f765)=${md5(JSON.stringify(vintage))} kalender=${md5(readFileSync(KAL, "utf8"))}`);

// A. Källor & orördhet
ok("A1", execFileSync("git", ["-C", R, "diff", "--name-only", "79d8f765..HEAD", "--", "data/blogg-utkast/kvartal/2026-q3/sa-laser-du-wihlborgs-q3-2026.json"], { encoding: "utf8" }).trim() === "", "utkastet orört sedan bygget (diff 79d8f765..HEAD tom)");
ok("A2", execFileSync("git", ["-C", R, "status", "--porcelain", "--", "data/blogg-utkast/kvartal/2026-q3/sa-laser-du-wihlborgs-q3-2026.json", "data/portfolj-system/bolagsunivers.json", "data/blogg-utkast/kvartal/2026-q3/kalender-fastighet.json"], { encoding: "utf8" }).trim() === "", "arbetsytan ren för alla tre källfiler");
const wihl = univIdag.find((p) => p.ticker === "WIHL.ST");
const wihlV = vintage.find((p) => p.ticker === "WIHL.ST");
ok("A3", !!wihl && !!wihlV, "WIHL-post i både dagens (249) och byggvintagens universumfil");
ok("A4", JSON.stringify(wihl) === JSON.stringify(wihlV), "WIHL-posten identisk mellan vintagen och idag (ingen drift för objektet)");

// Kalenderns WIHL-rad: divergens 20/21 dokumenterad i utkastet
const kalStr = JSON.stringify(kal);
const kalW = (kal.poster || kal).find?.((p) => p.ticker === "WIHL.ST") || null;
ok("A5", kalStr.includes("WIHL.ST") && kalStr.includes("divergerar mellan 20 och 21 oktober"), "kalenderfilens WIHL-rad dokumenterar 20/21-divergensen (utkastet redovisar den upplöst av egen verifiering)");

// Vågskikt-påstående: WIHL ej vågvaliderat + ingen analysfil
const vag = readFileSync(VAGMASTER, "utf8");
ok("A6", !/WIHL|Wihlborgs/i.test(vag), "WIHL finns inte i vågvalidering-SENASTE.md (utkastet redovisar ingen vågklassificering)");
let analysWihl = false;
try { analysWihl = execFileSync("grep", ["-ril", "wihl", R + "/data/analyses"], { encoding: "utf8" }).trim() !== ""; } catch { /* grep exit 1 = inga träffar */ }
ok("A7", !analysWihl, "ingen WIHL-analysfil i data/analyses");

// ============ B. FÄLTKONTROLLER mot universumposten (dagens fil; A4 visar vintage-identisk) ============
const f = (o, path) => path.split(".").reduce((a, k) => (a == null ? a : a[k]), o);
const fa = [
  ["B1 pris 79,65", wihl.pris, 79.65],
  ["B2 börsvärde 24,487 mdr", f(wihl, "marknadsKapitalMdr"), 24.487],
  ["B3 P/E 11,203", f(wihl, "vardering.pe"), 11.203],
  ["B4 P/B 1,013", f(wihl, "vardering.pb"), 1.013],
  ["B5 EV/EBIT 17,955", f(wihl, "vardering.evEbit"), 17.955],
  ["B6 PEG 1,97 (källans)", f(wihl, "vardering.peg"), 1.97],
  ["B7 FCF-yield 6,10 %", f(wihl, "vardering.fcfYield"), 0.061],
  ["B8 ROE 9,27 %", f(wihl, "lonksamhet.roe"), 0.0927],
  ["B9 ROIC 5,46 %", f(wihl, "lonksamhet.roic"), 0.0546],
  ["B10 bruttomarginal 71,69 %", f(wihl, "lonksamhet.bruttoMarginal"), 0.7169],
  ["B11 EBIT-marginal 71,09 %", f(wihl, "lonksamhet.ebitMarginal"), 0.7109],
  ["B12 nettomarginal 47,34 %", f(wihl, "lonksamhet.nettoMarginal"), 0.4734],
  ["B13 FCF-marginal 32,33 %", f(wihl, "lonksamhet.fcfMarginal"), 0.3233],
  ["B14 oms-CAGR 9,29 %", f(wihl, "tillvaxt.omsattningCAGR5ar"), 0.0929],
  ["B15 res-CAGR −1,00 %", f(wihl, "tillvaxt.resultatCAGR5ar"), -0.01],
  ["B16 TTM +6,8 %", f(wihl, "tillvaxt.omsattningTillvaxtTTM"), 0.068],
  ["B17 prognos +9,44 %", f(wihl, "tillvaxt.prognosTillvaxt"), 0.0944],
  ["B18 skuld/EK 1,4875 (textens 1,49 + belåningsräknets 1,4875)", f(wihl, "stabilitet.skuldEgenkapital"), 1.4875],
  ["B19 golv 78,66", f(wihl, "golv.vardePerAktie"), 78.66],
  ["B20 golv-marginal −1,26 %", f(wihl, "golv.marginal"), -0.0126],
  ["B21 insiderköp 0", f(wihl, "aterkop.insiderkopSenaste6man"), 0],
];
for (const [id, faktiskt, vill] of fa) ok(id, num(faktiskt, 4) === num(vill, 4), `fil=${faktiskt} utkast/vill=${vill}`);
ok("B22 räntetäckning osatt", f(wihl, "stabilitet.rantaTackning") === null, "källan saknar räntekostnad — utkastet redovisar hålet");
ok("B23 serier: 4 år 3335/3881/4174/4354", JSON.stringify(f(wihl, "serier.omsattning")) === JSON.stringify([3335000000, 3881000000, 4174000000, 4354000000]), "omsättningsserie");
ok("B24 serier: resultat 2288/−27/1706/2220", JSON.stringify(f(wihl, "serier.resultat")) === JSON.stringify([2288000000, -27000000, 1706000000, 2220000000]), "resultatserie");
ok("B25 ROIC-proxy + 4-år-not + MarketStack-not i utkastet", /approximerad proxy/.test(utkast.body) && /fyra år, inte fem|fyra räkenskapsår, inte fem/.test(utkast.body) && /MarketStack/.test(utkast.body), "postens noteringsinnehåll bärs i texten");

// ============ C. GRENSTATISTIK mot byggvintagen 79d8f765 (Nordea-metoden: byggets läge, inte dagens fil) ============
const fastV = vintage.filter((p) => p.bransch === "fastighet");
const fastI = univIdag.filter((p) => p.bransch === "fastighet");
noter("C0", `vintage=${vintage.length} poster (fastighet ${fastV.length}) · idag=${univIdag.length} (fastighet ${fastI.length}) — utkastet skriver "237 poster, varav 17 fastighet"`);
ok("C1 vintage 237 poster", vintage.length === 237, `vintagen har ${vintage.length} poster, utkastet skriver 237`);
ok("C2 fastighet 17 i vintagen", fastV.length === 17, `vintagen har ${fastV.length} fastighetsposter, utkastet skriver 17`);

const pe = pct(fastV.map((p) => f(p, "vardering.pe")));
const pb = pct(fastV.map((p) => f(p, "vardering.pb")));
const roe = pct(fastV.map((p) => f(p, "lonksamhet.roe")));
const ebit = pct(fastV.map((p) => f(p, "lonksamhet.ebitMarginal")));
const netto = pct(fastV.map((p) => f(p, "lonksamhet.nettoMarginal")));
const skuld = pct(fastV.map((p) => f(p, "stabilitet.skuldEgenkapital")));
const fcf = pct(fastV.map((p) => f(p, "vardering.fcfYield")));
const pegU = pct(vintage.map((p) => f(p, "vardering.peg")));
ok("C3 median P/E 14,38", num(median(pe)) === 14.38, `beräknad ${median(pe)}`);
ok("C4 median P/B 0,946", num(median(pb), 3) === 0.946, `beräknad ${median(pb)}`);
ok("C5 median ROE 8,57 % (n=16)", num(median(roe) * 100) === 8.57 && roe.length === 16, `beräknad ${num((median(roe) || 0) * 100)} n=${roe.length}`);
ok("C6 median EBIT-marg 57,37 %", num(median(ebit) * 100) === 57.37, `beräknad ${num((median(ebit) || 0) * 100)}`);
ok("C7 median netto 43,58 %", num(median(netto) * 100) === 43.58, `beräknad ${num((median(netto) || 0) * 100)}`);
ok("C8 median skuld/EK 1,10", num(median(skuld)) === 1.1, `beräknad ${median(skuld)}`);
ok("C9 FCF n=16", fcf.length === 16, `n=${fcf.length}`);

// Universumsmedianer (tabellens tredje kolumn)
const peU = pct(vintage.map((p) => f(p, "vardering.pe")));
const pbU = pct(vintage.map((p) => f(p, "vardering.pb")));
const roeU = pct(vintage.map((p) => f(p, "lonksamhet.roe")));
const ebitU = pct(vintage.map((p) => f(p, "lonksamhet.ebitMarginal")));
const nettoU = pct(vintage.map((p) => f(p, "lonksamhet.nettoMarginal")));
const skuldU = pct(vintage.map((p) => f(p, "stabilitet.skuldEgenkapital")));
ok("C10 univ-median P/E 20,39", num(median(peU)) === 20.39, `beräknad ${median(peU)}`);
ok("C11 univ-median P/B 2,72", num(median(pbU)) === 2.72, `beräknad ${median(pbU)}`);
ok("C12 univ-median ROE 14,75 %", num(median(roeU) * 100) === 14.75, `beräknad ${num((median(roeU) || 0) * 100)}`);
ok("C13 univ-median EBIT 20,81 %", num(median(ebitU) * 100) === 20.81, `beräknad ${num((median(ebitU) || 0) * 100)}`);
ok("C14 univ-median netto 13,90 %", num(median(nettoU) * 100) === 13.9, `beräknad ${num((median(nettoU) || 0) * 100)}`);
ok("C15 univ-median skuld 0,53", num(median(skuldU)) === 0.53, `beräknad ${median(skuldU)}`);
ok("C16 PEG-median 1,32 (n=194; 1,315 halva-uppåt)", Math.round(median(pegU) * 100) === 132 && median(pegU) === 1.315 && pegU.length === 194, `beräknad ${median(pegU)} (mittersta ${(pegU[Math.floor(pegU.length/2)-1])}/${pegU[Math.floor(pegU.length/2)]}) n=${pegU.length}`);

// Rang inom vintagens fastighetsgren
const rang = (v, x, stigande = true) => { const s = [...v].sort((a, b) => (stigande ? a - b : b - a)); return [s.indexOf(x) + 1, v.length]; };
let r = rang(pb, f(wihlV, "vardering.pb")); ok("C17 P/B rang 10 av 17 stigande", r[0] === 10 && r[1] === 17, `beräknad ${r[0]}/${r[1]}`);
r = rang(roe, f(wihlV, "lonksamhet.roe"), false); ok("C18 ROE 7 högsta av 16", r[0] === 7 && r[1] === 16, `beräknad ${r[0]}/${r[1]}`);
r = rang(ebit, f(wihlV, "lonksamhet.ebitMarginal"), false); ok("C19 EBIT-marg 3 högsta av 17", r[0] === 3 && r[1] === 17, `beräknad ${r[0]}/${r[1]}`);
r = rang(fcf, f(wihlV, "vardering.fcfYield"), false); ok("C20 FCF-yield 3 högsta av 16", r[0] === 3 && r[1] === 16, `beräknad ${r[0]}/${r[1]}`);
r = rang(skuld, f(wihlV, "stabilitet.skuldEgenkapital"), false); ok("C21 skuld/EK 4 högsta av 17", r[0] === 4 && r[1] === 17, `beräknad ${r[0]}/${r[1]}`);

// Nio under 0,95 + enda europeiska över pari + kollegtal
const under095 = pb.filter((x) => x < 0.95).length;
ok("C22 nio kollegor under 0,95", under095 === 9, `beräknad ${under095}`);
const pari = fastV.filter((p) => f(p, "vardering.pb") > 1);
const eu = ["Sverige", "Norge", "Danmark", "Finland", "Frankrike", "Tyskland", "Nederländerna", "Storbritannien", "Schweiz", "Belgien", "Österrike", "Italien", "Spanien", "Irland", "Luxemburg", "Portugal", "Polen", "Estland", "Lettland", "Litauen"];
ok("C23 enda EUROPEISKA bolaget över pari", pari.filter((p) => eu.includes(p.land)).length === 1 && pari.filter((p) => eu.includes(p.land))[0]?.ticker === "WIHL.ST", `över pari: ${pari.map((p) => p.ticker + "(" + p.land + ")").join(", ")}`);
const g = (t) => fastV.find((p) => p.ticker.startsWith(t));
ok("C24 URW FCF 9,51", num(f(g("URW"), "vardering.fcfYield") * 100) === 9.51, `fil=${f(g("URW"), "vardering.fcfYield")}`);
ok("C25 Fabege FCF 7,70", num(f(g("FABG") || g("FA"), "vardering.fcfYield") * 100) === 7.7, `fil=${f(g("FABG") || g("FA"), "vardering.fcfYield")}`);
ok("C26 Catena FCF 5,26", num(f(g("CAT"), "vardering.fcfYield") * 100) === 5.26, `fil=${f(g("CAT"), "vardering.fcfYield")}`);
ok("C27 Balder FCF 5,05", num(f(g("BALD"), "vardering.fcfYield") * 100) === 5.05, `fil=${f(g("BALD"), "vardering.fcfYield")}`);
ok("C28 Catena EBIT-marg 84,86", num(f(g("CAT"), "lonksamhet.ebitMarginal") * 100) === 84.86, `fil=${f(g("CAT"), "lonksamhet.ebitMarginal")}`);
ok("C29 NP3 EBIT-marg 74,88", num(f(g("NP3"), "lonksamhet.ebitMarginal") * 100) === 74.88, `fil=${f(g("NP3"), "lonksamhet.ebitMarginal")}`);
ok("C30 Balder skuld/EK 1,48", num(f(g("BALD"), "stabilitet.skuldEgenkapital")) === 1.48, `fil=${f(g("BALD"), "stabilitet.skuldEgenkapital")}`);
ok("C31 Balder P/B-rabatt 32 % (32,20 heltalsavrundat)", Math.round((1 - f(g("BALD"), "vardering.pb")) * 100) === 32, `beräknad ${num((1 - f(g("BALD"), "vardering.pb")) * 100)}`);
ok("C32 Catena P/B-rabatt 5,4 %", num((1 - f(g("CAT"), "vardering.pb")) * 100, 1) === 5.4, `beräknad ${num((1 - f(g("CAT"), "vardering.pb")) * 100, 1)}`);

// ============ D. ARITMETIK — egna omräkningar ============
const a = [
  ["D1 premie 1,26 %", num(((79.65 - 78.66) / 78.66) * 100), 1.26],
  ["D2 kapitalväg1 79,65/1,013", num(79.65 / 1.013), 78.63],
  ["D3 identitet P/B÷ROE", num(1.013 / 0.0927), 10.93],
  ["D4 identitetsgap 2,52 %", num((11.203 / (1.013 / 0.0927) - 1) * 100), 2.52],
  ["D5 implicit EPS 7,11", num(79.65 / 11.203), 7.11],
  ["D6 aktier ur börsvärde 307,4 M (bodyns tal)", num(24.487e9 / 79.65 / 1e6, 1), 307.4],
  ["D7 aktiekontroll 850/2,76≈308", num(850 / 2.76, 0), 308],
  ["D8 P/E bokslut 11,03", num(79.65 / (2220 / 307.4)), 11.03],
  ["D9 trailing-bokslut −1,5 %", num((7.11 * 307.4 / 2220 - 1) * 100, 1), -1.5],
  ["D10 PEG-konvention 1,19", num(11.203 / 9.44), 1.19],
  ["D11 PEG-kvot 1,66", num(1.97 / (11.203 / 9.44)), 1.66],
  ["D12 belåningsgrad 59,8 %", num(1 / (1 + 1 / 1.4875) * 100, 1), 59.8],
  ["D13 direktavkastning 4,14 %", num((3.3 / 79.65) * 100), 4.14],
  ["D14 FCF bokslut 1 408 M", num(4354 * 0.3233, 0), 1408],
  ["D15 FCF bokslutsväg 5,75 %", num((4354 * 0.3233 / 24487) * 100), 5.75],
  ["D16 oms-CAGR 9,29 %", num(((4354 / 3335) ** (1 / 3) - 1) * 100), 9.29],
  ["D17 årssteg +16,4/+7,5/+4,3", `${num((3881 / 3335 - 1) * 100, 1)},${num((4174 / 3881 - 1) * 100, 1)},${num((4354 / 4174 - 1) * 100, 1)}`, "16.4,7.5,4.3"],
  ["D18 res-CAGR −1,00 %", num(((2220 / 2288) ** (1 / 3) - 1) * 100), -1.0],
  ["D19 netto 2025 50,99 %", num((2220 / 4354) * 100), 50.99],
  ["D20 netto 2023 −0,70 %", num((-27 / 3881) * 100), -0.7],
  ["D21 EBIT 2025 3 095", num(4354 * 0.7109, 0), 3095],
  ["D22 EBIT↔drift 0,4 %", num((3107 / (4354 * 0.7109) - 1) * 100, 1), 0.4],
  ["D23 Q2-25-cell 2 142−1 045", 2142 - 1045, 1097],
  ["D24 Q4-25-cell 4 354−3 243", 4354 - 3243, 1111],
  ["D25 Q3-25-cell 3 243−2 142", 3243 - 2142, 1101],
  ["D26 rullande hyror 4 536", 1101 + 1111 + 1150 + 1174, 4536],
  ["D27 rullande drift 3 227", 790 + 773 + 800 + 864, 3227],
  ["D28 H1-drift 1 664", 800 + 864, 1664],
  ["D29 H1-25 drift 1 544 (+8 %)", num(((800 + 864) / (731 + 813) - 1) * 100, 0), 8],
  ["D30 Q1-26 hyres +10 %", num((1150 / 1045 - 1) * 100, 0), 10],
  ["D31 Q2-26 hyres +7 %", num((1174 / 1097 - 1) * 100, 0), 7],
  ["D32 Q2-26 drift +6 %", num((864 / 813 - 1) * 100, 0), 6],
  ["D33 Q1-26 vinst +27,1 %", num((548 / 431 - 1) * 100, 1), 27.1],
  ["D34 Q2-26 vinst −33,2 %", num((302 / 452 - 1) * 100, 1), -33.2],
  ["D35 Q1 värdepost +28", 548 - 520, 28],
  ["D36 Q2 förvaltning 557", 1077 - 520, 557],
  ["D37 H1-vinst 883", 431 + 452, 883],
  ["D38 återhämtning 2 247", 2220 - (-27), 2247],
  ["D39 1 pp marginal 43,5", num(4354 * 0.01, 1), 43.5],
  ["D40 3 % hyror 92,9", num(4354 * 0.03 * 0.7109, 1), 92.9],
  ["D41 marginalvikt 0,47", num(1 / (3 * 0.7109), 2), 0.47],
  ["D42 hyres/marginalvikt ~2,1", num((4354 * 0.03 * 0.7109) / (4354 * 0.01), 1), 2.1],
  ["D43 P/E÷1,0944 = 10,24", num(11.203 / 1.0944), 10.24],
  ["D44 brutto−EBIT 0,60 pp", num((0.7169 - 0.7109) * 100, 2), 0.6],
  ["D45 ROE−ROIC 3,8 pp", num((0.0927 - 0.0546) * 100, 1), 3.8],
  ["D46 EBIT−netto 23,7 pp", num((0.7109 - 0.4734) * 100, 1), 23.7],
];
for (const [id, faktiskt, vill] of a) ok(id, String(faktiskt) === String(vill), `beräknad ${faktiskt} mot ${vill}`);

// Scenariorutans 9 celler
const scen = [
  [4223.38, 0.7009, 2960.2], [4223.38, 0.7109, 3002.4], [4223.38, 0.7209, 3044.6],
  [4354.0, 0.7009, 3051.7], [4354.0, 0.7109, 3095.3], [4354.0, 0.7209, 3138.8],
  [4484.62, 0.7009, 3143.3], [4484.62, 0.7109, 3188.1], [4484.62, 0.7209, 3233.0],
];
let scenFel = [];
scen.forEach(([int, m, vill]) => { const b = num(int * m, 1); if (String(b) !== String(vill)) scenFel.push(`${int}×${m}→${b} (text ${vill})`); });
ok("D47 scenarioruta 9/9", scenFel.length === 0, scenFel.join("; ") || "9 celler exakta");

// Driftsmarginal per kvartal — textens intervall "69,6–73,6"
const q = [[1045, 731], [1097, 813], [1101, 790], [1111, 773], [1150, 800], [1174, 864]];
const dm = q.map(([h, d]) => num((d / h) * 100, 1));
const dmMin = Math.min(...dm), dmMax = Math.max(...dm);
ok("D48 driftsmarginalintervall 69,6–73,6", dmMin === 69.6 && dmMax === 73.6, `beräknat ${dmMin}–${dmMax} (celler: ${dm.join(", ")})`);

// ============ E. JURIDIK — kontrolleraText-exakt spegel (data/varumarke.json, RegExp 'giu', stateful reset) ============
const vm = JSON.parse(readFileSync(`${R}/data/varumarke.json`, "utf8"));
let jurFel = [], jurVarn = [];
for (const frs of vm.forbjudnaFraser) {
  const re = new RegExp(frs.fran, "giu");
  let m; while ((m = re.exec(yta)) !== null) (frs.allvar === "FEL" ? jurFel : jurVarn).push(`"${m[0]}" (${frs.allvar}) @${m.index}`);
}
ok("E1 kontrolleraText 0 FEL", jurFel.length === 0, jurFel.join("; "));
ok("E2 kontrolleraText 0 VARNING", jurVarn.length === 0, jurVarn.join("; "));
const lagrum = ["2007:528", "2022:260", "2022:261", "1985:716", "2005:59", "2022:482"].filter((l) => yta.includes(l));
ok("E3 exakt en lagrumsfamilj (2007:528)", JSON.stringify(lagrum) === '["2007:528"]', `träff: ${lagrum.join(", ")}`);
ok("E4 utbildningsgrunden buren", /utbildning i (metod|enligt lagen)/i.test(utkast.body) && /inte en rekommendation att köpa, sälja eller behålla/i.test(utkast.body), "negerad rekommendationsform + utbildningsgrund");
ok("E5 R2-not sist", /Publicering av utkastet är kundens beslut \(R2\)/.test(utkast.body), "publiceringsbeslutet förklarat som kundens");
ok("E6 disclaimer sist i bodyn", /Allt innehåll är utbildning i metod/.test(utkast.body.trim().split("\n").slice(-3).join(" ")), "disclaimer-citaten i slutet");

// ============ F. 911-REFERENSER (sex mönster) ============
const p911 = [/\b911\b/, /9\/11/, /9-11/, /11 september 2001/i, /september\s+11\b(?!dag)/i, /eleven september/i];
const t911 = p911.filter((re) => re.test(yta));
ok("F1 911 = 0 på sex mönster", t911.length === 0, `${t911.length} mönsterträff(ar) på title+description+body`);

// ============ G. STRUKTUR ============
const rubriker = (utkast.body.match(/^## /gm) || []).length;
ok("G1 rubriker ≥ 6", rubriker >= 6, `${rubriker} huvudrubriker`);
ok("G2 title utan (utkast)", !/\(utkast\)/.test(utkast.title), "title ren");
ok("G3 readingMinutes 6", utkast.readingMinutes === 6, `rm=${utkast.readingMinutes}`);
const ord = utkast.body.trim().split(/\s+/).length;
noter("G4", `${ord} ord i bodyn`);
ok("G5 publicerad metadata: date 2026-10-21", utkast.publishedAt === "2026-10-21", `publishedAt=${utkast.publishedAt} (rappdagskonventionen)`);

// FYND-belägg (medvetna FAIL = utkastets fel, bärs i diff-filen):
// B1 C23: NP3.ST 1,422 (Sverige) också europeisk över pari — "enda europeiska" falskt på 3 ställen.
// B2 D48: driftsmarginaltopp 74,1 % (Q2-2025: 813/1097), texten skriver 73,6.
// B3 D6b: källsektionens "307,5" — korrekt avrundning av 307,4325 är 307,4 (bodyn har rätt).
// B4 D46: 71,09−47,34 = 23,75 pp — textens "23,7" bör vara "23,8" (halva uppåt).
ok("D6b FYND B3: källsektionen skriver 307,5", /24\s*487\s*÷\s*79,65\s*=\s*307,5/.test(utkast.body) === false, "källraden '24 487 ÷ 79,65 = 307,5 miljoner' är avrundningsfel (korrekt 307,4; bodyn rätt)");

// ============ SAMMANFATTNING ============
console.log(`\nPASS ${pass} · FAIL ${fail} · NOT ${not}`);
if (fails.length) { console.log("\n=== FEL ==="); fails.forEach((x) => console.log("  ✗ " + x)); }
if (nots.length) { console.log("\n=== NOTERINGAR ==="); nots.forEach((x) => console.log("  · " + x)); }
process.exit(fail === 0 ? 0 : 1);
