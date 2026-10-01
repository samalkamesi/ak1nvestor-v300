// _v221-byggbevakare.mjs — polla prod-synk.loggen tills bygget från 02:17:20Z avgjorts
import fs from 'node:fs';

const LOGG = '/home/ak1a/AK1/data/vakten/prod-synk.log';
const STARTRAD = '2026-10-01T02:17:20Z BYGGER FRÅN';
const MALORD = ['byggfel', 'MISSLYCKADES', 'KRITISKT', 'deployad', 'HTTPS', 'DUBBELBYTE', 'omstart', 'patch-kö'];
const TAK_MS = 45 * 60 * 1000;
const start = Date.now();

function lasRader() {
  try { return fs.readFileSync(LOGG, 'utf8').split('\n').filter(r => r.trim()); } catch { return []; }
}

const startIndex = lasRader().findIndex(r => r.startsWith(STARTRAD));
if (startIndex < 0) { console.log('START-RADEN SAKNAS — bygget kan ha avslutats före bevakarstart; senaste rader:'); console.log(lasRader().slice(-5).join('\n')); process.exit(0); }

while (Date.now() - start < TAK_MS) {
  await new Promise(r => setTimeout(r, 30000));
  const rader = lasRader();
  const nya = rader.slice(startIndex + 1);
  const traff = nya.find(r => MALORD.some(o => r.toLowerCase().includes(o.toLowerCase())));
  if (traff) {
    console.log('== BYGGET AVGJORT — nya rader sedan start ==');
    console.log(nya.join('\n'));
    process.exit(0);
  }
}
console.log('TAK 45 MIN PASSERAT — bygget pågår fortfarande (eller loggen tyst). Senaste rader:');
console.log(lasRader().slice(-5).join('\n'));
