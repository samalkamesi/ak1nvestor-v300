// r336 spawna ISR-sonden avknoppad
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const YTA = '/home/ak1a/agent/ak1';
const ut = fs.openSync(`${YTA}/data/vakten/r336-isr-sond-ut.log`, 'a');
const barn = spawn('node', [`${YTA}/verktyg/_r336-isr-sond.mjs`], { detached: true, stdio: ['ignore', ut, ut], cwd: YTA });
barn.unref();
console.log('ISR-sond avknoppad pid ' + barn.pid);
