// _s4u1-rwe-kvd.mjs — KVD för sa-laser-du-rwe-q3-2026.json (kvartalsrapportserien)
// Paritet mot bolagsunivers.json + oberoende omräkning av all aritmetik i texten
// + juridikgrind + struktur + live-mapp-kontroll. 0 FEL 0 VARNING krävs.
import { readFileSync, existsSync } from "node:fs";

const PAKET = "/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-rwe-q3-2026.json";
const LIVE = "/home/ak1a/AK1/data/blogg/kvartal/2026-q3/sa-laser-du-rwe-q3-2026.json";
const UNIV = "/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json";

let pass = 0, fel = 0, varn = 0;
const OK = (namn) => { pass++; };
const FEL = (namn) => { fel++; console.log("FEL: " + namn); };
const VARN = (namn) => { varn++; console.log("VARNING: " + namn); };
const eq = (namn, a, b, tol = 0.05) => (Math.abs(a - b) <= tol * Math.max(Math.abs(b), 1e-9) ? OK(namn) : FEL(namn + ": " + a + " != " + b));
const eq1 = (namn, a, b) => (Math.abs(a - b) < 0.06 ? OK(namn) : FEL(namn + ": " + a + " != " + b)); // avrundat till 1 decimal
const has = (namn, s, sub) => (s.includes(sub) ? OK(namn) : FEL(namn + ": saknar '" + sub + "'"));

const j = JSON.parse(readFileSync(PAKET, "utf8"));
const U = JSON.parse(readFileSync(UNIV, "utf8"));
const r = U.find((x) => x.ticker === "RWE.DE");
const body = j.body, allt = body + " " + j.title + " " + j.description;

// ===== STRUKTUR =====
has("slug-paritet", j.slug, "sa-laser-du-rwe-q3-2026");
eq("publishedAt = rappdag", Date.parse(j.publishedAt), Date.parse("2026-11-11"), 0);
const w = body.split(/\s+/).filter(Boolean).length;
eq("readingMinutes = round(ord/600)", j.readingMinutes, Math.round(w / 600), 0);
if (w >= 2400 && w <= 3800) OK("ordmängd i seriens spann (" + w + ")"); else FEL("ordmängd utanför spann: " + w);
if (!existsSync(LIVE)) OK("live-mappen orörd (ingen fil i data/blogg/)"); else FEL("fil finns i live-mappen!");
has("author", j.author, "AK1A Research Lab");
has("pillar", j.pillar, "Institutionell metodik");
has("description-juridik", j.description, "inte råd");
has("description-rappdag", j.description, "11 november");

