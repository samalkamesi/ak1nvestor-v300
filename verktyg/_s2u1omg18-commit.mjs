#!/usr/bin/env node
/**
 * s2-u1 omg18 — SLUTSEQUENS (omg12-epilogens skärpning: append → add → commit
 * i EN sekvens utan mellanliggande KVD-utskrift; node-kanalen = den bevisat
 * pålitliga). Pathspec: ENBART egna, icke-gitignorerade vägar (omg14-läxan).
 */
import { appendFileSync, readFileSync } from "node:fs";
import { execSync, execFileSync } from "node:child_process";

appendFileSync("worklog.md", readFileSync("verktyg/_s2u1omg18-worklog-append.txt", "utf8"));
console.log("worklog appendad");

const PATHS = [
  "data/forskning/S2-U1-9983-FAST-RETAILING-UTOKNING-OMG18.md",
  "verktyg/_s2u1omg18-append-9983.mjs",
  "verktyg/_s2u1omg18-patch-notering.mjs",
  "verktyg/_s2u1omg18-llms-regen.mjs",
  "verktyg/_s2u1omg18-lackagevakt.mjs",
  "verktyg/_s2u1omg18-worklog-append.txt",
  "verktyg/_s2u1omg18-commitmsg.txt",
  "worklog.md",
];
console.log(execFileSync("git", ["add", ...PATHS], { encoding: "utf8" }));
const out = execSync('git commit -F verktyg/_s2u1omg18-commitmsg.txt', { encoding: "utf8" });
console.log(out);
console.log(execSync("git log --oneline -1", { encoding: "utf8" }));
console.log(execSync("git status --porcelain | head -3", { encoding: "utf8" }));
