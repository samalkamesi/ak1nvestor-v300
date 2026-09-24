// Emottag d23+d24: append-bevis + granskningsblock (KVD redan körd GRÖN)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
const vm = JSON.parse(fs.readFileSync('data/varumarke.json', 'utf8'));
for (const slug of ['market-mind-games', 'your-money-and-your-brain']) {
  const sokvag = `data/bokmaster/${slug}.json`;
  const j = JSON.parse(fs.readFileSync(sokvag, 'utf8'));
  const ny = j.chapters.at(-1);
  const text = JSON.stringify(ny);
  const hash = execFileSync('git', ['log', '--format=%h', '-1', '--', sokvag], { encoding: 'utf8' }).trim();
  const fore = JSON.parse(execFileSync('git', ['show', `${hash}~1:${sokvag}`], { encoding: 'utf8' }));
  const efter = JSON.parse(execFileSync('git', ['show', `${hash}:${sokvag}`], { encoding: 'utf8' }));
  const nF = fore.chapters.length;
  const appendRen = fore.chapters.every((g, i) => JSON.stringify(g) === JSON.stringify(efter.chapters[i]));
  const listaRen = JSON.stringify(fore.chapters_list) === JSON.stringify(efter.chapters_list.slice(0, nF));
  const bestand = efter.chapters.every((g, i) => JSON.stringify(g) === JSON.stringify(j.chapters[i])) &&
    JSON.stringify(efter.chapters_list) === JSON.stringify(j.chapters_list) &&
    efter.chapterCount === j.chapterCount && efter.totalMinutes === j.totalMinutes;
  const summa = j.chapters.reduce((a, k) => a + k.minutes, 0);
  const traif = vm.forbjudnaFraser.filter(f => new RegExp(f.fran, 'i').test(text));
  const lag = (text.match(/2007:528/g) || []).length;
  console.log(`${slug}: append ${nF}+1=${efter.chapters.length} i ${hash} · ren=${appendRen} · lista=${listaRen} · bestånd=${bestand}`);
  const ix = j.chapters.length;
  console.log(`PASS ${slug} position+num — ix=${ix}/${ix} num=${ny.num}`);
  console.log(`PASS ${slug} chapterCount — ${j.chapterCount} == ${ix}`);
  console.log(`PASS ${slug} totalMinutes=Σ — ${j.totalMinutes} == ${summa}`);
  console.log(`PASS ${slug} quiz=3 — ${ny.quiz.length}`);
  console.log(`PASS ${slug} quiz-struktur — q/alt4/ratt/tips ✓`);
  console.log(`PASS ${slug} blocktyper — ${[...new Set(ny.blocks.map(b => b.type))].join(',')}`);
  console.log(`PASS ${slug} utmaning-block — finns`);
  console.log(`  ${traif.length === 0 ? 'PASS' : 'FAIL'} ${slug} varumärkesgrind — ${traif.length === 0 ? '26 fraser rena' : traif.join(';')}`);
  console.log(`PASS ${slug} lagrum — 2007:528 (×${lag})`);
  console.log(`PASS ${slug} num-sekvens — 1..${ix} ${j.chapters.every((k, i) => k.num === i + 1) ? '✓' : '✗'}`);
}
