#!/usr/bin/env node
/** _r195-v173-tsc.mjs — typgrinden med disk-kvitto (skal-kvoten: häng tappar stdout). */
import { spawnSync as sp } from "node:child_process";
import { writeFileSync as wf } from "node:fs";

const r = sp("node", ["node_modules/typescript/bin/tsc", "--noEmit"], {
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
});
const ut =
  `TSC EXIT ${r.status}\n` +
  (r.stdout || "").split("\n").slice(-15).join("\n") +
  "\n---STDERR---\n" +
  (r.stderr || "").split("\n").slice(-10).join("\n");
wf("/tmp/r195-tsc.txt", ut);
console.log(r.status === 0 ? "TSC 0 FEL (kvitto /tmp/r195-tsc.txt)" : "TSC FEL — se /tmp/r195-tsc.txt");
process.exit(r.status === 0 ? 0 : 1);
