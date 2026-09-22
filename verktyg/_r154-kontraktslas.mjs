// Rond 154 — L01-kontraktet + KOMPONENTER-arrayns utseende i en fälld svit
import fs from 'node:fs';
const ROT = '/home/ak1a/agent/ak1';
const u = {};

const svit = fs.readFileSync(ROT + '/verktyg/testa-ai-mentor-historia.mjs', 'utf8');

// L01-sektionen (testet som faller)
const l01start = svit.indexOf('L01');
u.l01 = svit.slice(Math.max(0, l01start - 400), l01start + 900);

// KOMPONENTER-arrayns början
const kstart = svit.indexOf('KOMPONENTER');
u.komponenterStart = svit.slice(Math.max(0, kstart - 100), kstart + 700);

// Vilka svaraLokalt*-strängar bär sviten?
u.svitensKomponenter = [...svit.matchAll(/"(svaraLokalt[A-Za-z]+)"/g)].map(m => m[1]);

// Widgetens kedja (referens)
const w = fs.readFileSync(ROT + '/src/components/ak1a/chat-widget.tsx', 'utf8');
const kedjerad = w.split('\n').find(r => r.includes('const lokalt ='));
u.widgetKedja = [...kedjerad.matchAll(/(svaraLokalt[A-Za-z]+)\(/g)].map(m => m[1]);

// Skillnad
u.saknasISviten = u.widgetKedja.filter(k => !u.svitensKomponenter.includes(k));
fs.writeFileSync(ROT + '/data/vakten/r154-kontraktslas.json', JSON.stringify({ saknas: u.saknasISviten, l01Finns: l01start >= 0 }, null, 1));
console.log('SAKNAS I HISTORIA-SVITEN:', JSON.stringify(u.saknasISviten, null, 1));
console.log('\n--- L01 (utdrag) ---\n', u.l01.slice(0, 900));
console.log('\n--- KOMPONENTER (utdrag) ---\n', u.komponenterStart.slice(0, 500));
