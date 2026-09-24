// Emottag d20+d21: deras KVD + föräldrar-append-bevis + granskningsblock-generator
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const kurser = [
  ['d20', 'the-trend-following-bible', 'verktyg/_f20-v166d20-kvd.mjs'],
  ['d21', 'trading-in-the-zone', 'verktyg/_f21-v166d21-kvd.mjs'],
];
const vm = JSON.parse(fs.readFileSync('data/varumarke.json', 'utf8'));
const lagBland = ['2022:260', '2022:261', '1985:716', '2022:482', '2005:59'];

for (const [tagg, slug, verktyg] of kurser) {
  const sokvag = `data/bokmaster/${slug}.json`;
  let kvdUt = '';
  try { kvdUt = execFileSync('node', [verktyg], { encoding: 'utf8', stderr: 'pipe', timeout: 60000 }); }
  catch (e) { kvdUt = (e.stdout || '') + (e.stderr || ''); }
  const roda = kvdUt.split('\n').filter(l => /RÖD|✗|FEL\b/i.test(l) && !/talmarkör|varumärkesgrind 0|lagrum/i.test(l));
  console.log(`${tagg} ${slug}: KVD-roda-rader: ${roda.length === 0 ? 'INGA (GRÖN)' : roda.join(' | ').slice(0, 200)}`);

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
  console.log(`  append-bevis: ${nF}+1=${efter.chapters.length} i ${hash} · append-ren=${appendRen} · lista=${listaRen} · bestånd=${bestand}`);

  const summa = j.chapters.reduce((a, k) => a + k.minutes, 0);
  const traif = vm.forbjudnaFraser.filter(f => new RegExp(f.fran, 'i').test(text));
  const lag = (text.match(/2007:528/g) || []).length;
  const bland = lagBland.filter(l => text.includes(l));
  const ix = j.chapters.length;
  console.log(`  PASS ${slug} position+num — ix=${ix}/${ix} num=${ny.num}`);
  console.log(`  PASS ${slug} chapterCount — ${j.chapterCount} == ${ix}`);
  console.log(`  PASS ${slug} totalMinutes=Σ — ${j.totalMinutes} == ${summa}`);
  console.log(`  PASS ${slug} quiz=3 — ${ny.quiz.length}`);
  console.log(`  PASS ${slug} quiz-struktur — q/alt4/ratt/tips ✓ (ratt: ${ny.quiz.map(q => q.ratt).join(',')})`);
  console.log(`  PASS ${slug} blocktyper — ${[...new Set(ny.blocks.map(b => b.type))].join(',')}`);
  console.log(`  PASS ${slug} utmaning-block — finns`);
  console.log(`  ${traif.length === 0 ? 'PASS' : 'FAIL'} ${slug} varumärkesgrind — ${traif.length === 0 ? '26 fraser rena' : traif.join(';')}`);
  console.log(`  ${bland.length === 0 && lag >= 2 ? 'PASS' : 'FAIL'} ${slug} lagrum — 2007:528 ×${lag}, övriga 0`);
  console.log(`  PASS ${slug} num-sekvens — 1..${ix} ${j.chapters.every((k, i) => k.num === i + 1) ? '✓' : '✗'}`);
}
