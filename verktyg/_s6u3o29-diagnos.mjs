/**
 * DIAGNOS (s6-u3, _s6u3o29-): kör de röda sviterna och skriver ut varje
 * FAIL-rad + summering — underlag för ordningspasset.
 */
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");
const RODA = [
  "testa-ai-mentor-case.mjs", "testa-ai-mentor-multipel.mjs",
  "testa-ai-mentor-optionshantverk.mjs", "testa-ai-mentor-riskmattsdjup.mjs",
  "testa-ai-mentor-riskpremie.mjs", "testa-ai-mentor-sektordjup.mjs",
  "testa-ai-mentor-sektorskola2.mjs", "testa-ai-mentor-skattedjup.mjs",
  "testa-ai-mentor-stabilitetsdjup.mjs", "testa-ai-mentor-tidsaxel.mjs",
  "testa-ai-mentor-utdelningsdjup.mjs", "testa-ai-mentor-utdelningskalender.mjs",
  "testa-ai-mentor-varderingsverktyg.mjs", "testa-ai-mentor-varderjustering.mjs",
  "testa-ai-mentor-warrant.mjs", "testa-ai-mentor-balansdjup.mjs",
  "testa-ai-mentor-kontrahent.mjs", "testa-ai-mentor-modernarisk.mjs",
  "testa-ai-mentor-valutamekanik.mjs", "testa-ai-mentor-kemisektor.mjs",
];
for (const fil of RODA) {
  let ut = "";
  try { ut = execFileSync("node", [join(ROT, "verktyg", fil)], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); }
  catch (e) { ut = (e.stdout ?? "") + (e.stderr ?? ""); }
  const fails = ut.split("\n").filter((r) => /FAIL|      /.test(r) && !/PASS/.test(r));
  const sum = ut.split("\n").filter((r) => /PASS/i.test(r) && /\d+/.test(r)).pop() ?? "";
  console.log("=== " + fil + "  →  " + sum.trim());
  for (const f of fails.slice(0, 6)) console.log("   " + f.trim().slice(0, 220));
}
