// _v223-byggbevakare.mjs — passiv bevakare: väntar deploy-verdiket (ingen push/merge).
// Signal: prod-synk.logg får ny rad efter senaste "BYGGER FRÅN" som innehåller
// deployad/omstart/HTTPS/dubbelbyte/BUNTSLAGSRACE/MISSLYCKADES, ELLER låset blir ledigt 5 min i rad.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const LOGG = '/home/ak1a/AK1/data/vakten/prod-synk.log';
const MALORD = ['deployad', 'omstart', 'https', 'dubbelbyte', 'buntslagsrace', 'misslyckades', 'bygger från'];
function las() { try { return fs.readFileSync(LOGG, 'utf8').split('\n').filter(r => r.trim()); } catch { return []; } }
function lasSek() { try { return execFileSync('bash', ['-c', 'flock -w 2 /tmp/ak1a-deploy.lock true && echo LEDIGT || echo UPPTAGET'], { encoding: 'utf8', timeout: 10000 }).trim(); } catch { return '?'; } }

const rader0 = las();
const byggIdx = (() => { for (let i = rader0.length - 1; i >= 0; i--) if (rader0[i].includes('BYGGER FRÅN')) return i; return -1; })();
console.log(`bevakar efter byggrad ${byggIdx + 1} (${rader0[byggIdx] || '?'})`);
let lediga = 0;
for (let i = 0; i < 75; i++) { // tak 75 min
  await new Promise(r => setTimeout(r, 60000));
  const rader = las();
  const nya = rader.slice(byggIdx + 1);
  const traff = nya.find(r => MALORD.some(o => r.toLowerCase().includes(o)));
  if (traff) {
    console.log('== SIGNAL: ny verdict-rad ==');
    console.log(nya.slice(-6).join('\n'));
    process.exit(0);
  }
  if (nya.length) console.log(`[${i + 1} min] ${nya.slice(-1)[0].slice(0, 140)}`);
  lediga = lasSek() === 'LEDIGT' ? lediga + 1 : 0;
  if (lediga >= 5) { console.log('== SIGNAL: låset ledigt 5 min i rad (bygg troligt avslutat) =='); console.log(nya.slice(-4).join('\n')); process.exit(0); }
}
console.log('TAK 75 MIN — inget verdict; sista rader:'); console.log(las().slice(-4).join('\n'));
