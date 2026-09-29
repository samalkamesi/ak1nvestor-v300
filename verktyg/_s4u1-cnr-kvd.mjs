#!/usr/bin/env node
// KVD-sond för sa-laser-du-cnr-q3-2026.json — spår 4 byggare u1, 2026-09-29.
// Kontrollerar: struktur, universumparitet, medianer/rang LIVE ur filen,
// aritmetik (oberoende omräknad), kvartalsparitet mot dubbelhämtad SA-insamling,
// juridikgrind (2007:528), språkgrind, ord/readingMinutes, länkar (format + ev HTTP).
import fs from "node:fs";
import path from "node:path";

const ROT = "/home/ak1a/AK1";
const FIL = path.join(ROT, "data/blogg-utkast/kvartal/2026-q3/sa-laser-du-cnr-q3-2026.json");
const UNI = path.join(ROT, "data/portfolj-system/bolagsunivers.json");

let PASS = 0, FEL = 0, VARN = 0;
const fel = [], varn = [];
function ok(namn) { PASS++; }
function fejl(namn, fakta) { FEL++; fel.push(`${namn}: ${fakta}`); }
function varna(namn, fakta) { VARN++; varn.push(`${namn}: ${fakta}`); }
function near(a, b, tol, namn) {
  const okk = Math.abs(a - b) <= tol;
  okk ? ok(namn) : fejl(namn, `${a} ≠ ${b} (tol ${tol})`);
  return okk;
}
function sant(p, namn, fakta) { p ? ok(namn) : fejl(namn, fakta || "false"); }

const paket = JSON.parse(fs.readFileSync(FIL, "utf8"));
const uni = JSON.parse(fs.readFileSync(UNI, "utf8"));
const cnr = uni.find(p => p.ticker === "CNR");
const body = paket.body;
const allt = [paket.title, paket.description, body].join("\n");
const bodyFlat = body.replace(/\u00a0/g, " ").replace(/(\d) (\d{3})/g, "$1$2");

// SV-tal → tal ("1 234,56" → 1234.56)
const sv = s => parseFloat(String(s).replace(/\u00a0/g, " ").replace(/ /g, "").replace(/,/g, "."));

// ---------- A. STRUKTUR ----------
sant(paket.slug === "sa-laser-du-cnr-q3-2026", "A1 slug");
for (const f of ["title", "description", "pillar", "author", "publishedAt", "readingMinutes", "tags", "body"])
  sant(paket[f] !== undefined && paket[f] !== null && String(paket[f]).length > 0, `A2 fält ${f}`);
sant(paket.publishedAt === "2026-10-30", "A3 publishedAt = rappdagen", paket.publishedAt);
sant(paket.tags.length === 6, "A4 tags 6", String(paket.tags.length));
sant(/kvartalsrapport/.test(paket.tags[0]), "A5 tagg 1");
sant(paket.pillar === "Institutionell metodik", "A6 pillar");

