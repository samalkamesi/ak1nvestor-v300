#!/usr/bin/env node
// _s3u3o5-kvd-detail.mjs — KVD för B13 detailhandelsaktier (s3-u3, omgång 5)
import fs from "node:fs";

const FIL = "data/blogg-utkast/detailhandelsaktier-sa-analyserar-du-detaljhandelsbolag.json";
const j = JSON.parse(fs.readFileSync(FIL, "utf8"));
const textyta = [j.title, j.description, j.body].join("\n");
let fel = 0, varningar = 0;

// 1) Varumärkesgrind — replik av kontrolleraText (data/varumarke.jsons egna regexer)
const vm = JSON.parse(fs.readFileSync("data/varumarke.json", "utf8"));
for (const r of vm.forbjudnaFraser) {
  const re = new RegExp(r.fran, "giu");
  const traeff = textyta.match(re);
  if (traeff) {
    const allvar = r.allvar === "FEL" ? "FEL" : "VARNING";
    if (allvar === "FEL") fel++; else varningar++;
    console.log(`[${allvar}] varumärke: "${traeff[0]}" (regel: ${r.fran}) — kontext krävs`);
  }
}

// 2) Rådverb-kontroll (juridikgrinden — råd till läsaren om handling)
const rad = textyta.match(/\b(köp|sälj|undvik|investera i|exponera dig mot|ta position)\b[^.]{0,60}(aktie|bolag|portfölj)/giu) || [];
for (const t of rad) { console.log(`[KONTROLL] rådverb-kandidat: "${t.slice(0,70)}"`); }

// 3) Ordräkning (same metod som mallens guider: markdown rensad, whitespace-split)
const ord = j.body.replace(/[#*_\[\]()\/]/g, " ").replace(/https?:\/\/\S+/g, " ").split(/\s+/).filter(Boolean).length;
console.log(`ord: ${ord} (mål 1200, span 800–1400) ${ord >= 800 && ord <= 1400 ? "OK" : "UTANFÖR"}`);

// 4) Längder
console.log(`title ${j.title.length} tkn (≤60) ${j.title.length <= 60 ? "OK" : "FEL"}`);
console.log(`og-desc ${j.description.length} tkn (≤155) ${j.description.length <= 155 ? "OK" : "FEL"}`);
if (j.title.length > 60) fel++;
if (j.description.length > 155) fel++;

// 5) Sökord: primärt i första H2 + ingress (+ title); sekundära närvarande
const body = j.body;
const h2 = body.split("\n").filter(r => r.startsWith("## "));
console.log(`H2:or ${h2.length}: ${h2.map(x => x.replace("## ", "").slice(0, 30)).join(" | ")}`);
console.log(`sökord 'detailhandelsaktier': title=${j.title.toLowerCase().includes("detailhandelsaktier")}, ingress=${body.slice(0, 400).toLowerCase().includes("detailhandelsaktier")}, första H2=${h2[0].toLowerCase().includes("detailhandelsaktier")}`);
for (const sek of ["like-for-like", "bruttomarginal", "kapitalomsättning", "dagligvaruhandel"]) {
  console.log(`sekundärt '${sek}': ${textyta.toLowerCase().includes(sek) ? "finns" : "SAKNAS"}`);
}

// 6) Korslänkar — endast publicerade kurser + poster, inga utkast
const lankar = [...body.matchAll(/\]\((\/(?:kurser|blogg)\/[^)]+)\)/g)].map(m => m[1]);
const kurser = new Set(Object.keys(JSON.parse(fs.readFileSync("public/deep-courses.json", "utf8"))));
const poster = new Set(fs.readdirSync("data/blogg").filter(f => f.endsWith(".json")).map(f => f.replace(".json", "")));
let lankFel = 0;
for (const l of lankar) {
  const id = l.replace("/kurser/", "").replace("/blogg/", "").replace(/\/$/, "");
  if (l.startsWith("/kurser/") && !kurser.has(id)) { console.log(`[FEL] kurslänk okänd: ${l}`); lankFel++; }
  if (l.startsWith("/blogg/") && !poster.has(id)) { console.log(`[FEL] blogglänk okänd: ${l}`); lankFel++; }
}
fel += lankFel;
console.log(`korslänkar: ${lankar.length} st (${lankar.filter(l => l.startsWith("/kurser")).length} kurser + ${lankar.filter(l => l.startsWith("/blogg")).length} poster), okända: ${lankFel}`);

// 7) Aritmetik — guidens räkneexempel omräknade
const a = (namn, got, want, tol = 0.06) => {
  const ok = Math.abs(got - want) <= Math.abs(want) * tol;
  if (!ok) fel++;
  console.log(`aritmetik ${namn}: räknat ${got.toFixed(2)} mot påstått ${want} ${ok ? "OK" : "AVVIKELSE"}`);
};
a("Axfood EK (53,1/7,5)", 53.1 / 7.5, 7.1, 0.02);
a("Axfood kap.omsv (89,2/7,1)", 89.2 / 7.1, 12.6, 0.02);
a("Axfood netto×omsv (procent)", 2.7 * 12.6, 34, 0.03);
a("H&M EK (275,5/8,1)", 275.5 / 8.1, 34, 0.02);
a("H&M kap.omsv (228,3/34)", 228.3 / 34, 6.7, 0.02);
a("H&M netto×omsv (procent)", 5.6 * 6.7, 37, 0.03);
a("Axfood oms-CAGR 3 steg (universumkonvention)", (89.2 / 73.5) ** (1 / 3) * 100 - 100, 6.7, 0.03);
a("H&M resultat-faktor (12,2/3,6)", 12.2 / 3.6, 3.4, 0.02);
a("Axfood PEG (21,9/8,4)", 21.9 / 8.4, 2.6, 0.03);
a("reaexempel EBIT-fall (8/11) > 1/4", (1 - 8 / 11) * 100, 27, 0.06); // "mer än en fjärdedel" = 27,3 %
a("Inditex brutto-gap", 56.5 - 54.1, 2.4, 0.02);

