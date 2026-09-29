// r325: commit rond-bokföring + bytstatus.
import { execSync } from 'node:child_process';
import fs from 'node:fs';

function kort(cmd, timeoutMs = 420_000) {
  try {
    return { kod: 0, ut: execSync(cmd, { encoding: 'utf8', timeout: timeoutMs, stdio: ['ignore', 'pipe', 'pipe'] }).trim() };
  } catch (e) {
    return { kod: e.status ?? 1, ut: ((e.stdout || '') + (e.stderr || '')).trim() };
  }
}

const add = kort('git add worklog.md verktyg/_r325-stad.mjs verktyg/_r325-lackdiag.mjs');
const com = kort('git commit -m "studio: [organ:Φ] r325 emottagsrond — 12 fabrikscommits hem; FYND läckagets rot (02:07-trädets deploy saknade datumfiltret) + nattens kraschvaktincident bokförd; strömkvitto GRÖN; bytvakt pågår"');
console.log('commit:', com.kod === 0 ? 'OK' : `FEL ${com.kod}`, com.ut.slice(-150));
console.log('HEAD:', kort('git log --oneline -1').ut);
console.log('smutsig:', kort('git status --porcelain | wc -l').ut, 'filer');

console.log('\n=== BYTSTATUS ===');
console.log('prod .next BUILD_ID:', fs.statSync('/home/ak1a/AK1/.next/BUILD_ID').mtime.toISOString());
console.log('.next-ny BUILD_ID:', fs.existsSync('/home/ak1a/AK1/.next-ny/BUILD_ID') ? fs.statSync('/home/ak1a/AK1/.next-ny/BUILD_ID').mtime.toISOString() : 'borta (byte skett?)');
console.log('\nsynklog-svans:');
console.log(kort('tail -6 /home/ak1a/AK1/data/vakten/prod-synk.log').ut);
