#!/usr/bin/env node
// arkivera-server.mjs — server-side exportör för DR-kedja 3 (serverfils-
// arkivet). Spår 10, 2026-09-16 (F8-kön ur DR-PROV-2026-09-16-KEDJA3.md:
// "cron för vecko-arkivering server-side" — tills detta verktyg fanns levde
// arkiven på agent-manuella körningar sedan datorns hybrid-sync tystnade
// 2026-09-09).
//
// Skapar, HELT på servern (ingen ssh-ström — eliminerar 09-09:s risken):
//   1. data/backups/server-repo-<dag>.tar.gz — arbetsytan UTAN node_modules/
//      .next/.git/tool-results/data/cache/data/backups (samma exkluderings-
//      kontrakt som backup-server-filer.mjs v2), gzip-verifierad + listad +
//      storleksvakt 500 MB FÖRE filen godtas (09-09-lärdomen: exit 0 +
//      storlek bevisar inte strömmen).
//   2. data/backups/server-git-<dag>.bundle — hela historiken (git bundle
//      create --all), verifierad med git bundle verify.
//   3. Konfigsnapshots (F8: de gamla var 7 dygn): server-nginx-ak1a.conf
//      (sudo cat), server-crontab.txt (crontab -l, med proveniensheader),
//      server-pm2-dump.json (pm2 jlist, JSON-validerad).
// Allt skrivs till *.del och byter namn FÖRST efter verifiering — ett
// misslyckat moment efterlämnar ALDRIG ett halfvant arkiv (idempotent:
// omkörning samma dag skriver om).
//
// Lås: /tmp/ak1a-dr-prov.lock via flock — arkivskapandet och DR-övningarna
// (dr-ovning/dr-kedja2/dr-kedja3/dr-kedja4) mutar varandra aldrig (RÖT-mot-
// färskt-arkiv-racet ur S10-U1 O3 är härmed strukturellt omöjligt).
// Retention: server-repo-*.tar.gz + server-git-*.bundle äldre än 60 dygn
// raderas (≈ 8 veckoarkiv; system-events-full är ARKIVHANDLINGAR och röras
// ALDRIG — deras retention äger ingen).
//
// Användning: node verktyg/arkivera-server.mjs   (cron söndag 03:20, rad 4)
// Exit: 0 allt GRÖNT · 1 minst ett moment RÖTT (ärliga rader ovan).

import { spawnSync } from 'node:child_process';
import {
  existsSync, readFileSync, writeFileSync, unlinkSync, readdirSync,
  statSync, renameSync, rmSync,
} from 'node:fs';
import { dirname as pathDirname, join as pathJoin } from 'node:path';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const REPO_ROT = path.resolve(pathDirname(fileURLToPath(import.meta.url)), '..');
const ARKIV_KATALOG = pathJoin(REPO_ROT, 'data', 'backups');
const LAS_VAG = '/tmp/ak1a-dr-prov.lock';
const DAG = new Date().toISOString().slice(0, 10);
const MAX_BYTE_TAR = 500 * 1024 * 1024;
const RETENTION_DYGN = 60;
const UTESLUTNA_PREFIX = ['node_modules/', '.next/', '.git/', 'tool-results/', 'data/cache/', 'data/backups/'];
const SPOT_FILER = ['package.json', 'next.config.ts', 'data/DRIFTSBOKEN.md', 'src/lib/seo.tsx'];

function kor(kommando, args, opts = {}) {
  const r = spawnSync(kommando, args, {
    encoding: 'utf8', timeout: opts.timeoutMs ?? 300000,
    maxBuffer: 128 * 1024 * 1024, cwd: opts.cwd, input: opts.input,
  });
  return { ok: r.status === 0, status: r.status, stdout: (r.stdout || '').trim(), stderr: (r.stderr || '').trim(), kombinerad: ((r.stdout || '') + (r.stderr || '')).trim() };
}
const sudo = (args, opts) => kor('sudo', ['-n', ...args], opts);
const log = (s) => console.log(s);

