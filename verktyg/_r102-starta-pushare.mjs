#!/usr/bin/env node
// Startar r102-vänta-pusharen frånkopplad (node-kanalen, r97-mönstret) och verifierar via /proc.
import { openSync } from 'node:fs';
import { spawn } from 'node:child_process';

const ROT = '/home/ak1a/agent/ak1';
const logF = openSync(`${ROT}/data/vakten/r102-pushare.log`, 'a');
const barn = spawn('node', ['verktyg/_r102-pushare.mjs'], { cwd: ROT, detached: true, stdio: ['ignore', logF, logF] });
barn.unref();
console.log('PID', barn.pid);
