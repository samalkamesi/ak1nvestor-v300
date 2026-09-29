// r327 sond 5: detaljsidans renderingsfunktion + speglarnas HTTP-koder + artefakt-HTML-riktighet
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const sh = (cmd, timeout = 20000) => {
  try { return execSync(cmd, { cwd: '/bin', shell: '/bin/bash', encoding: 'utf8', timeout }).trim(); }
  catch (e) { return 'FEL: ' + (e.stdout || e.message).toString().slice(0, 200); }
};

const txt = fs.readFileSync('/home/ak1a/AK1/src/app/(huvud)/blogg/[slug]/page.tsx', 'utf8');
const i = txt.indexOf('export default');
console.log('===== DETALJSIDANS RENDERING (default-export) =====');
console.log(txt.slice(i, i + 3000));

console.log('\n===== ARTEFAKTENS HTML FÖR HOLM — riktigt innehåll eller 404-skal? =====');
const p = '/home/ak1a/AK1/.next/server/app/blogg/sa-laser-du-holm-q3-2026.html';
if (fs.existsSync(p)) {
  const html = fs.readFileSync(p, 'utf8');
  console.log(`storlek: ${html.length} B`);
  console.log('title: ' + (html.match(/<title>([^<]*)<\/title>/)?.[1] ?? 'SAKNAS'));
  console.log('innehåller "Holmens": ' + html.includes('Holmens'));
} else {
  console.log('HTML saknas i artefakten');
}

console.log('\n===== SPEGLARNAS HTTP-KODER (on-demand, borde 404) =====');
for (const url of [
  'http://localhost:3000/en/blogg/sa-laser-du-holm-q3-2026',
  'http://localhost:3000/ar/blogg/sa-laser-du-holm-q3-2026',
]) {
  console.log(`${url}: ${sh("curl -s -o /dev/null -w '%{http_code}' -m 10 '" + url + "'")}`);
}

console.log('\n===== LISTVYORNA — läcker framtidsposten där? =====');
const listSv = sh('curl -s -m 15 http://localhost:3000/blogg');
console.log(`/blogg innehåller 'Holmens delårsrapport': ${listSv.includes('Holmens delårsrapport')}`);
const hem = sh('curl -s -m 15 http://localhost:3000/');
console.log(`/ innehåller 'Holmens delårsrapport': ${hem.includes('Holmens delårsrapport')}`);
