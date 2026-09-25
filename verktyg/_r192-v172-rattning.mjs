#!/usr/bin/env node
// _r192-v172-rattning.mjs — antalsrättning: maskinens mätning (8 publicerade bolagpaket + 1 allmän guide,
// 76 väntar av 84 utkast) gäller över handskrivna tal i RAPPORTVAG + PIPELINE-KO + worklog-rättning
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const ROT = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const kvitto = [];
const steg = (namn, ok, extra = '') => {
  kvitto.push(`${ok ? 'OK ' : 'FEL'} ${namn}${extra ? ' — ' + extra : ''}`);
  fs.writeFileSync('/tmp/r192r-kvitto.txt', kvitto.join('\n') + '\n');
  if (!ok) { console.error('AVBRYTER vid: ' + namn); process.exit(1); }
};
const git = (args, cwd = ROT) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

// Verifiera maskinläget först (sanningen)
const bloggPack = fs.readdirSync(`${ROT}/data/blogg`).filter((f) => /^sa-laser-du-.*-q3-2026\.json$/.test(f)).length;
const bloggAllman = fs.existsSync(`${ROT}/data/blogg/sa-laser-du-en-kvartalsrapport.json`) ? 1 : 0;
const utkastAlla = fs.readdirSync(`${ROT}/data/blogg-utkast/kvartal/2026-q3`).filter((f) => /^sa-laser-du-.*\.json$/.test(f)).length;
const vantar = utkastAlla - bloggPack;
steg('maskinläge', bloggPack === 8 && utkastAlla === 84 && vantar === 76, `${bloggPack} publicerade bolagpaket (+${bloggAllman} allmän guide) · ${vantar} väntar av ${utkastAlla} utkast`);

// 1. RAPPORTVAG: rätta antalen
const vagP = `${ROT}/data/forskning/V172-RAPPORTVAG.md`;
let vag = fs.readFileSync(vagP, 'utf8');
const byten = [
  ['- **71 läspakets-utkast** (sa-laser-du-*-q3-2026.json) — fas 3 påbörjad: mallstommen\n  bevisad i de publicerade exemplen.', `- **84 läspakets-utkast** (sa-laser-du-*-q3-2026.json; varav 76 VÄNTAR och 8 redan\n  publicerade) — fas 3 påbörjad: mallstommen bevisad i de publicerade exemplen.`],
  ['- **9 publicerade** i data/blogg/ med schemalagda oktober-datum (10-05 → 10-21):\n  industrivärden, ericsson, goldman-sachs, nordea, sandvik, skf-b, evolution, holm (+ den\n  allmänna "så läser du en kvartalsrapport" från 09-09).', '- **8 publicerade bolagpaket** i data/blogg/ med schemalagda oktober-datum (10-05 → 10-21):\n  industrivärden, ericsson, goldman-sachs, nordea, sandvik, skf-b, evolution, holm — plus den\n  allmänna "så läser du en kvartalsrapport" (09-09): nio live-artiklar totalt, åtta i serien.\n  (Antalsrättning rond 192: första versionen sa 71/9 — maskinmätningen i granskningsfilen\n  gäller: disk-läget är sanningen, regeln § 1.)'],
];
for (const [f, e] of byten) {
  if (!vag.includes(f)) steg('RAPPORTVAG-byte', false, `hittades ej: ${f.slice(0, 50)}…`);
  vag = vag.replace(f, e);
}
fs.writeFileSync(vagP, vag);
steg('RAPPORTVAG rättad', true);

// 2. PIPELINE-KO: 71 → 76/84
const koP = `${ROT}/PIPELINE-KO.md`;
let ko = fs.readFileSync(koP, 'utf8');
if (!ko.includes('71 utkast VÄNTAR, 9 publicerade')) steg('PIPELINE-KO-byte', false, '71/9-strängen hittades ej');
ko = ko.replace('71 utkast VÄNTAR, 9 publicerade (schemalagda okt-datum)', '76 utkast VÄNTAR av 84 totalt, 8 publicerade bolagpaket (schemalagda okt-datum; + 1 allmän guide = 9 live-artiklar)');
fs.writeFileSync(koP, ko);
steg('PIPELINE-KO rättad', true);