// ===== KÄLLTALSPARITET mot RWE.DE-posten (2026-09-03) =====
const f = [
  ["pris", "57,88", r.pris, 1], ["mcap", "45,146", r.marknadsKapitalMdr, 1],
  ["P/E", "12,949", r.vardering.pe, 1], ["P/B", "1,038", r.vardering.pb, 1],
  ["EV/EBIT", "81,472", r.vardering.evEbit, 1], ["PEG", "35,4", r.vardering.peg, 1],
  ["FCFy", "−24,61", r.vardering.fcfYield, 100], ["ROE", "8,55", r.lonksamhet.roe, 100],
  ["ROIC", "1,1", r.lonksamhet.roic, 100], ["brutto", "39,01", r.lonksamhet.bruttoMarginal, 100],
  ["EBIT-marg", "4,64", r.lonksamhet.ebitMarginal, 100], ["netto-marg", "20,25", r.lonksamhet.nettoMarginal, 100],
  ["fcfMarg", "−69,58", r.lonksamhet.fcfMarginal, 100], ["skuld/EK", "0,5037", r.stabilitet.skuldEgenkapital, 1],
  ["omsCAGR", "−22,84", r.tillvaxt.omsattningCAGR5ar, 100], ["resCAGR", "4,84", r.tillvaxt.resultatCAGR5ar, 100],
  ["prognos", "11,93", r.tillvaxt.prognosTillvaxt, 100], ["TTM", "−9,1", r.tillvaxt.omsattningTillvaxtTTM, 100],
];
for (const [namn, str, val, skala] of f) {
  const tal = parseFloat(str.replace("−", "-").replace(",", "."));
  eq("fält " + namn, tal, val * skala, 0.001);
  has("text bär " + namn, allt, str);
}
for (const [i, ar] of r.serier.ar.entries()) {
  has("serieår " + ar, allt, ar);
  has("serie-oms " + ar, allt, (r.serier.omsattning[i] / 1e9).toFixed(3).replace(".", ","));
  has("serie-res " + ar, allt, (r.serier.resultat[i] / 1e9).toFixed(3).replace(".", ","));
}
has("källa Yahoo+MarketStack", allt, "MarketStack");
has("källa hämtdatum", allt, "2026-09-03");
has("kalender-rappdag 11 november", allt, "11 november");
has("interim statement-form", allt, "interim statement");
has("H1 EBITDA 3,0", allt, "3,0 miljarder");
has("H1 fjol 2,1", allt, "2,1 miljarder");
has("H1 netto 1,3", allt, "1,3 miljarder");
has("H1 VPA 1,77", allt, "1,77");
has("guidning EBITDA", allt, "5,75–6,35");
has("guidning netto", allt, "1 950–2 450");
has("guidning VPA", allt, "2,60–3,30");
has("vatten 134/16", allt, "134 miljoner");
has("utdelning 1,32", allt, "1,32 euro");
has("hävstång 3,0–3,5", allt, "3,0–3,5");
has("AGM 12 mars", allt, "12 mars 2027");
has("MarketScreener-divergens", allt, "10 november");
has("energigrenens femte", allt, "energigrenens femte");

// ===== ARITMETIK (oberoende omräkning) =====
const oms = r.serier.omsattning.map((x) => x / 1e9), res = r.serier.resultat.map((x) => x / 1e9);
eq("steg oms 23", (oms[1] / oms[0] - 1) * 100, -25.54, 0.002); has("text steg 23", allt, "−25,5");
eq("steg oms 24", (oms[2] / oms[1] - 1) * 100, -15.20, 0.002); has("text steg 24", allt, "−15,2");
eq("steg oms 25", (oms[3] / oms[2] - 1) * 100, -27.23, 0.002); has("text steg 25", allt, "−27,2");
eq("steg res 23", (res[1] / res[0] - 1) * 100, -46.63, 0.002);
eq("steg res 24", (res[2] / res[1] - 1) * 100, 254.14, 0.002);
eq("steg res 25", (res[3] / res[2] - 1) * 100, -39.03, 0.002);
eq("omsCAGR", (Math.pow(oms[3] / oms[0], 1 / 3) - 1) * 100, r.tillvaxt.omsattningCAGR5ar * 100, 0.001);
eq("resCAGR", (Math.pow(res[3] / res[0], 1 / 3) - 1) * 100, r.tillvaxt.resultatCAGR5ar * 100, 0.001);
eq("intäkt topp→2025", (oms[3] / oms[0] - 1) * 100, -54.1, 0.002); has("text −54,1", allt, "−54,1");
eq1("res topp→2025", (res[3] / res[0] - 1) * 100, 15.2);
eq("2024-topp över 2025", (res[2] / res[3] - 1) * 100, 64.0, 0.002);
eq("seriemarginal 2022", (res[0] / oms[0]) * 100, 7.08, 0.002);
eq("seriemarginal 2025", (res[3] / oms[3]) * 100, 17.76, 0.002);

// TTM-trippeln
const ttmOms = oms[3] * (1 + r.tillvaxt.omsattningTillvaxtTTM);
eq("TTM-oms", ttmOms, 16.024, 0.001); has("text TTM-oms", allt, "16,024");
const v1 = r.marknadsKapitalMdr / r.vardering.pe, v2 = (r.lonksamhet.nettoMarginal * ttmOms), v3 = res[3];
eq("TTM väg1", v1, 3.486, 0.001); has("text väg1", allt, "3,486");
eq("TTM väg2", v2, 3.245, 0.001); has("text väg2", allt, "3,245");
eq("TTM väg3", v3, 3.131, 0.001); has("text väg3", allt, "3,131");
eq("gap väg2/väg1", (v2 / v1 - 1) * 100, -6.9, 0.01);
eq("gap väg3/väg1", (v3 / v1 - 1) * 100, -10.2, 0.01);

