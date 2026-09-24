// rond 157: commit sondskripten (kvick, kort meddelande)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const R = '/home/ak1a/agent/ak1';
const msg = R + '/data/vakten/r157-sondcommitmsg.txt';
fs.writeFileSync(msg, 'studio: rond 157 [organ:Φ] — rondens sonder: _r157-stada (trädgranskning) + _r157-commit/_r157-merge/_r157-konfliktlos/_r157-pushretry/_r157-vanta (push-kedjan mot rörligt prod) + _r157-sond/sond2 (merge-läge + last) + _r157-fabrik (manifeststatus) — alla node-kanalen, skal-kvoten följd');
execFileSync('git', ['-C', R, 'add', 'verktyg/'], { stdio: 'pipe' });
const fore = execFileSync('git', ['-C', R, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
try {
  execFileSync('git', ['-C', R, 'commit', '-F', msg], { encoding: 'utf8', timeout: 480000 });
  const efter = execFileSync('git', ['-C', R, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  console.log(fore === efter ? 'INGEN ÄNDRING' : 'COMMIT ' + efter.slice(0, 8));
} catch (e) {
  console.log('commit-fel: ' + String(e.message).slice(0, 200));
}
