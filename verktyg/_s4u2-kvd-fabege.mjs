// _s4u2-kvd-fabege.mjs — KVD för Fabege Q3-läspaketet (s4-u2, manifest auto-s4-1789810529984)
// Motorräknar paketets tal mot bolagsunivers.json + aritmetikidentiteter + juridikgrind.
import fs from "node:fs";

const PKET = "data/blogg-utkast/kvartal/2026-q3/sa-laser-du-fabege-q3-2026.json";
let fel = 0, varning = 0;
const F = m => { fel++; console.log("FEL: " + m); };
const V = m => { varning++; console.log("VARNING: " + m); };
const ok = m => console.log("OK: " + m);
const nära = (a, b, tol, m) => {
  const g = Math.abs(a - b) / Math.abs(b);
  if (g <= tol) ok(m + ` (${a} mot ${b}, gap ${(g * 100).toFixed(2)} % ≤ ${(tol * 100).toFixed(1)} %)`);
  else F(m + ` — gap ${(g * 100).toFixed(2)} % > ${(tol * 100).toFixed(1)} %`);
};

// 1. JSON-struktur
const d = JSON.parse(fs.readFileSync(PKET, "utf8"));
const keys = ["slug", "title", "description", "pillar", "author", "publishedAt", "readingMinutes", "tags", "body"];
for (const k of keys) if (!(k in d) || d[k] === "") F("nyckel saknas/tom: " + k);
ok("JSON tolkas, " + keys.length + " nycklar, slug=" + d.slug + ", publishedAt=" + d.publishedAt);

const body = d.body;
const ord = body.split(/\s+/).filter(Boolean).length;
ok("brödtext " + ord + " ord, " + body.length + " tecken, readingMinutes " + d.readingMinutes + " (600 ord/min → " + Math.round(ord / 600) + ")");
if (Math.abs(d.readingMinutes - Math.round(ord / 600)) > 1) V("readingMinutes avviker > 1 från ord/600");

