// Rond 175: mekanisk granskning v166-djupkapitel mot DESIGN-v166-kontraktet
import fs from 'node:fs';
import path from 'node:path';
const KAT = '/home/ak1a/agent/ak1/data/forskning/KURS-FAS3';
const BM = '/home/ak1a/agent/ak1/data/bokmaster';
const fraser = JSON.parse(fs.readFileSync('/home/ak1a/agent/ak1/data/varumarke.json', 'utf8'));
const monster = fraser.forbjudnaFraser.map(f => f.fran).filter(Boolean);
const v164 = JSON.parse(fs.readFileSync(`${KAT}/manifest-v164-fas3-djup.json`, 'utf8'));

// slug → underlagsfil
const map = new Map();
for (const u of v164.uppgifter) {
  const slug = u.prompt.match(/slug ([a-z0-9-]+)/)[1];
  const underlag = u.prompt.match(/underlag-f\d+-([a-z0-9-]+)\.md/)[0];
  map.set(slug, underlag);
}

const TITEL = 'Från boken till egen analys';
const rader = [];
let pass = 0, fel = 0, granskade = 0, vantar = [];
const ok = (v, n, d) => { if (v) pass++; else fel++; rader.push(`${v ? 'PASS' : 'FEL'} ${n} — ${d}`); };
const signifikantaTal = (t) => [...new Set((t.match(/\d+[.,]?\d*/g) || [])
  .map(s => s.replace(/[.,]$/, ''))
  .filter(s => s.length >= 2 && !/^(19|20)\d\d$/.test(s) && s !== '2007' && !/^528/.test(s)))];

for (const [slug, underlagFil] of map) {
  const fil = path.join(BM, `${slug}.json`);
  let j;
  try { j = JSON.parse(fs.readFileSync(fil, 'utf8')); }
  catch (e) { vantar.push(`${slug}: JSON-OLÄSLIG ${e.message}`); fel++; continue; }
  const ix = j.chapters.findIndex(c => c.title === TITEL);
  if (ix === -1) { vantar.push(slug); continue; }
  granskade++;
  const k = j.chapters[ix];
  const n = j.chapters.length;
  ok(ix === n - 1 && k.num === n, `${slug} position+num`, `ix=${ix + 1}/${n} num=${k.num}`);
  ok(j.chapterCount === n, `${slug} chapterCount`, `${j.chapterCount} == ${n}`);
  const sum = j.chapters.reduce((a, c) => a + c.minutes, 0);
  ok(j.totalMinutes === sum, `${slug} totalMinutes=Σ`, `${j.totalMinutes} == ${sum}`);
  ok(Array.isArray(k.quiz) && k.quiz.length === 3, `${slug} quiz=3`, `${(k.quiz || []).length}`);
  const quizOk = (k.quiz || []).every(q => q.q && Array.isArray(q.alternativ) && q.alternativ.length === 4 && Number.isInteger(q.ratt) && q.ratt >= 0 && q.ratt <= 3 && q.tips);
  ok(quizOk, `${slug} quiz-struktur`, quizOk ? 'q/alt4/ratt/tips ✓' : 'AVVIKELSE');
  const typer = [...new Set(k.blocks.map(b => b.type))];
  ok(typer.every(t => ['text', 'insikt', 'utmaning', 'tabell', 'visuell'].includes(t)), `${slug} blocktyper`, typer.join(','));
  ok(typer.includes('utmaning'), `${slug} utmaning-block`, typer.includes('utmaning') ? 'finns' : 'SAKNAS (designens övningsblock)');
  const nyText = [k.intro, ...k.blocks.map(b => typeof b.content === 'string' ? b.content : JSON.stringify(b.content))].join('\n') + '\n' + k.quiz.flatMap(q => [q.q, ...q.alternativ, q.tips]).join('\n');
  const traf = monster.filter(m => new RegExp('(?<!inte |ej |aldrig |ingen |inga |utan |varken |icke )' + m, 'giu').test(nyText));
  ok(traf.length === 0, `${slug} varumärkesgrind`, traf.length ? `träffar: ${traf.join(', ')}` : `${monster.length} fraser rena`);
  const lagrum = [...new Set(nyText.match(/\b\d{4}:\d+\b/g) || [])];
  ok(lagrum.every(x => x === '2007:528'), `${slug} lagrum`, lagrum.join(',') || '—');
  const underlag = fs.readFileSync(path.join(KAT, underlagFil), 'utf8');
  const uTal = signifikantaTal(underlag);
  const kTal = new Set(signifikantaTal(nyText));
  const traeff = uTal.filter(t => kTal.has(t));
  const kvot = uTal.length ? traeff.length / uTal.length : 1;
  ok(kvot >= 0.7, `${slug} talöverföring`, `${traeff.length}/${uTal.length} = ${Math.round(kvot * 100)} % (krav ≥70)`);
  const seqOk = j.chapters.every((c, i2) => c.num === i2 + 1);
  ok(seqOk, `${slug} num-sekvens`, seqOk ? '1..n ✓' : 'AVVIKELSE');
}

const rapport = `# GRANSKNING v166 — djupkapitel mot DESIGN-v166-kontraktet (rond 175+)

Verktyg: verktyg/_r175-granska.mjs · Kontrakt: DESIGN-v166-djupintegrering.md
Kontroller: position+num · chapterCount · totalMinutes=Σ · quiz=3+struktur ·
blocktyper · utmaning-block · varumärkesgrind · lagrum · talöverföring ≥70 % ·
num-sekvens (append-only-indikator).

${rader.join('\n')}

## LÄGE: ${granskade} granskade · ${vantar.length} väntar: ${vantar.slice(0, 30).join(', ')}

## SAMMANFATTNING: ${pass} PASS · ${fel} FEL
`;
fs.writeFileSync(path.join(KAT, 'GRANSKNING-v166-SENASTE.md'), rapport);
console.log(`=== ${pass} PASS · ${fel} FEL · ${granskade} granskade · ${vantar.length} väntar ===`);
console.log(rader.filter(r => r.startsWith('FEL')).slice(0, 20).join('\n') || '(inga FEL än så länge)');
