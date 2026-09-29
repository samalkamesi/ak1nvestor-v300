// r327 sond 4: hitta blogg-detaljsiderutan + filtergapet
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const sh = (cmd, timeout = 20000) => {
  try { return execSync(cmd, { cwd: '/bin', shell: '/bin/bash', encoding: 'utf8', timeout }).trim(); }
  catch (e) { return 'FEL: ' + (e.stdout || e.message).toString().slice(0, 300); }
};
const AK1 = '/home/ak1a/AK1';

console.log('=== BLOGG-RUTTER i src/app ===');
console.log(sh(`find ${AK1}/src/app -path '*blogg*' -maxdepth 5 | head -20`));

console.log('\n=== ALLA page-filer med bloggkoppling ===');
console.log(sh(`grep -rl 'blogg' ${AK1}/src/app --include='page.tsx' | head -10`));

// Läs detaljsidan om den finns
const kandidater = sh(`find ${AK1}/src/app -path '*blogg*' -name 'page.tsx' | head -5`);
if (kandidater && !kandidater.startsWith('FEL')) {
  for (const f of kandidater.split('\n').filter(Boolean)) {
    console.log(`\n===== ${f} =====`);
    const txt = fs.readFileSync(f, 'utf8');
    console.log(txt.slice(0, 4000));
    console.log(`... (totalt ${txt.length} tecken)`);
  }
}

console.log('\n=== getBloggPost / upslagsfunktioner i content.ts ===');
console.log(sh(`grep -n -A15 'export function getBlogPost\\|export function getBloggPost\\|export function hamtaBlogg' ${AK1}/src/lib/content.ts | head -50`));

console.log('\n=== VEM använder bloggArPublicerad ===');
console.log(sh(`grep -rn 'bloggArPublicerad' ${AK1}/src --include='*.ts*' | head -10`));
