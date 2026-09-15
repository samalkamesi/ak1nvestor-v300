// Rond 40 — gap 25-underlag: registrets fulla post + V4-kapitel + befintlig V4-kod
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const ARB = '/home/ak1a/agent/ak1';
const rad = (t) => console.log(t);

// 1. Kallkods-kapitlen — vilket täcker V4/resync?
const kk = path.join(ARB, 'data/forskning/zcode-kallkod');
try {
  for (const f of fs.readdirSync(kk)) {
    const txt = fs.readFileSync(path.join(kk, f), 'utf8');
    const traffar = (txt.match(/resync|initialWires/gi) || []).length;
    if (traffar > 0) rad(`${f}: ${traffar} resync/initialWires-träffar`);
  }
} catch (e) { rad('kallkod: ' + e.message); }

// 2. Befintlig V4-kod i src
try {
  const ut = execSync('grep -rln "v4\\|V4" src/lib src/app/api/studio --include="*.ts" --include="*.tsx" 2>/dev/null | head -20', { cwd: ARB, encoding: 'utf8' }).trim();
  rad('=== V4-refererande filer ===');
  rad(ut || '(inga)');
} catch { rad('V4-sökning: inga träffar'); }

// 3. Transportlagret — hur ser lasV4Anvandning ut (våg 169:s mönster att följa)?
try {
  const ut = execSync('grep -rln "lasV4Anvandning\\|Anvandning" src/lib --include="*.ts" | head -5', { cwd: ARB, encoding: 'utf8' }).trim();
  rad('lasV4-funktionens fil: ' + (ut || '(hitta ej)'));
} catch { rad('lasV4: ej funnen i src/lib'); }
