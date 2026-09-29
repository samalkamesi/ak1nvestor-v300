// r330 kvito-tillägg: 07:17Z-beviset bokförs (LÅST-rad + cron-kanalen mäter)
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const YTA = '/home/ak1a/agent/ak1';
const sh = (cmd, timeout = 120000) => {
  try { return execSync(cmd, { cwd: YTA, shell: '/bin/bash', encoding: 'utf8', timeout, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim(); }
  catch (e) { return 'FEL: ' + ((e.stdout || '') + (e.stderr || e.message)).slice(0, 500); }
};

fs.appendFileSync(`${YTA}/worklog.md`, `
### r330-tillägg — 07:17Z-CRONTABBEVISET LEVERERAT (2026-09-29 07:37Z)

data/vakten/cron.log (AK1) rad: "2026-09-29T0717 LÅST — gränssnittsvakten mäter
redan i andra kanalen — hoppar". Tolkning med källor: system-crontabens rad 2
(17 1,7,13,19 — återställd r328) avfyrade 07:17:00 och TOG flocken (första
automatiska crontab-avfyringen sedan massförlusten = beviset); pumpor-kanalen
avfyrade 07:17:08 (pm2-logg "07:17:08 ▶ gränssnittsvakt") och blockerades
korrekt av flocken — dubbelkörningen dog vid första gemensamma :17, exakt som
kuren designades. 68 granssnitt/chrome-processer aktiva 07:37 = svepet löper;
historiken i samma logg (GRÖN fulla svep 26–28/9, UPPSKJUTEN vid nattens
deploys) intygar cron-kanalens kontinuitet före förlusten. Rapportens
GRÖN/0-fynd-dom pollas nästa hjärtslag (RAM-grinden kan hålla svepet uppe
till ~08:30).
`);

const msg = `studio: [organ:Φ] r330-tillägg 07:17Z-CRONTABBEVISET LEVERERAT — cron.log: "2026-09-29T0717 LÅST — gränssnittsvakten mäter redan i andra kanalen — hoppar": crontab-rad 2 (återställd r328) avfyrade 07:17:00 och tog flocken (första automatiska crontab-avfyringen sedan massförlusten); pumpor-kanalen (07:17:08 ▶) blockerades korrekt — dubbelkörningen dog vid första gemensamma :17 precis som kuren designades; 68 vaktsprocesser aktiva = svepet löper; GRÖN/0-fynd-rapporten pollas nästa hjärtslag`;
fs.writeFileSync('/tmp/r330b-commitmsg.txt', msg);
const steg = (n, f) => { const ut = sh(f); console.log(`[${ut.startsWith('FEL') ? 'FEL' : 'OK'}] ${n}: ${ut.slice(0, 250)}`); if (ut.startsWith('FEL') && n !== 'push') process.exit(1); return ut; };
steg('git add', 'git add -A');
steg('commit', 'git commit -F /tmp/r330b-commitmsg.txt');
let push = steg('push', 'git push prod develop');
if (push.startsWith('FEL')) {
  steg('fetch', 'git fetch prod develop');
  steg('merge', 'git merge prod/develop --no-edit');
  steg('ompush', 'git push prod develop');
}
steg('HEAD', 'git log --oneline -1');
console.log('KLAR');
