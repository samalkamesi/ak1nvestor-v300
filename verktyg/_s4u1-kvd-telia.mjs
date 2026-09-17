#!/usr/bin/env node
// KVD för s4-u1: Telia Q3-2026 läspaket — oberoende omräkning ur bolagsunivers.json
import fs from "node:fs";

const FIL = "data/blogg-utkast/kvartal/2026-q3/sa-laser-du-telia-q3-2026.json";
const UNI = "data/portfolj-system/bolagsunivers.json";

let FEL = 0, VARN = 0, OK = 0;
const fel = (m) => { FEL++; console.log("FEL:", m); };
const varn = (m) => { VARN++; console.log("VARNING:", m); };
const ok = (m) => { OK++; };
const naer = (a, b, tol, namn) => {
  const d = Math.abs(a - b);
  if (d <= tol) ok(`${namn}: ${a} ≈ ${b}`);
  else fel(`${namn}: ${a} mot ${b} (diff ${d.toPrecision(3)} > tol ${tol})`);
};

// 1. JSON + struktur
const p = JSON.parse(fs.readFileSync(FIL, "utf8"));
const falt = ["slug","title","description","pillar","author","publishedAt","readingMinutes","tags","body"];
for (const f of falt) if (p[f] === undefined) fel(`falt saknas: ${f}`);
if (falt.every(f => p[f] !== undefined)) ok("struktur: 9 falt");
if (p.slug !== "sa-laser-du-telia-q3-2026") fel("slug fel"); else ok("slug");

// 2. Universum
const u = JSON.parse(fs.readFileSync(UNI, "utf8"));
const lista = Array.isArray(u) ? u : (u.bolag || u.universum || Object.values(u).find(Array.isArray));
const b = lista.find(x => x.ticker === "TELIA.ST");
if (!b) { fel("TELIA.ST saknas"); process.exit(1); }
const V = b.vardering, L = b.lonksamhet, T = b.tillvaxt, S = b.stabilitet;
const oms = b.serier.omsattning, res = b.serier.resultat;
if (T.resultatCAGR5ar !== null) varn("resultatCAGR är inte null i filen — textens NULL-påstående måste omprövas");
else ok("källans resultatCAGR = null (textens NULL-påstående sant)");

// 3. Källtalspåståenden
const B = p.body + " " + p.title + " " + p.description;
const finns = (s, namn) => { if (B.includes(s)) ok(`text: "${s}"`); else fel(`text saknar "${s}" (${namn})`); };
finns("35,8", "P/E"); finns("3,53", "P/B"); finns("10,56 procent", "ROE"); finns("10,30 procent", "ROIC");
finns("17,68 procent", "EBITm"); finns("6,03 procent", "nettom"); finns("50,15 procent", "brutto");
finns("25,71 procent", "FCFm"); finns("1,69", "skuld/EK"); finns("6,55 procent", "prognos");
finns("44,77", "kurs"); finns("176,0", "mcap"); finns("1,97", "PEG"); finns("17,9", "EV/EBIT"); finns("11,95", "fcfY");

// 4. Identitet
naer(V.pb / L.roe, 33.45, 0.01, "P/B÷ROE = 33,45");
naer((V.pb / L.roe - V.pe) / V.pe * 100, -6.6, 0.05, "identitetsavvikelse −6,6 %");
naer(V.pe * L.roe, 3.78, 0.005, "omvänd 3,78");
naer(b.pris / V.pe, 1.25, 0.005, "implicit EPS 1,25 kr");
naer(b.marknadsKapitalMdr * 1000 / b.pris, 3932.1, 0.5, "aktier 3 932,1 M");

