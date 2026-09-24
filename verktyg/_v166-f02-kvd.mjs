// v166-d02 KVD: mekanisk efterkontroll av djupkapitlet mot DESIGN-v166-kontraktet
// (spegling av verktyg/_r175-granska.mjs:s kontroller, lokal sökväg, enbart denna kurs).
import fs from 'node:fs';

const BM = '/home/ak1a/AK1/data/bokmaster/vagfundament-variablerna-som-tidsserier.json';
const UNDERLAG = '/home/ak1a/AK1/data/forskning/KURS-FAS3/underlag-f02-vagfundament-tidsserier.md';
const BACKUP = '/tmp/vagfundament-pre-f02.json';
const fraser = JSON.parse(fs.readFileSync('/home/ak1a/AK1/data/varumarke.json', 'utf8'));
const monster = fraser.forbjudnaFraser.map(f => f.fran).filter(Boolean);

const TITEL = 'Från boken till egen analys';
let pass = 0, fel = 0;
const rader = [];
const ok = (v, n, d) => { if (v) pass++; else fel++; rader.push(`${v ? 'PASS' : 'FEL'} ${n} — ${d}`); };
const signifikantaTal = (t) => [...new Set((t.match(/\d+[.,]?\d*/g) || [])
  .map(s => s.replace(/[.,]$/, ''))
  .filter(s => s.length >= 2 && !/^(19|20)\d\d$/.test(s) && s !== '2007' && !/^528/.test(s)))];

const j = JSON.parse(fs.readFileSync(BM, 'utf8'));
const ix = j.chapters.findIndex(c => c.title === TITEL);
ok(ix !== -1, 'kapitel finns', ix === -1 ? 'SAKNAS' : `ix=${ix}`);
if (ix === -1) { console.log(rader.join('\n')); process.exit(1); }
const k = j.chapters[ix];
const n = j.chapters.length;
ok(ix === n - 1 && k.num === n, 'position+num', `ix=${ix + 1}/${n} num=${k.num}`);
ok(j.chapterCount === n, 'chapterCount', `${j.chapterCount} == ${n}`);
const sum = j.chapters.reduce((a, c) => a + c.minutes, 0);
ok(j.totalMinutes === sum, 'totalMinutes=Σ', `${j.totalMinutes} == ${sum}`);
ok(k.minutes >= 11 && k.minutes <= 14, 'minutes 11–14', `${k.minutes}`);
ok(n === 13 && j.chapters_list[12] && j.chapters_list[12].num === 13 &&
  j.chapters_list[12].title === TITEL && j.chapters_list[12].minutes === k.minutes,
  'chapters_list-append', JSON.stringify(j.chapters_list[12]));
ok(Array.isArray(k.quiz) && k.quiz.length === 3, 'quiz=3', `${(k.quiz || []).length}`);
const quizOk = (k.quiz || []).every(q => q.q && Array.isArray(q.alternativ) && q.alternativ.length === 4 && Number.isInteger(q.ratt) && q.ratt >= 0 && q.ratt <= 3 && q.tips);
ok(quizOk, 'quiz-struktur', quizOk ? 'q/alt4/ratt/tips ✓' : 'AVVIKELSE');
const typer = [...new Set(k.blocks.map(b => b.type))];
ok(typer.every(t => ['text', 'insikt', 'utmaning', 'tabell', 'visuell'].includes(t)), 'blocktyper', typer.join(','));
ok(typer.includes('utmaning'), 'utmaning-block', typer.includes('utmaning') ? 'finns' : 'SAKNAS');
ok(typer.includes('insikt'), 'insikt-block', typer.includes('insikt') ? 'finns' : 'SAKNAS');
ok(typeof k.intro === 'string' && k.intro.length > 0, 'intro', `${k.intro.length} tecken`);

const nyText = [k.intro, ...k.blocks.map(b => typeof b.content === 'string' ? b.content : JSON.stringify(b.content))].join('\n') + '\n' + k.quiz.flatMap(q => [q.q, ...q.alternativ, q.tips]).join('\n');
const traf = monster.filter(m => new RegExp('(?<!inte |ej |aldrig |ingen |inga |utan |varken |icke )' + m, 'giu').test(nyText));
ok(traf.length === 0, 'varumärkesgrind', traf.length ? `träffar: ${traf.join(', ')}` : `${monster.length} fraser rena`);
const lagrum = [...new Set(nyText.match(/\b\d{4}:\d+\b/g) || [])];
ok(lagrum.every(x => x === '2007:528'), 'lagrum', lagrum.join(',') || '—');
const underlag = fs.readFileSync(UNDERLAG, 'utf8');
const uTal = signifikantaTal(underlag);
const kTal = new Set(signifikantaTal(nyText));
const traeff = uTal.filter(t => kTal.has(t));
const kvot = uTal.length ? traeff.length / uTal.length : 1;
ok(kvot >= 0.7, 'talöverföring', `${traeff.length}/${uTal.length} = ${Math.round(kvot * 100)} % (krav ≥70)${traeff.length < uTal.length ? ' saknas: ' + uTal.filter(t => !kTal.has(t)).join(', ') : ''}`);
const seqOk = j.chapters.every((c, i2) => c.num === i2 + 1);
ok(seqOk, 'num-sekvens', seqOk ? '1..n ✓' : 'AVVIKELSE');

// append-only: gamla kapitel/lista byte-identiska mot backup
const pre = JSON.parse(fs.readFileSync(BACKUP, 'utf8'));
ok(JSON.stringify(j.chapters.slice(0, pre.chapters.length)) === JSON.stringify(pre.chapters), 'append-only chapters', `${pre.chapters.length} gamla orörda`);
ok(JSON.stringify(j.chapters_list.slice(0, pre.chapters_list.length)) === JSON.stringify(pre.chapters_list), 'append-only chapters_list', `${pre.chapters_list.length} gamla orörda`);
ok(Object.entries(pre).every(([kk, v]) =>
  ['chapterCount', 'totalMinutes', 'chapters', 'chapters_list'].includes(kk) || JSON.stringify(j[kk]) === JSON.stringify(v)), 'append-only övriga fält', 'slug/summary/learn/... orörda');

console.log(rader.join('\n'));
console.log(`\n=== ${pass} PASS · ${fel} FEL ===`);
process.exit(fel === 0 ? 0 : 1);
