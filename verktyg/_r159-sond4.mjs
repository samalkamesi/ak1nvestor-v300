// Rond 159 sond 4: hitta kvalitetsvaktsrapporten i data/rapporter och läs dess fel.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const prod = '/home/ak1a/AK1';
const rdir = `${prod}/data/rapporter`;

const filer = readdirSync(rdir)
  .map((f) => ({ f, m: statSync(join(rdir, f)).mtimeMs, siz: statSync(join(rdir, f)).size }))
  .sort((a, b) => b.m - a.m);

console.log('== data/rapporter (senaste 15) ==');
for (const { f, siz } of filer.slice(0, 15))
  console.log(new Date(filer.find((x) => x.f === f).m).toISOString(), siz, 'B,', f);

// Läs den senaste som matchar vakt/kvalitet/motor
const kand = filer.find(({ f }) => /kvalit|vakt|motorervalid/i.test(f));
if (kand) {
  console.log('\n== LÄSER:', kand.f, '==');
  const txt = readFileSync(join(rdir, kand.f), 'utf8');
  const rader = txt.split('\n');
  if (txt.length < 3500) console.log(txt);
  else {
    console.log('(filen', txt.length, 'tecken — visar felträffar + sista 20 raderna)');
    for (const r of rader.filter((r) => /FEL|fel|GUL|RÖD|FYND/i.test(r)).slice(0, 15)) console.log(' *', r.slice(0, 240));
    console.log('--- svansen ---');
    console.log(rader.slice(-20).join('\n'));
  }
} else console.log('(ingen kandidat i data/rapporter)');
