#!/usr/bin/env node
// _s1u3-att-q3-paket.mjs — bygger FLYTTKLART-PAKET ur AT&T-utkastet med tre kurer
// (F1 scenariorad, F2 kalenderräkning, F3 FCF-formulering), varje kur med
// EXAKT-EN-TRÄFF-assert. Utkastet på disk rörs ALDRIG (granskaren skriver
// inte andras filer) — leveransen är en NY fil i granskning/.
import { readFileSync, writeFileSync } from 'node:fs';

const ROT = '/home/ak1a/AK1';
const KALLA = `${ROT}/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-att-q3-2026.json`;
const MAL = `${ROT}/data/blogg-utkast/granskning/sa-laser-du-att-q3-2026-FLYTTKLART-PAKET-2026-09-30-s1u3.json`;

const u = JSON.parse(readFileSync(KALLA, 'utf8'));
let b = u.body;

function kur(id, fran, till) {
  const n = b.split(fran).length - 1;
  if (n !== 1) { console.error(`KUR ${id} ABORT: ${n} träffar (krav: exakt 1) för "${fran.slice(0, 60)}…"`); process.exit(1); }
  b = b.replace(fran, till);
  console.log(`KUR ${id} OK: "${fran.slice(0, 48)}…" → "${till.slice(0, 48)}…"`);
}

// F1 (VÄSENTLIGT): scenariorutans −3 %-rad — 125 648 × 0,97 = 121 879 (v1: 121 978,
// transposition 87↔97), med radens tre celler omräknade på korrekt bas
kur('F1a', '| Intäkter 121 978 | 27 799 | 30 238 | 32 678 |', '| Intäkter 121 879 | 27 776 | 30 214 | 32 651 |');

// F2: rappveckans läspaketsräkning — listan bär 19 namn (Nokia kvar: kalenderdag
// 22/10 källsann och paketet på disk sedan 09-18) ⇒ "nitton … tjugonde", inte "arton … nittonde"
kur('F2a', 'Rappveckan 20–23 oktober innehåller med AT&T nitton av seriens läspaket.', 'Rappveckan 20–23 oktober innehåller med AT&T tjugo av seriens läspaket.');
kur('F2b', 'arton av seriens läspaket i rappfönstret 20–23 oktober, med AT&T som det nittonde', 'nitton av seriens läspaket i rappfönstret 20–23 oktober, med AT&T som det tjugonde');

// F3: FCF-kontrollens avvikelse är 1,07 % relativt (0,06 pp) — "inom" → "cirka"
kur('F3', 'håller inom en procent relativt', 'håller cirka en procent relativt');

u.body = b;
writeFileSync(MAL, JSON.stringify(u, null, 2) + '\n');
console.log('PAKET skrivet:', MAL);
