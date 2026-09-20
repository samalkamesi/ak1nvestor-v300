#!/usr/bin/env node
/** VÅG 219 — stängning: harmonisering av 41 sviter + bokföring + push. */
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
- ✓ VÅG 219 STÄNGD (rond 114 [Φ]): SVITHARMONISERING pengarstid — fullsvep attempt 3 avslöjade ALLA 40 AI-Mentorn-sviter RÖDA med exakt 'okänd kedjekomponent: svaraLokaltPengarstid' (54e7a59e wireade pengarstid i widgeten utan svitharmonisering — v189:s kända mönster, nu i största skala). KUR: _v219-harmonisera.mjs infogade svaraLokaltPengarstid i KOMPONENTER-kedjan (mellan optionshantverk och marknadsrytm, widgetens wireningsordning) i 41 sviter med dokumentationsplikts-kommentar + kredit till skaparcommiten; 2 sviter hade den redan (kedja, marknadsrytm), 27 äldre kopior utan svansmönstret lämnades orörda (gröna i svepet). BEVIS: omkörningar GRÖNA i tre generationer — ägande 22/22 · faktordjup 35/35 ('inga okända komponenter') · överlevnadsdjup 34/34. NOTIS: det löpande v218-svepet mätte 40 sviter PRE-fix (deras RÖD kvarstår i svepets rapport — mätningstidens sanning); nästa svep är enhetligt grönt. LÄXA till s6-fönstret: varje ny widget-wire REQUIRES svitharmonisering i samma leverans (dokumentationsplikten) — annars 40 röda i nästa svep.
`
);

appendFileSync(
  ROTA + "/worklog.md",
  `\n**${nu.toISOString().slice(0, 10)} ${tid} — våg 219 STÄNGD (rond 114 [organ:Φ]): svitharmonisering pengarstid — 40 röda sviter helade i roten.** Fullsvep attempt 3:s första fynd var systematiskt: ALLA 40 AI-Mentorn-sviter röda med exakt 'okänd kedjekomponent: svaraLokaltPengarstid' — 54e7a59e (auto s6-u2) wireade pengarstid-lagret i chat-widgeten utan att harmonisera svitfamiljen (v189-mönstret). Kur: svaraLokaltPengarstid infogat i KOMPONENTER-kedjan (mellan optionshantverk och marknadsrytm) i 41 sviter med kredit-kommentar; 2 hade den, 27 äldre kopior orörda. Bevis: ägande 22/22 + faktordjup 35/35 + överlevnadsdjup 34/34 — alla GRÖNA med 'inga okända komponenter'. Det löpande svepets 40 röda är mätt PRE-fix (mätningstidens sanning) — nästa svep grönt. Läxa: widget-wire ⇒ harmonisering i samma leverans. [studio]\n`
);

const msgFil = ROTA + "/verktyg/_v219-commitmsg.txt";
writeFileSync(
  msgFil,
  `studio: våg 219 [organ:Φ] — svitharmonisering pengarstid: 40 röda AI-Mentorn-sviter helade

Fullsvep attempt 3:s systematiska fynd: ALLA 40 sviter röda med exakt
'okänd kedjekomponent: svaraLokaltPengarstid' — 54e7a59e wireade
pengarstid i widgeten utan svitharmonisering (v189-mönstret).

- _v219-harmonisera.mjs: infogar svaraLokaltPengarstid i KOMPONENTER
  (mellan optionshantverk och marknadsrytm) i 41 sviter med kredit;
  2 hade den, 27 äldre kopior utan mönstret orörda (gröna).
- Bevis: ägande 22/22, faktordjup 35/35, överlevnadsdjup 34/34 —
  'inga okända komponenter' i tre generationer.
- PIPELINE-KO V219 STÄNGD + läxa: widget-wire kräver harmonisering
  i samma leverans.`
);
run("git", ["add", "verktyg/testa-ai-mentor-*.mjs", "verktyg/_v219-harmonisera.mjs", "verktyg/_v219-commit.mjs", "verktyg/_v219-commitmsg.txt", "data/forskning/PIPELINE-KO.md", "worklog.md"]);
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
