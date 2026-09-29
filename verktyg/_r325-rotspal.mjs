// r325: var bor datumfiltret + lever prod-synken?
import { execSync } from 'node:child_process';
import fs from 'node:fs';

function kort(cmd, timeoutMs = 60_000) {
  try {
    return { kod: 0, ut: execSync(cmd, { encoding: 'utf8', timeout: timeoutMs, stdio: ['ignore', 'pipe', 'pipe'] }).trim() };
  } catch (e) {
    return { kod: e.status ?? 1, ut: ((e.stdout || '') + (e.stderr || '')).trim() };
  }
}

const AK1 = '/home/ak1a/AK1';

// 1. Var är getBlogPosts + publishedAt i AK1-trädet (i 847185f8)?
const iCommit = kort(`git -C ${AK1} show --stat --format='%ci' 847185f8`).ut;
const filtrat = kort(`git -C ${AK1} grep -n 'publishedAt' 847185f8 -- 'src/**/*.ts' | head -10`).ut;

// 2. I AK1:s ARBETSTRÄD (HEAD = 847185f8): finns filtret på disk?
const paDisk = kort(`grep -rn 'publishedAt' ${AK1}/src/lib/blogg/ 2>/dev/null | head -6`).ut || '(inga träffar i src/lib/blogg)';

// 3. Prod-synken: hitta skript + logg
const synkKandidater = kort(`ls ${AK1}/data/infra/contabo/ 2>/dev/null; ls data/infra/contabo/ 2>/dev/null | head -20`).ut;
const hittaSynk = kort(`find /home/ak1a -maxdepth 4 -name '*prod-synk*' -mmin -600 2>/dev/null | head`).ut || '(ingen färsk prod-synk-fil i /home/ak1a, djup 4, 10 h)';
const cron = kort(`crontab -l 2>/dev/null | grep -iE 'synk|deploy' | head`).ut || '(ingen synk-rad i crontab)';

console.log('=== 847185f8:s filer ===');
console.log(iCommit.slice(0, 800));
console.log('\n=== publishedAt i commit 847185f8 ===');
console.log(filtrat.slice(0, 600) || '(inga träffar i commiten!)');
console.log('\n=== publishedAt på AK1-disk (HEAD) ===');
console.log(paDisk);
console.log('\n=== data/infra/contabo ===');
console.log(synkKandidater);
console.log('\n=== färska prod-synk-spår ===');
console.log(hittaSynk);
console.log('\n=== crontab synk/deploy ===');
console.log(cron);
