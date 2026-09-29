// r331 landa: GRÖN-kvito + v212(c) bokföring + commit + push
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const YTA = '/home/ak1a/agent/ak1';
const sh = (cmd, timeout = 120000) => {
  try { return execSync(cmd, { cwd: YTA, shell: '/bin/bash', encoding: 'utf8', timeout, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim(); }
  catch (e) { return 'FEL: ' + ((e.stdout || '') + (e.stderr || e.message)).split('\n').filter(l => !l.startsWith('hint:') && !l.startsWith(' ')).join(' ').slice(0, 400); }
};

// Slutpush-läge först
const kv = `${YTA}/data/vakten/r330-slutpush-kvito.log`;
const slutpushLäge = fs.existsSync(kv) ? fs.readFileSync(kv, 'utf8').trim().split('\n').pop() : '(inget kvito)';

fs.appendFileSync(`${YTA}/worklog.md`, `
## ROND 331 [organ:Φ] (2026-09-29 ~08:22–08:4x UTC) — VAKTEN GRÖN 0 FYND (07:17-svepets dom) + v212(c) INSTALLATÖRSSKYDDET LEVERERAT

**GRÖN-KVITO:** granssnitt-2026-09-29T074627.json — status ok, 180 kombinationer
(båda teman × mobil/dator), **0 FYND**. Svepet togs av CRON-KANALEN (flockens
innehavare från 07:17:00; pumpor-kanalen blockerad korrekt) — dubblettbeviset
ståndar: den återställda crontaben avfyrar själv OCH mäter grönt. Standby-målet
"vakten till 0 fynd" är kvitterat med färsk rapport.

**v212(c) LEVERERAD — installatörsskyddet (tredje och sista delmålet):**
1. verktyg/crontab-installera.mjs — DEN SANNA VÄGEN att lägga cron-rader:
   append-aldrig-ersätt (befintliga rader, kommentarer och okända rader kopieras
   orörda), backup FÖRE ändring (u5-mönstret mekaniskt), crontab.reference
   uppdateras I SAMMA ANROP (ändringsprotokollet garanterat), idempotens via
   radforms-match (platshållare = joker), verifiering efteråt, --torr-läge;
   test-yta AK1A_CRONTAB_BIN/AK1A_CRONTAB_REF/AK1A_INSTALL_TMP.
2. agentfabrik.mjs barn-prefix: ny ALDRIG-regel — "ALDRIG crontab <fil>/crontab
   -r/direkt crontab-skrivning — nya cron-rader ENDAST via crontab-installera.mjs"
   (våg 162-npm-regelns mönster; massförlustens rot var just ett fabriks-
   installerat desk-skript).
3. crontab.reference-huvudet: INSTALLATÖRSPROTOKOLL-block som pekar på verktyget.
**BEVIS (_r331-test.mjs, hermetiskt):** append-installation (rad + referens +
backup, kommentar och alla äkta rader bevarade) · idempotens (andra körningen
hoppar, raden finns exakt 1 gång) · torrkörning (inget skrivet) · båda filerna
syntax-gröna. (Metodläxa: blockkommentar + cron-schema '*/5' = kommentar-
avslut i förtid — exempelraden skrivs nu generiskt.)

**v212 är därmed HELT levererat:** (a) tyst-larm-kur r329 + (b) auto-läkning +
dubbelkanals-flock r330 + (c) installatörsskydd r331 — massförlust-klassen har
tre oberoende skydd (vakten väcker, vakten läker, installatören kan inte orsaka).

**Slutpush-läge vid bokföring:** ${slutpushLäge}
`);

fs.appendFileSync(`${YTA}/data/forskning/PIPELINE-KO.md`, `

## ROND 331 [organ:Φ] (2026-09-29) — v212(c) LEVERERAD: v212 komplett; vakten GRÖN 0 fynd

| Post | Innehåll | Status |
|---|---|---|
| v212(c) | Installatörsskydd: verktyg/crontab-installera.mjs (append+backup+referens-i-samma-anrop+idempotens+--torr) + fabriksprefix-regel + INSTALLATÖRSPROTOKOLL i crontab.reference | ✓ LEVERERAD r331 — hermetiskt bevisad i _r331-test.mjs |
| v212 | HELA säkringsspåret: (a) tyst-larm r329 + (b) auto-läkning+flock r330 + (c) installatörsskydd r331 | ✓ HELT LEVERERAT — tre oberoende skydd mot massförlust-klassen |
| gränssnittsvakten | 07:17Z-svepets rapport: 180 kombinationer 0 fynd, status ok | ✓ GRÖN — standby-målet "vakten till 0 fynd" kvitterat (granssnitt-2026-09-29T074627.json) |
| v211 | SOFT-404-kuren (r327:s bokning) | NÄSTA i kön |
| v207 | Prefetch-eftermätning (runtime-instrument) | BOKAD |
`);

fs.appendFileSync(`${YTA}/data/forskning/beslutsminne.jsonl`, JSON.stringify({
  ts: new Date().toISOString(), rond: 331,
  beslut: "r331 v212(c) LEVERERAD + v212 HELT: crontab-installera.mjs (append-aldrig-ersätt, backup, referens-i-samma-anrop, idempotens, --torr; hermetiskt bevisad) + fabriksprefixets ALDRIG-crontab-regel + INSTALLATÖRSPROTOKOLL i referenshuvudet. Tre oberoende skydd mot massförlust-klassen: vakten väcker (r329), vakten läker (r330), installatören kan inte orsaka (r331). Gränssnittsvakten GRÖN 0 fynd/180 kombinationer — cron-kanalens eget svep (07:17-flockens innehavare). v211 nästa i kön.",
  landat: "denna commit (crontab-installera.mjs + agentfabrik.mjs prefix + crontab.reference protokoll + worklog r331)"
}) + '\n');

const msg = `studio: [organ:Φ] r331 v212(c) INSTALLATÖRSSKYDDET LEVERERAT — v212 HELT: verktyg/crontab-installera.mjs är DEN SANNA vägen för cron-rader (append-aldrig-ersätt; befintliga rader/kommentarer/okända rader orörda; backup före ändring enligt u5-mönstret; crontab.reference uppdateras I SAMMA ANROP = ändringsprotokollet mekaniskt garanterat; idempotens via radforms-match; verifiering efteråt; --torr; test-yta AK1A_CRONTAB_BIN/REF/INSTALL_TMP) + agentfabrik.mjs barn-prefix nya ALDRIG-regel (ALDRIG crontab <fil>/crontab -r — ENDAST via verktyget; våg 162-npm-regelns mönster; massförlustens rot var ett fabriksbarns desk-skript) + INSTALLATÖRSPROTOKOLL-block i crontab.reference-huvudet; BEVIS (_r331-test.mjs hermetiskt): append+referens+backup med kommentar och alla äkta rader bevarade · idempotens (rad exakt 1 gång, IDEMPOTENT-utdata) · torrkörning skriver inget · syntax båda gröna; metodläxa: '*/5' i blockkommentar avslutar kommentaren — generisk exempelrad; GRÖN-KVITO: granssnitt-2026-09-29T074627.json status ok 180 kombinationer 0 FYND (cron-kanalens eget svep = flockens innehavare från 07:17) — 'vakten till 0 fynd' kvitterat; v212 helhet: (a) väcker r329 + (b) läker+flock r330 + (c) förhindrar r331`;
fs.writeFileSync('/tmp/r331-commitmsg.txt', msg);
const steg = (n, f) => { const ut = sh(f); console.log(`[${ut.startsWith('FEL') ? 'FEL' : 'OK'}] ${n}: ${ut.slice(0, 260)}`); if (ut.startsWith('FEL') && n !== 'push') process.exit(1); return ut; };
steg('git add', 'git add -A');
steg('commit', 'git commit -F /tmp/r331-commitmsg.txt');
let push = steg('push', 'git push prod develop');
if (push.startsWith('FEL')) {
  console.log('push blockerad — slutpushen i bakgrunden tar den (kvito finns)');
}
steg('HEAD', 'git log --oneline -1');
console.log('\nKLAR r331');
