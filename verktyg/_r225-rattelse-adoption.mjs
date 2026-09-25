#!/usr/bin/env node
/** _r225-rattelse-adoption.mjs — adoption av prod-trädets ändring(ar) + repush + verifikation. Kvitto: /tmp/r225-adoption.txt */
import { readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { spawnSync as sp } from "node:child_process";

const A = "/home/ak1a/agent/ak1";
const P = "/home/ak1a/AK1";
const ut = [];
const run = (cwd, args, tag) => {
  const r = sp("git", args, { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, timeout: 240000 });
  ut.push(`[${tag}] exit ${r.status} :: ${(r.stdout || r.stderr || "").trim().split("\n").slice(-2).join(" | ").slice(0, 200)}`);
  return r;
};

const st = run(P, ["status", "--porcelain"], "prod-status");
const mFiler = (st.stdout || "").split("\n").filter((r) => r.startsWith(" M")).map((r) => r.slice(3).trim());
ut.push("ändrade i prod: " + (mFiler.join(", ") || "inga"));
for (const FIL of mFiler) {
  const head = sp("git", ["-C", P, "show", `HEAD:${FIL}`], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const disk = readFileSync(`${P}/${FIL}`, "utf8");
  ut.push(`${FIL}: ren-append ${disk.startsWith(head.stdout)} (+${disk.length - head.stdout.length})`);
  copyFileSync(`${P}/${FIL}`, `${A}/${FIL}`);
  run(P, ["checkout", "--", FIL], "prod-checkout");
}
if (mFiler.length) {
  run(A, ["add", ...mFiler], "add-adoptioner");
  const ca = run(A, ["commit", "-m", "studio: [organ:Φ] rond 225 rättelse-adoption — prod-trädets ändring(ar) av " + mFiler.join(", ") + " adopterade för ren updateInstead-push"], "commit-adoption");
  if (ca.status === 0) {
    const pu = run(A, ["push", "prod", "develop"], "push-2");
    if (pu.status === 0) {
      const r2 = sp("curl", ["-s", "--max-time", "20", "https://lab.ak1nvestor.com/llms.txt"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
      const m = (r2.stdout || "").match(/på (\d+) bolag i \d+ branscher/);
      ut.push("LIVE llms: " + (m ? m[1] + " bolag" : "mönster saknas"));
      const uni = sp("node", ["/home/ak1a/agent/ak1/verktyg/_r225-u29-prodverif.mjs"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
      ut.push((uni.stdout || "").trim());
    }
  }
} else {
  const pu = run(A, ["push", "prod", "develop"], "push-retry");
}
writeFileSync("/tmp/r225-adoption.txt", ut.join("\n"));
console.log(ut.join("\n"));
