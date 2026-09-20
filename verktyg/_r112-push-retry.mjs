#!/usr/bin/env node
// ROND 112 — push-väntcykel: prod-trädet spärras av fabrikchilds PÅGÅENDE
// leverans (modifierade spårade filer ägs av barnet — rör ALDRIG). Vänta i
// loop tills trädet är rent för spårade filer, då fetch+merge+push.
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const ROT = "/home/ak1a/agent/ak1";
const PROD = "/home/ak1a/AK1";
const LOGG = `${ROT}/data/vakten/r112-push-retry.log`;

const linje = (s) => fs.appendFileSync(LOGG, `${new Date().toISOString()} ${s}\n`);
fs.writeFileSync(LOGG, `R112 PUSH-VÄNTCYKEL ${new Date().toISOString()}\n`);

const git = (katalog, args, tak = 120_000) => {
  try {
    return {
      ok: true,
      ut: execFileSync("git", ["-C", katalog, ...args], { encoding: "utf8", timeout: tak }),
    };
  } catch (e) {
    return { ok: false, ut: String(e.message) };
  }
};

const smutsigaSparade = () => {
  const s = git(PROD, ["status", "--short"]);
  if (!s.ok) return ["<statusfel>"];
  return s.ut
    .split("\n")
    .filter((r) => r && (r.startsWith(" M ") || r.startsWith("M ") || r.startsWith("MM") || r.startsWith(" D ") || r.startsWith("D ")))
    .map((r) => r.trim());
};

for (let forsok = 1; forsok <= 16; forsok++) {
  const smutsiga = smutsigaSparade();
  if (smutsiga.length === 0) {
    linje(`försök ${forsok}: prod rent för spårade filer — pushar.`);
    const f = git(ROT, ["fetch", "prod"]);
    if (!f.ok) {
      linje(`fetch FEL: ${f.ut.split("\n")[0]}`);
      process.exit(1);
    }
    const m = git(ROT, ["merge", "prod/develop", "--no-edit"]);
    linje(`merge: ${m.ok ? m.ut.trim().split("\n")[0] : "OOK (" + m.ut.split("\n")[0] + ")"}`);
    if (!m.ok && !m.ut.includes("Already up to date") && !m.ut.includes("Already up-to-date")) {
      // Auto-merge kan ha gått bra ändå om felet är exit-kod från diff-checkers; verifiera:
      const h = git(ROT, ["rev-parse", "--short", "HEAD"]);
      linje(`HEAD efter merge-fel: ${h.ok ? h.ut.trim() : "?"}`);
    }
    const p = git(ROT, ["push", "prod", "develop"], 180_000);
    if (p.ok) {
      const head = git(ROT, ["rev-parse", "--short", "HEAD"]).ut.trim();
      const prod = git(ROT, ["rev-parse", "--short", "prod/develop"]).ut.trim();
      linje(`PUSH GRÖN — HEAD=${head} prod=${prod} SAMMA=${head === prod}`);
      console.log(`push grön HEAD=${head}`);
      process.exit(0);
    }
    linje(`push FEL: ${p.ut.split("\n").slice(0, 3).join(" | ")}`);
    process.exit(1);
  }
  linje(`försök ${forsok}: prod spärrad av ${smutsiga.length} spårade ändringar (${smutsiga[0]}${smutsiga.length > 1 ? " +" + (smutsiga.length - 1) + " till" : ""}) — väntar 60 s.`);
  await new Promise((r) => setTimeout(r, 60_000));
}
linje("TAK NÅTT (16 min): prod fortfarande spärrad — avbryter, nästa iteration pushar.");
console.log("tak nått");
process.exit(1);
