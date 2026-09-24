// v166-d12 KVD — mekanisk efterkontroll av djupkapitel 15 i
// data/bokmaster/the-master-swing-trader.json enligt DESIGN-v166:
// JSON ✓ · chapterCount == len · totalMinutes == Σ · quiz = 3 {q,alternativ[4],ratt,tips}
// · varumärkesgrind 0 träffar på NYA kapitlet · blockstruktur · talmarkörer ≥ 80 %.
import { readFileSync } from 'node:fs';

const SOKVAG = '/home/ak1a/AK1/data/bokmaster/the-master-swing-trader.json';
let ok = true;
const fail = (m) => { ok = false; console.log('RÖD:', m); };
const pass = (m) => console.log('GRÖN:', m);

let bok;
try {
  bok = JSON.parse(readFileSync(SOKVAG, 'utf8'));
  pass('JSON giltig (parse ok)');
} catch (e) {
  console.log('RÖD: JSON ogiltig —', e.message);
  process.exit(1);
}

const kap = bok.chapters.find((k) => k.num === 15);
if (!kap) { console.log('RÖD: kapitel 15 saknas'); process.exit(1); }

// 1. Σ-konsistens.
const sum = bok.chapters.reduce((s, k) => s + k.minutes, 0);
if (bok.chapterCount === bok.chapters.length && bok.chapterCount === 15) pass(`chapterCount ${bok.chapterCount} == len(chapters) ${bok.chapters.length}`);
else fail(`chapterCount ${bok.chapterCount} != len ${bok.chapters.length}`);
if (bok.totalMinutes === sum && sum === 190) pass(`totalMinutes ${bok.totalMinutes} == Σ ${sum}`);
else fail(`totalMinutes ${bok.totalMinutes} != Σ ${sum}`);

// 2. chapters_list-konsistens (15 poster, post 15 = {num,title,minutes}).
const cl = bok.chapters_list;
if (cl.length === 15) pass('chapters_list 15 poster');
else fail(`chapters_list ${cl.length} poster`);
const p15 = cl[14];
if (p15 && p15.num === 15 && p15.title === 'Från boken till egen analys' && p15.minutes === 13)
  pass('chapters_list[14] = {num:15, title, minutes:13}');
else fail('chapters_list[14] fel format: ' + JSON.stringify(p15));
const titMatch = bok.chapters.every((k) =>
  cl.some((p) => typeof p === 'string' ? p.startsWith(k.num + '. ') : p.num === k.num));
if (titMatch) pass('varje kapitel har post i chapters_list');

// 3. Quiz = 3, struktur + påståendeform (ratt-index giltiga, unika lägen).
if (Array.isArray(kap.quiz) && kap.quiz.length === 3) pass('quiz = 3 frågor');
else fail('quiz != 3');
const rattLagen = new Set();
kap.quiz.forEach((q, i) => {
  const bra = q && typeof q.q === 'string' && Array.isArray(q.alternativ) && q.alternativ.length === 4 &&
    Number.isInteger(q.ratt) && q.ratt >= 0 && q.ratt < 4 && typeof q.tips === 'string' && q.tips.length > 0;
  if (bra) { rattLagen.add(q.ratt); pass(`quiz[${i}] {q, alternativ[4], ratt=${q.ratt}, tips} ok`); }
  else fail(`quiz[${i}] fel struktur`);
});
if (rattLagen.size === 3) pass('unika ratt-lägen: ' + [...rattLagen].join(','));

// 4. Blockstruktur enligt DESIGN-v166-tabellen.
const struktur = kap.blocks.map((b) => b.type).join('/');
const vantad = 'text/text/utmaning/text/tabell/text/insikt';
if (struktur === vantad) pass('blockstruktur ' + struktur);
else fail('blockstruktur ' + struktur + ' != ' + vantad);
if (typeof kap.intro === 'string' && kap.minutes >= 11 && kap.minutes <= 14) pass(`intro finns, minutes ${kap.minutes} ∈ [11,14]`);
else fail('intro/minutes utanför kontrakt');

// 5. Varumärkesgrind — data/varumarke.json alla mönster mot ENDAST nya kapitlet.
const vm = JSON.parse(readFileSync('/home/ak1a/AK1/data/varumarke.json', 'utf8'));
const haystack = JSON.stringify(kap);
let träffar = 0;
for (const regel of vm.forbjudnaFraser) {
  let re;
  try { re = new RegExp(regel.fran, 'gu'); } catch (e) { re = new RegExp(regel.fran, 'g'); }
  if (re.test(haystack)) { träffar++; fail(`varumärke: "${regel.fran}" (${regel.allvar}) — ${regel.motiv}`); }
}
if (träffar === 0) pass(`varumärkesgrind 0 träffar (${vm.forbjudnaFraser.length} mönster)`);

// 6. Juridikgrind: 2007:528 närvarande; käll- och övningsdeklaration ordagrant; negerat "investeringsråd".
const juridik =
  kap.blocks.map((b) => b.content).join('\n') + '\n' + kap.intro;
const dekl = [
  'Pedagogisk övning på historisk data, Ericsson B (ERIC-B.ST), källa Yahoo Finance, hämtat 2026-09-24 — en genomräkning, inte en rekommendation (2007:528)',
  'Utbildningsmaterial — beskriver hur metoden fungerar med källmärkta, historiska exempel; inga investeringsråd, inga avkastningslöften (2007:528)'
];
dekl.forEach((d, i) => juridik.includes(d) ? pass(`deklaration ${i + 1} ordagrant ✓`) : fail(`deklaration ${i + 1} saknas ordagrant`));
const n528 = (haystack.match(/2007:528/g) || []).length;
if (n528 >= 2) pass(`2007:528 ×${n528}`);
else fail('2007:528 närvaro för låg: ' + n528);

// 7. Talmarkörer från underlaget (överföringsbevis, ≥ 80 %).
const markorer = [
  'två till fem', '91,50', '23 juli', '91–100', '93,82', '96,7', '96,76', '100,50', '96,50',
  '4,00', '4,0 %', '112,50', '112,75', '14 juli', '12,00', '11,9 %', '3,0', '1 %', '100 000',
  '1 000', '25 000', '−1 000', '−1,0 %', '2 985', '+3,0 %', '1 985', '40 %', '0,4 × 11,9',
  '0,6 × 4,0', '+2,4 %', 'utbrottsgap', 'fortsättningsgap', 'utmattningssgap', 'Yahoo Finance',
  'ERIC-B.ST', '2026-09-24', 'högre bottnar', 'utmattning, vändning, utbrott, trend, konsolidering',
  'tålmodighet är en position', 'ingen nivå, inget beslut'
];
const saknade = markorer.filter((m) => !haystack.includes(m));
const andel = Math.round(((markorer.length - saknade.length) / markorer.length) * 100);
if (andel >= 80) pass(`talmarkörer ${markorer.length - saknade.length}/${markorer.length} (${andel} %)` + (saknade.length ? ' — saknade: ' + saknade.join(' | ') : ''));
else fail(`talmarkörer ${andel} % (< 80) — saknade: ${saknade.join(' | ')}`);

// 8. Nya kapitlet innehåller inga köp/sälj-formuleringar (metod-språk).
const handlingsrad = /\b(köp|sälj|köp nu|sälj nu| Köp | Sälj )\b/i;
if (!handlingsrad.test(haystack)) pass('inga köp/sälj-formuleringar');
else fail('köp/sälj-formulering hittad');

console.log(ok ? '\nKVD TOTAL: GRÖN' : '\nKVD TOTAL: RÖD');
process.exit(ok ? 0 : 1);
