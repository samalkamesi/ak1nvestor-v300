// V227: smal bygg2 detached (utan npm ci).
import { spawn } from "node:child_process";
import { openSync, writeFileSync } from "node:fs";

const LOGG = "/home/ak1a/agent/ak1/data/vakten/v227-bygg2.log";
writeFileSync(LOGG, `[v227-bygg2] start ${new Date().toISOString()}\n`);
const ut = openSync(LOGG, "a");
const barn = spawn("node", ["/home/ak1a/agent/ak1/verktyg/_v227-bygg2.mjs"], {
  cwd: "/home/ak1a/agent/ak1",
  detached: true,
  stdio: ["ignore", ut, ut],
});
barn.unref();
console.log("v227-bygg2 detached, pid", barn.pid, "— logg", LOGG);