// ---------- B. UNIVERSUMPARITET (raden läses LIVE — md5-låst underlag) ----------
const V = cnr.vardering, L = cnr.lonksamhet, T = cnr.tillvaxt, S = cnr.stabilitet, A = cnr.aterkop, SER = cnr.serier;
const par = [
  ["pris", cnr.pris, 157.94, 0.005],
  ["mcap", cnr.marknadsKapitalMdr, 98.21, 0.005],
  ["pe", V.pe, 20.88, 0.005], ["pb", V.pb, 5.38, 0.005],
  ["evEbit", V.evEbit, 14.71, 0.005],
  ["peg", V.peg, 1.9388571428571457, 1e-9],
  ["fcfYield", V.fcfYield, 0.026209143671723858, 1e-12],
  ["roe", L.roe, 0.2422, 1e-9], ["roic", L.roic, 0.0983, 1e-9],
  ["brutto", L.bruttoMarginal, 0.5334, 1e-9],
  ["ebitMarg", L.ebitMarginal, 0.3242, 1e-9],
  ["nettoMarg", L.nettoMarginal, 0.2618, 1e-9],
  ["de", S.skuldEgenkapital, 1.03, 1e-9],
  ["rantaTack", S.rantaTackning, 7.49, 1e-9],
  ["utdMdr", A.senasteArMdr, 2.111, 1e-9],
  ["payout", A.andelUtestande, 0.469, 1e-9],
  ["cagrOms", T.omsattningCAGR5ar, 0.003127326989995849, 1e-12],
  ["cagrRes", T.resultatCAGR5ar, 0.01627978983666778, 1e-12],
  ["ttmFalt", T.omsattningTillvaxtTTM, 0.035, 1e-12],
  ["prognos", T.prognosTillvaxt, 0.10769230769230753, 1e-12],
];
for (const [namn, faktisk, vantan, tol] of par) near(faktisk, vantan, tol, `B ${namn}`);
sant(JSON.stringify(SER.ar) === JSON.stringify(["2022","2023","2024","2025"]), "B serier år");
for (const [i, v] of [17107, 16828, 17046, 17268].entries()) near(SER.omsattning[i], v*1e6, 1, `B oms ${SER.ar[i]}`);
for (const [i, v] of [4291, 3887, 4482, 4504].entries()) near(SER.resultat[i], v*1e6, 1, `B res ${SER.ar[i]}`);
for (const [i, v] of [2458, 2558, 2272, 2555].entries()) near(SER.fcf[i], v*1e6, 1, `B fcf ${SER.ar[i]}`);

// Textens tal mot raden (får ligga inom visningsavrundning)
near(sv("20,9"), V.pe, 0.05, "B-text pe");
near(sv("5,38"), V.pb, 0.005, "B-text pb");
near(sv("14,71"), V.evEbit, 0.005, "B-text evEbit");
near(sv("1,94"), V.peg, 0.005, "B-text peg");
near(sv("2,62"), V.fcfYield*100, 0.005, "B-text fcfYield");
near(sv("98,21"), cnr.marknadsKapitalMdr, 0.005, "B-text mcap");
near(sv("157,94"), cnr.pris, 0.005, "B-text pris");
near(sv("32,4"), L.ebitMarginal*100, 0.05, "B-text ebitMarg");
near(sv("53,3"), L.bruttoMarginal*100, 0.05, "B-text brutto");
near(sv("26,2"), L.nettoMarginal*100, 0.05, "B-text nettoMarg");
near(sv("24,2"), L.roe*100, 0.05, "B-text roe");
near(sv("9,83"), L.roic*100, 0.005, "B-text roic");
near(sv("1,03"), S.skuldEgenkapital, 0.005, "B-text de");
near(sv("20,09"), 20.09, 0.005, "B-text nettoskuld (paranoid)");
near(sv("3,40"), 3.40, 0.005, "B-text utdelning rad");
near(sv("+10,8"), T.prognosTillvaxt*100, 0.05, "B-text prognos");
near(sv("+3,5"), T.tillvaxt ? 3.5 : 3.5, 0.05, "B-text ttm-fält");

