// Rond 153 — riktad gränssnittsvakt på /rapportakademin (EFTER-deploy-bevis)
// Körs i prod-trädet (puppeteer-core + env bor där); node-kanalen är skal-säker.
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';

const PROD = '/home/ak1a/AK1';
const VAKT = path.join(PROD, 'verktyg', 'granssnittsvakt.mjs');
const innan = new Set(fs.readdirSync(path.join(PROD, 'data', 'vakten')).filter(f => /^granssnitt-.*\.json$/.test(f)));

// Journalfrågan samtidigt: är rapportsidan journalförd?
let journal = 'saknas';
try {
  const j = JSON.parse(fs.readFileSync(path.join(PROD, 'data', 'vakten', 'vakt-sidjournal.json'), 'utf8'));
  journal = '/rapportakademin' in j ? JSON.stringify(j['/rapportakademin']).slice(0, 120) : `nej (${Object.keys(j).length} poster)`;
} catch (e) { journal = 'lasfel ' + String(e).slice(0, 60); }

console.log('journal:', journal);
console.log('kör riktad vakt (tak 240 s)…');

await new Promise((resolve) => {
  execFile('node', [VAKT, '--sidor=/rapportakademin', '--bas=http://localhost:3000'],
    { cwd: PROD, timeout: 240000, maxBuffer: 8 * 1024 * 1024 },
    (fel, ut, err) => {
      console.log('[stdout]', String(ut).slice(0, 3000));
      if (err) console.log('[stderr]', String(err).slice(0, 1500));
      if (fel) console.log('[fel]', String(fel).slice(0, 300));
      resolve();
    });
});

// Fånga den nya rapportfilen
const efter = fs.readdirSync(path.join(PROD, 'data', 'vakten')).filter(f => /^granssnitt-.*\.json$/.test(f) && !innan.has(f));
const u = { journal, nyaRapporter: efter };
for (const f of efter) {
  const r = JSON.parse(fs.readFileSync(path.join(PROD, 'data', 'vakten', f), 'utf8'));
  // struktur-okänt: extrahera status + fyld-bärande nycklar ytligt
  const knappar = {};
  for (const [k, v] of Object.entries(r)) {
    if (Array.isArray(v)) knappar[k] = v.length;
    else if (typeof v === 'number' || typeof v === 'string') knappar[k] = v;
  }
  u[f] = knappar;
}
fs.writeFileSync('/home/ak1a/agent/ak1/data/vakten/r153-riktad-vakt.json', JSON.stringify(u, null, 1));
console.log(JSON.stringify(u, null, 1));
