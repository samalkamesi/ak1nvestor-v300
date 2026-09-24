#!/usr/bin/env node
// ROND 107-sond 2: tre okända RÖDA sviter → /tmp/r107-sond2.txt
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ut = [];
for (const f of ["testa-schema-kurser.mjs", "testa-studio-tabbar.mjs", "testa-prod-synk-tidsstampel.mjs"]) {
  const r = spawnSync(process.execPath, [path.join(REPO, "verktyg", f)], {
    cwd: REPO,
    encoding: "utf8",
    timeout: 120_000,
    env: { ...process.env, NO_COLOR: "1" },
  });
  const rader = (r.stdout || "").split("\n").filter((x) => /FAIL|UNDERKÄNT|Error|error/i.test(x)).slice(0, 6);
  ut.push(`=== ${f} (exit ${r.status}) ===`);
  ut.push(...(rader.length > 0 ? rader : ["(inga FAIL/Error-rader i stdout)"]));
  if ((r.stderr || "").trim()) ut.push("STDERR: " + r.stderr.trim().split("\n").slice(0, 3).join(" | "));
  ut.push("");
}
fs.writeFileSync("/tmp/r107-sond2.txt", ut.join("\n"));
console.log(ut.join("\n"));
