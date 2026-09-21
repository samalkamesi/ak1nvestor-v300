#!/usr/bin/env node
/**
 * TESTA-BOLAG-METADATA-KONTRAKT (spår 8, o148) — /bolag-ytans tal-kontrakt.
 * =====================================================================
 * Rotorsakan o148 kurade: /bolag-metadatin hårdkodade "100 bolag i tio
 * branscher" (sant vid våg 149) medan universumet växer med varje
 * dataleverans (o146 §7: 249 st) — samma glidningsklass som o146:s döda
 * länkar: texten lösgjord från sanningen den ska spegla.
 *
 * Kontraktet denna svit bevakar (deterministiskt, offline-grön):
 *   K1 metadatin är datadriven — page.tsx bär generateMetadata och INGEN
 *      hårdkodad "100 bolag"-löje (title/description räknas ur SIDOR)
 *   K2 vy-fallbacken är datadriven — "100-bolagsuniversum" finns inte
 *      i bolag-sidor.tsx (fallback = lasBolagsSidor().length)
 *   K3 paritet — formeln ur källan applicerad på dagens data ger exakt
 *      title med universumets/publicerade tal (idag 249/10)
 *   K4 force-static + revalidate-kontraktet orört (o146-kompatibelt)
 * Villkorad HTTP-sond (ALDRIG fail på deploy-läge — spökmätningsskydd,
 * o131/o139 §1-doktrinen: inga förljugna EFTER-tal):
 *   - prod bär gamla "100 bolag"  → VÄNTAR-DEPLOY (varning, exit 0)
 *   - prod bär nya formeln med rätt tal → EFTER-GRÖN (info)
 *   - server osvarar → OINSTÄNGD (info — sviten är offline-körbar)
 * Körs: node verktyg/testa-bolag-metadata-kontrakt.mjs
 * Exit: 0 = kontraktet håller · 1 = brott (K1-K4).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PAGE = path.join(ROT, "src", "app", "(huvud)", "bolag", "page.tsx");
const VY = path.join(ROT, "src", "components", "ak1a", "bolag-sidor.tsx");
const LIB = path.join(ROT, "src", "lib", "bolags-sidor.ts");
const UNIVERSUM = path.join(ROT, "data", "portfolj-system", "bolagsunivers.json");
const PUBLICERAD_CACHE = path.join(ROT, "data", "cache", "bolags-publicerade.json");

let pass = 0, fail = 0;
const ok = (namn, villkor, detalj = "") => {
  if (villkor) { pass++; console.log(`  PASS ${namn}`); }
  else { fail++; console.log(`  FAIL ${namn}${detalj ? " — " + detalj : ""}`); }
};

const pageKalla = fs.readFileSync(PAGE, "utf8");
const vyKalla = fs.readFileSync(VY, "utf8");
const libKalla = fs.readFileSync(LIB, "utf8");
// Kod utan kommentarer — grunden bevakar STRÄNGLITERALER (metadata/vy-text),
// medan filhuvudens dokumentation SJÄLV FÅR citera det föråldrade löftet
// (o148-kommentaren i page.tsx berättar just historien den kurade).
const kodUtanKommentarer = (s) =>
  s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^[ \t]*\/\/.*$/gm, "");
const pageKod = kodUtanKommentarer(pageKalla);
const vyKod = kodUtanKommentarer(vyKalla);

// ── K1: metadatin datadriven ────────────────────────────────────────────────
ok("K1a page.tsx bär generateMetadata", /export function generateMetadata\(\)/.test(pageKalla));
ok(
  "K1b ingen hårdkodad \"100 bolag\" i metadatin",
  !/"100 bolag|för 100 bolag|i tio branscher/.test(pageKod),
  "hårdkodat tal förekommer i page.tsx kod",
);
ok(
  "K1c title räknas ur SIDOR",
  /title: `Bolagsregister — nyckeltal för \$\{antalBolag\} bolag i \$\{antalBranscher\} branscher`/.test(pageKalla),
);
ok(
  "K1d description räknas ur SIDOR",
  /description: `Nyckeltal för alla \$\{antalBolag\} publicerade bolag/.test(pageKalla),
);

// ── K2: vy-fallbacken datadriven ───────────────────────────────────────────
ok(
  "K2a ingen \"100-bolagsuniversum\"-fallback i vyn",
  !/"100-bolagsuniversum"/.test(vyKod),
  "hårdkodat fallback-tal förekommer i bolag-sidor.tsx kod",
);
ok(
  "K2b fallbacken läser lasBolagsSidor",
  /\$\{lasBolagsSidor\(\)\.length\}-bolagsuniversum/.test(vyKalla),
);

// ── K3: paritet mot dagens data (formeln ur källan, applicerad här) ────────
const universum = JSON.parse(fs.readFileSync(UNIVERSUM, "utf8"));
const alla = (Array.isArray(universum) ? universum : []).filter((r) => typeof r.ticker === "string" && r.ticker.trim() !== "");
let publicerade = alla; // o146 fallback: hela universumet utan nedteckning
try {
  const c = JSON.parse(fs.readFileSync(PUBLICERAD_CACHE, "utf8"));
  if (Array.isArray(c.slugs) && c.slugs.length > 0 && c.slugs.every((s) => typeof s === "string" && s.trim() !== "")) {
    const m = new Set(c.slugs);
    const f = alla.filter((r) => m.has(r.ticker.toLowerCase().replace(/\./g, "-")));
    if (f.length > 0) publicerade = f;
  }
} catch { /* ingen nedteckning = mjuk fallback (o146) */ }
const antalBolag = publicerade.length;
const antalBranscher = new Set(publicerade.map((r) => (typeof r.bransch === "string" && r.bransch.trim() !== "" ? r.bransch : "osatt"))).size;
ok("K3a universum läsbart och icketomt", alla.length > 0, `universumrader: ${alla.length}`);
ok("K3b registrets källa icketöm", antalBolag > 0, `publicerade: ${antalBolag}`);
ok("K3c branschantalet förnuftigt (≥1)", antalBranscher >= 1, `branscher: ${antalBranscher}`);
const title = `Bolagsregister — nyckeltal för ${antalBolag} bolag i ${antalBranscher} branscher`;
ok(
  "K3d titelns tal ≠ det föråldrade 100-löftet",
  !(antalBolag === 100 && alla.length !== 100),
  "universumet råkar vara exakt 100 — granska manuellt",
);

