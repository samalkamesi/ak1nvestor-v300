#!/usr/bin/env node
// _s3u1o6-kvd-livsmedel.mjs — KVD för B18 livsmedelsaktier (s3-u1, auto-s3-1789589126587)
// Varumärkesgrind (varumarke.json egna regexer), rådverb-sond, 911, ord/längder,
// sökordsdisciplin, korslänkar mot register, disclaimer, mjuka bindestreck,
// universumstals-påståenden maskinkontrollerade mot bolagsunivers.json.
import fs from "node:fs";

const FIL = "data/blogg-utkast/livsmedelsaktier-sa-analyserar-du-livsmedelsbolag.json";
const j = JSON.parse(fs.readFileSync(FIL, "utf8"));
const yta = [j.title, j.description, j.body].join("\n");
let fel = 0, varningar = 0;
const F = m => { fel++; console.log("[FEL] " + m); };
const OK = m => console.log("[OK]  " + m);

// 1) Varumärkesgrind — replik av kontrolleraText (data/varumarke.jsons egna regexer)
const vm = JSON.parse(fs.readFileSync("data/varumarke.json", "utf8"));
for (const r of vm.forbjudnaFraser) {
  const re = new RegExp(r.fran, "giu");
  const t = yta.match(re);
  if (t) {
    if (r.allvar === "FEL") { fel++; console.log(`[FEL] varumärke: "${t[0]}" (regel: ${r.fran})`); }
    else { varningar++; console.log(`[VARNING] varumärke: "${t[0]}" (regel: ${r.fran}) — kontext krävs`); }
  }
}
console.log(`varumärkesgrind: ${vm.forbjudnaFraser.length} regexer — ${fel} FEL, ${varningar} VARNING (fria positiva OK efter kontextläsning)`);

// 2) Rådverb-kontroll (juridikgrinden)
const rad = yta.match(/\b(köp|sälj|undvik|investera i|exponera dig mot|ta position)\b[^.]{0,60}(aktie|bolag|portfölj)/giu) || [];
for (const t of rad) console.log(`[KONTROLL] rådverb-kandidat: "${t.slice(0,70)}"`);

// 3) Ordräkning (mallens metod: markdown rensad, whitespace-split)
const ord = j.body.replace(/[#*_\[\]()\/]/g, " ").replace(/https?:\/\/\S+/g, " ").split(/\s+/).filter(Boolean).length;
console.log(`ord: ${ord} (mål 1200, span 800–1400) ${ord >= 800 && ord <= 1400 ? "OK" : "UTANFÖR"}`);
if (ord < 800 || ord > 1400) fel++;

// 4) Längder
if (j.title.length > 60) F(`title ${j.title.length} tkn > 60`); else OK(`title ${j.title.length} tkn (≤60)`);
if (j.description.length > 155) F(`og-desc ${j.description.length} tkn > 155`); else OK(`og-desc ${j.description.length} tkn (≤155)`);

// 5) Sökordsdisciplin
const body = j.body;
const h2 = body.split("\n").filter(r => r.startsWith("## "));
console.log(`H2:or ${h2.length}: ${h2.map(x => x.replace("## ", "").slice(0, 34)).join(" | ")}`);
const sok = "livsmedelsaktier";
const sTitle = j.title.toLowerCase().includes(sok), sIng = body.slice(0, 400).toLowerCase().includes(sok), sH2 = h2[0].toLowerCase().includes(sok);
console.log(`sökord '${sok}': title=${sTitle}, ingress=${sIng}, första H2=${sH2}`);
if (!(sTitle && sIng && sH2)) F("sökord saknas i title/ingress/första H2");
for (const sek of ["organisk tillväxt", "bruttomarginal", "varumärke", "prissättning"]) {
  if (!yta.toLowerCase().includes(sek)) F(`sekundärt sökord saknas: ${sek}`);
}
OK("sekundära sökord: organisk tillväxt, bruttomarginal, varumärke, prissättning — alla närvarande");

// 6) 911-kontroll
const nioelva = ['911', '11 september', 'september 2001', '9/11', 'terror', 'terrordåd'].filter(p => yta.toLowerCase().includes(p.toLowerCase()));
nioelva.length === 0 ? OK("911 = 0 träffar på 6 mönster") : F("911-träffar: " + nioelva.join(", "));

// 7) Mjuka bindestreck och smuts
/\u00AD|\u200B|\u200C|\u200D/.test(j.body) ? F("mjuka bindestreck/nollbreddstecken i body") : OK("0 mjuka bindestreck");

// 8) Korslänkar — endast publicerade kurser + poster, inga utkast
const lankar = [...body.matchAll(/\]\((\/(?:kurser|blogg)\/[^)]+)\)/g)].map(m => m[1]);
const kurser = new Set(Object.keys(JSON.parse(fs.readFileSync("public/deep-courses.json", "utf8"))));
const poster = new Set(fs.readdirSync("data/blogg").filter(f => f.endsWith(".json")).map(f => f.replace(".json", "")));
let lankFel = 0;
for (const l of lankar) {
  const id = l.replace("/kurser/", "").replace("/blogg/", "").replace(/\/$/, "");
  if (l.startsWith("/kurser/") && !kurser.has(id)) { lankFel++; console.log(`[FEL] kurslänk okänd: ${l}`); }
  if (l.startsWith("/blogg/") && !poster.has(id)) { lankFel++; console.log(`[FEL] blogglänk okänd: ${l}`); }
}
fel += lankFel;
console.log(`korslänkar: ${lankar.length} st (${lankar.filter(l => l.startsWith("/kurser")).length} kurser + ${lankar.filter(l => l.startsWith("/blogg")).length} poster), okända: ${lankFel}`);

