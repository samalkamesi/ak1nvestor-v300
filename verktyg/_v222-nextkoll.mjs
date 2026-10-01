// _v222-nextkoll.mjs — BUILD_ID + ålder i alla .next-kataloger + pm2-omstartstid.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const rötter = ['.next', '.next-bak-0304', '.next-senast-bra', '.next-forra', '.next-laeke', '.next-r325-gammal'];
for (const r of rötter) {
  const p = '/home/ak1a/AK1/' + r;
  try {
    const id = fs.readFileSync(p + '/BUILD_ID', 'utf8').trim();
    const st = fs.statSync(p + '/BUILD_ID');
    console.log(`${r}: ${id} (${st.mtime.toISOString()})`);
  } catch { console.log(`${r}: saknas`); }
}
try {
  const ut = execFileSync('bash', ['-c', "pm2 describe ak1a 2>/dev/null | grep -iE 'updated at|created at|exec uptime|restarts'"], { encoding: 'utf8', timeout: 15000 });
  console.log('\n' + ut.trim());
} catch (e) { console.log('(pm2: ' + e.message.split('\n')[0] + ')'); }
console.log('\ndisk .next just nu:', (() => { try { return fs.readFileSync('/home/ak1a/AK1/.next/BUILD_ID', 'utf8').trim(); } catch { return 'saknas'; } })());
