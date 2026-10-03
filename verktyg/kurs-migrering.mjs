#!/usr/bin/env node
/**
 * KURS-MIGRERING — läs deep-courses.json → skriv till Supabase
 * Arbetsstation 2, 2026-10-03
 *
 * Körs av organismen på servern (har Supabase-nycklarna i env).
 * Läser public/deep-courses.json och public/sok-index.json,
 * skriver till Supabase-tabellerna enligt data/sql/kurs-migrering.sql.
 *
 * Användning: node verktyg/kurs-migrering.mjs
 * Krav: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY i env
 *
 * Mimosa: fasta https-värdar; nycklar från env; aldrig logga nycklar.
 */

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!SUPA_URL || !SUPA_KEY) {
  console.error("FEL: NEXT_PUBLIC_SUPABASE_URL och SUPABASE_SERVICE_ROLE_KEY måste vara satta.");
  process.exit(1);
}

const supa = createClient(SUPA_URL, SUPA_KEY);
const ROT = path.join(import.meta.dirname, "..");

// ── Läs data-filer ──────────────────────────────────────────────────────────
console.log("── Läser data-filer ──");

let kurser = {};
try {
  kurser = JSON.parse(fs.readFileSync(path.join(ROT, "public/deep-courses.json"), "utf8"));
  console.log(`✅ deep-courses.json: ${Object.keys(kurser).length} kurser`);
} catch (e) {
  console.error("❌ kunde ej läsa deep-courses.json:", e.message);
  process.exit(1);
}

let siffror = {};
try {
  siffror = JSON.parse(fs.readFileSync(path.join(ROT, "data/siffror.json"), "utf8"));
  console.log(`✅ siffror.json: ${JSON.stringify(siffror).slice(0, 100)}`);
} catch {
  console.log("⚠️ siffror.json saknas — hoppar över");
}

// ── Migrera kurser ──────────────────────────────────────────────────────────
console.log("\n── Migrerar kurser till Supabase ──");

const kursArray = Object.entries(kurser).map(([slug, k]) => ({
  id: slug,
  category: k.category || "",
  weight: k.weight || "",
  chapter_count: k.chapterCount || 0,
  total_minutes: k.totalMinutes || 0,
  title: k.title || slug,
  summary: k.summary || "",
  minutes: k.minutes || 0,
  xp: k.xp || 0,
  level: k.level || "",
  learn: k.learn || "",
  why: k.why || "",
  chapters_list: k.chapters_list || [],
  history: k.history || "",
  chapters: k.chapters || [],
  lynch_section: k.lynchSection || "",
  graham_section: k.grahamSection || "",
  ak1_section: k.ak1Section || "",
}));

console.log(`Totalt ${kursArray.length} kurser att migrera`);

// Batcha 10 kurser i taget (Supabase har gräns per anrop)
const BATCH = 10;
let okCount = 0;
let errCount = 0;

for (let i = 0; i < kursArray.length; i += BATCH) {
  const batch = kursArray.slice(i, i + BATCH);
  const { error } = await supa.from("kurser").upsert(batch, { onConflict: "id" });

  if (error) {
    console.error(`❌ Batch ${Math.floor(i / BATCH) + 1}: ${error.message?.slice(0, 100)}`);
    errCount += batch.length;
  } else {
    okCount += batch.length;
    if ((i + BATCH) % 50 === 0) {
      console.log(`  ${okCount}/${kursArray.length} kurser migrerade...`);
    }
  }

  // Liten paus mellan batches (undvika rate limiting)
  await new Promise((r) => setTimeout(r, 200));
}

console.log(`\n✅ Kurser: ${okCount} OK, ${errCount} fel`);

// ── Migrera siffror ─────────────────────────────────────────────────────────
if (siffror && Object.keys(siffror).length > 0) {
  console.log("\n── Migrerar plattformssiffror ──");
  const sifferRows = Object.entries(siffror)
    .filter(([k, v]) => typeof v === "number")
    .map(([nyckel, varde]) => ({ nyckel, varde }));

  if (sifferRows.length > 0) {
    const { error } = await supa.from("plattform_siffror").upsert(sifferRows, { onConflict: "nyckel" });
    if (error) {
      console.error("❌ Siffror:", error.message?.slice(0, 100));
    } else {
      console.log(`✅ ${sifferRows.length} siffror migrerade`);
    }
  }
}

// ── Verifiera ────────────────────────────────────────────────────────────────
console.log("\n── Verifierar ──");
const { data: antal, error: countErr } = await supa
  .from("kurser")
  .select("id", { count: "exact", head: true });

if (countErr) {
  console.error("❌ kunde ej verifiera:", countErr.message);
} else {
  console.log(`✅ Kurser i Supabase: ${antal?.length ?? 0} (väntat: ${kursArray.length})`);
}

console.log("\n── MIGRERING KLAR ──");
console.log("Nästa steg: uppdatera API:er att läsa från Supabase i stället för fil.");
