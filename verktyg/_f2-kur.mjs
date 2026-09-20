#!/usr/bin/env node
// F2-KUR (2026-09-20, Lag 2): döda rogue `sh -c next start -p 3000` som tagit
// prod-porten, återta den åt pm2, verifiera. Resultat → verktyg/_f2-kur-resultat.txt
// (arbetsytan är skrivbar; /tmp är spärrat för denna session).
import { execSync, execFileSync } from "node:child_process";
import fs from "node:fs";

const R = "/home/ak1a/agent/ak1/verktyg/_f2-kur-resultat.txt";
const log = (s) => fs.appendFileSync(R, `${new Date().toISOString()} ${s}\n`);
fs.writeFileSync(R, "KUR START\n");

try {
  process.kill(3410754, "SIGTERM");
  log("SIGTERM → 3410754 (sh -c next start)");
} catch (e) {
  log(`kill 3410754-varning: ${e.message}`);
}
try {
  process.kill(3410755, "SIGTERM");
  log("SIGTERM → 3410755 (rogue next-server)");
} catch (e) {
  log(`kill 3410755-varning: ${e.message}`);
}

await new Promise((r) => setTimeout(r, 4000));
try {
  const ss = execFileSync("ss", ["-ltnp"], { encoding: "utf8", timeout: 10000 }).split("\n").filter((r) => r.includes(":3000")).join("\n") || "PORT-FRI";
  log(`port efter kill: ${ss.trim()}`);
} catch (e) {
  log(`port-sond: ${String(e.message).slice(0, 120)}`);
}

try {
  const ut = execFileSync("pm2", ["restart", "ak1a", "--update-env"], { encoding: "utf8", timeout: 90000 });
  log(`pm2 restart OK: ${ut.trim().slice(0, 200)}`);
} catch (e) {
  log(`pm2-restart-fel: ${String(e.message).slice(0, 300)}`);
}

await new Promise((r) => setTimeout(r, 12000));
for (const [namn, url] of [
  ["PROD", "https://lab.ak1nvestor.com/"],
  ["CHUNK", "https://lab.ak1nvestor.com/_next/static/chunks/11_yzmj8iqhn-.js"],
]) {
  try {
    const kod = execFileSync("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "20", url], { encoding: "utf8", timeout: 30000 });
    log(`${namn}=${kod.trim()}`);
  } catch (e) {
    log(`${namn}-sond-fel: ${String(e.message).slice(0, 120)}`);
  }
}
try {
  const ls = execFileSync("pm2", ["jlist"], { encoding: "utf8", timeout: 20000 });
  const ak1a = JSON.parse(ls).find((p) => p.name === "ak1a");
  log(`pm2 ak1a: status=${ak1a?.pm2_env?.status} pid=${ak1a?.pid} restarts=${ak1a?.restart_time}`);
} catch (e) {
  log(`pm2-jlist-fel: ${String(e.message).slice(0, 120)}`);
}
try {
  // grep-pipe-ekvivalens (o133): tomt grep-läge kastar som skalgrepens exit 1
  const ss2Traff = execFileSync("ss", ["-ltnp"], { encoding: "utf8", timeout: 10000 }).split("\n").filter((r) => r.includes(":3000"));
  if (ss2Traff.length === 0) throw new Error("port 3000 utan lyssnare (grep exit 1)");
  const ss2 = ss2Traff.join("\n");
  log(`portägare nu: ${ss2.trim()}`);
} catch {
  log("PORT 3000 HAR INGEN ÄGARE — KRITISKT");
}
log("KUR SLUT");
