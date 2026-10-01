// _v225-commit.mjs — pump-grindens commit.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
function ko(c, t = 60) { try { return execFileSync('bash', ['-c', c], { encoding: 'utf8', timeout: t * 1000, cwd: '/home/ak1a/agent/ak1' }).trim(); } catch (e) { return 'FEL: ' + String(e.stdout || e.message).split('\n').slice(-4).join('\n'); } }
fs.writeFileSync('/tmp/v225-msg.txt', `studio: [organ:Φ] v225 PUMP-GRINDEN — fabrik×bygg-racen mekaniskt stängda + latent spöklåsbugg kurad + race-loopenbruten (AUTO-PAUS)

LEVERANS (o575:s skärpta plan):
- agentfabrik.mjs: export const deployFonsterOppet() (flock -n-probe, ENOENT
  = fail-open) + GRIND på två punkter (före omgångsloopen + loophuvudet):
  deploy-låset hållet => status "vantar-deploy" + exit 0 — inga nya barn
  startas mitt i byggfönstret. Bevisat HÖGVÄRDET under Utvecklingen:
  BUNTSLAGSRACE #2 05:24:30 (auto-s10-u2:s commit mittemot ombygget) —
  fjärde racet på ett dygn, exakt hålet grinden stänger.
- prod-synk.mjs: lasAktivaFabriksManifest räknar "vantar-deploy" som EJ
  aktiv (inga barn lever i pausläget) => synken bygger DIREKT, fabriken
  återupptar vid :x5 — sekvens utan 30-min-dödläge.
- agentfabrik.mjs IMPORT-VAKT (o43-mönstret): huvud() kördes vid VARJE
  import (bevis: kontraktstestet plockade oavsiktligt v145-manifestet
  05:14:38Z); nu endast som direkt program.
- LATENT BUGG KURAD: pausvägarnas process.exit(0) hoppar över finally =>
  LOCK-katalogen spöke <=35 min medan :x5-ropen avvisades ("annan fabrik
  håller låset") — löftet "nästa rop återupptar" var FALSKT sedan början.
  KUR: exit-hook (renameSync i 'exit') + idempotent finally.

BEVIS: testa-agentfabrik-deploygrind.mjs 7 PASS / 0 FAIL (hermetiskt:
egna tmp-lås, äkta flock-spärr, vantar-deploy-exkludering) · node --check ·
torrkörning direkt program med LOCK.fri-kvitto på disk (inget nytt spöke).

RACE-LOOPENS BRYTARE: AUTO-PAUS satt i prod (runtime-fil med motivering) —
stoppar ENDAST ny auto-generering (s10:s löpande barn slutför i fred);
TAS BORT när denna grind deployats GRÖNT. Worklog v225 + PIPELINE-KO
(rond-tabell) bokförda.`);
console.log(ko('git add verktyg/agentfabrik.mjs verktyg/prod-synk.mjs verktyg/testa-agentfabrik-deploygrind.mjs verktyg/_v225-koll.mjs verktyg/_v225-stada.mjs verktyg/_v225-paus.mjs verktyg/_v224b-commit.mjs worklog.md data/forskning/PIPELINE-KO.md 2>&1 | tail -2'));
console.log(ko('git commit -F /tmp/v225-msg.txt 2>&1 | tail -3', 300));
console.log('\n' + ko('git log --oneline -3'));
console.log('yta: ' + (ko('git status --short | head -3') || '(ren)'));
