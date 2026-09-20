#!/usr/bin/env node
/** VÅG 222 — fixture-kur commit + push ENDAST när inget bygge löper (src-swapp-skydd). */
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
    const ut = execFileSync("ps", ["aux"], { encoding: "utf8", timeout: 10_000 });
    return /next build|npm ci|flock -w 900/.test(ut);
  } catch {
    return true; // okänt läge = vänta
  }
};

appendFileSync(
  ROTA + "/data/forskning/PIPELINE-KO.md",
  `
- ✓ VÅG 222 STÄNGD (rond 114 [Φ]): DÖDA-LÄNKAR-SVITENS J-FIXTURE KURAD (född röd, aldrig flagning) — v218-svepets 5 röda (J1-J6) var en deterministisk kapplöpning i TESTET, inte i verktyget: verktyget (o113-designen, korrekt) ser gröna prober i fönstervakten och startar återmätningen ~20–50 ms efter mellanlager #1 skrevs, MEN fixturen flippar sin "fönstret stängt"-signal först vid nästa 100 ms-filpoll ⇒ crawl #2 såg 500 igen (BÅDA mellanlagren drift, exit 2). KUR: flippen drivs av crawl #2:s EGEN sitemap-förfrågan (deterministiskt mellan lagren — före #2:s sidor, efter #1). BEVIS: sviten 42 PASS / 0 FAIL / 1 SKIP (G skippar ärligt: äkta byggfönster pågick under körningen); J5 bär mätvärdet atermat=1 drift=0 sidor=21. Verktyget orört (rött-förblir-rött-respekten: felet låg i fixturens timing, inte i o113-kontraktet). Push-grind: ingen push medan bygge löper (src-swapp-skydd, deploydagen 2026-09-20:s läxa).
`
);
appendFileSync(
  ROTA + "/worklog.md",
  `\n**${nu.toISOString().slice(0, 10)} ${tid} — våg 222 STÄNGD (rond 114 [organ:Φ]): döda-länkar-svitens J-fixture kurad (42/0/1).** De 5 röda var fixturens timing-bugg (född röd): verktyget startar återmätningen ~20–50 ms efter mellanlagret — före fixturens 100 ms-poll flippar. Kur: flip vid crawl #2:s sitemap-förfrågan. Bevis: 42 PASS/0 FAIL/1 SKIP (G: äkta byggfönster). Verktyget orört. [studio]\n`
);
const msgFil = ROTA + "/verktyg/_v222-commitmsg.txt";
writeFileSync(
  msgFil,
  `studio: våg 222 [organ:Φ] — J-fixturens timing-kapplöpning kurad (42/0/1)

v218-svepets 5 röda (J1-J6) var TESTET:s bugg, fött rött: verktyget
(o113-designen) startar återmätningen ~20–50 ms efter mellanlager #1
— fixturen flippar sin fönster signal först vid 100 ms-filpoll ⇒
crawl #2 såg 500 igen.

- Kur: flippen drivs av crawl #2:s EGEN sitemap-förfrågan (före dess
  sidor, efter crawl #1) — deterministiskt mellan lagren.
- Bevis: 42 PASS / 0 FAIL / 1 SKIP (G skippar vid äkta byggfönster).
- Verktyget orört — felet låg i fixturen, inte i kontraktet.`
);
run("git", [
  "add",
  "verktyg/testa-doda-lankar-externa.mjs",
  "verktyg/_v222-commit.mjs",
  "verktyg/_v222-commitmsg.txt",
  "data/forskning/PIPELINE-KO.md",
  "worklog.md",
]);
console.log("COMMIT:", run("git", ["commit", "-F", msgFil]).trim().split("\n")[0]);

let pushad = false;
for (let i = 0; i < 40 && !pushad; i++) {
  if (byggeLoper()) {
    console.log("push-grind: bygge löper (" + (i + 1) + "/40) — väntar 60 s");
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
