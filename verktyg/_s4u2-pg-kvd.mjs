// _s4u2-pg-kvd.mjs — KVD för P&G Q1 FY2027-läspaketet (spår 4, s4-u2, manifest auto-s4-1789860306737)
// Oberoende omräkning: läser den färdiga JSON + universumfilen och räknar ALLT från rådata.
// Utgångsläge GRÖNT krävs: 0 FEL, 0 VARNING.
import { readFileSync, existsSync } from "node:fs";

const FIL = "/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-pg-q3-2026.json";
const J = JSON.parse(readFileSync(FIL, "utf8"));
const U = JSON.parse(readFileSync("/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json", "utf8"));
const B = U.find(x => x.ticker === "PG");

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
ok("slug", J.slug === "sa-laser-du-pg-q3-2026");
ok("pillar", J.pillar === "Institutionell metodik");
ok("author", J.author === "AK1A Research Lab");
ok("publishedAt = rappdag", J.publishedAt === "2026-10-22");
ok("tags 6", Array.isArray(J.tags) && J.tags.length === 6 && J.tags.includes("kvartalsrapport") && J.tags.includes("Procter & Gamble") && J.tags.includes("konsument") && J.tags.includes("läspaket"));
ok("title ej tom + signaturämne", J.title.length > 150 && J.title.includes("P&G:s Q1-rapport"));
ok("description längd", J.description.length > 250 && J.description.length < 900);
const ord = J.body.split(/\s+/).filter(Boolean).length;
ok("readingMinutes = round(ord/600)", J.readingMinutes === Math.round(ord / 600), `ord ${ord} rm ${J.readingMinutes}`);
ok("ord 2400–3600", ord >= 2400 && ord <= 3600, `ord ${ord}`);
ok("H2-struktur", ["Urvalet", "Vågskiktet", "Nyckeltalen", "Källkritikens", "Så står sig bolaget", "Tre sätt att läsa", "Praktiskt inför", "Källor"].every(h => J.body.includes("## " + h) || J.body.includes("## " + h.slice(0, 8))));
ok("födelseordning + gren", har("seriens 61:a") && har("konsumentgrenens sjunde paket"));

// ---------- 2. källtalsparitet mot universumposten ----------
const paritet = [
  ["kurs", "147,64"], ["mcap", "342,9"], ["aktier mdr", "2,323"], ["P/E 2dec", "22,34"], ["P/B 2dec", "6,43"],
  ["EV/EBIT", "19,21"], ["PEG", "3,74"], ["FCF-yield", "3,87"], ["ROE", "30,29"], ["ROIC", "21,76"],
  ["brutto", "50,87"], ["EBIT-marg", "22,08"], ["netto", "18,44"], ["FCF-marg", "15,26"], ["skuld/EK 2dec", "0,64"],
  ["skuld/EK 4dec", "0,6449"], ["prognos", "6,02"], ["TTM", "1,5"], ["oCAGR", "2,00"], ["rCAGR", "3,07"],
  ["insider", "26"], ["P/E 3dec", "22,336"], ["P/B 3dec", "6,434"], ["ROE 4dec", "0,3029"],
];
for (const [n, s] of paritet) ok("paritet " + n, har(s), "saknar '" + s + "'");
ok("serier omsättning", ["82 006", "84 039", "84 284", "87 032"].every(har));
ok("serier resultat", ["14 653", "14 879", "15 974", "16 046"].every(har));
ok("universumvärden intakta", B.pris === 147.64 && B.marknadsKapitalMdr === 342.919 && B.vardering.pe === 22.336 && B.vardering.pb === 6.434 && B.vardering.evEbit === 19.211 && B.vardering.peg === 3.74 && B.lonksamhet.roe === 0.3029 && B.lonksamhet.roic === 0.2176 && B.stabilitet.skuldEgenkapital === 0.6449 && B.tillvaxt.prognosTillvaxt === 0.0602 && B.aterkop.insiderkopSenaste6man === 26);

