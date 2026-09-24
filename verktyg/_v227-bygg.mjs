#!/usr/bin/env node
/** V227-bygg: ren deploy-säkring — bygg under lås med MINNESBASERAD sond
 *  (antalet zcode-processer säger inget om deras minne; fria MB är måttet). */
import { execFileSync } from "node:child_process";

const ROTA = "/home/ak1a/agent/ak1";
const run = (file, args, opts = {}) =>
  execFileSync(file, args, { cwd: ROTA, encoding: "utf8", timeout: 300_000, ...opts });
const sleep = (s) => run("sleep", [String(s)]);
const BYGG = "cd /home/ak1a/AK1 && npm ci --no-audit --no-fund && npm run build && pm2 restart ak1a";

let byggt = false;
let varv = 0;
while (!byggt && varv++ < 15) {
  try {
    const friaMB = parseInt((execFileSync("free", ["-m"], { encoding: "utf8", timeout: 10_000 }).split("\n")[1] ?? "").split(/\s+/).pop() ?? "0", 10);
    console.log(`före bygg: ${friaMB} MB fritt (varv ${varv})`);
    if (friaMB < 3500) {
      console.log("under 3 500 MB — väntar 120 s");
      sleep(120);
      continue;
    }
    const ut = execFileSync("flock", ["-n", "/tmp/ak1a-deploy.lock", "bash", "-c", BYGG], {
      cwd: ROTA, encoding: "utf8", timeout: 1_200_000,
    });
    console.log("BYGG GRÖN: " + ut.trim().split("\n").slice(-2).join(" | ").slice(0, 300));
    byggt = true;
  } catch (e) {
    if (/deploy\.lock|busy/i.test(String(e.stderr || "")) ) {
      console.log("låset upptaget — väntar 90 s");
      sleep(90);
      continue;
    }
    const ferr = String(e.stdout || "") + String(e.stderr || e.message || "");
    console.log("BYGG-FEL (första 300): " + ferr.slice(0, 300));
    console.log("väntar 3 min");
    sleep(180);
  }
}
if (!byggt) { console.log("SLUT: BYGG FELADE — prod lever på förra bygget"); process.exit(1); }

sleep(12);
try {
  const kod = execFileSync("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "20", "https://lab.ak1nvestor.com/"], { timeout: 40_000 }).trim();
  console.log("PROD: HTTP " + kod);
  const sond = execFileSync("node", [ROTA + "/verktyg/_v226-sond.mjs"], { timeout: 60_000 });
  console.log("PAYLOAD-SOND:\n" + sond.trim());
  console.log(kod === "200" ? "SLUT: DEPLOYAD + VERIFIERAD" : "SLUT: OVÄNTAD KOD");
} catch (e) {
  console.log("verifiering fel: " + String(e.message).slice(0, 200));
}
