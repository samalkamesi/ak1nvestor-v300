#!/usr/bin/env node
/** V221 — tsc (baslinje 0) i bakgrund, logg till disk. */
import { execFileSync } from "node:child_process";
try {
  execFileSync("node", ["node_modules/typescript/bin/tsc", "--noEmit"], {
    cwd: "/home/ak1a/agent/ak1",
    encoding: "utf8",
    timeout: 540_000,
  });
  console.log("TSC: 0 fel");
} catch (e) {
  console.log("TSC FEL:\n" + String(e.stdout || "") + String(e.stderr || e.message).slice(0, 1500));
  process.exit(1);
}
