// Rond 147-slut: bokför läsguidegranskning v3 (8/8) + commit + push
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const ROT = '/home/ak1a/agent/ak1';
const S = (cmd, args, t = 60000) => execFileSync(cmd, args, { encoding: 'utf8', timeout: t, cwd: ROT, maxBuffer: 16 * 1024 * 1024 });
const ut = { nu: new Date().toISOString() };

const worklogText = [
  '',
  '## ROND 147 DEL 2 [organ:Θ] — LÄSGUIDEGRANSKNING v3: 8/8 KONTRAKTHÅLLEN.',
  'v2:s fynd var ALLA grunder-fel, manuell verifiering före dom (r146-läxan):',
  '(1) citatregex:en parade citat-ÄNDNING med nästas ÖPPNING över prosa → "block över 200 ord" —',
  'v3 parar intilliggande (udda/jämna segment): längsta ÄKTA citatet i samtliga 8 guider = 36 ord',
  'mot taket 200 (ABB-beviset: påstådda 2 block, verkliga citat max 24 ord);',
  '(2) källrad-regex:en "Källor?" saknade a-gren — träffade ALDRIG "Källa";',
  '(3) nakna url:er (icke-markdown) räknades ej — H&M-läxan från r146 igen.',
  'Efter kurer: källmarkörer 3–24 per guide (INDU 22 sidref, ABB 17), 0 äkta råd-verb,',
  'disclaimer+avstående i alla 8, struktur stabil (5 h2, tabell, 1 053–1 415 ord).',
  'Vaccination: v3:s första sidref-kur introducerade NY bug (ordgräns-mönstret efter',
  'punktterminerade alternativ kan aldrig matcha) — fångad av v2↔v3-differensen (13/6/5 → 0)',
  'innan dom, kurerad på raden. Dom: v145-läsguiderna = FLYTKLARA KANDIDATER, publicering',
  'väntar kund (R2). Rapport: data/vakten/r147-lasguidegranskning.json · verktyg: _r147-granska-v3.mjs.',
  ''
].join('\n');
fs.appendFileSync(ROT + '/worklog.md', worklogText);

const rad = JSON.stringify({
  ts: ut.nu, rond: 147,
  beslut: 'Läsguidegranskning v3: 8/8 guider KONTRAKTHÅLLEN — v2:s samtliga fynd var grunder-fel (citatprosaparning + Källa-regex a-gren + nakna url:er), manuell verifiering före dom; längsta äkta citat 36 ord mot tak 200; flytklara kandidater, publicering = kundens R2',
  landat: 'rapport data/vakten/r147-lasguidegranskning.json + _r147-granska-v3.mjs'
}) + '\n';
for (const t of [ROT + '/data/vakten/beslutsminne.jsonl', '/home/ak1a/AK1/data/vakten/beslutsminne.jsonl']) { try { fs.appendFileSync(t, rad); ut['minne:' + (t.includes('AK1/') ? 'prod' : 'agent')] = 'OK'; } catch (e) { ut.minneFEL = e.message.slice(0, 80); } }

const msg = 'studio: rond 147 del 2 [organ:Θ] — LÄSGUIDEGRANSKNING v3: 8/8 KONTRAKTHÅLLEN (flytklara kandidater, publicering = kundens R2): v2:s fynd var ALLA grunder-fel — citatregex:en parade citat-ändning med nästas öppning över prosa (v3: intilliggande parning, längsta äkta citatet 36 ord mot tak 200), källrad-regex:en Källor? träffade aldrig Källa (a-gren saknades), nakna url:er räknades ej (r146:s H&M-läxa); efter kurer: källmarkörer 3–24 per guide, 0 äkta råd-verb, disclaimers kompletta, struktur stabil; vaccination ärad: v3:s första kur introducerade ny ordgräns-bug som fångades av v2↔v3-differensen FÖRE dom';
fs.writeFileSync(ROT + '/verktyg/_r147-commitmsg2.txt', msg);
try {
  S('git', ['add', '-A']);
  ut.commit = S('git', ['commit', '-F', 'verktyg/_r147-commitmsg2.txt'], 300000).split('\n').find(r => /files changed|develop/i.test(r)) || 'OK';
} catch (e) { ut.commit = 'FEL: ' + e.message.slice(0, 250); }
if (!/FEL/.test(String(ut.commit))) {
  try { ut.push = S('git', ['push', 'prod', 'develop'], 120000).split('\n').filter(r => /develop|->|reject/i.test(r)).join(' | ').slice(0, 160); }
  catch (e) { ut.push = 'FEL: ' + e.message.slice(0, 250); }
}
ut.head = S('git', ['log', '--oneline', '-1'], 30000).trim().slice(0, 80);
console.log(JSON.stringify(ut, null, 1));
