// v206 (r312): tsc-grind — resultat till disk (studio-skalets 30 s-fönster)
import { execSync } from 'node:child_process';
import fs from 'node:fs';

let ut = '';
let kod = 0;
try {
  ut = execSync('npx tsc --noEmit 2>&1', { encoding: 'utf8', timeout: 280000, maxBuffer: 32 * 1024 * 1024 });
} catch (e) {
  kod = e.status ?? 1;
  ut = (e.stdout || '') + (e.stderr || '');
}
const felrader = ut.split('\n').filter((l) => /error TS/.test(l));
fs.writeFileSync(
  'data/vakten/_r312-tsc.txt',
  `exit=${kod}\nfel=${felrader.length}\n${ut}\n`
);
console.log(`exit=${kod} fel=${felrader.length}`);
if (felrader.length) console.log(felrader.slice(0, 10).join('\n'));
