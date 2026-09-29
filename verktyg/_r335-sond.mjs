// r335 sond: fabriksstatus s7 + eftervakt + sista worklog-raderna i AK1
import fs from 'node:fs';

const AK1 = '/home/ak1a/AK1';
const st = JSON.parse(fs.readFileSync(`${AK1}/data/vakten/agentfabrik/status/auto-s7-1790673915240.json`, 'utf8'));
console.log('=== s7-MANIFEST', st.id, '===');
console.log('status:', st.status);
for (const u of st.uppgifter || []) console.log(`  ${u.id}: ${u.status} exit=${u.exitKod ?? '?'}`);

console.log('\n=== eftervakt-process (pid 824990) ===');
try {
  const proc = fs.readFileSync('/proc/824990/cmdline', 'utf8').replace(/\0/g, ' ').slice(0, 160);
  console.log('LEVER: ' + proc);
} catch { console.log('död/avslutad'); }

console.log('\n=== s7-u3:s eftervaktsfiler i AK1 ===');
for (const f of ['o563-header-struktur.json', 'natt-referens.json']) {
  const p = `${AK1}/data/forskning/OPTIMERING/lighthouse/${f}`;
  console.log(f + ': ' + (fs.existsSync(p) ? fs.statSync(p).size + ' B, mtime ' + fs.statSync(p).mtime.toISOString() : 'saknas'));
}

console.log('\n=== AK1 worklog svans (senaste 12 raderna) ===');
const wl = fs.readFileSync(`${AK1}/worklog.md`, 'utf8').trim().split('\n');
console.log(wl.slice(-12).join('\n'));
