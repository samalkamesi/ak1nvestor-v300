#!/usr/bin/env node
// _s10u1-jungur.mjs — mät wrapper för s10-u1 (manifest auto-s10-1789878902744)
// 2026-09-20: jungurkvitto för arkivera-server.mjs första cron-körning (03:20)
// + konfigsnapshot-dom. ENDAST LÄSANDE: crontab -l, sudo cat nginx, pm2 jlist,
// arkivlistning (tar -tzf). .env-innehåll läses ALDRIG — endast namnnotering.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, statSync, readdirSync } from 'node:fs';
import path from 'node:path';

const ROT = '/home/ak1a/AK1';
const BAK = path.join(ROT, 'data', 'backups');

function kor(kommando, args, opts = {}) {
  const r = spawnSync(kommando, args, { encoding: 'utf8', timeout: opts.timeoutMs ?? 120000, maxBuffer: 64 * 1024 * 1024 });
  return { ok: r.status === 0, stdout: (r.stdout || '').trim(), stderr: (r.stderr || '').trim() };
}
const sudo = (args, opts) => kor('sudo', ['-n', ...args], opts);
const t = (f) => new Date(statSync(f).mtimeMs).toISOString();

console.log('=== A. JUNGURBEVIS: schema × logg × artefakter ===');
const cron = kor('crontab', ['-l']);
const cronRad = cron.stdout.split('\n').find((l) => l.includes('arkivera-server.mjs')) || '(saknas)';
console.log(`A1 cron-rad: ${cronRad}`);
const loggFinns = existsSync('/tmp/server-arkiv.log');
const logg = loggFinns ? readFileSync('/tmp/server-arkiv.log', 'utf8') : '';
const alltGront = /ALLT GRÖNT/.test(logg);
console.log(`A2 verktygslogg /tmp/server-arkiv.log: ${loggFinns ? 'finns' : 'SAKNAS'} · "ALLT GRÖNT": ${alltGront}`);
if (loggFinns) for (const rad of logg.split('\n')) console.log(`   | ${rad}`);

const artefakter = [
  'server-repo-2026-09-20.tar.gz', 'server-git-2026-09-20.bundle',
  'server-nginx-ak1a.conf', 'server-crontab.txt', 'server-pm2-dump.json',
];
console.log('A3 artefakter på disk:');
for (const n of artefakter) {
  const v = path.join(BAK, n);
  console.log(`   ${existsSync(v) ? 'OK ' : 'SAKNAS '} ${n} · ${existsSync(v) ? (statSync(v).size / 1048576).toFixed(1) + ' MiB · ' + t(v) : '-'}`);
}

console.log('=== B. RETENTIONSPUNKT (60-dagarsregeln, veckoarkiv) ===');
const vecko = readdirSync(BAK).filter((n) => /^(server-repo-\d{4}-\d{2}-\d{2}\.tar\.gz|server-git-\d{4}-\d{2}-\d{2}\.bundle)$/.test(n)).sort();
let skulleRadera = 0;
for (const n of vecko) {
  const alderDygn = (Date.now() - statSync(path.join(BAK, n)).mtimeMs) / 86400000;
  if (alderDygn > 60) skulleRadera++;
  console.log(`   ${n} · ${alderDygn.toFixed(1)} dygn${alderDygn > 60 ? ' → SKULLE RADERAS' : ''}`);
}
const aldsta = vecko[0] ? (Date.now() - statSync(path.join(BAK, vecko[0])).mtimeMs) / 86400000 : 0;
const nastaTräff = new Date(Date.now() + (60 - aldsta) * 86400000).toISOString().slice(0, 10);
console.log(`B1 ${vecko.length} veckoarkiv · regeln skulle idag radera ${skulleRadera} · nästa retentionsträff äldsta+60 ≈ ${nastaTräff}`);

