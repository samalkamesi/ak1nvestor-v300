// ROND 113: fristående launchern — commit-cykeln överlever transportens
// 30 s-fönster (detached + logg på disk).
import { spawn } from "node:child_process";
import { openSync } from "node:fs";

const LOGG = "/home/ak1a/agent/ak1/data/vakten/r113-launch.log";
const ut = openSync(LOGG, "w");
const barn = spawn("node", ["/home/ak1a/agent/ak1/verktyg/_r113-commit.mjs"], {
  cwd: "/home/ak1a/agent/ak1",
  detached: true,
  stdio: ["ignore", ut, ut],
});
barn.unref();
console.log("commit-cykel startad detached, pid", barn.pid);