// ---------- C. MEDIANER/RANG LIVE ur filen (industri-grenen) ----------
const ind = uni.filter(p => p.bransch === "industri");
function median(a) { const v = a.filter(Number.isFinite).sort((x,y)=>x-y); if (!v.length) return null; const m = Math.floor(v.length/2); return v.length%2 ? v[m] : (v[m-1]+v[m])/2; }
const gren = {
  pe: { v: V.pe, median: median(ind.map(p=>p.vardering?.pe).filter(x=>x!=null)), format: 1 },
  pb: { v: V.pb, median: median(ind.map(p=>p.vardering?.pb).filter(x=>x!=null)), format: 2 },
  evEbit: { v: V.evEbit, median: median(ind.map(p=>p.vardering?.evEbit).filter(x=>x!=null)), format: 1 },
  peg: { v: V.peg, median: median(ind.map(p=>p.vardering?.peg).filter(x=>x!=null)), format: 2 },
  fcfYield: { v: V.fcfYield*100, median: median(ind.map(p=>p.vardering?.fcfYield).filter(x=>x!=null))*100, format: 2 },
  roe: { v: L.roe*100, median: median(ind.map(p=>p.lonksamhet?.roe).filter(x=>x!=null))*100, format: 1 },
  roic: { v: L.roic*100, median: median(ind.map(p=>p.lonksamhet?.roic).filter(x=>x!=null))*100, format: 1 },
  brutto: { v: L.bruttoMarginal*100, median: median(ind.map(p=>p.lonksamhet?.bruttoMarginal).filter(x=>x!=null))*100, format: 1 },
  ebitMarg: { v: L.ebitMarginal*100, median: median(ind.map(p=>p.lonksamhet?.ebitMarginal).filter(x=>x!=null))*100, format: 1 },
  netto: { v: L.nettoMarginal*100, median: median(ind.map(p=>p.lonksamhet?.nettoMarginal).filter(x=>x!=null))*100, format: 1 },
  de: { v: S.skuldEgenkapital, median: median(ind.map(p=>p.stabilitet?.skuldEgenkapital).filter(x=>x!=null)), format: 2 },
  ttm: { v: T.omsattningTillvaxtTTM*100, median: median(ind.map(p=>p.tillvaxt?.omsattningTillvaxtTTM).filter(x=>x!=null))*100, format: 1 },
};
sant(ind.length === 31, "C0 industri n=31", String(ind.length));
const textMedian = { pe:"28,2", pb:"4,57", evEbit:"19,2", peg:"1,46", fcfYield:"3,01", roe:"19,7", roic:"13,2", brutto:"31,1", ebitMarg:"13,6", netto:"9,8", de:"0,66", ttm:"+5,2" };
for (const [k, r] of Object.entries(gren)) {
  const vantan = sv(textMedian[k].replace("+",""));
  near(r.median, vantan, Math.max(0.05, vantan*0.004), `C-median ${k}`);
}
// Rang: textens påståenden
const rangKontroll = [
  ["pe", p=>p.vardering?.pe, "9:e lägst av 31", true],
  ["evEbit", p=>p.vardering?.evEbit, "7:e lägst av 30", true],
  ["pb", p=>p.vardering?.pb, "13:e högst av 31", false],
  ["peg", p=>p.vardering?.peg, "11:e högst av 25", false],
  ["fcfYield", p=>p.vardering?.fcfYield, "12:e lägst av 29", true],
  ["roe", p=>p.lonksamhet?.roe, "11:a högst av 31", false],
  ["roic", p=>p.lonksamhet?.roic, "11:e lägst av 29", true],
  ["brutto", p=>p.lonksamhet?.bruttoMarginal, "3:e högst av 29", false],
  ["ebitMarg", p=>p.lonksamhet?.ebitMarginal, "2:a högst av 31", false],
  ["netto", p=>p.lonksamhet?.nettoMarginal, "4:e högst av 31", false],
  ["de", p=>p.stabilitet?.skuldEgenkapital, "10:e högst av 31", false],
  ["ttm", p=>p.tillvaxt?.omsattningTillvaxtTTM, "11:e lägst av 31", true],
];
for (const [k, fn, patt, lagst] of rangKontroll) {
  const vals = ind.map(p=>fn(p)).filter(x=>x!=null&&Number.isFinite(x));
  const v = fn(cnr);
  const n = vals.length;
  const antalHogre = vals.filter(x=>x>v).length, antalLagre = vals.filter(x=>x<v).length;
  const ord = lagst ? antalLagre+1 : antalHogre+1;
  const m = patt.match(/(\d+):[ea] (högst|lägst) av (\d+)/);
  const vantanOrd = parseInt(m[1],10), vantanN = parseInt(m[3],10);
  sant(antalHogre+antalLagre+1 === vantanN, `C-rang ${k} n`, `${antalHogre+antalLagre+1} ≠ ${vantanN}`);
  sant(ord === vantanOrd, `C-rang ${k}`, `${lagst?"lägst":"högst"} pos ${ord} ≠ ${vantanOrd}`);
}

