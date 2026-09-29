// r327 sond 6: vad serveras FAKTISKT i kroppen + .meta-status + revalidate-spår
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const sh = (cmd, timeout = 25000) => {
  try { return execSync(cmd, { cwd: '/bin', shell: '/bin/bash', encoding: 'utf8', timeout }).trim(); }
  catch (e) { return 'FEL: ' + (e.stdout || e.message).toString().slice(0, 200); }
};

console.log('=== KROPP PÅ /blogg/sa-laser-du-holm-q3-2026 ===');
const kropp = sh("curl -s -m 15 -D /tmp/r327-h.txt http://localhost:3000/blogg/sa-laser-du-holm-q3-2026");
console.log(`kroppstorlek: ${kropp.length} B`);
console.log('title: ' + (kropp.match(/<title>([^<]*)<\/title>/)?.[1] ?? 'SAKNAS'));
console.log('innehåller "Holmens": ' + kropp.includes('Holmens'));
console.log('innehåller "Kunde inte hittas"/"hittades inte"/"404": ' + /hittas inte|hittades inte|404/i.test(kropp));
console.log('--- svarshuvuden (utvalda) ---');
console.log(sh("grep -iE '^(HTTP|x-nextjs|cache|age|content-type|content-length)' /tmp/r327-h.txt"));

console.log('\n=== KROPP PÅ /en/blogg/sa-laser-du-holm-q3-2026 ===');
const kroppEn = sh("curl -s -m 15 http://localhost:3000/en/blogg/sa-laser-du-holm-q3-2026");
console.log(`kroppstorlek: ${kroppEn.length} B`);
console.log('title: ' + (kroppEn.match(/<title>([^<]*)<\/title>/)?.[1] ?? 'SAKNAS'));
console.log('innehåller "Holmens": ' + kroppEn.includes('Holmens'));

console.log('\n=== .meta-FILER: statusmarkering ===');
for (const f of [
  '/home/ak1a/AK1/.next/server/app/blogg/sa-laser-du-holm-q3-2026.meta',
  '/home/ak1a/AK1/.next/server/app/blogg/sa-laser-du-att-rakna-pa-utdelningsaktier.meta',
]) {
  if (fs.existsSync(f)) console.log(`${f.split('/').pop()}: ${fs.readFileSync(f, 'utf8').slice(0, 200)}`);
  else console.log(`${f.split('/').pop()}: FINNS EJ`);
}

console.log('\n=== publik post som kontroll (200 + äkta innehåll väntat) ===');
const ctrl = sh("curl -s -o /dev/null -w '%{http_code}' -m 10 http://localhost:3000/blogg/sa-laser-du-att-rakna-pa-utdelningsaktier");
console.log('kontrollslug (gammal publik post): ' + ctrl);
