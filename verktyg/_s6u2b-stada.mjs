/**
 * STÄD efter _s6u2b-ordna.mjs (s6-u2 försök 2, 2026-09-20) — idempotent.
 * Bugg i ordna-skriptet: blocket kopierades FÖRE ];-rättningen, så filer där
 * multipelraden bar listans slut nu har DUBBELT ]; (multipel + marknadsrytm).
 * Rättning: multipelraden ⇒ ", — marknadsrytm behåller ]; (den är SIST).
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const VERKTYG = "/home/ak1a/AK1/verktyg";
let andrade = 0;
for (const fil of readdirSync(VERKTYG).filter((f) => /^testa-ai-mentor-.*\.mjs$/.test(f))) {
  const sokVag = join(VERKTYG, fil);
  const rader = readFileSync(sokVag, "utf8").split("\n");
  let rogjord = false;
  for (let i = 0; i < rader.length - 1; i++) {
    if (rader[i].includes('"svaraLokaltMultipel"') && rader[i].includes("];") && rader[i + 1].includes('"svaraLokaltMarknadsrytm"') && rader[i + 1].includes("];")) {
      rader[i] = rader[i].replace("];", "");
      rogjord = true;
    }
  }
  if (rogjord) { writeFileSync(sokVag, rader.join("\n")); andrade++; console.log("städat:", fil); }
}
console.log("städade filer:", andrade);
