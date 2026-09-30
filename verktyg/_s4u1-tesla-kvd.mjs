#!/usr/bin/env node
// KVD-sond för sa-laser-du-tesla-q3-2026.json — spår 4 byggare u1, 2026-09-30.
// Kontrollerar: struktur, universumparitet (TSLA-raden LIVE), medianer/rang LIVE
// ur tillväxt-grenen + universumets 328, aritmetik (oberoende omräknad; kedjor,
// identiteter, aktiebas-världar, brytpunkter, scenarioruta), kvartalsparitet mot
// den sökverifierade primärinsamlingen, juridikgrind (2007:528), språkgrind,
// ord/readingMinutes, länkar (format + ev HTTP).
import fs from "node:fs";
import path from "node:path";

const ROT = "/home/ak1a/AK1";
const FIL = path.join(ROT, "data/blogg-utkast/kvartal/2026-q3/sa-laser-du-tesla-q3-2026.json");
const UNI = path.join(ROT, "data/portfolj-system/bolagsunivers.json");

let PASS = 0, FEL = 0, VARN = 0;
const fel = [], varn = [];
function ok() { PASS++; }
function fejl(namn, fakta) { FEL++; fel.push(`${namn}: ${fakta}`); }
function varna(namn, fakta) { VARN++; varn.push(`${namn}: ${fakta}`); }
function near(a, b, tol, namn) {
  const okk = Math.abs(a - b) <= tol;
  okk ? ok() : fejl(namn, `${a} ≠ ${b} (tol ${tol})`);
  return okk;
}
function sant(p, namn, fakta) { p ? ok() : fejl(namn, fakta || "false"); }

const paket = JSON.parse(fs.readFileSync(FIL, "utf8"));
const uni = JSON.parse(fs.readFileSync(UNI, "utf8"));
const tsla = uni.find(p => p.ticker === "TSLA");
const body = paket.body;
const allt = [paket.title, paket.description, body].join("\n");
const bodyFlat = body.replace(/\u00a0/g, " ").replace(/(\d) (\d{3})/g, "$1$2");
const sv = s => parseFloat(String(s).replace(/\u00a0/g, " ").replace(/ /g, "").replace(/,/g, "."));

// ---------- A. STRUKTUR ----------
sant(paket.slug === "sa-laser-du-tesla-q3-2026", "A1 slug");
for (const f of ["title", "description", "pillar", "author", "publishedAt", "readingMinutes", "tags", "body"])
  sant(paket[f] !== undefined && paket[f] !== null && String(paket[f]).length > 0, `A2 fält ${f}`);
sant(paket.publishedAt === "2026-10-21", "A3 publishedAt = rappdagen", paket.publishedAt);
sant(paket.tags.length === 6, "A4 tags 6", String(paket.tags.length));
sant(/kvartalsrapport/.test(paket.tags[0]), "A5 tagg 1");
sant(paket.tags[1] === "Tesla" && paket.tags[2] === "tillväxt" && paket.tags[3] === "USA", "A6 taggar 2-4");
sant(paket.pillar === "Institutionell metodik", "A7 pillar");

