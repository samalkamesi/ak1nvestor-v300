// _v225-process.mjs — levnadstecken på deploy-bygget: processer, CPU, .bygg-kopia-aktivitet.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
function ko(c, t = 25) { try { return execFileSync('bash', ['-c', c], { encoding: 'utf8', timeout: t * 1000 }).trim(); } catch (e) { return '(fel: ' + String(e.message).split('\n')[0] + ')'; } }

console.log('== BYGGPROCESSER ==');
console.log(ko("ps -eo pid,etimes,pcpu,comm,args --sort=-pcpu | grep -E 'prod-synk|next build|npm|node .*build|installationsbarn' | grep -v grep | head -8"));

console.log('\n== LÅSETS ÄGARE ==');
console.log(ko("fuser -v /tmp/ak1a-deploy.lock 2>&1 | head -3"));

console.log('\n== STALLNINGENS AKTIVITET (.bygg-kopia) ==');
console.log(ko("stat -c '%y %n' /home/ak1a/AK1/.bygg-kopia 2>/dev/null | head -1"));
console.log(ko("find /home/ak1a/AK1/.bygg-kopia -maxdepth 2 -newermt '2 minutes ago' 2>/dev/null | head -5"));

console.log('\n== .next-ny (byggutdata) ==');
console.log(ko("stat -c '%y %n' /home/ak1a/AK1/.next-ny 2>/dev/null | head -1; stat -c '%y' /home/ak1a/AK1/.bygg-kopia/.next/BUILD_ID 2>/dev/null"));

console.log('\n== SENASTE LOGGAR ==');
try { console.log(fs.readFileSync('/home/ak1a/AK1/data/vakten/prod-synk.log', 'utf8').trim().split('\n').slice(-2).join('\n')); } catch {}
