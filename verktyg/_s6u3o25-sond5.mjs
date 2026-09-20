/**
 * SOND 5 spår 6 omgång 25 — rond 5: V19-ansvarsfördelning.
 * Vem fångar «korrelation», «utspädning», «emission», «nyemission» i kedjan
 * (levande frågetest) + portföljgrund/kapitalmekanik/basens källkurser.
 */
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

const HÄR = fileURLToPath(new URL(".", import.meta.url));
const ROT = join(HÄR, "..");
const LIB = join(ROT, "src", "lib");
const url = (p) => "file://" + join(p);

const { KURSREGISTER } = await import(url(join(LIB, "ai-mentor-register.ts")));
const filer = readFileSync(join(ROT, "verktyg", "_s6u3o25-sond.mjs"), "utf8")
  .split("\n").filter((l) => l.trim().startsWith('["')).map((l) => {
    const m = /\["([^"]+)", "([^"]+)", "([A-Z_0-9-]+)"\]/.exec(l);
    return m ? [m[1], m[2], m[3]] : null;
  }).filter(Boolean);

// Levande frågetest: vilken motor fångar dessa formuleringar?
const FRAGOR = [
  "vad är korrelation?",
  "vad är utspädning?",
  "vad är en nyemission?",
  "vad händer vid en emission?",
  "vad är emissionsrisken?",
  "vad är kontrahentrisken?",
  "vad är korrelationsrisken?",
  "vad är en motpart?",
  "vad är ett clearinghus?",
  "vad är netting?",
  "vad är initial margin?",
  "vad är utspädningsrisken?",
  "vad är en nyteckning?",
  "vad är företrädesrätt?",
  "vad är CCP?",
];
for (const f of FRAGOR) {
  let vinnare = null;
  for (const [namn, fil, arr] of filer) {
    const modul = await import(url(join(LIB, fil)));
    const fn = Object.keys(modul).find((k) => k.startsWith("svaraLokalt"));
    const svar = modul[fn](f, KURSREGISTER);
    if (svar) { vinnare = { namn, amne: svar.amne, kurs: svar.kalla?.slug }; break; }
  }
  console.log((vinnare ? "FÅNGAD av " + vinnare.namn + " (ämne " + vinnare.amne + ", källa " + vinnare.kurs + ")" : "NULL genom kedjan") + "  ← «" + f + "»");
}

// portföljgrund + kapitalmekanik + riskdjup: deras källkurser (V19-källor)
console.log("\n=== Källkurser per grannlager:");
for (const [namn, fil, arr] of filer) {
  if (!["portföljgrund", "kapitalmekanik", "riskdjup", "nästa", "bokmastar"].includes(namn)) continue;
  const modul = await import(url(join(LIB, fil)));
  const slugs = new Set();
  for (const m of modul[arr]) {
    const svar = m.bygga(KURSREGISTER);
    if (svar.kalla?.slug) slugs.add(svar.kalla.slug);
    for (const kk of svar.kallor ?? []) if (kk.slug) slugs.add(kk.slug);
  }
  console.log("  " + namn + ": " + [...slugs].join(", "));
}
