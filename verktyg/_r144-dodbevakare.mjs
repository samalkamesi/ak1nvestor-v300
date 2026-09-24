#!/usr/bin/env node
// Rond 144 DoD-bevakare: när synkens bygg landat och /rapportakademin vänder 200
// → kör gränsnittsvakten riktat → skriv utfall → avsluta. (Bygger ALDRIG själv —
// RAM-grindens dom är lag; detta är bara vittnet som stänger DoD.)
import { execSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';

const ROT = '/home/ak1a/agent/ak1';
const RESULTAT = ROT + '/data/vakten/r144-snittet-dod.json';
const RAPPORT = ROT + '/data/vakten/r144-snittet-vakt.txt';

for (let i = 1; i <= 30; i++) {
  let kod = 'ERR';
  try {
    kod = execSync('curl -s -o /dev/null -w "%{http_code}" -m 10 http://localhost:3000/rapportakademin', { encoding: 'utf8', timeout: 15000 }).trim();
  } catch (e) { kod = 'ERR'; }
  const ram = (() => { try { return parseInt(execSync('grep MemAvailable /proc/meminfo', { encoding: 'utf8', timeout: 5000 }).split(/\s+/)[1], 10); } catch { return 0; } })();
  console.log(`rond ${i}: /rapportakademin = ${kod} · RAM ${Math.round(ram / 1024)} MB`);
  if (kod === '200') {
    // snittet LEVER — kör vakten riktat (loopback-vitlistat)
    console.log('SNITTET 200 — kör gränsnittsvakten riktat…');
    const v = spawnSync('node', [ROT + '/verktyg/granssnittsvakt.mjs', '--bas=http://localhost:3000', '--sidor=/rapportakademin'], { encoding: 'utf8', timeout: 420000, cwd: ROT });
    fs.writeFileSync(RAPPORT, ((v.stdout || '') + (v.stderr || '')));
    const fynd = /FYND|AVVIK|ICKE-GRÖN|följdrapport/i.test((v.stdout || ''));
    fs.writeFileSync(RESULTAT, JSON.stringify({
      ts: new Date().toISOString(), rond: 144, snittet: 200,
      vaktExit: v.status, vaktFynd: fynd, rapport: RAPPORT,
      slutsats: v.status === 0 && !fynd ? 'DoD STÄNGD: snittet lever + vakten grön' : 'DoD ÖPPEN: snittet lever, vakten har fynd — se rapport',
    }, null, 2));
    console.log('vakt exit=', v.status, fynd ? '(fynd — se ' + RAPPORT + ')' : '(grön)');
    process.exit(0);
  }
  await new Promise(r => setTimeout(r, 300000)); // 5 min
}
fs.writeFileSync(RESULTAT, JSON.stringify({ ts: new Date().toISOString(), rond: 144, snittet: 'fortfarande 404 efter 2,5 h', slutsats: 'byggfönstret öppnades inte — nästa rond återkommer' }, null, 2));
console.log('Bevakaren uttömd — snittet fortfarande ej 200');