// Identitet
const id = r.vardering.pe / r.vardering.pb;
eq("identitet", id, 12.475, 0.001); has("text identitet", allt, "12,475");
eq("identitetsgap", (id / (r.lonksamhet.roe * 100) - 1) * 100, 45.9, 0.002); has("text gap +45,9", allt, "+45,9");

// Trappan
eq("inversion pp", (r.lonksamhet.nettoMarginal - r.lonksamhet.ebitMarginal) * 100, 15.61, 0.001); has("text inversion", allt, "15,61");
eq("netto/EBIT-kvot", r.lonksamhet.nettoMarginal / r.lonksamhet.ebitMarginal, 4.36, 0.01); has("text fyra gånger", allt, "fyra gånger");

// EV-kedja
const ek = r.marknadsKapitalMdr / r.vardering.pb, sk = r.stabilitet.skuldEgenkapital * ek, ev = r.marknadsKapitalMdr + sk; // EV = mcap + bruttoskuld (kassa ej separerad i posten)
eq("EK", ek, 43.493, 0.001); has("text EK", allt, "43,493");
eq("skuld", sk, 21.908, 0.001); has("text skuld", allt, "21,908");
eq("EV", ev, 67.054, 0.001); has("text EV", allt, "67,054");
const eA = ev / r.vardering.evEbit, eB = r.lonksamhet.ebitMarginal * ttmOms;
eq("EBIT väg A", eA, 0.823, 0.001); has("text EBIT-A", allt, "0,823");
eq("EBIT väg B", eB, 0.744, 0.001); has("text EBIT-B", allt, "0,744");
eq("EBIT-kvot", eA / eB, 1.107, 0.001); has("text EBIT-kvot", allt, "1,107");
eq("serieekvivalent", ev / res[3], 21.4, 0.005); has("text serieekv.", allt, "21,4");
eq("3,8×", r.vardering.evEbit / (ev / res[3]), 3.8, 0.01); has("text 3,8", allt, "3,8");

// FCF
const f1 = r.vardering.fcfYield * r.marknadsKapitalMdr, f2 = r.lonksamhet.fcfMarginal * ttmOms;
eq("FCF väg1", f1, -11.11, 0.001); has("text FCF1", allt, "−11,11");
eq("FCF väg2", f2, -11.15, 0.001); has("text FCF2", allt, "−11,15");
eq("FCF-kvot", f1 / f2, 0.997, 0.001); has("text FCF-kvot", allt, "0,997");

// PEG + teckengläpp
eq("PEG-konvention", r.vardering.pe / (r.tillvaxt.prognosTillvaxt * 100), 1.085, 0.001); has("text PEG-konv", allt, "1,085");
eq("PEG-fält×", r.vardering.peg / (r.vardering.pe / (r.tillvaxt.prognosTillvaxt * 100)), 32.6, 0.005); has("text 32,6", allt, "32,6");
eq1("teckengläpp", (r.tillvaxt.prognosTillvaxt - r.tillvaxt.omsattningTillvaxtTTM) * 100, 21.0); has("text 21,0 pp", allt, "21,0");

// Aktier, VPA, två världar, utdelning
const aktier = r.marknadsKapitalMdr / r.pris;
eq("aktier", aktier * 1000, 780, 0.005); has("text aktier", allt, "780");
eq("VPA-TTM", r.pris / r.vardering.pe, 4.47, 0.001); has("text VPA-TTM", allt, "4,47");
eq1("VPA-2025", res[3] / aktier, 4.01); has("text VPA-2025", allt, "4,01");
eq1("justerad P/E", r.pris / 2.95, 19.6); has("text just.P/E", allt, "19,6");
eq("gap två världar", ((r.pris / 2.95) / r.vardering.pe - 1) * 100, 51.5, 0.002); has("text 51,5", allt, "51,5");
eq("direktavkastning", (1.32 / r.pris) * 100, 2.28, 0.002); has("text 2,28 %", allt, "2,28");
eq("utdelningsandel", (1.32 / 2.95) * 100, 44.7, 0.002); has("text 44,7", allt, "44,7");
eq("baklänges 40 %", 1.32 / 0.4, 3.30, 0.001); has("text baklänges", allt, "3,30");
eq("H1-förhållande", 3.0 / 2.1, 1.429, 0.005);
eq("H2-ribba", 2.95 - 1.77, 1.18, 0.001); has("text 1,18", allt, "1,18");

