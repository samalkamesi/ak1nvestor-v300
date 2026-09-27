#!/usr/bin/env node
// Rond 243 — statussond: verkställdes ENGI-inlägget?
import { readFileSync } from "node:fs";
const u = JSON.parse(readFileSync('data/portfolj-system/bolagsunivers.json', 'utf8'));
console.log(`UNIVERSUM: ${u.length} rader · sista: ${u[u.length - 1].ticker}`);
const llms = readFileSync('public/llms.txt', 'utf8');
console.log(`llms bär ${llms.includes('på 302 bolag') ? '302-läget ✓' : llms.includes('på 301 bolag') ? '301-läget (regen EJ körd)' : 'okänt'}`);
