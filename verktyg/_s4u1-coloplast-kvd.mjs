#!/usr/bin/env node
// KVD s4-u1 — COLOPLAST Q3-LÄSPAKET (kvartalsrapportserien, halso-grenen)
// Oberoende verifiering av data/blogg-utkast/kvartal/2026-q3/sa-laser-du-coloplast-q3-2026.json
// mot data/portfolj-system/bolagsunivers.json (COLO-B.CO) och kalender-halso.json.
// Grupper: S struktur · K källtalsparitet · A aritmetik · M medianer/rang · R scenarioruta ·
// J juridikgrind · L länkar (sitemap-giltighetsgrind enligt Stora Enso-precedensen) · O ord/tecken.
import fs from "node:fs";

const FIL = "data/blogg-utkast/kvartal/2026-q3/sa-laser-du-coloplast-q3-2026.json";
const PAKET = JSON.parse(fs.readFileSync(FIL, "utf8"));
const U = JSON.parse(fs.readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const POSTER = Array.isArray(U) ? U : (U.poster || U.bolag || U.universum || Object.values(U).find(Array.isArray));
const P = POSTER.find((x) => x.ticker === "COLO-B.CO");
const KAL = JSON.parse(fs.readFileSync("data/blogg-utkast/kvartal/2026-q3/kalender-halso.json", "utf8"));
const b = PAKET.body;
const sv = (x, d = 0) =>
  x.toLocaleString("sv-SE", { minimumFractionDigits: d, maximumFractionDigits: d }).replace(/\u00A0/g, " ");
const na = (x) => sv(x); // tusenavgränsad, 0 decimaler
const OM = P.serier.omsattning.map((v) => v / 1e6); // miljoner DKK
const RS = P.serier.resultat.map((v) => v / 1e6); // miljoner DKK

let PASS = 0, FEL = 0, VARN = 0;
const fel = [], varn = [];
function k(ok, namn, extra = "") {
  if (ok) { PASS++; }
  else { FEL++; fel.push(namn + (extra ? ` (${extra})` : "")); }
}
function w(ok, namn, extra = "") {
  if (ok) PASS++; else { VARN++; varn.push(namn + (extra ? ` (${extra})` : "")); }
}
const finns = (s, n = 1) => (b.split(s).length - 1) >= n;

// ---------- S STRUKTUR ----------
k(PAKET.slug === "sa-laser-du-coloplast-q3-2026", "S1 slug");
k(FIL.endsWith(PAKET.slug + ".json"), "S2 filnamn-paritet");
k(PAKET.pillar === "Institutionell metodik", "S3 pillar");
k(PAKET.author === "AK1A Research Lab", "S4 author");
k(PAKET.publishedAt === "2026-11-03", "S5 publishedAt = kalenderns rappdag");
const kalcolo = KAL.bolag.find((x) => x.ticker === "COLO-B.CO");
k(!!kalcolo && PAKET.publishedAt === "2026-11-03" && kalcolo.rapportfenster.startsWith("2026-11-03"), "S6 rappdag = kalender-posten");
k(FIL.includes("data/blogg-utkast/"), "S7 utkast-läge");
k(!FIL.startsWith("data/blogg/"), "S8 INTE live-mappen");
k(Array.isArray(PAKET.tags) && PAKET.tags.length === 8 && new Set(PAKET.tags).size === 8, "S9 tags 8 unika");
k(PAKET.description.length >= 140 && PAKET.description.length <= 155, "S10 description 140–155", `len=${PAKET.description.length}`);
const ord = b.split(/\s+/).filter(Boolean).length;
k(PAKET.readingMinutes === Math.round(ord / 600), "S11 readingMinutes = round(ord/600)", `${ord} ord`);
k(ord >= 2400 && ord <= 3400, "S12 ordfönster 2400–3400", `${ord}`);
k(b.startsWith("Coloplast —"), "S13 body inleds med bolagsnamn");
k(PAKET.title.startsWith("Coloplasts rapport 3 november"), "S14 title-ankare");
k(finns("## Urvalet") && finns("## Nyckeltalen") && finns("## Datavakten") && finns("## Så står sig bolaget") && finns("## Tre sätt") && finns("## Praktiskt") && finns("## Källor"), "S15 sektioner");

// ---------- K KÄLLTALSPARITET (fält för fält mot COLO-B.CO-posten) ----------
const KF = [
  [sv(P.pris, 2), "pris 473,50"],
  ["106,712", "mcap"],
  [sv(P.vardering.pe, 2), "P/E"],
  [sv(P.vardering.pb, 3), "P/B 7,976"],
  [sv(P.vardering.evEbit, 3), "EV/EBIT 17,543"],
  [sv(P.vardering.peg, 1), "PEG 1,2"],
  [sv(P.lonksamhet.roe * 100, 2), "ROE %"],
  [sv(P.lonksamhet.roic * 100, 2), "ROIC %"],
  [sv(P.lonksamhet.bruttoMarginal * 100, 2), "bruttomarginal %"],
  [sv(P.lonksamhet.ebitMarginal * 100, 2), "EBIT-marginal %"],
  [sv(P.lonksamhet.nettoMarginal * 100, 2), "nettomarginal %"],
  [sv(P.lonksamhet.fcfMarginal * 100, 2), "FCF-marginal %"],
  [sv(P.vardering.fcfYield * 100, 2), "FCF-avkastning %"],
  [sv(P.tillvaxt.prognosTillvaxt * 100, 2), "prognostillväxt %"],
  [sv(P.tillvaxt.omsattningTillvaxtTTM * 100, 2), "TTM %"],
  [sv(P.stabilitet.skuldEgenkapital, 4), "skuld/EK 1,7807"],
  [sv(P.tillvaxt.omsattningCAGR5ar * 100, 2), "intäktsCAGR %"],
  [sv(P.tillvaxt.resultatCAGR5ar * 100, 2), "resultatCAGR % (negativt)"],
];
for (const [s, namn] of KF) k(finns(s), `K ${namn} "${s}"`);
const oms = OM, res = RS;
k(finns(`${na(oms[0])} → ${na(oms[1])} → ${na(oms[2])} → ${na(oms[3])}`), "K intäktsserie rad");
k(finns(`${na(res[0])} → ${na(res[1])} → ${na(res[2])} → ${na(res[3])}`), "K resultatserie rad");
k(finns(na(OM[3])) && finns(na(9897)), "K FY-intäkt + Ostomy-bas i tal");

// ---------- A ARITMETIK (oberoende omräkning) ----------
const mcap = P.marknadsKapitalMdr * 1000, pris = P.pris, pe = P.vardering.pe, pb = P.vardering.pb,
  evm = P.vardering.evEbit, roe = P.lonksamhet.roe, ebitm = P.lonksamhet.ebitMarginal,
  nmF = P.lonksamhet.nettoMarginal, D = P.stabilitet.skuldEgenkapital, prog = P.tillvaxt.prognosTillvaxt,
  ttm = P.tillvaxt.omsattningTillvaxtTTM;
const EK = mcap / pb, aktier = mcap / pris, EKa = EK / aktier;
k(finns(na(EK)), "A1 implicit EK 13 379", na(EK));
k(finns(sv(EKa, 2)), "A2 EK/aktie 59,37", sv(EKa, 2));
k(finns(sv(aktier, 1)), "A3 aktier 225,4 M", sv(aktier, 1));
k(Math.abs(pris / EKa - pb) < 0.001, "A4 kontroll P/B stänger exakt", `${pris / EKa}`);
k(finns(sv(pe * roe, 2)), "A5 identitet PE×ROE 7,16", sv(pe * roe, 2));
k(finns(sv(pb / roe, 2)), "A6 implicit PE 43,04", sv(pb / roe, 2));
k(finns(sv((1 - pe / (pb / roe)) * 100, 1)), "A7 identitetsgap 10,2 %", sv((1 - pe / (pb / roe)) * 100, 1));
const vA = mcap / pe, vB = roe * EK, vC = nmF * oms[3], TTI = oms[3] * (1 + ttm), vC2 = nmF * TTI, vD = res[3];
for (const [v, n] of [[vA, "2 761"], [vB, "2 479"], [vC, "2 709"], [vC2, "2 864"], [vD, "3 636"]])
  k(finns(na(v)), `A8 vinstväg ${n}`, na(v));
k(finns(sv(vA / aktier, 2)), "A9 EPS implicit 12,25", sv(vA / aktier, 2));
k(finns(sv(vD / aktier, 2)), "A10 EPS bokförd 16,13", sv(vD / aktier, 2));
k(finns(sv((1 - vA / vD) * 100, 1)), "A11 nämnargap 24,1 %", sv((1 - vA / vD) * 100, 1));
const EBIT = ebitm * oms[3], EV = evm * EBIT, NED = EV - mcap, SKULD = D * EK, KASSA = SKULD - NED;
for (const [v, n] of [[EBIT, "7 311"], [EV, "128 263"], [NED, "21 551"], [SKULD, "23 824"], [KASSA, "2 273"]])
  k(finns(na(v)), `A12 EV-kedja ${n}`, na(v));
k(finns(sv(EV / aktier, 2)) && finns(sv(NED / aktier, 2)), "A13 per aktie 569,13/95,63");
const steg = (a, i) => (a[i] / a[i - 1] - 1) * 100;
const sO = [1, 2, 3].map((i) => steg(oms, i)), sR = [1, 2, 3].map((i) => steg(res, i));
k(finns(`plus ${sv(sO[0], 2)}, plus ${sv(sO[1], 2)} och plus ${sv(sO[2], 2)}`), "A14 intäktsteg rad");
k(finns(`plus ${sv(sR[0], 2)}, plus ${sv(sR[1], 2)} och **minus ${sv(-sR[2], 2)}`), "A15 resultatsteg rad");
const cagr = (a) => (Math.pow(a[3] / a[0], 1 / 3) - 1) * 100;
k(Math.abs(cagr(oms) - P.tillvaxt.omsattningCAGR5ar * 100) < 0.01, "A16 intäktsCAGR replikerar filfältet", sv(cagr(oms), 2));
k(Math.abs(cagr(res) - P.tillvaxt.resultatCAGR5ar * 100) < 0.01, "A17 resultatCAGR replikerar filfältet", sv(cagr(res), 2));
const nm = res.map((v, i) => (v / oms[i]) * 100);
k(finns(`${sv(nm[0], 2)} → ${sv(nm[1], 2)} → ${sv(nm[2], 2)} → ${sv(nm[3], 2)}`), "A18 marginaltrappa rad");
k(nm[0] > nm[1] && nm[1] > nm[2] && nm[2] > nm[3], "A19 fyra fallande nettomarginaler (monotoni)");
k(finns(sv(cagr(oms) - cagr(res), 2)), "A20 CAGR-sax 15,51", sv(cagr(oms) - cagr(res), 2));
k(finns(sv(1 / (3 * (nm[3] / 100)), 2)), "A21 marginalvikt 2,56", sv(1 / (3 * (nm[3] / 100)), 2));
k(finns(sv(oms[3] * 0.01, 1)) && finns(sv(oms[3] * 0.03 * (nm[3] / 100), 1)), "A21b vikt-tungder 278,7/109,1", `${sv(oms[3] * 0.01, 1)}/${sv(oms[3] * 0.03 * (nm[3] / 100), 1)}`);
k(finns(na(TTI)), "A22 TTM-intäkt 29 463", na(TTI));
k(finns(sv(pe / (prog * 100), 2)), "A23 PEG-konvention 7,82", sv(pe / (prog * 100), 2));
k(finns(sv(pe / P.vardering.peg, 1)), "A24 implicit tillväxt 32,2", sv(pe / P.vardering.peg, 1));
k(finns(sv(P.vardering.peg * prog * 100, 2)), "A25 implicit P/E 5,93", sv(P.vardering.peg * prog * 100, 2));
const fA = P.vardering.fcfYield * mcap, fB = P.lonksamhet.fcfMarginal * oms[3], fB2 = P.lonksamhet.fcfMarginal * TTI;
k(finns(na(fA)) && finns(na(fB)) && finns(na(fB2)), "A26 FCF-triplett 4 663/4 574/4 835");
k(finns(sv((1 - fB / fA) * 100, 2).replace(",", ",")), "A27 FCF-gap 1,91 %", sv((1 - fB / fA) * 100, 2));
k(finns(sv(pris / (fA / aktier), 2)), "A28 P/FCF 22,88", sv(pris / (fA / aktier), 2));
k(finns(sv((P.lonksamhet.bruttoMarginal - ebitm) * 100, 1)) && finns(sv((ebitm - nmF) * 100, 1)), "A29 DuPont-klipp 41,0/16,5");

// ---------- M MEDIANER OCH RANG (omräknade ur 195-postfilen) ----------
const halso = POSTER.filter((p) => p.bransch === "halso");
const alla = POSTER;
function med(arr) { const s = arr.filter((v) => typeof v === "number" && !isNaN(v)).sort((x, y) => x - y); if (!s.length) return null; const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }
function vag(p, nyck) { return p.vardering?.[nyck] ?? p.lonksamhet?.[nyck] ?? p.tillvaxt?.[nyck] ?? p.stabilitet?.[nyck]; }
function medG(nyck) { return med(halso.map((p) => vag(p, nyck)).filter((v) => typeof v === "number")); }
function medU(nyck) { return med(alla.map((p) => vag(p, nyck)).filter((v) => typeof v === "number")); }
function rang(nyck, asc) {
  const l = halso.filter((p) => typeof vag(p, nyck) === "number").map((p) => ({ t: p.ticker, v: vag(p, nyck) })).sort((x, y) => (asc ? x.v - y.v : y.v - x.v));
  return { r: l.findIndex((x) => x.t === "COLO-B.CO") + 1, n: l.length };
}
k(halso.length === 22, "M0 hälsogrenen 22 bolag", `${halso.length}`);
const MK = [
  [sv(medG("pe"), 2), "median P/E 26,08"],
  [sv(medG("pb"), 3), "median P/B 3,620"],
  [sv(medG("evEbit"), 2), "median EV/EBIT 17,86"],
  [sv(medG("peg"), 2), "median PEG 0,79"],
  [sv(medG("fcfYield") * 100, 2), "median FCF-avk 4,31"],
  [sv(medG("roe") * 100, 2), "median ROE 15,41"],
  [sv(medG("bruttoMarginal") * 100, 2), "median brutto 71,03"],
  [sv(medG("nettoMarginal") * 100, 2), "median netto 12,97"],
  [sv(medG("omsattningCAGR5ar") * 100, 2), "median intäktsCAGR 7,30"],
  [sv(medG("resultatCAGR5ar") * 100, 2), "median resultatCAGR 4,54"],
  [sv(medG("prognosTillvaxt") * 100, 2), "median prognos 24,22"],
];
for (const [s, namn] of MK) k(finns(s), `M ${namn} "${s}"`);
k(finns(sv(medU("pe"), 2)) && finns(sv(medU("pb"), 3)) && finns(sv(medU("evEbit"), 2)), "M universum P/E+P/B+EV/EBIT");
k(finns(sv(medU("roe") * 100, 2)) && finns(sv(medU("bruttoMarginal") * 100, 2)) && finns(sv(medU("nettoMarginal") * 100, 2)), "M universum ROE+brutto+netto");
k(finns(sv(medU("prognosTillvaxt") * 100, 2)) && finns(sv(medU("skuldEgenkapital"), 2)), "M universum prognos+skuld");
const rPE = rang("pe", false), rPB = rang("pb", false), rEV = rang("evEbit", false), rPEG = rang("peg", false),
  rROE = rang("roe", false), rBM = rang("bruttoMarginal", false), rNM = rang("nettoMarginal", false),
  rOC = rang("omsattningCAGR5ar", false), rRC = rang("resultatCAGR5ar", false), rPT = rang("prognosTillvaxt", true), rSE = rang("skuldEgenkapital", true);
k(finns(`${rPE.r} högst av ${rPE.n}`), `M rang P/E ${rPE.r}/${rPE.n}`);
k(finns(`${rPB.r} högst av ${rPB.n}`), `M rang P/B ${rPB.r}/${rPB.n}`);
k(finns(`${rEV.r} av ${rEV.n}`), `M rang EV/EBIT ${rEV.r}/${rEV.n}`);
k(finns(`${rPEG.r} högst av ${rPEG.n}`), `M rang PEG ${rPEG.r}/${rPEG.n}`);
k(finns(`${rROE.r} av ${rROE.n}`), `M rang ROE ${rROE.r}/${rROE.n}`);
k(finns(`${rBM.r} av ${rBM.n}`), `M rang brutto ${rBM.r}/${rBM.n}`);
k(finns(`${rNM.r} av ${rNM.n}`), `M rang netto ${rNM.r}/${rNM.n}`);
k(finns(`${rOC.r} av ${rOC.n}`), `M rang intäktsCAGR ${rOC.r}/${rOC.n}`);
k(finns(`${rRC.r} av ${rRC.n}`), `M rang resultatCAGR ${rRC.r}/${rRC.n}`);
k(rPT.r === 3 && finns("3 lägst av 22") && finns("tredje lägsta mätta tal"), `M prognos tredje lägst ${rPT.r}/${rPT.n}`);
k(rSE.r === rSE.n - 1 && finns("näst högst av 21"), `M skuld näst högst ${rSE.r}/${rSE.n}`);
k(finns(sv(pb / medG("pb"), 2)), "M P/B-kvot 2,20", sv(pb / medG("pb"), 2));
k(finns(sv(evm / medG("evEbit"), 2)), "M EV/EBIT-kvot 0,98", sv(evm / medG("evEbit"), 2));

// ---------- R SCENARIORUTA ----------
const bas = vA / aktier, eps = [bas * 0.9, bas, bas * 1.1], peK = [30, pe, 47];
const cell = [];
for (const e of eps) for (const m of peK) cell.push(sv(m * e, 2));
let cellOK = 0;
for (const c of cell) if (finns(`| ${c} |`) || finns(`**${c}**`) || finns(` ${c} |`)) cellOK++;
k(cellOK === 9, "R1 nio scenarieceller", `${cellOK}/9: ${cell.join(", ")}`);
k(finns(`**${sv(pe * bas, 2)}**`), "R2 mittcell = kursen 473,50 exakt", sv(pe * bas, 2));
k(finns(sv(0.1 * bas * pe, 2)), "R3 10 % EPS = 47,35", sv(0.1 * bas * pe, 2));
k(finns(sv(10 * bas, 2)), "R4 10 PE-enheter = 122,50", sv(10 * bas, 2));
k(finns(sv((10 * bas) / (0.1 * bas * pe), 1)), "R5 vikt 2,6", sv((10 * bas) / (0.1 * bas * pe), 1));
k(finns(sv(pris / medG("pe"), 2)), "R6 EPS vid median-PE 18,16", sv(pris / medG("pe"), 2));
k(finns(sv((pris / medG("pe") / bas - 1) * 100, 1)), "R7 +48,2 %", sv((pris / medG("pe") / bas - 1) * 100, 1));
k(finns(sv(pris * (medG("pb") / pb), 2)), "R8 P/B-målkurs 214,88", sv(pris * (medG("pb") / pb), 2));
k(finns(sv((1 - medG("pb") / pb) * 100, 1)), "R9 kursfall 54,6 %", sv((1 - medG("pb") / pb) * 100, 1));
k(finns(na(mcap / medG("pb"))) && finns("växer 120 procent"), "R10 EK-mål 29 479 + 120 %");
k(finns("0,75 gånger 6 plus 0,25") && finns("x lika med 10"), "R11 guidningsaritmetik");

// ---------- J JURIDIKGRIND ----------
const lag = (b.match(/2007:528/g) || []).length;
k(lag === 1, "J1 exakt ett lagrum 2007:528", `${lag}`);
k(finns("2 kap 5 §"), "J2 paragraf");
k(finns("inte investeringsrådgivning") || finns("inte en rekommendation att köpa, sälja eller behålla"), "J3 disclaimer-negationer");
const kopa = (b.match(/köpa/g) || []).length, salj = (b.match(/sälja/g) || []).length;
k(kopa >= 1 && kopa <= 2 && salj >= 1 && salj <= 2, "J4 rådverb endast i negationer", `${kopa}/${salj}`);
k(!/rekommendera (att )?köp/i.test(b) && !/vi (tror|rekommenderar|förväntar)/i.test(b), "J5 inga rådmönster");
k(!/\bköp (aktier|befintligt|nya)\b/i.test(b), "J6 inga köp-påbud");
const progOrd = (b.match(/\b(vi tror|jag tror|bör köpa|kommer att stiga|förväntas stiga)\b/gi) || []).length;
k(progOrd === 0, "J7 inga egna prognosformuleringar", `${progOrd}`);

// ---------- L LÄNKAR ----------
const lnk = [...b.matchAll(/\]\((\/[a-z0-9\/\-]+)\)/g)].map((m) => m[1]);
const unika = [...new Set(lnk)];
k(unika.length >= 18, "L1 minst 18 unika interna länkar", `${unika.length}`);
k(finns("(/bolag/colo-b-co)"), "L2 bolagssidan länkad");
let sitemap = "";
try { sitemap = fs.readFileSync("/tmp/s4u1-sitemap.xml", "utf8"); } catch {
  const r = await fetch("http://localhost:3000/sitemap.xml");
  sitemap = await r.text();
  fs.writeFileSync("/tmp/s4u1-sitemap.xml", sitemap);
}
let sitemapOK = 0, httpOK = 0, drift = [];
for (const u of unika) {
  const iMap = sitemap.includes(u);
  let kod = 0;
  try { const r = await fetch("http://localhost:3000" + u, { signal: AbortSignal.timeout(8000) }); kod = r.status; } catch { kod = 0; }
  if (iMap) sitemapOK++;
  if (kod === 200) httpOK++;
  if (iMap && kod !== 200) drift.push(`${u} (${kod || "timeout"}) — giltig i sitemap`);
  if (!iMap && kod !== 200) fel.push(`LÄNK FEL: ${u} (ej sitemap, kod ${kod})`);
}
k(unika.every((u) => sitemap.includes(u)), "L3 alla interna länkar sitemap-giltiga");
k(drift.length <= 5, "L4 drifttak: sitemap-giltiga med annat än 200 (redovisas som driftnot enligt Stora Enso-precedensen — drift, inte paketfel)", drift.join("; "));
const ext = [...b.matchAll(/\]\((https:\/\/[^)]+)\)/g)].map((m) => m[1]);
k(ext.length === 2 && ext.every((u) => u.startsWith("https://www.coloplast.com") || u.startsWith("https://uk.finance.yahoo.com")), "L5 två externa källänkar", ext.join(", "));

// ---------- O ORD/TECKEN ----------
const tillatna = /[a-zA-Z0-9åäöÅÄÖéÉ .,;:!?()\-–—−×÷§%/+"'\n#*>|\[\]=→]/g;
const frank = b.replace(tillatna, "");
k(frank.trim().length === 0, "O1 teckengrund (inga främmande tecken)", JSON.stringify(frank.slice(0, 30)));
k(!finns("  ,") && !finns(" ,"), "O2 inga dubbeltecken-fel före komma");
k((b.match(/→/g) || []).length >= 4, "O3 trapp-pilar finns");
k(!b.match(/,[0-9]{5}/), "O4 decimaler max fyra");

console.log(`KVD COLOPLAST: ${PASS} PASS · ${FEL} FEL · ${VARN} VARNINGAR`);
if (drift.length) console.log("DRIFTNOT (sitemap-giltiga, ej 200 live):", drift.join("; "));
if (varn.length) console.log("VARNINGAR:", varn.join(" | "));
if (fel.length) { console.log("FEL:", fel.join(" | ")); process.exit(1); }
console.log("GRÖN");
