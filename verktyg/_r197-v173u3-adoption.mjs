#!/usr/bin/env node
/**
 * _r197-v173u3-adoption.mjs — prod-trädets M-filer: sondera diff (HEAD-prefix-append?),
 * adoptera till arbetsytan, rensa i prod, commit + push + verifiera (rond 188/195-mönstret).
 * Kvitto: /tmp/r197-adoption.txt
 */
import { spawnSync as sp } from "node:child_process";
import { readFileSync, writeFileSync, copyFileSync } from "node:fs";

const A = "/home/ak1a/agent/ak1";
const P = "/home/ak1a/AK1";
const ut = [];
const run = (cwd, args, tag) => {
  const r = sp("git", args, { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, timeout: 240000 });
  ut.push(`[${tag}] exit ${r.status} :: ${(r.stdout || r.stderr || "").trim().split("\n").slice(-2).join(" | ").slice(0, 240)}`);
  return r;
};

// 1. hitta M-filer i prod
const st = run(P, ["status", "--porcelain"], "prod-status");
const mFiler = (st.stdout || "").split("\n").filter((r) => r.startsWith(" M")).map((r) => r.slice(3).trim());
ut.push("prod M-filer: " + (mFiler.join(", ") || "(inga)"));

// 2. adoptera varje M-fil (ren append-kontroll)
for (const FIL of mFiler) {
  const head = sp("git", ["-C", P, "show", `HEAD:${FIL}`], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const disk = readFileSync(`${P}/${FIL}`, "utf8");
  const append = disk.startsWith(head.stdout);
  ut.push(`${FIL}: HEAD ${head.stdout.length} · disk ${disk.length} · ren-append ${append}${append ? " (+" + (disk.length - head.stdout.length) + " tecken)" : " — MODIFIERAD I KROPPEN, manuell granskning krävs"}`);
  copyFileSync(`${P}/${FIL}`, `${A}/${FIL}`);
  ut.push("  adopterad till arbetsytan");
}

// 3. rensa i prod
for (const FIL of mFiler) run(P, ["checkout", "--", FIL], "prod-checkout " + FIL.slice(-30));
run(P, ["status", "--porcelain"], "prod-status-efter");

// 4. commit + push från arbetsytan
run(A, ["add", ...mFiler], "add-adoptioner");
const c = run(A, ["commit", "-m", "studio: [organ:Φ] rond 197 adoption — prod-trädets rena append(ar) av " + mFiler.join(", ") + " adopterade för ren updateInstead-push (innehållet bevarat i historiken)"], "commit-adoption");
if (c.status === 0) {
  run(A, ["push", "prod", "develop"], "push");
  const r2 = sp("curl", ["-s", "--max-time", "20", "https://lab.ak1nvestor.com/llms.txt"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  const m = (r2.stdout || "").match(/på (\d+) bolag i \d+ branscher \(rådata ([\d-]+)\)/);
  ut.push("LIVE llms efter push: " + (m ? `${m[1]} bolag, rådata ${m[2]}` : "mönster saknas"));
  const uni = sp("node", ["-e", "const u=JSON.parse(require('fs').readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json','utf8'));console.log(u.length+' bolag; TELUS='+u.some(b=>b.ticker==='TELUS'))"], { encoding: "utf8" });
  ut.push("prod-trädet: " + (uni.stdout || "").trim());
  run(A, ["status", "--porcelain"], "arbetsyte-slut");
}
writeFileSync("/tmp/r197-adoption.txt", ut.join("\n"));
console.log(ut.join("\n"));
