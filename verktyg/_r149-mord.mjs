// Mordutredning: vem dödade bygget? dmesg OOM-rader + fabrikens RAM-vakt-logg + pumporns tidslinje
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const S = (cmd, args, t = 30000) => { try { return execFileSync(cmd, args, { encoding: 'utf8', timeout: t, maxBuffer: 16 * 1024 * 1024 }); } catch (e) { return 'FEL: ' + (e.message || '').slice(0, 200); } };
const ut = { nu: new Date().toISOString() };

// (1) kärnans OOM-logg (kräver rättigheter — sudo-lös väg först)
ut.dmesgOom = S('dmesg', ['-T']).split('\n').filter(r => /oom|killed process/i.test(r)).slice(-6);
if (/FEL/.test(String(ut.dmesgOom))) {
  ut.dmesgOom = S('sudo', ['-n', 'dmesg', '-T']).split('\n').filter(r => /oom|killed process/i.test(r)).slice(-6);
}

// (2) kern.log-vägen om dmesg nekar
if (/FEL/.test(String(ut.dmesgOom))) {
  try { ut.kernLog = fs.readFileSync('/var/log/kern.log', 'utf8').split('\n').filter(r => /oom|killed process/i.test(r)).slice(-6); } catch (e) { ut.kernLog = 'läs-FEL ' + e.message.slice(0, 60); }
}

// (3) fabrikens logg: dödade barn / RAM-vakt-beslut 19:2x–19:4x
for (const p of ['/home/ak1a/AK1/data/vakten/agentfabrik/fabrik.log', '/home/ak1a/agent/ak1/data/vakten/agentfabrik/fabrik.log']) {
  try { const svans = fs.readFileSync(p, 'utf8').trimEnd().split('\n'); ut[p.includes('AK1') ? 'fabrikProd' : 'fabrikAgent'] = svans.filter(r => /19:[234]|döda|dod|rAM|ram|kill/i.test(r)).slice(-8); } catch (e) { ut[p] = 'saknas'; }
}

// (4) pumpor-daemonens logg (rop vid :x5 = 19:35/19:45)
try { const sv = fs.readFileSync('/home/ak1a/AK1/data/vakten/pumpor.log', 'utf8').trimEnd().split('\n'); ut.pumpor = sv.slice(-8); } catch (e) { ut.pumpor = 'log saknas: ' + e.message.slice(0, 60); }

console.log(JSON.stringify(ut, null, 1));
