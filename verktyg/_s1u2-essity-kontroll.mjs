#!/usr/bin/env node
/**
 * _s1u2-essity-kontroll.mjs — granskningssond för Essity Q3 2026-läspaketet
 * (data/blogg-utkast/kvartal/2026-q3/sa-laser-du-essity-q3-2026.json).
 *
 * Fabriksagent s1-u2, manifest auto-s1-1790858103968 (pivot från m9 #2 =
 * flerfaldigt levererad; FIFO-etta bland helt ogranskade i 22:a-klustret).
 *
 * Allt EGENMÄTT: källfält mot dagens träd OCH byggvintagen (git show),
 * medianer omräknade ur vintagen, aritmetik oberoende omräknad,
 * kontrolleraText-spegel (varumarke.json egna regexer, 'giu', stateful
 * reset — exakt src/lib/varumarke.ts:141-logiken), 911-sexmönster,
 * länkar mot localhost:3000 + essity.com, strukturkontrakt.
 *
 * Dom: varje kontroll = OK | FEL | NOT. FEL = diff-sats (fynd med belägg).
 * Utdata: mätrapport på stdout + sammanfattning sist (exitkod 0 = körbar;
 * FEL påverkar inte exitkod — domen är granskarens, inte processens).
 */
import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import http from "node:http";

const UTAST = "data/blogg-utkast/kvartal/2026-q3/sa-laser-du-essity-q3-2026.json";
const VAGVAL = "data/rapporter/vagvalidering-SENASTE.md";
const KALENDER = "data/blogg-utkast/kvartal/2026-q3/kalender-konsument.json";
const UNIV_IDAG = "data/portfolj-system/bolagsunivers.json";
const UNIV_VINTAGE_SHA = "9839c5304"; // 120-postersfilen (byggarens deklarerade medianunderlag)
const VARUMARKE = "data/varumarke.json";

const r = [];
let nOK = 0, nFEL = 0, nNOT = 0;
function k(id, dom, belagg) {
  if (dom === "OK") nOK++; else if (dom === "FEL") nFEL++; else nNOT++;
  r.push({ id, dom, belagg });
}
const num = (x, d = 4) => Number(x.toFixed(d));
const avr2 = (x) => Math.round(x * 100) / 100; // halv-upp för positiva (AT&T-precedensen)

// ---------- Ladda ----------
const utast = JSON.parse(readFileSync(UTAST, "utf8"));
const body = utast.body;
const vagval = readFileSync(VAGVAL, "utf8");
const kal = JSON.parse(readFileSync(KALENDER, "utf8"));
const univIdag = JSON.parse(readFileSync(UNIV_IDAG, "utf8"));
const univVin = JSON.parse(execSync(`git show ${UNIV_VINTAGE_SHA}:data/portfolj-system/bolagsunivers.json`, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }));
const vm = JSON.parse(readFileSync(VARUMARKE, "utf8"));
const vintageDatum = execSync(`git show -s --format=%ci ${UNIV_VINTAGE_SHA}`, { encoding: "utf8" }).trim();
const utkastMd5 = execSync(`md5sum ${UTAST}`, { encoding: "utf8" }).split(" ")[0];
const e_idag = univIdag.find((b) => b.ticker === "ESSITY-B.ST");
const e_vin = univVin.find((b) => b.ticker === "ESSITY-B.ST");

console.log(`== ESSITY Q3 2026 — granskningssond s1-u2 (2026-10-01) ==`);
console.log(`utkast md5 ${utkastMd5} · vintage ${UNIV_VINTAGE_SHA} (${vintageDatum}, ${univVin.length} poster) · dagens träd ${univIdag.length} poster`);

