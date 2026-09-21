#!/usr/bin/env node
// _s4u1-pltr-kvd.mjs — kvalitetsverifiering av PALANTIR Q3-2026-läspaketet (s4-u1, manifest auto-s4-1789986325353).
// Läser paketet + talbanken + universumet LIVE och kontrollerar: md5-lås, källtalsparitet, aritmetik
// (oberoende omräkning), medianer/rang i tillväxtgrenen, grannordning, juridikgrind (inkl V152),
// struktur, länkar (--http), språk + artefaktvakt (dubbelpivot-sessionens byggfönster). Utgång 0 = GRÖN.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const PAKET = "/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-palantir-q3-2026.json";
const DATA = "/home/ak1a/AK1/verktyg/_s4u1-pltr-data.json";
const rawU = readFileSync("/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json", "utf8");
const U = JSON.parse(rawU);
const P = JSON.parse(readFileSync(PAKET, "utf8"));
const T = JSON.parse(readFileSync(DATA, "utf8"));
const A = U.find(p => p.ticker === "PLTR");
const http = process.argv.includes("--http");
let pass = 0, fel = [], varn = [];
const OK = () => pass++;
const NEJ = m => fel.push(m);
const circa = (a, b, tol, m) => Math.abs(a - b) <= tol ? OK() : NEJ(`${m}: ${a} vs ${b}`);

const b = P.body, t = P.title, d = P.description;

// — 0. md5-lås —
const md5 = createHash("md5").update(rawU).digest("hex");
if (md5 === T.kalla.md5) OK(); else NEJ("universumfilens md5 avviker från talbankens snapshot");

