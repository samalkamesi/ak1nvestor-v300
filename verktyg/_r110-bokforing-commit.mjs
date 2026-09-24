#!/usr/bin/env node
// ROND 110 — bokförings-commit + push-cykel. Loggar till data/vakten/r110-bokf-commit.log.
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, appendFileSync, readFileSync } from "node:fs";

const LOGG = "data/vakten/r110-bokf-commit.log";
mkdirSync("data/vakten", { recursive: true });
writeFileSync(LOGG, `# r110 bokförings-commit — start ${new Date().toISOString()}\n`);
function steg(namn, cmd, args, tak = 570_000) {
  appendFileSync(LOGG, `\n## ${namn}\n`);
  const r = spawnSync(cmd, args, { encoding: "utf8", timeout: tak });
  appendFileSync(LOGG, `${(r.stdout ?? "").slice(-3000)}\n${(r.stderr ?? "").slice(-3000)}\n# exit=${String(r.status)}\n`);
  return r;
}

const FILER = ["worklog.md", "data/forskning/PIPELINE-KO.md", "verktyg/_r110-bokforing.mjs", "verktyg/_r110-verifiera-prod.mjs", "verktyg/_r110-commit.mjs", "verktyg/_r110-bokforing-commit.mjs"];
const msg = "studio: rond 110 bokföring — worklog + beslutsminne + PIPELINE-KO (v214 STÄNGD, 213(b) mottagningsläge 7/10) + rondens wrappers; prod KVD grön: bygge 05:41 bär v214 (traffadeNyckelord i server-chunks), prod 200, anfader 6a36717e verifierad [fabrik]";

const add = steg("add", "git", ["add", ...FILER]);
if (add.status !== 0) process.exit(1);
const commit = steg("commit", "git", ["commit", "-m", msg]);
if (commit.status !== 0) process.exit(1);

steg("fetch", "git", ["fetch", "prod", "develop"]);
const lokalt = steg("rev-parse lokal", "git", ["rev-parse", "develop"]);
const prodRef = steg("rev-parse prod", "git", ["rev-parse", "prod/develop"]);
if (lokalt.stdout.trim() !== prodRef.stdout.trim()) {
  steg("merge", "git", ["merge", "prod/develop", "-m", "Merge remote-tracking branch 'prod/develop' into develop"]);
}
steg("push", "git", ["push", "prod", "develop"]);
const slutL = spawnSync("git", ["rev-parse", "develop"], { encoding: "utf8" });
const slutP = spawnSync("git", ["rev-parse", "prod/develop"], { encoding: "utf8" });
appendFileSync(LOGG, `\nLOKAL=${slutL.stdout.trim()} PROD=${slutP.stdout.trim()} SAMMA=${slutL.stdout.trim() === slutP.stdout.trim()}\n`);
console.log(`KLAR — lokal=${slutL.stdout.trim().slice(0, 8)} prod=${slutP.stdout.trim().slice(0, 8)}`);
