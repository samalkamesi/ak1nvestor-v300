#!/usr/bin/env node
// ROND 110 — v214-commit genom tsc-grinden (lång) + push-cykel mot prod.
// Loggar varje steg till data/vakten/r110-commit.log (svaret kan gå förlorat).
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, appendFileSync, readFileSync } from "node:fs";

const LOGG = "data/vakten/r110-commit.log";
mkdirSync("data/vakten", { recursive: true });
writeFileSync(LOGG, `# r110 commit+push — start ${new Date().toISOString()}\n`);
function steg(namn, cmd, args) {
  appendFileSync(LOGG, `\n## ${namn}: ${cmd} ${args.join(" ")}\n`);
  const r = spawnSync(cmd, args, { encoding: "utf8", timeout: 570_000 });
  appendFileSync(LOGG, `${(r.stdout ?? "").slice(-4000)}\n${(r.stderr ?? "").slice(-4000)}\n# exit=${String(r.status)}\n`);
  return r.status === 0;
}

const FILER = [
  "src/lib/studio/styrelse.ts",
  "verktyg/testa-styrelse.mjs",
  "verktyg/testa-styrelse-v214.mjs",
  "verktyg/kor-alla-tester.mjs",
  "verktyg/_r110-ko-kopiera.mjs",
  "verktyg/_r110-v214-verifiera.mjs",
  "verktyg/_r110-v214-kontrakt.mjs",
  "verktyg/_r110-mini-svep.mjs",
];
const msg = readFileSync("data/vakten/r110-commitmsg.txt", "utf8");

if (!steg("add", "git", ["add", ...FILER])) process.exit(1);
if (!steg("commit", "git", ["commit", "-F", "data/vakten/r110-commitmsg.txt"])) process.exit(1);
// push-cykel: hämta prod, merge vid divergens, pusha (etablerat mönster)
steg("fetch", "git", ["fetch", "prod", "develop"]);
const lokalt = spawnSync("git", ["rev-parse", "develop"], { encoding: "utf8" });
const prodRef = spawnSync("git", ["rev-parse", "prod/develop"], { encoding: "utf8" });
if (lokalt.stdout.trim() !== prodRef.stdout.trim()) {
  steg("merge", "git", ["merge", "prod/develop", "-m", "Merge remote-tracking branch 'prod/develop' into develop"]);
}
steg("push", "git", ["push", "prod", "develop"]);
const slut = spawnSync("git", ["rev-parse", "develop"], { encoding: "utf8" });
const prodEfter = spawnSync("git", ["rev-parse", "prod/develop"], { encoding: "utf8" });
appendFileSync(LOGG, `\nLOKAL=${slut.stdout.trim()} PROD=${prodEfter.stdout.trim()} SAMMA=${slut.stdout.trim() === prodEfter.stdout.trim()}\n`);
console.log(`KLAR — lokal=${slut.stdout.trim().slice(0, 8)} prod=${prodEfter.stdout.trim().slice(0, 8)}`);
