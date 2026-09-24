// _v170-sjalvtest.mjs — bevisar emottagets v170-kurer i sandbox (rör ALDRIG riktiga trädet):
//   1. ERSÄTTNINGS-IDEMPOTENS: ett RÖT block från en mätning före mätkurka ERSÄTTS av GRÖN-mätningen
//   2. VÄNTAR-LISTA VID LEVERANS: LÄGE-raden speglar disk-läget (1 levererad · 19 väntar)
//   3. LEVERERAD-TIDSSTÄMPEL ur fragmentets mtime syns i blocket
//   4. DUBBELKÖRNING bitidentisk (äkta idempotens)
//   5. STÄNGDVAKT: stängd våg = filen orörd (status) — bevisbevarande
import { mkdirSync, cpSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const ROT = '/home/ak1a/agent/ak1';
const SB = '/tmp/v170-sandbox';
const EMOTTAG = ROT + '/verktyg/_v182-emottag.mjs';
const SB_GRANSK = SB + '/data/forskning/KURS-FAS2/V167-GRANSKNING.md';
const ut = [];
let pass = 0, fel = 0;
function rapport(namn, ok, detalj) {
  if (ok) { pass++; ut.push(`PASS ${namn} — ${detalj}`); }
  else { fel++; ut.push(`FEL ${namn} — ${detalj}`); }
}
function korStatus() {
  return execFileSync('node', [EMOTTAG, 'status'], { env: { ...process.env, EMOTTAG_ROT: SB }, encoding: 'utf8', timeout: 120000 });
}
function hash(fil) { return createHash('sha256').update(readFileSync(fil)).digest('hex').slice(0, 16); }

// ── sandboxbygge ─────────────────────────────────────────────────────────────
rmSync(SB, { recursive: true, force: true });
mkdirSync(SB + '/data/forskning/KURS-FAS2/v167-fragment', { recursive: true });
mkdirSync(SB + '/data/kurser/fas2-djup', { recursive: true });
cpSync(ROT + '/data/forskning/KURS-FAS2/v167-fragment/v01-forsaljningstillvaxt.json', SB + '/data/forskning/KURS-FAS2/v167-fragment/v01-forsaljningstillvaxt.json');
cpSync(ROT + '/data/kurser/fas2-djup/indikatorer-01-10.md', SB + '/data/kurser/fas2-djup/indikatorer-01-10.md');
cpSync(ROT + '/data/kurser/fas2-djup/indikatorer-11-20.md', SB + '/data/kurser/fas2-djup/indikatorer-11-20.md');
// granskningsfil: öppen våg + ett RÖT v01-block som simulerar en mätning FÖRE mätkurka
const rödV01 = '### v01-forsaljningstillvaxt — RÖD (12 PASS · 1 FEL)\n✓ num=12\n✗ talmarkörer 16/21 = 76%';
writeFileSync(SB_GRANSK, [
  '# GRANSKNING v167 — sandboxsjälvtest (v170)',
  '',
  '## LÄGE: 0 levererade · 20 väntar',
  '',
  '## SAMMANFATTNING: 0 PASS · 0 FEL (vågen inleds)',
  '',
  '## KURSBLOCK',
  '',
  rödV01,
  '',
].join('\n'));

// ── körning 1: ersättning + väntar-lista + tidsstämpel ───────────────────────
let stdout = korStatus();
let g = readFileSync(SB_GRANSK, 'utf8');
rapport('1a RÖT block ersatt', g.includes('### v01-forsaljningstillvaxt — GRÖN (13 PASS · 0 FEL)') && !g.includes('RÖD (12 PASS'), g.includes('GRÖN (13 PASS · 0 FEL)') && !g.includes('RÖD (12') ? 'GRÖN 13/0 ersatte RÖD 12/1' : 'blocket ej ersatt korrekt');
rapport('1b ✗-rad borta', !g.includes('✗'), !g.includes('✗') ? '0 felrader kvar' : '✗ kvar');
rapport('2 väntar-lista vid leverans', g.includes('## LÄGE: 1 levererade · 19 väntar: v02-arr-tillvaxt'), g.match(/^## LÄGE:.*$/m)?.[0]?.slice(0, 70) + '…');
rapport('3 levererad-tidsstämpel', /### v01-forsaljningstillvaxt — GRÖN[^\n]* · levererad 2026-/.test(g), (g.match(/· levererad [^)\n]*/) || ['saknas'])[0]);
const blockAntal = (g.match(/^### v/gm) || []).length;
rapport('ett block per kurs', blockAntal === 1, blockAntal + ' block (väntat 1 — endast levererade kursen)');

// ── körning 2: dubbelkörning bitidentisk ─────────────────────────────────────
const h1 = hash(SB_GRANSK);
korStatus();
const h2 = hash(SB_GRANSK);
rapport('4 dubbelkörning identisk', h1 === h2, h1 === h2 ? 'sha256 ' + h1 + ' ≡ ' + h2 : h1 + ' ≠ ' + h2);

// ── körning 3: stängdvakt ────────────────────────────────────────────────────
g = g.replace(/^## SAMMANFATTNING:.*$/m, '## SAMMANFATTNING: 13 PASS · 0 FEL — VÅG STÄNGD (test)');
writeFileSync(SB_GRANSK, g);
const hFore = hash(SB_GRANSK);
stdout = korStatus();
const hEfter = hash(SB_GRANSK);
rapport('5 stängdvakt', stdout.includes('VÅG STÄNGD') && hFore === hEfter, stdout.trim().split('\n')[0].slice(0, 60) + ' · hash ' + (hFore === hEfter ? 'orörd' : 'ÄNDRAD'));

// ── städning + rapport ───────────────────────────────────────────────────────
rmSync(SB, { recursive: true, force: true });
ut.push(`TOTALT: ${pass} PASS · ${fel} FEL`);
writeFileSync('/tmp/v170-test.txt', ut.join('\n') + '\n');
console.log(`KLAR ${pass}/${pass + fel}`);
if (fel) process.exitCode = 1;
