// _v221-konfliktdiagnos.mjs — verifierar abort + mäter konfliktfilernas skillnader + hittar generatorer.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const ROT = '/home/ak1a/agent/ak1';
const git = (args, t = 30000) => { try { return execFileSync('git', args, { encoding: 'utf8', timeout: t, cwd: ROT }).trim(); } catch (e) { return 'FEL: ' + String(e.message).slice(0, 150); } };

console.log('== Merge-state efter abort? ==');
const st = git(['status', '--porcelain']);
console.log(st.split('\n').slice(0, 15).join('\n'));
console.log('MERGE_HEAD finns: ' + fs.existsSync(ROT + '/.git/MERGE_HEAD'));

console.log('\n== deep-courses.json per sida ==');
for (const ref of ['develop', 'prod/develop']) {
  try {
    const ut = execFileSync('git', ['show', `${ref}:public/deep-courses.json`], { encoding: 'utf8', timeout: 30000, cwd: ROT });
    const j = JSON.parse(ut);
    console.log(`${ref}: ${Object.keys(j).length} kurser`);
  } catch (e) { console.log(`${ref}: FEL ${String(e.message).slice(0, 100)}`); }
}

console.log('\n== slugdiff develop vs prod/develop (deep-courses) ==');
try {
  const A = JSON.parse(execFileSync('git', ['show', 'develop:public/deep-courses.json'], { encoding: 'utf8', timeout: 30000, cwd: ROT }));
  const B = JSON.parse(execFileSync('git', ['show', 'prod/develop:public/deep-courses.json'], { encoding: 'utf8', timeout: 30000, cwd: ROT }));
  const a = new Set(Object.keys(A)), b = new Set(Object.keys(B));
  const baraMitt = [...a].filter((k) => !b.has(k));
  const baraProd = [...b].filter((k) => !a.has(k));
  console.log(`bara i develop (${baraMitt.length}): ${baraMitt.join(', ').slice(0, 400)}`);
  console.log(`bara i prod/develop (${baraProd.length}): ${baraProd.join(', ').slice(0, 400)}`);
  const gemensamma = [...a].filter((k) => b.has(k));
  let skilda = 0; const skildaEx = [];
  for (const k of gemensamma) {
    if (JSON.stringify(A[k]) !== JSON.stringify(B[k])) { skilda++; if (skildaEx.length < 5) skildaEx.push(k); }
  }
  console.log(`gemensamma med olikt innehåll: ${skilda} ${skildaEx.length ? '(' + skildaEx.join(', ') + ')' : ''}`);
} catch (e) { console.log('FEL: ' + String(e.message).slice(0, 200)); }

console.log('\n== data/siffror.json per sida ==');
for (const ref of ['develop', 'prod/develop']) {
  try {
    const ut = execFileSync('git', ['show', `${ref}:data/siffror.json`], { encoding: 'utf8', timeout: 30000, cwd: ROT });
    console.log(`${ref}: ${ut.trim().slice(0, 300)}`);
  } catch (e) { console.log(`${ref}: FEL`); }
}

console.log('\n== Generatorer i repot (scripts/) ==');
try { console.log(execFileSync('ls', ['/home/ak1a/agent/ak1/scripts'], { encoding: 'utf8', timeout: 10000 }).trim().slice(0, 800)); } catch (e) { console.log('scripts/ saknas'); }

console.log('\n== Filer som skriver deep-courses.json ==');
for (const dir of ['scripts', 'verktyg']) {
  try {
    for (const f of fs.readdirSync(`${ROT}/${dir}`)) {
      const p = `${ROT}/${dir}/${f}`;
      if (!f.endsWith('.mjs') && !f.endsWith('.ts') && !f.endsWith('.js')) continue;
      try { const innehall = fs.readFileSync(p, 'utf8'); if (innehall.includes('deep-courses')) console.log(`${dir}/${f}`); } catch {}
    }
  } catch {}
}
