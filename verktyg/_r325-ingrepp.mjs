// r325: INGREPP — eget atombyte av synkens KLARA .next-ny-bygg under flock.
// Väntar in bygg-klart (riktig procescheck), flyger ALDRIG på halva bygget.
// Mönster: r322-kuren (.next-ny + atombyte + pm2 restart under flock).
import { execSync } from 'node:child_process';
import fs from 'node:fs';

function kort(cmd, timeoutMs = 60_000) {
  try {
    return { kod: 0, ut: execSync(cmd, { encoding: 'utf8', timeout: timeoutMs, stdio: ['ignore', 'pipe', 'pipe'] }).trim() };
  } catch (e) {
    return { kod: e.status ?? 1, ut: ((e.stdout || '') + (e.stderr || '')).trim() };
  }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const AK1 = '/home/ak1a/AK1';

// Riktig byggprocesscheck: node/sh-processer vars KOMMANDO (ej prompttext) är next-build
function byggerJustNu() {
  const rader = kort('ps -eo pid,args --no-headers').ut.split('\n');
  return rader.filter((l) => {
    if (/grep|zcode -p/.test(l)) return false; // prompt-förorening hos fabriksbarn
    return /next[ /]build|\.next-ny\/build\/chunks|prod-synk\.mjs/.test(l);
  });
}

const START = Date.now();
while (Date.now() - START < 8 * 60_000) {
  const b = byggerJustNu();
  const nyBuild = fs.existsSync(`${AK1}/.next-ny/BUILD_ID`) ? fs.statSync(`${AK1}/.next-ny/BUILD_ID`).mtimeMs : 0;
  const klartEfter0517 = nyBuild > Date.parse('2026-09-29T05:17:15Z');
  if (b.length === 0 && klartEfter0517) {
    console.log(`${new Date().toISOString()} bygg KLART (BUILD_ID ${new Date(nyBuild).toISOString()}) och inga byggprocesser — förbereder byte`);
    break;
  }
  if (Date.now() - START % 120_000 < 1_500) console.log(`${new Date().toISOString()} väntar bygg-klart (${b.length} byggprocesser, .next-ny ${nyBuild ? new Date(nyBuild).toISOString() : 'ej'})`);
  await sleep(20_000);
  if (Date.now() - START >= 8 * 60_000) { console.log('fönster slut — kör igen'); process.exit(0); }
}

// flock-frihet (vägrar om upptaget)
const las = kort('exec flock -n /tmp/ak1a-deploy.lock -c true').kod;
if (las !== 0) { console.log('DEPLOY-LÅSET UPPPTAGET — avbryter (synken/kraschvakten äger fönstret)'); process.exit(1); }

// Atombytet UNDER lås (held flock under hela sekvensen)
console.log('lås fritt — byte påbörjas');
const byte = kort(`exec flock /tmp/ak1a-deploy.lock -c 'cd ${AK1} && mv .next .next-r325-gammal && mv .next-ny .next && pm2 restart ak1a'`, 120_000);
console.log('byte:', byte.kod === 0 ? 'OK' : `FEL ${byte.kod}`, byte.ut.slice(0, 300));
if (byte.kod !== 0) {
  const ater = kort(`exec flock /tmp/ak1a-deploy.lock -c 'cd ${AK1} && mv .next .next-ny 2>/dev/null; mv .next-r325-gammal .next 2>/dev/null; pm2 restart ak1a'`, 120_000);
  console.log('ÅTERSTÄLLNING:', ater.kod === 0 ? 'körd' : 'FEL', ater.ut.slice(0, 200));
  process.exit(1);
}

await sleep(10_000);
const lokal = kort(`curl -s -o /dev/null -w '%{http_code}' --max-time 20 http://localhost:3000/`).ut;
const framtid = kort(`curl -s -o /dev/null -w '%{http_code}' --max-time 20 https://lab.ak1nvestor.com/blogg/sa-laser-du-holm-q3-2026`).ut;
const start = kort(`curl -s -o /dev/null -w '%{http_code}' --max-time 20 https://lab.ak1nvestor.com/`).ut;
console.log(`VERIFIKATION: localhost=${lokal} · startsida=${start} · framtidslug=${framtid}`);

const kvito = {
  ts: new Date().toISOString(),
  ingrepp: 'r325 eget atombyte av synkens klara .next-ny (7dad3195-bygget) under flock — motiverat av läckaget + fabrikens race-cykler',
  localhost: lokal, startsida: start, framtidslug: framtid,
};
fs.writeFileSync('data/vakten/r325-ingrepp-kvito.json', JSON.stringify(kvito, null, 1) + '\n');
console.log('kvitto: data/vakten/r325-ingrepp-kvito.json');
console.log(framtid === '404' && start === '200' ? 'LÄCKAGET TÄPPT — PROD FRISK' : 'AVVIKELSE — fortsätt diagnostik');
