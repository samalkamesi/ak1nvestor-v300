// r330 landa: bokför + commit + push (merge vid reject) — poll sker separat
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const YTA = '/home/ak1a/agent/ak1';
const sh = (cmd, timeout = 120000) => {
  try { return execSync(cmd, { cwd: YTA, shell: '/bin/bash', encoding: 'utf8', timeout, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim(); }
  catch (e) { return 'FEL: ' + ((e.stdout || '') + (e.stderr || e.message)).slice(0, 500); }
};

fs.appendFileSync(`${YTA}/worklog.md`, `
## ROND 330 [organ:Φ] (2026-09-29 ~07:03–07:1x UTC) — v212(b) LEVERERAD: AUTO-LÄKNING + DUBBELKANALS-FLOCK, allt hermetiskt bevisat

**LEVERANS 1 — AUTO-LÄKNING (konfigintegritetsvakten):** En crontab-massförlust
selvläker nu inom ett :x9. Principer: APPEND-ONLY (saknade referensrader fylls i
sist; befintliga rader, kommentarer och okända extra rader röras aldrig — r328-
mönstret mekaniserat), maskade rader (<PLATSHÅLLARE>) läks ENDAST med värde belagt
i serverns egna snapshots (u5-backup/offsite-konfig; repot bär aldrig värdet),
tak en läkning per unik bild/timme, okänd verklighet (crontab -l fel) läks aldrig.
Dom byggs ur läget EFTER läkning: full läkning ⇒ exit 0 + egen AUTO-LÄKT-
sessionnotis; oläkta rester ⇒ exit 1 + kritisk notis. Test-yta utökad:
AK1A_CRONTAB_BIN (emulator).

**LEVERANS 2 — DUBBELKANALS-FLOCK (granssnittsvakt-cron.sh):** Utredningen
belade att båda kanalerna (crontab-rad 17 1,7,13,19 → sh-direkt + pumpor-rop
min==17 tim%6==1 → vakt-cron.mjs → SAMMA sh) kör utan ömsesidig exkludering —
dubbla Chrome-svep vid varje :17. Kuren: flock -n /tmp/ak1a-granssnittsvakt.lock
tidigt i sh:et — sist kommande kanal hoppar tyst med LÅST-loggrad. Redundansen
behålls (natten bevisade daemon-kanalens värde när crontab dog); dubbelkörningen
förbjuds.

**BEVIS (verktyg/_r330-test.mjs, allt hermetiskt):** partiell läkning (omaskerad
läks + maskerad utan belagt värde lämnas ⇒ exit 1, notis blockerad i testläge) ·
full läkning ⇒ exit 0 · emulator-crontaben: TESTRAD inlagd, maskerad rad EJ
inlagd, inplanterad kommentar bevarad · journalrad konfig-autolakning · GRÖN-
regression 11/11 exit 0 utan läkning · flock: taget lås ⇒ LÅST-rad + exit 0 på
sekunder. (Metodnotis: första testomgångens "kommentarer bevarade: false" var
en felbyggd assertion — äkta crontab saknar kommentarer sedan r328; koden
bevarar rådata, bevisat med inplanterad kommentar.)

**PÅGÅENDE:** 07:17Z-gränssnittsvaktskörningen pollas som första automatiska
crontab-bevis (resultat bokförs i nästa rond eller tilläggscommit).
`);

fs.appendFileSync(`${YTA}/data/forskning/PIPELINE-KO.md`, `

## ROND 330 [organ:Φ] (2026-09-29) — v212(b) LEVERERAD: auto-läkning + dubbelkanals-flock

| Post | Innehåll | Status |
|---|---|---|
| v212(b) | Auto-applicering: SAKNADE crontab-rader läks append-only ur crontab.reference inom ett :x9 (maskade endast med belagt snapshot-värde; tak 1/bild/h; full läkning ⇒ exit 0 + AUTO-LÄKT-notis) + dubbelkanals-utredning klar: flock i granssnittsvakt-cron.sh (cron-kanal + pumpor-kanal delar sh; sist kommande hoppar tyst) | ✓ LEVERERAD r330 — hermetiskt bevisad i _r330-test.mjs (partiell/full läkning, emulator-crontab, flock, GRÖN-regression 11/11) |
| v212(c) | Installatörsskydd: crontab-skrivarverktyg med append-aldrig-ersätt mekaniskt | BOKAD (nästa rond-kandidat) |
| v212(d) | AGENTS.md:s serverrad (SSD Nodes) — styrelseronden 07:43Z beslutar | BORDLAGD |
`);

fs.appendFileSync(`${YTA}/data/forskning/beslutsminne.jsonl`, JSON.stringify({
  ts: new Date().toISOString(), rond: 330,
  beslut: "r330 v212(b) LEVERERAD: auto-läkning i konfigintegritetsvakten (append-only ur crontab.reference, maskade rader endast med snapshot-belagt värde, tak 1/bild/h, full läkning ⇒ exit 0 + AUTO-LÄKT-notis, rester ⇒ exit 1) + flock i granssnittsvakt-cron.sh (dubbelkanalen cron+pumpor delar sh — sist kommande hoppar tyst, redundans bevarad). Hermetiskt bevisat i _r330-test.mjs. 07:17Z-gränssnittsvaktskörningen pollas som första automatiska crontab-bevis.",
  landat: "denna commit (konfigintegritet-vakt.mjs + granssnittsvakt-cron.sh + worklog r330 + PIPELINE)"
}) + '\n');

const msg = `studio: [organ:Φ] r330 v212(b) AUTO-LÄKNING + DUBBELKANALS-FLOCK LEVERERADE — konfigintegritetsvakten: crontab-massförlust självläker inom ett :x9 (append-only ur crontab.reference; maskade rader endast med värde belagt i serverns egna snapshots — u5-backup/offsite; tak en läkning per unik bild/timme; okänd verklighet läks aldrig; full läkning ⇒ exit 0 + egen AUTO-LÄKT-sessionnotis, oläkta rester ⇒ exit 1) med dom ur läget EFTER läkning; gränssnittsvakt-cron.sh: flock -n /tmp/ak1a-granssnittsvakt.lock — utredningen beläg att crontab-kanalen (17 1,7,13,19 → sh direkt) och pumpor-kanalen (min==17 tim%6==1 → vakt-cron.mjs → samma sh) körde dubbla Chrome-svep varje :17 utan exkludering; flocken förbjuder dubbelkörning men bevarar redundansen (nattens crontab-död bevisade daemon-kanalens värde); BEVIS (_r330-test.mjs, hermetiskt via AK1A_CRONTAB_BIN-emulator): partiell läkning exit 1 (omaskerad läks, maskerad lämnas, notis blockerad) · full läkning exit 0 · TESTRAD inlagd + maskerad EJ inlagd + kommentar bevarad i emulator-crontaben · journalrad konfig-autolakning · GRÖN-regression 11/11 exit 0 utan läkning · flock: taget lås ⇒ LÅST-loggrad + exit 0 på sekunder; metodnotis: omgång 1:s kommentar-fel var felbyggd assertion (äkta crontab saknar kommentarer sedan r328) — koden bevarar rådata, ombevisat med inplanterad kommentar; 07:17Z-gränssnittsvaktskörningen pollas som första automatiska crontab-bevis`;
fs.writeFileSync('/tmp/r330-commitmsg.txt', msg);
const steg = (n, f) => { const ut = sh(f); console.log(`[${ut.startsWith('FEL') ? 'FEL' : 'OK'}] ${n}: ${ut.slice(0, 280)}`); if (ut.startsWith('FEL') && n !== 'push') process.exit(1); return ut; };
steg('git add', 'git add -A');
steg('commit', 'git commit -F /tmp/r330-commitmsg.txt');
let push = steg('push', 'git push prod develop');
if (push.startsWith('FEL')) {
  steg('fetch', 'git fetch prod develop');
  steg('merge', 'git merge prod/develop --no-edit');
  steg('ompush', 'git push prod develop');
}
steg('HEAD', 'git log --oneline -1');
console.log('\nKLAR r330-landa');
