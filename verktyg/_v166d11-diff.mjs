// Diagnos: varför fallerar d11 append-only? Jämför HEAD vs arbetsyta kapitel-för-kapitel
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
const SOKVAG = 'data/bokmaster/martin-pring-on-market-momentum.json';
const nu = JSON.parse(fs.readFileSync(SOKVAG, 'utf8'));
const gamla = JSON.parse(execFileSync('git', ['show', `HEAD:${SOKVAG}`], { encoding: 'utf8' }));
console.log('HEAD chapters:', gamla.chapters.length, '· nu:', nu.chapters.length);
console.log('HEAD chapters_list len:', gamla.chapters_list.length, '· nu:', nu.chapters_list.length);
// vilka kapitel skiljer?
const max = Math.max(gamla.chapters.length, nu.chapters.length);
for (let i = 0; i < max; i++) {
  const g = JSON.stringify(gamla.chapters[i]);
  const n = JSON.stringify(nu.chapters[i]);
  if (g !== n) {
    console.log(`\n=== KAPITEL INDEX ${i} SKILJER ===`);
    if (g && n) {
      // hitta första avvikelsen
      let p = 0;
      while (p < Math.min(g.length, n.length) && g[p] === n[p]) p++;
      console.log('första avvikelse vid tecken', p);
      console.log('HEAD  …', g.slice(Math.max(0, p - 80), p + 120));
      console.log('NUVARANDE …', n.slice(Math.max(0, p - 80), p + 120));
    } else {
      console.log('finns bara i', g ? 'HEAD' : 'NUVARANDE');
    }
  }
}
// chapters_list
for (let i = 0; i < Math.max(gamla.chapters_list.length, nu.chapters_list.length); i++) {
  if (JSON.stringify(gamla.chapters_list[i]) !== JSON.stringify(nu.chapters_list[i])) {
    console.log(`\nchapters_list[${i}] SKILJER:`);
    console.log('  HEAD:', JSON.stringify(gamla.chapters_list[i]));
    console.log('  NU  :', JSON.stringify(nu.chapters_list[i]));
  }
}
