#!/usr/bin/env node
/** _r195-v173-commit.mjs — bevis-commit via node-kanalen (skal-hängen på git commit med hook). */
import { spawnSync as sp } from "node:child_process";
import { writeFileSync } from "node:fs";

const r = sp("git", ["commit", "-m", "studio: [organ:Φ] rond 195 bevis — pusha-skriptet + sonderingsverktyg committade; efter-PUSH verifiering: llms-rubrik 263 bolag rådata 2026-09-25 live, prod 200 x5"], {
  cwd: "/home/ak1a/agent/ak1",
  encoding: "utf8",
  maxBuffer: 32 * 1024 * 1024,
  timeout: 240000,
});
const lg = sp("git", ["log", "--oneline", "-1"], { cwd: "/home/ak1a/agent/ak1", encoding: "utf8" });
const ut = `COMMIT exit ${r.status}\n${(r.stdout || "").slice(-400)}\n---STDERR---\n${(r.stderr || "").slice(-400)}\nHEAD: ${(lg.stdout || "").slice(0, 100)}`;
writeFileSync("/tmp/r195-commit.txt", ut);
console.log(ut);
