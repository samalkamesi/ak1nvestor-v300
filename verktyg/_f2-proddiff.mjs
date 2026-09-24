#!/usr/bin/env node
// F2: diffa prod-trädets enda modifierade spårade fil (push-spärraren).
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const R = "/home/ak1a/agent/ak1/verktyg/_f2-proddiff-resultat.txt";
const log = (s) => fs.appendFileSync(R, `${s}\n`);
fs.writeFileSync(R, "PRODDIFF START\n");
try {
  const ut = execFileSync(
    "git",
    ["-C", "/home/ak1a/AK1", "diff", "--stat", "data/rapporter/motorervalidering-2026-09-02.md"],
    { encoding: "utf8", timeout: 30_000 }
  );
  log("stat:\n" + ut);
  const d = execFileSync(
    "git",
    ["-C", "/home/ak1a/AK1", "diff", "-U1", "data/rapporter/motorervalidering-2026-09-02.md"],
    { encoding: "utf8", timeout: 30_000 }
  );
  log("diff (första 3 000 tecknen):\n" + d.slice(0, 3000));
} catch (e) {
  log(`diff-fel: ${String(e.message).slice(0, 300)}`);
}
log("PRODDIFF SLUT");
