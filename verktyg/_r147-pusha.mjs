// Rond 147-push: merge prod/develop (union vid konflikt i append-loggar) → push
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const ROT = '/home/ak1a/agent/ak1';
const S = (cmd, args, t = 60000) => execFileSync(cmd, args, { encoding: 'utf8', timeout: t, cwd: ROT, maxBuffer: 32 * 1024 * 1024 });
const ut = { nu: new Date().toISOString() };

// (1) hämta prod-trädets nya commits
ut.fetch = S('git', ['fetch', 'prod', 'develop'], 60000).trim().slice(0, 120);
ut.bakom = S('git', ['rev-list', '--count', 'HEAD..prod/develop'], 30000).trim();
ut.framat = S('git', ['rev-list', '--count', 'prod/develop..HEAD'], 30000).trim();
ut.domDeras = S('git', ['log', '--oneline', '-5', 'prod/develop'], 30000).split('\n').filter(Boolean);

// (2) merge — vid konflikt: union (båda sidorna) för append-only-filer
let mergeOk = true;
try { ut.merge = S('git', ['merge', 'prod/develop', '--no-edit', '-m', 'studio: merge prod → develop (rond 147: F6-vaccin + rondverktyg möter fabrikens leveranser)'], 120000).split('\n').slice(0, 3).join(' | ').slice(0, 200); }
catch (e) {
  mergeOk = false;
  ut.mergeFel = (e.message || '').slice(0, 200);
  ut.konflikter = S('git', ['diff', '--name-only', '--diff-filter=U'], 30000).trim().split('\n').filter(Boolean);
  for (const f of ut.konflikter) {
    try {
      // union: ours (2) + theirs (3) — korrekt för worklog/JSONL-append-loggar
      const ours = S('git', ['show', ':2:' + f], 30000);
      const theirs = S('git', ['show', ':3:' + f], 30000);
      const join = ours.endsWith('\n') ? '\n' : '\n\n';
      fs.writeFileSync(ROT + '/' + f, ours + (theirs.startsWith('\n') ? '' : '\n') + theirs);
      S('git', ['add', f], 30000);
      ut['union:' + f] = 'OK (' + (ours.length + theirs.length) + ' B)';
    } catch (e2) { ut['unionFEL:' + f] = e2.message.slice(0, 120); }
  }
  if ((ut.konflikter || []).every(f => ut['union:' + f])) {
    try { ut.merge2 = S('git', ['commit', '--no-edit', '-m', 'studio: merge prod → develop (rond 147, union-löst: ' + ut.konflikter.join(', ') + ')'], 120000).slice(0, 120); } catch (e3) { ut.merge2 = 'commit-FEL: ' + e3.message.slice(0, 200); mergeOk = false; }
  }
}

// (3) push
if (mergeOk || ut.merge2) {
  try { ut.push = S('git', ['push', 'prod', 'develop'], 120000).split('\n').filter(r => /develop|->|reject|error/i.test(r)).join(' | ').slice(0, 200); }
  catch (e) { ut.push = 'FEL: ' + e.message.slice(0, 300); }
}

// (4) slutläge
ut.head = S('git', ['log', '--oneline', '-3'], 30000).split('\n').filter(Boolean);
ut.statusRen = S('git', ['status', '--porcelain'], 30000).trim() === '';
console.log(JSON.stringify(ut, null, 1));
