#!/usr/bin/env node
// ROND 110 — verifiera prod-trädets HEAD + att v214-committen är anfader.
import { spawnSync } from "node:child_process";

const head = spawnSync("git", ["-C", "/home/ak1a/AK1", "log", "--oneline", "-3", "develop"], { encoding: "utf8" });
console.log("PROD TRÄD:\n" + head.stdout);

const anc = spawnSync("git", ["-C", "/home/ak1a/AK1", "merge-base", "--is-ancestor", "6a36717e", "develop"]);
console.log(`v214 (6a36717e) anfader i prod-trädet: ${anc.status === 0 ? "JA" : "NEJ"}`);

const smutsig = spawnSync("git", ["-C", "/home/ak1a/AK1", "status", "--short"], { encoding: "utf8" });
console.log("SMUTSIGT (toppen):\n" + (smutsig.stdout || "(rent)").split("\n").slice(0, 8).join("\n"));
