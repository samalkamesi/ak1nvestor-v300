// r325: städcommit av sondskript + byggstatus.
import { execSync } from 'node:child_process';
import fs from 'node:fs';

function kort(cmd, timeoutMs = 420_000) {
  try {
    return { kod: 0, ut: execSync(cmd, { encoding: 'utf8', timeout: timeoutMs, stdio: ['ignore', 'pipe', 'pipe'] }).trim() };
  } catch (e) {
    return { kod: e.status ?? 1, ut: ((e.stdout || '') + (e.stderr || '')).trim() };
  }
}

const add = kort("git add verktyg/_r312-karta.mjs verktyg/_r312-kurera.mjs verktyg/_r312-push.mjs verktyg/_r312-pushbevakare.mjs verktyg/_r312-sond.mjs verktyg/_r312-sond2.mjs verktyg/_r312-sond3.mjs verktyg/_r312-sond4.mjs verktyg/_r312-sond5.mjs verktyg/_r312-sond6.mjs verktyg/_r312-sond7.mjs verktyg/_r312-tsc.mjs verktyg/_r313-slutled.mjs verktyg/_r317-yta.mjs verktyg/_r318-slutled.mjs verktyg/_r320-slutled.mjs verktyg/_r323-slutled.mjs verktyg/_r324-slutled.mjs verktyg/_r325-sond.mjs verktyg/_r325-lackdiag.mjs verktyg/_r325-rotspal.mjs verktyg/_r325-synkpal.mjs verktyg/_r325-byggprov.mjs verktyg/_r325-merge.mjs verktyg/_r325-commitmerge.mjs verktyg/_r325-msg1.txt verktyg/_r325-msg2.txt");
const com = kort('git commit -F verktyg/_r325-msg2.txt');
console.log('städcommit:', com.kod === 0 ? 'OK' : `FEL ${com.kod}`, com.ut.slice(-200));
console.log('HEAD:', kort('git log --oneline -1').ut);
console.log('kvar smutsig:', kort('git status --porcelain | wc -l').ut, 'filer');

// Byggstatus: lever tsc? bytet?
const tsc = kort("ps -o pid,etimes,time -C node --no-headers 2>/dev/null | awk '$2 < 3600' | wc -l").ut;
const bygg = kort(`ps aux | grep -E 'next build|prod-synk' | grep -v grep | awk '{print $2, $9, substr($0, index($0,$11), 60)}' | head -4`).ut;
const buildId = fs.statSync('/home/ak1a/AK1/.next/BUILD_ID');
const nyBuildId = fs.existsSync('/home/ak1a/AK1/.next-ny/BUILD_ID') ? fs.statSync('/home/ak1a/AK1/.next-ny/BUILD_ID').mtime.toISOString() : 'ej ännu';
const synklog = kort(`tail -4 /home/ak1a/AK1/data/vakten/prod-synk.log`).ut;
console.log('\nprod .next BUILD_ID mtime:', buildId.mtime.toISOString());
console.log('.next-ny BUILD_ID:', nyBuildId);
console.log('synklog-svans:\n' + synklog);
console.log('\nbyggprocesser:\n' + (bygg || '(inga)'));
