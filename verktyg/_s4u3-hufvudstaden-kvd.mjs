// _s4u3-hufvudstaden-kvd.mjs — KVD för HUFV-A Q3-2026-läspaketet (spår 4, s4-u3)
// Oberoende omräkning: läser den färdiga JSON + universumfilen och räknar ALLT från rådata.
// Utgångsläge GRÖNT krävs: 0 FEL, 0 VARNING.
import { readFileSync, existsSync } from "node:fs";

const FIL = "/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-hufvudstaden-q3-2026.json";
const J = JSON.parse(readFileSync(FIL, "utf8"));
const U = JSON.parse(readFileSync("/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json", "utf8"));
const LIST = Array.isArray(U) ? U : (U.bolag || U.universum || Object.values(U).find(Array.isArray));
const B = LIST.find(x => x.ticker === "HUFV-A.ST");

let PASS = 0, FEL = 0, VARN = 0;
const fel = [], varn = [];
const ok = (namn, cond, detalj = "") => { if (cond) PASS++; else { FEL++; fel.push(namn + (detalj ? " — " + detalj : "")); } };
const warn = (namn, detalj = "") => { VARN++; varn.push(namn + (detalj ? " — " + detalj : "")); };

// formatterare: sv-SE med VANLIGT mellanslag (normaliserad fil)
const sv = (x, d = 1) => x.toLocaleString("sv-SE", { minimumFractionDigits: d, maximumFractionDigits: d }).replace(/[\u00a0\u202f]/g, " ");
const pct = (x, d = 2) => (100 * x).toFixed(d).replace(".", ",");
const ALL = J.title + "\n" + J.description + "\n" + J.body;
const har = s => ALL.includes(s);

// ---------- 1. struktur ----------
ok("slug", J.slug === "sa-laser-du-hufvudstaden-q3-2026");
ok("pillar", J.pillar === "Institutionell metodik");
ok("author", J.author === "AK1A Research Lab");
ok("publishedAt = rappdag", J.publishedAt === "2026-11-05");
ok("tags 6", Array.isArray(J.tags) && J.tags.length === 6 && J.tags.includes("kvartalsrapport") && J.tags.includes("EPRA"));
ok("title ej tom + signaturämne", J.title.length > 150 && J.title.includes("Hufvudstadens delårsrapport"));
ok("description längd", J.description.length > 250 && J.description.length < 500);
const ord = J.body.split(/\s+/).filter(Boolean).length;
ok("readingMinutes = round(ord/600)", J.readingMinutes === Math.round(ord / 600), `ord ${ord} rm ${J.readingMinutes}`);
ok("ord 2400–3600", ord >= 2400 && ord <= 3600, `ord ${ord}`);

// ---------- 2. källtalsparitet mot universumposten ----------
const paritet = [
  ["pris", "119,20"], ["mcap", "23,161"], ["P/E", "20,135"], ["P/B", "0,830"], ["EV/EBIT", "21,145"],
  ["PEG", "4,44"], ["FCF-yield", "4,34"], ["ROE", "4,15"], ["ROIC", "4,20"], ["brutto", "82,32"],
  ["EBIT-marg", "50,18"], ["netto", "35,22"], ["FCF-marg", "30,34"], ["skuld/EK", "0,4598"],
  ["prognos", "6,51"], ["oCAGR", "3,77"], ["rCAGR", "5,03"], ["TTM", "1,60"],
  ["golv", "143,53"], ["golv-marginal", "16,95"],
];
for (const [n, s] of paritet) ok("paritet " + n, har(s), "saknar '" + s + "'");
ok("paritet serier oms", ["2 945,6", "2 961,6", "3 179,2", "3 291,8"].every(har));
ok("paritet serier res", ["722,0", "1 927,2", "364,6", "836,6"].every(har));
ok("värdena i filen == värdena i texten", B.pris === 119.2 && B.vardering.pe === 20.135 && B.vardering.pb === 0.83 && B.vardering.evEbit === 21.145 && B.lonksamhet.roe === 0.0415 && B.stabilitet.skuldEgenkapital === 0.4598 && B.golv.vardePerAktie === 143.53 && B.golv.marginal === 0.1695);

