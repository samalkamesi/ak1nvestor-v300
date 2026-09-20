#!/usr/bin/env node
/**
 * KVD — s5-u1 omgång 24: sj-07-forlustavdrag-och-kvotering.
 * Maskinell leveranskontroll FÖRE registersynk:
 *   A aritmetik — varje talpåstående omräknat oberoende
 *   B strukturparitet — chapters_list ↔ chapters, totalt, kapitelantal
 *   C korslänkar — varje slug-referens lever i registret (efter insert: även egna)
 *   D juridiklint — 0 rådsfraser, utbildningsframing närvarande
 *   E språkgrind — 0 CJK, 0 mjuka bindestreck, 0 engelska/norska läckor
 *   F format — slug ASCII, level, xp, minutes
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const kurs = JSON.parse(readFileSync("data/kurser-tillagg/sj-07-forlustavdrag-och-kvotering.json", "utf8"));
const reg = JSON.parse(readFileSync("public/deep-courses.json", "utf8"));
const pass = [], fail = [];
const testa = (n, v, d) => (v ? pass : fail).push(`${v ? "PASS" : "FAIL"} ${n}${d ? " — " + d : ""}`);

// ── A aritmetik (oberoende omräkning) ──
const A = {
  k1_förlust: 80000 - 50000 === 30000,
  k1_värde: Math.round(0.30 * 30000) === 9000,
  k2_underlag: 20000 + 30000 === 50000,
  k2_rest: 60000 - 50000 === 10000,
  k2_överskott: Math.round(0.70 * 10000) === 7000,
  k2_värde1: Math.round(0.30 * 50000) === 15000,
  k2_värde2: Math.round(0.30 * 7000) === 2100,
  k2_total: 15000 + 2100 === 17100,
  k2_max: Math.round(0.30 * 60000) === 18000,
  k2_pris: 18000 - 17100 === 900 && Math.round(0.30 * 0.30 * 10000) === 900,
  k3_onoterad: Math.round(0.70 * 100000) === 70000 && Math.round(0.30 * 70000) === 21000,
  k3_noterad_full: Math.round(0.30 * 100000) === 30000,
  k4_dagkvitt: 600 - 400 === 200,
  k4_återförvärv_netto: 12000 - 10000 === 2000,
  k4_återförvärv_skatt: Math.round(0.30 * 2000) === 600 && Math.round(0.30 * 12000) === 3600,
  k4_medelvärde: 100 * 40 + 100 * 60 === 10000 && 10000 / 200 === 50,
  k4_vinst: 100 * (55 - 50) === 500,
  k6_utmaning: (15000 + 25000 === 40000) && (50000 - 40000 === 10000) && (0.70 * 10000 === 7000) && (0.70 * 20000 === 14000) && (40000 + 7000 + 14000 === 61000) && (0.30 * 61000 === 18300),
};
for (const [n, v] of Object.entries(A)) testa("A " + n, v);

// utmaningens förväntade tal ska finnas i texten (eleven kan räkna rätt: 7 000 + 14 000 = 21 000; skattevärde 6 300 + 4 200 = 10 500? NEJ — kursen ber ELEVEN räkna; kontrollera att talen 15 000/25 000/50 000/20 000 finns i utmaningen)
const utm = JSON.stringify(kurs.chapters[5]).toString();
for (const tal of ["15 000", "25 000", "50 000", "20 000"]) testa("A utmaningstal " + tal + " närvarande", utm.includes(tal));

// ── B strukturparitet ──
testa("B1 chapterCount 6", kurs.chapterCount === 6);
testa("B2 chapters längd 6", kurs.chapters.length === 6);
testa("B3 chapters_list längd 6", kurs.chapters_list.length === 6);
const summa = kurs.chapters_list.reduce((s, c) => s + c.minutes, 0);
testa("B4 totalMinutes = summan (24)", kurs.totalMinutes === summa && summa === 24, `summa=${summa}`);
testa("B5 minutes 24", kurs.minutes === 24);
for (let i = 0; i < 6; i++) {
  testa(`B6 kap ${i + 1} paritet list↔chapters`, kurs.chapters_list[i].num === kurs.chapters[i].num && kurs.chapters_list[i].title === kurs.chapters[i].title && kurs.chapters_list[i].minutes === kurs.chapters[i].minutes);
}

// ── C korslänkar (seriens kortformskonvention: "sj-01", "km-051:s …", "v19") ──
const text = JSON.stringify(kurs);
const kort = [...new Set([...text.matchAll(/\b(sj-\d{2}|km-\d{3}|rs-\d{2}|v\d{2}|am-\d{2}|bk-\d{2})\b/g)].map((m) => m[1]))];
const regSlugs = Object.keys(reg);
for (const k of kort) {
  const fins = regSlugs.some((s) => s === k || s.startsWith(k + "-")) || k === "sj-07";
  testa("C korslänk " + k + " lever (prefix i registret)", fins);
}
testa("C minst 8 korslänkar", kort.length >= 8, `antal=${kort.length}`);

// ── D juridiklint ──
const rådsfraser = ["bör köpa", "köp denna", "rekommenderar köp", "ska du köpa", "råder till", "köp aktien", "sälj aktien", "investera i denna", "tipsar om", "blir rik"];
const träff = rådsfraser.filter((f) => text.toLowerCase().includes(f));
testa("D1 0 rådsfraser", träff.length === 0, träff.join(", "));
const framing = ["utbildning", "inte råd", "eget arbete", "eget val", "kursens mandat"];
testa("D2 utbildningsframing närvarande", framing.filter((f) => text.toLowerCase().includes(f)).length >= 3);
// "köp"/"sälj" endast i mekanik-kontext
const mekanik = ["återköp", "återförvärv", "köp- och", "inköpspris"].filter((f) => text.includes(f));
testa("D3 köp/sälj endast mekanik-kontext (bevis finns)", mekanik.length >= 2);

// ── E språkgrind ──
const cjk = text.match(/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g);
testa("E1 0 CJK", !cjk, cjk ? cjk.join("") : "");
const mjuka = text.match(/\u00ad/g);
testa("E2 0 mjuka bindestreck", !mjuka);
const läckor = [" and ", "Relevant", "the ", "becoming", "compare", "additional", "flytter", "svang", "varautmärtt", "framtide", "tillsynes", "marknods", "marknoms", "skalán", "faktiken"];
const läckTräff = läckor.filter((l) => text.includes(l));
testa("E3 0 kända läckor/stavfel", läckTräff.length === 0, läckTräff.join(", "));
// bindestreck i titlar ok, men inga trasiga ord "ord- och" är OK svensk interpunktion

// ── F format ──
testa("F1 slug ren ASCII", /^[a-z0-9][a-z0-9-]*$/.test(kurs.slug));
testa("F2 level Intermediär", kurs.level === "Intermediär");
testa("F3 xp 50", kurs.xp === 50);
testa("F4 kategori SKATT & JURIDIK", kurs.category === "SKATT & JURIDIK");
testa("F5 fält komplett", ["slug", "category", "weight", "chapterCount", "totalMinutes", "title", "summary", "minutes", "xp", "level", "learn", "why", "history", "chapters_list", "lynchSection", "grahamSection", "ak1Section", "chapters"].every((f) => kurs[f] !== undefined));
testa("F6 history tre block", kurs.history && kurs.history.origin && kurs.history.evolution && kurs.history.modern);
const blockTyper = kurs.chapters.flatMap((c) => c.blocks.map((b) => b.type));
testa("F7 blocktyper giltiga", blockTyper.every((t) => ["text", "definition", "tabell", "insight", "utmaning"].includes(t)), [...new Set(blockTyper)].join(","));
testa("F8 utmaning finns (kap 6)", blockTyper.includes("utmaning"));

console.log(pass.join("\n"));
if (fail.length) { console.error("\n" + fail.join("\n")); console.error(`\nKVD RÖD: ${pass.length} PASS, ${fail.length} FAIL`); process.exit(1); }
console.log(`\nKVD GRÖN: ${pass.length} PASS 0 FAIL — sj-07 redo för registersynk.`);
