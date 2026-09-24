#!/usr/bin/env node
// ROND 107 — starta vänta-pushern fristående (logg-fd, detached, unref).
import { spawn } from "node:child_process";
import { openSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ARB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fd = openSync(path.join(ARB, "data", "vakten", "r107-pusha.log"), "a");
const p = spawn(process.execPath, [path.join(ARB, "verktyg", "_r107-vanta-pusha.mjs")], {
  cwd: ARB,
  detached: true,
  stdio: ["ignore", fd, fd],
});
p.unref();
console.log("vänta-pusher r107 pid " + p.pid + " — kvitto data/vakten/r107-push-kvitto.json");
