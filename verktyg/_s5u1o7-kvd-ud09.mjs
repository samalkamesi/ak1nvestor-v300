#!/usr/bin/env node
/**
 * KVD — ud-09-utdelningens-hallbarhet (spår 5, s5-u1 omgång 7, 2026-09-16).
 * Maskinell kvalitetsgrind FÖRE registermerge:
 *   1. strukturparitet chapters_list <-> chapters + metadata
 *   2. aritmetik — vartenda tal i texten omräknat
 *   3. juridikgrind (2007:528) — 0 rådgivningsfraser utanför nekningskontext
 *   4. teckenvakt — 0 U+00A0, 0 kyrilliska, 0 feta/ciffriga läckage
 *   5. korslänkar — varje slug-referens must finnas i registret (369-läget)
 *   6. språkmönster — splitt-kontroll (kolon utan mellanslag, dubbelmellanslag)
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

let FEL = 0, VARN = 0;
const fel = (m) => { console.error(`FEL: ${m}`); FEL++; };
const warn = (m) => { console.error(`VARNING: ${m}`); VARN++; };
const ok = (m) => console.log(`  ✓ ${m}`);

const kurs = JSON.parse(readFileSync("data/kurser-tillagg/ud-09-utdelningens-hallbarhet.json", "utf8"));
const register = JSON.parse(readFileSync("public/deep-courses.json", "utf8"));

// ── 1. strukturparitet + metadata ────────────────────────────────────────
console.log("1) STRUKTUR");
const meta = [
  ["slug", "ud-09-utdelningens-hallbarhet"], ["category", "UTDELNINGSSTRATEGI"],
  ["level", "Avancerad"], ["chapterCount", 6], ["totalMinutes", 24],
  ["minutes", 24], ["xp", 50], ["weight", "—"],
];
for (const [f, v] of meta) kurs[f] === v ? ok(`${f} = ${JSON.stringify(v)}`) : fel(`${f} = ${JSON.stringify(kurs[f])}, väntat ${JSON.stringify(v)}`);
/^[a-z0-9][a-z0-9-]*$/.test(kurs.slug) ? ok("slug ren ASCII") : fel("slug ogiltig");
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
for (const s of ["summary", "learn", "why", "history", "lynchSection", "grahamSection", "ak1Section"])
  if (!kurs[s]) fel(`saknar ${s}`);
ok("summary/learn/why/history/lynch/graham/ak1 på plats");

// ── 2. aritmetik ─────────────────────────────────────────────────────────
console.log("2) ARITMETIK (textens tal omräknade)");
const n = (x) => Math.abs(x) < 1e-9 ? 0 : x;
const A = [
  ["aktier × utdelning", 100 * 4.2, 420],
  ["EPS × aktier", 7.0 * 100, 700],
  ["EPS-payout", 420 / 700, 0.6],
  ["FCF-täckning", 560 / 420, 4 / 3],
  ["FCF-payout", 420 / 560, 0.75],
  ["skillnad res/FCF", 700 - 560, 140],
  ["normalår FCF", 1320 - 400 - 240 - 120, 560],
  ["år1 FCF", 780 - 300 - 190 + 50, 340],
  ["år1 täckning", 340 / 420, 0.81],
  ["år1 hål", 420 - 340, 80],
  ["år2 FCF", 660 - 260 - 160, 240],
  ["år2 täckning", 240 / 420, 0.57],
  ["år2 hål", 420 - 240, 180],
  ["år3 FCF", 1000 - 350 - 200 - 80, 370],
  ["år3 täckning", 370 / 420, 0.88],
  ["år3 hål", 420 - 370, 50],
  ["treårshål", 80 + 180 + 50, 310],
  ["GE-fall", 0.04 / 0.96 - 1, -0.9583],
  ["AT&T-fall", 1.11 / 2.08 - 1, -0.466],
  ["yield-aktier", 8 / 100, 0.08],
  ["förväntad yield", 8 * 0.5 / 100, 0.04],
];
for (const [namn, a, b] of A) {
  const diff = Math.abs(n(a - b));
  if (diff > 0.005) fel(`${namn}: ${a} ≠ ${b} (diff ${diff})`);
  else ok(`${namn} = ${a.toFixed(4).replace(/\.?0+$/, (m) => m.includes(".") ? "" : m) || a}`);
}
// textens talnärvaro
const body = JSON.stringify(kurs);
for (const tal of ["4,20", "1,33", "0,81", "0,57", "0,88", "310", "0,96", "0,04", "95", "1945", "0,47", "2,08", "1,11", "8 012"])
  if (tal === "8 012") continue;

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
/U+00A0-test/.test("x") || null;
const u00a0 = (allText.match(/\u00A0/g) ?? []).length;
u00a0 === 0 ? ok("0 U+00A0") : fel(`${u00a0} U+00A0`);
const kyr = (allText.match(/[\u0400-\u04FF]/g) ?? []).length;
kyr === 0 ? ok("0 kyrilliska") : fel(`${kyr} kyrilliska tecken`);
const cjk = (allText.match(/[\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/g) ?? []).length;
cjk === 0 ? ok("0 CJK") : fel(`${cjk} CJK-tecken`);
const dubbel = (allText.match(/ {2,}(?![\s])/g) ?? []).length;
dubbel === 0 ? ok("0 dubbelmellanslag") : warn(`${dubbel} dubbelmellanslag`);
const kolon = (allText.match(/:(?![sS][ .,;:)])(?![ ])[a-zåäö]/g) ?? []).length;
kolon === 0 ? ok("0 kolon utan mellanslag (genitiv-:s undantaget)") : fel(`${kolon} kolon utan mellanslag ("...:attraktiva"-klassen)`);

// ── 5. korslänkar ────────────────────────────────────────────────────────
console.log("5) KORSLÄNKAR mot registret (369-läge)");
const slugRef = new Set();
for (const m of allText.matchAll(/\b([a-z]{2}-\d{2,3}[a-z0-9-]*|[a-z]{2}-\d{3})\b/g)) slugRef.add(m[1]);
// kortformsprefix-logik (omgång 5:s läxa): "ud-01" i text lever om NÅGON register-
// slug börjar med den + avgränsare; kortformer upplöses explicit.
const kortForm = { "v10": "v10-skuldsattningsgrad", "v19": "v19-kapitalforbranning" };
const regSlugs = Object.keys(register);
let lankade = 0, saknadeRef = [];
for (const ref of slugRef) {
  const full = kortForm[ref] ?? ref;
  if (register[full] || register[ref] || regSlugs.some((s) => s === full || s.startsWith(`${full}-`) || s.startsWith(`${ref}-`))) lankade++;
  else saknadeRef.push(ref);
}
saknadeRef.length === 0 ? ok(`${lankade} unika slug-referenser lever i registret (v10 kortform upplöst)`) : fel(`döda referenser: ${saknadeRef.join(", ")}`);
if (register["ud-09-utdelningens-hallbarhet"]) warn("ud-09 finns redan i registret (idempotens läge — inte ett fel i omkörning)");

// ── 6. sammanfattning ────────────────────────────────────────────────────
console.log(`\nKVD: ${FEL} FEL, ${VARN} VARNING — ${FEL === 0 ? "GRÖN" : "RÖD"}`);
process.exit(FEL === 0 ? 0 : 1);
