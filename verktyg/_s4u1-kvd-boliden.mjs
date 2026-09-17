#!/usr/bin/env node
// KVD för s4-u1: Boliden Q3-2026 läspaket (kvartalsrapportserien, materialgrenen)
// Läge: kvd (verifierar färdig fil; ändrar inget). Mönster: _s4u1-kvd-telia.mjs / _s4r3-holmen.mjs.
import { readFileSync } from "node:fs";

const FIL = "data/blogg-utkast/kvartal/2026-q3/sa-laser-du-boliden-q3-2026.json";
const UNI = "data/portfolj-system/bolagsunivers.json";

let pass = 0, fel = 0, varn = 0;
const rapport = [];
function k(namn, ok, detalj) {
  if (ok) { pass++; rapport.push(`PASS ${namn}${detalj ? " — " + detalj : ""}`); }
  else { fel++; rapport.push(`FEL ${namn}${detalj ? " — " + detalj : ""}`); }
}
function v(namn, ok, detalj) {
  if (ok) pass++; else { varn++; rapport.push(`VARNING ${namn}${detalj ? " — " + detalj : ""}`); }
}
const nra = (x, avr) => Math.abs(x - avr) < (Math.pow(10, -(avr.toString().split(/[.,]/)[1] || "").length)) * 1.6;

// ---------- 1. struktur ----------
let paket;
try { paket = JSON.parse(readFileSync(FIL, "utf8")); k("JSON giltig", true); }
catch (e) { console.log("FEL JSON ogiltig:", e.message); process.exit(1); }
const body = paket.body, allt = [paket.title, paket.description, body].join(" ");
k("slug", paket.slug === "sa-laser-du-boliden-q3-2026", paket.slug);
k("pillar", paket.pillar === "Institutionell metodik");
k("author", paket.author === "AK1A Research Lab");
k("publishedAt = rappdag−1", paket.publishedAt === "2026-10-28", paket.publishedAt);
k("tags 6 st med Boliden+material", Array.isArray(paket.tags) && paket.tags.length === 6 && paket.tags.includes("Boliden") && paket.tags.includes("material"));

// ---------- 2. källtalspåståenden mot universumfilen ----------
const uni = JSON.parse(readFileSync(UNI, "utf8"));
const bol = uni.find(b => b.ticker === "BOL.ST");
k("BOL.ST finns i universumet", !!bol);
const V = bol.vardering, L = bol.lonksamhet, T = bol.tillvaxt, S = bol.stabilitet;
const kall = {
  pe: V.pe, pb: V.pb, evEbit: V.evEbit, peg: V.peg, fcfYield: V.fcfYield,
  roe: L.roe, roic: L.roic, brutto: L.bruttoMarginal, ebit: L.ebitMarginal,
  netto: L.nettoMarginal, fcfm: L.fcfMarginal,
  omsCagr: T.omsattningCAGR5ar, resCagr: T.resultatCAGR5ar, ttm: T.omsattningTillvaxtTTM, prog: T.prognosTillvaxt,
  skuldEk: S.skuldEgenkapital, pris: bol.pris, mcap: bol.marknadsKapitalMdr,
  oms: bol.serier.omsattning, res: bol.serier.resultat, ar: bol.serier.ar,
  insider: bol.aterkop.insiderkopSenaste6man,
};
const sv = (x) => x.toFixed(2).replace(".", ",").replace(/,00$/, "");
k("källa pe", nra(kall.pe, 12.44), `fil=${kall.pe} text=12,44`);
k("källa pb", nra(kall.pb, 1.965), `fil=${kall.pb}`);
k("källa evEbit (text 13,42)", nra(kall.evEbit, 13.42), `fil=${kall.evEbit}`);
k("källa peg", nra(kall.peg, 2.98), `fil=${kall.peg}`);
k("källa fcfYield (text 1,06 %)", nra(kall.fcfYield, 0.0106), `fil=${kall.fcfYield}`);
k("källa roe (text 16,78 %)", nra(kall.roe, 0.1678), `fil=${kall.roe}`);
k("källa roic (text 12,47 %)", nra(kall.roic, 0.1247), `fil=${kall.roic}`);
k("källa brutto (text 19,03 %)", nra(kall.brutto, 0.1903), `fil=${kall.brutto}`);
k("källa ebit (text 12,41 %)", nra(kall.ebit, 0.1241), `fil=${kall.ebit}`);
k("källa netto (text 12,23 %)", nra(kall.netto, 0.1223), `fil=${kall.netto}`);
k("källa fcfm (text 1,61 %)", nra(kall.fcfm, 0.0161), `fil=${kall.fcfm}`);
k("källa omsCagr (text +2,66)", nra(kall.omsCagr, 0.0266), `fil=${kall.omsCagr}`);
k("källa resCagr (text −8,83)", nra(kall.resCagr, -0.0883), `fil=${kall.resCagr}`);
k("källa ttm (text 15,5)", nra(kall.ttm, 0.155), `fil=${kall.ttm}`);
k("källa prognos (text 22,67)", nra(kall.prog, 0.2267), `fil=${kall.prog}`);
k("källa skuldEk (text 0,2823)", nra(kall.skuldEk, 0.2823), `fil=${kall.skuldEk}`);
k("källa pris (text 556,80)", nra(kall.pris, 556.8), `fil=${kall.pris}`);
k("källa mcap (text 158,11 mdr)", nra(kall.mcap, 158.11), `fil=${kall.mcap}`);
k("källa intäktsserie", kall.oms.join() === [86437000000, 78554000000, 89207000000, 93509000000].join(), kall.oms.join());
k("källa resultatserie", kall.res.join() === [12410000000, 6074000000, 10022000000, 9404000000].join(), kall.res.join());
k("källa serieår 2022–2025", kall.ar.join() === ["2022", "2023", "2024", "2025"].join());
k("källa insider 0", kall.insider === 0);
k("text: alla fyra intäktsårstal finns", ["86 437", "78 554", "89 207", "93 509"].every(t => allt.includes(t)));
k("text: alla fyra resultatårstal finns", ["12 410", "6 074", "10 022", "9 404"].every(t => allt.includes(t)));