// ---------- B. UNIVERSUMPARITET (raden läses LIVE) ----------
const V = tsla.vardering, L = tsla.lonksamhet, T = tsla.tillvaxt, S = tsla.stabilitet, A = tsla.aterkop, SER = tsla.serier;
const par = [
  ["pris", tsla.pris, 357.01, 0.005],
  ["mcap", tsla.marknadsKapitalMdr, 1410.028, 0.005],
  ["pe", V.pe, 333.654, 0.005], ["pb", V.pb, 16.231, 0.005],
  ["evEbit", V.evEbit, 946.761, 0.005],
  ["peg", V.peg, 4.26, 0.005],
  ["fcfYield", V.fcfYield, 0.0034, 1e-12],
  ["roe", L.roe, 0.0467, 1e-9], ["roic", L.roic, 0.0142, 1e-9],
  ["brutto", L.bruttoMarginal, 0.1885, 1e-9],
  ["ebitMarg", L.ebitMarginal, 0.0141, 1e-9],
  ["nettoMarg", L.nettoMarginal, 0.0367, 1e-9],
  ["fcfMarg", L.fcfMarginal, 0.0467, 1e-9],
  ["de", S.skuldEgenkapital, 0.1837, 1e-9],
  ["insider", A.insiderkopSenaste6man, 10, 1e-9],
  ["cagrOms", T.omsattningCAGR5ar, 0.0519, 1e-12],
  ["cagrRes", T.resultatCAGR5ar, -0.329, 1e-12],
  ["ttmFalt", T.omsattningTillvaxtTTM, 0.255, 1e-12],
  ["prognos", T.prognosTillvaxt, 0.2177, 1e-12],
];
for (const [namn, faktisk, vantan, tol] of par) near(faktisk, vantan, tol, `B ${namn}`);
sant(JSON.stringify(SER.ar) === JSON.stringify(["2022","2023","2024","2025"]), "B serier år");
for (const [i, v] of [81462, 96773, 97690, 94827].entries()) near(SER.omsattning[i], v*1e6, 1, `B oms ${SER.ar[i]}`);
for (const [i, v] of [12556, 14997, 7091, 3794].entries()) near(SER.resultat[i], v*1e6, 1, `B res ${SER.ar[i]}`);
sant(Array.isArray(SER.egetKapital) && SER.egetKapital.length === 0, "B EK-tom dokumentklass");
sant(Array.isArray(SER.fcf) && SER.fcf.length === 0, "B FCF-tom dokumentklass");
sant(tsla.valuta === "USD" && tsla.land === "USA" && tsla.bransch === "tillvaxt", "B valuta/land/gren");

// Textens tal mot raden (visningsavrundning)
near(sv("333,654"), V.pe, 0.0005, "B-text pe");
near(sv("16,231"), V.pb, 0.0005, "B-text pb");
near(sv("946,761"), V.evEbit, 0.0005, "B-text evEbit");
near(sv("4,26"), V.peg, 0.005, "B-text peg");
near(sv("0,34"), V.fcfYield*100, 0.005, "B-text fcfYield");
near(sv("1 410,028"), tsla.marknadsKapitalMdr, 0.0005, "B-text mcap");
near(sv("357,01"), tsla.pris, 0.005, "B-text pris");
near(sv("18,85"), L.bruttoMarginal*100, 0.005, "B-text brutto");
near(sv("1,41"), L.ebitMarginal*100, 0.005, "B-text ebitMarg");
near(sv("3,67"), L.nettoMarginal*100, 0.005, "B-text nettoMarg");
near(sv("4,67"), L.roe*100, 0.005, "B-text roe");
near(sv("1,42"), L.roic*100, 0.005, "B-text roic");
near(sv("0,1837"), S.skuldEgenkapital, 0.00005, "B-text de");
near(sv("+21,77"), T.prognosTillvaxt*100, 0.005, "B-text prognos");
near(sv("−32,9".replace("−","-")), T.resultatCAGR5ar*100, 0.05, "B-text resCAGR");
near(sv("+25,5"), T.omsattningTillvaxtTTM*100, 0.05, "B-text ttm");