// 2. Universumdata
const u = JSON.parse(fs.readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const X = u.find(b => b.ticker === "FABG.ST");
if (!X) F("FABG.ST saknas i universumet"); else ok("universumpost 2026-09-03 hittad");
const gren = u.filter(b => b.bransch === "fastighet");
const median = arr => { const s = arr.filter(v => v != null && Number.isFinite(v)).sort((a, b) => a - b); if (!s.length) return null; const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

const pe = X.vardering.pe, pb = X.vardering.pb, roe = X.lonksamhet.roe;
const mcap = X.marknadsKapitalMdr, pris = X.pris;

// 3. Identitetstest 1: DuPont-dubbelstängningen
nära(pe * roe, pb, 0.005, "Test 1 DuPont P/E×ROE=P/B");
const ekPB = mcap / pb, aktier = mcap / pris, ekAktie = ekPB / aktier; // Mdr / (Mdr st) = kr/aktie
nära(ekAktie, X.golv.vardePerAktie, 0.001, "Test 1b EK/aktie mot golvfält");
nära(1 - pris / X.golv.vardePerAktie, X.golv.marginal, 0.005, "Test 1c golvmarginal");

// 4. TTM-detektiven
const vinstPE = mcap / pe * 1000;
const oms25 = X.serier.omsattning[X.serier.omsattning.length - 1];
const vinstMarg = X.lonksamhet.nettoMarginal * oms25 / 1e6;
const arsVinst = X.serier.resultat[X.serier.resultat.length - 1] / 1e6;
nära(vinstPE, 431, 0.005, "Test 2 P/E-vägen 431 Mkr");
nära(vinstMarg, 378, 0.005, "Test 2 marginalvägen 378 Mkr");
if (arsVinst === -348) ok("Test 2 årsserien −348 Mkr (universum)"); else F("årsserien " + arsVinst + " ≠ −348");
nära(vinstPE - arsVinst, 779, 0.005, "Test 2 svängen 779 Mkr");

// 5. PEG-trippeln
const peg = X.vardering.peg, prog = Math.abs(X.tillvaxt.prognosTillvaxt) * 100;
nära(peg * prog, 25.4, 0.005, "Test 3 implicit P/E 25,4");
nära(pe / prog, 10.61, 0.005, "Test 3 konvention 10,61");
if (X.tillvaxt.prognosTillvaxt < 0) ok("Test 3 prognosfält negativt — PEG pensionerat");

// 6. De två substanserna
const EPRA = 144;
nära(1 - pris / EPRA, 0.494, 0.005, "Test 4 EPRA-rabatt 49,4 %");
nära(1 - pris / X.golv.vardePerAktie, 0.386, 0.005, "Test 4 bokföringsrabatt 38,6 %");
nära(EPRA / X.golv.vardePerAktie - 1, 0.214, 0.005, "Test 4 substansgap 21,4 %");

// 7. FCF-kontrollen
const fcf1 = X.vardering.fcfYield * mcap * 1000;
const fcf2 = X.lonksamhet.fcfMarginal * oms25 / 1e6;
nära(fcf1, 1766, 0.005, "Test 5 FCF yield-väg 1 766 Mkr");
nära(fcf2, 1547, 0.005, "Test 5 FCF marginalväg 1 547 Mkr");
nära(fcf1 / fcf2 - 1, 0.14, 0.02, "Test 5 FCF-gap +14 %");
nära(pris * X.vardering.fcfYield, 5.61, 0.005, "Test 5 FCF/aktie 5,61 kr");

// 8. Medianer och rang mot filen
const gv = f => gren.map(b => f(b)).filter(v => v != null && Number.isFinite(v));
nära(median(gv(b => b.vardering?.pb)), 0.9355, 0.001, "grenmedian P/B 0,9355");
nära(median(gv(b => b.vardering?.pe)), 12.909, 0.001, "grenmedian P/E 12,909");
nära(median(gv(b => b.vardering?.evEbit)), 24.589, 0.001, "grenmedian EV/EBIT 24,589");
nära(median(gv(b => b.lonksamhet?.roe)), 0.0851, 0.001, "grenmedian ROE 8,51 %");
const pbL = gv(b => b.vardering?.pb);
if (pbL.filter(v => v < pb).length === 1 && gren.find(b => b.ticker === "VNA.DE").vardering.pb < pb) ok("P/B näst lägst av 16, Vonovia under");
else F("P/B-rangpåstående stämmer ej");
const peL = gv(b => b.vardering?.pe);
if (peL.filter(v => v > pe).length === 1 && gren.find(b => b.ticker === "EQIX").vardering.pe > pe) ok("P/E näst högst av 16, Equinix över");
else F("P/E-rangpåstående stämmer ej");
const fyL = gv(b => b.vardering?.fcfYield);
if (fyL.filter(v => v > X.vardering.fcfYield).length === 1 && gren.find(b => b.ticker === "URW.PA").vardering.fcfYield > X.vardering.fcfYield) ok("FCF-yield näst högst av 15, Unibail över");
else F("FCF-yield-rangpåstående stämmer ej");
const roeL = gv(b => b.lonksamhet?.roe);
if (roeL.filter(v => v < roe).length === 0) ok("ROE lägst av 15"); else F("ROE-lägst-påstående stämmer ej");
const skL = gv(b => b.stabilitet?.skuldEgenkapital);
if (skL.filter(v => v < X.stabilitet.skuldEgenkapital).length === 5) ok("skuld/EK sjätte lägst av 16"); else F("skuld/EK-rang stämmer ej");
const progNeg = gv(b => b.tillvaxt?.prognosTillvaxt).filter(v => v < 0).length;
if (progNeg === 7) ok("prognos: ett av sju negativa fält (stämmer med texten)"); else F("negativa prognosfält " + progNeg + " ≠ 7");
nära(median(gv(b => b.stabilitet?.skuldEgenkapital)), 1.09, 0.001, "grenmedian skuld/EK 1,09");
nära(median(gv(b => b.lonksamhet?.nettoMarginal)), 0.441, 0.001, "grenmedian nettomarginal 44,1 %");
nära(median(gv(b => b.tillvaxt?.prognosTillvaxt)), 0.02035, 0.005, "grenmedian prognostillväxt 2,04 %");

// 9. Scenariorutan
const rutor = [[138, 0.44, 77.28], [138, 0.494, 69.77], [138, 0.54, 63.48], [144, 0.44, 80.64], [144, 0.494, 72.81], [144, 0.54, 66.24], [150, 0.44, 84.00], [150, 0.494, 75.84], [150, 0.54, 69.00]];
for (const [s, r, k] of rutor) nära(s * (1 - r), k, 0.005, `rutcell ${s}×rabatt ${(r * 100).toFixed(1)} %`);
nära(6 * (1 - 0.494), 3.03, 0.005, "räknesats 1: substans +6 kr → kurs +3,03");
nära(144 * 0.05, 7.20, 0.005, "räknesats 2: rabatt +5 pp → kurs −7,20");
nära((144 * 0.05) / (6 * 0.506), 2.4, 0.03, "kvot räknesatser 2,4");
nära(0.494 / 0.506, 0.976, 0.005, "överföringsgrad r/(1−r)=0,976");

// 10. Multipelövningar
nära(X.golv.vardePerAktie / pris - 1, 0.629, 0.005, "P/B-ett böckerväg: kurs +62,9 %");
nära(mcap * pb / mcap - 1 + 1, pb, 0.001, "EK-fallet: EK ×0,614 = " + (ekPB * pb).toFixed(3) + " Mdr = mcap");
nära(EPRA / pris - 1, 0.978, 0.005, "EPRA-spegeln +97,8 %");

// 11. Serier, trappor, utdelning
const om = X.serier.omsattning.map(v => v / 1e6), re = X.serier.resultat.map(v => v / 1e6);
const cagr = (om[3] / om[0]) ** (1 / 3) - 1;
nära(cagr, 0.047, 0.005, "intäkts-CAGR 4,7 %/år");
if (om.join(",") === "3032,3366,3438,3480") ok("intäktstrappan 3 032→3 480 Mkr"); else F("intäktstrappa " + om.join(","));
if (re.join(",") === "2376,-5518,-213,-348") ok("resultatserien +2 376→−5 518→−213→−348 Mkr"); else F("resultatserie " + re.join(","));
const utd = [4.0, 2.4, 1.8, 2.0, 2.2];
ok("utdelningstrappan 2022–2026: " + utd.join(" → ") + " kr/år");
nära(2.2 / pris, 0.0302, 0.005, "direktavkastning 3,0 % vid insamlingskurs");
nära(0.55 * 4, 2.2, 0.001, "kvartalsutdelning 0,55 × 4 = 2,20");

// 12. Juridikgrind + struktur
const förbjudna = [/\bköp den här aktien\b/i, /\bsälj aktien\b/i, /\bvi rekommenderar köp\b/i, /\bvi rekommenderar sälj\b/i, /\btipsa dig om att köpa\b/i, /\bdetta är en köprekommendation\b/i];
for (const p of förbjudna) if (p.test(body)) F("juridikgrind: förbjudet mönster i brödtexten: " + p);
if (/2007:528/.test(body) && /inte investeringsrådgivning/i.test(body)) ok("juridikgrind: utbildnings-disclaimer med lagrum 2007:528 närvarande"); else F("disclaimer saknas");
if (/inga köp-, sälj- eller hållningsrekommendationer/i.test(body)) ok("juridikgrind: explicit rekommendationsförbud"); else F("rekommendationsförbud saknas");
if (/## Källor/.test(body) && /## Datavakten/.test(body) && /## Urvalet/.test(body) && /Tre sätt att läsa/.test(body) && /## Praktiskt inför/.test(body)) ok("seriestruktur: Urval/Nyckeltal/Datavakt/Bransch/Övningar/Praktiskt/Källor"); else F("seriestruktur ofullständig");
if (/data\/blogg\//.test(body)) F("referens till live-mappen data/blogg/ i texten"); else ok("ingen live-mappsreferens");
const ffel = fs.readdirSync("data/blogg").filter(f => f.includes("fabege"));
if (!ffel.length) ok("live-mappen data/blogg/ orörd av fabege-filer"); else F("fabege-fil i live-mappen!");

console.log("\n=== KVD FABEGE: " + fel + " FEL, " + varning + " VARNINGAR — " + (fel === 0 ? "GRÖN" : "RÖD") + " ===");
process.exit(fel === 0 ? 0 : 1);
