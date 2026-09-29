#!/usr/bin/env node
// _s5u3o31-sanera.mjs — tar bort trailing commas i JSON-filer (",\n}" → "\n}") och verifierar parse.
import { readFileSync, writeFileSync } from 'node:fs';
const filer = process.argv.slice(2);
for (const f of filer) {
  let txt = readFileSync(f, 'utf8');
  const före = (txt.match(/,(\s*[}\]])/g) || []).length;
  txt = txt.replace(/,(\s*[}\]])/g, '$1');
  writeFileSync(f, txt);
  try {
    const j = JSON.parse(readFileSync(f, 'utf8'));
    console.log(`${f}: RÄTTAD (${före} trailing commas) — JSON OK — slug ${j.slug}, ${j.chapters?.length} kapitel, kap-blocktyper: ${j.chapters?.map(k => k.blocks.map(b => b.type).join('+')).join(' | ')}`);
  } catch (e) {
    console.log(`${f}: FEL kvar: ${e.message}`);
    process.exitCode = 1;
  }
}
