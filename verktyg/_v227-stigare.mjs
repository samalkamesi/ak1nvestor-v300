// Sond v227: klocka + prod-HEAD + prod-synkloggslut (återkommande stigare)
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

console.log('nu:', new Date().toISOString());
console.log('prod HEAD:', execFileSync('git', ['-C', '/home/ak1a/AK1', 'log', '--oneline', '-1'], { encoding: 'utf8' }).trim().slice(0, 90));
try {
  const logg = readFileSync('/home/ak1a/AK1/data/vakten/prod-synk.log', 'utf8');
  const rader = logg.trim().split('\n');
  console.log('— prod-synk.log (sista 12) —');
  for (const r of rader.slice(-12)) console.log(r.slice(0, 160));
} catch (e) {
  console.log('synklogg oläslig:', String(e).slice(0, 80));
}
