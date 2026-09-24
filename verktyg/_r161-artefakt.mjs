// Rond 161: rotgranska 06:14-artefaktfelet (12:02-klassen) + hitta byggloggen.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const prod = '/home/ak1a/AK1';

console.log('== SYNK-LOGG runt 06:13-06:15 (komplett kontext) ==');
const logg = readFileSync(`${prod}/data/vakten/prod-synk.log`, 'utf8').split('\n');
const traff = logg.filter((r) => r.includes('2026-09-24T06:1'));
for (const r of traff) console.log(' ', r.slice(0, 400));

console.log('\n== LOGGFILER i data/vakten (bygg-logg?) ==');
const vdir = `${prod}/data/vakten`;
const filer = readdirSync(vdir)
  .filter((f) => f.endsWith('.log') || f.includes('bygg'))
  .map((f) => ({ f, m: statSync(join(vdir, f)).mtimeMs }))
  .sort((a, b) => b.m - a.m)
  .slice(0, 8);
for (const { f, m } of filer) console.log(' ', new Date(m).toISOString(), f);

// Leta detaljer i senaste bygg-logg om den finns
const bygglog = filer.find(({ f }) => /bygg|deploy/i.test(f));
if (bygglog) {
  console.log('\n==', bygglog.f, '(sista 30 raderna) ==');
  console.log(readFileSync(join(vdir, bygglog.f), 'utf8').trim().split('\n').slice(-30).join('\n'));
}

console.log('\n== 12:02-klassen i synkens källkod (vad letar den efter?) ==');
import { execFileSync } from 'node:child_process';
const grep = execFileSync('grep', ['-rn', '12:02', `${prod}/verktyg/prod-synk.mjs`, `${prod}/verktyg/`], { encoding: 'utf8', timeout: 30000 }).split('\n').slice(0, 12);
for (const r of grep) console.log(' ', r.slice(0, 220));
