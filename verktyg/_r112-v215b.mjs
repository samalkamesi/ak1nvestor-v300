#!/usr/bin/env node
// ROND 112 tillägg — V215.2 STÄNGS: bokför kur i PIPELINE-KO + worklog, commit+push.
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const ROT = "/home/ak1a/agent/ak1";
const KO = `${ROT}/data/forskning/PIPELINE-KO.md`;
const WORKLOG = `${ROT}/worklog.md`;
const LOGG = `${ROT}/data/vakten/r112-v215b.log`;
const linje = (s) => fs.appendFileSync(LOGG, `${new Date().toISOString()} ${s}\n`);
fs.writeFileSync(LOGG, `R112 V215.2-STÄNGNING ${new Date().toISOString()}\n`);

// ── 1. PIPELINE-KO: (2)-delen stängs ────────────────────────────────────────
const gammalt = "ELLER äkta API-gap mitt i turn; diagnos före kur, ALDRIG kur på antagande.";
const nytt =
  "— DIAGNOS KLAR + KURAD SAMMA ROND: MÄTPARTSFEL bevisat (disk-fallbacken läste EGEN träds data/vakten/ där målstate aldrig finns — katalogen gitignorerad och synkas ej mellan träd; API:t mäter prod) och aktiv=false-fönstret mitt i sessionsturn är verkligt men täckt av arm-kedjan; KUR: fallbacken läser prod-trädets mal-state.json (/home/ak1a/AK1/…, lasPass-precedensen i samma fil) — scenariotestet 5/5 GRÖN efter kur.";
let ko = fs.readFileSync(KO, "utf8");
const n = ko.split(gammalt).length - 1;
if (n !== 1) {
  linje(`FEL: (2)-segmentet träffade ${n} gånger — KO orörd.`);
  process.exit(1);
}
fs.writeFileSync(KO, ko.replace(gammalt, nytt));
linje("PIPELINE-KO: V215.2 STÄNGD (1 träff)");

// ── 2. Worklog-rad ──────────────────────────────────────────────────────────
fs.appendFileSync(
  WORKLOG,
  `
## ROND 112 TILLÄGG [organ:Φ] — 2026-09-20 ~08:2x lokal: VÅG 215.2 STÄNGD (S2 MÅLET:s mätpartsfel kurat — scenariotestet 5/5 GRÖN)
ROT (bevisad): scenariosvitens S2-kontroll mäter PROD-API:t men dess disk-fallback läste trädrelativ data/vakten/mal-state.json — sann endast när pumpor-daemonen kör sviten ur PROD-trädet (designkontext 04:44); i aggregatorns ARBETSYTA-kontext finns filen aldrig (data/vakten/ gitignorerad, synkas ej) ⇒ falskt "aktiv=false och INGEN disk" 07:55 medan målhjärtat levde och mal-state korrekt persistades i prod (hjärtats "mål borta men prompt kör — väntar" 07:51 = korrekt väntan mitt i sessionsturn). KUR: fallbacken läser prod-trädets absoluta sökväg (/home/ak1a/AK1/data/vakten/mal-state.json) — samma precedens som lasPass() i filen redan använder för nyckeln; korrekt i BÅDA körkontexterna. BEVIS: omkörning efter kur = SCENARIOTEST GRÖNT 5/5 (S1 tråd 175→175 · S2 aktiv=true · S3 puls 11 ms · S4 audit 200 · S5 juridik GUL FEL=0). KVAR I VÅG 215: del 1 (payload-tak 235,9 kB > 200 kB — src-yta, bygge) = nästa ronds kodvåg. [fabrik]
`,
);
linje("Worklog: tilläggsrad appenderad");

// ── 3. Commit + push ────────────────────────────────────────────────────────
const MEDDELANDE = `${ROT}/verktyg/_r112-v215b-meddelande.txt`;
fs.writeFileSync(
  MEDDELANDE,
  `studio: ROND 112 tillägg [organ:Φ] — VÅG 215.2 STÄNGD: S2 MÅLET:s mätpartsfel kurat (disk-fallback läser prod-trädets mal-state.json, lasPass-precedensen — trädrelativ sökväg var sann bara i daemonens prod-kontext, i arbetsytan fanns filen aldrig) · omkörning: SCENARIOTEST 5/5 GRÖN (aktiv=true · puls 11 ms · juridik GUL FEL=0) · V215.1 (payload-taket, src-yta) kvar som nästa kodvåg [fabrik]\n`,
);
const git = (args, tak = 900_000) =>
  execFileSync("git", ["-C", ROT, ...args], { encoding: "utf8", timeout: tak });
git(["add", "verktyg/testa-studio-scenarion.mjs", "data/forskning/PIPELINE-KO.md", "worklog.md", "verktyg/_r112-v215b.mjs"]);
const c = git(["commit", "-F", MEDDELANDE]);
linje(`commit: ${c.split("\n")[0]}`);
try {
  git(["push", "prod", "develop"], 180_000);
  linje("push 1 GRÖN");
} catch {
  git(["fetch", "prod"]);
  const m = git(["merge", "prod/develop", "--no-edit"]);
  linje(`merge: ${m.trim().split("\n")[0]}`);
  git(["push", "prod", "develop"], 180_000);
  linje("push 2 GRÖN");
}
const head = git(["rev-parse", "--short", "HEAD"]).trim();
const prod = git(["rev-parse", "--short", "prod/develop"]).trim();
linje(`HEAD=${head} prod=${prod} SAMMA=${head === prod}`);
console.log(`V215.2 stängd + pushad HEAD=${head}`);
