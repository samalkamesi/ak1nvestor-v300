#!/usr/bin/env node
// _s3u1-1789630527583-kvd-lakemedel-en.mjs — KVD för Ö3 lakemedelsaktier-en (s3-u1, auto-s3-1789630527583)
import fs from "node:fs";

const FIL = "data/blogg-utkast/lakemedelsaktier-sa-analyserar-du-lakemedelsbolag-en.json";
const ORIG = "data/blogg-utkast/lakemedelsaktier-sa-analyserar-du-lakemedelsbolag.json";
const j = JSON.parse(fs.readFileSync(FIL, "utf8"));
const orig = JSON.parse(fs.readFileSync(ORIG, "utf8"));
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
    console.log(`[${allvar}] varumärke: "${traeff[0]}" (regel: ${r.fran})`);
  }
}

// 2) Rådverb-kontroll EN+SV (juridikgrinden — råd till läsaren om handling)
const rad = textyta.match(/\b(buy|sell|avoid|recommend|invest in|take a position|expose yourself to|köp|sälj|undvik|investera i|exponera dig mot)\b[^.]{0,60}(stock|share|company|portfolio|aktie|bolag|portfölj)/giu) || [];
for (const t of rad) { console.log(`[KONTROLL] rådverb-kandidat: "${t.slice(0,70)}"`); }
const should = textyta.match(/\byou should\b[^.]{0,60}/giu) || [];
for (const t of should) { console.log(`[KONTROLL] 'you should': "${t.slice(0,70)}"`); }

// 3) Ordräkning (samme metod som mallen: markdown rensad, whitespace-split)
const ord = j.body.replace(/[#*_\[\]()\/]/g, " ").replace(/https?:\/\/\S+/g, " ").split(/\s+/).filter(Boolean).length;
console.log(`ord: ${ord} (mål ~1200, span 800–1400) ${ord >= 800 && ord <= 1400 ? "OK" : "UTANFÖR"}`);
if (ord < 800 || ord > 1400) fel++;

// 4) Längder
console.log(`title ${j.title.length} tkn (≤60) ${j.title.length <= 60 ? "OK" : "FEL"}`);
console.log(`og-desc ${j.description.length} tkn (≤155) ${j.description.length <= 155 ? "OK" : "FEL"}`);
if (j.title.length > 60) fel++;
if (j.description.length > 155) fel++;

// 5) Sökord: primärt i title + ingress + första H2; sekundära närvarande
const body = j.body;
const h2 = body.split("\n").filter(r => r.startsWith("## "));
console.log(`H2:or ${h2.length}: ${h2.map(x => x.replace("## ", "").slice(0, 32)).join(" | ")}`);
const kw = "pharmaceutical stocks";
console.log(`sökord '${kw}': title=${j.title.toLowerCase().includes(kw)}, ingress=${body.slice(0, 450).toLowerCase().includes(kw)}, H2=${h2.some(h => h.toLowerCase().includes(kw))}`);
if (!j.title.toLowerCase().includes(kw) || !body.slice(0, 450).toLowerCase().includes(kw) || !h2.some(h => h.toLowerCase().includes(kw))) fel++;
for (const sek of ["biotech", "pipeline", "patent cliff", "runway"]) {
  const finns = textyta.toLowerCase().includes(sek);
  if (!finns) { console.log(`[FEL] sekundärt sökord SAKNAS: ${sek}`); fel++; }
}
console.log("sekundära biotech/pipeline/patent cliff/runway: alla kontrollerade");

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
// Länkparitet med originalet: EXAKT samma uppsättning URL:er
const lankarOrig = [...orig.body.matchAll(/\]\((\/(?:kurser|blogg)\/[^)]+)\)/g)].map(m => m[1]).sort();
const lankarEn = [...lankar].sort();
const paritet = JSON.stringify(lankarOrig) === JSON.stringify(lankarEn);
console.log(`länkparitet originalet↔en: ${paritet ? "IDENTISK (" + lankarEn.length + " st)" : "AVVIKELSE"}`);
if (!paritet) { console.log(`  orig: ${lankarOrig.join(" ")}`); console.log(`  en:   ${lankarEn.join(" ")}`); fel++; }

// 7) Aritmetik — guidens räkneexempel omräknade
const a = (namn, got, want, tol = 0.02) => {
  const ok = Math.abs(got - want) <= Math.abs(want) * tol;
  if (!ok) fel++;
  console.log(`aritmetik ${namn}: räknat ${got.toFixed(2)} mot påstått ${want} ${ok ? "OK" : "AVVIKELSE"}`);
};
a("runway 1200/100", 1200 / 100, 12);
a("riskjusterat värde 20×0,7", 20 * 0.7, 14);
a("patentexempel kvarvarande år 20−(2034−2020)", 20 - (2034 - 2020), 6);

// 8) Talparitet — nyckeltalen finns i BÅDE originalet och översättningen
const tal = ["109", "20 years", "2020", "2034", "15–25", "1,200", "100 million", "12 quarters", "SEK 20 billion", "70 percent", "SEK 14 billion", "one in ten"];
for (const t of tal) {
  const iEn = j.body.includes(t);
  if (!iEn) { console.log(`[FEL] talparitet SAKNAS i en: "${t}"`); fel++; }
}
console.log(`talparitet: ${tal.length} nyckeltal kontrollerade mot en-texten`);

// 9) Struktur — disclaimer-sista-rad, slugformat, readingMinutes
const sista = body.trim().split("\n").pop().trim();
const disc = sista.startsWith("_This is educational financial analysis, not investment advice._");
console.log(`disclaimer-sista-rad: ${disc ? "OK" : "SAKNAS (" + sista.slice(0, 50) + ")"}`);
if (!disc) fel++;
const slugOk = /^[a-z0-9-]+$/.test(j.slug) && j.slug === orig.slug + "-en";
console.log(`slug '${j.slug}' (orig+-en): ${slugOk ? "OK" : "FEL"}`);
if (!slugOk) fel++;
const rmOk = j.readingMinutes >= 2 && j.readingMinutes <= 4;
console.log(`readingMinutes ${j.readingMinutes}: ${rmOk ? "OK" : "KONTROLLERA"}`);
if (!rmOk) fel++;

console.log(`\nSLUTSATS: ${fel} FEL, ${varningar} varningar — ${fel === 0 ? "GRÖN" : "EJ GRÖN"}`);
process.exit(fel === 0 ? 0 : 1);
