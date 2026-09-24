// Rond 161: emotta v159 — status + LEVERANS-rader ur utdata-loggarna.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const prod = '/home/ak1a/AK1';
const stDir = `${prod}/data/vakten/agentfabrik/status`;
const utDir = `${prod}/data/vakten/agentfabrik/utdata`;

for (const f of readdirSync(stDir).filter((f) => f.includes('v159'))) {
  const j = JSON.parse(readFileSync(join(stDir, f), 'utf8'));
  console.log('== STATUS:', f, '==');
  console.log(' status:', j.status, '| klara:', (j.klara || []).length, '/', j.totalt);
  console.log(' klara-lista:', JSON.stringify(j.klara));
  if (j.underkanda || j.underkända) console.log(' underkända:', JSON.stringify(j.underkända || j.underkanda));
}

console.log('\n== LEVERANS-RADER ==');
for (const f of readdirSync(utDir).filter((f) => f.includes('v159'))) {
  const txt = readFileSync(join(utDir, f), 'utf8');
  const leverans = txt.split('\n').filter((r) => r.includes('LEVERANS:'));
  console.log(`\n-- ${f} (${txt.length} tkn) --`);
  for (const r of leverans) console.log(' ', r.trim().slice(0, 220));
  if (!leverans.length) console.log('  (ingen LEVERANS-rad — svans:)', txt.trim().split('\n').slice(-3).join(' | ').slice(0, 300));
}
