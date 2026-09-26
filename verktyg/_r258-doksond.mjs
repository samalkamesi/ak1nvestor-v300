// v174 dokvåg — sondera SYSTEMKARTAN + DRIFTSBOKEN: läge, ålder, struktur
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const rot = '/home/ak1a/agent/ak1';
let traf = '';
try { traf = execSync('find ' + rot + '/data ' + rot + '/docs -maxdepth 3 -type f \\( -iname "*systemkarta*" -o -iname "*driftsbok*" \\) -not -path "*/node_modules/*" 2>/dev/null', { encoding: 'utf8', timeout: 20000 }); } catch (e) { traf = ''; }
if (!traf.trim()) {
  try { traf = execSync('find ' + rot + ' -maxdepth 2 -type f \\( -iname "*systemkarta*" -o -iname "*driftsbok*" \\) -not -path "*/node_modules/*" 2>/dev/null', { encoding: 'utf8', timeout: 20000 }); } catch (e) {}
}
const filer = traf.split('\n').filter(Boolean);
console.log('TRAFFADE:', JSON.stringify(filer, null, 1));
for (const f of filer) {
  const stat = fs.statSync(f);
  const txt = fs.readFileSync(f, 'utf8');
  const rader = txt.split('\n');
  console.log('\n=== ' + path.basename(f) + ' | ' + rader.length + ' rader | mtime ' + stat.mtime.toISOString().slice(0, 16) + ' ===');
  // rubriker (## ) för struktur
  const rubriker = rader.filter(r => r.startsWith('## ')).slice(0, 30);
  console.log('Rubriker:', rubriker.join(' | ').slice(0, 600));
  console.log('Sista 3 raderna:', JSON.stringify(rader.slice(-3)).slice(0, 400));
}
// git-logg för dokumenten: senaste commit som rörde dem
for (const f of filer) {
  try {
    const logg = execSync('git -C ' + rot + ' log -1 --format="%h %ad %s" --date=format-local:"%m-%d %H:%M" -- ' + f, { encoding: 'utf8', timeout: 15000 }).trim();
    console.log('GIT ' + path.basename(f) + ': ' + logg.slice(0, 140));
  } catch (e) { console.log('GIT ' + path.basename(f) + ': FEL'); }
}