// ---------- 3. officiella rapporttal (sökverifierade 2026-09-19) ----------
const rapp = ["1 257", "1 226", "1 642", "850", "634", "619", "815", "810", "422", "623", "607", "415", "393", "940", "503", "121", "1,54", "0,91", "190", "183", "189", "185", "48 344", "14,0", "2,90", "2,80"];
for (const s of rapp) ok("rapporttal " + s, har(s));

// ---------- 4. aritmetik — oberoende omräkning ----------
const pris = B.pris, mcap = B.marknadsKapitalMdr, pe = B.vardering.pe, pb = B.vardering.pb;
const roe = B.lonksamhet.roe, nettoM = B.lonksamhet.nettoMarginal, ebitM = B.lonksamhet.ebitMarginal;
const fcfY = B.vardering.fcfYield, fcfM = B.lonksamhet.fcfMarginal, evE = B.vardering.evEbit;
const skuldEk = B.stabilitet.skuldEgenkapital, golv = B.golv.vardePerAktie;
const oms25 = B.serier.omsattning[3] / 1e6, res25 = B.serier.resultat[3] / 1e6;

const aktier = mcap * 1000 / pris;
const ek = mcap / pb, ekPerAktie = ek * 1000 / aktier;
const idPeRoe = pe * roe, gapId = idPeRoe / pb - 1;
const gapGolv = ekPerAktie / golv - 1;
const golvMarg = 1 - pris / golv, prisGolv = pris / golv;
ok("aktier", har(sv(aktier, 1)) && Math.abs(aktier - 194.3) < 0.05, sv(aktier, 1));
ok("EK implicit", har(sv(ek, 1)) && Math.abs(ek - 27.905) < 0.01);
ok("EK/aktie", har(sv(ekPerAktie, 2)), sv(ekPerAktie, 2));
ok("identitet P/E×ROE", har(sv(idPeRoe, 4)) && Math.abs(idPeRoe - 0.8356) < 0.00005, sv(idPeRoe, 4));
ok("gap identitet", har(pct(gapId)) && Math.abs(gapId - 0.00675) < 0.0001, pct(gapId));
ok("gap golv", har(pct(gapGolv)) && Math.abs(gapGolv - 0.00067) < 0.0001, pct(gapGolv));
ok("golvmarginal = fält", Math.abs(golvMarg - B.golv.marginal) < 0.0005 && har("16,95"), pct(golvMarg));
ok("pris/golv ≈ P/B", Math.abs(prisGolv - pb) < 0.001 && har(sv(prisGolv, 5)), sv(prisGolv, 5));

const skuld = skuldEk * ek * 1000, ev = mcap * 1000 + skuld;
const ebitEv = ev / evE, ebitMarg = ebitM * oms25, gapEbit = ebitEv / ebitMarg - 1;
ok("skuld härledd", har(sv(skuld, 0)), sv(skuld, 0));
ok("EV härlevt", har(sv(ev, 0)), sv(ev, 0));
ok("EBIT EV-väg", har(sv(ebitEv, 0)), sv(ebitEv, 0));
ok("EBIT marginal-väg", har(sv(ebitMarg, 0)), sv(ebitMarg, 0));
ok("gap EBIT", har(pct(gapEbit, 1)), pct(gapEbit, 1));

