#!/usr/bin/env node
// _r160-dirigent-start.mjs — startar dirigenten FRISTÅENDE (detached, överlever sessionen).
import { spawn } from 'node:child_process';

const barn = spawn('bash', ['/home/ak1a/agent/ak1/verktyg/_r160-dirigent.sh'], {
  detached: true, stdio: 'ignore', cwd: '/tmp',
});
barn.unref();
console.log('Dirigenten startad FRISTÅENDE (pid ' + barn.pid + ') — status i /tmp/r160-dirigent-status.txt');
