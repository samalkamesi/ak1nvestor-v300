// _v221-hitta-llms.mjs — hittar skriptet som SKRIVER llms.txt + node-version + kartskriptets körbarhet.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

console.log('node-version: ' + process.version);

for (const dir of ['scripts', 'verktyg']) {
  for (const f of fs.readdirSync(`/home/ak1a/agent/ak1/${dir}`)) {
    if (!/\.(mjs|ts|js)$/.test(f)) continue;
    const p = `/home/ak1a/agent/ak1/${dir}/${f}`;
    try {
      const txt = fs.readFileSync(p, 'utf8');
      if (txt.includes('llms.txt') && /(writeFile|writeFileSync)/.test(txt)) {
        console.log(`SKRIVER llms: ${dir}/${f}`);
      }
    } catch {}
  }
}

console.log('\n== bygg-larvag-karta.ts huvud (första 25 raderna) ==');
console.log(fs.readFileSync('/home/ak1a/agent/ak1/scripts/bygg-larvag-karta.ts', 'utf8').split('\n').slice(0, 25).join('\n'));

console.log('\n== rakna-siffror.mjs huvud (första 15) ==');
console.log(fs.readFileSync('/home/ak1a/agent/ak1/verktyg/rakna-siffror.mjs', 'utf8').split('\n').slice(0, 15).join('\n'));
