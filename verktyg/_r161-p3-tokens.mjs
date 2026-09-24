#!/usr/bin/env node
// _r161-p3-tokens.mjs — v160 P3 (audit #11): ersätt hero-familjens raw-hex med tokens.
// Regler: exakt samma rgb via globals.css-tokens; kurser-chipets 0E1B2E/16263D-par
// = djup-marin-flippen → bg-djup-marin. Efterverifiering: 0 kvarvarande raw-hex.
import { readFileSync, writeFileSync } from 'node:fs';

const ROTT = '/home/ak1a/agent/ak1';
const filer = [
  'src/components/ak1a/sections/home-section.tsx',
  'src/app/(huvud)/fas2/page.tsx',
  'src/app/(huvud)/fas3/page.tsx',
  'src/app/(huvud)/medlemskap/page.tsx',
  'src/app/(huvud)/konfluens/page.tsx',
  'src/app/(huvud)/kurser/page.tsx',
  'src/app/(huvud)/pro/page.tsx',
];

// Specialfall först: chip-paret som ÄR djup-marin-flippen (kurser)
// + inline-style-objekt (pro rad ~164) → CSS-variabel
const SPECIAL = [
  ['bg-[#0E1B2E]', 'bg-djup-marin'],
  [' dark:bg-[#16263D]', ''],
  ['color: "#E8C766"', 'color: "var(--guld-hero)"'],
];
// Därefter generiska (prefix-oberoende via ledande bindestreck)
const BYTEN = [
  ['-[#E8C766]', '-guld-hero'],
  ['-[#EDE6D6]', '-beige-hero'],
  ['-[#0A1422]', '-marin-morkast-hero'],
  ['-[#16263D]', '-marin-chip-hero'],
];
const KVAR = /#E8C766|#EDE6D6|#0A1422|#16263D|#0E1B2E/;

let totalt = 0;
for (const fil of filer) {
  const sokvag = `${ROTT}/${fil}`;
  let text = readFileSync(sokvag, 'utf8');
  let n = 0;
  for (const [fran, till] of SPECIAL) {
    while (text.includes(fran)) { text = text.replace(fran, till); n++; }
  }
  for (const [fran, till] of BYTEN) {
    let pos = 0;
    while ((pos = text.indexOf(fran, pos)) !== -1) {
      text = text.slice(0, pos) + till + text.slice(pos + fran.length);
      pos += till.length;
      n++;
    }
  }
  const kvar = (text.match(new RegExp(KVAR, 'g')) || []).length;
  console.log(`${fil}: ${n} byten, ${kvar} kvarvarande raw-hex`);
  if (kvar > 0) { console.log('AVBRYTER — manuell granskning krävs, ingen fil skriven'); process.exit(1); }
  if (n > 0) writeFileSync(sokvag, text);
  totalt += n;
}
console.log(`TOTALT: ${totalt} byten över ${filer.length} filer — alla raw-hex borta`);
