#!/usr/bin/env node
// ROND 107 — landa VÅG 212: fetch+merge prod, stage allt, commit -F, push.
// node-kanalen (SKAL-KVOTEN); steg för steg med tydlig utdata.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ARB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const run = (cmd, args) => execFileSync(cmd, args, { cwd: ARB, encoding: "utf8", timeout: 300_000 }).trim();

// 1) STAGE + COMMIT EGET FÖRST (D2-mönstret: append-ledgerns worklog-rader
//    blockerar merge annars — eget commitas, sen fogar unionen vid merge)
const filer = [
  "verktyg/kor-alla-tester.mjs",
  "verktyg/prod-synk.mjs",
  "verktyg/testa-prod-synk-vaktrapport.mjs",
  "verktyg/testa-rsc-skann.mjs",
  "data/motorregister.json",
  "data/rapporter/motorregister-2026-09-19.md",
  "data/forskning/V212-KVALITETSSYSTEMET-AGGREGATOR-VAKTRAPPORTSSTOPP-MOTORREGISTER.md",
  "data/forskning/PIPELINE-KO.md",
  "verktyg/_r106-pusha-wrapper.mjs",
  "worklog.md",
];
// harmoniserade sviter + r107-skript via status (ändrade/testa-ai-mentor- + _r107-)
const status = run("git", ["status", "--porcelain"]).split("\n");
for (const rad of status) {
  const f = rad.slice(3).trim();
  if (/^verktyg\/testa-ai-mentor-.*\.mjs$/.test(f) || /^verktyg\/_r107-.*$/.test(f)) filer.push(f);
}
run("git", ["add", ...new Set(filer)]);
console.log("stage: " + new Set(filer).size + " filer");
console.log(run("git", ["commit", "-F", "verktyg/.r107-msg.txt"]).split("\n").slice(0, 3).join(" | "));

// 2) ta emot fabrikens commits (v211-barnen commitade i prod-trädet) — union fogar worklog
try {
  const ahead = run("git", ["rev-list", "--count", "HEAD..prod/develop"]);
  if (ahead === "0") {
    console.log("merge: prod redan ikapp");
  } else {
    console.log("merge: tar emot " + ahead + " commit(s) ur prod/develop");
    console.log(run("git", ["merge", "--no-edit", "prod/develop"]).split("\n")[0]);
  }
} catch (e) {
  console.log("MERGE-FEL: " + String(e.message || e).slice(0, 200));
  process.exit(1);
}

// 4) push
for (let i = 1; i <= 3; i++) {
  try {
    const ut = run("git", ["push", "prod", "develop"]);
    console.log("push " + i + " OK: " + ut.split("\n").pop());
    break;
  } catch (e) {
    const fel = String(e);
    if (fel.includes("staged changes") || fel.includes("unstaged")) {
      console.log("push " + i + ": REN-YTA-GRIND — prod-trädet smutsigt, avvaktar");
      break;
    }
    console.log("push " + i + " fel — fetch+merge + omförsök: " + fel.split("\n").filter((r) => r.includes("rejected")).join("|").slice(0, 120));
    try {
      run("git", ["fetch", "prod", "develop"]);
      run("git", ["merge", "--no-edit", "prod/develop"]);
    } catch { /* nästa varv */ }
  }
}

// 5) kvitto
try {
  run("git", ["merge-base", "--is-ancestor", "HEAD", "prod/develop"]);
  console.log("R107 PUSHEAD ✓ " + run("git", ["rev-parse", "--short", "HEAD"]));
} catch {
  console.log("R107 EJ PUSHEAD ännu — vänta-pusher krävs");
}
fs.rmSync(path.join(ARB, "verktyg", ".r107-msg.txt"), { force: true });
