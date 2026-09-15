#!/usr/bin/env node
/**
 * AK1A — LÄGG TILL KURS I REGISTRET (spår 5, kursregister-synk 2026-09-15).
 *
 * Läger in EN kurs från en käll-JSON (t.ex. data/kurser-tillagg/*.json) i
 * public/deep-courses.json — atomiskt, idempotent och med serieordning:
 * nya kursen hamnar EFTER sista befintliga slug med samma serieprefix
 * (t.ex. "bf-" → efter bf-11), så varje serie hålls samman och
 * lärvägskartans deterministiska brytning förblir naturlig.
 *
 * ── SYNSKEDJAN EFTER MERGE (koppla in manuellt — verktygen är idempotenta) ──
 *    node verktyg/lagg-till-kurs.mjs <kursfil.json>
 *    node scripts/bygg-larvag-karta.ts        # lärvägskartan (FRONT B-motorn)
 *    node verktyg/kor-sokindex.mjs            # sökindex (⌘K-paletten)
 *    node verktyg/kor-speglar-slugar.mjs      # 404-speglar (/en, /ar)
 * Pipelinen som skriver deep-courses.json uppdaterar INTE de tre speglarna
 * själv (samma doktrin som kor-sokindex.mjs header).
 *
 * VAKTER:
 *   - slug måste vara ren ASCII [a-z0-9][a-z0-9-]* (speglar-slugar-regeln)
 *   - slug som redan finns = idempotent avslut kod 0 (ingen dubbelinsert —
 *     säkert att köra i redundans, t.ex. parallella fabriksuppgifter)
 *   - filformat: JSON.stringify(..., null, 2) + \n — round-trip- verifierat
 *     byte-identiskt mot befintligt register (2026-09-15)
 *
 * Användning: node verktyg/lagg-till-kurs.mjs data/kurser-tillagg/min-kurs.json
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REGISTER = path.join(REPO, "public", "deep-courses.json");

const kursfil = process.argv[2];
if (!kursfil) {
  console.error("Användning: node verktyg/lagg-till-kurs.mjs <kursfil.json>");
  process.exit(1);
}

/** Kurs-post med de fält merge:n kräver (resten följer med okontrollerat). */
let kurs;
try {
  kurs = JSON.parse(readFileSync(path.resolve(process.cwd(), kursfil), "utf8"));
} catch (e) {
  console.error(`FEL: kunde inte läsa/tolka ${kursfil} (${e.message}).`);
  process.exit(1);
}

if (typeof kurs.slug !== "string" || !/^[a-z0-9][a-z0-9-]*$/.test(kurs.slug)) {
  console.error(`FEL: ogiltig slug "${String(kurs.slug)}" — kräver ren ASCII [a-z0-9][a-z0-9-]*.`);
  process.exit(1);
}
if (typeof kurs.title !== "string" || typeof kurs.category !== "string" || !Array.isArray(kurs.chapters)) {
  console.error("FEL: kursen saknar title/category/chapters — komplettera käll-JSONen.");
  process.exit(1);
}

let register;
try {
  register = JSON.parse(readFileSync(REGISTER, "utf8"));
} catch (e) {
  console.error(`FEL: kunde inte läsa public/deep-courses.json (${e.message}).`);
  process.exit(1);
}

const befintliga = Object.keys(register);
if (register[kurs.slug]) {
  console.log(`[lagg-till-kurs] ${kurs.slug} finns redan i registret — idempotent avslut, inget skrivet.`);
  process.exit(0);
}

// Insertionspunkt: efter sista slug med samma serieprefix ("bf-12-" → "bf-").
const prefix = `${kurs.slug.split("-")[0]}-`;
let sistIdx = -1;
befintliga.forEach((slug, i) => {
  if (slug.startsWith(prefix)) sistIdx = i;
});
const nycklar =
  sistIdx >= 0
    ? [...befintliga.slice(0, sistIdx + 1), kurs.slug, ...befintliga.slice(sistIdx + 1)]
    : [...befintliga, kurs.slug];

const nytt = {};
for (const k of nycklar) nytt[k] = k === kurs.slug ? kurs : register[k];

writeFileSync(REGISTER, `${JSON.stringify(nytt, null, 2)}\n`, "utf8");
const placering = sistIdx >= 0 ? `insatt efter sista ${prefix}-kurs (position ${sistIdx + 2})` : "appendad sist (ny serie)";
console.log(
  `[lagg-till-kurs] +${kurs.slug} "${kurs.title}" — ${befintliga.length} → ${nycklar.length} kurser, ${placering}.`,
);
console.log("[lagg-till-kurs] SYNKA NU (idempotenta): node scripts/bygg-larvag-karta.ts && node verktyg/kor-sokindex.mjs && node verktyg/kor-speglar-slugar.mjs");
