#!/usr/bin/env node
/**
 * s5-u2 (manifest auto-s5-1789932910773, omgång 24) — COMMIT: worklog-append
 * + git add (ENDAST u2:s filer) + git commit -F. Syskonens kursfiler
 * (tx-06-fran-siffra-till-kassa, ib-06-family-officen) läggs INTE till —
 * deras ägarskap. Pre-commit-kvalitetsgrinden får göra sitt jobb (ALDRIG
 * --no-verify).
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { execFileSync, execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";

// 1. Worklog-append (nyast sist — kronologiskt, verifierat mot omgång 23:s placering)
const append = readFileSync(ROT + "/verktyg/_s5u2o24-worklog-append.txt", "utf8");
if (!append.startsWith("## SPÅR 5 s5-u2")) throw new Error("append-filen börjar inte med väntad rubrik");
let wl = readFileSync(ROT + "/worklog.md", "utf8");
if (wl.includes("tx-06-enhetsekonomin · ib-06-evighetskapitalet")) {
  console.log("─ worklog bär redan omgång 24-raden — idempotent hopp.");
} else {
  if (!wl.endsWith("\n")) wl += "\n";
  wl += append;
  writeFileSync(ROT + "/worklog.md", wl, "utf8");
  console.log("─ worklog.md: omgång 24-rad appenderad (+" + append.split("\n").length + " rader).");
}

// 2. git add — ENDAST u2:s filer
const minaFiler = [
  "data/kurser-tillagg/tx-06-enhetsekonomin.json",
  "data/kurser-tillagg/ib-06-evighetskapitalet.json",
  "public/deep-courses.json",
  "src/lib/larvag-karta.ts",
  "src/lib/ai-mentor-register.ts",
  "data/siffror.json",
  "public/llms.txt",
  "public/llms-full.txt",
  "public/sok-index.json",
  "public/speglar-slugar.json",
  "verktyg/_s5u2o24-kvd.mjs",
  "verktyg/_s5u2o24-synk.mjs",
  "verktyg/_s5u2o24-frontb.mjs",
  "verktyg/_s5u2o24-commitmsg.txt",
  "verktyg/_s5u2o24-worklog-append.txt",
  "worklog.md",
];
execFileSync("git", ["add", ...minaFiler], { cwd: ROT, stdio: "inherit" });
console.log("─ staged: " + minaFiler.length + " filer (u2:s ägarskap)");

// 3. Vakt: syskonens kursfiler får INTE vara staged
const staged = execSync("git diff --cached --name-only", { cwd: ROT, encoding: "utf8" }).trim().split("\n");
const främmand = staged.filter((f) => ["tx-06-fran-siffra-till-kassa.json", "ib-06-family-officen.json"].some((x) => f.endsWith(x)));
if (främmand.length) throw new Error("ABORT: syskonfiler staged: " + främmand.join(", "));

// 4. Commit -F (kvalitetsgrinden kör — ALDRIG --no-verify)
execFileSync("git", ["commit", "-F", "verktyg/_s5u2o24-commitmsg.txt"], { cwd: ROT, stdio: "inherit" });

// 5. Bevis
const log = execSync("git log -1 --format='%h %s'", { cwd: ROT, encoding: "utf8" }).trim();
console.log("─ COMMIT: " + log);
