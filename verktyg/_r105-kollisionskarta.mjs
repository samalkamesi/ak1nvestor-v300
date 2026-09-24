#!/usr/bin/env node
// startar r105-isr-vaktposten frånkopplat + kartlägger AI-Mentorns 56 frågelager (kollisionskontroll våg 210)
import { spawn } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
const p = spawn('node', ['/home/ak1a/agent/ak1/verktyg/_r105-isr-vaktpost.mjs'], { detached: true, stdio: 'ignore' });
p.unref();
console.log('ISR-VAKTPOST pid', p.pid);

// Kollisionskartan: vilka frågefamiljer lever i src/lib?
const ARB = '/home/ak1a/agent/ak1';
const fragor = readdirSync(`${ARB}/src/lib`).filter((f) => /fragor/.test(f) && f.endsWith('.ts')).sort();
console.log(`\n${fragor.length} frågelager:`);
for (const f of fragor) console.log(' ', f.replace('ai-mentor-', '').replace('-fragor.ts', ''));
