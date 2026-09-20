#!/usr/bin/env node
// F2-slutverifiering: nya vaktfilerna i prod-trädet + pm2 + port + prod 200.
import { execSync } from "node:child_process";
import fs from "node:fs";

const R = "/home/ak1a/agent/ak1/verktyg/_f2-slut-resultat.txt";
const log = (s) => fs.appendFileSync(R, `${new Date().toISOString()} ${s}\n`);
fs.writeFileSync(R, "SLUTVERIFIERING START\n");

for (const [namn, sokvag, nalspinne] of [
  ["kraschvakt.mjs ORTVAKT", "/home/ak1a/AK1/verktyg/kraschvakt.mjs", "F2-ORTPORTVAKTEN"],
  ["process-trad.mjs FINNS", "/home/ak1a/AK1/verktyg/process-trad.mjs", "dodaDeltrad"],
  ["kor-alla-tester.mjs F2-SVEP", "/home/ak1a/AK1/verktyg/kor-alla-tester.mjs", "F2-svep"],
]) {
  try {
    const innehall = fs.readFileSync(sokvag, "utf8");
    log(`${namn}: ${innehall.includes(nalspinne) ? "JA" : "NEJ — SAKNAS"}`);
  } catch (e) {
    log(`${namn}: FEL ${e.message.slice(0, 80)}`);
  }
}
try {
  const ls = execSync("pm2 jlist", { encoding: "utf8", timeout: 20_000 });
  const ak1a = JSON.parse(ls).find((p) => p.name === "ak1a");
  log(`pm2 ak1a: status=${ak1a?.pm2_env?.status} pid=${ak1a?.pid}`);
} catch (e) {
  log(`pm2-fel: ${String(e.message).slice(0, 120)}`);
}
try {
  const ss = execSync("ss -ltnp", { encoding: "utf8", timeout: 10_000 });
  log("port 3000: " + ss.split("\n").filter((r) => /:3000\s/.test(r)).join(" | ").slice(0, 160));
} catch (e) {
  log(`ss-fel: ${String(e.message).slice(0, 100)}`);
}
try {
  const kod = execSync('curl -s -o /dev/null -w "%{http_code}" --max-time 20 "https://lab.ak1nvestor.com/"', { encoding: "utf8", timeout: 30000 });
  log(`PROD=${kod.trim()}`);
} catch (e) {
  log(`PROD-fel: ${String(e.message).slice(0, 100)}`);
}
log("SLUTVERIFIERING SLUT");
