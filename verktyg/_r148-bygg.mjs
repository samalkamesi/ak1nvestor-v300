// Rond 148-kur del B: RAM-grind → flock-bygg i prod-trädet → verifiera
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const A = '/home/ak1a/agent/ak1';
const P = '/home/ak1a/AK1';
const LAS = '/tmp/ak1a-deploy.lock';
const S = (cwd, cmd, args, t = 60000) => { try { return execFileSync(cmd, args, { encoding: 'utf8', timeout: t, cwd, maxBuffer: 96 * 1024 * 1024 }); } catch (e) { return 'FEL: ' + (e.message || '').slice(0, 400); } };
const ramMB = () => Math.round(+(fs.readFileSync('/proc/meminfo', 'utf8').match(/MemAvailable:\s+(\d+) kB/) || [0, 0])[1] / 1024);
const ut = { nu: new Date().toISOString(), steg: [] };

// (1) RAM-grind: bygg kräver ~3,2 GB fritt — vänta max 5 min på fönster
for (let i = 1; i <= 6; i++) {
  ut.ramFore = ramMB();
  if (ut.ramFore >= 3300) break;
  if (i === 6) { ut.abrott = 'RAM-fönster öppnade sig ej (' + ut.ramFore + ' MB) — bygg köas till nästa rond'; console.log(JSON.stringify(ut, null, 1)); process.exit(2); }
  await new Promise(r => setTimeout(r, 60000));
}

// (2) flock-bygg (ALDRIG olåst): npm ci + build + pm2 restart
const BYGG = 'cd /home/ak1a/AK1 && npm ci --no-audit --no-fund && npm run build && pm2 restart ak1a';
const start = Date.now();
ut.bygg = S(A, 'flock', ['-w', '480', LAS, 'bash', '-c', BYGG], 540000);
ut.byggSek = Math.round((Date.now() - start) / 1000);
ut.byggGrön = !/FEL/.test(ut.bygg) || /Compiled successfully|✓|restart/i.test(ut.bygg);
ut.byggSvans = (ut.bygg || '').split('\n').filter(r => /Compiled|error|Error|ak1a|online|warn/i.test(r)).slice(-8);

// (3) verifiera: prod + snitt + API-kontraktet (200+kod utan kaka)
await new Promise(r => setTimeout(r, 6000));
ut.url = {};
for (const u of ['https://lab.ak1nvestor.com/', 'https://lab.ak1nvestor.com/rapportakademin']) {
  ut.url[u] = S(A, 'curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', '--max-time', '20', u]);
}
ut.apiKod = S(A, 'curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', '--max-time', '15', 'http://localhost:3000/api/rapportakademin/pass?slug=abb-ar-2025']);
ut.apiKropp = S(A, 'curl', ['-s', '--max-time', '15', 'http://localhost:3000/api/rapportakademin/pass?slug=abb-ar-2025']).slice(0, 160);
ut.ramEfter = ramMB();
console.log(JSON.stringify(ut, null, 1));