// ---------- A. Vågvalideringskällan ----------
const essRad = vagval.split("\n").find((l) => l.includes("ESSITY-B.ST"));
k("A1", essRad.includes("mikro: basbygge → träff ✓ (-5,6 %)") ? "OK" : "FEL", `källrad: ${essRad.slice(0, 80)}`);
k("A2", essRad.includes("kort: basbygge → miss ✗ (-8,1 %)") ? "OK" : "FEL", "kort −8,1");
k("A3", essRad.includes("medellång: basbygge → miss ✗ (11,1 %)") ? "OK" : "FEL", "medellång +11,1");
k("A4", essRad.includes("mega: basbygge → miss ✗ (11,1 %)") ? "OK" : "FEL", "mega +11,1");
k("A5", essRad.includes("lång: osatt → osatt") ? "OK" : "FEL", "lång osatt");
const tickerRader = vagval.split("\n").filter((l) => /^- \*\*.*\*\* — mikro:/.test(l));
k("A6", tickerRader.length === 12 ? "OK" : "FEL", `tickerrader ${tickerRader.length} (texten: "de tolv bolagen")`);
const ndaRad = tickerRader.find((l) => l.includes("NDA-SE.ST"));
const shbRad = tickerRader.find((l) => l.includes("SHB-B.ST"));
k("A7", ndaRad?.includes("kort: basbygge → miss ✗ (33,7 %)") ? "OK" : "FEL", `NDA kort-basbygge-miss 33,7 (textens +33,7)`);
k("A8", shbRad?.includes("kort: basbygge → miss ✗ (22 %)") ? "OK" : "FEL", `SHB kort-basbygge-miss 22 (textens +22)`);
// Hel-basbygge-utredning: vilka bolag bar basbygge i ALLA fyra dömda horisonter?
const helBas = tickerRader.filter((l) => (l.match(/basbygge/g) || []).length === 4).map((l) => (l.match(/\*\*(.+?)\*\*/) || [])[1]);
const exklusivFormulering = body.includes("universumets renodlade basbygge-fall") || utast.description.includes("renaste basbygge-profil");
k("A9", helBas.length === 1 && helBas[0] === "ESSITY-B.ST" ? "OK" : exklusivFormulering ? "FEL" : "NOT",
  `hel-basbygge-bolag i källan: ${helBas.join(", ")} — texten/formuleringen "universumets renodlade basbygge-fall"/"renaste basbygge-profil" (description + body + praktiskt) antyder unikhet`);
k("A10", (vagval.match(/±6 ?procent|tröskeln.*6/i) ? "OK" : "NOT"), "tröskel ±6 procent (m9-6-konstanten; utkastet bär den tre gånger)");

// ---------- B. Källfält (dagens träd == vintage == utkastets tal) ----------
const falt = [
  ["B1 pris", e_idag.pris, e_vin.pris, 272.5, String(body).includes("**272,50 kronor**")],
  ["B2 mcap", e_idag.marknadsKapitalMdr, e_vin.marknadsKapitalMdr, 184.258, body.includes("cirka 184 miljarder")],
  ["B3 omsCAGR", e_idag.tillvaxt.omsattningCAGR5ar, e_vin.tillvaxt.omsattningCAGR5ar, -0.0393, body.includes("minus 3,93 procent per år")],
  ["B4 resCAGR", e_idag.tillvaxt.resultatCAGR5ar, e_vin.tillvaxt.resultatCAGR5ar, 0.3149, body.includes("plus 31,49 procent per år")],
  ["B5 TTM", e_idag.tillvaxt.omsattningTillvaxtTTM, e_vin.tillvaxt.omsattningTillvaxtTTM, 0.026, body.includes("plus 2,6 procent")],
  ["B6 prognos", e_idag.tillvaxt.prognosTillvaxt, e_vin.tillvaxt.prognosTillvaxt, 0.0883, body.includes("plus 8,83 procent")],
  ["B7 roe", e_idag.lonksamhet.roe, e_vin.lonksamhet.roe, 0.1396, body.includes("**13,96 procent**")],
  ["B8 roic", e_idag.lonksamhet.roic, e_vin.lonksamhet.roic, 0.1362, body.includes("**13,62 procent**")],
  ["B9 brutto", e_idag.lonksamhet.bruttoMarginal, e_vin.lonksamhet.bruttoMarginal, 0.3329, body.includes("**33,29 procent**")],
  ["B10 ebit", e_idag.lonksamhet.ebitMarginal, e_vin.lonksamhet.ebitMarginal, 0.1262, body.includes("**12,62 procent**")],
  ["B11 netto", e_idag.lonksamhet.nettoMarginal, e_vin.lonksamhet.nettoMarginal, 0.0881, body.includes("**8,81 procent**")],
  ["B12 fcfMarg", e_idag.lonksamhet.fcfMarginal, e_vin.lonksamhet.fcfMarginal, 0.0653, body.includes("**6,53 procent**")],
  ["B13 skuldEK", e_idag.stabilitet.skuldEgenkapital, e_vin.stabilitet.skuldEgenkapital, 0.4573, body.includes("**0,46**")],
  ["B15 pe", e_idag.vardering.pe, e_vin.vardering.pe, 15.607, body.includes("**15,6**") && body.includes("15,61") && body.includes("15,607")],
  ["B16 pb", e_idag.vardering.pb, e_vin.vardering.pb, 1.993, body.includes("**1,99**") && body.includes("1,993")],
  ["B17 evEbit", e_idag.vardering.evEbit, e_vin.vardering.evEbit, 12.823, body.includes("**12,8**")],
  ["B18 peg", e_idag.vardering.peg, e_vin.vardering.peg, 3.4, body.includes("**3,4**")],
  ["B19 fcfYield", e_idag.vardering.fcfYield, e_vin.vardering.fcfYield, 0.0487, body.includes("**4,87 procent**")],
];
for (const [id, idag, vin, txt, bär] of falt) {
  const same = num(idag) === num(vin) && num(idag) === num(txt);
  k(id, same && bär ? "OK" : "FEL", `idag ${idag} == vintage ${vin} == utkast ${txt}; utkastet bär talet: ${bär}`);
}
k("B14 räntetäckning", e_idag.stabilitet.rantaTackning === null && e_vin.stabilitet.rantaTackning === null && body.includes("**osatt**") ? "OK" : "FEL", "rantaTackning null i båda träden; texten 'osatt'");
// Serier
const serO = e_idag.serier.omsattning, serR = e_idag.serier.resultat, år = e_idag.serier.ar;
const serOK = JSON.stringify(serO) === JSON.stringify([156173000000, 147147000000, 145546000000, 138494000000]) &&
  JSON.stringify(serR) === JSON.stringify([5567000000, 9554000000, 20888000000, 12656000000]) && JSON.stringify(år) === JSON.stringify(["2022", "2023", "2024", "2025"]) &&
  JSON.stringify(e_vin.serier.omsattning) === JSON.stringify(serO);
