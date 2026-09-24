// Rond 176: commit verktygsrester + sondera v167-underlaget (indikatorer × V01-V20)
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const ws = '/home/ak1a/agent/ak1';
const git = (args, t = 300000) => execFileSync('git', args, { cwd: ws, timeout: t }).toString().trim();
const p = (...a) => console.log(...a);

fs.writeFileSync('/tmp/r176c.txt', 'studio: rond 176 [organ:\u03a6] \u2014 bevakarst\u00e4dning (dubbla instanser d\u00f6dade, EN ren fixad pid 3311281, 6/24 granskade 66/0) + bakgrundsv\u00e4ntare (notifierar vid 24/24)');
console.log(git(['add', 'verktyg/_r176-stada.mjs', 'verktyg/_r176-vanta.mjs', 'verktyg/_r176-bokfor.mjs']));
console.log(git(['commit', '-F', '/tmp/r176c.txt']).split('\n')[0]);

// v167-sond: indikatorunderlagen + variabelkursernas slug:ar
p('\n== indikatorunderlag ==');
const fk = fs.readdirSync(`${ws}/data/forskning`).filter(f => /^indikatorer-/.test(f));
p(fk.join(', '));
p('\n== variabelkurser i bokmaster (v-slug) ==');
const vs = fs.readdirSync(`${ws}/data/bokmaster`).filter(f => /^v\d+-/.test(f)).sort();
p(vs.length + ' st: ' + vs.slice(0, 8).join(', ') + (vs.length > 8 ? ' …' : ''));
