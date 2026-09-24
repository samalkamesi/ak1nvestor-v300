#!/usr/bin/env node
// _r161-verifiera-start.mjs — startar verifieraren FRISTÅENDE.
import { spawn } from 'node:child_process';
const barn = spawn('node', ['/home/ak1a/agent/ak1/verktyg/_r161-verifiera.mjs'], {
  detached: true, stdio: 'ignore', cwd: '/tmp',
});
barn.unref();
console.log('Verifieraren startad FRISTÅENDE (pid ' + barn.pid + ') — resultat till /tmp/r161-verifiering.txt');