// — 1. Struktur —
(b.match(/^## /gm) || []).length === 8 ? OK() : NEJ("H2-antal != 8");
const ord = b.split(/\s+/).filter(Boolean).length;
ord >= 2000 && ord <= 4600 ? OK() : NEJ("ordantal " + ord);
P.slug === "sa-laser-du-palantir-q3-2026" ? OK() : NEJ("slug");
P.tags.length === 6 ? OK() : NEJ("tags");
P.pillar === "Institutionell metodik" && P.author === "AK1A Research Lab" ? OK() : NEJ("pillar/author");
P.publishedAt === "2026-11-02" && P.readingMinutes === Math.round(ord / 600) ? OK() : NEJ("publishedAt/readingMinutes");
d.length > 200 && d.includes("aldrig råd") ? OK() : NEJ("description");
b.trim().endsWith("Publicering av utkastet är kundens beslut (R2).") ? OK() : NEJ("disclaimer sista raden");

// — 2. Juridikgrind —
const lagrum = (b + t + d).match(/2007:528/g) || [];
lagrum.length >= 1 && !(b + t + d).match(/2005:59|2022:260|2022:261|1985:716|2022:482/) ? OK() : NEJ("lagrum: " + lagrum.length);
const bl = b.toLowerCase();
["inte en rekommendation att köpa, sälja eller behålla", "inga köp-, sälj- eller behållningsrekommendationer"].every(f => bl.includes(f)) ? OK() : NEJ("rådformuleringar");
!/köp denna|sälja denna aktie|vi rekommenderar/.test(b + t + d) ? OK() : NEJ("rådverb");
!/data\/blogg\/(?!utkast)/.test(b) ? OK() : NEJ("live-mapp refererad");
!/\bväntas\b/.test(b + t + d) ? OK() : NEJ("V152-prognosordet 'väntas' förekommer");
!/målkurs|undvik denna|köp denna/.test(b + t + d) ? OK() : NEJ("V152-förbjudna prognosord");

// — 3. Källtalsparitet (universum → body, sv-SE-formatterat) —
const sv = (x, dec) => x.toFixed(dec).replace(".", ",");
const tus = x => x.toFixed(0).replace(/(\d)(\d{3})$/, "$1 $2");
const par = [
  ["169,46", sv(A.pris, 2)], ["154,06", sv(A.vardering.pe, 2)], ["41,657", sv(A.vardering.pb, 3)],
  ["137,25", sv(A.vardering.evEbit, 2)], ["0,53", sv(A.vardering.fcfYield * 100, 2)],
  ["38,10", sv(A.lonksamhet.roe * 100, 2)], ["30,31", sv(A.lonksamhet.roic * 100, 2)],
  ["84,80", sv(A.lonksamhet.bruttoMarginal * 100, 2)], ["47,12", sv(A.lonksamhet.ebitMarginal * 100, 2)],
  ["49,01", sv(A.lonksamhet.nettoMarginal * 100, 2)], ["35,07", sv(A.lonksamhet.fcfMarginal * 100, 2)],
  ["0,0214", sv(A.stabilitet.skuldEgenkapital, 4)],
  ["32,9", sv(A.tillvaxt.omsattningCAGR5ar * 100, 1)],
  ["92,8", sv(A.tillvaxt.omsattningTillvaxtTTM * 100, 1)],
  ["44,39", sv(A.tillvaxt.prognosTillvaxt * 100, 2)],
  ["1,73", sv(A.vardering.peg, 2)],
  ["1 906", tus(A.serier.omsattning[0] / 1e6)], ["2 225", tus(A.serier.omsattning[1] / 1e6)],
  ["2 866", tus(A.serier.omsattning[2] / 1e6)], ["4 475", tus(A.serier.omsattning[3] / 1e6)],
  ["374", tus(Math.abs(A.serier.resultat[0] / 1e6))], ["1 625", tus(A.serier.resultat[3] / 1e6)],
  ["407", tus(Math.round(A.marknadsKapitalMdr))],
  ["2 403", tus(A.marknadsKapitalMdr * 1000 / A.pris)],
  ["1,10", sv(A.pris / A.vardering.pe, 2)],
];
for (const [txt, v] of par) v === txt && b.includes(txt) ? OK() : NEJ(`paritet "${txt}" (beräknat ${v}, finns: ${b.includes(txt)})`);

// — 4. Aritmetik: oberoende omräkning —
const pe = A.vardering.pe, pb = A.vardering.pb, roe = A.lonksamhet.roe;
const fy25oms = A.serier.omsattning[3] / 1e6, fy25res = A.serier.resultat[3] / 1e6;
const ttmNetto = A.marknadsKapitalMdr / pe;
const ttmOms = ttmNetto / A.lonksamhet.nettoMarginal;
const ttmEbit = ttmOms * A.lonksamhet.ebitMarginal;
const evBak = A.vardering.evEbit * ttmEbit;
const ekBak = A.marknadsKapitalMdr / pb;
const skuldPek = A.stabilitet.skuldEgenkapital * ekBak;
const kassaPek = A.marknadsKapitalMdr - evBak + skuldPek;
circa(ttmNetto, 2.64336, 0.001, "TTM-netto mdr");
circa(ttmOms, 5.39360, 0.001, "TTM-oms fältväg");
circa(ttmEbit, 2.54156, 0.001, "TTM-EBIT mdr");
circa(evBak, 348.817, 0.01, "EV bakväg mdr");
circa(evBak / A.marknadsKapitalMdr, 0.85666, 0.0005, "EV/mcap (under 1)");
circa(A.marknadsKapitalMdr - evBak, 58.38, 0.05, "mcap minus EV");
circa(ekBak, 9.77523, 0.001, "EK bakväg");
circa(skuldPek, 0.20919, 0.001, "skuld-pekare");
circa(kassaPek, 58.59, 0.05, "kassa-pekare");
circa(pb / roe, 109.336, 0.001, "P/E-identitet P/B÷ROE");
circa(pe / (pb / roe) - 1, 0.40895, 0.0005, "identitetsavvikelse");
circa((Math.pow(fy25oms / (A.serier.omsattning[0] / 1e6), 1 / 3) - 1) * 100, 32.9171, 0.001, "CAGR-oms %");
circa(fy25res / fy25oms * 100, 36.309, 0.001, "2025 nettomarginal %");
circa(A.tillvaxt.omsattningTillvaxtTTM * 100 + A.lonksamhet.fcfMarginal * 100, 127.87, 0.01, "Rule of 40 fönstret");
circa((A.lonksamhet.nettoMarginal - A.lonksamhet.ebitMarginal) * 100, 1.89, 0.001, "netto över EBIT pp");
circa((A.lonksamhet.nettoMarginal - A.lonksamhet.ebitMarginal) * ttmOms, 0.10194, 0.001, "finansnetto-pekare mdr");
circa(pe / (A.tillvaxt.prognosTillvaxt * 100), 3.4706, 0.001, "PEG-konvention");
circa(A.vardering.peg / (pe / (A.tillvaxt.prognosTillvaxt * 100)), 0.4985, 0.001, "PEG-kvot källa/konvention");
circa(8.154 / (fy25oms / 1000), 1.82161, 0.0005, "FY26-guidans mot FY25"); // fy25oms MUSD → mdr
circa(8.154 - 7.190, 0.964, 0.001, "guidans-steg totalt mdr");
circa(8.154 / 7.190 - 1, 0.1341, 0.0005, "guidans-steg procent");
circa(1.4439 ** 5, 6.2758, 0.001, "övning A-femårsfaktor");
circa(pe / (1.4439 ** 5), 24.54, 0.01, "övning A-slutP/E");
circa(0.41 / 0.21 - 1, 0.9524, 0.0005, "EPS-konsensustillväxt");
circa((8.150 + 8.158) / 2 - 3.568, 4.586, 0.001, "H2-rest mdr");
// scenariorutans 9 celler mot bodyns tabell (MUSD-heltal)
const cellV = []; for (const dd of [-0.03, 0, 0.03]) for (const mm of [-0.01, 0, 0.01]) cellV.push(fy25oms * (1 + dd) * (A.lonksamhet.ebitMarginal + mm));
const bodyCell = [...b.matchAll(/\| (?:Intäkter [\d ,]+) \| ([\d ,]+) \| ([\d ,]+) \| ([\d ,]+) \|/g)].flatMap(m => [m[1], m[2], m[3]]);
bodyCell.length === 9 ? OK() : NEJ("scenarieceller hittade " + bodyCell.length);
cellV.forEach((v, i) => circa(parseFloat(bodyCell[i].replace(/ /g, "").replace(",", ".")), Math.round(v), 0.6, `cell ${i + 1}`));
circa(fy25oms * A.lonksamhet.ebitMarginal, 2108.86, 0.1, "scenariobas MUSD");
circa(fy25oms * 0.01, 44.754, 0.01, "1 pp/1 % MUSD");
circa(fy25oms * 0.03, 134.26, 0.01, "3 % MUSD");
circa((8.154 - 7.190) * 1000 / (fy25oms * 0.01), 21.5, 0.1, "haltillskott i marginalpoäng");

// — 5. Medianer + rang LIVE (tillväxtgrenen) —
const gren = U.filter(p => p.bransch === "tillvaxt");
const med = a => { const s = a.filter(v => typeof v === "number" && isFinite(v)).sort((x, y) => x - y); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };
const g = (p, s) => s.split(".").reduce((o, k) => o && o[k], p);
const mv = {
  "43,56": med(gren.map(p => g(p, "vardering.pe"))), "9,15": med(gren.map(p => g(p, "vardering.pb"))),
  "30,83": med(gren.map(p => g(p, "vardering.evEbit"))), "1,42": med(gren.map(p => g(p, "vardering.peg"))),
  "0,82": med(gren.map(p => g(p, "vardering.fcfYield"))) * 100, "15,13": med(gren.map(p => g(p, "lonksamhet.roe"))) * 100,
  "13,79": med(gren.map(p => g(p, "lonksamhet.roic"))) * 100, "47,75": med(gren.map(p => g(p, "lonksamhet.bruttoMarginal"))) * 100,
  "12,13": med(gren.map(p => g(p, "lonksamhet.ebitMarginal"))) * 100, "5,91": med(gren.map(p => g(p, "lonksamhet.nettoMarginal"))) * 100,
  "16,06": med(gren.map(p => g(p, "lonksamhet.fcfMarginal"))) * 100, "0,1705": med(gren.map(p => g(p, "stabilitet.skuldEgenkapital"))),
  "20,16": med(gren.map(p => g(p, "tillvaxt.omsattningCAGR5ar"))) * 100, "33,70": med(gren.map(p => g(p, "tillvaxt.omsattningTillvaxtTTM"))) * 100,
  "37,19": med(gren.map(p => g(p, "tillvaxt.prognosTillvaxt"))) * 100,
};
for (const [txt, v] of Object.entries(mv)) circa(v, parseFloat(txt.replace(",", ".")), 0.006, `grenmedian ${txt}`);
const umv = {
  "20,37": med(U.map(p => g(p, "vardering.pe"))), "2,70": med(U.map(p => g(p, "vardering.pb"))),
  "17,58": med(U.map(p => g(p, "vardering.evEbit"))), "14,57": med(U.map(p => g(p, "lonksamhet.roe"))) * 100,
  "47,81": med(U.map(p => g(p, "lonksamhet.bruttoMarginal"))) * 100, "21,11": med(U.map(p => g(p, "lonksamhet.ebitMarginal"))) * 100,
  "13,90": med(U.map(p => g(p, "lonksamhet.nettoMarginal"))) * 100, "4,66": med(U.map(p => g(p, "tillvaxt.omsattningCAGR5ar"))) * 100,
  "6,62": med(U.map(p => g(p, "tillvaxt.omsattningTillvaxtTTM"))) * 100, "14,21": med(U.map(p => g(p, "tillvaxt.prognosTillvaxt"))) * 100,
};
for (const [txt, v] of Object.entries(umv)) circa(v, parseFloat(txt.replace(",", ".")), 0.005, `universummedian ${txt}`);
const rång = {
  "vardering.pe": [11, 13], "vardering.pb": [15, 16], "vardering.evEbit": [11, 12], "vardering.peg": [7, 11],
  "vardering.fcfYield": [6, 16], "lonksamhet.roe": [15, 16], "lonksamhet.roic": [14, 16],
  "lonksamhet.bruttoMarginal": [17, 17], "lonksamhet.ebitMarginal": [15, 17], "lonksamhet.nettoMarginal": [16, 17],
  "lonksamhet.fcfMarginal": [13, 16], "stabilitet.skuldEgenkapital": [2, 16],
  "tillvaxt.omsattningCAGR5ar": [13, 16], "tillvaxt.omsattningTillvaxtTTM": [15, 17], "tillvaxt.prognosTillvaxt": [10, 15],
};
for (const [sökväg, [förväntadR, förväntadN]] of Object.entries(rång)) { const v = g(A, sökväg); const a = gren.map(p => g(p, sökväg)).filter(x => typeof x === "number" && isFinite(x)); const r = a.filter(x => x < v).length + 1; (r === förväntadR && a.length === förväntadN) ? OK() : NEJ(`rang ${sökväg}: ${r}/${a.length} mot förväntat ${förväntadR}/${förväntadN}`); }
gren.length === 17 ? OK() : NEJ("tillväxtgren n=" + gren.length);
A.tillvaxt.resultatCAGR5ar === null ? OK() : NEJ("resultatCAGR ska vara null (förlustbasår)");
g(gren.find(p => p.ticker === "TSLA"), "marknadsKapitalMdr") > A.marknadsKapitalMdr && g(gren.find(p => p.ticker === "NVDA"), "marknadsKapitalMdr") > A.marknadsKapitalMdr ? OK() : NEJ("grannordning Tesla/Nvidia större");

// — 6. Länkar —
const länkar = [...new Set([...(b.match(/\]\((\/[^)]+)\)/g) || []).map(x => x.slice(2, -1))])];
const tillåtna = /^\/(dataset\/tillvaxt\/(pe|pb|ev-ebit|peg|fcf-avkastning|vardering|roe|roic|brutto-marginal|netto-marginal|skuldsattning|omsattning-cagr-5ar|resultat-cagr-5ar|omsattningstillvaxt-ttm|prognos-tillvaxt|universumjamforelse)|bolag\/pltr|kurser|transparens|kallor)$/;
länkar.every(l => tillåtna.test(l)) ? OK() : NEJ("interna länkar utanför vitlista: " + länkar.filter(l => !tillåtna.test(l)).join(", "));
const ext = [...new Set([...(b.match(/\]\((https?:\/\/[^)]+)\)/g) || []).map(x => x.slice(2, -1))])];
ext.every(l => /investors\.palantir\.com/.test(l)) ? OK() : NEJ("externa domäner: " + ext.join(", "));
ext.length >= 1 ? OK() : NEJ("ingen extern källa länkad");
if (http) { const bad = []; for (const l of länkar) { try { const r = await fetch("http://localhost:3000" + l); if (r.status !== 200) bad.push(l + "=" + r.status); } catch { bad.push(l + "=err"); } } bad.length === 0 ? OK() : NEJ("HTTP: " + bad.join(", ")); } else varn.push("länk-HTTP skippad (kör --http)");

