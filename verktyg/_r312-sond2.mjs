// r312-sond2: fabriken i AK1-trädet (prod) — pågående manifest?
import fs from 'node:fs';

const bas = '/home/ak1a/AK1/data/vakten/agentfabrik';
for (const sub of ['ko', 'status']) {
  const d = `${bas}/${sub}`;
  if (!fs.existsSync(d)) { console.log(sub, '(saknas)'); continue; }
  const f = fs.readdirSync(d).sort();
  console.log(sub + ':', f.length ? '' : 'TOM');
  for (const n of f.slice(-8)) console.log('  ', n);
}
const log = `${bas}/fabrik.log`;
if (fs.existsSync(log)) {
  const lines = fs.readFileSync(log, 'utf8').trim().split('\n');
  console.log('fabrik.log: senaste 12 av', lines.length);
  for (const l of lines.slice(-12)) console.log('  ', l.slice(0, 160));
} else {
  console.log('fabrik.log saknas vid', log);
}
