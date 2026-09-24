// FYNN F6-drift: rot-sond — VEM äter RAM? Bevis före kur (NATURLAGAR Lag 1).
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const out = (s) => process.stdout.write(s + '\n');

// 1. Minnesläget (färska siffror, inte FYNN:s cache)
const mi = fs.readFileSync('/proc/meminfo', 'utf8');
const gb = (k) => parseInt((mi.match(new RegExp(k + ':\\s+(\\d+) kB')) || [0, '0'])[1], 10) / 1024;
out(`RAM: ${Math.round(gb('MemAvailable'))} MB tillgängligt av ${Math.round(gb('MemTotal'))} MB · swap fritt ${Math.round(gb('SwapFree'))}/${Math.round(gb('SwapTotal'))} MB`);

// 2. Topp-minnesätare (RSS-sorterat, ålder i timmar)
const ps = execFileSync('ps', ['--sort=-rss', '-eo', 'pid,rss,etimes,comm,args', '--no-headers'], { maxBuffer: 8 * 1024 * 1024, encoding: 'utf8' });
out('\nTopp 12 (RSS MB · ålder h · kommando):');
for (const l of ps.trim().split('\n').slice(0, 12)) {
  const m = l.trim().match(/^(\d+)\s+(\d+)\s+(\d+)\s+(\S+)\s+(.*)$/);
  if (!m) continue;
  out(`  pid ${m[1].padEnd(8)} ${String(Math.round(+m[2] / 1024)).padStart(5)} MB ${String(Math.round((+m[3] / 3600) * 10) / 10).padStart(6)} h ${m[4]} ${m[5].slice(0, 80)}`);
}

// 3. pm2-processträd (ak1a = next-servern?)
try {
  const j = JSON.parse(execFileSync('pm2', ['jlist'], { encoding: 'utf8', timeout: 15000, maxBuffer: 8 * 1024 * 1024 }));
  for (const p of j) out(`pm2 ${p.name}: pid ${p.pid} · online ${Math.round((Date.now() / 1000 - p.pm2_env.pm_uptime / 1000) / 60)} min · restarts ${p.pm2_env.restart_time} · minne ${Math.round((p.monit?.memory || 0) / 1048576)} MB`);
} catch (e) { out('pm2 jlist FEL: ' + e.message.slice(0, 100)); }

// 4. Deploylåset + byggtilstånd
for (const [namn, fil] of [['deploylås', '/tmp/ak1a-deploy.lock']]) {
  try { const st = fs.statSync(fil); out(`${namn}: UPPTAGET sedan ${st.mtime.toISOString()} (${Math.round((Date.now() - st.mtime.getTime()) / 60000)} min)`); }
  catch { out(`${namn}: fritt`); }
}
try {
  const st = fs.statSync('/home/ak1a/AK1/.next/BUILD_ID');
  out(`prod .next/BUILD_ID: ${fs.readFileSync('/home/ak1a/AK1/.next/BUILD_ID', 'utf8').trim().slice(0, 12)} (mtime ${st.mtime.toISOString()})`);
} catch (e) { out('prod .next/BUILD_ID saknas: ' + e.code + ' (pågående ombygge?)'); }

// 5. Prod-hälsa (tunn sond — servern kan ha det tufft just nu)
for (const url of ['https://lab.ak1nvestor.com/', 'https://lab.ak1nvestor.com/rapportakademin']) {
  try { out(`${url} → HTTP ${execFileSync('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', '--max-time', '8', url], { encoding: 'utf8' })}`); }
  catch (e) { out(`${url} → FEL ${e.message.slice(0, 60)}`); }
}
