#!/usr/bin/env node
// R112 lägesprob: anfaderskap + svepläge.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
const ROT = "/home/ak1a/agent/ak1";
try {
  execFileSync("git", ["-C", ROT, "merge-base", "--is-ancestor", "d4bb265f", "prod/develop"]);
  console.log("ANFADER-JA: d4bb265f (V215.2) i prod/develop");
} catch {
  console.log("ANFADER-NEJ: d4bb265f SAKNAS i prod!");
}
const logg = fs.readFileSync(`${ROT}/data/vakten/r112-fullsvep.log`, "utf8");
console.log(logg.includes("FULLSVEP R112 SLUT") ? "svep: SLUT landat" : "svep: löper");
console.log(logg.slice(logg.lastIndexOf("… GRÖN") > -1 ? logg.lastIndexOf("\n", logg.length - 400) : 0).split("\n").slice(-3).join("\n"));
