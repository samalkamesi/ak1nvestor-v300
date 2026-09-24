// Verifierar mimosa-kuren i arbetsytan: full-scan enligt o29-kontraktet (--doman .)
process.chdir('/home/ak1a/agent/ak1');
import { spawnSync } from 'node:child_process';
const r = spawnSync('node', ['verktyg/mimosa-paritet.mjs', '--doman', '.'], { encoding: 'utf8', timeout: 120000, maxBuffer: 32 * 1024 * 1024 });
const uts = (r.stdout || '') + (r.stderr || '');
console.log('EXIT:', r.status);
console.log('--- sista 12 raderna ---');
console.log(uts.split('\n').filter(Boolean).slice(-12).join('\n').slice(0, 1500));
const s1u2 = uts.split('\n').filter(l => l.includes('_s1u2')).slice(0, 3);
console.log('_s1u2-rader:', s1u2.length ? s1u2.join(' | ').slice(0, 300) : 'INGA — kuren verkar stänga fyndet');