// 9) Aritmetik — räkneexemplen omräknade
const a = (namn, got, want, tol = 0.05) => {
  const ok = Math.abs(got - want) <= Math.abs(want) * tol;
  if (!ok) fel++;
  console.log(`aritmetik ${namn}: räknat ${got.toFixed(3)} mot påstått ${want} ${ok ? "OK" : "AVVIKELSE"}`);
};
a("pris×volym (1,04×0,99)", (1.04 * 0.99 - 1) * 100, 3.0, 0.02);
a("råvarufall ny marginal (100−49,5)", 100 - 45 * 1.1, 50.5, 0.01);
a("råvarufall pp", 55 - (100 - 45 * 1.1), 4.5, 0.02);
a("prisad marginal ((103−49,5)/103)", ((103 - 49.5) / 103) * 100, 51.9, 0.01);
a("PEP/KO oms-förhållande 'nästan dubbelt'", 93925 / 47941, 1.96, 0.03);
a("PEP/KO börsvärde 'hälften'", 183.67 / 381.68, 0.48, 0.06);
a("CARL förlust/oms 'mer än hälften'", 40788 / 73585, 0.55, 0.03);
a("KO FCF2012? nej — FCF2022/resultat2022 'i nivå'", 9534 / 9542, 1.0, 0.02);
a("KO FCF2025/resultat2025", 5296 / 13107, 0.40, 0.06);
a("multipelspann 'nästan tio enheter'", 27.39 - 17.76, 9.6, 0.05);
a("ROIC-gap 'nästan jämna' (<1 pp)", Math.abs(19.38 - 20.1), 0.7, 0.45);