// 5. Absolutkontroll två vägar
const nettoFalt = oms[3] * L.nettoMarginal;
naer(nettoFalt / 1e6, 4883, 0.5, "nettofält 4 883 Mkr");
naer(V.pe * nettoFalt / 1e9, 174.9, 0.05, "P/E×netto = 174,9 mdr");
naer((V.pe * nettoFalt / 1e9 / b.marknadsKapitalMdr - 1) * 100, -0.6, 0.05, "residual nettofält −0,6 %");
naer(V.pe * res[3] / 1e9, 126.3, 0.05, "P/E×serie = 126,3 mdr");
naer((V.pe * res[3] / 1e9 / b.marknadsKapitalMdr - 1) * 100, -28.3, 0.05, "residual serie −28,3 %");
naer((nettoFalt - res[3]) / res[3] * 100, 39, 0.5, "underlagen 39 % isär");
naer(b.marknadsKapitalMdr * 1000 / V.pe, 4915, 2, "mcap÷P/E = 4 915 Mkr");

// 6. EV-kedja
const EK = b.marknadsKapitalMdr / V.pb, SKULD = EK * S.skuldEgenkapital, EV = EK + SKULD, EBIT = oms[3] * L.ebitMarginal;
naer(EK, 49.8, 0.05, "EK 49,8 mdr"); naer(SKULD, 84.3, 0.1, "skuld 84,3 mdr"); naer(EV, 134.1, 0.1, "EV 134,1 mdr");
naer(EBIT / 1e6, 14318, 1, "EBIT 14 318 Mkr");
naer(EV / (EBIT / 1e9), 9.37, 0.01, "kedja EV/EBIT 9,37");
naer(EV / (EBIT / 1e9) / V.evEbit, 0.52, 0.005, "kvot 0,52");
naer(EV - V.evEbit * (EBIT / 1e9), -121.9, 0.5, "residual −121,9 mdr");

// 7. FCF
naer(L.fcfMarginal * oms[3] / 1e6, 20820, 1, "FCF 20 820 Mkr");
naer(L.fcfMarginal * oms[3] / (b.marknadsKapitalMdr * 1e9) * 100, 11.83, 0.005, "FCF-yield 11,83 %");

// 8. PEG
naer(V.pe / (T.prognosTillvaxt * 100), 5.47, 0.005, "PEG-konvention 5,47");
naer(V.peg / (V.pe / (T.prognosTillvaxt * 100)), 0.36, 0.005, "kvot 0,36");
naer(V.pe / V.peg, 18.2, 0.05, "implicit tillväxt 18,2 %");

// 9. Serier
naer((((oms[3] / oms[0]) ** (1 / 3)) - 1) * 100, -3.75, 0.005, "oms-CAGR −3,75 %");
const stegO = [(oms[1]/oms[0]-1)*100, (oms[2]/oms[1]-1)*100, (oms[3]/oms[2]-1)*100];
const stegR = [(res[1]/res[0]-1)*100, (res[2]/res[1]-1)*100, (res[3]/res[2]-1)*100];
naer(stegO[0], -2.25, 0.005, "oms-steg −2,25 %"); naer(stegO[1], 0.39, 0.005, "oms-steg +0,39 %"); naer(stegO[2], -9.14, 0.005, "oms-steg −9,14 %");
naer(stegR[1], 2236.3, 1, "res-steg +2236 % (303 från 7 079? nej: 2024 från 2023)");
naer(stegR[2], -50.2, 0.05, "res-steg −50,2 %");
for (const [i, v] of [90827, 88785, 89127, 80982].entries()) naer(oms[i] / 1e6, v, 0.5, `intäkt ${2022+i}: ${v} Mkr`);
for (const [i, v] of [-14638, 303, 7079, 3525].entries()) naer(res[i] / 1e6, v, 0.5, `resultat ${2022+i}: ${v} Mkr`);
for (const [i, v] of [-16.12, 0.34, 7.94, 4.35].entries()) naer(res[i] / oms[i] * 100, v, 0.005, `härledd nettoM ${2022+i}: ${v} %`);

