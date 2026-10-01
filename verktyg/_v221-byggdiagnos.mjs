// _v221-byggdiagnos.mjs — varför dog byggskriptet? prod, pm2, minne, node_modules, lås.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const kora = (cmd, args, t = 15000) => { try { return execFileSync(cmd, args, { encoding: 'utf8', timeout: t }).trim(); } catch (e) { return 'FEL: ' + String(e.message).slice(0, 100); } };

console.log('== prod ==');
try { console.log('HTTP: ' + (await fetch('https://lab.ak1nvestor.com/', { signal: AbortSignal.timeout(15000) })).status); } catch (e) { console.log('FEL ' + String(e).slice(0, 80)); }

console.log('\n== flock ==');
console.log(kora('flock', ['-n', '/tmp/ak1a-deploy.lock', 'true'], 5000) === '' ? 'LEDIG' : '(flock-kommando fel)');

console.log('\n== pm2 ==');
console.log(kora('pm2', ['ls'], 20000).split('\n').slice(0, 12).join('\n'));

console.log('\n== minne ==');
console.log(kora('free', ['-m']).split('\n').slice(0, 3).join('\n'));

console.log('\n== node_modules-läge ==');
const nm = '/home/ak1a/AK1/node_modules';
console.log('finns: ' + fs.existsSync(nm));
console.log('.bin/next: ' + fs.existsSync(nm + '/.bin/next'));
console.log('typescript/bin: ' + fs.existsSync(nm + '/typescript/bin/tsc'));
console.log('next/package.json: ' + (fs.existsSync(nm + '/next/package.json') ? JSON.parse(fs.readFileSync(nm + '/next/package.json', 'utf8')).version : 'SAKNAS'));

console.log('\n== OOM-spår (dmesg senaste) ==');
console.log(kora('bash', ['-c', 'dmesg -T 2>/dev/null | grep -i -E "out of memory|oom|killed process" | tail -5 || echo "(inga OOM-rader åtkomliga)"']));

console.log('\n== .next-läge ==');
console.log('BUILD_ID: ' + (fs.existsSync('/home/ak1a/AK1/.next/BUILD_ID') ? fs.readFileSync('/home/ak1a/AK1/.next/BUILD_ID', 'utf8').trim() : 'SAKNAS'));

console.log('\n== pågående npm/bygg-processer ==');
console.log(kora('bash', ['-c', "pgrep -af 'npm|next' | grep -v pgrep | head -5 || echo '(inga)'"]));