// 10) Universumtal — varje tal i texten mot bolagsunivers.json
const u = JSON.parse(fs.readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const arr = Array.isArray(u) ? u : Object.values(u).flat();
const ko = arr.find(b => b.ticker === "KO"), pep = arr.find(b => b.ticker === "PEP"),
      nes = arr.find(b => b.ticker === "NESN.SW"), car = arr.find(b => b.ticker === "CARL-B.CO");
const p = (x, d = 1) => (x * 100).toFixed(d).replace(".", ",");
const m = (x, d = 1) => Number(x).toFixed(d).replace(".", ",");
const pa = [
  ["KO P/E 26,7", "26,7", m(ko.vardering.pe)],
  ["KO brutto 61,9", "61,9", p(ko.lonksamhet.bruttoMarginal)],
  ["KO ROE 42,1", "42,1", p(ko.lonksamhet.roe)],
  ["KO ROIC 20,1", "20,1", p(ko.lonksamhet.roic)],
  ["KO skuld/EK 1,16", "1,16", ko.stabilitet.skuldEgenkapital.toFixed(2).replace(".", ",")],
  ["KO oms 2025 47,9", "47,9", (ko.serier.omsattning[3] / 1e9).toFixed(1).replace(".", ",")],
  ["KO resultat 2025 13,1", "13,1", (ko.serier.resultat[3] / 1e9).toFixed(1).replace(".", ",")],
  ["KO FCF 2022 9,5", "9,5", (ko.serier.fcf[0] / 1e9).toFixed(1).replace(".", ",")],
  ["KO FCF 2025 5,3", "5,3", (ko.serier.fcf[3] / 1e9).toFixed(1).replace(".", ",")],
  ["KO mktcap 381,7", "381,7", ko.marknadsKapitalMdr.toFixed(1).replace(".", ",")],
  ["KO prognos 2,1", "2,1", p(ko.tillvaxt.prognosTillvaxt)],
  ["KO PEG 12,6", "12,6", ko.vardering.peg.toFixed(1).replace(".", ",")],
  ["PEP P/E 17,8", "17,8", m(pep.vardering.pe)],
  ["PEP brutto 54,2", "54,2", p(pep.lonksamhet.bruttoMarginal)],
  ["PEP ROE 51,5", "51,5", p(pep.lonksamhet.roe)],
  ["PEP ROIC 19,4", "19,4", p(pep.lonksamhet.roic)],
  ["PEP skuld/EK 2,39", "2,39", pep.stabilitet.skuldEgenkapital.toFixed(2).replace(".", ",")],
  ["PEP oms 2022 86,4", "86,4", (pep.serier.omsattning[0] / 1e9).toFixed(1).replace(".", ",")],
  ["PEP oms 2025 93,9", "93,9", (pep.serier.omsattning[3] / 1e9).toFixed(1).replace(".", ",")],
  ["PEP resultat 8,2", "8,2", (pep.serier.resultat[3] / 1e9).toFixed(1).replace(".", ",")],
  ["PEP mktcap 183,7", "183,7", pep.marknadsKapitalMdr.toFixed(1).replace(".", ",")],
  ["PEP moat-medel 54,3", "54,3", p(pep.moat.bruttoMarginalMedel5ar)],
  ["PEP moat-spread 1,6", "1,6", p(pep.moat.bruttoMarginalSpread5ar)],
  ["PEP PEG 1,25", "1,25", pep.vardering.peg.toFixed(2).replace(".", ",")],
  ["PEP omsCAGR 2,8", "2,8", p(pep.tillvaxt.omsattningCAGR5ar)],
  ["NESN P/E 27,4", "27,4", m(nes.vardering.pe)],
  ["NESN brutto 45,7", "45,7", p(nes.lonksamhet.bruttoMarginal)],
  ["NESN oms 2022 94,8", "94,8", (nes.serier.omsattning[0] / 1e9).toFixed(1).replace(".", ",")],
  ["NESN oms 2025 89,9", "89,9", (nes.serier.omsattning[3] / 1e9).toFixed(1).replace(".", ",")],
  ["NESN omsCAGR 1,8 (minus i text)", "1,8", p(Math.abs(nes.tillvaxt.omsattningCAGR5ar))],
  ["NESN PEG 0,45", "0,45", nes.vardering.peg.toFixed(2).replace(".", ",")],
  ["CARL P/E 18,2", "18,2", m(car.vardering.pe)],
  ["CARL brutto 45,0", "45,0", p(car.lonksamhet.bruttoMarginal)],
  ["CARL oms 2023 73,6", "73,6", (car.serier.omsattning[1] / 1e9).toFixed(1).replace(".", ",")],
  ["CARL resultat 2023 −40,8", "40,8", (Math.abs(car.serier.resultat[1]) / 1e9).toFixed(1).replace(".", ",")],
  ["CARL resultat 2024 9,1", "9,1", (car.serier.resultat[2] / 1e9).toFixed(1).replace(".", ",")],
  ["CARL resultat 2025 6,0", "6,0", (car.serier.resultat[3] / 1e9).toFixed(1).replace(".", ",")],
];
let paFel = 0;
for (const [namn, iText, kalla] of pa) {
  if (!yta.includes(iText)) { console.log(`[not] ${namn}: ej i text`); continue; }
  if (iText !== kalla) { paFel++; console.log(`[FEL] universumstal ${namn}: källa ${kalla}`); }
}
fel += paFel;
console.log(`universumstal: ${pa.length} påståenden kontrollerade, ${paFel} fel`);

// 10b) NESN forward-P/E 17,0 — står i universumets notering (27,39/17,04)
if (!String(nes.notering).includes("17,04")) F("NESN fwd-P/E 17,04 finns ej i universumets notering"); else OK("NESN fwd 17,0 ← noteringens 17,04");

// 10c) Konsumentmedianer — räknade ur universumet (n, median, kvartiler)
const kons = arr.filter(b => b.bransch === "konsument" && b.vardering?.pe != null).map(b => b.vardering.pe).sort((x, y) => x - y);
const pct = q => { const i = (kons.length - 1) * q, lo = Math.floor(i), hi = Math.min(lo + 1, kons.length - 1); return kons[lo] + (kons[hi] - kons[lo]) * (i - lo); };
const medV = kons.length % 2 ? kons[(kons.length - 1) / 2] : (kons[kons.length / 2 - 1] + kons[kons.length / 2]) / 2;
const medTxt = m(medV), p25 = m(pct(0.25)), p75 = m(pct(0.75));
console.log(`konsumentgren: n=${kons.length}, median=${medTxt}, P25=${p25}, P75=${p75} (texten: 20,4 / 17,9–22,4 / 14 bolag)`);
const medianOK = medTxt === "20,4" && p25 === "17,9" && p75 === "22,4" && kons.length === 14 && yta.includes("20,4") && yta.includes("17,9–22,4") && yta.includes("14 bolag");
if (!medianOK) F("medianformuleringen avviker från universums räkning"); else OK("median/kvartiler/n i text = universums egna tal");

// 11) Hygien: disclaimer-sista-rad, publishedAt, rm
const sista = j.body.trim().split("\n").slice(-1)[0].trim();
console.log(`disclaimer-sista-rad: ${sista === "_Detta är pedagogisk finansanalys, inte investeringsråd._" ? "OK" : "FEL: " + sista}`);
if (sista !== "_Detta är pedagogisk finansanalys, inte investeringsråd._") fel++;
console.log(`publishedAt ${j.publishedAt}, readingMinutes ${j.readingMinutes} (600-ordskontraktet: ${Math.round(ord / 600)})`);
if (j.readingMinutes !== Math.round(ord / 600)) F("readingMinutes ≠ kontraktet");

console.log(`\n=== KVD B18 livsmedelsaktier: ${fel} FEL, ${varningar} VARNING ===`);
process.exit(fel > 0 ? 1 : 0);