// Scenarioruta
const marg = [0.1476, 0.1776, 0.2076], rut = marg.map((m) => m * oms[3]);
eq("cell 1", rut[0], 2.602, 0.001); has("text cell1", allt, "2,602");
eq("cell 2", rut[1], 3.131, 0.001);
eq("cell 3", rut[2], 3.660, 0.001); has("text cell3", allt, "3,660");
eq1("cell-steg −", (rut[0] / rut[1] - 1) * 100, -16.9); eq1("cell-steg +", (rut[2] / rut[1] - 1) * 100, 16.9); has("text ±16,9", allt, "±16,9");
eq1("1 pp i kronor", 0.01 * oms[3], 0.176); has("text 0,176", allt, "0,176");
eq1("1 pp i andel", (0.01 * oms[3] / res[3]) * 100, 5.6); has("text 5,6 %", allt, "5,6");
for (const [mult, vals] of [[12.949, [33.7, 40.5, 47.4]], [15.0, [39.0, 47.0, 54.9]], [17.015, [44.3, 53.3, 62.3]]]) {
  for (let i = 0; i < 3; i++) eq("ruta " + mult + "/" + i, rut[i] * mult, vals[i], 0.003);
}
eq("marginalspann", (rut[2] - rut[0]) * 12.949, 13.7, 0.005); has("text 13,7", allt, "13,7");
eq1("multiplresa", (17.015 - 12.949) * rut[1], 12.7); has("text 12,7", allt, "12,7");
eq("per pp vid 12,949", 0.176 * 12.949, 2.28, 0.002); 
eq("per pp vid 17,015", 0.176 * 17.015, 3.0, 0.005);

