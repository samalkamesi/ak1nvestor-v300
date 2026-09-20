#!/usr/bin/env node
/** o120 — namnstashämtning + selektiv indexstädning + commit + push. */
import { execFileSync } from "node:child_process";

const git = (...args) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

// 1) döp om kvarvarande o118-namngivna filer till o120
const omdop = [
  ["data/forskning/OPTIMERING/lighthouse/en_blogg-s7u3o118-foreA.json", "data/forskning/OPTIMERING/lighthouse/en_blogg-s7u3o120-foreA.json"],
  ["data/forskning/OPTIMERING/lighthouse/en_blogg-s7u3o118-foreB.json", "data/forskning/OPTIMERING/lighthouse/en_blogg-s7u3o120-foreB.json"],
  ["data/forskning/OPTIMERING/lighthouse/ar_blogg-s7u3o118-foreA.json", "data/forskning/OPTIMERING/lighthouse/ar_blogg-s7u3o120-foreA.json"],
  ["verktyg/_s7u3o118-analys.mjs", "verktyg/_s7u3o120-analys.mjs"],
  ["verktyg/_s7u3o118-djup2.mjs", "verktyg/_s7u3o120-djup2.mjs"],
  ["verktyg/_s7u3o118-trace-sond.mjs", "verktyg/_s7u3o120-trace-sond.mjs"],
  ["verktyg/_s7u3o118-trace-analys3.mjs", "verktyg/_s7u3o120-trace-analys3.mjs"],
  ["verktyg/_s7u3o118-flight-sond.mjs", "verktyg/_s7u3o120-flight-sond.mjs"],
];
import { renameSync } from "node:fs";
for (const [fran, till] of omdop) {
  try { renameSync(fran, till); console.log("döpt:", till); } catch (e) { console.log("hopp över:", fran, e.code); }
}

// 2) plocka bort MINA gamla o118-poster ur indexet ( AD / A på bortsprungna namn)
const gamla = [
  "data/forskning/OPTIMERING/lighthouse/en_blogg-s7u3o118-foreA.json",
  "data/forskning/OPTIMERING/lighthouse/en_blogg-s7u3o118-foreB.json",
  "data/forskning/OPTIMERING/lighthouse/ar_blogg-s7u3o118-foreA.json",
  "data/forskning/OPTIMERING/o118-prestanda-enblogg-longtask-s7.md",
  "verktyg/_s7u3o118-commitmsg.txt",
  "verktyg/_s7u3o118-worklog.txt",
  "verktyg/_s7u3o118-analys.mjs",
  "verktyg/_s7u3o118-djup2.mjs",
  "verktyg/_s7u3o118-trace-sond.mjs",
  "verktyg/_s7u3o118-trace-analys3.mjs",
  "verktyg/_s7u3o118-flight-sond.mjs",
];
try { console.log(git("restore", "--staged", ...gamla)); } catch (e) { console.log("restore-partial:", String(e.message).slice(0, 200)); }

// 3) add:a DINA filer (nya namn) — anspråket med -f (u1-precedens: vaktdokument försiktigt versionshanteras)
const filer = [
  "data/forskning/OPTIMERING/o120-prestanda-enblogg-longtask-s7.md",
  "data/forskning/OPTIMERING/lighthouse/en_blogg-s7u3o120-foreA.json",
  "data/forskning/OPTIMERING/lighthouse/en_blogg-s7u3o120-foreB.json",
  "data/forskning/OPTIMERING/lighthouse/ar_blogg-s7u3o120-foreA.json",
  "data/forskning/OPTIMERING/lighthouse/o120-djupanalys-befintlig.json",
  "data/forskning/OPTIMERING/lighthouse/o120-djupanalys-steg2.json",
  "data/forskning/OPTIMERING/lighthouse/o120-flight-sond.json",
  "data/forskning/OPTIMERING/lighthouse/o120-trace-attribution.json",
  "data/forskning/OPTIMERING/lighthouse/o120-tracesond-en_blogg-1.json",
  "data/forskning/OPTIMERING/lighthouse/o120-tracesond-en_blogg-2.json",
  "data/forskning/OPTIMERING/lighthouse/o120-tracesond-ar_blogg-1.json",
  "verktyg/_s7u3o120-analys.mjs",
  "verktyg/_s7u3o120-djup2.mjs",
  "verktyg/_s7u3o120-trace-sond.mjs",
  "verktyg/_s7u3o120-trace-analys3.mjs",
  "verktyg/_s7u3o120-flight-sond.mjs",
  "verktyg/_s7u3o120-worklog.txt",
  "verktyg/_s7u3o120-commitmsg.txt",
  "verktyg/_s7u3o120-commit.mjs",
  "worklog.md",
];
console.log(git("add", ...filer));
console.log(git("add", "-f", "data/vakten/s7-o120-enblogg-longtask-sond-u3-ansprak-2026-09-20.md"));

// 4) kontrollera att INGA syskonfiler hänger med i MIN commit
const staged = git("diff", "--cached", "--name-only").trim().split("\n");
console.log("staged för commit:", staged.length, "filer");
const frammande = staged.filter((f) => !filer.includes(f) && f !== "data/vakten/s7-o120-enblogg-longtask-sond-u3-ansprak-2026-09-20.md");
if (frammande.length) {
  console.log("⚠ FRÄMMANDE STAGED (avstannar — syskonyta):", frammande.join(", "));
  process.exit(2);
}

// 5) commit + push
console.log(git("commit", "-F", "verktyg/_s7u3o120-commitmsg.txt"));
console.log(git("push", "prod", "develop").slice(-300));
console.log(git("log", "--oneline", "-2"));
