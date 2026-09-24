#!/usr/bin/env node
// ROND 105 — uppdatera kedjevakten för våg 210: MOTORDEFS + KANONISKA (r98-mönstret)
import { readFileSync, writeFileSync } from 'node:fs';
const P = '/home/ak1a/agent/ak1/verktyg/testa-ai-mentor-kedja.mjs';
let t = readFileSync(P, 'utf-8');
const fore = t;

// 1. MOTORDEFS: sätt in valutamekanik efter praktik-raden (blir motor-index 9)
const praktikRad = /(\{ namn: "praktik",.*?antal: 3 \},\n)/;
if (!t.includes('"valutamekanik"')) {
  t = t.replace(praktikRad, `$1  // 2026-09-19 våg 210 (studion): valutamekanik — valutans MEKANIK\n  // (ppp/ränteparitet/realväxelkurs/kronstyrka/devalvering/hedging/\n  // exportörens vind/reservvaluta/valutamarknaden/valutalån). Tie-brytning\n  // enligt våg 189-doktrinen: EFTER praktik, FÖRE portfoljgrund —\n  // portfoljgrund behåller valuta-GRUNDERNA (kanoniska "vad är valutarisk?"),\n  // detta lager bär MEKANIK-frågorna (kärnorden mekaniskt disjunkta,\n  // testfall K i testa-ai-mentor-valutamekanik.mjs).\n  { namn: "valutamekanik", fil: "ai-mentor-valutamekanik-fragor.ts", fn: "svaraLokaltValutamekanik", arr: "VALUTAMEKANIK_MONSTER", antal: 10 },\n`);
}

// 2. KANONISKA: alla motor ≥ 9 skiftas +1 (portfoljgrund 9→10 o.s.v.)
let ska = 0;
t = t.replace(/\{ fraga: ("(?:[^"\\]|\\.)*"),\s*motor: (\d+) \}/g, (hel, fraga, n) => {
  const nr = Number(n);
  if (nr >= 9) { ska++; return `{ fraga: ${fraga}, motor: ${nr + 1} }`; }
  return hel;
});

// 3. Nya kanoniska rader för valutamekanik (motor 9) — före "vad är diversifiering?"-raden (nu motor 10)
const nyarader = `  // 2026-09-19 våg 210 (studion): valutamekanik — kanoniska ur lagrets egna rubriker.\n  { fraga: "vad är köpkraftsparitet?", motor: 9 },\n  { fraga: "vad är ppp?",               motor: 9 },\n  { fraga: "vad är ränteparitet?",     motor: 9 },\n  { fraga: "vad är realväxelkurs?",    motor: 9 },\n  { fraga: "vad betyder stark krona?", motor: 9 },\n  { fraga: "vad är devalvering?",      motor: 9 },\n  { fraga: "vad är valutahedging?",    motor: 9 },\n  { fraga: "hur fungerar valutamarknaden?", motor: 9 },\n  { fraga: "vad är valutalån?",        motor: 9 },\n  { fraga: "vad är en reservvaluta?",  motor: 9 },\n`;
if (!t.includes('"vad är köpkraftsparitet?"')) {
  t = t.replace(/(  \{ fraga: "vad är diversifiering\?",)/, nyarader + '$1');
}

// 4. TOTALT-kommentaren: 155 → 165
t = t.replace('const TOTALT = MOTORDEFS.reduce((s, d) => s + d.antal, 0); // 155 (2026-09-19 omgång 24:',
              'const TOTALT = MOTORDEFS.reduce((s, d) => s + d.antal, 0); // 165 (2026-09-19 våg 210: valutamekanik +10 — 58-motorläget, 165 monsters. Omgång 24:');

if (t !== fore) { writeFileSync(P, t); console.log('KEDJEVAKTEN UPPDATERAD: motorer-rad insatt,', ska, 'kanoniska skiftade +1, 10 nya kanoniska, TOTALT-kommentar 165'); }
else console.log('INGEN ÄNDRING (redan applicerad?)');
