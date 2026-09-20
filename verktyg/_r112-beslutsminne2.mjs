#!/usr/bin/env node
// ROND 112 tillägg — beslutsminnesrad för V215.2-stängningen.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
const ROT = "/home/ak1a/agent/ak1";
const head = execFileSync("git", ["-C", ROT, "rev-parse", "--short", "HEAD"], { encoding: "utf8" }).trim();
fs.appendFileSync(
  `${ROT}/data/vakten/beslutsminne.jsonl`,
  JSON.stringify({
    ts: new Date().toISOString(),
    rond: 112,
    beslut:
      "V215.2 stängd: S2 MÅLET:s mätpartsfel kurat — disk-fallback läser prod-trädets mal-state.json (lasPass-precedensen); scenariotestet 5/5 GRÖN efter kur; V215.1 (payload-tak, src-yta) kvar",
    landat: head,
  }) + "\n",
);
console.log(`beslutsminne (tillägg) appenderat landat=${head}`);