// 10. Scenarioruta
const rutor = [[oms[3]*0.97, 78553], [oms[3], 80982], [oms[3]*1.03, 83411]];
const celler = [[13103, 13888, 14674], [13508, 14318, 15127], [13913, 14747, 15581]];
const marginaler = [L.ebitMarginal - 0.01, L.ebitMarginal, L.ebitMarginal + 0.01];
for (let r = 0; r < 3; r++) {
  naer(rutor[r][0] / 1e6, rutor[r][1], 0.5, `intäktsrad ${r+1}: ${rutor[r][1]}`);
  for (let c = 0; c < 3; c++) naer(rutor[r][0] * marginaler[c] / 1e6, celler[r][c], 1, `cell (${r+1},${c+1}): ${celler[r][c]}`);
}
naer(oms[3] * 0.01 / 1e6, 810, 1, "1 pp = 810 Mkr");
naer(oms[3] * 0.03 * L.ebitMarginal / 1e6, 430, 1, "3 % = 430 Mkr");
naer(1 / (3 * L.ebitMarginal), 1.89, 0.005, "marginalvikt 1,89");
naer(V.pe / (1 + T.prognosTillvaxt), 33.61, 0.005, "multiplövning 33,61");
// FCF-variant
for (const [i, v] of [20196, 20820, 21445].entries()) naer(rutor[i][0] * L.fcfMarginal / 1e6, v, 1, `FCF-nivå ${i+1}: ${v} Mkr`);

// 11. Medianer
function med(v){const s=v.filter(x=>typeof x==="number"&&isFinite(x)).sort((a,b)=>a-b);if(!s.length)return null;const m=Math.floor(s.length/2);return s.length%2?s[m]:(s[m-1]+s[m])/2;}
const kom = lista.filter(x => x.bransch === "kommunikation");
if (kom.length !== 13) varn(`kommunikation = ${kom.length} (väntat 13)`);
const kont = [
  ["P/E-median 21,8", med(kom.map(x=>x.vardering?.pe)), 21.788],
  ["P/B-median 2,68", med(kom.map(x=>x.vardering?.pb)), 2.675],
  ["ROE-median 15,84 %", med(kom.map(x=>x.lonksamhet?.roe)), 0.1584],
  ["EBIT-median 21,11 %", med(kom.map(x=>x.lonksamhet?.ebitMarginal)), 0.2111],
  ["netto-median 11,64 %", med(kom.map(x=>x.lonksamhet?.nettoMarginal)), 0.1164],
  ["skuld-median 1,28", med(kom.map(x=>x.stabilitet?.skuldEgenkapital)), 1.280],
  ["universum-P/E 21,2", med(lista.map(x=>x.vardering?.pe)), 21.181],
  ["universum-P/B 2,88", med(lista.map(x=>x.vardering?.pb)), 2.88],
  ["universum-ROE 15,58 %", med(lista.map(x=>x.lonksamhet?.roe)), 0.1558],
];
for (const [namn, ber, txt] of kont) naer(ber, txt, Math.max(Math.abs(txt) * 0.005, 0.002), namn);
naer((V.pe/21.788-1)*100, 64, 0.6, "P/E +64 % mot grenen");
naer((V.pb/2.675-1)*100, 32, 0.6, "P/B +32 %");
naer((L.roe/0.1584-1)*100, -33, 0.6, "ROE −33 %");
naer((L.ebitMarginal/0.2111-1)*100, -16, 0.6, "EBIT −16 %");
naer((L.nettoMarginal/0.1164-1)*100, -48, 0.6, "netto −48 %");
naer((S.skuldEgenkapital/1.28-1)*100, 32, 0.6, "skuld +32 %");
naer(L.fcfMarginal / L.nettoMarginal, 4.26, 0.02, "FCF = 4,3× netto");

