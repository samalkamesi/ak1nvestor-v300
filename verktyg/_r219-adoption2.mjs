#!/usr/bin/env node
/** _r219-adoption2.mjs — adoptionsgren för vakt-tilläggets push (motorervalidering-filen, rond 218-mönstret). */
import { readFileSync, copyFileSync } from "node:fs";
import { spawnSync as sp } from "node:child_process";
const A = "/home/ak1a/agent/ak1", P = "/home/ak1a/AK1";
const ut = [];
const run = (cwd, args, tag) => {
  const r = sp("git", args, { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, timeout: 240000 });
  ut.push(`[${tag}] exit ${r.status} :: ${(r.stdout || r.stderr || "").trim().split("\n").slice(-1).join(" | ").slice(0, 180)}`);
  return r;
};
const FIL = "data/rapporter/motorervalidering-2026-09-02.md";
const head = sp("git", ["-C", P, "show", `HEAD:${FIL}`], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
const disk = readFileSync(`${P}/${FIL}`, "utf8");
ut.push(`${FIL}: ren-append ${disk.startsWith(head.stdout)} (+${disk.length - head.stdout.length})`);
if (!disk.startsWith(head.stdout)) { console.log("AVBRYTER: ej ren append — manuell granskning krävs\n" + ut.join("\n")); process.exit(1); }
copyFileSync(`${P}/${FIL}`, `${A}/${FIL}`);
run(P, ["checkout", "--", FIL], "prod-checkout");
run(A, ["add", FIL], "add-adoption");
const ca = run(A, ["commit", "-m", "studio: [organ:Φ] rond 219 adoption — prod-trädets ändring av data/rapporter/motorervalidering-2026-09-02.md adopterad för ren updateInstead-push (auto-pumpens vidröring, rond 218-mönstret)"], "commit-adoption");
if (ca.status === 0) run(A, ["push", "prod", "develop"], "push-2");
const r2 = sp("curl", ["-s", "--max-time", "20", "https://lab.ak1nvestor.com/llms.txt"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
const m = (r2.stdout || "").match(/på (\d+) bolag i \d+ branscher/);
ut.push("LIVE llms: " + (m ? m[1] + " bolag" : "mönster saknas"));
console.log(ut.join("\n"));
