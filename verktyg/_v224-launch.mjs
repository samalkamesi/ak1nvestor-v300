// VÅG 224: fullsvep attempt 4 — V223:s klassmedvetna skydd aktiva.
// Väntar själv ut pågående bygge (startkravet + låset sköter resten).
import { spawn } from "node:child_process";
import { openSync, writeFileSync } from "node:fs";

const LOGG = "/home/ak1a/agent/ak1/data/vakten/v224-fullsvep.log";
writeFileSync(LOGG, `[v224] fullsvep attempt 4 — TUNG-startkrav 3 GB + enstrecksvakt — start ${new Date().toISOString()}\n`);
const ut = openSync(LOGG, "a");
const barn = spawn("node", ["/home/ak1a/agent/ak1/verktyg/kor-alla-tester.mjs"], {
  cwd: "/home/ak1a/agent/ak1",
  detached: true,
  stdio: ["ignore", ut, ut],
});
barn.unref();
console.log("fullsvep attempt 4 startad detached, pid", barn.pid, "— logg", LOGG);
