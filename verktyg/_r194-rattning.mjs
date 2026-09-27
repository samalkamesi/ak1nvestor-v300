#!/usr/bin/env node
// _r194-rattning.mjs — antalsrättning: maskinens 71 GRÖN · 5 GUL · 0 RÖD gäller (worklog/commit sa 73/3)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const ROT = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const kvitto = [];
const steg = (namn, ok, extra = '') => {
  kvitto.push(`${ok ? 'OK ' : 'FEL'} ${namn}${extra ? ' — ' + extra : ''}`);
  fs.writeFileSync('/tmp/r194r-kvitto.txt', kvitto.join('\n') + '\n');
  if (!ok) { console.error('AVBRYTER vid: ' + namn); process.exit(1); }
};
const git = (args, cwd = ROT) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

// 1. De faktiska fem GUL:en ur mätresultatet
const resultat = JSON.parse(fs.readFileSync('/tmp/r172-granskning-resultat.json', 'utf8'));
const gula = resultat.filter((x) => x.dom === 'GUL');
const dom = `${resultat.filter((x) => x.dom === 'GRÖN').length} GRÖN · ${gula.length} GUL · ${resultat.filter((x) => x.dom === 'RÖD').length} RÖD`;
const gulaLista = gula.map((r) => `${r.slug}: ${r.gul.join(' · ')}`).join('\n  ');
steg('1 mätresultat', dom, `${gula.length} GUL listade`);

// 2. Worklog-rättning (ersätt den felaktiga meningen i rond 194-blocket)
const wlP = `${ROT}/worklog.md`;
let wl = fs.readFileSync(wlP, 'utf8');
const felText = 'FINALDOM: 73 GRÖN · 3 GUL (endast trimnotiser) · 0 RÖD av 76 — hela den väntande serien är publiceringsklar för R2-paketet.';
const rättText = `FINALDOM: 71 GRÖN · 5 GUL · 0 RÖD av 76 — hela den väntande serien är publiceringsklar för R2-paketet. (RÄTTNING samma rond: första bokföringen sa 73/3 — maskinmätningen gäller, samma läxa som rond 192. De fem GUL: ${gula.map((r) => r.slug.replace('sa-laser-du-', '').replace('-q3-2026', '')).join(', ')})`;
if (!wl.includes(felText)) steg('2 worklog-rättning', false, 'meningen hittades ej');
wl = wl.replace(felText, rättText);
fs.writeFileSync(wlP, wl);
steg('2 worklog-rättad', true);

// 3. Commit + push + verifikation
const msg = `studio: [organ:Φ] rond 194 rättning — finaldomen är 71 GRÖN · 5 GUL · 0 RÖD (worklog/commitmeddelande sa först 73/3; maskinmätningen gäller — samma antalsläxa som rond 192). De fem GUL: ${gula.map((r) => r.slug.replace('sa-laser-du-', '').replace('-q3-2026', '')).join(', ')}. Ren dataleverans — src orörd, inget bygge.`;
fs.writeFileSync('/tmp/r194r-msg.txt', msg);
git(['add', 'worklog.md', 'verktyg/_r194-rattning.mjs']);
steg('3 git add', true);
try {
  const ut = git(['commit', '-F', '/tmp/r194r-msg.txt']);
  steg('4 commit', true, ut.split('\n').find((l) => l.startsWith('[')) || '');
} catch (e) { steg('4 commit', false, String(e.stdout || e.message).slice(0, 300)); }
const hash = git(['rev-parse', '--short', 'HEAD']);
steg('5 HEAD', true, hash);
const status = git(['status', '--porcelain'], PROD);
if (status.split('\n').some((l) => /^ ?M/.test(l))) steg('6 prod-renhet', false, 'tracked-mod');
steg('6 prod-renhet', true);
try { git(['push', 'prod', 'develop']); steg('7 push', true); } catch (e) { steg('7 push', false, String(e.stdout || e.message).slice(0, 400)); }
const prodHead = git(['rev-parse', '--short', 'HEAD'], PROD);
steg('8 prod HEAD ≡ push', prodHead === hash, prodHead);
const diff = git(['status', '--porcelain']);
steg('9 trädet rent', diff.trim() === '', diff.trim() || 'rent');
fs.appendFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, JSON.stringify({ ts: new Date().toISOString(), rond: 194, beslut: 'v172 kur-ronden slutgiltigt: 71 GRÖN · 5 GUL (trim/datum-notiser) · 0 RÖD — serien publiceringsklar R2; antalsrättning bokförd', landat: hash }) + '\n');
steg('10 beslutsminne', true);

console.log(kvitto.join('\n'));
console.log('\n=== DE FEM GUL:EN ===\n  ' + gulaLista);