// ===== MEDIANER OCH RANG (219-filen) =====
const E = U.filter((x) => x.bransch === "energi");
const med = (get) => { const v = E.map(get).filter((x) => typeof x === "number").sort((a, b) => a - b); const n = v.length; return n % 2 ? v[(n - 1) / 2] : (v[n / 2 - 1] + v[n / 2]) / 2; };
const rang = (get, val) => { const v = E.map(get).filter((x) => typeof x === "number").sort((a, b) => a - b); let p = 0; for (const x of v) if (x < val) p++; return p + 1; };
const nE = (get) => E.map(get).filter((x) => typeof x === "number").length;
eq("median P/E", med((x) => x.vardering?.pe), 17.015, 0.001); has("text medP/E", allt, "17,015");
eq("median P/B", med((x) => x.vardering?.pb), 2.349, 0.001); has("text medP/B", allt, "2,349");
eq("median EV/EBIT", med((x) => x.vardering?.evEbit), 13.475, 0.001); has("text medEV", allt, "13,475");
eq("median ROE", med((x) => x.lonksamhet?.roe), 0.135, 0.004); has("text medROE", allt, "13,5");
eq("median brutto", med((x) => x.lonksamhet?.bruttoMarginal), 0.398, 0.003); has("text medBrutto", allt, "39,8");
eq("median EBIT", med((x) => x.lonksamhet?.ebitMarginal), 0.181, 0.006); has("text medEBIT", allt, "18,1");
eq("median netto", med((x) => x.lonksamhet?.nettoMarginal), 0.091, 0.005); has("text medNetto", allt, "9,1");
eq("median skuld", med((x) => x.stabilitet?.skuldEgenkapital), 0.532, 0.002); has("text medSkuld", allt, "0,532");
eq("median prognos", med((x) => x.tillvaxt?.prognosTillvaxt), 0.070, 0.02); has("text medProg", allt, "7,0");
eq("rang P/E", rang((x) => x.vardering?.pe, r.vardering.pe), 7, 0); has("text rangP/E", allt, "sjunde lägsta");
eq("rang P/B", rang((x) => x.vardering?.pb, r.vardering.pb), 1, 0); has("text rangP/B", allt, "allra lägsta");
eq("rang EV/EBIT", rang((x) => x.vardering?.evEbit, r.vardering.evEbit), 20, 0); has("text rangEV", allt, "högsta");
eq("rang ROE", rang((x) => x.lonksamhet?.roe, r.lonksamhet.roe), 2, 0); has("text rangROE", allt, "näst lägst");
eq("rang EBIT", rang((x) => x.lonksamhet?.ebitMarginal, r.lonksamhet.ebitMarginal), 1, 0); has("text rangEBIT", allt, "lägsta av 20");
eq("rang netto", rang((x) => x.lonksamhet?.nettoMarginal, r.lonksamhet.nettoMarginal), 18, 0); has("text rangNetto", allt, "tredje högsta");
eq("rang skuld", rang((x) => x.stabilitet?.skuldEgenkapital, r.stabilitet.skuldEgenkapital), 10, 0);
eq("gren-n P/E", nE((x) => x.vardering?.pe), 19, 0); has("text n=19", allt, "n=19");
eq("gren-n total", E.length, 20, 0); has("text n=20", allt, "n=20");
has("text 219", allt, "219");
const medU = (get) => { const v = U.map(get).filter((x) => typeof x === "number").sort((a, b) => a - b); const n = v.length; return n % 2 ? v[(n - 1) / 2] : (v[n / 2 - 1] + v[n / 2]) / 2; };
eq("univ P/E", medU((x) => x.vardering?.pe), 20.690, 0.001); has("text univP/E", allt, "20,690");
eq("univ P/B", medU((x) => x.vardering?.pb), 2.760, 0.001); has("text univP/B", allt, "2,760");
eq("univ prognos", medU((x) => x.tillvaxt?.prognosTillvaxt), 0.136, 0.005); has("text univProg", allt, "13,6");

// ===== JURIDIKGRIND (2007:528 — utbildning, aldrig råd) =====
has("lagrum exakt", allt, "2007:528");
const lagrum = (allt.match(/2007:528/g) || []).length;
eq("exakt ett lagrum", lagrum, 1, 0);
has("utbildningsformulering", allt, "utbildning i metod");
has("disclaimer-ordsätt", allt, "inte investeringsrådgivning");
has("R2-notis publicering", allt, "publiceringen av detta paket är kundens beslut");
const rad = allt.match(/(rekommenderar att köp|rekommenderar köp|rekommenderar att sälj|vi råder (dig )?att (köpa|sälja)|bör köpa|bör sälja|köp denna|sälj dina)/gi) || [];
eq("rådmönster utanför disclaimer", rad.length, 0, 0);
const lagbland = allt.match(/1992:33|2004:397|konsumentköp|distansavtal/i) || [];
eq("lagrumsblandning", lagbland.length, 0, 0);

// ===== LÄCKOR OCH SKRÄPORD =====
for (const patr of ["Formatsitem", "seLEASErn", "mellanhands", "operating leverage", "huggen"]) {
  if (allt.includes(patr)) FEL("läcka: " + patr); else OK("ingen läcka: " + patr);
}
const strongOk = (body.match(/strong/g) || []).every((m) => true); // räknas nedan
const strongUtanforTitel = (body.replace(/\*RWE delivers strong first-half results\*/g, "").match(/strong/g) || []).length;
eq("strong endast i presstitel", strongUtanforTitel, 0, 0);

console.log("\n=== KVD sa-laser-du-rwe-q3-2026: " + pass + " PASS, " + fel + " FEL, " + varn + " VARNINGAR (ord " + w + ", rm " + j.readingMinutes + ") ===");
process.exit(fel > 0 ? 1 : 0);
