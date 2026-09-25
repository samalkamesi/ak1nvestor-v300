#!/usr/bin/env node
// _r195-v173-verktyg.mjs — hitta hämtningsverktyget, llms-generatorn och kandidatbackloggen
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const ROT = '/home/ak1a/agent/ak1';
const ut = [];

// 1. Verktyg som berör bolagsuniversum (hämtning/integrering)
ut.push('=== verktyg: universum/lägg-till/hämta ===');
ut.push(fs.readdirSync(`${ROT}/verktyg`).filter((f) => /univers|lägg|lagg-till|hamta|utoka|utvidga/i.test(f)).join('\n') || '(inga)');

// 2. Verktyg som regenererat llms Dataset-sektionen
ut.push('\n=== verktyg: llms-generering (grep "Dataset — branschmedianer") ===');
const grepLlms = execFileSync('grep', ['-rl', 'branschmedianer', `${ROT}/verktyg`], { encoding: 'utf8' }).trim();
ut.push(grepLlms || '(inga)');

// 3. Kandidatbacklog i forskningen
ut.push('\n=== data/forskning: kandidat/utöka-backlog för universumet ===');
try {
  const g2 = execFileSync('grep', ['-rli', '-E', 'universum.{0,30}kandidat|kandidat.{0,30}universum|utöka universumet|nya bolag i universumet', `${ROT}/data/forskning`, '--include=*.md'], { encoding: 'utf8', maxBuffer: 1024 * 1024 }).trim();
  ut.push('träffar: ' + (g2 || '(inga)'));
} catch (e) { ut.push('(inga träffar)'); }

// 4. Universumradens FULLA schema (en komplett rad som mall)
const uni = JSON.parse(fs.readFileSync(`${ROT}/data/portfolj-system/bolagsunivers.json`, 'utf8'));
const list = Array.isArray(uni) ? uni : uni.bolag;
const djup = list.find((b) => b.ticker === 'SEB-A.ST') || list[0];
ut.push('\n=== en komplett universumrad (mall — SEB-A om finns) ===');
ut.push(JSON.stringify(djup, null, 1).slice(0, 2600));

// 5. STYRELSE: senaste dataset-spårsbeslutet
try {
  const st = execFileSync('grep', ['-l', 'dataset', ...fs.readdirSync(`${ROT}/data/forskning`).filter((f) => f.startsWith('STYRELSE')).map((f) => `${ROT}/data/forskning/${f}`)], { encoding: 'utf8' }).trim();
  ut.push('\n=== STYRELSE-filer som nämner dataset ===\n' + st);
} catch { ut.push('\n(STYRELSE-grep: inga träffar)'); }

fs.writeFileSync('/tmp/r195-verktyg.txt', ut.join('\n') + '\n');
console.log('skrev /tmp/r195-verktyg.txt');
