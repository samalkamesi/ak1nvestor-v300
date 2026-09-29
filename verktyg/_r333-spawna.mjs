// r333 spawna: startar pushpollaren avknoppad (detached+unref) — studio-skalet kan inte &
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const YTA = '/home/ak1a/agent/ak1';
const ut = fs.openSync(`${YTA}/data/vakten/r333-pushpollare-ut.log`, 'a');
const barn = spawn('node', [`${YTA}/verktyg/_r333-pushpollare.mjs`], {
  detached: true, stdio: ['ignore', ut, ut], cwd: YTA,
});
barn.unref();
console.log('pollare avknoppad pid ' + barn.pid);
