// Neutral granskning av d16 (bollinger) — deras KVD kräver borta /tmp-backup.
import fs from 'node:fs';
const j = JSON.parse(fs.readFileSync('data/bokmaster/bollinger-on-bollinger-bands.json', 'utf8'));
const ny = j.chapters.at(-1);
const text = JSON.stringify(ny);
let fel = 0;
const ok = (n, v, d) => { console.log(`${v ? 'GRÖN' : 'RÖD'}  ${n}${d ? ' — ' + d : ''}`); if (!v) fel++; };

ok('chapterCount == len', j.chapterCount === j.chapters.length, `${j.chapterCount}/${j.chapters.length}`);
ok('totalMinutes == Σ', j.totalMinutes === j.chapters.reduce((a, k) => a + k.minutes, 0), `${j.totalMinutes}`);
ok('kapitel 15 titel+num+min', ny.num === 15 && ny.title === 'Från boken till egen analys' && ny.minutes >= 11 && ny.minutes <= 14, `num=${ny.num} min=${ny.minutes}`);
ok('quiz=3 + format + unika ratt', ny.quiz.length === 3 && ny.quiz.every(q => q.q && q.alternativ.length === 4 && Number.isInteger(q.ratt) && q.ratt >= 0 && q.ratt <= 3 && q.tips) && new Set(ny.quiz.map(q => q.ratt)).size === 3, `ratt ${ny.quiz.map(q => q.ratt).join(',')}`);
ok('utmaning+insikt+tabell-block', ['utmaning', 'insikt', 'tabell'].every(t => ny.blocks.some(b => b.type === t)), ny.blocks.map(b => b.type).join(','));
const vm = JSON.parse(fs.readFileSync('data/varumarke.json', 'utf8'));
const traif = vm.forbjudnaFraser.filter(f => new RegExp(f.fran, 'i').test(text));
ok('varumärkesgrind 0/26', traif.length === 0, traif.join(';'));
const lagBland = ['2022:260', '2022:261', '1985:716', '2022:482', '2005:59'].filter(l => text.includes(l));
ok('lagrum endast 2007:528 ≥2', lagBland.length === 0 && (text.match(/2007:528/g) || []).length >= 2, `×${(text.match(/2007:528/g) || []).length}`);
const karn = ['ERIC-B.ST', 'Yahoo Finance', '2026-09-24', '1 952,21', '97,61', '49,21', '2,46', '1,57', '100,75', '94,47', '96,76', '101,25', '94,04', '6,4 %', '1,8 %', '98,70', '98,96', '132', '13,25', '12,75', 'walking the bands', 'squeeze', 'rekommendation', '2007:528'];
const saknas = karn.filter(t => !text.includes(t));
ok(`kärntal ${karn.length - saknas.length}/${karn.length}`, saknas.length / karn.length <= 0.2, saknas.length ? 'SAKNAS: ' + saknas.join(',') : 'alla');
ok('käll-/övningsdeklaration', /Pedagogisk genomräkning på verkliga dagsslutkurser, Ericsson B \(ERIC-B\.ST\), källa Yahoo Finance, hämtat 2026-09-24 — en övning i att räkna, inte en rekommendation \(2007:528\)/.test(text));
const radgiv = [/\bköp\b[^.]*\baktie\b/i, /\bsälj\b[^.]*\baktie\b/i, /\bbör du köpa\b/i, /\brekommenderar (?:att )?köp/i].filter(re => re.test(text));
ok('inga köp/sälj-formuleringar', radgiv.length === 0);
ok('num-sekvens 1..15', j.chapters.every((k, i) => k.num === i + 1));
console.log(fel === 0 ? '\nd16 NEUTRAL GRANSKNING: GRÖN' : `\nRÖD — ${fel}`);
process.exit(fel ? 1 : 0);
