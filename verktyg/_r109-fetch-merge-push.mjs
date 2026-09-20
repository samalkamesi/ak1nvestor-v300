#!/usr/bin/env node
// ROND 109 — prod-cykel: fetch + merge (om bakom) + push, med full loggning.
import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";

const ROT = "/home/ak1a/agent/ak1";
const LOGG = `${ROT}/data/vakten/r109-push.log`;
const steg = (namn, args) => {
  const ut = execFileSync("git", ["-C", ROT, ...args], { timeout: 120_000, encoding: "utf8" });
  appendFileSync(LOGG, `=== ${namn} ===\n${ut}\n`);
  return ut;
};

appendFileSync(LOGG, `\n===== ROND 109 cykel ${new Date().toISOString()} =====\n`);
steg("fetch", ["fetch", "prod"]);

const bakom = steg("efter: commits bakom", ["log", "--oneline", "HEAD..prod/develop"]);
appendFileSync(LOGG, `BAKOM: ${bakom.trim().split("\n").length} rader\n`);

if (bakom.trim()) {
  steg("merge prod/develop", ["merge", "prod/develop", "-m", "Merge remote-tracking branch 'prod/develop' into develop"]);
}

try {
  steg("push", ["push", "prod", "develop"]);
  appendFileSync(LOGG, "PUSH: GRÖN\n");
  console.log("PUSH GRÖN");
} catch (e) {
  appendFileSync(LOGG, `PUSH FÖRSÖK 1 FÖLL: ${String(e).slice(0, 300)}\n`);
  // etablerad kur: prod-trädet kan ha stageade ändringar (fabriksbarn) — vänta + cykla om
  const ut2 = execFileSync("git", ["-C", ROT, "merge", "prod/develop", "-m", "Merge remote-tracking branch 'prod/develop' into develop"], { timeout: 120_000, encoding: "utf8" }).catch?.(() => "") ?? "";
  appendFileSync(LOGG, `merge-2: ${ut2}\n`);
  steg("push 2", ["push", "prod", "develop"]);
  appendFileSync(LOGG, "PUSH: GRÖN (försök 2)\n");
  console.log("PUSH GRÖN försök 2");
}

const head = steg("slut: HEAD", ["log", "--oneline", "-1"]);
console.log(head.trim());
