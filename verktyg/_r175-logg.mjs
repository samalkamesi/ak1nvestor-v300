// Läs fabrikens logg.jsonl — sista raderna
import fs from 'node:fs';
const rader = fs.readFileSync('/home/ak1a/AK1/data/vakten/agentfabrik/logg.jsonl', 'utf8').trimEnd().split('\n');
console.log(`totalt ${rader.length} rader — sista 12:`);
for (const r of rader.slice(-12)) {
  try {
    const j = JSON.parse(r);
    console.log(j.tid || j.ts || '?', '|', j.händelse || j.event || '?', '|', JSON.stringify(j).slice(0, 200));
  } catch { console.log('(oradig)', r.slice(0, 150)); }
}
