#!/usr/bin/env node
// ROND 107: gitignore-status för mimosa-fynden + antal filer i min fullscan.
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const ut = [];
for (const f of [".zcode/commita-v150.mjs", ".zcode/v134-bygg.mjs", "data/backups/dr-analys.mjs", "data/backups/dr-sql-analys.mjs"]) {
  try {
    execFileSync("git", ["check-ignore", f], { encoding: "utf8" });
    ut.push(f + " → ignorerad");
  } catch {
    const trad = execFileSync("git", ["ls-files", f], { encoding: "utf8" }).trim();
    ut.push(f + " → " + (trad ? "TRACKAD (" + trad + ")" : "varken ignorerad eller trackad (untracked)"));
  }
}
try {
  const j = JSON.parse(fs.readFileSync("/tmp/r107-mimosa-hel.json", "utf8"));
  ut.push("min fullscan: " + (j.filerSkannade ?? j.filer ?? JSON.stringify(Object.keys(j))));
} catch (e) {
  ut.push("fullscan-json oläsbar: " + String(e).slice(0, 80));
}
fs.writeFileSync("/tmp/r107-ignore.txt", ut.join("\n") + "\n");
console.log(ut.join("\n"));
