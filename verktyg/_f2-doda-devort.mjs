#!/usr/bin/env node
// F2: döda LÄCKT dev-server (testläcka, PPid 1, ~5 h) — verifierar cmdline
// FÖR kill (pid-återanvändningsskydd), SIGTERM→SIGKILL-trappa, portkontroll.
import fs from "node:child_process";
import { execSync } from "node:child_process";
import f from "node:fs";

const R = "/home/ak1a/agent/ak1/verktyg/_f2-devort-resultat.txt";
const log = (s) => f.appendFileSync(R, `${new Date().toISOString()} ${s}\n`);
f.writeFileSync(R, "DEVORT START\n");

const MAL = [3266888, 3409315];
for (const pid of MAL) {
  try {
    const cmd = f.readFileSync(`/proc/${pid}/cmdline`, "utf8").split("\0").join(" ").trim();
    log(`pid ${pid} cmdline: ${cmd.slice(0, 120)}`);
    if (!/next (dev|start)|next-server|npm/.test(cmd)) {
      log(`pid ${pid} matchar INTE förväntat mönster — SPARAS (pid-återanvändning?)`);
      continue;
    }
    process.kill(pid, "SIGTERM");
    log(`SIGTERM → ${pid}`);
  } catch (e) {
    log(`pid ${pid}: ${e.code === "ENOENT" ? "redan borta" : e.message}`);
  }
}
await new Promise((r) => setTimeout(r, 4000));
for (const pid of MAL) {
  try {
    process.kill(pid, 0);
    process.kill(pid, "SIGKILL");
    log(`SIGKILL → ${pid} (överlevde SIGTERM)`);
  } catch {
    log(`pid ${pid} död`);
  }
}
await new Promise((r) => setTimeout(r, 2000));
try {
  const ss = execSync("ss -ltnp", { encoding: "utf8", timeout: 10000 });
  const rader = ss.split("\n").filter((r) => /:3117/.test(r));
  log(rader.length ? `PORT 3117 UPPNÅDD fortfarande: ${rader.join(" | ")}` : "PORT 3117 FRITT — dev-läckan borta");
} catch (e) {
  log(`ss-fel: ${String(e.message).slice(0, 100)}`);
}
try {
  const kod = execSync('curl -s -o /dev/null -w "%{http_code}" --max-time 20 "https://lab.ak1nvestor.com/"', { encoding: "utf8", timeout: 30000 });
  log(`PROD=${kod.trim()}`);
} catch (e) {
  log(`PROD-sond-fel: ${String(e.message).slice(0, 100)}`);
}
log("DEVORT SLUT");