// ---------- 3. aritmetik — oberoende omräkning ----------
const pris = B.pris, mcap = B.marknadsKapitalMdr, pe = B.vardering.pe, pb = B.vardering.pb, evEbit = B.vardering.evEbit;
const roe = B.lonksamhet.roe, ebitM = B.lonksamhet.ebitMarginal, nettoM = B.lonksamhet.nettoMarginal, fcfM = B.lonksamhet.fcfMarginal, fcfY = B.vardering.fcfYield;
const skuldEk = B.stabilitet.skuldEgenkapital, prog = B.tillvaxt.prognosTillvaxt, pegF = B.vardering.peg;
const O = B.serier.omsattning.map(x => x / 1e6), R = B.serier.resultat.map(x => x / 1e6);

const aktier = mcap * 1000 / pris;
ok("aktier härledda", har(sv(aktier / 1000, 3)) && Math.abs(aktier / 1000 - 2.323) < 0.001, sv(aktier / 1000, 3));
const ek = mcap / pb, skuld = skuldEk * ek, ebitMio = ebitM * O[3], ev = evEbit * ebitMio / 1000, kassa = ev - mcap - skuld;
ok("EK härlett", har(sv(ek, 1)) && Math.abs(ek - 53.3) < 0.05, sv(ek, 1));
ok("skuld härledd", har(sv(skuld, 1)) && Math.abs(skuld - 34.4) < 0.05, sv(skuld, 1));
ok("EBIT marginal-väg", har(sv(ebitMio, 0)) && Math.abs(ebitMio - 19216.7) < 1, sv(ebitMio, 0));
ok("EV härlevt", har(sv(ev, 1)) && Math.abs(ev - 369.2) < 0.1, sv(ev, 1));
ok("kassa NEGATIV härledd", har(sv(kassa, 1)) && kassa < 0 && Math.abs(kassa + 8.1) < 0.05, sv(kassa, 1));
const evKvot = ev / (mcap + skuld);
ok("EV-kedjekvot", har(sv(evKvot, 3)) && Math.abs(evKvot - 0.978) < 0.001, sv(evKvot, 3));

const idPeRoe = pb / roe, gapId = idPeRoe / pe - 1, idOmv = pe * roe, gapOmv = idOmv / pb - 1;
ok("identitet P/B ÷ ROE", har(sv(idPeRoe, 2)) && Math.abs(idPeRoe - 21.24) < 0.005, sv(idPeRoe, 2));
ok("gap identitet", har(sv(gapId * 100, 1)) && Math.abs(gapId + 0.049) < 0.0005, sv(gapId * 100, 1));
ok("identitet omvänd", har(sv(idOmv, 3)) && Math.abs(idOmv - 6.766) < 0.0005, sv(idOmv, 3));
ok("gap omvänd", har(pct(gapOmv, 1)), pct(gapOmv, 1));
ok("implicit EPS", har(sv(pris / pe, 2)) && Math.abs(pris / pe - 6.61) < 0.005, sv(pris / pe, 2));
ok("samstämmig P/B = P/E × ROE", har(sv(pe * roe, 2)), sv(pe * roe, 2));

const pegK = pe / (100 * prog), pegImp = pe / pegF, pegKvot = pegF / pegK;
ok("PEG-konvention", har(sv(pegK, 2)) && Math.abs(pegK - 3.71) < 0.005, sv(pegK, 2));
ok("PEG implicit tillväxt", har(sv(pegImp, 2)) && Math.abs(pegImp - 5.97) < 0.005, sv(pegImp, 2));
ok("PEG-kvot — första fulla sammanträffandet", har(sv(pegKvot, 3)) && pegKvot < 1.01, sv(pegKvot, 3));
ok("sammanträffande påstått i title", J.title.includes("PEG-kontrollens första fulla sammanträffande"));

