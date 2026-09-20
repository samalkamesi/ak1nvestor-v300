#!/usr/bin/env node
/** R120-push: tålmodig väntare — prod-trädet nekar push medan fabriksbarn
 *  har osparade filer (mottagningskakan "Working directory has unstaged
 *  changes"). Väntar ut barnet, pushar, kvitterar beslutsminnets landat. */
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const ROT = "/home/ak1a/agent/ak1";
const MINNE = `${ROT}/data/vakten/beslutsminne.jsonl`;
const AR = (f) => execFileSync("git", ["-C", ROT, ...f], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
const log = (s) => console.log(`${new Date().toISOString()} ${s}`);

for (let i = 1; i <= 30; i++) {
  try {
    AR(["pull", "--no-rebase", "prod", "develop"]); // ta emot ev. nya syskon först
  } catch { /* smutsigt prod-träd påverkar ej pull */ }
  try {
    AR(["push", "prod", "develop"]);
    log(`PUSH GRÖN (försök ${i}) — 55eb4273+f20a11a2 i prod`);
    // kvittera beslutsminnets sista rad (rond 68-posten)
    const rader = fs.readFileSync(MINNE, "utf8").split("\n").filter(Boolean);
    const sista = JSON.parse(rader[rader.length - 1]);
    if (sista.landat === "nej") {
      sista.landat = "55eb4273";
      rader[rader.length - 1] = JSON.stringify(sista);
      fs.writeFileSync(MINNE, rader.join("\n") + "\n");
      log("beslutsminne: landat=55eb4273 kvitterat");
    }
    process.exit(0);
  } catch (e) {
    const orsak = String(e.stderr || e.message).includes("unstaged") ? "prod-trädet smutsigt (fabriksbarn arbetar)" : "annan orsak";
    log(`väntar (${i}/30): ${orsak}`);
    await new Promise((r) => setTimeout(r, 60_000));
  }
}
log("30 försök utan grön push — lämna åt nästa rond (committen lever lokalt)");
process.exit(1);
