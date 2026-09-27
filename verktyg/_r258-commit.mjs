// r258 (v174 dokvåg): worklog-append + commit [organ:Φ] + push + beslutsminne + prod-kontroll
import fs from 'node:fs';
import { execSync } from 'node:child_process';
const cwd = '/home/ak1a/agent/ak1';

function sh(steg, cmd, kritisk = false) {
  try { console.log('OK', steg, '|', execSync(cmd, { encoding: 'utf8', timeout: 300000, cwd }).trim().slice(0, 250)); }
  catch (e) { console.log('FEL', steg, '|', String(e.message).slice(0, 300)); if (kritisk) process.exit(1); }
}

// 1. Worklog-append (idempotent)
const wl = cwd + '/worklog.md';
const nuv = fs.readFileSync(wl, 'utf8');
const sektion = fs.readFileSync(cwd + '/verktyg/_r258-worklog.txt', 'utf8');
if (nuv.includes('## ROND 258 [organ:Φ]')) console.log('worklog REDAN BOKFÖRD');
else { fs.writeFileSync(wl, nuv.trimEnd() + '\n' + sektion); console.log('worklog APPENDAD:', fs.readFileSync(wl, 'utf8').includes('## ROND 258 [organ:Φ]') ? 'JA' : 'NEJ'); }

// 2. Commit + push (endast r258:s ytor + förra rondens kvarvarande skript)
const filer = [
  'data/DRIFTSBOKEN.md',
  'data/forskning/SYSTEMKARTAN.md',
  'worklog.md',
  'verktyg/_r257-bokfor.mjs',
  'verktyg/_r258-doksond.mjs',
  'verktyg/_r258-driftsbok-sektion.txt',
  'verktyg/_r258-systemkarta-sektion.txt',
  'verktyg/_r258-append.mjs',
  'verktyg/_r258-worklog.txt',
  'verktyg/_r258-commitmsg.txt',
  'verktyg/_r258-commit.mjs'
];
sh('add', 'git add ' + filer.join(' '), true);
sh('commit', 'git commit -F verktyg/_r258-commitmsg.txt', true);
sh('hash', 'git log -1 --format=%h');
sh('push', 'git push prod develop', true);
sh('status-slut', 'git status --porcelain');

// 3. Beslutsminne (hash efter landning)
const hash = execSync('git log -1 --format=%h', { encoding: 'utf8', cwd }).trim();
const rad = JSON.stringify({
  ts: new Date().toISOString(),
  rond: 111,
  beslut: 'r258: v174 DOKVÅG levererad — DRIFTSBOKEN + SYSTEMKARTAN ikapp krisdagen (r255-receptet som femstegsprocedur, 404-doktrinen ALDRIG bolagsdata utan deploy, externa-git-ingreppens protokoll, datasetläget 292→311); rotationsspår 9→3 nästa (v171 B28-ar)',
  landat: hash
});
fs.appendFileSync(cwd + '/data/vakten/beslutsminne.jsonl', rad + '\n');
console.log('BESLUTSMINNE landat=' + hash);

// 4. Prod-kontroll
try { const r = await fetch('https://lab.ak1nvestor.com/'); console.log('PROD', r.status); } catch (e) { console.log('PROD FEL', String(e.message).slice(0, 60)); }
