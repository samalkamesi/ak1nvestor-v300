#!/usr/bin/env node
// ROND 107 — vänta-pusher (r106-mönstret): prod-trädet hålls av LEVANDE
// fabriksbarn (auto-s1 granskningsvågen) — push försöks var 60:e minut-cykel
// (fetch→merge→push), tak 30 cykler; kvitto data/vakten/r107-push-kvitto.json.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ARB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const run = (c, a) => execFileSync(c, a, { cwd: ARB, encoding: "utf8", timeout: 300_000 }).trim();
const isPAD = () => {
  try {
    run("git", ["merge-base", "--is-ancestor", "HEAD", "prod/develop"]);
    return true;
  } catch {
    return false;
  }
};
const KVT = path.join(ARB, "data", "vakten", "r107-push-kvitto.json");

for (let i = 1; i <= 30; i++) {
  if (isPAD()) {
    fs.writeFileSync(KVT, JSON.stringify({ status: "PUSHAD", hash: run("git", ["rev-parse", "--short", "HEAD"]), cykel: i, ts: new Date().toISOString() }, null, 2));
    process.exit(0);
  }
  try {
    run("git", ["push", "prod", "develop"]);
    if (isPAD()) {
      fs.writeFileSync(KVT, JSON.stringify({ status: "PUSHAD", hash: run("git", ["rev-parse", "--short", "HEAD"]), cykel: i, ts: new Date().toISOString() }, null, 2));
      process.exit(0);
    }
  } catch {
    try {
      run("git", ["fetch", "prod", "develop"]);
      run("git", ["merge", "--no-edit", "prod/develop"]);
    } catch { /* barnens yta — nästa cykel */ }
  }
  await new Promise((r) => setTimeout(r, 60_000));
}
fs.writeFileSync(KVT, JSON.stringify({ status: "UPPGIVEN", ts: new Date().toISOString() }, null, 2));
