// Räddningsbygg 2: ren .next (halvriven sedan 18:46) + heap-tak → flock-bygg → pm2 restart vid grönt → verifiera
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const A = '/home/ak1a/agent/ak1';
const LAS = '/tmp/ak1a-deploy.lock';
const S = (cmd, args, t = 60000) => { try { return execFileSync(cmd, args, { encoding: 'utf8', timeout: t, cwd: A, maxBuffer: 96 * 1024 * 1024 }); } catch (e) { return 'FEL: ' + (e.message || '').slice(0, 400); } };
const ramMB = () => Math.round(+(fs.readFileSync('/proc/meminfo', 'utf8').match(/MemAvailable:\s+(\d+) kB/) || [0, 0])[1] / 1024);
const ut = { nu: new Date().toISOString() };

ut.ramFore = ramMB();
if (ut.ramFore < 3400) { ut.abrott = 'RAM ' + ut.ramFore + ' < 3400'; console.log(JSON.stringify(ut, null, 1)); process.exit(2); }

// (1) rena det halvrivna .next — pm2 serverar från minnet; det döda bygget kan inte bli sämre
ut.dotNextFanns = fs.existsSync('/home/ak1a/AK1/.next');
ut.rensning = S('rm', ['-rf', '/home/ak1a/AK1/.next'], 30000) === '' ? 'OK' : 'FEL';

// (2) flock-bygg med heap-tak; pm2 restart ENDAST vid grönt (&&-kedjan)
const BYGG = 'cd /home/ak1a/AK1 && NODE_OPTIONS="--max-old-space-size=3072" npm run build && pm2 restart ak1a';
const t0 = Date.now();
ut.bygg = S('flock', ['-w', '300', LAS, 'bash', '-c', BYGG], 560000);
ut.byggSek = Math.round((Date.now() - t0) / 1000);
ut.gron = !/FEL|Killed/i.test(ut.bygg) && /✓|Compiled/i.test(ut.bygg || '');
ut.byggSvans = (ut.bygg || '').split('\n').filter(r => /✓|error|Error|Killed|ak1a|online|Generating|static/i.test(r)).slice(-12);

// (3) verifiera
try { const st = fs.statSync('/home/ak1a/AK1/.next/BUILD_ID'); ut.buildId = 'FINNS'; } catch { ut.buildId = 'SAKNAS'; }
if (ut.gron) {
  await new Promise(r => setTimeout(r, 7000));
  ut.url = {};
  for (const u of ['https://lab.ak1nvestor.com/', 'https://lab.ak1nvestor.com/rapportakademin']) ut.url[u] = S('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', '--max-time', '20', u]);
  ut.apiStatus = S('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', '--max-time', '15', 'http://localhost:3000/api/rapportakademin/pass?slug=abb-ar-2025']);
  ut.apiKropp = S('curl', ['-s', '--max-time', '15', 'http://localhost:3000/api/rapportakademin/pass?slug=abb-ar-2025']).slice(0, 140);
}
ut.ramEfter = ramMB();
console.log(JSON.stringify(ut, null, 1));
