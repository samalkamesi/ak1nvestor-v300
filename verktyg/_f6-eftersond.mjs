// FYNN F6: eftersond — VEM kurade (journal/pm2-logg/synk-logg) + pm2-läck vaccin-läge (Lag 1: bevis)
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const out = (s) => process.stdout.write(s + '\n');
const tail = (fil, n = 12) => { try { return fs.readFileSync(fil, 'utf8').trim().split('\n').slice(-n); } catch { return null; } };

// 1. Omstarts-journalen (skrivs av _r147-omstart.mjs OM den körde)
const j = tail('/tmp/ak1a-omstart-journal.json', 1);
out('omstarts-journal: ' + (j ? j.join(' ') : '(saknas — omstarten kom inte från r147-skriptet)'));

// 2. Riktig flock-probe av deploylåset (inte mtime)
try {
  execFileSync('flock', ['-n', '/tmp/ak1a-deploy.lock', '-c', 'true'], { timeout: 5000 });
  out('deploylås (flock-probe): LEDIGT');
} catch (e) { out('deploylås (flock-probe): UPPTAGET — bygg pågår, INGEN omstart nu'); }

// 3. pm2 ak1a: när startade den, max_memory_restart (läck-vaccinet), minne
try {
  const jl = JSON.parse(execFileSync('pm2', ['jlist'], { encoding: 'utf8', timeout: 15000, maxBuffer: 8 * 1024 * 1024 }));
  for (const p of jl.filter(x => x.name === 'ak1a')) {
    const up = new Date(p.pm2_env.pm_uptime);
    out(`pm2 ak1a: pid ${p.pid} · startad ${up.toISOString()} · restarts ${p.pm2_env.restart_time} · RSS ${Math.round((p.monit?.memory || 0) / 1048576)} MB`);
    out(`pm2 ak1a max_memory_restart: ${p.pm2_env.max_memory_restart ?? 'EJ SATT (läck-vaccin saknas)'}`);
    out(`pm2 ak1a instans_exec_mode: ${p.pm2_env.exec_mode} · instances: ${p.pm2_env.instances ?? 1}`);
  }
} catch (e) { out('pm2 jlist FEL: ' + e.message.slice(0, 100)); }

// 4. pm2-loggen runt omstarten (OOM-kill spår: 'online' efter error)
for (const fil of ['/home/ak1a/.pm2/logs/ak1a-error.log', '/home/ak1a/.pm2/logs/ak1a-out.log']) {
  const r = tail(fil, 6);
  out(`\n${fil} (sista 6):`);
  if (r) for (const l of r) out('  ' + l.slice(0, 150)); else out('  (saknas)');
}

// 5. Prod-synkens logg (vem byggde 17:50 + pm2-omstartsspår)
for (const kand of ['/home/ak1a/AK1/data/vakten/prod-synk.log', '/home/ak1a/agent/ak1/data/vakten/prod-synk.log']) {
  const r = tail(kand, 15);
  if (r) {
    out(`\n${kand} (sista 15):`);
    for (const l of r) out('  ' + l.slice(0, 150));
  }
}

// 6. dmesj-OOM-spår senaste timmen (kräver ingen sudo på denna server? försök)
try {
  const d = execFileSync('dmesg', ['--time-format', 'iso'], { encoding: 'utf8', timeout: 10000, maxBuffer: 8 * 1024 * 1024 });
  const oom = d.split('\n').filter(l => /oom|Out of memory|Killed process/i.test(l)).slice(-5);
  out('\ndmesg OOM-rader (sista 5):');
  out(oom.length ? oom.map(l => '  ' + l.slice(0, 160)).join('\n') : '  (inga)');
} catch (e) { out('\ndmesg: ej åtkomlig (' + e.message.slice(0, 60) + ')'); }
