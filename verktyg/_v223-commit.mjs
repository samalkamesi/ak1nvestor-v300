#!/usr/bin/env node
/** VÅG 223 — commit + push med bygge-grind + boka/launcha svep attempt 4. */
import { appendFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const ROTA = "/home/ak1a/agent/ak1";
const nu = new Date();
const tid = nu.toISOString().slice(11, 16) + "Z";
const run = (file, args, opts = {}) =>
  execFileSync(file, args, { cwd: ROTA, encoding: "utf8", timeout: 300_000, ...opts });
const sleep = (s) => run("sleep", [String(s)]);
const byggeLoper = () => {
  try {
    return /next build|npm ci|flock -w 900/.test(execFileSync("ps", ["aux"], { encoding: "utf8", timeout: 10_000 }));
  } catch {
    return true;
  }
};

appendFileSync(
  ROTA + "/data/forskning/PIPELINE-KO.md",
  `
- ✓ VÅG 223 STÄNGD (rond 114 [Φ]): AGGREGATORNS TREDJE DÖD KURAD I KLASSEN — attempt 3 dog vid styrelsemötet TROTS V217 (0 ram-vakt-träffar: mötets allokeringsexplosion går från fritt minne till OOM på <10 s — snabbare än två streckar à 10 s; sweep-loggen frös mitt i raden, rapporten skrevs ALDRIG, 154 mätta sviter levde bara i loggen: 111 GRÖN + 43 RÖD varav 42 redan kurade av V219/V221/V222 — endast testa-studio-tabbar kvar odiagnosticerat). KURER: (1) KLASSMEDVETET STARTKRAV — TUNG-TILLSTÅND kräver 3 000 MB FRIA före start (zcode-barnfamiljen ~0,4 GB/styck; annars ärlig väntar-ram/AVBRYTER-RAM MED rapport och --fortsatt — aldrig mer tyst död); (2) VAKTEN SNABBARE — 5 s-poll + EN varningsstreck + EN avlivningsstreck (bevis: offer avlivat vid 10 s, poll "2 — avlivar", RÖD(ram-vakt) i JSON, aggregatern levde ut rapporten). SVEP ATTEMPT 4 launchad med nya skydd.
`
);
appendFileSync(
  ROTA + "/worklog.md",
  `\n**${nu.toISOString().slice(0, 10)} ${tid} — våg 223 STÄNGD (rond 114 [organ:Φ]): aggregator klassmedveten RAM-skydd — tredje döden kurad.** Attempt 3:s död (0 vakträd! explosionen snabbare än 2×10 s) + 154 mätta sviter utan rapport. Kurer: TUNG-startkrav 3 GB (annars väntar/avbryter MED rapport) + 5 s/enstrecksvakt. Bevis: offer avlivat 10 s + RÖD(ram-vakt) + aggregat levande. Attempt 4 launchad. [studio]\n`
);
const msgFil = ROTA + "/verktyg/_v223-commitmsg.txt";
writeFileSync(
  msgFil,
  `studio: våg 223 [organ:Φ] — TUNG-startkrav 3 GB + enstrecksvakt (tredje döden kurad)

Attempt 3 dog vid styrelsemötet trots V217 — 0 ram-vakt-träffar:
mötets allokeringsexplosion når OOM snabbare än två streckar à 10 s;
loggen frös, rapporten skrevs aldrig (111 G + 43 R i loggen, 42 av
röda redan kurade av V219-V222).

- kor-alla-tester.mjs: TUNG-TILLSTÅND kräver 3 000 MB FRIA före start
  (vantaRam klassmedveten) — annars väntar/AVBRYTER-RAM MED rapport.
- Vakten: 5 s-poll, en varnings- + en avlivningsstreck.
- Bevis: offer avlivat vid 10 s ('poll 2 — avlivar'), RÖD(ram-vakt) i
  JSON, aggregatern levde ut rapporten. Attempt 4 launchad.`
);
run("git", [
  "add",
  "verktyg/kor-alla-tester.mjs",
  "verktyg/_v223-commit.mjs",
  "verktyg/_v223-commitmsg.txt",
  "data/forskning/PIPELINE-KO.md",
  "worklog.md",
]);
console.log("COMMIT:", run("git", ["commit", "-F", msgFil]).trim().split("\n")[0]);

let pushad = false;
for (let i = 0; i < 40 && !pushad; i++) {
  if (byggeLoper()) {
    console.log("push-grind: bygge löper (" + (i + 1) + "/40) — 60 s");
    sleep(60);
    continue;
  }
  try {
    run("git", ["push", "prod", "develop"]);
    console.log("PUSH GRÖN");
    pushad = true;
  } catch (e) {
    const ferr = String(e.stdout || "") + String(e.stderr || "");
    if (/non-fast-forward|fetch first/i.test(ferr)) {
      try {
        run("git", ["fetch", "prod"]);
        run("git", ["merge", "--no-edit", "prod/develop"]);
        console.log("MERGE (omgång " + (i + 1) + ")");
      } catch (me) {
        console.log("MERGE-försök: " + String(me.stderr || me.message).slice(0, 120));
      }
    } else {
      console.log("push väntar (" + (i + 1) + "/40): " + ferr.trim().split("\n").pop().slice(0, 120));
    }
    if (!pushad) sleep(50);
  }
}
console.log(pushad ? "SLUT: pushad" : "SLUT: push väntar (omkör)");
