// Committar pollens vänt-läge för egen yta + startar om pollen
import { execSync } from 'node:child_process';
const WS = '/home/ak1a/agent/ak1';
execSync('git add verktyg/_r167-pushpoll3.mjs verktyg/_r168-pollfix2.mjs', { cwd: WS, encoding: 'utf8', timeout: 60000 });
execSync('git commit -m "studio: rond 168 [organ:Φ] — push-pollen väntar ut EGNA ytan (huvudagenten editerar rutinmässigt mellan poller; abort-exit 3 var för spröd — instans 2+3 dog på editfönster)"', { cwd: WS, encoding: 'utf8', timeout: 420000, maxBuffer: 16 * 1024 * 1024 });
console.log('HEAD:', execSync('git rev-parse --short HEAD', { cwd: WS, encoding: 'utf8' }).trim());
console.log('yta:', execSync('git status --porcelain', { cwd: WS, encoding: 'utf8' }).trim() || 'REN');
