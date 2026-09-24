#!/usr/bin/env node
// v166-d23 KVD — mekanisk efterkontroll av djupkapitel 15 i
// data/bokmaster/market-mind-games.json enligt DESIGN-v166.
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const FIL = 'data/bokmaster/market-mind-games.json';
const UNDERLAG = 'data/forskning/KURS-FAS3/underlag-f23-market-mind-games.md';
let pass = 0;
let fel = 0;
const k = (namn, ok, detalj = '') => {
  if (ok) {
    pass++;
    console.log(`  PASS ${namn}${detalj ? ' — ' + detalj : ''}`);
  } else {
    fel++;
    console.log(`  FEL  ${namn}${detalj ? ' — ' + detalj : ''}`);
  }
};
// Normalisering: whitespace → mellanslag, citattecken jämkas, markdown-* bort
const norm = (s) => s.replace(/\s+/g, ' ').replace(/[”“]/g, '"').replace(/\*/g, '');

console.log('KVD v166-d23 market-mind-games');

// 1. JSON giltig + struktur
const raw = fs.readFileSync(FIL, 'utf8');
let j = null;
try {
  j = JSON.parse(raw);
  k('JSON giltig', true);
} catch (e) {
  k('JSON giltig', false, e.message);
  process.exit(1);
}
k('chapterCount == len(chapters) == 15', j.chapterCount === 15 && j.chapters.length === 15, `cc=${j.chapterCount} len=${j.chapters.length}`);
const summa = j.chapters.reduce((a, c) => a + c.minutes, 0);
k('totalMinutes == Σ == 172', j.totalMinutes === summa && summa === 172, `tm=${j.totalMinutes} Σ=${summa}`);
const nya = j.chapters[j.chapters.length - 1];
k('nytt kapitel num=15, minutes 11–14, titel', nya.num === 15 && nya.minutes >= 11 && nya.minutes <= 14 && nya.title === 'Från boken till egen analys', `minutes=${nya.minutes}`);

// 2. Quiz = 3, format, unika ratt-lägen
k('quiz = 3', Array.isArray(nya.quiz) && nya.quiz.length === 3);
const quizOk = nya.quiz.every((q) => typeof q.q === 'string' && Array.isArray(q.alternativ) && q.alternativ.length === 4 && [0, 1, 2, 3].includes(q.ratt) && typeof q.tips === 'string');
const lagen = nya.quiz.map((q) => q.ratt);
k('quizformat {q, alternativ[4], ratt, tips}', quizOk, `ratt-lägen ${lagen.join(',')}`);
k('unika ratt-lägen', new Set(lagen).size === 3);

// 3. Blockstruktur enligt DESIGN-v166 (f23: text/text/utmaning/text/tabell/text/insikt)
const typer = nya.blocks.map((b) => b.type);
const forvantat = ['text', 'text', 'utmaning', 'text', 'tabell', 'text', 'insikt'];
k('blockstruktur', JSON.stringify(typer) === JSON.stringify(forvantat), typer.join('/'));

// 3b. Tabellens inre JSON giltig med underlagets rader
let tabellOk = false;
let tabellDetalj = '';
try {
  const t = JSON.parse(nya.blocks[4].content);
  tabellOk =
    t.rader.length === 4 &&
    t.rader[0].length === 6 &&
    t.rader[1][3] === '60/40' &&
    t.rader[2][0] === 'A — efter tre rakeförluster (F F F)' &&
    t.rader[2][3] === '40/60' &&
    t.rader[3][0] === 'B — efter tre vinster (V V V)' &&
    t.rader[3][3] === '80/20' &&
    t.rader[2][4] === '0,40·(+5) + 0,60·(−5) = −1 %' &&
    t.rader[3][4] === '0,80·(+5) + 0,20·(−5) = +3 %';
  tabellDetalj = `${t.rader.length} rader × ${t.rader[0].length} kol`;
} catch (e) {
  tabellDetalj = e.message;
}
k('tabell inre JSON giltig, lägena/oddsen/väntevärdena ordagrant', tabellOk, tabellDetalj);

// 4. Varumärkesgrind (data/varumarke.json) — 0 träffar på nya kapitlet
const vm = JSON.parse(fs.readFileSync('data/varumarke.json', 'utf8'));
const textNya = JSON.stringify(nya);
const traffar = [];
for (const { fran } of vm.forbjudnaFraser) {
  const re = new RegExp(fran, 'iu');
  if (re.test(textNya)) traffar.push(fran);
}
k(`varumärkesgrind 0 träffar (${vm.forbjudnaFraser.length} mönster)`, traffar.length === 0, traffar.join(' | '));

// 5. Juridikgrind: övnings- + genomgångsdeklaration ordagrant, 2007:528, inga rådsformuleringar
const OVNING = 'Hypotetisk övningsmodell: i 100 historiskt liknande lägen (pappersdata)';
const JURI = 'Utbildningsmaterial — beskriver hur metoden fungerar med hypotetisk pappersdata; inga investeringsråd, inga avkastningslöften (2007:528).';
const ARITMETIK = 'ren aritmetik på underlagets antaganden — ingen hämtad serie';
k('övningsdeklaration ordagrant', textNya.includes(OVNING));
k('juristikdeklaration ordagrant', textNya.includes(JURI));
k('genomgångsdeklaration (aritmetik/antaganden) ordagrant', textNya.includes(ARITMETIK));
k('2007:528 närvaro ≥ 2', (textNya.match(/2007:528/g) || []).length >= 2, `${(textNya.match(/2007:528/g) || []).length} träffar`);
const rads = textNya.match(/\b(köp|sälj)\s+(denna|den här|aktien|nu|snabbt)\b/i);
k('inga köp/sälj-rådsformuleringar', rads === null, rads ? rads[0] : '');
k('inga avkastningslöften', !/garanterad[^\n]*avkastning|obegränsad[^\n]*avkastning/i.test(textNya));

