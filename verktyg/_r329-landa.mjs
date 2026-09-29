// r329 landa: bokför (worklog + PIPELINE + beslutsminne) → commit [organ:Φ] → push → vänta :x9-driftbevis
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const YTA = '/home/ak1a/agent/ak1';
const sh = (cmd, timeout = 120000) => {
  try { return execSync(cmd, { cwd: YTA, shell: '/bin/bash', encoding: 'utf8', timeout, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim(); }
  catch (e) { return 'FEL: ' + ((e.stdout || '') + (e.stderr || e.message)).slice(0, 400); }
};

// ── Worklog ──
fs.appendFileSync(`${YTA}/worklog.md`, `
## ROND 329 [organ:Φ] (2026-09-29 ~06:45–06:55 UTC) — v212(a) TYST-LARM-KUREN LEVERERAD OCH BEVISAD

**LEVERANS:** verktyg/konfigintegritet-vakt.mjs kuras — klassad exit + sessionnotis.
Nattens läxa (9 SAKNADE-larm med exit 0, journal utan konsument, sovande session genom
DR-kedjans död) är mekaniskt stängd: SAKNAD crontab-rad / crontab-verifiering omöjlig ⇒
**exit 1** (syns i pumpor-loggens "slut kod="-rad; pumpor-hundvakten kan bevaka den) +
**EN sessionnotis** till /api/studio/stream (automation-motorns kanal: x-admin-password
ur .env-production.local, samma hygien — värdet loggas ALDRIG), deduperad per unik
larmbild + max en påminnelse/timme (statusfil konfig-notis-senaste.json). pm2-larm
förblir exit 0 (pulsvaktens bord). Test-yta: AK1A_CRONTAB_REF / AK1A_LARM_DIR /
AK1A_KONFIG_NOTIS=av — vakten testas ALDRIG mot äkta crontab.

**BEVIS (verktyg/_r329-test.mjs):** syntax OK · GRÖN-vägen: crontab 11/11 + pm2 4/4 ⇒
exit 0 (första 11/11-kvittot — r328:s desk-referensrader i full synk) · RÖD-vägen
(testreferens + rad som aldrig finns): SAKNAD-rad larmas, notis BLOCKERAD-rad loggas,
**exit 1**. Pumpor-säkerhet: kör() loggar endast exit-koder — exit 1 startar inga
omstarter (bevisat i daemonkällan).

**STYRELSE-BOKNING (07:43Z-ronden beslutar):** AGENTS.md:s serverrad är inaktuell —
prod är SSD Nodes 208.87.129.108 sedan v190-cutovern (r282), AGENTS.md skriver fortfarande
Contabo 5.189.162.162. Teknisk faktakorrigering (ej R2) men dokumentet är sannings-
hierarkins topp — styrelsen beslutar uppdateringens formulering och tidpunkt.

**PÅGÅENDE BELOPP:** 07:17Z-gränssnittsvaktskörningen = första automatiska beviset på
den återställda crontaben (pollas nästa rond; bi-notis: gränssnittsvakten har dubbla
kanaler — crontab-rad 2 + pumpor-rop min==17 tim%6==1 — dubbelkörningen utreds vid
v212(b)). Driftbevis för nya vakten: första :x9 efter push (kompilerad för 06:59Z).
`);

// ── PIPELINE ──
fs.appendFileSync(`${YTA}/data/forskning/PIPELINE-KO.md`, `

## ROND 329 [organ:Φ] (2026-09-29) — v212(a) tyst-larm-kur LEVERERAD; (b)(c) kvar; AGENTS.md-rad bordlagd till 07:43Z-ronden

| Post | Innehåll | Status |
|---|---|---|
| v212(a) | Tyst-larm-kur: SAKNADE crontab-rad ⇒ exit 1 + sessionnotis (dedup 1/h, automation-kanal) | ✓ LEVERERAD r329 — konfigintegritet-vakt.mjs klassad exit + skickaSessionnotis; testad båda vägarna (GRÖN 11/11 exit 0 · RÖD exit 1, _r329-test.mjs); driftbevis: första :x9 efter push |
| v212(b) | Auto-applicering: automation-motor beslut 6 ⇒ applicera crontab.reference vid drift (massförlust självläker) + utred dubbelkanal-gränssnittsvakten (crontab-rad 2 + pumpor-rop) | BOKAD |
| v212(c) | Installatörsskydd: crontab-skrivarverktyg med append-aldrig-ersätt + referens-i-samma-ändning mekaniskt | BOKAD |
| v212(d) | AGENTS.md:s serverrad: Contabo → SSD Nodes 208.87.129.108 (v190/r282) — teknisk korrigering, styrelsen beslutar | BORDLAGD 07:43Z-ronden |
`);

// ── Beslutsminne ──
fs.appendFileSync(`${YTA}/data/forskning/beslutsminne.jsonl`, JSON.stringify({
  ts: new Date().toISOString(), rond: 329,
  beslut: "r329 v212(a) tyst-larm-kur LEVERERAD: konfigintegritetsvakten klassad exit (SAKNAD crontab-rad/verifiering omöjlig ⇒ exit 1) + sessionnotis till /api/studio/stream (automation-kanal, dedup 1/h) — nattens 9-larm-tystnad mekaniskt omöjliggjord; testad GRÖN 11/11 exit 0 + RÖD exit 1. AGENTS.md-serverraden (SSD Nodes) bordlagd till 07:43Z-styrelseronden. v212(b)(c) + 07:17Z-crontab-bevis + v211 + v207 kvar i kön.",
  landat: "denna commit (konfigintegritet-vakt.mjs + worklog r329 + PIPELINE v212-uppdatering)"
}) + '\n');

// ── Commit + push ──
const msg = `studio: [organ:Φ] r329 v212(a) TYST-LARM-KUREN LEVERERAD — konfigintegritetsvakten: klassad exit (SAKNAD crontab-rad ⇒ exit 1, syns i pumpor-loggen; pm2-larm förblir 0 = pulsvaktens bord) + EN sessionnotis till /api/studio/stream vid kritisk klass (automation-motorns kanal och nyckelhygien, dedup per larmbild + max 1 påminnelse/timme via konfig-notis-senaste.json) — nattens läxa (9 larm med exit 0, journal utan konsument, DR-kedjan dog tyst i 6 h) mekaniskt stängd; test-yta AK1A_CRONTAB_REF/AK1A_LARM_DIR/AK1A_KONFIG_NOTIS=av; BEVIS (_r329-test.mjs): syntax OK · GRÖN 11/11 + 4/4 pm2 ⇒ exit 0 (första 11/11-kvittot) · RÖD (testreferensrad) ⇒ SAKNAD-larm + BLOCKERAD-notis + exit 1; pumpor-säkerhet: kör() loggar endast koder — inga omstarter; BOKNING: AGENTS.md-serverraden (Contabo→SSD Nodes 208.87.129.108, v190/r282) bordlagd till 07:43Z-styrelseronden; 07:17Z-gränssnittsvaktskörningen pollas som första automatiska crontab-bevis + dubbelkanal-utredning till v212(b)`;
fs.writeFileSync('/tmp/r329-commitmsg.txt', msg);
const steg = (n, f) => { const ut = sh(f); console.log(`[${ut.startsWith('FEL') ? 'FEL' : 'OK'}] ${n}: ${ut.slice(0, 300)}`); if (ut.startsWith('FEL')) process.exit(1); };
steg('git add', 'git add -A');
steg('commit', 'git commit -F /tmp/r329-commitmsg.txt');
steg('push', 'git push prod develop');
steg('HEAD', 'git log --oneline -1');

// ── Vänta in första :x9-driftbeviset i AK1 (nya vakten) — max 11 min ──
console.log('\n=== VÄNTAR :x9-DRIFTBEVIS (max 11 min) ===');
const deadline = Date.now() + 11 * 60 * 1000;
while (Date.now() < deadline) {
  await new Promise(r => setTimeout(r, 45000));
  const loggrad = sh("tail -40 /home/ak1a/.pm2/logs/ak1a-pumpor-out.log | grep -E 'konfigintegritet' | tail -3");
  const nu = new Date().toISOString().slice(11, 16);
  console.log(`${nu}: ${loggrad.replace(/\n/g, ' ⏎ ') || '(ännu ingen ny körning)'}`);
  if (/konfigintegritet-vakt\.mjs slut kod=/.test(loggrad) && !/kod=0/.test(loggrad.split('slut kod=')[1] || '0')) break;
  if (/slut kod=/.test(loggrad)) {
    // kod 0 = GRÖN-vägen (crontab hel) — också ett giltigt driftbevis på nya vakten
    const gron = sh("tail -60 /home/ak1a/.pm2/logs/ak1a-pumpor-out.log | grep -c '11/11' || true");
    if (parseInt(gron) > 0) { console.log('DRIFTBEVIS: nya vakten kör GRÖN 11/11 i AK1'); break; }
    break;
  }
}
console.log('\nKLAR r329');
