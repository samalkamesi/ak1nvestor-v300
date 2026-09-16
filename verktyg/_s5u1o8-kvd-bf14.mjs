#!/usr/bin/env node
/**
 * KVD — bf-14-beteendeportfoljteori (spår 5, s5-u1 omgång 8, 2026-09-16).
 * Maskinell kvalitetsgrind FÖRE registermerge (u1-omg7-mönstret):
 *   1. strukturparitet chapters_list <-> chapters + metadata
 *   2. aritmetik — vartenda tal i texten omräknat
 *   3. juridikgrind (2007:528) — 0 rådgivningsfraser utanför nekningskontext
 *   4. teckenvakt — 0 U+00A0, 0 kyrilliska/CJK, 0 mjuka bindestreck
 *   5. korslänkar — varje slug-referens måste finnas i registret (prefix-logik)
 *   6. språkmönster — kolon/dubbelmellanslag/versal-after-semikolon/engelskläckor
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

let FEL = 0, VARN = 0;
const fel = (m) => { console.error(`FEL: ${m}`); FEL++; };
const warn = (m) => { console.error(`VARNING: ${m}`); VARN++; };
const ok = (m) => console.log(`  ✓ ${m}`);

const kurs = JSON.parse(readFileSync("data/kurser-tillagg/bf-14-beteendeportfoljteori.json", "utf8"));
const register = JSON.parse(readFileSync("public/deep-courses.json", "utf8"));

// ── 1. strukturparitet + metadata ────────────────────────────────────────
console.log("1) STRUKTUR");
const meta = [
  ["slug", "bf-14-beteendeportfoljteori"], ["category", "BETEENDEFINANS"],
  ["level", "Avancerad"], ["chapterCount", 6], ["totalMinutes", 24],
  ["minutes", 24], ["xp", 50], ["weight", "—"],
];
for (const [f, v] of meta) kurs[f] === v ? ok(`${f} = ${JSON.stringify(v)}`) : fel(`${f} = ${JSON.stringify(kurs[f])}, väntat ${JSON.stringify(v)}`);
/^[a-z0-9][a-z0-9-]*$/.test(kurs.slug) ? ok("slug ren ASCII") : fel("slug ogiltig");
if (register[kurs.slug]) fel("slug finns redan i registret (kollision!)");
else ok("slug fri i registret");
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

// ── 2. aritmetik ─────────────────────────────────────────────────────────
console.log("2) ARITMETIK (textens tal omräknade)");
const A = [
  ["lager-summa", 420000 + 360000 + 300000 + 120000, 1200000],
  ["andel-summa", 35 + 30 + 25 + 10, 100],
  ["trygghetsandel", 420000 / 1200000, 0.35],
  ["utdelningsandel", 360000 / 1200000, 0.30],
  ["tillväxtandel", 300000 / 1200000, 0.25],
  ["chansandel", 120000 / 1200000, 0.10],
  ["utdelningsmål", 360000 * 0.040, 14400],
  ["tillväxtmål", 300000 * 0.080, 24000],
  ["chans-tak", 120000 * 10, 1200000],
  ["aktieandel kronor", 360000 + 300000 + 120000, 780000],
  ["aktieandel andel", 780000 / 1200000, 0.65],
  ["60/40 aktier", 1200000 * 0.60, 720000],
  ["60/40 ränta", 1200000 * 0.40, 480000],
  ["skillnad mot 60/40", 780000 - 720000, 60000],
  ["chock utdelningslager", 360000 * 0.20, 72000],
  ["chock tillväxtlager", 300000 * 0.40, 120000],
  ["chock chanslager", 120000 * 0.50, 60000],
  ["chock-summa", 72000 + 120000 + 60000, 252000],
  ["chock-andel", 252000 / 1200000, 0.21],
  ["portfölj efter chock", 1200000 - 252000, 948000],
  ["golv kvar", 420000, 420000],
  ["chans dubblad vinst", 120000, 120000],
  ["chans totalförlust", 120000 / 1200000, 0.10],
];
for (const [namn, a, b] of A) {
  const diff = Math.abs(a - b);
  if (diff > 0.005) fel(`${namn}: ${a} ≠ ${b} (diff ${diff})`);
  else ok(`${namn} = ${a}`);
}
// textens talnärvaro (svensk format med mellanslag tusental, komma decimal)
const body = JSON.stringify(kurs);
for (const tal of ["1 200 000", "14 400", "24 000", "780 000", "65 procent", "720 000", "480 000", "60 000", "72 000", "252 000", "21,0 procent", "948 000", "1948", "1952", "1979", "1985", "2000", "30 procent", "10 procent"])
  body.includes(tal) ? ok(`texten nämner "${tal}"`) : fel(`texten nämner INTE "${tal}"`);

// ── 3. juridikgrind ──────────────────────────────────────────────────────
console.log("3) JURIDIKGRIND (2007:528)");
const texter = [kurs.summary, kurs.learn, kurs.why, ...kurs.chapters.flatMap((k) => [k.intro, ...k.blocks.map((b) => b.content)]), kurs.lynchSection, kurs.grahamSection, kurs.ak1Section, ...Object.values(kurs.history)];
const allText = texter.join("\n");
const radsFrasor = [/köp den här aktien/i, /sälj din aktie/i, /du (bör|borde) (köpa|sälja|investera i)/i, /rekommenderar (att )?(du )?(köper|säljer|investera)/i, /vårt (tips|råd) är (att )?köp/i, /placera dina pengar i/i];
for (const re of radsFrasor) if (re.test(allText)) fel(`rådgivningsfras matchad: ${re}`);
ok("0 rådgivningsfraser");
const nekningar = allText.match(/aldrig en uppmaning att köpa eller sälja[^.]*\./g);
(nekningar ?? []).length >= 1 ? ok(`utbildningsframing närvaro (${nekningar.length} nekningsfras)`) : warn("utbildningsframen hittades inte mönstermässigt — kontrollera manuellt");
for (const ord of ["köp", "sälj"]) {
  const trajffar = [...allText.matchAll(new RegExp(`[^.]*\\b${ord}\\w*[^.]*\\.`, "gi"))].map((m) => m[0].trim().slice(0, 90));
  if (trajffar.length > 4) warn(`ordet "${ord}" förekommer ${trajffar.length} gånger — kontrollera kontext`);
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
const regSlugs = Object.keys(register);
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
const engLackor = allText.match(/\b(the|and|with|of|from|that|this)\b/gi) ?? [];
engLackor.length === 0 ? ok("0 engelska funktionsord") : fel(`engelska funktionsord: ${[...new Set(engLackor.map(w=>w.toLowerCase()))].join(", ")}`);
const versaler = [...allText.matchAll(/\b[A-ZÅÄÖ]{4,}\b/g)].map((m) => m[0]);
const tillatna = new Set(["BETEENDEFINANS", "AK1A", "AKM2", "AK1TS"]);
const främstaVers = versaler.filter((v) => !tillatna.has(v) && !v.includes("-"));
främstaVers.length === 0 ? ok("0 främmande VERSALORD") : warn(`VERSALORD att granska: ${[...new Set(främstaVers)].join(", ")}`);

// ── 7. sammanfattning ────────────────────────────────────────────────────
const ord = allText.split(/\s+/).filter(Boolean).length;
console.log(`\nBody+meta: ${ord} ord`);
console.log(`KVD: ${FEL} FEL, ${VARN} VARNING — ${FEL === 0 ? "GRÖN" : "RÖD"}`);
process.exit(FEL === 0 ? 0 : 1);