// 6. Talmarkörer från underlaget — DUBBELRIKTAT (varje markör i både kapitel
//    och underlag, normaliserat: inga påhittade tal, inga borttappade)
const markorer = [
  'kroppens komprimerade bedömningar',
  '"ren rationalitet" utan känslor existerar inte i hjärnan',
  'fria radikaler',
  'läs reaktionen exakt',
  'jag skäms över att jag gick ur för tidigt',
  'en dold styrman',
  'Tre frågor, en minut',
  'styrka 1–10',
  '"Jag känner inget"',
  'neutralitet inför ett beslut med reell risk är en reaktion värd att notera',
  'Känslan får INTE bestämma — den får rapportera',
  'Beslutet fattas mot planen, med känslan på bordet',
  'metodträning, aldrig råd om live-affärer (2007:528)',
  'Hypotetisk övningsmodell',
  '100 historiskt liknande lägen (pappersdata)',
  '60 st av +5 % och 40 st av −5 % inom en månad',
  '0,60·(+5) + 0,40·(−5) = +1 %',
  'efter tre rakeförluster (F F F)',
  'ryggradsrädsla',
  '"men 40 % går ju dåligt"',
  '0,40·(+5) + 0,60·(−5) = −1 %',
  'efter tre vinster (V V V)',
  '"det här kan jag"',
  '"bra odds ≈ nästan säkert"',
  '0,80·(+5) + 0,20·(−5) = +3 %',
  'känslan agerar som omviktare',
  'flyttar 20 sannolikhetspunkter',
  '2 procentenheter fel i vardera riktning',
  'spread på 4 enheter',
  '0,45³ ≈ 9 %',
  '0,55³ ≈ 17 %',
  'normala kluster med full kant',
  'klustret som budskap, fast det är brus',
  'rätta tillbaka 60/40 och läsa siffran som den är',
  'känsla utan namn',
  'Journalen är väderstation, inte kloster',
  'data om mig, inte prognos om marknaden',
  'Fel objekt',
  'förklarar kroppen',
  'acceptera serien, vilja inte veta',
  'V01–V20',
  'vilken känsla, vilket objekt, vilken konflikt med planen',
  'metod ger siffran, psykologin lär oss läsa den',
  'aldrig som råd eller löfte (2007:528)',
];
const kap = norm(textNya);
const und = norm(fs.readFileSync(UNDERLAG, 'utf8'));
const saknadeKap = markorer.filter((m) => !kap.includes(m));
const saknadeUnd = markorer.filter((m) => !und.includes(m));
const andel = Math.round(((markorer.length - saknadeKap.length) / markorer.length) * 100);
k(
  `talmarkörer ≥ 80 % DUBBELRIKTAT (${markorer.length - saknadeKap.length}/${markorer.length} = ${andel} %)`,
  andel >= 80 && saknadeKap.length === 0 && saknadeUnd.length === 0,
  (saknadeKap.length ? 'saknade i kapitel: ' + saknadeKap.join(' ; ') : 'alla i kapitlet') +
    (saknadeUnd.length ? ' | saknade i underlag: ' + saknadeUnd.join(' ; ') : ' | alla i underlaget'),
);

// 7. Append-only: kapitel 1–14 + chapters_list 1–14 + övriga toppfält bit-identiska mot HEAD
const gamlaRaw = execSync(`git show HEAD:${FIL}`, { encoding: 'utf8' });
const g = JSON.parse(gamlaRaw);
const kapOk = g.chapters.slice(0, 14).every((c, i) => JSON.stringify(c) === JSON.stringify(j.chapters[i]));
k('kapitel 1–14 bit-identiska', kapOk && j.chapters.length === 15);
const listOk = g.chapters_list.slice(0, 14).every((c, i) => JSON.stringify(c) === JSON.stringify(j.chapters_list[i]));
k('chapters_list 1–14 orörda (strängposter)', listOk);
k(
  'chapters_list-post 15 = {num,title,minutes}',
  JSON.stringify(j.chapters_list[14]) === '{"num":15,"title":"Från boken till egen analys","minutes":12}',
);
const topp = ['slug', 'category', 'weight', 'title', 'summary', 'minutes', 'xp', 'level', 'learn', 'why', 'kalla'];
const toppOk = topp.every((f) => JSON.stringify(g[f]) === JSON.stringify(j[f]));
k('övriga toppfält orörda', toppOk);

// 8. Befintliga kapitels quiz oförändrade (extra skydd) — täcks av bit-identitet; sammanfattning
console.log(`\nKVD SAMMANFATTNING: ${pass} PASS · ${fel} FEL`);
process.exit(fel === 0 ? 0 : 1);