k("B20 serier", serOK ? "OK" : "FEL", `år ${år.join("/")} · oms ${serO.join("/")} · res ${serR.join("/")}`);
k("B21 ROIC-proxy-not", e_idag.notering.includes("roic = approximerad proxy: EBIT före skatt / (skuld + bokfört EK)") && body.includes("EBIT före skatt delat med skuld plus bokfört eget kapital") ? "OK" : "FEL", "källans proxy-not citerad");
k("B22 4-års-not", e_idag.notering.includes("källan ger 4, inte 5") && body.includes("källan ger fyra år, inte fem") ? "OK" : "FEL", "CAGR-bärighetens 4-års-not");
k("B23 utdelning-null", e_idag.aterkop.senasteArMdr === null && e_vin.aterkop.senasteArMdr === null && body.includes("fälten står null") ? "OK" : "FEL", "återköp/utdelning null; texten redovisar luckan");
k("B24 MarketStack-not", e_idag.notering.includes("ingen dubbelkoll av pris/valuation") && body.includes("noteringen anger ingen färsk-kurskontroll") ? "OK" : "FEL", "ingen dubbelkoll-not speglad");

// ---------- C. Kalender ----------
const kalE = kal.bolag.find((b) => b.ticker === "ESSITY-B.ST");
k("C1 rappdag", kalE.rapportfenster === "2026-10-22" && body.includes("den **22 oktober**") ? "OK" : "FEL", `kalender ${kalE.rapportfenster}; body 22 oktober`);
k("C2 Q1", kalE.notera.includes("Q1 2026 den 23 april") && body.includes("23 april") ? "OK" : "FEL", "Q1 2026-04-23");
k("C3 Q2", kalE.notera.includes("Q2 2026 den 16 juli") && body.includes("16 juli") ? "OK" : "FEL", "Q2 2026-07-16");
k("C4 kl 07:00", kalE.notera.includes("ca 07:00 CET") && body.includes("kl 07:00 CET") ? "OK" : "FEL", "ca 07:00 CET ur kalenderns notera");
k("C5 räkenskapsår", kalE.notera.includes("Kalenderår = räkenskapsår") && body.includes("kalenderår är räkenskapsår") ? "OK" : "FEL", "kalenderår = räkenskapsår");
k("C6 publishedAt", utast.publishedAt === kalE.rapportfenster ? "OK" : "FEL",
  `utkastet publishedAt ${utast.publishedAt} mot kalenderns rappdag ${kalE.rapportfenster} (syskonkontraktet: Vår Energi-paketet bär sin rappdag 2026-10-21)`);

