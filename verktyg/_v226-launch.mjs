// VÅG 226: slutcykeln detached (väntar svep → boka → commit → push → bygg → verifiera).
import { spawn } from "node:child_process";
import { openSync, writeFileSync } from "node:fs";

const LOGG = "/home/ak1a/agent/ak1/data/vakten/v226-slut.log";
writeFileSync(LOGG, `[v226] slutcykel start ${new Date().toISOString()}\n`);
const ut = openSync(LOGG, "a");
const barn = spawn("node", ["/home/ak1a/agent/ak1/verktyg/_v226-commit.mjs"], {
  cwd: "/home/ak1a/agent/ak1",
  detached: true,
  stdio: ["ignore", ut, ut],
});
barn.unref();
console.log("v226-slutcykel detached, pid", barn.pid, "— logg", LOGG);
