#!/usr/bin/env node
// _s4u2-logn-kvd.mjs — kvalitetsverifiering av Logitech-paketet (s4-u2, manifest auto-s4-1789959329360).
// Läser målfilen + byggdata + universumet LIVE och kontrollerar: källtalsparitet, aritmetik
// (oberoende omräkning), medianer/rang, juridikgrind, struktur, länkar (--http), språk.
// Utgång 0 = GRÖN.
import { readFileSync } from "node:fs";

const PAKET = "/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-logitech-q3-2026.json";
const DATA = "/home/ak1a/AK1/verktyg/_s4u2-logn-data.json";
const U = JSON.parse(readFileSync("/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json", "utf8"));
const P = JSON.parse(readFileSync(PAKET, "utf8"));
const D = JSON.parse(readFileSync(DATA, "utf8"));
const L = U.find(p => p.ticker === "LOGN.SW");
const http = process.argv.includes("--http");
let pass = 0, fel = [], varn = [];
const OK = m => { pass++; };
const NEJ = m => fel.push(m);
const circa = (a, b, tol, m) => Math.abs(a - b) <= tol ? OK() : NEJ(`${m}: ${a} vs ${b}`);

const b = P.body, t = P.title, d = P.description;

// — 1. Struktur —
(b.match(/^## /gm) || []).length === 8 ? OK() : NEJ("H2-antal != 8");
const ord = b.split(/\s+/).filter(Boolean).length;
ord >= 1500 && ord <= 4600 ? OK() : NEJ("ordantal " + ord);
P.slug === "sa-laser-du-logitech-q3-2026" ? OK() : NEJ("slug");
P.tags.length === 6 ? OK() : NEJ("tags");
P.pillar === "Institutionell metodik" && P.author === "AK1A Research Lab" ? OK() : NEJ("pillar/author");
P.publishedAt === "2026-10-27" && P.readingMinutes === 6 ? OK() : NEJ("publishedAt/readingMinutes");
d.length > 200 && d.includes("aldrig råd") ? OK() : NEJ("description");
b.trim().endsWith("Publicering av utkastet är kundens beslut (R2).") ? OK() : NEJ("disclaimer sista raden");

// — 2. Juridikgrind —
const lagrum = (b + t + d).match(/2007:528/g) || [];
lagrum.length >= 1 && !(b + t + d).match(/2005:59|2022:260|2022:261|1985:716|2022:482/) ? OK() : NEJ("lagrum: " + lagrum.length);
const rådv = (b.match(/\b(köp|sälj|rekommendera|bytesråd|placera era|investera i|handla denna)\b/gi) || []).filter(x => !/inte en rekommendation|någonsin en bedömning|aldrig råd/.test(x));
// tillåtna formuleringar: nekad-rekommendation-rader finns; räkna bara positiva rådfraser
const rådfel = ["inte en rekommendation att köpa, sälja eller behålla", "inga köp-, sälj- eller behållningsrekommendationer"].every(f => b.includes(f)) ? 0 : 1;
rådfel === 0 ? OK() : NEJ("rådformuleringar");
!/köp denna|sälja denna aktie|vi rekommenderar/.test(b + t + d) ? OK() : NEJ("rådverb");
!/data\/blogg\/(?!utkast)/.test(b) ? OK() : NEJ("live-mapp refererad");

// — 3. Källtalsparitet (universum → body) —
const par = [
  ["81,00", L.pris.toFixed(2).replace(".", ",")], ["18,37", L.vardering.pe.toFixed(2).replace(".", ",")],
  ["6,099", L.vardering.pb.toFixed(3).replace(".", ",")], ["9,26", L.vardering.evEbit.toFixed(2).replace(".", ",")],
  ["6,24", (L.vardering.fcfYield * 100).toFixed(2).replace(".", ",")], ["35,29", (L.lonksamhet.roe * 100).toFixed(2).replace(".", ",")],
  ["52,57", (L.lonksamhet.roic * 100).toFixed(2).replace(".", ",")], ["45,24", (L.lonksamhet.bruttoMarginal * 100).toFixed(2).replace(".", ",")],
  ["21,22", (L.lonksamhet.ebitMarginal * 100).toFixed(2).replace(".", ",")], ["16,28", (L.lonksamhet.nettoMarginal * 100).toFixed(2).replace(".", ",")],
  ["0,036", L.stabilitet.skuldEgenkapital.toFixed(3).replace(".", ",")], ["2,17", (L.tillvaxt.omsattningCAGR5ar * 100).toFixed(2).replace(".", ",")],
  ["24,95", (L.tillvaxt.resultatCAGR5ar * 100).toFixed(2).replace(".", ",")], ["6,9", (L.tillvaxt.omsattningTillvaxtTTM * 100).toFixed(1).replace(".", ",")],
  ["8,09", (L.tillvaxt.prognosTillvaxt * 100).toFixed(2).replace(".", ",")], ["1,79", L.vardering.peg.toFixed(2).replace(".", ",")],
  ["4 538,8", (L.serier.omsattning[0] / 1e6).toFixed(1).replace(".", ",").replace(/(\d)(\d{3})/, "$1 $2")],
  ["4 298,5", (L.serier.omsattning[1] / 1e6).toFixed(1).replace(".", ",").replace(/(\d)(\d{3})/, "$1 $2")],
  ["4 554,9", (L.serier.omsattning[2] / 1e6).toFixed(1).replace(".", ",").replace(/(\d)(\d{3})/, "$1 $2")],
  ["4 840,8", (L.serier.omsattning[3] / 1e6).toFixed(1).replace(".", ",").replace(/(\d)(\d{3})/, "$1 $2")],
  ["711,2", (L.serier.resultat[3] / 1e6).toFixed(1).replace(".", ",")],
  ["11 598", Math.round(L.marknadsKapitalMdr * 1000).toString().replace(/(\d)(\d{3})$/, "$1 $2")], ["14,7", ((L.serier.resultat[3] / L.serier.omsattning[3]) * 100).toFixed(1).replace(".", ",")],
];
for (const [txt, v] of par) v === txt && b.includes(txt) ? OK() : NEJ(`paritet "${txt}" (beräknat ${v}, finns: ${b.includes(txt)})`);

// — 4. Aritmetik: oberoende omräkning —
const pe = L.vardering.pe, pb = L.vardering.pb, roe = L.lonksamhet.roe;
const oms = L.serier.omsattning[3] / 1e6, res = L.serier.resultat[3] / 1e6;
const kE = pe * 4.80; circa(kE, 88.16, 0.01, "kurs-ekvivalent");
circa(81.00 / kE, 0.919, 0.001, "växelkurs");
circa(L.marknadsKapitalMdr * 1000 / L.pris, 143.2, 0.05, "aktietal");
circa(res / 4.80, 148.2, 0.05, "aktietal viktat");
circa(res / roe, 2015, 1, "EK-bakväg");
circa((res / roe) / (L.marknadsKapitalMdr * 1000 / L.pris), 14.07, 0.01, "BPS");
circa(kE / ((res / roe) / (L.marknadsKapitalMdr * 1000 / L.pris)), 6.27, 0.01, "P/B väg 2");
circa(pb / roe, 17.29, 0.01, "identitet");
circa((pe / (pb / roe) - 1) * 100, 6.3, 0.15, "identitetsavvikelse %");
circa(pe / (L.tillvaxt.prognosTillvaxt * 100), 2.27, 0.01, "PEG-konvention");
circa((Math.pow(oms / (L.serier.omsattning[0] / 1e6), 1 / 3) - 1) * 100, 2.17, 0.01, "CAGR-oms");
circa((Math.pow(res / (L.serier.resultat[0] / 1e6), 1 / 3) - 1) * 100, 24.95, 0.01, "CAGR-res");
circa(res / oms * 100, 14.69, 0.01, "nettomarginal bokslut");
circa(775 / oms * 100, 16.01, 0.01, "GAAP-op-marginal");
circa(oms * L.lonksamhet.ebitMarginal, 1027.2, 0.1, "EBIT-fältväg");
circa(oms * L.lonksamhet.ebitMarginal / 775 - 1, 0.326, 0.001, "EBIT-gap");
circa(1190 + 1420 + 1090 + 1227.2, 4927.2, 0.01, "TTM-kedja");
circa(1150 + 1190 + 1420 + 1090, 4850, 0.01, "FY-kvartalssumma");
circa(1 / (3 * L.lonksamhet.ebitMarginal), 1.57, 0.01, "marginalvikt");
circa(oms * 0.01, 48.4, 0.05, "1 pp");
circa(oms * 0.03, 145.2, 0.05, "3 %");
// scenariorutans 9 celler mot bodyns tabell
const cellV = []; for (const dd of [-0.03, 0, 0.03]) for (const mm of [-0.01, 0, 0.01]) cellV.push(oms * (1 + dd) * (L.lonksamhet.ebitMarginal + mm));
const bodyCell = [...b.matchAll(/\| (?:Intäkter [\d ,]+) \| ([\d ,]+) \| ([\d ,]+) \| ([\d ,]+) \|/g)].flatMap(m => [m[1], m[2], m[3]]);
bodyCell.length === 9 ? OK() : NEJ("scenarieceller hittade " + bodyCell.length);
cellV.forEach((v, i) => circa(parseFloat(bodyCell[i].replace(/ /g, "").replace(",", ".")), Math.round(v * 10) / 10, 0.051, `cell ${i + 1}`));

// — 5. Medianer + rang LIVE —
const tek = U.filter(p => p.bransch === "teknik");
const med = a => { const s = a.filter(v => typeof v === "number" && isFinite(v)).sort((x, y) => x - y); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };
const g = (p, s) => s.split(".").reduce((o, k) => o && o[k], p);
const mv = { "22,01": med(tek.map(p => g(p, "vardering.pe"))), "6,099": med(tek.map(p => g(p, "vardering.pb"))), "23,81": med(tek.map(p => g(p, "vardering.evEbit"))), "30,56": med(tek.map(p => g(p, "lonksamhet.roe"))) * 100, "52,73": med(tek.map(p => g(p, "lonksamhet.bruttoMarginal"))) * 100, "26,34": med(tek.map(p => g(p, "lonksamhet.ebitMarginal"))) * 100, "20,41": med(tek.map(p => g(p, "lonksamhet.nettoMarginal"))) * 100, "0,189": med(tek.map(p => g(p, "stabilitet.skuldEgenkapital"))) };
for (const [txt, v] of Object.entries(mv)) circa(v, parseFloat(txt.replace(",", ".")), 0.005, `median ${txt}`);
const rång = { "vardering.pe": [8, 23], "vardering.pb": [12, 23], "vardering.evEbit": [3, 23], "vardering.peg": [16, 19], "vardering.fcfYield": [18, 22], "lonksamhet.roe": [16, 23], "lonksamhet.roic": [17, 22], "lonksamhet.bruttoMarginal": [4, 23], "lonksamhet.ebitMarginal": [9, 23], "lonksamhet.nettoMarginal": [8, 23], "stabilitet.skuldEgenkapital": [3, 23], "tillvaxt.omsattningCAGR5ar": [7, 22], "tillvaxt.resultatCAGR5ar": [16, 20], "tillvaxt.omsattningTillvaxtTTM": [5, 22] };
for (const [sökväg, [förväntadR, förväntadN]] of Object.entries(rång)) { const v = g(L, sökväg); const a = tek.map(p => g(p, sökväg)).filter(x => typeof x === "number" && isFinite(x)); const r = a.filter(x => x < v).length + 1; (r === förväntadR && a.length === förväntadN) ? OK() : NEJ(`rang ${sökväg}: ${r}/${a.length} mot förväntat ${förväntadR}/${förväntadN}`); }
tek.length === 23 ? OK() : NEJ("teknikgren n");

// — 6. Länkar —
const länkar = [...new Set([...(b.match(/\]\((\/[^)]+)\)/g) || []).map(x => x.slice(2, -1))])];
const tillåtna = /^\/(dataset\/teknik\/(pe|pb|ev-ebit|peg|fcf-avkastning|vardering|roe|roic|brutto-marginal|netto-marginal|skuldsattning|omsattning-cagr-5ar|resultat-cagr-5ar|omsattningstillvaxt-ttm|prognos-tillvaxt|universumjamforelse)|kurser|transparens|kallor)$/;
länkar.every(l => tillåtna.test(l)) ? OK() : NEJ("interna länkar utanför vitlista: " + länkar.filter(l => !tillåtna.test(l)).join(", "));
const ext = [...new Set([...(b.match(/\]\((https?:\/\/[^)]+)\)/g) || []).map(x => x.slice(2, -1))])];
ext.every(l => /ir\.logitech\.com/.test(l)) ? OK() : NEJ("externa domäner: " + ext.join(", "));
if (http) { const bad = []; for (const l of länkar) { try { const r = await fetch("http://localhost:3000" + l); if (r.status !== 200) bad.push(l + "=" + r.status); } catch { bad.push(l + "=err"); } } bad.length === 0 ? OK() : NEJ("HTTP: " + bad.join(", ")); } else varn.push("länk-HTTP skippad (kör --http)");

// — 7. Språk —
const sv = b.normalize("NFC");
!/ the | and | with | from /.test(sv) ? OK() : NEJ("engelska läckor: " + (sv.match(/ the | and | with | from /g) || []).join("|"));
!/[a-z]{2}_[a-z]{2}/.test(sv) ? OK() : NEJ("underscore-läcka");
!/  /.test(sv.replace(/\| /g, "").replace(/ \|/g, "")) ? OK() : NEJ("dubbla mellanslag");
["tuppar", "spanmål", "dominuar", "struktturellt", "utschup", "fmåttsskolan", "valutororna"].every(x => !sv.includes(x)) ? OK() : NEJ("kända stavfel kvar");

// — Rapport —
console.log(`KVD Logitech-paketet: ${pass} PASS, ${fel.length} FEL, ${varn.length} VARNING${varn.length ? " (" + varn.join("; ") + ")" : ""}`);
fel.forEach(f => console.log("FEL:", f));
process.exit(fel.length ? 1 : 0);
