#!/usr/bin/env node
// _v226-commit.mjs — idempotent commit av v226-vaktsvaret (append redan gjord
// av _v226-bokfor.mjs; detta skript vågar INTE appenda igen — dublettskydd).
import { execFileSync } from "node:child_process";

const ROT = "/home/ak1a/agent/ak1";
const MEDDELANDE =
  "studio: [organ:Φ] v226 vaktsvar — beroendevaktens high = transitiv dev-DoS (brace-expansion), ingen köpost enligt o46; patch-svältens rot = buntslagsracen (v225 kurerar)";

const git = (args, t = 30_000) =>
  execFileSync("git", args, { cwd: ROT, encoding: "utf8", timeout: t });

// 1) Läge: landade commiten trots SIGTERM:en?
const logga = git(["log", "--oneline", "-2"]);
console.log("LOG_FORE=\n" + logga.trim());
const landad = logga.includes("v226 vaktsvar");

if (landad) {
  console.log("REDAN LANDAD — ingen ny commit");
} else {
  // 2) tsc-koken i pre-commit behöver riktig tid (förra försöket SIGTERM:ades vid 60 s)
  git(["add", "worklog.md", "verktyg/_v226-beroende-koll.mjs"]);
  const ut = git(["commit", "-m", MEDDELANDE, "--", "worklog.md", "verktyg/_v226-beroende-koll.mjs"], 300_000);
  console.log("COMMIT=" + ut.trim().split("\n").slice(0, 3).join(" | "));
}

console.log("LOG_EFTER=\n" + git(["log", "--oneline", "-2"]).trim());
console.log("STATUS=" + git(["status", "--short"]).trim().split("\n").slice(0, 8).join(" | "));
