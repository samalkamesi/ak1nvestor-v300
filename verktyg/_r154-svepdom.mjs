// Rond 154 — svepdom: loggens slut, pid-läge, rapportens röda namn
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const ROT = '/home/ak1a/agent/ak1';
const u = {};

try {
  const log = fs.readFileSync(ROT + '/data/vakten/r154-fullsvep5-fortsatt.log', 'utf8').trim().split('\n');
  u.logRader = log.length;
  u.sistaRader = log.slice(-12).map(r => r.slice(0, 130));
} catch (e) { u.logFel = String(e).slice(0, 100); }

try {
  const ps = execFileSync('ps', ['-p', '829648', '-o', 'pid,etime,args', '--no-headers'], { stdio: 'pipe' }).toString().trim();
  u.pid = ps || 'DÖD';
} catch { u.pid = 'DÖD (processen finns inte)'; }

try {
  const r = JSON.parse(fs.readFileSync(ROT + '/data/vakten/testaggregator-SENASTE.json', 'utf8'));
  u.rapport = { genererad: r.genererad, status: r.status ?? 'okänd', fortsatt: r.fortsatt ?? null };
  // röda sviters namn ur rapportens struktur (känner inte nyckeln — sök arrayer med namn+röd)
  for (const [k, v] of Object.entries(r)) {
    if (Array.isArray(v) && v.length && typeof v[0] === 'object') {
      const roda = v.filter(x => /röd|rod|RED/i.test(String(x.status ?? x.resultat ?? '')));
      if (roda.length) u['roda_' + k] = roda.map(x => (x.namn ?? x.svit ?? x.fil ?? JSON.stringify(x).slice(0, 60))).slice(0, 30);
    }
  }
} catch (e) { u.rapportFel = String(e).slice(0, 100); }

fs.writeFileSync(ROT + '/data/vakten/r154-svepdom.json', JSON.stringify(u, null, 1));
console.log(JSON.stringify(u, null, 1));
