#!/usr/bin/env node
// ROND 107 — starta KÖR-ALLA-TESTER fristående (r106-mönstret): studions skal
// får aldrig hålla en 30+ min-körning (pipan hålls öppen = hängklassen).
// Wrappern öppnar loggfilen som fd 1/2 åt barnet, spawnar detached + unref
// och KVITTERAR start (pid + tid) i data/vakten/testaggregator-start.json.
import { spawn } from "node:child_process";
import { openSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ARB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LOGG = path.join(ARB, "data", "vakten", "testaggregator-korning.log");
const KVITTO = path.join(ARB, "data", "vakten", "testaggregator-start.json");

const fd = openSync(LOGG, "w"); // färsk körning — SENASTE-rapporterna skrivs av aggregatorn själv
const p = spawn(process.execPath, [path.join(ARB, "verktyg", "kor-alla-tester.mjs")], {
  cwd: ARB,
  detached: true,
  stdio: ["ignore", fd, fd],
});
p.unref();
writeFileSync(KVITTO, JSON.stringify({ startad: new Date().toISOString(), pid: p.pid, logg: LOGG }, null, 2) + "\n");
console.log(`aggregatorn startad fristående pid ${p.pid} — logg data/vakten/testaggregator-korning.log`);
