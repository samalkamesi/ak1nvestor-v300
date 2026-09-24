// Rond 159 sond 3: hitta kvalitetsrapporten (synk-loggens kontext + filsökning).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const prod = '/home/ak1a/AK1';

console.log('== PROD-SYNK.LOG (sista 40 raderna) ==');
const logg = readFileSync(`${prod}/data/vakten/prod-synk.log`, 'utf8').trim().split('\n');
console.log(logg.slice(-40).join('\n'));

console.log('\n== FILSÖKNING: *kvalit* i prod (djup 4) ==');
function leta(dir, djup, traff) {
  if (djup > 4) return;
  let entries;
  try { entries = readdirSync(dir); } catch { return; }
  for (const f of entries) {
    if (f === 'node_modules' || f === '.next' || f === '.git') continue;
    const p = join(dir, f);
    let st; try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) leta(p, djup + 1, traff);
    else if (/kvalit|kvalitet/i.test(f)) traff.push({ p, m: st.mtime.toISOString(), siz: st.size });
  }
}
const traff = [];
leta(prod, 0, traff);
for (const t of traff.sort((a, b) => b.m.localeCompare(a.m)).slice(0, 10)) console.log(t.m, t.siz, 'B,', t.p);
