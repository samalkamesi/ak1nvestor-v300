// r330: landa fabrikens övergivna yta i AK1 (o558-precedens) + push min yta
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const YTA = '/home/ak1a/agent/ak1';
const AK1 = '/home/ak1a/AK1';
const sh = (cmd, cwd = YTA, timeout = 120000) => {
  try { return execSync(cmd, { cwd, shell: '/bin/bash', encoding: 'utf8', timeout, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim(); }
  catch (e) { return 'FEL: ' + ((e.stdout || '') + (e.stderr || e.message)).split('\n').filter(l => !l.startsWith('hint:') && !l.startsWith(' ')).join(' ').slice(0, 250); }
};

console.log('[AK1] add de tre genererade speglarna');
let ut = sh('git add data/siffror.json public/deep-courses.json public/llms-full.txt', AK1);
if (ut.startsWith('FEL')) { console.log(ut); process.exit(1); }

const msg = 'studio: [organ:Φ] r330 fabrikens övergivna yta landad (o558-precedens) — s4:s sista barn dog före commit av VR-10-kursens GENERERADE speglar: deep-courses.json +880 (publik spegling av vr-10-enhetsmultiplar som landat i s4-commit), llms-full.txt (speglingsrader), siffror.json (raknare) — koherent helhet ur samma kalla, filerna ororda sedan 07:46';
fs.writeFileSync('/tmp/r330-ak1-commitmsg.txt', msg);
console.log('[AK1] commit');
ut = sh('git commit -F /tmp/r330-ak1-commitmsg.txt', AK1);
if (ut.startsWith('FEL')) { console.log(ut); process.exit(1); }
console.log('OK: ' + ut.slice(0, 150));

console.log('\n[AK1] yta efter: ' + (sh('git status --porcelain', AK1) || '(ren)'));

console.log('\n[YTA] push prod develop');
for (let i = 1; i <= 3; i++) {
  const p = sh('git push prod develop');
  if (!p.startsWith('FEL')) {
    console.log('PUSH OK: ' + p.slice(0, 120));
    console.log(sh('git log --oneline -1'));
    process.exit(0);
  }
  console.log(`försök ${i}: ${p.slice(0, 150)}`);
  await new Promise(r => setTimeout(r, 30000));
}
console.log('push fortfarande blockerad — nästa rond tar den');
process.exit(1);