// ---------- C. MEDIANER/RANG LIVE (tillväxt-grenen n=19 + universumet 328) ----------
const gren = uni.filter(p => p.bransch === "tillvaxt");
function median(a) { const v = a.filter(Number.isFinite).sort((x,y)=>x-y); if (!v.length) return null; const m = Math.floor(v.length/2); return v.length%2 ? v[m] : (v[m-1]+v[m])/2; }
sant(gren.length === 19, "C0 tillväxt n=19", String(gren.length));
const textMedian = { pe:"46,7", pb:"6,39", evEbit:"30,8", peg:"1,58", fcfY:"1,02", roe:"12,9", roic:"12,16", brutto:"47,75", ebit:"12,13", netto:"5,48", de:"0,1775", ttm:"+25,5" };
const falt = {
  pe: gren.map(p=>p.vardering?.pe), pb: gren.map(p=>p.vardering?.pb),
  evEbit: gren.map(p=>p.vardering?.evEbit), peg: gren.map(p=>p.vardering?.peg),
  fcfY: gren.map(p=>p.vardering?.fcfYield), roe: gren.map(p=>p.lonksamhet?.roe),
  roic: gren.map(p=>p.lonksamhet?.roic), brutto: gren.map(p=>p.lonksamhet?.bruttoMarginal),
  ebit: gren.map(p=>p.lonksamhet?.ebitMarginal), netto: gren.map(p=>p.lonksamhet?.nettoMarginal),
  de: gren.map(p=>p.stabilitet?.skuldEgenkapital), ttm: gren.map(p=>p.tillvaxt?.omsattningTillvaxtTTM),
};
const procentFalt = new Set(["fcfY","roe","roic","brutto","ebit","netto","ttm"]);
for (const [k, arr] of Object.entries(falt)) {
  let m = median(arr.filter(x=>x!=null));
  if (procentFalt.has(k)) m = m*100;
  near(m, sv(textMedian[k].replace("+","")), Math.max(0.05, Math.abs(sv(textMedian[k].replace("+","")))*0.004), `C-median ${k}`);
}
// TTM exakt på medianen
sant(V && T.omsattningTillvaxtTTM === median(falt.ttm.filter(x=>x!=null)), "C ttm exakt median");
// Rangpåståenden i tabellen
const rangKontroll = [
  ["pe", p=>p.vardering?.pe, 2, 14, false],        // näst högst av 14
  ["pb", p=>p.vardering?.pb, 4, 18, false],        // 4:e högst av 18
  ["evEbit", p=>p.vardering?.evEbit, 1, 14, false], // högst av 14
  ["peg", p=>p.vardering?.peg, 2, 12, false],      // 2:a högst av 12
  ["fcfY", p=>p.vardering?.fcfYield, 5, 18, true], // 5:e lägst av 18
  ["roe", p=>p.lonksamhet?.roe, 6, 18, true],      // 6:e lägst av 18
  ["roic", p=>p.lonksamhet?.roic, 5, 18, true],    // 5:e lägst av 18
  ["brutto", p=>p.lonksamhet?.bruttoMarginal, 3, 19, true],  // 3:e lägst av 19
  ["ebit", p=>p.lonksamhet?.ebitMarginal, 6, 19, true],      // 6:e lägst av 19
  ["netto", p=>p.lonksamhet?.nettoMarginal, 8, 19, true],    // 8:e lägst av 19
  ["de", p=>p.stabilitet?.skuldEgenkapital, 9, 18, false],   // 9:e högst av 18
];
for (const [k, fn, vantanOrd, vantanN, lagst] of rangKontroll) {
  const vals = gren.map(p=>fn(p)).filter(x=>x!=null&&Number.isFinite(x));
  const v = fn(tsla);
  const n = vals.length;
  const antalHogre = vals.filter(x=>x>v).length, antalLagre = vals.filter(x=>x<v).length;
  const ord = lagst ? antalLagre+1 : antalHogre+1;
  sant(antalHogre+antalLagre+1 === vantanN, `C-rang ${k} n`, `${antalHogre+antalLagre+1} ≠ ${vantanN}`);
  sant(ord === vantanOrd, `C-rang ${k}`, `${lagst?"lägst":"högst"} pos ${ord} ≠ ${vantanOrd}`);
}
// Universumspåståenden: P/E näst högst av 328, EV/EBIT högst av 328
const peAll = uni.map(p=>p.vardering?.pe).filter(x=>x!=null&&Number.isFinite(x));
sant(peAll.length === 315, "C universum P/E-bärande n=315", String(peAll.length));
sant(peAll.filter(x=>x>V.pe).length === 1, "C P/E näst högst i universumet", String(peAll.filter(x=>x>V.pe).length));
const evAll = uni.map(p=>p.vardering?.evEbit).filter(x=>x!=null&&Number.isFinite(x));
sant(evAll.length === 297, "C universum EV/EBIT-bärande n=297", String(evAll.length));
sant(evAll.filter(x=>x>V.evEbit).length === 0, "C EV/EBIT högst i universumet", String(evAll.filter(x=>x>V.evEbit).length));

