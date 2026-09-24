#!/usr/bin/env node
/** R121-push steg 2: tar över när steg-1:s 30 försök tar slut. 90×60 s =
 *  1,5 h-horisont. Självavslutar grön; avslutar också om prod-HEAD redan
 *  bär vår commit (annan kanal hann före). */
import fs from "node:fs";
import { execFileSync } from "node:child_process";
const ROT = "/home/ak1a/agent/ak1";
const MINNE = `${ROT}/data/vakten/beslutsminne.jsonl`;
const AR = (f) => execFileSync("git", ["-C", ROT, ...f], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
const log = (s) => console.log(`${new Date().toISOString()} ${s}`);
const MIN_COMMIT = "25dc8e3f"; // sista i kön av väntande

const redanIProd = () => {
  try {
    const head = AR(["--git-dir", "/home/ak1a/AK1/.git", "rev-parse", "develop"]).trim();
    const inne = AR(["--git-dir", "/home/ak1a/AK1/.git", "merge-base", "--is-ancestor", MIN_COMMIT, head]);
    return inne.status === undefined || true; // execFileSync kastar vid exit 1
  } catch { return false; }
};

for (let i = 1; i <= 90; i++) {
  if (redanIProd()) { log(`AVSLUTAR — prod bär redan ${MIN_COMMIT} (annan kanal)`); process.exit(0); }
  try { AR(["pull", "--no-rebase", "prod", "develop"]); } catch { /* */ }
  try {
    AR(["push", "prod", "develop"]);
    log(`PUSH GRÖN (försök ${i})`);
    const rader = fs.readFileSync(MINNE, "utf8").split("\n").filter(Boolean);
    const sista = JSON.parse(rader[rader.length - 1]);
    if (sista.landat === "nej") {
      sista.landat = MIN_COMMIT;
      rader[rader.length - 1] = JSON.stringify(sista);
      fs.writeFileSync(MINNE, rader.join("\n") + "\n");
      log(`beslutsminne: landat=${MIN_COMMIT}`);
    }
    process.exit(0);
  } catch (e) {
    const orsak = String(e.stderr || e.message).includes("unstaged") ? "prod-trädet smutsigt" : "annan orsak";
    if (i % 10 === 1) log(`väntar (${i}/90): ${orsak}`);
    await new Promise((r) => setTimeout(r, 60_000));
  }
}
log("90 försök utan grön push — nästa rond tar över");
process.exit(1);
