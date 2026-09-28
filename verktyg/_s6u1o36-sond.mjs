/**
 * _s6u1o36-sond.mjs — s6-u1 (manifest auto-s6-1790612726901, fönster 36):
 * färsk lagerlucksond över AI-Mentorns kurskopplingar, 2026-09-28.
 *
 * En kurs räknas MENTORLÄNKAD om dess slug aktiveras i något lager:
 *   (a) som källa  — kursKalla(reg, "<slug>" …) eller slug: "<slug>"
 *   (b) som länk   — /kurser/<slug>
 * i src/lib/ai-mentor-*-fragor.ts eller basmotorn src/lib/ai-mentor-svar.ts
 * (kommentarer räknas INTE — vi söker i kod med strängkontext).
 *
 * Körning: node verktyg/_s6u1o36-sond.mjs [--karnord < candidates.txt]
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROTT = "/home/ak1a/AK1";
const lib = join(ROTT, "src/lib");

// ── 1. Kursregistret (samma källa som motorn) ───────────────────────────────
const registerTs = readFileSync(join(lib, "ai-mentor-register.ts"), "utf8");
const slugRad = /[linky]{0}\{\s*slug:\s*"([^"]+)"[^}]*kategori:\s*"([^"]+)"[^}]*\}/g;
const kurser = [];
let m;
while ((m = slugRad.exec(registerTs)) !== null) kurser.push({ slug: m[1], kategori: m[2] });
console.log(`KURSREGISTER: ${kurser.length} kurser ur ${kurser.length ? "register.ts" : "?"}`);

// ── 2. Samla aktiveringar ur alla lager ─────────────────────────────────────
const lagerFiler = readdirSync(lib)
  .filter((f) => /^ai-mentor-.*-fragor\.ts$/.test(f) || f === "ai-mentor-svar.ts")
  .sort();
const aktiv = new Set();
const karnord = new Map(); // kärnord → [lager]
for (const fil of lagerFiler) {
  const txt = readFileSync(join(lib, fil), "utf8");
  // strippa blockkommentarer (kärnordsdisjunktion ska se KOD, inte prosa)
  const kod = txt.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  for (const km of kod.matchAll(/kursKalla\([^,]+,\s*"([^"]+)"/g)) aktiv.add(km[1]);
  for (const km of kod.matchAll(/\/kurser\/([a-z0-9-]+)/g)) aktiv.add(km[1]);
  // kärnordslistor: ALLA karnord:[...]-block (basen har många monsters)
  for (const knBlock of txt.matchAll(/karnord:\s*\[([\s\S]*?)\]/g)) {
    for (const ord of knBlock[1].matchAll(/"([^"]+)"/g)) {
      const o = ord[1];
      if (!karnord.has(o)) karnord.set(o, []);
      karnord.get(o).push(fil);
    }
  }
}
console.log(`AKTIVA AKTIVERINGAR: ${aktiv.size} unika slugs ur ${lagerFiler.length} filer`);

// ── 3. Mentorlösa per kategori ──────────────────────────────────────────────
const perKat = new Map();
for (const k of kurser) {
  if (aktiv.has(k.slug)) continue;
  if (!perKat.has(k.kategori)) perKat.set(k.kategori, []);
  perKat.get(k.kategori).push(k.slug);
}
const sorterade = [...perKat.entries()].sort((a, b) => b[1].length - a[1].length);
let totalt = 0;
for (const [kat, slugs] of sorterade) {
  totalt += slugs.length;
  console.log(`\n${kat} — ${slugs.length} mentorlösa:`);
  console.log("  " + slugs.join("\n  "));
}
console.log(`\nTOTALT MENTORLÖSA: ${totalt} i ${sorterade.length} kategorier`);
console.log(`UNIKA KÄRNORD I KOD: ${karnord.size} (för disjunktion)`);

// ── 4. Kärnordskoll om kandidater ges ───────────────────────────────────────
const args = process.argv.slice(2);
const ki = args.indexOf("--karnord");
if (ki >= 0 && args[ki + 1]) {
  const kandidater = readFileSync(args[ki + 1], "utf8").split("\n").map((s) => s.trim()).filter(Boolean);
  const norm = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim();
  const ndia = (s) => norm(s).normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
  const tav = (a, b) => {
    if (a === b) return 0;
    const n = a.length, q = b.length;
    if (!n || !q) return Math.max(n, q);
    let fore = Array.from({ length: q + 1 }, (_, j) => j);
    const nu = new Array(q + 1);
    for (let i = 1; i <= n; i++) {
      nu[0] = i;
      for (let j = 1; j <= q; j++) {
        nu[j] = Math.min(nu[j - 1] + 1, fore[j] + 1, fore[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      fore = [...nu];
    }
    return fore[q];
  };
  console.log(`\n── KÄRNORDSDISJUNKTION: ${kandidater.length} kandidater ──`);
  let kollisioner = 0;
  for (const kand of kandidater) {
    const nk = ndia(kand);
    for (const [ex, filer] of karnord) {
      const ne = ndia(ex);
      if (ne === nk) { console.log(`KOLLISION (exakt): «${kand}» == «${ex}» i ${filer.join(",")}`); kollisioner++; }
      else if (tav(ne, nk) <= 2 && ne.length > 4 && Math.abs(ne.length - nk.length) <= 2) {
        console.log(`GRANNE (tav ${tav(ne, nk)}): «${kand}» ~ «${ex}» i ${filer.join(",")}`);
      }
    }
  }
  console.log(kollisioner === 0 ? "0 EXAKTA KOLLISIONER" : `${kollisioner} EXAKTA KOLLISIONER — BYT KÄRNORD`);
}
