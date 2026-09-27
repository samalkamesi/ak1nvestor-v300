#!/usr/bin/env node
/** _r195-v173-avslut.mjs — rundens sista steg: sista verktygsfilen in + push + slutläge. */
import { spawnSync as sp } from "node:child_process";
import { writeFileSync } from "node:fs";

const A = "/home/ak1a/agent/ak1";
const P = "/home/ak1a/AK1";
const ut = [];
const run = (cwd, args, tag) => {
  const r = sp("git", args, { cwd, encoding: "utf8", maxBuffer: 32 * 1024 * 1024, timeout: 240000 });
  ut.push(`[${tag}] exit ${r.status} :: ${(r.stdout || r.stderr || "").trim().split("\n").slice(-3).join(" | ").slice(0, 300)}`);
  return r;
};

run(A, ["add", "verktyg/_r195-v173-avslut.mjs", "verktyg/_r195-v173-commit.mjs"], "add");
const c = run(A, ["commit", "-m", "studio: [organ:Φ] rond 195 avslut — commit-/avslut-skripten committade (node-kanalens beviskedja komplett)"], "commit");
if (c.status === 0) run(A, ["push", "prod", "develop"], "push");
run(P, ["log", "--oneline", "-1"], "prod-HEAD");
run(A, ["status", "--porcelain"], "arbetsyte-slut");
writeFileSync("/tmp/r195-avslut.txt", ut.join("\n"));
console.log(ut.join("\n"));
