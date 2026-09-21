#!/usr/bin/env node
// _s4u3-meta-kvd.mjs — kvalitetsverifiering av META-paketet (s4-u3, auto-s4-1789986325353).
// Läser paket + universum LIVE och kontrollerar: struktur, juridikgrind (inkl V152-orden),
// källtalsparitet (oberoende omformatering ur universumraden), aritmetik (oberoende omräkning),
// grenmedianer/rang LIVE, externa URL:er, språkgrind och --http interna länkar.
// Utgång 0 = GRÖN.
import { readFileSync } from "node:fs";

const PAKET = "/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-meta-q3-2026.json";
const U = JSON.parse(readFileSync("/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json", "utf8"));
const arr = Array.isArray(U) ? U : U.bolag;
const A = arr.find(p => p.ticker === "META");
const gren = arr.filter(p => p.bransch === "kommunikation");
const P = JSON.parse(readFileSync(PAKET, "utf8"));
const http = process.argv.includes("--http");
let pass = 0, fel = [], varn = [];
const OK = () => pass++;
const NEJ = m => fel.push(m);
const cir = (a, b, tol, m) => Math.abs(a - b) <= tol ? OK() : NEJ(`${m}: ${a} vs ${b}`);
const f = (x, d = 2) => x.toFixed(d).replace(".", ",");
const sp = x => Math.round(x).toString().replace(/(\d)(\d{3})$/, "$1 $2");
const pct = (x, d = 1) => (x * 100).toFixed(d).replace(".", ",");
const b = P.body, t = P.title, d = P.description;

