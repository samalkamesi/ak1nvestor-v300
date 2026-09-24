// v166-d20 KVD — mekanisk efterkontroll av the-trend-following-bible.json efter append.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const FIL = 'data/bokmaster/the-trend-following-bible.json';
const UNDERLAG = '/home/ak1a/AK1/data/forskning/KURS-FAS3/underlag-f20-trend-following.md';
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

// blockstruktur enligt designens mappning (kärnan + praktisk läsning + utmaning + räkneexempel text+tabell + fallgropar + insikt)
const foljd = kap.blocks.map(x => x.type).join('/');
k('blockstruktur enligt design', foljd === 'text/text/utmaning/text/tabell/text/insikt', foljd);
k('alla block har type+content', kap.blocks.every(x => typeof x.type === 'string' && typeof x.content === 'string' && x.content.length > 0));

// tabell-blockets inre JSON (underlagets tabell: rubrikrad + 2 rader × 4 kol)
let tabellOk = false, tabellDetalj = '';
try { const t = JSON.parse(kap.blocks.find(x => x.type === 'tabell').content); tabellOk = !!t.rubrik && Array.isArray(t.rader) && t.rader.length === 3 && t.rader.every(r => Array.isArray(r) && r.length === 4); tabellDetalj = `${t.rader.length} rader × 4 kol`; } catch (e) { tabellDetalj = e.message; }
k('tabell-content giltig inre JSON (rubrik + 3×4)', tabellOk, tabellDetalj);

// quiz = 3, format, unika ratt-lägen
k('quiz = 3', Array.isArray(kap.quiz) && kap.quiz.length === 3);
const qOk = kap.quiz.every(q => typeof q.q === 'string' && Array.isArray(q.alternativ) && q.alternativ.length === 4 && Number.isInteger(q.ratt) && q.ratt >= 0 && q.ratt <= 3 && typeof q.tips === 'string' && q.tips.length > 10);
k('quizformat {q, alternativ[4], ratt, tips}', qOk);
const ratt = kap.quiz.map(q => q.ratt);
k('unika ratt-lägen', new Set(ratt).size === 3, JSON.stringify(ratt));

// 5. juridikgrind: övnings- + genomgångs- + juridikdeklaration ordagrant, 2007:528
const hela = JSON.stringify(kap);
const ovn = 'Genomgående övning, ren aritmetik på antaganden (ingen hämtad serie)';
const kall = 'Genomgång av exemplet, inte en rekommendation (2007:528)';
const ju = 'Utbildningsmaterial — beskriver hur metoden fungerar med genomskinliga räkneexempel; inga investeringsråd, inga avkastningslöften (2007:528)';
k('övningsdeklaration ordagrant', kap.blocks.some(x => x.content.includes(ovn)));
k('genomgångsdeklaration ordagrant', kap.blocks.some(x => x.content.includes(kall)));
k('juridikdeklaration ordagrant', kap.blocks.some(x => x.content.includes(ju)));
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

// 7. talmarkörer ≥ 80 % (överföringsbevis) — DUBBELRIKTAT: varje markör ska finnas
//    både i kapitlet OCH i underlaget (bevisar ordagrann överföring, inte påhittade tal)
const underlag = fs.readFileSync(UNDERLAG, 'utf8');
const markorer = ['många små förluster', 'få stora vinster', 'asymmetrin', 'förväntansvärdesmaskin', 'träfffrekvensmaskin', 'hyran för att få vara med', 'felet är en kostnad, inte en skam', 'Dows diagram', '200-dagars medelvärde', 'avsaknad av signal ÄR ett beslut', 'riskbudget ÷ stoppavstånd', '10 dagars bottennivå', 'inga känsla-exits', '40 % träffare', '+8 %', '−2 %', 'per 100 affärer', '40 × 8 = +320', '60 × 2 = −120', '+200 procentenheter', '+2,0 %', 'sex av tio affärer', '−6 %', '60 × 6 = −360', '−0,4 %', '×1,02²⁰', '+49 %', '×0,996²⁰', '−8 %', '8p = 6(1−p)', '43 %', '20 affärer', 'kanten tillhör inte signalen', 'whipsaw', 'lönsamhet, värdering, kvalitet', 'fundament för urval, trend för timing'];
const saknadeKap = markorer.filter(m => !hela.includes(m));
const saknadeUnd = markorer.filter(m => !underlag.includes(m));
const pct = Math.round(100 * (markorer.length - saknadeKap.length) / markorer.length);
k('talmarkörer ≥ 80 % i kapitlet', pct >= 80, `${markorer.length - saknadeKap.length}/${markorer.length} (${pct} %)${saknadeKap.length ? ' saknas i kapitel: ' + saknadeKap.join(', ') : ''}`);
k('samma markörer finns i underlaget (inga påhittade tal)', saknadeUnd.length === 0, saknadeUnd.length ? 'saknas i underlag: ' + saknadeUnd.join(', ') : `${markorer.length} dubbelt bekräftade`);

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
