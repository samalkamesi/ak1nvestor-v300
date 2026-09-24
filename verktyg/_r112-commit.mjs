#!/usr/bin/env node
// ROND 112 — commit- + push-cykel via node-kanalen (git direkt i studio-shallet
// hänger just nu). tsc-grinden i pre-commit tar minuter — kör i bakgrund.
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const ROT = "/home/ak1a/agent/ak1";
const LOGG = `${ROT}/data/vakten/r112-commit.log`;
const MEDDELANDE = `${ROT}/verktyg/_r112-commit-meddelande.txt`;

const linje = (s) => fs.appendFileSync(LOGG, `${new Date().toISOString()} ${s}\n`);
fs.writeFileSync(LOGG, `R112 COMMIT-CYKEL ${new Date().toISOString()}\n`);

const FILER = [
  "verktyg/testa-dataset-aspekter.mjs",
  "verktyg/ts-import.mjs",
  "verktyg/_ts-resolve-hooks.mjs",
  "verktyg/_r112-fullsvep.mjs",
  "verktyg/_r112-starta.mjs",
  "verktyg/_r112-kor-dataset-aspekter.mjs",
  "verktyg/_r112-bokfor.mjs",
  "verktyg/_r112-commit.mjs",
  "verktyg/_r112-commit-meddelande.txt",
  "verktyg/_r112-dataset-aspekter-resultat.txt",
  "verktyg/_r112-fullsvep-status.txt",
  "verktyg/_f2-bokf-commit-resultat.txt",
  "worklog.md",
  "data/forskning/PIPELINE-KO.md",
];

const git = (args, alternativ = {}) => {
  const ut = execFileSync("git", ["-C", ROT, ...args], {
    encoding: "utf8",
    timeout: 15 * 60 * 1000,
    ...alternativ,
  });
  return ut;
};

try {
  linje(`add: ${FILER.join(" ")}`);
  git(["add", ...FILER]);
  linje("add OK — commit (tsc-grinden löper, detta tar minuter)…");
  const commitUt = git(["commit", "-F", MEDDELANDE]);
  linje(`commit: ${commitUt.split("\n")[0]}`);
  linje("push försök 1…");
  try {
    const pushUt = git(["push", "prod", "develop"]);
    linje(`push: ${pushUt.trim().split("\n").pop()}`);
  } catch (pushFel) {
    linje(`push avvisad (${String(pushFel.message).split("\n")[0]}) — fetch+merge+push-cykeln:`);
    git(["fetch", "prod"]);
    const mergeUt = git(["merge", "prod/develop", "--no-edit"]);
    linje(`merge: ${mergeUt.trim().split("\n")[0]}`);
    const pushUt2 = git(["push", "prod", "develop"]);
    linje(`push 2: ${pushUt2.trim().split("\n").pop()}`);
  }
  const head = git(["rev-parse", "--short", "HEAD"]).trim();
  const prod = git(["rev-parse", "--short", "prod/develop"]).trim();
  linje(`HEAD=${head} prod=${prod} SAMMA=${head === prod}`);
  linje("COMMIT-CYKEL OK");
  console.log(`klar HEAD=${head} prod=${prod}`);
} catch (e) {
  linje(`FEL: ${e.message}`);
  process.exit(1);
}
