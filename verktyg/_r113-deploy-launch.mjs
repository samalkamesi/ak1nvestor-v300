// ROND 113: fristående deploy-launcher — bygger under lås i prod-trädet,
// skriver loggen till data/vakten/r113-deploy.log.
import { spawn } from "node:child_process";
import { openSync } from "node:fs";

const LOGG = "/home/ak1a/agent/ak1/data/vakten/r113-deploy.log";
const ut = openSync(LOGG, "w");
const barn = spawn("bash", ["/home/ak1a/agent/ak1/verktyg/_r113-deploy.sh"], {
  cwd: "/home/ak1a/agent/ak1",
  detached: true,
  stdio: ["ignore", ut, ut],
});
barn.unref();
console.log("deploy startad detached, pid", barn.pid, "→", LOGG);
