#!/usr/bin/env node
/**
 * KVD — s5-u1 manifest auto-s5-1789766125084 (omgång 17): rs-07-leverantorsrisken.
 * Kvalitetsverifiering EFTER synkkedja (round-trip mot registret) med samma
 * grindar som o16: struktur, aritmetik (oberoende omräknad), korslänkar
 * (registeräkta prefix), juridikgrind, R2, registerläge, språkgrind (parsad text).
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const MIN = "rs-07-leverantorsrisken";
const kurs = JSON.parse(readFileSync(ROT + "/data/kurser-tillagg/" + MIN + ".json", "utf8"));
const reg = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));
const kartaText = readFileSync(ROT + "/src/lib/larvag-karta.ts", "utf8");
const pass = [], fail = [];
const testa = (namn, villkor, detalj) => (villkor ? pass : fail).push(`${villkor ? "PASS" : "FAIL"} ${namn}${detalj ? " — " + detalj : ""}`);

// ── 1. Round-trip: kursfil ≡ registerpost (djup) ─────────────────────────────
const regK = reg[MIN];
testa("1.1 registeräkthet: " + MIN + " i registret", !!regK);
const rt = (a, b, väg) => {
  if (typeof a !== typeof b) return väg;
  if (typeof a !== "object" || a === null) return a === b ? null : väg + ": «" + a + "» ≠ «" + b + "»";
  const fel = [];
  if (Array.isArray(a)) { if (a.length !== b.length) return väg + ": längd " + a.length + "≠" + b.length; for (let i = 0; i < a.length; i++) { const f = rt(a[i], b[i], väg + "[" + i + "]"); if (f) fel.push(f); } }
  else { for (const nyckel of new Set([...Object.keys(a), ...Object.keys(b)])) { if (!(nyckel in a)) return väg + "." + nyckel + " finns bara i registret"; if (!(nyckel in b)) return väg + "." + nyckel + " finns bara i kursfilen"; const f = rt(a[nyckel], b[nyckel], väg + "." + nyckel); if (f) fel.push(f); } }
  return fel.length ? fel[0] : null;
};
const diff = rt(kurs, regK, "root");
testa("1.2 round-trip kursfil ≡ registerpost (djup)", diff === null, diff);

// ── 2. Struktur ──────────────────────────────────────────────────────────────
const fält = ["slug","category","weight","chapterCount","totalMinutes","title","summary","minutes","xp","level","learn","why","history","chapters_list","lynchSection","grahamSection","ak1Section","chapters"];
testa("2.1 alla 18 schemafält", fält.every((f) => f in kurs), fält.filter((f) => !(f in kurs)).join(","));
testa("2.2 category RISK + level Intermediär + xp 50", kurs.category === "RISK" && kurs.level === "Intermediär" && kurs.xp === 50);
testa("2.3 6 kapitel à 4 min = 24 (chapters = chapterCount = totalMinutes = minutes)", kurs.chapters.length === 6 && kurs.chapterCount === 6 && kurs.chapters.every((c) => c.minutes === 4) && kurs.chapters.reduce((s, c) => s + c.minutes, 0) === 24 && kurs.totalMinutes === 24 && kurs.minutes === 24);
testa("2.4 chapters_list-paritet (num+titel+minuter)", JSON.stringify(kurs.chapters_list) === JSON.stringify(kurs.chapters.map((c) => ({ num: c.num, title: c.title, minutes: c.minutes }))));
const blockTyper = kurs.chapters.flatMap((c) => c.blocks.map((b) => b.type));
const typräkning = blockTyper.reduce((a, t) => (a[t] = (a[t] || 0) + 1, a), {});
testa("2.5 blocktyper text 6 · definition 2 · tabell 2 · insight 6 · utmaning 1", typräkning.text === 6 && typräkning.definition === 2 && typräkning.tabell === 2 && typräkning.insight === 6 && typräkning.utmaning === 1, JSON.stringify(typräkning));
testa("2.6 varje kapitel har intro + minst 2 block", kurs.chapters.every((c) => typeof c.intro === "string" && c.intro.length > 20 && c.blocks.length >= 2));
testa("2.7 history: origin + evolution + modern", kurs.history && Object.keys(kurs.history).length === 3);
testa("2.8 tre mästarsektioner icke-tomma", ["lynchSection","grahamSection","ak1Section"].every((s) => kurs[s].length > 300));

// ── 3. Aritmetik — oberoende omräknad ────────────────────────────────────────
const txt = JSON.stringify(kurs);
const A = {
  "inköp 780,0 = 65,0 % av 1 200,0": 780.0 / 1200.0 === 0.65,
  "största 405,6/780,0 = 52,0 %": 405.6 / 780.0 === 0.52,
  "tre största 405,6+156,0+78,0 = 639,6": 405.6 + 156.0 + 78.0 === 639.6,
  "639,6/780,0 = 82,0 %": Math.abs(639.6 / 780.0 - 0.82) < 0.0005,
  "marginal 96,0/1 200,0 = 8,0 %": 96.0 / 1200.0 === 0.08,
  "påslag 405,6×0,080 = 32,4": Math.abs(405.6 * 0.08 - 32.4) < 0.05,
  "32,4/96,0 = 33,75 % exakt (kursen redovisar 33,8 avrundat)": Math.abs((32.4 / 96.0) * 100 - 33.75) < 0.001,
  "resultat efter 96,0−32,4 = 63,6": 96.0 - 32.4 === 63.6,
  "marginal efter 63,6/1 200,0 = 5,3 %": Math.abs(63.6 / 1200.0 - 0.053) < 0.0005,
  "stopp 6/48 = 12,5 %": 6 / 48 === 0.125,
  "förlorad intäkt 1 200,0×0,125 = 150,0": 1200.0 * 0.125 === 150.0,
  "förlorad täckning 150,0×0,30 = 45,0": 150.0 * 0.3 === 45.0,
  "45,0/96,0 = 46,9 %": Math.abs(45.0 / 96.0 - 0.469) < 0.0005,
  "halva volymen 405,6/2 = 202,8": 405.6 / 2 === 202.8,
  "premie 202,8×0,030 = 6,1": Math.abs(202.8 * 0.03 - 6.1) < 0.05,
  "förväntad stoppkostnad 0,10×45,0 = 4,5": 0.1 * 45.0 === 4.5,
  "maktbalans specialist 405,6/675,0 = 60,1 %": Math.abs(405.6 / 675.0 - 0.601) < 0.0005,
  "maktbalans jätte 405,6/13 500,0 = 3,0 %": Math.abs(405.6 / 13500.0 - 0.03) < 0.0005,
  "kvalificeringsglapp 24−6 = 18": 24 - 6 === 18,
  "rabatt 405,6×0,03 = 12,2": Math.abs(405.6 * 0.03 - 12.2) < 0.05,
};
for (const [namn, ok] of Object.entries(A)) testa("3.x aritmetik: " + namn, ok);
// signaturtalen närvarande i kurstexten (parsad)
const texter = [];
(function samla(o){ if (typeof o === "string") texter.push(o); else if (Array.isArray(o)) o.forEach(samla); else if (o && typeof o === "object") Object.values(o).forEach(samla); })(kurs);
const allt = texter.join("\n");
const signaturTal = ["1 200,0","780,0","405,6","156,0","78,0","639,6","96,0","8,0 procent","65,0 procent","52,0 procent","82,0 procent","32,4","33,8","63,6","5,3","48","12,5","150,0","45,0","46,9","202,8","6,1","4,5","675,0","60,1","13 500,0","3,0 procent","38,0","24 månader","18,0 procent","12,2"];
const saknasTal = signaturTal.filter((t) => !allt.includes(t));
testa("3.y signaturtal " + signaturTal.length + " st närvarande i kurstexten", saknasTal.length === 0, saknasTal.join(", "));

// ── 4. Korslänkar registeräkta (prefixmatch) ────────────────────────────────
const hänvisningar = [...new Set([...allt.matchAll(/\b([a-z]{1,9}-\d{1,3})\b/g)].map((m) => m[1]))];
const registerPrefix = new Set(Object.keys(reg).map((s) => s.split("-").slice(0, 2).join("-")));
const skuggor = hänvisningar.filter((h) => !registerPrefix.has(h));
testa("4.1 korslänkar registeräkta: " + hänvisningar.length + " hänvisningar, 0 skuggkoder", skuggor.length === 0, skuggor.join(", "));
testa("4.2 spegeln rs-02 nämns (kursens koppling)", allt.includes("rs-02"));
const VÄNTADE = ["rs-01","rs-02","rs-05","mt-05","mt-06","km-026","rk-09","km-003","st-01","km-058","rk-07"];
testa("4.3 väntade granngrejor närvarande", VÄNTADE.every((p) => hänvisningar.some((h) => h === p || h.startsWith(p + "-"))), VÄNTADE.filter((p) => !hänvisningar.some((h) => h === p || h.startsWith(p + "-"))).join(","));

// ── 5. Juridikgrind ──────────────────────────────────────────────────────────
const rådsfraser = ["köp denna aktie","sälj denna aktie","rekommenderar köp","rekommenderar att du köper","du bör köpa","du bör sälja","investera i denna","tipsa om aktien","aktietips"];
const rådsTräff = rådsfraser.filter((f) => allt.toLowerCase().includes(f));
testa("5.1 juridikgrind: 0 rådgivningsfraser", rådsTräff.length === 0, rådsTräff.join(", "));
const lagrum = allt.match(/\b(19|20)\d{2}:\d{3,4}\b/g) || [];
testa("5.2 juridikgrind: 0 lagrum i kurstexten", lagrum.length === 0, lagrum.join(", "));
testa("5.3 utbildningsframing närvarande", allt.includes("Detta är utbildning") && allt.includes("inte uppmaningar att köpa eller sälja"));
testa("5.4 påhittade exempel deklarerade", allt.includes("PÅHITTADE TAL") || allt.includes("påhittat bolag"));
const prisYtor = [/pris per månad/i, /tier/i, / Fas 2 /, / Fas 3 /, /\d{3,5} kr/];
testa("5.5 R2: 0 pris-/tier-ytor", !prisYtor.some((re) => re.test(allt)));

// ── 6. Registerläge efter kedja ──────────────────────────────────────────────
const antalReg = Object.keys(reg).length;
const konstant = Number((kartaText.match(/LARVAG_ANTAL_KURSER = (\d+)/) || [])[1]);
testa("6.1 registerantal " + antalReg + " = kartkonstant " + konstant, antalReg === konstant && antalReg === 427, `reg=${antalReg} karta=${konstant}`);
const kartRad = kartaText.includes('slug: "' + MIN + '"');
testa("6.2 rs-07 i kartan med niva 2 kraverFas 0 vIndex -1", new RegExp('slug: "' + MIN + '".*niva: 2, kraverFas: 0, vIndex: -1, minuter: 24').test(kartaText));
for (const f of ["public/llms.txt", "public/llms-full.txt"]) {
  const t = readFileSync(ROT + "/" + f, "utf8");
  const träffar = [...t.matchAll(/427 kurser/g)].length;
  testa("6.3 llms " + f.split("/").pop() + " bär 427 (0 kvar av 426)", träffar > 0 && !t.includes("426 kurser"), `träffar=${träffar}`);
}
const mentor = readFileSync(ROT + "/src/lib/ai-mentor-register.ts", "utf8");
testa("6.4 mentorsregister bär " + MIN, mentor.includes(MIN));
const larvagSynk = JSON.parse(readFileSync(ROT + "/data/vakten/larvag-synk.json", "utf8"));
testa("6.5 larvag-synk GRÖN " + [larvagSynk.registerAntal, larvagSynk.kartaAntal, larvagSynk.konstantAntal].join("="), larvagSynk.status === "grön" && larvagSynk.registerAntal === 427);

// ── 7. Språkgrind (parsad text) ──────────────────────────────────────────────
const språk = [];
if (/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/.test(allt)) språk.push("CJK");
if (/\u00ad/.test(allt)) språk.push("mjukt bindestreck");
if (/[""'']/.test(allt)) språk.push("typografiskt citattecken");
if (/\t/.test(allt)) språk.push("tabb");
if (/ {2,}/.test(allt.replace(/\n/g, ""))) språk.push("dubbelt mellanslag");
const svartlista = ["bearer","läsers","passing","gröns","underhandling","gamma läxa","prisriskan","fjortonleverantör","ensamkälleleverantören","skall ","Few ","glipen","bearer "];
for (const s of svartlista) if (allt.includes(s)) språk.push("svartlista «" + s + "»");
testa("7.1 språkgrind parsad text: 0 fynd", språk.length === 0, språk.join(", "));
// parentesbalans
const öppna = (allt.match(/\(/g) || []).length, stäng = (allt.match(/\)/g) || []).length;
testa("7.2 parentesbalans", öppna === stäng, öppna + "≠" + stäng);

console.log(pass.join("\n"));
if (fail.length) { console.error("\n" + fail.join("\n")); console.error(`\nKVD RÖD: ${pass.length} PASS, ${fail.length} FEL`); process.exit(1); }
console.log(`\nKVD GRÖN: ${pass.length} PASS 0 FEL — ${MIN} round-trippad, aritmetik oberoende omräknad, korslänkar registeräkta, juridik + språk rena, register 427.`);
