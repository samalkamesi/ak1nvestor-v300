#!/usr/bin/env node
/**
 * KVD — ks-04-emissionens-mekanik (spår 5, s5-u1 omgång 9, 2026-09-17).
 * Maskinell kvalitetsgrind EFTER registermerge (post-merge-läge — kursen är
 * redan i registret; round-trip-verifieras i stället för slug-frihet):
 *   1. strukturparitet chapters_list <-> chapters + metadata + register-round-trip
 *   2. aritmetik — vartenda tal i texten omräknat (u1-omg8-mönstret)
 *   3. juridikgrind (2007:528) — 0 rådgivningsfraser; köp/sälj-kontext granskas
 *   4. teckenvakt — 0 U+00A0, 0 kyrilliska/CJK, 0 mjuka bindestreck
 *   5. korslänkar — varje slug-referens måste finnas i registret (prefix-logik)
 *   6. språkmönster — kolon/dubbelmellanslag/versal-efter-semikolon/engelskläckor
 *   7. kedjestatus — register = karta = konstant = siffror = llms (6+4 mönster)
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

let FEL = 0, VARN = 0;
const fel = (m) => { console.error(`FEL: ${m}`); FEL++; };
const warn = (m) => { console.error(`VARNING: ${m}`); VARN++; };
const ok = (m) => console.log(`  ✓ ${m}`);

const kurs = JSON.parse(readFileSync("data/kurser-tillagg/ks-04-emissionens-mekanik.json", "utf8"));
const register = JSON.parse(readFileSync("public/deep-courses.json", "utf8"));

// ── 1. strukturparitet + metadata + round-trip ───────────────────────────
console.log("1) STRUKTUR");
const meta = [
  ["slug", "ks-04-emissionens-mekanik"], ["category", "KAPITALSTRUKTUR"],
  ["level", "Intermediär"], ["chapterCount", 6], ["totalMinutes", 24],
  ["minutes", 24], ["xp", 50], ["weight", "—"],
];
for (const [f, v] of meta) kurs[f] === v ? ok(`${f} = ${JSON.stringify(v)}`) : fel(`${f} = ${JSON.stringify(kurs[f])}, väntat ${JSON.stringify(v)}`);
/^[a-z0-9][a-z0-9-]*$/.test(kurs.slug) ? ok("slug ren ASCII") : fel("slug ogiltig");
const regPost = register[kurs.slug];
regPost ? ok("slug finns i registret (post-merge-läge)") : fel("saknas i registret");
if (regPost && JSON.stringify(regPost) !== JSON.stringify(kurs)) fel("registerpost ≠ källfil (round-trip bruten)");
else ok("register↔källfil round-trip IDENTISK");
const regSlugs = Object.keys(register);
const ksPos = regSlugs.indexOf("ks-04-emissionens-mekanik");
const ksFore = regSlugs.lastIndexOf("ks-03-skuldens-anatomi");
ksPos === ksFore + 1 ? ok(`serieordning: ks-04 direkt efter ks-03 (position ${ksPos})`) : fel(`serieordning brutet: ks-04=${ksPos}, ks-03=${ksFore}`);
if (regSlugs.length !== 382) fel(`registret ${regSlugs.length} ≠ 382`); else ok("registret = 382 kurser");
if (kurs.chapters_list.length !== kurs.chapters.length) fel(`chapters_list ${kurs.chapters_list.length} ≠ chapters ${kurs.chapters.length}`);
else ok("chapters_list = chapters längd");
kurs.chapters_list.forEach((c, i) => {
  const k = kurs.chapters[i];
  if (c.num !== k.num || c.title !== k.title || c.minutes !== k.minutes)
    fel(`paritetsbrott kapitel ${c.num}: list=${JSON.stringify(c)} vs body=${JSON.stringify({ num: k.num, title: k.title, minutes: k.minutes })}`);
});
ok("paritet num/title/minutes ×6");
const saknas = kurs.chapters.filter((k) => !Array.isArray(k.blocks) || !k.intro || k.blocks.length < 2);
saknas.length === 0 ? ok("intro + ≥2 blocks per kapitel") : fel(`kapitel utan intro/blocks: ${saknas.map((k) => k.num).join(",")}`);
const extrafalt = kurs.chapters.flatMap((k) => k.blocks).filter((b) => Object.keys(b).join(",") !== "type,content");
extrafalt.length === 0 ? ok("blocks bär exakt type+content (formatparitet)") : fel(`extra blockfält: ${extrafalt.length}`);
for (const s of ["summary", "learn", "why", "history", "lynchSection", "grahamSection", "ak1Section"]) if (!kurs[s]) fel(`saknar ${s}`);
ok("summary/learn/why/history/lynch/graham/ak1 på plats");
for (const h of ["origin", "evolution", "modern"]) if (!kurs.history[h]) fel(`history saknar ${h}`);
ok("history origin/evolution/modern");
const tillatnaTyper = new Set(["text", "definition", "insight", "tabell", "utmaning"]);
const felTyper = kurs.chapters.flatMap((k) => k.blocks).filter((b) => !tillatnaTyper.has(b.type));
felTyper.length === 0 ? ok("blocktyper inom kursformatet (text/definition/insight/tabell/utmaning)") : fel(`okända blocktyper: ${felTyper.map((b) => b.type).join(",")}`);

// ── 2. aritmetik ─────────────────────────────────────────────────────────
console.log("2) ARITMETIK (textens tal omräknade)");
const A = [
  ["börsvärde före", 100 * 10, 1000],
  ["nya aktier", 200 / 8, 25],
  ["kvotten", 100 / 25, 4],
  ["ex-kurs väg 1", (4 * 10 + 1 * 8) / 5, 9.6],
  ["ex-kurs väg 2", (1000 + 200) / 125, 9.6],
  ["två vägar samma tal", (4 * 10 + 8) / 5, (1000 + 200) / 125],
  ["rättvärde formel", (10 - 8) / (4 + 1), 0.4],
  ["rättvärde kontroll vinst", 9.6 - 8, 1.6],
  ["rättvärde kontroll fyra", 4 * 0.4, 1.6],
  ["val A betalning", 1 * 8, 8],
  ["val A värde", 5 * 9.6, 48],
  ["val A sluten ekvation", 40 + 8, 48],
  ["val B aktier", 4 * 9.6, 38.4],
  ["val B rättigheter", 4 * 0.4, 1.6],
  ["val B sluten ekvation", 38.4 + 1.6, 40],
  ["val C förlust kronor", 40 - 38.4, 1.6],
  ["val C förlust procent", 1.6 / 40, 0.04],
  ["kursfall procent", (10 - 9.6) / 10, 0.04],
  ["utspädningsandel", 100 / 125, 0.8],
  ["nytt kapital per aktie", 200 / 125, 1.6],
  ["rabatt grundfall", (10 - 8) / 10, 0.2],
  ["kris nya aktier", 200 / 2, 100],
  ["kris total", 100 + 100, 200],
  ["kris ex-kurs", (1 * 4 + 1 * 2) / 2, 3],
  ["kris förlust procent", (4 - 3) / 4, 0.25],
  ["kris andel", 100 / 200, 0.5],
  ["kris rättvärde", (4 - 2) / 2, 1],
  ["kvittning emission", 25 * 8, 200],
  ["kvittning ex-kurs", (1000 + 200) / 125, 9.6],
  ["kvittning bankandel", 25 / 125, 0.2],
  ["garantiavgift", 0.02 * 200, 4],
  ["skuld/EK före", 400 / 600, 0.6667],
  ["skuld/EK efter", 400 / 800, 0.5],
  ["ROE före", 60 / 600, 0.1],
  ["ROE efter direkt", 60 / 800, 0.075],
];
for (const [namn, a, b] of A) {
  const diff = Math.abs(a - b);
  if (diff > 0.005) fel(`${namn}: ${a} ≠ ${b} (diff ${diff})`);
  else ok(`${namn} = ${a}`);
}
const body = JSON.stringify(kurs);
for (const tal of ["1 000 miljoner", "125 miljoner", "100 miljoner", "25 miljoner", "9,60", "0,40", "1,60", "38,40", "40,00", "48", "0,67", "0,50", "7,5 procent", "60 ÷ 600", "60 ÷ 800", "20 procent", "25 procent", "50 procent", "80 procent", "4 miljoner", "3,00"])
  body.includes(tal) ? ok(`texten nämner "${tal}"`) : fel(`texten nämner INTE "${tal}"`);
for (const ord of ["teoretisk ex-kurs", "teckningsrätt", "kvittningsemission", "riktad", "riktade emissioner", "garantikommitté", "BTA", "TERP", "företrädesrätt"])
  body.toLowerCase().includes(ord.toLowerCase()) ? ok(`begrepp närvarande: "${ord}"`) : fel(`begrepp saknas: "${ord}"`);

// ── 3. juridikgrind ──────────────────────────────────────────────────────
console.log("3) JURIDIKGRIND (2007:528)");
const texter = [kurs.summary, kurs.learn, kurs.why, ...kurs.chapters.flatMap((k) => [k.intro, ...k.blocks.map((b) => b.content)]), kurs.lynchSection, kurs.grahamSection, kurs.ak1Section, ...Object.values(kurs.history)];
const allText = texter.join("\n");
const radsFrasor = [/köp den här aktien/i, /sälj din aktie/i, /du (bör|borde) (köpa|sälja|investera i)/i, /rekommenderar (att )?(du )?(köper|säljer|investera)/i, /vårt (tips|råd) är (att )?köp/i, /placera dina pengar i/i];
for (const re of radsFrasor) if (re.test(allText)) fel(`rådgivningsfras matchad: ${re}`);
ok("0 rådgivningsfraser");
const nekningar = allText.match(/aldrig en uppmaning[^.]*\./g) ?? allText.match(/utbildning[^.]*aldrig[^.]*\./g);
(nekningar ?? []).length >= 1 ? ok(`utbildningsframing närvaro (${nekningar.length} nekningsfras)`) : warn("utbildningsframen hittades inte mönstermässigt — kontrollera manuellt");
for (const ord of ["köp", "sälj"]) {
  const trajffar = [...allText.matchAll(new RegExp(`[^.]*\\b${ord}\\w*[^.]*\\.`, "gi"))].map((m) => m[0].trim().slice(0, 90));
  if (trajffar.length > 5) warn(`ordet "${ord}" förekommer ${trajffar.length} gånger — kontrollera kontext`);
  else trajffar.forEach((t) => console.log(`    kontext [${ord}]: "${t}…"`));
}

// ── 4. teckenvakt ────────────────────────────────────────────────────────
console.log("4) TECKENVAKT");
const u00a0 = (allText.match(/\u00A0/g) ?? []).length;
u00a0 === 0 ? ok("0 U+00A0") : fel(`${u00a0} U+00A0`);
const kyr = (allText.match(/[\u0400-\u04FF]/g) ?? []).length;
kyr === 0 ? ok("0 kyrilliska") : fel(`${kyr} kyrilliska tecken`);
const cjk = (allText.match(/[\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/g) ?? []).length;
cjk === 0 ? ok("0 CJK") : fel(`${cjk} CJK-tecken`);
const mjukBinde = (allText.match(/\u00AD/g) ?? []).length;
mjukBinde === 0 ? ok("0 mjuka bindestreck") : fel(`${mjukBinde} mjuka bindestreck`);

// ── 5. korslänkar ────────────────────────────────────────────────────────
console.log("5) KORSLÄNKAR mot registret");
const slugRef = new Set();
for (const m of allText.matchAll(/\b([a-z]{2}-\d{2,3}[a-z0-9-]*|[a-z]{2}-\d{3})\b/g)) slugRef.add(m[1]);
let lankade = 0, saknadeRef = [];
for (const ref of slugRef) {
  if (register[ref] || regSlugs.some((s) => s === ref || s.startsWith(`${ref}-`))) lankade++;
  else saknadeRef.push(ref);
}
saknadeRef.length === 0 ? ok(`${lankade} unika slug-referenser lever i registret (prefix-logik)`) : fel(`döda referenser: ${saknadeRef.join(", ")}`);

// ── 6. språkmönster ──────────────────────────────────────────────────────
console.log("6) SPRÅKMÖNSTER");
const dubbel = (allText.match(/ {2,}(?![\s])/g) ?? []).length;
dubbel === 0 ? ok("0 dubbelmellanslag") : warn(`${dubbel} dubbelmellanslag`);
const kolon = (allText.match(/:(?![sS][ .,;:)])(?![ ])[a-zåäö]/g) ?? []).length;
kolon === 0 ? ok("0 kolon utan mellanslag (genitiv-:s undantaget)") : fel(`${kolon} kolon utan mellanslag`);
const versal = (allText.match(/[;,][A-ZÅÄÖ]/g) ?? []).length;
versal === 0 ? ok("0 versal direkt efter semikolon/komma") : fel(`${versal} versal direkt efter semikolon/komma`);
// Svensk vakt: \b är ASCII-centrisk — "of" i "oförändrad" blir en (falsk) ordgräns
// eftersom ö inte räknas som ordtecken. Utgränsen utesluter svenska tecken efter
// matchningen (u2-omg8-läxan: kontrollen är också kod).
const engLackor = allText.match(/(?<![åäöÅÄÖ])\b(the|and|with|of|from|that|this)\b(?![åäöÅÄÖ])/gi) ?? [];
engLackor.length === 0 ? ok("0 engelska funktionsord") : fel(`engelska funktionsord: ${[...new Set(engLackor.map((w) => w.toLowerCase()))].join(", ")}`);
const versaler = [...allText.matchAll(/\b[A-ZÅÄÖ]{4,}\b/g)].map((m) => m[0]);
const tillatnaVers = new Set(["KAPITALSTRUKTUR", "AK1A", "AKM1", "AK1TS", "TERP", "BTA"]);
const framstaVers = versaler.filter((v) => !tillatnaVers.has(v) && !v.includes("-"));
framstaVers.length === 0 ? ok("0 främmande VERSALORD") : warn(`VERSALORD att granska (betoningar i löptext — ln-05-precedensen): ${[...new Set(framstaVers)].join(", ")}`);

// ── 7. kedjestatus ───────────────────────────────────────────────────────
console.log("7) KEDJESTATUS (register = karta = konstant = siffror = llms)");
const kartaText = readFileSync("src/lib/larvag-karta.ts", "utf8");
const kartAntal = ([...kartaText.matchAll(/slug: "/g)] ?? []).length;
const konstAntal = Number((kartaText.match(/LARVAG_ANTAL_KURSER\s*=\s*(\d+)/) ?? [])[1]);
kartAntal === 382 ? ok(`karta = ${kartAntal}`) : fel(`karta = ${kartAntal} ≠ 382`);
konstAntal === 382 ? ok(`LARVAG_ANTAL_KURSER = ${konstAntal}`) : fel(`konstant = ${konstAntal} ≠ 382`);
const siffror = JSON.parse(readFileSync("data/siffror.json", "utf8"));
siffror.kurser === 382 ? ok(`siffror.kurser = ${siffror.kurser} (quiz ${siffror.quiz} oförändrat)`) : fel(`siffror.kurser = ${siffror.kurser} ≠ 382`);
if (siffror.quiz !== 8223) fel(`quiz ändrat: ${siffror.quiz} ≠ 8 223 (kursen bär inga quiz)`); else ok("quiz 8 223 oförändrad");
for (const [fil, vantan] of [["public/llms.txt", 6], ["public/llms-full.txt", 4]]) {
  const t = readFileSync(fil, "utf8");
  const n = (t.match(/382 kurser/g) ?? []).length;
  n === vantan ? ok(`${fil}: ${n} mönster "382 kurser"`) : fel(`${fil}: ${n} ≠ ${vantan} mönster`);
  if (/381 kurser/.test(t)) fel(`${fil}: kvarvarande "381 kurser"`);
}
for (const [fil, behall] of [["public/llms.txt", 2], ["public/llms-full.txt", 1]]) {
  const t = readFileSync(fil, "utf8");
  const n = (t.match(/381(?![0-9])/g) ?? []).length;
  n === behall ? ok(`${fil}: ${n} bevarade historiska 381 (Dow/Coinbase)`) : fel(`${fil}: ${n} ≠ ${behall} bevarade 381-strängar`);
}

// ── 8. sammanfattning ────────────────────────────────────────────────────
const ord = allText.split(/\s+/).filter(Boolean).length;
console.log(`\nBody+meta: ${ord} ord`);
console.log(`KVD: ${FEL} FEL, ${VARN} VARNING — ${FEL === 0 ? "GRÖN" : "RÖD"}`);
process.exit(FEL === 0 ? 0 : 1);
