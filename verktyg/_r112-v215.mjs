#!/usr/bin/env node
// ROND 112 — bokföring 2: VÅG 215 bokas i PIPELINE-KO (svepsfynden kom efter
// rondens worklog-rad skrevs) + commit/push-cykel med merge-retry.
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const ROT = "/home/ak1a/agent/ak1";
const KO = `${ROT}/data/forskning/PIPELINE-KO.md`;
const LOGG = `${ROT}/data/vakten/r112-v215.log`;
const linje = (s) => fs.appendFileSync(LOGG, `${new Date().toISOString()} ${s}\n`);
fs.writeFileSync(LOGG, `R112 V215-BOKNING ${new Date().toISOString()}\n`);

const v215 = `
- · VÅG 215 BOKAD (rond 112 [Φ] — fynd ur r112-fullsvepets PROD-NÄRA-klass): (1) TRANSPORTTAKETS TILLVÄXT: testa-tradspermanens RÖD — GET-payload 235,9 kB mot kontraktet < 200 kB (trådens tradHistorik växt ~18 % över taket; kuren = server-side tak/paginering av stream-payloaden, src-yta ⇒ bygge+deploy); (2) S2 MÅLET-rött — ROT-DIAGNOS FÖRST: målhjärtat LEVER (prod hjartslag.log "mål borta men prompt kör — väntar" 07:51 = korrekt väntan mitt i sessionsturn; mal-state.json korrekt persistad i prod 07:30 med stående mål) men sviten såg "aktiv=false och INGEN disk" — misstänkt mätpartsfel (sviten kontrollerar disk där målstate inte lever/synkas — data/vakten/ är gitignorerad och delas ej mellan träd) ELLER äkta API-gap mitt i turn; diagnos före kur, ALDRIG kur på antagande. Bevis: data/vakten/r112-fullsvep.log (PROD-NÄRA-röda) + scenariotest.log 05:55Z + prod-trädets data/vakten/mal-state.json + hjartslag.log.`;

fs.appendFileSync(KO, v215);
linje(`V215 bokad (${v215.length} tkn)`);

const MEDDELANDE = `${ROT}/verktyg/_r112-v215-meddelande.txt`;
fs.writeFileSync(
  MEDDELANDE,
  `studio: ROND 112 bokföring 2 [organ:Φ] — VÅG 215 BOKAD på svepsfynden: tradspayload-takets tillväxt (GET 235,9 kB > kontrakt 200 kB — kuren server-side tak/paginering, src-yta) + S2 MÅLET-rött (rot-diagnos först: målhjärtat lever bevisat, mal-state korrekt i prod — misstänkt mätpartsfel vs API-gap) + rondens node-verktyg (push-väntcykel, beslutsminne, slutverifiering, prodsond) [fabrik]\n`,
);

const git = (args, tak = 900_000) =>
  execFileSync("git", ["-C", ROT, ...args], { encoding: "utf8", timeout: tak });

const FILER = [
  "data/forskning/PIPELINE-KO.md",
  "verktyg/_r112-push-retry.mjs",
  "verktyg/_r112-beslutsminne.mjs",
  "verktyg/_r112-verifiera.mjs",
  "verktyg/_r112-prodstatus.mjs",
  "verktyg/_r112-v215.mjs",
];
linje(`add: ${FILER.join(" ")}`);
git(["add", ...FILER]);
const commitUt = git(["commit", "-F", MEDDELANDE]);
linje(`commit: ${commitUt.split("\n")[0]}`);
try {
  git(["push", "prod", "develop"], 180_000);
  linje("push 1 GRÖN");
} catch {
  linje("push avvisad — fetch+merge+push:");
  git(["fetch", "prod"]);
  const m = git(["merge", "prod/develop", "--no-edit"]);
  linje(`merge: ${m.trim().split("\n")[0]}`);
  git(["push", "prod", "develop"], 180_000);
  linje("push 2 GRÖN");
}
const head = git(["rev-parse", "--short", "HEAD"]).trim();
const prod = git(["rev-parse", "--short", "prod/develop"]).trim();
linje(`HEAD=${head} prod=${prod} SAMMA=${head === prod}`);
console.log(`V215 bokad + pushad HEAD=${head}`);
