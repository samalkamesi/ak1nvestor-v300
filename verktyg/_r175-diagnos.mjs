// Rond 175: diagnos — varför föds inga v166-barn?
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const prod = '/home/ak1a/AK1';
const p = (...a) => console.log(...a);

p('== statusfil fullständigt ==');
p(fs.readFileSync(`${prod}/data/vakten/agentfabrik/status/v166-fas3-djupintegrering.json`, 'utf8').slice(0, 1200));

p('\n== agentfabrik-katalogen ==');
for (const d of fs.readdirSync(`${prod}/data/vakten/agentfabrik/`)) {
  const stat = fs.statSync(`${prod}/data/vakten/agentfabrik/${d}`);
  p(d, stat.isDirectory() ? '(kat)' : `${stat.size} B`);
}

p('\n== fabrikens process ==');
const ps = execFileSync('ps', ['aux'], { timeout: 15000 }).toString();
for (const r of ps.split('\n')) if (/agentfabrik\.mjs/.test(r) && !/grep/.test(r)) p(r.slice(0, 120));

p('\n== fabriksloggar (senast ändrade i agentfabrik/) ==');
const alla = [];
const grona = (dir) => {
  for (const f of fs.readdirSync(dir)) {
    const s = `${dir}/${f}`;
    const st = fs.statSync(s);
    if (st.isDirectory() && !/status|utdata|ko/.test(f)) grona(s);
    else if (/\.(log|txt|jsonl)$/i.test(f)) alla.push([st.mtime.toISOString(), s]);
  }
};
grona(`${prod}/data/vakten/agentfabrik`);
alla.sort().reverse();
for (const [t, s] of alla.slice(0, 6)) p(t, s.replace(prod, ''));