// ---------- D. ARITMETIK (oberoende omräknad) ----------
near(0.39+0.23+0.13+0.32, 1.07, 1e-9, "D1 EPS-kedja");
near(357.01/333.654, 1.07, 0.00005, "D2 P/E-fältets implicita EPS");
near(28100+24900+22400+28240, 103640, 1e-9, "D3 TTM intäkt");
near(1370+800+477+1100, 3747, 1e-9, "D4 TTM netto");
near(1410.028/357.01*1000, 3950, 1.0, "D5 aktiebas mcap-världen");
near(3747/1.07, 3502, 1.0, "D6 aktiebas EPS-världen");
near((1410.028/357.01*1000)/(3747/1.07)-1, 0.128, 0.002, "D7 aktiebas-gap 12,8 %");
near(16.231/0.0467, 347.6, 0.05, "D8 P/B÷ROE");
near((16.231/0.0467)/333.654-1, 0.042, 0.002, "D9 identitetsgap 4,2 %");
near(19335+22413+28100+24900, 94748, 1e-9, "D10 FY25-oms kedja");
near(Math.abs(94748/94827-1)*100, 0.1, 0.026, "D11 FY-oms avvikelse 0,1 %");
near(409+1158+1370+800, 3737, 1e-9, "D12 FY25-netto kedja");
near(Math.abs(3737/3794-1)*100, 1.5, 0.05, "D13 FY-netto avvikelse 1,5 %");
near((3794/12556-1)*100, -69.8, 0.05, "D14 resultatfall 2022→2025");
near((28240/22413-1)*100, 26.0, 0.05, "D15 Q2-26 y/y");
near((22400/19335-1)*100, 16, 0.2, "D16 Q1-26 y/y");
near((464000/497099-1)*100, -6.7, 0.05, "D17 leveransväntan y/y");
near(20520/28240*100, 72.7, 0.05, "D18 fordonsandel");
near(20520e6/480126, 42700, 60, "D19 intäkt per fordon");
near(333.654/21.77, 15.3, 0.05, "D20 PEG konvention");
near(333.654/25.5, 13.1, 0.05, "D21 PEG TTM");
near(357.01/1.07, 333.7, 0.1, "D22 rullande P/E idag");
near(357.01/(0.68+0.78), 245, 0.5, "D23 fördubbling→P/E 245");
near(357.01/167-0.68, 1.46, 0.005, "D24 halvering kräver 1,46");
near(1.46/0.39, 3.7, 0.05, "D25 3,7× kedjetoppen");
near(28000*0.01, 280, 1, "D26 marginalpunkt 280 M");
near(28000*0.01/3500, 0.08, 0.005, "D27 marginalpunkt EPS");
near(28000*0.03/3500, 0.24, 0.005, "D28 marginalspann EPS");
near(4000*0.045/3500, 0.05, 0.005, "D29 intäktsspann EPS");
near(28000*0.03/3500/(4000*0.045/3500), 4.7, 0.1, "D30 marginal/intäkt-vikt");
// Brytpunkter
for (const [peM, epsV, yyV] of [[334,0.39,-0.3],[300,0.51,30.8],[250,0.75,91.8],[200,1.11,183.3]]) {
  const epsBehov = 357.01/peM - 1.07 + 0.39;
  near(epsBehov, epsV, 0.01, `D31 bryt P/E ${peM}`);
  near((epsBehov/0.39-1)*100, yyV, 0.15, `D32 bryt y/y P/E ${peM}`);
}
// Scenarioruta 3×3
const pris = 357.01, aktier = 3500, ttm = 1.07, q325 = 0.39;
const nivaer = [26000, 28000, 30000], marger = [0.030, 0.045, 0.060];
const rutaText = [
  ["780 · 0,22 · 395","840 · 0,24 · 388","900 · 0,26 · 381"],
  ["1 170 · 0,33 · 352","1 260 · 0,36 · 343","1 350 · 0,39 · 335"],
  ["1 560 · 0,45 · 317","1 680 · 0,48 · 308","1 800 · 0,51 · 299"],
];
let cell = 0;
for (const [rI, m] of marger.entries()) for (const [cI, n] of nivaer.entries()) {
  const netto = n*m, eps = netto/aktier, roll = ttm-q325+eps, pe = pris/roll;
  const [tN, tE, tP] = rutaText[rI][cI].split(" · ").map(x => sv(x));
  near(netto, tN, 1.0, `D33 ruta r${rI}c${cI} netto`);
  near(eps, tE, 0.005, `D34 ruta r${rI}c${cI} EPS`);
  near(pe, tP, 0.6, `D35 ruta r${rI}c${cI} P/E`);
  sant(bodyFlat.replace(/ /g, "").includes(rutaText[rI][cI].replace(/ /g, "")), `D36 ruta text r${rI}c${cI}`, rutaText[rI][cI]);
  cell += 3;
}
sant(cell === 27, "D37 rutan 27 tal", String(cell));
near(Math.min(...rutaText.flat().map(x=>sv(x.split(" · ")[2]))), 299, 0.6, "D38 rutans lägsta P/E");
near(Math.max(...rutaText.flat().map(x=>sv(x.split(" · ")[2]))), 395, 0.6, "D39 rutans högsta P/E");