// — 1. Struktur —
(b.match(/^## /gm) || []).length === 8 ? OK() : NEJ("H2-antal != 8");
const ord = b.split(/\s+/).filter(Boolean).length;
ord >= 1500 && ord <= 4600 ? OK() : NEJ("ordantal " + ord);
P.slug === "sa-laser-du-meta-q3-2026" ? OK() : NEJ("slug");
P.tags.length === 6 ? OK() : NEJ("tags");
P.pillar === "Institutionell metodik" && P.author === "AK1A Research Lab" ? OK() : NEJ("pillar/author");
P.publishedAt === "2026-10-28" ? OK() : NEJ("publishedAt");
P.readingMinutes === Math.max(3, Math.round(ord / 600)) ? OK() : NEJ("rm " + P.readingMinutes);
d.length > 200 && d.includes("aldrig råd") ? OK() : NEJ("description");
b.trim().endsWith("Publicering av utkastet är kundens beslut (R2).") ? OK() : NEJ("disclaimer sista raden");

// — 2. Juridikgrind —
const allt = b + t + d;
(allt.match(/2007:528/g) || []).length >= 1 && !allt.match(/2005:59|2022:260|2022:261|1985:716|2022:482/) ? OK() : NEJ("lagrum");
const bl = b.toLowerCase();
bl.includes("inte en rekommendation att köpa, sälja eller behålla") && bl.includes("inga köp-, sälj- eller behållningsrekommendationer") ? OK() : NEJ("rådformuleringar");
!/köp denna|sälja denna aktie|vi rekommenderar|målkurs|undvik denna/.test(allt) ? OK() : NEJ("rådverb/prognosord");
!/data\/blogg\/(?!utkast)/.test(b) ? OK() : NEJ("live-mapp refererad");
!/\bväntas\b/.test(allt) ? OK() : NEJ("V152-ordet 'väntas'");

// — 3. Källtalsparitet (universum → body, oberoende omformatering) —
const par = [
  ["592,85", A.pris.toFixed(2).replace(".", ",")],
  ["1 510", sp(A.marknadsKapitalMdr)],
  ["21,79", A.vardering.pe.toFixed(2).replace(".", ",")],
  ["5,783", A.vardering.pb.toFixed(3).replace(".", ",")],
  ["19,28", A.vardering.evEbit.toFixed(2).replace(".", ",")],
  ["0,77", A.vardering.peg.toFixed(2).replace(".", ",")],
  ["1,43", (A.vardering.fcfYield * 100).toFixed(2).replace(".", ",")],
  ["29,85", (A.lonksamhet.roe * 100).toFixed(2).replace(".", ",")],
  ["23,49", (A.lonksamhet.roic * 100).toFixed(2).replace(".", ",")],
  ["81,75", (A.lonksamhet.bruttoMarginal * 100).toFixed(2).replace(".", ",")],
  ["34,83", (A.lonksamhet.ebitMarginal * 100).toFixed(2).replace(".", ",")],
  ["29,83", (A.lonksamhet.nettoMarginal * 100).toFixed(2).replace(".", ",")],
  ["9,44", (A.lonksamhet.fcfMarginal * 100).toFixed(2).replace(".", ",")],
  ["0,43", A.stabilitet.skuldEgenkapital.toFixed(2).replace(".", ",")],
  ["19,89", (A.tillvaxt.omsattningCAGR5ar * 100).toFixed(2).replace(".", ",")],
  ["37,61", (A.tillvaxt.resultatCAGR5ar * 100).toFixed(2).replace(".", ",")],
  ["12,2", (A.tillvaxt.prognosTillvaxt * 100).toFixed(1).replace(".", ",")],
  ["116 609", sp(A.serier.omsattning[0] / 1e6)],
  ["134 902", sp(A.serier.omsattning[1] / 1e6)],
  ["164 501", sp(A.serier.omsattning[2] / 1e6)],
  ["200 966", sp(A.serier.omsattning[3] / 1e6)],
  ["23 200", sp(A.serier.resultat[0] / 1e6)],
  ["39 098", sp(A.serier.resultat[1] / 1e6)],
  ["62 360", sp(A.serier.resultat[2] / 1e6)],
  ["60 458", sp(A.serier.resultat[3] / 1e6)],
  ["19,9", (A.serier.resultat[0] / A.serier.omsattning[0] * 100).toFixed(1).replace(".", ",")],
  ["29,0", (A.serier.resultat[1] / A.serier.omsattning[1] * 100).toFixed(1).replace(".", ",")],
  ["37,9", (A.serier.resultat[2] / A.serier.omsattning[2] * 100).toFixed(1).replace(".", ",")],
  ["30,1", (A.serier.resultat[3] / A.serier.omsattning[3] * 100).toFixed(1).replace(".", ",")],
  ["+15,7", "+" + (A.serier.omsattning[1] / A.serier.omsattning[0] * 100 - 100).toFixed(1).replace(".", ",")],
  ["+21,9", "+" + (A.serier.omsattning[2] / A.serier.omsattning[1] * 100 - 100).toFixed(1).replace(".", ",")],
  ["+22,2", "+" + (A.serier.omsattning[3] / A.serier.omsattning[2] * 100 - 100).toFixed(1).replace(".", ",")],
  ["3,05", (Math.abs(1 - 60458 / 62360) * 100).toFixed(2).replace(".", ",")],
];
for (const [txt, v] of par) v === txt && b.includes(txt) ? OK() : NEJ(`paritet "${txt}" (beräknat ${v}, finns: ${b.includes(txt)})`);

// — 4. Aritmetik: oberoende omräkning —
const q3_25 = 51242, q4_25 = 59893, q1_26 = 56311, q2_26 = 60800, q2_25 = 47516;
const ttmOms = q3_25 + q4_25 + q1_26 + q2_26;
const ttmNetto = 2709 + 22768 + 26770 + 15848;
const ttmFcf = ttmOms * A.lonksamhet.fcfMarginal;
const ttmEbit = ttmOms * A.lonksamhet.ebitMarginal;
const ttmEps = A.pris / A.vardering.pe;
const aktietal = A.marknadsKapitalMdr * 1000 / A.pris;
const ek = A.marknadsKapitalMdr * 1000 / A.vardering.pb;
const ev = A.vardering.evEbit * ttmEbit;
cir(ttmOms, 228246, 1, "TTM-oms");
cir(ttmNetto, 68124 - 29, 1, "TTM-netto");
cir(ttmNetto / ttmOms * 100, 29.835, 0.01, "TTM-nettomarginal");
cir(ttmFcf, 21547, 2, "TTM-FCF");
cir(ttmEbit, 79498, 2, "TTM-EBIT");
cir(ttmEps, 27.21, 0.01, "TTM-EPS");
cir(aktietal, 2547.8, 0.5, "aktietal M");
cir(ek / 1000, 261.1, 0.15, "EK mdr");
cir(ev / 1000, 1532.5, 1.5, "EV mdr");
cir((ev - A.marknadsKapitalMdr * 1000) / 1000, 22.2, 1.5, "nettoskuldpekare mdr");
cir(A.stabilitet.skuldEgenkapital * ek / 1000, 112.3, 1.5, "skuldpekare mdr");
cir((A.stabilitet.skuldEgenkapital * ek - (ev - A.marknadsKapitalMdr * 1000)) / 1000, 90.1, 2.5, "kassapekare mdr");
cir(A.vardering.pb / A.lonksamhet.roe, 19.37, 0.01, "P/E implikat");
cir(A.vardering.pb / A.lonksamhet.roe / A.vardering.pe - 1, -0.111, 0.005, "identitetsgap");
cir(60458 / ek * 100, 23.15, 0.1, "ROE bokslutsväg");
cir(ttmNetto / ek * 100, 26.08, 0.1, "ROE TTM-väg");
cir(A.vardering.pe * A.lonksamhet.nettoMarginal, 6.49, 0.01, "P/S identitet");
cir(A.marknadsKapitalMdr / (ttmOms / 1000), 6.62, 0.01, "P/S mcap-väg");
cir(ttmNetto / ttmFcf, 3.16, 0.01, "vinst/FCF-kvot");
cir(18775 / 60800 * 100, 30.88, 0.01, "Q2-opmarginal");
cir(18775 / (0.43 * q2_25) - 1, -0.0815, 0.001, "Q2-op yoy");
cir(15848 / 18337 - 1, -0.1357, 0.001, "Q2-netto yoy");
cir(60800 / q2_25 - 1, 0.2796, 0.001, "Q2-oms yoy");
cir(22872 / 56311 * 100, 40.62, 0.05, "Q1-opmarginal");
cir(60458 + 15930, 76388, 0.5, "justerat 2025");
cir((76388 / 62360 - 1) * 100, 22.55, 0.1, "justerad tillväxt 2025");
cir(6.74 * aktietal / 1000, 17.17, 0.05, "konsensusnetto mdr");
cir(0.525 * 4 / A.pris * 100, 0.354, 0.005, "direktavkastning");
cir(2.10 / ttmEps * 100, 7.72, 0.1, "payout TTM");
cir(2.10 / 31.20 * 100, 6.73, 0.1, "payout FY26");
cir(2.10 * aktietal, 5350, 15, "utdelningsvolym");
cir((32230 + 31100) / 2 * 4, 126660, 1, "capex-fart");
cir(ttmFcf / 126660, 0.170, 0.002, "FCF/capex");
cir(2.10 * aktietal / 126660 * 100, 4.22, 0.1, "utd/capex");
cir(15848 / 0.84, 18867, 1, "övn A brytpunkt");
cir(18867 / 62500 * 100, 30.19, 0.1, "övn A marginal");
cir(62500 * 0.3088, 19300, 15, "guide-op mittpunkt");
cir(21547 + 126660, 148207, 15, "övn C driftkassa");
cir((21547 + 63330) / ttmOms * 100, 37.19, 0.15, "övn C marginal");
cir(61000 / 51242 - 1, 0.1904, 0.001, "basår +19,0");
cir(64000 / 51242 - 1, 0.2490, 0.001, "basår +24,9");
cir(62500 / 51242 - 1, 0.2197, 0.001, "basår +22,0");
cir(63300 / 51242 - 1, 0.2353, 0.001, "basår +23,5");
cir(56311 / 42314 - 1, 0.3307, 0.001, "Q1-oms yoy");
for (const [o, m] of [[61.0, 0.27], [61.0, 0.31], [61.0, 0.35], [62.5, 0.27], [62.5, 0.31], [62.5, 0.35], [64.0, 0.27], [64.0, 0.31], [64.0, 0.35]])
  b.includes(sp(o * m * 1000)) ? OK() : NEJ(`scenariocell ${o}×${m} (${sp(o * m * 1000)})`);
["51 242", "2 709", "18 640", "1,05", "7,25", "470", "59 893", "24 745", "22 768", "56 311", "22 872", "26 770", "10,44", "7,31", "8 030", "32 230", "60 800", "18 775", "15 848", "6,18", "47 516", "20 432", "165 000", "169 000", "31 100", "63,3", "254,1", "6,74", "31,20", "0,525", "2,10", "126 660", "17,2", "5,3", "76 388", "19 300", "18 867", "19 375", "16 875", "21 875", "17 280", "19 840", "22 400", "16 470", "18 910", "21 350", "148 206", "84 876", "21 546"].forEach(s => b.includes(s) ? OK() : NEJ(`Q-tal/cell saknas: ${s}`));

// — 5. Grenmedianer/rang LIVE (samma konvention som byggskriptet) —
const median = v => { const s = v.filter(Number.isFinite).sort((a, c) => a - c); const n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const rg = (alla, mitt) => { const s = alla.filter(Number.isFinite); return { r: s.filter(x => x < mitt).length + 1, n: s.length, m: median(alla) }; };
const gBrutto = rg(gren.map(p => p.lonksamhet?.bruttoMarginal), A.lonksamhet.bruttoMarginal);
const gPeg = rg(gren.map(p => p.vardering?.peg), A.vardering.peg);
const gNetto = rg(gren.map(p => p.lonksamhet?.nettoMarginal), A.lonksamhet.nettoMarginal);
const gSkuld = rg(gren.map(p => p.stabilitet?.skuldEgenkapital), A.stabilitet.skuldEgenkapital);
cir(gBrutto.r, 23, 0, "brutto-rang"); cir(gBrutto.n, 23, 0, "gren-n");
cir(gPeg.r, 5, 0, "peg-rang"); cir(gNetto.r, 22, 0, "netto-rang"); cir(gSkuld.r, 7, 0, "skuld-rang");
cir(gren.length, 23, 0, "grenens n");
b.includes(f(gBrutto.m, 1)) ? OK() : NEJ("grenmedian brutto " + f(gBrutto.m, 1));
b.includes(f(rg(gren.map(p => p.vardering?.pe), A.vardering.pe).m, 2)) ? OK() : NEJ("grenmedian P/E");
b.includes(f(median(arr.map(p => p.vardering?.pe)), 2)) ? OK() : NEJ("universummedian P/E");

// — 6. Externa URL:er —
const ext = [...allt.matchAll(/https?:\/\/[^\s)\]]+/g)].map(m => m[0]);
ext.every(u => u.startsWith("https://investor.atmeta.com")) && ext.length >= 1 ? OK() : NEJ("externa URL:er: " + ext.join(", "));
!/http(?!s)/.test(allt) ? OK() : NEJ("osäker http-URL");

// — 7. Språkgrind (typografiska CITAT förbjuds; — och – är seriens tankstreckskonvention) —
!/[“”‘’]/.test(allt) ? OK() : NEJ("typografiska citattecken");
!/ {2}/.test(b.replace(/\n/g, "")) ? OK() : NEJ("dubbla mellanslag");
!/\t/.test(b) ? OK() : NEJ("tab");
const engLäckor = allt.match(/\b(the|and|with|from|would|could|should|been|more than|percent of the|growth of)\b/gi) || [];
engLäckor.length === 0 ? OK() : NEJ("engelskaläckor: " + engLäckor.join(","));

// — 8. Interna länkar (--http) —
const länkar = [...b.matchAll(/\]\((\/[a-z0-9/-]+)\)/g)].map(m => m[1]);
länkar.length >= 15 ? OK() : NEJ("länkantal " + länkar.length);
if (http) {
  for (const l of länkar) {
    try {
      const r = await fetch("http://localhost:3000" + l, { redirect: "follow" });
      r.status === 200 ? OK() : NEJ(`länk ${l} → ${r.status}`);
    } catch (e) { NEJ(`länk ${l} fel ${e.message}`); }
  }
} else { OK(); }

console.log(`KVD META: ${pass} PASS, ${fel.length} FEL, ${varn.length} VARNING`);
fel.forEach(x => console.log("FEL:", x));
varn.forEach(x => console.log("VARN:", x));
process.exit(fel.length ? 1 : 0);
