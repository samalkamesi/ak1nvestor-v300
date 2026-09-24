// Rond 173-sond 4: ko (prod), processer, RAM
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const p = (...a) => console.log(...a);
const prod = '/home/ak1a/AK1';

p('== ko (prod) ==');
const ko = fs.readdirSync(`${prod}/data/vakten/agentfabrik/ko`);
p(ko.length ? ko.join('\n') : '(tom)');

p('\n== processer ==');
const ps = execFileSync('ps', ['aux'], {}).toString();
for (const rad of ps.split('\n')) {
  if (/agentfabrik|zcode|pushpoll|dirigent/.test(rad)) p(rad.slice(0, 160));
}

p('\n== RAM ==');
const mem = fs.readFileSync('/proc/meminfo', 'utf8');
const f = n => Math.round(parseInt(mem.match(new RegExp(`${n}:\\s+(\\d+)`))?.[1] || '0', 10) / 1024);
p(`total ${f('MemTotal')} MB · avail ${f('MemAvailable')} MB`);
