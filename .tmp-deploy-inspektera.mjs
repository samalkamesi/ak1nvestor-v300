// Inspektera prod:s nya committar som ARB saknar
import { execFileSync } from 'node:child_process';

function git(repo, args, timeoutMs = 60000) {
  return execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8', timeout: timeoutMs });
}

// 1. Fetcha prod (ändrar inte arbetsträd)
const fetchUt = git('/home/ak1a/agent/ak1', ['fetch', 'prod', 'develop']);
console.log('FETCH: ' + fetchUt.trim());

// 2. ARB HEAD och merge-bas mot prod/develop
const arbHead = git('/home/ak1a/agent/ak1', ['log', '-1', '--format=%h %s']).trim();
const mergeBas = git('/home/ak1a/agent/ak1', ['merge-base', 'HEAD', 'FETCH_HEAD']).trim();
const prodHead = git('/home/ak1a/agent/ak1', ['log', '-1', '--format=%h', 'FETCH_HEAD']).trim();
console.log('ARB HEAD:      ' + arbHead);
console.log('MERGE-BAS:     ' + mergeBas);
console.log('PROD (fetch):  ' + prodHead);

// 3. Committar i prod som ARB saknar (merge-bas..FETCH_HEAD)
const nya = git('/home/ak1a/agent/ak1', ['log', '--oneline', `${mergeBas}..FETCH_HEAD`]).trim();
console.log('\n--- PROD:s committar som ARB saknar ---\n' + nya);

// 4. Filer som ändrats på prod-sidan (potentiella konfliktområden)
const filer = git('/home/ak1a/agent/ak1', ['diff', '--name-status', mergeBas, 'FETCH_HEAD']).trim();
console.log('\n--- Ändrade filer på prod-sidan ---\n' + filer);

// 5. Filer som ARB ändrat sedan merge-basen (våg 172)
const arbFiler = git('/home/ak1a/agent/ak1', ['diff', '--name-status', mergeBas, 'HEAD']).trim();
console.log('\n--- Ändrade filer på ARB-sidan (sedan merge-bas) ---\n' + arbFiler);

// 6. ARB:s träd rent? (krav för merge)
const status = git('/home/ak1a/agent/ak1', ['status', '--porcelain']).trim();
console.log('\n--- ARB status (porcelain) ---\n' + (status || '(tomt — rent)'));
