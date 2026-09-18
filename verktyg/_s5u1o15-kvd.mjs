#!/usr/bin/env node
/**
 * KVD — s5-u1 omgång 15 (manifest auto-s5-1789722300593): bk-05-redovisningspolitiken.
 * Kvalitetsverifiering FÖRE commit: struktur, round-trip, aritmetik med oberoende
 * omräkning, korslänkar, juridikgrind, språkgrind, R2, register-paritet.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const SLUG = "bk-05-redovisningspolitiken";
const kurs = JSON.parse(readFileSync("data/kurser-tillagg/" + SLUG + ".json", "utf8"));
const regAll = JSON.parse(readFileSync("public/deep-courses.json", "utf8"));
const reg = regAll[SLUG];
const kartaText = readFileSync("src/lib/larvag-karta.ts", "utf8");
const siffror = JSON.parse(readFileSync("data/siffror.json", "utf8"));
const sok = JSON.parse(readFileSync("public/sok-index.json", "utf8"));
const speglar = JSON.parse(readFileSync("public/speglar-slugar.json", "utf8"));
const llms = readFileSync("public/llms.txt", "utf8");
const llmsFull = readFileSync("public/llms-full.txt", "utf8");
const mentorText = readFileSync("src/lib/ai-mentor-register.ts", "utf8");

const pass = [], fail = [];
const testa = (namn, villkor, detalj) => (villkor ? pass : fail).push(`${villkor ? "PASS" : "FAIL"} ${namn}${detalj ? " — " + detalj : ""}`);
const TEXT = JSON.stringify(kurs);

// ── 1. Struktur ──────────────────────────────────────────────────────────────
const ROTFALT = ["slug","category","weight","chapterCount","totalMinutes","title","summary","minutes","xp","level","learn","why","history","chapters_list","chapters","lynchSection","grahamSection","ak1Section"];
testa("S1 kursfilen bär exakt de 18 rotfält serien kräver", Object.keys(kurs).length === ROTFALT.length && ROTFALT.every(f => f in kurs), `faktiskt ${Object.keys(kurs).length}`);
testa("S2 slug ren ASCII och seriekorrekt", /^[a-z0-9][a-z0-9-]*$/.test(kurs.slug) && kurs.slug.startsWith("bk-05-"));
testa("S3 kategori + nivå + xp i seriemönster", kurs.category === "BOKFÖRING & ÅRSREDOVISNING" && kurs.level === "Avancerad" && kurs.xp === 50);
testa("S4 kapitelantal 6 = chapters = chapters_list", kurs.chapterCount === 6 && kurs.chapters.length === 6 && kurs.chapters_list.length === 6);
testa("S5 minuter: varje kapitel 4, summa = totalMinutes = minutes = 24", kurs.chapters.every(c => c.minutes === 4) && kurs.chapters.reduce((a,c)=>a+c.minutes,0) === 24 && kurs.totalMinutes === 24 && kurs.minutes === 24);
testa("S6 chapters_list ↔ chapters paritet (num, titel, minuter)", kurs.chapters_list.every((cl,i) => cl.num === kurs.chapters[i].num && cl.title === kurs.chapters[i].title && cl.minutes === kurs.chapters[i].minutes));
testa("S7 varje kapitel: intro + text-block + minst en insight/definition/tabell", kurs.chapters.every(c => c.intro && c.blocks.some(b => b.type === "text") && c.blocks.some(b => ["insight","definition","tabell"].includes(b.type))));
testa("S8 history bär origin/evolution/modern", !!(kurs.history && kurs.history.origin && kurs.history.evolution && kurs.history.modern));
testa("S9 blocktyper endast kända (text/definition/insight/tabell)", kurs.chapters.every(c => c.blocks.every(b => ["text","definition","insight","tabell"].includes(b.type))));

// ── 2. Round-trip register ↔ kursfil ────────────────────────────────────────
testa("R1 registerposten finns i deep-courses.json", !!reg);
testa("R2 registerposten djupidentisk med kursfilen", JSON.stringify(reg) === JSON.stringify(kurs));

// ── 3. Aritmetik med oberoende omräkning + räkneledsnärvaro ─────────────────
const arit = [
  ["A resultat 200−80−20=100", 200-80-20 === 100, TEXT.includes("200 minus 80 minus 20") && TEXT.includes("| Resultat | 100 |")],
  ["B resultat 200−80−10=110", 200-80-10 === 110, TEXT.includes("| Resultat | 100 | 110 |")],
  ["A kassaflöde 100+20=120", 100+20 === 120, TEXT.includes("100 plus 20") && TEXT.includes("| 120 | 120 |")],
  ["B kassaflöde 110+10=120", 110+10 === 120, TEXT.includes("110 plus 10")],
  ["A restvärde år1 100−20=80", 100-20 === 80, TEXT.includes("| Maskinens restvärde | 80 | 90 |")],
  ["B restvärde år1 100−10=90", 100-10 === 90, TEXT.includes("(100 minus 10)")],
  ["A restvärde år2 100−40=60", 100-40 === 60, TEXT.includes("restvärde 60 (100 minus 40)")],
  ["B restvärde år2 100−20=80", 100-20 === 80, TEXT.includes("80 (100 minus 20)")],
  ["Kontrakt 300·0,40=120", 300*0.40 === 120, TEXT.includes("120 Mkr (300 gånger 0,40)") && TEXT.includes("| År 1 | 120 | 0 |")],
  ["Kontraktserie 120+105+75=300", 120+105+75 === 300, TEXT.includes("| Summa | 300 | 300 |")],
  ["Kapitalisering 30/6=5", 30/6 === 5, TEXT.includes("30 dividerat med 6 blir 5")],
  ["Kapitaliseringsskillnad 30−5=25", 30-5 === 25, TEXT.includes("25") && TEXT.includes("| 30 | 5 |")],
  ["Balanspost år1 30−5=25", 30-5 === 25, TEXT.includes("25 efter år ett") || TEXT.includes("| 0 | 25 |")],
  ["P/E A 1000/100=10,0", 1000/100 === 10, TEXT.includes("P/E 10,0") && TEXT.includes("| 10,0 | 9,1 |")],
  ["P/E B 1000/110≈9,1", Math.abs(1000/110 - 9.0909) < 0.001 && +(1000/110).toFixed(1) === 9.1, TEXT.includes("9,1")],
  ["Jämkt B EBIT 200−80−20=100", 200-80-20 === 100, TEXT.includes("B:s EBIT blir 100") && TEXT.includes("| 100 | 110 | 100 |")],
  ["Skenbar rabatt 10,0/9,1≈1,10 (tio procent)", Math.abs(10/(1000/110) - 1.10) < 0.01, TEXT.includes("tio procent")],
];
for (const [namn, beraknad, narvarande] of arit) testa("A·" + namn, beraknad && narvarande, beraknad ? (narvarande ? "" : "räkneled saknas i text") : "beräkning fel");

// ── 4. Korslänkar registeräkta (prefixmatch) ────────────────────────────────
const prefix = [...new Set([...TEXT.matchAll(/\b(km-\d{3}|bk-0\d|ln-0\d|st-0\d|tx-0\d|vr-0\d|v\d{2}|mt-0\d)/g)].map(m=>m[0]))];
const saknade = prefix.filter(p => p !== "bk-05" && !Object.keys(regAll).some(s => s.startsWith(p)));
testa("K1 samtliga " + prefix.length + " korslänksprefix registeräkta (bk-05 = självreferens)", saknade.length === 0, saknade.join(", "));

// ── 5. Juridikgrind ─────────────────────────────────────────────────────────
const radFras = ["köp denna", "köp den här aktien", "sälj aktien", "vi rekommenderar köp", "bör du köpa", "investera i denna aktie", "ta position i"];
const radFynd = radFras.filter(f => TEXT.toLowerCase().includes(f));
testa("J1 0 rådsfraser", radFynd.length === 0, radFynd.join("; "));
const lagrum = /(lagen\s*\(|\d{4}:\d+|§|IFRS\s*\d+|kap\.\s*\d+\s*§|årl\b|Bokföringsnäringslagen)/i;
const lagFynd = TEXT.match(lagrum);
testa("J2 0 lagrum/standardnummer i kurstext (mentorgrindens yta)", !lagFynd, lagFynd ? lagFynd[0] : "");
testa("J3 utbildningsframing närvarande (why + ak1Section)", /aldrig.*(?:investeringsråd|omdöme om en viss aktie)/.test(kurs.why) && /utbildning, aldrig investeringsråd/i.test(kurs.ak1Section));

// ── 6. Språkgrind ───────────────────────────────────────────────────────────
const cjk = [...TEXT].filter(c => { const o = c.codePointAt(0); return (o>=0x4e00&&o<=0x9fff)||(o>=0x3040&&o<=0x30ff)||(o>=0xac00&&o<=0xd7af); });
const kyr = [...TEXT].filter(c => { const o = c.codePointAt(0); return o>=0x400&&o<=0x4ff; });
const mjuka = [...TEXT].filter(c => c === "\u00ad");
const typCitat = [...TEXT].filter(c => ["\u2018","\u2019","\u201c","\u201d"].includes(c));
const tabbar = [...TEXT].filter(c => c === "\t");
const dubbelMell = (TEXT.match(/ (?= )/g) || []).length;
const engLackor = ["look", "positive", "triggered", "regardless", "concern", "flow", "garbage", "units", "younger", "почему"].filter(w => new RegExp("\\b" + w + "\\b", "i").test(TEXT));
testa("L1 0 CJK/kyrilliska/mjuka bindestreck/typografiska citattecken/tabbar/dubbla mellanslag", !cjk.length && !kyr.length && !mjuka.length && !typCitat.length && !tabbar.length && dubbelMell === 0, `cjk ${cjk.length} kyr ${kyr.length} mjuka ${mjuka.length} typCitat ${typCitat.length} tab ${tabbar.length} dubbelMell ${dubbelMell}`);
testa("L2 0 engelskaläckor (svartlista)", engLackor.length === 0, engLackor.join("; "));

// ── 7. R2 + register-paritet ────────────────────────────────────────────────
const bkRad = kartaText.match(new RegExp('\\{ slug: "' + SLUG + '", titel: "[^"]+", kategori: "BOKFÖRING & ÅRSREDOVISNING", niva: 3, kraverFas: 0, vIndex: -1, minuter: 24 \\}'));
testa("P1 kartad: niva 3, kraverFas 0 (R2: gratis — ingen pris-/tier-yta), vIndex −1", !!bkRad);
testa("P2 registerantal 415 överallt (register/konstant/siffror/sökindex/speglar)", Object.keys(regAll).length === 415 && Number(kartaText.match(/LARVAG_ANTAL_KURSER = (\d+)/)[1]) === 415 && siffror.kurser === 415 && sok.antal === 415 && speglar.antalKurser === 415, `reg ${Object.keys(regAll).length} konst ? siff ${siffror.kurser} sok ${sok.antal} speg ${speglar.antalKurser}`);
testa("P3 llms ×2 bär 415-ställena (6 + 4)", (llms.split("415 kurser").length - 1) === 6 && (llmsFull.split("415 kurser").length - 1) === 4);
testa("P4 mentorsregister bär bk-05-raden", mentorText.includes('{ slug: "' + SLUG + '"'));
testa("P5 quiz/XP oförändrade (kursen bär inga quiz)", siffror.quiz === 8223 && siffror.quizXp === 82230);
testa("P6 position: bk-05 står EFTER bk-04 i registrets nyckelordning", Object.keys(regAll).indexOf(SLUG) === Object.keys(regAll).indexOf("bk-04-koncernredovisningens-grunder") + 1);

// ── Rapport ─────────────────────────────────────────────────────────────────
console.log(pass.join("\n"));
if (fail.length) { console.error("\n" + fail.join("\n")); console.error(`\nKVD RÖD: ${pass.length} PASS, ${fail.length} FEL`); process.exit(1); }
console.log(`\nKVD GRÖN: ${pass.length} PASS 0 FEL 0 VARNING — bk-05 ${SLUG} klar för commit.`);
