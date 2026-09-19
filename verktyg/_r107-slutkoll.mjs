#!/usr/bin/env node
// ROND 107 — slutkoll: anfader-kedja + prod-HTTP + svep 2-kvitto.
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const ut = [];
try {
  execFileSync("git", ["-C", "/home/ak1a/AK1", "merge-base", "--is-ancestor", "ef3f1d5d", "HEAD"]);
  ut.push("anfader: ef3f1d5d ⊆ prod HEAD ✓");
} catch {
  ut.push("anfader: ef3f1d5d SAKNAS i prod HEAD ✗");
}
try {
  ut.push("prod HEAD: " + execFileSync("git", ["-C", "/home/ak1a/AK1", "rev-parse", "--short", "HEAD"], { encoding: "utf8" }).trim());
} catch { ut.push("prod HEAD: oläsbar"); }
try {
  const j = JSON.parse(fs.readFileSync("data/vakten/testaggregator-SENASTE.json", "utf8"));
  ut.push(`svep 2: ${j.grona} GRÖNA / ${j.roda} RÖDA av ${j.matta} (status ${j.status}, ${Math.floor(j.korTidSek / 60)} min)`);
} catch { ut.push("svep 2-json oläsbar"); }
const r = await fetch("https://lab.ak1nvestor.com/", { headers: { "User-Agent": "ak1a-r107-koll" }, signal: AbortSignal.timeout(20_000) });
ut.push("prod HTTPS: " + r.status);
fs.writeFileSync("data/vakten/r107-slutkoll.txt", ut.join("\n") + "\n");
console.log(ut.join("\n"));
