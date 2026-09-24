// v166-d16 KVD — mekanisk efterkontroll av appendad kurs enligt DESIGN-v166.
import { readFileSync } from 'node:fs';

const FIL = '/home/ak1a/AK1/data/bokmaster/bollinger-on-bollinger-bands.json';
const BACKUP = '/tmp/d16-backup.json';
const VM = '/home/ak1a/AK1/data/varumarke.json';

let pass = 0, fail = 0;
const ok = (namn) => { pass++; console.log('PASS', namn); };
const nej = (namn, det) => { fail++; console.log('FEL', namn, '—', det); };

const j = JSON.parse(readFileSync(FIL, 'utf8'));
const gammal = JSON.parse(readFileSync(BACKUP, 'utf8'));

// 1. JSON giltig (parse ovan) + struktur
ok('JSON giltig');

// 2. chapterCount == len
if (j.chapterCount === j.chapters.length && j.chapterCount === 15) ok('chapterCount 15 == len(chapters)'); else nej('chapterCount', j.chapterCount + '/' + j.chapters.length);

// 3. totalMinutes == Σ
const summa = j.chapters.reduce((s, c) => s + c.minutes, 0);
if (j.totalMinutes === summa && summa === 183) ok('totalMinutes 183 == Σ'); else nej('totalMinutes', j.totalMinutes + ' vs ' + summa);

// 4. Append-only: kapitel 1–14 + alla övriga fält bit-identiska
const nyaGamlaSamma = JSON.stringify(j.chapters.slice(0, 14)) === JSON.stringify(gammal.chapters)
  && JSON.stringify(j.chapters_list.slice(0, 14)) === JSON.stringify(gammal.chapters_list)
  && JSON.stringify({ ...j, chapters: null, chapters_list: null, chapterCount: null, totalMinutes: null })
     === JSON.stringify({ ...gammal, chapters: null, chapters_list: null, chapterCount: null, totalMinutes: null });
if (nyaGamlaSamma) ok('append-only: kapitel 1–14 + övriga fält bit-identiska'); else nej('append-only', 'befintligt innehåll förändrat');

// 5. chapters_list: sista posten {num,title,minutes}
const cl = j.chapters_list[14];
if (cl && cl.num === 15 && cl.title === 'Från boken till egen analys' && cl.minutes === 13) ok('chapters_list post 15 = {num,title,minutes}'); else nej('chapters_list', JSON.stringify(cl));

// 6. Blockstruktur
const k = j.chapters[14];
const struktur = k.blocks.map(b => b.type).join('/');
if (struktur === 'text/text/utmaning/text/tabell/text/text/insikt') ok('blockstruktur text/text/utmaning/text/tabell/text/text/insikt'); else nej('blockstruktur', struktur);

// 7. Quiz = 3, format + unika ratt-lägen
const quizOk = k.quiz.length === 3
  && k.quiz.every(q => q.q && Array.isArray(q.alternativ) && q.alternativ.length === 4
    && Number.isInteger(q.ratt) && q.ratt >= 0 && q.ratt <= 3 && q.tips)
  && new Set(k.quiz.map(q => q.ratt)).size === 3;
if (quizOk) ok('quiz = 3, format {q,alternativ[4],ratt,tips}, unika ratt-lägen'); else nej('quiz', JSON.stringify(k.quiz.map(q => ({ ratt: q.ratt, n: q.alternativ.length }))));

// 8. Varumärkesgrind: 26 mönster på hela NYA kapitlet (intro+blocks+quiz)
const vm = JSON.parse(readFileSync(VM, 'utf8'));
const kapText = JSON.stringify([k.intro, ...k.blocks.map(b => b.content), k.quiz]);
let Traff = 0;
for (const f of vm.forbjudnaFraser) {
  const re = new RegExp(f.fran, 'giu');
  const m = kapText.match(re);
  if (m) { Traff++; nej('varumärkesgrind', `"${m[0]}" matchar /${f.fran}/`); }
}
if (Traff === 0) ok('varumärkesgrind 0 träffar (26 mönster)');

// 9. Käll-/övningsdeklaration + juridik
const KALL = 'Pedagogisk genomräkning på verkliga dagsslutkurser, Ericsson B (ERIC-B.ST), källa Yahoo Finance, hämtat 2026-09-24 — en övning i att räkna, inte en rekommendation (2007:528).';
const UTB = 'Utbildningsmaterial — beskriver hur metoden fungerar med källmärkta, historiska exempel; inga investeringsråd, inga avkastningslöften (2007:528).';
if (kapText.includes(KALL)) ok('källdeklaration ordagrant'); else nej('källdeklaration', 'saknas');
if (kapText.includes(UTB)) ok('utbildningsdeklaration ordagrant'); else nej('utbildningsdeklaration', 'saknas');
const antal528 = (kapText.match(/2007:528/g) || []).length;
if (antal528 >= 2) ok(`2007:528 förekommer ${antal528} gånger`); else nej('2007:528', antal528 + ' gång(er)');

// 10. Talmarkörer ≥ 80 % (överföringsbevis — underlagets tal)
const markorer = [
  '1980', '5 %', '20 dagar', '2 standardavvikelser', '95 %', '2001',
  '96,76', '96,72', '96,48', '96,64', '96,80', '97,06', '97,24', '97,26', '96,78',
  '98,66', '98,04', '98,10', '98,96', '101,25', '99,98', '100,30', '96,52', '97,38', '94,04',
  '1 952,21', '97,61', '+3,64', '−3,57', '49,21', '13,25', '12,75', '26,0', '2,46',
  'n − 1', '1,57', '100,75', '94,47', '6,4 %', '1,8 %', '98,70', '132', '−7',
  '28 aug', '31 aug', '17 sep', '24 sep', '10 sep', '16 sep',
  'F03', 'F07', 'F11', 'F12', 'F13', 'F14', 'AKM2'
];
const saknade = markorer.filter(m => !kapText.includes(m));
const andel = Math.round(100 * (markorer.length - saknade.length) / markorer.length);
if (andel >= 80) ok(`talmarkörer ${markorer.length - saknade.length}/${markorer.length} = ${andel} %`); else nej('talmarkörer', andel + '% saknas: ' + saknade.join(', '));

// 11. minutes inom 11–14
if (k.minutes >= 11 && k.minutes <= 14) ok(`minutes ${k.minutes} ∈ 11–14`); else nej('minutes', k.minutes);

// 12. Tabellblockets content är giltig JSON-sträng med rubrik+rader
try {
  const t = JSON.parse(k.blocks[4].content);
  if (t.rubrik && Array.isArray(t.rader) && t.rader.length === 11 && t.rader[0].length === 6) ok('tabellcontent giltig (11 rader × 6 kolumner)'); else nej('tabellcontent', JSON.stringify(t).slice(0, 80));
} catch (e) { nej('tabellcontent', e.message); }

console.log(`\nKVD: ${pass} PASS · ${fail} FEL`);
process.exit(fail === 0 ? 0 : 1);
