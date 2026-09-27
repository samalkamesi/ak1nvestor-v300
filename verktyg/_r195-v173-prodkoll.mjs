#!/usr/bin/env node
/**
 * _r195-v173-prodkoll.mjs — prod-kontroller för v173-leveransen:
 * HTTP ×4 (https / · /dataset · /dataset/konsument · /llms.txt + localhost /dataset)
 * + git-status i BÅDA träden (push kräver rent prod-träd — rond 188:s läxa).
 * Kvitto: /tmp/r195-prod.txt
 */
import { spawnSync as sp } from "node:child_process";
import { writeFileSync } from "node:fs";

const ut = [];
for (const url of [
  "https://lab.ak1nvestor.com/",
  "https://lab.ak1nvestor.com/dataset",
  "https://lab.ak1nvestor.com/dataset/konsument",
  "https://lab.ak1nvestor.com/llms.txt",
  "http://localhost:3000/dataset",
]) {
  const r = sp("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "20", url], { encoding: "utf8" });
  ut.push(`${r.status === 0 ? r.stdout.trim() : "FEL"} ${url}`);
}
for (const trd of ["/home/ak1a/agent/ak1", "/home/ak1a/AK1"]) {
  const r = sp("git", ["-C", trd, "status", "--porcelain"], { encoding: "utf8" });
  const rader = (r.stdout || "").trim().split("\n").filter(Boolean);
  ut.push(`TRÄD ${trd}: ${rader.length} smutsrader${rader.length ? " → " + rader.slice(0, 12).join(" | ") : " (RENT)"}`);
}
const r2 = sp("curl", ["-s", "--max-time", "20", "https://lab.ak1nvestor.com/llms.txt"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
const m = (r2.stdout || "").match(/på (\d+) bolag i \d+ branscher \(rådata ([\d-]+)\)/);
ut.push("LIVE llms dataset-rubrik: " + (m ? `${m[1]} bolag, rådata ${m[2]}` : "mönster saknas"));
writeFileSync("/tmp/r195-prod.txt", ut.join("\n"));
console.log(ut.join("\n"));