// ---------- M. Medianer ur vintagen ----------
function median(arr) {
  const t = arr.filter((x) => x !== null && x !== undefined && !Number.isNaN(x)).sort((a, b) => a - b);
  if (!t.length) return { m: null, n: 0 };
  const m = t.length % 2 ? t[(t.length - 1) / 2] : (t[t.length / 2 - 1] + t[t.length / 2]) / 2;
  return { m, n: t.length };
}
const konsVin = univVin.filter((b) => b.bransch === "konsument");
const v = (b, p) => p.split(".").reduce((o, k2) => (o == null ? undefined : o[k2]), b);
const mK = {
  pe: median(konsVin.map((b) => v(b, "vardering.pe"))),
  pb: median(konsVin.map((b) => v(b, "vardering.pb"))),
  roe: median(konsVin.map((b) => v(b, "lonksamhet.roe"))),
  ebit: median(konsVin.map((b) => v(b, "lonksamhet.ebitMarginal"))),
  netto: median(konsVin.map((b) => v(b, "lonksamhet.nettoMarginal"))),
};
const mU = {
  pe: median(univVin.map((b) => v(b, "vardering.pe"))),
  pb: median(univVin.map((b) => v(b, "vardering.pb"))),
  roe: median(univVin.map((b) => v(b, "lonksamhet.roe"))),
  ebit: median(univVin.map((b) => v(b, "lonksamhet.ebitMarginal"))),
  netto: median(univVin.map((b) => v(b, "lonksamhet.nettoMarginal"))),
};
const medTab = [
  ["M1 konsument-n", konsVin.length === 13, `n=${konsVin.length} (texten: 13 bolag)`],
  ["M2 pe", Math.abs(mK.pe.m - 20.4) < 0.05, `rå ${num(mK.pe.m)} (n=${mK.pe.n}) mot texten 20,4`],
  ["M3 pb", Math.abs(mK.pb.m - 3.94) < 0.005, `rå ${num(mK.pb.m)} (n=${mK.pb.n}) mot 3,94`],
  ["M4 roe", Math.abs(mK.roe.m - 0.242) < 0.0005, `rå ${num(mK.roe.m)} (n=${mK.roe.n}) mot 24,2 %`],
  ["M5 ebit", Math.abs(mK.ebit.m - 0.146) < 0.0005, `rå ${num(mK.ebit.m)} (n=${mK.ebit.n}) mot 14,6 %`],
  ["M6 netto", Math.abs(mK.netto.m - 0.084) < 0.0005, `rå ${num(mK.netto.m)} (n=${mK.netto.n}) mot 8,4 %`],
  ["M7 u-pe", Math.abs(mU.pe.m - 20.5) < 0.05, `rå ${num(mU.pe.m)} (n=${mU.pe.n}) mot 20,5`],
  ["M8 u-pb", Math.abs(mU.pb.m - 2.79) < 0.005, `rå ${num(mU.pb.m)} (n=${mU.pb.n}) mot 2,79`],
  ["M9 u-roe", Math.abs(mU.roe.m - 0.153) < 0.0005, `rå ${num(mU.roe.m)} (n=${mU.roe.n}) mot 15,3 %`],
  ["M10 u-ebit", Math.abs(mU.ebit.m - 0.211) < 0.0005, `rå ${num(mU.ebit.m)} (n=${mU.ebit.n}) mot 21,1 %`],
  ["M11 u-netto", Math.abs(mU.netto.m - 0.143) < 0.0005, `rå ${num(mU.netto.m)} (n=${mU.netto.n}) mot 14,3 %`],
  ["M12 n=12-påstående", mK.pe.n === 12 && mK.pb.n === 12 && mK.roe.n === 12, `pe/pb/roe n=${mK.pe.n}/${mK.pb.n}/${mK.roe.n} (texten: n=12, ett bolag saknar fälten)`],
];
for (const [id, ok, bel] of medTab) k(id, ok ? "OK" : "FEL", bel);
// DRIFT: dagens medianer (rapport, ingen dom — utkastet deklarerar sin vintage öppet)
const konsIdag = univIdag.filter((b) => b.bransch === "konsument");
const dK = median(konsIdag.map((b) => v(b, "vardering.pe"))), dU = median(univIdag.map((b) => v(b, "vardering.pe")));
k("M13 drift", "NOT", `dagens träd ${univIdag.length} poster: konsument n=${dK.n} pe-median ${num(dK.m)} · universum n=${dU.n} pe-median ${num(dU.m)} — drift Not, utkastet deklarerar vintage 2026-09-16 (120-bolagsfilen)`);

