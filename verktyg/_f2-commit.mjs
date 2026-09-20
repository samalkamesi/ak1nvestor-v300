#!/usr/bin/env node
// F2-commitcykel: status → add → commit (-F meddelandefil, tsc-grinden tar
// minuter) → push prod develop. Loggar varje steg till _f2-commit-resultat.txt.
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const YTA = "/home/ak1a/agent/ak1";
const R = `${YTA}/verktyg/_f2-commit-resultat.txt`;
const log = (s) => fs.appendFileSync(R, `${new Date().toISOString()} ${s}\n`);
const git = (args, tak = 60_000) => execFileSync("git", ["-C", YTA, ...args], { encoding: "utf8", timeout: tak });
fs.writeFileSync(R, "COMMITCYKEL START\n");

try {
  log("status före:\n" + git(["status", "--short"]));
} catch (e) {
  log(`status-fel: ${String(e.message).slice(0, 200)}`);
}

const MEDDELANDE = `${YTA}/verktyg/_f2-commit-meddelande.txt`;
fs.writeFileSync(
  MEDDELANDE,
  `studio: ROND 111 [organ:Φ] — F2-ROTKUR: ort-portvakten i kraschvakten + dev-fönstrens F2-svep — prod lämnas ALDRIG av en föräldralös process

ROT (bevisad ur prod-synk.log + pm2-loggen): deploy-omstarten 06:10:41 lokal
 orphanade pm2:s gamla app-träd ("sh -c next start -p 3000" → next-server,
 PPid 1) som behöll port 3000 — pm2 errored i EADDRINUSE-slinga i 27 min
 medan ORTEN svarade 200: prod-synkens HTTPS-kontroll OCH kraschvaktens
 okNu mätte grönt mot fel process, och räddningsbygget hade varit
 verkningslöst (pm2 restart ⇒ EADDRINUSE igen). Manuell kur 06:37 (döda
 ort + pm2 restart) verifierad: port återtagen av pm2-ättling, prod 200,
 PM2 online; mål-502:arna (04:22/04:31Z) försvann, 04:51-deployen helgrön.

KUR 1 — ort-portvakten (kraschvakt.mjs): portägaren på 3000 MÅSTE vara
 ättling till pm2:s ak1a-pid (arAttling via /proc-PPid-kedja), annars
 PORT-RECLAIM: döda ort-trädet (cmdline-verifierat) + pm2 restart —
 billigt, ALDRIG bygg (artefakten orörd). Körs FÖRE kooldown (ort-läget
 är en egen faroklass — 120-min kooldown efter orelaterat bygg får aldrig
 blinda den) och respekterar deploy-låset (vantad-deploy-doktrinen).
 planeraOrtvard är ren beslutstabell, samma mönster som planeraAtguard.

KUR 2 — dev-fönstren (kor-alla-tester.mjs + testa-styrelse.mjs): den
 läckta "next dev -p 3000 -p 3117" (PPid 1, 5 h; npm-run-dev arityade
 package.json:s -p 3000 till dubbla flaggor) är TVÅ fel: portkollision
 OCH tyst mätning mot GAMLAL kod när ett svarande fönster återanvänds.
 F2-svep före start/återanvändning: next-process med ort-rot (PPid 1)
 dödas; levande främling ⇒ ärligt avstått fönster. Spawn nu DIREKT mot
 next-binären med ENKEL -p + loopback; städningen gruppdödar + tar hela
 delträdet (process-trad.mjs — ny delad modul: lasPpid/lasCmdline/
 arAttling/hittaOrtRot/samlaTrad/dodaDeltrad, cmdline-verifiering innan
 varje signal, aldrig in i anroparens eget träd).

BEVIS: testa-kraschvakt.mjs 38/38 PASS (12 nya F2-krav: beslutstabellens
 alla utfall, arAttling-kedjor med falsk PPid-läsare, strukturkontrakt —
 döda-ort-FÖRE-restart, state-FÖRE-åtgärd, ort-vakt-FÖRE-kooldown);
 kraschvakten live-körd mot friska systemet = tyst pass; fem filer
 syntaxgrönska; dev-läckan (pid 3266888/3409315) dödad med pid-verifiering
 (_f2-doda-devort.mjs, port 3117 fri, prod 200 orörd). E2E av
 dev-fönstret väntar på RAM (807 MB < 900-taket) — körs nästa svep.

Medföljer: K7-mötets två protokoll i STYRELSE-BESLUT.md (v214-E2E:n
 03:5x — spärrade arbetsytan-synken sedan 02:41) + F2-bevisfilerna.`,
  "utf8"
);

try {
  git(["add", "verktyg/process-trad.mjs", "verktyg/kraschvakt.mjs", "verktyg/kor-alla-tester.mjs",
       "verktyg/testa-styrelse.mjs", "verktyg/testa-kraschvakt.mjs",
       "verktyg/_f2-kur.mjs", "verktyg/_f2-kur-resultat.txt", "verktyg/_f2-status.mjs",
       "verktyg/_f2-status-resultat.txt", "verktyg/_f2-doda-devort.mjs", "verktyg/_f2-devort-resultat.txt",
       "data/forskning/STYRELSE-BESLUT.md"], 30_000);
  log("add OK");
} catch (e) {
  log(`add-fel: ${String(e.message).slice(0, 300)}`);
}

try {
  const ut = git(["commit", "-F", MEDDELANDE], 600_000);
  log("commit OK: " + ut.split("\n").slice(0, 3).join(" | "));
} catch (e) {
  log(`commit-fel: ${String(e.message).slice(0, 400)}`);
}

try {
  const ut2 = git(["push", "prod", "develop"], 120_000);
  log("push OK: " + ut2.split("\n").slice(-3).join(" | "));
} catch (e) {
  log(`push-fel: ${String(e.message).slice(0, 400)}`);
}

try {
  log("status efter:\n" + git(["status", "--short"]));
  log("HEAD: " + git(["log", "--oneline", "-1"]));
} catch (e) {
  log(`status-efter-fel: ${String(e.message).slice(0, 200)}`);
}
log("COMMITCYKEL SLUT");
