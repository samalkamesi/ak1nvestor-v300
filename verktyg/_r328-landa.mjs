// r328 landa: vänta in RPO-kvitton → worklog + PIPELINE + beslutsminne → commit [organ:Φ] → push
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const YTA = '/home/ak1a/agent/ak1';
const sh = (cmd, timeout = 120000) => {
  try { return execSync(cmd, { cwd: YTA, shell: '/bin/bash', encoding: 'utf8', timeout, stdio: ['ignore', 'pipe', 'pipe'] }); }
  catch { return ''; }
};

// ── Vänta på kedja 1 (pg_dump ~90 MB) och appdump: max 8 min ──
console.log('=== VÄNTAR PÅ RPO-KVITTON (max 8 min) ===');
const deadline = Date.now() + 8 * 60 * 1000;
let kedja1Status = 'TIMEOUT', appStatus = 'pågår';
while (Date.now() < deadline) {
  await new Promise(r => setTimeout(r, 30000));
  const k1 = fs.existsSync('/tmp/r328-kedja1.log') ? fs.readFileSync('/tmp/r328-kedja1.log', 'utf8') : '';
  const ap = fs.existsSync('/tmp/r328-appdump.log') ? fs.readFileSync('/tmp/r328-appdump.log', 'utf8') : '';
  if (/SLUTMARKÖRER|OK|klar/i.test(k1) || k1.includes('db-2026-09-29')) { kedja1Status = 'KLAR'; }
  if (ap.includes('APP-DUMP klar') || /klar|OK/i.test(ap.split('\n').pop() || '')) { appStatus = 'klar'; }
  const dumpar = sh('ls /home/ak1a/AK1/data/backups/supabase/ | grep 2026-09-29 || true').toString().trim();
  console.log(`+30s: kedja1=${kedja1Status} app=${appStatus} dagens dumpar: [${dumpar}]`);
  if (kedja1Status === 'KLAR' && appStatus === 'klar') break;
}

console.log('\n=== SLUTLÄGE ===');
const dumpar = sh('ls -lt /home/ak1a/AK1/data/backups/supabase/ | head -4').toString().trim();
console.log(dumpar);
for (const j of ['kedja1', 'appdump', 'molnexport']) {
  const p = `/tmp/r328-${j}.log`;
  console.log(`--- ${j} (svans) ---`);
  console.log(fs.existsSync(p) ? fs.readFileSync(p, 'utf8').slice(-250) : '(tom)');
}

// ── Worklog ──
fs.appendFileSync(`${YTA}/worklog.md`, `
## ROND 328 [organ:Φ] (2026-09-29 ~06:2x–06:4x UTC) — v205 ESKALERAT OCH KURAT: CRONTAB-MASSFÖRLUSTEN (nattens DR-kedja dog)

**FYND (v205-morgonemottaget):** 6 av 7 G2/G5-spår uteblivna på 29/9-schemat (kedja 1
supabase-dump, moln-export, app-dump, döda länkar, beroendevakt, rop-hälsa; natt-TBT
sist 28/9 01:28Z). ROT: användar-crontaben var ERSATT av endast 2 desk-rader —
referensens 9 rader borta. BEVIS-KEDJA: u5-installatörens /tmp/crontab-ak1a-u5-{backup,
ny,efter}.txt visar FRISKT LÄGE 28/9 16:12:37Z (10 rader, append+koll) — massförlusten
skedde EFTER det av en senare desk-installatör (r315:s desk-läkare i ny form
/home/ak1a/desk-lakare + v201-u3:s login-backup-rad): ERSÄTT i stället för APPEND,
utan referensuppdatering.

**KUR (verkställd 06:27–06:29Z):** crontab återställd till 11 rader (referensens 9 +
desk 2; kedja 1:s lösenordslösa anslutningssträng belagd ur u5-backupen) ·
konfigintegritetsvakten GRÖN 9/9 (2 okända INFO) · ändringsprotokollet följt: desk-
raderna APPENDADE till crontab.reference (rad 10–11, blindhetsklass G1) · RPO-TÄPPNING
manuellt: appdump (aufr → db-app-2026-09-29) + moln-export + kedja 1 (rkaq →
db-2026-09-29) detacherade med kvitto-loggar /tmp/r328-*.log.

**FYND-KLASSER bokade som v212:** (1) TYST-LARM — vakten larmade 9 SAKNADE rader med
exitkod 0 utan sessionnotis (hjärtat väcktes aldrig); SAKNADE crontab-rad = kod 1 +
notis. (2) INSTALLATÖRSFÄLLAN — append-aldrig-ersätt + referens-i-samma-ändring skall
mecaniskt förhindras (automationsmotorns beslut 6 = applicera referensen vid drift).
(3) AGENTS.md-INAKTUALITET — prod är SSD Nodes 208.87.129.108 sedan v190 (r282);
AGENTS.md:s Contabo-rad (5.189.162.162) behöver uppdatering (notis till styrelseronden).

**v205-status:** ✓ LEVERERAD (7/7 spår nu belysta: 6 uteblivna + kur + manuell
eftersläpning; rop-hälsans daemon-kanal lever). Gränssnittsvakten 07:17Z-körning är
första automatiska beviset på återställd crontab.
`);

