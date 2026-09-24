// rond 157: commit + push prod via node-kanalen (skalet hänger på git)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const R = '/home/ak1a/agent/ak1';
const ut = [];
const steg = (namn, fn) => {
  try { ut.push(`[${namn}] OK`); return fn(); }
  catch (e) { ut.push(`[${namn}] FEL: ${String(e.message || e).slice(0, 300)}`); return null; }
};

// 1. stage allt (idempotent)
steg('add', () => execFileSync('git', ['-C', R, 'add', '-A'], { stdio: 'pipe' }));
ut.push(execFileSync('git', ['-C', R, 'status', '--short'], { encoding: 'utf8' }).split('\n').slice(0, 20).join('\n'));

// 2. commit med -F (pre-commit-hook: tsc ~12 s körs)
const fore = execFileSync('git', ['-C', R, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
steg('commit', () => execFileSync('git', ['-C', R, 'commit', '-F', R + '/data/vakten/r157-commitmsg.txt'], { encoding: 'utf8', timeout: 120000 }));
const efter = execFileSync('git', ['-C', R, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
ut.push(`HEAD: ${fore} → ${efter} (${fore === efter ? 'INGEN NY COMMIT' : 'NY COMMIT'})`);

// 3. push prod develop (lokal sökväg-remote)
if (fore !== efter) {
  steg('push', () => execFileSync('git', ['-C', R, 'push', 'prod', 'develop'], { encoding: 'utf8', timeout: 120000 }));
  // 4. verifiera prod-trädets HEAD
  const prodHead = execFileSync('git', ['-C', '/home/ak1a/AK1', 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  ut.push(`prod HEAD efter push: ${prodHead} (${prodHead === efter ? 'SYNKAD ✓' : 'ej synkad ännu (prod-synkpoll kommer)'})`);
}

// 5. mimosa i prod-trädet — de 5 fyndfilerna ska nu vara härmdade
for (const f of ['_r147-dod', '_r147-omstart', '_r153-dod-sond', '_s1u2-wihlborgs-q3-kontroll', '_s7u2o139efter-kor']) {
  try {
    const kod = fs.readFileSync(`/home/ak1a/AK1/verktyg/${f}.mjs`, 'utf8');
    const interp = (kod.match(/execSync\(`[^`]*\$\{/g) || []).length;
    ut.push(`prod ${f}.mjs: interpolerad execSync = ${interp}`);
  } catch (e) { ut.push(`prod ${f}.mjs: LÄSFEL ${String(e.message).slice(0, 80)}`); }
}

const rapport = ut.join('\n');
fs.writeFileSync(R + '/data/vakten/r157-commit.txt', rapport);
console.log(rapport);
