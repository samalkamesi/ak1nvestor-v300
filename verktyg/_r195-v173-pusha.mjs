#!/usr/bin/env node
/**
 * _r195-v173-pusha.mjs — prod-rening + push + efterverifiering (rond 188-mönstret,
 * node-kanalen eftersom direkta git-kommandon mot /home/ak1a/AK1 hänger just nu).
 * Idempotent: rensar ENBART motorervalidering-filen (innehållet bevisat adopterat
 * i commit 82986950), pushar develop → prod (updateInstead), verifierar slutläget.
 * Kvitto: /tmp/r195-push.txt
 */
import { spawnSync as sp } from "node:child_process";
import { writeFileSync } from "node:fs";

const P = "/home/ak1a/AK1";
const ut = [];
const run = (cwd, args, tag) => {
  const r = sp("git", args, { cwd, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  ut.push(`[${tag}] git ${args.join(" ")} → exit ${r.status}${(r.stdout || "").trim() ? "\n  ut: " + (r.stdout || "").trim().split("\n").slice(0, 6).join("\n  ") : ""}${(r.stderr || "").trim() ? "\n  fe: " + (r.stderr || "").trim().split("\n").slice(0, 4).join("\n  ") : ""}`);
  return r;
};

// 1. prod-status före
const st1 = run(P, ["status", "--porcelain"], "prod-status-före");
const mFöre = (st1.stdout || "").split("\n").filter((r) => r.startsWith(" M")).length;
ut.push(`prod M-rader före: ${mFöre}`);

// 2. rensa motorervalidering-M om den kvarstår (adopterad i 82986950)
if ((st1.stdout || "").includes("data/rapporter/motorervalidering-2026-09-02.md")) {
  run(P, ["checkout", "--", "data/rapporter/motorervalidering-2026-09-02.md"], "prod-checkout");
  const st2 = run(P, ["status", "--porcelain"], "prod-status-efter");
  ut.push(`prod M-rader efter rensning: ${(st2.stdout || "").split("\n").filter((r) => r.startsWith(" M")).length}`);
} else {
  ut.push("prod: motorervalidering-M redan rensad (hängda kommandot verkställdes)");
}

// 3. push develop → prod
const pu = run("/home/ak1a/agent/ak1", ["push", "prod", "develop"], "push");
if (pu.status !== 0) {
  ut.push("PUSH AVVISAD — se ovan");
  writeFileSync("/tmp/r195-push.txt", ut.join("\n"));
  console.log(ut.join("\n"));
  process.exit(1);
}

// 4. efterverifiering: prod HEAD + filerna på plats
const lg = run(P, ["log", "--oneline", "-1"], "prod-HEAD");
run(P, ["status", "--porcelain"], "prod-status-slut");
const uni = sp("node", ["-e", "const u=JSON.parse(require('fs').readFileSync('" + P + "/data/portfolj-system/bolagsunivers.json','utf8'));console.log(u.length+' bolag; 4661.T='+u.some(b=>b.ticker==='4661.T'))"], { encoding: "utf8" });
ut.push("prod universum: " + (uni.stdout || "").trim());

writeFileSync("/tmp/r195-push.txt", ut.join("\n"));
console.log(ut.join("\n"));
