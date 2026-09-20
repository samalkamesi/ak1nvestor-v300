/**
 * _s6u3o26-kanoniska.mjs — lägger optionshantverks 3 kanoniska frågor i
 * kedjetestets KANONISKA (motorindex beräknat LIVE). Idempotent + racetålt.
 * (Kan ej ligga i _s6u3o26-kedjelagg.mjs: den hoppar redan-idempotenta
 * MOTORDEF-läget innan kanoniska-läget — syskonets harmonisering hann
 * före med MOTORDEF.)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const FIL = join(HÄR, "testa-ai-mentor-kedja.mjs");

for (let forsok = 0; forsok < 5; forsok++) {
  const fore = readFileSync(FIL, "utf8");
  if (fore.includes('fraga: "vad är binomialträdet?"')) {
    console.log("kanoniska finns redan — idempotent hopp");
    break;
  }
  const snitt = fore.slice(fore.indexOf("const MOTORDEFS = ["), fore.indexOf("];", fore.indexOf("const MOTORDEFS = [")) + 2);
  const MOTORDEFS = eval(snitt + "; MOTORDEFS");
  const idx = MOTORDEFS.findIndex((m) => m.namn === "optionshantverk");
  if (idx < 0) throw new Error("motordef optionshantverk saknas — kör _s6u3o26-kedjelagg.mjs först");
  const KAN = [
    "  // 2026-09-20 omgång 26: optionshantverk (s6-u3) — kanoniska ur lagrets",
    "  // egna rubriker; index beräknat LIVE av _s6u3o26-kanoniska.mjs.",
    '  { fraga: "vad är binomialträdet?", motor: ' + idx + " },",
    '  { fraga: "vad är en straddle?", motor: ' + idx + " },",
    '  { fraga: "vad är delta?", motor: ' + idx + " },",
  ].join("\n");
  let ut = fore;
  const kanStart = ut.indexOf("const KANONISKA = [");
  const kanSlut = ut.indexOf("];", kanStart);
  ut = ut.slice(0, kanSlut) + KAN + "\n" + ut.slice(kanSlut);
  const nu = readFileSync(FIL, "utf8");
  if (nu !== fore) {
    console.log("race upptäckt (försök " + (forsok + 1) + ") — omkrör");
    continue;
  }
  writeFileSync(FIL, ut);
  console.log("3 kanoniska skrivna (motor " + idx + ")");
  break;
}
