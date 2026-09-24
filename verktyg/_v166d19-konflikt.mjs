// Jämför de två parallella d19-versionerna + granskningsfilens merge-läge
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
const git = (spec) => execFileSync('git', ['show', spec], { encoding: 'utf8' });
const SOK = 'data/bokmaster/the-complete-turtletrader.json';
const min = JSON.parse(git('HEAD:' + SOK));
const deras = JSON.parse(git('prod/develop:' + SOK));
for (const [namn, j] of [['MIN (HEAD)', min], ['DERAS (prod/develop)', deras]]) {
  const ny = j.chapters.at(-1);
  console.log(`${namn}: kap ${j.chapters.length} · ${j.chapterCount} · ${j.totalMinutes} min · sist="${ny.title}" (${ny.minutes}m)`);
  console.log(`  block: ${ny.blocks.map(b => b.type).join(',')} · quiz ratt ${ny.quiz.map(q => q.ratt).join(',')} · 2007:528 ×${(JSON.stringify(ny).match(/2007:528/g) || []).length}`);
  console.log(`  intro: ${ny.intro.slice(0, 120)}…`);
}
// deras kärntal
const dn = JSON.stringify(deras.chapters.at(-1));
const karn = ['1983', '1984', '100 miljoner', 'Jerry Parker', 'Chesapeake', 'Liz Cheval', 'Paul Rabar', 'Tom Shanks', '1987–88', '100 000', '1 000 kr', '990 kr', '980 kr', '200', '396', '245', '+7 350', '105 360', '+5,4 %', '0,99', '1,075', '1,0536', 'konstruerade tal', 'inte historisk data', '2007:528'];
const saknas = karn.filter(t => !dn.includes(t));
console.log(`\nDERAS kärntal: ${karn.length - saknas.length}/${karn.length}${saknas.length ? ' SAKNAS: ' + saknas.join(', ') : ' — alla'}`);
// granskningsfilen i prod
try {
  const g = git('prod/develop:data/forskning/KURS-FAS3/GRANSKNING-v166-SENASTE.md');
  const lag = g.match(/## LÄGE:.*$/m)?.[0] || '?';
  const sum = g.match(/## SAMMANFATTNING:.*$/m)?.[0] || '?';
  console.log('\nDERAS granskningsfil:', lag, '|', sum);
  console.log('deras har d19-block:', g.includes('PASS the-complete-turtletrader'));
} catch (e) { console.log('granskningsfil saknas i prod/develop:', e.message.slice(0, 80)); }
// lokal merge-status
const st = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' });
console.log('\nMERGE-STATUS:\n' + st);
