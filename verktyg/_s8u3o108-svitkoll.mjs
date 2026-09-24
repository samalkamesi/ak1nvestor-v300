#!/usr/bin/env node
// o108-svitkoll — kör de nio kvarvarande s8-kontraktssviterna efter gallringen
// av testa-dynamic-catalog (bevis: syskonens sviter opåverkade; _o106-bryggan orörd).
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const SVITER = [
  "testa-nyhets-motor.mjs", "testa-datacache.mjs", "testa-signal-bus.mjs",
  "testa-organ-bus.mjs", "testa-navigationsminne.mjs", "testa-elevkarna.mjs",
  "testa-klientkontext.mjs", "testa-eko-koppling.mjs", "testa-shortseller-bank.mjs",
];

let grona = 0, roda = 0;
for (const s of SVITER) {
  const r = spawnSync("node", [join(HÄR, s)], { encoding: "utf8", timeout: 120000 });
  const svitRad = (r.stdout || "").trim().split("\n").filter((l) => l.startsWith("SVIT ")).pop() || "(ingen SVIT-rad)";
  const ok = r.status === 0;
  if (ok) grona++; else { roda++; console.log(r.stdout, r.stderr); }
  console.log((ok ? "GRÖN " : "RÖD  ") + s.padEnd(34) + " " + svitRad);
}
console.log(`\nSVITKOLL: ${grona} GRÖNA / ${roda} RÖDA (av ${SVITER.length})`);
process.exit(roda === 0 ? 0 : 1);
