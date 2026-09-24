#!/usr/bin/env node
// F2: fetch prod → merge → push prod develop → verifiera anfaderskap.
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const YTA = "/home/ak1a/agent/ak1";
const R = `${YTA}/verktyg/_f2-merge-push-resultat.txt`;
const log = (s) => fs.appendFileSync(R, `${new Date().toISOString()} ${s}\n`);
const git = (args, tak = 120_000) => execFileSync("git", ["-C", YTA, ...args], { encoding: "utf8", timeout: tak });
fs.writeFileSync(R, "MERGE-PUSH START\n");

try {
  log("fetch: " + git(["fetch", "prod", "develop"]).trim());
} catch (e) {
  log(`fetch-fel: ${String(e.message).slice(0, 300)}`);
  process.exit(1);
}
try {
  log("merge: " + git(["merge", "FETCH_HEAD", "-m", "Merge remote-tracking branch 'prod/develop' into develop (rond 111 F2-rotkur)"]).split("\n").slice(-2).join(" | "));
} catch (e) {
  log(`merge-fel: ${String(e.message).slice(0, 400)}`);
  process.exit(1);
}
try {
  log("push: " + git(["push", "prod", "develop"]).trim().split("\n").slice(-2).join(" | "));
} catch (e) {
  log(`push-fel: ${String(e.message).slice(0, 400)}`);
  process.exit(1);
}
try {
  const HEAD = git(["rev-parse", "HEAD"]).trim();
  const PROD_HEAD = git(["--git-dir", "/home/ak1a/AK1/.git", "rev-parse", "develop"]).trim();
  log(`HEAD=${HEAD.slice(0, 8)} prod/develop=${PROD_HEAD.slice(0, 8)} samma=${HEAD === PROD_HEAD}`);
  const merges = git(["log", "--oneline", "-3"]).trim();
  log("sista 3:\n" + merges);
} catch (e) {
  log(`verifiering-fel: ${String(e.message).slice(0, 200)}`);
}
log("MERGE-PUSH SLUT");
