#!/usr/bin/env node
// Slutregression s6-u3 (omgång 25): kör HELA mentorsviten sekventiellt och
// sammanfattar. Node-wrapper enligt skal-kvoten (studio-shallets häng-risk).
import { readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";

const ROT = "/home/ak1a/AK1";
const filer = readdirSync(ROT + "/verktyg")
  .filter((f) => /^testa-ai-mentor-.*\.mjs$/.test(f))
  .sort();

let grona = 0;
let roda = [];
const rad = [];
for (const f of filer) {
  try {
    const ut = execFileSync("node", [ROT + "/verktyg/" + f], {
      cwd: ROT,
      encoding: "utf8",
      timeout: 120000,
      stdio: ["ignore", "pipe", "pipe"],
    });
    const m = ut.match(/(\d+) PASS\s*·\s*(\d+) FAIL/g) || [];
    const sista = m[m.length - 1] || "0 PASS · 0 FAIL";
    const fail = parseInt((sista.match(/(\d+) FAIL/) || [0, "0"])[1], 10);
    if (fail === 0) {
      grona++;
      rad.push("GRÖN  " + f + "  (" + sista + ")");
    } else {
      roda.push(f);
      rad.push("RÖD   " + f + "  (" + sista + ")");
    }
  } catch (e) {
    roda.push(f);
    rad.push("FEL   " + f + "  (krasch: " + String(e.message).slice(0, 80) + ")");
  }
}
console.log(rad.join("\n"));
console.log("────────────────────────────────");
console.log(
  "MENTORSVITEN SLUT: " + grona + "/" + filer.length + " GRÖNA · " +
  roda.length + " RÖDA" + (roda.length ? " → " + roda.join(", ") : ""),
);