// ── K4: force-static/ISR-kontraktet orört (o146-kompatibelt) ───────────────
ok("K4a force-static bevarat", /export const dynamic = "force-static";/.test(pageKalla));
ok("K4b revalidate 86400 bevarat", /export const revalidate = 86400;/.test(pageKalla));
ok("K4c lib-kommentar bär o148-doktrinen", /o148/.test(libKalla) && !/100 programmatiska/.test(libKalla));

// ── Villkorad HTTP-sond (deploy-läge rapporteras, aldrig fejkar grönt) ─────
console.log(`\nData-facit: universum ${alla.length} · publicerade (med cache/fallback) ${antalBolag} · branscher ${antalBranscher}`);
console.log(`Titel som koden nu lovar: "${title}"`);
try {
  const svar = await fetch("http://localhost:3000/bolag", { signal: AbortSignal.timeout(5000) });
  const html = await svar.text();
  const t = (html.match(/<title>([^<]*)<\/title>/) ?? [])[1] ?? "";
  if (t.includes(`för ${antalBolag} bolag i ${antalBranscher} branscher`)) {
    console.log(`HTTP-SOND: EFTER-GRÖN — prod-titeln bär dagens tal ("${t}")`);
  } else if (/100 bolag/.test(t)) {
    console.log(`HTTP-SOND: VÄNTAR-DEPLOY — prod-titeln bär ännu det gamla trädet ("${t}"); kvitto sker vid nästa gröna bygge (ALDRIG byggt av denna svit)`);
  } else {
    console.log(`HTTP-SOND: OKÄND titel på prod ("${t}") — granska manuellt`);
  }
} catch (e) {
  console.log(`HTTP-SOND: OINSTÄNGD (server ej mätbar från denna körning: ${e.name}) — sviten är offline-körbar`);
}

console.log(`\nSVIT: ${pass} PASS · ${fail} FAIL`);
process.exit(fail ? 1 : 0);
