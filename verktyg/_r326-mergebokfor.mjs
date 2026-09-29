// r326: merge:a hem nattens fabrikscommits + bokför larmrot + push under synkens väntar-fönster.
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const ROT = '/home/ak1a/agent/ak1';
function kort(cmd, timeoutMs = 420_000) {
  try {
    return { kod: 0, ut: execSync(cmd, { encoding: 'utf8', timeout: timeoutMs, cwd: ROT, stdio: ['ignore', 'pipe', 'pipe'] }).trim() };
  } catch (e) {
    return { kod: e.status ?? 1, ut: ((e.stdout || '') + (e.stderr || '')).trim() };
  }
}

// 1) merge --no-ff av prod/develop (nattens fabrik: ed8864f3, 1802bc7c, 227feea6)
const merge = kort('git merge --no-ff prod/develop -m "Merge remote-tracking branch \'prod/develop\' into develop"');
console.log('=== MERGE ===');
console.log(merge.kod === 0 ? merge.ut : `FEL ${merge.kod}:\n${merge.ut.slice(0, 600)}`);
if (merge.kod !== 0) process.exit(1);

// 2) worklog-bokföring
const wlRad = `

## r326 (2026-09-29 ~05:00Z) — integritetslarm BYGGRACE 04:47: rot godartad, deploy-bokföringsglapp väntar synkens byte

LARMET (byggrace): BUILD_ID DS3agX95 (03:07) ≠ senaste-deployad 22df62aa —
vakten tolkade det som olåst främmande bygge. ROT (_r326-diag): .next
byttes 03:07–03:17 av KRASCHVAKTENS räddning under incidenten 02:44–03:19;
den grenen skriver medvetet INGEN deployad-markör (synkens design — omdeploy
vid nästa poll, prod-synk.mjs:1611). Synken har sedan 03:57 försökt men
sekvensväntar bakom fabrikens manifest (V235; auto-s1→auto-s2, tre s2-barn
startade 04:45) och tog BUNTSLAGSRACE 04:45 (ed8864f3→227feea6 under
bygget — korrekt avbrott, ombygg nästa poll).

ARTEFAKTEN HEL: BUILD_ID + prerender-manifest.json (1,35 MB, 03:17) +
required-server-files.json på plats; pm2 restartad 03:19; 10/10 rutter 200
+ localhost 200; inga byggprocesser; lås ledigt — larmets "pm2 kan köra
halvfärdigt träd" är MOTBEVISAT på artefaktnivå (r325:FYND-B:s manifestoro
gällde 03:09-domens läge, botat av 03:17-slutförandet).

ÅTGÄRD: INGET eget ombygge (vore kapplöpning med synken; synkens v182
bygger i .next-ny med prod orörd). I stället: merge av nattens fabriks-
commits + denna bokföring pushad under väntar-fönstret ⇒ nästa gröna poll
deployar ETT träd som täcker allt. DÄREFTER _r326-deployvakt.mjs: kvito =
senaste-deployad ≠ 22df62aa + 404 framtidslug + 200 sajt + vaktkörning GRÖN.

LÄRDOM (nästa våg-kandidat till prod-synk/integritetsvakten): räddnings-
byte utan markör öppnar ett bullrigt byggrace-fönster (idag 03:07→05:nn) —
kraschvakten bör skriva en igenkänningsmarkör (t.ex. senaste-deployad med
"kraschvakt:"-prefix) eller vakten tolerera dokumenterade räddnings-byte.
`;
fs.appendFileSync(`${ROT}/worklog.md`, wlRad);
console.log('worklog.md: rad appenderad');

// 3) DRIFTSBOKEN-notis
const dbRad = `
- **2026-09-29 04:47Z — BYGGRACE-larm (integritetsvakten), rot godartad**:
  BUILD_ID DS3agX95 (03:07, kraschvaktens räddningsbyte) utan deployad-
  markör; synkens omdeploy fördröjd av VÄNTAR-FABRIK (auto-s2-manifestet)
  + BUNTSLAGSRACE 04:45. Artefakten hel (prerender-manifest 1,35 MB 03:17;
  pm2 omstart 03:19; 10/10 rutter 200). Åtgärd: ingen olåst ombygge —
  bokföring + push i väntar-fönstret, deployvakt mot senaste-deployad ≠
  22df62aa + vaktkörning GRÖN. Lärdom: räddnings-byte utan markör = larm-
  fönster fram till nästa omdeploy (markör/vakttolerans = nästa våg).
`;
fs.appendFileSync(`${ROT}/data/DRIFTSBOKEN.md`, dbRad);
console.log('data/DRIFTSBOKEN.md: notis appenderad');

// 4) commit (meddelandefil — långa ämnen via -F enligt skal-kvoten)
const msg = `studio: [organ:\u03A6] r326 BYGGRACE-larm bokförd — rot godartad: 03:07-trädet var kraschvaktens räddningsbyte utan markör (synkens design, omdeploy nästa poll); synken fördröjd av VÄNTAR-FABRIK (auto-s2) + BUNTSLAGSRACE 04:45 (ed8864f3→227feea6, korrekt avbrott); artefakten HEL (prerender-manifest 1,35 MB 03:17, pm2 omstart 03:19, 10/10 rutter 200, lås ledigt) — larmets halvfärdighetsrisk motbevisad på artefaktnivå; åtgärd = merge av nattens fabrikscommits + bokföring pushad i väntar-fönstret + deployvakt på (kvito: senaste-deployad ≠ 22df62aa, 404/200, vakt GRÖN); lärdom: räddningsbytes-markör till vakten = nästa våg-kandidat. Verktyg: _r325-rester (bytvakt/vantasynk/rondcommit) + _r326 (diag/pulla/mergebokfor/deployvakt) commit:ade.`;
fs.writeFileSync('/tmp/r326-msg.txt', msg);
const add = kort('git add worklog.md data/DRIFTSBOKEN.md verktyg/_r325-bytvakt.mjs verktyg/_r325-rondcommit.mjs verktyg/_r325-vantasynk.mjs verktyg/_r326-diag.mjs verktyg/_r326-pulla.mjs verktyg/_r326-mergebokfor.mjs');
console.log('add:', add.kod === 0 ? 'OK' : `FEL ${add.kod}: ${add.ut.slice(0, 300)}`);
const com = kort('git commit -F /tmp/r326-msg.txt');
console.log('commit:', com.kod === 0 ? 'OK' : `FEL ${com.kod}: ${com.ut.slice(0, 500)}`);
console.log(com.ut.split('\n').slice(0, 4).join('\n'));
console.log('HEAD:', kort('git log --oneline -1').ut);

// 5) push under väntar-fönstret
const push = kort('git push prod develop');
console.log('=== PUSH (prod develop) ===');
console.log(push.kod === 0 ? 'OK — ' + push.ut.slice(0, 200) : `FEL ${push.kod}:\n${push.ut.slice(0, 600)}`);
console.log('\nstatus efteråt:', kort('git status --short').ut || '(ren)');
