// r332 drifttest (v211): märk AK1:s tre framtids-.meta 404 + mät effekt (ev. omstart)
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const sh = (cmd, timeout = 60000) => {
  try { return execSync(cmd, { cwd: '/bin', shell: '/bin/bash', encoding: 'utf8', timeout }).trim(); }
  catch (e) { return 'FEL: ' + (e.stdout || e.message).toString().slice(0, 250); }
};
const AK1 = '/home/ak1a/AK1';

console.log('=== FÖRKONTROLL: deploylås + byggprocesser ===');
const lås = sh('ls -la /tmp/ak1a-deploy.lock 2>/dev/null || echo fritt');
const bygg = sh("ps aux | grep -E 'next[- ]build' | grep -v grep | wc -l");
console.log(`lås: ${lås} · byggprocesser: ${bygg}`);

console.log('\n=== MÄRK DE TRE .meta (samma logik som verktyget) ===');
const idag = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', dateStyle: 'short' }).format(new Date());
const slugar = [];
for (const f of fs.readdirSync(`${AK1}/data/blogg`)) {
  if (!f.endsWith('.json')) continue;
  const p = JSON.parse(fs.readFileSync(`${AK1}/data/blogg/${f}`, 'utf8'));
  const d = String(p.publishedAt ?? '').slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(d) && d > idag) slugar.push(p.slug);
}
console.log(`framtids-slugar (idag ${idag}): ${slugar.join(', ')}`);
for (const slug of slugar) {
  const meta = `${AK1}/.next/server/app/blogg/${slug}.meta`;
  if (!fs.existsSync(meta)) { console.log(`${slug}: ingen statisk plats`); continue; }
  const j = JSON.parse(fs.readFileSync(meta, 'utf8'));
  if (j.status === 404) { console.log(`${slug}: redan märkt`); continue; }
  j.status = 404;
  fs.writeFileSync(meta, JSON.stringify(j, null, 2) + '\n');
  console.log(`${slug}: MÄRKT 404`);
}

console.log('\n=== MÄT: HTTP-kod direkt (process-cache?) ===');
await new Promise(r => setTimeout(r, 2000));
for (const slug of slugar) {
  console.log(`${slug}: ${sh(`curl -s -o /dev/null -w '%{http_code}' -m 10 http://localhost:3000/blogg/${slug}`)}`);
}
const kontroll = sh("curl -s -o /dev/null -w '%{http_code}' -m 10 http://localhost:3000/blogg/aktieanalys-steg-for-steg");
console.log(`kontroll (publik, väntas 200): ${kontroll}`);

console.log('\nOm fortfarande 200: process-minnescache — EN omstart ak1a krävs för driftbevis.');
console.log('Beslut om omstart fattas efter utdata ovan (låset var ' + (lås === 'fritt' ? 'fritt' : 'UPPTAGET') + ').');