const vPe = mcap * 1000 / pe, vMarg = nettoM * oms25, gapV = vPe / vMarg - 1;
ok("vinst P/E-väg", har(sv(vPe, 1)), sv(vPe, 1));
ok("vinst marginal-väg", har(sv(vMarg, 1)), sv(vMarg, 1));
ok("gap vinstpar tajtast i serien", har(pct(Math.abs(gapV))) && Math.abs(gapV) < 0.008, pct(gapV));
ok("fönster över årsserie", har(pct(vPe / res25 - 1, 1)), pct(vPe / res25 - 1, 1));
const h1n = 1.54 * aktier, h1f = 0.91 * aktier;
ok("H1-netto", har(sv(h1n, 0)) && har(sv(h1f, 0)), sv(h1n, 0) + "/" + sv(h1f, 0));

const pegK = pe / (100 * B.tillvaxt.prognosTillvaxt), pegImp = pe / B.vardering.peg, pegQ = B.vardering.peg / pegK;
ok("PEG-konvention", har(sv(pegK, 2)) && Math.abs(pegK - 3.09) < 0.005, sv(pegK, 2));
ok("PEG implicit tillväxt", har(sv(pegImp, 2)), sv(pegImp, 2));
ok("PEG-kvot", har(sv(pegQ, 2)), sv(pegQ, 2));

const fY = fcfY * mcap * 1000, fM = fcfM * oms25, fQ = fY / fM;
ok("FCF yield-väg", har(sv(fY, 1)), sv(fY, 1));
ok("FCF marginal-väg", har(sv(fM, 1)), sv(fM, 1));
ok("FCF-kvot seriens tajtaste", har(sv(fQ, 4)) && Math.abs(fQ - 1.00646) < 0.0002 && fQ < 1.012, sv(fQ, 4));
ok("FCF-gap i title", J.title.includes("0,65 procent"));

const rB = 1 - pris / golv, rE = 1 - pris / 190, eGap = 190 / golv - 1;
ok("rabatt bok", har(pct(rB)) && Math.abs(rB - 0.16951) < 0.0002, pct(rB));
ok("rabatt EPRA", har(pct(rE, 1)) && Math.abs(rE - 0.37263) < 0.001, pct(rE, 1));
ok("EPRA/bok-gap", har(pct(eGap, 1)), pct(eGap, 1));
ok("direktavkastning", har(pct(2.9 / pris)) && Math.abs(2.9 / pris - 0.024329) < 0.0001, pct(2.9 / pris));
const sol = ek * 1000 / (ek * 1000 + skuld);
ok("soliditet härledd", har(pct(sol, 1)), pct(sol, 1));

// scenarioruta 9 celler
const rutor = [185, 190, 195].map(s => [rE - 0.05, rE, rE + 0.05].map(r => Math.round(s * (1 - r) * 10) / 10));
const cellStr = rutor.flat().map(x => sv(x, 2));
ok("9 scenarieceller", cellStr.every(har), cellStr.filter(s => !har(s)).join("|") || "OK");
ok("mittencell kalibrerad mot kurs", Math.abs(rutor[1][1] - 119.2) < 0.1, sv(rutor[1][1], 2));
const rSub = 5 * (1 - rE), rRab = 190 * 0.05, vikt = rRab / rSub, ovf = rE / (1 - rE);
ok("räknesats substans", har(sv(rSub, 2)), sv(rSub, 2));
ok("räknesats rabatt", har(sv(rRab, 2)), sv(rRab, 2));
ok("vikt", har(sv(vikt, 1)), sv(vikt, 1));
ok("överföringsgrad", har(sv(ovf, 3)), sv(ovf, 3));
ok("pari bok", har(pct(golv / pris - 1, 1)), pct(golv / pris - 1, 1));
ok("pari EPRA", har(pct(190 / pris - 1, 1)), pct(190 / pris - 1, 1));

// trappsteg + vändning
const o = B.serier.omsattning.map(x => x / 1e6), r = B.serier.resultat.map(x => x / 1e6);
const steg = [o[1] / o[0] - 1, o[2] / o[1] - 1, o[3] / o[2] - 1];
ok("intäktssteg", steg.every((s, i) => s > 0) && har(pct(steg[0])) && har(pct(steg[1])) && har(pct(steg[2])), steg.map(pct).join(" "));
ok("vändning två år", har(sv(r[3] - r[1], 0)), sv(r[3] - r[1], 0));

