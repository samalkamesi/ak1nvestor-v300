// VÅG 227: korrigering + deploy-säkring — detached.
import { spawn } from "node:child_process";
import { openSync, writeFileSync } from "node:fs";

const LOGG = "/home/ak1a/agent/ak1/data/vakten/v227-slut.log";
writeFileSync(LOGG, `[v227] korrigering+deploy start ${new Date().toISOString()}\n`);
const ut = openSync(LOGG, "a");
const barn = spawn("node", ["/home/ak1a/agent/ak1/verktyg/_v227-commit.mjs"], {
  cwd: "/home/ak1a/agent/ak1",
  detached: true,
  stdio: ["ignore", ut, ut],
});
barn.unref();
console.log("v227 detached, pid", barn.pid, "— logg", LOGG);
