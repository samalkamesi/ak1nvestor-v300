#!/usr/bin/env node
// _r192-v172-sondra.mjs — v172 kvartalsrapporter: pipeline + monster-mönster + befintlig infra + universumstruktur
import fs from 'node:fs';
const ROT = '/home/ak1a/agent/ak1';
const ut = [];

// 1. PIPELINE-KO: v172-definitionen
const ko = fs.readFileSync(`${ROT}/PIPELINE-KO.md`, 'utf8');
const v172 = ko.indexOf('v172');
ut.push('=== PIPELINE-KO (v172-läge, ±25 rader) ===');
ut.push(ko.slice(Math.max(0, v172 - 400), v172 + 900));

// 2. Evighetskatalogens kvartalsrapportspår
const ek = fs.readFileSync(`${ROT}/data/infra/evighetskatalog.md`, 'utf8');
const kv = ek.indexOf('kvartalsrapport');
ut.push('\n=== EVIGHETSKATALOGEN (kvartalsrapportspåret, ±400 tecken) ===');
ut.push(kv >= 0 ? ek.slice(Math.max(0, kv - 200), kv + 700) : '(träff saknas)');

// 3. Befintlig rapportinfrastruktur
ut.push('\n=== data/forskning-kataloger (RAPPORT/KVARTAL/Q-läge) ===');
ut.push(fs.readdirSync(`${ROT}/data/forskning`).filter((f) => /rapport|kvartal|q[0-9]/i.test(f)).join(' · ') || '(inga)');
ut.push('\n=== data/blogg: Q-rapportartiklar (q1/q2/q3-mönster i filnamn) ===');
ut.push(fs.readdirSync(`${ROT}/data/blogg`).filter((f) => /q[123]|kvartal/i.test(f)).slice(0, 40).join('\n') || '(inga)');
ut.push('\n=== data/blogg-utkast: Q-mönster ===');
ut.push(fs.readdirSync(`${ROT}/data/blogg-utkast`).filter((f) => /q[123]|kvartal/i.test(f)).slice(0, 20).join('\n') || '(inga)');

// 4. EMOTTAG-MONSTRET (vågstartsmönstret)
ut.push('\n=== EMOTTAG-MONSTER.md (hela) ===');
const em = `${ROT}/data/forskning/KURS-FAS2/EMOTTAG-MONSTER.md`;
ut.push(fs.existsSync(em) ? fs.readFileSync(em, 'utf8').slice(0, 3500) : '(finns ej)');

// 5. Bolagsuniversum: struktur + storlek
const uni = JSON.parse(fs.readFileSync(`${ROT}/data/portfolj-system/bolagsunivers.json`, 'utf8'));
const list = Array.isArray(uni) ? uni : uni.bolag;
ut.push(`\n=== BOLAGSUNIVERSUM: ${list.length} bolag ===`);
ut.push('exempelpostens nycklar: ' + Object.keys(list[0]).join(', '));
const sektorer = {};
for (const b of list) { const s = b.sektor || b.branch || '?'; sektorer[s] = (sektorer[s] || 0) + 1; }
ut.push('sektorer: ' + Object.entries(sektorer).map(([k, v]) => `${k}=${v}`).join(' · '));
const svenska = list.filter((b) => b.ticker && /\.ST$/.test(b.ticker));
ut.push(`svenska tickers (.ST): ${svenska.length} — ${svenska.slice(0, 40).map((b) => b.ticker).join(' ')}`);

fs.writeFileSync('/tmp/r192-sondra.txt', ut.join('\n') + '\n');
console.log('skrev /tmp/r192-sondra.txt');
