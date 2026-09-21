// Jämför bolagsunivers.json i arbetsyta vs prod + tidsstämplar
import { readFileSync, statSync } from 'node:fs';

const sex = ['ai-pa', 'barc-l', 'cap-pa', 'dsy-pa', 'lloy-l', 'nwg-l'];
for (const bas of ['/home/ak1a/agent/ak1', '/home/ak1a/AK1']) {
  const fil = bas + '/data/portfolj-system/bolagsunivers.json';
  const r = JSON.parse(readFileSync(fil, 'utf8'));
  const slugs = r.map((x) => (x.ticker || '').toLowerCase().replace(/\./g, '-'));
  const m = statSync(fil);
  console.log(`${bas}: ${r.length} rader, mtime ${new Date(m.mtime).toISOString()}`);
  console.log(`  av de sex: ${sex.filter((s) => slugs.includes(s)).join(', ') || 'INGA'}`);
  const dups = slugs.filter((s, i) => slugs.indexOf(s) !== i);
  console.log(`  duplikat-slug: ${dups.join(', ') || 'inga'}`);
}