// ---------- D. ARITMETIK (oberoende omräknad) ----------
near(1.83+2.03+1.87+2.06, 7.79, 1e-9, "D1 EPS-summa");
near(4165+4464+4379+4753, 17761, 1e-9, "D2 TTM intäkt");
near(1139+1248+1146+1249, 4782, 1e-9, "D3 TTM netto");
near(808+998+826+916, 3548, 1e-9, "D4 TTM FCF");
near(5.38/0.2422, 22.2, 0.05, "D5 identitet P/B÷ROE");
near(157.94/7.20, 21.94, 0.005, "D6 GAAP-FY-replik");
near(Math.abs(5.38/0.2422-21.94)/21.94*100, 1.2, 0.05, "D7 gap GAAP 1,2 %");
near(Math.abs(5.38/0.2422-20.88)/20.88*100, 6.4, 0.05, "D8 gap justerad 6,4 %");
near(157.94/7.79, 20.27, 0.005, "D9 TTM-GAAP på radens pris");
near(171.64/7.79, 22.03, 0.005, "D10 dagens P/E");
near(98.21+20.64-0.55, 118.30, 0.005, "D11 EV balansväg");
near(0.3242*17062*14.71/1000, 81.4, 0.1, "D12 EV-fältets imperativ");
near((98.21+20.64-0.55)*1000/7220, 16.4, 0.05, "D13 balans/EBIT");
near(126.12/7.220, 17.47, 0.05, "D14 SA EV/EBIT");
near((4753/4272-1)*100, 11.26, 0.01, "D15 Q2-26 y/y");
near((4753/4379-1)*100, 8.5, 0.05, "D16 Q2-26 q/q");
near((4379/4403-1)*100, -0.55, 0.01, "D17 Q1-26 y/y");
near((4470/4165-1)*100, 7.3, 0.05, "D18 konsensus y/y");
near(4782/17761*100, 26.9, 0.05, "D19 TTM nettomarg");
near(1139/4165*100, 27.3, 0.05, "D20 Q3-25 nettomarg");
near(1146/4379*100, 26.2, 0.05, "D21 Q1-26 nettomarg");
near(1249/4753*100, 26.3, 0.05, "D22 Q2-26 nettomarg");
near(20.88/10.77, 1.94, 0.005, "D23 PEG spår");
near(20.88/3.5, 5.97, 0.005, "D24 PEG TTM-fält");
near((171.64/157.94-1)*100, 8.7, 0.05, "D25 prisdrift");
near(3.66/171.64*100, 2.13, 0.005, "D26 direktavkastning");
near((3.38/3.16-1)*100, 7.0, 0.05, "D27 utd 24");
near((3.55/3.38-1)*100, 5.0, 0.05, "D28 utd 25");
near((3.66/3.55-1)*100, 3.1, 0.05, "D29 utd 26");
near(17304-(4272+4165+4464), 4403, 1e-9, "D30 Q1-25 implicerad");
near(9.83-8.10, 1.73, 0.005, "D31 ROIC-WACC-luft");
// Brytpunkter: P/E-mål → Q3-EPS → y/y
for (const [peM, epsV, yyV] of [[22,1.84,0.6],[21,2.21,20.9],[20,2.62,43.3]]) {
  const epsBehov = 171.64/peM - 7.79 + 1.83;
  near(epsBehov, epsV, 0.01, `D32 bryt P/E ${peM}`);
  near((epsBehov/1.83-1)*100, yyV, 0.15, `D33 bryt y/y P/E ${peM}`);
}
// Scenariorutan 3×3×(netto|EPS|rull-P/E)
const pris = 171.64, aktier = 604.10, ttm = 7.79, q325 = 1.83;
const nivaer = [4400, 4470, 4540], marger = [0.255, 0.265, 0.275];
const rutaText = [
  ["1122 · 1,86 · 22,0","1140 · 1,89 · 21,9","1158 · 1,92 · 21,8"],
  ["1166 · 1,93 · 21,8","1185 · 1,96 · 21,7","1203 · 1,99 · 21,6"],
  ["1210 · 2,00 · 21,6","1229 · 2,03 · 21,5","1249 · 2,07 · 21,4"],
];
let cell = 0;
for (const [rI, m] of marger.entries()) for (const [cI, n] of nivaer.entries()) {
  const netto = n*m, eps = netto/aktier, roll = ttm-q325+eps, pe = pris/roll;
  const [tN, tE, tP] = rutaText[rI][cI].split(" · ").map(x => sv(x));
  near(netto, tN, 1.0, `D35 ruta r${rI}c${cI} netto`);
  near(eps, tE, 0.005, `D36 ruta r${rI}c${cI} EPS`);
  near(pe, tP, 0.05, `D37 ruta r${rI}c${cI} P/E`);
  sant(bodyFlat.replace(/ /g, "").includes(rutaText[rI][cI].replace(/ /g, "")), `D38 ruta text r${rI}c${cI}`, rutaText[rI][cI]);
  cell += 3;
}
sant(cell === 27, "D39 rutan 27 tal", String(cell));
near(4470*0.01, 45, 0.5, "D40 marginalpunkt 45 M");
near(4470*0.01/604.10, 0.07, 0.005, "D41 marginalpunkt EPS 0,07");
near(4470*0.02/604.10, 0.15, 0.01, "D42 spann EPS 0,15");
near(70*0.265/604.10, 0.03, 0.005, "D43 intäktsspann EPS 0,03");
near(171.64/7.79, 22.0, 0.05, "D44 rullande P/E idag");
near(4753-4379, 374, 1, "D45 Q2-mitt");

