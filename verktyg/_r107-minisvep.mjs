#!/usr/bin/env node
// ROND 107 — mini-svep (dev-trio) fristående, loggar till data/vakten.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ARB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fd = fs.openSync(path.join(ARB, "data", "vakten", "r107-minisvep.log"), "a");
const p = spawn(process.execPath, ["verktyg/kor-alla-tester.mjs", "--mönster=testa-studio-(ttfb|tabbar|rewind)", "--tak=600"], {
  cwd: ARB,
  detached: true,
  stdio: ["ignore", fd, fd],
});
p.unref();
console.log("mini-svep pid " + p.pid + " — logg data/vakten/r107-minisvep.log");
