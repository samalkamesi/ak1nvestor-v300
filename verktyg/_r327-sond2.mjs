// r327 sond 2: läckage + synklogg + byggprocesser + prefetch-eftermätning (v207)
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const run = (cmd, timeout = 20000) => {
  try { return execSync(cmd, { encoding: 'utf8', timeout }).trim(); }
  catch (e) { return 'FEL: ' + (e.stdout || e.message).toString().slice(0, 200); }
};
const sh = (cmd, timeout = 20000) => {
  try { return execSync(cmd, { cwd: '/bin', shell: '/bin/bash', encoding: 'utf8', timeout }).trim(); }
  catch (e) { return 'FEL: ' + (e.stdout || e.message).toString().slice(0, 200); }
};

console.log('=== LÄCKAGESLUGAR (skall vara 404 före 2026-10-21) ===');
for (const slug of ['sa-laser-du-holm-q3-2026', 'sa-laser-du-evolution-q3-2026', 'sa-laser-du-sandvik-q3-2026']) {
  const kod = sh(`curl -s -o /dev/null -w '%{http_code}' -m 10 http://localhost:3000/blogg/${slug}`);
  console.log(`${slug}: ${kod}`);
}

console.log('\n=== SYNKLOGG (sök) ===');
const found = sh("find /home/ak1a/AK1 -maxdepth 4 -name '*prod-synk*' -mmin -600 2>/dev/null | head -5");
console.log(found || 'inga färska träffar');
if (found && !found.startsWith('FEL')) {
  const first = found.split('\n')[0];
  console.log('--- svans ---');
  console.log(sh(`tail -12 '${first}'`));
}

console.log('\n=== PÅGÅENDE BYGGPROCESSER ===');
console.log(sh("ps aux | grep -E 'next[- ]build|next build' | grep -v grep | awk '{print $2, $9, substr($0, index($0,$11), 120)}' | head -5") || 'inga');

console.log('\n=== DEPLOYVAKT I AK1 ===');
try {
  const f = fs.readdirSync('/home/ak1a/AK1/data/vakten').filter(f => f.includes('r326') || f.includes('deployvakt'));
  console.log(f.join('\n') || 'inga r326/deployvakt-filer i AK1');
} catch (e) { console.log('FEL: ' + e.message); }

console.log('\n=== V207 PREFETCH-EFTERMÄTNING (serverad startsida) ===');
const html = sh('curl -s -m 15 http://localhost:3000/');
if (!html.startsWith('FEL')) {
  const prefetches = (html.match(/<link[^>]*rel="prefetch"[^>]*>/g) || []);
  console.log(`HTML ${html.length} B, prefetch-länkar: ${prefetches.length}`);
  const tunga = prefetches.filter(p => /\/dataset|\/kurser|\/analys|\/blogg/.test(p));
  console.log('varav tunga rutter (dataset/kurser/analys/blogg): ' + tunga.length);
  tunga.slice(0, 6).forEach(p => console.log('  ' + p.match(/href="[^"]*"/)?.[0]));
} else { console.log(html); }

console.log('\n=== PM2 KORT ===');
console.log(sh("pm2 jlist 2>/dev/null | node -e \"const d=JSON.parse(require('fs').readFileSync(0,'utf8'));d.forEach(p=>console.log(p.name, p.pm2_env.status, 'restarts:'+p.pm2_env.restart_time))\""));