// ── Flock: samma kontrakt som dr-kedja* (re-exec under flock, ≤ 15 min väntan)
function flockStartaOm() {
  if (process.env.AK1A_DR_FLOCK === '1') return;
  const r = spawnSync('flock', ['-w', '900', LAS_VAG, process.execPath, fileURLToPath(import.meta.url), ...process.argv.slice(2)], {
    stdio: 'inherit', env: { ...process.env, AK1A_DR_FLOCK: '1' }, timeout: 960000,
  });
  if (r.error) { console.error('FLOCK-KRITISKT: ' + r.error.message); process.exit(1); }
  process.exit(r.status ?? 1);
}

function grind() {
  const mem = /MemAvailable:\s+(\d+) kB/.exec(readFileSync('/proc/meminfo', 'utf8'));
  const mb = mem ? Math.round(Number(mem[1]) / 1024) : 0;
  if (mb < 600) { console.error(`RAMGRIND: MemAvailable ${mb} MB < 600 MB — SKIPPAS (exit 75).`); process.exit(75); }
  const df = kor('df', ['-k', '/']);
  const gbLedigt = Number((((df.stdout || '').split('\n')[1] || '').trim().split(/\s+/)[3] || 0)) / 1024 / 1024;
  if (gbLedigt < 5) { console.error(`DISKGRIND: ${gbLedigt.toFixed(1)} GB ledigt < 5 GB — SKIPPAS (exit 75).`); process.exit(75); }
  log(`[0] Grind OK: MemAvailable ${mb} MB · ${gbLedigt.toFixed(0)} GB ledigt.`);
}

// ── Minisjälvtest: verifierarna måste gripa trunkering (09-09-klassen) ─────
function minisjalvtest() {
  const kat = '/tmp/arkivera-server-sabotage-' + process.pid;
  rmSync(kat, { recursive: true, force: true });
  kor('sh', ['-c', `mkdir -p ${kat}/mini && echo hej > ${kat}/mini/a.txt && tar czf ${kat}/bra.tar.gz -C ${kat}/mini .`]);
  const hela = readFileSync(pathJoin(kat, 'bra.tar.gz'));
  writeFileSync(pathJoin(kat, 'trunkerad.tar.gz'), hela.subarray(0, Math.max(64, Math.floor(hela.length * 0.55))));
  const g1 = kor('gzip', ['-t', pathJoin(kat, 'bra.tar.gz')]).ok;
  const g2 = kor('gzip', ['-t', pathJoin(kat, 'trunkerad.tar.gz')]).ok;
  rmSync(kat, { recursive: true, force: true });
  const ok = g1 === true && g2 === false;
  log(`[1] Minisjälvtest: giltig gzip GODKÄNS=${g1} · trunkerad gzip RÖD=${!g2} — ${ok ? 'GRÖN' : 'RÖD'}`);
  if (!ok) { console.error('minisjälvtest misslyckades — verifieraren griper inte trunkering'); process.exit(1); }
}

