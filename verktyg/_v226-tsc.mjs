// VÅG 226: tsc-typkontroll (baslinje 0) — detached, loggar till data/vakten/.
import { spawn } from "node:child_process";
import { openSync, writeFileSync } from "node:fs";

const LOGG = "/home/ak1a/agent/ak1/data/vakten/v226-tsc.log";
writeFileSync(LOGG, `[v226] tsc --noEmit start ${new Date().toISOString()}\n`);
const ut = openSync(LOGG, "a");
const barn = spawn("npx", ["tsc", "--noEmit"], {
  cwd: "/home/ak1a/agent/ak1",
  detached: true,
  stdio: ["ignore", ut, ut],
});
barn.unref();
console.log("tsc detached, pid", barn.pid, "— logg", LOGG);