// 3. Worklog: rättningrad efter rond 192-blocket
fs.appendFileSync(`${ROT}/worklog.md`, `\nRÄTTNING (rond 192, senare samma rond): antalet i blocket ovan var fel — korrekt enligt maskinmätningen (granskningsfilens RAPPORTBLOCK, regeln § 1): **84 utkast totalt, varav 76 VÄNTAR och 8 publicerade bolagpaket** (+1 allmän kvartalsrapportsguide = 9 live-artiklar). Läxan gammal och bevisad: handskrivna antal vs disk-läge — lita på mätaren. Commit-meddelandet i 81af975f bär samma fel och rättas härmed i dokumentationen.\n`);
steg('worklog-rättning', true);

// 4. Commit + push + verifikation + beslutsminne
fs.writeFileSync('/tmp/r192r-msg.txt', `studio: [organ:Φ] rond 192 rättning — antalen i v172-starten korrigerade mot maskinmätningen: 84 utkast totalt (76 VÄNTAR + 8 publicerade bolagpaket; +1 allmän guide = 9 live-artiklar), inte 71/9. RAPPORTVAG + PIPELINE-KO + worklog rättade; granskningsfilens RAPPORTBLOCK bar det rätta talet från start (disk-läget är sanningen — regeln fungerade). Ren dataleverans — src orörd, inget bygge.`);
git(['add', 'data/forskning/V172-RAPPORTVAG.md', 'PIPELINE-KO.md', 'worklog.md', 'verktyg/_r192-v172-rattning.mjs']);
steg('git add', true);
try {
  const ut = git(['commit', '-F', '/tmp/r192r-msg.txt']);
  steg('commit', true, ut.split('\n').find((l) => l.startsWith('[')) || '');
} catch (e) { steg('commit', false, String(e.stdout || e.message).slice(0, 300)); }
const hash = git(['rev-parse', '--short', 'HEAD']);
steg('HEAD', true, hash);
const status = git(['status', '--porcelain'], PROD);
if (status.split('\n').some((l) => /^ ?M/.test(l))) steg('prod-renhet', false, 'tracked-mod');
try { git(['push', 'prod', 'develop']); steg('push', true); } catch (e) { steg('push', false, String(e.stdout || e.message).slice(0, 400)); }
const prodHead = git(['rev-parse', '--short', 'HEAD'], PROD);
steg('prod HEAD ≡ push', prodHead === hash, prodHead);
const granskProd = fs.readFileSync(`${PROD}/data/forskning/V172-GRANSKNING.md`, 'utf8');
steg('granskningsfil i prod (8/76)', granskProd.includes('RAPPORTBLOCK') && granskProd.includes('8 publicerade'));
const vagProd = fs.readFileSync(`${PROD}/data/forskning/V172-RAPPORTVAG.md`, 'utf8');
steg('RAPPORTVAG rättad i prod', vagProd.includes('84 läspakets-utkast'));
let sajt = 'n/a';
try { const svar = await fetch('https://lab.ak1nvestor.com/', { method: 'HEAD', signal: AbortSignal.timeout(15000) }); sajt = svar.status; } catch { try { const l = await fetch('http://localhost:3000/', { method: 'HEAD', signal: AbortSignal.timeout(8000) }); sajt = l.status; } catch { sajt = 'fel'; } }
steg('sajten', sajt === 200, String(sajt));
fs.appendFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, JSON.stringify({ ts: new Date().toISOString(), rond: 192, beslut: 'v172 startad (81af975f) + antalsrättning mot maskinmätningen: 84 utkast/76 väntar/8 publicerade bolagpaket; granskningsfilens disk-mätare är sanningen', landat: hash }) + '\n');
steg('beslutsminne', true);

console.log(kvitto.join('\n'));
