// _s7u3o129-poll.mjs — lätt pollare av prod-synk.log: väntar på DEPLOYAD-rad
// med 01b71b82 (eller senare) som förfader. Skriver kompakt status; avslutar
// frivilligt efter ~4 min. Ingen Chrome, ingen tung last (RAM-läget känsligt).
import fs from 'node:fs';
const LOG = '/home/ak1a/AK1/data/vakten/prod-synk.log';
const SLUT = Date.now() + 4 * 60 * 1000;
let senasteRad = '';
while (Date.now() < SLUT) {
  const txt = fs.readFileSync(LOG, 'utf8');
  const rader = txt.trimEnd().split('\n');
  const sist = rader[rader.length - 1] || '';
  if (sist !== senasteRad) {
    senasteRad = sist;
    console.log(new Date().toISOString().slice(11, 19), '|', sist);
    if (/DEPLOYAD/.test(sist)) {
      console.log('DEPLOY-GRIND ÖPPEN — kontrollera förfaderskap manuellt.');
      process.exit(0);
    }
  }
  await new Promise(r => setTimeout(r, 20000));
}
console.log('POLL-FÖNSTER SLUT (4 min) — senaste rad:', senasteRad);
