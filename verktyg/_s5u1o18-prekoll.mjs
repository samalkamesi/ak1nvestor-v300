#!/usr/bin/env node
/**
 * PRE-KOLL — s5-u1 (manifest auto-s5-1789789514860, omgång 18): se-17-skogssektorn.
 * ALLA kontroller FÖRE registerinsert — EGNA fel fångas FÖRE de når registret
 * (o15/o16/o17-lärdomen: kontrollen är också kod; språkgrind på PARSAD text,
 * råfilens JSON-indentering ger annars falska dubbelt-mellanslag).
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const MIN = "se-17-skogssektorn";
const kurs = JSON.parse(readFileSync(ROT + "/data/kurser-tillagg/" + MIN + ".json", "utf8"));
const reg = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));
const pass = [], fail = [];
const testa = (namn, villkor, detalj) => (villkor ? pass : fail).push(`${villkor ? "PASS" : "FAIL"} ${namn}${detalj ? " — " + detalj : ""}`);

// ── 1. Schema: 18 fält, exakt uppsättning ──────────────────────────────────────
const fält = ["slug","category","weight","chapterCount","totalMinutes","title","summary","minutes","xp","level","learn","why","history","chapters_list","lynchSection","grahamSection","ak1Section","chapters"];
testa("1.1 exakt 18-schemafält (0 extra, 0 saknade)", JSON.stringify(Object.keys(kurs).sort()) === JSON.stringify(fält.slice().sort()), Object.keys(kurs).filter((f) => !fält.includes(f)).join(","));
testa("1.2 slug ren ASCII", /^[a-z0-9][a-z0-9-]*$/.test(kurs.slug));
testa("1.3 slug finns EJ i registret ännu (0 dubbelinsert)", !reg[kurs.slug]);
testa("1.4 category SEKTORANALYS + level Intermediär + xp 50 + weight —", kurs.category === "SEKTORANALYS" && kurs.level === "Intermediär" && kurs.xp === 50 && kurs.weight === "—");
testa("1.5 6 kapitel à 4 min = 24 på alla tre fälten", kurs.chapters.length === 6 && kurs.chapterCount === 6 && kurs.chapters.every((c) => c.minutes === 4) && kurs.chapters.reduce((s, c) => s + c.minutes, 0) === 24 && kurs.totalMinutes === 24 && kurs.minutes === 24);
testa("1.6 chapters_list-paritet", JSON.stringify(kurs.chapters_list) === JSON.stringify(kurs.chapters.map((c) => ({ num: c.num, title: c.title, minutes: c.minutes }))));
const typräkning = kurs.chapters.flatMap((c) => c.blocks.map((b) => b.type)).reduce((a, t) => (a[t] = (a[t] || 0) + 1, a), {});
testa("1.7 blocktyper text 6 · definition 2 · tabell 2 · insight 6 · utmaning 1", typräkning.text === 6 && typräkning.definition === 2 && typräkning.tabell === 2 && typräkning.insight === 6 && typräkning.utmaning === 1, JSON.stringify(typräkning));
testa("1.8 varje kapitel: intro + minst 2 block + varje block har content", kurs.chapters.every((c) => typeof c.intro === "string" && c.intro.length > 20 && c.blocks.length >= 2 && c.blocks.every((b) => typeof b.content === "string" && b.content.length > 30)));
testa("1.9 history origin+evolution+modern", Object.keys(kurs.history).length === 3 && Object.values(kurs.history).every((s) => s.length > 300));
testa("1.10 tre mästarsektioner > 300 tkn", ["lynchSection","grahamSection","ak1Section"].every((s) => kurs[s].length > 300));

// ── 2. Aritmetik — oberoende omräknad (påhittade Norrskog-tal) ────────────────
const A = {
  "segmentintäkter 900+2400+2480+1680 = 7 460,0": 900.0 + 2400.0 + 2480.0 + 1680.0 === 7460.0,
  "segmentresultat 310+170+248+220 = 948,0": 310.0 + 170.0 + 248.0 + 220.0 === 948.0,
  "koncernmarginal 948/7 460 = 12,7 %": Math.abs(948.0 / 7460.0 - 0.127) < 0.0005,
  "massaintäkt topp 400 000×620×10,00 = 2 480,0 Mkr": 400000 * 620 * 10.0 === 2480000000,
  "massaintäkt botten 400 000×480×10,00 = 1 920,0 Mkr": 400000 * 480 * 10.0 === 1920000000,
  "prisfall (620−480)/620 = 22,6 %": Math.abs((620 - 480) / 620 - 0.226) < 0.0005,
  "intäktsskillnad 2 480−1 920 = 560,0": 2480.0 - 1920.0 === 560.0,
  "massa-RRES topp 2 480−840−1 392 = +248,0": 2480.0 - 840.0 - 1392.0 === 248.0,
  "marginal topp 248/2 480 = 10,0 %": Math.abs(248.0 / 2480.0 - 0.10) < 1e-9,
  "ved botten 840×0,80 = 672,0": 840.0 * 0.8 === 672.0,
  "massa-RRES botten 1 920−672−1 392 = −144,0": 1920.0 - 672.0 - 1392.0 === -144.0,
  "resultatsvängning 248+144 = 392,0": 248.0 + 144.0 === 392.0,
  "koncern isolerat 948−392 = 556,0": 948.0 - 392.0 === 556.0,
  "koncernintäkt botten 7 460−560 = 6 900,0": 7460.0 - 560.0 === 6900.0,
  "marginal botten 556/6 900 = 8,1 %": Math.abs(556.0 / 6900.0 - 0.081) < 0.0005,
  "valutaslag 248 MUSD×(11,00−10,00) = +248,0 Mkr": 248.0 * (11.0 - 10.0) === 248.0,
  "papper 1 680/10,50 = 160,0 MEUR": 1680.0 / 10.5 === 160.0,
  "tillväxt 4,5−3,6 = 0,9 Mm³sk (flyttalstolerans — o16-lärdomen)": Math.abs(4.5 - 3.6 - 0.9) < 1e-9,
  "avverkningsandel 3,6/4,5 = 80,0 %": Math.abs(3.6 / 4.5 - 0.8) < 1e-9,
  "avverkningsintäkt 3,6 M×250 = 900,0 Mkr": 3.6e6 * 250 === 900e6,
  "tyst tillväxt 0,9 M×250 = 225,0 Mkr": 0.9e6 * 250 === 225e6,
  "skogsmark 900 000×40 000 = 36 000,0 Mkr": 900000 * 40000 === 36000000000,
  "NAV 36 000+12 400−8 000 = 40 400,0": 36000.0 + 12400.0 - 8000.0 === 40400.0,
  "P-till-NAV 32 320/40 400 = 0,800": 32320.0 / 40400.0 === 0.8,
  "rabattbelopp 40 400−32 320 = 8 080,0": 40400.0 - 32320.0 === 8080.0,
  "rabatt 8 080/40 400 = 20,0 %": Math.abs(8080.0 / 40400.0 - 0.2) < 1e-9,
  "samvariation −144+262+119+198 = 435,0": -144.0 + 262.0 + 119.0 + 198.0 === 435.0,
  "koncernfall (948−435)/948 = 54,1 %": Math.abs((948.0 - 435.0) / 948.0 - 0.541) < 0.0005,
  "skogsmarginal 310/900 = 34,4 %": Math.abs(310.0 / 900.0 - 0.344) < 0.0005,
};
for (const [namn, ok] of Object.entries(A)) testa("2.x aritmetik: " + namn, ok);

// ── 3. Signaturtal närvarande i PARSAD kurstext ────────────────────────────────
const texter = [];
(function samla(o){ if (typeof o === "string") texter.push(o); else if (Array.isArray(o)) o.forEach(samla); else if (o && typeof o === "object") Object.values(o).forEach(samla); })(kurs);
const allt = texter.join("\n");
const signaturTal = ["7 460,0","948,0","12,7","2 480,0","1 920,0","22,6","560,0","248,0","840,0","672,0","1 392,0","144,0","392,0","556,0","6 900,0","8,1","11,00","10,50","160,0","4,5","3,6","0,9","900,0","225,0","36 000,0","12 400,0","8 000,0","40 400,0","32 320,0","0,800","8 080,0","20,0","262,0","119,0","198,0","435,0","54,1","310,0","170,0","220,0","10,0","34,4","80,0"];
const saknasTal = signaturTal.filter((t) => !allt.includes(t));
testa("3.1 signaturtal " + signaturTal.length + " st närvarande", saknasTal.length === 0, saknasTal.join(", "));

// ── 4. Korslänkar registeräkta ────────────────────────────────────────────────
// Egen slug-prefix (se-17) exkluderas: registret bär den först EFTER insert
// (KVD:n kör samma kontroll post-insert utan undantag).
const hänvisningar = [...new Set([...allt.matchAll(/\b([a-z]{1,9}-\d{1,3})\b/g)].map((m) => m[1]))].filter((h) => h !== "se-17");
const registerPrefix = new Set(Object.keys(reg).map((s) => s.split("-").slice(0, 2).join("-")));
const skuggor = hänvisningar.filter((h) => !registerPrefix.has(h));
testa("4.1 korslänkar registeräkta: " + hänvisningar.length + " hänvisningar, 0 skuggkoder", skuggor.length === 0, skuggor.join(", "));
const VÄNTADE = ["km-045","km-024","km-058","vr-02","mk-10","st-04","km-067","se-16","rs-08"];
testa("4.2 väntade grannar närvarande", VÄNTADE.every((p) => hänvisningar.some((h) => h === p || h.startsWith(p + "-"))), VÄNTADE.filter((p) => !hänvisningar.some((h) => h === p || h.startsWith(p + "-"))).join(","));

// ── 5. Juridikgrind + R2 ──────────────────────────────────────────────────────
const rådsfraser = ["köp denna aktie","sälj denna aktie","rekommenderar köp","rekommenderar att du köper","du bör köpa","du bör sälja","investera i denna","tipsa om aktien","aktietips"];
testa("5.1 0 rådgivningsfraser", rådsfraser.every((f) => !allt.toLowerCase().includes(f)));
const lagrum = allt.match(/\b(19|20)\d{2}:\d{3,4}\b/g) || [];
testa("5.2 0 lagrum", lagrum.length === 0, lagrum.join(", "));
testa("5.3 utbildningsframing", allt.includes("Detta är utbildning") && allt.includes("inte uppmaningar att köpa eller sälja"));
testa("5.4 påhittade exempel deklarerade", allt.includes("PÅHITTADE TAL") && allt.includes("påhittat bolag"));
// R2-regex med lookahead: "kr" färre följas av bokstav — "kronor" är svensk
// prosa, prisytorna ("9 999 kr/mån") matchar fortfarande.
const prisYtor = [/pris per månad/i, /tier/i, / Fas 2 /, / Fas 3 /, /\d{3,5} kr(?![a-zåäö])/];
const prisTräff = prisYtor.filter((re) => re.test(allt));
testa("5.5 R2: 0 pris-/tier-ytor (tal + kr förbjudet — Mkr/kronor är formatet)", prisTräff.length === 0, prisTräff.map(String).join(", "));

// ── 6. Språkgrind PARSAD text ─────────────────────────────────────────────────
const språk = [];
if (/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/.test(allt)) språk.push("CJK");
if (/[\u00ad]/.test(allt)) språk.push("mjukt bindestreck");
if (/[""'']/.test(allt)) språk.push("typografiskt citattecken");
if (/\t/.test(allt)) språk.push("tabb");
if (/ {2,}/.test(allt)) språk.push("dubbelt mellanslag");
const svartlista = ["bearer","läsers","passing","gröns","Few ","glipen","sektoorn","godisdjupt","seårs","underhållsomkostnader","blander","blånder","edge ","return on"];
for (const s of svartlista) if (allt.includes(s)) språk.push("svartlista «" + s + "»");
testa("6.1 språkgrind 0 fynd", språk.length === 0, språk.join(", "));
const öppna = (allt.match(/\(/g) || []).length, stäng = (allt.match(/\)/g) || []).length;
testa("6.2 parentesbalans", öppna === stäng, öppna + "≠" + stäng);
const mellanslagSlut = texter.filter((s) => /[ ]{2,}|^\s|\s$/.test(s));
testa("6.3 inga strängar med inledande/efterföljande whitespace eller dubbla mellanslag", mellanslagSlut.length === 0, mellanslagSlut.length + " strängar");

console.log(pass.join("\n"));
if (fail.length) { console.error("\n" + fail.join("\n")); console.error(`\nPRE-KOLL RÖD: ${pass.length} PASS, ${fail.length} FEL — rätta FÖRE insert.`); process.exit(1); }
console.log(`\nPRE-KOLL GRÖN: ${pass.length} PASS 0 FEL — ${MIN} klar för atomisk synkkedja.`);
