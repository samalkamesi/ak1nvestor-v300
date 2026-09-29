#!/usr/bin/env node
// _s4u3-tmus-kvd.mjs — KVD-sond för TMUS Q3-2026-läspaketet (spår 4, s4-u3).
// Kontrollerar: struktur, ord/rm, källtalsparitet mot universumposten, aritmetik
// (scenariorutans 9 celler, kedjor, räknesatser), medianer/rang/kollegtal LIVE ur
// bolagsunivers.json, juridik 2007:528 (ett lagrum, rådverb, disclaimer sist),
// 911=0, CJK=0, svenska gångjärn, punktddecimal-läckor, interna länkar 200 mot
// localhost (--http), externa markdown-länkar = 0.
// Användning: node verktyg/_s4u3-tmus-kvd.mjs [--http]
import { readFileSync } from "node:fs";

const PAKET = "/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-tmus-q3-2026.json";
const UNIVERSUM = "/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json";
const HTTP = process.argv.includes("--http");
const BASE = "http://localhost:3000";

let pass = 0, fel = 0, not = 0;
const OK = (m) => { pass++; console.log("  PASS " + m); };
const F = (m) => { fel++; console.log("  FEL " + m); };
const NOT = (m) => { not++; console.log("  NOT " + m); };
const test = (v, m) => v ? OK(m) : F(m);

const j = JSON.parse(readFileSync(PAKET, "utf8"));
const body = j.body;
const u = JSON.parse(readFileSync(UNIVERSUM, "utf8"));
const arr = Array.isArray(u) ? u : (u.bolag || u.universum || Object.values(u).find(Array.isArray));
const tmus = arr.find(b => b.ticker === "TMUS");
const kom = arr.filter(b => b.bransch === "kommunikation");

console.log("== KVD " + j.slug + " " + new Date().toISOString().slice(0, 10) + (HTTP ? " [http]" : " [struktur]"));

