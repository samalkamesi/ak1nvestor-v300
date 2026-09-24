// v166-d18 KVD — mekanisk efterkontroll av way-of-the-turtle.json efter append.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const FIL = 'data/bokmaster/way-of-the-turtle.json';
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

// tabell-blockets inre JSON
let tabellOk = false, tabellDetalj = '';
try { const t = JSON.parse(kap.blocks.find(x => x.type === 'tabell').content); tabellOk = !!t.rubrik && Array.isArray(t.rader) && t.rader.length === 9 && t.rader.every(r => Array.isArray(r) && r.length === 4); tabellDetalj = `${t.rader.length} rader × 4 kol`; } catch (e) { tabellDetalj = e.message; }
k('tabell-content giltig inre JSON (rubrik + 9×4)', tabellOk, tabellDetalj);

// quiz = 3, format, unika ratt-lägen
k('quiz = 3', Array.isArray(kap.quiz) && kap.quiz.length === 3);
const qOk = kap.quiz.every(q => typeof q.q === 'string' && Array.isArray(q.alternativ) && q.alternativ.length === 4 && Number.isInteger(q.ratt) && q.ratt >= 0 && q.ratt <= 3 && typeof q.tips === 'string' && q.tips.length > 10);
k('quizformat {q, alternativ[4], ratt, tips}', qOk);
const ratt = kap.quiz.map(q => q.ratt);
k('unika ratt-lägen', new Set(ratt).size === 3, JSON.stringify(ratt));

// 5. juridikgrind: käll- + övningsdeklaration ordagrant, 2007:528
const hela = JSON.stringify(kap);
const kall = 'Genomgående övning på historisk data: OMX Stockholm PI (^OMX), källa Yahoo Finance, hämtat 2026-09-24';
const kall2 = 'Genomgången, inte en rekommendation (2007:528)';
const ovn = 'Utbildningsmaterial — beskriver hur metoden fungerar med källmärkta, historiska exempel; inga investeringsråd, inga avkastningslöften (2007:528)';
k('källdeklaration ordagrant', kap.blocks.some(x => x.content.includes(kall)));
k('genomgångsdeklaration ordagrant', kap.blocks.some(x => x.content.includes(kall2)));
k('övningsdeklaration ordagrant', kap.blocks.some(x => x.content.includes(ovn)));
const n528 = (hela.match(/2007:528/g) || []).length;
k('2007:528 × ≥3', n528 >= 3, `${n528} träffar`);

// 6. varumärkesgrind: 0 träffar i HELA nya kapitlet (intro + blocks + quiz)
const vm = JSON.parse(fs.readFileSync('/home/ak1a/AK1/data/varumarke.json', 'utf8'));
let traf = 0; const detaljer = [];
for (const r of vm.forbjudnaFraser) {
  const re = new RegExp(r.fran, 'gu');
  const m = hela.match(re);
  if (m) { traf += m.length; detaljer.push(`${r.fran}: ${m.length}`); }
}
k('varumärkesgrind 0 träffar', traf === 0, `${vm.forbjudnaFraser.length} mönster${detaljer.length ? ' — ' + detaljer.join('; ') : ''}`);

// 7. talmarkörer ≥ 80 % (överföringsbevis från underlaget)
const markorer = ['1983–1984', 'ett tjugotal', 'två veckors', '20 dagars högsta notering', '55 dagars', '10 respektive 20 dagars', 'fyra svar', '20 dagars högsta höga', '10 dagars bottennivå', 'Donchian 20/10', '^OMX', 'Yahoo Finance', 'hämtat 2026-09-24', '2025-09-24 → 2026-09-24', '250 börsdagar', '2025-10-02', '2 709', '2025-11-18', '2 674', '−1,3 %', '2025-12-05', '2 827', '2026-03-03', '3 083', '+9,1 %', '2026-04-10', '3 110', '2026-04-28', '3 056', '−1,7 %', '2026-05-25', '3 193', '2026-06-10', '3 054', '−4,3 %', '2026-06-30', '3 203', '2026-08-18', '3 245', '+1,3 %', '0,987 × 1,091 × 0,983 × 0,957 × 1,013', '≈ +2,5 %', '2 av 5', '40 %', '2 645 → 3 287', '+24,2 %', '+9,1 %-vinnare', '21 dagar', '9 eller 12', '2025–26'];
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
k('chapters_list-post 15 = {num,title,minutes}', JSON.stringify(b.chapters_list[14]) === '{"num":15,"title":"Från boken till egen analys","minutes":13}', JSON.stringify(b.chapters_list[14]));

console.log(`\nKVD: ${po}/${pa} PASS${po === pa ? ' — GRÖN' : ' — RÖD'}`);
process.exit(po === pa ? 0 : 1);
