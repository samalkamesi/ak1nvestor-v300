#!/usr/bin/env node
/** R119-dokvåg: committa SYSTEMKARTAN (spår 9) + merge prod (fabriken har
 *  levererat committer under vår rond) + push. Worklog-konflikt = append-only
 *  ⇒ union (båda sidornas rader behålls); övriga konflikter avbryter ärligt. */
import { spawnSync } from "node:child_process";
import fs from "node:fs";

const ROT = "/home/ak1a/agent/ak1";
const RESULTAT = `${ROT}/data/vakten/r119-dokvag-svar.txt`;
const ut = [];
function kör(cmd, args) {
  const r = spawnSync(cmd, args, { cwd: ROT, encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
  return { kod: r.status, ut: (r.stdout || "") + (r.stderr || "") };
}

// 1) commit SYSTEMKARTAN
fs.writeFileSync(`${ROT}/data/vakten/r119-dokvag-msg.txt`,
  "studio: dokvåg spår 9 [organ:Φ] — SYSTEMKARTAN åttonde passningen: testsystemets sex kurer (V217 mitt-i-svit-vakt · V223 TUNG 3GB · V228 checkpoint · V229 sond-suffix · F2 dev-server-vaccin · V230 fabrikskoordination) + attempt 5:s sanning (155 sviter, 151 GRÖNA/3 RÖDA, TUNG omätt) — helsvepsbevis-gapet stängt\n");
let r = kör("git", ["add", "data/forskning/SYSTEMKARTAN.md"]);
ut.push(`add: ${r.kod}`);
r = kör("git", ["commit", "-F", "data/vakten/r119-dokvag-msg.txt"]);
ut.push(`commit: ${r.kod} ${r.ut.slice(0, 200).replace(/\n/g, " ")}`);
if (r.kod !== 0) { fs.writeFileSync(RESULTAT, ut.join("\n") + "\nRESULTAT: COMMIT FELADE\n"); console.log("COMMIT FELADE"); process.exit(1); }

// 2) merge prod (fabrikens leveranser)
r = kör("git", ["pull", "prod", "develop", "--no-rebase"]);
ut.push(`pull: ${r.kod} ${r.ut.slice(0, 300).replace(/\n/g, " ")}`);
if (r.kod !== 0) {
  const status = kör("git", ["status", "--porcelain"]);
  const konflikter = status.ut.split("\n").filter((x) => x.startsWith("UU") || x.startsWith("AA"));
  const baraWorklog = konflikter.length > 0 && konflikter.every((x) => x.includes("worklog.md"));
  if (!baraWorklog) {
    kör("git", ["merge", "--abort"]);
    fs.writeFileSync(RESULTAT, ut.join("\n") + `\nRESULTAT: MERGE-KONFLIKT ej worklog (${konflikter.join(", ") || "okänd"}) — avbröts, nästa rond tar den\n`);
    console.log("MERGE AVBRUTEN");
    process.exit(2);
  }
  // union: båda sidorna av worklog behålls (våra rader först, sedan prodens)
  const rå = fs.readFileSync(`${ROT}/worklog.md`, "utf8");
  const rensad = rå.replace(/<<<<<<< [^\n]*\n([\s\S]*?)=======\n([\s\S]*?)>>>>>>> [^\n]*\n/g, "$1$2");
  if (rensad.includes("<<<<<<<")) {
    kör("git", ["merge", "--abort"]);
    fs.writeFileSync(RESULTAT, ut.join("\n") + "\nRESULTAT: UNION-RENSNING MISSLYCKADES — avbröts\n");
    console.log("UNION FEL");
    process.exit(2);
  }
  fs.writeFileSync(`${ROT}/worklog.md`, rensad);
  kör("git", ["add", "worklog.md"]);
  r = kör("git", ["commit", "--no-edit"]);
  ut.push(`union-commit: ${r.kod} ${r.ut.slice(0, 150).replace(/\n/g, " ")}`);
}

// 3) push med tålamod
let pushKod = 1;
for (let i = 1; i <= 8; i++) {
  const p = kör("git", ["push", "prod", "develop"]);
  pushKod = p.kod;
  ut.push(`push försök ${i}: kod=${p.kod} ${p.ut.slice(0, 140).replace(/\n/g, " ")}`);
  if (p.kod === 0) break;
  if (i < 8) await new Promise((x) => setTimeout(x, 60_000));
}
fs.writeFileSync(RESULTAT, ut.join("\n") + `\nRESULTAT: ${pushKod === 0 ? "PUSH GRÖN — dokvåg + rond-119-commits i prod" : "PUSH NEKAD fortfarande — lokala commits väntar nästa rond"}\n`);
console.log(pushKod === 0 ? "PUSH GRÖN" : "PUSH NEKAD");
