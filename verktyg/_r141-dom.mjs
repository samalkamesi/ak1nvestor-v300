#!/usr/bin/env node
// Rond 141: doma sista öppna HÖG (05:28:19.389Z "ak1a = errored") + ny LÄGE
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
const LEDGER = '/home/ak1a/AK1/data/vakten/feljakt-bedomningar.jsonl';
const rad = JSON.stringify({
  ts: '2026-09-21T05:28:19.389Z',
  domdTs: new Date().toISOString(),
  spår: 'F2-process',
  allvar: 'HÖG',
  fynd: 'ak1a = errored',
  dom: 'transient-design',
  rotorsaka: 'Nattens OOM-serie 02:2x–05:28Z: prod-synkens bygg kapplöpte med fabriksbarn (därav 7 325 omstarter) — pm2-procesen i errored/kraschloop medan .next byggdes om. ROT-KURAD I ROTTEN av V235 (rond 133): zcode-reserven 300→850 MB/barn + aktivt-manifest-vakt med svältstopp — sekvenseringen är LIVE-BEVISAD i prod-synk.log sedan 06:37Z ("1 zcode-barn (+850)").',
  kur: 'Kraschvaktens räddningsbygg (05:24:17Z⇒05:31:04Z RÄDDNING KLAR, BUILD_ID saMxYAzL) + V235-sekvenseringen (förebyggande) + prod-synkens läkebackup-återställning vid varje dödat bygg ("pm2 serverar senast gröna läget").',
  bevis: 's7-u3:s slutkvitto (worklog): räddningsbygget kanalidentiskt, prod 200 ×6 ×3 ×2 · hjärtslag 09:21:28 kick OK · färsksonder 401/405 genom hela dagen — processen stabil sedan 05:31 · prod-synk.log VÄNTAR-RAM-rader = sekvenseringen vakar',
  lag: '1 (prod 200 + sonder + hjärtlog) · 2 (rot: bygg×fabrik-kapplöpning, kurad av V235) · 6 (denna dom stänger sista öppna HÖG)',
  protokoll: 'rond 141 [organ:Ψ] + rond 133 V235 + s7-u3 räddningskvitto'
}) + '\n';
fs.appendFileSync(LEDGER, rad);
console.log('dom-rad skriven för 05:28:19.389Z');
const l = spawnSync('node', ['verktyg/feljakt-lage.mjs'], { cwd: '/home/ak1a/AK1', encoding: 'utf8', timeout: 120000, maxBuffer: 32 * 1024 * 1024 });
console.log((l.stdout || '').split('\n').filter(r => r.startsWith('RESULTAT_JSON')).join('\n'));
