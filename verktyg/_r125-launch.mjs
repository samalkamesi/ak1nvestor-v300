#!/usr/bin/env node
// Rond 125-launcher: commit + push prod (merge vid fabriksrace), svar till fil.
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const YTA = "/home/ak1a/agent/ak1";
const SVAR = `${YTA}/data/vakten/r125-svar.json`;
const utf = { cwd: YTA, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] };
const spr = (cmd, args) => {
  try {
    const ut = execFileSync(cmd, args, utf);
    return { ok: true, ut: String(ut).slice(0, 4000) };
  } catch (e) {
    return { ok: false, ut: `${String(e.stdout || "")}${String(e.stderr || "")}`.slice(0, 4000) };
  }
};
const resultat = { ts: new Date().toISOString(), steg: [] };

// 1. commit (meddelandefil — kort kommandorad)
resultat.steg.push({ steg: "commit", ...spr("git", ["commit", "-F", "verktyg/_r125-msg.txt"]) });
if (!resultat.steg[0].ok) {
  fs.writeFileSync(SVAR, JSON.stringify(resultat, null, 2));
  console.log("commit misslyckades:", resultat.steg[0].ut.slice(0, 500));
  process.exit(1);
}
resultat.commit = spr("git", ["rev-parse", "--short", "HEAD"]).ut.trim();

// 2. push med merge-retry (fabriksrace: union-drivrutin löser worklog + ledger)
for (let forsok = 1; forsok <= 5; forsok++) {
  const p = spr("git", ["push", "prod", "develop"]);
  resultat.steg.push({ steg: `push-${forsok}`, ...p });
  if (p.ok) { resultat.push = "grön"; break; }
  if (!/rejected|fetch|non-fast-forward|lokalt alias/i.test(p.ut)) { resultat.push = "nekad-annan"; break; }
  const f = spr("git", ["fetch", "prod", "develop"]);
  resultat.steg.push({ steg: `fetch-${forsok}`, ...f });
  if (!f.ok) { await new Promise((r) => setTimeout(r, 30_000)); continue; }
  const m = spr("git", ["merge", "--no-edit", "FETCH_HEAD"]);
  resultat.steg.push({ steg: `merge-${forsok}`, ...m });
  if (!m.ok) {
    // konflikt utanför unionens räckvidd → avbryt, lämna läget rent
    spr("git", ["merge", "--abort"]);
    resultat.push = "merge-konflikt";
    break;
  }
}
if (resultat.push !== "grön") {
  //HEAD kan ändå ha committats+merge:ats — rapportera läget
  resultat.headEfter = spr("git", ["rev-parse", "--short", "HEAD"]).ut.trim();
}
fs.writeFileSync(SVAR, JSON.stringify(resultat, null, 2));
console.log(JSON.stringify({ commit: resultat.commit, push: resultat.push, headEfter: resultat.headEfter ?? null }));
