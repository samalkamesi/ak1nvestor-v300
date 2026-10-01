// _v221-prodstatus.mjs — läser prod-ytans (smutsiga) filer via node-kanalen.
import { execFileSync } from 'node:child_process';
const PROD = '/home/ak1a/AK1';
try {
  const ut = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8', timeout: 15000, cwd: PROD });
  const rader = ut.trim().split('\n').filter(Boolean);
  console.log(`SMUTSIGA: ${rader.length}`);
  for (const r of rader.slice(0, 40)) console.log(r);
} catch (e) {
  console.log('FEL: ' + e.message);
}
