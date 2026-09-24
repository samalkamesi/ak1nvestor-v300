// rond 157: merge prod/develop + push (push avvisad — prod hade nya commits)
import { execFileSync } from 'node:child_process';

const R = '/home/ak1a/agent/ak1';
const ut = [];
const steg = (namn, fn) => {
  try { const r = fn(); ut.push(`[${namn}] OK`); return r; }
  catch (e) { ut.push(`[${namn}] FEL: ${String(e.message || e).slice(0, 400)}`); return null; }
};

// 1. vad saknar vi? (visa prod/develop:s commits vi inte har)
steg('fetch', () => execFileSync('git', ['-C', R, 'fetch', 'prod', 'develop'], { encoding: 'utf8', timeout: 60000 }));
ut.push('── commits i prod/develop som saknas lokalt ──');
ut.push(execFileSync('git', ['-C', R, 'log', '--oneline', 'develop..prod/develop'], { encoding: 'utf8' }).trim().slice(0, 1500));

// 2. merge (merge-commits är standardmönstret; grenarnas kod granskades var för sig)
const fore = execFileSync('git', ['-C', R, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
steg('merge', () => execFileSync('git', ['-C', R, 'merge', 'prod/develop', '-m', 'Merge remote-tracking branch ' + "'prod/develop'" + ' into develop'], { encoding: 'utf8', timeout: 60000 }));
const efter = execFileSync('git', ['-C', R, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
ut.push(`HEAD: ${fore.slice(0, 8)} → ${efter.slice(0, 8)}`);

// 3. push igen
if (fore !== efter) {
  steg('push', () => execFileSync('git', ['-C', R, 'push', 'prod', 'develop'], { encoding: 'utf8', timeout: 120000 }));
  const prodHead = execFileSync('git', ['-C', '/home/ak1a/AK1', 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  ut.push(`prod HEAD: ${prodHead.slice(0, 8)} (${prodHead === efter ? 'SYNKAD ✓' : 'väntar prod-synkpoll'})`);
}

// 4. mimosa-fyndfilerna i prod efter synk
const fs = await import('node:fs');
for (const f of ['_r147-dod', '_r147-omstart', '_r153-dod-sond', '_s1u2-wihlborgs-q3-kontroll', '_s7u2o139efter-kor']) {
  try {
    const kod = fs.readFileSync(`/home/ak1a/AK1/verktyg/${f}.mjs`, 'utf8');
    const interp = (kod.match(/execSync\(`[^`]*\$\{/g) || []).length;
    ut.push(`prod ${f}.mjs: interpolerad execSync = ${interp}`);
  } catch (e) { ut.push(`prod ${f}.mjs: LÄSFEL`); }
}

const rapport = ut.join('\n');
fs.writeFileSync(R + '/data/vakten/r157-merge.txt', rapport);
console.log(rapport);
