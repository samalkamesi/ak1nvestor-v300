// v206 (r312): push till prod med fönster-sond — r311-mönstret
import { execSync } from 'node:child_process';
import fs from 'node:fs';

function kort(cmd) {
  try { return execSync(cmd, { encoding: 'utf8', timeout: 25000 }).trim(); }
  catch (e) { return `FEL(${e.status ?? '?'}): ${(e.stderr || e.message || '').slice(0, 200)}`; }
}

const smuts = kort('git -C /home/ak1a/AK1 status --porcelain');
console.log('AK1 smutsiga:\n' + (smuts || '(ren)'));
console.log('AK1 HEAD:', kort('git -C /home/ak1a/AK1 log --oneline -1'));

console.log('\nPushar develop -> prod ...');
const push = kort('git push prod develop 2>&1');
console.log(push);
const framgang = /Updating|Fast-forward|updated|up to date/i.test(push) && !/FEL|rejected|refused/i.test(push);
console.log('\nPUSH-RESULTAT:', framgang ? 'GRÖN' : 'AVVISAD/KONTROLLERA');

// prod-läge efter push
if (framgang) {
  console.log('Prod HEAD nu:', kort('git -C /home/ak1a/AK1 log --oneline -1'));
  fs.writeFileSync('data/vakten/r312-push-kvitto.json', JSON.stringify({
    ts: new Date().toISOString(), våg: 'v206', commit: 'beed9f7d', push: 'GRÖN',
  }, null, 1));
}