// ---------- 3. medianer ----------
const med = (vals) => { const s = vals.filter(x => typeof x === "number" && isFinite(x)).sort((a, b) => a - b); const n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const mat = uni.filter(b => b.bransch === "material");
const falt = {
  "material P/E": [mat.map(b => b.vardering.pe), 18.66, "18,66"], "material P/B": [mat.map(b => b.vardering.pb), 1.457, "1,457"],
  "material ROE": [mat.map(b => b.lonksamhet.roe), 0.0813, "8,13"], "material EBIT": [mat.map(b => b.lonksamhet.ebitMarginal), 0.0981, "9,81"],
  "material netto": [mat.map(b => b.lonksamhet.nettoMarginal), 0.0926, "9,26"], "material skuld/EK": [mat.map(b => b.stabilitet.skuldEgenkapital), 0.32, "0,32"],
  "material EV/EBIT": [mat.map(b => b.vardering.evEbit), 13.9, "13,90"],
  "universum P/E": [uni.map(b => b.vardering.pe), 20.84, "20,84"], "universum P/B": [uni.map(b => b.vardering.pb), 2.865, "2,865"],
  "universum ROE": [uni.map(b => b.lonksamhet.roe), 0.156, "15,60"], "universum EBIT": [uni.map(b => b.lonksamhet.ebitMarginal), 0.2059, "20,59"],
  "universum netto": [uni.map(b => b.lonksamhet.nettoMarginal), 0.1366, "13,66"], "universum skuld/EK": [uni.map(b => b.stabilitet.skuldEgenkapital), 0.533, "0,53"],
};
for (const [namn, [vals, exp, txt]] of Object.entries(falt)) {
  const m = med(vals);
  k(`median ${namn} = ${txt}`, nra(m, exp), `beräknad=${(typeof exp === "number" && exp < 1 ? m.toFixed(4) : m.toFixed(3))}`);
}
const nPe = mat.filter(b => typeof b.vardering.pe === "number").length;
k("material n=15 där P/E n=14", mat.length === 15 && nPe === 14, `n=${mat.length}, pe-n=${nPe}`);
const nU = { pe: uni.filter(b => typeof b.vardering.pe === "number").length, pb: uni.filter(b => typeof b.vardering.pb === "number").length, roe: uni.filter(b => typeof b.lonksamhet.roe === "number").length, ebit: uni.filter(b => typeof b.lonksamhet.ebitMarginal === "number").length, netto: uni.filter(b => typeof b.lonksamhet.nettoMarginal === "number").length, skuld: uni.filter(b => typeof b.stabilitet.skuldEgenkapital === "number").length };
k("universum-n per mått (144/150/149/152/153/139)", [nU.pe === 144, nU.pb === 150, nU.roe === 149, nU.ebit === 152, nU.netto === 153, nU.skuld === 139].every(Boolean), JSON.stringify(nU));
k("text: n-redovisning P/E 144 / P/B 150 / ROE 149 / EBIT 152 / netto 153", ["n=144", "n=150", "n=149", "n=152", "n=153"].every(t => body.includes(t)));
k("text: total 153-bolagsbas", body.includes("153 bolag"), null);

// ---------- 4. aritmetik (enheter: Mkr) ----------
const omsMkr = 93509, resMkr = 9404, mcapMkr = 158110;
const EK = mcapMkr / 1.965, skuldMkr = EK * 0.2823, evMkr = EK + skuldMkr, ebitMkr = omsMkr * 0.1241;
const A = {
  "identitet P/B÷ROE = 11,71": [kall.pb / kall.roe, 11.71],
  "identitetsdifferens −5,9 % (identitet mot fält)": [(kall.pb / kall.roe - 12.44) / 12.44 * 100, -5.9],
  "omvänd P/E×ROE = 2,09": [12.44 * kall.roe, 2.09],
  "implicit EPS 44,76": [556.8 / 12.44, 44.76],
  "nettofält 11 436 Mkr": [omsMkr * kall.netto, 11436],
  "P/E×netto = 142,3 mdr": [12.44 * omsMkr * kall.netto / 1000, 142.3],
  "residual nettofält −10,0 %": [(12.44 * omsMkr * kall.netto / 1000 - 158.11) / 158.11 * 100, -10.0],
  "P/E×resultat = 117,0 mdr": [12.44 * resMkr / 1000, 117.0],
  "residual resultat −26,0 %": [(12.44 * resMkr / 1000 - 158.11) / 158.11 * 100, -26.0],
  "två vinstbegrepp 21,6 % isär": [(omsMkr * kall.netto / resMkr - 1) * 100, 21.6],
  "implicit vinst 12 710": [mcapMkr / 12.44, 12710],
  "implicit +11 % över nettofält": [(mcapMkr / 12.44 / (omsMkr * kall.netto) - 1) * 100, 11],
  "implicit +35 % över årsresultat": [(mcapMkr / 12.44 / resMkr - 1) * 100, 35],
  "PEG-konvention 0,55": [12.44 / 22.67, 0.55],
  "PEG-kvot 0,18": [12.44 / 22.67 / 2.98, 0.18],
  "PEG implicit tillväxt 4,17": [12.44 / 2.98, 4.17],
  "EV-steg1 EK 80,5 mdr": [EK / 1000, 80.5],
  "EV-steg2 skuld 22,7 mdr": [skuldMkr / 1000, 22.7],
  "EV-steg3 EV 103,2 mdr": [evMkr / 1000, 103.2],
  "EV-steg4 EBIT 11 604 Mkr": [ebitMkr, 11604],
  "EV-steg5 kedja 8,89": [evMkr / ebitMkr, 8.89],
  "EV-kvot 0,66": [8.89 / 13.422, 0.66],
  "fält-EV 155,8 mdr": [13.422 * ebitMkr / 1000, 155.8],
  "EV-residual +52,6 mdr": [13.422 * ebitMkr / 1000 - evMkr / 1000, 52.6],
  "FCF 1 505 Mkr": [omsMkr * 0.0161, 1505],
  "FCF-yield räknad 0,95 %": [omsMkr * 0.0161 / mcapMkr * 100, 0.95],
  "FCF-avvikelse −10 %": [(omsMkr * 0.0161 / mcapMkr / 0.0106 - 1) * 100, -10],
  "1 pp marginal = 935": [omsMkr * 0.01, 935],
  "3 % intäkter = 348": [omsMkr * 0.03 * 0.1241, 348],
  "marginalvikt 2,69": [omsMkr * 0.01 / (omsMkr * 0.03 * 0.1241), 2.69],
  "Essity-formeln 1÷(3×0,1241) = 2,68": [1 / (3 * 0.1241), 2.68],
  "omsCAGR +2,66 %": [(Math.pow(93509 / 86437, 1 / 3) - 1) * 100, 2.66],
  "resCAGR −8,83 %": [(Math.pow(9404 / 12410, 1 / 3) - 1) * 100, -8.83],
  "intäktssteg −9,12": [(78554 / 86437 - 1) * 100, -9.12],
  "intäktssteg +13,56": [(89207 / 78554 - 1) * 100, 13.56],
  "intäktssteg +4,82": [(93509 / 89207 - 1) * 100, 4.82],
  "resultatsteg −51,04": [(6074 / 12410 - 1) * 100, -51.04],
  "resultatsteg +65,00": [(10022 / 6074 - 1) * 100, 65.0],
  "resultatsteg −6,17": [(9404 / 10022 - 1) * 100, -6.17],
  "nettomarginalserie 14,36/7,73/11,24/10,06": [[12410 / 86437, 6074 / 78554, 10022 / 89207, 9404 / 93509].map(x => x * 100).reduce((a, b) => a + Math.round(b * 100), 0), 1436 + 773 + 1124 + 1006],
  "multiplövning 10,14": [12.44 / 1.2267, 10.14],
  "vinst/kassa 7,6×": [12.23 / 1.61, 7.6],
  "PEG-faktor 5,4": [2.98 / 0.55, 5.4],
  "kassagap 9 931": [(kall.oms[3] * kall.netto - kall.oms[3] * 0.0161) / 1e6, 9931],
  "P/E −33 % mot median": [(12.44 / 18.6575 - 1) * 100, -33],
  "P/E −40 % mot universum": [(12.44 / 20.839 - 1) * 100, -40],
  "P/B +35 % mot median": [(1.965 / 1.457 - 1) * 100, 35],
  "P/B −31 % mot universum": [(1.965 / 2.865 - 1) * 100, -31],
  "ROE 2,06× median": [16.78 / 8.13, 2.06],
  "EBIT +27 %": [(12.41 / 9.81 - 1) * 100, 27],
  "netto +32 %": [(12.23 / 9.26 - 1) * 100, 32],
  "skuld −12 %": [(0.2823 / 0.32 - 1) * 100, -12],
  "skuld −47 %": [(0.2823 / 0.5331 - 1) * 100, -47],
  "EV/EBIT-fält kvot 0,97 mot median": [13.422 / 13.896, 0.97],
};
for (const [namn, [faktiskt, vantat]] of Object.entries(A)) k(`aritmetik ${namn}`, nra(faktiskt, vantat), `beräknad=${typeof faktiskt === "number" ? faktiskt.toFixed(4) : faktiskt}`);
// P/E-rank
const pes = mat.map(b => b.vardering.pe).filter(x => typeof x === "number").sort((a, b) => a - b);
k("P/E-rank 2 av 14 (bara Yara lägre)", pes.filter(x => x < 12.44).length === 1 && pes.length === 14 && pes[0] === 8.287, `rank=${pes.filter(x => x < 12.44).length + 1}/${pes.length}, lägst=${pes[0]}`);
// scenarioruta 3×3
const nivaer = [93509 * 0.97, 93509, 93509 * 1.03], margs = [0.1141, 0.1241, 0.1341];
const textCellor = [[10349, 11256, 12163], [10669, 11604, 12540], [10990, 11953, 12916]];
for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
  const c = nivaer[i] * margs[j];
  k(`scenariecell rad${i + 1} kol${j + 1} = ${textCellor[i][j]}`, Math.abs(c - textCellor[i][j]) < 1, `beräknad=${c.toFixed(1)}`);
}
k("scenarie: intäktsnivåer 90 704/93 509/96 314 i text", ["90 704", "93 509", "96 314"].every(t => body.includes(t)));

