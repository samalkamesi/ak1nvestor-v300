// _v223b-commit.mjs — förfiningens commit (o575-tillägg + pipeline + worklog).
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
function ko(c, t = 60) { try { return execFileSync('bash', ['-c', c], { encoding: 'utf8', timeout: t * 1000, cwd: '/home/ak1a/agent/ak1' }).trim(); } catch (e) { return 'FEL: ' + String(e.stdout || e.message).split('\n').slice(-4).join('\n'); } }
fs.writeFileSync('/tmp/v223b-msg.txt', `studio: [organ:Φ] v223 fortsättning — o575 förfinat (R delvis redundant, PUMP-GRINDEN skärpt) + långpollaren stoppad i race-förebyggande

- DJUPLÄSNING av prod-synk.mjs (V235-blocket) + agentfabrik.mjs (omgångs-
  loopen): (1) väntespärren .synk-fabriksvant återarmar sig mekaniskt efter
  en buntslags-abort när fabriken är aktiv — R-lösningen som skriven är
  delvis redundant; (2) kvällens exakta race (s8-u2:s barn startade FÖRE
  det hungriga bygget) kan ingen grind stoppa — barnens 25-min-tak binder;
  (3) äkta kvarvarande hål = PUMPSIDAN: fabriken kan föda NYA omgångar mitt
  i ett byggfönster (RAM-vakten mäter minne, aldrig fönstret).
- v224 OMFORMULERAD i PIPELINE-KO + o575-tillägg: PUMP-GRIND i agentfabrik.mjs
  (flock -n-test på /tmp/ak1a-deploy.lock före ny omgång + manifest-plock;
  UPPTAGET ⇒ status vantar-deploy + exit 0, nästa :x5-rop återupptar;
  ~30-min överlappsfördröjning accepterad enligt V235-filosofin) — körs i
  tystt fönster med torrkörning, aldrig midnattskirurgi på levande maskineri.
- LÅNGPOLLAREN STOPPAD 04:28 (TaskStop): ytan renade medan ombygget höll
  låset — push hade orsakat nästa buntslagsrace. Ny ordning: passiv
  byggbevakare (_v223-byggbevakare.mjs) väntar deploy-verdiket; merge+push
  därefter för hand. Bevis: pollarloggen (merge-försök 04:27:38, push
  misslyckades, "fortsätter" — dödad före nästa 2-min-försök).`);
console.log(ko('git add data/forskning/OPTIMERING/o575-buntslagsrace-analys.md data/forskning/PIPELINE-KO.md worklog.md verktyg/_v223-tradkoll.mjs verktyg/_v223-byggbevakare.mjs verktyg/_v223-commit.mjs 2>&1 | tail -2'));
console.log(ko('git commit -F /tmp/v223b-msg.txt 2>&1 | tail -3', 300));
console.log('\n' + ko('git log --oneline -2'));
console.log('yta: ' + (ko('git status --short | head -3') || '(ren)'));