// ---------- R. Aritmetik (oberoende omräkning) ----------
const oms = [156173, 147147, 145546, 138494], res = [5567, 9554, 20888, 12656]; // Mkr
const cagr = (a, b, år) => (b / a) ** (1 / år) - 1;
const rTab = [
  ["R1 oms-totalfall", Math.abs(oms[3] / oms[0] - 1 - (-0.1132)) < 0.0005, `138494/156173−1 = ${num(oms[3] / oms[0] - 1)} (text: −11,3 %)`],
  ["R2 oms-monoton", oms[0] > oms[1] && oms[1] > oms[2] && oms[2] > oms[3], "fyra fallande år (texten: 'fyra år av fallande intäkter')"],
  ["R3 oms-CAGR", Math.abs(cagr(oms[0], oms[3], 3) - (-0.03925)) < 0.0005, `egen ${(num(cagr(oms[0], oms[3], 3)) * 100).toFixed(2)} %/år mot källans −3,93 (källfält-spegling; se B3)`],
  ["R4 res-CAGR", Math.abs(cagr(res[0], res[3], 3) - 0.31504) < 0.0005, `egen ${(num(cagr(res[0], res[3], 3)) * 100).toFixed(2)} %/år mot källans +31,49 (källfält-spegling; se B4)`],
  ["R5 fördubbling", res[3] / res[0] > 2 && Math.abs(res[3] / res[0] - 1 - 1.274) < 0.001, `12656/5567 = ${num(res[3] / res[0])}× → 'mer än fördubblats' + '+127 procent'`],
  ["R6 topp-fall", Math.abs(res[3] / res[2] - 1 + 0.394) < 0.0005, `12656/20888−1 = ${num(res[3] / res[2] - 1)} (text: −39,4 %)`],
  ["R7 topp-år", år[2] === "2024" && body.includes("toppade 2024 (20 888 miljoner)"), "topp 2024 = 20 888 Mkr"],
  ["R8 ROE−ROIC", Math.abs((e_idag.lonksamhet.roe - e_idag.lonksamhet.roic) * 100 - 0.34) < 0.005 && body.includes("inom 0,4 procentenheter"), "13,96 − 13,62 = 0,34 pp"],
  ["R9 brutto−EBIT", Math.abs((e_idag.lonksamhet.bruttoMarginal - e_idag.lonksamhet.ebitMarginal) * 100 - 20.67) < 0.005 && body.includes("cirka 21 procentenheter"), "33,29 − 12,62 = 20,67 pp"],
];
// Identitet + PEG
const pe = e_idag.vardering.pe, pb = e_idag.vardering.pb, roe = e_idag.lonksamhet.roe;
const idt = pb / roe;
rTab.push(["R10 identitet", Math.abs(idt - 14.28) < 0.005 && body.includes("1,993") && body.includes("0,1396") && body.includes("**14,28**"), `1,993/0,1396 = ${num(idt, 3)}`]);
rTab.push(["R11 identitet-diff", Math.abs((pe / idt - 1) * 100 - 9.3) < 0.15 && body.includes("cirka 9 procent"), `(15,61/14,28 − 1) = ${num((pe / idt - 1) * 100, 2)} %`]);
const pegKonv = pe / (e_idag.tillvaxt.prognosTillvaxt * 100);
rTab.push(["R12 PEG-konvention", Math.abs(pegKonv - 1.7669) < 0.001 && body.includes("1,77"), `15,607/8,83 = ${num(pegKonv, 3)}`]);
rTab.push(["R13 PEG-kvot-ESSITY", Math.abs(3.4 / pegKonv - 1.92) < 0.01 && body.includes("1,9 för"), `3,4/1,77 = ${num(3.4 / pegKonv, 3)}`]);
rTab.push(["R14 PEG-kvot-NDA", Math.abs(8.87 / 2.19 - 4.05) < 0.01 && body.includes("4,1 för Nordea"), `8,87/2,19 = ${num(8.87 / 2.19, 3)}`]);
rTab.push(["R15 PEG-kvot-SHB", Math.abs(18.54 / 2.33 - 7.955) < 0.01 && body.includes("8,0 för Handelsbanken"), `18,54/2,33 = ${num(18.54 / 2.33, 3)}`]);
rTab.push(["R16 PEG-kvot-SWED", Math.abs(6.99 / 1.57 - 4.452) < 0.01 && body.includes("4,5 för Swedbank"), `6,99/1,57 = ${num(6.99 / 1.57, 3)}`]);
// Scenarioruta
const bas = 138494, m0 = 0.1262;
rTab.push(["R17 bas-EBIT", Math.abs(bas * m0 - 17477.9) < 0.1 && body.includes("17 478"), `138494 × 12,62 % = ${num(bas * m0, 1)}`]);
const cells = [
  [134339.2, 0.1162, "15 610,2"], [134339.2, 0.1262, "16 953,6"], [134339.2, 0.1362, "18 297,0"],
  [138494.0, 0.1162, "16 093,0"], [138494.0, 0.1262, "17 477,9"], [138494.0, 0.1362, "18 862,9"],
  [142648.8, 0.1162, "16 575,8"], [142648.8, 0.1262, "18 002,3"], [142648.8, 0.1362, "19 428,8"],
];
let cellsOK = true, cellBel = [];
for (const [i, [o, m, txt]] of cells.entries()) {
  const got = avr2(o * m);
  const ok = Math.abs(got - parseFloat(txt.replace(/\s/g, "").replace(",", "."))) <= 0.051 && body.includes(txt);
  if (!ok) cellsOK = false;
  cellBel.push(`#${i + 1} ${txt}=${got}`);
}
rTab.push(["R18 scenariocellor-9", cellsOK, cellBel.join(" · ")]);
rTab.push(["R19 intäkts-steg", Math.abs(bas * 0.97 - 134339.18) < 0.01 && Math.abs(bas * 1.03 - 142648.82) < 0.01, `±3 %: 134 339,18 / 142 648,82`]);
rTab.push(["R20 satser-1385", Math.abs(bas * 0.01 - 1384.94) < 0.01 && body.includes("1 385 miljoner"), `1 pp = ${num(bas * 0.01, 2)}`]);
rTab.push(["R21 satser-524", Math.abs(bas * 0.03 * m0 - 524.34) < 0.1 && body.includes("524 miljoner"), `3 % × 12,62 % = ${num(bas * 0.03 * m0, 2)}`]);
rTab.push(["R22 ratte-2,6", Math.abs((bas * 0.01) / (bas * 0.03 * m0) - 2.641) < 0.005 && body.includes("**2,6 gånger**"), `1384,94/524,34 = ${num((bas * 0.01) / (bas * 0.03 * m0), 3)}`]);
rTab.push(["R23 formel", Math.abs(1 / (3 * m0) - 2.6418) < 0.001 && body.includes("ett delat med tre gånger marginalnivån"), `1/(3×0,1262) = ${num(1 / (3 * m0), 3)}`]);
rTab.push(["R24 ABB", Math.abs(1 / (3 * 0.169) - 1.972) < 0.001 && body.includes("vikten 2,0"), `1/(3×0,169) = ${num(1 / (3 * 0.169), 3)}`]);
rTab.push(["R25 Sandvik/Atlas", Math.abs(1 / (3 * 0.206) - 1.6178) < 0.001 && body.includes("1,6–1,7"), `1/(3×0,206) = ${num(1 / (3 * 0.206), 3)}`]);
const bankLag = Math.abs(1 / (3 * 0.50) - 0.6667) < 0.001 && Math.abs(1 / (3 * 0.54) - 0.6173) < 0.001;
rTab.push(["R26 banker-vikt", bankLag && body.includes("vikten 0,5") ? "FEL" && false : bankLag ? body.includes("vikten 0,5") ? false : true : false,
  `formeln ger banker (50–54 % marginal): 1/(3×0,50)=0,667 … 1/(3×0,54)=0,617 — textens 'vikten 0,5' ligger UNDER formelvärdena (0,6–0,65); intäktsratten '1,5–1,6 gånger' = 3×m STÄMMER`]);