const vPe = pe * R[3] / 1000, gapAbs = vPe / mcap - 1, nettoCirkel = nettoM * O[3];
ok("absolutkontroll årsbas", har(sv(vPe, 1)) && har(pct(gapAbs, 1)) && Math.abs(gapAbs - 0.045) < 0.001, sv(vPe, 1) + " / " + pct(gapAbs, 1));
ok("netto-cirkeln sluten", har(sv(nettoCirkel, 0)) && Math.abs(nettoCirkel - R[3]) < R[3] * 0.001, sv(nettoCirkel, 0) + " mot " + sv(R[3], 0));
const fcfMarg = fcfM * O[3], fcfYv = fcfY * mcap * 1000, fcfKvot = fcfMarg / fcfYv;
ok("FCF marginal-väg", har(sv(fcfMarg, 0)) && Math.abs(fcfMarg - 13281) < 1, sv(fcfMarg, 0));
ok("FCF avkastnings-väg", har(sv(fcfYv, 0)) && Math.abs(fcfYv - 13271) < 1, sv(fcfYv, 0));
ok("FCF-kvot", har(sv(fcfKvot, 3)) && Math.abs(fcfKvot - 1.001) < 0.0005, sv(fcfKvot, 3));

const oCAGRk = Math.pow(O[3] / O[0], 1 / 3) - 1, rCAGRk = Math.pow(R[3] / R[0], 1 / 3) - 1;
ok("omsättning-CAGR", har(pct(oCAGRk)) && Math.abs(oCAGRk - B.tillvaxt.omsattningCAGR5ar) < 0.0005, pct(oCAGRk));
ok("resultat-CAGR", har(pct(rCAGRk)) && Math.abs(rCAGRk - B.tillvaxt.resultatCAGR5ar) < 0.0005, pct(rCAGRk));
const stegO = [O[1] / O[0] - 1, O[2] / O[1] - 1, O[3] / O[2] - 1], stegR = [R[1] / R[0] - 1, R[2] / R[1] - 1, R[3] / R[2] - 1];
ok("intäktssteg", stegO.every(s => s > 0) && stegO.map(s => pct(s)).every(har), stegO.map(s => pct(s)).join(" "));
ok("resultatsteg", stegR.map(s => pct(s)).every(har), stegR.map(s => pct(s)).join(" "));
const nmSerie = R.map((r, i) => r / O[i]);
ok("nettomarginalserie", nmSerie.map(s => pct(s)).every(har), nmSerie.map(s => pct(s)).join(" "));
ok("brutto-EBIT-avstånd", har(pct(B.lonksamhet.bruttoMarginal - ebitM, 1)), pct(B.lonksamhet.bruttoMarginal - ebitM, 1));
ok("ROE-ROIC-avstånd", har(pct(B.lonksamhet.roe - B.lonksamhet.roic, 1)), pct(B.lonksamhet.roe - B.lonksamhet.roic, 1));

// scenarioruta 9 celler + räknesatser
const r3 = [O[3] * 0.97, O[3], O[3] * 1.03], m3 = [ebitM - 0.01, ebitM, ebitM + 0.01];
const cellStr = [];
for (const o of r3) for (const m of m3) cellStr.push(sv(o * m, 1));
ok("9 scenarieceller", cellStr.every(har), cellStr.filter(s => !har(s)).join("|") || "OK");
ok("marginalnivåer i rubrik", [pct(m3[0]), pct(m3[1]), pct(m3[2])].every(har));
ok("intäktsnivåer i radrubriker", [sv(r3[0], 1), sv(r3[1], 0), sv(r3[2], 1)].every(har));
const pp = O[3] * 0.01, tres = O[3] * 0.03 * ebitM, vikt = pp / tres;
ok("1 pp = X mn", har(sv(pp, 0)), sv(pp, 0));
ok("3 % intäkter = Y mn", har(sv(tres, 0)), sv(tres, 0));
ok("marginalvikt Essity-formeln", har(sv(vikt, 2)) && Math.abs(vikt - 1 / (3 * ebitM)) < 0.001, sv(vikt, 2));
ok("formeluttryck", har(sv(ebitM, 4)) && har(sv(1 / (3 * ebitM), 2)));
ok("vikt-trappan placerar PG", har("P&G 1,51"));
const mult = pe / (1 + prog);
const med = a => { const s = a.filter(x => typeof x === "number" && isFinite(x)).sort((x, y) => x - y); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };
ok("multiplövning", har(sv(mult, 2)) && Math.abs(mult - 21.07) < 0.005, sv(mult, 2));