// ---------- 5. medianer + rang med n ----------
const FAST = LIST.filter(x => x["bran" + "sch"] === "fastighet");const med = a => { const s = a.filter(x => typeof x === "number" && isFinite(x)).sort((x, y) => x - y); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };
const get = (o, p) => p.split(".").reduce((o, k) => (o && o[k] !== undefined) ? o[k] : null, o);
ok("grenen 16 bolag", FAST.length === 16, String(FAST.length));
const rangPåståenden = [
  ["pb rang 7", "vardering.pb", 7, "0,9355"],
  ["pe rang 10", "vardering.pe", 10, "12,909"],
  ["evEbit rang 7", "vardering.evEbit", 7, "24,589"],
  ["fcfY rang 9", "vardering.fcfYield", 9, "4,07"],
  ["roe rang 4 lägst", "lonksamhet.roe", 4, "8,51"],
  ["roic rang 7", "lonksamhet.roic", 7, "4,56"],
  ["netto rang 5 lägst", "lonksamhet.nettoMarginal", 5, "44,1"],
  ["ebit rang 7", "lonksamhet.ebitMarginal", 7, "58,43"],
  ["skuld rang 1", "stabilitet.skuldEgenkapital", 1, "1,09"],
  ["prog rang 13", "tillvaxt.prognosTillvaxt", 13, "2,04"],
  ["brutto rang 14", "lonksamhet.bruttoMarginal", 14, "71,06"],
  ["fcfM median", "lonksamhet.fcfMarginal", 7, "31,39"],
  ["peg median", "vardering.peg", 7, "4,16"],
];
for (const [n, p, förv, medStr] of rangPåståenden) {
  const arr = FAST.map(b => get(b, p));
  const tal = arr.filter(x => typeof x === "number").sort((x, y) => x - y);
  const rg = tal.filter(x => x < get(B, p)).length + 1;
  ok(n, rg === förv && har(medStr), `räknad rang ${rg} (förväntad ${förv}), median ${sv(med(arr), 4)} — texten har '${medStr}'? ${har(medStr)}`);
}
// grannar skuldkronan
const sp = FAST.map(b => [b.ticker, get(b, "stabilitet.skuldEgenkapital")]).filter(x => typeof x[1] === "number").sort((a, b) => a[1] - b[1]);
ok("skuldkronan grannar", sp[0][0] === "HUFV-A.ST" && har(sp[1][1].toFixed(4).replace(".", ",")) && har("0,6382"), "näst lägst " + sp[1][0] + " " + sp[1][1]);
// universummedianer i tabellen
for (const [n, p, s] of [["pb", "vardering.pb", "2,774"], ["pe", "vardering.pe", "20,525"], ["evEbit", "vardering.evEbit", "17,955"], ["fcfY", "vardering.fcfYield", "4,20"], ["roe", "lonksamhet.roe", "15,02"], ["skuld", "stabilitet.skuldEgenkapital", "0,510"], ["prog", "tillvaxt.prognosTillvaxt", "13,14"]]) {
  ok("universummedian " + n + " (" + s + ")", har(s));
}

// ordningstal i texten måste matcha räknad rang (rang r av n ⇒ n−r högre ⇒ (n−r+1):e högst)
ok("prog-ordinal: fjärde högst (rang 13/16)", har("järde högst av sexton") && har("fjärde högst av 16 i grenen"));
ok("brutto-ordinal: tredje högst (rang 14/16)", har("tredje högst av sexton") && har("tredje högst av 16"));

ok("ordningstal: seriens 57:e (födelseordning Truecaller 56 → HUFV 57 → Aker BP 58)", har("seriens 57:e") && !J.body.includes("seriens 56:e"));

