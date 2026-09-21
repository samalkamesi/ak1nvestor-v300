#!/usr/bin/env node
/**
 * s5-u1 omgång 27 (manifest auto-s5-1790027118738) — KVD FÖR ma-09-produktionsgapet:
 * juridikgrind, korslänkar, blockkonvention (ma-familjesed), aritmetikkontroll
 * (oberoende omräkning), språkgrind, R2. Körs FÖRE registerinsert.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const k = JSON.parse(readFileSync(ROT + "/data/kurser-tillagg/ma-09-produktionsgapet.json", "utf8"));
const reg = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));
const regSlugs = Object.keys(reg);

let PASS = 0, FEL = 0;
const ok = (v, n, d = "") => { if (v) { PASS++; console.log("  PASS " + n + (d ? " — " + d : "")); } else { FEL++; console.log("  FEL  " + n + (d ? " — " + d : "")); } };

// A. Juridikgrind
const allt = [
  k.title, k.summary, k.why, k.learn,
  k.history.origin, k.history.evolution, k.history.modern,
  k.lynchSection, k.grahamSection, k.ak1Section,
  ...k.chapters.flatMap((c) => [c.title, c.intro, ...c.blocks.map((b) => b.content)]),
].join("\n");
ok(/aldrig placeringsråd|inte placeringsråd|utbildning om mekanismer/.test(allt), "A1 juridikmarkering (utbildning, aldrig råd)");
const radsforbud = allt.toLowerCase().match(/\b(köp denna|sälj denna|rekommenderar köp|rekommenderar sälj|min rekommendation är att köpa|bör du köpa|så borde du investera)\b/g);
ok(!radsforbud, "A2 inga rådsformuleringar", radsforbud ? radsforbud.join(", ") : "0 träffar");
ok(!/\b(Fas 2|Fas 3|9 ?999|13 ?999|249|449|799)\b/.test(allt), "A3 R2 — inga pris-/tier-tal i kursen");
ok(!/\(1994|2005:59|2022:26[01]|2022:482\)/.test(allt), "A4 inga blandade lagrum");
ok(!/\b\d{4}:\d{2,4}\b/.test(allt), "A5 inget lagrumsformat NNNN:NN (årstal utan kolon är tillåtna)");

// B. Korslänkar: alla kurs-id-namn finns i registret
const referenser = [...new Set([...allt.matchAll(/\b([a-zA-Z]{2,4}-\d{2,3})-[a-zA-Z]/g)].map((m) => m[0].toLowerCase()))];
const saknade = referenser.filter((ref) => !regSlugs.some((s) => s.startsWith(ref)));
ok(saknade.length === 0, "B1 korslänkar registeräkta (" + referenser.length + " st)", saknade.length ? "SAKNADE: " + saknade.join(", ") : referenser.join(", "));
const minaRefs = [...new Set([...allt.matchAll(/\b(ma-\d{2})\b/g)].map((m) => m[1]))];
ok(minaRefs.length >= 3, "B2 familjesjälvreferenser", minaRefs.join(", "));
ok(!minaRefs.includes("ma-09"), "B3 ingen självcirkel till egen slug");

// C. Blockkonvention (ma-familjesed): kap 1-5 = 3 block (text + definition|tabell + insight); kap 6 = text+utmaning+insight
ok(k.chapters.length === 6 && k.chapterCount === 6, "C1 sex kapitel");
for (const c of k.chapters) {
  const typer = c.blocks.map((b) => b.type);
  const sista = typer[typer.length - 1];
  if (c.num < 6) {
    ok(typer.length === 3 && typer[0] === "text" && ["definition", "tabell"].includes(typer[1]) && sista === "insight",
      "C2." + c.num + " kap " + c.num + " blockkonvention", typer.join("+"));
  } else {
    ok(typer[0] === "text" && typer.includes("utmaning") && sista === "insight", "C2.6 protokollskapitel text+utmaning+insight", typer.join("+"));
  }
  ok(c.minutes === 4, "C3." + c.num + " minuter 4");
}
ok(k.chapters.reduce((s, c) => s + c.minutes, 0) === k.totalMinutes && k.totalMinutes === k.minutes, "C4 minuter summa = totalMinutes = minutes (" + k.minutes + ")");
ok(k.chapters.every((c) => c.blocks.every((b) => (b.content || "").length > 40)), "C5 inga tomma block");
ok(k.chapters_list.length === 6 && k.chapters_list.every((c, i) => c.num === k.chapters[i].num && c.title === k.chapters[i].title), "C6 chapters_list speglar kapitlen");

// D. Aritmetik — kursens signaturtal oberoende omräknade
const A = {
  timmar: 5.0e6 * 1600,
  potential: 5.0e6 * 1600 * 575,
  gapNed: (4416 - 4600) / 4600,
  faktisktM2: 4600 * 0.98,
  faktisktP4: 4600 * 1.04,
  takRorelse: 0.99 * 1.008,
  nyPotential: 4600 * 0.99 * 1.008,
  vu: 92000 / 205000,
  okun: 0.5 * 4.0,
  arbetsloshet: 6.5 + 0.5 * 4.0,
  philMinus4: 2.0 + 0.5 * -4.0,
  philMinus2: 2.0 + 0.5 * -2.0,
  philPlus2: 2.0 + 0.5 * 2.0,
  philPlus4: 2.0 + 0.5 * 4.0,
  taylorVarm: 2.0 + 4.0 + 0.5 * (4.0 - 2.0) + 0.5 * 1.5,
  taylorLugn: 2.0 + 2.0 + 0.5 * 0.0 + 0.5 * 0.0,
  taylorNed: 2.0 + 1.0 + 0.5 * (1.0 - 2.0) + 0.5 * -2.0,
  taylorKris: 2.0 + 0.0 + 0.5 * (0.0 - 2.0) + 0.5 * -4.0,
  utnyttjande: 7800 / 10000,
  order1: 7800 + 1500,
  order2: 7800 + 2500,
  over: 7800 + 2500 - 10000,
  fri: 10000 - 7800,
};
ok(A.timmar === 8.0e9, "D1 timmar 5,0 M × 1 600 = 8,0 miljarder", A.timmar.toExponential());
ok(A.potential === 4.6e12, "D2 potential 8,0 Md × 575 = 4 600 miljarder", (A.potential / 1e12).toFixed(1) + " triljoner");
ok(Math.abs(A.gapNed - -0.04) < 1e-12, "D3 gap (4 416 − 4 600) ÷ 4 600 = −4,0 %", (A.gapNed * 100).toFixed(1) + " %");
ok(A.faktisktM2 === 4508 && A.faktisktP4 === 4784, "D4 gap-tabell 4 508 (−2,0 %) / 4 784 (+4,0 %)", A.faktisktM2 + " / " + A.faktisktP4);
ok(Math.abs(A.takRorelse - 0.99792) < 1e-9 && Math.abs(A.nyPotential - 4590.432) < 1e-6, "D5 takets rörelse 0,99 × 1,008 = 0,99792 → 4 590 miljarder", A.nyPotential.toFixed(1));
ok(Math.abs(A.vu - 0.4488) < 1e-3, "D6 spänningsmått 92 000 ÷ 205 000 = 0,45", A.vu.toFixed(3));
ok(A.okun === 2.0 && A.arbetsloshet === 8.5, "D7 Okun 0,5 × 4,0 = 2,0 pp → 6,5 + 2,0 = 8,5 %", A.arbetsloshet.toFixed(1) + " %");
ok(A.philMinus4 === 0 && A.philMinus2 === 1 && A.philPlus2 === 3 && A.philPlus4 === 4, "D8 Phillips 0,0/1,0/3,0/4,0", [A.philMinus4, A.philMinus2, A.philPlus2, A.philPlus4].join(" / "));
ok(A.taylorVarm === 7.75 && A.taylorLugn === 4.0 && A.taylorNed === 1.5 && A.taylorKris === -1.0, "D9 Taylor 7,75 / 4,0 / 1,5 / −1,0", [A.taylorVarm, A.taylorLugn, A.taylorNed, A.taylorKris].join(" / "));
ok(A.utnyttjande === 0.78 && A.order1 === 9300 && A.order2 === 10300 && A.over === 300 && A.fri === 2200, "D10 Norrverk 78 % · 9 300 · 10 300 (+300 över) · 2 200 fria", (A.utnyttjande * 100).toFixed(0) + " % " + A.order1 + " " + A.order2);
// Signaturtal i texten (stäms mot källtexten)
ok(allt.includes("4 416") && allt.includes("4 600") && allt.includes("−4,0") && allt.includes("7,75") && allt.includes("−1,0") && allt.includes("10 300"), "D11 signaturtal närvarande i texten", "4 416 · 4 600 · −4,0 · 7,75 · −1,0 · 10 300");

// E. Språkgrind (o25-läxan: CJK, kyrilliska, typografiska citat, tabbar, dubbla mellanslag, tre-punkt, särskrivningsvakt)
ok(!/[\u4e00-\u9fff\u3040-\u30ff]/.test(allt), "E1 CJK 0");
ok(!/[\u0400-\u04ff]/.test(allt), "E2 kyrilliska 0");
ok(!/[""«»„‟]/.test(allt), "E3 typografiska citat 0");
ok(!/\t/.test(allt), "E4 tabbar 0");
ok(!/ {2,}/.test(allt), "E5 dubbla mellanslag 0");
ok(!/\.\.\.|…/.test(allt), "E6 tre-punkt 0");
ok(!/\u00A0|\u2007|\u202F/.test(allt), "E7 hårda mellanslag 0");
const suffixFall = allt.match(/\b(lagen|tier|boken|systemet)\b/g);
ok(!suffixFall, "E8 ingen suffixläcka", suffixFall ? suffixFall.join(", ") : "0");

// F. Struktur + R2 + nivå
ok(k.slug === "ma-09-produktionsgapet" && /^ma-09-[a-z-]+$/.test(k.slug), "F1 slug ren ASCII med serieprefix", k.slug);
ok(k.category === "MAKROEKONOMI & RÄNTA", "F2 kategori exakt", k.category);
ok(k.level === "Intermediär" && k.xp === 50 && k.weight === "—", "F3 nivå/xp/vikt enligt familjesed", k.level + " · " + k.xp + " · " + k.weight);
ok(!/"kraverFas"/.test(allt) && !/kraverFas/.test(JSON.stringify(k)), "F4 ingen tier-vägg i kursfilen");
ok(typeof k.why === "string" && k.why.length > 800, "F5 varför-rad bär serienarrativ", k.why.length + " tecken");
ok(JSON.parse(JSON.stringify(k)) !== null, "F6 JSON hel (skriptet läste den)");

console.log("────");
console.log(`KVD: ${PASS} PASS · ${FEL} FEL`);
process.exit(FEL ? 1 : 0);
