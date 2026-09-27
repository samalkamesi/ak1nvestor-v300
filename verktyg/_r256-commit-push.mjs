#!/usr/bin/env node
// _r256-commit-push.mjs — U50: stage, commit (grinden kör tsc automatiskt), push prod.
import { execSync } from 'node:child_process';
const kör = (c, t = 240000) => {
  try { return execSync(c, { timeout: t, encoding: 'utf8', cwd: '/home/ak1a/agent/ak1' }).toString().trim(); }
  catch (e) { console.log('FEL: ' + String(e.message).split('\n').slice(0, 5).join(' | ')); process.exit(1); }
};

console.log('== STAGE ==');
console.log(kör('git add data/portfolj-system/bolagsunivers.json public/llms.txt worklog.md data/forskning/V173-U50-HAL-UTOKNING.md verktyg/_r255-hal-hamta.mjs verktyg/_r255-prod-repair.mjs verktyg/_r256-*.mjs verktyg/_r256-worklog.txt', 30000));
console.log(kör('git status --porcelain | grep -v "^??" | head -25', 30000));

console.log('\n== COMMIT (grinden: tsc) ==');
console.log(kör('git commit -F verktyg/_r256-commit.txt', 300000).split('\n').slice(-6).join('\n'));

console.log('\n== PUSH PROD ==');
console.log(kör('git push prod develop', 120000));

console.log('\n== VERIFIERING ==');
console.log('HEAD:', kör('git log -1 --format="%h %s"', 30000).slice(0, 90));
