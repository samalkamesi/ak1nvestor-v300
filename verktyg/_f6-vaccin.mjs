// FYNN F6-drift VACCIN: väntar på ledigt deploylås → pm2 ak1a max_memory_restart 2500M
// (mekaniskt tak mot next-serverns RSS-läcka 4,3 GB/22 h) → save → verifiera → riktad gränsnittsvakt.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const LAS = '/tmp/ak1a-deploy.lock';
const JURNAL = '/tmp/ak1a-omstart-journal.json';
const LOGG = '/home/ak1a/agent/ak1/data/vakten/f6-vaccin-utfall.json';
const rader = [];
const log = (s) => { rader.push(s); process.stdout.write(s + '\n'); };

const flockLedig = () => { try { execFileSync('flock', ['-n', LAS, '-c', 'true'], { timeout: 5000 }); return true; } catch { return false; } };

// (1) vänta ut pågående bygg — ALDRIG röra pm2 under flock (våg 100/216-reglerna)
const takTid = Date.now() + 40 * 60 * 1000;
while (!flockLedig()) {
  if (Date.now() > takTid) {
    log('TIMEOUT: deploylåset upptaget >40 min — vaccin EJ applicerat (köa om nästa rond)');
    fs.writeFileSync(LOGG, JSON.stringify({ status: 'timeout', log: rader, ts: Date.now() }, null, 1));
    process.exit(2);
  }
  await new Promise(r => setTimeout(r, 60000));
}
log('deploylås ledigt ' + new Date().toISOString() + ' — applicerar vaccin');

// (2) journal + omstart med minnestak (kanal för v216-samordning)
fs.writeFileSync(JURNAL, JSON.stringify({ kanal: 'fynn-f6-vaccin', pid: process.pid, ts: Date.now(), orsak: 'next-server RSS-läcka 4,3 GB/22 h (FYNN F6) — mekaniskt tak max_memory_restart 2500M' }));
try {
  const r = execFileSync('pm2', ['restart', 'ak1a', '--update-env', '--max-memory-restart', '2500M'], { encoding: 'utf8', timeout: 60000 });
  log('pm2 restart OK: ' + r.split('\n').filter(x => /ak1a|online/i.test(x)).join(' | ').slice(0, 180));
} catch (e) {
  log('pm2 restart FEL: ' + e.message.slice(0, 150));
  fs.writeFileSync(LOGG, JSON.stringify({ status: 'fel', log: rader, ts: Date.now() }, null, 1));
  process.exit(1);
}
try { execFileSync('pm2', ['save'], { timeout: 30000 }); log('pm2 save OK (taket persistent över omstarter)'); } catch (e) { log('pm2 save FEL: ' + e.message.slice(0, 120)); }

// (3) verifiera: taket satt + sajten 200
await new Promise(r => setTimeout(r, 9000));
try {
  const jl = JSON.parse(execFileSync('pm2', ['jlist'], { encoding: 'utf8', timeout: 15000, maxBuffer: 8 * 1024 * 1024 }));
  const p = jl.find(x => x.name === 'ak1a');
  log(`pm2 ak1a: pid ${p?.pid} · max_memory_restart ${p?.pm2_env?.max_memory_restart} · RSS ${Math.round((p?.monit?.memory || 0) / 1048576)} MB · restarts ${p?.pm2_env?.restart_time}`);
} catch (e) { log('pm2 jlist FEL: ' + e.message.slice(0, 100)); }
const koder = {};
for (const url of ['http://localhost:3000/', 'https://lab.ak1nvestor.com/', 'https://lab.ak1nvestor.com/rapportakademin']) {
  try { koder[url] = execFileSync('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', '--max-time', '15', url], { encoding: 'utf8' }); }
  catch { koder[url] = 'FEL'; }
  log(`${url} → ${koder[url]}`);
}

// (4) riktad gränsnittsvakt på snittet (standby-direktivet: vakten till 0 fynd)
try {
  const v = execFileSync('node', ['/home/ak1a/agent/ak1/verktyg/granssnittsvakt.mjs', '--sidor=/rapportakademin', '--bas=http://localhost:3000'], { encoding: 'utf8', timeout: 240000, maxBuffer: 16 * 1024 * 1024 });
  log('── gränsnittsvakt /rapportakademin (sista rader) ──\n' + v.split('\n').slice(-12).join('\n'));
} catch (e) { log('gränsnittsvakt FEL: ' + (e.stdout ? String(e.stdout).split('\n').slice(-8).join('\n') : e.message.slice(0, 120))); }

fs.writeFileSync(LOGG, JSON.stringify({ status: 'klar', koder, log: rader, ts: Date.now() }, null, 1));
log('F6-VACCIN KLAR — utfall: ' + LOGG);
