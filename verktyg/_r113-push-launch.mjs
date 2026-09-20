// ROND 113: push-only launchern (detached).
import { spawn } from "node:child_process";
import { openSync } from "node:fs";

const LOGG = "/home/ak1a/agent/ak1/data/vakten/r113-push-launch.log";
const ut = openSync(LOGG, "w");
const barn = spawn("node", ["/home/ak1a/agent/ak1/verktyg/_r113-push.mjs"], {
  cwd: "/home/ak1a/agent/ak1",
  detached: true,
  stdio: ["ignore", ut, ut],
});
barn.unref();
console.log("push-only startad detached, pid", barn.pid);