// 12. Ord + readingMinutes
function raknaOrd(t){ return (t.replace(/\|/g," ").replace(/[#*`\n]/g," ").match(/[A-Za-zÅÄÖåäö0-9%,.−-]+/g)||[]).length; }
const ord = raknaOrd(p.title + " " + p.description + " " + p.body);
console.log(`ord (title+desc+body): ${ord}`);
const rm = Math.round(ord / 600);
if (p.readingMinutes === rm) ok(`readingMinutes ${p.readingMinutes} = round(${ord}/600)`);
else fel(`readingMinutes ${p.readingMinutes} mot kontraktet ${rm}`);

// 13. Juridik
const bodyLower = p.body.toLowerCase();
const radVerb = [/\bbör (du )?(köpa|sälja|teckna|behålla)\b/, /\brekommenderar\b/, /\bråd\b att (köpa|sälja)/];
for (const re of radVerb) { const m = bodyLower.match(re); if (m) fel(`rådverb: ${m[0]}`); }
ok("rådverb 0");
const kupj = [...p.body.matchAll(/(köp|sälj|köpa|sälja)/gi)].map(m => [m.index, m[0]]);
console.log(`köp/sälj-förekomster: ${kupj.length}`);
for (const [i] of kupj) {
  const ktx = p.body.slice(Math.max(0, i - 90), i + 90).toLowerCase();
  const neutral = ktx.includes("insider") || ktx.includes("registrerade") || ktx.includes("förblev");
  if (!(neutral || ktx.includes("inte") || ktx.includes("ingen") || ktx.includes("aldrig"))) varn(`kontext: "${p.body.slice(Math.max(0,i-40), i+40).replace(/\n/g," ")}"`);
}
if (p.body.includes("inte investeringsrådgivning")) ok("disclaimer"); else fel("disclaimer saknas");
if (p.body.includes("(2007:528) 2 kap 5 §")) ok("lagrum korrekt"); else fel("lagrum fel");
const lagrum = p.body.match(/ \d{4}:\d{3}/g) || [];
if (lagrum.length > 1) fel("flera lagrum: " + lagrum.join(",")); else ok("ett lagrum");

// 14. Länkar
const lnkar = [...new Set([...(p.body + p.description).matchAll(/\]\((\/[^)#]+)\)/g)].map(m => m[1]))];
console.log(`unika interna länkar: ${lnkar.length}`);
const tillatna = new Set(["/kurser", "/transparens", "/kallor", "/bolag/telia-st"]);
for (const l of lnkar) if (!tillatna.has(l) && !l.startsWith("/dataset/kommunikation/")) fel(`oväntad länkrot: ${l}`);
ok("länkrötter korrekta");
const utkastLank = [...(p.body + p.description).matchAll(/\]\(([^)]*blogg-utkast[^)]*)\)/g)];
if (utkastLank.length) fel("utkastlänk"); else ok("0 utkastlänkar");

// 15. Rubriker + tabell
const h2 = [...p.body.matchAll(/^## (.+)$/gm)].map(m => m[1]);
console.log("H2:", h2.length);
if (h2.length >= 7) ok("H2 >= 7"); else fel("H2 < 7");
if (p.body.includes("| Intäkter 78 553 | 13 103 | 13 888 | 14 674 |") && p.body.includes("| Intäkter 83 411 | 13 913 | 14 747 | 15 581 |")) ok("scenarioruta komplett");
else fel("scenarioruta ofullständig");

// 16. HTTP
const { execFileSync } = await import("node:child_process");
let httpOk = 0;
for (const l of lnkar) {
  let kode = "000";
  try { kode = execFileSync("curl", ["-s","-o","/dev/null","-w","%{http_code}","--max-time","8",`http://localhost:3000${l}`],{encoding:"utf8",timeout:15000}).trim(); } catch { kode = "ERR"; }
  if (kode === "200") httpOk++; else fel(`länk ${l} → ${kode}`);
}
console.log(`interna länkar HTTP 200: ${httpOk}/${lnkar.length}`);
console.log(`\n=== KVD: ${OK} PASS, ${FEL} FEL, ${VARN} VARNING ===`);
process.exit(FEL > 0 ? 1 : 0);