// ---------- E. KVARTALSPARITET (sökverifierad primärinsamling 2026-09-30) ----------
const tal = ["28 100","1 370","24 900","800","22 400","477","941","4,2","21,1","358 023","8,8","28 240","1 100","4 350","20 520","16,9","480 126","13,5","497 099","464 000","94 800","3 800","100","1,4","26","16","12","37","46","3"];
for (const t of tal) sant(bodyFlat.includes(t) || body.includes(t), `E tal ${t} i text`);
for (const e of ["0,39","0,23","0,13","0,32","0,50","0,33","1,07"]) sant(body.includes(e), `E EPS ${e} i text`);
sant(body.includes("103 640"), "E TTM-summa i text");
sant(body.includes("497 099 → 358 023 → 480 126") || (body.includes("497 099") && body.includes("358 023") && body.includes("480 126")), "E leveranskedjan");
sant(body.includes("3 950") && body.includes("3 502"), "E aktiebas-världarna i text");
sant(body.includes("12,8"), "E aktiebas-gap i text");

// ---------- F. JURIDIK ----------
const lagrum = allt.match(/(\d{4}:\d{3,4})/g) || [];
sant(lagrum.filter(x => x !== "2007:528").length === 0, "F1 exakt ett lagrumsnamn", String(lagrum));
sant((allt.match(/2007:528/g) || []).length >= 1 && /2 kap 5 §/.test(allt), "F2 lagen 2007:528 2 kap 5 §");
const nekande = /inte en rekommendation att köpa|Inga köp-, sälj- eller behållningsrekommendationer/i;
sant(nekande.test(allt), "F3 negerad räd-fras finns");
const radaTräffar = [...allt.matchAll(/[a-zåäö]*(?:köp|sälj|behåll)[a-zåäö-]*/gi)].map(m => m[0]);
const otillatna = radaTräffar.filter(w => !/^(köpa|sälja|behålla|köp-|sälj-|behållnings-|behållningsrekommendationer|köpen|insiderköp|insiderköpet|insiderköpen|återköp|återköpet|återköpen|återköpens|återköpens)$/i.test(w));
sant(otillatna.length === 0, "F4 rådverb only standard", String(otillatna));
sant(/Publicering av utkastet är kundens beslut \(R2\)\.$/.test(body.trim()), "F5 disclaimer-sista-rad R2");
sant(/utbildning i metod/i.test(allt), "F6 utbildningsram");

