// Rond 159 sond 2: kvalitetsrapportens GUL-fel + pipeline-filens förekomst + RAM.
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ws = '/home/ak1a/agent/ak1';
const prod = '/home/ak1a/AK1';

console.log('== VAKT-KATALOGEN (senaste filer) ==');
const vdir = `${prod}/data/vakten`;
const filer = readdirSync(vdir)
  .map((f) => ({ f, m: statSync(join(vdir, f)).mtimeMs }))
  .sort((a, b) => b.m - a.m)
  .slice(0, 12);
for (const { f } of filer) console.log(' ', f);

// Leta kvalitetsrapport-filer
const kval = filer.filter(({ f }) => /kvalit|rapport/i.test(f));
if (kval.length) {
  console.log('\n== SENASTE KVALITETSRAPPORT ==');
  const sok = join(vdir, kval[0].f);
  const innehall = readFileSync(sok, 'utf8');
  // skriv ut allt om kort, annars fel-sektionen
  if (innehall.length < 4000) console.log(innehall);
  else {
    const rader = innehall.split('\n');
    const felRad = rader.map((r, i) => ({ r, i })).filter(({ r }) => /fel|FYND|GUL|röd/i.test(r));
    console.log('(fel-relaterade rader av', rader.length, ')');
    for (const { r } of felRad.slice(0, 20)) console.log(' ', r.slice(0, 250));
  }
}

console.log('\n== PIPELINE-FILER ==');
for (const rot of [ws, prod]) {
  const traffar = readdirSync(rot).filter((f) => /PIPELINE|pipeline/i.test(f));
  console.log(rot, '=>', traffar.join(', ') || '(inga)');
}

console.log('\n== EVIGHETSKATALOG (spår-listning) ==');
const evig = join(ws, 'data/infra/evighetskatalog.md');
if (existsSync(evig)) {
  const rader = readFileSync(evig, 'utf8').split('\n').filter((r) => /^#{1,3} |^\d+\./.test(r));
  console.log(rader.slice(0, 15).join('\n'));
} else console.log('(saknas)');

console.log('\n== RAM ==');
console.log(execFileSync('free', ['-m'], { encoding: 'utf8' }).split('\n').slice(0, 2).join(' | '));
