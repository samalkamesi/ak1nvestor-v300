#!/usr/bin/env node
/**
 * LÄRVÄGSSYNK — kursregister-synk (spår 5): register ↔ karta ↔ profiler.
 *
 * Paritetsvakt mekaniskt (körs via node — den bevisat pålitliga kanalen):
 *   1. public/deep-courses.json  = REGISTRET (kurserna, sanningens källa)
 *   2. src/lib/larvag-karta.ts   = kartan (genererad; LARVAG_ANTAL_KURSER
 *      är dess paritetskonstant — här kontrolleras den ÄNTLIGEN på riktigt)
 *   3. src/lib/larvag-profiler.ts = profilerna (varje steg/mål-SLUG måste
 *      finnas i registret — en lärväg länkar ALDRIG till en kurs som saknas)
 *
 * Kontroller (alla måste hålla för GRÖN):
 *   A. antal(register) === antal(karta) === LARVAG_ANTAL_KURSER
 *   B. varje kart-slug finns i registret (ingen fantomi-kurs i kartan)
 *   C. varje profil-slug (steg + mål) finns i registret OCH i kartan
 *
 * Utdata: data/vakten/larvag-synk.json (maskinläsbar status + bevis) +
 * utskrift i sessionen. Exit 0 = GRÖN, 1 = RÖD.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REGISTER = join(ROT, "public", "deep-courses.json");
const KARTA = join(ROT, "src", "lib", "larvag-karta.ts");
const PROFILER = join(ROT, "src", "lib", "larvag-profiler.ts");
const UTFIL = join(ROT, "data", "vakten", "larvag-synk.json");

// ── 1. Registret ────────────────────────────────────────────────────────────
const register = JSON.parse(readFileSync(REGISTER, "utf8"));
if (!register || typeof register !== "object" || Array.isArray(register)) {
  console.error("LÄRVÄGSSYNK RÖD: deep-courses.json är inte ett objekt (dict på slug).");
  process.exit(1);
}
const registerSlugs = new Set(Object.keys(register));
const registerAntal = registerSlugs.size;

// ── 2. Kartan (genererad fil — läs strukturellt, rörs aldrig för hand) ──────
const kartaText = readFileSync(KARTA, "utf8");
const kartaSlugs = [...kartaText.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
const kartaAntal = kartaSlugs.length;
const konstantMatch = kartaText.match(/LARVAG_ANTAL_KURSER\s*=\s*(\d+)/);
const konstantAntal = konstantMatch ? Number(konstantMatch[1]) : null;

// ── 3. Profilerna (steg + mål — alla slug-förekomster är kurser) ────────────
const profilText = readFileSync(PROFILER, "utf8");
const profilSlugs = [...profilText.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
const profilAntal = profilSlugs.length;

// ── Kontroller A–C ──────────────────────────────────────────────────────────
const fel = [];

if (konstantAntal === null) fel.push("LARVAG_ANTAL_KURSER hittades inte i larvag-karta.ts");
if (konstantAntal !== registerAntal) fel.push(`konstant (${konstantAntal}) ≠ register (${registerAntal})`);
if (kartaAntal !== registerAntal) fel.push(`karta (${kartaAntal}) ≠ register (${registerAntal})`);

const fantomer = kartaSlugs.filter((s) => !registerSlugs.has(s));
if (fantomer.length > 0) fel.push(`kart-slug utan registerkurs: ${fantomer.join(", ")}`);

const saknade = [...new Set(profilSlugs)].filter((s) => !registerSlugs.has(s));
if (saknade.length > 0) fel.push(`profil-slug utan registerkurs: ${saknade.join(", ")}`);
const saknadeIKarta = [...new Set(profilSlugs)].filter((s) => !kartaSlugs.includes(s));
if (saknadeIKarta.length > 0) fel.push(`profil-slug utanför kartan: ${saknadeIKarta.join(", ")}`);

// ── Bevisfil + utskrift ─────────────────────────────────────────────────────
const rapport = {
  ts: Date.now(),
  status: fel.length === 0 ? "grön" : "röd",
  registerAntal,
  kartaAntal,
  konstantAntal,
  profiler: {
    antalSlugs: profilAntal,
    unikaSlugs: new Set(profilSlugs).size,
  },
  kontroller: { antalsparitet: fel.length === 0, fantomKurser: fantomer.length, saknadeProfilSlugs: saknade.length },
  fel,
};

mkdirSync(dirname(UTFIL), { recursive: true });
writeFileSync(UTFIL, JSON.stringify(rapport, null, 2) + "\n", "utf8");

if (fel.length > 0) {
  console.error(`LÄRVÄGSSYNK RÖD — ${fel.length} fynd:`);
  for (const f of fel) console.error(`  - ${f}`);
  console.error(`Bevis: ${UTFIL}`);
  process.exit(1);
}

console.log(
  `LÄRVÄGSSYNK GRÖN — register ${registerAntal} = karta ${kartaAntal} = konstant ${konstantAntal}; ` +
    `profiler pekar på ${new Set(profilSlugs).size} verkliga kurser (0 fantomer). Bevis: ${UTFIL}`,
);
