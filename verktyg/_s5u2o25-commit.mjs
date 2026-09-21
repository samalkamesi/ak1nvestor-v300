#!/usr/bin/env node
/**
 * s5-u2 (manifest auto-s5-1789962309223, omgång 25) — COMMIT-WRAPPER:
 * worklog-append → git add (exklusivt mina filer) → git commit -F.
 * Körs EFTER GRÖN KVD + GRÖN SYNK + GRÖN FRONT B + tsc 0.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const MINA_FILER = [
  "data/kurser-tillagg/bk-08-intaktredovisningen.json",
  "data/kurser-tillagg/roic-05-den-ekonomiska-vinsten.json",
  "public/deep-courses.json",
  "public/llms.txt",
  "public/llms-full.txt",
  "public/sok-index.json",
  "public/speglar-slugar.json",
  "data/siffror.json",
  "src/lib/larvag-karta.ts",
  "src/lib/ai-mentor-register.ts",
  "verktyg/_s5u2o25-fixar.mjs",
  "verktyg/_s5u2o25-fix2.mjs",
  "verktyg/_s5u2o25-fix3.mjs",
  "verktyg/_s5u2o25-kvd.mjs",
  "verktyg/_s5u2o25-synk.mjs",
  "verktyg/_s5u2o25-frontb.mjs",
  "verktyg/_s5u2o25-commitmsg.txt",
  "verktyg/_s5u2o25-worklog-append.txt",
  "worklog.md",
];

// 1. Worklog-append (idempotensvakt: hoppa om raden redan finns)
const append = readFileSync(ROT + "/verktyg/_s5u2o25-worklog-append.txt", "utf8");
const worklog = readFileSync(ROT + "/worklog.md", "utf8");
if (worklog.includes("manifest auto-s5-1789962309223, omgång 25, byggare 2/3")) {
  console.log("─ worklog bär redan o25-u2-raden — ingen dubbelappend.");
} else {
  writeFileSync(ROT + "/worklog.md", worklog.replace(/\n*$/, "\n") + "\n" + append.replace(/\n*$/, "\n"), "utf8");
  console.log("─ worklog.md: o25-u2-raden appenderad (" + append.length + " tecken).");
}

// 2. git add (ENDAST mina filer — exklusivt ägarskap)
execFileSync("git", ["add", ...MINA_FILER], { cwd: ROT, stdio: ["ignore", "pipe", "pipe"] });
console.log("─ git add: " + MINA_FILER.length + " filer stagade.");

// 3. git commit -F (grinden körs: tsc-baslinjen + nyckelfiler)
const r = spawnSync("git", ["commit", "-F", "verktyg/_s5u2o25-commitmsg.txt"], { cwd: ROT, encoding: "utf8" });
console.log(r.stdout.trim());
if (r.status !== 0) {
  console.error("COMMIT-FEL (kod " + r.status + "):\n" + r.stderr);
  process.exit(1);
}

// 4. Bevis
const bevis = execFileSync("git", ["log", "-1", "--format=%h %s"], { cwd: ROT, encoding: "utf8" }).trim();
console.log("BEVIS: " + bevis);