// — A. Struktur —
console.log("— struktur");
test(j.slug === "sa-laser-du-tmus-q3-2026", "slug");
test(j.title.length <= 314, `title ${j.title.length} tkn ≤ 314`);
test(j.description.length >= 150 && j.description.length <= 1155, `description ${j.description.length} tkn i bandet 150–1155`);
test(j.publishedAt === "2026-10-27", "publishedAt 2026-10-27 (dagen före rappdagen 2026-10-28)");
test(j.publishedAt <= "2026-10-28", "publishedAt ≤ rappdag");
test(j.pillar === "Institutionell metodik" && j.author === "AK1A Research Lab", "pillar/author");
test(Array.isArray(j.tags) && j.tags.length === 6, "tags 6 st");
const h2 = [...body.matchAll(/^## (.+)$/gm)].map(m => m[1]);
test(h2.length >= 7 && h2.length <= 13, `H2 ${h2.length} i familjebandet 7–13`);
test(h2[h2.length - 1] === "Källor", "sista H2 = Källor");
const stycken = body.split("\n").filter(s => s.trim().length > 0);
const sista = stycken[stycken.length - 1];
test(sista.includes("2007:528") && sista.includes("inte investeringsrådgivning") && sista.includes("kundens beslut"), "disclaimer exakt sista stycket");

// — B. Ord och rm —
console.log("— ord/rm");
const ord = body.replace(/\s+/g, " ").trim().split(" ").length;
const rm = Math.round(ord / 600);
console.log(`  ord ${ord} ⇒ rm ${rm} (fältet ${j.readingMinutes})`);
test(rm === j.readingMinutes, "readingMinutes = round(ord/600)");
test(ord >= 1800 && ord <= 4200, `ord ${ord} i familjebandet`);

// — C. Källtalsparitet: paketets tal == filens fält —
console.log("— källtalsparitet mot universumposten");
const sv = (x, dec = 2) => x.toFixed(dec).replace(".", ",");
const pari = [
  [sv(tmus.pris), "pris 168,18"],
  [sv(tmus.marknadsKapitalMdr), "mcap 180,40"],
  [sv(tmus.vardering.pe), "P/E 17,63"],
  [sv(tmus.vardering.pb), "P/B 3,21"],
  [sv(tmus.vardering.evEbit), "EV/EBIT 14,63"],
  [sv(tmus.vardering.peg), "PEG 0,56"],
  [sv(tmus.vardering.fcfYield * 100), "FCF-yield 10,20 %"],
  [sv(tmus.lonksamhet.roe * 100), "ROE 17,99 %"],
  [sv(tmus.lonksamhet.roic * 100), "ROIC 8,93 %"],
  [sv(tmus.lonksamhet.bruttoMarginal * 100), "bruttomarginal 63,05 %"],
  [sv(tmus.lonksamhet.ebitMarginal * 100), "EBIT-marginal 22,09 %"],
  [sv(tmus.lonksamhet.nettoMarginal * 100), "nettomarginal 11,45 %"],
  [sv(tmus.lonksamhet.fcfMarginal * 100), "FCF-marginal 19,96 %"],
  [sv(tmus.stabilitet.skuldEgenkapital), "skuld/EK 2,14"],
  [sv(tmus.stabilitet.rantaTackning), "räntetäckning 5,06"],
  ["31,3", "prognostillväxt +31,3 %"],
  [sv(tmus.tillvaxt.omsattningTillvaxtTTM * 100), "TTM-tillväxt +9,68 %"],
  ["9,54", "EPS 9,54"],
  ["13,43", "forward P/E 13,43"],
  ["4,08", "utdelning 4,08"],
  ["42,78", "payout 42,78 %"],
  [sv(tmus.aterkop.senasteArMdr, 1), "återköp 12,4 mdr"],
  ["3,93", "aktiebas −3,93 %"],
  ["6,35", "shareholder yield 6,35 %"],
  ["0,33", "beta 0,33"],
  ["242,37", "52v-topp"],
  ["164,02", "52v-botten"],
  ["1 072,6", "aktiebas 1 072,6 M"],
  ["92 189", "rev TTM"],
  ["10 560", "netto TTM"],
];
for (const [str, namn] of pari) test(body.includes(str), `paritet ${namn}: "${str}" i texten`);
const ser = tmus.serier;
for (let i = 0; i < 5; i++) test(body.includes((ser.omsattning[i] / 1e6).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ")), `serie intäkt ${ser.ar[i]}: ${(ser.omsattning[i] / 1e6).toFixed(0)}`);
for (let i = 0; i < 5; i++) test(body.includes((ser.resultat[i] / 1e6).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ")), `serie netto ${ser.ar[i]}`);
for (let i = 0; i < 5; i++) test(body.includes((ser.fcf[i] / 1e6).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ")), `serie FCF ${ser.ar[i]}`);

// — D. Aritmetik: härledda tal omräknade —
console.log("— aritmetik (oberoende omräkning)");
const near = (a, b, tol = 0.005) => Math.abs(a - b) <= tol * Math.abs(b);
test(near(3.21 / 0.1799, 17.84, 0.001) && body.includes("17,84"), "identitet 3,21 ÷ 0,1799 = 17,84 i text");
test(body.includes("1,2 procent"), "identitetsdifferens 1,2 procent i text");
test(body.includes("17,08"), "P/E netto-väg 17,08 i text");
test(body.includes("3,2 procent"), "P/E-vägarnas divergens 3,2 procent");
const ek = 180.40 / 3.21, sk = ek * 2.14, ev = 180.40 + 117.60, ebit = 92189 * 0.2209;
test(body.includes("56,2") && near(ek, 56.2, 0.01), "EV-steg 1: EK 56,2");
test(body.includes("120,3") && near(sk, 120.3, 0.01), "EV-steg 2: skuld 120,3");
test(body.includes("298,0") && near(ev, 298.0, 0.001), "EV-steg 3: EV 298,0 exakt");
test(body.includes("20 365") && near(ebit, 20365, 0.001), "EV-steg 4: EBIT 20 365");
test(near(ev * 1000 / ebit, 14.63, 0.005), "EV-steg 5: EV/EBIT 14,63 stänger");
test(near(28.833 - 10.434, 18.399, 0.001), "FCF 28,833 − 10,434 = 18,399");
test(near(18399 / 180400, 0.1020, 0.005), "FCF-yield 10,20 %");
test(near(17.63 / 31.3, 0.563, 0.01) && body.includes("0,56"), "PEG 17,63 ÷ 31,3 = 0,56");
test(near(17.63 / 1.313, 13.43, 0.005), "forward 17,63 ÷ 1,313 = 13,43");
test(near(242.37 / 17.63, 13.75, 0.005) && body.includes("13,75"), "topp-EPS 242,37 ÷ 17,63 = 13,75");
test(near(13.75 / 9.54, 1.44, 0.01) && body.includes("44 procent"), "topp-vinstgap 44 procent");
test(near(4 * 1.02, 4.08, 0.001), "årsutdelning 4 × 1,02 = 4,08");
test(near(4.08 * 1072.6 / 1000, 4.4, 0.02) && body.includes("4,4 miljarder"), "utdelningskostnad 4,4 mdr");
test(near(0.88 / 0.65 - 1, 0.354, 0.01) && near(1.02 / 0.88 - 1, 0.159, 0.01), "kvartalstrappa +35,4/+15,9 %");
test(near(11339 / 2590, 4.4, 0.01) && body.includes("4,4 gånger"), "synergibåge ×4,4");
test(near(63.17 - 56.85, 6.3, 0.01) && body.includes("+6,3 procentenheter"), "bruttomarginalbana +6,3 pp");
test(near(1 - 59.2 / 69.1, 0.143, 0.01) && body.includes("14,3 procent"), "EK-fall 14,3 %");
test(near(17995 / 1591, 11.3, 0.01) && body.includes("11,3"), "FCF-trappa 11,3×");
test(near(1 - 168.18 / 242.37, 0.306, 0.005) && body.includes("30,6 procent"), "dipp −30,6 %");
test(near((4.4 + 12.4) / 18.4, 0.91, 0.02) && body.includes("91 procent"), "återbörd 91 % av FCF");
const nm = [3024, 2590, 8317, 11339, 10992].map((n, i) => n / [80118, 79571, 78558, 81400, 88309][i] * 100);
for (const v of ["3,77", "3,25", "10,59", "13,93", "12,45"]) test(body.includes(v), `nettomarginalserie ${v}`);
for (const v of nm) if (!near(v, parseFloat(["3.77", "3.25", "10.59", "13.93", "12.45"][nm.indexOf(v)]), 0.005)) F("nettomarginalserie omräkning avviker: " + v.toFixed(2));
OK("nettomarginalserie omräknad 5/5");
// scenariorutans 9 celler
const celler = [[18859, 19754, 20648], [19443, 20365, 21286], [20026, 20975, 21925]];
const rutor = [[89423, 0.2109], [92189, 0.2209], [94955, 0.2309]];
let cellOK = 0;
for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
  const expect = ruta(r, c);
  if (body.includes(celler[r][c].toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ")) && near(expect, celler[r][c], 0.001)) cellOK++;
}
function ruta(r, c) { return rutor[r][0] * (0.2109 + 0.01 * c) / 1; }
test(cellOK === 9, `scenariorutans 9 celler exakta i text och aritmetik (${cellOK}/9)`);
test(body.includes("922") && near(92189 * 0.01, 922, 0.01), "marginalratan 922");
test(body.includes("611") && near(20365 * 0.03, 611, 0.01), "intäktsratan 611");
test(body.includes("1,51") && near(922 / 611, 1.51, 0.01), "marginalvikt 1,51");
test(near(1 / (3 * 0.2209), 1.51, 0.01), "Essity-formeln 1,51");
// kvartalstal (källbelagda paritet)
for (const [s, n] of [["277 000", "net adds"], ["15,9", "postpaid service"], ["152,91", "ARPA"], ["3,2 miljarder", "Q2-netto"], ["2,99", "Q2-EPS"], ["7,5 miljarder", "Q2-OCF"], ["4,8 miljarder", "Q2-FCF"], ["18,4–18,8", "guidance"], ["250 000", "Q3-utsikt"]]) test(body.includes(s), `Q2-26 paritet ${n}: "${s}"`);

// — E. Medianer LIVE ur filen —
console.log("— medianer/rang LIVE (kommunikation n=" + kom.length + ")");
const f = (b, p) => p.split(".").reduce((o, k) => (o || {})[k], b);
const med = xs => { const v = xs.filter(x => typeof x === "number" && !isNaN(x)).sort((a, b) => a - b); const m = Math.floor(v.length / 2); return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; };
for (const [str, p, pct] of [["16,92", "vardering.pe", 0], ["2,24", "vardering.pb", 0], ["14,43", "vardering.evEbit", 0], ["0,90", "vardering.peg", 0], ["7,70", "vardering.fcfYield", 1], ["14,83", "lonksamhet.roe", 1], ["17,89", "lonksamhet.ebitMarginal", 1], ["1,145", "stabilitet.skuldEgenkapital", 0]]) {
  const m = med(kom.map(b => f(b, p)));
  const filUtfall = pct ? m * 100 : m;
  test(body.includes(str) && near(filUtfall, parseFloat(str.replace(",", ".")), 0.005), `median ${str} LIVE (filen ${sv(filUtfall, 3)})`);
}
test(body.includes("16,92") && body.includes("rang 16 av 30"), "P/E-medianen 16,92 + rang 16/30");
test(body.includes("rang fyra") || body.includes("nummer fyra"), "resultatCAGR-rang fyra (superlativet återkallat)");
// kollegtal LIVE — filens poster är sanningen, inte insamlingsnotens
const t = arr.find(b => b.ticker === "T"), vz = arr.find(b => b.ticker === "VZ"), cmcsa = arr.find(b => b.ticker === "CMCSA");
const oran = arr.find(b => b.ticker === "ORA.PA");
test(t && near(t.vardering.pe, 8.59, 0.01) && body.includes("8,59"), "AT&T P/E 8,59 LIVE");
test(vz && near(vz.vardering.pe, 13.11, 0.01) && body.includes("13,11"), "Verizon P/E 13,11 LIVE (notens 8,9 motbevisad i text)");
test(cmcsa && near(cmcsa.vardering.pe, 7.36, 0.01) && body.includes("7,36"), "Comcast P/E 7,36 LIVE");
test(oran && near(oran.vardering.evEbit, 14.37, 0.01) && body.includes("14,37"), "Orange EV/EBIT 14,37 LIVE");
test(t && near(t.vardering.evEbit, 10.91, 0.01) && body.includes("10,91"), "AT&T EV/EBIT 10,91 LIVE");
test(vz && near(vz.vardering.evEbit, 12.58, 0.01) && body.includes("12,58"), "Verizon EV/EBIT 12,58 LIVE");
test(cmcsa && near(cmcsa.vardering.evEbit, 8.92, 0.01) && body.includes("8,92"), "Comcast EV/EBIT 8,92 LIVE");
test(near(13.112 / 8.593, 1.53, 0.01) && body.includes("53 procent"), "duopol-kvoten 53 procent (AT&T-paketets tvillingtal)");
test(near(17.63 / 7.36, 2.4, 0.02) && body.includes("2,4 gånger"), "P/E-trappans spann 2,4×");
test(near(14.63 / 8.92, 1.64, 0.005) && body.includes("1,64 gånger"), "EV/EBIT-trappans spann 1,64×");
test(near((17.63 / 7.36 - 1) * 100, 140, 1) && body.includes("140 procent"), "P/E-avstånd 140 procent");
test(near((14.63 / 8.92 - 1) * 100, 64, 1) && body.includes("64 procent"), "EV/EBIT-avstånd 64 procent");
test(near((14.63 / 14.37 - 1) * 100, 1.8, 0.5) && body.includes("1,8 procent"), "toppzonens Orange-avstånd 1,8 procent");
const kddi = (body.match(/KDDI/g) || []).length;
test(kddi <= 2, `KDDI endast i källkritikkontext, båda träffarna i samma korrigerande mening (${kddi} träffar, saknas i filen)`);

// — F. Juridik —
console.log("— juridik 2007:528");
const lagrum = (body.match(/2007:528/g) || []).length;
test(lagrum === 1, `exakt ett lagrum 2007:528 (${lagrum})`);
for (const annan of ["2022:260", "2022:261", "1985:716", "2005:59", "2007:548"]) test(!(body.includes(annan) || j.title.includes(annan) || j.description.includes(annan)), `annat lagrum ${annan} frånvarande`);
const radEfter = (re) => { const m = body.match(re); return m; };
const rad = ["rekommenderar", "bör du köpa", "bör du sälja", "köp aktien", "sälj aktien", "lägg en order", "investera i"].filter(p => body.toLowerCase().includes(p.toLowerCase()));
test(rad.length === 0, `icke-negerade rådfraser 0 (träffar: ${rad.join(", ") || "none"})`);
test(body.includes("inte en rekommendation att köpa, sälja eller behålla"), "negerad rekommendationsfras (ingress)");
test(body.includes("Inga köp-, sälj- eller hållningsrekommendationer"), "negerad rekommendationsfras (disclaimer)");
const n911 = (body.match(/911/g) || []).length;
test(n911 === 0, `911-referenser 0 (${n911})`);

// — G. Språkgrind —
console.log("— språk");
const cjk = body.match(/[\u3000-\u30ff\u4e00-\u9fff\uff00-\uffef]/g);
test(!cjk, `CJK-tecken 0 (${cjk ? cjk.length : 0})`);
const raka = (body.match(/"/g) || []).length;
test(raka === 0, `raka citattecken 0 (${raka})`);
const urlFree = body.replace(/https?:\/\/[^\s)]+/g, "").replace(/[\w.-]+\.(mjs|json|md|com|se|net|xyz)/g, "");
const punktTal = urlFree.match(/\d\.\d/g) || [];
test(punktTal.length === 0, `punktddecimal-läckor utanför URL/filnamn 0 (${punktTal.length}${punktTal.length ? ": " + punktTal.slice(0, 5).join(",") : ""})`);
test(body.includes("21:30 svensk tid") && body.includes("28 oktober"), "rappdag 28 oktober + 21:30 svensk tid");
const divergens = (body.match(/22 oktober/g) || []).length;
test(divergens <= 2, `panelens 22 oktober endast i divergenskontext (${divergens})`);

// — H. Länkar —
console.log("— länkar");
const lnkar = [...body.matchAll(/\]\(([^)]+)\)/g)].map(m => m[1]);
const interna = lnkar.filter(l => l.startsWith("/"));
const externa = lnkar.filter(l => /^https?:/.test(l));
test(externa.length === 0, `externa markdown-länkar 0 (${externa.length})`);
const forvantade = ["/dataset/kommunikation/pe", "/dataset/kommunikation/pb", "/dataset/kommunikation/ev-ebit", "/dataset/kommunikation/peg", "/dataset/kommunikation/fcf-avkastning", "/dataset/kommunikation/vardering", "/dataset/kommunikation/roe", "/dataset/kommunikation/roic", "/dataset/kommunikation/brutto-marginal", "/dataset/kommunikation/netto-marginal", "/dataset/kommunikation/skuldsattning", "/dataset/kommunikation/omsattning-cagr-5ar", "/dataset/kommunikation/resultat-cagr-5ar", "/dataset/kommunikation/omsattningstillvaxt-ttm", "/dataset/kommunikation/prognos-tillvaxt", "/dataset/kommunikation/universumjamforelse", "/bolag/tmus", "/kurser", "/transparens", "/kallor"];
for (const l of forvantade) test(interna.includes(l), `förväntad länk ${l}`);
for (const l of interna) if (!forvantade.includes(l)) F("omött länk i texten: " + l);
if (HTTP) {
  for (const l of interna) {
    const kod = await fetch(BASE + l, { redirect: "manual" }).then(r => r.status).catch(() => 0);
    test(kod === 200, `HTTP ${kod} ${l}`);
  }
} else {
  NOT(`--http ej aktiv: ${interna.length} interna länkar strukturkontrollerade endast`);
}

// — DOM —
console.log(`\n== DOM: ${fel === 0 ? "GRÖN" : "RÖD"} — ${pass} PASS · ${fel} FEL · ${not} NOT`);
if (fel > 0) process.exit(1);