// — 7. Språk + artefaktvakt —
const svb = b.normalize("NFC");
!/ the | and | with | from /.test(svb) ? OK() : NEJ("engelska läckor: " + (svb.match(/ the | and | with | from /g) || []).join("|"));
!/[\u3400-\u9fff]/.test(svb) ? OK() : NEJ("CJK-tecken i brödtext");
!/[a-z]{2}_[a-z]{2}/.test(svb) ? OK() : NEJ("underscore-läcka");
!/  /.test(svb.replace(/\| /g, "").replace(/ \|/g, "")) ? OK() : NEJ("dubbla mellanslag");
!/矢量|同样的|故事|paketetksom|Mdr-plus|riktmt|utanskilt|起草/.test(svb) ? OK() : NEJ("byggfönsterartefakter kvar");
["Pallantir", "Palntir", "vändårets vinstmakin", "utschup", "värddet", "täljaren och nänaren"].every(x => !svb.includes(x)) ? OK() : NEJ("kända stavfel kvar");

// — Rapport —
console.log(`KVD Palantir-paketet: ${pass} PASS, ${fel.length} FEL, ${varn.length} VARNING${varn.length ? " (" + varn.join("; ") + ")" : ""}`);
fel.forEach(f => console.log("FEL:", f));
process.exit(fel.length ? 1 : 0);
