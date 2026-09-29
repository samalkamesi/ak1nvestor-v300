// r331 sond 1: gränssnittsrapportens dom + slutpush-kvito + ytläge
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const sh = (cmd, timeout = 30000) => {
  try { return execSync(cmd, { cwd: '/bin', shell: '/bin/bash', encoding: 'utf8', timeout }).trim(); }
  catch (e) { return 'FEL: ' + (e.stdout || e.message).toString().slice(0, 200); }
};
const AK1 = '/home/ak1a/AK1';
const YTA = '/home/ak1a/agent/ak1';

console.log('=== KLOCKA ===');
console.log(sh("date -u '+%H:%M:%SZ'"));

console.log('\n=== GRÄNSSNITTSRAPPORT (efter 07:15?) ===');
const rapp = sh(`find ${AK1}/data/vakten -maxdepth 1 -name 'granssnitt-*.json' -newermt '2026-09-29 07:15' | head -1`);
if (rapp && !rapp.startsWith('FEL')) {
  const j = JSON.parse(fs.readFileSync(rapp, 'utf8'));
  console.log('fil: ' + rapp.split('/').pop());
  console.log('status: ' + j.status);
  let fynd = 0;
  for (const k of j.kombinationer ?? []) fynd += (k.fynd ?? []).length;
  console.log(`kombinationer: ${(j.kombinationer ?? []).length} · totala fynd: ${fynd} · fel: ${(j.fel ?? []).length}`);
  if (fynd > 0) for (const k of j.kombinationer ?? []) for (const f of (k.fynd ?? []).slice(0, 6)) console.log(`  [${k.tema}/${k.viewport}] ${String(f).slice(0, 130)}`);
} else {
  console.log('rapport ännu ej skriven (RAM-grind eller svep pågår)');
  console.log('cron.log-svans: ' + sh(`tail -3 ${AK1}/data/vakten/cron.log`));
  console.log('aktiva vaktsprocesser: ' + sh("ps aux | grep -cE 'granssnittsvakt.mjs|chrome' "));
}

console.log('\n=== SLUTPUSH-KVITO ===');
const kv = `${YTA}/data/vakten/r330-slutpush-kvito.log`;
console.log(fs.existsSync(kv) ? fs.readFileSync(kv, 'utf8').trim() : '(kvito saknas — pusher ej startad?)');

console.log('\n=== YTLÄGE ===');
console.log('min yta: ' + (sh(`git -C ${YTA} status --porcelain | head -3`) || '(ren)'));
console.log('AK1: ' + (sh(`git -C ${AK1} status --porcelain | head -3`) || '(ren)'));
console.log('AK1-HEAD: ' + sh(`git -C ${AK1} log --oneline -1`).slice(0, 100));
console.log('min HEAD: ' + sh(`git -C ${YTA} log --oneline -1`).slice(0, 100));