// ---------- 5. språk/juridik/struktur ----------
k("CJK-fria", !/[\u3040-\u30ff\u4e00-\u9fff\uac00-\ud7af]/.test(allt));
k("mjuka bindestreck 0", !allt.includes("­"));
// juridikgrind: rådord får bara förekomma i neutrala kontexter (nekande/disclaimer/fältbeskrivning)
const rador = ["köp", "sälj", "rekommendera", "undvik"];
let ickeNeutrala = [];
for (const ord_ of rador) {
  let idx = 0;
  while ((idx = allt.toLowerCase().indexOf(ord_, idx)) !== -1) {
    const ctx = allt.toLowerCase().slice(Math.max(0, idx - 70), idx + 70);
    const neutral = /inte en rekommendation|inga köp-, |insiderköp|aldrig|endast i nekande/.test(ctx);
    if (!neutral) ickeNeutrala.push(`"${ord_}" @${idx}: …${ctx.slice(Math.max(0, idx - 70 - Math.max(0, idx - 70)), 60)}…`);
    idx += ord_.length;
  }
}
k("juridikgrind: rådord endast i neutrala kontexter", ickeNeutrala.length === 0, ickeNeutrala.length ? ickeNeutrala.join(" | ") : "alla träffar neutrala");
k("lagrum exakt en gång", (allt.match(/2007:528/g) || []).length === 1 && (allt.match(/2 kap 5 §/g) || []).length === 1);
k("disclaimer sista stycket", body.trimEnd().endsWith("publiceringen av detta paket är kundens beslut.*") || body.trimEnd().endsWith("publiceringen av detta paket är kundens beslut.*".replace(/\.\*$/, ".")) || /inte investeringsrådgivning\.\s/.test(body.slice(-700)) && body.trimEnd().endsWith("kundens beslut.*"));
k("ingen markdown-länk till data/blogg-utkast", !/\]\([^)]*blogg-utkast/.test(body));
const ord = (paket.title + " " + paket.description + " " + body).split(/\s+/).filter(Boolean).length;
k("ord >= 2 800", ord >= 2800, `${ord} ord`);
k("readingMinutes = floor(ord/600)", paket.readingMinutes === Math.floor(ord / 600), `ord=${ord}, rm=${paket.readingMinutes}, floor=${Math.floor(ord / 600)}`);
v("title ≤ 320 tkn", paket.title.length <= 320, `${paket.title.length} tkn`);
v("description ≤ 640 tkn", paket.description.length <= 640, `${paket.description.length} tkn`);
k("title innehåller kärntal", ["12,4", "16,8", "FCF-marginalen 1,6"].every(t => paket.title.includes(t)));

