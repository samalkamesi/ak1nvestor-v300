// rond 147: fabrikstatus + RAM-karta via node (bash-pipes hänger studion)
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const bas = '/home/ak1a/AK1/data/vakten/agentfabrik';
console.log('══ KO (väntande manifest) ══');
try { console.log(fs.readdirSync(bas + '/ko').join('\n') || '(tom)'); } catch (e) { console.log('FEL ' + e.message); }

console.log('\n══ STATUS auto-s5 + v145 (om finns) ══');
for (const f of ['auto-s5-1789989925484.json']) {
  try {
    const j = JSON.parse(fs.readFileSync(`${bas}/status/${f}`, 'utf8'));
    console.log(f, '→ status:', j.status, '· progress:', JSON.stringify(j.progress ?? j.klara ?? 'n/a').slice(0, 200));
  } catch (e) { console.log(f, 'FEL ' + e.message); }
}

console.log('\n══ RAM ══');
try {
  const m = fs.readFileSync('/proc/meminfo', 'utf8').match(/MemAvailable:\s+(\d+) kB/);
  console.log('MemAvailable:', Math.round(m[1] / 1024), 'MB');
} catch (e) { console.log('FEL ' + e.message); }

console.log('\n══ STÖRSTA PROCESSERNA (rss-MB) ══');
try {
  const ut = execSync("ps -eo pid,rss,etimes,args --sort=-rss", { encoding: 'utf8', timeout: 15000 });
  const rader = ut.trim().split('\n').slice(0, 16);
  for (const r of rader) {
    const m = r.match(/^\s*(\d+)\s+(\d+)\s+(\d+)\s+(.*)$/);
    if (!m) { console.log(r.slice(0, 100)); continue; }
    console.log(`pid ${m[1]} · ${Math.round(m[2] / 1024)} MB · ålder ${Math.round(m[3] / 60)} min · ${m[4].slice(0, 90)}`);
  }
} catch (e) { console.log('FEL ' + e.message); }
