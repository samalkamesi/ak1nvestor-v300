// Rond 149-räddningsbygg: flock → npm run build (beroenden friska) → pm2 restart ENDAST vid grönt → verifiera
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const A = '/home/ak1a/agent/ak1';
const LAS = '/tmp/ak1a-deploy.lock';
const S = (cmd, args, t = 60000) => { try { return execFileSync(cmd, args, { encoding: 'utf8', timeout: t, cwd: A, maxBuffer: 96 * 1024 * 1024 }); } catch (e) { return 'FEL: ' + (e.message || '').slice(0, 400); } };
const ramMB = () => Math.round(+(fs.readFileSync('/proc/meminfo', 'utf8').match(/MemAvailable:\s+(\d+) kB/) || [0, 0])[1] / 1024);
const ut = { nu: new Date().toISOString() };

// (1) RAM-grind
ut.ramFore = ramMB();
if (ut.ramFore < 3300) { ut.abrott = 'RAM ' + ut.ramFore + ' MB < 3300 — avbryter'; console.log(JSON.stringify(ut, null, 1)); process.exit(2); }

// (2) räddningsbygg: npm ci EJ behövs (node_modules intakt — synkens 19:27-ci landade),
//     &&-kedja: pm2 restart endast vid grönt bygg; flock -w 300 väntar ut ev. synk-poll
const BYGG = 'cd /home/ak1a/AK1 && npm run build && pm2 restart ak1a';
const t0 = Date.now();
ut.bygg = S('flock', ['-w', '300', LAS, 'bash', '-c', BYGG], 560000);
ut.byggSek = Math.round((Date.now() - t0) / 1000);
ut.byggSvans = (ut.bygg || '').split('\n').filter(r => /Compiled|error|Error|ak1a|online|✓|Generating/i.test(r)).slice(-10);

// (3) verifiera: BUILD_ID + prod + snitt + API nya formen
try { const st = fs.statSync('/home/ak1a/AK1/.next/BUILD_ID'); ut.buildId = 'FINNS (' + Math.round((Date.now() - st.mtimeMs) / 60000) + ' min)'; } catch { ut.buildId = 'SAKNAS fortfarande'; }
await new Promise(r => setTimeout(r, 7000));
ut.url = {};
for (const u of ['https://lab.ak1nvestor.com/', 'https://lab.ak1nvestor.com/rapportakademin']) ut.url[u] = S('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', '--max-time', '20', u]);
ut.apiStatus = S('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', '--max-time', '15', 'http://localhost:3000/api/rapportakademin/pass?slug=abb-ar-2025']);
ut.apiKropp = S('curl', ['-s', '--max-time', '15', 'http://localhost:3000/api/rapportakademin/pass?slug=abb-ar-2025']).slice(0, 140);
ut.ramEfter = ramMB();
console.log(JSON.stringify(ut, null, 1));
