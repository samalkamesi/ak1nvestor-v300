// Rond 174: push-bevakning — dirigent + barn + prod/ws-paritet
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const ws = '/home/ak1a/agent/ak1', prod = '/home/ak1a/AK1';
const git = (args, cwd) => execFileSync('git', args, { cwd, timeout: 60000 }).toString().trim();
const ps = execFileSync('ps', ['aux'], { timeout: 15000 }).toString();
const barn = ps.split('\n').filter(r => /fabriksagent/.test(r) && !/grep/.test(r)).length;
const dir = /pushdirigent/.test(ps) ? 'LEVER' : 'DÖD';
const mem = fs.readFileSync('/proc/meminfo', 'utf8');
const ram = Math.round(parseInt(mem.match(/MemAvailable:\s+(\d+)/)[1], 10) / 1024);
const wsH = git(['rev-parse', 'HEAD'], ws);
const prodH = git(['rev-parse', 'HEAD'], prod);
const ko = fs.readdirSync(`${prod}/data/vakten/agentfabrik/ko`).length;
console.log(`dirigent=${dir} barn=${barn} ram=${ram}MB ko=${ko} ws=${wsH.slice(0, 8)} prod=${prodH.slice(0, 8)} paritet=${wsH === prodH ? 'JA' : 'NEJ'}`);
console.log('tid:', new Date().toISOString());
