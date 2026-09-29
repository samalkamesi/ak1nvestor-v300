// r337 moln-sond: läsverifiera 09-29:s moln-JSON-blad (blad 2 av de tre)
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const BK = '/home/ak1a/AK1/data/backups';
const nu = Date.now();
const dom = { gronna: [], felen: [], alderMaxH: 0 };

for (const fil of fs.readdirSync(BK).sort()) {
  if (!/2026-09-29/.test(fil)) continue;
  const p = path.join(BK, fil);
  const st = fs.statSync(p);
  const timmar = (nu - st.mtime.getTime()) / 3600000;
  dom.alderMaxH = Math.max(dom.alderMaxH, timmar);
  if (fil.endsWith('.json')) {
    try {
      const j = JSON.parse(fs.readFileSync(p, 'utf8'));
      const poster = Array.isArray(j) ? j.length : Object.keys(j).length;
      dom.gronna.push(`${fil}: OK ${poster} poster ${(st.size / 1024).toFixed(1)} kB`);
    } catch (e) { dom.felen.push(`${fil}: OGILTIG JSON — ${String(e.message).slice(0, 80)}`); }
  } else if (fil.endsWith('.json.gz')) {
    try {
      const tmp = '/tmp/r337-moln-prov.json';
      execSync(`gzip -cd ${p} > ${tmp}`, { timeout: 60000, shell: '/bin/bash' });
      const txt = fs.readFileSync(tmp, 'utf8');
      const j = JSON.parse(txt);
      const poster = Array.isArray(j) ? j.length : Object.keys(j).length;
      dom.gronna.push(`${fil}: OK ${poster} poster, okomprimerat ${(txt.length / 1048576).toFixed(1)} MB`);
      fs.unlinkSync(tmp);
    } catch (e) {
      dom.felen.push(`${fil}: gzip/JSON-FEL — ${String(e.message).slice(0, 80)}`);
    }
  }
}

console.log(`moln-JSON-bladet 09-29: ${dom.gronna.length} gröna, ${dom.felen.length} fel, äldsta ${dom.alderMaxH.toFixed(1)} h`);
for (const g of dom.gronna) console.log('  ✓ ' + g);
for (const f of dom.felen) console.log('  ✗ ' + f);
console.log(dom.felen.length === 0 && dom.alderMaxH < 24 ? 'DOM: GRÖN' : 'DOM: EJ GRÖN');
