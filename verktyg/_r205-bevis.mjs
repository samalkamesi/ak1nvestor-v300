#!/usr/bin/env node
/** _r205-bevis.mjs — bevis-commit av rattningsskriptet (node-kanal; skal-compound hängde). */
import { spawnSync as sp } from "node:child_process";
const A = "/home/ak1a/agent/ak1";
const run = (args, tag) => {
  const r = sp("git", args, { cwd: A, encoding: "utf8", maxBuffer: 16 * 1024 * 1024, timeout: 240000 });
  console.log(`[${tag}] ${r.status} :: ${(r.stdout || r.stderr || "").trim().split("\n").slice(-1).join("").slice(0, 160)}`);
  return r;
};
run(["add", "verktyg/_r205-bevis.mjs", "verktyg/_r205-rattning.mjs"], "add");
const c = run(["commit", "-m", "studio: [organ:Φ] rond 205 bevis — rattningsskriptet committat (torrörningsspåret återställt till HEAD-läget FÖRE commit: granskningsfilen aldrig spårad i historiken; läxa: mätarens argv[2] är rondnummer — filvägar skriver in i rubriken)"], "commit");
if (c.status === 0) run(["push", "prod", "develop"], "push");
run(["log", "--oneline", "-1"], "HEAD");
run(["status", "--porcelain"], "slut");
