#!/usr/bin/env node
// _r193-slutfor.mjs — rond 193 slutförande: väktaradoption + push 626cf8db + verifikation + status-rop SIST + minne
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';

const ROT = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const VAL = 'data/rapporter/motorervalidering-2026-09-02.md';
const kvitto = [];
const steg = (namn, ok, extra = '') => {
  kvitto.push(`${ok ? 'OK ' : 'FEL'} ${namn}${extra ? ' — ' + extra : ''}`);
  fs.writeFileSync('/tmp/r193b-kvitto.txt', kvitto.join('\n') + '\n');
  if (!ok) { console.error('AVBRYTER vid: ' + namn); process.exit(1); }
};
const sha = (p) => createHash('sha256').update(fs.readFileSync(p)).digest('hex').slice(0, 16);
const git = (args, cwd = ROT) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

// 1. Adoptera väktarens nya append
fs.copyFileSync(`${PROD}/${VAL}`, `${ROT}/${VAL}`);
const valTxt = fs.readFileSync(`${ROT}/${VAL}`, 'utf8');
const körningar = [...valTxt.matchAll(/# Motorervalidering — 100%-väktaren — ([\dT:.\-Z]+)\n[\s\S]*?\*\*RESULTAT: (\d+) PASS \/ (\d+) FAIL \/ (\d+) SKIP\*\*/g)];
const senast = körningar[körningar.length - 1];
steg('1 väktar-append adopterad', !!senast, senast ? `${senast[1]}: ${senast[2]} PASS / ${senast[3]} FAIL / ${senast[4]} SKIP` : 'inget körningsblock');
fs.writeFileSync('/tmp/r193b-msg.txt', `studio: [organ:Φ] rond 193 — väktarens motorervalidering-append adopterad (push-avlåsning): senaste körning ${senast ? senast[1] + ' ' + senast[2] + ' PASS / ' + senast[3] + ' FAIL / ' + senast[4] + ' SKIP' : '?'}. Ren dataleverans — src orörd, inget bygge.`);
git(['add', VAL]);
try {
  const ut = git(['commit', '-F', '/tmp/r193b-msg.txt']);
  steg('2 commit', true, ut.split('\n').find((l) => l.startsWith('[')) || '');
} catch (e) { steg('2 commit', false, String(e.stdout || e.message).slice(0, 300)); }
const hash = git(['rev-parse', '--short', 'HEAD']);
steg('3 HEAD', true, `${hash} (skjuter 626cf8db + denna)`);

// 2. Prod-avlåsning + push
git(['checkout', '--', VAL], PROD);
const status = git(['status', '--porcelain'], PROD);
steg('4 prod avlåst', !status.split('\n').some((l) => /^ ?M/.test(l)));
try { git(['push', 'prod', 'develop']); steg('5 push', true); } catch (e) { steg('5 push', false, String(e.stdout || e.message).slice(0, 500)); }

// 3. Verifikation
const prodHead = git(['rev-parse', '--short', 'HEAD'], PROD);
steg('6a prod HEAD ≡ push', prodHead === hash, prodHead);
const granskProd = fs.readFileSync(`${PROD}/data/forskning/V172-GRANSKNING.md`, 'utf8');
steg('6b granskningsomgången i prod', granskProd.includes('6 GRÖN · 69 GUL · 1 RÖD'));
steg('6c väktar-appenden tillbaka i prod', fs.readFileSync(`${PROD}/${VAL}`, 'utf8').includes(senast ? senast[1] : 'ALDRIG'));
let sajt = 'n/a';
try { const svar = await fetch('https://lab.ak1nvestor.com/', { method: 'HEAD', signal: AbortSignal.timeout(15000) }); sajt = svar.status; } catch { try { const l = await fetch('http://localhost:3000/', { method: 'HEAD', signal: AbortSignal.timeout(8000) }); sajt = l.status; } catch { sajt = 'fel'; } }
steg('6d sajten', sajt === 200, String(sajt));

// 4. STATUS-ROP SOM SISTA STEG (regeln § 1)
const ropUt = execFileSync('node', ['verktyg/_r172-rapportvag-status.mjs'], { cwd: ROT, encoding: 'utf8', timeout: 120000 });
steg('7 status-rop (§ 1, sista steget)', ropUt.includes('publicerade'), ropUt.trim().split('\n')[0]);
const diffEfter = git(['status', '--porcelain']);
steg('8 trädet rent efter rop', diffEfter.trim() === '', diffEfter.trim() ? diffEfter : 'RAPPORTBLOCK identisk — ingen ny diff');

// 5. Beslutsminne
fs.appendFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, JSON.stringify({ ts: new Date().toISOString(), rond: 193, beslut: 'v172 granskningsomgång 1 (6/69/1) levererad + väktaradoption; publiceringspaket väntar kund R2; nästa: GUL-kurar prioriterat v41–v42-bolag', landat: hash }) + '\n');
steg('9 beslutsminne', true);

console.log(kvitto.join('\n'));
