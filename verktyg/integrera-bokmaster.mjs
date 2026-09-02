#!/usr/bin/env node
/**
 * Integrera BOKMASTER-kurser från data/bokmaster/*.json → public/deep-courses.json
 *
 * Säker integrering: validerar schema (kapitel, quiz, ratt-index, blocktyper)
 * INNAN något skrivs. Körbara kontroller:
 *   node verktyg/integrera-bokmaster.mjs            → integrera allt nytt
 *   node verktyg/integrera-bokmaster.mjs --torrt    → bara validera
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";

const ROTT = process.cwd();
const KALLA = join(ROTT, "data", "bokmaster");
const MAL = join(ROTT, "public", "deep-courses.json");

const BLOCKTYP = new Set(["text", "insikt", "utmaning", "tabell", "visuell", "tidslinje"]);
const VISUELL = new Set(["skala", "compound", "cykel", "donut", "bro", "radar", "tidslinje", "bubbel", "termometer", "konvergens", "sankey", "sasongs"]);

function validera(kurs, fel) {
  const pre = `[${kurs.slug || "???"}] `;
  if (!kurs.slug) fel.push(pre + "saknar slug");
  if (kurs.category !== "BOKMASTER" && kurs.category !== "EKOSYSTEM") fel.push(pre + "category ogiltig (BOKMASTER|EKOSYSTEM)");
  if (!Array.isArray(kurs.chapters) || kurs.chapters.length < 10) fel.push(pre + "för få kapitel (<10)");
  let quizTotal = 0;
  for (const k of kurs.chapters || []) {
    if (!k.title) fel.push(pre + `kap ${k.num}: saknar titel`);
    if (!k.intro || k.intro.length < 40) fel.push(pre + `kap ${k.num}: intro för kort`);
    if (!Array.isArray(k.blocks) || k.blocks.length < 3) fel.push(pre + `kap ${k.num}: för få block`);
    for (const b of k.blocks || []) {
      if (!BLOCKTYP.has(b.type)) fel.push(pre + `kap ${k.num}: okänd blocktyp "${b.type}"`);
      if (b.type === "visuell" && !VISUELL.has(b.content)) fel.push(pre + `kap ${k.num}: okänd visuell "${b.content}"`);
      if (b.type === "tabell") {
        try { JSON.parse(b.content); } catch { fel.push(pre + `kap ${k.num}: tabell-content ej giltig JSON`); }
      }
    }
    for (const q of k.quiz || []) {
      quizTotal++;
      if (!q.q || q.q.length < 10) fel.push(pre + `kap ${k.num}: quiz-fråga för kort`);
      if (!Array.isArray(q.alternativ) || q.alternativ.length !== 4) fel.push(pre + `kap ${k.num}: quiz behöver 4 alternativ`);
      if (!Number.isInteger(q.ratt) || q.ratt < 0 || q.ratt > 3) fel.push(pre + `kap ${k.num}: ratt-index utanför 0-3`);
    }
  }
  if (quizTotal < (kurs.chapters?.length || 0) * 3) fel.push(pre + `för få quiz (${quizTotal})`);
  if (kurs.chapterCount !== (kurs.chapters || []).length) {
    // auto-fixa chapterCount istället för att faila
    kurs.chapterCount = (kurs.chapters || []).length;
  }
  return quizTotal;
}

const torrt = process.argv.includes("--torrt");
const kurser = existsSync(KALLA) ? readdirSync(KALLA).filter((f) => f.endsWith(".json")) : [];
if (kurser.length === 0) {
  console.log("Inga filer i data/bokmaster/ — inget att göra.");
  process.exit(0);
}

const djup = JSON.parse(readFileSync(MAL, "utf8"));
const fel = [];
let nya = 0;

for (const fil of kurser) {
  let kurs;
  try {
    kurs = JSON.parse(readFileSync(join(KALLA, fil), "utf8"));
  } catch {
    console.log(`⏸ hoppar över ${fil} — ofullständig/felaktig JSON (agent kanske skriver just nu)`);
    continue;
  }
  const felFore = fel.length;
  const quiz = validera(kurs, fel);
  if (fel.length > felFore) {
    // ogiltig kurs — hoppa över den men fortsätt med övriga
    console.log(`⏸ hoppar över ${fil} — valideringsfel (ofärdig agentfil?)`);
    continue;
  }
  if (djup[kurs.slug]) {
    console.log(`↻ uppdaterar ${kurs.slug} (${kurs.chapters.length} kap, ${quiz} quiz)`);
  } else {
    console.log(`+ lägger till ${kurs.slug} (${kurs.chapters.length} kap, ${quiz} quiz)`);
    nya++;
  }
  djup[kurs.slug] = kurs;
}

if (fel.length) {
  console.log("\n⚠ VALIDERINGSFEL ( dessa kurser hoppades över):");
  fel.forEach((f) => console.log("  " + f));
}

const totalKurser = Object.keys(djup).length;
const totalQuiz = Object.values(djup).reduce(
  (s, k) => s + (k.chapters || []).reduce((q, c) => q + (c.quiz?.length || 0), 0), 0
);
console.log(`\nTotalt efter integrering: ${totalKurser} kurser · ${totalQuiz} quizfrågor`);

if (!torrt) {
  writeFileSync(MAL, JSON.stringify(djup, null, 0), "utf8");
  console.log("✓ public/deep-courses.json uppdaterad");
} else {
  console.log("(torrkörning — inget skrevs)");
}
