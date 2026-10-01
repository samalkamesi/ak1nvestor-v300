// _v223-byggbevakare2.mjs — passiv bevakare v2: SKARP matchning (endast rader som
// BEGINS med tidsstämpel + DEPLOYAD/BUNTSLAGSRACE/MISSLYCKADES/KRITISKT), plus
// lås-ledigt-5-min-i-rad som backup-signal. Ingen push, ingen merge.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const LOGG = '/home/ak1a/AK1/data/vakten/prod-synk.log';
// Äkta verdict-rader enligt historik: "YYYY-MM-DDTHH:MM:SSZ DEPLOYAD automatiskt: …"
const VERDICT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z (DEPLOYAD|BUNTSLAGSRACE|KRITISKT|MISSLYCKADES|ARTEFAKT)/;
function las() { try { return fs.readFileSync(LOGG, 'utf8').split('\n').filter(r => r.trim()); } catch { return []; } }
function lasSek() { try { return execFileSync('bash', ['-c', 'flock -w 2 /tmp/ak1a-deploy.lock true && echo LEDIGT || echo UPPTAGET'], { encoding: 'utf8', timeout: 10000 }).trim(); } catch { return '?'; } }

const rader0 = las();
const byggIdx = (() => { for (let i = rader0.length - 1; i >= 0; i--) if (rader0[i].includes('BYGGER FRÅN')) return i; return -1; })();
console.log(`bevakar efter byggrad ${byggIdx + 1} (${rader0[byggIdx] || '?'}) — skarpt verdict-filter`);
let lediga = 0;
for (let i = 0; i < 75; i++) {
  await new Promise(r => setTimeout(r, 60000));
  const nya = las().slice(byggIdx + 1);
  const traff = nya.find(r => VERDICT.test(r));
  if (traff) {
    console.log('== SIGNAL: ÄKTA verdict-rad ==');
    console.log(nya.slice(-5).join('\n'));
    process.exit(0);
  }
  lediga = lasSek() === 'LEDIGT' ? lediga + 1 : 0;
  if (lediga >= 6) {
    console.log('== SIGNAL: låset ledigt 6 min i rad (bygg avslutat, verdict kan saknas) ==');
    console.log(nya.slice(-4).join('\n'));
    process.exit(0);
  }
  if (i % 10 === 9) console.log(`[${i + 1} min] väntar fortfarande (nya rader: ${nya.length}, lås ${lasSek()})`);
}
console.log('TAK 75 MIN — sista rader:'); console.log(las().slice(-4).join('\n'));
