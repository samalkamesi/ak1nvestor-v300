// r257 bokföring: pyttecommit (missat skript) + beslutsminne + prod-kontroll
import fs from 'node:fs';
import { execSync } from 'node:child_process';
const cwd = '/home/ak1a/agent/ak1';

function sh(steg, cmd) {
  try { console.log('OK', steg, '|', execSync(cmd, { encoding: 'utf8', timeout: 300000, cwd }).trim().slice(0, 200)); }
  catch (e) { console.log('FEL', steg, '|', String(e.message).slice(0, 250)); }
}

// 1. Pyttecommit av det egna missade skriptet
sh('add-commit-mjs', 'git add verktyg/_r257-commit.mjs');
sh('commit2', 'git commit -m "studio: [organ:Φ] r257 tillägg — commit-skriptet självt (utenför sin egen fillista, trädhygien)"');
sh('push2', 'git push prod develop');
sh('hash2', 'git log -1 --format=%h');

// 2. Beslutsminne (punkt 6)
const rad = JSON.stringify({
  ts: new Date().toISOString(),
  rond: 111,
  beslut: 'r257: Indien-deployen bevisad GRÖN (311 slugs; apollohosp/hal + 21 kris-slugar 200; vakten 0/180) ⇒ 404-krisens kunduppdrag KLART (uppdrag-klart.json); v171 B28 investmentbolag-en levererad via subagent med KVD-grönt ×2 + oberoende omkörning ⇒ -en-omgången komplett 30/30; PIPELINE ikapp verkligheten + v174 dokvåg bokad (tre vågor § 8)',
  landat: 'd92de005'
});
fs.appendFileSync(cwd + '/data/vakten/beslutsminne.jsonl', rad + '\n');
console.log('BESLUTSMINNE appendar:', rad.slice(0, 80) + '…');

// 3. Prod-kontroll (data-only, inget bygge — bara hälsa)
for (const url of ['https://lab.ak1nvestor.com/', 'https://lab.ak1nvestor.com/dataset']) {
  try { const r = await fetch(url); console.log('PROD', url, r.status); } catch (e) { console.log('PROD', url, 'FEL', String(e.message).slice(0, 60)); }
}

// 4. Trädets slutläge
sh('status-slut', 'git status --porcelain');