// ---------- G. SPRÅK ----------
sant(!/ {2}/.test(body.replace(/\n/g, "")), "G1 inga dubbelmellanslag");
const cjk = allt.match(/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g) || [];
sant(cjk.length === 0, "G2 inga CJK-tecken", String(cjk.slice(0,5)));
for (const bad of ["quartal","utfåll","question","goes","båta","MercadoLibra","nya banans","banans"]) sant(!allt.includes(bad), `G3 restfelfri ${bad}`);
sant(!/911/.test(allt), "G4 inga 911-referenser");

// ---------- H. ORD + READINGMINUTES ----------
const ord = body.replace(/[#*|\[\]()`>]/g, " ").split(/\s+/).filter(w => /[a-zA-ZåäöÅÄÖ0-9]/.test(w)).length;
const rmVantan = Math.round(ord/600);
sant(paket.readingMinutes === rmVantan, "H1 readingMinutes", `${paket.readingMinutes} mot ${rmVantan} (ord ${ord})`);
sant(ord >= 2400 && ord <= 3600, "H2 ordfönster", String(ord));
sant(paket.title.length >= 150 && paket.title.length <= 500, "H3 titellängd", String(paket.title.length));
sant(paket.description.length >= 400 && paket.description.length <= 1200, "H4 description-längd", String(paket.description.length));

// ---------- I. LÄNKAR ----------
const interna = [...body.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]);
const aspekter = interna.filter(u => u.startsWith("/dataset/tillvaxt/"));
sant(aspekter.length >= 13, "I1 aspektlänkar ≥ 13", String(aspekter.length));
const slugSet = new Set(aspekter.map(u => u.replace("/dataset/tillvaxt/", "")));
for (const a of ["pe","pb","ev-ebit","peg","fcf-avkastning","roe","roic","brutto-marginal","netto-marginal","skuldsattning","universumjamforelse","omsattningstillvaxt-ttm","prognos-tillvaxt"])
  sant(slugSet.has(a), `I2 aspekt ${a}`);
for (const u of ["/kurser", "/transparens", "/kallor"]) sant(interna.some(x => x === u), `I3 ${u}`);
const externa = [...body.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map(m => m[1]);
sant(externa.length >= 3, "I4 externa länkar ≥ 3", String(externa.length));
sant(externa.every(u => /ir\.tesla\.com|assets-ir\.tesla\.com|wallstreethorizon\.com|cnbc\.com/.test(u)), "I5 externa domäner vita", String(externa));
if (process.argv.includes("--http")) {
  const { execFileSync } = await import("node:child_process");
  let n200 = 0, ndoda = 0;
  for (const u of new Set([...interna])) {
    try {
      execFileSync("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "4", `http://localhost:3000${u}`], { timeout: 6000 });
      n200++;
    } catch { ndoda++; varna("I-http", u); }
  }
  console.log(`   HTTP: ${n200} OK, ${ndoda} döda`);
}

// ---------- DOM ----------
console.log(`\nKVD sa-laser-du-tesla-q3-2026 — ${PASS} PASS · ${FEL} FEL · ${VARN} VARNINGAR · ord ${ord}`);
if (fel.length) { console.log("FEL:"); for (const f of fel) console.log("  ✗ " + f); }
if (varn.length) { console.log("VARNINGAR:"); for (const v of varn) console.log("  ! " + v); }
console.log(FEL === 0 ? "DOM: GRÖN" : "DOM: RÖD");
process.exit(FEL === 0 ? 0 : 1);
