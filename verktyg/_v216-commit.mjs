#!/usr/bin/env node
/**
 * VÅG 216 — stängning: PIPELINE-KO + worklog + commit + push (vänteloop).
 * K2-mall: execFileSync-arrayer genomgående.
 */
import { appendFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const ROTA = "/home/ak1a/agent/ak1";
const nu = new Date();
const tid = nu.toISOString().slice(11, 16) + "Z";
const run = (file, args, opts = {}) =>
  execFileSync(file, args, { cwd: ROTA, encoding: "utf8", timeout: 300000, ...opts });

// ── PIPELINE-KO: V216 STÄNGD ────────────────────────────────────────────────
appendFileSync(
  ROTA + "/data/forskning/PIPELINE-KO.md",
  `
- ✓ VÅG 216 STÄNGD (rond 113 [Φ]): OMSTART-SAMORDNINGEN verktyg/omstart-samordning.mjs — EN ägare per pm2-omstart: (1) deploybygget äger pm2 medan /tmp/ak1a-deploy.lock hålls (flock-probe; rond 50-doktrinen mekaniserad), (2) senaste omstart journaliseras trädoberoende i /tmp/ak1a-omstart-journal.json — ANNAN kanal inom 3 min vägras (08:41-dubbelomstartens rot). Hjärtats 4 råa execSync-omstarter (web-vakt ×2, frusen-turn, kilad-turn) migrerade — mål-kirurgin löper OAVSETT om.startad (V215-vaccinet bevarat); pulsvaktens omstartaApp() journalerar via samma modul (egna tak/deploy-grindar kvar som komplement). BEVIS: _v216-test.mjs 8/8 PASS med PATH-stubbade pm2+flock (deterministiskt, noll prod-risk) — annan kanal vägras utan pm2-anrop · fri omstart journaleras · deploy vägrar · egen kanal/åldrad post blockerar ej; journal + stubbar städas i finally (hjärtat läser journalen i drift). node --check ×4 gröna.
`
);

// ── Worklog ─────────────────────────────────────────────────────────────────
appendFileSync(
  ROTA + "/worklog.md",
  `\n**${nu.toISOString().slice(0, 10)} ${tid} — våg 216 STÄNGD (rond 113 [organ:Φ]): omstart-samordning — EN ägare per pm2-omstart.** Roten 08:41 (hjärta + pulsvakt omstartade samma minut, orsakade själva ECONNREFUSED-larmet) kurad i kanalerna: ny verktyg/omstart-samordning.mjs (deploylås-flock-probe + trädoberoende /tmp-journal, annan kanal <3 min vägras), hjärtats 4 omstartsplatsen migrerade med V215-vaccinet bevarat (mål-kirurgin oavsett om.startad), pulsvakten journalerar via samma modul. Bevis: 8/8 PASS med stubbade pm2/flock (ingen riktig omstart), syntax ×4 grön. Nästa: V217 TUNG-klass RAM-skydd, V218 fullsvep attempt 3. [studio]\n`
);

// ── Commit ──────────────────────────────────────────────────────────────────
const msgFil = ROTA + "/verktyg/_v216-commitmsg.txt";
writeFileSync(
  msgFil,
  `studio: våg 216 [organ:Φ] — omstart-samordning: EN ägare per pm2-omstart (8/8 bevis)

Roten 2026-09-20 08:41: målhjärta + pulsvakt pm2-omstartade appen samma
minut — kanalerna orsakade själva ECONNREFUSED-larmet de sedan läkte.

- verktyg/omstart-samordning.mjs (NY): deploylås-flock-probe (bygget äger
  pm2) + trädoberoende journal i /tmp — annan kanal <3 min vägras.
- mal-hjartslag.mjs: 4 omstartsplatsen migrerade (web-vakt ×2, frusen-
  turn, kilad-turn); mål-kirurgin löper oavsett om.startad (v215-bevarat).
- pulsvakt.mjs: omstartaApp() via samordningen (egna tak/grindar kvar).
- _v216-test.mjs: 8/8 PASS, PATH-stubbade pm2+flock, journal städas i
  finally. PIPELINE-KO V216 STÄNGD.`
);
run("git", [
  "add",
  "verktyg/omstart-samordning.mjs",
  "verktyg/mal-hjartslag.mjs",
  "verktyg/pulsvakt.mjs",
  "verktyg/_v216-test.mjs",
  "verktyg/_v216-commit.mjs",
  "verktyg/_v216-commitmsg.txt",
  "data/forskning/PIPELINE-KO.md",
  "worklog.md",
]);
const commitUt = run("git", ["commit", "-F", msgFil]);
console.log("COMMIT:", commitUt.trim().split("\n")[0]);

// ── Push (vänte-merge, kortare — r113-loopen kan ha löst det) ──────────────
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