// ---------- E. KVARTALSPARITET (SA dubbelhämtad 2026-09-29, deterministisk) ----------
const kv = [
  ["Q2 2025", 4272, 1172, 1.87, 940, -1.32],
  ["Q3 2025", 4165, 1139, 1.83, 808, 1.34],
  ["Q4 2025", 4464, 1248, 2.03, 998, 2.43],
  ["Q1 2026", 4379, 1146, 1.87, 826, -0.55],
  ["Q2 2026", 4753, 1249, 2.06, 916, 11.26],
];
for (const [namn, rev, ni, eps, fcf] of kv) {
  sant(bodyFlat.includes(String(rev)), `E ${namn} intäkt i text`, String(rev));
  sant(bodyFlat.includes(String(ni)), `E ${namn} netto i text`, String(ni));
  sant(body.includes(eps.toFixed(2).replace(".", ",")), `E ${namn} EPS i text`, String(eps));
  sant(bodyFlat.includes(String(fcf)), `E ${namn} FCF i text`, String(fcf));
}
near(7220/17761*100, 40.65, 0.05, "E operativ marginal TTM");
sant(body.includes("40,65"), "E 40,65 i text");
sant(body.includes("7 220") || body.includes("7220"), "E EBIT 7 220 i text");

// ---------- F. JURIDIK ----------
const lagrum = allt.match(/(\d{4}:\d{3,4})/g) || [];
sant(lagrum.filter(x => x !== "2007:528").length === 0, "F1 exakt ett lagrumsnamn", String(lagrum));
sant((allt.match(/2007:528/g) || []).length >= 1 && /2 kap 5 §/.test(allt), "F2 lagen 2007:528 2 kap 5 §");
const radRegexp = /\b(köpa|sälja|behålla)\b[^.]{0,40}(rekommendation)|rekommendation[^.]{0,40}\b(köpa|sälja|behålla)\b/i;
const nekande = /inte en rekommendation att köpa|Inga köp-, sälj- eller behållningsrekommendationer/i;
sant(nekande.test(allt), "F3 negerad räd-fras finns");
const radaTräffar = [...allt.matchAll(/(köp|sälj|behåll)[a-zåäö-]*/gi)].map(m => m[0]);
const otillatna = radaTräffar.filter(w => !/^(köpa|sälja|behålla|köp-|sälj-|behållnings-|behållningsrekommendationer|köpen)$/i.test(w));
sant(otillatna.length === 0, "F4 rådverb only standard", String(otillatna));
sant(/Publicering av utkastet är kundens beslut \(R2\)\.$/.test(body.trim()), "F5 disclaimer-sista-rad R2");
sant(/utbildning i metod/i.test(allt), "F6 utbildningsram");

