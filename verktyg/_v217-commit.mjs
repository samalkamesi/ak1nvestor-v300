#!/usr/bin/env node
/** VÅG 217 — stängning: PIPELINE-KO + worklog + commit + push (vänteloop). */
import { appendFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const ROTA = "/home/ak1a/agent/ak1";
const nu = new Date();
const tid = nu.toISOString().slice(11, 16) + "Z";
const run = (file, args, opts = {}) =>
  execFileSync(file, args, { cwd: ROTA, encoding: "utf8", timeout: 300000, ...opts });

appendFileSync(
  ROTA + "/data/forskning/PIPELINE-KO.md",
  `
- ✓ VÅG 217 STÄNGD (rond 113 [Φ]): MITT-I-SVIT-RAM-VAKT i aggregatorn (kor-alla-tester.mjs korSvit) — startvakten (vantaRam 900 MB) skyddade endast svitSTART, men r112-fullsvepet dog 2× VID sviten (styrelsemötet, 127 MB fritt): svitens EGEN tillväxt mitt i löpet dödade aggregATORN — OOM-offret blev fel process. KUR: väktare pollar MemAvailable var 10:e s under PÅGÅENDE svit; < RAM_KRIT_MB (250, överskridbar via AK1A_RAM_KRIT_MB) två poller i rad ⇒ svitTRÄDET avlivas (dodaDeltrad + gradvis SIGTERM⇒SIGKILL-backstop) och sviten markeras RÖD(ram-vakt) med orsaken 'svitträdet avlivat … serverns skydd går före mätningen' — aldrig tyst (styrelsens kvittokrav), aldrig grönt (ofullständig mätning är ALDRIG grönt). BEVIS: _v217-bevis.mjs med AK1A_RAM_KRIT_MB=9000 + 40 s-sömnoffer (committas ej): 1:a+2:a poll detekterade ⇒ offret avlivat vid 20 s, RÖD(ram-vakt) i JSON-rapporten, aggregatern levde ut RESULTAT_JSON — exakt den ordningen som saknades 07:21/09:0x. node --check grön. Kvar: V218 fullsvep attempt 3 med skyddet aktivt.
`
);

appendFileSync(
  ROTA + "/worklog.md",
  `\n**${nu.toISOString().slice(0, 10)} ${tid} — våg 217 STÄNGD (rond 113 [organ:Φ]): mitt-i-svit-RAM-vakt i aggregatorn.** Roten (fullsvepet dog 2× vid styrelsemötet, 127 MB fritt): startvakten skyddade svitSTART men inte pågående svit — svitens egen tillväxt dödade aggregATORN. Kur: väktare var 10:e s under pågående svit, <250 MB två poller ⇒ svitträdet avlivas (dodaDeltrad + SIGTERM⇒SIGKILL), sviten RÖD(ram-vakt) med ärlig orsak — servern skyddas, mätningen aldrig tyst eller falskt grön. Bevis: sömnoffer + omöjlig tröskel ⇒ avlivning vid 20 s, RÖD i JSON-rapport, aggregatern levde. Tröskel överskridbar (AK1A_RAM_KRIT_MB). Nästa: V218 fullsvep attempt 3. [studio]\n`
);

const msgFil = ROTA + "/verktyg/_v217-commitmsg.txt";
writeFileSync(
  msgFil,
  `studio: våg 217 [organ:Φ] — mitt-i-svit-RAM-vakt i aggregatorn (bevis: avlivning vid 20 s)

Roten (r112-fullsvepet dog 2x vid styrelsemötet, 127 MB fritt):
startvakten skyddade svitSTART — inte pågående svit; svitens egen
tillväxt dodade aggregATORN (OOM-offret blev fel process).

- kor-alla-tester.mjs korSvit: vaktare pollar var 10:e s; under 250 MB
  tva poller => svittradet avlivas (dodaDeltrad + SIGTERM=>SIGKILL),
  sviten ROD(ram-vakt) with arlig orsak — aldrig tyst, aldrig grant.
- Troskel overskridbar: AK1A_RAM_KRIT_MB (beviskorningar + drift).
- _v217-bevis.mjs: PASS — offret avlivat vid 20 s, ROD i JSON,
  aggregatern levde ut rapporten. PIPELINE-KO V217 STANGD.`
);
run("git", [
  "add",
  "verktyg/kor-alla-tester.mjs",
  "verktyg/_v217-bevis.mjs",
  "verktyg/_v217-commit.mjs",
  "verktyg/_v217-commitmsg.txt",
  "verktyg/_r113-anfader2.mjs",
  "data/forskning/PIPELINE-KO.md",
  "worklog.md",
]);
const commitUt = run("git", ["commit", "-F", msgFil]);
console.log("COMMIT:", commitUt.trim().split("\n")[0]);

let pushad = false;
for (let i = 0; i < 22 && !pushad; i++) {
  try {
    const ut = run("git", ["push", "prod", "develop"]);
    console.log("PUSH GRÖN:", ut.trim().split("\n").pop());
    pushad = true;
  } catch (e) {
    const ferr = String(e.stdout || "") + String(e.stderr || "");
    if (/non-fast-forward|fetch first/i.test(ferr)) {
      try {
        run("git", ["fetch", "prod"]);
        run("git", ["merge", "--no-edit", "prod/develop"]);
        console.log("MERGE: prod/develop inmergead (omgång " + (i + 1) + ")");
      } catch (me) {
        console.log("MERGE-försök " + (i + 1) + ": " + String(me.stderr || me.message).slice(0, 120));
      }
    } else {
      console.log("push väntar (" + (i + 1) + "/22): " + ferr.trim().split("\n").pop().slice(0, 120));
    }
    if (!pushad && i < 21) run("sleep", ["50"]);
  }
}
console.log(pushad ? "SLUT: pushad" : "SLUT: push väntar (omkör skriptet)");
