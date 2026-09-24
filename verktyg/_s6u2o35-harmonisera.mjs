/**
 * SVITHARMONISERING s6-u2 omgång 35 (manifest auto-s6-1790245511290).
 *
 * Lägger omgångens två WIREADE nykomlingar — svaraLokaltEnhetsekonomi
 * (85:e, detta lager) + svaraLokaltKrishantering (86:e, syskonet u1:s
 * fönstermotor, ömsesidig kanda-bördan enligt omgång 20/23-precedenserna)
 * — i äldre modultesters hårdkodade widget-listor (L-fallen). u3:s
 * slutstenarna är ännu EJ wiread i widgeten och läggs INTE här (listorna
 * måste matcha widgetens faktiska kedja — deras leverans bär sin egen).
 *
 * Idempotent: filer som redan bär Enhetsekonomi+Krishantering hoppas över.
 *
 * Kör: node verktyg/_s6u2o35-harmonisera.mjs
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const HÄR = dirname(fileURLToPath(import.meta.url));
const VERK = HÄR;

const filer = readdirSync(VERK).filter((f) => /^testa-ai-mentor-.*\.mjs$/.test(f));
const NYA = '"svaraLokaltEnhetsekonomi", "svaraLokaltKrishantering"';
let andrade = 0;
const problem = [];

for (const fil of filer) {
  const sok = join(VERK, fil);
  const t = readFileSync(sok, "utf8");
  if (!t.includes("svaraLokaltValideringsfonster")) continue;
  if (t.includes("svaraLokaltEnhetsekonomi") && t.includes("svaraLokaltKrishantering")) continue; // redan harmoniserad
  // Variant A: samma rad — "...Valideringsfonster", "svaraLokaltMarknadsrytm"
  const mA = t.match(/"svaraLokaltValideringsfonster",\s*"svaraLokaltMarknadsrytm"/);
  if (mA) {
    const ny = t.replace(/"svaraLokaltValideringsfonster",\s*"svaraLokaltMarknadsrytm"/, `"svaraLokaltValideringsfonster", ${NYA}, "svaraLokaltMarknadsrytm"`);
    writeFileSync(sok, ny);
    andrade++;
    console.log("HARMONISERAD (A): " + fil);
    continue;
  }
  // Variant B: olika rader — Valideringsfonster sist på sin rad, Marknadsrytm först på nästa
  const mB = t.match(/"svaraLokaltValideringsfonster",\s*\n\s*"svaraLokaltMarknadsrytm"/);
  if (mB) {
    const ny = t.replace(/"svaraLokaltValideringsfonster",\s*\n\s*"svaraLokaltMarknadsrytm"/, `"svaraLokaltValideringsfonster", ${NYA},\n    "svaraLokaltMarknadsrytm"`);
    writeFileSync(sok, ny);
    andrade++;
    console.log("HARMONISERAD (B): " + fil);
    continue;
  }
  problem.push(fil);
}

console.log("");
console.log("Ändrade: " + andrade + " · Oförstådda mönster: " + problem.length);
for (const p of problem) console.log("  MANUELL TITT: " + p);
