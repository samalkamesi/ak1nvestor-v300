#!/usr/bin/env node
// Sammansmältning u2→u3 för Ö9: behåller u3:s body (v3), rättar tre konkreta
// brister mot familjekonvention/originalet, atomiskt i ett anrop.
import { readFileSync, writeFileSync } from 'node:fs';

const P = '/home/ak1a/AK1/data/blogg-utkast/bilaktier-sa-analyserar-du-biltillverkare-en.json';
let f = JSON.parse(readFileSync(P, 'utf8'));

const byten = [
  // 1. Originalets "näst största köpet efter bostaden" — u3 skrev "largest"
  ['A car is the household\\u2019s largest purchase after the home', null], // markörkontroll om exempel
];

let body = f.body;

// Rättning 1: second-largest (originalets "näst största") — tolererar ' och ’
const r1 = body.replace(
  /A (?:car|passenger car) is the household['\u2019]s largest purchase after the home/,
  'A passenger car is the household\u2019s second-largest purchase after the home'
);
if (r1 === body) throw new Error('R1 misslyckades: largest-frasen hittades inte');
body = r1;

// Rättning 2: Sources som H2 + tomrad (familjeformen ## Sources hos Ö1–Ö10)
const r2 = body.replace(/\*\*Sources\*\*\n- OICA/, '## Sources\n\n- OICA');
if (r2 === body) throw new Error('R2 misslyckades: Sources-blocket hittades inte');
body = r2;

// Rättning 3: käl-URL:er till etablerade IR-domäner
const r3a = body.replace(/investor\.volvocars\.com/g, 'investors.volvocars.com');
if (r3a === body) throw new Error('R3a misslyckades: volvocars-URL hittades inte');
body = r3a;
const r3b = body.replace(/powercell\.com/g, 'powercellgroup.com');
if (r3b === body) throw new Error('R3b misslyckades: powercell-URL hittades inte');
body = r3b;

f.body = body;
writeFileSync(P, JSON.stringify(f, null, 1) + '\n');

// Verifiering: JSON giltig, rättningarna sitter, inga dubletter
const v = JSON.parse(readFileSync(P, 'utf8'));
const kontroller = [
  ['second-largest sitter', v.body.includes('second-largest purchase')],
  ['## Sources sitter', v.body.includes('## Sources\n\n- OICA')],
  ['**Sources** borta', !v.body.includes('**Sources**')],
  ['powercellgroup sitter', v.body.includes('powercellgroup.com')],
  ['powercell.com borta', !/powercell\.com/.test(v.body.replace('powercellgroup.com', ''))],
  ['investors.volvocars sitter', v.body.includes('investors.volvocars.com')],
  ['disclaimer sist', v.body.trimEnd().endsWith('_This is educational financial analysis, not investment advice._')],
];
kontroller.forEach(([n, ok]) => console.log(ok ? 'GRÖN' : 'RÖD', n));
const röda = kontroller.filter(([, ok]) => !ok).length;
console.log('ORD rå:', v.body.split(/\s+/).filter(Boolean).length, '| rm =', Math.round(v.body.split(/\s+/).filter(Boolean).length / 600));
process.exit(röda ? 1 : 0);
