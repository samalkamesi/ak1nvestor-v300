#!/usr/bin/env node
/** Rond 122-pushare (fristående): fetch + merge (worklog union) + push med
 *  30 × 60 s tålamod — studio-shallets belastningsvågor kringgås. */
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const ROT = "/home/ak1a/agent/ak1";
const SVAR = `${ROT}/data/vakten/f3-push-svar.txt`;
const lines = [`PUSHARE start ${new Date().toISOString()} — commit b98fdd61 väntar`];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cd = (arr) => execFileSync(arr[0], arr.slice(1), { encoding: "utf8", cwd: ROT, maxBuffer: 16 * 1024 * 1024 });

try {
  for (let i = 1; i <= 30; i++) {
    try {
      cd(["git", "fetch", "prod", "develop"]);
      const ref = fs.readFileSync(`${ROT}/.git/refs/remotes/prod/develop`, "utf8").trim();
      // ny tippe att merge:a? (annars: push rakt av)
      try { cd(["git", "merge-base", "--is-ancestor", ref, "HEAD"]); }
      catch {
        const m = cd(["git", "merge", "-m", "merge prod (fabriksleveranser) — rond 122", "prod/develop"]);
        lines.push(`merge: ${m.split("\n")[0]}`);
      }
      const p = cd(["git", "push", "prod", "develop"]);
      lines.push(`PUSH GRÖN: ${p.trim().split("\n").pop()}`);
      fs.writeFileSync(SVAR, lines.join("\n") + "\n");
      console.log(lines.join("\n"));
      process.exit(0);
    } catch (e) {
      lines.push(`försök ${i}: ${String(e.stderr || e.message).split("\n")[0].slice(0, 120)}`);
      fs.writeFileSync(SVAR, lines.join("\n") + "\n");
      await sleep(60_000);
    }
  }
  lines.push("30 försök uttömda");
  fs.writeFileSync(SVAR, lines.join("\n") + "\n");
  console.log(lines.join("\n"));
} catch (e) { fs.writeFileSync(SVAR, lines.join("\n") + `\nFEL ${String(e.message).slice(0, 300)}\n`); }
