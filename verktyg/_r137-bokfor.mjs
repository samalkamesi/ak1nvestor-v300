#!/usr/bin/env node
// Rond 137-bokföring: beslutsminnesrad → båda träden (arbetsyta + prod-kopia)
import fs from 'node:fs';
const rad = JSON.stringify({
  ts: new Date().toISOString(),
  rond: 137,
  beslut: '10-bolagsprovets källregister levererat: 10 officiella IR-källor kartlagda (2025-rapporter feb-apr 2026; AZ dec-2025 + Sandvik mars flaggade för verifiering); läxa bokförd VOLCAR-B=Volvo Cars; nästa = direkta PDF-url-extraktion + intag via karantänpipelinen; bevakar-bugg kurerad (free -m saknar MemAvailable — /proc/meminfo är källan), DoD-svep /rapportakademin löper i bakgrund',
  landat: '64b69ef3'
}) + '\n';
for (const trad of ['/home/ak1a/agent/ak1/data/vakten/beslutsminne.jsonl', '/home/ak1a/AK1/data/vakten/beslutsminne.jsonl']) {
  try { fs.appendFileSync(trad, rad); console.log('bokförd:', trad); }
  catch (e) { console.log('FEL', trad, e.message); }
}
