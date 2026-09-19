#!/usr/bin/env node
/**
 * KVD — s5-u1 (manifest auto-s5-1789789514860, omgång 18): se-17-skogssektorn.
 * Kvalitetsverifiering EFTER synkkedja (round-trip mot registret) med samma
 * grindar som o16/o17: struktur, aritmetik (oberoende omräknad), korslänkar
 * (registeräkta prefix), juridikgrind, R2, registerläge, språkgrind (parsad text).
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const MIN = "se-17-skogssektorn";
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
testa("2.2 category SEKTORANALYS + level Intermediär + xp 50", kurs.category === "SEKTORANALYS" && kurs.level === "Intermediär" && kurs.xp === 50);
testa("2.3 6 kapitel à 4 min = 24 (chapters = chapterCount = totalMinutes = minutes)", kurs.chapters.length === 6 && kurs.chapterCount === 6 && kurs.chapters.every((c) => c.minutes === 4) && kurs.chapters.reduce((s, c) => s + c.minutes, 0) === 24 && kurs.totalMinutes === 24 && kurs.minutes === 24);
testa("2.4 chapters_list-paritet (num+titel+minuter)", JSON.stringify(kurs.chapters_list) === JSON.stringify(kurs.chapters.map((c) => ({ num: c.num, title: c.title, minutes: c.minutes }))));
const blockTyper = kurs.chapters.flatMap((c) => c.blocks.map((b) => b.type));
const typräkning = blockTyper.reduce((a, t) => (a[t] = (a[t] || 0) + 1, a), {});
testa("2.5 blocktyper text 6 · definition 2 · tabell 2 · insight 6 · utmaning 1", typräkning.text === 6 && typräkning.definition === 2 && typräkning.tabell === 2 && typräkning.insight === 6 && typräkning.utmaning === 1, JSON.stringify(typräkning));
testa("2.6 varje kapitel har intro + minst 2 block", kurs.chapters.every((c) => typeof c.intro === "string" && c.intro.length > 20 && c.blocks.length >= 2));
testa("2.7 history: origin + evolution + modern", kurs.history && Object.keys(kurs.history).length === 3);
testa("2.8 tre mästarsektioner icke-tomma", ["lynchSection","grahamSection","ak1Section"].every((s) => kurs[s].length > 300));

// ── 3. Aritmetik — oberoende omräknad ────────────────────────────────────────
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
  "tillväxt 4,5−3,6 = 0,9 Mm³sk (flyttalstolerans)": Math.abs(4.5 - 3.6 - 0.9) < 1e-9,
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
for (const [namn, ok] of Object.entries(A)) testa("3.x aritmetik: " + namn, ok);
// signaturtalen närvarande i kurstexten (parsad)
const texter = [];
(function samla(o){ if (typeof o === "string") texter.push(o); else if (Array.isArray(o)) o.forEach(samla); else if (o && typeof o === "object") Object.values(o).forEach(samla); })(kurs);
const allt = texter.join("\n");
const signaturTal = ["7 460,0","948,0","12,7","2 480,0","1 920,0","22,6","560,0","248,0","840,0","672,0","1 392,0","144,0","392,0","556,0","6 900,0","8,1","11,00","10,50","160,0","4,5","3,6","0,9","900,0","225,0","36 000,0","12 400,0","8 000,0","40 400,0","32 320,0","0,800","8 080,0","20,0","262,0","119,0","198,0","435,0","54,1","310,0","170,0","220,0","10,0","34,4","80,0"];
const saknasTal = signaturTal.filter((t) => !allt.includes(t));
testa("3.y signaturtal " + signaturTal.length + " st närvarande i kurstexten", saknasTal.length === 0, saknasTal.join(", "));

// ── 4. Korslänkar registeräkta (prefixmatch) ────────────────────────────────
// se-17-filtret är kvar (dokumenterat i prekollet): slug-FÄLTET bär prefixet.
const hänvisningar = [...new Set([...allt.matchAll(/\b([a-z]{1,9}-\d{1,3})\b/g)].map((m) => m[1]))].filter((h) => h !== "se-17");
const registerPrefix = new Set(Object.keys(reg).map((s) => s.split("-").slice(0, 2).join("-")));
const skuggor = hänvisningar.filter((h) => !registerPrefix.has(h));
testa("4.1 korslänkar registeräkta: " + hänvisningar.length + " hänvisningar, 0 skuggkoder", skuggor.length === 0, skuggor.join(", "));
const VÄNTADE = ["km-045","km-024","km-058","vr-02","mk-10","st-04","km-067","se-16","rs-08"];
testa("4.2 väntade grannar närvarande", VÄNTADE.every((p) => hänvisningar.some((h) => h === p || h.startsWith(p + "-"))), VÄNTADE.filter((p) => !hänvisningar.some((h) => h === p || h.startsWith(p + "-"))).join(","));
// Kategorin SEKTORANALYS i REGISTRET: 28 kurser (16 se-kurser + 11 km-skissor
// + se-17) — Front B:s fulläst-läsare bär 27 (alla utom se-17).
testa("4.3 granne-kedjan: km-skissfamiljens sektorkategoriparitet (registret bär 28 i kategorin)", Object.keys(reg).filter((s) => reg[s].category === "SEKTORANALYS").length === 28);

// ── 5. Juridikgrind ──────────────────────────────────────────────────────────
const rådsfraser = ["köp denna aktie","sälj denna aktie","rekommenderar köp","rekommenderar att du köper","du bör köpa","du bör sälja","investera i denna","tipsa om aktien","aktietips"];
const rådsTräff = rådsfraser.filter((f) => allt.toLowerCase().includes(f));
testa("5.1 juridikgrind: 0 rådgivningsfraser", rådsTräff.length === 0, rådsTräff.join(", "));
const lagrum = allt.match(/\b(19|20)\d{2}:\d{3,4}\b/g) || [];
testa("5.2 juridikgrind: 0 lagrum i kurstexten", lagrum.length === 0, lagrum.join(", "));
testa("5.3 utbildningsframing närvarande", allt.includes("Detta är utbildning") && allt.includes("inte uppmaningar att köpa eller sälja"));
testa("5.4 påhittade exempel deklarerade", allt.includes("PÅHITTADE TAL") && allt.includes("påhittat bolag"));
// R2: lookahead — "kronor" är prosa, "9 999 kr"-klassen matchar (prekoll-fyxen, o16-klassen)
const prisYtor = [/pris per månad/i, /tier/i, / Fas 2 /, / Fas 3 /, /\d{3,5} kr(?![a-zåäö])/];
testa("5.5 R2: 0 pris-/tier-ytor", !prisYtor.some((re) => re.test(allt)));

// ── 6. Registerläge efter kedja ─────────────────────────────────────────────
const antalReg = Object.keys(reg).length;
const konstant = Number((kartaText.match(/LARVAG_ANTAL_KURSER = (\d+)/) || [])[1]);
testa("6.1 registerantal " + antalReg + " = kartkonstant " + konstant, antalReg === konstant && antalReg === 433, `reg=${antalReg} karta=${konstant}`);
testa("6.2 se-17 i kartan med niva 2 kraverFas 0 vIndex -1 minuter 24", new RegExp('slug: "' + MIN + '".*niva: 2, kraverFas: 0, vIndex: -1, minuter: 24').test(kartaText));
for (const f of ["public/llms.txt", "public/llms-full.txt"]) {
  const t = readFileSync(ROT + "/" + f, "utf8");
  const träffar = [...t.matchAll(/433 kurser/g)].length;
  testa("6.3 llms " + f.split("/").pop() + " bär 433 (0 kvar av 432)", träffar > 0 && !t.includes("432 kurser"), `träffar=${träffar}`);
}
const mentor = readFileSync(ROT + "/src/lib/ai-mentor-register.ts", "utf8");
testa("6.4 mentorsregister bär " + MIN, mentor.includes(MIN));
const siffror = JSON.parse(readFileSync(ROT + "/data/siffror.json", "utf8"));
const siffKurser = siffror.kurser ?? siffror.antalKurser ?? siffror.kursAntal;
testa("6.5 siffror.json bär kursantalet 433", Object.values(siffror).some((v) => v === 433), "värden: " + Object.entries(siffror).filter(([, v]) => typeof v === "number").slice(0, 8).map(([k, v]) => k + "=" + v).join(", "));
const larvagSynk = JSON.parse(readFileSync(ROT + "/data/vakten/larvag-synk.json", "utf8"));
testa("6.6 larvag-synk GRÖN " + [larvagSynk.registerAntal, larvagSynk.kartaAntal, larvagSynk.konstantAntal].join("="), larvagSynk.status === "grön" && larvagSynk.registerAntal === 433);

// ── 7. Språkgrind (parsad text) ─────────────────────────────────────────────
const språk = [];
if (/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/.test(allt)) språk.push("CJK");
if (/[\u00ad]/.test(allt)) språk.push("mjukt bindestreck");
if (/[""'']/.test(allt)) språk.push("typografiskt citattecken");
if (/\t/.test(allt)) språk.push("tabb");
if (/ {2,}/.test(allt)) språk.push("dubbelt mellanslag");
const svartlista = ["bearer","läsers","passing","gröns","Few ","glipen","sektoorn","godisdjupt","seårs","underhållsomkostnader","blander","blånder","edge ","return on"];
for (const s of svartlista) if (allt.includes(s)) språk.push("svartlista «" + s + "»");
testa("7.1 språkgrind parsad text: 0 fynd", språk.length === 0, språk.join(", "));
// parentesbalans
const öppna = (allt.match(/\(/g) || []).length, stäng = (allt.match(/\)/g) || []).length;
testa("7.2 parentesbalans", öppna === stäng, öppna + "≠" + stäng);

console.log(pass.join("\n"));
if (fail.length) { console.error("\n" + fail.join("\n")); console.error(`\nKVD RÖD: ${pass.length} PASS, ${fail.length} FEL`); process.exit(1); }
console.log(`\nKVD GRÖN: ${pass.length} PASS 0 FEL — ${MIN} round-trippad, aritmetik oberoende omräknad, korslänkar registeräkta, juridik + språk rena, register 433.`);
