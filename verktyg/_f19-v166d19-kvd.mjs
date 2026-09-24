// v166-d19 KVD — mekanisk efterkontroll av the-complete-turtletrader.json efter append.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const FIL = 'data/bokmaster/the-complete-turtletrader.json';
let po = 0, pa = 0;
const k = (namn, ok, detalj = '') => { pa++; if (ok) { po++; console.log(`PASS ${namn}${detalj ? ' — ' + detalj : ''}`); } else console.log(`FEL ${namn}${detalj ? ' — ' + detalj : ''}`); };

// 1. JSON giltig
const ny = fs.readFileSync('/home/ak1a/AK1/' + FIL, 'utf8');
let b; try { b = JSON.parse(ny); k('JSON giltig', true); } catch (e) { k('JSON giltig', false, e.message); process.exit(1); }

// 2–3. chapterCount / totalMinutes / Σ
const sum = b.chapters.reduce((s, c) => s + c.minutes, 0);
k('chapterCount == len(chapters)', b.chapterCount === b.chapters.length, `${b.chapterCount} == ${b.chapters.length}`);
k('totalMinutes == Σ', b.totalMinutes === sum, `${b.totalMinutes} == ${sum}`);
k('chapters_list == len(chapters)', b.chapters_list.length === b.chapters.length, `${b.chapters_list.length}`);

// 4. nya kapitlet
const kap = b.chapters.at(-1);
k('num = 15 (sista+1)', kap.num === 15);
k('title = "Från boken till egen analys"', kap.title === 'Från boken till egen analys');
k('minutes 11–14', kap.minutes >= 11 && kap.minutes <= 14, `${kap.minutes}`);
k('intro finns (2–3 meningar)', typeof kap.intro === 'string' && kap.intro.length > 80);

// blockstruktur enligt designens mappning
const foljd = kap.blocks.map(x => x.type).join('/');
k('blockstruktur enligt design', foljd === 'text/text/utmaning/text/tabell/text/insikt', foljd);
k('alla block har type+content', kap.blocks.every(x => typeof x.type === 'string' && typeof x.content === 'string' && x.content.length > 0));

// tabell-blockets inre JSON (underlagets tabell: 4 rader × 7 kol)
let tabellOk = false, tabellDetalj = '';
try { const t = JSON.parse(kap.blocks.find(x => x.type === 'tabell').content); tabellOk = !!t.rubrik && Array.isArray(t.rader) && t.rader.length === 4 && t.rader.every(r => Array.isArray(r) && r.length === 7); tabellDetalj = `${t.rader.length} rader × 7 kol`; } catch (e) { tabellDetalj = e.message; }
k('tabell-content giltig inre JSON (rubrik + 4×7)', tabellOk, tabellDetalj);

// quiz = 3, format, unika ratt-lägen
k('quiz = 3', Array.isArray(kap.quiz) && kap.quiz.length === 3);
const qOk = kap.quiz.every(q => typeof q.q === 'string' && Array.isArray(q.alternativ) && q.alternativ.length === 4 && Number.isInteger(q.ratt) && q.ratt >= 0 && q.ratt <= 3 && typeof q.tips === 'string' && q.tips.length > 10);
k('quizformat {q, alternativ[4], ratt, tips}', qOk);
const ratt = kap.quiz.map(q => q.ratt);
k('unika ratt-lägen', new Set(ratt).size === 3, JSON.stringify(ratt));

// 5. juridikgrind: konstruerade-tal-deklaration + kursunderlagsdeklaration ordagrant, 2007:528
const hela = JSON.stringify(kap);
const dekl1 = 'Genomgångshypotetiskt exempel med konstruerade tal — inte historisk data';
const dekl2 = 'Kursunderlag — utbildning om hur metoden och historien fungerar; hypotetiska övningstal, inga investeringsråd, inga avkastningslöften (2007:528)';
k('konstruerade-tal-deklaration ordagrant', kap.blocks.some(x => x.content.includes(dekl1)));
k('kursunderlagsdeklaration ordagrant', kap.blocks.some(x => x.content.includes(dekl2)));
const n528 = (hela.match(/2007:528/g) || []).length;
k('2007:528 × ≥2', n528 >= 2, `${n528} träffar`);

