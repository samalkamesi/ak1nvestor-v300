// r327 sond 9 (v205-förberedelse): nattens 7 G2/G5-cron-spår — finns kvittona?
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const sh = (cmd, timeout = 20000) => {
  try { return execSync(cmd, { cwd: '/bin', shell: '/bin/bash', encoding: 'utf8', timeout }).trim(); }
  catch (e) { return 'FEL: ' + (e.stdout || e.message).toString().slice(0, 200); }
};

// Sök färska spår (senaste 12 h) i AK1:s vaktkatalog efter de 7 kända jobben
const nycklar = [
  ['db-dump', ['db-dump', 'dump']],
  ['moln-export', ['moln-export', 'molnexport']],
  ['app-dump', ['app-dump', 'appdump']],
  ['natt-TBT', ['natt-tbt', 'tbt']],
  ['döda länkar', ['doda-lankar', 'doda', 'lankvakt']],
  ['beroendevakt', ['beroende', 'beropende']],
  ['rop-hälsa', ['rop-halsa', 'rop', 'pumpor']],
];
console.log('=== FÄRSKA VAKT-SPÅR (<12 h) i AK1/data/vakten ===');
const farska = sh("find /home/ak1a/AK1/data/vakten -maxdepth 2 -mmin -720 -type f 2>/dev/null | sort | tail -30");
console.log(farska || '(inga)');

console.log('\n=== MATCHNING MOT DE 7 SPÅREN ===');
const lista = farska === '(inga)' ? [] : farska.split('\n');
for (const [namn, mönster] of nycklar) {
  const träff = lista.filter(f => mönster.some(m => f.toLowerCase().includes(m)));
  console.log(`${namn}: ${träff.length ? träff.map(t => t.split('/').pop()).join(', ') : 'SAKNAS'}`);
}

console.log('\n=== PM2-PUMPOLOGG SVANS (rop-hälsa indirekt) ===');
console.log(sh("tail -5 /home/ak1a/.pm2/logs/ak1a-pumpor-out.log 2>/dev/null || echo 'loggsökväg annan'"));
