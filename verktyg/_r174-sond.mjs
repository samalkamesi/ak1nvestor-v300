// Rond 174-sond: dirigent + fabriksbarn + RAM + prod/ws-git-läge
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const p = (...a) => console.log(...a);
const ws = '/home/ak1a/agent/ak1', prod = '/home/ak1a/AK1';
const git = (args, cwd) => execFileSync('git', args, { cwd, timeout: 60000 }).toString().trim();

p('== dirigentprocess ==');
const ps = execFileSync('ps', ['aux'], { timeout: 15000 }).toString();
const dir = ps.split('\n').filter(r => /pushdirigent/.test(r) && !/grep/.test(r));
p(dir.length ? dir.map(r => r.slice(0, 100)).join('\n') : '(död)');

p('\n== fabriksagenter ==');
const barn = ps.split('\n').filter(r => /fabriksagent/.test(r) && !/grep/.test(r));
p(`antal: ${barn.length}`);

p('\n== RAM ==');
const mem = fs.readFileSync('/proc/meminfo', 'utf8');
p('avail:', Math.round(parseInt(mem.match(/MemAvailable:\s+(\d+)/)[1], 10) / 1024), 'MB');

p('\n== ko (prod) ==');
p(fs.readdirSync(`${prod}/data/vakten/agentfabrik/ko`).join(', ') || '(tom)');

p('\n== GIT ==');
p('ws HEAD:', git(['log', '--oneline', '-1'], ws));
p('ws status:', git(['status', '--porcelain'], ws) || '(ren)');
p('prod HEAD:', git(['log', '--oneline', '-1'], prod));
const prodStatus = git(['status', '--porcelain'], prod);
const spadade = prodStatus.split('\n').filter(r => r.trim() && !r.trim().startsWith('??'));
p('prod spårade smutsiga rader:', spadade.length);
p('prod untracked:', prodStatus.split('\n').filter(r => r.trim().startsWith('??')).length);

p('\n== prod-hälsa ==');
p('HTTPS:', execFileSync('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', 'https://lab.ak1nvestor.com/'], { timeout: 30000 }).toString());
