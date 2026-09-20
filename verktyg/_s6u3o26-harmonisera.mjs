/**
 * _s6u3o26-harmonisera.mjs — lär samtliga mentorsviter fönstrets tre nya
 * kedjekomponenter (omgång 26, manifest auto-s6-1789890903364):
 * riskadress (u1) · balansdjup (u2) · optionshantverk (u3 — detta lager).
 * IDEMPOTENT: hoppar filer som redan bär alla tre; bevarar ordningen
 * multipel → riskadress → balansdjup → optionshantverk → marknadsrytm
 * (widgetens faktiska komposition, FÖRE marknadsrytms SIST-deklaration).
 * Mönster: _s6u2-harmonisera-omg25.mjs (bevisat i omgång 25).
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const NYA = ["svaraLokaltRiskadress", "svaraLokaltBalansdjup", "svaraLokaltOptionshantverk"];
const ANKARE = '"svaraLokaltMarknadsrytm",];';
const INSATTNING =
  '"svaraLokaltRiskadress", "svaraLokaltBalansdjup", "svaraLokaltOptionshantverk",\n' +
  '    // Omgång 26 (manifest auto-s6-1789890903364): riskadress (u1) · balansdjup (u2) ·\n' +
  '    // optionshantverk (u3) — harmoniserat av _s6u3o26-harmonisera.mjs (idempotent).\n' +
  "    " + ANKARE;

let andrade = 0, hoppade = 0, saknasAnkare = [];
for (const f of readdirSync(HÄR).filter((x) => /^testa-ai-mentor-.*\.mjs$/.test(x)).sort()) {
  const sokVag = join(HÄR, f);
  let txt = readFileSync(sokVag, "utf8");
  if (!txt.includes("KOMPONENTER")) continue; // sviter utan komponentlista rörs ej
  if (NYA.every((n) => txt.includes(n))) { hoppade++; continue; }
  const antal = txt.split(ANKARE).length - 1;
  if (antal !== 1) { saknasAnkare.push(f + " (" + antal + " ankare)"); continue; }
  txt = txt.replace(ANKARE, INSATTNING);
  writeFileSync(sokVag, txt);
  andrade++;
  console.log("harmoniserad: " + f);
}
console.log("\n" + andrade + " filer harmoniserade · " + hoppade + " hoppade (redan aktuella)");
if (saknasAnkare.length) console.log("ATENTION — okänt ankare i: " + saknasAnkare.join(" · "));
