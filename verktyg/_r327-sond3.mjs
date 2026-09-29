// r327 sond 3: läckrotsutredning — varför 200 trots datumfilter i byggträdet?
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const sh = (cmd, timeout = 20000) => {
  try { return execSync(cmd, { cwd: '/bin', shell: '/bin/bash', encoding: 'utf8', timeout }).trim(); }
  catch (e) { return 'FEL: ' + (e.stdout || e.message).toString().slice(0, 300); }
};

console.log('=== SYNKLOGG (äkta) svans 20 ===');
console.log(sh('tail -20 /home/ak1a/AK1/data/vakten/prod-synk.log'));

console.log('\n=== FILTER I AK1 src/lib/content.ts (HEAD) ===');
console.log(sh("grep -n -B2 -A6 'publishedAt' /home/ak1a/AK1/src/lib/content.ts | head -60"));

console.log('\n=== BLOGG-RUTTENS SIDGENERERING ===');
console.log(sh("ls /home/ak1a/AK1/src/app/blogg/ 2>/dev/null"));
const pageFiles = sh("find /home/ak1a/AK1/src/app/blogg -name 'page.tsx' -o -name 'page.ts' 2>/dev/null");
console.log(pageFiles);
const slugPage = pageFiles.split('\n').find(f => f.includes('['));
if (slugPage && !slugPage.startsWith('FEL')) {
  console.log(`--- ${slugPage} (grep getStaticPaths/generateStaticParams + filter) ---`);
  console.log(sh(`grep -n -A12 'generateStaticParams\\|getStaticPaths' '${slugPage}' | head -40`));
}

console.log('\n=== ÄR SIDAN STATISKT GENERERAD I ARTEFAKTEN? ===');
console.log(sh("ls /home/ak1a/AK1/.next/server/app/blogg/ 2>/dev/null | grep -i 'holm\\|evolution\\|sandvik' | head -10"));

console.log('\n=== PM2-OMSTART vs BYGGTID ===');
console.log(sh("pm2 describe ak1a 2>/dev/null | grep -E 'restart time|uptime' | head -4"));

console.log('\n=== STARTSIDANS JS-REFERENSER (v207-vikt) ===');
const html = sh('curl -s -m 15 http://localhost:3000/');
const srcs = [...html.matchAll(/src="([^"]*_next\/static[^"]*\.js)"/g)].map(m => m[1]);
let tot = 0;
for (const s of srcs) {
  const p = '/home/ak1a/AK1' + s.replace('/_next', '/.next').split('?')[0];
  try { tot += fs.statSync(p).size; } catch {}
}
console.log(`script-src: ${srcs.length} st, sammanlagd buntvikt: ${(tot/1024).toFixed(0)} kB`);
