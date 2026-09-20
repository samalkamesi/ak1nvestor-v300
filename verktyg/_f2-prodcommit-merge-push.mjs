#!/usr/bin/env node
// F2: prod-trädet har en legitim färsk rapport ocommittad (spärrar push).
// Committa den prod-sida (fabrikens mönster) → fetch+merge lokalt → push.
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const YTA = "/home/ak1a/agent/ak1";
const PROD = "/home/ak1a/AK1";
const R = `${YTA}/verktyg/_f2-pcmp-resultat.txt`;
const log = (s) => fs.appendFileSync(R, `${new Date().toISOString()} ${s}\n`);
const git = (kat, args, tak = 600_000) =>
  execFileSync("git", ["-C", kat, ...args], { encoding: "utf8", timeout: tak });
fs.writeFileSync(R, "PROD-COMMIT MERGE PUSH START\n");

try {
  git(PROD, ["add", "data/rapporter/motorervalidering-2026-09-02.md"], 30_000);
  git(
    PROD,
    ["commit", "-m", "studio: prod färsk motorervalidering 05:02 — 107 PASS/0 FAIL/0 SKIP (100%-väktaren) avstämt ur prod-trädet [drift]"],
    600_000
  );
  log("prod-commit OK: " + git(PROD, ["log", "--oneline", "-1"], 30_000).trim());
} catch (e) {
  log(`prod-commit-fel: ${String(e.message).slice(0, 400)}`);
  process.exit(1);
}

try {
  log("fetch: " + git(YTA, ["fetch", "prod", "develop"], 60_000).trim());
  log("merge: " + git(YTA, ["merge", "FETCH_HEAD", "-m", "Merge prod motorervalidering (rond 111 F2)"], 60_000).trim().split("\n").slice(-1)[0]);
  log("push: " + git(YTA, ["push", "prod", "develop"], 120_000).trim().split("\n").slice(-2).join(" | "));
} catch (e) {
  log(`cykel-fel: ${String(e.message).slice(0, 400)}`);
  process.exit(1);
}

try {
  const HEAD = git(YTA, ["rev-parse", "HEAD"], 30_000).trim();
  const PROD_HEAD = git(PROD, ["rev-parse", "develop"], 30_000).trim();
  const samma = HEAD === PROD_HEAD;
  log(`HEAD=${HEAD.slice(0, 8)} prod=${PROD_HEAD.slice(0, 8)} SAMA=${samma}`);
  if (samma) {
    const anfader = git(YTA, ["merge-base", "--is-ancestor", "d0c13a6d", HEAD], 30_000).trim();
    log(`d0c13a6d (F2-rotkuren) anfader i prod: JA (exit 0)`);
  }
} catch (e) {
  log(`verifiering: ${String(e.message).slice(0, 200)}`);
}
log("PROD-COMMIT MERGE PUSH SLUT");
