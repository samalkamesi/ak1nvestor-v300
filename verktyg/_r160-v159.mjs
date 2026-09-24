// Rond 160: v159-status + startsidans kodplats + siffror.json-läge.
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const prod = '/home/ak1a/AK1';
const ws = '/home/ak1a/agent/ak1';

console.log('== V159-STATUS ==');
const stDir = `${prod}/data/vakten/agentfabrik/status`;
for (const f of readdirSync(stDir).filter((f) => f.includes('v159'))) {
  const j = JSON.parse(readFileSync(join(stDir, f), 'utf8'));
  console.log(f, '=> status:', j.status, '| klara:', (j.klara || []).length, '/', j.totalt ?? '?');
  if (j.status === 'pågår') for (const u of j.uppgiftsinfo || []) console.log('   -', u.id, u.status || '(igång)');
}

console.log('\n== SYNK-SVANS (4) ==');
console.log(readFileSync(`${prod}/data/vakten/prod-synk.log`, 'utf8').trim().split('\n').slice(-4).join('\n'));

console.log('\n== STARTSIDANS PLATS ==');
for (const kand of ['src/app/(huvud)/page.tsx', 'src/app/page.tsx']) {
  if (existsSync(join(ws, kand))) console.log('FINNS:', kand);
}

console.log('\n== SIFFROR.JSON (guldkällan) ==');
const siffror = join(ws, 'data/siffror.json');
if (existsSync(siffror)) {
  const j = JSON.parse(readFileSync(siffror, 'utf8'));
  for (const [k, v] of Object.entries(j).slice(0, 25)) console.log(' ', k, '=', JSON.stringify(v).slice(0, 90));
} else console.log('(saknas)');
