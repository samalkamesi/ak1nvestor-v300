#!/usr/bin/env node
// F2: bokförings-commit + push (fetch-först-cykeln: prod kan ha ny kod).
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const YTA = "/home/ak1a/agent/ak1";
const R = `${YTA}/verktyg/_f2-bokf-commit-resultat.txt`;
const log = (s) => fs.appendFileSync(R, `${new Date().toISOString()} ${s}\n`);
const git = (args, tak = 600_000) => execFileSync("git", ["-C", YTA, ...args], { encoding: "utf8", timeout: tak });
fs.writeFileSync(R, "BOKFÖRINGS-COMMIT START\n");

const MEDD = `${YTA}/verktyg/_f2-bokf-meddelande.txt`;
fs.writeFileSync(
  MEDD,
  `studio: ROND 111 bokföring — worklog + beslutsminne (F2-rotkuren d0c13a6d, prod c621815e) + rondens F2-bevisfilerna (kur, statusprob, devort-dödning, commit-/merge-cyklar, slutverifiering) [fabrik]`,
  "utf8"
);

try {
  git(["add", "worklog.md", "data/vakten/beslutsminne.jsonl",
       "verktyg/_f2-commit.mjs", "verktyg/_f2-commit-meddelande.txt", "verktyg/_f2-commit-resultat.txt",
       "verktyg/_f2-merge-push.mjs", "verktyg/_f2-merge-push-resultat.txt",
       "verktyg/_f2-prodstatus.mjs", "verktyg/_f2-prodstatus-resultat.txt",
       "verktyg/_f2-proddiff.mjs", "verktyg/_f2-proddiff-resultat.txt",
       "verktyg/_f2-prodcommit-merge-push.mjs", "verktyg/_f2-pcmp-resultat.txt",
       "verktyg/_f2-slutverifiering.mjs", "verktyg/_f2-slut-resultat.txt",
       "verktyg/_f2-bokforing.mjs", "verktyg/_f2-bokf-meddelande.txt",
       "verktyg/_f2-bokforing-commit.mjs"], 30_000);
  log("add OK");
} catch (e) {
  log(`add-fel: ${String(e.message).slice(0, 300)}`);
}
try {
  log("commit: " + git(["commit", "-F", MEDD]).split("\n").slice(0, 2).join(" | "));
} catch (e) {
  log(`commit-fel: ${String(e.message).slice(0, 400)}`);
}
try {
  log("push: " + git(["push", "prod", "develop"], 120_000).trim().split("\n").slice(-2).join(" | "));
} catch (e) {
  log(`push-avvisad — fetch+merge+om: ${String(e.message).slice(0, 150)}`);
  try {
    git(["fetch", "prod", "develop"], 60_000);
    git(["merge", "FETCH_HEAD", "-m", "Merge prod (rond 111 bokföring)"], 60_000);
    log("push om: " + git(["push", "prod", "develop"], 120_000).trim().split("\n").slice(-2).join(" | "));
  } catch (e2) {
    log(`om-fel: ${String(e2.message).slice(0, 300)}`);
  }
}
try {
  const HEAD = git(["rev-parse", "HEAD"]).trim();
  const PROD_HEAD = git(["--git-dir", "/home/ak1a/AK1/.git", "rev-parse", "develop"]).trim();
  log(`HEAD=${HEAD.slice(0, 8)} prod=${PROD_HEAD.slice(0, 8)} SAMMA=${HEAD === PROD_HEAD}`);
  log("status:\n" + git(["status", "--short"], 30_000));
} catch (e) {
  log(`verifiering-fel: ${String(e.message).slice(0, 200)}`);
}
log("BOKFÖRINGS-COMMIT SLUT");
