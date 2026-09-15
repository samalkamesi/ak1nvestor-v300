// Rond 40 — live-bevis för våg 172 (gap 25 resync): rutt i prod-träd + live-svar,
// bygg efter commit, ancestor, prod 200 + registrets faktiska rader (för landa-regex).
import { execSync } from 'node:child_process';
import fs from 'node:fs';
const ARB = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const rad = (t) => console.log(t);

// 1. Ruttfil i prod-trädet
const ruta = PROD + '/src/app/api/studio/tjanster/resync-v4/route.ts';
rad('ruttfil prod finns: ' + fs.existsSync(ruta));
if (fs.existsSync(ruta)) rad('ruttfil innehåller requireAdmin: ' + fs.readFileSync(ruta, 'utf8').includes('requireAdmin'));

// 2. Ancestor + HEAD
try { execSync(`git -C ${PROD} merge-base --is-ancestor 2cf13fe5 HEAD`); rad('2cf13fe5 är ancestor till prod HEAD: JA'); }
catch { rad('2cf13fe5 ancestor: NEJ'); }
rad('prod HEAD: ' + execSync(`git -C ${PROD} log -1 --format=%h`, { encoding: 'utf8' }).trim());

// 3. Bygg vs commit
try {
  const st = fs.statSync(PROD + '/.next/BUILD_ID');
  const ct = new Date(execSync(`git -C ${PROD} log -1 --format=%cI 2cf13fe5`, { encoding: 'utf8' }).trim());
  rad('BUILD_ID mtime: ' + st.mtime.toISOString() + ' | commit 2cf13fe5: ' + ct.toISOString());
  rad('bygg EFTER commit: ' + (st.mtime > ct));
} catch (e) { rad('bygg-koll fel: ' + e.message); }

// 4. Rutt live (GET; 401=härdad monterad, 405=monterad metodfel, 404=ostängd)
for (const met of ['GET', 'POST']) {
  try {
    const s = execSync(`curl -s -o /dev/null -w "%{http_code}" -X ${met} http://localhost:3000/api/studio/tjanster/resync-v4`, { encoding: 'utf8' }).trim();
    rad(`rutt localhost ${met}: ${s}`);
  } catch (e) { rad(`rutt ${met}-fel: ` + e.message); }
}

// 5. Prod 200
try { rad('prod https: ' + execSync('curl -s -o /dev/null -w "%{http_code}" https://lab.ak1nvestor.com/', { encoding: 'utf8' }).trim()); }
catch (e) { rad('prod-fel: ' + e.message); }

// 6. Registrets faktiska rader (rad 25 + Återstår-footer) för landa-regex-validering
const reg = fs.readFileSync(ARB + '/data/forskning/ZCODE-GAP-REGISTER.md', 'utf8').split('\n');
reg.forEach((r, i) => { if (/^\| 25 \|/.test(r)) rad('REGISTERRAD ' + (i + 1) + ': ' + r); });
const fi = reg.findIndex((r) => r.includes('Återstår'));
if (fi >= 0) for (let k = fi; k < Math.min(fi + 4, reg.length); k++) rad('FOOTER ' + (k + 1) + ': ' + reg[k]);
else rad('FOOTER: ingen "Återstår"-rad hittad');