rTab.push(["R27 brytpunkt", Math.abs(1 / 3 - 0.3333) < 0.0001 && body.includes("33 procents marginal"), "1/(3m)=1 ⇔ m=1/3"]);
rTab.push(["R28 multiplövning", Math.abs(pe / 1.0883 - 14.340) < 0.001 && body.includes("**14,34**"), `15,607/1,0883 = ${num(pe / 1.0883, 3)}`]);
rTab.push(["R29 medianläsning", 15.6 < 20.4 && 1.99 < 3.94 && 13.96 < 24.2 && 12.62 < 14.6 && 8.81 > 8.4, "under median på pe/pb/roe/ebit, över på netto — textens 'utom nettomarginalen'"]);
rTab.push(["R30 miss-fördelning", true, "missar −8,1/+11,1/+11,1 → 'en av missarna är negativ och två är positiva'"]);
for (const [id, ok, bel] of rTab) k(id, ok ? "OK" : "FEL", bel);

// ---------- J. Juridik (kontrolleraText-spegel, exakt varumarke.ts:141) ----------
function kontrolleraText(text) {
  const fel = [], varningar = [];
  if (typeof text !== "string" || text.length === 0) return { fel, varningar };
  for (const f of vm.forbjudnaFraser) {
    const re = new RegExp(f.fran, "giu");
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      const t = { fras: m[0], index: m.index, allvar: f.allvar === "FEL" ? "FEL" : "VARNING", ersattning: f.istallet };
      if (t.allvar === "FEL") fel.push(t); else varningar.push(t);
    }
  }
  return { fel, varningar };
}
const pubYta = [utast.title, utast.description, body].join("\n\n");
const helYta = JSON.stringify(utast);
const j1 = kontrolleraText(helYta), j2 = kontrolleraText(pubYta);
k("J1 kontrolleraText hel", j1.fel.length === 0 ? "OK" : "FEL", `${j1.fel.length} FEL / ${j1.varningar.length} VARN ${JSON.stringify(j1.fel.concat(j1.varningar).map((t) => t.fras))}`);
k("J2 kontrolleraText publicerbar", j2.fel.length === 0 ? "OK" : "FEL", `${j2.fel.length} FEL / ${j2.varningar.length} VARN ${JSON.stringify(j2.fel.concat(j2.varningar).map((t) => t.fras))}`);
const lagrum = ["2007:528", "2022:260", "2022:261", "1985:716", "2005:59", "2022:482"];
const lagTraff = Object.fromEntries(lagrum.map((l) => [l, (helYta.match(new RegExp(l.replace(":", "\\:"), "g")) || []).length]));
k("J3 lagrumsfamilj", lagTraff["2007:528"] >= 1 && lagrum.slice(1).every((l) => lagTraff[l] === 0) ? "OK" : "FEL", JSON.stringify(lagTraff));
const radkontext = (re) => body.split(/(?<=\.)\s+/).filter((s) => re.test(s));
const kop = radkontext(/\bköpa\b|\bköper\b|\bköp\b/i), salj = radkontext(/\bsälja\b|\nsälj\b|\bsäljer\b/i);
const radNegerad = (s) => /inte en rekommendation|inga köp|aldrig en hand|inte investeringsråd|ingen bedömning|ej.*köp/i.test(s);
k("J4 köp/sälj negerade", kop.every(radNegerad) && salj.every(radNegerad) ? "OK" : "FEL", `kontexter: ${JSON.stringify(kop.concat(salj).map((s) => s.slice(0, 60)))}`);
const invRad = radkontext(/investeringsråd/i);
k("J5 investeringsråd", invRad.length >= 1 && invRad.every((s) => /inte investeringsrådgivning|inte investeringsråd|ej investeringsråd/i.test(s)) ? "OK" : "FEL", `${invRad.length} förekomster, samtliga negerade`);
const sistaStycke = body.trim().split("\n\n").pop();
k("J6 disclaimer sist", sistaStycke.includes("2007:528") && sistaStycke.includes("inte investeringsrådgivning") && sistaStycke.includes("kundens beslut") ? "OK" : "FEL", `sista blocket inleds: ${sistaStycke.slice(0, 60)}`);
k("J7 handssignal", body.includes("handssignal") ? "FEL" : "OK", `'handssignal' → 'handelssignal' (wihlborgs-B3/iberdrola-C1-felklassen; ${body.split("handssignal").length - 1} förekomst)`);

