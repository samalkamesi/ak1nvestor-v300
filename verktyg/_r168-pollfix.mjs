// Commit: pollens ytkontroll-fix + rondsond — sedan startas pollen om utifrån
import { execSync } from 'node:child_process';
const WS = '/home/ak1a/agent/ak1';
execSync('git add verktyg/_r167-pushpoll3.mjs verktyg/_r168-lagesond.mjs verktyg/_r168-pollfix.mjs', { cwd: WS, encoding: 'utf8', timeout: 60000 });
const medd = 'studio: rond 168 [organ:Φ] — push-pollens ytkontroll rättad: ospårade sonder blockerar ej merge/push (endast modifierade spårade filer aborterar) — förra instansen dog på egen sond-litteratur';
execSync(`git commit -m "${medd}"`, { cwd: WS, encoding: 'utf8', timeout: 420000, maxBuffer: 16 * 1024 * 1024 });
const head = execSync('git rev-parse --short HEAD', { cwd: WS, encoding: 'utf8' }).trim();
const status = execSync('git status --porcelain', { cwd: WS, encoding: 'utf8' }).trim();
console.log('HEAD:', head, '| spårade/smutsiga:', status || 'REN');
