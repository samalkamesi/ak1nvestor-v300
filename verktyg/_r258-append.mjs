// v174 dokvåg — appenda sektionerna till DRIFTSBOKEN + SYSTEMKARTAN (idempotenta)
import fs from 'node:fs';

function appenda(fil, sektionsfil, marker) {
  const nuvarande = fs.readFileSync(fil, 'utf8');
  if (nuvarande.includes(marker)) { console.log('REDAN BOKFÖRD', fil, '— skippar'); return; }
  fs.writeFileSync(fil, nuvarande.trimEnd() + '\n' + fs.readFileSync(sektionsfil, 'utf8'));
  const efter = fs.readFileSync(fil, 'utf8');
  console.log('APPENDAD', fil, ':', efter.includes(marker) ? 'JA' : 'NEJ', '| +', efter.length - nuvarande.length, 'tecken');
}

appenda('/home/ak1a/agent/ak1/data/DRIFTSBOKEN.md',
  '/home/ak1a/agent/ak1/verktyg/_r258-driftsbok-sektion.txt',
  'KRISDAGEN 2026-09-25 → 26 — OOM-DEPLOYKRIS');
appenda('/home/ak1a/agent/ak1/data/forskning/SYSTEMKARTAN.md',
  '/home/ak1a/agent/ak1/verktyg/_r258-systemkarta-sektion.txt',
  'UPPDATERING 2026-09-26 (dokvåg v174');
