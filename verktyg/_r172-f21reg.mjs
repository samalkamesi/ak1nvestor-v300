// Fabrikens f21-klarrad (node-kanalen)
import { readFileSync } from 'node:fs';
const s = JSON.parse(readFileSync('/home/ak1a/AK1/data/vakten/agentfabrik/status/v164-fas3-djup.json', 'utf8'));
for (const r of (s.klara || [])) if (r.id === 'f21') console.log(JSON.stringify(r));
console.log('status:', s.status, '| klara:', (s.klara || []).length, '/', s.totalt);
