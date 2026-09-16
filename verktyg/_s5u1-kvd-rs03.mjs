#!/usr/bin/env node
/** KVD-sond för rs-03-dold-samvariation (spår 5, u1, 2026-09-16). */
import { readFileSync } from "node:fs";

const kurs = JSON.parse(readFileSync("data/kurser-tillagg/rs-03-dold-samvariation.json", "utf8"));
let fel = 0, varningar = 0;
const F = (m) => { fel++; console.log("FEL:", m); };
const V = (m) => { varningar++; console.log("VARNING:", m); };
const OK = (m) => console.log("GRÖN:", m);

// 1. Grundstruktur
if (!/^[a-z0-9][a-z0-9-]*$/.test(kurs.slug)) F(`slug ogiltig: ${kurs.slug}`);
for (const f of ["slug","category","title","summary","level","learn","why","history","chapters_list","chapters","lynchSection","grahamSection","ak1Section"])
  if (kurs[f] === undefined) F(`saknar fält ${f}`);
for (const f of ["origin","evolution","modern"]) if (!kurs.history?.[f]) F(`history saknar ${f}`);

// 2. Paritet chapters_list ↔ chapters
if (kurs.chapters_list.length !== kurs.chapters.length) F("chapters_list/chapters antal skiljer");
kurs.chapters_list.forEach((c, i) => {
  const k = kurs.chapters[i];
  if (c.num !== k.num || c.title !== k.title || c.minutes !== k.minutes) F(`paritetsbrott kapitel ${c.num}`);
});
if (kurs.chapterCount !== kurs.chapters.length) F("chapterCount ≠ antal kapitel");
const sumMin = kurs.chapters.reduce((s, c) => s + c.minutes, 0);
if (kurs.totalMinutes !== sumMin || kurs.minutes !== sumMin) F(`totalMinutes ${kurs.totalMinutes}/${kurs.minutes} ≠ kapitelsumma ${sumMin}`);

// 3. Blocktyper + blockstruktur
const tillatna = new Set(["text", "insight", "definition", "example", "quiz"]);
for (const kap of kurs.chapters) {
  if (!kap.intro || !Array.isArray(kap.blocks)) F(`kapitel ${kap.num}: saknar intro/blocks`);
  for (const b of kap.blocks) {
    if (!tillatna.has(b.type)) F(`kapitel ${kap.num}: okänd blocktyp ${b.type}`);
    if (typeof b.content !== "string" || !b.content.trim()) F(`kapitel ${kap.num}: tomt block ${b.type}`);
    for (const nyckel of Object.keys(b)) if (!["type", "content"].includes(nyckel)) F(`kapitel ${kap.num}: främmande fält "${nyckel}" i block`);
  }
}

// 4. Räkneexempel — Markowitz-aritmetik (två tillgångar à 20 %, 50/50)
const sig = (rho) => Math.sqrt(2 * 0.25 * 0.04 + 2 * 0.25 * rho * 0.04);
const r = { noll: sig(0), halv: sig(0.5), ett: sig(1), nio: sig(0.9) };
const nast = (v, m) => Math.abs(v * 100 - m) < 0.06;
if (!nast(r.noll, 14.1)) F(`ρ=0 ger ${(r.noll * 100).toFixed(2)} % — texten säger 14,1`);
if (!nast(r.halv, 17.3)) F(`ρ=0,5 ger ${(r.halv * 100).toFixed(2)} % — texten säger 17,3`);
if (!nast(r.ett, 20)) F(`ρ=1 ger ${(r.ett * 100).toFixed(2)} % — texten säger 20`);
if (!nast(r.nio, 19.5)) F(`ρ=0,9 ger ${(r.nio * 100).toFixed(2)} % — texten säger 19,5`);
OK(`Markowitz-aritmetik: ρ0→${(r.noll * 100).toFixed(2)}% ρ0,5→${(r.halv * 100).toFixed(2)}% ρ0,9→${(r.nio * 100).toFixed(2)}% ρ1→${(r.ett * 100).toFixed(2)}% (text: 14,1/17,3/19,5/20)`);

// 5. Teckenhygien: U+00A0, kyrilliska, dubbla mellanslag
const allt = JSON.stringify(kurs);
if (allt.includes(" ")) F("hårt mellanslag (U+00A0) i texten");
if (/[\u0400-\u04FF]/.test(allt)) F("kyrilliska tecken i texten");
if (/  +/.test(allt.replace(/\\n/g, ""))) V("dubbla mellanslag i texten");

// 6. Juridikgrind — rådgivningsformuleringar (kontextlästa)
const body = [kurs.summary, kurs.learn, kurs.why, ...kurs.chapters.flatMap(c => [c.intro, ...c.blocks.map(b => b.content)]), kurs.lynchSection, kurs.grahamSection, kurs.ak1Section].join("\n");
const radmönster = [/\bvi rekommenderar\b/i, /\bbör du köpa\b/i, /\bbör du sälja\b/i, /\bköp denna\b/i, /\bsälj dina\b/i, /\bmin rekommendation\b/i, /\btipsa dig om att köpa\b/i, /\blägga dina pengar i\b/i];
for (const p of radmönster) if (p.test(body)) F(`rådgivningsformulering: ${p}`);
const kopsalj = [...body.matchAll(/\b(köp|sälj|köper|säljer)\b/gi)].map(m => m[0]);
if (kopsalj.length) V(`köp/sälj-träffar att kontextläsa: ${kopsalj.join(", ")}`);

// 7. Längd och nivå
const ord = body.split(/\s+/).filter(Boolean).length;
console.log(`INFO: body ca ${ord} ord, nivå ${kurs.level}, kategori ${kurs.category}`);
if (kurs.level !== "Intermediär") F(`nivå ${kurs.level} — uppdraget kräver Intermediär (RISK-luckan)`);
if (kurs.category !== "RISK") F(`kategori ${kurs.category} — uppdraget kräver RISK`);

console.log(fel === 0 ? `\nKVD SLUT: ${fel} fel, ${varningar} varningar` : `\nKVD SLUT: ${fel} fel, ${varningar} varningar`);
process.exit(fel === 0 ? 0 : 1);
