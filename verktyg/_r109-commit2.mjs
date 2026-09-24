#!/usr/bin/env node
// ROND 109 — bokföringscommit (tsc-grinden > studio-svarstak).
import { execFileSync } from "node:child_process";
import { appendFileSync, writeFileSync } from "node:fs";

const ROT = "/home/ak1a/agent/ak1";
const LOGG = `${ROT}/data/vakten/r109-commit.log`;
const MEDDELANDEFIL = `${ROT}/data/vakten/r109-commit2-meddelande.txt`;
writeFileSync(MEDDELANDEFIL, "studio: rond 109 bokföring — worklog + PIPELINE-KO v213(a) stängd + v213(b) dispatchad + r109-wrapprar [organ:Φ]\n");

try {
  appendFileSync(LOGG, `=== bokföringscommit ${new Date().toISOString()} ===\n`);
  execFileSync("git", ["-C", ROT, "add", "worklog.md", "data/forskning/PIPELINE-KO.md", "verktyg/_r109-bokforing.mjs", "verktyg/_r109-commit.mjs", "verktyg/_r109-commit2.mjs"], { timeout: 60_000 });
  const ut = execFileSync("git", ["-C", ROT, "commit", "-F", MEDDELANDEFIL], { timeout: 10 * 60_000, encoding: "utf8" });
  appendFileSync(LOGG, `${ut}\n=== KLAR ===\n`);
} catch (e) {
  appendFileSync(LOGG, `FÖLL: ${String(e).slice(0, 500)}\n`);
}
try {
  const logg = execFileSync("git", ["-C", ROT, "log", "--oneline", "-1"], { encoding: "utf8" });
  appendFileSync(LOGG, `HEAD efter: ${logg.trim()}\n`);
} catch { /* ignorerad */ }
console.log("se data/vakten/r109-commit.log");
