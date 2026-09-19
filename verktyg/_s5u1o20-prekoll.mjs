#!/usr/bin/env node
/**
 * PRE-KOLL — s5-u1 (manifest auto-s5-1789837501089, omgång 20): ma-08-bostadsmarknadens-mekanik.
 * ALLA kontroller FÖRE registerinsert — EGNA fel fångas FÖRE de når registret
 * (o15/o16/o17/o18-lärdomen: kontrollen är också kod; språkgrind på PARSAD text).
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const MIN = "ma-08-bostadsmarknadens-mekanik";
const kurs = JSON.parse(readFileSync(ROT + "/data/kurser-tillagg/" + MIN + ".json", "utf8"));
const reg = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));
const pass = [], fail = [];
const testa = (namn, villkor, detalj) => (villkor ? pass : fail).push(`${villkor ? "PASS" : "FAIL"} ${namn}${detalj ? " — " + detalj : ""}`);

// ── 1. Schema: 18 fält, exakt uppsättning ──────────────────────────────────────
const fält = ["slug","category","weight","chapterCount","totalMinutes","title","summary","minutes","xp","level","learn","why","history","chapters_list","lynchSection","grahamSection","ak1Section","chapters"];
testa("1.1 exakt 18-schemafält (0 extra, 0 saknade)", JSON.stringify(Object.keys(kurs).sort()) === JSON.stringify(fält.slice().sort()), Object.keys(kurs).filter((f) => !fält.includes(f)).join(","));
testa("1.2 slug ren ASCII", /^[a-z0-9][a-z0-9-]*$/.test(kurs.slug));
testa("1.3 slug finns EJ i registret ännu (0 dubbelinsert)", !reg[kurs.slug]);
testa("1.4 category MAKROEKONOMI & RÄNTA + level Intermediär + xp 50 + weight —", kurs.category === "MAKROEKONOMI & RÄNTA" && kurs.level === "Intermediär" && kurs.xp === 50 && kurs.weight === "—");
testa("1.5 6 kapitel à 4 min = 24 på alla tre fälten", kurs.chapters.length === 6 && kurs.chapterCount === 6 && kurs.chapters.every((c) => c.minutes === 4) && kurs.chapters.reduce((s, c) => s + c.minutes, 0) === 24 && kurs.totalMinutes === 24 && kurs.minutes === 24);
testa("1.6 chapters_list-paritet", JSON.stringify(kurs.chapters_list) === JSON.stringify(kurs.chapters.map((c) => ({ num: c.num, title: c.title, minutes: c.minutes }))));
const typräkning = kurs.chapters.flatMap((c) => c.blocks.map((b) => b.type)).reduce((a, t) => (a[t] = (a[t] || 0) + 1, a), {});
testa("1.7 blocktyper text 6 · definition 2 · tabell 2 · insight 6 · utmaning 1", typräkning.text === 6 && typräkning.definition === 2 && typräkning.tabell === 2 && typräkning.insight === 6 && typräkning.utmaning === 1, JSON.stringify(typräkning));
testa("1.8 varje kapitel: intro + minst 2 block + varje block har content", kurs.chapters.every((c) => typeof c.intro === "string" && c.intro.length > 20 && c.blocks.length >= 2 && c.blocks.every((b) => typeof b.content === "string" && b.content.length > 30)));
testa("1.9 history origin+evolution+modern", Object.keys(kurs.history).length === 3 && Object.values(kurs.history).every((s) => s.length > 300));
testa("1.10 tre mästarsektioner > 300 tkn", ["lynchSection","grahamSection","ak1Section"].every((s) => kurs[s].length > 300));

// ── 2. Aritmetik — oberoende omräknad (påhittade Svea Bostäder-tal) ────────────
const A = {
  "lånekraft 4,0 %: 144 000/0,040 = 3 600 000": 144000 / 0.04 === 3600000,
  "lånekraft 2,0 %: 144 000/0,020 = 7 200 000": 144000 / 0.02 === 7200000,
  "kvot 7 200 000/3 600 000 = 2,0": 7200000 / 3600000 === 2,
  "månadsutrymme 144 000/12 = 12 000": 144000 / 12 === 12000,
  "årsränta lågt: 3 000 000×0,020 = 60 000": 3000000 * 0.02 === 60000,
  "årsränta högt: 3 000 000×0,050 = 150 000": 3000000 * 0.05 === 150000,
  "ränteskillnad: 150 000−60 000 = 90 000": 150000 - 60000 === 90000,
  "månadsskillnad: 90 000/12 = 7 500": 90000 / 12 === 7500,
  "konsumtionsandel: 90 000/800 000 = 11,25 %": Math.abs(90000 / 800000 - 0.1125) < 1e-12,
  "bolånetak: 4 000 000×0,85 = 3 400 000": 4000000 * 0.85 === 3400000,
  "eget kapital vid tak: 4 000 000−3 400 000 = 600 000": 4000000 - 3400000 === 600000,
  "skuldkvot: 3 600 000/800 000 = 4,5": 3600000 / 800000 === 4.5,
  "amortering: 3 600 000×0,02 = 72 000": 3600000 * 0.02 === 72000,
  "ränta 4,0 % på 3 600 000 = 144 000": 3600000 * 0.04 === 144000,
  "tjänst: 72 000+144 000 = 216 000": 72000 + 144000 === 216000,
  "tjänstegrad: 216 000/800 000 = 27,0 %": Math.abs(216000 / 800000 - 0.27) < 1e-12,
  "tröghetsandel: 10 000/20 000 = 0,5": 10000 / 20000 === 0.5,
  "portfölj belåning: 12 000×0,60 = 7 200": 12000 * 0.6 === 7200,
  "räntekostnad låg: 7 200×0,02 = 144": 7200 * 0.02 === 144,
  "räntekostnad hög: 7 200×0,05 = 360": 7200 * 0.05 === 360,
  "ränteökning: 360−144 = 216": 360 - 144 === 216,
  "värdefall: 12 000×0,15 = 1 800": 12000 * 0.15 === 1800,
  "värde efter fall: 12 000−1 800 = 10 200": 12000 - 1800 === 10200,
  "EK före: 12 000−7 200 = 4 800": 12000 - 7200 === 4800,
  "EK efter: 10 200−7 200 = 3 000": 10200 - 7200 === 3000,
  "EK-fall: 1 800/4 800 = 37,5 %": Math.abs(1800 / 4800 - 0.375) < 1e-12,
  "hävstångskvot: 37,5/15 = 2,5": 37.5 / 15 === 2.5,
  "banklån: 4 000 000×0,70 = 2 800 000": 4000000 * 0.7 === 2800000,
  "värde vid fall 10 %: 4 000 000×0,90 = 3 600 000": 4000000 * 0.9 === 3600000,
  "täckningskvot 10 %: 3 600 000/2 800 000 ≈ 1,29": Math.abs(3600000 / 2800000 - 1.2857) < 0.0005,
  "täckningskvot nollpunkt: 4 000 000×0,70 = 2 800 000 ⇒ 1,00": 4000000 * 0.7 === 2800000,
  "värde vid fall 20 %: 4 000 000×0,80 = 3 200 000": 4000000 * 0.8 === 3200000,
  "hushåll 50 %: 3 200 000−2 000 000 = 1 200 000": 3200000 - 2000000 === 1200000,
  "hushåll 70 %: 3 200 000−2 800 000 = 400 000": 3200000 - 2800000 === 400000,
  "hushåll 85 %: 3 200 000−3 400 000 = −200 000": 3200000 - 3400000 === -200000,
  "bostadsrättslån: 3 000 000×0,85 = 2 550 000": 3000000 * 0.85 === 2550000,
  "ränta på 2 550 000×0,04 = 102 000": 2550000 * 0.04 === 102000,
  "amortering på 2 550 000×0,02 = 51 000": 2550000 * 0.02 === 51000,
  "avgift: 4 200×12 = 50 400": 4200 * 12 === 50400,
  "ägarkostnad: 50 400+102 000+51 000 = 203 400": 50400 + 102000 + 51000 === 203400,
  "månad: 203 400/12 = 16 950": 203400 / 12 === 16950,
  "årshyra: 13 500×12 = 162 000": 13500 * 12 === 162000,
  "skillnad: 203 400−162 000 = 41 400": 203400 - 162000 === 41400,
  "direktavkastning: 162 000/3 000 000 = 5,4 %": Math.abs(162000 / 3000000 - 0.054) < 1e-12,
};
for (const [namn, ok] of Object.entries(A)) testa("2.x aritmetik: " + namn, ok);

// ── 3. Signaturtal närvarande i PARSAD kurstext ────────────────────────────────
const texter = [];
(function samla(o){ if (typeof o === "string") texter.push(o); else if (Array.isArray(o)) o.forEach(samla); else if (o && typeof o === "object") Object.values(o).forEach(samla); })(kurs);
const allt = texter.join("\n");
const signaturTal = ["3 000 000","60 000","150 000","90 000","7 500","11,25","800 000","144 000","3 600 000","7 200 000","2,0","4 000 000","3 400 000","600 000","4,5","72 000","216 000","27,0","36","20 000","10 000","0,5","12 000","7 200","144","360","216","1 800","10 200","4 800","3 000","37,5","2,5","2 800 000","3 600 000","1,29","1,00","3 200 000","−200 000","1 200 000","400 000","2 000 000","15","2 550 000","102 000","51 000","50 400","203 400","16 950","13 500","162 000","41 400","5,4"];
const saknasTal = [...new Set(signaturTal)].filter((t) => !allt.includes(t));
testa("3.1 signaturtal " + new Set(signaturTal).size + " st närvarande", saknasTal.length === 0, saknasTal.join(", "));

// ── 4. Korslänkar registeräkta ────────────────────────────────────────────────
// Egen slug-prefix (ma-08) exkluderas: registret bär den först EFTER insert.
const hänvisningar = [...new Set([...allt.matchAll(/\b([a-z]{1,9}-\d{1,3})\b/g)].map((m) => m[1]))].filter((h) => h !== "ma-08");
const registerPrefix = new Set(Object.keys(reg).map((s) => s.split("-").slice(0, 2).join("-")));
const skuggor = hänvisningar.filter((h) => !registerPrefix.has(h));
testa("4.1 korslänkar registeräkta: " + hänvisningar.length + " hänvisningar, 0 skuggkoder", skuggor.length === 0, skuggor.join(", "));
const VÄNTADE = ["ma-01","ma-03","ma-04","ma-05","ma-06","km-054","km-042","km-040","km-063","mk-08","st-04","rs-03","ln-03","se-18"];
testa("4.2 väntade grannar närvarande", VÄNTADE.every((p) => hänvisningar.some((h) => h === p || h.startsWith(p + "-"))), VÄNTADE.filter((p) => !hänvisningar.some((h) => h === p || h.startsWith(p + "-"))).join(","));

// ── 5. Juridikgrind + R2 ──────────────────────────────────────────────────────
const rådsfraser = ["köp denna aktie","sälj denna aktie","rekommenderar köp","rekommenderar att du köper","du bör köpa","du bör sälja","investera i denna","tipsa om aktien","aktietips"];
testa("5.1 0 rådgivningsfraser", rådsfraser.every((f) => !allt.toLowerCase().includes(f)));
const lagrum = allt.match(/\b(19|20)\d{2}:\d{3,4}\b/g) || [];
testa("5.2 0 lagrum", lagrum.length === 0, lagrum.join(", "));
testa("5.3 utbildningsframing", allt.includes("Detta är utbildning") && allt.includes("inte uppmaningar att köpa eller sälja"));
testa("5.4 påhittade exempel deklarerade", allt.includes("PÅHITTADE TAL") && allt.includes("påhittat bolag"));
// R2-regex med lookahead: "kronor" är svensk prosa, prisytorna ("9 999 kr/mån") matchar fortfarande.
// "tier" som EGET ord (\b) — "aktier" innehåller delsträngen "tier" (o16-klassens falskträff, rättad).
const prisYtor = [/pris per månad/i, /\btier\b/i, / Fas 2 /, / Fas 3 /, /\d{3,5} kr(?![a-zåäö])/];
const prisTräff = prisYtor.filter((re) => re.test(allt));
testa("5.5 R2: 0 pris-/tier-ytor (tal + kr förbjudet — kronor är formatet)", prisTräff.length === 0, prisTräff.map(String).join(", "));

// ── 6. Språkgrind PARSAD text ─────────────────────────────────────────────────
const språk = [];
if (/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/.test(allt)) språk.push("CJK");
if (/[\u00ad]/.test(allt)) språk.push("mjukt bindestreck");
if (/[""'']/.test(allt)) språk.push("typografiskt citattecken");
if (/\t/.test(allt)) språk.push("tabb");
if (/ {2,}/.test(allt)) språk.push("dubbelt mellanslag");
const svartlista = ["bearer","läsers","passing","gröns","Few ","glipen","sektoorn","godisdjupt","seårs","underhållsomkostnader","blander","blånder","edge ","return on","territory","crossings","roundtals"];
for (const s of svartlista) if (allt.includes(s)) språk.push("svartlista «" + s + "»");
testa("6.1 språkgrind 0 fynd", språk.length === 0, språk.join(", "));
const öppna = (allt.match(/\(/g) || []).length, stäng = (allt.match(/\)/g) || []).length;
testa("6.2 parentesbalans", öppna === stäng, öppna + "≠" + stäng);
const mellanslagSlut = texter.filter((s) => /[ ]{2,}|^\s|\s$/.test(s));
testa("6.3 inga strängar med inledande/efterföljande whitespace eller dubbla mellanslag", mellanslagSlut.length === 0, mellanslagSlut.length + " strängar");
// engelskaläckor: fristående engelska ord (grovsikt). "bank" och "risk" är ÄVEN svenska
// ord och är därfort exkluderade (falskträff-klassen, rättad under körningen).
const engläckor = [...allt.matchAll(/\b(the|and|with|from|this|that|price|rates?|loan|housing|market)\b/gi)].map((m) => m[1]);
testa("6.4 0 engelska funktionord", engläckor.length === 0, [...new Set(engläckor)].join(", "));

console.log(pass.join("\n"));
if (fail.length) { console.error("\n" + fail.join("\n")); console.error(`\nPRE-KOLL RÖD: ${pass.length} PASS, ${fail.length} FEL — rätta FÖRE insert.`); process.exit(1); }
console.log(`\nPRE-KOLL GRÖN: ${pass.length} PASS 0 FEL — ${MIN} klar för atomisk synkkedja.`);
