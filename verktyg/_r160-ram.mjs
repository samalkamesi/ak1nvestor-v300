// Rond 160: RAM-mätning + topp-processer (RSS) — vem håller minnet?
import { execFileSync } from 'node:child_process';

const free = execFileSync('free', ['-m'], { encoding: 'utf8' });
console.log('== FREE ==');
console.log(free.split('\n').slice(0, 3).join('\n'));

console.log('\n== TOPP 10 (RSS, MB) ==');
const ps = execFileSync('ps', ['--sort=-rss', '-eo', 'rss,etime,pid,comm,args'], { encoding: 'utf8' });
const rader = ps.split('\n').slice(1, 11);
for (const r of rader) {
  const m = r.trim().match(/^(\d+)\s+(\S+)\s+(\d+)\s+(\S+)\s*(.*)$/);
  if (m) console.log(String(Math.round(m[1] / 1024)).padStart(5), 'MB | ålder', m[2].padEnd(8), '| pid', m[3].padEnd(8), '|', (m[5] || m[4]).slice(0, 90));
}
