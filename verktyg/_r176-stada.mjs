// Döda båda bevakarna + starta EN ren (fixad kod)
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { openSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
for (const pid of [3299786, 3309133]) {
  try { process.kill(pid, 'SIGKILL'); console.log(pid, 'dödad'); }
  catch (e) { console.log(pid, 'borta:', e.message.slice(0, 40)); }
}
// vänta ut processernas död
await new Promise(r => setTimeout(r, 1500));
// verifiera
const ps = execFileSync('ps', ['aux'], { timeout: 15000 }).toString();
console.log('kvarvarande bevakare:', ps.split('\n').filter(r => /_r176-bevakare/.test(r) && !/grep/.test(r)).length);
// rensa lägesfilen + starta EN ren
fs.writeFileSync('/tmp/r176-läge.txt', '');
const out = openSync('/tmp/r176-bevakare.log', 'a');
const barn = spawn('node', ['/home/ak1a/agent/ak1/verktyg/_r176-bevakare.mjs'], {
  detached: true, stdio: ['ignore', out, out], env: process.env,
});
barn.unref();
console.log('ren bevakare startad pid=' + barn.pid);
