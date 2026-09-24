#!/usr/bin/env node
// ROND 112 — prod-trädsond via node-kanalen: vad spärrar updateInstead-pushen?
import { execFileSync } from "node:child_process";

const PROD = "/home/ak1a/AK1";
const git = (args) =>
  execFileSync("git", ["-C", PROD, ...args], { encoding: "utf8", timeout: 60_000 });

console.log("=== status --short ===");
console.log(git(["status", "--short"]));
console.log("=== HEAD ===");
console.log(git(["log", "--oneline", "-3"]));