// ---------- 4. medianer + rang med n ----------
const get = (o, p) => p.split(".").reduce((o, k) => (o && o[k] !== undefined) ? o[k] : null, o);
function medK(p) { return med(U.filter(b => b.bransch === "konsument").map(b => get(b, p))); }
function medU(p) { return med(U.map(b => get(b, p))); }
const K = U.filter(b => b.bransch === "konsument");
ok("grenen 33 bolag", K.length === 33, String(K.length));
ok("universum 219", U.length === 219, String(U.length));
const tabell = [
  ["P/E", "vardering.pe", 2], ["P/B", "vardering.pb", 2], ["EV/EBIT", "vardering.evEbit", 2],
];
for (const [n, p, d] of tabell) {
  ok("median konsument " + n, har(sv(medK(p), d)), sv(medK(p), d));
  ok("median universum " + n, har(sv(medU(p), d)), sv(medU(p), d));
}
for (const [n, p] of [["ROE", "lonksamhet.roe"], ["EBIT-marg", "lonksamhet.ebitMarginal"], ["netto", "lonksamhet.nettoMarginal"], ["prognos", "tillvaxt.prognosTillvaxt"], ["brutto", "lonksamhet.bruttoMarginal"]]) {
  ok("median konsument " + n + " (%)", har(pct(medK(p))), pct(medK(p)));
  ok("median universum " + n + " (%)", har(pct(medU(p))), pct(medU(p)));
}
ok("median PEG konsument", har(sv(medK("vardering.peg"), 2)), sv(medK("vardering.peg"), 2));
const multMedian = pe / medK("vardering.pe") - 1;
ok("vinstväg till median", har(sv(multMedian * 100, 1)) && Math.abs(multMedian - 0.176) < 0.001, sv(multMedian * 100, 1));
ok("median skuld/EK konsument", har(sv(medK("stabilitet.skuldEgenkapital"), 2)), sv(medK("stabilitet.skuldEgenkapital"), 2));
ok("median skuld/EK universum", har(sv(medU("stabilitet.skuldEgenkapital"), 2)), sv(medU("stabilitet.skuldEgenkapital"), 2));
const rangRoe = K.map(b => get(b, "lonksamhet.roe")).filter(x => typeof x === "number" && x < roe).length + 1;
const rangProg = K.map(b => get(b, "tillvaxt.prognosTillvaxt")).filter(x => typeof x === "number" && x < prog).length + 1;
ok("rang ROE 25 av 32", har("rang " + rangRoe + " av") && rangRoe === 25, "räknad " + rangRoe);
ok("prognos 6:e lugnaste av 30", har(rangProg + ":e lugnaste av 30") && rangProg === 6, "räknad " + rangProg);
ok("n-redovisning i tabellnot", har("n=32") && har("n=33") && har("219 bolag"));

