/**
 * _s6u2c-harmonisera.mjs — lär samtliga mentorsviter fönstrets nya
 * kedjekomponent (omgång 26, manifest auto-s6-1789890903364, s6-u2 fönster 3):
 * pengarstid — andrahandsmarknaden + sekvensrisken (66:e motorn).
 * IDEMPOTENT: hoppar filer som redan bär den; bevarar ordningen
 * … optionshantverk → pengarstid → marknadsrytm (widgetens faktiska
 * komposition, FÖRE marknadsrytms SIST-deklaration).
 * Mönster: _s6u3o26-harmonisera.mjs (bevisat i omgång 26:s tre fönster).
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const NY = "svaraLokaltPengarstid";
const ANKARE = '"svaraLokaltMarknadsrytm",];';
const INSATTNING =
  '"svaraLokaltPengarstid",\n' +
  '    // Omgång 26 (manifest auto-s6-1789890903364, s6-u2 fönster 3): pengarstid —\n' +
  '    // andrahandsmarknaden + sekvensrisken — harmoniserat av _s6u2c-harmonisera.mjs (idempotent).\n' +
  "    " + ANKARE;

let andrade = 0, hoppade = 0, saknasAnkare = [];
for (const f of readdirSync(HÄR).filter((x) => /^testa-ai-mentor-.*\.mjs$/.test(x)).sort()) {
  const sokVag = join(HÄR, f);
  let txt = readFileSync(sokVag, "utf8");
  if (!txt.includes("KOMPONENTER")) continue; // sviter utan komponentlista rörs ej
  if (txt.includes(NY)) { hoppade++; continue; }
  const antal = txt.split(ANKARE).length - 1;
  if (antal !== 1) { saknasAnkare.push(f + " (" + antal + " ankare)"); continue; }
  txt = txt.replace(ANKARE, INSATTNING);
  writeFileSync(sokVag, txt);
  andrade++;
  console.log("harmoniserad: " + f);
}
console.log("\n" + andrade + " filer harmoniserade · " + hoppade + " hoppade (redan aktuella)");
if (saknasAnkare.length) console.log("ATENTION — okänt ankare i: " + saknasAnkare.join(" · "));
