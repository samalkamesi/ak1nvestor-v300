#!/usr/bin/env node
// KVD för sa-laser-du-balder-q3-2026 (s4-u3, manifest auto-s4-1789886103053)
// Alla tal maskinverifieras mot bolagsunivers.json (BALD-B.ST 2026-09-03) och
// netnet-cachen (2026-09-16); all aritmetik omräknas oberoende; medianer och
// rang räknas ur filen. Grind: 0 FEL, 0 VARNING = GRÖN.
import fs from "node:fs";

const PAKET = "data/blogg-utkast/kvartal/2026-q3/sa-laser-du-balder-q3-2026.json";
const uni = JSON.parse(fs.readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const lista = Array.isArray(uni) ? uni : uni.bolag;
const a = lista.find(b => b.ticker === "BALD-B.ST");
const netnet = JSON.parse(fs.readFileSync("data/cache/netnet-BALD_B_ST.json", "utf8")).data;
const p = JSON.parse(fs.readFileSync(PAKET, "utf8"));
const body = p.body;

let PASS = 0, FEL = 0, VARN = 0;
const ok = (namn, villkor, detalj = "") => {
  if (villkor) { PASS++; }
  else { FEL++; console.log(`FEL: ${namn} ${detalj}`); }
};
const varna = (namn, villkor, detalj = "") => {
  if (villkor) { PASS++; }
  else { VARN++; console.log(`VARNING: ${namn} ${detalj}`); }
};
const approx = (x, y, tol) => Math.abs(x - y) <= tol;

// ── 1. Struktur ──────────────────────────────────────────────────────────────
ok("slug", p.slug === "sa-laser-du-balder-q3-2026");
ok("filnamn", PAKET.endsWith(p.slug + ".json"));
ok("publishedAt = rappdag", p.publishedAt === "2026-10-23");
ok("author", p.author === "AK1A Research Lab");
ok("pillar", p.pillar === "Institutionell metodik");
ok("readingMinutes = round(ord/600)", p.readingMinutes === Math.max(3, Math.round(body.trim().split(/\s+/).length / 600)));
ok("tags 6", Array.isArray(p.tags) && p.tags.length === 6);
ok("gren+antal i body", /fastighetsgrenens sjunde/.test(body));
ok("största nordiska", /största nordiska fastighetsbolaget/.test(body));

// ── 2. Universumtal i bodyn (värdena MUST matcha filen) ─────────────────────
const falt = [
  ["P/E 10,29", "10,29", a.vardering.pe === 10.29],
  ["P/B 0,678", "0,678", a.vardering.pb === 0.678],
  ["EV/EBIT 24,284", "24,284", a.vardering.evEbit === 24.284],
  ["PEG källa 1,53", "1,53", a.vardering.peg === 1.53],
  ["FCF-yield 5,05", "5,05 procent", a.vardering.fcfYield === 0.0505],
  ["ROE 7,04", "7,04 procent", a.lonksamhet.roe === 0.0704],
  ["ROIC 3,81", "3,81 procent", a.lonksamhet.roic === 0.0381],
  ["brutto 66,30", "66,30 procent", a.lonksamhet.bruttoMarginal === 0.663],
  ["EBIT 66,33", "66,33 procent", a.lonksamhet.ebitMarginal === 0.6633],
  ["netto 50,21", "50,21 procent", a.lonksamhet.nettoMarginal === 0.5021],
  ["FCF-marg 22,62", "22,62 procent", a.lonksamhet.fcfMarginal === 0.2262],
  ["skuld/EK 1,4801", "1,4801", a.stabilitet.skuldEgenkapital === 1.4801],
  ["pris 53,30", "53,30", a.pris === 53.3],
  ["mcap 62,4", "62,4", a.marknadsKapitalMdr === 62.374],
  ["omsCAGR +9,26", "plus 9,26 procent", a.tillvaxt.omsattningCAGR5ar === 0.0926],
  ["resCAGR −9,18", "minus 9,18 procent", a.tillvaxt.resultatCAGR5ar === -0.0918],
  ["TTM +4,8", "plus 4,8 procent", a.tillvaxt.omsattningTillvaxtTTM === 0.048],
  ["prognos +4,75", "plus 4,75 procent", a.tillvaxt.prognosTillvaxt === 0.0475],
];
for (const [namn, needle, sant] of falt) {
  ok(`body: ${namn}`, body.includes(needle) && sant !== false);
}
// Serier (MSEK)
const oms = a.serier.omsattning.map(v => v / 1e6);
const res = a.serier.resultat.map(v => v / 1e6);
ok("serie omsättning", body.includes("10 521 → 11 944 → 12 876 → 13 721") && approx(oms[3], 13721, 0.5));
ok("serie resultat", body.includes("10 175 → **−6 746** → 3 304 → **7 621**") && approx(res[1], -6746, 0.5));
ok("årliga steg", body.includes("+13,5, +7,8 och +6,6")
  && approx(100 * (oms[1] / oms[0] - 1), 13.5, 0.06) && approx(100 * (oms[2] / oms[1] - 1), 7.8, 0.06) && approx(100 * (oms[3] / oms[2] - 1), 6.6, 0.06));
ok("CAGR-kontroll oms", approx(100 * (Math.pow(oms[3] / oms[0], 1 / 3) - 1), 9.26, 0.006));
ok("CAGR-kontroll res", approx(100 * (Math.pow(res[3] / res[0], 1 / 3) - 1), -9.18, 0.006));

// ── 3. Netnet-cachens mätpunkt ───────────────────────────────────────────────
ok("netnet kurs 50,06", body.includes("50,06") && netnet.kurs === 50.06);
ok("netnet P/B 0,636", body.includes("0,636") && approx(netnet.pb, 0.6364, 0.00005));
ok("netnet P/E 9,66", body.includes("9,66") && approx(netnet.pe, 9.6641, 0.00005));
ok("NCAV −106,48", body.includes("−106,48") && approx(netnet.ncavPerAktie, -106.4756, 0.001));
ok("netnet klass ej", /klass "ej"/.test(body) && netnet.klass === "ej");
const dk = 100 * (netnet.kurs / a.pris - 1), dpb = 100 * (netnet.pb / a.vardering.pb - 1), dpe = 100 * (netnet.pe / a.vardering.pe - 1);
ok("delta −6,1 % ×3", body.includes("−6,1 procent") && approx(dk, -6.1, 0.05) && approx(dpb, -6.1, 0.05) && approx(dpe, -6.1, 0.05));

// ── 4. Aritmetik (oberoende omräknad) ────────────────────────────────────────
const idPe = a.vardering.pb / a.lonksamhet.roe;                    // 9,6307
ok("identitet 9,63", body.includes("9,63") && approx(idPe, 9.63, 0.005));
ok("identitet avvikelse 6,4 %", body.includes("6,4 procent") && approx(100 * (a.vardering.pe - idPe) / a.vardering.pe, 6.4, 0.05));
const omv = a.vardering.pe * a.lonksamhet.roe;                     // 0,7244
ok("omvänt 0,724", body.includes("0,724") && approx(omv, 0.724, 0.0005));
ok("implicit VPA 5,18", body.includes("5,18") && approx(a.pris / a.vardering.pe, 5.18, 0.005));
ok("implicit EK/aktie 78,61", body.includes("78,61") && approx(a.pris / a.vardering.pb, 78.61, 0.005));
ok("rabatt 32,2 %", body.includes("32,2 procent") && approx(100 * (1 - a.vardering.pb), 32.2, 0.05));
const pegK = a.vardering.pe / (a.tillvaxt.prognosTillvaxt * 100);  // 2,166
ok("PEG-konvention 2,17", body.includes("2,17") && approx(pegK, 2.17, 0.005));
ok("PEG-kvot 0,71", body.includes("0,71") && approx(a.vardering.peg / pegK, 0.71, 0.005));
const ebit25 = a.serier.omsattning[3] * a.lonksamhet.ebitMarginal; // 9 101,1 MSEK
ok("EBIT 2025 = 9 101", body.includes("9 101") && approx(ebit25 / 1e6, 9101, 0.5));
ok("gap EBIT→netto ≈1 480", body.includes("1 480") && approx((ebit25 - a.serier.resultat[3]) / 1e6, 1480, 1));
ok("marginalvikt 0,50", body.includes("0,50") && approx(1 / (3 * a.lonksamhet.ebitMarginal), 0.5025, 0.001));
ok("1pp = 137", body.includes("137 miljoner") && approx(a.serier.omsattning[3] * 0.01 / 1e6, 137, 0.5));
ok("3% = 273", body.includes("273 miljoner") && approx(a.serier.omsattning[3] * 0.03 * a.lonksamhet.ebitMarginal / 1e6, 273, 0.5));
ok("multiplens natur 9,82", body.includes("9,82") && approx(a.vardering.pe / (1 + a.tillvaxt.prognosTillvaxt), 9.82, 0.005));
// Scenarioruta 3×3 — alla nio celler oberoende
const svFmt = v => { const [i, d] = v.toFixed(1).split("."); return i.replace(/\B(?=(\d{3})+(?!\d))/g, " ") + "," + d; };
const rutor = [[13309.4, [8695.0, 8828.1, 8961.2]], [13721.0, [8963.9, 9101.1, 9238.3]], [14132.6, [9232.8, 9374.2, 9515.5]]];
for (const [o, celler] of rutor) {
  for (let i = 0; i < 3; i++) {
    const m = a.lonksamhet.ebitMarginal - 0.01 + i * 0.01;
    ok(`cell ${o}×${(100 * m).toFixed(2)}%`, body.includes(svFmt(celler[i])) && approx(o * m, celler[i], 0.06), `letar ${svFmt(celler[i])}`);
  }
}
ok("utslag 123 %", body.includes("123 procent") && approx(100 * (Math.max(...res) - Math.min(...res)) / oms[3], 123, 0.5));

// ── 5. Medianer + rang omräknade ur filen ────────────────────────────────────
const med = v => { const s = [...v].sort((x, y) => x - y); const n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const gren = lista.filter(b => b.bransch === "fastighet");
const falt2 = [
  ["P/E", b => b.vardering?.pe, 1, "14,38"],
  ["P/B", b => b.vardering?.pb, 1, "0,946"],
  ["ROE", b => b.lonksamhet?.roe, 100, "8,57"],
  ["EBIT", b => b.lonksamhet?.ebitMarginal, 100, "57,37"],
  ["netto", b => b.lonksamhet?.nettoMarginal, 100, "43,58"],
  ["skuld/EK", b => b.stabilitet?.skuldEgenkapital, 1, "1,10"],
];
for (const [namn, f, skala, hs] of falt2) {
  const gv = gren.map(f).filter(v => typeof v === "number");
  const m = med(gv) * skala;
  ok(`fastighetsmedian ${namn} = ${hs} (n=${gv.length})`, approx(m, parseFloat(hs.replace(",", ".")), 0.006) && body.includes(hs));
}
const uniFalt = [["P/E", b => b.vardering?.pe, 1, "20,53"], ["P/B", b => b.vardering?.pb, 1, "2,75"], ["ROE", b => b.lonksamhet?.roe, 100, "14,75"], ["EBIT", b => b.lonksamhet?.ebitMarginal, 100, "21,11"], ["netto", b => b.lonksamhet?.nettoMarginal, 100, "14,09"]];
for (const [namn, f, skala, hs] of uniFalt) {
  const gv = lista.map(f).filter(v => typeof v === "number");
  const m = med(gv) * skala;
  ok(`universummedian ${namn} = ${hs} (n=${gv.length})`, approx(m, parseFloat(hs.replace(",", ".")), 0.006) && body.includes(hs));
}
const rangAsc = (f, val) => gren.map(f).filter(v => typeof v === "number").sort((x, y) => x - y).indexOf(val) + 1;
const rangDesc = (f, val) => gren.map(f).filter(v => typeof v === "number").sort((x, y) => y - x).indexOf(val) + 1;
ok("rang P/B = 4 lägst", rangAsc(b => b.vardering?.pb, 0.678) === 4 && /fjärde lägsta P\/B/.test(body));
ok("rang P/E = 5 lägst", rangAsc(b => b.vardering?.pe, 10.29) === 5 && /femte lägsta P\/E/.test(body));
ok("rang skuld/EK = 5 högst", rangDesc(b => b.stabilitet?.skuldEgenkapital, 1.4801) === 5 && /femte högsta belåningen/.test(body));
ok("rang EBIT = 5 högst", rangDesc(b => b.lonksamhet?.ebitMarginal, 0.6633) === 5 && /femte högsta EBIT-marginalen/.test(body));
ok("rang FCF-yield = 5 högst (n=16)", rangDesc(b => b.vardering?.fcfYield, 0.0505) === 5 && /femte högsta FCF-avkastningen/.test(body));
ok("rang ROE = 12 av 16", rangDesc(b => b.lonksamhet?.roe, 0.0704) === 12 && /Tolfte av sexton/.test(body));
// utslag rang 4 + näst största förlustår
const utslag = gren.map(b => { const r = b.serier?.resultat; if (!r || r.length < 4) return null; return (Math.max(...r) - Math.min(...r)) / b.serier.omsattning[3]; }).filter(v => v != null).sort((x, y) => y - x);
const mittUtslag = (Math.max(...res) - Math.min(...res)) / oms[3];
ok("utslag rang 4 störst", utslag.indexOf(mittUtslag) === 3);
const forlust = gren.map(b => [Math.min(...(b.serier?.resultat || [0])) / 1e6]).sort((x, y) => x[0] - y[0]);
ok("näst största förlustår", /näst största förlustår/.test(body) && approx(forlust[0][0], -11592, 1) && approx(forlust[1][0], -6746, 1));
ok("störst nordisk: mcap 62,4 > Castellum 58,9", body.includes("62,4") && body.includes("58,9")
  && a.marknadsKapitalMdr > lista.find(b => b.ticker === "CAST.ST").marknadsKapitalMdr);

// ── 6. Juridikgrinden (2007:528) ─────────────────────────────────────────────
const radeord = [/(köp|sälj|beholders?)\s*(denna|denna aktie|aktien)/i, /vi rekommenderar/i, /bra köp/i, /köp denna/i, /sälj dina/i, /investera i balder/i];
for (const rx of radeord) varna("juridik: rådord", !rx.test(body), rx.source);
// "handssignal" får enbart förekomma i negation ("inte en handssignal")
const hs = [...body.matchAll(/handssignal/gi)].length;
const hsNeg = [...body.matchAll(/inte en handssignal/gi)].length;
varna("juridik: handssignal endast negerad", hs === hsNeg, `${hs} förekomster, ${hsNeg} negerade`);
ok("disclaimer-utbildning", /utbildning i metod: inte en rekommendation/.test(body));
ok("juridiklagen", /2007:528/.test(body));
ok("R2-publicering", /Publicering av utkastet är kundens beslut/.test(body));
ok("inga prognoser-scenario", /inga prognoser/.test(body));

// ── 7. Länkar och leveransregler ─────────────────────────────────────────────
const lankar = ["/dataset/fastighet/pb", "/dataset/fastighet/pe", "/dataset/fastighet/ev-ebit", "/dataset/fastighet/fcf-avkastning", "/dataset/fastighet/vardering", "/dataset/fastighet/roe", "/dataset/fastighet/roic", "/dataset/fastighet/netto-marginal", "/dataset/fastighet/omsattning-cagr-5ar", "/dataset/fastighet/resultat-cagr-5ar", "/dataset/fastighet/omsattningstillvaxt-ttm", "/dataset/fastighet/prognos-tillvaxt", "/dataset/fastighet/skuldsattning", "/dataset/fastighet/universumjamforelse", "/bolag/bald-b-st", "/kurser", "/transparens", "/kallor"];
for (const l of lankar) ok(`länk ${l}`, body.includes(l));
ok("extern URL balder.se", body.includes("https://www.balder.se"));
ok("INTE i live-mappen", !fs.existsSync("data/blogg/sa-laser-du-balder-q3-2026.json") && !fs.readdirSync("data/blogg").some(f => f.includes("balder")));
ok("vågskikt-ärlighet", /inte i vågvalideringens domprotokoll/.test(body) && /inte i analysbiblioteket/.test(body));
ok("osatta fält redovisade", /Räntetäckning: \*\*osatt\*\*/.test(body) && /Utdelningsfält: universum saknar/.test(body));

// ── 8. Kö-klar (granskningskö-rader) ─────────────────────────────────────────
const ko = fs.readFileSync("data/blogg-utkast/GRANSKNINGSKO-SAMMANSTALLNING.md", "utf8");
ok("KO huvudrad finns", ko.includes("sa-laser-du-balder-q3-2026.json"));
ok("KO slugrad finns", (ko.match(/sa-laser-du-balder-q3-2026/g) || []).length >= 2);
ok("klaimfil finns", fs.existsSync("data/vakten/auto-s4-1789886103053-s4-u3-ansprak.md"));

console.log(`\nKVD BALDER: ${PASS} PASS · ${FEL} FEL · ${VARN} VARNING`);
process.exit(FEL + VARN > 0 ? 1 : 0);
