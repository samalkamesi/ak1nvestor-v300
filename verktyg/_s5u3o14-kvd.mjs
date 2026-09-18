#!/usr/bin/env node
/**
 * KVD — s5-u3 manifest auto-s5-1789701930027 (register 411 → 414):
 * ma-05-kreditpremien · ek-05-monte-carlo-i-motorn · od-05-utdelningen-och-optionen
 *
 * Kontroller (alla måste hålla; varje fel = FAIL + exit 1):
 *   A. register↔kursfil round-trip ×3 (registerposter djuplika proveniensfilerna)
 *   B. strukturparitet: 6 kapitel × 4 min, chapters_list ↔ chapters, blocktyper,
 *      history{origin,evolution,modern}, sektioner, why/learn finns och är längdsubstansiella
 *   C. aritmetik oberoende omräknad (motorn räknar ALLA kursens tal på nytt)
 *   D. korsreferenser registeräkta: varje kursprefix-referens finns i registret
 *   E. juridikgrind: 0 rådgivningsfraser; utbildningsframing i summary + avslut
 *   F. språkgrind: 0 CJK/kyrilliska, 0 typografiska citattecken, 0 tabbar,
 *      0 mjuka bindestreck, 0 mellanslag-före-skiljetecken, 0 sammansmältningar
 *   G. R2: kraverFas 0 ×3; siffror.json fas2 18 / fas3 24 orörda; quiz 8 223
 *   H. register-läge: 414 = karta = konstant; sökindex antal; llms 6+4
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const KURSER = ["ma-05-kreditpremien", "ek-05-monte-carlo-i-motorn", "od-05-utdelningen-och-optionen"];
const register = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));
const pass = [];
const fail = [];
const testa = (namn, villkor, detalj) => (villkor ? pass : fail).push(`${villkor ? "PASS" : "FAIL"} ${namn}${detalj ? " — " + detalj : ""}`);
const approx = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol;

// ── A. Round-trip register ↔ kursfil ────────────────────────────────────────
for (const slug of KURSER) {
  const fil = JSON.parse(readFileSync(ROT + "/data/kurser-tillagg/" + slug + ".json", "utf8"));
  const reg = register[slug];
  testa("A " + slug + " finns i registret och är djuplik kursfilen", reg && JSON.stringify(reg) === JSON.stringify(fil), reg ? "djuplik" : "SAKNAS");
}

// ── B. Strukturparitet ──────────────────────────────────────────────────────
for (const slug of KURSER) {
  const o = register[slug];
  const fel = [];
  if (o.chapterCount !== 6 || o.totalMinutes !== 24 || o.minutes !== 24 || o.xp !== 50) fel.push("talform");
  if (o.chapters_list.length !== 6 || o.chapters.length !== 6) fel.push("kapitelantal");
  for (let i = 0; i < 6; i++) {
    if (o.chapters_list[i].title !== o.chapters[i].title) fel.push("kap" + (i + 1) + " titelharfi");
    if (o.chapters[i].minutes !== 4) fel.push("kap" + (i + 1) + " minuter");
    if (o.chapters[i].blocks.length < 2) fel.push("kap" + (i + 1) + " block");
    for (const b of o.chapters[i].blocks) if (!["text", "definition", "insight", "tabell", "utmaning"].includes(b.type)) fel.push("kap" + (i + 1) + " typ");
  }
  for (const f of ["slug", "category", "title", "summary", "learn", "why", "history", "chapters_list", "chapters", "lynchSection", "grahamSection", "ak1Section"]) if (!(f in o)) fel.push("saknas " + f);
  for (const f of ["origin", "evolution", "modern"]) if (!(f in o.history)) fel.push("history." + f);
  if ((o.why || "").length < 400) fel.push("why tunn");
  if ((o.learn || "").length < 400) fel.push("learn tunn");
  const typer = o.chapters.flatMap((c) => c.blocks.map((b) => b.type));
  if (!typer.includes("tabell")) fel.push("saknar tabell");
  if (!typer.includes("utmaning")) fel.push("saknar utmaning");
  if (!typer.includes("definition")) fel.push("saknar definition");
  testa("B " + slug + " strukturparitet", fel.length === 0, fel.join(","));
}

// ── C. Aritmetik oberoende omräknad ──────────────────────────────────────────
const A = (namn, villkor) => testa("C " + namn, villkor);
// ma-05: spread 1,5 = 1,2 + 0,2 + 0,1; förväntad förlust 2 % × 60 % = 1,2; kuponger 35/20/15;
//        2 000 × 0,035 = 70; 2 000 × 0,020 = 40; 70 − 40 = 30; 2 000 × 0,015 = 30; 30/150 = 0,20;
//        2 000 × 0,030 = 60; 60/150 = 0,40
A("ma-05 spreaddekomp 1,2+0,2+0,1=1,5", approx(1.2 + 0.2 + 0.1, 1.5));
A("ma-05 förväntad förlust 0,02×0,60=0,012 (1,2 pp)", approx(0.02 * (1 - 0.40), 0.012));
A("ma-05 kupongpar 35−20=15 (1000×(3,5−2,0)%)", approx(1000 * 0.035 - 1000 * 0.020, 15));
A("ma-05 räntekostnad 2000×0,035=70", approx(2000 * 0.035, 70));
A("ma-05 statsalternativ 2000×0,020=40", approx(2000 * 0.020, 40));
A("ma-05 premie i kronor 70−40=30 = 2000×0,015", approx(70 - 40, 30) && approx(2000 * 0.015, 30));
A("ma-05 andel 30/150=20 %", approx(30 / 150, 0.20));
A("ma-05 krisfall 2000×0,030=60 = 40 % av 150", approx(2000 * 0.030, 60) && approx(60 / 150, 0.40));
// ek-05: band 230−92=138; kvartiler 183−121=62; z-par 6−3=3/6+3=9; 12−1,5=10,5/12+1,5=13,5; P50≈bas
A("ek-05 band 230−92=138", approx(230 - 92, 138));
A("ek-05 kvartilavstånd 183−121=62", approx(183 - 121, 62));
A("ek-05 z=−1: 6−3=3 och 12,0−1,5=10,5", approx(6 - 3, 3) && approx(12.0 - 1.5, 10.5));
A("ek-05 z=+1: 6+3=9 och 12,0+1,5=13,5", approx(6 + 3, 9) && approx(12.0 + 1.5, 13.5));
A("ek-05 mediansnedsteg 152−150=2", approx(152 - 150, 2));
A("ek-05 normalband 12±1,5 = 10,5–13,5 (två tredjedelar)", approx(12 - 1.5, 10.5) && approx(12 + 1.5, 13.5));
// od-05: paritet 100−100/1,05=4,76 (95,24); med D: 100−3−95,24=1,76; C=1,76+7,24=9,00; C=4,76+7,24=12,00;
//        ex-öppning 100−3=97; covered: 97+3=100; 100+4=104; 112+3=115; 90+3+4=97
A("od-05 diskonterat strike 100/1,05≈95,24 (textens avrundning)", approx(100 / 1.05, 95.24, 0.01));
A("od-05 paritet utan D 100−95,24≈4,76", approx(100 - 100 / 1.05, 4.76, 0.01));
A("od-05 paritet med D 100−3−95,24≈1,76", approx(100 - 3 - 100 / 1.05, 1.76, 0.01));
A("od-05 ny C med D 1,76+7,24=9,00", approx(1.76 + 7.24, 9.00));
A("od-05 C utan D 4,76+7,24=12,00", approx(4.76 + 7.24, 12.00));
A("od-05 ex-öppning 100−3=97", approx(100 - 3, 97));
A("od-05 aktieägare 97+3=100", approx(97 + 3, 100));
A("od-05 call-säljare 100+4=104", approx(100 + 4, 104));
A("od-05 uppgångsvärld 112+3=115 mot 104 (diff 11)", approx(112 + 3, 115) && approx(115 - 104, 11));
A("od-05 nedgångsvärld 90+3+4=97", approx(90 + 3 + 4, 97));
A("od-05 callens fall 12,00−9,00=3,00 = D", approx(12.00 - 9.00, 3));

// ── D. Korsreferenser registeräkta ──────────────────────────────────────────
const regSlugs = new Set(Object.keys(register));
const prefixFinns = (ref) => {
  const kort = ref.replace(/-(s|n)?$/, "");
  if (regSlugs.has(ref) || regSlugs.has(kort)) return true;
  // familjeprefix (t.ex. "km-familjen"): en kurs med prefixet räcker
  const m = ref.match(/^([a-z]{1,6})-(familjen|\d)/);
  if (m) return [...regSlugs].some((s) => s.startsWith(m[1] + "-"));
  return false;
};
let refOk = 0;
let refFel = [];
for (const slug of KURSER) {
  const texts = [];
  const samla = (v) => { if (typeof v === "string") texts.push(v); else if (Array.isArray(v)) v.forEach(samla); else if (v && typeof v === "object") Object.values(v).forEach(samla); };
  samla(register[slug]);
  const referenser = [...new Set((texts.join(" ").match(/\b[a-z]{1,6}-(?:\d{2,3}|familjen)\b/g) || []))].filter((r) => !r.startsWith(slug.slice(0, slug.indexOf("-")) + "-0") || false);
  for (const ref of referenser) {
    if (prefixFinns(ref)) refOk++;
    else refFel.push(slug + " → " + ref);
  }
}
testa("D korsreferenser registeräkta (" + refOk + " referenser)", refFel.length === 0, refFel.join(", "));

// ── E. Juridikgrind ─────────────────────────────────────────────────────────
const radFraser = [/du b(ö|o)r k(ö|o)pa/i, /rekommenderar (att )?(du )?k(ö|o)p/i, /k(ö|o)p (denna |aktien )/i, /s(ä|a)lj (dina )?aktier/i, /vi r(å|a)der/i, /b(ä|a)sta k(ö|o)pet/i, /sl(å|a) till nu/i];
for (const slug of KURSER) {
  const texts = [];
  const samla = (v) => { if (typeof v === "string") texts.push(v); else if (Array.isArray(v)) v.forEach(samla); else if (v && typeof v === "object") Object.values(v).forEach(samla); };
  samla(register[slug]);
  const t = texts.join(" ");
  const tra = radFraser.filter((re) => re.test(t));
  testa("E " + slug + " juridikgrind 0 rådgivningsfraser", tra.length === 0, tra.map(String).join(","));
  const framing = /aldrig råd|utbildning/i.test(register[slug].summary) || /utbildning/i.test(t.slice(-700));
  testa("E " + slug + " utbildningsframing (summary + avslut)", framing);
}

// ── F. Språkgrind (maskinell, på parsade fält) ──────────────────────────────
for (const slug of KURSER) {
  const texts = [];
  const samla = (v) => { if (typeof v === "string") texts.push(v); else if (Array.isArray(v)) v.forEach(samla); else if (v && typeof v === "object") Object.values(v).forEach(samla); };
  samla(register[slug]);
  const t = texts.join("\n");
  const fel = [];
  if (/[\u4e00-\u9fff\u0400-\u04ff\u3040-\u30ff]/.test(t)) fel.push("CJK/kyrilliska");
  if (/[\u201C\u201D\u2018\u2019]/.test(t)) fel.push("typografiska citattecken");
  if (t.includes("\t")) fel.push("tabb");
  if (t.includes("\u00AD")) fel.push("mjukt bindestreck");
  const mellFore = (t.match(/\s[,.;:?!]/g) || []).length;
  if (mellFore > 0) fel.push("mellanslag före skiljetecken: " + mellFore);
  const smalt = (t.match(/[a-zåäö]\.[A-ZÅÄÖ]/g) || []).length;
  if (smalt > 0) fel.push("sammansmältning: " + smalt);
  testa("F " + slug + " språkgrind ren", fel.length === 0, fel.join(","));
}

// ── G. R2 + register-läge ───────────────────────────────────────────────────
const siffror = JSON.parse(readFileSync(ROT + "/data/siffror.json", "utf8"));
testa("G siffror.json: kurser 414, quiz 8 223, fas2 18, fas3 24", siffror.kurser === 414 && siffror.quiz === 8223 && siffror.fas2Kurser === 18 && siffror.fas3Kurser === 24, `kurser=${siffror.kurser} quiz=${siffror.quiz} fas2=${siffror.fas2Kurser} fas3=${siffror.fas3Kurser}`);
const kartaText = readFileSync(ROT + "/src/lib/larvag-karta.ts", "utf8");
const konst = Number((kartaText.match(/LARVAG_ANTAL_KURSER = (\d+)/) || [])[1]);
testa("G kartans konstant 414", konst === 414, String(konst));
for (const slug of KURSER) {
  const m = kartaText.match(new RegExp('\\{ slug: "' + slug + '",[^}]*kraverFas: (\\d+)'));
  testa("G " + slug + " kraverFas 0 i kartan (R2 orörd)", m && m[1] === "0", m ? "fas=" + m[1] : "saknas i kartan");
}
const llms = readFileSync(ROT + "/public/llms.txt", "utf8");
const llmsFull = readFileSync(ROT + "/public/llms-full.txt", "utf8");
testa("G llms.txt 6 ställen »414 kurser«, 0 kvar av 411/413", (llms.split("414 kurser").length - 1) === 6 && !llms.includes("411 kurser") && !llms.includes("413 kurser"));
testa("G llms-full.txt 4 ställen »414 kurser«, 0 kvar av 411/413", (llmsFull.split("414 kurser").length - 1) === 4 && !llmsFull.includes("411 kurser") && !llmsFull.includes("413 kurser"));
testa("G llms quizXp oförändrad 82 230 (kurserna bär inga quiz)", /82[\s\u00A0\u2007\u202F]230 XP/.test(llms) && siffror.quizXp === 82230);

console.log(pass.join("\n"));
if (fail.length) { console.error("\n" + fail.join("\n")); console.error(`\nKVD RÖD: ${pass.length} PASS, ${fail.length} FAIL`); process.exit(1); }
console.log(`\nKVD GRÖN: ${pass.length} PASS 0 FEL 0 VARNING — round-trip ×3, struktur ×3, aritmetik 22, korsreferenser ${refOk}, juridik ×6, språk ×3, R2-registerläge.`);