console.log('=== C. KONFIGSNAPSHOT-DOM ===');
// C1 nginx: artefakt vs levande /etc/nginx/sites-available/ak1a
const nginxArt = readFileSync(path.join(BAK, 'server-nginx-ak1a.conf'), 'utf8');
const nginxLiv = sudo(['cat', '/etc/nginx/sites-available/ak1a']);
const norm = (s) => s.replace(/\s+$/, '').split('\n').map((r) => r.replace(/\s+$/, '')).join('\n');
const nginxLik = nginxLiv.ok && norm(nginxArt) === norm(nginxLiv.stdout + '\n');
console.log(`C1 nginx: artefakt ${nginxArt.split('\n').length} rader · levande ${nginxLiv.ok ? nginxLiv.stdout.split('\n').length + ' rader' : 'sudo-fel: ' + nginxLiv.stderr.slice(0, 60)} · innehållslik (normaliserad): ${nginxLik}`);

// C2 crontab: artefakt == crontab -l + 2 proveniensrader
const cronArt = readFileSync(path.join(BAK, 'server-crontab.txt'), 'utf8').split('\n');
const proveniens = cronArt.slice(0, 2);
const kropp = cronArt.slice(2).map((r) => r.replace(/\s+$/, '')).filter((r) => r !== '');
const levandeRader = cron.stdout.split('\n').map((r) => r.replace(/\s+$/, '')).filter((r) => r !== '');
const cronLik = kropp.join('\n') === levandeRader.join('\n');
console.log(`C2 crontab: proveniensheader ${proveniens.length ? 'del 1: "' + proveniens[0].slice(0, 46) + '…"' : 'SAKNAS'} · kropp ${kropp.length} rader == levande ${levandeRader.length} rader: ${cronLik}`);

// C3 pm2-dump: giltig JSON, processer, ak1a med; vs levande pm2 jlist
let pm2Art = null;
try { pm2Art = JSON.parse(readFileSync(path.join(BAK, 'server-pm2-dump.json'), 'utf8')); } catch (e) { console.log(`C3 pm2-dump: EJ JSON — ${e.message}`); }
if (pm2Art) {
  const namnArt = pm2Art.map((p) => p.name).sort();
  console.log(`C3 pm2-dump: giltig JSON · ${pm2Art.length} processer: ${namnArt.join(', ')} · ak1a: ${namnArt.includes('ak1a')}`);
  const pm2Liv = kor('pm2', ['jlist']);
  if (pm2Liv.ok) {
    const namnLiv = JSON.parse(pm2Liv.stdout).map((p) => p.name).sort();
    console.log(`   levande pm2 nu: ${namnLiv.join(', ')} · namnmängd lik sedan 03:20: ${namnArt.join('|') === namnLiv.join('|')}`);
  }
}

console.log('=== D. R2-KONTRAKT I ARKIVLISTAN (endast namn, innehåll läses aldrig) ===');
const lista = kor('tar', ['-tzf', path.join(BAK, 'server-repo-2026-09-20.tar.gz')], { timeoutMs: 300000 });
if (lista.ok) {
  const poster = lista.stdout.split('\n').filter((l) => l.trim() !== '' && l !== './');
  const envPoster = poster.filter((p) => /(^|\/)\.env/.test(p));
  console.log(`D1 tar-listning: ${poster.length} poster · .env-namn i arkivet: ${envPoster.length ? envPoster.join(', ') : 'INGA'}`);
  const spot = ['package.json', 'next.config.ts', 'data/DRIFTSBOKEN.md', 'src/lib/seo.tsx'].map((s) => `${s}:${poster.some((p) => p.replace(/^\.\//, '') === s) ? 'med' : 'SAKNAS'}`).join(' · ');
  console.log(`D2 spot-filer i arkivet: ${spot}`);
} else {
  console.log(`D1 tar-listning MISSLYCKADES: ${lista.stderr.slice(0, 120)}`);
}

console.log('=== E. SYSTEMLÄGE (disk + PG-viloläge; endast läsning) ===');
const df = kor('df', ['-h', '/']);
console.log(`E1 disk: ${df.stdout.split('\n')[1]}`);
const pg = sudo(['-u', 'postgres', 'pg_isready', '-q', '-p', '5432']);
console.log(`E2 PG17: ${pg.ok ? 'UPPE' : 'nere (korrekt viloläge)'}`);
