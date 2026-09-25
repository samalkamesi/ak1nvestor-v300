#!/usr/bin/env node
/** _r197-v173u3-bevis.mjs — sista bevis-commit (adoptionsskriptet + detta) + push. */
import { spawnSync as sp } from "node:child_process";
const A = "/home/ak1a/agent/ak1";
const run = (args, tag) => {
  const r = sp("git", args, { cwd: A, encoding: "utf8", maxBuffer: 32 * 1024 * 1024, timeout: 240000 });
  console.log(`[${tag}] exit ${r.status} :: ${(r.stdout || r.stderr || "").trim().split("\n").slice(-2).join(" | ").slice(0, 200)}`);
  return r;
};
run(["add", "verktyg/_r197-v173u3-bevis.mjs", "verktyg/_r197-v173u3-adoption.mjs"], "add");
const c = run(["commit", "-m", "studio: [organ:Φ] rond 197 bevis — adoptions-+bevis-skript committade (pushkedja: U3-leverans 8298...→commit + adoption 00f4248b → LIVE llms 265 bolag med TELUS verifierad)"], "commit");
if (c.status === 0) run(["push", "prod", "develop"], "push");
run(["log", "--oneline", "-3"], "HEAD");
run(["status", "--porcelain"], "slut");
