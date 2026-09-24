// Jämför de två parallella d13-versionerna av fibonacci-applications.json
import { execFileSync } from 'node:child_process';
const git = (spec) => execFileSync('git', ['show', spec], { encoding: 'utf8' });
const min = JSON.parse(git('HEAD:data/bokmaster/fibonacci-applications.json'));
const deras = JSON.parse(git('prod/develop:data/bokmaster/fibonacci-applications.json'));
for (const [namn, j] of [['MIN (af742a0c)', min], ['DERAS (prod/develop)', deras]]) {
  const ny = j.chapters.at(-1);
  console.log(`${namn}: kapitel ${j.chapters.length} · chapterCount ${j.chapterCount} · totalMinutes ${j.totalMinutes} · sist="${ny.title}" (${ny.minutes} min, num ${ny.num})`);
  console.log(`  blocktyper: ${ny.blocks.map(b => b.type).join(',')}`);
  console.log(`  quiz ratt: ${ny.quiz.map(q => q.ratt).join(',')} · 2007:528 ×${(JSON.stringify(ny).match(/2007:528/g) || []).length}`);
  console.log(`  intro: ${ny.intro.slice(0, 160)}…`);
}
// deras kapitel 15: innehåller det underlagets kärntal?
const derasNy = JSON.stringify(deras.chapters.at(-1));
const karnTal = ['317,50', '371,50', '54,00', '350,90', '338,10', '344,50', '343,20', '338,20', '351,30', '330,20', '76,5', 'VOLV-B.ST', '2026-09-24', '2007:528', '61,8', '38,2', 'halveringsregel'];
const saknas = karnTal.filter(t => !derasNy.includes(t));
console.log(`\nDERAS kärntal-check: ${karnTal.length - saknas.length}/${karnTal.length}${saknas.length ? ' SAKNAS: ' + saknas.join(', ') : ' — alla närvarande'}`);
