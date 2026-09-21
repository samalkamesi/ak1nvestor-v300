// F6-lägessond: allt bevis för dom om vaccin/kur i EN körning (node = bevisat säker kanal)
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const S = (cmd, args, t = 15000) => { try { return execFileSync(cmd, args, { encoding: 'utf8', timeout: t, maxBuffer: 8 * 1024 * 1024 }); } catch (e) { return 'FEL: ' + (e.message || '').slice(0, 120); } };
const ut = {};

ut.nu = new Date().toISOString();
ut.mem = (fs.readFileSync('/proc/meminfo', 'utf8').match(/MemAvailable:\s+(\d+) kB/) || [])[1];
ut.memMB = ut.mem ? Math.round(+ut.mem / 1024) : null;

// deploylås: icke-blockerande flock-probe
try { execFileSync('flock', ['-n', '/tmp/ak1a-deploy.lock', '-c', 'true'], { timeout: 5000 }); ut.deploylas = 'LEDIGT'; } catch { ut.deploylas = 'UPPTAGET'; }

// pågående bygg?
const ps = S('ps', ['-eo', 'pid,etimes,rss,cmd', '--sort=-rss']);
ut.toppProcesser = ps.split('\n').slice(0, 8).map(r => r.trim().slice(0, 150));
ut.byggPagar = /next build|npm ci|npm run build/.test(ps);

// pm2 ak1a: tak, RSS, uptime, restarts
try {
  const jl = JSON.parse(S('pm2', ['jlist'], 20000));
  const p = jl.find(x => x.name === 'ak1a');
  ut.pm2 = p ? {
    status: p.pm2_env?.status, pid: p.pid,
    maxMemoryRestart: p.pm2_env?.max_memory_restart ?? null,
    rssMB: Math.round((p.monit?.memory || 0) / 1048576),
    restarts: p.pm2_env?.restart_time,
    upMinuter: p.pm2_env?.pm_uptime ? Math.round((Date.now() - p.pm2_env.pm_uptime) / 60000) : null,
  } : 'SAKNAS';
} catch (e) { ut.pm2 = 'jlist-FEL: ' + e.message.slice(0, 100); }

// prod-hälsa
ut.url = {};
for (const u of ['http://localhost:3000/', 'https://lab.ak1nvestor.com/', 'https://lab.ak1nvestor.com/rapportakademin']) {
  ut.url[u] = S('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', '--max-time', '15', u]);
}

// vaccin-bevakare-process vid liv?
ut.vaccinProcess = /_f6-vaccin/.test(ps);

// FYNN-ledgern: senaste filer under feljakt-spåret
const kand = [];
const sok = (dir) => { try { for (const f of fs.readdirSync(dir, { withFileTypes: true })) { const p = dir + '/' + f.name; if (f.isDirectory() && !f.name.startsWith('.') && f.name !== 'node_modules') sok(p); else if (/feljakt|fynn/i.test(f.name)) kand.push(p); } } catch {} };
sok('/home/ak1a/agent/ak1/data');
ut.fynnFiler = kand.slice(0, 10);
if (kand.length) { const nyaste = kand.map(p => [p, fs.statSync(p).mtimeMs]).sort((a, b) => b[1] - a[1])[0]; ut.fynnNyaste = { fil: nyaste[0], svans: fs.readFileSync(nyaste[0], 'utf8').trimEnd().split('\n').slice(-3) }; }

// trädet: smutsiga filer (för landningen)
const gs = S('git', ['-C', '/home/ak1a/agent/ak1', 'status', '--porcelain'], 20000);
ut.tradSmutsiga = gs === '' ? 0 : (gs.trim().split('\n').filter(Boolean).length);
ut.tradRader = gs.trim().split('\n').slice(0, 35);

console.log(JSON.stringify(ut, null, 1));
fs.writeFileSync('/home/ak1a/agent/ak1/data/vakten/_f6-lage-senaste.json', JSON.stringify(ut, null, 1));
