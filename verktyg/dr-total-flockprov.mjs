#!/usr/bin/env node
// dr-total-flockprov.mjs — BETEENDEPROV för dr-total.mjs:s flock-lager
// (spår 10, s10-u2 omgång 6, 2026-09-16)
//
// Bakgrund (O4:s ärlighetsnot i DR-TOTAL-2026-09-16-AUTO.md): flockStartaOm()
// lades till EFTER den äkta 130,0 s-körningen — "nästa totalkörning verifierar
// flock-lagret beteendemässigt". Skillnaden mot gamla fillås-semantiken är
// beteende, inte kodväg: detta verktyg bevisar den på tre punkter i EN körning
// som SAMTIDIGT är kvartalsövningen (inget slösas):
//
//   (i)   RE-EXEC-VÄGEN: låsfilen skall under körningen bära raden
//         "…flock=1" med en LEVANDE node-pid (taLas flock=1-grenen).
//   (ii)  KÖ-BETEENDE: en FRÄMMANDE kortlivad aktiv låshållare (flock -c
//         'sleep N') skall få dr-total att VÄNTA och ta över efteråt —
//         gamla fillås-semantiken hade exit 3 ("TOTAL-LÅSET UPTAGET") direkt
//         på en färsk låsfil. Väntetid >= hållarbenslängd - 2 s = bevis.
//   (iii) DÖTT LÅS OSKADLIGT: en bakdaterad låsfil (död pid, ingen hållare)
//         skall inte hindra starten — flock(1) förvärvar oavsett mtime.
//
// Sekvens: död låsfil skapas (45 min bakdaterad) → främmande hållare flock:ar
// SAMMA fil under N s → dr-total.mjs startar och köar → tar över → kör hela
// kvartalsmallen (samtliga vävda kedjor, sedan O7: 1→5→2→4→3) → städbevis
// (PG17 nere, /tmp/dr-total-* borta, lås släppt).
//
// Användning: node verktyg/dr-total-flockprov.mjs [--hollare-sek N]
// Default hållare 25 s. Exit = dr-total:s exit (0 = hela övningen GRÖN).
// Bevisfil: /tmp/dr-total-flockprov-bevis-<datum>.md (citeras i protokollet).

import { spawn, spawnSync } from 'node:child_process';
import {
  existsSync, readFileSync, writeFileSync, utimesSync, statSync, rmSync,
  readdirSync,
} from 'node:fs';
import { dirname as pathDirname, join as pathJoin } from 'node:path';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const REPO_ROT = path.resolve(pathDirname(fileURLToPath(import.meta.url)), '..');
const LAS_VAG = '/tmp/ak1a-dr-total.lock';
const DATUM_ISO = new Date().toISOString().slice(0, 10);
const BEVIS_VAG = `/tmp/dr-total-flockprov-bevis-${DATUM_ISO}.md`;
const UTDATA_VAG = `/tmp/dr-total-flockprov-${DATUM_ISO}.log`;
const DOD_PID = 99999; // simulerat dött barn — ingen levande process har denna pid här

function lasArgument() {
  const args = process.argv.slice(2);
  let hollareS = 25;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--hollare-sek') {
      hollareS = Number(args[++i] || '');
      if (!Number.isFinite(hollareS) || hollareS < 5 || hollareS > 300) {
        console.error('--hollare-sek kräver 5–300'); process.exit(2);
      }
    } else if (args[i] === '--hjalp' || args[i] === '--help') {
      console.log('Användning: node verktyg/dr-total-flockprov.mjs [--hollare-sek N]');
      process.exit(0);
    } else {
      console.error(`Okänt argument: ${args[i]}`); process.exit(2);
    }
  }
  return hollareS;
}

function kor(kommando, args, opts = {}) {
  const r = spawnSync(kommando, args, { encoding: 'utf8', timeout: opts.timeoutMs ?? 30_000 });
  return { ok: r.status === 0, status: r.status, stdout: (r.stdout || '').trim(), stderr: (r.stderr || '').trim() };
}

