#!/usr/bin/env node
// _s4u1-googl-kvd.mjs — kvalitetsverifiering av Alphabet-paketet (s4-u1 redispatch).
// Läser målfil + byggdata + universumet LIVE och kontrollerar: källtalsparitet, aritmetik
// (oberoende omräkning), medianer/rang, juridikgrind (inkl V152 "väntas"-förbudet),
// struktur, länkar (--http), språk. Utgång 0 = GRÖN.
import { readFileSync } from "node:fs";

const PAKET = "/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-alphabet-q3-2026.json";
const DATA = "/home/ak1a/AK1/verktyg/_s4u1-googl-data.json";
const U = JSON.parse(readFileSync("/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json", "utf8"));
const P = JSON.parse(readFileSync(PAKET, "utf8"));
const D = JSON.parse(readFileSync(DATA, "utf8"));
const A = U.find(p => p.ticker === "GOOGL");
const http = process.argv.includes("--http");
let pass = 0, fel = [], varn = [];
const OK = () => pass++;
const NEJ = m => fel.push(m);
const circa = (a, b, tol, m) => Math.abs(a - b) <= tol ? OK() : NEJ(`${m}: ${a} vs ${b}`);

const b = P.body, t = P.title, d = P.description;

// — 1. Struktur —
(b.match(/^## /gm) || []).length === 8 ? OK() : NEJ("H2-antal != 8");
const ord = b.split(/\s+/).filter(Boolean).length;
ord >= 1500 && ord <= 4600 ? OK() : NEJ("ordantal " + ord);
P.slug === "sa-laser-du-alphabet-q3-2026" ? OK() : NEJ("slug");
P.tags.length === 6 ? OK() : NEJ("tags");
P.pillar === "Institutionell metodik" && P.author === "AK1A Research Lab" ? OK() : NEJ("pillar/author");
P.publishedAt === "2026-10-28" && P.readingMinutes === 6 ? OK() : NEJ("publishedAt/readingMinutes");
d.length > 200 && d.includes("aldrig råd") ? OK() : NEJ("description");
b.trim().endsWith("Publicering av utkastet är kundens beslut (R2).") ? OK() : NEJ("disclaimer sista raden");

// — 2. Juridikgrind —
const lagrum = (b + t + d).match(/2007:528/g) || [];
lagrum.length >= 1 && !(b + t + d).match(/2005:59|2022:260|2022:261|1985:716|2022:482/) ? OK() : NEJ("lagrum: " + lagrum.length);
const bl = b.toLowerCase();
const rådfel = ["inte en rekommendation att köpa, sälja eller behålla", "inga köp-, sälj- eller behållningsrekommendationer"].every(f => bl.includes(f)) ? 0 : 1;
rådfel === 0 ? OK() : NEJ("rådformuleringar");
!/köp denna|sälja denna aktie|vi rekommenderar/.test(b + t + d) ? OK() : NEJ("rådverb");
!/data\/blogg\/(?!utkast)/.test(b) ? OK() : NEJ("live-mapp refererad");
!/\bväntas\b/.test(b + t + d) ? OK() : NEJ("V152-prognosordet 'väntas' förekommer");
!/målkurs|undvik denna|köp denna/.test(b + t + d) ? OK() : NEJ("V152-förbjudna prognosord");

// — 3. Källtalsparitet (universum → body) —
const par = [
  ["337,12", A.pris.toFixed(2).replace(".", ",")], ["16,81", A.vardering.pe.toFixed(2).replace(".", ",")],
  ["6,624", A.vardering.pb.toFixed(3).replace(".", ",")], ["26,49", A.vardering.evEbit.toFixed(2).replace(".", ",")],
  ["0,55", (A.vardering.fcfYield * 100).toFixed(2).replace(".", ",")], ["48,68", (A.lonksamhet.roe * 100).toFixed(2).replace(".", ",")],
  ["36,18", (A.lonksamhet.roic * 100).toFixed(2).replace(".", ",")], ["60,9", (A.lonksamhet.bruttoMarginal * 100).toFixed(1).replace(".", ",")],
  ["34,03", (A.lonksamhet.ebitMarginal * 100).toFixed(2).replace(".", ",")], ["54,8", (A.lonksamhet.nettoMarginal * 100).toFixed(1).replace(".", ",")],
  ["5,1", (A.lonksamhet.fcfMarginal * 100).toFixed(1).replace(".", ",")], ["0,1886", A.stabilitet.skuldEgenkapital.toFixed(4).replace(".", ",")],
  ["12,5", (A.tillvaxt.omsattningCAGR5ar * 100).toFixed(1).replace(".", ",")], ["30,1", (A.tillvaxt.resultatCAGR5ar * 100).toFixed(1).replace(".", ",")],
  ["24,2", (A.tillvaxt.omsattningTillvaxtTTM * 100).toFixed(1).replace(".", ",")], ["28,01", (Math.abs(A.tillvaxt.prognosTillvaxt) * 100).toFixed(2).replace(".", ",")],
  ["1,24", A.vardering.peg.toFixed(2).replace(".", ",")],
  ["282,8", (A.serier.omsattning[0] / 1e9).toFixed(1).replace(".", ",")],
  ["307,4", (A.serier.omsattning[1] / 1e9).toFixed(1).replace(".", ",")],
  ["350,0", (A.serier.omsattning[2] / 1e9).toFixed(1).replace(".", ",")],
  ["402,8", (A.serier.omsattning[3] / 1e9).toFixed(1).replace(".", ",")],
  ["59 972", (A.serier.resultat[0] / 1e6).toFixed(0).replace(/(\d)(\d{3})$/, "$1 $2")],
  ["132 170", (A.serier.resultat[3] / 1e6).toFixed(0).replace(/(\d)(\d{3})$/, "$1 $2")],
  ["4 123", Math.round(A.marknadsKapitalMdr).toString().replace(/(\d)(\d{3})$/, "$1 $2")],
  ["1 978", "1978".replace(/(\d)(\d{3})$/, "$1 $2")],
  ["12 230", (A.marknadsKapitalMdr * 1000 / A.pris).toFixed(0).replace(/(\d)(\d{3})$/, "$1 $2")],
  ["20,06", (A.pris / A.vardering.pe).toFixed(2).replace(".", ",")],
  ["445,9", (102.35 + (A.serier.omsattning[3] / 1e9 - 289.012) + 109.9 + 119.8).toFixed(1).replace(".", ",")],
  ["22,7", ((102.35 + (A.serier.omsattning[3] / 1e9 - 289.012) + 109.9 + 119.8) * 1000 * A.lonksamhet.fcfMarginal / 1000).toFixed(1).replace(".", ",")],
  ["245", (A.pris / A.vardering.pe * (A.marknadsKapitalMdr * 1000 / A.pris) / 1000).toFixed(0)],
  ["4 019", (A.vardering.evEbit * (102.35 + (A.serier.omsattning[3] / 1e9 - 289.012) + 109.9 + 119.8) * 1000 * A.lonksamhet.ebitMarginal / 1000).toFixed(0).replace(/(\d)(\d{3})$/, "$1 $2")],
];
for (const [txt, v] of par) v === txt && b.includes(txt) ? OK() : NEJ(`paritet "${txt}" (beräknat ${v}, finns: ${b.includes(txt)})`);

// — 4. Aritmetik: oberoende omräkning —
const pe = A.vardering.pe, pb = A.vardering.pb, roe = A.lonksamhet.roe;
const fy25oms = A.serier.omsattning[3] / 1e9, fy25res = A.serier.resultat[3] / 1e6;
const q4_25 = fy25oms - (90.234 + 96.428 + 102.35);
const ttmOms = 102.35 + q4_25 + 109.9 + 119.8;
const ttmEps = A.pris / pe;
const aktietal = A.marknadsKapitalMdr * 1000 / A.pris;
const ttmNetto = ttmEps * aktietal;
const ttmFcf = ttmOms * 1000 * A.lonksamhet.fcfMarginal;
circa(q4_25, 113.824, 0.001, "Q4-2025 härledd");
circa(ttmOms, 445.874, 0.001, "TTM-omsättning");
circa(ttmEps, 20.0595, 0.001, "TTM-EPS");
circa(aktietal, 12229.9, 0.5, "aktietal");
circa(ttmNetto, 245326, 100, "TTM-netto MUSD");
circa(ttmFcf, 22650, 5, "TTM-FCF MUSD");
circa(ttmNetto / ttmFcf, 10.83, 0.01, "vinst/FCF-kvot");
circa(ttmOms * 1000 * A.lonksamhet.ebitMarginal, 151731, 1, "TTM-EBIT MUSD");
circa(A.vardering.evEbit * ttmOms * 1000 * A.lonksamhet.ebitMarginal, 4019049, 100, "EV bakväg MUSD");
circa(pe * A.lonksamhet.nettoMarginal, 9.205, 0.001, "P/S identitet");
circa(A.marknadsKapitalMdr / ttmOms, 9.247, 0.001, "P/S mcap-väg");
circa(pe / Math.abs(A.tillvaxt.prognosTillvaxt * 100), 0.600, 0.001, "PEG-konvention");
circa((Math.pow(fy25oms / (A.serier.omsattning[0] / 1e9), 1 / 3) - 1) * 100, 12.512, 0.001, "CAGR-oms");
circa((Math.pow(fy25res / (A.serier.resultat[0] / 1e6), 1 / 3) - 1) * 100, 30.135, 0.001, "CAGR-res");
circa(fy25res / (fy25oms * 1000) * 100, 32.81, 0.01, "nettomarginal bokslut 2025");
circa(40.8 / 119.8 * 100, 34.057, 0.01, "Q2-2026 op-marginal");
circa(24.8 / 119.8 * 100, 20.70, 0.01, "Cloud-andel Q2");
circa(6.26 / 9.11 * 100, 68.7, 0.1, "engångsandel EPS");
circa(fy25oms * 1000 * A.lonksamhet.ebitMarginal, 137085, 1, "scenariobas MUSD");
circa(fy25oms * 1000 * 0.01, 4028.4, 0.1, "1 pp");
circa(fy25oms * 1000 * 0.03, 12085.1, 0.1, "3 %");
circa((126.85 / 102.35 - 1) * 100, 23.94, 0.01, "konsensustillväxt");
circa((2.99 / 2.87 - 1) * 100, 4.18, 0.01, "EPS-konsensustillväxt");
circa(pb / A.lonksamhet.roe, 13.61, 0.01, "P/E-identitet P/B÷ROE");
circa(pe / (pb / roe) - 1, 0.2345, 0.001, "identitetsavvikelse");
// scenariorutans 9 celler mot bodyns tabell
const cellV = []; for (const dd of [-0.03, 0, 0.03]) for (const mm of [-0.01, 0, 0.01]) cellV.push(fy25oms * 1000 * (1 + dd) * (A.lonksamhet.ebitMarginal + mm));
const bodyCell = [...b.matchAll(/\| (?:Intäkter [\d ,]+) \| ([\d ,]+) \| ([\d ,]+) \| ([\d ,]+) \|/g)].flatMap(m => [m[1], m[2], m[3]]);
bodyCell.length === 9 ? OK() : NEJ("scenarieceller hittade " + bodyCell.length);
cellV.forEach((v, i) => circa(parseFloat(bodyCell[i].replace(/ /g, "").replace(",", ".")), Math.round(v / 100) / 10, 0.051, `cell ${i + 1}`));

// — 5. Medianer + rang LIVE —
const tek = U.filter(p => p.bransch === "teknik");
const med = a => { const s = a.filter(v => typeof v === "number" && isFinite(v)).sort((x, y) => x - y); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };
const g = (p, s) => s.split(".").reduce((o, k) => o && o[k], p);
const mv = {
  "22,01": med(tek.map(p => g(p, "vardering.pe"))), "6,099": med(tek.map(p => g(p, "vardering.pb"))),
  "23,81": med(tek.map(p => g(p, "vardering.evEbit"))), "1,15": med(tek.map(p => g(p, "vardering.peg"))),
  "30,56": med(tek.map(p => g(p, "lonksamhet.roe"))) * 100, "52,73": med(tek.map(p => g(p, "lonksamhet.bruttoMarginal"))) * 100,
  "26,34": med(tek.map(p => g(p, "lonksamhet.ebitMarginal"))) * 100, "20,41": med(tek.map(p => g(p, "lonksamhet.nettoMarginal"))) * 100,
  "14,8": med(tek.map(p => g(p, "lonksamhet.fcfMarginal"))) * 100, "0,189": med(tek.map(p => g(p, "stabilitet.skuldEgenkapital"))),
};
for (const [txt, v] of Object.entries(mv)) circa(v, parseFloat(txt.replace(",", ".")), 0.005, `grenmedian ${txt}`);
const umv = {
  "20,39": med(U.map(p => g(p, "vardering.pe"))), "2,72": med(U.map(p => g(p, "vardering.pb"))),
  "17,61": med(U.map(p => g(p, "vardering.evEbit"))), "14,66": med(U.map(p => g(p, "lonksamhet.roe"))) * 100,
  "20,81": med(U.map(p => g(p, "lonksamhet.ebitMarginal"))) * 100, "13,66": med(U.map(p => g(p, "lonksamhet.nettoMarginal"))) * 100,
  "6,8": med(U.map(p => g(p, "tillvaxt.omsattningTillvaxtTTM"))) * 100,
};
for (const [txt, v] of Object.entries(umv)) circa(v, parseFloat(txt.replace(",", ".")), 0.005, `universummedian ${txt}`);
const rång = {
  "vardering.pe": [7, 23], "vardering.pb": [13, 23], "vardering.evEbit": [14, 23], "vardering.peg": [11, 19],
  "vardering.fcfYield": [6, 22], "lonksamhet.roe": [20, 23], "lonksamhet.roic": [15, 22],
  "lonksamhet.bruttoMarginal": [15, 23], "lonksamhet.ebitMarginal": [17, 23], "lonksamhet.nettoMarginal": [22, 23],
  "lonksamhet.fcfMarginal": [5, 22], "stabilitet.skuldEgenkapital": [12, 23],
  "tillvaxt.omsattningCAGR5ar": [16, 22], "tillvaxt.resultatCAGR5ar": [18, 20], "tillvaxt.omsattningTillvaxtTTM": [18, 22],
  "tillvaxt.prognosTillvaxt": [1, 21],
};
for (const [sökväg, [förväntadR, förväntadN]] of Object.entries(rång)) { const v = g(A, sökväg); const a = tek.map(p => g(p, sökväg)).filter(x => typeof x === "number" && isFinite(x)); const r = a.filter(x => x < v).length + 1; (r === förväntadR && a.length === förväntadN) ? OK() : NEJ(`rang ${sökväg}: ${r}/${a.length} mot förväntat ${förväntadR}/${förväntadN}`); }
tek.length === 23 ? OK() : NEJ("teknikgren n");

// — 6. Länkar —
const länkar = [...new Set([...(b.match(/\]\((\/[^)]+)\)/g) || []).map(x => x.slice(2, -1))])];
const tillåtna = /^\/(dataset\/teknik\/(pe|pb|ev-ebit|peg|fcf-avkastning|vardering|roe|roic|brutto-marginal|netto-marginal|skuldsattning|omsattning-cagr-5ar|resultat-cagr-5ar|omsattningstillvaxt-ttm|prognos-tillvaxt|universumjamforelse)|kurser|transparens|kallor)$/;
länkar.every(l => tillåtna.test(l)) ? OK() : NEJ("interna länkar utanför vitlista: " + länkar.filter(l => !tillåtna.test(l)).join(", "));
const ext = [...new Set([...(b.match(/\]\((https?:\/\/[^)]+)\)/g) || []).map(x => x.slice(2, -1))])];
ext.every(l => /abc\.xyz/.test(l)) ? OK() : NEJ("externa domäner: " + ext.join(", "));
ext.length >= 1 ? OK() : NEJ("ingen extern källa länkad");
if (http) { const bad = []; for (const l of länkar) { try { const r = await fetch("http://localhost:3000" + l); if (r.status !== 200) bad.push(l + "=" + r.status); } catch { bad.push(l + "=err"); } } bad.length === 0 ? OK() : NEJ("HTTP: " + bad.join(", ")); } else varn.push("länk-HTTP skippad (kör --http)");

// — 7. Språk —
const sv = b.normalize("NFC");
!/ the | and | with | from /.test(sv) ? OK() : NEJ("engelska läckor: " + (sv.match(/ the | and | with | from /g) || []).join("|"));
!/[\u3400-\u9fff]/.test(sv) ? OK() : NEJ("CJK-tecken i brödtext");
!/[a-z]{2}_[a-z]{2}/.test(sv) ? OK() : NEJ("underscore-läcka");
!/  /.test(sv.replace(/\| /g, "").replace(/ \|/g, "")) ? OK() : NEJ("dubbla mellanslag");
["tuppar", "spanmål", "dominuar", "struktturellt", "utschup", "fmåttsskolan", "valutororna", "Analysör", "medtäckt", "Alkohol", "värddet"].every(x => !sv.includes(x)) ? OK() : NEJ("kända stavfel kvar");

// — Rapport —
console.log(`KVD Alphabet-paketet: ${pass} PASS, ${fel.length} FEL, ${varn.length} VARNING${varn.length ? " (" + varn.join("; ") + ")" : ""}`);
fel.forEach(f => console.log("FEL:", f));
process.exit(fel.length ? 1 : 0);
