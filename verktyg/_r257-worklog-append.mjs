// Appenda rond 257 till worklog.md (node-kanalen — skal-häng riskerar bash-append)
import fs from 'node:fs';
const wl = '/home/ak1a/agent/ak1/worklog.md';
const sektion = fs.readFileSync('/home/ak1a/agent/ak1/verktyg/_r257-worklog.txt', 'utf8');
const nuvarande = fs.readFileSync(wl, 'utf8');
if (nuvarande.includes('## ROND 257 [organ:Φ]')) {
  console.log('REDAN BOKFÖRD — skippar (idempotent).');
} else {
  fs.writeFileSync(wl, nuvarande.trimEnd() + '\n' + sektion);
  const efter = fs.readFileSync(wl, 'utf8');
  console.log('APPENDAD:', efter.includes('## ROND 257 [organ:Φ]') ? 'JA' : 'NEJ', '| nya rader:', efter.length - nuvarande.length);
}