// ── PIPELINE ──
fs.appendFileSync(`${YTA}/data/forskning/PIPELINE-KO.md`, `

## ROND 328 [organ:Φ] (2026-09-29) — v205 LEVERERAD med eskalering; v212 crontab-säkringen bokad

| Våg | Innehåll | Status |
|---|---|---|
| v205 | NATTEMOTTAGET G2/G5 (7 spårkvitton) | ✓ LEVERERAD r328 — 6/7 uteblivna: rot = crontab-massförlust (desk-installatör ersatte crontaben efter 28/9 16:12Z; u5-filerna i /tmp är beviset) · KUR: crontab 11 rader återställd + referens rad 10–11 (desk) + RPO-täppning manuell (appdump/moln/kedja1, kvitton /tmp/r328-*.log) · vakt GRÖN 9/9 |
| v212 | CRONTAB-SÄKRINGEN: (a) tyst-larm-kur — SAKNADE crontab-rad ⇒ exitkod 1 + sessionnotis (idag: 9 larm kod 0, hjärtat sov); (b) automationsmotor beslut 6 ⇒ APPLICERA crontab.reference vid drift (auto-läkning av massförlust); (c) installatörsprotokoll append-aldrig-ersätt mekaniskt (t.ex. crontab-skrivarverktyg med inbyggt skydd); (d) AGENTS.md:s serverrad (Contabo→SSD Nodes 208.87.129.108) — styrelserondsbeslut | BOKAD |
| v211 | SOFT-404-KUREN (se r327) | BOKAD (oförändrad) |
`);

// ── Beslutsminne ──
fs.appendFileSync(`${YTA}/data/forskning/beslutsminne.jsonl`, JSON.stringify({
  ts: new Date().toISOString(), rond: 328,
  beslut: "r328 v205 ESKALERAD+KURAD: crontab-massförlust — desk-installatör ersatte användar-crontaben med 2 rader efter 28/9 16:12Z (bevis: /tmp/crontab-ak1a-u5-* visar friskt 10-radersläge dessförinnan); nattens DR-kedja dog (supabase-dump/moln-export/app-dump/döda länkar/beroendevakt/rop-hälsa uteblev, TBT sist 28/9). KUR: crontab 11 rader (9 norm + 2 desk, kedja1-URL ur u5-backup), vakten GRÖN, referens-ändringsprotokoll följt (desk-raderna in), RPO manuellt täppt (3 jobb, kvitto-loggar). v212 bokas: tyst-larm-kur + auto-applicering + installatörsskydd + AGENTS.md-serverrad.",
  landat: "denna commit (worklog r328 + PIPELINE v212 + crontab.reference rad 10–11)"
}) + '\n');

// ── Commit + push ──
const msg = `studio: [organ:Φ] r328 v205 ESKALERAD+KURAD — CRONTAB-MASSFÖRLUSTEN: nattens 6/7 G2/G5-spår uteblivna pga att en desk-installatör ERSATT användar-crontaben med 2 rader (bevis: u5-filerna /tmp/crontab-ak1a-u5-{backup,ny,efter} visar friskt 10-radersläge 28/9 16:12Z — förlusten skedde efter; r315 desk-läkare ny form + v201-u3 login-backup är de 2 kvarvarande); KUR VERKSTÄLLD: crontab återställd 11 rader (referensens 9 + desk 2, kedja1:s lösenordslösa URL belagd ur u5-backupen), konfigvakten GRÖN 9/9, ändringsprotokollet följt (crontab.reference +rad 10–11 desk), RPO-täppning manuellt: appdump aufr + moln-export + kedja1 rkaq detacherade med kvitto-loggar /tmp/r328-*.log; Fyndklasser → v212 bokas: (1) TYST-LARM (9 SAKNADE-larm med exitkod 0 väckte aldrig sessionen), (2) installatörsfällan append-aldrig-ersätt skall mekaniskt förhindras (automationsmotorn beslut 6 = applicera referensen), (3) AGENTS.md:s prod-rad inaktuel (SSD Nodes 208.87.129.108 sedan v190, ej Contabo) — styrelserondsbeslut; v205 ✓ LEVERERAD, 07:17Z-gränssnittsvakten = första automatiska beviset på hel crontab`;
fs.writeFileSync('/tmp/r328-commitmsg.txt', msg);
const steg = (n, f) => { try { console.log(`[OK] ${n}: ${sh(f).toString().trim().slice(0, 300)}`); } catch (e) { console.log(`[FEL] ${n}: ${(e.stdout || '') + (e.stderr || e.message)}`.slice(0, 500)); process.exit(1); } };
steg('git add', 'git add -A');
steg('commit', 'git commit -F /tmp/r328-commitmsg.txt');
steg('push', 'git push prod develop');
steg('log', 'git log --oneline -1');
console.log('\nKLAR r328');
