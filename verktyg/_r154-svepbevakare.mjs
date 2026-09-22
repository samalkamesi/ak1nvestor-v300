// Rond 154 — fullsveps-bevakare: pollar tills rapport skriven (genererad > launch) ELLER tak
import fs from 'node:fs';
const ROT = '/home/ak1a/agent/ak1';
const LOGG = ROT + '/data/vakten/r154-fullsvep5-fortsatt.log';
const RAPPORT = ROT + '/data/vakten/testaggregator-SENASTE.json';
const TAK_MS = 90 * 60 * 1000;
const start = Date.now();
const utfall = { startad: new Date().toISOString(), pid: 829648, poler: [] };

while (Date.now() - start < TAK_MS) {
  await new Promise(r => setTimeout(r, 120000));
  const pol = { ts: new Date().toISOString() };
  try {
    const log = fs.readFileSync(LOGG, 'utf8').trim().split('\n');
    pol.sistaLoggrad = log[log.length - 1]?.slice(0, 110);
    pol.logRader = log.length;
    const rapp = JSON.parse(fs.readFileSync(RAPPORT, 'utf8'));
    if ((rapp.genererad ?? '') > '2026-09-21T23:5') {
      pol.rapport = { genererad: rapp.genererad, grona: rapp.grona, roda: rapp.roda, omatta: rapp.omatta };
      utfall.status = 'RAPPORT SKRIVEN';
      utfall.rapport = pol.rapport;
      break;
    }
  } catch (e) { pol.fel = String(e).slice(0, 80); }
  utfall.poler.push(pol);
  if (utfall.poler.length > 40) utfall.poler.shift();
  if (pol.sistaLoggrad?.includes('RESULTAT_JSON') || pol.sistaLoggrad?.includes('KLART')) { utfall.status = 'SLUTRAD SEDD'; break; }
}
if (!utfall.status) utfall.status = 'TAK UPPNÅTT — vidare i nästa rond';
fs.writeFileSync(ROT + '/data/vakten/r154-fullsvep-bevakare.json', JSON.stringify(utfall, null, 1));
console.log(utfall.status, JSON.stringify(utfall.rapport ?? ''));