// Verifiera ett färdigskrivet tar-arkiv FÖRE namnbyte. Returnerar {ok, fel, poster}.
function verifieraTar(fil) {
  const fel = [];
  if (!kor('gzip', ['-t', fil], { timeoutMs: 600000 }).ok) fel.push('gzip -t underkänd');
  const list = kor('tar', ['-tzf', fil], { timeoutMs: 600000 });
  if (!list.ok) fel.push('tar -tzf underkänd');
  const poster = list.ok ? list.stdout.split('\n').filter((r) => r.trim() !== '') : [];
  let brott = 0, srcFiler = 0;
  const normaliserade = new Set();
  for (const p of poster) {
    const n = p.replace(/^\.\//, '');
    normaliserade.add(n);
    if (UTESLUTNA_PREFIX.some((u) => n === u.slice(0, -1) || n.startsWith(u))) brott++;
    if (/^src\/.*\.(ts|tsx)$/.test(n)) srcFiler++;
  }
  if (brott > 0) fel.push(`exkluderingskontraktet brutet: ${brott} poster`);
  const saknade = SPOT_FILER.filter((s) => !normaliserade.has(s));
  if (saknade.length) fel.push('spot-filer saknas: ' + saknade.join(', '));
  if (poster.length < 100) fel.push(`misstänkt få poster (${poster.length})`);
  return { ok: fel.length === 0, fel, poster: poster.length, srcFiler };
}

function atomisk(namn, skrivOchVerifiera) {
  // skrivOchVerifiera(tmpfil) → {ok, fel[], info} — namnbyte endast vid ok.
  const tmp = pathJoin(ARKIV_KATALOG, namn + '.del');
  rmSync(tmp, { force: true });
  const r = skrivOchVerifiera(tmp);
  if (!r.ok) { rmSync(tmp, { force: true }); return r; }
  renameSync(tmp, pathJoin(ARKIV_KATALOG, namn));
  return r;
}

const t0 = Date.now();
flockStartaOm();
grind();
minisjalvtest();
if (!existsSync(ARKIV_KATALOG)) { console.error('data/backups saknas'); process.exit(1); }

const resultat = [];

// [2] Arkiv A — arbetsytan som tar.gz (server-side, ingen ssh-ström).
const tarNamn = `server-repo-${DAG}.tar.gz`;
let tA = Date.now();
resultat.push(atomisk(tarNamn, (tmp) => {
  const c = kor('tar', ['czf', tmp, '-C', REPO_ROT,
    '--exclude=node_modules', '--exclude=.next', '--exclude=.git',
    '--exclude=tool-results', '--exclude=data/cache', '--exclude=data/backups', '.'], { timeoutMs: 900000 });
  // Driftfynd 2026-09-16: levande agentträd ⇒ "file changed as we read it"
  // är VÄNTAT (exit 1) och accepteras — arkivet verifieras ändå strängt nedan
  // (gzip-ström + full listning + exkluderings- + spot-kontrakt) och exakt
  // historik ägs av bundlen. Andra fel = RÖT.
  const raderSomFickVanta = (c.stderr || '').split('\n').filter((r) => r.includes('as we read it'));
  const andraFel = (c.stderr || '').split('\n').filter((r) => r.trim() !== '' && !r.includes('as we read it'));
  if (!c.ok && (c.status !== 1 || andraFel.length)) return { ok: false, fel: ['tar czf (exit ' + c.status + '): ' + (andraFel[0] || c.stderr || '').split('\n')[0].slice(0, 120)] };
  const byte = statSync(tmp).size;
  if (byte > MAX_BYTE_TAR) return { ok: false, fel: [`överstorlek ${(byte / 1048576).toFixed(0)} MB > 500 MB-vakten`] };
  const v = verifieraTar(tmp);
  if (!v.ok) return { ok: false, fel: v.fel };
  return { ok: true, fel: [], info: `OK ${(byte / 1048576).toFixed(1)} MB · ${v.poster.toLocaleString('sv-SE')} poster · ${v.srcFiler} src ts/tsx · skapad ${((Date.now() - tA) / 1000).toFixed(1)} s${raderSomFickVanta.length ? ` · träd i rörelse (${raderSomFickVanta.length} noter, accepterat — historiken ägs av bundlen)` : ''} → ${tarNamn}` };
}));
log(`[2] ${tarNamn}: ${resultat[resultat.length - 1].info || resultat[resultat.length - 1].fel.join('; ')}`);

// [3] Arkiv B — hela historiken som git bundle.
const bunNamn = `server-git-${DAG}.bundle`;
tA = Date.now();
resultat.push(atomisk(bunNamn, (tmp) => {
  const c = kor('git', ['-C', REPO_ROT, 'bundle', 'create', tmp, '--all'], { timeoutMs: 900000 });
  if (!c.ok) return { ok: false, fel: ['git bundle create: ' + (c.kombinerad || '').split('\n')[0].slice(0, 120)] };
  const v = kor('git', ['bundle', 'verify', tmp], { cwd: REPO_ROT, timeoutMs: 600000 });
  if (!v.ok) return { ok: false, fel: ['git bundle verify: ' + (v.kombinerad || '').split('\n')[0].slice(0, 120)] };
  if (!/complete history/.test(v.kombinerad)) return { ok: false, fel: ['bundeln bär inte complete history'] };
  const byte = statSync(tmp).size;
  return { ok: true, fel: [], info: `OK ${(byte / 1048576).toFixed(1)} MB · complete history · skapad ${((Date.now() - tA) / 1000).toFixed(1)} s → ${bunNamn}` };
}));
log(`[3] ${bunNamn}: ${resultat[resultat.length - 1].info || resultat[resultat.length - 1].fel.join('; ')}`);

// [4] Konfigsnapshots (F8: de gamla var 7 dygn gamla från datorns valv).
resultat.push(atomisk('server-nginx-ak1a.conf', (tmp) => {
  const c = sudo(['cat', '/etc/nginx/sites-available/ak1a']);
  if (!c.ok) return { ok: false, fel: ['sudo cat nginx: ' + c.stderr.split('\n')[0].slice(0, 80)] };
  writeFileSync(tmp, c.stdout + '\n');
  return { ok: c.stdout.length > 100, fel: c.stdout.length > 100 ? [] : ['nginx-conf misstänkt kort'], info: `OK ${c.stdout.split('\n').length} rader` };
}));
resultat.push(atomisk('server-crontab.txt', (tmp) => {
  const c = kor('crontab', ['-l']);
  if (!c.ok) return { ok: false, fel: ['crontab -l: ' + c.stderr.split('\n')[0].slice(0, 80)] };
  writeFileSync(tmp, `# källa: crontab -l (användare ak1a@contabo) — server-snapshot ${new Date().toISOString()}\n# (äldre kopia i valvet kom från datorns hybrid-sync med /etc/crontab som källa)\n` + c.stdout + '\n');
  return { ok: c.stdout.length > 50, fel: c.stdout.length > 50 ? [] : ['crontab misstänkt kort'], info: `OK ${c.stdout.split('\n').filter((r) => r && !r.startsWith('#')).length} aktiva rader` };
}));
resultat.push(atomisk('server-pm2-dump.json', (tmp) => {
  const c = kor('pm2', ['jlist']);
  if (!c.ok) return { ok: false, fel: ['pm2 jlist: ' + c.stderr.split('\n')[0].slice(0, 80)] };
  try { JSON.parse(c.stdout); } catch (e) { return { ok: false, fel: ['pm2-dump ej JSON: ' + e.message.slice(0, 60)] }; }
  writeFileSync(tmp, c.stdout + '\n');
  return { ok: true, fel: [], info: `OK ${JSON.parse(c.stdout).length} processer` };
}));
log(`[4] Konfigsnapshots: nginx ${resultat[2].info || resultat[2].fel[0]} · crontab ${resultat[3].info || resultat[3].fel[0]} · pm2 ${resultat[4].info || resultat[4].fel[0]}`);

// [5] Retention: veckoarkiv äldre än 60 dygn raderas (ALDRIG system-events).
const grans = Date.now() - RETENTION_DYGN * 86400000;
let raderade = 0;
for (const n of readdirSync(ARKIV_KATALOG)) {
  if (!/^(server-repo-\d{4}-\d{2}-\d{2}\.tar\.gz|server-git-\d{4}-\d{2}-\d{2}\.bundle)$/.test(n)) continue;
  const v = pathJoin(ARKIV_KATALOG, n);
  if (statSync(v).mtimeMs < grans) { unlinkSync(v); raderade++; log(`    retention: ${n} raderad (> ${RETENTION_DYGN} dygn)`); }
}
log(`[5] Retention klar: ${raderade} raderade · regeln ${RETENTION_DYGN} dygn (system-events-full orörs — arkivhandlingar).`);

const misslyckades = resultat.filter((r) => !r.ok);
log(`[6] arkivera-server ${DAG}: ${misslyckades.length ? 'FEL i ' + misslyckades.length + ' moment' : 'ALLT GRÖNT'} · ${(Date.now() - t0) / 1000 < 1 ? '<1' : ((Date.now() - t0) / 1000).toFixed(0)} s totalt.`);
process.exit(misslyckades.length ? 1 : 0);