// ---------- 6. interna länkar → HTTP 200 mot localhost ----------
const slugs = [...new Set([...body.matchAll(/\]\((\/[^)#\s]+)/g)].map(m => m[1]))];
k("interna länkar ≥ 19 unika", slugs.length >= 19, `${slugs.length} unika: ${slugs.join(" ")}`);
let lankOk = 0, lankFel = [];
for (const s of slugs) {
  try {
    const r = await fetch("http://localhost:3000" + s, { redirect: "follow", signal: AbortSignal.timeout(8000) });
    if (r.status === 200) lankOk++; else lankFel.push(`${s}=${r.status}`);
  } catch (e) { lankFel.push(`${s}=ERR(${e.message.slice(0, 40)})`); }
}
k("samtliga interna länkar HTTP 200", lankFel.length === 0 && lankOk === slugs.length, `${lankOk}/${slugs.length} OK${lankFel.length ? "; fel: " + lankFel.join(", ") : ""}`);
k("/bolag/bol-st finns bland länkarna", slugs.includes("/bolag/bol-st"));

// ---------- rapport ----------
console.log(rapport.join("\n"));
console.log(`\nKVD BOLIDEN: ${pass} PASS, ${fel} FEL, ${varn} VARNING (${ord} ord, ${slugs.length} länkar, title ${paket.title.length}/desc ${paket.description.length} tkn)`);
process.exit(fel > 0 ? 1 : 0);