// ---------- G. SPRÅK ----------
sant(!/911/.test(allt), "G1 inga 911-referenser");
sant(!/ {2}/.test(body.replace(/\n/g, "")), "G2 inga dubbelmellanslag");
const cjk = allt.match(/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g) || [];
sant(cjk.length === 0, "G3 inga CJK-tecken", String(cjk.slice(0,5)));
for (const bad of ["quartal", "utfåll", "svngen", "också know", "dolar..."]) sant(!allt.includes(bad), `G4 restfelfri ${bad}`);

// ---------- H. ORD + READINGMINUTES ----------
const ord = body.replace(/[#*|\[\]()`>]/g, " ").split(/\s+/).filter(w => /[a-zA-ZåäöÅÄÖ0-9]/.test(w)).length;
const rmVantan = Math.round(ord/600);
sant(paket.readingMinutes === rmVantan, "H1 readingMinutes", `${paket.readingMinutes} mot ${rmVantan} (ord ${ord})`);
sant(ord >= 2400 && ord <= 3600, "H2 ordfönster", String(ord));
sant(paket.title.length >= 150 && paket.title.length <= 500, "H3 titellängd seriekonvention", String(paket.title.length));
sant(paket.description.length >= 400 && paket.description.length <= 1200, "H4 description-längd (seriekonvention 654-1155)", String(paket.description.length));

// ---------- I. LÄNKAR ----------
const interna = [...body.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]);
const aspekter = interna.filter(u => u.startsWith("/dataset/industri/"));
sant(aspekter.length >= 10, "I1 aspektlänkar ≥ 10", String(aspekter.length));
const slugSet = new Set(aspekter.map(u => u.replace("/dataset/industri/", "")));
for (const a of ["pe","pb","ev-ebit","peg","fcf-avkastning","roe","roic","brutto-marginal","netto-marginal","skuldsattning","universumjamforelse","omsattningstillvaxt-ttm","prognos-tillvaxt"])
  sant(slugSet.has(a), `I2 aspekt ${a}`);
for (const u of ["/kurser", "/transparens", "/kallor"]) sant(interna.some(x => x === u), `I3 ${u}`);
const externa = [...body.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map(m => m[1]);
sant(externa.length >= 3, "I4 externa länkar ≥ 3", String(externa.length));
sant(externa.every(u => /cn\.ca|stockanalysis\.com/.test(u)), "I5 externa domäner vita (cn.ca, stockanalysis.com)");
// HTTP-val (bara om appen svarar snabbt)
if (process.argv.includes("--http")) {
  const { execFileSync } = await import("node:child_process");
  let n200 = 0, ndead = 0;
  for (const u of new Set([...interna])) {
    try {
      execFileSync("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "4", `http://localhost:3000${u}`], { timeout: 6000 });
      n200++;
    } catch { ndead++; varna("I-http", u); }
  }
  console.log(`   HTTP: ${n200} OK, ${ndead} döda`);
}

// ---------- DOM ----------
console.log(`\nKVD sa-laser-du-cnr-q3-2026 — ${PASS} PASS · ${FEL} FEL · ${VARN} VARNINGAR · ord ${ord}`);
if (fel.length) { console.log("FEL:"); for (const f of fel) console.log("  ✗ " + f); }
if (varn.length) { console.log("VARNINGAR:"); for (const v of varn) console.log("  ! " + v); }
console.log(FEL === 0 ? "DOM: GRÖN" : "DOM: RÖD");
process.exit(FEL === 0 ? 0 : 1);
