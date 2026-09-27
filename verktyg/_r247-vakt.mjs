// Rond 247 — detacherad start av gränssnittsvakten (repair-skriptets mönster).
// Starter: startar köraren detached och avslutar direkt (studio-säkert).
import { spawn } from 'node:child_process';
import { writeFileSync, appendFileSync } from 'node:fs';
const S = '/tmp/r247-vakt-status.txt';
writeFileSync(S, 'R247-VAKT-STARTAD ts=' + Date.now() + '\n');
const barn = spawn('node', ['/home/ak1a/agent/ak1/verktyg/_r247-vakt2.mjs'], {
  detached: true,
  stdio: 'ignore',
});
barn.unref();
appendFileSync(S, 'R247-VAKT-BARN-UPPE pid=' + barn.pid + ' ts=' + Date.now() + '\n');
console.log('BARN-UPPE pid=' + barn.pid);
