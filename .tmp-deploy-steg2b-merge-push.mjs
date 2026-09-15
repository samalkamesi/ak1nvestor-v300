// Steg 2b: merge prod -> ARB, tsc-bevis, push
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

function git(args, timeoutMs = 120000) {
  return execFileSync('git', ['-C', '/home/ak1a/agent/ak1', ...args], { encoding: 'utf8', timeout: timeoutMs });
}

function gitOk(args, timeoutMs = 120000) {
  try { return { ok: true, ut: git(args, timeoutMs).trim() }; }
  catch (e) { return { ok: false, ut: String(e && e.message ? e.message : e) }; }
}

const logg = [];
const logga = (s) => { logg.push(s); console.log(s); };

// 1. Merge (förväntas auto-merge, 0 filöverlapp)
logga('=== MERGE prod/develop in i ARB ===');
const merge = gitOk(['merge', 'FETCH_HEAD', '--no-edit']);
logga((merge.ok ? 'OK\n' : 'FEL\n') + merge.ut);

if (!merge.ok) {
  writeFileSync('/home/ak1a/agent/ak1/.tmp-deploy-steg2b.txt', 'MERGE MISSLYCKADES\n' + logg.join('\n'));
  console.log('AVBRYTER: merge misslyckades — konflikt kräver manuell granskning');
  process.exit(1);
}

// 2. HEAD efter merge
logga('\n=== ARB HEAD efter merge ===');
logga(git(['log', '-1', '--format=%h %s']));

// 3. Våg 172-filerna närvarande i mergat träd?
logga('\n=== Bevis: våg 172-filer i träd ===');
logga(git(['ls-files', 'src/app/api/studio/tjanster/resync-v4/route.ts', 'src/lib/studio/studio-transport.ts']));

// 4. tsc --noEmit (bevis 0 fel) — använder projektbinären
logga('\n=== tsc --noEmit (kan ta någon minut) ===');
const tsc = gitOk(['exec', '--', 'npx', 'tsc', '--noEmit'], 420000);
logga(tsc.ok ? 'TSC: 0 FEL (exit 0)' : 'TSC FEL:\n' + tsc.ut.slice(0, 3000));

if (!tsc.ok) {
  writeFileSync('/home/ak1a/agent/ak1/.tmp-deploy-steg2b.txt', 'TSC FEL EFTER MERGE — AVBRYTER PUSH\n' + logg.join('\n'));
  console.log('AVBRYTER: tsc fel efter merge — push sker ej');
  process.exit(1);
}

// 5. Push
logga('\n=== PUSH develop -> prod ===');
const push = gitOk(['push', 'prod', 'develop']);
logga((push.ok ? 'PUSH OK\n' : 'PUSH FEL\n') + push.ut);

// 6. Prod-HEAD som bevis
const prodHead = execFileSync('git', ['-C', '/home/ak1a/AK1', 'log', '-1', '--format=%h %s'], { encoding: 'utf8', timeout: 30000 }).trim();
logga('\n=== PROD HEAD efter push ===\n' + prodHead);

writeFileSync('/home/ak1a/agent/ak1/.tmp-deploy-steg2b.txt', logg.join('\n'));
console.log(push.ok ? 'STEG 2 KLAR: pushad, prod-HEAD ovan' : 'PUSH MISSLYCKADES');
process.exit(push.ok ? 0 : 1);
