#!/usr/bin/env node
// _s4u2-inve-commit.mjs — worklog-append + kirurgisk git add + commit -F (min yta endast).
import { appendFileSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const ROT = "/home/ak1a/AK1";
const rad = readFileSync(ROT + "/verktyg/_s4u2-inve-worklog.txt", "utf8").trimEnd();
const wl = readFileSync(ROT + "/worklog.md", "utf8");
if (!wl.includes("INVESTOR AB Q3-LÄSPAKET (INTERIM MANAGEMENT STATEMENT)")) {
  appendFileSync(ROT + "/worklog.md", "\n" + rad + "\n");
  console.log("worklog.md: rad appenderad (" + rad.length + " tecken)");
} else console.log("worklog.md: raden finns redan — hoppar (idempotent)");

const filer = [
  "data/blogg-utkast/kvartal/2026-q3/sa-laser-du-investor-ab-q3-2026.json",
  "data/blogg-utkast/GRANSKNINGSKO-SAMMANSTALLNING.md",
  "verktyg/_s4u2-inve-byggdata.mjs",
  "verktyg/_s4u2-inve-kvd.mjs",
  "verktyg/_s4u2-inve-ko-rader.mjs",
  "verktyg/_s4u2-inve-worklog.txt",
  "verktyg/_s4u2-inve-commitmsg.txt",
  "worklog.md",
];
const git = (a) => execFileSync("git", a, { cwd: ROT, encoding: "utf8" });
console.log(git(["add", ...filer]));
const ut = git(["commit", "-F", "verktyg/_s4u2-inve-commitmsg.txt"]);
console.log(ut);
console.log(git(["log", "--oneline", "-1"]));
console.log(git(["status", "--short"]).split("\n").filter((l) => l && !l.startsWith("??")).join("\n") || "trädet rent utöver ospårade");
