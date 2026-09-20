// ROND 112 → V215.1: fristående tsc-körning (transporten hänger på långa
// kommandon — launchern startar processen detached och skriver loggen själv).
import { spawn } from "node:child_process";
import { openSync } from "node:fs";

const LOGG = "/home/ak1a/agent/ak1/data/vakten/r112-v215-tsc.log";
const ut = openSync(LOGG, "w");
const fel = openSync(LOGG, "a");
const barn = spawn("npx", ["tsc", "--noEmit"], {
  cwd: "/home/ak1a/agent/ak1",
  detached: true,
  stdio: ["ignore", ut, fel],
});
barn.unref();
console.log("tsc startad detached, pid", barn.pid, "→", LOGG);