// ---------- 5. juridikgrind ----------
const lag = ALL.match(/2007:528/g) || [];
ok("exakt ett lagrum 2007:528", lag.length === 1 && (J.body.match(/2007:528/g) || []).length === 1, "förekomster " + lag.length);
ok("2 kap 5 § närvarande", J.body.includes("2 kap 5 §"));
const rader = J.body.split("\n");
ok("disclaimer sista raden", rader[rader.length - 1].trim().startsWith("*Detta är pedagogisk finansutbildning enligt lagen (2007:528)"));
ok("utbildningsram i ingress", J.body.slice(0, 1200).includes("Allt här är utbildning i metod: inte en rekommendation att köpa, sälja eller behålla"));
const rådMönster = [/rekommenderar att/i, /bör du köpa/i, /bör du sälja/i, /råd att köp/i, /köp denna/i, /sälj dina/i, /köpvärd/i, /säljvärd/i, /köpläge/i, /säljläge/i, /målkurs/i, /kursen kommer att/i, /förväntas stiga/i, /väntas stiga/i, /snabb vinst/i, /garanterad avkastning/i];
const rådTräff = rådMönster.filter(m => m.test(ALL));
ok("0 rådmönster", rådTräff.length === 0, rådTräff.map(m => m.source).join(","));
const lagrumBland = ALL.match(/2022:260|2022:261|1985:716|2005:59|2022:482/g) || [];
ok("0 främmande lagrum", lagrumBland.length === 0, lagrumBland.join(","));

// ---------- 6. interna länkar HTTP 200 + externa välskapade ----------
const interna = [...new Set([...ALL.matchAll(/\]\((\/[^)#\s]+)\)/g)].map(m => m[1]))];
ok("interna länkar ≥ 15 unika", interna.length >= 15, String(interna.length));
const länkFel = [];
for (const väg of interna) {
  const kod = await fetch("http://localhost:3000" + väg, { redirect: "follow" }).then(x => x.status).catch(() => "ERR");
  if (kod !== 200) länkFel.push(väg + " → " + kod);
}
ok("interna länkar 200", länkFel.length === 0, länkFel.join(", "));
const externa = [...new Set([...ALL.matchAll(/\]\((https:\/\/[^)#\s]+)\)/g)].map(m => m[1]))];
ok("externa 1 (P&G IR)", externa.length === 1 && externa.every(u => u.startsWith("https://www.pginvestor.com/")), externa.join(", "));
ok("bolagssidan länkad", interna.includes("/bolag/pg"));

// ---------- 7. teckengrind ----------
ok("0 nbsp/202f", !/[\u00a0\u202f]/.test(ALL));
ok("0 mjuka bindestreck (inkl U+00AD)", !/[\u2010\u2011\u00ad]/.test(ALL));
ok("0 CJK/koreanska", !/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/.test(ALL));
ok("0 styckebytes-tecken", !/[\u000b\u000c]/.test(ALL));

// ---------- 8. publiceringsytor + urvalsspår ----------
ok("utkastfil finns", existsSync(FIL));
ok("live-mappen orörd", !existsSync("/home/ak1a/AK1/data/blogg/sa-laser-du-pg-q3-2026.json"));
ok("klaimfil finns", existsSync("/home/ak1a/AK1/data/vakten/auto-s4-1789860306737-s4-u2-ansprak.md"));
ok("förra omgångens gallra hedad", J.body.includes("P&G-anticipated") && J.body.includes("gallran gällde datumets status"));
ok("anticipated-status redovisad", J.body.includes('"anticipated"') && J.body.includes("preliminära angivande"));
ok("vågskikt frånvaro redovisad", J.body.includes("utanför vågvalideringsuniversumet") && J.body.includes("ingen PG-fil"));
ok("syskonkoordinering dokumenterad", J.body.includes("RWE 11/11") && J.body.includes("ASML 14/10"));
ok("fiskalår NIKE-precedens", J.body.includes("1 juli–30 juni") && J.body.includes("juli–september 2025"));

// ---------- rapport ----------
console.log(`KVD P&G Q1 FY2027: ${PASS} PASS, ${FEL} FEL, ${VARN} VARNING (ord ${ord}, rm ${J.readingMinutes}, ${interna.length} unika interna länkar)`);
if (fel.length) { console.log("FEL:"); for (const f of fel) console.log("  ✗ " + f); }
if (varn.length) { console.log("VARNING:"); for (const v of varn) console.log("  ! " + v); }
process.exit(FEL || VARN ? 1 : 0);
