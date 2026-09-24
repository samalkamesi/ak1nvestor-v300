// Rond 151 / våg 232-sond: lever V230-jakten? suffixrapport? fullsveps-läge?
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const S = (cmd, args, t = 30000) => { try { return execFileSync(cmd, args, { encoding: 'utf8', timeout: t, maxBuffer: 16 * 1024 * 1024 }); } catch (e) { return 'FEL: ' + (e.message || '').slice(0, 120); } };
const ut = { nu: new Date().toISOString() };

// (1) jakten lever?
const ps = S('ps', ['-eo', 'pid,etimes,args']);
ut.jaktLevande = ps.split('\n').filter(r => /^\s*3764362\b/.test(r)).map(r => r.trim().slice(0, 120));
ut.jaktsProcess = ps.split('\n').filter(r => /V230|fullsvep|kor-alla/i.test(r)).map(r => r.trim().slice(0, 130)).slice(0, 5);

// (2) suffixrapporten + senaste testaggregator-läge
for (const p of [
  '/home/ak1a/AK1/data/vakten/testaggregator-SENASTE.json',
  '/home/ak1a/agent/ak1/data/vakten/testaggregator-SENASTE.json',
]) {
  try { const j = JSON.parse(fs.readFileSync(p, 'utf8')); ut[p.includes('AK1') ? 'aggProd' : 'aggAgent'] = { genererad: j.genererad || j.ts || null, status: j.status, grona: j.grona ?? j.antalGrona, roda: j.roda ?? j.antalRoda, omatta: j.omatta ?? j.antalOmatta, sviter: Array.isArray(j.sviter) ? j.sviter.length : (j.samtliga ?? null) }; } catch (e) { ut[p] = 'saknas/fel'; }
}

// (3) fullsvepsloggar på disk (v224-attempt 4:s arv + ev nyare)
try { ut.sveploggar = fs.readdirSync('/home/ak1a/AK1/data/vakten').filter(f => /fullsvep|v230/i.test(f)).slice(0, 8); } catch { ut.sveploggar = 'läs-fel'; }
console.log(JSON.stringify(ut, null, 1));
