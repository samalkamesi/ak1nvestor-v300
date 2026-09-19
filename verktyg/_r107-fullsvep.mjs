#!/usr/bin/env node
// ROND 107 — fullsvep fristående (alla sviter), loggar till data/vakten.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ARB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fd = fs.openSync(path.join(ARB, "data", "vakten", "r107-fullsvep.log"), "a");
const p = spawn(process.execPath, ["verktyg/kor-alla-tester.mjs"], {
  cwd: ARB,
  detached: true,
  stdio: ["ignore", fd, fd],
});
p.unref();
fs.writeFileSync(path.join(ARB, "data", "vakten", "r107-fullsvep-start.json"), JSON.stringify({ pid: p.pid, startad: new Date().toISOString() }, null, 2));
console.log("fullsvep pid " + p.pid + " — logg data/vakten/r107-fullsvep.log");
