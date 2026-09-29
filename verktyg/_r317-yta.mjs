// r317: AK1-ytans sista rader + ev. övergiven diff (node-kanalen)
import { execSync } from 'node:child_process';
import fs from 'node:fs';
function kor(cmd, t = 20_000) {
  try { return { kod: 0, ut: execSync(cmd, { encoding: 'utf8', timeout: t, stdio: ['ignore', 'pipe', 'pipe'] }).trim() }; }
  catch (e) { return { kod: e.status ?? 1, ut: ((e.stdout || '') + (e.stderr || '')).trim() }; }
}
console.log('status:\n' + kor('git -C /home/ak1a/AK1 status --porcelain').ut);
const m = kor("git -C /home/ak1a/AK1 status --porcelain | grep -m1 '^ M'").ut.slice(3);
if (m) {
  console.log('\nM-fil: ' + m + ' — diff:');
  console.log(kor(`git -C /home/ak1a/AK1 diff -- ${m}`).ut.slice(0, 2500));
}
