// rond 147: DoD-sond — snittets status, sajthälsa, fabrikens v145, RAM, deploylås
import fs from 'node:fs';
import { execSync, execFileSync } from 'node:child_process';

const kod = (url) => {
  try {
    return execFileSync('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', '--max-time', '15', url], { encoding: 'utf8' }).trim();
  } catch (e) { return 'FEL:' + e.message.slice(0, 60); }
};

console.log('══ SNITT + HÄLSA (http-koder) ══');
for (const u of [
  'http://localhost:3000/',
  'http://localhost:3000/rapportakademin',
  'https://lab.ak1nvestor.com/',
  'https://lab.ak1nvestor.com/rapportakademin',
]) console.log(u.padEnd(48), '→', kod(u));

console.log('\n══ DEPLOYLÅS + BYGG ══');
try {
  execSync('flock -n /tmp/ak1a-deploy.lock -c true', { timeout: 5000 });
  console.log('deploylås: LEDIGT (inget bygg pågår)');
} catch { console.log('deploylås: UPPTAGET (bygg pågår)'); }
try {
  const bid = fs.readFileSync('/home/ak1a/AK1/.next/BUILD_ID', 'utf8').trim();
  const st = fs.statSync('/home/ak1a/AK1/.next/BUILD_ID');
  console.log('prod BUILD_ID:', bid, '· byggt:', st.mtime.toISOString());
} catch (e) { console.log('BUILD_ID fel: ' + e.message.slice(0, 80)); }
const mb = (n) => Math.round(n / 1024);
console.log('MemAvailable:', mb(+fs.readFileSync('/proc/meminfo', 'utf8').match(/MemAvailable:\s+(\d+) kB/)[1]), 'MB');

console.log('\n══ PROD-SYNK-LOGG (sista 12) ══');
try {
  console.log(fs.readFileSync('/home/ak1a/AK1/data/vakten/prod-synk.log', 'utf8').split('\n').slice(-12).join('\n'));
} catch (e) { console.log('(saknas: ' + e.message.slice(0, 60) + ')'); }

console.log('\n══ FABRIKEN: v145-lasarguider ══');
for (const träd of ['/home/ak1a/agent/ak1', '/home/ak1a/AK1']) {
  const st = `${träd}/data/vakten/agentfabrik/status/v145-lasarguider.json`;
  if (fs.existsSync(st)) {
    console.log(`--- ${st} ---`);
    try {
      const j = JSON.parse(fs.readFileSync(st, 'utf8'));
      console.log(JSON.stringify({ status: j.status, progress: j.progress, klara: (j.uppgifter || []).filter(u => u.status === 'klar').map(u => u.id) }, null, 0).slice(0, 600));
    } catch (e) { console.log('parse-fel: ' + e.message.slice(0, 60)); }
  } else console.log(st, '→ saknas');
}

console.log('\n══ LÄSGUIDER PÅ DISK (data/blogg-utkast/rapportakademin) ══');
for (const träd of ['/home/ak1a/agent/ak1', '/home/ak1a/AK1']) {
  const d = `${träd}/data/blogg-utkast/rapportakademin`;
  try {
    const f = fs.readdirSync(d).filter(f => f.endsWith('.md'));
    console.log(träd, '→', f.length, 'filer:', f.slice(0, 12).join(', '));
  } catch { console.log(träd, '→ (katalog saknas)'); }
}