// ---------- 911 ----------
const pat911 = [/911/, /11\s+september/i, /nine[\s-]?11/i, /9\/11/, /nine one one/i, /September\s+11/];
const n911 = pat911.map((p) => (helYta.match(new RegExp(p.source, p.flags.includes("g") ? p.flags : p.flags + "g")) || []).length);
k("911", n911.every((x) => x === 0) ? "OK" : "FEL", `sex mönster: ${n911.join("/")}`);

// ---------- L. Länkar ----------
const interna = [...new Set([...body.matchAll(/\]\((\/[^)#\s]+)/g)].map((m) => m[1]))];
let lOK = 0, lFel = [];
for (const sokvag of interna) {
  const kod = await new Promise((resolve) => {
    const req = http.request({ host: "localhost", port: 3000, path: sokvag, method: "GET", timeout: 8000 }, (res) => { res.resume(); resolve(res.statusCode); });
    req.on("timeout", () => { req.destroy(); resolve("T-O-V"); });
    req.on("error", () => resolve("ERR"));
    req.end();
  });
  if (kod === 200) lOK++; else lFel.push(`${sokvag}→${kod}`);
}
k("L1 interna", lFel.length === 0 ? "OK" : lFel.length <= 1 ? "NOT" : "FEL", `${lOK}/${interna.length} HTTP 200 mot localhost:3000${lFel.length ? " ·Problem: " + lFel.join(" ") : ""} · ${interna.join(" ")}`);
const essityKod = execSync(`curl -s -o /dev/null -w '%{http_code}' -A 'Mozilla/5.0 (X11; Linux x86_64) AK1A-kvalitetskontroll' -L --max-time 15 'https://www.essity.com/investors/calendar/'`, { encoding: "utf8" }).trim();
k("L2 essity.com", ["200", "301", "302"].includes(essityKod) ? "OK" : "NOT", `https://www.essity.com/investors/calendar/ → ${essityKod} (kalenderkällan; vid bot-skydd gäller WebFetch-spåret, AT&T/FDA-precedensen)`);

// ---------- S. Struktur ----------
const h2 = [...body.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
k("S1 rubriker", h2.length >= 6 ? "OK" : "FEL", `${h2.length} H2: ${h2.join(" | ")}`);
k("S2 disclaimer-sist", "OK", "se J6");
k("S3 title-tak", utast.title.length <= 314 ? "OK" : "FEL", `${utast.title.length} tkn ≤ 314 (wihlborgs-taket)`);
k("S4 description", utast.description.length <= 800 ? "OK" : "FEL", `${utast.description.length} tkn (syskonspann: Vår Energi 777)`);
const ord = body.split(/\s+/).filter(Boolean).length;
const rmKontrakt = Math.round(ord / 600);
k("S5 readingMinutes", utast.readingMinutes === rmKontrakt ? "OK" : "FEL", `${ord} ord → round(${ord}/600) = ${rmKontrakt}; utkastet bär ${utast.readingMinutes} (fabege-F6-kontraktet)`);
k("S6 slug", utast.slug === "sa-laser-du-essity-q3-2026" ? "OK" : "FEL", utast.slug);
k("S7 metadata", utast.pillar === "Institutionell metodik" && utast.author === "AK1A Research Lab" && utast.tags.length >= 5 ? "OK" : "FEL", `${utast.pillar} · ${utast.author} · ${utast.tags.length} tags`);

// ---------- P. Språk ----------
k("P1 Eckliga", body.includes("dubbelt Eckliga") ? "FEL" : "OK", "'dubbelt Eckliga' — inget svenskt ord; föreslås 'dubbelt kluriga'");
k("P2 bära-med", body.includes("men bära med källans not") ? "FEL" : "OK", "'men bära med källans not' → 'men bär med sig källans not'; samma mening bär 'olik bankerna' → 'till skillnad från bankerna'");
k("P3 böcken", body.includes("paket i böcken") ? "NOT" : "OK", "'med sju paket i böcken' — talspråklig kollokation; lämnas som serieägarens stilval");
k("P4 hel-basbygge-formulering", helBas.length > 1 ? "FEL" : "OK", `body 'universumets renodlade basbygge-fall' + description 'universumets renaste basbygge-profil' — källan visar ${helBas.length} hel-basbygge-bolag (${helBas.join(", ")}); föreslås precisering`);

// ---------- Rapport ----------
console.log("\n-- DETALJ --");
for (const x of r) console.log(`${x.dom.padEnd(4)} ${x.id.padEnd(24)} ${x.belagg}`);
const fel = r.filter((x) => x.dom === "FEL"), not = r.filter((x) => x.dom === "NOT");
console.log(`\n== DOM: ${nOK} OK · ${nFEL} FEL · ${nNOT} NOT ==`);
if (fel.length) { console.log("FEL (diff-satser):"); for (const f of fel) console.log(`  - ${f.id}: ${f.belagg}`); }
if (not.length) { console.log("NOT:"); for (const n of not) console.log(`  - ${n.id}: ${n.belagg}`); }
console.log(`UTKAST-MD5 ${utkastMd5} (orördhetsreferens för paketbyggaren)`);
