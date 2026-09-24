#!/usr/bin/env node
// startar r103-pusha.mjs frånkopplat (överlever turnen)
import { spawn } from 'node:child_process';
const p = spawn('node', ['/home/ak1a/agent/ak1/verktyg/_r103-pusha.mjs'], { detached: true, stdio: 'ignore' });
p.unref();
console.log('pusher startad pid', p.pid);
