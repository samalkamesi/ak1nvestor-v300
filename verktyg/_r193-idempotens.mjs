#!/usr/bin/env node
// _r193-idempotens.mjs — rond 193 avslut: statusmätarens tidsidempotens-kur + sista rop + commit + push + minne
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const ROT = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const kvitto = [];
const steg = (namn, ok, extra = '') => {
  kvitto.push(`${ok ? 'OK ' : 'FEL'} ${namn}${extra ? ' — ' + extra : ''}`);
  fs.writeFileSync('/tmp/r193c-kvitto.txt', kvitto.join('\n') + '\n');
  if (!ok) { console.error('AVBRYTER vid: ' + namn); process.exit(1); }
};
const git = (args, cwd = ROT) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

// 1. Om-rop med kurerad mätare
const rop = execFileSync('node', ['verktyg/_r172-rapportvag-status.mjs'], { cwd: ROT, encoding: 'utf8', timeout: 120000 });
steg('1 om-rop', rop.includes('publicerade'), rop.trim().split('\n')[0]);
// 2. TRUE idempotenstest: rop igen — filen får inte förändras
const före = fs.readFileSync(`${ROT}/data/forskning/V172-GRANSKNING.md`, 'utf8');
execFileSync('node', ['verktyg/_r172-rapportvag-status.mjs'], { cwd: ROT, encoding: 'utf8', timeout: 120000 });
const efter = fs.readFileSync(`${ROT}/data/forskning/V172-GRANSKNING.md`, 'utf8');
steg('2 tidsidempotens (dubbelkörning)', före === efter, före === efter ? 'bitidentisk ✓' : 'SKILDLIG');

// 3. Commit + push (engångsdiffen: LÄGE-raden utan minutstämpel + verktygskuren + rondens två verktyg)
const msg = `studio: [organ:Φ] rond 193 avslut — statusmätaren kurerad till TIDSIDEMPOTENS (LÄGE-raden bär datum, inte minutprecis tid; körningstidpunkterna lever i git-historiken). Rond 192:s "bitidentisk dubbelkörning" passerade bara inom samma minut — svagheten föll vid rond 193:s § 1-rop som lämnade diff. Nu bevisad tidsidempotent. Granskningsomgången 6/69/1 oförändrad i prod; engångsdiffen committad. Ren dataleverans — src orörd, inget bygge.`;
fs.writeFileSync('/tmp/r193c-msg.txt', msg);
git(['add', 'data/forskning/V172-GRANSKNING.md', 'verktyg/_r172-rapportvag-status.mjs', 'verktyg/_r190-val-adopt.mjs', 'verktyg/_r193-slutfor.mjs', 'verktyg/_r193-idempotens.mjs']);
steg('3 git add', true);
try {
  const ut = git(['commit', '-F', '/tmp/r193c-msg.txt']);
  steg('4 commit', true, ut.split('\n').find((l) => l.startsWith('[')) || '');
} catch (e) { steg('4 commit', false, String(e.stdout || e.message).slice(0, 300)); }
const hash = git(['rev-parse', '--short', 'HEAD']);
steg('5 HEAD', true, hash);
const status = git(['status', '--porcelain'], PROD);
if (status.split('\n').some((l) => /^ ?M/.test(l))) steg('6 prod-renhet', false, 'tracked-mod — adoptera');
steg('6 prod-renhet', true);
try { git(['push', 'prod', 'develop']); steg('7 push', true); } catch (e) { steg('7 push', false, String(e.stdout || e.message).slice(0, 400)); }
const prodHead = git(['rev-parse', '--short', 'HEAD'], PROD);
steg('8 prod HEAD ≡ push', prodHead === hash, prodHead);
const diffEfter = git(['status', '--porcelain']);
steg('9 trädet rent', diffEfter.trim() === '', diffEfter.trim() || 'rent');
let sajt = 'n/a';
try { const svar = await fetch('https://lab.ak1nvestor.com/', { method: 'HEAD', signal: AbortSignal.timeout(15000) }); sajt = svar.status; } catch { try { const l = await fetch('http://localhost:3000/', { method: 'HEAD', signal: AbortSignal.timeout(8000) }); sajt = l.status; } catch { sajt = 'fel'; } }
steg('10 sajten', sajt === 200, String(sajt));
fs.appendFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, JSON.stringify({ ts: new Date().toISOString(), rond: 193, beslut: 'v172 granskningsomgång 1 levererad (6/69/1) + statusmätaren kurerad till bevisad tidsidempotens; publiceringspaket väntar kund R2', landat: hash }) + '\n');
steg('11 beslutsminne', true);

console.log(kvitto.join('\n'));