// 6. varumärkesgrind: 0 träffar i HELA nya kapitlet (intro + blocks + quiz)
const vm = JSON.parse(fs.readFileSync('/home/ak1a/AK1/data/varumarke.json', 'utf8'));
let traf = 0; const detaljer = [];
for (const r of vm.forbjudnaFraser) {
  const re = new RegExp(r.fran, 'gu');
  const m = hela.match(re);
  if (m) { traf += m.length; detaljer.push(`${r.fran}: ${m.length}`); }
}
k('varumärkesgrind 0 träffar', traf === 0, `${vm.forbjudnaFraser.length} mönster${detaljer.length ? ' — ' + detaljer.join('; ') : ''}`);

// 7. talmarkörer ≥ 80 % (överföringsbevis från underlaget f19)
const markorer = ['2007', '1983', '1984', 'uppemot tusen ansökningar', 'ett tjugotal', 'två veckors', 'poker och bridge', '100 miljoner dollar', 'Jerry Parker', 'Chesapeake Capital', 'Liz Cheval', 'EMC Capital', 'Paul Rabar', 'Tom Shanks', '1987–88', 'Dennis', 'Eckhardt', 'Faith', 'Covel', '100 000 kr', '1 % av saldot', '1 000 / 5 = 200', '990 / 2,50 = 396', '980 / 4 = 245', '(110 − 80) × 245', '+7 350 kr', '0,99 × 0,99 × 1,075', '1,0536', '105 360', '+5,4 %', 'två förluster av tre affärer', '100 / 95 kr', '50,00 / 47,50 kr', '80 / 76 kr', '99 000', '98 010', '1 000 kr', '990 kr', '980 kr', 'stopp: −1 000 kr', 'stopp: −990 kr', 'trend-exit 110', 'F14', 'F18', 'F20'];
const saknade = markorer.filter(m => !hela.includes(m));
const pct = Math.round(100 * (markorer.length - saknade.length) / markorer.length);
k('talmarkörer ≥ 80 %', pct >= 80, `${markorer.length - saknade.length}/${markorer.length} (${pct} %)${saknade.length ? ' saknar: ' + saknade.join(', ') : ''}`);

// 8. append-only: kapitel 1–14 + övriga fält bit-identiska mot HEAD
const gamlaRaw = execFileSync('git', ['-C', '/home/ak1a/AK1', 'show', `HEAD:${FIL}`], { encoding: 'utf8' });
const g = JSON.parse(gamlaRaw);
const cshr = JSON.stringify(g.chapters) === JSON.stringify(b.chapters.slice(0, 14));
const falt = ['slug', 'category', 'weight', 'title', 'summary', 'minutes', 'xp', 'level', 'learn', 'why', 'kalla'];
const faltOk = falt.every(f0 => JSON.stringify(g[f0]) === JSON.stringify(b[f0]));
const clOk = JSON.stringify(g.chapters_list) === JSON.stringify(b.chapters_list.slice(0, 14));
k('kapitel 1–14 bit-identiska', cshr);
k('chapters_list 1–14 orörda (strängposter)', clOk);
k('övriga toppfält orörda', faltOk);
k('chapters_list-post 15 = {num,title,minutes}', JSON.stringify(b.chapters_list[14]) === '{"num":15,"title":"Från boken till egen analys","minutes":12}', JSON.stringify(b.chapters_list[14]));

console.log(`\nKVD: ${po}/${pa} PASS${po === pa ? ' — GRÖN' : ' — RÖD'}`);
process.exit(po === pa ? 0 : 1);
