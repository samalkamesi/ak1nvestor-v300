#!/usr/bin/env node
// _r190-val-adopt.mjs — adoptera väktarens NYA motorervalidering-append + push 0b654d1d + AR28-verifikation + beslutsminne
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';

const ROT = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const VAL = 'data/rapporter/motorervalidering-2026-09-02.md';
const GUIDE = 'data/blogg-utkast/vardaktier-sa-analyserar-du-vardbolag-ar.json';

const kvitto = [];
const steg = (namn, ok, extra = '') => {
  kvitto.push(`${ok ? 'OK ' : 'FEL'} ${namn}${extra ? ' — ' + extra : ''}`);
  fs.writeFileSync('/tmp/r190b-kvitto.txt', kvitto.join('\n') + '\n');
  if (!ok) { console.error('AVBRYTER vid: ' + namn); process.exit(1); }
};
const sha = (p) => createHash('sha256').update(fs.readFileSync(p)).digest('hex').slice(0, 16);
const git = (args, cwd = ROT) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

// 1. Adoptera appenden
fs.copyFileSync(`${PROD}/${VAL}`, `${ROT}/${VAL}`);
const valTxt = fs.readFileSync(`${ROT}/${VAL}`, 'utf8');
const körningar = [...valTxt.matchAll(/# Motorervalidering — 100%-väktaren — ([\dT:.\-Z]+)\n[\s\S]*?\*\*RESULTAT: (\d+) PASS \/ (\d+) FAIL \/ (\d+) SKIP\*\*/g)];
const senast = körningar[körningar.length - 1];
steg('1 väktar-append adopterad', !!senast, senast ? `senaste körning ${senast[1]}: ${senast[2]} PASS / ${senast[3]} FAIL / ${senast[4]} SKIP (totalt ${körningar.length} körningar i filen)` : 'körningsblock hittades ej');

// 2. Commit
fs.writeFileSync('/tmp/r190b-msg.txt', `studio: [organ:Φ] rond 190 — väktarens nya motorervalidering-append adopterad (push-avlåsning enligt rond 188:s mönster): senaste körning ${senast ? senast[1] : '?'} ${senast ? senast[2] + ' PASS / ' + senast[3] + ' FAIL / ' + senast[4] + ' SKIP' : '?'}. Ren dataleverans — src orörd, inget bygge.`);
git(['add', VAL]);
try {
  const ut = git(['commit', '-F', '/tmp/r190b-msg.txt']);
  steg('2 commit', true, ut.split('\n').find((l) => l.startsWith('[')) || '');
} catch (e) { steg('2 commit', false, String(e.stdout || e.message).slice(0, 300)); }
const hash = git(['rev-parse', '--short', 'HEAD']);
steg('3 HEAD', true, `${hash} (skjuter 0b654d1d + denna)`);

// 3. Prod-avlåsning + push
git(['checkout', '--', VAL], PROD);
const status = git(['status', '--porcelain'], PROD);
const mod = status.split('\n').filter((l) => /^ ?M/.test(l));
steg('4 prod avlåst', mod.length === 0, mod.length ? mod.join(' | ') : '0 tracked-mod');
try {
  const push = git(['push', 'prod', 'develop']);
  steg('5 push prod develop', true, push.split('\n').filter((l) => l.includes('->') || l.includes('|')).join(' | ').slice(0, 160));
} catch (e) { steg('5 push prod develop', false, String(e.stdout || e.message).slice(0, 500)); }

// 4. Verifikation
const prodHead = git(['rev-parse', '--short', 'HEAD'], PROD);
steg('6a prod HEAD ≡ push', prodHead === hash, prodHead);
steg('6b AR28-guiden bitidentisk i prod', sha(`${ROT}/${GUIDE}`) === sha(`${PROD}/${GUIDE}`), `sha ${sha(`${PROD}/${GUIDE}`)}`);
const seoProd = fs.readFileSync(`${PROD}/data/forskning/SEO-GUIDER-2026-09.md`, 'utf8');
steg('6c AR28-rad i prod', seoProd.includes('| AR28 | vardaktier-sa-analyserar-du-vardbolag-ar'));
steg('6d notis (bygg-ar ensam kvar) i prod', seoProd.includes('medtech-ar AR27 (2026-09-24) och vård-ar AR28 (2026-09-25)'));
const valProd = fs.readFileSync(`${PROD}/${VAL}`, 'utf8');
steg('6e väktar-appenden tillbaka i prod', valProd.includes(senast ? senast[1] : 'ALDRIG'));
let sajt = 'n/a';
try { const svar = await fetch('https://lab.ak1nvestor.com/', { method: 'HEAD', signal: AbortSignal.timeout(15000) }); sajt = svar.status; } catch { try { const l = await fetch('http://localhost:3000/', { method: 'HEAD', signal: AbortSignal.timeout(8000) }); sajt = l.status; } catch { sajt = 'fel'; } }
steg('6f sajten', sajt === 200, String(sajt));

// 5. Beslutsminne (rond 190 — saknades i det avbrutna skriptet)
fs.appendFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, JSON.stringify({ ts: new Date().toISOString(), rond: 190, beslut: 'AR28 vård-ar levererad KVD GRÖN 16/16 (talparitet 109/109 första körningen, 0b654d1d) + väktarens nya motorervalidering adopterad; endast bygg-ar kvar i -ar-spåret', landat: hash }) + '\n');
steg('7 beslutsminne', true);

console.log(kvitto.join('\n'));