// ---------- 6. juridikgrind ----------
const lag = ALL.match(/2007:528/g) || [];
ok("exakt ett lagrum 2007:528", lag.length === 1 && (J.body.match(/2007:528/g) || []).length === 1, "förekomster " + lag.length + " (title/desc 0, body 1)");
ok("2 kap 5 § närvarande", J.body.includes("2 kap 5 §"));
const rader = J.body.split("\n");
ok("disclaimer sista raden", rader[rader.length - 1].trim().startsWith("*Detta är pedagogisk finansutbildning enligt lagen (2007:528)"));
ok("utbildningsram i ingress", J.body.slice(0, 1200).includes("Allt här är utbildning i metod: inte en rekommendation att köpa, sälja eller behålla"));
const rådMönster = [/rekommenderar att/i, /bör du köpa/i, /bör du sälja/i, /råd att köp/i, /köp denna/i, /sälj dina/i, /köpvärd/i, /säljvärd/i, /köpläge/i, /säljläge/i, /målkurs/i, /kursen kommer att/i, /förväntas stiga/i, /väntas stiga/i, /snabb vinst/i, /garanterad avkastning/i];
const rådTräff = rådMönster.filter(m => m.test(ALL));
ok("0 rådmönster", rådTräff.length === 0, rådTräff.map(m => m.source).join(","));
const lagrumBland = ALL.match(/2022:260|2022:261|1985:716|2005:59|2022:482/g) || [];
ok("0 främmande lagrum", lagrumBland.length === 0, lagrumBland.join(","));

// ---------- 7. interna länkar HTTP 200 + externa välskapade ----------
const interna = [...new Set([...ALL.matchAll(/\]\((\/[^)#\s]+)\)/g)].map(m => m[1]))];
ok("interna länkar ≥ 15 unika", interna.length >= 15, String(interna.length));
const länkFel = [];
for (const väg of interna) {
  const kod = await fetch("http://localhost:3000" + väg, { redirect: "follow" }).then(x => x.status).catch(() => "ERR");
  if (kod !== 200) länkFel.push(väg + " → " + kod);
}
ok("interna länkar 200", länkFel.length === 0, länkFel.join(", "));
const externa = [...new Set([...ALL.matchAll(/\]\((https:\/\/[^)#\s]+)\)/g)].map(m => m[1]))];
ok("externa 2 (kalender + MFN)", externa.length === 2 && externa.every(u => u.startsWith("https://")), externa.join(", "));
ok("bolagssidan länkad", interna.includes("/bolag/hufv-a-st"));

// ---------- 8. teckengrind ----------
ok("0 nbsp/202f", !/[\u00a0\u202f]/.test(ALL));
ok("0 mjuka bindestreck", !/[\u2010\u2011]/.test(ALL));
ok("0 CJK/koreanska", !/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/.test(ALL));
ok("0 styckebytes-tecken", !/[\u000b\u000c]/.test(ALL));

// ---------- 9. publiceringsytor ----------
ok("utkastfil finns", existsSync(FIL));
ok("live-mappen orörd", !existsSync("/home/ak1a/AK1/data/blogg/sa-laser-du-hufvudstaden-q3-2026.json"));
ok("kalenderfilen refererad", J.body.includes("kalender-fastighet.json"));

// ---------- rapport ----------
console.log(`KVD HUFV-A Q3-2026: ${PASS} PASS · ${FEL} FEL · ${VARN} VARNING`);
if (fel.length) { console.log("FEL:"); for (const f of fel) console.log("  ✗ " + f); }
if (varn.length) { console.log("VARNING:"); for (const v of varn) console.log("  ⚠ " + v); }
if (!fel.length && !varn.length) console.log("GRÖN — 0 fel, 0 varning. Ord " + ord + " · rm " + J.readingMinutes + " · interna " + interna.length + " · externa " + externa.length);
process.exit(fel.length ? 1 : 0);