function lasLasfil() {
  try { return readFileSync(LAS_VAG, 'utf8').trim(); } catch { return null; }
}

async function main() {
  const hollareS = lasArgument();
  const bevis = [];
  const push = (rad) => { bevis.push(rad); console.log(rad); };

  // --- Läge före: en eventuell riktig låsfil får inte påverka provet -------
  const fore = lasLasfil();
  if (fore !== null) {
    push(`- Läge före: låsfil fanns (\`${fore.replace(/\n/g, ' ⏎ ')}\`) — protokollförd och borttagen innan provet.`);
    rmSync(LAS_VAG, { force: true });
  } else {
    push('- Läge före: ingen låsfil på disk.');
  }

  // --- (iii) död bakdaterad låsfil utan hållare -----------------------------
  writeFileSync(LAS_VAG, `pid=${DOD_PID} start=2026-09-16T00:00:00.000Z verktyg=dr-total.mjs (simulerat dött barn)\n`);
  const dodTid = new Date(Date.now() - 45 * 60 * 1000);
  utimesSync(LAS_VAG, dodTid, dodTid);
  push(`- (iii) Död låsfil skapad: pid=${DOD_PID}, mtime bakdaterad 45 min (${statSync(LAS_VAG).mtime.toISOString()}) — ingen process håller den.`);

  // --- (ii) främmande aktiv hållare på samma fil -----------------------------
  const hollare = spawn('flock', [LAS_VAG, '-c', `sleep ${hollareS}`], { stdio: 'ignore' });
  kor('sleep', ['1.2']); // hållaren hinner förvärva flock-låset
  const hollarLevande = hollare.pid && !hollare.killed;
  push(`- (ii) Främmande hållare startad: flock pid=${hollare.pid}, håller låsfilen i ${hollareS} s (levande vid dr-total-start: ${hollarLevande ? 'ja' : 'NEJ — PROVET OGYLTIGT'}).`);

  // --- dr-total startar (skall köa bakom hållaren) ---------------------------
  const t0 = Date.now();
  let utdata = '';
  const total = spawn(process.execPath, [pathJoin(REPO_ROT, 'verktyg', 'dr-total.mjs')], {
    cwd: REPO_ROT, stdio: ['ignore', 'pipe', 'pipe'],
  });
  total.stdout.on('data', (d) => { utdata += d; process.stdout.write(d); });
  total.stderr.on('data', (d) => { utdata += d; process.stderr.write(d); });

  // --- polla låsfilen tills flock=1-raden med levande pid visas -------------
  let flockRad = null; let flockSek = null; let flockPidLevande = false; let flockCmd = '';
  const pollTak = Date.now() + 120_000;
  while (Date.now() < pollTak && !flockRad) {
    const innehall = lasLasfil();
    if (innehall && innehall.includes('flock=1')) {
      flockRad = innehall;
      flockSek = (Date.now() - t0) / 1000;
      const m = /pid=(\d+)/.exec(innehall);
      if (m) {
        const ps = kor('ps', ['-p', m[1], '-o', 'pid=,cmd=']);
        flockPidLevande = ps.ok && ps.stdout.length > 0;
        flockCmd = ps.stdout.replace(/\s+/g, ' ');
      }
    } else {
      kor('sleep', ['0.3']);
    }
  }

  const dodRadSista = lasLasfil(); // vad stod i filen medan dr-total köade?
  push(`- Låsfilen under köfasen (senast läst innan flock=1): \`${(dodRadSista || '(null)').replace(/\n/g, ' ').slice(0, 120)}\``);
  if (flockRad) {
    push(`- (i) RE-EXEC BEVISAD: låsfilen bär \`${flockRad.replace(/\n/g, ' ')}\` efter ${flockSek.toFixed(1)} s; pid ${flockPidLevande ? 'LEVER' : 'LEVER EJ'}: \`${flockCmd}\`.`);
    const kantade = flockSek >= (hollareS - 2);
    push(`- (ii) KÖ-BETEENDE: dr-total flock=1 efter ${flockSek.toFixed(1)} s >= hållare ${hollareS} s − 2 s → ${kantade ? 'VÄNTADE UT hållaren (GRÖN)' : 'tog låset FÖR SNABBT — flock-lagret bevisas EJ (RÖT)'}.`);
  } else {
    push('- (i)+(ii) RÖTT: flock=1-rad observerades ALDRIG inom 120 s — re-exec-vägen bevisas ej.');
  }
  const totalStartade = true; // (iii): processen startade trots död fil — om den exit:at 3 direkt syns det i utdata
  const exitTre = /TOTAL-LÅSET UPTAGET/.test(utdata);

  // --- vänta ut dr-total -------------------------------------------------------
  const vaggStart = Date.now();
  const klart = new Promise((res) => total.on('close', (kod) => res(kod)));
  const timeout = setTimeout(() => { try { total.kill('SIGKILL'); } catch { /* redan borta */ } }, 1_020_000);
  const exitKod = await klart;
  clearTimeout(timeout);
  const totalSek = (Date.now() - vaggStart) / 1000;
  push(`- dr-total avslutad: exit ${exitKod} på ${totalSek.toFixed(1)} s (väggklocka från start ${((Date.now() - t0) / 1000).toFixed(1)} s).`);
  push(`- (iii) DÖTT LÅS: dr-total startade trots 45 min gammal död låsfil — ${exitTre ? 'MEN svarade TOTAL-LÅSET UPTAGET/exit 3 (RÖTT: fillås-semantik kvar)' : 'exit 3 uteblev (GRÖN: flock gör döda lås oskadliga)'}. [processen startades: ${totalStartade ? 'ja' : 'nej'}]`);

  // --- städbevis ---------------------------------------------------------------
  const pgl = kor('pg_lsclusters', ['--no-header']);
  const pg17Nere = !/^17\s+main\s.*\bonline\b/im.test(pgl.stdout || '');
  push(`- Städning PG17: ${pg17Nere ? 'NERE — korrekt viloläge' : `UPPE (${(pgl.stdout || '').replace(/\n/g, '; ')}) — KONTRAKT BRUTET`}.`);
  let tmpRader = [];
  try { tmpRader = readdirSync('/tmp').filter((f) => f.startsWith('dr-total-')); } catch { /* /tmp oläslig = fynd */ }
  push(`- Städning /tmp: dr-total-*-rester ${tmpRader.length === 0 ? 'BORTA — GRÖNT' : `KVAR: ${tmpRader.join(', ')}`}.`);
  const lasFri = kor('flock', ['-n', LAS_VAG, '-c', 'true']);
  push(`- Låsfilen efteråt: innehåll \`${(lasLasfil() || '(borta)').replace(/\n/g, ' ')}\`; flock -n förvärvar → ${lasFri.ok ? 'LÅSET SLÄPPT (GRÖNT)' : 'låset hålls (RÖTT)'}.`);

  // --- dom + bevisfil ------------------------------------------------------------
  const gron = flockRad !== null && flockPidLevande && flockSek >= (hollareS - 2) && !exitTre
    && exitKod === 0 && pg17Nere && tmpRader.length === 0 && lasFri.ok;
  push(`DOM: ${gron ? 'GRÖN — flock-lagret beteendebevisat (i+ii+iii) och TOTAL-övningen GRÖN' : 'RÖT — se raderna ovan'}.`);
  writeFileSync(BEVIS_VAG, `# dr-total-flockprov ${DATUM_ISO}\n\n${bevis.join('\n')}\n\nSLUT — maskinellt av dr-total-flockprov.mjs ${new Date().toISOString()}\n`);
  writeFileSync(UTDATA_VAG, utdata);
  console.log(`Bevisfil: ${BEVIS_VAG}`);
  console.log(`dr-total-utdata: ${UTDATA_VAG}`);
  process.exit(gron ? 0 : 1);
}

await main();
