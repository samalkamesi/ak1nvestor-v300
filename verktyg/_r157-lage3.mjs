// rond 157: läge 3 — prod-yta + fabrikmanifest + HEAD-jämförelse
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const R = '/home/ak1a/agent/ak1', P = '/home/ak1a/AK1';
const ut = [];
const smuts = execFileSync('git', ['-C', P, 'status', '--porcelain'], { encoding: 'utf8' }).split('\n').filter(l => l.trim());
ut.push(`prod smutsiga: ${smuts.length}${smuts.length ? ' (första: ' + smuts[0].slice(0, 60) + ')' : ' — REN ✓'}`);
ut.push('prod HEAD: ' + execFileSync('git', ['-C', P, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim().slice(0, 8));
ut.push('min  HEAD: ' + execFileSync('git', ['-C', R, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim().slice(0, 8));
try {
  const j = JSON.parse(fs.readFileSync(P + '/data/vakten/agentfabrik/status/auto-s9-1790210106768.json', 'utf8'));
  ut.push('auto-s9-manifest: status=' + j.status);
} catch (e) { ut.push('auto-s9-manifest: borta/parse-fel — fabrikklar?'); }
console.log(ut.join('\n'));