// 8) Universumtal — varje tal i texten mot bolagsunivers.json
const u = JSON.parse(fs.readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const arr = Array.isArray(u) ? u : Object.values(u).flat();
const hm = arr.find(b => b.ticker === "HM-B.ST"), itx = arr.find(b => b.ticker === "ITX.MC"), axf = arr.find(b => b.ticker === "AXFO.ST");
const p = (x, d = 1) => (x * 100).toFixed(d).replace(".", ","); // andel→procent sträng
const pa = [
  ["H&M brutto 54,1", textyta.includes("54,1"), p(hm.lonksamhet.bruttoMarginal) === "54,1"],
  ["Inditex brutto 56,5", textyta.includes("56,5"), p(itx.lonksamhet.bruttoMarginal) === "56,5"],
  ["Axfood brutto 14,8", textyta.includes("14,8"), p(axf.lonksamhet.bruttoMarginal) === "14,8"],
  ["H&M EBIT 11,0", textyta.includes("11,0"), p(hm.lonksamhet.ebitMarginal) === "11,0"],
  ["Inditex EBIT 20,1", textyta.includes("20,1"), p(itx.lonksamhet.ebitMarginal) === "20,1"],
  ["H&M netto 5,6", textyta.includes("5,6"), p(hm.lonksamhet.nettoMarginal) === "5,6"],
  ["Axfood netto 2,7", textyta.includes("2,7"), p(axf.lonksamhet.nettoMarginal) === "2,7"],
  ["H&M ROE 34,7", textyta.includes("34,7"), p(hm.lonksamhet.roe) === "34,7"],
  ["Inditex ROE 34,0", textyta.includes("34,0"), p(itx.lonksamhet.roe) === "34,0"],
  ["Axfood ROE 36,3", textyta.includes("36,3"), p(axf.lonksamhet.roe) === "36,3"],
  ["H&M skuld/EK 2,26", textyta.includes("2,26"), hm.stabilitet.skuldEgenkapital.toFixed(2) === "2.26"],
  ["Axfood skuld/EK 2,24", textyta.includes("2,24"), axf.stabilitet.skuldEgenkapital.toFixed(2) === "2.24"],
  ["Inditex skuld/EK 0,32", textyta.includes("0,32"), itx.stabilitet.skuldEgenkapital.toFixed(2) === "0.32"],
  ["H&M P/B 8,1", textyta.includes("8,1"), hm.vardering.pb.toFixed(1) === "8.1"],
  ["Axfood P/B 7,5", textyta.includes("7,5"), axf.vardering.pb.toFixed(1) === "7.5"],
  ["Axfood P/E 21,9", textyta.includes("21,9"), axf.vardering.pe.toFixed(1) === "21.9"],
  ["Axfood prognos 8,4 (universums notering; fält 8,35)", textyta.includes("8,4"), Math.abs(axf.tillvaxt.prognosTillvaxt * 100 - 8.4) < 0.06],
  ["Inditex TTM +5,8", textyta.includes("5,8"), (itx.tillvaxt.omsattningTillvaxtTTM * 100).toFixed(1) === "5.8"],
];
let paFel = 0;
for (const [namn, iText, sant] of pa) {
  if (iText && !sant) { console.log(`[FEL] universumstal ${namn} stämmer ej mot källa`); paFel++; }
  else if (!iText) console.log(`[not] ${namn}: ej i text`);
}
fel += paFel;
console.log(`universumstal: ${pa.filter(x => x[1] && x[2]).length} påståenden verifierade, ${paFel} fel`);

// 9) Serier från universumet (H&M/Axfood 2022–2025)
const ser = [
  ["H&M oms 236,0", 236.0, hm.serier.omsattning[1] / 1e9],
  ["H&M oms 228,3", 228.3, hm.serier.omsattning[3] / 1e9],
  ["H&M res 3,6", 3.6, hm.serier.resultat[0] / 1e9],
  ["H&M res 12,2", 12.2, hm.serier.resultat[3] / 1e9],
  ["Axfood oms 73,5", 73.5, axf.serier.omsattning[0] / 1e9],
  ["Axfood oms 89,2", 89.2, axf.serier.omsattning[3] / 1e9],
];
for (const [namn, txt, kalla] of ser) {
  const ok = Math.abs(txt - kalla) < 0.06;
  if (!ok) { console.log(`[FEL] serie ${namn}: källa ${kalla.toFixed(2)}`); fel++; }
  else console.log(`serie ${namn}: källa ${kalla.toFixed(2)} OK${textyta.includes(String(txt).replace(".", ",")) ? "" : " (talet ej i text)"}`);
}

// 10) Hygien: mjuka bindestreck, disclaimer-sista-rad, publishedAt, rm
console.log(`mjuka bindestreck: ${(body.match(/\u00AD/g) || []).length}`);
const sista = body.trimEnd().split("\n").pop();
console.log(`disclaimer-sista-rad: ${sista === "_Detta är pedagogisk finansanalys, inte investeringsråd._" ? "OK" : "FEL: " + sista}`);
if (sista !== "_Detta är pedagogisk finansanalys, inte investeringsråd._") fel++;
console.log(`publishedAt ${j.publishedAt}, readingMinutes ${j.readingMinutes} (600-ordskontraktet: ${Math.ceil(ord / 600)})`);

console.log(`\n=== KVD: ${fel} FEL, ${varningar} VARNING ===`);
process.exit(fel === 0 ? 0 : 1);
