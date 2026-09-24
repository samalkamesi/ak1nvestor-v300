#!/usr/bin/env node
// ROND 112 — slutverifiering: rondens commit anfader i prod? + svepets läge.
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const ROT = "/home/ak1a/agent/ak1";
const git = (args) => execFileSync("git", ["-C", ROT, ...args], { encoding: "utf8" });

try {
  execFileSync("git", ["-C", ROT, "merge-base", "--is-ancestor", "d2fe02bd", "prod/develop"]);
  console.log("ANFADER-JA: d2fe02bd (V213(c)) är anfader i prod/develop");
} catch {
  console.log("ANFADER-NEJ — d2fe02bd saknas i prod!");
}
const head = git(["rev-parse", "--short", "HEAD"]).trim();
const prod = git(["rev-parse", "--short", "prod/develop"]).trim();
console.log(`HEAD=${head} prod=${prod} SAMMA=${head === prod}`);
const logg = fs.readFileSync(`${ROT}/data/vakten/r112-fullsvep.log`, "utf8");
const slut = logg.includes("FULLSVEP R112 SLUT");
console.log(`fullsvep SLUT-rad: ${slut ? "JA" : "nej (löper)"}`);
if (slut) console.log(logg.slice(logg.lastIndexOf("FULLSVEP R112 SLUT")));
