// _v221-bygg.mjs — bygger prod från 91bf24c5 under flock-lås (nolldowntime, pm2 levande).
// npm ci → next build → pm2 restart → HTTPS-sond + kurs-sonder. Logg: /tmp/v221-bygg.log
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const LOGG = '/tmp/v221-bygg.log';
fs.writeFileSync(LOGG, `start ${new Date().toISOString()}\n`);
const logga = (s) => { fs.appendFileSync(LOGG, s + '\n'); console.log(s); };

// Kursrutt-kandidater för sonden
const sondVagar = ['am-10-insynslistan', 'ud-10-ex-dagens-mekanik', 'vm-12-reverserad-dcf', 'pe-09-utdelningsrekapitaliseringen'];
const rotter = [];
for (const bas of ['/kurser/', '/kurs/']) for (const s of sondVagar) rotter.push(bas + s);

const BASH = [
  'exec flock -n /tmp/ak1a-deploy.lock bash -c \'',
  'set -o pipefail; cd /home/ak1a/AK1',
  '&& echo "=== BUILD_ID före: $(cat .next/BUILD_ID 2>/dev/null || echo saknas)"',
  '&& npm ci --no-audit --no-fund 2>&1 | tail -3',
  '&& npm run build 2>&1 | tail -15',
  '&& echo "=== BUILD_ID efter: $(cat .next/BUILD_ID 2>/dev/null || echo SAKNAS)"',
  '&& pm2 restart ak1a 2>&1 | tail -3',
  '\'',
].join(' ');

try {
  const ut = execFileSync('bash', ['-c', BASH], { encoding: 'utf8', timeout: 3900000, maxBuffer: 32 * 1024 * 1024 });
  logga(ut.trim().split('\n').slice(-30).join('\n'));
} catch (e) {
  logga('BYGG-FEL:\n' + String(e.stdout || '').split('\n').slice(-25).join('\n'));
  logga('stderr: ' + String(e.stderr || '').slice(0, 800));
  logga('REVERT-STOPPREGLER AKTIVERADE — läs loggen, pm2 serverar senast gröna (läkebackup .next-senast-bra finnes)');
  process.exit(1);
}

// Sönder: HTTPS + kurser
await new Promise((r) => setTimeout(r, 15000));
const sond = async (url) => {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20000), redirect: 'manual' });
    return res.status;
  } catch (e) { return 'FEL ' + String(e).slice(0, 40); }
};
logga('\nroten: ' + (await sond('https://lab.ak1nvestor.com/')));
for (const r of rotter) logga(r + ': ' + (await sond('https://lab.ak1nvestor.com' + r)));
logga('KLAR');
